#!/usr/bin/env node
/* messages-test.mjs — Phase-12 assertions for Messaging: the sealed mention
 * grammar (trigger map, token regex parse cases, caret-anchored query scan,
 * labelFor, 6-cap match sourcing, pick splice), the sealed conversation
 * mechanics (title, preview, formatTime, system-pinned ordering, 60s
 * grouping, DM dedupe with the auto-added current user), the sealed strings
 * verbatim, the corrected Reminders pending copy, the declared read/unread
 * math, and the J8 scoring-needed deep-link resolution.
 */
import assert from 'node:assert/strict';
import {
  STR, messagePlaceholder,
  MENTION_TRIGGERS, parseMentions, mentionPlain, mentionToken,
  mentionQueryAt, mentionLabelFor, mentionMatches, applyMentionPick,
  conversationTitle, conversationOthers, conversationPreview, formatTime,
  sortConversations, pendingSentence, sublineCompact, sublineFull,
  previewLine, startConversationRecord, makeMessage, isGrouped, authorName,
  unreadForConversation, unreadTotal, markRead, scoringActionFor,
} from '../src/app/pages/messages-logic.js';
import { scoringNeededBody } from '../src/app/modals/stakeholder-logic.js';

let n = 0;
const ok = (cond, msg) => { assert.ok(cond, msg); n++; };
const eq = (a, b, msg) => { assert.deepEqual(a, b, msg); n++; };

/* ── MENTION_TRIGGERS (sealed EXACT: @ = stakeholders, / = workspaces,
 * # = plans, $ = community) ─────────────────────────────────────────────── */
eq(MENTION_TRIGGERS['@'], { type: 'stk', src: 'stakeholders' }, '@ → stk/stakeholders');
eq(MENTION_TRIGGERS['/'], { type: 'wsp', src: 'workspaces' }, '/ → wsp/workspaces');
eq(MENTION_TRIGGERS['#'], { type: 'pln', src: 'plans' }, '# → pln/plans');
eq(MENTION_TRIGGERS['$'], { type: 'cmy', src: 'community' }, '$ → cmy/community');
eq(Object.keys(MENTION_TRIGGERS).length, 4, 'exactly four trigger sigils');

/* ── Token grammar {{type:id|label}} parse cases ────────────────────────── */
eq(parseMentions('plain body'), [{ kind: 'text', text: 'plain body' }],
  'no-token fast path returns the body as one text segment');
eq(parseMentions(''), [], 'empty body → no segments');
eq(parseMentions('see {{stk:sh-01|Mayor Maria Chen}} today'), [
  { kind: 'text', text: 'see ' },
  { kind: 'mention', type: 'stk', id: 'sh-01', label: 'Mayor Maria Chen' },
  { kind: 'text', text: ' today' },
], 'single token with surrounding text preserved');
eq(parseMentions('{{pln:plan-1|Hawk SEP}}{{cmy:ca-01|Cedarville Grant}}'), [
  { kind: 'mention', type: 'pln', id: 'plan-1', label: 'Hawk SEP' },
  { kind: 'mention', type: 'cmy', id: 'ca-01', label: 'Cedarville Grant' },
], 'adjacent tokens both match');
eq(parseMentions('{{wsp:ws-1|}}'), [
  { kind: 'mention', type: 'wsp', id: 'ws-1', label: '' },
], 'empty label matches (sealed: label class is zero-or-more)');
eq(parseMentions('{{usr:u-1|Nope}}'), [{ kind: 'text', text: '{{usr:u-1|Nope}}' }],
  'unknown type code never matches (sealed: stk|wsp|pln|cmy only)');
eq(parseMentions('{{stk:a|b}} and {{stk:a|b}}'), [
  { kind: 'mention', type: 'stk', id: 'a', label: 'b' },
  { kind: 'text', text: ' and ' },
  { kind: 'mention', type: 'stk', id: 'a', label: 'b' },
], 'global scan continues past the first match (fresh lastIndex per call)');
eq(mentionPlain('re {{stk:sh-01|Maria}} + {{pln:p|Hawk}}'), 're Maria + Hawk',
  'plain projection collapses tokens to labels (declared preview departure)');
