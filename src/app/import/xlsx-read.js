/* xlsx-read.js — the Phase-18 MINIMAL, DEPENDENCY-FREE .xlsx reader for the
 * import wizard's upload step (the guard forbids libraries).
 *
 * DECLARED SCOPE (recorded 2026-07-05): reads the FIRST worksheet of a
 * standard .xlsx — zip entries stored (method 0, our own template) or
 * DEFLATED (method 8, what Excel/Sheets write), inflated via the platform
 * DecompressionStream('deflate-raw') (Chromium-class browsers + Node 18+;
 * the app's supported engine set). Shared strings, inline strings, plain
 * string/number cells and formula results are read; dates arrive as Excel
 * serials and are normalized by import-logic's parseDateCell. Styles,
 * merged cells, and rich text beyond concatenated runs are out of scope —
 * the import reads VALUES only.
 *
 * Returns rows as arrays (strings/numbers) in sheet order, aligned by the
 * cell reference (missing cells = ''), exactly the shape parseCsv yields —
 * one downstream pipeline for both file kinds.
 */

/* ── tiny zip reader ─────────────────────────────────────────────────────── */

function u16(view, off) { return view.getUint16(off, true); }
function u32(view, off) { return view.getUint32(off, true); }

/* listZipEntries(bytes) → [{ name, method, compSize, dataStart }] */
export function listZipEntries(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  // EOCD: scan back for PK\x05\x06 (max comment 64k)
  let eocd = -1;
  const min = Math.max(0, bytes.length - 65557);
  for (let i = bytes.length - 22; i >= min; i--) {
    if (u32(view, i) === 0x06054B50) { eocd = i; break; }
  }
  if (eocd < 0) throw new Error('Not a zip archive (no end record)');
  const count = u16(view, eocd + 10);
  let off = u32(view, eocd + 16);
  const dec = new TextDecoder();
  const entries = [];
  for (let n = 0; n < count; n++) {
    if (u32(view, off) !== 0x02014B50) throw new Error('Bad zip central record');
    const method = u16(view, off + 10);
    const compSize = u32(view, off + 20);
    const nameLen = u16(view, off + 28);
    const extraLen = u16(view, off + 30);
    const commentLen = u16(view, off + 32);
    const localOff = u32(view, off + 42);
    const name = dec.decode(bytes.subarray(off + 46, off + 46 + nameLen));
    // local header: name/extra lengths may differ from central — read them
    const lNameLen = u16(view, localOff + 26);
    const lExtraLen = u16(view, localOff + 28);
    const dataStart = localOff + 30 + lNameLen + lExtraLen;
    entries.push({ name, method, compSize, dataStart });
    off += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

async function inflateRaw(bytes) {
  const ds = new DecompressionStream('deflate-raw');
  const stream = new Blob([bytes]).stream().pipeThrough(ds);
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

/* readZipEntry(bytes, entry) → Uint8Array (stored or deflated). */
export async function readZipEntry(bytes, entry) {
  const data = bytes.subarray(entry.dataStart, entry.dataStart + entry.compSize);
  if (entry.method === 0) return data;
  if (entry.method === 8) return inflateRaw(data);
  throw new Error(`Unsupported zip method ${entry.method}`);
}

/* ── minimal spreadsheet XML extraction ──────────────────────────────────── */

export function xmlUnescape(s) {
  return String(s ?? '')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

/* All <t> runs inside a block, concatenated (rich-text runs flatten). */
function textRuns(block) {
  let out = '';
  const re = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>|<t(?:\s[^>]*)?\/>/g;
  let m;
  while ((m = re.exec(block))) out += xmlUnescape(m[1] ?? '');
  return out;
}

export function parseSharedStrings(xml) {
  const out = [];
  const re = /<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/g;
  let m;
  while ((m = re.exec(String(xml || '')))) out.push(textRuns(m[1]));
  return out;
}

/* colIndexFromRef("BC12") → 0-based column index (54). */
export function colIndexFromRef(ref) {
  const letters = String(ref || '').match(/^[A-Z]+/i);
  if (!letters) return 0;
  let n = 0;
  for (const ch of letters[0].toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

/* parseSheetRows(sheetXml, shared) → array of row arrays (strings/numbers).
 * Cell types: s (shared string), inlineStr, str (formula string), b
 * (boolean), n/absent (number — numerics stay numbers so date serials
 * survive to parseDateCell). */
export function parseSheetRows(sheetXml, shared) {
  const rows = [];
  const rowRe = /<row(?:\s[^>]*)?>([\s\S]*?)<\/row>/g;
  const cellRe = /<c(\s[^>]*)?(?:\/>|>([\s\S]*?)<\/c>)/g;
  let rm;
  while ((rm = rowRe.exec(String(sheetXml || '')))) {
    const cells = [];
    let cm;
    let autoCol = 0;
    while ((cm = cellRe.exec(rm[1]))) {
      const attrs = cm[1] || '';
      const inner = cm[2] || '';
      const refM = attrs.match(/\br="([A-Z]+\d+)"/i);
      const col = refM ? colIndexFromRef(refM[1]) : autoCol;
      autoCol = col + 1;
      const typeM = attrs.match(/\bt="([^"]+)"/);
      const t = typeM ? typeM[1] : 'n';
      let value = '';
      if (t === 'inlineStr') {
        value = textRuns(inner);
      } else {
        const vM = inner.match(/<v(?:\s[^>]*)?>([\s\S]*?)<\/v>/);
        const raw = vM ? xmlUnescape(vM[1]) : '';
        if (t === 's') value = shared[Number(raw)] ?? '';
        else if (t === 'str') value = raw;
        else if (t === 'b') value = raw === '1' ? 'TRUE' : 'FALSE';
        else if (raw === '') value = '';
        else value = Number(raw); // numbers stay numeric (date serials)
      }
      while (cells.length < col) cells.push('');
      cells[col] = value;
    }
    rows.push(cells);
  }
  return rows;
}

/* ── the one public entry ────────────────────────────────────────────────── */

/* readXlsxRows(arrayBufferOrBytes) → Promise<rows[][]> — the FIRST sheet in
 * workbook order, resolved through workbook.xml.rels (falls back to
 * xl/worksheets/sheet1.xml when rels are absent). */
export async function readXlsxRows(input) {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  const entries = listZipEntries(bytes);
  const byName = (n) => entries.find((e) => e.name === n);
  const dec = new TextDecoder();
  const text = async (e) => dec.decode(await readZipEntry(bytes, e));

  let sheetPath = 'xl/worksheets/sheet1.xml';
  const wbEntry = byName('xl/workbook.xml');
  const relsEntry = byName('xl/_rels/workbook.xml.rels');
  if (wbEntry && relsEntry) {
    const wb = await text(wbEntry);
    const rels = await text(relsEntry);
    const sheetM = wb.match(/<sheet\s[^>]*r:id="(rId\d+)"[^>]*\/>|<sheet\s[^>]*r:id="(rId\d+)"[^>]*>/);
    const rid = sheetM ? (sheetM[1] || sheetM[2]) : null;
    if (rid) {
      const relM = rels.match(new RegExp(`<Relationship\\s[^>]*Id="${rid}"[^>]*Target="([^"]+)"`));
      if (relM) {
        let target = relM[1];
        if (!target.startsWith('/')) target = 'xl/' + target.replace(/^\.\//, '');
        else target = target.slice(1);
        if (byName(target)) sheetPath = target;
      }
    }
  }

  const sheetEntry = byName(sheetPath);
  if (!sheetEntry) throw new Error('No worksheet found in this .xlsx');
  const ssEntry = byName('xl/sharedStrings.xml');
  const shared = ssEntry ? parseSharedStrings(await text(ssEntry)) : [];
  return parseSheetRows(await text(sheetEntry), shared);
}
