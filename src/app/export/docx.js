/* docx.js — the PLAN → WORD EXPORT (Phase 19), built from the sealed boxes
 * "Plan page — plan elements" ("EXPORT / ARCHIVE — the completed plan exports
 * to a SINGLE Word file …; the element/section structure becomes the
 * document's outline") and "Demo features" (~3895: "EXPORT — plan → single
 * Word/PDF (FORWARD-DESIGN; contents specified in the Plan box)").
 *
 * THE DOCUMENT IS THE SEALED REVIEW, VERBATIM: title · meta line · summary ·
 * type-of-plan + status + owners · the plan-algorithm formula readout · then
 * the sealed read-only sections in their sealed order — Scenario & Context ·
 * Aligning With Organizational Goals · Stakeholders In This Plan (the BINDING
 * ELEMENT-6 ROW SCHEMA table: Stakeholder · Type · Relationship · Priority ·
 * Plan Fit · Reason + Move, Fit-ranked) · Cross-functional Team · Tactics ·
 * Issues · Community Investment · Measurement & Reporting — with every sealed
 * per-section empty string.
 *
 * HOW (declared engineering, mirroring the Phase-18 template): a .docx IS a
 * zip of XML parts. This module hand-writes the minimal WordprocessingML part
 * set — [Content_Types].xml · _rels/.rels · word/document.xml (headings,
 * paragraphs, one bordered table, all DIRECT-formatted so no styles part is
 * needed) — and packs it with the SHARED stored-zip writer (export/zip.js,
 * the Phase-18 core; replace-don't-duplicate). Zero dependencies.
 *
 * DECLARED (unsealed implementation choices, recorded 2026-07-14):
 *  · Reason + Move cell: the review shows the zone ACTION in a ui-tooltip on
 *    the "Move:" strategy text; paper has no hover, so the cell prints
 *    "Move: {strategy} — {action}" in full (lossless on paper).
 *  · Filename mirrors the sealed CSV expression (csvFilename): the plan
 *    title with every non-word/non-hyphen run replaced by "_", falling back
 *    to "plan", + ".docx".
 *  · Type sizes: title 20pt · section headings 13pt · body 10.5pt — the
 *    document's own print hierarchy (the app's token scale is a SCREEN
 *    contract; WordprocessingML carries no CSS custom properties).
 */
import { zipStore, xmlEscape } from './zip.js';
import {
  goalName, modelFormula, planMetaLine, reviewScenario,
} from '../pages/plan-logic.js';
import { communityEntryAmount } from '../modals/stakeholder-logic.js';
import { displayName } from '../../../design-system/components/stakeholder-table.js';

export const PLAN_DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

/* Sealed-pattern filename (the csvFilename expression, .docx). */
export function planDocxFilename(title) {
  return (String(title || '').trim() || 'plan').replace(/[^\w-]+/g, '_') + '.docx';
}

/* ── the document model (the sealed review, as data) ─────────────────────── */

/* buildPlanDocModel — maps the page's OWN review derivations into the
 * document outline. rows = the SHARED usePlanRows output (Fit-ranked by
 * comparePlanRows; each { s, zone, effective, fit, move, moveAction }). */
