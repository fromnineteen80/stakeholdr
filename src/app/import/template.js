/* template.js — the Phase-18 DOWNLOADABLE IMPORT TEMPLATE, generated
 * client-side with ZERO dependencies (the guard forbids libraries).
 *
 * SEALED SPEC (Demo-features box ~3886–3892 + BUILD-MAP ~3911): a generated
 * XLSX — sheet 1 = the template headers with Excel DATA-VALIDATION DROPDOWNS
 * on every choice-limited column (Category, Type, Market, Region, Geography,
 * State, Site, Priority, Status, Issues, Tags, Owner — values from the LIVE
 * catalogs); CASCADING dependent validation (Type-by-Category,
 * Region-by-Market, Site-by-State); a HIDDEN LOOKUP SHEET holding the catalog
 * value lists and the parent→child ranges; computed columns carry the
 * "LEAVE BLANK — computed in the app" note in row 2; free-text columns carry
 * format hints (email, phone (xxx) xxx-xxxx).
 *
 * HOW (declared engineering): an .xlsx file IS a zip of XML parts. This
 * module hand-writes the minimal OOXML part set (content types, rels,
 * workbook with defined names, two worksheets with inline strings, minimal
 * styles) and packs it with a STORED (method 0, uncompressed) zip writer —
 * fully legal zip, byte-simple, CRC-verified, and round-trippable by the
 * Phase-18 reader (xlsx-read.js) in the node test suite.
 *
 * DECLARED MECHANICS (unsealed implementation choices, recorded 2026-07-05):
 *  · Dependent dropdowns use the industry-standard defined-name + INDIRECT
 *    technique: each parent value gets a named child range (Cat_*, Mkt_*,
 *    St_*) on the hidden Lookups sheet; the child column's validation
 *    formula is IF($P3="", BlankOne, INDIRECT("Cat_" & SUBSTITUTE-chain))
 *    — the SUBSTITUTE chain maps, 1:1 per character, exactly the special
 *    characters present in the live parent values, and the defined names are
 *    sanitized with the SAME per-character map, so the runtime string and
 *    the defined name can never diverge. A live catalog value whose
 *    sanitized name collides with another gets a numeric suffix — its
 *    dependent dropdown degrades for that value only (declared edge).
 *  · Site-by-State: EVERY state gets its own St_* named range on the Lookups
 *    sheet (empty for states with no operating site — an empty dropdown,
 *    "no sites in that state"); BlankOne is only the NO-PARENT fallback in
 *    the Type/Region IF()s (a blank State falls back to SiteListAll, the
 *    full site list, instead).
 *  · MULTI-VALUE columns (Issues/Tags/Owner — sealed "; " delimiter): Excel
 *    data validation cannot multi-select, so their dropdowns are ADVISORY
 *    (showErrorMessage=0): the dropdown offers the catalog vocabulary, and
 *    hand-typed "A; B" entries are allowed — the import VALIDATE step (not
 *    the sheet) enforces each value against its catalog. Single-value
 *    choice columns stay STRICT (showErrorMessage=1).
 *  · 1,000 data rows (3–1002) carry validation — a generous template ceiling,
 *    not an import limit (the importer reads any row count).
 *  · A CSV twin (buildTemplateCsv) ships beside the XLSX for spreadsheet-less
 *    flows, with the honest note that dropdown enforcement needs the XLSX.
 */
import {
  IMPORT_TARGETS, COMPUTED_HEADERS, FORMAT_HINTS, LEAVE_BLANK_NOTE, CHOICE_HINT,
} from './import-logic.js';
/* Phase 19 refactor (replace-don't-duplicate): the zip writer + CRC + XML
 * escape moved verbatim to the shared packing core so the plan Word export
 * (src/app/export/docx.js) packs through the SAME machinery. Re-exported
 * here so this module's Phase-18 contract (node suite included) holds. */
import { crc32, zipStore, xmlEscape } from '../export/zip.js';

export { crc32, zipStore, xmlEscape };

/* ── spreadsheet helpers ─────────────────────────────────────────────────── */

