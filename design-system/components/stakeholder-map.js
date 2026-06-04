/* ============================================================================
 * <ui-stakeholder-map> — domain component: heat/scatter stakeholder map.
 *
 * Renders a 4-column × 6-row zone heatmap with scatter bubbles on top.
 * Grid zones match the Stakeholdr relationship engine (GRID, statusFor).
 * Styled ONLY with --ui-sys-* tokens — no hardcoded colors.
 *
 * Properties:
 *   .data  Array<{name:string, x:number, y:number, org?:string}>
 *          Set after upgrade or in connectedCallback; defaults to sample data.
 *
 * Events:
 *   bubble-select  CustomEvent({detail:{name,x,y,status}})  on bubble click/key
 *
 * To restyle: change --ui-sys-zone-* tokens in tokens.css, never this file.
 * ========================================================================= */

/* ---------- static data tables (no DOM dependency) ----------------------- */

const GRID = [
  ['Proactively Defend', 'Defend',   'Valuable Relationship', 'Strategic Partner'],
  ['Defend',             'Protect',  'Collaborate',           'High Value Relationship'],
  ['Protect',            'Respond',  'Cooperate',             'Collaborate'],
  ['Protect',            'Respond',  'Cooperate',             'Collaborate'],
  ['Identify',           'Identify', 'Commit',                'Commit'],
  ['Monitor',            'Monitor',  'Maintain',              'Connect'],
];

/** status label → CSS custom-property suffixes */
const ZONE_TOKENS = {
  'Proactively Defend':      { bg: '--ui-sys-zone-proactively-defend',        ink: '--ui-sys-zone-ink-on-strong',  border: '--ui-sys-zone-border-negative' },
  'Defend':                  { bg: '--ui-sys-zone-defend',                    ink: '--ui-sys-zone-ink-negative',   border: '--ui-sys-zone-border-negative' },
  'Protect':                 { bg: '--ui-sys-zone-protect',                   ink: '--ui-sys-zone-ink-negative',   border: '--ui-sys-zone-border-negative' },
  'Respond':                 { bg: '--ui-sys-zone-respond',                   ink: '--ui-sys-zone-ink-negative',   border: '--ui-sys-zone-border-negative' },
  'Identify':                { bg: '--ui-sys-zone-identify',                  ink: '--ui-sys-zone-ink-negative',   border: '--ui-sys-zone-border-negative' },
  'Monitor':                 { bg: '--ui-sys-zone-monitor',                   ink: '--ui-sys-zone-ink-neutral',    border: null },
  'Maintain':                { bg: '--ui-sys-zone-maintain',                  ink: '--ui-sys-zone-ink-neutral',    border: null },
  'Commit':                  { bg: '--ui-sys-zone-commit',                    ink: '--ui-sys-zone-ink-neutral',    border: null },
  'Connect':                 { bg: '--ui-sys-zone-connect',                   ink: '--ui-sys-zone-ink-neutral',    border: null },
  'Cooperate':               { bg: '--ui-sys-zone-cooperate',                 ink: '--ui-sys-zone-ink-positive',   border: null },
  'Collaborate':             { bg: '--ui-sys-zone-collaborate',               ink: '--ui-sys-zone-ink-positive',   border: null },
  'Valuable Relationship':   { bg: '--ui-sys-zone-valuable-relationship',     ink: '--ui-sys-zone-ink-positive',   border: null },
  'High Value Relationship': { bg: '--ui-sys-zone-high-value-relationship',   ink: '--ui-sys-zone-ink-positive',   border: null },
  'Strategic Partner':       { bg: '--ui-sys-zone-strategic-partner',         ink: '--ui-sys-zone-ink-on-strong',  border: '--ui-sys-zone-border-positive' },
};

