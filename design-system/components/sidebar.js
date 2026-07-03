/* ============================================================================
 * <ui-sidebar> + <ui-sidebar-item> — collapsible left navigation.
 *
 * <ui-sidebar>
 *   attrs: collapsed (boolean)
 *   slots: brand (top, logo/name area), default (items), footer (bottom)
 *   emits: toggle { detail: { collapsed: Boolean } }
 *   Widths from --ui-sys-sidebar-width / --ui-sys-sidebar-width-collapsed (208/64 default).
 *   Animates width with --ui-sys-motion-emphasis.
 *
 * <ui-sidebar-item>
 *   attrs: active, href, disabled
 *   slots: icon (leading, always visible), default (label text)
 *   emits: ui-navigate { detail: { href } }   (composed, bubbles)
 *
 * HOW ITEM KNOWS IT IS COLLAPSED
 *   ui-sidebar's connectedCallback/attributeChangedCallback walks its
 *   light-DOM children and sets/removes the attribute `sidebar-collapsed`
 *   on every ui-sidebar-item it finds (including inside the footer slot).
 *   ui-sidebar-item's shadow style reacts to :host([sidebar-collapsed]).
 *   This is a one-way push (sidebar → items) that works reliably even when
 *   items are added dynamically (the sidebar uses a MutationObserver).
 *   No :host-context() hack needed; no shared CSS custom property trick.
 *
 * Style ONLY via --ui-sys-* tokens. No hardcoded colors or font families.
 * ==========================================================================*/

/* -------------------------------------------------------------------------- */
/* ui-sidebar-item                                                             */
/* -------------------------------------------------------------------------- */

const itemTemplate = document.createElement('template');
itemTemplate.innerHTML = `
  <style>
    :host {
      display: block;
      position: relative;
      box-sizing: border-box;
    }

    /* The interactive row: icon | label, separated by --ui-sys-space-2 */
    .item {
      position: relative;
      isolation: isolate;
      display: flex;
      align-items: center;
      gap: var(--ui-sys-space-2);
      width: 100%;
      min-height: var(--ui-sys-control-height);
      /* ONE VERTICAL AXIS (RULED): every icon centers on the collapsed-rail
         centerline. padding-left = axis - list-pad - icon/2, all token-derived. */
      padding: 0 var(--ui-sys-space-3) 0
        calc(var(--ui-sys-sidebar-width-collapsed, 64px) / 2
             - var(--ui-sys-space-3)
             - var(--ui-sys-icon-size-md) / 2);
      border-radius: var(--ui-sys-shape-pill);
      background: transparent;
      color: var(--ui-sys-on-surface);
      font: var(--ui-sys-font-label);
      cursor: pointer;
      user-select: none;
      text-decoration: none;
      box-sizing: border-box;
      border: none;
      outline: none;
      transition:
        background var(--ui-sys-motion-control),
        color var(--ui-sys-motion-control);
      -webkit-tap-highlight-color: transparent;
    }

    /* State layer */
    .item::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      z-index: -1;
    }
    .item:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
    .item:active::before { opacity: var(--ui-sys-state-pressed-opacity); }

    /* Focus ring */
    .item:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    /* Active state: pill background */
    :host([active]) .item {
      background: var(--ui-sys-primary-container);
      color: var(--ui-sys-on-primary-container);
    }

    /* Disabled */
    :host([disabled]) .item {
      pointer-events: none;
      color: var(--ui-sys-on-surface-faint);
      cursor: default;
    }

    /* Icon slot — sized via the icon-sizing tokens (never hardcoded px).
       The wrap matches the icon size so the glyph is identically sized and
       vertically aligned in both expanded and collapsed states; only its
       horizontal position changes (left-of-label vs centered). */
    .icon-wrap {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: var(--ui-sys-icon-size-md);
      height: var(--ui-sys-icon-size-md);
    }
    ::slotted([slot="icon"]) {
      display: inline-flex;
      width: var(--ui-sys-icon-size-md);
      height: var(--ui-sys-icon-size-md);
    }
    /* Inline SVGs passed directly into the icon slot conform to the token. */
    ::slotted(svg[slot="icon"]) {
      width: var(--ui-sys-icon-size-md);
      height: var(--ui-sys-icon-size-md);
    }

    /* Label */
    .label {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: opacity var(--ui-sys-motion-emphasis),
                  max-width var(--ui-sys-motion-emphasis);
      max-width: 200px;
      opacity: 1;
    }

    /* COLLAPSED: center icon, hide label */
    :host([sidebar-collapsed]) .item {
      justify-content: center;
      padding: 0;
      width: 40px;
      /* center the 40px box in the rail so the icon stays on the SAME axis */
      margin-left: auto;
      margin-right: auto;
      margin: 0 auto;
    }
    :host([sidebar-collapsed]) .label {
      max-width: 0;
      opacity: 0;
      overflow: hidden;
      pointer-events: none;
    }

    /* Tooltip (shown on hover/focus when collapsed) */
    .tooltip {
      position: absolute;
      left: calc(100% + var(--ui-sys-space-2));
      top: 50%;
      transform: translateY(-50%);
      background: var(--ui-sys-surface-container-highest);
      color: var(--ui-sys-on-surface);
      font: var(--ui-sys-font-caption);
      padding: var(--ui-sys-space-1) var(--ui-sys-space-3);
      border-radius: var(--ui-sys-shape-control);
      box-shadow: var(--ui-sys-elevation-2);
      white-space: nowrap;
      pointer-events: none;
      z-index: 100;
      /* hidden by default */
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--ui-sys-motion-control);
    }
    :host([sidebar-collapsed]) .item:hover  + .tooltip,
    :host([sidebar-collapsed]) .item:focus-visible + .tooltip {
      opacity: 1;
      visibility: visible;
    }
  </style>

  <a class="item" part="item" tabindex="0" role="listitem">
    <span class="icon-wrap"><slot name="icon"></slot></span>
    <span class="label" part="label"><slot></slot></span>
  </a>
  <span class="tooltip" part="tooltip" aria-hidden="true"></span>
`;

