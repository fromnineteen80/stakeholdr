/* ============================================================================
 * <ui-inspector> — right-hand detail / inspector panel.
 *
 * attrs: open (boolean) — present = panel visible; absent = collapsed to 0.
 * slots: title (header text), default (content), actions (header right side)
 * emits: close { detail: {} }   (composed, bubbles)
 *
 * Width: 320px when open; 0 with display:none when closed.
 * Background: --ui-sys-surface-card. Left border: --ui-sys-outline-subtle.
 * Header uses --ui-sys-font-title. Content scrolls.
 * role=complementary, aria-label reflects the title slot's text.
 *
 * Style ONLY via --ui-sys-* tokens. No hardcoded colors or font families.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      width: 320px;
      height: 100%;
      box-sizing: border-box;
      background: var(--ui-sys-surface-card);
      border-left: 1px solid var(--ui-sys-outline-subtle);
      box-shadow: var(--ui-sys-elevation-1);
      overflow: hidden;
      /* Animate width open/close */
      transition: width var(--ui-sys-motion-emphasis);
      min-width: 0;
    }

    :host(:not([open])) {
      width: 0;
      border-left-width: 0;
      pointer-events: none;
      visibility: hidden;
    }

    /* Header bar */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ui-sys-space-3);
      padding: var(--ui-sys-space-3) var(--ui-sys-space-4);
      min-height: 52px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--ui-sys-outline-subtle);
      box-sizing: border-box;
      overflow: hidden;
    }

    .title-wrap {
      flex: 1;
      min-width: 0;
      font: var(--ui-sys-font-title);
      color: var(--ui-sys-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Actions slot (right side of header, e.g. extra icon buttons) */
    .actions-wrap {
      display: inline-flex;
      align-items: center;
      gap: var(--ui-sys-space-2);
      flex-shrink: 0;
    }

    /* Close button */
    .close-btn {
      position: relative;
      isolation: isolate;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: var(--ui-sys-shape-pill);
      border: none;
      background: transparent;
      color: var(--ui-sys-on-surface-muted);
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      transition: color var(--ui-sys-motion-control);
      padding: 0;
    }
    .close-btn::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      z-index: -1;
    }
    .close-btn:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
    .close-btn:active::before { opacity: var(--ui-sys-state-pressed-opacity); }
    .close-btn:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    /* Scrolling content area */
    .content {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: var(--ui-sys-space-4);
      box-sizing: border-box;
      min-height: 0;
    }
  </style>

  <aside role="complementary" aria-label="Inspector" style="display:contents">
    <div class="header" part="header">
      <div class="title-wrap" part="title">
        <slot name="title"></slot>
      </div>
      <div class="actions-wrap">
        <slot name="actions"></slot>
      </div>
      <button class="close-btn" part="close" aria-label="Close inspector">
        &#x2715;
      </button>
    </div>

    <div class="content" part="content">
      <slot></slot>
    </div>
  </aside>
`;

class UiInspector extends HTMLElement {
  static observedAttributes = ['open'];

  #closeBtn;
  #titleSlot;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#closeBtn = this.shadowRoot.querySelector('.close-btn');
    this.#titleSlot = this.shadowRoot.querySelector('slot[name="title"]');
  }

  connectedCallback() {
    this.#closeBtn.addEventListener('click', this.#onClose);
    this.#titleSlot.addEventListener('slotchange', this.#syncAriaLabel);
    // Set initial aria role on the aside
    this.#syncAriaLabel();
  }

  disconnectedCallback() {
    this.#closeBtn.removeEventListener('click', this.#onClose);
    this.#titleSlot.removeEventListener('slotchange', this.#syncAriaLabel);
  }

  attributeChangedCallback() {
    // Nothing to do beyond CSS :host([open]) which handles visibility.
    // aria-hidden mirrors open state for assistive tech.
    const aside = this.shadowRoot.querySelector('aside');
    if (aside) {
      aside.setAttribute('aria-hidden', String(!this.hasAttribute('open')));
    }
  }

  get open() { return this.hasAttribute('open'); }
  set open(v) { this.toggleAttribute('open', Boolean(v)); }

  #onClose = () => {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('close', {
      bubbles: true,
      composed: true,
      detail: {},
    }));
  };

  #syncAriaLabel = () => {
    const text = this.#titleSlot
      .assignedNodes({ flatten: true })
      .map(n => n.textContent || '')
      .join('')
      .trim();
    const aside = this.shadowRoot.querySelector('aside');
    if (aside && text) {
      aside.setAttribute('aria-label', text);
    }
  };
}

if (!customElements.get('ui-inspector')) {
  customElements.define('ui-inspector', UiInspector);
}
