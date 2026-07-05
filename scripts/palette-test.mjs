#!/usr/bin/env node
/* palette-test.mjs — node asserts on the command palette's PURE logic
 * (src/app/palette-logic.js), with expected values taken from the SEALED BOX
 * TEXT ("Command palette (⌘K) — global search across 5 entity types",
 * src/guide.jsx ~3993–4060) and the App-shell paletteGo contract (~1800–1817,
 * census A19–A24): the per-type match surfaces, the group iteration order
 * (the only ranking), the 24-row combined cap, the system-user exclusion,
 * the keyboard clamps, and the sealed strings.
 */
import assert from 'node:assert/strict';
import {
  paletteMatch, paletteResults, activeDown, activeUp,
  PALETTE_STR, PALETTE_CAP, PALETTE_KINDS,
} from '../src/app/palette-logic.js';
import { SITES, siteLabel } from '../src/app/data/catalogs.js';

let passed = 0;
const ok = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name); };

console.log('palette-test: sealed ⌘K matching / order / cap / strings\n');

/* ── sealed strings + constants ─────────────────────────────────────────── */
ok('sealed placeholder', () => assert.equal(
  PALETTE_STR.placeholder, 'Search names, orgs, tags, issues, sites, states…'));
ok('sealed empty copy "No matches."', () => assert.equal(PALETTE_STR.empty, 'No matches.'));
ok('sealed commit label "Enter"', () => assert.equal(PALETTE_STR.go, 'Enter'));
ok('sealed cap = 24 rows combined', () => assert.equal(PALETTE_CAP, 24));
ok('the five sealed type labels map to the paletteGo kind codes', () =>
  assert.deepEqual(PALETTE_KINDS, {
    Stakeholder: 'stakeholder', Plan: 'plan', Community: 'community',
    Workspace: 'workspace', Person: 'user',
  }));

/* ── paletteMatch (sealed: non-empty ql + case-insensitive substring) ───── */
ok('match: empty query matches NOTHING (falsy ql)', () => {
  assert.equal(paletteMatch('', 'anything'), false);
  assert.equal(paletteMatch('', ''), false);
});
ok('match: case-insensitive substring; null-safe target', () => {
  assert.equal(paletteMatch('may', 'Mayor Maria Chen'.toLowerCase()), true);
  assert.equal(paletteMatch('may', (null || '').toLowerCase()), false);
});

/* ── fixtures ───────────────────────────────────────────────────────────── */
const workspaces = [
  { id: 'w1', name: 'Hawk', businessUnit: 'Legal / GA&PP' },
  { id: 'w2', name: 'Imagine Event', businessUnit: 'Commercial PCs' },
];
const stakeholders = [
  { id: 's1', isPerson: true, firstName: 'Maria', lastName: 'Chen', title: 'Mayor',
    name: 'legacy-ignored', org: 'City of Palo Alto', type: 'Government',
    state: 'California', site: 'site-paloalto',
    tags: ['public-official', 'key-influencer'], issues: ['Sustainability'] },
  { id: 's2', name: 'Cascade Manufacturing Council', org: 'CMC', type: 'Trade Association',
    state: 'Oregon', tags: [], issues: ['Taxation'] },
  { id: 's3', name: 'Quiet Org', org: 'Nothing Matches Here', type: 'NGO', state: '' },
];
const plans = [
  { id: 'p1', title: 'Hawk Engagement Plan', workspaceId: 'w1' },
  { id: 'p2', title: 'Orphan Plan', workspaceId: 'w-gone' },
];
const community = [
  { id: 'c1', name: 'Cedarville STEM Classroom Grant', recipient: 'Cedarville Unified School District', kind: 'Philanthropy' },
  { id: 'c2', name: 'River Cleanup Day', recipient: 'Watershed Alliance', kind: 'Volunteering' },
];
const users = [
  { id: 'u1', name: 'Alex Rivera', title: 'Director, Government Affairs', role: 'manager' },
  { id: 'u2', name: 'Jordan Kim', title: 'Public Policy Lead', role: 'manager' },
  { id: 'u3', name: 'Reminders', title: 'Automated reminders', role: 'system' },
];
const DATA = { stakeholders, plans, community, workspaces, users, sites: SITES };

