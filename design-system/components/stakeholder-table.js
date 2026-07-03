/* ============================================================================
 * <ui-stakeholder-table> — canonical domain component: the Stakeholdr master
 * stakeholder grid, extended to the FULL sealed Lists spec ("Lists table — the
 * master stakeholder table" box, sealed 2026-07-03).
 *
 * STRUCTURE (sealed skeleton tree): ONE scroll container (.sheet-scroll, both
 * axes, toggles .scrolled-x once scrollLeft > 0) around a CSS grid
 * (.sheet-grid) whose EVERY track is max-content — the sealed tree-proven
 * truth: NO fixed column widths exist (the oracle's width constants were dead
 * data); frozen sticky-left offsets are MEASURED after layout.
 *
 * COLUMNS — frozen (idx · edit · Stakeholder · Organization) + the 22 sealed
 * reorderable columns, drag-to-reorder persisted per-device to localStorage
 * "hp_map_col_order_v3" (the sealed LIVE key; unknown keys dropped, new keys
 * appended).
 *
 * API — properties: data (rows incl. _x/_y/_status/_unscored), catalogs
 * ({ CATEGORIES, MARKETS, GEOGRAPHIES, US_STATES, SITES, siteLabel }), users,
 * workspaceLabel. Composed events: row-change {id,patch} (ALL edits flow out —
 * the page owns persistence), notes-open {id}, selection-change {id},
 * open-record {id}, community-open {id,name} (C5 make-real: no dead click),
 * export-csv {csv,filename}.
 *
 * NORMALIZATION RULINGS honored (recorded in the sealed box, ruled for this
 * build by the phase directive): all four toolbar popovers are mutually
 * exclusive and ALL close on outside-mousedown + Escape (the oracle's
 * Categories/Sites mouse-leave close + the Sites exclusivity hole are NOT
 * replicated — the box marks them as quirks with the recommended fix).
 * MAKE-REAL honored: the Owner header sorts on the FIRST owner's resolved user
 * name (the oracle's field-"owner" sort was an inert undefined-vs-undefined
 * no-op — flagged KNOWN ORACLE BUG, do not silently copy).
 *
 * Styled ONLY via --ui-sys-* tokens (geometry/structure constants allowed).
 * No literal color values. Shadow DOM mode:'open'.
 *
 * PURE LOGIC (filter predicate, sort comparators incl. custom orderings, CSV
 * builder + escaping, column-order merge, shared name/phone/url/handle
 * helpers) is exported below and unit-tested by scripts/lists-test.mjs — the
 * DOM component is defined only when a document exists, so node can import
 * the pure functions directly.
 * ==========================================================================*/

/* ════════════════════════════════════════════════════════════════════════
 * COMPOSITION RULING (2026-07-03): display cells are lightweight shadow-DOM
 * renders for grid performance (industry practice — grids do not nest full
 * widget components per cell); every INTERACTIVE surface composes the REAL
 * design-system elements: toolbar controls and on-demand cell editors.
 *
 * Concretely: toolbar search = <ui-text-field variant="plain"> with a leading
 * search ui-icon and the kbd chip; Filter/Sort/Categories/Sites =
 * <ui-button variant="outlined"> (text + conditional count ui-badge — NO
 * leading icons, per the sealed skeleton tree: text + badge only); impact
 * bands = <ui-chip variant="filter">; Export CSV and every popover "Clear
 * all" = <ui-button variant="text">; the edit cell = <ui-icon-button
 * variant="standard">. Clicking a dropdown display cell mounts a REAL
 * pre-opened <ui-select> (+ ui-option) positioned in the cell — value
 * committed on change, editor unmounted when the select closes; the date
 * cell mounts a REAL <ui-date-picker> the same way. Display cells stay
 * lightweight text/pill renders under this ruling.
 * ══════════════════════════════════════════════════════════════════════ */

/* The composed components are side-effect modules that touch `document` at
 * module scope, so they load behind the same DOM guard that protects the
 * node-imported pure logic below (scripts/lists-test.mjs imports this file
 * in node). In the app and on the preview pages design-system/entry.js has
 * already registered them synchronously; this block makes the module
 * self-sufficient when imported standalone in a browser. */
if (typeof document !== 'undefined' && typeof HTMLElement !== 'undefined') {
  import('./icon.js');
  import('./text-field.js');
  import('./button.js');
  import('./icon-button.js');
  import('./badge.js');
  import('./chips.js');
  import('./select.js');
  import('./date-picker.js');
  import('./avatar.js');
}

/* ── ZONE + BAND CATALOGS (sealed Relationship-engine box) ─────────────── */

export const ZONE_TOKEN_MAP = {
  'Proactively Defend':    { bg: '--ui-sys-zone-proactively-defend',    ink: '--ui-sys-zone-ink-on-strong' },
  'Defend':                { bg: '--ui-sys-zone-defend',                ink: '--ui-sys-zone-ink-negative' },
  'Protect':               { bg: '--ui-sys-zone-protect',               ink: '--ui-sys-zone-ink-negative' },
  'Respond':               { bg: '--ui-sys-zone-respond',               ink: '--ui-sys-zone-ink-negative' },
  'Identify':              { bg: '--ui-sys-zone-identify',              ink: '--ui-sys-zone-ink-negative' },
  'Monitor':               { bg: '--ui-sys-zone-monitor',               ink: '--ui-sys-zone-ink-neutral' },
  'Maintain':              { bg: '--ui-sys-zone-maintain',              ink: '--ui-sys-zone-ink-neutral' },
  'Connect':               { bg: '--ui-sys-zone-connect',               ink: '--ui-sys-zone-ink-neutral' },
  'Commit':                { bg: '--ui-sys-zone-commit',                ink: '--ui-sys-zone-ink-neutral' },
  'Cooperate':             { bg: '--ui-sys-zone-cooperate',             ink: '--ui-sys-zone-ink-positive' },
  'Collaborate':           { bg: '--ui-sys-zone-collaborate',           ink: '--ui-sys-zone-ink-positive' },
  'Valuable Relationship': { bg: '--ui-sys-zone-valuable-relationship', ink: '--ui-sys-zone-ink-positive' },
  'High Value Relationship': { bg: '--ui-sys-zone-high-value-relationship', ink: '--ui-sys-zone-ink-positive' },
  'Strategic Partner':     { bg: '--ui-sys-zone-strategic-partner',     ink: '--ui-sys-zone-ink-on-strong' },
};

/* STATUS_ORDER — the sealed spectrum, most-negative → positive (the Zone
 * filter renders in THIS order, filtered to zones present — never alphabetical). */
export const STATUS_ORDER = [
  'Proactively Defend', 'Defend', 'Protect', 'Respond', 'Identify',
  'Monitor', 'Maintain', 'Connect', 'Commit',
  'Cooperate', 'Collaborate', 'Valuable Relationship',
  'High Value Relationship', 'Strategic Partner',
];

/* BAND_STATUSES — the sealed three impact bands (Lists box, verbatim).       */
export const BAND_STATUSES = {
  positive: ['Cooperate', 'Collaborate', 'Valuable Relationship', 'High Value Relationship', 'Strategic Partner'],
  middle:   ['Monitor', 'Maintain', 'Connect', 'Commit'],
  negative: ['Proactively Defend', 'Defend', 'Protect', 'Respond', 'Identify'],
};

/* ── COLUMN MODEL (sealed column groups) ───────────────────────────────── */

export const FROZEN_COLS = [
  // idx header text (declared): the sealed skeleton tree names NO header text
  // for the idx column; '#' is the DECLARED choice here — confirm at seal.
  { key: 'idx',  label: '#',            field: null },
  { key: 'edit', label: '',             field: null },
  { key: 'name', label: 'Stakeholder',  field: 'name' },
  { key: 'org',  label: 'Organization', field: 'org' },
];

/* The 22 sealed reorderable columns, canonical order. `field` = sortable.    */
export const REORDER_COLS = [
  { key: 'category',    label: 'Category',             field: 'category' },
  { key: 'type',        label: 'Type',                 field: 'type' },
  { key: 'market',      label: 'Market',               field: 'market' },
  { key: 'region',      label: 'Region',               field: 'region' },
  { key: 'geography',   label: 'Geography',            field: 'geography' },
  { key: 'state',       label: 'State/Prov.',          field: 'state' },
  { key: 'site',        label: 'Sites',                field: 'site' },
  { key: 'issues',      label: 'Issues',               field: null },
  { key: 'priority',    label: 'Priority',             field: 'priority' },
  { key: '_x',          label: 'x',                    field: '_x' },
  { key: '_y',          label: 'y',                    field: '_y' },
  { key: '_status',     label: 'Relationship',         field: '_status' },
  { key: 'tags',        label: 'Tags',                 field: null },
  { key: 'owner',       label: 'Owner',                field: 'owner' },
  { key: 'email',       label: 'Email',                field: 'email' },
  { key: 'phone',       label: 'Phone',                field: 'phone' },
  { key: 'xAccount',    label: 'X account',            field: 'xAccount' },
  { key: 'lastContact', label: 'Last contact',         field: 'lastContact' },
  { key: 'status',      label: 'Status',               field: 'status' },
  { key: 'notes',       label: 'Notes',                field: 'notes' },
  { key: 'url',         label: 'Website',              field: 'url' },
  { key: 'community',   label: 'Community investment', field: null },
];

export const REORDER_KEYS = REORDER_COLS.map((c) => c.key);

/* Sealed LIVE localStorage key (per-device, not synced).                     */
export const COL_ORDER_STORAGE_KEY = 'hp_map_col_order_v3';

/* mergeColumnOrder(saved, canonical) — sealed merge rule: saved keys present
 * in the canonical set are KEPT in saved order; unknown keys DROPPED; any
 * canonical keys missing from saved are APPENDED (canonical order).          */
export function mergeColumnOrder(saved, canonical = REORDER_KEYS) {
  const savedArr = Array.isArray(saved) ? saved : [];
  const kept = savedArr.filter((k) => canonical.includes(k));
  const appended = canonical.filter((k) => !kept.includes(k));
  return [...kept, ...appended];
}

/* ── SHARED PURE HELPERS (sealed Shared-UI-primitives formulas) ─────────── */

/* abbrevTitle — full honorific → compact form; unmapped titles pass through. */
export const TITLE_ABBREV = {
  Senator: 'Sen.', Representative: 'Rep.', Assemblymember: 'Asm.', Governor: 'Gov.',
};
export function abbrevTitle(title) { return TITLE_ABBREV[title] || title; }

/* displayName(s) — sealed formula. first/last from structured fields; both
 * empty → legacy s.name. rawTitle = titleOther when title==="Other", else
 * title; "None" contributes no prefix (the sealed catalog rule — the modal
 * stores None as "", the seed stores the string "None"; both yield no prefix). */
export function displayName(s) {
  if (!s) return '';
  const first = (s.firstName || '').trim();
  const last = (s.lastName || '').trim();
  if (!first && !last) return s.name || '';
  const rawTitle = s.title === 'Other' ? (s.titleOther || '') : (s.title || '');
  const t = rawTitle && rawTitle !== 'None' ? abbrevTitle(rawTitle) + ' ' : '';
  return (t + first + (last ? ' ' + last : '')).trim();
}

/* abbrev(name) — 2-letter avatar initials (sealed): strip a leading honorific,
 * single word → first 2 chars; else first-of-first + first-of-last, uppercase. */
