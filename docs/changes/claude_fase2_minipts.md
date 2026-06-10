# Fase 2 — Itembouw deel 1: mini-PT's (Claude)

Status: gebouwd 10-06-2026, conform `claude_fase2_toetsmatrijs.md` (reviewbesluiten Pim). Reviewkeuzes deze sessie: ontwerp mini-PT's akkoord; 21D-verdeling 0,5 + 0,5 + 1.

## Wat is gebouwd

Alle nieuwe items zijn `compound-single-choice` in `nulmetingen_selected_response_herontwerp_v3.json` (schemaVersion → v3.8), automatisch gescoord via de bestaande compound-motor. Per versie nu 12 items in het meerkeuzeblok (10 SR + 2 mini-PT's).

### 1. Mini-PT feed (21B, 2×1 pt, variabel blok, vraag 11)

`{versie}-minipt-feed-21b-v1`. Nagebootste feed (nieuw mockuptype `feedMockup`, 4 posts: gesponsord/aanbevolen/neutraal/klasgenoot). Deelvraag A: herken het aandachtsmechanisme (tijdsdruk/schaarste/klikdruk). Deelvraag B: waarom rangschikt het algoritme zo (verdienmodel/personalisatie). Per versie eigen app en scenario (parallelvormen): SnapGram (lj1-vmbo), Klikr (lj1-hv), Stories+ (lj3-vmbo), Looply (lj3-hv).

### 2. Mini-PT "Wie bepaalt?" (23C, 2×1 pt, variabel blok, vraag 12)

`lj1{v,h}-minipt-23c-gezichtsherkenning-v1`: school wil gezichtsherkenning bij de ingang. A: wie beslissen mee (medezeggenschap). B: risico (gevoelige gegevens lekken/misbruik).
`lj3{v,h}-minipt-23c-verkiezingen-v1`: aanbevelingsalgoritme toont eenzijdige politieke filmpjes vóór verkiezingen. A: hoe komt dat (personalisatie). B: risico (eenzijdig beeld beïnvloedt stemgedrag).
Nieuw mockuptype `caseCard` (casuskaart).

### 3. Uitbreiding AI-simulatie (21D, vraag 9: 1 pt → 2 pt, anker)

Alle vier vraag 9-items (`*-vraag9-ai-*`, itemVersion v4 → v5) kregen Deelvraag C "bronvermelding" (1 pt): vermelden dat AI is gebruikt; afleiders: AI-tekst als eigen werk presenteren, AI als feitelijke bron noemen. lj3-vmbo (stagebrief): eerlijkheidsvariant. A+B blijven 0,5 pt.

## Codewijzigingen

- `src/data/assessments.server.ts`: context-types `feedMockup`/`caseCard` + mockup-mapping; check 10 → 12 items per versie; compound-schermtitel niet langer hardcoded "AI-chat".
- `src/types.ts`: `MockupCard.feedPosts`.
- `src/items/InteractionTaskView.tsx`: `FeedMockupView` (telefoonframe met feedposts incl. gesponsord-label) en `CaseCardView`; dubbele kop bij compound-items met één scherm verborgen.

## Scoring/totalen

- 21B: 2 → 4 meetpunten · 21D: 1 → 2 pt · 23C: 1 → 3 meetpunten.
- maxScore per versie: 36 → 41 (wordt 38 na inkorten PT2/PT6 en overige fase 2-stappen).
- anchorStatus nieuwe items: `variable-slot`; parallelvarianten per slot volgen bij de itembankuitbreiding.

## Nog open in fase 2

PT9 maaktaak, ±7 nieuwe SR-items + parallelvarianten, herschrijven bestaande SR-items (3–4 opties + taligheidsnorm), inkorten PT2/PT6, leesbaarheidscheck in `npm test`.