const STRATEGIES = {
  'Proactively Defend':     { title: 'Protect License To Operate',                              action: 'Actively defend your position against stakeholders with strong negative influence. Engage directly, rebut misinformation, and build counter-coalitions. Monitor closely and report frequently.' },
  'Defend':                 { title: 'Neutralize Threat',                                        action: 'Defend license to operate. Defend reputation against regular attacks from stakeholders with high influence who are unlikely to move toward positive support; discredit message or position. Measure and report on activity often.' },
  'Protect':                { title: 'Limit Damage, Watch For Change',                           action: 'Maintain awareness and limit exposure. These stakeholders have limited influence but negative orientation; monitor for shifts and respond quickly if influence rises.' },
  'Respond':                { title: 'Engage To Understand And Shift',                           action: 'Engage to understand concerns; seek to shift orientation toward neutral or positive. Low influence means risk is managed, but movement is possible with targeted outreach.' },
  'Identify':               { title: 'Map And Prepare',                                          action: 'Identify and map these stakeholders before they become active risks. Build internal plans for rapid engagement if their influence increases.' },
  'Monitor':                { title: 'Plan Ahead, Listen',                                       action: 'Map stakeholder and plan to respond in the event of change; assign internal staff, team, or working group to execute plan if necessary.' },
  'Maintain':               { title: 'Keep Warm, Low Effort',                                    action: 'Maintain periodic contact. These stakeholders are currently low influence and neutral; regular light touch keeps the relationship available if circumstances change.' },
  'Commit':                 { title: 'Develop And Cultivate',                                    action: 'These stakeholders lean positive and have room to grow in influence. Invest in developing the relationship so they become advocates as their influence increases.' },
  'Connect':                { title: 'Build The Bridge',                                         action: 'Connect and begin building a relationship. Low influence but supportive orientation creates a low-risk opportunity to establish goodwill before influence grows.' },
  'Cooperate':              { title: 'Work Together On Shared Goals',                            action: 'Find areas of mutual interest and cooperate. These stakeholders are moderately supportive; joint activity strengthens alignment and can move them toward collaboration.' },
  'Collaborate':            { title: 'Investing In Relationship Will Improve Our Business Or Reputation', action: "Commitment important to our business; establish opportunities to work together and reap mutual benefits; leverage stakeholder's influence to increase our reputation." },
  'Valuable Relationship':  { title: 'Stakeholder Important To Our Business Success',            action: 'Stakeholder is an important surrogate, ally, or business partner. Investing in and growing this relationship proactively supports and defends the business and increases our reputation. Prioritize collaboration and deploying engagement strategies.' },
  'High Value Relationship':{ title: 'Invest And Deepen',                                        action: 'This is a high-influence, highly supportive stakeholder. Invest significantly in deepening the relationship; formalize touchpoints and ensure they remain engaged and informed.' },
  'Strategic Partner':      { title: 'Shared Value Created',                                     action: 'Shared value created. Formalize a working relationship or partnership with the stakeholder to produce and measure shared value; relationship grows the business, increases our reputation, and produces solutions.' },
};

const SAMPLE_DATA = [
  { name: 'Mayor Maria Chen',   x:  2.9, y:  8.1 },
  { name: 'Cedarville Chamber', x:  1.5, y:  4.2 },
  { name: 'Riverside Tribune',  x: -3.2, y:  6.0 },
  { name: 'Sam Okafor',         x:  6.5, y:  1.0 },
  { name: 'Local Union 12',     x: -7.0, y:  7.5 },
  { name: 'Youth Program',      x:  4.0, y: -6.0 },
  { name: 'County Board',       x: -2.0, y: -3.0 },
  { name: 'Tech Partner Co',    x:  8.0, y:  6.5 },
];

/* ---------- helpers ------------------------------------------------------ */

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function statusFor(rawX, rawY) {
  const x = clamp(rawX, -10, 10);
  const y = clamp(rawY, -10, 10);
  const row = y > 5 ? 0 : y > 2.5 ? 1 : y > 0 ? 2 : y > -2.5 ? 3 : y > -5 ? 4 : 5;
  const col = x < -5 ? 0 : x < 0 ? 1 : x < 5 ? 2 : 3;
  return GRID[row][col];
}

