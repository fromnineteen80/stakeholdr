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
 * ui-textarea composition per the sealed NotesModal spec), and the honest
 * pending affordances for open-record / community-open (those surfaces land
 * in their own build phases — no silent dead clicks, per the make-real law).
 *
 * Scoping (sealed Ecosystem box): Lists filters to the active workspace via
 * the stakeholderWorkspaces join; this shell is still pinned to Master (the
 * union of ALL stakeholders). The workspace filter wires up with the
 * shell-state phase — workspaceLabel feeds the sealed CSV filename rule.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState, uid, nowStamp, cmdKeyLabel } from '../data/store.js';
import { weightedCoord, statusFor } from '../data/engine.js';
import {
  SEED_STAKEHOLDERS, SEED_SCORES, SEED_TEAM, SEED_USERS, SEED_COMMUNITY,
} from '../data/seed.js';
import { CATEGORIES, MARKETS, GEOGRAPHIES, US_STATES, SITES, siteLabel } from '../data/catalogs.js';
// displayName is single-sourced with the design-system's pure Lists logic
// (the sealed Shared-primitives formula lives beside the table that renders it).
import { displayName } from '../../../design-system/components/stakeholder-table.js';

/* affiliatedCommunity (sealed cross-link formula): applications where the
 * stakeholder is REPRESENTED (representedStakeholderId, the primary) OR
 * LINKED (linkedStakeholders).                                               */
function affiliatedCommunity(stakeholderId, community) {
  return (community || []).filter(
    (a) => a.representedStakeholderId === stakeholderId ||
           (a.linkedStakeholders || []).includes(stakeholderId),
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

export function SheetPage() {
  const [stakeholders, setStakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const [scores] = usePersistentState('scores', SEED_SCORES);
  const [team] = usePersistentState('team', SEED_TEAM);
  const [users] = usePersistentState('users', SEED_USERS);
  const [community] = usePersistentState('community', SEED_COMMUNITY);

  const tableRef = useRef(null);
  const dialogRef = useRef(null);
  const composerRef = useRef(null);
  const snackRef = useRef(null);

  // Selection lifts to the page (sealed: shared with Map/Scoring when those
  // phases land). Held; no consumer yet.
  const [, setSelectedId] = useState(null);
  const [notesFor, setNotesFor] = useState(null);
  const [noteDraft, setNoteDraft] = useState('');

  // currentUser = the seeded first user UNTIL THE LOGIN PHASE lands the real
  // signed-in identity (sealed build order; do not invent auth here).
  const currentUser = users[0] || null;

  /* Sealed row mapping: each visible stakeholder computes, live,
   * _x/_y = weightedCoord (RAW — toFixed(1) is display-only, applied by the
   * table) · _status = statusFor over the RAW position · _unscored
   * (team.length > 0 AND no team member has a score) · community = affiliated
   * engagement names (pills; C5 make-real click routes back here).           */
  const rows = useMemo(() => stakeholders.map((s) => {
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
  }), [stakeholders, scores, team, community]);

  // Manifest: data/catalogs/users are JS properties — feed through the ref.
  useEffect(() => {
    const el = tableRef.current;
    if (!el) return;
    el.catalogs = { CATEGORIES, MARKETS, GEOGRAPHIES, US_STATES, SITES, siteLabel };
    el.users = users;
    el.workspaceLabel = ''; // Master → the sealed "stakeholders.csv" fallback
    el.data = rows;
  }, [rows, users]);

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
    // Honest pending affordance (make-real law: no silent dead click) — the
    // full stakeholder record opens in the RECORD phase.
    const onOpenRecord = () => snackRef.current?.show('Stakeholder record — opens in the Record build phase');
    const onCommunityOpen = (e) =>
      snackRef.current?.show(`"${e.detail.name}" — the community entry view opens in the Community build phase`);
    el.addEventListener('row-change', onRowChange);
    el.addEventListener('notes-open', onNotesOpen);
    el.addEventListener('selection-change', onSelect);
    el.addEventListener('open-record', onOpenRecord);
    el.addEventListener('community-open', onCommunityOpen);
    return () => {
      el.removeEventListener('row-change', onRowChange);
      el.removeEventListener('notes-open', onNotesOpen);
      el.removeEventListener('selection-change', onSelect);
      el.removeEventListener('open-record', onOpenRecord);
      el.removeEventListener('community-open', onCommunityOpen);
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

  return (
    <div className="sheet-wrap">
      {/* kbd-label: the cmd-key hint is single-sourced in the store
          (cmdKeyLabel) and PASSED to the table — never re-derived inside. */}
      <ui-stakeholder-table ref={tableRef} class="sheet-table" kbd-label={cmdKeyLabel}></ui-stakeholder-table>

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

      {/* Pending-affordance surface for record/community opens (make-real law). */}
      <ui-snackbar ref={snackRef}></ui-snackbar>
    </div>
  );
}