/* colLetter(1) → "A", colLetter(27) → "AA". */
export function colLetter(n) {
  let s = '';
  while (n > 0) {
    const r = (n - 1) % 26;
    s = String.fromCharCode(65 + r) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

const cellStr = (col, row, text) =>
  `<c r="${colLetter(col)}${row}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(text)}</t></is></c>`;

/* Per-character sanitizer — MUST stay 1:1 with the SUBSTITUTE chain (each
 * disallowed character becomes ONE underscore; no run-collapsing). */
export function sanitizeNameToken(value) {
  return String(value ?? '').replace(/[^A-Za-z0-9]/g, '_');
}

/* The special characters actually present in the parent values → the
 * SUBSTITUTE chain that reproduces sanitizeNameToken at Excel runtime. */
export function substituteChain(cellRef, parentValues) {
  const specials = [...new Set(
    (parentValues || []).flatMap((v) => String(v).split(''))
      .filter((ch) => !/[A-Za-z0-9]/.test(ch)),
  )];
  let expr = cellRef;
  for (const ch of specials) {
    expr = `SUBSTITUTE(${expr},"${ch === '"' ? '""' : ch}","_")`;
  }
  return expr;
}

/* ── the template workbook ───────────────────────────────────────────────── */

export const TEMPLATE_HEADERS = [
  ...IMPORT_TARGETS.map((t) => t.label),
  ...COMPUTED_HEADERS.slice(0, 4).map((t) => t.label), // x, y, Relationship, Community investment
];

const DATA_FIRST_ROW = 3;      // row 1 = headers, row 2 = hints
const DATA_LAST_ROW = 1002;    // 1,000 validated rows

/* buildTemplateXlsx(ctx) → Uint8Array (the .xlsx bytes). ctx = the LIVE
 * catalogs: { categories, markets, geographies, usStates, sites, siteLabel,
 * issues, tags, users, priorities, statuses }. */
export function buildTemplateXlsx(ctx) {
  const cats = ctx.categories || {};
  const mkts = ctx.markets || {};
  const geos = ctx.geographies || [];
  const states = ctx.usStates || [];
  const sites = ctx.sites || [];
  const labelOf = ctx.siteLabel || ((s) => (s ? s.city || s.id : ''));
  const issues = ctx.issues || [];
  const tags = ctx.tags || [];
  const owners = (ctx.users || [])
    .filter((u) => u.role !== 'system')
    .map((u) => u.name);
  const priorities = ctx.priorities || ['High', 'Medium', 'Low'];
  const statuses = ctx.statuses || ['Active', 'Watch', 'Dormant'];

  /* Lookups sheet: one column per list; defined names over rows 2..n+1. */
  const lookupCols = [];   // { header, values, name? }
  const definedNames = []; // { name, range }
  const usedNames = new Set();
  const addCol = (header, values, name) => {
    const col = lookupCols.length + 1;
    lookupCols.push({ header, values });
    if (name) {
      let final = name;
      let i = 2;
      while (usedNames.has(final)) final = `${name}_${i++}`;
      usedNames.add(final);
      const last = Math.max(values.length + 1, 2); // ≥1 cell even when empty
      definedNames.push({
        name: final,
        range: `Lookups!$${colLetter(col)}$2:$${colLetter(col)}$${last}`,
      });
    }
    return col;
  };

  addCol('Categories', Object.keys(cats), 'CatList');
  for (const c of Object.keys(cats)) addCol(`Types: ${c}`, cats[c] || [], `Cat_${sanitizeNameToken(c)}`);
  addCol('Markets', Object.keys(mkts), 'MktList');
  for (const m of Object.keys(mkts)) addCol(`Regions: ${m}`, mkts[m] || [], `Mkt_${sanitizeNameToken(m)}`);
  addCol('Geographies', geos, 'GeoList');
  addCol('States', states, 'StateList');
  const siteLabels = sites.map(labelOf);
  addCol('Sites (all)', siteLabels, 'SiteListAll');
  for (const st of states) {
    const inState = sites.filter((s) => s.state === st).map(labelOf);
    // Every state gets a named range so INDIRECT always resolves; empty
    // states point at their own empty column (declared: "no sites here").
    addCol(`Sites: ${st}`, inState, `St_${sanitizeNameToken(st)}`);
  }
  addCol('Priorities', priorities, 'PriList');
  addCol('Statuses', statuses, 'StatusList');
  addCol('Issues', issues, 'IssueList');
  addCol('Tags', tags, 'TagList');
  addCol('Owners', owners, 'OwnerList');
  addCol('(blank)', [], 'BlankOne'); // the dependent-dropdown empty fallback

  /* Template sheet (sheet1): headers + hints + validations. */
  const headers = TEMPLATE_HEADERS;
  const colOf = (key) => {
    const i = IMPORT_TARGETS.findIndex((t) => t.key === key);
    return i >= 0 ? i + 1 : -1;
  };
  const hintFor = (i) => {
    if (i < IMPORT_TARGETS.length) {
      const t = IMPORT_TARGETS[i];
      if (t.kind === 'choice') return CHOICE_HINT;
      return FORMAT_HINTS[t.key] || '';
    }
    return LEAVE_BLANK_NOTE; // the computed four
  };

  const headRow = `<row r="1">${headers.map((h, i) => cellStr(i + 1, 1, h)).join('')}</row>`;
  const hintRow = `<row r="2">${headers.map((_, i) => {
    const h = hintFor(i);
    return h ? cellStr(i + 1, 2, h) : '';
  }).join('')}</row>`;

  const sq = (key) => {
    const c = colLetter(colOf(key));
    return `${c}${DATA_FIRST_ROW}:${c}${DATA_LAST_ROW}`;
  };
  const rel = (key) => `$${colLetter(colOf(key))}${DATA_FIRST_ROW}`; // e.g. $C3

  const dv = (key, formula, strict = true) =>
    `<dataValidation type="list" allowBlank="1" showInputMessage="1" ` +
    `showErrorMessage="${strict ? 1 : 0}" sqref="${sq(key)}">` +
    `<formula1>${xmlEscape(formula)}</formula1></dataValidation>`;

  const validations = [
    dv('category', 'CatList'),
    dv('type',
      `IF(${rel('category')}="",BlankOne,INDIRECT("Cat_"&${substituteChain(rel('category'), Object.keys(cats))}))`),
    dv('market', 'MktList'),
    dv('region',
      `IF(${rel('market')}="",BlankOne,INDIRECT("Mkt_"&${substituteChain(rel('market'), Object.keys(mkts))}))`),
    dv('geography', 'GeoList'),
    dv('state', 'StateList'),
    dv('site',
      `IF(${rel('state')}="",SiteListAll,INDIRECT("St_"&${substituteChain(rel('state'), states)}))`),
    dv('priority', 'PriList'),
    dv('status', 'StatusList'),
    dv('issues', 'IssueList', false),  // advisory: multi-value "; "
    dv('tags', 'TagList', false),      // advisory: multi-value "; "
    dv('owners', 'OwnerList', false),  // advisory: multi-value "; "
  ].join('');

  const sheet1 =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<cols><col min="1" max="${headers.length}" width="18" customWidth="1"/></cols>` +
    `<sheetData>${headRow}${hintRow}</sheetData>` +
    `<dataValidations count="12">${validations}</dataValidations>` +
    `</worksheet>`;

  const maxRows = Math.max(1, ...lookupCols.map((c) => c.values.length + 1));
  let lookupRows = '';
  for (let r = 1; r <= maxRows; r++) {
    let cells = '';
    lookupCols.forEach((c, i) => {
      const v = r === 1 ? c.header : (c.values[r - 2] ?? null);
      if (v !== null && v !== undefined) cells += cellStr(i + 1, r, v);
    });
    if (cells) lookupRows += `<row r="${r}">${cells}</row>`;
  }
  const sheet2 =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<sheetData>${lookupRows}</sheetData></worksheet>`;

  const workbook =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" ` +
    `xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">` +
    `<sheets>` +
    `<sheet name="Template" sheetId="1" r:id="rId1"/>` +
    `<sheet name="Lookups" sheetId="2" state="hidden" r:id="rId2"/>` +
    `</sheets>` +
    `<definedNames>${definedNames.map((d) =>
      `<definedName name="${xmlEscape(d.name)}">${xmlEscape(d.range)}</definedName>`).join('')}</definedNames>` +
    `</workbook>`;

  const contentTypes =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>` +
    `<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>` +
    `</Types>`;

  const rootRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>` +
    `</Relationships>`;

  const workbookRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>` +
    `<Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet2.xml"/>` +
    `<Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>` +
    `</Relationships>`;

  const styles =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">` +
    `<fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>` +
    `<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>` +
    `<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>` +
    `<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>` +
    `<cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>` +
    `<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>` +
    `</styleSheet>`;

  const enc = new TextEncoder();
  return zipStore([
    { name: '[Content_Types].xml', data: enc.encode(contentTypes) },
    { name: '_rels/.rels', data: enc.encode(rootRels) },
    { name: 'xl/workbook.xml', data: enc.encode(workbook) },
    { name: 'xl/_rels/workbook.xml.rels', data: enc.encode(workbookRels) },
    { name: 'xl/styles.xml', data: enc.encode(styles) },
    { name: 'xl/worksheets/sheet1.xml', data: enc.encode(sheet1) },
    { name: 'xl/worksheets/sheet2.xml', data: enc.encode(sheet2) },
  ]);
}

/* buildTemplateCsv() — the CSV twin: the same 24 headers + the row-2 hints
 * (sealed CSV escaping: wrap on quote/comma/newline, quotes doubled). Honest
 * note: dropdown/cascade ENFORCEMENT needs the XLSX; the CSV twin relies on
 * the import VALIDATE step alone. */
export function buildTemplateCsv() {
  const esc = (v) => {
    const s = String(v ?? '');
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  const hints = TEMPLATE_HEADERS.map((_, i) => {
    if (i < IMPORT_TARGETS.length) {
      const t = IMPORT_TARGETS[i];
      if (t.kind === 'choice') return CHOICE_HINT;
      return FORMAT_HINTS[t.key] || '';
    }
    return LEAVE_BLANK_NOTE;
  });
  return [
    TEMPLATE_HEADERS.map(esc).join(','),
    hints.map(esc).join(','),
  ].join('\n');
}

export const TEMPLATE_XLSX_FILENAME = 'stakeholdr-import-template.xlsx';
export const TEMPLATE_CSV_FILENAME = 'stakeholdr-import-template.csv';
