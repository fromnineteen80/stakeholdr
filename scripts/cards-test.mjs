// Phase 21+22 — CARD-CONSISTENCY PROBE (the card-anatomy visual-gate rule).
// Measures, on each of the three card landings (Plans · Community ·
// Workspaces):
//   (a) every card in a grid has THE SAME offsetHeight (per grid),
//   (b) every ui-chip inside cards has the same rendered height,
//   (c) the title's left edge aligns with the card's content-box left edge
//       (±1px — zero stray inline padding on the title control),
//   (d) Phase 22: every intra-card vertical gap (sibling boundingRect deltas
//       on the first card: zones, head lines, keyed rows) is one of the three
//       named steps — --ui-sys-card-gap-tight / -row / -section — or 0
//       (contiguous fixed-height rows), ±1px. Spacing drift fails the gate.
// Usage: node scripts/cards-test.mjs [--shots outdir]
// Exits non-zero on any violation. Run by the Phase-21 gate alongside
// scripts/smoke.mjs; shots.mjs captures the same three pages as p21-*.png.
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';

const ROOT = '/home/user/stakeholdr/dist';
const shotsIx = process.argv.indexOf('--shots');
const OUT = shotsIx > -1 ? process.argv[shotsIx + 1] : null;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const srv = createServer(async (req, res) => {
  try {
    let p = req.url.split('?')[0]; if (p.endsWith('/')) p += 'index.html';
    const body = await readFile(join(ROOT, p));
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('nf'); }
});
await new Promise((r) => srv.listen(4176, r));

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('http://127.0.0.1:4176/app.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.keyboard.press('Escape'); // skip the first-run tour
await page.waitForTimeout(300);

const failures = [];

/* One page's measurement pass. */
async function probe(label, navText, shot) {
  await page.locator('ui-sidebar > ui-sidebar-item', { hasText: navText }).click();
  await page.waitForTimeout(700);
  if (OUT && shot) await page.screenshot({ path: `${OUT}/${shot}` });

  const m = await page.evaluate(() => {
    const grids = [...document.querySelectorAll('.plan-grid')];
    const out = { grids: [], chips: [], titles: [], gaps: [], steps: null };
    // (d) the three legal spacing steps, resolved live from the token layer
    const probeEl = document.createElement('div');
    document.body.appendChild(probeEl);
    const px = (v) => { probeEl.style.marginTop = `var(${v})`; return parseFloat(getComputedStyle(probeEl).marginTop); };
    out.steps = {
      tight: px('--ui-sys-card-gap-tight'),
      row: px('--ui-sys-card-gap-row'),
      section: px('--ui-sys-card-gap-section'),
    };
    probeEl.remove();
    const firstCard = document.querySelector('.plan-grid > ui-card');
    if (firstCard) {
      const pairs = [];
      // zone-level siblings (light-DOM children of the card)
      const zones = [...firstCard.children].filter((el) => el.getBoundingClientRect().height > 0);
      for (let i = 1; i < zones.length; i++) pairs.push([zones[i - 1], zones[i], 'zone']);
      // head lines: title wrap children (title -> subtitle)
      const wrap = firstCard.querySelector('.plan-card-titlewrap');
      if (wrap) {
        const ls = [...wrap.children].filter((el) => el.getBoundingClientRect().height > 0);
        for (let i = 1; i < ls.length; i++) pairs.push([ls[i - 1], ls[i], 'head']);
      }
      // keyed rows inside the details groups (contiguous: expect 0)
      for (const g of firstCard.querySelectorAll('.plan-linked-group, .plan-card-meta')) {
        const rows = [...g.children].filter((el) => el.getBoundingClientRect().height > 0);
        for (let i = 1; i < rows.length; i++) pairs.push([rows[i - 1], rows[i], 'row']);
      }
      for (const [a, b, kind] of pairs) {
        const gap = +(b.getBoundingClientRect().top - a.getBoundingClientRect().bottom).toFixed(1);
        const name = (el) => (el.getAttribute('class') || el.tagName).split(' ')[0];
        out.gaps.push({ kind, gap, between: `${name(a)}->${name(b)}` });
      }
    }
    for (const g of grids) {
      const cards = [...g.querySelectorAll(':scope > ui-card')];
      out.grids.push(cards.map((c) => c.offsetHeight));
      for (const c of cards) {
        // the card's content box = inside ui-card's shadow .body padding
        // (--ui-sys-card-pad) — the edge the contract says titles sit on
        const body = c.shadowRoot && c.shadowRoot.querySelector('.body');
        const box = body || c;
        const cs = getComputedStyle(box);
        const contentLeft = box.getBoundingClientRect().left
          + parseFloat(cs.borderLeftWidth || 0) + parseFloat(cs.paddingLeft || 0);
        // (b) every ui-chip in the card — one rendered height
        for (const chip of c.querySelectorAll('ui-chip')) {
          const r = chip.getBoundingClientRect();
          if (r.height > 0) out.chips.push(+r.height.toFixed(1));
        }
        // (c) title left edge vs the card's content-box left edge
        const t = c.querySelector('.plan-card-title');
        if (t) {
          // the visible text box: the shadow button's own content edge
          const btn = t.shadowRoot ? t.shadowRoot.querySelector('button') : null;
          const box = btn || t;
          const bcs = getComputedStyle(box);
          const textLeft = box.getBoundingClientRect().left
            + parseFloat(bcs.borderLeftWidth || 0) + parseFloat(bcs.paddingLeft || 0);
          out.titles.push(+(textLeft - contentLeft).toFixed(1));
        }
      }
    }
    return out;
  });

  // (a) same offsetHeight per grid
  m.grids.forEach((hs, i) => {
    const uniq = [...new Set(hs)];
    if (uniq.length > 1) failures.push(`${label}: grid ${i + 1} card heights differ: [${hs.join(', ')}]`);
  });
  // (b) one chip height across the page's cards (±1px rounding tolerance)
  if (m.chips.length) {
    const min = Math.min(...m.chips), max = Math.max(...m.chips);
    if (max - min > 1) failures.push(`${label}: ui-chip heights differ inside cards: min ${min} max ${max} (all: ${[...new Set(m.chips)].join(', ')})`);
  }
  // (c) title left-edge alignment ±1px
  m.titles.forEach((d, i) => {
    if (Math.abs(d) > 1) failures.push(`${label}: card ${i + 1} title left edge off the content box by ${d}px`);
  });
  // (d) every intra-card vertical gap ∈ {0, tight, row, section} ±1px
  const legal = [0, m.steps.tight, m.steps.row, m.steps.section];
  m.gaps.forEach(({ kind, gap, between }) => {
    if (!legal.some((s) => Math.abs(gap - s) <= 1)) {
      failures.push(`${label}: ${kind} gap ${between} = ${gap}px — not a named step (legal: ${legal.join('/')}±1)`);
    }
  });

  const gridSummary = m.grids.map((hs) => [...new Set(hs)].join('/')).join(' · ');
  const gapSummary = [...new Set(m.gaps.map((g) => g.gap))].sort((a, b) => a - b).join(', ');
  console.log(`CARDS ${label}: grids [${gridSummary}] chips [${[...new Set(m.chips)].join(', ')}] title-dx [${[...new Set(m.titles)].join(', ')}] gaps [${gapSummary}]`);
}

await probe('plans', 'Plans', 'p21-plans.png');
await probe('community', 'Community', 'p21-community.png');
await probe('workspaces', 'Workspaces', 'p21-workspaces.png');

await browser.close(); srv.close();
if (failures.length) {
  console.error('\nCARD-CONSISTENCY FAILURES:');
  for (const f of failures) console.error('  ✗ ' + f);
  process.exit(1);
}
console.log('card-consistency probe: PASS (uniform heights · one pill scale · flush titles · gaps on the three named steps)');
