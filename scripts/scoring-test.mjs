#!/usr/bin/env node
/* scoring-test.mjs — node asserts on the Scoring page's PURE logic
 * (src/app/pages/scoring-logic.js + src/app/data/workspace.js), expected
 * values taken FROM THE SEALED BOX TEXT ("Scoring & weighting — the team
 * matrix" + "Scoring cadence" + "Ecosystem" in src/guide.jsx).
 * Run: node scripts/scoring-test.mjs                                        */
import assert from 'node:assert/strict';
import {
  clampScore, stepScore, nextScoreRecord, orderedTeam, pctOfTeam, totalWeight,
  weightTint, weightReadout, axisDisplay, teammateCandidates,
  purgeMemberScores, canRemoveMember, isUnscoredBy, unscoredCountFor,
} from '../src/app/pages/scoring-logic.js';
import {
  visibleStakeholders, createJoinFor, workspaceLabel, countForWorkspace,
  stakeholderCountLabel, MASTER_WORKSPACE_ID,
} from '../src/app/data/workspace.js';
import { weightedCoord } from '../src/app/data/engine.js';

let passed = 0;
const ok = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name); };

console.log('scoring-test: sealed Scoring-matrix pure logic\n');

/* ── CLAMP (sealed: "a non-numeric entry becomes 0; anything out of range
 * snaps to the nearest bound … clamp NEVER ROUNDS") ───────────────────────── */
ok('clamp: non-numeric → 0', () => {
  assert.equal(clampScore('abc'), 0);
  assert.equal(clampScore(undefined), 0);
  // Number('') === 0 — the sealed clamp path, not a NaN case
  assert.equal(clampScore(''), 0);
});
ok('clamp: out-of-range snaps to the nearest bound', () => {
  assert.equal(clampScore(12), 10);
  assert.equal(clampScore(-14), -10);
  assert.equal(clampScore('99'), 10);
});
ok('clamp NEVER rounds (sealed oracle truth: typed 2.5 persists as 2.5)', () => {
  assert.equal(clampScore('2.5'), 2.5);
  assert.equal(clampScore(-9.9), -9.9);
});
ok('steppers: ±1 clamped to [-10,10]; unscored axis steps from 0', () => {
  assert.equal(stepScore(3, 1), 4);
  assert.equal(stepScore(10, 1), 10);   // clamped at the top bound
  assert.equal(stepScore(-10, -1), -10); // clamped at the bottom bound
  assert.equal(stepScore(undefined, 1), 1); // unscored → steps from 0
  assert.equal(stepScore(undefined, -1), -1);
});

/* ── FIRST-TOUCH CORRECTION (sealed EDITABLE-CELL RULE; the oracle's
 * {x:0,y:0}-spread-on-read is DO-NOT-REPLICATE) ────────────────────────────── */
ok('first touch creates the record WHOLE: entered axis + 0 on the untouched axis', () => {
  const rec = nextScoreRecord(undefined, 'x', 7, 'T1');
  assert.deepEqual(rec, { x: 7, y: 0, createdAt: 'T1', updatedAt: 'T1' });
});
ok('first touch of y: x is the 0-filled untouched axis', () => {
  const rec = nextScoreRecord(null, 'y', -3, 'T1');
  assert.equal(rec.x, 0);
  assert.equal(rec.y, -3);
});
ok('later edits patch ONE axis and restamp updatedAt only (createdAt = first)', () => {
  const first = nextScoreRecord(undefined, 'x', 5, 'T1');
  const second = nextScoreRecord(first, 'y', 2, 'T2');
  assert.deepEqual(second, { x: 5, y: 2, createdAt: 'T1', updatedAt: 'T2' });
});
ok('entered values run through the clamp (12 → 10) on create and edit', () => {
  assert.equal(nextScoreRecord(undefined, 'x', 12, 'T').x, 10);
  assert.equal(nextScoreRecord({ x: 1, y: 1, createdAt: 'T0', updatedAt: 'T0' }, 'y', '-99', 'T1').y, -10);
});

/* ── TEAM-BAR ORDERING (sealed: logged-in user first, then workspace owners
 * by workspaceOwners index, then the rest in original order) ──────────────── */
