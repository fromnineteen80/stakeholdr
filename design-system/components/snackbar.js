/* ============================================================================
 * <ui-snackbar> — transient status message with optional action.
 *
 * Attrs  open     — present = visible
 *        message  — plain-text body
 *        timeout  — ms before auto-dismiss (default 5000; 0 = no auto-dismiss)
 * Slot   action   — optional action element (e.g. ui-button variant=text)
 * Method show()   — sets open + resets timer
 * Emits  close (composed) when dismissed
 * ARIA   role=status (polite live region)
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      /* Host is a fixed-position layer; never affects document flow */
      position: fixed;
      bottom: var(--ui-sys-space-6);
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      pointer-events: none;
    }

    .bar {
      display: flex;
      align-items: center;
      gap: var(--ui-sys-space-4);
      padding: var(--ui-sys-space-3) var(--ui-sys-space-4);
      background: var(--ui-sys-surface-container-highest);
      color: var(--ui-sys-on-surface);
      font: var(--ui-sys-font-body);
      border-radius: var(--ui-sys-shape-control);
      box-shadow: var(--ui-sys-elevation-3);
      min-width: 240px;
      max-width: min(560px, calc(100vw - var(--ui-sys-space-6) * 2));
      pointer-events: auto;

      opacity: 0;
      transform: translateY(12px);
      transition:
        opacity var(--ui-sys-motion-emphasis),
        transform var(--ui-sys-motion-emphasis);
    }

    :host([open]) .bar {
      opacity: 1;
      transform: translateY(0);
    }

    .message {
      flex: 1;
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
    }

    .action {
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }
    .action:empty { display: none; }
  </style>

  <!-- role=status is a polite live region; screen-readers announce on change -->
  <div class="bar" part="bar" role="status" aria-live="polite" aria-atomic="true">
    <span class="message" part="message" id="msg"></span>
    <span class="action" part="action">
      <slot name="action"></slot>
    </span>
  </div>
`;

class UiSnackbar extends HTMLElement {
  static observedAttributes = ['open', 'message'];

  #bar;
  #msg;
  #timer = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#bar = this.shadowRoot.querySelector('.bar');
    this.#msg = this.shadowRoot.querySelector('.message');
  }

  connectedCallback() {
    this.#syncMessage();
    if (this.hasAttribute('open')) this.#startTimer();
  }

  disconnectedCallback() {
    this.#clearTimer();
  }

  attributeChangedCallback(name, _old, _new) {
    if (name === 'message') {
      this.#syncMessage();
    }
    if (name === 'open') {
      if (this.hasAttribute('open')) {
        this.#startTimer();
      } else {
        this.#clearTimer();
      }
    }
  }

  /** Show with an optional message override. Resets the auto-dismiss timer. */
  show(message) {
    if (message != null) this.setAttribute('message', message);
    this.setAttribute('open', '');
  }

  #close() {
    this.removeAttribute('open');
    this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }

  #syncMessage() {
    this.#msg.textContent = this.getAttribute('message') ?? '';
  }

  #startTimer() {
    this.#clearTimer();
    const timeout = parseInt(this.getAttribute('timeout') ?? '5000', 10);
    if (timeout > 0) {
      this.#timer = setTimeout(() => this.#close(), timeout);
    }
  }

  #clearTimer() {
    if (this.#timer !== null) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
  }
}

if (!customElements.get('ui-snackbar')) {
  customElements.define('ui-snackbar', UiSnackbar);
}
