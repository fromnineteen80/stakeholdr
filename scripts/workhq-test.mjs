#!/usr/bin/env node
/* workhq-test.mjs — node asserts on the workHQ band's PURE signal logic
 * (src/app/pages/workhq-logic.js), with expected values taken from the SEALED
 * BOX TEXT ("workHQ (IntelPanel) — the workspace intelligence band") and the
 * USER RULINGS of 2026-07-05 (four cards · High-gated cold · first-class
 * per-user ignores · capped previews). The sealed NEEDS-YOUR-SCORE BUG is
 * asserted AS FIXED: the canonical team-member-keyed predicate must disagree
 * with the oracle's user-id-keyed formula on the id-mismatch fixture.
 */
import assert from 'node:assert/strict';
import {
  COLD_DAYS, CARD_KEYS, daysSince, coldStakeholders, needsScoreList,
  awaitingVotes, VOTE_STAGES, relationshipMix, MIX_POSITIVE_ZONES,
  MIX_NEGATIVE_ZONES, activePlansFor, developments, devLabel, devKey, nameOf,
  summaryBits, summaryLine, ALL_CLEAR, CARD_CAPS, capFor,
  userIgnores, withIgnores, withoutIgnore, splitIgnored,
} from '../src/app/pages/workhq-logic.js';
import { statusFor } from '../src/app/data/engine.js';

let passed = 0;
const ok = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name); };

console.log('workhq-test: sealed workHQ signals + 2026-07-05 rulings\n');

/* ── constants (sealed) ─────────────────────────────────────────────────── */
ok('COLD_DAYS is the sealed 90', () => assert.equal(COLD_DAYS, 90));
ok('the ruled four card keys', () =>
  assert.deepEqual(CARD_KEYS, ['alerts', 'needs-score', 'votes', 'cold']));

/* ── daysSince (sealed formula) ─────────────────────────────────────────── */
const NOW = new Date('2026-07-05T12:00:00'); // local noon
ok('daysSince: falsy → Infinity', () => {
  assert.equal(daysSince('', NOW), Infinity);
  assert.equal(daysSince(null, NOW), Infinity);
  assert.equal(daysSince(undefined, NOW), Infinity);
});
ok('daysSince: unparseable → Infinity', () =>
  assert.equal(daysSince('not-a-date', NOW), Infinity));
ok('daysSince: ISO date-ONLY parses as LOCAL midnight (the sealed T00:00:00 append)', () => {
  // 2026-07-02 local midnight → 3 whole days before local noon 2026-07-05.
  // Without the normalization a bare ISO date parses as UTC and western
  // timezones read a day off (the sealed rationale).
  assert.equal(daysSince('2026-07-02', NOW), 3);
  assert.equal(daysSince('2026-07-05', NOW), 0);
});
ok('daysSince: full ISO timestamps parse directly (Math.floor whole days)', () =>
  assert.equal(daysSince('2026-07-03T18:00:00', NOW), 1));

/* ── COLD (sealed signal + ruling B: High-gated, stalest first) ─────────── */
const coldFixture = [
  { id: 'a', name: 'High-stale-120', priority: 'High', lastContact: '2026-03-07' },   // 120d
  { id: 'b', name: 'High-stale-90', priority: 'High', lastContact: '2026-04-06' },    // 90d — boundary IN
  { id: 'c', name: 'High-fresh-89', priority: 'High', lastContact: '2026-04-07' },    // 89d — OUT
  { id: 'd', name: 'Medium-stale', priority: 'Medium', lastContact: '2025-12-01' },   // stale but NOT High — OUT (ruling B)
  { id: 'e', name: 'Low-stale', priority: 'Low', lastContact: '2025-11-01' },         // OUT
  { id: 'f', name: 'High-never', priority: 'High', lastContact: '' },                 // Infinity-stale — IN, leads
];
ok('cold: ONLY High-priority AND >= 90 days (boundary inclusive; no folded count below High)', () => {
  const ids = coldStakeholders(coldFixture, NOW).map((s) => s.id);
  assert.deepEqual(new Set(ids), new Set(['a', 'b', 'f']));
  assert.ok(!ids.includes('d') && !ids.includes('e'), 'sub-High stale must NOT appear');
  assert.ok(!ids.includes('c'), '89 days is not cold');
});
ok('cold: sorted stalest first (missing lastContact = Infinity leads)', () => {
  const ids = coldStakeholders(coldFixture, NOW).map((s) => s.id);
  assert.deepEqual(ids, ['f', 'a', 'b']);
});

