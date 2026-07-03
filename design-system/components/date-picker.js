/* ============================================================================
 * <ui-date-picker> — calendar date picker.
 * category: gapFill
 *
 * Attributes:
 *   value  — ISO date string (YYYY-MM-DD). Reflects selected date.
 *   label  — label text shown on the trigger field (default: "Date")
 *
 * Behaviour:
 *   - Outlined trigger field shows formatted value; clicking opens popup
 *   - Month calendar popup: --ui-sys-surface-container-high bg, elevation-2
 *   - Weekday header (Su Mo Tu …), day grid
 *   - Selected day: --ui-sys-primary filled circle, --ui-sys-on-primary text
 *   - Today: outlined circle
 *   - Prev / next month icon buttons
 *   - Keyboard: arrow navigation, Enter selects, Esc closes
 *   - Click outside closes
 *
 * ARIA: popup role=dialog + grid + gridcell; aria-selected on selected cell
 * Events: change {detail: {value: "YYYY-MM-DD"}} (bubbles, composed)
 * ==========================================================================*/

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      position: relative;
    }

    /* ---- trigger field ---- */
    [part="trigger"] {
      display: flex;
      align-items: center;
      gap: var(--ui-sys-space-2);
      height: var(--ui-sys-control-height);
      padding: 0 var(--ui-sys-space-3);
      border: 1px solid var(--ui-sys-outline);
      border-radius: var(--ui-sys-shape-control);
      background: var(--ui-sys-surface-field);
      color: var(--ui-sys-on-surface);
      font: var(--ui-sys-font-body);
      cursor: pointer;
      user-select: none;
      outline: none;
      transition: border-color var(--ui-sys-motion-control),
                  background var(--ui-sys-motion-control);
      min-width: 160px;
      position: relative;
    }
    [part="trigger"]:hover {
      background: var(--ui-sys-surface-hover);
    }
    [part="trigger"]:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }
    :host([open]) [part="trigger"] {
      border-color: var(--ui-sys-primary);
    }

    [part="trigger-label"] {
      font: var(--ui-sys-font-caption);
      color: var(--ui-sys-on-surface-muted);
      position: absolute;
      top: -9px;
      left: var(--ui-sys-space-2);
      background: var(--ui-sys-surface-field);
      padding: 0 var(--ui-sys-space-1);
      pointer-events: none;
    }

    [part="trigger-value"] {
      flex: 1;
    }

    [part="trigger-icon"] {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      color: var(--ui-sys-on-surface-muted);
      /* simple calendar SVG via background — token-safe since it uses currentColor */
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* ---- popup ---- */
    [part="popup"] {
      display: none;
      position: absolute;
      top: calc(100% + var(--ui-sys-space-1));
      left: 0;
      z-index: 300;
      background: var(--ui-sys-surface-container-high);
      border: 1px solid var(--ui-sys-outline-subtle);
      border-radius: var(--ui-sys-shape-card);
      box-shadow: var(--ui-sys-elevation-2);
      padding: var(--ui-sys-space-3);
      min-width: 272px;
      outline: none;
    }
    :host([open]) [part="popup"] {
      display: block;
    }
    [part="popup"]:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: -2px;
    }

    /* ---- month navigation header ---- */
    [part="month-header"] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: var(--ui-sys-space-3);
    }

    [part="month-title"] {
      font: var(--ui-sys-font-label);
      color: var(--ui-sys-on-surface);
    }

    .nav-btn {
      appearance: none;
      border: none;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: var(--ui-sys-shape-pill);
      color: var(--ui-sys-on-surface);
      position: relative;
      isolation: isolate;
      overflow: hidden;
      padding: 0;
    }
    .nav-btn::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      z-index: -1;
    }
    .nav-btn:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
    .nav-btn:active::before { opacity: var(--ui-sys-state-pressed-opacity); }
    .nav-btn:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    /* ---- weekday header row ---- */
    [part="weekdays"] {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      margin-bottom: var(--ui-sys-space-1);
    }

    .weekday {
      text-align: center;
      font: var(--ui-sys-font-caption);
      color: var(--ui-sys-on-surface-muted);
      padding: var(--ui-sys-space-1) 0;
    }

    /* ---- day grid ---- */
    [part="grid"] {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 2px;
    }

    /* ---- day cell ---- */
    .day {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--ui-sys-shape-pill);
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      cursor: pointer;
      user-select: none;
      outline: none;
      isolation: isolate;
      overflow: hidden;
      border: none;
      background: transparent;
      /* state layer */
    }
    .day::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      z-index: -1;
    }
    .day:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
    .day:active::before { opacity: var(--ui-sys-state-pressed-opacity); }
    .day:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    .day[data-other-month] {
      color: var(--ui-sys-on-surface-muted);
    }
    .day[data-today] {
      box-shadow: inset 0 0 0 1px var(--ui-sys-on-surface);
    }
    .day[aria-selected="true"] {
      background: var(--ui-sys-primary);
      color: var(--ui-sys-on-primary);
    }
    .day[aria-selected="true"]::before {
      display: none; /* state layer off — filled bg handles it */
    }
    .day[data-focused] {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }
  </style>

  <div part="trigger" role="combobox" aria-haspopup="dialog" aria-expanded="false"
       tabindex="0" aria-label="Date picker">
    <span part="trigger-label"></span>
    <span part="trigger-value"></span>
    <span part="trigger-icon" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none"
           stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
        <rect x="2" y="3" width="14" height="13" rx="2"/>
        <line x1="2" y1="7" x2="16" y2="7"/>
        <line x1="6" y1="1.5" x2="6" y2="4.5"/>
        <line x1="12" y1="1.5" x2="12" y2="4.5"/>
      </svg>
    </span>
  </div>

  <div part="popup" role="dialog" aria-modal="true" aria-label="Date picker calendar"
       tabindex="-1">
    <div part="month-header">
      <button class="nav-btn" part="prev-btn" aria-label="Previous month" type="button">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="10 12 6 8 10 4"/>
        </svg>
      </button>
      <span part="month-title"></span>
      <button class="nav-btn" part="next-btn" aria-label="Next month" type="button">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
             stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 4 10 8 6 12"/>
        </svg>
      </button>
    </div>
    <div part="weekdays" aria-hidden="true"></div>
    <div part="grid" role="grid" aria-label="Calendar days"></div>
  </div>
