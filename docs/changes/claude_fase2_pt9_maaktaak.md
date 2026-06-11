# Fase 2 — Itembouw deel 2: PT9 maaktaak (Claude)

Status: gebouwd 11-06-2026, conform `claude_fase2_toetsmatrijs.md`. Reviewkeuzes Pim deze sessie: scoring 3 eisen × 1 pt (doelgroep verweven in titel- en beeldopties); nulmeting = PowerPoint-vorm, voortgangsmeting = postervorm; direct bouwen akkoord.

## Wat is gebouwd

Nieuwe PT9-sectie (na PT8) in alle vier versies: leerling bouwt een digitaal product op volgens ontwerpeisen in een simulatie met live preview. Type `powerpoint_design_task` (bestond al ongebruikt in de code, incl. scoringsmotor `scorePowerPointTask`); view herschreven en uitgebreid met postervorm.

### Inhoud (22A, anker, 3 pt)

Per niveau-lijn identiek (anker lj1↔lj3): vmbo-versie gelijk voor lj1-vmbo/lj3-vmbo, hv-versie gelijk voor lj1-hv/lj3-hv. Drie keuzegroepen, elk 4 opties, elk 1 pt:

1. **Titel** — kort, duidelijk, passend bij doelgroep (afleiders: te formeel, te vaag, te lang).
2. **Beeld** — passend bij doel én te gebruiken (afleiders: watermerk/auteursrecht, niet passend, onoverzichtelijk).
3. **Bronvermelding** — maker + site/licentie (afleiders: "gratis = zonder regels", "bron: internet/Google", eigen naam).

De doelgroep-eis is verweven in de titel- en beeldopties (foute opties passen niet bij de doelgroep), zodat alle vier ontwerpeisen uit de matrijs gedekt zijn met 3 meetpunten.

| Lijn | Slide-vorm (nulmeting, actief) | Postervorm (parallelvorm voortgangsmeting) |
| --- | --- | --- |
| vmbo | dia over schoolfeest, doelgroep klasgenoten (`pt9-vmbo-maaktaak-slide-v1`) | poster sportdag, doelgroep leerlingen (`pt9-vmbo-maaktaak-poster-v1`) |
| hv | dia open avond, doelgroep ouders + nieuwe leerlingen (`pt9-hv-maaktaak-slide-v1`) | poster debatavond, doelgroep leerlingen + ouders (`pt9-hv-maaktaak-poster-v1`) |

Postervorm staat klaar in `v3Pt9(versionId, "poster")`; activeren per meetmoment = één regel in `withV3PerformanceTasks`.

## Codewijzigingen

- `src/types.ts`: `PowerPointTaskConfig.format?: "slide" | "poster"`.
- `src/items/PowerPointDesignTaskView.tsx`: herschreven — schone imports, opties per sessie geschud + `shownOptionOrder` gelogd, previewzones titel/beeld/bron, posterframe naast PowerPoint-frame.
- `src/styles.css`: posterstijlen (`poster-canvas` 3:4, titel/beeld/bron-zones).
- `src/data/assessments.server.ts`: `Pt9Spec`, `powerPointTaskItem` (22A, anker, punten uit regels), PT9-sectie in `makeSections`, `v3Pt9` met beide vormen per lijn, injectie in `withV3PerformanceTasks`.

## Scoring/totalen

- maxScore per versie: 41 → 44 (wordt 38 na inkorten PT2/PT6 en overige fase 2-stappen — let op: matrijstotaal 38 telt PT2/PT6-inkorting en SR-herschikking mee).
- Scoringsgeheimen: PT-regels blijven, net als bij andere PT's, in de client aanwezig (bestaand patroon `generate-public-instruments.mts`); correcte antwoorden zijn niet zichtbaar in de UI.

## Nog open in fase 2

±7 nieuwe SR-items + parallelvarianten, herschrijven bestaande SR-items (3–4 opties + taligheidsnorm), inkorten PT2/PT6, leesbaarheidscheck in `npm test`.
