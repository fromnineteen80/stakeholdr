/* community.jsx — the Community page at PHASE-8 depth: LANDING (rollup strip ·
 * applications card grid + table toggle · sealed filters/sorts/search/footer) ·
 * the READ-ONLY PROFILE (record.community.view, asPage) · the RECORD EDITOR
 * (record.community.edit, asPage — the sealed section/field/validation set) ·
 * the COMMUNITY → STAKEHOLDER BRIDGE. Assembled against the SKELETON TREES in
 * the sealed box "Community — invest in the community" in src/guide.jsx; all
 * pure logic lives in community-logic.js (node-tested by
 * scripts/community-test.mjs).
 *
 * MAKE-REAL flags honored here (sealed DO-NOT-REPLICATE ledger + census F/C):
 *  · ONE upsert, ALWAYS stamped — upsertCommunity stamps updatedAt on EVERY
 *    save (votes and approvals included); the oracle's no-stamp page path is
 *    NOT replicated (the "Last updated" sort is never stale).
 *  · MANAGER-GATED APPROVE (sealed forward-design, built real): a manager-only
 *    Approve action on the read-only profile toolbar stamps approverId +
 *    approvedAt and defaults dateApproved to today. The free stage select
 *    stays (sealed oracle baseline); whether the select itself locks for
 *    non-managers is an open user ruling.
 *  · Census F8: the card's "Engaged" names are CLICKABLE pills (consistent
 *    with the profile's F4 pills), opening the stakeholder bridge — the
 *    sealed worklist wires this; the oracle's plain text is not replicated.
 *  · Census F7 (one-profile-contract): the bridge target is the shared
 *    StakeholderModal in view mode with Edit live and the C9 engagement rows
 *    wired back to this page's read view (onOpenCommunity); RESOLVED at the
 *    Profiles phase — workspace chips navigate (onOpenWorkspace) and owner
 *    avatars open the user profile (onOpenUser): the one-profile-contract
 *    holds at this call site.
 *  · Orphaned-regions quirk: market deselection CASCADE-PRUNES its regions as
 *    the INTERIM default — the sealed make-real decision is RESERVED FOR THE
 *    USER and still open (see the OPEN RULING marker on toggleMarket in
 *    community-logic.js); the silent invisible stranding is not replicated.
 *  · Deep links are first-class props (openCommunityId + onConsumeOpen), with
 *    the census A23 existence guard — no window.__pendingCommunityId bridge.
 *  · Attachments: the sealed stub is NOT replicated silently — a REAL minimal
 *    control ships (ui-upload add + removable chips), storing name metadata
 *    only until backend file storage lands (declared).
 *  · NO delete affordance (sealed: none exists; applications are staged to
 *    Declined — a real delete is decided WITH the user, never invented).
 *  · Abstain stays UNREACHABLE (sealed: two vote buttons only; the tally
 *    tolerates seeded abstains; a third button is decided with the user).
 *
 * DECLARED RECOMPOSITIONS (never silent):
 *  · The landing reuses the Plans landing composition (toolbar row + PopMenu
 *    portals + token-styled table + footer) — the sealed shared-LandingView
 *    shell, one pattern for both pages; sealed grid column widths map to the
 *    token-styled table (the scoring-matrix precedent).
 *  · TOOLBAR PLACEMENT DEPARTURE (the Plans-landing precedent): sealed TREE 1
 *    PORTALS div.community-toolbar into the app header's explainerSlot region;
 *    the rebuilt shell has no explainer region, so the toolbar renders
 *    PAGE-LEVEL as the first row of comm-wrap — the same ui-app-bar content
 *    row, one surface lower. Retarget only if a shell explainer region is
 *    ever ruled in.
 *  · StakeholderPicker = removable ui-chip (input variant) chips + the shared
 *    Picker (ui-autocomplete, picker mode, max-results 8, two-line rows,
 *    name-or-org match, selected excluded, empty-placeholder-when-chosen) —
 *    a composition of real components per the sealed REBUILD MAP.
 *  · The selected vote button re-points --ui-sys-primary at the pos/neg
 *    valence token on its host (app.css) — the sealed token-driven .on state;
 *    a token re-point, never a component override.
 *  · ui-textarea's live counter renders "N / MAX" (the registered gap
 *    component's contract) for the sealed "{len}/1500"-style counters.
 *  · DEFERRED CHROME — the sealed MODAL-variant shell of the editor/profile
 *    (veil + head h2 "New application"/"Edit application" beside the
 *    "View application" flip and a ghost close × + foot Cancel /
 *    "Save application"/"Create application" with the foot missing readout —
 *    community-logic.missingFootReadout already carries its sealed string):
 *    this page always opens both surfaces asPage (sealed), so that chrome is
 *    NOT mounted anywhere. RESOLVED at the Profiles phase: the
 *    stakeholder-profile drill routes to this page's asPage read view (the
 *    C9 recomposition), so no overlay mount exists and the modal chrome
 *    stays unbuilt — a recorded drop unless a later phase opens the
 *    editor/profile as an overlay.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState, uid, nowStamp, cmdKeyLabel } from '../data/store.js';
import {
  SEED_COMMUNITY, SEED_STAKEHOLDERS, SEED_SCORES, SEED_TEAM, SEED_USERS,
  SEED_WORKSPACES, SEED_STAKEHOLDER_WORKSPACES,
} from '../data/seed.js';
/* REAL as of Phase 11: the editable company sets (markets/sites/issues/tags)
 * read the LIVE appConfig-with-seed-fallback seam (sealed present-AND-non-
 * empty contract); the FY rollup anchors on the LIVE fiscal keys. The
 * COMMUNITY_* / GEOGRAPHIES / US_STATES enums stay fixed (sealed). */
import {
  GEOGRAPHIES, US_STATES, STATE_ABBR, siteLabel,
  COMMUNITY_KINDS, COMMUNITY_STAGES, COMMUNITY_ASK_TYPES,
  COMMUNITY_RECURRENCE, COMMUNITY_GIVING_MODES,
} from '../data/catalogs.js';
import { useCompanyCatalogs } from '../data/company.js';
import {
  moneyK, money, isDecided, approvedLabel, communityEntryAmount, valueScore,
  applyVote, voteCounts, communityRollup, askAmountText, askSuffix,
  blankApp, draftFromApp, communityMissing, missingToolbarReadout,
  upsertCommunity, canApprove, approveApplication,
  regionOptionsFor, toggleMarket, toggleValue, todayYMD,
  COMMUNITY_FILTER_DEFS, COMMUNITY_SORT_FIELDS, COMMUNITY_EMPTY_TEXT,
  COMMUNITY_FOOTER_EXPLAINER, filterCommunity, sortCommunity,
} from './community-logic.js';
import { stageSlug } from './plan-logic.js';
import { displayName } from '../../../design-system/components/stakeholder-table.js';
import {
  StakeholderModal, useUiEvent, Field, TF, Sel, TA, Owners, IssueSelector,
  DateField, PRow, TagPills, Picker, PopMenu,
} from '../modals/stakeholder-modal.jsx';

