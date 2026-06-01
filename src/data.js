// Stakeholder Spreadsheet - data layer
// Categories, audience types, relationship-status zones, color tokens, sample stakeholders, team

export const STAKEHOLDER_DATA = (() => {
  // ─── HP, Inc. org structure ───────────────────────────────────────────
  // Segments → Business Units. Workspaces pick a (segment, BU) pair.
  const SEGMENTS = {
    "Personal Systems":     ["Commercial PCs & Laptops", "Consumer PCs", "Other Products", "Services"],
    "Printing":             ["Hardware", "Supplies", "Graphics & 3D Printing"],
    "Corporate Investments":["Poly", "HyperX"],
    "Corporate Functions":  ["Marketing", "Communications", "Legal / GA&PP", "HP Foundation", "Supply Chain", "SLED"]
  };

  // Markets → Regions. Geography level applies within any region.
  const MARKETS = {
    "Americas": ["United States", "Canada", "Mexico"],
    "LATAM":    ["Brazil", "Other Countries"],
    "EMEA":     ["Europe", "Middle East", "Africa"],
    "APJ":      ["Emerging APAC", "Japan"]
  };

  // Operating sites (offices / operations). Managers edit via Settings →
  // Geography (persisted in appConfig.sites). US sites carry a state; non-US
  // carry a country.
  const SITES = [
    { id: "site-paloalto",  city: "Palo Alto",     state: "California", country: "United States" },
    { id: "site-houston",   city: "Houston",       state: "Texas",      country: "United States" },
    { id: "site-corvallis", city: "Corvallis",     state: "Oregon",     country: "United States" },
    { id: "site-vancouver", city: "Vancouver",     state: "Washington", country: "United States" },
    { id: "site-dc",        city: "Washington",    state: "District of Columbia", country: "United States" }
  ];

  // State name → USPS 2-letter abbreviation.
  const STATE_ABBR = {
    "Alabama":"AL","Alaska":"AK","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO",
    "Connecticut":"CT","Delaware":"DE","District of Columbia":"DC","Florida":"FL","Georgia":"GA",
    "Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY",
    "Louisiana":"LA","Maine":"ME","Maryland":"MD","Massachusetts":"MA","Michigan":"MI","Minnesota":"MN",
    "Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH",
    "New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND","Ohio":"OH",
    "Oklahoma":"OK","Oregon":"OR","Pennsylvania":"PA","Rhode Island":"RI","South Carolina":"SC",
    "South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virginia":"VA",
    "Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY"
  };
  // "City, AA" for US sites; "City, Country" otherwise.
  function siteLabel(site) {
    if (!site) return "";
    const tail = site.state ? (STATE_ABBR[site.state] || site.state) : (site.country || "");
    return site.city + (tail ? ", " + tail : "");
  }

  // Region values that ARE countries (the org's market→region axis overlaps
  // with real countries). Used to resolve the effective country set.
  const REGION_COUNTRIES = ["United States", "Canada", "Mexico", "Brazil", "Japan"];

  // Effective countries for a record, unioning the two Venn circles:
  //   1) regions[] that name a country, and 2) the assigned site's country.
  // "Other Countries" is dropped when any concrete region-country is present.
  function resolveCountries(regions, site) {
    const set = new Set();
    (regions || []).forEach(r => { if (REGION_COUNTRIES.includes(r)) set.add(r); });
    const sites = SITES;
    const s = (site && sites) ? sites.find(x => x.id === site) : null;
    if (s && s.country) set.add(s.country);
    if (set.size > 0) {
      // a stated region-country overrides the generic "Other Countries"
      return [...set].filter(c => c !== "Other Countries");
    }
    if ((regions || []).includes("Other Countries")) return ["Other Countries"];
    return [];
  }

  const US_STATES = [
    "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware",
    "District of Columbia","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
    "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota",
    "Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico",
    "New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
    "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington",
    "West Virginia","Wisconsin","Wyoming"
  ];

  // Mexican states (31 + CDMX).
  const MX_STATES = [
    "Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua",
    "Ciudad de México","Coahuila","Colima","Durango","Guanajuato","Guerrero","Hidalgo","Jalisco",
    "México","Michoacán","Morelos","Nayarit","Nuevo León","Oaxaca","Puebla","Querétaro","Quintana Roo",
    "San Luis Potosí","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"
  ];

  // Canadian provinces & territories.
  const CA_PROVINCES = [
    "Alberta","British Columbia","Manitoba","New Brunswick","Newfoundland and Labrador",
    "Northwest Territories","Nova Scotia","Nunavut","Ontario","Prince Edward Island","Quebec",
    "Saskatchewan","Yukon"
  ];

  // Sovereign states recognized as of 2026 (UN members + observers), sorted.
  const COUNTRIES = [
    "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia",
    "Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium",
    "Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria",
    "Burkina Faso","Burundi","Cabo Verde","Cambodia","Cameroon","Canada","Central African Republic","Chad",
    "Chile","China","Colombia","Comoros","Congo (Brazzaville)","Congo (Kinshasa)","Costa Rica","Croatia",
    "Cuba","Cyprus","Czechia","Côte d'Ivoire","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador",
    "Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland",
    "France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea",
    "Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq",
    "Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait",
    "Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania",
    "Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania",
    "Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique",
    "Myanmar","Namibia","Nauru","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria",
    "North Korea","North Macedonia","Norway","Oman","Pakistan","Palau","Palestine","Panama","Papua New Guinea",
    "Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda",
    "Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino",
    "Sao Tome and Principe","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore",
    "Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea","South Sudan","Spain",
    "Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
    "Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda",
    "Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu",
    "Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
  ];
  const GEOGRAPHIES = ["National (all)", "Federal", "State", "Local"];

  // Default issue set the company maps stakeholders against. Managers
  // can edit/add via Settings (persisted in appConfig.issues).
    const ISSUES = [
    "Procurement Reform",
    "Sustainability",
    "AI",
    "Education",
    "Taxation",
    "Site Operations",
    "Supply Chain"
  ];

  // Default free-form tag vocabulary. Tags appear across lists; managers can
  // add more via Settings (persisted in appConfig.tags). Stakeholders may
  // also still type custom tags inline.
  const TAGS = [
    "public-official", "key-influencer", "coalition", "ally", "press",
    "skeptical", "workforce", "federal", "activist", "environmental",
    "regulator", "education", "partner", "faith", "veterans", "board",
    "health", "investor", "internal", "exec", "sovereign", "cultural",
    "local-gov", "eu", "ngo", "industry", "recycling", "supplies"
  ];

  // Default organizational functions a user can belong to. Managers edit/add
  // via Settings (persisted in appConfig.functions). Drives the profile's
  // Function dropdown.
  const FUNCTIONS = [
    "Operations",
    "Human Resources",
    "Strategy",
    "Research",
    "Site Management",
    "Sales",
    "Marketing",
    "Communications",
    "Legal",
    "Government Affairs",
    "Community Relations",
    "Intern"
  ];

  // Organizational goals set by managers (Settings). Inherited by every plan.
  const ORG_GOALS = [
    "Defend the company's license to operate across key US markets",
    "Build trust capital with regulators and community leaders",
    "Position for upcoming permitting and modernization approvals"
  ];


  // ─── SEP (Stakeholder Engagement Priority) models ────────────────────
  // Factor catalog: key → { label, desc }. Used by Plan SEP ranking (phase B).
  const SEP_FACTORS = {
    I:   { label: "Influence", desc: "Capacity to affect the organization's decisions, operations, or strategic direction." },
    U:   { label: "Urgency", desc: "Immediacy of the stakeholder's concern or the need to engage." },
    EP:  { label: "Engagement Potential", desc: "Likelihood that engaging produces a positive outcome." },
    IR:  { label: "Impact on Reputation", desc: "Potential to move the organization's reputation up or down." },
    MV:  { label: "Mutual Value", desc: "Potential to co-create significant value for both sides." },
    TB:  { label: "Trust-Building", desc: "Capacity of the relationship to build and strengthen trust." },
    CI:  { label: "Collaborative Innovation", desc: "Potential for joint innovation and co-development." },
    RI:  { label: "Reputation Impact", desc: "Ability to shape public perception during a crisis." },
    EC:  { label: "Effective Communication", desc: "Ability to communicate clearly, transparently, and on time." },
    SE:  { label: "Shareholder Engagement", desc: "Strength of proactive, constructive investor relationships." },
    SA:  { label: "Strategic Alignment", desc: "Alignment of strategy with stakeholder/shareholder interests." },
    RM:  { label: "Reputation Management", desc: "Managing public and media narratives." },
    DI:  { label: "Diversity Initiatives", desc: "Influence over or contribution to diversity initiatives." },
    IC:  { label: "Inclusive Communication", desc: "Communication that reflects and respects diverse voices." },
    EO:  { label: "Equity in Opportunity", desc: "Role in ensuring equitable access and advancement." },
    CNA: { label: "Community Needs Assessment", desc: "Ability to identify and articulate community needs." },
    PD:  { label: "Partnership Development", desc: "Role in forming partnerships that extend reach." },
    IM:  { label: "Impact Measurement", desc: "Contribution to measuring outcomes and accountability." },
    CTS: { label: "Community Trust & Support", desc: "Building and maintaining community trust." },
    NP:  { label: "Negotiation Preparedness", desc: "Readiness for productive negotiation." },
    ER:  { label: "Employee Relations", desc: "Strength of relationships with workers." },
    FS:  { label: "Financial Sustainability", desc: "Impact on financial stability and efficiency." },
    OR:  { label: "Organizational Reputation", desc: "Effect on the organization's standing." },
    CE:  { label: "Consumer/Community Expectations", desc: "Influence over evolving consumer or community expectations." },
    SI:  { label: "Sustainability Initiatives", desc: "Advancing sustainability efforts." },
    DC:  { label: "Digital Commerce Adaptation", desc: "Driving adoption of digital platforms." },
    RC:  { label: "Regulatory Compliance", desc: "Influence over regulatory frameworks and compliance." },
    CT:  { label: "Customer Trust", desc: "Building or restoring customer trust." },
    TI:  { label: "Technological Innovation", desc: "Driving secure, customer-friendly innovation." },
    DT:  { label: "Digital Transformation", desc: "Supporting digital transformation efforts." },
    IE:  { label: "Inclusive Environment", desc: "Promoting diversity, equity, inclusion." },
    IS:  { label: "Innovation Support", desc: "Supporting or advancing innovation efforts." },
    MR:  { label: "Market Readiness", desc: "Influence over market acceptance of new offerings." },
    LTSA:{ label: "Long-Term Strategic Alignment", desc: "Alignment with long-term (sustainability) strategy." },
    ES:  { label: "Environmental Stewardship", desc: "Commitment to environmental protection." }
  };

  // Goal-based models (scenarios). type: "goal".
  const SEP_GOAL_MODELS = [
    { id: "general",      name: "General Engagement",        factors: [["I",.25],["U",.25],["EP",.25],["IR",.25]] },
    { id: "shared-value", name: "Generating Shared Value",   factors: [["MV",.4],["TB",.3],["CI",.2],["I",.1]] },
    { id: "crisis",       name: "Corporate Crisis",          factors: [["I",.3],["U",.35],["EP",.15],["RI",.2]] },
    { id: "activist",     name: "Activist Shareholders",     factors: [["EC",.35],["SE",.3],["SA",.2],["RM",.15]] },
    { id: "dei",          name: "Diversity, Equity & Inclusion", factors: [["DI",.35],["IC",.3],["EO",.2],["CI",.15]] },
    { id: "community",    name: "Community Investment",      factors: [["CNA",.35],["PD",.3],["IM",.2],["CTS",.15]] },
    { id: "union",        name: "Union Negotiations",        factors: [["NP",.35],["ER",.3],["FS",.2],["OR",.15]] }
  ];

  // Sector models. type: "sector". Sectors without a detailed formula in the
  // source use the general 4-factor balance.
  const SEP_SECTOR_MODELS = [
    { id: "energy",     name: "Energy",                      factors: [["I",.25],["LTSA",.3],["ES",.25],["IC",.2]] },
    { id: "technology", name: "Technology",                  factors: [["I",.2],["IS",.3],["MR",.25],["RC",.25]] },
    { id: "retail",     name: "Retail",                      factors: [["CE",.35],["SI",.3],["DC",.25],["I",.1]] },
    { id: "financial",  name: "Financial",                   factors: [["RC",.35],["CT",.3],["TI",.25],["I",.1]] },
    { id: "education",  name: "Education",                   factors: [["DT",.3],["CE",.3],["IE",.2],["I",.2]] },
    { id: "utilities",  name: "Utilities",                   factors: [["RC",.3],["I",.25],["ES",.25],["CTS",.2]] },
    { id: "government", name: "Government & Public Sector",  factors: [["I",.3],["RC",.25],["CTS",.25],["EC",.2]] },
    { id: "healthcare", name: "Healthcare & Pharma",         factors: [["RC",.3],["CT",.3],["TI",.2],["IR",.2]] },
    { id: "nonprofit",  name: "Nonprofit & Social Impact",   factors: [["CNA",.3],["PD",.3],["CTS",.2],["IM",.2]] },
    { id: "agriculture",name: "Big Agriculture",             factors: [["RC",.3],["SI",.25],["CE",.25],["I",.2]] },
    { id: "auto",       name: "Auto Manufacturing",          factors: [["I",.25],["RC",.25],["SI",.25],["MR",.25]] }
  ];

  // The 12-step engagement framework (Purpose / Plan / Execute), shared with Help.
  const PLAN_STEPS = [
    { phase: "Purpose", items: ["Set goals for your organization", "Issue identification", "Stakeholder identification", "Stakeholder prioritization"] },
    { phase: "Plan",    items: ["Landscape analysis", "Cross-functional alignment", "Research & listening sessions", "Early stakeholder analysis & modeling"] },
    { phase: "Execute", items: ["Launch campaign", "Ongoing stakeholder analysis", "Collaborate with stakeholders", "Realize shared value where possible"] }
  ];

  // ─── Plans (per workspace) ────────────────────────────────────────────
  // A plan is a structured engagement document scoped to a workspace.
  const PLANS = [
    {
      id: "plan-gapp-na",
      workspaceId: "ws-gapp-na",
      title: "FY26 Hawk Engagement Plan",
      sectorModel: "energy",
      goalModel: "shared-value",
      updatedAt: "2026-05-20",
      market: "", region: "", owners: ["u-jordan", "u-alex"], status: "Active", summary: "Defend our license to operate in North America by deepening trust with regulators and community leaders ahead of permitting decisions.",
      scenarioSolves: "", scenarioApproach: "", scenarioOutcome: "",
      goals: [
        "Defend the company's license to operate across key US markets",
        "Build trust capital with regulators and community leaders",
        "Position for upcoming permitting and modernization approvals"
      ],
      issues: ["Site Operations", "Sustainability"],
      team: [
        { userId: "u-jordan", role: "Lead - Government & Public Affairs" },
        { userId: "u-alex",   role: "Executive sponsor" },
        { userId: "u-devon",  role: "Legal & compliance" }
      ],
      strategies: [
        { id: "st-1", title: "Local stakeholder outreach", how: "Engage municipal decision-makers and community panels; recruit surrogates for permit hearings.", timing: "Ongoing, ahead of permit windows", ownerId: "u-jordan" },
        { id: "st-2", title: "Coalition building", how: "Work with trade associations and labor to align on regulatory transition rulemaking.", timing: "Q1–Q2", ownerId: "u-alex" }
      ],
      communityIds: [],
      priorityOverrides: {},
      measurement: "Quarterly review of tactics, audience feedback, community events, and coalition activity tied to the fiscal calendar. Report sentiment shifts and stakeholder map movement each quarter."
    }
  ];

  // ─── Categories & audience types ──────────────────────────────────────
  const CATEGORIES = {
    "Communities": [
      "Charity Organization", "Church", "Community Alliance", "Higher Education",
      "K-12 Educator", "Local Business", "Media", "Military Branch", "Neighbor",
      "NGO", "Tribes", "Veterans", "Youth Program", "Activist Organization",
      "Activist Member", "General Public"
    ],
    "Government": [
      "Agency (Inspector)", "Agency (Permit Writer)", "City Council Member",
      "City Government", "County Government", "County Supervisor",
      "Governor's Office", "Judicial", "Mayor", "Regulator (Federal)",
      "Regulator (State)", "Regulator (Local)", "State Representative",
      "State Senate", "US Congress", "US Senate"
    ],
    "Our People": [
      "Community Outreach Lead", "Diversity & Inclusion Lead", "Executive",
      "General Employee", "Former Employee", "Contractor", "Operations Manager",
      "Marketing Manager", "Sales Manager", "Retiree"
    ],
    "Industry": [
      "Competition", "Supply Chain", "Trade Association", "Channel Partners",
      "Industry Analysts", "Business Coalition", "Economic Development",
      "Labor Union"
    ],
    "Consumers": [
      "Industry Consumers", "Current Customers", "Future Customers", "Lost Customers"
    ],
    "Investors": [
      "Board Member", "Shareholder", "Activist Shareholder", "General Public Investor"
    ]
  };

  // ─── Relationship-status zone grid (4 cols × 6 rows) ─────────────────
  // Columns: x splits at -5, 0, 5
  // Rows:    y splits at 5, 2.5, 0, -2.5, -5
  // Names taken from the scoring scheme table; spatial positions taken
  // from the labeled map image (which the user confirmed is correct).
  const GRID = [
    // Row 0  (y >  5)         Col0 x<-5             Col1 -5..0       Col2 0..5                Col3 x>5
    ["Proactively Defend", "Defend",          "Valuable Relationship", "Strategic Partner"],
    // Row 1  (2.5 < y ≤ 5)
    ["Defend",             "Protect",         "Collaborate",           "High Value Relationship"],
    // Row 2  (0 < y ≤ 2.5)
    ["Protect",            "Respond",         "Cooperate",             "Collaborate"],
    // Row 3  (-2.5 < y ≤ 0)
    ["Protect",            "Respond",         "Cooperate",             "Collaborate"],
    // Row 4  (-5 < y ≤ -2.5)
    ["Identify",           "Identify",        "Commit",                "Commit"],
    // Row 5  (y ≤ -5)
    ["Monitor",            "Monitor",         "Maintain",              "Connect"]
  ];

  // Status metadata: color, tone, strategy, action summary.
  // Color stops chosen by hand to read on the warm-cream background.
  const STATUSES = {
    "Proactively Defend":     { tone: "negative", color: "#D26A6A", text: "#FFFFFF", border: "#7a2424",
      strategy: "Address Key Influencer",
      action: "Launch plan to neutralize a major threat to the industry or company's license to operate; leverage reputation, resources, subject-matter experts, and other allied stakeholders to win. Measure and report on activity often." },
    "Defend":                 { tone: "negative", color: "#E29A9A", text: "#7a2424",
      strategy: "Neutralize Threat",
      action: "Defend license to operate. Defend reputation against regular attacks from stakeholders with high influence who are unlikely to move toward positive support; discredit message or position. Measure and report on activity often." },
    "Protect":                { tone: "negative", color: "#EFBEBE", text: "#7a2424",
      strategy: "Mobilize Defense",
      action: "Take action with internal resources and strategy. Defend reputation against regular attacks; manage expectations for changing stakeholder dynamic or group's influence in the community. Measure and report on activity regularly." },
    "Respond":                { tone: "negative", color: "#F4D6D6", text: "#7a2424",
      strategy: "Challenge Stakeholder",
      action: "Implement plan to challenge misinformation; reduce stakeholder's ability to destabilize the business or challenge brand identity and reputation." },
    "Identify":               { tone: "negative", color: "#F8E4E4", text: "#7a2424",
      strategy: "React To Issues Or Conflict",
      action: "Work to neutralize threat; educate stakeholder; resolve or minimize the stakeholder's ability or willingness to maintain conflict. Assign internal staff, team, or working group to execute response." },
    "Monitor":                { tone: "neutral-low", color: "#F4DBB0", text: "#7a4a14",
      strategy: "Plan Ahead, Listen",
      action: "Map stakeholder and plan to respond in the event of change; assign internal staff, team, or working group to execute plan if necessary." },
    "Maintain":               { tone: "neutral-low", color: "#F9E4BD", text: "#7a4a14",
      strategy: "Take Steps To Introduce Our Vision And Values",
      action: "Take simple steps to engage; educate and create awareness about the business; look for ways to increase alignment and the stakeholder's influence over time." },
    "Connect":                { tone: "neutral-low", color: "#FCEFD1", text: "#7a4a14",
      strategy: "Prioritize Resources Elsewhere",
      action: "Take no action. Prioritize time and resources elsewhere but monitor for any negative changes in alignment or improved influence in the community over time." },
    "Commit":                 { tone: "neutral-low", color: "#FAEACA", text: "#7a4a14",
      strategy: "Understand Needs, Work Towards Common Purpose",
      action: "Build greater understanding between our company and stakeholder groups; look for opportunities to continue education and alignment that could lead to improved collaboration or affinity toward the business." },
    "Cooperate":              { tone: "positive", color: "#DDE7C2", text: "#2f5a26",
      strategy: "Existing Alignment Produces Some Favorable Outcomes",
      action: "Some value already exists and should continue with moderate level of commitment; maintain existing level of relationship." },
    "Collaborate":            { tone: "positive", color: "#C2D9A4", text: "#2f5a26",
      strategy: "Investing In Relationship Will Improve Our Business Or Reputation",
      action: "Commitment important to our business; establish opportunities to work together and reap mutual benefits; leverage stakeholder's influence to increase our reputation." },
    "Valuable Relationship":  { tone: "positive", color: "#B1CF92", text: "#2f5a26",
      strategy: "Stakeholder Important To Our Business Success",
      action: "Stakeholder is an important surrogate, ally, or business partner. Investing in and growing this relationship proactively supports and defends the business and increases our reputation. Prioritize collaboration and deploying engagement strategies." },
    "High Value Relationship":{ tone: "positive", color: "#97C57A", text: "#2f5a26",
      strategy: "Shared Value Introduced",
      action: "Moderate shared value introduced; investing and growing this relationship produces value for our business and increases our reputation. Prioritize collaboration and engaging the stakeholder often to meet business and advocacy goals." },
    "Strategic Partner":      { tone: "positive", color: "#74B556", text: "#FFFFFF", border: "#1f3f17",
      strategy: "Shared Value Created",
      action: "Shared value created. Formalize a working relationship or partnership with the stakeholder to produce and measure shared value; relationship grows the business, increases our reputation, and produces solutions." }
  };

  // Ordered for the linear "spectrum" strip (most-negative → most-positive)
  const STATUS_ORDER = [
    "Proactively Defend", "Defend", "Protect", "Respond", "Identify",
    "Monitor", "Maintain", "Connect", "Commit",
    "Cooperate", "Collaborate", "Valuable Relationship",
    "High Value Relationship", "Strategic Partner"
  ];

  // ─── Zone lookup ──────────────────────────────────────────────────────
  function statusFor(x, y) {
    // clamp
    x = Math.max(-10, Math.min(10, x));
    y = Math.max(-10, Math.min(10, y));
    let row, col;
    if (y > 5) row = 0;
    else if (y > 2.5) row = 1;
    else if (y > 0) row = 2;
    else if (y > -2.5) row = 3;
    else if (y > -5) row = 4;
    else row = 5;
    if (x < -5) col = 0;
    else if (x < 0) col = 1;
    else if (x < 5) col = 2;
    else col = 3;
    return GRID[row][col];
  }

  // Cell rectangles for drawing - in user coords (x: -10..10, y: -10..10)
  // y axis is mathematical (up = positive)
  const CELL_RECTS = [];
  const X_BOUNDS = [-10, -5, 0, 5, 10];
  const Y_BOUNDS = [10, 5, 2.5, 0, -2.5, -5, -10]; // top → bottom
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 4; c++) {
      CELL_RECTS.push({
        row: r, col: c,
        x0: X_BOUNDS[c], x1: X_BOUNDS[c + 1],
        y0: Y_BOUNDS[r + 1], y1: Y_BOUNDS[r], // y0 < y1
        status: GRID[r][c]
      });
    }
  }

  // ─── Workspaces ──────────────────────────────────────────────────────
  // Each workspace is scoped to a (segment, business-unit) within HP, Inc.
  // owners is an array of user ids; createdBy records who made it.
  // Delete is restricted: only createdBy OR a manager-role user can remove.
  const WORKSPACES = [
    { id: "ws-gapp-na",    name: "Hawk",        segment: "Corporate Functions",  businessUnit: "Legal / GA&PP",            owners: ["u-jordan","u-alex"],   createdBy: "u-jordan", createdAt: "2025-09-12" },
    { id: "ws-gapp-emea",  name: "Climate Change in Europe",                  segment: "Corporate Functions",  businessUnit: "Legal / GA&PP",            owners: ["u-priya"],             createdBy: "u-priya",  createdAt: "2025-11-04" },
    { id: "ws-ps-comm",    name: "Imagine Event", segment: "Personal Systems",     businessUnit: "Commercial PCs & Laptops", owners: ["u-alex"],              createdBy: "u-alex",   createdAt: "2025-08-21" },
    { id: "ws-print-supp", name: "Clone Cartridges",           segment: "Printing",             businessUnit: "Supplies",                 owners: ["u-sam","u-marisol"],   createdBy: "u-sam",    createdAt: "2026-01-08" },
    { id: "ws-foundation", name: "Future of Work at HP Foundation",                 segment: "Corporate Functions",  businessUnit: "HP Foundation",            owners: ["u-sam"],               createdBy: "u-sam",    createdAt: "2026-02-15" },
    { id: "ws-sled",       name: "Google Beam Tour",                          segment: "Corporate Functions",  businessUnit: "SLED",                     owners: ["u-jordan","u-devon"],  createdBy: "u-jordan", createdAt: "2026-03-22" }
  ];

  // Which workspaces each stakeholder appears in. (Many-to-many.)
  const STAKEHOLDER_WORKSPACES = {
    "sh-01": ["ws-gapp-na", "ws-sled"],
    "sh-02": ["ws-gapp-na"],
    "sh-03": ["ws-gapp-na", "ws-foundation"],
    "sh-04": ["ws-gapp-na", "ws-ps-comm"],
    "sh-05": ["ws-gapp-na", "ws-sled"],
    "sh-06": ["ws-gapp-na"],
    "sh-07": ["ws-gapp-na", "ws-print-supp"],
    "sh-08": ["ws-foundation"],
    "sh-09": ["ws-foundation"],
    "sh-10": ["ws-gapp-na", "ws-foundation"],
    "sh-11": ["ws-foundation"],
    "sh-12": ["ws-gapp-na"],
    "sh-13": ["ws-ps-comm", "ws-print-supp"],
    "sh-14": ["ws-gapp-na", "ws-ps-comm"],
    "sh-15": ["ws-gapp-na", "ws-sled", "ws-foundation"],
    "sh-16": ["ws-gapp-na", "ws-sled"],
    "sh-17": ["ws-gapp-emea"],
    "sh-18": ["ws-gapp-emea"],
    "sh-19": ["ws-gapp-emea", "ws-ps-comm"],
    "sh-20": ["ws-print-supp"]
  };

  // ─── Team members (default seed) ──────────────────────────────────────
  // Each teammate is now linked to a user account (id). When a user logs in
  // they become eligible to be added as a teammate.
  const TEAM = [
    { id: "tm-alex",   userId: "u-alex",   weight: 1.5 },
    { id: "tm-jordan", userId: "u-jordan", weight: 1.2 },
    { id: "tm-sam",    userId: "u-sam",    weight: 1.0 },
    { id: "tm-priya",  userId: "u-priya",  weight: 0.8 },
    { id: "tm-devon",  userId: "u-devon",  weight: 0.7 }
  ];

  // ─── Users ────────────────────────────────────────────────────────────
  // Pool of HP users. The currently-logged-in user is selected from here
  // (or registered on first login). Avatar colors are stable per user.
  // role: "manager" can delete any workspace; "member" can only delete ones
  // they created.
  const USERS = [
    { id: "u-alex",   name: "Alex Rivera",    title: "VP, Government Affairs",        email: "alex.rivera@hp.com",   avatarColor: "#AD1457", presence: "online",  role: "manager" },
    { id: "u-jordan", name: "Jordan Kim",     title: "Director, GA&PP North America", email: "jordan.kim@hp.com",    avatarColor: "#E64A19", presence: "online",  role: "manager" },
    { id: "u-sam",    name: "Sam Okafor",     title: "Community Engagement Lead",     email: "sam.okafor@hp.com",    avatarColor: "#388E3C", presence: "online",  role: "member"  },
    { id: "u-priya",  name: "Priya Patel",    title: "Communications Manager, EMEA",  email: "priya.patel@hp.com",   avatarColor: "#6A1B9A", presence: "away",    role: "manager" },
    { id: "u-devon",  name: "Devon Wright",   title: "Senior Counsel",                email: "devon.wright@hp.com",  avatarColor: "#1976D2", presence: "online",  role: "member"  },
    { id: "u-marisol",name: "Marisol Aguilar",title: "LATAM Public Policy Lead",      email: "marisol.aguilar@hp.com",avatarColor: "#F9A825", presence: "offline", role: "member"  },
    { id: "u-system",  name: "Reminders",  title: "Automated reminders", email: "noreply@hp.com",  avatarColor: "#1F1A14", presence: "online", role: "system" },
    { id: "u-kenji",  name: "Kenji Tanaka",   title: "APJ Regulatory Affairs",        email: "kenji.tanaka@hp.com",  avatarColor: "#00897B", presence: "online",  role: "member"  }
  ];

  // ─── Conversations & messages (seed) ──────────────────────────────────
  // direct conversations are keyed by sorted userId pair; groups by their id.
  const CONVERSATIONS = [
    { id: "c-001", kind: "direct", participants: ["u-jordan","u-sam"],   title: null },
    { id: "c-002", kind: "direct", participants: ["u-jordan","u-alex"],  title: null },
    { id: "c-003", kind: "group",  participants: ["u-jordan","u-priya","u-alex"], title: "EMEA pre-meeting" },
    { id: "c-004", kind: "group",  participants: ["u-jordan","u-sam","u-devon"],  title: "Cedar Valley Tribes consultation" },
    { id: "c-system", kind: "system", participants: ["u-system","u-jordan","u-alex","u-sam","u-priya","u-devon","u-marisol","u-kenji"], title: "Reminders" }
  ];

  const MESSAGES = {
    "c-001": [
      { id: "m1", from: "u-sam",    body: "Did you see Save Our River's FOIA?",         at: "2026-05-26T14:21:00" },
      { id: "m2", from: "u-jordan", body: "Yeah, Devon's drafting the response now.",   at: "2026-05-26T14:23:00" },
      { id: "m3", from: "u-sam",    body: "Cool. I'm meeting Pastor Lee tomorrow.",     at: "2026-05-26T14:25:00" }
    ],
    "c-002": [
      { id: "m1", from: "u-alex",   body: "Can you push the Park briefing to next week?", at: "2026-05-26T09:10:00" },
      { id: "m2", from: "u-jordan", body: "Done - confirmed for Thursday at 10.",         at: "2026-05-26T09:14:00" }
    ],
    "c-003": [
      { id: "m1", from: "u-priya", body: "AI Act compliance memo is in the shared drive.", at: "2026-05-25T16:02:00" },
      { id: "m2", from: "u-alex",  body: "Thanks. We'll preview with DigitalEurope first.", at: "2026-05-25T16:30:00" }
    ],
    "c-004": [
      { id: "m1", from: "u-devon", body: "Council elder confirmed for next consultation.", at: "2026-05-26T11:00:00" }
    ]
  };

  // ─── Sample stakeholders ──────────────────────────────────────────────
  // Each holds an identity block. (x, y) is computed live from scores.
  // market / region / geography replace the old single "region" field.
  const STAKEHOLDERS = [
    { id: "sh-01", state: "California", site: "site-paloalto", email: "mchen@cedarville.gov", phone: "(503) 555-0142", xAccount: "@MayorMariaChen", isPerson: true, firstName: "Maria", lastName: "Chen", title: "Mayor", issues: ["Site Operations", "Sustainability"], name: "Mayor Maria Chen",            org: "City of Cedarville",          category: "Government",   type: "Mayor",                  market: "Americas", region: "United States", geography: "Local",            priority: "High",   tags: ["public-official","key-influencer"], owners: ["u-jordan","u-sam"], lastContact: "2026-05-12", status: "Active",   notes: "Generally supportive; cares about local jobs and waterfront access.", history: [{"quarter":"FY26 Q1","x":1,"y":6,"recordedAt":"2026-01-31"},{"quarter":"FY26 Q2","x":2,"y":7,"recordedAt":"2026-04-30"},{"quarter":"FY26 Q3","x":3,"y":8,"recordedAt":"2026-07-31"}] },
    { id: "sh-02", email: "info@cedarvillechamber.org", phone: "(503) 555-0198", xAccount: "@CedarvilleCham", issues: ["Taxation", "Procurement Reform"], name: "Cedarville Chamber",          org: "Cedarville Chamber",         category: "Communities",  type: "Local Business",         market: "Americas", region: "United States", geography: "Local",            priority: "Medium", tags: ["coalition","ally"],                 owners: ["u-sam"],  lastContact: "2026-05-20", status: "Active",   notes: "Strong partner on workforce initiatives." },
    { id: "sh-03", email: "newsroom@riversidetrib.com", phone: "(503) 555-0173", xAccount: "@RiversideTrib", name: "Riverside Tribune",           org: "Riverside Tribune",           category: "Communities",  type: "Media",                  market: "Americas", region: "United States", geography: "Local",            priority: "High",   tags: ["press","skeptical"],                owners: ["u-priya"], lastContact: "2026-05-19", status: "Active",   notes: "Beat reporter looking for new angles on emissions story." },
    { id: "sh-04", state: "Oregon", site: "site-corvallis", email: "hall@usw412.org", phone: "(503) 555-0120", xAccount: "@USWLocal412", issues: ["Site Operations", "Education"], name: "Local 412 Steelworkers",      org: "Local 412 Steelworkers",               category: "Industry",     type: "Labor Union",            market: "Americas", region: "United States", geography: "Local",            priority: "High",   tags: ["workforce"],                        owners: ["u-alex"], lastContact: "2026-04-30", status: "Active",   notes: "Contract negotiations open in Q3." },
    { id: "sh-05", email: "james.park@mail.house.gov", phone: "(202) 555-0111", xAccount: "@RepJamesPark", isPerson: true, firstName: "James", lastName: "Park", title: "Representative", issues: ["AI", "Procurement Reform"], name: "Rep. James Park",             org: "US House of Representatives", category: "Government",   type: "US Congress",            market: "Americas", region: "United States", geography: "Federal",          priority: "High",   tags: ["federal","ally"],                   owners: ["u-alex"], lastContact: "2026-05-08", status: "Active",   notes: "Supportive on permitting reform." },
    { id: "sh-06", email: "contact@saveourriver.org", phone: "(503) 555-0166", xAccount: "@SaveOurRiver", issues: ["Sustainability", "Site Operations"], name: "Save Our River Coalition",    org: "Save Our River Coalition",              category: "Communities",  type: "Activist Organization",  market: "Americas", region: "United States", geography: "Local",            priority: "High",   tags: ["activist","environmental"],         owners: ["u-devon"],lastContact: "2026-05-15", status: "Watch",    notes: "Filed FOIA on discharge permits in March.", history: [{"quarter":"FY26 Q1","x":-5,"y":3,"recordedAt":"2026-01-31"},{"quarter":"FY26 Q2","x":-6,"y":5,"recordedAt":"2026-04-30"},{"quarter":"FY26 Q3","x":-8,"y":7,"recordedAt":"2026-07-31"}] },
    { id: "sh-07", email: "permits@state-epa.gov", phone: "(503) 555-0188", xAccount: "@StateEPA", name: "State EPA",                   org: "State EPA",  category: "Government",   type: "Regulator (State)",      market: "Americas", region: "United States", geography: "State",            priority: "High",   tags: ["regulator"],                        owners: ["u-devon"],lastContact: "2026-05-22", status: "Active",   notes: "Air-permit renewal in review." },
    { id: "sh-08", state: "Washington", site: "site-vancouver", email: "admin@pinewoodschools.edu", phone: "(503) 555-0155", xAccount: "@PinewoodSchools", name: "Pinewood Schools",            org: "Pinewood Schools",     category: "Communities",  type: "K-12 Educator",          market: "Americas", region: "United States", geography: "Local",            priority: "Medium", tags: ["education","partner"],              owners: ["u-sam"],  lastContact: "2026-05-02", status: "Active",   notes: "STEM partnership renewing this fall." },
    { id: "sh-09", email: "office@firstmethodist.org", phone: "(503) 555-0109", xAccount: "@FirstMethodistCV", name: "First Methodist",             org: "First Methodist",      category: "Communities",  type: "Church",                 market: "Americas", region: "United States", geography: "Local",            priority: "Low",    tags: ["faith"],                            owners: ["u-sam"],  lastContact: "2026-03-11", status: "Dormant",  notes: "Pastor open to facility tours." },
    { id: "sh-10", state: "Oregon", email: "post117@vfw.org", phone: "(503) 555-0131", xAccount: "@VFWPost117", name: "VFW Post 117",                org: "VFW Post 117",    category: "Communities",  type: "Veterans",               market: "Americas", region: "United States", geography: "Local",            priority: "Medium", tags: ["veterans"],                         owners: ["u-sam"],  lastContact: "2026-04-22", status: "Active",   notes: "Hosted community day in April." },
    { id: "sh-11", email: "board@riverbendhospital.org", phone: "(503) 555-0144", xAccount: "@RiverbendHosp", name: "Riverbend Hospital Board",    org: "Riverbend Hospital Board",          category: "Investors",    type: "Board Member",           market: "Americas", region: "United States", geography: "Local",            priority: "High",   tags: ["board","health"],                   owners: ["u-alex"], lastContact: "2026-05-18", status: "Active",   notes: "Quarterly briefing scheduled." },
    { id: "sh-12", email: "ir@helioscapital.com", phone: "(212) 555-0177", xAccount: "@HeliosCapital", name: "Helios Capital",              org: "Helios Capital",        category: "Investors",    type: "Activist Shareholder",   market: "Americas", region: "United States", geography: "National (all)",   priority: "High",   tags: ["activist","investor"],              owners: ["u-alex"], lastContact: "2026-05-05", status: "Watch",    notes: "Submitted proxy proposal on board composition.", history: [{"quarter":"FY26 Q1","x":-3,"y":4,"recordedAt":"2026-01-31"},{"quarter":"FY26 Q2","x":-5,"y":5,"recordedAt":"2026-04-30"},{"quarter":"FY26 Q3","x":-7,"y":5,"recordedAt":"2026-07-31"}] },
    { id: "sh-13", email: "sales@baysidedist.com", phone: "(503) 555-0150", xAccount: "@BaysideDist", name: "Bayside Distribution",        org: "Bayside Distribution",          category: "Industry",     type: "Channel Partners",       market: "Americas", region: "United States", geography: "National (all)",   priority: "Medium", tags: ["partner"],                          owners: ["u-priya"], lastContact: "2026-05-10", status: "Active",   notes: "Renewing distribution contract." },
    { id: "sh-14", email: "sarah.voss@hp.com", phone: "(650) 555-0102", xAccount: "@SarahVossHP", isPerson: true, firstName: "Sarah", lastName: "Voss", title: "Director", name: "Sarah Voss",                  org: "Internal Operations",       category: "Our People",   type: "Executive",              market: "Americas", region: "United States", geography: "National (all)",   priority: "High",   tags: ["internal","exec"],                  owners: ["u-alex"], lastContact: "2026-05-25", status: "Active",   notes: "VP Ops; champion for plant modernization." },
    { id: "sh-15", email: "council@cedarvalleytribes.org", phone: "(503) 555-0190", xAccount: "@CedarValleyTribes", name: "Cedar Valley Tribes Council", org: "Cedar Valley Tribes Council",         category: "Communities",  type: "Tribes",                 market: "Americas", region: "United States", geography: "Federal",          priority: "High",   tags: ["sovereign","cultural"],             owners: ["u-sam"],  lastContact: "2026-04-15", status: "Active",   notes: "Consultation on watershed plan ongoing." },
    { id: "sh-16", state: "Texas", site: "site-houston", email: "ereyes@cedarvillecounty.gov", phone: "(503) 555-0125", xAccount: "@SupervisorReyes", isPerson: true, firstName: "Elena", lastName: "Reyes", title: "County Supervisor", issues: ["Education", "Site Operations"], name: "County Supervisor Elena Reyes",     org: "Cedarville County",           category: "Government",   type: "County Supervisor",      market: "Americas", region: "United States", geography: "Local",            priority: "Medium", tags: ["local-gov"],                        owners: ["u-jordan"],  lastContact: "2026-05-16", status: "Active",   notes: "Up for re-election in November." },
    { id: "sh-17", email: "env-contact@ec.europa.eu", phone: "+32 2 555 0143", xAccount: "@EU_ENV", issues: ["Sustainability", "AI"], name: "European Commission DG ENV",  org: "European Commission DG ENV",         category: "Government",   type: "Regulator (Federal)",    market: "EMEA",     region: "Europe",        geography: "National (all)",   priority: "High",   tags: ["regulator","eu"],                   owners: ["u-priya"], lastContact: "2026-05-21", status: "Active",   notes: "Sustainability disclosure rules in consultation." },
    { id: "sh-18", email: "kontakt@bund.net", phone: "+49 30 555 0178", xAccount: "@BUNDde", name: "BUND Germany",                org: "BUND Germany",                        category: "Communities",  type: "NGO",                    market: "EMEA",     region: "Europe",        geography: "National (all)",   priority: "Medium", tags: ["ngo","environmental"],              owners: ["u-priya"], lastContact: "2026-04-28", status: "Active",   notes: "Coalition partner on packaging directive." },
    { id: "sh-19", email: "policy@digitaleurope.org", phone: "+32 2 555 0166", xAccount: "@DigitalEuropeEU", issues: ["AI", "Supply Chain"], name: "DigitalEurope",               org: "DigitalEurope",               category: "Industry",     type: "Trade Association",      market: "EMEA",     region: "Europe",        geography: "National (all)",   priority: "High",   tags: ["coalition","industry"],             owners: ["u-alex"], lastContact: "2026-05-14", status: "Active",   notes: "Working group lead on AI Act compliance." },
    { id: "sh-20", email: "contato@reciclabrasil.org", phone: "+55 11 5555 0188", xAccount: "@ReciclaBrasil", name: "Brazilian E-Waste Coalition", org: "Brazilian E-Waste Coalition",              category: "Communities",  type: "NGO",                    market: "LATAM",    region: "Brazil",        geography: "National (all)",   priority: "Medium", tags: ["recycling","supplies"],             owners: ["u-sam"],  lastContact: "2026-05-06", status: "Active",   notes: "Supplies take-back program partner." }
  ];

  // ─── Seed scores ──────────────────────────────────────────────────────
  // scores[stakeholderId][teamMemberId] = { x, y }   (each -10..10)
  // Hand-picked so the dots distribute across all interesting zones.
  const SEED_SCORES = {
    "sh-01": { "tm-alex":{x:3,y:8},  "tm-jordan":{x:4,y:9}, "tm-sam":{x:2,y:8}, "tm-priya":{x:3,y:8}, "tm-devon":{x:2,y:7} },
    "sh-02": { "tm-alex":{x:7,y:4},  "tm-jordan":{x:8,y:5}, "tm-sam":{x:7,y:4}, "tm-priya":{x:6,y:4}, "tm-devon":{x:6,y:3} },
    "sh-03": { "tm-alex":{x:-2,y:7}, "tm-jordan":{x:-1,y:8},"tm-sam":{x:-3,y:7},"tm-priya":{x:-2,y:8},"tm-devon":{x:-2,y:7} },
    "sh-04": { "tm-alex":{x:1,y:6},  "tm-jordan":{x:2,y:7}, "tm-sam":{x:1,y:6}, "tm-priya":{x:0,y:6}, "tm-devon":{x:-1,y:6} },
    "sh-05": { "tm-alex":{x:7,y:9},  "tm-jordan":{x:8,y:9}, "tm-sam":{x:6,y:8}, "tm-priya":{x:7,y:9}, "tm-devon":{x:7,y:9} },
    "sh-06": { "tm-alex":{x:-8,y:6}, "tm-jordan":{x:-9,y:7},"tm-sam":{x:-7,y:6},"tm-priya":{x:-8,y:7},"tm-devon":{x:-9,y:8} },
    "sh-07": { "tm-alex":{x:-1,y:9}, "tm-jordan":{x:1,y:9}, "tm-sam":{x:0,y:9}, "tm-priya":{x:-1,y:9},"tm-devon":{x:0,y:10}},
    "sh-08": { "tm-alex":{x:6,y:2},  "tm-jordan":{x:7,y:3}, "tm-sam":{x:8,y:2}, "tm-priya":{x:6,y:2}, "tm-devon":{x:6,y:1} },
    "sh-09": { "tm-alex":{x:3,y:-3}, "tm-jordan":{x:4,y:-2},"tm-sam":{x:5,y:-3},"tm-priya":{x:3,y:-3},"tm-devon":{x:3,y:-4}},
    "sh-10": { "tm-alex":{x:6,y:1},  "tm-jordan":{x:7,y:2}, "tm-sam":{x:8,y:1}, "tm-priya":{x:6,y:1}, "tm-devon":{x:6,y:0} },
    "sh-11": { "tm-alex":{x:9,y:7},  "tm-jordan":{x:8,y:6}, "tm-sam":{x:7,y:5}, "tm-priya":{x:8,y:6}, "tm-devon":{x:9,y:7} },
    "sh-12": { "tm-alex":{x:-7,y:5}, "tm-jordan":{x:-6,y:6},"tm-sam":{x:-5,y:4},"tm-priya":{x:-7,y:5},"tm-devon":{x:-8,y:6}},
    "sh-13": { "tm-alex":{x:8,y:0},  "tm-jordan":{x:7,y:1}, "tm-sam":{x:8,y:-1},"tm-priya":{x:8,y:0}, "tm-devon":{x:7,y:0} },
    "sh-14": { "tm-alex":{x:10,y:8}, "tm-jordan":{x:9,y:7}, "tm-sam":{x:9,y:7}, "tm-priya":{x:10,y:8},"tm-devon":{x:10,y:9}},
    "sh-15": { "tm-alex":{x:2,y:9},  "tm-jordan":{x:3,y:10},"tm-sam":{x:4,y:9}, "tm-priya":{x:2,y:9}, "tm-devon":{x:1,y:9} },
    "sh-16": { "tm-alex":{x:4,y:5},  "tm-jordan":{x:5,y:6}, "tm-sam":{x:3,y:5}, "tm-priya":{x:4,y:5}, "tm-devon":{x:4,y:4} },
    "sh-17": { "tm-alex":{x:-2,y:9}, "tm-jordan":{x:-1,y:10},"tm-sam":{x:-3,y:9},"tm-priya":{x:-2,y:10},"tm-devon":{x:-3,y:9}},
    "sh-18": { "tm-alex":{x:-5,y:4}, "tm-jordan":{x:-4,y:5}, "tm-sam":{x:-4,y:4},"tm-priya":{x:-5,y:5}, "tm-devon":{x:-6,y:4}},
    "sh-19": { "tm-alex":{x:7,y:6},  "tm-jordan":{x:8,y:7},  "tm-sam":{x:6,y:6}, "tm-priya":{x:8,y:7},  "tm-devon":{x:7,y:6} },
    "sh-20": { "tm-alex":{x:3,y:3},  "tm-jordan":{x:4,y:4},  "tm-sam":{x:5,y:3}, "tm-priya":{x:3,y:3},  "tm-devon":{x:3,y:2} }
  };

  // ─── Community / Foundation applications ──────────────────────────────
  // Value-driven engagement applications: philanthropy, volunteerism,
  // corporate giving (monetary + in-kind), political action, sustainability.
  const COMMUNITY_KINDS = [
    "Philanthropy",
    "Volunteering",
    "Corporate Giving",
    "Political Action (PAC)",
    "Sustainability",
    "Social Impact"
  ];
  // Corporate Giving sub-form: how the contribution is delivered.
  const GIVING_MODES = ["Monetary", "In-Kind", "Mix"];
  const COMMUNITY_STAGES = ["Idea", "Proposed", "Under Review", "Approved", "Active", "Complete", "Declined"];
  const ASK_TYPES = ["Funding", "Volunteer hours", "Endorsement", "In-kind", "Political contribution"];
  const RECURRENCE = ["One-time", "Annual", "Multi-year"];


  // Seed community / foundation applications (value-driven engagements).
  const COMMUNITY = [
    {
      id: "ca-01",
      name: "Cedarville Workforce STEM Grant",
      kind: "Philanthropy",
      stage: "Active",
      summary: "Fund a 3-year STEM pipeline with Pinewood Schools to build local talent.",
      description: "Multi-year grant to expand STEM labs, teacher training, and paid internships feeding the Cedarville plant's hiring pipeline.",
      rationale: "Directly strengthens local hiring, deepens our most supportive education partner, and answers community concern about local jobs.",
      submitter: "u-sam", submitterRole: "Community Engagement Lead", dateSubmitted: "2026-02-04",
      representedStakeholderId: "sh-08",
      recipient: "Pinewood Public Schools Foundation",
      linkedStakeholders: ["sh-08","sh-01","sh-04"],
      markets: ["Americas"], regions: ["United States"], issues: ["Education","Site Operations"],
      askType: "Funding", amount: 250000, unit: "USD", recurrence: "Multi-year", years: 3,
      timeline: "FY26–FY28", decisionDeadline: "2026-03-15",
      budget: { total: 320000, requested: 250000, otherFunding: 70000, inKind: "Employee mentor hours" },
      approvedAmount: 250000, dateApproved: "2026-02-20",
      licenseToOperate: 8, relationshipImpact: 9,
      risk: { reputational: "Low", legal: "Standard grant agreement", conflictOfInterest: false, attestation: true },
      attachments: [{ label: "Proposal deck", url: "https://example.org/stem-proposal" }],
      votes: { "u-jordan": "for", "u-sam": "for", "u-alex": "for", "u-priya": "abstain" },
      owners: ["u-sam"], createdBy: "u-sam", createdAt: "2026-02-04"
    },
    {
      id: "ca-02",
      name: "River Cleanup Volunteer Day",
      kind: "Volunteering",
      stage: "Proposed",
      summary: "Company-wide volunteer day with Save Our River to rebuild trust.",
      description: "Sponsor and staff a watershed cleanup, framed as good-faith engagement with an activist stakeholder currently in the negative band.",
      rationale: "Lowers temperature with Save Our River, demonstrates environmental commitment, supports license to operate.",
      submitter: "u-devon", submitterRole: "Senior Counsel", dateSubmitted: "2026-04-18",
      representedStakeholderId: "sh-06",
      recipient: "Save Our River Coalition",
      linkedStakeholders: ["sh-06","sh-07","sh-03"],
      markets: ["Americas"], regions: ["United States"], issues: ["Sustainability","Site Operations"],
      askType: "Volunteer hours", amount: 400, unit: "hours", recurrence: "Annual", years: 1,
      timeline: "Q3 FY26", decisionDeadline: "2026-06-01",
      budget: { total: 25000, requested: 25000, otherFunding: 0, inKind: "400 employee hours" },
      approvedAmount: 0,
      licenseToOperate: 7, relationshipImpact: 6,
      risk: { reputational: "Medium - could be seen as greenwashing", legal: "None", conflictOfInterest: false, attestation: false },
      attachments: [],
      votes: { "u-devon": "for", "u-sam": "for", "u-jordan": "abstain" },
      owners: ["u-devon","u-sam"], createdBy: "u-devon", createdAt: "2026-04-18"
    },
    {
      id: "ca-03",
      name: "State Manufacturing PAC Contribution",
      kind: "Political Action (PAC)",
      stage: "Under Review",
      summary: "Contribute to the state manufacturing coalition PAC ahead of permitting reform.",
      description: "Support the industry PAC aligned with permitting-reform priorities championed by Rep. Park.",
      rationale: "Advances permitting-reform agenda; aligns with a key federal ally; standard industry participation.",
      submitter: "u-alex", submitterRole: "VP, Government Affairs", dateSubmitted: "2026-05-02",
      representedStakeholderId: "sh-05",
      recipient: "State Manufacturing Coalition PAC",
      linkedStakeholders: ["sh-05","sh-04"],
      markets: ["Americas"], regions: ["United States"], issues: ["Procurement Reform","Taxation"],
      askType: "Political contribution", amount: 50000, unit: "USD", recurrence: "Annual", years: 1,
      timeline: "FY26", decisionDeadline: "2026-05-20",
      budget: { total: 50000, requested: 50000, otherFunding: 0, inKind: "" },
      approvedAmount: 0,
      licenseToOperate: 6, relationshipImpact: 7,
      risk: { reputational: "High - political disclosure", legal: "FEC / state disclosure required", conflictOfInterest: true, attestation: true },
      attachments: [{ label: "Compliance memo", url: "https://example.org/pac-memo" }],
      votes: { "u-alex": "for", "u-devon": "against", "u-jordan": "for" },
      owners: ["u-alex"], createdBy: "u-alex", createdAt: "2026-05-02"
    },
    {
      id: "ca-04",
      name: "Printer Recycling In-Kind Donation (LATAM)",
      kind: "Corporate Giving", givingMode: "In-Kind",
      stage: "Approved",
      summary: "Donate refurbished equipment and supplies to the Brazilian e-waste coalition.",
      description: "In-kind donation of refurbished printers plus take-back logistics support to a LATAM recycling NGO.",
      rationale: "Supports supplies take-back program, builds LATAM goodwill, advances sustainability narrative.",
      submitter: "u-marisol", submitterRole: "LATAM Public Policy Lead", dateSubmitted: "2026-03-22",
      representedStakeholderId: "sh-20",
      recipient: "Recicla Brasil",
      linkedStakeholders: ["sh-20"],
      markets: ["LATAM"], regions: ["Brazil"], issues: ["Sustainability","Supply Chain"],
      askType: "In-kind", amount: 90000, unit: "USD", recurrence: "One-time", years: 1,
      timeline: "Q2 FY26", decisionDeadline: "2026-04-10",
      budget: { total: 90000, requested: 90000, otherFunding: 0, inKind: "Refurbished hardware + logistics" },
      approvedAmount: 90000, dateApproved: "2026-04-10",
      licenseToOperate: 7, relationshipImpact: 8,
      risk: { reputational: "Low", legal: "Export/customs review", conflictOfInterest: false, attestation: true },
      attachments: [],
      votes: { "u-marisol": "for", "u-sam": "for" },
      owners: ["u-marisol"], createdBy: "u-marisol", createdAt: "2026-03-22"
    }
  ];

  function weightedCoord(stakeholderId, scores, team) {
    const s = scores[stakeholderId] || {};
    let totalW = 0, sx = 0, sy = 0;
    for (const m of team) {
      const sc = s[m.id];
      if (!sc) continue;
      const w = Number(m.weight) || 0;
      if (w <= 0) continue;
      sx += sc.x * w;
      sy += sc.y * w;
      totalW += w;
    }
    if (totalW === 0) return { x: 0, y: 0 };
    return { x: sx / totalW, y: sy / totalW };
  }

  return {
    CATEGORIES, GRID, STATUSES, STATUS_ORDER, CELL_RECTS, X_BOUNDS, Y_BOUNDS,
    statusFor, weightedCoord,
    TEAM, STAKEHOLDERS, SEED_SCORES,
    WORKSPACES, STAKEHOLDER_WORKSPACES,
    SEGMENTS, MARKETS, SITES, US_STATES, MX_STATES, CA_PROVINCES, STATE_ABBR, siteLabel, REGION_COUNTRIES, resolveCountries, COUNTRIES, GEOGRAPHIES, ISSUES, TAGS, FUNCTIONS, ORG_GOALS,
    USERS, CONVERSATIONS, MESSAGES,
    COMMUNITY_KINDS, COMMUNITY_STAGES, ASK_TYPES, RECURRENCE, GIVING_MODES, COMMUNITY,
    SEP_FACTORS, SEP_GOAL_MODELS, SEP_SECTOR_MODELS, PLAN_STEPS, PLANS
  };
})();
