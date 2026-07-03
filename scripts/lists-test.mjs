#!/usr/bin/env node
/* lists-test.mjs — node asserts on the exported PURE LOGIC of
 * design-system/components/stakeholder-table.js, with expected values taken
 * FROM THE SEALED BOX TEXT ("Lists table — the master stakeholder table" +
 * "Shared UI primitives" + "Catalogs"). The DOM component is guarded behind
 * typeof document, so this imports cleanly in node.
 */
import assert from 'node:assert/strict';
import {
  rowMatchesSearch, rowMatchesFilters, buildFilterOptions, rowMatchesBands,
  countByStatus, BAND_STATUSES, STATUS_ORDER,
  compareRows, sortRows, defaultCompare, SORT_FIELDS, sortFieldType, sortDirLabels,
  csvEscape, buildCsv, csvFilename, CSV_HEADERS,
  mergeColumnOrder, REORDER_KEYS, COL_ORDER_STORAGE_KEY,
  displayName, abbrevTitle, abbrev, formatPhone, normalizeUrl, cleanTel, cleanXHandle,
  PRIORITY_OPTIONS, STATUS_OPTIONS, cellClass, isPersonOf,
} from '../design-system/components/stakeholder-table.js';

let passed = 0;
const ok = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name); };

console.log('lists-test: sealed Lists pure logic\n');

/* ── FILTERS — OR within a field, AND across fields (sealed) ───────────── */
const rows = [
  { id: 'a', name: 'Alpha', type: 'Mayor', priority: 'High', status: 'Active',
    owners: ['u-1'], issues: ['AI'], _status: 'Collaborate', tags: ['ally'], org: 'City', notes: 'supportive', lastContact: '2026-06-01', _unscored: false, _x: 2, _y: 3 },
  { id: 'b', name: 'Beta', type: 'Media', priority: 'Low', status: 'Watch',
    owners: ['u-2'], issues: ['Education'], _status: 'Defend', tags: [], org: 'Paper', notes: '', lastContact: '2026-05-01', _unscored: false, _x: -3, _y: 6 },
  { id: 'c', name: 'Gamma', type: 'Mayor', priority: 'Medium', status: 'Dormant',
    owners: ['u-1', 'u-2'], issues: ['AI', 'Education'], _status: 'Monitor', tags: ['press'], org: 'Org', notes: '', lastContact: '2026-04-01', _unscored: true, _x: 0, _y: 0 },
];

ok('OR within a field: type [Mayor, Media] matches a AND b AND c', () => {
  const f = { type: ['Mayor', 'Media'] };
  assert.equal(rows.filter((r) => rowMatchesFilters(r, f)).length, 3);
});
ok('AND across fields: type Mayor AND priority High matches only a', () => {
  const f = { type: ['Mayor'], priority: ['High'] };
  assert.deepEqual(rows.filter((r) => rowMatchesFilters(r, f)).map((r) => r.id), ['a']);
});
ok('owners OR-matches any of the row array; issues likewise', () => {
  assert.deepEqual(rows.filter((r) => rowMatchesFilters(r, { owners: ['u-2'] })).map((r) => r.id), ['b', 'c']);
  assert.deepEqual(rows.filter((r) => rowMatchesFilters(r, { issues: ['AI'] })).map((r) => r.id), ['a', 'c']);
});
ok('zone filters on _status', () => {
  assert.deepEqual(rows.filter((r) => rowMatchesFilters(r, { zone: ['Defend', 'Monitor'] })).map((r) => r.id), ['b', 'c']);
});
ok('empty fields constrain nothing', () => {
  assert.equal(rows.filter((r) => rowMatchesFilters(r, { type: [], priority: [] })).length, 3);
});

/* ── OPTION LISTS — sealed CORRECTION: NOT all auto-aggregated ─────────── */
ok('Priority options HARDCODED High/Medium/Low; Status HARDCODED Active/Watch/Dormant', () => {
  // even when rows carry an out-of-catalog value, the lists stay hardcoded
  const weird = [...rows, { id: 'w', type: 'Zed', priority: 'Urgent', status: 'Paused', _status: 'Connect' }];
  const opts = buildFilterOptions(weird);
  assert.deepEqual(opts.priority, ['High', 'Medium', 'Low']);
  assert.deepEqual(opts.status, ['Active', 'Watch', 'Dormant']);
  assert.deepEqual(PRIORITY_OPTIONS, ['High', 'Medium', 'Low']);
  assert.deepEqual(STATUS_OPTIONS, ['Active', 'Watch', 'Dormant']);
});
ok('Type/Owners/Issues aggregate from rows (Set, sorted; arrays flattened)', () => {
  const opts = buildFilterOptions(rows);
  assert.deepEqual(opts.type, ['Mayor', 'Media']);
  assert.deepEqual(opts.owners, ['u-1', 'u-2']);
  assert.deepEqual(opts.issues, ['AI', 'Education']);
});
ok('Zone options follow STATUS_ORDER (canonical, NOT alphabetical), filtered to present', () => {
  const opts = buildFilterOptions(rows);
  assert.deepEqual(opts.zone, ['Defend', 'Monitor', 'Collaborate']); // spectrum order
  assert.equal(STATUS_ORDER.length, 14);
});