/* ── NEED YOUR SCORE — the canonical predicate vs the sealed BUG ────────── */
// The id-mismatch fixture: user ids u-*, team-member ids tm-* (as in every
// seed row — the exact condition under which the oracle's formula misfires).
const team = [{ id: 'tm-1', userId: 'u-1', weight: 1 }];
const shs = [{ id: 'sh-a', name: 'A' }, { id: 'sh-b', name: 'B' }];
const scores = {
  'sh-a': { 'tm-1': { x: 3, y: 4 } },   // scored by u-1's team member
  'sh-b': {},                            // unscored
};
// The sealed VERIFIED BUG, reproduced HERE ONLY as the regression foil
// (DO-NOT-REPLICATE — this formula must never appear in app code):
const buggyNeedsScore = (stakeholders, sc, currentUser) =>
  currentUser ? stakeholders.filter((s) => !((sc[s.id] || {})[currentUser.id])) : [];
ok('canonical: resolves currentUser → team member and reads scores[s.id][tm.id]', () => {
  const got = needsScoreList(shs, scores, team, 'u-1').map((s) => s.id);
  assert.deepEqual(got, ['sh-b']);
});
ok('THE FIX: the canonical predicate DISAGREES with the sealed buggy user-id lookup', () => {
  const buggy = buggyNeedsScore(shs, scores, { id: 'u-1' }).map((s) => s.id);
  assert.deepEqual(buggy, ['sh-a', 'sh-b'], 'the oracle formula misses the tm-keyed record and reports everything unscored');
  const canonical = needsScoreList(shs, scores, team, 'u-1').map((s) => s.id);
  assert.notDeepEqual(canonical, buggy);
  assert.deepEqual(canonical, ['sh-b']);
});
ok('canonical: a deliberate (0,0) record counts as SCORED (sealed unscored ≠ (0,0))', () => {
  const sc = { 'sh-a': { 'tm-1': { x: 0, y: 0 } } };
  assert.deepEqual(needsScoreList([shs[0]], sc, team, 'u-1'), []);
});
ok('canonical guards: no currentUser / no team-member row → [] (never marks unscored)', () => {
  assert.deepEqual(needsScoreList(shs, scores, team, null), []);
  assert.deepEqual(needsScoreList(shs, scores, team, 'u-ghost'), []);
  assert.deepEqual(needsScoreList(shs, scores, [], 'u-1'), []);
});

/* ── AWAITING YOUR VOTE (sealed stages + user-keyed votes) ──────────────── */
const communityFx = [
  { id: 'ca-1', name: 'P-unvoted', stage: 'Proposed', votes: {} },
  { id: 'ca-2', name: 'UR-unvoted', stage: 'Under Review', votes: { 'u-2': 'for' } },
  { id: 'ca-3', name: 'UR-voted', stage: 'Under Review', votes: { 'u-1': 'against' } },
  { id: 'ca-4', name: 'Approved', stage: 'Approved', votes: {} },
  { id: 'ca-5', name: 'Active', stage: 'Active', votes: {} },
];
ok('votes: stage ∈ [Proposed, Under Review] AND my vote absent (votes keyed by USER id)', () => {
  assert.deepEqual(VOTE_STAGES, ['Proposed', 'Under Review']);
  const got = awaitingVotes(communityFx, 'u-1').map((a) => a.id);
  assert.deepEqual(got, ['ca-1', 'ca-2']);
});
ok('votes: no currentUser → []', () =>
  assert.deepEqual(awaitingVotes(communityFx, null), []));

