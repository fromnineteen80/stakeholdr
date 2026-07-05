/* plan-logic.js — the Plan page's PURE logic, built from the sealed boxes
 * "Relationship recommendation alignment" (the exact sepScore math + the
 * COMPLETE factor→signal lexicon + the 14-factor extension + the MODEL-SCOPED
 * TOP-FACTORS RULE), "Plan algorithm — sector/type model catalog" (the
 * BINDING ELEMENT-6 ROW SCHEMA's ordering), and "Plan page — plan elements"
 * (PLAN_STAGES, planMissing, newPlan defaults, override mechanics, landing
 * defs, goalNotes rules) in src/guide.jsx. Node-testable: no DOM, no React
 * (scripts/plan-test.mjs asserts this module).
 *
 * NAMING RULE (sealed): the oracle's sepScore/sepFactorSignal/SEP_* internals
 * are RENAMED here — the engine is "the plan algorithm", its output a
 * "relationship recommendation" / "Plan Fit".
 *
 * NUMERIC-READOUT RULING (sealed, wins everywhere): the 0–100 score survives
 * INTERNALLY ONLY — as the band cut-points (67/40) and the sort tie-break.
 * It never renders; every surface shows the BAND + model-scoped labels.
 */
import { weightedCoord } from '../data/engine.js';
import { affiliatedCommunity } from '../modals/stakeholder-logic.js';
import {
  PLAN_SECTOR_MODELS, PLAN_GOAL_MODELS,
  resolveSectorModel, resolveGoalModel, goalName, modelFormula,
} from '../data/sep-models.js';

/* Catalogs re-exported from their single source (data/sep-models.js). */
export {
  PLAN_SECTOR_MODELS, PLAN_GOAL_MODELS,
  resolveSectorModel, resolveGoalModel, goalName, modelFormula,
};

/* ── PLAN_STAGES (sealed enum, exact): default "Idea"; NOTE — NO "Declined"
 * stage (the key divergence from Community). ─────────────────────────────── */
export const PLAN_STAGES = ['Idea', 'Proposed', 'Under Review', 'Active', 'Complete'];

/* Stage slug for the token attribute hooks (colors live in tokens.css as
 * --ui-sys-stage-*; unknown stages fall back to on-surface-muted in CSS). */
export function stageSlug(stage) {
  return String(stage || '').toLowerCase().replace(/\s+/g, '-');
}

/* ── SIGNALS (sealed PER-STAKEHOLDER SIGNAL DERIVATION, verbatim math) ───── */
export function clamp01(v) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/* planSignals(s, ctx) — ctx = { scores, team, community, planIssues }.
 * wc = weightedCoord → power/align/opp/urgency/engage; issueRel = overlap of
 * the stakeholder's issues with the plan's (NEUTRAL 0.5 when the plan has no
 * issues); commTie saturates at 2 affiliated community entries. */
export function planSignals(s, ctx = {}) {
  const wc = weightedCoord(s.id, ctx.scores || {}, ctx.team || []);
  const power = clamp01((wc.y + 10) / 20);
  const align = clamp01((wc.x + 10) / 20);
  const opp = 1 - align;
  const urgency = clamp01(0.5 * power + 0.5 * opp);
  const engage = clamp01(0.5 * power + 0.5 * align);
  const pIssues = ctx.planIssues || [];
  const sIssues = s.issues || [];
  const issueRel = pIssues.length > 0
    ? clamp01(sIssues.filter((i) => pIssues.includes(i)).length / pIssues.length)
    : 0.5;
  const commTie = clamp01(affiliatedCommunity(s.id, ctx.community || []).length / 2);
  return { power, align, opp, urgency, engage, issueRel, commTie };
}

/* ── FACTOR → SIGNAL LEXICON (sealed COMPLETE map M, verbatim, PLUS the
 * REQUIRED 14-factor extension for the doc-only catalog keys — left unmapped
 * they would silently score neutral 0.5 and gut Plan Fit for the Utilities/
 * Government/Healthcare/Nonprofit/Agriculture/Auto models; sealed DO NOT
 * REPLICATE that hole). The neutral-0.5 fallback SURVIVES only as a
 * robustness net for a genuinely unknown key (bad data); with the extension
 * no catalog factor ever reaches it. ────────────────────────────────────── */
