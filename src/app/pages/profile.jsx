/* profile.jsx — PHASE 13 (Profiles): the sealed USER PROFILE PAGE
 * (record.user) plus the Users & People surfaces that route to it —
 * UserStack (the app-bar people stack), UserListPopup (the right-edge people
 * panel) and EditProfileModal. Assembled against the SKELETON TREES in the
 * sealed boxes "User profile page (record.user) — hero, tabs, assignment
 * logic" (src/guide.jsx ~2774–2941) and "Users & People — user model, roles,
 * presence, avatars/stack/profile, removeUser cascade" (~2581–2773). All pure
 * logic lives in profile-logic.js (node-tested by scripts/profile-test.mjs).
 *
 * SEALED RULINGS / MAKE-REAL flags honored here:
 *  · Census I6 MAKE-REAL (user profiles were reachable ONLY via the palette),
 *    the FULL sealed sweep: people-panel rows, owner-avatar stacks (workspace/
 *    plan/community cards + plan teams + this page's assignment tables), the
 *    Lists OWNER-COLUMN popover rows (stakeholder-table 'user-open' → sheet),
 *    message-thread author avatars (both messaging surfaces), and the
 *    Settings roles-table avatars ALL open that user's profile; "Message"
 *    stays the secondary action on the panel row.
 *  · Census I2/I3 (FRAGILE window.__pending* bridges): the SEP / Community
 *    tab rows route through the shell's first-class plan/community deep-link
 *    seams. Census I4 + the A20 READ-VIEW ruling: Relationships rows land on
 *    Master Lists with the record open in the READ profile.
 *  · Census J5: the panel's "Send message" routes through the shell's
 *    messageUser (DM dedupe → conversation activated → sidebar opens).
 *  · Sealed handler 2: every tab switch resets search, filters, AND sort.
 *  · EditProfileModal STALE-REGIONS BUG: the sealed RECOMMENDED correction is
 *    applied (deselecting a market prunes its orphaned regions —
 *    profile-logic.toggleProfileMarket); declared, never silent.
 *
 * DECLARED RECOMPOSITIONS (never silent):
 *  · The controls bar + popovers + tables reuse the Plans/Community landing
 *    composition (plan-toolbar search + Filter/Sort ui-buttons + PopMenu +
 *    token-styled <table> with keyboard row semantics) — one pattern for
 *    every landing/table surface; the sealed grid tracks inform min-widths.
 *  · Sort popover = the Plans landing sort menu (click toggles asc/desc with
 *    the arrow glyph) standing in for the sealed SortFieldList — identical
 *    onSet semantics.
 *  · Filter/Sort popovers dismiss via ui-menu's outside-click/Escape (the
 *    component's own), not the oracle's hover-off (a real menu never closes
 *    on mouseleave; the sealed mutual exclusion is kept).
 *  · Hero avatar: the sealed raw 64px quantizes onto the token scale as a
 *    local re-point (.profile-hero re-points --ui-sys-avatar-size-lg — the
 *    .picked-chip precedent); the panel's sealed 36px rides lg (Phase-12
 *    quantization rule).
 *  · The tab strip = ui-tabs/ui-tab with the sealed long/short label spans +
 *    count badge as slotted content; the long↔short swap breakpoint (960px)
 *    is a DECLARED industry default (the sealed box names no value).
 *  · UserStack = the readonly ui-owner-picker in stack-button mode (max 3,
 *    "+N" overflow — the sealed anatomy): the WHOLE cluster is the sealed
 *    ONE role=button control ("People in this workspace") emitting
 *    stack-open → the people panel; no per-avatar buttons.
 *  · EditProfileModal mounts INSIDE ProfilePage (its only sealed opener is
 *    the isSelf hero button — behavior-identical to the oracle's
 *    shell-mounted instance; the page-owns-its-stores pattern).
 *  · Swatch aria: the sealed "Pick color {hex}" carries a literal hex; app
 *    code is hex-free, so cards read "Avatar color {n}" over the
 *    --ui-sys-avatar-1..8 tokens (census CAPTURED→TOKEN).
 *  · currentUser = users[0] until the Login phase (established order);
 *    LoginView itself belongs to the Login phase.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState, nowStamp, cmdKeyLabel } from '../data/store.js';
import {
  SEED_USERS, SEED_WORKSPACES, SEED_PLANS, SEED_COMMUNITY, SEED_STAKEHOLDERS,
  SEED_SCORES, SEED_TEAM, SEED_STAKEHOLDER_WORKSPACES,
} from '../data/seed.js';
import { weightedCoord, statusFor } from '../data/engine.js';
import { displayName } from '../../../design-system/components/stakeholder-table.js';
import { useCompanyCatalogs } from '../data/company.js';
import {
  useUiEvent, Field, TF, Sel, PopMenu, UAv, Owners, PriorityPill,
} from '../modals/stakeholder-modal.jsx';
import { stageSlug } from './plan-logic.js';
import {
  STR, PROFILE_TABS, PROFILE_COLS,
  wsAssigned, plansAssigned, commAssigned, shAssigned,
  wsRows, planRows, commRows, shRows,
  distinctVals, sortFieldsFor, toggleFilter, activeFilterCount, viewRows,
  heroSub, fnLabel, isManager, peopleOthers, peopleHead,
  profileNameParts, mergeProfileSave, toggleProfileMarket, regionOptionsFor,
} from './profile-logic.js';

/* ── ManagerBadge (sealed: amber pill = filled star + "Manager") ─────────── */
export function ManagerBadge() {
  return (
    <ui-chip variant="assist" class="manager-badge">
      <ui-icon slot="icon" size="sm" class="manager-star" filled="">star</ui-icon>
      {STR.manager}
    </ui-chip>
  );
}

