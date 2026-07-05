/* ============================================================================
 * <ui-textarea> — outlined multiline text field, visually consistent with
 * <ui-text-field>: floating label, focus outline, error state, supporting
 * text. Adds rows, maxlength with a live "N / MAX" counter (right-aligned,
 * muted ink, error ink at the limit), and optional auto-grow. formAssociated.
 * Styled ONLY via --ui-sys-* tokens. No hardcoded colors or sizes.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      flex-direction: column;
      gap: var(--ui-sys-space-1);
      --_outline:       var(--ui-sys-outline);
      --_outline-width: 1px;
      --_label-color:   var(--ui-sys-on-surface-muted);
      --_support-color: var(--ui-sys-on-surface-muted);
      --_counter-color: var(--ui-sys-on-surface-muted);
    }

    :host([error]) {
      --_outline:       var(--ui-sys-error);
      --_outline-width: 1px;
      --_label-color:   var(--ui-sys-error);
      --_support-color: var(--ui-sys-error);
    }

    :host([at-limit]) {
      --_counter-color: var(--ui-sys-error);
    }

    :host([disabled]) {
      pointer-events: none;
      --_outline:       var(--ui-sys-on-surface-faint);
      --_label-color:   var(--ui-sys-on-surface-faint);
      --_support-color: var(--ui-sys-on-surface-faint);
      --_counter-color: var(--ui-sys-on-surface-faint);
    }

    /* ---- field wrapper ---- */
    .field {
      position: relative;
      display: flex;
      align-items: stretch;
      min-height: var(--ui-sys-control-height);
      background: var(--ui-sys-surface-field);
      border: var(--_outline-width) solid var(--_outline);
      border-radius: var(--ui-sys-shape-control);
      transition: border-color var(--ui-sys-motion-control),
                  box-shadow var(--ui-sys-motion-control);
      overflow: visible;
    }

    /* Focus state — thicker outline, primary color */
    .field:focus-within {
      border-color: var(--ui-sys-primary);
      border-width: 2px;
    }
    :host([error]) .field:focus-within {
      border-color: var(--ui-sys-error);
    }

    /* state layer */
    .field::before {
      content: "";
      position: absolute;
      inset: 0;
      background: var(--ui-sys-on-surface);
      opacity: 0;
      border-radius: inherit;
      transition: opacity var(--ui-sys-motion-control);
      pointer-events: none;
      z-index: 0;
    }
    .field:hover::before { opacity: var(--ui-sys-state-hover-opacity); }

    /* ---- floating label (rests on the FIRST line — multiline field) ---- */
    label {
      position: absolute;
      left: var(--ui-sys-space-3);
      top: calc(var(--ui-sys-space-2) + 6px);
      font: var(--ui-sys-font-body);
      color: var(--_label-color);
      pointer-events: none;
      transform-origin: left center;
      transition: transform var(--ui-sys-motion-control),
                  top var(--ui-sys-motion-control),
                  font var(--ui-sys-motion-control),
                  color var(--ui-sys-motion-control);
      z-index: 1;
    }

    /* Float label when focused or has value */
    .field:focus-within label,
    :host([has-value]) label {
      top: 0;
      transform: translateY(-50%) scale(0.85);
      color: var(--ui-sys-primary);
      background: var(--ui-sys-surface-field);
      padding: 0 var(--ui-sys-space-1);
      left: calc(var(--ui-sys-space-3) - var(--ui-sys-space-1));
    }
    :host([error]) .field:focus-within label,
    :host([error][has-value]) label {
      color: var(--ui-sys-error);
    }
    :host([disabled]) .field:focus-within label,
    :host([disabled][has-value]) label {
      color: var(--ui-sys-on-surface-faint);
      background: transparent;
    }

    /* ---- textarea ---- */
    textarea {
      flex: 1;
      min-width: 0;
      appearance: none;
      background: transparent;
      border: none;
      outline: none;
      resize: vertical;
      padding: var(--ui-sys-space-2) var(--ui-sys-space-3);
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      caret-color: var(--ui-sys-primary);
      z-index: 1;
    }
    :host([error]) textarea { caret-color: var(--ui-sys-error); }
    :host([disabled]) textarea { color: var(--ui-sys-on-surface-faint); }

    /* Auto-grow: height driven by content, manual resize off */
    :host([auto-grow]) textarea {
      resize: none;
      overflow: hidden;
    }

    /* Nudge textarea down when label is present so it doesn't overlap floated label */
    :host([label]) textarea {
      padding-top: calc(var(--ui-sys-space-2) + 6px);
      padding-bottom: calc(var(--ui-sys-space-2) - 2px);
    }

    /* ---- supporting row: supporting text left, live counter right ---- */
    .meta {
      display: flex;
      align-items: baseline;
      gap: var(--ui-sys-space-2);
      padding: 0 var(--ui-sys-space-3);
    }
    .meta[hidden] { display: none; }
    .supporting {
      flex: 1;
      font: var(--ui-sys-font-caption);
      color: var(--_support-color);
    }
    .counter {
      margin-left: auto;
      font: var(--ui-sys-font-caption);
      font-variant-numeric: tabular-nums;
      color: var(--_counter-color);
      white-space: nowrap;
    }
    .counter[hidden] { display: none; }
  </style>

  <div class="field" part="field">
    <textarea part="textarea" id="textarea"></textarea>
    <label part="label" for="textarea"></label>
  </div>
  <div class="meta" part="meta">
    <span class="supporting" part="supporting"></span>
    <span class="counter" part="counter" aria-hidden="true"></span>
  </div>
