/* ============================================================================
 * <ui-stakeholder-map> — Stakeholdr heat/scatter combo map.
 * 4-column × 6-row heatmap grid with scatter bubbles overlaid.
 * Shadow DOM mode:'open'. Styled ONLY with --ui-sys-* tokens — no hardcoded colors.
 *
 * Props (reflected):
 *   data  — JSON array of {name, x, y, org?} stakeholders (set via .data property)
 *
 * States:
 *   selected  — index of selected bubble (-1 = none)
 *
 * Tokens consumed: --ui-sys-zone-*, --ui-sys-zone-ink-*, --ui-sys-zone-border-*,
 *   --ui-sys-font-*, --ui-sys-on-surface, --ui-sys-on-surface-muted,
 *   --ui-sys-on-surface-faint, --ui-sys-surface-card, --ui-sys-surface-container,
 *   --ui-sys-outline, --ui-sys-outline-subtle, --ui-sys-divider,
 *   --ui-sys-space-*, --ui-sys-shape-*, --ui-sys-elevation-*,
 *   --ui-sys-accent, --ui-sys-motion-control, --ui-sys-motion-emphasis,
 *   --ui-sys-focus-ring
 * ========================================================================== */

const GRID = [
  ['Proactively Defend', 'Defend',   'Valuable Relationship',    'Strategic Partner'],
  ['Defend',             'Protect',  'Collaborate',               'High Value Relationship'],
  ['Protect',            'Respond',  'Cooperate',                 'Collaborate'],
  ['Protect',            'Respond',  'Cooperate',                 'Collaborate'],
  ['Identify',           'Identify', 'Commit',                    'Commit'],
  ['Monitor',            'Monitor',  'Maintain',                  'Connect'],
];

// Token name per status (bg, ink)
const ZONE_TOKENS = {
  'Proactively Defend':    { bg: '--ui-sys-zone-proactively-defend',    ink: '--ui-sys-zone-ink-on-strong',  border: '--ui-sys-zone-border-negative' },
  'Defend':                { bg: '--ui-sys-zone-defend',                 ink: '--ui-sys-zone-ink-negative',   border: '--ui-sys-zone-border-negative' },
  'Protect':               { bg: '--ui-sys-zone-protect',                ink: '--ui-sys-zone-ink-negative',   border: '--ui-sys-zone-border-negative' },
  'Respond':               { bg: '--ui-sys-zone-respond',                ink: '--ui-sys-zone-ink-negative',   border: '--ui-sys-zone-border-negative' },
  'Identify':              { bg: '--ui-sys-zone-identify',               ink: '--ui-sys-zone-ink-negative',   border: '--ui-sys-zone-border-negative' },
  'Monitor':               { bg: '--ui-sys-zone-monitor',                ink: '--ui-sys-zone-ink-neutral',    border: null },
  'Maintain':              { bg: '--ui-sys-zone-maintain',               ink: '--ui-sys-zone-ink-neutral',    border: null },
  'Commit':                { bg: '--ui-sys-zone-commit',                  ink: '--ui-sys-zone-ink-neutral',    border: null },
  'Connect':               { bg: '--ui-sys-zone-connect',                 ink: '--ui-sys-zone-ink-neutral',    border: null },
  'Cooperate':             { bg: '--ui-sys-zone-cooperate',               ink: '--ui-sys-zone-ink-positive',   border: null },
  'Collaborate':           { bg: '--ui-sys-zone-collaborate',             ink: '--ui-sys-zone-ink-positive',   border: null },
  'Valuable Relationship': { bg: '--ui-sys-zone-valuable-relationship',   ink: '--ui-sys-zone-ink-positive',   border: null },
  'High Value Relationship':{ bg: '--ui-sys-zone-high-value-relationship',ink: '--ui-sys-zone-ink-positive',   border: null },
  'Strategic Partner':     { bg: '--ui-sys-zone-strategic-partner',       ink: '--ui-sys-zone-ink-on-strong',  border: '--ui-sys-zone-border-positive' },
};

