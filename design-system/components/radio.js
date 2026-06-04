/* ============================================================================
 * <ui-radio> — selection control. Groups by `name` attribute; selecting one
 * unchecks all siblings with the same name in the same root. Arrow-key navigation
 * within the group. formAssociated.
 * Styled ONLY via --ui-sys-* tokens.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--ui-sys-space-2);
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    :host([disabled]) {
      pointer-events: none;
      cursor: default;
    }

    /* ---- outer ring ---- */
    .ring {
      position: relative;
      isolation: isolate;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      border: 2px solid var(--ui-sys-outline);
      border-radius: 50%;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      transition: border-color var(--ui-sys-motion-control);
    }

    :host([checked]) .ring {
      border-color: var(--ui-sys-primary);
    }

    :host([disabled]) .ring {
      border-color: var(--ui-sys-on-surface-faint);
    }

    /* ---- inner dot ---- */
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--ui-sys-primary);
      transform: scale(0);
      transition: transform var(--ui-sys-motion-emphasis);
    }
    :host([checked]) .dot   { transform: scale(1); }
    :host([disabled]) .dot  { background: var(--ui-sys-on-surface-faint); }

    /* state layer */
    .ring::before {
      content: "";
      position: absolute;
      inset: -7px;
      border-radius: 50%;
      background: var(--ui-sys-primary);
      opacity: 0;
      z-index: -1;
      transition: opacity var(--ui-sys-motion-control);
    }
    :host(:not([checked])) .ring::before {
      background: var(--ui-sys-on-surface);
    }
    :host(:hover) .ring::before  { opacity: var(--ui-sys-state-hover-opacity); }
    :host(:active) .ring::before { opacity: var(--ui-sys-state-pressed-opacity); }

    /* focus ring */
    :host(:focus-visible) .ring {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    /* ---- label ---- */
    .label {
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
    }
    :host([disabled]) .label {
      color: var(--ui-sys-on-surface-faint);
    }
  </style>

  <div class="ring" part="ring">
    <div class="dot" part="dot"></div>
  </div>
  <span class="label" part="label"><slot></slot></span>
`;

class UiRadio extends HTMLElement {
  static formAssociated = true;
  static observedAttributes = ['checked', 'disabled', 'name', 'value'];

  #internals;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#internals = this.attachInternals?.();
  }

  connectedCallback() {
    if (!this.hasAttribute('tabindex')) this.setAttribute('tabindex', '0');
    this.setAttribute('role', 'radio');
    this.#updateAria();
    this.addEventListener('click',   this.#onClick);
    this.addEventListener('keydown', this.#onKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener('click',   this.#onClick);
    this.removeEventListener('keydown', this.#onKeydown);
  }

  attributeChangedCallback(name) {
    this.#updateAria();
    if (name === 'checked') this.#updateFormValue();
  }

  get checked() { return this.hasAttribute('checked'); }
  set checked(v) { v ? this.setAttribute('checked', '') : this.removeAttribute('checked'); }

  get value() { return this.getAttribute('value') || 'on'; }

  #updateAria() {
    this.setAttribute('aria-checked',  String(this.hasAttribute('checked')));
    this.setAttribute('aria-disabled', String(this.hasAttribute('disabled')));
  }

  #updateFormValue() {
    this.#internals?.setFormValue(this.hasAttribute('checked') ? this.value : null);
  }

  #getGroup() {
    const name = this.getAttribute('name');
    if (!name) return [];
    const root = this.getRootNode();
    return Array.from(root.querySelectorAll(`ui-radio[name="${CSS.escape(name)}"]`));
  }

  #select() {
    if (this.hasAttribute('disabled') || this.hasAttribute('checked')) return;

    // Uncheck all siblings in the group
    this.#getGroup().forEach(r => {
      if (r !== this && r.hasAttribute('checked')) {
        r.removeAttribute('checked');
        r.setAttribute('tabindex', '-1');
      }
    });

    this.setAttribute('checked', '');
    this.setAttribute('tabindex', '0');
    this.#updateFormValue();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('input',  { bubbles: true, composed: true }));
  }

  #onClick = () => this.#select();

  #onKeydown = (e) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      this.#select();
      return;
    }

    // Arrow navigation within the group
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
    e.preventDefault();

    const group = this.#getGroup().filter(r => !r.hasAttribute('disabled'));
    if (group.length < 2) return;

    const idx  = group.indexOf(this);
    const next = (e.key === 'ArrowDown' || e.key === 'ArrowRight')
      ? (idx + 1) % group.length
      : (idx - 1 + group.length) % group.length;

    group[next].focus();
    group[next].#select();
  };
}

if (!customElements.get('ui-radio')) {
  customElements.define('ui-radio', UiRadio);
}
