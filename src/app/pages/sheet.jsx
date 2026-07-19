/* sheet.jsx — the Lists page at PHASE-3 (full grid) DEPTH, assembled against
 * the sealed box "Lists table — the master stakeholder table" (SKELETON TREE
 * root: div.sheet-wrap → the page slot inside the shell's main content).
 *
 * THE TABLE IS THE DESIGN-SYSTEM DOMAIN COMPONENT <ui-stakeholder-table>
 * (extended in design-system/components/stakeholder-table.js to the full
 * sealed spec) — never a hand-rolled grid in app code (Canonical UI law 1).
 * The page owns: row computation (live _x/_y/_status/_unscored + community
 * affiliations), persistence through the ONE Store seam (row-change →
 * updateStakeholder with an updatedAt stamp), the NOTES MODAL (ui-dialog +
 * ui-textarea composition per the sealed NotesModal spec), and the C5
 * community-pill route (REAL as of Phase 8: name -> id resolve, then the
 * shell's community deep-link seam; unresolvable names get an honest
 * snackbar). The modal's C9 engagement rows ride the same seam.
 *
 * Scoping (sealed Ecosystem box, REAL as of Phase 6): Lists filters to the
 * active workspace via the stakeholderWorkspaces join (Master = the union of
 * ALL stakeholders); the workspace name feeds the sealed CSV filename rule.
 *
 * PHASE 15 — workHQ: this page is the sealed HOST of the intelligence band —
 * the .intel-split parent carrying data-mode lives HERE (sealed skeleton
 * host note); the band renders ABOVE the table with a divider between; the
 * table is untouched below. Host-owned workHQ state:
 *  · mode (split/intel/table) — DECLARED per-device persistence (localStorage
 *    key hp_workhq_mode, mirroring the table's column-order key pattern; the
 *    sealed capture held mode in volatile shell state — persisting the layout
 *    preference is the minimal industry-standard choice).
 *  · intelIgnores — the RULED (2026-07-05) per-user ignore table through the
 *    ONE Store seam: { userId -> { cardKey -> [entryKey] } }.
 *  · drill-throughs (census G1 MAKE-REAL): entry names open the stakeholder
 *    READ view (the A20/I4 ruling) / the community read page; quick-add opens
 *    the same create modal the shell (+) nonce opens (census G2); the cold
 *    card's "View all" arms the table's DECLARED preset property (High
 *    priority filter + lastContact stalest-first sort) and collapses the band
 *    to table mode; summary mix/plans segments and the needs-score/votes
 *    "View all" ride NEW onOpenMap/onOpenPlans/onOpenScoring/onOpenCommunity
 *    shell props (mirroring the established onOpen* seam pattern — ruled).
 *
 * PHASE 17 — BULK ACTIONS (FORWARD-DESIGN, declared 2026-07-05; the sealed
 * demo-features box names bulk actions with no oracle spec; designed under
 * the thousands-of-stakeholders scale ruling):
 *  · this page arms the table's DECLARED `selectable` attribute (the opt-in
 *    leading checkbox column; embeds elsewhere stay checkbox-free) and
 *    listens on bulk-selection-change.
 *  · DECLARED PATTERN CHOICE: the selection action bar surfaces ABOVE the
 *    table (between the workHQ divider and the grid) when ≥1 row is selected
 *    — the table's own toolbar stays intact underneath (the Gmail-family
 *    "bar appears on selection" pattern, host-owned so the writes stay
 *    page-owned). Actions: Assign to workspace… (ui-menu over the live
 *    workspaces; the sealed createJoinFor/stakeholderWorkspaces seam) ·
 *    Add tag… (ui-menu over the LIVE companyTags seam) · Set priority…
 *    (the sealed High/Medium/Low catalog) · Export selected (the table's
 *    sealed CSV path over the selection) · Clear selection.
 *  · SCALE LAW: every bulk write is ONE setState via the pure builders in
 *    sheet-logic.js (updatedAt-stamped patches; honest per-row no-ops) —
 *    never N sequential writes.
 *  · SELECTION SCOPE (RULED 2026-07-05, scale-audit F2): the table PRUNES
 *    the selection on every pipeline change (search/filter/sort-preset/data
 *    swap) so it is always ⊆ the filtered rows — the bar count, Export
 *    selected and every bulk write act on exactly what the filters show.
 *  · HONEST COUNTS (audit F5): the builders return { next, landed }; the
 *    snackbar reports the landed count (already-satisfied rows are named,
 *    never absorbed) and Export selected guards the zero-row case.
 *  · NO BULK DELETE on the LIVE list (BY DESIGN — the Phase-24 safety model
 *    below): destructive-at-scale always runs through the archive.
 *
 * PHASE 24 — ARCHIVE / SOFT DELETE (the Enterprise state model box's "SOFT
 * DELETE [STD] — deleted_at + deleted_by instead of hard delete … lists
 * filter out soft-deleted rows" + architecture pillar 8's Archive state,
 * closing the sealed demo-features line "soft-delete/archive (per the
 * Enterprise model box)"; thin surfaces DECLARED to industry standard):
 *  · the record carries archived / archivedAt / archivedBy through the ONE
 *    store seam (the envelope's deleted_at/deleted_by, camelCase like the
 *    sealed audit fields). Archiving CASCADES NOTHING — scores, joins and
 *    plan memberships keep the id; every default surface hides it (the
 *    activeStakeholders seam in data/workspace.js).
 *  · the bulk bar gains ARCHIVE (any signed-in user, one stamped write,
 *    honest landed-count snackbar with UNDO — restore exactly the landed
 *    set via the ui-snackbar action slot).
 *  · ENTRY POINT (declared placement): a quiet right-aligned "Archived (N)"
 *    strip between the workHQ divider and the table — visible only when the
 *    workspace scope holds archived rows (make-real law: no dead control at
 *    zero). It opens the ARCHIVED VIEW: the SAME ui-stakeholder-table in
 *    its Phase-24 `readonly` mode (selection live, writes impossible) with
 *    its own bulk bar: Restore · Delete forever… · Export selected.
 *  · SAFETY MODEL (declared): bulk hard-delete exists ONLY here — archive
 *    first, then delete from the archive behind a typed-out confirm dialog;
 *    the live list never mass-destroys. Delete forever reuses the SEALED
 *    single-record cascade (remove record, purge scores[id], purge
 *    stakeholderWorkspaces[id]) generalized in cascadeDeleteStakeholders —
 *    the modal's danger delete runs the same one code path. Gating parity
 *    (declared): the sealed modal delete is open to any signed-in user
 *    behind its confirm; delete-forever keeps that same audience.
 *  · Archived records stay REACHABLE by direct reference (deep links,
 *    mentions, the record page, this view's read profile) — a link must
 *    never dead-end on a recoverable record (declared).
 *  · Desktop surface (like bulk actions); mobile keeps the companion scope.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePersistentState, uid, nowStamp, cmdKeyLabel } from '../data/store.js';
import { useCurrentUser } from '../data/session.js';
import { weightedCoord, statusFor } from '../data/engine.js';
import {
  SEED_STAKEHOLDERS, SEED_SCORES, SEED_TEAM, SEED_USERS, SEED_COMMUNITY,
  SEED_WORKSPACES, SEED_STAKEHOLDER_WORKSPACES, SEED_MESSAGES, SEED_PLANS,
} from '../data/seed.js';
import { GEOGRAPHIES, US_STATES, STAKEHOLDER_STATUS, siteLabel } from '../data/catalogs.js';
/* REAL as of Phase 11: the editable company sets (categories/markets/sites/
 * issues/tags) read the LIVE appConfig-with-seed-fallback seam (sealed
 * present-AND-non-empty contract) — Settings edits propagate to every select
 * here with no reload. GEOGRAPHIES/US_STATES stay fixed enums (sealed). */
