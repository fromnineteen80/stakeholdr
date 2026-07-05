import { useEffect, useMemo, useState } from 'react';
// Canonical UI: the ONE component source. Side-effect import registers every
// ui-* element and loads the token contract (tokens.css).
import '../../design-system/entry.js';
import './app.css';
import { SheetPage } from './pages/sheet.jsx';
import { MapPage } from './pages/map.jsx';
import { ScoringPage } from './pages/scoring.jsx';
import { PlanPage } from './pages/plan.jsx';
import { CommunityPage } from './pages/community.jsx';
import { usePersistentState } from './data/store.js';
import {
  SEED_WORKSPACES, SEED_STAKEHOLDERS, SEED_STAKEHOLDER_WORKSPACES,
  SEED_TEAM, SEED_SCORES, SEED_USERS,
} from './data/seed.js';
import { SEGMENTS } from './data/catalogs.js';
import {
  MASTER_WORKSPACE_ID, isMasterWorkspace, countForWorkspace,
  stakeholderCountLabel, workspaceLabel,
} from './data/workspace.js';
import { unscoredCountFor } from './pages/scoring-logic.js';

// NAV_TABS per the sealed App-shell box (icons = the captured semantic→ligature
// map). Scoring carries hideWhenMaster (sealed rule — REAL as of Phase 6:
// the item is hidden whenever the active workspace is Master).
const NAV_TABS = [
  { id: 'sheet',     label: 'Lists',     icon: 'table_rows' },
  { id: 'scoring',   label: 'Scoring',   icon: 'thumb_up', hideWhenMaster: true },
  { id: 'map',       label: 'Map',       icon: 'map' },
  { id: 'plan',      label: 'Plans',     icon: 'description' },
  { id: 'community', label: 'Community', icon: 'favorite' },
  { id: 'setup',     label: 'Workspaces', icon: 'work' },
];

// Sealed NAV-TABS RIGHT CLUSTER: the context-aware "Create new" (+) shows for
// exactly these views. Live views open their create flow via createNonce;
// the rest stay honestly inert until their phases land.
const CREATE_VIEWS = ['sheet', 'scoring', 'plan', 'community', 'setup'];
const CREATE_LIVE = ['sheet', 'scoring', 'plan', 'community'];