/* ── RELATIONSHIP MIX (the sealed 5+5 zone arrays, verbatim) ────────────── */
ok('the sealed POS/NEG zone arrays are verbatim', () => {
  assert.deepEqual(MIX_POSITIVE_ZONES,
    ['Cooperate', 'Collaborate', 'Valuable Relationship', 'High Value Relationship', 'Strategic Partner']);
  assert.deepEqual(MIX_NEGATIVE_ZONES,
    ['Proactively Defend', 'Defend', 'Protect', 'Respond', 'Identify']);
});
ok('mix classifies via the ONE engine weightedCoord/statusFor', () => {
  const t = [{ id: 'tm-1', userId: 'u-1', weight: 1 }];
  const sc = {
    pos: { 'tm-1': { x: 8, y: 8 } },   // Strategic Partner → positive
    neg: { 'tm-1': { x: -8, y: 8 } },  // Proactively Defend → negative
    win: { 'tm-1': { x: 2, y: -6 } },  // Maintain → winnable
  };
  assert.equal(statusFor(8, 8), 'Strategic Partner');
  assert.equal(statusFor(-8, 8), 'Proactively Defend');
  assert.equal(statusFor(2, -6), 'Maintain');
  const mix = relationshipMix(
    [{ id: 'pos' }, { id: 'neg' }, { id: 'win' }], sc, t);
  assert.deepEqual(mix, { positive: 1, winnable: 1, negative: 1 });
});
ok('mix: the unscored fallback (0,0) lands in Cooperate → positive (sealed engine)', () => {
  // weightedCoord with no scorers = {0,0}; statusFor(0,0): row 0<y? no… y=0 →
  // row 3 (−2.5<y≤0), col 2 (0≤x<5) → Cooperate (GRID[3][2]).
  assert.equal(statusFor(0, 0), 'Cooperate');
  const mix = relationshipMix([{ id: 'zz' }], {}, [{ id: 'tm-1', userId: 'u-1', weight: 1 }]);
  assert.deepEqual(mix, { positive: 1, winnable: 0, negative: 0 });
});

/* ── ACTIVE PLANS (sealed scope formula — no status filter) ─────────────── */
const plansFx = [
  { id: 'p1', workspaceId: 'ws-1', status: 'Active' },
  { id: 'p2', workspaceId: 'ws-2', status: 'Draft' },
];
ok('plans: master → all; workspace → scoped (status NOT filtered, sealed)', () => {
  assert.deepEqual(activePlansFor(plansFx, true, '__master').map((p) => p.id), ['p1', 'p2']);
  assert.deepEqual(activePlansFor(plansFx, false, 'ws-2').map((p) => p.id), ['p2']);
  assert.deepEqual(activePlansFor(null, false, 'ws-9'), []);
});

/* ── DEVELOPMENTS (sealed flatten + newest first + devLabel) ────────────── */
const devSh = [
  {
    id: 'sh-1', name: 'Mayor Chen',
    notesHistory: [
      { id: 'n-1', body: 'Old note', at: '2026-06-01T10:00:00.000Z', by: 'u-1' },
      { id: 'n-2', body: 'A body of exactly forty characters !!!!!', at: '2026-07-01T10:00:00.000Z', by: 'u-2' },
    ],
  },
  {
    id: 'sh-2', isPerson: true, firstName: 'Rita', lastName: 'Ng', title: 'Dr.',
    name: 'Rita Ng',
    notesHistory: [
      { id: 'n-3', body: 'This development body runs well past the forty character slice point', at: '2026-06-15T10:00:00.000Z', by: null },
    ],
  },
  { id: 'sh-3', name: 'No notes', notesHistory: [] },
];
ok('developments: flattened {at, body, who, stakeholder}, newest first', () => {
  const d = developments(devSh);
  assert.equal(d.length, 3);
  assert.deepEqual(d.map((x) => x.note.id), ['n-2', 'n-3', 'n-1']);
  assert.equal(d[0].who, 'u-2');
  assert.equal(d[0].stakeholder.id, 'sh-1');
});
ok('devLabel: "{name}: {body.slice(0,40)}" + "…" ONLY past 40 chars', () => {
  const d = developments(devSh);
  const exact40 = d.find((x) => x.note.id === 'n-2');
  assert.equal(exact40.body.length, 40);
  assert.equal(devLabel(exact40), 'Mayor Chen: A body of exactly forty characters !!!!!');
  const long = d.find((x) => x.note.id === 'n-3');
  assert.equal(devLabel(long),
    nameOf(devSh[1]) + ': ' + long.body.slice(0, 40) + '…');
});
ok('devKey (ruling C): stable — "{shId}|{noteId}", at-stamp fallback', () => {
  const d = developments(devSh);
  assert.equal(devKey(d[0]), 'sh-1|n-2');
  const noId = { at: '2026-01-01T00:00:00.000Z', body: 'x', note: { body: 'x' }, stakeholder: { id: 'sh-9' } };
  assert.equal(devKey(noId), 'sh-9|2026-01-01T00:00:00.000Z');
});

