---
version: "1.0.0-sb"
name: "Soapbox Interface Library Spec"
description: "An AI-native design standard utilizing compressed structural grids and semantic color depth."

colors:
  accent: "#D96B43"
  accent-muted: "#F3DCD3"
  accent-rgb: "217, 107, 67"
  
  # Mapped Editorial Surfaces (7 Steps)
  bg-canvas: "#FFFFFF"          # content boards and card paper surfaces
  bg-app: "#FEFDFC"             # application core window runway
  bg-field: "#FCFBF9"           # idle form parameters & text input scopes
  bg-container: "#F8F7F3"       # navigation bars, side rails, header blocks
  bg-container-high: "#F4F3ED"  # interactive hover states and active cell pools
  border-subtle: "#F0EEE6"      # lightweight system section outlines
  border-strong: "#E8E6DE"      # structural limits & card baseline footprints

  # Mapped Editorial Ink (3 Steps)
  text-primary: "#666361"       # dense high-contrast typography
  text-muted: "#ABA9A4"         # system secondary parameters and captions
  border-divider: "#DFDDD6"     # mechanical canvas division tracks

typography:
  headline:
    fontFamily: "Georgia, ui-serif, serif"
    fontWeight: 700
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "12px"

spacing:
  base: "4px"
  xs: "2px"
  sm: "6px"
  md: "12px"
  lg: "18px"
  xl: "24px"

rounded:
  none: "0px"
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"

# Pseudo-State Component Specifications (Lifted from design.md component schemas)
components:
  button-primary:
    backgroundColor: "{colors.text-primary}"
    textColor: "{colors.bg-canvas}"
    rounded: "{rounded.xs}"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.bg-container-high}"
    textColor: "{colors.text-primary}"
  input-field:
    backgroundColor: "{colors.bg-field}"
    borderColor: "{colors.border-strong}"
    rounded: "{rounded.xs}"
    height: "40px"
  input-field-focus:
    backgroundColor: "{colors.bg-canvas}"
    borderColor: "{colors.text-primary}"
---

# Soapbox System Architectural Rules

## Layout Layer Depth Rules
To prevent layout flattening and visual bleeding across application views:
1. **Side Rails & Toolbars:** Sidebars, detail drawers, and primary top navigation wrappers must strictly bind to `{colors.bg-container}` (`#F8F7F3`) or `{colors.bg-container-high}` (`#F4F3ED`) to create layout definition.
2. **Main Canvas Scaffold:** The underlying workspace runway behind panels should rest on `{colors.bg-app}` (`#FEFDFC`).
3. **Core Record Papers:** Standalone reading blocks, data blocks, tables, and document panels must sit on `{colors.bg-canvas}` (`#FFFFFF`) to pop cleanly.
4. **Interactive Text Blocks:** Side input textareas and form fields must be styled with `{colors.bg-field}` (`#FCFBF9`) to look appropriately recessed.

## General Engineering Guardrails
- **DO** leverage absolute spacing steps (`xs` through `xl`) derived directly from the 4px base constraint.
- **DON'T** let component metrics or padding choices dynamically upscale or drift into default Tailwind configurations.