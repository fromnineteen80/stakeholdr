/* ============================================================================
 * <ui-card> — content surface. MD3-parity variants: outlined (default) /
 * filled / elevated. Slots: media (top, full-bleed), default (body content),
 * actions (footer row, right-aligned). Attr `interactive` → whole card is
 * clickable: role=button, state layer hover/pressed, focus-visible ring,
 * Enter/Space activation (retargets as a normal `click` on the host).
 * Attr `disabled` inerts an interactive card.
 * Built to the ui-button bar: shadow DOM, --ui-sys-* tokens only.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    /* Component reads ONLY --ui-sys-* tokens. No literal colors here
       except structural geometry that carries no brand opinion. */
    :host {
      display: block;
      --_bg: var(--ui-sys-surface-card);
      --_border: transparent;
      --_shadow: none;
    }
    :host([variant="outlined"]) { --_border: var(--ui-sys-outline-subtle); }
    :host([variant="filled"])   { --_bg: var(--ui-sys-surface-container); }
    :host([variant="elevated"]) { --_shadow: var(--ui-sys-elevation-1); }

    .card {
      position: relative;
      isolation: isolate;
      display: flex;
      flex-direction: column;
      height: 100%;
      box-sizing: border-box;
      border: 1px solid var(--_border);
      border-radius: var(--ui-sys-shape-card);
      background: var(--_bg);
      box-shadow: var(--_shadow);
      color: var(--ui-sys-on-surface);
      font: var(--ui-sys-font-body);
      text-align: left;
      overflow: hidden;
      transition: border-color var(--ui-sys-motion-control);
    }

    /* State layer — opacity-driven, token-controlled (interactive only) */
    .card::before {
      content: "";
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      z-index: 1;
      pointer-events: none;
    }
    :host([interactive]) .card { cursor: pointer; user-select: none; }
    :host([interactive]) .card:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
    :host([interactive]) .card:active::before { opacity: var(--ui-sys-state-pressed-opacity); }

    /* Focus-visible ring — token-driven, accessible */
    :host([interactive]) .card:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    :host([disabled]) { pointer-events: none; }
    :host([disabled]) .card {
      color: var(--ui-sys-on-surface-faint);
      cursor: default;
    }

    /* Media slot — full-bleed top, clipped by the card radius */
    .media { display: block; }
    .media[hidden] { display: none; }
    ::slotted([slot="media"]) {
      display: block;
      width: 100%;
      max-width: 100%;
    }

    /* Body — the default slot, sane padding */
    .body {
      flex: 1;
      min-width: 0;
      padding: var(--ui-sys-space-4);
    }

    /* Actions — footer row, right-aligned */
    .actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--ui-sys-space-2);
      padding: 0 var(--ui-sys-space-4) var(--ui-sys-space-4);
    }
    .actions[hidden] { display: none; }
  </style>
  <div class="card" part="card">
    <div class="media" part="media" hidden>
      <slot name="media"></slot>
    </div>
    <div class="body" part="body">
      <slot></slot>
    </div>
    <div class="actions" part="actions" hidden>
      <slot name="actions"></slot>
    </div>
  </div>
`;

class UiCard extends HTMLElement {
  static observedAttributes = ['interactive', 'disabled'];

  #card;
  #mediaWrap;
  #actionsWrap;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#card = this.shadowRoot.querySelector('.card');
    this.#mediaWrap = this.shadowRoot.querySelector('.media');
    this.#actionsWrap = this.shadowRoot.querySelector('.actions');

    // Auto-collapse empty media/actions tracks so a body-only card has no
    // stray gaps (same slotchange pattern as ui-app-shell).
    const mediaSlot = this.#mediaWrap.querySelector('slot');
    const actionsSlot = this.#actionsWrap.querySelector('slot');
    const syncSlots = () => {
      this.#mediaWrap.hidden = mediaSlot.assignedNodes().length === 0;
      this.#actionsWrap.hidden = actionsSlot.assignedNodes().length === 0;
    };
    mediaSlot.addEventListener('slotchange', syncSlots);
    actionsSlot.addEventListener('slotchange', syncSlots);
    syncSlots();
  }

  connectedCallback() {
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'outlined');
    this.#sync();
    this.#card.addEventListener('keydown', this.#onKeyDown);
  }

  disconnectedCallback() {
    this.#card.removeEventListener('keydown', this.#onKeyDown);
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const interactive = this.hasAttribute('interactive');
    const disabled = this.hasAttribute('disabled');
    if (interactive) {
      this.#card.setAttribute('role', 'button');
      this.#card.setAttribute('tabindex', disabled ? '-1' : '0');
      if (disabled) this.#card.setAttribute('aria-disabled', 'true');
      else this.#card.removeAttribute('aria-disabled');
    } else {
      this.#card.removeAttribute('role');
      this.#card.removeAttribute('tabindex');
      this.#card.removeAttribute('aria-disabled');
    }
  }

  #onKeyDown = (e) => {
    if (!this.hasAttribute('interactive') || this.hasAttribute('disabled')) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Shadow-DOM click retargets to the host, so listeners on <ui-card>
      // receive a normal `click` — same contract as pointer activation.
      this.#card.click();
    }
  };
}

if (!customElements.get('ui-card')) {
  customElements.define('ui-card', UiCard);
}
