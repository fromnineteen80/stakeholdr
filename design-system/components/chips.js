/* ============================================================================
 * <ui-chip-set> + <ui-chip> — chip variants: assist|filter|input|suggestion
 * plus the sealed PRESENTATIONAL pill variants: priority|zone|tag|segment —
 * and the companion <ui-status-dot> element (sealed Shared-UI-primitives box;
 * segment = the sealed SegmentBadge, Workspaces box, value attr = the segment
 * name, unknown → the Corporate Functions pair).
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
 *   <ui-chip variant="priority" value="High">High</ui-chip>
 *   <ui-chip variant="zone" data-zone="Strategic Partner">Strategic Partner</ui-chip>
 *   <ui-chip variant="tag">public-official</ui-chip>
 *   <ui-status-dot value="Active"></ui-status-dot>
 *
 * Attrs on <ui-chip>:
 *   variant  — assist | filter | input | suggestion   (interactive; default assist)
 *              priority | zone | tag                  (presentational pills)
 *   selected — boolean, meaningful for filter chips
 *   disabled — boolean
 *   value    — priority variant only: High | Medium | Low (case-insensitive;
 *              unknown/absent falls back to the Low pair — sealed PriorityPill)
 *   data-zone — zone variant only: the exact relationship-zone NAME. Colors
 *              read the single-sourced --ui-sys-zone-* + band-ink tokens.
 *              SEALED NULL-GUARD: a zone with no catalog entry renders
 *              NOTHING (display:none), never an empty pill.
 *   size     — zone variant only: "lg" for the sealed LARGE StatusPill
 *              (size "lg" = 12px font, 3px 10px padding — the Map scorecard's
 *              status-pill-row pill); absent/other = the small default.
 *              Sizing is token-derived (space-scale calcs), never literal px.
 *
 * filter chips: click toggles selected, emits change(detail:{selected})
 * input chips: show × remove button, emits remove (composed:true)
 * assist/suggestion: emits click (native, composed:true)
 * priority/zone/tag: NON-INTERACTIVE display pills — no state layer, no
 *   tabstop, no role; visuals come only from --ui-sys-* tokens. These are the
 *   ONE source of the pill visuals (the modal/profile compose them; the
 *   stakeholder-table's internal display cells migrate here in a cleanup pass).
 *
 * <ui-status-dot value="Active|Watch|Dormant"> — the sealed StatusDot: a 7px
 *   round dot + the value as its label. Active → --ui-sys-pos, Watch →
 *   --ui-sys-accent, Dormant/unknown → --ui-sys-status-dormant. NULL-GUARD:
 *   an absent/empty value renders nothing.
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

    /* ── PRESENTATIONAL PILL VARIANTS (sealed Shared-UI-primitives) ─────────
       priority / zone / tag / segment are display-only: compact caption-type
       pills, no state layer, no pointer affordance. Color via tokens only. */
    :host([variant="priority"]) .chip,
    :host([variant="zone"]) .chip,
    :host([variant="tag"]) .chip,
    :host([variant="segment"]) .chip {
      height: auto;
      padding: 1px var(--ui-sys-space-2);
      font: var(--ui-sys-font-caption);
      cursor: default;
      user-select: text;
    }
    :host([variant="priority"]) .chip::before,
    :host([variant="zone"]) .chip::before,
    :host([variant="tag"]) .chip::before,
    :host([variant="segment"]) .chip::before { content: none; } /* no state layer */

    /* segment — the sealed SegmentBadge (Workspaces box): uppercase caption
       pill reading the --ui-sys-segment-* pairs via the value attr; UNKNOWN
       or absent values fall back to the Corporate Functions pair (sealed
       fallback rule). Small radius (oracle r4 → shape-control), 600 weight,
       0.06em tracking. */
    :host([variant="segment"]) {
      --_bg:     var(--ui-sys-segment-corporate-functions-surface);
      --_border: transparent;
      --_fg:     var(--ui-sys-segment-corporate-functions-ink);
    }
    :host([variant="segment"]) .chip {
      border-radius: var(--ui-sys-shape-control);
      text-transform: uppercase;
      letter-spacing: .06em;
      font-weight: 600;
      font-size: calc(var(--ui-sys-badge-font-size, 9.5px) + 0.5px);
    }
    :host([variant="segment"][value="Personal Systems"]) {
      --_bg: var(--ui-sys-segment-personal-systems-surface);
      --_fg: var(--ui-sys-segment-personal-systems-ink);
    }
    :host([variant="segment"][value="Printing"]) {
      --_bg: var(--ui-sys-segment-printing-surface);
      --_fg: var(--ui-sys-segment-printing-ink);
    }
    :host([variant="segment"][value="Corporate Investments"]) {
      --_bg: var(--ui-sys-segment-corporate-investments-surface);
      --_fg: var(--ui-sys-segment-corporate-investments-ink);
    }

    /* tag — the quiet .tag pill (sealed Tags primitive chip shape). */
    :host([variant="tag"]) {
      --_bg:     var(--ui-sys-surface-container);
      --_border: transparent;
      --_fg:     var(--ui-sys-on-surface);
    }

    /* priority — sealed PriorityPill pairs; unknown/absent value falls back
       to the Low pair (sealed fallback rule). Border transparent (tag shape). */
    :host([variant="priority"]) {
      --_bg:     var(--ui-sys-priority-low-surface);
      --_border: transparent;
      --_fg:     var(--ui-sys-priority-low-ink);
    }
    :host([variant="priority"][value="high" i]) {
      --_bg: var(--ui-sys-priority-high-surface);
      --_fg: var(--ui-sys-priority-high-ink);
    }
    :host([variant="priority"][value="medium" i]) {
      --_bg: var(--ui-sys-priority-medium-surface);
      --_fg: var(--ui-sys-priority-medium-ink);
    }

    /* zone — the sealed StatusPill. SEALED NULL-GUARD: default display:none;
       only a catalogued data-zone below turns the pill on — an unknown zone
       renders NOTHING, never an empty pill. Every pair reads the
       single-sourced --ui-sys-zone-* fills + band inks. */
    :host([variant="zone"]) { display: none; --_border: var(--ui-sys-outline-subtle); }
    :host([variant="zone"]) .chip { padding: 2px var(--ui-sys-space-2); }
    /* size="lg" — the sealed LARGE StatusPill (Shared-UI-primitives:
       size "lg" = 12px font, padding "3px 10px"; default stays the small
       pill above). Token-derived: --ui-sys-font-caption is the 12px step;
       3px = 0.75 × space-1 (4px) · 10px = 1.25 × space-2 (8px). */
    :host([variant="zone"][size="lg"]) .chip {
      font: var(--ui-sys-font-caption);
      padding: calc(var(--ui-sys-space-1) * 0.75) calc(var(--ui-sys-space-2) * 1.25);
    }
    :host([variant="zone"][data-zone="Proactively Defend"])      { display: inline-flex; --_bg: var(--ui-sys-zone-proactively-defend);      --_fg: var(--ui-sys-zone-ink-on-strong); }
    :host([variant="zone"][data-zone="Defend"])                  { display: inline-flex; --_bg: var(--ui-sys-zone-defend);                  --_fg: var(--ui-sys-zone-ink-negative); }
    :host([variant="zone"][data-zone="Protect"])                 { display: inline-flex; --_bg: var(--ui-sys-zone-protect);                 --_fg: var(--ui-sys-zone-ink-negative); }
    :host([variant="zone"][data-zone="Respond"])                 { display: inline-flex; --_bg: var(--ui-sys-zone-respond);                 --_fg: var(--ui-sys-zone-ink-negative); }
    :host([variant="zone"][data-zone="Identify"])                { display: inline-flex; --_bg: var(--ui-sys-zone-identify);                --_fg: var(--ui-sys-zone-ink-negative); }
    :host([variant="zone"][data-zone="Monitor"])                 { display: inline-flex; --_bg: var(--ui-sys-zone-monitor);                 --_fg: var(--ui-sys-zone-ink-neutral); }
    :host([variant="zone"][data-zone="Maintain"])                { display: inline-flex; --_bg: var(--ui-sys-zone-maintain);                --_fg: var(--ui-sys-zone-ink-neutral); }
    :host([variant="zone"][data-zone="Connect"])                 { display: inline-flex; --_bg: var(--ui-sys-zone-connect);                 --_fg: var(--ui-sys-zone-ink-neutral); }
    :host([variant="zone"][data-zone="Commit"])                  { display: inline-flex; --_bg: var(--ui-sys-zone-commit);                  --_fg: var(--ui-sys-zone-ink-neutral); }
    :host([variant="zone"][data-zone="Cooperate"])               { display: inline-flex; --_bg: var(--ui-sys-zone-cooperate);               --_fg: var(--ui-sys-zone-ink-positive); }
    :host([variant="zone"][data-zone="Collaborate"])             { display: inline-flex; --_bg: var(--ui-sys-zone-collaborate);             --_fg: var(--ui-sys-zone-ink-positive); }
    :host([variant="zone"][data-zone="Valuable Relationship"])   { display: inline-flex; --_bg: var(--ui-sys-zone-valuable-relationship);   --_fg: var(--ui-sys-zone-ink-positive); }
    :host([variant="zone"][data-zone="High Value Relationship"]) { display: inline-flex; --_bg: var(--ui-sys-zone-high-value-relationship); --_fg: var(--ui-sys-zone-ink-positive); }
    :host([variant="zone"][data-zone="Strategic Partner"])       { display: inline-flex; --_bg: var(--ui-sys-zone-strategic-partner);       --_fg: var(--ui-sys-zone-ink-on-strong); }
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
    if (name === 'disabled' && !this.#isPresentation()) {
      const d = this.hasAttribute('disabled');
      this.#chip.setAttribute('aria-disabled', String(d));
      this.#chip.setAttribute('tabindex', d ? '-1' : '0');
    }
  }

  get selected() { return this.hasAttribute('selected'); }
  set selected(v) { v ? this.setAttribute('selected', '') : this.removeAttribute('selected'); }

  /* priority/zone/tag/segment are display-only pills — no widget role, no tabstop. */
  #isPresentation() {
    return ['priority', 'zone', 'tag', 'segment'].includes(this.getAttribute('variant'));
  }

  #syncRole() {
    const v = this.getAttribute('variant') || 'assist';
    if (this.#isPresentation()) {
      this.removeAttribute('role');
      this.#chip.removeAttribute('tabindex');
      this.#chip.removeAttribute('aria-checked');
      this.#chip.removeAttribute('aria-pressed');
    } else if (v === 'filter') {
      this.setAttribute('role', 'checkbox');
      this.#chip.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
    } else if (v === 'input' || v === 'assist' || v === 'suggestion') {
      this.setAttribute('role', 'button');
      this.#chip.setAttribute('tabindex', this.hasAttribute('disabled') ? '-1' : '0');
    }
  }

  #syncSelected() {
    if (this.#isPresentation()) return;
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


/* ---- <ui-status-dot> ------------------------------------------------------
 * The sealed StatusDot primitive: a 7px round dot + the value as its label.
 * Colors (sealed Shared-UI-primitives): Active → --ui-sys-pos · Watch →
 * --ui-sys-accent · Dormant/unknown → --ui-sys-status-dormant.
 * NULL-GUARD: absent/empty value renders nothing. Non-interactive.         */

const statusDotTpl = document.createElement('template');
statusDotTpl.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--ui-sys-space-1);
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      white-space: nowrap;
    }
    /* sealed null-guard: no value → render nothing */
    :host(:not([value])), :host([value=""]) { display: none; }
    .dot {
      width: 7px;
      height: 7px;
      border-radius: var(--ui-sys-shape-pill);
      background: var(--ui-sys-status-dormant); /* Dormant AND the unknown fallback */
      flex-shrink: 0;
    }
    :host([value="Active"]) .dot { background: var(--ui-sys-pos); }
    :host([value="Watch"])  .dot { background: var(--ui-sys-accent); }
  </style>
  <span class="dot" part="dot" aria-hidden="true"></span>
  <span class="label" part="label"></span>
`;

class UiStatusDot extends HTMLElement {
  static observedAttributes = ['value'];

  #label;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(statusDotTpl.content.cloneNode(true));
    this.#label = this.shadowRoot.querySelector('.label');
  }

  connectedCallback() { this.#sync(); }
  attributeChangedCallback() { this.#sync(); }

  get value() { return this.getAttribute('value') || ''; }
  set value(v) { v ? this.setAttribute('value', v) : this.removeAttribute('value'); }

  #sync() { this.#label.textContent = this.getAttribute('value') || ''; }
}

if (!customElements.get('ui-status-dot')) customElements.define('ui-status-dot', UiStatusDot);