export function factorSignal(key, sig) {
  switch (key) {
    /* — the oracle's map M (35 keys, verbatim) — */
    case 'I': return sig.power;
    case 'FS': return sig.power;
    case 'RC': return 0.7 * sig.power + 0.3 * sig.opp;
    case 'OR': return 0.6 * sig.power + 0.4 * sig.opp;
    case 'U': return sig.urgency;
    case 'RI': return sig.urgency;
    case 'IR': return sig.urgency;
    case 'RM': return sig.urgency;
    case 'NP': return sig.opp;
    case 'EP': return sig.engage;
    case 'SE': return sig.engage;
    case 'EC': return sig.engage;
    case 'CE': return sig.engage;
    case 'MR': return sig.engage;
    case 'DC': return sig.engage;
    case 'DT': return sig.engage;
    case 'TI': return sig.engage;
    case 'IS': return sig.engage;
    case 'SA': return sig.align;
    case 'LTSA': return sig.align;
    case 'SI': return sig.align;
    case 'CT': return sig.align;
    case 'ER': return sig.align;
    case 'MV': return 0.5 * sig.commTie + 0.5 * sig.align;
    case 'TB': return 0.5 * sig.align + 0.5 * sig.commTie;
    case 'CI': return 0.5 * sig.commTie + 0.5 * sig.engage;
    case 'CTS': return 0.5 * sig.commTie + 0.5 * sig.align;
    case 'CNA': return sig.commTie;
    case 'PD': return sig.commTie;
    case 'IM': return sig.commTie;
    case 'DI': return sig.issueRel;
    case 'IC': return sig.issueRel;
    case 'EO': return sig.issueRel;
    case 'IE': return sig.issueRel;
    case 'ES': return sig.issueRel;
    /* — the sealed 14-factor EXTENSION (explicit assignments, verbatim) — */
    case 'PS': return 0.5 * sig.issueRel + 0.5 * sig.opp;
    case 'TO': return sig.engage;
    case 'ST': return sig.urgency;
    case 'RA': return sig.align;
    case 'SDI': return sig.engage;
    case 'MI': return sig.engage;
    case 'PE': return sig.engage;
    case 'HPR': return 0.5 * sig.commTie + 0.5 * sig.align;
    case 'AE': return sig.issueRel;
    case 'SAP': return sig.issueRel;
    case 'TA': return sig.engage;
    case 'MA': return sig.engage;
    case 'EA': return sig.engage;
    case 'SCS': return sig.issueRel;
    /* — the surviving robustness net (sealed): unknown key → neutral — */
    default: return 0.5;
  }
}

/* modelScore(model, sig) — weighted mean of the model's factor signals
 * (sealed: acc += w * signal, wsum += w; wsum ? acc/wsum : 0). */
export function modelScore(model, sig) {
  let acc = 0;
  let wsum = 0;
  for (const f of model.factors || []) {
    acc += f.w * factorSignal(f.k, sig);
    wsum += f.w;
  }
  return wsum ? acc / wsum : 0;
}

/* ── BANDS (sealed cut-points, the numeric core's ONLY survivors):
 * score >= 67 → High · score >= 40 → Medium · else Low. ────────────────── */
export const BAND_HIGH = 67;
export const BAND_MEDIUM = 40;
export function bandFor(score) {
  return score >= BAND_HIGH ? 'High' : score >= BAND_MEDIUM ? 'Medium' : 'Low';
}

/* ── MODEL-SCOPED TOP FACTORS (sealed rule, REQUIRED — resolves the oracle's
 * bare-key label collision): entries keyed by (model, key), each at its OWN
 * model's weight carrying its OWN model's label; a key shared by both picked
 * models yields TWO entries, never one anonymous sum (Energy IC "Innovation
 * Collaboration" vs DEI IC "Inclusive Communication"; Nonprofit FS "Funding
 * Sustainability" vs Union FS "Financial Sustainability"). Top-3 by weight
 * descending (stable sort keeps catalog order on ties). ─────────────────── */
