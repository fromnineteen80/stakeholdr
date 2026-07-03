/* ============================================================================
 * <ui-select> + <ui-option> — outlined dropdown for short fixed sets.
 *
 * Usage:
 *   <ui-select label="Status" value="active">
 *     <ui-option value="active">Active</ui-option>
 *     <ui-option value="pending">Pending</ui-option>
 *   </ui-select>
 *
 * Attrs on <ui-select>: label, value, disabled
 * Emits: change (composed:true, detail:{value})
 * ==========================================================================*/

/* ---- <ui-option> --------------------------------------------------------- */

const optionTemplate = document.createElement('template');
optionTemplate.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
      isolation: isolate;
      padding: var(--ui-sys-space-2) var(--ui-sys-space-4);
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      cursor: pointer;
      user-select: none;
      outline: none;
      transition: background var(--ui-sys-motion-control);
    }
    :host::before {
      content: "";
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      z-index: -1;
    }
    :host(:hover)::before  { opacity: var(--ui-sys-state-hover-opacity); }
    :host(:focus)::before  { opacity: var(--ui-sys-state-hover-opacity); }
    :host([aria-selected="true"]) {
      background: var(--ui-sys-primary-container);
      color: var(--ui-sys-on-primary-container);
    }
    :host([disabled]) {
      pointer-events: none;
      color: var(--ui-sys-on-surface-faint);
      cursor: default;
    }
    :host([disabled])::before { display: none; }
  </style>
  <slot></slot>
