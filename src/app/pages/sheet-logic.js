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
 * BULK DELETE IS DELIBERATELY ABSENT (deferred, declared): destructive
 * actions at thousands-of-rows scale need the soft-delete/archive semantics
 * specified in the Enterprise box — shipping a hard mass delete first would
 * be a trap. Pure + node-testable (scripts/scale-test.mjs).
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