function initials(name) {
  const parts = String(name).trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function posPct(x, y) {
  return {
    left: ((x + 10) / 20) * 100,
    top:  ((10 - y) / 20) * 100,
  };
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ---------- template ---------------------------------------------------- */

const template = document.createElement('template');
template.innerHTML = `
<style>
  :host {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: var(--ui-sys-space-4);
    font: var(--ui-sys-font-body);
    color: var(--ui-sys-on-surface);
    background: var(--ui-sys-surface);
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    min-height: 420px;
    overflow: hidden;
  }

  *, *::before, *::after { box-sizing: border-box; }

  /* ---- y-axis tick column ---- */
  .y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    /* top padding matches title row height so ticks align with grid rows */
    padding: 26px 0 24px 0;
    width: 28px;
    flex-shrink: 0;
  }
  .y-tick {
    font: var(--ui-sys-font-caption);
    color: var(--ui-sys-on-surface-muted);
    text-align: right;
    line-height: 1;
    user-select: none;
  }

  /* ---- centre map column ---- */
  .map-col {
    display: flex;
    flex-direction: column;
    flex: 1 1 0;
    min-width: 0;
    gap: var(--ui-sys-space-2);
  }

  .map-title {
    font: var(--ui-sys-font-caption);
    letter-spacing: 0.12em;
    color: var(--ui-sys-on-surface-muted);
    text-transform: uppercase;
    text-align: center;
    user-select: none;
    flex-shrink: 0;
  }

  /* ---- grid wrapper (heatmap + scatter overlay) ---- */
  .grid-wrap {
    position: relative;
    flex: 1 1 0;
    min-height: 0;
    border: 1px solid var(--ui-sys-outline);
    border-radius: var(--ui-sys-shape-control);
    overflow: hidden;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(6, 1fr);
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
  }

  .cell {
    position: relative;
    border: 1px solid rgba(0,0,0,.06);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    padding: var(--ui-sys-space-1);
  }

  .cell-label {
    font: var(--ui-sys-font-caption);
    font-size: 10px;
    line-height: 1.2;
    opacity: 0.72;
    user-select: none;
    pointer-events: none;
    max-width: calc(100% - 20px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cell-count {
    position: absolute;
    top: var(--ui-sys-space-1);
    right: var(--ui-sys-space-1);
    min-width: 16px;
    height: 16px;
    border-radius: var(--ui-sys-shape-pill);
    background: rgba(0,0,0,.18);
    color: inherit;
    font: var(--ui-sys-font-caption);
    font-size: 10px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 3px;
    user-select: none;
    pointer-events: none;
  }

  /* ---- scatter overlay (absolute, sits above .grid) ---- */
  .scatter {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  /* ---- individual bubble ---- */
  .bubble {
    position: absolute;
    width: 26px;
    height: 26px;
    border-radius: var(--ui-sys-shape-pill);
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    font: var(--ui-sys-font-label);
    font-size: 10px;
    font-weight: 600;
    cursor: pointer;
    pointer-events: all;
    border: 1.5px solid transparent;
    transition:
      transform var(--ui-sys-motion-control),
      box-shadow var(--ui-sys-motion-control);
    user-select: none;
    outline: none;
    appearance: none;
    background: transparent;
  }
  .bubble:hover {
    transform: translate(-50%, -50%) scale(1.22);
    box-shadow: var(--ui-sys-elevation-2);
    z-index: 10;
  }
  .bubble:focus-visible {
    outline: 2px solid var(--ui-sys-focus-ring);
    outline-offset: 2px;
  }
  .bubble[aria-pressed="true"] {
    transform: translate(-50%, -50%) scale(1.28);
    box-shadow: 0 0 0 3px var(--ui-sys-accent), var(--ui-sys-elevation-2);
    z-index: 20;
  }

  /* ---- legend ---- */
  .legend {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--ui-sys-space-2);
    flex-shrink: 0;
  }
  .legend-part {
    font: var(--ui-sys-font-caption);
    color: var(--ui-sys-on-surface-muted);
    user-select: none;
    flex: 1;
    text-align: center;
  }
  .legend-part:first-child { text-align: left; }
  .legend-part:last-child  { text-align: right; }

  /* ---- detail panel ---- */
  .detail {
    width: 280px;
    flex-shrink: 0;
    background: var(--ui-sys-surface-card);
    border: 1px solid var(--ui-sys-outline);
    border-radius: var(--ui-sys-shape-card);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  .detail[hidden] { display: none; }

  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--ui-sys-space-3) var(--ui-sys-space-4);
    border-bottom: 1px solid var(--ui-sys-outline-subtle);
    flex-shrink: 0;
  }
  .detail-header-label {
    font: var(--ui-sys-font-label);
    color: var(--ui-sys-on-surface-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 11px;
  }
  .detail-close {
    appearance: none;
    background: none;
    border: none;
    cursor: pointer;
    color: var(--ui-sys-on-surface-muted);
    font-size: 18px;
    line-height: 1;
    padding: 2px 5px;
    border-radius: var(--ui-sys-shape-control);
    transition: background var(--ui-sys-motion-control),
                color var(--ui-sys-motion-control);
  }
  .detail-close:hover {
    background: var(--ui-sys-surface-hover);
    color: var(--ui-sys-on-surface);
  }
  .detail-close:focus-visible {
    outline: 2px solid var(--ui-sys-focus-ring);
    outline-offset: 2px;
  }

  .detail-body {
    padding: var(--ui-sys-space-4);
    display: flex;
    flex-direction: column;
    gap: var(--ui-sys-space-3);
    overflow-y: auto;
    flex: 1;
  }

  .detail-name {
    font: var(--ui-sys-font-title);
    color: var(--ui-sys-on-surface);
    margin: 0;
  }
  .detail-org {
    font: var(--ui-sys-font-body);
    color: var(--ui-sys-on-surface-muted);
    margin: 0;
  }

  .detail-meta {
    display: flex;
    align-items: center;
    gap: var(--ui-sys-space-2);
    flex-wrap: wrap;
  }

  .status-pill {
    display: inline-flex;
    align-items: center;
    border-radius: var(--ui-sys-shape-pill);
    padding: 2px 10px;
    font: var(--ui-sys-font-label);
    font-size: 11px;
    white-space: nowrap;
  }

  .detail-coords {
    font: var(--ui-sys-font-caption);
    color: var(--ui-sys-on-surface-muted);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.04em;
  }

  .strategy-box {
    border-radius: var(--ui-sys-shape-control);
    padding: var(--ui-sys-space-3);
    display: flex;
    flex-direction: column;
    gap: var(--ui-sys-space-2);
  }
  .strategy-eyebrow {
    font: var(--ui-sys-font-label);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    opacity: 0.7;
    margin: 0;
  }
  .strategy-title {
    font: var(--ui-sys-font-label);
    font-size: 13px;
    margin: 0;
  }
  .strategy-action {
    font: var(--ui-sys-font-body);
    font-size: 12px;
    line-height: 1.5;
    opacity: 0.85;
    margin: 0;
  }

  .detail-category {
    display: flex;
    gap: var(--ui-sys-space-2);
    font: var(--ui-sys-font-caption);
  }
  .detail-category-key { color: var(--ui-sys-on-surface-muted); flex-shrink: 0; }
  .detail-category-val { color: var(--ui-sys-on-surface); }
</style>

<!-- y-axis -->
<div class="y-axis" role="presentation" aria-hidden="true"></div>

<!-- centre column -->
<div class="map-col">
  <div class="map-title" aria-hidden="true">Stakeholder Mapping</div>

  <div class="grid-wrap"
       role="img"
       aria-label="Stakeholder relationship map: 4-column by 6-row heatmap with stakeholder bubbles positioned by influence and orientation.">
    <!-- heatmap cells -->
    <div class="grid" aria-hidden="true"></div>
    <!-- scatter bubbles -->
    <div class="scatter" role="group" aria-label="Stakeholder bubbles"></div>
  </div>

  <div class="legend" aria-hidden="true">
    <span class="legend-part">← Works against you</span>
    <span class="legend-part">↑ Greater community influence · ↓ Less community influence</span>
    <span class="legend-part">Works with you →</span>
  </div>
</div>

<!-- detail panel -->
<aside class="detail" hidden aria-live="polite" aria-label="Stakeholder detail">
  <div class="detail-header">
    <span class="detail-header-label">Detail</span>
    <button class="detail-close" aria-label="Close detail panel">×</button>
  </div>
  <div class="detail-body"></div>
</aside>
`;

/* ---------- custom element class ---------------------------------------- */

class UiStakeholderMap extends HTMLElement {
  #data = null;
  #selected = null;
  #resolved = [];   // [{name,x,y,org?,status}, ...]

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
  }

  /** Array<{name, x, y, org?}> — set after upgrade to replace sample data. */
  get data() { return this.#data; }
  set data(val) {
    this.#data = val;
    if (this.isConnected) this.#render();
  }

  connectedCallback() {
    this.#render();
    this.shadowRoot.querySelector('.detail-close')
      .addEventListener('click', () => this.#closeDetail());
  }

  /* ---- private ---- */

  #render() {
    const raw = this.#data ?? SAMPLE_DATA;
    this.#resolved = raw.map(d => ({ ...d, status: statusFor(d.x, d.y) }));
    this.#renderYAxis();
    this.#renderGrid();
    this.#renderBubbles();
    this.#closeDetail();
  }

  #renderYAxis() {
    const el = this.shadowRoot.querySelector('.y-axis');
    const ticks = [10, 7.5, 5, 2.5, 0, -2.5, -5, -7.5, -10];
    el.innerHTML = ticks
      .map(v => `<span class="y-tick">${v}</span>`)
      .join('');
  }

  #renderGrid() {
    const grid = this.shadowRoot.querySelector('.grid');

    // count bubbles per cell for the badge
    const counts = Array.from({ length: 6 }, () => Array(4).fill(0));
    for (const d of this.#resolved) {
      const x = clamp(d.x, -10, 10);
      const y = clamp(d.y, -10, 10);
      const row = y > 5 ? 0 : y > 2.5 ? 1 : y > 0 ? 2 : y > -2.5 ? 3 : y > -5 ? 4 : 5;
      const col = x < -5 ? 0 : x < 0 ? 1 : x < 5 ? 2 : 3;
      counts[row][col]++;
    }

    let html = '';
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 4; c++) {
        const status = GRID[r][c];
        const tok = ZONE_TOKENS[status] ?? {};
        const bg  = tok.bg  ? `var(${tok.bg})`  : 'transparent';
        const ink = tok.ink ? `var(${tok.ink})` : 'inherit';
        const cnt = counts[r][c];
        html += `<div class="cell" style="background:${bg};color:${ink};" role="presentation">` +
          `<span class="cell-label">${esc(status)}</span>` +
          (cnt > 0 ? `<span class="cell-count">${cnt}</span>` : '') +
          `</div>`;
      }
    }
    grid.innerHTML = html;
  }

  #renderBubbles() {
    const scatter = this.shadowRoot.querySelector('.scatter');
    scatter.innerHTML = '';

    this.#resolved.forEach((d, i) => {
      const tok = ZONE_TOKENS[d.status] ?? {};
      const bg     = tok.bg     ? `var(${tok.bg})`     : 'var(--ui-sys-surface-container)';
      const ink    = tok.ink    ? `var(${tok.ink})`    : 'var(--ui-sys-on-surface)';
      const border = tok.border ? `var(${tok.border})` : ink;

      const { left, top } = posPct(d.x, d.y);

      const btn = document.createElement('button');
      btn.className = 'bubble';
      btn.setAttribute('aria-label', `${d.name}, status: ${d.status}, coordinates: (${d.x}, ${d.y})`);
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('tabindex', '0');
      btn.style.cssText =
        `left:${left.toFixed(3)}%;` +
        `top:${top.toFixed(3)}%;` +
        `background:${bg};` +
        `color:${ink};` +
        `border-color:${border};`;
      btn.textContent = initials(d.name);
      btn.dataset.idx = String(i);

      btn.addEventListener('click', () => this.#select(i));
      btn.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.#select(i); }
        else if (e.key === 'Escape') this.#closeDetail();
      });

      scatter.appendChild(btn);
    });
  }

  #select(i) {
    this.#selected = i;
    this.shadowRoot.querySelectorAll('.bubble').forEach((b, j) => {
      b.setAttribute('aria-pressed', j === i ? 'true' : 'false');
    });
    this.#showDetail(this.#resolved[i]);
    this.dispatchEvent(new CustomEvent('bubble-select', {
      bubbles: true,
      composed: true,
      detail: { name: this.#resolved[i].name, x: this.#resolved[i].x, y: this.#resolved[i].y, status: this.#resolved[i].status },
    }));
  }

  #closeDetail() {
    this.#selected = null;
    this.shadowRoot.querySelectorAll('.bubble').forEach(b => b.setAttribute('aria-pressed', 'false'));
    const panel = this.shadowRoot.querySelector('.detail');
    panel.hidden = true;
    this.shadowRoot.querySelector('.detail-body').innerHTML = '';
  }

  #showDetail(d) {
    const tok   = ZONE_TOKENS[d.status] ?? {};
    const bg    = tok.bg  ? `var(${tok.bg})`  : 'var(--ui-sys-surface-container)';
    const ink   = tok.ink ? `var(${tok.ink})` : 'var(--ui-sys-on-surface)';
    const strat = STRATEGIES[d.status] ?? { title: d.status, action: '' };

    const body = this.shadowRoot.querySelector('.detail-body');
    body.innerHTML =
      `<p class="detail-name">${esc(d.name)}</p>` +
      (d.org ? `<p class="detail-org">${esc(d.org)}</p>` : '') +
      `<div class="detail-meta">` +
        `<span class="status-pill" style="background:${bg};color:${ink};">${esc(d.status)}</span>` +
        `<span class="detail-coords">(${(+d.x).toFixed(1)}, ${(+d.y).toFixed(1)})</span>` +
      `</div>` +
      `<div class="strategy-box" style="background:${bg};color:${ink};">` +
        `<p class="strategy-eyebrow">Strategy</p>` +
        `<p class="strategy-title">${esc(strat.title)}</p>` +
        `<p class="strategy-action">${esc(strat.action)}</p>` +
      `</div>` +
      `<div class="detail-category">` +
        `<span class="detail-category-key">Category</span>` +
        `<span class="detail-category-val">${esc(d.status)}</span>` +
      `</div>`;

    this.shadowRoot.querySelector('.detail').hidden = false;
  }
}

/* ---------- guarded define ---------------------------------------------- */
if (!customElements.get('ui-stakeholder-map')) {
  customElements.define('ui-stakeholder-map', UiStakeholderMap);
}
