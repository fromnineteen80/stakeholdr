/* catalogs.js — the shared option lists, built VERBATIM from the sealed box
 * "Catalogs — the shared option lists (verbatim) + which are manager-editable"
 * in src/guide.jsx.
 *
 * Most catalogs ship as SEEDED DEFAULTS and become MANAGER-EDITABLE via
 * Settings (persisted to appConfig); a few are FIXED enums. Each export below
 * is tagged, and the EDITABLE map at the bottom is the machine-readable form.
 * Every dropdown/filter/chip in the app pulls from this ONE module (plus the
 * location helpers here); nothing re-declares an option list.
 */

/* CATEGORIES → AUDIENCE TYPES [EDITABLE: appConfig.categories; Settings →
 * Stakeholders]. Cascade: choosing a Category sets the Type options to that
 * category's list (Type resets to the new category's first entry).           */
export const CATEGORIES = {
  Communities: [
    'Charity Organization', 'Church', 'Community Alliance', 'Higher Education',
    'K-12 Educator', 'Local Business', 'Media', 'Military Branch', 'Neighbor',
    'NGO', 'Tribes', 'Veterans', 'Youth Program', 'Activist Organization',
    'Activist Member', 'General Public',
  ],
  Government: [
    'Agency (Inspector)', 'Agency (Permit Writer)', 'City Council Member',
    'City Government', 'County Government', 'County Supervisor',
    "Governor's Office", 'Judicial', 'Mayor', 'Regulator (Federal)',
    'Regulator (State)', 'Regulator (Local)', 'State Representative',
    'State Senate', 'US Congress', 'US Senate',
  ],
  'Our People': [
    'Community Outreach Lead', 'Diversity & Inclusion Lead', 'Executive',
    'General Employee', 'Former Employee', 'Contractor', 'Operations Manager',
    'Marketing Manager', 'Sales Manager', 'Retiree',
  ],
  Industry: [
    'Competition', 'Supply Chain', 'Trade Association', 'Channel Partners',
    'Industry Analysts', 'Business Coalition', 'Economic Development',
    'Labor Union',
  ],
  Consumers: [
    'Industry Consumers', 'Current Customers', 'Future Customers',
    'Lost Customers',
  ],
  Investors: [
    'Board Member', 'Shareholder', 'Activist Shareholder',
    'General Public Investor',
  ],
};

/* MARKETS → REGIONS [EDITABLE; Settings → Geography]. Cascade: Market sets
 * Region options (Region resets to the market's first entry).               */
export const MARKETS = {
  Americas: ['United States', 'Canada', 'Mexico'],
  LATAM: ['Brazil', 'Other Countries'],
  EMEA: ['Europe', 'Middle East', 'Africa'],
  APJ: ['Emerging APAC', 'Japan'],
};

/* GEOGRAPHIES [FIXED enum] — the literal values (GeographyChip keys off
 * "National (all)" exactly, per the sealed Workspaces capture).             */
export const GEOGRAPHIES = ['National (all)', 'Federal', 'State', 'Local'];

/* SEGMENTS → BUSINESS UNITS [EDITABLE: appConfig.segments; Settings → Your
 * Structure]. A workspace picks one (segment, businessUnit) pair.           */
export const SEGMENTS = {
  'Personal Systems': [
    'Commercial PCs & Laptops', 'Consumer PCs', 'Other Products', 'Services',
  ],
  Printing: ['Hardware', 'Supplies', 'Graphics & 3D Printing'],
  'Corporate Investments': ['Poly', 'HyperX'],
  'Corporate Functions': [
    'Marketing', 'Communications', 'Legal / GA&PP', 'HP Foundation',
    'Supply Chain', 'SLED',
  ],
};

/* ISSUES [EDITABLE: appConfig.issues] — reused by stakeholders, plans,
 * community.                                                                */
export const ISSUES = [
  'Procurement Reform', 'Sustainability', 'AI', 'Education', 'Taxation',
  'Site Operations', 'Supply Chain',
];

/* TAGS [EDITABLE: appConfig tags].                                          */
export const TAGS = [
  'public-official', 'key-influencer', 'coalition', 'ally', 'press',
  'skeptical', 'workforce', 'federal', 'activist', 'environmental',
  'regulator', 'education', 'partner', 'faith', 'veterans', 'board', 'health',
  'investor', 'internal', 'exec', 'sovereign', 'cultural', 'local-gov', 'eu',
  'ngo', 'industry', 'recycling', 'supplies',
];

