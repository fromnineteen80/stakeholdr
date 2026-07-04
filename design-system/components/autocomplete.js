/* ============================================================================
 * <ui-autocomplete> — typeahead / combobox (gap-fill: MD3 ships none).
 *
 * Properties (set via JS):
 *   .options  array of strings OR array of {label, value}
 *
 * Attributes:
 *   label        visible label above the input
 *   placeholder  input placeholder text
 *   value        current selected value (reflects after selection)
 *
 * Events (composed:true):
 *   input   → detail { value, label }   on every keystroke filter change
 *   change  → detail { value, label }   on confirmed selection (Enter or click)
 *
 * Keyboard: Down/Up navigate list, Enter confirms, Escape closes, Tab closes.
 * ARIA: role=combobox on input, role=listbox on popup, aria-activedescendant.
 *
 * If no .options are set on connect, seeds sample data so gallery renders.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-block;
      position: relative;
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
    }

    /* Label */
    label {
      display: block;
      font: var(--ui-sys-font-label);
      color: var(--ui-sys-on-surface-muted);
      margin-bottom: var(--ui-sys-space-1);
    }

    /* Input wrapper — outlined field style */
    .field {
      position: relative;
      display: flex;
      align-items: center;
      height: var(--ui-sys-control-height);
      background: var(--ui-sys-surface-field);
      border: 1px solid var(--ui-sys-outline);
      border-radius: var(--ui-sys-shape-control);
      transition: border-color var(--ui-sys-motion-control),
                  background   var(--ui-sys-motion-control);
      overflow: hidden;
    }
    .field:hover { border-color: var(--ui-sys-on-surface-muted); }
    .field:focus-within {
      border-color: var(--ui-sys-focus-ring);
      border-width: 2px;
    }

    input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      padding: 0 var(--ui-sys-space-3);
      height: 100%;
      min-width: 0;
    }
    input::placeholder { color: var(--ui-sys-on-surface-muted); }

    /* Clear / caret button */
    .end-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 100%;
      cursor: pointer;
      color: var(--ui-sys-on-surface-muted);
      font-size: 16px;
      flex-shrink: 0;
      user-select: none;
      transition: color var(--ui-sys-motion-control);
    }
    .end-icon:hover { color: var(--ui-sys-on-surface); }

    /* Popup listbox */
    .popup {
      display: none;
      position: absolute;
      top: calc(100% + var(--ui-sys-space-1));
      left: 0;
      right: 0;
      z-index: 99;
      background: var(--ui-sys-surface-container-high);
      border: 1px solid var(--ui-sys-outline);
      border-radius: var(--ui-sys-shape-control);
      box-shadow: var(--ui-sys-elevation-2);
      max-height: 220px;
      overflow-y: auto;
      padding: var(--ui-sys-space-1) 0;
    }
    .popup[open] { display: block; }

    /* Individual option */
    .option {
      display: flex;
      align-items: center;
      padding: var(--ui-sys-space-2) var(--ui-sys-space-3);
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      cursor: pointer;
      position: relative;
      isolation: isolate;
      transition: background var(--ui-sys-motion-control);
      min-height: var(--ui-sys-control-height);
    }
    .option::before {
      content: "";
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      pointer-events: none;
      z-index: -1;
    }
    .option:hover::before   { opacity: var(--ui-sys-state-hover-opacity); }
    .option:active::before  { opacity: var(--ui-sys-state-pressed-opacity); }

    /* Keyboard-focused option */
    .option[aria-selected="true"] {
      background: var(--ui-sys-primary-container);
      color: var(--ui-sys-on-primary-container);
    }

    /* Highlighted match text */
    mark {
      background: transparent;
      color: var(--ui-sys-primary);
      font-weight: 600;
    }

    /* No results */
    .no-results {
      padding: var(--ui-sys-space-3) var(--ui-sys-space-3);
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface-muted);
    }
  </style>

  <label part="label" id="field-label"></label>
  <div class="field" part="field">
    <input
      part="input"
      type="text"
      role="combobox"
      aria-autocomplete="list"
      aria-expanded="false"
      aria-haspopup="listbox"
      autocomplete="off"
      spellcheck="false"
    />
    <span class="end-icon" aria-hidden="true" id="end-icon">⌄</span>
  </div>
  <div class="popup" role="listbox" part="popup" id="popup"></div>
