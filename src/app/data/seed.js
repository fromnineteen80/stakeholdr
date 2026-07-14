/* seed.js — the STATE-A demo seed, built per the sealed box
 * "Demo seed dataset — shape + canonical sample (fresh fixtures regenerated at
 * rebuild)" in src/guide.jsx.
 *
 * SEALED RULING: the demo fixtures are ILLUSTRATIVE, not app logic — they are
 * REGENERATED fresh at rebuild in the IDENTICAL SHAPE. Only these values are
 * pinned VERBATIM because downstream features depend on them:
 *   · the 5 TEAM weights (1.5 / 1.2 / 1.0 / 0.8 / 0.7 — they drive weightedCoord)
 *   · the three Map-history trails on sh-01 / sh-06 / sh-12
 *   · the fully-worked sh-01 record (the canonical person-type shape)
 *   · the u-system "Reminders" bot user record
 *   · entity counts + category/market distribution (Communities 9 · Government 5
 *     · Industry 3 · Investors 2 · Our People 1; NO Consumers record; Americas 16
 *     / EMEA 3 / LATAM 1), the 6 workspace ids/names, conversation/message
 *     counts (c-system ships EMPTY — zero seeded bot posts), 4 community apps
 *     (one per major kind), 1 plan with sectorModel "energy" + goalModel
 *     "shared-value".
 * Everything else below is fresh, plausible, HP-flavored sample data.
 *
 * TOKEN LAW: avatarColor values are --ui-sys-avatar-* token REFERENCES (the
 * census CAPTURED→TOKEN identity palette in design-system/tokens.css), never
 * literal hex — the guard bans hex in app code.
 */

export const MASTER_WORKSPACE_ID = '__master';

/* ── USERS — 8 records (the HP pool the logged-in user is chosen from) ────
 * Shape: { id, name, title, email, avatarColor, presence, role }.
 * manager: can delete any workspace · member: only workspaces they created ·
 * system: bots (never in pickers/online lists).                             */
export const SEED_USERS = [
  { id: 'u-alex',    name: 'Alex Rivera',     title: 'Director, Government Affairs', email: 'alex.rivera@hp.com',     avatarColor: 'var(--ui-sys-avatar-palette-1)', presence: 'online',  role: 'manager' },
  { id: 'u-jordan',  name: 'Jordan Kim',      title: 'Public Policy Lead',           email: 'jordan.kim@hp.com',      avatarColor: 'var(--ui-sys-avatar-palette-2)', presence: 'online',  role: 'manager' },
  { id: 'u-sam',     name: 'Sam Okafor',      title: 'Community Relations Manager',  email: 'sam.okafor@hp.com',      avatarColor: 'var(--ui-sys-avatar-palette-3)', presence: 'online',  role: 'member'  },
  { id: 'u-priya',   name: 'Priya Patel',     title: 'Communications Director',      email: 'priya.patel@hp.com',     avatarColor: 'var(--ui-sys-avatar-palette-6)', presence: 'away',    role: 'manager' },
  { id: 'u-devon',   name: 'Devon Wright',    title: 'Sustainability Analyst',       email: 'devon.wright@hp.com',    avatarColor: 'var(--ui-sys-avatar-palette-4)', presence: 'online',  role: 'member'  },
  { id: 'u-marisol', name: 'Marisol Aguilar', title: 'Regional Affairs Manager',     email: 'marisol.aguilar@hp.com', avatarColor: 'var(--ui-sys-avatar-palette-7)', presence: 'offline', role: 'member'  },
  { id: 'u-kenji',   name: 'Kenji Tanaka',    title: 'Site Operations Lead',         email: 'kenji.tanaka@hp.com',    avatarColor: 'var(--ui-sys-avatar-palette-5)', presence: 'online',  role: 'member'  },
  // The Reminders bot — sealed exact record (the only system-role user; authors
  // automated reminder messages). Sealed avatarColor #1F1A14 lives in the
  // --ui-sys-avatar-system token.
  { id: 'u-system',  name: 'Reminders',       title: 'Automated reminders',          email: 'noreply@hp.com',         avatarColor: 'var(--ui-sys-avatar-system)',    presence: 'online',  role: 'system'  },
];

/* ── TEAM — the 5-member scoring team. Shape: { id, userId, weight }.
 * The EXACT weights are load-bearing (sealed verbatim — they drive
 * weightedCoord); only these 5 appear in SEED_SCORES.                        */
export const SEED_TEAM = [
  { id: 'tm-alex',   userId: 'u-alex',   weight: 1.5 },
  { id: 'tm-jordan', userId: 'u-jordan', weight: 1.2 },
  { id: 'tm-sam',    userId: 'u-sam',    weight: 1.0 },
  { id: 'tm-priya',  userId: 'u-priya',  weight: 0.8 },
  { id: 'tm-devon',  userId: 'u-devon',  weight: 0.7 },
];

/* ── WORKSPACES — the sealed 6 (ids + names verbatim), plus the implicit
 * __master all-up view (MASTER_WORKSPACE_ID above — immovable first tab, the
 * union of ALL stakeholders; not a stored record). Shape:
 * { id, name, segment, businessUnit, owners[], createdBy, createdAt }.
 * Each picks one (segment, businessUnit) pair from the SEGMENTS catalog.     */
