/* tour-logic.js — the ONBOARDING TOUR's pure core (Phase 20, sealed
 * Demo-features box ~3897: "ONBOARDING TOUR — FORWARD-DESIGN. Coachmarks on
 * first run; replayable from the profile menu." + BUILD-MAP ~3913:
 * ui-coachmark is the registered GAP component).
 *
 * DECLARED (2026-07-14 — the sealed box names the feature, not the steps;
 * this is the minimal industry-standard design, never silent):
 *  · SEVEN STEPS, each anchored to REAL chrome that exists on the Lists view
 *    (the tour's home): the workspace selector, the nav rail, the workHQ
 *    band, the Lists table, the Map NAV ITEM (the Map itself lives on another
 *    view — anchoring its nav entry is the simplest honest design; the tour
 *    never navigates behind the user's back), the palette search trigger,
 *    and the context-aware (+) create.
 *  · FIRST-RUN FLAG: "hpsm:__tourSeen" — INSIDE the store namespace ON
 *    PURPOSE, exactly like the Phase-19 blank marker: the sealed reset sweep
 *    (store.js sweepKeys) clears every "hpsm:" key, so "Reset demo data" /
 *    "Start blank" also re-arm the tour. It is a plain localStorage flag
 *    (a per-device UI marker, like hp_workhq_mode), NOT a synced store table.
 *  · SKIP DISMISSES FOR GOOD: Skip / Esc / × all mark the flag; the tour
 *    only returns via the profile menu's "Replay tour" (or a demo reset).
 *  · STORAGE-UNAVAILABLE FAIL-SAFE: hasSeenTour returns true when storage
 *    throws — a browser that cannot persist the flag must not re-open the
 *    tour on every load (annoyance beats loss of a one-time nicety).
 *  · MOBILE: the tour never auto-starts at mobile widths — every anchor is
 *    desktop chrome (the mobile companion is the sealed exception surface).
 *
 * Pure + node-tested (scripts/tour-test.mjs): no React, no DOM globals.
 */

export const TOUR_KEY = 'hpsm:__tourSeen';

/* Each step: anchor = the DOM id the coachmark spotlights (all stamped on
 * real chrome in shell.jsx / sheet.jsx / workhq.jsx), heading + body = the
 * card copy. Order = the reading order of the chrome, selector → rail →
 * band → table → map → search → create. */
export const TOUR_STEPS = [
  {
    anchor: 'ws-select-anchor',
    heading: 'Workspaces',
    body: 'You are looking at Master — every stakeholder in the org. Use this selector to switch into a workspace: a scoped list with its own scoring team and plans.',
  },
  {
    anchor: 'app-nav',
    heading: 'Navigate',
    body: 'Lists, Map, Plans, Community and Workspaces live here. Scoring appears once you are inside a workspace. Your open workspaces stack below the nav.',
  },
  {
    anchor: 'workhq-band',
    heading: 'WorkHQ',
    body: 'Your daily brief: relationships going cold, stakeholders waiting on your score, open community votes and active plans. Drill into any entry, or ignore what you have handled.',
  },
  {
    anchor: 'lists-table',
    heading: 'The Lists table',
    body: 'Every stakeholder, editable in place. Search, filter and sort from the toolbar; select rows for bulk actions; import and export from the footer.',
  },
  {
    anchor: 'nav-map',
    heading: 'The Map',
    body: 'The relationship map plots every scored stakeholder by support and influence across 14 zones — with a scorecard and strategy for each. Find it here when you are ready.',
  },
  {
    anchor: 'search-anchor',
    heading: 'Search everything',
    body: 'The command palette jumps to any stakeholder, plan, workspace, community entry or person. Press ⌘K on Mac, Ctrl K elsewhere — from any screen.',
  },
  {
    anchor: 'create-anchor',
    heading: 'Create in context',
    body: 'The + creates whatever the current view holds: a stakeholder on Lists, a plan on Plans, a workspace on Workspaces. That is the tour — dive in.',
  },
];

/* Flag semantics — storage-like in, boolean out (fail-safe: see header). */
export function hasSeenTour(storage) {
  try { return storage.getItem(TOUR_KEY) === '1'; } catch { return true; }
}

export function markTourSeen(storage) {
  try { storage.setItem(TOUR_KEY, '1'); } catch { /* memory-only: skip */ }
}
