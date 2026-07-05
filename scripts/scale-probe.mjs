#!/usr/bin/env node
/* scale-probe.mjs — the PHASE 17 virtualization proof (declared scale gate).
 * Seeds ~2,000 SYNTHETIC stakeholders into the app's OWN store namespace
 * (localStorage "hpsm:stakeholders" + the matching schema stamp, injected
 * BEFORE the app boots — probe-only, per-browser-context, the repo seed is
 * never touched) so the REAL host chain runs at scale: the Lists page
 * computes the rows, row-change persists through the one Store seam, and the
 * bulk bar is the real host bar. Asserts:
 *   · the DOM row count stays BOUNDED (< 80 mounted .sheet-row nodes)
 *   · scroll correctness: at any scroll position every rendered row's idx
 *     cell matches its name (row N shows "Probe Stakeholder N"), at the top,
 *     a deep mid-scroll target, and the bottom edge
 *   · the footer/scrollbar stay honest (count reads the FULL filtered set;
 *     total scroll height ≈ header + 2000 rows)
 *   · F1 SCROLL STABILITY at depth: an identity .data re-push, a checkbox
 *     click, a bulk priority write, and the sealed inline-edit chain
 *     (input change → row-change → setStakeholders → .data re-push) all
 *     leave the viewport where it was — no teleport to row 1
 *   · F4 KEYBOARD: Space toggles a focused row checkbox repeatedly with
 *     focus held (selection syncs in place — no rebuild); Tab advances
 *   · F3 RESIZE: shrinking/growing the viewport recomputes the window
 *     (ResizeObserver) and the rows stay consistent
 *   · F5 HONESTY: the bulk snackbar reports the actually-landed count
 * Captures p17-virtual-*.png + p17-depth-ops.png for the visual gate.
 * Usage: node scripts/scale-probe.mjs [outdir]
 */
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';

const ROOT = '/home/user/stakeholdr/dist';
const OUT = process.argv[2] || '/tmp/shots';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const srv = createServer(async (req, res) => {
  try {
    let p = req.url.split('?')[0]; if (p.endsWith('/')) p += 'index.html';
    const body = await readFile(join(ROOT, p));
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('nf'); }
});
await new Promise(r => srv.listen(4176, r));

const N = 2000;
const errs = [];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));

// Seed the store BEFORE any app script runs: the schema stamp must match the
// app's (store.js SCHEMA_VERSION 'v10-rebuild') or init wipes the namespace.
// All rows are unscored (no scores seeded) with one shared lastContact, so
// the sealed default sort (unscored first, lastContact desc, stable) keeps
// insertion order — row idx N is always "Probe Stakeholder N".
await page.addInitScript((total) => {
  const prio = ['High', 'Medium', 'Low'];
  const rows = Array.from({ length: total }, (_, k) => {
    const i = k + 1;
    return {
      id: 'probe-' + i,
      name: 'Probe Stakeholder ' + i,
      org: 'Probe Org ' + (k % 40),
      category: 'Government', type: 'Mayor', market: 'Americas',
      region: 'United States', geography: 'Local', state: 'Oregon',
      issues: k % 5 ? [] : ['Site Operations'], priority: prio[k % 3],
      tags: k % 7 ? [] : ['probe'], owners: [], email: '', phone: '',
      xAccount: '', lastContact: '2026-01-01', status: 'Active', notes: '',
      url: '',
      createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
    };
  });
  localStorage.setItem('hpsm:__schema', 'v10-rebuild');
  localStorage.setItem('hpsm:stakeholders', JSON.stringify(rows));
}, N);

