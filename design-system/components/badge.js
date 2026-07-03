/* <ui-badge> — small count/dot indicator (GAP fill; spec: guide Scoring-cadence box).
 * Non-interactive notification marker: an accent count pill or a plain dot,
 * either rendered INLINE or ANCHORED to a wrapped child's top-right corner.
 *
 *   <ui-badge count="3"></ui-badge>                        (inline pill "3")
 *   <ui-badge dot></ui-badge>                              (inline dot)
 *   <ui-badge count="120">                                 (anchored: caps at "99+",
 *     <ui-icon-button variant="standard" aria-label="Messages">
 *       <ui-icon>chat</ui-icon>                             pinned top -4px / right -4px
 *     </ui-icon-button>                                     over the slotted child)
 *   </ui-badge>
 *
 * count  — number; the badge hides when count is 0/absent (unless dot is set).
 *          Values above 99 render as "99+".
 * dot    — boolean; renders the dot-only marker regardless of count.
 * tone   — "alert" (default: accent surface, light ink) | "neutral".
 * aria-label — auto "N notifications" (dot: "New notifications"); set the
 *          attribute on the host to override.
 *
 * Token start-state (oracle: .msg-badge / .count-alert, app.jsx nav cluster) —
 * pill min-width/height 16px, padding 0 4px, radius pill, 9.5px weight-600
 * tabular numerals (Inter — never the oracle's mono), accent surface with
 * light near-paper ink, pointer-events none, overlap offset -4px/-4px.
 * Colors/sizes read ONLY --ui-sys-* tokens (--ui-sys-badge-*, with system
 * fallbacks); the oracle's !important pattern is NOT replicated.
 */
const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      position: relative;
      display: inline-flex;
      vertical-align: middle;
      /* tone: alert (default) — accent surface, light ink */
      --_surface: var(--ui-sys-badge-alert-surface, var(--ui-sys-accent));
      --_ink:     var(--ui-sys-badge-alert-ink, var(--ui-sys-on-accent, var(--ui-sys-on-primary)));
    }
    :host([tone="neutral"]) {
      --_surface: var(--ui-sys-badge-neutral-surface, var(--ui-sys-surface-container-highest, var(--ui-sys-surface-container)));
      --_ink:     var(--ui-sys-badge-neutral-ink, var(--ui-sys-on-surface));
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      min-width: var(--ui-sys-badge-size, 16px);
      height: var(--ui-sys-badge-size, 16px);
      padding: 0 var(--ui-sys-badge-pad-inline, 4px);
      border-radius: var(--ui-sys-shape-pill, 999px);
      background: var(--_surface);
      color: var(--_ink);
      font: var(--ui-sys-font-label);
      font-size: var(--ui-sys-badge-font-size, 9.5px);
      font-weight: 600;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      letter-spacing: 0;
      white-space: nowrap;
      pointer-events: none;
      user-select: none;
    }

    /* dot-only mode: a plain marker, no numerals */
    :host([dot]) .badge {
      min-width: var(--ui-sys-badge-dot-size, 8px);
      width: var(--ui-sys-badge-dot-size, 8px);
      height: var(--ui-sys-badge-dot-size, 8px);
      padding: 0;
    }

    /* anchored mode — a slotted child exists; pin over its top-right corner */
    .badge.anchored {
      position: absolute;
      top: var(--ui-sys-badge-offset-block, -4px);
      right: var(--ui-sys-badge-offset-inline, -4px);
      z-index: 1;
    }

    /* nothing to announce — the badge collapses (any slotted child still renders) */
    .badge.hidden { display: none; }
  </style>
  <slot></slot>
  <span class="badge" part="badge" role="status"></span>
`;

if (!customElements.get('ui-badge')) {
  class UiBadge extends HTMLElement {
    static get observedAttributes() { return ['count', 'dot', 'tone', 'aria-label']; }

    #badge;
    #slot;

    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
      this.#badge = this.shadowRoot.querySelector('.badge');
      this.#slot = this.shadowRoot.querySelector('slot');
      this.#slot.addEventListener('slotchange', () => this.#render());
    }

    connectedCallback() { this.#render(); }
    attributeChangedCallback() { if (this.#badge) this.#render(); }

    get count() {
      const n = Number(this.getAttribute('count'));
      return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
    }
    set count(v) {
      v == null ? this.removeAttribute('count') : this.setAttribute('count', String(v));
    }

    get dot() { return this.hasAttribute('dot'); }
    set dot(v) { this.toggleAttribute('dot', !!v); }

    #render() {
      const dot = this.dot;
      const count = this.count;
      const visible = dot || count > 0;
      const display = count > 99 ? '99+' : String(count);

      /* anchored iff real slotted content exists (elements or non-empty text) */
      const anchored = this.#slot
        .assignedNodes({ flatten: true })
        .some(n => n.nodeType === Node.ELEMENT_NODE ||
                   (n.nodeType === Node.TEXT_NODE && n.textContent.trim() !== ''));

      this.#badge.classList.toggle('anchored', anchored);
      this.#badge.classList.toggle('hidden', !visible);
      this.#badge.textContent = (dot || !visible) ? '' : display;

      /* a11y: name lives on the inner status element so the wrapped child's
         own semantics are untouched. Host aria-label (if set) overrides. */
      const auto = dot && count === 0
        ? 'New notifications'
        : `${display} notification${count === 1 ? '' : 's'}`;
      this.#badge.setAttribute('aria-label', this.getAttribute('aria-label') || auto);
    }
  }
  customElements.define('ui-badge', UiBadge);
}