const TEAM = [
  { id: 'tm-a', userId: 'u-a', weight: 1.5 },
  { id: 'tm-b', userId: 'u-b', weight: 1.2 },
  { id: 'tm-c', userId: 'u-c', weight: 1.0 },
  { id: 'tm-d', userId: 'u-d', weight: 0.8 },
];
ok('ordering: me → owners in listed order → rest in original order', () => {
  const out = orderedTeam(TEAM, 'u-c', ['u-d', 'u-a']);
  assert.deepEqual(out.map((m) => m.id), ['tm-c', 'tm-d', 'tm-a', 'tm-b']);
});
ok('ordering: an owner who is also me is not duplicated', () => {
  const out = orderedTeam(TEAM, 'u-a', ['u-a', 'u-b']);
  assert.deepEqual(out.map((m) => m.id), ['tm-a', 'tm-b', 'tm-c', 'tm-d']);
});
ok('ordering: no matching me-row leaves owners-then-rest', () => {
  const out = orderedTeam(TEAM, 'u-zzz', ['u-b']);
  assert.deepEqual(out.map((m) => m.id), ['tm-b', 'tm-a', 'tm-c', 'tm-d']);
});

/* ── % OF TEAM (sealed EXACT FORMULA incl. the 0-total fallback) ───────────── */
ok('pct = Math.round(weight/totalW*100), integer', () => {
  assert.equal(pctOfTeam(1.5, 4.5), 33);  // 33.33 → 33
  assert.equal(pctOfTeam(1.0, 3.0), 33);
  assert.equal(pctOfTeam(2.0, 3.0), 67);  // 66.67 → 67
});
ok('pct renders 0 when the total team weight is 0 (sealed fallback)', () => {
  assert.equal(pctOfTeam(0, 0), 0);
});
ok('totalWeight sums (weight ?? 0)', () => {
  assert.equal(totalWeight([{ weight: 1.5 }, { weight: 0.5 }, {}]), 2);
});
ok('tri-color tint: ===1 baseline · >1 over · <1 under (sealed key)', () => {
  assert.equal(weightTint(1), 'baseline');
  assert.equal(weightTint(1.1), 'over');
  assert.equal(weightTint(0.9), 'under');
  assert.equal(weightTint(0), 'under');
});
ok('weight readout "{(weight ?? 0).toFixed(1)}×" (sealed format)', () => {
  assert.equal(weightReadout(1), '1.0×');
  assert.equal(weightReadout(undefined), '0.0×');
  assert.equal(weightReadout(1.25), '1.3×');
});

/* ── UNSCORED SEMANTICS (sealed cadence box: no record = unscored; a
 * DELIBERATE (0,0) record counts as SCORED; falsy member id guard) ─────────── */
const SCORES = {
  's1': { 'tm-a': { x: 0, y: 0 }, 'tm-b': { x: 3, y: 4 } },
  's2': { 'tm-b': { x: 1, y: 1 } },
};
ok('isUnscoredBy: deliberate (0,0) counts as SCORED', () => {
  assert.equal(isUnscoredBy(SCORES, 's1', 'tm-a'), false);
});
ok('isUnscoredBy: no record = unscored', () => {
  assert.equal(isUnscoredBy(SCORES, 's2', 'tm-a'), true);
});
ok('isUnscoredBy: falsy team-member id can never mark unscored (guard)', () => {
  assert.equal(isUnscoredBy(SCORES, 's2', undefined), false);
});
ok('unscoredCountFor: guards a user with NO team-member row → 0', () => {
  const team = [{ id: 'tm-a', userId: 'u-a', weight: 1 }];
  const shs = [{ id: 's1' }, { id: 's2' }];
  assert.equal(unscoredCountFor(shs, SCORES, team, 'u-nobody'), 0);
  assert.equal(unscoredCountFor(shs, SCORES, team, 'u-a'), 1); // s2 unscored by tm-a
});

/* ── BLEND EXCLUSIONS at the page-cell level (engine.weightedCoord is its own
 * suite; here: the sealed unscored-exclusion + weight-0 exclusion drive the
 * page's Weighted column) ──────────────────────────────────────────────────── */
