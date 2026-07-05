#!/usr/bin/env node
/* setup-test.mjs — node asserts on the Workspaces (Setup) page's PURE logic
 * (src/app/pages/setup-logic.js + the workspace.js cascade helper), expected
 * values taken FROM THE SEALED BOX TEXT ("Workspaces — the team's working
 * surface" in src/guide.jsx: SEGMAP, BLANK-CREATE DEFAULTS, WORKSPACE MODAL,
 * DERIVATION, TOOLBAR, MEMBER VISIBILITY, DELETE, footer/strings).
 * Run: node scripts/setup-test.mjs                                          */

/* Pin a NEGATIVE-OFFSET timezone BEFORE any date work: the sealed
 * formatCreated bug ("2026-06-23" rendering "Jun 22, 2026" west of UTC) only
 * manifests there — the MAKE-REAL local-midnight guard must hold under it. */
process.env.TZ = 'America/Los_Angeles';

import assert from 'node:assert/strict';
import {
  companySegmentsFrom, segMapFrom, blankWorkspace, draftFromWorkspace,
  workspaceValid, applySegment, applyScope, submitPatch, SCOPE_OPTIONS,
  formatCreated, marketsByWs, countByWs, marketFilterOptions,
  regionFilterOptions, filterWorkspaces, visibleWorkspacesFor,
  canDeleteWorkspace, DELETE_BLOCKED_TEXT, deleteImpact,
  WS_EMPTY_TEXT, WS_FOOTER_EXPLAINER, workspaceCountLabel,
} from '../src/app/pages/setup-logic.js';
import { SEGMENTS, MARKETS } from '../src/app/data/catalogs.js';
import { stripWorkspaceFromJoins } from '../src/app/data/workspace.js';

let passed = 0;
const ok = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name); };

console.log('setup-test: sealed Workspaces (Setup) pure logic\n');

/* ── SEGMAP (sealed: cfg.segments present AND non-empty, else D.SEGMENTS —
 * the load-bearing double fallback) ─────────────────────────────────────── */
ok('companySegmentsFrom: empty/missing appConfig.segments → the seed catalog', () => {
  assert.equal(companySegmentsFrom(undefined), SEGMENTS);
  assert.equal(companySegmentsFrom({}), SEGMENTS);
  assert.equal(companySegmentsFrom({ segments: {} }), SEGMENTS);
});
ok('companySegmentsFrom: a configured non-empty map WINS (Settings contract)', () => {
  const cfg = { segments: { Robotics: ['Arms', 'Drives'] } };
  assert.equal(companySegmentsFrom(cfg), cfg.segments);
});
ok('segMapFrom re-applies the same fallback inside the page/modal', () => {
  assert.equal(segMapFrom(null), SEGMENTS);
  assert.equal(segMapFrom({}), SEGMENTS);
  const m = { Robotics: ['Arms'] };
  assert.equal(segMapFrom(m), m);
});

/* ── BLANK-CREATE DEFAULTS (sealed verbatim fields) ─────────────────────── */
ok('blank draft: sealed defaults (CF · Legal / GA&PP · empty scope · creator pre-owns)', () => {
  const u = { id: 'u-alex', name: 'Alex Rivera' };
  const b = blankWorkspace(u, { now: '2026-07-05T12:00:00.000Z' });
  assert.equal(b.name, '');
  assert.equal(b.segment, 'Corporate Functions');
  assert.equal(b.businessUnit, 'Legal / GA&PP');
  assert.equal(b.scope, '');
  assert.equal(b.scopeState, '');
  assert.deepEqual(b.owners, ['u-alex']);
  assert.equal(b.createdBy, 'u-alex');
  assert.equal(b.createdAt, '2026-07-05T12:00:00.000Z');
});
ok('blank draft with no user: owners [] (invalid until one is added)', () => {
  const b = blankWorkspace(null, { now: 'x' });
  assert.deepEqual(b.owners, []);
  assert.equal(b.createdBy, undefined);
  assert.equal(workspaceValid({ ...b, name: 'X' }), false);
});

/* ── VALIDITY (sealed: name trimmed non-empty AND owners.length > 0) ────── */
ok('validity: name non-empty (trimmed) AND at least one owner', () => {
  assert.equal(workspaceValid({ name: '', owners: ['u'] }), false);
  assert.equal(workspaceValid({ name: '   ', owners: ['u'] }), false);
  assert.equal(workspaceValid({ name: 'Hawk', owners: [] }), false);
  assert.equal(workspaceValid({ name: 'Hawk', owners: ['u'] }), true);
});

