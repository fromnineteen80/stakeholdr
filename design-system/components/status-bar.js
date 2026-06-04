/* ============================================================================
 * <ui-status-bar> — bottom footer / status bar.
 *
 * Slots: default (left-aligned groups), end (right-aligned groups).
 * Height: ~32px. Font: --ui-sys-font-caption. Text: --ui-sys-on-surface-muted.
 * Background: --ui-sys-surface-container. Top border: --ui-sys-outline-subtle.
 * Items gap: --ui-sys-space-3.
 * role=contentinfo.
 *
 * Style ONLY via --ui-sys-* tokens. No hardcoded colors or font families.
 * ==========================================================================*/

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      height: 32px;
      min-height: 32px;
      box-sizing: border-box;
      background: var(--ui-sys-surface-container);
      border-top: 1px solid var(--ui-sys-outline-subtle);
      padding: 0 var(--ui-sys-space-3);
      font: var(--ui-sys-font-caption);
      color: var(--ui-sys-on-surface-muted);
      overflow: hidden;
    }

    /* Left group */
    .start {
      display: inline-flex;
      align-items: center;
      gap: var(--ui-sys-space-3);
      min-width: 0;
      flex: 1;
      overflow: hidden;
    }

    /* Right group */
    .end {
      display: inline-flex;
      align-items: center;
      gap: var(--ui-sys-space-3);
      flex-shrink: 0;
      margin-left: var(--ui-sys-space-3);
    }

    /* Slotted items inherit caption + muted */
    ::slotted(*) {
      display: inline-flex;
      align-items: center;
      gap: var(--ui-sys-space-1);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Dividers between groups can be rendered by the slotted item using
       role="separator"; we don't impose extra markup. */
  </style>

  <footer role="contentinfo" style="display:contents">
    <div class="start" part="start">
      <slot></slot>
    </div>
    <div class="end" part="end">
      <slot name="end"></slot>
    </div>
  </footer>
`;

class UiStatusBar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
  }
}

if (!customElements.get('ui-status-bar')) {
  customElements.define('ui-status-bar', UiStatusBar);
}
