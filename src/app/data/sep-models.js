/* sep-models.js — the plan-algorithm model catalog, built VERBATIM from the
 * sealed boxes "Plan algorithm — sector/type model catalog" + "Plan algorithm
 * — FACTOR KEY" in src/guide.jsx. SINGLE SOURCE: every surface that names a
 * model, factor, weight, label, or definition reads THIS module.
 *
 * NAMING RULE (sealed): never say "SEP" in the UI. The engine is "the plan
 * algorithm"; this module keeps the historical filename for traceability but
 * exports PLAN_* names only.
 *
 * Each model = a weighted blend of 4 factors summing to 1.0, each factor
 * scored 0–1 per stakeholder. FACTOR KEYS ARE MODEL-SCOPED (sealed): the same
 * abbreviation can mean different things in different models (CE, SI, IC, CI,
 * FS all collide) — so each model carries its OWN factor labels+definitions;
 * there is deliberately NO global key→label table. Always read a factor's
 * label within its own model (this is what makes the MODEL-SCOPED TOP-FACTORS
 * RULE in plan-logic.js implementable).
 *
 * Factor entry shape: { k, w, label, desc }. desc is the sealed FACTOR KEY
 * definition — "the source-of-truth tooltip/help text for that factor in the
 * plan UI" — so the in-editor factor readout is ALWAYS complete (the sealed
 * oracle gap — 14 doc-only keys missing from its label table — is closed by
 * construction: no entry here lacks a label or definition).
 *
 * CRISIS MACHINE-KEY RULE (sealed): the crisis model's stored/scored keys are
 * plain U and EP — the doc's "U_adjusted"/"EP_adjusted" are crisis-variant
 * DEFINITIONS of the same keys, never separate key strings (keying on
 * "_adjusted" would route 50% of the model through the forbidden fallback).
 * The crisis-variant definitions live on the crisis model's own entries.
 */

/* Shared definitions reused verbatim across models (single-spelled). */
const D_I =
  "A stakeholder's capacity to affect the org's decisions, operations, or " +
  'strategic direction — mobilizing resources, swaying public opinion, ' +
  'impacting regulatory/market environments.';
const D_RC =
  'Role in shaping, enforcing, advising on, or adhering to regulatory ' +
  'frameworks.';
const D_TI = 'Impact on fostering technological innovation.';
const D_CE_COMMUNITY =
  'Effectiveness in fostering active community engagement.';
const D_IM = 'Contribution to measuring outcomes and accountability.';

/* ── PLAN-TYPE / SCENARIO MODELS — 7, catalog order (sealed) ─────────────── */
export const PLAN_GOAL_MODELS = [
  {
    id: 'general',
    name: 'General Engagement',
    factors: [
      { k: 'I', w: 0.25, label: 'Influence', desc: D_I },
      { k: 'U', w: 0.25, label: 'Urgency', desc: "The immediacy of the stakeholder's concern or the need to engage (time-sensitive)." },
      { k: 'EP', w: 0.25, label: 'Engagement Potential', desc: 'Likelihood that engaging the stakeholder yields a positive outcome.' },
      { k: 'IR', w: 0.25, label: 'Impact on Reputation', desc: "The stakeholder's potential to move the org's reputation up or down." },
    ],
  },
  {
    id: 'shared-value',
    name: 'Generating Shared Value',
    factors: [
      { k: 'MV', w: 0.4, label: 'Mutual Value', desc: 'Potential for engagement to create significant value for BOTH sides (co-creation, shared benefits, mutual growth).' },
      { k: 'TB', w: 0.3, label: 'Trust-Building', desc: 'Capacity of engagements to build and strengthen trust (foundation for long-term relationships).' },
      { k: 'CI', w: 0.2, label: 'Collaborative Innovation', desc: 'Potential for joint innovation, idea-sharing, co-development.' },
      { k: 'I', w: 0.1, label: 'Influence', desc: D_I },
    ],
  },
  {
    id: 'crisis',
    name: 'Corporate Crisis',
    // MACHINE KEYS: plain U and EP (sealed rule above); the crisis-variant
    // definitions render here, on this model's own entries.
    factors: [
      { k: 'I', w: 0.3, label: 'Influence', desc: D_I },
      { k: 'U', w: 0.35, label: 'Urgency', desc: "Need for immediate engagement with those who can impact the crisis outcome or the org's ability to manage it swiftly (incorporates Crisis Response Readiness)." },
      { k: 'EP', w: 0.15, label: 'Engagement Potential', desc: 'Likelihood that engaging during a crisis yields a positive result.' },
      { k: 'RI', w: 0.2, label: 'Reputation Impact', desc: 'Potential to significantly influence public/company perception during a crisis.' },
    ],
  },
  {
    id: 'activist',
    name: 'Activist Shareholders',
    factors: [
      { k: 'EC', w: 0.35, label: 'Effective Communication', desc: 'Ability to communicate clearly, transparently, and on time with shareholders/stakeholders.' },
      { k: 'SE', w: 0.3, label: 'Shareholder Engagement', desc: 'Strength/impact of proactive, constructive investor relationships.' },
      { k: 'SA', w: 0.2, label: 'Strategic Alignment', desc: 'Alignment of strategy with stakeholder/shareholder interests.' },
      { k: 'RM', w: 0.15, label: 'Reputation Management', desc: 'Impact of engagements/communications on managing public and media narratives.' },
    ],
  },
  {
    id: 'dei',
    name: 'Diversity, Equity & Inclusion',
    factors: [
      { k: 'DI', w: 0.35, label: 'Diversity Initiatives', desc: 'Influence over or contribution to diversity initiatives.' },
      { k: 'IC', w: 0.3, label: 'Inclusive Communication', desc: 'Effectiveness of engagements in fostering inclusive communication.' },
      { k: 'EO', w: 0.2, label: 'Equity in Opportunity', desc: 'Role in ensuring equitable access and advancement (employment, opportunity).' },
      { k: 'CI', w: 0.15, label: 'Community Involvement', desc: 'Effectiveness of engaging the broader community in DEI efforts (partnerships, outreach, public DEI initiatives).' },
    ],
  },
  {
    id: 'community',
    name: 'Community Investment',
    factors: [
      { k: 'CNA', w: 0.35, label: 'Community Needs Assessment', desc: 'Ability to identify and articulate community needs.' },
      { k: 'PD', w: 0.3, label: 'Partnership Development', desc: 'Role in forming partnerships that extend reach.' },
      { k: 'IM', w: 0.2, label: 'Impact Measurement', desc: D_IM },
      { k: 'CTS', w: 0.15, label: 'Community Trust & Support', desc: 'Effectiveness of engagements in building/maintaining community trust.' },
    ],
  },
  {
    id: 'union',
    name: 'Union Negotiations',
    factors: [
      { k: 'NP', w: 0.35, label: 'Negotiation Preparedness', desc: 'Readiness for productive negotiation.' },
      { k: 'ER', w: 0.3, label: 'Employee Relations', desc: 'Strength of relationships with workers.' },
      { k: 'FS', w: 0.2, label: 'Financial Sustainability', desc: 'Influence on/contribution to financial stability and efficiency.' },
      { k: 'OR', w: 0.15, label: 'Organizational Reputation', desc: "Effect of negotiations and their outcomes on the org's standing." },
    ],
  },
];

