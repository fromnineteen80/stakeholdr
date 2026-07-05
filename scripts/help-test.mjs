#!/usr/bin/env node
/* help-test.mjs — Phase-10 assertions for the Help page: the sealed verbatim
 * copy (framework steps incl. the sealed step-6 divergence, help-cards, axis
 * legend NBSPs, formula characters) + the zone key's SINGLE-SOURCING from the
 * engine (STATUS_ORDER/STATUSES/GRID) + the app.css data-zone token parity
 * (every zone paints with the engine's own cssVar/inkVar — never a fork).
 */
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { STATUS_ORDER, STATUSES, GRID } from '../src/app/data/engine.js';
import {
  PRELUDE_SEGMENTS, TITLE_FRAMEWORK, TITLE_MAP, H2_ZONES, H2_STRATEGY,
  H2_SCORES, FUNNEL_STAGES, FUNNEL_COLS, HELP_CARDS, INFLUENCER_TAG,
  ZONES_INTRO_SEGMENTS, AXIS_LEGEND, STRATEGY_INTRO, SCORES_INTRO,
  FORMULA_LINES, zoneKeyRows, gridCells,
} from '../src/app/pages/help-logic.js';

let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); n++; };

/* ── PRELUDE (sealed verbatim; em on ideas/credibility/value only) ──────── */
eq(PRELUDE_SEGMENTS.map((s) => s[1]).join(''),
  'Stakeholders exist in a public square where ideas are exchanged, your credibility is won or lost, and value is created, shared, or squandered.',
  'prelude verbatim');
eq(PRELUDE_SEGMENTS.filter((s) => s[0] === 'em').map((s) => s[1]),
  ['ideas', 'credibility', 'value'], 'prelude em words');
ok(PRELUDE_SEGMENTS.every((s) => s[1] === s[1].toLowerCase() || s[0] === 't'),
  'em words stay lowercase (emphasis is markup, never capitalization)');

/* ── HEADINGS ────────────────────────────────────────────────────────────── */
eq(TITLE_FRAMEWORK, 'How to plan for and engage stakeholders', 'block-1 title');
eq(TITLE_MAP, 'How to read the stakeholder map', 'block-2 title');
eq(H2_ZONES, 'The 24 zones at a glance', 'block-3 h2');
eq(H2_STRATEGY, 'Strategy reference', 'block-4 h2');
eq(H2_SCORES, 'How scores become coordinates', 'block-5 h2');

/* ── BLOCK 1: the funnel (sealed 12 steps, exact wording + order) ───────── */
eq(FUNNEL_STAGES, ['Purpose', 'Plan', 'Execute'], 'funnel stages');
eq(FUNNEL_COLS, [
  ['1. Set goals for your organization', '2. Issue identification',
    '3. Stakeholder identification', '4. Stakeholder prioritization'],
  ['5. Landscape analysis', '6. Cross-functional teams alignment',
    '7. Research & listening sessions', '8. Early stakeholder analysis & modeling'],
  ['9. Launch campaign', '10. Ongoing stakeholder analysis',
    '11. Collaborate with stakeholders', '12. Realize shared value where possible'],
], 'the 12 sealed steps, verbatim');
// The sealed help-page DIVERGENCE: "teams" is present here (PLAN_STEPS has
// "Cross-functional alignment") — the help wording is the truth for THIS page.
ok(FUNNEL_COLS[1][1].includes('teams'), 'sealed step-6 divergence preserved');

/* ── BLOCK 2: help-cards (titles, bullet counts 4/5/5, tags neg+pos) ────── */
eq(HELP_CARDS.map((c) => c.tone), ['neg', 'mid', 'pos'], 'card tones/order');
eq(HELP_CARDS.map((c) => c.title), [
  'Negative impact on organization', 'The winnable middle',
  'Positive impact on organization'], 'card titles verbatim');
eq(HELP_CARDS.map((c) => c.bullets.length), [4, 5, 5], 'bullet counts 4/5/5');
eq(HELP_CARDS[0].bullets, [
  'Defend license to operate', 'Challenge misinformation',
  'Plan for their influence in community', 'Identify their reputation with audiences',
], 'neg bullets verbatim');
eq(HELP_CARDS[1].bullets, [
  'Dispel myths and misperceptions', 'Appeal to their priorities',
  'Identify shared value to move them our way', 'Invest in relationship where possible',
  'Identify our reputation with them',
], 'mid bullets verbatim');
eq(HELP_CARDS[2].bullets, [
  'Maximize shared value', 'Maintain relationship', 'Champion their cause',
  'Recruit as public surrogates', 'Communicate often',
], 'pos bullets verbatim');
eq(INFLUENCER_TAG, '"Influencer"', 'tag carries the sealed surrounding quote marks');
eq(HELP_CARDS.map((c) => c.tag), [INFLUENCER_TAG, null, INFLUENCER_TAG],
  'tag on the neg and pos cards ONLY');

/* ── BLOCK 3: intro emphasis + axis legend character fidelity ───────────── */
eq(ZONES_INTRO_SEGMENTS.map((s) => s[1]).join(''),
  'Stakeholders are plotted on a two-axis grid: x measures impact on the business (do they work with you or against you?), y measures their influence in the community. The combination determines the relationship strategy.',
  'zones intro verbatim');
