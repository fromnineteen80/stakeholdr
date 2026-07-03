/* <ui-avatar> — identity circle: photo or initials. The ONE avatar primitive
 * (profile menus, sidebar footer, owner stacks compose from it).
 *
 *   <ui-avatar name="Maria Chen"></ui-avatar>            (initials "MC")
 *   <ui-avatar name="Maria Chen" src="…/photo.jpg"></ui-avatar>
 *   <ui-avatar name="Maria Chen" size="lg"></ui-avatar>
 *
 * size = sm | md | lg  → --ui-sys-avatar-size-*  (the only place avatar px live)
 * Fill = --ui-sys-primary / --ui-sys-on-primary so it re-themes with the wrapper.
 * role="img" + aria-label from name.
 */
const tpl = document.createElement('template');
tpl.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 auto;
      width: var(--_sz, var(--ui-sys-avatar-size-md, 32px));
      height: var(--_sz, var(--ui-sys-avatar-size-md, 32px));
      border-radius: var(--ui-sys-shape-pill);
      background: var(--ui-sys-primary);
      color: var(--ui-sys-on-primary);
      font: var(--ui-sys-font-label);
      font-size: calc(var(--_sz, var(--ui-sys-avatar-size-md, 32px)) * 0.38);
      letter-spacing: .02em;
      overflow: hidden;
      user-select: none;
    }
    :host([size="sm"]) { --_sz: var(--ui-sys-avatar-size-sm, 24px); }
    :host([size="md"]) { --_sz: var(--ui-sys-avatar-size-md, 32px); }
    :host([size="lg"]) { --_sz: var(--ui-sys-avatar-size-lg, 40px); }
    img { width: 100%; height: 100%; object-fit: cover; display: block; }
  </style>
  <span part="initials"></span>
`;

if (!customElements.get('ui-avatar')) {
  class UiAvatar extends HTMLElement {
    static get observedAttributes() { return ['name', 'src', 'size']; }
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).appendChild(tpl.content.cloneNode(true));
    }
    connectedCallback() {
      if (!this.hasAttribute('size')) this.setAttribute('size', 'md');
      this.setAttribute('role', 'img');
      this._render();
    }
    attributeChangedCallback() { if (this.shadowRoot) this._render(); }
    _render() {
      const name = this.getAttribute('name') || '';
      const src = this.getAttribute('src') || '';
      this.setAttribute('aria-label', name || 'avatar');
      if (!this.hasAttribute('title') && name) this.setAttribute('title', name);
      const holder = this.shadowRoot.querySelector('[part="initials"]');
      if (src) {
        holder.innerHTML = '';
        const img = document.createElement('img');
        img.src = src; img.alt = '';
        holder.appendChild(img);
      } else {
        const parts = name.trim().split(/\s+/).filter(Boolean);
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0])
          : (parts[0] || '?').slice(0, 2);
        holder.textContent = initials.toUpperCase();
      }
    }
  }
  customElements.define('ui-avatar', UiAvatar);
}
