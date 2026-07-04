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

// ── PHASE-3 LISTS CAPTURES (playwright CSS pierces open shadow roots) ──────
// Filter popover open
await page.locator('ui-stakeholder-table .tb-filter').click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/lists-filter-popover.png` });
await page.keyboard.press('Escape');
// Sort popover open
await page.locator('ui-stakeholder-table .tb-sort').click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/lists-sort-popover.png` });
await page.keyboard.press('Escape');
// a cell editor open (first row's Category display cell mounts a REAL pre-opened ui-select)
await page.locator('ui-stakeholder-table .sheet-row .cell-dd-trigger').first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/lists-cell-dropdown.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
// owners popover (sealed OwnersDisplay) — hover the first owner stack.
// Raw mouse move, not locator.hover(): hover() re-scrolls the cell flush to
// the container edge, which clips the popover.
await page.evaluate(() => {
  const t = document.querySelector('ui-stakeholder-table');
  const sc = t.shadowRoot.querySelector('.sheet-scroll');
  const w = t.shadowRoot.querySelector('.owner-wrap');
  // land the owner stack ~350px left of the container's right edge — clear of
  // the sticky frozen columns on the left, with room for the popover on the right
  sc.scrollLeft += (w.getBoundingClientRect().right - sc.getBoundingClientRect().right) + 350;
});
await page.waitForTimeout(200);
const ownerXY = await page.evaluate(() => {
  const t = document.querySelector('ui-stakeholder-table');
  const r = t.shadowRoot.querySelector('.owner-wrap').getBoundingClientRect();
  return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
});
await page.mouse.move(ownerXY.x, ownerXY.y);
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/lists-owners-popover.png` });
await page.keyboard.press('Escape');
await page.locator('ui-stakeholder-table .sheet-scroll').evaluate((el) => { el.scrollLeft = 0; });
await page.waitForTimeout(200);
// scroll right: frozen columns + edge shadow + the far column set
await page.locator('ui-stakeholder-table .sheet-scroll').evaluate((el) => { el.scrollLeft = 900; });
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/lists-scrolled-x.png` });
await page.locator('ui-stakeholder-table .sheet-scroll').evaluate((el) => { el.scrollLeft = 0; });
// notes modal (page-hosted ui-dialog)
await page.locator('ui-stakeholder-table .sheet-cell.notes').first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/lists-notes-modal.png` });
// close via the dialog API (Escape only lands when focus sits inside the card)
await page.evaluate(() => document.querySelector('ui-dialog')?.close());
await page.waitForTimeout(300);

// ── PHASE-4 STAKEHOLDER MODAL CAPTURES ─────────────────────────────────────
// 1 · CREATE modal via the app-bar context-aware (+) (sealed addNonceFor route)
await page.locator('ui-app-bar ui-icon-button[aria-label="Create new"]').click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p4-create-modal.png` });
// 2 · person toggle ON → Title select + First/Last name row appear
await page.locator('.sh-dialog ui-switch').click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p4-person-toggle.png` });
// 3 · IssueSelector: scroll to Issues, add one company chip + one custom value
await page.locator('.sh-dialog .issue-selector').first().scrollIntoViewIfNeeded();
await page.locator('.sh-dialog .issue-selector').first().locator('ui-chip').first().click();
await page.waitForTimeout(200);
await page.locator('.sh-dialog .issue-selector').first().locator('.issue-custom').click();
await page.keyboard.type('river access');
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p4-issue-selector.png` });
// close the create draft (Escape — a sealed silent-discard dismissal route)
await page.keyboard.press('Escape');
await page.waitForTimeout(400);
// 4 · row edit icon → EDIT FORM directly (sealed edit route, census C1);
//     the read-only profile is reached via the form's "View Stakeholder" flip
await page.locator('ui-stakeholder-table ui-icon-button[aria-label^="Edit"]').first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p4-edit-form.png` });
await page.locator('.sh-dialog ui-button', { hasText: 'View Stakeholder' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p4-profile-view.png` });
// scroll the profile body to the community/notes sections
await page.evaluate(() => {
  const dlg = document.querySelector('.sh-dialog');
  const body = dlg?.shadowRoot?.querySelector('.body');
  if (body) body.scrollTop = body.scrollHeight;
});
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p4-profile-view-bottom.png` });
// 5 · "Edit stakeholder" flips back to the FORM; delete section → confirm dialog
await page.locator('.sh-dialog ui-button', { hasText: 'Edit stakeholder' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p4-edit-form-back.png` });
await page.locator('.sh-dialog .sh-delete ui-button').scrollIntoViewIfNeeded();
await page.locator('.sh-dialog .sh-delete ui-button').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p4-delete-confirm.png` });
// close the confirm (its OWN Escape — the main edit form must stay open)
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p4-edit-after-confirm-close.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(400);

// ── PHASE-5 MAP CAPTURES ───────────────────────────────────────────────────
// 1 · the Map page, default halo view (scorecard open, empty state)
await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Map' }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/p5-map-halo-default.png` });
// 2 · select sh-01 (Mayor Maria Chen) → selected dot + populated scorecard
await page.locator('ui-stakeholder-map .dot[aria-label^="Mayor Maria Chen"]').click();
await page.mouse.move(700, 620); // park the pointer so no stray hover tooltip
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p5-map-selected-scorecard.png` });
// 3 · history mode on sh-01 — the dashed trail + quarter dots (seed carries
//     the sealed FY26 Q1→Q3 trail; other dots must hide)
await page.locator('ui-stakeholder-map ui-chip.history-toggle').click();
await page.mouse.move(700, 620);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p5-map-history-trail.png` });
// exit history via wrapSelect (selecting any dot exits — sealed)
await page.locator('ui-stakeholder-map .dot[aria-label^="Mayor Maria Chen"]').click();
await page.mouse.move(700, 620);
await page.waitForTimeout(300);
// 4 · density mode (per-cell color-mix shading; counts drive the heat)
await page.evaluate(() => {
  document.querySelector('ui-stakeholder-map').setAttribute('map-style', 'density');
});
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p5-map-density.png` });
await page.evaluate(() => {
  document.querySelector('ui-stakeholder-map').setAttribute('map-style', 'halo');
});
// 5 · collapsed scorecard → the reopen tab at top 16 / right 0
await page.locator('ui-stakeholder-map ui-inspector .close-btn').click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p5-map-scorecard-closed.png` });
await page.screenshot({ path: `${OUT}/p5-map-reopen-tab.png`, clip: { x: 1040, y: 60, width: 400, height: 300 } });
await page.locator('ui-stakeholder-map .map-detail-reopen').click();
await page.waitForTimeout(400);
// back to Lists so the shell/rail captures below stay phase-stable
await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'List' }).click();
await page.waitForTimeout(500);

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