export function topFactorEntries(sector, goal) {
  const entries = [];
  for (const m of [sector, goal]) {
    for (const f of m.factors || []) {
      entries.push({ model: m.id, k: f.k, w: f.w, label: f.label });
    }
  }
  return entries.sort((a, b) => b.w - a.w);
}
export function topFactors(sector, goal, n = 3) {
  return topFactorEntries(sector, goal).slice(0, n).map((e) => e.label);
}

/* ── PLAN FIT (the sealed recommendation): equal blend of the picked sector
 * and goal models → band. The score is INTERNAL (band cut + sort tie-break —
 * the never-a-number ruling); the surfaced parts are band + the model-scoped
 * "weighs" labels (the plain-English reason) + the zone's prescribed MOVE
 * (framed at the render, from the relationship engine's strategy). ───────── */
export function planFit(s, sector, goal, ctx) {
  const sig = planSignals(s, ctx);
  const score01 = 0.5 * modelScore(sector, sig) + 0.5 * modelScore(goal, sig);
  const score = Math.round(score01 * 100); // internal only — never renders
  const top = topFactors(sector, goal);
  return { band: bandFor(score), score, top, reason: fitReason(top) };
}

/* The one-line plain-English reason: the top-3 model-scoped labels (sealed
 * design point (c): the top factors ARE the human-readable reason). */
export function fitReason(top) {
  return `Weighs ${top.join(', ')}`;
}

/* ── OVERRIDE MECHANICS (sealed PRIORITY-OVERRIDE GATE, retargeted to the
 * PLAN FIT cell per the binding schema; manager-only is enforced at the
 * surface). ──────────────────────────────────────────────────────────────── */

/* Effective band = override || suggestion (sealed). */
export function effectiveBand(override, suggestedBand) {
  return override || suggestedBand;
}

/* Picking a band that EQUALS the suggestion CLEARS the override (sealed
 * onSet(b === suggestion.band ? null : b)). */
export function overridePick(picked, suggestedBand) {
  return picked === suggestedBand ? null : picked;
}

/* setPriorityOverride (sealed): band → set; falsy → delete the key. Returns
 * a NEW map (state-safe). */
export function applyOverride(overrides, shId, band) {
  const next = { ...(overrides || {}) };
  if (band) next[shId] = band;
  else delete next[shId];
  return next;
}

/* ── ROW ORDER (the BINDING ELEMENT-6 ROW SCHEMA's mandate): manual Priority
 * High → Medium → Low FIRST (never overridden by Fit), then within it the
 * effective Plan Fit band High → Medium → Low, tie-broken by the preserved
 * numeric core DESCENDING (internal only). rows: { priority, band, score }. */
export const PRIO_RANK = { High: 0, Medium: 1, Low: 2 };
export function comparePlanRows(a, b) {
  const pa = PRIO_RANK[a.priority] ?? 3;
  const pb = PRIO_RANK[b.priority] ?? 3;
  if (pa !== pb) return pa - pb;
  const ba = PRIO_RANK[a.band] ?? 3;
  const bb = PRIO_RANK[b.band] ?? 3;
  if (ba !== bb) return ba - bb;
  return (b.score || 0) - (a.score || 0);
}

/* ── VALIDATION (sealed planMissing array — exact order, exact strings;
 * Save disabled until empty). "Plan name" also rejects the literal
 * placeholder "Insert Plan Name" (sealed). ──────────────────────────────── */
export function planMissing(p) {
  const missing = [];
  const title = String(p.title || '').trim();
  if (!title || title === 'Insert Plan Name') missing.push('Plan name');
  if (!p.workspaceId) missing.push('Workspace');
  if (!p.market) missing.push('Market');
  if (!p.region) missing.push('Region');
  if (!(p.owners || []).length) missing.push('Owners');
  if (!String(p.summary || '').trim()) missing.push('Summary');
  if (!p.status) missing.push('Status');
  if (!String(p.scenarioSolves || '').trim()) missing.push('What this plan solves');
  if (!String(p.scenarioApproach || '').trim()) missing.push('Phased approach');
  if (!String(p.scenarioOutcome || '').trim()) missing.push('Expected outcome');
  if (!(p.issues || []).length) missing.push('Issues');
  if (!(p.team || []).length) missing.push('Team');
  if (!(p.strategies || []).length ||
      (p.strategies || []).some((st) => !String(st.title || '').trim())) {
    missing.push('Tactics');
  }
  if (!String(p.measurement || '').trim()) missing.push('Measurement');
  return missing;
}

