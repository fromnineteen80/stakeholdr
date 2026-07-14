/* store.js — the ONE transport boundary, built from the sealed box
 * "Persistence & realtime — the ONE transport boundary" in src/guide.jsx.
 *
 * THE PRINCIPLE: the UI talks to EXACTLY ONE interface —
 * usePersistentState(table, seed), a drop-in for useState. It never touches
 * the transport. STATE A (this file's default): localStorage + a
 * BroadcastChannel("hpsm-sync") carrying { table, value }. STATE B (later):
 * the SAME Store routed to Supabase (upsert / postgres_changes) behind one
 * config flag — the { table, value } event shape is exactly what a
 * postgres_changes subscription delivers, so no UI code ever changes.
 * Do NOT introduce bespoke per-feature persistence.
 *
 * TRAP #1 (sealed, honored at backend build): save() persisting whole
 * collection arrays is last-write-wins across users — every mutation must
 * become a row-scoped upsert/delete when Supabase lands.
 */
import { useEffect, useRef, useState } from 'react';
import { blankSeedFor } from './seed.js';

const PREFIX = 'hpsm:';

/* sweepKeys(allKeys) — the sealed reset predicate: exactly OUR "hpsm:"
 * namespace, nothing else (exported for the node suite; reset() and the
 * schema migration both sweep through THIS one predicate).                   */
export function sweepKeys(allKeys) {
  return (allKeys || []).filter((k) => k.startsWith(PREFIX));
}

/* BLANK-START MARKER (Phase 19, sealed "blank-org vs demo-data seed choice"):
 * when this key is set, Store.load resolves every seed through blankSeedFor
 * (seed.js) so the app boots EMPTY. Inside the namespace ON PURPOSE — the
 * sealed reset sweep clears it, so "Reset to demo data" also exits blank
 * mode. The storage-event fallback ignores it naturally (no subscribers).   */
export const BLANK_KEY = PREFIX + '__blank';

function blankMode() {
  if (!hasLS) return false;
  try { return localStorage.getItem(BLANK_KEY) === '1'; } catch { return false; }
}

/* DELIBERATE DEPARTURE (documented per the build order): the sealed oracle
 * shipped SCHEMA_VERSION "v9". The rebuild stamps "v10-rebuild" so the rebuilt
 * app NEVER inherits the old demo's localStorage — any browser that ran the
 * old app gets its "hpsm:" namespace wiped and re-seeded on first load.      */
const SCHEMA_VERSION = 'v10-rebuild';

const verKey = PREFIX + '__schema'; // "hpsm:__schema"

const hasLS = typeof localStorage !== 'undefined';

/* uid(prefix) — id minting (sealed exact). window.crypto.randomUUID when
 * available; otherwise the sealed fallback for browsers without it. Every new
 * record id is minted through this (sh-, ws-, tm-, c-, m-, …) so concurrent
 * multi-user creates are idempotent/retry-safe.                              */
export function uid(prefix) {
  const u = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  return prefix ? prefix + '-' + u : u;
}

/* nowStamp() — full ISO timestamp. Date-only fields (lastContact) keep
 * YYYY-MM-DD; everything else stamps through this.                           */
export function nowStamp() {
  return new Date().toISOString();
}

/* cmdKeyLabel — platform-aware command shortcut label ("⌘K" on Mac/iOS,
 * "Ctrl K" elsewhere); the ONE value every search-bar kbd chip reads.        */
export const cmdKeyLabel =
  (typeof navigator !== 'undefined' &&
   /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent))
    ? '⌘K'
    : 'Ctrl K';

/* Per-table subscriber sets. */
const subs = {};

/* MIGRATION at Store init (sealed): if the stamped schema version differs,
 * remove every key in OUR namespace only, then stamp the new version.        */
if (hasLS) {
  try {
    if (localStorage.getItem(verKey) !== SCHEMA_VERSION) {
      for (const key of sweepKeys(Object.keys(localStorage))) {
        localStorage.removeItem(key);
      }
      localStorage.setItem(verKey, SCHEMA_VERSION);
    }
  } catch { /* storage unavailable — run memory-only */ }
}

/* One BroadcastChannel("hpsm-sync") when available; onmessage destructures
 * { table, value } and fires every subscriber for that table (guard: return
 * if !table). This event shape is EXACTLY the Supabase postgres_changes
 * delivery — chosen so the transport swap needs no UI change.                */
const channel = (typeof BroadcastChannel !== 'undefined')
  ? new BroadcastChannel('hpsm-sync')
  : null;
if (channel) {
  channel.onmessage = (e) => {
    const { table, value } = e.data || {};
    if (!table) return;
    fire(table, value);
  };
}

/* STORAGE-EVENT FALLBACK (cross-tab sync for browsers WITHOUT
 * BroadcastChannel) — installed at Store init with the sealed EXACT guards
 * (any failing guard → ignore the event).                                    */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (!e.key) return;                        // no key → ignore
    if (!e.key.startsWith(PREFIX)) return;     // outside the "hpsm:" namespace → ignore
    if (e.key === verKey) return;              // the schema version key → ignore
    const table = e.key.slice(PREFIX.length);
    if (channel) return;                       // BroadcastChannel already handled it (no double-apply)
    try {
      const value = e.newValue == null ? null : JSON.parse(e.newValue);
      fire(table, value);
    } catch { /* unparseable foreign write — ignore */ }
  });
}

