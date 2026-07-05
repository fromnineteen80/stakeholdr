#!/usr/bin/env node
/* record-test.mjs — node asserts for PHASE 14 (the RECORD SCAFFOLD), with
 * expected values taken FROM THE SEALED BOX TEXT ("Record scaffold, landing
 * pages & page shells", src/guide.jsx ~3481–3606) plus the sealed MapDetail
 * derivations (Map box ~345 + ~362–374) now that the scorecard rail is
 * page-hosted. Run: node scripts/record-test.mjs
 */
import assert from 'node:assert/strict';
import {
  MF_TYPES, mfIsEmpty, MF_EMPTY_GLYPH, REC_DEFAULTS, sectionFor, editToggle,
  SAMPLE_SEED, SAMPLE_STRINGS, SAMPLE_STATUS_OPTIONS, SAMPLE_PRIORITY_OPTIONS,
  SAMPLE_SECTIONS, SAMPLE_PROSE_TAGS, TABLE_EMBED_CAP, tableEmbedRows,
  SH_STATUS_OPTIONS, SH_PRIORITY_OPTIONS,
} from '../src/app/record/record-logic.js';
import {
  RECENT_CAP, recentRows, DETAIL_ROW_KEYS, detailRowsFor, coordsLabel,
} from '../src/app/pages/map-logic.js';
import {
  EMPTY_PROMPT, HISTORY_TIP_ON, HISTORY_TIP_OFF,
} from '../design-system/components/stakeholder-map.js';
import { SEED_STAKEHOLDERS } from '../src/app/data/seed.js';

let n = 0;
const t = (name, fn) => { fn(); n++; console.log('  ✓ ' + name); };

console.log('record-test — sealed-box assertions (Phase 14)\n');

/* ── MetaField (sealed 3481–3483) ─────────────────────────────────────────── */
t('sealed TYPE VOCABULARY: text | long | select | tags | date', () =>
  assert.deepEqual(MF_TYPES, ['text', 'long', 'select', 'tags', 'date']));

t('sealed emptiness: undefined / null / "" / empty array — and nothing else', () => {
  assert.equal(mfIsEmpty(undefined), true);
  assert.equal(mfIsEmpty(null), true);
  assert.equal(mfIsEmpty(''), true);
  assert.equal(mfIsEmpty([]), true);
  assert.equal(mfIsEmpty(0), false);        // 0 is a value
  assert.equal(mfIsEmpty(false), false);    // false is a value
  assert.equal(mfIsEmpty('x'), false);
  assert.equal(mfIsEmpty(['a']), false);
});

t('sealed read-state empty glyph is an em-dash', () =>
  assert.equal(MF_EMPTY_GLYPH, '—'));

/* ── RecordShell defaults + state formulas (sealed 3485–3491) ─────────────── */
t('sealed defaults: backLabel "Back" · navTitle "Sections" · railTitle "Details" · nav fallback icon chevron-right', () => {
  assert.equal(REC_DEFAULTS.backLabel, 'Back');
  assert.equal(REC_DEFAULTS.navTitle, 'Sections');
  assert.equal(REC_DEFAULTS.railTitle, 'Details');
  assert.equal(REC_DEFAULTS.navFallbackIcon, 'chevron_right');
});

t('sealed active-section rule: id===active, fallback sections[0]', () => {
  const secs = [{ id: 'a' }, { id: 'b' }];
  assert.equal(sectionFor(secs, 'b').id, 'b');
  assert.equal(sectionFor(secs, 'zz').id, 'a');   // fallback
  assert.equal(sectionFor(secs, null).id, 'a');   // default
  assert.equal(sectionFor([], 'a'), null);
});

t('sealed edit toggle: check+"Done" editing · edit+"Edit" read', () => {
  assert.deepEqual(editToggle(true), { icon: 'check', label: 'Done' });
  assert.deepEqual(editToggle(false), { icon: 'edit', label: 'Edit' });
});

/* ── SampleRecord seed (sealed 3493: EXACTLY these initial values) ────────── */
t('sealed seed record d — every field verbatim', () => {
  assert.deepEqual(SAMPLE_SEED, {
    name: 'Sample Record',
    owner: 'Alex Rivera',
    status: 'Active',
    priority: 'High',
    summary: 'A neutral record used to tune the universal read/edit scaffold before stakeholders, plans, and community entries are poured into it.',
    tags: ['Reference', 'Scaffold'],
    note: '',
  });
});

t('sealed RecordShell invocation strings (backLabel Samples · pageIcon description · subtitle · navTitle)', () => {
  assert.equal(SAMPLE_STRINGS.backLabel, 'Samples');
  assert.equal(SAMPLE_STRINGS.pageIcon, 'description');
  assert.equal(SAMPLE_STRINGS.subtitle, 'Universal scaffold preview');
  assert.equal(SAMPLE_STRINGS.navTitle, 'Sections');
});

t('sealed select options: Status EXACTLY [Idea, Proposed, Active, Complete]; Priority EXACTLY [High, Medium, Low]', () => {
  assert.deepEqual(SAMPLE_STATUS_OPTIONS, ['Idea', 'Proposed', 'Active', 'Complete']);
  assert.deepEqual(SAMPLE_PRIORITY_OPTIONS, ['High', 'Medium', 'Low']);
});

