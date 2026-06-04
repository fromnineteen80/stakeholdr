# Canonical UI — un-branded, token-driven web components

A real component library that covers what MD3 offered, fills the blanks MD3 left,
carries **no Material branding**, and is structured so that an AI model implements
**canonically** instead of vibing out a lookalike that doesn't quite work.

## Why the earlier attempts fell short

`docs/design/interfacelibrary.html` + `design.md` imitated MD3 on the wrong substrate:
Tailwind CDN + hand-rolled `.sb-*` CSS, a private token vocabulary that never bridged to
real component variables, and "lifted" specs re-implemented as bespoke CSS. There was
nothing canonical for a model to obey, so each pass re-derived the look and drifted into
clunky patchwork. This system removes that freedom.

## The three laws

1. **Real components.** Genuine custom elements (shadow DOM, real states + a11y). You
   assemble screens from them; you never reimplement one in markup/CSS.
2. **One styling surface.** The `--ui-sys-*` token layer is the *only* legal place a visual
   decision lives. No component stylesheet, no utility classes, no inline color/size.
   Re-skin everything by editing tokens — see `preview.html`'s live editor.
3. **The manifest is binding.** `manifest.json` is the machine-readable contract: every
   component, its tag, props, states, and the exact tokens it consumes. An AI building a
   screen *reads the manifest and assembles real elements* — there is no room to invent.

## Layout

```
design-system/
  tokens.css            Tier 1 (--ui-ref-*) + Tier 2 (--ui-sys-*). The contract.
  manifest.json         Machine-readable component registry + MD3 coverage map.
  components/
    button.js           <ui-button> — the REFERENCE component. Sets the bar.
  preview.html          Standalone previewable skeleton + live token editor.
```

Open `preview.html` directly (no build needed) or serve `design-system/` to Pages.

## Coverage target

- **Native (MD3 parity):** button, icon-button, fab, select, menu, radio, checkbox, switch,
  slider, text-field, chip, dialog, list, tabs, divider, progress, ripple, focus-ring.
- **Gap-fill (MD3 left these off the web):** data-table, chart, app-bar, nav-rail,
  nav-drawer, tooltip, snackbar, autocomplete, date-picker, mobile-sheet, mobile-bottom-bar.

## Build-out (agent fan-out, once this contract is blessed)

Token contract is frozen first (done). Then components fan out in parallel, each cloning the
`<ui-button>` bar and registering itself in `manifest.json`. A reconcile pass keeps the
preview and manifest in sync.
