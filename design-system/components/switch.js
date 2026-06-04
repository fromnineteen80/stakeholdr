/* ============================================================================
 * <ui-switch> — toggle control with track + animated handle.
 * Track: --ui-sys-track-off / --ui-sys-track-on.
 * Handle: --ui-sys-handle.
 * Animated with --ui-sys-motion-control.
 * ARIA role=switch. formAssociated.
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
      opacity: 0.38;
    }

    /* ---- track ---- */
    .track {
      position: relative;
      isolation: isolate;
      width: 52px;
      height: 32px;
      border-radius: var(--ui-sys-shape-pill);
      background: var(--ui-sys-track-off);
      border: 2px solid var(--ui-sys-outline);
      box-sizing: border-box;
      flex-shrink: 0;
      transition: background var(--ui-sys-motion-control),
                  border-color var(--ui-sys-motion-control);
    }

    :host([selected]) .track {
      background: var(--ui-sys-track-on);
      border-color: var(--ui-sys-track-on);
    }

    /* state layer */
    .track::before {
      content: "";
      position: absolute;
      /* expand beyond track to give a generous ripple area */
      inset: -4px;
      border-radius: var(--ui-sys-shape-pill);
      background: var(--ui-sys-on-surface);
      opacity: 0;
      z-index: -1;
      transition: opacity var(--ui-sys-motion-control);
    }
    :host([selected]) .track::before { background: var(--ui-sys-primary); }
    :host(:hover) .track::before     { opacity: var(--ui-sys-state-hover-opacity); }
    :host(:active) .track::before    { opacity: var(--ui-sys-state-pressed-opacity); }

    /* ---- handle ---- */
    .handle {
      position: absolute;
      top: 50%;
      left: 4px;
      transform: translateY(-50%);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--ui-sys-outline);
      box-shadow: var(--ui-sys-elevation-1);
      transition: left var(--ui-sys-motion-control),
                  width var(--ui-sys-motion-control),
                  background var(--ui-sys-motion-control);
    }

    :host([selected]) .handle {
      left: calc(52px - 24px - 4px);  /* track width - handle size - right gap (border = 2px each) */
      background: var(--ui-sys-handle);
      width: 24px;
      height: 24px;
      top: 50%;
      transform: translateY(-50%);
    }

    /* Pressed — shrink handle slightly */
    :host(:active) .handle {
      width: 28px;
      height: 28px;
    }
    :host([selected]:active) .handle {
      width: 28px;
      height: 28px;
      left: calc(52px - 28px - 2px);
    }

    /* ---- focus ring ---- */
    :host(:focus-visible) .track {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
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

  <div class="track" part="track">
    <div class="handle" part="handle"></div>
  </div>
  <span class="label" part="label"><slot></slot></span>
`;

class UiSwitch extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ['selected', 'disabled', 'name', 'value'];

  #internals;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#internals = this.attachInternals?.();
  }

  connectedCallback() {
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'switch');
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

  get selected() { return this.hasAttribute('selected'); }
  set selected(v) { v ? this.setAttribute('selected', '') : this.removeAttribute('selected'); }

  #updateAria() {
    this.setAttribute('aria-checked',  String(this.hasAttribute('selected')));
    this.setAttribute('aria-disabled', String(this.hasAttribute('disabled')));
  }

  #updateFormValue() {
    const value = this.getAttribute('value') || 'on';
    this.#internals?.setFormValue(this.hasAttribute('selected') ? value : null);
  }

  #toggle() {
    if (this.hasAttribute('disabled')) return;
    this.toggleAttribute('selected');
    this.#updateAria();
    this.#updateFormValue();
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

if (!customElements.get('ui-switch')) {
  customElements.define('ui-switch', UiSwitch);
}
