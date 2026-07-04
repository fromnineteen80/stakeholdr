/* ============================================================================
 * <ui-text-field> — outlined text input with floating label, leading/trailing
 * icon slots, error state, and supporting text. formAssociated.
 * variant="outlined" (default) | "plain" — plain is the label-less,
 * chrome-light inline field (hairline outline that strengthens on focus).
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
    }

    /* ---- plain variant: label-less, chrome-light inline field ----
     * Hairline outline at rest; strengthens to the same focus border/ring
     * as outlined via the shared .field:focus-within rules below.
     * Declared BEFORE [error]/[disabled] so those states still win. */
    :host([variant="plain"]) {
      --_outline: var(--ui-sys-outline-subtle);
    }
    :host([variant="plain"]) label {
      display: none;
    }
    :host([variant="plain"][label]) input {
      padding-top: var(--ui-sys-space-2);
      padding-bottom: var(--ui-sys-space-2);
    }

    :host([error]) {
      --_outline:       var(--ui-sys-error);
      --_outline-width: 1px;
      --_label-color:   var(--ui-sys-error);
      --_support-color: var(--ui-sys-error);
    }

    :host([disabled]) {
      pointer-events: none;
      --_outline:       var(--ui-sys-on-surface-faint);
      --_label-color:   var(--ui-sys-on-surface-faint);
      --_support-color: var(--ui-sys-on-surface-faint);
    }

    /* ---- field wrapper ---- */
    .field {
      position: relative;
      display: flex;
      align-items: center;
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

    /* ---- floating label ---- */
    label {
      position: absolute;
      left: var(--ui-sys-space-3);
      top: 50%;
      transform: translateY(-50%);
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

    /* ---- input ---- */
    input {
      flex: 1;
      min-width: 0;
      appearance: none;
      background: transparent;
      border: none;
      outline: none;
      padding: var(--ui-sys-space-2) var(--ui-sys-space-3);
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      caret-color: var(--ui-sys-primary);
      z-index: 1;
    }
    :host([error]) input { caret-color: var(--ui-sys-error); }
    :host([disabled]) input { color: var(--ui-sys-on-surface-faint); }

    /* type=number: native spin buttons suppressed — the component owns number
       presentation (sealed Scoring-box cell rule: webkit/moz spinners off;
       stepping is an explicit composed control, never browser chrome). */
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    input[type="number"] { -moz-appearance: textfield; appearance: textfield; }

    /* align="center" — centered entry text (the sealed Scoring matrix's dense
       numeric cells; an attribute, never an external override). */
    :host([align="center"]) input { text-align: center; }

    /* Nudge input down when label is present so it doesn't overlap floated label */
    :host([label]) input {
      padding-top: calc(var(--ui-sys-space-2) + 6px);
      padding-bottom: calc(var(--ui-sys-space-2) - 2px);
    }

    /* ---- slots ---- */
    ::slotted([slot="leading"]) {
      display: inline-flex;
      width: 18px;
      height: 18px;
      margin-left: var(--ui-sys-space-3);
      color: var(--ui-sys-on-surface-muted);
      flex-shrink: 0;
      z-index: 1;
    }
    ::slotted([slot="trailing"]) {
      display: inline-flex;
      width: 18px;
      height: 18px;
      margin-right: var(--ui-sys-space-3);
      color: var(--ui-sys-on-surface-muted);
      flex-shrink: 0;
      z-index: 1;
    }

    /* Adjust input padding when slots are present */
    :host([has-leading]) input { padding-left: var(--ui-sys-space-2); }
    :host([has-trailing]) input { padding-right: var(--ui-sys-space-2); }

    /* ---- supporting text ---- */
    .supporting {
      font: var(--ui-sys-font-caption);
      color: var(--_support-color);
      padding: 0 var(--ui-sys-space-3);
    }
    .supporting:empty { display: none; }

    /* focus-visible ring on the wrapper for keyboard nav */
    .field:focus-within {
      box-shadow: 0 0 0 0 transparent;
    }
    input:focus-visible {
      outline: none;
    }
    .field:focus-within {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }
    /* Remove double-outline when also showing the focus border */
    .field:focus-within {
      outline: none;
    }
  </style>

  <div class="field" part="field">
    <slot name="leading"></slot>
    <input part="input" id="input" />
    <slot name="trailing"></slot>
    <label part="label" for="input"></label>
  </div>
  <span class="supporting" part="supporting"></span>
`;

class UiTextField extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = [
    'label', 'value', 'placeholder', 'type', 'disabled', 'error', 'supporting-text',
    'variant',
  ];

  #internals;
  #input;
  #label;
  #supporting;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#internals = this.attachInternals?.();
    this.#input     = this.shadowRoot.querySelector('input');
    this.#label     = this.shadowRoot.querySelector('label');
    this.#supporting = this.shadowRoot.querySelector('.supporting');
  }

  connectedCallback() {
    this.#input.addEventListener('input',  this.#onInput);
    this.#input.addEventListener('change', this.#onChange);

    // Detect slotted leading/trailing icons
    const leading  = this.shadowRoot.querySelector('slot[name="leading"]');
    const trailing = this.shadowRoot.querySelector('slot[name="trailing"]');
    leading.addEventListener('slotchange',  () => this.#updateSlotAttrs(leading, 'has-leading'));
    trailing.addEventListener('slotchange', () => this.#updateSlotAttrs(trailing, 'has-trailing'));

    this.#sync();
  }

  disconnectedCallback() {
    this.#input.removeEventListener('input',  this.#onInput);
    this.#input.removeEventListener('change', this.#onChange);
  }

  attributeChangedCallback() { this.#sync(); }

  get value()       { return this.#input.value; }
  set value(v)      { this.#input.value = v; this.#updateHasValue(); this.#internals?.setFormValue(v); }

  /* Delegate programmatic focus to the real input (autoFocus, dialog focus). */
  focus(options)    { this.#input.focus(options); }

  #sync() {
    const label         = this.getAttribute('label') || '';
    const placeholder   = this.getAttribute('placeholder') || '';
    const type          = this.getAttribute('type') || 'text';
    const disabled      = this.hasAttribute('disabled');
    const supportingText = this.getAttribute('supporting-text') || '';
    const plain         = this.getAttribute('variant') === 'plain'; // plain = label-less, placeholder-driven

    this.#label.textContent        = label;
    this.#label.style.display      = (label && !plain) ? '' : 'none';
    this.#input.placeholder        = (label && !plain) ? '' : placeholder;  // placeholder only when no floating label
    this.#input.type               = type;
    this.#input.disabled           = disabled;
    this.#supporting.textContent   = supportingText;

    // Plain variant hides the label element; keep it accessible instead.
    if (plain && label) {
      this.#input.setAttribute('aria-label', label);
    } else {
      this.#input.removeAttribute('aria-label');
    }

    // Reflect initial value attribute
    if (this.hasAttribute('value') && !this.#input.value) {
      this.#input.value = this.getAttribute('value');
    }
    this.#updateHasValue();
  }

  #updateHasValue() {
    if (this.#input.value) {
      this.setAttribute('has-value', '');
    } else {
      this.removeAttribute('has-value');
    }
    this.#internals?.setFormValue(this.#input.value);
  }

  #updateSlotAttrs(slot, attr) {
    if (slot.assignedElements().length > 0) {
      this.setAttribute(attr, '');
    } else {
      this.removeAttribute(attr);
    }
  }

  #onInput = (e) => {
    this.#updateHasValue();
    this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  };

  #onChange = () => {
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };
}

if (!customElements.get('ui-text-field')) {
  customElements.define('ui-text-field', UiTextField);
}
