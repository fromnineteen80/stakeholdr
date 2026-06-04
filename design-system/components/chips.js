/* ============================================================================
 * <ui-chip-set> + <ui-chip> — chip variants: assist|filter|input|suggestion
 *
 * Usage:
 *   <ui-chip-set>
 *     <ui-chip variant="filter" selected>Published</ui-chip>
 *     <ui-chip variant="input">React <span slot="remove">×</span></ui-chip>
 *     <ui-chip variant="assist">
 *       <svg slot="icon">…</svg>
 *       Help
 *     </ui-chip>
 *   </ui-chip-set>
 *
 * Attrs on <ui-chip>:
 *   variant  — assist | filter | input | suggestion  (default: assist)
 *   selected — boolean, meaningful for filter chips
 *   disabled — boolean
 *
 * filter chips: click toggles selected, emits change(detail:{selected})
 * input chips: show × remove button, emits remove (composed:true)
 * assist/suggestion: emits click (native, composed:true)
 * ==========================================================================*/

/* ---- <ui-chip-set> ------------------------------------------------------- */

const setTpl = document.createElement('template');
setTpl.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: var(--ui-sys-space-2);
      align-items: center;
    }
  </style>
  <slot></slot>
`;

class UiChipSet extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(setTpl.content.cloneNode(true));
  }
  connectedCallback() {
    this.setAttribute('role', 'group');
  }
}

if (!customElements.get('ui-chip-set')) customElements.define('ui-chip-set', UiChipSet);


/* ---- <ui-chip> ----------------------------------------------------------- */

const chipTpl = document.createElement('template');
chipTpl.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      vertical-align: middle;
      --_bg:     var(--ui-sys-surface-card);
      --_border: var(--ui-sys-outline);
      --_fg:     var(--ui-sys-on-surface);
    }

    /* variant bg/border overrides */
    :host([variant="filter"][selected]) {
      --_bg:     var(--ui-sys-primary-container);
      --_border: transparent;
      --_fg:     var(--ui-sys-on-primary-container);
    }
    :host([variant="suggestion"]) {
      --_bg:     var(--ui-sys-surface-container);
      --_border: transparent;
    }

    .chip {
      position: relative;
      isolation: isolate;
      display: inline-flex;
      align-items: center;
      gap: var(--ui-sys-space-1);
      height: 32px;
      padding: 0 var(--ui-sys-space-3);
      border: 1px solid var(--_border);
      border-radius: var(--ui-sys-shape-pill);
      background: var(--_bg);
      color: var(--_fg);
      font: var(--ui-sys-font-label);
      cursor: pointer;
      user-select: none;
      transition: background var(--ui-sys-motion-control),
                  border-color var(--ui-sys-motion-control);
      outline: none;
      white-space: nowrap;
    }

    /* state layer */
    .chip::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: currentColor;
      opacity: 0;
      transition: opacity var(--ui-sys-motion-control);
      pointer-events: none;
    }
    .chip:hover::before  { opacity: var(--ui-sys-state-hover-opacity); }
    .chip:active::before { opacity: var(--ui-sys-state-pressed-opacity); }

    :host(:focus-visible) .chip {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    :host([disabled]) { pointer-events: none; }
    :host([disabled]) .chip {
      color: var(--ui-sys-on-surface-faint);
      border-color: var(--ui-sys-on-surface-faint);
      background: transparent;
      cursor: default;
    }

    /* icon slot */
    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      margin-left: calc(var(--ui-sys-space-1) * -0.5);
    }
    .icon:not(.has-icon) { display: none; }
    ::slotted([slot="icon"]) { display: block; width: 18px; height: 18px; }

    /* checkmark for selected filter chips */
    .check {
      display: none;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      margin-left: calc(var(--ui-sys-space-1) * -0.5);
      align-items: center;
      justify-content: center;
    }
    :host([variant="filter"][selected]) .check { display: flex; }
    :host([variant="filter"][selected]) .icon  { display: none; }

    /* remove button for input chips */
    .remove {
      display: none;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      flex-shrink: 0;
      margin-right: calc(var(--ui-sys-space-1) * -0.5);
      border-radius: 50%;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      color: var(--ui-sys-on-surface-muted);
      transition: background var(--ui-sys-motion-control);
    }
    :host([variant="input"]) .remove { display: flex; }
    .remove:hover { background: var(--ui-sys-surface-container); }
    .remove:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 1px;
    }
  </style>
  <div class="chip" part="chip" tabindex="0">
    <span class="icon" part="icon"><slot name="icon"></slot></span>
    <span class="check" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" stroke-width="1.5"
              stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </span>
    <slot></slot>
    <span class="remove" part="remove" tabindex="0" aria-label="Remove" role="button">×</span>
  </div>
`;