import { useCompanyCatalogs } from '../data/company.js';
// displayName is single-sourced with the design-system's pure Lists logic
// (the sealed Shared-primitives formula lives beside the table that renders
// it); PRIORITY_OPTIONS is the sealed hardcoded High/Medium/Low catalog the
// Phase-17 bulk Set-priority menu reuses (one source, never re-typed).
import { displayName, normalizeUrl, PRIORITY_OPTIONS } from '../../../design-system/components/stakeholder-table.js';
// Phase 17: the pure single-setState bulk patch builders (see their header).
import {
  bulkPatchStakeholders, bulkAddTag, bulkAssignWorkspace, bulkActionSummary,
  LISTS_EMPTY_LINE,
  // Phase 24: the archive layer's pure builders + copy (see their headers).
  bulkArchive, bulkRestore, cascadeDeleteStakeholders,
  archiveSummary, restoreSummary, deleteForeverSummary, archivedToggleLabel,
  ARCHIVED_VIEW_TITLE, ARCHIVED_VIEW_LINE, ARCHIVED_EMPTY_LINE,
} from './sheet-logic.js';
// Phase 19: the shared zero-data empty state (sealed "empty states per page").
import { EmptyState } from '../empty-state.jsx';
// affiliatedCommunity + the create-side-effect copy are single-sourced in the
// modal's pure-logic module (sealed cross-link formulas).
import { affiliatedCommunity, scoringNeededBody } from '../modals/stakeholder-logic.js';
import { StakeholderModal, useUiEvent } from '../modals/stakeholder-modal.jsx';
/* Phase 20: the mobile companion's quick-view field mapping (pure,
 * node-tested — mobile-logic.js header carries the declarations). */
import { quickViewFields } from '../mobile-logic.js';
import {
  MASTER_WORKSPACE_ID, isMasterWorkspace, visibleStakeholders, createJoinFor,
  archivedStakeholders, workspaceLabel as workspaceLabelOf,
} from '../data/workspace.js';
import { WorkHQBand } from './workhq.jsx';
import { withIgnores, withoutIgnore } from './workhq-logic.js';
// Phase 18: the import wizard (sealed demo-features BUILD-MAP) + its pure
// commit builders / copy (node-tested in scripts/import-test.mjs).
import { ImportWizard } from '../import/import-wizard.jsx';
import {
  buildImportRecords, importedBody, importedSnack,
} from '../import/import-logic.js';

/* workHQ layout-mode persistence (DECLARED per-device UI preference — the
 * table's column-order localStorage pattern; NOT a synced store table). */
const WORKHQ_MODE_KEY = 'hp_workhq_mode';
const WORKHQ_MODES = ['split', 'intel', 'table'];
function loadWorkhqMode() {
  try {
    const v = localStorage.getItem(WORKHQ_MODE_KEY);
    return WORKHQ_MODES.includes(v) ? v : 'split';
  } catch { return 'split'; }
}

/* Phase 17: one bulk-action ui-menu, PORTALED to document.body (the
 * established in-page ui-menu pattern — workHQ's IgnoredMenu, the Plan
 * editor's AddShMenu: the component positions in PAGE coordinates, so it
 * must not sit inside a positioned ancestor). The anchor button toggles it
 * natively (ui-menu's anchor contract); rows fire onPick. ui-menu caps its
 * own height and scrolls, so long tag/workspace catalogs stay usable.       */
function BulkMenu({ anchorId, items, onPick, menuClass = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.setAttribute('anchor', anchorId);
  }, [anchorId]);
  return createPortal(
    <ui-menu ref={ref} class={`bulk-menu ${menuClass}`.trim()}>
      {items.map((it) => (
        <ui-menu-item key={it.value} onClick={() => onPick(it.value)}>
          {it.label}
        </ui-menu-item>
      ))}
    </ui-menu>,
    document.body,
  );
}

/* Sealed NotesModal date stamp: toLocaleDateString {month:short, day:numeric,
 * year:numeric}, or "-" when the entry has no date.                          */