function fire(table, value) {
  const set = subs[table];
  if (!set) return;
  for (const cb of set) cb(value);
}

/* The Store singleton — an ES-MODULE EXPORT (sealed: NOT attached to window;
 * consumers import it).                                                      */
export const Store = {
  /* load(table, seed): read persisted JSON or fall back to seed (persisting
   * the seed so the table exists for other tabs). BLANK MODE (Phase 19): the
   * fallback resolves through blankSeedFor — a blank-started org boots empty
   * (appConfig + the solo manager per the seed.js ledger) instead of the
   * SEED_* fixtures; persisted values are untouched either way.              */
  load(table, seed) {
    const eff = blankMode() ? blankSeedFor(table, seed) : seed;
    if (!hasLS) return eff;
    try {
      const raw = localStorage.getItem(PREFIX + table);
      if (raw != null) return JSON.parse(raw);
    } catch { /* fall through to seed */ }
    try {
      localStorage.setItem(PREFIX + table, JSON.stringify(eff));
    } catch { /* ignore */ }
    return eff;
  },

  /* save(table, value, silent): write JSON + broadcast { table, value };
   * silent skips the broadcast (used when applying a change that arrived FROM
   * another tab, to avoid an echo loop).
   * SAME-TAB FAN-OUT (Phase 6): a BroadcastChannel never delivers to its own
   * posting context, so two usePersistentState('x') instances in ONE tab
   * (the shell's live workspace/badge state + the mounted page) would drift.
   * save() therefore ALSO fires local subscribers; the initiating hook
   * ignores its own echo by reference identity (see usePersistentState).    */
  save(table, value, silent) {
    if (hasLS) {
      try {
        localStorage.setItem(PREFIX + table, JSON.stringify(value));
      } catch { /* ignore */ }
    }
    if (!silent) {
      if (channel) channel.postMessage({ table, value });
      fire(table, value);
    }
  },

  /* subscribe(table, cb): per-table listener; returns an unsubscribe.        */
  subscribe(table, cb) {
    (subs[table] ||= new Set()).add(cb);
    return () => { subs[table]?.delete(cb); };
  },

  /* reset(): clear the namespace (hard "reset demo data") + re-stamp — the
   * sealed Store.reset API (~3882: key sweep over the "hpsm:" prefix, then
   * the schema stamp), WIRED as of Phase 19 (the sealed capture had zero
   * call sites; the Settings Demo-Data affordance is the forward-design
   * action). Sweeping the namespace also clears the blank marker.           */
  reset() {
    if (!hasLS) return;
    try {
      for (const key of sweepKeys(Object.keys(localStorage))) {
        localStorage.removeItem(key);
      }
      localStorage.setItem(verKey, SCHEMA_VERSION);
    } catch { /* ignore */ }
  },

  /* startBlank(): the sealed seed choice's OTHER arm — reset, then set the
   * blank marker so the next boot resolves every seed through blankSeedFor. */
  startBlank() {
    this.reset();
    if (!hasLS) return;
    try { localStorage.setItem(BLANK_KEY, '1'); } catch { /* ignore */ }
  },
};

/* usePersistentState(table, seed) — the drop-in for useState every synced
 * entity flows through (sealed mechanics): state seeded from Store.load; an
 * effect persists on change (Store.save); a subscribe effect applies incoming
 * changes; the skipPersist ref prevents re-broadcasting a change that arrived
 * from elsewhere (the subscribe callback sets skipPersist.current = true
 * before setValue; the persist effect sees it, clears it, and returns without
 * saving).                                                                   */
export function usePersistentState(table, seed) {
  const [value, setValue] = useState(() => Store.load(table, seed));
  const skipPersist = useRef(false);
  const mounted = useRef(false);
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => {
    /* MOUNT-RUN GUARD (Phase 9): never re-save the value Store.load just
     * returned. Store.load already persists the seed on a miss, and a mount
     * that lands in the SAME COMMIT as another instance's write (the shell
     * appends a workspace → view switches → the new page mounts) would
     * otherwise fan out its STALE load first — child effects run before
     * parent effects — silently clobbering the fresh write.               */
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (skipPersist.current) {
      skipPersist.current = false;
      return;
    }
    Store.save(table, value);
  }, [table, value]);

  /* StrictMode re-arm (unmount-ONLY cleanup — a [table,value] cleanup would
   * fire on every re-run and swallow real saves): dev's simulated
   * unmount/remount re-runs the persist effect with mounted already true,
   * re-saving the stale load — the exact save the guard suppresses. Resetting
   * on unmount makes every (re)mount pass equally guarded; prod unmounts
   * discard the hook anyway.                                                */
  useEffect(() => () => { mounted.current = false; }, []);

  useEffect(() => Store.subscribe(table, (incoming) => {
    /* Reference-identity guard: save()'s same-tab fan-out replays the saving
     * hook's OWN value back at it; applying that echo would leave skipPersist
     * dangling (React bails on identical state and the persist effect never
     * clears the flag, silently dropping the NEXT save). Other instances see
     * a different reference and apply normally.                             */
    if (incoming === latest.current) return;
    skipPersist.current = true;
    setValue(incoming);
  }), [table]);

  return [value, setValue];
}
