/* settings-logic.js — the Settings hub's PURE logic, built from the sealed box
 * "Settings — manager-only org config hub (9 oracle panes + Integrations as
 * forward-design) + the design dashboard" in src/guide.jsx (guide lines
 * ~2273–2580), the sealed App-shell appConfig wiring (~1752–1769), and the
 * Persistence box's appConfig key set. Node-testable: no DOM, no React
 * (scripts/settings-test.mjs asserts this module).
 *
 * FILE-HEADER LEDGER — DECLARED DEPARTURES / MAKE-REAL flags honored here:
 *  · PASTE-CLOBBER FIX (sealed ORACLE BUG, do-not-replicate): IssueSettings'
 *    comma commit built every onChange from the SAME stale array, so a pasted
 *    "a, b, c" kept only "b". issueListCommit accumulates every part into ONE
 *    next-array and returns it once — a multi-part paste commits every part.
 *  · COMMA-PROMISE MADE REAL (sealed COPY-OVER-CLAIM): SegmentSettings'
 *    placeholder promised "add with a comma or Enter" but only Enter ever
 *    committed, and "Foo," committed WITH the trailing comma. segmentAddCommit
 *    implements the sealed REBUILD DECISION: a typed comma commits the part
 *    before it (trimmed, comma stripped, deduped); no committed name ever
 *    carries a trailing comma.
 *  · addLabel (sealed dead param of IssueSettings) is NOT ported — sealed
 *    "do NOT invent an add-button-label feature from it".
 *  · The sealed theme/autoNightShift/nightShiftAt/timeZone DEAD WRITES are
 *    captured as config the page persists; their consumption state is
 *    declared at the page (see settings.jsx ledger).
 *  · APP-CONFIG SEED (DECLARED): the sealed oracle seed carried accent
 *    "#024AD8" + brand "#000000". The rebuild seed omits both — the accent
 *    start-hue is the sealed OPEN DESIGN DECISION (tokens.css ships the
 *    terracotta start-state; seeding the oracle blue would silently decide
 *    it), and brand falls back to the --ui-sys-brand token (#000000 — same
 *    observable default). appName/fiscal keys seed verbatim.
 *  · DESIGN OVERRIDES (Phase-11 design dashboard, sealed p3 items): pure
 *    designOverrides(design) maps the persisted appConfig.design record to
 *    [cssVar, value] pairs; defaults produce NO overrides (the tokens.css
 *    start-state IS the default — reset = clear). The accent-ink derivation
 *    (color-mix 65% accent / 35% near-black) is a DECLARED minimal stand-in:
 *    the sealed token warns accent-ink "must be re-derived when the accent
 *    hue is ruled" — final ink is ruled with the user; a live preview needs
 *    a text-safe dark sibling meanwhile.
 */
import {
  CATEGORIES, MARKETS, SEGMENTS, ISSUES, TAGS, FUNCTIONS, ORG_GOALS, SITES,
  US_STATES, MX_STATES, CA_PROVINCES, STATE_ABBR, COUNTRIES,
  SITE_COUNTRY_BY_MODE,
} from '../data/catalogs.js';

/* ── THE 9 ORACLE PANES (sealed order + labels, verbatim) + the two hosted
 * additions: "design" (the sealed design dashboard Settings hosts — build
 * phase p3) and "integrations" (the sealed PLANNED 10th pane, forward-design
 * shell). ─────────────────────────────────────────────────────────────────── */
export const SETTINGS_PANES = [
  ['identity', 'App Settings'],
  ['fiscal', 'Fiscal Calendar'],
  ['stakeholders', 'Stakeholders'],
  ['structure', 'Your Structure'],
  ['geography', 'Geography'],
  ['issues', 'Issues'],
  ['tags', 'Tags'],
  ['management', 'Team Management'],
  ['contact', 'Contact'],
];
export const DESIGN_PANE = ['design', 'Design'];
export const INTEGRATIONS_PANE = ['integrations', 'Integrations'];
export const DEFAULT_PANE = 'identity';

/* Sealed shell explainer copy for the settings view. */
export const SETTINGS_EXPLAINER =
  'Manager-only configuration for your organization. Changes apply to everyone.';

/* ── appConfig SEED + THE SEALED FALLBACK DERIVATION ──────────────────────
 * Sealed present-AND-non-empty contract (App-shell box): use the configured
 * value only when it is present AND non-empty, else the seed catalog. Arrays
 * fall back on missing OR length 0; object maps on missing OR zero keys.     */
