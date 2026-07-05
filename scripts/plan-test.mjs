#!/usr/bin/env node
/* plan-test.mjs — node asserts on the Plan page's PURE logic
 * (src/app/pages/plan-logic.js + src/app/data/sep-models.js), expected values
 * taken FROM THE SEALED BOX TEXT ("Relationship recommendation alignment" +
 * "Plan algorithm — sector/type model catalog" + "Plan algorithm — FACTOR
 * KEY" + "Plan page — plan elements" in src/guide.jsx).
 * Run: node scripts/plan-test.mjs                                            */
import assert from 'node:assert/strict';
import {
  PLAN_SECTOR_MODELS, PLAN_GOAL_MODELS, resolveSectorModel, resolveGoalModel,
  goalName, modelFormula, PLAN_STAGES, stageSlug,
  clamp01, planSignals, factorSignal, modelScore, bandFor,
  BAND_HIGH, BAND_MEDIUM, topFactorEntries, topFactors, planFit, fitReason,
  effectiveBand, overridePick, applyOverride, comparePlanRows, PRIO_RANK,
  planMissing, missingReadout, newPlan, planStakeholderIds, scrubPlanRecord,
  availableCommunity, filterPlans, sortPlans, PLAN_EMPTY_TEXT,
} from '../src/app/pages/plan-logic.js';

let passed = 0;
const ok = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name); };
const approx = (a, b, eps = 1e-9) => assert.ok(Math.abs(a - b) < eps, `${a} ≉ ${b}`);

console.log('plan-test: sealed plan algorithm + plan-page pure logic\n');

/* ── MODEL CATALOG (sealed verbatim: 11 sectors + 7 goal models, weights
 * summing to 1.0, 4 factors each) ────────────────────────────────────────── */
ok('catalog counts + order: 11 sectors, 7 plan types, catalog order', () => {
  assert.equal(PLAN_SECTOR_MODELS.length, 11);
  assert.equal(PLAN_GOAL_MODELS.length, 7);
  assert.deepEqual(PLAN_SECTOR_MODELS.map((m) => m.id), [
    'energy', 'technology', 'retail', 'financial', 'education', 'utilities',
    'government', 'healthcare', 'nonprofit', 'agriculture', 'auto',
  ]);
  assert.deepEqual(PLAN_GOAL_MODELS.map((m) => m.id), [
    'general', 'shared-value', 'crisis', 'activist', 'dei', 'community', 'union',
  ]);
});

ok('every model: exactly 4 factors, weights sum to 1.0, label + desc on each', () => {
  for (const m of [...PLAN_SECTOR_MODELS, ...PLAN_GOAL_MODELS]) {
    assert.equal(m.factors.length, 4, m.id);
    approx(m.factors.reduce((a, f) => a + f.w, 0), 1.0);
    for (const f of m.factors) {
      assert.ok(f.label && f.desc, `${m.id}:${f.k} must carry label + desc`);
    }
  }
});

ok('sealed formulas verbatim (spot: energy, utilities, crisis machine-keys)', () => {
  const energy = resolveSectorModel('energy');
  assert.deepEqual(energy.factors.map((f) => [f.k, f.w]),
    [['I', 0.25], ['LTSA', 0.3], ['ES', 0.25], ['IC', 0.2]]);
  const utilities = resolveSectorModel('utilities');
  assert.deepEqual(utilities.factors.map((f) => [f.k, f.w]),
    [['RC', 0.35], ['PS', 0.3], ['TO', 0.2], ['ST', 0.15]]);
  // Sealed CRISIS MACHINE-KEY rule: plain U and EP, never "U_adjusted".
  const crisis = resolveGoalModel('crisis');
  assert.deepEqual(crisis.factors.map((f) => [f.k, f.w]),
    [['I', 0.3], ['U', 0.35], ['EP', 0.15], ['RI', 0.2]]);
});

