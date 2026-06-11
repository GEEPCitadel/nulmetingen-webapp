# Verificatierapport Fase 4 — DG-metingen webapp

Datum: 11 juni 2026. Uitgevoerd door Claude (Cowork) op verzoek van Pim. Dit rapport sluit fase 4 van het verbeterplan af (zie `verbeterrapport_dg_metingen_claude.md`, §5).

## 1. Samenvatting

Alle verificaties zijn geslaagd. De webapp bouwt zonder fouten, de typecheck is schoon, alle vier de versies doorlopen een volledige programmatische afname zonder fouten, de kerndoeldekking kent geen gaten, het ankerblok is in alle versies aanwezig en de leesbaarheid ligt in een acceptabele bandbreedte met de juiste verhouding tussen niveaus.

## 2. Build en typecheck

De productie-build (`vite build`) en de volledige TypeScript-typecheck (`tsc -b`) zijn beide zonder fouten doorlopen, inclusief de nieuwe groeiweergave (beheertab "Groei (ankerblok)") en de groei-exports. De serverless API (`api/results.js`, inclusief de nieuwe `growth`-sectie) is syntactisch gevalideerd met `node --check`.

Technische kanttekening: door een synchronisatieprobleem tussen OneDrive en de geïsoleerde build-omgeving is de build uitgevoerd op een bytegelijke kopie van het project. Een lokale controle-run (`npm run build`) door Pim blijft aan te raden als laatste zekerheid.

## 3. End-to-end smoke-test (alle vier versies)

Per versie is programmatisch een volledige afname doorlopen via de echte applicatielogica (`createSession` → `submitItemAnswer` per item → `completeSession` → `calculateResult`), met een mix van beantwoorde en overgeslagen items.

| Versie | Items | Beantwoord | Resultaat geldig | Blokken | Ankeritems in resultaten |
|---|---|---|---|---|---|
| lj1-vmbo | 18 | 18 | ja | 8 | 5/5 |
| lj1-hv | 18 | 18 | ja | 8 | 6/6 |
| lj3-vmbo | 18 | 18 | ja | 8 | 5/5 |
| lj3-hv | 18 | 18 | ja | 8 | 6/6 |

Geen scoringsfouten, alle totalen en kerndoelscores zijn geldige getallen, en elk ankeritem komt met `ankerItemFlag` terug in de resultaten — de basis waarop de groeiweergave rekent. Dit is een programmatische smoke-test, geen browsertest; klikgedrag en weergave zijn hiermee niet getest.

## 4. Bestaande verificatiescripts

Alle vier de meegeleverde scripts slagen: `verify:anchors` (4 versies, 10 SR-items, phishing-ankers, selectiegrenzen, geen live zoekopdrachten), `verify:sr-sync` (v4 SR-item-id's consistent tussen JSON en Markdown), `verify:whutsupp-pt8` (PT8-flow correct) en `report:kd-coverage` (SR-set).

## 5. Kerndoeldekking (toetsmatrijs)

De dekkingsberekening volgt dezelfde logica als de app zelf (kerndoelen uit `primarySubgoal`, `subgoal` én `kerndoel`, dus inclusief performancetaken die meerdere kerndoelen dekken). Alle vier de versies hebben een identiek dekkingsprofiel, zonder gaten:

| Kerndoel | Items | Punten | Waarvan anker |
|---|---|---|---|
| 21A | 4 | 13 | 1 |
| 21B | 2 | 2 | 1 (hv: 2) |
| 21C | 2 | 5 | 1 |
| 21D | 1 | 1 | — |
| 22A | 1 | 1 | — |
| 22B | 1 | 4 | — |
| 23A | 3 | 7 | 2 |
| 23B | 3 | 6 | — |
| 23C | 1 | 1 | — |

Aandachtspunt (geen blokkade): 21D, 22A en 23C steunen elk op één item van één punt. Voor betrouwbaardere uitspraken per kerndoel zou daar bij een volgende itemronde uitbreiding wenselijk zijn.

## 6. Ankerblok

Elke versie bevat een ankerblok voor de groeivergelijking nul- ↔ voortgangsmeting: vmbo-versies 5 ankeritems, hv-versies 6 (hv heeft één extra SR-anker, conform de hv-verdieping). Alle versies delen het PT6-anker (scherm delen) plus SR-ankers rond wachtwoorden, telefoongebruik, bronbeoordeling en data/grafieken.

## 7. Leesbaarheid

Benadering op alle leerlingteksten per versie (items, opties, taakteksten; HTML verwijderd). Flesch-Douma: hoger = leesbaarder (60–70 ≈ geschikt voor ±13 jaar).

| Versie | Woorden | Woorden per zin | Flesch-Douma | % lange woorden (≥10 tekens) |
|---|---|---|---|---|
| lj1-vmbo | 2.620 | 8,1 | 61,8 | 12,0 |
| lj1-hv | 2.472 | 7,3 | 55,7 | 13,6 |
| lj3-vmbo | 2.871 | 7,9 | 54,5 | 12,6 |
| lj3-hv | 3.008 | 8,3 | 54,7 | 13,3 |

Het beeld klopt met de bedoeling: lj1-vmbo is de leesbaarste versie, hv- en lj3-versies zijn iets taliger. Korte zinnen (±8 woorden) overal. Geen versie zakt onder de 50 ("moeilijk"). Kanttekening: dit is een geautomatiseerde benadering; de eerder afgesproken taligheidsnorm per doelgroep blijft het inhoudelijke kader.

## 8. Conclusie en restpunten

Fase 4 is afgerond: build, typecheck, smoke-test van alle versies, kerndoeldekking, ankerblokcontrole en leesbaarheidscheck zijn allemaal geslaagd. Restpunten buiten deze fase: (1) lokale `npm run build` als dubbelcheck wegens het synchronisatieprobleem, (2) een echte browsertest van de leerling- en beheerflow vóór livegang van de voortgangsmeting, (3) de smalle dekking van 21D/22A/23C bij een volgende itemronde, en (4) het openstaande fase-1-werk (opsplitsen `App.tsx`, server-side scoring).
