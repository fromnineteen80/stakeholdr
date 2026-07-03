#!/usr/bin/env node
/* engine-test.mjs — real assertions for src/app/data/engine.js, derived ONLY
 * from the SEALED BOX TEXT ("Relationship engine — axes · zone grid ·
 * recommendations" + the Shared-UI-primitives coordToPct formula). Plain node
 * asserts; exits non-zero on any failure. Run: node scripts/engine-test.mjs  */
import assert from 'node:assert/strict';
import {
  X_BOUNDS, Y_BOUNDS, GRID, statusFor, weightedCoord, coordToPct, pctToCoord,
  STATUS_ORDER, STATUSES,
} from '../src/app/data/engine.js';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('  ✓ ' + name); };

console.log('engine-test — sealed-box assertions\n');

/* ── Bounds + grid dimensions ─────────────────────────────────────────── */
t('X_BOUNDS is the sealed [-10,-5,0,5,10]', () =>
  assert.deepEqual(X_BOUNDS, [-10, -5, 0, 5, 10]));
t('Y_BOUNDS is the sealed [10,5,2.5,0,-2.5,-5,-10]', () =>
  assert.deepEqual(Y_BOUNDS, [10, 5, 2.5, 0, -2.5, -5, -10]));
t('GRID is 6 rows × 4 cols', () => {
  assert.equal(GRID.length, 6);
  for (const row of GRID) assert.equal(row.length, 4);
});
t('every GRID cell is a catalogued zone', () => {
  for (const row of GRID) for (const z of row) assert.ok(STATUSES[z], z);
});

/* ── statusFor: corners (sealed cell sets) ────────────────────────────── */
t('(10,10) → Strategic Partner   [x≥5, y>5]', () =>
  assert.equal(statusFor(10, 10), 'Strategic Partner'));
t('(-10,10) → Proactively Defend [x<-5, y>5]', () =>
  assert.equal(statusFor(-10, 10), 'Proactively Defend'));
t('(-10,-10) → Monitor           [x<0, y≤-5]', () =>
  assert.equal(statusFor(-10, -10), 'Monitor'));
t('(10,-10) → Connect            [x≥5, y≤-5]', () =>
  assert.equal(statusFor(10, -10), 'Connect'));

/* ── statusFor: x=0 lands col 2 (0≤x<5) ───────────────────────────────── */
t('(0,10) → Valuable Relationship [0≤x<5, y>5]', () =>
  assert.equal(statusFor(0, 10), 'Valuable Relationship'));
t('(0,0) → Cooperate  [0≤x<5, -2.5<y≤0 → row 3, col 2]', () =>
  assert.equal(statusFor(0, 0), 'Cooperate'));
t('(-0.001,0) → Respond [-5≤x<0 → col 1]', () =>
  assert.equal(statusFor(-0.001, 0), 'Respond'));

/* ── statusFor: y row boundaries per the sealed thresholds ─────────────
 * y → row: y>5→0 · 2.5<y≤5→1 · 0<y≤2.5→2 · -2.5<y≤0→3 · -5<y≤-2.5→4 · y≤-5→5 */
t('y=5 is row 1, not row 0     (2.5<y≤5)', () =>
  assert.equal(statusFor(0, 5), 'Collaborate'));       // GRID[1][2]
t('y=5.001 is row 0            (y>5)', () =>
  assert.equal(statusFor(0, 5.001), 'Valuable Relationship'));
t('y=2.5 is row 2              (0<y≤2.5)', () =>
  assert.equal(statusFor(0, 2.5), 'Cooperate'));       // GRID[2][2]
t('y=2.501 is row 1            (2.5<y≤5)', () =>
  assert.equal(statusFor(0, 2.501), 'Collaborate'));
t('y=0 is row 3                (-2.5<y≤0)', () =>
  assert.equal(statusFor(-6, 0), 'Protect'));          // GRID[3][0]
t('y=-2.5 is row 4             (-5<y≤-2.5)', () =>
  assert.equal(statusFor(0, -2.5), 'Commit'));         // GRID[4][2]
t('y=-2.499 is row 3           (-2.5<y≤0)', () =>
  assert.equal(statusFor(0, -2.499), 'Cooperate'));
t('y=-5 is row 5               (y≤-5)', () =>
  assert.equal(statusFor(0, -5), 'Maintain'));         // GRID[5][2]
t('y=-4.999 is row 4           (-5<y≤-2.5)', () =>
  assert.equal(statusFor(0, -4.999), 'Commit'));

