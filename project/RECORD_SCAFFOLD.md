# RECORD_SCAFFOLD.md — the universal record shell

Every entity detail/edit page in the app renders through ONE component
(`RecordShell` in `record.jsx`) and ONE authoritative CSS block (the
"AUTHORITATIVE RECORD SCAFFOLD" section at the END of `styles.css`). Do not
fork per-entity layout — only pass a different `sections` config.

## Pages that build on it
- `record.stakeholder`        — read view of a stakeholder
- `record.stakeholder.edit`   — edit view
- `record.plan`               — read view of a plan
- `record.plan.edit`          — edit view
- `record.community`          — read view of a community entry
- `record.community.edit`     — edit view
- (workspaces may follow the same pattern later)

`.edit` variants change NOTHING structural — same shell, same `MetaField`
footprint; edit just swaps each field's value for an input.

## Structure (single source of truth)
```
.record-wrap                       fills workspace area, vertical stack
 ├─ .record-topbar     STATIC      back-trail · subtitle · toolbar · actions
 │                                 (flex:0 0 auto — never moves when rails toggle)
 └─ .record-body       flex row
     ├─ .record-nav    left rail   240px / 56px collapsed · section list
     ├─ .record-main   content     WHITE · flex:1 · min-width:0  ← ONLY flex column
     └─ .record-rail   right rail  240px / 56px collapsed · metadata + notes
```

## Universal rules
- **Top bar is static.** Collapsing/expanding either rail only resizes
  `.record-main`. The bar spans full width above `.record-body`.
- **Rails identical & mirrored.** 240px expanded, 56px collapsed, `--bg-2`
  surface, 16px collapse icon. Left icon ▸ / right icon ◂.
- **Three surfaces only:** rails `--bg-2` (light grey) · main `--paper-2`
  (white) · app bg `--paper`. Rail fields = white on grey; main fields = white.
- **`.record-main` is the only width-flexible region** — all content
  (prose, the single-source table, two-column, field stacks) reflows as rails
  toggle. Full-width content (`.record-table-embed`) lifts the 720px cap via
  `.record-section-body:has(.record-table-embed)`.
- **Tables inside the scaffold are LIFTED from the single-source table**
  (`.sheet-grid / .sheet-head / .sheet-cell / .sheet-row`). Never re-style or
  copy the table — reuse those classes exactly. No vertical column borders.

## ⚠️ CLEANUP TASK FOR CLAUDE CODE
`styles.css` accumulated ~40 duplicate/conflicting `.record-*` rules between
the first "Universal record scaffold" comment and the authoritative block at
end of file (rails redefined 8×, `.record-topbar` padding set 10×, backgrounds
set 5×). The authoritative end-of-file block currently WINS by cascade, so the
app renders correctly — but the dead duplicates must be physically deleted.

**Do this:** delete every `.record-*` and `.mf-*` rule that appears BEFORE the
"AUTHORITATIVE RECORD SCAFFOLD" banner, EXCEPT preserve any rule whose selector
list also contains non-record selectors (the icon-size mega-selectors that list
`.ws-tab`, `.sheet-footer`, `.app-footer`, etc., and the `.brand-bar, .nav-tabs`
background rule). Verify the scaffold still renders identically after deletion.
This was deferred from the no-build prototype because the duplicates are
interleaved with those shared rules and couldn't be excised safely there.