export function AppShell() {
  const [view, setView] = useState('sheet');

  /* ── WORKSPACE SHELL-STATE (sealed TAB-STRIP STATE MACHINE, adapted to the
   * ruled shell: the bottom strip is RETIRED; its open-set/active data lives
   * in the top-bar selector + the rail's Workspaces section) ──────────────
   * Sealed defaults verbatim: openWorkspaceIds [MASTER, ws-gapp-na,
   * ws-gapp-emea]; activeWorkspaceId MASTER.                                */
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(MASTER_WORKSPACE_ID);
  const [openWorkspaceIds, setOpenWorkspaceIds] = useState(
    [MASTER_WORKSPACE_ID, 'ws-gapp-na', 'ws-gapp-emea']);

  /* Live store views (same-tab fan-out keeps these in step with page edits —
   * see store.js). The shell reads; pages own their mutations.              */
  const [workspaces, setWorkspaces] = usePersistentState('workspaces', SEED_WORKSPACES);
  const [stakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const [stakeholderWorkspaces, setStakeholderWorkspaces] =
    usePersistentState('stakeholderWorkspaces', SEED_STAKEHOLDER_WORKSPACES);
  const [team] = usePersistentState('team', SEED_TEAM);
  const [scores] = usePersistentState('scores', SEED_SCORES);
  const [users] = usePersistentState('users', SEED_USERS);

  // currentUser = the seeded first user until the login phase (sealed order;
  // the pages derive the same identity).
  const currentUser = users[0] || null;

  const isMaster = isMasterWorkspace(activeWorkspaceId);
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || null;

  const [createNonce, setCreateNonce] = useState(0);

  /* Sealed openWorkspaceTab: add to the open set if absent → activate →
   * view "sheet". activateWorkspaceTab: same without the add.               */
  const openWorkspaceTab = (wsId) => {
    setOpenWorkspaceIds((prev) => (prev.includes(wsId) ? prev : [...prev, wsId]));
    setActiveWorkspaceId(wsId);
    setView('sheet');
  };
  const activateWorkspaceTab = (wsId) => {
    setActiveWorkspaceId(wsId);
    setView('sheet');
  };

  /* Sealed removeWorkspace cascade (App-shell + Connectivity boxes): drop the
   * record; strip the wsId from EVERY stakeholder's join list; close its
   * open-set entry; if it was active, the active workspace falls back to
   * MASTER ("closes tab, active -> Master" — the left-tab fallback is sealed
   * ONLY for closeWorkspaceTab, the tab-close path, which arrives with its
   * phase). The plans leg of the cascade lands with the Plans phase. Used by
   * Scoring's sole-member closure ("returns to Master").
   * NOTE: `remaining` is computed OUTSIDE the updater and the three states
   * set sequentially — an updater must stay pure (StrictMode double-invokes). */
  const removeWorkspace = (wsId) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== wsId));
    setStakeholderWorkspaces((prev) => {
      const next = {};
      for (const [sid, list] of Object.entries(prev)) {
        next[sid] = (list || []).filter((id) => id !== wsId);
      }
      return next;
    });
    const remaining = openWorkspaceIds.filter((id) => id !== wsId);
    setOpenWorkspaceIds(remaining);
    if (wsId === activeWorkspaceId) {
      setActiveWorkspaceId(MASTER_WORKSPACE_ID);
      setView('sheet');
    }
  };

  /* Sealed REDIRECT: Scoring is disabled on Master → kick to Map.           */
  useEffect(() => {
    if (isMaster && view === 'scoring') setView('map');
  }, [isMaster, view]);

  /* Sealed unscoredCount (Scoring-cadence box, exact formula + guards):
   * global scope, keyed by the current user's TEAM-MEMBER id; a deliberate
   * (0,0) record counts as scored.                                          */
  const unscoredCount = useMemo(
    () => unscoredCountFor(stakeholders, scores, team, currentUser?.id),
    [stakeholders, scores, team, currentUser]);

  const visibleTabs = NAV_TABS.filter((t) => !(isMaster && t.hideWhenMaster));

  /* Selector rows: every workspace grouped by segment (sealed
   * OpenWorkspaceModal grouping; segment list = the catalog — the sealed
   * Settings-override contract re-points this at appConfig.segments when the
   * Settings phase lands).                                                  */
  const segments = Object.keys(SEGMENTS);

  const wsCount = (wsId) => countForWorkspace(stakeholderWorkspaces, wsId);

  return (
    <ui-app-shell>
      {/* RULED chrome — identical on every screen: mark + name in the rail,
          workspace selector + actions in the content header. */}
      <ui-app-bar slot="header" variant="flat">
        {/* WORKSPACE SELECTOR — REAL as of Phase 6 (sealed OpenWorkspaceModal
            semantics recomposed as this top-bar ui-menu): workspaces grouped
            by segment, per-workspace count, "Switch to"/"Open →" CTA. */}
        {/* The trigger is a REAL ui-button (never a role=button span — raw
            interactive HTML is forbidden and the span was keyboard-dead);
            ui-menu anchors to its id and opens on click, so Enter/Space on
            the button's real shadow control opens the menu natively. */}
        <ui-button
          slot="leading"
          variant="outlined"
          class="ws-select"
          id="ws-select-anchor"
          title="Switch workspace"
        >
          {isMaster ? (
            <>
              <span className="ws-select-name">Master</span>
              <span className="ws-select-sub">All stakeholders</span>
            </>
          ) : (
            <>
              <ui-chip variant="segment" value={activeWorkspace?.segment || ''}>
                {activeWorkspace?.segment || ''}
              </ui-chip>
              <span className="ws-select-name">{workspaceLabel(workspaces, activeWorkspaceId)}</span>
              <span className="ws-select-sub">{activeWorkspace?.businessUnit || ''}</span>
            </>
          )}
          <ui-icon size="sm">expand_more</ui-icon>
        </ui-button>

        {CREATE_VIEWS.includes(view) && (
          <ui-icon-button
            slot="trailing"
            variant="standard"
            aria-label="Create new"
            title={CREATE_LIVE.includes(view)
              ? 'Create new'
              : "Create new — wires up with this page's build phase"}
            disabled={CREATE_LIVE.includes(view) ? undefined : ''}
            onClick={CREATE_LIVE.includes(view) ? () => setCreateNonce((n) => n + 1) : undefined}
          >
            <ui-icon>add</ui-icon>
          </ui-icon-button>
        )}
        <ui-icon-button slot="trailing" variant="standard" disabled aria-label="Search"
                        title="Search (⌘K) arrives with the command-palette phase">
          <ui-icon>search</ui-icon>
        </ui-icon-button>
      </ui-app-bar>

      <ui-sidebar slot="nav">
        <span slot="brand" className="brand">
          <span className="mark">S<i>r</i></span>
          <span className="brand-text">Stakeholdr</span>
        </span>
        {visibleTabs.map((t) => (
          <ui-sidebar-item
            key={t.id}
            active={view === t.id ? '' : undefined}
            onClick={() => setView(t.id)}
          >
            <ui-icon slot="icon">{t.icon}</ui-icon>
            {t.label}
            {/* Sealed Scoring count badge: rendered only when the tab exists
                (non-Master) AND unscoredCount > 0 — ui-badge alert tone; the
                oracle's forced-override count-alert pattern is NOT replicated
                (forbidden-pattern note, sealed cadence box). */}
            {t.id === 'scoring' && unscoredCount > 0 ? (
              <ui-badge class="nav-badge" count={unscoredCount}
                        aria-label={`${unscoredCount} unscored`}></ui-badge>
            ) : null}
          </ui-sidebar-item>
        ))}
        {/* Workspaces section — the OPEN workspaces (sealed open-set), active
            one marked; clicking switches (sealed activate → Lists). */}
        <div className="nav-sec">Workspaces</div>
        {openWorkspaceIds.map((id) => {
          if (isMasterWorkspace(id)) {
            return (
              <ui-sidebar-item
                key={id}
                active={activeWorkspaceId === id ? '' : undefined}
                title="Master pool - all stakeholders. Cannot be closed."
                onClick={() => activateWorkspaceTab(id)}
              >
                <ui-icon slot="icon">table_rows</ui-icon>
                Master <span className="ws-count">· {stakeholders.length}</span>
              </ui-sidebar-item>
            );
          }
          const w = workspaces.find((x) => x.id === id);
          if (!w) return null;
          return (
            <ui-sidebar-item
              key={id}
              active={activeWorkspaceId === id ? '' : undefined}
              title={`${w.name} - ${w.segment} · ${w.businessUnit}`}
              onClick={() => activateWorkspaceTab(id)}
            >
              <span slot="icon" className="seg-dot" data-segment={w.segment}></span>
              {w.name} <span className="ws-count">· {wsCount(id)}</span>
            </ui-sidebar-item>
          );
        })}
        <ui-sidebar-item slot="footer" onClick={() => setView('help')} active={view === 'help' ? '' : undefined}>
          <ui-icon slot="icon">help</ui-icon>Help
        </ui-sidebar-item>
        <div slot="footer" className="me">
          <ui-avatar name={currentUser?.name || ''} size="sm"></ui-avatar>
          <span className="me-name">{currentUser?.name || ''}</span>
        </div>
      </ui-sidebar>

      <div className="work">
        {view === 'sheet' ? (
          <SheetPage createNonce={createNonce} activeWorkspaceId={activeWorkspaceId} />
        ) : view === 'map' ? (
          /* Sealed: the Map IS available on Master (the org-wide overview). */
          <MapPage activeWorkspaceId={activeWorkspaceId} />
        ) : view === 'scoring' && !isMaster ? (
          /* Sealed: ScoringView gets workspaceOwners + onDeleteWorkspace only
             when not master. */
          <ScoringPage
            activeWorkspaceId={activeWorkspaceId}
            workspaceOwners={activeWorkspace?.owners || []}
            createNonce={createNonce}
            onDeleteWorkspace={() => removeWorkspace(activeWorkspaceId)}
          />
        ) : view === 'plan' ? (
          /* Sealed: Plans render on Master (all plans) and per workspace
             (that workspace's plans); creation flows through createNonce. */
          <PlanPage createNonce={createNonce} activeWorkspaceId={activeWorkspaceId} />
        ) : view === 'community' ? (
          /* Sealed: Community aggregates org-wide (never workspace-scoped);
             creation flows through createNonce (the shell (+) is the sealed
             New-application affordance). */
          <CommunityPage createNonce={createNonce} />
        ) : (
          <ui-card variant="outlined">
            <div className="ph-title">
              {(NAV_TABS.find((t) => t.id === view) || { label: 'Help' }).label}
            </div>
            <p className="ph-body">
              Phase 1 scaffold — the shell is live (chrome, nav, tokens, theme cascade).
              This page assembles in its build phase, node by node against its sealed
              skeleton tree.
            </p>
          </ui-card>
        )}
      </div>

      <ui-status-bar slot="footer">
        <span>Build: Phase 8 — Community (applications · votes · approval · FY rollups)</span>
        <span slot="end">Build Protocol active · zero literal hex</span>
      </ui-status-bar>

      {/* The selector menu lives OUTSIDE the shell grid so its page-coord
          positioning holds (ui-menu anchors to #ws-select-anchor and owns
          open/close + outside-dismiss natively). */}
      <ui-menu anchor="ws-select-anchor" class="ws-menu">
        {/* Master row — the sealed immovable first entry. Meta = the sealed
            "{count} stakeholder(s)" line, nothing invented. CTA copy is the
            sealed pair "Switch to"/"Open →"; "Active" on the CURRENT row is a
            DECLARED current-row marker (the sealed OpenWorkspaceModal had no
            current-row concept — recomposed as a top-bar selector, the menu
            must mark where you already are; declared, never silent). */}
        <ui-menu-item onClick={() => openWorkspaceTab(MASTER_WORKSPACE_ID)}>
          <span className="ws-row">
            <span className="ws-row-main">
              <span className="ws-row-name">Master</span>
              <span className="ws-row-meta">{stakeholderCountLabel(stakeholders.length)}</span>
            </span>
            <span className="ws-row-cta">
              {isMaster ? 'Active' : 'Switch to'}
            </span>
          </span>
        </ui-menu-item>
        {/* Sealed OpenWorkspaceModal grouping: every workspace BY SEGMENT,
            each group headed by its segment pill; row = name ·
            "{businessUnit} · {count} stakeholder(s)" · CTA "Switch to" (open)
            / "Open →". "Active" on the current row = the DECLARED
            current-row marker (see the Master-row note above). */}
        {segments.map((seg) => {
          const inSeg = workspaces.filter((w) => w.segment === seg);
          if (!inSeg.length) return null;
          return [
            <div className="ws-group-head" key={seg}>
              <ui-chip variant="segment" value={seg}>{seg}</ui-chip>
            </div>,
            ...inSeg.map((w) => (
              <ui-menu-item key={w.id} onClick={() => openWorkspaceTab(w.id)}>
                <span className="ws-row">
                  <span className="ws-row-main">
                    <span className="ws-row-name">{w.name}</span>
                    <span className="ws-row-meta">
                      {w.businessUnit} · {stakeholderCountLabel(wsCount(w.id))}
                    </span>
                  </span>
                  <span className="ws-row-cta">
                    {w.id === activeWorkspaceId ? 'Active'
                      : openWorkspaceIds.includes(w.id) ? 'Switch to' : 'Open →'}
                  </span>
                </span>
              </ui-menu-item>
            )),
          ];
        })}
        {/* Sealed foot CTA — honestly inert until the Workspaces page phase. */}
        <ui-menu-item disabled title="New workspace — arrives with the Workspaces build phase">
          <ui-icon slot="icon" size="sm">add</ui-icon>
          New workspace…
        </ui-menu-item>
      </ui-menu>
    </ui-app-shell>
  );
}
