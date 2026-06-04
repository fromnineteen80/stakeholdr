/* ============================================================================
 * <ui-app-bar> — top application bar.
 * category: gapFill
 *
 * Slots:
 *   leading  — menu / back icon button (left edge)
 *   (default) — title content (--ui-sys-font-title)
 *   trailing  — action icon buttons (right edge)
 *
 * Attributes:
 *   variant  flat | elevated (default: flat)
 *            elevated → --ui-sys-elevation-2 shadow
 *
 * Roles: role=banner on host; inner toolbar role=toolbar
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      background: var(--ui-sys-surface-container);
      transition: box-shadow var(--ui-sys-motion-control);
    }
    :host([variant="elevated"]) {
      box-shadow: var(--ui-sys-elevation-2);
    }

    [part="toolbar"] {
      display: flex;
      align-items: center;
      gap: var(--ui-sys-space-2);
      min-height: 56px;
      padding: 0 var(--ui-sys-space-2);
    }

    .slot-leading {
      display: contents;
    }

    .title {
      flex: 1 1 0;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font: var(--ui-sys-font-title);
      color: var(--ui-sys-on-surface);
      padding: 0 var(--ui-sys-space-2);
    }

    .slot-trailing {
      display: contents;
    }

    ::slotted(*) {
      flex-shrink: 0;
    }
  </style>
  <div part="toolbar" role="toolbar">
    <span class="slot-leading"><slot name="leading"></slot></span>
    <span class="title"><slot></slot></span>
    <span class="slot-trailing"><slot name="trailing"></slot></span>
  </div>
`;

class UiAppBar extends HTMLElement {
  static observedAttributes = ['variant'];

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'banner');
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'flat');
  }

  attributeChangedCallback() { /* CSS handles variant via :host([variant]) */ }
}

if (!customElements.get('ui-app-bar')) {
  customElements.define('ui-app-bar', UiAppBar);
}
