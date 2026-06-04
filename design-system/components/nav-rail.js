/* ============================================================================
 * <ui-nav-rail> — vertical side navigation rail (desktop).
 * <ui-nav-item> — individual destination within the rail.
 * category: gapFill
 *
 * <ui-nav-rail>
 *   Slot default — ui-nav-item children
 *   role=navigation
 *
 * <ui-nav-item>
 *   Slots: icon (leading icon), label (text label)
 *   Attrs: active (bool), href (string)
 *   Active state: --ui-sys-primary-container pill behind icon
 *   Emits: navigate {detail: {href}} on the rail (composed:true)
 *   role=listitem; aria-current="page" when active
 * ==========================================================================*/

/* ---- ui-nav-item ---- */
const itemTemplate = document.createElement('template');
itemTemplate.innerHTML = `
  <style>
    :host {
      display: block;
    }

    a, [part="item"] {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--ui-sys-space-1);
      padding: var(--ui-sys-space-2) var(--ui-sys-space-2);
      cursor: pointer;
      text-decoration: none;
      color: var(--ui-sys-on-surface-muted);
      font: var(--ui-sys-font-caption);
      user-select: none;
      outline: none;
      position: relative;
      min-width: 72px;
    }
    a:focus-visible [part="indicator"],
    [part="item"]:focus-visible [part="indicator"] {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    [part="indicator"] {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
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
    a:hover [part="indicator"]::before,
    [part="item"]:hover [part="indicator"]::before {
      opacity: var(--ui-sys-state-hover-opacity);
    }
    a:active [part="indicator"]::before,
    [part="item"]:active [part="indicator"]::before {
      opacity: var(--ui-sys-state-pressed-opacity);
    }

    :host([active]) [part="indicator"] {
      background: var(--ui-sys-primary-container);
    }
    :host([active]) a,
    :host([active]) [part="item"] {
      color: var(--ui-sys-on-primary-container);
    }

    [part="label"] {
      font: var(--ui-sys-font-caption);
      color: inherit;
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

class UiNavItem extends HTMLElement {
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
    const href = this.getAttribute('href');

    // Swap inner element to <a> if href present
    const current = this.#root.querySelector('[part="item"]');
    const isAnchor = current?.tagName === 'A';
    if (href && !isAnchor) {
      const a = document.createElement('a');
      a.setAttribute('part', 'item');
      a.setAttribute('role', 'listitem');
      // move children
      while (current.firstChild) a.appendChild(current.firstChild);
      current.replaceWith(a);
      this.#item = a;
      a.addEventListener('click', this.#onClick);
      a.addEventListener('keydown', this.#onKeydown);
    } else if (!href && isAnchor) {
      const div = document.createElement('div');
      div.setAttribute('part', 'item');
      div.setAttribute('tabindex', '0');
      div.setAttribute('role', 'listitem');
      while (current.firstChild) div.appendChild(current.firstChild);
      current.replaceWith(div);
      this.#item = div;
      div.addEventListener('click', this.#onClick);
      div.addEventListener('keydown', this.#onKeydown);
    }

    if (href) this.#item.href = href;

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
      detail: { href: this.getAttribute('href') }
    }));
  };

  #onKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.#onClick(e);
    }
  };
}

if (!customElements.get('ui-nav-item')) {
  customElements.define('ui-nav-item', UiNavItem);
}

/* ---- ui-nav-rail ---- */
const railTemplate = document.createElement('template');
railTemplate.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      width: 80px;
      background: var(--ui-sys-surface-container);
      border-right: 1px solid var(--ui-sys-outline-subtle);
      overflow-y: auto;
      overflow-x: hidden;
    }

    [part="list"] {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--ui-sys-space-1);
      padding: var(--ui-sys-space-2) 0;
      list-style: none;
      margin: 0;
    }
  </style>
  <nav part="rail" role="navigation">
    <ul part="list" role="list">
      <slot></slot>
    </ul>
  </nav>
`;

class UiNavRail extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(railTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    if (!this.hasAttribute('aria-label')) this.setAttribute('aria-label', 'Main navigation');
    this.addEventListener('navigate', this.#onNavigate);
  }

  disconnectedCallback() {
    this.removeEventListener('navigate', this.#onNavigate);
  }

  #onNavigate = (e) => {
    // Re-emit from the rail so parent can listen once
    this.dispatchEvent(new CustomEvent('navigate', {
      bubbles: true,
      composed: true,
      detail: e.detail
    }));
  };
}

if (!customElements.get('ui-nav-rail')) {
  customElements.define('ui-nav-rail', UiNavRail);
}