/* Toolbar readout when invalid (sealed): "{N} left: {first two, comma-joined}
 * {ellipsis when more than 2}" — the FULL list rides the tooltip. */
export function missingReadout(missing) {
  if (!missing.length) return '';
  return `${missing.length} left: ${missing.slice(0, 2).join(', ')}` +
    (missing.length > 2 ? '…' : '');
}

/* ── NEW PLAN DEFAULTS (sealed newPlan, verbatim + the rebuild's real
 * per-plan membership): workspaceId = isMaster ? workspaces[0]?.id :
 * activeWorkspaceId (undefined-safe — an empty list yields undefined, never a
 * crash); title = "{workspace.name} Engagement Plan" when the workspace
 * resolves, bare "Engagement Plan" when it does not; sectorModel "energy",
 * goalModel "general" (both valid preselects — never an empty select).
 * stakeholderIds [] is the MAKE-REAL per-plan membership field (sealed
 * STAKEHOLDER MEMBERSHIP decision); plans WITHOUT the field read the oracle
 * baseline (the full workspace roster) via planStakeholderIds below. ─────── */
export function newPlan({ workspaces = [], activeWorkspaceId, isMaster = false, id, now }) {
  const workspaceId = isMaster
    ? (workspaces[0] && workspaces[0].id)
    : activeWorkspaceId;
  const ws = workspaces.find((w) => w.id === workspaceId);
  return {
    id,
    workspaceId,
    title: (ws ? ws.name + ' ' : '') + 'Engagement Plan',
    sectorModel: 'energy',
    goalModel: 'general',
    market: '', region: '',
    site: '', state: '', geography: '',
    owners: [],
    summary: '',
    status: 'Idea',
    scenarioSolves: '', scenarioApproach: '', scenarioOutcome: '',
    goals: [], // sealed DEAD field (only the seed plan populates it; nothing reads it)
    goalNotes: {},
    issues: [],
    team: [],
    strategies: [],
    stakeholderIds: [],
    communityIds: [],
    measurement: '',
    priorityOverrides: {},
    createdAt: now,
    updatedAt: now,
  };
}

/* ── MEMBERSHIP (sealed STAKEHOLDER MEMBERSHIP decision): element 6 is a REAL
 * per-plan set (stakeholderIds[]); the migration/seed baseline for a plan
 * WITHOUT the field = the oracle behavior — the full workspace roster. ───── */
export function planStakeholderIds(plan, rosterIds) {
  return Array.isArray(plan.stakeholderIds) ? plan.stakeholderIds : (rosterIds || []);
}

/* ── MIGRATION SCRUB (sealed goalNotes ORACLE-BUG consequence): plans touched
 * by the oracle's broken two-arg set() carry NINE JUNK KEYS — the characters
 * of the string "goalNotes" spread by index ({0:"g" … 8:"s"}). Strip the
 * numeric string keys 0–8 from every plan record before use. ─────────────── */
export function scrubPlanRecord(plan) {
  let dirty = false;
  for (let i = 0; i <= 8; i++) {
    if (Object.prototype.hasOwnProperty.call(plan, String(i))) { dirty = true; break; }
  }
  if (!dirty) return plan;
  const next = { ...plan };
  for (let i = 0; i <= 8; i++) delete next[String(i)];
  return next;
}

/* ── COMMUNITY LINKER (sealed PlanCommunity): available = entries NOT already
 * linked AND scoped to the plan's market AND region — keep c when
 * (!market OR c.markets includes it OR c.market === it) AND (!region OR
 * c.regions includes it OR c.region === it). The SURFACE additionally gates
 * on both being chosen (the "Select a market and region above…" note). ───── */
