/* community-logic.js — the Community page's PURE logic, built from the sealed
 * box "Community — invest in the community: applications → manager approval →
 * tracked investments (FX-aware)" in src/guide.jsx (the ORACLE GROUND TRUTH
 * sections: moneyK/money, isDecided, approvedLabel, valueScore, VOTE CONTROL,
 * FY ROLLUPS, MODAL BLANK DEFAULTS, MODAL VALIDATION, LANDING defs). Node-
 * testable: no DOM, no React (scripts/community-test.mjs asserts this module).
 *
 * FORWARD-DESIGN boundary (sealed): multi-currency/FX (committedFxRate,
 * monetizedValue) and case-by-case monetization are NOT built — the oracle is
 * USD-only and every rollup below is a plain USD sum. The ONE forward-design
 * this phase ships is the sealed MANAGER-GATED APPROVE action
 * (approveApplication below — "the rebuild adds a formal MANAGER-ONLY Approve
 * action that moves an application to Approved and stamps approverId +
 * approvedAt"); the free stage select stays as the sealed oracle baseline.
 */
import { MARKETS } from '../data/catalogs.js';
import { activeStakeholders } from '../data/workspace.js';
import { displayName } from '../../../design-system/components/stakeholder-table.js';
import {
  isDecided, money, approvedLabel, communityEntryAmount, todayYMD,
} from '../modals/stakeholder-logic.js';

/* Sealed cross-link formulas live in stakeholder-logic.js (their single
 * source since the modal phase); re-exported so community surfaces and tests
 * read one path. */
export { isDecided, money, approvedLabel, communityEntryAmount, todayYMD };

/* ── moneyK (sealed compact formatter, rollup strip) — >= $1m → "$Nm" (one
 * decimal unless an even number of millions); >= $1k → rounded "$Nk";
 * else "$N". ─────────────────────────────────────────────────────────────── */
export function moneyK(n) {
  const v = Number(n) || 0;
  if (v >= 1000000) return '$' + (v / 1000000).toFixed(v % 1000000 === 0 ? 0 : 1) + 'm';
  if (v >= 1000) return '$' + Math.round(v / 1000) + 'k';
  return '$' + v;
}

/* ── VALUE SCORE (sealed, manual): (licenseToOperate + relationshipImpact)/2,
 * 0–10; both hand-entered 0–10 inputs, never derived. The bar renders at
 * vs/10 of full scale (ui-linear-progress value is 0..1); readouts show
 * vs.toFixed(1) (card) / vs.toFixed(1) + " / 10" (profile + editor). ─────── */
export function valueScore(app) {
  return ((Number(app.licenseToOperate) || 0) + (Number(app.relationshipImpact) || 0)) / 2;
}

/* ── VOTES (sealed VOTE CONTROL, advisory): toggle semantics — casting your
 * current choice deletes it; anything else overwrites. NO ROLE GATE (sealed:
 * vote() checks nothing about the caller). Returns a NEW map (state-safe). ── */
export function applyVote(votes, userId, choice) {
  const next = { ...(votes || {}) };
  if (next[userId] === choice) delete next[userId];
  else next[userId] = choice;
  return next;
}

/* Sealed tally: counts initialize { for, against, abstain } and the
 * (counts[v] || 0) form tolerates ARBITRARY vote strings (counted from 0,
 * never NaN). Only for/against ever RENDER — abstain exists in seed data but
 * no control sets it (sealed: a third button is decided with the user). */
export function voteCounts(votes) {
  const counts = { for: 0, against: 0, abstain: 0 };
  Object.values(votes || {}).forEach((v) => { counts[v] = (counts[v] || 0) + 1; });
  return counts;
}

