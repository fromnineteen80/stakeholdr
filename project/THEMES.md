# THEMES — token spec for the three Settings → Identity themes

The app is already tokenized on CSS custom properties in `styles.css :root`.
Implementing a theme = overriding those tokens under a `[data-theme="…"]`
attribute on the root element (set from `appConfig.theme`). NOTHING else should
hardcode colors — finish tokenizing any stray inline `color`/hex first (see
BACKEND_TODO theming note). Accent stays user-configurable (`appConfig.accent`)
in every theme.

The theme-swatch border/dot colors already in settings.jsx HINT the palette:
- Soapbox  border `--ink-3` (#7A7164), inner = paper.
- Undecideds border #7A787E (its `--ink-3`), inner #F1F1F3.
- Night Shift border #C2C0B6 (its light text), inner #52504A (raised surface).

## Token reference (Soapbox = current / default)
| token        | Soapbox  | role |
|--------------|----------|------|
| --bg         | #F2EFE7  | app background (page behind cards, list bar, explainer bar) |
| --bg-2       | #ECE8DD  | deeper bg: sidebar, footers, idx col, hovers, segmented tracks |
| --paper      | #FAF8F2  | panel paper (modals, menus, cards) |
| --paper-2    | #FFFFFF  | TRUE WHITE main content surface (table rows, fields, workspace card) |
| --ink        | #1F1A14  | near-black (reserve; most titles now use --ink-2) |
| --ink-2      | #4B4439  | titles & headers |
| --ink-3      | #7A7164  | secondary/body, tab labels, muted |
| --ink-mute   | #ADA396  | faintest (placeholders, ticks) |
| --rule       | #DCD6C8  | hairline borders |
| --rule-2     | #E8E2D2  | lighter hairline / row separators |
| row hover    | #FBF7EB  | table/menu hover (literal — tokenize as --hover) |
| selected row | #FCEFD6  | active workspace row / selection (tokenize as --selected) |

> ACTION for implementer: promote the two literals `#FBF7EB` (hover) and
> `#FCEFD6` (selected) to tokens `--hover` / `--selected` so themes can set them.

## Undecideds — true greyscale, SAME white main content
Neutral grey equivalents at the same lightness as Soapbox; `--paper-2` stays
pure white so the main content field is unchanged.
| token | value |
|-------|-------|
| --bg        | #F4F4F5 |
| --bg-2      | #E6E6E8 |
| --paper     | #FAFAFA |
| --paper-2   | #FFFFFF  (unchanged — white content) |
| --ink       | #1A1A1C |
| --ink-2     | #3F3F46  (titles) |
| --ink-3     | #7A787E  (secondary — matches the swatch border) |
| --ink-mute  | #A1A1A8 |
| --rule      | #DCDCDF |
| --rule-2    | #EAEAEC |
| --hover     | #F1F1F3 |
| --selected  | #E8E8EB |

## Night Shift — warm charcoal (Claude-style)
KEY POINT: there is no white. The "main content" surface becomes a lighter
charcoal (`--paper-2`) that sits ABOVE the page bg, inverting the light-mode
relationship (where paper-2 was lighter than bg). Three dark steps:
bg (darkest) → paper (raised) → paper-2 (content, lightest dark).
| token | value | note |
|-------|-------|------|
| --bg        | #1C1B1A | page background, list/explainer bars |
| --bg-2      | #262624 | sidebar, footers, hovers' base, segmented tracks |
| --paper     | #2A2A28 | panels/menus/modals |
| --paper-2   | #30302E | MAIN CONTENT surface (replaces white): table rows, fields, cards |
| --ink       | #F5F4EE | brightest text (reserve) |
| --ink-2     | #ECEAE0 | titles & headers (warm near-white) |
| --ink-3     | #C2C0B6 | secondary/body, tab labels (matches swatch border) |
| --ink-mute  | #908C82 | faint |
| --rule      | #3D3D3A | hairline borders |
| --rule-2    | #34342F | lighter separators |
| --hover     | #3A3A37 | row/menu hover |
| --selected  | #423E33 | selection (warm) |

### Night Shift extra care
- Status/relationship pills, priority pills, kind/issue tags: their pastel
  light-mode fills (#DDE7C2 etc.) need dark-mode variants or reduced opacity so
  text stays legible; audit `STATUSES`/PriorityPill/Tags colors.
- Map zone bands, theme circles, beaker fields, brand-icon circle: verify
  contrast.
- White `#fff` literals on selected pills/avatars: keep (they sit on accent),
  but check any `#fff` backgrounds.
- Shadows (`--shadow-card`) should deepen on dark.

## Auto-switch
`appConfig.autoNightShift` + `appConfig.nightShiftAt` (HH:MM, stored 24h):
when enabled, apply Night Shift after that local time, revert to the chosen
base theme in the morning. Manual theme pick overrides for the session.
