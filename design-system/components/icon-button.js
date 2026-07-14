/* ============================================================================
 * <ui-icon-button> — circular icon button with variant + toggle support.
 *
 * Usage:
 *   <ui-icon-button variant="filled">
 *     <svg>…</svg>
 *   </ui-icon-button>
 *   <ui-icon-button variant="outlined" selected aria-label="Bookmark">
 *     <svg>…</svg>
 *   </ui-icon-button>
 *
 * Attrs:
 *   variant  — standard | filled | tonal | outlined  (default: standard)
 *   size     — (default 40px hit target) | "xs" — the micro stepper button
 *              (sealed Scoring-box xy-spin stack: dense in-cell ± steppers;
 *              pair it with <ui-icon size="xs"> and tabindex="-1" — the
 *              keyboard path is the number field itself)
 *   disabled — boolean
 *   selected — boolean  (the on-state; toggles filled bg on standard/outlined)
 *   toggle   — boolean; OPT-IN self-toggling: click flips `selected` and
 *              emits change {selected}. Controlled consumers omit it and
 *              re-render `selected` from their own state.
 *   aria-label — required for accessibility
 *
 * Emits: change (composed:true, detail:{selected}) when selected toggles
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;

      /* variant defaults: standard — quiet ink that strengthens on hover
         (state shown by INK, never a background: start-state design rule) */
      --_bg:     transparent;
      --_fg:     var(--ui-sys-on-surface-muted);
      --_border: transparent;
      /* selected state overrides */
      --_bg-sel: var(--ui-sys-primary-container);
      --_fg-sel: var(--ui-sys-on-primary-container);
    }

    /* ---- variant tokens ---- */
    :host([variant="filled"]) {
      --_bg:     var(--ui-sys-primary);
      --_fg:     var(--ui-sys-on-primary);
      --_bg-sel: var(--ui-sys-surface-container-high);
      --_fg-sel: var(--ui-sys-on-surface);
    }
    :host([variant="tonal"]) {
      --_bg:     var(--ui-sys-surface-container);
      --_fg:     var(--ui-sys-on-surface);
      --_bg-sel: var(--ui-sys-primary-container);
      --_fg-sel: var(--ui-sys-on-primary-container);
    }
    :host([variant="outlined"]) {
      --_bg:     transparent;
      --_fg:     var(--ui-sys-on-surface);
      --_border: var(--ui-sys-outline);
      --_bg-sel: var(--ui-sys-surface-container);
      --_fg-sel: var(--ui-sys-on-surface);
    }

    button {
      appearance: none;
      position: relative;
      isolation: isolate;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      /* Geometry token hook (Phase 21 card contract): hosts re-point
         --ui-sys-icon-button-size in a scope (entity-card foot actions read
         --ui-sys-card-action-height) — never a component override. */
      width: var(--ui-sys-icon-button-size, 40px);
      height: var(--ui-sys-icon-button-size, 40px);
      padding: 0;
      border: 1px solid var(--_border);
      border-radius: 50%;
      background: var(--_bg);
      color: var(--_fg);
      cursor: pointer;
      user-select: none;
      line-height: 0;
      transition: background var(--ui-sys-motion-control),
                  border-color var(--ui-sys-motion-control),
                  color var(--ui-sys-motion-control);
      overflow: hidden;
      outline: none;
    }

    /* selected state */
    :host([selected]) button {
      background: var(--_bg-sel);
      color: var(--_fg-sel);
      border-color: transparent;
    }

    /* state layer */
    button::before {
      content: "";
      position: absolute;
      inset: 0;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      pointer-events: none;
    }
    button:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
    button:active::before { opacity: var(--ui-sys-state-pressed-opacity); }

    /* Standard (bare-icon) variant: NO hover background — ink only. */
    :host(:not([variant])) button::before,
    :host([variant="standard"]) button::before { display: none; }
    :host(:not([variant])) button:hover,
    :host([variant="standard"]) button:hover,
    :host(:not([variant])) button:active,
    :host([variant="standard"]) button:active { color: var(--ui-sys-on-surface); }

    /* Optical centering: the slotted icon is a block inside a zero-line-height
       flex center, so glyph baselines can't skew it. */
    ::slotted(*) { display: block; }

    /* size="xs" — the micro stepper (sealed xy-spin: a compact ± column
       inside a dense matrix cell; token-derived from the icon scale). */
    :host([size="xs"]) button {
      width: calc(var(--ui-sys-icon-size-xs, 12px) + 2px);
      height: calc(var(--ui-sys-icon-size-xs, 12px) + 2px);
      border-radius: var(--ui-sys-shape-control);
    }

    button:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    :host([disabled]) { pointer-events: none; }
    :host([disabled]) button {
      background: transparent;
      border-color: var(--ui-sys-on-surface-faint);
      color: var(--ui-sys-on-surface-faint);
      cursor: default;
    }
    :host([disabled][variant="filled"]) button,
    :host([disabled][variant="tonal"])  button {
      background: var(--ui-sys-surface-container);
      border-color: transparent;
    }

    ::slotted(svg),
    ::slotted(img) {
      display: block;
      width: 20px;
      height: 20px;
      pointer-events: none;
    }
  </style>
  <button part="button" type="button">
    <slot></slot>
  </button>
