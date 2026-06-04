/* ============================================================================
 * <ui-tabs> + <ui-tab> — tab bar with animated indicator.
 * ui-tab attrs: active, disabled. Label via text content.
 * Emits `change` (detail: { index }) on the ui-tabs host.
 * ARIA role=tablist / tab / tabpanel linkage. Arrow-key nav.
 * ==========================================================================*/

/* ---- <ui-tab> ----------------------------------------------------------- */

const tabTemplate = document.createElement('template');
tabTemplate.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      position: relative;
    }

    button {
      appearance: none;
      position: relative;
      isolation: isolate;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      height: var(--ui-sys-control-height);
      padding: 0 var(--ui-sys-space-4);
      border: none;
      background: transparent;
      color: var(--ui-sys-on-surface-muted);
      font: var(--ui-sys-font-label);
      cursor: pointer;
      user-select: none;
      white-space: nowrap;
      transition: color var(--ui-sys-motion-control);
      overflow: hidden;
    }

    /* state layer */
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

    button:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: -2px;
    }

    :host([active]) button {
      color: var(--ui-sys-on-surface);
    }

    :host([disabled]) {
      pointer-events: none;
    }
    :host([disabled]) button {
      color: var(--ui-sys-on-surface-faint);
      cursor: default;
    }

    /* Active indicator bar — positioned by parent ui-tabs via CSS vars */
    .indicator {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: var(--ui-sys-primary);
      border-radius: 1px 1px 0 0;
      opacity: 0;
      transform: scaleX(0.4);
      transition: opacity var(--ui-sys-motion-emphasis),
                  transform var(--ui-sys-motion-emphasis);
    }

    :host([active]) .indicator {
      opacity: 1;
      transform: scaleX(1);
    }
  </style>
  <button role="tab" part="tab">
    <slot></slot>
  </button>
  <div class="indicator" part="indicator"></div>
`;

class UiTab extends HTMLElement {
  static observedAttributes = ['active', 'disabled'];

  #btn;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(tabTemplate.content.cloneNode(true));
    this.#btn = this.shadowRoot.querySelector('button');
  }

  connectedCallback() {
    this.#sync();
    this.#btn.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    this.#btn.removeEventListener('click', this.#onClick);
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const active = this.hasAttribute('active');
    const disabled = this.hasAttribute('disabled');
    this.#btn.setAttribute('aria-selected', String(active));
    this.#btn.setAttribute('tabindex', active ? '0' : '-1');
    this.#btn.disabled = disabled;
    if (disabled) this.#btn.setAttribute('aria-disabled', 'true');
    else this.#btn.removeAttribute('aria-disabled');
  }

  #onClick = () => {
    if (this.hasAttribute('disabled')) return;
    this.dispatchEvent(new CustomEvent('ui-tab-click', { bubbles: true, composed: true }));
  };

  focus() {
    this.#btn.focus();
  }
}

if (!customElements.get('ui-tab')) {
  customElements.define('ui-tab', UiTab);
}

/* ---- <ui-tabs> ---------------------------------------------------------- */

const tabsTemplate = document.createElement('template');
tabsTemplate.innerHTML = `
  <style>
    :host {
      display: block;
    }

    .tablist {
      display: flex;
      align-items: stretch;
      border-bottom: 1px solid var(--ui-sys-divider);
      overflow-x: auto;
      scrollbar-width: none;
    }
    .tablist::-webkit-scrollbar { display: none; }
  </style>
  <div class="tablist" role="tablist" part="tablist">
    <slot></slot>
  </div>
`;

class UiTabs extends HTMLElement {
  #slot;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(tabsTemplate.content.cloneNode(true));
    this.#slot = this.shadowRoot.querySelector('slot');
  }

  connectedCallback() {
    this.addEventListener('ui-tab-click', this.#onTabClick);
    this.addEventListener('keydown', this.#onKeyDown);
    this.#slot.addEventListener('slotchange', this.#onSlotChange);
    this.#onSlotChange();
  }

  disconnectedCallback() {
    this.removeEventListener('ui-tab-click', this.#onTabClick);
    this.removeEventListener('keydown', this.#onKeyDown);
    this.#slot.removeEventListener('slotchange', this.#onSlotChange);
  }

  #getTabs() {
    return Array.from(this.querySelectorAll('ui-tab'));
  }

  #onSlotChange = () => {
    const tabs = this.#getTabs();
    // Ensure exactly one active tab
    const active = tabs.find(t => t.hasAttribute('active'));
    if (!active && tabs.length) {
      tabs[0].setAttribute('active', '');
    }
    // Set tabpanel IDs
    tabs.forEach((tab, i) => {
      const id = tab.id || `ui-tab-${i}-${Math.random().toString(36).slice(2, 7)}`;
      tab.id = id;
      tab.shadowRoot?.querySelector('button')?.setAttribute('id', `${id}-btn`);
    });
  };

  #onTabClick = (e) => {
    const tab = e.target.closest('ui-tab');
    if (!tab) return;
    this.#activate(tab);
  };

  #activate(tab) {
    const tabs = this.#getTabs();
    const index = tabs.indexOf(tab);
    if (index === -1 || tab.hasAttribute('disabled')) return;
    tabs.forEach((t, i) => {
      if (i === index) t.setAttribute('active', '');
      else t.removeAttribute('active');
    });
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true,
      composed: true,
      detail: { index, tab }
    }));
  }

  #onKeyDown = (e) => {
    const tabs = this.#getTabs().filter(t => !t.hasAttribute('disabled'));
    if (!tabs.length) return;
    const active = tabs.find(t => t.hasAttribute('active')) || tabs[0];
    const idx = tabs.indexOf(active);
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(idx + 1) % tabs.length];
    else if (e.key === 'ArrowLeft') next = tabs[(idx - 1 + tabs.length) % tabs.length];
    else if (e.key === 'Home') next = tabs[0];
    else if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) {
      e.preventDefault();
      this.#activate(next);
      next.focus();
    }
  };
}

if (!customElements.get('ui-tabs')) {
  customElements.define('ui-tabs', UiTabs);
}