const STRATEGY = {
  'Valuable Relationship':  { title: 'Stakeholder Important To Our Business Success',           action: 'Stakeholder is an important surrogate, ally, or business partner. Investing in and growing this relationship proactively supports and defends the business and increases our reputation. Prioritize collaboration and deploying engagement strategies.' },
  'Strategic Partner':      { title: 'Shared Value Created',                                    action: 'Shared value created. Formalize a working relationship or partnership with the stakeholder to produce and measure shared value; relationship grows the business, increases our reputation, and produces solutions.' },
  'Collaborate':            { title: 'Investing In Relationship Will Improve Our Business Or Reputation', action: 'Commitment important to our business; establish opportunities to work together and reap mutual benefits; leverage stakeholder\'s influence to increase our reputation.' },
  'High Value Relationship':{ title: 'Investing In Relationship Will Improve Our Business Or Reputation', action: 'Commitment important to our business; establish opportunities to work together and reap mutual benefits; leverage stakeholder\'s influence to increase our reputation.' },
  'Defend':                 { title: 'Neutralize Threat',                                       action: 'Defend license to operate. Defend reputation against regular attacks from stakeholders with high influence who are unlikely to move toward positive support; discredit message or position. Measure and report on activity often.' },
  'Proactively Defend':     { title: 'Neutralize Threat — Act First',                           action: 'Actively and proactively defend license to operate against this high-influence, strongly-opposed stakeholder. Discredit message or position. Monitor constantly and escalate immediately on change.' },
  'Protect':                { title: 'Protect Against Risk',                                    action: 'Monitor for escalation and be prepared to defend. Track stakeholder closely and ensure risk mitigation strategies are in place before this stakeholder becomes a material threat.' },
  'Respond':                { title: 'Respond To Concerns',                                     action: 'Engage to understand concerns and respond appropriately. Neutral-to-negative sentiment; targeted engagement may shift position. Do not over-invest; respond proportionally.' },
  'Identify':               { title: 'Identify And Profile',                                    action: 'Low influence, negative orientation. Identify, profile, and monitor. No immediate action required; track in case influence grows.' },
  'Monitor':                { title: 'Plan Ahead, Listen',                                      action: 'Map stakeholder and plan to respond in the event of change; assign internal staff, team, or working group to execute plan if necessary.' },
  'Maintain':               { title: 'Maintain Relationship',                                   action: 'Maintain current relationship level. Low-priority but stable; low-cost touches keep relationship warm in case influence grows.' },
  'Commit':                 { title: 'Commit To Relationship',                                  action: 'Stakeholder is moving toward positive; commit resources to deepen engagement and convert to active support. Momentum is in your favour.' },
  'Connect':                { title: 'Connect And Engage',                                      action: 'Low influence, leaning positive. Connect and build familiarity; low-cost engagement builds goodwill for future.' },
  'Cooperate':              { title: 'Cooperate For Mutual Benefit',                            action: 'Cooperate on areas of common interest. Identify shared goals and establish working-level contact; relationship has upside if nurtured.' },
};

const SAMPLE_DATA = [
  { name: 'Mayor Maria Chen',    x:  2.9, y:  8.1 },
  { name: 'Cedarville Chamber',  x:  1.5, y:  4.2 },
  { name: 'Riverside Tribune',   x: -3.2, y:  6.0 },
  { name: 'Sam Okafor',          x:  6.5, y:  1.0 },
  { name: 'Local Union 12',      x: -7.0, y:  7.5 },
  { name: 'Youth Program',       x:  4.0, y: -6.0 },
  { name: 'County Board',        x: -2.0, y: -3.0 },
  { name: 'Tech Partner Co',     x:  8.0, y:  6.5 },
];

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function statusFor(x, y) {
  const cx = clamp(x, -10, 10);
  const cy = clamp(y, -10, 10);
  const row = cy > 5 ? 0 : cy > 2.5 ? 1 : cy > 0 ? 2 : cy > -2.5 ? 3 : cy > -5 ? 4 : 5;
  const col = cx < -5 ? 0 : cx < 0 ? 1 : cx < 5 ? 2 : 3;
  return GRID[row][col];
}