export function buildPlanDocModel({
  plan, rows = [], users = [], ws = null, site = null,
  companyGoals = [], community = [], sector, goal,
}) {
  const p = plan || {};
  const userName = (id) => (users.find((u) => u.id === id) || {}).name || null;
  const linked = (p.communityIds || [])
    .map((id) => community.find((c) => c.id === id))
    .filter(Boolean);
  const scenario = reviewScenario(p);

  return {
    title: p.title || 'Plan',
    metaLine: planMetaLine(p, ws, site),
    summary: String(p.summary || '').trim(),
    badgeLine: [
      `Type: ${goalName(p.goalModel)}`,
      `Status: ${p.status || 'Idea'}`,
      (p.owners || []).length
        ? `Owners: ${p.owners.map(userName).filter(Boolean).join(', ')}`
        : null,
    ].filter(Boolean).join(' · '),
    algoLines: (sector && goal)
      ? [
        `${sector.name}: ${modelFormula(sector)}`,
        `${goal.name}: ${modelFormula(goal)}`,
      ]
      : [],
    sections: [
      {
        title: 'Scenario & Context',
        kind: 'labeled',
        items: scenario.map(([label, text]) => ({ label, text })),
        empty: 'Not written yet.',
      },
      {
        title: 'Aligning With Organizational Goals',
        kind: 'labeled',
        items: companyGoals.map((g) => ({
          label: g,
          text: String((p.goalNotes || {})[g] || '').trim() || 'No approach described yet.',
        })),
        empty: 'No goals listed.',
      },
      {
        title: 'Stakeholders In This Plan',
        kind: 'table',
        headers: ['Stakeholder', 'Type', 'Relationship', 'Priority', 'Plan Fit', 'Reason + Move'],
        rows: rows.map((r) => [
          displayName(r.s) || r.s.name || '',
          r.s.type || '',
          r.zone || '',
          r.s.priority || '',
          r.effective || '',
          [r.fit?.reason,
           r.move
             ? `Move: ${r.move}${r.moveAction ? ` — ${r.moveAction}` : ''}`
             : null]
            .filter(Boolean),
        ]),
        empty: 'No stakeholders in this workspace.',
      },
      {
        title: 'Cross-functional Team',
        kind: 'list',
        items: (p.team || []).map((m) => {
          const u = users.find((x) => x.id === m.userId);
          const who = u ? u.name : m.userId;
          const role = m.role || (u ? u.title : '');
          return role ? `${who} — ${role}` : who;
        }),
        empty: 'No team assigned.',
      },
      {
        title: 'Tactics',
        kind: 'labeled',
        items: (p.strategies || []).map((st) => {
          const lead = users.find((u) => u.id === st.ownerId);
          const meta = [
            st.timing ? `Timing: ${st.timing}` : null,
            lead ? `Lead: ${lead.name}` : null,
          ].filter(Boolean).join(' · ');
          return {
            label: String(st.title || '').trim() || 'Untitled',
            text: [String(st.how || '').trim(), meta].filter(Boolean).join('\n'),
          };
        }),
        empty: 'No tactics yet.',
      },
      {
        title: 'Issues',
        kind: 'list',
        items: (p.issues || []).slice(),
        empty: 'None.',
      },
      {
        title: 'Community Investment',
        kind: 'list',
        items: linked.map((c) =>
          `${c.name} - ${c.kind} · ${c.stage} · ${communityEntryAmount(c)}`),
        empty: 'No community investments linked.',
      },
      {
        title: 'Measurement & Reporting',
        kind: 'prose',
        text: String(p.measurement || '').trim(),
        empty: 'Not written yet.',
      },
    ],
  };
}

/* ── WordprocessingML writers ────────────────────────────────────────────── */

const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

/* run — one formatted text run; newlines become explicit <w:br/>. sz is in
 * HALF-POINTS (WordprocessingML's own unit). */
function run(text, { b = false, i = false, sz = 21 } = {}) {
  const props =
    `<w:rPr>${b ? '<w:b/>' : ''}${i ? '<w:i/>' : ''}` +
    `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/></w:rPr>`;
  const parts = String(text ?? '').split('\n').map((line) =>
    `<w:t xml:space="preserve">${xmlEscape(line)}</w:t>`);
  return `<w:r>${props}${parts.join('<w:br/>')}</w:r>`;
}

/* para — a paragraph of runs with spacing (twentieths of a point). */
function para(runs, { before = 0, after = 120 } = {}) {
  return `<w:p><w:pPr><w:spacing w:before="${before}" w:after="${after}"/></w:pPr>${runs}</w:p>`;
}

const heading = (text) => para(run(text, { b: true, sz: 26 }), { before: 280, after: 100 });
const body = (text, opts = {}) => para(run(text, { sz: 21, ...opts }));

/* cellPara — a table-cell paragraph (tight spacing). */
const cellPara = (text, opts = {}) =>
  `<w:p><w:pPr><w:spacing w:before="0" w:after="40"/></w:pPr>${run(text, { sz: 19, ...opts })}</w:p>`;

