/* help-logic.js — the Help page's sealed content + the zone-key derivation,
 * built EXACTLY from the sealed box "Help — the engagement framework + how to
 * read the map + zone key/strategy reference" in src/guide.jsx (node-tested by
 * scripts/help-test.mjs).
 *
 * EVERY string here is sealed VERBATIM copy — never paraphrase, never
 * "tighten". The framework steps are the help-page's OWN sealed wording
 * (sealed divergence preserved: step 6 reads "Cross-functional teams
 * alignment" here, where PLAN_STEPS / the Plan box read "Cross-functional
 * alignment" — the oracle help.jsx hardcoded its own copy and the sealed box
 * rules the help-page wording is the truth for THIS page).
 *
 * SINGLE SOURCE: the zone key / strategy reference is DERIVED from the
 * engine's STATUS_ORDER + STATUSES (src/app/data/engine.js) — this module
 * renders the catalog, it never re-lists the 14 zones' colors, strategies,
 * or actions.
 */
import { STATUS_ORDER, STATUSES, GRID } from '../data/engine.js';

/* ── PRELUDE (sealed verbatim; ideas/credibility/value are <em>-wrapped,
 *    lowercase — the emphasis is the markup, never capitalization) ─────── */
export const PRELUDE_SEGMENTS = [
  ['t', 'Stakeholders exist in a public square where '],
  ['em', 'ideas'],
  ['t', ' are exchanged, your '],
  ['em', 'credibility'],
  ['t', ' is won or lost, and '],
  ['em', 'value'],
  ['t', ' is created, shared, or squandered.'],
];

/* ── SEALED HEADINGS ────────────────────────────────────────────────────── */
export const TITLE_FRAMEWORK = 'How to plan for and engage stakeholders';
export const TITLE_MAP = 'How to read the stakeholder map';
export const H2_ZONES = 'The 24 zones at a glance';
export const H2_STRATEGY = 'Strategy reference';
export const H2_SCORES = 'How scores become coordinates';

/* ── BLOCK 1 — the framework funnel (sealed verbatim, in order) ─────────── */
export const FUNNEL_STAGES = ['Purpose', 'Plan', 'Execute'];
export const FUNNEL_COLS = [
  [
    '1. Set goals for your organization',
    '2. Issue identification',
    '3. Stakeholder identification',
    '4. Stakeholder prioritization',
  ],
  [
    '5. Landscape analysis',
    '6. Cross-functional teams alignment',
    '7. Research & listening sessions',
    '8. Early stakeholder analysis & modeling',
  ],
  [
    '9. Launch campaign',
    '10. Ongoing stakeholder analysis',
    '11. Collaborate with stakeholders',
    '12. Realize shared value where possible',
  ],
];

/* ── BLOCK 2 — the three help-cards (sealed verbatim; tag = the literal
 *    text "Influencer" WITH the surrounding quote marks, neg + pos only) ── */
export const INFLUENCER_TAG = '"Influencer"';
export const HELP_CARDS = [
  {
    tone: 'neg',
    title: 'Negative impact on organization',
    bullets: [
      'Defend license to operate',
      'Challenge misinformation',
      'Plan for their influence in community',
      'Identify their reputation with audiences',
    ],
    tag: INFLUENCER_TAG,
  },
  {
    tone: 'mid',
    title: 'The winnable middle',
    bullets: [
      'Dispel myths and misperceptions',
      'Appeal to their priorities',
      'Identify shared value to move them our way',
      'Invest in relationship where possible',
      'Identify our reputation with them',
    ],
    tag: null,
  },
  {
    tone: 'pos',
    title: 'Positive impact on organization',
    bullets: [
      'Maximize shared value',
      'Maintain relationship',
      'Champion their cause',
      'Recruit as public surrogates',
      'Communicate often',
    ],
    tag: INFLUENCER_TAG,
  },
];

/* ── BLOCK 3 — the 24-zones intro (x / y are <strong>-wrapped, lowercase —
 *    the emphasis is the markup) + the sealed axis-legend strings.
 *    CHARACTER FIDELITY: the center legend carries TWO NON-BREAKING SPACES
 *    ( ) on each side of the middot, sealed as &nbsp; entities. ────── */
export const ZONES_INTRO_SEGMENTS = [
  ['t', 'Stakeholders are plotted on a two-axis grid: '],
  ['strong', 'x'],
  ['t', ' measures impact on the business (do they work with you or against you?), '],
  ['strong', 'y'],
  ['t', ' measures their influence in the community. The combination determines the relationship strategy.'],
];
export const AXIS_LEGEND = {
  left: '← Works against you',
  center: '↑ Greater community influence  ·  ↓ Less community influence',
  right: 'Works with you →',
};

/* ── BLOCK 4 — strategy reference intro (sealed verbatim) ───────────────── */
export const STRATEGY_INTRO =
  "For every zone, a stakeholder's position on the map returns recommended posture and identifies suggested immediate actions your team can take.";

/* ── BLOCK 5 — scores → coordinates (sealed verbatim; the minus signs are
 *    the literal − MINUS SIGN characters) + the three formula lines
 *    (Σ = U+03A3, × = U+00D7; numerator parenthesized, denominator NOT;
 *    "zone" padded with FOUR spaces so all three equals signs align) ────── */
export const SCORES_INTRO =
  'On the Scoring tab, every teammate rates each stakeholder on x and y from −10 to 10. Each teammate also has a weight. The final coordinate is the weighted average of their scores. A teammate with weight 1.5 counts 1.5 times more than one with weight 1.0.';
export const FORMULA_LINES = [
  'final.x = Σ (member.x × member.weight) / Σ member.weight',
  'final.y = Σ (member.y × member.weight) / Σ member.weight',
  'zone    = lookup(final.x, final.y)',
];

/* ── ZONE KEY DERIVATIONS (single-sourced from the engine; nothing here may
 *    restate a color, strategy, or action) ──────────────────────────────── */

/* Spectrum strip + strategy reference rows: STATUS_ORDER, each row carrying
 * the engine's own strategy/action strings and tone (for on-paper ink). */
export function zoneKeyRows() {
  return STATUS_ORDER.map((name) => ({
    name,
    tone: STATUSES[name].tone,
    strategy: STATUSES[name].strategy,
    action: STATUSES[name].action,
  }));
}

/* The 24-cell grid figure: GRID flattened row-major, exactly as the engine
 * lays it out (4 wide × 6 tall). */
export function gridCells() {
  return GRID.flat();
}