export const SEED_WORKSPACES = [
  { id: 'ws-gapp-na',    name: 'Hawk',                            segment: 'Corporate Functions', businessUnit: 'Legal / GA&PP',          owners: ['u-jordan', 'u-alex'],  createdBy: 'u-alex',    createdAt: '2026-01-12T17:04:00.000Z' },
  { id: 'ws-gapp-emea',  name: 'Climate Change in Europe',        segment: 'Corporate Functions', businessUnit: 'Legal / GA&PP',          owners: ['u-priya'],             createdBy: 'u-priya',   createdAt: '2026-01-20T09:31:00.000Z' },
  { id: 'ws-ps-comm',    name: 'Imagine Event',                   segment: 'Personal Systems',    businessUnit: 'Commercial PCs & Laptops', owners: ['u-marisol'],         createdBy: 'u-marisol', createdAt: '2026-02-03T15:12:00.000Z' },
  { id: 'ws-print-supp', name: 'Clone Cartridges',                segment: 'Printing',            businessUnit: 'Supplies',               owners: ['u-kenji', 'u-devon'],  createdBy: 'u-kenji',   createdAt: '2026-02-17T20:45:00.000Z' },
  { id: 'ws-foundation', name: 'Future of Work at HP Foundation', segment: 'Corporate Functions', businessUnit: 'HP Foundation',          owners: ['u-sam'],               createdBy: 'u-sam',     createdAt: '2026-03-02T18:22:00.000Z' },
  { id: 'ws-sled',       name: 'Google Beam Tour',                segment: 'Corporate Functions', businessUnit: 'SLED',                   owners: ['u-alex', 'u-sam'],     createdBy: 'u-alex',    createdAt: '2026-03-19T16:08:00.000Z' },
];

/* ── STAKEHOLDERS — 20 records, ids sh-01…sh-20. (x, y) is NOT stored; it is
 * computed live from SEED_SCORES via weightedCoord. Distribution (sealed):
 * Communities 9 · Government 5 · Industry 3 · Investors 2 · Our People 1
 * (no Consumers) · markets Americas 16 / EMEA 3 / LATAM 1. Only sh-01/sh-06/
 * sh-12 carry history[] (the verbatim quarterly trails).                     */