/* Stage text (sealed STAGE_COLORS fg — colored TEXT only, no pill; the
 * StageBadge pill is sealed DEAD CODE, do-not-replicate). Shares the ONE
 * stage-text composition with Plans; Community adds approved/declined. */
function StageText({ stage }) {
  return (
    <span className="plan-stage-text" data-stage={stageSlug(stage)}>
      {stage || 'Idea'}
    </span>
  );
}

/* Kind pill (sealed KIND_COLORS → the ui-chip kind variant, token-driven). */
function KindChip({ kind }) {
  return <ui-chip variant="kind" value={kind}>{kind}</ui-chip>;
}

/* Value bar (sealed .comm-value-bar → ui-linear-progress, determinate;
 * vs is 0–10, the component takes 0..1). */
function ValueBar({ vs }) {
  return (
    <ui-linear-progress
      class="comm-value-bar"
      value={String(vs / 10)}
      aria-label="Value score"
    ></ui-linear-progress>
  );
}

/* ── VOTE GROUP (sealed VOTE CONTROL): exactly TWO buttons — for (up, "Align /
 * support") and against (down, "Object") — count + icon, toggle-off on
 * re-click, .on state token-driven (the selected host re-points
 * --ui-sys-primary at pos/neg in app.css). ─────────────────────────────── */
