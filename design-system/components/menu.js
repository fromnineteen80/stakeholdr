/* ============================================================================
 * <ui-menu> + <ui-menu-item> — action menu anchored to a trigger.
 *
 * Usage:
 *   <ui-menu anchor="my-btn">
 *     <ui-menu-item>
 *       <svg slot="icon">…</svg>
 *       Edit
 *     </ui-menu-item>
 *     <ui-menu-item disabled>Delete</ui-menu-item>
 *   </ui-menu>
 *   <ui-button id="my-btn">Open</ui-button>
 *
 * Attrs on <ui-menu>: anchor (id of trigger element), open
 * Attrs on <ui-menu-item>: disabled
 * Emits: ui-menu-select (composed:true, detail:{item}) from <ui-menu-item> click
 * ==========================================================================*/

/* ---- <ui-menu-item> ------------------------------------------------------- */

const itemTpl = document.createElement('template');
itemTpl.innerHTML = `
  <style>
    :host {
      display: block;
      outline: none;
    }
    .item {
      position: relative;
      isolation: isolate;
      display: flex;
      align-items: center;
      gap: var(--ui-sys-space-3);
      min-height: var(--ui-sys-control-height);
      padding: 0 var(--ui-sys-space-4);
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      cursor: pointer;
      user-select: none;
      transition: background var(--ui-sys-motion-control);
      outline: none;
    }
    .item::before {
      content: "";
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      pointer-events: none;
    }
    :host(:hover)  .item::before { opacity: var(--ui-sys-state-hover-opacity); }
    :host(:active) .item::before { opacity: var(--ui-sys-state-pressed-opacity); }
    :host(:focus-visible) .item {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: -2px;
    }
    :host([disabled]) {
      pointer-events: none;
    }
    :host([disabled]) .item {
      color: var(--ui-sys-on-surface-faint);
      cursor: default;
    }
    .icon {
      flex-shrink: 0;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--ui-sys-on-surface-muted);
    }
    :host([disabled]) .icon { color: var(--ui-sys-on-surface-faint); }
    ::slotted([slot="icon"]) {
      display: block;
      width: 18px;
      height: 18px;
    }
    .label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* hide icon container when no icon slotted */
    .icon:not(.has-icon) { display: none; }
  </style>
  <div class="item" part="item">
    <span class="icon" part="icon">
      <slot name="icon"></slot>
    </span>
    <span class="label" part="label"><slot></slot></span>
  </div>
`;

class UiMenuItem extends HTMLElement {
  static observedAttributes = ['disabled'];

  #iconSlot;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(itemTpl.content.cloneNode(true));
    this.#iconSlot = this.shadowRoot.querySelector('slot[name="icon"]');
  }

  connectedCallback() {
    this.setAttribute('role', 'menuitem');
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '-1');
    this.#iconSlot.addEventListener('slotchange', this.#onIconSlotChange);
    this.#onIconSlotChange();
    this.addEventListener('click', this.#onClick);
    this.addEventListener('keydown', this.#onKeydown);
  }

  disconnectedCallback() {
    this.#iconSlot.removeEventListener('slotchange', this.#onIconSlotChange);
    this.removeEventListener('click', this.#onClick);
    this.removeEventListener('keydown', this.#onKeydown);
  }

  attributeChangedCallback() {
    this.setAttribute('aria-disabled', String(this.hasAttribute('disabled')));
  }

  #onIconSlotChange = () => {
    const iconEl = this.shadowRoot.querySelector('.icon');
    const hasIcon = this.#iconSlot.assignedElements().length > 0;
    iconEl.classList.toggle('has-icon', hasIcon);
  };

  #onClick = () => {
    if (this.hasAttribute('disabled')) return;
    this.dispatchEvent(new CustomEvent('ui-menu-select', {
      bubbles: true,
      composed: true,
      detail: { item: this }
    }));
  };

  #onKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.#onClick(); }
  };
}

if (!customElements.get('ui-menu-item')) customElements.define('ui-menu-item', UiMenuItem);


/* ---- <ui-menu> ----------------------------------------------------------- */

const menuTpl = document.createElement('template');
menuTpl.innerHTML = `
  <style>
    :host {
      display: block;
      position: absolute;
      z-index: 9999;
    }
    :host(:not([open])) { display: none; }

    .surface {
      background: var(--ui-sys-surface-container-high);
      border-radius: var(--ui-sys-shape-control);
      box-shadow: var(--ui-sys-elevation-2);
      padding: var(--ui-sys-space-1) 0;
      min-width: 160px;
      max-height: 320px;
      overflow-y: auto;
      outline: none;
    }
  </style>
  <div class="surface" part="surface" role="menu" tabindex="-1">
    <slot></slot>
  </div>
`;

