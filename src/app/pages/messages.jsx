/* messages.jsx — MESSAGING: the two sealed surfaces sharing ONE
 * conversation+message store — (A) MessagingSidebar, the right-edge overlay
 * panel, and (B) MessagesPage, the full two-pane page — plus the shared
 * ConversationList / ConversationAvatars / MessageThread / Composer /
 * NewConversationModal, assembled against the SKELETON TREES 1–7 in the
 * sealed box "Messaging — conversations, threads, @ / # / $ / mention links"
 * (src/guide.jsx ~2942–3076). All pure logic lives in messages-logic.js
 * (node-tested by scripts/messages-test.mjs).
 *
 * SEALED RULINGS / MAKE-REAL flags honored here:
 *  · READ-ONLY REMINDERS (the ruling LANDED in the Messaging box): when the
 *    open conversation's kind === "system" the Composer does NOT mount
 *    (sidebar or page — sealed handlers 9–12 have no system-thread surface);
 *    the head subline reads "Automated reminders" (never "Direct message");
 *    the opened head shows the SAME sparkle system avatar as the list row
 *    (never stacked user avatars). All three are the sealed corrections of
 *    verified oracle quirks.
 *  · MENTION LINKS ARE REAL (census J6/A26 FRAGILE → first-class): chips call
 *    the onOpenMention PROP the shell wires to its guarded deep-link resolver
 *    — no window.__openMention. Mention SOURCES flow in as props (census A27:
 *    no window.__mentionSources).
 *  · Census J8 MAKE-REAL: scoring-needed system messages render their subject
 *    as a live stakeholder mention chip (the body embeds the token — see
 *    scoringNeededBody) plus an "Open Scoring" action routed through
 *    onOpenScoringFor (the shell activates the subject's workspace, Scoring
 *    view; unassigned subjects fall back to the record).
 *  · REAL READ STATE (sealed DO-NOT-REPLICATE on the fake badge): opening a
 *    conversation stamps reads[userId][convId] = the last message's ISO; the
 *    Reminders row's pending chip + sentence read the LIVE unscoredCount
 *    (sealed correction — never the lifetime message count), with the
 *    conjugated "needs" singular (sealed copy-bug fix).
 *  · Census I6 MAKE-REAL (Phase 13): thread AUTHOR AVATARS open that user's
 *    profile via the onOpenUserProfile prop the shell threads into BOTH
 *    surfaces (its seam closes the sidebar first — the mention-chip
 *    precedent). The system bot's avatar stays inert (no profile surface
 *    lists it; every people picker excludes role "system").
 *
 * DECLARED RECOMPOSITIONS (never silent):
 *  · The sidebar = ui-sheet side="right" (the right-edge variant built into
 *    the design system this phase, per the GAP law; scrim-tap + Esc dismiss
 *    are the component's own — sealed handler 1's scrim close comes free).
 *  · The mention popover = a ui-list composition positioned under the field
 *    (.mention-pop): the sealed ui-menu mapping would steal focus from the
 *    textarea mid-word, so the sealed KEYBOARD semantics (ArrowUp/Down cycle,
 *    Enter/Tab pick, Escape close — all while typing) live on the textarea
 *    exactly as sealed, and options pick on mousedown (sealed handler 12:
 *    never blurring the field).
 *  · "← All conversations" renders the arrow as a leading chevron ui-icon +
 *    the sealed words (the sealed tree's own mapping).
 *  · Avatar sizes QUANTIZE onto the ui-avatar token scale (sealed raw px
 *    36/28/26 → the lg/md/sm tokens 40/32/24); the sealed 20px picker chip
 *    is a local token re-point (.picked-chip re-points avatar-size-sm) —
 *    a re-point, not a literal.
 *  · Conversation-list previews show mention labels, not raw {{…}} tokens
 *    (mentionPlain — ledgered in messages-logic.js).
 *  · The user-picker checkbox stops click propagation so row-click and
 *    checkbox-click each toggle exactly once (sealed handlers 16/17).
 *  · The sealed form.composer (onSubmit) is recomposed as div.composer +
 *    Send onClick + Enter-in-keydown — identical submit semantics (trim
 *    guard, clear text+popover, Shift+Enter newline), no raw form element.
 *  · messageUser(userId) (sealed store writer, census J5) — RESOLVED at
 *    Phase 13: the shell composes it from this module's DM-dedupe core
 *    (messages-logic.startConversationRecord) and wires it to the
 *    UserListPopup's "Send message" action (people panel → DM thread →
 *    messaging sidebar opens).
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState, uid, nowStamp } from '../data/store.js';
import { useCurrentUser } from '../data/session.js';
import {
  SEED_USERS, SEED_CONVERSATIONS, SEED_MESSAGES, SEED_READS,
  SEED_STAKEHOLDERS, SEED_WORKSPACES, SEED_PLANS, SEED_COMMUNITY,
  SEED_SCORES, SEED_TEAM, SEED_STAKEHOLDER_WORKSPACES,
} from '../data/seed.js';
import { unscoredCountFor } from './scoring-logic.js';
import { activeStakeholders } from '../data/workspace.js';
import { useUiEvent, Field, TF, Picker, UAv } from '../modals/stakeholder-modal.jsx';
import {
  STR, messagePlaceholder,
  parseMentions, mentionQueryAt, mentionMatches, applyMentionPick,
  conversationTitle, conversationOthers, formatTime, sortConversations,
  pendingSentence, sublineCompact, sublineFull, previewLine,
  startConversationRecord, makeMessage, isGrouped, authorName,
  markRead, scoringActionFor,
} from './messages-logic.js';

/* ── the ONE store view both surfaces share (same-tab fan-out keeps the
 * sidebar, the page, and the shell badge in step — store.js) ─────────────── */
