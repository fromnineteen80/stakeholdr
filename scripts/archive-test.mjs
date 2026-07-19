#!/usr/bin/env node
/* archive-test.mjs — node asserts on the PHASE 24 ARCHIVE / SOFT-DELETE pure
 * logic (the Enterprise state model box's SOFT DELETE [STD] + architecture
 * pillar 8's Archive state; declared surfaces per the phase directive):
 *   · flag semantics — bulkArchive / bulkRestore stamps, honest per-row
 *     no-ops, reference honesty, the exact changedIds contract UNDO rides on
 *   · surface exclusion — the ONE activeStakeholders seam and every consumer
 *     that rides it: visibleStakeholders (Lists rows, Map dots, Scoring
 *     matrix, plan rosters, the record embeds), archivedStakeholders (the
 *     Archived view is the ONLY surface that shows them), the archive-aware
 *     countForWorkspace (shell counts), unscoredCountFor over the active set
 *     (the Scoring badge + workHQ's host rows), and paletteResults over the
 *     active set (search)
 *   · undo restore — archive → restore(changedIds) round-trips the records
 *   · delete-forever — cascadeDeleteStakeholders is the SEALED single-record
 *     cascade generalized (record removed, scores purged, joins purged,
 *     nothing else touched) and the modal's single delete is the same path
 *     with a one-id set
 *   · the archive-family honest-count snackbar copy.
 */
import assert from 'node:assert/strict';
import {
  isArchived, activeStakeholders, visibleStakeholders, archivedStakeholders,
  countForWorkspace, MASTER_WORKSPACE_ID,
} from '../src/app/data/workspace.js';
import {
  bulkArchive, bulkRestore, cascadeDeleteStakeholders,
  archiveSummary, restoreSummary, deleteForeverSummary, archivedToggleLabel,
  ARCHIVED_VIEW_LINE, ARCHIVED_EMPTY_LINE,
} from '../src/app/pages/sheet-logic.js';
import { unscoredCountFor } from '../src/app/pages/scoring-logic.js';
import { paletteResults } from '../src/app/palette-logic.js';
/* FIX-audit consumers (2026-07-19): the exclusion-seam surfaces that were
 * never rewired — plan editor/review parity + option lists, mention picker,
 * profile derivations, Setup counts. All imports are the SHIPPED modules. */
import {
  planStakeholderIds, planMemberRecords, addableMasterFor,
} from '../src/app/pages/plan-logic.js';
import { mentionMatches } from '../src/app/pages/messages-logic.js';
import {
  stakeholderPickerOptions, representedStakeholderOptions,
} from '../src/app/pages/community-logic.js';
import {
  countByWs, marketsByWs, deleteImpact,
} from '../src/app/pages/setup-logic.js';
import {
  shAssigned, wsMarketsRegions,
} from '../src/app/pages/profile-logic.js';

let passed = 0;
const ok = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name); };

console.log('archive-test: Phase 24 archive / soft-delete pure logic\n');

const STAMP = '2026-07-19T12:00:00.000Z';
const mk = (id, extra = {}) => ({
  id, name: `Name ${id}`, org: `Org ${id}`, updatedAt: 'old', ...extra,
});

