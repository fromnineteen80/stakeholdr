// Main app shell - auth gate, brand row, fixed nav tabs, content, bottom workspace tabs.

import React, { useState, useEffect, useMemo } from 'react';
import { STAKEHOLDER_DATA } from './data';
import { displayName, formatDateLong, Icon, StatusPill } from './components';
import { uid, nowStamp, usePersistentState } from './store';
import { Avatar, UserStack, ProfileMenu, LoginView, EditProfileModal, MultiOwnerPicker, UserListPopup } from './users';
import { SheetView } from './sheet';
import { ScoringView } from './scoring';
import { MapView } from './map';
import { PlanView } from './plan';
import { CommunityView } from './community';
import { SetupView, SegmentBadge } from './setup';
import { HelpView } from './help';
import { MessagingPage, MessagingSidebar } from './messaging';
import { CommandPalette } from './palette';
import { IntelPanel } from './intel';
import { ProfilePage } from './profile-page';
import { SettingsView } from './settings';
import { SampleRecord } from './record';
import { StakeholderModal } from './sheet-modals';
import { useTweaks, TweaksPanel, TweakSection, TweakSlider, TweakToggle, TweakRadio, TweakColor } from './tweaks-panel';

const MASTER_ID = "__master";

// OpenWorkspaceModal - popped-up picker that lists every workspace and lets
// the user open one as a bottom tab, or create a brand-new workspace.
function OpenWorkspaceModal({ open, workspaces, openWorkspaceIds, stakeholders, stakeholderWorkspaces, onPick, onClose, onCreateNew }) {
  if (!open) return null;
  const D = STAKEHOLDER_DATA;
  const segments = Object.keys(D.SEGMENTS);
  return (
    <>
      <div className="modal-veil show" onClick={onClose} />
      <div className="modal" style={{ width: 560 }}>
        <div className="modal-head">
          <h2>Open a workspace</h2>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="modal-body open-ws-modal-body">
          {segments.map(seg => {
            const wsInSeg = workspaces.filter(w => w.segment === seg);
            if (!wsInSeg.length) return null;
            return (
              <div key={seg} className="open-ws-group">
                <div className="open-ws-group-head">
                  <SegmentBadge segment={seg} small />
                </div>
                <div className="open-ws-list">
                  {wsInSeg.map(w => {
                    const count = stakeholders.filter(s => (stakeholderWorkspaces[s.id] || []).includes(w.id)).length;
                    const isOpen = openWorkspaceIds.includes(w.id);
                    return (
                      <button
                        key={w.id}
                        className={"open-ws-item" + (isOpen ? " is-open" : "")}
                        onClick={() => onPick(w.id)}
                      >
                        <span className="open-ws-item-name">{w.name}</span>
                        <span className="open-ws-item-meta">{w.businessUnit} · {count} stakeholder{count===1?"":"s"}</span>
                        <span className="open-ws-item-cta">
                          {isOpen ? "Switch to" : "Open →"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={onCreateNew}>
            <Icon name="plus" /> Create new workspace
          </button>
        </div>
      </div>
    </>
  );
}

export function App() {
  const D = STAKEHOLDER_DATA;

  // ──── auth ────
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem("hp_map_user") || "null");
      // Auto-promote stored user to manager for demo purposes
      if (u && u.role !== "manager") u.role = "manager";
      return u;
    } catch { return null; }
  });
  // Shared user directory - persisted + realtime across tabs/users.
  const [users, setUsers] = usePersistentState("users", D.USERS);

  // Kept for call-site compatibility; users now persists through the Store.
  function persistUsers(next) { setUsers(next); }

  function logIn(u) {
    // For demo: ensure logging in always grants manager role so the user
    // can see Settings and configure the workspace.
    const promoted = { ...u, role: "manager" };
    setUsers(prev => prev.find(x => x.id === promoted.id)
      ? prev.map(x => x.id === promoted.id ? { ...x, role: "manager" } : x)
      : [...prev, promoted]);
    setCurrentUser(promoted);
    try { localStorage.setItem("hp_map_user", JSON.stringify(promoted)); } catch {}
  }
  function logOut() {
    setCurrentUser(null);
    try { localStorage.removeItem("hp_map_user"); } catch {}
  }

  if (!currentUser) return <LoginView onLogin={logIn} />;
  return <AppLoggedIn currentUser={currentUser} users={users} setUsers={setUsers} persistUsers={persistUsers} logOut={logOut} setCurrentUser={setCurrentUser} />;
}

function AppLoggedIn({ currentUser, users, setUsers, persistUsers, logOut, setCurrentUser }) {
  const D = STAKEHOLDER_DATA;
  const [appConfig, setAppConfig] = usePersistentState("appConfig", {
    appName: "Stakeholdr",
    accent: "#024AD8",
    brand: "#000000",
    fiscalStartMonth: 11,  // Nov
    fiscalStartDay: 1
  });
  function updateAppConfig(patch) {
    setAppConfig(prev => ({ ...(prev || {}), ...patch }));
  }
  const cfg = appConfig || {};
  const companyIssues = cfg.issues && cfg.issues.length ? cfg.issues : (D.ISSUES || []);
  const companyTags = cfg.tags && cfg.tags.length ? cfg.tags : (D.TAGS || []);
  const companyFunctions = cfg.functions && cfg.functions.length ? cfg.functions : (D.FUNCTIONS || []);
  const companySegments = (cfg.segments && Object.keys(cfg.segments).length) ? cfg.segments : D.SEGMENTS;
  const companyMarkets = (cfg.markets && Object.keys(cfg.markets).length) ? cfg.markets : D.MARKETS;
  const companySites = (cfg.sites && cfg.sites.length) ? cfg.sites : (D.SITES || []);
  const companyCategories = (cfg.categories && Object.keys(cfg.categories).length) ? cfg.categories : D.CATEGORIES;
  const companyGoals = (cfg.orgGoals && cfg.orgGoals.length) ? cfg.orgGoals : (D.ORG_GOALS || []);
  // Wire all app-wide dropdowns/columns that read D.CATEGORIES / D.SEGMENTS to
  // the manager-configured lists from Settings (single source of truth).
  D.CATEGORIES = companyCategories;
  D.SEGMENTS = companySegments;
  D.MARKETS = companyMarkets;
  D.SITES = companySites;
  D.ORG_GOALS = companyGoals;
  // Reconcile the session user with the shared directory (source of truth for
  // identity/appearance). Fixes any legacy divergence where the persisted
  // session color/name drifted from the users-array entry.
  useEffect(() => {
    const dirEntry = users.find(u => u.id === currentUser.id);
    if (dirEntry && JSON.stringify(dirEntry) !== JSON.stringify(currentUser)) {
      setCurrentUser(dirEntry);
      try { localStorage.setItem("hp_map_user", JSON.stringify(dirEntry)); } catch {}
    }
  }, [users]);
  useEffect(() => {
    document.documentElement.style.setProperty("--accent", cfg.accent || "#024AD8");
    document.documentElement.style.setProperty("--brand", cfg.brand || "#000000");
    document.title = cfg.appName || "Stakeholdr";
  }, [cfg.accent, cfg.brand, cfg.appName]);
  const [stakeholders, setStakeholders] = usePersistentState("stakeholders", D.STAKEHOLDERS);
  const [team, setTeam] = usePersistentState("team", D.TEAM);
  const [scores, setScores] = usePersistentState("scores", D.SEED_SCORES);
  const [workspaces, setWorkspaces] = usePersistentState("workspaces", D.WORKSPACES);
  const [stakeholderWorkspaces, setStakeholderWorkspaces] = usePersistentState("stakeholderWorkspaces", D.STAKEHOLDER_WORKSPACES);
  const [selectedId, setSelectedId] = useState(D.STAKEHOLDERS[0].id);
  const [detailId, setDetailId] = useState(null);

  // ──── messaging ────
  const [conversations, setConversations] = usePersistentState("conversations", D.CONVERSATIONS);
  const [messages, setMessages] = usePersistentState("messages", D.MESSAGES);
  const [community, setCommunity] = usePersistentState("community", D.COMMUNITY);
  const [plans, setPlans] = usePersistentState("plans", D.PLANS);
  const [msgSidebarOpen, setMsgSidebarOpen] = useState(false);
  // Explainer bar: open by default on these views, remembered per view.
  const [explainerOpen, setExplainerOpen] = useState({ sheet: true, plan: true, community: true, setup: true });
  const [explainerSlotEl, setExplainerSlotEl] = useState(null);
  const [activeConversationId, setActiveConversationId] = useState(null);

  // ──── profile / UI ────
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileUserId, setProfileUserId] = useState(null);
  const [pendingShId, setPendingShId] = useState(null);
  const [scoringProfileShId, setScoringProfileShId] = useState(null);
  useEffect(() => {
    const open = (e) => setScoringProfileShId(e.detail);
    window.addEventListener("open-stakeholder-profile", open);
    return () => window.removeEventListener("open-stakeholder-profile", open);
  }, []);
  const [paletteOpen, setPaletteOpen] = useState(false);
  function paletteGo(kind, id) {
    if (kind === "stakeholder") { setActiveWorkspaceId(MASTER_ID); setActiveView("sheet"); setPendingShId(id); }
    else if (kind === "plan") { window.__pendingPlanId = id; setActiveView("plan"); }
    else if (kind === "community") { window.__pendingCommunityId = id; setActiveView("community"); }
    else if (kind === "workspace") { openWorkspaceTab(id); }
    else if (kind === "user") { setProfileUserId(id); setActiveView("profile"); }
  }
  // Mention linking (@ stakeholders · / workspaces · # plans · $ community).
  useEffect(() => {
    window.__mentionSources = () => ({ stakeholders, workspaces, plans, community });
    window.__openMention = (type, id) => {
      if (type === "stk") paletteGo("stakeholder", id);
      else if (type === "wsp") paletteGo("workspace", id);
      else if (type === "pln") paletteGo("plan", id);
      else if (type === "cmy") paletteGo("community", id);
    };
  });
  const [usersPopupOpen, setUsersPopupOpen] = useState(false);
  const [editWorkspaceId, setEditWorkspaceId] = useState(null);
  const [newWsModalOpen, setNewWsModalOpen] = useState(false);

  // ──── tab + workspace navigation ────
  const [openWorkspaceIds, setOpenWorkspaceIds] = useState([MASTER_ID, "ws-gapp-na", "ws-gapp-emea"]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(MASTER_ID);
  const [activeView, setActiveView] = useState("sheet"); // sheet|scoring|map|setup|help|messages
  // List-bar "+" create signal: bumped per active view to open that view's create flow.
  const [addNonce, setAddNonce] = useState(0);
  const [addNonceFor, setAddNonceFor] = useState(null);
  const [intelMode, setIntelMode] = useState("split"); // split | intel | table
  const [wsMenuOpen, setWsMenuOpen] = useState(false);
  const [scaffoldMenuOpen, setScaffoldMenuOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [openWsModalOpen, setOpenWsModalOpen] = useState(false);
  const [tabsExpanded, setTabsExpanded] = useState(false); // stacked vs spread

  // ──── tweaks ────
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "mapStyle": "halo",
    "showLabels": false,
    "showZoneLabels": true,
    "dotSize": 22,
    "accent": "#024AD8"
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // ──── derived ────
  const isMaster = activeWorkspaceId === MASTER_ID;
  const VIEWS_WITH_EXPLAINER = ["sheet", "scoring", "map", "plan", "community", "setup", "help", "settings", "record-sample"];
  const hasExplainer = VIEWS_WITH_EXPLAINER.includes(activeView) && !(activeView === "scoring" && isMaster);
  const isExplainerOpen = !!explainerOpen[activeView];
  function toggleExplainer() { setExplainerOpen(o => ({ ...o, [activeView]: !o[activeView] })); }
  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId);
  const workspaceLabel = isMaster ? "Master · All stakeholders" : (activeWorkspace?.name || "-");
  const visibleStakeholders = useMemo(() => {
    if (isMaster) return stakeholders;
    return stakeholders.filter(s => (stakeholderWorkspaces[s.id] || []).includes(activeWorkspaceId));
  }, [stakeholders, stakeholderWorkspaces, activeWorkspaceId, isMaster]);

  function getWorkspacesForStakeholder(shId) {
    return (stakeholderWorkspaces[shId] || [])
      .map(wid => workspaces.find(w => w.id === wid))
      .filter(Boolean);
  }

  // A stakeholder is "unscored" by the *current user* if there is no score
  // from their matching team-member id yet (or that score is missing).
  const currentTeamMember = team.find(m => m.userId === currentUser.id);
  function isUnscoredBy(stakeholderId, teamMemberId) {
    if (!teamMemberId) return false;
    const sc = (scores[stakeholderId] || {})[teamMemberId];
    return !sc;
  }
  // Across all open workspaces, how many stakeholders need scoring from
  // the current user? (Stakeholders without a score record from them.)
  const unscoredCount = useMemo(() => {
    if (!currentTeamMember) return 0;
    return stakeholders.filter(s => isUnscoredBy(s.id, currentTeamMember.id)).length;
  }, [stakeholders, scores, currentTeamMember]);

  // Inbox unread = system pending + actual message count
  const unreadCount = unscoredCount > 0 ? unscoredCount : 0;

  // ──── updaters ────
  function deleteStakeholder(id) {
    setStakeholders(prev => prev.filter(s => s.id !== id));
    setScores(prev => { const n = { ...prev }; delete n[id]; return n; });
    setStakeholderWorkspaces(prev => { const n = { ...prev }; delete n[id]; return n; });
  }
  function updateStakeholder(id, patch) {
    setStakeholders(prev => prev.map(s => s.id === id ? { ...s, ...patch, updatedAt: nowStamp() } : s));
  }
  function updateScore(shId, tmId, val) {
    setScores(prev => {
      const existing = (prev[shId] || {})[tmId];
      const now = nowStamp();
      const merged = {
        x: val.x, y: val.y,
        createdAt: existing && existing.createdAt ? existing.createdAt : now,  // first score
        updatedAt: now                                                          // every change
      };
      return { ...prev, [shId]: { ...(prev[shId] || {}), [tmId]: merged } };
    });
  }
  function updateTeam(tmId, patch) {
    setTeam(prev => prev.map(m => m.id === tmId ? { ...m, ...patch, updatedAt: nowStamp() } : m));
  }
  function addTeamMember(userId) {
    if (!userId) return;
    // Guard: skip if this user is already on the team.
    if (team.find(m => m.userId === userId)) return;
    const id = uid("tm");
    setTeam(prev => [...prev, { id, userId, weight: 1.0, createdAt: nowStamp(), updatedAt: nowStamp() }]);
  }
  function removeTeamMember(tmId) {
    setTeam(prev => prev.filter(m => m.id !== tmId));
    setScores(prev => {
      const next = {};
      for (const sh of Object.keys(prev)) {
        const row = { ...prev[sh] }; delete row[tmId]; next[sh] = row;
      }
      return next;
    });
  }
  function addWorkspace(data) {
    const id = uid("ws");
    const ws = data ? { id, ...data, createdBy: currentUser.id, createdAt: data.createdAt || new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString().slice(0, 10) }
                    : {
                        id, name: "New workspace",
                        segment: "Corporate Functions",
                        businessUnit: "Legal / GA&PP",
                        owners: [currentUser.id],
                        createdBy: currentUser.id,
                        createdAt: new Date().toISOString().slice(0, 10)
                      };
    setWorkspaces(prev => [...prev, ws]);
    openWorkspaceTab(id);
    return id;
  }
  function updateWorkspace(wsId, patch) {
    setWorkspaces(prev => prev.map(w => w.id === wsId ? { ...w, ...patch, updatedAt: nowStamp() } : w));
  }
  function removeWorkspace(wsId) {
    setWorkspaces(prev => prev.filter(w => w.id !== wsId));
    setStakeholderWorkspaces(prev => {
      const next = {};
      for (const k of Object.keys(prev)) next[k] = (prev[k] || []).filter(w => w !== wsId);
      return next;
    });
    // Cascade: remove plans tied to this workspace.
    setPlans(prev => prev.filter(pl => pl.workspaceId !== wsId));
    setOpenWorkspaceIds(prev => prev.filter(id => id !== wsId));
    if (activeWorkspaceId === wsId) setActiveWorkspaceId(MASTER_ID);
  }
  // Remove a user from the directory and scrub every reference to them.
  function removeUser(userId) {
    setUsers(prev => prev.filter(u => u.id !== userId));
    setWorkspaces(prev => prev.map(w => ({ ...w, owners: (w.owners || []).filter(o => o !== userId) })));
    setStakeholders(prev => prev.map(s => ({ ...s, owners: (s.owners || []).filter(o => o !== userId) })));
    setCommunity(prev => prev.map(c => {
      const votes = { ...(c.votes || {}) }; delete votes[userId];
      return { ...c, owners: (c.owners || []).filter(o => o !== userId), votes };
    }));
    setPlans(prev => prev.map(pl => ({
      ...pl,
      owners: (pl.owners || []).filter(o => o !== userId),
      team: (pl.team || []).filter(t => t.userId !== userId),
      strategies: (pl.strategies || []).map(s => s.ownerId === userId ? { ...s, ownerId: "" } : s)
    })));
    setTeam(prev => prev.filter(t => t.userId !== userId));
  }
  // ONE editable community card everywhere: this upserter is shared by the
  // Community page and the stakeholder-profile drill.
  function updateCommunityApp(app) {
    const stamped = { ...app, updatedAt: nowStamp() };
    setCommunity(prev => {
      const i = prev.findIndex(a => a.id === stamped.id);
      if (i === -1) return [stamped, ...prev];
      const next = [...prev]; next[i] = stamped; return next;
    });
  }

  // One plan per workspace; upsert by workspaceId.
  function updatePlan(plan) {
    setPlans(prev => {
      const i = prev.findIndex(pl => pl.id === plan.id);
      if (i === -1) return [...prev, plan];
      const next = [...prev]; next[i] = plan; return next;
    });
  }
  function deletePlan(id) {
    setPlans(prev => prev.filter(pl => pl.id !== id));
  }
  // Guard: if the selected stakeholder was deleted, fall back to the first one.
  useEffect(() => {
    if (selectedId && !stakeholders.find(s => s.id === selectedId)) {
      setSelectedId(stakeholders[0] ? stakeholders[0].id : null);
    }
    if (detailId && !stakeholders.find(s => s.id === detailId)) setDetailId(null);
  }, [stakeholders]);

  function addStakeholder(data, forceWorkspaceId) {
    const id = uid("sh");
    const ws = forceWorkspaceId || (isMaster ? null : activeWorkspaceId);
    const sh = {
      id, ...data,
      createdBy: currentUser.id,
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      owners: (data.owners && data.owners.length) ? data.owners : [currentUser.id]
    };
    setStakeholders(prev => [sh, ...prev]);
    if (ws) {
      setStakeholderWorkspaces(prev => ({ ...prev, [id]: [ws] }));
    } else {
      setStakeholderWorkspaces(prev => ({ ...prev, [id]: [] }));
    }
    // Post a system notification about the new unscored stakeholder
    const text = `New stakeholder added: ${data.name} (${data.type}). Please score them on the Scoring tab.`;
    setMessages(prev => ({
      ...prev,
      ["c-system"]: [
        ...(prev["c-system"] || []),
        { id: uid("m"), from: "u-system", body: text, at: new Date().toISOString(), kind: "scoring-needed" }
      ]
    }));
    return id;
  }
  function updateCoordForStakeholder(id, targetX, targetY) {
    setScores(prev => {
      const cur = D.weightedCoord(id, prev, team);
      const dx = targetX - cur.x;
      const dy = targetY - cur.y;
      const next = { ...prev, [id]: { ...(prev[id] || {}) } };
      for (const m of team) {
        const sc = next[id][m.id] || { x: 0, y: 0 };
        next[id][m.id] = {
          x: clampNum(sc.x + dx, -10, 10),
          y: clampNum(sc.y + dy, -10, 10),
          createdAt: sc.createdAt || nowStamp(),
          updatedAt: nowStamp()
        };
      }
      return next;
    });
  }

  // ──── workspace tab actions ────
  function openWorkspaceTab(wsId) {
    setOpenWorkspaceIds(prev => prev.includes(wsId) ? prev : [...prev, wsId]);
    setActiveWorkspaceId(wsId);
    setActiveView("sheet");
  }
  function closeWorkspaceTab(wsId, e) {
    if (e) e.stopPropagation();
    if (wsId === MASTER_ID) return;
    const idx = openWorkspaceIds.indexOf(wsId);
    const remaining = openWorkspaceIds.filter(id => id !== wsId);
    setOpenWorkspaceIds(remaining);
    if (activeWorkspaceId === wsId) {
      const newActive = remaining[Math.max(0, idx - 1)] || MASTER_ID;
      setActiveWorkspaceId(newActive);
      setActiveView("sheet");
    }
  }
  function activateWorkspaceTab(wsId) {
    setActiveWorkspaceId(wsId);
    setActiveView("sheet");
  }

  // ──── messaging ────
  function sendMessage(conversationId, body) {
    const newMsg = {
      id: uid("m"),
      from: currentUser.id,
      body,
      at: new Date().toISOString()
    };
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMsg]
    }));
  }
  function startConversation(participantIds, title) {
    // Ensure current user is a participant
    const participants = [...new Set([currentUser.id, ...participantIds])];
    // For DMs, dedupe by participant pair
    const kind = participants.length > 2 ? "group" : "direct";
    if (kind === "direct") {
      const existing = conversations.find(c =>
        c.kind === "direct" &&
        c.participants.length === 2 &&
        participants.every(p => c.participants.includes(p))
      );
      if (existing) return existing.id;
    }
    const id = uid("c");
    setConversations(prev => [...prev, { id, kind, participants, title }]);
    setMessages(prev => ({ ...prev, [id]: [] }));
    return id;
  }
  function messageUser(userId) {
    const id = startConversation([userId], null);
    setActiveConversationId(id);
    setUsersPopupOpen(false);
    setMsgSidebarOpen(true);
  }

  // ──── detail drawer ────
  function openDetail(id) { setSelectedId(id); setDetailId(id); }
  const detailStakeholder = detailId
    ? (() => {
        const s = stakeholders.find(x => x.id === detailId);
        if (!s) return null;
        const wc = D.weightedCoord(s.id, scores, team);
        return { ...s, _x: wc.x, _y: wc.y, _status: D.statusFor(wc.x, wc.y) };
      })()
    : null;

  const NAV_TABS = [
    { id: "sheet",   label: "Lists",       icon: "table" },
    { id: "scoring", label: "Scoring",     icon: "sliders", hideWhenMaster: true },
    { id: "map",     label: "Map",         icon: "target" },
    { id: "plan",    label: "Plans",       icon: "plan" },
    { id: "community", label: "Community", icon: "community" },
    { id: "setup",   label: "Workspaces",  icon: "work" },
    { id: "help",    label: "Help",        icon: "help" }
  ];
  const visibleNavTabs = NAV_TABS.filter(t => !(t.hideWhenMaster && isMaster));

  // If we're on Master and currently on Scoring, kick to Map.
  useEffect(() => {
    if (isMaster && activeView === "scoring") setActiveView("map");
  }, [isMaster, activeView]);

  useEffect(() => {
    function onDoc(e) {
      if (wsMenuOpen && !e.target.closest(".ws-selector")) setWsMenuOpen(false);
      if (scaffoldMenuOpen && !e.target.closest(".scaffold-selector")) setScaffoldMenuOpen(false);
      if (addMenuOpen && !e.target.closest(".ws-tab-add")) setAddMenuOpen(false);
      if (profileMenuOpen && !e.target.closest(".profile-button")) setProfileMenuOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [wsMenuOpen, addMenuOpen, profileMenuOpen]);

  // Global ⌘K / Ctrl+K: open the universal command palette.
  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault(); setPaletteOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const unopenedWorkspaces = workspaces.filter(w => !openWorkspaceIds.includes(w.id));

  // Other online users (presence-only, current user + automated bots excluded)
  const otherUsers = users.filter(u => u.id !== currentUser.id && u.role !== "system");

  // ─── Workspace tabs ───
  // When "collapsed" (tabsExpanded === false) and more than just Master is
  // open, hide the non-Master tabs entirely and surface a double-right arrow
  // to expand. tabsExpanded === true shows them all.
  const isStacked = openWorkspaceIds.length > 1 && !tabsExpanded;

  return (
    <div className="app">
      {/* Row 1: Brand bar */}
      <div className="brand-bar">
        <div className="brand" onClick={() => { setActiveWorkspaceId(MASTER_ID); setActiveView("sheet"); }} style={{ cursor: "pointer" }} title="Home — Master">
          <div className="brand-mark">
            {cfg.brandIcon ? (
              <img src={cfg.brandIcon} alt="App icon" className="brand-mark-img" />
            ) : (
              <Icon name="brandmark" className="brand-glyph" />
            )}
          </div>
          <div className="brand-name">{cfg.appName || "Stakeholdr"}</div>
        </div>

        <div className="ws-selector" onClick={() => setWsMenuOpen(o => !o)}>
          {isMaster ? (
            <>
              <span className="ws-selector-kind">All</span>
              <span className="ws-selector-name">Master</span>
            </>
          ) : (
            <>
              <SegmentBadge segment={activeWorkspace.segment} small />
              <span className="ws-selector-name" style={{ marginLeft: 6 }}>{activeWorkspace.name}</span>
              <span className="muted" style={{ fontSize: 10.5, marginLeft: 6 }}>{activeWorkspace.businessUnit}</span>
            </>
          )}
          <Icon name="chevron" className="ico ws-selector-caret" />
          {wsMenuOpen && (
            <div className="ws-menu" onClick={e => e.stopPropagation()}>
              {workspaces.map(w => {
                return (
                  <div key={w.id} className={"ws-menu-item" + (w.id === activeWorkspaceId ? " active" : "")} onClick={() => { openWorkspaceTab(w.id); setWsMenuOpen(false); }}>
                    <span className="nm">{w.name}</span>
                    <span className="sub">{w.segment}</span>
                  </div>
                );
              })}
              <div className="ws-menu-divider" />
              <div className="ws-menu-item" onClick={() => { setActiveView("setup"); setNewWsModalOpen(true); setWsMenuOpen(false); }} style={{ color: "var(--accent)" }}>
                <span className="nm">+ New workspace…</span>
              </div>
            </div>
          )}
        </div>

        <div className="brand-spacer" />

        <div className="ws-selector scaffold-selector" onClick={() => setScaffoldMenuOpen(o => !o)} title="Dev: record scaffolds">
          <span className="ws-selector-kind">Dev</span>
          <span className="ws-selector-name">Scaffolds</span>
          <Icon name="chevron" className="ico ws-selector-caret" />
          {scaffoldMenuOpen && (
            <div className="ws-menu" onClick={e => e.stopPropagation()}>
              <div className={"ws-menu-item" + (activeView === "record-sample" ? " active" : "")} onClick={() => { setActiveView("record-sample"); setScaffoldMenuOpen(false); }}>
                <span className="nm">Sample record</span>
                <span className="sub">read + edit shell</span>
              </div>
            </div>
          )}
        </div>

        <div className="utility-cluster">
          <span className="muted" style={{ fontSize: 11 }}>Saved · 1m ago</span>

          {/* Stacked other users */}
          <UserStack users={users} currentUserId={currentUser.id} max={3} onClick={() => setUsersPopupOpen(true)} size={22} />

          {/* Profile button */}
          <div className="profile-button" onClick={() => setProfileMenuOpen(o => !o)}>
            <Avatar user={currentUser} size={26} ring />
            <ProfileMenu
              open={profileMenuOpen}
              user={currentUser}
              isManager={currentUser.role === "manager"}
              onClose={() => setProfileMenuOpen(false)}
              onEditProfile={() => { setProfileUserId(currentUser.id); setActiveView("profile"); setProfileMenuOpen(false); }}
              onMessages={() => { setActiveView("messages"); setProfileMenuOpen(false); }}
              onSettings={() => { setActiveView("settings"); setProfileMenuOpen(false); }}
              onLogOut={logOut}
            />
          </div>

          {/* Profile menu lives top-right; messages moved to the list bar */}
        </div>
      </div>

      {/* Row 2: Fixed nav tabs */}
      <div className="nav-tabs">
        {visibleNavTabs.map(t => (
          <button
            key={t.id}
            className={"tab" + (activeView === t.id ? " active" : "")}
            onClick={() => setActiveView(t.id)}
            data-screen-label={t.label}
          >
            <Icon name={t.icon} />
            {t.label}
            {t.id === "scoring" && unscoredCount > 0 && <span className="count count-alert">{unscoredCount}</span>}
          </button>
        ))}
        <div className="nav-tabs-spacer" />
        {hasExplainer && (
          <button
            className="nav-tabs-right-button"
            title={isExplainerOpen ? "Hide info" : "Show info"}
            aria-label={isExplainerOpen ? "Hide info" : "Show info"}
            onClick={toggleExplainer}
          >
            <Icon name={isExplainerOpen ? "expand_less" : "expand_more"} />
          </button>
        )}
        {["sheet", "scoring", "plan", "community", "setup"].includes(activeView) && (
          <button
            className="nav-tabs-right-button"
            title="Create new"
            aria-label="Create new"
            onClick={() => {
              if (activeView === "setup") { setNewWsModalOpen(true); }
              else { setAddNonceFor(activeView); setAddNonce(n => n + 1); }
            }}
          >
            <Icon name="plus" />
          </button>
        )}
        <button
          className="nav-tabs-right-button"
          title="Messages"
          aria-label="Messages"
          onClick={() => setMsgSidebarOpen(o => !o)}
        >
          <Icon name="message" />
          {unreadCount > 0 && <span className="msg-badge">{unreadCount}</span>}
        </button>
      </div>

      {activeView === "scoring" && !isMaster && isExplainerOpen && (
        <div className="scoring-explainer-bar">
          <p className="scoring-intro">
            Teammates score each stakeholder from −10 to +10 on two dimensions. The <strong>x score is impact</strong> on the business and the <strong>y score is influence</strong> in the community.
          </p>
        </div>
      )}

      {activeView === "setup" && isExplainerOpen && (
        <div className="scoring-explainer-bar explainer-controls" ref={setExplainerSlotEl} />
      )}

      {activeView === "map" && isExplainerOpen && (
        <div className="scoring-explainer-bar">
          <p className="scoring-intro">
            Each dot is a stakeholder placed by their team scores: left–right is impact on the business, bottom–top is influence in the community. Drag a dot to reposition it, or click one to open its scorecard.
          </p>
        </div>
      )}

      {activeView === "help" && isExplainerOpen && (
        <div className="scoring-explainer-bar">
          <p className="scoring-intro">Share code coming soon.</p>
        </div>
      )}

      {activeView === "record-sample" && isExplainerOpen && (
        <div className="scoring-explainer-bar">
          <p className="scoring-intro"></p>
        </div>
      )}

      {activeView === "settings" && isExplainerOpen && (
        <div className="scoring-explainer-bar">
          <p className="scoring-intro">Manager-only configuration for your organization. Changes apply to everyone.</p>
        </div>
      )}

      {["sheet", "plan", "community"].includes(activeView) && isExplainerOpen && (
        <div className="scoring-explainer-bar explainer-controls" ref={setExplainerSlotEl} />
      )}

      {/* Row 3: Workspace content */}
      <div className={"workspace" + (hasExplainer && isExplainerOpen ? " has-explainer" : "")}>
        {activeView === "sheet" && !isMaster && (
        <div className="intel-split" data-mode={intelMode}>
          <IntelPanel
            mode={intelMode}
            setMode={setIntelMode}
            stakeholders={visibleStakeholders}
            scores={scores}
            team={team}
            community={community}
            plans={plans}
            currentUser={currentUser}
            isMaster={isMaster}
            workspaceLabel={workspaceLabel}
            workspaceId={activeWorkspaceId}
            onAddStakeholder={() => { setAddNonceFor("sheet"); setAddNonce(n => n + 1); }}
          />
          <SheetView
            explainerSlot={isExplainerOpen ? explainerSlotEl : null}
            addNonce={addNonce}
            addNonceFor={addNonceFor}
            openStakeholderId={pendingShId}
            onConsumeOpen={() => setPendingShId(null)}
            stakeholders={visibleStakeholders}
            scores={scores}
            team={team}
            updateStakeholder={updateStakeholder}
            openDetail={openDetail}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            workspaceLabel={workspaceLabel}
            isMaster={isMaster}
            getWorkspacesForStakeholder={getWorkspacesForStakeholder}
            workspaces={workspaces}
            users={users}
            addStakeholder={addStakeholder}
            currentUser={currentUser}
            companyIssues={companyIssues}
            companyTags={companyTags}
            community={community}
            updateCommunityApp={updateCommunityApp}
            onOpenWorkspace={(id) => openWorkspaceTab(id)}
          />
        </div>
        )}
        {activeView === "sheet" && isMaster && (
          <SheetView
            explainerSlot={isExplainerOpen ? explainerSlotEl : null}
            addNonce={addNonce}
            addNonceFor={addNonceFor}
            openStakeholderId={pendingShId}
            onConsumeOpen={() => setPendingShId(null)}
            stakeholders={visibleStakeholders}
            scores={scores}
            team={team}
            updateStakeholder={updateStakeholder}
            openDetail={openDetail}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            workspaceLabel={workspaceLabel}
            isMaster={isMaster}
            getWorkspacesForStakeholder={getWorkspacesForStakeholder}
            workspaces={workspaces}
            users={users}
            addStakeholder={addStakeholder}
            currentUser={currentUser}
            companyIssues={companyIssues}
            companyTags={companyTags}
            community={community}
            updateCommunityApp={updateCommunityApp}
            onOpenWorkspace={(id) => openWorkspaceTab(id)}
          />
        )}
        {activeView === "scoring" && (
          <ScoringView
            addNonce={addNonce}
            addNonceFor={addNonceFor}
            addStakeholder={addStakeholder}
            workspaces={workspaces}
            companyIssues={companyIssues}
            companyTags={companyTags}
            community={community}
            stakeholders={visibleStakeholders}
            scores={scores}
            team={team}
            updateScore={updateScore}
            updateTeam={updateTeam}
            addTeamMember={addTeamMember}
            removeTeamMember={removeTeamMember}
            workspaceLabel={workspaceLabel}
            users={users}
            currentUser={currentUser}
            workspaceOwners={(activeWorkspace && activeWorkspace.owners) || []}
            onDeleteWorkspace={isMaster ? null : () => removeWorkspace(activeWorkspaceId)}
          />
        )}
        {activeView === "map" && (
          <MapView
            stakeholders={visibleStakeholders}
            scores={scores}
            team={team}
            updateCoordForStakeholder={updateCoordForStakeholder}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            openDetail={openDetail}
            tweaks={tweaks}
            workspaceLabel={workspaceLabel}
            users={users}
          />
        )}
        {activeView === "plan" && (
          <PlanView
            explainerSlot={isExplainerOpen ? explainerSlotEl : null}
            addNonce={addNonce}
            addNonceFor={addNonceFor}
            plans={plans}
            updatePlan={updatePlan}
            deletePlan={deletePlan}
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            workspaceLabel={workspaceLabel}
            isMaster={isMaster}
            stakeholders={stakeholders}
            scores={scores}
            team={team}
            stakeholderWorkspaces={stakeholderWorkspaces}
            setStakeholderWorkspaces={setStakeholderWorkspaces}
            addStakeholder={addStakeholder}
            updateStakeholder={updateStakeholder}
            getWorkspacesForStakeholder={getWorkspacesForStakeholder}
            updateCommunityApp={updateCommunityApp}
            onOpenWorkspace={(id) => openWorkspaceTab(id)}
            users={users}
            community={community}
            companyIssues={companyIssues}
            currentUser={currentUser}
          />
        )}
        {activeView === "community" && (
          <CommunityView
            explainerSlot={isExplainerOpen ? explainerSlotEl : null}
            addNonce={addNonce}
            addNonceFor={addNonceFor}
            community={community}
            setCommunity={setCommunity}
            appConfig={appConfig}
            stakeholders={stakeholders}
            users={users}
            currentUser={currentUser}
            companyIssues={companyIssues}
            workspaceLabel={workspaceLabel}
            isMaster={isMaster}
            scores={scores}
            team={team}
            getWorkspacesForStakeholder={getWorkspacesForStakeholder}
            updateCommunityApp={updateCommunityApp}
          />
        )}
        {activeView === "setup" && (
          <SetupView
            companySegments={companySegments}
            workspaces={workspaces}
            addWorkspace={addWorkspace}
            updateWorkspace={updateWorkspace}
            removeWorkspace={removeWorkspace}
            stakeholders={stakeholders}
            stakeholderWorkspaces={stakeholderWorkspaces}
            setStakeholderWorkspaces={setStakeholderWorkspaces}
            activeWorkspaceId={activeWorkspaceId}
            setActiveWorkspaceId={(id) => openWorkspaceTab(id)}
            users={users}
            currentUser={currentUser}
            editWorkspaceId={editWorkspaceId}
            setEditWorkspaceId={setEditWorkspaceId}
            createOpen={newWsModalOpen}
            setCreateOpen={setNewWsModalOpen}
            explainerSlot={isExplainerOpen ? explainerSlotEl : null}
          />
        )}
        {activeView === "help" && <HelpView />}
        {activeView === "record-sample" && <SampleRecord />}
        {activeView === "profile" && (
          <ProfilePage
            user={users.find(u => u.id === profileUserId) || currentUser}
            isSelf={(profileUserId || currentUser.id) === currentUser.id}
            currentUser={currentUser}
            users={users}
            workspaces={workspaces}
            plans={plans}
            community={community}
            stakeholders={stakeholders}
            scores={scores}
            team={team}
            stakeholderWorkspaces={stakeholderWorkspaces}
            getWorkspacesForStakeholder={getWorkspacesForStakeholder}
            onEdit={() => setEditProfileOpen(true)}
            onOpenWorkspace={(id) => openWorkspaceTab(id)}
            onOpenPlan={(id) => { window.__pendingPlanId = id; setActiveView("plan"); }}
            onOpenCommunity={(id) => { window.__pendingCommunityId = id; setActiveView("community"); }}
            onOpenStakeholder={(id) => { setActiveWorkspaceId(MASTER_ID); setActiveView("sheet"); setPendingShId(id); }}
          />
        )}
        {activeView === "settings" && currentUser.role === "manager" && (
          <SettingsView
            users={users}
            currentUser={currentUser}
            appConfig={appConfig}
            updateAppConfig={updateAppConfig}
            updateUserRole={(userId, role) => {
              setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
            }}
            companyIssues={companyIssues}
            updateCompanyIssues={(next) => updateAppConfig({ issues: next })}
            companyTags={companyTags}
            updateCompanyTags={(next) => updateAppConfig({ tags: next })}
            companyFunctions={companyFunctions}
            updateCompanyFunctions={(next) => updateAppConfig({ functions: next })}
            companySegments={companySegments}
            updateCompanySegments={(next) => updateAppConfig({ segments: next })}
            companyMarkets={companyMarkets}
            updateCompanyMarkets={(next) => updateAppConfig({ markets: next })}
            companySites={companySites}
            updateCompanySites={(next) => updateAppConfig({ sites: next })}
            companyCategories={companyCategories}
            updateCompanyCategories={(next) => updateAppConfig({ categories: next })}
            companyGoals={companyGoals}
            updateCompanyGoals={(next) => updateAppConfig({ orgGoals: next })}
          />
        )}
        {activeView === "messages" && (
          <MessagingPage
            conversations={conversations}
            messages={messages}
            users={users}
            currentUserId={currentUser.id}
            activeConversationId={activeConversationId}
            setActiveConversationId={setActiveConversationId}
            sendMessage={sendMessage}
            startConversation={startConversation}
          />
        )}
      </div>

      {/* Row 4: Workspace tab strip (always shows all, visually stacks when many) */}
      <div className="ws-tab-bar">
        <div
          className={"ws-tab-stack" + (isStacked ? " stacked" : " expanded")}
        >
          {isStacked
            ? renderTab(MASTER_ID, 0, true)
            : openWorkspaceIds.map((id, i) => renderTab(id, i, isStacked))}
        </div>

        {openWorkspaceIds.length > 1 && (
          <button
            className="ws-fan-toggle"
            onClick={() => setTabsExpanded(e => !e)}
            title={tabsExpanded ? "Collapse open workspaces" : "Expand to see open workspaces"}
            aria-label={tabsExpanded ? "Collapse" : "Expand"}
          >
            {tabsExpanded ? (
              <Icon name="double-left" className="ico" />
            ) : (
              <Icon name="double-right" className="ico" />
            )}
          </button>
        )}

        <button className="ws-tab-add" onClick={() => setOpenWsModalOpen(true)}>
          <Icon name="plus" className="ico" />
          Open workspace
        </button>

        <div className="ws-tab-bar-spacer" />

        <div className="ws-tab-meta">
          <span>Updated {formatDateLong(
            (isMaster
              ? [...stakeholders.map(s => s.updatedAt || s.createdAt), ...workspaces.map(w => w.updatedAt || w.createdAt)].filter(Boolean).sort().slice(-1)[0]
              : (activeWorkspace && (activeWorkspace.updatedAt || activeWorkspace.createdAt))) || null
          )}</span>
        </div>
      </div>

      {/* Open workspace picker modal */}
      <OpenWorkspaceModal
        open={openWsModalOpen}
        workspaces={workspaces}
        openWorkspaceIds={openWorkspaceIds}
        stakeholders={stakeholders}
        stakeholderWorkspaces={stakeholderWorkspaces}
        onPick={(wsId) => { openWorkspaceTab(wsId); setOpenWsModalOpen(false); }}
        onClose={() => setOpenWsModalOpen(false)}
        onCreateNew={() => { setOpenWsModalOpen(false); setNewWsModalOpen(true); setActiveView("setup"); }}
      />

      {/* Universal command palette (⌘K) */}
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        stakeholders={stakeholders}
        plans={plans}
        community={community}
        workspaces={workspaces}
        users={users}
        onGo={paletteGo}
      />

      {scoringProfileShId && (() => {
        const sh = stakeholders.find(x => x.id === scoringProfileShId);
        if (!sh) return null;
        return (
          <StakeholderModal
            users={users}
            workspaces={workspaces}
            isMaster={isMaster}
            currentUser={currentUser}
            existing={sh}
            initialView
            companyIssues={companyIssues}
            companyTags={companyTags}
            community={community}
            stakeholders={stakeholders}
            scores={scores}
            team={team}
            getWorkspacesForStakeholder={getWorkspacesForStakeholder}
            updateCommunityApp={updateCommunityApp}
            onOpenWorkspace={(id) => openWorkspaceTab(id)}
            onDelete={() => { deleteStakeholder(sh.id); setScoringProfileShId(null); }}
            onCancel={() => setScoringProfileShId(null)}
            onSubmit={(patch) => { updateStakeholder(sh.id, patch); setScoringProfileShId(null); }}
          />
        );
      })()}

      {/* Edit profile modal */}
      <EditProfileModal
        open={editProfileOpen}
        user={currentUser}
        companyFunctions={companyFunctions}
        onClose={() => setEditProfileOpen(false)}
        onSave={(next) => {
          setCurrentUser(next);
          try { localStorage.setItem("hp_map_user", JSON.stringify(next)); } catch {}
          setUsers(prev => prev.map(u => u.id === next.id ? { ...u, ...next, updatedAt: nowStamp() } : u));
          setEditProfileOpen(false);
        }}
      />

      {/* Users popup */}
      <UserListPopup
        open={usersPopupOpen}
        onClose={() => setUsersPopupOpen(false)}
        users={users}
        currentUserId={currentUser.id}
        onMessage={messageUser}
      />

      {/* Messaging sidebar */}
      <MessagingSidebar
        open={msgSidebarOpen}
        onClose={() => setMsgSidebarOpen(false)}
        conversations={conversations}
        messages={messages}
        users={users}
        currentUserId={currentUser.id}
        activeConversationId={activeConversationId}
        setActiveConversationId={setActiveConversationId}
        sendMessage={sendMessage}
        onOpenPage={() => { setActiveView("messages"); setMsgSidebarOpen(false); }}
      />

      {/* Detail drawer */}
      <div className={"drawer-veil" + (detailId ? " show" : "")} onClick={() => setDetailId(null)} />
      <div className={"drawer" + (detailId ? " show" : "")}>
        {detailStakeholder && (
          <>
            <div className="drawer-head">
              <h2>{displayName(detailStakeholder) || detailStakeholder.name}</h2>
              <StatusPill status={detailStakeholder._status} />
              <button className="btn btn-ghost" onClick={() => setDetailId(null)} aria-label="Close"><Icon name="close" /></button>
            </div>
            <div className="drawer-body">
              <div className="drawer-section">
                <h4>Identity</h4>
                <div className="detail-row"><div className="k">Organization</div><div className="v"><input value={detailStakeholder.org} onChange={e=>updateStakeholder(detailStakeholder.id,{org:e.target.value})} /></div></div>
                <div className="detail-row"><div className="k">Category</div><div className="v">
                  <select value={detailStakeholder.category} onChange={e=>updateStakeholder(detailStakeholder.id,{category:e.target.value, type: (D.CATEGORIES[e.target.value]||[])[0]||""})}>
                    {Object.keys(D.CATEGORIES).map(c=><option key={c}>{c}</option>)}
                  </select>
                </div></div>
                <div className="detail-row"><div className="k">Type</div><div className="v">
                  <select value={detailStakeholder.type} onChange={e=>updateStakeholder(detailStakeholder.id,{type:e.target.value})}>
                    {(D.CATEGORIES[detailStakeholder.category]||[]).map(t=><option key={t}>{t}</option>)}
                  </select>
                </div></div>
                <div className="detail-row"><div className="k">Region</div><div className="v" style={{ display: "flex", gap: 4 }}>
                  <select value={detailStakeholder.market} onChange={e=>{
                    const m = e.target.value;
                    updateStakeholder(detailStakeholder.id, { market: m, region: (D.MARKETS[m]||[])[0]||"" });
                  }}>
                    {Object.keys(D.MARKETS).map(m=><option key={m}>{m}</option>)}
                  </select>
                  <select value={detailStakeholder.region} onChange={e=>updateStakeholder(detailStakeholder.id,{region:e.target.value})}>
                    {(D.MARKETS[detailStakeholder.market]||[]).map(r=><option key={r}>{r}</option>)}
                  </select>
                </div></div>
                <div className="detail-row"><div className="k">Geography</div><div className="v">
                  <select value={detailStakeholder.geography} onChange={e=>updateStakeholder(detailStakeholder.id,{geography:e.target.value})}>
                    {D.GEOGRAPHIES.map(g=><option key={g}>{g}</option>)}
                  </select>
                </div></div>
                <div className="detail-row"><div className="k">Tags</div><div className="v"><input value={(detailStakeholder.tags||[]).join(", ")} onChange={e=>updateStakeholder(detailStakeholder.id,{tags:e.target.value.split(",").map(t=>t.trim()).filter(Boolean)})} /></div></div>
                <div className="detail-row"><div className="k">Workspaces</div><div className="v" style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                  {getWorkspacesForStakeholder(detailStakeholder.id).map(w => (
                    <span key={w.id} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <SegmentBadge segment={w.segment} small />
                      <span style={{ fontSize: 11.5 }}>{w.name}</span>
                    </span>
                  ))}
                </div></div>
              </div>

              <div className="drawer-section">
                <h4>Relationship</h4>
                <div className="detail-row"><div className="k">Owner</div><div className="v">
                  <MultiOwnerPicker users={users} owners={detailStakeholder.owners || []} onChange={(next) => updateStakeholder(detailStakeholder.id, { owners: next })} size={24} />
                </div></div>
                <div className="detail-row"><div className="k">Last contact</div><div className="v"><input type="date" value={detailStakeholder.lastContact} onChange={e=>updateStakeholder(detailStakeholder.id,{lastContact:e.target.value})} /></div></div>
                <div className="detail-row"><div className="k">Status</div><div className="v">
                  <select value={detailStakeholder.status} onChange={e=>updateStakeholder(detailStakeholder.id,{status:e.target.value})}>
                    {["Active","Watch","Dormant"].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div></div>
                <div className="detail-row"><div className="k">Priority</div><div className="v">
                  <select value={detailStakeholder.priority} onChange={e=>updateStakeholder(detailStakeholder.id,{priority:e.target.value})}>
                    {["High","Medium","Low"].map(p=><option key={p}>{p}</option>)}
                  </select>
                </div></div>
                <div className="detail-row"><div className="k">Notes</div><div className="v"><textarea value={detailStakeholder.notes} onChange={e=>updateStakeholder(detailStakeholder.id,{notes:e.target.value})} /></div></div>
              </div>

              <div className="drawer-section">
                <h4>Position on map</h4>
                <div style={{ fontFamily: "var(--mono)", fontSize: 13, color: "var(--ink-2)", marginBottom: 8 }}>
                  x = {detailStakeholder._x.toFixed(1)} · y = {detailStakeholder._y.toFixed(1)}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-3)", lineHeight: 1.45 }}>
                  <strong style={{ color: "var(--ink)" }}>{D.STATUSES[detailStakeholder._status].strategy}.</strong>
                  &nbsp;{D.STATUSES[detailStakeholder._status].action}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {activeView === "map" && (
        <TweaksPanel title="Tweaks">
          <TweakSection label="Map style">
            <TweakRadio label="Style" value={tweaks.mapStyle} onChange={v => setTweak("mapStyle", v)}
              options={[
                { value: "classic", label: "Classic" },
                { value: "halo",    label: "Halo"    },
                { value: "density", label: "Density" }
              ]} />
          </TweakSection>
          <TweakSection label="Dots">
            <TweakSlider label="Dot size" value={tweaks.dotSize} min={14} max={36} step={2} onChange={v => setTweak("dotSize", v)} />
            <TweakToggle label="Always show labels" value={tweaks.showLabels} onChange={v => setTweak("showLabels", v)} />
          </TweakSection>
          <TweakSection label="Zones">
            <TweakToggle label="Show zone labels on grid" value={tweaks.showZoneLabels} onChange={v => setTweak("showZoneLabels", v)} />
          </TweakSection>
          <TweakSection label="Brand">
            <TweakColor
              label="Accent"
              value={tweaks.accent}
              onChange={v => setTweak("accent", v)}
              options={["#024AD8", "#B5552C", "#3E7A2E", "#7A2E12", "#1F1A14"]}
            />
          </TweakSection>
        </TweaksPanel>
      )}
    </div>
  );

  function renderTab(id, i, isStacked) {
    if (id === MASTER_ID) {
      return (
        <div
          key={id}
          className={"ws-tab master" + (activeWorkspaceId === MASTER_ID && activeView === "sheet" ? " active" : "")}
          onClick={() => activateWorkspaceTab(MASTER_ID)}
          title="Master pool - all stakeholders. Cannot be closed."
        >
          <Icon name="table" />
          Master
          <span className="muted" style={{ fontSize: 10.5, marginLeft: 2 }}>· {stakeholders.length}</span>
        </div>
      );
    }
    const w = workspaces.find(x => x.id === id);
    if (!w) return null;
    const count = stakeholders.filter(s => (stakeholderWorkspaces[s.id] || []).includes(id)).length;
    const isActive = activeWorkspaceId === id && activeView === "sheet";
    return (
      <div
        key={id}
        className={"ws-tab" + (isActive ? " active" : "")}
        onClick={() => activateWorkspaceTab(id)}
        title={`${w.name} - ${w.segment} · ${w.businessUnit}`}
      >
        <span className="seg-dot" style={{ background: segmentColor(w.segment) }} />
        <span className="ws-tab-label">{w.name}</span>
        <span className="muted" style={{ fontSize: 10.5 }}>· {count}</span>
        <button className="ws-tab-close" onClick={(e) => closeWorkspaceTab(id, e)} aria-label="Close" title="Close tab">
          <Icon name="close" className="ico ws-tab-close-icon" />
        </button>
      </div>
    );
  }
}

function segmentColor(seg) {
  return ({
    "Personal Systems":      "#2E3F66",
    "Printing":              "#682E45",
    "Corporate Investments": "#2F5A26",
    "Corporate Functions":   "#6E5419"
  })[seg] || "#7A7164";
}

function clampNum(v, min, max) { return Math.max(min, Math.min(max, v)); }

class RootErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: "monospace", fontSize: 13, color: "#7a2424", background: "#FAF8F2", height: "100vh", overflow: "auto" }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>Something threw while rendering:</div>
          <div style={{ whiteSpace: "pre-wrap" }}>{String(this.state.error && this.state.error.stack || this.state.error)}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