/* ── BANDS (sealed BAND_STATUSES) ──────────────────────────────────────── */
ok('BAND_STATUSES are the sealed three zone lists', () => {
  assert.deepEqual(BAND_STATUSES.positive, ['Cooperate', 'Collaborate', 'Valuable Relationship', 'High Value Relationship', 'Strategic Partner']);
  assert.deepEqual(BAND_STATUSES.middle, ['Monitor', 'Maintain', 'Connect', 'Commit']);
  assert.deepEqual(BAND_STATUSES.negative, ['Proactively Defend', 'Defend', 'Protect', 'Respond', 'Identify']);
});
ok('band filter: selected bands OR their zones; empty = all', () => {
  assert.deepEqual(rows.filter((r) => rowMatchesBands(r, ['middle'])).map((r) => r.id), ['c']);
  assert.deepEqual(rows.filter((r) => rowMatchesBands(r, ['middle', 'negative'])).map((r) => r.id), ['b', 'c']);
  assert.equal(rows.filter((r) => rowMatchesBands(r, [])).length, 3);
  assert.deepEqual(countByStatus(rows), { Collaborate: 1, Defend: 1, Monitor: 1 });
});

/* ── SEARCH (sealed match set: displayName/name/org/type/notes/tags) ───── */
ok('search matches name, org, type, notes and tags, case-insensitive', () => {
  assert.equal(rowMatchesSearch(rows[0], 'ALPHA'), true);
  assert.equal(rowMatchesSearch(rows[0], 'city'), true);      // org
  assert.equal(rowMatchesSearch(rows[0], 'mayor'), true);     // type
  assert.equal(rowMatchesSearch(rows[0], 'support'), true);   // notes
  assert.equal(rowMatchesSearch(rows[0], 'ally'), true);      // tag entry
  assert.equal(rowMatchesSearch(rows[0], 'zzz'), false);
});

/* ── SORT — custom orderings (sealed comparator) ───────────────────────── */
ok('priority orders High(0) > Medium(1) > Low(2), missing → 9', () => {
  const arr = [{ priority: 'Low' }, { priority: 'High' }, { priority: undefined }, { priority: 'Medium' }];
  const sorted = sortRows(arr, 'priority', 'asc');
  assert.deepEqual(sorted.map((r) => r.priority), ['High', 'Medium', 'Low', undefined]);
});
ok('status orders Active(0) > Watch(1) > Dormant(2), missing → 9', () => {
  const arr = [{ status: 'Dormant' }, { status: 'Bogus' }, { status: 'Active' }, { status: 'Watch' }];
  const sorted = sortRows(arr, 'status', 'asc');
  assert.deepEqual(sorted.map((r) => r.status), ['Active', 'Watch', 'Dormant', 'Bogus']);
});
ok('site sorts on siteLabel of the resolved site record', () => {
  const sites = [
    { id: 's1', city: 'Vancouver', state: 'Washington' },
    { id: 's2', city: 'Corvallis', state: 'Oregon' },
  ];
  const siteLabel = (s) => `${s.city}, ${s.state}`;
  const arr = [{ site: 's1' }, { site: 's2' }];
  const sorted = sortRows(arr, 'site', 'asc', { sites, siteLabel });
  assert.deepEqual(sorted.map((r) => r.site), ['s2', 's1']); // Corvallis before Vancouver
});
ok('name sorts on displayName || name (sealed)', () => {
  const arr = [
    { firstName: 'Zoe', lastName: 'Ab', title: 'Senator' },   // "Sen. Zoe Ab"
    { name: 'Aardvark Org' },
  ];
  const sorted = sortRows(arr, 'name', 'asc');
  assert.equal(sorted[0].name, 'Aardvark Org');
});
ok('numbers subtract (x/y numeric sort); direction flips the sign', () => {
  const arr = [{ _x: 3 }, { _x: -5 }, { _x: 0 }];
  assert.deepEqual(sortRows(arr, '_x', 'asc').map((r) => r._x), [-5, 0, 3]);
  assert.deepEqual(sortRows(arr, '_x', 'desc').map((r) => r._x), [3, 0, -5]);
});
ok('Owner header sort is MADE REAL: first owner resolved user name (the oracle sorted an absent field — inert)', () => {
  const users = [{ id: 'u-1', name: 'Zed Q' }, { id: 'u-2', name: 'Amy B' }];
  const arr = [{ owners: ['u-1'] }, { owners: ['u-2'] }, { owners: [] }];
  const sorted = sortRows(arr, 'owner', 'asc', { users });
  assert.deepEqual(sorted.map((r) => (r.owners[0] || 'none')), ['none', 'u-2', 'u-1']); // '' < Amy < Zed
});

