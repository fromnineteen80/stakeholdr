#!/usr/bin/env node
/* modal-test.mjs — node asserts on the StakeholderModal's PURE logic
 * (src/app/modals/stakeholder-logic.js), with expected values taken FROM THE
 * SEALED BOX TEXT ("Create / edit stakeholder modal (StakeholderModal)" +
 * "Catalogs" + "Shared UI primitives" in src/guide.jsx).
 * Run: node scripts/modal-test.mjs                                           */
import assert from 'node:assert/strict';
import {
  blankDraft, draftFrom, shMissing, composeSubmit, TITLE_OPTIONS,
  titleCase, addIssueValue, commitCustomText, issueSelectorModel,
  CREATE_NOTICE, scoringNeededBody, deleteConfirmBody,
  OWNERS_HELP_EDIT, OWNERS_HELP_CREATE,
  todayYMD, formatDateLong,
  affiliatedCommunity, isDecided, money, approvedLabel, communityEntryAmount,
  stakeholderCumulativeUSD,
} from '../src/app/modals/stakeholder-logic.js';
import { CATEGORIES, TAGS } from '../src/app/data/catalogs.js';

let passed = 0;
const ok = (name, fn) => { fn(); passed++; console.log('  ✓ ' + name); };
const me = { id: 'u-me', name: 'Test User' };

console.log('modal-test: sealed StakeholderModal pure logic\n');

