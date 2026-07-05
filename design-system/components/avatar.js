/* <ui-avatar> — identity circle: photo or initials. The ONE avatar primitive
 * (profile menus, sidebar footer, owner stacks compose from it).
 *
 *   <ui-avatar name="Maria Chen"></ui-avatar>            (initials "MC")
 *   <ui-avatar name="Maria Chen" src="…/photo.jpg"></ui-avatar>
 *   <ui-avatar name="Maria Chen" size="lg"></ui-avatar>
 *
 * size = sm | md | lg  → --ui-sys-avatar-size-*  (the only place avatar px live)
 * Fill = --ui-sys-primary / --ui-sys-on-primary so it re-themes with the wrapper.
 * presence = "online" renders the sealed lower-right live-presence dot
 * (--ui-sys-presence-online, ~28% of the avatar size, surface ring); any
 * other value renders no dot (sealed: the dot exists only when online).
 * role="img" + aria-label from name.
 */
const tpl = document.createElement('template');
tpl.innerHTML = `
  <style>
    :host {
      /* Industry-standard profile circle: a PERFECT circle (fixed square box +
         aspect-ratio guard so no flex context can squash it) with initials
         TRULY centered (grid place-items + line-height 1 — never a line-box
         guess) and no tracking (letter-spacing shifts a pair off-center). */
      display: inline-grid;
      place-items: center;
      flex: 0 0 auto;
      width: var(--_sz, var(--ui-sys-avatar-size-md, 32px));
      height: var(--_sz, var(--ui-sys-avatar-size-md, 32px));
      min-width: var(--_sz, var(--ui-sys-avatar-size-md, 32px));
      aspect-ratio: 1 / 1;
      border-radius: var(--ui-sys-shape-pill);
      /* per-identity color: callers pass a TOKEN reference via --ui-avatar-bg */
      background: var(--ui-avatar-bg, var(--ui-sys-primary));
      color: var(--ui-sys-on-primary);
      font-family: var(--ui-ref-typeface-body);
      font-weight: 500;
      font-size: calc(var(--_sz, var(--ui-sys-avatar-size-md, 32px)) * 0.4);
      line-height: 1;
      letter-spacing: 0;
      position: relative;
      user-select: none;
    }
    /* Clip photo/initials to the circle on an inner layer so the presence
       dot can sit at the circle edge without being clipped by the host. */
    [part="initials"] {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      border-radius: inherit;
      overflow: hidden;
    }
    /* Presence dot (sealed av-presence geometry, token-derived): ~28% of the
       avatar, tucked into the lower-right quadrant, surface ring. */
    [part="presence"] { display: none; }
    :host([presence="online"]) [part="presence"] {
      display: block;
      position: absolute;
      right: calc(var(--_sz, var(--ui-sys-avatar-size-md, 32px)) * 0.02);
      bottom: calc(var(--_sz, var(--ui-sys-avatar-size-md, 32px)) * 0.02);
      width: max(6px, calc(var(--_sz, var(--ui-sys-avatar-size-md, 32px)) * 0.28));
      height: max(6px, calc(var(--_sz, var(--ui-sys-avatar-size-md, 32px)) * 0.28));
      border-radius: var(--ui-sys-shape-pill);
      background: var(--ui-sys-presence-online, var(--ui-sys-pos));
      box-shadow: 0 0 0 max(1px, calc(var(--_sz, var(--ui-sys-avatar-size-md, 32px)) * 0.05)) var(--ui-sys-surface-card);
    }
    /* Stack ring: overlapping avatars separate with a clean surface ring —
       the industry standard for owner stacks. */
    :host([ring]) {
      box-shadow: 0 0 0 2px var(--ui-sys-surface-card);
    }
    :host([size="sm"]) { --_sz: var(--ui-sys-avatar-size-sm, 24px); }
    :host([size="md"]) { --_sz: var(--ui-sys-avatar-size-md, 32px); }
    :host([size="lg"]) { --_sz: var(--ui-sys-avatar-size-lg, 40px); }
    img { width: 100%; height: 100%; object-fit: cover; display: block; }
  </style>
  <span part="initials"></span>
  <span part="presence" aria-hidden="true"></span>
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