`;

class UiIconButton extends HTMLElement {
  static observedAttributes = ['disabled', 'selected', 'toggle', 'aria-label', 'aria-pressed', 'tabindex'];

  #btn;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#btn = this.shadowRoot.querySelector('button');
  }

  connectedCallback() {
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'standard');
    this.#sync();
    this.#btn.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    this.#btn.removeEventListener('click', this.#onClick);
  }

  /* Delegate programmatic focus to the real control (dialog focus pass etc.). */
  focus(options) { this.#btn.focus(options); }

  attributeChangedCallback() {
    this.#sync();
  }

  get selected() { return this.hasAttribute('selected'); }
  set selected(v) { v ? this.setAttribute('selected', '') : this.removeAttribute('selected'); }

  #sync() {
    this.#btn.disabled = this.hasAttribute('disabled');
    // Forward tabindex to the inner shadow button — the real tab stop. The
    // sealed matrix steppers carry tabIndex −1 (skipped in tab order; the
    // keyboard path is the number field); without forwarding, the shadow
    // button would stay tabbable regardless of the host attribute.
    const ti = this.getAttribute('tabindex');
    if (ti !== null) this.#btn.setAttribute('tabindex', ti);
    else this.#btn.removeAttribute('tabindex');
    // Reflect aria-label to inner button
    const label = this.getAttribute('aria-label');
    if (label) this.#btn.setAttribute('aria-label', label);
    // Toggle button semantics: aria-pressed reflects the CURRENT selected
    // state whenever the host is toggle-shaped (toggle/selected/aria-pressed)
    // or the inner button already carries aria-pressed — once pressy, it must
    // keep tracking selected (a deselected host must read pressed=false,
    // never a stale true).
    if (this.hasAttribute('toggle') || this.hasAttribute('selected')
        || this.getAttribute('aria-pressed') !== null
        || this.#btn.hasAttribute('aria-pressed')) {
      this.#btn.setAttribute('aria-pressed', String(this.hasAttribute('selected')));
    }
  }

  #onClick = () => {
    if (this.hasAttribute('disabled')) return;
    // Self-toggling is OPT-IN via the `toggle` attribute (manifest).
    // CONTROLLED consumers (the host re-renders `selected` from its own
    // state, e.g. the workHQ mode group) omit it: self-toggling there let a
    // re-click of the active button strip the on-state with no state change
    // to restore it (2026-07-05 Phase 15 audit, finding 2).
    if (this.hasAttribute('toggle')) {
      this.selected = !this.selected;
      this.dispatchEvent(new CustomEvent('change', {
        bubbles: true, composed: true,
        detail: { selected: this.selected }
      }));
    }
  };
}

if (!customElements.get('ui-icon-button')) customElements.define('ui-icon-button', UiIconButton);