/* ── INDUSTRY-SECTOR MODELS — 11, catalog order (sealed AUTHORITATIVE doc
 * formulas; these supersede the oracle's placeholder Utilities/Government/
 * Healthcare/Nonprofit/Agriculture/Auto formulas — sealed CORRECTION). ────── */
export const PLAN_SECTOR_MODELS = [
  {
    id: 'energy',
    name: 'Energy',
    factors: [
      { k: 'I', w: 0.25, label: 'Influence', desc: D_I },
      { k: 'LTSA', w: 0.3, label: 'Long-Term Strategic Alignment', desc: "Alignment with the org's long-term (sustainability) strategy." },
      { k: 'ES', w: 0.25, label: 'Environmental Stewardship', desc: 'Expectations/contributions toward environmental protection.' },
      { k: 'IC', w: 0.2, label: 'Innovation Collaboration', desc: 'Potential for collaborative innovation with stakeholders.' },
    ],
  },
  {
    id: 'technology',
    name: 'Technology',
    factors: [
      { k: 'I', w: 0.2, label: 'Influence', desc: D_I },
      { k: 'IS', w: 0.3, label: 'Innovation Support', desc: "Role in supporting/advancing the company's innovation." },
      { k: 'MR', w: 0.25, label: 'Market Readiness', desc: 'Ability to influence market readiness/acceptance of new offerings.' },
      { k: 'RC', w: 0.25, label: 'Regulatory Compliance', desc: D_RC },
    ],
  },
  {
    id: 'retail',
    name: 'Retail',
    factors: [
      { k: 'CE', w: 0.35, label: 'Consumer Expectations', desc: 'Influence over shaping consumer expectations.' },
      { k: 'SI', w: 0.3, label: 'Sustainability Initiatives', desc: 'Impact on advancing sustainability.' },
      { k: 'DC', w: 0.25, label: 'Digital Commerce Adaptation', desc: 'Role supporting/driving adoption of digital commerce platforms.' },
      { k: 'I', w: 0.1, label: 'Influence', desc: D_I },
    ],
  },
  {
    id: 'financial',
    name: 'Financial',
    factors: [
      { k: 'RC', w: 0.35, label: 'Regulatory Compliance', desc: D_RC },
      { k: 'CT', w: 0.3, label: 'Customer Trust', desc: 'Impact on building/restoring customer trust.' },
      { k: 'TI', w: 0.25, label: 'Technological Innovation', desc: D_TI },
      { k: 'I', w: 0.1, label: 'Influence', desc: D_I },
    ],
  },
  {
    id: 'education',
    name: 'Education',
    factors: [
      { k: 'DT', w: 0.3, label: 'Digital Transformation', desc: 'Influence/role in supporting digital transformation (digital learning tools).' },
      { k: 'CE', w: 0.3, label: 'Community Engagement', desc: D_CE_COMMUNITY },
      { k: 'IE', w: 0.2, label: 'Inclusive Environment', desc: 'Impact on promoting diversity, equity, inclusion within the institution.' },
      { k: 'I', w: 0.2, label: 'Influence', desc: D_I },
    ],
  },
  {
    id: 'utilities',
    name: 'Utilities',
    factors: [
      { k: 'RC', w: 0.35, label: 'Regulatory Compliance', desc: D_RC },
      { k: 'PS', w: 0.3, label: 'Price Sensitivity', desc: 'Impact of engagements on addressing/mitigating pricing concerns.' },
      { k: 'TO', w: 0.2, label: 'Transparency in Operations', desc: 'Effectiveness in promoting operational transparency.' },
      { k: 'ST', w: 0.15, label: 'Stakeholder Trust', desc: 'Influence on building or restoring trust.' },
    ],
  },
  {
    id: 'government',
    name: 'Government & Public Sector',
    factors: [
      { k: 'SI', w: 0.3, label: 'Service Improvement', desc: 'Influence/contribution toward improving public services.' },
      { k: 'CE', w: 0.3, label: 'Community Engagement', desc: D_CE_COMMUNITY },
      { k: 'RA', w: 0.25, label: 'Regulatory Alignment', desc: 'Role ensuring public services/initiatives align with regulation.' },
      { k: 'SDI', w: 0.15, label: 'Service Delivery Innovation', desc: 'Potential for innovative approaches/technologies to enhance service delivery.' },
    ],
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Pharma',
    factors: [
      { k: 'MI', w: 0.3, label: 'Medical Innovation', desc: 'Influence/contribution toward medical innovation.' },
      { k: 'RC', w: 0.25, label: 'Regulatory Compliance', desc: D_RC },
      { k: 'PE', w: 0.25, label: 'Patient Engagement', desc: 'Effectiveness in enhancing patient engagement and satisfaction.' },
      { k: 'HPR', w: 0.2, label: 'Healthcare Provider Relationships', desc: 'Quality/strength of relationships with healthcare providers.' },
    ],
  },
  {
    id: 'nonprofit',
    name: 'Nonprofit & Social Impact',
    factors: [
      { k: 'CE', w: 0.3, label: 'Community Engagement', desc: D_CE_COMMUNITY },
      { k: 'IM', w: 0.3, label: 'Impact Measurement', desc: D_IM },
      { k: 'FS', w: 0.25, label: 'Funding Sustainability', desc: "Role in ensuring the org's funding/financial sustainability." },
      { k: 'AE', w: 0.15, label: 'Advocacy Effectiveness', desc: 'Ability to support or lead effective advocacy efforts.' },
    ],
  },
  {
    id: 'agriculture',
    name: 'Big Agriculture',
    factors: [
      { k: 'SAP', w: 0.3, label: 'Sustainable Agricultural Practices', desc: 'Influence/contribution toward sustainable farming.' },
      { k: 'TA', w: 0.25, label: 'Technological Adoption', desc: 'Impact on fostering adoption of advanced agricultural technologies.' },
      { k: 'MA', w: 0.25, label: 'Market Access', desc: 'Role enabling/facilitating access to markets.' },
      { k: 'RC', w: 0.2, label: 'Regulatory Compliance', desc: D_RC },
    ],
  },
  {
    id: 'auto',
    name: 'Auto Manufacturing',
    factors: [
      { k: 'EA', w: 0.35, label: 'Electrification Acceleration', desc: 'Role in promoting/facilitating EV adoption and electrification.' },
      { k: 'TI', w: 0.25, label: 'Technological Innovation', desc: D_TI },
      { k: 'SCS', w: 0.2, label: 'Supply Chain Sustainability', desc: 'Influence on making the supply chain sustainable.' },
      { k: 'CE', w: 0.2, label: 'Customer Engagement', desc: 'Maintaining customer loyalty/engagement.' },
    ],
  },
];

/* ── RESOLUTION (sealed robustness rule, KEEP IT): an unknown/missing stored
 * model id resolves to the FIRST model in its list — a plan never renders
 * with no algorithm. ─────────────────────────────────────────────────────── */
export function resolveSectorModel(id) {
  return PLAN_SECTOR_MODELS.find((m) => m.id === id) || PLAN_SECTOR_MODELS[0];
}
export function resolveGoalModel(id) {
  return PLAN_GOAL_MODELS.find((m) => m.id === id) || PLAN_GOAL_MODELS[0];
}

/* goalName(id) — the landing's "Type of plan" display (sealed filterDef). */
export function goalName(id) {
  return resolveGoalModel(id).name;
}

/* modelFormula(m) — the review header's formula readout (sealed fmt(m):
 * factors mapped to "k×w", " + "-joined; the visible "SEP model" tag is
 * RENAMED per the naming rule, the readout itself is KEPT). */
export function modelFormula(m) {
  return (m.factors || []).map((f) => `${f.k}×${f.w}`).join(' + ');
}