export const SEED_STAKEHOLDERS = [
  // sh-01 — the CANONICAL fully-worked person record (sealed verbatim).
  {
    id: 'sh-01',
    isPerson: true,
    firstName: 'Maria', lastName: 'Chen', title: 'Mayor',
    name: 'Mayor Maria Chen',
    org: 'City of Cedarville',
    email: 'mchen@cedarville.gov', phone: '(503) 555-0142', xAccount: '@MayorMariaChen',
    category: 'Government', type: 'Mayor',
    market: 'Americas', region: 'United States', geography: 'Local',
    state: 'California', site: 'site-paloalto',
    issues: ['Site Operations', 'Sustainability'],
    priority: 'High',
    tags: ['public-official', 'key-influencer'],
    owners: ['u-jordan', 'u-sam'],
    lastContact: '2026-05-12',
    status: 'Active',
    notes: 'Generally supportive; cares about local jobs and waterfront access.',
    history: [
      { quarter: 'FY26 Q1', x: 1, y: 6, recordedAt: '2026-01-31' },
      { quarter: 'FY26 Q2', x: 2, y: 7, recordedAt: '2026-04-30' },
      { quarter: 'FY26 Q3', x: 3, y: 8, recordedAt: '2026-07-31' },
    ],
  },
  {
    id: 'sh-02', isPerson: true, firstName: 'Dana', lastName: 'Whitfield', title: 'Senator',
    name: 'Sen. Dana Whitfield', org: 'Oregon State Senate',
    email: 'sen.whitfield@oregonlegislature.gov', phone: '(971) 555-0188', xAccount: '@SenWhitfield',
    category: 'Government', type: 'State Senate',
    market: 'Americas', region: 'United States', geography: 'State', state: 'Oregon',
    issues: ['Taxation', 'Procurement Reform'], priority: 'High',
    tags: ['public-official', 'ally'], owners: ['u-alex'],
    lastContact: '2026-06-02', status: 'Active',
    notes: 'Chairs the procurement committee; open to modernization language.',
  },
  {
    id: 'sh-03', name: 'Oregon DEQ', org: 'Oregon Department of Environmental Quality',
    email: 'permits@deq.oregon.gov', phone: '(503) 555-0110', xAccount: '@OregonDEQ',
    category: 'Government', type: 'Regulator (State)',
    market: 'Americas', region: 'United States', geography: 'State', state: 'Oregon',
    issues: ['Sustainability', 'Site Operations'], priority: 'High',
    tags: ['regulator'], owners: ['u-devon'],
    lastContact: '2026-05-27', status: 'Active',
    notes: 'Reviewing the Corvallis water discharge permit renewal.',
  },
  {
    id: 'sh-04', name: 'Vancouver City Council', org: 'City of Vancouver, WA',
    email: 'council@cityofvancouver.us', phone: '(360) 555-0155', xAccount: '@VanWACouncil',
    category: 'Government', type: 'City Government',
    market: 'Americas', region: 'United States', geography: 'Local',
    state: 'Washington', site: 'site-vancouver',
    issues: ['Site Operations', 'Education'], priority: 'Medium',
    tags: ['local-gov'], owners: ['u-sam'],
    lastContact: '2026-04-18', status: 'Active',
    notes: 'Campus expansion goodwill is strong after the STEM lab opening.',
  },
  {
    id: 'sh-05', name: 'DG Environment', org: 'European Commission',
    email: 'env-info@ec.europa.eu', phone: '+32 2 555 0100', xAccount: '@EU_ENV',
    category: 'Government', type: 'Regulator (Federal)',
    market: 'EMEA', region: 'Europe', geography: 'Federal',
    issues: ['Sustainability', 'Supply Chain'], priority: 'High',
    tags: ['regulator', 'eu'], owners: ['u-priya'],
    lastContact: '2026-05-06', status: 'Watch',
    notes: 'Right-to-repair delegated acts in drafting; wants OEM input.',
  },
  // sh-06 — pinned history trail (sealed verbatim).
  {
    id: 'sh-06', name: 'Save Our River Coalition', org: 'Save Our River Coalition',
    email: 'info@saveourriver.org', phone: '(541) 555-0173', xAccount: '@SaveOurRiverOR',
    category: 'Communities', type: 'Activist Organization',
    market: 'Americas', region: 'United States', geography: 'Local', state: 'Oregon',
    issues: ['Site Operations', 'Sustainability'], priority: 'High',
    tags: ['activist', 'environmental'], owners: ['u-devon', 'u-sam'],
    lastContact: '2026-06-10', status: 'Watch',
    notes: 'Escalating opposition to the outfall permit; organizing hearings.',
    history: [
      { quarter: 'FY26 Q1', x: -5, y: 3, recordedAt: '2026-01-31' },
      { quarter: 'FY26 Q2', x: -6, y: 5, recordedAt: '2026-04-30' },
      { quarter: 'FY26 Q3', x: -8, y: 7, recordedAt: '2026-07-31' },
    ],
  },
  {
    id: 'sh-07', name: 'Cedarville Unified School District', org: 'Cedarville USD',
    email: 'superintendent@cedarvilleusd.org', phone: '(650) 555-0129', xAccount: '@CedarvilleUSD',
    category: 'Communities', type: 'K-12 Educator',
    market: 'Americas', region: 'United States', geography: 'Local', state: 'California',
    issues: ['Education', 'AI'], priority: 'Medium',
    tags: ['education', 'partner'], owners: ['u-sam'],
    lastContact: '2026-05-20', status: 'Active',
    notes: 'Device refresh pilot running in 12 classrooms; wants teacher training.',
  },
  {
    id: 'sh-08', isPerson: true, firstName: 'Marcus', lastName: 'Boone', title: '', // sealed None = value ""
    name: 'Marcus Boone', org: 'Greater Houston Interfaith Council',
    email: 'mboone@ghic.org', phone: '(713) 555-0147', xAccount: '@RevBoone',
    category: 'Communities', type: 'Church',
    market: 'Americas', region: 'United States', geography: 'Local',
    state: 'Texas', site: 'site-houston',
    issues: ['Education'], priority: 'Low',
    tags: ['faith'], owners: ['u-marisol'],
    lastContact: '2026-03-09', status: 'Dormant',
    notes: 'Hosted the workforce fair in 2025; light contact since.',
  },
  {
    id: 'sh-09', name: 'Cedar Valley Tribes', org: 'Cedar Valley Tribal Council',
    email: 'council@cedarvalleytribes.gov', phone: '(541) 555-0102', xAccount: '@CedarValleyTC',
    category: 'Communities', type: 'Tribes',
    market: 'Americas', region: 'United States', geography: 'Local', state: 'Oregon',
    issues: ['Site Operations', 'Sustainability'], priority: 'High',
    tags: ['sovereign', 'cultural'], owners: ['u-jordan', 'u-devon'],
    lastContact: '2026-06-08', status: 'Active',
    notes: 'Formal consultation on the riverbank restoration underway.',
  },
  {
    id: 'sh-10', name: 'KTVX Channel 4', org: 'KTVX Media Group',
    email: 'newsdesk@ktvx4.com', phone: '(503) 555-0195', xAccount: '@KTVX4News',
    category: 'Communities', type: 'Media',
    market: 'Americas', region: 'United States', geography: 'Local', state: 'Oregon',
    issues: ['Site Operations'], priority: 'Medium',
    tags: ['press', 'skeptical'], owners: ['u-priya'],
    lastContact: '2026-05-30', status: 'Watch',
    notes: 'Ran two critical segments on the permit; requests plant access.',
  },
  {
    id: 'sh-11', name: 'Houston Community Alliance', org: 'Houston Community Alliance',
    email: 'hello@houstonalliance.org', phone: '(281) 555-0161', xAccount: '@HTXAlliance',
    category: 'Communities', type: 'Community Alliance',
    market: 'Americas', region: 'United States', geography: 'Local',
    state: 'Texas', site: 'site-houston',
    issues: ['Education', 'Supply Chain'], priority: 'Medium',
    tags: ['coalition'], owners: ['u-marisol', 'u-sam'],
    lastContact: '2026-04-25', status: 'Active',
    notes: 'Co-sponsoring the summer internship cohort.',
  },
  // sh-12 — pinned history trail (sealed verbatim).
  {
    id: 'sh-12', name: 'Helios Capital', org: 'Helios Capital Management',
    email: 'ir-contact@helioscap.com', phone: '(212) 555-0170', xAccount: '@HeliosCapital',
    category: 'Investors', type: 'Activist Shareholder',
    market: 'Americas', region: 'United States', geography: 'National (all)',
    issues: ['Taxation', 'AI'], priority: 'High',
    tags: ['investor', 'skeptical'], owners: ['u-alex'],
    lastContact: '2026-06-01', status: 'Watch',
    notes: 'Pressing for a print-business spin-off ahead of the annual meeting.',
    history: [
      { quarter: 'FY26 Q1', x: -3, y: 4, recordedAt: '2026-01-31' },
      { quarter: 'FY26 Q2', x: -5, y: 5, recordedAt: '2026-04-30' },
      { quarter: 'FY26 Q3', x: -7, y: 5, recordedAt: '2026-07-31' },
    ],
  },
  {
    id: 'sh-13', isPerson: true, firstName: 'Lena', lastName: 'Ortiz', title: 'Other', titleOther: 'Provost',
    name: 'Provost Lena Ortiz', org: 'Willamette Polytechnic',
    email: 'lortiz@wpoly.edu', phone: '(503) 555-0136', xAccount: '@ProvostOrtiz',
    category: 'Communities', type: 'Higher Education',
    market: 'Americas', region: 'United States', geography: 'State',
    state: 'Oregon', site: 'site-corvallis',
    issues: ['AI', 'Education'], priority: 'Medium',
    tags: ['education', 'ally'], owners: ['u-sam', 'u-devon'],
    lastContact: '2026-05-15', status: 'Active',
    notes: 'AI-lab partnership renewal in legal review; strong champion.',
  },
  {
    id: 'sh-14', name: 'Grün Zukunft e.V.', org: 'Grün Zukunft e.V.',
    email: 'kontakt@gruen-zukunft.de', phone: '+49 30 555 0122', xAccount: '@GruenZukunft',
    category: 'Communities', type: 'NGO',
    market: 'EMEA', region: 'Europe', geography: 'National (all)',
    issues: ['Sustainability', 'Supply Chain'], priority: 'Medium',
    tags: ['ngo', 'environmental', 'eu'], owners: ['u-priya'],
    lastContact: '2026-04-30', status: 'Watch',
    notes: 'Publishing an e-waste scorecard in Q4; requested our take-back data.',
  },
  {
    id: 'sh-15', name: 'VFW Post 12', org: 'Veterans of Foreign Wars Post 12',
    email: 'post12@vfwtx.org', phone: '(832) 555-0119', xAccount: '@VFWPost12',
    category: 'Communities', type: 'Veterans',
    market: 'Americas', region: 'United States', geography: 'Local', state: 'Texas',
    issues: ['Education'], priority: 'Low',
    tags: ['veterans'], owners: ['u-marisol'],
    lastContact: '2026-02-14', status: 'Dormant',
    notes: 'Annual hiring-fair partner; reconnect before the fall cycle.',
  },
  {
    id: 'sh-16', name: 'Cascade Manufacturing Council', org: 'Cascade Manufacturing Council',
    email: 'members@cascademfg.org', phone: '(503) 555-0180', xAccount: '@CascadeMfg',
    category: 'Industry', type: 'Trade Association',
    market: 'Americas', region: 'United States', geography: 'State', state: 'Oregon',
    issues: ['Procurement Reform', 'Taxation'], priority: 'High',
    tags: ['industry', 'coalition', 'ally'], owners: ['u-alex', 'u-jordan'],
    lastContact: '2026-06-05', status: 'Active',
    notes: 'Aligned on the permitting-modernization bill; co-drafting testimony.',
  },
  {
    id: 'sh-17', name: 'CloneJet Ltda', org: 'CloneJet Ltda',
    email: 'contato@clonejet.com.br', phone: '+55 11 5555 0107', xAccount: '@CloneJetBR',
    category: 'Industry', type: 'Competition',
    market: 'LATAM', region: 'Brazil', geography: 'National (all)',
    issues: ['Supply Chain'], priority: 'Medium',
    tags: ['industry', 'supplies', 'recycling'], owners: ['u-kenji'],
    lastContact: '2026-03-28', status: 'Watch',
    notes: 'Largest clone-cartridge remanufacturer in Brazil; monitoring IP filings.',
  },
  {
    id: 'sh-18', name: 'IG Metall Bezirk Bayern', org: 'IG Metall',
    email: 'bayern@igmetall.de', phone: '+49 89 555 0144', xAccount: '@IGMetallBayern',
    category: 'Industry', type: 'Labor Union',
    market: 'EMEA', region: 'Europe', geography: 'State',
    issues: ['Supply Chain'], priority: 'Low',
    tags: ['workforce'], owners: ['u-priya'],
    lastContact: '2026-03-17', status: 'Dormant',
    notes: 'No active disputes; contract cycle reopens next spring.',
  },
  {
    id: 'sh-19', name: 'Meridian Pension Partners', org: 'Meridian Pension Partners',
    email: 'stewardship@meridianpp.com', phone: '(415) 555-0163', xAccount: '@MeridianPP',
    category: 'Investors', type: 'Shareholder',
    market: 'Americas', region: 'United States', geography: 'National (all)',
    issues: ['Sustainability', 'AI'], priority: 'Medium',
    tags: ['investor', 'board'], owners: ['u-alex'],
    lastContact: '2026-05-22', status: 'Active',
    notes: 'Long-horizon holder; asked for the FY26 circularity metrics early.',
  },
  {
    id: 'sh-20', isPerson: true, firstName: 'Aisha', lastName: 'Bell', title: '', // sealed None = value ""
    name: 'Aisha Bell', org: 'HP, Inc.',
    email: 'aisha.bell@hp.com', phone: '(541) 555-0151', xAccount: '@AishaBellHP',
    category: 'Our People', type: 'Community Outreach Lead',
    market: 'Americas', region: 'United States', geography: 'Local',
    state: 'Oregon', site: 'site-corvallis',
    issues: ['Education', 'Site Operations'], priority: 'Low',
    tags: ['internal', 'workforce'], owners: ['u-sam'],
    lastContact: '2026-06-11', status: 'Active',
    notes: 'Runs the Corvallis volunteer program; key conduit to local groups.',
  },
];

