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
await page.locator('.map-scorecard ui-chip.history-toggle').click();
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
await page.locator('ui-inspector.map-scorecard .close-btn').click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p5-map-scorecard-closed.png` });
await page.screenshot({ path: `${OUT}/p5-map-reopen-tab.png`, clip: { x: 1040, y: 60, width: 400, height: 300 } });
await page.locator('.map-wrap .map-detail-reopen').click();
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

// ── PHASE-7 PLANS CAPTURES ─────────────────────────────────────────────────
// 1 · landing cards (Master: all plans; sealed card anatomy + footer)
await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Plans' }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/p7-plan-landing-cards.png` });
// 1b · table mode ("See all") + filter popover
await page.locator('.plan-toolbar ui-button', { hasText: 'See all' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p7-plan-landing-table.png` });
await page.locator('.plan-toolbar ui-button', { hasText: 'See all' }).click();
await page.locator('#plan-filter-btn').click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p7-plan-filter-popover.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
// 2 · the EDITOR: metadata rail · five sections · right aside
await page.locator('.plan-card-actions ui-button', { hasText: 'Edit' }).first().click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/p7-plan-editor-top.png` });
// element-6 table + a Fit override popover open (manager = seed user u-alex)
await page.locator('.plan-sh-table').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.locator('.fit-cell').first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p7-plan-fit-popover.png` });
// override to Low → the ·set mark; the row RE-SORTS live (effective band
// drives the binding-schema order), so relocate it via the ·set mark
await page.locator('ui-menu.fit-menu ui-menu-item', { hasText: 'Low' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p7-plan-fit-overridden.png` });
await page.locator('.fit-cell:has(.fit-mark-set)').first().scrollIntoViewIfNeeded();
await page.locator('.fit-cell:has(.fit-mark-set)').first().click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p7-plan-fit-revert-item.png` });
await page.locator('ui-menu.fit-menu ui-menu-item', { hasText: 'Use suggestion' }).click();
await page.waitForTimeout(300);
// 3 · goalNotes PERSISTED AFTER REOPEN (the sealed bug-fix proof)
await page.locator('.plan-goal-item ui-textarea textarea').first().scrollIntoViewIfNeeded();
await page.locator('.plan-goal-item ui-textarea textarea').first().click();
await page.keyboard.type('Anchor the outfall-permit narrative on this goal through Q4.');
await page.waitForTimeout(400);
await page.locator('.plan-editor-bar ui-button', { hasText: 'All plans' }).click();
await page.waitForTimeout(400);
await page.locator('.plan-card-actions ui-button', { hasText: 'Edit' }).first().click();
await page.waitForTimeout(600);
await page.locator('.plan-goal-item').first().scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p7-plan-goalnotes-persisted.png` });
const goalNotes = await page.evaluate(() => {
  const p = (JSON.parse(localStorage.getItem('hpsm:plans') || '[]'))[0] || {};
  return { notes: p.goalNotes, junkKeys: Object.keys(p).filter(k => /^[0-8]$/.test(k)) };
});
console.log('P7 goalNotes after reopen (expect the typed note, zero junk keys):',
  JSON.stringify(goalNotes));
// 4 · the community linker (right aside): linked row + add autocomplete open
// (the linker lives in the LEFT metadata rail — sealed placement, Phase-7 audit)
await page.locator('.plan-aside .plan-community').first().scrollIntoViewIfNeeded();
await page.locator('.plan-community ui-button', { hasText: 'Add Community Investment' }).click();
await page.waitForTimeout(400);
await page.locator('.plan-community ui-autocomplete input').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p7-plan-community-linker.png` });
await page.keyboard.press('Escape');
// 4b · add-stakeholder menu (three sealed entries)
await page.locator('#plan-add-sh-btn').scrollIntoViewIfNeeded();
await page.locator('#plan-add-sh-btn').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p7-plan-add-stakeholder-menu.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
// 5 · REVIEW mode: header (goal chip · stage · owners · formula bar) + doc
await page.locator('.plan-editor-bar ui-button', { hasText: 'Review' }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/p7-plan-review-top.png` });
await page.locator('.plan-review-section', { hasText: 'Stakeholders In This Plan' }).scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p7-plan-review-stakeholders.png` });
await page.locator('.plan-review-section', { hasText: 'Community Investment' }).scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p7-plan-review-tail.png` });

