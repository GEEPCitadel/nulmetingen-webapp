# Citadel Nulmetingen — Redesign port (Optie B)

Dit pakket bevat alleen de bestanden die je in je repo moet bijwerken.
Plaats ze één-op-één op dezelfde paden in je project en commit.

## Bestanden

- `src/types.ts`              — ThemeKey uitgebreid + PaletteSlug + palette in ThemeDefinition
- `src/data/assessments.ts`    — themes opgeschoond, sandCoral → roseNavy, logo-paths gefixt
- `src/main.tsx`               — extra CSS-import (styles-redesign.css)
- `src/App.tsx`                — AppShell + StudentStart + Admin + Assessment + Result redesigned
- `src/styles-redesign.css`    — NIEUW — alle redesign-styles (~33 KB)

## Brand-assets

Controleer dat `public/brand/logos/citadel-logo-{1..5}-fc.png` en
`public/brand/shapes/*.png` bestaan in je repo. Zo niet, kopieer ze uit
de design-system map.

## Aanbevolen commit-bericht

    feat(ui): port redesign — topbar shell, palette themes, score meter
    
    - Add PaletteSlug + per-theme palette ("p1".."p5") so the app
      reads --t-* tokens from a single data-theme attribute.
    - Clean palette values to handbook hexes; drop sandCoral, add
      roseNavy (P5) for lj3-hv and rainbowCream (P1) for entry/admin.
    - Rewrite AppShell: cream pill topbar with brand + chips,
      slinger ribbon, transparent main page.
    - Redesign StudentStartScreen, AdminAccessScreen, AdminScreen,
      AssessmentScreen progress sidebar, and ResultScreen score meter.
    - Add src/styles-redesign.css with foundations + per-screen rules.
