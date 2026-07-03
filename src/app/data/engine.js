/* engine.js — the Relationship engine, built EXACTLY from the sealed box
 * "Relationship engine — axes · zone grid · recommendations" in src/guide.jsx.
 *
 * AXES: x = alignment/support (−10..10) · y = influence/importance (−10..10).
 * statusFor(x, y) maps a blended position to one of the 14 relationship zones.
 * weightedCoord(id, scores, team) blends the team's per-rater scores into the
 * single position that drives the Map dot, the Lists _x/_y/_status, and every
 * profile.
 *
 * TOKEN LAW: zone colors are NEVER hex here. Each zone carries the NAME of its
 * --ui-sys-zone-* token (single-sourced in design-system/tokens.css); consumers
 * style via var(<cssVar>). Ink/border are per-band token names.
 */

// Axis bounds (sealed verbatim).
export const X_BOUNDS = [-10, -5, 0, 5, 10];
export const Y_BOUNDS = [10, 5, 2.5, 0, -2.5, -5, -10];

// Zone names (spelled once; GRID + STATUSES reference these).
const PROACTIVELY_DEFEND = 'Proactively Defend';
const DEFEND = 'Defend';
const PROTECT = 'Protect';
const RESPOND = 'Respond';
const IDENTIFY = 'Identify';
const MONITOR = 'Monitor';
const MAINTAIN = 'Maintain';
const CONNECT = 'Connect';
const COMMIT = 'Commit';
const COOPERATE = 'Cooperate';
const COLLABORATE = 'Collaborate';
const VALUABLE = 'Valuable Relationship';
const HIGH_VALUE = 'High Value Relationship';
const STRATEGIC = 'Strategic Partner';

/* THE 6×4 ZONE GRID — GRID[row][col], derived cell-by-cell from the sealed
 * per-zone cell sets:
 *   rows (y): 0: y>5 · 1: 2.5<y≤5 · 2: 0<y≤2.5 · 3: -2.5<y≤0 · 4: -5<y≤-2.5 · 5: y≤-5
 *   cols (x): 0: x<-5 · 1: -5≤x<0 · 2: 0≤x<5 · 3: x≥5                       */
export const GRID = [
  [PROACTIVELY_DEFEND, DEFEND,   VALUABLE,  STRATEGIC ],
  [DEFEND,             PROTECT,  COLLABORATE, HIGH_VALUE],
  [PROTECT,            RESPOND,  COOPERATE, COLLABORATE],
  [PROTECT,            RESPOND,  COOPERATE, COLLABORATE],
  [IDENTIFY,           IDENTIFY, COMMIT,    COMMIT    ],
  [MONITOR,            MONITOR,  MAINTAIN,  CONNECT   ],
];

const clamp10 = (n) => Math.max(-10, Math.min(10, n));

/* statusFor(x, y) — sealed lookup, inputs clamped to ±10.
 * y → row:  y>5→0 · 2.5<y≤5→1 · 0<y≤2.5→2 · -2.5<y≤0→3 · -5<y≤-2.5→4 · y≤-5→5
 * x → col:  x<-5→0 · -5≤x<0→1 · 0≤x<5→2 · x≥5→3   → returns GRID[row][col]  */
export function statusFor(x, y) {
  const cx = clamp10(x);
  const cy = clamp10(y);
  const row =
    cy > 5    ? 0 :
    cy > 2.5  ? 1 :
    cy > 0    ? 2 :
    cy > -2.5 ? 3 :
    cy > -5   ? 4 : 5;
  const col =
    cx < -5 ? 0 :
    cx < 0  ? 1 :
    cx < 5  ? 2 : 3;
  return GRID[row][col];
}

/* weightedCoord(stakeholderId, scores, team) — sealed math:
 * for each teammate who HAS scored this stakeholder (a record exists) and
 * whose weight > 0, accumulate sx += x·weight, sy += y·weight, totalW += weight;
 * result = { x: sx/totalW, y: sy/totalW }.
 * Skip rules (sealed): (a) unscored raters are ALWAYS excluded (no record — an
 * unscored cell is never a fake 0,0); (b) weight <= 0 is skipped (a deliberate
 * "don't weight this person" that keeps them on the team). If the surviving
 * total weight is 0 (nobody scored, or every scorer is at weight 0), the
 * position is { x: 0, y: 0 }.
 * scores shape: scores[stakeholderId][teamMemberId] = { x, y, ... };
 * team member shape: { id, userId, weight }.                                */
