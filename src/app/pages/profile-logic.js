/* profile-logic.js — pure logic for the sealed User profile page (record.user)
 * + the Users & People surfaces (UserListPopup / UserStack filters, the
 * EditProfileModal save merge, the removeUser cascade contract). Sealed boxes:
 * "User profile page (record.user) — hero, tabs, assignment logic"
 * (src/guide.jsx ~2774–2941) and "Users & People — user model, roles,
 * presence, avatars/stack/profile, removeUser cascade" (~2581–2773), plus the
 * App-shell box's removeUser CASCADE section (~1915–1923). Node-tested by
 * scripts/profile-test.mjs.
 *
 * DECLARED (unsealed / departures, never silent):
 *  · The removeUser cascade ships here as the PURE store transform the sealed
 *    App-shell box contracts (users · workspaces.owners · stakeholders.owners
 *    · community.owners + votes[key] · plans.owners/team/strategies[].ownerId
 *    → "" · team). The oracle exposes NO UI trigger for it (no census edge,
 *    no Settings affordance) — the transform is the sealed contract, its
 *    trigger arrives with the user-management/backend phase.
 *  · EditProfileModal STALE-REGIONS BUG: the sealed box RECOMMENDS pruning a
 *    deselected market's regions (the oracle's prune was dead code);
 *    toggleProfileMarket applies the recommended correction — regions kept
 *    only while a still-selected market offers them.
 */

/* ── sealed strings (verbatim from the boxes) ────────────────────────────── */
export const STR = {
  searchPlaceholder: 'Search…',
  filter: 'Filter',
  sort: 'Sort',
  sortBy: 'Sort by',
  clearAll: 'Clear all',
  noFilters: 'No filters for this view.',
  emptyGeneric: 'Nothing here yet.',
  emptySh: 'No stakeholder relationships.',
  editProfile: 'Edit profile',
  editProfileTitle: 'Edit profile',
  saveProfile: 'Save profile',
  cancel: 'Cancel',
  defaultTitle: 'Team member',
  manager: 'Manager',
  peopleTitle: 'People in this workspace',
  sendMessage: 'Send message',
  openStakeholder: 'Open stakeholder',
  open: 'Open',
  functionPlaceholder: 'Select a function…',
  uploadPhoto: 'Upload photo',
  replacePhoto: 'Replace photo',
  removePhoto: 'Remove',
  lastUpdated: 'Last updated',
  dateAdded: 'Date added',
};

/* Sealed TABS array (id · long label · short label). */
export const PROFILE_TABS = [
  { id: 'ws', label: 'Workspaces', short: 'Workspaces' },
  { id: 'plans', label: 'Stakeholder Engagement Plans', short: 'SEP' },
  { id: 'comm', label: 'Community Engagement', short: 'Engage' },
  { id: 'sh', label: 'Stakeholder Relationships', short: 'Relationships' },
];

/* Sealed per-tab column sets (key/label/w; filter:true = filterable). The w
 * values are the sealed grid tracks, kept as the record; the rebuilt tables
 * are token-styled <table>s (the Plans/Community landing precedent), so the
 * tracks inform min-widths only. */
export const PROFILE_COLS = {
  ws: [
    { key: 'name', label: 'Workspace', w: 'minmax(180px,1.6fr)' },
    { key: 'market', label: 'Market', w: 'minmax(120px,1fr)', filter: true },
    { key: 'region', label: 'Region', w: 'minmax(120px,1fr)', filter: true },
    { key: 'owner', label: 'Owner', w: '90px' },
  ],
  plans: [
    { key: 'name', label: 'Plan', w: 'minmax(200px,2fr)' },
    { key: 'workspace', label: 'Workspace', w: 'minmax(150px,1.3fr)', filter: true },
    { key: 'market', label: 'Market', w: 'minmax(110px,1fr)', filter: true },
    { key: 'region', label: 'Region', w: 'minmax(110px,1fr)', filter: true },
    { key: 'status', label: 'Status', w: '120px', filter: true },
  ],
  comm: [
    { key: 'name', label: 'Engagement', w: 'minmax(200px,2fr)' },
    { key: 'workspace', label: 'Workspace', w: 'minmax(150px,1.3fr)', filter: true },
    { key: 'market', label: 'Market', w: 'minmax(110px,1fr)', filter: true },
    { key: 'region', label: 'Region', w: 'minmax(110px,1fr)', filter: true },
    { key: 'status', label: 'Status', w: '120px', filter: true },
  ],
  sh: [
    { key: 'name', label: 'Stakeholder', w: 'minmax(180px,1.6fr)' },
    { key: 'type', label: 'Type', w: 'minmax(120px,1.1fr)', filter: true },
    { key: 'relationship', label: 'Relationship', w: '150px', filter: true },
    { key: 'priority', label: 'Priority', w: '110px', filter: true },
  ],
};

/* ── sealed ASSIGNMENT LOGIC (the heart of the page) ─────────────────────── */

