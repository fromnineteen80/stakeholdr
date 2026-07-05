/* messages-logic.js — Messaging's PURE logic, factored out of the JSX so node
 * tests (scripts/messages-test.mjs) can assert it against the SEALED BOX TEXT
 * ("Messaging — conversations, threads, @ / # / $ / mention links" in
 * src/guide.jsx, ~2942–3076, plus the Reminders-cadence corrections at ~284–292
 * and the Connectivity-census J-section).
 *
 * SEALED MECHANICS CARRIED VERBATIM:
 *  · MENTION_TRIGGERS — "@"→stk/stakeholders · "/"→wsp/workspaces ·
 *    "#"→pln/plans · "$"→cmy/community (at-sign = stakeholders, slash =
 *    workspaces, hash = plans, dollar = community).
 *  · Token grammar {{type:id|label}}; render regex
 *    /\{\{(stk|wsp|pln|cmy):([^|}]+)\|([^}]*)\}\}/g (ONE backslash per escape
 *    — the sealed escaping warning); composer trigger regex
 *    /([@/#$])([\w .'-]*)$/ end-anchored at the caret; matches cap at 6.
 *  · labelFor: stk → displayName(o) || o.name; pln → o.title; wsp → o.name;
 *    cmy → o.name.
 *  · startConversation: dedupe the current user into participants (Set);
 *    kind "group" when > 2; DM DEDUPE BY PARTICIPANT PAIR (an existing
 *    2-person direct thread is REUSED, never duplicated).
 *  · conversationTitle: system → "Reminders"; else title; else others' names
 *    joined ", " (missing user → "?").
 *  · conversationPreview: empty → { body: "No messages yet", at: null }.
 *  · formatTime: today → h:mm AM/PM; else "Mon D".
 *  · List order: system PINNED first; others by last-message ISO desc
 *    (localeCompare; empty thread sorts as "0", i.e. last).
 *  · Thread grouping: same author within 60s → grouped (avatar/meta hidden).
 *  · Reminders pending sentence — SEALED CORRECTION applied: driven by the
 *    LIVE unscoredCount (never the lifetime message count — the oracle's
 *    divergence is do-not-replicate) and the verb conjugates ("1 stakeholder
 *    needs scoring"; the oracle's noun-only pluralization is a recorded copy
 *    bug). Zero → "All caught up".
 *
 * DECLARED DEPARTURES (file-header ledger; never silent):
 *  · READ/UNREAD IS REAL (sealed DO-NOT-REPLICATE: the oracle badge merely
 *    mirrored unscoredCount): a per-user read-marker map
 *    reads[userId][conversationId] = last-seen ISO persists as its own table;
 *    unread = later-than-marker messages from OTHER authors in conversations
 *    the user participates in; the system conversation contributes the LIVE
 *    unscoredCount (sealed rule). The map shape is a minimal
 *    industry-standard choice (per-user rows map 1:1 onto the Supabase swap).
 *  · mentionPlain(): conversation-list previews render mention tokens as
 *    their plain labels (the oracle preview showed raw {{…}} token text —
 *    readability departure, declared).
 *  · scoringActionFor(): the census J8 MAKE-REAL — a scoring-needed system
 *    message resolves its subject (the first stk mention) and that subject's
 *    first workspace so the thread can offer a real "Open Scoring" route.
 */
import { displayName } from '../../../design-system/components/stakeholder-table.js';

/* ── Sealed strings (single-sourced: JSX + tests read these) ─────────────── */
export const STR = {
  messages: 'Messages',
  conversation: 'Conversation',
  openFullPage: 'Open full Messages page',
  close: 'Close',
  backAll: 'All conversations', // sealed "← All conversations"; the arrow renders as the leading chevron icon
  reply: 'Reply…',
  write: 'Write a message…',
  send: 'Send',
  newBtn: 'New',
  newConversation: 'New conversation',
  emptyTitle: 'Select a conversation',
  emptyBody: 'Or start a new one. Group messages let you bring in multiple teammates.',
  threadEmpty: 'No messages yet. Say hello.',
  noMessages: 'No messages yet',
  reminders: 'Reminders',
  automatedReminders: 'Automated reminders', // the sealed RULING label (never "Direct message" on the system thread)
  directMessage: 'Direct message',
  groupNameLabel: 'Group name (optional)',
  titleLabel: 'Title (optional)',
  groupPlaceholder: 'EMEA pre-meeting',
  addPeople: 'Add people (type to search)',
  peoplePlaceholder: 'Start typing a name or title…',
  pickList: 'Or pick from the list',
  cancel: 'Cancel',
  startConversation: 'Start conversation',
  allCaughtUp: 'All caught up',
  openScoring: 'Open Scoring', // J8 make-real action label (declared copy)
};

/* Sealed: page composer placeholder = "Message " + conversationTitle. */
export function messagePlaceholder(title) {
  return 'Message ' + title;
}