`;

class UiOption extends HTMLElement {
  static observedAttributes = ['disabled'];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(optionTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    this.setAttribute('role', 'option');
    this.setAttribute('tabindex', '-1');
    if (!this.hasAttribute('aria-selected')) this.setAttribute('aria-selected', 'false');
  }

  get value() { return this.hasAttribute('value') ? this.getAttribute('value') : this.textContent.trim(); }
  get disabled() { return this.hasAttribute('disabled'); }
}

if (!customElements.get('ui-option')) customElements.define('ui-option', UiOption);

/* ---- <ui-select> --------------------------------------------------------- */

const selectTemplate = document.createElement('template');
selectTemplate.innerHTML = `
  <style>
    :host {
      display: inline-block;
      position: relative;
      min-width: 140px;
    }

    .field {
      position: relative;
      isolation: isolate;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ui-sys-space-2);
      height: var(--ui-sys-control-height);
      padding: 0 var(--ui-sys-space-3);
      border: 1px solid var(--ui-sys-outline);
      border-radius: var(--ui-sys-shape-control);
      background: transparent;
      color: var(--ui-sys-on-surface);
      font: var(--ui-sys-font-label);
      cursor: pointer;
      user-select: none;
      outline: none;
      transition: border-color var(--ui-sys-motion-control);
      box-sizing: border-box;
      width: 100%;
    }
    .field::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      z-index: -1;
    }
    .field:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
    .field:active::before { opacity: var(--ui-sys-state-pressed-opacity); }
    .field:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
      border-color: var(--ui-sys-focus-ring);
    }
    :host([open]) .field { border-color: var(--ui-sys-on-surface-muted); }

    /* floating label */
    .label {
      position: absolute;
      top: -9px;
      left: var(--ui-sys-space-2);
      padding: 0 var(--ui-sys-space-1);
      background: var(--ui-sys-surface, #FEFDFC);
      color: var(--ui-sys-on-surface-muted);
      font: var(--ui-sys-font-caption);
      pointer-events: none;
      white-space: nowrap;
    }

    .value-text {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
    .value-text.placeholder { color: var(--ui-sys-on-surface-muted); }

    .arrow {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ui-sys-on-surface-muted);
      transition: transform var(--ui-sys-motion-control);
    }
    :host([open]) .arrow { transform: rotate(180deg); }

    /* popup */
    .popup {
      display: none;
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      min-width: 100%;
      background: var(--ui-sys-surface-container-high);
      border-radius: var(--ui-sys-shape-control);
      box-shadow: var(--ui-sys-elevation-2);
      padding: var(--ui-sys-space-1) 0;
      z-index: 9999;
      overflow-y: auto;
      max-height: 280px;
      outline: none;
    }
    :host([open]) .popup { display: block; }

    :host([disabled]) { pointer-events: none; }
    :host([disabled]) .field {
      border-color: var(--ui-sys-on-surface-faint);
      color: var(--ui-sys-on-surface-faint);
      cursor: default;
    }
    :host([disabled]) .label { color: var(--ui-sys-on-surface-faint); }
  </style>

  <div class="field" part="field" tabindex="0"
       role="combobox" aria-haspopup="listbox" aria-expanded="false">
    <span class="label" part="label"></span>
    <span class="value-text placeholder" part="value">Select…</span>
    <span class="arrow" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M4.5 6.75L9 11.25L13.5 6.75"
              stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
  </div>
  <div class="popup" part="popup" role="listbox" tabindex="-1">
    <slot></slot>
  </div>
`;

class UiSelect extends HTMLElement {
  static observedAttributes = ['label', 'value', 'disabled'];

  #field;
  #popup;
  #labelEl;
  #valueEl;
  #isOpen = false;
  #outsideHandler;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(selectTemplate.content.cloneNode(true));
    this.#field   = this.shadowRoot.querySelector('.field');
    this.#popup   = this.shadowRoot.querySelector('.popup');
    this.#labelEl = this.shadowRoot.querySelector('.label');
    this.#valueEl = this.shadowRoot.querySelector('.value-text');
    this.#outsideHandler = this.#handleOutside.bind(this);
  }

  connectedCallback() {
    this.#field.addEventListener('click',   () => this.#toggle());
    this.#field.addEventListener('keydown', (e) => this.#handleFieldKey(e));
    this.#popup.addEventListener('keydown', (e) => this.#handleListKey(e));
    // Slotted option clicks bubble up to the host
    this.addEventListener('click', (e) => {
      const opt = e.target.closest('ui-option');
      if (opt && !opt.disabled && this.contains(opt)) this.#commitSelection(opt);
    });
    this.shadowRoot.querySelector('slot').addEventListener('slotchange', () => this.#syncValue());
    this.#syncLabel();
    this.#syncValue();
  }

  disconnectedCallback() {
    document.removeEventListener('click', this.#outsideHandler, true);
  }

  attributeChangedCallback(name) {
    if (name === 'label')    this.#syncLabel();
    if (name === 'value')    this.#syncValue();
    if (name === 'disabled') {
      this.#field.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
    }
  }

  /* Delegate programmatic focus to the real field (dialog focus pass etc.). */
  focus(options) { this.#field.focus(options); }

  get value() { return this.getAttribute('value') ?? ''; }
  set value(v) { this.setAttribute('value', v); }

  /* ---- private ----------------------------------------------------------- */

  #options() {
    const slot = this.shadowRoot.querySelector('slot');
    return slot.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'UI-OPTION');
  }

  #syncLabel() {
    const l = this.getAttribute('label') || '';
    this.#labelEl.textContent = l;
    this.#labelEl.hidden = !l;
    if (l) this.#field.setAttribute('aria-label', l);
  }

  #syncValue() {
    const val = this.getAttribute('value');
    const opts = this.#options();
    let found = null;
    opts.forEach(o => {
      const sel = val !== null && o.value === val;
      o.setAttribute('aria-selected', String(sel));
      if (sel) found = o;
    });
    if (found) {
      this.#valueEl.textContent = found.textContent.trim();
      this.#valueEl.classList.remove('placeholder');
    } else {
      this.#valueEl.textContent = 'Select…';
      this.#valueEl.classList.add('placeholder');
    }
  }

  #toggle() {
    if (this.hasAttribute('disabled')) return;
    this.#isOpen ? this.#close() : this.#open();
  }

  #open() {
    this.#isOpen = true;
    this.setAttribute('open', '');
    this.#field.setAttribute('aria-expanded', 'true');
    const opts = this.#options().filter(o => !o.disabled);
    const sel  = opts.find(o => o.getAttribute('aria-selected') === 'true') || opts[0];
    if (sel) requestAnimationFrame(() => sel.focus());
    document.addEventListener('click', this.#outsideHandler, true);
  }

  #close() {
    if (!this.#isOpen) return;
    this.#isOpen = false;
    this.removeAttribute('open');
    this.#field.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', this.#outsideHandler, true);
    this.#field.focus();
  }

  #handleOutside(e) {
    // composedPath, not e.target: a document-level listener sees a RETARGETED
    // target when the select is composed inside another shadow root (e.g. the
    // stakeholder-table cell editors), which would read as "outside".
    if (!e.composedPath().includes(this)) this.#close();
  }

  #handleFieldKey(e) {
    switch (e.key) {
      case 'Enter': case ' ': case 'ArrowDown':
        e.preventDefault(); this.#open(); break;
      case 'Escape':
        this.#close(); break;
    }
  }

  #handleListKey(e) {
    const opts = this.#options().filter(o => !o.disabled);
    // active element may be inside a shadow root of an option
    const focused = opts.find(o => o.matches(':focus') || o.shadowRoot?.activeElement);
    const idx = opts.indexOf(focused);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (idx < opts.length - 1) opts[idx + 1].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (idx > 0) opts[idx - 1].focus(); else this.#close();
        break;
      case 'Enter': case ' ':
        e.preventDefault();
        if (focused) this.#commitSelection(focused);
        break;
      case 'Escape':
        e.preventDefault(); this.#close(); break;
      case 'Tab':
        this.#close(); break;
    }
  }

  #commitSelection(opt) {
    const val = opt.value;
    this.setAttribute('value', val);
    this.#syncValue();
    this.#close();
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true, composed: true,
      detail: { value: val }
    }));
  }
}

if (!customElements.get('ui-select')) customElements.define('ui-select', UiSelect);