function tableXml(headers, rows) {
  const borders =
    '<w:tblBorders>' +
    ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']
      .map((side) => `<w:${side} w:val="single" w:sz="4" w:space="0"/>`)
      .join('') +
    '</w:tblBorders>';
  /* w:tblGrid is REQUIRED by the schema (validated via python-docx): equal
   * columns over the printable width, the trailing Reason+Move column double. */
  const printable = 10080; // letter 12240 − 2×1080 margins (dxa)
  const unit = Math.floor(printable / (headers.length + 1));
  const grid =
    `<w:tblGrid>${headers.map((_, i) =>
      `<w:gridCol w:w="${i === headers.length - 1 ? unit * 2 : unit}"/>`).join('')}</w:tblGrid>`;
  const cell = (content) =>
    `<w:tc><w:tcPr><w:tcMar><w:top w:w="40" w:type="dxa"/><w:left w:w="80" w:type="dxa"/>` +
    `<w:bottom w:w="40" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tcMar></w:tcPr>${content}</w:tc>`;
  const headRow =
    `<w:tr>${headers.map((h) => cell(cellPara(h, { b: true }))).join('')}</w:tr>`;
  const bodyRows = rows.map((r) =>
    `<w:tr>${r.map((c) => {
      const lines = Array.isArray(c) ? c : [c];
      return cell(lines.map((l) => cellPara(l)).join('') || cellPara(''));
    }).join('')}</w:tr>`).join('');
  return (
    `<w:tbl><w:tblPr><w:tblW w:w="0" w:type="auto"/>${borders}</w:tblPr>${grid}` +
    `${headRow}${bodyRows}</w:tbl>` +
    /* Word requires a paragraph after a table before the next block. */
    para('', { after: 60 })
  );
}

/* buildPlanDocx(model) → Uint8Array — the .docx bytes. */
export function buildPlanDocx(model) {
  const blocks = [];
  blocks.push(para(run(model.title, { b: true, sz: 40 }), { after: 60 }));
  if (model.metaLine) blocks.push(body(model.metaLine, { i: true }));
  if (model.summary) blocks.push(body(model.summary));
  if (model.badgeLine) blocks.push(body(model.badgeLine));
  for (const line of model.algoLines || []) {
    blocks.push(para(run(`Plan algorithm — ${line}`, { sz: 18 }), { after: 40 }));
  }

  for (const sec of model.sections || []) {
    blocks.push(heading(sec.title));
    const has = sec.kind === 'prose' ? !!sec.text
      : sec.kind === 'table' ? sec.rows.length > 0
        : sec.items.length > 0;
    if (!has) {
      blocks.push(body(sec.empty, { i: true }));
      continue;
    }
    if (sec.kind === 'prose') {
      blocks.push(body(sec.text));
    } else if (sec.kind === 'table') {
      blocks.push(tableXml(sec.headers, sec.rows));
    } else if (sec.kind === 'list') {
      for (const item of sec.items) blocks.push(body(item, {}));
    } else { /* labeled */
      for (const { label, text } of sec.items) {
        blocks.push(para(run(label, { b: true, sz: 21 }), { before: 80, after: 40 }));
        blocks.push(body(text));
      }
    }
  }

  const sectPr =
    '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/>' +
    '<w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/></w:sectPr>';

  const documentXml =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<w:document xmlns:w="${W_NS}"><w:body>${blocks.join('')}${sectPr}</w:body></w:document>`;

  const contentTypes =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    `<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>` +
    `<Default Extension="xml" ContentType="application/xml"/>` +
    `<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>` +
    `</Types>`;

  const rootRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">` +
    `<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>` +
    `</Relationships>`;

  const enc = new TextEncoder();
  return zipStore([
    { name: '[Content_Types].xml', data: enc.encode(contentTypes) },
    { name: '_rels/.rels', data: enc.encode(rootRels) },
    { name: 'word/document.xml', data: enc.encode(documentXml) },
  ]);
}
