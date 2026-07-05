/* import-logic.js — the PURE core of the Phase-18 Excel/CSV import wizard
 * (FORWARD-DESIGN with a DETAILED sealed spec: the Demo-features box's
 * IMPORT/TEMPLATE/FLOW paragraphs in src/guide.jsx ~3885–3893 + the sealed
 * BUILD-MAP ~3905–3911; the authoritative column set is the sealed
 * Lists-table box). No DOM here — node-tested by scripts/import-test.mjs.
 *
 * THE SEALED FLOW this implements: upload → auto column-map (case-insensitive
 * header equality; unmapped → "Ignore this column") → VALIDATE (every
 * choice-limited value against its LIVE catalog through the Phase-11 company
 * seam; cascades Type∈Category, Region∈Market, Site∈State; dates parse;
 * COMPUTED columns silently IGNORED so a re-imported export never aborts) →
 * PREVIEW (invalid rows flagged, "N rows ready · M rows with errors") →
 * COMMIT (mint uids + audit stamps; workspace auto-assign is the host's
 * createJoinFor seam). Invalid catalog values are rejected/flagged
 * pre-commit, NEVER silently coerced.
 *
 * DECLARED LEDGER (unsealed choices, recorded 2026-07-05):
 *  · TARGET SET — the sealed "26 Lists columns" are 4 frozen + 22 reorderable;
 *    idx (row number) and edit (icon cell) are UI-only cells with NO field, so
 *    the mappable/template set is the 24 DATA columns: Stakeholder +
 *    Organization + the 22 reorderable. Of those, x / y / Relationship /
 *    Community investment are COMPUTED (sealed: leave blank, ignored on
 *    import) — leaving 20 input-bearing targets.
 *  · HEADER ALIASES — auto-match is sealed as case-insensitive header
 *    EQUALITY; a small alias table extends it because the SEALED EXPORT
 *    itself requires it (exportCsv emits "Owners" where the Lists column
 *    label is "Owner"; "State" for "State/Prov."; audit headers). Equality
 *    against label, field key, or a declared alias — never fuzzy matching.
 *  · BLANKS — a blank choice-limited cell imports as EMPTY (the table renders
 *    "-"); the create-modal defaults are NOT invented into imported rows
 *    (sealed: never silently coerced).
 *  · REQUIRED — Organization is the one required cell (the sealed modal's
 *    shMissing law); a row missing it is invalid ("Missing Organization").
 *    A blank Stakeholder falls back to name = org (the sealed composeSubmit
 *    rule). Person-name splitting is NOT attempted — imported rows are
 *    org-shaped records (firstName/lastName empty).
 *  · MULTI-VALUE — Issues/Tags/Owners split on ";" (the sealed "; " export
 *    delimiter, whitespace-tolerant); each value validated against its live
 *    catalog; Owners resolve by exact user NAME (case-insensitive) or raw id.
 *  · DATES — accepted forms: YYYY-MM-DD (canonical), M/D/YYYY, and an Excel
 *    date serial (a number in the plausible 1990–2100 window, epoch
 *    1899-12-30 — .xlsx cells arrive as serials); anything else =
 *    "Unparseable date". Normalized to YYYY-MM-DD.
 *  · DUPLICATES — no dedup/merge in v1: import always creates new records
 *    (an unsealed merge policy must be ruled, not invented).
 *  · TEMPLATE HINT ROW — the downloadable template carries a row-2 hint line
 *    ("LEAVE BLANK — computed in the app" + format hints); rows matching it
 *    (or entirely empty rows) are skipped, never flagged as errors, so the
 *    template itself re-imports clean.
 */

/* ── CSV (the sealed escaping rules: wrap on quote/comma/newline, quotes
 *    doubled) — parser written here, no library (guard law). ─────────────── */

/* parseCsv(text) → array of rows (arrays of strings). Handles quoted fields,
 * doubled quotes, commas/newlines inside quotes, CRLF/CR/LF, a UTF-8 BOM,
 * and a trailing newline (no phantom empty row). */
