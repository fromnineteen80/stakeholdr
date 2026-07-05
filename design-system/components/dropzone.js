/* ============================================================================
 * <ui-dropzone> — file drop target (GAP component, built 2026-07-05 for the
 * Phase-18 import wizard per the sealed Demo-features BUILD-MAP: "If a
 * reusable drop target proves to need real drag-over/error states beyond
 * this composition, that is a GAP → build ui-dropzone INTO design-system/,
 * register it in manifest.json, THEN use it — never a div-with-styles in app
 * code." It does need them: drag-over highlight, rejected-type error state,
 * keyboard/browse fallback — so the component exists. Built to the ui-button
 * quality bar: real custom element, shadow DOM, full states + a11y,
 * token-only styling.
 *
 * Anatomy: a dashed bordered target hosting a large <ui-icon> (default
 * "upload_file", override via the `icon` attribute), the host copy (default
 * slot; e.g. "Drop your .xlsx or .csv here, or"), a composed
 * <ui-button variant="outlined"> "Browse files" (label via the
 * `browse-label` attribute), and a HIDDEN native <input type="file"> inside
 * the shadow root (the ui-upload precedent — the one legal home of the raw
 * primitive). A status line below the copy reflects the selected file or the
 * rejection message.
 *
 * Attributes:
 *   accept       — comma-separated extension list checked on BOTH the picker
 *                  and the drop (e.g. ".xlsx,.csv"); also forwarded to the
 *                  native input. Extension match is case-insensitive.
 *   disabled     — inert target (no drop, no picker, faint ink)
 *   icon         — the ui-icon ligature (default "upload_file")
 *   browse-label — the composed button's label (default "Browse files")
 *
 * States (attribute-reflected so hosts can style-hook if ever needed):
 *   dragover — a dragged file is over the target (accent border + tint)
 *   error    — the last pick/drop was rejected (error border + message);
 *              cleared by the next valid interaction
 *
 * Events (composed: true):
 *   file   → detail { file, name } — ONE accepted File object (first of a
 *            multi-drop). The host owns all reading/parsing.
 *   reject → detail { name, reason } — a file failed the accept filter.
 *
 * A11y (Phase-18 fix): the zone is a LABELLED GROUP (role="group",
 * aria-label from the accept list) — never role="button", because it
 * CONTAINS a real interactive descendant (the composed Browse ui-button),
 * and a button role may not nest interactive content. The keyboard
 * affordance is the inner Browse button itself (it opens the picker
 * DIRECTLY, not via bubbling); the zone keeps click-to-browse for pointer
 * users plus the drag events.
 * ==========================================================================*/

import './button.js';
import './icon.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
    }
    .zone {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--ui-sys-space-3);
      padding: calc(var(--ui-sys-space-6) + var(--ui-sys-space-2)) var(--ui-sys-space-6);
      border: 2px dashed var(--ui-sys-outline);
      border-radius: var(--ui-sys-shape-card);
      background: var(--ui-sys-surface-field);
      color: var(--ui-sys-on-surface-muted);
      font: var(--ui-sys-font-body);
      text-align: center;
      cursor: pointer;
      outline: none;
      transition: border-color var(--ui-sys-motion-control),
                  background var(--ui-sys-motion-control);
    }
    .zone:hover { border-color: var(--ui-sys-on-surface-muted); }
    :host([dragover]) .zone {
      border-color: var(--ui-sys-accent);
      background: var(--ui-sys-accent-tint-faint);
      color: var(--ui-sys-on-surface);
    }
    :host([error]) .zone { border-color: var(--ui-sys-error); }
    :host([disabled]) { pointer-events: none; }
    :host([disabled]) .zone {
      border-color: var(--ui-sys-on-surface-faint);
      color: var(--ui-sys-on-surface-faint);
      cursor: default;
    }

    .icon-wrap ui-icon { color: inherit; }
    .copy { display: flex; flex-direction: column; gap: var(--ui-sys-space-1); }
    .status {
      font: var(--ui-sys-font-caption);
      color: var(--ui-sys-on-surface-muted);
      min-height: 1.2em;
    }
    :host([error]) .status { color: var(--ui-sys-error); }
    .status:empty { display: none; }

    input[type="file"] { display: none; }
  </style>
  <div class="zone" part="zone" role="group">
    <span class="icon-wrap" aria-hidden="true"><ui-icon size="xl">upload_file</ui-icon></span>
    <span class="copy"><slot>Drop a file here, or</slot></span>
    <ui-button variant="outlined" part="browse">Browse files</ui-button>
    <span class="status" part="status" role="status" aria-live="polite"></span>
  </div>
  <input type="file" tabindex="-1" aria-hidden="true" />