ok('unscored raters are EXCLUDED from the blend (never a fake 0,0)', () => {
  const team = [
    { id: 'tm-a', userId: 'u-a', weight: 1 },
    { id: 'tm-b', userId: 'u-b', weight: 1 },
  ];
  // only tm-b scored s2 → the blend is exactly tm-b's score
  const pos = weightedCoord('s2', SCORES, team);
  assert.deepEqual(pos, { x: 1, y: 1 });
});
ok('weight 0 excludes a scorer but keeps them on the team (sealed)', () => {
  const team = [
    { id: 'tm-a', userId: 'u-a', weight: 0 },
    { id: 'tm-b', userId: 'u-b', weight: 2 },
  ];
  const pos = weightedCoord('s1', SCORES, team);
  assert.deepEqual(pos, { x: 3, y: 4 }); // tm-a's (0,0) at weight 0 drops out
});
ok('axis display: one decimal, valence tone (x>=0 pos else neg)', () => {
  assert.deepEqual(axisDisplay(3.456), { text: '3.5', tone: 'pos' });
  assert.deepEqual(axisDisplay(0), { text: '0.0', tone: 'pos' });
  assert.deepEqual(axisDisplay(-2.04), { text: '-2.0', tone: 'neg' });
});

/* ── TEAM MUTATION HELPERS ─────────────────────────────────────────────────── */
ok('add-teammate candidates exclude the team AND role system (sealed)', () => {
  const users = [
    { id: 'u-a', role: 'manager' },
    { id: 'u-x', role: 'member' },
    { id: 'u-system', role: 'system' },
  ];
  const team = [{ id: 'tm-a', userId: 'u-a' }];
  assert.deepEqual(teammateCandidates(users, team).map((u) => u.id), ['u-x']);
});
ok('removing a member purges their scores from EVERY stakeholder (sealed)', () => {
  const next = purgeMemberScores(SCORES, 'tm-b');
  assert.deepEqual(next['s1'], { 'tm-a': { x: 0, y: 0 } });
  assert.deepEqual(next['s2'], {});
});
ok('remove gate (sealed correction): manager any · member only self', () => {
  const mgr = { id: 'u-m', role: 'manager' };
  const mem = { id: 'u-x', role: 'member' };
  const rowSelf = { id: 'tm-x', userId: 'u-x' };
  const rowOther = { id: 'tm-y', userId: 'u-y' };
  assert.equal(canRemoveMember(mgr, rowOther), true);
  assert.equal(canRemoveMember(mem, rowSelf), true);
  assert.equal(canRemoveMember(mem, rowOther), false);
  assert.equal(canRemoveMember(null, rowSelf), false);
});

/* ── WORKSPACE SCOPING (sealed Ecosystem box) ──────────────────────────────── */
const SHS = [{ id: 's1' }, { id: 's2' }, { id: 's3' }];
const JOIN = { s1: ['w1'], s2: ['w1', 'w2'], s3: [] };
ok('Master = the union of ALL stakeholders (sealed)', () => {
  assert.equal(visibleStakeholders(SHS, JOIN, MASTER_WORKSPACE_ID).length, 3);
});
ok('a workspace shows ONLY join-included stakeholders (sealed)', () => {
  assert.deepEqual(visibleStakeholders(SHS, JOIN, 'w1').map((s) => s.id), ['s1', 's2']);
  assert.deepEqual(visibleStakeholders(SHS, JOIN, 'w2').map((s) => s.id), ['s2']);
});
ok('create join rule: workspace → auto-assigned · Master → unassigned (sealed)', () => {
  assert.deepEqual(createJoinFor('w1'), ['w1']);
  assert.deepEqual(createJoinFor(MASTER_WORKSPACE_ID), []);
  assert.deepEqual(createJoinFor(MASTER_WORKSPACE_ID, 'w9'), ['w9']); // forceWorkspaceId wins
});
ok('workspaceLabel: sealed master literal + "-" missing-record fallback', () => {
  assert.equal(workspaceLabel([], MASTER_WORKSPACE_ID), 'Master · All stakeholders');
  assert.equal(workspaceLabel([{ id: 'w1', name: 'Hawk' }], 'w1'), 'Hawk');
  assert.equal(workspaceLabel([], 'w-gone'), '-');
});
ok('per-workspace count + sealed singular/plural copy', () => {
  assert.equal(countForWorkspace(JOIN, 'w1'), 2);
  assert.equal(stakeholderCountLabel(1), '1 stakeholder');
  assert.equal(stakeholderCountLabel(2), '2 stakeholders');
});

console.log(`\nscoring-test: all ${passed} assertions passed`);
