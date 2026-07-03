// Visual gate — render the app and capture screenshots for design review.
// Usage: node scripts/shots.mjs [outdir]
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
await new Promise(r => srv.listen(4174, r));


async function measureAxis(page, label) {
  const centers = await page.evaluate(() => {
    const cx = (el) => { const r = el.getBoundingClientRect(); return +(r.left + r.width / 2).toFixed(1); };
    const sb = document.querySelector('ui-sidebar');
    const out = {};
    const t = sb.shadowRoot.querySelector('.toggle-btn'); if (t) out.toggle = cx(t);
    const mark = document.querySelector('.brand .mark'); if (mark && mark.getBoundingClientRect().width) out.mark = cx(mark);
    [...document.querySelectorAll('ui-sidebar > ui-sidebar-item')].slice(0, 3).forEach((it, i) => {
      const w = it.shadowRoot.querySelector('.icon-wrap'); if (w) out['icon' + i] = cx(w);
    });
    const av = document.querySelector('ui-sidebar ui-avatar'); if (av) out.avatar = cx(av);
    return out;
  });
  console.log('AXIS', label, JSON.stringify(centers));
  return centers;
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

await page.goto('http://127.0.0.1:4174/app.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: `${OUT}/app-expanded.png` });
await page.screenshot({ path: `${OUT}/rail-expanded.png`, clip: { x: 0, y: 0, width: 300, height: 900 } });
await measureAxis(page, 'expanded');

// collapse the sidebar via the panel toggle (shadow DOM part)
await page.evaluate(() => {
  const sb = document.querySelector('ui-sidebar');
  sb.shadowRoot.querySelector('.toggle-btn').click();
});
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/app-collapsed.png` });
await page.screenshot({ path: `${OUT}/rail-collapsed.png`, clip: { x: 0, y: 0, width: 120, height: 900 } });
await measureAxis(page, 'collapsed');
// hover the collapsed header: the mark must swap to the open-panel icon (ONE spot)
await page.evaluate(() => {
  const h = document.querySelector('ui-sidebar').shadowRoot.querySelector('.header');
  h.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
});
await page.hover('ui-sidebar');
await page.mouse.move(32, 28);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/rail-collapsed-hover.png`, clip: { x: 0, y: 0, width: 120, height: 120 } });

// re-expand + zoom the chrome (header + sidebar top) for close inspection
await page.evaluate(() => {
  const sb = document.querySelector('ui-sidebar');
  sb.shadowRoot.querySelector('.toggle-btn').click();
});
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/app-chrome-closeup.png`, clip: { x: 0, y: 0, width: 700, height: 320 } });

// wireframes for side-by-side conformance
await page.goto('http://127.0.0.1:4174/design-system/wireframes.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/wireframe-list.png`, clip: { x: 0, y: 200, width: 1440, height: 700 } });

await browser.close(); srv.close();
console.log('shots written to', OUT);