/* ── FLAG SEMANTICS ─────────────────────────────────────────────────────── */
ok('bulkArchive stamps archived + archivedAt/archivedBy + updatedAt on landed rows', () => {
  const rows = [mk('a'), mk('b'), mk('c')];
  const { next, landed, changedIds } = bulkArchive(rows, ['a', 'c'], STAMP, 'u-alex');
  assert.equal(landed, 2);
  assert.deepEqual(changedIds, ['a', 'c']);
  const a = next.find((s) => s.id === 'a');
  assert.equal(a.archived, true);
  assert.equal(a.archivedAt, STAMP);
  assert.equal(a.archivedBy, 'u-alex');
  assert.equal(a.updatedAt, STAMP);
  // unselected rows keep their reference (no phantom stamp)
  assert.equal(next[1], rows[1]);
});
ok('bulkArchive no-ops already-archived rows (honest count, reference kept)', () => {
  const rows = [mk('a', { archived: true, archivedAt: 'x', archivedBy: 'u-1' }), mk('b')];
  const { next, landed, changedIds } = bulkArchive(rows, ['a', 'b'], STAMP, 'u-2');
  assert.equal(landed, 1);
  assert.deepEqual(changedIds, ['b']);
  assert.equal(next[0], rows[0]); // the archived row is untouched — stamps preserved
});
ok('bulkArchive: empty selection / nothing-to-change return the INPUT reference', () => {
  const rows = [mk('a', { archived: true })];
  assert.equal(bulkArchive(rows, [], STAMP, 'u').next, rows);
  assert.equal(bulkArchive(rows, ['a'], STAMP, 'u').next, rows);
  assert.equal(bulkArchive(rows, ['ghost'], STAMP, 'u').landed, 0);
});
ok('bulkRestore clears the flag AND the stamps (archived:false, At/By null)', () => {
  const rows = [mk('a', { archived: true, archivedAt: 'x', archivedBy: 'u-1' }), mk('b')];
  const { next, landed, changedIds } = bulkRestore(rows, ['a', 'b'], STAMP);
  assert.equal(landed, 1); // b was active — honest no-op
  assert.deepEqual(changedIds, ['a']);
  const a = next.find((s) => s.id === 'a');
  assert.equal(a.archived, false);
  assert.equal(a.archivedAt, null);
  assert.equal(a.archivedBy, null);
  assert.equal(a.updatedAt, STAMP);
  assert.equal(next[1], rows[1]);
});

/* ── SURFACE EXCLUSION (the one seam + every consumer) ──────────────────── */
const SH = [mk('s1'), mk('s2', { archived: true, archivedAt: STAMP, archivedBy: 'u' }), mk('s3')];
const JOINS = { s1: ['ws-a'], s2: ['ws-a'], s3: ['ws-b'] };

ok('activeStakeholders drops archived rows (the palette + shell-count seam)', () => {
  assert.deepEqual(activeStakeholders(SH).map((s) => s.id), ['s1', 's3']);
  assert.equal(isArchived(SH[1]), true);
});
ok('visibleStakeholders (Lists/Map/Scoring/plan-roster/record seam): Master excludes archived', () => {
  assert.deepEqual(
    visibleStakeholders(SH, JOINS, MASTER_WORKSPACE_ID).map((s) => s.id),
    ['s1', 's3']);
});
ok('visibleStakeholders: a workspace excludes its archived member too', () => {
  assert.deepEqual(visibleStakeholders(SH, JOINS, 'ws-a').map((s) => s.id), ['s1']);
});
ok('archivedStakeholders is the exact complement, workspace-scoped', () => {
  assert.deepEqual(archivedStakeholders(SH, JOINS, MASTER_WORKSPACE_ID).map((s) => s.id), ['s2']);
  assert.deepEqual(archivedStakeholders(SH, JOINS, 'ws-a').map((s) => s.id), ['s2']);
  assert.deepEqual(archivedStakeholders(SH, JOINS, 'ws-b').map((s) => s.id), []);
});
ok('countForWorkspace with the collection excludes archived joins (shell counts)', () => {
  assert.equal(countForWorkspace(JOINS, 'ws-a', SH), 1);   // s2 archived
  assert.equal(countForWorkspace(JOINS, 'ws-b', SH), 1);
  assert.equal(countForWorkspace(JOINS, 'ws-a'), 2);       // legacy raw join count
});
ok('unscoredCountFor over the active set: an archived record never demands scoring', () => {
  const team = [{ id: 'tm-1', userId: 'u-me' }];
  // no scores at all → every ACTIVE stakeholder counts, archived never
  assert.equal(unscoredCountFor(activeStakeholders(SH), {}, team, 'u-me'), 2);
  assert.equal(unscoredCountFor(SH, {}, team, 'u-me'), 3); // the raw set would lie
});
ok('paletteResults over the active set: an archived stakeholder never surfaces', () => {
  const hitAll = paletteResults('Name s2', { stakeholders: SH });
  assert.equal(hitAll.length, 1); // the raw set WOULD match it…
  const hit = paletteResults('Name s2', { stakeholders: activeStakeholders(SH) });
  assert.deepEqual(hit, []);      // …the shell's active feed never does
  // and active records still resolve
  assert.equal(paletteResults('Name s1',
    { stakeholders: activeStakeholders(SH) })[0].id, 's1');
});