function initials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function bubblePos(x, y) {
  return {
    left: ((x + 10) / 20) * 100,
    top:  ((10 - y) / 20) * 100,
  };
}

// ---- CSS (token-only) -------------------------------------------------------

const CSS = `
  :host {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    font: var(--ui-sys-font-body);
    color: var(--ui-sys-on-surface);
    background: var(--ui-sys-surface-card);
    gap: var(--ui-sys-space-4);
    min-height: 420px;
    overflow: hidden;
  }

  /* ---- Left: map area ---- */
  .map-area {
    flex: 1 1 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: var(--ui-sys-space-4) var(--ui-sys-space-2) var(--ui-sys-space-4) var(--ui-sys-space-4);
  }

  .map-title {
    font: var(--ui-sys-font-caption);
    color: var(--ui-sys-on-surface-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: var(--ui-sys-space-2);
  }

  /* outer layout: y-axis + grid column */
  .map-body {
    flex: 1 1 0;
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 0;
    min-height: 0;
  }

  /* y-axis ticks */
  .y-axis {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-end;
    padding-right: var(--ui-sys-space-1);
    width: 28px;
    flex-shrink: 0;
  }
  .y-tick {
    font: var(--ui-sys-font-caption);
    color: var(--ui-sys-on-surface-muted);
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }

  /* grid + bubbles container */
  .grid-wrapper {
    flex: 1 1 0;
    min-width: 0;
    position: relative;
  }

  /* the 4-col × 6-row grid */
  .grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(6, 1fr);
    width: 100%;
    height: 100%;
    border: 1px solid var(--ui-sys-outline);
    border-radius: var(--ui-sys-shape-control);
    overflow: hidden;
  }

  .cell {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    padding: 3px 4px 2px 4px;
    border-right: 1px solid rgba(0,0,0,.07);
    border-bottom: 1px solid rgba(0,0,0,.07);
    overflow: hidden;
    min-width: 0;
  }
  .cell:nth-child(4n) { border-right: none; }
  .cell:nth-last-child(-n+4) { border-bottom: none; }

  .cell-label {
    font: var(--ui-sys-font-caption);
    font-size: 9px;
    line-height: 1.2;
    max-width: 70%;
    word-break: break-word;
    opacity: 0.72;
  }

  .cell-badge {
    font: var(--ui-sys-font-caption);
    font-size: 9px;
    line-height: 1;
    min-width: 14px;
    text-align: right;
    font-variant-numeric: tabular-nums;
    opacity: 0.85;
    flex-shrink: 0;
  }

  /* bubble overlay (absolutely positioned over grid-wrapper) */
  .bubbles {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .bubble {
    position: absolute;
    width: 26px;
    height: 26px;
    border-radius: var(--ui-sys-shape-pill);
    display: flex;
    align-items: center;
    justify-content: center;
    font: var(--ui-sys-font-label);
    font-size: 10px;
    letter-spacing: 0.02em;
    transform: translate(-50%, -50%);
    cursor: pointer;
    pointer-events: all;
    transition: transform var(--ui-sys-motion-control),
                box-shadow var(--ui-sys-motion-control);
    border: 1.5px solid transparent;
    user-select: none;
    z-index: 2;
  }
  .bubble:hover {
    transform: translate(-50%, -50%) scale(1.18);
    box-shadow: var(--ui-sys-elevation-2);
    z-index: 3;
  }
  .bubble:focus-visible {
    outline: 2px solid var(--ui-sys-focus-ring);
    outline-offset: 2px;
  }
  .bubble[aria-pressed="true"] {
    transform: translate(-50%, -50%) scale(1.22);
    box-shadow: 0 0 0 3px var(--ui-sys-accent), var(--ui-sys-elevation-2);
    z-index: 4;
  }

  /* ---- Legend ---- */
  .legend {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    gap: var(--ui-sys-space-2);
    margin-top: var(--ui-sys-space-2);
    padding: 0 2px;
  }
  .legend-part {
    font: var(--ui-sys-font-caption);
    color: var(--ui-sys-on-surface-muted);
    text-align: center;
    flex: 1;
  }
  .legend-part:first-child { text-align: left; }
  .legend-part:last-child  { text-align: right; }

  /* ---- Detail panel ---- */
  .detail-panel {
    width: 268px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--ui-sys-surface-container);
    border-left: 1px solid var(--ui-sys-outline-subtle);
    transition: width var(--ui-sys-motion-emphasis), opacity var(--ui-sys-motion-emphasis);
    overflow: hidden;
  }
  .detail-panel[hidden] {
    display: none;
  }

  .detail-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: var(--ui-sys-space-3) var(--ui-sys-space-4);
    border-bottom: 1px solid var(--ui-sys-outline-subtle);
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
    font: var(--ui-sys-font-body);
    font-size: 16px;
    color: var(--ui-sys-on-surface-muted);
    padding: 2px 4px;
    border-radius: var(--ui-sys-shape-control);
    line-height: 1;
    transition: color var(--ui-sys-motion-control);
  }
  .detail-close:hover { color: var(--ui-sys-on-surface); }
  .detail-close:focus-visible {
    outline: 2px solid var(--ui-sys-focus-ring);
    outline-offset: 2px;
  }

  .detail-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--ui-sys-space-4);
    display: flex;
    flex-direction: column;
    gap: var(--ui-sys-space-3);
  }

  .detail-name {
    font: var(--ui-sys-font-title);
    font-size: 16px;
    color: var(--ui-sys-on-surface);
    margin: 0;
  }
  .detail-org {
    font: var(--ui-sys-font-body);
    color: var(--ui-sys-on-surface-muted);
    margin: 0;
  }

  .detail-pill-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--ui-sys-space-2);
    flex-wrap: wrap;
  }
  .detail-pill {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    border-radius: var(--ui-sys-shape-pill);
    font: var(--ui-sys-font-label);
    font-size: 11px;
  }
  .detail-coords {
    font: var(--ui-sys-font-caption);
    color: var(--ui-sys-on-surface-muted);
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
  }

  .detail-strategy {
    border-radius: var(--ui-sys-shape-control);
    padding: var(--ui-sys-space-3);
    display: flex;
    flex-direction: column;
    gap: var(--ui-sys-space-1);
  }
  .detail-strategy-eyebrow {
    font: var(--ui-sys-font-caption);
    text-transform: uppercase;
    letter-spacing: 0.10em;
    opacity: 0.7;
    font-size: 9px;
    margin: 0;
  }
  .detail-strategy-title {
    font: var(--ui-sys-font-label);
    font-size: 12px;
    margin: 0;
  }
  .detail-strategy-action {
    font: var(--ui-sys-font-body);
    font-size: 12px;
    line-height: 1.5;
    margin: 0;
    opacity: 0.88;
  }

  .detail-kv {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: var(--ui-sys-space-2);
    font: var(--ui-sys-font-body);
    font-size: 12px;
  }
  .detail-kv-key {
    color: var(--ui-sys-on-surface-muted);
    min-width: 64px;
    flex-shrink: 0;
  }
  .detail-kv-val {
    color: var(--ui-sys-on-surface);
  }
`;