await page.goto('http://127.0.0.1:4176/app.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
// table mode so the grid gets the full runway (the band folds to its head)
await page.locator('.intel-modes ui-icon-button[aria-label="Expand table"]').click({ timeout: 3000 }).catch(e => errs.push('MODE: ' + e.message));
await page.waitForTimeout(600);

const probe = () => page.evaluate(() => {
  const t = document.querySelector('ui-stakeholder-table');
  const sr = t.shadowRoot;
  const rows = [...sr.querySelectorAll('.sheet-row')].map((r) => ({
    idx: (r.querySelector('[data-key="idx"]')?.textContent || '').trim(),
    name: (r.querySelector('[data-key="name"]')?.textContent || '').trim(),
  }));
  const sc = sr.querySelector('.sheet-scroll');
  return {
    domRows: rows.length,
    rows,
    footer: (sr.querySelector('.footer-count')?.textContent || '').trim(),
    scrollTop: sc.scrollTop,
    scrollHeight: sc.scrollHeight,
    clientHeight: sc.clientHeight,
  };
});
const checkConsistency = (p, label) => {
  if (p.domRows >= 80) errs.push(`${label}: DOM rows NOT bounded — ${p.domRows} mounted (must stay < 80)`);
  if (!p.domRows) errs.push(`${label}: no rows rendered`);
  for (const r of p.rows) {
    if (r.name !== `Probe Stakeholder ${r.idx}`) {
      errs.push(`${label}: window misaligned — idx ${r.idx} shows "${r.name}"`);
      break;
    }
  }
};
const centerRow = (target) => page.evaluate((tgt) => {
  const sr = document.querySelector('ui-stakeholder-table').shadowRoot;
  const sc = sr.querySelector('.sheet-scroll');
  const headH = sr.querySelector('.sheet-head .sheet-cell').getBoundingClientRect().height;
  const rowH = sr.querySelector('.sheet-row .sheet-cell').getBoundingClientRect().height;
  sc.scrollTop = headH + (tgt - 1) * rowH - sc.clientHeight / 2; // center row `tgt`
}, target);
const scrollTopOf = () => page.evaluate(() =>
  document.querySelector('ui-stakeholder-table').shadowRoot.querySelector('.sheet-scroll').scrollTop);

// ── top of the list ────────────────────────────────────────────────────────
let p = await probe();
checkConsistency(p, 'TOP');
if (p.footer !== `${N} of ${N} stakeholders`) errs.push(`FOOTER: expected "${N} of ${N} stakeholders" (the FULL set, never the window), saw "${p.footer}"`);
if (p.rows[0]?.idx !== '1') errs.push(`TOP: expected row 1 first, saw idx "${p.rows[0]?.idx}"`);
console.log(`top: ${p.domRows} DOM rows · footer "${p.footer}" · scrollHeight ${p.scrollHeight}`);
await page.screenshot({ path: `${OUT}/p17-virtual-top.png` });

// ── deep mid-scroll: land on row 1234 ─────────────────────────────────────
const TARGET = 1234;
await centerRow(TARGET);
await page.waitForTimeout(500);
p = await probe();
checkConsistency(p, 'MID');
if (!p.rows.some((r) => r.idx === String(TARGET) && r.name === `Probe Stakeholder ${TARGET}`)) {
  errs.push(`MID: row ${TARGET} not rendered at its scroll position (window: idx ${p.rows[0]?.idx}–${p.rows[p.rows.length - 1]?.idx})`);
}
console.log(`mid (row ${TARGET}): ${p.domRows} DOM rows · window idx ${p.rows[0]?.idx}–${p.rows[p.rows.length - 1]?.idx}`);
await page.screenshot({ path: `${OUT}/p17-virtual-mid.png` });

// ── F1: identity .data re-push at depth (the empirical HIGH repro) ────────
// A full re-render used to clamp scrollTop to 0 while the grid was empty and
// then read the clamped value. The set runs synchronously, so the position
// is asserted immediately after the setter returns.
const rp = await page.evaluate(() => {
  const t = document.querySelector('ui-stakeholder-table');
  const sc = t.shadowRoot.querySelector('.sheet-scroll');
  const before = sc.scrollTop;
  t.data = t.data; // identity re-push → full #render
  return { before, after: sc.scrollTop };
});
if (Math.abs(rp.after - rp.before) > 1) errs.push(`REPUSH: identity re-push moved the viewport ${rp.before} → ${rp.after}`);
await page.waitForTimeout(300);
p = await probe();
checkConsistency(p, 'REPUSH');
console.log(`repush at depth: scrollTop ${rp.before} → ${rp.after}`);

// ── bottom edge ────────────────────────────────────────────────────────────
await page.evaluate(() => {
  const sc = document.querySelector('ui-stakeholder-table').shadowRoot.querySelector('.sheet-scroll');
  sc.scrollTop = sc.scrollHeight;
});
await page.waitForTimeout(500);
p = await probe();
checkConsistency(p, 'BOTTOM');
if (p.rows[p.rows.length - 1]?.idx !== String(N)) errs.push(`BOTTOM: expected row ${N} last, saw idx "${p.rows[p.rows.length - 1]?.idx}"`);
// the scrollbar must span the whole dataset (spacers honest): height ≈ head + N*rowH
const spanOk = await page.evaluate((total) => {
  const sr = document.querySelector('ui-stakeholder-table').shadowRoot;
  const sc = sr.querySelector('.sheet-scroll');
  const headH = sr.querySelector('.sheet-head .sheet-cell').getBoundingClientRect().height;
  const rowH = sr.querySelector('.sheet-row .sheet-cell').getBoundingClientRect().height;
  return Math.abs(sc.scrollHeight - (headH + total * rowH)) <= rowH * 2;
}, N);
if (!spanOk) errs.push('SPAN: total scroll height drifted from header + N×rowHeight (spacer math broken)');
console.log(`bottom: ${p.domRows} DOM rows · last idx ${p.rows[p.rows.length - 1]?.idx}`);
await page.screenshot({ path: `${OUT}/p17-virtual-bottom.png` });

// ── rapid scroll sweep: no dead zones, always consistent ──────────────────
for (const frac of [0.1, 0.35, 0.6, 0.85]) {
  await page.evaluate((f) => {
    const sc = document.querySelector('ui-stakeholder-table').shadowRoot.querySelector('.sheet-scroll');
    sc.scrollTop = (sc.scrollHeight - sc.clientHeight) * f;
  }, frac);
  await page.waitForTimeout(250);
  p = await probe();
  checkConsistency(p, `SWEEP@${frac}`);
}
console.log('sweep: 4 positions consistent');

// ── F1+F4: checkbox click at depth — viewport holds, focus holds ──────────
const CB_ROW = 1500; // priority Low (k=1499 → 1499%3=2) — the bulk write below sets High
await centerRow(CB_ROW);
await page.waitForTimeout(400);
const cbBefore = await scrollTopOf();
const row1500 = page.locator('ui-stakeholder-table .sheet-row')
  .filter({ has: page.getByText(`Probe Stakeholder ${CB_ROW}`, { exact: true }) });
await row1500.locator('ui-checkbox').click({ timeout: 3000 }).catch(e => errs.push('CBCLICK: ' + e.message));
await page.waitForTimeout(500); // real host bar mounts above the table (viewport shrinks → RO recompute)
const cbState = await page.evaluate((idx) => {
  const t = document.querySelector('ui-stakeholder-table');
  const sr = t.shadowRoot;
  const row = [...sr.querySelectorAll('.sheet-row')]
    .find(r => (r.querySelector('[data-key="idx"]')?.textContent || '').trim() === String(idx));
  const cb = row && row.querySelector('ui-checkbox');
  const a = sr.activeElement;
  return {
    scrollTop: sr.querySelector('.sheet-scroll').scrollTop,
    checked: cb ? cb.hasAttribute('checked') : null,
    washed: row ? row.classList.contains('checked') : null,
    focusOnCheckbox: !!(a && a.localName === 'ui-checkbox'),
    selection: t.selection,
  };
}, CB_ROW);
if (Math.abs(cbState.scrollTop - cbBefore) > 2) errs.push(`CB@DEPTH: checkbox click moved the viewport ${cbBefore} → ${cbState.scrollTop}`);
if (cbState.checked !== true) errs.push('CB@DEPTH: the clicked checkbox did not stay checked');
if (!cbState.washed) errs.push('CB@DEPTH: the checked row lost its selected wash');
if (!cbState.focusOnCheckbox) errs.push('CB@DEPTH: focus left the clicked checkbox (rebuild stole it)');
if (cbState.selection.length !== 1 || cbState.selection[0] !== `probe-${CB_ROW}`) errs.push(`CB@DEPTH: selection expected [probe-${CB_ROW}], saw ${JSON.stringify(cbState.selection)}`);
const cbBar = (await page.locator('.bulk-bar .bulk-count').textContent().catch(() => '') || '').trim();
if (cbBar !== '1 selected') errs.push(`CB@DEPTH: host bar expected "1 selected", saw "${cbBar}"`);
console.log(`checkbox at depth (row ${CB_ROW}): scrollTop ${cbBefore} → ${cbState.scrollTop} · focus held ${cbState.focusOnCheckbox}`);

// ── F1+F5: bulk priority write at depth via the REAL host bar ─────────────
const bwBefore = await scrollTopOf();
await page.locator('#bulk-priority-btn').click({ timeout: 3000 }).catch(e => errs.push('BWBTN: ' + e.message));
await page.waitForTimeout(300);
await page.locator('ui-menu.bulk-menu-priority[open] ui-menu-item', { hasText: 'High' }).click({ timeout: 3000 }).catch(e => errs.push('BWPICK: ' + e.message));
await page.waitForTimeout(800); // 2k-row setState → store save → .data re-push → render
const bw = await page.evaluate((idx) => {
  const t = document.querySelector('ui-stakeholder-table');
  const sr = t.shadowRoot;
  const row = [...sr.querySelectorAll('.sheet-row')]
    .find(r => (r.querySelector('[data-key="idx"]')?.textContent || '').trim() === String(idx));
  const shs = JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]');
  const rec = shs.find(s => s.id === 'probe-' + idx) || {};
  return {
    scrollTop: sr.querySelector('.sheet-scroll').scrollTop,
    pill: row ? (row.querySelector('[data-key="priority"]')?.textContent || '').trim() : null,
    stored: rec.priority,
    stamped: rec.updatedAt !== '2026-01-01T00:00:00.000Z',
    snack: (document.querySelector('.sheet-wrap ui-snackbar')?.getAttribute('message') || '').trim(),
  };
}, CB_ROW);
if (Math.abs(bw.scrollTop - bwBefore) > 2) errs.push(`BULK@DEPTH: the bulk write moved the viewport ${bwBefore} → ${bw.scrollTop}`);
if (bw.stored !== 'High') errs.push(`BULK@DEPTH: store expected priority High, saw "${bw.stored}"`);
if (!bw.stamped) errs.push('BULK@DEPTH: the written row was not updatedAt-stamped');
if (bw.pill !== 'High') errs.push(`BULK@DEPTH: the rendered pill at depth expected High, saw "${bw.pill}"`);
if (bw.snack !== 'Priority set to High for 1 stakeholder') errs.push(`BULK@DEPTH: honest snackbar expected "Priority set to High for 1 stakeholder", saw "${bw.snack}"`);
const bwBar = (await page.locator('.bulk-bar .bulk-count').textContent().catch(() => '') || '').trim();
if (bwBar !== '1 selected') errs.push(`BULK@DEPTH: the selection must survive the write, saw "${bwBar}"`);
console.log(`bulk write at depth: scrollTop ${bwBefore} → ${bw.scrollTop} · pill ${bw.pill} · snack "${bw.snack}"`);
await page.screenshot({ path: `${OUT}/p17-depth-ops.png` });
await page.locator('.bulk-bar ui-button', { hasText: 'Clear selection' }).click({ timeout: 3000 }).catch(e => errs.push('BWCLEAR: ' + e.message));
await page.waitForTimeout(400);

