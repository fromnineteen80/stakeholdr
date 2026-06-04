/* ============================================================================
 * <ui-data-table> — tokened data grid (MD3 ships none).
 *
 * Properties (set via JS, not attr, for array/object data):
 *   .data     array of row objects — each key matches a column key
 *   .columns  array of {key, label, type, sortable, align}
 *
 * Attributes:
 *   density   "comfortable" (default) | "compact"
 *   selectable — enables checkbox column; emits selection-change
 *
 * Events (composed:true):
 *   sort-change      {detail:{key, direction}}  — "asc"|"desc"|null
 *   selection-change {detail:{selected}}        — array of selected row objects
 *
 * If no .data/.columns are set on connect, seeds sample data so gallery renders.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      --_row-bg-alt: var(--ui-sys-surface-container-low);
      --_row-h: 40px;
    }
    :host([density="compact"]) {
      --_row-h: 28px;
    }

    .scroll-wrapper {
      width: 100%;
      overflow-x: auto;
      border: 1px solid var(--ui-sys-outline);
      border-radius: var(--ui-sys-shape-control);
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
    }

    thead tr {
      background: var(--ui-sys-surface-container);
      position: sticky;
      top: 0;
      z-index: 1;
    }

    th {
      font: var(--ui-sys-font-label);
      color: var(--ui-sys-on-surface);
      padding: 0 var(--ui-sys-space-4);
      height: var(--_row-h);
      text-align: left;
      white-space: nowrap;
      border-bottom: 1px solid var(--ui-sys-outline);
      user-select: none;
    }
    th[data-align="right"] { text-align: right; }
    th[data-align="center"] { text-align: center; }

    th.sortable {
      cursor: pointer;
      position: relative;
    }
    th.sortable:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: -2px;
    }
    /* state layer on sortable headers */
    th.sortable::before {
      content: "";
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      pointer-events: none;
    }
    th.sortable:hover::before   { opacity: var(--ui-sys-state-hover-opacity); }
    th.sortable:active::before  { opacity: var(--ui-sys-state-pressed-opacity); }

    .th-inner {
      display: inline-flex;
      align-items: center;
      gap: var(--ui-sys-space-1);
    }
    .sort-icon {
      font-size: 14px;
      line-height: 1;
      color: var(--ui-sys-on-surface-muted);
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      width: 14px;
      text-align: center;
    }
    th.sortable:hover  .sort-icon,
    th[aria-sort="ascending"]  .sort-icon,
    th[aria-sort="descending"] .sort-icon { opacity: 1; }

    tbody tr {
      position: relative;
      isolation: isolate;
    }
    tbody tr:nth-child(even) { background: var(--_row-bg-alt); }
    tbody tr::before {
      content: "";
      position: absolute;
      inset: 0;
      background: var(--ui-sys-on-surface);
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      pointer-events: none;
      z-index: -1;
    }
    tbody tr:hover::before { opacity: var(--ui-sys-state-hover-opacity); }

    td {
      padding: 0 var(--ui-sys-space-4);
      height: var(--_row-h);
      border-bottom: 1px solid var(--ui-sys-divider);
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      white-space: nowrap;
    }
    td[data-align="right"]  { text-align: right; }
    td[data-align="center"] { text-align: center; }

    tbody tr:last-child td { border-bottom: none; }

    /* checkbox col */
    th.col-check,
    td.col-check {
      width: 40px;
      min-width: 40px;
      padding: 0 var(--ui-sys-space-2);
      text-align: center;
    }

    input[type="checkbox"] {
      accent-color: var(--ui-sys-primary);
      cursor: pointer;
      width: 15px;
      height: 15px;
    }

    .empty {
      padding: var(--ui-sys-space-6) var(--ui-sys-space-4);
      text-align: center;
      color: var(--ui-sys-on-surface-muted);
      font: var(--ui-sys-font-body);
    }
  </style>
  <div class="scroll-wrapper" part="wrapper">
    <table role="table">
      <thead role="rowgroup"><tr role="row"></tr></thead>
      <tbody role="rowgroup"></tbody>
    </table>
  </div>
