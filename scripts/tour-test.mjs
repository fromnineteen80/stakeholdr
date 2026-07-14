#!/usr/bin/env node
/* tour-test.mjs — node assertions for the Phase-20 onboarding tour's pure
 * core (src/app/tour-logic.js): the declared step list's shape and the
 * first-run flag semantics (hpsm:-namespaced so the sealed reset sweep
 * re-arms the tour; storage-unavailable fail-safe = never re-show).
 */
import assert from 'node:assert/strict';
import { TOUR_KEY, TOUR_STEPS, hasSeenTour, markTourSeen } from '../src/app/tour-logic.js';
import { sweepKeys } from '../src/app/data/store.js';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log(`  ✓ ${name}`); };

/* ── step list shape (the DECLARED seven-step design) ─────────────────────── */

t('seven steps, in the declared chrome reading order', () => {
  assert.equal(TOUR_STEPS.length, 7);
  assert.deepEqual(TOUR_STEPS.map((s) => s.anchor), [
    'ws-select-anchor', // the workspace selector (existing shell id)
    'app-nav',          // the nav rail
    'workhq-band',      // the Lists intelligence band
    'lists-table',      // the Lists table
    'nav-map',          // the Map NAV ITEM (declared: never navigates for you)
    'search-anchor',    // the palette trigger
    'create-anchor',    // the context-aware (+)
  ]);
});

t('every step carries a non-empty anchor, heading, and body — no bare labels', () => {
  for (const s of TOUR_STEPS) {
    assert.ok(s.anchor && typeof s.anchor === 'string');
    assert.ok(s.heading && s.heading.trim().length > 0);
    assert.ok(s.body && s.body.trim().length > 40, `step "${s.heading}" body must teach, not label`);
  }
});

t('anchors are unique (one spotlight target per step)', () => {
  assert.equal(new Set(TOUR_STEPS.map((s) => s.anchor)).size, TOUR_STEPS.length);
});

t('the palette step names both chords (⌘K mac · Ctrl K elsewhere)', () => {
  const s = TOUR_STEPS.find((x) => x.anchor === 'search-anchor');
  assert.ok(s.body.includes('⌘K') && s.body.includes('Ctrl K'));
});

/* ── flag semantics ───────────────────────────────────────────────────────── */

const fakeStorage = (init = {}) => {
  const m = new Map(Object.entries(init));
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    keys: () => [...m.keys()],
  };
};

t('the flag key is hpsm:-namespaced — the sealed reset sweep clears it', () => {
  assert.ok(TOUR_KEY.startsWith('hpsm:'));
  // sweepKeys is the ONE reset predicate (store.js) — the tour key must fall
  // inside it so "Reset demo data"/"Start blank" re-arm the tour.
  assert.deepEqual(sweepKeys([TOUR_KEY, 'other:key']), [TOUR_KEY]);
});

t('first run: unseen until marked; marking is idempotent', () => {
  const s = fakeStorage();
  assert.equal(hasSeenTour(s), false);
  markTourSeen(s);
  assert.equal(hasSeenTour(s), true);
  markTourSeen(s);
  assert.equal(hasSeenTour(s), true);
  assert.deepEqual(s.keys(), [TOUR_KEY]);
});

t('only the exact "1" stamp counts as seen', () => {
  assert.equal(hasSeenTour(fakeStorage({ [TOUR_KEY]: '0' })), false);
  assert.equal(hasSeenTour(fakeStorage({ [TOUR_KEY]: '1' })), true);
});

t('storage-unavailable fail-safe: a throwing storage reads as seen, and marking never throws', () => {
  const broken = {
    getItem() { throw new Error('denied'); },
    setItem() { throw new Error('denied'); },
  };
  assert.equal(hasSeenTour(broken), true); // never re-show every load
  assert.doesNotThrow(() => markTourSeen(broken));
});

console.log(`tour-test: all ${n} assertions passed`);
/* store.js opens a BroadcastChannel at module load (node ≥18 ships the
 * global), which keeps the event loop referenced — exit explicitly. */
process.exit(0);
