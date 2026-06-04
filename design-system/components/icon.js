/* <ui-icon> — the canonical icon sizing primitive.
 * Wrap any inline SVG (or glyph text) so it renders at a token size, never an
 * ad-hoc px value. size = sm | md | lg | xl (default md). Inherits currentColor.
 *   <ui-icon size="sm"><svg ...></svg></ui-icon>
 * Slotted <svg> is forced to the chosen --ui-sys-icon-size-* so icons line up
 * everywhere (left of labels, standalone in collapsed rails, in buttons).
 */
const tpl = document.createElement('template');
tpl.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      color: inherit;
      width: var(--_sz, var(--ui-sys-icon-size-md));
      height: var(--_sz, var(--ui-sys-icon-size-md));
      line-height: 1;
    }
    :host([size="sm"]) { --_sz: var(--ui-sys-icon-size-sm); }
    :host([size="md"]) { --_sz: var(--ui-sys-icon-size-md); }
    :host([size="lg"]) { --_sz: var(--ui-sys-icon-size-lg); }
    :host([size="xl"]) { --_sz: var(--ui-sys-icon-size-xl); }
    /* Force any slotted SVG to the host box, regardless of its own width/height. */
    ::slotted(svg) { width: 100% !important; height: 100% !important; display: block; }
    ::slotted(*) { font-size: var(--_sz, var(--ui-sys-icon-size-md)); }
  </style>
  <slot></slot>
`;

if (!customElements.get('ui-icon')) {
  class UiIcon extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).appendChild(tpl.content.cloneNode(true));
    }
    connectedCallback() {
      if (!this.hasAttribute('size')) this.setAttribute('size', 'md');
      if (!this.hasAttribute('aria-hidden')) this.setAttribute('aria-hidden', 'true');
    }
  }
  customElements.define('ui-icon', UiIcon);
}