// ── PHASE-8 COMMUNITY CAPTURES ─────────────────────────────────────────────
// 1 · landing cards (4 seed applications; rollup strip; vote groups; footer)
await page.locator('.plan-editor-bar ui-button', { hasText: 'Plans' }).click().catch(() => {});
await page.waitForTimeout(300);
await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Community' }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/p8-community-landing-cards.png` });
// 1b · table mode + filter popover
await page.locator('.plan-toolbar ui-button', { hasText: 'See all' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p8-community-landing-table.png` });
await page.locator('.plan-toolbar ui-button', { hasText: 'See all' }).click();
await page.locator('#comm-filter-btn').click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p8-community-filter-popover.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
// 2 · a vote lands (u-alex casts "against" on the PAC application)
await page.locator('.comm-card', { hasText: 'Oregon Modernization PAC' })
  .locator('.comm-vote-against').click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p8-community-card-voted.png`, clip: { x: 300, y: 80, width: 1140, height: 620 } });
// 3 · the read-only profile (asPage) with the manager Approve action
await page.locator('.comm-card', { hasText: 'Willamette River Cleanup Day' })
  .locator('.plan-card-actions ui-button', { hasText: 'Review' }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p8-community-profile.png` });
// 3b · Approve (manager u-alex): stage flips, the action retires
await page.locator('.comm-profile ui-button', { hasText: 'Approve' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p8-community-profile-approved.png` });
// 4 · the stakeholder BRIDGE: a Stakeholders pill opens the shared record
await page.locator('.comm-profile .prof-grid ui-chip[variant="assist"]').first().click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p8-community-bridge-profile.png` });
await page.evaluate(() => document.querySelectorAll('ui-dialog').forEach(d => d.close && d.close()));
await page.waitForTimeout(400);
// 5 · the record editor (asPage): sections · sliders · chips · counters
await page.locator('.comm-card', { hasText: 'LATAM E-Waste' })
  .locator('.plan-card-actions ui-button', { hasText: 'Edit' }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p8-community-editor-top.png` });
await page.locator('.comm-form .cm-valuescore').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p8-community-editor-alignment.png` });
await page.locator('.comm-form .comm-attest').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p8-community-editor-risk.png` });
await page.locator('.comm-editor ui-button', { hasText: 'All community' }).click();
await page.waitForTimeout(300);
// 6 · CREATE via the shell (+): blank form, Create disabled, "{N} left"
await page.locator('ui-app-bar ui-icon-button[aria-label="Create new"]').click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p8-community-create-blank.png` });
await page.locator('.comm-editor ui-button', { hasText: 'All community' }).click();
await page.waitForTimeout(300);

// ── PHASE-9 WORKSPACES (SETUP) CAPTURES ────────────────────────────────────
// 1 · landing: toolbar + segment-grouped card grid + footer
await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Workspaces' }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/p9-workspaces-landing.png` });
// 1b · Segments filter popover (sealed head + checkable options)
await page.locator('#setup-filter-seg').click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p9-filter-popover.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
// 2 · CREATE modal via the shell (+): sealed blank (CF · Legal / GA&PP),
//     created-by line, Create disabled while the name is empty
await page.locator('ui-app-bar ui-icon-button[aria-label="Create new"]').click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p9-create-modal.png` });
// 2b · the conditional State select (scope → State)
await page.locator('.ws-modal ui-select[aria-label="Scope (optional)"]').click();
await page.waitForTimeout(300);
await page.locator('.ws-modal ui-select[aria-label="Scope (optional)"] ui-option', { hasText: 'State' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p9-create-scope-state.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
// 3 · EDIT modal via the card name (sealed name-click route)
await page.locator('.ws-card', { hasText: 'Hawk' }).locator('.plan-card-title').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p9-edit-modal.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
// 4 · DELETE confirm (danger; sealed copy + the plans-cascade disclosure on
//     Hawk, which carries the seed plan)
await page.locator('.ws-card', { hasText: 'Hawk' }).locator('ui-icon-button[aria-label="Delete"]').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p9-delete-confirm.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// ── PHASE-10 HELP CAPTURES ─────────────────────────────────────────────────
// 1 · top of the reading column: prelude + the framework funnel figure/steps
await page.locator('ui-sidebar ui-sidebar-item[slot="footer"]', { hasText: 'Help' }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/p10-help-framework.png` });
// 2 · how to read the map: spectrum strip + the three help-cards
await page.locator('.help-spectrum').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p10-help-map-guide.png` });
// 3 · the 24-zone grid figure + axis legend
await page.locator('.help-grid-figure').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p10-help-zone-grid.png` });
// 4 · strategy reference (14 zone-spine cards, engine-single-sourced)
await page.locator('.help-strat-grid').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p10-help-strategy.png` });
// 5 · scores → coordinates formula panel (page tail)
await page.locator('.help-formula').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p10-help-formula.png` });

