/* setup.jsx — the WORKSPACES page (the Setup sub-page) at Phase-9 depth:
 * toolbar (search + Segments/Markets/Regions filters) · segment-grouped
 * workspace card body · footer · the WorkspaceModal (create/edit) · the
 * delete-confirm dialog. Assembled against the SKELETON TREES in the sealed
 * box "Workspaces — the team's working surface" in src/guide.jsx; all pure
 * logic lives in setup-logic.js (node-tested by scripts/setup-test.mjs).
 *
 * SEGMAP (sealed, LOAD-BEARING): the shell derives companySegments from
 * appConfig.segments (present-AND-non-empty, else the seed catalog) and hands
 * it down; this page re-applies the same fallback (segMapFrom) and the modal
 * re-applies it again as SEG — the sealed double fallback. Hardcoding
 * D.SEGMENTS anywhere here severs Setup from the Settings-configured segment
 * structure.
 *
 * MAKE-REAL flags honored (sealed DO-NOT-REPLICATE ledger + census H):
 *  · formatCreated parses bare dates as LOCAL midnight — the sealed
 *    UTC-midnight off-by-one bug is NOT replicated.
 *  · The dead showAll state is DROPPED (sealed verified-dead; visibility =
 *    isManager ? all : co-owned — the real-toggle option is the sealed open
 *    user ruling; see setup-logic.visibleWorkspacesFor).
 *  · toggleAssignment is sealed DEAD CODE — NO Setup-page assignment UI is
 *    invented; this page only READS the stakeholderWorkspaces join
 *    (marketsByWs / countByWs).
 *  · The blocked-delete alert → ui-snackbar (sealed mapping).
 *  · Census H4: create AUTO-OPENS the new workspace as a tab
 *    (onOpenWorkspace = the shell's openWorkspaceTab → active + Lists).
 *  · The delete cascade DISCLOSES its plans leg (sealed removeWorkspace
 *    deletes the workspace's plans): a muted line is ADDED to the sealed
 *    confirm copy when plans exist — declared, never a silent destructive
 *    side effect.
 *
 * DECLARED RECOMPOSITIONS (never silent):
 *  · TOOLBAR PLACEMENT DEPARTURE (the Plans/Community precedent): sealed
 *    TREE 1 PORTALS div.sheet-toolbar into the shell's explainerSlot; the
 *    rebuilt shell has no explainer region, so the toolbar renders PAGE-LEVEL
 *    as the first row of setup-wrap. Retarget only if a shell explainer
 *    region is ever ruled in.
 *  · Filter popovers ride ui-menu light-dismiss (the sealed DISMISSAL-MAP
 *    retarget replacing mouse-leave), and the sealed cat-opt check-rows are
 *    recomposed as ui-chip filter toggles (the Phase-8 filter-popover
 *    composition): ui-menu-select light-dismisses on EVERY item click, which
 *    fights a multi-select list — chips keep the surface open across toggles.
 *    The sealed filter-count badge = ui-badge tone=neutral on the toggle
 *    button.
 *  · The card's owners picker is wrapped in a click-containment span: in the
 *    oracle the whole card body activates the workspace, so arming an owner
 *    removal would ALSO switch the app to Lists — that bubbling is not
 *    replicated.
 *  · createdAt/updatedAt stamp full ISO through nowStamp (the repo-wide
 *    timestamp-precision rule; the sealed blank was date-only — see
 *    setup-logic.blankWorkspace).
 *  · GeographyChip is captured in the sealed box but appears NOWHERE in the
 *    Setup skeleton tree (no render site) — not built here; its tokens land
 *    with the first surface that renders it.
 *  · workHQ (intel.jsx) is its own sealed box and a LATER phase (record
 *    scaffold + workHQ); the sealed Setup tree has no workHQ entry point, so
 *    nothing here references it.
 *  · LANDING FOOTER = a styled div (.sheet-footer), not the sealed
 *    ui-status-bar mapping — a STANDING departure shared by the Lists, Plans,
 *    and Community landings (ui-status-bar is the shell's app-status strip;
 *    a second one per page would double the chrome). One systemic ruling,
 *    declared here for all three; migrate together or not at all.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState, nowStamp } from '../data/store.js';
import {
  SEED_WORKSPACES, SEED_STAKEHOLDERS, SEED_STAKEHOLDER_WORKSPACES,
  SEED_PLANS, SEED_USERS,
} from '../data/seed.js';
import { US_STATES, STATE_ABBR } from '../data/catalogs.js';
import {
  segMapFrom, blankWorkspace, draftFromWorkspace, workspaceValid,
  applySegment, applyScope, submitPatch, SCOPE_OPTIONS, formatCreated,
  marketsByWs, countByWs, marketFilterOptions, regionFilterOptions,
  filterWorkspaces, visibleWorkspacesFor, canDeleteWorkspace,
  DELETE_BLOCKED_TEXT, deleteImpact, WS_EMPTY_TEXT, WS_FOOTER_EXPLAINER,
  workspaceCountLabel,
} from './setup-logic.js';
import {
  useUiEvent, Field, TF, Sel, Owners, PopMenu,
} from '../modals/stakeholder-modal.jsx';

/* Toolbar filter toggle — sealed filter-button-wrap: label + conditional
 * count badge (ui-badge tone=neutral, the sealed filter-count mapping) +
 * the filter-active state (ui-button tonal). */
