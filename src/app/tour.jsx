/* tour.jsx — the ONBOARDING TOUR surface (Phase 20, sealed Demo-features box:
 * "Coachmarks on first run; replayable from the profile menu"; BUILD-MAP:
 * ONBOARDING COACHMARKS = ui-coachmark, the registered GAP component).
 *
 * The shell owns WHEN the tour runs (first-run flag + the profile-menu
 * replay — tour-logic.js); this component owns the ONE ui-coachmark element:
 * it feeds the current step's anchor/heading/body, relays the component's
 * next/back/dismiss events to the shell, and re-measures after each step's
 * slotted body swaps (reposition() — an attribute change repositions
 * natively, but the body text lands in the same commit and can resize the
 * card after the attribute handler ran).
 *
 * Keyboard is the component's own contract (sealed-bar extension, Phase 20):
 * Esc/Skip/× dismiss, ArrowRight/ArrowLeft advance/back, Enter activates the
 * focused Next/Done. The host maps dismiss → skip-for-good, last-step next →
 * finish (both mark the flag — tour-logic).
 */
import { useEffect, useRef } from 'react';
import { useUiEvent } from './modals/stakeholder-modal.jsx';
import { TOUR_STEPS } from './tour-logic.js';

export function OnboardingTour({ step, onNext, onBack, onDismiss }) {
  const ref = useRef(null);
  const running = step != null && step >= 0 && step < TOUR_STEPS.length;
  const s = running ? TOUR_STEPS[step] : null;

  useUiEvent(ref, 'next', onNext);
  useUiEvent(ref, 'back', onBack);
  useUiEvent(ref, 'dismiss', onDismiss);

  // Re-measure once the new step's body text has committed (see header).
  useEffect(() => {
    const el = ref.current;
    if (!el || !running) return;
    const raf = requestAnimationFrame(() => el.reposition());
    return () => cancelAnimationFrame(raf);
  }, [step, running]);

  if (!s) return null;
  return (
    <ui-coachmark
      ref={ref}
      class="app-tour"
      for={s.anchor}
      step={step + 1}
      steps={TOUR_STEPS.length}
      heading={s.heading}
      open=""
    >
      {s.body}
    </ui-coachmark>
  );
}