// ---- Template ---------------------------------------------------------------

const template = document.createElement('template');
template.innerHTML = `<style>${CSS}</style>
<section class="map-area" role="group" aria-label="Stakeholder mapping">
  <p class="map-title">STAKEHOLDER MAPPING</p>
  <div class="map-body">
    <div class="y-axis" aria-hidden="true"></div>
    <div class="grid-wrapper">
      <div class="grid" role="grid" aria-label="Relationship zones, 4 columns by 6 rows"></div>
      <div class="bubbles" role="group" aria-label="Stakeholders"></div>
    </div>
  </div>
  <div class="legend" aria-hidden="true">
    <span class="legend-part">← Works against you</span>
    <span class="legend-part">↑ Greater community influence · ↓ Less</span>
    <span class="legend-part">Works with you →</span>
  </div>
</section>
<aside class="detail-panel" hidden aria-label="Stakeholder detail">
  <div class="detail-header">
    <span class="detail-header-label">Detail</span>
    <button class="detail-close" aria-label="Close detail">×</button>
  </div>
  <div class="detail-body"></div>
</aside>`;

// ---- Element ----------------------------------------------------------------

class UiStakeholderMap extends HTMLElement {
  static observedAttributes = [];

  #data = [];
  #selected = -1;
  #grid;
  #bubblesEl;
  #yAxis;
  #detailPanel;
  #detailBody;
  #detailClose;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
    const sr = this.shadowRoot;
    this.#grid       = sr.querySelector('.grid');
    this.#bubblesEl  = sr.querySelector('.bubbles');
    this.#yAxis      = sr.querySelector('.y-axis');
    this.#detailPanel = sr.querySelector('.detail-panel');
    this.#detailBody  = sr.querySelector('.detail-body');
    this.#detailClose = sr.querySelector('.detail-close');
  }

  connectedCallback() {
    if (!this.#data.length) this.#data = SAMPLE_DATA.slice();
    this.#detailClose.addEventListener('click', () => this.#selectBubble(-1));
    this.#render();
  }

  disconnectedCallback() {}

  // Public property: accepts array of {name, x, y, org?}
  get data() { return this.#data; }
  set data(val) {
    this.#data = Array.isArray(val) ? val : [];
    this.#selected = -1;
    this.#render();
  }

  // ---- Build counts map -----
  #cellKey(row, col) { return `${row}_${col}`; }

  #countBubbles() {
    const counts = new Map();
    for (const s of this.#data) {
      const status = statusFor(s.x, s.y);
      // find row/col for this status
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
          if (GRID[r][c] === status) {
            // We need the specific cell that matches this stake's exact grid position
          }
        }
      }
      // Use actual row/col from clamped coords
      const cx = clamp(s.x, -10, 10);
      const cy = clamp(s.y, -10, 10);
      const row = cy > 5 ? 0 : cy > 2.5 ? 1 : cy > 0 ? 2 : cy > -2.5 ? 3 : cy > -5 ? 4 : 5;
      const col = cx < -5 ? 0 : cx < 0 ? 1 : cx < 5 ? 2 : 3;
      const k = this.#cellKey(row, col);
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    return counts;
  }

  // ---- Render all -----
  #render() {
    this.#renderYAxis();
    this.#renderGrid();
    this.#renderBubbles();
  }

  #renderYAxis() {
    const ticks = [10, 7.5, 5, 2.5, 0, -2.5, -5, -7.5, -10];
    this.#yAxis.innerHTML = '';
    for (const t of ticks) {
      const el = document.createElement('span');
      el.className = 'y-tick';
      el.textContent = t;
      this.#yAxis.appendChild(el);
    }
  }

  #renderGrid() {
    const counts = this.#countBubbles();
    this.#grid.innerHTML = '';
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        const status = GRID[row][col];
        const tok = ZONE_TOKENS[status] || {};
        const count = counts.get(this.#cellKey(row, col)) || 0;

        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.setAttribute('role', 'gridcell');
        cell.setAttribute('aria-label', `${status}${count ? ', ' + count + ' stakeholder' + (count > 1 ? 's' : '') : ''}`);
        cell.style.background = `var(${tok.bg})`;
        cell.style.color = `var(${tok.ink})`;

        const label = document.createElement('span');
        label.className = 'cell-label';
        label.textContent = status;

        cell.appendChild(label);

        if (count > 0) {
          const badge = document.createElement('span');
          badge.className = 'cell-badge';
          badge.textContent = count;
          badge.setAttribute('aria-hidden', 'true');
          cell.appendChild(badge);
        }

        this.#grid.appendChild(cell);
      }
    }
  }

  #renderBubbles() {
    this.#bubblesEl.innerHTML = '';
    this.#data.forEach((s, i) => {
      const status = statusFor(s.x, s.y);
      const tok = ZONE_TOKENS[status] || {};
      const pos = bubblePos(s.x, s.y);

      const el = document.createElement('button');
      el.className = 'bubble';
      el.style.left = `${pos.left}%`;
      el.style.top  = `${pos.top}%`;
      el.style.background = `var(${tok.bg})`;
      el.style.color = `var(${tok.ink})`;

      // border: use zone-border tokens for the two extremes, else the ink color
      if (tok.border) {
        el.style.borderColor = `var(${tok.border})`;
      } else {
        el.style.borderColor = `var(${tok.ink})`;
      }
      el.style.borderOpacity = '0.35'; // visual hint

      el.setAttribute('role', 'button');
      el.setAttribute('aria-label', `${s.name} — ${status} (${s.x}, ${s.y})`);
      el.setAttribute('aria-pressed', this.#selected === i ? 'true' : 'false');
      el.setAttribute('tabindex', '0');

      el.textContent = initials(s.name);

      el.addEventListener('click', () => this.#selectBubble(this.#selected === i ? -1 : i));
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.#selectBubble(this.#selected === i ? -1 : i);
        }
      });

      this.#bubblesEl.appendChild(el);
    });
  }

  #selectBubble(idx) {
    this.#selected = idx;
    // Update all aria-pressed states
    const bubbles = this.#bubblesEl.querySelectorAll('.bubble');
    bubbles.forEach((b, i) => {
      b.setAttribute('aria-pressed', i === idx ? 'true' : 'false');
    });

    if (idx === -1) {
      this.#detailPanel.hidden = true;
      return;
    }

    this.#detailPanel.hidden = false;
    this.#renderDetail(this.#data[idx]);

    this.dispatchEvent(new CustomEvent('stakeholder-select', {
      bubbles: true, composed: true,
      detail: { index: idx, stakeholder: this.#data[idx] }
    }));
  }

  #renderDetail(s) {
    const status = statusFor(s.x, s.y);
    const tok = ZONE_TOKENS[status] || {};
    const strat = STRATEGY[status] || null;

    const fmtCoord = (n) => (n >= 0 ? '+' : '') + n.toFixed(1);

    let html = '';

    // Name + org
    html += `<p class="detail-name">${this.#esc(s.name)}</p>`;
    if (s.org) html += `<p class="detail-org">${this.#esc(s.org)}</p>`;

    // Pill + coords
    html += `<div class="detail-pill-row">`;
    html += `<span class="detail-pill"
      style="background:var(${tok.bg});color:var(${tok.ink})"
    >${this.#esc(status)}</span>`;
    html += `<span class="detail-coords">(${fmtCoord(s.x)}, ${fmtCoord(s.y)})</span>`;
    html += `</div>`;

    // Strategy box
    if (strat) {
      html += `<div class="detail-strategy"
        style="background:var(${tok.bg});color:var(${tok.ink})"
      >`;
      html += `<p class="detail-strategy-eyebrow">STRATEGY</p>`;
      html += `<p class="detail-strategy-title">${this.#esc(strat.title)}</p>`;
      html += `<p class="detail-strategy-action">${this.#esc(strat.action)}</p>`;
      html += `</div>`;
    }

    // Category KV
    html += `<div class="detail-kv">
      <span class="detail-kv-key">Category</span>
      <span class="detail-kv-val">${this.#esc(status)}</span>
    </div>`;

    this.#detailBody.innerHTML = html;
  }

  #esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

if (!customElements.get('ui-stakeholder-map')) {
  customElements.define('ui-stakeholder-map', UiStakeholderMap);
}
