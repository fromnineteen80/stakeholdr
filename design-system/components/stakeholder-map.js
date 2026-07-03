/* ============================================================================
 * <ui-stakeholder-map> — domain component: THE MAP, at the full sealed spec
 * ("Map — coordinate→pixel translation, dots, zones, read-only positions,
 * history trail, scorecard" in src/guide.jsx).
 *
 * The plot internals (zone grid, dots layer, ticks, trail SVG) are the ONE
 * sanctioned inline-SVG / positioned-div composition per the manifest; the
 * chrome/panel surfaces compose REAL ui-* elements (ui-inspector scorecard
 * rail, ui-icon-button reopen tab, ui-chip zone/priority/tag pills + filter
 * history toggle, ui-status-dot, ui-avatar owner stack, ui-button recent
 * rows, ui-tooltip hover tips). Styled ONLY with --ui-sys-* tokens — no
 * literal hex, no !important.
 *
 * READ-ONLY (sealed ruling): the map displays weighted positions; it never
 * edits them. The oracle's drag-to-rescore (pointermove/pointerup writers,
 * pctToCoord .25 rounding, updateCoordForStakeholder) is DELIBERATELY
 * REMOVED per the sealed box — single click selects, double-click opens the
 * profile, and nothing else touches a score.
 *
 * Properties (JS):
 *   .data   Array of stakeholder rows carrying RAW precomputed _x/_y/_status
 *           (the page computes weightedCoord/statusFor live) plus the
 *           stakeholder fields incl. history[] and notesHistory[].
 *   .users  Array of users (resolves the scorecard Owner avatar stack).
 *   .selectedId  Controlled selection (string id | null). The page owns
 *           selection (sealed: "selection lifts to the page"); the component
 *           emits selection-change and the page passes the id back here.
 * Attributes (display options; sealed TWEAK_DEFAULTS = halo/false/true/22):
 *   map-style        "halo" | "classic" | "density"   (default "halo")
 *   show-labels      "true"/"" | "false"              (default false)
 *   show-zone-labels "true"/"" | "false"              (default true)
 *   dot-size         px, sealed slider range 14–36    (default 22)
 *   gallery          boolean — preview/wireframes ONLY: renders the built-in
 *                    sample when no .data is set. Without it the component
 *                    renders EMPTY until .data arrives (make-real rule: the
 *                    app never shows a live-looking fake dataset).
 * Events (composed, bubble):
 *   selection-change {id}   single click / recent-row select (wrapSelect:
 *                           select + force scorecard open + exit history)
 *   open-profile     {id}   dot double-click (the full stakeholder profile)
 *
 * SINGLE-SOURCE NOTE: GRID / statusFor / coordToPct / the zone token map and
 * the 14 strategy/action strings are VERBATIM MIRRORS of the sealed engine
 * (src/app/data/engine.js — the app-side single source; the design system
 * cannot import app code). scripts/map-test.mjs asserts character-for-
 * character parity between this module and the engine on every one of them.
 * ========================================================================= */

import { abbrev, displayName, normalizeUrl } from './stakeholder-table.js';

/* ─────────────────────────────────────────────────────────────────────────
 * PURE, NODE-IMPORTABLE LOGIC (everything below is asserted by map-test.mjs)
 * ──────────────────────────────────────────────────────────────────────── */

/* Sealed 6×4 zone grid — mirror of engine.js GRID (parity-tested). */
export const GRID = [
  ['Proactively Defend', 'Defend',   'Valuable Relationship', 'Strategic Partner'],
  ['Defend',             'Protect',  'Collaborate',           'High Value Relationship'],
  ['Protect',            'Respond',  'Cooperate',             'Collaborate'],
  ['Protect',            'Respond',  'Cooperate',             'Collaborate'],
  ['Identify',           'Identify', 'Commit',                'Commit'],
  ['Monitor',            'Monitor',  'Maintain',              'Connect'],
];

/* Zone → token names — mirror of engine.js STATUSES cssVar/inkVar/borderVar
 * (parity-tested; border only on zones 1 and 14, sealed).                   */
export const ZONE_TOKENS = {
  'Proactively Defend':      { bg: '--ui-sys-zone-proactively-defend',      ink: '--ui-sys-zone-ink-on-strong', border: '--ui-sys-zone-border-negative' },
  'Defend':                  { bg: '--ui-sys-zone-defend',                  ink: '--ui-sys-zone-ink-negative',  border: null },
  'Protect':                 { bg: '--ui-sys-zone-protect',                 ink: '--ui-sys-zone-ink-negative',  border: null },
  'Respond':                 { bg: '--ui-sys-zone-respond',                 ink: '--ui-sys-zone-ink-negative',  border: null },
  'Identify':                { bg: '--ui-sys-zone-identify',                ink: '--ui-sys-zone-ink-negative',  border: null },
  'Monitor':                 { bg: '--ui-sys-zone-monitor',                 ink: '--ui-sys-zone-ink-neutral',   border: null },
  'Maintain':                { bg: '--ui-sys-zone-maintain',                ink: '--ui-sys-zone-ink-neutral',   border: null },
  'Commit':                  { bg: '--ui-sys-zone-commit',                  ink: '--ui-sys-zone-ink-neutral',   border: null },
  'Connect':                 { bg: '--ui-sys-zone-connect',                 ink: '--ui-sys-zone-ink-neutral',   border: null },
  'Cooperate':               { bg: '--ui-sys-zone-cooperate',               ink: '--ui-sys-zone-ink-positive',  border: null },
  'Collaborate':             { bg: '--ui-sys-zone-collaborate',             ink: '--ui-sys-zone-ink-positive',  border: null },
  'Valuable Relationship':   { bg: '--ui-sys-zone-valuable-relationship',   ink: '--ui-sys-zone-ink-positive',  border: null },
  'High Value Relationship': { bg: '--ui-sys-zone-high-value-relationship', ink: '--ui-sys-zone-ink-positive',  border: null },
  'Strategic Partner':       { bg: '--ui-sys-zone-strategic-partner',       ink: '--ui-sys-zone-ink-on-strong', border: '--ui-sys-zone-border-positive' },
};

/* Strategy card copy — VERBATIM mirror of engine.js STATUSES strategy/action
 * (the sealed user-facing strings; parity-tested character-for-character).  */
