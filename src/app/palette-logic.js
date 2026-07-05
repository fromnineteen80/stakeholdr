/* palette-logic.js — the command palette's PURE matching/ranking/grouping,
 * factored out of the JSX so node tests (scripts/palette-test.mjs) can assert
 * it against the SEALED BOX TEXT ("Command palette (⌘K) — global search
 * across 5 entity types", src/guide.jsx ~3993–4060, plus the App-shell
 * paletteGo/keyboard sections ~1800–1817 and census A19–A24).
 *
 * SEALED MECHANICS CARRIED VERBATIM:
 *  · ql = q.trim().toLowerCase(); match(s) = ql non-empty AND
 *    (s||"").toLowerCase().includes(ql) — an empty/whitespace query matches
 *    NOTHING (the results block is not rendered at all).
 *  · The five groups, in this exact iteration order (this IS the ranking —
 *    the sealed palette has no scoring beyond group order):
 *    Stakeholders → Plans → Community → Workspaces → People.
 *  · Stakeholder match surface (the richest): displayName(s)||s.name, s.org,
 *    s.type, s.state, the resolved site label, the site's country, every tag,
 *    every issue. Sub = s.org.
 *  · Plans: match(p.title); sub = the plan's workspace name. Community:
 *    match(c.name) OR match(c.recipient); sub = c.kind. Workspaces:
 *    match(w.name); sub = w.businessUnit. People: users with role !==
 *    "system" (the system bot is EXCLUDED); match(u.name) OR match(u.title);
 *    sub = u.title.
 *  · CAP: at most 24 rows across ALL groups combined (results.slice(0, 24)).
 *  · Keyboard clamps: ArrowDown = min(active+1, len−1); ArrowUp =
 *    max(active−1, 0). Every keystroke resets active to 0.
 *  · Sealed strings: the placeholder, "No matches.", the "Enter" commit
 *    label, the five type labels.
 *
 * DECLARED DEPARTURES (file-header ledger; never silent):
 *  · SITES source: the sealed oracle read the fixed STAKEHOLDER_DATA.SITES
 *    catalog; the rebuilt app single-sources sites through the LIVE
 *    Settings-fed seam (useCompanyCatalogs().companySites, seed fallback) —
 *    the same established Phase-11 inheritance edge every other site
 *    consumer (Plans/Community/Settings) reads. Pure functions take the
 *    array as an argument.
 *  · Rows carry `kind` (the onGo type code: stakeholder/plan/community/
 *    workspace/user) instead of the oracle's per-row go() closure — the JSX
 *    invokes onGo(kind, id); observable navigation is identical, the data
 *    stays serializable for the node suite.
 *  · SCALE DISCIPLINE (standing user ruling): collection short-circuits the
 *    moment the sealed 24-row cap is reached — identical output to
 *    slice(0, 24), but the scan never builds an unbounded array at
 *    thousands of entries.
 */
import { displayName } from '../../design-system/components/stakeholder-table.js';
import { siteLabel } from './data/catalogs.js';

/* ── Sealed strings (single-sourced: JSX + tests read these) ─────────────── */
export const PALETTE_STR = {
  placeholder: 'Search names, orgs, tags, issues, sites, states…',
  empty: 'No matches.',
  go: 'Enter',
};

/* Sealed cap: at most 24 rows across all groups combined. */
export const PALETTE_CAP = 24;

/* The five sealed type labels → the onGo kind codes (paletteGo's switch). */
export const PALETTE_KINDS = {
  Stakeholder: 'stakeholder',
  Plan: 'plan',
  Community: 'community',
  Workspace: 'workspace',
  Person: 'user',
};

/* Sealed matcher: ql must be non-empty; case-insensitive substring. */
export function paletteMatch(ql, s) {
  return !!ql && (s || '').toLowerCase().includes(ql);
}

/* paletteResults(q, { stakeholders, plans, community, workspaces, users,
 * sites }) → the capped, ordered result rows { type, kind, id, label, sub }.
 * Empty/whitespace q → [] (sealed: a falsy query matches nothing). */
export function paletteResults(q, {
  stakeholders = [], plans = [], community = [], workspaces = [],
  users = [], sites = [],
} = {}) {
  const ql = (q || '').trim().toLowerCase();
  if (!ql) return [];
  const m = (s) => paletteMatch(ql, s);
  const out = [];
  const push = (row) => { out.push(row); return out.length >= PALETTE_CAP; };

  /* Stakeholders — the sealed eight-field match surface. */
  for (const s of stakeholders) {
    const n = displayName(s) || s.name;
    const site = (s.site && sites.length)
      ? (sites.find((x) => x.id === s.site) || {})
      : {};
    const siteStr = site.id ? siteLabel(site) : '';
    const hit = m(n) || m(s.org) || m(s.type) || m(s.state) || m(siteStr) ||
      m(site.country) || (s.tags || []).some(m) || (s.issues || []).some(m);
    if (hit && push({ type: 'Stakeholder', kind: 'stakeholder', id: s.id, label: n, sub: s.org })) return out;
  }
  /* Plans — title; sub = the plan's workspace name. */
  for (const p of plans) {
    if (m(p.title) && push({
      type: 'Plan', kind: 'plan', id: p.id, label: p.title,
      sub: (workspaces.find((w) => w.id === p.workspaceId) || {}).name,
    })) return out;
  }
  /* Community — name or recipient; sub = kind. */
  for (const c of community) {
    if ((m(c.name) || m(c.recipient)) &&
        push({ type: 'Community', kind: 'community', id: c.id, label: c.name, sub: c.kind })) return out;
  }
  /* Workspaces — name; sub = businessUnit. */
  for (const w of workspaces) {
    if (m(w.name) &&
        push({ type: 'Workspace', kind: 'workspace', id: w.id, label: w.name, sub: w.businessUnit })) return out;
  }
  /* People — the system user is EXCLUDED (sealed). */
  for (const u of users) {
    if (u.role === 'system') continue;
    if ((m(u.name) || m(u.title)) &&
        push({ type: 'Person', kind: 'user', id: u.id, label: u.name, sub: u.title })) return out;
  }
  return out;
}

/* Sealed keyboard clamps (ArrowDown / ArrowUp on the input). */
export function activeDown(active, len) {
  return Math.min(active + 1, len - 1);
}
export function activeUp(active) {
  return Math.max(active - 1, 0);
}
