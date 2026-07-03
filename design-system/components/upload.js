/* ============================================================================
 * <ui-upload> — file-pick control (GAP component; the Canonical UI home of the
 * oracle's label-wrapped hidden file input from the stakeholder modal's photo
 * row). Built to the ui-button bar: real custom element, shadow DOM,
 * token-only styling (all chrome comes from the composed <ui-button>).
 *
 * Anatomy: a real <ui-button> (default slot = its label text, e.g.
 * "Upload photo" / "Replace photo") + a HIDDEN native <input type="file">
 * INSIDE the shadow root — the one legal place a raw file input lives (the
 * app-code composition guard bans raw inputs in app JSX; the component owns
 * the primitive, exactly like ui-text-field owns its <input>).
 *
 * Attributes:
 *   accept    — passed through to the file input (e.g. "image/*")
 *   disabled  — disables the composed button (and the picker)
 *   variant   — forwarded to the inner ui-button (default "outlined")
 *
 * Events (composed: true):
 *   change → detail { dataUrl, name } — the FIRST selected file, read via
 *            FileReader.readAsDataURL (the sealed photo mechanism). The
 *            native input is cleared after each read so re-picking the SAME
 *            file fires again.
 * ==========================================================================*/

import './button.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host { display: inline-flex; vertical-align: middle; }
    :host([disabled]) { pointer-events: none; }
    input[type="file"] { display: none; }
  </style>
  <ui-button part="button" variant="outlined"><slot>Upload</slot></ui-button>
  <input type="file" tabindex="-1" aria-hidden="true" />
`;

class UiUpload extends HTMLElement {
  static observedAttributes = ['accept', 'disabled', 'variant'];

  #button;
  #input;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#button = this.shadowRoot.querySelector('ui-button');
    this.#input = this.shadowRoot.querySelector('input');
  }

  connectedCallback() {
    this.#button.addEventListener('click', this.#onPick);
    this.#input.addEventListener('change', this.#onFile);
    this.#sync();
  }

  disconnectedCallback() {
    this.#button.removeEventListener('click', this.#onPick);
    this.#input.removeEventListener('change', this.#onFile);
  }

  attributeChangedCallback() { this.#sync(); }

  #sync() {
    this.#input.accept = this.getAttribute('accept') || '';
    if (this.hasAttribute('disabled')) this.#button.setAttribute('disabled', '');
    else this.#button.removeAttribute('disabled');
    this.#button.setAttribute('variant', this.getAttribute('variant') || 'outlined');
  }

  #onPick = () => {
    if (this.hasAttribute('disabled')) return;
    this.#input.click();
  };

  #onFile = () => {
    const file = this.#input.files && this.#input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      this.dispatchEvent(new CustomEvent('change', {
        bubbles: true, composed: true,
        detail: { dataUrl: reader.result, name: file.name },
      }));
      this.#input.value = ''; // re-picking the same file must fire again
    };
    reader.readAsDataURL(file);
  };
}

if (!customElements.get('ui-upload')) {
  customElements.define('ui-upload', UiUpload);
}