function FilterBtn({ id, label, count, onToggle }) {
  return (
    <ui-button id={id} variant={count ? 'tonal' : 'text'} onClick={onToggle}>
      {label}
      {count > 0 ? (
        <ui-badge tone="neutral" count={count}
                  aria-label={`${count} selected`}></ui-badge>
      ) : null}
    </ui-button>
  );
}

/* One filter popover (sealed head: strong label + ghost "Clear all"; body:
 * the checkable option list — see the DECLARED chip recomposition above). */
function FilterPop({ anchorId, label, options, active, onToggleValue, onClear, onClose }) {
  return (
    <PopMenu anchorId={anchorId} onClose={onClose} className="plan-pop setup-pop">
      <div className="plan-pop-head">
        <strong>{label}</strong>
        <ui-button variant="text" onClick={onClear}>Clear all</ui-button>
      </div>
      <div className="plan-pop-body">
        <ui-chip-set class="setup-opt-list">
          {options.map((v) => (
            <ui-chip
              key={v}
              variant="filter"
              selected={active.includes(v) ? '' : undefined}
              onClick={() => onToggleValue(v)}
            >{v}</ui-chip>
          ))}
        </ui-chip-set>
      </div>
    </PopMenu>
  );
}

/* ══ WORKSPACE CARD (sealed TREE 2, node by node) ═══════════════════════════ */
function WorkspaceCard({
  ws, isActive, count, markets, regions, users, canDelete,
  onActivate, onEdit, onDelete, onUpdate,
}) {
  return (
    <ui-card
      variant="outlined"
      interactive=""
      class={'plan-card comm-card ws-card' + (isActive ? ' ws-card-active' : '')}
      onClick={onActivate}
    >
      <div className="plan-card-head">
        <div className="plan-card-titlewrap">
          {/* Sealed: clicking the NAME (stopPropagation) opens the edit
              modal; the card body activates. */}
          <ui-tooltip>
            <ui-button variant="text" class="plan-card-title"
                       onClick={(e) => { e.stopPropagation(); onEdit(); }}>
              {ws.name}
            </ui-button>
            <span slot="content">Open / edit workspace</span>
          </ui-tooltip>
          <div className="plan-card-recipient muted">{ws.businessUnit}</div>
        </div>
        {/* Inline owner editing directly on the card (sealed) — clicks are
            contained so picker interaction never activates (declared). */}
        <span className="ws-card-owners" onClick={(e) => e.stopPropagation()}>
          <Owners users={users} value={ws.owners || []}
                  onChange={(v) => onUpdate({ owners: v })} />
        </span>
      </div>
      <div className="plan-card-badges">
        <ui-chip variant="segment" value={ws.segment}>{ws.segment}</ui-chip>
        <span className="plan-spacer"></span>
        {isActive ? <span className="ws-active-text">Active</span> : null}
      </div>
      <div className="plan-linked-group">
        <div className="plan-linked-row">
          <span className="plan-meta-k">Markets</span>
          <span className="plan-meta-v">{markets.join(', ') || '—'}</span>
        </div>
        <div className="plan-linked-row">
          <span className="plan-meta-k">Regions</span>
          <span className="plan-meta-v">{regions.join(', ') || '—'}</span>
        </div>
      </div>
      <div className="plan-card-foot">
        {/* Sealed count: strong ink numeral (mono in the oracle → tnum per
            the type law) + " stakeholders". */}
        <span className="muted ws-foot-count">
          <strong className="ws-tnum">{count}</strong> stakeholders
        </span>
        <span className="plan-spacer"></span>
        <ui-tooltip>
          <span className="muted ws-tnum">{formatCreated(ws.createdAt)}</span>
          <span slot="content">Date created</span>
        </ui-tooltip>
        {canDelete ? (
          <ui-icon-button variant="standard" aria-label="Delete"
                          title="Delete workspace"
                          onClick={(e) => { e.stopPropagation(); onDelete(); }}>
            <ui-icon>close</ui-icon>
          </ui-icon-button>
        ) : null}
      </div>
    </ui-card>
  );
}

