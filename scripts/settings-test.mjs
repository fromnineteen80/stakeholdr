#!/usr/bin/env node
/* settings-test.mjs — node assertions for the Settings hub's pure logic
 * (src/app/pages/settings-logic.js + the company derivation seam), asserted
 * ONLY from the sealed Settings box (src/guide.jsx ~2273–2580), the sealed
 * App-shell appConfig wiring, and the sealed design-dashboard phase items.
 * Wired into scripts/run-tests.mjs as the 10th suite.
 */
import assert from 'node:assert/strict';
import {
  SETTINGS_PANES, DESIGN_PANE, INTEGRATIONS_PANE, DEFAULT_PANE,
  APP_CONFIG_SEED, deriveCompanyCatalogs, fiscalFrom,
  MONTHLEN, addMonths, dayBefore, quartersFor,
  slugTag, issueListCommit, issueAdd, issueRemove,
  addSegment, segmentAddCommit, addUnit, removeUnit, removeSegment,
  segAdderPlaceholder, unitAdderPlaceholder,
  SITE_MODES, siteSubList, siteSubPlaceholder, intlCountryOptions, makeSite,
  siteChipLabel,
  TIME_ZONES, TIME_ZONE_DEFAULT, NIGHT_SHIFT_DEFAULT,
  splitNightShift, composeNightShift,
  rolesFiltered, rolesHeadCount, ROLE_MEMBER, ROLE_MANAGER,
  SELF_DEMOTE_TITLE, INVITE_PLACEHOLDER, INVITE_MODAL_TITLE,
  SETTINGS_EXPLAINER, countLabel,
  DESIGN_DEFAULTS, DESIGN_VARS, designOverrides, themeAttribute,
  INTEGRATIONS_CONNECTORS, INTEGRATIONS_CHIP,
} from '../src/app/pages/settings-logic.js';
import {
  ISSUES, TAGS, FUNCTIONS, SEGMENTS, MARKETS, CATEGORIES, SITES, ORG_GOALS,
} from '../src/app/data/catalogs.js';
import {
  CONFIG_SWATCHES, THEME_PRESETS, ACCENT_CANDIDATES, WRAPPER_THEMES,
} from '../design-system/settings-data.js';

let n = 0;
const test = (name, fn) => { fn(); n++; console.log('  ✓ ' + name); };

console.log('settings-test: sealed Settings box assertions');

/* ── pane roster (sealed: EXACTLY 9 oracle panes, this order, these ids and
 * rail labels; "identity" is the default; Design + Integrations are hosted
 * additions, never counted among the 9). ─────────────────────────────────── */
test('the 9 sealed panes: exact ids, labels, order', () => {
  assert.deepEqual(SETTINGS_PANES, [
    ['identity', 'App Settings'],
    ['fiscal', 'Fiscal Calendar'],
    ['stakeholders', 'Stakeholders'],
    ['structure', 'Your Structure'],
    ['geography', 'Geography'],
    ['issues', 'Issues'],
    ['tags', 'Tags'],
    ['management', 'Team Management'],
    ['contact', 'Contact'],
  ]);
  assert.equal(DEFAULT_PANE, 'identity');
  assert.deepEqual(DESIGN_PANE, ['design', 'Design']);
  assert.deepEqual(INTEGRATIONS_PANE, ['integrations', 'Integrations']);
});

test('sealed settings explainer copy, verbatim', () => {
  assert.equal(SETTINGS_EXPLAINER,
    'Manager-only configuration for your organization. Changes apply to everyone.');
});

/* ── appConfig seed + the sealed present-AND-non-empty fallback ──────────── */
test('appConfig seed: appName + fiscal keys (accent/brand deliberately unseeded — the open decision)', () => {
  assert.deepEqual(APP_CONFIG_SEED,
    { appName: 'Stakeholdr', fiscalStartMonth: 11, fiscalStartDay: 1 });
  assert.ok(!('accent' in APP_CONFIG_SEED));
  assert.ok(!('brand' in APP_CONFIG_SEED));
});

test('deriveCompanyCatalogs: empty config → the eight seed catalogs', () => {
  const c = deriveCompanyCatalogs({});
  assert.equal(c.companyIssues, ISSUES);
  assert.equal(c.companyTags, TAGS);
  assert.equal(c.companyFunctions, FUNCTIONS);
  assert.equal(c.companySegments, SEGMENTS);
  assert.equal(c.companyMarkets, MARKETS);
  assert.equal(c.companyCategories, CATEGORIES);
  assert.equal(c.companySites, SITES);
  assert.equal(c.companyGoals, ORG_GOALS);
});