/* ── UserStack — the app-bar people stack (sealed: first 3 + "+N") ───────── */
export function UserStack({ users, currentUserId, onOpen, slot }) {
  const others = peopleOthers(users, currentUserId);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.users = users || [];
    el.value = others.map((u) => u.id);
  });
  useUiEvent(ref, 'stack-open', () => onOpen());
  if (!others.length) return null;
  // Sealed: ONE click surface — the whole cluster (circles + "+N") is a
  // single role=button titled/labelled "People in this workspace" that opens
  // the UserListPopup; never per-avatar buttons (those would claim to open
  // individual profiles while opening the panel).
  return (
    <span slot={slot || undefined} className="user-stack" title={STR.peopleTitle}>
      <ui-owner-picker ref={ref} readonly="" stack-button="" size="sm" max="3"
                       aria-label={STR.peopleTitle}></ui-owner-picker>
    </span>
  );
}

/* ── UserListPopup — the right-edge people panel (sealed TREE + I6/J5) ───── */
export function UserListPopup({
  open, onClose, users, currentUserId, onMessage, onOpenProfile,
}) {
  const ref = useRef(null);
  useUiEvent(ref, 'close', onClose); // scrim / Escape — the component's own
  const others = peopleOthers(users, currentUserId);
  return (
    <ui-sheet ref={ref} side="right" open={open ? '' : undefined}
              class="people-popup" aria-label="People">
      <div className="people-head">
        <strong>{peopleHead(others.length)}</strong>
        <ui-icon-button variant="standard" aria-label="Close" onClick={onClose}>
          <ui-icon>close</ui-icon>
        </ui-icon-button>
      </div>
      <ui-list interactive="" class="people-list">
        {others.map((u) => (
          <ui-list-item
            key={u.id}
            interactive=""
            class="people-row"
            title={`Open ${u.name}'s profile`}
            onClick={() => onOpenProfile(u.id)}
          >
            <UAv slot="leading" user={u} size="lg"
                 presence={u.presence === 'online' ? 'online' : undefined} />
            {u.name}
            <span slot="supporting">{u.title}</span>
            {/* Sealed trailing action (census J5) — message stays secondary
                to the I6 row-click profile route. */}
            <ui-icon-button
              slot="trailing"
              variant="standard"
              class="people-msg"
              title={STR.sendMessage}
              aria-label={STR.sendMessage}
              onClick={(e) => { e.stopPropagation(); onMessage(u.id); }}
            >
              <ui-icon>chat</ui-icon>
            </ui-icon-button>
          </ui-list-item>
        ))}
      </ui-list>
    </ui-sheet>
  );
}

/* ── small bridges (established patterns) ────────────────────────────────── */

export function Upload({ onData, children }) {
  const ref = useRef(null);
  useUiEvent(ref, 'change', (e) => onData(e.detail.dataUrl));
  return <ui-upload ref={ref} accept="image/*" variant="outlined">{children}</ui-upload>;
}

