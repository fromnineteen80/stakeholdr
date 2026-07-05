/* ============================================================================
 * <ui-dialog> — modal dialog. Attr: open.
 * Slots: headline, default (body), actions.
 * Methods: show(), close(). Emits: close.
 * Focus trap, Esc key, scrim backdrop, ARIA role=dialog aria-modal.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: contents;
    }

    /* Stacking: a page can raise a STACKED dialog (e.g. a delete-confirm over
       an edit dialog) by setting --ui-dialog-layer on the host — its scrim
       then covers the lower dialog's card (clicks around the stacked card can
       never reach the dialog beneath). */
    :host {
      --_layer: var(--ui-dialog-layer, 0);
    }

    /* Scrim */
    .scrim {
      position: fixed;
      inset: 0;
      background: var(--ui-sys-scrim);
      z-index: calc(900 + var(--_layer));
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--ui-sys-motion-emphasis),
                  visibility var(--ui-sys-motion-emphasis);
    }

    :host([open]) .scrim {
      opacity: 1;
      visibility: visible;
    }

    /* Blurred-veil variant (the sealed command-palette cmdk-backdrop): the
       scrim additionally blurs the page behind it. Amount = the
       --ui-sys-scrim-blur token — never a literal in a host stylesheet. */
    :host([scrim-blur]) .scrim {
      -webkit-backdrop-filter: blur(var(--ui-sys-scrim-blur));
      backdrop-filter: blur(var(--ui-sys-scrim-blur));
    }

    /* Dialog card */
    .dialog {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: calc(901 + var(--_layer));
      pointer-events: none;
      visibility: hidden;
    }

    :host([open]) .dialog {
      pointer-events: auto;
      visibility: visible;
    }

    .card {
      background: var(--ui-sys-surface-card);
      border-radius: var(--ui-sys-shape-card);
      box-shadow: var(--ui-sys-elevation-3);
      min-width: 280px;
      max-width: min(560px, calc(100vw - var(--ui-sys-space-6) * 2));
      max-height: calc(100dvh - var(--ui-sys-space-6) * 2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      opacity: 0;
      transform: translateY(8px) scale(0.98);
      transition: opacity var(--ui-sys-motion-emphasis),
                  transform var(--ui-sys-motion-emphasis);
    }

    :host([open]) .card {
      opacity: 1;
      transform: translateY(0) scale(1);
    }

    /* Headline */
    .headline {
      padding: var(--ui-sys-space-6) var(--ui-sys-space-6) var(--ui-sys-space-4);
      font: var(--ui-sys-font-title);
      color: var(--ui-sys-on-surface);
      flex-shrink: 0;
    }

    .headline:empty {
      display: none;
    }

    /* Body */
    .body {
      padding: 0 var(--ui-sys-space-6);
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface-muted);
      overflow-y: auto;
      flex: 1;
    }

    /* Actions */
    .actions {
      padding: var(--ui-sys-space-4) var(--ui-sys-space-4) var(--ui-sys-space-4);
      display: flex;
      justify-content: flex-end;
      gap: var(--ui-sys-space-2);
      flex-shrink: 0;
      flex-wrap: wrap;
    }

    .actions:empty {
      display: none;
    }

    /* Dividers when both headline and body present */
    .headline + .body {
      padding-top: 0;
    }
  </style>

  <div class="scrim" part="scrim"></div>
  <div class="dialog" role="dialog" aria-modal="true">
    <!-- tabindex=-1: the open-focus fallback target. Canonical UI content
         keeps its real controls inside shadow roots, so the light-DOM
         focusable query can come up empty — the card itself must be
         programmatically focusable or keyboard focus (and Escape) stays in
         whatever dialog was open underneath. -->
    <div class="card" part="card" tabindex="-1">
      <div class="headline" part="headline">
        <slot name="headline"></slot>
      </div>
      <div class="body" part="body">
        <slot></slot>
      </div>
      <div class="actions" part="actions">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
`;

class UiDialog extends HTMLElement {
  static observedAttributes = ['open'];

  #dialog;
  #card;
  #previousFocus;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#dialog = this.shadowRoot.querySelector('.dialog');
    this.#card = this.shadowRoot.querySelector('.card');
  }

  connectedCallback() {
    this.shadowRoot.querySelector('.scrim').addEventListener('click', () => this.close());
    this.#dialog.addEventListener('keydown', this.#onKeyDown);
    // Initialize aria-labelledby if headline slot has content
    this.setAttribute('aria-modal', 'true');
  }

  disconnectedCallback() {
    this.#dialog.removeEventListener('keydown', this.#onKeyDown);
  }

  attributeChangedCallback(name, _old, val) {
    if (name === 'open') {
      if (val !== null) {
        this.#onOpen();
      } else {
        this.#onClose();
      }
    }
  }

  show() {
    this.setAttribute('open', '');
  }

  close() {
    this.removeAttribute('open');
  }

  #onOpen() {
    this.#previousFocus = document.activeElement;
    // Focus first focusable element inside card
    requestAnimationFrame(() => {
      const focusable = this.#getFocusable();
      if (focusable.length) focusable[0].focus();
      else this.#card.focus();
    });
  }

  #onClose() {
    this.#previousFocus?.focus();
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  #onKeyDown = (e) => {
    if (!this.hasAttribute('open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }
    if (e.key === 'Tab') {
      const focusable = this.#getFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first || this.shadowRoot.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || this.shadowRoot.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  #getFocusable() {
    // Native focusables + Canonical UI hosts (their real controls live in
    // shadow DOM and delegate via their focus() overrides / host tabindex).
    const selectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), ' +
      'ui-button:not([disabled]), ui-icon-button:not([disabled]), ui-text-field:not([disabled]), ui-textarea:not([disabled]), ui-select:not([disabled]), ui-date-picker, ui-chip:not([disabled]), ui-upload:not([disabled])';
    // Slotted light DOM
    const light = Array.from(this.querySelectorAll(selectors));
    return light;
  }
}

if (!customElements.get('ui-dialog')) {
  customElements.define('ui-dialog', UiDialog);
}
