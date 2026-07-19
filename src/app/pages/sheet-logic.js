/* sheet-logic.js — pure Lists-page logic: the PHASE 17 BULK-ACTION PATCH
 * BUILDERS (FORWARD-DESIGN, declared 2026-07-05 — the sealed demo-features
 * box names "bulk actions" with no oracle spec; designed here under the
 * standing thousands-of-stakeholders scale ruling).
 *
 * THE SCALE LAW these encode: bulk writes are ONE functional update over the
 * whole collection — a single setState per action, never N sequential
 * store writes. Every stakeholder-record mutation stamps updatedAt (the
 * sealed one-seam rule row-change edits already follow); rows a bulk action
 * does not actually change are returned by REFERENCE (no phantom stamps —
 * adding a tag a row already carries, or setting a priority a row already
 * has, is an honest no-op for that row).
 *
 * HONEST COUNTS (2026-07-05 audit F5): every builder returns
 * { next, landed } — `next` is the new collection (the INPUT reference when
 * nothing changed, so setState sees no change), `landed` is the number of
 * rows the write ACTUALLY changed. The snackbar reports landed, never the
 * selection size (bulkActionSummary below), because already-satisfied rows
 * no-op by design.
 *
 * The workspace-assign builder rides the sealed createJoinFor seam for rows
 * with no join entry yet, and set-unions for rows that have one (the join
 * map carries no stamps — sealed shape: { stakeholderId: [workspaceId] }).
 *
 * PHASE 24 closes the deferred gap ABOVE the trap (the SAFETY MODEL,
 * declared): the live list gains bulk ARCHIVE (the Enterprise box's soft
 * delete — recoverable, one stamped write, snackbar UNDO); bulk DELETE
 * exists ONLY inside the Archived view, so mass destruction is always a
 * TWO-STEP (archive first, then delete from the archive behind a confirm).
 * A direct bulk hard-delete from the live list stays absent BY DESIGN.
 * Pure + node-testable (scripts/scale-test.mjs, scripts/archive-test.mjs).
 */
import { createJoinFor } from '../data/workspace.js';

const asArr = (v) => (Array.isArray(v) ? v : []);

/* bulkPatchStakeholders(stakeholders, ids, patch, stamp) → { next, landed } —
 * ONE pass, ONE new array: every selected row whose values differ takes
 * { ...patch, updatedAt: stamp }; a selected row that ALREADY satisfies
 * every patch key keeps its reference (honest no-op — no phantom stamp);
 * unselected rows keep their reference. Empty selection / empty patch /
 * nothing-to-change → the input reference (setState sees no change).        */
export function bulkPatchStakeholders(stakeholders, ids, patch, stamp) {
  const sel = new Set(asArr(ids));
  const keys = Object.keys(patch || {});
  if (!sel.size || !keys.length) return { next: stakeholders, landed: 0 };
  let landed = 0;
  const next = asArr(stakeholders).map((s) => {
    if (!sel.has(s.id)) return s;
    if (keys.every((k) => s[k] === patch[k])) return s; // already satisfied
    landed += 1;
    return { ...s, ...patch, updatedAt: stamp };
  });
  return { next: landed ? next : stakeholders, landed };
}

/* bulkAddTag → { next, landed } — union-adds one tag across the selection.
 * Rows already carrying the tag are untouched (reference-equal, no updatedAt
 * churn); blank tags are rejected whole.                                     */
export function bulkAddTag(stakeholders, ids, tag, stamp) {
  const sel = new Set(asArr(ids));
  const t = String(tag || '').trim();
  if (!sel.size || !t) return { next: stakeholders, landed: 0 };
  let landed = 0;
  const next = asArr(stakeholders).map((s) => {
    if (!sel.has(s.id) || asArr(s.tags).includes(t)) return s;
    landed += 1;
    return { ...s, tags: [...asArr(s.tags), t], updatedAt: stamp };
  });
  return { next: landed ? next : stakeholders, landed };
}

/* bulkAssignWorkspace → { next, landed } — union-adds one workspace
 * membership across the selection in the stakeholderWorkspaces join map. A
 * row with no entry gets the sealed create-time join (createJoinFor with the
 * target forced); a row already in the workspace keeps its reference. No
 * wsId → no-op.                                                              */
export function bulkAssignWorkspace(stakeholderWorkspaces, ids, wsId) {
  if (!wsId) return { next: stakeholderWorkspaces, landed: 0 };
  const next = { ...(stakeholderWorkspaces || {}) };
  let landed = 0;
  for (const id of asArr(ids)) {
    const cur = next[id];
    if (!cur || !cur.length) {
      next[id] = createJoinFor(null, wsId); // the sealed join seam, target forced
      landed += 1;
    } else if (!cur.includes(wsId)) {
      next[id] = [...cur, wsId];
      landed += 1;
    }
  }
  return { next: landed ? next : stakeholderWorkspaces, landed };
}

/* bulkActionSummary(landed, total, what) — the one HONEST snackbar phrasing
 * (audit F5): reports the rows the write actually changed; already-satisfied
 * rows are named, never absorbed into the count. Singularizes at 1 (the
 * sealed count-copy rule).                                                   */
export function bulkActionSummary(landed, total, what) {
  const noun = (n) => `${n} stakeholder${n === 1 ? '' : 's'}`;
  if (!landed) return `No change — ${noun(total)} already had it`;
  if (landed >= total) return `${what} for ${noun(landed)}`;
  return `${what} for ${noun(landed)} · ${total - landed} already had it`;
}