/* ── SUMMARY (sealed join, post-ignore counts) ──────────────────────────── */
ok('summary bits + join are the sealed strings', () => {
  assert.deepEqual(summaryBits(2, 3, 1), [
    '2 high-priority going cold', '3 need your score', '1 awaiting your vote',
  ]);
  assert.equal(summaryLine(2, 3, 1),
    '2 high-priority going cold · 3 need your score · 1 awaiting your vote');
  assert.equal(summaryLine(0, 3, 0), '3 need your score');
});
ok('summary all-clear (sealed verbatim)', () => {
  assert.equal(ALL_CLEAR, 'All clear — nothing needs attention.');
  assert.equal(summaryLine(0, 0, 0), ALL_CLEAR);
});

/* ── CAPS (sealed 12/5 wide · 8/4 narrow; cold declared onto narrow) ────── */
ok('sealed slice caps hold', () => {
  assert.deepEqual(CARD_CAPS.alerts, { intel: 12, other: 5 });
  assert.deepEqual(CARD_CAPS['needs-score'], { intel: 12, other: 5 });
  assert.deepEqual(CARD_CAPS.votes, { intel: 8, other: 4 });
  assert.deepEqual(CARD_CAPS.cold, { intel: 8, other: 4 });
  assert.equal(capFor('alerts', 'intel'), 12);
  assert.equal(capFor('alerts', 'split'), 5);
  assert.equal(capFor('votes', 'intel'), 8);
  assert.equal(capFor('cold', 'table'), 4);
});

/* ── IGNORES (ruling C: per-user shape · apply BEFORE counting) ─────────── */
ok('persistence shape: { userId → { cardKey → [entryKey] } }', () => {
  let all = {};
  all = withIgnores(all, 'u-1', 'cold', ['sh-1']);
  assert.deepEqual(all, { 'u-1': { cold: ['sh-1'] } });
  all = withIgnores(all, 'u-1', 'cold', ['sh-2', 'sh-1']); // dedupes
  assert.deepEqual(all['u-1'].cold.sort(), ['sh-1', 'sh-2']);
  all = withIgnores(all, 'u-2', 'votes', ['ca-1']);        // per-user isolation
  assert.deepEqual(all['u-1'].cold.sort(), ['sh-1', 'sh-2']);
  assert.deepEqual(all['u-2'], { votes: ['ca-1'] });
  assert.deepEqual(userIgnores(all, 'u-2'), { votes: ['ca-1'] });
  assert.deepEqual(userIgnores(all, 'u-ghost'), {});
});
ok('withoutIgnore un-ignores exactly one key', () => {
  let all = withIgnores({}, 'u-1', 'cold', ['sh-1', 'sh-2']);
  all = withoutIgnore(all, 'u-1', 'cold', 'sh-1');
  assert.deepEqual(all['u-1'].cold, ['sh-2']);
});
ok('no-user guard: ignore writes are no-ops without a signed-in user', () => {
  assert.deepEqual(withIgnores({}, null, 'cold', ['sh-1']), {});
  assert.deepEqual(withoutIgnore({}, undefined, 'cold', 'sh-1'), {});
});
ok('splitIgnored partitions BEFORE counting; an ignored item never resurfaces', () => {
  const entries = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  const { visible, ignored } = splitIgnored(entries, (e) => e.id, ['b']);
  assert.deepEqual(visible.map((e) => e.id), ['a', 'c']);
  assert.deepEqual(ignored.map((e) => e.id), ['b']);
});
ok('stale ignore keys drop out (a deleted item never haunts the review list)', () => {
  const entries = [{ id: 'a' }];
  const { visible, ignored } = splitIgnored(entries, (e) => e.id, ['gone-id']);
  assert.deepEqual(visible.map((e) => e.id), ['a']);
  assert.deepEqual(ignored, []);
});
ok('headline counts reflect un-ignored items only (ruling C, end-to-end)', () => {
  const all = withIgnores({}, 'u-1', 'cold', ['a']);
  const cold = [{ id: 'a' }, { id: 'b' }];
  const { visible } = splitIgnored(cold, (s) => s.id, userIgnores(all, 'u-1').cold);
  assert.equal(visible.length, 1);
  assert.equal(summaryLine(visible.length, 0, 0), '1 high-priority going cold');
});

/* ── nameOf (sealed: displayName || name) ───────────────────────────────── */
ok('nameOf: displayName first, raw name fallback', () => {
  assert.equal(nameOf({ isPerson: true, title: 'Dr.', firstName: 'Rita', lastName: 'Ng', name: 'x' }), 'Dr. Rita Ng');
  assert.equal(nameOf({ name: 'Save Our River Coalition' }), 'Save Our River Coalition');
});

console.log(`\nworkhq-test: ${passed} assertions passed`);
