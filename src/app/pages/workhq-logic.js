/* workhq-logic.js — the workHQ band's PURE signal math, built from the sealed
 * box "workHQ (IntelPanel) — the workspace intelligence band" (src/guide.jsx
 * ~2176–2230) PLUS the USER RULINGS of 2026-07-05 (the ruled scope of the
 * "define scope with user" phase item — they bind like sealed text):
 *   A. FOUR CARDS ONLY (Alerts · Need your score · Awaiting your vote · Cold);
 *      relationship-mix + active-plans live ONLY in the one-line summary.
 *   B. COLD IS PRIORITY-GATED: priority === "High" AND stale >= COLD_DAYS(90),
 *      stalest first (the sealed cold signal already carries both).
 *   C. IGNORE/SNOOZE IS FIRST-CLASS: per-user 'intelIgnores' store table
 *      { userId -> { cardKey -> [entryKey] } }; ignores apply BEFORE counting.
 *   D. Sealed slice caps hold (12/5 wide · 8/4 narrow).
 *   E. SCALE: callers pass the ACTIVE workspace's visible set only.
 * SEALED DO-NOT-REPLICATE honored here: the oracle's NEEDS-YOUR-SCORE bug
 * (scores indexed by USER id u-* instead of TEAM-MEMBER id tm-*) is NOT
 * rebuilt — needsScoreList resolves currentUser -> team member and reuses the
 * ONE canonical isUnscoredBy (scoring-logic.js), the same single source that
 * drives the Scoring nav badge and the Reminders cadence.
 * No DOM, no store — node-tested by scripts/workhq-test.mjs.
 */
import { weightedCoord, statusFor } from '../data/engine.js';
import { isUnscoredBy } from './scoring-logic.js';
import { displayName } from '../../../design-system/components/stakeholder-table.js';

/* Sealed constant. */
export const COLD_DAYS = 90;

/* Ruled card keys (stable — they key the persisted per-user ignores). */
export const CARD_KEYS = ['alerts', 'needs-score', 'votes', 'cold'];

/* nameOf (sealed): displayName(s) || s.name. */
export function nameOf(s) {
  return displayName(s) || s?.name || '';
}

/* daysSince (sealed formula, verbatim): falsy -> Infinity; an ISO date-ONLY
 * string (/^\d{4}-\d{2}-\d{2}$/ — ONE backslash per d) gets "T00:00:00"
 * appended so it parses as LOCAL midnight (a bare ISO date parses as UTC and
 * staleness reads a day off in western timezones); unparseable -> Infinity;
 * else Math.floor((now - t) / 86400000) whole days. `now` is parameterized
 * for tests; callers default to the real clock.                             */
export function daysSince(d, now = new Date()) {
  if (!d) return Infinity;
  const t = new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? d + 'T00:00:00' : d);
  if (isNaN(t)) return Infinity;
  return Math.floor((now - t) / 86400000);
}

/* COLD ENGAGEMENT (sealed signal + ruling B): priority === "High" AND
 * daysSince(lastContact) >= COLD_DAYS, sorted by daysSince DESCENDING
 * (stalest first; a missing lastContact is Infinity-stale and leads).
 * NO footnote, NO folded count for anything below High (ruling B).          */
export function coldStakeholders(stakeholders, now = new Date()) {
  return (stakeholders || [])
    .filter((s) => s.priority === 'High' && daysSince(s.lastContact, now) >= COLD_DAYS)
    .sort((a, b) => daysSince(b.lastContact, now) - daysSince(a.lastContact, now));
}

/* NEED YOUR SCORE — the CANONICAL predicate (sealed DO-NOT-REPLICATE
 * correction): resolve currentUser -> their TEAM-MEMBER record, then filter
 * by the one isUnscoredBy(scores, s.id, tm.id). No currentUser or no
 * team-member row -> [] (the sealed guard: never mark anything unscored).   */
export function needsScoreList(stakeholders, scores, team, currentUserId) {
  const member = (team || []).find((m) => m.userId === currentUserId);
  if (!member) return [];
  return (stakeholders || []).filter((s) => isUnscoredBy(scores, s.id, member.id));
}

/* AWAITING YOUR VOTE (sealed): stage in [Proposed, Under Review] AND
 * currentUser AND NOT votes[currentUser.id]. (Community votes ARE keyed by
 * user id — only the scores map is team-member-keyed.)                      */
export const VOTE_STAGES = ['Proposed', 'Under Review'];
export function awaitingVotes(community, currentUserId) {
  if (!currentUserId) return [];
  return (community || []).filter((a) =>
    VOTE_STAGES.includes(a.stage) && !((a.votes || {})[currentUserId]));
}

/* RELATIONSHIP MIX (sealed, the 5+5 zone arrays verbatim — load-bearing):
 * POS -> positive · NEG -> negative · everything else (Monitor, Maintain,
 * Connect, Commit) -> winnable. Position = the ONE engine weightedCoord /
 * statusFor pair.                                                           */