/* ── FY ROLLUPS (sealed, USD, fiscal-year aware). fsMonth/fsDay default 1/1 —
 * the pure-suite default (REAL as of Phase 11: community.jsx passes the LIVE
 * appConfig.fiscalStartMonth/Day through useCompanyCatalogs().fiscal).
 * DECLARED: the oracle parses bare dates with new Date(dateStr) (UTC — a
 * negative-offset timezone shifts Jan-1 into the prior FY); the repo-wide
 * timezone guard (local-midnight parse for bare YYYY-MM-DD, the shared
 * formatDateLong/planDate rule) is applied here for the same reason. ──────── */
function parseLocal(raw) {
  if (raw instanceof Date) return raw;
  if (!raw) return null;
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(raw))
    ? new Date(raw + 'T00:00:00')
    : new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

/* fyStartYear (sealed formula): the year the date's fiscal year STARTED —
 * y when (m > fsMonth || (m === fsMonth && day >= fsDay)), else y-1;
 * null for empty/invalid. */
export function fyStartYear(dateStr, fsMonth = 1, fsDay = 1) {
  const d = parseLocal(dateStr);
  if (!d) return null;
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const y = d.getFullYear();
  return (m > fsMonth || (m === fsMonth && day >= fsDay)) ? y : y - 1;
}

/* allocInFY (sealed): the approved USD a DECIDED application contributes to
 * fiscal year `fy`. Start FY from dateApproved || createdAt; Multi-year
 * spreads appr/n over n years (n = max(1, years)); Annual repeats appr every
 * FY from start; One-time lands only in the start FY. */
export function allocInFY(a, fy, fsMonth = 1, fsDay = 1) {
  const appr = Number(a.approvedAmount) || 0;
  if (!isDecided(a.stage) || appr <= 0) return 0;
  const startFY = fyStartYear(a.dateApproved || a.createdAt, fsMonth, fsDay);
  if (startFY == null) return 0;
  const n = a.recurrence === 'Multi-year' ? Math.max(1, Number(a.years) || 1) : 1;
  if (a.recurrence === 'Multi-year') return (fy >= startFY && fy < startFY + n) ? appr / n : 0;
  if (a.recurrence === 'Annual') return fy >= startFY ? appr : 0;
  return fy === startFY ? appr : 0; // One-time (else)
}

/* communityRollup (sealed): requested = raw USD-unit ASK amounts only
 * (non-USD units contribute 0; amount, NOT approvedAmount) · approved =
 * decided approvedAmounts — COMPUTED BUT NEVER RENDERED (sealed: the strip
 * shows only Requested / Annual / 3YR Total; do NOT invent a display) ·
 * annual = Σ allocInFY(a, curFY) · cumulative = this FY + 2 prior. */
export function communityRollup(community, { now = new Date(), fsMonth = 1, fsDay = 1 } = {}) {
  const curFY = fyStartYear(now, fsMonth, fsDay);
  let requested = 0;
  let approved = 0;
  let annual = 0;
  let cumulative = 0;
  for (const a of community || []) {
    requested += a.unit === 'USD' ? (Number(a.amount) || 0) : 0;
    if (isDecided(a.stage)) approved += Number(a.approvedAmount) || 0;
    annual += allocInFY(a, curFY, fsMonth, fsDay);
    cumulative += allocInFY(a, curFY, fsMonth, fsDay)
      + allocInFY(a, curFY - 1, fsMonth, fsDay)
      + allocInFY(a, curFY - 2, fsMonth, fsDay);
  }
  return { requested, approved, annual, cumulative, curFY };
}

/* ── ASK display (sealed card meta): "Ask" value = money(amount) for USD else
 * "{amount} {unit}"; muted suffix " · {recurrence}" + " · {years} yr" only
 * when years > 1. ─────────────────────────────────────────────────────────── */
export function askAmountText(a) {
  return a.unit === 'USD' ? money(a.amount) : `${a.amount} ${a.unit || ''}`;
}
export function askSuffix(a) {
  return ` · ${a.recurrence}` + (Number(a.years) > 1 ? ` · ${a.years} yr` : '');
}

