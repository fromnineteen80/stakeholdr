#!/usr/bin/env node
/* scale-test.mjs — node asserts on the PHASE 17 SCALE-HARDENING pure logic
 * (declared 2026-07-05 under the thousands-of-stakeholders ruling):
 *   · the virtualization window math (computeWindow) incl. both clamped edges
 *   · the bulk-selection set logic (select-all-filtered tri-state + toggle,
 *     shift-click ranges, data-swap pruning)
 *   · the single-setState bulk patch builders (sheet-logic.js) incl. the
 *     updatedAt stamps and honest per-row no-ops
 *   · export-selected riding the sealed CSV serializer over a selection.
 * The DOM component stays behind its document guard, so node imports clean.
 */
import assert from 'node:assert/strict';
import {
  computeWindow, VIRTUAL_THRESHOLD, VIRTUAL_OVERSCAN, DEFAULT_ROW_H,
  selectAllState, toggleSelectAll, rangeIds, applyRangeSelection,
  pruneSelection, buildCsv, SELECT_COL, FROZEN_COLS,
} from '../design-system/components/stakeholder-table.js';
import {
  bulkPatchStakeholders, bulkAddTag, bulkAssignWorkspace, bulkActionSummary,
} from '../src/app/pages/sheet-logic.js';

let passed = 0;
const ok = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name); };

console.log('scale-test: Phase 17 virtualization + bulk-action pure logic\n');

/* ── WINDOW MATH ────────────────────────────────────────────────────────── */
const W = (over) => computeWindow({
  scrollTop: over.scrollTop ?? 0, viewportHeight: over.viewportHeight ?? 370,
  rowHeight: over.rowHeight ?? 37, total: over.total ?? 2000,
  overscan: over.overscan ?? 5, headerHeight: over.headerHeight ?? 34,
});

ok('top edge: scrollTop 0 starts at row 0 with no top pad', () => {
  const w = W({ scrollTop: 0 });
  assert.equal(w.start, 0);
  assert.equal(w.topPad, 0);
  // 370/37 = 10 visible + 1 + 5 overscan = 16
  assert.equal(w.end, 16);
  assert.equal(w.bottomPad, (2000 - 16) * 37);
});
ok('mid-scroll: window brackets the visible rows with overscan both sides', () => {
  // row 500 top = 34 + 500*37 → scrollTop there puts first=500
  const w = W({ scrollTop: 34 + 500 * 37 });
  assert.equal(w.start, 495);                        // 500 - overscan 5
  assert.equal(w.end, 500 + 10 + 1 + 5);             // first + visible + overscan
  assert.equal(w.topPad, 495 * 37);
  assert.equal(w.topPad + (w.end - w.start) * 37 + w.bottomPad, 2000 * 37);
});
ok('bottom edge: end clamps at total, bottom pad 0', () => {
  const w = W({ scrollTop: 34 + 2000 * 37 });        // beyond the last row
  assert.equal(w.end, 2000);
  assert.equal(w.bottomPad, 0);
  assert.ok(w.start <= w.end);
});
ok('small set: total under the window renders whole (start 0 / end total)', () => {
  const w = W({ total: 8, scrollTop: 0 });
  assert.deepEqual([w.start, w.end, w.topPad, w.bottomPad], [0, 8, 0, 0]);
});
ok('empty set: zero window, zero pads', () => {
  assert.deepEqual(W({ total: 0 }), { start: 0, end: 0, topPad: 0, bottomPad: 0 });
});
ok('header offset shifts the first row: scrollTop just under headerHeight stays at row 0', () => {
  const w = W({ scrollTop: 33, overscan: 0 });
  assert.equal(w.start, 0);
});
ok('pads always reconstruct the full scroll height (spot sweep)', () => {
  for (const st of [0, 37, 999, 40000, 73966]) {
    const w = W({ scrollTop: st });
    assert.equal(w.topPad + (w.end - w.start) * 37 + w.bottomPad, 2000 * 37, `scrollTop ${st}`);
  }
});
ok('exported constants: threshold 150, overscan 15, sealed row height 37', () => {
  assert.equal(VIRTUAL_THRESHOLD, 150);
  assert.equal(VIRTUAL_OVERSCAN, 15);
  assert.equal(DEFAULT_ROW_H, 37);
});

/* ── SELECTION SETS ─────────────────────────────────────────────────────── */
const filtered = ['a', 'b', 'c', 'd', 'e'];