class UiSidebarItem extends HTMLElement {
  static observedAttributes = ['active', 'href', 'disabled', 'sidebar-collapsed'];

  #anchor;
  #tooltip;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(itemTemplate.content.cloneNode(true));
    this.#anchor = this.shadowRoot.querySelector('.item');
    this.#tooltip = this.shadowRoot.querySelector('.tooltip');
  }

  connectedCallback() {
    this.#syncAnchor();
    this.#syncActive();
    this.#syncTooltip();
    this.#anchor.addEventListener('click',   this.#onClick);
    this.#anchor.addEventListener('keydown', this.#onKeydown);
  }

  disconnectedCallback() {
    this.#anchor.removeEventListener('click',   this.#onClick);
    this.#anchor.removeEventListener('keydown', this.#onKeydown);
  }

  attributeChangedCallback(name) {
    if (name === 'href')    this.#syncAnchor();
    if (name === 'active')  this.#syncActive();
    if (name === 'sidebar-collapsed') this.#syncTooltip();
  }

  #syncAnchor() {
    const href = this.getAttribute('href');
    if (href) {
      this.#anchor.setAttribute('href', href);
      this.#anchor.setAttribute('role', 'link');
    } else {
      this.#anchor.removeAttribute('href');
      this.#anchor.setAttribute('role', 'listitem');
    }
  }

  #syncActive() {
    const active = this.hasAttribute('active');
    this.#anchor.setAttribute('aria-current', active ? 'page' : 'false');
  }

  #syncTooltip() {
    // Mirror the label text into the tooltip so it shows when collapsed.
    // We read the slot's assigned nodes' text.
    const label = this.#getLabelText();
    this.#tooltip.textContent = label;
  }

  #getLabelText() {
    const defaultSlot = this.shadowRoot.querySelector('slot:not([name])');
    if (!defaultSlot) return '';
    return defaultSlot.assignedNodes({ flatten: true })
      .map(n => n.textContent || '')
      .join('')
      .trim();
  }

  #onClick = (e) => {
    if (this.hasAttribute('disabled')) { e.preventDefault(); return; }
    const href = this.getAttribute('href');
    this.dispatchEvent(new CustomEvent('ui-navigate', {
      bubbles: true,
      composed: true,
      detail: { href: href || null },
    }));
  };

  #onKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.#anchor.click();
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.#focusNeighbor(1);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.#focusNeighbor(-1);
    }
  };

  #focusNeighbor(dir) {
    const sidebar = this.closest('ui-sidebar');
    if (!sidebar) return;
    const items = Array.from(sidebar.querySelectorAll('ui-sidebar-item:not([disabled])'));
    const idx = items.indexOf(this);
    const target = items[idx + dir];
    if (target) target.shadowRoot.querySelector('.item').focus();
  }
}

if (!customElements.get('ui-sidebar-item')) {
  customElements.define('ui-sidebar-item', UiSidebarItem);
}

/* -------------------------------------------------------------------------- */
/* ui-sidebar                                                                  */
/* -------------------------------------------------------------------------- */

