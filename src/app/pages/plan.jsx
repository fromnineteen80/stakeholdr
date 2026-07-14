/* plan.jsx — the Plans page at PHASE-7 depth: LANDING (cards + table toggle,
 * sealed filters/sorts/search/footer) · EDITOR (sealed metadata rail · the
 * five PlanSection blocks · the BINDING ELEMENT-6 ROW SCHEMA table · the
 * team/factors/personas/community aside) · REVIEW (the sealed read-only
 * document). Assembled against the SKELETON TREES in the sealed box "Plan
 * page — plan elements" + the BINDING ELEMENT-6 ROW SCHEMA in "Plan
 * algorithm — sector/type model catalog"; all pure logic lives in
 * plan-logic.js (node-tested by scripts/plan-test.mjs).
 *
 * MAKE-REAL flags honored here (sealed DO-NOT-REPLICATE ledger):
 *  · goalNotes PERSISTS — set({ goalNotes: { ...notes, [g]: value } }); the
 *    oracle's two-arg set() bug (string-spread junk keys, notes never saved)
 *    is NOT replicated; scrubPlanRecord strips any imported junk keys 0–8.
 *  · PLAN DELETION exists — the oracle threaded deletePlan to a control that
 *    never rendered; the editor toolbar ships a real, confirmed Delete.
 *  · "Add strategy/tactic" is a real ui-button — the oracle's add() was dead
 *    code behind a display:none div (fresh plans could never pass the
 *    "Tactics" gate).
 *  · Element-6 membership is a REAL per-plan set (stakeholderIds[]); plans
 *    without the field read the sealed oracle baseline (the full workspace
 *    roster). Adds: from workspace / from Master (also joins the workspace) /
 *    create new (joins plan + workspace + fires the Reminders message).
 *  · NUMERIC-READOUT RULING: every Fit surface is BAND-ONLY + model-scoped
 *    "weighs" labels; the 0–100 score never renders (sort tie-break only).
 *  · Deep links are first-class props/state — no window.__* bridge.
 *
 * DECLARED RECOMPOSITIONS (never silent):
 *  · The editor's left/right asides are token-only panels, not ui-sidebar/
 *    ui-inspector: those components carry app-nav / collapse-close chrome —
 *    a close control with no reopen would be a live-looking dead affordance
 *    (banned by the make-real law). Structure and content follow the trees.
 *  · The element-6 / review / landing tables are token-styled <table>s (the
 *    scoring-matrix precedent): ui-data-table renders text-only cells and
 *    cannot host the chip/override/autocomplete cells the binding schema
 *    requires; every INTERACTIVE element inside remains a real ui-*, and
 *    clickable rows + the Fit cell carry button semantics (role="button" +
 *    tabIndex + Enter/Space activation) — never a raw button element.
 *  · The editor toolbar adds a "Review" ui-button not in the sealed toolbar
 *    order (back · title · spacer · sector · goal · Save · missing): it is
 *    the only route from the editor into the sealed read-only review mode.
 *  · All ui-menus PORTAL to document.body (the component positions in page
 *    coordinates — the shell set this precedent for the workspace menu).
 *  · PHASE 19 — PLAN → WORD/PDF EXPORT (sealed ~3895 "plan → single Word/PDF
 *    — contents specified in the Plan box"; the Plan box: "the completed plan
 *    exports to a SINGLE Word file … the element/section structure becomes
 *    the document's outline"). DECLARED PLACEMENT: the REVIEW toolbar (the
 *    review IS the sealed read-only document) carries two ui-buttons
 *    (variant text) between the title and "Edit plan" — "Export" (ui-icon
 *    download; builds the .docx via export/docx.js + the shared Phase-18 zip
 *    core and delivers through the shared downloadBlob) and "Print / Save as
 *    PDF" (ui-icon print; window.print() — PDF is the DECLARED print path:
 *    the browser's Save-as-PDF over the print stylesheet). The print sheet is
 *    a body-level PORTAL copy of the ONE PlanReviewDocument component
 *    (hidden on screen, the only thing visible in @media print) because the
 *    ui-app-shell shadow grid overflow-clips — an in-place print would cut
 *    at one viewport. Declared, not sealed: the oracle had no export code.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePersistentState, uid, nowStamp, cmdKeyLabel } from '../data/store.js';
import { weightedCoord, statusFor, STATUSES } from '../data/engine.js';
import {
  SEED_PLANS, SEED_STAKEHOLDERS, SEED_SCORES, SEED_TEAM, SEED_USERS,
  SEED_COMMUNITY, SEED_WORKSPACES, SEED_STAKEHOLDER_WORKSPACES, SEED_MESSAGES,
} from '../data/seed.js';
/* REAL as of Phase 11: the editable company sets (org goals / markets /
   sites / issues / tags) read the LIVE appConfig-with-seed-fallback seam
   (sealed present-AND-non-empty contract) — Settings edits propagate to the
   editor/review/landing live. GEOGRAPHIES/US_STATES/STATE_ABBR stay fixed
   enums (sealed). */
import {
  GEOGRAPHIES, US_STATES, STATE_ABBR, siteLabel,
} from '../data/catalogs.js';
import { useCompanyCatalogs } from '../data/company.js';
import {
  MASTER_WORKSPACE_ID, isMasterWorkspace, visibleStakeholders,
} from '../data/workspace.js';
import {
  PLAN_SECTOR_MODELS, PLAN_GOAL_MODELS, resolveSectorModel, resolveGoalModel,
  goalName, modelFormula, PLAN_STAGES, stageSlug,
  planFit, effectiveBand, overridePick, applyOverride, comparePlanRows,
  planMissing, missingReadout, newPlan, planStakeholderIds, scrubPlanRecord,
  availableCommunity, planDate, planMetaLine, reviewScenario,
  PLAN_FILTER_DEFS, PLAN_SORT_FIELDS, PLAN_EMPTY_TEXT, PLAN_FOOTER_EXPLAINER,
  PRIORITIZE_EXPLAINER_PRE, PRIORITIZE_EXPLAINER_BOLD,
  PRIORITIZE_EXPLAINER_POST, PRIORITIZE_EXPLAINER_END, PERSONAS_ADDON_NOTE,
  POLLING_ADDON_NOTE, filterPlans, sortPlans,
} from './plan-logic.js';
import { displayName } from '../../../design-system/components/stakeholder-table.js';
import {
  buildPlanDocModel, buildPlanDocx, planDocxFilename, PLAN_DOCX_MIME,
} from '../export/docx.js';
import { downloadBlob } from '../export/download.js';
// Phase 19: the shared zero-data empty state (sealed "empty states per page").
import { EmptyState } from '../empty-state.jsx';
import {
  affiliatedCommunity, communityEntryAmount, scoringNeededBody,
} from '../modals/stakeholder-logic.js';
import {
  StakeholderModal, useUiEvent, Field, TF, Sel, TA, Owners, IssueSelector,
  PriorityPill, Picker, PopMenu, UAv,
} from '../modals/stakeholder-modal.jsx';

/* Zone pill (the shared StatusPill composition — sealed single source). */
function StatusPill({ zone }) {
  return <ui-chip variant="zone" data-zone={zone}>{zone}</ui-chip>;
}

/* Goal-model "type of plan" pill (the token-driven ui-chip goal variant). */
function GoalPill({ goalModel }) {
  return <ui-chip variant="goal" value={goalModel}>{goalName(goalModel)}</ui-chip>;
}

/* Stage text (sealed PLAN_STAGE_FG: colored TEXT, no badge bg). */
function StageText({ status }) {
  return (
    <span className="plan-stage-text" data-stage={stageSlug(status)}>
      {status || 'Idea'}
    </span>
  );
}

/* Picker + PopMenu moved to their shared home (stakeholder-modal.jsx) at the
 * Community phase — both pages compose the ONE definition. */

/* ══ PLAN FIT CELL (binding element-6 schema: the override targets the FIT
 * band — band-only, ✦ suggested / ·set overridden marks, manager-only). ══ */