/* A workspace counts if the user owns it OR owns / sits on the team of any
 * plan inside it. */
export function wsAssigned(user, workspaces, plans) {
  return (workspaces || []).filter((w) =>
    (w.owners || []).includes(user.id) ||
    (plans || []).some((pl) => pl.workspaceId === w.id &&
      ((pl.owners || []).includes(user.id) ||
        (pl.team || []).some((t) => t.userId === user.id))));
}

/* User owns the plan or is on its team. */
export function plansAssigned(user, plans) {
  return (plans || []).filter((pl) =>
    (pl.owners || []).includes(user.id) ||
    (pl.team || []).some((t) => t.userId === user.id));
}

/* User owns the community engagement. */
export function commAssigned(user, community) {
  return (community || []).filter((c) => (c.owners || []).includes(user.id));
}

/* Reach-through: the stakeholders inside the workspaces of the user's
 * assigned plans (via the stakeholderWorkspaces join). */
export function shAssigned(user, plans, stakeholders, stakeholderWorkspaces) {
  const mine = plansAssigned(user, plans);
  const ids = new Set();
  for (const pl of mine) {
    for (const s of stakeholders || []) {
      if (((stakeholderWorkspaces || {})[s.id] || []).includes(pl.workspaceId)) ids.add(s.id);
    }
  }
  return (stakeholders || []).filter((s) => ids.has(s.id));
}

/* ── sealed row-building helpers ─────────────────────────────────────────── */

export function wsName(workspaces, id) {
  return ((workspaces || []).find((w) => w.id === id) || {}).name || '-';
}

/* Derive a workspace's market/region coverage from its member stakeholders. */
export function wsMarketsRegions(wid, stakeholders, stakeholderWorkspaces) {
  const mk = new Set();
  const rg = new Set();
  for (const s of stakeholders || []) {
    if (((stakeholderWorkspaces || {})[s.id] || []).includes(wid)) {
      if (s.market) mk.add(s.market);
      if (s.region) rg.add(s.region);
    }
  }
  return { markets: [...mk], regions: [...rg] };
}

export function wsRows(assigned, stakeholders, stakeholderWorkspaces) {
  return assigned.map((w) => {
    const mr = wsMarketsRegions(w.id, stakeholders, stakeholderWorkspaces);
    return {
      id: w.id,
      name: w.name,
      market: mr.markets.join(', ') || '-',
      region: mr.regions.join(', ') || '-',
      _owners: w.owners || [],
      _updated: w.updatedAt || w.createdAt || '',
      _created: w.createdAt || '',
    };
  });
}

export function planRows(assigned, workspaces) {
  return assigned.map((pl) => ({
    id: pl.id,
    name: pl.title,
    workspace: wsName(workspaces, pl.workspaceId),
    market: pl.market || '-',
    region: pl.region || '-',
    status: pl.status || 'Idea',
    _updated: pl.updatedAt || pl.createdAt || '',
    _created: pl.createdAt || '',
  }));
}

/* Community rows: workspace column = the dedup'd workspace names reached
 * through the entry's linked stakeholders; status = c.stage (sealed note:
 * community uses stage where plans use status). */
export function commRows(assigned, workspaces, stakeholderWorkspaces) {
  return assigned.map((c) => {
    const names = [...new Set((c.linkedStakeholders || [])
      .flatMap((id) => (stakeholderWorkspaces || {})[id] || [])
      .map((wid) => wsName(workspaces, wid))
      .filter((n) => n !== '-'))];
    return {
      id: c.id,
      name: c.name,
      workspace: names.join(', ') || '-',
      market: (c.markets || []).join(', ') || '-',
      region: (c.regions || []).join(', ') || '-',
      status: c.stage || 'Idea',
      _updated: c.updatedAt || c.createdAt || '',
      _created: c.createdAt || '',
    };
  });
}

/* sh rows: relationship = the COMPUTED band (weightedCoord → statusFor,
 * supplied by the caller as rel(s) — engine stays single-sourced). */
export function shRows(assigned, rel, displayName) {
  return assigned.map((s) => ({
    id: s.id,
    name: displayName(s) || s.name,
    type: s.type,
    relationship: rel(s),
    priority: s.priority,
    _s: s,
    _updated: s.updatedAt || s.lastContact || s.createdAt || '',
    _created: s.createdAt || '',
  }));
}

/* ── sealed FILTERS & SORT ───────────────────────────────────────────────── */

export function distinctVals(rows, key) {
  return [...new Set(rows.map((r) => (r[key] || '').toString()).filter(Boolean))].sort();
}

/* All visible non-owner columns sort as text; the two synthetic date fields
 * append at the end. */
export function sortFieldsFor(cols) {
  return [
    ...cols.filter((c) => c.key !== 'owner')
      .map((c) => ({ key: c.key, label: c.label, type: 'text' })),
    { key: '_updated', label: STR.lastUpdated, type: 'date' },
    { key: '_created', label: STR.dateAdded, type: 'date' },
  ];
}

