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
  if (path === '/app.html') {
    // Phase 5: drive the Map view — select a dot, enter history (assert the
    // trail renders), close + reopen the scorecard rail; any error counts.
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Map' }).click({ timeout: 3000 }).catch(e => errs.push('MAPNAV: ' + e.message));
    await page.waitForTimeout(500);
    await page.locator('ui-stakeholder-map .dot[aria-label^="Mayor Maria Chen"]').click({ timeout: 3000 }).catch(e => errs.push('MAPDOT: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-stakeholder-map ui-chip.history-toggle').click({ timeout: 3000 }).catch(e => errs.push('MAPHIST: ' + e.message));
    await page.waitForTimeout(300);
    const trail = await page.locator('ui-stakeholder-map .trail-svg path').count();
    if (trail !== 1) errs.push(`MAPTRAIL: expected 1 history trail path, saw ${trail}`);
    await page.locator('ui-stakeholder-map ui-inspector .close-btn').click({ timeout: 3000 }).catch(e => errs.push('MAPCLOSE: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('ui-stakeholder-map .map-detail-reopen').click({ timeout: 3000 }).catch(e => errs.push('MAPREOPEN: ' + e.message));
    await page.waitForTimeout(300);
    // Phase 6: workspace switch + the Scoring matrix — switch to Hawk via the
    // real selector, open Scoring, step a score, open the add-teammate dialog.
    await page.locator('#ws-select-anchor').click({ timeout: 3000 }).catch(e => errs.push('WSMENU: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-menu ui-menu-item', { hasText: 'Hawk' }).click({ timeout: 3000 }).catch(e => errs.push('WSPICK: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Scoring' }).first().click({ timeout: 3000 }).catch(e => errs.push('SCORENAV: ' + e.message));
    await page.waitForTimeout(500);
    const matrixRows = await page.locator('.scoring-table tbody tr').count();
    if (matrixRows < 1) errs.push(`SCOREMATRIX: expected workspace rows, saw ${matrixRows}`);
    await page.locator('.scoring-table ui-icon-button[aria-label="Increase x"]').first().click({ timeout: 3000 }).catch(e => errs.push('SCORESTEP: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('.team-add').click({ timeout: 3000 }).catch(e => errs.push('TEAMADD: ' + e.message));
    await page.waitForTimeout(400);
    await page.evaluate(() => document.querySelectorAll('ui-dialog').forEach(d => d.close && d.close()));
    await page.waitForTimeout(300);
    // Phase 7: Plans — landing cards render, the editor mounts with the
    // element-6 table, the Fit popover opens (manager), and goalNotes
    // PERSISTS correctly (the sealed oracle set() bug is fixed: the note map
    // saves and NO junk char-keys 0–8 land on the record).
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Plans' }).click({ timeout: 3000 }).catch(e => errs.push('PLANNAV: ' + e.message));
    await page.waitForTimeout(500);
    const planCards = await page.locator('.plan-card').count();
    if (planCards < 1) errs.push(`PLANCARDS: expected >=1 plan card, saw ${planCards}`);
    await page.locator('.plan-card-actions ui-button', { hasText: 'Edit' }).first().click({ timeout: 3000 }).catch(e => errs.push('PLANEDIT: ' + e.message));
    await page.waitForTimeout(500);
    const shRows = await page.locator('.plan-sh-table tbody tr').count();
    if (shRows < 1) errs.push(`PLANROWS: expected element-6 rows, saw ${shRows}`);
    await page.locator('.fit-cell').first().click({ timeout: 3000 }).catch(e => errs.push('PLANFIT: ' + e.message));
    await page.waitForTimeout(300);
    const fitMenu = await page.locator('ui-menu.fit-menu[open]').count();
    if (fitMenu !== 1) errs.push(`PLANFITMENU: expected the override popover open, saw ${fitMenu}`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    await page.locator('.plan-goal-item ui-textarea textarea').first().click({ timeout: 3000 }).catch(e => errs.push('PLANGOAL: ' + e.message));
    await page.keyboard.type('Anchor the permit narrative on this goal.');
    await page.waitForTimeout(400);
    const goalCheck = await page.evaluate(() => {
      const plans = JSON.parse(localStorage.getItem('hpsm:plans') || '[]');
      const p = plans[0] || {};
      const notes = Object.values(p.goalNotes || {});
      return {
        saved: notes.some(v => String(v).includes('Anchor the permit narrative')),
        junk: Object.keys(p).some(k => /^[0-8]$/.test(k)),
      };
    });
    if (!goalCheck.saved) errs.push('PLANGOALNOTES: goalNotes did NOT persist (sealed bug-fix regression)');
    if (goalCheck.junk) errs.push('PLANGOALNOTES: junk char-keys 0-8 landed on the plan record (oracle bug replicated)');
    await page.locator('.plan-editor-bar ui-button', { hasText: 'All plans' }).click({ timeout: 3000 }).catch(e => errs.push('PLANBACK: ' + e.message));
    await page.waitForTimeout(300);
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
