#!/usr/bin/env node
/* scale-probe.mjs — the PHASE 17 virtualization proof (declared scale gate).
 * Seeds ~2,000 SYNTHETIC rows into <ui-stakeholder-table> via its .data
 * property (probe-only — the app seed is never touched) and asserts:
 *   · the DOM row count stays BOUNDED (< 80 mounted .sheet-row nodes)
 *   · scroll correctness: at any scroll position every rendered row's idx
 *     cell matches its name (row N shows "Probe Stakeholder N"), at the top,
 *     a deep mid-scroll target, and the bottom edge
 *   · the footer/scrollbar stay honest (count reads the FULL filtered set;
 *     total scroll height ≈ header + 2000 rows)
 * Captures p17-virtual-*.png for the visual gate.
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

await page.goto('http://127.0.0.1:4176/app.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
// table mode so the grid gets the full runway (the band folds to its head)
await page.locator('.intel-modes ui-icon-button[aria-label="Expand table"]').click({ timeout: 3000 }).catch(e => errs.push('MODE: ' + e.message));
await page.waitForTimeout(400);

// Inject the synthetic dataset straight onto the component (.data property —
// the declared probe seam; React state and the app seed stay untouched).
await page.evaluate((total) => {
  const zones = ['Proactively Defend', 'Defend', 'Monitor', 'Maintain', 'Connect',
    'Cooperate', 'Collaborate', 'Valuable Relationship', 'Strategic Partner'];
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
      url: '', community: [],
      _x: ((k % 41) - 20) / 2, _y: (((k * 7) % 41) - 20) / 2,
      _status: zones[k % zones.length], _unscored: false,
    };
  });
  document.querySelector('ui-stakeholder-table').data = rows;
}, N);
await page.waitForTimeout(800);

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

// ── top of the list ────────────────────────────────────────────────────────
let p = await probe();
checkConsistency(p, 'TOP');
if (p.footer !== `${N} of ${N} stakeholders`) errs.push(`FOOTER: expected "${N} of ${N} stakeholders" (the FULL set, never the window), saw "${p.footer}"`);
if (p.rows[0]?.idx !== '1') errs.push(`TOP: expected row 1 first, saw idx "${p.rows[0]?.idx}"`);
console.log(`top: ${p.domRows} DOM rows · footer "${p.footer}" · scrollHeight ${p.scrollHeight}`);
await page.screenshot({ path: `${OUT}/p17-virtual-top.png` });

// ── deep mid-scroll: land on row 1234 ─────────────────────────────────────
const TARGET = 1234;
await page.evaluate((target) => {
  const sr = document.querySelector('ui-stakeholder-table').shadowRoot;
  const sc = sr.querySelector('.sheet-scroll');
  const headH = sr.querySelector('.sheet-head .sheet-cell').getBoundingClientRect().height;
  const rowH = sr.querySelector('.sheet-row .sheet-cell').getBoundingClientRect().height;
  sc.scrollTop = headH + (target - 1) * rowH - sc.clientHeight / 2; // center row `target`
}, TARGET);
await page.waitForTimeout(500);
p = await probe();
checkConsistency(p, 'MID');
if (!p.rows.some((r) => r.idx === String(TARGET) && r.name === `Probe Stakeholder ${TARGET}`)) {
  errs.push(`MID: row ${TARGET} not rendered at its scroll position (window: idx ${p.rows[0]?.idx}–${p.rows[p.rows.length - 1]?.idx})`);
}
console.log(`mid (row ${TARGET}): ${p.domRows} DOM rows · window idx ${p.rows[0]?.idx}–${p.rows[p.rows.length - 1]?.idx}`);
await page.screenshot({ path: `${OUT}/p17-virtual-mid.png` });

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

const real = errs.filter(e => !/fonts\.g(oogleapis|static)\.com|net::ERR_|Failed to load resource/.test(e));
await browser.close(); srv.close();
if (real.length) {
  console.error(`\nSCALE PROBE: ${real.length} FAILURE(S)\n  - ` + real.join('\n  - '));
  process.exit(1);
}
console.log(`\nSCALE PROBE: PASS — ${N} rows, DOM bounded, scroll windows correct. Shots in ${OUT}`);
