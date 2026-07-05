#!/usr/bin/env node
/* community-test.mjs — node asserts on the Community page's PURE logic
 * (src/app/pages/community-logic.js + the shared cross-link formulas in
 * src/app/modals/stakeholder-logic.js), expected values taken FROM THE SEALED
 * BOX TEXT ("Community — invest in the community: applications → manager
 * approval → tracked investments" in src/guide.jsx: moneyK/money formatters,
 * isDecided, approvedLabel, valueScore, VOTE CONTROL, FY ROLLUPS, MODAL BLANK
 * DEFAULTS, MODAL VALIDATION strings, LANDING defs, the make-real upsert and
 * the forward-design manager Approve).
 * Run: node scripts/community-test.mjs                                       */
import assert from 'node:assert/strict';
import {
  moneyK, money, isDecided, approvedLabel, communityEntryAmount, valueScore,
  applyVote, voteCounts, fyStartYear, allocInFY, communityRollup,
  askAmountText, askSuffix, blankApp, draftFromApp, communityMissing,
  missingToolbarReadout, missingFootReadout, upsertCommunity,
  canApprove, approveApplication, regionOptionsFor, toggleMarket, toggleValue,
  yearOf, COMMUNITY_FILTER_DEFS, COMMUNITY_SORT_FIELDS, COMMUNITY_SEARCH_KEYS,
  COMMUNITY_EMPTY_TEXT, COMMUNITY_FOOTER_EXPLAINER,
  filterCommunity, sortCommunity,
} from '../src/app/pages/community-logic.js';
import { stakeholderCumulativeUSD } from '../src/app/modals/stakeholder-logic.js';
import {
  COMMUNITY_KINDS, COMMUNITY_STAGES, COMMUNITY_ASK_TYPES,
  COMMUNITY_RECURRENCE, COMMUNITY_GIVING_MODES,
} from '../src/app/data/catalogs.js';
import { SEED_COMMUNITY } from '../src/app/data/seed.js';

let passed = 0;
const ok = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name); };

console.log('community-test: sealed Community formulas + record logic\n');

/* ── CATALOG ENUMS (sealed verbatim) ─────────────────────────────────────── */
ok('sealed enums: kinds · stages · ask types · recurrence · giving modes', () => {
  assert.deepEqual(COMMUNITY_KINDS, [
    'Philanthropy', 'Volunteering', 'Corporate Giving', 'Political Action (PAC)',
    'Sustainability', 'Social Impact',
  ]);
  assert.deepEqual(COMMUNITY_STAGES, [
    'Idea', 'Proposed', 'Under Review', 'Approved', 'Active', 'Complete', 'Declined',
  ]);
  assert.deepEqual(COMMUNITY_ASK_TYPES, [
    'Funding', 'Volunteer hours', 'Endorsement', 'In-kind', 'Political contribution',
  ]);
  assert.deepEqual(COMMUNITY_RECURRENCE, ['One-time', 'Annual', 'Multi-year']);
  assert.deepEqual(COMMUNITY_GIVING_MODES, ['Monetary', 'In-Kind', 'Mix']);
});

/* ── FORMATTERS (sealed moneyK / money) ──────────────────────────────────── */
ok('moneyK: sealed compact tiers ($N · $Nk rounded · $Nm 0-or-1 decimal)', () => {
  assert.equal(moneyK(0), '$0');
  assert.equal(moneyK(999), '$999');
  assert.equal(moneyK(1000), '$1k');
  assert.equal(moneyK(25400), '$25k');   // rounded thousands
  assert.equal(moneyK(235000), '$235k');
  assert.equal(moneyK(1000000), '$1m');  // even millions: no decimal
  assert.equal(moneyK(1500000), '$1.5m'); // else one decimal
  assert.equal(moneyK(undefined), '$0'); // Number(n)||0 guard
});
ok('money: "$" + toLocaleString', () => {
  assert.equal(money(150000), '$' + (150000).toLocaleString());
  assert.equal(money(null), '$' + (0).toLocaleString());
});