class UiMenu extends HTMLElement {
  static observedAttributes = ['anchor', 'open'];

  #surface;
  #anchorEl = null;
  #outsideHandler;
  #anchorClickHandler;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(menuTpl.content.cloneNode(true));
    this.#surface = this.shadowRoot.querySelector('.surface');
    this.#outsideHandler = this.#handleOutside.bind(this);
    this.#anchorClickHandler = () => this.open ? this.close() : this.show();
  }

  connectedCallback() {
    this.#surface.addEventListener('keydown', this.#handleListKey);
    this.addEventListener('ui-menu-select', () => this.close());
    this.#connectAnchor();
  }

  disconnectedCallback() {
    this.#surface.removeEventListener('keydown', this.#handleListKey);
    document.removeEventListener('pointerdown', this.#outsideHandler, true);
    this.#anchorEl?.removeEventListener('click', this.#anchorClickHandler);
  }

  attributeChangedCallback(name) {
    if (name === 'anchor') this.#connectAnchor();
    if (name === 'open') {
      const isOpen = this.hasAttribute('open');
      this.#surface.setAttribute('aria-hidden', String(!isOpen));
      if (isOpen) {
        this.#positionMenu();
        requestAnimationFrame(() => {
          const items = this.#items();
          (items[0] ?? this.#surface).focus();
        });
        document.addEventListener('pointerdown', this.#outsideHandler, true);
      } else {
        document.removeEventListener('pointerdown', this.#outsideHandler, true);
        this.#anchorEl?.focus();
      }
    }
  }

  get open() { return this.hasAttribute('open'); }

  show() {
    this.setAttribute('open', '');
    this.dispatchEvent(new CustomEvent('ui-menu-open', { bubbles: true, composed: true }));
  }

  close() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('ui-menu-close', { bubbles: true, composed: true }));
  }

  #connectAnchor() {
    this.#anchorEl?.removeEventListener('click', this.#anchorClickHandler);
    const id = this.getAttribute('anchor');
    if (id) {
      // Try to find within the same root, or fall back to document
      const root = this.getRootNode();
      this.#anchorEl = (root instanceof Document ? root : root).getElementById?.(id)
                    ?? document.getElementById(id);
      if (this.#anchorEl) {
        this.#anchorEl.setAttribute('aria-haspopup', 'menu');
        this.#anchorEl.setAttribute('aria-expanded', String(this.open));
        this.#anchorEl.addEventListener('click', this.#anchorClickHandler);
      }
    }
  }

  #items() {
    const slot = this.shadowRoot.querySelector('slot');
    return slot.assignedElements({ flatten: true })
      .filter(el => el.tagName === 'UI-MENU-ITEM' && !el.hasAttribute('disabled'));
  }

  #positionMenu() {
    if (!this.#anchorEl) return;
    const rect = this.#anchorEl.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    let top = rect.bottom + 4;
    // FLIP-UP: a menu anchored near the viewport bottom (e.g. the sidebar
    // identity footer) opens ABOVE its anchor instead of clipping offscreen —
    // measured after [open] applies, so offsetHeight is real.
    const h = this.offsetHeight || 0;
    if (h && top + h > window.innerHeight - 8 && rect.top - h - 4 >= 8) {
      top = rect.top - h - 4;
    }
    // HORIZONTAL CLAMP (Phase-15 visual gate — the vertical flip's mirror):
    // a menu anchored near the RIGHT viewport edge (e.g. the right-most
    // workHQ card's ignored-review button) shifts left instead of clipping.
    let left = rect.left;
    const w = this.offsetWidth || 0;
    if (w && left + w > window.innerWidth - 8) {
      left = Math.max(8, window.innerWidth - w - 8);
    }
    this.style.top  = `${top + scrollY}px`;
    this.style.left = `${left + scrollX}px`;
  }

  #handleListKey = (e) => {
    const items = this.#items();
    const active = items.find(el =>
      el === document.activeElement || el.contains(document.activeElement)
    );
    const idx = items.indexOf(active);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        items[Math.min(idx + 1, items.length - 1)]?.focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (idx <= 0) this.close();
        else items[idx - 1]?.focus();
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      case 'Tab':
        this.close();
        break;
    }
  };

  #handleOutside = (e) => {
    if (!this.open) return;
    if (!this.contains(e.target) && !this.shadowRoot.contains(e.target)
        && e.target !== this.#anchorEl && !this.#anchorEl?.contains(e.target)) {
      this.close();
    }
  };
}

if (!customElements.get('ui-menu')) customElements.define('ui-menu', UiMenu);