`;

class UiTextarea extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = [
    'label', 'value', 'placeholder', 'rows', 'maxlength', 'disabled', 'error',
    'supporting-text', 'auto-grow',
  ];

  #internals;
  #textarea;
  #label;
  #supporting;
  #counter;
  #meta;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#internals  = this.attachInternals?.();
    this.#textarea   = this.shadowRoot.querySelector('textarea');
    this.#label      = this.shadowRoot.querySelector('label');
    this.#supporting = this.shadowRoot.querySelector('.supporting');
    this.#counter    = this.shadowRoot.querySelector('.counter');
    this.#meta       = this.shadowRoot.querySelector('.meta');
  }

  connectedCallback() {
    this.#textarea.addEventListener('input',  this.#onInput);
    this.#textarea.addEventListener('change', this.#onChange);
    this.#sync();
    this.#autoGrow();
  }

  disconnectedCallback() {
    this.#textarea.removeEventListener('input',  this.#onInput);
    this.#textarea.removeEventListener('change', this.#onChange);
  }

  attributeChangedCallback() { this.#sync(); }

  /* Delegate programmatic focus to the real control (dialog focus pass etc.). */
  focus(options) { this.#textarea.focus(options); }

  /* Caret access for caret-anchored features (the sealed mention composer
     reads selectionStart on every input; a pick re-places the caret). */
  get selectionStart() { return this.#textarea.selectionStart; }
  setSelectionRange(start, end, direction) {
    this.#textarea.setSelectionRange(start, end ?? start, direction);
  }

  get value()  { return this.#textarea.value; }
  set value(v) {
    this.#textarea.value = v ?? '';
    this.#updateHasValue();
    this.#updateCounter();
    this.#autoGrow();
  }

  #maxlength() {
    const raw = this.getAttribute('maxlength');
    const n = raw === null ? NaN : parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  #sync() {
    const label          = this.getAttribute('label') || '';
    const placeholder    = this.getAttribute('placeholder') || '';
    const rows           = parseInt(this.getAttribute('rows'), 10);
    const disabled       = this.hasAttribute('disabled');
    const supportingText = this.getAttribute('supporting-text') || '';
    const maxlength      = this.#maxlength();

    this.#label.textContent      = label;
    this.#label.style.display    = label ? '' : 'none';
    this.#textarea.placeholder   = label ? '' : placeholder;  // placeholder only when no floating label
    this.#textarea.rows          = Number.isFinite(rows) && rows > 0 ? rows : 3;
    this.#textarea.disabled      = disabled;
    if (maxlength !== null) {
      this.#textarea.maxLength = maxlength;
    } else {
      this.#textarea.removeAttribute('maxlength');
    }
    this.#supporting.textContent = supportingText;

    // Reflect initial value attribute
    if (this.hasAttribute('value') && !this.#textarea.value) {
      this.#textarea.value = this.getAttribute('value');
    }
    this.#updateHasValue();
    this.#updateCounter();
    this.#meta.hidden = !supportingText && maxlength === null;
    this.#autoGrow();
  }

  #updateHasValue() {
    if (this.#textarea.value) {
      this.setAttribute('has-value', '');
    } else {
      this.removeAttribute('has-value');
    }
    this.#internals?.setFormValue(this.#textarea.value);
  }

  #updateCounter() {
    const max = this.#maxlength();
    if (max === null) {
      this.#counter.hidden = true;
      this.#counter.textContent = '';
      this.removeAttribute('at-limit');
      return;
    }
    const len = this.#textarea.value.length;
    this.#counter.hidden = false;
    this.#counter.textContent = `${len} / ${max}`;
    if (len >= max) {
      this.setAttribute('at-limit', '');
    } else {
      this.removeAttribute('at-limit');
    }
  }

  #autoGrow() {
    if (!this.hasAttribute('auto-grow')) return;
    this.#textarea.style.height = 'auto';
    this.#textarea.style.height = `${this.#textarea.scrollHeight}px`;
  }

  #onInput = (e) => {
    e.stopPropagation(); // re-dispatched from the host below
    this.#updateHasValue();
    this.#updateCounter();
    this.#autoGrow();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };

  #onChange = () => {
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };
}

if (!customElements.get('ui-textarea')) {
  customElements.define('ui-textarea', UiTextarea);
}