/* ── BLANK DEFAULTS (sealed MODAL BLANK verbatim; id minted by the caller via
 * uid("ca")). DECLARED: the oracle stamps createdAt/updatedAt with the bare
 * day; the rebuild stamps full ISO through nowStamp (the sealed
 * timestamp-precision rule the PAGE-UPSERT make-real cites).
 * REBUILD EXTENSIONS (additive — the sealed MODAL BLANK omits these): site ''
 * · state '' · geography '' are initialized so the editor's sealed Site/State/
 * Geography selects never flip undefined→value (the plan-logic newPlan
 * precedent). ─────────────────────────────────────────────────────────────── */
export function blankApp(currentUser, { id, now, today } = {}) {
  const day = today || new Date().toISOString().slice(0, 10);
  const stamp = now || new Date().toISOString();
  return {
    id,
    name: '', kind: 'Philanthropy', stage: 'Idea',
    summary: '', description: '', rationale: '',
    submitter: currentUser ? currentUser.id : '',
    submitterRole: currentUser ? currentUser.title : '',
    dateSubmitted: day,
    representedStakeholderId: '',
    recipient: '',
    linkedStakeholders: [],
    markets: [], regions: [], issues: [],
    askType: 'Funding', amount: 0, unit: 'USD', recurrence: 'One-time', years: 1,
    givingMode: 'Monetary',
    timeline: '', decisionDeadline: '', dateApproved: '',
    budget: { total: 0, requested: 0, otherFunding: 0, inKind: '' },
    approvedAmount: 0,
    licenseToOperate: 5, relationshipImpact: 5,
    risk: { reputational: '', legal: '', conflictOfInterest: false, attestation: false },
    attachments: [],
    votes: {},
    owners: currentUser ? [currentUser.id] : [],
    createdBy: currentUser ? currentUser.id : '',
    createdAt: stamp, updatedAt: stamp,
    site: '', state: '', geography: '', // REBUILD EXTENSIONS (see above)
  };
}

/* Edit draft (sealed: deep copy via JSON parse/stringify). */
export function draftFromApp(existing) {
  return JSON.parse(JSON.stringify(existing));
}

/* ── VALIDATION (sealed MODAL VALIDATION — exact check order, exact display
 * strings, rendered verbatim; valid = empty. attachments genuinely optional). */
export function communityMissing(d) {
  const missing = [];
  if (!String(d.name || '').trim()) missing.push('Project name');
  if (!String(d.summary || '').trim()) missing.push('One-line summary');
  if (!String(d.recipient || '').trim()) missing.push('Recipient');
  if (!String(d.description || '').trim()) missing.push('Description');
  if (!String(d.rationale || '').trim()) missing.push('Why this, why now');
  if (!d.submitter) missing.push('Submitter');
  if (!d.dateSubmitted) missing.push('Date submitted');
  if (!String(d.timeline || '').trim()) missing.push('Timeline');
  if (!(Number(d.amount) > 0)) missing.push('Amount');
  if (!d.years || Number(d.years) < 1) missing.push('Years');
  if (!(d.markets || []).length) missing.push('Markets');
  if (!(d.regions || []).length) missing.push('Regions');
  if (!(d.issues || []).length) missing.push('Issues');
  if (!(d.linkedStakeholders || []).length) missing.push('Connected stakeholders');
  if (!(d.owners || []).length) missing.push('Owners');
  if (!(Number((d.budget || {}).total) > 0)) missing.push('Total project cost');
  if (d.kind === 'Corporate Giving' && !d.givingMode) missing.push('Giving mode');
  if ((d.risk || {}).conflictOfInterest &&
      !String((d.risk || {}).conflictDetail || '').trim()) missing.push('Conflict description');
  if (!(d.risk || {}).attestation) missing.push('Attestation');
  return missing;
}

/* Sealed missing readouts: asPage toolbar "{N} left" (full list in the title);
 * modal foot "{N} field{s} left: {first 3 comma-joined}{… when more than 3}"
 * ("field" singular when N === 1). */
