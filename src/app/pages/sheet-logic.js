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
 * adding a tag a row already carries is an honest no-op for that row).
 *
 * The workspace-assign builder rides the sealed createJoinFor seam for rows
 * with no join entry yet, and set-unions for rows that have one (the join
 * map carries no stamps — sealed shape: { stakeholderId: [workspaceId] }).
 *
 * BULK DELETE IS DELIBERATELY ABSENT (deferred, declared): destructive
 * actions at thousands-of-rows scale need the soft-delete/archive semantics
 * specified in the Enterprise box — shipping a hard mass delete first would
 * be a trap. Pure + node-testable (scripts/scale-test.mjs).
 */
import { createJoinFor } from '../data/workspace.js';

const asArr = (v) => (Array.isArray(v) ? v : []);

/* bulkPatchStakeholders(stakeholders, ids, patch, stamp) — ONE pass, ONE new
 * array: every selected row takes { ...patch, updatedAt: stamp }; unselected
 * rows keep their reference. Empty selection / empty patch → the input
 * reference (setState sees no change).                                      */
export function bulkPatchStakeholders(stakeholders, ids, patch, stamp) {
  const sel = new Set(asArr(ids));
  if (!sel.size || !patch || !Object.keys(patch).length) return stakeholders;
  return asArr(stakeholders).map((s) =>
    sel.has(s.id) ? { ...s, ...patch, updatedAt: stamp } : s);
}

/* bulkAddTag — union-adds one tag across the selection. Rows already
 * carrying the tag are untouched (reference-equal, no updatedAt churn);
 * blank tags are rejected whole.                                            */
export function bulkAddTag(stakeholders, ids, tag, stamp) {
  const sel = new Set(asArr(ids));
  const t = String(tag || '').trim();
  if (!sel.size || !t) return stakeholders;
  return asArr(stakeholders).map((s) => {
    if (!sel.has(s.id) || asArr(s.tags).includes(t)) return s;
    return { ...s, tags: [...asArr(s.tags), t], updatedAt: stamp };
  });
}

/* bulkAssignWorkspace — union-adds one workspace membership across the
 * selection in the stakeholderWorkspaces join map. A row with no entry gets
 * the sealed create-time join (createJoinFor with the target forced); a row
 * already in the workspace keeps its reference. No wsId → no-op.            */
export function bulkAssignWorkspace(stakeholderWorkspaces, ids, wsId) {
  if (!wsId) return stakeholderWorkspaces;
  const next = { ...(stakeholderWorkspaces || {}) };
  let changed = false;
  for (const id of asArr(ids)) {
    const cur = next[id];
    if (!cur || !cur.length) {
      next[id] = createJoinFor(null, wsId); // the sealed join seam, target forced
      changed = true;
    } else if (!cur.includes(wsId)) {
      next[id] = [...cur, wsId];
      changed = true;
    }
  }
  return changed ? next : stakeholderWorkspaces;
}

/* bulkActionSummary(count, what) — the one snackbar phrasing ("3
 * stakeholders" / "1 stakeholder", the sealed singular rule).               */
export function bulkActionSummary(count, what) {
  return `${what} for ${count} stakeholder${count === 1 ? '' : 's'}`;
}