function FitCell({ row, canOverride, open, onOpen }) {
  const band = row.effective;
  return (
    <span
      className={'fit-cell' + (canOverride ? ' fit-cell-editable' : '')}
      id={`fit-${row.s.id}`}
      role={canOverride ? 'button' : undefined}
      tabIndex={canOverride ? 0 : undefined}
      onClick={canOverride ? (e) => { e.stopPropagation(); onOpen(); } : undefined}
      onKeyDown={canOverride ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (e.key === ' ') e.preventDefault();
          e.stopPropagation();
          onOpen();
        }
      } : undefined}
      title={canOverride ? 'Adjust Plan Fit' : undefined}
      aria-expanded={open ? 'true' : undefined}
    >
      <ui-chip variant="priority" value={band}>{band}</ui-chip>
      {row.override ? (
        <ui-tooltip>
          <span className="fit-mark fit-mark-set">·set</span>
          <span slot="content">Set by a manager - click to use the suggestion</span>
        </ui-tooltip>
      ) : (
        <ui-tooltip>
          <ui-icon size="sm" class="fit-mark fit-mark-suggest">auto_awesome</ui-icon>
          {/* RULED replacement copy — band + model-scoped labels, never the
              oracle's "{score}/100" (sealed never-a-number ruling). */}
          <span slot="content">
            Suggested · {row.fit.band} - weighs {row.fit.top.join(', ')}
          </span>
        </ui-tooltip>
      )}
    </span>
  );
}

/* The override popover (sealed prio-pop → ui-menu): non-interactive header
 * ("Suggested · {band}" + "Weighs {top}", model-scoped, band-only) · three
 * band items (effective band checked; picking the suggested band CLEARS) ·
 * the revert item when overridden. */
function FitMenu({ row, onSet, onClose }) {
  return (
    <PopMenu anchorId={`fit-${row.s.id}`} onClose={onClose} className="fit-menu">
      <div className="fit-menu-head">
        <span className="fit-menu-band">Suggested · {row.fit.band}</span>
        <span className="fit-menu-why">Weighs {row.fit.top.join(', ')}</span>
      </div>
      {['High', 'Medium', 'Low'].map((b) => (
        <ui-menu-item key={b} onClick={() => onSet(overridePick(b, row.fit.band))}>
          <ui-icon slot="icon" size="sm" class={b === row.effective ? '' : 'fit-check-off'}>
            check
          </ui-icon>
          {b}
        </ui-menu-item>
      ))}
      {row.override && (
        <ui-menu-item onClick={() => onSet(null)}>
          <ui-icon slot="icon" size="sm">auto_awesome</ui-icon>
          Use suggestion ({row.fit.band})
        </ui-menu-item>
      )}
    </PopMenu>
  );
}

/* ══ ELEMENT-6 TABLE (BINDING ROW SCHEMA — Stakeholder · Type · Relationship
 * · manual Priority · Plan Fit · Reason + Move; the sealed 4-column oracle
 * layout is superseded). Read-only in review (rows not clickable, no add). ══ */
function PlanShTable({ rows, readOnly, canOverride, fitOpenFor, onFitOpen, onRowOpen }) {
  return (
    /* Wide content scrolls inside its OWN container — the main document
       column never scrolls horizontally. */
    <div className="plan-sh-scroll">
    <table className="plan-sh-table">
      <thead>
        <tr>
          <th>Stakeholder</th>
          <th>Type</th>
          <th>Relationship</th>
          <th>Priority</th>
          <th>Plan Fit</th>
          <th className="plan-sh-reason-col">Reason + Move</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr
            key={r.s.id}
            className={readOnly ? undefined : 'plan-sh-trow'}
            title={readOnly ? undefined : 'Open stakeholder'}
            role={readOnly ? undefined : 'button'}
            tabIndex={readOnly ? undefined : 0}
            onClick={readOnly ? undefined : () => onRowOpen(r.s.id)}
            onKeyDown={readOnly ? undefined : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (e.key === ' ') e.preventDefault();
                onRowOpen(r.s.id);
              }
            }}
          >
            <td className="plan-sh-name">{displayName(r.s) || r.s.name}</td>
            <td className="muted">{r.s.type}</td>
            <td><StatusPill zone={r.zone} /></td>
            <td><PriorityPill value={r.s.priority} /></td>
            <td>
              {readOnly ? (
                <ui-chip variant="priority" value={r.effective}>{r.effective}</ui-chip>
              ) : (
                <FitCell
                  row={r}
                  canOverride={canOverride}
                  open={fitOpenFor === r.s.id}
                  onOpen={() => onFitOpen(r.s.id)}
                />
              )}
            </td>
            <td className="plan-sh-reason">
              <span className="plan-sh-reason-line">{r.fit.reason}</span>
              {/* THE MOVE (sealed) = the zone's strategy + ACTION, verbatim
                  from the 14-zone engine; the action rides a ui-tooltip on
                  the strategy text (row density stays one line). */}
              <ui-tooltip>
                <span className="plan-sh-move muted">Move: {r.move}</span>
                <span slot="content">{r.moveAction}</span>
              </ui-tooltip>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  );
}

/* ══ STRATEGIES / TACTICS (sealed shape {id, title, how, timing, ownerId};
 * the add affordance is the MAKE-REAL ui-button). ══ */
function LeadPick({ users, ownerId, onChange }) {
  const [open, setOpen] = useState(false);
  const owner = users.find((u) => u.id === ownerId);
  const candidates = users.filter((u) => u.role !== 'system');
  if (open) {
    return (
      <Picker
        autoFocus
        options={candidates.map((u) => ({ value: u.id, label: u.name, sub: u.title }))}
        placeholder="Assign lead…"
        onPick={(id) => { onChange(id); setOpen(false); }}
      />
    );
  }
  if (owner) {
    /* Assigned state: removable chip; clicking the body reopens the picker
       (sealed LeadPick state 1). ui-chip input variant emits `remove`. */
    return (
      <LeadChip owner={owner} onReopen={() => setOpen(true)} onClear={() => onChange('')} />
    );
  }
  return (
    <ui-chip variant="assist" class="lead-empty" onClick={() => setOpen(true)}>
      Assign lead…
    </ui-chip>
  );
}

function LeadChip({ owner, onReopen, onClear }) {
  const ref = useRef(null);
  useUiEvent(ref, 'remove', (e) => { e.stopPropagation(); onClear(); });
  return (
    <ui-chip ref={ref} variant="input" class="lead-chip" onClick={onReopen}>
      <ui-avatar slot="icon" size="sm" name={owner.name}></ui-avatar>
      {owner.name}
    </ui-chip>
  );
}

function Strategies({ strategies, users, onChange }) {
  const patch = (id, part) =>
    onChange(strategies.map((st) => (st.id === id ? { ...st, ...part } : st)));
  return (
    <div className="plan-strats">
      {strategies.map((st) => (
        <div className="plan-strat" key={st.id}>
          <div className="plan-strat-top">
            <TF
              label="Strategy / tactic"
              placeholder="Strategy / tactic"
              value={st.title}
              onValue={(v) => patch(st.id, { title: v })}
            />
            <ui-icon-button
              variant="standard"
              aria-label="Remove"
              onClick={() => onChange(strategies.filter((x) => x.id !== st.id))}
            >
              <ui-icon>close</ui-icon>
            </ui-icon-button>
          </div>
          <TA
            rows={2}
            placeholder="How - the action to take"
            value={st.how}
            onValue={(v) => patch(st.id, { how: v })}
          />
          <div className="plan-strat-meta">
            <span className="plan-inline-field">
              <span className="sh-lbl">Timing</span>
              <TF
                label="Timing"
                placeholder="e.g. Q1–Q2"
                value={st.timing}
                onValue={(v) => patch(st.id, { timing: v })}
              />
            </span>
            <span className="plan-inline-field">
              <span className="sh-lbl">Lead</span>
              <LeadPick
                users={users}
                ownerId={st.ownerId}
                onChange={(id) => patch(st.id, { ownerId: id })}
              />
            </span>
          </div>
        </div>
      ))}
      {/* MAKE-REAL (sealed ORACLE STUB flag): the real add affordance —
          exactly the sealed add() shape; never the hidden div. */}
      <ui-button
        variant="text"
        class="plan-add-strat"
        onClick={() => onChange([
          ...strategies,
          { id: uid('st'), title: '', how: '', timing: '', ownerId: '' },
        ])}
      >
        <ui-icon slot="leading">add</ui-icon>
        Add strategy/tactic
      </ui-button>
    </div>
  );
}

/* ══ CROSS-FUNCTIONAL TEAM (sealed PlanTeam: avatar 28 → sm token step ·
 * inline role field · ghost remove · Add Teammate ↔ autocomplete swap). ══ */
