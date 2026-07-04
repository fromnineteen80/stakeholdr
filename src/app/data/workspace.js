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

/* Sealed visibleStakeholders (App-shell box): master → all stakeholders;
 * else stakeholders whose stakeholderWorkspaces[s.id] includes the ws id.  */
export function visibleStakeholders(stakeholders, stakeholderWorkspaces, wsId) {
  if (isMasterWorkspace(wsId)) return stakeholders;
  return (stakeholders || []).filter((s) =>
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
 * tab-strip counts): stakeholders whose join includes w.id.                */
export function countForWorkspace(stakeholderWorkspaces, wsId) {
  return Object.values(stakeholderWorkspaces || {})
    .filter((list) => (list || []).includes(wsId)).length;
}

/* Sealed count copy: "{count} stakeholder(s)" — singular/plural on count===1 */
export function stakeholderCountLabel(count) {
  return `${count} stakeholder${count === 1 ? '' : 's'}`;
}
