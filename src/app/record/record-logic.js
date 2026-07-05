/* record-logic.js — PURE logic + sealed constants for the RECORD SCAFFOLD
 * (Phase 14), extracted from the sealed box "Record scaffold, landing pages &
 * page shells" (src/guide.jsx ~3481–3606) so scripts/record-test.mjs asserts
 * every value in node. No DOM, no React — importable anywhere.
 */

/* ── MetaField (sealed 3481–3483) ─────────────────────────────────────────── */

/* Sealed TYPE VOCABULARY: text | long | select | tags | date. */
export const MF_TYPES = ['text', 'long', 'select', 'tags', 'date'];

/* Sealed emptiness test: value is undefined OR null OR "" OR an empty array. */
export function mfIsEmpty(v) {
  return v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
}

/* Sealed read-state empty glyph: an em-dash. */
export const MF_EMPTY_GLYPH = '—';

/* ── RecordShell defaults (sealed 3485–3491) ──────────────────────────────── */
export const REC_DEFAULTS = {
  backLabel: 'Back',        // sealed: backLabel || "Back"
  navTitle: 'Sections',     // sealed: navTitle || "Sections"
  railTitle: 'Details',     // sealed: railTitle || "Details"
  navFallbackIcon: 'chevron_right', // sealed: s.icon || "chevron-right" (ligature form)
};

/* sealed: section = the sections entry whose id===active, fallback sections[0] */
export function sectionFor(sections, activeId) {
  const list = sections || [];
  return list.find((s) => s.id === activeId) || list[0] || null;
}

/* Sealed edit-toggle chrome: Icon "check"+"Done" while editing, else
 * Icon "edit"+"Edit" (the button gains the primary/filled look editing). */
export function editToggle(editing) {
  return editing ? { icon: 'check', label: 'Done' } : { icon: 'edit', label: 'Edit' };
}

/* ── SampleRecord (sealed 3493–3499) ──────────────────────────────────────── */

/* Sealed seed record d — EXACTLY these initial values. */
export const SAMPLE_SEED = {
  name: 'Sample Record',
  owner: 'Alex Rivera',
  status: 'Active',
  priority: 'High',
  summary: 'A neutral record used to tune the universal read/edit scaffold before stakeholders, plans, and community entries are poured into it.',
  tags: ['Reference', 'Scaffold'],
  note: '',
};

/* Sealed RecordShell invocation strings. */
export const SAMPLE_STRINGS = {
  backLabel: 'Samples',
  pageIcon: 'description',
  subtitle: 'Universal scaffold preview',
  navTitle: 'Sections',
  metaCreated: 'June 1, 2026',
  metaUpdated: 'June 10, 2026',
  footLeft: 'Universal scaffold preview',
  footRight: 'Updated June 10, 2026',
  notesPlaceholder: 'Add a note…',
  searchPlaceholder: 'Search…',
  workspaceLabel: 'Sample',
};

/* Sealed select options (Field stack + Two column). */
export const SAMPLE_STATUS_OPTIONS = ['Idea', 'Proposed', 'Active', 'Complete'];
export const SAMPLE_PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];

/* Sealed section catalog: id · label · icon (ligature form of the sealed
 * icon names notes/tune/view_column/table_rows). */
export const SAMPLE_SECTIONS = [
  { id: 'prose', label: 'Single column', icon: 'notes' },
  { id: 'fields', label: 'Field stack', icon: 'tune' },
  { id: 'twocol', label: 'Two column', icon: 'view_column' },
  { id: 'table', label: 'Table embed', icon: 'table_rows' },
];

/* Sealed prose-section tag chips. */
export const SAMPLE_PROSE_TAGS = ['Reference', 'Scaffold', 'Lorem'];

/* Sealed: the Table-embed section is LIMITED TO 8 STAKEHOLDERS. */
export const TABLE_EMBED_CAP = 8;
export function tableEmbedRows(rows) {
  return (rows || []).slice(0, TABLE_EMBED_CAP);
}

/* ── record.stakeholder / record.workspace option sets ────────────────────── */

/* The manual status dot vocabulary (sealed StatusDot catalog: Active / Watch
 * / Dormant — Shared-UI-primitives box). */
export const SH_STATUS_OPTIONS = ['Active', 'Watch', 'Dormant'];

/* The sealed priority vocabulary (PriorityPill catalog). */
export const SH_PRIORITY_OPTIONS = ['High', 'Medium', 'Low'];
