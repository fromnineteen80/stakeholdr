#!/usr/bin/env node
/* map-test.mjs — node asserts for the Phase-5 Map, with expected values taken
 * FROM THE SEALED BOX TEXT ("Map — coordinate→pixel translation …" +
 * "Relationship engine" + "Shared UI primitives"). The DOM component is
 * guarded behind typeof document, so design-system/components/
 * stakeholder-map.js imports cleanly in node. ALSO enforces the
 * single-source law mechanically: every mirror in the map module must match
 * src/app/data/engine.js (and the formatDateLong mirror must match
 * src/app/modals/stakeholder-logic.js) character-for-character.
 * Run: node scripts/map-test.mjs
 */
import assert from 'node:assert/strict';
import {
  GRID as ENGINE_GRID, STATUSES, statusFor as engineStatusFor,
  coordToPct as engineCoordToPct,
} from '../src/app/data/engine.js';
import { formatDateLong as logicFormatDateLong } from '../src/app/modals/stakeholder-logic.js';
import { abbrev } from '../design-system/components/stakeholder-table.js';
import {
  GRID, ZONE_TOKENS, ZONE_STRATEGIES, statusFor, coordToPct,
  cellFor, countCells, densityPct, densityFill, haloInset,
  Y_TICKS, X_TICKS, LEGEND_LEFT, LEGEND_CENTER, LEGEND_RIGHT,
  TWEAK_DEFAULTS, EMPTY_PROMPT, HISTORY_TIP_ON, HISTORY_TIP_OFF,
  formatDateLong, latestNote, tagsOverflow,
} from '../design-system/components/stakeholder-map.js';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('  ✓ ' + name); };

console.log('map-test — sealed-box assertions (Phase 5)\n');

/* ── coordToPct: corners + centre, via THE ENGINE (the single source) ──── */
t('engine coordToPct(-10, 10) → left 0%, top 0% (top-left corner)', () =>
  assert.deepEqual(engineCoordToPct(-10, 10), { left: '0%', top: '0%' }));
t('engine coordToPct(10, -10) → left 100%, top 100% (bottom-right)', () =>
  assert.deepEqual(engineCoordToPct(10, -10), { left: '100%', top: '100%' }));
t('engine coordToPct(10, 10) → 100%, 0%  ·  (-10,-10) → 0%, 100%', () => {
  assert.deepEqual(engineCoordToPct(10, 10), { left: '100%', top: '0%' });
  assert.deepEqual(engineCoordToPct(-10, -10), { left: '0%', top: '100%' });
});
t('engine coordToPct(0, 0) → dead centre 50%, 50%', () =>
  assert.deepEqual(engineCoordToPct(0, 0), { left: '50%', top: '50%' }));
t('positive y renders UP: coordToPct(0, 5).top = 25%', () =>
  assert.equal(engineCoordToPct(0, 5).top, '25%'));

/* ── the map module's transform mirror === the engine, across samples ──── */
t('map coordToPct mirrors the engine exactly (sample sweep)', () => {
  for (const x of [-10, -7.3, -5, -0.001, 0, 2.5, 5, 9.99, 10]) {
    for (const y of [-10, -5, -2.5, 0, 0.001, 2.5, 5, 7.5, 10]) {
      assert.deepEqual(coordToPct(x, y), engineCoordToPct(x, y), `(${x},${y})`);
    }
  }
});

/* ── mirror parity: GRID / statusFor ───────────────────────────────────── */
t('map GRID === engine GRID (24 cells, verbatim)', () =>
  assert.deepEqual(GRID, ENGINE_GRID));
t('map statusFor mirrors engine statusFor (incl. clamped inputs)', () => {
  for (const x of [-12, -10, -5.001, -5, -4.999, -0.001, 0, 4.999, 5, 10, 12]) {
    for (const y of [15, 10, 5.001, 5, 2.501, 2.5, 0.001, 0, -2.499, -2.5, -4.999, -5, -10, -15]) {
      assert.equal(statusFor(x, y), engineStatusFor(x, y), `(${x},${y})`);
    }
  }
});

/* ── cell binning parity with statusFor across boundary samples (sealed:
 * "Cell binning for the count matches statusFor exactly") ──────────────── */