ok('MODEL-SCOPED labels: the sealed collisions carry different labels per model', () => {
  const f = (m, k) => m.factors.find((x) => x.k === k).label;
  // IC — Energy "Innovation Collaboration" vs DEI "Inclusive Communication"
  assert.equal(f(resolveSectorModel('energy'), 'IC'), 'Innovation Collaboration');
  assert.equal(f(resolveGoalModel('dei'), 'IC'), 'Inclusive Communication');
  // FS — Nonprofit "Funding Sustainability" vs Union "Financial Sustainability"
  assert.equal(f(resolveSectorModel('nonprofit'), 'FS'), 'Funding Sustainability');
  assert.equal(f(resolveGoalModel('union'), 'FS'), 'Financial Sustainability');
  // CE — Retail "Consumer Expectations" vs Government "Community Engagement"
  //      vs Auto "Customer Engagement"
  assert.equal(f(resolveSectorModel('retail'), 'CE'), 'Consumer Expectations');
  assert.equal(f(resolveSectorModel('government'), 'CE'), 'Community Engagement');
  assert.equal(f(resolveSectorModel('auto'), 'CE'), 'Customer Engagement');
  // SI — Retail "Sustainability Initiatives" vs Government "Service Improvement"
  assert.equal(f(resolveSectorModel('retail'), 'SI'), 'Sustainability Initiatives');
  assert.equal(f(resolveSectorModel('government'), 'SI'), 'Service Improvement');
  // CI — Shared Value "Collaborative Innovation" vs DEI "Community Involvement"
  assert.equal(f(resolveGoalModel('shared-value'), 'CI'), 'Collaborative Innovation');
  assert.equal(f(resolveGoalModel('dei'), 'CI'), 'Community Involvement');
});

ok('unknown model id resolves to the FIRST model (sealed robustness rule)', () => {
  assert.equal(resolveSectorModel('nope').id, 'energy');
  assert.equal(resolveGoalModel(undefined).id, 'general');
  assert.equal(goalName('nope'), 'General Engagement');
});

ok('modelFormula = "k×w" joined with " + " (sealed fmt)', () => {
  assert.equal(modelFormula(resolveGoalModel('general')),
    'I×0.25 + U×0.25 + EP×0.25 + IR×0.25');
});

/* ── SIGNALS (sealed verbatim math) ──────────────────────────────────────── */
const mkCtx = (over = {}) => ({
  scores: { 's1': { 'tm1': { x: 5, y: 5 } } },
  team: [{ id: 'tm1', userId: 'u1', weight: 1 }],
  community: [],
  planIssues: [],
  ...over,
});

ok('signal derivation: power/align/opp/urgency/engage from weightedCoord', () => {
  const sig = planSignals({ id: 's1', issues: [] }, mkCtx());
  approx(sig.power, 0.75);   // (5+10)/20
  approx(sig.align, 0.75);
  approx(sig.opp, 0.25);
  approx(sig.urgency, 0.5);  // .5*.75 + .5*.25
  approx(sig.engage, 0.75);  // .5*.75 + .5*.75
});

ok('issueRel: overlap/planIssues.length; NEUTRAL 0.5 when the plan has no issues', () => {
  const s = { id: 's1', issues: ['AI', 'Education'] };
  approx(planSignals(s, mkCtx()).issueRel, 0.5); // no plan issues → 0.5
  approx(planSignals(s, mkCtx({ planIssues: ['AI', 'Taxation'] })).issueRel, 0.5); // 1/2
  approx(planSignals(s, mkCtx({ planIssues: ['AI', 'Education'] })).issueRel, 1);
});

ok('commTie saturates at 2 affiliated community entries (clamp01(n/2))', () => {
  const comm = (n) => Array.from({ length: n }, (_, i) => ({
    id: 'c' + i, representedStakeholderId: 's1',
  }));
  approx(planSignals({ id: 's1' }, mkCtx({ community: comm(1) })).commTie, 0.5);
  approx(planSignals({ id: 's1' }, mkCtx({ community: comm(2) })).commTie, 1);
  approx(planSignals({ id: 's1' }, mkCtx({ community: comm(5) })).commTie, 1);
});

/* ── LEXICON (sealed COMPLETE map M + the 14-factor extension + fallback) ── */
const SIG = { power: 0.9, align: 0.6, opp: 0.4, urgency: 0.65, engage: 0.75, issueRel: 0.3, commTie: 0.8 };