export function missingToolbarReadout(missing) {
  return `${missing.length} left`;
}
export function missingFootReadout(missing) {
  if (!missing.length) return '';
  return `${missing.length} field${missing.length === 1 ? '' : 's'} left: ` +
    missing.slice(0, 3).join(', ') + (missing.length > 3 ? '…' : '');
}

/* ── THE ONE UPSERT (sealed MAKE-REAL rule): front-insert on create, replace
 * in place by id on edit, and updatedAt stamps on EVERY save — the oracle's
 * two diverging save paths (page never stamping; app-level stamping) are NOT
 * replicated. ────────────────────────────────────────────────────────────── */
export function upsertCommunity(list, app, now) {
  const entry = { ...app, updatedAt: now };
  const exists = (list || []).some((a) => a.id === app.id);
  return exists
    ? list.map((a) => (a.id === app.id ? entry : a))
    : [entry, ...(list || [])];
}

/* ── MANAGER-GATED APPROVE (sealed FORWARD-DESIGN mandate, built real this
 * phase): moves the application to Approved and stamps approverId +
 * approvedAt; votes inform the decision, they never make it. dateApproved
 * defaults to today when unset (it drives the FY rollups — sealed helper
 * copy). The gate is the SURFACE's manager check (canApprove); the free
 * stage select stays as the sealed oracle baseline alongside it. */
export function canApprove(user) {
  return !!user && user.role === 'manager';
}
export function approveApplication(app, { approverId, now, today }) {
  return {
    ...app,
    stage: 'Approved',
    approverId,
    approvedAt: now,
    dateApproved: app.dateApproved || today,
  };
}

/* ── MARKETS → REGIONS (sealed ChipMultiSelect): region options derive from
 * the CHOSEN markets; empty options → "Pick a market first".
 * OPEN RULING (sealed ORPHANED-REGIONS make-real decision — RESERVED FOR THE
 * USER, not yet ruled): the box says "decide with the user whether market
 * deselection cascade-prunes the now-orphaned regions (the cleaner behavior)
 * or keeps them visible and removable". CASCADE-PRUNE ships below as the
 * INTERIM DEFAULT only — the one behavior sealed either way is that the
 * oracle's silent invisible stranding is NOT replicated. If the user rules
 * visible-and-removable, only toggleMarket changes. ───────────────────────── */
export function regionOptionsFor(markets, marketMap = MARKETS) {
  /* marketMap: the LIVE Settings-fed companyMarkets (Phase 11) — the seed
   * constant stays the default so the pure suite asserts the sealed shape. */
  return (markets || []).flatMap((m) => marketMap[m] || []);
}
export function toggleMarket(d, market, marketMap = MARKETS) {
  const cur = d.markets || [];
  const markets = cur.includes(market)
    ? cur.filter((m) => m !== market)
    : [...cur, market];
  const opts = regionOptionsFor(markets, marketMap);
  return { markets, regions: (d.regions || []).filter((r) => opts.includes(r)) };
}
export function toggleValue(list, v) {
  return (list || []).includes(v) ? list.filter((x) => x !== v) : [...(list || []), v];
}

/* ── LANDING defs (sealed CommunityView filterDefs / sortFields / searchKeys /
 * copy, verbatim; the oracle's dead local filter pipeline is NOT carried). ── */

/* yearOf (sealed "Year created" getter: String(getFullYear()) for a parseable
 * date, else ""). Parses through the SAME bare-date local-midnight guard as
 * the FY math above (parseLocal) — identical for full-ISO stamps; a bare
 * YYYY-MM-DD no longer shifts into the prior year in negative-offset
 * timezones (the DECLARED repo-wide timezone rule). */
export function yearOf(iso) {
  const d = parseLocal(iso);
  return d ? String(d.getFullYear()) : '';
}

