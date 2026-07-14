/* mobile.jsx — the MOBILE COMPANION's React surfaces (Phase 20; the pure
 * core + declarations live in mobile-logic.js — read its header).
 *
 * useIsMobile(): the ONE viewport probe. It reads the
 * --ui-sys-breakpoint-mobile token off the live document (tokens.css is the
 * single source; a Design-dashboard override would flow through the same
 * read) and tracks a matchMedia built from it. The shell stamps the result
 * as a data-mobile attribute on ui-app-shell, which is the ONLY selector the
 * app CSS keys on — no @media literal ever duplicates the token.
 *
 * DesktopOnlyNote: the honest note every non-companion view renders at
 * mobile widths (sealed: "everything else is desktop-web"; make-real law —
 * a desktop screen squeezed to 390px is a live-looking dead affordance).
 */
import { useEffect, useState } from 'react';
import { breakpointQuery, DESKTOP_NOTE_BODY } from './mobile-logic.js';

function readBreakpointToken() {
  try {
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--ui-sys-breakpoint-mobile');
  } catch { return ''; }
}

export function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia(breakpointQuery(readBreakpointToken()));
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return mobile;
}

export function DesktopOnlyNote({ label, onGoLists }) {
  return (
    <div className="desktop-note">
      <ui-icon size="xl" class="desktop-note-icon">dashboard</ui-icon>
      <h3 className="desktop-note-title">{label} is a desktop surface</h3>
      <p className="desktop-note-body">{DESKTOP_NOTE_BODY}</p>
      <ui-button variant="tonal" onClick={onGoLists}>Open the stakeholder list</ui-button>
    </div>
  );
}
