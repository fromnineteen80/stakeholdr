/* mobile-logic.js — the MOBILE COMPANION's pure core (Phase 20, sealed
 * Demo-features box ~3901: "MOBILE COMPANION (the one mobile surface) —
 * FORWARD-DESIGN. A modal/responsive view: stakeholder quick-view · add-note
 * · messages. (Earmarked mobile; everything else is desktop-web.)" +
 * BUILD-MAP ~3914: "the same ui-* components in their responsive layouts …
 * quick-view = ui-sheet bottom variant; add-note = ui-dialog with
 * ui-text-field multiline; messages = the Messaging box's
 * ui-list/ui-text-field composition. No parallel mobile kit.")
 *
 * DECLARED (2026-07-14 — the sealed box scopes the three surfaces; the
 * breakpoint mechanics are the minimal industry-standard design):
 *  · THE ONE BREAKPOINT lives in tokens.css as --ui-sys-breakpoint-mobile
 *    (CSS custom properties cannot drive @media, so the useIsMobile hook
 *    READS the token and builds a matchMedia query from it — the token stays
 *    the single source; app CSS keys off the data-mobile attribute the shell
 *    stamps, never a duplicated @media literal).
 *  · MOBILE_VIEWS: exactly Lists (the compact stakeholder list hosting the
 *    quick-view + add-note) and Messages — the sealed three surfaces. Every
 *    other view renders the honest desktop-surface note (sealed: "everything
 *    else is desktop-web"; make-real law: no pretend-responsive screens).
 *  · The app shell collapses via the EXISTING ui-sidebar `collapsed`
 *    attribute (its manifest state) — no new shell mechanics.
 *
 * Pure + node-tested (scripts/mobile-test.mjs): no React, no DOM globals.
 */

/* Fallback when the token is unreadable (detached document, ancient UA). */
export const MOBILE_FALLBACK_PX = 720;

/* breakpointQuery("720px") → "(max-width: 720px)". Tolerates whitespace and
 * a missing/garbled token by falling back — the query must always be valid. */
export function breakpointQuery(tokenValue) {
  const px = parseInt(String(tokenValue == null ? '' : tokenValue).trim(), 10);
  const n = Number.isFinite(px) && px > 0 ? px : MOBILE_FALLBACK_PX;
  return `(max-width: ${n}px)`;
}

/* The sealed mobile surfaces (see header). Everything else → desktop note. */
export const MOBILE_VIEWS = ['sheet', 'messages'];

/* The desktop-surface note's body copy (one source for shell + tests). */
export const DESKTOP_NOTE_BODY =
  'On a phone, Stakeholdr is a companion: browse stakeholders, read a '
  + 'profile, add a note, and message the team. The full workspace — map, '
  + 'plans, scoring, community and settings — is built for the desktop.';

/* quickViewFields(row, users) — the quick-view sheet's read summary, from the
 * SAME computed row the Lists table renders (_status already derived).
 * Owners resolve ids → names against the live users list; absent values
 * render an honest em dash, never an empty cell. */
export function quickViewFields(row, users) {
  const names = (row.owners || [])
    .map((id) => ((users || []).find((u) => u.id === id) || {}).name)
    .filter(Boolean);
  const pair = (a, b) => [a, b].filter(Boolean).join(' · ');
  const v = (x) => x || '—';
  return [
    { label: 'Category', value: v(pair(row.category, row.type)) },
    { label: 'Market', value: v(pair(row.market, row.region)) },
    { label: 'Priority', value: v(row.priority) },
    { label: 'Status', value: v(row.status) },
    { label: 'Last contact', value: v(row.lastContact) },
    { label: 'Owners', value: v(names.join(', ')) },
  ];
}
