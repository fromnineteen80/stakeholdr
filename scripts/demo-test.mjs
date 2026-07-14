#!/usr/bin/env node
/* demo-test.mjs — node asserts on the PHASE 19 DEMO-POLISH pure logic:
 *   · PLAN → WORD EXPORT (sealed ~3895 + the Plan box's EXPORT/ARCHIVE
 *     ruling: the element/section structure becomes the document's outline):
 *     buildPlanDocModel maps the sealed review derivations; buildPlanDocx
 *     packs a minimal WordprocessingML part set through the SHARED Phase-18
 *     stored-zip core; the bytes unzip-validate with the Phase-18 reader
 *     (structure, CRC, sealed section titles + empty strings, content spots).
 *   · RESET DEMO DATA + BLANK START (sealed ~3882 Store.reset key sweep +
 *     schema re-stamp; sealed ~3899 "blank-org vs demo-data seed choice"):
 *     the namespace key-sweep predicate, the blank marker key, and the
 *     blank-boot seed resolution incl. the declared minimal solo manager.
 */
import assert from 'node:assert/strict';
import {
  buildPlanDocModel, buildPlanDocx, planDocxFilename, PLAN_DOCX_MIME,
} from '../src/app/export/docx.js';
import { crc32, zipStore, xmlEscape } from '../src/app/export/zip.js';
import { listZipEntries, readZipEntry } from '../src/app/import/xlsx-read.js';
import {
  resolveSectorModel, resolveGoalModel, planFit, effectiveBand,
  comparePlanRows, planStakeholderIds, planMetaLine, reviewScenario,
} from '../src/app/pages/plan-logic.js';
import { weightedCoord, statusFor, STATUSES } from '../src/app/data/engine.js';
import {
  SEED_PLANS, SEED_STAKEHOLDERS, SEED_STAKEHOLDER_WORKSPACES, SEED_SCORES,
  SEED_TEAM, SEED_USERS, SEED_WORKSPACES, SEED_COMMUNITY, SEED_MESSAGES,
  blankSeedFor, BLANK_SOLO_USER,
} from '../src/app/data/seed.js';
import { ORG_GOALS, SITES } from '../src/app/data/catalogs.js';
import { Store, sweepKeys, BLANK_KEY } from '../src/app/data/store.js';
import { APP_CONFIG_SEED } from '../src/app/data/company.js';

let passed = 0;
const ok = async (name, fn) => { await fn(); passed++; console.log('  ✓ ' + name); };

console.log('demo-test: Phase 19 demo polish (Word export · reset/blank · seeds)\n');

/* ── the seed plan's review rows, derived EXACTLY as usePlanRows does ────── */
const plan = SEED_PLANS[0];
const sector = resolveSectorModel(plan.sectorModel);
const goal = resolveGoalModel(plan.goalModel);
const roster = SEED_STAKEHOLDERS.filter((s) =>
  (SEED_STAKEHOLDER_WORKSPACES[s.id] || []).includes(plan.workspaceId));
const memberIds = planStakeholderIds(plan, roster.map((s) => s.id));
const ctx = {
  scores: SEED_SCORES, team: SEED_TEAM, community: SEED_COMMUNITY,
  planIssues: plan.issues || [],
};
const rows = memberIds
  .map((id) => SEED_STAKEHOLDERS.find((s) => s.id === id))
  .filter(Boolean)
  .map((s) => {
    const wc = weightedCoord(s.id, SEED_SCORES, SEED_TEAM);
    const zone = statusFor(wc.x, wc.y);
    const fit = planFit(s, sector, goal, ctx);
    const override = (plan.priorityOverrides || {})[s.id] || null;
    return {
      s, zone, fit, override,
      effective: effectiveBand(override, fit.band),
      move: (STATUSES[zone] || {}).strategy || '',
      moveAction: (STATUSES[zone] || {}).action || '',
      priority: s.priority, band: effectiveBand(override, fit.band), score: fit.score,
    };
  })
  .sort(comparePlanRows);