// ── F4: keyboard checkbox walk — Space toggles with focus held, Tab moves ──
const kbInit = await page.evaluate(() => {
  const t = document.querySelector('ui-stakeholder-table');
  const sr = t.shadowRoot;
  const rows = [...sr.querySelectorAll('.sheet-row')];
  const row = rows[Math.floor(rows.length / 2)];
  const cb = row.querySelector('ui-checkbox');
  cb.dataset.probe = 'kb';
  cb.focus();
  return {
    idx: (row.querySelector('[data-key="idx"]')?.textContent || '').trim(),
    checked: cb.hasAttribute('checked'),
  };
});
if (kbInit.checked) errs.push(`KB: walk row ${kbInit.idx} unexpectedly started checked`);
for (let i = 1; i <= 3; i++) {
  await page.keyboard.press('Space');
  await page.waitForTimeout(300); // host bar mounts/unmounts between presses — focus must survive
  const st = await page.evaluate(() => {
    const a = document.querySelector('ui-stakeholder-table').shadowRoot.activeElement;
    return {
      focusHeld: !!(a && a.dataset && a.dataset.probe === 'kb'),
      checked: a ? a.hasAttribute('checked') : null,
    };
  });
  if (!st.focusHeld) errs.push(`KB${i}: focus left the checkbox after Space press ${i}`);
  if (st.checked !== (i % 2 === 1)) errs.push(`KB${i}: expected checked=${i % 2 === 1} after press ${i}, saw ${st.checked}`);
}
await page.keyboard.press('Tab');
await page.waitForTimeout(200);
const tabRes = await page.evaluate(() => {
  const a = document.querySelector('ui-stakeholder-table').shadowRoot.activeElement;
  return {
    inTable: !!a,
    stillCheckbox: !!(a && a.dataset && a.dataset.probe === 'kb'),
    tag: a ? a.localName : (document.activeElement ? document.activeElement.localName : 'none'),
  };
});
if (tabRes.stillCheckbox) errs.push('KBTAB: Tab did not advance focus off the checkbox');
if (!tabRes.inTable) errs.push(`KBTAB: Tab dropped focus out of the table (landed on ${tabRes.tag})`);
console.log(`keyboard walk (row ${kbInit.idx}): 3 Space toggles focus-held · Tab → ${tabRes.tag}`);
await page.evaluate(() => document.querySelector('ui-stakeholder-table').clearSelection());
await page.waitForTimeout(300);

