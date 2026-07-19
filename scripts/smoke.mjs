// Runtime smoke test: load the built pages in real Chromium, collect console
// errors + page crashes. Google Fonts are blocked in the sandbox — network
// fetch failures for fonts are expected and filtered (fallback stacks are the
// designed behavior); everything else counts.
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join } from 'path';
// Phase 19: the P19 export probe unzip-validates the captured .docx bytes
// with the Phase-18 zip reader, node-side.
import { listZipEntries, readZipEntry } from '../src/app/import/xlsx-read.js';

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

const pages = ['/index.html', '/app.html', '/record.html', '/design-system/preview.html', '/design-system/wireframes.html'];
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
let totalErrors = 0;
for (const path of pages) {
  const page = await browser.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  // PHASE 23 HARNESS BOOTSTRAP (declared): the app now boots to the LOGIN
  // GATE when no session exists, and every prior drive assumes a signed-in
  // app — so the harness establishes the session BEFORE any app script runs
  // (u-alex, the drives' actor). The schema stamp must ride along or
  // store.js's migration sweeps the injected key (scale-probe precedent).
  // The gate itself is exercised by the dedicated P23 drive below, which
  // runs on a clean context with NO seeded session.
  if (path === '/app.html') {
    await page.addInitScript(() => {
      localStorage.setItem('hpsm:__schema', 'v10-rebuild');
      localStorage.setItem('hpsm:session', JSON.stringify({ userId: 'u-alex' }));
    });
  }
  await page.goto('http://127.0.0.1:4173' + path, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => errs.push('NAV: ' + e.message));
  await page.waitForTimeout(1200);
  // interact a little: guide — expand first detail; wireframes — toggle theme
  if (path === '/index.html') {
    await page.locator('md-list-item, li, [role="listitem"]').first().click({ timeout: 3000 }).catch(() => {});
  }
  if (path === '/app.html') {
    // Phase 20: FIRST-RUN ONBOARDING TOUR — a fresh profile (each smoke page
    // is a fresh context) opens the coachmark once (600ms settle < the 1200ms
    // wait above); Next advances; Skip is present mid-tour (sealed bar); Esc
    // skips FOR GOOD (hpsm:__tourSeen stamped); a reload must NOT re-show it.
    if (await page.locator('ui-coachmark.app-tour[open]').count() !== 1) errs.push('P20TOUR: the first-run coachmark did not appear on a fresh profile');
    const p20C1 = await page.evaluate(() => document.querySelector('ui-coachmark.app-tour')?.shadowRoot.querySelector('.counter').textContent || '');
    if (p20C1 !== '1 of 7') errs.push(`P20TOURCOUNT: expected the step counter "1 of 7", saw "${p20C1}"`);
    await page.evaluate(() => document.querySelector('ui-coachmark.app-tour')?.shadowRoot.querySelector('.next').click());
    await page.waitForTimeout(300);
    const p20C2 = await page.evaluate(() => document.querySelector('ui-coachmark.app-tour')?.shadowRoot.querySelector('.counter').textContent || '');
    if (p20C2 !== '2 of 7') errs.push(`P20TOURNEXT: Next must advance to "2 of 7", saw "${p20C2}"`);
    const p20Skip = await page.evaluate(() => { const s = document.querySelector('ui-coachmark.app-tour')?.shadowRoot.querySelector('.skip'); return !!s && !s.classList.contains('hidden'); });
    if (!p20Skip) errs.push('P20TOURSKIP: the sealed-bar Skip button is missing mid-tour');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    if (await page.locator('ui-coachmark.app-tour[open]').count() !== 0) errs.push('P20TOURESC: Escape did not skip the tour');
    const p20Seen = await page.evaluate(() => localStorage.getItem('hpsm:__tourSeen'));
    if (p20Seen !== '1') errs.push(`P20TOURFLAG: skip must stamp hpsm:__tourSeen=1, saw ${JSON.stringify(p20Seen)}`);
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 }).catch(e => errs.push('P20TOURRELOAD: ' + e.message));
    await page.waitForTimeout(1200);
    if (await page.locator('ui-coachmark.app-tour[open]').count() !== 0) errs.push('P20TOURONCE: the skipped tour re-appeared after a reload');
    // Phase 5 (selectors recomposed at Phase 14 — the PAGE hosts the sealed
    // scorecard rail now): drive the Map view — select a dot, enter history
    // (assert the trail renders), close + reopen the scorecard rail.
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Map' }).click({ timeout: 3000 }).catch(e => errs.push('MAPNAV: ' + e.message));
    await page.waitForTimeout(500);
    await page.locator('ui-stakeholder-map .dot[aria-label^="Mayor Maria Chen"]').click({ timeout: 3000 }).catch(e => errs.push('MAPDOT: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('.map-scorecard ui-chip.history-toggle').click({ timeout: 3000 }).catch(e => errs.push('MAPHIST: ' + e.message));
    await page.waitForTimeout(300);
    const trail = await page.locator('ui-stakeholder-map .trail-svg path').count();
    if (trail !== 1) errs.push(`MAPTRAIL: expected 1 history trail path, saw ${trail}`);
    await page.locator('ui-inspector.map-scorecard .close-btn').click({ timeout: 3000 }).catch(e => errs.push('MAPCLOSE: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('.map-wrap .map-detail-reopen').click({ timeout: 3000 }).catch(e => errs.push('MAPREOPEN: ' + e.message));
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
    // Phase 8: Community — landing cards render with the rollup strip; a vote
    // TOGGLES (u-alex re-clicks his seeded ca-01 "for" → cleared) and the
    // make-real upsert stamps updatedAt; the manager Approve action moves a
    // Proposed application to Approved with approverId/approvedAt stamps.
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Community' }).click({ timeout: 3000 }).catch(e => errs.push('COMMNAV: ' + e.message));
    await page.waitForTimeout(500);
    const commCards = await page.locator('.comm-card').count();
    if (commCards < 4) errs.push(`COMMCARDS: expected the 4 seed applications, saw ${commCards}`);
    const rollups = await page.locator('.comm-rollup-inline > span').count();
    if (rollups !== 3) errs.push(`COMMROLLUP: expected 3 rollup groups (Requested/Annual/3YR), saw ${rollups}`);
    await page.locator('.comm-card', { hasText: 'Cedarville STEM Classroom Grant' })
      .locator('.comm-vote-for').click({ timeout: 3000 }).catch(e => errs.push('COMMVOTE: ' + e.message));
    await page.waitForTimeout(400);
    const voteCheck = await page.evaluate(() => {
      const comm = JSON.parse(localStorage.getItem('hpsm:community') || '[]');
      const a = comm.find(x => x.id === 'ca-01') || {};
      return { vote: (a.votes || {})['u-alex'], stamped: a.updatedAt !== '2026-01-22T18:30:00.000Z' };
    });
    if (voteCheck.vote !== undefined) errs.push('COMMVOTE: re-clicking my own "for" vote did not toggle it off');
    if (!voteCheck.stamped) errs.push('COMMVOTE: the vote save did not stamp updatedAt (make-real regression)');
    await page.locator('.comm-card', { hasText: 'Willamette River Cleanup Day' })
      .locator('.plan-card-actions ui-button', { hasText: 'Review' }).click({ timeout: 3000 }).catch(e => errs.push('COMMREVIEW: ' + e.message));
    await page.waitForTimeout(500);
    await page.locator('.comm-profile ui-button', { hasText: 'Approve' }).click({ timeout: 3000 }).catch(e => errs.push('COMMAPPROVE: ' + e.message));
    await page.waitForTimeout(400);
    const apprCheck = await page.evaluate(() => {
      const comm = JSON.parse(localStorage.getItem('hpsm:community') || '[]');
      const a = comm.find(x => x.id === 'ca-02') || {};
      return { stage: a.stage, approver: a.approverId, at: !!a.approvedAt, date: a.dateApproved };
    });
    if (apprCheck.stage !== 'Approved') errs.push(`COMMAPPROVE: expected stage Approved, saw ${apprCheck.stage}`);
    if (apprCheck.approver !== 'u-alex' || !apprCheck.at) errs.push('COMMAPPROVE: approverId/approvedAt not stamped');
    if (!apprCheck.date) errs.push('COMMAPPROVE: dateApproved did not default');
    await page.locator('.comm-profile ui-button', { hasText: 'Community' }).first().click({ timeout: 3000 }).catch(e => errs.push('COMMPROFBACK: ' + e.message));
    await page.waitForTimeout(400);
    // The editor mounts asPage with the sealed sections + the "{N} left"
    // readout on a fresh create (via the shell's context-aware +).
    await page.locator('ui-app-bar ui-icon-button[aria-label="Create new"]').click({ timeout: 3000 }).catch(e => errs.push('COMMNEW: ' + e.message));
    await page.waitForTimeout(500);
    const missingReadout = await page.locator('.comm-editor .plan-missing').textContent().catch(() => '');
    if (!/left$/.test((missingReadout || '').trim())) errs.push(`COMMNEW: expected the "{N} left" readout, saw "${missingReadout}"`);
    const commTextareas = await page.locator('.comm-form ui-textarea').count();
    if (commTextareas < 2) errs.push(`COMMFORM: expected the two counted textareas, saw ${commTextareas}`);
    await page.locator('.comm-editor ui-button', { hasText: 'All community' }).click({ timeout: 3000 }).catch(e => errs.push('COMMEDBACK: ' + e.message));
    await page.waitForTimeout(300);
    // Census C9 (Phase-8 audit fix): engagement rows are LIVE from a
    // non-Community host — Lists (Master) opens a stakeholder record, the
    // profile's engagement row routes through the shell's community
    // deep-link seam to that entry's read view, and the modal closes.
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Master' }).click({ timeout: 3000 }).catch(e => errs.push('C9NAV: ' + e.message));
    await page.waitForTimeout(500);
    await page.locator('ui-stakeholder-table [data-key="name"]', { hasText: 'Mayor Maria Chen' }).dblclick({ timeout: 3000 }).catch(e => errs.push('C9OPEN: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('ui-dialog.sh-dialog ui-button', { hasText: 'View Stakeholder' }).click({ timeout: 3000 }).catch(e => errs.push('C9FLIP: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('ui-dialog.sh-dialog .profile-entry', { hasText: 'Cedarville STEM Classroom Grant' }).click({ timeout: 3000 }).catch(e => errs.push('C9ROW: ' + e.message));
    await page.waitForTimeout(600);
    const c9Title = (await page.locator('.comm-profile .plan-review-toolbar-title').textContent().catch(() => '') || '').trim();
    if (c9Title !== 'Cedarville STEM Classroom Grant') errs.push(`C9ROUTE: expected the clicked engagement's Community read view, saw "${c9Title}"`);
    const c9ModalOpen = await page.locator('ui-dialog.sh-dialog[open]').count();
    if (c9ModalOpen !== 0) errs.push(`C9CLOSE: the stakeholder modal should close when routing, saw ${c9ModalOpen} open`);
    // Phase 9: Workspaces (Setup) — segment-grouped cards render; the
    // selector's "New workspace…" lands on Setup WITH the create modal
    // (census A3); create stamps createdBy/createdAt/updatedAt, honors the
    // sealed blank defaults, and AUTO-OPENS the workspace (census H4); the
    // edit modal saves; delete runs the FULL cascade (record + joins + plans
    // + active fallback to Master).
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Workspaces' }).click({ timeout: 3000 }).catch(e => errs.push('P9NAV: ' + e.message));
    await page.waitForTimeout(500);
    const segGroups = await page.locator('.seg-group').count();
    if (segGroups < 3) errs.push(`P9GROUPS: expected the 3 seeded segment groups, saw ${segGroups}`);
    const wsCards = await page.locator('.ws-card').count();
    if (wsCards < 6) errs.push(`P9CARDS: expected the 6 seed workspaces, saw ${wsCards}`);
    await page.locator('#ws-select-anchor').click({ timeout: 3000 }).catch(e => errs.push('P9MENU: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-menu ui-menu-item', { hasText: 'New workspace' }).click({ timeout: 3000 }).catch(e => errs.push('P9CTA: ' + e.message));
    await page.waitForTimeout(500);
    const createDisabled = await page.locator('.ws-modal ui-button', { hasText: 'Create workspace' }).getAttribute('disabled').catch(() => null);
    if (createDisabled === null) errs.push('P9CREATE: Create must be DISABLED while the name is empty (sealed validity)');
    // real typing (fill()'s synthetic input event is non-composed and never
    // escapes the ui-text-field shadow root, so the draft would stay empty)
    await page.locator('.ws-modal ui-text-field input').click({ timeout: 3000 }).catch(e => errs.push('P9NAME: ' + e.message));
    await page.keyboard.type('EMEA Water Stewardship');
    await page.waitForTimeout(300);
    await page.locator('.ws-modal ui-button', { hasText: 'Create workspace' }).click({ timeout: 3000 }).catch(e => errs.push('P9SUBMIT: ' + e.message));
    await page.waitForTimeout(500);
    const created = await page.evaluate(() => {
      const wss = JSON.parse(localStorage.getItem('hpsm:workspaces') || '[]');
      const w = wss.find(x => x.name === 'EMEA Water Stewardship');
      return w ? { createdBy: w.createdBy, createdAt: !!w.createdAt, updatedAt: !!w.updatedAt, segment: w.segment, businessUnit: w.businessUnit, owners: w.owners } : null;
    });
    if (!created) errs.push('P9CREATE: the new workspace did not persist');
    else {
      if (created.createdBy !== 'u-alex' || !created.createdAt || !created.updatedAt) errs.push('P9CREATE: createdBy/createdAt/updatedAt stamps missing');
      if (created.segment !== 'Corporate Functions' || created.businessUnit !== 'Legal / GA&PP') errs.push('P9CREATE: sealed blank defaults did not hold');
      if (!(created.owners || []).includes('u-alex')) errs.push('P9CREATE: the creator must pre-own (sealed)');
    }
    const activeName = (await page.locator('.ws-select-name').textContent().catch(() => '') || '').trim();
    if (activeName !== 'EMEA Water Stewardship') errs.push(`P9AUTOOPEN: expected the new workspace active on Lists (census H4), saw "${activeName}"`);
    // edit: card NAME click opens the edit modal; Save persists the patch
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Workspaces' }).click({ timeout: 3000 }).catch(e => errs.push('P9NAV2: ' + e.message));
    await page.waitForTimeout(500);
    await page.locator('.ws-card', { hasText: 'EMEA Water Stewardship' }).locator('.plan-card-title').click({ timeout: 3000 }).catch(e => errs.push('P9EDITOPEN: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('.ws-modal ui-text-field input').click({ timeout: 3000 }).catch(e => errs.push('P9EDITNAME: ' + e.message));
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('EMEA Water Stewardship FY27');
    await page.waitForTimeout(200);
    await page.locator('.ws-modal ui-button', { hasText: 'Save changes' }).click({ timeout: 3000 }).catch(e => errs.push('P9EDITSAVE: ' + e.message));
    await page.waitForTimeout(400);
    const renamed = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('hpsm:workspaces') || '[]').some(w => w.name === 'EMEA Water Stewardship FY27'));
    if (!renamed) errs.push('P9EDIT: the rename did not persist');
    // delete the ACTIVE workspace → confirm → record gone + fallback to Master
    await page.locator('.ws-card', { hasText: 'EMEA Water Stewardship FY27' }).locator('ui-icon-button[aria-label="Delete"]').click({ timeout: 3000 }).catch(e => errs.push('P9DELOPEN: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('.ws-confirm ui-button', { hasText: 'Yes, delete' }).click({ timeout: 3000 }).catch(e => errs.push('P9DELCONFIRM: ' + e.message));
    await page.waitForTimeout(500);
    const afterDelete = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('hpsm:workspaces') || '[]').some(w => w.name === 'EMEA Water Stewardship FY27'));
    if (afterDelete) errs.push('P9DELETE: the workspace record survived the delete');
    const fellBack = (await page.locator('.ws-select-name').textContent().catch(() => '') || '').trim();
    if (fellBack !== 'Master') errs.push(`P9FALLBACK: deleting the active workspace must fall back to Master, saw "${fellBack}"`);
    // delete Hawk (seed plan + stakeholders): the confirm DISCLOSES the plans
    // leg; the cascade strips joins and deletes the scoped plan
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Workspaces' }).click({ timeout: 3000 }).catch(e => errs.push('P9NAV3: ' + e.message));
    await page.waitForTimeout(500);
    await page.locator('.ws-card', { hasText: 'Hawk' }).locator('ui-icon-button[aria-label="Delete"]').click({ timeout: 3000 }).catch(e => errs.push('P9HAWKDEL: ' + e.message));
    await page.waitForTimeout(400);
    const confirmCopy = await page.locator('.ws-confirm').textContent().catch(() => '');
    if (!/will also be deleted/.test(confirmCopy || '')) errs.push('P9CASCADE: the confirm did not disclose the plans-cascade leg');
    await page.locator('.ws-confirm ui-button', { hasText: 'Yes, delete' }).click({ timeout: 3000 }).catch(e => errs.push('P9HAWKCONFIRM: ' + e.message));
    await page.waitForTimeout(500);
    const cascade = await page.evaluate(() => {
      const wss = JSON.parse(localStorage.getItem('hpsm:workspaces') || '[]');
      const plans = JSON.parse(localStorage.getItem('hpsm:plans') || '[]');
      const join = JSON.parse(localStorage.getItem('hpsm:stakeholderWorkspaces') || '{}');
      return {
        ws: wss.some(w => w.id === 'ws-gapp-na'),
        plan: plans.some(p => p.workspaceId === 'ws-gapp-na'),
        join: Object.values(join).some(l => (l || []).includes('ws-gapp-na')),
      };
    });
    if (cascade.ws) errs.push('P9CASCADE: ws-gapp-na record survived');
    if (cascade.plan) errs.push('P9CASCADE: the plans leg did not delete the scoped plan');
    if (cascade.join) errs.push('P9CASCADE: the join strip left ws-gapp-na on a stakeholder');
    // Phase 10: Help — the sidebar-foot nav item mounts the static reference;
    // the zone key renders 14 spectrum chips + 24 grid cells + 14 strategy
    // cards, every fill resolved from the SAME --ui-sys-zone-* tokens the
    // Map/Lists read (single source, never a fork).
    await page.locator('ui-sidebar ui-sidebar-item[slot="footer"]', { hasText: 'Help' }).click({ timeout: 3000 }).catch(e => errs.push('P10NAV: ' + e.message));
    await page.waitForTimeout(500);
    const helpMounted = await page.locator('.help-inner').count();
    if (helpMounted !== 1) errs.push(`P10MOUNT: expected the Help reading column, saw ${helpMounted}`);
    const spectrumChips = await page.locator('.help-spectrum ui-chip[variant="zone"]').count();
    if (spectrumChips !== 14) errs.push(`P10SPECTRUM: expected 14 zone chips, saw ${spectrumChips}`);
    const zoneCells = await page.locator('.help-grid-figure .help-zone').count();
    if (zoneCells !== 24) errs.push(`P10GRID: expected 24 zone cells, saw ${zoneCells}`);
    const stratCards = await page.locator('.help-strat-card').count();
    if (stratCards !== 14) errs.push(`P10STRAT: expected 14 strategy cards, saw ${stratCards}`);
    const funnelSteps = await page.locator('.help-funnel-cols ui-list-item').count();
    if (funnelSteps !== 12) errs.push(`P10FUNNEL: expected the 12 framework steps, saw ${funnelSteps}`);
    const zoneTokenCheck = await page.evaluate(() => {
      const hexToRgb = (h) => {
        const v = h.trim().replace('#', '');
        return `rgb(${parseInt(v.slice(0, 2), 16)}, ${parseInt(v.slice(2, 4), 16)}, ${parseInt(v.slice(4, 6), 16)})`;
      };
      const probe = (name, tokenName) => {
        const cell = [...document.querySelectorAll('.help-zone')].find(z => z.dataset.zone === name);
        const token = getComputedStyle(document.documentElement).getPropertyValue(tokenName);
        return cell && token && getComputedStyle(cell).backgroundColor === hexToRgb(token);
      };
      return {
        pd: probe('Proactively Defend', '--ui-sys-zone-proactively-defend'),
        sp: probe('Strategic Partner', '--ui-sys-zone-strategic-partner'),
        mon: probe('Monitor', '--ui-sys-zone-monitor'),
      };
    });
    if (!zoneTokenCheck.pd || !zoneTokenCheck.sp || !zoneTokenCheck.mon)
      errs.push(`P10ZONETOKENS: grid cells did not resolve the --ui-sys-zone-* fills: ${JSON.stringify(zoneTokenCheck)}`);
    const formulaText = await page.locator('.help-formula').textContent().catch(() => '');
    if (!(formulaText || '').includes('Σ (member.x × member.weight)'))
      errs.push('P10FORMULA: the sealed formula block is missing or paraphrased');
    // Phase 11: Settings — the sealed manager-gated ProfileMenu entry (census
    // A9), the 9 oracle panes + Design + Integrations, the LIVE inheritance
    // edges (segments → Workspaces create modal; org goals → Plan editor),
    // and the design dashboard (live :root token writes, reload persistence,
    // reset-to-start-state).
    const openSettings = async (tag) => {
      await page.locator('#me-anchor').click({ timeout: 3000 }).catch(e => errs.push(tag + 'MENU: ' + e.message));
      await page.waitForTimeout(300);
      await page.locator('ui-menu.profile-menu ui-menu-item', { hasText: 'Settings' }).click({ timeout: 3000 }).catch(e => errs.push(tag + 'ITEM: ' + e.message));
      await page.waitForTimeout(400);
    };
    await openSettings('P11');
    const railCount = await page.locator('.settings-nav ui-list-item').count();
    if (railCount !== 11) errs.push(`P11RAIL: expected 9 sealed panes + Design + Integrations = 11 rail items, saw ${railCount}`);
    // structure pane: add a segment (Enter commit) + an org goal
    await page.locator('.settings-nav ui-list-item', { hasText: 'Your Structure' }).click({ timeout: 3000 }).catch(e => errs.push('P11STRUCT: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('.segset-add ui-text-field input').fill('Emerging Tech').catch(e => errs.push('P11SEGFILL: ' + e.message));
    await page.locator('.segset-add ui-text-field input').press('Enter').catch(e => errs.push('P11SEGENTER: ' + e.message));
    await page.waitForTimeout(300);
    const segBlock = await page.locator('.segset-seg strong', { hasText: 'Emerging Tech' }).count();
    if (segBlock !== 1) errs.push(`P11SEGADD: expected the new segment block, saw ${segBlock}`);
    await page.locator('.issue-settings-add ui-text-field input').first().fill('Ship Phase 11').catch(e => errs.push('P11GOALFILL: ' + e.message));
    await page.locator('.issue-settings-add ui-text-field input').first().press('Enter').catch(e => errs.push('P11GOALENTER: ' + e.message));
    await page.waitForTimeout(300);
    const goalChip = await page.locator('.issue-settings-list ui-chip', { hasText: 'Ship Phase 11' }).count();
    if (goalChip !== 1) errs.push(`P11GOALADD: expected the new goal chip, saw ${goalChip}`);
    // LIVE EDGE 1 — segments → the Workspaces create modal's Segment select
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Workspaces' }).click({ timeout: 3000 }).catch(e => errs.push('P11WSNAV: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('ui-app-bar ui-icon-button[aria-label="Create new"]').click({ timeout: 3000 }).catch(e => errs.push('P11WSCREATE: ' + e.message));
    await page.waitForTimeout(400);
    const segOption = await page.locator('ui-option', { hasText: 'Emerging Tech' }).count();
    if (segOption < 1) errs.push('P11SEGEDGE: the Settings-added segment did not reach the workspace modal Segment select');
    await page.evaluate(() => document.querySelectorAll('ui-dialog').forEach(d => d.close && d.close()));
    await page.waitForTimeout(300);
    // LIVE EDGE 2 — org goals → the Plan editor's section 2
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Plans' }).click({ timeout: 3000 }).catch(e => errs.push('P11PLANNAV: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('ui-app-bar ui-icon-button[aria-label="Create new"]').click({ timeout: 3000 }).catch(e => errs.push('P11PLANNEW: ' + e.message));
    await page.waitForTimeout(500);
    const goalRow = await page.locator('.plan-goal-title', { hasText: 'Ship Phase 11' }).count();
    if (goalRow !== 1) errs.push(`P11GOALEDGE: the Settings-added org goal did not reach the plan editor, saw ${goalRow}`);
    // design dashboard: accent candidate + Modern wrapper apply LIVE to :root
    await openSettings('P11B');
    await page.locator('.settings-nav ui-list-item', { hasText: 'Design' }).click({ timeout: 3000 }).catch(e => errs.push('P11DESIGN: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-swatch-card[value="#D96B43"]').click({ timeout: 3000 }).catch(e => errs.push('P11ACCENT: ' + e.message));
    await page.waitForTimeout(300);
    const accentLive = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ui-sys-accent').trim());
    if (accentLive !== '#D96B43') errs.push(`P11ACCENTLIVE: expected #D96B43 on :root, saw "${accentLive}"`);
    await page.locator('ui-swatch-card[value="modern"]').click({ timeout: 3000 }).catch(e => errs.push('P11MODERN: ' + e.message));
    await page.waitForTimeout(300);
    const themeAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    if (themeAttr !== 'modern') errs.push(`P11MODERNATTR: expected data-theme="modern", saw "${themeAttr}"`);
    const zoneAfter = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ui-sys-zone-strategic-partner').trim());
    if (zoneAfter !== '#74B556') errs.push(`P11ZONELAW: a theme/design swap touched a zone token: ${zoneAfter}`);
    // persistence: the overrides survive a RELOAD (boot re-apply, no flash logic asserted)
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 }).catch(e => errs.push('P11RELOAD: ' + e.message));
    await page.waitForTimeout(1500);
    const accentBoot = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ui-sys-accent').trim());
    const themeBoot = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    if (accentBoot !== '#D96B43') errs.push(`P11PERSIST: accent did not survive reload, saw "${accentBoot}"`);
    if (themeBoot !== 'modern') errs.push(`P11PERSIST: wrapper theme did not survive reload, saw "${themeBoot}"`);
    // reset-to-start-state restores tokens.css exactly
    await openSettings('P11C');
    await page.locator('.settings-nav ui-list-item', { hasText: 'Design' }).click({ timeout: 3000 }).catch(e => errs.push('P11DESIGN2: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-button', { hasText: 'Reset to start-state' }).click({ timeout: 3000 }).catch(e => errs.push('P11RESET: ' + e.message));
    await page.waitForTimeout(300);
    const accentReset = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--ui-sys-accent').trim());
    const themeReset = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    if (accentReset !== '#B5552C') errs.push(`P11RESETACCENT: expected the tokens.css start-state #B5552C, saw "${accentReset}"`);
    if (themeReset !== null) errs.push(`P11RESETTHEME: expected no data-theme after reset, saw "${themeReset}"`);
    // Phase 12: Messaging — the app-bar toggle opens the right-edge sidebar
    // (5 seed conversations, Reminders pinned first); a thread opens in the
    // sidebar and CARRIES OVER to the full page via the expand control
    // (census J2, sidebar closes); sending persists; opening stamps the REAL
    // read marker; the @-mention composer pops, picks, renders a live chip,
    // and the chip routes to the stakeholder's READ view (A20 ruling); the
    // new-conversation modal DEDUPES an existing DM; the Reminders thread is
    // read-only (no composer) with the RULED "Automated reminders" subline.
    await page.locator('ui-app-bar ui-icon-button[aria-label="Messages"]').click({ timeout: 3000 }).catch(e => errs.push('P12TOGGLE: ' + e.message));
    await page.waitForTimeout(500);
    const sideOpen = await page.locator('ui-sheet.messaging-sidebar[open]').count();
    if (sideOpen !== 1) errs.push(`P12SIDEBAR: expected the messaging sidebar open, saw ${sideOpen}`);
    const convRows = await page.locator('.messaging-sidebar .conv-row').count();
    if (convRows !== 5) errs.push(`P12CONVS: expected the 5 seed conversations, saw ${convRows}`);
    const firstRow = (await page.locator('.messaging-sidebar .conv-row').first().textContent().catch(() => '') || '');
    if (!firstRow.includes('Reminders')) errs.push('P12PIN: the Reminders system row must be pinned first');
    await page.locator('.messaging-sidebar .conv-row', { hasText: 'Jordan Kim, Sam Okafor' }).click({ timeout: 3000 }).catch(e => errs.push('P12OPEN: ' + e.message));
    await page.waitForTimeout(400);
    const sideMsgs = await page.locator('.messaging-sidebar .message-thread .msg').count();
    if (sideMsgs !== 3) errs.push(`P12THREAD: expected the 3 seeded c-001 messages, saw ${sideMsgs}`);
    // expand → full page, same conversation, sidebar closed (J2)
    await page.locator('.messaging-sidebar ui-icon-button[aria-label="Open full Messages page"]').click({ timeout: 3000 }).catch(e => errs.push('P12EXPAND: ' + e.message));
    await page.waitForTimeout(500);
    if (await page.locator('.messaging-page').count() !== 1) errs.push('P12PAGE: the full Messages page did not mount');
    if (await page.locator('ui-sheet.messaging-sidebar[open]').count() !== 0) errs.push('P12EXPANDCLOSE: expanding must close the sidebar (sealed)');
    const pageTitle = (await page.locator('.messaging-page-head .conv-head-title').textContent().catch(() => '') || '').trim();
    if (pageTitle !== 'Jordan Kim, Sam Okafor') errs.push(`P12CARRY: the open conversation must carry over, saw "${pageTitle}"`);
    // the open stamped a REAL read marker (make-real unread)
    const readStamp = await page.evaluate(() => {
      const reads = JSON.parse(localStorage.getItem('hpsm:reads') || '{}');
      return (reads['u-alex'] || {})['c-001'];
    });
    if (!readStamp) errs.push('P12READ: opening the conversation did not stamp reads[u-alex][c-001]');
    // send a plain message (Enter submits; Shift+Enter would newline)
    await page.locator('.messaging-page .composer ui-textarea textarea').click({ timeout: 3000 }).catch(e => errs.push('P12COMPOSE: ' + e.message));
    await page.keyboard.type('Smoke check message');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
    const sent = await page.evaluate(() => {
      const msgs = JSON.parse(localStorage.getItem('hpsm:messages') || '{}');
      const list = msgs['c-001'] || [];
      const last = list[list.length - 1] || {};
      return { len: list.length, body: last.body, from: last.from, kindAbsent: !('kind' in last) };
    });
    if (sent.len !== 4 || sent.body !== 'Smoke check message' || sent.from !== 'u-alex') errs.push(`P12SEND: the message did not persist (${JSON.stringify(sent)})`);
    if (!sent.kindAbsent) errs.push('P12SEND: ordinary messages must carry NO kind field (sealed)');
    // @-mention: popover → Enter picks → send → live chip → READ-view route
    await page.locator('.messaging-page .composer ui-textarea textarea').click({ timeout: 3000 }).catch(e => errs.push('P12MENTION: ' + e.message));
    await page.keyboard.type('@Maria');
    await page.waitForTimeout(300);
    const popCount = await page.locator('.mention-pop ui-list-item').count();
    if (popCount < 1) errs.push(`P12POP: expected the mention popover, saw ${popCount} options`);
    await page.keyboard.press('Enter'); // picks the highlighted match
    await page.waitForTimeout(200);
    await page.keyboard.press('Enter'); // sends the tokenized body
    await page.waitForTimeout(400);
    const chipCount = await page.locator('.messaging-page .message-thread .msg-bubble ui-chip.mention-chip.t-stk').count();
    if (chipCount < 1) errs.push('P12CHIP: the sent mention did not render as a live stakeholder chip');
    await page.locator('.messaging-page .message-thread ui-chip.mention-chip.t-stk', { hasText: 'Mayor Maria Chen' }).last().click({ timeout: 3000 }).catch(e => errs.push('P12ROUTE: ' + e.message));
    await page.waitForTimeout(600);
    const routedDialog = await page.locator('ui-dialog.sh-dialog[open]').count();
    if (routedDialog !== 1) errs.push(`P12ROUTE: expected the stakeholder record open, saw ${routedDialog} dialogs`);
    const dialogText = await page.locator('ui-dialog.sh-dialog').textContent().catch(() => '');
    if (!/Edit stakeholder/i.test(dialogText || '')) errs.push('P12READVIEW: the mention deep link must land on the READ view (A20 ruling — Edit one click away)');
    await page.evaluate(() => document.querySelectorAll('ui-dialog').forEach(d => d.close && d.close()));
    await page.waitForTimeout(300);
    // ProfileMenu "Messages" (census A8, now live) returns to the page
    await page.locator('#me-anchor').click({ timeout: 3000 }).catch(e => errs.push('P12MENU: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-menu.profile-menu ui-menu-item', { hasText: 'Messages' }).click({ timeout: 3000 }).catch(e => errs.push('P12MENUITEM: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('.messaging-page').count() !== 1) errs.push('P12A8: the ProfileMenu Messages item did not mount the page');
    // new-conversation modal: picking an existing DM partner DEDUPES (sealed)
    await page.locator('.messaging-list-head ui-button').click({ timeout: 3000 }).catch(e => errs.push('P12NEW: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('.msg-new-modal .user-picker ui-list-item', { hasText: 'Jordan Kim' }).click({ timeout: 3000 }).catch(e => errs.push('P12PICK: ' + e.message));
    await page.waitForTimeout(200);
    await page.locator('.msg-new-modal ui-button', { hasText: 'Start conversation' }).click({ timeout: 3000 }).catch(e => errs.push('P12START: ' + e.message));
    await page.waitForTimeout(400);
    const dmTitle = (await page.locator('.messaging-page-head .conv-head-title').textContent().catch(() => '') || '').trim();
    if (dmTitle !== 'Jordan Kim') errs.push(`P12DEDUPE: expected the existing DM thread open, saw "${dmTitle}"`);
    const convCount = await page.evaluate(() => JSON.parse(localStorage.getItem('hpsm:conversations') || '[]').length);
    if (convCount !== 5) errs.push(`P12DEDUPE: an existing DM must be REUSED, never duplicated — saw ${convCount} conversations`);
    // the Reminders thread: read-only (no composer) + the RULED subline
    await page.locator('.messaging-page .conv-row', { hasText: 'Reminders' }).click({ timeout: 3000 }).catch(e => errs.push('P12SYS: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('.messaging-thread-pane .composer').count() !== 0) errs.push('P12SYSRO: the system thread must mount NO composer (read-only ruling)');
    const sysSub = (await page.locator('.messaging-page-head .conv-subline').textContent().catch(() => '') || '').trim();
    if (sysSub !== 'Automated reminders') errs.push(`P12SYSSUB: expected "Automated reminders", saw "${sysSub}"`);
    const sysAv = await page.locator('.messaging-page-head .av-system').count();
    if (sysAv !== 1) errs.push('P12SYSAV: the opened system head must show the sparkle system avatar (ruling)');
    // Phase 13: Profiles — the app-bar people stack opens the UserListPopup
    // (6 others: self + system bot excluded); a row opens that USER'S PROFILE
    // (census I6 make-real) with 4 tabs and NO Edit button on someone else's
    // page; ProfileMenu "View profile" (census A7) lands on the CURRENT
    // user's page WITH Edit; a Workspaces-tab row opens that workspace's
    // Lists (census I1); a plan-card team avatar routes to the user profile
    // (I6); the panel's "Send message" starts/dedupes a DM and opens the
    // messaging sidebar (census J5); Edit profile saves the sealed name
    // recomposition.
    // Sealed UserStack anatomy: the WHOLE cluster (circles + "+N") is ONE
    // role=button control with the sealed accessible name — never
    // per-avatar buttons (ui-owner-picker stack-button mode).
    const stackBtn = page.locator('ui-app-bar .user-stack ui-owner-picker button');
    const stackBtnCount = await stackBtn.count();
    if (stackBtnCount !== 1) errs.push(`P13STACKBTN: the people stack must be ONE button, saw ${stackBtnCount}`);
    const stackAria = await stackBtn.first().getAttribute('aria-label').catch(() => null);
    if (stackAria !== 'People in this workspace') errs.push(`P13STACKARIA: expected the sealed "People in this workspace" aria-label, saw "${stackAria}"`);
    await page.locator('ui-app-bar .user-stack').click({ position: { x: 10, y: 12 }, timeout: 3000 }).catch(e => errs.push('P13STACK: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('ui-sheet.people-popup[open]').count() !== 1) errs.push('P13POPUP: the people panel did not open');
    const peopleRows = await page.locator('.people-popup .people-row').count();
    if (peopleRows !== 6) errs.push(`P13ROWS: expected 6 others (self + system excluded), saw ${peopleRows}`);
    const peopleHeadTxt = (await page.locator('.people-popup .people-head strong').textContent().catch(() => '') || '').trim();
    if (peopleHeadTxt !== 'People · 6') errs.push(`P13HEAD: expected "People · 6", saw "${peopleHeadTxt}"`);
    await page.locator('.people-popup .people-row', { hasText: 'Jordan Kim' }).click({ timeout: 3000 }).catch(e => errs.push('P13ROWOPEN: ' + e.message));
    await page.waitForTimeout(500);
    if (await page.locator('.profile-page').count() !== 1) errs.push('P13PAGE: the user profile page did not mount (census I6)');
    if (await page.locator('ui-sheet.people-popup[open]').count() !== 0) errs.push('P13POPCLOSE: opening a profile must close the people panel');
    const profName = (await page.locator('.profile-name').textContent().catch(() => '') || '').trim();
    if (profName !== 'Jordan Kim') errs.push(`P13SUBJECT: expected Jordan Kim's profile, saw "${profName}"`);
    if (await page.locator('.profile-hero ui-button').count() !== 0) errs.push('P13EDITGATE: Edit profile must show ONLY on your own profile (sealed isSelf)');
    if (await page.locator('.profile-tabs ui-tab').count() !== 4) errs.push('P13TABS: expected the sealed 4 tabs');
    // ProfileMenu "View profile" (census A7) → own page with Edit
    await page.locator('#me-anchor').click({ timeout: 3000 }).catch(e => errs.push('P13MENU: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-menu.profile-menu ui-menu-item', { hasText: 'View profile' }).click({ timeout: 3000 }).catch(e => errs.push('P13VIEWSELF: ' + e.message));
    await page.waitForTimeout(400);
    const selfName = (await page.locator('.profile-name').textContent().catch(() => '') || '').trim();
    if (selfName !== 'Alex Rivera') errs.push(`P13SELF: expected the current user's profile, saw "${selfName}"`);
    const editBtn = page.locator('.profile-hero ui-button', { hasText: 'Edit profile' });
    if (await editBtn.count() !== 1) errs.push('P13EDITBTN: Edit profile must show on your own profile (census I5)');
    // Census I1: a Workspaces-tab row opens that workspace's Lists tab
    await page.locator('.profile-table tbody tr', { hasText: 'Google Beam Tour' }).click({ timeout: 3000 }).catch(e => errs.push('P13WSROW: ' + e.message));
    await page.waitForTimeout(500);
    const wsAfterRow = (await page.locator('.ws-select-name').textContent().catch(() => '') || '').trim();
    if (wsAfterRow !== 'Google Beam Tour') errs.push(`P13I1: expected the row's workspace active on Lists, saw "${wsAfterRow}"`);
    // Census I6: a community-card owner avatar opens that user's profile
    // (the sole seed plan died with Hawk's P9 cascade — community cards keep
    // their seeded owners, so they are the deterministic I6 target here)
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Community' }).click({ timeout: 3000 }).catch(e => errs.push('P13COMMNAV: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('.comm-card', { hasText: 'Cedarville STEM Classroom Grant' })
      .locator('.plan-card-avatars ui-owner-picker').click({ timeout: 3000 }).catch(e => errs.push('P13OWNERAV: ' + e.message));
    await page.waitForTimeout(500);
    if (await page.locator('.profile-page').count() !== 1) errs.push('P13I6: the owner avatar did not open a user profile');
    const ownerName = (await page.locator('.profile-name').textContent().catch(() => '') || '').trim();
    if (ownerName !== 'Sam Okafor') errs.push(`P13I6WHO: expected the owner's (Sam Okafor) profile, saw "${ownerName}"`);
    // Census J5: people panel "Send message" → NEW DM + the sidebar opens
    await page.locator('ui-app-bar .user-stack').click({ position: { x: 10, y: 12 }, timeout: 3000 }).catch(e => errs.push('P13STACK2: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('.people-popup .people-row', { hasText: 'Sam Okafor' })
      .locator('ui-icon-button[aria-label="Send message"]').click({ timeout: 3000 }).catch(e => errs.push('P13MSG: ' + e.message));
    await page.waitForTimeout(500);
    if (await page.locator('ui-sheet.messaging-sidebar[open]').count() !== 1) errs.push('P13J5: "Send message" must open the messaging sidebar');
    const dmHead = (await page.locator('.messaging-sidebar .conv-head-title').textContent().catch(() => '') || '').trim();
    if (dmHead !== 'Sam Okafor') errs.push(`P13J5DM: expected the Sam Okafor DM open, saw "${dmHead}"`);
    const convsAfterNew = await page.evaluate(() => JSON.parse(localStorage.getItem('hpsm:conversations') || '[]').length);
    if (convsAfterNew !== 6) errs.push(`P13J5NEW: a fresh DM partner must mint one conversation — saw ${convsAfterNew}`);
    // J5 dedupe: messaging an EXISTING DM partner reuses the thread (close
    // the sidebar first — its scrim covers the app-bar stack)
    await page.locator('.messaging-sidebar ui-icon-button[aria-label="Close"]').click({ timeout: 3000 }).catch(e => errs.push('P13MSGCLOSE0: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-app-bar .user-stack').click({ position: { x: 10, y: 12 }, timeout: 3000 }).catch(e => errs.push('P13STACK3: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('.people-popup .people-row', { hasText: 'Jordan Kim' })
      .locator('ui-icon-button[aria-label="Send message"]').click({ timeout: 3000 }).catch(e => errs.push('P13MSG2: ' + e.message));
    await page.waitForTimeout(500);
    const convsAfterDupe = await page.evaluate(() => JSON.parse(localStorage.getItem('hpsm:conversations') || '[]').length);
    if (convsAfterDupe !== 6) errs.push(`P13J5DEDUPE: an existing DM must be REUSED — saw ${convsAfterDupe} conversations`);
    const dupeHead = (await page.locator('.messaging-sidebar .conv-head-title').textContent().catch(() => '') || '').trim();
    if (dupeHead !== 'Jordan Kim') errs.push(`P13J5DEDUPE: expected the existing Jordan DM open, saw "${dupeHead}"`);
    await page.locator('.messaging-sidebar ui-icon-button[aria-label="Close"]').click({ timeout: 3000 }).catch(e => errs.push('P13MSGCLOSE: ' + e.message));
    await page.waitForTimeout(300);
    // Edit profile: the sealed SAVE merge recomposes the name from first+last
    await page.locator('#me-anchor').click({ timeout: 3000 }).catch(e => errs.push('P13MENU2: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-menu.profile-menu ui-menu-item', { hasText: 'View profile' }).click({ timeout: 3000 }).catch(e => errs.push('P13VIEWSELF2: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('.profile-hero ui-button', { hasText: 'Edit profile' }).click({ timeout: 3000 }).catch(e => errs.push('P13EDITOPEN: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('ui-dialog.edit-profile-modal[open]').count() !== 1) errs.push('P13MODAL: the EditProfileModal did not open');
    const swatches = await page.locator('.edit-profile-modal ui-swatch-card').count();
    if (swatches !== 8) errs.push(`P13SWATCH: expected the sealed 8 avatar-color swatches (no photo set), saw ${swatches}`);
    await page.locator('.edit-profile-modal ui-text-field input').first().click({ timeout: 3000 }).catch(e => errs.push('P13FN: ' + e.message));
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('Alexandra');
    await page.waitForTimeout(200);
    await page.locator('.edit-profile-modal ui-button', { hasText: 'Save profile' }).click({ timeout: 3000 }).catch(e => errs.push('P13SAVE: ' + e.message));
    await page.waitForTimeout(400);
    const savedUser = await page.evaluate(() => {
      const us = JSON.parse(localStorage.getItem('hpsm:users') || '[]');
      const u = us.find(x => x.id === 'u-alex') || {};
      return { name: u.name, first: u.firstName, last: u.lastName };
    });
    if (savedUser.name !== 'Alexandra Rivera') errs.push(`P13MERGE: expected the recomposed name "Alexandra Rivera", saw "${savedUser.name}"`);
    if (savedUser.first !== 'Alexandra' || savedUser.last !== 'Rivera') errs.push('P13MERGE: firstName/lastName fallbacks not stamped');
    const heroAfter = (await page.locator('.profile-name').textContent().catch(() => '') || '').trim();
    if (heroAfter !== 'Alexandra Rivera') errs.push(`P13LIVE: the hero did not re-render the saved name, saw "${heroAfter}"`);
    // Census I6 (full sweep, fixer pass): a thread AUTHOR AVATAR routes to
    // that user's profile AND closes the sidebar first (the mention-chip
    // precedent). The Jordan DM is still the active conversation.
    await page.locator('ui-app-bar ui-icon-button[aria-label="Messages"]').click({ timeout: 3000 }).catch(e => errs.push('P13MSGTOGGLE: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('.messaging-sidebar .msg:not(.mine) ui-avatar[interactive]').first().click({ timeout: 3000 }).catch(e => errs.push('P13AUTHORAV: ' + e.message));
    await page.waitForTimeout(500);
    if (await page.locator('ui-sheet.messaging-sidebar[open]').count() !== 0) errs.push('P13AUTHORCLOSE: opening a profile from the sidebar must close the sidebar');
    if (await page.locator('.profile-page').count() !== 1) errs.push('P13AUTHOR: the thread author avatar did not open a user profile (census I6)');
    const authorWho = (await page.locator('.profile-name').textContent().catch(() => '') || '').trim();
    if (authorWho !== 'Jordan Kim') errs.push(`P13AUTHORWHO: expected the author's (Jordan Kim) profile, saw "${authorWho}"`);
    // Census I6 (full sweep): a Lists OWNER-COLUMN popover row routes to that
    // user's profile (hover opens the sealed owners popover; the row is a
    // real button emitting user-open).
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Master' }).click({ timeout: 3000 }).catch(e => errs.push('P13MASTERNAV: ' + e.message));
    await page.waitForTimeout(600);
    await page.locator('ui-stakeholder-table .owner-wrap').first().hover({ timeout: 3000 }).catch(e => errs.push('P13OWNERHOVER: ' + e.message));
    await page.waitForTimeout(300);
    const popRows = page.locator('ui-stakeholder-table .owners-pop-row');
    if (await popRows.count() < 1) errs.push('P13OWNERPOP: the owners popover did not open with rows');
    const popWho = (await popRows.first().locator('.owners-pop-name').textContent().catch(() => '') || '').trim();
    await popRows.first().click({ timeout: 3000 }).catch(e => errs.push('P13OWNERROW: ' + e.message));
    await page.waitForTimeout(500);
    if (await page.locator('.profile-page').count() !== 1) errs.push('P13LISTSOWNER: the owners-popover row did not open a user profile (census I6)');
    const listsWho = (await page.locator('.profile-name').textContent().catch(() => '') || '').trim();
    if (!popWho || listsWho !== popWho) errs.push(`P13LISTSWHO: expected "${popWho}"'s profile from the popover row, saw "${listsWho}"`);
    // Phase 14: the RECORD SCAFFOLD — the Map scorecard rail is the sealed
    // page-hosted ui-inspector (11 detail rows; census B3's make-real "Open
    // record" action routes to the record.stakeholder PAGE); the record page
    // flips read↔edit (writes persist through updateStakeholder), its rails
    // collapse independently, Back is a real route; the workspace record
    // embeds the REAL live table.
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Map' }).click({ timeout: 3000 }).catch(e => errs.push('P14MAPNAV: ' + e.message));
    await page.waitForTimeout(500);
    await page.locator('ui-stakeholder-map .dot[aria-label^="Mayor Maria Chen"]').click({ timeout: 3000 }).catch(e => errs.push('P14DOT: ' + e.message));
    await page.waitForTimeout(400);
    const scTitle = (await page.locator('.map-scorecard .det-title').textContent().catch(() => '') || '').trim();
    if (scTitle !== 'Mayor Maria Chen') errs.push(`P14SCORECARD: expected the selected record in the rail, saw "${scTitle}"`);
    const scRows = await page.locator('.map-scorecard .detail-row').count();
    if (scRows !== 11) errs.push(`P14ROWS: expected the sealed 11 detail rows, saw ${scRows}`);
    await page.locator('ui-inspector.map-scorecard ui-icon-button[aria-label="Open record"]').click({ timeout: 3000 }).catch(e => errs.push('P14OPENREC: ' + e.message));
    await page.waitForTimeout(500);
    if (await page.locator('.record-wrap').count() !== 1) errs.push('P14PAGE: the record.stakeholder page did not mount (census B3 make-real)');
    const recTitle = (await page.locator('.record-page-title').textContent().catch(() => '') || '').trim();
    if (recTitle !== 'Mayor Maria Chen') errs.push(`P14TITLE: expected the record page header title, saw "${recTitle}"`);
    // (textContent includes the slotted icon ligature — assert the label tail)
    const backTxt = (await page.locator('.record-topbar ui-button.plan-back').textContent().catch(() => '') || '').trim();
    if (!/Map$/.test(backTxt)) errs.push(`P14BACKLABEL: expected the launching view's label "Map", saw "${backTxt}"`);
    // section nav selects which section renders
    await page.locator('ui-sidebar.record-nav ui-sidebar-item', { hasText: 'Contact' }).click({ timeout: 3000 }).catch(e => errs.push('P14SECTION: ' + e.message));
    await page.waitForTimeout(300);
    const secHead = (await page.locator('.record-section-head').textContent().catch(() => '') || '').trim();
    if (secHead !== 'Contact') errs.push(`P14SECHEAD: expected the Contact section, saw "${secHead}"`);
    // read↔edit parity: Edit flips the SAME section to fields; a phone edit
    // persists through the ONE updateStakeholder seam; Done flips back
    await page.locator('.record-topbar .record-edit-btn').click({ timeout: 3000 }).catch(e => errs.push('P14EDIT: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('.record-section-body input[placeholder="(555) 555-0100"]').click({ timeout: 3000 }).catch(e => errs.push('P14PHONE: ' + e.message));
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('5035550123');
    await page.waitForTimeout(400);
    const phoneSaved = await page.evaluate(() => {
      const shs = JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]');
      return (shs.find(s => s.name === 'Mayor Maria Chen') || {}).phone;
    });
    if (phoneSaved !== '5035550123') errs.push(`P14PATCH: the phone edit did not persist, saw "${phoneSaved}"`);
    await page.locator('.record-topbar .record-edit-btn').click({ timeout: 3000 }).catch(e => errs.push('P14DONE: ' + e.message));
    await page.waitForTimeout(300);
    const phoneRead = (await page.locator('.record-section-body .mf-value').nth(2).textContent().catch(() => '') || '').trim();
    if (!/503.*555.*0123/.test(phoneRead)) errs.push(`P14PARITY: the read state did not re-render the edit, saw "${phoneRead}"`);
    // the right rail collapses independently and reopens
    await page.locator('ui-inspector.record-rail .close-btn').click({ timeout: 3000 }).catch(e => errs.push('P14RAILCLOSE: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('.record-rail-reopen').count() !== 1) errs.push('P14REOPENTAB: the rail reopen control did not appear');
    await page.locator('.record-rail-reopen').click({ timeout: 3000 }).catch(e => errs.push('P14RAILREOPEN: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('ui-inspector.record-rail[open]').count() !== 1) errs.push('P14RAILBACK: the rail did not reopen');
    // Back is a REAL route (never the oracle's no-op — census L1)
    await page.locator('.record-topbar ui-button.plan-back').click({ timeout: 3000 }).catch(e => errs.push('P14BACK: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('.map-wrap').count() !== 1) errs.push('P14BACKROUTE: Back did not return to the launching Map view');
    // record.workspace: the Setup card's declared Open-record → the page with
    // the REAL embedded table (live rows, not the SampleRecord stub form)
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Workspaces' }).click({ timeout: 3000 }).catch(e => errs.push('P14WSNAV: ' + e.message));
    await page.waitForTimeout(500);
    await page.locator('.ws-card', { hasText: 'Google Beam Tour' }).locator('ui-icon-button[aria-label="Open workspace record"]').click({ timeout: 3000 }).catch(e => errs.push('P14WSOPEN: ' + e.message));
    await page.waitForTimeout(500);
    const wsRecTitle = (await page.locator('.record-page-title').textContent().catch(() => '') || '').trim();
    if (wsRecTitle !== 'Google Beam Tour') errs.push(`P14WSREC: expected the workspace record page, saw "${wsRecTitle}"`);
    await page.locator('ui-sidebar.record-nav ui-sidebar-item', { hasText: 'Stakeholders' }).click({ timeout: 3000 }).catch(e => errs.push('P14WSTAB: ' + e.message));
    await page.waitForTimeout(600);
    const embedRows = await page.locator('.record-table-embed ui-stakeholder-table .sheet-row').count();
    if (embedRows !== 4) errs.push(`P14EMBED: expected the workspace's 4 live rows in the embedded table (never the gallery sample), saw ${embedRows}`);
    const embedHasOrtiz = await page.locator('.record-table-embed ui-stakeholder-table .sheet-row', { hasText: 'Provost Lena Ortiz' }).count();
    if (embedHasOrtiz !== 1) errs.push('P14EMBEDROWS: the embedded table did not show THIS workspace\'s stakeholders');
    // Phase 15: workHQ — the intelligence band hosts on Lists (sealed tree:
    // band ABOVE the table, divider between, .intel-split data-mode in the
    // host); the ruled FOUR cards; cold is HIGH-GATED; per-user ignores
    // persist through the store and un-ignore restores; the sealed mode
    // toggle persists per-device; entries drill through (census G1
    // make-real); the cold "View all" lands on Lists PRE-FILTERED via the
    // declared table preset; the summary's mix/plans segments route.
    // Arrange a deterministic signal state (the seed carries no cold/dev
    // fixtures): one HIGH stale (must appear), one MEDIUM staler (must NOT —
    // ruling B), one development, one unscored-by-me, one awaiting vote.
    const p15fx = await page.evaluate(() => {
      const shs = JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]');
      const hi = shs.find(s => s.id === 'sh-01');
      const med = shs.find(s => s.id === 'sh-04');
      hi.lastContact = '2026-01-10';   // ~176 days — cold
      med.lastContact = '2025-12-01';  // staler — but Medium: must NOT appear
      hi.notesHistory = [...(hi.notesHistory || []), {
        id: 'n-smoke15', body: 'Filed a new comment letter on the outfall permit docket',
        at: '2026-07-04T10:00:00.000Z', by: 'u-jordan',
      }];
      localStorage.setItem('hpsm:stakeholders', JSON.stringify(shs));
      const scores = JSON.parse(localStorage.getItem('hpsm:scores') || '{}');
      if (scores['sh-03']) delete scores['sh-03']['tm-alex'];
      localStorage.setItem('hpsm:scores', JSON.stringify(scores));
      const comm = JSON.parse(localStorage.getItem('hpsm:community') || '[]');
      const pac = comm.find(x => x.id === 'ca-03');
      if (pac && pac.votes) delete pac.votes['u-alex'];
      localStorage.setItem('hpsm:community', JSON.stringify(comm));
      localStorage.removeItem('hp_workhq_mode'); // deterministic split start
      const nameOfSh = (id) => (shs.find(s => s.id === id) || {}).name;
      return { hi: nameOfSh('sh-01'), med: nameOfSh('sh-04'), needs: nameOfSh('sh-03'), vote: (pac || {}).name };
    });
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 }).catch(e => errs.push('P15RELOAD: ' + e.message));
    await page.waitForTimeout(1500);
    if (await page.locator('.intel-band').count() !== 1) errs.push('P15BAND: the workHQ band did not render on Lists');
    if (await page.locator('.intel-split[data-mode="split"]').count() !== 1) errs.push('P15HOST: the host .intel-split default data-mode=split is missing');
    if (await page.locator('.intel-card').count() !== 4) errs.push(`P15CARDS: expected the ruled FOUR cards, saw ${await page.locator('.intel-card').count()}`);
    const bandOrder = await page.evaluate(() => {
      const split = document.querySelector('.intel-split');
      const kids = [...split.children].map(el => el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : ''));
      return kids.join(' > ');
    });
    if (!/intel-band.*ui-divider.*ui-stakeholder-table/.test(bandOrder)) errs.push(`P15TREE: expected band > divider > table (sealed host tree), saw "${bandOrder}"`);
    // cold: ONLY the High stale entry; the staler Medium is gated out
    const coldCard = page.locator('.intel-card[data-card="cold"]');
    if (await coldCard.locator('ui-list-item', { hasText: p15fx.hi }).count() !== 1) errs.push('P15COLDIN: the High stale stakeholder is missing from the cold card');
    if (await coldCard.locator('ui-list-item', { hasText: p15fx.med }).count() !== 0) errs.push('P15COLDGATE: a sub-High stale stakeholder leaked into the cold card (ruling B)');
    // alerts carries the development; needs-score reads the CANONICAL
    // team-member-keyed predicate (exactly sh-03 after the tm-alex deletion —
    // the sealed buggy user-id lookup would flood the card with everything)
    if (await page.locator('.intel-card[data-card="alerts"] ui-list-item', { hasText: 'comment letter' }).count() !== 1) errs.push('P15ALERT: the development did not surface in Alerts');
    const needsCard = page.locator('.intel-card[data-card="needs-score"]');
    const needsRows = await needsCard.locator('ui-list-item').count();
    if (needsRows !== 1) errs.push(`P15NEEDS: expected exactly 1 canonical needs-score row, saw ${needsRows} (the sealed bug would show ~all)`);
    if (await needsCard.locator('ui-list-item', { hasText: p15fx.needs }).count() !== 1) errs.push('P15NEEDSWHO: the unscored-by-me stakeholder is missing');
    // needs-score "View all" is honestly inert on Master (sealed
    // Scoring-hidden-on-Master; make-real law: disabled + phase note)
    const needsVA = needsCard.locator('ui-button.intel-view-all');
    if (await needsVA.getAttribute('disabled').catch(() => null) === null) errs.push('P15MASTERGATE: needs-score View-all must be DISABLED on Master (Scoring needs a workspace)');
    // IGNORE (ruling C): per-entry × drops the count, persists per-user
    // through the store, survives reload, un-ignores from the review popover
    await coldCard.locator('ui-list-item ui-icon-button[aria-label^="Ignore:"]').first().click({ timeout: 3000 }).catch(e => errs.push('P15IGNORE: ' + e.message));
    await page.waitForTimeout(400);
    if (await coldCard.locator('ui-list-item').count() !== 0) errs.push('P15IGNOREDROP: the ignored cold entry did not leave the card');
    if (await coldCard.locator('.intel-card-empty').count() !== 1) errs.push('P15IGNOREEMPTY: the emptied cold card must show its empty text');
    const igShape = await page.evaluate(() => JSON.parse(localStorage.getItem('hpsm:intelIgnores') || '{}'));
    if (!Array.isArray(igShape['u-alex']?.cold) || igShape['u-alex'].cold[0] !== 'sh-01') errs.push(`P15IGNORESHAPE: expected {u-alex:{cold:['sh-01']}}, saw ${JSON.stringify(igShape)}`);
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 }).catch(e => errs.push('P15RELOAD2: ' + e.message));
    await page.waitForTimeout(1500);
    if (await page.locator('.intel-card[data-card="cold"] ui-list-item').count() !== 0) errs.push('P15IGNOREPERSIST: the ignore did not survive a reload');
    await page.locator('.intel-card[data-card="cold"] .intel-ignored-btn').click({ timeout: 3000 }).catch(e => errs.push('P15IGNBTN: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('ui-menu.intel-ignored-menu[open] ui-menu-item', { hasText: p15fx.hi }).click({ timeout: 3000 }).catch(e => errs.push('P15RESTORE: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('.intel-card[data-card="cold"] ui-list-item', { hasText: p15fx.hi }).count() !== 1) errs.push('P15UNIGNORE: un-ignoring did not restore the entry');
    // KEYBOARD ignore (audit fix 1): Enter on the focused slotted ignore
    // button must activate THE BUTTON (entry ignored), never the row (the
    // record must NOT open) — ui-list-item leaves slotted keys alone
    await page.evaluate(() => {
      document.querySelector('.intel-card[data-card="cold"] ui-list-item ui-icon-button[aria-label^="Ignore:"]')?.focus();
    });
    await page.keyboard.press('Enter');
    await page.waitForTimeout(400);
    if (await page.locator('ui-dialog.sh-dialog[open]').count() !== 0) errs.push('P15KBDIGNORE: Enter on the ignore button row-activated into the record');
    if (await page.locator('.intel-card[data-card="cold"] ui-list-item').count() !== 0) errs.push('P15KBDIGNORE2: Enter on the ignore button did not ignore the entry');
    await page.locator('.intel-card[data-card="cold"] .intel-ignored-btn').click({ timeout: 3000 }).catch(e => errs.push('P15KBDRESTOREBTN: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-menu.intel-ignored-menu[open] ui-menu-item', { hasText: p15fx.hi }).click({ timeout: 3000 }).catch(e => errs.push('P15KBDRESTORE: ' + e.message));
    await page.waitForTimeout(300);
    if (await page.locator('.intel-card[data-card="cold"] ui-list-item', { hasText: p15fx.hi }).count() !== 1) errs.push('P15KBDRESTORE2: restoring the keyboard-ignored entry failed');
    // "Ignore all" folds the whole card at once (votes card, 1 entry)
    await page.locator('.intel-card[data-card="votes"] ui-button.intel-ignore-all').click({ timeout: 3000 }).catch(e => errs.push('P15IGNALL: ' + e.message));
    await page.waitForTimeout(300);
    if (await page.locator('.intel-card[data-card="votes"] ui-list-item').count() !== 0) errs.push('P15IGNALLDROP: Ignore all left entries behind');
    await page.locator('.intel-card[data-card="votes"] .intel-ignored-btn').click({ timeout: 3000 }).catch(e => errs.push('P15IGNBTN2: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-menu.intel-ignored-menu[open] ui-menu-item').first().click({ timeout: 3000 }).catch(e => errs.push('P15RESTORE2: ' + e.message));
    await page.waitForTimeout(300);
    // MODE TOGGLE (sealed three modes; per-device persistence): table mode
    // folds the cards to the head summary (with the ruled mix/plans chips)
    await page.locator('.intel-modes ui-icon-button[aria-label="Expand table"]').click({ timeout: 3000 }).catch(e => errs.push('P15MODE: ' + e.message));
    await page.waitForTimeout(300);
    if (await page.locator('.intel-split[data-mode="table"]').count() !== 1) errs.push('P15TABLEMODE: data-mode did not flip to table');
    if (await page.locator('.intel-card').count() !== 0) errs.push('P15TABLECARDS: cards must not render in table mode (sealed)');
    // audit fix 2: re-clicking the ACTIVE mode button must keep the on-state
    // (sealed head: the active mode always carries selected; self-toggling
    // is opt-in via the icon-button `toggle` attr, absent here)
    await page.locator('.intel-modes ui-icon-button[aria-label="Expand table"]').click({ timeout: 3000 }).catch(e => errs.push('P15MODERECLICK: ' + e.message));
    await page.waitForTimeout(300);
    if (await page.locator('.intel-modes ui-icon-button[aria-label="Expand table"][selected]').count() !== 1) errs.push('P15MODESTICK: re-clicking the active mode button dropped its selected indicator');
    const sumText = (await page.locator('.intel-summary-text').textContent().catch(() => '') || '').trim();
    if (!/going cold|need your score|awaiting your vote/.test(sumText)) errs.push(`P15SUMMARY: expected the sealed summary join, saw "${sumText}"`);
    await page.reload({ waitUntil: 'networkidle', timeout: 30000 }).catch(e => errs.push('P15RELOAD3: ' + e.message));
    await page.waitForTimeout(1500);
    if (await page.locator('.intel-split[data-mode="table"]').count() !== 1) errs.push('P15MODEPERSIST: the layout mode did not survive a reload');
    // ruled summary routes: mix chip → Map; plans chip → Plans
    await page.locator('.intel-summary ui-chip.intel-mix-chip').click({ timeout: 3000 }).catch(e => errs.push('P15MIXCHIP: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('.map-wrap').count() !== 1) errs.push('P15MIXROUTE: the mix segment did not route to Map');
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Lists' }).click({ timeout: 3000 }).catch(e => errs.push('P15BACK1: ' + e.message));
    await page.waitForTimeout(500);
    await page.locator('.intel-summary ui-chip.intel-plans-chip').click({ timeout: 3000 }).catch(e => errs.push('P15PLANSCHIP: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('.plan-toolbar').count() !== 1) errs.push('P15PLANSROUTE: the plans segment did not route to Plans');
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Lists' }).click({ timeout: 3000 }).catch(e => errs.push('P15BACK2: ' + e.message));
    await page.waitForTimeout(500);
    // back to split for the drill-throughs
    await page.locator('.intel-modes ui-icon-button[aria-label="Split view"]').click({ timeout: 3000 }).catch(e => errs.push('P15MODE2: ' + e.message));
    await page.waitForTimeout(400);
    // census G1 make-real: an Alerts entry opens the stakeholder READ view
    // (A20/I4 — Edit one click away)
    await page.locator('.intel-card[data-card="alerts"] ui-list-item', { hasText: 'comment letter' }).click({ timeout: 3000 }).catch(e => errs.push('P15DRILL: ' + e.message));
    await page.waitForTimeout(500);
    if (await page.locator('ui-dialog.sh-dialog[open]').count() !== 1) errs.push('P15DRILLOPEN: the alert entry did not open the stakeholder record');
    // read-view-SPECIFIC markers (audit fix 7): .prof-header exists only on
    // the read profile; .sh-title only on the edit/create form ("Edit
    // stakeholder" text matches BOTH surfaces — the read view's flip button
    // and the form title — so it proves nothing)
    if (await page.locator('ui-dialog.sh-dialog[open] .prof-header').count() !== 1) errs.push('P15READVIEW: the drill must land on the READ view (.prof-header, A20 ruling)');
    if (await page.locator('ui-dialog.sh-dialog[open] .sh-title').count() !== 0) errs.push('P15READVIEW2: the drill landed on the EDIT form, not the read view');
    await page.evaluate(() => document.querySelectorAll('ui-dialog').forEach(d => d.close && d.close()));
    await page.waitForTimeout(300);
    // a Vote entry drills to that community entry's read page
    await page.locator('.intel-card[data-card="votes"] ui-list-item', { hasText: 'Vote:' }).click({ timeout: 3000 }).catch(e => errs.push('P15VOTEDRILL: ' + e.message));
    await page.waitForTimeout(600);
    const p15CommTitle = (await page.locator('.comm-profile .plan-review-toolbar-title').textContent().catch(() => '') || '').trim();
    if (p15CommTitle !== p15fx.vote) errs.push(`P15VOTEROUTE: expected the "${p15fx.vote}" read page, saw "${p15CommTitle}"`);
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Lists' }).click({ timeout: 3000 }).catch(e => errs.push('P15BACK3: ' + e.message));
    await page.waitForTimeout(500);
    // ruled cold "View all": Lists PRE-FILTERED (High only, stalest first)
    // via the declared table preset; the band collapses to table mode.
    // Arm an orthogonal filter FIRST (audit fix 5): the preset is a clean
    // slate — a leftover search must not intersect the landing.
    await page.evaluate(() => {
      const t = document.querySelector('ui-stakeholder-table');
      const sf = t.shadowRoot.querySelector('.search-field');
      sf.value = 'zzz-no-row-matches-this';
      sf.dispatchEvent(new Event('input'));
    });
    await page.waitForTimeout(300);
    if (await page.evaluate(() => document.querySelector('ui-stakeholder-table').shadowRoot.querySelectorAll('.sheet-row').length) !== 0) errs.push('P15PRESETARM: the arming search did not filter the table');
    await page.locator('.intel-card[data-card="cold"] ui-button.intel-view-all').click({ timeout: 3000 }).catch(e => errs.push('P15COLDVA: ' + e.message));
    await page.waitForTimeout(500);
    if (await page.locator('.intel-split[data-mode="table"]').count() !== 1) errs.push('P15COLDMODE: cold View-all must collapse the band to table mode');
    const preset = await page.evaluate(() => {
      const t = document.querySelector('ui-stakeholder-table');
      const rows = [...t.shadowRoot.querySelectorAll('.sheet-row')];
      const firstName = rows.length ? (rows[0].querySelector('[data-key="name"]')?.textContent || '').trim() : '';
      const shs = JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]');
      const searchVal = t.shadowRoot.querySelector('.search-field').value;
      return { shown: rows.length, high: shs.filter(s => s.priority === 'High').length, firstName, searchVal };
    });
    if (preset.searchVal !== '') errs.push(`P15PRESETSLATE: the preset must clear the orthogonal search, saw "${preset.searchVal}"`);
    if (preset.shown !== preset.high) errs.push(`P15PRESET: expected the ${preset.high} High-priority rows, saw ${preset.shown}`);
    if (!preset.firstName.includes(p15fx.hi)) errs.push(`P15PRESETSORT: expected the stalest High row first ("${p15fx.hi}"), saw "${preset.firstName}"`);
    // Phase 16: Command palette — the sealed ⌘K chord opens the blurred-veil
    // palette (empty query = NO results block); a query groups results across
    // the 5 entity types; Enter routes the active row to the stakeholder READ
    // view (census A20); Escape closes; the top-bar Search button is the
    // second live trigger; a community / plan / workspace / person row each
    // routes through its guarded first-class seam.
    await page.keyboard.press('ControlOrMeta+k');
    await page.waitForTimeout(500);
    if (await page.locator('ui-dialog.cmdk-dialog[open]').count() !== 1) errs.push('P16OPEN: the ⌘K chord did not open the palette');
    if (await page.locator('.cmdk-results').count() !== 0) errs.push('P16INITIAL: an empty query must render NO results block (sealed)');
    // sealed empty state + the disabled Enter commit on a no-hit query
    await page.keyboard.type('zzzqqq-no-hit');
    await page.waitForTimeout(400);
    const p16Empty = (await page.locator('.cmdk-empty').textContent().catch(() => '') || '').trim();
    if (p16Empty !== 'No matches.') errs.push(`P16EMPTY: expected the sealed "No matches.", saw "${p16Empty}"`);
    if (await page.locator('ui-button.cmdk-go[disabled]').count() !== 1) errs.push('P16GODISABLED: the Enter commit must be DISABLED with no results');
    // Escape closes (sealed input handler + the dialog's native dismissal)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    if (await page.locator('ui-dialog.cmdk-dialog[open]').count() !== 0) errs.push('P16ESC: Escape did not close the palette');
    // stakeholder route: reopen, type, Enter on the active (first) row →
    // Master Lists + the record's READ view (A20/I4 — never straight to edit)
    await page.keyboard.press('ControlOrMeta+k');
    await page.waitForTimeout(500);
    await page.keyboard.type('Maria Chen');
    await page.waitForTimeout(400);
    const p16FirstType = (await page.locator('.cmdk-row ui-chip.cmdk-type').first().textContent().catch(() => '') || '').trim();
    if (p16FirstType !== 'Stakeholder') errs.push(`P16TYPE: expected the first group Stakeholder, saw "${p16FirstType}"`);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
    if (await page.locator('ui-dialog.cmdk-dialog[open]').count() !== 0) errs.push('P16GOCLOSE: navigating must close the palette (sealed go → onClose)');
    if (await page.locator('ui-dialog.sh-dialog[open] .prof-header').count() !== 1) errs.push('P16SHROUTE: Enter did not land on the stakeholder READ view (A20)');
    await page.evaluate(() => document.querySelectorAll('ui-dialog').forEach(d => d.close && d.close()));
    await page.waitForTimeout(300);
    // top-bar Search button (the second sealed trigger, now live)
    await page.locator('ui-app-bar ui-icon-button[aria-label="Search"]').click({ timeout: 3000 }).catch(e => errs.push('P16BTN: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('ui-dialog.cmdk-dialog[open]').count() !== 1) errs.push('P16BTNOPEN: the top-bar Search button did not open the palette');
    // community route (click a row; label = c.name even on a recipient hit)
    await page.keyboard.type('STEM Classroom');
    await page.waitForTimeout(400);
    await page.locator('.cmdk-row', { hasText: 'Cedarville STEM Classroom Grant' }).click({ timeout: 3000 }).catch(e => errs.push('P16CMY: ' + e.message));
    await page.waitForTimeout(600);
    const p16CommTitle = (await page.locator('.comm-profile .plan-review-toolbar-title').textContent().catch(() => '') || '').trim();
    if (p16CommTitle !== 'Cedarville STEM Classroom Grant') errs.push(`P16CMYROUTE: expected that entry's Community read view, saw "${p16CommTitle}"`);
    // plan route → Plans with the plan open in REVIEW (A21, real router state)
    await page.keyboard.press('ControlOrMeta+k');
    await page.waitForTimeout(500);
    await page.keyboard.type('Engagement Plan');
    await page.waitForTimeout(400);
    await page.locator('.cmdk-row', { has: page.locator('ui-chip.cmdk-type', { hasText: 'Plan' }) }).first().click({ timeout: 3000 }).catch(e => errs.push('P16PLN: ' + e.message));
    await page.waitForTimeout(600);
    const p16PlanTitle = (await page.locator('.plan-review-toolbar-title').textContent().catch(() => '') || '').trim();
    if (!p16PlanTitle.includes('Engagement Plan')) errs.push(`P16PLNROUTE: expected the plan open in REVIEW, saw "${p16PlanTitle}"`);
    // workspace route → that workspace's Lists tab (guarded A23)
    await page.keyboard.press('ControlOrMeta+k');
    await page.waitForTimeout(500);
    await page.keyboard.type('Google Beam');
    await page.waitForTimeout(400);
    await page.locator('.cmdk-row', { hasText: 'Google Beam Tour' }).click({ timeout: 3000 }).catch(e => errs.push('P16WSP: ' + e.message));
    await page.waitForTimeout(600);
    const p16WsName = (await page.locator('.ws-select-name').textContent().catch(() => '') || '').trim();
    if (p16WsName !== 'Google Beam Tour') errs.push(`P16WSPROUTE: expected the workspace active on Lists, saw "${p16WsName}"`);
    // person route (match by TITLE; the system user must never surface) →
    // that user's profile page (A24)
    await page.keyboard.press('ControlOrMeta+k');
    await page.waitForTimeout(500);
    await page.keyboard.type('Public Policy Lead');
    await page.waitForTimeout(400);
    const p16PersonRows = await page.locator('.cmdk-row').count();
    if (p16PersonRows !== 1) errs.push(`P16PERSON: expected the one title match, saw ${p16PersonRows} rows`);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(600);
    const p16ProfName = (await page.locator('.profile-name').textContent().catch(() => '') || '').trim();
    if (p16ProfName !== 'Jordan Kim') errs.push(`P16USRROUTE: expected Jordan Kim's profile page, saw "${p16ProfName}"`);
    // the system user is EXCLUDED from People (sealed filter)
    await page.keyboard.press('ControlOrMeta+k');
    await page.waitForTimeout(500);
    await page.keyboard.type('Automated reminders');
    await page.waitForTimeout(400);
    if (await page.locator('.cmdk-row').count() !== 0) errs.push('P16SYSTEM: the system user leaked into People results');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    // Phase 17: BULK ACTIONS on Lists — the opt-in selection column (REAL
    // ui-checkbox per row), the host action bar (appears at ≥1 selected),
    // Set-priority as ONE stamped write, select-all-FILTERED via the header
    // tri-state, Export-selected over exactly the selection, shift-click
    // range extension, Clear. (Virtualization is proven separately at 2k
    // rows by scripts/scale-probe.mjs — the demo seed sits under the
    // threshold, where rendering is sealed-identical.)
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Master' }).click({ timeout: 3000 }).catch(e => errs.push('P17NAV: ' + e.message));
    await page.waitForTimeout(600);
    if (await page.locator('.bulk-bar').count() !== 0) errs.push('P17BAR0: the action bar must not render with nothing selected');
    const p17cbs = page.locator('ui-stakeholder-table .sheet-row ui-checkbox');
    if (await p17cbs.count() < 4) errs.push(`P17COL: expected the selectable checkbox column on Lists, saw ${await p17cbs.count()} boxes`);
    for (let i = 0; i < 3; i++) {
      await p17cbs.nth(i).click({ timeout: 3000 }).catch(e => errs.push(`P17PICK${i}: ` + e.message));
      await page.waitForTimeout(200);
    }
    if (await page.locator('.bulk-bar').count() !== 1) errs.push('P17BAR: the action bar did not appear on selection');
    const p17count = (await page.locator('.bulk-bar .bulk-count').textContent().catch(() => '') || '').trim();
    if (p17count !== '3 selected') errs.push(`P17COUNT: expected "3 selected", saw "${p17count}"`);
    // capture the selected ids + their pre-action stamps (the table's public
    // selection property is the declared host contract)
    const p17before = await page.evaluate(() => {
      const t = document.querySelector('ui-stakeholder-table');
      const shs = JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]');
      return t.selection.map(id => {
        const s = shs.find(x => x.id === id) || {};
        return { id, priority: s.priority, updatedAt: s.updatedAt };
      });
    });
    if (p17before.length !== 3) errs.push(`P17SEL: expected 3 ids on the selection property, saw ${p17before.length}`);
    // Set priority → Low (ONE setState through the pure builder; stamps updatedAt)
    await page.locator('#bulk-priority-btn').click({ timeout: 3000 }).catch(e => errs.push('P17PRIOBTN: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-menu.bulk-menu-priority[open] ui-menu-item', { hasText: 'Low' }).click({ timeout: 3000 }).catch(e => errs.push('P17PRIOPICK: ' + e.message));
    await page.waitForTimeout(500);
    const p17after = await page.evaluate((ids) => {
      const shs = JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]');
      return ids.map(id => {
        const s = shs.find(x => x.id === id) || {};
        return { id, priority: s.priority, updatedAt: s.updatedAt };
      });
    }, p17before.map(b => b.id));
    for (const b of p17before) {
      const a = p17after.find(x => x.id === b.id) || {};
      if (a.priority !== 'Low') errs.push(`P17WRITE: ${b.id} priority expected Low, saw "${a.priority}"`);
      // honest per-row no-op (audit F5): an already-Low row keeps its stamp;
      // a changed row must be freshly stamped
      if (b.priority !== 'Low' && (!a.updatedAt || a.updatedAt === b.updatedAt)) errs.push(`P17STAMP: ${b.id} updatedAt was not freshly stamped`);
      if (b.priority === 'Low' && a.updatedAt !== b.updatedAt) errs.push(`P17NOOP: already-Low ${b.id} took a phantom updatedAt stamp`);
    }
    // honest snackbar count (audit F5): reports rows the write ACTUALLY
    // changed, naming already-satisfied rows instead of absorbing them
    const p17landed = p17before.filter(b => b.priority !== 'Low').length;
    const p17noun = (n) => `${n} stakeholder${n === 1 ? '' : 's'}`;
    const p17expectSnack = p17landed === 0
      ? `No change — ${p17noun(3)} already had it`
      : p17landed === 3
        ? `Priority set to Low for ${p17noun(3)}`
        : `Priority set to Low for ${p17noun(p17landed)} · ${3 - p17landed} already had it`;
    const p17snack = (await page.locator('.sheet-wrap ui-snackbar').getAttribute('message').catch(() => '') || '').trim();
    if (p17snack !== p17expectSnack) errs.push(`P17SNACK: expected "${p17expectSnack}", saw "${p17snack}"`);
    const p17countAfter = (await page.locator('.bulk-bar .bulk-count').textContent().catch(() => '') || '').trim();
    if (p17countAfter !== '3 selected') errs.push(`P17KEEP: the selection must survive the bulk write, saw "${p17countAfter}"`);
    // select-all-FILTERED via the header checkbox (from 'some' → all)
    await page.locator('ui-stakeholder-table .sheet-head ui-checkbox').click({ timeout: 3000 }).catch(e => errs.push('P17ALL: ' + e.message));
    await page.waitForTimeout(400);
    const p17total = await page.evaluate(() => JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]').length);
    const p17allCount = (await page.locator('.bulk-bar .bulk-count').textContent().catch(() => '') || '').trim();
    if (p17allCount !== `${p17total} selected`) errs.push(`P17ALLCOUNT: expected "${p17total} selected" (the FILTERED set = all on Master), saw "${p17allCount}"`);
    // Export selected: the sealed CSV path over exactly the selection
    await page.evaluate(() => {
      const t = document.querySelector('ui-stakeholder-table');
      t.addEventListener('export-csv', (e) => {
        document.body.dataset.p17csvLines = String(e.detail.csv.trim().split('\n').length);
      }, { once: true });
    });
    await page.locator('.bulk-bar ui-button', { hasText: 'Export selected' }).click({ timeout: 3000 }).catch(e => errs.push('P17EXPBTN: ' + e.message));
    await page.waitForTimeout(400);
    const p17csvLines = await page.evaluate(() => document.body.dataset.p17csvLines);
    if (p17csvLines !== String(p17total + 1)) errs.push(`P17EXPORT: expected header + ${p17total} selected rows, saw ${p17csvLines} CSV lines`);
    // Clear selection → bar retires
    await page.locator('.bulk-bar ui-button', { hasText: 'Clear selection' }).click({ timeout: 3000 }).catch(e => errs.push('P17CLEARBTN: ' + e.message));
    await page.waitForTimeout(300);
    if (await page.locator('.bulk-bar').count() !== 0) errs.push('P17CLEAR: clearing must retire the action bar');
    // shift-click range: row 0, then shift row 3 → 4 selected
    await p17cbs.nth(0).click({ timeout: 3000 }).catch(e => errs.push('P17RANGE0: ' + e.message));
    await page.waitForTimeout(200);
    await p17cbs.nth(3).click({ modifiers: ['Shift'], timeout: 3000 }).catch(e => errs.push('P17RANGE3: ' + e.message));
    await page.waitForTimeout(300);
    const p17range = (await page.locator('.bulk-bar .bulk-count').textContent().catch(() => '') || '').trim();
    if (p17range !== '4 selected') errs.push(`P17RANGE: shift-click expected "4 selected", saw "${p17range}"`);
    await page.locator('.bulk-bar ui-button', { hasText: 'Clear selection' }).click({ timeout: 3000 }).catch(e => errs.push('P17CLEAR2: ' + e.message));
    await page.waitForTimeout(300);
    // PRUNE CONTRACT (RULED 2026-07-05, audit F2): a pipeline change PRUNES
    // the selection — filter the picked rows away and the selection (and the
    // bar) is GONE, and clearing the filter must NOT resurrect it.
    await p17cbs.nth(0).click({ timeout: 3000 }).catch(e => errs.push('P17PRUNE0: ' + e.message));
    await page.waitForTimeout(300);
    if (await page.locator('.bulk-bar').count() !== 1) errs.push('P17PRUNE1: expected the bar before the prune drive');
    await page.locator('ui-stakeholder-table .search-field input').fill('zzz-prune-probe', { timeout: 3000 }).catch(e => errs.push('P17PRUNEQ: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('.bulk-bar').count() !== 0) errs.push('P17PRUNE: a search excluding the picked row must prune the selection (bar still up)');
    await page.locator('ui-stakeholder-table .search-field input').fill('', { timeout: 3000 }).catch(e => errs.push('P17PRUNEC: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('.bulk-bar').count() !== 0) errs.push('P17PRUNE2: clearing the search must not resurrect the pruned selection');
    // Phase 18: IMPORT WIZARD — the footer Import affordance opens the sealed
    // 4-step ui-dialog flow; a synthetic CSV (2 valid rows + 1 deliberate
    // Unknown-Category row) drives upload → auto-map → validation preview →
    // skip-invalid commit → snackbar → the rows land in the table.
    const p18CountBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]').length);
    await page.locator('ui-stakeholder-table .import-btn').click({ timeout: 3000 }).catch(e => errs.push('P18BTN: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('ui-dialog.import-dialog[open]').count() !== 1) errs.push('P18OPEN: the import wizard did not open');
    const p18csv = [
      'Stakeholder,Organization,Category,Type,Market,Region,Geography,Priority,Status,x,Relationship',
      '"Import Probe One","Acme Imports",Government,Mayor,Americas,United States,Local,High,Active,3.4,Collaborate',
      '"Import Probe Two","Beta Imports",Communities,Church,Americas,Canada,Local,Medium,Watch,,',
      '"Import Probe Bad","Gamma Imports",Aliens,Mayor,Americas,United States,Local,High,Active,,',
    ].join('\n');
    await page.locator('ui-dropzone input[type="file"]').setInputFiles({
      name: 'probe.csv', mimeType: 'text/csv', buffer: Buffer.from(p18csv),
    }, { timeout: 3000 }).catch(e => errs.push('P18FILE: ' + e.message));
    await page.waitForTimeout(600);
    // step 2: auto-map — 9 input columns auto-matched, x/Relationship computed
    const p18MapRows = await page.locator('.import-map-table tbody tr').count();
    if (p18MapRows !== 11) errs.push(`P18MAP: expected 11 header rows in the column map, saw ${p18MapRows}`);
    const p18Auto = await page.locator('.import-map-table ui-chip', { hasText: 'auto-matched' }).count();
    if (p18Auto !== 9) errs.push(`P18AUTO: expected 9 auto-matched chips, saw ${p18Auto}`);
    const p18Comp = await page.locator('.import-map-table ui-chip', { hasText: 'Computed — skipped' }).count();
    if (p18Comp !== 2) errs.push(`P18COMP: expected 2 "Computed — skipped" chips (x, Relationship), saw ${p18Comp}`);
    // FIX F2: computed-named headers render a LIVE ui-select too (11 of 11
    // rows) — a file whose own data uses a header literally named
    // "Relationship" can be remapped to any input target; drive the remap
    // (Relationship → Notes) and verify the pipeline honors it end-to-end.
    const p18Selects = await page.locator('.import-map-table ui-select').count();
    if (p18Selects !== 11) errs.push(`P18SEL: expected a mapping ui-select on all 11 header rows (computed included), saw ${p18Selects}`);
    const p18RelRow = page.locator('.import-map-table tbody tr', { hasText: 'Relationship' });
    await p18RelRow.locator('ui-select').click({ timeout: 3000 }).catch(e => errs.push('P18REMAPOPEN: ' + e.message));
    await page.waitForTimeout(300);
    await p18RelRow.locator('ui-option', { hasText: 'Notes' }).click({ timeout: 3000 }).catch(e => errs.push('P18REMAPPICK: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('.import-map-table tbody tr', { hasText: 'Relationship' }).locator('ui-chip', { hasText: 'mapped by hand' }).count() !== 1) {
      errs.push('P18REMAPCHIP: the remapped computed header must show the "mapped by hand" chip');
    }
    await page.locator('.import-actions ui-button', { hasText: 'Next' }).click({ timeout: 3000 }).catch(e => errs.push('P18NEXT2: ' + e.message));
    await page.waitForTimeout(500);
    // step 3: the sealed summary + error chip + skip-invalid default ON
    const p18Summary = (await page.locator('.import-summary').textContent().catch(() => '') || '').trim();
    if (p18Summary !== '2 rows ready · 1 row with errors') errs.push(`P18SUMMARY: expected "2 rows ready · 1 row with errors", saw "${p18Summary}"`);
    if (await page.locator('.import-preview-table ui-chip[variant="error"]', { hasText: 'Unknown Category value' }).count() !== 1) {
      errs.push('P18ERRCHIP: the Unknown-Category error chip did not render');
    }
    // FIX F1 (sealed ~3909): the offending CELL itself carries the table's
    // error state — exactly one lit cell (the bad row's Category), lit via
    // the ui-data-table cell-state hook (class cell-error / part cell-error).
    // NOTE: the lit cell renders EMPTY — a rejected value never lands in
    // values (sealed: never coerced), so the highlight + chip carry the story.
    const p18ErrCells = page.locator('.import-preview-table td.cell-error');
    if (await p18ErrCells.count() !== 1) {
      errs.push(`P18ERRCELL: expected exactly 1 error-highlighted cell, saw ${await p18ErrCells.count()}`);
    }
    if (await page.locator('.import-preview-table tbody tr', { hasText: 'Gamma Imports' }).locator('td.cell-error').count() !== 1) {
      errs.push('P18ERRCELLROW: the lit cell must sit in the invalid (Gamma Imports) row');
    }
    if (await page.locator('.import-preview-table tbody tr', { hasText: 'Acme Imports' }).locator('td.cell-error').count() !== 0) {
      errs.push('P18ERRCELLVALID: valid rows must carry no lit cells');
    }
    const p18Switch = await page.locator('.import-validate-head ui-switch').getAttribute('selected').catch(() => null);
    if (p18Switch === null) errs.push('P18SKIP: "Skip invalid rows" must default ON');
    await page.locator('.import-actions ui-button', { hasText: 'Next' }).click({ timeout: 3000 }).catch(e => errs.push('P18NEXT3: ' + e.message));
    await page.waitForTimeout(400);
    // step 4: skip-invalid commit — "Import 2 stakeholders"
    const p18CommitLabel = (await page.locator('.import-commit-btn').textContent().catch(() => '') || '').trim();
    if (p18CommitLabel !== 'Import 2 stakeholders') errs.push(`P18COMMITLBL: expected "Import 2 stakeholders", saw "${p18CommitLabel}"`);
    await page.locator('.import-commit-btn').click({ timeout: 3000 }).catch(e => errs.push('P18COMMIT: ' + e.message));
    await page.waitForTimeout(600);
    if (await page.locator('ui-dialog.import-dialog[open]').count() !== 0) errs.push('P18CLOSE: the wizard must close on commit');
    const p18Snack = (await page.locator('.sheet-wrap ui-snackbar').getAttribute('message').catch(() => '') || '').trim();
    if (p18Snack !== 'Imported 2 stakeholders') errs.push(`P18SNACK: expected "Imported 2 stakeholders", saw "${p18Snack}"`);
    const p18After = await page.evaluate(() => {
      const shs = JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]');
      const a = shs.find(s => s.org === 'Acme Imports');
      return { count: shs.length, acme: a ? { owners: a.owners, createdAt: !!a.createdAt, category: a.category, notes: a.notes } : null };
    });
    if (p18After.count !== p18CountBefore + 2) errs.push(`P18LAND: expected ${p18CountBefore + 2} stakeholders after import, saw ${p18After.count}`);
    if (!p18After.acme) errs.push('P18ROW: the imported Acme Imports row did not land');
    else {
      if (!p18After.acme.owners || !p18After.acme.owners.length) errs.push('P18OWNER: imported rows must default owners to the importer');
      if (!p18After.acme.createdAt) errs.push('P18STAMP: imported rows must carry audit stamps');
      if (p18After.acme.category !== 'Government') errs.push(`P18CAT: expected Government, saw "${p18After.acme.category}"`);
      // FIX F2 landing proof: the remapped computed-named column ("Relationship"
      // → Notes) committed as INPUT — Acme's Relationship cell was "Collaborate"
      if (p18After.acme.notes !== 'Collaborate') errs.push(`P18REMAPLAND: expected the remapped column to land in notes ("Collaborate"), saw "${p18After.acme.notes}"`);
    }
    if (await page.locator('ui-stakeholder-table .sheet-row', { hasText: 'Import Probe One' }).count() !== 1) {
      errs.push('P18TABLE: the imported stakeholder is not visible in the Lists table');
    }
    // ROUND-TRIP PROBE (gate 3, in the real browser): export the CURRENT set
    // via the sealed export path, re-import the file — zero errors, computed
    // columns skipped, every row lands.
    const p18Export = await page.evaluate(() => new Promise((resolve) => {
      const t = document.querySelector('ui-stakeholder-table');
      t.addEventListener('export-csv', (e) => resolve(e.detail.csv), { once: true });
      t.shadowRoot.querySelector('.export-btn').click();
    }));
    const p18RtRows = p18Export.trim().split('\n').length - 1; // minus header (no embedded newlines in seed data)
    await page.locator('ui-stakeholder-table .import-btn').click({ timeout: 3000 }).catch(e => errs.push('P18RTBTN: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('ui-dropzone input[type="file"]').setInputFiles({
      name: 'export.csv', mimeType: 'text/csv', buffer: Buffer.from(p18Export),
    }, { timeout: 3000 }).catch(e => errs.push('P18RTFILE: ' + e.message));
    await page.waitForTimeout(600);
    await page.locator('.import-actions ui-button', { hasText: 'Next' }).click({ timeout: 3000 }).catch(e => errs.push('P18RTNEXT: ' + e.message));
    await page.waitForTimeout(600);
    const p18RtSummary = (await page.locator('.import-summary').textContent().catch(() => '') || '').trim();
    if (p18RtSummary !== `${p18RtRows} rows ready · 0 rows with errors`) {
      errs.push(`P18RT: round-trip expected "${p18RtRows} rows ready · 0 rows with errors", saw "${p18RtSummary}"`);
    }
    await page.locator('.import-actions ui-button', { hasText: 'Next' }).click({ timeout: 3000 }).catch(e => errs.push('P18RTNEXT2: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('.import-commit-btn').click({ timeout: 3000 }).catch(e => errs.push('P18RTCOMMIT: ' + e.message));
    await page.waitForTimeout(700);
    const p18RtCount = await page.evaluate(() => JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]').length);
    if (p18RtCount !== p18CountBefore + 2 + p18RtRows) errs.push(`P18RTLAND: expected ${p18CountBefore + 2 + p18RtRows} after the round-trip import, saw ${p18RtCount}`);
    const p18RtSnack = (await page.locator('.sheet-wrap ui-snackbar').getAttribute('message').catch(() => '') || '').trim();
    if (p18RtSnack !== `Imported ${p18RtRows} stakeholders`) errs.push(`P18RTSNACK: expected "Imported ${p18RtRows} stakeholders", saw "${p18RtSnack}"`);
    // Phase 20: REPLAY from the profile menu (sealed "replayable from the
    // profile menu") — the tour returns to Lists and restarts at step 1.
    await page.locator('#me-anchor').click({ timeout: 3000 }).catch(e => errs.push('P20RMENU: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-menu.profile-menu ui-menu-item', { hasText: 'Replay tour' }).click({ timeout: 3000 }).catch(e => errs.push('P20RITEM: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('ui-coachmark.app-tour[open]').count() !== 1) errs.push('P20REPLAY: the profile-menu replay did not reopen the tour');
    const p20R = await page.evaluate(() => document.querySelector('ui-coachmark.app-tour')?.shadowRoot.querySelector('.counter').textContent || '');
    if (p20R !== '1 of 7') errs.push(`P20REPLAY: replay must restart at "1 of 7", saw "${p20R}"`);
    if (await page.locator('.sheet-wrap').count() !== 1) errs.push('P20REPLAY: replay must land on Lists (the tour home)');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    // Phase 19 — DEMO POLISH: (a) plan → Word export (capture the download,
    // assert the blob MIME, unzip-validate the bytes node-side with the
    // Phase-18 reader); (b) reset-demo-data → the seed restores; (c) blank
    // start → every page renders a designed, actionable empty state and
    // CREATE works end-to-end (workspace → stakeholder → scoring team).
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Plans' }).click({ timeout: 3000 }).catch(e => errs.push('P19NAV: ' + e.message));
    await page.waitForTimeout(500);
    await page.locator('.plan-card-actions ui-button', { hasText: 'Review' }).first().click({ timeout: 3000 }).catch(e => errs.push('P19REVIEW: ' + e.message));
    await page.waitForTimeout(500);
    const p19Title = (await page.locator('.plan-review-toolbar-title').textContent().catch(() => '') || '').trim();
    if (await page.locator('.plan-editor-bar .plan-export-btn').count() !== 1) errs.push('P19BTN: the review toolbar Export control is missing');
    if (await page.locator('.plan-editor-bar .plan-print-btn').count() !== 1) errs.push('P19PRINT: the Print / Save as PDF control is missing');
    if (await page.locator('body > .plan-print-sheet').count() !== 1) errs.push('P19SHEET: the body-level print sheet portal is missing');
    const p19Cap = await page.evaluate(() => new Promise((resolve, reject) => {
      const orig = URL.createObjectURL;
      const timer = setTimeout(() => { URL.createObjectURL = orig; reject(new Error('no download captured')); }, 4000);
      URL.createObjectURL = (blob) => {
        clearTimeout(timer);
        URL.createObjectURL = orig;
        blob.arrayBuffer().then((buf) => {
          const u8 = new Uint8Array(buf);
          let s = '';
          for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
          resolve({ type: blob.type, b64: btoa(s) });
        });
        return orig.call(URL, blob);
      };
      document.querySelector('.plan-editor-bar .plan-export-btn').click();
    })).catch(e => { errs.push('P19EXPORT: ' + e.message); return null; });
    if (p19Cap) {
      if (p19Cap.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        errs.push(`P19MIME: expected the .docx MIME on the blob, saw "${p19Cap.type}"`);
      }
      try {
        const docxBytes = new Uint8Array(Buffer.from(p19Cap.b64, 'base64'));
        const zipEntries = listZipEntries(docxBytes);
        const names = zipEntries.map(e => e.name).sort();
        if (JSON.stringify(names) !== JSON.stringify(['[Content_Types].xml', '_rels/.rels', 'word/document.xml'])) {
          errs.push(`P19ZIP: unexpected part set ${names.join(', ')}`);
        }
        const docPart = zipEntries.find(e => e.name === 'word/document.xml');
        const docXml = new TextDecoder().decode(await readZipEntry(docxBytes, docPart));
        if (!docXml.includes(p19Title.replace(/&/g, '&amp;'))) errs.push('P19DOC: the exported document is missing the plan title');
        for (const head of ['Scenario &amp; Context', 'Stakeholders In This Plan', 'Tactics', 'Measurement &amp; Reporting']) {
          if (!docXml.includes(head)) errs.push(`P19DOC: missing the sealed section heading "${head.replace(/&amp;/g, '&')}"`);
        }
        // the element-6 section: a populated plan prints the table (WITH its
        // schema-required tblGrid); a memberless plan prints the sealed
        // empty string — either way the section is honest, never absent
        if (docXml.includes('<w:tbl>')) {
          if (!docXml.includes('<w:tblGrid>')) errs.push('P19DOC: the element-6 table is missing its schema-required tblGrid');
        } else if (!docXml.includes('No stakeholders in this workspace.')) {
          errs.push('P19DOC: neither the element-6 table nor its sealed empty string rendered');
        }
      } catch (e) {
        errs.push('P19UNZIP: ' + e.message);
      }
    }
    // (b) RESET DEMO DATA — the confirm names what resets; the seed restores.
    await openSettings('P19R');
    await page.locator('.settings-nav ui-list-item', { hasText: 'Team Management' }).click({ timeout: 3000 }).catch(e => errs.push('P19RPANE: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('.reset-demo-btn').click({ timeout: 3000 }).catch(e => errs.push('P19ROPEN: ' + e.message));
    await page.waitForTimeout(300);
    if (await page.locator('ui-dialog.reset-demo-confirm[open]').count() !== 1) errs.push('P19RDLG: the reset confirm dialog did not open');
    const p19ResetCopy = await page.locator('.reset-demo-confirm').textContent().catch(() => '');
    if (!/stakeholders, workspaces, scoring & team weights, plans, community investments, messages/.test(p19ResetCopy || '')) {
      errs.push('P19RCOPY: the confirm must name exactly what resets');
    }
    await page.locator('.reset-demo-go').click({ timeout: 3000 }).catch(e => errs.push('P19RGO: ' + e.message));
    await page.waitForTimeout(2000); // location.reload()
    // Phase 20: the reset swept hpsm:__tourSeen — the re-armed first-run tour
    // re-opens (by design). ASSERT the re-arm (audit: an unasserted skip
    // would keep smoke green if re-arm regressed), then skip it.
    if (await page.locator('ui-coachmark.app-tour[open]').count() !== 1) {
      errs.push('P20REARM: the demo reset must re-arm the first-run tour');
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const p19AfterReset = await page.evaluate(() => ({
      blank: localStorage.getItem('hpsm:__blank'),
      shs: JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]').length,
      wss: JSON.parse(localStorage.getItem('hpsm:workspaces') || '[]').length,
      users: JSON.parse(localStorage.getItem('hpsm:users') || '[]').length,
    }));
    if (p19AfterReset.shs !== 20 || p19AfterReset.wss !== 6 || p19AfterReset.users !== 8) {
      errs.push(`P19RESTORE: expected the 20/6/8 demo seed back, saw ${JSON.stringify(p19AfterReset)}`);
    }
    if (p19AfterReset.blank !== null) errs.push('P19RMARK: a demo reset must not leave the blank marker');
    // (c) BLANK START — the seed choice's other arm.
    await openSettings('P19B');
    await page.locator('.settings-nav ui-list-item', { hasText: 'Team Management' }).click({ timeout: 3000 }).catch(e => errs.push('P19BPANE: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('.reset-demo-btn').click({ timeout: 3000 }).catch(e => errs.push('P19BOPEN: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('.reset-blank-btn').click({ timeout: 3000 }).catch(e => errs.push('P19BGO: ' + e.message));
    await page.waitForTimeout(2000); // location.reload()
    // Phase 23: the blank sweep cleared the STORE session; the harness init
    // script re-seeds u-alex, but the blank org has no such user — so the
    // GATE renders (the sweep-logs-out contract, asserted head-on in the P23
    // drive) listing the solo manager u-you. Sign in as u-you to continue
    // the blank-org drive as its manager.
    if (await page.locator('.login-shell').count() !== 1) errs.push('P23BLANKGATE: a blank start must land on the login gate (stale session never resolves)');
    await page.locator('.login-demo-row', { hasText: 'You' }).click({ timeout: 3000 }).catch(e => errs.push('P23BLANKIN: ' + e.message));
    await page.waitForTimeout(1200); // > the tour's 600ms settle
    // Phase 20: blank start also swept the tour flag — the re-armed first-run
    // tour fires AFTER the u-you sign-in (Phase 23: never at the gate).
    if (await page.locator('ui-coachmark.app-tour[open]').count() !== 1) {
      errs.push('P20REARM2: a blank start must re-arm the first-run tour');
    }
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const p19Blank = await page.evaluate(() => ({
      marker: localStorage.getItem('hpsm:__blank'),
      users: JSON.parse(localStorage.getItem('hpsm:users') || '[]').map(u => u.id),
      shs: JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]').length,
      wss: JSON.parse(localStorage.getItem('hpsm:workspaces') || '[]').length,
    }));
    if (p19Blank.marker !== '1') errs.push('P19BMARK: Start blank must set the blank marker');
    if (JSON.stringify(p19Blank.users) !== '["u-you","u-system"]') errs.push(`P19BUSER: expected the solo manager + the Reminders bot [u-you,u-system], saw ${JSON.stringify(p19Blank.users)}`);
    if (p19Blank.shs !== 0 || p19Blank.wss !== 0) errs.push(`P19BEMPTY: expected empty tables, saw shs=${p19Blank.shs} wss=${p19Blank.wss}`);
    // every page renders a DESIGNED, ACTIONABLE empty state (Map keeps its
    // sealed scorecard copy; the shared .empty-state covers the rest)
    if (await page.locator('.empty-state').count() !== 1) errs.push('P19LISTS: the Lists zero-data empty state did not render');
    if (await page.locator('ui-stakeholder-table').count() !== 0) errs.push('P19LISTS: the empty state must substitute the table node');
    if (await page.locator('.empty-state ui-button', { hasText: 'Add stakeholder' }).count() !== 1) errs.push('P19LISTSACT: the Add-stakeholder action is missing');
    if (await page.locator('.empty-state ui-button', { hasText: 'Import' }).count() !== 1) errs.push('P19LISTSIMP: the Import secondary action is missing');
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Map' }).click({ timeout: 3000 }).catch(e => errs.push('P19MAPNAV: ' + e.message));
    await page.waitForTimeout(500);
    if (await page.locator('ui-stakeholder-map').count() !== 1) errs.push('P19MAP: the map did not mount on a blank org');
    const p19MapPrompt = (await page.locator('.map-scorecard .empty-prompt').textContent().catch(() => '') || '').trim();
    if (p19MapPrompt !== 'Click any dot on the map to see details.') errs.push(`P19MAPCOPY: the sealed scorecard prompt must stay verbatim, saw "${p19MapPrompt}"`);
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Plans' }).click({ timeout: 3000 }).catch(e => errs.push('P19PLNAV: ' + e.message));
    await page.waitForTimeout(500);
    const p19PlanEmpty = (await page.locator('.empty-state-line').textContent().catch(() => '') || '').trim();
    if (p19PlanEmpty !== 'No plans yet. Create one to begin building a stakeholder engagement plan.') {
      errs.push(`P19PLTEXT: the Plans empty state must carry the SEALED emptyText verbatim, saw "${p19PlanEmpty}"`);
    }
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Community' }).click({ timeout: 3000 }).catch(e => errs.push('P19CMNAV: ' + e.message));
    await page.waitForTimeout(500);
    if (await page.locator('.empty-state ui-button', { hasText: 'New application' }).count() !== 1) errs.push('P19CMACT: the Community empty state action is missing');
    // CREATE WORKS from the empty states: workspace → stakeholder → teammate
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Workspaces' }).click({ timeout: 3000 }).catch(e => errs.push('P19WSNAV: ' + e.message));
    await page.waitForTimeout(500);
    await page.locator('.empty-state ui-button', { hasText: 'New workspace' }).click({ timeout: 3000 }).catch(e => errs.push('P19WSACT: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('.ws-modal ui-text-field input').click({ timeout: 3000 }).catch(e => errs.push('P19WSNAME: ' + e.message));
    await page.keyboard.type('Blank Org Workspace');
    await page.waitForTimeout(300);
    await page.locator('.ws-modal ui-button', { hasText: 'Create workspace' }).click({ timeout: 3000 }).catch(e => errs.push('P19WSGO: ' + e.message));
    await page.waitForTimeout(500);
    const p19WsName = (await page.locator('.ws-select-name').textContent().catch(() => '') || '').trim();
    if (p19WsName !== 'Blank Org Workspace') errs.push(`P19WSOPEN: expected the new workspace active on Lists, saw "${p19WsName}"`);
    // Lists (empty workspace) → Add stakeholder through the empty state
    await page.locator('.empty-state ui-button', { hasText: 'Add stakeholder' }).click({ timeout: 3000 }).catch(e => errs.push('P19SHACT: ' + e.message));
    await page.waitForTimeout(400);
    if (await page.locator('ui-dialog.sh-dialog[open]').count() !== 1) errs.push('P19SHDLG: the create modal did not open from the empty state');
    await page.locator('ui-dialog.sh-dialog ui-text-field input').first().click({ timeout: 3000 }).catch(e => errs.push('P19SHORG: ' + e.message));
    await page.keyboard.type('Blank Probe Org');
    const p19Pick = async (label, option) => {
      const sel = page.locator(`ui-dialog.sh-dialog ui-select[aria-label="${label}"]`);
      await sel.click({ timeout: 3000 }).catch(e => errs.push(`P19SEL${label}: ` + e.message));
      await page.waitForTimeout(250);
      await sel.locator('ui-option', { hasText: option }).first().click({ timeout: 3000 }).catch(e => errs.push(`P19OPT${label}: ` + e.message));
      await page.waitForTimeout(250);
    };
    await p19Pick('Category', 'Government');   // the cascade fills Audience type
    await p19Pick('Market', 'Americas');       // the cascade fills Region
    await p19Pick('Geography', 'Local');
    await page.locator('ui-dialog.sh-dialog ui-button', { hasText: 'Create stakeholder' }).click({ timeout: 3000 }).catch(e => errs.push('P19SHGO: ' + e.message));
    await page.waitForTimeout(600);
    const p19Created = await page.evaluate(() => {
      const shs = JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]');
      const s = shs.find(x => x.org === 'Blank Probe Org');
      return s ? { count: shs.length, owners: s.owners, category: s.category } : null;
    });
    if (!p19Created) errs.push('P19CREATE: the blank-org stakeholder did not persist');
    else {
      if (p19Created.count !== 1) errs.push(`P19CREATE: expected exactly 1 stakeholder, saw ${p19Created.count}`);
      if (!(p19Created.owners || []).includes('u-you')) errs.push('P19OWNER: the solo manager must default as owner');
    }
    if (await page.locator('ui-stakeholder-table .sheet-row').count() !== 1) errs.push('P19TABLE: the table did not take over from the empty state after create');
    // Scoring (no team edge): the empty state's action IS the add-teammate flow
    await page.locator('ui-sidebar > ui-sidebar-item', { hasText: 'Scoring' }).first().click({ timeout: 3000 }).catch(e => errs.push('P19SCNAV: ' + e.message));
    await page.waitForTimeout(500);
    if (await page.locator('.scoring-wrap .empty-state').count() !== 1) errs.push('P19SCEMPTY: the Scoring no-team empty state did not render');
    if (await page.locator('.scoring-table').count() !== 0) errs.push('P19SCTABLE: the matrix must yield to the empty state with no team');
    await page.locator('.scoring-wrap .empty-state ui-button', { hasText: 'Add teammate' }).click({ timeout: 3000 }).catch(e => errs.push('P19SCACT: ' + e.message));
    await page.waitForTimeout(400);
    await page.locator('ui-autocomplete input').click({ timeout: 3000 }).catch(e => errs.push('P19TMQ: ' + e.message));
    await page.keyboard.type('You');
    await page.waitForTimeout(400);
    await page.locator('ui-autocomplete .option', { hasText: 'You' }).first().click({ timeout: 3000 }).catch(e => errs.push('P19TMPICK: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('ui-dialog ui-button', { hasText: 'Add to team' }).click({ timeout: 3000 }).catch(e => errs.push('P19TMGO: ' + e.message));
    await page.waitForTimeout(500);
    const p19Team = await page.evaluate(() => JSON.parse(localStorage.getItem('hpsm:team') || '[]'));
    if (p19Team.length !== 1 || p19Team[0].userId !== 'u-you') errs.push(`P19TEAM: expected the solo manager on the scoring team, saw ${JSON.stringify(p19Team)}`);
    if (await page.locator('.scoring-table').count() !== 1) errs.push('P19SCBACK: the matrix must return once a team exists');
  }
  if (path === '/record.html') {
    // Phase 14: SampleRecord — the sealed neutral tuning preview (standalone
    // entry; the dev Scaffolds-menu mount was ruled dropped, census L1/L2).
    if (await page.locator('.record-wrap').count() !== 1) errs.push('SAMPLE: the scaffold preview did not mount');
    const sampleTitle = (await page.locator('.record-page-title').textContent().catch(() => '') || '').trim();
    if (sampleTitle !== 'Sample Record') errs.push(`SAMPLETITLE: expected the sealed seed title, saw "${sampleTitle}"`);
    // sealed L1: the back button renders but is honestly inert (disabled)
    const backDisabled = await page.locator('.record-topbar ui-button.plan-back').getAttribute('disabled').catch(() => null);
    if (backDisabled === null) errs.push('SAMPLEL1: the sealed no-op back button must LOOK inert (disabled)');
    // LIVE retitle: editing Name retitles the page header (sealed)
    await page.locator('ui-sidebar.record-nav ui-sidebar-item', { hasText: 'Field stack' }).click({ timeout: 3000 }).catch(e => errs.push('SAMPLENAV: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('.record-topbar .record-edit-btn').click({ timeout: 3000 }).catch(e => errs.push('SAMPLEEDIT: ' + e.message));
    await page.waitForTimeout(300);
    await page.locator('.record-section-body ui-text-field input').first().click({ timeout: 3000 }).catch(e => errs.push('SAMPLENAME: ' + e.message));
    await page.keyboard.press('End');
    await page.keyboard.type(' X');
    await page.waitForTimeout(300);
    const retitled = (await page.locator('.record-page-title').textContent().catch(() => '') || '').trim();
    if (retitled !== 'Sample Record X') errs.push(`SAMPLERETITLE: expected the live header retitle, saw "${retitled}"`);
    // sealed Table embed: the REAL ui-stakeholder-table, capped at 8 rows
    await page.locator('ui-sidebar.record-nav ui-sidebar-item', { hasText: 'Table embed' }).click({ timeout: 3000 }).catch(e => errs.push('SAMPLETABLE: ' + e.message));
    await page.waitForTimeout(600);
    const sampleRows = await page.locator('.record-table-embed ui-stakeholder-table .sheet-row').count();
    if (sampleRows !== 8) errs.push(`SAMPLECAP: expected the sealed 8-row cap, saw ${sampleRows}`);
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
// ── PHASE 20 — MOBILE COMPANION drive (390×844; browser.newPage() = a fresh
// context, so this profile boots the demo seed untouched by the runs above).
// Sealed scope: quick-view (ui-sheet bottom) · add-note (the ONE notes seam)
// · messages; everything else shows the honest desktop-surface note.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  // Phase 23: the mobile drive also assumes a signed-in app (its writes
  // assert u-alex) — same harness bootstrap as the desktop drive.
  await page.addInitScript(() => {
    localStorage.setItem('hpsm:__schema', 'v10-rebuild');
    localStorage.setItem('hpsm:session', JSON.stringify({ userId: 'u-alex' }));
  });
  await page.goto('http://127.0.0.1:4173/app.html', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => errs.push('NAV: ' + e.message));
  await page.waitForTimeout(1500);
  // the desktop tour never auto-starts at mobile widths (declared)
  if (await page.locator('ui-coachmark.app-tour[open]').count() !== 0) errs.push('P20M: the desktop tour auto-started on mobile');
  // the shell collapses: data-mobile stamped; the rail folds to its icon
  // column via ui-sidebar's existing manifest state
  if (await page.locator('ui-app-shell[data-mobile]').count() !== 1) errs.push('P20M: ui-app-shell is missing the data-mobile stamp');
  if (await page.locator('ui-sidebar[collapsed]').count() !== 1) errs.push('P20M: the sidebar did not collapse at the mobile breakpoint');
  // Lists presents the compact stakeholder list (name + org + zone chip)
  const p20Rows = await page.locator('.mobile-sh-list ui-list-item').count();
  if (p20Rows !== 20) errs.push(`P20MLIST: expected the 20 seed stakeholders in the compact list, saw ${p20Rows}`);
  if (await page.locator('.mobile-sh-list ui-chip[variant="zone"]').count() !== p20Rows) errs.push('P20MZONE: every compact row must carry its zone chip');
  if (await page.locator('ui-stakeholder-table').count() !== 0) errs.push('P20MGRID: the desktop grid must not mount at mobile widths');
  // QUICK-VIEW: tapping a row opens the bottom sheet with the read summary
  const p20FirstName = (await page.locator('.mobile-sh-list .m-row-name').first().textContent().catch(() => '') || '').trim();
  await page.locator('.mobile-sh-list ui-list-item').first().click({ timeout: 3000 }).catch(e => errs.push('P20MROW: ' + e.message));
  await page.waitForTimeout(500);
  if (await page.locator('ui-sheet.sh-quickview[open]').count() !== 1) errs.push('P20MQV: the quick-view sheet did not open');
  const p20QvName = (await page.locator('.qv-name').textContent().catch(() => '') || '').trim();
  if (!p20QvName || p20QvName !== p20FirstName) errs.push(`P20MQV: the sheet must show the tapped stakeholder ("${p20FirstName}"), saw "${p20QvName}"`);
  if (await page.locator('.qv-grid .qv-field').count() !== 6) errs.push('P20MQV: the read summary must carry its six fields');
  // ADD NOTE: the quick-view action opens the ONE NotesModal composition
  // (ui-dialog + ui-textarea) and the note lands through the ONE seam
  await page.locator('.qv-actions ui-button', { hasText: 'Add note' }).click({ timeout: 3000 }).catch(e => errs.push('P20MNOTEBTN: ' + e.message));
  await page.waitForTimeout(500);
  if (await page.locator('ui-dialog[open] .notes-composer').count() !== 1) errs.push('P20MNOTE: the notes dialog did not open from the quick-view');
  await page.locator('.notes-composer ui-textarea textarea').click({ timeout: 3000 }).catch(e => errs.push('P20MNOTETA: ' + e.message));
  await page.keyboard.type('Mobile probe note - met at the site visit.');
  await page.waitForTimeout(300);
  await page.locator('.notes-foot ui-button', { hasText: 'Add note' }).click({ timeout: 3000 }).catch(e => errs.push('P20MNOTEGO: ' + e.message));
  await page.waitForTimeout(400);
  const p20Note = await page.evaluate(() => {
    const shs = JSON.parse(localStorage.getItem('hpsm:stakeholders') || '[]');
    const s = shs[0] || {};
    const h = s.notesHistory || [];
    const last = h[h.length - 1] || {};
    return { body: last.body, by: last.by, mirrored: s.notes };
  });
  if (p20Note.body !== 'Mobile probe note - met at the site visit.') errs.push('P20MNOTE: the note did not land in notesHistory through the one seam');
  if (p20Note.mirrored !== p20Note.body) errs.push('P20MNOTE: notes must mirror the newest entry (sealed add rule)');
  if (p20Note.by !== 'u-alex') errs.push(`P20MNOTE: the entry must stamp the current user, saw ${JSON.stringify(p20Note.by)}`);
  await page.evaluate(() => document.querySelectorAll('ui-dialog').forEach(d => d.close && d.close()));
  await page.waitForTimeout(300);
  // MESSAGES: quick-view → Message opens the messaging overlay (full-width
  // at mobile); open a human thread; send; the message persists
  await page.locator('.mobile-sh-list ui-list-item').first().click({ timeout: 3000 }).catch(e => errs.push('P20MROW2: ' + e.message));
  await page.waitForTimeout(400);
  await page.locator('.qv-actions ui-button', { hasText: 'Message' }).click({ timeout: 3000 }).catch(e => errs.push('P20MMSGBTN: ' + e.message));
  await page.waitForTimeout(500);
  if (await page.locator('ui-sheet.messaging-sidebar[open]').count() !== 1) errs.push('P20MMSG: the messaging surface did not open from the quick-view');
  await page.locator('.messaging-sidebar .conv-row:not(.conv-system)').first().click({ timeout: 3000 }).catch(e => errs.push('P20MCONV: ' + e.message));
  await page.waitForTimeout(400);
  await page.locator('.messaging-sidebar .composer ui-textarea textarea').click({ timeout: 3000 }).catch(e => errs.push('P20MCOMP: ' + e.message));
  await page.keyboard.type('Mobile probe message');
  await page.waitForTimeout(200);
  await page.locator('.messaging-sidebar .composer ui-button', { hasText: 'Send' }).click({ timeout: 3000 }).catch(e => errs.push('P20MSEND: ' + e.message));
  await page.waitForTimeout(400);
  const p20Sent = await page.evaluate(() => {
    const msgs = JSON.parse(localStorage.getItem('hpsm:messages') || '{}');
    return Object.values(msgs).some(list => (list || []).some(m => m.body === 'Mobile probe message' && m.from === 'u-alex'));
  });
  if (!p20Sent) errs.push('P20MSEND: the mobile-sent message did not persist to the store');
  await page.evaluate(() => document.querySelectorAll('ui-sheet').forEach(s => s.close && s.close()));
  await page.waitForTimeout(400);
  // EVERYTHING ELSE IS DESKTOP-WEB: a non-companion view shows the honest note
  await page.locator('#nav-map').click({ timeout: 3000 }).catch(e => errs.push('P20MNAV: ' + e.message));
  await page.waitForTimeout(500);
  if (await page.locator('.desktop-note').count() !== 1) errs.push('P20MDESK: the Map view must show the desktop-surface note on mobile');
  if (await page.locator('ui-stakeholder-map').count() !== 0) errs.push('P20MDESK: the desktop Map must not mount at mobile widths');
  await page.locator('.desktop-note ui-button', { hasText: 'Open the stakeholder list' }).click({ timeout: 3000 }).catch(e => errs.push('P20MDESKGO: ' + e.message));
  await page.waitForTimeout(400);
  if (await page.locator('.mobile-sh-list').count() !== 1) errs.push('P20MDESKGO: the note action must route back to the compact list');
  const real = errs.filter(e => !/fonts\.g(oogleapis|static)\.com|net::ERR_|Failed to load resource/.test(e));
  totalErrors += real.length;
  console.log(`/app.html [mobile 390x844]: ${real.length} real console/page errors` + (real.length ? '\n  - ' + real.slice(0, 8).join('\n  - ') : ''));
  await page.close();
}

// ── PHASE 23 — LOGIN GATE drive (a CLEAN context: no seeded session; the
// gate is the entry). Fresh profile → the gate renders with the demo list;
// sign in as Alex → the app mounts AND the first-run tour fires (only after
// login); logout → back to the gate; sign in as a member ("User" role) →
// Settings hidden (NO auto-promote — the sealed trap stays dead); Start
// blank → logged out + the gate shows the blank org's solo manager u-you;
// demo reset → logged out again.
{
  const page = await browser.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  const session = () => page.evaluate(() => JSON.parse(localStorage.getItem('hpsm:session') || 'null'));
  await page.goto('http://127.0.0.1:4173/app.html', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => errs.push('P23NAV: ' + e.message));
  await page.waitForTimeout(1200);
  // 1. the gate is the ONLY mount (sealed: nothing else mounts)
  if (await page.locator('.login-shell').count() !== 1) errs.push('P23GATE: the login gate did not render on a fresh profile');
  if (await page.locator('ui-app-bar').count() !== 0) errs.push('P23GATEONLY: app chrome mounted while signed out');
  if (await page.locator('ui-coachmark.app-tour[open]').count() !== 0) errs.push('P23TOURGATE: the first-run tour fired AT the gate (must fire only after login)');
  const p23Rows = await page.locator('.login-demo-row').count();
  if (p23Rows !== 7) errs.push(`P23DEMO: expected the 7 non-system demo accounts, saw ${p23Rows}`);
  const p23Dis = await page.locator('ui-button.login-submit').getAttribute('disabled').catch(() => null);
  if (p23Dis === null) errs.push('P23VALID: submit must be DISABLED while the sealed validity fails');
  // 2. sign in as Alex → the app mounts, the session persists, the TOUR fires
  await page.locator('.login-demo-row', { hasText: 'Alex Rivera' }).click({ timeout: 3000 }).catch(e => errs.push('P23IN: ' + e.message));
  await page.waitForTimeout(1200); // > the tour's 600ms settle
  if (await page.locator('ui-app-bar').count() !== 1) errs.push('P23IN: the app did not mount after demo sign-in');
  const p23S1 = await session();
  if (!p23S1 || p23S1.userId !== 'u-alex') errs.push(`P23SESSION: expected {userId:"u-alex"} in hpsm:session, saw ${JSON.stringify(p23S1)}`);
  if (await page.locator('ui-coachmark.app-tour[open]').count() !== 1) errs.push('P23TOUR: the first-run tour must fire AFTER login on a fresh profile');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  // 3. logout (sealed census A10) → back to the gate, session cleared
  await page.locator('#me-anchor').click({ timeout: 3000 }).catch(e => errs.push('P23MENU: ' + e.message));
  await page.waitForTimeout(300);
  await page.locator('ui-menu.profile-menu ui-menu-item', { hasText: 'Log out' }).click({ timeout: 3000 }).catch(e => errs.push('P23OUT: ' + e.message));
  await page.waitForTimeout(500);
  if (await page.locator('.login-shell').count() !== 1) errs.push('P23OUT: Log out did not return to the gate');
  if (await session() !== null) errs.push('P23OUT: the session must be null after logout');
  // 4. sign in as a MEMBER ("User" role): Settings hidden, role untouched
  await page.locator('.login-demo-row', { hasText: 'Sam Okafor' }).click({ timeout: 3000 }).catch(e => errs.push('P23SAM: ' + e.message));
  await page.waitForTimeout(800);
  const p23S2 = await session();
  if (!p23S2 || p23S2.userId !== 'u-sam') errs.push(`P23SAM: expected the Sam session, saw ${JSON.stringify(p23S2)}`);
  const p23SamRole = await page.evaluate(() => (JSON.parse(localStorage.getItem('hpsm:users') || '[]').find(u => u.id === 'u-sam') || {}).role);
  if (p23SamRole !== 'member') errs.push(`P23PROMOTE: a member must STAY member through login (sealed trap) — saw role ${JSON.stringify(p23SamRole)}`);
  await page.locator('#me-anchor').click({ timeout: 3000 }).catch(e => errs.push('P23SAMMENU: ' + e.message));
  await page.waitForTimeout(300);
  if (await page.locator('ui-menu.profile-menu ui-menu-item', { hasText: 'Settings' }).count() !== 0)
    errs.push('P23SETTINGS: the Settings item must be HIDDEN for a member (no auto-promote)');
  // 5. blank mode: log out → in as the manager → Start blank (reload sweeps
  //    the namespace incl. the session) → the gate shows u-you
  await page.locator('ui-menu.profile-menu ui-menu-item', { hasText: 'Log out' }).click({ timeout: 3000 }).catch(e => errs.push('P23OUT2: ' + e.message));
  await page.waitForTimeout(500);
  await page.locator('.login-demo-row', { hasText: 'Alex Rivera' }).click({ timeout: 3000 }).catch(e => errs.push('P23IN2: ' + e.message));
  await page.waitForTimeout(800);
  await page.locator('#me-anchor').click({ timeout: 3000 }).catch(e => errs.push('P23MENU2: ' + e.message));
  await page.waitForTimeout(300);
  await page.locator('ui-menu.profile-menu ui-menu-item', { hasText: 'Settings' }).click({ timeout: 3000 }).catch(e => errs.push('P23SETNAV: ' + e.message));
  await page.waitForTimeout(400);
  await page.locator('.settings-nav ui-list-item', { hasText: 'Team Management' }).click({ timeout: 3000 }).catch(e => errs.push('P23TEAM: ' + e.message));
  await page.waitForTimeout(300);
  await page.locator('ui-button.reset-demo-btn').click({ timeout: 3000 }).catch(e => errs.push('P23RESETOPEN: ' + e.message));
  await page.waitForTimeout(400);
  await page.locator('.reset-demo-confirm ui-button.reset-blank-btn').click({ timeout: 3000 }).catch(e => errs.push('P23BLANK: ' + e.message));
  await page.waitForTimeout(2000); // the sealed reload-the-seed step
  if (await page.locator('.login-shell').count() !== 1) errs.push('P23BLANKOUT: Start blank must LOG OUT (the sweep clears hpsm:session)');
  const p23Blank = await page.locator('.login-demo-row').count();
  if (p23Blank !== 1) errs.push(`P23BLANKROW: the blank org's gate must list exactly u-you, saw ${p23Blank} rows`);
  const p23You = (await page.locator('.login-demo-row').textContent().catch(() => '') || '');
  if (!p23You.includes('You')) errs.push(`P23BLANKROW: expected the solo manager "You", saw "${p23You.trim()}"`);
  // sign in as u-you → the blank app mounts, Settings reachable (manager)
  await page.locator('.login-demo-row').click({ timeout: 3000 }).catch(e => errs.push('P23YOU: ' + e.message));
  await page.waitForTimeout(1200);
  if (await page.locator('ui-app-bar').count() !== 1) errs.push('P23YOU: the blank org sign-in did not mount the app');
  const p23S3 = await session();
  if (!p23S3 || p23S3.userId !== 'u-you') errs.push(`P23YOU: expected the u-you session, saw ${JSON.stringify(p23S3)}`);
  await page.keyboard.press('Escape'); // the re-armed first-run tour (fresh namespace)
  await page.waitForTimeout(300);
  // 6. demo reset from the blank org → logged out again (sweep = logout)
  await page.locator('#me-anchor').click({ timeout: 3000 }).catch(e => errs.push('P23MENU3: ' + e.message));
  await page.waitForTimeout(300);
  await page.locator('ui-menu.profile-menu ui-menu-item', { hasText: 'Settings' }).click({ timeout: 3000 }).catch(e => errs.push('P23SETNAV2: ' + e.message));
  await page.waitForTimeout(400);
  await page.locator('.settings-nav ui-list-item', { hasText: 'Team Management' }).click({ timeout: 3000 }).catch(e => errs.push('P23TEAM2: ' + e.message));
  await page.waitForTimeout(300);
  await page.locator('ui-button.reset-demo-btn').click({ timeout: 3000 }).catch(e => errs.push('P23RESETOPEN2: ' + e.message));
  await page.waitForTimeout(400);
  await page.locator('.reset-demo-confirm ui-button.reset-demo-go').click({ timeout: 3000 }).catch(e => errs.push('P23RESET: ' + e.message));
  await page.waitForTimeout(2000);
  if (await page.locator('.login-shell').count() !== 1) errs.push('P23RESETOUT: Reset demo data must LOG OUT (back to the gate)');
  if (await session() !== null) errs.push('P23RESETOUT: the session must be gone after the reset sweep');
  const p23Demo2 = await page.locator('.login-demo-row').count();
  if (p23Demo2 !== 7) errs.push(`P23RESETROWS: the reset gate must list the 7 demo accounts again, saw ${p23Demo2}`);
  const real = errs.filter(e => !/fonts\.g(oogleapis|static)\.com|net::ERR_|Failed to load resource/.test(e));
  totalErrors += real.length;
  console.log(`/app.html [P23 login gate]: ${real.length} real console/page errors` + (real.length ? '\n  - ' + real.slice(0, 8).join('\n  - ') : ''));
  await page.close();
}

await browser.close(); srv.close();
console.log(totalErrors === 0 ? 'SMOKE: ALL PAGES CLEAN' : `SMOKE: ${totalErrors} REAL ERRORS`);