/* ── isDecided (sealed: Approved | Active | Complete) ────────────────────── */
ok('isDecided: exactly the committed set', () => {
  for (const s of ['Approved', 'Active', 'Complete']) assert.equal(isDecided(s), true, s);
  for (const s of ['Idea', 'Proposed', 'Under Review', 'Declined', '', undefined]) {
    assert.equal(isDecided(s), false, String(s));
  }
});

/* ── approvedLabel (sealed { text, tone } table) ─────────────────────────── */
ok('approvedLabel: Declined/neg · TBD/muted · No Expense/muted · money/pos', () => {
  assert.deepEqual(approvedLabel({ stage: 'Declined' }), { text: 'Declined', tone: 'neg' });
  assert.deepEqual(approvedLabel({ stage: 'Idea' }), { text: 'TBD', tone: 'muted' });
  assert.deepEqual(approvedLabel({ stage: 'Approved', approvedAmount: 0 }),
    { text: 'No Expense', tone: 'muted' });
  assert.deepEqual(approvedLabel({ stage: 'Active', approvedAmount: 60000 }),
    { text: money(60000), tone: 'pos' });
});

/* ── communityEntryAmount + the Ask display (sealed) ─────────────────────── */
ok('communityEntryAmount: USD → approvedLabel text; else "{amount} {unit}"; else "-"', () => {
  assert.equal(communityEntryAmount({ unit: 'USD', stage: 'Active', approvedAmount: 60000 }),
    money(60000));
  assert.equal(communityEntryAmount({ unit: 'hours', amount: 200 }), '200 hours');
  assert.equal(communityEntryAmount({ unit: '', amount: 0 }), '-');
});
ok('Ask row: money/unit value + " · recurrence" (+ " · N yr" only when years > 1)', () => {
  assert.equal(askAmountText({ unit: 'USD', amount: 25000 }), money(25000));
  assert.equal(askAmountText({ unit: 'hours', amount: 200 }), '200 hours');
  assert.equal(askSuffix({ recurrence: 'One-time', years: 1 }), ' · One-time');
  assert.equal(askSuffix({ recurrence: 'Multi-year', years: 3 }), ' · Multi-year · 3 yr');
});

/* ── VALUE SCORE (sealed manual mean, 0–10) ──────────────────────────────── */
ok('valueScore = (licenseToOperate + relationshipImpact) / 2', () => {
  assert.equal(valueScore({ licenseToOperate: 7, relationshipImpact: 8 }), 7.5);
  assert.equal(valueScore({}), 0);
  assert.equal(valueScore({ licenseToOperate: 10, relationshipImpact: 10 }), 10);
});

/* ── VOTES (sealed toggle + tolerant tally; abstain unreachable) ─────────── */
ok('applyVote: set · overwrite · toggle-off; abstain cleared in two clicks', () => {
  let v = applyVote({}, 'u1', 'for');
  assert.deepEqual(v, { u1: 'for' });
  v = applyVote(v, 'u1', 'against');            // overwrite
  assert.deepEqual(v, { u1: 'against' });
  v = applyVote(v, 'u1', 'against');            // re-click clears
  assert.deepEqual(v, {});
  // sealed: a seeded abstain is OVERWRITTEN by a click (votes[uid] !== choice)…
  v = applyVote({ u1: 'abstain' }, 'u1', 'for');
  assert.deepEqual(v, { u1: 'for' });
  // …and the same button then toggles off to no-vote (two clicks total).
  assert.deepEqual(applyVote(v, 'u1', 'for'), {});
});
ok('voteCounts: for/against/abstain baseline; arbitrary strings counted from 0', () => {
  assert.deepEqual(voteCounts({}), { for: 0, against: 0, abstain: 0 });
  assert.deepEqual(voteCounts({ a: 'for', b: 'for', c: 'against', d: 'abstain' }),
    { for: 2, against: 1, abstain: 1 });
  const c = voteCounts({ a: 'maybe' }); // (counts[v] || 0) tolerance — never NaN
  assert.equal(c.maybe, 1);
  assert.equal(c.for, 0);
});