export function weightedCoord(stakeholderId, scores, team) {
  const perRater = (scores || {})[stakeholderId] || {};
  let sx = 0, sy = 0, totalW = 0;
  for (const m of team || []) {
    const sc = perRater[m.id];
    if (!sc) continue;                    // unscored → excluded, regardless of weight
    const w = m.weight;
    if (!(w > 0)) continue;               // weight <= 0 → deliberately excluded
    sx += sc.x * w;
    sy += sc.y * w;
    totalW += w;
  }
  if (totalW <= 0) return { x: 0, y: 0 };
  return { x: sx / totalW, y: sy / totalW };
}

/* coordToPct(x, y) — sealed conversion (Shared-UI-primitives box; the single
 * source — the Map consumes this, never redefines it). The dot layer's 0–100%
 * spans x: −10..10 and y: 10..−10:
 *   left = ((x+10)/20)*100 + "%"   ·   top = ((10−y)/20)*100 + "%"          */
export function coordToPct(x, y) {
  return {
    left: ((x + 10) / 20) * 100 + '%',
    top: ((10 - y) / 20) * 100 + '%',
  };
}

/* pctToCoord(leftPct, topPct) — the sealed inverse (same box, same single
 * source): x = (leftPct/100)*20 − 10; y = 10 − (topPct/100)*20.             */
export function pctToCoord(leftPct, topPct) {
  return {
    x: (leftPct / 100) * 20 - 10,
    y: 10 - (topPct / 100) * 20,
  };
}

/* STATUS_ORDER — the sealed spectrum, most-negative → positive (length 14). */
export const STATUS_ORDER = [
  PROACTIVELY_DEFEND,
  DEFEND,
  PROTECT,
  RESPOND,
  IDENTIFY,
  MONITOR,
  MAINTAIN,
  CONNECT,
  COMMIT,
  COOPERATE,
  COLLABORATE,
  VALUABLE,
  HIGH_VALUE,
  STRATEGIC,
];

/* Per-band ink/border TOKEN names (sealed: zone inks/borders are first-class
 * tokens; only zones 1 and 14 carry a border — all other zones have no border
 * field, and dot outlines fall back to the zone's text/ink token).           */
const INK_ON_STRONG = '--ui-sys-zone-ink-on-strong';   // white ink on the two darkest extremes
const INK_NEGATIVE = '--ui-sys-zone-ink-negative';
const INK_NEUTRAL = '--ui-sys-zone-ink-neutral';
const INK_POSITIVE = '--ui-sys-zone-ink-positive';
const BORDER_NEGATIVE = '--ui-sys-zone-border-negative';
const BORDER_POSITIVE = '--ui-sys-zone-border-positive';

/* STATUSES — the 14-zone metadata catalog. Per zone:
 *   tone     — exactly "negative" | "neutral-low" | "positive" (sealed values)
 *   cssVar   — the zone's fill token name (--ui-sys-zone-*; NEVER a hex here)
 *   inkVar   — the token name for text on the zone fill
 *   borderVar— present ONLY on zones 1 and 14 (sealed)
 *   strategy / action — user-facing UI copy (scorecard Strategy card, Help,
 *   Lists tooltips), transcribed CHARACTER-FOR-CHARACTER from the sealed box —
 *   never abridge, reword, or "tighten"; the app ships these exact strings.  */