/* ── FIX AUDIT (2026-07-19): the consumers that never got rewired ────────── */
const FSH = [
  mk('f1', { market: 'Americas', region: 'United States', type: 'Mayor' }),
  mk('f2', { market: 'EMEA', region: 'Europe', type: 'Media',
    archived: true, archivedAt: STAMP, archivedBy: 'u' }),
  mk('f3', { market: 'Americas', region: 'Canada', type: 'NGO' }),
];
const FJOINS = { f1: ['ws-a'], f2: ['ws-a'], f3: ['ws-a', 'ws-b'] };

ok('F1 editor/review parity: planMemberRecords over the ACTIVE set drops the archived member; the plan record keeps the id', () => {
  const plan = { id: 'p', stakeholderIds: ['f1', 'f2', 'f3'] };
  const roster = activeStakeholders(FSH); // Review's set (visibleStakeholders is active-only)
  const rosterIds = roster.map((s) => s.id);
  const editor = planMemberRecords(plan, rosterIds, activeStakeholders(FSH));
  const review = planMemberRecords(plan, rosterIds, roster);
  assert.deepEqual(editor.map((s) => s.id), ['f1', 'f3']); // archived f2 drops
  assert.deepEqual(editor.map((s) => s.id), review.map((s) => s.id)); // parity
  assert.deepEqual(planStakeholderIds(plan, rosterIds), ['f1', 'f2', 'f3']); // untouched — restore brings it back
  // the RAW set would render the archived member (the audited bug)
  assert.deepEqual(planMemberRecords(plan, rosterIds, FSH).map((s) => s.id), ['f1', 'f2', 'f3']);
});
ok('F5 plan addableMaster is ACTIVE-only (archived never offered; roster still excluded)', () => {
  assert.deepEqual(addableMasterFor(FSH, ['f1']).map((s) => s.id), ['f3']);
  assert.deepEqual(addableMasterFor(FSH, []).map((s) => s.id), ['f1', 'f3']);
});
ok('F4 mention PICKER over the active set excludes archived; the raw set would offer it', () => {
  const mq = { trigger: '@', query: 'name' };
  const raw = mentionMatches(mq, { stakeholders: FSH });
  assert.equal(raw.length, 3); // the audited bug: archived offered for NEW mentions
  const act = mentionMatches(mq, { stakeholders: activeStakeholders(FSH) });
  assert.deepEqual(act.map((o) => o.id), ['f1', 'f3']);
});
ok('F5 community StakeholderPicker options: active-only, selected excluded; chosen chips stay RAW at the call site', () => {
  const opts = stakeholderPickerOptions(FSH, ['f1']);
  assert.deepEqual(opts.map((o) => o.value), ['f3']); // f2 archived, f1 chosen
  assert.equal(opts[0].sub, 'Org f3 · NGO');
  assert.deepEqual(stakeholderPickerOptions(FSH, []).map((o) => o.value), ['f1', 'f3']);
});
ok('F5 represented-stakeholder select: None + active, PLUS the archived CURRENT pick (raw resolution, never a blank select)', () => {
  assert.deepEqual(representedStakeholderOptions(FSH, '').map((o) => o.value), ['', 'f1', 'f3']);
  assert.deepEqual(representedStakeholderOptions(FSH, 'f2').map((o) => o.value), ['', 'f2', 'f1', 'f3']);
  assert.deepEqual(representedStakeholderOptions(FSH, 'f1').map((o) => o.value), ['', 'f1', 'f3']); // active pick: no duplicate
});
ok('F6 countByWs with the collection excludes archived — parity with countForWorkspace (the rail)', () => {
  const c = countByWs(FJOINS, FSH);
  assert.equal(c['ws-a'], 2); // f2 archived
  assert.equal(c['ws-a'], countForWorkspace(FJOINS, 'ws-a', FSH));
  assert.equal(c['ws-b'], countForWorkspace(FJOINS, 'ws-b', FSH));
  assert.equal(countByWs(FJOINS)['ws-a'], 3); // legacy raw join count preserved
});
ok('F6 marketsByWs over the ACTIVE set: no archived-derived market/region chips', () => {
  const d = marketsByWs(activeStakeholders(FSH), FJOINS);
  assert.deepEqual(d['ws-a'], { markets: ['Americas'], regions: ['United States', 'Canada'] });
  // the raw set would leak EMEA/Europe from the archived record
  assert.ok(marketsByWs(FSH, FJOINS)['ws-a'].markets.includes('EMEA'));
});
ok('F6 deleteImpact with the collection discloses the ACTIVE count the user sees', () => {
  const plans = [{ id: 'p1', workspaceId: 'ws-a' }];
  assert.deepEqual(deleteImpact('ws-a', FJOINS, plans, FSH), { stakeholders: 2, plans: 1 });
  assert.deepEqual(deleteImpact('ws-a', FJOINS, plans), { stakeholders: 3, plans: 1 }); // legacy raw
});
ok('F3 profile derivations over the ACTIVE set: Relationships excludes archived; ws chips never archived-derived', () => {
  const user = { id: 'u-me' };
  const plans = [{ id: 'p1', workspaceId: 'ws-a', owners: ['u-me'], team: [] }];
  const withArchived = shAssigned(user, plans, FSH, FJOINS);
  assert.deepEqual(withArchived.map((s) => s.id), ['f1', 'f2', 'f3']); // the audited bug
  const fixed = shAssigned(user, plans, activeStakeholders(FSH), FJOINS);
  assert.deepEqual(fixed.map((s) => s.id), ['f1', 'f3']);
  const mr = wsMarketsRegions('ws-a', activeStakeholders(FSH), FJOINS);
  assert.deepEqual(mr.markets, ['Americas']);
});