/* ── statusFor: x col boundaries ───────────────────────────────────────
 * x → col: x<-5→0 · -5≤x<0→1 · 0≤x<5→2 · x≥5→3 */
t('x=-5 is col 1, not col 0    (-5≤x<0)', () =>
  assert.equal(statusFor(-5, 10), 'Defend'));          // GRID[0][1]
t('x=-5.001 is col 0           (x<-5)', () =>
  assert.equal(statusFor(-5.001, 10), 'Proactively Defend'));
t('x=5 is col 3                (x≥5)', () =>
  assert.equal(statusFor(5, 5), 'High Value Relationship')); // GRID[1][3]
t('x=4.999 is col 2            (0≤x<5)', () =>
  assert.equal(statusFor(4.999, 5), 'Collaborate'));   // GRID[1][2]

/* ── statusFor: multi-cell zones from the sealed cell sets ─────────────── */
t('Defend covers {x<-5, 2.5<y≤5} too', () =>
  assert.equal(statusFor(-7, 4), 'Defend'));           // GRID[1][0]
t('Protect covers {x<-5, -2.5<y≤2.5}', () => {
  assert.equal(statusFor(-7, 2), 'Protect');           // GRID[2][0]
  assert.equal(statusFor(-7, -2), 'Protect');          // GRID[3][0]
});
t('Collaborate covers {x≥5, -2.5<y≤2.5}', () => {
  assert.equal(statusFor(7, 2), 'Collaborate');        // GRID[2][3]
  assert.equal(statusFor(7, -2), 'Collaborate');       // GRID[3][3]
});
t('Identify covers {x<0, -5<y≤-2.5} both cols', () => {
  assert.equal(statusFor(-7, -3), 'Identify');
  assert.equal(statusFor(-2, -3), 'Identify');
});
t('Commit covers {x≥0, -5<y≤-2.5} both cols', () => {
  assert.equal(statusFor(2, -3), 'Commit');
  assert.equal(statusFor(7, -3), 'Commit');
});

/* ── statusFor: inputs clamped to ±10 ─────────────────────────────────── */
t('inputs clamp to ±10 (99,99 → Strategic Partner; -99,-99 → Monitor)', () => {
  assert.equal(statusFor(99, 99), 'Strategic Partner');
  assert.equal(statusFor(-99, -99), 'Monitor');
});

/* ── weightedCoord: the sealed blend math ─────────────────────────────── */
const team = [
  { id: 'tm-a', userId: 'u-a', weight: 1.5 },
  { id: 'tm-b', userId: 'u-b', weight: 0.5 },
  { id: 'tm-c', userId: 'u-c', weight: 0 },
];

t('weighted blend: Σ(score·weight)/Σweight per axis', () => {
  const scores = { s1: { 'tm-a': { x: 2, y: 4 }, 'tm-b': { x: -2, y: 0 } } };
  // x = (2·1.5 + (−2)·0.5) / 2 = 1 · y = (4·1.5 + 0·0.5) / 2 = 3
  assert.deepEqual(weightedCoord('s1', scores, team), { x: 1, y: 3 });
});
t('weight 0 rater is skipped even though scored (weight ≤ 0 skipped)', () => {
  const scores = { s1: { 'tm-a': { x: 4, y: 4 }, 'tm-c': { x: -10, y: -10 } } };
  assert.deepEqual(weightedCoord('s1', scores, team), { x: 4, y: 4 });
});
t('unscored rater is excluded regardless of weight (no fake 0,0)', () => {
  const scores = { s1: { 'tm-b': { x: 6, y: -2 } } }; // tm-a (w 1.5) never scored
  assert.deepEqual(weightedCoord('s1', scores, team), { x: 6, y: -2 });
});
t('no scores at all → {x:0, y:0}', () =>
  assert.deepEqual(weightedCoord('s1', {}, team), { x: 0, y: 0 }));