export function parseCsv(text) {
  let s = String(text ?? '');
  if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1); // strip BOM
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const pushField = () => { row.push(field); field = ''; };
  const pushRow = () => { pushField(); rows.push(row); row = []; };
  while (i < s.length) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i += 2; continue; } // doubled quote
        inQuotes = false; i += 1; continue;
      }
      field += c; i += 1; continue;
    }
    if (c === '"') { inQuotes = true; i += 1; continue; }
    if (c === ',') { pushField(); i += 1; continue; }
    if (c === '\r') { pushRow(); i += s[i + 1] === '\n' ? 2 : 1; continue; }
    if (c === '\n') { pushRow(); i += 1; continue; }
    field += c; i += 1;
  }
  // final field/row (unless the text ended exactly on a row break)
  if (field !== '' || row.length) pushRow();
  return rows;
}

/* ── TARGETS (the sealed 24 data columns; see the ledger above) ──────────── */

export const IGNORE = '__ignore__';     // "Ignore this column"
export const COMPUTED = '__computed__'; // computed/audit — silently skipped

/* The 20 input-bearing targets, template order (frozen pair first, then the
 * sealed reorderable order minus the computed four). kind drives validation. */
export const IMPORT_TARGETS = [
  { key: 'name',        label: 'Stakeholder',  kind: 'text' },
  { key: 'org',         label: 'Organization', kind: 'text' },
  { key: 'category',    label: 'Category',     kind: 'choice' },
  { key: 'type',        label: 'Type',         kind: 'choice' },
  { key: 'market',      label: 'Market',       kind: 'choice' },
  { key: 'region',      label: 'Region',       kind: 'choice' },
  { key: 'geography',   label: 'Geography',    kind: 'choice' },
  { key: 'state',       label: 'State/Prov.',  kind: 'choice', aliases: ['State'] },
  { key: 'site',        label: 'Sites',        kind: 'choice', aliases: ['Site'] },
  { key: 'issues',      label: 'Issues',       kind: 'multi' },
  { key: 'priority',    label: 'Priority',     kind: 'choice' },
  { key: 'tags',        label: 'Tags',         kind: 'multi' },
  { key: 'owners',      label: 'Owner',        kind: 'multi', aliases: ['Owners'] },
  { key: 'email',       label: 'Email',        kind: 'text' },
  { key: 'phone',       label: 'Phone',        kind: 'text' },
  { key: 'xAccount',    label: 'X account',    kind: 'text' },
  { key: 'lastContact', label: 'Last contact', kind: 'date' },
  { key: 'status',      label: 'Status',       kind: 'choice' },
  { key: 'notes',       label: 'Notes',        kind: 'text' },
  { key: 'url',         label: 'Website',      kind: 'text', aliases: ['URL'] },
];

/* The computed/audit headers (sealed: "COMPUTED columns (x/y/Relationship/
 * Community/audit) silently IGNORED — a re-imported export must never
 * abort"). Recognized so auto-map can label them honestly in step 2. */
export const COMPUTED_HEADERS = [
  { key: '_x',        label: 'x' },
  { key: '_y',        label: 'y' },
  { key: '_status',   label: 'Relationship' },
  { key: 'community', label: 'Community investment', aliases: ['Community'] },
  { key: 'createdAt', label: 'Date added',   aliases: ['Created', 'createdAt'] },
  { key: 'updatedAt', label: 'Last updated', aliases: ['Updated', 'updatedAt'] },
];

const norm = (s) => String(s ?? '').trim().toLowerCase();

function matchesTarget(header, target) {
  const h = norm(header);
  if (!h) return false;
  if (h === norm(target.label) || h === norm(target.key)) return true;
  return (target.aliases || []).some((a) => norm(a) === h);
}

/* autoMapHeaders(headers) → [{ header, index, target, auto }] — the sealed
 * auto-map: case-insensitive header equality (plus the declared aliases);
 * computed headers → COMPUTED; unmapped → IGNORE ("Ignore this column").
 * A target already claimed by an earlier header is not claimed twice. */
export function autoMapHeaders(headers) {
  const claimed = new Set();
  return (headers || []).map((header, index) => {
    const computed = COMPUTED_HEADERS.find((t) => matchesTarget(header, t));
    if (computed) return { header, index, target: COMPUTED, auto: true };
    const t = IMPORT_TARGETS.find(
      (tt) => !claimed.has(tt.key) && matchesTarget(header, tt),
    );
    if (t) { claimed.add(t.key); return { header, index, target: t.key, auto: true }; }
    return { header, index, target: IGNORE, auto: false };
  });
}

/* ── VALUE HELPERS ───────────────────────────────────────────────────────── */

