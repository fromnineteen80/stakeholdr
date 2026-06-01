import { useState, useRef, useEffect, useMemo } from 'react';
import { displayName, Icon } from './components';
// Messaging - right-side sidebar AND full-page view. Both read/write the same
// conversation + message store, so a message you send in the sidebar is
// instantly visible on the page and vice-versa.

function conversationTitle(conv, users, currentUserId) {
  if (conv.kind === "system") return "Reminders";
  if (conv.title) return conv.title;
  const others = conv.participants.filter(p => p !== currentUserId);
  return others.map(p => users.find(u => u.id === p)?.name || "?").join(", ");
}

function conversationPreview(messages) {
  if (!messages || !messages.length) return { body: "No messages yet", at: null };
  const m = messages[messages.length - 1];
  return m;
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) {
    return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ───────────────────────────────────────────────────────────────────────
// Sidebar - quick conversation panel that overlays the right edge.
// ───────────────────────────────────────────────────────────────────────
export function MessagingSidebar({
  open, onClose,
  conversations, messages, users, currentUserId,
  activeConversationId, setActiveConversationId,
  sendMessage, onOpenPage
}) {
  const conv = conversations.find(c => c.id === activeConversationId);
  return (
    <>
      <div className={"side-veil" + (open ? " show" : "")} onClick={onClose} />
      <aside className={"messaging-sidebar" + (open ? " show" : "")}>
        <div className="messaging-sidebar-head">
          <div className="row" style={{ gap: 8 }}>
            <Icon name="message" />
            <strong>{conv ? "Conversation" : "Messages"}</strong>
          </div>
          <div className="row" style={{ gap: 4 }}>
            <button className="btn btn-ghost" onClick={onOpenPage} title="Open full Messages page">
              <Icon name="expand" />
            </button>
            <button className="btn btn-ghost" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
          </div>
        </div>

        {!conv ? (
          <ConversationList
            conversations={conversations}
            messages={messages}
            users={users}
            currentUserId={currentUserId}
            activeId={null}
            onPick={setActiveConversationId}
            compact
          />
        ) : (
          <>
            <button
              className="messaging-back"
              onClick={() => setActiveConversationId(null)}
            >
              ← All conversations
            </button>
            <div className="messaging-conv-head">
              <ConversationAvatars conv={conv} users={users} currentUserId={currentUserId} />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {conversationTitle(conv, users, currentUserId)}
                </div>
                <div className="muted" style={{ fontSize: 11 }}>
                  {conv.kind === "group" ? `${conv.participants.length} people · group` : "Direct message"}
                </div>
              </div>
            </div>
            <MessageThread
              conversation={conv}
              messages={messages[conv.id] || []}
              users={users}
              currentUserId={currentUserId}
            />
            <Composer
              onSend={(body) => sendMessage(conv.id, body)}
              placeholder="Reply…"
            />
          </>
        )}
      </aside>
    </>
  );
}

// ───────────────────────────────────────────────────────────────────────
// Full page - list on left, thread on right, with new-group button.
// ───────────────────────────────────────────────────────────────────────
export function MessagingPage({
  conversations, messages, users, currentUserId,
  activeConversationId, setActiveConversationId,
  sendMessage, startConversation
}) {
  const [newOpen, setNewOpen] = useState(false);
  const conv = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="messaging-page">
      <aside className="messaging-list-pane">
        <div className="messaging-list-head">
          <h2>Messages</h2>
          <button className="btn btn-primary" onClick={() => setNewOpen(true)}>
            <Icon name="plus" /> New
          </button>
        </div>
        <ConversationList
          conversations={conversations}
          messages={messages}
          users={users}
          currentUserId={currentUserId}
          activeId={activeConversationId}
          onPick={setActiveConversationId}
        />
      </aside>

      <section className="messaging-thread-pane">
        {!conv ? (
          <div className="messaging-empty">
            <Icon name="message" />
            <h3>Select a conversation</h3>
            <p className="muted">Or start a new one. Group messages let you bring in multiple teammates.</p>
            <button className="btn btn-primary" onClick={() => setNewOpen(true)}>
              <Icon name="plus" /> New conversation
            </button>
          </div>
        ) : (
          <>
            <div className="messaging-page-head">
              <ConversationAvatars conv={conv} users={users} currentUserId={currentUserId} large />
              <div style={{ minWidth: 0, flex: 1 }}>
                <h3 style={{ margin: 0, fontFamily: "var(--serif)", fontWeight: 500, fontSize: 18 }}>
                  {conversationTitle(conv, users, currentUserId)}
                </h3>
                <div className="muted" style={{ fontSize: 12 }}>
                  {conv.kind === "group"
                    ? `${conv.participants.length} people · ` + conv.participants.map(p => users.find(u=>u.id===p)?.name || "?").join(", ")
                    : "Direct message"
                  }
                </div>
              </div>
            </div>
            <MessageThread
              conversation={conv}
              messages={messages[conv.id] || []}
              users={users}
              currentUserId={currentUserId}
            />
            <Composer
              onSend={(body) => sendMessage(conv.id, body)}
              placeholder={"Message " + conversationTitle(conv, users, currentUserId)}
            />
          </>
        )}
      </section>

      {newOpen && (
        <NewConversationModal
          users={users}
          currentUserId={currentUserId}
          onClose={() => setNewOpen(false)}
          onCreate={(participants, title) => {
            const id = startConversation(participants, title);
            setActiveConversationId(id);
            setNewOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ── Shared pieces ──────────────────────────────────────────────────────
function ConversationList({ conversations, messages, users, currentUserId, activeId, onPick, compact }) {
  const ordered = [...conversations].sort((a, b) => {
    // System conversation always pinned to top
    if (a.kind === "system") return -1;
    if (b.kind === "system") return 1;
    const am = messages[a.id]?.[messages[a.id]?.length - 1]?.at || "0";
    const bm = messages[b.id]?.[messages[b.id]?.length - 1]?.at || "0";
    return bm.localeCompare(am);
  });
  return (
    <div className={"conv-list" + (compact ? " compact" : "")}>
      {ordered.map(conv => {
        const preview = conversationPreview(messages[conv.id]);
        const fromUser = users.find(u => u.id === preview.from);
        const isActive = conv.id === activeId;
        const isSystem = conv.kind === "system";
        // For system conv, count unread "scoring-needed" messages
        const pending = isSystem ? (messages[conv.id] || []).filter(m => m.kind === "scoring-needed").length : 0;
        return (
          <button
            key={conv.id}
            className={"conv-row" + (isActive ? " active" : "") + (isSystem ? " system" : "")}
            onClick={() => onPick(conv.id)}
          >
            {isSystem ? (
              <span className="av av-system" style={{ width: 28, height: 28, fontSize: 11 }}>
                <Icon name="sparkle" className="brand-glyph" />
              </span>
            ) : (
              <ConversationAvatars conv={conv} users={users} currentUserId={currentUserId} />
            )}
            <div className="conv-row-body">
              <div className="conv-row-top">
                <span className="conv-row-title">
                  {isSystem ? "Reminders" : conversationTitle(conv, users, currentUserId)}
                </span>
                <span className="conv-row-time">
                  {pending > 0 ? <span className="conv-row-pending">{pending}</span> : formatTime(preview.at)}
                </span>
              </div>
              <div className="conv-row-preview">
                {isSystem
                  ? (pending > 0 ? `${pending} stakeholder${pending===1?"":"s"} need scoring` : "All caught up")
                  : `${fromUser && fromUser.id !== currentUserId ? `${fromUser.name.split(" ")[0]}: ` : ""}${preview.body}`}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function ConversationAvatars({ conv, users, currentUserId, large }) {
  const others = conv.participants.filter(p => p !== currentUserId);
  const size = large ? 36 : 28;
  if (others.length === 0) return null;
  if (others.length === 1 || conv.kind === "direct") {
    const u = users.find(x => x.id === others[0]);
    return u ? <Avatar user={u} size={size} online={u.presence === "online"} /> : null;
  }
  return (
    <span className="conv-multi-avatar" style={{ width: size, height: size }}>
      {others.slice(0, 2).map((id, i) => {
        const u = users.find(x => x.id === id);
        if (!u) return null;
        return <Avatar key={id} user={u} size={Math.round(size * 0.7)} />;
      })}
    </span>
  );
}

function MessageThread({ conversation, messages, users, currentUserId }) {
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: "end" });
  }, [messages.length]);
  if (messages.length === 0) {
    return (
      <div className="thread-empty muted">
        No messages yet. Say hello.
      </div>
    );
  }
  return (
    <div className="message-thread">
      {messages.map((m, i) => {
        const author = users.find(u => u.id === m.from);
        const isMine = m.from === currentUserId;
        const prev = messages[i - 1];
        const grouped = prev && prev.from === m.from && (new Date(m.at) - new Date(prev.at)) < 60000;
        return (
          <div key={m.id} className={"msg" + (isMine ? " mine" : "") + (grouped ? " grouped" : "")}>
            {!grouped && !isMine && author && (
              <Avatar user={author} size={26} />
            )}
            {grouped && !isMine && <span style={{ width: 26, flex: "0 0 26px" }} />}
            <div className="msg-body">
              {!grouped && (
                <div className="msg-meta">
                  <span className="msg-author">{isMine ? "You" : author?.name || "?"}</span>
                  <span className="msg-time">{formatTime(m.at)}</span>
                </div>
              )}
              <div className="msg-bubble">{renderMentions(m.body)}</div>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}

// Mention triggers: @ stakeholders · / workspaces · # plans · $ community.
// Inserts a parseable token; rendered as a clickable chip → read-only page.
const MENTION_TRIGGERS = {
  "@": { type: "stk", src: "stakeholders" },
  "/": { type: "wsp", src: "workspaces" },
  "#": { type: "pln", src: "plans" },
  "$": { type: "cmy", src: "community" }
};

// Turn {{type:id|label}} tokens into clickable chips that open read-only pages.
function renderMentions(body) {
  if (!body || body.indexOf("{{") === -1) return body;
  const out = [];
  const re = /\{\{(stk|wsp|pln|cmy):([^|}]+)\|([^}]*)\}\}/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(body))) {
    if (m.index > last) out.push(body.slice(last, m.index));
    const type = m[1], id = m[2], label = m[3];
    out.push(
      <button key={k++} type="button" className={"mention-chip t-" + type}
        onClick={() => window.__openMention && window.__openMention(type, id)}>
        <span className="mention-dot" />{label}
      </button>
    );
    last = re.lastIndex;
  }
  if (last < body.length) out.push(body.slice(last));
  return out;
}

function Composer({ onSend, placeholder }) {
  const [text, setText] = useState("");
  const [mq, setMq] = useState(null); // { trigger, query, start }
  const [hi, setHi] = useState(0);
  const taRef = useRef(null);

  function go(e) {
    e?.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText(""); setMq(null);
  }

  const sources = (window.__mentionSources && window.__mentionSources()) || {};
  const labelFor = (t, o) => {
    if (t === "stk") return (displayName(o) || o.name);
    if (t === "pln") return o.title;
    if (t === "wsp") return o.name;
    return o.name;
  };
  const matches = (() => {
    if (!mq) return [];
    const cfg = MENTION_TRIGGERS[mq.trigger];
    const list = sources[cfg.src] || [];
    const q = mq.query.toLowerCase();
    return list
      .map(o => ({ id: o.id, label: labelFor(cfg.type, o) }))
      .filter(o => o.label && (!q || o.label.toLowerCase().includes(q)))
      .slice(0, 6)
      .map(o => ({ ...o, type: cfg.type }));
  })();

  function onType(e) {
    const v = e.target.value;
    setText(v);
    const caret = e.target.selectionStart;
    const upto = v.slice(0, caret);
    const m = upto.match(/([@/#$])([\w .'-]*)$/);
    if (m) { setMq({ trigger: m[1], query: m[2], start: caret - m[0].length }); setHi(0); }
    else setMq(null);
  }

  function pick(o) {
    if (!mq) return;
    const token = `{{${o.type}:${o.id}|${o.label}}}`;
    const before = text.slice(0, mq.start);
    const after = text.slice(taRef.current.selectionStart);
    setText(before + token + " " + after);
    setMq(null);
    setTimeout(() => taRef.current && taRef.current.focus(), 0);
  }

  return (
    <form className="composer" onSubmit={go}>
      <div className="composer-field">
        <textarea
          ref={taRef}
          value={text}
          onChange={onType}
          placeholder={placeholder || "Write a message…"}
          rows={1}
          onKeyDown={e => {
            if (mq && matches.length) {
              if (e.key === "ArrowDown") { e.preventDefault(); setHi(h => (h + 1) % matches.length); return; }
              if (e.key === "ArrowUp") { e.preventDefault(); setHi(h => (h - 1 + matches.length) % matches.length); return; }
              if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); pick(matches[hi]); return; }
              if (e.key === "Escape") { setMq(null); return; }
            }
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(); }
          }}
        />
        {mq && matches.length > 0 && (
          <div className="mention-pop">
            {matches.map((o, i) => (
              <button key={o.id} type="button" className={"mention-opt" + (i === hi ? " on" : "")}
                onMouseDown={ev => { ev.preventDefault(); pick(o); }}>
                <span className={"mention-dot t-" + o.type} />{o.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="btn btn-primary" type="submit" disabled={!text.trim()}>
        Send
      </button>
    </form>
  );
}

function NewConversationModal({ users, currentUserId, onClose, onCreate }) {
  const [picked, setPicked] = useState([]);
  const [title, setTitle] = useState("");
  const others = users.filter(u => u.id !== currentUserId);
  function toggle(id) {
    setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }
  const isGroup = picked.length > 1;
  return (
    <>
      <div className="modal-veil show" onClick={onClose} />
      <div className="modal">
        <div className="modal-head">
          <h2>New conversation</h2>
          <button className="btn btn-ghost" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        <div className="modal-body">
          <div className="login-field">
            <span className="lbl">{isGroup ? "Group name (optional)" : "Title (optional)"}</span>
            <input
              value={title} onChange={e => setTitle(e.target.value)}
              placeholder={isGroup ? "EMEA pre-meeting" : ""}
            />
          </div>
          <div className="login-field">
            <span className="lbl">Add people (type to search)</span>
            <div className="ws-owner-control" style={{ padding: "4px 8px" }}>
              <UserAutocomplete
                users={others.filter(u => !picked.includes(u.id))}
                value={null}
                onChange={(id) => { if (id) toggle(id); }}
                placeholder="Start typing a name or title…"
              />
            </div>
            {picked.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {picked.map(id => {
                  const u = others.find(x => x.id === id);
                  if (!u) return null;
                  return (
                    <span key={id} className="picked-chip" onClick={() => toggle(id)}>
                      <Avatar user={u} size={20} />
                      <span>{u.name}</span>
                      <span className="picked-chip-x">×</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
          <div className="login-field">
            <span className="lbl">Or pick from the list</span>
            <div className="user-picker">
              {others.map(u => (
                <label key={u.id} className={"user-picker-row" + (picked.includes(u.id) ? " picked" : "")}>
                  <input type="checkbox" checked={picked.includes(u.id)} onChange={() => toggle(u.id)} />
                  <Avatar user={u} size={28} online={u.presence === "online"} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: 12.5 }}>{u.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{u.title}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button
            className="btn btn-primary"
            disabled={picked.length === 0}
            onClick={() => onCreate(picked, title.trim() || null)}
          >
            Start conversation
          </button>
        </div>
      </div>
    </>
  );
}

