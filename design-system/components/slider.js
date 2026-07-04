/* ============================================================================
 * <ui-slider> — range input with track, filled portion, and draggable handle.
 * Attrs: min, max, step, value, disabled
 *        baseline (number) — optional anchor value: renders a tick mark at the
 *          baseline position and the fill spans BETWEEN the baseline and the
 *          current value (grows left of the tick below baseline, right above
 *          it) — the sealed Scoring-box WeightSlider mechanic (baseline 1.0).
 *        baseline-title — hover tooltip copy on the tick (sealed exact copy
 *          "Baseline weight 1.0"; the oracle used the wt-baseline title attr —
 *          the tick lives in shadow DOM, so the native title IS the mapped
 *          tooltip mechanism here, recorded as the ui-tooltip stand-in).
 * ARIA role=slider with aria-valuenow/min/max. formAssociated.
 * Keyboard: ArrowLeft/Right/Up/Down, Home, End.
 * Styled ONLY via --ui-sys-* tokens. No hardcoded colors or sizes.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      width: 200px;
      height: 40px;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    :host([disabled]) {
      pointer-events: none;
      cursor: default;
      opacity: 0.38;
    }

    /* ---- track container ---- */
    .track-wrap {
      position: relative;
      flex: 1;
      height: 4px;
      border-radius: var(--ui-sys-shape-pill);
      background: var(--ui-sys-track-off);
    }

    /* filled portion */
    .fill {
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      border-radius: var(--ui-sys-shape-pill);
      background: var(--ui-sys-primary);
      pointer-events: none;
      transition: width var(--ui-sys-motion-control);
    }

    /* baseline tick (only when the host carries [baseline]) */
    .baseline {
      display: none;
      position: absolute;
      top: 50%;
      width: 2px;
      height: 10px;
      transform: translate(-50%, -50%);
      border-radius: var(--ui-sys-shape-pill);
      background: var(--ui-sys-on-surface-faint);
      pointer-events: auto; /* hoverable: carries the baseline tooltip */
    }
    :host([baseline]) .baseline { display: block; }

    /* ---- handle ---- */
    .handle {
      position: absolute;
      top: 50%;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--ui-sys-primary);
      box-shadow: var(--ui-sys-elevation-1);
      transform: translate(-50%, -50%);
      transition: left var(--ui-sys-motion-control),
                  transform var(--ui-sys-motion-control),
                  box-shadow var(--ui-sys-motion-control);
    }

    /* pressed — slightly larger */
    :host(:active) .handle {
      width: 24px;
      height: 24px;
      box-shadow: var(--ui-sys-elevation-2);
    }

    /* state layer around handle */
    .handle::before {
      content: "";
      position: absolute;
      inset: -10px;
      border-radius: 50%;
      background: var(--ui-sys-primary);
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      pointer-events: none;
    }
    :host(:hover) .handle::before  { opacity: var(--ui-sys-state-hover-opacity); }
    :host(:active) .handle::before { opacity: var(--ui-sys-state-pressed-opacity); }

    /* focus ring */
    :host(:focus-visible) .handle {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 3px;
    }
  </style>

  <div class="track-wrap" part="track">
    <div class="fill"     part="fill"></div>
    <div class="baseline" part="baseline"></div>
    <div class="handle"   part="handle"></div>
  </div>
