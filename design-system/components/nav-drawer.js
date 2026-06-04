/* ============================================================================
 * <ui-nav-drawer> — slide-in navigation drawer.
 * category: gapFill
 *
 * Attributes:
 *   open    (bool) — visible / hidden
 *   modal   (bool) — when set: scrim overlay + elevation-3; Esc closes
 *
 * Slot default — nav items, headings, dividers, etc.
 *
 * Methods: toggle()
 * Events:  close  (bubbles, composed)
 *
 * role=navigation (non-modal), role=dialog (modal)
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: contents;
    }

    [part="scrim"] {
      position: fixed;
      inset: 0;
      background: var(--ui-sys-scrim);
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--ui-sys-motion-emphasis);
      z-index: 100;
    }
    :host([open][modal]) [part="scrim"] {
      opacity: 1;
      pointer-events: auto;
    }

    [part="drawer"] {
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 280px;
      max-width: 85vw;
      background: var(--ui-sys-surface-card);
      border-right: 1px solid var(--ui-sys-outline-subtle);
      overflow-y: auto;
      overflow-x: hidden;
      transform: translateX(-100%);
      transition: transform var(--ui-sys-motion-emphasis),
                  box-shadow var(--ui-sys-motion-emphasis);
      z-index: 101;
      outline: none;
      padding: var(--ui-sys-space-2) 0;
    }

    :host([open]) [part="drawer"] {
      transform: translateX(0);
    }
    :host([open][modal]) [part="drawer"] {
      box-shadow: var(--ui-sys-elevation-3);
    }

    [part="drawer"]:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: -2px;
    }
  </style>
  <div part="scrim" aria-hidden="true"></div>
  <div part="drawer" tabindex="-1">
    <slot></slot>
  </div>
`;

class UiNavDrawer extends HTMLElement {
  static observedAttributes = ['open', 'modal'];

  #drawer;
  #scrim;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#drawer = this.shadowRoot.querySelector('[part="drawer"]');
    this.#scrim  = this.shadowRoot.querySelector('[part="scrim"]');
  }

  connectedCallback() {
    this.#updateRole();
    this.#scrim.addEventListener('click', this.#onScrimClick);
    document.addEventListener('keydown', this.#onKeydown);
  }

  disconnectedCallback() {
    this.#scrim.removeEventListener('click', this.#onScrimClick);
    document.removeEventListener('keydown', this.#onKeydown);
  }

  attributeChangedCallback() {
    this.#updateRole();
    if (this.hasAttribute('open') && this.hasAttribute('modal')) {
      // Focus trap: move focus into drawer on open
      requestAnimationFrame(() => this.#drawer.focus());
    }
  }

  #updateRole() {
    const modal = this.hasAttribute('modal');
    this.#drawer.setAttribute('role', modal ? 'dialog' : 'navigation');
    if (modal) {
      this.#drawer.setAttribute('aria-modal', 'true');
      if (!this.#drawer.hasAttribute('aria-label')) {
        this.#drawer.setAttribute('aria-label', 'Navigation menu');
      }
    } else {
      this.#drawer.removeAttribute('aria-modal');
    }
  }

  #onScrimClick = () => {
    this.close();
  };

  #onKeydown = (e) => {
    if (e.key === 'Escape' && this.hasAttribute('open')) {
      e.preventDefault();
      this.close();
    }
  };

  toggle() {
    if (this.hasAttribute('open')) {
      this.close();
    } else {
      this.setAttribute('open', '');
    }
  }

  close() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }
}

if (!customElements.get('ui-nav-drawer')) {
  customElements.define('ui-nav-drawer', UiNavDrawer);
}