/* ── Mention grammar (sealed verbatim) ───────────────────────────────────── */

export const MENTION_TRIGGERS = {
  '@': { type: 'stk', src: 'stakeholders' },
  '/': { type: 'wsp', src: 'workspaces' },
  '#': { type: 'pln', src: 'plans' },
  '$': { type: 'cmy', src: 'community' },
};

/* Fresh instance per scan — a shared global-flag regex carries lastIndex. */
const tokenRe = () => /\{\{(stk|wsp|pln|cmy):([^|}]+)\|([^}]*)\}\}/g;

/* parseMentions(body) → segments: {kind:'text', text} | {kind:'mention',
 * type, id, label}. Sealed fast path: no "{{" → one text segment. */
export function parseMentions(body) {
  const s = body == null ? '' : String(body);
  if (!s) return [];
  if (!s.includes('{{')) return [{ kind: 'text', text: s }];
  const out = [];
  const re = tokenRe();
  let last = 0;
  let m;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push({ kind: 'text', text: s.slice(last, m.index) });
    out.push({ kind: 'mention', type: m[1], id: m[2], label: m[3] });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ kind: 'text', text: s.slice(last) });
  return out;
}

/* Plain-text projection (previews): tokens collapse to their labels. */
export function mentionPlain(body) {
  return parseMentions(body)
    .map((seg) => (seg.kind === 'mention' ? seg.label : seg.text))
    .join('');
}

export function mentionToken(type, id, label) {
  return `{{${type}:${id}|${label}}}`;
}

/* Sealed composer trigger scan: substring up to the caret against
 * /([@/#$])([\w .'-]*)$/ → { trigger, query, start } | null. */
