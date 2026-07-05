/* workhq.jsx — the workHQ band (the sealed IntelPanel, standardized to
 * "workHQ" per the sealed naming note), assembled against the sealed SKELETON
 * TREE (guide ~2206–2223) under the USER RULINGS of 2026-07-05.
 *
 * SEALED, honored verbatim:
 *  · The band renders ABOVE the Lists ui-stakeholder-table inside the Lists
 *    page host with a divider between; the .intel-split data-mode parent is
 *    HOST-side (sheet.jsx) — this module renders the BAND only.
 *  · THREE MODES split/intel/table; cards render only when mode !== "table".
 *  · THE HEAD, in order: title "WorkHQ" · [table mode] the one-line summary ·
 *    spacer · quick-add ui-button (leading add icon + "Stakeholder", title
 *    "Add stakeholder") -> onAddStakeholder · the mode ui-icon-button group
 *    (role=group "Intelligence layout"): dashboard "Expand intelligence" /
 *    splitscreen "Split view" / table_rows "Expand table", active = selected.
 *  · Sealed slice caps (12/5 wide · 8/4 narrow), sealed empty copy, sealed
 *    devLabel/"Vote: {name}" entry text, sealed summary join.
 *  · Census G1 MAKE-REAL: every entry drills through — Alerts / Need-score /
 *    Cold -> that stakeholder's READ view (the A20/I4 read-not-edit ruling);
 *    Vote entries -> that community entry's read page. Entries are REAL
 *    controls (ui-list-item interactive: role=button + Enter/Space).
 *  · Census G2: quick-add -> the host's create route (the same modal the
 *    shell (+) nonce opens).
 *
 * USER RULINGS (2026-07-05) applied:
 *  A. FOUR CARDS ONLY — Alerts · Need your score · Awaiting your vote · Cold
 *     relationships (the sealed computed-but-unshown COLD signal promoted;
 *     mix + active-plans appear ONLY in the summary line, whose mix segment
 *     routes to Map and plans segment to Plans — real ui-chip controls).
 *  B. Cold is High-priority-gated, stalest first (workhq-logic).
 *  C. Ignore/snooze first-class: per-entry ×, per-card "Ignore all", an
 *     "Ignored (N)" review popover (ui-menu — capped 30, scrollable natively)
 *     whose rows un-ignore; ignores apply BEFORE counting.
 *  D. Counts + capped previews; "View all" drills into the REAL surface
 *     pre-filtered — Cold -> Lists via the table's DECLARED preset property
 *     (High-priority filter + lastContact stalest-first sort, the same state
 *     the popovers set); Need-your-score -> Scoring (on Master the control is
 *     HONESTLY INERT per the sealed Scoring-hidden-on-Master rule — Scoring
 *     needs a workspace; disabled + explanatory title, the make-real law);
 *     Awaiting-vote -> Community. Alerts carries NO card-level View-all
 *     (DECLARED: its real surface is per-entry — each alert IS one
 *     stakeholder record); every card's "+N more" overflow chip expands the
 *     band to intel mode (the bigger sealed capped preview) when clickable.
 *  E. All signal math is memoized over the host-supplied visible set.
 */
import { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  coldStakeholders, needsScoreList, awaitingVotes, relationshipMix,
  activePlansFor, developments, devLabel, devKey, nameOf, daysSince,
  summaryLine, capFor, userIgnores, splitIgnored,
} from './workhq-logic.js';

/* Sealed empty copy (alerts/needs/votes verbatim; cold is the ruled NEW card
 * — DECLARED copy in the sealed register). */
const EMPTY_TEXT = {
  alerts: 'No new developments',
  'needs-score': "You're caught up on scoring",
  votes: 'Nothing pending',
  cold: 'No high-priority relationships going cold',
};

/* The ruled "Ignored (N)" review popover — a ui-menu whose rows un-ignore.
 * PORTALED to document.body (the established in-page ui-menu pattern, e.g.
 * the Plan editor's AddShMenu: the component positions in PAGE coordinates,
 * so it must not sit inside a positioned ancestor like ui-card). The anchor
 * attribute is set via effect once the anchor button exists. ui-menu is
 * natively capped (max-height + scroll); rendered rows cap at 30.           */
function IgnoredMenu({ anchorId, entries, keyOf, labelOf, onRestore }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.setAttribute('anchor', anchorId);
  }, [anchorId]);
  return createPortal(
    <ui-menu ref={ref} class="intel-ignored-menu">
      {entries.slice(0, 30).map((e) => (
        <ui-menu-item key={keyOf(e)} title="Restore"
                      onClick={() => onRestore(keyOf(e))}>
          <ui-icon slot="icon" size="sm">restore</ui-icon>
          {labelOf(e)}
        </ui-menu-item>
      ))}
    </ui-menu>,
    document.body,
  );
}

/* One card (the sealed IntelCard reshaped to Canonical UI: ui-card outlined;
 * the name list = a compact ui-list; overflow = the sealed "+N more" chip). */
