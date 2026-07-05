/* ============================================================================
 * <ui-color-field> — the custom-color escape hatch (GAP component; the
 * Canonical UI home of the sealed BeakerColorField: a Material Symbols
 * "science" flask tinted to the current value, with a HIDDEN native
 * <input type="color"> overlaid on top that opens the OS color picker —
 * the flask glyph is the affordance, the OS picker is the mechanism).
 * The raw input lives INSIDE the shadow root, the one legal home for the
 * primitive under the app-code composition guard (the ui-upload precedent).
 *
 * Attributes:
 *   value    — the current color (a data value from app state, e.g. "#B5552C")
 *   disabled — disables the picker
 *   title    — tooltip (default "Pick a custom color", the sealed copy)
 *
 * Events (composed: true):
 *   change → detail { value } — the picked color, on every native change.
 * ==========================================================================*/

import './icon.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      position: relative;
      display: inline-flex; align-items: center; justify-content: center;
      width: var(--ui-sys-control-height); height: var(--ui-sys-control-height);
      border-radius: var(--ui-sys-shape-control);
      color: var(--field-value, var(--ui-sys-on-surface));
      cursor: pointer;
      transition: background-color var(--ui-sys-motion-control);
    }
    :host(:hover) { background: color-mix(in srgb, var(--ui-sys-on-surface) calc(var(--ui-sys-state-hover-opacity) * 100%), transparent); }
    :host(:focus-within) { outline: 2px solid var(--ui-sys-focus-ring); outline-offset: 1px; }
    :host([disabled]) { pointer-events: none; color: var(--ui-sys-on-surface-faint); }
    input[type="color"] {
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      opacity: 0; margin: 0; padding: 0; border: 0;
      cursor: pointer;
    }
  </style>
  <ui-icon size="md" aria-hidden="true">science</ui-icon>
  <input type="color" aria-label="Pick a custom color" />
`;

class UiColorField extends HTMLElement {
  static observedAttributes = ['value', 'disabled', 'title'];

  #input;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#input = this.shadowRoot.querySelector('input');
  }

  connectedCallback() {
    if (!this.hasAttribute('title')) this.setAttribute('title', 'Pick a custom color');
    this.#input.addEventListener('change', this.#onChange);
    this.#input.addEventListener('input', this.#onChange);
    this.#sync();
  }

  disconnectedCallback() {
    this.#input.removeEventListener('change', this.#onChange);
    this.#input.removeEventListener('input', this.#onChange);
  }

  attributeChangedCallback() { if (this.#input) this.#sync(); }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { v ? this.setAttribute('value', v) : this.removeAttribute('value'); }

  #sync() {
    const v = this.getAttribute('value') || '';
    // Tint the flask to the live value (a data value from state — the host
    // custom property is the one bridge; falls back to on-surface ink).
    if (/^#[0-9a-fA-F]{6}$/.test(v)) {
      this.style.setProperty('--field-value', v);
      this.#input.value = v;
    } else {
      this.style.removeProperty('--field-value');
    }
    this.#input.disabled = this.hasAttribute('disabled');
    this.#input.setAttribute('aria-label', this.getAttribute('title') || 'Pick a custom color');
  }

  #onChange = () => {
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true, composed: true, detail: { value: this.#input.value },
    }));
  };
}

if (!customElements.get('ui-color-field')) {
  customElements.define('ui-color-field', UiColorField);
}