/* FUNCTIONS [EDITABLE: appConfig.functions; Settings → Your Structure] — the
 * user "function" field.                                                     */
export const FUNCTIONS = [
  'Operations', 'Human Resources', 'Strategy', 'Research', 'Site Management',
  'Sales', 'Marketing', 'Communications', 'Legal', 'Government Affairs',
  'Community Relations', 'Intern',
];

/* ORG_GOALS [EDITABLE: managers, Settings → appConfig.orgGoals] — the 3 exact
 * seed strings, verbatim. Inheritance is LIVE, not copy-on-create: the
 * effective list = appConfig.orgGoals when non-empty, else this seed.
 * DO-NOT-REPLICATE (sealed): the old app made the live list visible to the
 * plan editor by MUTATING this module's constant (D.ORG_GOALS = companyGoals);
 * the rebuild passes org goals as real state/props from appConfig — this
 * constant is never reassigned.                                              */
export const ORG_GOALS = [
  "Defend the company's license to operate across key US markets",
  'Build trust capital with regulators and community leaders',
  'Position for upcoming permitting and modernization approvals',
];

/* PRIORITY [FIXED enum].                                                     */
export const PRIORITY = ['High', 'Medium', 'Low'];

/* STAKEHOLDER STATUS [FIXED enum].                                           */
export const STAKEHOLDER_STATUS = ['Active', 'Watch', 'Dormant'];

/* COMMUNITY [FIXED enums].                                                   */
export const COMMUNITY_KINDS = [
  'Philanthropy', 'Volunteering', 'Corporate Giving', 'Political Action (PAC)',
  'Sustainability', 'Social Impact',
];
export const COMMUNITY_STAGES = [
  'Idea', 'Proposed', 'Under Review', 'Approved', 'Active', 'Complete',
  'Declined',
];
export const COMMUNITY_ASK_TYPES = [
  'Funding', 'Volunteer hours', 'Endorsement', 'In-kind',
  'Political contribution',
];
export const COMMUNITY_RECURRENCE = ['One-time', 'Annual', 'Multi-year'];
export const COMMUNITY_GIVING_MODES = ['Monetary', 'In-Kind', 'Mix']; // Corporate Giving only

/* PLAN_STEPS [FIXED] — the 12-step Purpose / Plan / Execute engagement
 * framework, verbatim and in order (an array of three { phase, items[4] }
 * entries, exactly the sealed shape). SINGLE-SOURCED here: the old Help page
 * hardcoded a diverging copy ("Cross-functional teams alignment" at step 6) —
 * that fork is NOT replicated; which step-6 wording ships is an OPEN RULING
 * with the user (sealed Catalogs box). Until ruled, this canonical PLAN_STEPS
 * wording is the one source.                                                 */
export const PLAN_STEPS = [
  {
    phase: 'Purpose',
    items: [
      'Set goals for your organization',
      'Issue identification',
      'Stakeholder identification',
      'Stakeholder prioritization',
    ],
  },
  {
    phase: 'Plan',
    items: [
      'Landscape analysis',
      'Cross-functional alignment',
      'Research & listening sessions',
      'Early stakeholder analysis & modeling',
    ],
  },
  {
    phase: 'Execute',
    items: [
      'Launch campaign',
      'Ongoing stakeholder analysis',
      'Collaborate with stakeholders',
      'Realize shared value where possible',
    ],
  },
];

/* TITLES [FIXED enum] — honorifics for person-type stakeholders (the modal's
 * Title dropdown), exact and ordered. Selecting "Other" reveals a free-text
 * titleOther field.                                                          */
export const TITLES = [
  'None', 'Senator', 'Representative', 'Assemblymember', 'Governor', 'Mayor',
  'County Supervisor', 'Councilmember', 'City Councilmember', 'CEO',
  'Director', 'Other',
];

/* abbrevTitle map (full → abbreviated, used composing display names, e.g.
 * "Sen. Jane Doe"). Titles not in this map render their full word; "None"
 * contributes no prefix.                                                     */
export const TITLE_ABBREV = {
  Senator: 'Sen.',
  Representative: 'Rep.',
  Assemblymember: 'Asm.',
  Governor: 'Gov.',
};
export function abbrevTitle(title) {
  return TITLE_ABBREV[title] || title;
}