/* ── DEFAULT SORT — unscored first, then lastContact desc (sealed) ─────── */
ok('default sort: unscored first, then most-recent lastContact', () => {
  const arr = [
    { id: 'x', _unscored: false, lastContact: '2026-01-01' },
    { id: 'y', _unscored: true, lastContact: '2020-01-01' },
    { id: 'z', _unscored: false, lastContact: '2026-06-01' },
  ];
  assert.deepEqual(sortRows(arr, null, 'asc').map((r) => r.id), ['y', 'z', 'x']);
  assert.equal(defaultCompare(arr[1], arr[0]) < 0, true);
});

/* ── SORT POPOVER metadata (the sealed 11 + type inference) ────────────── */
ok('the 11 sealed sortable fields, keys and labels', () => {
  assert.deepEqual(SORT_FIELDS.map((f) => f.key),
    ['name', 'org', 'type', 'market', 'region', 'state', 'site', 'lastContact', 'updatedAt', 'createdAt', '_status']);
  assert.equal(SORT_FIELDS.find((f) => f.key === 'updatedAt').label, 'Last updated');
  assert.equal(SORT_FIELDS.find((f) => f.key === 'createdAt').label, 'Date added');
});
ok('type inference + direction labels (dates default Newest first at pick)', () => {
  assert.equal(sortFieldType('lastContact'), 'date');
  assert.equal(sortFieldType('updatedAt'), 'date');
  assert.equal(sortFieldType('_x'), 'num');
  assert.equal(sortFieldType('name'), 'text');
  assert.deepEqual(sortDirLabels('date'), ['Oldest first', 'Newest first']);
  assert.deepEqual(sortDirLabels('num'), ['Low → High', 'High → Low']);
  assert.deepEqual(sortDirLabels('text'), ['A → Z', 'Z → A']);
});

/* ── CSV — sealed escaping, column set, filename ───────────────────────── */
ok('csvEscape: /[",\\n]/ → wrapped in quotes with internal quotes doubled', () => {
  assert.equal(csvEscape('plain'), 'plain');
  assert.equal(csvEscape('a,b'), '"a,b"');
  assert.equal(csvEscape('say "hi"'), '"say ""hi"""');
  assert.equal(csvEscape('line1\nline2'), '"line1\nline2"');
  assert.equal(csvEscape(''), '');
});
ok('CSV column set in the sealed order; unresolvable owner id exports raw', () => {
  assert.deepEqual(CSV_HEADERS, ['Stakeholder', 'Organization', 'Category', 'Type', 'Market', 'Region', 'Geography', 'Issues', 'Priority', 'Tags', 'Owners', 'Last contact', 'Status', 'x', 'y', 'Relationship', 'Website', 'Notes']);
  const users = [{ id: 'u-1', name: 'Alex Rivera' }];
  const csv = buildCsv([{
    name: 'Org, Inc.', org: 'Org, Inc.', category: 'Government', type: 'Mayor',
    market: 'Americas', region: 'United States', geography: 'Local',
    issues: ['AI', 'Education'], priority: 'High', tags: ['a', 'b'],
    owners: ['u-1', 'u-ghost'], lastContact: '2026-05-12', status: 'Active',
    _x: 2.94, _y: 8.06, _status: 'Valuable Relationship', url: 'example.com',
    notes: 'said "yes"',
  }], users);
  const [head, line] = csv.split('\n');
  assert.equal(head.split(',').length, 18);
  assert.ok(line.includes('"Org, Inc."'));                       // comma-escaped
  assert.ok(line.includes('AI; Education'));                     // "; " joins
  assert.ok(line.includes('Alex Rivera; u-ghost'));              // raw id fallback
  assert.ok(line.includes('2.9') && line.includes('8.1'));       // toFixed(1)
  assert.ok(line.includes('https://example.com'));               // normalizeUrl
  assert.ok(line.includes('"said ""yes"""'));                    // quote-escaped
});
ok('filename: hyphens PRESERVED, runs of other non-word chars → single "_"', () => {
  assert.equal(csvFilename('Climate Change in Europe'), 'Climate_Change_in_Europe.csv');
  assert.equal(csvFilename('gapp-na — ops!'), 'gapp-na_ops_.csv'); // the " — " run → ONE _
  assert.equal(csvFilename('a-b c'), 'a-b_c.csv');
  assert.equal(csvFilename(''), 'stakeholders.csv');
  assert.equal(csvFilename(null), 'stakeholders.csv');
  assert.equal(csvFilename('x!!y'), 'x_y.csv');                  // a RUN collapses to ONE _
});