/* ── STAKEHOLDER ↔ WORKSPACE JOIN — 20 keys, one per stakeholder:
 * stakeholderWorkspaces[stakeholderId] = [workspaceId, …]. sh-01's pair is the
 * sealed example (ws-gapp-na + ws-sled).                                     */
export const SEED_STAKEHOLDER_WORKSPACES = {
  'sh-01': ['ws-gapp-na', 'ws-sled'],
  'sh-02': ['ws-gapp-na'],
  'sh-03': ['ws-gapp-na'],
  'sh-04': ['ws-gapp-na', 'ws-sled'],
  'sh-05': ['ws-gapp-emea'],
  'sh-06': ['ws-gapp-na'],
  'sh-07': ['ws-sled', 'ws-foundation'],
  'sh-08': ['ws-foundation'],
  'sh-09': ['ws-gapp-na'],
  'sh-10': ['ws-gapp-na'],
  'sh-11': ['ws-foundation'],
  'sh-12': ['ws-gapp-na'],
  'sh-13': ['ws-sled', 'ws-ps-comm'],
  'sh-14': ['ws-gapp-emea'],
  'sh-15': ['ws-foundation'],
  'sh-16': ['ws-gapp-na'],
  'sh-17': ['ws-print-supp'],
  'sh-18': ['ws-gapp-emea'],
  'sh-19': ['ws-gapp-na'],
  'sh-20': ['ws-foundation', 'ws-ps-comm'],
};