class UiChip extends HTMLElement {
  static observedAttributes = ['variant', 'selected', 'disabled'];

  #chip;
  #iconSlot;
  #removeBtn;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(chipTpl.content.cloneNode(true));
    this.#chip      = this.shadowRoot.querySelector('.chip');
    this.#iconSlot  = this.shadowRoot.querySelector('slot[name="icon"]');
    this.#removeBtn = this.shadowRoot.querySelector('.remove');
  }

  connectedCallback() {
    if (!this.hasAttribute('variant')) this.setAttribute('variant', 'assist');
    this.#syncRole();
    this.#chip.addEventListener('click', this.#onClick);
    this.#chip.addEventListener('keydown', this.#onKeydown);
    this.#removeBtn.addEventListener('click', this.#onRemoveClick);
    this.#removeBtn.addEventListener('keydown', this.#onRemoveKeydown);
    this.#iconSlot.addEventListener('slotchange', this.#onIconSlotChange);
    this.#onIconSlotChange();
    this.#syncSelected();
  }

  disconnectedCallback() {
    this.#chip.removeEventListener('click', this.#onClick);
    this.#chip.removeEventListener('keydown', this.#onKeydown);
    this.#removeBtn.removeEventListener('click', this.#onRemoveClick);
    this.#removeBtn.removeEventListener('keydown', this.#onRemoveKeydown);
    this.#iconSlot.removeEventListener('slotchange', this.#onIconSlotChange);
  }

  attributeChangedCallback(name) {
    if (name === 'variant')  this.#syncRole();
    if (name === 'selected') this.#syncSelected();
    if (name === 'disabled') {
      const d = this.hasAttribute('disabled');
      this.#chip.setAttribute('aria-disabled', String(d));
      this.#chip.setAttribute('tabindex', d ? '-1' : '0');
    }
  }

  get selected() { return this.hasAttribute('selected'); }
  set selected(v) { v ? this.setAttribute('selected', '') : this.removeAttribute('selected'); }

  #syncRole() {
    const v = this.getAttribute('variant') || 'assist';
    if (v === 'filter') {
      this.setAttribute('role', 'checkbox');
    } else if (v === 'input' || v === 'assist' || v === 'suggestion') {
      this.setAttribute('role', 'button');
    }
  }

  #syncSelected() {
    const sel = this.hasAttribute('selected');
    this.#chip.setAttribute('aria-checked', String(sel));
    this.#chip.setAttribute('aria-pressed', String(sel));
  }

  #onIconSlotChange = () => {
    const iconEl = this.shadowRoot.querySelector('.icon');
    iconEl.classList.toggle('has-icon', this.#iconSlot.assignedElements().length > 0);
  };

  #onClick = (e) => {
    if (this.hasAttribute('disabled')) return;
    // Don't toggle if click was on remove button
    if (e.target === this.#removeBtn || this.#removeBtn.contains(e.target)) return;
    const v = this.getAttribute('variant') || 'assist';
    if (v === 'filter') {
      this.selected = !this.selected;
      this.dispatchEvent(new CustomEvent('change', {
        bubbles: true, composed: true,
        detail: { selected: this.selected }
      }));
    }
    // assist/suggestion/input: native click bubbles naturally
  };

  #onKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.#chip.click();
    }
  };

  #onRemoveClick = (e) => {
    e.stopPropagation();
    if (this.hasAttribute('disabled')) return;
    this.dispatchEvent(new CustomEvent('remove', { bubbles: true, composed: true }));
  };

  #onRemoveKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Backspace') {
      e.preventDefault();
      e.stopPropagation();
      this.#onRemoveClick(e);
    }
  };
}

if (!customElements.get('ui-chip')) customElements.define('ui-chip', UiChip);