/* ── LINK CLEANING (sealed regexes) ────────────────────────────────────── */
ok('tel cleaning strips everything except digits and +', () => {
  assert.equal(cleanTel('(503) 555-0142'), '5035550142');
  assert.equal(cleanTel('+32 2 555 0100'), '+3225550100');
});
ok('xAccount strips one-or-more leading @ → x.com/{handle}', () => {
  assert.equal(cleanXHandle('@MayorMariaChen'), 'MayorMariaChen');
  assert.equal(cleanXHandle('@@double'), 'double');
  assert.equal(cleanXHandle('bare'), 'bare');
});
ok('formatPhone: 10-digit → (xxx) xxx-xxxx; 11 with leading 1 drops it; others pass through', () => {
  assert.equal(formatPhone('5035550142'), '(503) 555-0142');
  assert.equal(formatPhone('15035550142'), '(503) 555-0142');
  assert.equal(formatPhone('+49 30 555 0122'), '+49 30 555 0122'); // 11 digits, no leading 1 → pass through
  assert.equal(formatPhone(''), '');
});
ok('normalizeUrl passes existing http(s) through, else prepends https://', () => {
  assert.equal(normalizeUrl('example.com'), 'https://example.com');
  assert.equal(normalizeUrl('HTTP://x.io'), 'HTTP://x.io');
  assert.equal(normalizeUrl('  '), '');
});

/* ── NAME HELPERS (sealed Shared-primitives formulas) ──────────────────── */
ok('displayName: title abbrev + first + last; None/empty contributes no prefix; falls back to name', () => {
  assert.equal(displayName({ firstName: 'Maria', lastName: 'Chen', title: 'Mayor' }), 'Mayor Maria Chen');
  assert.equal(displayName({ firstName: 'Dana', lastName: 'Whitfield', title: 'Senator' }), 'Sen. Dana Whitfield');
  assert.equal(displayName({ firstName: 'Lena', lastName: 'Ortiz', title: 'Other', titleOther: 'Provost' }), 'Provost Lena Ortiz');
  assert.equal(displayName({ firstName: 'Marcus', lastName: 'Boone', title: 'None' }), 'Marcus Boone');
  assert.equal(displayName({ name: 'Oregon DEQ' }), 'Oregon DEQ');
  assert.equal(abbrevTitle('Governor'), 'Gov.');
  assert.equal(abbrevTitle('CEO'), 'CEO'); // unmapped renders in full
});
ok('abbrev initials strip honorifics; isPerson inferred from first/last name', () => {
  assert.equal(abbrev('Mayor Maria Chen'), 'MC');
  assert.equal(abbrev('Cher'), 'CH');
  assert.equal(isPersonOf({ firstName: 'A' }), true);
  assert.equal(isPersonOf({ name: 'Org' }), false);
});

/* ── COLUMN-ORDER MERGE (sealed localStorage rule) ─────────────────────── */
ok('mergeColumnOrder: saved order kept, unknown keys dropped, new keys appended', () => {
  assert.equal(COL_ORDER_STORAGE_KEY, 'hp_map_col_order_v3'); // the sealed LIVE key
  assert.equal(REORDER_KEYS.length, 22);
  const saved = ['priority', 'category', 'GHOST_COLUMN', '_status'];
  const merged = mergeColumnOrder(saved);
  assert.deepEqual(merged.slice(0, 3), ['priority', 'category', '_status']); // unknown dropped
  assert.equal(merged.length, 22);                                            // new appended
  assert.deepEqual([...merged].sort(), [...REORDER_KEYS].sort());
  assert.deepEqual(mergeColumnOrder(null), REORDER_KEYS);                     // no saved → canonical
  assert.deepEqual(mergeColumnOrder('garbage'), REORDER_KEYS);                // non-array → canonical
});

/* ── CELL EMPHASIS map (sealed) ────────────────────────────────────────── */
ok('cellClass: dim/strong/sm/pills/zone/url/coord per the sealed map', () => {
  assert.equal(cellClass('phone'), 'cell-dim cell-sm url-cell');
  assert.equal(cellClass('category'), 'cell-strong');
  assert.equal(cellClass('issues'), 'pills-cell');
  assert.equal(cellClass('_status'), 'zone-cell');
  assert.equal(cellClass('notes'), 'cell-dim notes');
  assert.equal(cellClass('_x'), 'coord readonly');
  assert.equal(cellClass('name'), '');   // default weight (sealed: name/org/priority/owner)
  assert.equal(cellClass('owner'), '');
});

console.log(`\nlists-test: ${passed} assertions groups passed — ALL GREEN`);