export const ZONE_STRATEGIES = {
  'Proactively Defend': {
    strategy: 'Address Key Influencer',
    action: "Launch plan to neutralize a major threat to the industry or company's license to operate; leverage reputation, resources, subject-matter experts, and other allied stakeholders to win. Measure and report on activity often.",
  },
  'Defend': {
    strategy: 'Neutralize Threat',
    action: 'Defend license to operate. Defend reputation against regular attacks from stakeholders with high influence who are unlikely to move toward positive support; discredit message or position. Measure and report on activity often.',
  },
  'Protect': {
    strategy: 'Mobilize Defense',
    action: "Take action with internal resources and strategy. Defend reputation against regular attacks; manage expectations for changing stakeholder dynamic or group's influence in the community. Measure and report on activity regularly.",
  },
  'Respond': {
    strategy: 'Challenge Stakeholder',
    action: "Implement plan to challenge misinformation; reduce stakeholder's ability to destabilize the business or challenge brand identity and reputation.",
  },
  'Identify': {
    strategy: 'React To Issues Or Conflict',
    action: "Work to neutralize threat; educate stakeholder; resolve or minimize the stakeholder's ability or willingness to maintain conflict. Assign internal staff, team, or working group to execute response.",
  },
  'Monitor': {
    strategy: 'Plan Ahead, Listen',
    action: 'Map stakeholder and plan to respond in the event of change; assign internal staff, team, or working group to execute plan if necessary.',
  },
  'Maintain': {
    strategy: 'Take Steps To Introduce Our Vision And Values',
    action: "Take simple steps to engage; educate and create awareness about the business; look for ways to increase alignment and the stakeholder's influence over time.",
  },
  'Connect': {
    strategy: 'Prioritize Resources Elsewhere',
    action: 'Take no action. Prioritize time and resources elsewhere but monitor for any negative changes in alignment or improved influence in the community over time.',
  },
  'Commit': {
    strategy: 'Understand Needs, Work Towards Common Purpose',
    action: 'Build greater understanding between our company and stakeholder groups; look for opportunities to continue education and alignment that could lead to improved collaboration or affinity toward the business.',
  },
  'Cooperate': {
    strategy: 'Existing Alignment Produces Some Favorable Outcomes',
    action: 'Some value already exists and should continue with moderate level of commitment; maintain existing level of relationship.',
  },
  'Collaborate': {
    strategy: 'Investing In Relationship Will Improve Our Business Or Reputation',
    action: "Commitment important to our business; establish opportunities to work together and reap mutual benefits; leverage stakeholder's influence to increase our reputation.",
  },
  'Valuable Relationship': {
    strategy: 'Stakeholder Important To Our Business Success',
    action: 'Stakeholder is an important surrogate, ally, or business partner. Investing in and growing this relationship proactively supports and defends the business and increases our reputation. Prioritize collaboration and deploying engagement strategies.',
  },
  'High Value Relationship': {
    strategy: 'Shared Value Introduced',
    action: 'Moderate shared value introduced; investing and growing this relationship produces value for our business and increases our reputation. Prioritize collaboration and engaging the stakeholder often to meet business and advocacy goals.',
  },
  'Strategic Partner': {
    strategy: 'Shared Value Created',
    action: 'Shared value created. Formalize a working relationship or partnership with the stakeholder to produce and measure shared value; relationship grows the business, increases our reputation, and produces solutions.',
  },
};

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* statusFor(x, y) — sealed lookup (mirror of engine.js; inputs clamped ±10). */
export function statusFor(rawX, rawY) {
  const x = clamp(rawX, -10, 10);
  const y = clamp(rawY, -10, 10);
  const row = y > 5 ? 0 : y > 2.5 ? 1 : y > 0 ? 2 : y > -2.5 ? 3 : y > -5 ? 4 : 5;
  const col = x < -5 ? 0 : x < 0 ? 1 : x < 5 ? 2 : 3;
  return GRID[row][col];
}

/* coordToPct(x, y) — THE sealed coordinate→pixel translation (mirror of the
 * single source, engine.js / Shared-UI-primitives box):
 *   left = ((x+10)/20)*100 + "%" ; top = ((10−y)/20)*100 + "%"
 * x=-10 → left 0%; x=+10 → left 100%; y=+10 → TOP 0% (positive y renders UP);
 * origin (0,0) at dead centre. (pctToCoord, the drag inverse, is captured in
 * the sealed box but NOT built — dragging is removed by ruling.)             */
export function coordToPct(x, y) {
  return {
    left: ((x + 10) / 20) * 100 + '%',
    top: ((10 - y) / 20) * 100 + '%',
  };
}

/* cellFor(x, y) — count binning; sealed EXACTLY matching statusFor:
 * col = x<-5?0 : x<0?1 : x<5?2 : 3
 * row = y>5?0 : y>2.5?1 : y>0?2 : y>-2.5?3 : y>-5?4 : 5                      */
export function cellFor(x, y) {
  const col = x < -5 ? 0 : x < 0 ? 1 : x < 5 ? 2 : 3;
  const row = y > 5 ? 0 : y > 2.5 ? 1 : y > 0 ? 2 : y > -2.5 ? 3 : y > -5 ? 4 : 5;
  return { row, col };
}

/* countCells(rows) — counts keyed "row,col"; maxCount floored at 1 (sealed:
 * an empty map never divides by zero).                                       */
export function countCells(rows) {
  const counts = {};
  for (const r of rows || []) {
    const { row, col } = cellFor(r._x, r._y);
    const k = row + ',' + col;
    counts[k] = (counts[k] || 0) + 1;
  }
  const maxCount = Math.max(1, ...Object.values(counts));
  return { counts, maxCount };
}

/* densityPct(t) — sealed density mix percentage: 20 + t*80 (t = cnt/maxCount;
 * empty cell mixes 20% zone color into the density base, hottest cell 100%). */
export function densityPct(t) { return 20 + t * 80; }

/* densityFill(bgToken, t) — the sealed per-cell density background. */
export function densityFill(bgToken, t) {
  return `color-mix(in oklch, var(${bgToken}) ${densityPct(t)}%, var(--ui-sys-zone-density-base))`;
}

/* haloInset(dotSize) — sealed halo ring inline inset: -(dotSize * 0.8) px.   */
export function haloInset(dotSize) { return -(dotSize * 0.8); }

/* Sealed axis ticks. */
export const Y_TICKS = [10, 7.5, 5, 2.5, 0, -2.5, -5, -7.5, -10];
export const X_TICKS = Array.from({ length: 21 }, (_, i) => i - 10);

/* Sealed legend copy — DECLARED RESOLUTION of a box-internal conflict on the
 * CENTRE segment's spacing: the sealed box BODY ("AXIS TICKS & LEGEND" bullet)
 * writes it with DOUBLE spaces around the middot ("… influence  ·  ↓ …") while
 * the same box's own SKELETON TREE writes it with SINGLE spaces ("… influence
 * · ↓ …"). This ships the single-space form (the skeleton reading; matches the
 * left/right segments' single-space rhythm). Left/right segments are verbatim
 * and unconflicted. */
export const LEGEND_LEFT = '← Works against you';
export const LEGEND_CENTER = '↑ Greater community influence · ↓ Less community influence';
export const LEGEND_RIGHT = 'Works with you →';

/* Sealed display-option defaults (TWEAK_DEFAULTS — halo IS the default look;
 * dotSize 22 so initials show by default; slider range 14–36 step 2).        */
export const TWEAK_DEFAULTS = {
  mapStyle: 'halo',
  showLabels: false,
  showZoneLabels: true,
  dotSize: 22,
};