ok('lexicon: base buckets (I/FS→power · U/RI/IR/RM→urgency · NP→opp · align set · engage set)', () => {
  approx(factorSignal('I', SIG), 0.9);
  approx(factorSignal('FS', SIG), 0.9);
  for (const k of ['U', 'RI', 'IR', 'RM']) approx(factorSignal(k, SIG), 0.65);
  approx(factorSignal('NP', SIG), 0.4);
  for (const k of ['SA', 'LTSA', 'SI', 'CT', 'ER']) approx(factorSignal(k, SIG), 0.6);
  for (const k of ['EP', 'SE', 'EC', 'CE', 'MR', 'DC', 'DT', 'TI', 'IS']) {
    approx(factorSignal(k, SIG), 0.75);
  }
  for (const k of ['CNA', 'PD', 'IM']) approx(factorSignal(k, SIG), 0.8);
  for (const k of ['DI', 'IC', 'EO', 'IE', 'ES']) approx(factorSignal(k, SIG), 0.3);
});

ok('lexicon: sealed blends (RC/OR power+opp · MV/TB/CTS commTie+align · CI commTie+engage)', () => {
  approx(factorSignal('RC', SIG), 0.7 * 0.9 + 0.3 * 0.4);
  approx(factorSignal('OR', SIG), 0.6 * 0.9 + 0.4 * 0.4);
  approx(factorSignal('MV', SIG), 0.5 * 0.8 + 0.5 * 0.6);
  approx(factorSignal('TB', SIG), 0.5 * 0.6 + 0.5 * 0.8);
  approx(factorSignal('CTS', SIG), 0.5 * 0.8 + 0.5 * 0.6);
  approx(factorSignal('CI', SIG), 0.5 * 0.8 + 0.5 * 0.75);
});

ok('lexicon: the sealed 14-factor EXTENSION (no catalog factor may hit 0.5 fallback)', () => {
  approx(factorSignal('PS', SIG), 0.5 * 0.3 + 0.5 * 0.4); // issueRel+opp blend
  approx(factorSignal('TO', SIG), 0.75);  // engage
  approx(factorSignal('ST', SIG), 0.65);  // urgency
  approx(factorSignal('RA', SIG), 0.6);   // align
  for (const k of ['SDI', 'MI', 'PE', 'TA', 'MA', 'EA']) approx(factorSignal(k, SIG), 0.75);
  approx(factorSignal('HPR', SIG), 0.5 * 0.8 + 0.5 * 0.6);
  for (const k of ['AE', 'SAP', 'SCS']) approx(factorSignal(k, SIG), 0.3);
  // EVERY catalog factor resolves off-fallback: verify none returns the
  // fallback constant with a signal set where no expression can equal 0.5.
  const odd = { power: 0.91, align: 0.13, opp: 0.87, urgency: 0.89, engage: 0.52, issueRel: 0.07, commTie: 0.99 };
  for (const m of [...PLAN_SECTOR_MODELS, ...PLAN_GOAL_MODELS]) {
    for (const f of m.factors) {
      assert.notEqual(factorSignal(f.k, odd), 0.5, `${m.id}:${f.k} fell to the fallback`);
    }
  }
});

ok('lexicon: a genuinely unknown key survives as neutral 0.5 (robustness net)', () => {
  approx(factorSignal('ZZ', SIG), 0.5);
  approx(factorSignal('U_adjusted', SIG), 0.5); // the forbidden key IS unknown
});

/* ── BLEND + BANDS (sealed: score01 = 0.5·sector + 0.5·goal; ≥67 High,
 * ≥40 Medium, else Low) ─────────────────────────────────────────────────── */
ok('modelScore = weighted mean of factor signals', () => {
  const m = { factors: [{ k: 'I', w: 0.5 }, { k: 'NP', w: 0.5 }] };
  approx(modelScore(m, SIG), 0.5 * 0.9 + 0.5 * 0.4);
});

ok('band thresholds at the sealed 67/40 edges', () => {
  assert.equal(BAND_HIGH, 67);
  assert.equal(BAND_MEDIUM, 40);
  assert.equal(bandFor(67), 'High');
  assert.equal(bandFor(66), 'Medium');
  assert.equal(bandFor(40), 'Medium');
  assert.equal(bandFor(39), 'Low');
  assert.equal(bandFor(100), 'High');
  assert.equal(bandFor(0), 'Low');
});