eq(mentionToken('stk', 'sh-01', 'Maria'), '{{stk:sh-01|Maria}}', 'token builder');

/* ── Caret-anchored trigger scan (sealed /([@/#$])([\w .'-]*)$/) ────────── */
eq(mentionQueryAt('hello @Mar', 10), { trigger: '@', query: 'Mar', start: 6 },
  '@-query at caret end');
eq(mentionQueryAt('ping #', 6), { trigger: '#', query: '', start: 5 },
  'bare sigil opens an empty query');
eq(mentionQueryAt("@O'Brien-Kim v2", 15), { trigger: '@', query: "O'Brien-Kim v2", start: 0 },
  "the class covers word chars, space, dot, apostrophe, hyphen");
eq(mentionQueryAt('email me, no trigger', 20), null, 'no sigil → null');
eq(mentionQueryAt('no@match!', 9), null, 'a class-breaking char after the sigil closes the scan');
eq(mentionQueryAt('caret cut @Mar', 11), { trigger: '@', query: '', start: 10 },
  'scan runs against the substring UP TO the caret only');

/* ── labelFor (sealed per type) ─────────────────────────────────────────── */
eq(mentionLabelFor('stk', { isPerson: true, title: 'Mayor', firstName: 'Maria', lastName: 'Chen', name: 'fallback' }),
  'Mayor Maria Chen', 'stk → displayName first');
eq(mentionLabelFor('stk', { name: 'Cedarville USD' }), 'Cedarville USD', 'stk → name fallback');
eq(mentionLabelFor('pln', { title: 'Hawk SEP', name: 'x' }), 'Hawk SEP', 'pln → title');
eq(mentionLabelFor('wsp', { name: 'Hawk' }), 'Hawk', 'wsp → name');
eq(mentionLabelFor('cmy', { name: 'Cedarville Grant' }), 'Cedarville Grant', 'cmy → name');

/* ── Match sourcing (sealed: label exists, substring on lowercased query,
 * UP TO 6, type attached) ───────────────────────────────────────────────── */
const sources = {
  stakeholders: [
    { id: 's1', name: 'Maria Chen' }, { id: 's2', name: 'Mark Roth' },
    { id: 's3', name: 'Amara Singh' }, { id: 's4', name: 'Omar Diaz' },
    { id: 's5', name: 'Tamara Lee' }, { id: 's6', name: 'Marcus Webb' },
    { id: 's7', name: 'Mario Rossi' }, { id: 's8', name: '' },
  ],
  workspaces: [{ id: 'w1', name: 'Hawk' }],
  plans: [{ id: 'p1', title: 'Hawk SEP' }],
  community: [{ id: 'c1', name: 'Cedarville Grant' }],
};
eq(mentionMatches({ trigger: '@', query: 'mar', start: 0 }, sources).length, 6,
  'matches cap at 6');
eq(mentionMatches({ trigger: '@', query: 'maria' }, sources),
  [{ id: 's1', label: 'Maria Chen', type: 'stk' }], 'case-insensitive substring');
eq(mentionMatches({ trigger: '/', query: '' }, sources),
  [{ id: 'w1', label: 'Hawk', type: 'wsp' }], 'empty query lists the source');
eq(mentionMatches({ trigger: '#', query: 'hawk' }, sources),
  [{ id: 'p1', label: 'Hawk SEP', type: 'pln' }], '# searches plans by title');
eq(mentionMatches(null, sources), [], 'no active query → no matches');
eq(mentionMatches({ trigger: '@', query: 'zzz' }, sources), [], 'no hit → empty');

/* ── Pick splice (sealed: token over the typed fragment + trailing space,
 * caret after) ──────────────────────────────────────────────────────────── */
{
  const text = 'ping @Mar before noon';
  const mq = { trigger: '@', query: 'Mar', start: 5 };
  const r = applyMentionPick(text, mq, { type: 'stk', id: 's1', label: 'Maria Chen' });
  eq(r.text, 'ping {{stk:s1|Maria Chen}}  before noon', 'token splices over the fragment');
  eq(r.caret, 'ping {{stk:s1|Maria Chen}} '.length, 'caret lands after the trailing space');
}

