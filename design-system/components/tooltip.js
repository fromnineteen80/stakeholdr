/* ============================================================================
 * <ui-tooltip> — transient informational label on hover / focus.
 *
 * Attr  for   — id of anchor element in the same document. If absent the
 *               tooltip wraps its anchor as first slotted child.
 * The tooltip floats above the anchor. Appears on mouseenter / focusin,
 * disappears on mouseleave / focusout.
 * ARIA: role=tooltip; anchor gets aria-describedby wired automatically.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: contents;
    }

    /* The floating tip surface */
    .tip {
      position: fixed;
      z-index: 800;
      padding: var(--ui-sys-space-1) var(--ui-sys-space-2);
      background: var(--ui-sys-surface-container-highest);
      color: var(--ui-sys-on-surface);
      font: var(--ui-sys-font-caption);
      border-radius: var(--ui-sys-shape-control);
      box-shadow: var(--ui-sys-elevation-2);
      white-space: nowrap;
      max-width: 240px;
      white-space: normal;
      word-break: break-word;
      pointer-events: none;
      opacity: 0;
      transform: translateY(4px);
      transition:
        opacity var(--ui-sys-motion-control),
        transform var(--ui-sys-motion-control);
    }

    .tip.visible {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
  <slot></slot>
  <div class="tip" role="tooltip" part="tip" id="tip">
    <slot name="content"></slot>
  </div>
`;

let _tooltipCounter = 0;

class UiTooltip extends HTMLElement {
  static observedAttributes = ['for'];

  #tip;
  #anchor = null;
  #tipId;
  #visible = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#tip = this.shadowRoot.querySelector('.tip');
    this.#tipId = `ui-tooltip-${++_tooltipCounter}`;
    this.#tip.id = this.#tipId;
  }

  connectedCallback() {
    this.#wire();
  }

  disconnectedCallback() {
    this.#unwire();
  }

  attributeChangedCallback(name) {
    if (name === 'for') {
      this.#unwire();
      this.#wire();
    }
  }

  #wire() {
    const forId = this.getAttribute('for');
    if (forId) {
      // anchor is an external element referenced by id
      this.#anchor = (this.getRootNode()).getElementById(forId)
        || document.getElementById(forId);
    } else {
      // anchor is the first slotted child
      const slot = this.shadowRoot.querySelector('slot:not([name])');
      const nodes = slot?.assignedElements();
      this.#anchor = nodes?.[0] || null;
      if (!this.#anchor) {
        // defer until slot is filled
        slot?.addEventListener('slotchange', this.#onSlotChange, { once: true });
        return;
      }
    }
    this.#attachToAnchor();
  }

  #onSlotChange = () => {
    const slot = this.shadowRoot.querySelector('slot:not([name])');
    const nodes = slot?.assignedElements();
    this.#anchor = nodes?.[0] || null;
    if (this.#anchor) this.#attachToAnchor();
  };

  #attachToAnchor() {
    if (!this.#anchor) return;
    this.#anchor.setAttribute('aria-describedby', this.#tipId);
    this.#anchor.addEventListener('mouseenter', this.#show);
    this.#anchor.addEventListener('mouseleave', this.#hide);
    this.#anchor.addEventListener('focusin',    this.#show);
    this.#anchor.addEventListener('focusout',   this.#hide);
  }

  #unwire() {
    if (!this.#anchor) return;
    this.#anchor.removeEventListener('mouseenter', this.#show);
    this.#anchor.removeEventListener('mouseleave', this.#hide);
    this.#anchor.removeEventListener('focusin',    this.#show);
    this.#anchor.removeEventListener('focusout',   this.#hide);
    if (this.#anchor.getAttribute('aria-describedby') === this.#tipId) {
      this.#anchor.removeAttribute('aria-describedby');
    }
    this.#anchor = null;
  }

  #show = () => {
    if (this.#visible) return;
    this.#visible = true;
    this.#position();
    this.#tip.classList.add('visible');
  };

  #hide = () => {
    if (!this.#visible) return;
    this.#visible = false;
    this.#tip.classList.remove('visible');
  };

  #position() {
    if (!this.#anchor) return;
    const rect = this.#anchor.getBoundingClientRect();
    const tipRect = this.#tip.getBoundingClientRect();

    // Default: above center
    let top = rect.top - tipRect.height - 6;
    let left = rect.left + rect.width / 2 - tipRect.width / 2;

    // Flip below if not enough space above
    if (top < 8) top = rect.bottom + 6;

    // Clamp horizontal to viewport
    const vpw = window.innerWidth;
    if (left < 8) left = 8;
    if (left + tipRect.width > vpw - 8) left = vpw - tipRect.width - 8;

    this.#tip.style.top  = `${top}px`;
    this.#tip.style.left = `${left}px`;
  }
}

if (!customElements.get('ui-tooltip')) {
  customElements.define('ui-tooltip', UiTooltip);
}