const ws = SEED_WORKSPACES.find((w) => w.id === plan.workspaceId);
const site = SITES.find((s) => s.id === plan.site);

const model = buildPlanDocModel({
  plan, rows, users: SEED_USERS, ws, site,
  companyGoals: ORG_GOALS, community: SEED_COMMUNITY, sector, goal,
});
const bytes = buildPlanDocx(model);

const dec = new TextDecoder();
const entries = listZipEntries(bytes);
const entryByName = (n) => entries.find((e) => e.name === n);
const partText = async (n) => dec.decode(await readZipEntry(bytes, entryByName(n)));

await ok('docx model: the sealed review outline (order + meta + algo lines)', () => {
  assert.equal(model.title, 'FY26 Hawk Engagement Plan');
  assert.deepEqual(model.sections.map((s) => s.title), [
    'Scenario & Context',
    'Aligning With Organizational Goals',
    'Stakeholders In This Plan',
    'Cross-functional Team',
    'Tactics',
    'Issues',
    'Community Investment',
    'Measurement & Reporting',
  ]);
  // the shared derivations feed BOTH the review surface and the export
  assert.equal(model.metaLine, planMetaLine(plan, ws, site));
  assert.ok(model.metaLine.includes('Hawk') && model.metaLine.includes('Americas / United States'));
  assert.equal(reviewScenario(plan).length, 3);
  assert.equal(model.algoLines.length, 2);
  assert.ok(model.algoLines[0].startsWith(sector.name + ':'));
  assert.ok(model.badgeLine.includes('Status: Active'));
  assert.ok(model.badgeLine.includes('Jordan Kim'));
});

await ok('docx model: the BINDING element-6 table (headers + Fit-ranked rows + Reason/Move)', () => {
  const sec = model.sections[2];
  assert.deepEqual(sec.headers,
    ['Stakeholder', 'Type', 'Relationship', 'Priority', 'Plan Fit', 'Reason + Move']);
  assert.equal(sec.rows.length, rows.length);
  assert.ok(sec.rows.length >= 4, 'the seed workspace roster feeds the table');
  // row cells mirror the derivation; the last cell carries reason + full move
  const first = sec.rows[0];
  assert.equal(first[2], rows[0].zone);
  assert.equal(first[4], rows[0].effective);
  assert.ok(Array.isArray(first[5]) && first[5][0] === rows[0].fit.reason);
  assert.ok(first[5][1].startsWith('Move: ' + rows[0].move));
  assert.ok(first[5][1].includes(rows[0].moveAction), 'paper carries the tooltip action in full');
});

await ok('docx model: sealed empty strings on an empty plan', () => {
  const bare = buildPlanDocModel({
    plan: { id: 'p0', title: '', goalModel: 'general' },
    rows: [], users: [], ws: null, site: null,
    companyGoals: [], community: [], sector, goal,
  });
  const byTitle = Object.fromEntries(bare.sections.map((s) => [s.title, s]));
  assert.equal(byTitle['Scenario & Context'].empty, 'Not written yet.');
  assert.equal(byTitle['Aligning With Organizational Goals'].empty, 'No goals listed.');
  assert.equal(byTitle['Stakeholders In This Plan'].empty, 'No stakeholders in this workspace.');
  assert.equal(byTitle['Cross-functional Team'].empty, 'No team assigned.');
  assert.equal(byTitle['Tactics'].empty, 'No tactics yet.');
  assert.equal(byTitle['Issues'].empty, 'None.');
  assert.equal(byTitle['Community Investment'].empty, 'No community investments linked.');
  assert.equal(byTitle['Measurement & Reporting'].empty, 'Not written yet.');
  // an untitled strategy prints the sealed "Untitled"
  const withStub = buildPlanDocModel({
    plan: { id: 'p1', goalModel: 'general', strategies: [{ id: 's1', title: ' ', how: '' }] },
    rows: [], users: [], companyGoals: [], community: [], sector, goal,
  });
  assert.equal(withStub.sections[4].items[0].label, 'Untitled');
});