`;

class UiSlider extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ['min', 'max', 'step', 'value', 'disabled', 'baseline', 'baseline-title'];

  #internals;
  #trackWrap;
  #fill;
  #handle;
  #baseline;
  #dragging = false;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#internals = this.attachInternals?.();
    this.#trackWrap = this.shadowRoot.querySelector('.track-wrap');
    this.#fill      = this.shadowRoot.querySelector('.fill');
    this.#handle    = this.shadowRoot.querySelector('.handle');
    this.#baseline  = this.shadowRoot.querySelector('.baseline');
  }

  connectedCallback() {
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'slider');
    this.#updateAria();
    this.#updateVisuals();

    this.addEventListener('keydown',   this.#onKeydown);
    this.#trackWrap.addEventListener('pointerdown', this.#onPointerDown);
  }

  disconnectedCallback() {
    this.removeEventListener('keydown',   this.#onKeydown);
    this.#trackWrap.removeEventListener('pointerdown', this.#onPointerDown);
    window.removeEventListener('pointermove', this.#onPointerMove);
    window.removeEventListener('pointerup',   this.#onPointerUp);
  }

  attributeChangedCallback() {
    this.#updateAria();
    this.#updateVisuals();
  }

  /* ---- public API ---- */
  get min()   { return parseFloat(this.getAttribute('min')  ?? '0');   }
  get max()   { return parseFloat(this.getAttribute('max')  ?? '100'); }
  get step()  { return parseFloat(this.getAttribute('step') ?? '1');   }
  get value() { return this.#clamp(parseFloat(this.getAttribute('value') ?? String(this.min))); }

  set value(v) {
    const clamped = this.#clamp(this.#snap(parseFloat(v)));
    this.setAttribute('value', String(clamped));
    this.#internals?.setFormValue(String(clamped));
    this.#updateAria();
    this.#updateVisuals();
  }

  /* ---- internals ---- */
  #clamp(v)  { return Math.min(this.max, Math.max(this.min, v)); }
  #snap(v)   { return Math.round((v - this.min) / this.step) * this.step + this.min; }
  #percent() { return (this.value - this.min) / (this.max - this.min); }

  #updateAria() {
    this.setAttribute('aria-valuenow', String(this.value));
    this.setAttribute('aria-valuemin', String(this.min));
    this.setAttribute('aria-valuemax', String(this.max));
    this.setAttribute('aria-disabled', String(this.hasAttribute('disabled')));
  }

  /* baseline (optional): a number anchor within [min, max]; null when unset */
  get baseline() {
    const raw = this.getAttribute('baseline');
    if (raw == null || raw === '') return null;
    const n = parseFloat(raw);
    return Number.isFinite(n) ? this.#clamp(n) : null;
  }

  #updateVisuals() {
    const pct = this.#percent() * 100;
    const base = this.baseline;
    if (base != null) {
      /* Sealed WeightSlider fill rule: span between the baseline position and
         the current value (left of the tick below baseline, right above). */
      const basePct = ((base - this.min) / (this.max - this.min)) * 100;
      const lo = Math.min(pct, basePct);
      this.#fill.style.left  = `${lo}%`;
      this.#fill.style.width = `${Math.abs(pct - basePct)}%`;
      this.#baseline.style.left = `${basePct}%`;
      const tipText = this.getAttribute('baseline-title');
      if (tipText) this.#baseline.setAttribute('title', tipText);
      else this.#baseline.removeAttribute('title');
    } else {
      this.#fill.style.left  = '0';
      this.#fill.style.width = `${pct}%`;
    }
    this.#handle.style.left = `${pct}%`;
  }

  #setFromPointer(e) {
    const rect = this.#trackWrap.getBoundingClientRect();
    const raw  = (e.clientX - rect.left) / rect.width;
    const val  = raw * (this.max - this.min) + this.min;
    const prev = this.value;
    this.value = val;
    if (this.value !== prev) {
      this.dispatchEvent(new Event('input',  { bubbles: true, composed: true }));
    }
  }

  #onPointerDown = (e) => {
    if (this.hasAttribute('disabled')) return;
    this.#dragging = true;
    this.#trackWrap.setPointerCapture(e.pointerId);
    this.#setFromPointer(e);
    window.addEventListener('pointermove', this.#onPointerMove);
    window.addEventListener('pointerup',   this.#onPointerUp);
  };

  #onPointerMove = (e) => {
    if (!this.#dragging) return;
    this.#setFromPointer(e);
  };

  #onPointerUp = (e) => {
    if (!this.#dragging) return;
    this.#dragging = false;
    window.removeEventListener('pointermove', this.#onPointerMove);
    window.removeEventListener('pointerup',   this.#onPointerUp);
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  };

  #onKeydown = (e) => {
    if (this.hasAttribute('disabled')) return;
    const s = this.step;
    let delta = 0;
    switch (e.key) {
      case 'ArrowRight': case 'ArrowUp':   delta = +s; break;
      case 'ArrowLeft':  case 'ArrowDown': delta = -s; break;
      case 'Home': this.value = this.min; this.dispatchEvent(new Event('input',  { bubbles: true, composed: true })); this.dispatchEvent(new Event('change', { bubbles: true, composed: true })); return;
      case 'End':  this.value = this.max; this.dispatchEvent(new Event('input',  { bubbles: true, composed: true })); this.dispatchEvent(new Event('change', { bubbles: true, composed: true })); return;
      default: return;
    }
    e.preventDefault();
    const prev = this.value;
    this.value = prev + delta;
    if (this.value !== prev) {
      this.dispatchEvent(new Event('input',  { bubbles: true, composed: true }));
      this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    }
  };
}

if (!customElements.get('ui-slider')) {
  customElements.define('ui-slider', UiSlider);
}