/* ── UNDO RESTORE (the snackbar action contract) ────────────────────────── */
ok('undo = restore EXACTLY the landed set: archive → restore(changedIds) round-trips', () => {
  const rows = [mk('a'), mk('b', { archived: true, archivedAt: 'kept', archivedBy: 'u-0' }), mk('c')];
  const arch = bulkArchive(rows, ['a', 'b', 'c'], STAMP, 'u-me');
  assert.deepEqual(arch.changedIds, ['a', 'c']); // b already archived — NOT undo's to restore
  const undo = bulkRestore(arch.next, arch.changedIds, STAMP);
  assert.equal(undo.landed, 2);
  const after = undo.next;
  assert.equal(after.find((s) => s.id === 'a').archived, false);
  assert.equal(after.find((s) => s.id === 'c').archived, false);
  // the pre-archived bystander keeps its ORIGINAL stamps — undo never touched it
  const b = after.find((s) => s.id === 'b');
  assert.equal(b.archived, true);
  assert.equal(b.archivedAt, 'kept');
  assert.equal(b.archivedBy, 'u-0');
});
ok('undo over a since-deleted set is an honest no-op (input reference, landed 0)', () => {
  const rows = [mk('a')];
  const r = bulkRestore(rows, ['ghost-1', 'ghost-2'], STAMP);
  assert.equal(r.next, rows);
  assert.equal(r.landed, 0);
});

