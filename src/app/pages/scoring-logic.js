/* scoring-logic.js — the Scoring page's PURE helpers, built from the sealed
 * box "Scoring & weighting — the team matrix, edit-only-your-column, weighted
 * position" (+ the "Scoring cadence" box's unscored detection) in
 * src/guide.jsx. Factored for node (scripts/scoring-test.mjs asserts these
 * against the sealed text). No DOM, no store — every function is pure.
 */

/* ── clamp (sealed THE CELL + cell rules, oracle-exact) ─────────────────────
 * "the clamp helper: a non-numeric entry becomes 0; anything out of range
 *  snaps to the nearest bound (Math.max(min, Math.min(max, n))) — and clamp
 *  NEVER ROUNDS"
 * OPEN BUILD-TIME RULING (sealed, decide with the user): whether typed values
 * coerce to integers. Shipped start-state = the oracle-exact non-rounding
 * clamp (fractional typed scores persist); never silently either — recorded
 * here and in the phase report.                                             */
export function clampScore(v, min = -10, max = 10) {
  let n = Number(v);
  if (isNaN(n)) n = 0;
  return Math.max(min, Math.min(max, n));
}

/* Stepper rule (sealed): ±1 from the current value, CLAMPED to [-10,10].
 * An unscored axis steps from 0 (the record it creates carries the result). */
export function stepScore(current, delta) {
  const cur = Number(current);
  return clampScore((isNaN(cur) ? 0 : cur) + delta);
}

/* ── nextScoreRecord — the FIRST-TOUCH-ZERO correction ─────────────────────
 * SEALED DO-NOT-REPLICATE (Scoring box, UNSCORED ≠ (0,0)): the oracle's
 * editable cell read sc = (scores[s.id]||{})[m.id] || { x: 0, y: 0 } and
 * every handler spread that fallback — so the FIRST edit of one axis of a
 * never-scored cell silently persisted 0 for the OTHER axis. NOT REPLICATED.
 * SEALED REBUILD BEHAVIOR (verbatim): "entering or stepping one axis creates
 * the score record whole — the entered value on that axis, 0 on the untouched
 * axis — and from that moment both fields display their stored values. The
 * record is thus only ever created by a deliberate act, and the UI never
 * fakes a 0/0 before that act." (The sealed alternative — require both axes
 * before saving — is an at-seal user confirmation; the specified behavior is
 * shipped.) createdAt stamps on the FIRST record; updatedAt on EVERY change. */
export function nextScoreRecord(existing, axis, rawValue, now) {
  const v = clampScore(rawValue);
  if (existing) {
    return { ...existing, [axis]: v, updatedAt: now };
  }
  return {
    x: 0, y: 0,               // the untouched axis 0-fills ON THE DELIBERATE ACT
    [axis]: v,
    createdAt: now,
    updatedAt: now,
  };
}

/* ── team-bar ordering (sealed THE TEAM BAR rule, verbatim) ─────────────────
 * "(1) the logged-in user first, (2) then workspace owners in their listed
 *  order (by workspaceOwners index), (3) then everyone else in original
 *  order." Members map to users via m.userId.                               */
export function orderedTeam(team, currentUserId, workspaceOwners = []) {
  const rest = [...(team || [])];
  const out = [];
  const meIdx = rest.findIndex((m) => m.userId === currentUserId);
  if (meIdx >= 0) out.push(rest.splice(meIdx, 1)[0]);
  for (const ownerId of workspaceOwners) {
    const i = rest.findIndex((m) => m.userId === ownerId);
    if (i >= 0) out.push(rest.splice(i, 1)[0]);
  }
  return out.concat(rest); // everyone else, original order
}

/* ── % of team (sealed EXACT FORMULA) ───────────────────────────────────────
 * pct = totalW > 0 ? Math.round((weight / totalW) * 100) : 0 — integer;
 * renders "0% of team" when the total team weight is 0.                    */
export function pctOfTeam(weight, totalW) {
  return totalW > 0 ? Math.round((weight / totalW) * 100) : 0;
}