/* Central-directory CRC walk (listZipEntries exposes name/method/dataStart
 * but not the stored CRC — read it straight from the central records). */
function centralCrcs(zipBytes) {
  const view = new DataView(zipBytes.buffer, zipBytes.byteOffset, zipBytes.byteLength);
  const u16 = (o) => view.getUint16(o, true);
  const u32 = (o) => view.getUint32(o, true);
  let eocd = -1;
  for (let i = zipBytes.length - 22; i >= 0; i--) {
    if (u32(i) === 0x06054B50) { eocd = i; break; }
  }
  assert.ok(eocd >= 0, 'EOCD present');
  const count = u16(eocd + 10);
  let off = u32(eocd + 16);
  const dec2 = new TextDecoder();
  const out = {};
  for (let n = 0; n < count; n++) {
    assert.equal(u32(off), 0x02014B50, 'central record signature');
    const nameLen = u16(off + 28);
    out[dec2.decode(zipBytes.subarray(off + 46, off + 46 + nameLen))] = u32(off + 16);
    off += 46 + nameLen + u16(off + 30) + u16(off + 32);
  }
  return out;
}

await ok('docx bytes: legal stored zip — the exact 3-part set, CRC-verified', async () => {
  assert.deepEqual(entries.map((e) => e.name).sort(), [
    '[Content_Types].xml', '_rels/.rels', 'word/document.xml',
  ]);
  const crcs = centralCrcs(bytes);
  for (const e of entries) {
    assert.equal(e.method, 0, `${e.name} is STORED`);
    const raw = new Uint8Array(await readZipEntry(bytes, e));
    assert.equal(crc32(raw), crcs[e.name], `${e.name} CRC matches`);
  }
});

await ok('docx parts: content types + rels target word/document.xml', async () => {
  const types = await partText('[Content_Types].xml');
  assert.ok(types.includes('wordprocessingml.document.main+xml'));
  assert.ok(types.includes('PartName="/word/document.xml"'));
  const rels = await partText('_rels/.rels');
  assert.ok(rels.includes('Target="word/document.xml"'));
  assert.ok(rels.includes('relationships/officeDocument'));
});

await ok('docx document.xml: headings, table, content spot-checks, sectPr', async () => {
  const doc = await partText('word/document.xml');
  assert.ok(doc.startsWith('<?xml'));
  assert.ok(doc.includes('xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"'));
  // title + every sealed section heading
  assert.ok(doc.includes('FY26 Hawk Engagement Plan'));
  for (const s of model.sections) assert.ok(doc.includes(xmlEscape(s.title)), s.title);
  // content spots: scenario prose, a stakeholder row, a strategy, measurement,
  // the linked community line, the algorithm formula readout
  assert.ok(doc.includes('outfall-permit fight'));
  assert.ok(doc.includes(xmlEscape('Regulator confidence')));
  assert.ok(doc.includes(xmlEscape(model.sections[2].rows[0][0])));
  assert.ok(doc.includes('Quarterly re-score'));
  assert.ok(doc.includes(xmlEscape('Willamette River Cleanup Day')));
  assert.ok(doc.includes(xmlEscape(model.algoLines[0])));
  // one table with the REQUIRED w:tblGrid (schema-mandatory; python-docx
  // verified), one sectPr, balanced body
  assert.equal((doc.match(/<w:tbl>/g) || []).length, 1);
  assert.equal((doc.match(/<w:tblGrid>/g) || []).length, 1);
  assert.equal((doc.match(/<w:gridCol /g) || []).length, 6, 'one gridCol per element-6 column');
  assert.ok(doc.includes('<w:sectPr>') && doc.endsWith('</w:body></w:document>'));
  // multiline strategy "how" text becomes explicit breaks, never raw \n
  assert.ok(!/[^>]\n/.test(doc), 'no raw newlines leak into the XML');
});

