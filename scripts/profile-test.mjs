#!/usr/bin/env node
/* profile-test.mjs — Phase-13 assertions for Profiles: the sealed assignment
 * logic (ws/plans/comm reach-through + sh via the join map), the sealed
 * row builders (workspace market/region coverage, community stage-as-status,
 * dedup'd reach-through workspace names), the sealed view pipeline (search
 * ALL visible columns → Set filters → stable lowercased sort), the sealed
 * filter/sort field derivations, the hero derivations ("Team member"
 * fallback, manager gate), the people filters + "People · N" head, the
 * EditProfileModal save merge (name recomposition + first/last fallbacks)
 * with the declared stale-regions correction, the messageUser DM-dedupe core
 * (messages-logic.startConversationRecord — the shell composes census J5
 * from it), the sealed strings verbatim, and the removeUser cascade
 * contract (App-shell box, all seven touched collections).
 */
import assert from 'node:assert/strict';
import {
  STR, PROFILE_TABS, PROFILE_COLS,
  wsAssigned, plansAssigned, commAssigned, shAssigned,
  wsName, wsMarketsRegions, wsRows, planRows, commRows, shRows,
  distinctVals, sortFieldsFor, toggleFilter, activeFilterCount, viewRows,
  heroSub, fnLabel, isManager, peopleOthers, peopleHead,
  profileNameParts, mergeProfileSave, toggleProfileMarket, regionOptionsFor,
  removeUserCascade,
} from '../src/app/pages/profile-logic.js';
import { startConversationRecord } from '../src/app/pages/messages-logic.js';

let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); n++; };

/* ── fixtures ───────────────────────────────────────────────────────────── */
const me = { id: 'u-1', name: 'Alex Rivera', title: 'Director', email: 'a@x.com', role: 'manager' };
const workspaces = [
  { id: 'w-1', name: 'Alpha', owners: ['u-1'], createdAt: '2026-01-01', updatedAt: '2026-02-01' },
  { id: 'w-2', name: 'Beta', owners: ['u-2'], createdAt: '2026-01-02' },
  { id: 'w-3', name: 'Gamma', owners: ['u-3'], createdAt: '2026-01-03' },
];
const plans = [
  { id: 'p-1', title: 'Plan One', workspaceId: 'w-2', owners: ['u-1'], team: [], status: 'Active', market: 'NA', region: 'US West', createdAt: '2026-01-05', updatedAt: '2026-03-01' },
  { id: 'p-2', title: 'Plan Two', workspaceId: 'w-3', owners: ['u-9'], team: [{ userId: 'u-1', role: 'Analyst' }], createdAt: '2026-01-06' },
  { id: 'p-3', title: 'Plan Three', workspaceId: 'w-3', owners: ['u-9'], team: [{ userId: 'u-2' }], createdAt: '2026-01-07' },
];
const community = [
  { id: 'c-1', name: 'Grant A', owners: ['u-1'], stage: 'Approved', markets: ['NA'], regions: ['US West'], linkedStakeholders: ['s-1', 's-2'], createdAt: '2026-01-08', updatedAt: '2026-04-01' },
  { id: 'c-2', name: 'Grant B', owners: ['u-2'], stage: 'Proposed', linkedStakeholders: [] },
];
const stakeholders = [
  { id: 's-1', name: 'City of Cedarville', type: 'Local government', priority: 'High', market: 'NA', region: 'US West', createdAt: '2026-01-01', updatedAt: '2026-05-01' },
  { id: 's-2', name: 'Grün Zukunft', type: 'NGO', priority: 'Low', market: 'EMEA', region: 'DACH', createdAt: '2026-01-02', lastContact: '2026-04-15' },
  { id: 's-3', name: 'Helios Capital', type: 'Investor', priority: 'Medium', market: 'NA', region: 'US East', createdAt: '2026-01-03' },
];
const joins = { 's-1': ['w-2'], 's-2': ['w-2', 'w-3'], 's-3': ['w-1'] };