ok('selectAllState: none / some / all against the FILTERED set', () => {
  assert.equal(selectAllState([], filtered), 'none');
  assert.equal(selectAllState(['a', 'c'], filtered), 'some');
  assert.equal(selectAllState(filtered, filtered), 'all');
  assert.equal(selectAllState(['zzz'], filtered), 'none');   // off-filter picks don't tint the header
  assert.equal(selectAllState(['a'], []), 'none');           // empty filter → never checked
});
ok('toggleSelectAll from none/some selects the whole filtered set', () => {
  assert.deepEqual([...toggleSelectAll([], filtered)].sort(), filtered);
  assert.deepEqual([...toggleSelectAll(['b'], filtered)].sort(), filtered);
});
ok('toggleSelectAll from all clears ONLY the filtered ids (off-filter picks survive)', () => {
  const next = toggleSelectAll(['x', ...filtered], filtered);
  assert.deepEqual(next, ['x']);
});
ok('rangeIds: inclusive span in filtered order, either direction', () => {
  assert.deepEqual(rangeIds(filtered, 'b', 'd'), ['b', 'c', 'd']);
  assert.deepEqual(rangeIds(filtered, 'd', 'b'), ['b', 'c', 'd']);
  assert.deepEqual(rangeIds(filtered, 'c', 'c'), ['c']);
});
ok('rangeIds: a missing anchor degrades to the single target', () => {
  assert.deepEqual(rangeIds(filtered, 'gone', 'c'), ['c']);
  assert.deepEqual(rangeIds(filtered, 'a', 'gone'), []);
});
ok('applyRangeSelection: checked extends, unchecked clears the span', () => {
  assert.deepEqual([...applyRangeSelection(['a'], ['b', 'c'], true)].sort(), ['a', 'b', 'c']);
  assert.deepEqual(applyRangeSelection(['a', 'b', 'c'], ['b', 'c'], false), ['a']);
});
ok('pruneSelection drops ids no longer in the data', () => {
  assert.deepEqual(
    pruneSelection(['a', 'dead', 'c'], [{ id: 'a' }, { id: 'c' }]),
    ['a', 'c']);
});
ok('SELECT_COL is the declared addition, NOT folded into the sealed frozen four', () => {
  assert.equal(SELECT_COL.key, 'sel');
  assert.equal(FROZEN_COLS.length, 4);
  assert.ok(!FROZEN_COLS.some((c) => c.key === 'sel'));
});

/* ── BULK PATCH BUILDERS (single setState per action) ───────────────────── */
const STAMP = '2026-07-05T12:00:00.000Z';
const shs = [
  { id: 's1', name: 'One', priority: 'Low', tags: ['ally'], updatedAt: 'old' },
  { id: 's2', name: 'Two', priority: 'Medium', tags: [], updatedAt: 'old' },
  { id: 's3', name: 'Three', priority: 'High', updatedAt: 'old' },
];

ok('bulkPatchStakeholders: one pass — selected rows patched + stamped, others by reference', () => {
  const next = bulkPatchStakeholders(shs, ['s1', 's3'], { priority: 'High' }, STAMP);
  assert.notEqual(next, shs);
  assert.equal(next[0].priority, 'High');
  assert.equal(next[0].updatedAt, STAMP);
  assert.equal(next[2].updatedAt, STAMP);
  assert.equal(next[1], shs[1]);                     // untouched row keeps its reference
  assert.equal(shs[0].priority, 'Low');              // never mutates the input
});
ok('bulkPatchStakeholders: empty selection / empty patch → the input reference', () => {
  assert.equal(bulkPatchStakeholders(shs, [], { priority: 'High' }, STAMP), shs);
  assert.equal(bulkPatchStakeholders(shs, ['s1'], {}, STAMP), shs);
});
ok('bulkAddTag: unions the tag, stamps changed rows, honest no-op on rows already tagged', () => {
  const next = bulkAddTag(shs, ['s1', 's2', 's3'], 'ally', STAMP);
  assert.equal(next[0], shs[0]);                     // already tagged → reference-equal, no stamp churn
  assert.deepEqual(next[1].tags, ['ally']);
  assert.equal(next[1].updatedAt, STAMP);
  assert.deepEqual(next[2].tags, ['ally']);          // rows without a tags array grow one
});
ok('bulkAddTag: blank tag rejected whole', () => {
  assert.equal(bulkAddTag(shs, ['s1'], '   ', STAMP), shs);
});
ok('bulkAssignWorkspace: unions membership; missing entries take the sealed createJoinFor join', () => {
  const joins = { s1: ['ws-a'], s2: [] };
  const next = bulkAssignWorkspace(joins, ['s1', 's2', 's3'], 'ws-b');
  assert.deepEqual(next.s1, ['ws-a', 'ws-b']);
  assert.deepEqual(next.s2, ['ws-b']);               // empty join → the sealed create-time join
  assert.deepEqual(next.s3, ['ws-b']);               // no entry → minted via createJoinFor
  assert.deepEqual(joins.s1, ['ws-a']);              // input untouched
});
ok('bulkAssignWorkspace: already-member rows keep their join reference; all-member → input reference', () => {
  const joins = { s1: ['ws-b'], s2: ['ws-a', 'ws-b'] };
  assert.equal(bulkAssignWorkspace(joins, ['s1', 's2'], 'ws-b'), joins);
  assert.equal(bulkAssignWorkspace(joins, ['s1'], null), joins);
});
ok('bulkActionSummary singularizes at 1 (the sealed count-copy rule)', () => {
  assert.equal(bulkActionSummary(1, 'Priority set to High'), 'Priority set to High for 1 stakeholder');
  assert.equal(bulkActionSummary(3, 'Tag "ally" added'), 'Tag "ally" added for 3 stakeholders');
});

/* ── EXPORT SELECTED — the sealed CSV path over a selection ─────────────── */
ok('export-selected: buildCsv over the selected rows yields header + N lines', () => {
  const rows = [
    { id: 'r1', name: 'Alpha', org: 'O1', _x: 1, _y: 2, _status: 'Monitor' },
    { id: 'r2', name: 'Beta', org: 'O2', _x: 3, _y: 4, _status: 'Commit' },
  ];
  const selected = rows.filter((r) => ['r2'].includes(r.id));
  const csv = buildCsv(selected, []);
  const lines = csv.split('\n');
  assert.equal(lines.length, 2);                     // header + 1 selected row
  assert.ok(lines[1].startsWith('Beta,O2,'));
});

console.log(`\nscale-test: ${passed} assertions passed`);