ok('planFit blends sector and goal EQUALLY (sealed 0.5 + 0.5)', () => {
  const s = { id: 's1', issues: [] };
  const ctx = mkCtx();
  const sector = resolveSectorModel('energy');
  const goal = resolveGoalModel('general');
  const sig = planSignals(s, ctx);
  const expect = Math.round((0.5 * modelScore(sector, sig) + 0.5 * modelScore(goal, sig)) * 100);
  const fit = planFit(s, sector, goal, ctx);
  assert.equal(fit.score, expect);
  assert.equal(fit.band, bandFor(expect));
  assert.equal(fit.reason, fitReason(fit.top));
});

/* ── MODEL-SCOPED TOP FACTORS (sealed rule: (model,key)-scoped entries; the
 * IC and FS collisions yield TWO entries each, never one anonymous sum) ──── */
ok('top-factors: Energy IC + DEI IC stay TWO model-scoped entries', () => {
  const entries = topFactorEntries(resolveSectorModel('energy'), resolveGoalModel('dei'));
  const ics = entries.filter((e) => e.k === 'IC');
  assert.equal(ics.length, 2);
  const labels = ics.map((e) => e.label).sort();
  assert.deepEqual(labels, ['Inclusive Communication', 'Innovation Collaboration']);
  // never summed: each carries its OWN model's weight
  assert.deepEqual(ics.map((e) => e.w).sort(), [0.2, 0.3]);
  // top-3 by weight desc: DI .35, DEI-IC .3, LTSA .3 (stable: sector first)
  const top = topFactors(resolveSectorModel('energy'), resolveGoalModel('dei'));
  assert.equal(top.length, 3);
  assert.ok(top.includes('Diversity Initiatives'));
});

ok('top-factors: Nonprofit FS + Union FS stay TWO model-scoped entries', () => {
  const entries = topFactorEntries(resolveSectorModel('nonprofit'), resolveGoalModel('union'));
  const fss = entries.filter((e) => e.k === 'FS');
  assert.equal(fss.length, 2);
  assert.deepEqual(fss.map((e) => e.label).sort(),
    ['Financial Sustainability', 'Funding Sustainability']);
  assert.deepEqual(fss.map((e) => e.w).sort(), [0.2, 0.25]);
});

/* ── OVERRIDE MECHANICS (sealed gate) ────────────────────────────────────── */
ok('effectiveBand = override || suggestion', () => {
  assert.equal(effectiveBand('Low', 'High'), 'Low');
  assert.equal(effectiveBand(null, 'High'), 'High');
});

ok('picking the SUGGESTED band CLEARS the override (sealed clear-on-equal)', () => {
  assert.equal(overridePick('High', 'High'), null);
  assert.equal(overridePick('Low', 'High'), 'Low');
});

ok('applyOverride sets on band, DELETES the key on null (sealed)', () => {
  const next = applyOverride({}, 'sh-1', 'Low');
  assert.deepEqual(next, { 'sh-1': 'Low' });
  const cleared = applyOverride(next, 'sh-1', null);
  assert.deepEqual(cleared, {});
  assert.ok(!('sh-1' in cleared));
});

/* ── ROW ORDER (binding schema: manual Priority first, then effective band,
 * then the internal numeric core desc) ──────────────────────────────────── */
ok('comparePlanRows: manual priority outranks fit; fit band then score desc', () => {
  assert.deepEqual(PRIO_RANK, { High: 0, Medium: 1, Low: 2 });
  const rows = [
    { id: 'a', priority: 'Low', band: 'High', score: 99 },
    { id: 'b', priority: 'High', band: 'Low', score: 10 },
    { id: 'c', priority: 'High', band: 'High', score: 70 },
    { id: 'd', priority: 'High', band: 'High', score: 90 },
  ].sort(comparePlanRows);
  assert.deepEqual(rows.map((r) => r.id), ['d', 'c', 'b', 'a']);
});

/* ── PLAN_STAGES (sealed enum: five stages, NO Declined; default Idea) ───── */
ok('PLAN_STAGES exact — no "Declined" (the sealed divergence from Community)', () => {
  assert.deepEqual(PLAN_STAGES, ['Idea', 'Proposed', 'Under Review', 'Active', 'Complete']);
  assert.ok(!PLAN_STAGES.includes('Declined'));
  assert.equal(stageSlug('Under Review'), 'under-review');
});

