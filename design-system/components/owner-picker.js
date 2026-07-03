/* ============================================================================
 * <ui-owner-picker> — owner avatar multi-select (GAP component; the Canonical
 * UI home of the oracle's MultiOwnerPicker + UserAutocomplete-add +
 * OwnersDisplay read-only stack). Built to the ui-button bar: real custom
 * element, shadow DOM, token-only styling, keyboard + ARIA.
 *
 * Composes <ui-avatar> for every circle and <ui-icon> for the remove glyph.
 *
 * Properties (set via JS):
 *   .users   array of { id, name, title?, email?, src?, role?, presence? }
 *            — the people directory. role === "system" users NEVER appear
 *            in the add list (the Reminders bot never owns anything).
 *   .value   array of user ids — the current owners. Reassigning re-renders.
 *
 * Attributes:
 *   readonly   display-only stack (no add "+", no remove arming) with a
 *              "+N" overflow circle past `max` visible avatars, like the
 *              oracle's OwnersDisplay/UserStack. Empty owners render a
 *              muted "-" placeholder (oracle OwnersDisplay behavior).
 *   size       sm | md → --ui-sys-avatar-size-sm/-md (default md)
 *   max        readonly overflow cap (default 5): show up to `max` avatars,
 *              then one "+N" circle for the rest.
 *
 * Events (composed: true):
 *   change → detail { value } (the new id array) on every add / remove.
 *
 * Interactions (editable mode — oracle handler census #40–43 + UA #33–39):
 *   • Overlapping avatar stack, NO names; each avatar tooltip = the name.
 *   • Clicking an avatar ARMS removal: red ring + an X overlay, tooltip
 *     "Click to remove"; a SECOND click removes; mouseleave / Escape /
 *     outside click disarms.
 *   • A dashed "+" circle (aria-label/title "Add owner"), HIDDEN when no
 *     candidates remain, toggles an inline typeahead popover: autofocused
 *     input, placeholder "Search people to add…", matches on name OR title
 *     OR email (case-insensitive substring), max 8 results (first 8
 *     candidates when the query is empty), two-line rows (name over title)
 *     with a leading avatar; ArrowDown/ArrowUp move the active row
 *     (clamped), Enter picks it, Escape closes, option mousedown picks
 *     before blur, outside click closes. Empty result list = "No matches".
 *   • Candidates = users minus system-role users minus existing owners.
 *
 * Styling reads ONLY --ui-sys-* tokens. The armed-remove overlay reads
 * --ui-sys-neg-overlay when defined, else derives 85% of --ui-sys-neg
 * (the census NEEDS-TOKEN for the oracle's rgba(179,60,60,.85)).
 * ==========================================================================*/

