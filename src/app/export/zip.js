/* zip.js — the ONE byte-level OOXML packing core (Phase 19 refactor,
 * replace-don't-duplicate): the Phase-18 template generator
 * (src/app/import/template.js) and the Phase-19 plan Word export
 * (src/app/export/docx.js) both pack their XML part sets through THIS
 * module. The mechanics are the Phase-18 originals, moved verbatim —
 * a STORED (method 0, uncompressed) zip writer: fully legal zip,
 * byte-simple, CRC-verified, and round-trippable by the Phase-18 reader
 * (src/app/import/xlsx-read.js) in the node suites. Zero dependencies
 * (the guard forbids libraries).
 */

/* ── tiny zip writer (STORE only) ────────────────────────────────────────── */

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();

export function crc32(bytes) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) {
    c = CRC_TABLE[(c ^ bytes[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

/* zipStore(entries: [{ name, data: Uint8Array }]) → Uint8Array — a legal zip
 * archive with method 0 (stored) entries; fixed DOS timestamp; UTF-8 names. */
export function zipStore(entries) {
  const enc = new TextEncoder();
  const chunks = [];
  const central = [];
  let offset = 0;
  const DOS_TIME = 0x6000; // 12:00:00
  const DOS_DATE = ((2026 - 1980) << 9) | (7 << 5) | 5; // 2026-07-05

  const u16 = (v) => new Uint8Array([v & 0xFF, (v >>> 8) & 0xFF]);
  const u32 = (v) => new Uint8Array([v & 0xFF, (v >>> 8) & 0xFF, (v >>> 16) & 0xFF, (v >>> 24) & 0xFF]);

  for (const { name, data } of entries) {
    const nameBytes = enc.encode(name);
    const crc = crc32(data);
    const local = [
      u32(0x04034B50), u16(20), u16(0x0800), u16(0), u16(DOS_TIME), u16(DOS_DATE),
      u32(crc), u32(data.length), u32(data.length),
      u16(nameBytes.length), u16(0),
    ];
    central.push({ nameBytes, crc, size: data.length, offset });
    for (const part of local) chunks.push(part);
    chunks.push(nameBytes, data);
    offset += local.reduce((s, p) => s + p.length, 0) + nameBytes.length + data.length;
  }

  const cdStart = offset;
  let cdSize = 0;
  for (const e of central) {
    const rec = [
      u32(0x02014B50), u16(20), u16(20), u16(0x0800), u16(0),
      u16(DOS_TIME), u16(DOS_DATE),
      u32(e.crc), u32(e.size), u32(e.size),
      u16(e.nameBytes.length), u16(0), u16(0), u16(0), u16(0),
      u32(0), u32(e.offset),
    ];
    for (const part of rec) { chunks.push(part); cdSize += part.length; }
    chunks.push(e.nameBytes); cdSize += e.nameBytes.length;
  }
  const eocd = [
    u32(0x06054B50), u16(0), u16(0),
    u16(central.length), u16(central.length),
    u32(cdSize), u32(cdStart), u16(0),
  ];
  for (const part of eocd) chunks.push(part);

  const total = chunks.reduce((s, c) => s + c.length, 0);
  const out = new Uint8Array(total);
  let pos = 0;
  for (const c of chunks) { out.set(c, pos); pos += c.length; }
  return out;
}

/* ── shared XML helper ───────────────────────────────────────────────────── */

export function xmlEscape(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