test('deriveCompanyCatalogs: arrays fall back on length 0; objects on zero keys (sealed predicates)', () => {
  const c = deriveCompanyCatalogs({ issues: [], segments: {}, markets: {}, sites: [] });
  assert.equal(c.companyIssues, ISSUES);
  assert.equal(c.companySegments, SEGMENTS);
  assert.equal(c.companyMarkets, MARKETS);
  assert.equal(c.companySites, SITES);
});

test('deriveCompanyCatalogs: present AND non-empty overrides win; companyGoals reads the RENAMED orgGoals key', () => {
  const cfg = {
    issues: ['A'], tags: ['t'], functions: ['F'],
    segments: { S: ['u'] }, markets: { M: ['r'] }, categories: { C: ['t1'] },
    sites: [{ id: 's1', city: 'X', country: 'France' }],
    orgGoals: ['Win'],
  };
  const c = deriveCompanyCatalogs(cfg);
  assert.deepEqual(c.companyIssues, ['A']);
  assert.deepEqual(c.companySegments, { S: ['u'] });
  assert.deepEqual(c.companyGoals, ['Win']);
  assert.deepEqual(c.companyCategories, { C: ['t1'] });
});

test('fiscalFrom: sealed defaults 11/1; live values pass through', () => {
  assert.deepEqual(fiscalFrom({}), { month: 11, day: 1 });
  assert.deepEqual(fiscalFrom({ fiscalStartMonth: 2, fiscalStartDay: 15 }), { month: 2, day: 15 });
});

/* ── QuartersPreview (sealed EXACT algorithm + worked example) ───────────── */
test('MONTHLEN: sealed table, Feb = 29', () => {
  assert.deepEqual(MONTHLEN, [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]);
});

test('add/dayBefore helpers: sealed wrap + month-end math', () => {
  assert.deepEqual(addMonths(11, 1, 3), { m: 2, d: 1 });
  assert.deepEqual(addMonths(1, 15, -3), { m: 10, d: 15 });
  assert.deepEqual(dayBefore({ m: 2, d: 1 }), { m: 1, d: 31 });
  assert.deepEqual(dayBefore({ m: 3, d: 1 }), { m: 2, d: 29 });
  assert.deepEqual(dayBefore({ m: 1, d: 1 }), { m: 12, d: 31 });
  assert.deepEqual(dayBefore({ m: 6, d: 10 }), { m: 6, d: 9 });
});

test('quartersFor(11, 1): the sealed worked example, verbatim ranges', () => {
  assert.deepEqual(quartersFor(11, 1), [
    { label: 'Q1', range: 'Nov 1 → Jan 31' },
    { label: 'Q2', range: 'Feb 1 → Apr 30' },
    { label: 'Q3', range: 'May 1 → Jul 31' },
    { label: 'Q4', range: 'Aug 1 → Oct 31' },
  ]);
});

test('quartersFor: quarter starts always land on the anchor day (sealed add carries d)', () => {
  const qs = quartersFor(2, 15);
  assert.equal(qs[0].range, 'Feb 15 → May 14');
  assert.equal(qs[3].range, 'Nov 15 → Feb 14');
});

/* ── Tags slug (sealed transform; Issues/Goals/Functions are PLAIN-trim) ─── */
test('slugTag: sealed example "Public Affairs!" → "public-affairs"', () => {
  assert.equal(slugTag('Public Affairs!'), 'public-affairs');
  assert.equal(slugTag('  A  B  '), 'a-b');
  assert.equal(slugTag('Env & Sust.'), 'env--sust');
});

/* ── IssueSettings commit behaviors (incl. the PASTE-CLOBBER FIX) ────────── */
test('issueListCommit: no comma → all draft, no commit', () => {
  const r = issueListCommit(['x'], 'abc');
  assert.deepEqual(r, { list: ['x'], draft: 'abc', changed: false });
});

test('issueListCommit: single-event paste "a, b, c" commits a AND b (sealed fix — the oracle kept only "b"), tail " c" stays draft', () => {
  const r = issueListCommit([], 'a, b, c');
  assert.deepEqual(r.list, ['a', 'b']);
  assert.equal(r.draft, ' c');
  assert.equal(r.changed, true);
});

test('issueListCommit: dedupes against the existing list and within the paste', () => {
  const r = issueListCommit(['a'], 'a, b, b, ');
  assert.deepEqual(r.list, ['a', 'b']);
  assert.equal(r.draft, ' ');
});