export function availableCommunity(community, market, region, linkedIds) {
  const linked = linkedIds || [];
  return (community || []).filter((c) =>
    !linked.includes(c.id) &&
    (!market || (c.markets || []).includes(market) || c.market === market) &&
    (!region || (c.regions || []).includes(region) || c.region === region));
}

/* ── DATES: planDate — the card/footer short stamp ("Updated {date}" /
 * "Saved · {date}"). Bare YYYY-MM-DD parses at local midnight (the shared
 * timezone guard); invalid → "-". */
export function planDate(raw) {
  if (!raw) return '-';
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(raw))
    ? new Date(raw + 'T00:00:00')
    : new Date(raw);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── LANDING DEFS (sealed PlanHome: filterDefs · sortFields · searchKeys ·
 * empty text · footer explainer — key/label/get, verbatim). ──────────────── */
export const PLAN_FILTER_DEFS = [
  { key: 'type', label: 'Type of plan', get: (p) => goalName(p.goalModel) },
  { key: 'issues', label: 'Issues', get: (p) => p.issues },
  { key: 'market', label: 'Market', get: (p) => p.market },
  { key: 'region', label: 'Region', get: (p) => p.region },
  { key: 'status', label: 'Status', get: (p) => p.status || 'Idea' },
  {
    key: 'year',
    label: 'Year created',
    get: (p) => {
      const d = new Date(p.createdAt || '');
      return isNaN(d.getTime()) ? '' : String(d.getFullYear());
    },
  },
];

export const PLAN_SORT_FIELDS = [
  { key: 'title', label: 'Plan name', get: (p) => p.title || '' },
  { key: 'status', label: 'Status', get: (p) => p.status || '' },
  { key: '_updated', label: 'Last updated', get: (p) => p.updatedAt || p.createdAt || '' },
  { key: '_created', label: 'Date added', get: (p) => p.createdAt || '' },
];

export const PLAN_SEARCH_KEYS = ['title', 'market', 'region', 'status'];

export const PLAN_EMPTY_TEXT =
  'No plans yet. Create one to begin building a stakeholder engagement plan.';

/* Sealed landing FOOTER explainer (after the "{n} plans ·" count group). */
export const PLAN_FOOTER_EXPLAINER =
  "Priority is suggested from each stakeholder's map position, issue " +
  "overlap, and community ties, weighted by the plan's sector and scenario " +
  'models.';

/* Sealed in-editor prioritization explainer (verbatim; "suggest" renders
 * bold and the ✦ styled at the surface). */
export const PRIORITIZE_EXPLAINER_PRE = 'We ';
export const PRIORITIZE_EXPLAINER_BOLD = 'suggest';
export const PRIORITIZE_EXPLAINER_POST =
  ' a priority for each stakeholder from their map position, issue overlap, ' +
  "and community ties - weighted by the factors below. It's a starting " +
  'point: managers can override any suggestion (look for the ';
export const PRIORITIZE_EXPLAINER_END = ').';

/* Sealed Personas add-on note (element-9 locked stub). */
export const PERSONAS_ADDON_NOTE =
  'Add-on - persona modeling from polling & listening sessions.';

/* Search + filter + sort over the plans (pure, shared by cards + table). */
export function filterPlans(plans, { query = '', filters = {} } = {}) {
  const q = query.trim().toLowerCase();
  return (plans || []).filter((p) => {
    if (q && !PLAN_SEARCH_KEYS.some((k) => String(p[k] || '').toLowerCase().includes(q))) {
      return false;
    }
    for (const def of PLAN_FILTER_DEFS) {
      const on = filters[def.key];
      if (!on || !on.length) continue;
      const v = def.get(p);
      const vs = Array.isArray(v) ? v : [v];
      if (!vs.some((x) => on.includes(x))) return false;
    }
    return true;
  });
}

export function sortPlans(plans, sort) {
  if (!sort || !sort.key) return plans;
  const def = PLAN_SORT_FIELDS.find((f) => f.key === sort.key);
  if (!def) return plans;
  const dir = sort.dir === 'desc' ? -1 : 1;
  return [...plans].sort((a, b) => {
    const va = def.get(a);
    const vb = def.get(b);
    return String(va).localeCompare(String(vb)) * dir;
  });
}
