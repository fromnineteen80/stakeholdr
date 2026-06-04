/* ============================================================================
 * <ui-bottom-bar> — mobile bottom navigation bar.
 * <ui-bottom-item> — individual destination tab.
 * category: gapFill / MOBILE
 *
 * <ui-bottom-bar>
 *   Slot default — 3–5 ui-bottom-item children
 *   role=navigation; fixed to bottom of viewport
 *   Background: --ui-sys-surface-container
 *   Top border: --ui-sys-outline-subtle
 *   Emits: navigate (composed, bubbles) with {detail: {href, index}}
 *
 * <ui-bottom-item>
 *   Slots: icon, label
 *   Attrs: active (bool), href (string), index (int, set by bar)
 *   Active: --ui-sys-primary-container pill indicator behind icon;
 *           icon + label → --ui-sys-primary color
 *   aria-current="page" on active item
 * ==========================================================================*/

/* ---- ui-bottom-item ---- */
const itemTemplate = document.createElement('template');
itemTemplate.innerHTML = `
  <style>
    :host {
      display: flex;
      flex: 1 1 0;
      min-width: 0;
    }

    [part="item"] {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--ui-sys-space-1);
      padding: var(--ui-sys-space-2) var(--ui-sys-space-1);
      cursor: pointer;
      text-decoration: none;
      color: var(--ui-sys-on-surface-muted);
      font: var(--ui-sys-font-caption);
      user-select: none;
      outline: none;
      position: relative;
      -webkit-tap-highlight-color: transparent;
    }

    [part="indicator"] {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 32px;
      border-radius: var(--ui-sys-shape-pill);
      background: transparent;
      transition: background var(--ui-sys-motion-control);
    }

    /* state layer */
    [part="indicator"]::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
    }
    [part="item"]:hover [part="indicator"]::before {
      opacity: var(--ui-sys-state-hover-opacity);
    }
    [part="item"]:active [part="indicator"]::before {
      opacity: var(--ui-sys-state-pressed-opacity);
    }

    :host([active]) [part="indicator"] {
      background: var(--ui-sys-primary-container);
    }
    :host([active]) [part="item"] {
      color: var(--ui-sys-on-primary-container);
    }

    [part="item"]:focus-visible [part="indicator"] {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    [part="label"] {
      font: var(--ui-sys-font-caption);
      color: inherit;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }

    ::slotted([slot="icon"]) {
      width: 22px;
      height: 22px;
      display: inline-flex;
      flex-shrink: 0;
    }
  </style>
  <div part="item" tabindex="0" role="listitem">
    <span part="indicator"><slot name="icon"></slot></span>
    <span part="label"><slot name="label"></slot></span>
  </div>
`;

class UiBottomItem extends HTMLElement {
  static observedAttributes = ['active', 'href'];

  #root;
  #item;

  constructor() {
    super();
    this.#root = this.attachShadow({ mode: 'open' });
    this.#root.appendChild(itemTemplate.content.cloneNode(true));
    this.#item = this.#root.querySelector('[part="item"]');
  }

  connectedCallback() {
    this.#render();
    this.#item.addEventListener('click', this.#onClick);
    this.#item.addEventListener('keydown', this.#onKeydown);
  }

  disconnectedCallback() {
    this.#item.removeEventListener('click', this.#onClick);
    this.#item.removeEventListener('keydown', this.#onKeydown);
  }

  attributeChangedCallback() {
    this.#render();
  }

  #render() {
    const active = this.hasAttribute('active');
    if (active) {
      this.#item.setAttribute('aria-current', 'page');
    } else {
      this.#item.removeAttribute('aria-current');
    }
  }

  #onClick = (e) => {
    e.preventDefault();
    this.dispatchEvent(new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      detail: {
        href:  this.getAttribute('href'),
        index: this.hasAttribute('index') ? Number(this.getAttribute('index')) : undefined
      }
    }));
  };

  #onKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.#onClick(e);
    }
  };
}

if (!customElements.get('ui-bottom-item')) {
  customElements.define('ui-bottom-item', UiBottomItem);
}

/* ---- ui-bottom-bar ---- */
const barTemplate = document.createElement('template');
barTemplate.innerHTML = `
  <style>
    :host {
      display: block;
      background: var(--ui-sys-surface-container);
      border-top: 1px solid var(--ui-sys-outline-subtle);
    }

    [part="list"] {
      display: flex;
      flex-direction: row;
      align-items: stretch;
      list-style: none;
      margin: 0;
      padding: 0;
      padding-bottom: env(safe-area-inset-bottom, 0px);
    }
  </style>
  <nav role="navigation" aria-label="Bottom navigation">
    <ul part="list" role="list">
      <slot></slot>
    </ul>
  </nav>
`;

class UiBottomBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(barTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    // stamp index attrs onto items
    this.#indexItems();
    // observe slot changes
    this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.#indexItems);
    this.addEventListener('navigate', this.#onNavigate);
  }

  disconnectedCallback() {
    this.shadowRoot.querySelector('slot').removeEventListener('slotchange', this.#indexItems);
    this.removeEventListener('navigate', this.#onNavigate);
  }

  #indexItems = () => {
    const items = this.querySelectorAll('ui-bottom-item');
    items.forEach((item, i) => item.setAttribute('index', i));
  };

  #onNavigate = (e) => {
    this.dispatchEvent(new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      detail: e.detail
    }));
  };
}

if (!customElements.get('ui-bottom-bar')) {
  customElements.define('ui-bottom-bar', UiBottomBar);
}