/* ── PHASE 24 — ARCHIVE BUILDERS (the Enterprise box's soft delete, poured
 * through the SAME one-setState/honest-count contract as every bulk write
 * above). bulkArchive/bulkRestore additionally return changedIds — the exact
 * rows the write landed on — because the snackbar UNDO must restore exactly
 * that set (never the selection: an already-archived row in the selection
 * was a no-op and must not be "restored" by the undo).                     */

/* bulkArchive(stakeholders, ids, stamp, byId) → { next, landed, changedIds }
 * — sets archived:true + archivedAt/archivedBy (the envelope's deleted_at/
 * deleted_by, camelCase per the record's audit fields) + updatedAt on every
 * selected ACTIVE row; already-archived rows keep their reference.         */
export function bulkArchive(stakeholders, ids, stamp, byId) {
  const sel = new Set(asArr(ids));
  if (!sel.size) return { next: stakeholders, landed: 0, changedIds: [] };
  const changedIds = [];
  const next = asArr(stakeholders).map((s) => {
    if (!sel.has(s.id) || s.archived) return s;
    changedIds.push(s.id);
    return {
      ...s,
      archived: true,
      archivedAt: stamp,
      archivedBy: byId ?? null,
      updatedAt: stamp,
    };
  });
  return changedIds.length
    ? { next, landed: changedIds.length, changedIds }
    : { next: stakeholders, landed: 0, changedIds };
}

/* bulkRestore(stakeholders, ids, stamp) → { next, landed, changedIds } —
 * clears the archive flag + stamps on every selected ARCHIVED row (restore =
 * write the flag off, never a record resurrection: nothing else changed when
 * it was archived). Active rows in the selection keep their reference.     */
export function bulkRestore(stakeholders, ids, stamp) {
  const sel = new Set(asArr(ids));
  if (!sel.size) return { next: stakeholders, landed: 0, changedIds: [] };
  const changedIds = [];
  const next = asArr(stakeholders).map((s) => {
    if (!sel.has(s.id) || !s.archived) return s;
    changedIds.push(s.id);
    return {
      ...s,
      archived: false,
      archivedAt: null,
      archivedBy: null,
      updatedAt: stamp,
    };
  });
  return changedIds.length
    ? { next, landed: changedIds.length, changedIds }
    : { next: stakeholders, landed: 0, changedIds };
}

/* cascadeDeleteStakeholders(stakeholders, scores, joins, ids) — the SEALED
 * stakeholder hard-delete cascade (App-shell box: remove the record, purge
 * scores[id], purge stakeholderWorkspaces[id]; the wider owners-reference
 * scrub belongs to removeUser, not this cascade), generalized over a set so
 * the modal's single delete and the Archived view's bulk delete run the ONE
 * code path (replace-don't-duplicate). Each store returns its input
 * reference when nothing in it changed.                                    */
export function cascadeDeleteStakeholders(stakeholders, scores, joins, ids) {
  const sel = new Set(asArr(ids));
  if (!sel.size) {
    return { stakeholders, scores, joins, landed: 0 };
  }
  const nextSh = asArr(stakeholders).filter((s) => !sel.has(s.id));
  const landed = asArr(stakeholders).length - nextSh.length;
  let nextScores = scores;
  if (Object.keys(scores || {}).some((id) => sel.has(id))) {
    nextScores = {};
    for (const [id, v] of Object.entries(scores || {})) {
      if (!sel.has(id)) nextScores[id] = v;
    }
  }
  let nextJoins = joins;
  if (Object.keys(joins || {}).some((id) => sel.has(id))) {
    nextJoins = {};
    for (const [id, v] of Object.entries(joins || {})) {
      if (!sel.has(id)) nextJoins[id] = v;
    }
  }
  return {
    stakeholders: landed ? nextSh : stakeholders,
    scores: nextScores,
    joins: nextJoins,
    landed,
  };
}

/* Archive-family snackbar copy — the Phase-17 honest-count pattern (landed,
 * never the selection size; already-satisfied rows named, never absorbed). */
const shNoun = (n) => `${n} stakeholder${n === 1 ? '' : 's'}`;

export function archiveSummary(landed, total) {
  if (!landed) return `No change — ${shNoun(total)} already archived`;
  if (landed >= total) return `Archived ${shNoun(landed)}`;
  return `Archived ${shNoun(landed)} · ${total - landed} already archived`;
}

export function restoreSummary(landed, total) {
  if (!landed) return `No change — ${shNoun(total)} already active`;
  if (landed >= total) return `Restored ${shNoun(landed)}`;
  return `Restored ${shNoun(landed)} · ${total - landed} already active`;
}

export function deleteForeverSummary(landed) {
  return `Deleted ${shNoun(landed)} forever`;
}

/* The Lists entry-point label ("Archived (N)") + the archived-view copy.    */
export function archivedToggleLabel(n) {
  return `Archived (${n})`;
}
export const ARCHIVED_VIEW_TITLE = 'Archived stakeholders';
export const ARCHIVED_VIEW_LINE =
  'Hidden from Lists, Map, Scoring, workHQ, search, and plans. Restore to bring them back.';
export const ARCHIVED_EMPTY_LINE =
  'No archived stakeholders. Archived records land here, off every live surface.';

/* ── PHASE 19 — LISTS zero-data empty state (sealed ~3899 "empty states per
 * page", forward-design; nothing sealed prescribes this copy). Renders in
 * place of the table when the workspace-visible set is EMPTY; both actions
 * are the page's existing real flows (create modal / import wizard). */
export const LISTS_EMPTY_LINE =
  'No stakeholders yet. Add your first stakeholder or import a spreadsheet.';