/* Radiogroup of the 8 sealed avatar-color swatches (ui-swatch-card dot
 * variant over the --ui-sys-avatar-1..8 tokens). */
const AVATAR_TOKENS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `var(--ui-sys-avatar-${n})`);

export function AvatarSwatches({ value, onPick }) {
  const ref = useRef(null);
  useUiEvent(ref, 'change', (e) => {
    if (e.detail && e.detail.value != null) onPick(e.detail.value);
  });
  return (
    <div ref={ref} role="radiogroup" aria-label="Avatar color" className="avatar-swatch-row">
      {AVATAR_TOKENS.map((t, i) => (
        <ui-swatch-card
          key={t}
          variant="dot"
          value={t}
          label={`Avatar color ${i + 1}`}
          swatch-bg={t}
          swatch-border={t}
          selected={value === t ? '' : undefined}
        ></ui-swatch-card>
      ))}
    </div>
  );
}

/* ── EditProfileModal (sealed Users box; the isSelf hero button opens it) ── */
export function EditProfileModal({
  open, user, onClose, onSave, companyFunctions, companyMarkets,
}) {
  const dlgRef = useRef(null);
  const [draft, setDraft] = useState(null);

  // Sealed: draft = user, reset on user change / (re)open.
  useEffect(() => {
    if (open && user) {
      const parts = profileNameParts(user);
      setDraft({ ...user, firstName: parts.first, lastName: parts.last });
    }
  }, [open, user]);

  useUiEvent(dlgRef, 'close', (e) => {
    if (e.target === dlgRef.current && open) onClose(); // scrim/Escape cancel (census #19)
  });

  const set = (patch) => setDraft((d) => ({ ...d, ...patch }));
  const d = draft || {};
  const regionOpts = regionOptionsFor(d.markets, companyMarkets);

  return (
    <ui-dialog ref={dlgRef} open={open ? '' : undefined} class="edit-profile-modal">
      {open && draft && (
        <>
          <span slot="headline" className="msg-new-head">
            {STR.editProfileTitle}
            <ui-icon-button variant="standard" aria-label="Close" onClick={onClose}>
              <ui-icon>close</ui-icon>
            </ui-icon-button>
          </span>

          {/* Photo row — SAME anatomy as the sealed login photo row: live
              preview circle + upload/replace + Remove (only with a photo) +
              the 8 swatches (only without one). */}
          <div className="profile-photo-row">
            <UAv user={d} size="lg" />
            <div className="profile-photo-actions">
              <Upload onData={(dataUrl) => set({ avatarUrl: dataUrl })}>
                {d.avatarUrl ? STR.replacePhoto : STR.uploadPhoto}
              </Upload>
              {d.avatarUrl
                ? (
                  <ui-button variant="text" onClick={() => set({ avatarUrl: null })}>
                    {STR.removePhoto}
                  </ui-button>
                )
                : (
                  <AvatarSwatches
                    value={d.avatarColor}
                    onPick={(c) => set({ avatarColor: c })}
                  />
                )}
            </div>
          </div>

          <div className="sh-row-2">
            <Field label="First name">
              <TF label="First name" value={d.firstName} onValue={(v) => set({ firstName: v })} />
            </Field>
            <Field label="Last name">
              <TF label="Last name" value={d.lastName} onValue={(v) => set({ lastName: v })} />
            </Field>
          </div>
          <Field label="Title">
            <TF label="Title" value={d.title} onValue={(v) => set({ title: v })} />
          </Field>
          <Field label="Work email">
            <TF label="Work email" value={d.email} onValue={(v) => set({ email: v })} />
          </Field>
          <Field label="Function">
            <Sel
              ariaLabel="Function"
              value={d.function || ''}
              options={[{ value: '', label: STR.functionPlaceholder }, ...(companyFunctions || [])]}
              onChange={(v) => set({ function: v })}
            />
          </Field>
          <Field label="Markets">
            <ui-chip-set class="profile-chip-pick">
              {Object.keys(companyMarkets || {}).map((m) => (
                <ui-chip
                  key={m}
                  variant="filter"
                  selected={(d.markets || []).includes(m) ? '' : undefined}
                  onClick={() => set(toggleProfileMarket(d, m, companyMarkets))}
                >{m}</ui-chip>
              ))}
            </ui-chip-set>
          </Field>
          {/* MARKET → REGION CASCADE: regions appear only once a market is
              picked; options = the union of the SELECTED markets' regions. */}
          {(d.markets || []).length > 0 && (
            <Field label="Regions">
              <ui-chip-set class="profile-chip-pick">
                {regionOpts.map((r) => (
                  <ui-chip
                    key={r}
                    variant="filter"
                    selected={(d.regions || []).includes(r) ? '' : undefined}
                    onClick={() => set({
                      regions: (d.regions || []).includes(r)
                        ? (d.regions || []).filter((x) => x !== r)
                        : [...(d.regions || []), r],
                    })}
                  >{r}</ui-chip>
                ))}
              </ui-chip-set>
            </Field>
          )}

          <div slot="actions">
            <ui-button variant="text" onClick={onClose}>{STR.cancel}</ui-button>
            {/* Sealed SAVE merge: fn/ln fallbacks + NAME RECOMPOSED. */}
            <ui-button variant="filled"
                       onClick={() => { onSave(mergeProfileSave(draft)); onClose(); }}>
              {STR.saveProfile}
            </ui-button>
          </div>
        </>
      )}
    </ui-dialog>
  );
}