eq(ZONES_INTRO_SEGMENTS.filter((s) => s[0] === 'strong').map((s) => s[1]),
  ['x', 'y'], 'strong-wrapped lowercase x and y');
eq(AXIS_LEGEND.left, '← Works against you', 'axis left');
eq(AXIS_LEGEND.right, 'Works with you →', 'axis right');
eq(AXIS_LEGEND.center,
  '↑ Greater community influence  ·  ↓ Less community influence',
  'axis center — TWO NBSPs each side of the middot (sealed &nbsp; entities)');
ok(!AXIS_LEGEND.center.includes(' ·') && !AXIS_LEGEND.center.includes('· '),
  'no plain spaces beside the middot');

/* ── BLOCK 4 + 5: intros + the formula block ────────────────────────────── */
eq(STRATEGY_INTRO,
  "For every zone, a stakeholder's position on the map returns recommended posture and identifies suggested immediate actions your team can take.",
  'strategy intro verbatim');
eq(SCORES_INTRO,
  'On the Scoring tab, every teammate rates each stakeholder on x and y from −10 to 10. Each teammate also has a weight. The final coordinate is the weighted average of their scores. A teammate with weight 1.5 counts 1.5 times more than one with weight 1.0.',
  'scores intro verbatim (literal − minus signs)');
eq(FORMULA_LINES, [
  'final.x = Σ (member.x × member.weight) / Σ member.weight',
  'final.y = Σ (member.y × member.weight) / Σ member.weight',
  'zone    = lookup(final.x, final.y)',
], 'the three formula lines, character-for-character (Σ/× glyphs)');
ok(new Set(FORMULA_LINES.map((l) => l.indexOf('='))).size === 1,
  'all three equals signs align (zone padded with four spaces)');
ok(FORMULA_LINES[2].startsWith('zone    ='), 'four alignment spaces after "zone"');
ok(!FORMULA_LINES[2].includes('( ') && !FORMULA_LINES[2].includes(' )'),
  'lookup(...) has no spaces just inside the parentheses');

/* ── ZONE KEY: single-sourced from the engine ───────────────────────────── */
const rows = zoneKeyRows();
eq(rows.length, 14, '14 zone-key rows');
eq(rows.map((r) => r.name), STATUS_ORDER, 'rows in canonical STATUS_ORDER');
for (const r of rows) {
  eq(r.strategy, STATUSES[r.name].strategy, `strategy IS the engine's (${r.name})`);
  eq(r.action, STATUSES[r.name].action, `action IS the engine's (${r.name})`);
  eq(r.tone, STATUSES[r.name].tone, `tone IS the engine's (${r.name})`);
}
const cells = gridCells();
eq(cells.length, 24, '24 grid cells');
eq(cells, GRID.flat(), 'cells are GRID row-major, exactly');
ok(cells.every((c) => STATUSES[c]), 'every cell names a catalogued zone');

/* ── app.css TOKEN PARITY: every zone paints with the engine's own
 *    cssVar/inkVar; the strategy ink uses the band-ink-by-tone map ──────── */
const css = readFileSync(new URL('../src/app/app.css', import.meta.url), 'utf8');
for (const name of STATUS_ORDER) {
  const fill = new RegExp(
    `\\.help-zone\\[data-zone="${name}"\\], \\.help-strat-spine\\[data-zone="${name}"\\] \\{ background: var\\(${STATUSES[name].cssVar}\\); \\}`);
  ok(fill.test(css), `fill rule uses the engine cssVar (${name})`);
  const ink = new RegExp(
    `\\.help-zone\\[data-zone="${name}"\\] \\{ color: var\\(${STATUSES[name].inkVar}\\); \\}`);
  ok(ink.test(css), `on-fill ink rule uses the engine inkVar (${name})`);
}
const TONE_INK = {
  negative: '--ui-sys-zone-ink-negative',
  'neutral-low': '--ui-sys-zone-ink-neutral',
  positive: '--ui-sys-zone-ink-positive',
};
for (const [tone, token] of Object.entries(TONE_INK)) {
  ok(css.includes(`.help-strat-strategy[data-tone="${tone}"] { color: var(${token}); }`),
    `strategy band ink (${tone})`);
}
ok(css.includes('.help-funnel-stage-1 { fill: var(--ui-sys-band-middle); }')
  && css.includes('.help-funnel-stage-2 { fill: var(--ui-sys-funnel-2); }')
  && css.includes('.help-funnel-stage-3 { fill: var(--ui-sys-funnel-3); }'),
'funnel amber-ramp fills are the census tokens');
ok(!/\.help[^{]*\{[^}]*#[0-9a-fA-F]{3,8}/.test(css), 'no literal hex in the help CSS');

/* The census/gap tokens the page depends on exist in the contract. */
const tokens = readFileSync(new URL('../design-system/tokens.css', import.meta.url), 'utf8');
for (const t of ['--ui-sys-band-middle:', '--ui-sys-funnel-2:', '--ui-sys-funnel-3:',
  '--ui-sys-list-item-min-height:', '--ui-sys-neg-border-soft:',
  '--ui-sys-neu-border-soft:', '--ui-sys-pos-border-soft:',
  '--ui-sys-zone-grid-line:']) {
  ok(tokens.includes(t), `tokens.css defines ${t.slice(0, -1)}`);
}

console.log(`help-test: ${n} assertions passed`);
