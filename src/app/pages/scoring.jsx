/* scoring.jsx — the Scoring page at PHASE-6 depth, assembled against the
 * sealed box "Scoring & weighting — the team matrix, edit-only-your-column,
 * weighted position" (SKELETON TREE root: div.scoring-wrap → the shell's
 * main content slot) + the "Scoring cadence" box's unscored semantics.
 *
 * DATA MODEL (sealed): team + scores are GLOBAL — ONE team, ONE score-set per
 * stakeholder. The active workspace changes only WHICH ROWS appear (the
 * stakeholderWorkspaces join). Scoring is DISABLED on Master (the shell hides
 * the nav item and redirects; this page also guards).
 *
 * FIRST-TOUCH-ZERO — SEALED DO-NOT-REPLICATE, honored here: the oracle's
 * editable-cell handlers spread the {x:0,y:0} fallback on EVERY change, so
 * the first edit of one axis of a never-scored cell silently persisted a fake
 * 0 for the other axis. The rebuild ships the sealed correction instead
 * (Scoring box, EDITABLE-CELL RULE, verbatim): an unscored own cell renders
 * BOTH fields empty (em-dash placeholders); entering or stepping one axis
 * "creates the score record whole — the entered value on that axis, 0 on the
 * untouched axis"; the record is only ever created by a DELIBERATE act and
 * the UI never fakes a 0/0 before it. Implemented in nextScoreRecord
 * (scoring-logic.js) + the empty-raw guard in the commit handlers below.
 *
 * DECLARED DEPARTURE (gradients): the sealed matrix records gold gradient
 * header/computed surfaces AND flags them against the "no gradients ever"
 * design law — shipped flat via the --ui-sys-scoring-header-* /
 * --ui-sys-derived-cell-surface tokens (see tokens.css for both citations).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState, uid, nowStamp } from '../data/store.js';
import { weightedCoord, statusFor } from '../data/engine.js';
import {
  SEED_STAKEHOLDERS, SEED_SCORES, SEED_TEAM, SEED_USERS, SEED_COMMUNITY,
  SEED_WORKSPACES, SEED_STAKEHOLDER_WORKSPACES, SEED_MESSAGES,
} from '../data/seed.js';
import { ISSUES, TAGS } from '../data/catalogs.js';
import {
  visibleStakeholders, createJoinFor, isMasterWorkspace,
} from '../data/workspace.js';
import {
  clampScore, stepScore, nextScoreRecord, orderedTeam, pctOfTeam, totalWeight,
  weightTint, weightReadout, axisDisplay, teammateCandidates,
  purgeMemberScores, canRemoveMember,
} from './scoring-logic.js';
import { displayName } from '../../../design-system/components/stakeholder-table.js';
import { scoringNeededBody } from '../modals/stakeholder-logic.js';
import { StakeholderModal } from '../modals/stakeholder-modal.jsx';

export function ScoringPage({ activeWorkspaceId, workspaceOwners = [], createNonce = 0, onDeleteWorkspace }) {
  const [stakeholders, setStakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const [scores, setScores] = usePersistentState('scores', SEED_SCORES);
  const [team, setTeam] = usePersistentState('team', SEED_TEAM);
  const [users] = usePersistentState('users', SEED_USERS);
  const [community] = usePersistentState('community', SEED_COMMUNITY);
  const [workspaces] = usePersistentState('workspaces', SEED_WORKSPACES);
  const [stakeholderWorkspaces, setStakeholderWorkspaces] =
    usePersistentState('stakeholderWorkspaces', SEED_STAKEHOLDER_WORKSPACES);
  const [, setMessages] = usePersistentState('messages', SEED_MESSAGES);

  // currentUser = the seeded first user until the login phase (sealed order).
  const currentUser = users[0] || null;
  const currentMember = team.find((m) => m.userId === currentUser?.id) || null;

  const wrapRef = useRef(null);
  const addDlgRef = useRef(null);
  const lastDlgRef = useRef(null);
  const fieldRefs = useRef(new Map());

  const [addOpen, setAddOpen] = useState(false);
  const [pickedId, setPickedId] = useState(null);
  // Sealed SOLE-MEMBER-LEAVE: the pending last-member id; veil/close clears it.
  const [lastMemberId, setLastMemberId] = useState(null);
  const [replacementId, setReplacementId] = useState('');
  const [shModal, setShModal] = useState(null);

  /* Sealed team-bar ordering: logged-in user · workspace owners by index ·
   * everyone else in original order.                                        */
  const ordered = useMemo(
    () => orderedTeam(team, currentUser?.id, workspaceOwners),
    [team, currentUser, workspaceOwners]);
  const totalW = useMemo(() => totalWeight(team), [team]);

  /* Rows = the ACTIVE WORKSPACE's visible stakeholders (join-filtered);
   * position = the sealed weightedCoord blend over the GLOBAL team+scores.  */
  const rows = useMemo(() => {
    const visible = visibleStakeholders(stakeholders, stakeholderWorkspaces, activeWorkspaceId);
    return visible.map((s) => {
      const pos = weightedCoord(s.id, scores, team);
      return { s, x: pos.x, y: pos.y, status: statusFor(pos.x, pos.y) };
    });
  }, [stakeholders, stakeholderWorkspaces, activeWorkspaceId, scores, team]);

  /* ── SCORE WRITES — the ONE store seam ──────────────────────────────────
   * scores[stakeholderId][memberId] = { x, y, createdAt(first),
   * updatedAt(every) }; the record shape + first-touch behavior live in
   * nextScoreRecord (sealed correction, see the module header).             */
  const commitScore = (sid, axis, rawValue) => {
    if (!currentMember) return;
    setScores((prev) => {
      const row = prev[sid] || {};
      const rec = nextScoreRecord(row[currentMember.id], axis, rawValue, nowStamp());
      return { ...prev, [sid]: { ...row, [currentMember.id]: rec } };
    });
  };

  const stepAxis = (sid, axis, delta) => {
    if (!currentMember) return;
    const existing = (scores[sid] || {})[currentMember.id];
    // Sealed stepper rule: ±1 from the current value, clamped to [-10,10];
    // an unscored axis steps from 0 (and CREATES the record — deliberate act).
    commitScore(sid, axis, stepScore(existing ? existing[axis] : 0, delta));
  };

  /* ── TEAM MUTATIONS ────────────────────────────────────────────────────── */
  const updateWeight = (memberId, weight) => {
    setTeam((prev) => prev.map((m) => (
      m.id === memberId ? { ...m, weight, updatedAt: nowStamp() } : m
    )));
  };

  /* Sealed removal purge: the member's column of scores is deleted from
   * EVERY stakeholder's row.                                                */
  const removeMember = (memberId) => {
    setTeam((prev) => prev.filter((m) => m.id !== memberId));
    setScores((prev) => purgeMemberScores(prev, memberId));
  };

  /* Sealed SOLE-MEMBER intercept: removing the final teammate routes through
   * the last-teammate dialog instead — no path leaves a workspace teamless. */
  const requestRemove = (memberId) => {
    if (ordered.length === 1) setLastMemberId(memberId);
    else removeMember(memberId);
  };

  /* Sealed addTeamMember: guard falsy/duplicate; weight 1.0 (baseline).     */
  const addMember = (userId) => {
    if (!userId || team.some((m) => m.userId === userId)) return;
    setTeam((prev) => [
      ...prev,
      { id: uid('tm'), userId, weight: 1.0, createdAt: nowStamp(), updatedAt: nowStamp() },
    ]);
  };

  /* ── STAKEHOLDER CREATE via the shell's context-aware (+) ───────────────
   * SEALED "NOT THE (+)" RULE, honored: on Scoring the (+) opens the
   * NEW-STAKEHOLDER modal (the same full add dialog as Lists), NEVER the
   * add-teammate dialog — that one opens only from its own team-bar button. */
  const seenNonce = useRef(createNonce);
  useEffect(() => {
    if (createNonce > seenNonce.current) {
      seenNonce.current = createNonce;
      setShModal({ mode: 'create' });
    }
  }, [createNonce]);

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
    // Sealed auto-assign: created from a workspace → assigned there.
    setStakeholderWorkspaces((prev) => ({ ...prev, [id]: createJoinFor(activeWorkspaceId) }));
    setMessages((prev) => ({
      ...prev,
      'c-system': [
        ...(prev['c-system'] || []),
        { id: uid('m'), from: 'u-system', body: scoringNeededBody(rec.name, rec.type), at: nowStamp(), kind: 'scoring-needed' },
      ],
    }));
    return id;
  };

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

  /* ── DELEGATED CELL/SLIDER EVENTS (native composed events bubble to the
   * wrap; one listener instead of per-cell React bindings) ────────────────── */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onInput = (e) => {
      const t = e.target;
      if (t.tagName === 'UI-SLIDER' && t.dataset.member) {
        updateWeight(t.dataset.member, Number(t.value));
        return;
      }
      if (t.tagName === 'UI-TEXT-FIELD' && t.dataset.sid) {
        const raw = t.value;
        // Mid-typing states ("", "-") defer to the change commit; a complete
        // number commits live (the sealed onChange-per-keystroke behavior,
        // minus the oracle's type-a-minus-becomes-0 trap).
        if (raw === '' || raw === '-') return;
        commitScore(t.dataset.sid, t.dataset.axis, raw);
      }
    };
    const onChange = (e) => {
      const t = e.target;
      if (t.tagName === 'UI-TEXT-FIELD' && t.dataset.sid) {
        const existing = (scores[t.dataset.sid] || {})[currentMember?.id];
        const raw = t.value;
        // FIRST-TOUCH GUARD (sealed): focusing and leaving an unscored cell
        // empty is NOT a deliberate act — no record is created.
        if (!existing && String(raw).trim() === '') return;
        const v = clampScore(raw);
        commitScore(t.dataset.sid, t.dataset.axis, v);
        t.value = String(v); // normalize the display to the stored value
      }
    };
    wrap.addEventListener('input', onInput);
    wrap.addEventListener('change', onChange);
    return () => {
      wrap.removeEventListener('input', onInput);
      wrap.removeEventListener('change', onChange);
    };
  }, [scores, team, currentMember, activeWorkspaceId]);

  /* Sync the (uncontrolled) cell fields from the store — skip the focused
   * field so typing is never clobbered.                                     */
  useEffect(() => {
    if (!currentMember) return;
    for (const [key, el] of fieldRefs.current) {
      const [sid, axis] = key.split('|');
      const rec = (scores[sid] || {})[currentMember.id];
      const want = rec ? String(rec[axis]) : '';
      if (el !== document.activeElement && el.value !== want) el.value = want;
    }
  }, [scores, currentMember, rows]);

  const fieldRef = (key) => (el) => {
    if (el) fieldRefs.current.set(key, el);
    else fieldRefs.current.delete(key);
  };

  /* ── DIALog open/close plumbing (ui-dialog close event) ─────────────────── */
  useEffect(() => {
    const dlg = addDlgRef.current;
    if (!dlg) return;
    if (addOpen) dlg.setAttribute('open', '');
    else dlg.removeAttribute('open');
    const onClose = () => { setAddOpen(false); setPickedId(null); };
    dlg.addEventListener('close', onClose);
    // Sealed: the picker opens with the typeahead FOCUSED (autoFocus) — after
    // the dialog's own focus pass.
    let t;
    if (addOpen) {
      t = setTimeout(() => dlg.querySelector('ui-autocomplete')?.focus(), 80);
    }
    return () => { dlg.removeEventListener('close', onClose); if (t) clearTimeout(t); };
  }, [addOpen]);

  useEffect(() => {
    const dlg = lastDlgRef.current;
    if (!dlg) return;
    if (lastMemberId) dlg.setAttribute('open', '');
    else dlg.removeAttribute('open');
    // Sealed: veil/scrim AND head close both CANCEL — the pending id clears.
    const onClose = () => { setLastMemberId(null); setReplacementId(''); };
    dlg.addEventListener('close', onClose);
    return () => dlg.removeEventListener('close', onClose);
  }, [lastMemberId]);

  const userById = (id) => users.find((u) => u.id === id);
  const candidates = useMemo(() => teammateCandidates(users, team), [users, team]);

  const shExisting = shModal && shModal.id
    ? stakeholders.find((s) => s.id === shModal.id) || null
    : null;

  /* Scoring is a per-workspace act (sealed SCOPING): the shell redirects
   * Master→Map; this guard keeps the page honest if mounted out of order.   */
  if (isMasterWorkspace(activeWorkspaceId)) return null;

  return (
    <div className="scoring-wrap" ref={wrapRef}>
      {/* ── TEAM BAR — one card per teammate, sealed order ─────────────── */}
      <div className="team-bar">
        {ordered.map((m) => {
          const u = userById(m.userId);
          const pct = pctOfTeam(m.weight ?? 0, totalW);
          return (
            <ui-card variant="filled" class="team-card" key={m.id}>
              <div className="team-card-head">
                <ui-avatar size="sm" name={u?.name || 'Teammate'}></ui-avatar>
                <div className="team-card-id">
                  <span className="team-card-name">{u?.name || 'Teammate'}</span>
                  <span className="team-card-title">{u?.title || ''}</span>
                </div>
                {/* REMOVE — sealed permission CORRECTION (never the oracle's
                    ungated control): manager removes any; a member only self. */}
                {canRemoveMember(currentUser, m) && (
                  <ui-icon-button
                    variant="standard"
                    aria-label="Remove"
                    title={m.userId === currentUser?.id ? 'Leave the team' : 'Remove teammate'}
                    onClick={() => requestRemove(m.id)}
                  >
                    <ui-icon size="sm">close</ui-icon>
                  </ui-icon-button>
                )}
              </div>
              <div className="team-weight-row">
                <span className="team-weight-lbl">Weight</span>
                <span className="team-weight-val">{weightReadout(m.weight)}</span>
              </div>
              {/* Sealed WeightSlider: 0.0–2.0 step 0.1, baseline tick at 1.0
                  (fill spans baseline↔value), tick tooltip = the exact copy. */}
              <ui-slider
                min="0" max="2" step="0.1" baseline="1"
                baseline-title="Baseline weight 1.0"
                value={String(m.weight ?? 0)}
                data-member={m.id}
                aria-label={`${u?.name || 'Teammate'} weight`}
              ></ui-slider>
              <div className="team-slider-ends">
                <span>0.0</span><span>1.0 baseline</span><span>2.0</span>
              </div>
              {/* Sealed % OF TEAM readout with the tri-color weight tint. */}
              <div className="team-pct" data-tint={weightTint(m.weight ?? 0)}>
                {pct}% of team
              </div>
            </ui-card>
          );
        })}
        {/* MAKE-REAL (sealed): the oracle's add-teammate dialog was orphaned
            dead wiring (a listener nobody dispatched). The rebuild gives it
            this real affordance on the team bar. */}
        <ui-button
          variant="outlined"
          class="team-add"
          onClick={() => setAddOpen(true)}
        >
          <ui-icon slot="leading" size="sm">person_add</ui-icon>
          Add teammate
        </ui-button>
      </div>

      {/* ── THE MATRIX — sticky Stakeholder col · my editable sticky col ·
             teammates read-only · Weighted (x, y) · Relationship ─────────── */}
      <div className="scoring-table-wrap">
        <table className="scoring-table">
          <thead>
            <tr>
              <th className="sh-col">Stakeholder</th>
              {ordered.map((m) => {
                const u = userById(m.userId);
                const mine = m.userId === currentUser?.id;
                return (
                  <th className={'member' + (mine ? ' my-col' : '')} key={m.id}>
                    {u?.name || 'Teammate'}
                    {/* Sealed: a header is never a bare name — live weight. */}
                    <span className="member-weight">weight {weightReadout(m.weight)}</span>
                  </th>
                );
              })}
              <th className="computed-col">
                Weighted (x, y)
                <span className="derived-sub">derived</span>
              </th>
              <th className="computed-col">Relationship</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ s, x, y, status }) => {
              const dx = axisDisplay(x);
              const dy = axisDisplay(y);
              return (
                <tr key={s.id}>
                  {/* Sealed sh-cell: three stacked lines; click opens that
                      stakeholder's read-only profile (first-class route into
                      the Phase-4 modal, initialView — never a window event). */}
                  <td
                    className="sh-cell"
                    title="Open stakeholder"
                    onClick={() => setShModal({ mode: 'edit', id: s.id, view: true })}
                  >
                    <div className="sh-cell-name">{displayName(s) || s.org}</div>
                    {s.org ? <div className="sh-cell-org">{s.org}</div> : null}
                    <div className="sh-cell-meta">{s.type}</div>
                  </td>
                  {ordered.map((m) => {
                    const mine = m.userId === currentUser?.id;
                    const sc = (scores[s.id] || {})[m.id];
                    if (mine) {
                      return (
                        <td className="my-col" key={m.id}>
                          <div className="xy-input">
                            {['x', 'y'].map((axis) => [
                              <span className="xy-lbl" key={axis + 'l'}>{axis}</span>,
                              /* Sealed editable entry: number field −10..10
                                 step 1; UNSCORED renders EMPTY with the
                                 em-dash placeholder (never a fake 0). */
                              <ui-text-field
                                key={axis + 'f'}
                                ref={fieldRef(s.id + '|' + axis)}
                                variant="plain"
                                align="center"
                                type="number"
                                min="-10" max="10" step="1"
                                placeholder="—"
                                value={sc ? String(sc[axis]) : ''}
                                data-sid={s.id}
                                data-axis={axis}
                                aria-label={`${axis} score for ${displayName(s) || s.org}`}
                              ></ui-text-field>,
                              /* Sealed steppers: ±1 clamped, tabIndex −1. */
                              <span className="xy-spin" key={axis + 's'}>
                                <ui-icon-button
                                  size="xs" variant="standard" tabIndex={-1}
                                  aria-label={`Increase ${axis}`}
                                  onClick={() => stepAxis(s.id, axis, +1)}
                                ><ui-icon size="xs">expand_less</ui-icon></ui-icon-button>
                                <ui-icon-button
                                  size="xs" variant="standard" tabIndex={-1}
                                  aria-label={`Decrease ${axis}`}
                                  onClick={() => stepAxis(s.id, axis, -1)}
                                ><ui-icon size="xs">expand_more</ui-icon></ui-icon-button>
                              </span>,
                            ])}
                          </div>
                        </td>
                      );
                    }
                    const owner = userById(m.userId);
                    return (
                      <td className="ro" key={m.id}>
                        {/* Sealed read-only cell: "{name}'s score" tooltip;
                            unscored renders the em-dash, excluded from the
                            blend (weightedCoord skips missing records). */}
                        <ui-tooltip>
                          {sc ? (
                            <div className="xy-readonly">
                              <span className="xy-readonly-k">x</span>
                              <span className="xy-readonly-v">{sc.x}</span>
                              <span className="xy-readonly-k">y</span>
                              <span className="xy-readonly-v">{sc.y}</span>
                            </div>
                          ) : (
                            <div className="xy-readonly"><span className="xy-empty">—</span></div>
                          )}
                          <span slot="content">{(owner?.name || 'Teammate') + "'s score"}</span>
                        </ui-tooltip>
                      </td>
                    );
                  })}
                  <td className="computed">
                    <span className={dx.tone}>{dx.text}</span>
                    {', '}
                    <span className={dy.tone}>{dy.text}</span>
                  </td>
                  <td className="rel">
                    <ui-chip variant="zone" data-zone={status}>{status}</ui-chip>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── ADD A TEAMMATE (sealed dialog: width 380, typeahead over users
             not on the team excluding system; added at weight 1.0) ───────── */}
      <ui-dialog ref={addDlgRef}>
        {addOpen && (
          <>
            <div slot="headline" className="notes-head">
              <span className="notes-title">Add a teammate</span>
              <ui-icon-button variant="standard" aria-label="Close" onClick={() => setAddOpen(false)}>
                <ui-icon>close</ui-icon>
              </ui-icon-button>
            </div>
            <div className="add-tm-body">
              <span className="sh-lbl">Pick a user</span>
              <ui-autocomplete
                placeholder="Type a name or title…"
                ref={(el) => {
                  if (!el) return;
                  el.options = candidates.map((u) => ({
                    label: u.title ? `${u.name} · ${u.title}` : u.name,
                    value: u.id,
                  }));
                  if (!el.__wired) {
                    el.__wired = true;
                    el.addEventListener('change', (e) => setPickedId(e.detail.value || null));
                  }
                }}
              ></ui-autocomplete>
              <span className="sh-help">
                They'll be added with weight 1.0 (baseline). Adjust afterwards.
              </span>
            </div>
            <div slot="actions">
              <ui-button variant="text" onClick={() => setAddOpen(false)}>Cancel</ui-button>
              <ui-button
                variant="filled"
                disabled={pickedId ? undefined : ''}
                onClick={() => {
                  addMember(pickedId);
                  setAddOpen(false);
                  setPickedId(null);
                }}
              >Add to team</ui-button>
            </div>
          </>
        )}
      </ui-dialog>

      {/* ── LAST-TEAMMATE / WORKSPACE-CLOSURE (sealed: a workspace cannot
             have zero teammates — hand off, or delete the workspace) ─────── */}
      <ui-dialog ref={lastDlgRef}>
        {lastMemberId && (
          <>
            <div slot="headline" className="notes-head">
              <span className="notes-title">Last teammate on this workspace</span>
              <ui-icon-button variant="standard" aria-label="Close" onClick={() => setLastMemberId(null)}>
                <ui-icon>close</ui-icon>
              </ui-icon-button>
            </div>
            <div className="last-tm-body">
              <p className="sh-confirm-body">
                A workspace cannot have zero teammates. Hand off to a replacement,
                or delete the workspace entirely.
              </p>
              <span className="sh-lbl">Hand off to</span>
              <ui-select
                value={replacementId}
                ref={(el) => {
                  if (!el || el.__wired) return;
                  el.__wired = true;
                  el.addEventListener('change', (e) => setReplacementId(e.detail.value || ''));
                }}
              >
                <ui-option value="">Select a teammate…</ui-option>
                {candidates.map((u) => (
                  <ui-option key={u.id} value={u.id}>
                    {u.title ? `${u.name} · ${u.title}` : u.name}
                  </ui-option>
                ))}
              </ui-select>
            </div>
            {/* Sealed foot: EXACTLY TWO actions — destructive "Delete
                workspace" left, "Hand off & remove" right. Cancel is the
                veil/scrim click or the head close (×), never a foot button. */}
            <div slot="actions" className="last-tm-foot">
              <ui-button
                variant="filled" tone="danger"
                onClick={() => {
                  // Sealed: closes/deletes the workspace through the store
                  // seam (the shell's removeWorkspace cascade) → Master.
                  onDeleteWorkspace?.();
                  setLastMemberId(null);
                }}
              >Delete workspace</ui-button>
              <ui-button
                variant="filled"
                disabled={replacementId ? undefined : ''}
                onClick={() => {
                  // Sealed hand-off: add the replacement, then remove the
                  // last member.
                  addMember(replacementId);
                  removeMember(lastMemberId);
                  setLastMemberId(null);
                  setReplacementId('');
                }}
              >Hand off &amp; remove</ui-button>
            </div>
          </>
        )}
      </ui-dialog>

      {/* Stakeholder create (the (+) route) + the name-cell profile opener. */}
      <StakeholderModal
        open={!!shModal}
        existing={shExisting}
        initialView={!!(shModal && shModal.view)}
        users={users}
        currentUser={currentUser}
        companyIssues={ISSUES}
        companyTags={TAGS}
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
      />
    </div>
  );
}