// ── PHASE-6 WORKSPACE SHELL-STATE + SCORING CAPTURES ───────────────────────
await page.goto('http://127.0.0.1:4174/app.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
// 1 · the workspace switcher menu open (sealed OpenWorkspaceModal semantics:
//     grouped by segment, per-workspace counts, Switch to / Open → CTAs)
await page.locator('#ws-select-anchor').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p6-ws-menu-open.png` });
// 2 · switch to Hawk (ws-gapp-na) → Lists filtered to its 12 stakeholders
await page.locator('ui-menu ui-menu-item', { hasText: 'Hawk' }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/p6-lists-hawk.png` });
// 3 · create a stakeholder FROM the workspace (sealed auto-assign) — it lands
//     unscored, so the sealed nav count badge appears on Scoring
await page.locator('ui-app-bar ui-icon-button[aria-label="Create new"]').click();
await page.waitForTimeout(500);
await page.keyboard.type('Riverbend Chamber of Commerce');
await page.locator('.sh-dialog ui-button', { hasText: 'Create stakeholder' }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p6-nav-unscored-badge.png`, clip: { x: 0, y: 0, width: 300, height: 620 } });
// 4 · the Scoring matrix (my editable sticky column · read-only teammates ·
//     Weighted (x, y) · Relationship) for the active workspace
await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Scoring' }).first().click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/p6-scoring-matrix.png` });
// 5 · team bar closeup: weight sliders (baseline ticks) + tri-color % tints
//     (seed carries over/baseline/under weights: 1.5 · 1.2 · 1.0 · 0.8 · 0.7)
await page.screenshot({ path: `${OUT}/p6-team-bar.png`, clip: { x: 300, y: 40, width: 1140, height: 260 } });
// 6 · first-touch on the new stakeholder's own unscored cell: one x step-up
//     creates the record whole (x=1, y=0 — the sealed correction)
await page.locator('.scoring-table tbody tr', { hasText: 'Riverbend' })
  .locator('ui-icon-button[aria-label="Increase x"]').click();
await page.waitForTimeout(400);
const firstTouch = await page.evaluate(() => {
  const scores = JSON.parse(localStorage.getItem('hpsm:scores') || '{}');
  const row = Object.entries(scores).find(([sid, r]) => sid.startsWith('sh-') && sid.length > 8);
  return row ? row[1] : null;
});
console.log('P6 first-touch record (expect x:1, y:0, createdAt=updatedAt):', JSON.stringify(firstTouch));
await page.screenshot({ path: `${OUT}/p6-first-touch-cell.png`, clip: { x: 300, y: 280, width: 800, height: 200 } });
// 6b · horizontal scroll: the Stakeholder column AND my editable column stay
//      pinned (sealed two-sticky-column rule) while other teammates scroll
await page.locator('.scoring-table-wrap').evaluate((el) => { el.scrollLeft = 260; });
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p6-matrix-scrolled-x.png` });
await page.locator('.scoring-table-wrap').evaluate((el) => { el.scrollLeft = 0; });
await page.waitForTimeout(200);
// 7 · the add-teammate dialog (make-real affordance) with the typeahead open
await page.locator('.team-add').click();
await page.waitForTimeout(500);
await page.locator('ui-autocomplete input').click();
await page.keyboard.type('mar');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p6-add-teammate.png` });
await page.evaluate(() => document.querySelectorAll('ui-dialog').forEach(d => d.close && d.close()));
await page.waitForTimeout(300);
// 8 · switch back to Master via the selector: Scoring nav item must HIDE
//     (sealed hideWhenMaster) and the view redirects off scoring
await page.locator('#ws-select-anchor').click();
await page.waitForTimeout(300);
await page.locator('ui-menu ui-menu-item', { hasText: 'Master' }).click();
await page.waitForTimeout(600);
const scoringVisible = await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Scoring' }).count();
console.log('P6 Scoring nav on Master (expect 0):', scoringVisible);
await page.screenshot({ path: `${OUT}/p6-master-back.png` });

await browser.close(); srv.close();
console.log('shots written to', OUT);