/* ── LOCATION LISTS (verbatim, static) ─────────────────────────────────── */

/* US_STATES [FIXED] — 51 entries (50 states + District of Columbia), exact
 * order.                                                                     */
export const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming',
];

/* MX_STATES [FIXED] — 32 entries (31 states + Ciudad de México), exact order. */
export const MX_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'Ciudad de México', 'Coahuila', 'Colima', 'Durango',
  'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco', 'México', 'Michoacán',
  'Morelos', 'Nayarit', 'Nuevo León', 'Oaxaca', 'Puebla', 'Querétaro',
  'Quintana Roo', 'San Luis Potosí', 'Sinaloa', 'Sonora', 'Tabasco',
  'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatán', 'Zacatecas',
];

/* CA_PROVINCES [FIXED] — 13 entries (provinces + territories), exact order.  */
export const CA_PROVINCES = [
  'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick',
  'Newfoundland and Labrador', 'Northwest Territories', 'Nova Scotia',
  'Nunavut', 'Ontario', 'Prince Edward Island', 'Quebec', 'Saskatchewan',
  'Yukon',
];

/* STATE_ABBR [FIXED] — US state name → USPS 2-letter code (51 entries; US
 * names ONLY — Canadian provinces and Mexican states are NOT in this map).   */
export const STATE_ABBR = {
  Alabama: 'AL', Alaska: 'AK', Arizona: 'AZ', Arkansas: 'AR', California: 'CA',
  Colorado: 'CO', Connecticut: 'CT', Delaware: 'DE',
  'District of Columbia': 'DC', Florida: 'FL', Georgia: 'GA', Hawaii: 'HI',
  Idaho: 'ID', Illinois: 'IL', Indiana: 'IN', Iowa: 'IA', Kansas: 'KS',
  Kentucky: 'KY', Louisiana: 'LA', Maine: 'ME', Maryland: 'MD',
  Massachusetts: 'MA', Michigan: 'MI', Minnesota: 'MN', Mississippi: 'MS',
  Missouri: 'MO', Montana: 'MT', Nebraska: 'NE', Nevada: 'NV',
  'New Hampshire': 'NH', 'New Jersey': 'NJ', 'New Mexico': 'NM',
  'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', Ohio: 'OH',
  Oklahoma: 'OK', Oregon: 'OR', Pennsylvania: 'PA', 'Rhode Island': 'RI',
  'South Carolina': 'SC', 'South Dakota': 'SD', Tennessee: 'TN', Texas: 'TX',
  Utah: 'UT', Vermont: 'VT', Virginia: 'VA', Washington: 'WA',
  'West Virginia': 'WV', Wisconsin: 'WI', Wyoming: 'WY',
};

/* REGION_COUNTRIES [FIXED] — region values on the Markets→Regions axis that
 * ARE real countries (bridges the region axis to actual countries).          */
export const REGION_COUNTRIES = ['United States', 'Canada', 'Mexico', 'Brazil', 'Japan'];

/* COUNTRIES [REPLACE at production: ISO-3166 source, do NOT hand-maintain] —
 * regenerated per the sealed PINNED FILTER RULE: SOVEREIGN STATES ONLY (the
 * UN members + observers + Taiwan set, 196 as of 2026 — includes Taiwan,
 * excludes Kosovo; NEVER the full ~249-code ISO-3166-1 list). Sorted. The
 * exact membership is regenerated, not transcribed (sealed: not load-bearing).
 * The Site "Other country" picker filters OUT United States / Canada / Mexico
 * (handled by the us/ca/mx site modes).                                      */
export const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola',
  'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus',
  'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
  'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cambodia', 'Cameroon', 'Canada', 'Central African Republic',
  'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Costa Rica',
  "Côte d'Ivoire", 'Croatia', 'Cuba', 'Cyprus', 'Czechia',
  'Democratic Republic of the Congo', 'Denmark', 'Djibouti', 'Dominica',
  'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
  'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
  'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Holy See',
  'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
  'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
  'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon',
  'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta',
  'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia',
  'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique',
  'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
  'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea',
  'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Republic of the Congo', 'Romania', 'Russia', 'Rwanda',
  'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'São Tomé and Príncipe', 'Saudi Arabia', 'Senegal',
  'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
  'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan',
  'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo',
  'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan',
  'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom',
  'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe',
];

