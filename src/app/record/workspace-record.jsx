/* workspace-record.jsx — PHASE 14: record.workspace — the workspace record
 * page, poured through the universal RecordShell scaffold (sealed
 * Record-scaffold box). The Setup page's sealed create/edit MODAL remains the
 * sealed quick editor (its segment→business-unit cascade lives there); this
 * page is the full-record surface with the phase-item table embed:
 * "Tables inside records embed the real table component verbatim" — the REAL
 * ui-stakeholder-table scoped to this workspace's stakeholders, with LIVE
 * wiring (row edits persist through the ONE updateStakeholder seam; the row
 * open route lands on record.stakeholder; owner-popover rows ride the I6
 * user seam) — never the SampleRecord stub form (that stubbing is sealed to
 * the dev preview only, census L2).
 *
 * ROUTING (declared — the sealed boxes name no workspace record page): a
 * quiet "Open record" ui-icon-button on the Setup workspace card (a DECLARED
 * forward-design addition to the sealed card foot, mirroring census B3's
 * scorecard action) opens this page; back returns to Workspaces.
 *
 * EDIT SCOPE (declared, mirroring record.stakeholder): Name and Scope are
 * plain fields and edit here (writes stamp updatedAt); Segment / Business
 * unit / Scope state stay read-only (the Setup modal owns their sealed
 * cascade + validation); Owners edit stays on the sealed card/modal controls.
 *
 * NOTES ROUTE (declared departure from census C3): the embed's notes-open
 * routes to record.stakeholder (whose Notes section carries the history)
 * instead of mounting a second NotesModal on this page — the sealed
 * NotesModal remains the Lists behavior; one modal, one home.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { RecordShell, MetaField } from './record-shell.jsx';
import { usePersistentState, nowStamp, cmdKeyLabel } from '../data/store.js';
import {
  SEED_STAKEHOLDERS, SEED_SCORES, SEED_TEAM, SEED_USERS, SEED_COMMUNITY,
  SEED_WORKSPACES, SEED_STAKEHOLDER_WORKSPACES,
} from '../data/seed.js';
import { weightedCoord, statusFor } from '../data/engine.js';
import { GEOGRAPHIES, US_STATES, siteLabel } from '../data/catalogs.js';
import { useCompanyCatalogs } from '../data/company.js';
import { visibleStakeholders } from '../data/workspace.js';
import { affiliatedCommunity, formatDateLong } from '../modals/stakeholder-logic.js';
import { Owners } from '../modals/stakeholder-modal.jsx';

export function WorkspaceRecordPage({
  workspaceId, backLabel, onBack,
  onOpenStakeholderRecord, onOpenCommunityEntry, onOpenUserProfile,
}) {
  const [workspaces, setWorkspaces] = usePersistentState('workspaces', SEED_WORKSPACES);
  const [stakeholders, setStakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const [stakeholderWorkspaces] = usePersistentState('stakeholderWorkspaces', SEED_STAKEHOLDER_WORKSPACES);
  const [scores] = usePersistentState('scores', SEED_SCORES);
  const [team] = usePersistentState('team', SEED_TEAM);
  const [users] = usePersistentState('users', SEED_USERS);
  const [community] = usePersistentState('community', SEED_COMMUNITY);
  const { companyCategories, companyMarkets, companySites } = useCompanyCatalogs();

  const [editing, setEditing] = useState(false);
  /* The table mounts ONLY while its section is active, so the element is
   * held as STATE (a callback ref) — a plain ref would leave the feed/listen
   * effects bound to null and the bare tag would show the component's
   * gallery sample (a live-looking fake, banned). The attach callback ALSO
   * feeds synchronously (before paint) so the sample never flashes. */
  const [tableEl, setTableEl] = useState(null);
  // Mount-bound table listeners read the live routes through refs (the
  // established sheet.jsx pattern — never a stale closure).
  const openShRef = useRef(onOpenStakeholderRecord);
  openShRef.current = onOpenStakeholderRecord;
  const openUserRef = useRef(onOpenUserProfile);
  openUserRef.current = onOpenUserProfile;
  const openCommunityRef = useRef(onOpenCommunityEntry);
  openCommunityRef.current = onOpenCommunityEntry;
  const communityRef = useRef(community);
  communityRef.current = community;
  const feedRef = useRef(null);

  const ws = workspaces.find((w) => w.id === workspaceId) || null;

  const patch = (p) => setWorkspaces((prev) => prev.map((w) => (
    w.id === workspaceId ? { ...w, ...p, updatedAt: nowStamp() } : w
  )));

  /* The sealed row mapping (identical to Lists), scoped to this workspace. */
  const rows = useMemo(() =>
    visibleStakeholders(stakeholders, stakeholderWorkspaces, workspaceId)
      .map((s) => {
        const pos = weightedCoord(s.id, scores, team);
        const perRater = scores[s.id] || {};
        return {
          ...s,
          _x: pos.x,
          _y: pos.y,
          _status: statusFor(pos.x, pos.y),
          _unscored: team.length > 0 && !team.some((m) => perRater[m.id]),
          community: affiliatedCommunity(s.id, community).map((a) => a.name),
        };
      }),
  [stakeholders, stakeholderWorkspaces, workspaceId, scores, team, community]);

  const feedTable = (el) => {
    el.catalogs = {
      CATEGORIES: companyCategories, MARKETS: companyMarkets,
      GEOGRAPHIES, US_STATES, SITES: companySites, siteLabel,
    };
    el.users = users;
    el.workspaceLabel = ws ? ws.name : '';
    el.data = rows;
  };
  feedRef.current = feedTable;
  const attachTable = (el) => {
    if (el && el !== tableEl) feedRef.current(el); // pre-paint feed on mount
    setTableEl(el);
  };

  useEffect(() => {
    if (tableEl) feedTable(tableEl);
  }, [tableEl, rows, users, ws, companyCategories, companyMarkets, companySites]);

  /* LIVE table wiring (the record embed is REAL — sealed L2 stubbing belongs
   * to the dev preview only): edits persist; opens route. */
  useEffect(() => {
    const el = tableEl;
    if (!el) return;
    const onRowChange = (e) => {
      const { id, patch: p } = e.detail;
      setStakeholders((prev) => prev.map((s) => (
        s.id === id ? { ...s, ...p, updatedAt: nowStamp() } : s
      )));
    };
    const onOpenRecord = (e) => openShRef.current?.(e.detail.id);
    const onNotesOpen = (e) => openShRef.current?.(e.detail.id);
    const onUserOpen = (e) => openUserRef.current?.(e.detail.userId);
    const onCommunityOpen = (e) => {
      const entry = (communityRef.current || []).find((c) => c.name === e.detail.name);
      if (entry && openCommunityRef.current) openCommunityRef.current(entry.id);
    };
    el.addEventListener('row-change', onRowChange);
    el.addEventListener('open-record', onOpenRecord);
    el.addEventListener('notes-open', onNotesOpen);
    el.addEventListener('user-open', onUserOpen);
    el.addEventListener('community-open', onCommunityOpen);
    return () => {
      el.removeEventListener('row-change', onRowChange);
      el.removeEventListener('open-record', onOpenRecord);
      el.removeEventListener('notes-open', onNotesOpen);
      el.removeEventListener('user-open', onUserOpen);
      el.removeEventListener('community-open', onCommunityOpen);
    };
  }, [tableEl, setStakeholders]);

  const userById = (id) => users.find((u) => u.id === id);

  if (!ws) {
    return (
      <RecordShell
        backLabel={backLabel}
        onBack={onBack}
        pageIcon="work"
        title="Workspace not found"
        subtitle="Workspace record"
        sections={[{
          id: 'missing', label: 'Record', icon: 'work',
          render: () => <div className="muted sh-empty-line">That workspace no longer exists.</div>,
        }]}
      />
    );
  }

  const sections = [
    {
      id: 'overview', label: 'Overview', icon: 'work',
      render: (ed) => (
        <div className="record-twocol">
          <div className="record-fields">
            <MetaField label="Name" value={ws.name} editing={ed}
                       onChange={(v) => patch({ name: v })} placeholder="Workspace name" />
            <MetaField label="Scope" value={ws.scope} editing={ed} type="long"
                       onChange={(v) => patch({ scope: v })}
                       placeholder="What this workspace covers…" />
          </div>
          {/* Cascade-owned fields: the Setup modal is their sealed editor. */}
          <div className="record-fields">
            <MetaField label="Segment" value={ws.segment} editing={ed}
                       display={<ui-chip variant="segment" value={ws.segment}>{ws.segment}</ui-chip>} />
            <MetaField label="Business unit" value={ws.businessUnit} editing={ed} />
            <MetaField label="Scope state" value={ws.scopeState} editing={ed} />
          </div>
        </div>
      ),
    },
    {
      id: 'stakeholders', label: 'Stakeholders', icon: 'table_rows',
      render: () => (
        <div className="record-table-embed">
          <ui-stakeholder-table ref={attachTable} kbd-label={cmdKeyLabel}></ui-stakeholder-table>
        </div>
      ),
    },
    {
      id: 'owners', label: 'Owners', icon: 'group',
      render: () => (
        <div className="record-fields">
          <MetaField label="Owners" value={(ws.owners || []).length ? ws.owners : null}
                     display={(
                       <Owners users={users} value={ws.owners || []} readonly
                               onOpen={onOpenUserProfile
                                 ? (uid) => onOpenUserProfile(uid)
                                 : undefined} />
                     )} />
          <MetaField label="Created by" value={userById(ws.createdBy)?.name} />
        </div>
      ),
    },
  ];

  return (
    <RecordShell
      backLabel={backLabel}
      onBack={onBack}
      pageIcon="work"
      title={ws.name}
      subtitle={`${ws.segment || ''}${ws.businessUnit ? ' · ' + ws.businessUnit : ''}` || 'Workspace record'}
      editing={editing}
      onToggleEdit={() => setEditing((e) => !e)}
      sections={sections}
      railTitle="Details"
      rightRail={(
        <div className="record-rail-inner">
          <div className="record-rail-sec">
            <div className="record-rail-title-cap">Metadata</div>
            <MetaField label="Stakeholders" value={String(rows.length)} />
            <MetaField label="Created" value={ws.createdAt ? formatDateLong(ws.createdAt) : null} />
            <MetaField label="Updated" value={ws.updatedAt ? formatDateLong(ws.updatedAt) : null} />
            <MetaField label="Created by" value={userById(ws.createdBy)?.name} />
          </div>
        </div>
      )}
    />
  );
}
