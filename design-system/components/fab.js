/* ============================================================================
 * <ui-fab> — floating action button.
 *
 * Usage:
 *   <!-- standard (icon only) -->
 *   <ui-fab aria-label="Add item">
 *     <svg>…</svg>
 *   </ui-fab>
 *
 *   <!-- extended (icon + label attr) -->
 *   <ui-fab label="New stakeholder" size="medium" variant="surface">
 *     <svg>…</svg>
 *   </ui-fab>
 *
 *   <!-- large -->
 *   <ui-fab size="large" aria-label="Compose">
 *     <svg>…</svg>
 *   </ui-fab>
 *
 * Attrs:
 *   size     — small | medium | large  (default: medium)
 *   variant  — primary | surface       (default: primary)
 *   label    — string; when set renders as extended FAB with text label
 *   disabled — boolean
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;

      /* variant defaults: primary */
      --_bg: var(--ui-sys-primary);
      --_fg: var(--ui-sys-on-primary);

      /* size defaults: medium */
      --_size:   56px;
      --_radius: var(--ui-sys-shape-card);
      --_icon:   24px;
      --_pad:    var(--ui-sys-space-4);
    }

    /* ---- variant tokens ---- */
    :host([variant="surface"]) {
      --_bg: var(--ui-sys-surface-card);
      --_fg: var(--ui-sys-on-surface);
    }

    /* ---- size tokens ---- */
    :host([size="small"]) {
      --_size: 40px;
      --_radius: var(--ui-sys-shape-control);
      --_icon: 20px;
      --_pad: var(--ui-sys-space-2);
    }
    :host([size="large"]) {
      --_size: 96px;
      --_radius: 28px;
      --_icon: 36px;
      --_pad: var(--ui-sys-space-6);
    }

    button {
      appearance: none;
      position: relative;
      isolation: isolate;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--ui-sys-space-2);
      min-width: var(--_size);
      height: var(--_size);
      padding: 0 var(--_pad);
      border: none;
      border-radius: var(--_radius);
      background: var(--_bg);
      color: var(--_fg);
      font: var(--ui-sys-font-label);
      cursor: pointer;
      user-select: none;
      box-shadow: var(--ui-sys-elevation-3);
      transition: box-shadow var(--ui-sys-motion-emphasis),
                  background var(--ui-sys-motion-control);
      overflow: hidden;
      outline: none;
      white-space: nowrap;
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
    button:hover {
      box-shadow: var(--ui-sys-elevation-3);
    }
    button:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
    button:active::before { opacity: var(--ui-sys-state-pressed-opacity); }

    button:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    :host([disabled]) { pointer-events: none; }
    :host([disabled]) button {
      background: var(--ui-sys-surface-container);
      color: var(--ui-sys-on-surface-faint);
      box-shadow: var(--ui-sys-elevation-0);
      cursor: default;
    }

    .icon-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--_icon);
      height: var(--_icon);
    }

    ::slotted(svg),
    ::slotted(img) {
      display: block;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .label {
      display: none;
      font: var(--ui-sys-font-label);
      color: inherit;
    }
    :host([label]) .label { display: block; }

    /* extended FAB: auto width from content */
    :host([label]) button {
      min-width: 80px;
    }
  </style>
  <button part="button" type="button">
    <span class="icon-wrap" part="icon">
      <slot></slot>
    </span>
    <span class="label" part="label"></span>
  </button>
`;

class UiFab extends HTMLElement {
  static observedAttributes = ['variant', 'size', 'label', 'disabled', 'aria-label'];

  #btn;
  #labelEl;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#btn     = this.shadowRoot.querySelector('button');
    this.#labelEl = this.shadowRoot.querySelector('.label');
  }

  connectedCallback() {
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'primary');
    if (!this.hasAttribute('size'))    this.setAttribute('size', 'medium');
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    this.#btn.disabled = this.hasAttribute('disabled');

    // label
    const label = this.getAttribute('label') ?? '';
    this.#labelEl.textContent = label;

    // aria-label: prefer explicit, then fall back to label text
    const ariaLabel = this.getAttribute('aria-label') ?? label;
    if (ariaLabel) this.#btn.setAttribute('aria-label', ariaLabel);
  }
}

if (!customElements.get('ui-fab')) customElements.define('ui-fab', UiFab);