/* ── VALIDATION (sealed planMissing: exact strings, exact order) ─────────── */
const validPlan = () => ({
  title: 'FY26 Plan', workspaceId: 'ws-1', market: 'Americas',
  region: 'United States', owners: ['u1'], summary: 's', status: 'Idea',
  scenarioSolves: 'a', scenarioApproach: 'b', scenarioOutcome: 'c',
  issues: ['AI'], team: [{ userId: 'u1', role: '' }],
  strategies: [{ id: 'st1', title: 'T', how: '', timing: '', ownerId: '' }],
  measurement: 'm',
});

ok('planMissing: the full sealed list, in order, on an empty plan', () => {
  assert.deepEqual(planMissing({}), [
    'Plan name', 'Workspace', 'Market', 'Region', 'Owners', 'Summary',
    'Status', 'What this plan solves', 'Phased approach', 'Expected outcome',
    'Issues', 'Team', 'Tactics', 'Measurement',
  ]);
});

ok('planMissing: a complete plan validates (empty array)', () => {
  assert.deepEqual(planMissing(validPlan()), []);
});

ok('"Insert Plan Name" (the literal placeholder) is REJECTED as a plan name', () => {
  assert.ok(planMissing({ ...validPlan(), title: 'Insert Plan Name' }).includes('Plan name'));
  assert.ok(planMissing({ ...validPlan(), title: '   ' }).includes('Plan name'));
});

ok('"Tactics" requires non-empty strategies AND every title non-blank (sealed)', () => {
  assert.ok(planMissing({ ...validPlan(), strategies: [] }).includes('Tactics'));
  assert.ok(planMissing({
    ...validPlan(),
    strategies: [{ id: 'st1', title: '  ' }],
  }).includes('Tactics'));
});

ok('missingReadout: "{N} left: first, second…" (full list rides the tooltip)', () => {
  assert.equal(missingReadout(['A', 'B', 'C']), '3 left: A, B…');
  assert.equal(missingReadout(['A', 'B']), '2 left: A, B');
  assert.equal(missingReadout([]), '');
});

/* ── NEW PLAN (sealed defaults + guards) ─────────────────────────────────── */
ok('newPlan defaults: "{ws.name} Engagement Plan", energy/general, Idea, empties', () => {
  const p = newPlan({
    workspaces: [{ id: 'w1', name: 'Hawk' }],
    activeWorkspaceId: 'w1', isMaster: false, id: 'plan-x', now: 'NOW',
  });
  assert.equal(p.title, 'Hawk Engagement Plan');
  assert.equal(p.workspaceId, 'w1');
  assert.equal(p.sectorModel, 'energy');
  assert.equal(p.goalModel, 'general');
  assert.equal(p.status, 'Idea');
  assert.equal(p.market, '');
  assert.equal(p.region, '');
  assert.deepEqual(p.owners, []);
  assert.deepEqual(p.goals, []);
  assert.deepEqual(p.goalNotes, {});
  assert.deepEqual(p.issues, []);
  assert.deepEqual(p.team, []);
  assert.deepEqual(p.strategies, []);
  assert.deepEqual(p.stakeholderIds, []);
  assert.deepEqual(p.communityIds, []);
  assert.equal(p.measurement, '');
  assert.deepEqual(p.priorityOverrides, {});
  assert.equal(p.createdAt, 'NOW');
  assert.equal(p.updatedAt, 'NOW');
});

ok('newPlan on Master picks workspaces[0]; EMPTY list yields undefined, no crash (sealed guard)', () => {
  const p = newPlan({
    workspaces: [{ id: 'w1', name: 'Hawk' }, { id: 'w2', name: 'B' }],
    activeWorkspaceId: '__master', isMaster: true, id: 'x', now: 'NOW',
  });
  assert.equal(p.workspaceId, 'w1');
  const empty = newPlan({ workspaces: [], isMaster: true, id: 'x', now: 'NOW' });
  assert.equal(empty.workspaceId, undefined);
  assert.equal(empty.title, 'Engagement Plan'); // bare, no crash
});