function VoteBtn({ dir, count, active, tip, onVote }) {
  return (
    <ui-tooltip>
      <ui-button
        variant={active ? 'filled' : 'text'}
        class={`comm-vote-btn comm-vote-${dir}`}
        onClick={(e) => { e.stopPropagation(); onVote(); }}
      >
        <ui-icon slot="leading" size="sm">
          {dir === 'for' ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
        </ui-icon>
        {count}
      </ui-button>
      <span slot="content">{tip}</span>
    </ui-tooltip>
  );
}

function VoteGroup({ app, currentUser, onVote }) {
  const counts = voteCounts(app.votes);
  const my = currentUser ? (app.votes || {})[currentUser.id] : undefined;
  return (
    <span className="comm-vote">
      <VoteBtn dir="for" count={counts.for} active={my === 'for'}
               tip="Align / support" onVote={() => onVote('for')} />
      <VoteBtn dir="against" count={counts.against} active={my === 'against'}
               tip="Object" onVote={() => onVote('against')} />
    </span>
  );
}

/* Stakeholder pills (sealed TREE 4a): clickable ONLY when the bridge handler
 * is passed (assist variant + onClick); plain tag pills otherwise. */
function StakeholderPills({ ids, stakeholders, onOpen }) {
  const resolved = (ids || [])
    .map((id) => stakeholders.find((s) => s.id === id))
    .filter(Boolean);
  if (!resolved.length) return null;
  return (
    <span className="pills-inline">
      {resolved.map((s) => onOpen ? (
        <ui-chip key={s.id} variant="assist" onClick={() => onOpen(s.id)}>
          {displayName(s) || s.name}
        </ui-chip>
      ) : (
        <ui-chip key={s.id} variant="tag">{displayName(s) || s.name}</ui-chip>
      ))}
    </span>
  );
}

/* ══ COMMUNITY CARD (sealed TREE 2, node by node) ═══════════════════════════ */
function CommunityCard({
  app, users, stakeholders, currentUser, onOpen, onEdit, onVote, onOpenStakeholder,
  onOpenUser,
}) {
  const { companySites } = useCompanyCatalogs();
  const vs = valueScore(app);
  const appr = approvedLabel(app);
  const site = app.site ? companySites.find((s) => s.id === app.site) : null;
  const engaged = (app.linkedStakeholders || [])
    .map((id) => stakeholders.find((s) => s.id === id))
    .filter(Boolean);
  const metaRow = (k, v) => (
    <div className="plan-linked-row">
      <span className="plan-meta-k">{k}</span>
      <span className="plan-meta-v">{v}</span>
    </div>
  );
  return (
    <ui-card variant="outlined" class="plan-card comm-card">
      <div className="plan-card-head">
        <div className="plan-card-titlewrap">
          <ui-tooltip>
            <ui-button variant="text" class="plan-card-title" onClick={onOpen}>
              {app.name}
            </ui-button>
            <span slot="content">Open application</span>
          </ui-tooltip>
          <div className="plan-card-recipient muted">{app.recipient}</div>
        </div>
        <div className="plan-card-avatars" aria-label="owners">
          {/* Census I6 make-real: owner avatars open that user's profile. */}
          <Owners users={users} value={app.owners || []} readonly
                  onOpen={onOpenUser} />
        </div>
      </div>
      <div className="plan-card-badges">
        <KindChip kind={app.kind} />
        {app.kind === 'Corporate Giving' && app.givingMode ? (
          <ui-chip variant="tag">{app.givingMode}</ui-chip>
        ) : null}
        <span className="plan-spacer"></span>
        <StageText stage={app.stage} />
      </div>
      <p className="plan-card-summary">{app.summary}</p>
      <div className="plan-linked-group">
        {metaRow('Ask', (
          <>
            {askAmountText(app)}
            <span className="muted">{askSuffix(app)}</span>
          </>
        ))}
        {metaRow('Approved', (
          <span className={'comm-approved comm-tone-' + appr.tone}>{appr.text}</span>
        ))}
        {metaRow('Value', (
          <span className="comm-value-wrap">
            <ValueBar vs={vs} />
            <span className="comm-value-num">{vs.toFixed(1)}</span>
          </span>
        ))}
        {(app.issues || []).length > 0 &&
          metaRow('Issues', <TagPills values={app.issues} />)}
        {engaged.length > 0 &&
          metaRow('Engaged', (
            /* Census F8 MAKE-REAL: clickable pills, consistent with F4. */
            <StakeholderPills
              ids={engaged.map((s) => s.id)}
              stakeholders={stakeholders}
              onOpen={onOpenStakeholder}
            />
          ))}
      </div>
      {((app.markets || []).length > 0 || (app.regions || []).length > 0 || (app.site && companySites.length > 0)) && (
        <div className="plan-card-meta">
          {(app.markets || []).length > 0 && metaRow('Markets', app.markets.join(', '))}
          {(app.regions || []).length > 0 && metaRow('Regions', app.regions.join(', '))}
          {/* Sealed: the Site row renders whenever app.site is SET (and the
              SITES catalog exists); "-" when the id doesn't resolve — the
              landing table column's exact fallback. */}
          {app.site && companySites.length > 0
            ? metaRow('Site', site ? (siteLabel(site) || '-') : '-')
            : null}
        </div>
      )}
      <div className="plan-card-foot">
        <VoteGroup app={app} currentUser={currentUser} onVote={(c) => onVote(app.id, c)} />
        <span className="plan-spacer"></span>
        <span className="plan-card-actions">
          <ui-button variant="text" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
            Review
          </ui-button>
          <ui-button variant="text" onClick={(e) => { e.stopPropagation(); onEdit(); }}>
            Edit
          </ui-button>
        </span>
      </div>
    </ui-card>
  );
}

/* ══ THE PAGE ══════════════════════════════════════════════════════════════ */
export function CommunityPage({
  createNonce = 0, openCommunityId = null, onConsumeOpen, onOpenWorkspace,
  onOpenUserProfile,
}) {
  const [community, setCommunity] = usePersistentState('community', SEED_COMMUNITY);
  const [stakeholders, setStakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const [scores] = usePersistentState('scores', SEED_SCORES);
  const [team] = usePersistentState('team', SEED_TEAM);
  const [users] = usePersistentState('users', SEED_USERS);
  const [workspaces] = usePersistentState('workspaces', SEED_WORKSPACES);
  const [stakeholderWorkspaces] =
    usePersistentState('stakeholderWorkspaces', SEED_STAKEHOLDER_WORKSPACES);
  const { companyIssues, companyTags } = useCompanyCatalogs();

  // currentUser = the seeded first user until the login phase (sealed order).
  const currentUser = users[0] || null;

  /* Sealed page state: viewId (read profile) · editId (editor) · newOpen
   * (create) · viewStakeholderId (the bridge target). editViewFirst is
   * ALWAYS false on this page (sealed) — the editor opens in form mode. */
  const [viewId, setViewId] = useState(null);
  const [editId, setEditId] = useState(null);
  const [newOpen, setNewOpen] = useState(false);
  const [viewStakeholderId, setViewStakeholderId] = useState(null);

  /* THE ONE UPSERT (sealed make-real): front-insert on create, replace by id,
   * updatedAt stamped on EVERY save — votes and approvals included. */
  const upsert = (app) =>
    setCommunity((prev) => upsertCommunity(prev, app, nowStamp()));

  const vote = (appId, choice) => {
    const app = community.find((a) => a.id === appId);
    if (!app) return;
    upsert({ ...app, votes: applyVote(app.votes, currentUser?.id, choice) });
  };

  /* CREATE via the shell's context-aware (+) — sealed addNonceFor route
   * (LandingView's onNew/newLabel were DEAD in the oracle). */
  const seenNonce = useRef(createNonce);
  useEffect(() => {
    if (createNonce > seenNonce.current) {
      seenNonce.current = createNonce;
      setViewId(null);
      setEditId(null);
      setNewOpen(true);
    }
  }, [createNonce]);

  /* First-class deep link (replaces window.__pendingCommunityId — sealed
   * FRAGILE → real props). Census A23 make-real guard: consume the request
   * either way, open ONLY when the record exists (never a silent crash;
   * a missing entry stays put). */
  useEffect(() => {
    if (!openCommunityId) return;
    if (community.some((a) => a.id === openCommunityId)) setViewId(openCommunityId);
    if (onConsumeOpen) onConsumeOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCommunityId]);

  const viewApp = viewId ? community.find((a) => a.id === viewId) : null;
  const editApp = editId ? community.find((a) => a.id === editId) : null;
  const viewStakeholder = viewStakeholderId
    ? stakeholders.find((s) => s.id === viewStakeholderId) || null
    : null;

  /* The COMMUNITY → STAKEHOLDER BRIDGE (sealed): a pill click closes the
   * profile (or DISCARDS the editor draft — sealed, no confirm) and opens the
   * stakeholder's record over the landing; closing returns to the LANDING. */
  const openStakeholderFromProfile = (id) => { setViewId(null); setViewStakeholderId(id); };
  const openStakeholderFromEditor = (id) => {
    setEditId(null); setNewOpen(false); setViewStakeholderId(id);
  };

  const approve = (app) => {
    if (!canApprove(currentUser)) return; // manager gate (sealed forward-design)
    upsert(approveApplication(app, {
      approverId: currentUser.id, now: nowStamp(), today: todayYMD(),
    }));
  };

  return (
    <div className="plan-wrap comm-wrap">
      {newOpen || editApp ? (
        <CommunityEditor
          key={editApp ? editApp.id : 'new'}
          existing={editApp}
          users={users}
          stakeholders={stakeholders}
          currentUser={currentUser}
          onCancel={() => { setEditId(null); setNewOpen(false); }}
          onSubmit={(d) => { upsert(d); setEditId(null); setNewOpen(false); }}
          onOpenStakeholder={openStakeholderFromEditor}
        />
      ) : viewApp ? (
        <CommunityProfile
          app={viewApp}
          users={users}
          stakeholders={stakeholders}
          onBack={() => setViewId(null)}
          onEdit={() => { setViewId(null); setEditId(viewApp.id); }}
          onOpenStakeholder={openStakeholderFromProfile}
          onApprove={canApprove(currentUser) && !isDecided(viewApp.stage)
            ? () => approve(viewApp)
            : null}
          onOpenUserProfile={onOpenUserProfile}
        />
      ) : (
        <CommunityLanding
          community={community}
          users={users}
          stakeholders={stakeholders}
          currentUser={currentUser}
          onOpen={setViewId}
          onEdit={setEditId}
          onVote={vote}
          onOpenStakeholder={(id) => setViewStakeholderId(id)}
          onOpenUserProfile={onOpenUserProfile}
        />
      )}

      {/* The bridge target — census F7 one-profile-contract (RESOLVED,
          Phase 13): the shared record in VIEW mode **is** the sealed
          StakeholderProfile — Edit live, workspace chips navigate
          (onOpenWorkspace), C9 engagement rows route back to this page's
          read view, owner avatars open the user profile (onOpenUser).
          Closing returns to the LANDING (sealed return-path). */}
      <StakeholderModal
        open={!!viewStakeholder}
        existing={viewStakeholder}
        initialView
        users={users}
        currentUser={currentUser}
        companyIssues={companyIssues}
        companyTags={companyTags}
        community={community}
        scores={scores}
        team={team}
        getWorkspacesForStakeholder={(id) =>
          workspaces.filter((w) => (stakeholderWorkspaces[id] || []).includes(w.id))}
        onCancel={() => setViewStakeholderId(null)}
        onSubmit={(data) => {
          setStakeholders((prev) => prev.map((s) => (
            s.id === viewStakeholderId ? { ...s, ...data, updatedAt: nowStamp() } : s)));
          setViewStakeholderId(null);
        }}
        onOpenCommunity={(id) => { setViewStakeholderId(null); setViewId(id); }}
        onOpenWorkspace={onOpenWorkspace}
        onOpenUser={onOpenUserProfile}
      />
    </div>
  );
}

/* ══ LANDING (sealed CommunityView via the shared landing composition) ═════ */
function CommunityLanding({
  community, users, stakeholders, currentUser, onOpen, onEdit, onVote, onOpenStakeholder,
  onOpenUserProfile,
}) {
  const { companySites, fiscal } = useCompanyCatalogs();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [tableMode, setTableMode] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const shown = useMemo(
    () => sortCommunity(filterCommunity(community, { query, filters }), sort),
    [community, query, filters, sort]);

  /* FY rollups (sealed strip: Requested · Annual · 3YR Total; rollup.approved
   * is computed-never-rendered — sealed, no invented surface). */
  /* REAL as of Phase 11: the FY anchor = the LIVE Settings fiscal keys
   * (sealed appConfig.fiscalStartMonth/Day; seed default Nov 1). */
  const rollup = useMemo(
    () => communityRollup(community, { fsMonth: fiscal.month, fsDay: fiscal.day }),
    [community, fiscal]);

  const activeFilterCount = Object.values(filters).filter((v) => v && v.length).length;
  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const cur = prev[key] || [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...prev, [key]: next };
    });
  };
  const valuesFor = (def) => {
    const set = new Set();
    for (const a of community) {
      const v = def.get(a);
      for (const x of Array.isArray(v) ? v : [v]) if (x) set.add(x);
    }
    return [...set].sort();
  };
  const siteOf = (a) => (a.site ? companySites.find((s) => s.id === a.site) : null);

  return (
    <>
      <div className="plan-toolbar">
        <span className="plan-search">
          <ui-icon size="sm">search</ui-icon>
          <TF label="Search applications" placeholder="Search…" value={query} onValue={setQuery} />
          <span
            className="plan-kbd muted"
            title="Command palette"
          >{cmdKeyLabel}</span>
        </span>
        <ui-button
          id="comm-filter-btn"
          variant={activeFilterCount ? 'tonal' : 'text'}
          onClick={() => { setFilterOpen((v) => !v); setSortOpen(false); }}
        >
          Filter{activeFilterCount ? ` (${activeFilterCount})` : ''}
        </ui-button>
        <ui-button
          id="comm-sort-btn"
          variant={sort.key ? 'tonal' : 'text'}
          onClick={() => { setSortOpen((v) => !v); setFilterOpen(false); }}
        >
          Sort
        </ui-button>
        <ui-button
          variant={tableMode ? 'tonal' : 'text'}
          title="See all in a table"
          onClick={() => setTableMode((v) => !v)}
        >
          See all
        </ui-button>
        <span className="plan-spacer"></span>
        {/* Sealed rollup strip (toolbarRight): label + moneyK value ×3. */}
        <span className="comm-rollup-inline">
          <span><span className="comm-rollup-lbl">Requested</span>{moneyK(rollup.requested)}</span>
          <span><span className="comm-rollup-lbl">Annual</span>{moneyK(rollup.annual)}</span>
          <span><span className="comm-rollup-lbl">3YR Total</span>{moneyK(rollup.cumulative)}</span>
        </span>
      </div>

      {filterOpen && (
        <PopMenu anchorId="comm-filter-btn" onClose={() => setFilterOpen(false)} className="plan-pop">
          <div className="plan-pop-head">
            <strong>Filter</strong>
            <ui-button variant="text" onClick={() => setFilters({})}>Clear all</ui-button>
          </div>
          <div className="plan-pop-body">
            {COMMUNITY_FILTER_DEFS.map((def) => {
              const values = valuesFor(def);
              if (!values.length) return null;
              return (
                <div className="plan-filter-sec" key={def.key}>
                  <span className="plan-filter-lbl">{def.label}</span>
                  <ui-chip-set>
                    {values.map((v) => (
                      <ui-chip
                        key={v}
                        variant="filter"
                        selected={(filters[def.key] || []).includes(v) ? '' : undefined}
                        onClick={() => toggleFilter(def.key, v)}
                      >{v}</ui-chip>
                    ))}
                  </ui-chip-set>
                </div>
              );
            })}
          </div>
        </PopMenu>
      )}

      {sortOpen && (
        <PopMenu anchorId="comm-sort-btn" onClose={() => setSortOpen(false)} className="plan-pop">
          <div className="plan-pop-head">
            <strong>Sort by</strong>
            <ui-button variant="text" onClick={() => setSort({ key: null, dir: 'asc' })}>
              Clear all
            </ui-button>
          </div>
          {COMMUNITY_SORT_FIELDS.map((f) => (
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

      <div className="plan-body-scroll">
        {shown.length === 0 ? (
          <div className="plan-empty muted">{COMMUNITY_EMPTY_TEXT}</div>
        ) : tableMode ? (
          /* Sealed landing table cols: Engagement · Type · Recipient · Amount ·
             Status · Markets · Regions · Site. Row click → read profile. */
          <table className="plan-table comm-table">
            <thead>
              <tr>
                <th>Engagement</th><th>Type</th><th>Recipient</th><th>Amount</th>
                <th>Status</th><th>Markets</th><th>Regions</th><th>Site</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((a) => (
                <tr
                  key={a.id}
                  title="Open"
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpen(a.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (e.key === ' ') e.preventDefault();
                      onOpen(a.id);
                    }
                  }}
                >
                  <td className="plan-td-title">{a.name}</td>
                  <td>{a.kind}</td>
                  <td>{a.recipient || '-'}</td>
                  <td className="comm-td-amount">{communityEntryAmount(a)}</td>
                  <td><StageText stage={a.stage || 'Idea'} /></td>
                  <td>{(a.markets || []).join(', ') || '-'}</td>
                  <td>{(a.regions || []).join(', ') || '-'}</td>
                  <td>{siteOf(a) ? (siteLabel(siteOf(a)) || '-') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="plan-grid">
            {shown.map((a) => (
              <CommunityCard
                key={a.id}
                app={a}
                users={users}
                stakeholders={stakeholders}
                currentUser={currentUser}
                onOpen={() => onOpen(a.id)}
                onEdit={() => onEdit(a.id)}
                onVote={onVote}
                onOpenStakeholder={onOpenStakeholder}
                onOpenUser={onOpenUserProfile}
              />
            ))}
          </div>
        )}
      </div>

      {/* Sealed footer: count group · sep · the Value explainer. */}
      <div className="plan-footer">
        <span className="plan-footer-group">
          <ui-icon size="sm">favorite</ui-icon>
          <strong>{community.length}</strong>&nbsp;applications
        </span>
        <span className="plan-footer-sep">·</span>
        <span className="muted plan-footer-explain">{COMMUNITY_FOOTER_EXPLAINER}</span>
      </div>
    </>
  );
}

/* ══ READ-ONLY PROFILE (sealed TREE 4, asPage shell + CONTENT order) ═══════ */
function CommunityProfile({
  app, users, stakeholders, onBack, onEdit, onOpenStakeholder, onApprove,
  onOpenUserProfile,
}) {
  const vs = valueScore(app);
  const appr = approvedLabel(app);
  const submitterUser = users.find((u) => u.id === app.submitter);
  const target = app.representedStakeholderId
    ? stakeholders.find((s) => s.id === app.representedStakeholderId)
    : null;
  const linkedResolved = (app.linkedStakeholders || [])
    .some((id) => stakeholders.some((s) => s.id === id));

  return (
    <div className="plan-editor comm-profile">
      <ui-app-bar variant="flat" class="plan-editor-bar">
        <ui-tooltip slot="leading">
          <ui-button variant="text" onClick={onBack}>
            <ui-icon slot="leading">chevron_left</ui-icon>
            Community
          </ui-button>
          <span slot="content">All engagements</span>
        </ui-tooltip>
        <span className="plan-review-toolbar-title">{app.name}</span>
        {/* MANAGER-GATED APPROVE (sealed forward-design, built real): renders
            only for a manager on an undecided application; stamps approverId
            + approvedAt (community-logic.approveApplication). */}
        {onApprove && (
          <ui-button slot="trailing" variant="tonal" onClick={onApprove}>
            <ui-icon slot="leading">check</ui-icon>
            Approve
          </ui-button>
        )}
        {onEdit && (
          <ui-button slot="trailing" variant="filled" onClick={onEdit}>
            <ui-icon slot="leading">edit</ui-icon>
            Edit engagement
          </ui-button>
        )}
      </ui-app-bar>

      <div className="plan-review-body">
        <div className="plan-review-doc comm-doc">
          <div className="plan-card-badges">
            <KindChip kind={app.kind} />
            {app.kind === 'Corporate Giving' && app.givingMode ? (
              <ui-chip variant="tag">{app.givingMode}</ui-chip>
            ) : null}
            <span className="plan-spacer"></span>
            <StageText stage={app.stage} />
          </div>
          {app.summary ? <p className="plan-card-summary">{app.summary}</p> : null}

          <div className="cm-section-label">Overview</div>
          <div className="prof-grid">
            <PRow k="Recipient">{app.recipient || '-'}</PRow>
            {target && (
              <PRow k="Targets">
                <StakeholderPills
                  ids={[target.id]}
                  stakeholders={stakeholders}
                  onOpen={onOpenStakeholder}
                />
              </PRow>
            )}
            <PRow k="Submitter">
              {(submitterUser ? submitterUser.name : '-') +
                (app.submitterRole ? ` · ${app.submitterRole}` : '')}
            </PRow>
            <PRow k="Submitted">{app.dateSubmitted || '-'}</PRow>
          </div>

          <div className="cm-section-label">The ask</div>
          <div className="prof-grid">
            <PRow k="Support">{app.askType}</PRow>
            <PRow k="Amount">
              {askAmountText(app)}
              <span className="muted">{askSuffix(app)}</span>
            </PRow>
            <PRow k="Approved">
              <span className={'comm-approved comm-tone-' + appr.tone}>{appr.text}</span>
            </PRow>
            <PRow k="Timeline">
              {(app.timeline || '-') +
                (app.decisionDeadline ? ` · decide by ${app.decisionDeadline}` : '')}
            </PRow>
          </div>

          {app.description ? (
            <>
              <div className="cm-section-label">Description</div>
              <p className="plan-card-summary">{app.description}</p>
            </>
          ) : null}
          {app.rationale ? (
            <>
              <div className="cm-section-label">Why this, why now</div>
              <p className="plan-card-summary">{app.rationale}</p>
            </>
          ) : null}

          <div className="cm-section-label">Alignment</div>
          <div className="cm-valuescore">
            <span className="prof-k">Value</span>
            <ValueBar vs={vs} />
            <span className="comm-value-num">{vs.toFixed(1)} / 10</span>
          </div>
          <div className="prof-grid">
            {(app.issues || []).length > 0 && (
              <PRow k="Issues" full><TagPills values={app.issues} /></PRow>
            )}
            {(app.markets || []).length > 0 && (
              <PRow k="Markets">{app.markets.join(', ')}</PRow>
            )}
            {(app.regions || []).length > 0 && (
              <PRow k="Regions">{app.regions.join(', ')}</PRow>
            )}
            {linkedResolved && (
              <PRow k="Stakeholders" full>
                <StakeholderPills
                  ids={app.linkedStakeholders}
                  stakeholders={stakeholders}
                  onOpen={onOpenStakeholder}
                />
              </PRow>
            )}
          </div>

          <div className="cm-section-label">Budget</div>
          <div className="prof-grid">
            <PRow k="Total cost">{money((app.budget || {}).total)}</PRow>
            <PRow k="Requested">{money((app.budget || {}).requested)}</PRow>
            {(app.budget || {}).otherFunding ? (
              <PRow k="Other funding">{money(app.budget.otherFunding)}</PRow>
            ) : null}
            {(app.budget || {}).inKind ? (
              <PRow k="In-kind">{app.budget.inKind}</PRow>
            ) : null}
          </div>

          <div className="cm-section-label">Owners</div>
          {/* Census I6 make-real: owner avatars open that user's profile. */}
          <Owners users={users} value={app.owners || []} readonly
                  onOpen={onOpenUserProfile} />
        </div>
      </div>
    </div>
  );
}

/* ── editor field helpers ─────────────────────────────────────────────────── */

/* Score slider (sealed: type=range 0–10 step 1; the LABEL shows the current
 * value beside it in tnum ink). */
function ScoreSlider({ label, value, onChange }) {
  const ref = useRef(null);
  useUiEvent(ref, 'input', () => onChange(Number(ref.current.value)));
  return (
    <div className="sh-field">
      <span className="sh-lbl">
        {label} <span className="comm-slider-val">{value}</span>
      </span>
      <ui-slider ref={ref} min="0" max="10" step="1" value={String(value)}
                 aria-label={label}></ui-slider>
    </div>
  );
}

/* Chip multi-select (sealed ChipMultiSelect → ui-chip filter variant toggles;
 * Regions empty-state "Pick a market first"). */
function ChipMulti({ options, selected, onToggle, emptyText }) {
  if (!options.length) return <span className="muted sh-help">{emptyText}</span>;
  return (
    <ui-chip-set>
      {options.map((v) => (
        <ui-chip
          key={v}
          variant="filter"
          selected={(selected || []).includes(v) ? '' : undefined}
          onClick={() => onToggle(v)}
        >{v}</ui-chip>
      ))}
    </ui-chip-set>
  );
}

/* Checkbox bridge (ui-checkbox emits change; read el.checked). */
function Check({ label, checked, onChange }) {
  const ref = useRef(null);
  useUiEvent(ref, 'change', () => onChange(ref.current.checked));
  return (
    <ui-checkbox ref={ref} checked={checked ? '' : undefined}>{label}</ui-checkbox>
  );
}

/* Removable chosen chip (input variant: × emits remove; sealed title). */
function ChosenChip({ label, onRemove }) {
  const ref = useRef(null);
  useUiEvent(ref, 'remove', onRemove);
  return <ui-chip ref={ref} variant="input" title="Remove">{label}</ui-chip>;
}

/* StakeholderPicker (sealed TREE 3a mechanics as a composition — see the
 * DECLARED RECOMPOSITIONS header note): removable chips + the shared Picker
 * (options exclude selected; label = display name, sub = "org · type" so the
 * substring filter matches name OR org; 8-row cap; pick clears the query;
 * placeholder only while nothing is chosen). */
function StakeholderPicker({ stakeholders, selected, onChange, placeholder }) {
  const chosen = (selected || [])
    .map((id) => stakeholders.find((s) => s.id === id))
    .filter(Boolean);
  const options = stakeholders
    .filter((s) => !(selected || []).includes(s.id))
    .map((s) => ({
      value: s.id,
      label: displayName(s) || s.name,
      sub: `${s.org || ''} · ${s.type || ''}`,
    }));
  return (
    <div className="comm-sh-picker">
      {chosen.length > 0 && (
        <ui-chip-set class="comm-sh-chips">
          {chosen.map((s) => (
            <ChosenChip
              key={s.id}
              label={displayName(s) || s.name}
              onRemove={() => onChange(selected.filter((id) => id !== s.id))}
            />
          ))}
        </ui-chip-set>
      )}
      <Picker
        options={options}
        placeholder={chosen.length ? '' : (placeholder || 'Link stakeholders…')}
        onPick={(id) => onChange([...(selected || []), id])}
      />
    </div>
  );
}

/* Section label (sealed cm-section-label — token-inked label text, never an
 * invented heading component). */
function SectionLabel({ children }) {
  return <div className="cm-section-label">{children}</div>;
}

/* ══ RECORD EDITOR (sealed TREE 3 asPage + RECORD SECTIONS, field for field) ══ */
function CommunityEditor({
  existing, users, stakeholders, currentUser, onCancel, onSubmit, onOpenStakeholder,
}) {
  const isEdit = !!existing;
  const { companyMarkets, companySites, companyIssues } = useCompanyCatalogs();
  const [d, setD] = useState(() => (existing
    ? draftFromApp(existing)
    : blankApp(currentUser, { id: uid('ca'), now: nowStamp(), today: todayYMD() })));
  /* Sealed VIEW/EDIT TOGGLE: view-first only for an existing app opened with
   * initialView — never on this page (editViewFirst always false); the flip
   * stays live via "View application" and shows the SAVED entry (sealed). */
  const [viewMode, setViewMode] = useState(false);

  const set = (patch) => setD((prev) => ({ ...prev, ...patch }));
  const setBudget = (patch) => setD((prev) => ({ ...prev, budget: { ...prev.budget, ...patch } }));
  const setRisk = (patch) => setD((prev) => ({ ...prev, risk: { ...prev.risk, ...patch } }));

  const missing = communityMissing(d);
  const valid = missing.length === 0;
  const vs = valueScore(d);
  const regionOpts = regionOptionsFor(d.markets, companyMarkets);
  const submitters = users.filter((u) => u.role !== 'system');
  const committed = isDecided(d.stage);

  /* Sealed: "Project name" autoFocuses. */
  const nameRef = useRef(null);
  useEffect(() => {
    if (viewMode) return;
    const t = setTimeout(() => nameRef.current && nameRef.current.focus(), 80);
    return () => clearTimeout(t);
  }, [viewMode]);

  if (viewMode && isEdit) {
    return (
      <CommunityProfile
        app={existing}
        users={users}
        stakeholders={stakeholders}
        onBack={onCancel}
        onEdit={() => setViewMode(false)}
        onOpenStakeholder={onOpenStakeholder}
        onApprove={null}
      />
    );
  }

  return (
    <div className="plan-editor comm-editor">
      {/* Sealed asPage toolbar: back "All community" · spacer · [edit] View
          application · Save/Create (disabled until valid) · "{N} left". */}
      <ui-app-bar variant="flat" class="plan-editor-bar">
        <ui-button slot="leading" variant="text" onClick={onCancel}>
          <ui-icon slot="leading">chevron_left</ui-icon>
          All community
        </ui-button>
        <span className="plan-spacer"></span>
        {isEdit && (
          <ui-button slot="trailing" variant="text" title="View application"
                     onClick={() => setViewMode(true)}>
            View application
          </ui-button>
        )}
        <ui-button
          slot="trailing"
          variant="filled"
          disabled={valid ? undefined : ''}
          onClick={() => valid && onSubmit(d)}
        >{isEdit ? 'Save' : 'Create'}</ui-button>
        {!valid && (
          <ui-tooltip slot="trailing">
            <span className="plan-missing muted">{missingToolbarReadout(missing)}</span>
            <span slot="content">{missing.join(', ')}</span>
          </ui-tooltip>
        )}
      </ui-app-bar>

      <div className="plan-review-body">
        <div className="plan-review-doc comm-doc comm-form">
          <SectionLabel>Project overview</SectionLabel>
          <Field label="Project name">
            <TF label="Project name" placeholder="e.g. Cedarville Workforce STEM Grant"
                value={d.name} onValue={(v) => set({ name: v })} fieldRef={nameRef} />
          </Field>
          <div className="sh-row-2">
            <Field label="Engagement type">
              <Sel ariaLabel="Engagement type" value={d.kind} options={COMMUNITY_KINDS}
                   onChange={(v) => set({ kind: v })} />
            </Field>
            <Field label="Stage">
              {/* Sealed ORACLE BASELINE: a free select over the 7 stages (any
                  user); the formal Approve action lives on the profile
                  toolbar (manager-gated) and stamps what this select cannot. */}
              <Sel ariaLabel="Stage" value={d.stage} options={COMMUNITY_STAGES}
                   onChange={(v) => set({ stage: v })} />
            </Field>
          </div>
          {d.kind === 'Corporate Giving' && (
            <Field label="Giving mode">
              <Sel ariaLabel="Giving mode" value={d.givingMode || 'Monetary'}
                   options={COMMUNITY_GIVING_MODES}
                   onChange={(v) => set({ givingMode: v })} />
            </Field>
          )}
          <Field label="One-line summary">
            <TF label="One-line summary" placeholder="Short description shown on the card"
                value={d.summary} onValue={(v) => set({ summary: v })} />
          </Field>

          <SectionLabel>Applicant &amp; sponsor</SectionLabel>
          <div className="sh-row-2">
            <Field label="Submitter">
              {/* Sealed cascade #26: picking a submitter sets submitterRole
                  to that user's title. */}
              <Sel
                ariaLabel="Submitter"
                value={d.submitter}
                options={submitters.map((u) => ({ value: u.id, label: u.name }))}
                onChange={(v) => {
                  const u = submitters.find((x) => x.id === v);
                  set({ submitter: v, submitterRole: u ? u.title : d.submitterRole });
                }}
              />
            </Field>
            <Field label="Submitter role">
              <TF label="Submitter role" value={d.submitterRole}
                  onValue={(v) => set({ submitterRole: v })} />
            </Field>
          </div>
          {/* Date fields ride ui-date-picker's own floating label (the
              Phase-4 precedent) — a second Field caption would double it. */}
          <div className="sh-field comm-date-cell">
            <DateField label="Date submitted" value={d.dateSubmitted}
                       onChange={(v) => set({ dateSubmitted: v })} />
          </div>
          <Field label="Stakeholder / Organization Targeted">
            <Sel
              ariaLabel="Stakeholder / Organization Targeted"
              value={d.representedStakeholderId || ''}
              options={[{ value: '', label: 'None' },
                ...stakeholders.map((s) => ({ value: s.id, label: displayName(s) || s.name }))]}
              onChange={(v) => set({ representedStakeholderId: v })}
            />
          </Field>

          <SectionLabel>The ask</SectionLabel>
          <div className="sh-row-3">
            <Field label="Support requested">
              <Sel ariaLabel="Support requested" value={d.askType} options={COMMUNITY_ASK_TYPES}
                   onChange={(v) => set({ askType: v })} />
            </Field>
            <Field label="Amount">
              <TF label="Amount" type="number" value={String(d.amount)}
                  onValue={(v) => set({ amount: Number(v) })} />
            </Field>
            <Field label="Unit">
              {/* Sealed unit enum, hard-coded: USD · hours · "" (n/a). */}
              <Sel ariaLabel="Unit" value={d.unit}
                   options={[{ value: 'USD', label: 'USD' },
                             { value: 'hours', label: 'hours' },
                             { value: '', label: 'n/a' }]}
                   onChange={(v) => set({ unit: v })} />
            </Field>
          </div>
          <div className="sh-row-3">
            <Field label="Recurrence">
              <Sel ariaLabel="Recurrence" value={d.recurrence} options={COMMUNITY_RECURRENCE}
                   onChange={(v) => set({ recurrence: v })} />
            </Field>
            <Field label="Years">
              {/* Sealed FIELD CONSTRAINTS: years is a number input, min="1". */}
              <TF label="Years" type="number" min="1" value={String(d.years)}
                  onValue={(v) => set({ years: Number(v) })} />
            </Field>
            <div className="sh-field comm-date-cell">
              <DateField label="Decision deadline" value={d.decisionDeadline}
                         onChange={(v) => set({ decisionDeadline: v })} />
            </div>
          </div>
          <Field label="Timeline">
            <TF label="Timeline" placeholder="e.g. FY26–FY28" value={d.timeline}
                onValue={(v) => set({ timeline: v })} />
          </Field>

          <SectionLabel>Description &amp; rationale</SectionLabel>
          <Field label="Description">
            <CountedTA rows={4} maxlength={1500} value={d.description}
                       onValue={(v) => set({ description: v })} />
          </Field>
          <Field label="Why this, why now">
            <CountedTA rows={2} maxlength={500} value={d.rationale}
                       onValue={(v) => set({ rationale: v })} />
          </Field>

          <SectionLabel>Beneficiary &amp; relationships</SectionLabel>
          <Field label="Recipient organization or cause">
            <TF label="Recipient organization or cause" placeholder="Who receives the support"
                value={d.recipient} onValue={(v) => set({ recipient: v })} />
          </Field>
          <Field
            label="Connected stakeholders"
            help="Link supporters, opponents, and decision-makers from your map."
          >
            <StakeholderPicker
              stakeholders={stakeholders}
              selected={d.linkedStakeholders}
              onChange={(v) => set({ linkedStakeholders: v })}
              placeholder="Link stakeholders…"
            />
          </Field>

          <SectionLabel>Strategic alignment</SectionLabel>
          <div className="sh-row-2">
            <ScoreSlider label="Improves license to operate" value={d.licenseToOperate}
                         onChange={(v) => set({ licenseToOperate: v })} />
            <ScoreSlider label="Improves relationships" value={d.relationshipImpact}
                         onChange={(v) => set({ relationshipImpact: v })} />
          </div>
          <div className="cm-valuescore">
            <span className="prof-k">Value score</span>
            <ValueBar vs={vs} />
            <span className="comm-value-num">{vs.toFixed(1)} / 10</span>
          </div>
          <Field label="Issues">
            <IssueSelector selected={d.issues || []} company={companyIssues}
                           onChange={(v) => set({ issues: v })} />
          </Field>
          <div className="sh-row-2">
            <Field label="Markets">
              <ChipMulti
                options={Object.keys(companyMarkets)}
                selected={d.markets}
                /* INTERIM cascade — deselecting a market prunes its orphaned
                   regions; the sealed decision is an OPEN USER RULING (see
                   toggleMarket in community-logic.js). */
                onToggle={(m) => set(toggleMarket(d, m, companyMarkets))}
                emptyText=""
              />
            </Field>
            <Field label="Regions">
              <ChipMulti
                options={regionOpts}
                selected={d.regions}
                onToggle={(r) => set({ regions: toggleValue(d.regions, r) })}
                emptyText="Pick a market first"
              />
            </Field>
          </div>
          <div className="sh-row-3">
            <Field label="Site">
              {/* Sealed SITE→STATE cascade: a site with a state sets BOTH. */}
              <Sel
                ariaLabel="Site"
                value={d.site || ''}
                options={[{ value: '', label: 'None' },
                  ...companySites.map((s) => ({ value: s.id, label: siteLabel(s) }))]}
                onChange={(id) => {
                  const s = companySites.find((x) => x.id === id);
                  if (s && s.state) set({ site: id, state: s.state });
                  else set({ site: id });
                }}
              />
            </Field>
            <Field label="State">
              <Sel
                ariaLabel="State"
                value={d.state || ''}
                options={[{ value: '', label: 'None' },
                  ...US_STATES.map((s) => ({ value: s, label: STATE_ABBR[s] || s }))]}
                onChange={(v) => set({ state: v })}
              />
            </Field>
            <Field label="Geography">
              <Sel
                ariaLabel="Geography"
                value={d.geography || ''}
                options={[{ value: '', label: 'Select…' }, ...GEOGRAPHIES]}
                onChange={(v) => set({ geography: v })}
              />
            </Field>
          </div>

          <SectionLabel>Resources &amp; budget</SectionLabel>
          <div className="sh-row-3">
            <Field label="Total project cost">
              <TF label="Total project cost" type="number" value={String(d.budget.total)}
                  onValue={(v) => setBudget({ total: Number(v) })} />
            </Field>
            <Field label="Requested amount">
              <TF label="Requested amount" type="number" value={String(d.budget.requested)}
                  onValue={(v) => setBudget({ requested: Number(v) })} />
            </Field>
            <Field label="Approved amount">
              <TF label="Approved amount" type="number" value={String(d.approvedAmount)}
                  onValue={(v) => set({ approvedAmount: Number(v) })} />
            </Field>
          </div>
          {committed && (
            <div className="sh-field comm-date-cell">
              <DateField label="Date approved" value={d.dateApproved}
                         onChange={(v) => set({ dateApproved: v })} />
              <span className="sh-help">
                Sets the fiscal year this commitment counts toward.
              </span>
            </div>
          )}
          <div className="sh-row-2">
            <Field label="Other funding / partners">
              <TF label="Other funding / partners" type="number"
                  value={String(d.budget.otherFunding)}
                  onValue={(v) => setBudget({ otherFunding: Number(v) })} />
            </Field>
            <Field label="In-kind contributions">
              <TF label="In-kind contributions" placeholder="e.g. employee mentor hours"
                  value={d.budget.inKind} onValue={(v) => setBudget({ inKind: v })} />
            </Field>
          </div>

          <SectionLabel>Risk &amp; compliance</SectionLabel>
          <Field label="Reputational / political risk">
            <TF label="Reputational / political risk" value={d.risk.reputational}
                onValue={(v) => setRisk({ reputational: v })} />
          </Field>
          <Field label="Legal &amp; disclosure considerations">
            <TF label="Legal and disclosure considerations" value={d.risk.legal}
                onValue={(v) => setRisk({ legal: v })} />
          </Field>
          <div className="comm-attest">
            <Check label="Conflict of interest disclosed"
                   checked={!!d.risk.conflictOfInterest}
                   onChange={(v) => setRisk({ conflictOfInterest: v })} />
            {d.risk.conflictOfInterest && (
              <Field label="Describe the conflict" className="comm-conflict-detail">
                <TA rows={2} placeholder="Nature of the conflict and how it's managed"
                    value={d.risk.conflictDetail || ''}
                    onValue={(v) => setRisk({ conflictDetail: v })} />
              </Field>
            )}
            <Check label="I attest this information is accurate"
                   checked={!!d.risk.attestation}
                   onChange={(v) => setRisk({ attestation: v })} />
          </div>

          {/* DECLARED (sealed attachments rule: real control or drop — never
              the silent stub): a REAL minimal attachment list; name metadata
              only until backend file storage lands. Genuinely optional. */}
          <SectionLabel>Attachments</SectionLabel>
          <div className="comm-attachments">
            {(d.attachments || []).length > 0 && (
              <ui-chip-set>
                {d.attachments.map((f) => (
                  <ChosenChip
                    key={f.id}
                    label={f.name}
                    onRemove={() => set({
                      attachments: d.attachments.filter((x) => x.id !== f.id),
                    })}
                  />
                ))}
              </ui-chip-set>
            )}
            <AttachmentAdd onAdd={(name) => set({
              attachments: [...(d.attachments || []), { id: uid('att'), name }],
            })} />
          </div>

          <SectionLabel>Owners</SectionLabel>
          <Owners users={users} value={d.owners || []} onChange={(v) => set({ owners: v })} />
        </div>
      </div>
    </div>
  );
}

/* ui-textarea with the live counter (the registered gap component owns the
 * "N / MAX" counter — see the DECLARED note in the header). */
function CountedTA({ rows, maxlength, value, onValue }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el && el.value !== (value ?? '')) el.value = value ?? '';
  }, [value]);
  useUiEvent(ref, 'input', () => onValue(ref.current.value));
  return (
    <ui-textarea ref={ref} rows={rows} maxlength={String(maxlength)}></ui-textarea>
  );
}

/* Attachment add control — a real ui-upload (any file type; the change event
 * carries { dataUrl, name }; only the name is kept — declared above). */
function AttachmentAdd({ onAdd }) {
  const ref = useRef(null);
  useUiEvent(ref, 'change', (e) => e.detail && e.detail.name && onAdd(e.detail.name));
  return (
    <ui-upload ref={ref} variant="text" class="comm-attach-add">
      Add attachment
    </ui-upload>
  );
}