t('every scorer at weight 0 → {x:0, y:0} (surviving total weight 0)', () => {
  const scores = { s1: { 'tm-c': { x: 5, y: 5 } } };
  assert.deepEqual(weightedCoord('s1', scores, team), { x: 0, y: 0 });
});
t('sealed sh-01 reference row lands in the positive/upper band', () => {
  const seedTeam = [
    { id: 'tm-alex', weight: 1.5 }, { id: 'tm-jordan', weight: 1.2 },
    { id: 'tm-sam', weight: 1.0 }, { id: 'tm-priya', weight: 0.8 },
    { id: 'tm-devon', weight: 0.7 },
  ];
  const scores = { 'sh-01': {
    'tm-alex': { x: 3, y: 8 }, 'tm-jordan': { x: 4, y: 9 },
    'tm-sam': { x: 2, y: 8 }, 'tm-priya': { x: 3, y: 8 },
    'tm-devon': { x: 2, y: 7 },
  } };
  const p = weightedCoord('sh-01', scores, seedTeam);
  assert.ok(p.x > 0 && p.y > 5, JSON.stringify(p));
  assert.equal(statusFor(p.x, p.y), 'Valuable Relationship');
});

/* ── coordToPct: corners + center (sealed formula) ─────────────────────── */
t('coordToPct(-10,10) → left 0%, top 0%', () =>
  assert.deepEqual(coordToPct(-10, 10), { left: '0%', top: '0%' }));
t('coordToPct(10,-10) → left 100%, top 100%', () =>
  assert.deepEqual(coordToPct(10, -10), { left: '100%', top: '100%' }));
t('coordToPct(0,0) → left 50%, top 50%', () =>
  assert.deepEqual(coordToPct(0, 0), { left: '50%', top: '50%' }));
t('pctToCoord inverts coordToPct', () =>
  assert.deepEqual(pctToCoord(75, 25), { x: 5, y: 5 }));

/* ── STATUS_ORDER + STATUSES metadata ─────────────────────────────────── */
t('STATUS_ORDER has length 14, sealed order', () => {
  assert.equal(STATUS_ORDER.length, 14);
  assert.deepEqual(STATUS_ORDER, [
    'Proactively Defend', 'Defend', 'Protect', 'Respond', 'Identify',
    'Monitor', 'Maintain', 'Connect', 'Commit', 'Cooperate', 'Collaborate',
    'Valuable Relationship', 'High Value Relationship', 'Strategic Partner',
  ]);
});
t('STATUSES covers exactly the 14 zones', () => {
  assert.deepEqual(Object.keys(STATUSES).sort(), [...STATUS_ORDER].sort());
});
t('every zone carries tone + token cssVar + inkVar + verbatim strategy/action', () => {
  for (const z of STATUS_ORDER) {
    const m = STATUSES[z];
    assert.ok(['negative', 'neutral-low', 'positive'].includes(m.tone), z);
    assert.match(m.cssVar, /^--ui-sys-zone-[a-z-]+$/, z);
    assert.match(m.inkVar, /^--ui-sys-zone-ink-[a-z-]+$/, z);
    assert.ok(m.strategy.length > 0 && m.action.length > 0, z);
    assert.ok(!/#[0-9a-fA-F]{3,8}/.test(JSON.stringify(m)), z + ' must carry NO hex');
  }
});
t('tone bands match the sealed spectrum (5 negative · 4 neutral-low · 5 positive)', () => {
  assert.deepEqual(STATUS_ORDER.map((z) => STATUSES[z].tone), [
    'negative', 'negative', 'negative', 'negative', 'negative',
    'neutral-low', 'neutral-low', 'neutral-low', 'neutral-low',
    'positive', 'positive', 'positive', 'positive', 'positive',
  ]);
});
t('only zones 1 and 14 carry a border token; extremes use on-strong ink', () => {
  assert.equal(STATUSES['Proactively Defend'].borderVar, '--ui-sys-zone-border-negative');
  assert.equal(STATUSES['Strategic Partner'].borderVar, '--ui-sys-zone-border-positive');
  assert.equal(STATUSES['Proactively Defend'].inkVar, '--ui-sys-zone-ink-on-strong');
  assert.equal(STATUSES['Strategic Partner'].inkVar, '--ui-sys-zone-ink-on-strong');
  for (const z of STATUS_ORDER.slice(1, 13)) {
    assert.equal(STATUSES[z].borderVar, undefined, z + ' must have NO border field');
  }
});
t('zone fill tokens match the sealed kebab-case names', () => {
  assert.equal(STATUSES['Strategic Partner'].cssVar, '--ui-sys-zone-strategic-partner');
  assert.equal(STATUSES['Valuable Relationship'].cssVar, '--ui-sys-zone-valuable-relationship');
  assert.equal(STATUSES['High Value Relationship'].cssVar, '--ui-sys-zone-high-value-relationship');
  assert.equal(STATUSES['Proactively Defend'].cssVar, '--ui-sys-zone-proactively-defend');
});

console.log(`\nAll ${n} assertions passed.`);