/* ── MEMBERSHIP + MIGRATION (sealed decisions) ───────────────────────────── */
ok('planStakeholderIds: explicit set wins; NO field → the oracle baseline (full roster)', () => {
  assert.deepEqual(planStakeholderIds({ stakeholderIds: ['a'] }, ['a', 'b']), ['a']);
  assert.deepEqual(planStakeholderIds({}, ['a', 'b']), ['a', 'b']);
  assert.deepEqual(planStakeholderIds({ stakeholderIds: [] }, ['a', 'b']), []);
});

ok('scrubPlanRecord strips the 9 goalNotes-bug junk keys (0–8), keeps everything else', () => {
  const dirty = {
    id: 'p', title: 'T',
    0: 'g', 1: 'o', 2: 'a', 3: 'l', 4: 'N', 5: 'o', 6: 't', 7: 'e', 8: 's',
    goalNotes: { G: 'note' },
  };
  const clean = scrubPlanRecord(dirty);
  for (let i = 0; i <= 8; i++) assert.ok(!(String(i) in clean));
  assert.equal(clean.title, 'T');
  assert.deepEqual(clean.goalNotes, { G: 'note' });
  const already = { id: 'p' };
  assert.equal(scrubPlanRecord(already), already); // identity when clean
});

/* ── COMMUNITY LINKER (sealed market AND region filter) ──────────────────── */
ok('availableCommunity: not-linked AND market AND region scoped (sealed keep rule)', () => {
  const comm = [
    { id: 'c1', markets: ['Americas'], regions: ['United States'] },
    { id: 'c2', market: 'Americas', region: 'United States' }, // singular fields count too
    { id: 'c3', markets: ['LATAM'], regions: ['Brazil'] },
    { id: 'c4', markets: ['Americas'], regions: ['Canada'] },
  ];
  const got = availableCommunity(comm, 'Americas', 'United States', ['c2']);
  assert.deepEqual(got.map((c) => c.id), ['c1']); // c2 linked, c3/c4 out of scope
});

/* ── LANDING search/filter/sort (sealed defs) ────────────────────────────── */
ok('filterPlans: searchKeys title/market/region/status; filters incl. type + year', () => {
  const plans = [
    { id: 'p1', title: 'Hawk Plan', market: 'Americas', region: 'United States', status: 'Active', goalModel: 'shared-value', issues: ['AI'], createdAt: '2026-02-06T18:00:00.000Z' },
    { id: 'p2', title: 'EMEA Plan', market: 'EMEA', region: 'Europe', status: 'Idea', goalModel: 'general', issues: [], createdAt: '2025-11-01T18:00:00.000Z' },
  ];
  assert.equal(filterPlans(plans, { query: 'hawk' }).length, 1);
  assert.equal(filterPlans(plans, { query: 'europe' }).length, 1);
  assert.equal(filterPlans(plans, { filters: { type: ['Generating Shared Value'] } })[0].id, 'p1');
  assert.equal(filterPlans(plans, { filters: { year: ['2025'] } })[0].id, 'p2');
  assert.equal(filterPlans(plans, { filters: { status: ['Active'] } })[0].id, 'p1');
});

ok('sortPlans: title asc/desc; _updated falls back to createdAt (sealed)', () => {
  const plans = [
    { id: 'a', title: 'Zebra', createdAt: '2026-01-01' },
    { id: 'b', title: 'Alpha', createdAt: '2026-03-01' },
  ];
  assert.deepEqual(sortPlans(plans, { key: 'title', dir: 'asc' }).map((p) => p.id), ['b', 'a']);
  assert.deepEqual(sortPlans(plans, { key: '_updated', dir: 'desc' }).map((p) => p.id), ['b', 'a']);
  assert.equal(sortPlans(plans, { key: null }).length, 2);
});

ok('sealed empty text verbatim', () => {
  assert.equal(PLAN_EMPTY_TEXT,
    'No plans yet. Create one to begin building a stakeholder engagement plan.');
});

ok('clamp01 (sealed): clamps below 0 and above 1', () => {
  assert.equal(clamp01(-1), 0);
  assert.equal(clamp01(2), 1);
  assert.equal(clamp01(0.4), 0.4);
});

console.log(`\nplan-test: ${passed} assertions passed`);