/* Sealed scorecard copy: the READ-ONLY corrected empty-state prompt (the
 * oracle's ", or drag a dot to move it" clause is STALE and dropped).        */
export const EMPTY_PROMPT = 'Click any dot on the map to see details.';

/* History-toggle tooltip copy (sealed title attributes). */
export const HISTORY_TIP_ON = 'Exit history view';
export const HISTORY_TIP_OFF = "View this stakeholder's historic positions";

/* formatDateLong(raw) — mirror of the sealed Shared-UI-primitives formula
 * (app-side single source: src/app/modals/stakeholder-logic.js; parity-
 * tested). Bare YYYY-MM-DD parses at LOCAL midnight (the timezone guard).    */
export function formatDateLong(raw) {
  if (!raw) return '';
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(raw))
    ? new Date(raw + 'T00:00:00')
    : new Date(raw);
  if (isNaN(d.getTime())) return String(raw);
  return d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
}

/* latestNote(s) — sealed: newest of notesHistory sorted by .at descending,
 * falling back to the plain notes field { body: notes, at: lastContact,
 * by: null }; null when neither resolves.                                    */
export function latestNote(s) {
  if (!s) return null;
  const h = (s.notesHistory || []).slice()
    .sort((a, b) => String(b.at || '').localeCompare(String(a.at || '')));
  if (h.length) return h[0];
  if (s.notes) return { body: s.notes, at: s.lastContact, by: null };
  return null;
}

/* noteDateShort(at) — the sealed latest-note date stamp: toLocaleDateString
 * month short / day numeric / year numeric.                                  */
