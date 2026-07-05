/* help.jsx — the HELP page at Phase-10 depth: the static "How to read this"
 * reference. Assembled against the SKELETON TREE in the sealed box "Help —
 * the engagement framework + how to read the map + zone key/strategy
 * reference" in src/guide.jsx: prelude + (1) framework funnel + (2) how to
 * read the map (spectrum + three help-cards) + (3) the 24-zones grid +
 * (4) strategy reference + (5) how scores become coordinates. All content
 * lives in help-logic.js (node-tested by scripts/help-test.mjs).
 *
 * 100% STATIC (sealed UX census: 0 handlers — no state, no effects, no refs;
 * the only interactivity is browser scrolling and text selection). This is a
 * reading page: no inspector rail, a single centered reading column.
 *
 * SINGLE SOURCE (sealed): every zone color/strategy/action RENDERS from the
 * engine's STATUS_ORDER/STATUSES/GRID — this page defines none of them. The
 * spectrum swatches are the shared ui-chip zone variant (the same
 * --ui-sys-zone-* single source as Map/Lists/scorecard); the 24-zone grid and
 * strategy spines carry data-zone attributes mapped to the SAME tokens in
 * app.css (parity-asserted against engine STATUSES by scripts/help-test.mjs).
 *
 * SEALED BUILD-MAP honored:
 *  · The funnel figure is the sanctioned tokened inline SVG — three chevron
 *    stages filled by the census amber ramp (--ui-sys-band-middle /
 *    -funnel-2 / -funnel-3), labels inked via app.css classes (no inline
 *    style, no literal hex anywhere).
 *  · Funnel columns + help-cards = ui-card panels holding ui-list rows
 *    (wrap variant); the lead step is the token re-point emphasized row.
 *  · Help-card borders = the census valence tints (--ui-sys-neg/-neu/
 *    -pos-border-soft) via an outline-token re-point on the card host.
 *  · The 24-zone figure is drawn IDENTICALLY to ui-stakeholder-map's grid
 *    (same 1fr×4 / 2fr 1fr 1fr 1fr 1fr 2fr proportions, same
 *    --ui-sys-zone-grid-line hairlines with last-col/row removals, same
 *    strong outer border) so the two surfaces stay visually consistent.
 *  · The formula block renders in the body face at tabular settings (mono is
 *    forbidden — no mono token exists); the three sealed lines ship
 *    character-for-character (Σ/× glyphs, alignment spaces).
 *
 * DECLARED (sealed-silent details resolved; never silent):
 *  · Reading-column width 880px max — the sealed box fixes no measure;
 *    industry-standard long-form width on the runway.
 *  · The figure technique is the positioned-div grid (the exact composition
 *    ui-stakeholder-map itself uses for its zone grid) — the BUILD-MAP's
 *    "inline SVG" wording names the sanctioned-figure LANE, and identical
 *    rendering to the Map is the sealed requirement.
 *  · Strategy-reference strategy ink renders in the zone's BAND ink
 *    (negative/neutral/positive) — the two extreme zones' on-fill ink is
 *    WHITE (--ui-sys-zone-ink-on-strong), which is illegible as text on the
 *    white card; band ink preserves the zone-colored-text design legibly.
 *  · Funnel stage labels ink = --ui-sys-zone-ink-neutral (the amber-band
 *    ink, matching the sealed amber ramp; the box seals no label ink).
 *  · The 24-zone figure gets an explicit aspect ratio (8/5) — the sealed box
 *    fixes no height for the help-grid figure.
 */
import {
  PRELUDE_SEGMENTS, TITLE_FRAMEWORK, TITLE_MAP, H2_ZONES, H2_STRATEGY,
  H2_SCORES, FUNNEL_STAGES, FUNNEL_COLS, HELP_CARDS, ZONES_INTRO_SEGMENTS,
  AXIS_LEGEND, STRATEGY_INTRO, SCORES_INTRO, FORMULA_LINES, zoneKeyRows,
  gridCells,
} from './help-logic.js';

/* Sealed emphasis segments → text with <em>/<strong> islands. */
function Segments({ segments }) {
  return segments.map(([kind, text], i) =>
    kind === 'em' ? <em key={i}>{text}</em>
      : kind === 'strong' ? <strong key={i}>{text}</strong>
        : <span key={i}>{text}</span>);
}

/* The sanctioned tokened inline-SVG funnel: three chevron stages, fills +
 * label ink via app.css token classes. Decorative duplicate of the visible
 * column headings' order — labelled for assistive tech as one figure. */
