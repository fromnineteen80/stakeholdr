/* ============================================================================
 * <ui-button> — the REFERENCE canonical component. Every other component is
 * built to this bar: real custom element, shadow DOM, real states + a11y,
 * styled ONLY by reading --ui-sys-* tokens. No external CSS, no hardcoded color.
 *
 * This file IS the component contract in code; manifest.json is its index entry.
 * To restyle: change tokens, never this file.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    /* Component reads ONLY --ui-sys-* tokens. No literal colors/sizes here
       except structural geometry that carries no brand opinion. */
    :host {
      display: inline-flex;
      vertical-align: middle;
      --_bg: transparent;
      --_fg: var(--ui-sys-on-surface);
      --_border: transparent;
    }
    :host([variant="filled"])  { --_bg: var(--ui-sys-primary);            --_fg: var(--ui-sys-on-primary); }
    :host([variant="tonal"])   { --_bg: var(--ui-sys-surface-container);  --_fg: var(--ui-sys-on-surface); }
    :host([variant="outlined"]){ --_bg: transparent; --_fg: var(--ui-sys-on-surface); --_border: var(--ui-sys-outline); }
    :host([variant="text"])    { --_bg: transparent; --_fg: var(--ui-sys-on-surface); }

    /* tone="danger" — destructive actions (the sealed btn-danger surfaces:
       delete stakeholder / confirm Delete). Orthogonal to variant; reads the
       --ui-sys-neg error tokens, never a literal color. */
    :host([tone="danger"][variant="filled"]) { --_bg: var(--ui-sys-neg); --_fg: var(--ui-sys-on-primary); }
    :host([tone="danger"][variant="tonal"]),
    :host([tone="danger"][variant="outlined"]),
    :host([tone="danger"][variant="text"])   { --_fg: var(--ui-sys-neg); }
    :host([tone="danger"][variant="outlined"]) { --_border: var(--ui-sys-neg-border-soft); }

    button {
      /* layout */
      appearance: none;
      position: relative;
      isolation: isolate;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--ui-sys-space-2);
      min-height: 36px;
      padding: 0 var(--ui-sys-space-4);
      border: 1px solid var(--_border);
      border-radius: var(--ui-sys-shape-control);
      background: var(--_bg);
      color: var(--_fg);
      font: var(--ui-sys-font-label);
      cursor: pointer;
      user-select: none;
      transition: background var(--ui-sys-motion-control),
                  border-color var(--ui-sys-motion-control);
      overflow: hidden;
    }

    /* state layer — opacity-driven, token-controlled */
    button::before {
      content: "";
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      z-index: -1;
    }
    button:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
    button:active::before { opacity: var(--ui-sys-state-pressed-opacity); }

    /* focus-visible ring — token-driven, accessible */
    button:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    :host([disabled]) { pointer-events: none; }
    :host([disabled]) button {
      color: var(--ui-sys-on-surface-faint);
      background: transparent;
      border-color: var(--ui-sys-on-surface-faint);
      cursor: default;
    }
    :host([disabled][variant="filled"]) button,
    :host([disabled][variant="tonal"]) button {
      background: var(--ui-sys-surface-container);
      border-color: transparent;
    }

    ::slotted([slot="leading"]) { display: inline-flex; width: 18px; height: 18px; }
  </style>
  <button part="button">
    <slot name="leading"></slot>
    <slot></slot>
  </button>
`;

class UiButton extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ['disabled', 'type'];

  #internals;
  #btn;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#internals = this.attachInternals?.();
    this.#btn = this.shadowRoot.querySelector('button');
  }

  connectedCallback() {
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'filled');
    this.#btn.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    this.#btn.removeEventListener('click', this.#onClick);
  }

  attributeChangedCallback() {
    this.#btn.disabled = this.hasAttribute('disabled');
  }

  /* Delegate programmatic focus to the real control (dialog focus pass etc.). */
  focus(options) { this.#btn.focus(options); }

  #onClick = () => {
    if (this.hasAttribute('disabled')) return;
    const type = this.getAttribute('type') || 'button';
    if (type !== 'button' && this.#internals?.form) {
      type === 'submit' ? this.#internals.form.requestSubmit() : this.#internals.form.reset();
    }
  };
}

customElements.define('ui-button', UiButton);
