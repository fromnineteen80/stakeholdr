/* ============================================================================
 * <ui-app-shell> — CSS-grid application layout host.
 *
 * Slots: header (top bar, full-width), nav (left rail), default/main (content),
 *        aside (right panel), footer (bottom bar, full-width).
 *
 * Tracks for nav/header/aside/footer are dropped automatically when those slots
 * have no assigned nodes (via slotchange listeners toggling data-attributes on
 * the host, then CSS :host([...]) rules collapse the tracks to 0).
 *
 * variant="record" — the RECORD-PAGE grid (sealed Record-scaffold box: static
 * top bar full-width ABOVE the 3-region body, pinned footer full-width BELOW
 * it; the section rail never spans the top bar). Default (no variant) keeps
 * the ruled Claude form factor: the nav rail full-height beside header/footer.
 *
 * Style ONLY via --ui-sys-* tokens. No hardcoded colors or font families.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: grid;
      width: 100%;
      height: 100%;
      min-height: 0;
      /* Default grid: header / (nav | main | aside) / footer
         Row tracks: auto for header/footer (collapse to 0 when empty).
         Column tracks: auto for nav/aside (collapse to 0 when empty). */
      /* Claude form factor (RULED 2026-07-03): the nav rail is FULL-HEIGHT and
         static; header/footer belong to the content area, never above the rail. */
      grid-template-areas:
        "nav header header"
        "nav main   aside"
        "nav footer footer";
      grid-template-rows:    auto 1fr auto;
      grid-template-columns: auto 1fr auto;
      background: var(--ui-sys-surface);
      overflow: hidden;
    }

    /* Collapse empty header / footer rows */
    :host([no-header]) {
      grid-template-areas:
        "nav main   aside"
        "nav footer footer";
      grid-template-rows: 1fr auto;
    }
    :host([no-footer]) {
      grid-template-areas:
        "nav header header"
        "nav main   aside";
      grid-template-rows: auto 1fr;
    }
    :host([no-header][no-footer]) {
      grid-template-areas: "nav main aside";
      grid-template-rows: 1fr;
    }

    /* variant="record": header and footer span FULL WIDTH; the nav rail and
       aside sit inside the middle body row only (sealed record-page order:
       top bar → 3-region body → pinned footer). */
    :host([variant="record"]) {
      grid-template-areas:
        "header header header"
        "nav    main   aside"
        "footer footer footer";
    }
    :host([variant="record"][no-header]) {
      grid-template-areas:
        "nav    main   aside"
        "footer footer footer";
      grid-template-rows: 1fr auto;
    }
    :host([variant="record"][no-footer]) {
      grid-template-areas:
        "header header header"
        "nav    main   aside";
      grid-template-rows: auto 1fr;
    }
    :host([variant="record"][no-header][no-footer]) {
      grid-template-areas: "nav main aside";
      grid-template-rows: 1fr;
    }

    /* Collapse empty nav / aside columns */
    :host([no-nav]) {
      grid-template-columns: 0 1fr auto;
    }
    :host([no-aside]) {
      grid-template-columns: auto 1fr 0;
    }
    :host([no-nav][no-aside]) {
      grid-template-columns: 0 1fr 0;
    }

    /* Slot wrappers */
    .slot-header {
      grid-area: header;
      display: contents;
    }
    .slot-nav {
      grid-area: nav;
      display: contents;
    }
    .slot-aside {
      grid-area: aside;
      display: contents;
    }
    .slot-footer {
      grid-area: footer;
      display: contents;
    }

    /* Main scrolling region */
    .main {
      grid-area: main;
      overflow: auto;
      min-width: 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
    }

    /* Named slot containers participate in grid directly */
    ::slotted([slot="header"]) {
      grid-area: header;
    }
    ::slotted([slot="nav"]) {
      grid-area: nav;
    }
    ::slotted([slot="aside"]) {
      grid-area: aside;
    }
    ::slotted([slot="footer"]) {
      grid-area: footer;
    }
  </style>

  <slot name="header"></slot>
  <slot name="nav"></slot>
  <div class="main" part="main">
    <slot></slot>
  </div>
  <slot name="aside"></slot>
  <slot name="footer"></slot>
`;

class UiAppShell extends HTMLElement {
  static observedAttributes = [];

  #slotWatchers = [];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    // Watch each named slot; toggle a host attr so CSS can collapse the track.
    const watchSlot = (slotName, attr) => {
      const slot = this.shadowRoot.querySelector(`slot[name="${slotName}"]`);
      if (!slot) return;
      const update = () => {
        const hasNodes = slot.assignedElements({ flatten: true }).length > 0;
        this.toggleAttribute(attr, !hasNodes);
      };
      update(); // run once on connect
      slot.addEventListener('slotchange', update);
      this.#slotWatchers.push({ slot, update });
    };

    watchSlot('header', 'no-header');
    watchSlot('nav',    'no-nav');
    watchSlot('aside',  'no-aside');
    watchSlot('footer', 'no-footer');
  }

  disconnectedCallback() {
    for (const { slot, update } of this.#slotWatchers) {
      slot.removeEventListener('slotchange', update);
    }
    this.#slotWatchers = [];
  }
}

if (!customElements.get('ui-app-shell')) {
  customElements.define('ui-app-shell', UiAppShell);
}
