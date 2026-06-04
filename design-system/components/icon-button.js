/* ============================================================================
 * <ui-icon-button> — circular icon button with variant + toggle support.
 *
 * Usage:
 *   <ui-icon-button variant="filled">
 *     <svg>…</svg>
 *   </ui-icon-button>
 *   <ui-icon-button variant="outlined" selected aria-label="Bookmark">
 *     <svg>…</svg>
 *   </ui-icon-button>
 *
 * Attrs:
 *   variant  — standard | filled | tonal | outlined  (default: standard)
 *   disabled — boolean
 *   selected — boolean  (for toggle; toggles filled bg on standard/outlined)
 *   aria-label — required for accessibility
 *
 * Emits: change (composed:true, detail:{selected}) when selected toggles
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;

      /* variant defaults: standard */
      --_bg:     transparent;
      --_fg:     var(--ui-sys-on-surface);
      --_border: transparent;
      /* selected state overrides */
      --_bg-sel: var(--ui-sys-primary-container);
      --_fg-sel: var(--ui-sys-on-primary-container);
    }

    /* ---- variant tokens ---- */
    :host([variant="filled"]) {
      --_bg:     var(--ui-sys-primary);
      --_fg:     var(--ui-sys-on-primary);
      --_bg-sel: var(--ui-sys-surface-container-high);
      --_fg-sel: var(--ui-sys-on-surface);
    }
    :host([variant="tonal"]) {
      --_bg:     var(--ui-sys-surface-container);
      --_fg:     var(--ui-sys-on-surface);
      --_bg-sel: var(--ui-sys-primary-container);
      --_fg-sel: var(--ui-sys-on-primary-container);
    }
    :host([variant="outlined"]) {
      --_bg:     transparent;
      --_fg:     var(--ui-sys-on-surface);
      --_border: var(--ui-sys-outline);
      --_bg-sel: var(--ui-sys-surface-container);
      --_fg-sel: var(--ui-sys-on-surface);
    }

    button {
      appearance: none;
      position: relative;
      isolation: isolate;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
      border: 1px solid var(--_border);
      border-radius: 50%;
      background: var(--_bg);
      color: var(--_fg);
      cursor: pointer;
      user-select: none;
      transition: background var(--ui-sys-motion-control),
                  border-color var(--ui-sys-motion-control),
                  color var(--ui-sys-motion-control);
      overflow: hidden;
      outline: none;
    }

    /* selected state */
    :host([selected]) button {
      background: var(--_bg-sel);
      color: var(--_fg-sel);
      border-color: transparent;
    }

    /* state layer */
    button::before {
      content: "";
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      pointer-events: none;
    }
    button:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
    button:active::before { opacity: var(--ui-sys-state-pressed-opacity); }

    button:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    :host([disabled]) { pointer-events: none; }
    :host([disabled]) button {
      background: transparent;
      border-color: var(--ui-sys-on-surface-faint);
      color: var(--ui-sys-on-surface-faint);
      cursor: default;
    }
    :host([disabled][variant="filled"]) button,
    :host([disabled][variant="tonal"])  button {
      background: var(--ui-sys-surface-container);
      border-color: transparent;
    }

    ::slotted(svg),
    ::slotted(img) {
      display: block;
      width: 20px;
      height: 20px;
      pointer-events: none;
    }
  </style>
  <button part="button" type="button">
    <slot></slot>
  </button>
`;

class UiIconButton extends HTMLElement {
  static observedAttributes = ['disabled', 'selected', 'aria-label', 'aria-pressed'];

  #btn;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#btn = this.shadowRoot.querySelector('button');
  }

  connectedCallback() {
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'standard');
    this.#sync();
    this.#btn.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    this.#btn.removeEventListener('click', this.#onClick);
  }

  attributeChangedCallback() {
    this.#sync();
  }

  get selected() { return this.hasAttribute('selected'); }
  set selected(v) { v ? this.setAttribute('selected', '') : this.removeAttribute('selected'); }

  #sync() {
    this.#btn.disabled = this.hasAttribute('disabled');
    // Reflect aria-label to inner button
    const label = this.getAttribute('aria-label');
    if (label) this.#btn.setAttribute('aria-label', label);
    // Toggle button semantics: aria-pressed
    if (this.hasAttribute('selected') || this.getAttribute('aria-pressed') !== null) {
      this.#btn.setAttribute('aria-pressed', String(this.hasAttribute('selected')));
    }
  }

  #onClick = () => {
    if (this.hasAttribute('disabled')) return;
    // If it behaves as a toggle (has aria-pressed or selected attr was set once)
    if (this.#btn.hasAttribute('aria-pressed')) {
      this.selected = !this.selected;
      this.dispatchEvent(new CustomEvent('change', {
        bubbles: true, composed: true,
        detail: { selected: this.selected }
      }));
    }
  };
}

if (!customElements.get('ui-icon-button')) customElements.define('ui-icon-button', UiIconButton);
