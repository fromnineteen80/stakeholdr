/* map.jsx — the Map page, recomposed at PHASE 14 to the sealed SKELETON TREE
 * (guide ~349–375): div.map-wrap is the PAGE CONTAINER — "a two-column grid
 * (1fr 320px…): the page-level layout row — content region beside
 * ui-inspector; token-only container" — and div.map-stage "is the HOST of
 * ui-stakeholder-map". So THE PAGE hosts the scorecard rail (MapDetail = the
 * REAL ui-inspector, sealed ~345 + ~362–374) and the reopen edge tab; the
 * ui-stakeholder-map component keeps the plot internals (grid, dots, ticks,
 * legend, history trail) — replace-don't-duplicate: the component's former
 * built-in rail is REMOVED, not kept alongside.
 *
 * Sealed rail state (page-owned): detailOpen DEFAULTS TRUE; historyMode
 * defaults false and is CONTROLLED down as the component's history-mode
 * attribute (the sealed toggle lives in the scorecard). wrapSelect semantics
 * (sealed): any selection — dot click or a Recently-scored row — selects +
 * FORCES the scorecard open + EXITS history.
 *
 * CENSUS B3 MAKE-REAL (this box is its capture): "an explicit 'Open record'
 * action in the ui-inspector scorecard (title area or actions slot)" — built
 * here as the actions-slot ui-icon-button, routing to the Phase-14
 * record.stakeholder PAGE via the shell's onOpenRecord seam (the full-page
 * record surface; the dot double-click keeps its sealed modal-profile route).
 * The oracle's dead onOpenFull prop is NOT replicated — this control is real.
 *
 * Scorecard content derivations are single-sourced: EMPTY_PROMPT /
 * HISTORY_TIP_* / latestNote / noteDateShort from the design-system map
 * module (node-tested; its tagsOverflow stays a pure export for map-test —
 * this page renders Tags via the shared TagPills primitive), the 11-row
 * descriptor order from map-logic.js (record-test), strategy copy + zone
 * tokens from engine.js STATUSES, dates from formatDateLong.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState, nowStamp } from '../data/store.js';
import { weightedCoord, statusFor, STATUSES } from '../data/engine.js';
import {
  SEED_STAKEHOLDERS, SEED_SCORES, SEED_TEAM, SEED_USERS, SEED_COMMUNITY,
  SEED_WORKSPACES, SEED_STAKEHOLDER_WORKSPACES,
} from '../data/seed.js';
import { useCompanyCatalogs } from '../data/company.js';
import { StakeholderModal, Owners, TagPills, StatusDot, PriorityPill, useUiEvent }
  from '../modals/stakeholder-modal.jsx';
import { formatDateLong } from '../modals/stakeholder-logic.js';
import { MASTER_WORKSPACE_ID, visibleStakeholders } from '../data/workspace.js';
import { displayName, normalizeUrl } from '../../../design-system/components/stakeholder-table.js';
import {
  EMPTY_PROMPT, HISTORY_TIP_ON, HISTORY_TIP_OFF, latestNote, noteDateShort,
} from '../../../design-system/components/stakeholder-map.js';
import { recentRows, detailRowsFor, coordsLabel } from './map-logic.js';

/* One sealed detail row (86px/1fr k/v grid; empty → muted "-"). */
function DetailRow({ row, users, onOpenUserProfile }) {
  const { k, kind, value } = row;
  let v;
  if (value == null) {
    v = <span className="muted">-</span>;
  } else if (kind === 'chips') {
    v = (
      <span className="v-chips">
        {value.map((x) => <ui-chip key={x} variant="tag">{x}</ui-chip>)}
      </span>
    );
  } else if (kind === 'priority') {
    v = <PriorityPill value={value} />;
  } else if (kind === 'owners') {
    v = (
      <Owners users={users} value={value} readonly
              onOpen={onOpenUserProfile ? (uid) => onOpenUserProfile(uid) : undefined} />
    );
  } else if (kind === 'date') {
    v = formatDateLong(value);
  } else if (kind === 'status') {
    v = <StatusDot value={value} />;
  } else if (kind === 'tags') {
    v = <TagPills values={value} />;
  } else {
    v = value;
  }
  return (
    <div className="detail-row">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}

/* The sealed history toggle — a real ui-chip filter carrying the sealed
 * tooltip copy; only when history is non-empty. */
function HistoryToggle({ historyMode, onToggle }) {
  const ref = useRef(null);
  useUiEvent(ref, 'change', (e) => onToggle(!!(e.detail && e.detail.selected)));
  return (
    <ui-tooltip class="history-toggle-wrap">
      <ui-chip ref={ref} class="history-toggle" variant="filter"
               selected={historyMode ? '' : undefined}>
        <ui-icon slot="icon">history</ui-icon>
        {historyMode ? 'Exit history' : 'Show history'}
      </ui-chip>
      <span slot="content">{historyMode ? HISTORY_TIP_ON : HISTORY_TIP_OFF}</span>
    </ui-tooltip>
  );
}

/* MapDetail — the sealed scorecard rail (ui-inspector; empty vs selected). */
function MapScorecard({
  open, rows, selected, users, historyMode, onToggleHistory, onSelect, onClose,
  onOpenRecord, onOpenUserProfile,
}) {
  const ref = useRef(null);
  useUiEvent(ref, 'close', onClose);
  const zone = selected ? selected._status : null;
  const strat = zone ? STATUSES[zone] : null;
  const note = selected ? latestNote(selected) : null;
  return (
    <ui-inspector ref={ref} class="detail map-scorecard"
                  open={open ? '' : undefined}
                  close-label="Hide scorecard panel">
      <span slot="title" className="det-head-label">Scorecard</span>
      {/* CENSUS B3 MAKE-REAL: the explicit Open-record action (actions slot). */}
      {selected && onOpenRecord ? (
        <ui-icon-button slot="actions" variant="standard" aria-label="Open record"
                        title="Open the full record"
                        onClick={() => onOpenRecord(selected.id)}>
          <ui-icon>open_in_full</ui-icon>
        </ui-icon-button>
      ) : null}
      {!selected ? (
        /* Sealed EMPTY STATE: prompt block + six Recently-scored ghost rows
           (nested INSIDE the block, sealed tree). */
        <div className="empty-block">
          <div className="empty-title">Scorecard</div>
          <div className="empty-prompt muted">{EMPTY_PROMPT}</div>
          {rows.length ? (
            <>
              <div className="recent-caption">Recently scored</div>
              <div className="recent-list">
                {recentRows(rows).map((s) => (
                  <ui-button key={s.id} variant="text" onClick={() => onSelect(s.id)}>
                    <span className="recent-row-text">
                      <span>{displayName(s) || s.name || ''}</span>
                      <span className="muted"> - {s.type || ''}</span>
                    </span>
                  </ui-button>
                ))}
              </div>
            </>
          ) : null}
        </div>
      ) : (
        /* Sealed SELECTED STATE anatomy, in tree order. */
        <div className="det-body">
          <h3 className="det-title">{displayName(selected) || selected.name || ''}</h3>
          {selected.org ? <div className="det-org">{selected.org}</div> : null}
          {selected.url ? (
            <div className="det-website-wrap">
              <a className="det-website" href={normalizeUrl(selected.url)}
                 target="_blank" rel="noopener noreferrer">Visit Website</a>
            </div>
          ) : null}
          {(selected.history || []).length ? (
            <HistoryToggle historyMode={historyMode} onToggle={onToggleHistory} />
          ) : null}
          <div className="status-pill-row">
            <ui-chip variant="zone" size="lg" data-zone={zone}>{zone}</ui-chip>
            <span className="det-coords">{coordsLabel(selected._x, selected._y)}</span>
          </div>
          {strat ? (
            <div className="strategy-card" data-zone={zone}>
              <div className="strategy-eyebrow">Strategy</div>
              <div className="strategy-title">{strat.strategy}</div>
              <div className="strategy-action">{strat.action}</div>
            </div>
          ) : null}
          <div className="detail-rows">
            {detailRowsFor(selected).map((row) => (
              <DetailRow key={row.k} row={row} users={users}
                         onOpenUserProfile={onOpenUserProfile} />
            ))}
          </div>
          {note && note.body ? (
            <div className="detail-latest-note">
              <div className="detail-latest-note-head">
                <span className="detail-latest-note-cap">Latest note</span>
                {noteDateShort(note.at)
                  ? <span className="detail-latest-note-date">{noteDateShort(note.at)}</span>
                  : null}
              </div>
              <div className="detail-latest-note-body">{note.body}</div>
            </div>
          ) : null}
        </div>
      )}
    </ui-inspector>
  );
}

export function MapPage({
  activeWorkspaceId = MASTER_WORKSPACE_ID, onOpenCommunityEntry, onOpenWorkspace,
  onOpenUserProfile, onOpenRecord,
}) {
  const [stakeholders, setStakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const { companyIssues, companyTags } = useCompanyCatalogs();
  const [scores, setScores] = usePersistentState('scores', SEED_SCORES);
  const [team] = usePersistentState('team', SEED_TEAM);
  const [users] = usePersistentState('users', SEED_USERS);
  const [community] = usePersistentState('community', SEED_COMMUNITY);
  const [workspaces] = usePersistentState('workspaces', SEED_WORKSPACES);
  const [stakeholderWorkspaces, setStakeholderWorkspaces] =
    usePersistentState('stakeholderWorkspaces', SEED_STAKEHOLDER_WORKSPACES);

  const mapRef = useRef(null);

  /* Selection lifts to the page (sealed) — with the page-owned rail state:
   * detailOpen DEFAULTS OPEN; historyMode false (sealed defaults). */
  const [selectedId, setSelectedId] = useState(null);
  const [detailOpen, setDetailOpen] = useState(true);
  const [historyMode, setHistoryMode] = useState(false);

  // OPEN-PROFILE route (sealed: dot double-click → the read-only profile).
  const [shModal, setShModal] = useState(null);

  const currentUser = users[0] || null;

  /* Sealed row mapping — identical to Lists (RAW weightedCoord → statusFor). */
  const rows = useMemo(() =>
    visibleStakeholders(stakeholders, stakeholderWorkspaces, activeWorkspaceId)
      .map((s) => {
        const pos = weightedCoord(s.id, scores, team);
        return { ...s, _x: pos.x, _y: pos.y, _status: statusFor(pos.x, pos.y) };
      }),
  [stakeholders, stakeholderWorkspaces, activeWorkspaceId, scores, team]);

  const selected = selectedId ? rows.find((r) => r.id === selectedId) || null : null;

  // Manifest: data is a JS property — feed through the ref.
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    el.data = rows;
  }, [rows]);

  // Controlled selection down (same-id set is a component no-op).
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    el.selectedId = selectedId;
  }, [selectedId]);

  /* wrapSelect (sealed): select + force scorecard open + exit history —
   * shared by the dot click (component event) and the recent rows here. */
  const wrapSelect = (id) => {
    setSelectedId(id);
    setDetailOpen(true);
    setHistoryMode(false);
  };

  // Component events → page state (first-class routes, sealed).
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const onSelect = (e) => {
      setSelectedId(e.detail.id);
      setDetailOpen(true);
      setHistoryMode(false);
    };
    const onOpenProfile = (e) => setShModal({ mode: 'edit', id: e.detail.id, view: true });
    el.addEventListener('selection-change', onSelect);
    el.addEventListener('open-profile', onOpenProfile);
    return () => {
      el.removeEventListener('selection-change', onSelect);
      el.removeEventListener('open-profile', onOpenProfile);
    };
  }, []);

  /* Persistence mirrors the Lists page (the ONE Store seam). */
  const updateStakeholder = (id, patch) => {
    setStakeholders((prev) => prev.map((s) => (
      s.id === id ? { ...s, ...patch, updatedAt: nowStamp() } : s
    )));
  };

  const deleteStakeholder = (id) => {
    setStakeholders((prev) => prev.filter((s) => s.id !== id));
    setScores((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setStakeholderWorkspaces((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const getWorkspacesForStakeholder = (id) =>
    workspaces.filter((w) => (stakeholderWorkspaces[id] || []).includes(w.id));

  const shExisting = shModal && shModal.id
    ? stakeholders.find((s) => s.id === shModal.id) || null
    : null;

  /* Census C9 (sealed REAL): profile engagement rows ride the shell seam. */
  const openCommunityFromModal = onOpenCommunityEntry
    ? (id) => { setShModal(null); onOpenCommunityEntry(id); }
    : undefined;

  return (
    /* The sealed PAGE CONTAINER: plot stage beside the scorecard rail
       (detail-closed when the rail is hidden — sealed className). */
    <div className={'map-wrap' + (detailOpen ? '' : ' detail-closed')}>
      {/* Display options ride the sealed TWEAK_DEFAULTS; history-mode is the
          page-controlled attribute (the sealed toggle lives in the rail). */}
      <ui-stakeholder-map
        ref={mapRef}
        class="map-stage"
        history-mode={historyMode && selected && (selected.history || []).length ? '' : undefined}
      ></ui-stakeholder-map>

      <MapScorecard
        open={detailOpen}
        rows={rows}
        selected={selected}
        users={users}
        historyMode={historyMode}
        onToggleHistory={setHistoryMode}
        onSelect={wrapSelect}
        onClose={() => setDetailOpen(false)}
        onOpenRecord={onOpenRecord}
        onOpenUserProfile={onOpenUserProfile}
      />

      {/* Sealed reopen edge tab (chevron-left, "Reopen scorecard"). */}
      {!detailOpen ? (
        <ui-icon-button class="map-detail-reopen" variant="outlined"
                        title="Reopen scorecard" aria-label="Open scorecard"
                        onClick={() => setDetailOpen(true)}>
          <ui-icon>chevron_left</ui-icon>
        </ui-icon-button>
      ) : null}

      {/* THE SEALED PROFILE ROUTE: dot double-click opens the read-only
          stakeholder profile (Phase 4's modal, initialView). */}
      <StakeholderModal
        open={!!shModal}
        existing={shExisting}
        initialView={!!(shModal && shModal.view)}
        users={users}
        currentUser={currentUser}
        companyIssues={companyIssues}
        companyTags={companyTags}
        community={community}
        scores={scores}
        team={team}
        getWorkspacesForStakeholder={getWorkspacesForStakeholder}
        onCancel={() => setShModal(null)}
        onSubmit={(data) => {
          if (shModal && shModal.id) updateStakeholder(shModal.id, data);
          setShModal(null);
        }}
        onDelete={(id) => {
          deleteStakeholder(id);
          setShModal(null);
        }}
        onOpenCommunity={openCommunityFromModal}
        onOpenWorkspace={onOpenWorkspace}
        onOpenUser={onOpenUserProfile}
      />
    </div>
  );
}