/* ── CASCADES (sealed) ──────────────────────────────────────────────────── */
ok('segment change RESETS businessUnit to SEG[seg][0] (or "" if none)', () => {
  const d = { segment: 'Corporate Functions', businessUnit: 'Legal / GA&PP' };
  const next = applySegment(d, 'Printing', SEGMENTS);
  assert.equal(next.segment, 'Printing');
  assert.equal(next.businessUnit, 'Hardware');
  assert.equal(applySegment(d, 'Unknown', SEGMENTS).businessUnit, '');
});
ok('scope change clears scopeState unless the new value is "State"', () => {
  const d = { scope: 'State', scopeState: 'Oregon' };
  assert.deepEqual(applyScope(d, 'National'), { scope: 'National', scopeState: '' });
  assert.deepEqual(applyScope(d, ''), { scope: '', scopeState: '' });
  assert.deepEqual(applyScope(d, 'State'), { scope: 'State', scopeState: 'Oregon' });
});
ok('Scope options: None ("") · National · State (sealed)', () => {
  assert.deepEqual(SCOPE_OPTIONS.map((o) => o.value), ['', 'National', 'State']);
  assert.equal(SCOPE_OPTIONS[0].label, 'None');
});

/* ── submit() (sealed: edit → the six fields only; create → trimmed name) ── */
ok('submitPatch edit: exactly {name, segment, businessUnit, scope, scopeState, owners}', () => {
  const d = {
    name: 'Hawk', segment: 'Printing', businessUnit: 'Supplies',
    scope: 'State', scopeState: 'Texas', owners: ['u-a'],
    createdAt: 'stamp', createdBy: 'u-x', id: 'ws-1',
  };
  const p = submitPatch('edit', d);
  assert.deepEqual(Object.keys(p).sort(),
    ['businessUnit', 'name', 'owners', 'scope', 'scopeState', 'segment']);
  assert.equal(p.scopeState, 'Texas');
});
ok('submitPatch create: the full draft with the name TRIMMED', () => {
  const p = submitPatch('create', { name: '  Hawk  ', segment: 'Printing', owners: ['u'] });
  assert.equal(p.name, 'Hawk');
  assert.equal(p.segment, 'Printing');
});

/* ── formatCreated (sealed formula + the MAKE-REAL timezone guard) ──────── */
ok('formatCreated: "-" when empty; raw string when unparseable', () => {
  assert.equal(formatCreated(''), '-');
  assert.equal(formatCreated(null), '-');
  assert.equal(formatCreated('not-a-date'), 'not-a-date');
});
ok('formatCreated: bare date renders the STORED day west of UTC (bug not replicated)', () => {
  // Oracle bug: new Date("2026-06-23") = UTC midnight → "Jun 22, 2026" in LA.
  assert.equal(formatCreated('2026-06-23'), 'Jun 23, 2026');
});
ok('formatCreated: full-ISO stamps render via toLocaleDateString(short/numeric/numeric)', () => {
  // 17:04 UTC = 09:04/10:04 LA — same calendar day either side of DST.
  assert.equal(formatCreated('2026-01-12T17:04:00.000Z'), 'Jan 12, 2026');
});

/* ── DERIVATION (sealed: markets/regions = the UNION over assigned
 * stakeholders; counts from the join map) ───────────────────────────────── */
const STK = [
  { id: 'sh-1', market: 'Americas', region: 'United States' },
  { id: 'sh-2', market: 'Americas', region: 'Canada' },
  { id: 'sh-3', market: 'EMEA', region: 'Europe' },
];
const JOIN = { 'sh-1': ['ws-a', 'ws-b'], 'sh-2': ['ws-a'], 'sh-3': ['ws-b'], 'sh-ghost': ['ws-a'] };
ok('marketsByWs: per-workspace UNION of assigned stakeholders (ghost ids skipped)', () => {
  const m = marketsByWs(STK, JOIN);
  assert.deepEqual(m['ws-a'], { markets: ['Americas'], regions: ['United States', 'Canada'] });
  assert.deepEqual(m['ws-b'], { markets: ['Americas', 'EMEA'], regions: ['United States', 'Europe'] });
});
ok('countByWs: stakeholders whose list includes the wsId', () => {
  const c = countByWs(JOIN);
  assert.equal(c['ws-a'], 3); // sh-1 + sh-2 + sh-ghost (join-count, sealed)
  assert.equal(c['ws-b'], 2);
});
ok('filter option sources: Markets keys; Regions = flattened unique regions', () => {
  assert.deepEqual(marketFilterOptions(), Object.keys(MARKETS));
  assert.deepEqual(regionFilterOptions(), [...new Set(Object.values(MARKETS).flat())]);
});

/* ── FILTER PIPELINE (sealed order: seg → market → region → search; search
 * matches name OR businessUnit OR segment, lowercased includes) ─────────── */