/* ── BLANK-NEW DEFAULTS (sealed verbatim) ────────────────────────────────── */
ok('blank draft carries the sealed create defaults exactly', () => {
  const d = blankDraft(me);
  assert.equal(d.title, '');
  assert.equal(d.firstName, '');
  assert.equal(d.lastName, '');
  assert.equal(d.name, '');
  assert.equal(d.org, '');
  assert.equal(d.url, '');
  assert.equal(d.isPerson, false);
  assert.equal(d.photo, null);
  assert.equal(d.category, 'Communities');
  assert.equal(d.type, CATEGORIES['Communities'][0]);           // first of category
  assert.equal(d.type, 'Charity Organization');                 // sealed catalog order
  assert.equal(d.market, 'Americas');
  assert.equal(d.region, 'United States');
  assert.equal(d.geography, 'Local');
  assert.equal(d.priority, 'Medium');
  assert.deepEqual(d.tags, []);
  assert.deepEqual(d.issues, []);
  assert.deepEqual(d.owners, ['u-me']);                         // owners = [currentUser.id]
  assert.equal(d.status, 'Active');
  assert.equal(d.lastContact, todayYMD());                      // today, YYYY-MM-DD
  assert.match(d.lastContact, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(d.notes, '');
});
ok('no currentUser → owners []', () => {
  assert.deepEqual(blankDraft(null).owners, []);
});
ok('edit draft: { ...blank, ...existing } with isPerson INFERRED from names', () => {
  const e1 = draftFrom({ id: 'sh-x', org: 'Org', firstName: 'Maria', isPerson: false }, me);
  assert.equal(e1.isPerson, true);                              // inferred, stored flag ignored
  const e2 = draftFrom({ id: 'sh-y', org: 'Org', isPerson: true }, me);
  assert.equal(e2.isPerson, false);                             // no names → not a person
});

/* ── VALIDATION (sealed shMissing; exact display strings + conditionals) ── */
const validBase = () => ({ ...blankDraft(me), org: 'City of Cedarville' });
ok('blank draft misses only Organization', () => {
  assert.deepEqual(shMissing(blankDraft(me)), ['Organization']);
});
ok('a filled org draft is valid', () => {
  assert.deepEqual(shMissing(validBase()), []);
});
ok('conditional "Person name": isPerson with neither first nor last name', () => {
  assert.deepEqual(shMissing({ ...validBase(), isPerson: true }), ['Person name']);
  assert.deepEqual(shMissing({ ...validBase(), isPerson: true, firstName: 'Maria' }), []);
  assert.deepEqual(shMissing({ ...validBase(), isPerson: true, lastName: 'Chen' }), []);
});
ok('conditional "Custom title": isPerson + title Other + blank titleOther', () => {
  const d = { ...validBase(), isPerson: true, firstName: 'Lena', title: 'Other', titleOther: '' };
  assert.deepEqual(shMissing(d), ['Custom title']);
  assert.deepEqual(shMissing({ ...d, titleOther: 'Provost' }), []);
});
ok('always-required set: Category / Audience type / Market / Region / Geography', () => {
  const d = { ...validBase(), category: '', type: '', market: '', region: '', geography: '' };
  assert.deepEqual(shMissing(d),
    ['Category', 'Audience type', 'Market', 'Region', 'Geography']);
});
ok('conditional "State (from site)": chosen site has a state but state unset', () => {
  const sites = [{ id: 'site-x', city: 'Palo Alto', state: 'California', country: 'United States' }];
  const d = { ...validBase(), site: 'site-x', state: '' };
  assert.deepEqual(shMissing(d, sites), ['State (from site)']);
  assert.deepEqual(shMissing({ ...d, state: 'California' }, sites), []);
  // a country-only site never trips it
  const intl = [{ id: 'site-x', city: 'Berlin', country: 'Germany' }];
  assert.deepEqual(shMissing(d, intl), []);
});

/* ── titleCase (sealed formula: first char upper + REST LOWER, per word) ── */
ok('titleCase: split on whitespace, capitalize each word, rest lowered', () => {
  assert.equal(titleCase('procurement  reform'), 'Procurement Reform');
  assert.equal(titleCase('AI'), 'Ai');                          // rest LOWER (sealed)
  assert.equal(titleCase('  site   operations  '), 'Site Operations');
  assert.equal(titleCase(''), '');
});

/* ── SUBMIT NAME COMPOSITION (sealed submit()) ───────────────────────────── */
ok('person: name = displayName with abbreviated title', () => {
  const d = { ...validBase(), isPerson: true, title: 'Senator', firstName: 'Jane', lastName: 'Doe' };
  assert.equal(composeSubmit(d).name, 'Sen. Jane Doe');
});
ok('person with "Other" title uses titleOther verbatim', () => {
  const d = { ...validBase(), isPerson: true, title: 'Other', titleOther: 'Provost', firstName: 'Lena', lastName: 'Ortiz' };
  assert.equal(composeSubmit(d).name, 'Provost Lena Ortiz');
});
ok('"None" guard: the None option stores "" and contributes no prefix', () => {
  const none = TITLE_OPTIONS.find((o) => o.label === 'None');
  assert.equal(none.value, '');                                 // sealed: value ""
  assert.equal(TITLE_OPTIONS[0].label, 'None');                 // first, in catalog order
  assert.equal(TITLE_OPTIONS[TITLE_OPTIONS.length - 1].label, 'Other');
  const d = { ...validBase(), isPerson: true, title: '', firstName: 'Marcus', lastName: 'Boone' };
  assert.equal(composeSubmit(d).name, 'Marcus Boone');
});
ok('person with empty names falls back to org', () => {
  const d = { ...validBase(), isPerson: true, firstName: '', lastName: '' };
  assert.equal(composeSubmit(d).name, 'City of Cedarville');
});
ok('non-person: person fields CLEARED and name = org', () => {
  const d = { ...validBase(), isPerson: false, title: 'Mayor', titleOther: 'X', firstName: 'Maria', lastName: 'Chen' };
  const out = composeSubmit(d);
  assert.equal(out.name, 'City of Cedarville');
  assert.equal(out.title, '');
  assert.equal(out.titleOther, '');
  assert.equal(out.firstName, '');
  assert.equal(out.lastName, '');
});
ok('url runs through normalizeUrl on submit (https prepended; http(s) passes)', () => {
  assert.equal(composeSubmit({ ...validBase(), url: 'example.com' }).url, 'https://example.com');
  assert.equal(composeSubmit({ ...validBase(), url: 'HTTP://x.com' }).url, 'HTTP://x.com');
  assert.equal(composeSubmit({ ...validBase(), url: '  ' }).url, '');
});

/* ── IssueSelector model (sealed: adds titleCase+dedup; restrict) ────────── */
ok('addIssueValue titleCases and dedups (selected.includes guard)', () => {
  assert.deepEqual(addIssueValue([], 'ai policy'), ['Ai Policy']);
  const sel = ['Ai Policy'];
  assert.equal(addIssueValue(sel, 'AI POLICY'), sel);           // same array — no add
});
ok('commitCustomText splits on commas, titleCases, appends non-duplicates', () => {
  assert.deepEqual(
    commitCustomText(['Sustainability'], 'ai, procurement reform, SUSTAINABILITY,'),
    ['Sustainability', 'Ai', 'Procurement Reform'],
  );
});
ok('tag-restrict: restrict HIDES the custom input; available = company minus selected', () => {
  const m = issueSelectorModel({ selected: ['ally'], company: TAGS, restrict: true });
  assert.equal(m.showCustomInput, false);                       // sealed: restrict hides it
  assert.ok(!m.available.includes('ally'));
  assert.ok(m.available.includes('public-official'));
  assert.equal(m.available.length, TAGS.length - 1);
  const issues = issueSelectorModel({ selected: [], company: ['AI'], restrict: false });
  assert.equal(issues.showCustomInput, true);                   // Issues allow custom entry
});

/* ── Verbatim copy ───────────────────────────────────────────────────────── */
ok('create-only notice (task-directed verbatim)', () => {
  assert.equal(CREATE_NOTICE,
    "Score isn't set yet. Your team will be notified — they'll see this stakeholder at the top of their Sheet and the count on Scoring.");
});
ok('system message body (sealed exact)', () => {
  assert.equal(scoringNeededBody('Mayor Maria Chen', 'Mayor'),
    'New stakeholder added: Mayor Maria Chen (Mayor). Please score them on the Scoring tab.');
});
ok('delete-confirm body (sealed exact, displayName || name)', () => {
  assert.equal(
    deleteConfirmBody({ firstName: 'Maria', lastName: 'Chen', title: 'Mayor' }),
    'Mayor Maria Chen and all of their scores will be permanently removed. This cannot be undone.');
  assert.equal(
    deleteConfirmBody({ name: 'Oregon DEQ' }),
    'Oregon DEQ and all of their scores will be permanently removed. This cannot be undone.');
});
ok('owners helper copy per mode (sealed exact)', () => {
  assert.equal(OWNERS_HELP_EDIT, 'Edit who owns this stakeholder. Add or remove people responsible.');
  assert.equal(OWNERS_HELP_CREATE, "You're added by default. Add or remove people responsible.");
});

/* ── Shared date + community cross-link formulas (profile inputs) ────────── */
ok('formatDateLong: bare date parses at LOCAL midnight (no off-by-one)', () => {
  assert.equal(formatDateLong('2026-06-01'),
    new Date('2026-06-01T00:00:00').toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }));
  assert.equal(formatDateLong('not-a-date'), 'not-a-date');
  assert.equal(formatDateLong(''), '');
});
const comm = [
  { id: 'ca-1', stage: 'Active',   approvedAmount: 150000, unit: 'USD', amount: 150000, representedStakeholderId: 'sh-1', linkedStakeholders: [] },
  { id: 'ca-2', stage: 'Proposed', approvedAmount: 0,      unit: 'hours', amount: 200,  representedStakeholderId: 'sh-9', linkedStakeholders: ['sh-1'] },
  { id: 'ca-3', stage: 'Declined', approvedAmount: 5000,   unit: 'USD', amount: 5000,   representedStakeholderId: 'sh-2', linkedStakeholders: [] },
];
ok('affiliatedCommunity: represented OR linked', () => {
  assert.deepEqual(affiliatedCommunity('sh-1', comm).map((a) => a.id), ['ca-1', 'ca-2']);
});
ok('isDecided / approvedLabel / communityEntryAmount (sealed)', () => {
  assert.equal(isDecided('Approved') && isDecided('Active') && isDecided('Complete'), true);
  assert.equal(isDecided('Under Review'), false);
  assert.equal(money(150000), '$150,000');
  assert.deepEqual(approvedLabel(comm[0]), { text: '$150,000', tone: 'pos' });
  assert.deepEqual(approvedLabel(comm[2]), { text: 'Declined', tone: 'neg' });
  assert.deepEqual(approvedLabel({ stage: 'Active', approvedAmount: 0 }), { text: 'No Expense', tone: 'muted' });
  assert.deepEqual(approvedLabel({ stage: 'Proposed' }), { text: 'TBD', tone: 'muted' });
  assert.equal(communityEntryAmount(comm[0]), '$150,000');      // USD → approvedLabel text
  assert.equal(communityEntryAmount(comm[1]), '200 hours');     // non-USD → "{amount} {unit}"
  assert.equal(communityEntryAmount({ unit: '', amount: 0 }), '-');
});
ok('stakeholderCumulativeUSD: Σ decided approvedAmount > 0 only', () => {
  assert.equal(stakeholderCumulativeUSD('sh-1', comm), 150000); // ca-2 undecided → 0
  assert.equal(stakeholderCumulativeUSD('sh-2', comm), 0);      // Declined never counts
});

console.log(`\nmodal-test: ${passed} assertions passed`);