function WorkHQCard({
  cardKey, label, wide, mode, setMode, entries, ignored, keyOf, labelOf,
  supportingOf, onEntry, onIgnore, onIgnoreAll, onUnignore, viewAll,
}) {
  const cap = capFor(cardKey, mode);
  const shown = entries.slice(0, cap);
  const more = entries.length - shown.length;
  return (
    <ui-card
      variant="outlined"
      class={'intel-card' + (wide ? ' intel-card-wide' : '')}
      data-card={cardKey}
    >
      <div className="intel-card-label">
        <span className="intel-card-name">{label}</span>
        <ui-badge tone="neutral" count={entries.length}
                  aria-label={`${entries.length} in ${label}`}></ui-badge>
        <span className="intel-card-label-spacer" />
        {ignored.length > 0 && (
          <>
            <ui-button variant="text" class="intel-ignored-btn"
                       id={`ign-${cardKey}`}
                       title="Review ignored entries">
              Ignored ({ignored.length})
            </ui-button>
            <IgnoredMenu
              anchorId={`ign-${cardKey}`}
              entries={ignored}
              keyOf={keyOf}
              labelOf={labelOf}
              onRestore={(k) => onUnignore(cardKey, k)}
            />
          </>
        )}
      </div>

      {shown.length > 0 ? (
        <ui-list class="intel-card-names">
          {shown.map((e) => (
            <ui-list-item key={keyOf(e)} interactive
                          title={labelOf(e)}
                          onClick={() => onEntry(e)}>
              <span className="intel-name">{labelOf(e)}</span>
              {supportingOf ? <span slot="supporting">{supportingOf(e)}</span> : null}
              <ui-icon-button slot="trailing" size="xs" class="intel-ignore-x"
                              aria-label={`Ignore: ${labelOf(e)}`} title="Ignore"
                              onClick={(ev) => { ev.stopPropagation(); onIgnore(cardKey, keyOf(e)); }}>
                <ui-icon size="xs">close</ui-icon>
              </ui-icon-button>
            </ui-list-item>
          ))}
        </ui-list>
      ) : (
        <div className="intel-card-empty">{EMPTY_TEXT[cardKey]}</div>
      )}

      <div className="intel-card-foot">
        {more > 0 && (mode === 'split' ? (
          <ui-chip variant="assist" class="intel-more"
                   title="Show more — expand intelligence"
                   onClick={() => setMode('intel')}>+{more} more</ui-chip>
        ) : (
          <ui-chip variant="tag" class="intel-more">+{more} more</ui-chip>
        ))}
        <span className="intel-card-foot-spacer" />
        {entries.length > 0 && (
          <ui-button variant="text" class="intel-ignore-all"
                     title={`Ignore all ${entries.length}`}
                     onClick={() => onIgnoreAll(cardKey, entries.map(keyOf))}>
            Ignore all
          </ui-button>
        )}
        {viewAll && (
          <ui-button variant="text" class="intel-view-all"
                     disabled={viewAll.disabled ? '' : undefined}
                     title={viewAll.title}
                     onClick={viewAll.disabled ? undefined : viewAll.go}>
            View all
          </ui-button>
        )}
      </div>
    </ui-card>
  );
}

