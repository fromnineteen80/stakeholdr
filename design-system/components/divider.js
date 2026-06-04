/* ============================================================================
 * <ui-divider> — thin separator line.
 * Attrs: inset (adds leading indent), vertical (renders as a column rule).
 * Color: --ui-sys-divider. role=separator.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      --_thickness: 1px;
    }

    :host([vertical]) {
      display: inline-block;
      align-self: stretch;
    }

    hr {
      border: none;
      margin: 0;
      background: var(--ui-sys-divider);
    }

    /* Horizontal */
    :host(:not([vertical])) hr {
      height: var(--_thickness);
      width: 100%;
      margin-inline-start: 0;
    }

    :host(:not([vertical])[inset]) hr {
      margin-inline-start: var(--ui-sys-space-6);
    }

    /* Vertical */
    :host([vertical]) hr {
      width: var(--_thickness);
      height: 100%;
    }

    :host([vertical][inset]) hr {
      margin-block-start: var(--ui-sys-space-2);
    }
  </style>
  <hr role="separator" part="separator">
`;

class UiDivider extends HTMLElement {
  static observedAttributes = ['vertical'];

  #hr;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#hr = this.shadowRoot.querySelector('hr');
  }

  connectedCallback() {
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const vertical = this.hasAttribute('vertical');
    this.#hr.setAttribute('aria-orientation', vertical ? 'vertical' : 'horizontal');
  }
}

if (!customElements.get('ui-divider')) {
  customElements.define('ui-divider', UiDivider);
}
