# Citadel College — instructies voor Claude Code

Deze repo gebruikt het **Citadel College design system**. Voordat je
ook maar één regel UI-code schrijft, lees je `design-system/BRAND-NOTES.md`
en deze instructies. Geen uitzonderingen.

---

## 1. Mapindeling

Plaats het design system zo in de repo (of pas de paden hieronder aan):

```
design-system/
├── BRAND-NOTES.md          ← merkdocument, leidend
├── brand/
│   ├── logos/              ← citadel-logo-{1..5}-fc.png (full colour) + zwart
│   ├── shapes/             ← blob, druppel, bubbel, ster, slinger-0..4
│   └── icons/              ← pijl, kleine-pijl
├── fonts/                  ← Museo-{300..900}.otf, MuseoSans-*, CaveatBrush
└── src/
    ├── types.ts            ← ThemeKey, PaletteSlug, ThemeDefinition
    └── data/
        └── assessments.ts  ← themes-object (P1..P5 palettes als objecten)
```

Bij een Vite/Next-project hoort `brand/` en `fonts/` in `public/` zodat
ze als statische assets serveren onder `/brand/...` en `/fonts/...`.

---

## 2. Harde regels (niet onderhandelbaar)

1. **Vijf paletten — P1 t/m P5.** Eén palet per pagina, sectie of spread.
   Nooit kleuren uit verschillende paletten op één pagina mengen.
   *"Hou het rustig. Geen kermis."* — Brandbook §3.4.
2. **Geen losse kleuren verzinnen.** Alle kleurwaarden komen uit
   `design-system/src/data/assessments.ts` (`themes`-object) of uit de
   CSS-variabelen die daaruit gegenereerd worden (`--t-primary`,
   `--t-secondary`, `--t-panel`, `--t-accent`, `--t-slinger`).
3. **Typografie**: Museo Sans 900 voor display/koppen, Museo Light (300)
   voor body. Caveat Brush **alleen** voor quotes en speelse accenten,
   nooit voor UI-tekst of knoppen.
4. **Taal**: Nederlands, je-vorm (uitzondering: formele brieven),
   sentence case in koppen, geen emoji tenzij expliciet gevraagd.
5. **Vormtaal**: organische "blobs", swooshes en stippen uit
   `brand/shapes/`. Knoppen pill-shaped (border-radius 999px). Foto's
   en panelen radius ≥ 24px. Géén harde 4px-corners zoals in een
   generieke admin-UI.
6. **AI-design-tropen verboden**: paarse gradients, glassmorphism,
   neon-glows, "card met linkerrand-accentkleur", emoji als iconografie,
   gegenereerde SVG-illustraties. Gebruik de bestaande shape-PNG's.

---

## 3. Een paletkeuze toepassen

Elke pagina kiest één `ThemeKey` uit `src/data/assessments.ts`:

```ts
import { themes, type ThemeKey } from "@/data/assessments";

const themeKey: ThemeKey = "limeTeal";          // P4
const t = themes[themeKey];
```

Daarna schrijf je de palet-velden naar CSS-variabelen op de root van
de pagina, zodat álle nested componenten ze automatisch oppikken:

```tsx
<main
  data-theme={t.palette}            /* "p1".."p5" — handig voor scoped CSS */
  style={{
    "--t-primary":   t.primary,
    "--t-secondary": t.secondary,
    "--t-tertiary":  t.tertiary,
    "--t-panel":     t.panel,
    "--t-accent":    t.accent,
    "--t-slinger":   `url(${t.ribbon})`,
  } as React.CSSProperties}
>
  <img src={t.logo} alt="Citadel College" />
  …
</main>
```

In CSS:

```css
.hero        { background: var(--t-panel); }
.hero h1     { color: var(--t-primary); }
.btn-primary { background: var(--t-accent); color: #fff; border-radius: 999px; }
.ribbon      { background-image: var(--t-slinger); }
```

**Nooit** `themes.limeTeal.primary` direct in JSX hard-coden — altijd via
de CSS-variabele. Dat maakt palet-wissels één regel werk.

---

## 4. De vijf paletten in het kort

| Key            | Palette | Logo                       | Sfeer                                  |
|----------------|---------|----------------------------|-----------------------------------------|
| `limeTeal`     | P4      | `citadel-logo-4-fc.png`    | lime · teal · cyaan · crème             |
| `skyOrange`    | P3      | `citadel-logo-3-fc.png`    | lichtblauw · teal · oker · oranje       |
| `mintCoral`    | P2      | `citadel-logo-2-fc.png`    | mint · bruin · geel · rood              |
| `roseNavy`     | P5      | `citadel-logo-5-fc.png`    | roze · teal · donkerblauw               |
| `magentaPlum`  | P1      | `citadel-logo-1-fc.png`    | oker · zand · geel · magenta · paars    |

Welk palet je kiest voor een sectie: vraag de gebruiker, of kies op basis
van toon (P4 jong/energiek, P5 ingetogen/zakelijk, P1 warm/uitnodigend).

---

## 5. Fonts laden

```css
@font-face {
  font-family: "Museo Sans";
  src: url("/fonts/MuseoSans-300.otf") format("opentype");
  font-weight: 300;
  font-display: swap;
}
/* idem voor 500, 700, 900 + Museo (serif) + CaveatBrush-Regular.ttf */

:root {
  --font-display: "Museo Sans", system-ui, sans-serif;
  --font-body:    "Museo Sans", system-ui, sans-serif;
  --font-quote:   "Caveat Brush", cursive;
}

h1, h2, h3   { font-family: var(--font-display); font-weight: 900; }
body         { font-family: var(--font-body); font-weight: 300; }
blockquote   { font-family: var(--font-quote); }
```

Museo is licentiefont (exljbris) — niet via een CDN serveren, alleen
self-hosted vanuit `/fonts/`. Caveat Brush is OFL en mag van Google Fonts
als dat eenvoudiger is.

---

## 6. Wat te doen bij onduidelijkheid

- Welk palet hoort bij deze pagina? → **Vraag de gebruiker.**
- Bestaat hier al een component voor? → **Zoek eerst in `design-system/`
  en in de bestaande codebase**, kopieer en pas aan. Begin niet from
  scratch.
- Heeft de gebruiker een asset niet aangeleverd? → **Plaats een
  placeholder met de juiste afmeting en `data-placeholder="…"`** en
  meld het in je antwoord. Verzin nooit een SVG-illustratie.
- Geen icoon beschikbaar? → Gebruik `brand/icons/pijl.png` voor CTA's,
  anders een neutrale Lucide- of Phosphor-icoon op weight 1.5.

---

## 7. Checklist vóór je een PR opent

- [ ] Eén palet per route/pagina (geen P3-rood naast P4-teal).
- [ ] Alle kleuren via `var(--t-…)` of `themes[key].…`, geen losse hexes.
- [ ] Museo Sans laadt, body is 300, koppen zijn 900.
- [ ] Knoppen zijn pill (radius 999px), niet rechthoekig.
- [ ] Logo's en shapes komen uit `brand/`, geen gegenereerde SVG's.
- [ ] Geen emoji, geen paarse gradients, geen glassmorphism.
- [ ] Tekst in het Nederlands, je-vorm, sentence case.
- [ ] Contrast getest (Museo Light op kleurvlakken is risicovol —
      gebruik dan weight 500+ of donkergrijs #3C3C3C).