t('cellFor binning lands every boundary sample in statusFor\'s zone', () => {
  const xs = [-10, -5.001, -5, -4.999, -0.001, 0, 0.001, 4.999, 5, 5.001, 10];
  const ys = [10, 5.001, 5, 4.999, 2.501, 2.5, 0.001, 0, -0.001, -2.499, -2.5, -2.501, -4.999, -5, -5.001, -10];
  for (const x of xs) for (const y of ys) {
    const { row, col } = cellFor(x, y);
    assert.equal(GRID[row][col], engineStatusFor(x, y), `(${x},${y})`);
  }
});
t('sealed binning spot-checks: x=0 → col 2 · y=5 → row 1 · y=-5 → row 5', () => {
  assert.equal(cellFor(0, 0).col, 2);
  assert.equal(cellFor(-3, 5).row, 1);
  assert.equal(cellFor(3, -5).row, 5);
});

/* ── countCells: keying + the sealed maxCount floor ────────────────────── */
t('countCells keys "row,col" and floors maxCount at 1 on empty', () => {
  assert.deepEqual(countCells([]), { counts: {}, maxCount: 1 });
  const { counts, maxCount } = countCells([
    { _x: 10, _y: 10 }, { _x: 7, _y: 8 }, { _x: -10, _y: 10 },
  ]);
  assert.equal(counts['0,3'], 2);
  assert.equal(counts['0,0'], 1);
  assert.equal(maxCount, 2);
});

/* ── density percent math (sealed 20 + t*80) ───────────────────────────── */
t('densityPct: t=0 → 20 · t=0.5 → 60 · t=1 → 100', () => {
  assert.equal(densityPct(0), 20);
  assert.equal(densityPct(0.5), 60);
  assert.equal(densityPct(1), 100);
});
t('densityFill emits the sealed color-mix(in oklch, …, density base)', () =>
  assert.equal(
    densityFill('--ui-sys-zone-monitor', 0.5),
    'color-mix(in oklch, var(--ui-sys-zone-monitor) 60%, var(--ui-sys-zone-density-base))',
  ));

/* ── halo inset formula (sealed -(dotSize * 0.8) px) ───────────────────── */
t('haloInset(22) = -17.6 · haloInset(14) ≈ -11.2 · haloInset(36) = -28.8', () => {
  assert.equal(haloInset(22), -17.6);
  assert.ok(Math.abs(haloInset(14) - -11.2) < 1e-9);
  assert.ok(Math.abs(haloInset(36) - -28.8) < 1e-9);
});

/* ── axis ticks (sealed arrays) ────────────────────────────────────────── */
t('y ticks are the sealed [10, 7.5, 5, 2.5, 0, -2.5, -5, -7.5, -10]', () =>
  assert.deepEqual(Y_TICKS, [10, 7.5, 5, 2.5, 0, -2.5, -5, -7.5, -10]));
t('x ticks are every integer -10..10 (21 ticks)', () => {
  assert.equal(X_TICKS.length, 21);
  assert.equal(X_TICKS[0], -10);
  assert.equal(X_TICKS[20], 10);
  assert.deepEqual(X_TICKS.slice(9, 12), [-1, 0, 1]);
});

/* ── legend copy — DECLARED RESOLUTION (box-internal conflict): the sealed
 * box BODY spaces the centre segment's middot with DOUBLE spaces while the
 * box's own SKELETON TREE uses SINGLE; single ships (see the LEGEND_*
 * comment in stakeholder-map.js). Left/right are sealed verbatim. ───────── */
t('legend left: "← Works against you"', () =>
  assert.equal(LEGEND_LEFT, '← Works against you'));
t('legend centre (declared resolution): single-spaced "↑ Greater community influence · ↓ Less community influence"', () =>
  assert.equal(LEGEND_CENTER, '↑ Greater community influence · ↓ Less community influence'));
t('legend right: "Works with you →"', () =>
  assert.equal(LEGEND_RIGHT, 'Works with you →'));

/* ── display-option defaults (sealed TWEAK_DEFAULTS) ───────────────────── */
t('TWEAK_DEFAULTS = halo / labels off / zone labels on / dotSize 22', () =>
  assert.deepEqual(TWEAK_DEFAULTS,
    { mapStyle: 'halo', showLabels: false, showZoneLabels: true, dotSize: 22 }));

/* ── sealed scorecard copy: read-only prompt + history tooltips ────────── */
t('empty prompt is the de-staled read-only copy (no drag clause)', () => {
  assert.equal(EMPTY_PROMPT, 'Click any dot on the map to see details.');
  assert.ok(!/drag/i.test(EMPTY_PROMPT));
});
t('history toggle tooltips carry the sealed title copy', () => {
  assert.equal(HISTORY_TIP_ON, 'Exit history view');
  assert.equal(HISTORY_TIP_OFF, "View this stakeholder's historic positions");
});