/* ── empty / whitespace query ───────────────────────────────────────────── */
ok('empty query → [] (the results block never renders)', () => {
  assert.deepEqual(paletteResults('', DATA), []);
  assert.deepEqual(paletteResults('   ', DATA), []);
  assert.deepEqual(paletteResults(null, DATA), []);
});

/* ── stakeholder match surface (the sealed eight fields) ────────────────── */
const firstHit = (q) => paletteResults(q, DATA)[0];
ok('stakeholder by display name (person recomposition, never s.name for a person)', () => {
  const r = firstHit('maria chen');
  assert.deepEqual(r, { type: 'Stakeholder', kind: 'stakeholder', id: 's1',
    label: 'Mayor Maria Chen', sub: 'City of Palo Alto' });
});
ok('stakeholder by org', () => assert.equal(firstHit('city of palo').id, 's1'));
ok('stakeholder by type', () => assert.equal(firstHit('trade assoc').id, 's2'));
ok('stakeholder by state', () => assert.equal(firstHit('californ').id, 's1'));
ok('stakeholder by resolved SITE LABEL (siteLabel(site), e.g. "Palo Alto, CA")', () => {
  const label = siteLabel(SITES.find((x) => x.id === 'site-paloalto'));
  assert.equal(label, 'Palo Alto, CA'); // the sealed City, STATE_ABBR tail
  assert.equal(firstHit('palo alto, ca').id, 's1');
});
ok('stakeholder by site COUNTRY', () => assert.equal(firstHit('united states').id, 's1'));
ok('stakeholder by tag', () => assert.equal(firstHit('key-influencer').id, 's1'));
ok('stakeholder by issue', () => assert.equal(firstHit('taxation').id, 's2'));
ok('no site assigned → site fields never match (no phantom hits)', () =>
  assert.equal(paletteResults('palo alto, ca', { ...DATA, stakeholders: [stakeholders[1]] }).length, 0));
ok('unknown site id → {} resolution, no crash, no match', () => {
  const s = { id: 'sx', name: 'X', site: 'site-nope' };
  assert.deepEqual(paletteResults('palo', { ...DATA, stakeholders: [s], plans: [], community: [], workspaces: [], users: [] }), []);
});

/* ── the other four groups ──────────────────────────────────────────────── */
ok('plan by title; sub = the workspace NAME', () => {
  const r = paletteResults('engagement plan', DATA).find((x) => x.type === 'Plan');
  assert.deepEqual(r, { type: 'Plan', kind: 'plan', id: 'p1', label: 'Hawk Engagement Plan', sub: 'Hawk' });
});
ok('plan with a missing workspace → sub undefined (the sealed ||{} guard, no crash)', () => {
  const r = paletteResults('orphan', DATA).find((x) => x.type === 'Plan');
  assert.equal(r.sub, undefined);
});
ok('community by name; sub = kind', () => {
  const r = paletteResults('stem classroom', DATA)[0];
  assert.deepEqual(r, { type: 'Community', kind: 'community', id: 'c1',
    label: 'Cedarville STEM Classroom Grant', sub: 'Philanthropy' });
});
ok('community by RECIPIENT (label stays c.name)', () => {
  const r = paletteResults('unified school district', DATA)[0];
  assert.equal(r.id, 'c1');
  assert.equal(r.label, 'Cedarville STEM Classroom Grant');
});
ok('workspace by name; sub = businessUnit', () => {
  const r = paletteResults('imagine', DATA)[0];
  assert.deepEqual(r, { type: 'Workspace', kind: 'workspace', id: 'w2',
    label: 'Imagine Event', sub: 'Commercial PCs' });
});
ok('person by name and by TITLE; sub = title', () => {
  assert.deepEqual(paletteResults('jordan', DATA)[0], {
    type: 'Person', kind: 'user', id: 'u2', label: 'Jordan Kim', sub: 'Public Policy Lead' });
  assert.equal(paletteResults('public policy', DATA)[0].id, 'u2');
});
ok('the system user is EXCLUDED (sealed filter)', () =>
  assert.deepEqual(paletteResults('reminders', DATA), []));

