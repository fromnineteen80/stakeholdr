/* ============================================================================
 * <ui-stakeholder-table> — canonical domain component: the Stakeholdr
 * stakeholder data grid ("our table"). Frozen sticky-left columns, scrollable
 * right columns, sortable headers, toolbar with search/filter/summary chips,
 * sticky footer with aggregate stats and export.
 *
 * Styled ONLY via --ui-sys-* tokens (geometry/structure constants allowed).
 * No hardcoded colors or fonts. Shadow DOM mode:'open'. Accessible table
 * semantics + keyboard navigation. Accepts a `.data` property to override
 * built-in sample rows.
 * ==========================================================================*/

const ZONE_TOKEN_MAP = {
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
  'High Value Relationship':{ bg: '--ui-sys-zone-high-value-relationship', ink: '--ui-sys-zone-ink-positive' },
  'Strategic Partner':     { bg: '--ui-sys-zone-strategic-partner',    ink: '--ui-sys-zone-ink-on-strong' },
};

const POSITIVE_STATUSES = new Set(['Cooperate','Collaborate','Valuable Relationship','High Value Relationship','Strategic Partner']);
const MIDDLE_STATUSES   = new Set(['Monitor','Maintain','Connect','Commit']);
const NEGATIVE_STATUSES = new Set(['Proactively Defend','Defend','Protect','Respond','Identify']);

const SAMPLE_DATA = [
  { name: 'Mayor Maria Chen',        org: 'City of Cedarville',       category: 'Government',   type: 'Mayor',              region: 'Cedarville', priority: 'High',   x: 2.9,  y: 8.1, status: 'Active',  relationship: 'Valuable Relationship' },
  { name: 'Cedarville Chamber',      org: 'Chamber of Commerce',      category: 'Industry',     type: 'Trade Association',  region: 'Cedarville', priority: 'High',   x: 1.5,  y: 4.2, status: 'Active',  relationship: 'Collaborate' },
  { name: 'Riverside Tribune',       org: 'Riverside Media',          category: 'Communities',  type: 'Media',              region: 'Regional',   priority: 'Medium', x: -3.2, y: 6.0, status: 'Watch',   relationship: 'Defend' },
  { name: 'Dr. Priya Nair',          org: 'Cedar Valley Hospital',    category: 'Government',   type: 'Health Authority',   region: 'Cedarville', priority: 'High',   x: 3.8,  y: 9.2, status: 'Active',  relationship: 'Strategic Partner' },
  { name: 'Greenfield Residents Assoc.', org: 'GRA Inc.',             category: 'Communities',  type: 'Community Group',   region: 'Greenfield', priority: 'Medium', x: 0.3,  y: 2.1, status: 'Watch',   relationship: 'Monitor' },
  { name: 'Harlan Frost',            org: 'Frost & Associates',       category: 'Industry',     type: 'Consultant',         region: 'National',   priority: 'Low',    x: -2.1, y: 1.4, status: 'Dormant', relationship: 'Respond' },
  { name: 'Anika Trestel',           org: 'Trestel Policy Group',     category: 'Government',   type: 'Policy Advisor',     region: 'Regional',   priority: 'Medium', x: 1.1,  y: 5.5, status: 'Active',  relationship: 'Cooperate' },
  { name: 'Riverside Sierra Club',   org: 'Sierra Club – Riverside',  category: 'Communities',  type: 'Advocacy Group',     region: 'Regional',   priority: 'Medium', x: -1.4, y: 3.8, status: 'Watch',   relationship: 'Identify' },
  { name: 'Paul Keating',            org: 'Keating Construction Ltd', category: 'Industry',     type: 'Contractor',         region: 'Cedarville', priority: 'Low',    x: 0.8,  y: 2.9, status: 'Active',  relationship: 'Commit' },
  { name: 'State Env. Agency',       org: 'Dept. of Environment',     category: 'Government',   type: 'Regulator',          region: 'State',      priority: 'High',   x: 2.3,  y: 7.4, status: 'Active',  relationship: 'High Value Relationship' },
];