await ok('docx filename mirrors the sealed csvFilename expression + MIME', () => {
  assert.equal(planDocxFilename('FY26 Hawk Engagement Plan'), 'FY26_Hawk_Engagement_Plan.docx');
  assert.equal(planDocxFilename('  '), 'plan.docx');
  assert.equal(planDocxFilename(null), 'plan.docx');
  assert.equal(planDocxFilename('Keep-hyphens & drop (rest)'), 'Keep-hyphens_drop_rest_.docx');
  assert.equal(PLAN_DOCX_MIME,
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
});

await ok('zip core is truly shared (template re-exports THIS zipStore/crc32)', async () => {
  const t = await import('../src/app/import/template.js');
  assert.equal(t.zipStore, zipStore);
  assert.equal(t.crc32, crc32);
  assert.equal(t.xmlEscape, xmlEscape);
});

/* ── RESET DEMO DATA + BLANK START (sealed ~3882 Store.reset key sweep +
 * schema re-stamp, WIRED; sealed ~3899 blank-org vs demo-data choice) ────── */

await ok('key sweep: exactly the "hpsm:" namespace, nothing else', () => {
  const keys = [
    'hpsm:stakeholders', 'hpsm:__schema', 'hpsm:appConfig', BLANK_KEY,
    'other:thing', 'hpsm', 'HPSM:upper', 'unrelated',
  ];
  assert.deepEqual(sweepKeys(keys),
    ['hpsm:stakeholders', 'hpsm:__schema', 'hpsm:appConfig', BLANK_KEY]);
  // the blank marker LIVES in the namespace so the sealed sweep clears it —
  // "Reset to demo data" also exits blank mode by construction
  assert.equal(BLANK_KEY, 'hpsm:__blank');
  assert.ok(sweepKeys([BLANK_KEY]).includes(BLANK_KEY));
});

await ok('blank seeds: collections empty, appConfig kept, solo manager user', () => {
  // every seeded collection resolves to its EMPTY shape
  assert.deepEqual(blankSeedFor('stakeholders', SEED_STAKEHOLDERS), []);
  assert.deepEqual(blankSeedFor('workspaces', SEED_WORKSPACES), []);
  assert.deepEqual(blankSeedFor('team', SEED_TEAM), []);
  assert.deepEqual(blankSeedFor('plans', SEED_PLANS), []);
  assert.deepEqual(blankSeedFor('community', SEED_COMMUNITY), []);
  assert.deepEqual(blankSeedFor('scores', SEED_SCORES), {});
  assert.deepEqual(blankSeedFor('messages', SEED_MESSAGES), {});
  assert.deepEqual(blankSeedFor('stakeholderWorkspaces', SEED_STAKEHOLDER_WORKSPACES), {});
  // org defaults survive a blank start (declared: config, not demo rows)
  assert.equal(blankSeedFor('appConfig', APP_CONFIG_SEED), APP_CONFIG_SEED);
  // scalars pass through untouched (per-device flags etc.)
  assert.equal(blankSeedFor('anything', 'scalar'), 'scalar');
  // the declared minimal solo MANAGER (currentUser = users[0] must exist,
  // and a manager is required to reach Settings — incl. the reset itself)
  assert.deepEqual(blankSeedFor('users', SEED_USERS), [BLANK_SOLO_USER]);
  assert.equal(BLANK_SOLO_USER.role, 'manager');
  assert.ok(BLANK_SOLO_USER.id && BLANK_SOLO_USER.name);
  assert.ok(String(BLANK_SOLO_USER.avatarColor).startsWith('var(--ui-sys-avatar-'),
    'token-referenced avatar color, never a literal hex');
});

await ok('Store surface: reset + startBlank exist; node (no localStorage) is safe', () => {
  assert.equal(typeof Store.reset, 'function');
  assert.equal(typeof Store.startBlank, 'function');
  // node has no localStorage — load returns the seed; reset/startBlank no-op
  assert.equal(Store.load('probe', 'seed-value'), 'seed-value');
  Store.reset();
  Store.startBlank();
});

console.log(`\ndemo-test: all ${passed} checks passed`);
/* store.js opens a BroadcastChannel at module load (node ≥18 ships the
 * global), which keeps the event loop referenced — exit explicitly. */
process.exit(0);