test('issueAdd: empty or duplicate → silent no-op with cleared draft (sealed)', () => {
  assert.deepEqual(issueAdd(['a'], '  '), { list: ['a'], draft: '', changed: false });
  assert.deepEqual(issueAdd(['a'], 'a'), { list: ['a'], draft: '', changed: false });
  assert.deepEqual(issueAdd(['a'], ' b '), { list: ['a', 'b'], draft: '', changed: true });
});

test('issueAdd with the tags transform: slug applied before dedupe', () => {
  const r = issueAdd(['public-affairs'], 'Public Affairs!', slugTag);
  assert.equal(r.changed, false);
});

test('issueRemove: filters the exact value', () => {
  assert.deepEqual(issueRemove(['a', 'b'], 'a'), ['b']);
});

/* ── SegmentSettings (sealed dedupe + the make-real comma commit) ────────── */
test('addSegment: trims; empty/duplicate no-op; new key gets an empty unit list', () => {
  assert.deepEqual(addSegment({}, '  Foo '), { segments: { Foo: [] }, changed: true });
  assert.equal(addSegment({ Foo: [] }, 'Foo').changed, false);
  assert.equal(addSegment({}, '   ').changed, false);
});

test('segmentAddCommit: "Foo," commits "Foo" WITHOUT the trailing comma (sealed make-real; the oracle committed "Foo,")', () => {
  const r = segmentAddCommit({}, 'Foo,');
  assert.deepEqual(Object.keys(r.segments), ['Foo']);
  assert.equal(r.draft, '');
});

test('segmentAddCommit: multi-part paste commits every part; tail stays draft', () => {
  const r = segmentAddCommit({ A: [] }, 'A, B, C');
  assert.deepEqual(Object.keys(r.segments), ['A', 'B']);
  assert.equal(r.draft, ' C');
});

test('addUnit/removeUnit/removeSegment: sealed dedupe-within-parent + immutable ops', () => {
  const r1 = addUnit({ S: [] }, 'S', ' u1 ');
  assert.deepEqual(r1.segments, { S: ['u1'] });
  assert.equal(addUnit({ S: ['u1'] }, 'S', 'u1').changed, false);
  assert.deepEqual(removeUnit({ S: ['u1', 'u2'] }, 'S', 'u1'), { S: ['u2'] });
  assert.deepEqual(removeSegment({ S: [], T: [] }, 'S'), { T: [] });
});

test('sealed adder placeholders', () => {
  assert.equal(segAdderPlaceholder('market'), 'New market name, add with a comma or Enter');
  assert.equal(unitAdderPlaceholder('audience type'), '+ audience type');
});

/* ── SiteSettings (sealed 4-mode validation + labels) ────────────────────── */
test('SITE_MODES: sealed four modes, order + labels', () => {
  assert.deepEqual(SITE_MODES,
    [['us', 'United States'], ['ca', 'Canada'], ['mx', 'Mexico'], ['intl', 'Other country']]);
});

test('siteSubList/siteSubPlaceholder: sealed per-mode lists + copy', () => {
  assert.equal(siteSubList('mx').length, 32);
  assert.equal(siteSubList('ca').length, 13);
  assert.equal(siteSubList('us').length, 51);
  assert.equal(siteSubPlaceholder('ca'), 'Select province…');
  assert.equal(siteSubPlaceholder('us'), 'Select state…');
});

test('intlCountryOptions: excludes US/Canada/Mexico (sealed)', () => {
  const opts = intlCountryOptions();
  for (const x of ['United States', 'Canada', 'Mexico']) assert.ok(!opts.includes(x));
  assert.ok(opts.includes('France'));
});

test('makeSite: city required; us/ca/mx require state and DERIVE country; intl requires country', () => {
  assert.equal(makeSite({ city: ' ', mode: 'us', state: 'Oregon' }, 'site-x'), null);
  assert.equal(makeSite({ city: 'Salem', mode: 'us', state: '' }, 'site-x'), null);
  assert.deepEqual(makeSite({ city: ' Salem ', mode: 'us', state: 'Oregon' }, 'site-x'),
    { id: 'site-x', city: 'Salem', state: 'Oregon', country: 'United States' });
  assert.deepEqual(makeSite({ city: 'Toronto', mode: 'ca', state: 'Ontario' }, 'site-y'),
    { id: 'site-y', city: 'Toronto', state: 'Ontario', country: 'Canada' });
  assert.equal(makeSite({ city: 'Paris', mode: 'intl', country: '' }, 'site-z'), null);
  assert.deepEqual(makeSite({ city: 'Paris', mode: 'intl', country: 'France' }, 'site-z'),
    { id: 'site-z', city: 'Paris', country: 'France' });
});

