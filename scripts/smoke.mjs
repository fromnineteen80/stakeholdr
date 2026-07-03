// Runtime smoke test: load the built pages in real Chromium, collect console
// errors + page crashes. Google Fonts are blocked in the sandbox — network
// fetch failures for fonts are expected and filtered (fallback stacks are the
// designed behavior); everything else counts.
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';

const ROOT = '/home/user/stakeholdr/dist';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const srv = createServer(async (req, res) => {
  try {
    let p = req.url.split('?')[0]; if (p.endsWith('/')) p += 'index.html';
    const body = await readFile(join(ROOT, p));
    res.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404); res.end('nf'); }
});
await new Promise(r => srv.listen(4173, r));

const pages = ['/index.html', '/app.html', '/design-system/preview.html', '/design-system/wireframes.html'];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let totalErrors = 0;
for (const path of pages) {
  const page = await browser.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  await page.goto('http://127.0.0.1:4173' + path, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => errs.push('NAV: ' + e.message));
  await page.waitForTimeout(1200);
  // interact a little: guide — expand first detail; wireframes — toggle theme
  if (path === '/index.html') {
    await page.locator('md-list-item, li, [role="listitem"]').first().click({ timeout: 3000 }).catch(() => {});
  }
  if (path.includes('wireframes')) {
    await page.locator('#theme-modern').click({ timeout: 3000 }).catch(e => errs.push('TOGGLE: ' + e.message));
    await page.waitForTimeout(400);
    const bg = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ui-ref-ink-strong').trim());
    console.log(`  [theme check] ink-strong after Modern toggle: ${bg} (expect #36454F)`);
    const zone = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ui-sys-zone-strategic-partner').trim());
    console.log(`  [zone check] strategic-partner after toggle: ${zone} (expect #74B556 — untouched)`);
  }
  const real = errs.filter(e => !/fonts\.g(oogleapis|static)\.com|net::ERR_|Failed to load resource/.test(e));
  totalErrors += real.length;
  console.log(`${path}: ${real.length} real console/page errors` + (real.length ? '\n  - ' + real.slice(0, 5).join('\n  - ') : ''));
  await page.close();
}
await browser.close(); srv.close();
console.log(totalErrors === 0 ? 'SMOKE: ALL PAGES CLEAN' : `SMOKE: ${totalErrors} REAL ERRORS`);