/* ── FY MATH (sealed fyStartYear / allocInFY / rollups) ──────────────────── */
ok('fyStartYear: calendar default; custom start month/day boundary; null guards', () => {
  assert.equal(fyStartYear('2026-03-15'), 2026);
  assert.equal(fyStartYear('2026-01-01'), 2026);   // m === fsMonth && day >= fsDay
  assert.equal(fyStartYear('2026-10-31', 11, 1), 2025); // before the Nov-1 FY start
  assert.equal(fyStartYear('2026-11-01', 11, 1), 2026); // on the boundary
  assert.equal(fyStartYear(''), null);
  assert.equal(fyStartYear('not-a-date'), null);
});
ok('allocInFY: gates + One-time / Annual / Multi-year spreads', () => {
  const oneTime = { stage: 'Approved', approvedAmount: 60000, recurrence: 'One-time', dateApproved: '2026-04-14' };
  assert.equal(allocInFY(oneTime, 2026), 60000);
  assert.equal(allocInFY(oneTime, 2027), 0);
  const annual = { stage: 'Active', approvedAmount: 10000, recurrence: 'Annual', dateApproved: '2025-06-01' };
  assert.equal(allocInFY(annual, 2024), 0);
  assert.equal(allocInFY(annual, 2025), 10000);
  assert.equal(allocInFY(annual, 2027), 10000);   // every FY from start
  const multi = { stage: 'Active', approvedAmount: 150000, recurrence: 'Multi-year', years: 3, dateApproved: '2026-01-22' };
  assert.equal(allocInFY(multi, 2026), 50000);    // appr / n
  assert.equal(allocInFY(multi, 2028), 50000);
  assert.equal(allocInFY(multi, 2029), 0);        // past startFY + n
  // gates: undecided → 0; decided but appr <= 0 → 0; start falls back to createdAt
  assert.equal(allocInFY({ stage: 'Proposed', approvedAmount: 9999, recurrence: 'One-time', dateApproved: '2026-01-01' }, 2026), 0);
  assert.equal(allocInFY({ stage: 'Approved', approvedAmount: 0, recurrence: 'One-time', dateApproved: '2026-01-01' }, 2026), 0);
  assert.equal(allocInFY({ stage: 'Approved', approvedAmount: 500, recurrence: 'One-time', createdAt: '2026-02-02T10:00:00.000Z' }, 2026), 500);
});
ok('communityRollup on the sealed seed (pinned now): requested 235k · approved 210k (computed, never rendered) · annual/3YR 110k', () => {
  const r = communityRollup(SEED_COMMUNITY, { now: new Date(2026, 6, 4) });
  assert.equal(r.curFY, 2026);
  // requested counts ONLY unit === "USD" ask amounts (ca-02's 200 hours → 0)
  assert.equal(r.requested, 150000 + 25000 + 60000);
  // approved = decided approvedAmounts (ca-01 Active + ca-04 Approved)
  assert.equal(r.approved, 150000 + 60000);
  // annual: ca-01 Multi-year 150000/3 + ca-04 One-time 60000, both FY26
  assert.equal(r.annual, 50000 + 60000);
  // 3YR: this FY + two prior (nothing decided before FY26 in the seed)
  assert.equal(r.cumulative, 110000);
  assert.equal(moneyK(r.requested), '$235k');
  assert.equal(moneyK(r.annual), '$110k');
});