import './avatar.js';
import './icon.js';

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: inline-flex;
      position: relative;
      vertical-align: middle;
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      --_av: var(--ui-sys-avatar-size-md, 32px);
    }
    :host([size="sm"]) { --_av: var(--ui-sys-avatar-size-sm, 24px); }
    :host([size="md"]) { --_av: var(--ui-sys-avatar-size-md, 32px); }

    .stack {
      display: inline-flex;
      align-items: center;
    }

    /* One owner circle — overlapping stack, ring in the card surface color */
    .owner {
      appearance: none;
      background: none;
      border: 0;
      padding: 0;
      margin: 0 0 0 calc(var(--_av) / -4);
      position: relative;
      display: inline-flex;
      border-radius: var(--ui-sys-shape-pill);
      cursor: pointer;
      font: inherit;
      color: inherit;
    }
    .owner:first-child { margin-left: 0; }
    .owner ui-avatar {
      box-shadow: 0 0 0 2px var(--ui-sys-surface-card);
      transition: transform var(--ui-sys-motion-control),
                  box-shadow var(--ui-sys-motion-control);
    }
    .owner:hover ui-avatar { transform: translateY(-1px); }
    .owner:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }
    /* Armed for removal: negative ring + X overlay */
    .owner.confirm ui-avatar { box-shadow: 0 0 0 2px var(--ui-sys-neg); }
    .remove {
      position: absolute;
      inset: 0;
      border-radius: var(--ui-sys-shape-pill);
      background: var(--ui-sys-neg-overlay,
                  color-mix(in srgb, var(--ui-sys-neg) 85%, transparent));
      color: var(--ui-sys-on-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
      pointer-events: none;
    }

    /* Read-only stack (no pointer affordances) */
    :host([readonly]) .owner { cursor: default; }
    :host([readonly]) .owner:hover ui-avatar { transform: none; }

    /* "+N" overflow circle (readonly) */
    .more {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--_av);
      height: var(--_av);
      margin-left: calc(var(--_av) / -4);
      border-radius: var(--ui-sys-shape-pill);
      background: var(--ui-sys-surface-container);
      color: var(--ui-sys-on-surface-muted);
      border: 1px solid var(--ui-sys-outline);
      box-shadow: 0 0 0 2px var(--ui-sys-surface-card);
      font: var(--ui-sys-font-caption);
      user-select: none;
      z-index: 1;
    }

    /* Empty readonly placeholder */
    .empty {
      font: var(--ui-sys-font-caption);
      color: var(--ui-sys-on-surface-muted);
      align-self: center;
    }

    /* Dashed "+" add button */
    .add {
      appearance: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: var(--_av);
      height: var(--_av);
      margin-left: var(--ui-sys-space-2);
      border: 1.5px dashed var(--ui-sys-on-surface-faint);
      border-radius: var(--ui-sys-shape-pill);
      background: transparent;
      color: var(--ui-sys-on-surface-muted);
      font: var(--ui-sys-font-label);
      line-height: 1;
      cursor: pointer;
      padding: 0;
      transition: color var(--ui-sys-motion-control),
                  border-color var(--ui-sys-motion-control);
    }
    .add:hover {
      color: var(--ui-sys-primary);
      border-color: var(--ui-sys-primary);
    }
    .add:focus-visible {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }

    /* Typeahead popover (input + result rows in one panel) */
    .panel {
      position: absolute;
      top: calc(100% + var(--ui-sys-space-2));
      left: 0;
      z-index: 99;
      min-width: 240px;
      background: var(--ui-sys-surface-container-high);
      border: 1px solid var(--ui-sys-outline);
      border-radius: var(--ui-sys-shape-control);
      box-shadow: var(--ui-sys-elevation-2);
      padding: var(--ui-sys-space-2);
    }
    .panel[hidden] { display: none; }

    .field {
      display: flex;
      align-items: center;
      height: var(--ui-sys-control-height);
      background: var(--ui-sys-surface-field);
      border: 1px solid var(--ui-sys-outline);
      border-radius: var(--ui-sys-shape-control);
      transition: border-color var(--ui-sys-motion-control);
    }
    .field:focus-within { border-color: var(--ui-sys-focus-ring); }
    input {
      flex: 1;
      min-width: 0;
      height: 100%;
      border: none;
      background: transparent;
      outline: none;
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      padding: 0 var(--ui-sys-space-3);
    }
    input::placeholder { color: var(--ui-sys-on-surface-muted); }

    .listbox {
      margin-top: var(--ui-sys-space-1);
      max-height: 220px;
      overflow-y: auto;
    }
    .row {
      display: flex;
      align-items: center;
      gap: var(--ui-sys-space-2);
      padding: var(--ui-sys-space-2);
      border-radius: var(--ui-sys-shape-control);
      cursor: pointer;
      transition: background var(--ui-sys-motion-control);
    }
    .row[aria-selected="true"] { background: var(--ui-sys-surface-hover); }
    .row-meta { flex: 1; min-width: 0; }
    .row-name {
      font: var(--ui-sys-font-label);
      color: var(--ui-sys-on-surface);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .row-title {
      font: var(--ui-sys-font-caption);
      color: var(--ui-sys-on-surface-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .no-matches {
      padding: var(--ui-sys-space-3);
      font: var(--ui-sys-font-caption);
      color: var(--ui-sys-on-surface-muted);
      text-align: center;
    }
  </style>

  <div class="stack" part="stack" role="group" aria-label="Owners"></div>
  <div class="panel" part="panel" hidden>
    <div class="field" part="field">
      <input
        part="input"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded="false"
        aria-haspopup="listbox"
        aria-controls="listbox"
        aria-label="Add owner"
        autocomplete="off"
        spellcheck="false"
        placeholder="Search people to add…"
      />
    </div>
    <div class="listbox" id="listbox" role="listbox" aria-label="People"></div>
  </div>
`;

class UiOwnerPicker extends HTMLElement {
  static observedAttributes = ['readonly', 'size', 'max'];

  #users = [];
  #value = [];
  #adding = false;
  #armed = null;      // user id whose removal is armed
  #query = '';
  #activeIdx = 0;

  #stackEl;
  #panelEl;
  #inputEl;
  #listEl;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    this.#stackEl = this.shadowRoot.querySelector('.stack');
    this.#panelEl = this.shadowRoot.querySelector('.panel');
    this.#inputEl = this.shadowRoot.querySelector('input');
    this.#listEl = this.shadowRoot.getElementById('listbox');
  }

  connectedCallback() {
    if (!this.hasAttribute('size')) this.setAttribute('size', 'md');
    document.addEventListener('mousedown', this.#onDocMousedown);
    this.#inputEl.addEventListener('input', this.#onInput);
    this.#inputEl.addEventListener('keydown', this.#onKeydown);
    this.#render();
  }

  disconnectedCallback() {
    document.removeEventListener('mousedown', this.#onDocMousedown);
    this.#inputEl.removeEventListener('input', this.#onInput);
    this.#inputEl.removeEventListener('keydown', this.#onKeydown);
  }

  attributeChangedCallback() {
    if (!this.shadowRoot || !this.isConnected) return;
    if (this.#readonly) { this.#adding = false; this.#armed = null; }
    this.#render();
  }

  /* --- public properties -------------------------------------------------- */

  get users() { return this.#users; }
  set users(val) {
    this.#users = Array.isArray(val) ? val.filter(u => u && u.id != null) : [];
    if (this.isConnected) this.#render();
  }

  get value() { return this.#value; }
  set value(val) {
    this.#value = Array.isArray(val) ? [...val] : [];
    this.#armed = null;
    if (this.isConnected) this.#render();
  }

  get readonly() { return this.#readonly; }
  set readonly(v) { v ? this.setAttribute('readonly', '') : this.removeAttribute('readonly'); }

  get #readonly() { return this.hasAttribute('readonly'); }
  get #max() {
    const n = parseInt(this.getAttribute('max'), 10);
    return Number.isFinite(n) && n > 0 ? n : 5;
  }
  get #avatarSize() { return this.getAttribute('size') === 'sm' ? 'sm' : 'md'; }

  /* Add candidates: never system-role users, never existing owners. */
  get #candidates() {
    return this.#users.filter(u => u.role !== 'system' && !this.#value.includes(u.id));
  }

  /* Query matches on name OR title OR email, case-insensitive, max 8;
     empty query = the first 8 candidates (oracle UserAutocomplete rule). */
  get #matches() {
    const q = this.#query.toLowerCase();
    const pool = this.#candidates;
    const hits = q
      ? pool.filter(u =>
          (u.name || '').toLowerCase().includes(q) ||
          (u.title || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q))
      : pool;
    return hits.slice(0, 8);
  }

  /* --- mutations ----------------------------------------------------------- */

  #emit() {
    this.dispatchEvent(new CustomEvent('change', {
      bubbles: true, composed: true,
      detail: { value: [...this.#value] },
    }));
  }

  #addOwner(id) {
    if (!id || this.#value.includes(id)) return;
    this.#value = [...this.#value, id];
    this.#adding = false;
    this.#query = '';
    this.#render();
    this.#emit();
    this.shadowRoot.querySelector('.add')?.focus();
  }

  #removeOwner(id) {
    this.#value = this.#value.filter(o => o !== id);
    this.#armed = null;
    this.#render();
    this.#emit();
  }

  #toggleAdding() {
    this.#adding = !this.#adding;
    this.#armed = null;
    this.#query = '';
    this.#activeIdx = 0;
    this.#render();
    if (this.#adding) {
      this.#inputEl.value = '';
      requestAnimationFrame(() => this.#inputEl.focus());
    }
  }

  #closePanel(refocusAdd) {
    this.#adding = false;
    this.#query = '';
    this.#render();
    if (refocusAdd) this.shadowRoot.querySelector('.add')?.focus();
  }

  /* --- event handlers ------------------------------------------------------ */

  /* Outside click resets both the add popover and the armed removal
     (oracle handler #40). composedPath so clicks inside shadow DOM count. */
  #onDocMousedown = (e) => {
    if (e.composedPath().includes(this)) return;
    if (!this.#adding && this.#armed === null) return;
    this.#adding = false;
    this.#armed = null;
    this.#query = '';
    this.#render();
  };

  #onInput = () => {
    this.#query = this.#inputEl.value;
    this.#activeIdx = 0;
    this.#renderList();
  };

  #onKeydown = (e) => {
    const matches = this.#matches;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.#setActive(Math.min(matches.length - 1, this.#activeIdx + 1), true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.#setActive(Math.max(0, this.#activeIdx - 1), true);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (matches[this.#activeIdx]) this.#addOwner(matches[this.#activeIdx].id);
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      this.#closePanel(true);
    }
  };

  /* --- render -------------------------------------------------------------- */

  #avatarFor(u) {
    const av = document.createElement('ui-avatar');
    av.setAttribute('name', u.name || '');
    if (u.src) av.setAttribute('src', u.src);
    av.setAttribute('size', this.#avatarSize);
    return av;
  }

  #render() {
    const readonly = this.#readonly;
    this.#stackEl.innerHTML = '';

    const owners = this.#value
      .map(id => this.#users.find(u => u.id === id))
      .filter(Boolean);

    if (readonly) {
      if (owners.length === 0) {
        const dash = document.createElement('span');
        dash.className = 'empty';
        dash.textContent = '-';
        this.#stackEl.appendChild(dash);
      } else {
        const max = this.#max;
        owners.slice(0, max).forEach(u => {
          const cell = document.createElement('span');
          cell.className = 'owner';
          cell.title = u.name || '';
          cell.appendChild(this.#avatarFor(u));
          this.#stackEl.appendChild(cell);
        });
        const overflow = owners.length - max;
        if (overflow > 0) {
          const more = document.createElement('span');
          more.className = 'more';
          more.textContent = `+${overflow}`;
          more.title = owners.slice(max).map(u => u.name).join(', ');
          this.#stackEl.appendChild(more);
        }
      }
      this.#panelEl.hidden = true;
      this.#inputEl.setAttribute('aria-expanded', 'false');
      return;
    }

    owners.forEach(u => {
      const armed = this.#armed === u.id;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'owner' + (armed ? ' confirm' : '');
      btn.title = armed ? 'Click to remove' : (u.name || '');
      btn.setAttribute('aria-label', armed ? `Remove ${u.name}` : `${u.name} — press again to remove`);
      btn.appendChild(this.#avatarFor(u));
      if (armed) {
        const overlay = document.createElement('span');
        overlay.className = 'remove';
        overlay.setAttribute('aria-hidden', 'true');
        const x = document.createElement('ui-icon');
        x.setAttribute('size', 'sm');
        x.textContent = 'close';
        overlay.appendChild(x);
        btn.appendChild(overlay);
      }
      // First click ARMS, second click removes (oracle handler #41);
      // mouseleave disarms (#42); Escape disarms too.
      btn.addEventListener('click', () =>
        armed ? this.#removeOwner(u.id) : (this.#armed = u.id, this.#render()));
      btn.addEventListener('mouseleave', () => {
        if (this.#armed === u.id) { this.#armed = null; this.#render(); }
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.#armed === u.id) {
          this.#armed = null; this.#render();
        }
      });
      this.#stackEl.appendChild(btn);
    });

    // "+" add button — hidden entirely when no candidates remain (#43).
    if (this.#candidates.length > 0) {
      const add = document.createElement('button');
      add.type = 'button';
      add.className = 'add';
      add.textContent = '+';
      add.title = 'Add owner';
      add.setAttribute('aria-label', 'Add owner');
      add.setAttribute('aria-expanded', String(this.#adding));
      add.addEventListener('click', () => this.#toggleAdding());
      this.#stackEl.appendChild(add);
    } else if (this.#adding) {
      this.#adding = false;
    }

    this.#panelEl.hidden = !this.#adding;
    this.#inputEl.setAttribute('aria-expanded', String(this.#adding));
    if (this.#adding) this.#renderList();
  }

  #renderList() {
    this.#listEl.innerHTML = '';
    const matches = this.#matches;

    if (matches.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'no-matches';
      empty.textContent = 'No matches';
      this.#listEl.appendChild(empty);
      this.#inputEl.removeAttribute('aria-activedescendant');
      return;
    }

    this.#activeIdx = Math.max(0, Math.min(this.#activeIdx, matches.length - 1));
    matches.forEach((u, i) => {
      const row = document.createElement('div');
      row.className = 'row';
      row.id = `opt-${i}`;
      row.setAttribute('role', 'option');
      row.setAttribute('aria-selected', String(i === this.#activeIdx));
      row.appendChild(this.#avatarFor(u));
      const meta = document.createElement('div');
      meta.className = 'row-meta';
      const name = document.createElement('div');
      name.className = 'row-name';
      name.textContent = u.name || '';
      const title = document.createElement('div');
      title.className = 'row-title';
      title.textContent = u.title || '';
      meta.appendChild(name);
      meta.appendChild(title);
      row.appendChild(meta);
      // mousedown (not click) so the pick lands before the input blurs (#38).
      row.addEventListener('mousedown', (e) => { e.preventDefault(); this.#addOwner(u.id); });
      row.addEventListener('mouseenter', () => this.#setActive(i, false));
      this.#listEl.appendChild(row);
      if (i === this.#activeIdx) {
        this.#inputEl.setAttribute('aria-activedescendant', row.id);
      }
    });
  }

  /* Move the keyboard-active row without rebuilding the list (no hover
     flicker); scroll only for keyboard moves. */
  #setActive(idx, scroll) {
    const rows = this.#listEl.querySelectorAll('.row');
    if (rows.length === 0) return;
    if (rows[this.#activeIdx]) rows[this.#activeIdx].setAttribute('aria-selected', 'false');
    this.#activeIdx = Math.max(0, Math.min(idx, rows.length - 1));
    const row = rows[this.#activeIdx];
    row.setAttribute('aria-selected', 'true');
    this.#inputEl.setAttribute('aria-activedescendant', row.id);
    if (scroll) row.scrollIntoView({ block: 'nearest' });
  }
}

if (!customElements.get('ui-owner-picker')) {
  customElements.define('ui-owner-picker', UiOwnerPicker);
}
