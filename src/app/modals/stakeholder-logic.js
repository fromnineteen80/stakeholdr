/* stakeholder-logic.js — the StakeholderModal's PURE logic, factored out of
 * the JSX so node tests (scripts/modal-test.mjs) can assert it against the
 * SEALED BOX TEXT ("Create / edit stakeholder modal (StakeholderModal)" +
 * "Stakeholder profile (read-only modal)" + "Catalogs" + "Shared UI
 * primitives" + the Community box's cross-link formulas in src/guide.jsx).
 *
 * Shared formulas (displayName / normalizeUrl / formatPhone) are IMPORTED from
 * their single source beside the Lists logic — never re-declared here.
 */
import { CATEGORIES, TITLES, SITES } from '../data/catalogs.js';
import {
  displayName, normalizeUrl,
} from '../../../design-system/components/stakeholder-table.js';

/* today, YYYY-MM-DD — the sealed lastContact default (date-only field). */
export function todayYMD() {
  return new Date().toISOString().slice(0, 10);
}

/* BLANK-NEW DEFAULTS (sealed, verbatim): title "", firstName "", lastName "",
 * name "", org "", url "", isPerson false, photo null, category "Communities",
 * type = CATEGORIES["Communities"][0], market "Americas", region
 * "United States", geography "Local", priority "Medium", tags [], issues [],
 * owners = currentUser ? [currentUser.id] : [], status "Active", lastContact =
 * today (YYYY-MM-DD), notes "".
 * The fields below the sealed list (titleOther/email/phone/xAccount/site/
 * state) are bound by the sealed rows 4/5/8 and start empty — the sealed
 * blank paragraph does not enumerate them (they fall out of the spread). */
export function blankDraft(currentUser, categories = CATEGORIES) {
  return {
    title: '', firstName: '', lastName: '', name: '', org: '', url: '',
    isPerson: false, photo: null,
    category: 'Communities',
    type: (categories['Communities'] || [])[0] || '',
    market: 'Americas', region: 'United States', geography: 'Local',
    priority: 'Medium', tags: [], issues: [],
    owners: currentUser ? [currentUser.id] : [],
    status: 'Active', lastContact: todayYMD(), notes: '',
    titleOther: '', email: '', phone: '', xAccount: '', site: '', state: '',
  };
}

/* EDIT draft (sealed): { ...blank, ...existing, isPerson: !!(firstName ||
 * lastName) } — isPerson is INFERRED from the names, regardless of any stored
 * flag. */
export function draftFrom(existing, currentUser, categories = CATEGORIES) {
  const blank = blankDraft(currentUser, categories);
  if (!existing) return blank;
  return {
    ...blank,
    ...existing,
    isPerson: !!(existing.firstName || existing.lastName),
  };
}

/* VALIDATION (sealed shMissing list; the modal is valid only when empty).
 * Push order and EXACT display strings per the sealed box. */
export function shMissing(draft, sites = SITES) {
  const missing = [];
  if (!draft.org || !String(draft.org).trim()) missing.push('Organization');
  if (draft.isPerson &&
      !String(draft.firstName || '').trim() &&
      !String(draft.lastName || '').trim()) missing.push('Person name');
  if (draft.isPerson && draft.title === 'Other' &&
      !String(draft.titleOther || '').trim()) missing.push('Custom title');
  if (!draft.category) missing.push('Category');
  if (!draft.type) missing.push('Audience type');
  if (!draft.market) missing.push('Market');
  if (!draft.region) missing.push('Region');
  if (!draft.geography) missing.push('Geography');
  // "State (from site)": only when a chosen site HAS a state but draft.state
  // is unset — normally auto-filled, trips only on a malformed site (sealed).
  const site = draft.site ? (sites || []).find((s) => s.id === draft.site) : null;
  if (site && site.state && !draft.state) missing.push('State (from site)');
  return missing;
}

/* SUBMIT NAME COMPOSITION (sealed submit()): if isPerson, name =
 * displayName({title,titleOther,firstName,lastName}) || org (falls back to
 * org when the person name resolves empty; the "None" guard lives in
 * displayName + the TITLE_OPTIONS "" value). If NOT a person, the person
 * fields are CLEARED to "" and name = org. url = normalizeUrl(url) always. */
export function composeSubmit(draft) {
  const d = { ...draft };
  if (d.isPerson) {
    const computed = displayName({
      title: d.title, titleOther: d.titleOther,
      firstName: d.firstName, lastName: d.lastName,
    });
    d.name = computed || d.org;
  } else {
    d.title = ''; d.titleOther = ''; d.firstName = ''; d.lastName = '';
    d.name = d.org;
  }
  d.url = normalizeUrl(d.url);
  return d;
}

/* TITLE SELECT options (sealed Catalogs box): the ordered TITLES catalog with
 * the default "None" option carrying VALUE "" — the None guard: an empty
 * title contributes no display-name prefix. */
export const TITLE_OPTIONS = TITLES.map((t) => ({
  value: t === 'None' ? '' : t,
  label: t,
}));