`;

const SAMPLE_OPTIONS = [
  { label: 'Alex Rivera',   value: 'alex-rivera'   },
  { label: 'Casey Patel',   value: 'casey-patel'   },
  { label: 'Jordan Kim',    value: 'jordan-kim'    },
  { label: 'Morgan Lee',    value: 'morgan-lee'    },
  { label: 'Sam Okafor',    value: 'sam-okafor'    },
  { label: 'Taylor Okonjo', value: 'taylor-okonjo' },
  { label: 'Dana Novak',    value: 'dana-novak'    },
  { label: 'Quinn Torres',  value: 'quinn-torres'  },
];

class UiAutocomplete extends HTMLElement {
  static observedAttributes = ['label', 'placeholder', 'value'];

  #options  = null;
  #filtered = [];
  #activeIdx = -1;
  #value = '';
  #label = '';

  #inputEl;
  #popupEl;
  #labelEl;
  #endIcon;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#inputEl = this.shadowRoot.querySelector('input');
    this.#popupEl = this.shadowRoot.getElementById('popup');
    this.#labelEl = this.shadowRoot.getElementById('field-label');
    this.#endIcon = this.shadowRoot.getElementById('end-icon');
  }

  connectedCallback() {
    // Seed sample options if nothing was set programmatically.
    if (this.#options === null) this.#options = SAMPLE_OPTIONS;

    this.#syncAttrs();

    this.#inputEl.addEventListener('input',   this.#onInput);
    this.#inputEl.addEventListener('keydown', this.#onKeydown);
    this.#inputEl.addEventListener('focus',   this.#onFocus);
    this.#inputEl.addEventListener('blur',    this.#onBlur);
    this.#endIcon.addEventListener('mousedown', this.#onEndIconClick);
  }

  disconnectedCallback() {
    this.#inputEl.removeEventListener('input',   this.#onInput);
    this.#inputEl.removeEventListener('keydown', this.#onKeydown);
    this.#inputEl.removeEventListener('focus',   this.#onFocus);
    this.#inputEl.removeEventListener('blur',    this.#onBlur);
    this.#endIcon.removeEventListener('mousedown', this.#onEndIconClick);
  }

  attributeChangedCallback(name, _old, next) {
    if (name === 'label')       { this.#labelEl.textContent = next || ''; this.#labelEl.hidden = !next; }
    if (name === 'placeholder') { this.#inputEl.placeholder = next || ''; }
    if (name === 'value')       { this.#setValue(next || '', true); }
  }

  /* --- public properties -------------------------------------------------- */

  get options() { return this.#options; }
  set options(val) {
    this.#options = (Array.isArray(val) ? val : []).map(o =>
      typeof o === 'string' ? { label: o, value: o } : { label: String(o.label ?? o.value ?? ''), value: String(o.value ?? o.label ?? '') }
    );
    if (this.isConnected) this.#closePopup();
  }

  /* Delegate programmatic focus to the real input (dialog autofocus — the
   * sealed pickers open with the typeahead focused). */
  focus(options) { this.#inputEl.focus(options); }

  get value() { return this.#value; }
  set value(v) { this.#setValue(String(v ?? ''), true); }

  /* --- sync attrs --------------------------------------------------------- */

  #syncAttrs() {
    const lbl = this.getAttribute('label');
    this.#labelEl.textContent = lbl || '';
    this.#labelEl.hidden = !lbl;
    this.#inputEl.placeholder = this.getAttribute('placeholder') || '';
    const v = this.getAttribute('value');
    if (v) this.#setValue(v, true);
  }

  /* --- open / close popup ------------------------------------------------- */

  #openPopup(query) {
    const opts = this.#options || [];
    const q = (query || '').toLowerCase();
    this.#filtered = q
      ? opts.filter(o => o.label.toLowerCase().includes(q))
      : [...opts];
    this.#activeIdx = -1;
    this.#renderPopup(q);
    this.#popupEl.setAttribute('open', '');
    this.#inputEl.setAttribute('aria-expanded', 'true');
    this.#endIcon.textContent = '×';
  }

  #closePopup() {
    this.#popupEl.removeAttribute('open');
    this.#inputEl.setAttribute('aria-expanded', 'false');
    this.#inputEl.removeAttribute('aria-activedescendant');
    this.#activeIdx = -1;
    this.#endIcon.textContent = '⌄';
  }

  /* --- render list -------------------------------------------------------- */

  #renderPopup(query) {
    this.#popupEl.innerHTML = '';

    if (this.#filtered.length === 0) {
      const noRes = document.createElement('div');
      noRes.className = 'no-results';
      noRes.textContent = 'No results';
      this.#popupEl.appendChild(noRes);
      return;
    }

    const q = query || '';
    this.#filtered.forEach((opt, i) => {
      const item = document.createElement('div');
      item.className = 'option';
      item.setAttribute('role', 'option');
      item.id = `opt-${i}`;
      item.setAttribute('aria-selected', String(i === this.#activeIdx));

      // Highlight matching substring
      if (q) {
        const idx = opt.label.toLowerCase().indexOf(q.toLowerCase());
        if (idx >= 0) {
          item.appendChild(document.createTextNode(opt.label.slice(0, idx)));
          const mark = document.createElement('mark');
          mark.textContent = opt.label.slice(idx, idx + q.length);
          item.appendChild(mark);
          item.appendChild(document.createTextNode(opt.label.slice(idx + q.length)));
        } else {
          item.textContent = opt.label;
        }
      } else {
        item.textContent = opt.label;
      }

      // mousedown (not click) so blur doesn't fire first
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.#select(i);
      });

      this.#popupEl.appendChild(item);
    });
  }

  /* --- select ------------------------------------------------------------- */

  #select(idx) {
    const opt = this.#filtered[idx];
    if (!opt) return;
    this.#setValue(opt.value, false);
    this.#inputEl.value = opt.label;
    this.#closePopup();
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true, composed: true,
      detail: { value: opt.value, label: opt.label },
    }));
  }

  #setValue(v, updateInput) {
    this.#value = v;
    if (updateInput) {
      // Find label for value
      const opts = this.#options || [];
      const match = opts.find(o => o.value === v || o.label === v);
      this.#inputEl.value = match ? match.label : v;
    }
  }

  /* --- move active index -------------------------------------------------- */

  #setActive(idx) {
    const items = this.#popupEl.querySelectorAll('.option');
    if (this.#activeIdx >= 0 && items[this.#activeIdx]) {
      items[this.#activeIdx].setAttribute('aria-selected', 'false');
    }
    this.#activeIdx = Math.max(0, Math.min(idx, this.#filtered.length - 1));
    if (items[this.#activeIdx]) {
      items[this.#activeIdx].setAttribute('aria-selected', 'true');
      items[this.#activeIdx].scrollIntoView({ block: 'nearest' });
      this.#inputEl.setAttribute('aria-activedescendant', `opt-${this.#activeIdx}`);
    }
  }

  /* --- event handlers ----------------------------------------------------- */

  #onInput = () => {
    const q = this.#inputEl.value;
    this.#openPopup(q);
    this.dispatchEvent(new CustomEvent('input', {
      bubbles: true, composed: true,
      detail: { value: q, label: q },
    }));
  };

  #onFocus = () => {
    this.#openPopup(this.#inputEl.value);
  };

  #onBlur = () => {
    // Delay so mousedown on option fires first.
    setTimeout(() => this.#closePopup(), 150);
  };

  #onKeydown = (e) => {
    const open = this.#popupEl.hasAttribute('open');
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!open) this.#openPopup(this.#inputEl.value);
        this.#setActive(this.#activeIdx < 0 ? 0 : this.#activeIdx + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) this.#openPopup(this.#inputEl.value);
        this.#setActive(this.#activeIdx <= 0 ? this.#filtered.length - 1 : this.#activeIdx - 1);
        break;
      case 'Enter':
        e.preventDefault();
        if (open && this.#activeIdx >= 0) this.#select(this.#activeIdx);
        else if (!open) this.#openPopup(this.#inputEl.value);
        break;
      case 'Escape':
      case 'Tab':
        this.#closePopup();
        break;
    }
  };

  #onEndIconClick = (e) => {
    e.preventDefault();
    if (this.#popupEl.hasAttribute('open')) {
      this.#inputEl.value = '';
      this.#value = '';
      this.#closePopup();
    } else {
      this.#inputEl.focus();
      this.#openPopup('');
    }
  };
}

if (!customElements.get('ui-autocomplete')) {
  customElements.define('ui-autocomplete', UiAutocomplete);
}