/* ── SEED_SCORES — the 20×5 scoring matrix:
 * SEED_SCORES[stakeholderId][teamMemberId] = { x, y }, integers in −10..10,
 * hand-picked so the dots spread across the interesting zones. sh-01's row is
 * the sealed reference row (verbatim). sh-06/sh-12 cluster where their pinned
 * history trails point ((−8,7) and (−7,5)).                                  */
export const SEED_SCORES = {
  'sh-01': { 'tm-alex': { x: 3, y: 8 },   'tm-jordan': { x: 4, y: 9 },   'tm-sam': { x: 2, y: 8 },   'tm-priya': { x: 3, y: 8 },   'tm-devon': { x: 2, y: 7 } },
  'sh-02': { 'tm-alex': { x: 6, y: 7 },   'tm-jordan': { x: 7, y: 8 },   'tm-sam': { x: 6, y: 6 },   'tm-priya': { x: 5, y: 7 },   'tm-devon': { x: 6, y: 7 } },
  'sh-03': { 'tm-alex': { x: -1, y: 4 },  'tm-jordan': { x: -2, y: 5 },  'tm-sam': { x: -1, y: 4 },  'tm-priya': { x: 0, y: 4 },   'tm-devon': { x: -2, y: 3 } },
  'sh-04': { 'tm-alex': { x: 2, y: 3 },   'tm-jordan': { x: 3, y: 4 },   'tm-sam': { x: 2, y: 3 },   'tm-priya': { x: 1, y: 2 },   'tm-devon': { x: 2, y: 3 } },
  'sh-05': { 'tm-alex': { x: -2, y: 6 },  'tm-jordan': { x: -3, y: 6 },  'tm-sam': { x: -2, y: 5 },  'tm-priya': { x: -1, y: 6 },  'tm-devon': { x: -3, y: 7 } },
  'sh-06': { 'tm-alex': { x: -8, y: 7 },  'tm-jordan': { x: -8, y: 6 },  'tm-sam': { x: -7, y: 7 },  'tm-priya': { x: -9, y: 8 },  'tm-devon': { x: -8, y: 7 } },
  'sh-07': { 'tm-alex': { x: 4, y: 1 },   'tm-jordan': { x: 4, y: 2 },   'tm-sam': { x: 5, y: 2 },   'tm-priya': { x: 3, y: 1 },   'tm-devon': { x: 4, y: 1 } },
  'sh-08': { 'tm-alex': { x: 1, y: -6 },  'tm-jordan': { x: 2, y: -7 },  'tm-sam': { x: 1, y: -6 },  'tm-priya': { x: 1, y: -5 },  'tm-devon': { x: 0, y: -6 } },
  'sh-09': { 'tm-alex': { x: 1, y: 6 },   'tm-jordan': { x: 2, y: 7 },   'tm-sam': { x: 1, y: 6 },   'tm-priya': { x: 2, y: 6 },   'tm-devon': { x: 1, y: 7 } },
  'sh-10': { 'tm-alex': { x: -4, y: 6 },  'tm-jordan': { x: -4, y: 7 },  'tm-sam': { x: -3, y: 6 },  'tm-priya': { x: -5, y: 6 },  'tm-devon': { x: -4, y: 5 } },
  'sh-11': { 'tm-alex': { x: 3, y: -3 },  'tm-jordan': { x: 3, y: -4 },  'tm-sam': { x: 4, y: -3 },  'tm-priya': { x: 2, y: -3 },  'tm-devon': { x: 3, y: -4 } },
  'sh-12': { 'tm-alex': { x: -7, y: 5 },  'tm-jordan': { x: -7, y: 4 },  'tm-sam': { x: -6, y: 5 },  'tm-priya': { x: -8, y: 5 },  'tm-devon': { x: -7, y: 6 } },
  'sh-13': { 'tm-alex': { x: 6, y: 3 },   'tm-jordan': { x: 7, y: 4 },   'tm-sam': { x: 6, y: 3 },   'tm-priya': { x: 6, y: 4 },   'tm-devon': { x: 7, y: 3 } },
  'sh-14': { 'tm-alex': { x: -3, y: -1 }, 'tm-jordan': { x: -3, y: -2 }, 'tm-sam': { x: -2, y: -1 }, 'tm-priya': { x: -4, y: -1 }, 'tm-devon': { x: -3, y: 0 } },
  'sh-15': { 'tm-alex': { x: 6, y: -6 },  'tm-jordan': { x: 6, y: -7 },  'tm-sam': { x: 7, y: -6 },  'tm-priya': { x: 5, y: -6 },  'tm-devon': { x: 6, y: -7 } },
  'sh-16': { 'tm-alex': { x: 7, y: 6 },   'tm-jordan': { x: 8, y: 7 },   'tm-sam': { x: 7, y: 6 },   'tm-priya': { x: 6, y: 6 },   'tm-devon': { x: 7, y: 7 } },
  'sh-17': { 'tm-alex': { x: -6, y: -7 }, 'tm-jordan': { x: -6, y: -6 }, 'tm-sam': { x: -5, y: -7 }, 'tm-priya': { x: -7, y: -7 }, 'tm-devon': { x: -6, y: -8 } },
  'sh-18': { 'tm-alex': { x: -4, y: -4 }, 'tm-jordan': { x: -3, y: -4 }, 'tm-sam': { x: -4, y: -3 }, 'tm-priya': { x: -4, y: -4 }, 'tm-devon': { x: -5, y: -4 } },
  'sh-19': { 'tm-alex': { x: 3, y: 1 },   'tm-jordan': { x: 3, y: 2 },   'tm-sam': { x: 2, y: 1 },   'tm-priya': { x: 3, y: 1 },   'tm-devon': { x: 4, y: 2 } },
  'sh-20': { 'tm-alex': { x: 8, y: 2 },   'tm-jordan': { x: 8, y: 1 },   'tm-sam': { x: 9, y: 2 },   'tm-priya': { x: 7, y: 2 },   'tm-devon': { x: 8, y: 3 } },
};