/* ── ASSIGNMENT LOGIC (sealed) ──────────────────────────────────────────── */
// ws: owned (w-1) + reached through owned/teamed plans (w-2 via p-1, w-3 via p-2)
eq(wsAssigned(me, workspaces, plans).map((w) => w.id), ['w-1', 'w-2', 'w-3'],
  'wsAssigned = owned OR owns/teams a plan inside');
eq(wsAssigned({ id: 'u-2' }, workspaces, plans).map((w) => w.id), ['w-2', 'w-3'],
  'u-2: owns w-2, teams p-3 in w-3');
eq(plansAssigned(me, plans).map((p) => p.id), ['p-1', 'p-2'],
  'plansAssigned = owner or team member');
eq(commAssigned(me, community).map((c) => c.id), ['c-1'], 'commAssigned = owner only');
// sh reach-through: my plans (p-1 w-2, p-2 w-3) → joins: s-1 (w-2), s-2 (w-2+w-3)
eq(shAssigned(me, plans, stakeholders, joins).map((s) => s.id), ['s-1', 's-2'],
  'shAssigned = stakeholders joined to my plans\' workspaces');
eq(shAssigned({ id: 'u-none' }, plans, stakeholders, joins), [],
  'no plans → no stakeholder reach-through');

/* ── row builders (sealed shapes) ───────────────────────────────────────── */
eq(wsName(workspaces, 'w-2'), 'Beta', 'wsName resolves');
eq(wsName(workspaces, 'w-x'), '-', 'wsName falls back to "-"');
eq(wsMarketsRegions('w-2', stakeholders, joins),
  { markets: ['NA', 'EMEA'], regions: ['US West', 'DACH'] },
  'workspace coverage derives from member stakeholders');
const wr = wsRows([workspaces[0]], stakeholders, joins)[0];
eq(wr, {
  id: 'w-1', name: 'Alpha', market: 'NA', region: 'US East',
  _owners: ['u-1'], _updated: '2026-02-01', _created: '2026-01-01',
}, 'ws row shape (owners hidden behind _owners; updated falls back)');
const pr = planRows([plans[1]], workspaces)[0];
eq(pr.status, 'Idea', 'plan status defaults to "Idea"');
eq(pr.workspace, 'Gamma', 'plan row resolves its workspace name');
eq(pr._updated, '2026-01-06', 'plan _updated falls back to createdAt');
const cr = commRows([community[0]], workspaces, joins)[0];
eq(cr.workspace, 'Beta, Gamma',
  'community workspace = dedup\'d names reached through linked stakeholders');
eq(cr.status, 'Approved', 'community status column reads c.stage (sealed note)');
eq(commRows([community[1]], workspaces, joins)[0].workspace, '-',
  'no linked stakeholders → "-"');
eq(commRows([{ id: 'c', name: 'x' }], workspaces, joins)[0].status, 'Idea',
  'community stage defaults to "Idea"');
const sr = shRows([stakeholders[1]], () => 'Monitor', (s) => s.name)[0];
eq([sr.name, sr.relationship, sr.priority, sr._updated],
  ['Grün Zukunft', 'Monitor', 'Low', '2026-04-15'],
  'sh row: computed relationship band + lastContact in the _updated chain');

/* ── filters & sort (sealed) ────────────────────────────────────────────── */
const rows = [
  { id: '1', name: 'beta', market: 'NA', region: 'US West', status: 'Active' },
  { id: '2', name: 'Alpha', market: 'EMEA', region: 'DACH', status: 'Idea' },
  { id: '3', name: 'gamma', market: 'NA', region: '', status: 'Active' },
];
const cols = PROFILE_COLS.plans;
eq(distinctVals(rows, 'market'), ['EMEA', 'NA'], 'distinct values dedup + sort');
eq(distinctVals(rows, 'region'), ['DACH', 'US West'], 'falsy values dropped');
const sf = sortFieldsFor(PROFILE_COLS.ws);
eq(sf.map((f) => f.key), ['name', 'market', 'region', '_updated', '_created'],
  'sort fields = non-owner columns + the two synthetic date fields');