export const STATUSES = {
  [PROACTIVELY_DEFEND]: {
    tone: 'negative',
    cssVar: '--ui-sys-zone-proactively-defend',
    inkVar: INK_ON_STRONG,
    borderVar: BORDER_NEGATIVE,
    strategy: 'Address Key Influencer',
    action: "Launch plan to neutralize a major threat to the industry or company's license to operate; leverage reputation, resources, subject-matter experts, and other allied stakeholders to win. Measure and report on activity often.",
  },
  [DEFEND]: {
    tone: 'negative',
    cssVar: '--ui-sys-zone-defend',
    inkVar: INK_NEGATIVE,
    strategy: 'Neutralize Threat',
    action: 'Defend license to operate. Defend reputation against regular attacks from stakeholders with high influence who are unlikely to move toward positive support; discredit message or position. Measure and report on activity often.',
  },
  [PROTECT]: {
    tone: 'negative',
    cssVar: '--ui-sys-zone-protect',
    inkVar: INK_NEGATIVE,
    strategy: 'Mobilize Defense',
    action: "Take action with internal resources and strategy. Defend reputation against regular attacks; manage expectations for changing stakeholder dynamic or group's influence in the community. Measure and report on activity regularly.",
  },
  [RESPOND]: {
    tone: 'negative',
    cssVar: '--ui-sys-zone-respond',
    inkVar: INK_NEGATIVE,
    strategy: 'Challenge Stakeholder',
    action: "Implement plan to challenge misinformation; reduce stakeholder's ability to destabilize the business or challenge brand identity and reputation.",
  },
  [IDENTIFY]: {
    tone: 'negative',
    cssVar: '--ui-sys-zone-identify',
    inkVar: INK_NEGATIVE,
    strategy: 'React To Issues Or Conflict',
    action: "Work to neutralize threat; educate stakeholder; resolve or minimize the stakeholder's ability or willingness to maintain conflict. Assign internal staff, team, or working group to execute response.",
  },
  [MONITOR]: {
    tone: 'neutral-low',
    cssVar: '--ui-sys-zone-monitor',
    inkVar: INK_NEUTRAL,
    strategy: 'Plan Ahead, Listen',
    action: 'Map stakeholder and plan to respond in the event of change; assign internal staff, team, or working group to execute plan if necessary.',
  },
  [MAINTAIN]: {
    tone: 'neutral-low',
    cssVar: '--ui-sys-zone-maintain',
    inkVar: INK_NEUTRAL,
    strategy: 'Take Steps To Introduce Our Vision And Values',
    action: "Take simple steps to engage; educate and create awareness about the business; look for ways to increase alignment and the stakeholder's influence over time.",
  },
  [CONNECT]: {
    tone: 'neutral-low',
    cssVar: '--ui-sys-zone-connect',
    inkVar: INK_NEUTRAL,
    strategy: 'Prioritize Resources Elsewhere',
    action: 'Take no action. Prioritize time and resources elsewhere but monitor for any negative changes in alignment or improved influence in the community over time.',
  },
  [COMMIT]: {
    tone: 'neutral-low',
    cssVar: '--ui-sys-zone-commit',
    inkVar: INK_NEUTRAL,
    strategy: 'Understand Needs, Work Towards Common Purpose',
    action: 'Build greater understanding between our company and stakeholder groups; look for opportunities to continue education and alignment that could lead to improved collaboration or affinity toward the business.',
  },
  [COOPERATE]: {
    tone: 'positive',
    cssVar: '--ui-sys-zone-cooperate',
    inkVar: INK_POSITIVE,
    strategy: 'Existing Alignment Produces Some Favorable Outcomes',
    action: 'Some value already exists and should continue with moderate level of commitment; maintain existing level of relationship.',
  },
  [COLLABORATE]: {
    tone: 'positive',
    cssVar: '--ui-sys-zone-collaborate',
    inkVar: INK_POSITIVE,
    strategy: 'Investing In Relationship Will Improve Our Business Or Reputation',
    action: "Commitment important to our business; establish opportunities to work together and reap mutual benefits; leverage stakeholder's influence to increase our reputation.",
  },
  [VALUABLE]: {
    tone: 'positive',
    cssVar: '--ui-sys-zone-valuable-relationship',
    inkVar: INK_POSITIVE,
    strategy: 'Stakeholder Important To Our Business Success',
    action: 'Stakeholder is an important surrogate, ally, or business partner. Investing in and growing this relationship proactively supports and defends the business and increases our reputation. Prioritize collaboration and deploying engagement strategies.',
  },
  [HIGH_VALUE]: {
    tone: 'positive',
    cssVar: '--ui-sys-zone-high-value-relationship',
    inkVar: INK_POSITIVE,
    strategy: 'Shared Value Introduced',
    action: 'Moderate shared value introduced; investing and growing this relationship produces value for our business and increases our reputation. Prioritize collaboration and engaging the stakeholder often to meet business and advocacy goals.',
  },
  [STRATEGIC]: {
    tone: 'positive',
    cssVar: '--ui-sys-zone-strategic-partner',
    inkVar: INK_ON_STRONG,
    borderVar: BORDER_POSITIVE,
    strategy: 'Shared Value Created',
    action: 'Shared value created. Formalize a working relationship or partnership with the stakeholder to produce and measure shared value; relationship grows the business, increases our reputation, and produces solutions.',
  },
};