/* ── zone token map parity with the engine catalog ─────────────────────── */
t('ZONE_TOKENS mirrors engine STATUSES cssVar/inkVar/borderVar per zone', () => {
  const zones = Object.keys(STATUSES);
  assert.equal(zones.length, 14);
  assert.deepEqual(Object.keys(ZONE_TOKENS).sort(), zones.slice().sort());
  for (const z of zones) {
    assert.equal(ZONE_TOKENS[z].bg, STATUSES[z].cssVar, z + ' fill');
    assert.equal(ZONE_TOKENS[z].ink, STATUSES[z].inkVar, z + ' ink');
    assert.equal(ZONE_TOKENS[z].border, STATUSES[z].borderVar || null, z + ' border');
  }
});

/* ── strategy card copy parity (verbatim, character-for-character) ─────── */
t('ZONE_STRATEGIES mirrors engine strategy/action verbatim (14 zones)', () => {
  for (const z of Object.keys(STATUSES)) {
    assert.equal(ZONE_STRATEGIES[z].strategy, STATUSES[z].strategy, z + ' strategy');
    assert.equal(ZONE_STRATEGIES[z].action, STATUSES[z].action, z + ' action');
  }
});

/* ── abbrev honorific cases (sealed Shared-UI-primitives formula) ──────── */
t('abbrev strips honorifics: "Mayor Maria Chen" → MC · "Sen. Dana Whitfield" → DW', () => {
  assert.equal(abbrev('Mayor Maria Chen'), 'MC');
  assert.equal(abbrev('Sen. Dana Whitfield'), 'DW');
});
t('abbrev: "Rep. Ana Luz Cruz" → AC (first + LAST word) · "Dr. Jonas Salk" → JS', () => {
  assert.equal(abbrev('Rep. Ana Luz Cruz'), 'AC');
  assert.equal(abbrev('Dr. Jonas Salk'), 'JS');
});
t('abbrev: single word → first 2 chars uppercased ("Cher" → CH; "Mrs. Robinson" → RO)', () => {
  assert.equal(abbrev('Cher'), 'CH');
  assert.equal(abbrev('Mrs. Robinson'), 'RO');
});
t('abbrev: no name → "·"', () => assert.equal(abbrev(''), '·'));

/* ── formatDateLong mirror parity with stakeholder-logic ───────────────── */
t('formatDateLong mirrors the app single source (bare date, ISO, invalid, falsy)', () => {
  for (const v of ['2026-05-12', '2026-01-31T10:30:00.000Z', 'not-a-date', '', null]) {
    assert.equal(formatDateLong(v), logicFormatDateLong(v), String(v));
  }
});
t('formatDateLong("2026-05-12") parses LOCAL midnight (never the previous day)', () =>
  assert.ok(formatDateLong('2026-05-12').includes('12')));

/* ── latestNote (sealed: newest notesHistory by .at desc, fallback notes) ── */
t('latestNote picks the NEWEST notesHistory entry by .at', () => {
  const s = {
    notes: 'legacy',
    lastContact: '2026-01-01',
    notesHistory: [
      { id: 'n1', body: 'old', at: '2026-01-05T00:00:00.000Z' },
      { id: 'n2', body: 'new', at: '2026-06-05T00:00:00.000Z' },
    ],
  };
  assert.equal(latestNote(s).body, 'new');
});
t('latestNote falls back to { body: notes, at: lastContact, by: null }', () => {
  const s = { notes: 'plain note', lastContact: '2026-05-12' };
  assert.deepEqual(latestNote(s), { body: 'plain note', at: '2026-05-12', by: null });
});
t('latestNote → null when neither notesHistory nor notes resolves', () =>
  assert.equal(latestNote({ name: 'x' }), null));

/* ── Tags primitive rule (first 3 + "+N") ──────────────────────────────── */
t('tagsOverflow: first 3 shown, "+N" for the rest; empty → none', () => {
  assert.deepEqual(tagsOverflow(['a', 'b', 'c', 'd', 'e']), { shown: ['a', 'b', 'c'], more: 2 });
  assert.deepEqual(tagsOverflow(['a']), { shown: ['a'], more: 0 });
  assert.deepEqual(tagsOverflow(null), { shown: [], more: 0 });
});

console.log(`\nmap-test: ${n} assertions passed`);