eq(sf[3], { key: '_updated', label: 'Last updated', type: 'date' }, 'sealed date field');
let f = toggleFilter({}, 'market', 'NA');
ok(f.market.has('NA'), 'toggle adds into a Set');
eq(activeFilterCount(f), 1, 'activeFilterCount = sum of Set sizes');
f = toggleFilter(f, 'market', 'EMEA');
eq(activeFilterCount(f), 2, 'second value counts');
f = toggleFilter(f, 'market', 'NA');
ok(!f.market.has('NA') && activeFilterCount(f) === 1, 'toggle removes'); n++;

// search hits ALL visible columns
eq(viewRows(rows, cols, 'dach', {}, { key: null }).map((r) => r.id), ['2'],
  'search matches any visible column, case-insensitive');
// filter by Set
eq(viewRows(rows, cols, '', { status: new Set(['Active']) }, { key: null }).map((r) => r.id),
  ['1', '3'], 'Set filter keeps matching rows');
// sort lowercased asc/desc
eq(viewRows(rows, cols, '', {}, { key: 'name', dir: 'asc' }).map((r) => r.name),
  ['Alpha', 'beta', 'gamma'], 'sort compares lowercased strings');
eq(viewRows(rows, cols, '', {}, { key: 'name', dir: 'desc' }).map((r) => r.name),
  ['gamma', 'beta', 'Alpha'], 'desc flips');
eq(viewRows(rows, cols, 'a', { market: new Set(['NA']) }, { key: 'name', dir: 'asc' })
  .map((r) => r.id), ['1', '3'], 'pipeline order: search → filter → sort');

/* ── tabs + hero (sealed) ───────────────────────────────────────────────── */
eq(PROFILE_TABS.map((t) => t.id), ['ws', 'plans', 'comm', 'sh'], 'sealed tab order');
eq(PROFILE_TABS[1].label, 'Stakeholder Engagement Plans', 'sealed long label');
eq(PROFILE_TABS[1].short, 'SEP', 'sealed short label');
eq(PROFILE_TABS[3].short, 'Relationships', 'sealed sh short label');
eq(heroSub({ title: 'Director' }), 'Director', 'hero sub = title');
eq(heroSub({}), 'Team member', 'sealed "Team member" fallback');
eq(fnLabel({}), '-', 'function falls back to "-"');
ok(isManager({ role: 'manager' }) && !isManager({ role: 'member' }), 'manager gate'); n++;

/* ── people surfaces (sealed filters + head) ────────────────────────────── */
const allUsers = [me,
  { id: 'u-2', name: 'B', role: 'member' },
  { id: 'u-system', name: 'Reminders', role: 'system' },
  { id: 'u-3', name: 'C', role: 'member' }];
eq(peopleOthers(allUsers, 'u-1').map((u) => u.id), ['u-2', 'u-3'],
  'people filter: never self, never the system bot');
eq(peopleHead(2), 'People · 2', 'sealed "People · {n}" head (middle dot)');

/* ── EditProfileModal merge (sealed) ────────────────────────────────────── */
eq(profileNameParts({ name: 'Alex Rivera' }), { first: 'Alex', last: 'Rivera' },
  'first/last derive from the name split when unset');
eq(profileNameParts({ name: 'Alex De La Cruz', firstName: 'Al' }),
  { first: 'Al', last: 'De La Cruz' }, 'explicit first wins; rest-of-name last');
eq(mergeProfileSave({ name: 'Alex Rivera', firstName: 'Alexandra', lastName: '' }).name,
  'Alexandra Rivera', 'NAME RECOMPOSED from first + fallback last');
eq(mergeProfileSave({ name: 'Alex Rivera', firstName: '', lastName: '' }).name,
  'Alex Rivera', 'blank fields fall back to the split, name preserved');
const mCat = { NA: ['US West', 'US East'], EMEA: ['DACH'] };
eq(regionOptionsFor(['NA', 'EMEA'], mCat), ['US West', 'US East', 'DACH'],
  'region options = union of the SELECTED markets\' regions');
let d = { markets: ['NA', 'EMEA'], regions: ['US West', 'DACH'] };
d = { ...d, ...toggleProfileMarket(d, 'EMEA', mCat) };
eq(d, { markets: ['NA'], regions: ['US West'] },
  'declared correction: deselecting a market PRUNES its orphaned regions');
