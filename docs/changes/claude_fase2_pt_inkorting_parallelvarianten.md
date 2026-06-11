# Fase 2 — Itembouw deel 4: PT1/PT4 ingekort, parallelvarianten, lj3-differentiatie (Claude)

Status: gebouwd 11-06-2026, vervolg op `claude_fase2_sr_herschikking.md`. Besluit Pim deze sessie: PT1/PT4 inkorten conform matrijs; daarna parallelvarianten en lj3-differentiatie.

## PT1 en PT4 ingekort (matrijs: PT1 = 3, PT4 = 2)

- PT1 (bestanden, actieve v3-specs in `withV3PerformanceTasks`): 4 → 3 scoringsonderdelen per versie. Vervallen onderdeel is steeds het onderdeel dat al impliciet door andere onderdelen werd afgedekt (lj1-vmbo: vakmappen-guard; lj1-hv: hoofdmap, zit in submappad; lj3-vmbo: "newest", dubbel met "name"; lj3-hv: mapstructuur, zit in plaatsingspaden).
- PT4 (Excel): beide vragen van 2 → 1 punt; beide contexten (sorteren én filteren) blijven = 2 meetpunten.
- `fileTaskItem` en `excelTaskItem` berekenen punten nu uit taken/vragen i.p.v. hardcoded 4.
- maxScore per versie: 42 → **39**. Let op: de oude (dode) PT1-specs in `versionSpecs` zijn ook ingekort maar worden door de v3-overrides niet gebruikt.

## lj3-differentiatie variabel blok

8 actieve lj3-items (SR4/7/8/10 × vmbo/hv) vervangen door lj3-eigen varianten met complexere context (matrijs §4); oude duplicaten van lj1 naar `archivedSelectedResponseItems` (34 totaal):

| Slot | lj3-vmbo | lj3-hv |
| --- | --- | --- |
| SR4 21A | cloud-document op stage | slimme speaker en serververwerking |
| SR7 22B | pakketband, volgorde-valkuil | voorwaardelijke lus (stop zodra > 20) |
| SR8 21D | navigatie-app voorspelt drukte | trainingsdata-effect huidvlekken (hv-verdieping) |
| SR10 23B | schermgebruik en stagefouten | autoplay en gedragsontwerp |

## Parallelvarianten (nieuw: `parallelVariantItems`)

- Nieuwe top-level array in `nulmetingen_selected_response_herontwerp_v3.json` (schemaVersion → **v3.11**): itembank voor de voortgangsmeting, **24 items** = 2e variant per variabel slot per versie: 16 SR-varianten (SR4/7/8/10) + 8 mini-PT-varianten (feed 21B per versie; 23C-casus: schoolpas-locatieregistratie lj1, nieuwsapp-verkiezingen lj3). Elke variant heeft `parallelTo` naar de actieve `itemVersion` (zelfde slot, zelfde bullet en valkuilstructuur, ander scenario).
- App gebruikt deze array nu niet (filter op `targetGroup` loopt alleen over `selectedResponseItems`); inzet volgt bij de voortgangsmeting.
- Mini-PT-varianten gebouwd na akkoord Pim (11-06-2026); `validityNote` van actieve mini-PT's verwijst nu naar de bank.

## Verificatie

- `src/lib/readability.test.ts` checkt nu ook de bank (52 + 24 items). Alle tests: **178 passed**.
- `scripts/verify-anchors.js` checkt extra: ≥1 bankvariant per variabel slot per versie (ook `variable-slot`, de mini-PT's) en geldige `parallelTo`-verwijzingen.
- Let op: OneDrive-sync naar de Linux-sandbox liep achter (afgekapte bestanden/NUL-bytes); tests draaiden op een verse kopie in /tmp met identieke inhoud.

## Openstaand fase 2

- ~~Parallelvarianten mini-PT's~~ → gebouwd (zie boven).
- ~~Matrijstotaal "38" vs. feitelijk 39~~ → matrijsdoc gecorrigeerd naar 39 (21A = 6, kerndoel 21 = 16, ankerblok = 31). Alle vier de metingen staan gelijk op 39 punten.
- Volgende stap (fase 3): selectielogica voortgangsmeting — app laat per meetmoment kiezen tussen actieve variant en bankvariant per variabel slot.