const WSS = [
  { id: 'ws-a', name: 'Hawk', segment: 'Corporate Functions', businessUnit: 'Legal / GA&PP' },
  { id: 'ws-b', name: 'Clone Cartridges', segment: 'Printing', businessUnit: 'Supplies' },
];
const DERIVED = marketsByWs(STK, JOIN);
ok('segment filter keeps only matching segments', () => {
  assert.deepEqual(
    filterWorkspaces(WSS, { segFilter: ['Printing'], derived: DERIVED }).map((w) => w.id),
    ['ws-b']);
});
ok('market/region filters intersect the DERIVED sets', () => {
  assert.deepEqual(
    filterWorkspaces(WSS, { marketFilter: ['EMEA'], derived: DERIVED }).map((w) => w.id),
    ['ws-b']);
  assert.deepEqual(
    filterWorkspaces(WSS, { regionFilter: ['Canada'], derived: DERIVED }).map((w) => w.id),
    ['ws-a']);
});
ok('search matches name OR businessUnit OR segment (case-insensitive)', () => {
  assert.equal(filterWorkspaces(WSS, { query: 'hawk', derived: DERIVED }).length, 1);
  assert.equal(filterWorkspaces(WSS, { query: 'supplies', derived: DERIVED }).length, 1);
  assert.equal(filterWorkspaces(WSS, { query: 'corporate', derived: DERIVED }).length, 1);
  assert.equal(filterWorkspaces(WSS, { query: 'zebra', derived: DERIVED }).length, 0);
});

/* ── MEMBER VISIBILITY (sealed; dead showAll DROPPED — declared) ────────── */
ok('visibility: managers see ALL; members see only co-owned workspaces', () => {
  const list = [
    { id: 'a', owners: ['u-m'] },
    { id: 'b', owners: ['u-other'] },
  ];
  assert.equal(visibleWorkspacesFor(list, { id: 'u-x', role: 'manager' }).length, 2);
  assert.deepEqual(
    visibleWorkspacesFor(list, { id: 'u-m', role: 'member' }).map((w) => w.id), ['a']);
  assert.equal(visibleWorkspacesFor(list, null).length, 0);
});

/* ── DELETE gate (sealed canDelete) + blocked copy + impact ─────────────── */
ok('canDelete: no user false · manager true · creator true · co-owner-only false', () => {
  const ws = { createdBy: 'u-sam', owners: ['u-sam', 'u-devon'] };
  assert.equal(canDeleteWorkspace(ws, null), false);
  assert.equal(canDeleteWorkspace(ws, { id: 'u-x', role: 'manager' }), true);
  assert.equal(canDeleteWorkspace(ws, { id: 'u-sam', role: 'member' }), true);
  assert.equal(canDeleteWorkspace(ws, { id: 'u-devon', role: 'member' }), false);
});
ok('sealed blocked-delete copy verbatim', () => {
  assert.equal(DELETE_BLOCKED_TEXT,
    'Only the workspace creator or a manager can delete this workspace.');
});
ok('deleteImpact: assigned-stakeholder count + plans scoped to the workspace', () => {
  const plans = [{ id: 'p1', workspaceId: 'ws-a' }, { id: 'p2', workspaceId: 'ws-b' }];
  assert.deepEqual(deleteImpact('ws-a', JOIN, plans), { stakeholders: 3, plans: 1 });
  assert.deepEqual(deleteImpact('ws-none', JOIN, plans), { stakeholders: 0, plans: 0 });
});
ok('stripWorkspaceFromJoins: the wsId leaves EVERY list; keys survive', () => {
  const next = stripWorkspaceFromJoins(JOIN, 'ws-a');
  assert.deepEqual(next['sh-1'], ['ws-b']);
  assert.deepEqual(next['sh-2'], []);
  assert.deepEqual(next['sh-ghost'], []);
  assert.deepEqual(next['sh-3'], ['ws-b']);
});

/* ── Sealed strings + labels ────────────────────────────────────────────── */
ok('empty state / footer explainer verbatim', () => {
  assert.equal(WS_EMPTY_TEXT, 'No workspaces match.');
  assert.equal(WS_FOOTER_EXPLAINER,
    'Workspaces pair a segment with a business unit. Assign stakeholders ' +
    'from the Master pool to any number of workspaces.');
});
ok('seg-group count label: "{n} workspace(s)" singular/plural', () => {
  assert.equal(workspaceCountLabel(1), '1 workspace');
  assert.equal(workspaceCountLabel(4), '4 workspaces');
});

/* ── edit draft copy ────────────────────────────────────────────────────── */
ok('edit draft = {...ws} (a shallow copy, never the record itself)', () => {
  const ws = { id: 'ws-a', name: 'Hawk' };
  const d = draftFromWorkspace(ws);
  assert.notEqual(d, ws);
  assert.deepEqual(d, ws);
});

console.log(`\nsetup-test: all ${passed} assertions passed`);