function noteDate(at) {
  if (!at) return '-';
  const d = new Date(at);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function SheetPage({
  createNonce = 0, activeWorkspaceId = MASTER_WORKSPACE_ID, onOpenCommunityEntry,
  onOpenWorkspace, onOpenUserProfile, openStakeholderId = null, onConsumeOpen,
  /* Phase 15 (ruled workHQ seams, mirroring the onOpen* pattern): plain view
   * switches for the summary's mix/plans segments and the card View-alls. */
  onOpenMap, onOpenPlans, onOpenScoring, onOpenCommunity,
  /* Phase 20 (sealed MOBILE COMPANION): at mobile widths this page presents
   * the compact stakeholder list + the quick-view bottom sheet; the Message
   * action opens the shell's messaging overlay (full-width on mobile). */
  isMobile = false, onOpenMessages,
}) {
  const [stakeholders, setStakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const [scores, setScores] = usePersistentState('scores', SEED_SCORES);
  const [team] = usePersistentState('team', SEED_TEAM);
  const [users] = usePersistentState('users', SEED_USERS);
  const [community] = usePersistentState('community', SEED_COMMUNITY);
  const [workspaces] = usePersistentState('workspaces', SEED_WORKSPACES);
  const [stakeholderWorkspaces, setStakeholderWorkspaces] =
    usePersistentState('stakeholderWorkspaces', SEED_STAKEHOLDER_WORKSPACES);
  const [, setMessages] = usePersistentState('messages', SEED_MESSAGES);
  /* Phase 15: plans feed the workHQ summary's active-plans segment (read-only
   * here); intelIgnores is the RULED per-user ignore table (Store seam). */
  const [plans] = usePersistentState('plans', SEED_PLANS);
  const [intelIgnores, setIntelIgnores] = usePersistentState('intelIgnores', {});
  const { companyCategories, companyMarkets, companySites, companyIssues,
          companyTags } = useCompanyCatalogs();

  /* workHQ layout mode (sealed three modes; per-device persistence declared
   * above). */
  const [intelMode, setIntelMode] = useState(loadWorkhqMode);
  const setWorkhqMode = (m) => {
    if (!WORKHQ_MODES.includes(m)) return;
    setIntelMode(m);
    try { localStorage.setItem(WORKHQ_MODE_KEY, m); } catch { /* memory-only */ }
  };

  const tableRef = useRef(null);
  const dialogRef = useRef(null);
  const composerRef = useRef(null);
  const snackRef = useRef(null);
  // The table listeners bind once (mount-effect); these refs keep the C5
  // community-open and I6 user-open routes reading the LIVE list + seams,
  // never a stale closure.
  const communityRef = useRef(community);
  communityRef.current = community;
  const openCommunityRef = useRef(onOpenCommunityEntry);
  openCommunityRef.current = onOpenCommunityEntry;
  const openUserRef = useRef(onOpenUserProfile);
  openUserRef.current = onOpenUserProfile;

  // Selection lifts to the page (sealed: shared with Map/Scoring when those
  // phases land). Held; no consumer yet.
  const [, setSelectedId] = useState(null);
  // Phase 17: the bulk selection (mirrors the table's bulk-selection-change
  // stream); drives the host-owned action bar.
  const [bulkIds, setBulkIds] = useState([]);
  /* Phase 24: the ARCHIVED VIEW state — the view flag, its own selection
   * stream (a separate table element), the armed UNDO set (the exact ids the
   * last archive landed on — the snackbar action restores exactly those),
   * and the delete-forever confirm. */
  const [archivedView, setArchivedView] = useState(false);
  const [archBulkIds, setArchBulkIds] = useState([]);
  const [undoIds, setUndoIds] = useState(null);
  const [confirmForever, setConfirmForever] = useState(false);
  const archRef = useRef(null);
  const foreverRef = useRef(null);
  const [notesFor, setNotesFor] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');
  // Phase 18: the import wizard (opened by the table's footer import-open).
  const [importOpen, setImportOpen] = useState(false);
  // Phase 20: the mobile quick-view subject (null = closed sheet).
  const [quickViewId, setQuickViewId] = useState(null);
  const qvRef = useRef(null);
  // The component's own scrim-tap/swipe/Esc dismiss → sync the page state.
  useUiEvent(qvRef, 'close', () => setQuickViewId(null));

  // StakeholderModal routing state: null | { mode:'create' } |
  // { mode:'edit', id, view? }. The Lists edit routes (frozen edit icon +
  // name dblclick) open EDIT MODE directly (no view flag — sealed census C1);
  // view:true (the sealed initialView read-only profile) is reserved for the
  // profile's own sealed openers when their phases land (e.g. Scoring drill).
  const [shModal, setShModal] = useState(null);

  // currentUser = the seeded first user UNTIL THE LOGIN PHASE lands the real
  // signed-in identity (sealed build order; do not invent auth here).
  /* Phase 23: currentUser = the SESSION user resolved against the directory
   * (the one seam, data/session.js) — the users[0] stand-in is retired. */
  const currentUser = useCurrentUser(users);

  /* Sealed row mapping over the WORKSPACE-VISIBLE set (Phase 6: Master = the
   * union; a workspace = join-filtered): each visible stakeholder computes,
   * live, _x/_y = weightedCoord (RAW — toFixed(1) is display-only, applied by
   * the table) · _status = statusFor over the RAW position · _unscored
   * (team.length > 0 AND no team member has a score) · community = affiliated
   * engagement names (pills; C5 make-real click routes back here).           */
  const rows = useMemo(() =>
    visibleStakeholders(stakeholders, stakeholderWorkspaces, activeWorkspaceId)
      .map((s) => {
        const pos = weightedCoord(s.id, scores, team);
        const perRater = scores[s.id] || {};
        return {
          ...s,
          _x: pos.x,
          _y: pos.y,
          _status: statusFor(pos.x, pos.y),
          _unscored: team.length > 0 && !team.some((m) => perRater[m.id]),
          community: affiliatedCommunity(s.id, community).map((a) => a.name),
        };
      }),
  [stakeholders, stakeholderWorkspaces, activeWorkspaceId, scores, team, community]);

  /* Phase 24: the workspace-scoped ARCHIVED rows — the same sealed row
   * mapping over the archived set (zone pills etc. render identically in
   * the read-only view). The count drives the "Archived (N)" entry point. */
  const archivedRows = useMemo(() =>
    archivedStakeholders(stakeholders, stakeholderWorkspaces, activeWorkspaceId)
      .map((s) => {
        const pos = weightedCoord(s.id, scores, team);
        const perRater = scores[s.id] || {};
        return {
          ...s,
          _x: pos.x,
          _y: pos.y,
          _status: statusFor(pos.x, pos.y),
          _unscored: team.length > 0 && !team.some((m) => perRater[m.id]),
          community: affiliatedCommunity(s.id, community).map((a) => a.name),
        };
      }),
  [stakeholders, stakeholderWorkspaces, activeWorkspaceId, scores, team, community]);

  /* Phase 24: the ONE snackbar entry — every show routes here so an armed
   * Undo can never dangle on an unrelated message; the snackbar's own close
   * (timeout/dismiss) disarms it too (effect below). */
  const showSnack = (msg, ids = null) => {
    setUndoIds(ids && ids.length ? ids : null);
    snackRef.current?.show(msg);
  };
  const showSnackRef = useRef(showSnack);
  showSnackRef.current = showSnack;
  useEffect(() => {
    const sb = snackRef.current;
    if (!sb) return;
    const onClose = () => setUndoIds(null);
    sb.addEventListener('close', onClose);
    return () => sb.removeEventListener('close', onClose);
  }, []);

  // Manifest: data/catalogs/users are JS properties — feed through the ref.
  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    el.catalogs = {
      CATEGORIES: companyCategories, MARKETS: companyMarkets,
      GEOGRAPHIES, US_STATES, SITES: companySites, siteLabel,
    };
    el.users = users;
    // Sealed CSV filename base = the workspace name; Master keeps the sealed
    // "stakeholders.csv" fallback (empty label → csvFilename fallback).
    el.workspaceLabel = isMasterWorkspace(activeWorkspaceId)
      ? ''
      : (workspaces.find((w) => w.id === activeWorkspaceId)?.name || '');
    el.data = rows;
    /* archivedView in the deps (Phase 24): leaving the Archived view REMOUNTS
     * this table with otherwise-unchanged deps — without the flag the feed
     * would not re-run and the fresh element would show its gallery sample. */
  }, [rows, users, workspaces, activeWorkspaceId,
    companyCategories, companyMarkets, companySites, archivedView]);

  /* THE ONE PERSISTENCE SEAM — every table edit flows out as row-change
   * {id, patch} and lands here: updateStakeholder + updatedAt stamp.         */
  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    const onRowChange = (e) => {
      const { id, patch } = e.detail;
      setStakeholders((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch, updatedAt: nowStamp() } : s)));
    };
    // On OPEN the composer clears — draft state AND the persistent ui-textarea
    // element (not only after add): a draft abandoned on close/switch must
    // never leak into the next stakeholder's composer. The element itself is
    // (re)cleared in the [notesFor] effect below, which runs once it exists.
    const onNotesOpen = (e) => {
      setNoteDraft('');
      if (composerRef.current) composerRef.current.value = '';
      setNotesFor(e.detail.id);
    };
    const onSelect = (e) => setSelectedId(e.detail.id);
    // SEALED EDIT ROUTE (replaces the Phase-3 pending snackbar): the row's
    // frozen edit icon AND the name-cell double-click both emit open-record —
    // both open the StakeholderModal directly in EDIT MODE (sealed census C1:
    // "StakeholderModal (EDIT mode) for that row"; NO initialView here). The
    // read-only profile stays reachable via its own sealed routes when they
    // land (e.g. the Scoring drill / Plan row click in later phases) and via
    // the form's "View Stakeholder" flip.
    const onOpenRecord = (e) => setShModal({ mode: 'edit', id: e.detail.id });
    // SEALED C5 ROUTE (make-real; replaces the Phase-3..8 pending snackbar):
    // a community pill opens THAT entry's read view through the shell's
    // deep-link seam. The pill event carries the entry NAME (the column
    // renders names), so resolve name -> id against the live list; an
    // unresolvable name gets an honest snackbar, never a dead route.
    const onCommunityOpen = (e) => {
      const entry = (communityRef.current || []).find((c) => c.name === e.detail.name);
      const route = openCommunityRef.current;
      if (entry && route) route(entry.id);
      else showSnackRef.current(`"${e.detail.name}" — no matching community entry`);
    };
    // CENSUS I6 ROUTE (make-real): an owners-popover row opens that user's
    // profile through the shell's ONE user seam (existence-guarded there).
    const onUserOpen = (e) => openUserRef.current?.(e.detail.userId);
    // PHASE 17: the bulk selection stream — the table owns the checkboxes
    // (incl. select-all-filtered + shift ranges), the page owns the actions.
    const onBulkSelection = (e) => setBulkIds(e.detail.ids);
    // PHASE 18: the footer Import affordance (the `importable` attribute)
    // only signals — this host owns the wizard.
    const onImportOpen = () => setImportOpen(true);
    el.addEventListener('row-change', onRowChange);
    el.addEventListener('import-open', onImportOpen);
    el.addEventListener('notes-open', onNotesOpen);
    el.addEventListener('selection-change', onSelect);
    el.addEventListener('open-record', onOpenRecord);
    el.addEventListener('community-open', onCommunityOpen);
    el.addEventListener('user-open', onUserOpen);
    el.addEventListener('bulk-selection-change', onBulkSelection);
    return () => {
      el.removeEventListener('row-change', onRowChange);
      el.removeEventListener('import-open', onImportOpen);
      el.removeEventListener('notes-open', onNotesOpen);
      el.removeEventListener('selection-change', onSelect);
      el.removeEventListener('open-record', onOpenRecord);
      el.removeEventListener('community-open', onCommunityOpen);
      el.removeEventListener('user-open', onUserOpen);
      el.removeEventListener('bulk-selection-change', onBulkSelection);
    };
    /* Phase 19: rows.length === 0 in the deps — the table conditionally
     * yields to the empty state, so the bindings must re-attach when it
     * remounts (el is null while empty; the guard above returns).
     * Phase 24: archivedView too — the Archived view swaps the table out. */
  }, [setStakeholders, rows.length === 0, archivedView]);

  /* ── PHASE 24: the ARCHIVED table's feed + bindings (its own element —
   * separate selection stream; open-record maps to the READ profile, the
   * A20/I4 deep-link ruling: never straight into edit from the archive).
   * Notes/community/user routes are the same live seams as the main table. */
  useEffect(() => {
    const el = archRef.current;
    if (!el) return;
    el.catalogs = {
      CATEGORIES: companyCategories, MARKETS: companyMarkets,
      GEOGRAPHIES, US_STATES, SITES: companySites, siteLabel,
    };
    el.users = users;
    // Declared filename: "<workspace> archived" → the sealed rule slugs it
    // ("Hawk_archived.csv"; Master → "stakeholders_archived.csv").
    const base = isMasterWorkspace(activeWorkspaceId)
      ? 'stakeholders'
      : (workspaces.find((w) => w.id === activeWorkspaceId)?.name || 'stakeholders');
    el.workspaceLabel = `${base} archived`;
    el.data = archivedRows;
  }, [archivedView, archivedRows, users, workspaces, activeWorkspaceId,
    companyCategories, companyMarkets, companySites]);

  useEffect(() => {
    const el = archRef.current;
    if (!el) return;
    const onBulk = (e) => setArchBulkIds(e.detail.ids);
    const onOpenRecord = (e) => setShModal({ mode: 'edit', id: e.detail.id, view: true });
    const onNotesOpen = (e) => {
      setNoteDraft('');
      if (composerRef.current) composerRef.current.value = '';
      setNotesFor(e.detail.id);
    };
    const onCommunityOpen = (e) => {
      const entry = (communityRef.current || []).find((c) => c.name === e.detail.name);
      const route = openCommunityRef.current;
      if (entry && route) route(entry.id);
      else showSnackRef.current(`"${e.detail.name}" — no matching community entry`);
    };
    const onUserOpen = (e) => openUserRef.current?.(e.detail.userId);
    el.addEventListener('bulk-selection-change', onBulk);
    el.addEventListener('open-record', onOpenRecord);
    el.addEventListener('notes-open', onNotesOpen);
    el.addEventListener('community-open', onCommunityOpen);
    el.addEventListener('user-open', onUserOpen);
    return () => {
      el.removeEventListener('bulk-selection-change', onBulk);
      el.removeEventListener('open-record', onOpenRecord);
      el.removeEventListener('notes-open', onNotesOpen);
      el.removeEventListener('community-open', onCommunityOpen);
      el.removeEventListener('user-open', onUserOpen);
    };
  }, [archivedView, archivedRows.length === 0]);

  /* ── NOTES MODAL (sealed NotesModal spec) ─────────────────────────────── */
  const subject = notesFor ? stakeholders.find((s) => s.id === notesFor) : null;

  // HISTORY (sealed): start from notesHistory; if empty but notes exists,
  // synthesize the single legacy entry {id:"n-legacy", body:notes,
  // at:lastContact||now, by:null}; newest first via (b.at||"").localeCompare.
  const history = useMemo(() => {
    if (!subject) return [];
    let h = (subject.notesHistory || []).slice();
    if (!h.length && subject.notes) {
      h = [{ id: 'n-legacy', body: subject.notes, at: subject.lastContact || nowStamp(), by: null }];
    }
    return h.sort((a, b) => (b.at || '').localeCompare(a.at || ''));
  }, [subject]);

  // ui-dialog open state + its close event (scrim click / Escape / Close all
  // route through 'close' — a pending unsubmitted draft is lost silently, sealed).
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    if (notesFor) dlg.setAttribute('open', '');
    else dlg.removeAttribute('open');
    const onClose = () => setNotesFor(null);
    dlg.addEventListener('close', onClose);
    return () => dlg.removeEventListener('close', onClose);
  }, [notesFor]);

  // ui-textarea is a web component: track the composer draft via its input
  // event. On every OPEN (notesFor set/changed) the persistent element's value
  // clears too — the composer always starts blank for the new subject.
  useEffect(() => {
    const ta = composerRef.current;
    if (!ta) return;
    if (notesFor) ta.value = '';
    const onInput = () => setNoteDraft(ta.value || '');
    ta.addEventListener('input', onInput);
    return () => ta.removeEventListener('input', onInput);
  }, [notesFor]);

  /* Sealed add: entry { id: uid("n"), body, at: ISO now, by: currentUser.id },
   * APPENDED to notesHistory, AND notes mirrors the new text; composer clears. */
  const addNote = () => {
    const body = noteDraft.trim();
    if (!body || !subject) return;
    const entry = { id: uid('n'), body, at: nowStamp(), by: currentUser ? currentUser.id : null };
    setStakeholders((prev) => prev.map((s) => (s.id === subject.id
      ? { ...s, notesHistory: [...(s.notesHistory || []), entry], notes: body, updatedAt: nowStamp() }
      : s)));
    setNoteDraft('');
    if (composerRef.current) composerRef.current.value = '';
  };

  const userById = (id) => users.find((u) => u.id === id);

  /* ── STAKEHOLDER CREATE / EDIT / DELETE (Phase 4) ─────────────────────── */

  // currentUser: the seeded first user until the login phase (as above).
  // CREATE ROUTE (sealed addNonceFor adaptation): the shell's context-aware
  // (+) bumps createNonce; every bump opens the modal in create mode.
  // STALE-NONCE GUARD: the ref captures the nonce as it stood when THIS
  // SheetPage mounted, and the modal opens only when the nonce INCREASES past
  // it — so remounting the page (press +, cancel, go to Map, come back) can
  // never replay an already-consumed create request.
  const seenNonce = useRef(createNonce);
  useEffect(() => {
    if (createNonce > seenNonce.current) {
      seenNonce.current = createNonce;
      setShModal({ mode: 'create' });
    }
  }, [createNonce]);

  /* DEEP-LINK OPEN (Phase 12; census C6 mechanics, A20/I4 READ-VIEW ruling):
   * a shell-routed stakeholder request (mention chip, and — Phase 13 — the
   * user profile page's Relationships rows) opens THAT record in the
   * read-only profile view — Edit stays one
   * click away — then consumes the seam. The shell's resolver already
   * guarded existence (census A23); the some() here keeps the page honest
   * against a mid-flight delete. */
  useEffect(() => {
    if (!openStakeholderId) return;
    if (stakeholders.some((s) => s.id === openStakeholderId)) {
      setShModal({ mode: 'edit', id: openStakeholderId, view: true });
    }
    if (onConsumeOpen) onConsumeOpen();
  }, [openStakeholderId]);

  /* addStakeholder (sealed): mint uid("sh"); stamp createdBy + createdAt/
   * updatedAt; owners default to [currentUser.id] when empty; PREPEND to the
   * collection; write the workspace join; post the SYSTEM MESSAGE to c-system
   * from u-system, kind "scoring-needed" (sealed body, verbatim).            */
  const addStakeholder = (data) => {
    const id = uid('sh');
    const rec = {
      ...data,
      id,
      createdBy: currentUser ? currentUser.id : null,
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
      owners: (data.owners && data.owners.length)
        ? data.owners
        : (currentUser ? [currentUser.id] : []),
    };
    setStakeholders((prev) => [rec, ...prev]);
    // Sealed join rule (REAL as of Phase 6): ws = forceWorkspaceId ||
    // (isMaster ? null : activeWorkspaceId) — creating from a workspace
    // auto-assigns there; from Master → unassigned (empty membership array).
    setStakeholderWorkspaces((prev) => ({ ...prev, [id]: createJoinFor(activeWorkspaceId) }));
    // Sealed system-message side effect (drives the Scoring badge + Reminders).
    setMessages((prev) => ({
      ...prev,
      'c-system': [
        ...(prev['c-system'] || []),
        {
          id: uid('m'),
          from: 'u-system',
          body: scoringNeededBody(rec.name, rec.type, rec.id),
          at: nowStamp(),
          kind: 'scoring-needed',
        },
      ],
    }));
    return id;
  };

  const updateStakeholder = (id, patch) => {
    setStakeholders((prev) => prev.map((s) => (
      s.id === id ? { ...s, ...patch, updatedAt: nowStamp() } : s
    )));
  };

  /* deleteStakeholders — the SEALED CASCADE (App-shell box): remove the
   * stakeholder, purge scores[id], purge stakeholderWorkspaces[id]. (The
   * wider owners-reference scrub belongs to the removeUser cascade, not this
   * one.) Phase 24: generalized over a set through the ONE pure builder
   * (cascadeDeleteStakeholders) so the modal's danger delete and the
   * Archived view's bulk delete-forever run the SAME code path — one
   * setState per store, reference-honest (replace-don't-duplicate).        */
  const deleteStakeholders = (ids) => {
    const r = cascadeDeleteStakeholders(stakeholders, scores, stakeholderWorkspaces, ids);
    if (r.stakeholders !== stakeholders) setStakeholders(r.stakeholders);
    if (r.scores !== scores) setScores(r.scores);
    if (r.joins !== stakeholderWorkspaces) setStakeholderWorkspaces(r.joins);
    return r.landed;
  };
  const deleteStakeholder = (id) => { deleteStakeholders([id]); };

  // Sealed cross-link: workspaces that contain this stakeholder (join map).
  const getWorkspacesForStakeholder = (id) =>
    workspaces.filter((w) => (stakeholderWorkspaces[id] || []).includes(w.id));

  /* ── PHASE 15: workHQ handlers ────────────────────────────────────────── */
  const isMaster = isMasterWorkspace(activeWorkspaceId);

  // Census G2: the band's quick-add opens the SAME create modal the shell's
  // context-aware (+) nonce route opens (the one create seam's endpoint).
  const workhqAddStakeholder = () => setShModal({ mode: 'create' });

  // Census G1 MAKE-REAL + the A20/I4 ruling: band entry names open the
  // stakeholder's READ view (Edit one click away), guarded against a
  // mid-flight delete like the deep-link seam above.
  const workhqOpenStakeholder = (id) => {
    if (stakeholders.some((s) => s.id === id)) {
      setShModal({ mode: 'edit', id, view: true });
    }
  };

  /* Ruled cold "View all": arm the table's DECLARED preset (the exact state
   * the Filter/Sort popovers set — High priority, lastContact stalest-first)
   * and collapse the band so the table takes over. */
  const workhqViewAllCold = () => {
    const el = tableRef.current;
    if (el) {
      el.preset = {
        filters: { priority: ['High'] },
        sortKey: 'lastContact',
        sortDir: 'asc', // oldest lastContact first = stalest first ('' leads)
      };
    }
    setWorkhqMode('table');
  };

  /* Ruled ignores (per-user, through the ONE Store seam). liveKeys = the
   * card's current entry keys, passed by the band so each WRITE also GCs
   * ignore keys whose entry no longer exists (bounded — never on render). */
  const workhqIgnore = (cardKey, entryKey, liveKeys) =>
    setIntelIgnores((prev) => withIgnores(prev, currentUser?.id, cardKey, [entryKey], liveKeys));
  const workhqIgnoreAll = (cardKey, entryKeys, liveKeys) =>
    setIntelIgnores((prev) => withIgnores(prev, currentUser?.id, cardKey, entryKeys, liveKeys));
  const workhqUnignore = (cardKey, entryKey) =>
    setIntelIgnores((prev) => withoutIgnore(prev, currentUser?.id, cardKey, entryKey));

  /* ── PHASE 17: bulk-action handlers (each write = ONE setState through a
   * pure builder). HONEST COUNTS (2026-07-05 audit F5): the builders return
   * { next, landed } and the snackbar reports what ACTUALLY landed — the
   * builders no-op already-satisfied rows, so the selection size would lie
   * at a scale where the changed rows may sit off-screen. The value-form
   * setState is deliberate: landed must be known at dispatch time for the
   * snackbar (React defers functional updaters), and the handlers fire from
   * user events over current state — still ONE setState per action. ───── */
  const bulkSetPriority = (level) => {
    const { next, landed } = bulkPatchStakeholders(stakeholders, bulkIds, { priority: level }, nowStamp());
    if (next !== stakeholders) setStakeholders(next);
    showSnack(bulkActionSummary(landed, bulkIds.length, `Priority set to ${level}`));
  };
  const bulkTag = (tag) => {
    const { next, landed } = bulkAddTag(stakeholders, bulkIds, tag, nowStamp());
    if (next !== stakeholders) setStakeholders(next);
    showSnack(bulkActionSummary(landed, bulkIds.length, `Tag "${tag}" added`));
  };
  const bulkAssign = (wsId) => {
    const wsName = workspaces.find((w) => w.id === wsId)?.name || wsId;
    const { next, landed } = bulkAssignWorkspace(stakeholderWorkspaces, bulkIds, wsId);
    if (next !== stakeholderWorkspaces) setStakeholderWorkspaces(next);
    showSnack(bulkActionSummary(landed, bulkIds.length, `Added to "${wsName}"`));
  };
  // Export selected rides the table's sealed CSV path over the selection
  // (filtered order) — replace-don't-duplicate. Zero-row guard (audit F2):
  // the bar retires when the selection prunes empty, but if export ever
  // fires with nothing selected it says so — never a silent no-op.
  const bulkExport = () => {
    const el = tableRef.current;
    if (!el) return;
    if (!el.selection.length) { showSnack('No rows selected to export'); return; }
    el.exportSelected();
  };
  const bulkClear = () => tableRef.current?.clearSelection();

  /* ── PHASE 24: archive-family handlers (each write = ONE setState through
   * a pure builder; value-form for the same dispatch-time-count reason as
   * the Phase-17 handlers above). ───────────────────────────────────────── */

  // ARCHIVE (live bar; any signed-in user): one stamped write over the
  // selection; the honest snackbar arms UNDO with EXACTLY the landed ids.
  // The archived rows leave `rows`, so the table prunes the selection and
  // the bar retires on its own (the ruled prune contract).
  const bulkArchiveSelected = () => {
    const { next, landed, changedIds } =
      bulkArchive(stakeholders, bulkIds, nowStamp(), currentUser ? currentUser.id : null);
    if (next !== stakeholders) setStakeholders(next);
    showSnack(archiveSummary(landed, bulkIds.length), changedIds);
  };

  // UNDO (snackbar action): restore the exact landed set — a plain flag
  // clear (archiving cascaded nothing, so restore resurrects nothing).
  const undoArchive = () => {
    const ids = undoIds || [];
    const { next, landed } = bulkRestore(stakeholders, ids, nowStamp());
    if (next !== stakeholders) setStakeholders(next);
    showSnack(restoreSummary(landed, ids.length));
  };

  // RESTORE (archived-view bar).
  const archRestore = () => {
    const { next, landed } = bulkRestore(stakeholders, archBulkIds, nowStamp());
    if (next !== stakeholders) setStakeholders(next);
    showSnack(restoreSummary(landed, archBulkIds.length));
  };

  // DELETE FOREVER (archived-view bar, behind the confirm dialog): the ONE
  // sealed cascade over the selection. No undo — the confirm says so.
  const archDeleteForever = () => {
    setConfirmForever(false);
    const landed = deleteStakeholders(archBulkIds);
    showSnack(deleteForeverSummary(landed));
  };

  const archExport = () => {
    const el = archRef.current;
    if (!el) return;
    if (!el.selection.length) { showSnack('No rows selected to export'); return; }
    el.exportSelected();
  };
  const archClear = () => archRef.current?.clearSelection();

  // View toggles: each direction drops the OTHER surface's selection state
  // (the element unmounts and takes its checkboxes with it).
  const openArchivedView = () => { setArchivedView(true); setBulkIds([]); };
  const closeArchivedView = () => { setArchivedView(false); setArchBulkIds([]); };

  /* The delete-forever confirm ui-dialog (the notes-modal open/close
   * pattern): scrim/Escape and the Cancel button all land on 'close'. */
  useEffect(() => {
    const dlg = foreverRef.current;
    if (!dlg) return;
    if (confirmForever) dlg.setAttribute('open', '');
    else dlg.removeAttribute('open');
    const onClose = () => setConfirmForever(false);
    dlg.addEventListener('close', onClose);
    return () => dlg.removeEventListener('close', onClose);
  }, [confirmForever]);

  /* ── PHASE 18: IMPORT (sealed demo-features flow) ─────────────────────── */

  // The LIVE catalog context the validator + template read (the Phase-11
  // company seam for every editable set; fixed enums from catalogs.js; the
  // system user never resolves as an Owner or appears in the template).
  const importCtx = useMemo(() => ({
    categories: companyCategories,
    markets: companyMarkets,
    geographies: GEOGRAPHIES,
    usStates: US_STATES,
    sites: companySites,
    siteLabel,
    issues: companyIssues,
    tags: companyTags,
    users: users.filter((u) => u.role !== 'system'),
    priorities: PRIORITY_OPTIONS,
    statuses: STAKEHOLDER_STATUS,
  }), [companyCategories, companyMarkets, companySites, companyIssues,
    companyTags, users]);

  /* COMMIT (sealed): mint uids + audit stamps (buildImportRecords), PREPEND
   * in ONE setState (the standing scale ruling — never N writes); imported
   * from a workspace → auto-assigned there via the sealed createJoinFor seam
   * (Master → empty membership, exactly the create route); ONE aggregate
   * scoring-needed system message (declared: the per-record post would spam
   * c-system at import scale); sealed snackbar "Imported N stakeholders". */
  const commitImport = (validRows) => {
    const stamp = nowStamp();
    const records = buildImportRecords(validRows, {
      uid, stamp, currentUserId: currentUser ? currentUser.id : null, normalizeUrl,
    });
    if (!records.length) return;
    setStakeholders((prev) => [...records, ...prev]);
    const join = createJoinFor(activeWorkspaceId);
    setStakeholderWorkspaces((prev) => {
      const next = { ...prev };
      for (const r of records) next[r.id] = [...join];
      return next;
    });
    setMessages((prev) => ({
      ...prev,
      'c-system': [
        ...(prev['c-system'] || []),
        {
          id: uid('m'),
          from: 'u-system',
          body: importedBody(records.length),
          at: stamp,
          kind: 'scoring-needed',
        },
      ],
    }));
    setImportOpen(false);
    showSnack(importedSnack(records.length));
  };

  /* ── PHASE 20: MOBILE QUICK-VIEW actions (sealed: "stakeholder quick-view
   * · add-note · messages"). Add note = the SAME NotesModal composition + the
   * ONE addNote seam below (ui-dialog + ui-textarea — exactly the sealed
   * BUILD-MAP); the sheet closes first so the dialog stands alone on the
   * small viewport. Message = the shell's messaging overlay (full-width at
   * mobile widths), the sealed third surface. ─────────────────────────────── */
  const qvRow = quickViewId ? rows.find((r) => r.id === quickViewId) || null : null;
  const qvAddNote = () => {
    const id = quickViewId;
    setQuickViewId(null);
    // Mirror the table's notes-open route: the composer always starts blank.
    setNoteDraft('');
    if (composerRef.current) composerRef.current.value = '';
    setNotesFor(id);
  };
  const qvMessage = () => {
    setQuickViewId(null);
    if (onOpenMessages) onOpenMessages();
  };

  const shExisting = shModal && shModal.id
    ? stakeholders.find((s) => s.id === shModal.id) || null
    : null;

  /* Census C9 (sealed REAL): the profile's engagement rows open that
   * community entry's read view — the modal closes and the shell routes
   * through its community deep-link seam (onOpenCommunityEntry). Rows stay
   * honestly inert (no handler) on a host without the route. */
  const openCommunityFromModal = onOpenCommunityEntry
    ? (id) => { setShModal(null); onOpenCommunityEntry(id); }
    : undefined;

  return (
    <div className="sheet-wrap">
      {isMobile ? (
        /* ── PHASE 20: MOBILE COMPANION (sealed Demo-features box) ─────────
           The compact stakeholder list — name + org + zone chip (ui-list
           rows; the zone chip reads the same single-sourced --ui-sys-zone-*
           tokens as everywhere). Tapping opens the quick-view bottom sheet.
           workHQ, bulk actions and the full grid are DESKTOP surfaces
           (sealed: "everything else is desktop-web"); the zero-data empty
           state keeps its real create/import routes. */
        rows.length === 0 ? (
          <EmptyState
            icon="table_rows"
            line={LISTS_EMPTY_LINE}
            actionLabel="Add stakeholder"
            onAction={() => setShModal({ mode: 'create' })}
            secondaryLabel="Import"
            onSecondary={() => setImportOpen(true)}
          />
        ) : (
          <ui-list interactive="" class="mobile-sh-list" aria-label="Stakeholders">
            {rows.map((r) => (
              <ui-list-item
                key={r.id}
                interactive=""
                class="m-sh-row"
                onClick={() => setQuickViewId(r.id)}
              >
                <span className="m-row-name">{displayName(r) || r.name}</span>
                <span slot="supporting">{r.org || '—'}</span>
                <ui-chip slot="trailing" variant="zone" data-zone={r._status}>
                  {r._status}
                </ui-chip>
              </ui-list-item>
            ))}
          </ui-list>
        )
      ) : archivedView ? (
        /* ── PHASE 24: the ARCHIVED VIEW (desktop) — the same grid, readonly,
           with its own Restore / Delete-forever bar. Declared composition:
           head (back + title + honest scope line) · selection bar · table. */
        <div className="archived-wrap">
          <div className="archived-head">
            <ui-icon-button variant="standard" aria-label="Back to Lists"
                            title="Back to Lists" onClick={closeArchivedView}>
              <ui-icon>arrow_back</ui-icon>
            </ui-icon-button>
            <div className="archived-titles">
              <span className="archived-title">{ARCHIVED_VIEW_TITLE}</span>
              <span className="archived-line">{ARCHIVED_VIEW_LINE}</span>
            </div>
          </div>
          {archBulkIds.length > 0 && (
            <div className="bulk-bar" role="toolbar" aria-label="Archived bulk actions">
              <span className="bulk-count">
                <strong>{archBulkIds.length}</strong> selected
              </span>
              <ui-button variant="outlined" onClick={archRestore}>
                <ui-icon slot="leading" size="sm">unarchive</ui-icon>Restore
              </ui-button>
              {/* The ONLY bulk hard-delete in the app (the declared safety
                  model: always two-step — archive first, then this, behind
                  the confirm). */}
              <ui-button variant="outlined" tone="danger"
                         onClick={() => setConfirmForever(true)}>
                <ui-icon slot="leading" size="sm">delete_forever</ui-icon>
                Delete forever…
              </ui-button>
              <span className="bulk-spacer"></span>
              <ui-button variant="text" onClick={archExport} aria-label="Export selected to CSV">
                <ui-icon slot="leading" size="sm">download</ui-icon>Export selected
              </ui-button>
              <ui-button variant="text" onClick={archClear}>Clear selection</ui-button>
            </div>
          )}
          {archivedRows.length === 0 ? (
            <EmptyState
              icon="archive"
              line={ARCHIVED_EMPTY_LINE}
              secondaryLabel="Back to Lists"
              onSecondary={closeArchivedView}
            />
          ) : (
            /* The SAME domain component in its Phase-24 readonly mode:
               selection live (the bar above), writes impossible (no editor
               mounts, row-change never fires), export/search/filter intact.
               key forces a fresh element vs the live table (clean selection,
               static attributes). */
            <ui-stakeholder-table key="archived" ref={archRef}
                                  class="sheet-table archived-table"
                                  readonly="" selectable=""
                                  kbd-label={cmdKeyLabel}></ui-stakeholder-table>
          )}
        </div>
      ) : (
      /* SEALED HOST TREE (workHQ box): .intel-split carries data-mode HERE
          in the host; the band renders ABOVE the table, divider between,
          table untouched below. */
      <div className="intel-split" data-mode={intelMode}>
        <WorkHQBand
          mode={intelMode}
          setMode={setWorkhqMode}
          stakeholders={rows}
          scores={scores}
          team={team}
          community={community}
          plans={plans}
          currentUser={currentUser}
          isMaster={isMaster}
          workspaceLabel={workspaceLabelOf(workspaces, activeWorkspaceId)}
          workspaceId={activeWorkspaceId}
          ignores={intelIgnores}
          onIgnore={workhqIgnore}
          onIgnoreAll={workhqIgnoreAll}
          onUnignore={workhqUnignore}
          onAddStakeholder={workhqAddStakeholder}
          onOpenStakeholder={workhqOpenStakeholder}
          onOpenCommunityEntry={onOpenCommunityEntry}
          onOpenCommunity={onOpenCommunity}
          onOpenMap={onOpenMap}
          onOpenPlans={onOpenPlans}
          onOpenScoring={onOpenScoring}
          onViewAllCold={workhqViewAllCold}
        />
        <ui-divider></ui-divider>

        {/* PHASE 17 — BULK SELECTION ACTION BAR (declared pattern: surfaces
            ABOVE the table when ≥1 row is selected; the table toolbar stays
            intact). Host-owned so every write stays page-owned; the menus
            are portaled ui-menu compositions (established pattern). No bulk
            delete — deferred to the Enterprise soft-delete semantics. */}
        {bulkIds.length > 0 && (
          <div className="bulk-bar" role="toolbar" aria-label="Bulk actions">
            <span className="bulk-count">
              <strong>{bulkIds.length}</strong> selected
            </span>
            <ui-button variant="outlined" id="bulk-ws-btn"
                       disabled={workspaces.length ? undefined : ''}>
              Assign to workspace…
            </ui-button>
            <ui-button variant="outlined" id="bulk-tag-btn"
                       disabled={companyTags.length ? undefined : ''}>
              Add tag…
            </ui-button>
            <ui-button variant="outlined" id="bulk-priority-btn">Set priority…</ui-button>
            {/* PHASE 24: ARCHIVE — the recoverable bulk remove (any signed-in
                user; one stamped write; snackbar UNDO). The only route toward
                bulk deletion: the live list itself never hard-deletes (the
                declared safety model — delete lives in the Archived view). */}
            <ui-button variant="outlined" class="bulk-archive-btn" onClick={bulkArchiveSelected}>
              <ui-icon slot="leading" size="sm">archive</ui-icon>Archive
            </ui-button>
            <span className="bulk-spacer"></span>
            <ui-button variant="text" onClick={bulkExport} aria-label="Export selected to CSV">
              <ui-icon slot="leading" size="sm">download</ui-icon>Export selected
            </ui-button>
            <ui-button variant="text" onClick={bulkClear}>Clear selection</ui-button>
            {/* Assign menu: the LIVE workspaces list (Master is not a
                workspace — it is the union view, never a join target). */}
            <BulkMenu anchorId="bulk-ws-btn" menuClass="bulk-menu-ws"
                      items={workspaces.map((w) => ({ value: w.id, label: w.name }))}
                      onPick={bulkAssign} />
            {/* Tag menu: the LIVE companyTags seam (Settings-fed). */}
            <BulkMenu anchorId="bulk-tag-btn" menuClass="bulk-menu-tag"
                      items={companyTags.map((t) => ({ value: t, label: t }))}
                      onPick={bulkTag} />
            {/* Priority menu: the sealed hardcoded catalog, single-sourced. */}
            <BulkMenu anchorId="bulk-priority-btn" menuClass="bulk-menu-priority"
                      items={PRIORITY_OPTIONS.map((p) => ({ value: p, label: p }))}
                      onPick={bulkSetPriority} />
          </div>
        )}

        {/* PHASE 24 — the ARCHIVED entry point (declared placement: a quiet
            right-aligned strip between the workHQ divider and the table;
            rendered only when the workspace scope holds archived rows — no
            dead control at zero, make-real law). */}
        {archivedRows.length > 0 && (
          <div className="archived-strip">
            <ui-button variant="text" class="archived-toggle" onClick={openArchivedView}>
              <ui-icon slot="leading" size="sm">archive</ui-icon>
              {archivedToggleLabel(archivedRows.length)}
            </ui-button>
          </div>
        )}

        {/* kbd-label: the cmd-key hint is single-sourced in the store
            (cmdKeyLabel) and PASSED to the table — never re-derived inside.
            selectable (Phase 17): THIS host carries the bulk-action bar, so
            it opts into the table's selection column.
            PHASE 19 (sealed "empty states per page", declared): a truly
            EMPTY workspace-visible set substitutes the shared empty state
            for the table node — both actions are the page's existing real
            flows. The table's listener effect keys on this emptiness so its
            bindings re-attach when the table remounts. */}
        {rows.length === 0 ? (
          <EmptyState
            icon="table_rows"
            line={LISTS_EMPTY_LINE}
            actionLabel="Add stakeholder"
            onAction={() => setShModal({ mode: 'create' })}
            secondaryLabel="Import"
            onSecondary={() => setImportOpen(true)}
          />
        ) : (
          /* id="lists-table": the Phase-20 onboarding tour's step-4 anchor
             (absent on a zero-data profile — the coachmark's no-anchor
             fallback centers the card, by design). */
          <ui-stakeholder-table ref={tableRef} id="lists-table" class="sheet-table"
                                selectable="" importable=""
                                kbd-label={cmdKeyLabel}></ui-stakeholder-table>
        )}
      </div>
      )}

      {/* PHASE 20 — QUICK-VIEW (sealed: ui-sheet BOTTOM variant hosting the
          read profile summary, with Add-note + Message actions). Mounted on
          mobile only; the component's scrim/swipe/Esc dismiss syncs back via
          its close event. */}
      {isMobile && (
        <ui-sheet ref={qvRef} open={quickViewId && qvRow ? '' : undefined}
                  class="sh-quickview" aria-label="Stakeholder quick view">
          {qvRow && (
            <div className="qv-body">
              <div className="qv-head">
                <div className="qv-titles">
                  <span className="qv-name">{displayName(qvRow) || qvRow.name}</span>
                  <span className="qv-org">{qvRow.org || '—'}</span>
                </div>
                <ui-chip variant="zone" data-zone={qvRow._status}>{qvRow._status}</ui-chip>
              </div>
              <div className="qv-grid">
                {quickViewFields(qvRow, users).map((f) => (
                  <div className="qv-field" key={f.label}>
                    <span className="qv-field-label">{f.label}</span>
                    <span className="qv-field-value">{f.value}</span>
                  </div>
                ))}
              </div>
              <div className="qv-actions">
                <ui-button variant="filled" onClick={qvAddNote}>
                  <ui-icon slot="leading" size="sm">notes</ui-icon>
                  Add note
                </ui-button>
                <ui-button variant="outlined" onClick={qvMessage}>
                  <ui-icon slot="leading" size="sm">chat</ui-icon>
                  Message
                </ui-button>
              </div>
            </div>
          )}
        </ui-sheet>
      )}

      {/* PHASE 18 — IMPORT WIZARD (sealed 4-step ui-dialog flow; the table's
          footer Import button opens it; commit lands above as ONE setState). */}
      <ImportWizard
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onCommit={commitImport}
        catalogsCtx={importCtx}
        workspaceName={isMaster ? '' : (workspaces.find((w) => w.id === activeWorkspaceId)?.name || '')}
      />

      {/* NotesModal → ui-dialog (sealed CANONICAL-UI map: scrim closes; head
          eyebrow "Notes" over the stakeholder name; history newest first;
          composer with the "Dated today…" line + Close + Add note). */}
      <ui-dialog ref={dialogRef}>
        {subject && (
          <>
            {/* Sealed NotesModal head: eyebrow + name, plus the HEAD CLOSE
                icon-button — the third of the three equivalent dismissal
                routes (scrim · head close · footer Close). */}
            <div slot="headline" className="notes-head">
              <div className="notes-head-text">
                <span className="notes-eyebrow">Notes</span>
                <span className="notes-title">{displayName(subject) || subject.name}</span>
              </div>
              <ui-icon-button variant="standard" aria-label="Close" onClick={() => setNotesFor(null)}>
                <ui-icon>close</ui-icon>
              </ui-icon-button>
            </div>
            <div className="notes-body">
              {history.length === 0 ? (
                <div className="notes-empty">No notes yet. Add the first one below.</div>
              ) : (
                <div className="notes-history">
                  {history.map((n) => {
                    const author = n.by ? userById(n.by) : null;
                    return (
                      <div className="notes-entry" key={n.id}>
                        <div className="notes-entry-meta">
                          <span className="notes-entry-date">{noteDate(n.at)}</span>
                          {author
                            ? <span className="notes-entry-by">· {author.name}</span>
                            : <span className="notes-entry-by muted">· legacy</span>}
                        </div>
                        <div className="notes-entry-body">{n.body}</div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="notes-composer">
                <span className="notes-composer-label">Add a new note</span>
                <ui-textarea
                  ref={composerRef}
                  rows="3"
                  placeholder="Write what happened, what was said, or what you learned…"
                ></ui-textarea>
              </div>
            </div>
            <div slot="actions" className="notes-foot">
              <span className="notes-foot-note">
                Dated today, posted as {currentUser?.name || 'you'}.
              </span>
              <ui-button variant="text" onClick={() => setNotesFor(null)}>Close</ui-button>
              <ui-button
                variant="filled"
                disabled={noteDraft.trim() ? undefined : ''}
                onClick={addNote}
              >Add note</ui-button>
            </div>
          </>
        )}
      </ui-dialog>

      {/* CREATE / EDIT STAKEHOLDER MODAL (sealed StakeholderModal). The
          sealed MAKE-REAL wiring: companyTags IS passed (Tags usable from
          Lists) and onDelete IS passed (the Delete section is reachable) —
          the oracle's unflagged omissions are not replicated. REAL as of
          Phase 11: the company sets are the LIVE Settings-fed catalogs
          (appConfig with the sealed present-AND-non-empty seed fallback). */}
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
          else addStakeholder(data);
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

      {/* PHASE 24 — DELETE FOREVER confirm (the declared two-step's second
          gate; mirrors the sealed modal delete-confirm composition: headline
          + honest cascade copy + Cancel / danger action). */}
      <ui-dialog ref={foreverRef} class="forever-confirm">
        {confirmForever && (
          <>
            <span slot="headline">
              Delete {archBulkIds.length} archived stakeholder{archBulkIds.length === 1 ? '' : 's'} forever?
            </span>
            <p className="forever-copy">
              This permanently removes {archBulkIds.length === 1 ? 'the record and its' : 'the records and their'} scores
              and workspace assignments. There is no undo.
            </p>
            <div slot="actions">
              <ui-button variant="text" onClick={() => setConfirmForever(false)}>Cancel</ui-button>
              <ui-button variant="filled" tone="danger" class="forever-go" onClick={archDeleteForever}>
                Delete forever
              </ui-button>
            </div>
          </>
        )}
      </ui-dialog>

      {/* The page snackbar: C5 fallbacks, bulk honest counts, and (Phase 24)
          the archive UNDO — the ui-snackbar action slot, rendered only while
          an undo set is armed (showSnack disarms it on any other message;
          the snackbar close event disarms on timeout/dismiss). */}
      <ui-snackbar ref={snackRef}>
        {undoIds ? (
          <ui-button slot="action" variant="text" class="snack-undo" onClick={undoArchive}>
            Undo
          </ui-button>
        ) : null}
      </ui-snackbar>
    </div>
  );
}