function PlanTeam({ team, users, onChange }) {
  const [adding, setAdding] = useState(false);
  const available = users.filter(
    (u) => u.role !== 'system' && !team.some((m) => m.userId === u.id));
  return (
    <div className="plan-team">
      {team.map((m) => {
        const u = users.find((x) => x.id === m.userId);
        return (
          <div className="plan-team-row" key={m.userId}>
            <ui-avatar size="sm" name={u ? u.name : ''}></ui-avatar>
            <div className="plan-team-meta">
              <span className="plan-team-name">{u ? u.name : m.userId}</span>
              <TF
                label="Role on this plan"
                placeholder="Role on this plan"
                value={m.role}
                onValue={(v) => onChange(team.map((x) =>
                  x.userId === m.userId ? { ...x, role: v } : x))}
              />
            </div>
            <ui-icon-button
              variant="standard"
              aria-label="Remove"
              onClick={() => onChange(team.filter((x) => x.userId !== m.userId))}
            >
              <ui-icon>close</ui-icon>
            </ui-icon-button>
          </div>
        );
      })}
      {adding ? (
        <Picker
          autoFocus
          options={available.map((u) => ({ value: u.id, label: u.name, sub: u.title }))}
          placeholder="Search teammates…"
          onPick={(id) => { onChange([...team, { userId: id, role: '' }]); setAdding(false); }}
        />
      ) : available.length > 0 ? (
        <ui-button variant="text" class="plan-add-inline" onClick={() => setAdding(true)}>
          <ui-icon slot="leading">add</ui-icon>
          Add Teammate
        </ui-button>
      ) : null}
    </div>
  );
}

/* ══ COMMUNITY LINKER (sealed PlanCommunity: linked rows "{name}" over
 * "{kind} · {stage} · {amount}"; add-options show kind · stage with NO
 * amount; the market+region gate notes verbatim). ══ */
function PlanCommunity({ community, market, region, communityIds, onChange }) {
  const [adding, setAdding] = useState(false);
  const linked = (communityIds || [])
    .map((id) => community.find((c) => c.id === id))
    .filter(Boolean);
  const available = availableCommunity(community, market, region, communityIds || []);
  const gated = !market || !region;
  return (
    <div className="plan-community">
      {linked.map((c) => (
        <div className="plan-comm-row" key={c.id}>
          <span className="plan-comm-main">
            <span className="plan-comm-name">{c.name}</span>
            <span className="plan-comm-sub muted">
              {c.kind} · {c.stage} · {communityEntryAmount(c)}
            </span>
          </span>
          <ui-icon-button
            variant="standard"
            aria-label="Remove"
            onClick={() => onChange((communityIds || []).filter((id) => id !== c.id))}
          >
            <ui-icon>close</ui-icon>
          </ui-icon-button>
        </div>
      ))}
      {gated ? (
        <p className="muted plan-comm-note">
          Select a market and region above to see available community investments.
        </p>
      ) : adding ? (
        available.length > 0 ? (
          <Picker
            autoFocus
            options={available.map((c) => ({
              value: c.id, label: c.name, sub: `${c.kind} · ${c.stage}`,
            }))}
            placeholder="Search community investments…"
            onPick={(id) => { onChange([...(communityIds || []), id]); setAdding(false); }}
          />
        ) : (
          <p className="muted plan-comm-note">
            No community investments available for this market and region.
          </p>
        )
      ) : (
        <ui-button variant="text" class="plan-add-inline" onClick={() => setAdding(true)}>
          <ui-icon slot="leading">add</ui-icon>
          Add Community Investment
        </ui-button>
      )}
    </div>
  );
}

/* The in-editor factor readout (the oracle's SepExplain, RENAMED per the
 * sealed naming rule): "Sector · {name}" / "Scenario · {name}" groups; every
 * factor renders its MODEL-SCOPED label + weight% + definition (the sealed
 * oracle gap — bare keys for the 14 doc-only factors — cannot occur: the
 * catalog carries a label + desc for every entry by construction). */