/* ── BLANK DEFAULTS (sealed MODAL BLANK, verbatim) ───────────────────────── */
ok('blankApp: every sealed default', () => {
  const u = { id: 'u-sam', title: 'Community Relations Manager' };
  const b = blankApp(u, { id: 'ca-test', now: '2026-07-05T00:00:00.000Z', today: '2026-07-05' });
  assert.equal(b.id, 'ca-test');
  assert.equal(b.name, '');
  assert.equal(b.kind, 'Philanthropy');
  assert.equal(b.stage, 'Idea');
  assert.equal(b.summary, ''); assert.equal(b.description, ''); assert.equal(b.rationale, '');
  assert.equal(b.submitter, 'u-sam');
  assert.equal(b.submitterRole, 'Community Relations Manager');
  assert.equal(b.dateSubmitted, '2026-07-05');
  assert.equal(b.representedStakeholderId, '');
  assert.equal(b.recipient, '');
  assert.deepEqual(b.linkedStakeholders, []);
  assert.deepEqual(b.markets, []); assert.deepEqual(b.regions, []); assert.deepEqual(b.issues, []);
  assert.equal(b.askType, 'Funding');
  assert.equal(b.amount, 0);
  assert.equal(b.unit, 'USD');
  assert.equal(b.recurrence, 'One-time');
  assert.equal(b.years, 1);
  assert.equal(b.givingMode, 'Monetary');
  assert.equal(b.timeline, ''); assert.equal(b.decisionDeadline, ''); assert.equal(b.dateApproved, '');
  assert.deepEqual(b.budget, { total: 0, requested: 0, otherFunding: 0, inKind: '' });
  assert.equal(b.approvedAmount, 0);
  assert.equal(b.licenseToOperate, 5);
  assert.equal(b.relationshipImpact, 5);
  assert.deepEqual(b.risk, { reputational: '', legal: '', conflictOfInterest: false, attestation: false });
  assert.deepEqual(b.attachments, []);
  assert.deepEqual(b.votes, {});
  assert.deepEqual(b.owners, ['u-sam']);
  assert.equal(b.createdBy, 'u-sam');
  assert.equal(b.createdAt, '2026-07-05T00:00:00.000Z');
  assert.equal(b.updatedAt, '2026-07-05T00:00:00.000Z');
});
ok('draftFromApp: a deep copy (sealed JSON round-trip)', () => {
  const src = SEED_COMMUNITY[0];
  const d = draftFromApp(src);
  assert.notEqual(d, src);
  assert.notEqual(d.budget, src.budget);
  assert.deepEqual(d, src);
});

/* ── VALIDATION (sealed exact strings, exact order) ──────────────────────── */
ok('communityMissing: the blank misses exactly the sealed set, in order', () => {
  const u = { id: 'u1', title: 'T' };
  const b = blankApp(u, { id: 'x', now: 'n', today: '2026-07-05' });
  assert.deepEqual(communityMissing(b), [
    'Project name', 'One-line summary', 'Recipient', 'Description',
    'Why this, why now', 'Timeline', 'Amount', 'Markets', 'Regions', 'Issues',
    'Connected stakeholders', 'Total project cost', 'Attestation',
  ]);
});
ok('communityMissing: conditional strings — Years · Giving mode · Conflict description', () => {
  const valid = draftFromApp(SEED_COMMUNITY[0]);
  assert.deepEqual(communityMissing(valid), []);
  assert.deepEqual(communityMissing({ ...valid, years: 0 }), ['Years']);
  assert.deepEqual(
    communityMissing({ ...valid, kind: 'Corporate Giving', givingMode: '' }),
    ['Giving mode']);
  assert.deepEqual(
    communityMissing({ ...valid, risk: { ...valid.risk, conflictOfInterest: true } }),
    ['Conflict description']);
  assert.deepEqual(
    communityMissing({ ...valid, risk: { ...valid.risk, conflictOfInterest: true, conflictDetail: 'Managed by legal.' } }),
    []);
});
ok('all four sealed seed applications validate clean', () => {
  for (const a of SEED_COMMUNITY) {
    assert.deepEqual(communityMissing(a), [], a.id);
  }
});
ok('missing readouts: "{N} left" · "{N} field{s} left: {first 3}…"', () => {
  assert.equal(missingToolbarReadout(['A', 'B', 'C']), '3 left');
  assert.equal(missingFootReadout(['Amount']), '1 field left: Amount');
  assert.equal(missingFootReadout(['A', 'B', 'C']), '3 fields left: A, B, C');
  assert.equal(missingFootReadout(['A', 'B', 'C', 'D']), '4 fields left: A, B, C…');
  assert.equal(missingFootReadout([]), '');
});

