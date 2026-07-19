/* session.js — THE ONE AUTH SEAM (Phase 23, sealed App-shell box "AUTH GATE
 * & SESSION"). Every surface that needs "who is signed in" goes through this
 * module and nothing else: the shell gates on useCurrentUser, every page
 * derives its currentUser from the same hook, login/logout are the only
 * writers.
 *
 * ▸ SUPABASE SEAM (State B, declared forward-prep): this narrow interface —
 *   getSession / signIn / signOut / currentUserId (+ the two hooks) — is the
 *   swap point. State B replaces the INTERNALS with Supabase auth
 *   (supabase.auth.getSession / signInWith… / signOut; the auth user id maps
 *   to the users-directory row) while the exports keep their signatures, so
 *   no UI code changes. No Supabase code ships now.
 *
 * Persistence: the store table 'session' → "hpsm:session", value
 * { userId } | null (login-logic.sessionRecord). INSIDE the namespace ON
 * PURPOSE — the sealed reset sweep (store.js sweepKeys) clears it, so
 * "Reset demo data" / "Start blank" also LOG OUT (sealed semantics: the
 * schema migration + reset never leak a stale identity). Riding the Store
 * keeps the sealed transport contract: same-tab fan-out + cross-tab
 * BroadcastChannel deliver login/logout to every mounted hook instance.
 *
 * The oracle's whole-user "hp_map_user" mirror + its SESSION RECONCILE
 * effect are NOT replicated: the session stores only the id; identity always
 * resolves against the users directory (login-logic.currentUserFrom), so
 * there is no second copy to drift. Its sealed logOut contract (A10: clear
 * the persisted session → the gate) maps to signOut() writing null.
 */
import { Store, usePersistentState } from './store.js';
import {
  SESSION_TABLE, sessionRecord, sessionUserId, currentUserFrom,
} from '../login-logic.js';

/* getSession() → { userId } | null (persisted; null when signed out). */
export function getSession() {
  return Store.load(SESSION_TABLE, null);
}

/* signIn(userId) — the ONE login writer (the gate calls it after the sealed
 * directory upsert has landed). */
export function signIn(userId) {
  Store.save(SESSION_TABLE, sessionRecord(userId));
}

/* signOut() — the ONE logout writer (sealed census A10: ProfileMenu
 * "Log out" → the login gate). */
export function signOut() {
  Store.save(SESSION_TABLE, null);
}

/* currentUserId() → the signed-in user's id | null (non-React callers). */
export function currentUserId() {
  return sessionUserId(getSession());
}

/* useSession() — the live session record (re-renders on login/logout,
 * including from another tab via the Store transport). */
export function useSession() {
  const [session] = usePersistentState(SESSION_TABLE, null);
  return session;
}

/* useCurrentUser(users) — THE shared currentUser derivation (Phase 23
 * wire-through: every page's `users[0]` seam re-points here). Resolves the
 * session id against the caller's live users directory; null when signed
 * out OR when the session user no longer exists (removeUser cascade) — the
 * shell gate reads that null as "back to the gate". */
export function useCurrentUser(users) {
  return currentUserFrom(users, useSession());
}