/* Set-based toggle into filters[col] (sealed). Returns a NEW filters map. */
export function toggleFilter(filters, col, val) {
  const cur = new Set(filters[col] || []);
  if (cur.has(val)) cur.delete(val);
  else cur.add(val);
  return { ...filters, [col]: cur };
}

/* Sealed activeFilterCount = the sum of all filter Set sizes. */
export function activeFilterCount(filters) {
  return Object.values(filters).reduce((n, set) => n + (set ? set.size : 0), 0);
}

/* Sealed VIEW PIPELINE — search (ALL visible columns) → filter → stable sort
 * by lowercased string compare. */
export function viewRows(rows, cols, q, filters, sort) {
  let out = rows;
  const ql = (q || '').toLowerCase();
  if (ql) {
    out = out.filter((r) =>
      cols.some((c) => (r[c.key] || '').toString().toLowerCase().includes(ql)));
  }
  for (const [k, set] of Object.entries(filters || {})) {
    if (set && set.size) out = out.filter((r) => set.has((r[k] || '').toString()));
  }
  if (sort && sort.key) {
    const dir = sort.dir === 'desc' ? -1 : 1;
    out = out.slice().sort((a, b) => {
      const av = (a[sort.key] || '').toString().toLowerCase();
      const bv = (b[sort.key] || '').toString().toLowerCase();
      return av < bv ? -dir : av > bv ? dir : 0;
    });
  }
  return out;
}

/* ── hero derivations ────────────────────────────────────────────────────── */

export function heroSub(user) { return (user && user.title) || STR.defaultTitle; }
export function fnLabel(user) { return (user && user.function) || '-'; }
export function isManager(user) { return !!user && user.role === 'manager'; }

/* Sealed people filter (UserStack / UserListPopup / every picker): never
 * yourself, never the system bot. */
export function peopleOthers(users, currentUserId) {
  return (users || []).filter((u) => u.id !== currentUserId && u.role !== 'system');
}

/* Sealed head text: "People · {n}" (the middle dot is the · character). */
export function peopleHead(n) { return `People · ${n}`; }

/* ── EditProfileModal (sealed Users box) ─────────────────────────────────── */

/* FIRST/LAST fallback: explicit fields, else derived from the name split. */
export function profileNameParts(user) {
  const parts = ((user && user.name) || '').split(' ').filter(Boolean);
  return {
    first: user && user.firstName != null ? user.firstName : (parts[0] || ''),
    last: user && user.lastName != null ? user.lastName : parts.slice(1).join(' '),
  };
}

/* Sealed SAVE merge — NAME IS RECOMPOSED from first+last on save. */
export function mergeProfileSave(draft) {
  const parts = ((draft && draft.name) || '').split(' ').filter(Boolean);
  const fn = draft.firstName != null && draft.firstName !== ''
    ? draft.firstName : (parts[0] || '');
  const ln = draft.lastName != null && draft.lastName !== ''
    ? draft.lastName : parts.slice(1).join(' ');
  return {
    ...draft,
    firstName: fn,
    lastName: ln,
    name: [fn, ln].filter(Boolean).join(' ').trim() || draft.name,
  };
}

/* MARKET → REGION CASCADE with the RECOMMENDED stale-regions correction:
 * deselecting a market prunes the regions no still-selected market offers. */
export function toggleProfileMarket(draft, m, marketsCatalog) {
  const cur = draft.markets || [];
  const markets = cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m];
  const offered = markets.flatMap((mm) => (marketsCatalog || {})[mm] || []);
  const regions = (draft.regions || []).filter((r) => offered.includes(r));
  return { markets, regions };
}

/* Regions selectable = the union of the SELECTED markets' regions (sealed). */
export function regionOptionsFor(markets, marketsCatalog) {
  return (markets || []).flatMap((m) => (marketsCatalog || {})[m] || []);
}

/* ── removeUser CASCADE (sealed App-shell contract, pure transform) ──────── */
export function removeUserCascade(data, userId) {
  const drop = (arr) => (arr || []).filter((id) => id !== userId);
  return {
    users: (data.users || []).filter((u) => u.id !== userId),
    workspaces: (data.workspaces || []).map((w) => ({ ...w, owners: drop(w.owners) })),
    stakeholders: (data.stakeholders || []).map((s) => ({ ...s, owners: drop(s.owners) })),
    community: (data.community || []).map((c) => {
      const votes = { ...(c.votes || {}) };
      delete votes[userId];
      return { ...c, owners: drop(c.owners), votes };
    }),
    plans: (data.plans || []).map((p) => ({
      ...p,
      owners: drop(p.owners),
      team: (p.team || []).filter((t) => t.userId !== userId),
      strategies: (p.strategies || []).map((st) =>
        st.ownerId === userId ? { ...st, ownerId: '' } : st),
    })),
    team: (data.team || []).filter((t) => t.userId !== userId),
  };
}