// ── F3: resize recompute (ResizeObserver — no scroll event involved) ──────
await centerRow(1600);
await page.waitForTimeout(400);
const preResize = await probe();
await page.setViewportSize({ width: 1440, height: 560 });
await page.waitForTimeout(600);
let pr = await probe();
checkConsistency(pr, 'RESIZE-SHRINK');
if (pr.domRows >= preResize.domRows) errs.push(`RESIZE-SHRINK: shrinking the viewport must shrink the window (${preResize.domRows} → ${pr.domRows})`);
await page.setViewportSize({ width: 1440, height: 900 });
await page.waitForTimeout(600);
pr = await probe();
checkConsistency(pr, 'RESIZE-GROW');
if (pr.domRows < preResize.domRows) errs.push(`RESIZE-GROW: growing back must re-grow the window (${preResize.domRows} → ${pr.domRows})`);
console.log(`resize: ${preResize.domRows} rows @900px → shrink → grow back to ${pr.domRows}`);

// ── F1: inline edit at depth — the SEALED chain, end to end (LAST: the org
// edit mirrors into name for non-persons, so row 1500's name changes) ──────
await centerRow(CB_ROW);
await page.waitForTimeout(400);
const edBefore = await scrollTopOf();
const edRow = page.locator('ui-stakeholder-table .sheet-row')
  .filter({ has: page.getByText(`Probe Stakeholder ${CB_ROW}`, { exact: true }) });