`;

const SAMPLE_COLUMNS = [
  { key: 'name',   label: 'Name',    type: 'string', sortable: true,  align: 'left'  },
  { key: 'role',   label: 'Role',    type: 'string', sortable: true,  align: 'left'  },
  { key: 'score',  label: 'Score',   type: 'number', sortable: true,  align: 'right' },
  { key: 'status', label: 'Status',  type: 'string', sortable: false, align: 'center'},
];
const SAMPLE_DATA = [
  { name: 'Alex Rivera',  role: 'Champion',   score: 92, status: 'Active'   },
  { name: 'Morgan Lee',   role: 'Supporter',  score: 78, status: 'Active'   },
  { name: 'Jordan Kim',   role: 'Neutral',    score: 55, status: 'Inactive' },
  { name: 'Casey Patel',  role: 'Resistor',   score: 31, status: 'Active'   },
  { name: 'Taylor Okonjo',role: 'Blocker',    score: 18, status: 'Inactive' },
];

class UiDataTable extends HTMLElement {
  static observedAttributes = ['density', 'selectable'];

  #data     = null;
  #columns  = null;
  #sortKey  = null;
  #sortDir  = null; // 'asc' | 'desc' | null
  #selected = new Set();

  #thead;
  #tbody;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#thead = this.shadowRoot.querySelector('thead tr');
    this.#tbody = this.shadowRoot.querySelector('tbody');
  }

  connectedCallback() {
    // Seed sample data if no data was programmatically set yet.
    if (this.#data === null) {
      this.#data    = SAMPLE_DATA;
      this.#columns = SAMPLE_COLUMNS;
    }
    this.#render();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.#render();
  }

  /* --- public properties ------------------------------------------------- */

  get data() { return this.#data; }
  set data(val) {
    this.#data = Array.isArray(val) ? val : [];
    this.#selected.clear();
    if (this.isConnected) this.#render();
  }

  get columns() { return this.#columns; }
  set columns(val) {
    this.#columns = Array.isArray(val) ? val : [];
    this.#sortKey = null;
    this.#sortDir = null;
    if (this.isConnected) this.#render();
  }

  /* --- render ------------------------------------------------------------ */

  #render() {
    if (!this.#columns || !this.#data) return;
    this.#renderHead();
    this.#renderBody();
  }

  #renderHead() {
    const selectable = this.hasAttribute('selectable');
    const cols = this.#columns;
    const rows = this.#getSortedData();

    this.#thead.innerHTML = '';

    if (selectable) {
      const th = document.createElement('th');
      th.className = 'col-check';
      th.setAttribute('role', 'columnheader');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.title = 'Select all';
      cb.setAttribute('aria-label', 'Select all rows');
      cb.checked = rows.length > 0 && rows.every(r => this.#selected.has(r));
      cb.indeterminate = !cb.checked && rows.some(r => this.#selected.has(r));
      cb.addEventListener('change', () => {
        if (cb.checked) rows.forEach(r => this.#selected.add(r));
        else this.#selected.clear();
        this.#renderBody();
        this.#emitSelection();
      });
      th.appendChild(cb);
      this.#thead.appendChild(th);
    }

    for (const col of cols) {
      const th = document.createElement('th');
      th.setAttribute('role', 'columnheader');
      th.dataset.align = col.align || 'left';

      if (col.sortable) {
        th.className = 'sortable';
        th.tabIndex = 0;
        const dir = this.#sortKey === col.key ? this.#sortDir : null;
        th.setAttribute('aria-sort', dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : 'none');

        const inner = document.createElement('span');
        inner.className = 'th-inner';
        inner.textContent = col.label;

        const icon = document.createElement('span');
        icon.className = 'sort-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = dir === 'asc' ? '▲' : dir === 'desc' ? '▼' : '▲';
        inner.appendChild(icon);

        th.appendChild(inner);

        const handler = (e) => {
          if (e.type === 'keydown' && e.key !== 'Enter') return;
          this.#toggleSort(col.key);
        };
        th.addEventListener('click', handler);
        th.addEventListener('keydown', handler);
      } else {
        th.textContent = col.label;
      }

      this.#thead.appendChild(th);
    }
  }

  #renderBody() {
    const selectable = this.hasAttribute('selectable');
    const rows = this.#getSortedData();
    const cols = this.#columns;

    this.#tbody.innerHTML = '';

    if (rows.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = cols.length + (selectable ? 1 : 0);
      td.className = 'empty';
      td.textContent = 'No data';
      tr.appendChild(td);
      this.#tbody.appendChild(tr);
      return;
    }

    for (const row of rows) {
      const tr = document.createElement('tr');
      tr.setAttribute('role', 'row');

      if (selectable) {
        const td = document.createElement('td');
        td.className = 'col-check';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = this.#selected.has(row);
        cb.setAttribute('aria-label', 'Select row');
        cb.addEventListener('change', () => {
          cb.checked ? this.#selected.add(row) : this.#selected.delete(row);
          this.#renderHead(); // update select-all state
          this.#emitSelection();
        });
        td.appendChild(cb);
        tr.appendChild(td);
      }

      for (const col of cols) {
        const td = document.createElement('td');
        td.setAttribute('role', 'cell');
        td.dataset.align = col.align || 'left';
        const val = row[col.key];
        td.textContent = val === null || val === undefined ? '' : String(val);
        tr.appendChild(td);
      }

      this.#tbody.appendChild(tr);
    }
  }

  #toggleSort(key) {
    if (this.#sortKey !== key) {
      this.#sortKey = key;
      this.#sortDir = 'asc';
    } else if (this.#sortDir === 'asc') {
      this.#sortDir = 'desc';
    } else {
      this.#sortKey = null;
      this.#sortDir = null;
    }
    this.#render();
    this.dispatchEvent(new CustomEvent('sort-change', {
      bubbles: true, composed: true,
      detail: { key: this.#sortKey, direction: this.#sortDir },
    }));
  }

  #getSortedData() {
    const data = this.#data || [];
    if (!this.#sortKey || !this.#sortDir) return [...data];
    const key = this.#sortKey;
    const dir = this.#sortDir === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => {
      const av = a[key], bv = b[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return av < bv ? -1 * dir : av > bv ? 1 * dir : 0;
    });
  }

  #emitSelection() {
    this.dispatchEvent(new CustomEvent('selection-change', {
      bubbles: true, composed: true,
      detail: { selected: [...this.#selected] },
    }));
  }
}

if (!customElements.get('ui-data-table')) {
  customElements.define('ui-data-table', UiDataTable);
}
