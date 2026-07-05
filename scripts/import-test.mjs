#!/usr/bin/env node
/* import-test.mjs — node asserts on the PHASE 18 IMPORT pure logic (the
 * sealed demo-features flow, src/guide.jsx ~3885–3893):
 *   · the hand-written CSV parser against the sealed escaping rules
 *     (quotes doubled; wrap on quote/comma/newline; CRLF; BOM; trailing NL)
 *   · auto column-map: case-insensitive header equality + the declared
 *     aliases the sealed export requires (Owners→Owner etc.); computed
 *     headers → the COMPUTED disposition; unknown → Ignore
 *   · VALIDATION against live catalogs incl. every sealed cascade
 *     (Type∈Category, Region∈Market, Site∈State + the site→state auto-fill),
 *     multi-value "; " splitting, owner name resolution, date parsing
 *     (YYYY-MM-DD, M/D/YYYY, Excel serials), Missing Organization
 *   · computed-column skip (x/y/Relationship/Community/audit never land)
 *   · the commit builders (uid mint, audit stamps, owner default, name→org)
 *   · the TEMPLATE: XLSX writer (stored zip, CRC-verified) round-tripped
 *     through the Phase-18 reader; headers/hints/lookups/validations present
 *   · the READER's deflate path (a method-8 zip built with node zlib)
 *   · the FULL ROUND TRIP (gate 3): demo seed → the sealed exportCsv
 *     serializer → parse → auto-map → validate = zero errors, zero aborts,
 *     computed columns skipped, owners resolved back to ids.
 */
import assert from 'node:assert/strict';
import { deflateRawSync } from 'node:zlib';
import {
  parseCsv, autoMapHeaders, validateRows, importSummary, splitMulti,
  parseDateCell, serialToYMD, isHintRow, isEmptyRow, buildImportRecords,
  importedBody, importedSnack, IMPORT_TARGETS, COMPUTED_HEADERS,
  IGNORE, COMPUTED, LEAVE_BLANK_NOTE, CHOICE_HINT, FORMAT_HINTS,
} from '../src/app/import/import-logic.js';
import {
  buildTemplateXlsx, buildTemplateCsv, TEMPLATE_HEADERS,
  zipStore, crc32, colLetter, sanitizeNameToken, substituteChain, xmlEscape,
} from '../src/app/import/template.js';
import {
  readXlsxRows, listZipEntries, readZipEntry, parseSharedStrings,
  parseSheetRows, colIndexFromRef, xmlUnescape,
} from '../src/app/import/xlsx-read.js';
import {
  CATEGORIES, MARKETS, GEOGRAPHIES, US_STATES, SITES, ISSUES, TAGS,
  STAKEHOLDER_STATUS, siteLabel,
} from '../src/app/data/catalogs.js';
import { SEED_STAKEHOLDERS, SEED_USERS, SEED_SCORES, SEED_TEAM } from '../src/app/data/seed.js';
import { weightedCoord, statusFor } from '../src/app/data/engine.js';
import { buildCsv, normalizeUrl, displayName } from '../design-system/components/stakeholder-table.js';

let passed = 0;
// async-aware: an await inside a test must fail THAT test, never leak as a
// stray unhandled rejection after the checkmark printed.
const ok = async (name, fn) => { await fn(); passed++; console.log('  ✓ ' + name); };

console.log('import-test: Phase 18 import wizard pure logic\n');

/* The live-catalog ctx (the demo defaults — exactly what the company seam
 * yields before any Settings edit). */
const CTX = {
  categories: CATEGORIES, markets: MARKETS, geographies: GEOGRAPHIES,
  usStates: US_STATES, sites: SITES, siteLabel,
  issues: ISSUES, tags: TAGS,
  users: SEED_USERS.filter((u) => u.role !== 'system'),
  priorities: ['High', 'Medium', 'Low'], statuses: STAKEHOLDER_STATUS,
};

/* ── CSV PARSER (sealed escaping) ───────────────────────────────────────── */