export function abbrev(name) {
  if (!name) return '·';
  const s = String(name).replace(/^(Mayor|Rep\.|Sen\.|Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').trim();
  const parts = s.split(/\s+/).filter(Boolean);
  if (!parts.length) return '·';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* formatPhone(raw) — sealed US formatter: strip non-digits; 11 digits leading
 * "1" drops the country code; exactly 10 → "(xxx) xxx-xxxx"; anything else
 * passes through trimmed.                                                    */
export function formatPhone(raw) {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (digits.length === 11 && digits[0] === '1') digits = digits.slice(1);
  if (digits.length === 10) {
    return '(' + digits.slice(0, 3) + ') ' + digits.slice(3, 6) + '-' + digits.slice(6);
  }
  return String(raw).trim();
}

/* normalizeUrl(raw) — sealed: pass through an existing http(s):// (any case);
 * otherwise prepend exactly "https://".                                      */
export function normalizeUrl(raw) {
  if (!raw) return '';
  const trimmed = String(raw).trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return 'https://' + trimmed;
}

/* cleanTel(raw) — the sealed tel: cleaning regex (strips everything except
 * digits and +).                                                             */
export function cleanTel(raw) { return String(raw || '').replace(/[^\d+]/g, ''); }

/* cleanXHandle(raw) — the sealed X-account handle rule (strips one-or-more
 * leading @; link = https://x.com/{handle}, text = "@" + handle).            */
export function cleanXHandle(raw) { return String(raw || '').replace(/^@+/, ''); }

/* isPersonOf(row) — sealed inference: a stakeholder is a person when the
 * record carries a first or last name (or an explicit isPerson flag).        */
export function isPersonOf(row) {
  return !!(row && (row.isPerson || row.firstName || row.lastName));
}

/* ── FILTERING (sealed FilterPopover semantics) ────────────────────────── */

export const PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];      // sealed HARDCODED
export const STATUS_OPTIONS = ['Active', 'Watch', 'Dormant'];   // sealed HARDCODED

const asArr = (v) => (Array.isArray(v) ? v : []);

/* rowMatchesSearch — case-insensitive against displayName(r), r.name, r.org,
 * r.type, r.notes, and any r.tags entry (sealed).                            */
export function rowMatchesSearch(row, query) {
  const q = String(query || '').trim().toLowerCase();
  if (!q) return true;
  const hay = [displayName(row), row.name, row.org, row.type, row.notes, ...asArr(row.tags)];
  return hay.some((v) => String(v || '').toLowerCase().includes(q));
}

/* rowMatchesFilters — the six popover fields. OR within a field, AND across
 * fields (sealed). owners/issues match when ANY of the row's values is
 * selected; zone matches row._status.                                        */
export function rowMatchesFilters(row, filters) {
  const f = filters || {};
  if (asArr(f.type).length && !f.type.includes(row.type)) return false;
  if (asArr(f.priority).length && !f.priority.includes(row.priority)) return false;
  if (asArr(f.status).length && !f.status.includes(row.status)) return false;
  if (asArr(f.owners).length && !asArr(row.owners).some((o) => f.owners.includes(o))) return false;
  if (asArr(f.issues).length && !asArr(row.issues).some((i) => f.issues.includes(i))) return false;
  if (asArr(f.zone).length && !f.zone.includes(row._status)) return false;
  return true;
}

/* buildFilterOptions — sealed CORRECTION: NOT all auto-aggregated. Priority
 * and Status are HARDCODED; Type/Owners/Issues aggregate from rows (Set of
 * present values, sorted; owners/issues flatten); Zone = STATUS_ORDER filtered
 * to zones actually present (canonical order, never alphabetical).           */
export function buildFilterOptions(rows) {
  const rs = asArr(rows);
  return {
    type: [...new Set(rs.map((r) => r.type).filter(Boolean))].sort(),
    priority: [...PRIORITY_OPTIONS],
    status: [...STATUS_OPTIONS],
    owners: [...new Set(rs.flatMap((r) => asArr(r.owners)))].sort(),
    issues: [...new Set(rs.flatMap((r) => asArr(r.issues)))].sort(),
    zone: STATUS_ORDER.filter((z) => rs.some((r) => r._status === z)),
  };
}

/* rowMatchesBands — the impact-band chip filter: empty = no constraint; else
 * the row's _status must sit in one of the selected bands' zone lists.       */
export function rowMatchesBands(row, bands) {
  const bs = asArr(bands);
  if (!bs.length) return true;
  return bs.some((b) => (BAND_STATUSES[b] || []).includes(row._status));
}

/* countByStatus — per-zone tally over rows (drives the band-chip counts).    */
export function countByStatus(rows) {
  const tally = {};
  for (const r of asArr(rows)) {
    if (r._status) tally[r._status] = (tally[r._status] || 0) + 1;
  }
  return tally;
}

/* ── SORTING (sealed comparator + custom orderings) ────────────────────── */

/* The sealed 11 Sort-popover fields (key → label), verbatim.                 */
export const SORT_FIELDS = [
  { key: 'name',        label: 'Stakeholder' },
  { key: 'org',         label: 'Organization' },
  { key: 'type',        label: 'Audience type' },
  { key: 'market',      label: 'Market' },
  { key: 'region',      label: 'Region' },
  { key: 'state',       label: 'State/Prov.' },
  { key: 'site',        label: 'Sites' },
  { key: 'lastContact', label: 'Last contact' },
  { key: 'updatedAt',   label: 'Last updated' },
  { key: 'createdAt',   label: 'Date added' },
  { key: '_status',     label: 'Relationship' },
];

export const PRIORITY_RANK = { High: 0, Medium: 1, Low: 2 };    // missing → 9
export const STATUS_RANK = { Active: 0, Watch: 1, Dormant: 2 }; // missing → 9

/* sortFieldType(key) — the sealed SortFieldList type inference.              */
export function sortFieldType(key) {
  if (/updatedAt|createdAt|lastContact|_updated|_created|date/i.test(key)) return 'date';
  if (key === '_x' || key === '_y' || /amount|count|weight|score/i.test(key)) return 'num';
  return 'text';
}

/* Direction labels by inferred type (sealed pairs, [asc, desc]).             */
export function sortDirLabels(type) {
  if (type === 'date') return ['Oldest first', 'Newest first'];
  if (type === 'num') return ['Low → High', 'High → Low'];
  return ['A → Z', 'Z → A'];
}

/* compareRows(a, b, key, ctx) — ASCENDING comparison with the sealed custom
 * orderings; direction is applied by sortRows (flips the sign).
 *   name     → displayName(a) || a.name || ""
 *   priority → {High:0, Medium:1, Low:2} (missing → 9)
 *   status   → {Active:0, Watch:1, Dormant:2} (missing → 9)
 *   site     → siteLabel(SITES.find(id===)) via ctx {sites, siteLabel}
 *   owner    → MAKE-REAL: first owner's resolved user name (ctx.users) — the
 *              oracle sorted an absent "owner" property (inert no-op, flagged)
 *   numbers subtract; otherwise localeCompare.                               */
export function compareRows(a, b, key, ctx = {}) {
  if (key === 'name') {
    const an = displayName(a) || a.name || '';
    const bn = displayName(b) || b.name || '';
    return an.localeCompare(bn);
  }
  if (key === 'priority') {
    return (PRIORITY_RANK[a.priority] ?? 9) - (PRIORITY_RANK[b.priority] ?? 9);
  }
  if (key === 'status') {
    return (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9);
  }
  if (key === 'site') {
    const sites = asArr(ctx.sites);
    const labelOf = (r) => {
      const rec = sites.find((s) => s.id === r.site);
      return rec && ctx.siteLabel ? ctx.siteLabel(rec) : rec ? rec.city || '' : '';
    };
    return labelOf(a).localeCompare(labelOf(b));
  }
  if (key === 'owner') {
    const users = asArr(ctx.users);
    const nameOf = (r) => {
      const first = asArr(r.owners)[0];
      if (!first) return '';
      return (users.find((u) => u.id === first) || {}).name || first;
    };
    return nameOf(a).localeCompare(nameOf(b));
  }
  const av = a[key];
  const bv = b[key];
  if (typeof av === 'number' && typeof bv === 'number') return av - bv;
  return String(av ?? '').localeCompare(String(bv ?? ''));
}

/* defaultCompare — the sealed DEFAULT SORT (no explicit sortKey): unscored
 * stakeholders FIRST, then most-recent lastContact (descending).             */
export function defaultCompare(a, b) {
  if (!!a._unscored !== !!b._unscored) return a._unscored ? -1 : 1;
  return String(b.lastContact || '').localeCompare(String(a.lastContact || ''));
}

/* sortRows(rows, sortKey, sortDir, ctx) — copy-sort; null sortKey = default. */
export function sortRows(rows, sortKey, sortDir, ctx = {}) {
  const arr = [...asArr(rows)];
  if (!sortKey) { arr.sort(defaultCompare); return arr; }
  const sign = sortDir === 'desc' ? -1 : 1;
  arr.sort((a, b) => compareRows(a, b, sortKey, ctx) * sign);
  return arr;
}

/* ── CSV EXPORT (sealed footer spec) ───────────────────────────────────── */

/* csvEscape — sealed: any cell matching /[",\n]/ is wrapped in double quotes
 * with internal quotes doubled.                                              */
export function csvEscape(v) {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export const CSV_HEADERS = [
  'Stakeholder', 'Organization', 'Category', 'Type', 'Market', 'Region',
  'Geography', 'Issues', 'Priority', 'Tags', 'Owners', 'Last contact',
  'Status', 'x', 'y', 'Relationship', 'Website', 'Notes',
];

/* buildCsv(rows, users) — the sealed column set/accessors over the CURRENT
 * filtered/sorted rows. An unresolvable owner id exports as the raw id.      */
export function buildCsv(rows, users = []) {
  const userName = (id) => ((asArr(users).find((u) => u.id === id) || {}).name || id);
  const lines = [CSV_HEADERS.map(csvEscape).join(',')];
  for (const r of asArr(rows)) {
    lines.push([
      displayName(r) || r.name || '',
      r.org || '',
      r.category || '',
      r.type || '',
      r.market || '',
      r.region || '',
      r.geography || '',
      asArr(r.issues).join('; '),
      r.priority || '',
      asArr(r.tags).join('; '),
      asArr(r.owners).map(userName).join('; '),
      r.lastContact || '',
      r.status || '',
      typeof r._x === 'number' ? r._x.toFixed(1) : '',
      typeof r._y === 'number' ? r._y.toFixed(1) : '',
      r._status || '',
      r.url ? normalizeUrl(r.url) : '',
      r.notes || '',
    ].map(csvEscape).join(','));
  }
  return lines.join('\n');
}

/* csvFilename — the sealed EXACT expression: hyphens preserved, each run of
 * other non-word chars collapses to a single "_".                            */
export function csvFilename(workspaceLabel) {
  return (workspaceLabel || 'stakeholders').replace(/[^\w-]+/g, '_') + '.csv';
}

/* cellClass(key) — the sealed CELL EMPHASIS map (per-column typographic
 * hierarchy; without it the grid loses its visual weighting).                */
const DIM_COLS = new Set(['email', 'phone', 'xAccount', 'lastContact', 'status', 'notes']);
const STRONG_COLS = new Set(['category', 'type', 'market', 'region', 'geography', 'state', 'site']);
const SM_COLS = new Set(['phone', 'lastContact']);
const PILLS_COLS = new Set(['issues', 'tags', 'community']);
const URL_COLS = new Set(['url', 'email', 'phone', 'xAccount']);
export function cellClass(key) {
  const cls = [];
  if (DIM_COLS.has(key)) cls.push('cell-dim');
  if (STRONG_COLS.has(key)) cls.push('cell-strong');
  if (SM_COLS.has(key)) cls.push('cell-sm');
  if (PILLS_COLS.has(key)) cls.push('pills-cell');
  if (key === '_status') cls.push('zone-cell');
  if (key === 'notes') cls.push('notes');
  if (URL_COLS.has(key)) cls.push('url-cell');
  if (key === '_x' || key === '_y') cls.push('coord', 'readonly');
  return cls.join(' ');
}

/* ════════════════════════════════════════════════════════════════════════
 * DOM COMPONENT — defined only in a browser context (node imports the pure
 * logic above without touching the DOM).
 * ══════════════════════════════════════════════════════════════════════ */
const HAS_DOM = typeof document !== 'undefined' && typeof HTMLElement !== 'undefined';

if (HAS_DOM) {

/* Gallery/wireframe sample fallback (used ONLY when no .data is set before
 * connect — preview.html / wireframes.html mount the tag bare). Shaped to the
 * live row contract: full field set + computed _x/_y/_status/_unscored.      */
const SAMPLE_CATALOGS = {
  CATEGORIES: {
    Government: ['Mayor', 'City Government', 'Regulator (State)'],
    Communities: ['Media', 'Community Alliance', 'Activist Organization'],
    Industry: ['Trade Association', 'Competition'],
  },
  MARKETS: { Americas: ['United States', 'Canada', 'Mexico'], EMEA: ['Europe'] },
  GEOGRAPHIES: ['National (all)', 'Federal', 'State', 'Local'],
  US_STATES: ['California', 'Oregon', 'Texas', 'Washington'],
  SITES: [
    { id: 'site-a', city: 'Palo Alto', state: 'California', country: 'United States' },
    { id: 'site-b', city: 'Corvallis', state: 'Oregon', country: 'United States' },
  ],
  siteLabel: (s) => (s ? `${s.city}, ${s.state || s.country || ''}`.replace(/, $/, '') : ''),
};
const SAMPLE_USERS = [
  { id: 'u-1', name: 'Alex Rivera', title: 'Director', avatarColor: 'var(--ui-sys-avatar-palette-1)' },
  { id: 'u-2', name: 'Jordan Kim', title: 'Policy Lead', avatarColor: 'var(--ui-sys-avatar-palette-2)' },
  { id: 'u-3', name: 'Sam Okafor', title: 'Community Manager', avatarColor: 'var(--ui-sys-avatar-palette-3)' },
];
const SAMPLE_DATA = [
  { id: 's-1', isPerson: true, firstName: 'Maria', lastName: 'Chen', title: 'Mayor', name: 'Mayor Maria Chen', org: 'City of Cedarville', category: 'Government', type: 'Mayor', market: 'Americas', region: 'United States', geography: 'Local', state: 'California', site: 'site-a', issues: ['Site Operations', 'Sustainability'], priority: 'High', tags: ['public-official', 'key-influencer'], owners: ['u-2', 'u-3'], email: 'mchen@cedarville.gov', phone: '(503) 555-0142', xAccount: '@MayorMariaChen', lastContact: '2026-05-12', status: 'Active', notes: 'Generally supportive; cares about local jobs.', url: 'cedarville.gov', community: ['STEM Classroom Grant'], _x: 2.9, _y: 8.1, _status: 'Valuable Relationship', _unscored: false },
  { id: 's-2', name: 'Cedarville Chamber', org: 'Chamber of Commerce', category: 'Industry', type: 'Trade Association', market: 'Americas', region: 'United States', geography: 'Local', state: 'California', site: 'site-a', issues: ['Taxation'], priority: 'High', tags: ['coalition', 'ally'], owners: ['u-1'], email: 'hello@cedarchamber.org', phone: '(650) 555-0188', xAccount: '@CedarChamber', lastContact: '2026-06-02', status: 'Active', notes: 'Co-drafting testimony for the modernization bill.', url: 'cedarchamber.org', community: [], _x: 1.5, _y: 4.2, _status: 'Collaborate', _unscored: false },
  { id: 's-3', name: 'Riverside Tribune', org: 'Riverside Media', category: 'Communities', type: 'Media', market: 'Americas', region: 'United States', geography: 'State', state: 'Oregon', issues: ['Site Operations'], priority: 'Medium', tags: ['press', 'skeptical'], owners: ['u-2'], email: 'news@rtribune.com', phone: '(541) 555-0195', xAccount: '@RTribune', lastContact: '2026-05-30', status: 'Watch', notes: 'Ran two critical segments; requests plant access.', url: '', community: [], _x: -3.2, _y: 6.0, _status: 'Defend', _unscored: false },
  { id: 's-4', name: 'Save Our River Coalition', org: 'Save Our River Coalition', category: 'Communities', type: 'Activist Organization', market: 'Americas', region: 'United States', geography: 'Local', state: 'Oregon', site: 'site-b', issues: ['Sustainability', 'Site Operations'], priority: 'High', tags: ['activist', 'environmental'], owners: ['u-3'], email: 'info@saveourriver.org', phone: '(541) 555-0173', xAccount: '@SaveOurRiverOR', lastContact: '2026-06-10', status: 'Watch', notes: 'Escalating opposition to the outfall permit.', url: 'saveourriver.org', community: ['River Cleanup Day'], _x: -8.0, _y: 7.1, _status: 'Proactively Defend', _unscored: false },
  { id: 's-5', name: 'Cascade Manufacturing Council', org: 'Cascade Manufacturing Council', category: 'Industry', type: 'Trade Association', market: 'Americas', region: 'United States', geography: 'State', state: 'Oregon', issues: ['Procurement Reform', 'Taxation'], priority: 'High', tags: ['industry', 'coalition', 'ally', 'exec'], owners: ['u-1', 'u-2'], email: 'members@cascademfg.org', phone: '(503) 555-0180', xAccount: '@CascadeMfg', lastContact: '2026-06-05', status: 'Active', notes: 'Aligned on the permitting-modernization bill.', url: 'cascademfg.org', community: [], _x: 7.1, _y: 6.4, _status: 'Strategic Partner', _unscored: false },
  { id: 's-6', name: 'Interfaith Council', org: 'Greater Houston Interfaith Council', category: 'Communities', type: 'Community Alliance', market: 'Americas', region: 'United States', geography: 'Local', state: 'Texas', issues: ['Education'], priority: 'Low', tags: ['faith'], owners: ['u-3'], email: 'office@ghic.org', phone: '(713) 555-0147', xAccount: '', lastContact: '2026-03-09', status: 'Dormant', notes: 'Light contact since the 2025 workforce fair.', url: '', community: [], _x: 1.2, _y: -6.1, _status: 'Maintain', _unscored: false },
  { id: 's-7', name: 'New Prospect (unscored)', org: 'Prospect Org', category: 'Communities', type: 'Media', market: 'EMEA', region: 'Europe', geography: 'Federal', issues: [], priority: 'Medium', tags: [], owners: ['u-1'], email: '', phone: '', xAccount: '', lastContact: '2026-06-12', status: 'Active', notes: '', url: '', community: [], _x: 0, _y: 0, _status: 'Cooperate', _unscored: true },
];

const template = document.createElement('template');
template.innerHTML = `
<style>
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 400px;
    font: var(--ui-sys-font-body);
    color: var(--ui-sys-on-surface);
    background: var(--ui-sys-surface-card);
    border: 1px solid var(--ui-sys-outline);
    border-radius: var(--ui-sys-shape-card);
    overflow: hidden;
  }

  /* ── TOOLBAR ─────────────────────────────────────────────────── */
  .toolbar {
    display: flex;
    align-items: center;
    gap: var(--ui-sys-space-2);
    padding: var(--ui-sys-space-2) var(--ui-sys-space-3);
    background: var(--ui-sys-surface-container);
    border-bottom: 1px solid var(--ui-sys-outline);
    flex-shrink: 0;
    flex-wrap: wrap;
    position: relative;
    z-index: 40;
  }

  /* Search = the REAL ui-text-field (composition ruling). Width is layout
     geometry in this context, not a component override. */
  .search-field { width: 304px; }

  /* kbd chip — slotted into the search field's trailing slot (and reused
     statically in the footer). width/height auto out-rank the field's
     ::slotted 18px icon box (outer-tree normal declarations beat ::slotted). */
  .kbd {
    width: auto; height: auto;
    font: var(--ui-sys-font-caption);
    color: var(--ui-sys-on-surface-muted);
    background: var(--ui-sys-surface-hover);
    border: 1px solid var(--ui-sys-outline-subtle);
    border-radius: var(--ui-sys-shape-control);
    padding: 1px 5px;
    white-space: nowrap;
  }
  .kbd[hidden] { display: none; }

  .filter-button-wrap { position: relative; }
  /* Filter/Sort/Categories/Sites are REAL ui-button outlined elements
     (composition ruling; text + conditional count ui-badge, NO leading icons
     per the sealed skeleton tree). The active signal is the visible count
     ui-badge — the hand-rolled .filter-active accent border retired with the
     hand-rolled button. */

  .spacer { flex: 1 1 auto; }

  .band-chips { display: flex; align-items: center; gap: var(--ui-sys-space-2); }

  /* Impact-band chips are REAL ui-chip variant=filter elements (composition
     ruling); the selected state drives the band filter. The valence swatch is
     slotted content owned by this tree — sealed tokens, never the old literal.
     (The sealed census-D valence .on fills were properties of the hand-rolled
     chip; the composed ui-chip wears its canonical selected state, and the
     always-valence swatch keeps the band color legible — declared here.) */
  .swatch { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .swatch--pos { background: var(--ui-sys-pos); }
  .swatch--neu { background: var(--ui-sys-neu); }  /* sealed: token, never the old literal */
  .swatch--neg { background: var(--ui-sys-neg); }
  .impact-chip strong { font-weight: 600; }

  /* ── TOOLBAR POPOVERS ────────────────────────────────────────── */
  .filter-popover {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    z-index: 60;
    min-width: 280px;
    max-width: 380px;
    max-height: 420px;
    overflow: auto;
    background: var(--ui-sys-surface-card);
    border: 1px solid var(--ui-sys-outline);
    border-radius: var(--ui-sys-shape-card);
    box-shadow: var(--ui-sys-elevation-2);
    padding: var(--ui-sys-space-3);
  }
  .filter-popover.narrow { min-width: 220px; max-width: 260px; }
  .filter-pop-head {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--ui-sys-space-2);
    margin-bottom: var(--ui-sys-space-2);
  }
  .filter-pop-head strong { font: var(--ui-sys-font-label); }
  /* "Clear all" is a REAL ui-button variant=text (composition ruling). */

  .filter-pop-label {
    font: var(--ui-sys-font-caption);
    color: var(--ui-sys-on-surface-muted);
    text-transform: uppercase;
    letter-spacing: .06em;
    margin: var(--ui-sys-space-2) 0 var(--ui-sys-space-1);
  }
  .filter-chips { display: flex; flex-wrap: wrap; gap: 4px; }
  .filter-chip {
    appearance: none;
    display: inline-flex; align-items: center;
    height: 22px; padding: 0 8px;
    border: 1px solid var(--ui-sys-outline);
    border-radius: var(--ui-sys-shape-pill);
    background: var(--ui-sys-surface-card);
    color: var(--ui-sys-on-surface);
    font: var(--ui-sys-font-caption);
    cursor: pointer;
    white-space: nowrap;
  }
  .filter-chip:hover { background: var(--ui-sys-surface-hover); }
  .filter-chip.on {
    background: var(--ui-sys-accent-tint-soft);
    border-color: var(--ui-sys-accent);
  }

  /* Sort popover */
  .sort-fieldrow {
    display: flex; align-items: center; justify-content: space-between;
    gap: var(--ui-sys-space-2);
    padding: 2px 0;
  }
  .sort-name {
    appearance: none; border: none; background: transparent;
    color: var(--ui-sys-on-surface);
    font: var(--ui-sys-font-body);
    text-align: left;
    cursor: pointer;
    padding: 4px 6px;
    border-radius: var(--ui-sys-shape-control);
    flex: 1 1 auto;
  }
  .sort-name:hover { background: var(--ui-sys-surface-hover); }
  .sort-fieldrow.active .sort-name { font-weight: 500; }
  .sort-dir-seg {
    display: inline-flex;
    border: 1px solid var(--ui-sys-outline);
    border-radius: var(--ui-sys-shape-control);
    overflow: hidden;
    flex-shrink: 0;
  }
  .sort-dir-seg button {
    appearance: none; border: none;
    background: var(--ui-sys-surface-card);
    color: var(--ui-sys-on-surface-muted);
    font: var(--ui-sys-font-caption);
    padding: 3px 8px;
    cursor: pointer;
    white-space: nowrap;
  }
  .sort-dir-seg button + button { border-left: 1px solid var(--ui-sys-outline); }
  .sort-dir-seg button.on {
    background: var(--ui-sys-primary);
    color: var(--ui-sys-on-primary);
  }

  /* Categories / Sites option list */
  .cat-opt-list { display: flex; flex-direction: column; }
  .cat-opt {
    appearance: none; border: none; background: transparent;
    display: flex; align-items: center; gap: var(--ui-sys-space-2);
    padding: 5px 6px;
    border-radius: var(--ui-sys-shape-control);
    color: var(--ui-sys-on-surface);
    font: var(--ui-sys-font-body);
    cursor: pointer;
    text-align: left;
  }
  .cat-opt:hover { background: var(--ui-sys-surface-hover); }
  .cat-opt .cat-check { visibility: hidden; color: var(--ui-sys-accent); }
  .cat-opt.on .cat-check { visibility: visible; }

  /* ── SCROLL CONTAINER + GRID ─────────────────────────────────── */
  .sheet-scroll {
    flex: 1 1 auto;
    overflow: auto;
    position: relative;
    background: var(--ui-sys-surface-card);
  }
  .sheet-grid {
    display: grid;
    min-width: max-content;
    /* grid-template-columns set in JS: one max-content track per column
       (the sealed tree-proven truth — every width is auto-sized). */
  }
  .sheet-head, .sheet-row { display: contents; }

  .sheet-cell {
    display: flex;
    align-items: center;
    gap: var(--ui-sys-space-1);
    min-height: 36px;
    padding: 0 var(--ui-sys-space-3);
    font: var(--ui-sys-font-body);
    color: var(--ui-sys-on-surface);
    background: var(--ui-sys-surface-card);
    border-bottom: 1px solid var(--ui-sys-outline-subtle);
    white-space: nowrap;
  }

  /* Header cells */
  .sheet-head .sheet-cell {
    position: sticky;
    top: 0;
    z-index: 20;
    min-height: 34px;
    font: var(--ui-sys-font-label);
    color: var(--ui-sys-on-surface-muted);
    background: var(--ui-sys-surface-container);
    border-bottom: 1px solid var(--ui-sys-outline);
    user-select: none;
  }
  .sheet-head .sheet-cell.sortable { cursor: pointer; }
  .sheet-head .sheet-cell.sortable:hover {
    background: var(--ui-sys-header-hover);
    color: var(--ui-sys-on-surface);
  }
  .sort-indicator { font-size: 10px; }
  .col-grip { color: var(--ui-sys-on-surface-faint); cursor: grab; }
  .col-draggable.dragging { opacity: .5; }
  .col-draggable.drag-over { box-shadow: inset 3px 0 0 var(--ui-sys-accent); }

  /* Frozen columns — sticky lefts are MEASURED after layout (sealed) and
     land in the --_fl-* custom properties on the grid. */
  .sheet-cell.frozen { position: sticky; z-index: 10; }
  .sheet-head .sheet-cell.frozen { z-index: 30; }
  .frozen-idx  { left: var(--_fl-idx, 0px); }
  .frozen-edit { left: var(--_fl-edit, 0px); }
  .frozen-name { left: var(--_fl-name, 0px); }
  .frozen-org  { left: var(--_fl-org, 0px); }
  /* frozen-edge shadow, only once scrolled (sealed .scrolled-x) */
  .scrolled-x .frozen-org { box-shadow: var(--ui-sys-elevation-1); clip-path: inset(0 -12px 0 0); }

  /* Body rows: hover + selection (hover matches through display:contents) */
  .sheet-row:hover .sheet-cell { background: var(--ui-sys-surface-hover); }
  .sheet-row.selected .sheet-cell { background: var(--ui-sys-row-selected); }
  .sheet-row.selected .sheet-cell.idx { background: var(--ui-sys-row-selected-strong); }
  .sheet-row { cursor: default; }

  .sheet-cell.idx {
    justify-content: center;
    color: var(--ui-sys-on-surface-muted);
    font: var(--ui-sys-font-caption);
  }
  .sheet-cell.edit { justify-content: center; padding: 0 var(--ui-sys-space-1); }

  /* CELL EMPHASIS (sealed map — tokens only) */
  .sheet-cell.cell-dim { color: var(--ui-sys-on-surface-muted); }
  .sheet-cell.cell-strong { color: var(--ui-sys-on-surface); font-weight: 500; }
  .sheet-cell.cell-sm { font: var(--ui-sys-font-caption); }
  .sheet-cell.cell-sm.cell-dim { color: var(--ui-sys-on-surface-muted); }
  .sheet-cell.coord {
    font-variant-numeric: tabular-nums;
    justify-content: flex-end;
    color: var(--ui-sys-on-surface-muted);
  }
  .sheet-cell.coord.positive { color: var(--ui-sys-pos); }
  .sheet-cell.coord.negative { color: var(--ui-sys-neg); }
  .sheet-cell.notes { cursor: pointer; }
  .notes-preview {
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .muted { color: var(--ui-sys-on-surface-muted); }

  /* Inline text cell (Organization) */
  .cell-input {
    appearance: none;
    border: 1px solid transparent;
    border-radius: var(--ui-sys-shape-control);
    background: transparent;
    color: var(--ui-sys-on-surface);
    font: var(--ui-sys-font-body);
    padding: 3px 6px;
    min-width: 140px;
    outline: none;
  }
  .cell-input:hover { background: var(--ui-sys-row-selected-strong); }
  .cell-input:focus {
    background: var(--ui-sys-surface-card);
    border-color: var(--ui-sys-focus-ring);
  }

  /* Dropdown/date DISPLAY cells (lightweight renders per the COMPOSITION
     RULING). Clicking one mounts the REAL editor — <ui-select> / <ui-date-
     picker> — absolutely positioned in the cell; the display hides while the
     editor is mounted so the max-content track keeps its size. */
  .sheet-cell:not(.frozen) { position: relative; }
  .cell-dd { display: inline-flex; }
  .cell-dd-trigger {
    appearance: none;
    display: inline-flex; align-items: center; gap: 4px;
    border: 1px solid transparent;
    border-radius: var(--ui-sys-shape-control);
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: inherit;
    padding: 3px 6px;
    cursor: pointer;
    white-space: nowrap;
  }
  .cell-dd-trigger:hover { background: var(--ui-sys-row-selected-strong); }
  .cell-dd-trigger:focus-visible { outline: 2px solid var(--ui-sys-focus-ring); outline-offset: 1px; }
  .cell-dd-trigger.is-empty { color: var(--ui-sys-on-surface-muted); }
  .cell-editing > .cell-display { visibility: hidden; }
  .cell-editor {
    position: absolute;
    top: 2px;
    left: var(--ui-sys-space-1);
    z-index: 45;
    background: var(--ui-sys-surface-card);
  }

  /* Owners popover (sealed OwnersDisplay — Shared-primitives box): hover/click
     on the owner stack opens it; rows compose the REAL ui-avatar. */
  .owner-wrap { display: inline-flex; position: relative; }
  .owners-pop {
    position: absolute;
    top: calc(100% + 2px);
    left: 0;
    z-index: 50;
    min-width: 200px;
    background: var(--ui-sys-surface-card);
    border: 1px solid var(--ui-sys-outline);
    border-radius: var(--ui-sys-shape-card);
    box-shadow: var(--ui-sys-elevation-2);
    padding: var(--ui-sys-space-2) var(--ui-sys-space-3);
  }
  .owners-pop-head {
    font: var(--ui-sys-font-caption);
    color: var(--ui-sys-on-surface-muted);
    margin-bottom: var(--ui-sys-space-1);
    white-space: nowrap;
  }
  .owners-pop-row {
    display: flex; align-items: center;
    gap: var(--ui-sys-space-2);
    padding: 2px 0;
    white-space: nowrap;
  }
  .owners-pop-names { display: flex; flex-direction: column; min-width: 0; }
  .owners-pop-name { font: var(--ui-sys-font-label); }
  .owners-pop-title { font: var(--ui-sys-font-caption); color: var(--ui-sys-on-surface-muted); }

  /* Pills (tags / issues / community) */
  .pills-inline { display: inline-flex; align-items: center; gap: 4px; }
  .tag {
    display: inline-flex; align-items: center;
    height: 20px; padding: 0 8px;
    border-radius: var(--ui-sys-shape-pill);
    background: var(--ui-sys-surface-container-highest);
    color: var(--ui-sys-on-surface);
    font: var(--ui-sys-font-caption);
    white-space: nowrap;
    border: none;
  }
  button.tag { cursor: pointer; }
  button.tag:hover { background: var(--ui-sys-surface-hover); }
  .tag-more { font: var(--ui-sys-font-caption); color: var(--ui-sys-on-surface-muted); }

  /* Priority pill (sealed --ui-sys-priority-* pairs; unknown → Low) */
  .pill {
    display: inline-flex; align-items: center;
    height: 20px; padding: 0 8px;
    border-radius: var(--ui-sys-shape-pill);
    font: var(--ui-sys-font-caption);
    font-weight: 500;
    white-space: nowrap;
  }
  .pill--high   { background: var(--ui-sys-priority-high-surface);   color: var(--ui-sys-priority-high-ink); }
  .pill--medium { background: var(--ui-sys-priority-medium-surface); color: var(--ui-sys-priority-medium-ink); }
  .pill--low    { background: var(--ui-sys-priority-low-surface);    color: var(--ui-sys-priority-low-ink); }

  /* Relationship zone pill (zone tokens set per-pill via custom props) */
  .zone-pill {
    display: inline-flex; align-items: center;
    height: 20px; padding: 0 8px;
    border-radius: var(--ui-sys-shape-pill);
    font: var(--ui-sys-font-caption);
    font-weight: 500;
    white-space: nowrap;
    background: var(--_zone-bg);
    color: var(--_zone-ink);
  }

  /* Owner avatars (OwnersDisplay, size 20 — read-only stack) */
  .owner-stack { display: inline-flex; align-items: center; }
  .owner-av {
    width: 20px; height: 20px;
    border-radius: 50%;
    display: inline-flex; align-items: center; justify-content: center;
    font-size: 9px; font-weight: 600;
    color: var(--ui-sys-avatar-ink);
    background: var(--ui-sys-primary);
    border: 1.5px solid var(--ui-sys-surface-card);
  }
  .owner-av + .owner-av { margin-left: -6px; }

  /* Link cells */
  a.plain-link {
    color: inherit;
    text-decoration: none;
    border-bottom: 1px solid var(--ui-sys-on-surface-faint);
  }
  a.plain-link:hover { border-bottom-color: var(--ui-sys-on-surface-muted); }

  /* Edit cell = a REAL ui-icon-button variant=standard (composition ruling);
     quiet ink that strengthens on hover comes from the component itself. */
  .sheet-cell.edit ui-icon-button { color: var(--ui-sys-on-surface-muted); }

  /* ── FOOTER ──────────────────────────────────────────────────── */
  .footer {
    display: flex;
    align-items: center;
    gap: var(--ui-sys-space-3);
    padding: 0 var(--ui-sys-space-3);
    height: 36px;
    background: var(--ui-sys-surface-container);
    border-top: 1px solid var(--ui-sys-outline);
    flex-shrink: 0;
    font: var(--ui-sys-font-caption);
    color: var(--ui-sys-on-surface-muted);
    white-space: nowrap;
    overflow: hidden;
  }
  .footer .group { display: inline-flex; align-items: center; gap: var(--ui-sys-space-1); }
  .footer strong { color: var(--ui-sys-on-surface); font-weight: 600; }
  .stat-sep { color: var(--ui-sys-on-surface-faint); }
  /* Export CSV is a REAL ui-button variant=text (composition ruling). */
  .export-btn { flex-shrink: 0; }
</style>

<!-- TOOLBAR PLACEMENT (declared): the sealed skeleton PORTALS this toolbar into
     the shell's explainer band ABOVE the table ([PORTAL] div.sheet-toolbar →
     explainerSlot). INTERIM: it renders inside the component until the
     shell-state phase lands, at which point the toolbar renders into a
     slotted/portaled band. Declared, not forgotten. -->
<div class="toolbar" role="toolbar" aria-label="Stakeholder table controls">
  <ui-text-field variant="plain" class="search-field" label="Search stakeholders"
                 placeholder="Search stakeholders, orgs, tags…">
    <ui-icon slot="leading" size="sm">search</ui-icon>
    <span slot="trailing" class="kbd kbd-cmdk" aria-hidden="true" hidden></span>
  </ui-text-field>
  <div class="filter-button-wrap" data-pop="filter">
    <ui-button variant="outlined" class="tb-pop-btn tb-filter" aria-haspopup="true"
               aria-expanded="false">Filter<ui-badge class="tb-filter-badge"></ui-badge></ui-button>
  </div>
  <div class="filter-button-wrap" data-pop="sort">
    <ui-button variant="outlined" class="tb-pop-btn tb-sort" aria-haspopup="true"
               aria-expanded="false">Sort<ui-badge class="tb-sort-badge"></ui-badge></ui-button>
  </div>
  <div class="filter-button-wrap" data-pop="cat">
    <ui-button variant="outlined" class="tb-pop-btn tb-cat" aria-haspopup="true"
               aria-expanded="false">Categories<ui-badge class="tb-cat-badge"></ui-badge></ui-button>
  </div>
  <div class="filter-button-wrap" data-pop="site">
    <ui-button variant="outlined" class="tb-pop-btn tb-site" aria-haspopup="true"
               aria-expanded="false">Sites<ui-badge class="tb-site-badge"></ui-badge></ui-button>
  </div>
  <div class="spacer"></div>
  <div class="band-chips">
    <ui-chip variant="filter" class="impact-chip pos" data-band="positive"><span
      class="swatch swatch--pos" aria-hidden="true"></span><strong class="count-pos">0</strong>Positive impact</ui-chip>
    <ui-chip variant="filter" class="impact-chip neu" data-band="middle"><span
      class="swatch swatch--neu" aria-hidden="true"></span><strong class="count-mid">0</strong>Winnable middle</ui-chip>
    <ui-chip variant="filter" class="impact-chip neg" data-band="negative"><span
      class="swatch swatch--neg" aria-hidden="true"></span><strong class="count-neg">0</strong>Negative impact</ui-chip>
  </div>
</div>

<div class="sheet-scroll" tabindex="0" role="region" aria-label="Stakeholder table">
  <div class="sheet-grid" role="grid" aria-label="Stakeholders"></div>
</div>

<div class="footer" role="contentinfo">
  <span class="group"><ui-icon size="sm">table_rows</ui-icon><span class="footer-count">— of — stakeholders</span></span>
  <span class="stat-sep" aria-hidden="true">·</span>
  <span class="group">Avg <span class="kbd">x</span> <strong class="footer-avgx">—</strong></span>
  <span class="group">Avg <span class="kbd">y</span> <strong class="footer-avgy">—</strong></span>
  <div class="spacer"></div>
  <ui-button variant="text" class="export-btn" aria-label="Export to CSV"><ui-icon
    slot="leading" size="sm">download</ui-icon>Export CSV</ui-button>
</div>
`;

class UiStakeholderTable extends HTMLElement {
  /* ── state ─────────────────────────────────────────────────────── */
  #data = [];
  #filtered = [];
  #catalogs = { CATEGORIES: {}, MARKETS: {}, GEOGRAPHIES: [], US_STATES: [], SITES: [], siteLabel: null };
  #users = [];
  #workspaceLabel = '';
  #search = '';
  #filters = { type: [], priority: [], status: [], owners: [], issues: [], zone: [] };
  #catFilter = [];
  #siteFilter = [];
  #bandFilter = [];
  #sortKey = null;
  #sortDir = 'asc';
  #colOrder = mergeColumnOrder(null);
  #selectedId = null;
  #openPop = null;          // 'filter' | 'sort' | 'cat' | 'site' | null
  #dragKey = null;
  #dragOverKey = null;
  #openDD = null;           // the one open in-grid popover (owners) { close() }
  #openEditor = null;       // unmount fn of the one mounted cell editor
  #docMousedown = null;
  #docKeydown = null;

  /* kbd-label (finding: single source) — the cmd-key hint text is NOT derived
   * here; the page passes it from the store's exported single source
   * (src/app/data/store.js → cmdKeyLabel). Empty/absent hides the chip. */
  static observedAttributes = ['kbd-label'];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
  }

  attributeChangedCallback(name) {
    if (name === 'kbd-label') this.#syncKbd();
  }

  /* ── public API ────────────────────────────────────────────────── */
  get kbdLabel() { return this.getAttribute('kbd-label') || ''; }
  set kbdLabel(v) {
    if (v) this.setAttribute('kbd-label', String(v));
    else this.removeAttribute('kbd-label');
  }

  get data() { return this.#data; }
  set data(rows) {
    this.#data = Array.isArray(rows) ? rows : [];
    this.#render();
  }
  get catalogs() { return this.#catalogs; }
  set catalogs(c) {
    this.#catalogs = { ...this.#catalogs, ...(c || {}) };
    this.#render();
  }
  get users() { return this.#users; }
  set users(u) {
    this.#users = Array.isArray(u) ? u : [];
    this.#render();
  }
  get workspaceLabel() { return this.#workspaceLabel; }
  set workspaceLabel(v) { this.#workspaceLabel = v || ''; }

  /* ── lifecycle ─────────────────────────────────────────────────── */
  connectedCallback() {
    const sr = this.shadowRoot;
    // gallery fallback: a bare tag (no .data before connect) shows the sample
    if (!this.#data.length) {
      this.#data = SAMPLE_DATA;
      this.#catalogs = { ...this.#catalogs, ...SAMPLE_CATALOGS };
      this.#users = SAMPLE_USERS;
    }
    // load the persisted per-device column order (sealed LIVE key)
    try {
      const saved = JSON.parse(localStorage.getItem(COL_ORDER_STORAGE_KEY) || 'null');
      this.#colOrder = mergeColumnOrder(saved);
    } catch { this.#colOrder = mergeColumnOrder(null); }

    this.#syncKbd();

    // search — the REAL ui-text-field (composition ruling); matches
    // displayName/name/org/type/notes/tags (sealed)
    const search = sr.querySelector('.search-field');
    search.addEventListener('input', () => { this.#search = search.value; this.#render(); });

    // toolbar popover buttons (REAL ui-button elements) — full four-way
    // exclusivity (recorded ruling)
    sr.querySelector('.tb-filter').addEventListener('click', () => this.#togglePop('filter'));
    sr.querySelector('.tb-sort').addEventListener('click', () => this.#togglePop('sort'));
    sr.querySelector('.tb-cat').addEventListener('click', () => this.#togglePop('cat'));
    sr.querySelector('.tb-site').addEventListener('click', () => this.#togglePop('site'));

    // impact-band chips — REAL ui-chip variant=filter; the chip's selected
    // state drives the band filter (composition ruling)
    sr.querySelectorAll('.impact-chip').forEach((chip) => {
      chip.addEventListener('change', (e) => {
        const band = chip.dataset.band;
        this.#bandFilter = e.detail?.selected
          ? [...new Set([...this.#bandFilter, band])]
          : this.#bandFilter.filter((b) => b !== band);
        this.#render();
      });
    });

    // export — the CURRENT filtered/sorted set (sealed)
    sr.querySelector('.export-btn').addEventListener('click', () => this.#exportCsv());

    // one scroll container; .scrolled-x drives the frozen-edge shadow (sealed;
    // guarded so re-renders never double-bind)
    const scroll = sr.querySelector('.sheet-scroll');
    if (!scroll._scrollBound) {
      scroll._scrollBound = true;
      scroll.addEventListener('scroll', () => {
        scroll.classList.toggle('scrolled-x', scroll.scrollLeft > 0);
      });
    }

    this.#render();
    // re-measure frozen offsets once real fonts arrive (widths shift)
    if (document.fonts?.ready) document.fonts.ready.then(() => this.#measureFrozen());
  }

  disconnectedCallback() {
    this.#unbindDoc();
  }

  #syncKbd() {
    const el = this.shadowRoot?.querySelector('.kbd-cmdk');
    if (!el) return;
    el.textContent = this.kbdLabel;
    el.hidden = !this.kbdLabel;
  }

  /* ── document-level dismissal (toolbar popovers + the owners popover) ─
   * one mousedown + one keydown listener while anything is open;
   * outside-press closes (unless inside the open surface's wrap);
   * Escape closes (recorded normalization: applies to ALL popovers).
   * Cell EDITORS (ui-select / ui-date-picker) own their dismissal —
   * their teardown is driven by their `open` attribute (#mountCellEditor). */
  #bindDoc() {
    if (this.#docMousedown) return;
    this.#docMousedown = (e) => {
      const path = e.composedPath();
      if (this.#openPop) {
        const wrap = this.shadowRoot.querySelector(`.filter-button-wrap[data-pop="${this.#openPop}"]`);
        // sealed: presses inside ANY filter-button-wrap don't outside-close
        const inAnyWrap = path.some((n) => n instanceof HTMLElement && n.classList?.contains('filter-button-wrap'));
        if (!path.includes(wrap) && !inAnyWrap) this.#closePop();
      }
      if (this.#openDD && !path.includes(this.#openDD.anchor)) this.#openDD.close();
    };
    this.#docKeydown = (e) => {
      if (e.key !== 'Escape') return;
      if (this.#openDD) this.#openDD.close();
      else if (this.#openPop) this.#closePop();
    };
    document.addEventListener('mousedown', this.#docMousedown);
    document.addEventListener('keydown', this.#docKeydown);
  }
  #unbindDoc() {
    if (!this.#openPop && !this.#openDD && this.#docMousedown) {
      document.removeEventListener('mousedown', this.#docMousedown);
      document.removeEventListener('keydown', this.#docKeydown);
      this.#docMousedown = null;
      this.#docKeydown = null;
    }
  }

  /* ── filtering + sorting pipeline ──────────────────────────────── */
  #pipeline() {
    const rows = this.#data.filter((r) =>
      rowMatchesSearch(r, this.#search) &&
      rowMatchesFilters(r, this.#filters) &&
      (!this.#catFilter.length || this.#catFilter.includes(r.category)) &&
      (!this.#siteFilter.length || this.#siteFilter.includes(r.site)) &&
      rowMatchesBands(r, this.#bandFilter));
    return sortRows(rows, this.#sortKey, this.#sortDir, {
      sites: this.#catalogs.SITES,
      siteLabel: this.#catalogs.siteLabel,
      users: this.#users,
    });
  }

  /* ── render ────────────────────────────────────────────────────── */
  #render() {
    if (!this.shadowRoot.querySelector('.sheet-grid')) return; // pre-connect
    this.#filtered = this.#pipeline();
    this.#renderGrid();
    this.#syncToolbar();
    this.#renderFooter();
  }

  #cols() {
    const byKey = Object.fromEntries(REORDER_COLS.map((c) => [c.key, c]));
    return [...FROZEN_COLS, ...this.#colOrder.map((k) => byKey[k]).filter(Boolean)];
  }

  #renderGrid() {
    const grid = this.shadowRoot.querySelector('.sheet-grid');
    const cols = this.#cols();
    grid.style.gridTemplateColumns = `repeat(${cols.length}, max-content)`; // sealed: every track max-content
    grid.textContent = '';
    if (this.#openDD) { this.#openDD = null; this.#unbindDoc(); } // popovers lived inside the grid
    this.#openEditor = null;                                     // editors lived inside the grid too

    const head = document.createElement('div');
    head.className = 'sheet-head';
    head.setAttribute('role', 'row');
    for (const col of cols) head.appendChild(this.#buildHeaderCell(col));
    grid.appendChild(head);

    // VIRTUALIZATION (declared): the sealed build map names a virtualized body
    // for large workspaces; DEFERRED at demo scale (~20 rows) — to be
    // implemented when workspaces exceed ~200 rows. Declared, not forgotten.
    const frag = document.createDocumentFragment();
    this.#filtered.forEach((row, i) => frag.appendChild(this.#buildRow(row, i, cols)));
    grid.appendChild(frag);

    this.#measureFrozen();
  }

  /* frozen sticky lefts — MEASURED after layout (sealed tree-proven note):
   * walk the frozen header cells accumulating widths.                        */
  #measureFrozen() {
    const grid = this.shadowRoot.querySelector('.sheet-grid');
    if (!grid) return;
    const headCells = grid.querySelectorAll('.sheet-head .sheet-cell.frozen');
    let left = 0;
    headCells.forEach((cell) => {
      grid.style.setProperty(`--_fl-${cell.dataset.key}`, left + 'px');
      left += cell.getBoundingClientRect().width;
    });
  }

  #buildHeaderCell(col) {
    const isFrozen = FROZEN_COLS.some((f) => f.key === col.key);
    const cell = document.createElement('div');
    cell.setAttribute('role', 'columnheader');
    cell.dataset.key = col.key;
    cell.className = 'sheet-cell' +
      (isFrozen ? ` frozen frozen-${col.key}` : ' col-draggable') +
      (col.key === 'idx' ? ' idx' : '') + (col.key === 'edit' ? ' edit' : '') +
      (col.key === '_x' || col.key === '_y' ? ' coord' : '');

    if (!isFrozen) {
      // drag-to-reorder (sealed mechanics incl. the guarded no-op drop and
      // the dragleave/dragend clears)
      cell.draggable = true;
      cell.title = 'Drag to reorder';
      const grip = document.createElement('ui-icon');
      grip.setAttribute('size', 'sm');
      grip.className = 'col-grip';
      grip.textContent = 'drag_indicator';
      cell.appendChild(grip);
      cell.addEventListener('dragstart', () => { this.#dragKey = col.key; cell.classList.add('dragging'); });
      cell.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (this.#dragOverKey !== col.key) {
          this.#dragOverKey = col.key;
          this.#syncDragHighlight();
        }
      });
      cell.addEventListener('dragleave', () => {
        // sealed: clears ONLY if it still equals this column
        if (this.#dragOverKey === col.key) { this.#dragOverKey = null; this.#syncDragHighlight(); }
      });
      cell.addEventListener('drop', (e) => { e.preventDefault(); this.#onColDrop(col.key); });
      cell.addEventListener('dragend', () => {
        // sealed: an aborted drag leaves no stuck highlight
        this.#dragKey = null; this.#dragOverKey = null;
        this.#syncDragHighlight();
        this.shadowRoot.querySelectorAll('.col-draggable.dragging').forEach((el) => el.classList.remove('dragging'));
      });
    }

    const label = document.createElement('span');
    label.textContent = col.label;
    cell.appendChild(label);

    if (col.field) {
      // header-click sort — the second, independent sort entry point (sealed)
      cell.classList.add('sortable');
      cell.tabIndex = 0;
      cell.setAttribute('aria-sort',
        this.#sortKey === col.field ? (this.#sortDir === 'asc' ? 'ascending' : 'descending') : 'none');
      const go = () => this.#toggleSort(col.field);
      cell.addEventListener('click', go);
      cell.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); }
      });
      if (this.#sortKey === col.field) {
        const ind = document.createElement('span');
        ind.className = 'sort-indicator';
        ind.textContent = this.#sortDir === 'asc' ? '↑' : '↓'; // sealed glyphs
        cell.appendChild(ind);
      }
    }
    if (this.#dragOverKey === col.key) cell.classList.add('drag-over');
    return cell;
  }

  #syncDragHighlight() {
    this.shadowRoot.querySelectorAll('.col-draggable').forEach((el) => {
      el.classList.toggle('drag-over', el.dataset.key === this.#dragOverKey);
    });
  }

  /* onColDrop — sealed: a guarded no-op that just clears both drag states when
   * dragKey is null or equals the target; otherwise splices dragKey
   * immediately BEFORE the target and persists.                              */
  #onColDrop(targetKey) {
    const dragKey = this.#dragKey;
    this.#dragKey = null;
    this.#dragOverKey = null;
    if (!dragKey || dragKey === targetKey) { this.#syncDragHighlight(); return; }
    const order = this.#colOrder.filter((k) => k !== dragKey);
    const idx = order.indexOf(targetKey);
    order.splice(idx < 0 ? order.length : idx, 0, dragKey);
    this.#colOrder = order;
    try { localStorage.setItem(COL_ORDER_STORAGE_KEY, JSON.stringify(order)); } catch { /* per-device only */ }
    this.#render();
  }

  #toggleSort(field) {
    if (this.#sortKey === field) this.#sortDir = this.#sortDir === 'asc' ? 'desc' : 'asc';
    else { this.#sortKey = field; this.#sortDir = 'asc'; }
    this.#render();
  }

  /* ── rows + cells ──────────────────────────────────────────────── */
  #buildRow(row, index, cols) {
    const tr = document.createElement('div');
    tr.className = 'sheet-row' + (row.id === this.#selectedId ? ' selected' : '');
    tr.setAttribute('role', 'row');
    tr.addEventListener('click', () => {
      this.#selectedId = row.id;
      this.shadowRoot.querySelectorAll('.sheet-row.selected').forEach((el) => el.classList.remove('selected'));
      tr.classList.add('selected');
      this.#emit('selection-change', { id: row.id });
    });
    for (const col of cols) tr.appendChild(this.#buildCell(col, row, index));
    return tr;
  }

  #emit(name, detail) {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }
  #patch(row, patch) { this.#emit('row-change', { id: row.id, patch }); }

  #muted(cell) {
    const s = document.createElement('span');
    s.className = 'muted';
    s.textContent = '-';
    cell.appendChild(s);
    return cell;
  }

  /* TOOLTIP RULING (2026-07-03, declared departure): in-shadow supplementary
   * hints use native title until a shadow-safe ui-tooltip pattern is added to
   * the manifest (declared departure). Titles are kept ONLY where they are
   * supplementary to a real affordance: the drag headers ("Drag to reorder"
   * beside the grip), the edit ui-icon-button (beside its aria-label), the
   * notes cell (beside its pointer cursor + click affordance), and the
   * community pills (the engagement name). Owner avatars carry the REAL
   * owners popover (sealed OwnersDisplay) instead of stacked title text.     */
  #buildCell(col, row, index) {
    const isFrozen = FROZEN_COLS.some((f) => f.key === col.key);
    const cell = document.createElement('div');
    cell.setAttribute('role', 'gridcell');
    cell.dataset.key = col.key;
    cell.className = 'sheet-cell' + (isFrozen ? ` frozen frozen-${col.key}` : '');
    const emphasis = cellClass(col.key);
    if (emphasis) cell.className += ' ' + emphasis;

    switch (col.key) {
      case 'idx': {
        cell.classList.add('idx');
        cell.textContent = String(index + 1);
        break;
      }
      case 'edit': {
        cell.classList.add('edit');
        const person = isPersonOf(row);
        const btn = document.createElement('ui-icon-button');           // REAL icon button (composition ruling)
        btn.setAttribute('variant', 'standard');
        const hint = person ? 'Edit person' : 'Edit organization';      // sealed tooltip copy
        btn.setAttribute('aria-label', hint);
        btn.title = hint;                                               // supplementary (TOOLTIP RULING above)
        const ic = document.createElement('ui-icon');
        ic.setAttribute('size', 'sm');
        ic.textContent = person ? 'person' : 'groups';                  // sealed icon map user/users
        btn.appendChild(ic);
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.#emit('open-record', { id: row.id });
        });
        cell.appendChild(btn);
        break;
      }
      case 'name': {
        cell.textContent = displayName(row) || '-';                     // sealed literal "-" fallback
        cell.addEventListener('dblclick', () => this.#emit('open-record', { id: row.id }));
        break;
      }
      case 'org': {
        const input = document.createElement('input');
        input.className = 'cell-input';
        input.value = row.org || '';
        // the grid's tracks are max-content (sealed) — size the input to its
        // value so the Organization column auto-fits like every other column
        input.size = Math.max(12, (row.org || '').length + 2);
        input.setAttribute('aria-label', 'Organization');
        // sealed cascade: org edit mirrors into name for NON-persons.
        // (Commit on change/blur — the mechanical adaptation of the oracle's
        // React controlled-input onChange for a re-rendering web component.)
        input.addEventListener('change', () => {
          const v = input.value;
          this.#patch(row, isPersonOf(row) ? { org: v } : { org: v, name: v });
        });
        cell.appendChild(input);
        break;
      }
      case 'category': {
        const cats = Object.keys(this.#catalogs.CATEGORIES || {});
        this.#buildCellSelect(cell, row, cats, row.category, (v) => {
          // sealed cascade: Category resets Type to the new category's first
          this.#patch(row, { category: v, type: ((this.#catalogs.CATEGORIES || {})[v] || [])[0] || '' });
        });
        break;
      }
      case 'type': {
        const types = (this.#catalogs.CATEGORIES || {})[row.category] || [];
        this.#buildCellSelect(cell, row, types, row.type, (v) => this.#patch(row, { type: v }));
        break;
      }
      case 'market': {
        const markets = Object.keys(this.#catalogs.MARKETS || {});
        this.#buildCellSelect(cell, row, markets, row.market, (v) => {
          // sealed cascade: Market resets Region to the market's first region
          this.#patch(row, { market: v, region: ((this.#catalogs.MARKETS || {})[v] || [])[0] || '' });
        });
        break;
      }
      case 'region': {
        const regions = (this.#catalogs.MARKETS || {})[row.market] || [];
        this.#buildCellSelect(cell, row, regions, row.region, (v) => this.#patch(row, { region: v }));
        break;
      }
      case 'geography': {
        this.#buildCellSelect(cell, row, this.#catalogs.GEOGRAPHIES || [], row.geography,
          (v) => this.#patch(row, { geography: v }));
        break;
      }
      case 'state': {
        this.#buildCellSelect(cell, row, this.#catalogs.US_STATES || [], row.state,
          (v) => this.#patch(row, { state: v }));                       // sealed: US_STATES, placeholder "-"
        break;
      }
      case 'site': {
        const sites = this.#catalogs.SITES || [];
        const labelFn = this.#catalogs.siteLabel || ((s) => s.city || s.id);
        const opts = sites.map((s) => ({ value: s.id, label: labelFn(s) }));
        this.#buildCellSelect(cell, row, opts, row.site, (v) => {
          // sealed cascade: a Site with a state auto-fills State
          const rec = sites.find((s) => s.id === v);
          this.#patch(row, rec && rec.state ? { site: v, state: rec.state } : { site: v });
        });
        break;
      }
      case 'status': {
        this.#buildCellSelect(cell, row, STATUS_OPTIONS, row.status,
          (v) => this.#patch(row, { status: v }));
        break;
      }
      case 'issues':
      case 'tags': {
        this.#buildTags(cell, asArr(row[col.key]));                     // first 3 + "+N" (sealed)
        break;
      }
      case 'priority': {
        const pill = document.createElement('span');
        const p = (row.priority || '').toLowerCase();
        pill.className = 'pill ' + (p === 'high' ? 'pill--high' : p === 'medium' ? 'pill--medium' : 'pill--low');
        pill.textContent = row.priority || '';
        cell.appendChild(pill);
        break;
      }
      case '_x':
      case '_y': {
        const val = row[col.key];
        const n = typeof val === 'number' ? val : parseFloat(val);
        if (Number.isFinite(n)) {
          if (n > 1) cell.classList.add('positive');                    // sealed tone thresholds
          else if (n < -1) cell.classList.add('negative');
          cell.textContent = n.toFixed(1);
        } else cell.textContent = '—';
        break;
      }
      case '_status': {
        const zone = ZONE_TOKEN_MAP[row._status];
        if (zone) {
          const pill = document.createElement('span');
          pill.className = 'zone-pill';
          pill.style.setProperty('--_zone-bg', `var(${zone.bg})`);
          pill.style.setProperty('--_zone-ink', `var(${zone.ink})`);
          const meta = row._status;
          pill.textContent = meta;
          cell.appendChild(pill);
        }
        // sealed StatusPill null-guard: an uncatalogued zone renders NOTHING
        break;
      }
      case 'owner': {
        this.#buildOwnersCell(cell, row);
        break;
      }
      case 'email': {
        if (!row.email) { this.#muted(cell); break; }
        const a = document.createElement('a');
        a.className = 'plain-link';
        a.href = 'mailto:' + row.email;
        a.textContent = row.email;
        a.addEventListener('click', (e) => e.stopPropagation());        // sealed: links never select the row
        cell.appendChild(a);
        break;
      }
      case 'phone': {
        if (!row.phone) { this.#muted(cell); break; }
        const a = document.createElement('a');
        a.className = 'plain-link';
        a.href = 'tel:' + cleanTel(row.phone);                          // sealed cleaning regex
        a.textContent = formatPhone(row.phone);
        a.addEventListener('click', (e) => e.stopPropagation());
        cell.appendChild(a);
        break;
      }
      case 'xAccount': {
        if (!row.xAccount) { this.#muted(cell); break; }
        const handle = cleanXHandle(row.xAccount);                      // sealed /^@+/ strip
        const a = document.createElement('a');
        a.className = 'plain-link';
        a.href = 'https://x.com/' + handle;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = '@' + handle;
        a.addEventListener('click', (e) => e.stopPropagation());
        cell.appendChild(a);
        break;
      }
      case 'lastContact': {
        this.#buildCellDate(cell, row);
        break;
      }
      case 'notes': {
        cell.title = 'Click to view notes & history';                   // sealed tooltip copy
        const prev = document.createElement('span');
        prev.className = 'notes-preview';
        prev.textContent = row.notes || '';
        cell.appendChild(prev);
        cell.addEventListener('click', (e) => {
          e.stopPropagation();                                          // sealed: opens the Notes modal, not select
          this.#emit('notes-open', { id: row.id });
        });
        break;
      }
      case 'url': {
        if (!row.url) { this.#muted(cell); break; }
        const a = document.createElement('a');
        a.className = 'plain-link';
        a.href = normalizeUrl(row.url);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'Visit Website';                                // sealed link text
        a.addEventListener('click', (e) => e.stopPropagation());
        cell.appendChild(a);
        break;
      }
      case 'community': {
        const names = asArr(row.community);
        if (!names.length) { this.#muted(cell); break; }
        const wrap = document.createElement('span');
        wrap.className = 'pills-inline';
        for (const entry of names) {
          const name = typeof entry === 'string' ? entry : entry.name;
          // Connectivity census C5 MAKE-REAL: the pill is a live control, not
          // a dead span — clicking routes out (the page answers until the
          // Community phase lands its read view).
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'tag';
          b.title = name;                                                // sealed: title = engagement name
          b.textContent = name;
          b.addEventListener('click', (e) => {
            e.stopPropagation();
            this.#emit('community-open', { id: row.id, name });
          });
          wrap.appendChild(b);
        }
        cell.appendChild(wrap);
        break;
      }
      default: {
        cell.textContent = row[col.key] ?? '';
      }
    }
    return cell;
  }

  /* Tags(values) — sealed: no values → muted "-"; else first 3 as .tag chips
   * then a muted "+N" overflow.                                              */
  #buildTags(cell, values) {
    if (!values.length) { this.#muted(cell); return; }
    const wrap = document.createElement('span');
    wrap.className = 'pills-inline';
    values.slice(0, 3).forEach((v) => {
      const t = document.createElement('span');
      t.className = 'tag';
      t.textContent = v;
      wrap.appendChild(t);
    });
    if (values.length > 3) {
      const more = document.createElement('span');
      more.className = 'tag-more';
      more.textContent = '+' + (values.length - 3);
      wrap.appendChild(more);
    }
    cell.appendChild(wrap);
  }

  /* OwnersDisplay (sealed Shared-primitives spec): read-only 20px avatar
   * stack; hover/click opens the owners popover — head "{n} owner"/"{n}
   * owners" (singularizes at 1 via label.replace(/s$/,"")), then a row per
   * RESOLVED owner (REAL ui-avatar + name + muted title). Unresolved owner
   * ids silently drop from BOTH the stack and the head count (sealed).
   * Outside-mousedown + Escape close via the shared #openDD registry.        */
  #buildOwnersCell(cell, row) {
    const list = asArr(row.owners)
      .map((id) => this.#users.find((u) => u.id === id))
      .filter(Boolean);                                                 // sealed: unresolved ids silently dropped
    if (!list.length) { this.#muted(cell); return; }

    const wrap = document.createElement('span');
    wrap.className = 'owner-wrap';
    const stack = document.createElement('span');
    stack.className = 'owner-stack';
    for (const u of list) {
      const av = document.createElement('span');
      av.className = 'owner-av';
      if (u.avatarColor) av.style.background = u.avatarColor;           // token reference from seed, never hex
      av.textContent = abbrev(u.name);
      stack.appendChild(av);
    }
    wrap.appendChild(stack);

    const open = () => {
      if (this.#openDD && this.#openDD.anchor === wrap) return;
      this.#openDD?.close();
      const pop = document.createElement('div');
      pop.className = 'owners-pop';
      pop.addEventListener('click', (e) => e.stopPropagation());        // reading owners never selects the row
      const head = document.createElement('div');
      head.className = 'owners-pop-head';
      const label = 'owners';
      head.textContent = `${list.length} ${list.length === 1 ? label.replace(/s$/, '') : label}`;
      pop.appendChild(head);
      for (const u of list) {
        const rowEl = document.createElement('div');
        rowEl.className = 'owners-pop-row';
        const av = document.createElement('ui-avatar');                 // REAL avatar primitive (composition ruling)
        av.setAttribute('size', 'sm');
        av.setAttribute('name', u.name || '');
        if (u.avatarColor) av.style.background = u.avatarColor;         // token reference from seed, never hex
        rowEl.appendChild(av);
        const names = document.createElement('span');
        names.className = 'owners-pop-names';
        const nm = document.createElement('span');
        nm.className = 'owners-pop-name';
        nm.textContent = u.name || '';
        names.appendChild(nm);
        if (u.title) {
          const ti = document.createElement('span');
          ti.className = 'owners-pop-title';
          ti.textContent = u.title;
          names.appendChild(ti);
        }
        rowEl.appendChild(names);
        pop.appendChild(rowEl);
      }
      wrap.appendChild(pop);
      const close = () => { pop.remove(); this.#openDD = null; this.#unbindDoc(); };
      this.#openDD = { anchor: wrap, close };
      this.#bindDoc();
    };
    wrap.addEventListener('mouseenter', open);                          // sealed: hover opens
    wrap.addEventListener('click', (e) => {
      e.stopPropagation();                                              // opening the popover never selects the row
      if (this.#openDD && this.#openDD.anchor === wrap) this.#openDD.close();
      else open();                                                      // sealed: click opens too
    });
    cell.appendChild(wrap);
  }

  /* Mount a REAL design-system editor over a display cell (COMPOSITION
   * RULING): hides the display render, absolutely positions the editor in
   * the cell, commits on 'change', and unmounts when the component's own
   * `open` attribute clears — the component's dismissal (outside click /
   * Escape / commit) drives the teardown; no dismissal logic is re-rolled.  */
  #mountCellEditor(cell, editor, preOpen, onCommit) {
    if (this.#openEditor) this.#openEditor();                           // one editor at a time
    editor.classList.add('cell-editor');
    cell.classList.add('cell-editing');
    editor.addEventListener('click', (e) => e.stopPropagation());       // editing never selects the row (sealed)
    let done = false;
    const unmount = () => {
      if (done) return;
      done = true;
      obs.disconnect();
      editor.remove();
      cell.classList.remove('cell-editing');
      if (this.#openEditor === unmount) this.#openEditor = null;
    };
    const obs = new MutationObserver(() => {
      if (!editor.hasAttribute('open')) unmount();                      // editor closed → unmount
    });
    obs.observe(editor, { attributes: true, attributeFilter: ['open'] });
    editor.addEventListener('change', (e) => {
      unmount();
      onCommit(e);                                                      // commit flows out as row-change (sealed seam)
    });
    cell.appendChild(editor);
    this.#openEditor = unmount;
    requestAnimationFrame(() => {
      if (editor.shadowRoot) preOpen(editor);
      else customElements.whenDefined(editor.localName).then(() => preOpen(editor));
    });
  }

  /* CellSelect — a lightweight display render (COMPOSITION RULING) whose
   * click mounts a REAL pre-opened <ui-select> (+ ui-option) in the cell;
   * the value commits on the select's change and the editor unmounts when
   * the select closes (its own outside-mousedown/Escape dismissal).         */
  #buildCellSelect(cell, row, options, current, onChange, placeholder = '-') {
    const opts = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
    const currentOpt = opts.find((o) => o.value === current);

    const dd = document.createElement('span');
    dd.className = 'cell-dd cell-display';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'cell-dd-trigger' + (currentOpt ? '' : ' is-empty');
    trigger.textContent = currentOpt ? currentOpt.label : placeholder;
    trigger.setAttribute('aria-haspopup', 'listbox');
    dd.appendChild(trigger);

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();                                              // opening never selects the row (sealed)
      const sel = document.createElement('ui-select');
      for (const o of opts) {
        const opt = document.createElement('ui-option');
        opt.setAttribute('value', o.value);
        opt.textContent = o.label;
        sel.appendChild(opt);
      }
      if (currentOpt) sel.setAttribute('value', current);
      this.#mountCellEditor(cell, sel, (el) => {
        // Pre-open: ui-select has no public open() API yet, so the mount
        // presses the component's own trigger field (open shadow mode) —
        // the editor IS the real component; nothing is re-implemented.
        el.shadowRoot?.querySelector('.field')?.click();
      }, (e2) => onChange(e2.detail.value));
    });
    cell.appendChild(dd);
  }

  /* CellDate — a lightweight display render (COMPOSITION RULING) whose click
   * mounts a REAL pre-opened <ui-date-picker> in the cell; picking a day
   * commits the sealed YYYY-MM-DD value and the editor unmounts on close.    */
  #buildCellDate(cell, row) {
    const stored = row.lastContact || '';
    const dd = document.createElement('span');
    dd.className = 'cell-dd cell-display';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'cell-dd-trigger' + (stored ? '' : ' is-empty');
    trigger.textContent = stored || '-';
    dd.appendChild(trigger);

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();                                              // opening never selects the row (sealed)
      const dp = document.createElement('ui-date-picker');
      dp.setAttribute('label', 'Last contact');
      if (stored) dp.setAttribute('value', stored);                     // view month = stored value's month (component behavior)
      this.#mountCellEditor(cell, dp,
        (el) => el.setAttribute('open', ''),                            // ui-date-picker supports the open attribute
        (e2) => this.#patch(row, { lastContact: e2.detail.value }));    // sealed YYYY-MM-DD zero-padded
    });
    cell.appendChild(dd);
  }

  /* ── toolbar sync + popovers ───────────────────────────────────── */
  #syncToolbar() {
    const sr = this.shadowRoot;
    // The count ui-badge hides itself at 0 (component behavior) — the visible
    // badge IS the active signal on each REAL toolbar ui-button.
    const setBadge = (sel, n) => sr.querySelector(sel).setAttribute('count', String(n));
    const filterCount = Object.values(this.#filters).reduce((s, a) => s + a.length, 0);
    setBadge('.tb-filter-badge', filterCount);
    setBadge('.tb-sort-badge', this.#sortKey ? 1 : 0);
    setBadge('.tb-cat-badge', this.#catFilter.length);
    setBadge('.tb-site-badge', this.#siteFilter.length);

    // band counts — a per-zone tally over rows (sealed countByStatus)
    const tally = countByStatus(this.#data);
    const sum = (zones) => zones.reduce((s, z) => s + (tally[z] || 0), 0);
    sr.querySelector('.count-pos').textContent = sum(BAND_STATUSES.positive);
    sr.querySelector('.count-mid').textContent = sum(BAND_STATUSES.middle);
    sr.querySelector('.count-neg').textContent = sum(BAND_STATUSES.negative);
    sr.querySelectorAll('.impact-chip').forEach((chip) => {
      chip.toggleAttribute('selected', this.#bandFilter.includes(chip.dataset.band));
    });

    if (this.#openPop) this.#renderPopover();
  }

  #togglePop(which) {
    // full four-way exclusivity + one dismissal model (the recorded
    // normalization of the sealed oracle quirk)
    this.#openPop = this.#openPop === which ? null : which;
    this.shadowRoot.querySelectorAll('.filter-button-wrap .tb-pop-btn').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    this.shadowRoot.querySelectorAll('.filter-popover').forEach((p) => p.remove());
    if (this.#openPop) {
      this.shadowRoot.querySelector(`.filter-button-wrap[data-pop="${which}"] .tb-pop-btn`)
        .setAttribute('aria-expanded', 'true');
      this.#renderPopover();
      this.#bindDoc();
    } else this.#unbindDoc();
  }
  #closePop() { if (this.#openPop) this.#togglePop(this.#openPop); }

  #renderPopover() {
    const which = this.#openPop;
    const wrap = this.shadowRoot.querySelector(`.filter-button-wrap[data-pop="${which}"]`);
    if (!wrap) return;
    let pop = wrap.querySelector('.filter-popover');
    if (!pop) {
      pop = document.createElement('div');
      pop.className = 'filter-popover' + (which === 'cat' || which === 'site' ? ' narrow' : '');
      wrap.appendChild(pop);
    }
    pop.textContent = '';

    const head = document.createElement('div');
    head.className = 'filter-pop-head';
    const title = document.createElement('strong');
    title.textContent = which === 'filter' ? 'Filter' : which === 'sort' ? 'Sort by' : which === 'cat' ? 'Categories' : 'Sites';
    head.appendChild(title);
    const clear = document.createElement('ui-button');                   // REAL text button (composition ruling)
    clear.setAttribute('variant', 'text');
    clear.className = 'clear-all';
    clear.textContent = 'Clear all';
    clear.addEventListener('click', () => {
      if (which === 'filter') {
        // sealed cross-clearing: empties ALL SIX fields AND Categories —
        // but NEVER Sites and NEVER the impact-band filter
        this.#filters = { type: [], priority: [], status: [], owners: [], issues: [], zone: [] };
        this.#catFilter = [];
      } else if (which === 'sort') {
        this.#sortKey = null; this.#sortDir = 'asc';                     // restores unscored-first default
      } else if (which === 'cat') this.#catFilter = [];
      else this.#siteFilter = [];
      this.#render();
    });
    head.appendChild(clear);
    pop.appendChild(head);

    const body = document.createElement('div');
    body.className = 'filter-pop-body';
    pop.appendChild(body);

    if (which === 'filter') this.#renderFilterBody(body);
    else if (which === 'sort') this.#renderSortBody(body);
    else if (which === 'cat') {
      this.#renderCheckList(body, Object.keys(this.#catalogs.CATEGORIES || {})
        .map((c) => ({ value: c, label: c })), this.#catFilter, (v) => {
        this.#catFilter = this.#catFilter.includes(v) ? this.#catFilter.filter((x) => x !== v) : [...this.#catFilter, v];
        this.#render();
      });
    } else {
      const labelFn = this.#catalogs.siteLabel || ((s) => s.city || s.id);
      this.#renderCheckList(body, (this.#catalogs.SITES || [])
        .map((s) => ({ value: s.id, label: labelFn(s) })), this.#siteFilter, (v) => {
        this.#siteFilter = this.#siteFilter.includes(v) ? this.#siteFilter.filter((x) => x !== v) : [...this.#siteFilter, v];
        this.#render();
      });
    }
  }

  /* The six sealed FilterSection blocks, in order.                           */
  #renderFilterBody(body) {
    const options = buildFilterOptions(this.#data);
    const userName = (id) => ((this.#users.find((u) => u.id === id) || {}).name || id);
    const sections = [
      ['Audience type', 'type', options.type, (v) => v],
      ['Priority', 'priority', options.priority, (v) => v],
      ['Status', 'status', options.status, (v) => v],
      ['Relationship', 'zone', options.zone, (v) => v],
      ['Issues', 'issues', options.issues, (v) => v],
      ['Owner', 'owners', options.owners, userName],
    ];
    for (const [label, field, values, renderLabel] of sections) {
      if (!values.length) continue;                                     // sealed FilterSection: no values → nothing
      const lab = document.createElement('div');
      lab.className = 'filter-pop-label';
      lab.textContent = label;
      body.appendChild(lab);
      const chips = document.createElement('div');
      chips.className = 'filter-chips';
      const active = this.#filters[field];
      // leading "All" chip — .on when nothing selected; clicking clears the section
      const all = document.createElement('button');
      all.type = 'button';
      all.className = 'filter-chip' + (active.length ? '' : ' on');
      all.textContent = 'All';
      all.addEventListener('click', () => {
        this.#filters = { ...this.#filters, [field]: [] };
        this.#render();
      });
      chips.appendChild(all);
      for (const v of values) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'filter-chip' + (active.includes(v) ? ' on' : '');
        chip.textContent = renderLabel(v);
        chip.addEventListener('click', () => {
          const next = active.includes(v) ? active.filter((x) => x !== v) : [...active, v];
          this.#filters = { ...this.#filters, [field]: next };
          this.#render();
        });
        chips.appendChild(chip);
      }
      body.appendChild(chips);
    }
  }

  /* SortFieldList over the sealed 11 fields.                                 */
  #renderSortBody(body) {
    for (const f of SORT_FIELDS) {
      const type = sortFieldType(f.key);
      const active = this.#sortKey === f.key;
      const rowEl = document.createElement('div');
      rowEl.className = 'sort-fieldrow' + (active ? ' active' : '');
      const name = document.createElement('button');
      name.type = 'button';
      name.className = 'sort-name';
      name.textContent = (active ? '● ' : '') + f.label;
      name.addEventListener('click', () => {
        // sealed: newly selected field takes the type default (dates desc);
        // re-clicking the active field keeps the CURRENT direction
        this.#sortKey = f.key;
        this.#sortDir = active ? this.#sortDir : (type === 'date' ? 'desc' : 'asc');
        this.#render();
      });
      rowEl.appendChild(name);
      if (active) {
        const [ascLabel, descLabel] = sortDirLabels(type);
        const seg = document.createElement('div');
        seg.className = 'sort-dir-seg';
        for (const [dir, lbl] of [['asc', ascLabel], ['desc', descLabel]]) {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = this.#sortDir === dir ? 'on' : '';
          b.textContent = lbl;
          b.addEventListener('click', () => { this.#sortDir = dir; this.#render(); });
          seg.appendChild(b);
        }
        rowEl.appendChild(seg);
      }
      body.appendChild(rowEl);
    }
  }

  /* Categories/Sites check-option list.                                      */
  #renderCheckList(body, options, active, onToggle) {
    const list = document.createElement('div');
    list.className = 'cat-opt-list';
    for (const o of options) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'cat-opt' + (active.includes(o.value) ? ' on' : '');
      const check = document.createElement('ui-icon');
      check.setAttribute('size', 'sm');
      check.className = 'cat-check';
      check.textContent = 'check';
      b.appendChild(check);
      const s = document.createElement('span');
      s.textContent = o.label;
      b.appendChild(s);
      b.addEventListener('click', () => onToggle(o.value));
      list.appendChild(b);
    }
    body.appendChild(list);
  }

  /* ── footer + export ───────────────────────────────────────────── */
  #renderFooter() {
    const sr = this.shadowRoot;
    const filtered = this.#filtered;
    const denom = Math.max(filtered.length, 1);                          // sealed divide-by guard
    const avg = (key) => (filtered.reduce((s, r) => s + (Number(r[key]) || 0), 0) / denom).toFixed(1);
    sr.querySelector('.footer-count').textContent = `${filtered.length} of ${this.#data.length} stakeholders`;
    sr.querySelector('.footer-avgx').textContent = avg('_x');
    sr.querySelector('.footer-avgy').textContent = avg('_y');
  }

  #exportCsv() {
    const csv = buildCsv(this.#filtered, this.#users);                   // the CURRENT filtered/sorted set (sealed)
    const filename = csvFilename(this.#workspaceLabel);
    try {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* headless/test contexts: the event below still carries the csv */ }
    this.#emit('export-csv', { csv, filename });
  }
}

if (!customElements.get('ui-stakeholder-table')) {
  customElements.define('ui-stakeholder-table', UiStakeholderTable);
}

} /* HAS_DOM */