await edRow.locator('input.cell-input').fill('Edited Org @ depth', { timeout: 3000 }).catch(e => errs.push('EDITFILL: ' + e.message));
await page.keyboard.press('Tab'); // blur commits (change → row-change → host → re-push)
await page.waitForTimeout(800);
const ed = await page.evaluate((idx) => {
  const t = document.querySelector('ui-stakeholder-table');
  const sr = t.shadowRoot;
  const row = [...sr.querySelectorAll('.sheet-row')]
    .find(r => (r.querySelector('[data-key="idx"]')?.textContent || '').trim() === String(idx));
  const shs = JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]');
  const rec = shs.find(s => s.id === 'probe-' + idx) || {};
  return {
    scrollTop: sr.querySelector('.sheet-scroll').scrollTop,
    stored: rec.org,
    cell: row ? (row.querySelector('[data-key="org"] input')?.value || '') : null,
  };
}, CB_ROW);
if (Math.abs(ed.scrollTop - edBefore) > 2) errs.push(`EDIT@DEPTH: the inline-edit chain moved the viewport ${edBefore} → ${ed.scrollTop}`);
if (ed.stored !== 'Edited Org @ depth') errs.push(`EDIT@DEPTH: the edit did not commit to the store (saw "${ed.stored}")`);
if (ed.cell !== 'Edited Org @ depth') errs.push(`EDIT@DEPTH: the re-rendered cell at depth expected the new value, saw "${ed.cell}"`);
console.log(`edit at depth (row ${CB_ROW}): scrollTop ${edBefore} → ${ed.scrollTop} · committed "${ed.stored}"`);

const real = errs.filter(e => !/fonts\.g(oogleapis|static)\.com|net::ERR_|Failed to load resource/.test(e));
await browser.close(); srv.close();
if (real.length) {
  console.error(`\nSCALE PROBE: ${real.length} FAILURE(S)\n  - ` + real.join('\n  - '));
  process.exit(1);
}
console.log(`\nSCALE PROBE: PASS — ${N} rows via the REAL store, DOM bounded, scroll windows correct, depth ops stable, keyboard walk clean. Shots in ${OUT}`);