test('siteChipLabel: "City, ST" via STATE_ABBR; raw state fallback; "City, Country" for intl (sealed)', () => {
  assert.equal(siteChipLabel({ city: 'Palo Alto', state: 'California', country: 'United States' }), 'Palo Alto, CA');
  assert.equal(siteChipLabel({ city: 'Toronto', state: 'Ontario', country: 'Canada' }), 'Toronto, Ontario');
  assert.equal(siteChipLabel({ city: 'Paris', country: 'France' }), 'Paris, France');
});

/* ── Identity pane time controls (sealed) ────────────────────────────────── */
test('the sealed 8 time zones, order + labels + default', () => {
  assert.deepEqual(TIME_ZONES.map(([v]) => v), [
    'America/Los_Angeles', 'America/Denver', 'America/Chicago',
    'America/New_York', 'UTC', 'Europe/London', 'Europe/Berlin', 'Asia/Tokyo',
  ]);
  assert.deepEqual(TIME_ZONES[5], ['Europe/London', 'London (GMT/BST)']);
  assert.equal(TIME_ZONE_DEFAULT, 'America/Los_Angeles');
});

test('night-shift split/compose: sealed cases 9:30 PM → "21:30"; 12:00 AM → "00:00"; 12:00 PM → "12:00"', () => {
  assert.equal(NIGHT_SHIFT_DEFAULT, '21:00');
  assert.deepEqual(splitNightShift('21:00'), { h12: 9, mm: '00', ampm: 'PM' });
  assert.deepEqual(splitNightShift('00:30'), { h12: 12, mm: '30', ampm: 'AM' });
  assert.equal(composeNightShift(9, '30', 'PM'), '21:30');
  assert.equal(composeNightShift(12, '00', 'AM'), '00:00');
  assert.equal(composeNightShift(12, '00', 'PM'), '12:00');
});

/* ── Roles (sealed filter + head count + toggle strings/values) ──────────── */
const USERS = [
  { id: 'u1', name: 'Alex Rivera', title: 'Director', email: 'alex@hp.com', role: 'manager' },
  { id: 'u2', name: 'Sam Okafor', title: 'CR Manager', email: 'sam@hp.com', role: 'member' },
  { id: 'u3', name: 'Reminders', title: 'Bot', email: 'noreply@hp.com', role: 'system' },
];

test('rolesFiltered: the system bot NEVER lists; query matches name/title/email lowercased', () => {
  assert.deepEqual(rolesFiltered(USERS, '').map((u) => u.id), ['u1', 'u2']);
  assert.deepEqual(rolesFiltered(USERS, 'SAM@').map((u) => u.id), ['u2']);
  assert.deepEqual(rolesFiltered(USERS, 'director').map((u) => u.id), ['u1']);
  assert.deepEqual(rolesFiltered(USERS, 'reminders'), []);
});

test('rolesHeadCount: "{m} manager(s) · {u} user(s)" (sealed)', () => {
  assert.equal(rolesHeadCount(rolesFiltered(USERS, '')), '1 manager · 1 user');
});

test('sealed role values + titles: non-manager writes "member" (label "User"); self-demote title verbatim', () => {
  assert.equal(ROLE_MEMBER, 'member');
  assert.equal(ROLE_MANAGER, 'manager');
  assert.equal(SELF_DEMOTE_TITLE, "You can't demote yourself - ask another manager.");
});

test('invite code: sealed placeholder + modal title', () => {
  assert.equal(INVITE_PLACEHOLDER, 'STKH-7XQ4-9KMP');
  assert.equal(INVITE_MODAL_TITLE, 'Request a new invite code');
});

test('countLabel: singular/plural incl. the irregular "categories"', () => {
  assert.equal(countLabel(1, 'goal'), '1 goal');
  assert.equal(countLabel(3, 'goal'), '3 goals');
  assert.equal(countLabel(2, 'category', 'categories'), '2 categories');
});

/* ── Settings-data catalogs (sealed hexes as DATA in design-system/) ─────── */
test('the sealed 7 config swatches, verbatim order (shared by brand AND accent)', () => {
  assert.deepEqual(CONFIG_SWATCHES.map((s) => s.value),
    ['#000000', '#1976D2', '#E64A19', '#AD1457', '#388E3C', '#00897B', '#BF360C']);
});