/* titleCase(s) (sealed IssueSelector): split on whitespace, each word → first
 * char upper + rest lower, rejoined and trimmed. */
export function titleCase(s) {
  return String(s || '')
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : ''))
    .join(' ')
    .trim();
}

/* Every IssueSelector add titleCases and dedups (sealed selected.includes
 * guard). Returns the same array when nothing was added. */
export function addIssueValue(selected, raw) {
  const v = titleCase(raw);
  if (!v || selected.includes(v)) return selected;
  return [...selected, v];
}

/* Committing custom text splits on commas, titleCases each piece, and appends
 * only non-duplicate values (sealed commitDraft). */
export function commitCustomText(selected, text) {
  let next = selected;
  for (const piece of String(text || '').split(',')) {
    next = addIssueValue(next, piece);
  }
  return next;
}

/* The IssueSelector's render model (pure): selected chips, available company
 * chips (company values not yet selected), and whether the custom free-text
 * input renders — HIDDEN when restrict is set (sealed: Tags are limited to
 * the company set; Issues allow free custom entry). */
export function issueSelectorModel({ selected = [], company = [], restrict = false } = {}) {
  return {
    selected: [...selected],
    available: (company || []).filter((v) => !selected.includes(v)),
    showCustomInput: !restrict,
  };
}

/* ── Verbatim copy (single-sourced so the JSX and tests read one string) ── */

/* Create-only notice (sealed box 15; task-directed em dash). */
export const CREATE_NOTICE =
  "Score isn't set yet. Your team will be notified — they'll see this " +
  'stakeholder at the top of their Sheet and the count on Scoring.';

/* addStakeholder SYSTEM MESSAGE body (sealed, exact). */
export function scoringNeededBody(name, type) {
  return `New stakeholder added: ${name} (${type}). Please score them on the Scoring tab.`;
}

/* Delete-confirm body (sealed): "{displayName(existing) || existing.name} and
 * all of their scores will be permanently removed. This cannot be undone." */
export function deleteConfirmBody(existing) {
  const nm = displayName(existing) || (existing && existing.name) || '';
  return `${nm} and all of their scores will be permanently removed. This cannot be undone.`;
}

/* Owners helper copy (sealed, per mode). */
export const OWNERS_HELP_EDIT =
  'Edit who owns this stakeholder. Add or remove people responsible.';
export const OWNERS_HELP_CREATE =
  "You're added by default. Add or remove people responsible.";

/* ── Shared date formatter (sealed Shared-UI-primitives formula) ─────────
 * formatDateLong: bare YYYY-MM-DD parses at LOCAL midnight (the timezone
 * guard against the off-by-one-day bug); invalid input passes through. */
export function formatDateLong(raw) {
  if (!raw) return '';
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(raw))
    ? new Date(raw + 'T00:00:00')
    : new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

/* ── Community cross-link formulas (sealed Community box; the read-only
 * profile's "Community engagements" section reads these. Single-sourced here
 * until the Community build phase re-homes them with its page.) ─────────── */

/* affiliatedCommunity: applications where the stakeholder is REPRESENTED
 * (representedStakeholderId, the primary) OR LINKED (linkedStakeholders). */
export function affiliatedCommunity(stakeholderId, community) {
  return (community || []).filter(
    (a) => a.representedStakeholderId === stakeholderId ||
           (a.linkedStakeholders || []).includes(stakeholderId),
  );
}

/* isDecided(stage) — Approved / Active / Complete (sealed single source). */
export function isDecided(stage) {
  return stage === 'Approved' || stage === 'Active' || stage === 'Complete';
}

/* money(n) — "$" + toLocaleString (sealed full formatter). */
export function money(n) {
  return '$' + (Number(n) || 0).toLocaleString();
}

/* approvedLabel(app) → { text, tone } (sealed). */
export function approvedLabel(app) {
  if (app.stage === 'Declined') return { text: 'Declined', tone: 'neg' };
  if (!isDecided(app.stage)) return { text: 'TBD', tone: 'muted' };
  const appr = Number(app.approvedAmount) || 0;
  if (appr <= 0) return { text: 'No Expense', tone: 'muted' };
  return { text: money(appr), tone: 'pos' };
}

/* communityEntryAmount(a) (sealed): USD unit → approvedLabel text; else
 * "{amount} {unit}" when an amount exists; else "-". */
export function communityEntryAmount(a) {
  if (a.unit === 'USD') return approvedLabel(a).text;
  if (a.amount) return a.amount + ' ' + (a.unit || '');
  return '-';
}

/* stakeholderCumulativeUSD (sealed): Σ over affiliated of approvedAmount
 * WHERE isDecided(stage) && amount > 0 — a plain USD sum, no FX. */
export function stakeholderCumulativeUSD(stakeholderId, community) {
  return affiliatedCommunity(stakeholderId, community).reduce((sum, a) => {
    const appr = Number(a.approvedAmount) || 0;
    return isDecided(a.stage) && appr > 0 ? sum + appr : sum;
  }, 0);
}
