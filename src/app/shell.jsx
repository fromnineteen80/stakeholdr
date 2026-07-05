import { useEffect, useMemo, useRef, useState } from 'react';
// Canonical UI: the ONE component source. Side-effect import registers every
// ui-* element and loads the token contract (tokens.css).
import '../../design-system/entry.js';
import './app.css';
import { SheetPage } from './pages/sheet.jsx';
import { MapPage } from './pages/map.jsx';
import { ScoringPage } from './pages/scoring.jsx';
import { PlanPage } from './pages/plan.jsx';
import { CommunityPage } from './pages/community.jsx';
import { SetupPage } from './pages/setup.jsx';
import { HelpPage } from './pages/help.jsx';
import { SettingsPage } from './pages/settings.jsx';
import { MessagesPage, MessagingSidebar } from './pages/messages.jsx';
import { ProfilePage, UserStack, UserListPopup } from './pages/profile.jsx';
import { startConversationRecord } from './pages/messages-logic.js';
import { usePersistentState, uid, nowStamp } from './data/store.js';
import { APP_CONFIG_SEED, applyAppConfigLive, appNameFrom } from './data/company.js';
import {
  SEED_WORKSPACES, SEED_STAKEHOLDERS, SEED_STAKEHOLDER_WORKSPACES,
  SEED_TEAM, SEED_SCORES, SEED_USERS, SEED_PLANS, SEED_COMMUNITY,
  SEED_CONVERSATIONS, SEED_MESSAGES, SEED_READS,
} from './data/seed.js';
import { unreadTotal } from './pages/messages-logic.js';
import {
  MASTER_WORKSPACE_ID, isMasterWorkspace, countForWorkspace,
  stakeholderCountLabel, workspaceLabel, stripWorkspaceFromJoins,
} from './data/workspace.js';
import { unscoredCountFor } from './pages/scoring-logic.js';
import { companySegmentsFrom } from './pages/setup-logic.js';
import { StakeholderRecordPage } from './record/stakeholder-record.jsx';
import { WorkspaceRecordPage } from './record/workspace-record.jsx';

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
const CREATE_LIVE = ['sheet', 'scoring', 'plan', 'community', 'setup'];

