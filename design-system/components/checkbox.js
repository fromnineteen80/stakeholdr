/* ============================================================================
 * <ui-checkbox> — selection control with checked, indeterminate, and disabled
 * states. Real checkmark via inline SVG. formAssociated.
 * Styled ONLY via --ui-sys-* tokens.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--ui-sys-space-2);
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    :host([disabled]) {
      pointer-events: none;
      cursor: default;
    }

    /* ---- box ---- */
    .box {
      position: relative;
      isolation: isolate;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      border: 2px solid var(--ui-sys-outline);
      border-radius: var(--ui-sys-shape-control);
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--ui-sys-motion-control),
                  border-color var(--ui-sys-motion-control);
    }

    /* checked / indeterminate */
    :host([checked]) .box,
    :host([indeterminate]) .box {
      background: var(--ui-sys-primary);
      border-color: var(--ui-sys-primary);
    }

    /* disabled */
    :host([disabled]) .box {
      border-color: var(--ui-sys-on-surface-faint);
      background: transparent;
    }
    :host([disabled][checked]) .box,
    :host([disabled][indeterminate]) .box {
      background: var(--ui-sys-on-surface-faint);
      border-color: var(--ui-sys-on-surface-faint);
    }

    /* state layer */
    .box::before {
      content: "";
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      background: var(--ui-sys-primary);
      opacity: 0;
      z-index: -1;
      transition: opacity var(--ui-sys-motion-control);
    }
    :host(:not([checked]):not([indeterminate])) .box::before {
      background: var(--ui-sys-on-surface);
    }
    :host(:hover) .box::before  { opacity: var(--ui-sys-state-hover-opacity); }
    :host(:active) .box::before { opacity: var(--ui-sys-state-pressed-opacity); }

    /* focus ring */
    :host(:focus-visible) .box {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    /* ---- SVG icons ---- */
    svg {
      width: 12px;
      height: 12px;
      display: none;
      pointer-events: none;
    }
    svg path, svg line {
      stroke: var(--ui-sys-on-primary);
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    :host([checked]) .icon-check         { display: block; }
    :host([indeterminate]) .icon-dash     { display: block; }

    :host([disabled][checked]) svg path,
    :host([disabled][indeterminate]) svg path,
    :host([disabled][indeterminate]) svg line {
      stroke: var(--ui-sys-handle);
    }

    /* ---- label ---- */
    .label {
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
    }
    :host([disabled]) .label {
      color: var(--ui-sys-on-surface-faint);
    }
  </style>

  <div class="box" part="box">
    <!-- checkmark -->
    <svg class="icon-check" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M1.5 6L4.5 9L10.5 3"/>
    </svg>
    <!-- dash (indeterminate) -->
    <svg class="icon-dash" viewBox="0 0 12 12" aria-hidden="true">
      <line x1="2" y1="6" x2="10" y2="6"/>
    </svg>
  </div>
  <span class="label" part="label"><slot></slot></span>
`;

class UiCheckbox extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ['checked', 'indeterminate', 'disabled', 'value', 'name'];

  #internals;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#internals = this.attachInternals?.();
  }

  connectedCallback() {
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'checkbox');
    this.#updateAria();
    this.addEventListener('click',   this.#onClick);
    this.addEventListener('keydown', this.#onKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('click',   this.#onClick);
    this.removeEventListener('keydown', this.#onKeydown);
  }

  attributeChangedCallback() {
    this.#updateAria();
    this.#updateFormValue();
  }

  get checked()       { return this.hasAttribute('checked'); }
  set checked(v)      { v ? this.setAttribute('checked', '') : this.removeAttribute('checked'); }

  get indeterminate() { return this.hasAttribute('indeterminate'); }
  set indeterminate(v){ v ? this.setAttribute('indeterminate', '') : this.removeAttribute('indeterminate'); }

  #updateAria() {
    if (this.hasAttribute('indeterminate')) {
      this.setAttribute('aria-checked', 'mixed');
    } else {
      this.setAttribute('aria-checked', String(this.hasAttribute('checked')));
    }
    if (this.hasAttribute('disabled')) {
      this.setAttribute('aria-disabled', 'true');
    } else {
      this.removeAttribute('aria-disabled');
    }
  }

  #updateFormValue() {
    const checked = this.hasAttribute('checked');
    const value   = this.getAttribute('value') || 'on';
    this.#internals?.setFormValue(checked ? value : null);
  }

  #toggle() {
    if (this.hasAttribute('disabled')) return;
    // indeterminate -> checked
    if (this.hasAttribute('indeterminate')) {
      this.removeAttribute('indeterminate');
      this.setAttribute('checked', '');
    } else if (this.hasAttribute('checked')) {
      this.removeAttribute('checked');
    } else {
      this.setAttribute('checked', '');
    }
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('input',  { bubbles: true, composed: true }));
  }

  #onClick = () => this.#toggle();

  #onKeydown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.#toggle();
    }
  };
}

if (!customElements.get('ui-checkbox')) {
  customElements.define('ui-checkbox', UiCheckbox);
}
