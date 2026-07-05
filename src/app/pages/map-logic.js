/* map-logic.js — PURE derivations for the page-hosted Map scorecard rail
 * (Phase 14: the sealed MapDetail spec, guide ~345 + ~362–374, recomposed to
 * the sealed tree — div.map-wrap is the PAGE container hosting the plot stage
 * beside the ui-inspector rail). Node-tested by scripts/record-test.mjs.
 */

/* Sealed empty state: "Recently scored" lists SIX recent stakeholders. */
export const RECENT_CAP = 6;
export function recentRows(rows) {
  return (rows || []).slice(0, RECENT_CAP);
}

/* The sealed 11 detail rows, in order (guide ~372). */
export const DETAIL_ROW_KEYS = [
  'Category', 'Type', 'Market', 'Region', 'Geography', 'Issues',
  'Priority', 'Owner', 'Last contact', 'Status', 'Tags',
];

/* detailRowsFor(s) — typed descriptors the rail renders, one per sealed row.
 * kind: text | chips | priority | owners | date | status | tags.
 * value is null whenever the sealed row would render the muted "-" (empty
 * string / missing field / empty array). */
export function detailRowsFor(s) {
  const row = s || {};
  const orNull = (v) => (v == null || v === '' ? null : v);
  const arrOrNull = (v) => (Array.isArray(v) && v.length ? v : null);
  return [
    { k: 'Category', kind: 'text', value: orNull(row.category) },
    { k: 'Type', kind: 'text', value: orNull(row.type) },
    { k: 'Market', kind: 'text', value: orNull(row.market) },
    { k: 'Region', kind: 'text', value: orNull(row.region) },
    { k: 'Geography', kind: 'text', value: orNull(row.geography) },
    { k: 'Issues', kind: 'chips', value: arrOrNull(row.issues) },
    { k: 'Priority', kind: 'priority', value: orNull(row.priority) },
    { k: 'Owner', kind: 'owners', value: arrOrNull(row.owners) },
    { k: 'Last contact', kind: 'date', value: orNull(row.lastContact) },
    { k: 'Status', kind: 'status', value: orNull(row.status) },
    { k: 'Tags', kind: 'tags', value: arrOrNull(row.tags) },
  ];
}

/* Sealed live-coords readout: one decimal each. */
export function coordsLabel(x, y) {
  return `(${(+x).toFixed(1)}, ${(+y).toFixed(1)})`;
}