export function AppShell() {
  const [view, setView] = useState('sheet');
  const snackRef = useRef(null);

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
  const [plans, setPlans] = usePersistentState('plans', SEED_PLANS);
  const [community] = usePersistentState('community', SEED_COMMUNITY);
  /* Messaging stores (Phase 12): read here for the unread badge + the
   * deep-link guards; the messaging surfaces own their mutations (same-tab
   * fan-out keeps every instance in step — store.js). Phase 13 adds the ONE
   * shell writer, messageUser (census J5), which needs the setters.         */
  const [conversations, setConversations] = usePersistentState('conversations', SEED_CONVERSATIONS);
  const [messages, setMessages] = usePersistentState('messages', SEED_MESSAGES);
  const [reads] = usePersistentState('reads', SEED_READS);
  /* Sealed Settings-override contract: appConfig.segments (present AND
   * non-empty) overrides the seed SEGMENTS catalog everywhere segments are
   * grouped — REAL as of Phase 11 (Settings edits it; this read is live). */
  const [appConfig] = usePersistentState('appConfig', APP_CONFIG_SEED);
  const companySegments = companySegmentsFrom(appConfig);
  /* Sealed brand text: cfg.appName || "Stakeholdr" (App-shell box; the
   * Identity pane's helper promises header + tab title — both live). */
  const appName = appNameFrom(appConfig);

  /* Sealed LIVE THEMING + DOCUMENT TITLE (App-shell box) + the Phase-11
   * design-dashboard overrides: BOOT RE-APPLIES the persisted appConfig into
   * the live document (accent/brand token roles, wrapper theme, dashboard
   * token overrides, tab title) and re-applies on every config change — no
   * reload, sealed. */
  useEffect(() => { applyAppConfigLive(appConfig); }, [appConfig]);

  // currentUser = the seeded first user until the login phase (sealed order;
  // the pages derive the same identity).
  const currentUser = users[0] || null;

  const isMaster = isMasterWorkspace(activeWorkspaceId);
  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || null;

  const [createNonce, setCreateNonce] = useState(0);

  /* COMMUNITY DEEP-LINK SEAM (sealed census C9 REAL: a stakeholder record's
   * engagement rows open that community entry read-only). Any page routes
   * here; the shell switches to Community and hands the id down the SAME
   * first-class openCommunityId/onConsumeOpen channel the Community page
   * already exposes — never a window.__pendingCommunityId bridge (sealed
   * FRAGILE, do-not-replicate). The Community page consumes the request and
   * applies the census-A23 existence guard itself.                          */
  const [pendingCommunityId, setPendingCommunityId] = useState(null);
  const openCommunityEntry = (id) => {
    setPendingCommunityId(id);
    setView('community');
  };

  /* STAKEHOLDER DEEP-LINK SEAM (Phase 12; mirrors the community seam): the
   * shell lands on Master Lists and hands the id down the first-class
   * openStakeholderId/onConsumeOpen channel; the Sheet page opens the record
   * in the READ view (the sealed A20/I4 ruling: deep links land on the read
   * view with Edit one click away — never straight into edit).              */
  const [pendingShId, setPendingShId] = useState(null);

  /* PLAN DEEP-LINK SEAM (Phase 12; census A21 FRAGILE window.__pendingPlanId
   * → first-class): Plans view with that plan open in REVIEW.               */
  const [pendingPlanId, setPendingPlanId] = useState(null);

  /* RECORD-PAGE ROUTES (Phase 14 — the RecordShell surfaces; DECLARED, the
   * sealed record box names no page routes):
   *  · record.stakeholder opens from the Map scorecard's "Open record"
   *    action (census B3 MAKE-REAL, verbatim: "an explicit 'Open record'
   *    action in the ui-inspector scorecard").
   *  · record.workspace opens from the Setup card's quiet "Open record"
   *    icon-button (declared forward-design addition mirroring B3).
   * Each remembers the launching view so Back is a real route (never the
   * oracle's no-op back — census L1 do-not-replicate); both ride the
   * census-A23 existence guard (toast + stay put).                          */
  const [recordSh, setRecordSh] = useState(null); // { id, from } | null
  const [recordWs, setRecordWs] = useState(null); // { id, from } | null
  const openStakeholderRecord = (id) => {
    if (!stakeholders.some((s) => s.id === id)) {
      snackRef.current?.show('That stakeholder no longer exists');
      return;
    }
    setRecordSh({ id, from: view });
    setView('record-sh');
  };
  const openWorkspaceRecord = (id) => {
    if (!workspaces.some((w) => w.id === id)) {
      snackRef.current?.show('That workspace no longer exists');
      return;
    }
    setRecordWs({ id, from: view });
    setView('record-ws');
  };
  const RECORD_BACK_LABELS = {
    sheet: 'Lists', scoring: 'Scoring', map: 'Map', plan: 'Plans',
    community: 'Community', setup: 'Workspaces', profile: 'Profile',
    messages: 'Messages', settings: 'Settings', help: 'Help',
    'record-sh': 'Stakeholder record', 'record-ws': 'Workspace record',
  };

  /* MESSAGING SHELL-STATE (sealed: BOTH surfaces share activeConversationId
   * in the shell, so expanding the sidebar to the page carries the open
   * conversation over — census J2).                                          */
  const [msgSidebarOpen, setMsgSidebarOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);

  /* USER-PROFILE SHELL-STATE (Phase 13 — sealed census A7/A24/I6 routes):
   * profileUserId + the people panel flag. openUserProfile is the ONE
   * user-profile seam (mirrors the plan/community deep-link seams), with the
   * census-A23 existence guard (toast + stay put, never a crash).           */
  const [usersPopupOpen, setUsersPopupOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const openUserProfile = (userId) => {
    if (!users.some((u) => u.id === userId)) {
      snackRef.current?.show('That person no longer exists');
      return;
    }
    setProfileUserId(userId);
    setView('profile');
    setUsersPopupOpen(false);
    setMsgSidebarOpen(false);
  };

  /* messageUser (sealed store writer, census J5 — deferred from Phase 12 to
   * this phase): startConversation with THAT user (the sealed DM dedupe by
   * participant pair — messages-logic.startConversationRecord, the ONE
   * formula) → activate the thread → close the people panel → open the
   * messaging sidebar.                                                       */
  const messageUser = (userId) => {
    const r = startConversationRecord(
      conversations, currentUser?.id, [userId], null, () => uid('c'));
    if (r.conversation) {
      setConversations((prev) => [...prev, r.conversation]);
      setMessages((prev) => ({ ...prev, [r.id]: prev[r.id] || [] }));
    }
    setActiveConversationId(r.id);
    setUsersPopupOpen(false);
    setMsgSidebarOpen(true);
  };

  /* Sealed openWorkspaceTab: add to the open set if absent → activate →
   * view "sheet". activateWorkspaceTab: same without the add.               */
  const openWorkspaceTab = (wsId) => {
    setOpenWorkspaceIds((prev) => (prev.includes(wsId) ? prev : [...prev, wsId]));
    setActiveWorkspaceId(wsId);
    setView('sheet');
  };

  /* Sealed addWorkspace (App-shell box): mint the id, stamp updatedAt,
   * append, then AUTO-OPEN the new workspace as a tab (census H4: "addWorkspace
   * calls openWorkspaceTab(id)"). Lives in the SHELL, as sealed — the write
   * must commit in the same owner that switches the view (a page-local write
   * would be discarded when the H4 view switch unmounts the page before its
   * persist effect runs). The sealed contract stamps HERE, not only in the
   * caller's draft: createdBy/createdAt are enforced whatever `data` carries,
   * and the sealed NO-DATA fallback mints the full default record — a bare
   * addWorkspace() must never produce a creatorless/ownerless workspace
   * (canDeleteWorkspace and member visibility key off these fields). */
  const addWorkspace = (data) => {
    const id = uid('ws');
    const fallback = data ? {} : {
      name: 'New workspace',
      segment: 'Corporate Functions',
      businessUnit: 'Legal / GA&PP',
      scope: '',
      scopeState: '',
      owners: currentUser ? [currentUser.id] : [],
    };
    setWorkspaces((prev) => [...prev, {
      id,
      ...fallback,
      ...(data || {}),
      createdBy: data?.createdBy || currentUser?.id,
      createdAt: data?.createdAt || nowStamp(),
      updatedAt: nowStamp(),
    }]);
    openWorkspaceTab(id);
    return id;
  };
  const activateWorkspaceTab = (wsId) => {
    setActiveWorkspaceId(wsId);
    setView('sheet');
  };

  /* Sealed removeWorkspace cascade (App-shell + Connectivity boxes, census
   * H3/D2 — COMPLETE as of Phase 9): drop the record; strip the wsId from
   * EVERY stakeholder's join list (stripWorkspaceFromJoins — single-sourced,
   * stakeholders stay in the Master pool); DELETE the plans scoped to the
   * workspace ("cascades to stakeholderWorkspaces + plans + open tabs +
   * active fallback" — the Setup confirm dialog discloses this leg); close
   * its open-set entry; if it was active, the active workspace falls back to
   * MASTER. Used by Scoring's sole-member closure and the Setup delete.
   * NOTE: `remaining` is computed OUTSIDE the updater and the states set
   * sequentially — an updater must stay pure (StrictMode double-invokes). */
  const removeWorkspace = (wsId) => {
    setWorkspaces((prev) => prev.filter((w) => w.id !== wsId));
    setStakeholderWorkspaces((prev) => stripWorkspaceFromJoins(prev, wsId));
    setPlans((prev) => prev.filter((p) => p.workspaceId !== wsId));
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

  /* REAL unread badge (sealed DO-NOT-REPLICATE: the oracle's badge merely
   * mirrored unscoredCount while claiming to count messages): per-user read
   * markers + the LIVE unscoredCount as the system conversation's sealed
   * contribution (messages-logic.unreadTotal).                              */
  const unreadCount = useMemo(
    () => unreadTotal(conversations, messages, reads, currentUser?.id, unscoredCount),
    [conversations, messages, reads, currentUser, unscoredCount]);

  /* THE ONE MENTION RESOLVER (census A26/J6 FRAGILE window.__openMention →
   * first-class; sealed code map stk→stakeholder · wsp→workspace · pln→plan
   * · cmy→community) WITH the census-A23 make-real guard: every deep link
   * verifies the record exists and falls back gracefully (toast + stay put —
   * the oracle's stale-workspace render crash is not replicated). A route
   * from the sidebar closes it (the overlay never lingers over the target). */
  const MENTION_MISSING = {
    stk: 'That stakeholder no longer exists',
    wsp: 'That workspace no longer exists',
    pln: 'That plan no longer exists',
    cmy: 'That community entry no longer exists',
  };
  const openMention = (type, id) => {
    let ok = false;
    if (type === 'stk' && stakeholders.some((s) => s.id === id)) {
      setActiveWorkspaceId(MASTER_WORKSPACE_ID);
      setView('sheet');
      setPendingShId(id);
      ok = true;
    } else if (type === 'wsp' && workspaces.some((w) => w.id === id)) {
      openWorkspaceTab(id);
      ok = true;
    } else if (type === 'pln' && plans.some((p) => p.id === id)) {
      setPendingPlanId(id);
      setView('plan');
      ok = true;
    } else if (type === 'cmy' && community.some((c) => c.id === id)) {
      openCommunityEntry(id);
      ok = true;
    }
    if (ok) setMsgSidebarOpen(false);
    else snackRef.current?.show(MENTION_MISSING[type] || 'That record no longer exists');
  };

  /* Census J8 make-real action route: Scoring in the reminder subject's
   * workspace; an unassigned/stale subject falls back to the record itself. */
  const openScoringFor = (stakeholderId, workspaceId) => {
    if (workspaceId && workspaces.some((w) => w.id === workspaceId)) {
      setOpenWorkspaceIds((prev) => (prev.includes(workspaceId) ? prev : [...prev, workspaceId]));
      setActiveWorkspaceId(workspaceId);
      setView('scoring');
      setMsgSidebarOpen(false);
      return;
    }
    openMention('stk', stakeholderId);
  };

  const visibleTabs = NAV_TABS.filter((t) => !(isMaster && t.hideWhenMaster));

  /* Selector rows: every workspace grouped by segment (sealed
   * OpenWorkspaceModal grouping; segment list = the Settings-fed
   * companySegments map — REAL as of Phase 9, seed-catalog fallback).       */
  const segments = Object.keys(companySegments);

  /* SETUP CREATE SEAM (sealed census A3/A18: the selector's "New workspace…"
   * lands on Setup WITH the create modal open) — a first-class prop channel
   * like the community deep-link seam; the Setup page consumes it.          */
  const [pendingSetupCreate, setPendingSetupCreate] = useState(false);
  const openSetupCreate = () => {
    setPendingSetupCreate(true);
    setView('setup');
  };

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
        {/* Sealed A5 (Phase 13, REAL): the UserStack people control — the
            first 3 non-self, non-system users as an overlapping avatar row
            with "+N" overflow; pressing it opens the UserListPopup. */}
        <UserStack slot="trailing" users={users} currentUserId={currentUser?.id}
                   onOpen={() => setUsersPopupOpen(true)} />
        {/* Sealed A14 (Phase 12, REAL): the Messages toggle with the REAL
            unread badge (ui-badge anchored over the icon button; count =
            per-conversation unread + live unscoredCount — never the oracle's
            mislabeled unscored mirror). */}
        <ui-badge slot="trailing" count={unreadCount}
                  aria-label={`${unreadCount} unread`}>
          <ui-icon-button variant="standard" aria-label="Messages" title="Messages"
                          onClick={() => setMsgSidebarOpen((o) => !o)}>
            <ui-icon>chat</ui-icon>
          </ui-icon-button>
        </ui-badge>
        <ui-icon-button slot="trailing" variant="standard" disabled aria-label="Search"
                        title="Search (⌘K) arrives with the command-palette phase">
          <ui-icon>search</ui-icon>
        </ui-icon-button>
      </ui-app-bar>

      <ui-sidebar slot="nav">
        <span slot="brand" className="brand">
          <span className="mark">S<i>r</i></span>
          <span className="brand-text">{appName}</span>
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
        {/* IDENTITY FOOTER (RULED #3) — the ONE signed-in identity, now a REAL
            control: it anchors the sealed ProfileMenu (exact oracle items +
            order: View profile · Messages · Settings [manager-only] · divider
            · Log out). Settings is the sealed manager-gated entry route
            (census A9); the other three arrive with their phases and render
            honestly inert (make-real law). */}
        <ui-sidebar-item slot="footer" id="me-anchor"
                         title="Account menu"
                         active={view === 'settings' ? '' : undefined}>
          <ui-avatar slot="icon" name={currentUser?.name || ''} size="sm"></ui-avatar>
          {currentUser?.name || ''}
        </ui-sidebar-item>
      </ui-sidebar>

      <div className="work">
        {view === 'sheet' ? (
          <SheetPage
            createNonce={createNonce}
            activeWorkspaceId={activeWorkspaceId}
            openStakeholderId={pendingShId}
            onConsumeOpen={() => setPendingShId(null)}
            onOpenCommunityEntry={openCommunityEntry}
            onOpenWorkspace={openWorkspaceTab}
            onOpenUserProfile={openUserProfile}
            /* Phase 15 (ruled workHQ seams, the onOpen* pattern): the band's
               summary mix segment -> Map, plans segment -> Plans; card
               View-alls -> Scoring (workspace-scoped; the band renders its
               Master control honestly inert) / Community. */
            onOpenMap={() => setView('map')}
            onOpenPlans={() => setView('plan')}
            onOpenScoring={() => setView('scoring')}
            onOpenCommunity={() => setView('community')}
          />
        ) : view === 'map' ? (
          /* Sealed: the Map IS available on Master (the org-wide overview). */
          <MapPage
            activeWorkspaceId={activeWorkspaceId}
            onOpenCommunityEntry={openCommunityEntry}
            onOpenWorkspace={openWorkspaceTab}
            onOpenUserProfile={openUserProfile}
            onOpenRecord={openStakeholderRecord}
          />
        ) : view === 'scoring' && !isMaster ? (
          /* Sealed: ScoringView gets workspaceOwners + onDeleteWorkspace only
             when not master. */
          <ScoringPage
            activeWorkspaceId={activeWorkspaceId}
            workspaceOwners={activeWorkspace?.owners || []}
            createNonce={createNonce}
            onDeleteWorkspace={() => removeWorkspace(activeWorkspaceId)}
            onOpenCommunityEntry={openCommunityEntry}
            onOpenWorkspace={openWorkspaceTab}
            onOpenUserProfile={openUserProfile}
          />
        ) : view === 'plan' ? (
          /* Sealed: Plans render on Master (all plans) and per workspace
             (that workspace's plans); creation flows through createNonce. */
          <PlanPage
            createNonce={createNonce}
            activeWorkspaceId={activeWorkspaceId}
            openPlanId={pendingPlanId}
            onConsumeOpen={() => setPendingPlanId(null)}
            onOpenCommunityEntry={openCommunityEntry}
            onOpenWorkspace={openWorkspaceTab}
            onOpenUserProfile={openUserProfile}
          />
        ) : view === 'community' ? (
          /* Sealed: Community aggregates org-wide (never workspace-scoped);
             creation flows through createNonce (the shell (+) is the sealed
             New-application affordance); deep links arrive through the
             community seam above (openCommunityId consumed on open). */
          <CommunityPage
            createNonce={createNonce}
            openCommunityId={pendingCommunityId}
            onConsumeOpen={() => setPendingCommunityId(null)}
            onOpenWorkspace={openWorkspaceTab}
            onOpenUserProfile={openUserProfile}
          />
        ) : view === 'setup' ? (
          /* Sealed: the Workspaces (Setup) page — segment-grouped cards,
             create/edit modals, delete-confirm; SEGMAP flows down as the
             companySegments prop (sealed load-bearing chain); activate/create
             reuse openWorkspaceTab (census H1/H4); delete reuses the ONE
             removeWorkspace cascade. */
          <SetupPage
            createNonce={createNonce}
            openCreate={pendingSetupCreate}
            onConsumeCreate={() => setPendingSetupCreate(false)}
            companySegments={companySegments}
            activeWorkspaceId={activeWorkspaceId}
            onOpenWorkspace={openWorkspaceTab}
            onAddWorkspace={addWorkspace}
            onRemoveWorkspace={removeWorkspace}
            onOpenWorkspaceRecord={openWorkspaceRecord}
          />
        ) : view === 'help' ? (
          /* Sealed: the static Help reference (framework funnel · how to read
             the map · zone key/strategy reference — engine-single-sourced).
             Zero handlers, zero props (sealed UX census). */
          <HelpPage />
        ) : view === 'messages' ? (
          /* Sealed MessagingPage (census A8 entry): shares
             activeConversationId with the sidebar (J2 carry-over); mention
             links + the J8 scoring action route through the shell's guarded
             first-class resolvers. */
          <MessagesPage
            activeConversationId={activeConversationId}
            onSetActiveConversation={setActiveConversationId}
            onOpenMention={openMention}
            onOpenScoringFor={openScoringFor}
            onOpenUserProfile={openUserProfile}
          />
        ) : view === 'settings' && currentUser?.role === 'manager' ? (
          /* Sealed: SettingsView, gated by currentUser.role === "manager"
             (census A9; the ProfileMenu item is the only entry). The page
             owns its stores (appConfig + users) per the page pattern.
             Census I6: roles-row avatars route through the one user seam. */
          <SettingsPage onOpenUserProfile={openUserProfile} />
        ) : view === 'profile' ? (
          /* Sealed record.user (Phase 13): the user profile page. Row routes
             ride the SAME first-class seams every deep link uses — I1
             workspace tab, I2 plan review, I3 community read, I4+A20
             stakeholder READ view; owner stacks re-target the page (I6). */
          <ProfilePage
            userId={profileUserId}
            onOpenWorkspace={openWorkspaceTab}
            onOpenPlan={(id) => { setPendingPlanId(id); setView('plan'); }}
            onOpenCommunity={openCommunityEntry}
            onOpenStakeholder={(id) => openMention('stk', id)}
            onOpenUser={openUserProfile}
          />
        ) : view === 'record-sh' && recordSh ? (
          /* Phase 14: record.stakeholder — the page-shell record surface
             (sealed: DISTINCT from the modal profile), poured through
             RecordShell; entered via the Map scorecard's B3 make-real
             "Open record". */
          <StakeholderRecordPage
            stakeholderId={recordSh.id}
            backLabel={RECORD_BACK_LABELS[recordSh.from] || 'Back'}
            onBack={() => { setView(recordSh.from); setRecordSh(null); }}
            onOpenWorkspace={openWorkspaceTab}
            onOpenCommunityEntry={openCommunityEntry}
            onOpenUserProfile={openUserProfile}
          />
        ) : view === 'record-ws' && recordWs ? (
          /* Phase 14: record.workspace — the workspace record page with the
             LIVE embedded ui-stakeholder-table; entered via the Setup card's
             declared "Open record". */
          <WorkspaceRecordPage
            workspaceId={recordWs.id}
            backLabel={RECORD_BACK_LABELS[recordWs.from] || 'Back'}
            onBack={() => { setView(recordWs.from); setRecordWs(null); }}
            onOpenStakeholderRecord={openStakeholderRecord}
            onOpenCommunityEntry={openCommunityEntry}
            onOpenUserProfile={openUserProfile}
          />
        ) : null /* transient only: scoring-on-Master before the redirect effect lands */}
      </div>

      <ui-status-bar slot="footer">
        <span>Phase 15 — workHQ (intelligence band on Lists · 4 cards · per-user ignore/snooze · summary mix/plans routes · pre-filtered drill-throughs)</span>
        <span slot="end">Build Protocol active · zero literal hex</span>
      </ui-status-bar>

      {/* MESSAGING SIDEBAR (sealed TREE 1) — the right-edge overlay, mounted
          at the shell so it opens over ANY view (census A14); the expand
          control navigates to the full page AND closes the overlay in the
          same click (census J2 — the open conversation carries over). */}
      <MessagingSidebar
        open={msgSidebarOpen}
        onClose={() => setMsgSidebarOpen(false)}
        onOpenPage={() => { setView('messages'); setMsgSidebarOpen(false); }}
        activeConversationId={activeConversationId}
        onSetActiveConversation={setActiveConversationId}
        onOpenMention={openMention}
        onOpenScoringFor={openScoringFor}
        onOpenUserProfile={openUserProfile}
      />

      {/* Shell snackbar — the census-A23 graceful fallback for stale mention
          links (toast + stay put; never the oracle's render crash). */}
      <ui-snackbar ref={snackRef}></ui-snackbar>

      {/* PEOPLE PANEL (sealed UserListPopup, Phase 13) — mounted at the shell
          so it opens over ANY view; rows open the user profile (census I6
          make-real) with "Send message" as the secondary action (J5). */}
      <UserListPopup
        open={usersPopupOpen}
        onClose={() => setUsersPopupOpen(false)}
        users={users}
        currentUserId={currentUser?.id}
        onMessage={messageUser}
        onOpenProfile={openUserProfile}
      />

      {/* PROFILE MENU (sealed exact labels/order/icons, App-shell box) —
          anchored at the RULED identity footer. "Settings" is the sealed
          manager-only entry (A9, live); "Messages" is live as of Phase 12
          (census A8); "View profile" is live as of Phase 13 (census A7 —
          the CURRENT user's own profile page); Log out arrives with the
          Login phase and stays honestly inert (make-real law). */}
      <ui-menu anchor="me-anchor" class="profile-menu">
        <ui-menu-item onClick={() => currentUser && openUserProfile(currentUser.id)}>
          <ui-icon slot="icon" size="sm">person</ui-icon>
          View profile
        </ui-menu-item>
        {/* Census A8 (Phase 12, REAL): ProfileMenu "Messages" → the full
            Messages page. */}
        <ui-menu-item onClick={() => { setView('messages'); setMsgSidebarOpen(false); }}>
          <ui-icon slot="icon" size="sm">chat</ui-icon>
          Messages
        </ui-menu-item>
        {currentUser?.role === 'manager' && (
          <ui-menu-item onClick={() => setView('settings')}>
            <ui-icon slot="icon" size="sm">build</ui-icon>
            Settings
          </ui-menu-item>
        )}
        <ui-divider></ui-divider>
        <ui-menu-item disabled title="Arrives with the Login phase">
          <ui-icon slot="icon" size="sm">logout</ui-icon>
          Log out
        </ui-menu-item>
      </ui-menu>

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
        {/* Sealed foot CTA (census A3/A18, REAL as of Phase 9): Setup page
            WITH the create modal open, via the first-class create seam.
            Sealed A3 renders it in ACCENT ink — token re-point on the host
            (the established vote-button pattern), never a literal. */}
        <ui-menu-item class="ws-menu-new" onClick={openSetupCreate}>
          <ui-icon slot="icon" size="sm">add</ui-icon>
          New workspace…
        </ui-menu-item>
      </ui-menu>
    </ui-app-shell>
  );
}