function FunnelFigure() {
  const W = 720, H = 56, STEP = 240, NOTCH = 22;
  return (
    <svg
      className="help-funnel-svg"
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`Engagement funnel: ${FUNNEL_STAGES.join(', then ')}.`}
    >
      {FUNNEL_STAGES.map((label, i) => {
        const x0 = i * STEP;
        const tip = x0 + STEP;
        const flat = tip - NOTCH;
        const left = i === 0
          ? `M ${x0} 0 L ${flat} 0 L ${tip} ${H / 2} L ${flat} ${H} L ${x0} ${H} Z`
          : `M ${x0} 0 L ${flat} 0 L ${tip} ${H / 2} L ${flat} ${H} L ${x0} ${H} L ${x0 + NOTCH} ${H / 2} Z`;
        return (
          <g key={label}>
            <path className={`help-funnel-stage-${i + 1}`} d={left} />
            <text
              className="help-funnel-label"
              x={x0 + STEP / 2}
              y={H / 2}
              textAnchor="middle"
              dominantBaseline="central"
            >{label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function HelpPage() {
  const zones = zoneKeyRows();
  const cells = gridCells();

  return (
    <div className="help-wrap">
      <div className="help-inner">
        {/* PRELUDE — sealed verbatim, three <em> words. */}
        <div className="help-prelude">
          <p><Segments segments={PRELUDE_SEGMENTS} /></p>
        </div>

        {/* BLOCK 1 — THE FRAMEWORK FUNNEL. */}
        <div className="help-title">{TITLE_FRAMEWORK}</div>
        <div className="help-funnel">
          <FunnelFigure />
          <div className="help-funnel-cols">
            {FUNNEL_COLS.map((steps, c) => (
              <ui-card key={FUNNEL_STAGES[c]} variant="outlined" class="help-funnel-col">
                <ui-list>
                  {steps.map((step, i) => (
                    <ui-list-item
                      key={step}
                      wrap=""
                      class={i === 0 ? 'help-step help-step-lead' : 'help-step'}
                    >{step}</ui-list-item>
                  ))}
                </ui-list>
              </ui-card>
            ))}
          </div>
        </div>

        {/* BLOCK 2 — HOW TO READ THE STAKEHOLDER MAP. */}
        <div className="help-title">{TITLE_MAP}</div>
        {/* Spectrum strip: every zone in canonical order — the shared ui-chip
            zone variant (single-sourced --ui-sys-zone-* fills + band inks). */}
        <div className="help-spectrum">
          {zones.map((z) => (
            <ui-chip key={z.name} variant="zone" data-zone={z.name}>{z.name}</ui-chip>
          ))}
        </div>
        <div className="help-cols">
          {HELP_CARDS.map((card) => (
            <ui-card key={card.tone} variant="outlined" class={`help-card help-card-${card.tone}`}>
              {card.tag ? <div className="help-influencer-tag">{card.tag}</div> : null}
              <h3>{card.title}</h3>
              <ui-list>
                {card.bullets.map((b) => (
                  <ui-list-item key={b} wrap="" class="help-bullet">
                    <span slot="leading" className="help-bullet-dot" aria-hidden="true"></span>
                    {b}
                  </ui-list-item>
                ))}
              </ui-list>
            </ui-card>
          ))}
        </div>

        {/* BLOCK 3 — THE 24 ZONES AT A GLANCE. */}
        <div className="help-grid-section">
          <h2>{H2_ZONES}</h2>
          <p><Segments segments={ZONES_INTRO_SEGMENTS} /></p>
          <div
            className="help-grid-figure"
            role="img"
            aria-label="The 24-zone relationship grid: 4 columns by 6 rows, colored by zone."
          >
            {cells.map((name, i) => (
              <div key={i} className="help-zone" data-zone={name}>
                <div className="help-zone-label">{name}</div>
              </div>
            ))}
          </div>
          <div className="help-axis-legend">
            <span className="help-axis-left">{AXIS_LEGEND.left}</span>
            <span className="help-axis-center">{AXIS_LEGEND.center}</span>
            <span className="help-axis-right">{AXIS_LEGEND.right}</span>
          </div>
        </div>

        {/* BLOCK 4 — STRATEGY REFERENCE (rows derived from the engine). */}
        <div className="help-grid-section">
          <h2>{H2_STRATEGY}</h2>
          <p>{STRATEGY_INTRO}</p>
          <div className="help-strat-grid">
            {zones.map((z) => (
              <ui-card key={z.name} variant="outlined" class="help-strat-card">
                <div className="help-strat-inner">
                  <span className="help-strat-spine" data-zone={z.name} aria-hidden="true"></span>
                  <div className="help-strat-content">
                    <div className="help-strat-head">
                      <strong className="help-strat-name">{z.name}</strong>
                      <span className="help-strat-sep muted">·</span>
                      <em className="help-strat-strategy" data-tone={z.tone}>{z.strategy}</em>
                    </div>
                    <div className="help-strat-action muted">{z.action}</div>
                  </div>
                </div>
              </ui-card>
            ))}
          </div>
        </div>

        {/* BLOCK 5 — HOW SCORES BECOME COORDINATES. */}
        <div className="help-grid-section">
          <h2>{H2_SCORES}</h2>
          <p>{SCORES_INTRO}</p>
          <pre className="help-formula">{FORMULA_LINES.join('\n')}</pre>
        </div>
      </div>
    </div>
  );
}