`;

class UiDatePicker extends HTMLElement {
  static observedAttributes = ['value', 'label', 'open'];

  #trigger;
  #popup;
  #grid;
  #weekdays;
  #monthTitle;
  #prevBtn;
  #nextBtn;
  #triggerLabel;
  #triggerValue;

  /* state */
  #viewYear  = 0;
  #viewMonth = 0; /* 0-indexed */
  #selectedDate = null; /* Date | null */
  #focusedCell = null;  /* {year, month, day} | null */

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));

    this.#trigger      = this.shadowRoot.querySelector('[part="trigger"]');
    this.#popup        = this.shadowRoot.querySelector('[part="popup"]');
    this.#grid         = this.shadowRoot.querySelector('[part="grid"]');
    this.#weekdays     = this.shadowRoot.querySelector('[part="weekdays"]');
    this.#monthTitle   = this.shadowRoot.querySelector('[part="month-title"]');
    this.#prevBtn      = this.shadowRoot.querySelector('[part="prev-btn"]');
    this.#nextBtn      = this.shadowRoot.querySelector('[part="next-btn"]');
    this.#triggerLabel = this.shadowRoot.querySelector('[part="trigger-label"]');
    this.#triggerValue = this.shadowRoot.querySelector('[part="trigger-value"]');
  }

  connectedCallback() {
    /* init view to today */
    const today = new Date();
    this.#viewYear  = today.getFullYear();
    this.#viewMonth = today.getMonth();

    /* parse value attr if present */
    this.#applyValueAttr();

    /* label */
    this.#triggerLabel.textContent = this.getAttribute('label') || 'Date';

    /* build weekday headers */
    this.#weekdays.innerHTML = DAYS_OF_WEEK
      .map(d => `<span class="weekday">${d}</span>`).join('');

    /* event listeners */
    this.#trigger.addEventListener('click',   this.#onTriggerClick);
    this.#trigger.addEventListener('keydown', this.#onTriggerKeydown);
    this.#prevBtn.addEventListener('click',   this.#onPrev);
    this.#nextBtn.addEventListener('click',   this.#onNext);
    this.#grid.addEventListener('click',      this.#onGridClick);
    this.#grid.addEventListener('keydown',    this.#onGridKeydown);
    document.addEventListener('mousedown',   this.#onDocMousedown);
    document.addEventListener('keydown',     this.#onDocKeydown);

    this.#renderGrid();
  }

  disconnectedCallback() {
    this.#trigger.removeEventListener('click',   this.#onTriggerClick);
    this.#trigger.removeEventListener('keydown', this.#onTriggerKeydown);
    this.#prevBtn.removeEventListener('click',   this.#onPrev);
    this.#nextBtn.removeEventListener('click',   this.#onNext);
    this.#grid.removeEventListener('click',      this.#onGridClick);
    this.#grid.removeEventListener('keydown',    this.#onGridKeydown);
    document.removeEventListener('mousedown',   this.#onDocMousedown);
    document.removeEventListener('keydown',     this.#onDocKeydown);
  }

  attributeChangedCallback(name) {
    if (name === 'value') {
      this.#applyValueAttr();
      this.#renderGrid();
    }
    if (name === 'label') {
      this.#triggerLabel.textContent = this.getAttribute('label') || 'Date';
    }
    if (name === 'open') {
      const isOpen = this.hasAttribute('open');
      this.#trigger.setAttribute('aria-expanded', String(isOpen));
      if (isOpen) {
        this.#renderGrid();
        requestAnimationFrame(() => this.#popup.focus());
      }
    }
  }

  /* ---- private helpers ---- */

  #applyValueAttr() {
    const raw = this.getAttribute('value');
    if (raw) {
      const d = new Date(raw + 'T00:00:00');
      if (!isNaN(d)) {
        this.#selectedDate = d;
        this.#viewYear  = d.getFullYear();
        this.#viewMonth = d.getMonth();
        this.#triggerValue.textContent = this.#formatDisplay(d);
        return;
      }
    }
    this.#selectedDate = null;
    this.#triggerValue.textContent = '';
  }

  #formatDisplay(d) {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  #isoDate(y, m, day) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  #renderGrid() {
    const today = new Date();
    const todayKey = this.#isoDate(today.getFullYear(), today.getMonth(), today.getDate());
    const selKey   = this.#selectedDate
      ? this.#isoDate(this.#selectedDate.getFullYear(), this.#selectedDate.getMonth(), this.#selectedDate.getDate())
      : null;
    const focKey   = this.#focusedCell
      ? this.#isoDate(this.#focusedCell.year, this.#focusedCell.month, this.#focusedCell.day)
      : null;

    /* month title */
    const titleDate = new Date(this.#viewYear, this.#viewMonth, 1);
    this.#monthTitle.textContent = titleDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    /* first day of month (0=Sun), days in month */
    const firstDow  = new Date(this.#viewYear, this.#viewMonth, 1).getDay();
    const daysInMon = new Date(this.#viewYear, this.#viewMonth + 1, 0).getDate();
    const daysInPrev = new Date(this.#viewYear, this.#viewMonth, 0).getDate();

    const cells = [];
    /* leading days from previous month */
    for (let i = 0; i < firstDow; i++) {
      const day = daysInPrev - firstDow + 1 + i;
      const m   = this.#viewMonth - 1;
      const y   = m < 0 ? this.#viewYear - 1 : this.#viewYear;
      const nm  = m < 0 ? 11 : m;
      cells.push({ year: y, month: nm, day, other: true });
    }
    /* current month */
    for (let d = 1; d <= daysInMon; d++) {
      cells.push({ year: this.#viewYear, month: this.#viewMonth, day: d, other: false });
    }
    /* trailing days */
    const trailing = 42 - cells.length;
    for (let d = 1; d <= trailing; d++) {
      const m  = this.#viewMonth + 1;
      const y  = m > 11 ? this.#viewYear + 1 : this.#viewYear;
      const nm = m > 11 ? 0 : m;
      cells.push({ year: y, month: nm, day: d, other: true });
    }

    /* build grid HTML */
    const rows = [];
    for (let row = 0; row < 6; row++) {
      const rowCells = cells.slice(row * 7, row * 7 + 7).map(c => {
        const key      = this.#isoDate(c.year, c.month, c.day);
        const isToday  = key === todayKey;
        const isSel    = key === selKey;
        const isFoc    = key === focKey;
        const attrs    = [
          `class="day"`,
          `data-iso="${key}"`,
          `role="gridcell"`,
          `tabindex="${isFoc || (!focKey && isSel) || (!focKey && !isSel && isToday) ? '0' : '-1'}"`,
          `aria-label="${c.day} ${new Date(c.year, c.month, 1).toLocaleString(undefined, {month:'long'})} ${c.year}"`,
          `aria-selected="${isSel}"`,
          c.other   ? 'data-other-month' : '',
          isToday   ? 'data-today' : '',
          isFoc     ? 'data-focused' : '',
        ].filter(Boolean).join(' ');
        return `<button ${attrs} type="button">${c.day}</button>`;
      }).join('');
      rows.push(`<div role="row">${rowCells}</div>`);
    }
    this.#grid.innerHTML = rows.join('');
  }

  #selectDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    this.#selectedDate  = d;
    this.#triggerValue.textContent = this.#formatDisplay(d);
    /* reflect attr without triggering re-render loop (attr change will re-render, fine) */
    this.setAttribute('value', iso);
    this.#closePopup();
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true, composed: true, detail: { value: iso }
    }));
  }

  #openPopup() {
    this.setAttribute('open', '');
  }

  #closePopup() {
    this.removeAttribute('open');
    this.#trigger.focus();
  }

  /* ---- event handlers ---- */

  #onTriggerClick = () => {
    this.hasAttribute('open') ? this.#closePopup() : this.#openPopup();
  };

  #onTriggerKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      this.#openPopup();
    }
  };

  #onPrev = () => {
    this.#viewMonth--;
    if (this.#viewMonth < 0) { this.#viewMonth = 11; this.#viewYear--; }
    this.#focusedCell = null;
    this.#renderGrid();
  };

  #onNext = () => {
    this.#viewMonth++;
    if (this.#viewMonth > 11) { this.#viewMonth = 0; this.#viewYear++; }
    this.#focusedCell = null;
    this.#renderGrid();
  };

  #onGridClick = (e) => {
    const btn = e.target.closest('.day');
    if (!btn) return;
    this.#selectDate(btn.dataset.iso);
  };

  #onGridKeydown = (e) => {
    const btn = e.target.closest('.day');
    if (!btn) return;

    const iso  = btn.dataset.iso;
    const cur  = new Date(iso + 'T00:00:00');
    let   next = null;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.#selectDate(iso);
        return;
      case 'ArrowRight': next = new Date(cur); next.setDate(cur.getDate() + 1); break;
      case 'ArrowLeft':  next = new Date(cur); next.setDate(cur.getDate() - 1); break;
      case 'ArrowDown':  next = new Date(cur); next.setDate(cur.getDate() + 7); break;
      case 'ArrowUp':    next = new Date(cur); next.setDate(cur.getDate() - 7); break;
      case 'Home':       next = new Date(cur); next.setDate(1);                 break;
      case 'End':        next = new Date(cur.getFullYear(), cur.getMonth() + 1, 0); break;
      default: return;
    }

    if (next) {
      e.preventDefault();
      this.#focusedCell = { year: next.getFullYear(), month: next.getMonth(), day: next.getDate() };
      /* navigate month if needed */
      this.#viewYear  = next.getFullYear();
      this.#viewMonth = next.getMonth();
      this.#renderGrid();
      /* focus the cell */
      const nextIso  = this.#isoDate(next.getFullYear(), next.getMonth(), next.getDate());
      const nextCell = this.#grid.querySelector(`[data-iso="${nextIso}"]`);
      nextCell?.focus();
    }
  };

  #onDocMousedown = (e) => {
    if (!this.hasAttribute('open')) return;
    // composedPath, not e.target: a document-level listener sees a RETARGETED
    // target when the picker is composed inside another shadow root (e.g. the
    // stakeholder-table cell editors), which would read as "outside".
    if (!e.composedPath().includes(this)) {
      this.#closePopup();
    }
  };

  #onDocKeydown = (e) => {
    if (e.key === 'Escape' && this.hasAttribute('open')) {
      e.preventDefault();
      this.#closePopup();
    }
  };
}

if (!customElements.get('ui-date-picker')) {
  customElements.define('ui-date-picker', UiDatePicker);
}