/* ── Conversation helpers (sealed) ──────────────────────────────────────── */
const users = [
  { id: 'u-a', name: 'Alex Rivera', presence: 'online', role: 'manager' },
  { id: 'u-j', name: 'Jordan Kim', presence: 'online', role: 'manager' },
  { id: 'u-s', name: 'Sam Okafor', presence: 'away', role: 'member' },
];
eq(conversationTitle({ kind: 'system', title: 'ignored' }, users, 'u-a'), 'Reminders',
  'system title is the literal "Reminders" before any other rule');
eq(conversationTitle({ kind: 'group', title: 'EMEA pre-meeting', participants: [] }, users, 'u-a'),
  'EMEA pre-meeting', 'set title wins');
eq(conversationTitle({ kind: 'direct', title: null, participants: ['u-a', 'u-j'] }, users, 'u-a'),
  'Jordan Kim', 'untitled → others\' names');
eq(conversationTitle({ kind: 'group', title: null, participants: ['u-a', 'u-j', 'u-x'] }, users, 'u-a'),
  'Jordan Kim, ?', 'missing user falls back to "?"');
eq(conversationOthers({ participants: ['u-a', 'u-j'] }, 'u-a'), ['u-j'], 'others = minus current');
eq(conversationPreview([]), { body: 'No messages yet', at: null }, 'empty preview (sealed string)');
eq(conversationPreview([{ body: 'a', at: '1' }, { body: 'b', at: '2' }]).body, 'b',
  'preview = the LAST message');

/* formatTime: today → h:mm AM/PM; other day → "Mon D" (locale-shaped). */
{
  const today = new Date();
  today.setHours(15, 7, 0, 0);
  const t = formatTime(today.toISOString());
  ok(/\d{1,2}:\d{2}/.test(t), `same-day renders a clock time (saw "${t}")`);
  eq(formatTime('2026-06-03T12:00:00.000Z'), new Date('2026-06-03T12:00:00.000Z')
    .toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 'other day → Mon D');
  eq(formatTime(null), '', 'no iso → empty');
}

/* Ordering: system PINNED first; others last-message ISO desc; empty "0". */
{
  const convs = [
    { id: 'c-old', kind: 'direct' }, { id: 'c-system', kind: 'system' },
    { id: 'c-new', kind: 'direct' }, { id: 'c-empty', kind: 'direct' },
  ];
  const msgs = {
    'c-old': [{ at: '2026-06-01T00:00:00.000Z' }],
    'c-new': [{ at: '2026-06-10T00:00:00.000Z' }],
  };
  eq(sortConversations(convs, msgs).map((c) => c.id),
    ['c-system', 'c-new', 'c-old', 'c-empty'],
    'system pinned; last-message desc; empty thread sorts last ("0")');
}

/* ── Sealed strings verbatim ────────────────────────────────────────────── */
eq(STR.openFullPage, 'Open full Messages page', 'expand tooltip verbatim');
eq(STR.reply, 'Reply…', 'sidebar composer placeholder (ellipsis char)');
eq(STR.write, 'Write a message…', 'default composer placeholder');
eq(STR.emptyTitle, 'Select a conversation', 'empty-state heading');
eq(STR.emptyBody, 'Or start a new one. Group messages let you bring in multiple teammates.',
  'empty-state body verbatim');
eq(STR.threadEmpty, 'No messages yet. Say hello.', 'thread empty verbatim');
eq(STR.peoplePlaceholder, 'Start typing a name or title…',
  'autocomplete placeholder verbatim (ellipsis char included)');
eq(STR.groupPlaceholder, 'EMEA pre-meeting', 'group title placeholder verbatim');
eq(STR.groupNameLabel, 'Group name (optional)', 'group label');
eq(STR.titleLabel, 'Title (optional)', 'non-group label');
eq(STR.addPeople, 'Add people (type to search)', 'add-people label');
eq(STR.pickList, 'Or pick from the list', 'pick-list label');
eq(STR.startConversation, 'Start conversation', 'create CTA');
eq(STR.newConversation, 'New conversation', 'modal headline');
eq(STR.backAll, 'All conversations', 'back label words (arrow = leading icon)');
eq(STR.automatedReminders, 'Automated reminders', 'RULED system subline');
eq(messagePlaceholder('Reminders'), 'Message Reminders', '"Message " + title');

