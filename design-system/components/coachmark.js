/* ============================================================================
 * <ui-coachmark> — anchored spotlight callout for first-run product tours.
 *
 * Attrs  for      — id of the target element to spotlight (same root/document)
 *        step     — 1-based current tour step (Back hidden on step 1)
 *        steps    — total tour steps (Next becomes Done on the last step;
 *                   Skip hidden on the last step — Done is the only exit)
 *        heading  — card title text
 *        open     — visible when present
 * Slot   default  — body text of the step.
 * Methods: show(), close(), reposition().
 * Events : next / back / dismiss (bubbles, composed, detail {step, steps}).
 *          Escape, the Skip button, and the × button all dismiss (close +
 *          emit dismiss — the host treats dismiss as "skip for good").
 *          ArrowRight advances (emits next), ArrowLeft goes back (emits
 *          back, step > 1 only); Enter activates the focused Next/Done.
 *
 * The page scrim is drawn with the box-shadow cutout technique: one fixed
 * element sits over the anchor and casts --ui-sys-scrim outward, leaving the
 * anchor itself un-dimmed. The floating card places below the anchor if there
 * is room, else above, with a caret pointing at the anchor. Focus moves into
 * the card on open and restores on close. Token-only styling.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: contents;
    }

    /* Backdrop — TRUE modality (audit 2026-07-14: the shadow-scrim alone was
     * fully click-through; the tour READ as modal but the page underneath
     * stayed live). Transparent, swallows every pointer event while open —
     * the visible dimming still comes from the spotlight's shadow above it. */
    .backdrop {
      position: fixed;
      inset: 0;
      z-index: 889;
      pointer-events: none;
    }

    :host([open]) .backdrop {
      pointer-events: auto;
    }

    /* Spotlight — the scrim IS this element's shadow; the hole is the anchor. */
    .spotlight {
      position: fixed;
      z-index: 890;
      border-radius: var(--ui-sys-shape-control);
      box-shadow: 0 0 0 200vmax var(--ui-sys-scrim);
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--ui-sys-motion-emphasis),
                  visibility var(--ui-sys-motion-emphasis);
    }

    :host([open]) .spotlight {
      opacity: 1;
      visibility: visible;
    }

    .spotlight.no-anchor {
      display: none;
    }

    /* Floating card */
    .card {
      position: fixed;
      z-index: 891;
      width: min(320px, calc(100vw - var(--ui-sys-space-4) * 2));
      background: var(--ui-sys-surface-card);
      border-radius: var(--ui-sys-shape-card);
      box-shadow: var(--ui-sys-elevation-3);
      padding: var(--ui-sys-space-4);
      opacity: 0;
      visibility: hidden;
      transform: translateY(4px);
      transition: opacity var(--ui-sys-motion-emphasis),
                  visibility var(--ui-sys-motion-emphasis),
                  transform var(--ui-sys-motion-emphasis);
    }

    :host([open]) .card {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    /* Caret — rotated square in the card surface, pointing at the anchor. */
    .caret {
      position: absolute;
      width: 12px;
      height: 12px;
      background: var(--ui-sys-surface-card);
      transform: rotate(45deg);
    }

    .caret.below  { top: -6px; }    /* card sits below anchor → caret points up   */
    .caret.above  { bottom: -6px; } /* card sits above anchor → caret points down */
    .caret.hidden { display: none; }

    .heading {
      font: var(--ui-sys-font-title);
      color: var(--ui-sys-on-surface);
      padding-right: var(--ui-sys-space-6); /* keep clear of the dismiss button */
      margin-bottom: var(--ui-sys-space-2);
    }

    .heading:empty {
      display: none;
    }

    .body {
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface-muted);
    }

    .footer {
      display: flex;
      align-items: center;
      gap: var(--ui-sys-space-2);
      margin-top: var(--ui-sys-space-4);
    }

    .counter {
      font: var(--ui-sys-font-caption);
      color: var(--ui-sys-on-surface-muted);
      font-variant-numeric: tabular-nums;
      margin-right: auto;
    }

    /* Internal buttons — same token recipe as ui-button, scoped to the card. */
    button {
      appearance: none;
      position: relative;
      isolation: isolate;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 32px;
      padding: 0 var(--ui-sys-space-3);
      border: none;
      border-radius: var(--ui-sys-shape-control);
      background: transparent;
      color: var(--ui-sys-on-surface);
      font: var(--ui-sys-font-label);
      cursor: pointer;
      user-select: none;
      overflow: hidden;
      transition: background var(--ui-sys-motion-control);
    }

    button::before {
      content: "";
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      z-index: -1;
    }
    button:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
    button:active::before { opacity: var(--ui-sys-state-pressed-opacity); }

    button:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    .next {
      background: var(--ui-sys-primary);
      color: var(--ui-sys-on-primary);
    }

    .skip { color: var(--ui-sys-on-surface-muted); }

    .back.hidden,
    .skip.hidden { display: none; }

    .dismiss {
      position: absolute;
      top: var(--ui-sys-space-2);
      right: var(--ui-sys-space-2);
      min-height: 0;
      width: 28px;
      height: 28px;
      padding: 0;
      border-radius: var(--ui-sys-shape-pill);
      color: var(--ui-sys-on-surface-muted);
    }
  </style>

  <div class="backdrop" part="backdrop" aria-hidden="true"></div>
  <div class="spotlight" part="spotlight"></div>
  <div class="card" part="card" role="dialog" aria-modal="true" aria-labelledby="heading" aria-describedby="body" tabindex="-1">
    <div class="caret" part="caret"></div>
    <button class="dismiss" part="dismiss" aria-label="Dismiss tour">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="heading" part="heading" id="heading"></div>
    <div class="body" part="body" id="body"><slot></slot></div>
    <div class="footer" part="footer">
      <span class="counter" part="counter"></span>
      <button class="skip" part="skip">Skip</button>
      <button class="back" part="back">Back</button>
      <button class="next" part="next">Next</button>
    </div>
  </div>