const sidebarTemplate = document.createElement('template');
sidebarTemplate.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      background: var(--ui-sys-surface-container);
      border-right: 1px solid var(--ui-sys-outline-subtle);
      overflow: hidden;
      /* Animate width */
      width: var(--ui-sys-sidebar-width, clamp(208px, 18vw, 288px));
      min-width: 0;
      transition: width var(--ui-sys-motion-emphasis);
    }

    :host([collapsed]) {
      width: var(--ui-sys-sidebar-width-collapsed, 64px);
    }

    /* Header: brand + toggle button */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: var(--ui-sys-space-3) var(--ui-sys-space-3);
      min-height: 56px;
      flex-shrink: 0;
      gap: var(--ui-sys-space-2);
      overflow: hidden;
    }

    .brand-wrap {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      transition: opacity var(--ui-sys-motion-emphasis),
                  max-width var(--ui-sys-motion-emphasis);
      max-width: 200px;
      opacity: 1;
    }
    :host([collapsed]) .brand-wrap {
      max-width: 0;
      opacity: 0;
      pointer-events: none;
    }

    /* Toggle button */
    .toggle-btn {
      position: relative;
      isolation: isolate;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: var(--ui-sys-shape-pill);
      border: none;
      background: transparent;
      color: var(--ui-sys-on-surface-muted);
      cursor: pointer;
      font-size: 16px;
      line-height: 1;
      transition: color var(--ui-sys-motion-control);
      /* keep the button accessible when brand text is hidden */
    }
    /* Hover shown by INK, never a background (start-state design rule). */
    .toggle-btn:hover  { color: var(--ui-sys-on-surface); }
    .toggle-btn:active { color: var(--ui-sys-on-surface); }
    .toggle-btn:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    /* Panel toggle glyphs (Material Symbols ligatures; the document loads the
       font — same pattern as ui-icon). The edge-chevron is RETIRED (RULED). */
    .toggle-icon {
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: var(--ui-sys-icon-size-md, 20px);
      line-height: 1;
      letter-spacing: normal;
      white-space: nowrap;
      display: block;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      user-select: none;
    }
    .ti-open { display: none; }
    :host([collapsed]) .ti-close { display: none; }
    :host([collapsed]) .ti-open  { display: block; }
    :host([collapsed]) .header {
      justify-content: center;
      padding-left: 0;
      padding-right: 0;
    }

    /* Nav list */
    .nav-list {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: var(--ui-sys-space-2) var(--ui-sys-space-3);
      display: flex;
      flex-direction: column;
      gap: var(--ui-sys-space-1);
      box-sizing: border-box;
    }
    :host([collapsed]) .nav-list {
      padding: var(--ui-sys-space-2) var(--ui-sys-space-2);
    }

    /* Footer slot */
    .nav-footer {
      padding: var(--ui-sys-space-2) var(--ui-sys-space-3);
      flex-shrink: 0;
      border-top: 1px solid var(--ui-sys-outline-subtle);
      box-sizing: border-box;
    }
    :host([collapsed]) .nav-footer {
      padding: var(--ui-sys-space-2) var(--ui-sys-space-2);
    }
  </style>

  <nav role="navigation" aria-label="Main navigation"
       style="display:contents">
    <div class="header" part="header">
      <div class="brand-wrap">
        <slot name="brand"></slot>
      </div>
      <button class="toggle-btn" part="toggle" aria-label="Toggle navigation">
        <span class="toggle-icon ti-close" aria-hidden="true">left_panel_close</span>
        <span class="toggle-icon ti-open" aria-hidden="true">left_panel_open</span>
      </button>
    </div>

    <div class="nav-list" part="list" role="list">
      <slot></slot>
    </div>

    <div class="nav-footer" part="footer">
      <slot name="footer"></slot>
    </div>
  </nav>
`;

class UiSidebar extends HTMLElement {
  static observedAttributes = ['collapsed'];

  #toggleBtn;
  #mutationObserver;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(sidebarTemplate.content.cloneNode(true));
    this.#toggleBtn = this.shadowRoot.querySelector('.toggle-btn');
  }

  connectedCallback() {
    this.#toggleBtn.addEventListener('click', this.#onToggle);
    // Push initial collapsed state to items.
    this.#syncItemsCollapsed();
    // Watch for items added later.
    this.#mutationObserver = new MutationObserver(() => this.#syncItemsCollapsed());
    this.#mutationObserver.observe(this, { childList: true, subtree: true });
  }

  disconnectedCallback() {
    this.#toggleBtn.removeEventListener('click', this.#onToggle);
    this.#mutationObserver && this.#mutationObserver.disconnect();
  }

  attributeChangedCallback(name) {
    if (name === 'collapsed') {
      this.#syncItemsCollapsed();
      const collapsed = this.hasAttribute('collapsed');
      this.#toggleBtn.setAttribute('aria-label',
        collapsed ? 'Expand navigation' : 'Collapse navigation');
    }
  }

  get collapsed() { return this.hasAttribute('collapsed'); }
  set collapsed(v) { this.toggleAttribute('collapsed', Boolean(v)); }

  #onToggle = () => {
    const next = !this.hasAttribute('collapsed');
    this.toggleAttribute('collapsed', next);
    this.dispatchEvent(new CustomEvent('toggle', {
      bubbles: true,
      composed: true,
      detail: { collapsed: next },
    }));
  };

  /** Push the sidebar's collapsed state down to every ui-sidebar-item. */
  #syncItemsCollapsed() {
    const collapsed = this.hasAttribute('collapsed');
    const items = this.querySelectorAll('ui-sidebar-item');
    for (const item of items) {
      item.toggleAttribute('sidebar-collapsed', collapsed);
    }
  }
}

if (!customElements.get('ui-sidebar')) {
  customElements.define('ui-sidebar', UiSidebar);
}