/* ── THE ONE UPSERT (sealed make-real: front-insert · replace by id · ALWAYS
 * stamps updatedAt — the oracle's no-stamp page path is not replicated) ──── */
ok('upsertCommunity: create front-inserts + stamps; edit replaces in place + stamps', () => {
  const list = [{ id: 'a', updatedAt: 't0' }, { id: 'b', updatedAt: 't0' }];
  const created = upsertCommunity(list, { id: 'c' }, 't1');
  assert.deepEqual(created.map((x) => x.id), ['c', 'a', 'b']); // newest first
  assert.equal(created[0].updatedAt, 't1');
  const edited = upsertCommunity(list, { id: 'b', name: 'N' }, 't2');
  assert.deepEqual(edited.map((x) => x.id), ['a', 'b']);       // in place
  assert.equal(edited[1].updatedAt, 't2');                     // ALWAYS stamped
  assert.equal(edited[1].name, 'N');
});

/* ── MANAGER-GATED APPROVE (sealed forward-design, built real) ───────────── */
ok('canApprove: manager only (the sealed users/roles seam)', () => {
  assert.equal(canApprove({ role: 'manager' }), true);
  assert.equal(canApprove({ role: 'member' }), false);
  assert.equal(canApprove(null), false);
});
ok('approveApplication: stage Approved + approverId/approvedAt stamps; dateApproved defaults only when unset', () => {
  const a = approveApplication(
    { id: 'x', stage: 'Under Review', dateApproved: '' },
    { approverId: 'u-alex', now: '2026-07-05T12:00:00.000Z', today: '2026-07-05' });
  assert.equal(a.stage, 'Approved');
  assert.equal(a.approverId, 'u-alex');
  assert.equal(a.approvedAt, '2026-07-05T12:00:00.000Z');
  assert.equal(a.dateApproved, '2026-07-05');
  const kept = approveApplication(
    { id: 'y', stage: 'Idea', dateApproved: '2026-06-01' },
    { approverId: 'u-alex', now: 'n', today: '2026-07-05' });
  assert.equal(kept.dateApproved, '2026-06-01'); // hand-set date wins
});

/* ── MARKETS → REGIONS (sealed derivation + the declared cascade prune) ──── */
ok('regionOptionsFor: options derive from the CHOSEN markets', () => {
  assert.deepEqual(regionOptionsFor(['Americas']), ['United States', 'Canada', 'Mexico']);
  assert.deepEqual(regionOptionsFor([]), []); // → "Pick a market first" empty state
});
ok('toggleMarket: deselecting a market cascade-prunes its orphaned regions (declared)', () => {
  const d = { markets: ['Americas', 'EMEA'], regions: ['United States', 'Europe'] };
  const next = toggleMarket(d, 'EMEA');
  assert.deepEqual(next.markets, ['Americas']);
  assert.deepEqual(next.regions, ['United States']); // Europe pruned, never stranded
  const add = toggleMarket({ markets: [], regions: [] }, 'LATAM');
  assert.deepEqual(add.markets, ['LATAM']);
});
ok('toggleValue: in/out toggle', () => {
  assert.deepEqual(toggleValue(['a'], 'b'), ['a', 'b']);
  assert.deepEqual(toggleValue(['a', 'b'], 'a'), ['b']);
});

