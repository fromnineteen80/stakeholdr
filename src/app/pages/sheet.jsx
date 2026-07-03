/* sheet.jsx — the Lists page at PHASE-2 DEPTH, assembled against the sealed
 * box "Lists table — the master stakeholder table" (its SKELETON TREE root:
 * div.sheet-wrap → the page slot inside the shell's main content, hosting the
 * table).
 *
 * PHASE-2 SCOPE (deliberate, per the build order): the page mounts the REAL
 * domain component <ui-stakeholder-table> (manifest: props.data — an array set
 * via JS property) and feeds it rows computed live from the store — each
 * visible stakeholder with _x/_y = weightedCoord(s.id, scores, team) to 1
 * decimal, _status = statusFor(_x, _y), _unscored, plus the fields the
 * component renders (name/org/category/type/region/priority/x/y/status/
 * relationship).
 *
 * DO NOT HAND-ROLL A TABLE: the full 26-column editing grid of the sealed box
 * (frozen idx/edit/name/org + the 22 reorderable columns, inline CellSelect
 * cascades, CellDate, notes modal, drag-to-reorder, CSV export, toolbar
 * popovers) is a LATER EXTENSION of ui-stakeholder-table inside
 * design-system/ (built to the ui-button quality bar, registered in
 * manifest.json) — never a markup/CSS reimplementation in app code (Canonical
 * UI law 1; Build Protocol rule 2).
 *
 * Scoping (sealed Ecosystem box): Lists filters to the active workspace via
 * the stakeholderWorkspaces join; this scaffold's shell is pinned to Master
 * (the union of ALL stakeholders), so every stakeholder is visible. The
 * workspace filter wires up with the shell-state phase.
 */
import { useEffect, useMemo, useRef } from 'react';
import { usePersistentState } from '../data/store.js';
import { weightedCoord, statusFor } from '../data/engine.js';
import { SEED_STAKEHOLDERS, SEED_SCORES, SEED_TEAM } from '../data/seed.js';

export function SheetPage() {
  const [stakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const [scores] = usePersistentState('scores', SEED_SCORES);
  const [team] = usePersistentState('team', SEED_TEAM);
  const tableRef = useRef(null);

  // Sealed row mapping: each visible stakeholder computes, live,
  // _x/_y = weightedCoord (RAW — 1-decimal is display-only, applied by the
  // table component at render) · _status = statusFor over the RAW position
  // (rounding first flips zones near boundaries) · _unscored (team.length > 0
  // AND no team member has a score for this stakeholder).
  const rows = useMemo(() => stakeholders.map((s) => {
    const pos = weightedCoord(s.id, scores, team);
    const _x = pos.x;
    const _y = pos.y;
    const _status = statusFor(pos.x, pos.y);
    const perRater = scores[s.id] || {};
    const _unscored = team.length > 0 && !team.some((m) => perRater[m.id]);
    return {
      id: s.id,
      // s.name already holds the composed display name in the seed; the
      // displayName(s) helper (structured firstName/lastName/title fields)
      // single-sources in the Shared-primitives phase.
      name: s.name,
      org: s.org,
      category: s.category,
      type: s.type,
      region: s.region,
      priority: s.priority,
      status: s.status,
      // the component's rendered coordinate/zone fields:
      x: _x,
      y: _y,
      relationship: _status,
      // the sealed computed row fields (consumed by later phases too):
      _x,
      _y,
      _status,
      _unscored,
    };
  }), [stakeholders, scores, team]);

  // The manifest marks .data "set via JS property" — feed it through a ref.
  useEffect(() => {
    if (tableRef.current) tableRef.current.data = rows;
  }, [rows]);

  return <ui-stakeholder-table ref={tableRef} class="sheet-table"></ui-stakeholder-table>;
}