/* ── DELETE FOREVER = the SEALED cascade, generalized ───────────────────── */
ok('cascadeDeleteStakeholders removes the records and purges scores + joins (nothing else)', () => {
  const rows = [mk('a'), mk('b'), mk('c')];
  const scores = { a: { 'tm-1': { x: 1, y: 2 } }, b: { 'tm-1': { x: 0, y: 0 } } };
  const joins = { a: ['ws-a'], b: [], c: ['ws-b'] };
  const r = cascadeDeleteStakeholders(rows, scores, joins, ['a', 'b']);
  assert.equal(r.landed, 2);
  assert.deepEqual(r.stakeholders.map((s) => s.id), ['c']);
  assert.deepEqual(Object.keys(r.scores), []);
  assert.deepEqual(Object.keys(r.joins), ['c']);
  assert.equal(r.joins.c, joins.c); // surviving entries keep their values
});
ok('the modal single delete is the same path with a one-id set', () => {
  const rows = [mk('a'), mk('b')];
  const scores = { a: { 'tm-1': { x: 1, y: 1 } } };
  const joins = { a: ['ws-a'], b: ['ws-a'] };
  const r = cascadeDeleteStakeholders(rows, scores, joins, ['a']);
  assert.deepEqual(r.stakeholders.map((s) => s.id), ['b']);
  assert.equal(r.scores.a, undefined);
  assert.equal(r.joins.a, undefined);
  assert.equal(r.joins.b, joins.b);
});
ok('cascade reference honesty: untouched stores return their input reference', () => {
  const rows = [mk('a'), mk('b')];
  const scores = { b: {} };   // nothing for a
  const joins = { b: [] };    // nothing for a
  const r = cascadeDeleteStakeholders(rows, scores, joins, ['a']);
  assert.equal(r.scores, scores);
  assert.equal(r.joins, joins);
  const none = cascadeDeleteStakeholders(rows, scores, joins, []);
  assert.equal(none.stakeholders, rows);
  assert.equal(none.landed, 0);
});
ok('an archived record deletes through the same cascade (the two-step end state)', () => {
  const rows = [mk('a')];
  const arch = bulkArchive(rows, ['a'], STAMP, 'u-me');
  const r = cascadeDeleteStakeholders(arch.next, { a: {} }, { a: [] }, ['a']);
  assert.deepEqual(r.stakeholders, []);
  assert.deepEqual(r.scores, {});
  assert.deepEqual(r.joins, {});
});

/* ── HONEST-COUNT COPY (the Phase-17 snackbar pattern) ──────────────────── */
ok('archiveSummary: landed / partial / zero + singular at 1', () => {
  assert.equal(archiveSummary(3, 3), 'Archived 3 stakeholders');
  assert.equal(archiveSummary(1, 1), 'Archived 1 stakeholder');
  assert.equal(archiveSummary(2, 3), 'Archived 2 stakeholders · 1 already archived');
  assert.equal(archiveSummary(0, 2), 'No change — 2 stakeholders already archived');
});
ok('restoreSummary + deleteForeverSummary mirror the pattern', () => {
  assert.equal(restoreSummary(2, 2), 'Restored 2 stakeholders');
  assert.equal(restoreSummary(1, 2), 'Restored 1 stakeholder · 1 already active');
  assert.equal(restoreSummary(0, 1), 'No change — 1 stakeholder already active');
  assert.equal(deleteForeverSummary(2), 'Deleted 2 stakeholders forever');
  assert.equal(deleteForeverSummary(1), 'Deleted 1 stakeholder forever');
});
ok('entry-point label + view copy', () => {
  assert.equal(archivedToggleLabel(2), 'Archived (2)');
  assert.ok(ARCHIVED_VIEW_LINE.includes('Restore to bring them back'));
  assert.ok(ARCHIVED_EMPTY_LINE.startsWith('No archived stakeholders'));
});

console.log(`\narchive-test: ${passed} assertions passed`);
