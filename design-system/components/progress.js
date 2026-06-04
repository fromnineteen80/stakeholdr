/* ============================================================================
 * <ui-linear-progress> + <ui-circular-progress> — progress indicators.
 * Both in one file.
 * Attrs: value (0..1), indeterminate.
 * Track: --ui-sys-surface-container-high. Indicator: --ui-sys-primary.
 * ARIA role=progressbar.
 * ==========================================================================*/

/* ---- <ui-linear-progress> ----------------------------------------------- */

const linearTemplate = document.createElement('template');
linearTemplate.innerHTML = `
  <style>
    :host {
      display: block;
      width: 100%;
    }

    .track {
      position: relative;
      width: 100%;
      height: 4px;
      background: var(--ui-sys-surface-container-high);
      border-radius: var(--ui-sys-shape-pill);
      overflow: hidden;
    }

    .indicator {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      background: var(--ui-sys-primary);
      border-radius: var(--ui-sys-shape-pill);
      transform-origin: left center;
      transition: transform var(--ui-sys-motion-control);
    }

    /* Indeterminate animation */
    :host([indeterminate]) .indicator {
      width: 40%;
      animation: linear-indeterminate 1.4s var(--ui-ref-easing-standard, cubic-bezier(0.2,0,0,1)) infinite;
    }

    @keyframes linear-indeterminate {
      0%   { transform: translateX(-100%) scaleX(1); }
      40%  { transform: translateX(100%) scaleX(1.5); }
      100% { transform: translateX(250%) scaleX(1); }
    }

    :host(:not([indeterminate])) .indicator {
      width: 100%;
      /* width driven by transform scale from JS */
    }
  </style>
  <div class="track" part="track">
    <div class="indicator" part="indicator"></div>
  </div>
`;

class UiLinearProgress extends HTMLElement {
  static observedAttributes = ['value', 'indeterminate'];

  #indicator;
  #track;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(linearTemplate.content.cloneNode(true));
    this.#indicator = this.shadowRoot.querySelector('.indicator');
    this.#track = this.shadowRoot.querySelector('.track');
  }

  connectedCallback() {
    this.setAttribute('role', 'progressbar');
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const indeterminate = this.hasAttribute('indeterminate');
    const value = Math.min(1, Math.max(0, parseFloat(this.getAttribute('value') ?? '0')));

    if (indeterminate) {
      this.removeAttribute('aria-valuenow');
      this.removeAttribute('aria-valuemin');
      this.removeAttribute('aria-valuemax');
      this.#indicator.style.transform = '';
    } else {
      this.setAttribute('aria-valuenow', String(Math.round(value * 100)));
      this.setAttribute('aria-valuemin', '0');
      this.setAttribute('aria-valuemax', '100');
      this.#indicator.style.transform = `scaleX(${value})`;
    }
  }
}

if (!customElements.get('ui-linear-progress')) {
  customElements.define('ui-linear-progress', UiLinearProgress);
}

/* ---- <ui-circular-progress> --------------------------------------------- */

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const circularTemplate = document.createElement('template');
circularTemplate.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
    }

    svg {
      transform: rotate(-90deg);
    }

    .track {
      fill: none;
      stroke: var(--ui-sys-surface-container-high);
      stroke-width: 3.5;
    }

    .indicator {
      fill: none;
      stroke: var(--ui-sys-primary);
      stroke-width: 3.5;
      stroke-linecap: round;
      stroke-dasharray: ${CIRCUMFERENCE};
      stroke-dashoffset: ${CIRCUMFERENCE};
      transition: stroke-dashoffset var(--ui-sys-motion-control);
    }

    :host([indeterminate]) .indicator {
      animation: circular-indeterminate 1.2s linear infinite;
      stroke-dashoffset: ${CIRCUMFERENCE * 0.75};
    }
    :host([indeterminate]) svg {
      animation: circular-rotate 1.2s linear infinite;
    }

    @keyframes circular-rotate {
      to { transform: rotate(270deg); }
    }
    @keyframes circular-indeterminate {
      0%   { stroke-dashoffset: ${CIRCUMFERENCE * 0.9}; }
      50%  { stroke-dashoffset: ${CIRCUMFERENCE * 0.35}; }
      100% { stroke-dashoffset: ${CIRCUMFERENCE * 0.9}; }
    }
  </style>
  <svg viewBox="0 0 44 44" width="44" height="44" aria-hidden="true">
    <circle class="track" cx="22" cy="22" r="${RADIUS}"/>
    <circle class="indicator" cx="22" cy="22" r="${RADIUS}"/>
  </svg>
`;

class UiCircularProgress extends HTMLElement {
  static observedAttributes = ['value', 'indeterminate'];

  #indicator;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(circularTemplate.content.cloneNode(true));
    this.#indicator = this.shadowRoot.querySelector('.indicator');
  }

  connectedCallback() {
    this.setAttribute('role', 'progressbar');
    this.#sync();
  }

  attributeChangedCallback() {
    this.#sync();
  }

  #sync() {
    const indeterminate = this.hasAttribute('indeterminate');
    const value = Math.min(1, Math.max(0, parseFloat(this.getAttribute('value') ?? '0')));

    if (indeterminate) {
      this.removeAttribute('aria-valuenow');
      this.removeAttribute('aria-valuemin');
      this.removeAttribute('aria-valuemax');
      this.#indicator.style.strokeDashoffset = '';
    } else {
      this.setAttribute('aria-valuenow', String(Math.round(value * 100)));
      this.setAttribute('aria-valuemin', '0');
      this.setAttribute('aria-valuemax', '100');
      const offset = CIRCUMFERENCE * (1 - value);
      this.#indicator.style.strokeDashoffset = String(offset);
    }
  }
}

if (!customElements.get('ui-circular-progress')) {
  customElements.define('ui-circular-progress', UiCircularProgress);
}
