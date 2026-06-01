import { useState, useRef, useEffect } from 'react';
// store.js - Durable + realtime persistence layer.
//
// ⚠️ BEFORE SUPABASE / MULTI-USER PRODUCTION: read BACKEND_TODO.md.
//    Store.save() currently writes the WHOLE collection array (last-write-wins
//    across users). It MUST become row-level upserts when Supabase is wired.
//    Also remove the demo manager auto-promote + enforce RLS. Details + the
//    full affected-function list are in BACKEND_TODO.md.
//
// Single source of truth for shared app state. Every mutable entity is:
//   1. Persisted to localStorage (survives reload)
//   2. Broadcast to other open tabs/windows via BroadcastChannel the instant
//      it changes - a faithful stand-in for multi-user realtime. The event
//      shape ({ table, value }) is exactly what a Supabase `postgres_changes`
//      subscription will deliver, so swapping the transport is a one-file change
//      (see db.js for the Supabase mapping).
//
// Usage from React (see usePersistentState below):
//   const [stakeholders, setStakeholders] = usePersistentState("stakeholders", seed);
//
// Every setX call writes through to localStorage AND notifies every other tab,
// which updates their React state live. When Supabase is wired, Store.save()
// becomes an upsert + the channel callback fires from the server instead of
// BroadcastChannel - the React layer doesn't change at all.

export const Store = (() => {  const PREFIX = "hpsm:";        // localStorage namespace
  const SCHEMA_VERSION = "v9";   // bump to invalidate persisted data on breaking changes
  const verKey = PREFIX + "__schema";

  // One-time migration / reset if the schema version changed.
  try {
    if (localStorage.getItem(verKey) !== SCHEMA_VERSION) {
      // Wipe only our namespace, then stamp the new version.
      Object.keys(localStorage)
        .filter(k => k.startsWith(PREFIX))
        .forEach(k => localStorage.removeItem(k));
      localStorage.setItem(verKey, SCHEMA_VERSION);
    }
  } catch {}

  const subs = {};               // table -> Set(callback)
  const channel = ("BroadcastChannel" in window) ? new BroadcastChannel("hpsm-sync") : null;

  if (channel) {
    channel.onmessage = (e) => {
      const { table, value } = e.data || {};
      if (!table) return;
      (subs[table] || []).forEach(cb => cb(value));
    };
  }

  // Cross-tab fallback for browsers without BroadcastChannel: the storage
  // event fires in *other* tabs when localStorage changes.
  window.addEventListener("storage", (e) => {
    if (!e.key || !e.key.startsWith(PREFIX) || e.key === verKey) return;
    const table = e.key.slice(PREFIX.length);
    if (channel) return; // BroadcastChannel already handled it
    try {
      const value = e.newValue == null ? null : JSON.parse(e.newValue);
      (subs[table] || []).forEach(cb => cb(value));
    } catch {}
  });

  return {
    // Read persisted value, or fall back to seed (and persist the seed so the
    // table exists for other tabs immediately).
    load(table, seed) {
      try {
        const raw = localStorage.getItem(PREFIX + table);
        if (raw != null) return JSON.parse(raw);
      } catch {}
      try { localStorage.setItem(PREFIX + table, JSON.stringify(seed)); } catch {}
      return seed;
    },
    // Write + broadcast. `silent` skips the broadcast (used when applying a
    // change that arrived FROM another tab, to avoid an echo loop).
    save(table, value, silent) {
      try { localStorage.setItem(PREFIX + table, JSON.stringify(value)); } catch {}
      if (channel && !silent) channel.postMessage({ table, value });
    },
    subscribe(table, cb) {
      (subs[table] = subs[table] || new Set()).add(cb);
      return () => { if (subs[table]) subs[table].delete(cb); };
    },
    // Clear everything (used by a hard "reset demo data" action if needed).
    reset() {
      try {
        Object.keys(localStorage)
          .filter(k => k.startsWith(PREFIX))
          .forEach(k => localStorage.removeItem(k));
        localStorage.setItem(verKey, SCHEMA_VERSION);
      } catch {}
    }
  };
})();

// Collision-resistant id generator (UUID where available). Use everywhere a
// new record id is minted so concurrent multi-user creates can't collide.
export function uid(prefix) {  const u = (window.crypto && window.crypto.randomUUID)
    ? window.crypto.randomUUID()
    : (Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
  return prefix ? prefix + "-" + u : u;
};

// Full ISO 8601 timestamp (second precision) for created/updated fields.
// Maps to Supabase `timestamptz`. Date-only fields (e.g. lastContact) keep
// their own YYYY-MM-DD format.
export function nowStamp () { return new Date().toISOString(); };

// Platform-aware command-palette shortcut label (Mac vs PC).
export const cmdKeyLabel = (typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)) ? "⌘K" : "Ctrl K";

// React hook: state that is persisted AND kept in sync across tabs/users.
// Drop-in replacement for useState(seed).
export function usePersistentState(table, seed) {
  const [value, setValue] = useState(() => Store.load(table, seed));
  // When we apply an incoming remote change, skip the next persist-effect so
  // we don't rebroadcast it back out.
  const skipPersist = useRef(false);

  useEffect(() => {
    if (skipPersist.current) { skipPersist.current = false; return; }
    Store.save(table, value);
  }, [value]);

  useEffect(() => {
    return Store.subscribe(table, (incoming) => {
      skipPersist.current = true;
      setValue(incoming);
    });
  }, [table]);

  return [value, setValue];
};