d = { ...d, ...toggleProfileMarket(d, 'EMEA', mCat) };
eq(d.markets, ['NA', 'EMEA'], 'toggle re-adds');

/* ── messageUser core (census J5 — the shell composes it from this) ─────── */
const convs = [
  { id: 'c-1', kind: 'direct', participants: ['u-1', 'u-2'], title: '' },
  { id: 'c-2', kind: 'group', participants: ['u-1', 'u-2', 'u-3'], title: 'G' },
];
let r = startConversationRecord(convs, 'u-1', ['u-2'], null, () => 'c-new');
eq(r.id, 'c-1', 'DM with an existing partner DEDUPES to the existing thread');
ok(!r.conversation, 'dedupe mints no new conversation'); n++;
r = startConversationRecord(convs, 'u-1', ['u-3'], null, () => 'c-new');
eq(r.id, 'c-new', 'a new DM partner mints a conversation');
eq(r.conversation.participants.sort(), ['u-1', 'u-3'],
  'current user auto-added to the pair');

/* ── sealed strings verbatim ────────────────────────────────────────────── */
eq(STR.searchPlaceholder, 'Search…', 'sealed "Search…"');
eq(STR.noFilters, 'No filters for this view.', 'sealed no-filters copy');
eq(STR.emptyGeneric, 'Nothing here yet.', 'sealed generic empty');
eq(STR.emptySh, 'No stakeholder relationships.', 'sealed sh empty');
eq(STR.editProfile, 'Edit profile', 'sealed edit button');
eq(STR.saveProfile, 'Save profile', 'sealed save button');
eq(STR.peopleTitle, 'People in this workspace', 'sealed stack tooltip');
eq(STR.sendMessage, 'Send message', 'sealed row action');
eq(STR.functionPlaceholder, 'Select a function…', 'sealed function placeholder');
eq(STR.openStakeholder, 'Open stakeholder', 'sealed sh row title');
eq(STR.defaultTitle, 'Team member', 'sealed default title');

/* ── removeUser CASCADE (sealed App-shell contract) ─────────────────────── */
const data = {
  users: [me, { id: 'u-2', name: 'B' }],
  workspaces: [{ id: 'w', owners: ['u-1', 'u-2'] }],
  stakeholders: [{ id: 's', owners: ['u-2', 'u-3'] }],
  community: [{ id: 'c', owners: ['u-2'], votes: { 'u-2': 'for', 'u-3': 'against' } }],
  plans: [{
    id: 'p', owners: ['u-2'],
    team: [{ userId: 'u-2' }, { userId: 'u-3' }],
    strategies: [{ id: 'st1', ownerId: 'u-2' }, { id: 'st2', ownerId: 'u-3' }],
  }],
  team: [{ id: 'tm1', userId: 'u-2' }, { id: 'tm2', userId: 'u-3' }],
};
const out = removeUserCascade(data, 'u-2');
eq(out.users.map((u) => u.id), ['u-1'], 'cascade: user row removed');
eq(out.workspaces[0].owners, ['u-1'], 'cascade: workspace owners filtered');
eq(out.stakeholders[0].owners, ['u-3'], 'cascade: stakeholder owners filtered');
eq(out.community[0].owners, [], 'cascade: community owners filtered');
eq(out.community[0].votes, { 'u-3': 'against' }, 'cascade: vote KEY deleted');
eq(out.plans[0].owners, [], 'cascade: plan owners filtered');
eq(out.plans[0].team.map((t) => t.userId), ['u-3'], 'cascade: plan team filtered');
eq(out.plans[0].strategies.map((s) => s.ownerId), ['', 'u-3'],
  'cascade: strategy ownerId reset to "" (empty, not removed)');
eq(out.team.map((t) => t.id), ['tm2'], 'cascade: team rows filtered');
ok(data.community[0].votes['u-2'] === 'for', 'cascade is pure — input untouched'); n++;

console.log(`profile-test: ${n} assertions passed`);
