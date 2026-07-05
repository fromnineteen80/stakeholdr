/* setup-logic.js — the Workspaces (Setup) page's PURE logic, built from the
 * sealed box "Workspaces — the team's working surface (segment/BU scope,
 * workHQ, Setup sub-page, roles)" in src/guide.jsx (the SEGMAP section, the
 * WORKSPACE RECORD + BLANK-CREATE DEFAULTS, the DERIVATION section, MEMBER
 * VISIBILITY, DELETE, the toolbar filter pipeline, formatCreated). Node-
 * testable: no DOM, no React (scripts/setup-test.mjs asserts this module).
 *
 * SEALED SEGMAP CONTRACT (load-bearing — DO NOT hardcode D.SEGMENTS at a use
 * site): the effective segment → business-unit map is appConfig.segments when
 * present AND non-empty, else the seed catalog. The Settings phase lands the
 * appConfig editor; every consumer already reads through this ONE derivation
 * so re-pointing needs no page change.
 */
import { SEGMENTS, MARKETS } from '../data/catalogs.js';

/* Sealed app.jsx derivation, verbatim shape: companySegments =
 * (cfg.segments && Object.keys(cfg.segments).length) ? cfg.segments
 *   : D.SEGMENTS. The shell computes this from the appConfig store and hands
 * it down as the companySegments prop. */
export function companySegmentsFrom(cfg) {
  const segs = (cfg || {}).segments;
  return (segs && Object.keys(segs).length) ? segs : SEGMENTS;
}

/* Sealed SetupView-side re-application (the modal re-applies it again as SEG —
 * the sealed double fallback): SEGMAP = (companySegments && keys) ? it : seed. */
export function segMapFrom(companySegments) {
  return (companySegments && Object.keys(companySegments).length)
    ? companySegments
    : SEGMENTS;
}

/* ── BLANK-CREATE DEFAULTS (sealed WorkspaceModal blank, verbatim fields).
 * DECLARED: the sealed blank stamps createdAt date-only
 * (toISOString().slice(0,10)); the rebuild stamps full ISO through the
 * caller-supplied now (the repo-wide timestamp-precision rule — the
 * community-blankApp precedent; the seed workspaces already carry full-ISO
 * createdAt). formatCreated renders the same day either way. ─────────────── */
export function blankWorkspace(currentUser, { now } = {}) {
  return {
    name: '',
    segment: 'Corporate Functions',
    businessUnit: 'Legal / GA&PP',
    scope: '',       // "" | "National" | "State"
    scopeState: '',  // a US state name, meaningful ONLY when scope === "State"
    owners: currentUser ? [currentUser.id] : [], // creator pre-owns (sealed)
    createdAt: now || new Date().toISOString(),
    createdBy: currentUser ? currentUser.id : undefined,
  };
}

/* Edit draft (sealed: draft = {...ws} on open). */
export function draftFromWorkspace(ws) {
  return { ...ws };
}

/* Sealed validity: name non-empty (trimmed) AND at least one owner. */
export function workspaceValid(d) {
  return String(d.name || '').trim().length > 0 && (d.owners || []).length > 0;
}

/* Sealed segment cascade: changing the Segment select RESETS businessUnit to
 * the new segment's FIRST unit (or "" if none). */
export function applySegment(d, seg, segMap) {
  return { ...d, segment: seg, businessUnit: ((segMap || {})[seg] || [])[0] || '' };
}

/* Sealed scope cascade: any value sets scope; a non-"State" value clears
 * scopeState. */
export function applyScope(d, scope) {
  return scope === 'State' ? { ...d, scope } : { ...d, scope, scopeState: '' };
}

/* Sealed submit(): edit mode returns ONLY the six editable fields (never
 * createdAt/createdBy — the creation stamp is immutable); create mode returns
 * the whole draft with the name trimmed. */
export function submitPatch(mode, d) {
  if (mode === 'edit') {
    return {
      name: d.name, segment: d.segment, businessUnit: d.businessUnit,
      scope: d.scope, scopeState: d.scopeState, owners: d.owners,
    };
  }
  return { ...d, name: String(d.name || '').trim() };
}

/* Sealed Scope select options: "None" (value ""), "National", "State". */
export const SCOPE_OPTIONS = [
  { value: '', label: 'None' },
  { value: 'National', label: 'National' },
  { value: 'State', label: 'State' },
];

/* ── formatCreated (sealed formula + the sealed MAKE-REAL): no iso → "-";
 * invalid parse → the raw string; else toLocaleDateString { month:"short",
 * day:"numeric", year:"numeric" }. KNOWN BUG NOT REPLICATED: bare
 * "YYYY-MM-DD" parses as LOCAL midnight (the "T00:00:00" append — the shared
 * formatDateLong guard) so the displayed day always matches the stored day
 * in every timezone. Full-ISO stamps parse directly. ─────────────────────── */