t('sealed four sections in order with the sealed ids · labels · icons', () => {
  assert.deepEqual(SAMPLE_SECTIONS, [
    { id: 'prose', label: 'Single column', icon: 'notes' },
    { id: 'fields', label: 'Field stack', icon: 'tune' },
    { id: 'twocol', label: 'Two column', icon: 'view_column' },
    { id: 'table', label: 'Table embed', icon: 'table_rows' },
  ]);
});

t('sealed prose tag chips: Reference · Scaffold · Lorem', () =>
  assert.deepEqual(SAMPLE_PROSE_TAGS, ['Reference', 'Scaffold', 'Lorem']));

t('sealed metadata rail values (Created June 1, 2026 · Updated June 10, 2026) + notes placeholder "Add a note…"', () => {
  assert.equal(SAMPLE_STRINGS.metaCreated, 'June 1, 2026');
  assert.equal(SAMPLE_STRINGS.metaUpdated, 'June 10, 2026');
  assert.equal(SAMPLE_STRINGS.notesPlaceholder, 'Add a note…');
});

t('sealed footer: "Universal scaffold preview" · "Updated June 10, 2026"', () => {
  assert.equal(SAMPLE_STRINGS.footLeft, 'Universal scaffold preview');
  assert.equal(SAMPLE_STRINGS.footRight, 'Updated June 10, 2026');
});

t('sealed table embed: LIMITED TO 8 STAKEHOLDERS (first 8; workspaceLabel "Sample")', () => {
  assert.equal(TABLE_EMBED_CAP, 8);
  assert.equal(SAMPLE_STRINGS.workspaceLabel, 'Sample');
  const rows = tableEmbedRows(SEED_STAKEHOLDERS);
  assert.equal(rows.length, Math.min(8, SEED_STAKEHOLDERS.length));
  assert.deepEqual(rows.map((r) => r.id), SEED_STAKEHOLDERS.slice(0, 8).map((r) => r.id));
  assert.deepEqual(tableEmbedRows([]), []);
  assert.deepEqual(tableEmbedRows(null), []);
});

/* ── record option sets (sealed catalogs) ─────────────────────────────────── */
t('manual status vocabulary Active/Watch/Dormant; priority High/Medium/Low', () => {
  assert.deepEqual(SH_STATUS_OPTIONS, ['Active', 'Watch', 'Dormant']);
  assert.deepEqual(SH_PRIORITY_OPTIONS, ['High', 'Medium', 'Low']);
});

/* ── Map scorecard rail derivations (sealed MapDetail, page-hosted) ───────── */
t('sealed empty state: prompt (read-only, de-staled) + SIX recent rows', () => {
  assert.equal(EMPTY_PROMPT, 'Click any dot on the map to see details.');
  assert.equal(RECENT_CAP, 6);
  const rows = Array.from({ length: 10 }, (_, i) => ({ id: 's' + i }));
  assert.equal(recentRows(rows).length, 6);
  assert.deepEqual(recentRows(rows).map((r) => r.id), ['s0', 's1', 's2', 's3', 's4', 's5']);
  assert.deepEqual(recentRows(null), []);
});

t('sealed history tooltip copy (both states)', () => {
  assert.equal(HISTORY_TIP_ON, 'Exit history view');
  assert.equal(HISTORY_TIP_OFF, "View this stakeholder's historic positions");
});

t('sealed 11 detail rows, exact keys IN ORDER', () => {
  assert.deepEqual(DETAIL_ROW_KEYS, [
    'Category', 'Type', 'Market', 'Region', 'Geography', 'Issues',
    'Priority', 'Owner', 'Last contact', 'Status', 'Tags',
  ]);
  const rows = detailRowsFor({});
  assert.deepEqual(rows.map((r) => r.k), DETAIL_ROW_KEYS);
});

t('detail-row derivations: kinds + empty→null (the muted "-" contract)', () => {
  const s = {
    category: 'Government', type: 'Mayor', market: '', region: null,
    geography: 'Local', issues: [], priority: 'High', owners: ['u-1'],
    lastContact: '2026-05-12', status: 'Active', tags: ['a', 'b', 'c', 'd'],
  };
  const byK = Object.fromEntries(detailRowsFor(s).map((r) => [r.k, r]));
  assert.deepEqual(byK.Category, { k: 'Category', kind: 'text', value: 'Government' });
  assert.equal(byK.Market.value, null);          // "" → the muted "-"
  assert.equal(byK.Region.value, null);          // null → "-"
  assert.equal(byK.Issues.value, null);          // empty array → "-"
  assert.deepEqual(byK.Priority, { k: 'Priority', kind: 'priority', value: 'High' });
  assert.deepEqual(byK.Owner, { k: 'Owner', kind: 'owners', value: ['u-1'] });
  assert.deepEqual(byK['Last contact'], { k: 'Last contact', kind: 'date', value: '2026-05-12' });
  assert.deepEqual(byK.Status, { k: 'Status', kind: 'status', value: 'Active' });
  assert.deepEqual(byK.Tags, { k: 'Tags', kind: 'tags', value: ['a', 'b', 'c', 'd'] });
});

t('sealed live-coords readout: one decimal each, "(x, y)"', () => {
  assert.equal(coordsLabel(2.949999, 8.1), '(2.9, 8.1)');
  assert.equal(coordsLabel(-10, 0), '(-10.0, 0.0)');
});

console.log(`\nrecord-test: ${n} assertions passed`);