/* ── shared keyboard row semantics (Plans landing precedent) ─────────────── */
const rowKey = (fn) => (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    if (e.key === ' ') e.preventDefault();
    fn();
  }
};

/* ── THE PAGE ────────────────────────────────────────────────────────────── */
export function ProfilePage({
  userId, onOpenWorkspace, onOpenPlan, onOpenCommunity, onOpenStakeholder,
  onOpenUser,
}) {
  const [users, setUsers] = usePersistentState('users', SEED_USERS);
  const [workspaces] = usePersistentState('workspaces', SEED_WORKSPACES);
  const [plans] = usePersistentState('plans', SEED_PLANS);
  const [community] = usePersistentState('community', SEED_COMMUNITY);
  const [stakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const [scores] = usePersistentState('scores', SEED_SCORES);
  const [team] = usePersistentState('team', SEED_TEAM);
  const [stakeholderWorkspaces] =
    usePersistentState('stakeholderWorkspaces', SEED_STAKEHOLDER_WORKSPACES);
  const { companyFunctions, companyMarkets } = useCompanyCatalogs();

  // currentUser = the seeded first user until the login phase (sealed order).
  const currentUser = users[0] || null;
  const user = users.find((u) => u.id === userId) || null;
  const isSelf = !!user && !!currentUser && user.id === currentUser.id;

  /* Sealed local state: tab "ws" · q "" · sort {key:null,dir:asc} · filters
   * {} · the two popover flags (mutually exclusive). */
  const [tab, setTab] = useState('ws');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [filters, setFilters] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const resetView = () => {
    setSort({ key: null, dir: 'asc' });
    setFilters({});
    setQ('');
    setFilterOpen(false);
    setSortOpen(false);
  };

  // Re-targeting the page to another user resets the whole view (mirrors the
  // sealed stakeholder-profile [subject.id] reset effect).
  useEffect(() => { setTab('ws'); resetView(); setEditOpen(false); }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const tabsRef = useRef(null);
  useUiEvent(tabsRef, 'change', (e) => {
    const t = PROFILE_TABS[e.detail.index];
    if (t) { setTab(t.id); resetView(); } // sealed handler 2: switch + reset
  });

  /* Sealed relationship band — COMPUTED, never stored (engine single source). */
  const rel = (s) => {
    const wc = weightedCoord(s.id, scores || {}, team || []);
    return statusFor(wc.x, wc.y);
  };

  const assigned = useMemo(() => (user ? {
    ws: wsAssigned(user, workspaces, plans),
    plans: plansAssigned(user, plans),
    comm: commAssigned(user, community),
    sh: shAssigned(user, plans, stakeholders, stakeholderWorkspaces),
  } : { ws: [], plans: [], comm: [], sh: [] }),
  [user, workspaces, plans, community, stakeholders, stakeholderWorkspaces]);

  const rows = useMemo(() => {
    if (!user) return [];
    if (tab === 'ws') return wsRows(assigned.ws, stakeholders, stakeholderWorkspaces);
    if (tab === 'plans') return planRows(assigned.plans, workspaces);
    if (tab === 'comm') return commRows(assigned.comm, workspaces, stakeholderWorkspaces);
    return shRows(assigned.sh, rel, displayName);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, tab, assigned, stakeholders, stakeholderWorkspaces, workspaces, scores, team]);

  if (!user) return null; // sealed: no user → render null

  const cols = PROFILE_COLS[tab];
  const filterCols = cols.filter((c) => c.filter);
  const nActive = activeFilterCount(filters);
  const view = viewRows(rows, cols, q, filters, sort);
  const counts = {
    ws: assigned.ws.length,
    plans: assigned.plans.length,
    comm: assigned.comm.length,
    sh: assigned.sh.length,
  };
  const openRow = (r) => {
    if (tab === 'ws') onOpenWorkspace(r.id);
    else if (tab === 'plans') onOpenPlan(r.id);
    else if (tab === 'comm') onOpenCommunity(r.id);
    else onOpenStakeholder(r.id);
  };

  const saveProfile = (merged) => {
    setUsers((prev) => prev.map((u) => (
      u.id === merged.id ? { ...u, ...merged, updatedAt: nowStamp() } : u)));
  };

  return (
    <div className="profile-page">
      {/* ── HERO (sealed: avatar 64 · name · title · email + badge · edit) ── */}
      <header className="profile-hero">
        <UAv user={user} size="lg" />
        <div className="profile-hero-text">
          <div className="profile-name">{user.name}</div>
          <div className="profile-sub muted">{heroSub(user)}</div>
          <div className="profile-meta">
            <span className="muted">{user.email}</span>
            {isManager(user) && <ManagerBadge />}
          </div>
        </div>
        {/* Sealed: the edit button shows ONLY on your own profile (I5). */}
        {isSelf && (
          <ui-button variant="filled" onClick={() => setEditOpen(true)}>
            <ui-icon slot="leading">edit</ui-icon>
            {STR.editProfile}
          </ui-button>
        )}
      </header>

      {/* ── INFO GRID (sealed: Function · Markets · Regions) ──────────────── */}
      <div className="profile-info-grid">
        <div className="profile-info">
          <span className="sh-lbl">Function</span>
          <span className="profile-info-v">{fnLabel(user)}</span>
        </div>
        <div className="profile-info">
          <span className="sh-lbl">Markets</span>
          <span className="profile-tags">
            {(user.markets || []).length
              ? user.markets.map((m) => <ui-chip variant="tag" key={m}>{m}</ui-chip>)
              : <span className="muted">-</span>}
          </span>
        </div>
        <div className="profile-info">
          <span className="sh-lbl">Regions</span>
          <span className="profile-tags">
            {(user.regions || []).length
              ? user.regions.map((r) => <ui-chip variant="tag" key={r}>{r}</ui-chip>)
              : <span className="muted">-</span>}
          </span>
        </div>
      </div>

      {/* ── TABS (sealed 4, long/short labels + live counts) ──────────────── */}
      <ui-tabs ref={tabsRef} class="profile-tabs">
        {PROFILE_TABS.map((t) => (
          <ui-tab key={t.id} active={tab === t.id ? '' : undefined}>
            <span className="tab-long">{t.label}</span>
            <span className="tab-short">{t.short}</span>
            <span className="profile-tab-count">{counts[t.id]}</span>
          </ui-tab>
        ))}
      </ui-tabs>

      {/* ── CONTROLS (sealed search/Filter/Sort; Plans-landing composition) ─ */}
      <div className="plan-toolbar profile-controls">
        <span className="plan-search">
          <ui-icon size="sm">search</ui-icon>
          <TF label="Search" placeholder={STR.searchPlaceholder} value={q} onValue={setQ} />
          <span className="plan-kbd muted"
                title="Command palette">{cmdKeyLabel}</span>
        </span>
        <ui-button
          id="profile-filter-btn"
          variant={nActive ? 'tonal' : 'text'}
          onClick={() => { setFilterOpen((v) => !v); setSortOpen(false); }}
        >
          {STR.filter}{nActive ? ` (${nActive})` : ''}
        </ui-button>
        <ui-button
          id="profile-sort-btn"
          variant={sort.key ? 'tonal' : 'text'}
          onClick={() => { setSortOpen((v) => !v); setFilterOpen(false); }}
        >
          {STR.sort}
        </ui-button>
      </div>

      {filterOpen && (
        <PopMenu anchorId="profile-filter-btn" onClose={() => setFilterOpen(false)} className="plan-pop">
          <div className="plan-pop-head">
            <strong>{STR.filter}</strong>
            <ui-button variant="text" onClick={() => setFilters({})}>{STR.clearAll}</ui-button>
          </div>
          <div className="plan-pop-body">
            {filterCols.length === 0
              ? <p className="muted plan-comm-note">{STR.noFilters}</p>
              : filterCols.map((c) => (
                <div className="plan-filter-sec" key={c.key}>
                  <span className="plan-filter-lbl">{c.label}</span>
                  <ui-chip-set>
                    {distinctVals(rows, c.key).map((v) => (
                      <ui-chip
                        key={v}
                        variant="filter"
                        selected={(filters[c.key] || new Set()).has(v) ? '' : undefined}
                        onClick={() => setFilters((prev) => toggleFilter(prev, c.key, v))}
                      >{v}</ui-chip>
                    ))}
                  </ui-chip-set>
                </div>
              ))}
          </div>
        </PopMenu>
      )}

      {sortOpen && (
        <PopMenu anchorId="profile-sort-btn" onClose={() => setSortOpen(false)} className="plan-pop">
          <div className="plan-pop-head">
            <strong>{STR.sortBy}</strong>
            <ui-button variant="text" onClick={() => setSort({ key: null, dir: 'asc' })}>
              {STR.clearAll}
            </ui-button>
          </div>
          {sortFieldsFor(cols).map((f) => (
            <ui-menu-item
              key={f.key}
              onClick={() => setSort((prev) => ({
                key: f.key,
                dir: prev.key === f.key && prev.dir === 'asc' ? 'desc' : 'asc',
              }))}
            >
              {sort.key === f.key ? (
                <ui-icon slot="icon" size="sm">
                  {sort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                </ui-icon>
              ) : null}
              {f.label}
            </ui-menu-item>
          ))}
        </PopMenu>
      )}

      {/* ── TABLES (sealed: the sh tab is DISTINCT — pill cells) ──────────── */}
      <div className="plan-body-scroll profile-body">
        {view.length === 0 ? (
          <div className="profile-empty muted">
            {tab === 'sh' ? STR.emptySh : STR.emptyGeneric}
          </div>
        ) : tab === 'sh' ? (
          <table className="plan-table profile-table profile-sh-table">
            <thead>
              <tr>{cols.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {view.map((r) => (
                <tr
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  title={STR.openStakeholder}
                  onClick={() => openRow(r)}
                  onKeyDown={rowKey(() => openRow(r))}
                >
                  <td className="plan-td-title">{r.name}</td>
                  <td className="muted">{r.type}</td>
                  {/* Relationship + Priority render as the shared zone /
                      priority pill components (sealed — computed band). */}
                  <td><ui-chip variant="zone" data-zone={r.relationship}>{r.relationship}</ui-chip></td>
                  <td><PriorityPill value={r.priority} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="plan-table profile-table">
            <thead>
              <tr>{cols.map((c) => <th key={c.key}>{c.label}</th>)}</tr>
            </thead>
            <tbody>
              {view.map((r) => (
                <tr
                  key={r.id}
                  role="button"
                  tabIndex={0}
                  title={STR.open}
                  onClick={() => openRow(r)}
                  onKeyDown={rowKey(() => openRow(r))}
                >
                  {cols.map((c) => (
                    <td key={c.key} className={c.key === 'name' ? 'plan-td-title' : undefined}>
                      {c.key === 'owner' ? (
                        /* Census I6: the owner stack routes to that user's
                           profile; contained so the row-open never co-fires —
                           keydown too: Enter/Space on a focused avatar button
                           bubbles (composed) into the row's rowKey handler. */
                        <span className="profile-owner-cell"
                              onClick={(e) => e.stopPropagation()}
                              onKeyDown={(e) => e.stopPropagation()}>
                          <Owners users={users} value={r._owners} readonly
                                  onOpen={onOpenUser} />
                        </span>
                      ) : c.key === 'status' ? (
                        <span className="plan-stage-text" data-stage={stageSlug(r.status)}>
                          {r.status}
                        </span>
                      ) : r[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Sealed I5: shell-equivalent EditProfileModal (isSelf only). */}
      <EditProfileModal
        open={editOpen && isSelf}
        user={user}
        onClose={() => setEditOpen(false)}
        onSave={saveProfile}
        companyFunctions={companyFunctions}
        companyMarkets={companyMarkets}
      />
    </div>
  );
}