/* ── grouping order = the sealed iteration order (the only ranking) ─────── */
ok('cross-type hit lists stakeholders → plans → community → workspaces → people', () => {
  // "a" hits every group in the fixture below.
  const d = {
    stakeholders: [{ id: 's', name: 'Alpha SH', org: '' }],
    plans: [{ id: 'p', title: 'Alpha Plan', workspaceId: 'w' }],
    community: [{ id: 'c', name: 'Alpha Grant', kind: 'K' }],
    workspaces: [{ id: 'w', name: 'Alpha WS', businessUnit: 'BU' }],
    users: [{ id: 'u', name: 'Alpha User', title: 'T', role: 'member' }],
    sites: [],
  };
  assert.deepEqual(paletteResults('alpha', d).map((r) => r.type),
    ['Stakeholder', 'Plan', 'Community', 'Workspace', 'Person']);
});

/* ── the 24-row combined cap (scale ruling: short-circuited scan) ───────── */
ok('cap: 30 stakeholder hits + later groups → exactly 24 rows, all stakeholders', () => {
  const many = Array.from({ length: 30 }, (_, i) =>
    ({ id: 'm' + i, name: 'Match ' + i, org: '' }));
  const d = { ...DATA, stakeholders: many };
  const rows = paletteResults('match', d);
  assert.equal(rows.length, 24);
  assert.ok(rows.every((r) => r.type === 'Stakeholder'));
});
ok('cap fills ACROSS groups in iteration order (20 stakeholders + 10 plans → 20 + 4)', () => {
  const shs = Array.from({ length: 20 }, (_, i) => ({ id: 'S' + i, name: 'Both ' + i }));
  const pls = Array.from({ length: 10 }, (_, i) => ({ id: 'P' + i, title: 'Both plan ' + i, workspaceId: 'w1' }));
  const rows = paletteResults('both', { ...DATA, stakeholders: shs, plans: pls, community: [], workspaces, users: [] });
  assert.equal(rows.length, 24);
  assert.equal(rows.filter((r) => r.type === 'Stakeholder').length, 20);
  assert.equal(rows.filter((r) => r.type === 'Plan').length, 4);
});
ok('scan stays fast at thousands of entries (scale ruling)', () => {
  const big = Array.from({ length: 5000 }, (_, i) =>
    ({ id: 'b' + i, name: 'Bulk ' + i, org: 'Org', tags: ['t1', 't2'], issues: ['i1'] }));
  const t0 = performance.now();
  const rows = paletteResults('bulk 49', { ...DATA, stakeholders: big });
  const ms = performance.now() - t0;
  assert.equal(rows.length, 24); // 111 raw hits (49, 490–499, 4900–4999) → the cap
  assert.ok(ms < 250, `one scan took ${ms.toFixed(1)}ms`);
});

/* ── keyboard clamps (sealed) ───────────────────────────────────────────── */
ok('ArrowDown clamps to len−1 (and the oracle −1 on an empty list)', () => {
  assert.equal(activeDown(0, 5), 1);
  assert.equal(activeDown(4, 5), 4);
  assert.equal(activeDown(0, 0), -1); // sealed verbatim: min(1, −1)
});
ok('ArrowUp clamps to 0', () => {
  assert.equal(activeUp(3), 2);
  assert.equal(activeUp(0), 0);
});

console.log(`\npalette-test: all ${passed} assertions passed`);
