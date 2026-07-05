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