/* Sublines: sealed compact/full + the RULED system correction. */
eq(sublineCompact({ kind: 'group', participants: ['a', 'b', 'c'] }), '3 people · group', 'compact group');
eq(sublineCompact({ kind: 'direct', participants: ['a', 'b'] }), 'Direct message', 'compact direct');
eq(sublineCompact({ kind: 'system' }), 'Automated reminders',
  'system NEVER reads "Direct message" (sealed quirk correction)');
eq(sublineFull({ kind: 'group', participants: ['u-a', 'u-j'] }, users),
  '2 people · Alex Rivera, Jordan Kim', 'page group subline: n + names');
eq(sublineFull({ kind: 'system' }, users), 'Automated reminders', 'page system subline');

/* Pending copy: LIVE count + conjugated verb (sealed corrections). */
eq(pendingSentence(0), 'All caught up', 'zero pending');
eq(pendingSentence(1), '1 stakeholder needs scoring', 'singular verb corrected ("needs")');
eq(pendingSentence(3), '3 stakeholders need scoring', 'plural');

/* Preview line: "Firstname: " prefix only when the author exists and is not
 * the current user. */
{
  const conv = { kind: 'direct', participants: ['u-a', 'u-j'] };
  const msgs = [{ from: 'u-j', body: 'hi there', at: '1' }];
  eq(previewLine(conv, msgs, users, 'u-a', 0), 'Jordan: hi there', 'other-author prefix');
  eq(previewLine(conv, [{ from: 'u-a', body: 'me', at: '1' }], users, 'u-a', 0), 'me',
    'own message → no prefix');
  eq(previewLine({ kind: 'system' }, [], users, 'u-a', 2), '2 stakeholders need scoring',
    'system preview = the pending sentence');
}

/* ── startConversation (sealed writer) ──────────────────────────────────── */
{
  const mint = () => 'c-new';
  const existing = [
    { id: 'c-dm', kind: 'direct', participants: ['u-a', 'u-j'] },
    { id: 'c-g', kind: 'group', participants: ['u-a', 'u-j', 'u-s'] },
  ];
  eq(startConversationRecord(existing, 'u-a', ['u-j'], null, mint),
    { id: 'c-dm', conversation: null },
    'DM DEDUPE: an existing 2-person direct thread is reused');
  const r2 = startConversationRecord(existing, 'u-a', ['u-s'], null, mint);
  eq(r2.conversation, { id: 'c-new', kind: 'direct', participants: ['u-a', 'u-s'], title: null },
    'new DM: current user auto-added first, kind direct, title null');
  const r3 = startConversationRecord(existing, 'u-a', ['u-j', 'u-s'], 'Sync', mint);
  eq(r3.conversation.kind, 'group', '3 participants → group (never deduped)');
  eq(r3.conversation.title, 'Sync', 'title stored as passed');
  const r4 = startConversationRecord([], 'u-a', ['u-a', 'u-j'], null, mint);
  eq(r4.conversation.participants, ['u-a', 'u-j'],
    'participant set dedupes the current user (Set semantics)');
  const m = makeMessage('u-a', 'hello', () => 'm-1', '2026-06-11T00:00:00.000Z');
  eq(m, { id: 'm-1', from: 'u-a', body: 'hello', at: '2026-06-11T00:00:00.000Z' },
    'ordinary messages carry NO kind field');
  ok(!('kind' in m), 'kind key absent entirely');
}

/* ── Grouping (sealed 60s same-author rule) ─────────────────────────────── */
{
  const a = { from: 'u-a', at: '2026-06-11T10:00:00.000Z' };
  const b = { from: 'u-a', at: '2026-06-11T10:00:59.000Z' };
  const c = { from: 'u-a', at: '2026-06-11T10:01:59.500Z' };
  const d = { from: 'u-j', at: '2026-06-11T10:01:00.000Z' };
  ok(isGrouped(a, b), 'same author within 60s groups');
  ok(!isGrouped(b, c), '>= 60s breaks the group');
  ok(!isGrouped(a, d), 'author change breaks the group');
  ok(!isGrouped(undefined, a), 'first message never grouped');
  eq(authorName({ from: 'u-a' }, users, 'u-a'), 'You', 'own author renders "You"');
  eq(authorName({ from: 'u-j' }, users, 'u-a'), 'Jordan Kim', 'other author name');
  eq(authorName({ from: 'u-x' }, users, 'u-a'), '?', 'unresolved author → "?"');
}

