/* ============================================================================
 * <ui-sheet> — bottom sheet (mobile).
 * category: gapFill / MOBILE
 *
 * Attributes:
 *   open  (bool)
 *
 * Slot default — content
 *
 * Methods: show(), close()
 * Events:  close (bubbles, composed)
 *
 * Behaviour:
 *   - Slides up from bottom on open, slides back down on close
 *   - Drag-handle affordance at top center
 *   - Scrim backdrop; tap scrim or swipe-down or Esc closes
 *   - --ui-sys-surface-card bg, --ui-sys-shape-card top radius
 *   - elevation-3 shadow
 *   role=dialog, aria-modal=true
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
      z-index: 200;
    }
    :host([open]) [part="scrim"] {
      opacity: 1;
      pointer-events: auto;
    }

    [part="sheet"] {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 90dvh;
      overflow-y: auto;
      background: var(--ui-sys-surface-card);
      border-radius: var(--ui-sys-shape-card) var(--ui-sys-shape-card) 0 0;
      box-shadow: var(--ui-sys-elevation-3);
      transform: translateY(100%);
      transition: transform var(--ui-sys-motion-emphasis);
      z-index: 201;
      padding-bottom: env(safe-area-inset-bottom, 0px);
      outline: none;
    }
    :host([open]) [part="sheet"] {
      transform: translateY(0);
    }

    [part="sheet"]:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: -2px;
    }

    [part="handle-bar"] {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: var(--ui-sys-space-2) 0 var(--ui-sys-space-1);
      cursor: grab;
    }
    [part="handle-bar"]:active {
      cursor: grabbing;
    }

    [part="handle"] {
      width: 32px;
      height: 4px;
      border-radius: var(--ui-sys-shape-pill);
      background: var(--ui-sys-on-surface-faint);
    }

    [part="content"] {
      padding: 0 var(--ui-sys-space-4) var(--ui-sys-space-4);
    }
  </style>
  <div part="scrim" aria-hidden="true"></div>
  <div part="sheet" role="dialog" aria-modal="true" tabindex="-1">
    <div part="handle-bar" aria-hidden="true">
      <div part="handle"></div>
    </div>
    <div part="content">
      <slot></slot>
    </div>
  </div>
`;

class UiSheet extends HTMLElement {
  static observedAttributes = ['open'];

  #sheet;
  #scrim;
  #handleBar;

  /* drag state */
  #dragStartY = 0;
  #dragCurrentY = 0;
  #dragging = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#sheet    = this.shadowRoot.querySelector('[part="sheet"]');
    this.#scrim    = this.shadowRoot.querySelector('[part="scrim"]');
    this.#handleBar = this.shadowRoot.querySelector('[part="handle-bar"]');
  }

  connectedCallback() {
    if (!this.#sheet.hasAttribute('aria-label')) {
      this.#sheet.setAttribute('aria-label', 'Sheet');
    }

    this.#scrim.addEventListener('click', this.#onScrimClick);
    document.addEventListener('keydown', this.#onKeydown);

    /* touch drag-to-dismiss */
    this.#handleBar.addEventListener('touchstart', this.#onTouchStart, { passive: true });
    this.#handleBar.addEventListener('touchmove',  this.#onTouchMove,  { passive: false });
    this.#handleBar.addEventListener('touchend',   this.#onTouchEnd,   { passive: true });
  }

  disconnectedCallback() {
    this.#scrim.removeEventListener('click', this.#onScrimClick);
    document.removeEventListener('keydown', this.#onKeydown);
    this.#handleBar.removeEventListener('touchstart', this.#onTouchStart);
    this.#handleBar.removeEventListener('touchmove',  this.#onTouchMove);
    this.#handleBar.removeEventListener('touchend',   this.#onTouchEnd);
  }

  attributeChangedCallback(name, old, val) {
    if (name === 'open') {
      if (val !== null) {
        requestAnimationFrame(() => this.#sheet.focus());
      }
    }
  }

  show() {
    this.setAttribute('open', '');
  }

  close() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  #onScrimClick = () => this.close();

  #onKeydown = (e) => {
    if (e.key === 'Escape' && this.hasAttribute('open')) {
      e.preventDefault();
      this.close();
    }
  };

  #onTouchStart = (e) => {
    this.#dragStartY = e.touches[0].clientY;
    this.#dragCurrentY = 0;
    this.#dragging = true;
    this.#sheet.style.transition = 'none';
  };

  #onTouchMove = (e) => {
    if (!this.#dragging) return;
    const dy = e.touches[0].clientY - this.#dragStartY;
    if (dy > 0) {
      e.preventDefault();
      this.#dragCurrentY = dy;
      this.#sheet.style.transform = `translateY(${dy}px)`;
    }
  };

  #onTouchEnd = () => {
    if (!this.#dragging) return;
    this.#dragging = false;
    this.#sheet.style.transition = '';
    this.#sheet.style.transform = '';
    // dismiss if dragged more than 1/3 of its height
    const threshold = this.#sheet.offsetHeight / 3;
    if (this.#dragCurrentY > threshold) {
      this.close();
    }
  };
}

if (!customElements.get('ui-sheet')) {
  customElements.define('ui-sheet', UiSheet);
}
