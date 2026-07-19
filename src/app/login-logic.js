/* login-logic.js — the LOGIN GATE's pure core (Phase 23, sealed App-shell box
 * "AUTH GATE & SESSION" ~1737–1747 + Users & People box "LOGIN (LoginView)"
 * ~2624–2650 + the LOGINVIEW skeleton tree ~2689–2714 + demo-features ~3882).
 *
 * SEALED LINES HONORED (verbatim where the box pins copy):
 *  · h1 "Sign in" · sub "Tell us who you are to get started." · brand subline
 *    "Stakeholder mapping & engagement" · demo label "Or continue as one of
 *    the demo accounts:" · field labels/placeholders (Full name "Jordan Kim" /
 *    Title "Director, GA&PP North America" / Work email "jordan.kim@hp.com" /
 *    "Profile photo (optional)") · upload toggle "Upload photo"/"Replace
 *    photo" + ghost "Remove" · submit "Enter {appName} →" (trailing arrow IS
 *    part of the label) · valid = name.trim() && email.trim() && /@/.test —
 *    the email must merely CONTAIN "@" (sealed exact) · default title "Team
 *    member" · default avatar color = the FIRST palette entry (sealed
 *    #B5552C = --ui-sys-avatar-1, census CAPTURED→TOKEN) · new users start
 *    presence "online".
 *
 * ⚠ SEALED TRAP — DEMO AUTO-MANAGER, DO NOT REPLICATE (App-shell box +
 * demo-features ~3882 + INDEX gate 5): the oracle force-promoted ANY
 * logged-in user to manager in THREE places (stored-user load, logIn's
 * { ...u, role: "manager" }, the directory upsert). DELETED here: roles come
 * from the user record ONLY — buildLoginUser mints the BASE role for a fresh
 * sign-up and upsertUser NEVER writes a role the record does not already
 * carry. scripts/login-test.mjs asserts a member stays member through login.
 *
 * DECLARED DEPARTURES (never silent):
 *  · The sealed do-not-replicate ruling is APPLIED: the login brand + submit
 *    label bind to appConfig.appName (the oracle hardcoded "HP's Map"; the
 *    Settings box's helper "Shown in the header, login screen, and browser
 *    tab title" is the design intent — made real this phase).
 *  · DEMO LIST = every SEEDED non-system user as a full row (avatar + name +
 *    title), superseding the sealed slice(0,5) first-name chips — the ruled
 *    Phase-23 presentation; same click = sign-in-as-them behavior. SCOPE
 *    (audit 2026-07-15): the list filters to the SEED ids (+ the blank-mode
 *    solo manager) — TYPED accounts never appear under the "demo accounts"
 *    label (the sealed chip list was static seed data; a live-directory
 *    filter leaked real users into it). Live records still win for display,
 *    so a demo user's profile edits show. In BLANK mode this yields exactly
 *    u-you (the u-system bot is excluded everywhere, sealed roles enum).
 *  · NEW_USER_ROLE = 'member' (the base role; sealed enum manager | member |
 *    system — the sealed submit() minted NO role at all and relied on the
 *    banned auto-promote; a record without a role would dodge every gate).
 *  · SESSION = the namespaced store table 'session' ("hpsm:session",
 *    { userId }) replacing the oracle's whole-user "hp_map_user" mirror: the
 *    users DIRECTORY is the one identity source (the sealed SESSION RECONCILE
 *    collapses to a lookup — no copy to drift), and the sealed reset sweep
 *    (store.js sweepKeys over "hpsm:") clears it, so demo-reset/blank-start
 *    also LOG OUT (login-test.mjs pins the sweep).
 *
 * Pure + node-tested (scripts/login-test.mjs): no React, no DOM globals.
 */
import { SEED_USERS, BLANK_SOLO_USER } from './data/seed.js';

/* ── session semantics (the shape data/session.js persists) ──────────────── */
export const SESSION_TABLE = 'session';
export const SESSION_KEY = 'hpsm:' + SESSION_TABLE; // must fall inside the sweep

export function sessionRecord(userId) {
  return { userId };
}

export function sessionUserId(session) {
  return (session && session.userId) || null;
}

/* currentUser derives from the session AGAINST THE DIRECTORY — no users[0]
 * fallback anywhere: the gate is the entry, and a session whose user was
 * removed (removeUser cascade) resolves null → back to the gate. */
export function currentUserFrom(users, session) {
  const id = sessionUserId(session);
  if (!id) return null;
  return (users || []).find((u) => u.id === id) || null;
}

/* ── sealed strings ──────────────────────────────────────────────────────── */
export const LOGIN = {
  h1: 'Sign in',
  sub: 'Tell us who you are to get started.',
  subline: 'Stakeholder mapping & engagement',
  demoLabel: 'Or continue as one of the demo accounts:',
  fullName: 'Full name',
  namePlaceholder: 'Jordan Kim',
  title: 'Title',
  titlePlaceholder: 'Director, GA&PP North America',
  email: 'Work email',
  emailPlaceholder: 'jordan.kim@hp.com',
  photo: 'Profile photo (optional)',
  uploadPhoto: 'Upload photo',
  replacePhoto: 'Replace photo',
  removePhoto: 'Remove',
};

/* Sealed submit label: "Enter {appName} →" — the arrow is part of the label;
 * appName-bound per the do-not-replicate ruling. */
export function submitLabel(appName) {
  return `Enter ${appName} →`;
}

/* ── sealed validity: name + email present, email CONTAINS "@" ───────────── */
export function loginValid(name, email) {
  return Boolean(
    (name || '').trim() && (email || '').trim() && /@/.test(email || ''));
}

/* ── the new-user record (sealed submit() shape, auto-promote DELETED) ───── */
export const DEFAULT_TITLE = 'Team member';
export const NEW_USER_ROLE = 'member';
export const AVATAR_DEFAULT = 'var(--ui-sys-avatar-1)'; // sealed first swatch

export function buildLoginUser(fields, mintId, stamp) {
  const f = fields || {};
  return {
    id: mintId('u'),
    name: (f.name || '').trim(),
    title: (f.title || '').trim() || DEFAULT_TITLE,
    email: (f.email || '').trim(),
    avatarColor: f.avatarColor || AVATAR_DEFAULT,
    avatarUrl: f.avatarUrl || null,
    presence: 'online',
    role: NEW_USER_ROLE,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

/* ── the sealed logIn directory upsert (if present, map; else append) ─────
 * NO role mutation on either arm — the banned promote is what died here. */
export function upsertUser(users, u) {
  const list = users || [];
  return list.some((x) => x.id === u.id)
    ? list.map((x) => (x.id === u.id ? { ...x, ...u } : x))
    : [...list, u];
}

/* ── the demo-account quick-entry list (system bot excluded, sealed enum;
 * SEED-SCOPED per the declared ledger — typed accounts are real accounts,
 * not demos, and never render under the demo label) ── */
const DEMO_IDS = new Set(
  [...SEED_USERS, BLANK_SOLO_USER]
    .filter((u) => u.role !== 'system')
    .map((u) => u.id),
);
export function demoAccounts(users) {
  return (users || []).filter((u) => u.role !== 'system' && DEMO_IDS.has(u.id));
}
