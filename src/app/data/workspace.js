/* workspace.js — pure workspace-scoping helpers, built from the sealed boxes
 * "Ecosystem — how it all connects" + "App shell & routing" in src/guide.jsx.
 *
 * SEALED SCOPING RULES (Ecosystem box):
 *   · MASTER (id __master, immovable) = the union of ALL stakeholders.
 *   · A workspace shows ONLY stakeholders whose stakeholderWorkspaces join
 *     includes its id.
 *   · Create from a workspace → auto-assigned there; from Master → unassigned.
 *   · Scoring is DISABLED on Master (a workspace collaboration act) →
 *     redirects to Map.
 * Team + scores are GLOBAL — the workspace changes only WHICH ROWS appear.
 */
import { MASTER_WORKSPACE_ID } from './seed.js';

export { MASTER_WORKSPACE_ID };

export const isMasterWorkspace = (wsId) => wsId === MASTER_WORKSPACE_ID;

/* ── PHASE 24 — ARCHIVE (SOFT DELETE) ────────────────────────────────────
 * The sealed Enterprise state model box: "SOFT DELETE [STD] — deleted_at +
 * deleted_by instead of hard delete … lists filter out soft-deleted rows",
 * and Enterprise architecture pillar 8 ("soft-delete + an Archive state …
 * revisit, export, restore"). DECLARED demo mapping: the flag lives on the
 * record as archived / archivedAt / archivedBy (camelCase like createdAt;
 * these ARE the envelope's deleted_at/deleted_by at the State-B schema).
 * activeStakeholders is the ONE archive filter every default surface rides
 * (Lists rows via visibleStakeholders, Map dots, Scoring matrix, plan
 * rosters, the record embeds, palette results, the shell counts). Archived
 * records SURVIVE in the store — archiving cascades NOTHING (scores, joins
 * and plan memberships keep the id; surfaces just hide it — declared), so
 * Restore is a pure flag clear.                                            */
export const isArchived = (s) => !!(s && s.archived);

export function activeStakeholders(stakeholders) {
  return (stakeholders || []).filter((s) => !isArchived(s));
}

/* Sealed visibleStakeholders (App-shell box): master → all stakeholders;
 * else stakeholders whose stakeholderWorkspaces[s.id] includes the ws id.
 * PHASE 24: archived rows leave EVERY default surface — the workspace-
 * visible set is active-only (the archived set has its own accessor).      */
export function visibleStakeholders(stakeholders, stakeholderWorkspaces, wsId) {
  const active = activeStakeholders(stakeholders);
  if (isMasterWorkspace(wsId)) return active;
  return active.filter((s) =>
    ((stakeholderWorkspaces || {})[s.id] || []).includes(wsId));
}

/* The workspace-scoped ARCHIVED set (Phase 24) — the same scoping rule as
 * visibleStakeholders, over archived rows only. Feeds the Lists "Archived
 * (N)" view; no other surface reads it.                                    */
export function archivedStakeholders(stakeholders, stakeholderWorkspaces, wsId) {
  const archived = (stakeholders || []).filter(isArchived);
  if (isMasterWorkspace(wsId)) return archived;
  return archived.filter((s) =>
    ((stakeholderWorkspaces || {})[s.id] || []).includes(wsId));
}

/* Sealed workspaceLabel derivation (App-shell box, verbatim): the literal
 * master string is "Master · All stakeholders"; "-" covers a missing/deleted
 * active-workspace record. Feeds every view header AND the CSV filename.   */
export function workspaceLabel(workspaces, wsId) {
  if (isMasterWorkspace(wsId)) return 'Master · All stakeholders';
  const ws = (workspaces || []).find((w) => w.id === wsId);
  return ws?.name || '-';
}

/* Sealed create-time join rule (App-shell addStakeholder):
 * ws = forceWorkspaceId || (isMaster ? null : activeWorkspaceId);
 * empty membership array when no workspace resolves.                       */
export function createJoinFor(activeWorkspaceId, forceWorkspaceId) {
  const ws = forceWorkspaceId ||
    (isMasterWorkspace(activeWorkspaceId) ? null : activeWorkspaceId);
  return ws ? [ws] : [];
}

/* Per-workspace stakeholder count (sealed OpenWorkspaceModal row meta +
 * tab-strip counts): stakeholders whose join includes w.id.
 * PHASE 24 (declared): counts stay honest against the archive — when the
 * caller passes the stakeholder collection, archived ids are excluded, so a
 * count never promises rows the surfaces hide ("what you see is what you
 * act on"). Legacy callers without the third argument keep the raw join
 * count.                                                                   */
export function countForWorkspace(stakeholderWorkspaces, wsId, stakeholders) {
  const archived = stakeholders
    ? new Set((stakeholders || []).filter(isArchived).map((s) => s.id))
    : null;
  return Object.entries(stakeholderWorkspaces || {})
    .filter(([sid, list]) =>
      (list || []).includes(wsId) && !(archived && archived.has(sid))).length;
}

/* Sealed count copy: "{count} stakeholder(s)" — singular/plural on count===1 */
export function stakeholderCountLabel(count) {
  return `${count} stakeholder${count === 1 ? '' : 's'}`;
}

/* Sealed removeWorkspace join leg (App-shell box): the cleanup strips the
 * deleted wsId from EVERY stakeholder's list — stakeholders stay in the
 * Master pool, never orphaned. Pure, single-sourced here; the shell's
 * removeWorkspace cascade applies it.                                       */
export function stripWorkspaceFromJoins(stakeholderWorkspaces, wsId) {
  const next = {};
  for (const [sid, list] of Object.entries(stakeholderWorkspaces || {})) {
    next[sid] = (list || []).filter((id) => id !== wsId);
  }
  return next;
}