/* ── Read/unread (declared make-real; system = live unscoredCount) ──────── */
{
  const convs = [
    { id: 'c-1', kind: 'direct', participants: ['u-a', 'u-j'] },
    { id: 'c-2', kind: 'direct', participants: ['u-j', 'u-s'] }, // not a participant
    { id: 'c-system', kind: 'system', participants: ['u-a', 'u-j'] },
  ];
  const msgs = {
    'c-1': [
      { from: 'u-j', at: '2026-06-01T00:00:00.000Z' },
      { from: 'u-a', at: '2026-06-02T00:00:00.000Z' },
      { from: 'u-j', at: '2026-06-03T00:00:00.000Z' },
    ],
    'c-2': [{ from: 'u-j', at: '2026-06-04T00:00:00.000Z' }],
    'c-system': [{ from: 'u-system', at: '2026-06-05T00:00:00.000Z', kind: 'scoring-needed' }],
  };
  eq(unreadForConversation(convs[0], msgs['c-1'], undefined, 'u-a'), 2,
    'no marker → every other-author message counts (own never do)');
  eq(unreadForConversation(convs[0], msgs['c-1'], '2026-06-01T00:00:00.000Z', 'u-a'), 1,
    'marker cuts everything at or before it');
  eq(unreadForConversation(convs[1], msgs['c-2'], undefined, 'u-a'), 0,
    'non-participant conversations never count');
  eq(unreadForConversation(convs[2], msgs['c-system'], undefined, 'u-a'), 0,
    'the system conversation never counts by messages');
  eq(unreadTotal(convs, msgs, {}, 'u-a', 5), 7,
    'badge = per-conversation unread (2) + live unscoredCount (5)');
  const r1 = markRead({}, 'u-a', 'c-1', '2026-06-03T00:00:00.000Z');
  eq(r1, { 'u-a': { 'c-1': '2026-06-03T00:00:00.000Z' } }, 'markRead stamps the map');
  ok(markRead(r1, 'u-a', 'c-1', '2026-06-03T00:00:00.000Z') === r1,
    'unchanged stamp is an identity no-op (effect-safe)');
  eq(unreadTotal(convs, msgs, r1, 'u-a', 0), 0, 'after read + all scored → zero');
}

/* ── J8 make-real: the scoring-needed deep links ────────────────────────── */
{
  const body = scoringNeededBody('Mayor Maria Chen', 'Mayor', 'sh-01');
  eq(body,
    'New stakeholder added: {{stk:sh-01|Mayor Maria Chen}} (Mayor). Please score them on the Scoring tab.',
    'with an id the subject embeds as a stk mention token');
  eq(mentionPlain(body),
    'New stakeholder added: Mayor Maria Chen (Mayor). Please score them on the Scoring tab.',
    'the rendered sentence stays the sealed copy verbatim');
  eq(scoringNeededBody('X', 'Y'),
    'New stakeholder added: X (Y). Please score them on the Scoring tab.',
    'no id → the sealed plain sentence, unchanged');
  const msg = { kind: 'scoring-needed', body };
  eq(scoringActionFor(msg, { 'sh-01': ['ws-hawk', 'ws-2'] }),
    { stakeholderId: 'sh-01', workspaceId: 'ws-hawk' },
    'action resolves the subject + its FIRST workspace');
  eq(scoringActionFor(msg, {}), { stakeholderId: 'sh-01', workspaceId: null },
    'unassigned subject → null workspace (caller falls back to the record)');
  eq(scoringActionFor({ kind: 'scoring-needed', body: 'plain' }, {}), null,
    'no stk token → no action');
  eq(scoringActionFor({ body }, {}), null, 'ordinary messages never grow the action');
}

console.log(`messages-test: ${n} assertions passed`);