function useMessaging() {
  const [users] = usePersistentState('users', SEED_USERS);
  const [conversations, setConversations] = usePersistentState('conversations', SEED_CONVERSATIONS);
  const [messages, setMessages] = usePersistentState('messages', SEED_MESSAGES);
  const [, setReads] = usePersistentState('reads', SEED_READS);
  const [stakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const [workspaces] = usePersistentState('workspaces', SEED_WORKSPACES);
  const [plans] = usePersistentState('plans', SEED_PLANS);
  const [community] = usePersistentState('community', SEED_COMMUNITY);
  const [scores] = usePersistentState('scores', SEED_SCORES);
  const [team] = usePersistentState('team', SEED_TEAM);
  const [stakeholderWorkspaces] = usePersistentState('stakeholderWorkspaces', SEED_STAKEHOLDER_WORKSPACES);

  // currentUser = the seeded first user until the login phase (sealed order).
  /* Phase 23: currentUser = the SESSION user resolved against the directory
   * (the one seam, data/session.js) — the users[0] stand-in is retired. */
  const currentUser = useCurrentUser(users);

  /* PHASE 24 FIX (audit F2/F4): the ONE active-only slice this module reads —
   * archived records leave every default surface (the activeStakeholders seam
   * in data/workspace.js). */
  const liveStakeholders = useMemo(
    () => activeStakeholders(stakeholders), [stakeholders]);

  /* Sealed live pending count (Reminders row + sentence) — the ONE formula.
   * PHASE 24 FIX (audit F2): over the ACTIVE set, so the Reminders chip
   * always agrees with the shell's nav badge + the Scoring queue (an archived
   * record never demands scoring). */
  const pending = useMemo(
    () => unscoredCountFor(liveStakeholders, scores, team, currentUser?.id),
    [liveStakeholders, scores, team, currentUser]);

  /* Census A27 made real: mention sources are LIVE entity lists via props.
   * PHASE 24 FIX (audit F4): the composer PICKER authors NEW references, so
   * its stakeholder source is ACTIVE-only. Existing mention chips stay RAW by
   * construction: parseMentions resolves label+id from the message body
   * token itself (never from these sources), so an archived mention still
   * renders and routes — a recoverable record never dead-ends. */
  const mentionSources = useMemo(
    () => ({ stakeholders: liveStakeholders, workspaces, plans, community }),
    [liveStakeholders, workspaces, plans, community]);

  /* Sealed sendMessage: append { id, from, body, at } (no kind field). */
  const send = (convId, body) => {
    setMessages((prev) => ({
      ...prev,
      [convId]: [...(prev[convId] || []), makeMessage(currentUser?.id, body, () => uid('m'), nowStamp())],
    }));
  };

  /* Sealed startConversation (current user auto-added; DM dedupe by pair;
   * messages[id] initialized empty). Returns the id to activate. */
  const startConversation = (participantIds, title) => {
    const r = startConversationRecord(conversations, currentUser?.id, participantIds, title, () => uid('c'));
    if (r.conversation) {
      setConversations((prev) => [...prev, r.conversation]);
      setMessages((prev) => ({ ...prev, [r.id]: prev[r.id] || [] }));
    }
    return r.id;
  };

  return {
    users, conversations, messages, setReads, stakeholderWorkspaces,
    currentUser, pending, mentionSources, send, startConversation,
  };
}

/* Stamp the open conversation read whenever its thread grows (declared
 * make-real read state; markRead is identity-preserving so this never loops). */
function useMarkRead(S, activeId, enabled) {
  const { messages, currentUser, setReads } = S;
  useEffect(() => {
    if (!enabled || !activeId || !currentUser) return;
    const list = messages[activeId] || [];
    const last = list.length ? list[list.length - 1].at : null;
    if (!last) return;
    setReads((prev) => markRead(prev, currentUser.id, activeId, last));
  }, [enabled, activeId, messages, currentUser, setReads]);
}

/* ── TREE 4 — ConversationAvatars (+ the RULED system sparkle) ───────────── */
function SystemAvatar({ large }) {
  return (
    <span className={'av-system' + (large ? ' lg' : '')} aria-hidden="true">
      <ui-icon size="sm">auto_awesome</ui-icon>
    </span>
  );
}

function ConversationAvatars({ conv, users, currentUserId, large }) {
  /* RULED: the system conversation shows the sparkle system avatar in the
   * head exactly as in the list row (never stacked user avatars). */
  if (conv.kind === 'system') return <SystemAvatar large={large} />;
  const others = conversationOthers(conv, currentUserId);
  if (!others.length) return null;
  if (others.length === 1 || conv.kind === 'direct') {
    const u = users.find((x) => x.id === others[0]);
    if (!u) return null; // sealed null-guard: unresolved id renders nothing
    return (
      <UAv user={u} size={large ? 'lg' : 'md'}
           presence={u.presence === 'online' ? 'online' : undefined} />
    );
  }
  return (
    <span className={'conv-multi-avatar' + (large ? ' lg' : '')}>
      {others.slice(0, 2).map((id) => {
        const u = users.find((x) => x.id === id);
        return u ? <UAv key={id} user={u} size="sm" ring /> : null; // per-id skip
      })}
    </span>
  );
}

/* ── TREE 3 — ConversationList (shared; compact in the sidebar) ──────────── */
function ConversationList({ S, activeId, onPick, compact }) {
  const { conversations, messages, users, currentUser, pending } = S;
  const sorted = sortConversations(conversations, messages);
  return (
    <ui-list interactive="" class={'conv-list' + (compact ? ' compact' : '')}>
      {sorted.map((conv) => {
        const msgs = messages[conv.id] || [];
        const isSystem = conv.kind === 'system';
        const last = msgs.length ? msgs[msgs.length - 1] : null;
        return (
          <ui-list-item
            key={conv.id}
            interactive=""
            class={'conv-row' + (conv.id === activeId ? ' conv-active' : '') + (isSystem ? ' conv-system' : '')}
            onClick={() => onPick(conv.id)}
          >
            <span slot="leading" className="conv-lead">
              {isSystem
                ? <SystemAvatar />
                : <ConversationAvatars conv={conv} users={users} currentUserId={currentUser?.id} />}
            </span>
            {conversationTitle(conv, users, currentUser?.id)}
            <span slot="supporting" className="conv-preview">
              {previewLine(conv, msgs, users, currentUser?.id, pending)}
            </span>
            {/* Sealed trailing slot: the pending count chip IN PLACE OF the
                time when the system row has pending > 0. */}
            {isSystem && pending > 0
              ? <ui-badge slot="trailing" count={pending}
                          aria-label={pendingSentence(pending)}></ui-badge>
              : <span slot="trailing" className="conv-time">{formatTime(last?.at)}</span>}
          </ui-list-item>
        );
      })}
    </ui-list>
  );
}

/* ── Mention chip (rendered in bubbles; census J6 made real via the prop) ── */
function MentionChip({ seg, onOpen }) {
  return (
    <ui-chip
      variant="assist"
      class={`mention-chip t-${seg.type}`}
      onClick={() => onOpen && onOpen(seg.type, seg.id)}
    >
      <span slot="icon" className="mention-dot" aria-hidden="true"></span>
      {seg.label}
    </ui-chip>
  );
}

/* ── TREE 5 — MessageThread (shared) ─────────────────────────────────────── */
function MessageThread({ S, conv, onOpenMention, onOpenScoringFor, onOpenUserProfile }) {
  const { messages, users, currentUser, stakeholderWorkspaces } = S;
  const msgs = messages[conv.id] || [];
  const endRef = useRef(null);
  // Sealed: auto-scroll to the trailing anchor on message-count change.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [msgs.length]);

  if (!msgs.length) return <div className="thread-empty">{STR.threadEmpty}</div>;
  return (
    <div className="message-thread">
      {msgs.map((m, i) => {
        const grouped = isGrouped(msgs[i - 1], m);
        const mine = m.from === currentUser?.id;
        const author = users.find((u) => u.id === m.from);
        const action = onOpenScoringFor ? scoringActionFor(m, stakeholderWorkspaces) : null;
        // Census I6: author avatars open that user's profile; the system bot
        // stays inert (no profile surface lists it — every picker excludes
        // role "system").
        const authorOpen = onOpenUserProfile && author && author.role !== 'system'
          ? () => onOpenUserProfile(author.id)
          : null;
        return (
          <div key={m.id} className={'msg' + (mine ? ' mine' : '') + (grouped ? ' grouped' : '')}>
            {!mine && (!grouped && author
              ? <UAv user={author} size="sm"
                     title={authorOpen ? `Open ${author.name}'s profile` : undefined}
                     onOpen={authorOpen || undefined} />
              : <span className="msg-spacer" aria-hidden="true" />)}
            <div className="msg-body">
              {!grouped && (
                <div className="msg-meta">
                  <span className="msg-author">{authorName(m, users, currentUser?.id)}</span>
                  <span className="msg-time">{formatTime(m.at)}</span>
                </div>
              )}
              <div className="msg-bubble">
                {parseMentions(m.body).map((seg, j) => (seg.kind === 'mention'
                  ? <MentionChip key={j} seg={seg} onOpen={onOpenMention} />
                  : <span key={j}>{seg.text}</span>))}
              </div>
              {/* Census J8 make-real: the system reminder's action surface. */}
              {action && (
                <ui-button
                  variant="text"
                  class="msg-action"
                  onClick={() => onOpenScoringFor(action.stakeholderId, action.workspaceId)}
                >
                  {STR.openScoring}
                </ui-button>
              )}
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}

/* ── TREE 6 — Composer (shared; sealed state text/mq/hi + keyboard) ──────── */
function Composer({ placeholder, sources, onSend }) {
  const taRef = useRef(null);
  const [text, setText] = useState('');
  const [mq, setMq] = useState(null);
  const [hi, setHi] = useState(0);

  const matches = useMemo(() => mentionMatches(mq, sources), [mq, sources]);

  const go = () => {
    const t = text.trim();
    if (!t) return;
    onSend(t);
    if (taRef.current) taRef.current.value = '';
    setText('');
    setMq(null);
  };

  const pick = (opt) => {
    const el = taRef.current;
    const r = applyMentionPick(el ? el.value : text, mq, opt);
    if (el) el.value = r.text;
    setText(r.text);
    setMq(null);
    // Sealed: refocus + caret after the spliced token (post-render tick).
    setTimeout(() => {
      const t = taRef.current;
      if (t) { t.focus(); t.setSelectionRange(r.caret); }
    }, 0);
  };

  // Sealed onType: value + caret → the trigger-regex scan → mq / hi reset.
  useUiEvent(taRef, 'input', () => {
    const el = taRef.current;
    if (!el) return;
    setText(el.value);
    const q = mentionQueryAt(el.value, el.selectionStart);
    setMq(q);
    if (q) setHi(0);
  });

  // Sealed keyboard (handler 11): popover cycling while typing; Enter sends.
  useUiEvent(taRef, 'keydown', (e) => {
    if (mq && matches.length) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setHi((h) => (h + 1) % matches.length); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setHi((h) => (h - 1 + matches.length) % matches.length); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); pick(matches[hi]); return; }
      if (e.key === 'Escape') {
        // Sealed handler 4/1: Escape closes ONLY the popover — it must never
        // bubble to ui-sheet's document Escape and take the sidebar with it.
        e.preventDefault();
        e.stopPropagation();
        setMq(null);
        return;
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); go(); }
  });

  return (
    <div className="composer">
      <div className="composer-field">
        <ui-textarea ref={taRef} rows="1" auto-grow=""
                     placeholder={placeholder || STR.write}
                     aria-label={placeholder || STR.write}></ui-textarea>
        {mq && matches.length > 0 && (
          <div className="mention-pop">
            <ui-list interactive="">
              {matches.map((o, i) => (
                <ui-list-item
                  key={o.type + o.id}
                  interactive=""
                  class={'mention-opt' + (i === hi ? ' on' : '')}
                  onMouseDown={(e) => { e.preventDefault(); pick(o); }}
                >
                  <span slot="leading" className={`mention-dot t-${o.type}`} aria-hidden="true"></span>
                  {o.label}
                </ui-list-item>
              ))}
            </ui-list>
          </div>
        )}
      </div>
      <ui-button variant="filled" disabled={text.trim() ? undefined : ''} onClick={go}>
        {STR.send}
      </ui-button>
    </div>
  );
}

/* ── TREE 7 — NewConversationModal ───────────────────────────────────────── */
function PickCheck({ checked, onToggle }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.checked = !!checked; }, [checked]);
  useUiEvent(ref, 'change', onToggle);
  return (
    <ui-checkbox ref={ref} aria-label="Select"
                 onClick={(e) => e.stopPropagation()}></ui-checkbox>
  );
}

function PickedChip({ user, onRemove }) {
  const ref = useRef(null);
  useUiEvent(ref, 'remove', onRemove);
  // Sealed: clicking the chip removes (the × is the explicit affordance).
  return (
    <ui-chip ref={ref} variant="input" class="picked-chip" title="Remove" onClick={onRemove}>
      <UAv slot="icon" user={user} size="sm" />
      {user.name}
    </ui-chip>
  );
}

function NewConversationModal({ open, users, currentUserId, onClose, onCreate }) {
  const dlgRef = useRef(null);
  const [picked, setPicked] = useState([]);
  const [title, setTitle] = useState('');
  useUiEvent(dlgRef, 'close', onClose);
  useEffect(() => { if (open) { setPicked([]); setTitle(''); } }, [open]);

  // Sealed: others = all users except the current one (+ the system-bot
  // exclusion every picker applies — Users box).
  const others = users.filter((u) => u.id !== currentUserId && u.role !== 'system');
  const isGroup = picked.length > 1;
  const toggle = (id) => setPicked((prev) =>
    (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const options = others
    .filter((u) => !picked.includes(u.id))
    .map((u) => ({ label: u.name, value: u.id, sub: u.title }));

  return (
    <ui-dialog ref={dlgRef} open={open ? '' : undefined} class="msg-new-modal">
      {/* Sealed TREE 7 head: h2 + ghost close (handler 14 — the third
          dismissal path beside scrim and Cancel). */}
      <span slot="headline" className="msg-new-head">
        {STR.newConversation}
        <ui-icon-button variant="standard" aria-label="Close" onClick={onClose}>
          <ui-icon>close</ui-icon>
        </ui-icon-button>
      </span>
      <Field label={isGroup ? STR.groupNameLabel : STR.titleLabel}>
        <TF placeholder={isGroup ? STR.groupPlaceholder : ''} value={title} onValue={setTitle} />
      </Field>
      <Field label={STR.addPeople}>
        <Picker options={options} placeholder={STR.peoplePlaceholder}
                onPick={(id) => { if (id) toggle(id); }} />
        {picked.length > 0 && (
          <div className="picked-wrap">
            {picked.map((id) => {
              const u = others.find((x) => x.id === id);
              return u ? <PickedChip key={id} user={u} onRemove={() => toggle(id)} /> : null;
            })}
          </div>
        )}
      </Field>
      <Field label={STR.pickList}>
        <ui-list class="user-picker">
          {others.map((u) => (
            <ui-list-item
              key={u.id}
              interactive=""
              class={'user-picker-row' + (picked.includes(u.id) ? ' picked' : '')}
              onClick={() => toggle(u.id)}
            >
              <span slot="leading" className="picker-lead">
                <PickCheck checked={picked.includes(u.id)} onToggle={() => toggle(u.id)} />
                <UAv user={u} size="md"
                     presence={u.presence === 'online' ? 'online' : undefined} />
              </span>
              {u.name}
              <span slot="supporting">{u.title}</span>
            </ui-list-item>
          ))}
        </ui-list>
      </Field>
      <div slot="actions">
        <ui-button variant="text" onClick={onClose}>{STR.cancel}</ui-button>
        <ui-button variant="filled"
                   disabled={picked.length >= 1 ? undefined : ''}
                   onClick={() => onCreate(picked, title.trim() || null)}>
          {STR.startConversation}
        </ui-button>
      </div>
    </ui-dialog>
  );
}

/* ── shared open-conversation head text column ───────────────────────────── */
function ConvHead({ S, conv, large }) {
  const title = conversationTitle(conv, S.users, S.currentUser?.id);
  return (
    <div className={large ? 'messaging-page-head' : 'messaging-conv-head'}>
      <ConversationAvatars conv={conv} users={S.users}
                           currentUserId={S.currentUser?.id} large={large} />
      <div className="conv-head-text">
        {large ? <h3 className="conv-head-title">{title}</h3>
               : <div className="conv-head-title">{title}</div>}
        <div className="conv-subline">
          {large ? sublineFull(conv, S.users) : sublineCompact(conv)}
        </div>
      </div>
    </div>
  );
}

/* ── TREE 1 — the right-edge MessagingSidebar (ui-sheet side="right") ────── */
export function MessagingSidebar({
  open, onClose, onOpenPage, activeConversationId, onSetActiveConversation,
  onOpenMention, onOpenScoringFor, onOpenUserProfile,
}) {
  const S = useMessaging();
  const sheetRef = useRef(null);
  // The component's own Esc/scrim dismiss → sync the shell's open state.
  useUiEvent(sheetRef, 'close', onClose);
  const conv = S.conversations.find((c) => c.id === activeConversationId) || null;
  useMarkRead(S, activeConversationId, open && !!conv);

  return (
    <ui-sheet ref={sheetRef} side="right" open={open ? '' : undefined}
              class="messaging-sidebar" aria-label={STR.messages}>
      <div className="messaging-sidebar-head">
        <span className="msgs-head-title">
          <ui-icon size="sm">chat</ui-icon>
          <strong>{conv ? STR.conversation : STR.messages}</strong>
        </span>
        <span className="msgs-head-actions">
          {/* Sealed TREE 1: each head icon-button rides a ui-tooltip. */}
          <ui-tooltip>
            <ui-icon-button variant="standard" aria-label={STR.openFullPage}
                            onClick={onOpenPage}>
              <ui-icon>open_in_full</ui-icon>
            </ui-icon-button>
            <span slot="content">{STR.openFullPage}</span>
          </ui-tooltip>
          <ui-tooltip>
            <ui-icon-button variant="standard" aria-label={STR.close} onClick={onClose}>
              <ui-icon>close</ui-icon>
            </ui-icon-button>
            <span slot="content">{STR.close}</span>
          </ui-tooltip>
        </span>
      </div>
      {!conv ? (
        <ConversationList S={S} activeId={null} compact
                          onPick={(id) => onSetActiveConversation(id)} />
      ) : (
        <>
          {/* Sealed handler 4: back returns to the list WITHOUT closing. */}
          <ui-button variant="text" class="messaging-back"
                     onClick={() => onSetActiveConversation(null)}>
            <ui-icon slot="leading">chevron_left</ui-icon>
            {STR.backAll}
          </ui-button>
          <ConvHead S={S} conv={conv} />
          <MessageThread S={S} conv={conv}
                         onOpenMention={onOpenMention}
                         onOpenScoringFor={onOpenScoringFor}
                         onOpenUserProfile={onOpenUserProfile} />
          {conv.kind !== 'system' && (
            <Composer placeholder={STR.reply} sources={S.mentionSources}
                      onSend={(b) => S.send(conv.id, b)} />
          )}
        </>
      )}
    </ui-sheet>
  );
}

/* ── TREE 2 — the full MessagesPage ──────────────────────────────────────── */
/* Phase 20 (sealed MOBILE COMPANION: "messages = the Messaging box's
 * ui-list/ui-text-field composition" in its responsive layout — no parallel
 * kit): isMobile stacks the two panes into ONE column (the has-conv class +
 * the shell's data-mobile stamp drive it in app.css — list when no thread is
 * open, thread when one is), and the thread gains the sidebar's own
 * "← All conversations" back control so the list stays reachable. */
export function MessagesPage({
  activeConversationId, onSetActiveConversation, onOpenMention, onOpenScoringFor,
  onOpenUserProfile, isMobile = false,
}) {
  const S = useMessaging();
  const [newOpen, setNewOpen] = useState(false);
  const conv = S.conversations.find((c) => c.id === activeConversationId) || null;
  useMarkRead(S, activeConversationId, !!conv);

  const create = (participantIds, title) => {
    // Sealed: activate the RETURNED id (an existing DM via the dedupe, or new).
    onSetActiveConversation(S.startConversation(participantIds, title));
    setNewOpen(false);
  };

  return (
    <div className={'messaging-page' + (conv ? ' has-conv' : '')}>
      <aside className="messaging-list-pane">
        <div className="messaging-list-head">
          <h2>{STR.messages}</h2>
          <ui-button variant="filled" onClick={() => setNewOpen(true)}>
            <ui-icon slot="leading">add</ui-icon>
            {STR.newBtn}
          </ui-button>
        </div>
        <ConversationList S={S} activeId={activeConversationId}
                          onPick={(id) => onSetActiveConversation(id)} />
      </aside>
      <section className="messaging-thread-pane">
        {!conv ? (
          <div className="messaging-empty">
            <ui-icon class="messaging-empty-ico">chat</ui-icon>
            <h3>{STR.emptyTitle}</h3>
            <p>{STR.emptyBody}</p>
            <ui-button variant="filled" onClick={() => setNewOpen(true)}>
              <ui-icon slot="leading">add</ui-icon>
              {STR.newConversation}
            </ui-button>
          </div>
        ) : (
          <>
            {/* Phase 20: single-column mobile — back to the list without
                losing the page (the sidebar's own control + copy). */}
            {isMobile && (
              <ui-button variant="text" class="messaging-back"
                         onClick={() => onSetActiveConversation(null)}>
                <ui-icon slot="leading">chevron_left</ui-icon>
                {STR.backAll}
              </ui-button>
            )}
            <ConvHead S={S} conv={conv} large />
            <MessageThread S={S} conv={conv}
                           onOpenMention={onOpenMention}
                           onOpenScoringFor={onOpenScoringFor}
                           onOpenUserProfile={onOpenUserProfile} />
            {conv.kind !== 'system' && (
              <Composer
                placeholder={messagePlaceholder(conversationTitle(conv, S.users, S.currentUser?.id))}
                sources={S.mentionSources}
                onSend={(b) => S.send(conv.id, b)}
              />
            )}
          </>
        )}
      </section>
      <NewConversationModal open={newOpen} users={S.users}
                            currentUserId={S.currentUser?.id}
                            onClose={() => setNewOpen(false)} onCreate={create} />
    </div>
  );
}