const QUERY_RE = /([@/#$])([\w .'-]*)$/;
export function mentionQueryAt(text, caret) {
  const upto = String(text ?? '').slice(0, caret);
  const m = QUERY_RE.exec(upto);
  if (!m) return null;
  return { trigger: m[1], query: m[2], start: caret - m[0].length };
}

/* Sealed labelFor. */
export function mentionLabelFor(type, o) {
  if (!o) return '';
  if (type === 'stk') return displayName(o) || o.name || '';
  if (type === 'pln') return o.title || '';
  return o.name || '';
}

/* Sealed match sourcing: label exists AND (no query OR includes, lowercased);
 * UP TO 6; each carries type. */
export function mentionMatches(mq, sources) {
  if (!mq) return [];
  const cfg = MENTION_TRIGGERS[mq.trigger];
  if (!cfg) return [];
  const opts = (sources && sources[cfg.src]) || [];
  const q = (mq.query || '').toLowerCase();
  return opts
    .map((o) => ({ id: o.id, label: mentionLabelFor(cfg.type, o), type: cfg.type }))
    .filter((o) => o.label && (!q || o.label.toLowerCase().includes(q)))
    .slice(0, 6);
}

/* Sealed pick: splice the token over the typed trigger fragment, append a
 * trailing space, return the new text + caret position. */
export function applyMentionPick(text, mq, opt) {
  const s = String(text ?? '');
  const token = mentionToken(opt.type, opt.id, opt.label) + ' ';
  const fragEnd = mq.start + 1 + (mq.query || '').length;
  const before = s.slice(0, mq.start) + token;
  return { text: before + s.slice(fragEnd), caret: before.length };
}

/* ── Conversations ───────────────────────────────────────────────────────── */

export function conversationTitle(conv, users, currentUserId) {
  if (!conv) return '';
  if (conv.kind === 'system') return STR.reminders;
  if (conv.title) return conv.title;
  return (conv.participants || [])
    .filter((id) => id !== currentUserId)
    .map((id) => ((users || []).find((u) => u.id === id) || {}).name || '?')
    .join(', ');
}

export function conversationOthers(conv, currentUserId) {
  return ((conv && conv.participants) || []).filter((id) => id !== currentUserId);
}

export function conversationPreview(msgs) {
  if (!msgs || !msgs.length) return { body: STR.noMessages, at: null };
  return msgs[msgs.length - 1];
}

/* Sealed formatTime. */
export function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (d.toDateString() === new Date().toDateString()) {
    return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const lastAt = (messages, id) => {
  const list = (messages || {})[id] || [];
  return (list.length ? list[list.length - 1].at : null) || '0';
};

/* Sealed ordering: system pinned first; others last-message ISO desc. */
export function sortConversations(conversations, messages) {
  return [...(conversations || [])].sort((a, b) => {
    if (a.kind === 'system') return -1;
    if (b.kind === 'system') return 1;
    return lastAt(messages, b.id).localeCompare(lastAt(messages, a.id));
  });
}

/* Sealed pending copy, corrections applied (live count + conjugated verb). */
export function pendingSentence(n) {
  if (!(n > 0)) return STR.allCaughtUp;
  return `${n} stakeholder${n === 1 ? '' : 's'} need${n === 1 ? 's' : ''} scoring`;
}

/* Sidebar/list subline: "{n} people · group" | "Direct message" | the RULED
 * system label. */
export function sublineCompact(conv) {
  if (!conv) return '';
  if (conv.kind === 'system') return STR.automatedReminders;
  if (conv.kind === 'group') return `${(conv.participants || []).length} people · group`;
  return STR.directMessage;
}

/* Page head subline: groups → "{n} people · " + comma-joined names. */
export function sublineFull(conv, users) {
  if (!conv) return '';
  if (conv.kind === 'system') return STR.automatedReminders;
  if (conv.kind === 'group') {
    const names = (conv.participants || [])
      .map((id) => ((users || []).find((u) => u.id === id) || {}).name || '?')
      .join(', ');
    return `${(conv.participants || []).length} people · ${names}`;
  }
  return STR.directMessage;
}

/* Sealed preview line: system → pending sentence; else optional
 * "Firstname: " prefix (author exists AND is not the current user) + body
 * (tokens as labels — declared departure above). */
export function previewLine(conv, msgs, users, currentUserId, pending) {
  if (conv.kind === 'system') return pendingSentence(pending);
  const p = conversationPreview(msgs);
  const from = (users || []).find((u) => u.id === p.from);
  const prefix = from && from.id !== currentUserId ? from.name.split(' ')[0] + ': ' : '';
  return prefix + mentionPlain(p.body);
}

/* ── Store writers (pure builders; the surfaces commit them) ─────────────── */

/* Sealed startConversation. mintId injected for testability; returns the id
 * to activate + the new record (null when an existing DM is reused). */
export function startConversationRecord(conversations, currentUserId, participantIds, title, mintId) {
  const participants = [...new Set([currentUserId, ...(participantIds || [])])];
  const kind = participants.length > 2 ? 'group' : 'direct';
  if (kind === 'direct') {
    const existing = (conversations || []).find((c) =>
      c.kind === 'direct' && (c.participants || []).length === 2 &&
      participants.every((p) => c.participants.includes(p)));
    if (existing) return { id: existing.id, conversation: null };
  }
  const id = mintId();
  return { id, conversation: { id, kind, participants, title: title ?? null } };
}

/* Sealed sendMessage record: ordinary user messages carry NO kind field. */
export function makeMessage(currentUserId, body, mintId, atIso) {
  return { id: mintId(), from: currentUserId, body, at: atIso };
}

/* ── Thread ──────────────────────────────────────────────────────────────── */

/* Sealed grouping: same author within 60 000 ms. */
export function isGrouped(prev, m) {
  return !!(prev && prev.from === m.from &&
    (new Date(m.at) - new Date(prev.at)) < 60000);
}

export function authorName(m, users, currentUserId) {
  if (m.from === currentUserId) return 'You';
  const u = (users || []).find((x) => x.id === m.from);
  return u ? u.name : '?';
}

/* ── Read / unread (declared make-real; see the ledger above) ────────────── */

export function unreadForConversation(conv, msgs, lastReadIso, currentUserId) {
  if (!conv || conv.kind === 'system') return 0;
  if (!(conv.participants || []).includes(currentUserId)) return 0;
  const since = lastReadIso || '0';
  return (msgs || []).filter((m) => m.from !== currentUserId && (m.at || '0') > since).length;
}

/* Badge total = per-conversation unread + the LIVE unscoredCount (the sealed
 * system-conversation contribution). */
export function unreadTotal(conversations, messages, reads, currentUserId, unscoredCount) {
  const mine = (reads && reads[currentUserId]) || {};
  let total = unscoredCount > 0 ? unscoredCount : 0;
  for (const c of conversations || []) {
    total += unreadForConversation(c, (messages || {})[c.id], mine[c.id], currentUserId);
  }
  return total;
}

/* Stamp a conversation read; identity-preserving no-op when unchanged (the
 * mark-read effects re-run on every message change). */
export function markRead(reads, currentUserId, convId, atIso) {
  if (!currentUserId || !convId || !atIso) return reads;
  const mine = (reads && reads[currentUserId]) || {};
  if ((mine[convId] || '0') >= atIso) return reads;
  return { ...(reads || {}), [currentUserId]: { ...mine, [convId]: atIso } };
}

/* ── Census J8 make-real: scoring-needed deep links ──────────────────────── */

/* A system scoring-needed message's subject = its first stk mention; the
 * action surface = Scoring in the subject's first workspace (null when the
 * stakeholder is unassigned — the caller falls back to the record). */
export function scoringActionFor(message, stakeholderWorkspaces) {
  if (!message || message.kind !== 'scoring-needed') return null;
  const seg = parseMentions(message.body).find((s) => s.kind === 'mention' && s.type === 'stk');
  if (!seg) return null;
  return {
    stakeholderId: seg.id,
    workspaceId: ((stakeholderWorkspaces || {})[seg.id] || [])[0] || null,
  };
}
