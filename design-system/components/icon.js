/* <ui-icon> — the canonical icon primitive. Renders a GOOGLE MATERIAL SYMBOL by
 * ligature name (the project icon standard), token-sized, inheriting currentColor.
 *
 *   <ui-icon>search</ui-icon>                 (the ligature is the text content)
 *   <ui-icon size="lg" filled>bookmark</ui-icon>
 *
 * size = xs | sm | md | lg | xl  → --ui-sys-icon-size-*  (the only place icon px live)
 * filled (boolean) flips the FILL axis; weight attr tunes the wght axis.
 * The Material Symbols Outlined font must be loaded at document level (the pages
 * link it). A slotted <svg> is still supported as a fallback for custom marks.
 */
const tpl = document.createElement('template');
tpl.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: var(--_sz, var(--ui-sys-icon-size-md));
      height: var(--_sz, var(--ui-sys-icon-size-md));
      /* Material Symbols glyph rendering */
      font-family: 'Material Symbols Outlined';
      font-weight: normal;
      font-style: normal;
      font-size: var(--_sz, var(--ui-sys-icon-size-md));
      line-height: 1;
      letter-spacing: normal;
      text-transform: none;
      white-space: nowrap;
      word-wrap: normal;
      direction: ltr;
      -webkit-font-smoothing: antialiased;
      text-rendering: optimizeLegibility;
      font-variation-settings: 'FILL' var(--_fill, 0), 'wght' var(--_wght, 400), 'GRAD' 0, 'opsz' 24;
      color: inherit;
      user-select: none;
      overflow: hidden;
    }
    :host([size="xs"]) { --_sz: var(--ui-sys-icon-size-xs); }
    :host([size="sm"]) { --_sz: var(--ui-sys-icon-size-sm); }
    :host([size="md"]) { --_sz: var(--ui-sys-icon-size-md); }
    :host([size="lg"]) { --_sz: var(--ui-sys-icon-size-lg); }
    :host([size="xl"]) { --_sz: var(--ui-sys-icon-size-xl); }
    :host([filled])     { --_fill: 1; }
    :host([weight="300"]) { --_wght: 300; }
    :host([weight="500"]) { --_wght: 500; }
    /* fallback: a slotted SVG mark conforms to the icon box */
    ::slotted(svg) { width: 100% !important; height: 100% !important; display: block; }
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
