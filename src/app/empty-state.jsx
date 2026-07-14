/* empty-state.jsx — the SHARED per-page empty state (Phase 19, sealed
 * Demo-features box ~3899: "empty states per page" — FORWARD-DESIGN; nothing
 * sealed prescribes the composition, so this is the ONE modest pattern every
 * bare zero-data page renders: icon + one-liner + primary action, with an
 * optional secondary action).
 *
 * RULES HONORED:
 *  · Pages with SEALED empty copy keep that copy — either verbatim in place
 *    (the Map scorecard prompt, the filtered-empty muted lines) or as this
 *    component's one-liner (the Plans/Community landing zero states pass
 *    their sealed emptyText strings through unchanged).
 *  · Token-only CSS (.empty-state in app.css); real ui-* components; modest —
 *    no illustration, no oversized type.
 *  · Actions are REAL routes into each page's existing create/import flows —
 *    never a live-looking dead affordance (make-real law).
 */
export function EmptyState({
  icon, line, actionLabel, onAction, secondaryLabel, onSecondary,
}) {
  return (
    <div className="empty-state">
      <ui-icon size="xl" class="empty-state-icon">{icon}</ui-icon>
      <p className="empty-state-line muted">{line}</p>
      {(actionLabel || secondaryLabel) ? (
        <div className="empty-state-actions">
          {actionLabel ? (
            <ui-button variant="tonal" class="empty-state-action" onClick={onAction}>
              <ui-icon slot="leading" size="sm">add</ui-icon>
              {actionLabel}
            </ui-button>
          ) : null}
          {secondaryLabel ? (
            <ui-button variant="text" class="empty-state-secondary" onClick={onSecondary}>
              {secondaryLabel}
            </ui-button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