export const COMMUNITY_FILTER_DEFS = [
  { key: 'kind', label: 'Type', get: (a) => a.kind },
  { key: 'issues', label: 'Issues', get: (a) => a.issues || [] },
  { key: 'markets', label: 'Markets', get: (a) => a.markets || [] },
  { key: 'regions', label: 'Regions', get: (a) => a.regions || [] },
  { key: 'stage', label: 'Status', get: (a) => a.stage || 'Idea' },
  { key: 'year', label: 'Year created', get: (a) => yearOf(a.createdAt) },
];

export const COMMUNITY_SORT_FIELDS = [
  { key: 'name', label: 'Name', get: (a) => a.name },
  { key: 'stage', label: 'Status', get: (a) => a.stage || '' },
  { key: '_updated', label: 'Last updated', get: (a) => a.updatedAt || a.createdAt || '' },
  { key: '_created', label: 'Date added', get: (a) => a.createdAt || '' },
];

/* Sealed: the live search matches ONLY these three keys (issues are
 * filterable via the Issues chips, never searched). */
export const COMMUNITY_SEARCH_KEYS = ['name', 'recipient', 'summary'];

export const COMMUNITY_EMPTY_TEXT = 'No applications yet. Create one to begin.';

/* Sealed landing footer explainer (after the "{n} applications ·" group). */
export const COMMUNITY_FOOTER_EXPLAINER =
  'Value is the average of two inputs: how much the engagement improves ' +
  'your license to operate and how much the engagement strengthens ' +
  'relationships.';

/* Search + filter + sort (pure, shared by cards + table — the same shape the
 * Plans landing reads). */
export function filterCommunity(items, { query = '', filters = {} } = {}) {
  const q = query.trim().toLowerCase();
  return (items || []).filter((a) => {
    if (q && !COMMUNITY_SEARCH_KEYS.some((k) => String(a[k] || '').toLowerCase().includes(q))) {
      return false;
    }
    for (const def of COMMUNITY_FILTER_DEFS) {
      const on = filters[def.key];
      if (!on || !on.length) continue;
      const v = def.get(a);
      const vs = Array.isArray(v) ? v : [v];
      if (!vs.some((x) => on.includes(x))) return false;
    }
    return true;
  });
}

export function sortCommunity(items, sort) {
  if (!sort || !sort.key) return items;
  const def = COMMUNITY_SORT_FIELDS.find((f) => f.key === sort.key);
  if (!def) return items;
  const dir = sort.dir === 'desc' ? -1 : 1;
  return [...items].sort((a, b) =>
    String(def.get(a)).localeCompare(String(def.get(b))) * dir);
}

/* ── PHASE 24 FIX (archive audit F5): ACTIVE-ONLY OPTION BUILDERS ──────────
 * Option lists author NEW references, so they never offer archived records;
 * resolution of EXISTING references (chosen chips, the already-picked target)
 * stays RAW at the call sites — a recoverable record never dead-ends. */

/* StakeholderPicker options (sealed mechanics unchanged: options exclude
 * selected; label = display name, sub = "org · type"). Active-only. */
export function stakeholderPickerOptions(stakeholders, selected) {
  const chosen = selected || [];
  return activeStakeholders(stakeholders)
    .filter((s) => !chosen.includes(s.id))
    .map((s) => ({
      value: s.id,
      label: displayName(s) || s.name,
      sub: `${s.org || ''} · ${s.type || ''}`,
    }));
}

/* "Stakeholder / Organization Targeted" select options: None + the ACTIVE
 * records — plus the CURRENTLY-CHOSEN record even when archived (RAW
 * resolution of an existing reference: the saved pick must keep rendering,
 * never a blank select), listed first so the control always resolves. */
export function representedStakeholderOptions(stakeholders, currentId) {
  const act = activeStakeholders(stakeholders);
  const cur = currentId && !act.some((s) => s.id === currentId)
    ? (stakeholders || []).find((s) => s.id === currentId)
    : null;
  return [
    { value: '', label: 'None' },
    ...(cur ? [cur] : []).concat(act).map((s) => ({
      value: s.id, label: displayName(s) || s.name,
    })),
  ];
}
