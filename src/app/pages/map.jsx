/* map.jsx — the Map page at PHASE-5 depth, assembled against the sealed box
 * "Map — coordinate→pixel translation, dots, zones, read-only positions,
 * history trail, scorecard" (SKELETON TREE root: div.map-wrap → the shell's
 * main content slot).
 *
 * THE MAP IS THE DESIGN-SYSTEM DOMAIN COMPONENT <ui-stakeholder-map>
 * (extended in design-system/components/stakeholder-map.js to the full
 * sealed spec: coordToPct transform, 6×4 zone grid + counts, axis ticks +
 * legend, read-only dots, history trail, ui-inspector scorecard). The page
 * owns: live row computation from the store (RAW weightedCoord → statusFor,
 * exactly like Lists), page-lifted selection (sealed: shared with
 * Lists/Scoring), and the double-click OPEN-PROFILE route — the sealed
 * read-only stakeholder profile (Phase 4's StakeholderModal with
 * initialView), a first-class prop route, never a window.__* bridge.
 *
 * READ-ONLY (sealed ruling): the map displays weighted positions and never
 * edits them — the oracle's drag-to-rescore is removed. All rescoring lives
 * on the Scoring page (quarterly cadence).
 *
 * Scoping (sealed Ecosystem box, REAL as of Phase 6): rows = the
 * workspace-filtered visibleStakeholders (Master = the org-wide union the
 * sealed Scoring redirect lands on). Team + scores are global.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState, nowStamp } from '../data/store.js';
import { weightedCoord, statusFor } from '../data/engine.js';
import {
  SEED_STAKEHOLDERS, SEED_SCORES, SEED_TEAM, SEED_USERS, SEED_COMMUNITY,
  SEED_WORKSPACES, SEED_STAKEHOLDER_WORKSPACES,
} from '../data/seed.js';
import { ISSUES, TAGS } from '../data/catalogs.js';
import { StakeholderModal } from '../modals/stakeholder-modal.jsx';
import { MASTER_WORKSPACE_ID, visibleStakeholders } from '../data/workspace.js';

export function MapPage({
  activeWorkspaceId = MASTER_WORKSPACE_ID, onOpenCommunityEntry, onOpenWorkspace,
}) {
  const [stakeholders, setStakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const [scores, setScores] = usePersistentState('scores', SEED_SCORES);
  const [team] = usePersistentState('team', SEED_TEAM);
  const [users] = usePersistentState('users', SEED_USERS);
  const [community] = usePersistentState('community', SEED_COMMUNITY);
  const [workspaces] = usePersistentState('workspaces', SEED_WORKSPACES);
  const [stakeholderWorkspaces, setStakeholderWorkspaces] =
    usePersistentState('stakeholderWorkspaces', SEED_STAKEHOLDER_WORKSPACES);

  const mapRef = useRef(null);

  // Selection lifts to the page (sealed: Lists/Map/Scoring share it). REAL
  // state, read AND written: the page owns it and passes it back down as the
  // component's controlled selectedId property (the component emits
  // selection-change; no dead write). Cross-page sharing (Lists/Scoring
  // reading the same selection) arrives with the shell-state phase.
  const [selectedId, setSelectedId] = useState(null);

  // OPEN-PROFILE route (sealed: dot double-click → the full stakeholder
  // profile). view:true = the sealed initialView read-only profile; the
  // form stays reachable via the profile's own "Edit stakeholder" flip.
  const [shModal, setShModal] = useState(null);

  // currentUser = the seeded first user until the login phase (sealed order).
  const currentUser = users[0] || null;

  /* Sealed row mapping — identical to Lists: each visible stakeholder
   * computes, live, _x/_y = weightedCoord (RAW — toFixed(1) is display-only,
   * applied by the component) and _status = statusFor over the RAW position.
   * history[]/notesHistory ride along on the row for the trail + scorecard. */
  const rows = useMemo(() =>
    visibleStakeholders(stakeholders, stakeholderWorkspaces, activeWorkspaceId)
      .map((s) => {
        const pos = weightedCoord(s.id, scores, team);
        return { ...s, _x: pos.x, _y: pos.y, _status: statusFor(pos.x, pos.y) };
      }),
  [stakeholders, stakeholderWorkspaces, activeWorkspaceId, scores, team]);

  // Manifest: data/users are JS properties — feed through the ref.
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    el.users = users;
    el.data = rows;
  }, [rows, users]);

  // Controlled selection down (the component setter no-ops on the same id,
  // so the selection-change → setSelectedId → here echo settles).
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    el.selectedId = selectedId;
  }, [selectedId]);

  // Component events → page state (first-class routes, sealed).
  useEffect(() => {
    const el = mapRef.current;
    if (!el) return;
    const onSelect = (e) => setSelectedId(e.detail.id);
    const onOpenProfile = (e) => setShModal({ mode: 'edit', id: e.detail.id, view: true });
    el.addEventListener('selection-change', onSelect);
    el.addEventListener('open-profile', onOpenProfile);
    return () => {
      el.removeEventListener('selection-change', onSelect);
      el.removeEventListener('open-profile', onOpenProfile);
    };
  }, []);

  /* Persistence mirrors the Lists page (the ONE Store seam): the profile's
   * edit flip can submit changes; delete runs the sealed cascade. */
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
    <div className="map-page">
      {/* Display options ride the sealed TWEAK_DEFAULTS (halo / labels off /
          zone labels on / dot size 22) — they become Settings→Design controls
          in that phase; no ad-hoc overrides here. */}
      <ui-stakeholder-map ref={mapRef} class="map-view"></ui-stakeholder-map>

      {/* THE SEALED PROFILE ROUTE: dot double-click opens the read-only
          stakeholder profile (Phase 4's modal, initialView). */}
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
          setShModal(null);
        }}
        onDelete={(id) => {
          deleteStakeholder(id);
          setShModal(null);
        }}
        onOpenCommunity={openCommunityFromModal}
        onOpenWorkspace={onOpenWorkspace}
      />
    </div>
  );
}