`;

class UiDropzone extends HTMLElement {
  static observedAttributes = ['accept', 'disabled', 'icon', 'browse-label'];

  #zone;
  #input;
  #button;
  #iconEl;
  #status;
  #dragDepth = 0;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#zone = this.shadowRoot.querySelector('.zone');
    this.#input = this.shadowRoot.querySelector('input');
    this.#button = this.shadowRoot.querySelector('ui-button');
    this.#iconEl = this.shadowRoot.querySelector('.icon-wrap ui-icon');
    this.#status = this.shadowRoot.querySelector('.status');
  }

  connectedCallback() {
    this.#zone.addEventListener('click', this.#onZoneClick);
    this.#button.addEventListener('click', this.#onBrowseClick);
    this.#zone.addEventListener('dragenter', this.#onDragEnter);
    this.#zone.addEventListener('dragover', this.#onDragOver);
    this.#zone.addEventListener('dragleave', this.#onDragLeave);
    this.#zone.addEventListener('drop', this.#onDrop);
    this.#input.addEventListener('change', this.#onPick);
    this.#sync();
  }

  disconnectedCallback() {
    this.#zone.removeEventListener('click', this.#onZoneClick);
    this.#button.removeEventListener('click', this.#onBrowseClick);
    this.#zone.removeEventListener('dragenter', this.#onDragEnter);
    this.#zone.removeEventListener('dragover', this.#onDragOver);
    this.#zone.removeEventListener('dragleave', this.#onDragLeave);
    this.#zone.removeEventListener('drop', this.#onDrop);
    this.#input.removeEventListener('change', this.#onPick);
  }

  attributeChangedCallback() { this.#sync(); }

  #sync() {
    this.#input.accept = this.getAttribute('accept') || '';
    this.#iconEl.textContent = this.getAttribute('icon') || 'upload_file';
    this.#button.textContent = this.getAttribute('browse-label') || 'Browse files';
    // The zone itself is NOT focusable — the inner Browse ui-button is the
    // one tab stop and keyboard affordance (interactive-descendant law).
    if (this.hasAttribute('disabled')) {
      this.#button.setAttribute('disabled', '');
      this.#zone.setAttribute('aria-disabled', 'true');
    } else {
      this.#button.removeAttribute('disabled');
      this.#zone.removeAttribute('aria-disabled');
    }
    const accept = this.getAttribute('accept');
    this.#zone.setAttribute('aria-label',
      accept ? `Upload a file (${accept})` : 'Upload a file');
  }

  #acceptList() {
    return (this.getAttribute('accept') || '')
      .split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  }

  #accepts(name) {
    const list = this.#acceptList();
    if (!list.length) return true;
    const lower = String(name || '').toLowerCase();
    return list.some((ext) => lower.endsWith(ext));
  }

  #take(file) {
    if (!file) return;
    if (!this.#accepts(file.name)) {
      this.setAttribute('error', '');
      const reason = `Not an accepted file type (${this.#acceptList().join(', ')})`;
      this.#status.textContent = `${file.name} — ${reason}`;
      this.dispatchEvent(new CustomEvent('reject', {
        bubbles: true, composed: true, detail: { name: file.name, reason },
      }));
      return;
    }
    this.removeAttribute('error');
    this.#status.textContent = file.name;
    this.dispatchEvent(new CustomEvent('file', {
      bubbles: true, composed: true, detail: { file, name: file.name },
    }));
  }

  /* Public reset — a host reopening its flow clears the previous status. */
  reset() {
    this.removeAttribute('error');
    this.removeAttribute('dragover');
    this.#dragDepth = 0;
    this.#status.textContent = '';
    this.#input.value = '';
  }

  /* Pointer affordance only — the zone has no button role/tab stop. */
  #onZoneClick = () => {
    if (this.hasAttribute('disabled')) return;
    this.#input.click();
  };

  /* The Browse button opens the picker DIRECTLY (never via bubbling to the
   * zone) and stops propagation so the zone handler cannot double-open. */
  #onBrowseClick = (e) => {
    e.stopPropagation();
    if (this.hasAttribute('disabled')) return;
    this.#input.click();
  };

  #onPick = () => {
    const file = this.#input.files && this.#input.files[0];
    this.#take(file);
    this.#input.value = ''; // re-picking the same file must fire again
  };

  #onDragEnter = (e) => {
    if (this.hasAttribute('disabled')) return;
    e.preventDefault();
    this.#dragDepth += 1;
    this.setAttribute('dragover', '');
  };

  #onDragOver = (e) => {
    if (this.hasAttribute('disabled')) return;
    e.preventDefault(); // required, or the browser navigates on drop
  };

  #onDragLeave = () => {
    this.#dragDepth = Math.max(0, this.#dragDepth - 1);
    if (!this.#dragDepth) this.removeAttribute('dragover');
  };

  #onDrop = (e) => {
    if (this.hasAttribute('disabled')) return;
    e.preventDefault();
    this.#dragDepth = 0;
    this.removeAttribute('dragover');
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    this.#take(file);
  };
}

if (!customElements.get('ui-dropzone')) {
  customElements.define('ui-dropzone', UiDropzone);
}