// ── PHASE-11 SETTINGS CAPTURES ─────────────────────────────────────────────
// The sealed entry: the identity-footer ProfileMenu (manager-gated Settings).
await page.locator('#me-anchor').click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p11-profile-menu.png` });
await page.locator('ui-menu.profile-menu ui-menu-item', { hasText: 'Settings' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p11-settings-identity.png` });
await page.locator('.settings-nav ui-list-item', { hasText: 'Fiscal Calendar' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p11-settings-fiscal.png` });
await page.locator('.settings-nav ui-list-item', { hasText: 'Your Structure' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p11-settings-structure.png` });
await page.locator('.settings-nav ui-list-item', { hasText: 'Geography' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p11-settings-geography.png` });
await page.locator('.settings-nav ui-list-item', { hasText: 'Team Management' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p11-settings-management.png` });
await page.locator('.settings-nav ui-list-item', { hasText: 'Design' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p11-settings-design.png` });
await page.locator('.settings-nav ui-list-item', { hasText: 'Integrations' }).click();
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/p11-settings-integrations.png` });

// ── PHASE-12 MESSAGING CAPTURES ────────────────────────────────────────────
// 1 · the right-edge sidebar over the current view (conversation list)
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
await page.locator('ui-app-bar ui-icon-button[aria-label="Messages"]').click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p12-sidebar-list.png` });
// 2 · a thread open in the sidebar (head + bubbles + composer)
await page.locator('.messaging-sidebar .conv-row', { hasText: 'Jordan Kim, Sam Okafor' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p12-sidebar-thread.png` });
// 3 · the full Messages page via the expand control (J2 carry-over)
await page.locator('.messaging-sidebar ui-icon-button[aria-label="Open full Messages page"]').click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p12-page-thread.png` });
// 4 · the mention popover open in the composer
await page.locator('.messaging-page .composer ui-textarea textarea').click();
await page.keyboard.type('@Mar');
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p12-mention-pop.png` });
await page.keyboard.press('Escape');
await page.keyboard.press('ControlOrMeta+a');
await page.keyboard.press('Backspace');
// 5 · the read-only Reminders system thread (ruling surface)
await page.locator('.messaging-page .conv-row', { hasText: 'Reminders' }).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p12-system-thread.png` });
// 6 · the new-conversation modal
await page.locator('.messaging-list-head ui-button').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p12-new-conversation.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);
// 7 · the empty thread pane (no conversation selected on a fresh view)
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.locator('#me-anchor').click();
await page.waitForTimeout(300);
await page.locator('ui-menu.profile-menu ui-menu-item', { hasText: 'Messages' }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p12-page-empty.png` });

// ── PHASE-13 PROFILES CAPTURES ─────────────────────────────────────────────
// 1 · the people panel (UserListPopup) over the app
await page.locator('ui-app-bar .user-stack').click({ position: { x: 10, y: 12 } });
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p13-people-popup.png` });
// 2 · another user's profile page (no Edit; ws tab)
await page.locator('.people-popup .people-row', { hasText: 'Jordan Kim' }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/p13-profile-other.png` });
// 3 · own profile (hero Edit + manager badge)
await page.locator('#me-anchor').click();
await page.waitForTimeout(300);
await page.locator('ui-menu.profile-menu ui-menu-item', { hasText: 'View profile' }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p13-profile-self.png` });
// 4 · the Relationships tab (pill cells) — last tab
await page.locator('.profile-tabs ui-tab').nth(3).click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p13-profile-sh-tab.png` });
// 5 · filter popover open on the SEP tab
await page.locator('.profile-tabs ui-tab').nth(1).click();
await page.waitForTimeout(300);
await page.locator('#profile-filter-btn').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p13-profile-filter.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(200);
// 6 · the EditProfileModal (photo row + 8 swatches + cascade chips)
await page.locator('.profile-hero ui-button', { hasText: 'Edit profile' }).click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p13-edit-profile.png` });
// markets picked → the Regions cascade appears
await page.locator('.edit-profile-modal .profile-chip-pick ui-chip').first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p13-edit-profile-cascade.png` });
await page.keyboard.press('Escape');
await page.waitForTimeout(300);

