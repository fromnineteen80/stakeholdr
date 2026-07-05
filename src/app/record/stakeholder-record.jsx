/* stakeholder-record.jsx — PHASE 14: record.stakeholder — the PAGE-SHELL
 * stakeholder record surface, poured through the universal RecordShell
 * scaffold (sealed Record-scaffold box, guide ~3481–3606). The sealed
 * stakeholder-profile box (~601–679) rules this surface EXISTS as its own
 * thing: "It is DISTINCT from the page-shell record.stakeholder surface —
 * this one is a modal". The MODAL keeps every sealed modal route (Lists edit
 * icon / name dblclick / deep links / dot dblclick); THIS PAGE serves the
 * full-page context. Its section content is the sealed profile field set
 * (Identity · Contact · Ownership & reach · Community engagements · Notes),
 * reusing the modal's shared primitives (PRow grid, TagPills, StatusDot,
 * EngagementRow, Owners) — replace-don't-duplicate, one source per primitive.
 *
 * ROUTING (declared — the sealed record box names NO page routes): the page
 * mounts as a shell view reached through the Map scorecard's "Open record"
 * action — census B3's MAKE-REAL flag verbatim ("an explicit 'Open record'
 * action in the ui-inspector scorecard"). Back returns to the launching view.
 *
 * READ↔EDIT PARITY (the scaffold contract) with a declared edit scope:
 * MetaFields write through updateStakeholder IMMEDIATELY (the sealed
 * SampleRecord set(k,v) pattern; Done just leaves edit mode). Fields whose
 * sealed edit semantics are CASCADES owned by the StakeholderModal
 * (category→type, market→region, site, state, person/title composition,
 * issues/tags pickers, owners) stay READ-ONLY here — their MetaFields render
 * the honest disabled edit form; the modal remains the sealed full editor.
 * Editable here: the plain fields — org (an org's name mirrors org, the
 * sealed Lists inline-edit rule; a person's name is untouched), status,
 * priority, last contact, website, email, phone, X account.
 */
import { useMemo, useState } from 'react';
import { RecordShell, MetaField } from './record-shell.jsx';
import { SH_STATUS_OPTIONS, SH_PRIORITY_OPTIONS } from './record-logic.js';
import { usePersistentState, nowStamp } from '../data/store.js';
import {
  SEED_STAKEHOLDERS, SEED_SCORES, SEED_TEAM, SEED_USERS, SEED_COMMUNITY,
  SEED_WORKSPACES, SEED_STAKEHOLDER_WORKSPACES,
} from '../data/seed.js';
import { weightedCoord, statusFor } from '../data/engine.js';
import { STATE_ABBR, siteLabel } from '../data/catalogs.js';
import { useCompanyCatalogs } from '../data/company.js';
import {
  displayName, formatPhone, normalizeUrl,
} from '../../../design-system/components/stakeholder-table.js';
import {
  formatDateLong, affiliatedCommunity, stakeholderCumulativeUSD,
} from '../modals/stakeholder-logic.js';
import {
  Owners, TagPills, StatusDot, PriorityPill, EngagementRow,
} from '../modals/stakeholder-modal.jsx';