export function totalWeight(team) {
  return (team || []).reduce((sum, m) => sum + (m.weight ?? 0), 0);
}

/* Sealed TRI-COLOR TINT key: weight === 1 → baseline (neutral grey token) ·
 * weight > 1 → over (green token) · weight < 1 → under (amber token).      */
export function weightTint(weight) {
  if (weight === 1) return 'baseline';
  return weight > 1 ? 'over' : 'under';
}

/* ── unscored detection (sealed Scoring-cadence box, verbatim guards) ───────
 * isUnscoredBy(stakeholderId, teamMemberId): GUARD — a falsy teamMemberId can
 * never mark anything unscored (returns false); else !record. A saved record
 * — INCLUDING A DELIBERATE (0,0) — counts as SCORED (the object is truthy);
 * consistent with "unscored ≠ (0,0)".                                       */
export function isUnscoredBy(scores, stakeholderId, teamMemberId) {
  if (!teamMemberId) return false;
  return !((scores || {})[stakeholderId] || {})[teamMemberId];
}

/* unscoredCount (sealed NAV-TABS RIGHT CLUSTER formula WITH GUARDS):
 * currentTeamMember = team.find(m => m.userId === currentUser.id); if the
 * user has NO team-member row → 0 (never dereference). SCOPE (sealed,
 * verified): filters the GLOBAL stakeholders array — every stakeholder in
 * the org counts, regardless of the active workspace.                       */
export function unscoredCountFor(stakeholders, scores, team, currentUserId) {
  const member = (team || []).find((m) => m.userId === currentUserId);
  if (!member) return 0;
  return (stakeholders || [])
    .filter((s) => isUnscoredBy(scores, s.id, member.id)).length;
}

/* Weighted-column display (sealed): each axis to ONE decimal, valence-toned
 * (x >= 0 → pos, else neg; same for y).                                     */
export function axisDisplay(v) {
  return { text: v.toFixed(1), tone: v >= 0 ? 'pos' : 'neg' };
}

/* Sealed weight readout: "{(m.weight ?? 0).toFixed(1)}×" (header sub-label
 * "weight {value}×" and the card's value cell share this).                  */
export function weightReadout(weight) {
  return (weight ?? 0).toFixed(1) + '×';
}

/* Add-teammate candidates (sealed ADD A TEAMMATE): users NOT already on the
 * team, excluding the system bot (role !== "system").                       */
export function teammateCandidates(users, team) {
  const onTeam = new Set((team || []).map((m) => m.userId));
  return (users || []).filter((u) => u.role !== 'system' && !onTeam.has(u.id));
}

/* Remove-member score purge (sealed SCORE RECORD rule): removing a teammate
 * deletes that teammate's entry from EVERY stakeholder's row.               */
export function purgeMemberScores(scores, memberId) {
  const next = {};
  for (const [sid, row] of Object.entries(scores || {})) {
    if (row && row[memberId] !== undefined) {
      const { [memberId]: _gone, ...rest } = row;
      next[sid] = rest;
    } else {
      next[sid] = row;
    }
  }
  return next;
}

/* Remove-control gate — sealed DO-NOT-REPLICATE correction (the oracle showed
 * remove on EVERY card with NO check): "a MANAGER may remove ANY teammate; a
 * teammate may remove THEMSELVES; a plain member cannot remove other members;
 * show the control only when the current user is a manager or it is their
 * own card."                                                                */
export function canRemoveMember(currentUser, member) {
  if (!currentUser || !member) return false;
  if (currentUser.role === 'manager') return true;
  return member.userId === currentUser.id;
}

/* ── PHASE 19 — SCORING no-team empty state (sealed ~3899 "empty states per
 * page", forward-design copy). Renders in place of the matrix when the
 * scoring TEAM is empty (the no-team edge — e.g. a blank-started org); the
 * action is the team bar's existing real add-teammate flow. */
export const SCORING_NO_TEAM_LINE =
  "No scoring team yet. Add teammates to score this workspace's stakeholders " +
  'and place them on the map.';