/* splitMulti — the sealed "; " delimiter (whitespace-tolerant, empties out). */
export function splitMulti(v) {
  return String(v ?? '').split(';').map((s) => s.trim()).filter(Boolean);
}

/* Excel serial → YYYY-MM-DD (epoch 1899-12-30; plausible window ~1990–2100
 * so stray numerics don't masquerade as dates). */
const SERIAL_MIN = 32874;  // 1990-01-01
const SERIAL_MAX = 73415;  // 2100-12-31
export function serialToYMD(n) {
  const ms = Math.round((Number(n) - 25569) * 86400 * 1000); // 25569 = 1970-01-01
  const d = new Date(ms);
  const p = (x) => String(x).padStart(2, '0');
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`;
}

/* parseDateCell(v) → '' (blank) | 'YYYY-MM-DD' | null (unparseable). */
export function parseDateCell(v) {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'number') {
    if (v >= SERIAL_MIN && v <= SERIAL_MAX && Number.isFinite(v)) return serialToYMD(v);
    return null;
  }
  const s = String(v).trim();
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(s + 'T00:00:00');
    return isNaN(d.getTime()) ? null : s;
  }
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); // M/D/YYYY
  if (m) {
    const [, mo, da, yr] = m;
    const d = new Date(Number(yr), Number(mo) - 1, Number(da));
    if (d.getFullYear() === Number(yr) && d.getMonth() === Number(mo) - 1 &&
        d.getDate() === Number(da)) {
      const p = (x) => String(x).padStart(2, '0');
      return `${yr}-${p(mo)}-${p(da)}`;
    }
  }
  if (/^\d+(\.\d+)?$/.test(s)) { // a serial that arrived as text
    const n = Number(s);
    if (n >= SERIAL_MIN && n <= SERIAL_MAX) return serialToYMD(n);
  }
  return null;
}

/* The template's row-2 hint strings (single-sourced: template.js reads these). */
export const LEAVE_BLANK_NOTE = 'LEAVE BLANK — computed in the app';
export const CHOICE_HINT = 'Pick from the dropdown';
export const FORMAT_HINTS = {
  name: 'e.g. Sen. Jane Doe',
  org: 'Required',
  email: 'name@example.com',
  phone: '(xxx) xxx-xxxx',
  xAccount: '@handle',
  lastContact: 'YYYY-MM-DD',
  notes: 'Free text',
  url: 'https://example.com',
  issues: 'Value; Value (from the Issues catalog)',
  tags: 'Value; Value (from the Tags catalog)',
  owners: 'Name; Name (team members)',
};

/* isHintRow — the template's row 2 (hints + LEAVE BLANK notes) re-imports
 * silently: every non-empty cell is a known hint/note string. */
export function isHintRow(cells) {
  const nonEmpty = (cells || []).map((c) => String(c ?? '').trim()).filter(Boolean);
  if (!nonEmpty.length) return false; // an empty row is handled separately
  const known = new Set([LEAVE_BLANK_NOTE, CHOICE_HINT, ...Object.values(FORMAT_HINTS)]);
  return nonEmpty.every((c) => known.has(c));
}

export function isEmptyRow(cells) {
  return (cells || []).every((c) => String(c ?? '').trim() === '');
}

/* ── VALIDATION (sealed: every choice-limited value against its LIVE catalog;
 *    cascades; dates parse; never coerced) ───────────────────────────────── */

/* validateRows(dataRows, mapping, ctx) → { rows, ready, errored, skipped }
 *   dataRows — arrays of raw cells (strings/numbers), header row excluded
 *   mapping  — autoMapHeaders() output (user-adjusted)
 *   ctx      — the LIVE catalogs (Phase-11 company seam) + fixed enums:
 *              { categories, markets, geographies, usStates, sites, siteLabel,
 *                issues, tags, users, priorities, statuses }
 * Each result row: { line, values, errors: [{ field, message }] }.
 * Sealed error copy: "Unknown <Column> value", "Type does not belong to
 * chosen Category", "Region does not belong to chosen Market", "Site does
 * not belong to chosen State", "Unparseable date", "Missing Organization". */
export function validateRows(dataRows, mapping, ctx) {
  const cats = ctx.categories || {};
  const mkts = ctx.markets || {};
  const geos = ctx.geographies || [];
  const states = ctx.usStates || [];
  const sites = ctx.sites || [];
  const labelOf = ctx.siteLabel || ((s) => (s ? s.city || s.id : ''));
  const issues = ctx.issues || [];
  const tags = ctx.tags || [];
  const users = ctx.users || [];
  const priorities = ctx.priorities || ['High', 'Medium', 'Low'];
  const statuses = ctx.statuses || ['Active', 'Watch', 'Dormant'];

  const ciIncludes = (list, v) => list.some((x) => norm(x) === norm(v));
  const ciFind = (list, v) => list.find((x) => norm(x) === norm(v));

  const active = (mapping || []).filter(
    (m) => m.target !== IGNORE && m.target !== COMPUTED,
  );

  const rows = [];
  let skipped = 0;
  (dataRows || []).forEach((cells, i) => {
    if (isEmptyRow(cells) || isHintRow(cells)) { skipped += 1; return; }
    const line = i + 2; // 1-based file line (row 1 = headers)
    const values = {};
    const errors = [];
    const err = (field, message) => errors.push({ field, message });

    for (const m of active) {
      const raw = cells[m.index];
      const str = typeof raw === 'string' ? raw.trim() : raw;
      switch (m.target) {
        case 'name': case 'org': case 'email': case 'phone':
        case 'xAccount': case 'notes': case 'url':
          values[m.target] = String(str ?? '');
          break;
        case 'category': {
          const v = String(str ?? '');
          if (!v) { values.category = ''; break; }
          const hit = ciFind(Object.keys(cats), v);
          if (!hit) err('Category', 'Unknown Category value');
          else values.category = hit;
          break;
        }
        case 'type': values.type = String(str ?? ''); break;         // cascade below
        case 'market': {
          const v = String(str ?? '');
          if (!v) { values.market = ''; break; }
          const hit = ciFind(Object.keys(mkts), v);
          if (!hit) err('Market', 'Unknown Market value');
          else values.market = hit;
          break;
        }
        case 'region': values.region = String(str ?? ''); break;     // cascade below
        case 'geography': {
          const v = String(str ?? '');
          if (!v) { values.geography = ''; break; }
          const hit = ciFind(geos, v);
          if (!hit) err('Geography', 'Unknown Geography value');
          else values.geography = hit;
          break;
        }
        case 'state': {
          const v = String(str ?? '');
          if (!v) { values.state = ''; break; }
          const hit = ciFind(states, v);
          if (!hit) err('State/Prov.', 'Unknown State value');
          else values.state = hit;
          break;
        }
        case 'site': {
          const v = String(str ?? '');
          if (!v) { values.site = ''; break; }
          const rec = sites.find(
            (s) => norm(labelOf(s)) === norm(v) || norm(s.id) === norm(v),
          );
          if (!rec) err('Sites', 'Unknown Site value');
          else values.site = rec.id;
          break;
        }
        case 'issues': {
          const vals = splitMulti(str);
          const bad = vals.filter((v) => !ciIncludes(issues, v));
          if (bad.length) err('Issues', `Unknown Issue value ("${bad[0]}")`);
          values.issues = vals.map((v) => ciFind(issues, v) || v);
          break;
        }
        case 'tags': {
          const vals = splitMulti(str);
          const bad = vals.filter((v) => !ciIncludes(tags, v));
          if (bad.length) err('Tags', `Unknown Tag value ("${bad[0]}")`);
          values.tags = vals.map((v) => ciFind(tags, v) || v);
          break;
        }
        case 'owners': {
          const vals = splitMulti(str);
          const ids = [];
          for (const v of vals) {
            const u = users.find(
              (x) => norm(x.name) === norm(v) || norm(x.id) === norm(v),
            );
            if (!u) { err('Owner', `Unknown Owner ("${v}")`); continue; }
            if (!ids.includes(u.id)) ids.push(u.id);
          }
          values.owners = ids;
          break;
        }
        case 'priority': {
          const v = String(str ?? '');
          if (!v) { values.priority = ''; break; }
          const hit = ciFind(priorities, v);
          if (!hit) err('Priority', 'Unknown Priority value');
          else values.priority = hit;
          break;
        }
        case 'status': {
          const v = String(str ?? '');
          if (!v) { values.status = ''; break; }
          const hit = ciFind(statuses, v);
          if (!hit) err('Status', 'Unknown Status value');
          else values.status = hit;
          break;
        }
        case 'lastContact': {
          const d = parseDateCell(raw);
          if (d === null) err('Last contact', 'Unparseable date');
          else values.lastContact = d;
          break;
        }
        default: break;
      }
    }

    /* CASCADES (sealed): Type∈Category · Region∈Market · Site∈State. */
    if (values.type) {
      const typesFor = values.category ? (cats[values.category] || []) : null;
      if (!values.category) {
        // Type given with no (or invalid) Category: valid only if it exists
        // in ANY category — otherwise it is an unknown type outright.
        const all = Object.values(cats).flat();
        const hit = ciFind(all, values.type);
        if (!hit) err('Type', 'Unknown Type value');
        else values.type = hit;
      } else {
        const hit = ciFind(typesFor, values.type);
        if (!hit) err('Type', 'Type does not belong to chosen Category');
        else values.type = hit;
      }
    }
    if (values.region) {
      const regionsFor = values.market ? (mkts[values.market] || []) : null;
      if (!values.market) {
        const all = Object.values(mkts).flat();
        const hit = ciFind(all, values.region);
        if (!hit) err('Region', 'Unknown Region value');
        else values.region = hit;
      } else {
        const hit = ciFind(regionsFor, values.region);
        if (!hit) err('Region', 'Region does not belong to chosen Market');
        else values.region = hit;
      }
    }
    if (values.site) {
      const rec = sites.find((s) => s.id === values.site);
      if (rec && rec.state) {
        if (values.state && values.state !== rec.state) {
          err('Sites', 'Site does not belong to chosen State');
        } else if (!values.state) {
          values.state = rec.state; // the sealed in-app auto-fill cascade
        }
      }
    }

    /* REQUIRED (the sealed modal law): Organization. */
    if (!String(values.org ?? '').trim()) err('Organization', 'Missing Organization');

    rows.push({ line, values, errors });
  });

  const ready = rows.filter((r) => !r.errors.length).length;
  return { rows, ready, errored: rows.length - ready, skipped };
}

/* Sealed summary copy: "N rows ready · M rows with errors" (singularized per
 * the sealed count-copy rule). */
export function importSummary(ready, errored) {
  const noun = (n) => `${n} row${n === 1 ? '' : 's'}`;
  return `${noun(ready)} ready · ${noun(errored)} with errors`;
}

/* ── COMMIT BUILDERS (mint uids + audit stamps; ONE setState at the host) ── */

/* buildImportRecords(validRows, { uid, stamp, currentUserId, normalizeUrl })
 * → records ready to prepend. Sealed rules honored: name falls back to org
 * (composeSubmit); owners default to the importer (addStakeholder rule);
 * url normalized; createdBy/createdAt/updatedAt stamped. */
export function buildImportRecords(validRows, { uid, stamp, currentUserId, normalizeUrl }) {
  const cleanUrl = normalizeUrl || ((u) => u);
  return (validRows || []).map((r) => {
    const v = r.values || r; // accept validateRows rows or bare value objects
    const org = String(v.org ?? '').trim();
    return {
      id: uid('sh'),
      title: '', titleOther: '', firstName: '', lastName: '',
      isPerson: false, photo: null,
      name: String(v.name ?? '').trim() || org,
      org,
      category: v.category || '',
      type: v.type || '',
      market: v.market || '',
      region: v.region || '',
      geography: v.geography || '',
      state: v.state || '',
      site: v.site || '',
      issues: v.issues || [],
      priority: v.priority || '',
      tags: v.tags || [],
      owners: (v.owners && v.owners.length)
        ? v.owners
        : (currentUserId ? [currentUserId] : []),
      email: v.email || '',
      phone: v.phone || '',
      xAccount: v.xAccount || '',
      lastContact: v.lastContact || '',
      status: v.status || '',
      notes: v.notes || '',
      url: v.url ? cleanUrl(v.url) : '',
      createdBy: currentUserId || null,
      createdAt: stamp,
      updatedAt: stamp,
    };
  });
}

/* The one aggregate import system message (DECLARED: the per-record
 * scoring-needed post would spam c-system at import scale; ONE summary
 * message carries the same drive-to-Scoring signal). */
export function importedBody(count) {
  return `Imported ${count} stakeholder${count === 1 ? '' : 's'}. ` +
    'Please score them on the Scoring tab.';
}

/* Sealed success snackbar copy. */
export function importedSnack(count) {
  return `Imported ${count} stakeholder${count === 1 ? '' : 's'}`;
}