export const APP_CONFIG_SEED = {
  appName: 'Stakeholdr',
  fiscalStartMonth: 11, /* Nov */
  fiscalStartDay: 1,
};

const arr = (v, seed) => (v && v.length ? v : (seed || []));
const obj = (v, seed) => (v && Object.keys(v).length ? v : seed);

export function deriveCompanyCatalogs(cfg) {
  const c = cfg || {};
  return {
    companyIssues: arr(c.issues, ISSUES),
    companyTags: arr(c.tags, TAGS),
    companyFunctions: arr(c.functions, FUNCTIONS),
    companySegments: obj(c.segments, SEGMENTS),
    companyMarkets: obj(c.markets, MARKETS),
    companyCategories: obj(c.categories, CATEGORIES),
    companySites: arr(c.sites, SITES),
    companyGoals: arr(c.orgGoals, ORG_GOALS), // NOTE the sealed rename: prop companyGoals ↔ appConfig key orgGoals
  };
}

/* Sealed fiscal defaults (pane: month DEFAULT 11, day DEFAULT 1). */
export function fiscalFrom(cfg) {
  const c = cfg || {};
  return {
    month: Number(c.fiscalStartMonth) || 11,
    day: Number(c.fiscalStartDay) || 1,
  };
}

/* ── QuartersPreview algorithm (sealed EXACT) ─────────────────────────────── */
export const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
/* MONTHLEN table (sealed; Feb = 29). */
export const MONTHLEN = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function addMonths(m, d, deltaMonths) {
  let nm = m + deltaMonths;
  while (nm > 12) nm -= 12;
  while (nm < 1) nm += 12;
  return { m: nm, d };
}

export function dayBefore({ m, d }) {
  if (d > 1) return { m, d: d - 1 };
  const prev = (m === 1 ? 12 : m - 1);
  return { m: prev, d: MONTHLEN[prev - 1] };
}

/* quartersFor(month, day) → 4 rows { label: "Q1".."Q4", range: "Mmm D → Mmm D" }.
 * Each quarter ends the day BEFORE the next quarter's start (sealed). */
export function quartersFor(month, day) {
  const out = [];
  for (let i = 0; i < 4; i++) {
    const start = addMonths(month, day, i * 3);
    const end = dayBefore(addMonths(month, day, (i + 1) * 3));
    out.push({
      label: 'Q' + (i + 1),
      range: `${MONTHS_SHORT[start.m - 1]} ${start.d} → ${MONTHS_SHORT[end.m - 1]} ${end.d}`,
    });
  }
  return out;
}

/* ── TAGS SLUG TRANSFORM (sealed — the ONLY transform caller): trim,
 * lowercase, whitespace runs → "-", strip every char not [a-z0-9-]. ───────── */