const COLUMNS = [
  /* frozen */
  { key: '_rownum',   label: '#',             width: 38,  frozen: true,  left: 0,   numeric: true  },
  { key: '_edit',     label: '',              width: 34,  frozen: true,  left: 38,  noSort: true   },
  { key: 'name',      label: 'Stakeholder',   width: 240, frozen: true,  left: 72                  },
  { key: 'org',       label: 'Organization',  width: 200, frozen: true,  left: 312                 },
  /* scrollable */
  { key: 'category',  label: 'Category',      width: 130                                           },
  { key: 'type',      label: 'Type',          width: 150                                           },
  { key: 'region',    label: 'Region',        width: 120                                           },
  { key: 'priority',  label: 'Priority',      width: 90                                            },
  { key: 'x',         label: 'x',             width: 64,  numeric: true                            },
  { key: 'y',         label: 'y',             width: 64,  numeric: true                            },
  { key: 'relationship', label: 'Relationship', width: 180                                         },
  { key: 'status',    label: 'Status',        width: 90                                            },
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
    background: var(--ui-sys-surface);
    border: 1px solid var(--ui-sys-outline);
    border-radius: var(--ui-sys-shape-card);
    overflow: hidden;
  }

  /* ── TOOLBAR ─────────────────────────────────────────────────── */
  .toolbar {
    position: sticky;
    top: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    gap: var(--ui-sys-space-2);
    padding: var(--ui-sys-space-2) var(--ui-sys-space-3);
    background: var(--ui-sys-surface-container);
    border-bottom: 1px solid var(--ui-sys-outline);
    flex-shrink: 0;
    flex-wrap: wrap;
  }

  .search-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }
  .search-icon {
    position: absolute;
    left: 8px;
    width: 16px;
    height: 16px;
    pointer-events: none;
    color: var(--ui-sys-on-surface-muted);
    flex-shrink: 0;
  }
  .search-input {
    appearance: none;
    height: var(--ui-sys-control-height);
    padding: 0 var(--ui-sys-space-3) 0 32px;
    border: 1px solid var(--ui-sys-outline);
    border-radius: var(--ui-sys-shape-control);
    background: var(--ui-sys-surface-field);
    color: var(--ui-sys-on-surface);
    font: var(--ui-sys-font-body);
    width: 220px;
    outline: none;
    transition: border-color var(--ui-sys-motion-control),
                background  var(--ui-sys-motion-control);
  }
  .search-input::placeholder { color: var(--ui-sys-on-surface-muted); }
  .search-input:focus {
    border-color: var(--ui-sys-focus-ring);
    background: var(--ui-sys-surface-card);
  }

  .toolbar-btn[disabled] {
      opacity: .45;
      cursor: default;
      pointer-events: none;
    }
    .toolbar-btn {
    appearance: none;
    position: relative;
    isolation: isolate;
    display: inline-flex;
    align-items: center;
    gap: var(--ui-sys-space-1);
    height: var(--ui-sys-control-height);
    padding: 0 var(--ui-sys-space-3);
    border: 1px solid var(--ui-sys-outline);
    border-radius: var(--ui-sys-shape-control);
    background: var(--ui-sys-surface-card);
    color: var(--ui-sys-on-surface);
    font: var(--ui-sys-font-label);
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    overflow: hidden;
    transition: background var(--ui-sys-motion-control);
  }
  .toolbar-btn::before {
    content: '';
    position: absolute;
    inset: 0;
    background: currentColor;
    opacity: 0;
    z-index: -1;
    transition: opacity var(--ui-sys-motion-control);
  }
  .toolbar-btn:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
  .toolbar-btn:active::before { opacity: var(--ui-sys-state-pressed-opacity); }
  .toolbar-btn:focus-visible  { outline: 2px solid var(--ui-sys-focus-ring); outline-offset: 2px; }

  .badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: var(--ui-sys-shape-pill);
    background: var(--ui-sys-primary);
    color: var(--ui-sys-on-primary);
    font: var(--ui-sys-font-caption);
    font-weight: 600;
  }

  .spacer { flex: 1 1 auto; }

  .summary-chips {
    display: flex;
    align-items: center;
    gap: var(--ui-sys-space-2);
  }
  .summary-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 28px;
    padding: 0 var(--ui-sys-space-3);
    border: 1px solid var(--ui-sys-outline);
    border-radius: var(--ui-sys-shape-pill);
    background: var(--ui-sys-surface-card);
    color: var(--ui-sys-on-surface);
    font: var(--ui-sys-font-caption);
    white-space: nowrap;
    user-select: none;
  }
  .chip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .chip-dot--pos { background: var(--ui-sys-pos); }
  .chip-dot--mid { background: var(--ui-sys-warning); }
  .chip-dot--neg { background: var(--ui-sys-neg); }
  .chip-count { font-weight: 600; }

  /* ── SCROLL CONTAINER ────────────────────────────────────────── */
  .scroll-wrap {
    flex: 1 1 auto;
    overflow: auto;
    position: relative;
  }

  /* ── TABLE ───────────────────────────────────────────────────── */
  table {
    border-collapse: separate;
    border-spacing: 0;
    min-width: max-content;
    width: 100%;
  }

  /* ── HEADER ──────────────────────────────────────────────────── */
  thead {
    position: sticky;
    top: 0;
    z-index: 20;
  }
  thead tr {
    background: var(--ui-sys-surface-container);
  }
  th {
    padding: 0 var(--ui-sys-space-2);
    height: 34px;
    font: var(--ui-sys-font-label);
    color: var(--ui-sys-on-surface-muted);
    text-align: left;
    white-space: nowrap;
    border-bottom: 1px solid var(--ui-sys-outline);
    user-select: none;
    position: relative;
  }
  th.sortable {
    cursor: pointer;
  }
  th.sortable:hover {
    color: var(--ui-sys-on-surface);
    background: var(--ui-sys-surface-hover);
  }
  th.sortable:focus-visible {
    outline: 2px solid var(--ui-sys-focus-ring);
    outline-offset: -2px;
  }
  th .sort-indicator {
    display: inline-block;
    margin-left: 4px;
    font-size: 10px;
    opacity: 0.5;
  }
  th[aria-sort="ascending"]  .sort-indicator,
  th[aria-sort="descending"] .sort-indicator { opacity: 1; }

  /* Frozen column stickiness */
  th.frozen, td.frozen {
    position: sticky;
    z-index: 10;
    background: inherit;
  }
  thead th.frozen { z-index: 21; background: var(--ui-sys-surface-container); }

  /* Right-border shadow for frozen panel */
  th.frozen-last,
  td.frozen-last {
    box-shadow: 2px 0 4px -1px rgba(0,0,0,.06);
  }

  /* ── ROWS ────────────────────────────────────────────────────── */
  tbody tr {
    background: var(--ui-sys-surface-card);
    transition: background var(--ui-sys-motion-control);
  }
  tbody tr:hover {
    background: var(--ui-sys-surface-hover);
  }
  tbody tr.zone-tint {
    /* overridden inline via CSS var --_zone-wash */
    background: var(--_zone-wash, var(--ui-sys-surface-card));
  }
  tbody tr.zone-tint:hover {
    background: var(--ui-sys-surface-hover);
  }

  td {
    padding: 0 var(--ui-sys-space-2);
    height: 36px;
    font: var(--ui-sys-font-body);
    color: var(--ui-sys-on-surface);
    border-bottom: 1px solid var(--ui-sys-outline-subtle);
    white-space: nowrap;
    vertical-align: middle;
    max-width: 0; /* forces text-overflow on fixed-width cols */
    overflow: hidden;
    text-overflow: ellipsis;
  }

  td.cell-num {
    font-variant-numeric: tabular-nums;
    text-align: right;
    color: var(--ui-sys-on-surface-muted);
  }
  td.cell-num.val-pos { color: var(--ui-sys-pos); }
  td.cell-num.val-neg { color: var(--ui-sys-neg); }

  /* Row number column */
  td.col-rownum {
    color: var(--ui-sys-on-surface-muted);
    font: var(--ui-sys-font-caption);
    text-align: center;
  }

  /* Edit button column */
  td.col-edit {
    padding: 0;
    text-align: center;
  }

  /* Priority pill */
  .pill {
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 8px;
    border-radius: var(--ui-sys-shape-pill);
    font: var(--ui-sys-font-caption);
    font-weight: 500;
    white-space: nowrap;
  }
  .pill--high {
    background: var(--ui-sys-zone-respond);
    color: var(--ui-sys-zone-ink-negative);
  }
  .pill--medium {
    background: var(--ui-sys-zone-monitor);
    color: var(--ui-sys-zone-ink-neutral);
  }
  .pill--low {
    background: var(--ui-sys-surface-container-high);
    color: var(--ui-sys-on-surface-muted);
  }

  /* Relationship status pill */
  .zone-pill {
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 8px;
    border-radius: var(--ui-sys-shape-pill);
    font: var(--ui-sys-font-caption);
    font-weight: 500;
    white-space: nowrap;
  }

  /* Status text */
  .status-active  { color: var(--ui-sys-pos); font-weight: 500; }
  .status-watch   { color: var(--ui-sys-warning); font-weight: 500; }
  .status-dormant { color: var(--ui-sys-on-surface-muted); }

  /* Icon button (edit) */
  .icon-btn {
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border: none;
    border-radius: var(--ui-sys-shape-control);
    background: transparent;
    color: var(--ui-sys-on-surface-muted);
    cursor: pointer;
    transition: background var(--ui-sys-motion-control), color var(--ui-sys-motion-control);
  }
  .icon-btn:hover {
    background: var(--ui-sys-surface-hover);
    color: var(--ui-sys-on-surface);
  }
  .icon-btn:focus-visible {
    outline: 2px solid var(--ui-sys-focus-ring);
    outline-offset: 2px;
  }
  .icon-btn svg {
    width: 15px;
    height: 15px;
    pointer-events: none;
  }

  /* ── FOOTER ──────────────────────────────────────────────────── */
  .footer {
    position: sticky;
    bottom: 0;
    z-index: 30;
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
  .footer .stat-sep {
    color: var(--ui-sys-on-surface-faint);
  }
  .footer .note {
    font-style: italic;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  }
  .footer .export-btn {
    appearance: none;
    display: inline-flex;
    align-items: center;
    gap: var(--ui-sys-space-1);
    height: 26px;
    padding: 0 var(--ui-sys-space-3);
    border: 1px solid var(--ui-sys-outline);
    border-radius: var(--ui-sys-shape-control);
    background: var(--ui-sys-surface-card);
    color: var(--ui-sys-on-surface);
    font: var(--ui-sys-font-caption);
    font-weight: 500;
    cursor: pointer;
    flex-shrink: 0;
    transition: background var(--ui-sys-motion-control);
  }
  .footer .export-btn:hover { background: var(--ui-sys-surface-hover); }
  .footer .export-btn:focus-visible { outline: 2px solid var(--ui-sys-focus-ring); outline-offset: 2px; }
</style>

<div class="toolbar" role="toolbar" aria-label="Stakeholder table controls">
  <div class="search-wrap">
    <svg class="search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" stroke-width="1.5"/>
      <path d="M12.5 12.5L17 17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    <input class="search-input" type="search" placeholder="Search stakeholders, orgs, tags…"
           aria-label="Search stakeholders" autocomplete="off" spellcheck="false"/>
  </div>
  <button class="toolbar-btn" type="button" aria-label="Filter" disabled title="Wired in the full Lists build phase">
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    Filter
  </button>
  <button class="toolbar-btn" type="button" aria-label="Sort" disabled title="Wired in the full Lists build phase">
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 5h12M4 8h8M6 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
    Sort
  </button>
  <button class="toolbar-btn" type="button" aria-label="Categories" disabled title="Wired in the full Lists build phase">
    Categories
  </button>
  <button class="toolbar-btn" type="button" aria-label="Sites" disabled title="Wired in the full Lists build phase">
    Sites
    <span class="badge" aria-label="3 active">3</span>
  </button>
  <div class="spacer"></div>
  <div class="summary-chips" aria-label="Relationship band summary" role="status">
    <span class="summary-chip" id="chip-pos">
      <span class="chip-dot chip-dot--pos" aria-hidden="true"></span>
      <span class="chip-count" id="count-pos">0</span> Positive impact
    </span>
    <span class="summary-chip" id="chip-mid">
      <span class="chip-dot chip-dot--mid" aria-hidden="true"></span>
      <span class="chip-count" id="count-mid">0</span> Winnable middle
    </span>
    <span class="summary-chip" id="chip-neg">
      <span class="chip-dot chip-dot--neg" aria-hidden="true"></span>
      <span class="chip-count" id="count-neg">0</span> Negative impact
    </span>
  </div>
</div>

<div class="scroll-wrap" tabindex="0" role="region" aria-label="Stakeholder table" aria-live="polite">
  <table role="grid" aria-label="Stakeholders">
    <thead id="thead"></thead>
    <tbody id="tbody"></tbody>
  </table>
</div>

<div class="footer" role="contentinfo">
  <span id="footer-count">— of — stakeholders</span>
  <span class="stat-sep" aria-hidden="true">·</span>
  <span id="footer-avgx">Avg x —</span>
  <span class="stat-sep" aria-hidden="true">·</span>
  <span id="footer-avgy">Avg y —</span>
  <div class="spacer"></div>
  <span class="note">x &amp; relationship status are computed live from Scoring</span>
  <button class="export-btn" type="button" aria-label="Export to CSV">
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2v8M5 7l3 3 3-3M3 13h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    Export CSV
  </button>
</div>
`;

class UiStakeholderTable extends HTMLElement {
  // ── private state ──────────────────────────────────────────────
  #data       = [];
  #filtered   = [];
  #sortKey    = null;
  #sortDir    = 'asc';
  #query      = '';

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
  }

  // ── public API ─────────────────────────────────────────────────
  get data() { return this.#data; }
  set data(rows) {
    this.#data = Array.isArray(rows) ? rows.map((r, i) => ({ ...r, _rownum: i + 1 })) : [];
    this.#applyFilter();
    this.#render();
  }

  // ── lifecycle ──────────────────────────────────────────────────
  connectedCallback() {
    if (!this.#data.length) {
      // seed with sample data if no .data was set
      this.data = SAMPLE_DATA;
    }
    this.#buildHeader();
    this.#render();
    this.#bindSearch();
    this.#bindExport();
  }

  // ── build header (once) ────────────────────────────────────────
  #buildHeader() {
    const thead = this.shadowRoot.getElementById('thead');
    if (thead.childElementCount) return; // already built
    const tr = document.createElement('tr');
    COLUMNS.forEach((col, ci) => {
      const th = document.createElement('th');
      th.dataset.key = col.key;
      if (col.frozen) {
        th.classList.add('frozen');
        th.style.left = col.left + 'px';
        if (col.key === 'org') th.classList.add('frozen-last');
      }
      th.style.width   = col.width + 'px';
      th.style.minWidth = col.width + 'px';

      if (!col.noSort && col.key !== '_edit') {
        th.classList.add('sortable');
        th.tabIndex = 0;
        th.setAttribute('aria-sort', 'none');
        th.addEventListener('click',   () => this.#sort(col.key, th));
        th.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.#sort(col.key, th); }
        });
        const indicator = document.createElement('span');
        indicator.className = 'sort-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        th.textContent = col.label;
        th.appendChild(indicator);
      } else {
        th.textContent = col.label;
        if (col.key === '_edit') th.setAttribute('aria-label', 'Edit');
      }

      if (col.numeric) th.style.textAlign = 'right';
      tr.appendChild(th);
    });
    thead.appendChild(tr);
  }

  // ── apply search filter ────────────────────────────────────────
  #applyFilter() {
    const q = this.#query.toLowerCase().trim();
    this.#filtered = q
      ? this.#data.filter(r =>
          (r.name  || '').toLowerCase().includes(q) ||
          (r.org   || '').toLowerCase().includes(q) ||
          (r.category || '').toLowerCase().includes(q) ||
          (r.type  || '').toLowerCase().includes(q) ||
          (r.region || '').toLowerCase().includes(q) ||
          (r.relationship || '').toLowerCase().includes(q)
        )
      : [...this.#data];

    // apply sort if active
    if (this.#sortKey) {
      this.#filtered.sort((a, b) => this.#compareRows(a, b, this.#sortKey));
    }
  }

  // ── sort ───────────────────────────────────────────────────────
  #sort(key, thEl) {
    if (this.#sortKey === key) {
      this.#sortDir = this.#sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.#sortKey = key;
      this.#sortDir = 'asc';
    }
    // update aria-sort on all headers
    const allTh = this.shadowRoot.querySelectorAll('th[data-key]');
    allTh.forEach(th => {
      if (!th.classList.contains('sortable')) return;
      if (th.dataset.key === key) {
        th.setAttribute('aria-sort', this.#sortDir === 'asc' ? 'ascending' : 'descending');
        const ind = th.querySelector('.sort-indicator');
        if (ind) ind.textContent = this.#sortDir === 'asc' ? ' ▲' : ' ▼';
      } else {
        th.setAttribute('aria-sort', 'none');
        const ind = th.querySelector('.sort-indicator');
        if (ind) ind.textContent = '';
      }
    });
    this.#applyFilter();
    this.#renderBody();
    this.#renderFooter();
  }

  #compareRows(a, b, key) {
    let av = a[key] ?? '';
    let bv = b[key] ?? '';
    if (typeof av === 'number' && typeof bv === 'number') {
      return this.#sortDir === 'asc' ? av - bv : bv - av;
    }
    av = String(av).toLowerCase();
    bv = String(bv).toLowerCase();
    const cmp = av < bv ? -1 : av > bv ? 1 : 0;
    return this.#sortDir === 'asc' ? cmp : -cmp;
  }

  // ── full render ────────────────────────────────────────────────
  #render() {
    this.#renderBody();
    this.#renderSummary();
    this.#renderFooter();
  }

  // ── render tbody ───────────────────────────────────────────────
  #renderBody() {
    const tbody = this.shadowRoot.getElementById('tbody');
    tbody.innerHTML = '';

    this.#filtered.forEach((row, ri) => {
      const tr = document.createElement('tr');

      // first data row gets a zone tint wash
      if (ri === 0) {
        const zoneTokens = ZONE_TOKEN_MAP[row.relationship];
        if (zoneTokens) {
          const bgVar = zoneTokens.bg;
          tr.classList.add('zone-tint');
          tr.style.setProperty('--_zone-wash',
            `color-mix(in srgb, var(${bgVar}) 18%, var(--ui-sys-surface-card))`
          );
        }
      }

      COLUMNS.forEach(col => {
        const td = document.createElement('td');

        if (col.frozen) {
          td.classList.add('frozen');
          td.style.left = col.left + 'px';
          if (col.key === 'org') td.classList.add('frozen-last');
        }
        td.style.width    = col.width + 'px';
        td.style.minWidth = col.width + 'px';
        td.style.maxWidth = col.width + 'px';

        switch (col.key) {
          case '_rownum': {
            td.classList.add('col-rownum');
            td.textContent = row._rownum ?? (ri + 1);
            break;
          }
          case '_edit': {
            td.classList.add('col-edit');
            const btn = document.createElement('button');
            btn.className = 'icon-btn';
            btn.type = 'button';
            btn.setAttribute('aria-label', `Edit ${row.name}`);
            btn.innerHTML = `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M11.5 2.5a1.414 1.414 0 012 2L5 13H3v-2L11.5 2.5z"
                    stroke="currentColor" stroke-width="1.4"
                    stroke-linejoin="round"/>
            </svg>`;
            btn.addEventListener('click', () => {
              this.dispatchEvent(new CustomEvent('edit', { detail: { row }, bubbles: true, composed: true }));
            });
            td.appendChild(btn);
            break;
          }
          case 'name': {
            td.textContent  = row.name || '';
            td.title        = row.name || '';
            break;
          }
          case 'org': {
            td.textContent = row.org || '';
            td.title       = row.org || '';
            break;
          }
          case 'priority': {
            const pill = document.createElement('span');
            pill.className = 'pill';
            const p = (row.priority || '').toLowerCase();
            if (p === 'high')        pill.classList.add('pill--high');
            else if (p === 'medium') pill.classList.add('pill--medium');
            else                     pill.classList.add('pill--low');
            pill.textContent = row.priority || '';
            td.appendChild(pill);
            break;
          }
          case 'x':
          case 'y': {
            const val = typeof row[col.key] === 'number' ? row[col.key] : parseFloat(row[col.key]);
            td.classList.add('cell-num');
            if (val > 1)        td.classList.add('val-pos');
            else if (val < -1)  td.classList.add('val-neg');
            td.textContent = isNaN(val) ? '—' : val.toFixed(1);
            break;
          }
          case 'relationship': {
            const zoneTokens = ZONE_TOKEN_MAP[row.relationship];
            if (zoneTokens) {
              const pill = document.createElement('span');
              pill.className = 'zone-pill';
              pill.style.background = `var(${zoneTokens.bg})`;
              pill.style.color      = `var(${zoneTokens.ink})`;
              pill.textContent = row.relationship;
              td.appendChild(pill);
            } else {
              td.textContent = row.relationship || '—';
            }
            break;
          }
          case 'status': {
            const s = (row.status || '').toLowerCase();
            td.textContent = row.status || '';
            if (s === 'active')       td.classList.add('status-active');
            else if (s === 'watch')   td.classList.add('status-watch');
            else if (s === 'dormant') td.classList.add('status-dormant');
            break;
          }
          default: {
            td.textContent = row[col.key] != null ? row[col.key] : '';
            break;
          }
        }

        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });
  }

  // ── render summary chips ───────────────────────────────────────
  #renderSummary() {
    let pos = 0, mid = 0, neg = 0;
    this.#data.forEach(r => {
      const rel = r.relationship || '';
      if (POSITIVE_STATUSES.has(rel))      pos++;
      else if (MIDDLE_STATUSES.has(rel))   mid++;
      else if (NEGATIVE_STATUSES.has(rel)) neg++;
    });
    const sr = this.shadowRoot;
    sr.getElementById('count-pos').textContent = pos;
    sr.getElementById('count-mid').textContent = mid;
    sr.getElementById('count-neg').textContent = neg;
    // update aria labels
    sr.getElementById('chip-pos').setAttribute('aria-label', `${pos} Positive impact stakeholders`);
    sr.getElementById('chip-mid').setAttribute('aria-label', `${mid} Winnable middle stakeholders`);
    sr.getElementById('chip-neg').setAttribute('aria-label', `${neg} Negative impact stakeholders`);
  }

  // ── render footer ──────────────────────────────────────────────
  #renderFooter() {
    const total    = this.#data.length;
    const filtered = this.#filtered.length;
    const avgX = filtered
      ? (this.#filtered.reduce((s, r) => s + (parseFloat(r.x) || 0), 0) / filtered)
      : 0;
    const avgY = filtered
      ? (this.#filtered.reduce((s, r) => s + (parseFloat(r.y) || 0), 0) / filtered)
      : 0;

    const sr = this.shadowRoot;
    sr.getElementById('footer-count').textContent =
      filtered === total ? `${total} stakeholders` : `${filtered} of ${total} stakeholders`;
    sr.getElementById('footer-avgx').textContent = `Avg x ${avgX.toFixed(1)}`;
    sr.getElementById('footer-avgy').textContent = `Avg y ${avgY.toFixed(1)}`;
  }

  // ── bind search ────────────────────────────────────────────────
  #bindSearch() {
    const input = this.shadowRoot.querySelector('.search-input');
    input.addEventListener('input', () => {
      this.#query = input.value;
      this.#applyFilter();
      this.#renderBody();
      this.#renderFooter();
    });
    input.addEventListener('search', () => {
      this.#query = input.value;
      this.#applyFilter();
      this.#renderBody();
      this.#renderFooter();
    });
  }

  // ── bind export ────────────────────────────────────────────────
  #bindExport() {
    const btn = this.shadowRoot.querySelector('.export-btn');
    btn.addEventListener('click', () => {
      const headers = COLUMNS
        .filter(c => c.key !== '_rownum' && c.key !== '_edit')
        .map(c => c.label || c.key);
      const rows = this.#filtered.map(r =>
        COLUMNS
          .filter(c => c.key !== '_rownum' && c.key !== '_edit')
          .map(c => {
            const v = r[c.key] ?? '';
            const s = String(v);
            return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
          }).join(',')
      );
      const csv = [headers.join(','), ...rows].join('\n');
      console.log('[ui-stakeholder-table] Export CSV:\n', csv);
      this.dispatchEvent(new CustomEvent('export-csv', { detail: { csv }, bubbles: true, composed: true }));
    });
  }
}

if (!customElements.get('ui-stakeholder-table')) {
  customElements.define('ui-stakeholder-table', UiStakeholderTable);
}