/* ── CONVERSATIONS — the sealed 5. Shape: { id, kind (direct/group/system),
 * participants[], title }. Direct conversations key by the sorted userId
 * pair; groups + system by their id.                                         */
export const SEED_CONVERSATIONS = [
  { id: 'c-001',    kind: 'direct', participants: ['u-jordan', 'u-sam'],  title: '' },
  { id: 'c-002',    kind: 'direct', participants: ['u-alex', 'u-jordan'], title: '' },
  { id: 'c-003',    kind: 'group',  participants: ['u-priya', 'u-jordan', 'u-devon'],          title: 'EMEA pre-meeting' },
  { id: 'c-004',    kind: 'group',  participants: ['u-jordan', 'u-devon', 'u-sam', 'u-alex'],  title: 'Cedar Valley Tribes consultation' },
  {
    id: 'c-system', kind: 'system', title: 'Reminders',
    participants: ['u-alex', 'u-jordan', 'u-sam', 'u-priya', 'u-devon', 'u-marisol', 'u-kenji', 'u-system'],
  },
];

/* ── MESSAGES — keyed by conversation id → [{ id, from, body, at }].
 * SEALED CORRECTION: keys exist for ONLY c-001 (3) / c-002 (2) / c-003 (2) /
 * c-004 (1); there is NO c-system key — the Reminders channel exists as a
 * conversation but ships EMPTY (zero seeded bot posts; do NOT invent any).   */
export const SEED_MESSAGES = {
  'c-001': [
    { id: 'm-001', from: 'u-jordan', body: 'Sam — can you take the Cedarville school-district check-in this week? I want fresh notes before the plan review.', at: '2026-06-09T16:42:00.000Z' },
    { id: 'm-002', from: 'u-sam',    body: 'On it. Meeting the superintendent Thursday; will log it against sh-07 after.',                                     at: '2026-06-09T16:55:00.000Z' },
    { id: 'm-003', from: 'u-jordan', body: 'Perfect. Flag anything on the AI curriculum ask — it feeds the Hawk plan.',                                       at: '2026-06-09T17:03:00.000Z' },
  ],
  'c-002': [
    { id: 'm-004', from: 'u-alex',   body: 'Helios filed another 13D amendment this morning. Re-score before Friday?',   at: '2026-06-10T14:20:00.000Z' },
    { id: 'm-005', from: 'u-jordan', body: 'Yes — I moved my numbers already. Ask Priya and Devon to update theirs too.', at: '2026-06-10T14:31:00.000Z' },
  ],
  'c-003': [
    { id: 'm-006', from: 'u-priya', body: 'Agenda for the EMEA pre-meeting: DG Environment drafting timeline, then the Grün Zukunft scorecard request.', at: '2026-06-05T08:15:00.000Z' },
    { id: 'm-007', from: 'u-devon', body: 'I can bring the take-back data summary — sharing the deck tonight.',                                          at: '2026-06-05T08:44:00.000Z' },
  ],
  'c-004': [
    { id: 'm-008', from: 'u-jordan', body: 'Consultation prep: the tribal council asked for the riverbank restoration milestones in writing before the next session.', at: '2026-06-08T19:02:00.000Z' },
  ],
};

/* ── READS — per-user read markers: reads[userId][conversationId] = the
 * last-seen message ISO. DECLARED NEW TABLE (Phase 12): the sealed capture
 * rules the oracle's fake unread badge DO-NOT-REPLICATE and mandates REAL
 * per-conversation read state; the map shape is the minimal
 * industry-standard choice (per-user rows map 1:1 onto the Supabase swap).
 * Ships empty — every seeded message starts unread.                         */
export const SEED_READS = {};

/* ── COMMUNITY — 4 applications, one per major KIND (sealed counts/kinds/
 * stages), in the SEALED FIELD SHAPE (Community box data model): identity +
 * kind + stage + summary/description/rationale + submitter/submitterRole/
 * dateSubmitted + representedStakeholderId + recipient + linkedStakeholders[]
 * + markets/regions/issues + FLAT askType/amount/unit/recurrence/years +
 * timeline/decisionDeadline + budget{total, requested, otherFunding, inKind}
 * + approvedAmount/dateApproved + licenseToOperate/relationshipImpact (value
 * score = their mean, computed downstream) + risk{reputational, legal,
 * conflictOfInterest, attestation} + attachments + votes + owners/createdBy/
 * createdAt/updatedAt. unit ∈ USD · hours · "" (sealed enum);
 * approvedAmount/dateApproved drive the sealed rollups + the profile's
 * cumulative-committed sum (isDecided(stage) && approvedAmount > 0).         */