export function noteDateShort(at) {
  if (!at) return '';
  const d = new Date(at);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/* Sealed Tags primitive rule (Shared-UI-primitives): first 3 values as tag
 * chips, then a muted "+N" overflow.                                         */
export function tagsOverflow(values) {
  const v = values || [];
  return { shown: v.slice(0, 3), more: Math.max(0, v.length - 3) };
}

/* Gallery sample — ONLY rendered when the host element carries the `gallery`
 * attribute (preview.html / wireframes.html set it). In the app the map
 * renders EMPTY until .data arrives (MAKE-REAL rule: never a live-looking
 * fake dataset in real chrome).                                              */
const SAMPLE_DATA = [
  { id: 's-1', name: 'Mayor Maria Chen', org: 'City of Cedarville', type: 'Mayor', category: 'Government', priority: 'High', status: 'Active', _x: 2.9, _y: 8.1, lastContact: '2026-05-12', notes: 'Generally supportive; cares about local jobs.', history: [{ quarter: 'FY26 Q1', x: 1, y: 6 }, { quarter: 'FY26 Q2', x: 2, y: 7 }] },
  { id: 's-2', name: 'Cedarville Chamber', org: 'Chamber of Commerce', type: 'Trade Association', category: 'Industry', priority: 'High', status: 'Active', _x: 1.5, _y: 4.2 },
  { id: 's-3', name: 'Riverside Tribune', org: 'Riverside Media', type: 'Media', category: 'Communities', priority: 'Medium', status: 'Watch', _x: -3.2, _y: 6.0 },
  { id: 's-4', name: 'Sam Okafor', org: 'Northside Neighbors', type: 'Community Alliance', category: 'Communities', priority: 'Low', status: 'Active', _x: 6.5, _y: 1.0 },
  { id: 's-5', name: 'Local Union 12', org: 'Local Union 12', type: 'Union', category: 'Our People', priority: 'High', status: 'Watch', _x: -7.0, _y: 7.5 },
  { id: 's-6', name: 'Youth Program', org: 'Cedarville YMCA', type: 'NGO', category: 'Communities', priority: 'Low', status: 'Dormant', _x: 4.0, _y: -6.0 },
  { id: 's-7', name: 'County Board', org: 'Cedar County', type: 'City Government', category: 'Government', priority: 'Medium', status: 'Active', _x: -2.0, _y: -3.0 },
  { id: 's-8', name: 'Tech Partner Co', org: 'Tech Partner Co', type: 'Large Business', category: 'Industry', priority: 'High', status: 'Active', _x: 8.0, _y: 6.5 },
];

/* ─────────────────────────────────────────────────────────────────────────
 * DOM COMPONENT (guarded so node can import the pure logic above)
 * ──────────────────────────────────────────────────────────────────────── */
if (typeof document !== 'undefined' && typeof HTMLElement !== 'undefined') {

  /* Wrap each arrow glyph in the sealed strong-arrow treatment (weight 400,
   * strong ink, 0.7px text-stroke, 12px — stroke-thickened, never bolded). */
  const arrowize = (s) => s.replace(/([←→↑↓])/g, '<strong class="arrow">$1</strong>');

  const template = document.createElement('template');
  template.innerHTML = `
  <style>
    /* HOST = the sealed map-wrap: plot stage beside the ui-inspector rail
       (the inspector animates its own width open/closed — the oracle's
       1fr 320px → 1fr 0 grid). */
    :host {
      position: relative;
      display: flex;
      flex-direction: row;
      align-items: stretch;
      width: 100%;
      height: 100%;
      min-height: 420px;
      box-sizing: border-box;
      font: var(--ui-sys-font-body);
      color: var(--ui-sys-on-surface);
      overflow: hidden;
    }
    *, *::before, *::after { box-sizing: border-box; }

    /* ── THE STAGE (sealed EXACT ORACLE VALUES: paper-2 runway, asymmetric
       28/14/14/18 padding — deep top clearance, wider left edge for the
       y-tick strip — flex column, min-0, overflow hidden) ─────────────── */
    .map-stage {
      flex: 1 1 0;
      min-width: 0;
      min-height: 0;
      display: flex;
      flex-direction: column;
      position: relative;
      padding: 28px 14px 14px 18px;
      background: var(--ui-sys-surface);
      overflow: hidden;
    }

    /* ── THE PLOT AREA (92% / max 920px / centered / flex 1 / relative /
       min-height 0 — grid, ticks and legend share this constraint so they
       stay column-aligned at every window size) ───────────────────────── */
    .map-grid-area {
      width: 92%;
      max-width: 920px;
      margin-inline: auto;
      flex: 1 1 0;
      position: relative;
      min-height: 0;
    }

    /* ── Y-AXIS TICKS: an 18px strip 22px left of the grid; zero-height
       space-between flex items center every tick at 0%,12.5%,…,100% ────── */
    .map-yaxis-ticks {
      position: absolute;
      left: -22px;
      top: 0;
      bottom: 0;
      width: 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-end;
      pointer-events: none;
    }
    .map-ytick {
      height: 0;
      display: flex;
      align-items: center;
    }
    /* Sealed tick text (both axes): 9px, lh 1, muted ink, nowrap, tabular
       numerals in Inter (the flagged forward-design mono substitution). */
    .map-ytick, .map-xtick {
      font-size: 9px;
      line-height: 1;
      color: var(--ui-sys-on-surface-muted);
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      user-select: none;
    }

    /* ── THE ZONE GRID: 4 cols × 6 rows; the sealed non-uniform bands as fr
       ratios (rows 2/1/1/1/1/2 = the 5/2.5/2.5/2.5/2.5/5 y-heights); 1px
       strong-outline OUTER border; per-cell right+bottom hairlines with the
       last-col/last-row removals so hairlines never double the border ──── */
    .map-grid {
      position: absolute;
      inset: 0;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      grid-template-rows: 2fr 1fr 1fr 1fr 1fr 2fr;
      gap: 0;
      border: 1px solid var(--ui-sys-outline-strong);
      z-index: 0;
    }
    .zone {
      position: relative;
      border-radius: 0;
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      font-size: 11px;
      font-weight: 500;
      overflow: hidden;
      border-right: 1px solid var(--ui-sys-zone-grid-line);
      border-bottom: 1px solid var(--ui-sys-zone-grid-line);
    }
    .zone:nth-child(4n) { border-right: none; }
    .zone:nth-last-child(-n+4) { border-bottom: none; }
    /* Sealed zone-label styling. */
    .zone-label {
      text-align: left;
      line-height: 1.15;
      letter-spacing: 0.01em;
      opacity: 0.78;
      max-width: 100%;
      word-break: break-word;
      user-select: none;
    }
    /* Sealed count badge: BOTTOM-RIGHT (8px/10px), 10px numerals on the
       translucent light pill; Inter tabular numerals (mono is forbidden). */
    .zone-count {
      position: absolute;
      bottom: 8px;
      right: 10px;
      font-size: 10px;
      line-height: 14px;
      font-variant-numeric: tabular-nums;
      color: var(--ui-sys-zone-count-ink);
      background: var(--ui-sys-zone-count-surface);
      border-radius: 6px;
      padding: 0 5px;
      user-select: none;
    }

    /* ── THE CENTRE CROSS: two 1px hairlines at x=0 / y=0, above the zones,
       below the dots, pointer-events none ──────────────────────────────── */
    .axis-lines {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
    }
    .axis-lines::before {
      content: "";
      position: absolute;
      left: 50%;
      top: 0;
      bottom: 0;
      width: 1px;
      background: var(--ui-sys-zone-grid-line);
    }
    .axis-lines::after {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: var(--ui-sys-zone-grid-line);
    }

    /* ── THE DOTS LAYER: the 0–100% coordinate space every dot shares ───── */
    .dots-layer {
      position: absolute;
      inset: 0;
      z-index: 2;
    }

    /* ── THE DOT (read-only; positioned by coordToPct, centred on the point) */
    .dot {
      position: absolute;
      transform: translate(-50%, -50%);
      cursor: pointer;
      outline: none;
    }
    .dot:hover, .dot.selected { z-index: 6; }
    .dot-inner {
      width: 100%;
      height: 100%;
      border-radius: var(--ui-sys-shape-pill);
      border: 2px solid;
      display: flex;
      align-items: center;
      justify-content: center;
      /* Sealed initials type: 9.5px weight 600 — Inter + tabular numerals
         (the flagged mono substitution). */
      font-size: 9.5px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      user-select: none;
      box-shadow: var(--ui-sys-map-dot-shadow);
      transition: transform var(--ui-sys-motion-control);
    }
    .dot:hover .dot-inner,
    .dot.selected .dot-inner { transform: scale(1.18); }
    .dot:focus-visible .dot-inner {
      outline: 2px solid var(--ui-sys-focus-ring);
      outline-offset: 2px;
    }
    /* Selected: accent border + the 3px soft accent ring over the resting
       shadow (--ui-sys-accent-tint-strong IS the census "selected map-dot
       ring" step; shadows subject to the open shadow ruling). */
    .dot.selected .dot-inner {
      box-shadow: 0 0 0 3px var(--ui-sys-accent-tint-strong), var(--ui-sys-map-dot-shadow);
    }

    /* ── HALO (the shipped DEFAULT map style): sealed inline inset
       -(dotSize*0.8)px, zone color via currentColor on the .dot, opacity
       .35, never intercepts clicks.
       ⚠ SEALED DESIGN-LAW CONFLICT (recorded, not silent): the oracle used
       the ONE radial-gradient in the app; "no gradients ever" bans it. This
       ships the sealed alternative — a tokened translucent SOLID disc in the
       zone color at the sealed 0.35 opacity and the sealed geometry — until
       the explicit gradient ruling is recorded with the user at the
       Design-page step (Map box, HALO bullet). */
    .dot-halo {
      position: absolute;
      border-radius: var(--ui-sys-shape-pill);
      background: currentColor;
      opacity: 0.35;
      pointer-events: none;
    }

    /* ── DOT LABEL: below the dot, translucent paper pill (sealed values). */
    .dot-label {
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: 4px;
      font-size: 10.5px;
      font-weight: 400;
      color: var(--ui-sys-on-surface);
      background: var(--ui-sys-map-label-surface);
      border: 1px solid var(--ui-sys-outline-subtle);
      padding: 1px 5px;
      border-radius: var(--ui-sys-shape-control);
      white-space: nowrap;
      max-width: 160px;
      overflow: hidden;
      text-overflow: ellipsis;
      pointer-events: none;
    }

    /* ── HISTORY: dashed paper dots + quarter labels (dashed/no-shadow is
       this component's OWN tokened style — the oracle's !important patch is
       DO-NOT-REPLICATE) and the dashed trail SVG ─────────────────────────── */
    /* INK MAPPING DECLARED: the sealed history dot uses TWO inks (ink-3 text
       + ink-mute dashed border); this folds both to the single
       --ui-sys-on-surface-muted step. */
    .history-dot .dot-inner {
      background: var(--ui-sys-surface-card);
      color: var(--ui-sys-on-surface-muted);
      border-color: var(--ui-sys-on-surface-muted);
      border-style: dashed;
      box-shadow: none;
    }
    .history-dot .dot-label { background: var(--ui-sys-surface-card); }
    .trail-svg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    /* ── X-AXIS TICKS: 21 zero-width space-between items sharing the plot's
       92%/920px centered width; margin-top 6px ───────────────────────────── */
    .map-xaxis-ticks {
      width: 92%;
      max-width: 920px;
      margin-inline: auto;
      margin-top: 6px;
      display: flex;
      justify-content: space-between;
      pointer-events: none;
      flex-shrink: 0;
    }
    .map-xtick {
      width: 0;
      display: flex;
      justify-content: center;
    }

    /* ── AXIS LEGEND: the sealed BORDERED CARD (1fr auto 1fr grid, 8px 16px
       padding, outline border, radius 10, paper-2 surface, 11px caps 0.08em
       muted ink) with the strong-arrow treatment ──────────────────────────── */
    .map-axis-legend {
      width: 92%;
      max-width: 920px;
      margin: 14px auto 0;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      column-gap: var(--ui-sys-space-4); /* segments never collide at narrow widths */
      align-items: center;
      padding: 8px 16px;
      border: 1px solid var(--ui-sys-outline);
      border-radius: 10px;
      background: var(--ui-sys-surface);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ui-sys-on-surface-muted);
      user-select: none;
      flex-shrink: 0;
    }
    .leg-start { justify-self: start; }
    .leg-mid   { justify-self: center; text-align: center; }
    .leg-end   { justify-self: end; }
    .arrow {
      font-weight: 400;
      color: var(--ui-sys-on-surface);
      -webkit-text-stroke: 0.7px var(--ui-sys-on-surface);
      font-size: 12px;
    }

    /* ── THE SCORECARD RAIL: the REAL ui-inspector. Sealed SCORECARD CHROME:
       the rail is a CONTAINER surface (oracle var(--bg-2); sidebars never
       white) — set on the host element (outer-tree host styling, not a
       shadow-internal override).
       INTERIOR-METRIC MAPPING DECLARED: the sealed rail interior is 14px 16px
       padding with a head row at margin -4px 0 8px / padding-bottom 6px /
       1px bottom rule; ui-inspector ships its own defaults instead
       (--ui-sys-space-4 = 16px content padding, 52px bordered header). The
       sealed values become --ui-sys-* tokens on the inspector composition at
       the Design (Settings→Design) pass — not a component override here. */
    ui-inspector.detail { background: var(--ui-sys-surface-container); }
    /* Sealed head-row treatment: 10-11px caps 0.08em muted ink. */
    .det-head-label {
      font: var(--ui-sys-font-caption);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ui-sys-on-surface-muted);
    }

    /* Scorecard interior (slotted into ui-inspector, styled here — the
       sealed rail-interior start-state, token-only). */
    .det-body { font-size: 12px; }
    .det-title {
      font-family: var(--ui-ref-typeface-title);
      font-size: 16px;
      font-weight: 500;
      letter-spacing: -0.005em;
      margin: 0 0 4px;
      color: var(--ui-sys-on-surface);
    }
    .det-org {
      font-size: 12px;
      color: var(--ui-sys-on-surface-muted);
      margin-bottom: 10px;
    }
    .det-website {
      color: var(--ui-sys-accent);
      font-size: 12px;
      text-decoration: none;
    }
    .det-website:hover { text-decoration: underline; }
    .det-website-wrap { margin-bottom: 6px; }
    .history-toggle-wrap { margin: 6px 0 8px; }
    .status-pill-row {
      display: flex;
      align-items: center;
      gap: var(--ui-sys-space-2);
      margin: 8px 0;
      flex-wrap: wrap;
    }
    .det-coords {
      font-size: 12px;
      color: var(--ui-sys-on-surface-muted);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .strategy-card {
      border-radius: 8px;
      padding: 10px 12px;
      margin: 10px 0;
    }
    .strategy-eyebrow {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      opacity: 0.75;
      margin-bottom: 4px;
    }
    .strategy-title { font-weight: 600; margin-bottom: 4px; }
    .strategy-action { font-size: 12px; line-height: 1.5; }

    /* Sealed metadata rows: 86px/1fr k/v grid, 4px gap, 6px block padding,
       12px type; consecutive rows separated by a subtle top rule (the first
       row ruleless). */
    .detail-row {
      display: grid;
      grid-template-columns: 86px 1fr;
      gap: 4px;
      padding: 6px 0;
      font-size: 12px;
    }
    .detail-row + .detail-row { border-top: 1px solid var(--ui-sys-outline-subtle); }
    .detail-row .k {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ui-sys-on-surface-muted);
      padding-top: 1px;
    }
    .detail-row .v {
      color: var(--ui-sys-on-surface);
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .v-chips {
      display: inline-flex;
      flex-wrap: wrap;
      gap: var(--ui-sys-space-1);
      align-items: center;
    }
    .muted { color: var(--ui-sys-on-surface-muted); }
    .owner-stack { display: inline-flex; align-items: center; }
    .owner-stack ui-avatar:not(:first-child) { margin-left: calc(-1 * var(--ui-sys-space-1)); }

    /* Sealed LATEST-NOTE card. */
    .detail-latest-note {
      margin-top: 14px;
      padding: 10px 12px;
      background: var(--ui-sys-surface-container);
      border: 1px solid var(--ui-sys-outline-subtle);
      border-radius: 8px;
    }
    .detail-latest-note-head {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }
    .detail-latest-note-cap {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ui-sys-on-surface-muted);
    }
    .detail-latest-note-date {
      font-size: 11px;
      color: var(--ui-sys-on-surface-muted);
    }
    .detail-latest-note-body {
      font-size: 12.5px;
      line-height: 1.5;
      color: var(--ui-sys-on-surface);
      white-space: pre-wrap;
      word-break: break-word;
    }

    /* Empty state (sealed): prompt block + "Recently scored" ghost rows. */
    .empty-block {
      padding: 30px 12px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: var(--ui-sys-space-2);
    }
    .empty-title {
      font-family: var(--ui-ref-typeface-title);
      font-size: 16px;
      font-weight: 500;
      color: var(--ui-sys-on-surface);
    }
    .empty-prompt { font-size: 12px; }
    .recent-caption {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--ui-sys-on-surface-muted);
      margin-top: var(--ui-sys-space-3);
      text-align: left;
    }
    .recent-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: stretch;
    }
    .recent-list ui-button { width: 100%; }
    /* Slotted row text (our light-DOM content inside the real ui-button):
       one flexing block so the row reads left-aligned and ellipsizes
       (sealed: left-aligned ghost rows) without touching button internals. */
    .recent-row-text {
      flex: 1;
      min-width: 0;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 400;
    }

    /* Reopen tab (sealed: top 16 / right 0, chevron-left, title "Reopen
       scorecard") — the REAL ui-icon-button; its geometry is the
       component's own (law 1: never a hand-rolled lookalike). */
    .map-detail-reopen {
      position: absolute;
      top: 16px;
      right: 0;
      z-index: 5;
    }
    .map-detail-reopen[hidden] { display: none; }
  </style>

  <div class="map-stage">
    <div class="map-grid-area">
      <div class="map-yaxis-ticks" aria-hidden="true"></div>
      <div class="map-grid" role="img"
           aria-label="Stakeholder relationship map: a 4-column by 6-row zone grid with one dot per stakeholder positioned by weighted alignment (x) and influence (y). Read-only."></div>
      <div class="axis-lines" aria-hidden="true"></div>
      <div class="dots-layer" role="group" aria-label="Stakeholder dots"></div>
    </div>
    <div class="map-xaxis-ticks" aria-hidden="true"></div>
    <!-- Legend copy: centre-segment spacing is a DECLARED RESOLUTION (box
         body double-space vs the box's own skeleton single-space; single
         ships) — see the LEGEND_* constants above. -->
    <div class="map-axis-legend" aria-hidden="true">
      <span class="leg-start"></span>
      <span class="leg-mid"></span>
      <span class="leg-end"></span>
    </div>
  </div>

  <!-- Built-in close × carries the sealed oracle intent via close-label. -->
  <ui-inspector class="detail" open close-label="Hide scorecard panel">
    <span slot="title" class="det-head-label">Scorecard</span>
    <div class="det-body"></div>
  </ui-inspector>

  <ui-icon-button class="map-detail-reopen" variant="outlined" hidden
                  title="Reopen scorecard" aria-label="Open scorecard">
    <ui-icon>chevron_left</ui-icon>
  </ui-icon-button>
  `;

  const h = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text != null) el.textContent = text;
    return el;
  };

  class UiStakeholderMap extends HTMLElement {
    static observedAttributes = ['map-style', 'show-labels', 'show-zone-labels', 'dot-size'];

    #data = null;
    #users = [];
    #rows = [];
    #selectedId = null;
    #detailOpen = true;   // sealed: the scorecard DEFAULTS OPEN
    #historyMode = false; // sealed: defaults false
    #els = {};

    constructor() {
      super();
      this.attachShadow({ mode: 'open' }).appendChild(template.content.cloneNode(true));
      const $ = (s) => this.shadowRoot.querySelector(s);
      this.#els = {
        yTicks: $('.map-yaxis-ticks'),
        xTicks: $('.map-xaxis-ticks'),
        grid: $('.map-grid'),
        dots: $('.dots-layer'),
        legend: $('.map-axis-legend'),
        inspector: $('ui-inspector.detail'),
        detBody: $('.det-body'),
        reopen: $('.map-detail-reopen'),
      };
    }

    /* ---- public API ---- */
    get data() { return this.#data; }
    set data(val) {
      this.#data = val;
      this.#normalize();
      if (this.#selectedId && !this.#rows.some((r) => r.id === this.#selectedId)) {
        this.#selectedId = null;
        this.#historyMode = false;
      }
      if (this.isConnected) this.#render();
    }

    get users() { return this.#users; }
    set users(val) {
      this.#users = val || [];
      if (this.isConnected) this.#renderDetail();
    }

    get selectedId() { return this.#selectedId; }
    /* Controlled selection (sealed: "selection lifts to the page" — the page
     * owns it and passes it back; selection-change is the emit half).
     * Setting the SAME id is a no-op (breaks the page-echo loop); setting a
     * new id mirrors wrapSelect's state (exits history) without re-emitting. */
    set selectedId(val) {
      const id = val || null;
      if (id === this.#selectedId) return;
      this.#selectedId = id;
      this.#historyMode = false;
      if (this.isConnected) this.#render();
    }

    /* Display options (attributes with the sealed TWEAK_DEFAULTS). */
    get mapStyle() {
      const v = this.getAttribute('map-style');
      return v === 'classic' || v === 'density' || v === 'halo' ? v : TWEAK_DEFAULTS.mapStyle;
    }
    get showLabels() {
      const v = this.getAttribute('show-labels');
      return v == null ? TWEAK_DEFAULTS.showLabels : v !== 'false';
    }
    get showZoneLabels() {
      const v = this.getAttribute('show-zone-labels');
      return v == null ? TWEAK_DEFAULTS.showZoneLabels : v !== 'false';
    }
    get dotSize() {
      const v = parseInt(this.getAttribute('dot-size'), 10);
      return Number.isFinite(v) ? v : TWEAK_DEFAULTS.dotSize;
    }

    connectedCallback() {
      this.#renderTicks();
      this.#renderLegend();
      this.#normalize();
      this.#render();
      // Scorecard rail close (the inspector's built-in ×) + reopen tab.
      this.#els.inspector.addEventListener('close', this.#onRailClose);
      this.#els.reopen.addEventListener('click', this.#onReopen);
    }

    disconnectedCallback() {
      this.#els.inspector.removeEventListener('close', this.#onRailClose);
      this.#els.reopen.removeEventListener('click', this.#onReopen);
    }

    attributeChangedCallback() {
      if (this.isConnected) this.#render();
    }

    /* ---- state transitions ---- */

    /* wrapSelect (sealed): select + force scorecard open + EXIT history. */
    #wrapSelect(id) {
      this.#selectedId = id;
      this.#historyMode = false;
      this.#setDetailOpen(true);
      this.#render();
      this.dispatchEvent(new CustomEvent('selection-change', {
        bubbles: true, composed: true, detail: { id },
      }));
    }

    #setDetailOpen(open) {
      this.#detailOpen = open;
      this.#els.inspector.toggleAttribute('open', open);
      this.#els.reopen.toggleAttribute('hidden', open);
    }

    #onRailClose = () => {
      this.#detailOpen = false;
      this.#els.reopen.toggleAttribute('hidden', false);
    };

    #onReopen = () => { this.#setDetailOpen(true); };

    /* ---- rendering ---- */

    #normalize() {
      // No .data yet: EMPTY in the app; the sample only under the explicit
      // gallery attribute (preview/wireframes) — no live-looking fake.
      const raw = this.#data ?? (this.hasAttribute('gallery') ? SAMPLE_DATA : []);
      this.#rows = (raw || []).map((d) => {
        const x = d._x != null ? d._x : (d.x || 0);
        const y = d._y != null ? d._y : (d.y || 0);
        return { ...d, _x: x, _y: y, _status: d._status || statusFor(x, y) };
      });
    }

    #selected() {
      return this.#rows.find((r) => r.id === this.#selectedId) || null;
    }

    #render() {
      this.#renderGrid();
      this.#renderDots();
      this.#renderDetail();
      this.#els.inspector.toggleAttribute('open', this.#detailOpen);
      this.#els.reopen.toggleAttribute('hidden', this.#detailOpen);
    }

    #renderTicks() {
      const y = this.#els.yTicks;
      y.textContent = '';
      for (const v of Y_TICKS) y.appendChild(h('span', 'map-ytick', String(v)));
      const x = this.#els.xTicks;
      x.textContent = '';
      for (const v of X_TICKS) {
        const t = h('span', 'map-xtick');
        t.appendChild(h('span', null, String(v)));
        x.appendChild(t);
      }
    }

    #renderLegend() {
      const [s, m, e] = this.#els.legend.children;
      s.innerHTML = arrowize(LEGEND_LEFT);
      m.innerHTML = arrowize(LEGEND_CENTER);
      e.innerHTML = arrowize(LEGEND_RIGHT);
    }

    #renderGrid() {
      const grid = this.#els.grid;
      grid.textContent = '';
      const { counts, maxCount } = countCells(this.#rows);
      const density = this.mapStyle === 'density';
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 4; c++) {
          const status = GRID[r][c];
          const tok = ZONE_TOKENS[status];
          const cnt = counts[r + ',' + c] || 0;
          const cell = h('div', 'zone');
          cell.style.background = density
            ? densityFill(tok.bg, cnt / maxCount)
            : `var(${tok.bg})`;
          cell.style.color = `var(${tok.ink})`;
          if (this.showZoneLabels) cell.appendChild(h('span', 'zone-label', status));
          if (cnt > 0) cell.appendChild(h('span', 'zone-count', String(cnt)));
          grid.appendChild(cell);
        }
      }
    }

    /* One dot, wrapped in a real ui-tooltip (sealed retarget: the hover tip
     * "{name} · {zone} · (x, y)").                                          */
    #makeDot(d, { history = false, snapshot = null } = {}) {
      const ds = history ? 14 : this.dotSize;
      const tok = ZONE_TOKENS[d._status] || {};
      const name = displayName(d) || d.name || '';
      const x = snapshot ? snapshot.x : d._x;
      const y = snapshot ? snapshot.y : d._y;
      const pct = coordToPct(x, y);
      const sel = !history && d.id === this.#selectedId;

      const wrap = document.createElement('ui-tooltip');
      const dot = h('div', 'dot' + (history ? ' history-dot' : '') + (sel ? ' selected' : ''));
      dot.style.left = pct.left;
      dot.style.top = pct.top;
      dot.style.width = ds + 'px';
      dot.style.height = ds + 'px';
      // The outer .dot carries the zone color so the halo's currentColor
      // resolves to it (sealed).
      dot.style.color = tok.bg ? `var(${tok.bg})` : 'inherit';

      if (!history && this.mapStyle === 'halo') {
        const halo = h('div', 'dot-halo');
        halo.style.inset = haloInset(ds) + 'px'; // sealed -(dotSize*0.8)px
        dot.appendChild(halo);
      }

      const inner = h('div', 'dot-inner');
      if (!history) {
        inner.style.background = `var(${tok.bg})`;
        inner.style.color = `var(${tok.ink})`;
        inner.style.borderColor = sel
          ? 'var(--ui-sys-accent)'
          : `var(${tok.border || tok.ink})`; // zone.border || zone.text (sealed)
        if (ds >= 22) inner.textContent = abbrev(d.name || name); // sealed threshold
      }
      dot.appendChild(inner);

      if (history) {
        dot.appendChild(h('div', 'dot-label', snapshot.quarter));
      } else if (this.showLabels || sel) {
        dot.appendChild(h('div', 'dot-label', name));
      }

      const tip = h('span', null, history
        ? `${snapshot.quarter}: (${snapshot.x}, ${snapshot.y})`
        : `${name} · ${d._status} · (${(+d._x).toFixed(1)}, ${(+d._y).toFixed(1)})`);
      tip.slot = 'content';

      if (!history) {
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
        dot.setAttribute('aria-label',
          `${name}, ${d._status}, coordinates (${(+d._x).toFixed(1)}, ${(+d._y).toFixed(1)})`);
        // READ-ONLY interactions (sealed): pointer-down/click selects
        // (wrapSelect); double-click opens the full profile. The oracle's
        // drag tail (setDragging + move/up writers) is REMOVED by ruling.
        dot.addEventListener('pointerdown', (e) => {
          e.preventDefault();
          this.#wrapSelect(d.id);
        });
        dot.addEventListener('dblclick', () => {
          this.dispatchEvent(new CustomEvent('open-profile', {
            bubbles: true, composed: true, detail: { id: d.id },
          }));
        });
        dot.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.#wrapSelect(d.id); }
        });
      }

      wrap.append(dot, tip);
      return wrap;
    }

    #renderDots() {
      const layer = this.#els.dots;
      layer.textContent = '';
      const sel = this.#selected();
      const inHistory = this.#historyMode && sel && (sel.history || []).length > 0;

      if (inHistory) {
        // Sealed HISTORY TRAIL SVG: viewBox 0 0 100 100, preserveAspectRatio
        // none; ONE path through [...history, current] using the SAME
        // transform; accent stroke .35, dash 1.2,1.2, non-scaling-stroke.
        const NS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(NS, 'svg');
        svg.setAttribute('class', 'trail-svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('preserveAspectRatio', 'none');
        const path = document.createElementNS(NS, 'path');
        const pts = [...sel.history, { x: sel._x, y: sel._y }];
        const dStr = pts.map((p, i) => {
          const cx = ((p.x + 10) / 20) * 100;
          const cy = ((10 - p.y) / 20) * 100;
          return (i === 0 ? 'M' : 'L') + cx + ',' + cy;
        }).join(' ');
        path.setAttribute('d', dStr);
        path.setAttribute('stroke', 'var(--ui-sys-accent)');
        path.setAttribute('stroke-width', '0.35');
        path.setAttribute('stroke-dasharray', '1.2,1.2');
        path.setAttribute('fill', 'none');
        path.setAttribute('vector-effect', 'non-scaling-stroke');
        svg.appendChild(path);
        layer.appendChild(svg);

        // One dashed 14px paper history dot per snapshot (label = quarter).
        for (const snap of sel.history) {
          layer.appendChild(this.#makeDot(sel, { history: true, snapshot: snap }));
        }
        // In history mode all OTHER dots hide: only the selected current dot.
        layer.appendChild(this.#makeDot(sel));
        return;
      }

      for (const d of this.#rows) layer.appendChild(this.#makeDot(d));
    }

    /* ---- scorecard (inside the real ui-inspector) ---- */

    #renderDetail() {
      const body = this.#els.detBody;
      body.textContent = '';
      const sel = this.#selected();
      if (!sel) this.#renderEmptyDetail(body);
      else this.#renderSelectedDetail(body, sel);
    }

    /* Sealed EMPTY STATE: the de-staled READ-ONLY prompt + "Recently scored"
     * = the first six stakeholders as real ui-button text rows. Per the
     * sealed skeleton tree, the caption + rows nest INSIDE the anonymous
     * prompt block (one padded, centered block holds title, prompt, caption
     * and the six rows) — never siblings of it.                             */
    #renderEmptyDetail(body) {
      const block = h('div', 'empty-block');
      block.appendChild(h('div', 'empty-title', 'Scorecard'));
      block.appendChild(h('div', 'empty-prompt muted', EMPTY_PROMPT));
      if (this.#rows.length) {
        block.appendChild(h('div', 'recent-caption', 'Recently scored'));
        const list = h('div', 'recent-list');
        for (const s of this.#rows.slice(0, 6)) {
          const btn = document.createElement('ui-button');
          btn.setAttribute('variant', 'text');
          const text = h('span', 'recent-row-text');
          text.append(
            h('span', null, displayName(s) || s.name || ''),
            h('span', 'muted', ' - ' + (s.type || '')),
          );
          btn.appendChild(text);
          btn.addEventListener('click', () => this.#wrapSelect(s.id));
          list.appendChild(btn);
        }
        block.appendChild(list);
      }
      body.appendChild(block);
    }

    #metaRow(rows, k, v) {
      const row = h('div', 'detail-row');
      row.appendChild(h('div', 'k', k));
      const vc = h('div', 'v');
      if (v == null || v === '' || (Array.isArray(v) && !v.length)) {
        vc.appendChild(h('span', 'muted', '-'));
      } else if (typeof v === 'string') {
        vc.textContent = v;
      } else {
        vc.appendChild(v);
      }
      row.appendChild(vc);
      rows.appendChild(row);
    }

    /* Sealed SELECTED STATE anatomy. */
    #renderSelectedDetail(body, s) {
      const tok = ZONE_TOKENS[s._status] || {};

      body.appendChild(h('h3', 'det-title', displayName(s) || s.name || ''));
      if (s.org) body.appendChild(h('div', 'det-org', s.org));

      if (s.url) {
        const wrap = h('div', 'det-website-wrap');
        const a = h('a', 'det-website', 'Visit Website');
        a.href = normalizeUrl(s.url);
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        wrap.appendChild(a);
        body.appendChild(wrap);
      }

      // "Show history" toggle — only when history is non-empty (sealed);
      // a real ui-chip filter carrying the sealed tooltip copy via
      // ui-tooltip. Toggling ON enters history; wrapSelect exits.
      if ((s.history || []).length) {
        const tipWrap = document.createElement('ui-tooltip');
        tipWrap.className = 'history-toggle-wrap';
        const chip = document.createElement('ui-chip');
        chip.className = 'history-toggle';
        chip.setAttribute('variant', 'filter');
        if (this.#historyMode) chip.setAttribute('selected', '');
        const icon = document.createElement('ui-icon');
        icon.slot = 'icon';
        icon.textContent = 'history'; // sealed icon map: clock → history
        chip.append(icon, document.createTextNode(
          this.#historyMode ? 'Exit history' : 'Show history'));
        chip.addEventListener('change', (e) => {
          this.#historyMode = !!(e.detail && e.detail.selected);
          this.#renderDots();
          this.#renderDetail();
        });
        const tip = h('span', null, this.#historyMode ? HISTORY_TIP_ON : HISTORY_TIP_OFF);
        tip.slot = 'content';
        tipWrap.append(chip, tip);
        body.appendChild(tipWrap);
      }

      // Large zone pill + live coords (1 decimal). Sealed: StatusPill
      // size "lg" (12px font / 3px 10px padding) — the ui-chip zone
      // variant's size="lg" (registered in manifest.json).
      const pillRow = h('div', 'status-pill-row');
      const zoneChip = document.createElement('ui-chip');
      zoneChip.setAttribute('variant', 'zone');
      zoneChip.setAttribute('size', 'lg');
      zoneChip.setAttribute('data-zone', s._status);
      zoneChip.textContent = s._status;
      pillRow.appendChild(zoneChip);
      pillRow.appendChild(h('span', 'det-coords',
        `(${(+s._x).toFixed(1)}, ${(+s._y).toFixed(1)})`));
      body.appendChild(pillRow);

      // STRATEGY card tinted by the zone (sealed: zone.strategy bold +
      // zone.action, verbatim engine copy).
      const strat = ZONE_STRATEGIES[s._status];
      if (strat) {
        const card = h('div', 'strategy-card');
        card.style.background = `var(${tok.bg})`;
        card.style.color = `var(${tok.ink})`;
        card.appendChild(h('div', 'strategy-eyebrow', 'Strategy'));
        card.appendChild(h('div', 'strategy-title', strat.strategy));
        card.appendChild(h('div', 'strategy-action', strat.action));
        body.appendChild(card);
      }

      // Metadata rows (sealed order): Category · Type · Market · Region ·
      // Geography · Issues · Priority · Owner · Last contact · Status · Tags.
      const rows = h('div', 'detail-rows');
      this.#metaRow(rows, 'Category', s.category);
      this.#metaRow(rows, 'Type', s.type);
      this.#metaRow(rows, 'Market', s.market);
      this.#metaRow(rows, 'Region', s.region);
      this.#metaRow(rows, 'Geography', s.geography);

      // Issues: tag chips (all values) or muted "-".
      let issuesNode = null;
      if ((s.issues || []).length) {
        issuesNode = h('span', 'v-chips');
        for (const v of s.issues) {
          const c = document.createElement('ui-chip');
          c.setAttribute('variant', 'tag');
          c.textContent = v;
          issuesNode.appendChild(c);
        }
      }
      this.#metaRow(rows, 'Issues', issuesNode);

      // Priority: the real priority pill.
      let prio = null;
      if (s.priority) {
        prio = document.createElement('ui-chip');
        prio.setAttribute('variant', 'priority');
        prio.setAttribute('value', s.priority);
        prio.textContent = s.priority;
      }
      this.#metaRow(rows, 'Priority', prio);

      // Owner: read-only ui-avatar stack (sealed OwnersDisplay resolution:
      // unresolvable owner ids silently drop). SIZE MAPPING DECLARED: the
      // sealed OwnersDisplay avatars are 22px; ui-avatar's token scale has
      // no 22px step, so this ships size="sm" (--ui-sys-avatar-size-sm =
      // 24px, the nearest step).
      let ownersNode = null;
      const owners = (s.owners || [])
        .map((id) => (this.#users || []).find((u) => u.id === id))
        .filter(Boolean);
      if (owners.length) {
        ownersNode = h('span', 'owner-stack');
        for (const u of owners) {
          const av = document.createElement('ui-avatar');
          av.setAttribute('name', u.name || '');
          av.setAttribute('size', 'sm');
          if (u.avatarUrl) av.setAttribute('src', u.avatarUrl);
          av.title = u.name || '';
          ownersNode.appendChild(av);
        }
      }
      this.#metaRow(rows, 'Owner', ownersNode);

      this.#metaRow(rows, 'Last contact',
        s.lastContact ? formatDateLong(s.lastContact) : null);

      // Status: the real ui-status-dot (null-guard renders nothing when empty).
      let statusNode = null;
      if (s.status) {
        statusNode = document.createElement('ui-status-dot');
        statusNode.setAttribute('value', s.status);
      }
      this.#metaRow(rows, 'Status', statusNode);

      // Tags: sealed Tags primitive — first 3 + muted "+N".
      let tagsNode = null;
      const { shown, more } = tagsOverflow(s.tags);
      if (shown.length) {
        tagsNode = h('span', 'v-chips');
        for (const v of shown) {
          const c = document.createElement('ui-chip');
          c.setAttribute('variant', 'tag');
          c.textContent = v;
          tagsNode.appendChild(c);
        }
        if (more > 0) tagsNode.appendChild(h('span', 'muted', '+' + more));
      }
      this.#metaRow(rows, 'Tags', tagsNode);
      body.appendChild(rows);

      // LATEST NOTE (sealed: newest notesHistory by .at, fallback notes;
      // renders nothing when no note resolves).
      const note = latestNote(s);
      if (note && note.body) {
        const card = h('div', 'detail-latest-note');
        const head = h('div', 'detail-latest-note-head');
        head.appendChild(h('span', 'detail-latest-note-cap', 'Latest note'));
        const stamp = noteDateShort(note.at);
        if (stamp) head.appendChild(h('span', 'detail-latest-note-date', stamp));
        card.appendChild(head);
        card.appendChild(h('div', 'detail-latest-note-body', note.body));
        body.appendChild(card);
      }
    }
  }

  if (!customElements.get('ui-stakeholder-map')) {
    customElements.define('ui-stakeholder-map', UiStakeholderMap);
  }
}
