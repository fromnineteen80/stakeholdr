/* ============================================================================
 * <ui-list> + <ui-list-item> — vertical list with optional interactivity.
 * ui-list-item slots: leading, default (headline), supporting, trailing.
 * Attr `interactive` → role=button, hover state layer, keyboard activation
 * (row-owned keys only: Enter/Space from a focused SLOTTED interactive child
 * activates that child natively, never the row).
 * Attr `wrap` (item) → the headline flows to multiple lines (reading lists)
 * instead of the default single-line ellipsis truncation.
 * Row geometry reads --ui-sys-list-item-min-height / -pad-block / -pad-inline
 * (tokens.css) so hosts re-point tokens for compact lists — never overrides.
 * ARIA role=list / listitem (or button when interactive).
 * ==========================================================================*/

/* ---- <ui-list-item> ----------------------------------------------------- */

const itemTemplate = document.createElement('template');
itemTemplate.innerHTML = `
  <style>
    :host {
      display: block;
    }

    .item {
      position: relative;
      isolation: isolate;
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 0 var(--ui-sys-space-3);
      min-height: var(--ui-sys-list-item-min-height, 48px);
      padding: var(--ui-sys-list-item-pad-block, var(--ui-sys-space-2))
               var(--ui-sys-list-item-pad-inline, var(--ui-sys-space-4));
      background: transparent;
      color: var(--ui-sys-on-surface);
      font: var(--ui-sys-font-body);
      text-align: left;
      cursor: default;
      user-select: none;
      width: 100%;
      box-sizing: border-box;
      border: none;
      overflow: hidden;
    }

    /* State layer */
    .item::before {
      content: "";
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      z-index: -1;
    }

    :host([interactive]) .item {
      cursor: pointer;
    }
    :host([interactive]) .item:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
    :host([interactive]) .item:active::before { opacity: var(--ui-sys-state-pressed-opacity); }

    :host([interactive]) .item:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: -2px;
    }

    /* Leading slot */
    .leading {
      display: flex;
      align-items: center;
      color: var(--ui-sys-on-surface-muted);
      flex-shrink: 0;
    }
    .leading:empty { display: none; }

    /* Content column */
    .content {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }

    .headline {
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* wrap — reading-list variant: the headline flows to multiple lines
       instead of truncating (registered in manifest.json). */
    :host([wrap]) .headline {
      white-space: normal;
      overflow: visible;
      text-overflow: clip;
    }

    .supporting {
      font: var(--ui-sys-font-caption);
      color: var(--ui-sys-on-surface-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .supporting:empty { display: none; }

    /* Trailing slot */
    .trailing {
      display: flex;
      align-items: center;
      color: var(--ui-sys-on-surface-muted);
      font: var(--ui-sys-font-caption);
      flex-shrink: 0;
    }
    .trailing:empty { display: none; }
  </style>
  <div class="item" part="item">
    <div class="leading" part="leading">
      <slot name="leading"></slot>
    </div>
    <div class="content" part="content">
      <span class="headline"><slot></slot></span>
      <span class="supporting"><slot name="supporting"></slot></span>
    </div>
    <div class="trailing" part="trailing">
      <slot name="trailing"></slot>
    </div>
  </div>
`;

class UiListItem extends HTMLElement {
  static observedAttributes = ['interactive', 'disabled'];

  #item;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(itemTemplate.content.cloneNode(true));
    this.#item = this.shadowRoot.querySelector('.item');
  }

  connectedCallback() {
    this.#sync();
    this.#item.addEventListener('keydown', this.#onKeyDown);
  }

  disconnectedCallback() {
    this.#item.removeEventListener('keydown', this.#onKeyDown);
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const interactive = this.hasAttribute('interactive');
    const disabled = this.hasAttribute('disabled');
    if (interactive) {
      this.#item.setAttribute('role', 'button');
      this.#item.setAttribute('tabindex', disabled ? '-1' : '0');
      if (disabled) this.#item.setAttribute('aria-disabled', 'true');
      else this.#item.removeAttribute('aria-disabled');
    } else {
      this.#item.removeAttribute('role');
      this.#item.removeAttribute('tabindex');
      this.#item.removeAttribute('aria-disabled');
    }
  }

  #onKeyDown = (e) => {
    if (!this.hasAttribute('interactive')) return;
    // Slotted interactive children (a trailing ui-icon-button, a leading
    // ui-checkbox…) own their own Enter/Space: activating the ROW from a
    // focused child would both kill the child's native activation
    // (preventDefault) and misfire the row action. composedPath()[0] is the
    // innermost real target — only a key press on the item itself (the
    // shadow row is the only focusable node in this scope) activates the row.
    if (e.composedPath()[0] !== this.#item) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.#item.click();
    }
  };
}

if (!customElements.get('ui-list-item')) {
  customElements.define('ui-list-item', UiListItem);
}

/* ---- <ui-list> ---------------------------------------------------------- */

const listTemplate = document.createElement('template');
listTemplate.innerHTML = `
  <style>
    :host {
      display: block;
    }
  </style>
  <slot></slot>
`;

class UiList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(listTemplate.content.cloneNode(true));
  }

  connectedCallback() {
    if (!this.hasAttribute('role')) this.setAttribute('role', 'list');
  }
}

if (!customElements.get('ui-list')) {
  customElements.define('ui-list', UiList);
}