await ok('plain rows + trailing newline (no phantom row)', () => {
  assert.deepEqual(parseCsv('a,b,c\n1,2,3\n'), [['a', 'b', 'c'], ['1', '2', '3']]);
});
await ok('quoted field with comma', () => {
  assert.deepEqual(parseCsv('a,"b,c",d'), [['a', 'b,c', 'd']]);
});
await ok('doubled quotes unescape', () => {
  assert.deepEqual(parseCsv('"say ""hi""",x'), [['say "hi"', 'x']]);
});
await ok('newline INSIDE a quoted cell stays in the cell', () => {
  assert.deepEqual(parseCsv('"line1\nline2",b\nc,d'),
    [['line1\nline2', 'b'], ['c', 'd']]);
});
await ok('CRLF and bare CR row breaks', () => {
  assert.deepEqual(parseCsv('a,b\r\nc,d\re,f'), [['a', 'b'], ['c', 'd'], ['e', 'f']]);
});
await ok('UTF-8 BOM stripped', () => {
  assert.deepEqual(parseCsv('﻿a,b'), [['a', 'b']]);
});
await ok('empty trailing field preserved', () => {
  assert.deepEqual(parseCsv('a,b,\n1,,3'), [['a', 'b', ''], ['1', '', '3']]);
});
await ok('escape → parse round trip on hostile values', () => {
  const evil = ['He said "no"', 'a,b', 'x\ny', 'plain'];
  const esc = (v) => (/[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
  assert.deepEqual(parseCsv(evil.map(esc).join(','))[0], evil);
});

/* ── AUTO COLUMN-MAP ────────────────────────────────────────────────────── */

await ok('exact + case-insensitive header equality', () => {
  const m = autoMapHeaders(['Stakeholder', 'ORGANIZATION', 'category']);
  assert.deepEqual(m.map((x) => x.target), ['name', 'org', 'category']);
  assert.ok(m.every((x) => x.auto));
});
await ok('sealed-export aliases: Owners→owners, State→state, URL→url', () => {
  const m = autoMapHeaders(['Owners', 'State', 'URL']);
  assert.deepEqual(m.map((x) => x.target), ['owners', 'state', 'url']);
});
await ok('computed headers → COMPUTED (x, y, Relationship, Community investment, audit)', () => {
  const m = autoMapHeaders(['x', 'y', 'Relationship', 'Community investment', 'Date added', 'Last updated']);
  assert.ok(m.every((x) => x.target === COMPUTED));
});
await ok('unknown headers → Ignore this column', () => {
  const m = autoMapHeaders(['Favourite colour', '']);
  assert.ok(m.every((x) => x.target === IGNORE && !x.auto));
});
await ok('a target is claimed once (duplicate headers)', () => {
  const m = autoMapHeaders(['Notes', 'notes']);
  assert.deepEqual(m.map((x) => x.target), ['notes', IGNORE]);
});

/* ── VALUE HELPERS ──────────────────────────────────────────────────────── */

await ok('splitMulti: the sealed "; " delimiter, whitespace-tolerant', () => {
  assert.deepEqual(splitMulti('AI; Education ;Taxation'), ['AI', 'Education', 'Taxation']);
  assert.deepEqual(splitMulti('  '), []);
});
await ok('dates: YYYY-MM-DD, M/D/YYYY, Excel serial, garbage', () => {
  assert.equal(parseDateCell('2026-06-01'), '2026-06-01');
  assert.equal(parseDateCell('6/1/2026'), '2026-06-01');
  assert.equal(parseDateCell(46174), serialToYMD(46174));
  assert.equal(serialToYMD(45108), '2023-07-01'); // known vector
  assert.equal(parseDateCell(''), '');
  assert.equal(parseDateCell('yesterday'), null);
  assert.equal(parseDateCell('2026-13-40'), null);
});
await ok('hint/empty row detection', () => {
  assert.ok(isEmptyRow(['', ' ', '']));
  assert.ok(isHintRow([FORMAT_HINTS.name, CHOICE_HINT, LEAVE_BLANK_NOTE]));
  assert.ok(!isHintRow(['Acme Corp', CHOICE_HINT]));
});

/* ── VALIDATION + CASCADES ──────────────────────────────────────────────── */

const HEADERS = ['Stakeholder', 'Organization', 'Category', 'Type', 'Market',
  'Region', 'Geography', 'State', 'Sites', 'Issues', 'Priority', 'Tags',
  'Owner', 'Last contact', 'Status', 'x', 'Relationship'];
const MAP = autoMapHeaders(HEADERS);
const row = (over = {}) => {
  const base = {
    Stakeholder: 'Jane Doe', Organization: 'Acme', Category: 'Government',
    Type: 'Mayor', Market: 'Americas', Region: 'United States',
    Geography: 'Local', State: 'Texas', Sites: 'Houston, TX',
    Issues: 'AI; Education', Priority: 'High', Tags: 'ally',
    Owner: SEED_USERS[0].name, 'Last contact': '2026-06-01', Status: 'Active',
    x: '3.4', Relationship: 'Collaborate',
  };
  return HEADERS.map((h) => (h in over ? over[h] : base[h]));
};
const validate1 = (over) => validateRows([row(over)], MAP, CTX).rows[0];

await ok('a fully valid row: no errors; computed x/Relationship never land', () => {
  const r = validate1();
  assert.equal(r.errors.length, 0);
  assert.equal(r.values._x, undefined);
  assert.equal(r.values._status, undefined);
  assert.equal(r.values.site, 'site-houston'); // site label resolved to id
});
await ok('Unknown Category value', () => {
  const r = validate1({ Category: 'Aliens', Type: '' });
  assert.ok(r.errors.some((e) => e.message === 'Unknown Category value'));
});
await ok('cascade: Type does not belong to chosen Category', () => {
  const r = validate1({ Category: 'Government', Type: 'Church' });
  assert.ok(r.errors.some((e) => e.message === 'Type does not belong to chosen Category'));
});
await ok('Type with no Category: valid if it exists anywhere, else Unknown', () => {
  assert.equal(validate1({ Category: '', Type: 'Mayor' }).errors.length, 0);
  assert.ok(validate1({ Category: '', Type: 'Warlock' })
    .errors.some((e) => e.message === 'Unknown Type value'));
});
await ok('cascade: Region does not belong to chosen Market', () => {
  const r = validate1({ Market: 'EMEA', Region: 'United States' });
  assert.ok(r.errors.some((e) => e.message === 'Region does not belong to chosen Market'));
});
await ok('Unknown Market / Geography / State / Priority / Status', () => {
  assert.ok(validate1({ Market: 'Mars', Region: '' }).errors.some((e) => e.message === 'Unknown Market value'));
  assert.ok(validate1({ Geography: 'Galactic' }).errors.some((e) => e.message === 'Unknown Geography value'));
  assert.ok(validate1({ State: 'Atlantis', Sites: '' }).errors.some((e) => e.message === 'Unknown State value'));
  assert.ok(validate1({ Priority: 'Urgent' }).errors.some((e) => e.message === 'Unknown Priority value'));
  assert.ok(validate1({ Status: 'Asleep' }).errors.some((e) => e.message === 'Unknown Status value'));
});
await ok('cascade: Site does not belong to chosen State', () => {
  const r = validate1({ State: 'California', Sites: 'Houston, TX' });
  assert.ok(r.errors.some((e) => e.message === 'Site does not belong to chosen State'));
});
await ok('site auto-fills a blank State (the sealed in-app cascade)', () => {
  const r = validate1({ State: '', Sites: 'Houston, TX' });
  assert.equal(r.errors.length, 0);
  assert.equal(r.values.state, 'Texas');
});
await ok('multi-value Issues/Tags validate each value against the catalog', () => {
  const r = validate1({ Issues: 'AI; Cryptozoology' });
  assert.ok(r.errors.some((e) => e.message.startsWith('Unknown Issue value')));
  const r2 = validate1({ Tags: 'ally; not-a-tag' });
  assert.ok(r2.errors.some((e) => e.message.startsWith('Unknown Tag value')));
});
await ok('owners resolve by name (case-insensitive) to ids; unknown flagged', () => {
  const u = SEED_USERS[0];
  const r = validate1({ Owner: u.name.toUpperCase() });
  assert.deepEqual(r.values.owners, [u.id]);
  const r2 = validate1({ Owner: 'Nobody Q. Person' });
  assert.ok(r2.errors.some((e) => e.message.startsWith('Unknown Owner')));
});
await ok('unparseable date flagged; serial + M/D/YYYY accepted', () => {
  assert.ok(validate1({ 'Last contact': 'soon' }).errors.some((e) => e.message === 'Unparseable date'));
  assert.equal(validate1({ 'Last contact': '6/1/2026' }).values.lastContact, '2026-06-01');
});
await ok('Missing Organization is the one required-cell error', () => {
  const r = validate1({ Organization: ' ' });
  assert.ok(r.errors.some((e) => e.message === 'Missing Organization'));
});
await ok('blank choice cells import as EMPTY (never coerced to defaults)', () => {
  const r = validate1({ Category: '', Type: '', Market: '', Region: '', Geography: '', Priority: '', Status: '', State: '', Sites: '' });
  assert.equal(r.errors.length, 0);
  assert.equal(r.values.category, '');
  assert.equal(r.values.priority, '');
});
await ok('values are case-normalized to the catalog casing, never invented', () => {
  const r = validate1({ Category: 'gOvErNmEnT', Type: 'mayor' });
  assert.equal(r.values.category, 'Government');
  assert.equal(r.values.type, 'Mayor');
});
await ok('empty + template-hint rows are skipped, never errored', () => {
  const hint = HEADERS.map((h) => (h === 'x' || h === 'Relationship' ? LEAVE_BLANK_NOTE : (FORMAT_HINTS.name)));
  const res = validateRows([HEADERS.map(() => ''), hint, row()], MAP, CTX);
  assert.equal(res.skipped, 2);
  assert.equal(res.rows.length, 1);
  assert.equal(res.ready, 1);
});
await ok('summary copy singularizes (sealed count-copy rule)', () => {
  assert.equal(importSummary(1, 0), '1 row ready · 0 rows with errors');
  assert.equal(importSummary(2, 1), '2 rows ready · 1 row with errors');
});

/* ── COMMIT BUILDERS ────────────────────────────────────────────────────── */

await ok('records mint ids, stamp audit fields, default owners, name→org fallback', () => {
  let n = 0;
  const res = validateRows([row({ Stakeholder: '', Owner: '' })], MAP, CTX);
  const recs = buildImportRecords(res.rows, {
    uid: (p) => `${p}-test-${++n}`, stamp: 'T0', currentUserId: 'u-me', normalizeUrl,
  });
  assert.equal(recs.length, 1);
  const r = recs[0];
  assert.equal(r.id, 'sh-test-1');
  assert.equal(r.name, 'Acme');           // sealed composeSubmit fallback
  assert.equal(r.createdAt, 'T0');
  assert.equal(r.updatedAt, 'T0');
  assert.equal(r.createdBy, 'u-me');
  assert.deepEqual(r.owners, ['u-me']);   // sealed addStakeholder default
  assert.equal(r.isPerson, false);
});
await ok('import copy strings', () => {
  assert.equal(importedSnack(2), 'Imported 2 stakeholders');
  assert.equal(importedSnack(1), 'Imported 1 stakeholder');
  assert.ok(importedBody(3).includes('Please score them on the Scoring tab.'));
});

/* ── TEMPLATE: XLSX writer → Phase-18 reader round trip ─────────────────── */

await ok('crc32 known vector + colLetter + sanitize/SUBSTITUTE parity', () => {
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xCBF43926);
  assert.equal(colLetter(1), 'A');
  assert.equal(colLetter(26), 'Z');
  assert.equal(colLetter(27), 'AA');
  assert.equal(sanitizeNameToken('Our People'), 'Our_People');
  assert.equal(sanitizeNameToken('A  B&C'), 'A__B_C'); // 1:1 per char, no collapsing
  const chain = substituteChain('$C3', ['Our People', 'R&D']);
  assert.ok(chain.includes('SUBSTITUTE'));
  assert.ok(chain.includes('" ","_"') && chain.includes('"&","_"'));
});

const xlsxBytes = buildTemplateXlsx(CTX);
await ok('template zip: all 7 OOXML parts present, CRCs verify', async () => {
  const entries = listZipEntries(xlsxBytes);
  const names = entries.map((e) => e.name).sort();
  assert.deepEqual(names, [
    '[Content_Types].xml', '_rels/.rels', 'xl/_rels/workbook.xml.rels',
    'xl/styles.xml', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml',
    'xl/worksheets/sheet2.xml',
  ].sort());
  for (const e of entries) {
    const data = await readZipEntry(xlsxBytes, e);
    assert.equal(e.method, 0); // stored
    assert.ok(data.length > 0);
  }
});

const dec = new TextDecoder();
const partText = async (name) => {
  const entries = listZipEntries(xlsxBytes);
  return dec.decode(await readZipEntry(xlsxBytes, entries.find((e) => e.name === name)));
};

await ok('workbook: Lookups sheet HIDDEN; cascade defined names present', async () => {
  const wb = await partText('xl/workbook.xml');
  assert.ok(wb.includes('name="Lookups" sheetId="2" state="hidden"'));
  for (const dn of ['CatList', 'MktList', 'GeoList', 'StateList', 'PriList',
    'StatusList', 'IssueList', 'TagList', 'OwnerList', 'SiteListAll', 'BlankOne',
    'Cat_Government', 'Cat_Our_People', 'Mkt_Americas', 'St_Texas']) {
    assert.ok(wb.includes(`name="${dn}"`), `defined name ${dn}`);
  }
});
await ok('sheet1: 12 data validations; strict single-choice, advisory multi-value; INDIRECT cascades', async () => {
  const s1 = await partText('xl/worksheets/sheet1.xml');
  assert.ok(s1.includes('<dataValidations count="12">'));
  assert.ok(s1.includes('INDIRECT(&quot;Cat_&quot;'));
  assert.ok(s1.includes('INDIRECT(&quot;Mkt_&quot;'));
  assert.ok(s1.includes('INDIRECT(&quot;St_&quot;'));
  // multi-value columns (Issues J, Tags L, Owner M) are advisory
  assert.ok(s1.includes('showErrorMessage="0" sqref="J3:J1002"'));
  assert.ok(s1.includes('showErrorMessage="0" sqref="L3:L1002"'));
  assert.ok(s1.includes('showErrorMessage="0" sqref="M3:M1002"'));
  // single-choice Category C stays strict
  assert.ok(s1.includes('showErrorMessage="1" sqref="C3:C1002"'));
});

await ok('template → reader round trip: headers row 1, hints row 2, hint row skips', async () => {
  const rows = await readXlsxRows(xlsxBytes);
  assert.deepEqual(rows[0], TEMPLATE_HEADERS);
  assert.equal(rows[0].length, 24); // the 24 data columns (26 minus idx/edit)
  assert.ok(rows[1].includes(LEAVE_BLANK_NOTE));
  const mapping = autoMapHeaders(rows[0]);
  // every template header maps: 20 inputs + 4 computed, zero ignored
  assert.equal(mapping.filter((m) => m.target === COMPUTED).length, 4);
  assert.equal(mapping.filter((m) => m.target === IGNORE).length, 0);
  const res = validateRows(rows.slice(1), mapping, CTX);
  assert.equal(res.rows.length, 0);  // the hint row is skipped…
  assert.equal(res.skipped, 1);      // …never flagged
});

await ok('reader deflate path: a method-8 zip (what Excel writes) parses', async () => {
  const enc = new TextEncoder();
  const sheet = '<worksheet><sheetData>' +
    '<row r="1"><c r="A1" t="inlineStr"><is><t>Organization</t></is></c></row>' +
    '<row r="2"><c r="A2" t="s"><v>0</v></c><c r="B2"><v>45108</v></c></row>' +
    '</sheetData></worksheet>';
  const shared = '<sst><si><t>Acme &amp; Sons</t></si></sst>';
  const mkEntry = (name, xml) => {
    const raw = enc.encode(xml);
    const comp = new Uint8Array(deflateRawSync(raw));
    return { name, raw, comp };
  };
  const files = [
    mkEntry('xl/worksheets/sheet1.xml', sheet),
    mkEntry('xl/sharedStrings.xml', shared),
  ];
  // hand-build a method-8 zip (local headers + central dir + EOCD)
  const parts = [];
  const central = [];
  let off = 0;
  const u16b = (v) => new Uint8Array([v & 255, (v >> 8) & 255]);
  const u32b = (v) => new Uint8Array([v & 255, (v >> 8) & 255, (v >> 16) & 255, (v >> 24) & 255]);
  for (const f of files) {
    const nb = enc.encode(f.name);
    const c = crc32(f.raw);
    const local = [u32b(0x04034B50), u16b(20), u16b(0), u16b(8), u16b(0), u16b(0),
      u32b(c), u32b(f.comp.length), u32b(f.raw.length), u16b(nb.length), u16b(0)];
    central.push({ nb, c, cs: f.comp.length, us: f.raw.length, off });
    for (const p of local) parts.push(p);
    parts.push(nb, f.comp);
    off += 30 + nb.length + f.comp.length;
  }
  const cdStart = off;
  let cdSize = 0;
  for (const e of central) {
    const rec = [u32b(0x02014B50), u16b(20), u16b(20), u16b(0), u16b(8), u16b(0), u16b(0),
      u32b(e.c), u32b(e.cs), u32b(e.us), u16b(e.nb.length), u16b(0), u16b(0),
      u16b(0), u16b(0), u32b(0), u32b(e.off)];
    for (const p of rec) { parts.push(p); cdSize += p.length; }
    parts.push(e.nb); cdSize += e.nb.length;
  }
  for (const p of [u32b(0x06054B50), u16b(0), u16b(0), u16b(central.length),
    u16b(central.length), u32b(cdSize), u32b(cdStart), u16b(0)]) parts.push(p);
  const total = parts.reduce((s, p) => s + p.length, 0);
  const zip = new Uint8Array(total);
  let pos = 0;
  for (const p of parts) { zip.set(p, pos); pos += p.length; }

  const rows = await readXlsxRows(zip);
  assert.deepEqual(rows[0], ['Organization']);
  assert.equal(rows[1][0], 'Acme & Sons');   // shared string + entity decode
  assert.equal(rows[1][1], 45108);           // numeric survives as a serial
});

await ok('CSV template twin: 24 headers + the hint row, sealed escaping', () => {
  const rows = parseCsv(buildTemplateCsv());
  assert.deepEqual(rows[0], TEMPLATE_HEADERS);
  assert.ok(rows[1].includes(LEAVE_BLANK_NOTE));
  assert.ok(isHintRow(rows[1]));
});

/* ── THE FULL ROUND TRIP (gate 3): sealed export → import, zero aborts ──── */

await ok('demo-seed export → re-import: all rows valid, computed skipped, owners resolve', () => {
  const rows = SEED_STAKEHOLDERS.map((s) => {
    const pos = weightedCoord(s.id, SEED_SCORES, SEED_TEAM);
    return { ...s, _x: pos.x, _y: pos.y, _status: statusFor(pos.x, pos.y) };
  });
  const csv = buildCsv(rows, SEED_USERS);           // the sealed exportCsv serializer
  const parsed = parseCsv(csv);
  assert.equal(parsed.length, SEED_STAKEHOLDERS.length + 1);
  const mapping = autoMapHeaders(parsed[0]);
  // the sealed 18 export headers all resolve: 15 inputs + x/y/Relationship computed
  assert.equal(mapping.filter((m) => m.target === COMPUTED).length, 3);
  assert.equal(mapping.filter((m) => m.target === IGNORE).length, 0);
  const res = validateRows(parsed.slice(1), mapping, CTX);
  assert.equal(res.errored, 0, JSON.stringify(res.rows.flatMap((r) => r.errors)));
  assert.equal(res.ready, SEED_STAKEHOLDERS.length);
  // computed export values never landed as inputs
  for (const r of res.rows) {
    assert.equal(r.values._x, undefined);
    assert.equal(r.values._y, undefined);
    assert.equal(r.values._status, undefined);
  }
  // owners round-tripped name→id
  const first = res.rows[0].values;
  assert.ok(Array.isArray(first.owners));
  assert.ok(first.owners.every((id) => SEED_USERS.some((u) => u.id === id)));
  // commit builds records over the whole set
  let n = 0;
  const recs = buildImportRecords(res.rows, {
    uid: () => `sh-rt-${++n}`, stamp: 'T1', currentUserId: SEED_USERS[0].id, normalizeUrl,
  });
  assert.equal(recs.length, SEED_STAKEHOLDERS.length);
  assert.ok(recs.every((r) => r.org && r.name));
});

await ok('a person exports as their display name and re-imports without aborting', () => {
  const person = SEED_STAKEHOLDERS.find((s) => s.firstName || s.lastName);
  if (!person) return; // seed always has persons, but stay honest
  const pos = weightedCoord(person.id, SEED_SCORES, SEED_TEAM);
  const csv = buildCsv([{ ...person, _x: pos.x, _y: pos.y, _status: statusFor(pos.x, pos.y) }], SEED_USERS);
  const parsed = parseCsv(csv);
  const res = validateRows(parsed.slice(1), autoMapHeaders(parsed[0]), CTX);
  assert.equal(res.errored, 0);
  assert.equal(res.rows[0].values.name, displayName(person) || person.name);
});

console.log(`\nimport-test: ${passed} assertions passed`);