`;

class UiCoachmark extends HTMLElement {
  static observedAttributes = ['open', 'for', 'step', 'steps', 'heading'];

  #spotlight;
  #card;
  #caret;
  #headingEl;
  #counterEl;
  #skipBtn;
  #backBtn;
  #nextBtn;
  #dismissBtn;
  #anchor = null;
  #previousFocus = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#spotlight  = this.shadowRoot.querySelector('.spotlight');
    this.#card       = this.shadowRoot.querySelector('.card');
    this.#caret      = this.shadowRoot.querySelector('.caret');
    this.#headingEl  = this.shadowRoot.querySelector('.heading');
    this.#counterEl  = this.shadowRoot.querySelector('.counter');
    this.#skipBtn    = this.shadowRoot.querySelector('.skip');
    this.#backBtn    = this.shadowRoot.querySelector('.back');
    this.#nextBtn    = this.shadowRoot.querySelector('.next');
    this.#dismissBtn = this.shadowRoot.querySelector('.dismiss');
  }

  connectedCallback() {
    this.#skipBtn.addEventListener('click', this.#onDismiss);
    this.#backBtn.addEventListener('click', this.#onBack);
    this.#nextBtn.addEventListener('click', this.#onNext);
    this.#dismissBtn.addEventListener('click', this.#onDismiss);
    this.#render();
    if (this.hasAttribute('open')) this.#onOpen();
  }

  disconnectedCallback() {
    this.#skipBtn.removeEventListener('click', this.#onDismiss);
    this.#backBtn.removeEventListener('click', this.#onBack);
    this.#nextBtn.removeEventListener('click', this.#onNext);
    this.#dismissBtn.removeEventListener('click', this.#onDismiss);
    this.#unlisten();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!this.shadowRoot) return;
    if (name === 'open') {
      if (newVal !== null && oldVal === null) this.#onOpen();
      else if (newVal === null && oldVal !== null) this.#onClose();
      return;
    }
    this.#render();
    if (this.hasAttribute('open')) {
      if (name === 'for') this.#resolveAnchor();
      this.#position();
    }
  }

  show()  { this.setAttribute('open', ''); }
  close() { this.removeAttribute('open'); }
  /* Public re-measure hook: hosts call this after they mutate the card's
   * slotted body/heading (attribute changes reposition automatically, but a
   * slot-text change resizes the card without an attribute changing). */
  reposition() { this.#position(); }

  get step()  { return Math.max(1, parseInt(this.getAttribute('step'), 10) || 1); }
  get steps() { return Math.max(1, parseInt(this.getAttribute('steps'), 10) || 1); }

  /* ---- open / close lifecycle ------------------------------------------- */

  #onOpen() {
    this.#previousFocus = document.activeElement;
    this.#resolveAnchor();
    this.#render();
    document.addEventListener('keydown', this.#onKeyDown, true);
    window.addEventListener('resize', this.#reposition);
    document.addEventListener('scroll', this.#reposition, true);
    requestAnimationFrame(() => {
      this.#position();
      this.#nextBtn.focus();
    });
  }

  #onClose() {
    this.#unlisten();
    if (this.#previousFocus && typeof this.#previousFocus.focus === 'function') {
      this.#previousFocus.focus();
    }
    this.#previousFocus = null;
  }

  #unlisten() {
    document.removeEventListener('keydown', this.#onKeyDown, true);
    window.removeEventListener('resize', this.#reposition);
    document.removeEventListener('scroll', this.#reposition, true);
  }

  /* ---- events ----------------------------------------------------------- */

  #emit(type) {
    this.dispatchEvent(new CustomEvent(type, {
      bubbles: true,
      composed: true,
      detail: { step: this.step, steps: this.steps },
    }));
  }

  #onBack = () => { this.#emit('back'); };
  #onNext = () => { this.#emit('next'); };

  #onDismiss = () => {
    this.#emit('dismiss');
    this.close();
  };

  #onKeyDown = (e) => {
    if (!this.hasAttribute('open')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      this.#onDismiss();
      return;
    }
    /* Focus trap (pairs with aria-modal + the backdrop: the page is inert
     * while the tour is open, so focus must cycle inside the card). */
    if (e.key === 'Tab') {
      const focusables = [...this.shadowRoot.querySelectorAll('button')]
        .filter((b) => !b.hidden && b.offsetParent !== null);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = this.shadowRoot.activeElement;
      e.preventDefault();
      e.stopPropagation();
      if (!active) { first.focus(); return; }
      const idx = focusables.indexOf(active);
      const next = e.shiftKey
        ? focusables[(idx - 1 + focusables.length) % focusables.length]
        : focusables[(idx + 1) % focusables.length];
      next.focus();
      return;
    }
    /* Arrow keys steer the tour (Enter already activates the focused
     * Next/Done natively — focus moves into the card on open). */
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      this.#onNext();
      return;
    }
    if (e.key === 'ArrowLeft' && this.step > 1) {
      e.preventDefault();
      e.stopPropagation();
      this.#onBack();
    }
  };

  /* ---- rendering -------------------------------------------------------- */

  #render() {
    const step = this.step;
    const steps = this.steps;
    this.#headingEl.textContent = this.getAttribute('heading') || '';
    this.#counterEl.textContent = steps > 1 ? `${step} of ${steps}` : '';
    this.#backBtn.classList.toggle('hidden', step <= 1);
    this.#skipBtn.classList.toggle('hidden', step >= steps); // Done is the last-step exit
    this.#nextBtn.textContent = step >= steps ? 'Done' : 'Next';
    const heading = this.getAttribute('heading');
    if (heading) this.#card.setAttribute('aria-label', heading);
    else this.#card.removeAttribute('aria-label');
  }

  #resolveAnchor() {
    const forId = this.getAttribute('for');
    this.#anchor = forId
      ? ((this.getRootNode().getElementById?.(forId)) || document.getElementById(forId))
      : null;
  }

  #reposition = () => { this.#position(); };

  #position() {
    if (!this.hasAttribute('open')) return;
    const margin = 8;   // viewport inset
    const gap    = 12;  // anchor → card distance
    const pad    = 4;   // spotlight breathing room around the anchor
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cw = this.#card.offsetWidth;
    const ch = this.#card.offsetHeight;

    const r = (this.#anchor && this.#anchor.isConnected)
      ? this.#anchor.getBoundingClientRect()
      : null;

    if (!r || (r.width === 0 && r.height === 0)) {
      // No anchor (missing, disconnected, or display:none → zero rect):
      // center the card, no spotlight hole, no caret.
      this.#spotlight.classList.add('no-anchor');
      this.#caret.classList.add('hidden');
      this.#card.style.top  = `${Math.max(margin, (vh - ch) / 2)}px`;
      this.#card.style.left = `${Math.max(margin, (vw - cw) / 2)}px`;
      return;
    }

    // Spotlight hugs the anchor; its box-shadow paints the scrim everywhere else.
    this.#spotlight.classList.remove('no-anchor');
    this.#spotlight.style.top    = `${r.top - pad}px`;
    this.#spotlight.style.left   = `${r.left - pad}px`;
    this.#spotlight.style.width  = `${r.width + pad * 2}px`;
    this.#spotlight.style.height = `${r.height + pad * 2}px`;

    // Below if room, else above.
    const below = r.bottom + gap + ch <= vh - margin;
    const top = below
      ? r.bottom + gap
      : Math.max(margin, r.top - gap - ch);

    let left = r.left + r.width / 2 - cw / 2;
    left = Math.min(Math.max(left, margin), Math.max(margin, vw - cw - margin));

    this.#card.style.top  = `${top}px`;
    this.#card.style.left = `${left}px`;

    // Caret points at the anchor's horizontal center, kept inside the card.
    const caretSize = 12;
    let caretLeft = r.left + r.width / 2 - left - caretSize / 2;
    caretLeft = Math.min(Math.max(caretLeft, 10), cw - caretSize - 10);
    this.#caret.classList.remove('hidden', 'below', 'above');
    this.#caret.classList.add(below ? 'below' : 'above');
    this.#caret.style.left = `${caretLeft}px`;
  }
}

if (!customElements.get('ui-coachmark')) {
  customElements.define('ui-coachmark', UiCoachmark);
}