export const MIX_POSITIVE_ZONES = [
  'Cooperate', 'Collaborate', 'Valuable Relationship',
  'High Value Relationship', 'Strategic Partner',
];
export const MIX_NEGATIVE_ZONES = [
  'Proactively Defend', 'Defend', 'Protect', 'Respond', 'Identify',
];
export function relationshipMix(stakeholders, scores, team) {
  const mix = { positive: 0, winnable: 0, negative: 0 };
  for (const s of stakeholders || []) {
    const wc = weightedCoord(s.id, scores || {}, team || []);
    const st = statusFor(wc.x, wc.y);
    if (MIX_POSITIVE_ZONES.includes(st)) mix.positive++;
    else if (MIX_NEGATIVE_ZONES.includes(st)) mix.negative++;
    else mix.winnable++;
  }
  return mix;
}

/* ACTIVE PLANS IN THIS WORKSPACE (sealed): master -> all plans; else the
 * plans scoped to the workspace. (The sealed formula does NOT filter on the
 * plan status field — preserved.)                                           */
export function activePlansFor(plans, isMaster, workspaceId) {
  return isMaster
    ? (plans || [])
    : (plans || []).filter((p) => p.workspaceId === workspaceId);
}

/* DEVELOPMENTS (sealed): flatten every stakeholder's notesHistory into
 * { at, body, who: n.by, note: n, stakeholder: s }; newest first by
 * new Date(at || 0) descending.                                             */
export function developments(stakeholders) {
  const out = [];
  for (const s of stakeholders || []) {
    for (const n of s.notesHistory || []) {
      out.push({ at: n.at, body: n.body, who: n.by, note: n, stakeholder: s });
    }
  }
  out.sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0));
  return out;
}

/* devLabel (sealed): "{name}: {body.slice(0,40)}" + "…" only when the body
 * exceeds 40 characters.                                                    */
export function devLabel(d) {
  const body = d.body || '';
  return nameOf(d.stakeholder) + ': ' + body.slice(0, 40) + (body.length > 40 ? '…' : '');
}

/* Ruled entry keys (ruling C — stable per underlying item):
 * cold/needs-score -> the stakeholder id; alerts -> "{stakeholderId}|{note
 * id, falling back to the at stamp}"; votes -> the application id.          */
export function devKey(d) {
  return d.stakeholder.id + '|' + (d.note && d.note.id ? d.note.id : (d.at || ''));
}

/* THE SUMMARY LINE (sealed join, ruled to read the canonical counts AFTER
 * ignores): cold -> "{n} high-priority going cold" · needs -> "{n} need your
 * score" · votes -> "{n} awaiting your vote", joined " · "; no bits ->
 * "All clear — nothing needs attention."                                    */
export function summaryBits(coldCount, needsCount, votesCount) {
  const bits = [];
  if (coldCount) bits.push(`${coldCount} high-priority going cold`);
  if (needsCount) bits.push(`${needsCount} need your score`);
  if (votesCount) bits.push(`${votesCount} awaiting your vote`);
  return bits;
}
export const ALL_CLEAR = 'All clear — nothing needs attention.';
export function summaryLine(coldCount, needsCount, votesCount) {
  const bits = summaryBits(coldCount, needsCount, votesCount);
  return bits.length ? bits.join(' · ') : ALL_CLEAR;
}

/* Sealed slice caps: wide cards (Alerts, Need-your-score) 12 in intel mode /
 * 5 otherwise; narrow cards (votes; the ruled cold card DECLARED onto the
 * sealed narrow pair) 8 / 4.                                                */
export const CARD_CAPS = {
  alerts: { intel: 12, other: 5 },
  'needs-score': { intel: 12, other: 5 },
  votes: { intel: 8, other: 4 },
  cold: { intel: 8, other: 4 },
};
export function capFor(cardKey, mode) {
  const c = CARD_CAPS[cardKey] || CARD_CAPS.votes;
  return mode === 'intel' ? c.intel : c.other;
}

/* ── IGNORES (ruling C — per-user, per-card, per-entry) ─────────────────────
 * Persisted shape (the 'intelIgnores' store table):
 *   { [userId]: { [cardKey]: [entryKey, …] } }
 * Pure updaters return NEW maps (usePersistentState functional updates).    */
export function userIgnores(all, userId) {
  return (all || {})[userId] || {};
}
export function withIgnores(all, userId, cardKey, entryKeys) {
  if (!userId) return all || {};
  const mine = { ...((all || {})[userId] || {}) };
  const set = new Set(mine[cardKey] || []);
  for (const k of entryKeys || []) set.add(k);
  mine[cardKey] = [...set];
  return { ...(all || {}), [userId]: mine };
}
export function withoutIgnore(all, userId, cardKey, entryKey) {
  if (!userId) return all || {};
  const mine = { ...((all || {})[userId] || {}) };
  mine[cardKey] = (mine[cardKey] || []).filter((k) => k !== entryKey);
  return { ...(all || {}), [userId]: mine };
}

/* splitIgnored — applied BEFORE counting (ruling C: headline counts reflect
 * un-ignored items only). Stale ignore keys (item gone) drop out naturally:
 * only keys that still match a live entry surface in the review list.       */
export function splitIgnored(entries, keyOf, ignoredKeys) {
  const ig = new Set(ignoredKeys || []);
  const visible = [];
  const ignored = [];
  for (const e of entries || []) (ig.has(keyOf(e)) ? ignored : visible).push(e);
  return { visible, ignored };
}
