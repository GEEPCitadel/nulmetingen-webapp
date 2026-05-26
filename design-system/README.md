# Citadel College — Design System

Drop this folder into the root of your website repo. Then make sure
`CLAUDE.md` and `AGENTS.md` also sit in the repo root (kopieer ze één
niveau omhoog uit deze map) zodat Claude Code, Cowork én Codex de
huisstijl-regels automatisch oppikken.

## Mapstructuur

```
design-system/
├── README.md            ← dit bestand
├── CLAUDE.md            ← kopieer naar repo-root voor Claude Code/Cowork
├── AGENTS.md            ← kopieer naar repo-root voor OpenAI Codex
├── BRAND-NOTES.md       ← merkdocument (kleuren, type, vormen, tone-of-voice)
├── brand/
│   ├── logos/           ← citadel-logo-{1..5}-fc.png (full colour) + zwart
│   ├── shapes/          ← blob, druppel, bubbel, ster, slinger-0..4
│   └── icons/           ← pijl, kleine-pijl
├── fonts/               ← Museo {300..900}, MuseoSans {300..900}, CaveatBrush
└── src/
    ├── types.ts         ← ThemeKey, PaletteSlug, ThemeDefinition (TypeScript)
    └── data/
        └── assessments.ts   ← `themes`-object met alle P1..P5 paletten
```

## Eerste keer opzetten

1. **Drop deze hele map** in de root van je website-repo.
2. **Verplaats `CLAUDE.md` en `AGENTS.md`** uit deze map naar de
   repo-root (één niveau hoger), zodat AI-tools ze automatisch lezen.
3. **Maak fonts en assets bereikbaar als statische URL's.** In
   Vite/Next-projecten:
   ```bash
   ln -s ../design-system/brand public/brand
   ln -s ../design-system/fonts public/fonts
   ```
   Of kopieer ze als je geen symlinks wilt.
4. **Importeer `themes` waar je een palet-keuze maakt:**
   ```ts
   import { themes, type ThemeKey } from "@/design-system/src/data/assessments";
   ```
   (Of voeg een path-alias toe in `tsconfig.json` zodat `@/design-system/*`
   naar deze map wijst.)

## Onderhoud

Alle wijzigingen aan kleuren, paletten of typografie horen in
**deze map** thuis — niet in losse component-styles. Zo blijft de
huisstijl op één plek beheerbaar.