export function StakeholderRecordPage({
  stakeholderId, backLabel, onBack,
  onOpenWorkspace, onOpenCommunityEntry, onOpenUserProfile,
}) {
  const [stakeholders, setStakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const [scores] = usePersistentState('scores', SEED_SCORES);
  const [team] = usePersistentState('team', SEED_TEAM);
  const [users] = usePersistentState('users', SEED_USERS);
  const [community] = usePersistentState('community', SEED_COMMUNITY);
  const [workspaces] = usePersistentState('workspaces', SEED_WORKSPACES);
  const [stakeholderWorkspaces] = usePersistentState('stakeholderWorkspaces', SEED_STAKEHOLDER_WORKSPACES);
  const { companySites } = useCompanyCatalogs();

  const [editing, setEditing] = useState(false);

  const s = stakeholders.find((x) => x.id === stakeholderId) || null;

  /* THE ONE PERSISTENCE SEAM (the page pattern): every MetaField edit lands
   * here with an updatedAt stamp. */
  const patch = (p) => setStakeholders((prev) => prev.map((x) => (
    x.id === stakeholderId ? { ...x, ...p, updatedAt: nowStamp() } : x
  )));
  /* Sealed Lists inline-edit rule reused: for an ORG the org field mirrors
   * into name; for a person org writes alone (name untouched). */
  const setOrg = (v) => patch(s && s.isPerson ? { org: v } : { org: v, name: v });

  /* Sealed profile computations (relationship is COMPUTED, never stored). */
  const wc = s ? weightedCoord(s.id, scores || {}, team || []) : { x: 0, y: 0 };
  const relStatus = statusFor(wc.x, wc.y);
  const affil = s ? affiliatedCommunity(s.id, community || []) : [];
  const cumulative = s ? stakeholderCumulativeUSD(s.id, community || []) : 0;
  const wsList = s
    ? workspaces.filter((w) => (stakeholderWorkspaces[s.id] || []).includes(w.id))
    : [];
  const notesList = useMemo(() => (s
    ? (s.notesHistory || []).slice().sort((a, b) => (b.at || '').localeCompare(a.at || ''))
    : []), [s]);
  const userById = (id) => (users || []).find((u) => u.id === id);
  const siteOf = (id) => companySites.find((x) => x.id === id);

  if (!s) {
    /* Census-A23 grace: a stale route renders an honest empty page, never a
     * crash (the shell also guards before routing here). */
    return (
      <RecordShell
        backLabel={backLabel}
        onBack={onBack}
        pageIcon="person"
        title="Stakeholder not found"
        subtitle="Stakeholder record"
        sections={[{
          id: 'missing', label: 'Record', icon: 'person',
          render: () => <div className="muted sh-empty-line">That stakeholder no longer exists.</div>,
        }]}
      />
    );
  }

  const sections = [
    {
      id: 'identity', label: 'Identity', icon: s.isPerson ? 'person' : 'groups',
      render: (ed) => (
        <div className="record-twocol">
          <div className="record-fields">
            <MetaField label="Type" value={s.category || s.type ? `${s.category} · ${s.type}` : null} />
            <MetaField label="Organization" value={s.org} editing={ed} onChange={setOrg}
                       placeholder="e.g. City of Cedarville" />
            <MetaField label="Status" value={s.status} editing={ed} type="select"
                       options={SH_STATUS_OPTIONS} onChange={(v) => patch({ status: v })}
                       display={<StatusDot value={s.status} />} />
            <MetaField label="Priority" value={s.priority} editing={ed} type="select"
                       options={SH_PRIORITY_OPTIONS} onChange={(v) => patch({ priority: v })}
                       display={<PriorityPill value={s.priority} />} />
            <MetaField label="Last contact" value={s.lastContact} editing={ed} type="date"
                       onChange={(v) => patch({ lastContact: v })}
                       display={s.lastContact ? formatDateLong(s.lastContact) : null} />
          </div>
          {/* Cascade-owned identity fields: read-only here (the sealed
              StakeholderModal owns their cascades); the disabled edit form is
              the honest inert state. */}
          <div className="record-fields">
            <MetaField label="Market" value={s.market} editing={ed} />
            <MetaField label="Region" value={s.region} editing={ed} />
            <MetaField label="Site" value={s.site ? (siteLabel(siteOf(s.site) || {}) || null) : null} editing={ed} />
            <MetaField label="State" value={s.state ? (STATE_ABBR[s.state] || s.state) : null} editing={ed} />
            <MetaField label="Geography" value={s.geography} editing={ed} />
          </div>
        </div>
      ),
    },
    {
      id: 'contact', label: 'Contact', icon: 'mail',
      render: (ed) => (
        <div className="record-fields">
          <MetaField label="Website" value={s.url} editing={ed}
                     onChange={(v) => patch({ url: v })} placeholder="example.org"
                     display={s.url
                       ? <a className="plain-link" href={normalizeUrl(s.url)} target="_blank" rel="noopener noreferrer">{s.url}</a>
                       : null} />
          <MetaField label="Email" value={s.email} editing={ed}
                     onChange={(v) => patch({ email: v })} placeholder="name@example.org"
                     display={s.email
                       ? <a className="plain-link" href={'mailto:' + s.email}>{s.email}</a>
                       : null} />
          <MetaField label="Phone" value={s.phone} editing={ed}
                     onChange={(v) => patch({ phone: v })} placeholder="(555) 555-0100"
                     display={s.phone ? formatPhone(s.phone) : null} />
          <MetaField label="X account" value={s.xAccount} editing={ed}
                     onChange={(v) => patch({ xAccount: v })} placeholder="@handle" />
        </div>
      ),
    },
    {
      id: 'reach', label: 'Ownership & reach', icon: 'group',
      render: () => (
        <div className="record-fields">
          <MetaField label="Owners" value={(s.owners || []).length ? s.owners : null}
                     display={(
                       <Owners users={users} value={s.owners || []} readonly
                               onOpen={onOpenUserProfile
                                 ? (uid) => onOpenUserProfile(uid)
                                 : undefined} />
                     )} />
          <MetaField label="Workspaces" value={wsList.length ? wsList.map((w) => w.name) : null}
                     display={(
                       <span className="pills-inline">
                         {wsList.map((w) => onOpenWorkspace ? (
                           <ui-chip key={w.id} variant="assist"
                                    onClick={() => onOpenWorkspace(w.id)}>{w.name}</ui-chip>
                         ) : (
                           <ui-chip key={w.id} variant="tag">{w.name}</ui-chip>
                         ))}
                       </span>
                     )} />
          <MetaField label="Tags" value={s.tags} type="tags"
                     display={<TagPills values={s.tags} />} />
          <MetaField label="Issues" value={s.issues} type="tags"
                     display={<TagPills values={s.issues} />} />
        </div>
      ),
    },
    {
      id: 'community', label: 'Community engagements', icon: 'favorite',
      render: () => (
        <div className="record-community">
          <div className="profile-cumulative">
            <span className="prof-k">Cumulative committed</span>
            <span className={'profile-cumulative-val' + (cumulative > 0 ? ' is-pos' : '')}>
              ${cumulative.toLocaleString()}
            </span>
          </div>
          {affil.length === 0 ? (
            <div className="muted sh-empty-line">No community engagements linked yet.</div>
          ) : (
            /* The page has room: ALL engagements render (declared — the sealed
               5-row cap + View-all overlay is the MODAL's space compromise). */
            <div className="profile-entry-list">
              {affil.map((a) => (
                <EngagementRow key={a.id} a={a}
                               onOpen={onOpenCommunityEntry ? () => onOpenCommunityEntry(a.id) : null} />
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'notes', label: 'Notes', icon: 'notes',
      render: () => (
        notesList.length === 0 && !s.notes ? (
          <div className="muted sh-empty-line">No notes recorded.</div>
        ) : notesList.length ? (
          <div className="notes-history">
            {notesList.map((n) => {
              const by = n.by ? userById(n.by) : null;
              return (
                <div className="notes-entry" key={n.id}>
                  <div className="notes-entry-meta">
                    <span className="notes-entry-date">{n.at ? formatDateLong(n.at) : ''}</span>
                    {by ? <span className="notes-entry-by">· {by.name}</span> : null}
                  </div>
                  <div className="notes-entry-body">{n.body}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="prof-legacy-note">{s.notes}</p>
        )
      ),
    },
  ];

  return (
    <RecordShell
      backLabel={backLabel}
      onBack={onBack}
      pageIcon={s.isPerson ? 'person' : 'groups'}
      title={displayName(s) || s.name}
      subtitle={s.isPerson && s.title
        ? `${s.org} · ${s.title === 'Other' ? (s.titleOther || '') : s.title}`
        : (s.org || 'Stakeholder record')}
      editing={editing}
      onToggleEdit={() => setEditing((e) => !e)}
      sections={sections}
      railTitle="Details"
      rightRail={(
        <div className="record-rail-inner">
          <div className="record-rail-sec">
            <div className="record-rail-title-cap">Relationship</div>
            <div className="record-rail-zone">
              <ui-chip variant="zone" data-zone={relStatus}>{relStatus}</ui-chip>
              <span className="prof-coords">x {wc.x.toFixed(1)} · y {wc.y.toFixed(1)}</span>
            </div>
          </div>
          <div className="record-rail-sec">
            <div className="record-rail-title-cap">Metadata</div>
            <MetaField label="Created" value={s.createdAt ? formatDateLong(s.createdAt) : null} />
            <MetaField label="Updated" value={s.updatedAt ? formatDateLong(s.updatedAt) : null} />
            <MetaField label="Created by" value={userById(s.createdBy)?.name} />
          </div>
        </div>
      )}
    />
  );
}