test('the sealed 3 theme presets: ids/labels/subs; only soapbox live (named-token-set gate)', () => {
  assert.deepEqual(THEME_PRESETS.map((t) => [t.id, t.label, t.sub]), [
    ['soapbox', 'Soapbox', 'Warm beige'],
    ['undecideds', 'Undecideds', 'True greyscale'],
    ['nightshift', 'Night Shift', 'Warm charcoal'],
  ]);
  assert.deepEqual(THEME_PRESETS.map((t) => t.live), [true, false, false]);
});

test('accent decision candidates: the three sealed hues, start-state first', () => {
  assert.deepEqual(ACCENT_CANDIDATES.map((c) => c.value), ['#B5552C', '#D96B43', '#024AD8']);
});

test('wrapper themes: cream default + modern (the named token sets)', () => {
  assert.deepEqual(WRAPPER_THEMES.map((t) => t.id), ['cream', 'modern']);
});

/* ── Design dashboard overrides (sealed p3: live token writes + persist +
 * reset-to-start-state; defaults contribute NOTHING) ─────────────────────── */
test('designOverrides: all-default design → zero overrides (tokens.css IS the start-state)', () => {
  assert.deepEqual(designOverrides(DESIGN_DEFAULTS), []);
  assert.deepEqual(designOverrides(undefined), []);
});

test('designOverrides: flat shadows null every elevation step + the map-dot shadow', () => {
  const pairs = designOverrides({ shadows: 'flat' });
  assert.deepEqual(pairs, [
    ['--ui-sys-elevation-1', 'none'],
    ['--ui-sys-elevation-2', 'none'],
    ['--ui-sys-elevation-3', 'none'],
    ['--ui-sys-map-dot-shadow', 'none'],
  ]);
});

test('designOverrides: accent override writes the accent role + the derived ink; invalid hex writes nothing', () => {
  const pairs = designOverrides({ accent: '#024AD8' });
  assert.deepEqual(pairs[0], ['--ui-sys-accent', '#024AD8']);
  assert.ok(pairs[1][1].includes('#024AD8'));
  assert.deepEqual(designOverrides({ accent: 'blue' }), []);
});

test('designOverrides: radius/density/typeScale map to their token roles', () => {
  const r = Object.fromEntries(designOverrides({ radius: 'rounded' }));
  assert.equal(r['--ui-sys-shape-control'], 'var(--ui-ref-radius-sm)');
  assert.equal(r['--ui-sys-shape-card'], 'var(--ui-ref-radius-lg)');
  const d = Object.fromEntries(designOverrides({ density: 'compact' }));
  assert.equal(d['--ui-sys-control-height'], '32px');
  const ty = Object.fromEntries(designOverrides({ typeScale: 'comfortable' }));
  assert.ok(ty['--ui-sys-font-body'].startsWith('400 14px'));
});

test('every override lands inside DESIGN_VARS (reset clears exactly the dashboard surface)', () => {
  const all = [
    ...designOverrides({ accent: '#D96B43', shadows: 'flat', radius: 'rounded', density: 'compact', typeScale: 'comfortable' }),
  ].map(([k]) => k);
  for (const k of all) assert.ok(DESIGN_VARS.includes(k), k + ' missing from DESIGN_VARS');
});

test('designOverrides NEVER touches zone or pill tokens (sealed law)', () => {
  const all = designOverrides({ accent: '#D96B43', shadows: 'flat', radius: 'rounded', density: 'compact', typeScale: 'comfortable' });
  for (const [k] of all) {
    assert.ok(!/zone|priority|segment|kind|goal|stage|status/.test(k), k + ' is a protected family');
  }
  for (const k of DESIGN_VARS) {
    assert.ok(!/zone|priority|segment|kind|goal|stage|status/.test(k), k + ' is a protected family');
  }
});

test('themeAttribute: cream/default → no attribute; modern → "modern"', () => {
  assert.equal(themeAttribute(undefined), null);
  assert.equal(themeAttribute({ theme: 'cream' }), null);
  assert.equal(themeAttribute({ theme: 'modern' }), 'modern');
});

/* ── Integrations shell (sealed forward-design roster + chip) ────────────── */
test('integrations: the sealed p7 connector roster + the "Coming in State B" chip', () => {
  assert.deepEqual(INTEGRATIONS_CONNECTORS.map((c) => c.name),
    ['LegiScan', 'Quorum', 'CRM', 'Marketing', 'Drive']);
  assert.equal(INTEGRATIONS_CHIP, 'Coming in State B');
});

console.log(`settings-test: ${n} assertions passed`);