function FactorReadout({ sector, goal }) {
  return (
    <div className="plan-factors">
      {[['Sector', sector], ['Scenario', goal]].map(([kind, m]) => (
        <div className="plan-factor-group" key={kind}>
          <div className="plan-factor-head">{kind} · {m.name}</div>
          {m.factors.map((f) => (
            <div className="plan-factor" key={f.k}>
              <div className="plan-factor-top">
                <strong>{f.label}</strong>
                <span className="plan-factor-w">{Math.round(f.w * 100)}%</span>
              </div>
              <div className="plan-factor-desc muted">{f.desc}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/* Section shell (sealed PlanSection: numbered head + content). */
function PlanSection({ n, title, children }) {
  return (
    <div className="plan-section">
      <div className="plan-section-head">
        <span className="plan-section-n">{n}</span>
        <h3>{title}</h3>
      </div>
      {children}
    </div>
  );
}

/* ══ THE PAGE ══════════════════════════════════════════════════════════════ */
export function PlanPage({
  createNonce = 0, activeWorkspaceId = MASTER_WORKSPACE_ID, onOpenCommunityEntry,
  onOpenWorkspace, onOpenUserProfile, openPlanId = null, onConsumeOpen,
}) {
  const [plansRaw, setPlans] = usePersistentState('plans', SEED_PLANS);
  const [stakeholders, setStakeholders] = usePersistentState('stakeholders', SEED_STAKEHOLDERS);
  const [scores] = usePersistentState('scores', SEED_SCORES);
  const [team] = usePersistentState('team', SEED_TEAM);
  const [users] = usePersistentState('users', SEED_USERS);
  const [community] = usePersistentState('community', SEED_COMMUNITY);
  const [workspaces] = usePersistentState('workspaces', SEED_WORKSPACES);
  const [stakeholderWorkspaces, setStakeholderWorkspaces] =
    usePersistentState('stakeholderWorkspaces', SEED_STAKEHOLDER_WORKSPACES);
  const [, setMessages] = usePersistentState('messages', SEED_MESSAGES);

  /* Read-side migration scrub (sealed goalNotes-bug consequence). */
  const plans = useMemo(() => plansRaw.map(scrubPlanRecord), [plansRaw]);

  // currentUser = the seeded first user until the login phase (sealed order).
  const currentUser = users[0] || null;
  const isMaster = isMasterWorkspace(activeWorkspaceId);

  const [openId, setOpenId] = useState(null);
  const [mode, setMode] = useState(null); // 'edit' | 'review' | null (landing)

  /* THE ONE PERSISTENCE SEAM: every editor keystroke lands here (continuous
   * save, sealed) with an updatedAt stamp. */
  const updatePlan = (next) => {
    setPlans((prev) => prev.map((p) =>
      p.id === next.id ? { ...next, updatedAt: nowStamp() } : p));
  };

  /* MAKE-REAL plan deletion (sealed fake→make-real: the oracle threaded
   * deletePlan to no control). Confirmed in the editor toolbar. */
  const deletePlan = (id) => {
    setPlans((prev) => prev.filter((p) => p.id !== id));
    setOpenId(null);
    setMode(null);
  };

  /* CREATE via the shell's context-aware (+) — sealed addNonceFor route
   * (LandingView's onNew/newLabel were DEAD in the oracle; the shell control
   * is the real affordance). Stale-nonce guard per the established pattern.
   * Phase 19: the SAME create factored so the zero-data empty state's
   * "New plan" action is this one flow, never a duplicate. */
  const createPlan = () => {
    const p = newPlan({
      workspaces, activeWorkspaceId, isMaster,
      id: uid('plan'), now: nowStamp(),
    });
    setPlans((prev) => [p, ...prev]);
    setOpenId(p.id);
    setMode('edit');
  };
  const seenNonce = useRef(createNonce);
  useEffect(() => {
    if (createNonce > seenNonce.current) {
      seenNonce.current = createNonce;
      createPlan();
    }
  }, [createNonce]); // eslint-disable-line react-hooks/exhaustive-deps

  /* DEEP-LINK OPEN (Phase 12; census A21 FRAGILE window.__pendingPlanId →
   * this first-class seam): a shell-routed plan request (mention chip, later
   * palette/profile rows) opens that plan in REVIEW, exists-guarded (the
   * sealed bridge's own guard, kept page-side too), then consumes the seam. */
  useEffect(() => {
    if (!openPlanId) return;
    if (plans.some((p) => p.id === openPlanId)) {
      setOpenId(openPlanId);
      setMode('review');
    }
    if (onConsumeOpen) onConsumeOpen();
  }, [openPlanId]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Landing scope: a workspace sees ITS plans; Master sees all (plans are
   * one-per-workspace scoped views; sealed workspace scoping). */
  const scopedPlans = useMemo(
    () => (isMaster ? plans : plans.filter((p) => p.workspaceId === activeWorkspaceId)),
    [plans, isMaster, activeWorkspaceId]);

  const open = openId ? plans.find((p) => p.id === openId) : null;

  const wsRoster = (wsId) =>
    visibleStakeholders(stakeholders, stakeholderWorkspaces, wsId);

  const back = () => { setOpenId(null); setMode(null); };

  return (
    <div className="plan-wrap">
      {open && mode === 'edit' ? (
        <PlanEditor
          plan={open}
          users={users}
          workspaces={workspaces}
          community={community}
          scores={scores}
          team={team}
          stakeholders={stakeholders}
          roster={wsRoster(open.workspaceId)}
          currentUser={currentUser}
          onChange={updatePlan}
          onBack={back}
          onReview={() => setMode('review')}
          onDelete={() => deletePlan(open.id)}
          addStakeholderToPlan={(shId, alsoWorkspace) => {
            const rosterIds = wsRoster(open.workspaceId).map((s) => s.id);
            const cur = planStakeholderIds(open, rosterIds);
            if (!cur.includes(shId)) {
              updatePlan({ ...open, stakeholderIds: [...cur, shId] });
            }
            if (alsoWorkspace && open.workspaceId) {
              setStakeholderWorkspaces((prev) => ({
                ...prev,
                [shId]: [...new Set([...(prev[shId] || []), open.workspaceId])],
              }));
            }
          }}
          updateStakeholder={(id, patch) => {
            setStakeholders((prev) => prev.map((s) => (
              s.id === id ? { ...s, ...patch, updatedAt: nowStamp() } : s)));
          }}
          createStakeholder={(data) => {
            const id = uid('sh');
            const rec = {
              ...data,
              id,
              createdBy: currentUser ? currentUser.id : null,
              createdAt: nowStamp(),
              updatedAt: nowStamp(),
              owners: (data.owners && data.owners.length)
                ? data.owners
                : (currentUser ? [currentUser.id] : []),
            };
            setStakeholders((prev) => [rec, ...prev]);
            // Sealed: created for a plan → joins the plan AND the workspace.
            setStakeholderWorkspaces((prev) => ({
              ...prev,
              [id]: open.workspaceId ? [open.workspaceId] : [],
            }));
            setMessages((prev) => ({
              ...prev,
              'c-system': [
                ...(prev['c-system'] || []),
                {
                  id: uid('m'), from: 'u-system',
                  body: scoringNeededBody(rec.name, rec.type, rec.id),
                  at: nowStamp(), kind: 'scoring-needed',
                },
              ],
            }));
            return id;
          }}
          getWorkspacesForStakeholder={(id) =>
            workspaces.filter((w) => (stakeholderWorkspaces[id] || []).includes(w.id))}
          onOpenCommunityEntry={onOpenCommunityEntry}
          onOpenWorkspace={onOpenWorkspace}
          onOpenUserProfile={onOpenUserProfile}
        />
      ) : open && mode === 'review' ? (
        <PlanReview
          plan={open}
          users={users}
          workspaces={workspaces}
          community={community}
          scores={scores}
          team={team}
          roster={wsRoster(open.workspaceId)}
          onBack={back}
          onEdit={() => setMode('edit')}
          onOpenUserProfile={onOpenUserProfile}
        />
      ) : (
        <PlanLanding
          plans={scopedPlans}
          users={users}
          workspaces={workspaces}
          wsCount={(wsId) => wsRoster(wsId).length}
          onReview={(id) => { setOpenId(id); setMode('review'); }}
          onOpen={(id) => { setOpenId(id); setMode('edit'); }}
          onNew={createPlan}
          onOpenUserProfile={onOpenUserProfile}
        />
      )}
    </div>
  );
}

/* ══ LANDING (sealed PlanHome through the shared LandingView shell) ═══════ */
function PlanLanding({ plans, users, workspaces, wsCount, onReview, onOpen, onNew, onOpenUserProfile }) {
  const { companySites } = useCompanyCatalogs();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [sort, setSort] = useState({ key: null, dir: 'asc' });
  const [tableMode, setTableMode] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const shown = useMemo(
    () => sortPlans(filterPlans(plans, { query, filters }), sort),
    [plans, query, filters, sort]);

  const activeFilterCount = Object.values(filters).filter((v) => v && v.length).length;

  const wsOf = (p) => workspaces.find((w) => w.id === p.workspaceId);
  const siteOf = (p) => companySites.find((s) => s.id === p.site);

  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const cur = prev[key] || [];
      const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
      return { ...prev, [key]: next };
    });
  };

  /* Distinct values per filter def, over the scoped plans. */
  const valuesFor = (def) => {
    const set = new Set();
    for (const p of plans) {
      const v = def.get(p);
      for (const x of Array.isArray(v) ? v : [v]) if (x) set.add(x);
    }
    return [...set].sort();
  };

  return (
    <>
      <div className="plan-toolbar">
        <span className="plan-search">
          <ui-icon size="sm">search</ui-icon>
          <TF label="Search plans" placeholder="Search…" value={query} onValue={setQuery} />
          <span
            className="plan-kbd muted"
            title="Command palette"
          >{cmdKeyLabel}</span>
        </span>
        <ui-button
          id="plan-filter-btn"
          variant={activeFilterCount ? 'tonal' : 'text'}
          onClick={() => { setFilterOpen((v) => !v); setSortOpen(false); }}
        >
          Filter{activeFilterCount ? ` (${activeFilterCount})` : ''}
        </ui-button>
        <ui-button
          id="plan-sort-btn"
          variant={sort.key ? 'tonal' : 'text'}
          onClick={() => { setSortOpen((v) => !v); setFilterOpen(false); }}
        >
          Sort
        </ui-button>
        <ui-button
          variant={tableMode ? 'tonal' : 'text'}
          title="See all in a table"
          onClick={() => setTableMode((v) => !v)}
        >
          See all
        </ui-button>
      </div>

      {filterOpen && (
        <PopMenu anchorId="plan-filter-btn" onClose={() => setFilterOpen(false)} className="plan-pop">
          <div className="plan-pop-head">
            <strong>Filter</strong>
            <ui-button variant="text" onClick={() => setFilters({})}>Clear all</ui-button>
          </div>
          <div className="plan-pop-body">
            {PLAN_FILTER_DEFS.map((def) => {
              const values = valuesFor(def);
              if (!values.length) return null;
              return (
                <div className="plan-filter-sec" key={def.key}>
                  <span className="plan-filter-lbl">{def.label}</span>
                  <ui-chip-set>
                    {values.map((v) => (
                      <ui-chip
                        key={v}
                        variant="filter"
                        selected={(filters[def.key] || []).includes(v) ? '' : undefined}
                        onClick={() => toggleFilter(def.key, v)}
                      >{v}</ui-chip>
                    ))}
                  </ui-chip-set>
                </div>
              );
            })}
          </div>
        </PopMenu>
      )}

      {sortOpen && (
        <PopMenu anchorId="plan-sort-btn" onClose={() => setSortOpen(false)} className="plan-pop">
          <div className="plan-pop-head">
            <strong>Sort by</strong>
            <ui-button variant="text" onClick={() => setSort({ key: null, dir: 'asc' })}>
              Clear all
            </ui-button>
          </div>
          {PLAN_SORT_FIELDS.map((f) => (
            <ui-menu-item
              key={f.key}
              onClick={() => setSort((prev) => ({
                key: f.key,
                dir: prev.key === f.key && prev.dir === 'asc' ? 'desc' : 'asc',
              }))}
            >
              {sort.key === f.key ? (
                <ui-icon slot="icon" size="sm">
                  {sort.dir === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                </ui-icon>
              ) : null}
              {f.label}
            </ui-menu-item>
          ))}
        </PopMenu>
      )}

      <div className="plan-body-scroll">
        {/* Phase 19 (sealed "empty states per page"): a ZERO-DATA landing
            renders the shared actionable empty state carrying the SEALED
            emptyText verbatim; a filter/search that excludes everything
            keeps the sealed muted line (plans exist — nothing to create). */}
        {plans.length === 0 ? (
          <EmptyState
            icon="description"
            line={PLAN_EMPTY_TEXT}
            actionLabel="New plan"
            onAction={onNew}
          />
        ) : shown.length === 0 ? (
          <div className="plan-empty muted">{PLAN_EMPTY_TEXT}</div>
        ) : tableMode ? (
          <table className="plan-table">
            <thead>
              <tr>
                <th>Plan</th><th>Workspace</th><th>Type</th><th>Market</th>
                <th>Region</th><th>Site</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((p) => (
                <tr
                  key={p.id}
                  title="Open"
                  role="button"
                  tabIndex={0}
                  onClick={() => onReview(p.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      if (e.key === ' ') e.preventDefault();
                      onReview(p.id);
                    }
                  }}
                >
                  <td className="plan-td-title">{p.title}</td>
                  <td>{wsOf(p)?.name || '-'}</td>
                  <td>{goalName(p.goalModel)}</td>
                  <td>{p.market || '-'}</td>
                  <td>{p.region || '-'}</td>
                  <td>{siteOf(p) ? siteLabel(siteOf(p)) : '-'}</td>
                  <td><StageText status={p.status || 'Idea'} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="plan-grid">
            {shown.map((p) => (
              <PlanCard
                key={p.id}
                p={p}
                users={users}
                ws={wsOf(p)}
                site={siteOf(p)}
                engaged={wsCount(p.workspaceId)}
                onReview={() => onReview(p.id)}
                onOpen={() => onOpen(p.id)}
                onOpenUser={onOpenUserProfile}
              />
            ))}
          </div>
        )}
      </div>

      <div className="plan-footer">
        <span className="plan-footer-group">
          <ui-icon size="sm">description</ui-icon>
          <strong>{plans.length}</strong>&nbsp;plans
        </span>
        <span className="plan-footer-sep">·</span>
        <span className="muted plan-footer-explain">{PLAN_FOOTER_EXPLAINER}</span>
      </div>
    </>
  );
}

/* ══ PLAN CARD (sealed TREE 2 anatomy) ═══════════════════════════════════ */
function PlanCard({ p, users, ws, site, engaged, onReview, onOpen, onOpenUser }) {
  const linkedRow = (k, v) => (
    <div className="plan-linked-row">
      <span className="plan-meta-k">{k}</span>
      <span className="plan-meta-v">{v}</span>
    </div>
  );
  return (
    <ui-card variant="outlined" class="plan-card">
      <div className="plan-card-head">
        <div className="plan-card-titlewrap">
          {/* Title = a REAL text control (never a role-d span) in ui-tooltip
              per the sealed card anatomy (tooltip "Open plan"). */}
          <ui-tooltip>
            <ui-button variant="text" class="plan-card-title" onClick={onReview}>
              {p.title}
            </ui-button>
            <span slot="content">Open plan</span>
          </ui-tooltip>
          <div className="plan-card-recipient muted">{ws ? ws.name : '-'}</div>
        </div>
        <div className="plan-card-avatars" aria-label="team">
          {/* Census I6 make-real: team avatars open that user's profile. */}
          <Owners users={users} value={(p.team || []).map((m) => m.userId)} readonly
                  onOpen={onOpenUser} />
        </div>
      </div>
      <div className="plan-card-badges">
        <GoalPill goalModel={p.goalModel} />
        <span className="plan-spacer"></span>
        <StageText status={p.status || 'Idea'} />
      </div>
      <p className={'plan-card-summary' + (p.summary ? '' : ' muted')}>
        {p.summary || 'No summary written yet.'}
      </p>
      <div className="plan-linked-group">
        {(p.issues || []).length > 0 && (
          <div className="plan-linked-row">
            <span className="plan-meta-k">Issues</span>
            <span className="pills-inline">
              {p.issues.map((i) => <ui-chip variant="tag" key={i}>{i}</ui-chip>)}
            </span>
          </div>
        )}
        {linkedRow('Engaged', `${engaged} stakeholders`)}
        {linkedRow('Market', p.market || '-')}
        {linkedRow('Region', p.region || '-')}
        {linkedRow('Site', site ? siteLabel(site) : '-')}
      </div>
      <div className="plan-card-meta">
        {linkedRow('Tactics', (p.strategies || []).length ? `${p.strategies.length} deployed` : '-')}
        {linkedRow('Investments', (p.communityIds || []).length ? `${p.communityIds.length} linked` : '-')}
        {linkedRow('Segment', ws?.segment || '-')}
        {linkedRow('Unit', ws?.businessUnit || '-')}
      </div>
      <div className="plan-card-foot">
        <span className="muted">Updated {planDate(p.updatedAt || p.createdAt)}</span>
        <span className="plan-card-actions">
          <ui-button variant="text" onClick={(e) => { e.stopPropagation(); onReview(); }}>
            Review
          </ui-button>
          <ui-button variant="text" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
            Edit
          </ui-button>
        </span>
      </div>
    </ui-card>
  );
}

/* Shared element-6 row computation (editor + review read ONE derivation). */
function usePlanRows(plan, { stakeholders, roster, scores, team, community }) {
  return useMemo(() => {
    const sector = resolveSectorModel(plan.sectorModel);
    const goal = resolveGoalModel(plan.goalModel);
    const rosterIds = roster.map((s) => s.id);
    const memberIds = planStakeholderIds(plan, rosterIds);
    const ctx = { scores, team, community, planIssues: plan.issues || [] };
    const rows = memberIds
      .map((id) => stakeholders.find((s) => s.id === id))
      .filter(Boolean)
      .map((s) => {
        const wc = weightedCoord(s.id, scores, team);
        const zone = statusFor(wc.x, wc.y);
        const fit = planFit(s, sector, goal, ctx);
        const override = (plan.priorityOverrides || {})[s.id] || null;
        return {
          s, zone, fit, override,
          effective: effectiveBand(override, fit.band),
          /* THE MOVE (sealed) = zone strategy + action, verbatim from the
             engine's STATUSES (plan-type framing is PARKED — see planFit). */
          move: (STATUSES[zone] || {}).strategy || '',
          moveAction: (STATUSES[zone] || {}).action || '',
          // comparator inputs (the numeric core is INTERNAL — sort only)
          priority: s.priority, band: effectiveBand(override, fit.band), score: fit.score,
        };
      })
      .sort(comparePlanRows);
    return { rows, sector, goal };
  }, [plan, stakeholders, roster, scores, team, community]);
}

/* ══ EDITOR (sealed TREE 3) ═══════════════════════════════════════════════ */
function PlanEditor({ onOpenUserProfile,
  plan, users, workspaces, community, scores, team, stakeholders, roster,
  currentUser, onChange, onBack, onReview, onDelete,
  addStakeholderToPlan, createStakeholder, updateStakeholder,
  getWorkspacesForStakeholder, onOpenCommunityEntry, onOpenWorkspace,
}) {
  const p = plan;
  const set = (patch) => onChange({ ...p, ...patch });
  const { companyMarkets, companySites, companyIssues, companyTags,
          companyGoals } = useCompanyCatalogs();

  const missing = planMissing(p);
  const planValid = missing.length === 0;

  const { rows, sector, goal } = usePlanRows(p, { stakeholders, roster, scores, team, community });

  /* Manager gate (sealed: only role === "manager" may override Fit). */
  const canOverride = !!currentUser && currentUser.role === 'manager';
  const [fitOpenFor, setFitOpenFor] = useState(null);
  const fitRow = fitOpenFor ? rows.find((r) => r.s.id === fitOpenFor) : null;

  /* Add-stakeholder routing: 'workspace' | 'master' | null; create modal;
   * row-click profile view. */
  const [picker, setPicker] = useState(null);
  const [shModal, setShModal] = useState(null); // {mode:'create'} | {mode:'view', id}
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmRef = useRef(null);
  const pickerRef = useRef(null);

  useUiEvent(confirmRef, 'close', (e) => {
    if (e.target === confirmRef.current) setConfirmDelete(false);
  });
  useUiEvent(pickerRef, 'close', (e) => {
    if (e.target === pickerRef.current) setPicker(null);
  });

  const memberIds = planStakeholderIds(p, roster.map((s) => s.id));
  /* From this workspace: roster not yet in the plan. */
  const addableWorkspace = roster.filter((s) => !memberIds.includes(s.id));
  /* From Master (sealed): every stakeholder NOT yet in this workspace. */
  const rosterIds = roster.map((s) => s.id);
  const addableMaster = stakeholders.filter((s) => !rosterIds.includes(s.id));

  const ws = workspaces.find((w) => w.id === p.workspaceId);
  const shView = shModal && shModal.id
    ? stakeholders.find((s) => s.id === shModal.id) || null
    : null;

  /* Census C9 (sealed REAL): the profile's engagement rows open that
   * community entry's read view — the modal closes and the shell routes
   * through its community deep-link seam (onOpenCommunityEntry). Rows stay
   * honestly inert (no handler) on a host without the route. */
  const openCommunityFromModal = onOpenCommunityEntry
    ? (id) => { setShModal(null); onOpenCommunityEntry(id); }
    : undefined;

  return (
    <div className="plan-editor">
      <ui-app-bar variant="flat" class="plan-editor-bar">
        <ui-button slot="leading" variant="text" onClick={onBack}>
          <ui-icon slot="leading">chevron_left</ui-icon>
          All plans
        </ui-button>
        <span className="plan-title-field">
          <TF
            label="Plan name"
            placeholder="Insert Plan Name"
            value={p.title}
            onValue={(v) => set({ title: v })}
          />
        </span>
        {/* Sealed TREE 3 toolbar order: back · title · spacer · sector select
            · goal select · Save · missing readout (the spacer is the app-bar's
            flexing title slot). Review is the DECLARED recomposition (header);
            it sits between the sealed items without reordering them. */}
        <span slot="trailing" className="plan-model-pick">
          <Sel
            ariaLabel="Industry sector"
            value={sector.id}
            options={PLAN_SECTOR_MODELS.map((m) => ({ value: m.id, label: m.name }))}
            onChange={(v) => set({ sectorModel: v })}
          />
        </span>
        <span slot="trailing" className="plan-model-pick">
          <Sel
            ariaLabel="Type of plan"
            value={goal.id}
            options={PLAN_GOAL_MODELS.map((m) => ({ value: m.id, label: m.name }))}
            onChange={(v) => set({ goalModel: v })}
          />
        </span>
        <ui-button slot="trailing" variant="text" onClick={onReview}>
          <ui-icon slot="leading">visibility</ui-icon>
          Review
        </ui-button>
        <ui-button
          slot="trailing"
          variant="filled"
          disabled={planValid ? undefined : ''}
          title={planValid ? undefined : 'Fill required fields: ' + missing.join(', ')}
          onClick={onBack}
        >Save</ui-button>
        {!planValid && (
          <ui-tooltip slot="trailing">
            <span className="plan-missing muted">{missingReadout(missing)}</span>
            <span slot="content">{missing.join(', ')}</span>
          </ui-tooltip>
        )}
        {/* MAKE-REAL plan deletion (sealed: impossible in the oracle UI). */}
        <ui-icon-button
          slot="trailing"
          variant="standard"
          aria-label="Delete plan"
          title="Delete plan"
          onClick={() => setConfirmDelete(true)}
        >
          <ui-icon>delete</ui-icon>
        </ui-icon-button>
      </ui-app-bar>

      <div className="plan-body">
        {/* ── LEFT metadata rail (sealed field order: summary · status ·
            workspace · market · region · site · state · geography · owners ·
            issues · linked community investment; the sector/goal model picks
            live in the TOOLBAR per sealed TREE 3) ── */}
        <aside className="plan-aside">
          <Field label="One-line summary">
            <TA
              rows={2}
              placeholder="A single sentence describing this plan - shown on the plan card and review."
              value={p.summary}
              onValue={(v) => set({ summary: v })}
            />
          </Field>
          <Field label="Status">
            <Sel ariaLabel="Status" value={p.status} options={PLAN_STAGES}
                 onChange={(v) => set({ status: v })} />
          </Field>
          <Field label="Workspace">
            <Sel
              ariaLabel="Workspace"
              value={p.workspaceId || ''}
              options={workspaces.map((w) => ({ value: w.id, label: w.name }))}
              onChange={(v) => set({ workspaceId: v })}
            />
          </Field>
          <Field label="Market">
            <Sel
              ariaLabel="Market"
              value={p.market || ''}
              options={[{ value: '', label: 'Select market…' }, ...Object.keys(companyMarkets)]}
              /* Sealed MARKET RESET CASCADE: changing market RESETS region. */
              onChange={(v) => set({ market: v, region: '' })}
            />
          </Field>
          <Field label="Region">
            <Sel
              ariaLabel="Region"
              value={p.region || ''}
              options={[{ value: '', label: 'Select region…' }, ...(companyMarkets[p.market] || [])]}
              onChange={(v) => set({ region: v })}
            />
          </Field>
          <Field label="Site">
            <Sel
              ariaLabel="Site"
              value={p.site || ''}
              options={[{ value: '', label: 'None' },
                ...companySites.map((s) => ({ value: s.id, label: siteLabel(s) }))]}
              /* Sealed SITE→STATE CASCADE: a site with a state sets state. */
              onChange={(id) => {
                const s = companySites.find((x) => x.id === id);
                if (s && s.state) set({ site: id, state: s.state });
                else set({ site: id });
              }}
            />
          </Field>
          <Field label="State">
            <Sel
              ariaLabel="State"
              value={p.state || ''}
              options={[{ value: '', label: 'None' },
                ...US_STATES.map((s) => ({ value: s, label: STATE_ABBR[s] || s }))]}
              onChange={(v) => set({ state: v })}
            />
          </Field>
          <Field label="Geography">
            <Sel
              ariaLabel="Geography"
              value={p.geography || ''}
              options={[{ value: '', label: 'Select geography…' }, ...GEOGRAPHIES]}
              onChange={(v) => set({ geography: v })}
            />
          </Field>
          <div className="plan-divider"></div>
          <Field label="Owners">
            <Owners users={users} value={p.owners || []} onChange={(v) => set({ owners: v })} />
          </Field>
          <Field label="Issues">
            <IssueSelector
              selected={p.issues || []}
              company={companyIssues}
              onChange={(v) => set({ issues: v })}
            />
          </Field>
          <div className="plan-divider"></div>
          <Field label="Linked community investment">
            <PlanCommunity
              community={community}
              market={p.market}
              region={p.region}
              communityIds={p.communityIds || []}
              onChange={(v) => set({ communityIds: v })}
            />
          </Field>
        </aside>

        {/* ── MAIN document: the five sealed PlanSection blocks ── */}
        <div className="plan-main">
          <PlanSection n={1} title="Scenario & Context">
            <Field label="What this plan solves & its impact to the company">
              <TA rows={3} value={p.scenarioSolves}
                  onValue={(v) => set({ scenarioSolves: v })} />
            </Field>
            <Field label="What we plan to do - a phased approach">
              <TA rows={3} value={p.scenarioApproach}
                  onValue={(v) => set({ scenarioApproach: v })} />
            </Field>
            <Field label="The outcome we expect">
              <TA rows={3} value={p.scenarioOutcome}
                  onValue={(v) => set({ scenarioOutcome: v })} />
            </Field>
          </PlanSection>

          <PlanSection n={2} title="Aligning With Organizational Goals">
            <p className="plan-inherited-note muted">
              Inherited from your organization's goals (set in Settings). How does
              your plan align with this organizational goal and drive success or
              defend your license to operate?
            </p>
            <div className="plan-goal-list">
              {companyGoals.map((g) => (
                <div className="plan-goal-item" key={g}>
                  <div className="plan-goal-title">{g}</div>
                  {/* SEALED BUG FIX (goalNotes ORACLE BUG, do-not-replicate):
                      the note map persists CORRECTLY — one patch object. */}
                  <TA
                    rows={2}
                    placeholder="How does this plan work to achieve this goal in this workspace?"
                    value={(p.goalNotes || {})[g] || ''}
                    onValue={(v) => set({ goalNotes: { ...(p.goalNotes || {}), [g]: v } })}
                  />
                </div>
              ))}
            </div>
          </PlanSection>

          <PlanSection n={3} title="Stakeholders In This Plan">
            {rows.length === 0 ? (
              <p className="muted">No stakeholders in this plan yet. Add them below.</p>
            ) : (
              <PlanShTable
                rows={rows}
                canOverride={canOverride}
                fitOpenFor={fitOpenFor}
                onFitOpen={(id) => setFitOpenFor(id)}
                /* Census E6 (RESOLVED, Phase 13): row-click opens the sealed
                   stakeholder PROFILE — the shared modal's view mode IS that
                   profile, under the E7 one-profile-contract (Edit +
                   workspace chips + C9 rows + owner avatars all live). */
                onRowOpen={(id) => setShModal({ mode: 'view', id })}
              />
            )}
            <ui-button id="plan-add-sh-btn" variant="tonal" type="button" class="plan-add-sh">
              <ui-icon slot="leading">add</ui-icon>
              Add stakeholder
            </ui-button>
            <AddShMenu
              onPickWorkspace={() => setPicker('workspace')}
              onPickMaster={() => setPicker('master')}
              onCreate={() => setShModal({ mode: 'create' })}
            />
          </PlanSection>

          <PlanSection n={4} title="Tactics">
            <Strategies
              strategies={p.strategies || []}
              users={users}
              onChange={(v) => set({ strategies: v })}
            />
          </PlanSection>

          <PlanSection n={5} title="Measurement & Reporting">
            <TA
              rows={4}
              placeholder="Cadence, metrics, and how progress ties to the fiscal quarters…"
              value={p.measurement}
              onValue={(v) => set({ measurement: v })}
            />
          </PlanSection>
        </div>

        {/* ── RIGHT aside (sealed): team · prioritization · then the locked
            add-on stubs — Polling (element 8) · Personas (element 9). SCOPE:
            plan elements 2/5/7/10–14 beyond the shipped set (summary of
            concerns · team & sponsors · involvement/risk/opportunity ·
            execution checklist · community-investment plan · predictions ·
            key messages · feedback) land in later phases per the sealed
            phase plan. ── */}
        <aside className="plan-aside plan-aside-right">
          <Field label="Cross-functional team">
            <PlanTeam team={p.team || []} users={users} onChange={(v) => set({ team: v })} />
          </Field>
          <div className="plan-divider"></div>
          <Field label="How stakeholders are prioritized">
            <p className="plan-aside-explain muted">
              {PRIORITIZE_EXPLAINER_PRE}
              <strong>{PRIORITIZE_EXPLAINER_BOLD}</strong>
              {PRIORITIZE_EXPLAINER_POST}
              <ui-icon size="sm" class="fit-mark-suggest">auto_awesome</ui-icon>
              {PRIORITIZE_EXPLAINER_END}
            </p>
            <FactorReadout sector={sector} goal={goal} />
          </Field>
          <div className="plan-divider"></div>
          {/* Element-8 locked stub (sealed: "stub with a locked affordance,
              do not build now") — mirrors the Personas note pattern. */}
          <Field label="Polling">
            <p className="plan-addon-note muted">
              <ui-icon size="sm">lock</ui-icon>
              {POLLING_ADDON_NOTE}
            </p>
          </Field>
          <div className="plan-divider"></div>
          <Field label="Personas">
            <p className="plan-addon-note muted">
              <ui-icon size="sm">lock</ui-icon>
              {PERSONAS_ADDON_NOTE}
            </p>
          </Field>
        </aside>
      </div>

      {/* Editor footer (sealed sheet-footer anatomy). */}
      <div className="plan-footer">
        <span className="plan-footer-group">
          <ui-icon size="sm">description</ui-icon>
          <strong>{rows.length}</strong>&nbsp;stakeholders in plan
        </span>
        <span className="plan-footer-sep">·</span>
        <span>{ws ? ws.name : '-'}</span>
        <span className="plan-footer-sep">·</span>
        <span>{sector.name}</span>
        <span className="plan-spacer"></span>
        <span className="muted">Saved · {planDate(p.updatedAt)}</span>
      </div>

      {/* Fit override popover (managers only; band-only, model-scoped). */}
      {fitRow && canOverride && (
        <FitMenu
          row={fitRow}
          onSet={(band) => {
            onChange({
              ...p,
              priorityOverrides: applyOverride(p.priorityOverrides, fitRow.s.id, band),
            });
            setFitOpenFor(null);
          }}
          onClose={() => setFitOpenFor(null)}
        />
      )}

      {/* Add-from pickers (ui-dialog + the sealed-configured autocomplete). */}
      <ui-dialog ref={pickerRef} open={picker ? '' : undefined} class="plan-picker-dialog">
        {picker && (
          <>
            <span slot="headline">
              {picker === 'workspace' ? 'Add from this workspace' : 'Add from Master'}
            </span>
            <div className="plan-picker-body">
              <Picker
                autoFocus
                options={(picker === 'workspace' ? addableWorkspace : addableMaster)
                  .map((s) => ({ value: s.id, label: displayName(s) || s.name, sub: s.type }))}
                placeholder="Add existing stakeholder…"
                onPick={(id) => {
                  /* Sealed: a Master add ALSO joins the workspace. */
                  addStakeholderToPlan(id, picker === 'master');
                  setPicker(null);
                }}
              />
              {(picker === 'workspace' ? addableWorkspace : addableMaster).length === 0 && (
                <p className="muted plan-comm-note">
                  {picker === 'workspace'
                    ? 'Everyone in this workspace is already in the plan.'
                    : 'Every stakeholder is already in this workspace.'}
                </p>
              )}
            </div>
            <div slot="actions">
              <ui-button variant="text" onClick={() => setPicker(null)}>Cancel</ui-button>
            </div>
          </>
        )}
      </ui-dialog>

      {/* Create-new / row-click view (the shared sealed StakeholderModal).
          RESOLVED (Phase 13): the shared modal's VIEW MODE **is** the sealed
          StakeholderProfile — the E7 one-profile-contract holds here: Edit
          live (the view↔form flip), workspace chips navigate
          (onOpenWorkspace), C9 engagement rows route (openCommunityFromModal)
          and owner avatars open the user profile (onOpenUser). */}
      <StakeholderModal
        open={!!shModal}
        existing={shView}
        initialView={!!(shModal && shModal.mode === 'view')}
        users={users}
        currentUser={currentUser}
        companyIssues={companyIssues}
        companyTags={companyTags}
        community={community}
        scores={scores}
        team={team}
        getWorkspacesForStakeholder={getWorkspacesForStakeholder}
        onCancel={() => setShModal(null)}
        onSubmit={(data) => {
          if (shModal && shModal.id) {
            /* Row-click profile → "Edit stakeholder" flip: edits flow through
               the SAME stakeholder update seam Lists uses. */
            updateStakeholder(shModal.id, data);
          } else {
            const id = createStakeholder(data);
            addStakeholderToPlan(id, false);
          }
          setShModal(null);
        }}
        onOpenCommunity={openCommunityFromModal}
        onOpenWorkspace={onOpenWorkspace}
        onOpenUser={onOpenUserProfile}
      />

      {/* Delete confirm (sibling dialog; closes only itself). */}
      <ui-dialog ref={confirmRef} open={confirmDelete ? '' : undefined} class="plan-confirm">
        {confirmDelete && (
          <>
            <span slot="headline">Delete this plan?</span>
            <p className="plan-confirm-body">
              <strong>{p.title || 'This plan'}</strong> will be permanently removed,
              including its strategies, notes, and overrides. Stakeholders and
              community investments stay in the workspace. This cannot be undone.
            </p>
            <div slot="actions">
              <ui-button variant="text" onClick={() => setConfirmDelete(false)}>Cancel</ui-button>
              <ui-button variant="filled" tone="danger" onClick={onDelete}>Delete plan</ui-button>
            </div>
          </>
        )}
      </ui-dialog>
    </div>
  );
}

/* Add-stakeholder ui-menu (sealed three entries; portal for positioning). */
function AddShMenu({ onPickWorkspace, onPickMaster, onCreate }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.setAttribute('anchor', 'plan-add-sh-btn');
  }, []);
  return createPortal(
    <ui-menu ref={ref} class="plan-add-menu">
      <ui-menu-item onClick={onPickWorkspace}>
        <ui-icon slot="icon" size="sm">group</ui-icon>
        From this workspace
      </ui-menu-item>
      <ui-menu-item onClick={onPickMaster}>
        <ui-icon slot="icon" size="sm">list_alt</ui-icon>
        From Master
      </ui-menu-item>
      <ui-menu-item onClick={onCreate}>
        <ui-icon slot="icon" size="sm">person_add</ui-icon>
        Create new
      </ui-menu-item>
    </ui-menu>,
    document.body,
  );
}

/* ══ REVIEW (sealed TREE 4: the read-only document) ═══════════════════════ */
function PlanReview({ onOpenUserProfile,
  plan, users, workspaces, community, scores, team, roster, onBack, onEdit,
}) {
  const { companySites, companyGoals } = useCompanyCatalogs();
  const p = plan;
  const { rows, sector, goal } = usePlanRows(p, {
    stakeholders: roster, roster, scores, team, community,
  });
  const ws = workspaces.find((w) => w.id === p.workspaceId);
  const site = companySites.find((s) => s.id === p.site);

  /* PHASE 19 EXPORT (see the header ledger): the .docx is the SAME sealed
   * review document — the model maps this surface's own derivations. */
  const exportDocx = () => {
    const model = buildPlanDocModel({
      plan: p, rows, users, ws, site, companyGoals, community, sector, goal,
    });
    downloadBlob(buildPlanDocx(model), planDocxFilename(p.title), PLAN_DOCX_MIME);
  };

  const docProps = {
    p, rows, users, ws, site, community, companyGoals, sector, goal,
  };

  return (
    <div className="plan-editor">
      <ui-app-bar variant="flat" class="plan-editor-bar">
        <ui-button slot="leading" variant="text" title="All plans" onClick={onBack}>
          <ui-icon slot="leading">chevron_left</ui-icon>
          Plans
        </ui-button>
        <span className="plan-review-toolbar-title">{p.title}</span>
        {/* PHASE 19 (declared placement, header ledger): Export + the print
            path live on the REVIEW toolbar — the review IS the document. */}
        <ui-button slot="trailing" variant="text" class="plan-export-btn"
                   title="Export this plan as a Word document" onClick={exportDocx}>
          <ui-icon slot="leading">download</ui-icon>
          Export
        </ui-button>
        <ui-button slot="trailing" variant="text" class="plan-print-btn"
                   title="Print, or choose Save as PDF in the print dialog"
                   onClick={() => window.print()}>
          <ui-icon slot="leading">print</ui-icon>
          Print / Save as PDF
        </ui-button>
        <ui-button slot="trailing" variant="filled" onClick={onEdit}>
          <ui-icon slot="leading">edit</ui-icon>
          Edit plan
        </ui-button>
      </ui-app-bar>

      <div className="plan-review-body">
        <div className="plan-review-doc">
          <PlanReviewDocument {...docProps} onOpenUserProfile={onOpenUserProfile} />
        </div>
      </div>

      {/* PRINT SHEET (header ledger): a body-level portal copy of the ONE
          document component — hidden on screen; @media print shows ONLY this,
          in normal flow, so multi-page printing works (the app-shell shadow
          grid overflow-clips an in-place print to one viewport). */}
      {createPortal(
        <div className="plan-print-sheet" aria-hidden="true">
          <PlanReviewDocument {...docProps} />
        </div>,
        document.body,
      )}
    </div>
  );
}

/* The ONE review document (screen column + print sheet render THIS). */
function PlanReviewDocument({
  p, rows, users, ws, site, community, companyGoals, sector, goal,
  onOpenUserProfile,
}) {
  const linked = (p.communityIds || [])
    .map((id) => community.find((c) => c.id === id))
    .filter(Boolean);

  /* Sealed meta + scenario assemblies — the shared plan-logic derivations
   * (the Word export reads the SAME functions; replace-don't-duplicate). */
  const meta = planMetaLine(p, ws, site);
  const scenario = reviewScenario(p);

  const RS = ({ title, children }) => (
    <section className="plan-review-section">
      <h2>{title}</h2>
      {children}
    </section>
  );

  return (
    <>
          <header className="plan-review-head">
            <h1>{p.title}</h1>
            <div className="muted">{meta}</div>
            {p.summary ? <p className="plan-review-summary">{p.summary}</p> : null}
            <div className="plan-review-models">
              <GoalPill goalModel={p.goalModel} />
              <StageText status={p.status || 'Idea'} />
              <span className="plan-spacer"></span>
              {/* Census I6 make-real: owner avatars open the user profile. */}
              <Owners users={users} value={p.owners || []} readonly
                      onOpen={onOpenUserProfile} />
            </div>
            {/* The formula readout — KEPT, with the visible "SEP model" tag
                RENAMED per the sealed naming rule (tnum text, no mono). */}
            <div className="plan-algobar">
              <span className="plan-algobar-tag">Plan algorithm</span>
              <span className="plan-algobar-code">{sector.name}: {modelFormula(sector)}</span>
              <span className="plan-algobar-sep muted">·</span>
              <span className="plan-algobar-code">{goal.name}: {modelFormula(goal)}</span>
            </div>
          </header>

          <RS title="Scenario & Context">
            {scenario.length === 0 ? (
              <p className="muted">Not written yet.</p>
            ) : (
              scenario.map(([lbl, v]) => (
                <div className="plan-review-scenario" key={lbl}>
                  <span className="sh-lbl">{lbl}</span>
                  <p className="plan-review-prose">{v}</p>
                </div>
              ))
            )}
          </RS>

          <RS title="Aligning With Organizational Goals">
            {companyGoals.length === 0 ? (
              <p className="muted">No goals listed.</p>
            ) : (
              <div className="plan-goal-list">
                {companyGoals.map((g) => (
                  <div className="plan-goal-item" key={g}>
                    <div className="plan-goal-title">{g}</div>
                    {(p.goalNotes || {})[g]
                      ? <p className="plan-review-prose">{p.goalNotes[g]}</p>
                      : <p className="muted">No approach described yet.</p>}
                  </div>
                ))}
              </div>
            )}
          </RS>

          <RS title="Stakeholders In This Plan">
            {rows.length === 0 ? (
              <p className="muted">No stakeholders in this workspace.</p>
            ) : (
              <PlanShTable rows={rows} readOnly />
            )}
          </RS>

          <RS title="Cross-functional Team">
            {(p.team || []).length === 0 ? (
              <p className="muted">No team assigned.</p>
            ) : (
              <div className="plan-review-team">
                {p.team.map((m) => {
                  const u = users.find((x) => x.id === m.userId);
                  return (
                    <div className="plan-review-teamrow" key={m.userId}>
                      {/* Census I6 make-real: the teammate avatar opens that
                          user's profile. */}
                      <UAv user={u || { name: '' }} size="sm"
                           onOpen={onOpenUserProfile && u
                             ? () => onOpenUserProfile(u.id)
                             : undefined} />
                      <span className="plan-team-name">{u ? u.name : m.userId}</span>
                      <span className="muted">{m.role || (u ? u.title : '')}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </RS>

          <RS title="Tactics">
            {(p.strategies || []).length === 0 ? (
              <p className="muted">No tactics yet.</p>
            ) : (
              p.strategies.map((st) => {
                const lead = users.find((u) => u.id === st.ownerId);
                return (
                  <div className="plan-review-strat" key={st.id}>
                    <div className="plan-review-strat-title">{st.title || 'Untitled'}</div>
                    {st.how ? <p className="plan-review-prose">{st.how}</p> : null}
                    <div className="plan-review-strat-meta muted">
                      {st.timing ? <span>Timing: {st.timing}</span> : null}
                      {lead ? <span>Lead: {lead.name}</span> : null}
                    </div>
                  </div>
                );
              })
            )}
          </RS>

          <RS title="Issues">
            {(p.issues || []).length === 0 ? (
              <p className="muted">None.</p>
            ) : (
              <span className="pills-inline">
                {p.issues.map((i) => <ui-chip variant="tag" key={i}>{i}</ui-chip>)}
              </span>
            )}
          </RS>

          <RS title="Community Investment">
            {linked.length === 0 ? (
              <p className="muted">No community investments linked.</p>
            ) : (
              linked.map((c) => (
                <div className="plan-review-comm" key={c.id}>
                  {c.name} - {c.kind} · {c.stage} · {communityEntryAmount(c)}
                </div>
              ))
            )}
          </RS>

          <RS title="Measurement & Reporting">
            {String(p.measurement || '').trim()
              ? <p className="plan-review-prose">{p.measurement}</p>
              : <p className="muted">Not written yet.</p>}
          </RS>
    </>
  );
}