export function formatCreated(iso) {
  if (!iso) return '-';
  const d = /^\d{4}-\d{2}-\d{2}$/.test(String(iso))
    ? new Date(iso + 'T00:00:00')
    : new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── DERIVATION (sealed: markets/regions/counts are COMPUTED, never stored).
 * marketsByWs: for each [stakeholderId, wsIds] join entry, look up the
 * stakeholder; for each wsId accumulate that stakeholder's market and region —
 * a workspace's markets/regions are the UNION over its assigned stakeholders.
 * Returned as insertion-ordered arrays (Set semantics, sealed). ───────────── */
export function marketsByWs(stakeholders, stakeholderWorkspaces) {
  const m = {};
  for (const [sid, wsIds] of Object.entries(stakeholderWorkspaces || {})) {
    const st = (stakeholders || []).find((s) => s.id === sid);
    if (!st) continue;
    for (const wsId of wsIds || []) {
      const cur = (m[wsId] ||= { markets: new Set(), regions: new Set() });
      if (st.market) cur.markets.add(st.market);
      if (st.region) cur.regions.add(st.region);
    }
  }
  const out = {};
  for (const [wsId, sets] of Object.entries(m)) {
    out[wsId] = { markets: [...sets.markets], regions: [...sets.regions] };
  }
  return out;
}

/* Sealed countByWs: stakeholders whose join list includes the wsId. */
export function countByWs(stakeholderWorkspaces) {
  const m = {};
  for (const wsIds of Object.values(stakeholderWorkspaces || {})) {
    for (const wsId of wsIds || []) m[wsId] = (m[wsId] || 0) + 1;
  }
  return m;
}

/* Sealed toolbar filter option sources: Markets = Object.keys(D.MARKETS);
 * Regions = flattened unique regions across all markets; Segments =
 * Object.keys(SEGMAP) (the Settings-fed map — the caller passes SEGMAP). */
export function marketFilterOptions() {
  return Object.keys(MARKETS);
}
export function regionFilterOptions() {
  return [...new Set(Object.values(MARKETS).flat())];
}

/* Sealed filtering pipeline on visibleWorkspaces, exact order: segment →
 * market (derived intersect) → region (derived intersect) → search. Search
 * matches w.name OR w.businessUnit OR w.segment (each lowercased includes). */
export function filterWorkspaces(list, {
  query = '', segFilter = [], marketFilter = [], regionFilter = [], derived = {},
} = {}) {
  const q = query.trim().toLowerCase();
  return (list || []).filter((w) => {
    if (segFilter.length && !segFilter.includes(w.segment)) return false;
    const d = derived[w.id] || { markets: [], regions: [] };
    if (marketFilter.length && !d.markets.some((m) => marketFilter.includes(m))) return false;
    if (regionFilter.length && !d.regions.some((r) => regionFilter.includes(r))) return false;
    if (q && !(
      String(w.name || '').toLowerCase().includes(q) ||
      String(w.businessUnit || '').toLowerCase().includes(q) ||
      String(w.segment || '').toLowerCase().includes(q)
    )) return false;
    return true;
  });
}

/* ── MEMBER VISIBILITY (sealed): managers see ALL workspaces; members see the
 * workspaces they co-own. DECLARED: the oracle's showAll state is VERIFIED
 * DEAD (setShowAll never invoked, no control renders — sealed
 * DO-NOT-REPLICATE); it is DROPPED here, so the rule is simply
 * isManager ? all : memberWorkspaces. Whether a REAL show-all toggle ships
 * instead is the sealed open user ruling. ─────────────────────────────────── */
export function visibleWorkspacesFor(workspaces, currentUser) {
  if (currentUser && currentUser.role === 'manager') return workspaces || [];
  return (workspaces || []).filter((w) =>
    (w.owners || []).includes(currentUser ? currentUser.id : undefined));
}

/* ── DELETE (sealed, role-gated): false with no user; managers delete ANY
 * workspace; a member deletes ONLY workspaces THEY created (createdBy — not
 * merely co-owned). ───────────────────────────────────────────────────────── */
export function canDeleteWorkspace(ws, currentUser) {
  if (!currentUser) return false;
  if (currentUser.role === 'manager') return true;
  return ws.createdBy === currentUser.id;
}

/* Sealed blocked-attempt copy (oracle alert → ui-snackbar at rebuild). */
export const DELETE_BLOCKED_TEXT =
  'Only the workspace creator or a manager can delete this workspace.';

/* Delete impact (drives the confirm dialog's cascade disclosure): stakeholders
 * assigned (their joins are STRIPPED — they stay in the Master pool, sealed
 * copy) and plans scoped to the workspace (DELETED by the sealed
 * removeWorkspace cascade — disclosed, never a silent destructive side
 * effect). */
export function deleteImpact(wsId, stakeholderWorkspaces, plans) {
  return {
    stakeholders: Object.values(stakeholderWorkspaces || {})
      .filter((list) => (list || []).includes(wsId)).length,
    plans: (plans || []).filter((p) => p.workspaceId === wsId).length,
  };
}

/* Sealed strings (verbatim). */
export const WS_EMPTY_TEXT = 'No workspaces match.';
export const WS_FOOTER_EXPLAINER =
  'Workspaces pair a segment with a business unit. Assign stakeholders from ' +
  'the Master pool to any number of workspaces.';

/* Sealed seg-group head count: "{n} workspace(s)" — singular/plural. */
export function workspaceCountLabel(n) {
  return `${n} workspace${n === 1 ? '' : 's'}`;
}