export function slugTag(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/* ── FLAT LIST EDITOR (IssueSettings) COMMIT LOGIC ─────────────────────────
 * norm(s) = transform ? transform(s) : s.trim() (sealed). */
const norm = (s, transform) => (transform ? transform(s) : String(s || '').trim());

/* issueListCommit(list, rawInput, transform) — the onChange comma path.
 * If the input contains a comma: split, pop the tail as the new draft, and
 * commit every non-empty, non-duplicate leading part into ONE next array
 * (the sealed PASTE-CLOBBER FIX — see the ledger). No comma → it is draft. */
export function issueListCommit(list, rawInput, transform) {
  const raw = String(rawInput ?? '');
  if (!raw.includes(',')) return { list, draft: raw, changed: false };
  const parts = raw.split(',');
  const draft = parts.pop();
  let next = list || [];
  for (const part of parts) {
    const t = norm(part, transform);
    if (t && !next.includes(t)) next = [...next, t];
  }
  return { list: next, draft, changed: next !== list };
}

/* issueAdd(list, draft, transform) — the Enter/blur add(): empty or duplicate
 * → clear draft, no change (sealed silent dedupe); else append. */
export function issueAdd(list, draft, transform) {
  const t = norm(draft, transform);
  if (!t || (list || []).includes(t)) return { list: list || [], draft: '', changed: false };
  return { list: [...(list || []), t], draft: '', changed: true };
}

export function issueRemove(list, value) {
  return (list || []).filter((i) => i !== value);
}

/* ── 2-LEVEL EDITOR (SegmentSettings) ──────────────────────────────────────
 * Data shape: { level1Name: [level2, …] }. Sealed dedupe semantics. */
export function addSegment(segments, name) {
  const t = String(name || '').trim();
  const segs = segments || {};
  if (!t || Object.prototype.hasOwnProperty.call(segs, t)) {
    return { segments: segs, changed: false };
  }
  return { segments: { ...segs, [t]: [] }, changed: true };
}

/* segmentAddCommit — the make-real comma commit for the level-1 adder (see
 * the ledger): every part before a comma commits via addSegment; the tail
 * stays as the draft. */
export function segmentAddCommit(segments, rawInput) {
  const raw = String(rawInput ?? '');
  if (!raw.includes(',')) return { segments: segments || {}, draft: raw, changed: false };
  const parts = raw.split(',');
  const draft = parts.pop();
  let segs = segments || {};
  let changed = false;
  for (const part of parts) {
    const r = addSegment(segs, part);
    segs = r.segments;
    changed = changed || r.changed;
  }
  return { segments: segs, draft, changed };
}

export function addUnit(segments, seg, unit) {
  const t = String(unit || '').trim();
  const units = (segments || {})[seg] || [];
  if (!t || units.includes(t)) return { segments: segments || {}, changed: false };
  return { segments: { ...segments, [seg]: [...units, t] }, changed: true };
}

export function removeUnit(segments, seg, unit) {
  return { ...segments, [seg]: ((segments || {})[seg] || []).filter((u) => u !== unit) };
}

export function removeSegment(segments, seg) {
  const next = { ...segments };
  delete next[seg];
  return next;
}

/* Sealed adder placeholders. */
export const segAdderPlaceholder = (SEG) => `New ${SEG} name, add with a comma or Enter`;
export const unitAdderPlaceholder = (UNIT) => `+ ${UNIT}`;

/* ── SITES EDITOR (SiteSettings) ──────────────────────────────────────────── */
export const SITE_MODES = [
  ['us', 'United States'], ['ca', 'Canada'], ['mx', 'Mexico'], ['intl', 'Other country'],
];
export function siteSubList(mode) {
  return mode === 'mx' ? MX_STATES : mode === 'ca' ? CA_PROVINCES : US_STATES;
}
export function siteSubPlaceholder(mode) {
  return mode === 'ca' ? 'Select province…' : 'Select state…';
}
/* intl country options: COUNTRIES filtered to EXCLUDE US/Canada/Mexico (sealed). */
export function intlCountryOptions() {
  return COUNTRIES.filter((c) => !['United States', 'Canada', 'Mexico'].includes(c));
}
/* makeSite (sealed add()): city required; intl requires country → { id, city,
 * country }; us/ca/mx require state, country DERIVED from the mode → { id,
 * city, state, country }. Returns null when invalid. */
export function makeSite({ city, mode, state, country }, id) {
  const c = String(city || '').trim();
  if (!c) return null;
  if (mode === 'intl') {
    if (!country) return null;
    return { id, city: c, country };
  }
  if (!state) return null;
  return { id, city: c, state, country: SITE_COUNTRY_BY_MODE[mode] };
}
/* Sealed chip label: "City, ST" (STATE_ABBR, raw-state fallback) or "City, Country". */
export function siteChipLabel(s) {
  return `${s.city}, ${s.state ? (STATE_ABBR[s.state] || s.state) : s.country}`;
}

/* ── IDENTITY PANE (sealed strings + time controls) ───────────────────────── */
export const APP_NAME_PLACEHOLDER = "HP's Stakeholder Map";
export const APP_NAME_HELP = 'Shown in the header, login screen, and browser tab title.';
export const BRAND_ICON_HELP = 'Replaces the default glyph inside the circular app icon. Sits on the brand color.';
export const BRAND_HELP = 'The colored circle behind the app icon in the header and login screen.';
export const ACCENT_HELP = 'Used for buttons, active states, the brand icon, and tab underlines.';
export const TZ_HELP = 'Created, updated, and approved timestamps are recorded in this time zone.';

/* Sealed 8 time zones, [value, label], verbatim order; default. */
export const TIME_ZONES = [
  ['America/Los_Angeles', 'Pacific (PT)'],
  ['America/Denver', 'Mountain (MT)'],
  ['America/Chicago', 'Central (CT)'],
  ['America/New_York', 'Eastern (ET)'],
  ['UTC', 'UTC'],
  ['Europe/London', 'London (GMT/BST)'],
  ['Europe/Berlin', 'Central European (CET)'],
  ['Asia/Tokyo', 'Japan (JST)'],
];
export const TIME_ZONE_DEFAULT = 'America/Los_Angeles';

/* Night Shift time picker (sealed split/compose math; stored "HH:MM" 24h,
 * DEFAULT "21:00"; minutes ONLY "00"/"30"). */
export const NIGHT_SHIFT_DEFAULT = '21:00';
export function splitNightShift(hhmm) {
  const [hh, mm] = String(hhmm || NIGHT_SHIFT_DEFAULT).split(':');
  const H = parseInt(hh, 10);
  return { h12: H % 12 === 0 ? 12 : H % 12, mm: mm || '00', ampm: H >= 12 ? 'PM' : 'AM' };
}
export function composeNightShift(nh12, nmm, nap) {
  let h = nh12 % 12;
  if (nap === 'PM') h += 12;
  return String(h).padStart(2, '0') + ':' + nmm;
}

/* ── PANE INTROS + SECTION COPY (sealed verbatim) ─────────────────────────── */
export const FISCAL_INTRO =
  "Pick the day your organization's fiscal year begins. Quarters are calculated " +
  'from that anchor as four equal three-month spans.';
export const CATEGORIES_INTRO =
  'How stakeholders are classified. Each category contains audience types. ' +
  'Stakeholders pick a category and one of its audience types. Add a category, ' +
  'then add its audience types.';
export const GOALS_INTRO =
  'The goals your organization is working toward. These are inherited by every ' +
  'stakeholder engagement plan your team creates so everyone applies these goals ' +
  'in their markets, regions, and with key audiences. We recommend 3 to 5 goals.';
export const SEGMENTS_INTRO =
  "Your organization's structure. Each segment contains business units that " +
  'operate as teams. Workspaces pair a segment with one of its units. Add a ' +
  'segment, then add its units.';
export const FUNCTIONS_INTRO =
  'The organizational functions a person can belong to. These populate the ' +
  "Function dropdown on every user's profile.";
export const MARKETS_INTRO =
  'The markets and the regions within them, used to scope stakeholders, plans, ' +
  'and community engagements across the app. Add a market, then add its regions.';
export const SITES_INTRO =
  'Where your organization has operations or offices. US sites carry a state ' +
  '(country is set to United States automatically); other sites carry a country. ' +
  'These feed future national, state, and local engagement plans.';
export const ISSUES_INTRO =
  'The set of issues the company maps stakeholders against. These appear in ' +
  "every stakeholder's card as suggested pills users can click. Users can also " +
  'write their own custom issues per stakeholder.';
export const TAGS_INTRO =
  'The shared tag vocabulary used across stakeholder lists. These appear as ' +
  'suggested pills on every stakeholder card. Users can still type their own ' +
  'custom tags per stakeholder.';
export const INVITE_INTRO =
  'Share this code with people joining your organization on Stakeholdr. They ' +
  'enter it when creating their account to be added to your team. Regenerate ' +
  'to invalidate the old code.';
export const ROLES_INTRO =
  'Managers see every workspace, can delete workspaces, manage roles, edit app ' +
  "identity, and access these settings. Users only see workspaces they're a " +
  'member of and can score / engage stakeholders in those.';
export const CONTACT_COPY =
  'Need help with Stakeholdr? Our team can assist with setup, training, ' +
  'onboarding new users, troubleshooting, and feature requests. We typically ' +
  'respond within one business day.';

/* ── DEMO DATA (Phase 19 — the sealed ~3882 "reset demo data" action made
 * real: the captured Store.reset() key sweep had ZERO call sites in the
 * oracle; the sealed forward-design is "a manager-only Settings affordance
 * calling Store.reset() then reloading the seed", plus the sealed ~3899
 * "blank-org vs demo-data seed choice". Copy is forward-design (nothing
 * sealed); the confirm body names EXACTLY what the key sweep clears. */
export const DEMO_DATA_INTRO =
  'This demo stores everything in this browser. Resetting clears it and ' +
  'starts over — either with the sample organization again, or blank.';
export const RESET_BUTTON_LABEL = 'Reset demo data…';
export const RESET_MODAL_TITLE = 'Reset demo data?';
export const RESET_MODAL_BODY =
  'This permanently clears everything this demo stores: stakeholders, ' +
  'workspaces, scoring & team weights, plans, community investments, ' +
  'messages, people & roles, and every Settings change (catalogs, identity, ' +
  'design). View preferences (layout modes, column order) are kept. ' +
  'The app then restarts. This cannot be undone.';
export const RESET_DEMO_LABEL = 'Reset to demo data';
export const RESET_BLANK_LABEL = 'Start blank';
export const RESET_DEMO_HELP =
  'Reset to demo data reloads the sample organization. Start blank opens an ' +
  'empty org — no stakeholders, workspaces, or plans; default settings; you ' +
  'continue as the sole manager.';
export const CONTACT_EMAIL = 'contact@stakeholdr.com';
export const ISSUE_ADD_PLACEHOLDER = 'Type and add with a comma or pressing Enter';

/* Sealed section-head counts: "{n} label(s)" — irregular plurals pass their
 * own plural form (category → categories). */
export const countLabel = (n, label, plural) =>
  `${n} ${n === 1 ? label : (plural || label + 's')}`;

/* ── TEAM MANAGEMENT (sealed) ─────────────────────────────────────────────── */
export const INVITE_PLACEHOLDER = 'STKH-7XQ4-9KMP';
export const INVITE_MODAL_TITLE = 'Request a new invite code';
export const INVITE_MODAL_BODY_PRE = "To regenerate your organization's invite code, email ";
export const INVITE_MODAL_BODY_POST = " We'll issue a new code and invalidate the old one.";
export const INVITE_MAIL_SUBJECT = 'New invite code request';
export const ROLES_SEARCH_PLACEHOLDER = 'Search by name, title, or email…';
export const SELF_DEMOTE_TITLE = "You can't demote yourself - ask another manager.";
export const MAKE_USER_TITLE = 'Make user';
/* Sealed role VALUES: the non-manager role is the string "member"; the UI
 * LABEL is "User". */
export const ROLE_MEMBER = 'member';
export const ROLE_MANAGER = 'manager';

/* filtered users (sealed): drop role === "system" FIRST, then the live query
 * (name/title/email lowercased includes). */
export function rolesFiltered(users, filter) {
  const q = String(filter || '').toLowerCase();
  return (users || [])
    .filter((u) => u.role !== 'system')
    .filter((u) => !q
      || String(u.name || '').toLowerCase().includes(q)
      || String(u.title || '').toLowerCase().includes(q)
      || String(u.email || '').toLowerCase().includes(q));
}
/* Sealed head count: "{managers} manager(s) · {rest} user(s)". */
export function rolesHeadCount(filtered) {
  const managers = filtered.filter((u) => u.role === ROLE_MANAGER).length;
  return `${countLabel(managers, 'manager')} · ${countLabel(filtered.length - managers, 'user')}`;
}

/* ── INTEGRATIONS (sealed forward-design shell — the p7 connector list; rows
 * render honestly inert with the sealed "Coming in State B" chip). ────────── */
export const INTEGRATIONS_CONNECTORS = [
  { id: 'legiscan', name: 'LegiScan', sub: 'Legislative tracking', icon: 'language' },
  { id: 'quorum', name: 'Quorum', sub: 'Public affairs platform', icon: 'insights' },
  { id: 'crm', name: 'CRM', sub: 'Customer relationship management', icon: 'group' },
  { id: 'marketing', name: 'Marketing', sub: 'Campaign & outreach tools', icon: 'mail' },
  { id: 'drive', name: 'Drive', sub: 'Document storage', icon: 'description' },
];
export const INTEGRATIONS_CHIP = 'Coming in State B';
export const INTEGRATIONS_INTRO =
  'Third-party connections for your organization. This pane is forward-design: ' +
  'connectors wire up with the backend build (State B); nothing here is live yet.';

/* ══ THE DESIGN DASHBOARD (sealed build-phase p3 + CLAUDE.md DESIGN
 * START-STATE; the three OPEN DECISIONS surface as controls, defaulting to
 * the tokens.css start-state — the USER rules them, nothing here decides). ══ */

export const DESIGN_DEFAULTS = {
  theme: 'cream',     /* wrapper token set: cream (default) | modern */
  accent: '',         /* '' = the tokens.css start-state accent */
  shadows: 'ramp',    /* 'ramp' (tokens.css elevation start-state) | 'flat' */
  radius: 'start',    /* 'start' (4px controls / 12px cards) | 'rounded' */
  density: 'start',   /* 'start' (36px controls) | 'compact' (32px) */
  typeScale: 'start', /* 'start' (13px body) | 'comfortable' (14px) */
};

/* Every CSS variable the dashboard may override — reset clears EXACTLY these. */
export const DESIGN_VARS = [
  '--ui-sys-accent', '--ui-sys-accent-ink',
  '--ui-sys-elevation-1', '--ui-sys-elevation-2', '--ui-sys-elevation-3',
  '--ui-sys-map-dot-shadow',
  '--ui-sys-shape-control', '--ui-sys-shape-card',
  '--ui-sys-control-height', '--ui-sys-list-item-min-height',
  '--ui-sys-font-body', '--ui-sys-font-label', '--ui-sys-font-body-lg',
];

/* designOverrides(design) → [ [cssVar, value], … ] — the pure mapping the
 * live applier and the test suite share. Start-state choices contribute NO
 * pairs (tokens.css already is the start-state). */
export function designOverrides(design) {
  const d = { ...DESIGN_DEFAULTS, ...(design || {}) };
  const pairs = [];
  if (d.accent && /^#[0-9a-fA-F]{6}$/.test(d.accent)) {
    pairs.push(['--ui-sys-accent', d.accent]);
    /* DECLARED minimal accent-ink stand-in (see the ledger). */
    pairs.push(['--ui-sys-accent-ink',
      `color-mix(in srgb, ${d.accent} 65%, var(--ui-ref-ink-strong))`]);
  }
  if (d.shadows === 'flat') {
    pairs.push(['--ui-sys-elevation-1', 'none']);
    pairs.push(['--ui-sys-elevation-2', 'none']);
    pairs.push(['--ui-sys-elevation-3', 'none']);
    pairs.push(['--ui-sys-map-dot-shadow', 'none']);
  }
  if (d.radius === 'rounded') {
    pairs.push(['--ui-sys-shape-control', 'var(--ui-ref-radius-sm)']);
    pairs.push(['--ui-sys-shape-card', 'var(--ui-ref-radius-lg)']);
  }
  if (d.density === 'compact') {
    pairs.push(['--ui-sys-control-height', '32px']);
    pairs.push(['--ui-sys-list-item-min-height', '40px']);
  }
  if (d.typeScale === 'comfortable') {
    pairs.push(['--ui-sys-font-body', '400 14px/1.45 var(--ui-ref-typeface-body)']);
    pairs.push(['--ui-sys-font-label', '500 14px/1.2 var(--ui-ref-typeface-body)']);
    pairs.push(['--ui-sys-font-body-lg', '400 15px/1.5 var(--ui-ref-typeface-body)']);
  }
  return pairs;
}

/* The wrapper theme applies as the tokens.css-documented root attribute:
 * data-theme="modern" | removed (cream default). */
export function themeAttribute(design) {
  const t = ((design || {}).theme) || DESIGN_DEFAULTS.theme;
  return t === 'modern' ? 'modern' : null;
}

/* Design-page control subtext (each control carries its Claude-ward target —
 * sealed p3 "Each control carries subtext describing the Claude endgame"). */
export const DESIGN_SUBTEXT = {
  theme: 'The wrapper only — surfaces and inks. The 14 relationship-zone colors, zone inks, and every pill family are never touched by a theme swap. Cream is the Soapbox start-state; Modern is the cooler Slack-competing variant. OPEN DECISION — yours to rule.',
  accent: 'Buttons, active states, focus rings, and selected washes all re-derive from this one token. OPEN DECISION — terracotta (start-state), design.md\'s lighter terracotta, or the original app\'s blue. The dark accent-ink sibling re-derives with it and is finalized when you rule.',
  shadows: 'tokens.css ships a subtle elevation ramp for overlays; the design start-state rule said "no shadows ever". OPEN DECISION — flat sets every elevation step (and the map-dot shadow) to none.',
  radius: 'Start-state: 4px controls, 12px cards — tight, Claude-like. Rounded softens to 8px / 16px across every component at once.',
  density: 'Control and list-row heights. Start-state 36px controls / 48px rows; compact tightens to 32px / 40px for dense working screens.',
  typeScale: 'Inter body at 13px is the start-state (airy-but-tight). Comfortable moves body and labels to 14px everywhere, from one token.',
  reset: 'Clears every dashboard override so the app returns to the tokens.css start-state exactly.',
};
