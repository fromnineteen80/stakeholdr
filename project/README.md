# Stakeholdr

A stakeholder mapping, scoring, and engagement-planning tool. Teams place
stakeholders on an influence/impact map, score them collaboratively, plan
engagement strategies, and track community investment — organized by workspace
(segment + business unit) with a shared master pool.

> **Status: interactive prototype.** The app runs entirely in the browser and
> persists to `localStorage`, syncing across tabs in the same browser via
> `BroadcastChannel`. It is **not yet multi-user** — see *Roadmap* below.

---

## Run / preview it

It's a static app with **no build step** (JSX is compiled in the browser via
inline Babel). To run locally, serve the folder with any static server:

```bash
# from the project root
python3 -m http.server 8080
# then open http://localhost:8080/Stakeholder%20Tool.html
```

Opening `Stakeholder Tool.html` directly off disk also works in most browsers.

### Free live demo (GitHub Pages)
Push this repo and enable **Settings → Pages → Deploy from branch (main / root)**.
The app will be live at `https://<you>.github.io/<repo>/Stakeholder%20Tool.html`,
free. A GitHub Actions workflow (added during Phase 0 of the handoff) auto-deploys
on every push to `main`.

**Demo caveat to tell clients:** in this preview each person's data lives in their
own browser. True team-wide, multi-user sync arrives when the Supabase backend is
turned on (Phase 3).

---

## How it's built

- **React 18** components written as `.jsx`, compiled in-browser by inline Babel
  (no bundler yet — a Vite migration is Phase 1 of the roadmap).
- **`styles.css`** — the entire design system (CSS variables at the top define the
  palette; never introduce colors outside them).
- **`data.js`** — seed data + taxonomies (segments, markets, categories, SEP models).
- **`store.js`** — the single persistence seam: `usePersistentState(table, seed)`
  backs every entity with localStorage + cross-tab sync. Swapping this to Supabase
  is the whole backend job.
- **`db.js`** — the documented Supabase schema, RLS policies, and realtime mapping.

### Key files / screens
`app.jsx` (shell, nav, routing) · `sheet.jsx` + `sheet-modals.jsx` (List/table) ·
`map.jsx` (influence map) · `scoring.jsx` · `plan.jsx` + `landing.jsx`
(engagement plans) · `community.jsx` + `community-modal.jsx` (community
investment) · `profiles.jsx` (stakeholder/user profiles) · `setup.jsx` ·
`settings.jsx` · `messaging.jsx` · `help.jsx` · `components.jsx` (shared UI).

---

## Roadmap (see `HANDOFF.md` for the full brief)

Execute in order:

0. **GitHub + free live preview** — push as-is, enable Pages, auto-deploy on push.
1. **Adopt React + Vite** — a *port, not a redesign*: `styles.css` copies unchanged,
   components keep identical JSX/class names, globals → ES modules. Keep the
   inline-Babel demo live until the Vite build is verified screen-by-screen.
2. **Finish design & features** — e.g. the Community editor metadata-sidebar split.
3. **Supabase + multi-user + auth** — flip a `local` ↔ `supabase` storage flag (same
   codebase), wire tables/realtime/RLS from `db.js`, and add the beta invite-code
   auth (sign up with name, email, password, and an Org Access Code).

Companion docs: **`HANDOFF.md`** (phased plan, design-preservation rules, known
risks, verify checklist) and **`BACKEND_TODO.md`** (server-side security + auth).