export function WorkHQBand({
  mode, setMode,
  stakeholders, scores, team, community, plans,
  currentUser, isMaster, workspaceLabel, workspaceId,
  ignores, onIgnore, onIgnoreAll, onUnignore,
  onAddStakeholder, onOpenStakeholder, onOpenCommunityEntry,
  onOpenCommunity, onOpenMap, onOpenPlans, onOpenScoring, onViewAllCold,
}) {
  const userId = currentUser ? currentUser.id : null;

  /* Sealed signals, memoized (ruling E) over the host's visible set. */
  const cold = useMemo(() => coldStakeholders(stakeholders), [stakeholders]);
  const needs = useMemo(
    () => needsScoreList(stakeholders, scores, team, userId),
    [stakeholders, scores, team, userId]);
  const votes = useMemo(() => awaitingVotes(community, userId), [community, userId]);
  const devs = useMemo(() => developments(stakeholders), [stakeholders]);
  const mix = useMemo(
    () => relationshipMix(stakeholders, scores, team),
    [stakeholders, scores, team]);
  const wsPlans = useMemo(
    () => activePlansFor(plans, isMaster, workspaceId),
    [plans, isMaster, workspaceId]);

  /* Ruled ignores: split each card BEFORE counting. */
  const mine = useMemo(() => userIgnores(ignores, userId) || {},
    [ignores, userId]);
  const cards = useMemo(() => ({
    alerts: splitIgnored(devs, devKey, mine.alerts),
    needs: splitIgnored(needs, (s) => s.id, mine['needs-score']),
    votes: splitIgnored(votes, (a) => a.id, mine.votes),
    cold: splitIgnored(cold, (s) => s.id, mine.cold),
  }), [devs, needs, votes, cold, mine]);

  /* Sealed summary join over the POST-IGNORE counts (ruling C). */
  const summary = summaryLine(
    cards.cold.visible.length, cards.needs.visible.length,
    cards.votes.visible.length);

  return (
    <section className="intel-band" aria-label={`WorkHQ — ${workspaceLabel || 'workspace intelligence'}`}>
      <div className="intel-head">
        <span className="intel-title">WorkHQ</span>
        {mode === 'table' && (
          <span className="intel-summary">
            <span className="intel-summary-text">{summary}</span>
            {/* Ruling A: mix + active-plans live ONLY here — real chip
                controls routing to Map / Plans. */}
            <ui-chip variant="assist" class="intel-mix-chip"
                     title="Relationship mix — open Map"
                     onClick={onOpenMap}>
              <span className="intel-mix">
                <i className="pos" aria-hidden="true"></i>{mix.positive}
                <i className="neu" aria-hidden="true"></i>{mix.winnable}
                <i className="neg" aria-hidden="true"></i>{mix.negative}
              </span>
            </ui-chip>
            <ui-chip variant="assist" class="intel-plans-chip"
                     title="Open Plans"
                     onClick={onOpenPlans}>
              {wsPlans.length} active plan{wsPlans.length === 1 ? '' : 's'}
            </ui-chip>
          </span>
        )}
        <span className="intel-spacer" />
        <ui-button variant="text" class="intel-quick" title="Add stakeholder"
                   onClick={onAddStakeholder}>
          <ui-icon slot="leading" size="sm">add</ui-icon>
          Stakeholder
        </ui-button>
        <span className="intel-modes" role="group" aria-label="Intelligence layout">
          <ui-icon-button variant="standard" class="intel-mode"
                          selected={mode === 'intel' ? '' : undefined}
                          title="Expand intelligence" aria-label="Expand intelligence"
                          onClick={() => setMode('intel')}>
            <ui-icon>dashboard</ui-icon>
          </ui-icon-button>
          <ui-icon-button variant="standard" class="intel-mode"
                          selected={mode === 'split' ? '' : undefined}
                          title="Split view" aria-label="Split view"
                          onClick={() => setMode('split')}>
            <ui-icon>splitscreen</ui-icon>
          </ui-icon-button>
          <ui-icon-button variant="standard" class="intel-mode"
                          selected={mode === 'table' ? '' : undefined}
                          title="Expand table" aria-label="Expand table"
                          onClick={() => setMode('table')}>
            <ui-icon>table_rows</ui-icon>
          </ui-icon-button>
        </span>
      </div>

      {mode !== 'table' && (
        <div className="intel-cards">
          <WorkHQCard
            cardKey="alerts" label="Alerts" wide mode={mode} setMode={setMode}
            entries={cards.alerts.visible} ignored={cards.alerts.ignored}
            keyOf={devKey} labelOf={devLabel}
            onEntry={(d) => onOpenStakeholder && onOpenStakeholder(d.stakeholder.id)}
            onIgnore={onIgnore} onIgnoreAll={onIgnoreAll} onUnignore={onUnignore}
            viewAll={null}
          />
          <WorkHQCard
            cardKey="needs-score" label="Need your score" wide mode={mode} setMode={setMode}
            entries={cards.needs.visible} ignored={cards.needs.ignored}
            keyOf={(s) => s.id} labelOf={nameOf}
            onEntry={(s) => onOpenStakeholder && onOpenStakeholder(s.id)}
            onIgnore={onIgnore} onIgnoreAll={onIgnoreAll} onUnignore={onUnignore}
            viewAll={{
              disabled: !!isMaster,
              title: isMaster
                ? 'Scoring is a workspace surface — open a workspace to score'
                : 'Open Scoring',
              go: onOpenScoring,
            }}
          />
          <WorkHQCard
            cardKey="votes" label="Awaiting your vote" mode={mode} setMode={setMode}
            entries={cards.votes.visible} ignored={cards.votes.ignored}
            keyOf={(a) => a.id} labelOf={(a) => 'Vote: ' + a.name}
            onEntry={(a) => onOpenCommunityEntry && onOpenCommunityEntry(a.id)}
            onIgnore={onIgnore} onIgnoreAll={onIgnoreAll} onUnignore={onUnignore}
            viewAll={{ title: 'Open Community', go: onOpenCommunity }}
          />
          <WorkHQCard
            cardKey="cold" label="Cold relationships" mode={mode} setMode={setMode}
            entries={cards.cold.visible} ignored={cards.cold.ignored}
            keyOf={(s) => s.id} labelOf={nameOf}
            supportingOf={(s) => {
              const d = daysSince(s.lastContact);
              return Number.isFinite(d) ? `${d} days stale` : 'no contact logged';
            }}
            onEntry={(s) => onOpenStakeholder && onOpenStakeholder(s.id)}
            onIgnore={onIgnore} onIgnoreAll={onIgnoreAll} onUnignore={onUnignore}
            viewAll={{
              title: 'Open in Lists — High priority, stalest first',
              go: onViewAllCold,
            }}
          />
        </div>
      )}
    </section>
  );
}