// ── PHASE-14 RECORD SCAFFOLD CAPTURES ──────────────────────────────────────
// 1 · the Map scorecard rail (page-hosted ui-inspector) with a selection
await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Map' }).click();
await page.waitForTimeout(600);
await page.locator('ui-stakeholder-map .dot[aria-label^="Mayor Maria Chen"]').click();
await page.mouse.move(700, 620);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p14-map-scorecard.png` });
// 2 · census B3 make-real: Open record → the record.stakeholder page (read)
await page.locator('ui-inspector.map-scorecard ui-icon-button[aria-label="Open record"]').click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/p14-record-stakeholder.png` });
// 3 · the SAME section in edit mode (read↔edit parity)
await page.locator('.record-topbar .record-edit-btn').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p14-record-edit.png` });
await page.locator('.record-topbar .record-edit-btn').click();
await page.waitForTimeout(300);
// 4 · both rails collapsed independently
await page.locator('ui-inspector.record-rail .close-btn').click();
await page.waitForTimeout(400);
await page.locator('ui-sidebar.record-nav').evaluate((el) => el.shadowRoot.querySelector('.toggle-btn').click());
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p14-record-rails-collapsed.png` });
await page.locator('.record-rail-reopen').click();
await page.waitForTimeout(300);
// 5 · the workspace record with the LIVE embedded table
await page.locator('.record-topbar ui-button.plan-back').click();
await page.waitForTimeout(400);
await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Workspaces' }).click();
await page.waitForTimeout(500);
await page.locator('.ws-card', { hasText: 'Google Beam Tour' }).locator('ui-icon-button[aria-label="Open workspace record"]').click();
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/p14-record-workspace.png` });
await page.locator('ui-sidebar.record-nav ui-sidebar-item', { hasText: 'Stakeholders' }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/p14-record-workspace-table.png` });
// 6 · SampleRecord — the standalone tuning preview (record.html)
await page.goto('http://127.0.0.1:4174/record.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: `${OUT}/p14-sample-record.png` });
await page.locator('ui-sidebar.record-nav ui-sidebar-item', { hasText: 'Field stack' }).click();
await page.locator('.record-topbar .record-edit-btn').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p14-sample-edit.png` });
await page.locator('ui-sidebar.record-nav ui-sidebar-item', { hasText: 'Table embed' }).click();
await page.waitForTimeout(700);
await page.screenshot({ path: `${OUT}/p14-sample-table-embed.png` });

// ── PHASE-15 WORKHQ CAPTURES ───────────────────────────────────────────────
// Arrange a deterministic signal state (the seed ships no cold/dev fixtures):
// one HIGH stale + one MEDIUM staler (gated out), a development, one
// unscored-by-me, one awaiting vote — then capture the three sealed modes and
// the ruled ignore-review popover.
await page.goto('http://127.0.0.1:4174/app.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.evaluate(() => {
  const shs = JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]');
  const hi = shs.find(s => s.id === 'sh-01');
  const hi2 = shs.find(s => s.id === 'sh-02');
  const med = shs.find(s => s.id === 'sh-04');
  hi.lastContact = '2026-01-10';
  hi2.lastContact = '2026-03-15';
  med.lastContact = '2025-12-01';
  hi.notesHistory = [...(hi.notesHistory || []), {
    id: 'n-shot15a', body: 'Filed a new comment letter on the outfall permit docket',
    at: '2026-07-04T10:00:00.000Z', by: 'u-jordan',
  }];
  hi2.notesHistory = [...(hi2.notesHistory || []), {
    id: 'n-shot15b', body: 'Committee hearing moved up to July 21 — briefing needed',
    at: '2026-07-03T09:00:00.000Z', by: 'u-alex',
  }];
  localStorage.setItem('hpsm:stakeholders', JSON.stringify(shs));
  const scores = JSON.parse(localStorage.getItem('hpsm:scores') || '{}');
  if (scores['sh-03']) delete scores['sh-03']['tm-alex'];
  if (scores['sh-05']) delete scores['sh-05']['tm-alex'];
  localStorage.setItem('hpsm:scores', JSON.stringify(scores));
  const comm = JSON.parse(localStorage.getItem('hpsm:community') || '[]');
  const pac = comm.find(x => x.id === 'ca-03');
  if (pac && pac.votes) delete pac.votes['u-alex'];
  localStorage.setItem('hpsm:community', JSON.stringify(comm));
  localStorage.removeItem('hp_workhq_mode');
});
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
// 1 · split mode (default): band above the table, four cards, divider
await page.screenshot({ path: `${OUT}/p15-workhq-split.png` });
// 2 · intel mode: the band takes over, cards re-track to 2 columns
await page.locator('.intel-modes ui-icon-button[aria-label="Expand intelligence"]').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p15-workhq-intel.png` });
// 3 · ignore a cold entry, then open the "Ignored (1)" review popover
await page.locator('.intel-card[data-card="cold"] ui-list-item ui-icon-button[aria-label^="Ignore:"]').first().click();
await page.waitForTimeout(300);
await page.locator('.intel-card[data-card="cold"] .intel-ignored-btn').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p15-workhq-ignored.png` });
// restore it (leaves the demo store clean for the table capture)
await page.locator('ui-menu.intel-ignored-menu[open] ui-menu-item').first().click();
await page.waitForTimeout(300);
// 4 · table (collapsed) mode: head-only band with the summary + mix/plans chips
await page.locator('.intel-modes ui-icon-button[aria-label="Expand table"]').click();
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/p15-workhq-table.png` });
await page.screenshot({ path: `${OUT}/p15-workhq-table-head.png`, clip: { x: 0, y: 0, width: 1440, height: 260 } });

await browser.close(); srv.close();
console.log('shots written to', OUT);