/* ── LANDING defs (sealed filterDefs / sortFields / searchKeys / copy) ───── */
ok('filterDefs: sealed key/label set; stage defaults "Idea"; yearOf guards', () => {
  assert.deepEqual(COMMUNITY_FILTER_DEFS.map((d) => [d.key, d.label]), [
    ['kind', 'Type'], ['issues', 'Issues'], ['markets', 'Markets'],
    ['regions', 'Regions'], ['stage', 'Status'], ['year', 'Year created'],
  ]);
  const stageDef = COMMUNITY_FILTER_DEFS.find((d) => d.key === 'stage');
  assert.equal(stageDef.get({}), 'Idea');
  assert.equal(yearOf('2026-05-28T21:05:00.000Z'), '2026');
  // Bare-date guard: parsed at LOCAL midnight (the module's shared parseLocal)
  // so Jan-1 never shifts into the prior year in a negative-offset timezone.
  assert.equal(yearOf('2026-01-01'), '2026');
  assert.equal(yearOf(''), '');
  assert.equal(yearOf('junk'), '');
});
ok('sortFields: sealed keys/labels; _updated falls back to createdAt', () => {
  assert.deepEqual(COMMUNITY_SORT_FIELDS.map((f) => [f.key, f.label]), [
    ['name', 'Name'], ['stage', 'Status'],
    ['_updated', 'Last updated'], ['_created', 'Date added'],
  ]);
  const upd = COMMUNITY_SORT_FIELDS.find((f) => f.key === '_updated');
  assert.equal(upd.get({ createdAt: 'c' }), 'c');
  assert.equal(upd.get({ createdAt: 'c', updatedAt: 'u' }), 'u');
});
ok('searchKeys: ONLY name/recipient/summary (issues are never searched)', () => {
  assert.deepEqual(COMMUNITY_SEARCH_KEYS, ['name', 'recipient', 'summary']);
  const hit = filterCommunity(SEED_COMMUNITY, { query: 'cleanup' });
  assert.deepEqual(hit.map((a) => a.id), ['ca-02']);
  // "Education" is an ISSUE on ca-01 (and "Procurement Reform" on ca-03) but
  // issues are NOT searched — neither term hits name/recipient/summary ⇒ 0
  assert.equal(filterCommunity(SEED_COMMUNITY, { query: 'education' }).length, 0);
  assert.equal(filterCommunity(SEED_COMMUNITY, { query: 'procurement reform' }).length, 0);
});
ok('sealed copy: empty text + footer explainer, verbatim', () => {
  assert.equal(COMMUNITY_EMPTY_TEXT, 'No applications yet. Create one to begin.');
  assert.equal(COMMUNITY_FOOTER_EXPLAINER,
    'Value is the average of two inputs: how much the engagement improves ' +
    'your license to operate and how much the engagement strengthens relationships.');
});
ok('filter + sort pipeline over the seed', () => {
  const filtered = filterCommunity(SEED_COMMUNITY, { filters: { kind: ['Philanthropy'] } });
  assert.deepEqual(filtered.map((a) => a.id), ['ca-01']);
  const sorted = sortCommunity(SEED_COMMUNITY, { key: 'name', dir: 'asc' });
  assert.deepEqual(sorted.map((a) => a.name),
    [...SEED_COMMUNITY.map((a) => a.name)].sort((x, y) => x.localeCompare(y)));
});

/* ── CROSS-LINK: stakeholderCumulativeUSD (sealed plain USD sum, no FX) ──── */
ok('stakeholderCumulativeUSD: Σ decided approvedAmounts of affiliated entries', () => {
  assert.equal(stakeholderCumulativeUSD('sh-07', SEED_COMMUNITY), 150000); // represented, Active
  assert.equal(stakeholderCumulativeUSD('sh-17', SEED_COMMUNITY), 60000);  // represented, Approved
  assert.equal(stakeholderCumulativeUSD('sh-06', SEED_COMMUNITY), 0);      // linked but Proposed
});

console.log(`\ncommunity-test: ${passed} assertions groups passed`);