export const SEED_COMMUNITY = [
  {
    id: 'ca-01', name: 'Cedarville STEM Classroom Grant',
    kind: 'Philanthropy', stage: 'Active',
    summary: 'Three-year STEM equipment and teacher-training grant for Cedarville USD.',
    description: 'Funds printer/PC labs in 12 classrooms plus an annual teacher-training summer institute.',
    rationale: 'Deepens the district partnership and visibly supports local education around the Palo Alto site.',
    submitter: 'u-sam', submitterRole: 'Community Relations Manager', dateSubmitted: '2025-12-04',
    representedStakeholderId: 'sh-07',
    recipient: 'Cedarville Unified School District',
    linkedStakeholders: ['sh-01', 'sh-13'],
    markets: ['Americas'], regions: ['United States'], issues: ['Education', 'AI'],
    askType: 'Funding', amount: 150000, unit: 'USD', recurrence: 'Multi-year', years: 3,
    timeline: 'FY26 Q1 – FY28 Q4', decisionDeadline: '2026-01-15',
    budget: { total: 150000, requested: 150000, otherFunding: 0, inKind: '' },
    approvedAmount: 150000, dateApproved: '2026-01-22',
    licenseToOperate: 7, relationshipImpact: 8,
    risk: { reputational: 'Low — established district partner; standard grant agreement.', legal: '', conflictOfInterest: false, attestation: true },
    attachments: [],
    votes: { 'u-alex': 'for', 'u-jordan': 'for', 'u-sam': 'for', 'u-devon': 'abstain' },
    owners: ['u-sam'], createdBy: 'u-sam', createdAt: '2025-12-04T17:10:00.000Z', updatedAt: '2026-01-22T18:30:00.000Z',
  },
  {
    id: 'ca-02', name: 'Willamette River Cleanup Day',
    kind: 'Volunteering', stage: 'Proposed',
    summary: 'Employee volunteer day restoring the riverbank near the Corvallis site.',
    description: '200 employee volunteer hours, co-organized with the tribal council; HP provides logistics and supplies.',
    rationale: 'Directly counters the outfall-permit narrative with visible stewardship beside our critics.',
    submitter: 'u-devon', submitterRole: 'Sustainability Analyst', dateSubmitted: '2026-05-28',
    representedStakeholderId: 'sh-09',
    recipient: 'Cedar Valley Tribal Council',
    linkedStakeholders: ['sh-06', 'sh-20'],
    markets: ['Americas'], regions: ['United States'], issues: ['Sustainability', 'Site Operations'],
    askType: 'Volunteer hours', amount: 200, unit: 'hours', recurrence: 'Annual', years: 1,
    timeline: 'FY26 Q4', decisionDeadline: '2026-07-15',
    budget: { total: 8000, requested: 8000, otherFunding: 0, inKind: 'HP logistics and supplies' },
    approvedAmount: 0, dateApproved: '',
    licenseToOperate: 8, relationshipImpact: 6,
    risk: { reputational: 'Weather-dependent; coordinate messaging with the consultation track.', legal: '', conflictOfInterest: false, attestation: true },
    attachments: [],
    votes: { 'u-devon': 'for', 'u-sam': 'for' },
    owners: ['u-devon'], createdBy: 'u-devon', createdAt: '2026-05-28T21:05:00.000Z', updatedAt: '2026-05-28T21:05:00.000Z',
  },
  {
    id: 'ca-03', name: 'Oregon Modernization PAC Contribution',
    kind: 'Political Action (PAC)', stage: 'Under Review',
    summary: 'PAC contribution supporting the permitting-modernization legislative slate.',
    description: 'One-time contribution to the Cascade Manufacturing Council PAC for the FY26 session.',
    rationale: 'Aligns with the Hawk plan priority on permitting and modernization approvals.',
    submitter: 'u-alex', submitterRole: 'Director, Government Affairs', dateSubmitted: '2026-06-02',
    representedStakeholderId: 'sh-16',
    recipient: 'Cascade Manufacturing Council PAC',
    linkedStakeholders: ['sh-02'],
    markets: ['Americas'], regions: ['United States'], issues: ['Procurement Reform', 'Taxation'],
    askType: 'Political contribution', amount: 25000, unit: 'USD', recurrence: 'One-time', years: 1,
    timeline: 'FY26 Q4', decisionDeadline: '2026-08-01',
    budget: { total: 25000, requested: 25000, otherFunding: 0, inKind: '' },
    approvedAmount: 0, dateApproved: '',
    licenseToOperate: 6, relationshipImpact: 5,
    risk: { reputational: 'Public disclosure of the contribution.', legal: 'Requires legal compliance sign-off.', conflictOfInterest: false, attestation: true },
    attachments: [],
    votes: { 'u-alex': 'for', 'u-jordan': 'for', 'u-priya': 'against' },
    owners: ['u-alex'], createdBy: 'u-alex', createdAt: '2026-06-02T15:48:00.000Z', updatedAt: '2026-06-02T15:48:00.000Z',
  },
  {
    id: 'ca-04', name: 'LATAM E-Waste Take-Back Equipment',
    kind: 'Corporate Giving', givingMode: 'In-Kind', stage: 'Approved',
    summary: 'In-kind donation of collection and sorting equipment for a Brazilian e-waste cooperative network.',
    description: 'Donates refurbished sorting lines plus training to certified recycling cooperatives in São Paulo state.',
    rationale: 'Strengthens the supplies-recycling story in the market where clone-cartridge pressure is highest.',
    submitter: 'u-kenji', submitterRole: 'Site Operations Lead', dateSubmitted: '2026-03-20',
    representedStakeholderId: 'sh-17',
    recipient: 'Rede Recicla SP',
    linkedStakeholders: ['sh-14'],
    markets: ['LATAM'], regions: ['Brazil'], issues: ['Supply Chain', 'Sustainability'],
    askType: 'In-kind', amount: 60000, unit: 'USD', recurrence: 'One-time', years: 1,
    timeline: 'FY26 Q3 – FY27 Q1', decisionDeadline: '2026-04-10',
    budget: { total: 60000, requested: 60000, otherFunding: 0, inKind: 'Refurbished sorting lines + training' },
    approvedAmount: 60000, dateApproved: '2026-04-14',
    licenseToOperate: 7, relationshipImpact: 7,
    risk: { reputational: 'Low — logistics partner identified.', legal: 'Customs paperwork in progress.', conflictOfInterest: false, attestation: true },
    attachments: [],
    votes: { 'u-kenji': 'for', 'u-jordan': 'for', 'u-alex': 'for' },
    owners: ['u-kenji'], createdBy: 'u-kenji', createdAt: '2026-03-20T16:33:00.000Z', updatedAt: '2026-04-14T13:12:00.000Z',
  },
];

