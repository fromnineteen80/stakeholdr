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
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState, uid, nowStamp, cmdKeyLabel } from '../data/store.js';
import { weightedCoord, statusFor } from '../data/engine.js';
import {
  SEED_STAKEHOLDERS, SEED_SCORES, SEED_TEAM, SEED_USERS, SEED_COMMUNITY,
  SEED_WORKSPACES, SEED_STAKEHOLDER_WORKSPACES, SEED_MESSAGES, SEED_PLANS,
} from '../data/seed.js';
import { GEOGRAPHIES, US_STATES, siteLabel } from '../data/catalogs.js';
/* REAL as of Phase 11: the editable company sets (categories/markets/sites/
 * issues/tags) read the LIVE appConfig-with-seed-fallback seam (sealed
 * present-AND-non-empty contract) — Settings edits propagate to every select
 * here with no reload. GEOGRAPHIES/US_STATES stay fixed enums (sealed). */
import { useCompanyCatalogs } from '../data/company.js';
// displayName is single-sourced with the design-system's pure Lists logic
// (the sealed Shared-primitives formula lives beside the table that renders it).
import { displayName } from '../../../design-system/components/stakeholder-table.js';
// affiliatedCommunity + the create-side-effect copy are single-sourced in the
// modal's pure-logic module (sealed cross-link formulas).
import { affiliatedCommunity, scoringNeededBody } from '../modals/stakeholder-logic.js';
import { StakeholderModal } from '../modals/stakeholder-modal.jsx';
import {
  MASTER_WORKSPACE_ID, isMasterWorkspace, visibleStakeholders, createJoinFor,
  workspaceLabel as workspaceLabelOf,
} from '../data/workspace.js';
import { WorkHQBand } from './workhq.jsx';
import { withIgnores, withoutIgnore } from './workhq-logic.js';

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
  const [notesFor, setNotesFor] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');

  // StakeholderModal routing state: null | { mode:'create' } |
  // { mode:'edit', id, view? }. The Lists edit routes (frozen edit icon +
  // name dblclick) open EDIT MODE directly (no view flag — sealed census C1);
  // view:true (the sealed initialView read-only profile) is reserved for the
  // profile's own sealed openers when their phases land (e.g. Scoring drill).
  const [shModal, setShModal] = useState(null);

  // currentUser = the seeded first user UNTIL THE LOGIN PHASE lands the real
  // signed-in identity (sealed build order; do not invent auth here).
  const currentUser = users[0] || null;

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
  }, [rows, users, workspaces, activeWorkspaceId,
    companyCategories, companyMarkets, companySites]);

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
      else snackRef.current?.show(`"${e.detail.name}" — no matching community entry`);
    };
    // CENSUS I6 ROUTE (make-real): an owners-popover row opens that user's
    // profile through the shell's ONE user seam (existence-guarded there).
    const onUserOpen = (e) => openUserRef.current?.(e.detail.userId);
    el.addEventListener('row-change', onRowChange);
    el.addEventListener('notes-open', onNotesOpen);
    el.addEventListener('selection-change', onSelect);
    el.addEventListener('open-record', onOpenRecord);
    el.addEventListener('community-open', onCommunityOpen);
    el.addEventListener('user-open', onUserOpen);
    return () => {
      el.removeEventListener('row-change', onRowChange);
      el.removeEventListener('notes-open', onNotesOpen);
      el.removeEventListener('selection-change', onSelect);
      el.removeEventListener('open-record', onOpenRecord);
      el.removeEventListener('community-open', onCommunityOpen);
      el.removeEventListener('user-open', onUserOpen);
    };
  }, [setStakeholders]);

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

  /* deleteStakeholder — the SEALED CASCADE (App-shell box): remove the
   * stakeholder, purge scores[id], purge stakeholderWorkspaces[id]. (The
   * wider owners-reference scrub belongs to the removeUser cascade, not this
   * one.)                                                                    */
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

  /* Ruled ignores (per-user, through the ONE Store seam). */
  const workhqIgnore = (cardKey, entryKey) =>
    setIntelIgnores((prev) => withIgnores(prev, currentUser?.id, cardKey, [entryKey]));
  const workhqIgnoreAll = (cardKey, entryKeys) =>
    setIntelIgnores((prev) => withIgnores(prev, currentUser?.id, cardKey, entryKeys));
  const workhqUnignore = (cardKey, entryKey) =>
    setIntelIgnores((prev) => withoutIgnore(prev, currentUser?.id, cardKey, entryKey));

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
      {/* SEALED HOST TREE (workHQ box): .intel-split carries data-mode HERE
          in the host; the band renders ABOVE the table, divider between,
          table untouched below. */}
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
        {/* kbd-label: the cmd-key hint is single-sourced in the store
            (cmdKeyLabel) and PASSED to the table — never re-derived inside. */}
        <ui-stakeholder-table ref={tableRef} class="sheet-table" kbd-label={cmdKeyLabel}></ui-stakeholder-table>
      </div>

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

      {/* Fallback surface for unresolvable community-pill opens (C5 guard). */}
      <ui-snackbar ref={snackRef}></ui-snackbar>
    </div>
  );
}