/* ══ WORKSPACE MODAL (sealed TREE 3; create / edit — ui-dialog composition;
 * scrim/Escape dismiss maps the sealed veil-click onClose one-to-one) ═══════ */
function WorkspaceModal({ open, mode, ws, users, currentUser, segMap, onClose, onSave }) {
  const SEG = segMapFrom(segMap); // sealed: the modal re-applies the fallback
  const segments = Object.keys(SEG);
  const dlgRef = useRef(null);
  const nameRef = useRef(null);
  const [draft, setDraft] = useState(() =>
    (mode === 'edit' && ws) ? draftFromWorkspace(ws) : blankWorkspace(currentUser, { now: nowStamp() }));

  /* Sealed re-seed on open / target change (the modal-precedent effect). */
  const wsId = ws ? ws.id : null;
  useEffect(() => {
    if (!open) return;
    setDraft((mode === 'edit' && ws)
      ? draftFromWorkspace(ws)
      : blankWorkspace(currentUser, { now: nowStamp() }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mode, wsId]);

  /* Sealed: the name input autoFocuses (after the dialog's own focus pass). */
  useEffect(() => {
    if (!open) return undefined;
    const t = setTimeout(() => { nameRef.current && nameRef.current.focus(); }, 80);
    return () => clearTimeout(t);
  }, [open]);

  /* Scrim / Escape / programmatic close → onClose, discarding the draft
   * (sealed: three equivalent dismissals — veil · head close · Cancel). */
  useUiEvent(dlgRef, 'close', (e) => {
    if (e.target === dlgRef.current && open) onClose();
  });

  const valid = workspaceValid(draft);
  const submit = () => { if (valid) onSave(submitPatch(mode, draft)); };

  /* Sealed created-by line: BOTH modes run the date through formatCreated
   * (never the raw stamp); the edit-mode creator falls back to the literal
   * "-" when no user matches ws.createdBy. */
  const creatorName = mode === 'edit'
    ? ((users.find((u) => u.id === (ws || {}).createdBy) || {}).name || '-')
    : ((currentUser || {}).name || '-');
  const createdStamp = mode === 'edit' ? (ws || {}).createdAt : draft.createdAt;

  return (
    <ui-dialog ref={dlgRef} open={open ? '' : undefined} class="ws-modal">
      {open ? (
        <>
          <div slot="headline" className="sh-head">
            <div className="sh-head-left">
              {/* Sealed: a small SegmentBadge tracking the LIVE draft segment. */}
              <ui-chip variant="segment" value={draft.segment}>{draft.segment}</ui-chip>
              <span className="sh-title">
                {mode === 'edit' ? 'Edit workspace' : 'New workspace'}
              </span>
            </div>
            <ui-icon-button variant="standard" aria-label="Close" onClick={onClose}>
              <ui-icon>close</ui-icon>
            </ui-icon-button>
          </div>

          <div className="sh-body ws-modal-body">
            <Field label="Workspace name">
              <TF fieldRef={nameRef} label="Workspace name"
                  placeholder="e.g. GA&PP - North America"
                  value={draft.name}
                  onValue={(v) => setDraft((d) => ({ ...d, name: v }))} />
            </Field>
            <div className="sh-row-2">
              <Field label="Segment">
                {/* Sealed cascade: a new segment RESETS businessUnit to its
                    first unit. */}
                <Sel ariaLabel="Segment" value={draft.segment} options={segments}
                     onChange={(seg) => setDraft((d) => applySegment(d, seg, SEG))} />
              </Field>
              <Field label="Business unit">
                <Sel ariaLabel="Business unit" value={draft.businessUnit}
                     options={SEG[draft.segment] || []}
                     onChange={(v) => setDraft((d) => ({ ...d, businessUnit: v }))} />
              </Field>
            </div>
            <div className="sh-row-2">
              <Field label="Scope (optional)">
                {/* Sealed cascade: a non-"State" scope clears scopeState. */}
                <Sel ariaLabel="Scope (optional)" value={draft.scope}
                     options={SCOPE_OPTIONS}
                     onChange={(v) => setDraft((d) => applyScope(d, v))} />
              </Field>
              {draft.scope === 'State' ? (
                <Field label="State">
                  {/* Sealed: placeholder row "Select state…"; option label =
                      the 2-letter abbreviation, value = the state name. */}
                  <Sel ariaLabel="State" value={draft.scopeState}
                       options={[{ value: '', label: 'Select state…' },
                         ...US_STATES.map((s) => ({ value: s, label: STATE_ABBR[s] || s }))]}
                       onChange={(v) => setDraft((d) => ({ ...d, scopeState: v }))} />
                </Field>
              ) : null}
            </div>
            <Field label="Owners"
                   help="Add as many people as need ownership. They'll see this workspace in their open tabs.">
              <Owners users={users} value={draft.owners || []} size="md"
                      onChange={(v) => setDraft((d) => ({ ...d, owners: v }))} />
            </Field>
            <div className="ws-created-line muted">
              Created by <strong className="ws-created-name">{creatorName}</strong>
              {' '}on {formatCreated(createdStamp)}
            </div>
          </div>

          <div slot="actions" className="sh-foot">
            <ui-button variant="text" onClick={onClose}>Cancel</ui-button>
            <ui-button variant="filled" disabled={valid ? undefined : ''}
                       onClick={submit}>
              {mode === 'edit' ? 'Save changes' : 'Create workspace'}
            </ui-button>
          </div>
        </>
      ) : null}
    </ui-dialog>
  );
}

/* ══ THE PAGE ══════════════════════════════════════════════════════════════ */
export function SetupPage({
  createNonce = 0,
  openCreate = false,        // the shell's "+ New workspace…" seam (census A3/A18)
  onConsumeCreate,
  companySegments,           // the sealed SEGMAP prop chain (shell-derived)
  activeWorkspaceId,
  onOpenWorkspace,           // shell openWorkspaceTab (census H1)
  onAddWorkspace,            // shell addWorkspace (sealed; auto-opens — census H4)
  onRemoveWorkspace,         // shell removeWorkspace (the sealed cascade)
}) {
  const [workspaces, setWorkspaces] = usePersistentState('workspaces', SEED_WORKSPACES);
  const [stakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const [stakeholderWorkspaces] =
    usePersistentState('stakeholderWorkspaces', SEED_STAKEHOLDER_WORKSPACES);
  const [plans] = usePersistentState('plans', SEED_PLANS);
  const [users] = usePersistentState('users', SEED_USERS);

  // currentUser = the seeded first user until the login phase (sealed order).
  const currentUser = users[0] || null;

  const SEGMAP = segMapFrom(companySegments);

  /* Toolbar state (sealed): search + the three multi-select filters; opening
   * one popover closes the others. */
  const [query, setQuery] = useState('');
  const [segFilter, setSegFilter] = useState([]);
  const [marketFilter, setMarketFilter] = useState([]);
  const [regionFilter, setRegionFilter] = useState([]);
  const [openPop, setOpenPop] = useState(null); // 'seg' | 'market' | 'region'

  /* Modal / dialog state (sealed): createOpen · editWorkspaceId ·
   * confirmDeleteId. */
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const snackRef = useRef(null);
  const confirmRef = useRef(null);

  /* CREATE via the shell's context-aware (+) — the sealed addNonceFor route. */
  const seenNonce = useRef(createNonce);
  useEffect(() => {
    if (createNonce > seenNonce.current) {
      seenNonce.current = createNonce;
      setEditId(null);
      setCreateOpen(true);
    }
  }, [createNonce]);

  /* CREATE via the selector's "New workspace…" (sealed A3/A18: Setup WITH the
   * create modal open) — a first-class prop seam, consumed on arrival. */
  useEffect(() => {
    if (!openCreate) return;
    setEditId(null);
    setCreateOpen(true);
    if (onConsumeCreate) onConsumeCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCreate]);

  /* Sealed derivations (computed, never stored). */
  const derived = useMemo(
    () => marketsByWs(stakeholders, stakeholderWorkspaces),
    [stakeholders, stakeholderWorkspaces]);
  const counts = useMemo(() => countByWs(stakeholderWorkspaces), [stakeholderWorkspaces]);

  const visible = visibleWorkspacesFor(workspaces, currentUser);
  const shown = filterWorkspaces(visible, { query, segFilter, marketFilter, regionFilter, derived });

  const updateWorkspace = (id, patch) =>
    setWorkspaces((prev) => prev.map((w) =>
      (w.id === id ? { ...w, ...patch, updatedAt: nowStamp() } : w)));

  /* Sealed attemptDelete: gate → snackbar (the oracle alert's mapping) or the
   * confirm dialog. */
  const attemptDelete = (ws) => {
    if (!canDeleteWorkspace(ws, currentUser)) {
      const el = snackRef.current;
      if (el) { el.setAttribute('message', DELETE_BLOCKED_TEXT); el.show(); }
      return;
    }
    setConfirmDeleteId(ws.id);
  };

  /* Confirm dialog's own scrim/Escape closes just the confirm. */
  useUiEvent(confirmRef, 'close', (e) => {
    if (e.target === confirmRef.current) setConfirmDeleteId(null);
  });

  const editingWs = editId ? workspaces.find((w) => w.id === editId) || null : null;
  const confirmWs = confirmDeleteId
    ? workspaces.find((w) => w.id === confirmDeleteId) || null
    : null;
  const impact = confirmWs
    ? deleteImpact(confirmWs.id, stakeholderWorkspaces, plans)
    : { stakeholders: 0, plans: 0 };

  const togglePop = (key) => setOpenPop((cur) => (cur === key ? null : key));
  const toggleIn = (setter) => (v) =>
    setter((cur) => (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]));

  return (
    <div className="plan-wrap setup-wrap">
      {/* ── TOOLBAR (sealed sheet-toolbar; page-level per the declared
          placement departure) ── */}
      <div className="plan-toolbar">
        <span className="plan-search">
          <ui-icon size="sm">search</ui-icon>
          <TF label="Search workspaces" placeholder="Search workspaces…"
              value={query} onValue={setQuery} />
        </span>
        <FilterBtn id="setup-filter-seg" label="Segments" count={segFilter.length}
                   onToggle={() => togglePop('seg')} />
        <FilterBtn id="setup-filter-market" label="Markets" count={marketFilter.length}
                   onToggle={() => togglePop('market')} />
        <FilterBtn id="setup-filter-region" label="Regions" count={regionFilter.length}
                   onToggle={() => togglePop('region')} />
        <span className="plan-spacer"></span>
      </div>

      {openPop === 'seg' && (
        <FilterPop anchorId="setup-filter-seg" label="Segments"
                   options={Object.keys(SEGMAP)} active={segFilter}
                   onToggleValue={toggleIn(setSegFilter)}
                   onClear={() => setSegFilter([])}
                   onClose={() => setOpenPop(null)} />
      )}
      {openPop === 'market' && (
        <FilterPop anchorId="setup-filter-market" label="Markets"
                   options={marketFilterOptions()} active={marketFilter}
                   onToggleValue={toggleIn(setMarketFilter)}
                   onClear={() => setMarketFilter([])}
                   onClose={() => setOpenPop(null)} />
      )}
      {openPop === 'region' && (
        <FilterPop anchorId="setup-filter-region" label="Regions"
                   options={regionFilterOptions()} active={regionFilter}
                   onToggleValue={toggleIn(setRegionFilter)}
                   onClear={() => setRegionFilter([])}
                   onClose={() => setOpenPop(null)} />
      )}

      {/* ── BODY: segment-grouped cards (sealed setup-scroll → setup-section;
          groups iterate Object.keys(SEGMAP) order; empty groups skipped) ── */}
      <div className="plan-body-scroll setup-scroll">
        {shown.length === 0 ? (
          <div className="plan-empty muted">{WS_EMPTY_TEXT}</div>
        ) : (
          Object.keys(SEGMAP).map((seg) => {
            const inSeg = shown.filter((w) => w.segment === seg);
            if (!inSeg.length) return null;
            return (
              <div className="seg-group" key={seg}>
                <div className="seg-group-head">
                  <ui-chip variant="segment" value={seg}>{seg}</ui-chip>
                  <span className="muted seg-group-count">
                    {workspaceCountLabel(inSeg.length)}
                  </span>
                </div>
                <div className="plan-grid ws-grid">
                  {inSeg.map((w) => (
                    <WorkspaceCard
                      key={w.id}
                      ws={w}
                      isActive={w.id === activeWorkspaceId}
                      count={counts[w.id] || 0}
                      markets={(derived[w.id] || {}).markets || []}
                      regions={(derived[w.id] || {}).regions || []}
                      users={users}
                      canDelete={canDeleteWorkspace(w, currentUser)}
                      onActivate={() => onOpenWorkspace && onOpenWorkspace(w.id)}
                      onEdit={() => setEditId(w.id)}
                      onDelete={() => attemptDelete(w)}
                      onUpdate={(patch) => updateWorkspace(w.id, patch)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── FOOTER (sealed sheet-footer: grid icon [SYMBOLS grid→settings] +
          strong count + sep + the explainer sentence) ── */}
      <div className="plan-footer">
        <span className="plan-footer-group">
          <ui-icon size="sm">settings</ui-icon>
          <strong>{workspaces.length}</strong>&nbsp;workspaces
        </span>
        <span className="plan-footer-sep">·</span>
        <span className="muted plan-footer-explain">{WS_FOOTER_EXPLAINER}</span>
      </div>

      {/* ── CREATE modal (sealed TREE 3, mode "create") ── */}
      <WorkspaceModal
        open={createOpen}
        mode="create"
        ws={null}
        users={users}
        currentUser={currentUser}
        segMap={SEGMAP}
        onClose={() => setCreateOpen(false)}
        onSave={(data) => {
          /* Sealed create: the shell's addWorkspace mints the id, stamps
             updatedAt and AUTO-OPENS the workspace (census H4). */
          setCreateOpen(false);
          if (onAddWorkspace) onAddWorkspace(data);
        }}
      />

      {/* ── EDIT modal (sealed TREE 3, mode "edit"; open when editingWs
          resolves) ── */}
      <WorkspaceModal
        open={!!editingWs}
        mode="edit"
        ws={editingWs}
        users={users}
        currentUser={currentUser}
        segMap={SEGMAP}
        onClose={() => setEditId(null)}
        onSave={(patch) => { updateWorkspace(editId, patch); setEditId(null); }}
      />

      {/* ── DELETE CONFIRM (sealed ConfirmDialog: danger; verbatim copy; the
          plans-cascade line is the declared disclosure) ── */}
      <ui-dialog ref={confirmRef} open={confirmWs ? '' : undefined} class="ws-confirm">
        {confirmWs ? (
          <>
            <span slot="headline">Delete workspace?</span>
            <p className="sh-confirm-body">
              <strong>{confirmWs.name}</strong>
              {' '}({confirmWs.segment} · {confirmWs.businessUnit}) will be removed.
            </p>
            <p className="sh-confirm-body muted">
              Stakeholders in this workspace will stay in the Master pool.
              This can't be undone.
            </p>
            {impact.plans > 0 ? (
              <p className="sh-confirm-body muted">
                {impact.plans} plan{impact.plans === 1 ? '' : 's'} scoped to this
                workspace will also be deleted.
              </p>
            ) : null}
            <div slot="actions">
              <ui-button variant="text" onClick={() => setConfirmDeleteId(null)}>
                Cancel
              </ui-button>
              <ui-button variant="filled" tone="danger"
                         onClick={() => {
                           setConfirmDeleteId(null);
                           if (onRemoveWorkspace) onRemoveWorkspace(confirmWs.id);
                         }}>
                Yes, delete
              </ui-button>
            </div>
          </>
        ) : null}
      </ui-dialog>

      {/* Blocked-delete notice (sealed alert → ui-snackbar). */}
      <ui-snackbar ref={snackRef}></ui-snackbar>
    </div>
  );
}
