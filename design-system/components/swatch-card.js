/* ============================================================================
 * <ui-swatch-card> — selectable preview-swatch card (GAP component; the
 * Canonical UI home of the Settings theme picker's theme-swatch cards and the
 * brand/accent 7-swatch color tiles — declared in the sealed Settings box).
 * Built to the ui-button bar: real custom element, shadow DOM, real states,
 * token-only chrome; the preview colors arrive as PROPS (token references or
 * user-picked data values flowing through JS state — never inline hex in
 * screen markup).
 *
 * Attributes:
 *   value         — the option id this card represents (e.g. "soapbox", "#1976D2")
 *   label         — card variant: the option name (e.g. "Soapbox")
 *   sublabel      — card variant: the supporting line (e.g. "Warm beige")
 *   selected      — reflected; draws the selection ring (swatch-border ink)
 *   variant       — "card" (default: circle + label + sublabel) | "dot"
 *                   (circle only — the brand/accent swatch tile)
 *   swatch-bg     — preview circle fill  (a var(--ui-sys-*) ref or data value)
 *   swatch-dot    — inner dot fill       (card variant)
 *   swatch-border — selection-ring / circle-border color
 *   disabled      — real disabled state (used for honestly-inert options)
 *
 * A11y: the internal control is role="radio" + aria-checked; a row of cards
 * inside a [role="radiogroup"] container gets arrow-key movement between
 * sibling ui-swatch-cards (ArrowLeft/Up = previous, ArrowRight/Down = next —
 * moving focus AND selecting, per the radio-group pattern).
 *
 * Events (composed: true):
 *   change → detail { value } — fired on click/keyboard selection.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: inline-flex; }
    :host([disabled]) { pointer-events: none; }
    button {
      display: flex; flex-direction: column; align-items: center;
      gap: var(--ui-sys-space-1);
      margin: 0; padding: var(--ui-sys-space-2);
      font: var(--ui-sys-font-label);
      color: var(--ui-sys-on-surface);
      background: transparent;
      border: 1px solid transparent;
      border-radius: var(--ui-sys-shape-card);
      cursor: pointer;
      transition: border-color var(--ui-sys-motion-control),
                  background-color var(--ui-sys-motion-control);
    }
    :host([variant="dot"]) button { padding: 2px; border-radius: var(--ui-sys-shape-pill); }
    button:hover { background: color-mix(in srgb, var(--ui-sys-on-surface) calc(var(--ui-sys-state-hover-opacity) * 100%), transparent); }
    button:active { background: color-mix(in srgb, var(--ui-sys-on-surface) calc(var(--ui-sys-state-pressed-opacity) * 100%), transparent); }
    button:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 1px;
    }
    :host([selected]) button {
      border-color: var(--swatch-border, var(--ui-sys-outline));
    }
    :host([disabled]) button {
      cursor: default;
      color: var(--ui-sys-on-surface-faint);
      opacity: .55;
    }
    .circle {
      width: 44px; height: 44px;
      border-radius: var(--ui-sys-shape-pill);
      background: var(--swatch-bg, var(--ui-sys-surface-container));
      border: 1px solid var(--swatch-border, var(--ui-sys-outline));
      display: inline-flex; align-items: center; justify-content: center;
    }
    :host([variant="dot"]) .circle { width: 22px; height: 22px; }
    :host([selected][variant="dot"]) .circle {
      box-shadow: 0 0 0 2px var(--ui-sys-surface-card),
                  0 0 0 3px var(--swatch-border, var(--ui-sys-on-surface));
    }
    .dot {
      width: 16px; height: 16px;
      border-radius: var(--ui-sys-shape-pill);
      background: var(--swatch-dot, transparent);
    }
    :host([variant="dot"]) .dot, :host([variant="dot"]) .name, :host([variant="dot"]) .sub { display: none; }
    .name { font: var(--ui-sys-font-label); }
    .sub  { font: var(--ui-sys-font-caption); color: var(--ui-sys-on-surface-muted); }
  </style>
  <button type="button" role="radio" aria-checked="false" part="button">
    <span class="circle" part="circle"><span class="dot" part="dot"></span></span>
    <span class="name" part="name"></span>
    <span class="sub" part="sub"></span>
  </button>
`;

class UiSwatchCard extends HTMLElement {
  static observedAttributes = [
    'value', 'label', 'sublabel', 'selected', 'variant',
    'swatch-bg', 'swatch-dot', 'swatch-border', 'disabled', 'title',
  ];

  #btn;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#btn = this.shadowRoot.querySelector('button');
  }

  connectedCallback() {
    this.#btn.addEventListener('click', this.#onSelect);
    this.#btn.addEventListener('keydown', this.#onKey);
    this.#sync();
  }

  disconnectedCallback() {
    this.#btn.removeEventListener('click', this.#onSelect);
    this.#btn.removeEventListener('keydown', this.#onKey);
  }

  attributeChangedCallback() { if (this.#btn) this.#sync(); }

  get value() { return this.getAttribute('value') || ''; }
  get selected() { return this.hasAttribute('selected'); }
  set selected(v) { v ? this.setAttribute('selected', '') : this.removeAttribute('selected'); }

  focus() { this.#btn.focus(); }

  #sync() {
    const q = (s) => this.shadowRoot.querySelector(s);
    q('.name').textContent = this.getAttribute('label') || '';
    q('.sub').textContent = this.getAttribute('sublabel') || '';
    // Preview colors flow into shadow parts as custom properties on the host —
    // the ONE bridge; values are token refs or data, never component CSS.
    for (const [attr, prop] of [
      ['swatch-bg', '--swatch-bg'], ['swatch-dot', '--swatch-dot'],
      ['swatch-border', '--swatch-border'],
    ]) {
      const v = this.getAttribute(attr);
      if (v) this.style.setProperty(prop, v); else this.style.removeProperty(prop);
    }
    this.#btn.setAttribute('aria-checked', String(this.hasAttribute('selected')));
    this.#btn.disabled = this.hasAttribute('disabled');
    const label = [this.getAttribute('label'), this.getAttribute('sublabel')]
      .filter(Boolean).join(' — ') || this.getAttribute('title') || this.value;
    this.#btn.setAttribute('aria-label', label);
    if (this.hasAttribute('title')) this.#btn.title = this.getAttribute('title');
    // Roving tabindex inside a radiogroup: the selected card is the tab stop.
    const group = this.closest('[role="radiogroup"]');
    if (group) {
      const sibs = [...group.querySelectorAll('ui-swatch-card')];
      const anySelected = sibs.some((s) => s.hasAttribute('selected'));
      this.#btn.tabIndex = (!anySelected && sibs[0] === this) || this.hasAttribute('selected') ? 0 : -1;
    }
  }

  #onSelect = () => {
    if (this.hasAttribute('disabled')) return;
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true, composed: true, detail: { value: this.value },
    }));
  };

  #onKey = (e) => {
    const group = this.closest('[role="radiogroup"]');
    if (!group) return;
    const forward = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    const backward = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    if (!forward && !backward) return;
    e.preventDefault();
    const cards = [...group.querySelectorAll('ui-swatch-card:not([disabled])')];
    const i = cards.indexOf(this);
    if (i < 0) return;
    const next = cards[(i + (forward ? 1 : cards.length - 1)) % cards.length];
    next.focus();
    next.#onSelect();
  };
}

if (!customElements.get('ui-swatch-card')) {
  customElements.define('ui-swatch-card', UiSwatchCard);
}