/* ── PLANS — the 1 seed plan (sealed identity: id, title, workspace, models,
 * owners, status; sectorModel + goalModel are the load-bearing details — they
 * select the plan-algorithm formulas). Now in the FULL sealed field shape
 * (Plan-page box data model + oracle metadata fields): title · market/region
 * (the community-linker scope) · site→state · geography · the three scenario
 * fields · goalNotes · strategies in the sealed {id, title, how, timing,
 * ownerId} shape · communityIds · measurement · priorityOverrides.
 * goals[] carries the 3 ORG_GOALS strings (sealed: plan.goals is otherwise a
 * DEAD field — only this seed plan populates it; nothing reads it).
 * DELIBERATELY NO stakeholderIds field: the sealed migration/seed baseline
 * for plans predating real per-plan membership = the oracle behavior
 * (membership = the full workspace roster — planStakeholderIds resolves it). */
export const SEED_PLANS = [
  {
    id: 'plan-gapp-na',
    workspaceId: 'ws-gapp-na',
    title: 'FY26 Hawk Engagement Plan',
    sectorModel: 'energy',
    goalModel: 'shared-value',
    market: 'Americas',
    region: 'United States',
    site: 'site-corvallis',
    state: 'Oregon',
    geography: 'State',
    owners: ['u-jordan', 'u-alex'],
    status: 'Active',
    summary: 'Protect the license to operate for the Oregon sites through FY26 permitting season: shift the Save Our River narrative, hold regulator trust, and convert legislative allies into public champions.',
    scenarioSolves: 'The Corvallis outfall-permit fight is hardening into an organized opposition story that threatens the FY27 modernization approvals and the broader Oregon license to operate.',
    scenarioApproach: 'Phase 1: stabilize regulator trust with proactive data. Phase 2: reframe the riverfront narrative through the tribal consultation and visible stewardship. Phase 3: convert legislative allies into public champions ahead of the fall hearings.',
    scenarioOutcome: 'The permit renews without contested hearings, the coalition narrative loses local traction, and the modernization slate enters FY27 with committed public champions.',
    goals: [
      "Defend the company's license to operate across key US markets",
      'Build trust capital with regulators and community leaders',
      'Position for upcoming permitting and modernization approvals',
    ],
    goalNotes: {},
    issues: ['Site Operations', 'Sustainability'],
    team: [
      { userId: 'u-jordan', role: 'Plan lead' },
      { userId: 'u-alex',   role: 'Government affairs' },
      { userId: 'u-devon',  role: 'Sustainability data' },
    ],
    strategies: [
      { id: 'st-01', title: 'Regulator confidence', how: 'Monthly technical briefings with Oregon DEQ; publish discharge data proactively ahead of the permit decision.', timing: 'Q1–Q4', ownerId: 'u-devon' },
      { id: 'st-02', title: 'Community coalition', how: 'Pair the tribal consultation and river-cleanup investment to reframe the riverfront story before the fall hearings.', timing: 'Q2–Q3', ownerId: 'u-jordan' },
    ],
    measurement: 'Quarterly re-score of the top-10 plan stakeholders; target: move Save Our River Coalition out of Proactively Defend and hold DEQ at Protect or better by FY26 Q4.',
    communityIds: ['ca-02'],
    priorityOverrides: {},
    createdBy: 'u-jordan',
    createdAt: '2026-02-06T18:00:00.000Z',
    updatedAt: '2026-06-11T15:20:00.000Z',
  },
];

/* ── BLANK START (Phase 19, sealed ~3899 "blank-org vs demo-data seed
 * choice" — FORWARD-DESIGN made real). When the blank marker is set
 * (store.js Store.startBlank), every table boots EMPTY instead of falling
 * back to its SEED_* fixture. Declared resolution of the two survivals:
 *  · appConfig KEEPS its defaults — the catalogs/fiscal/identity are org
 *    CONFIG, not demo rows (the Settings panes stay functional).
 *  · users boots with ONE minimal solo MANAGER — the app derives
 *    currentUser = users[0] until the Login phase, and a manager is required
 *    to reach Settings (incl. the reset affordance itself); a blank org must
 *    never lock itself out. avatarColor is a token reference (token law).   */
export const BLANK_SOLO_USER = {
  id: 'u-you',
  name: 'You',
  title: 'Manager',
  email: '',
  avatarColor: 'var(--ui-sys-avatar-palette-1)',
  presence: 'online',
  role: 'manager',
};

/* blankSeedFor(table, seed) — the blank-boot seed resolution: collections
 * empty (arrays → [], keyed maps → {}), appConfig kept, users → the solo
 * manager PLUS the u-system Reminders bot, conversations → the c-system
 * channel scoped to them (the sealed create/import side effects post to
 * c-system from u-system; without both records those writes would be
 * permanently unreachable — the dead-write pattern the build law bans),
 * scalars untouched. */
export function blankSeedFor(table, seed) {
  if (table === 'appConfig') return seed;
  if (table === 'users') {
    const sys = SEED_USERS.find((u) => u.id === 'u-system');
    return sys ? [BLANK_SOLO_USER, sys] : [BLANK_SOLO_USER];
  }
  if (table === 'conversations') {
    return [{
      id: 'c-system', kind: 'system', title: 'Reminders',
      participants: [BLANK_SOLO_USER.id, 'u-system'],
    }];
  }
  if (Array.isArray(seed)) return [];
  if (seed && typeof seed === 'object') return {};
  return seed;
}