/* SITES seed [EDITABLE: appConfig.sites; Settings → Geography] — operating
 * sites { id, city, state?, country }. VALIDITY RULE (the site editor's four
 * modes): us / ca / mx each REQUIRE a state/province (US_STATES / CA_PROVINCES
 * / MX_STATES) and DERIVE country from the mode; only "intl" sites are
 * country-only (COUNTRIES minus US/Canada/Mexico) with NO state. So state is
 * present exactly when country is United States, Canada, or Mexico — do NOT
 * encode a "state only if US" validation. Seed: 5 sites, all US.             */
export const SITE_COUNTRY_BY_MODE = { us: 'United States', mx: 'Mexico', ca: 'Canada' };
export const SITES = [
  { id: 'site-paloalto',  city: 'Palo Alto',  state: 'California',           country: 'United States' },
  { id: 'site-houston',   city: 'Houston',    state: 'Texas',                country: 'United States' },
  { id: 'site-corvallis', city: 'Corvallis',  state: 'Oregon',               country: 'United States' },
  { id: 'site-vancouver', city: 'Vancouver',  state: 'Washington',           country: 'United States' },
  { id: 'site-dc',        city: 'Washington', state: 'District of Columbia', country: 'United States' },
];

/* ── LOCATION HELPERS (sealed formulas; single-sourced here) ───────────── */

/* siteLabel(site): "" if no site. Else "City, TAIL" where TAIL = (if the site
 * has a state) STATE_ABBR[state] (falling back to the raw state name when not
 * in the map — Canadian/Mexican names render in full), else (if it has a
 * country) the country, else "". Bare "City" if neither.                     */
export function siteLabel(site) {
  if (!site) return '';
  const tail = site.state
    ? (STATE_ABBR[site.state] || site.state)
    : (site.country || '');
  return tail ? `${site.city}, ${tail}` : site.city;
}

/* resolveCountries(regions, site): the effective country set for a record —
 * union of (1) entries of regions[] that appear in REGION_COUNTRIES and
 * (2) the assigned site's country (looked up by id in SITES). If the set is
 * non-empty → return it WITH "Other Countries" removed (a concrete
 * region-country overrides the generic). Else if regions[] includes
 * "Other Countries" → ["Other Countries"]. Else [].                          */
export function resolveCountries(regions, site) {
  const rs = Array.isArray(regions) ? regions : [];
  const set = new Set(rs.filter((r) => REGION_COUNTRIES.includes(r)));
  const siteRec = site ? SITES.find((s) => s.id === site) : null;
  if (siteRec && siteRec.country) set.add(siteRec.country);
  if (set.size > 0) return [...set].filter((c) => c !== 'Other Countries');
  if (rs.includes('Other Countries')) return ['Other Countries'];
  return [];
}

/* ── EDITABILITY MAP (machine-readable form of the tags above) ─────────────
 * true  = manager-editable via Settings (persisted to appConfig; the constant
 *         here is the seeded default the live value falls back to)
 * false = FIXED enum / static constant (COUNTRIES is static but REPLACED by an
 *         ISO-3166 source at production, under the sovereign-only filter).   */
export const EDITABLE = {
  CATEGORIES: true,          // appConfig.categories (Settings → Stakeholders)
  MARKETS: true,             // Settings → Geography
  GEOGRAPHIES: false,
  SEGMENTS: true,            // appConfig.segments (Settings → Your Structure)
  ISSUES: true,              // appConfig.issues
  TAGS: true,                // appConfig tags
  FUNCTIONS: true,           // appConfig.functions (Settings → Your Structure)
  ORG_GOALS: true,           // appConfig.orgGoals (managers)
  PRIORITY: false,
  STAKEHOLDER_STATUS: false,
  COMMUNITY_KINDS: false,
  COMMUNITY_STAGES: false,
  COMMUNITY_ASK_TYPES: false,
  COMMUNITY_RECURRENCE: false,
  COMMUNITY_GIVING_MODES: false,
  PLAN_STEPS: false,
  TITLES: false,
  US_STATES: false,
  MX_STATES: false,
  CA_PROVINCES: false,
  STATE_ABBR: false,
  REGION_COUNTRIES: false,
  COUNTRIES: false,          // static snapshot; regenerated from ISO-3166 at production
  SITES: true,               // appConfig.sites (Settings → Geography)
};
