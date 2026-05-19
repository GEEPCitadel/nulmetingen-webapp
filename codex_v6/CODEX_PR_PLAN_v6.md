# CODEX PR-PLAN — Nulmeting DG content-update naar v6

**Doelpubliek:** Codex (of vergelijkbare coding-agent) die deze update als één PR doorvoert.
**Begeleidende bestanden in deze map:**
- `nulmeting_v6_items.ts` — alle nieuwe/gewijzigde items als pure data-export.
- `nulmeting_v6_scoring_helpers.ts` — scoring-engine extensies + AST-helpers als werkende TS-templates.

**Doel van de PR:** vijf must-fixes doorvoeren in de webapp (`src/data/assessments.ts` + scoring-module + Excel-asset + 1 nieuwe component) zonder verlies van bestaand werk.

**Harde randvoorwaarde:** alle scoring blijft automatisch. Geen open tekstvelden, geen rubric-werk voor docenten. Bij elk item bij twijfel: stop en stel een vraag.

---

## 0. Pre-flight — verkennen en branch maken

Voer deze stappen exact uit voordat je iets wijzigt.

### Stap 0.1 — Branch
```bash
git checkout -b content/nulmeting-v6
```

### Stap 0.2 — Tests groen krijgen op `main`
```bash
npm install      # zowel root als frontend en backend als die separate package.json hebben
npm test
```
Als tests rood zijn: **stop**, rapporteer, niet doorgaan met de PR.

### Stap 0.3 — Schema van `assessments.ts` in kaart brengen
Open `src/data/assessments.ts` (of waar de assessment-spec staat). Noteer in een scratchpad:

1. Het TypeScript-type voor een Item (per item-type: SR, mail-simulatie, excel-simulatie, file-manager, teams-share, blokprogrammeren, scenario-acties).
2. Hoe de versie-array eruit ziet (`const lj1vmbo: Version = { items: [ ... ] }` of vergelijkbaar).
3. Hoe scoring is geregeld: in dezelfde file? In een aparte `scoring.ts` / `scoreItem.ts`? In backend?
4. Of er een `anchor`-veld bestaat op item-niveau — zo niet, dat moet je toevoegen.
5. Of er een `kdTags`-veld bestaat — zo niet, dat moet je toevoegen.

### Stap 0.4 — Map canonical schema's
Onze canonical types in `nulmeting_v6_items.ts` moeten gemapt worden naar de werkelijke types. Schrijf een korte mapping-tabel (eventueel als comment in `nulmeting_v6_items.ts` of in de PR-beschrijving):

| Canonical (v6 items) | Werkelijke type in `assessments.ts` |
|---|---|
| `SrItem` | … (bv. `MCItem`) |
| `MailItem` | … |
| `ExcelItem` | … |
| `SourceEvalItem` | **nieuw** — `SourceEvalItem` toevoegen aan types |
| `PT7Item` | … (bv. `BlockProgrammingItem`) |
| `anchor: boolean` | **nieuw veld** op base Item-type |
| `kdTags: string[]` | bestaand of toevoegen |

Als de mapping niet 1-op-1 lukt: stop, beschrijf het probleem, vraag Pim.

### Stap 0.5 — Verifieer dat de items uit `v6Removals` bestaan
Zoek in `assessments.ts` naar elk itemId in `v6Removals` van `nulmeting_v6_items.ts`:
```
lj1v-sr1-pw, lj1v-sr7-hallucination, lj1v-sr8-copyright, lj1v-sr5-source
lj1h-sr1-pw, lj1h-sr8-hallucination, lj1h-sr6-source
lj3v-sr5-copyright, lj3v-sr3-source
lj3h-sr3-hallucination, lj3h-sr5-cc-sa (wordt overschreven)
```
Als een id afwijkt: **stop**, rapporteer welke id ervoor in de plaats staat, en vraag of de mapping in v6 moet meegaan.

---

## 1. Commits — één per fix

Voer de zeven commits in deze volgorde uit. Push pas aan het eind, dan opent de PR.

| Commit | Wat | Bestanden |
|---|---|---|
| C1 | Types uitbreiden | `src/data/assessments.ts` types-sectie of `src/types/assessment.ts` |
| C2 | Fix 2 — ankers uniformeren | `src/data/assessments.ts` (data) |
| C3 | Fix 4 — tweede auteursrecht-item | `src/data/assessments.ts` (data) |
| C4 | Fix 5a — mediawijsheid SR-items | `src/data/assessments.ts` (data) |
| C5 | Fix 3a — Mail-dropdowns + scoring | `src/data/assessments.ts` + Mail-component + scoring |
| C6 | Fix 3b — Excel LJ3H formulevraag | `src/data/assessments.ts` + `LJ3_HV_OpenData.xlsx` + Excel-scoring |
| C7 | Fix 5b — PT bronbeoordeling nieuw component | `src/data/assessments.ts` + nieuwe component + scoring |
| C8 | Fix 1 — PT7 niveau-progressie + AST-walk | `src/data/assessments.ts` + scoring-module |
| C9 | Docs sync + verify scripts | `huidige_vragenlijsten_specificatie.md`, `alle_vragen_en_afleiders_huidig.md`, `package.json` (verify:anchors script) |

Houd commits klein en thematisch. Eén fix per commit met duidelijke commit-message in de vorm: `fix(v6): <onderwerp>`.

---

## 2. C1 — Types uitbreiden

Voor de meeste types is dit incrementeel: voeg velden toe waar nog niet aanwezig.

### Wijzigingen
- Op base `Item`-type (of zijn equivalent):
  - `anchor?: boolean`
  - `kdTags: string[]` (verplicht voor nieuwe items, optioneel voor bestaande tot je ze migreert)
- Op `MailItem`-type:
  - `subjectMode: "freeText" | "dropdown"`
  - `subjectOptions?: Option[]`
  - `greetingDropdown?: Option[]`
  - `closingDropdown?: Option[]`
  - `priorityToggle?: boolean`
  - `expected.subjectOptionId?: string`
  - `expected.priorityHigh?: boolean`
  - `expected.greetingOptionId?: string`
  - `expected.closingOptionId?: string`
- Op `ExcelItem`-type:
  - `tolerance.numeric?: boolean`
  - `tolerance.deltaAbs?: number`
  - `expected: string | number` (als string-only, breid uit naar union)
- **Nieuw type:** `SourceEvalItem` met snippets-, dropdown- en multi-checkbox-vragen (zie `nulmeting_v6_items.ts`).
- Op `PT7Item` (blokprogrammeren):
  - `criteriaSpec: string` — verwijst naar criteria-set in scoring-module
  - `correctProgram: BlockNode` — verwacht AST-structuur

### Acceptatie
- [ ] `npm run typecheck` (of `tsc --noEmit`) blijft groen.
- [ ] Bestaande items compileren nog zonder type-error (de nieuwe velden zijn optioneel).

---

## 3. C2 — Fix 2 — Anker-items uniformeren

### Operaties

**Verwijder uit `lj1-vmbo`:** `lj1v-sr1-pw`, `lj1v-sr7-hallucination`, `lj1v-sr8-copyright`, `lj1v-sr5-source`.
**Voeg toe aan `lj1-vmbo`:** `anker-sr-wachtwoord`, `anker-sr-ai-hallucinatie`, `anker-sr-auteursrecht-foto`, `anker-sr-bronbeoordeling-klimaat`.

**Verwijder uit `lj1-hv`:** `lj1h-sr1-pw`, `lj1h-sr8-hallucination`, `lj1h-sr6-source`.
**Voeg toe aan `lj1-hv`:** `anker-sr-wachtwoord`, `anker-sr-ai-hallucinatie`, `anker-sr-auteursrecht-foto`, `anker-sr-bronbeoordeling-klimaat`.

**Verwijder uit `lj3-vmbo`:** `lj3v-sr5-copyright`, `lj3v-sr3-source`.
**Voeg toe aan `lj3-vmbo`:** `anker-sr-wachtwoord`, `anker-sr-ai-hallucinatie`, `anker-sr-auteursrecht-foto`, `anker-sr-bronbeoordeling-klimaat`.

**Verwijder uit `lj3-hv`:** `lj3h-sr3-hallucination`.
**Voeg toe aan `lj3-hv`:** `anker-sr-wachtwoord`, `anker-sr-ai-hallucinatie`, `anker-sr-auteursrecht-foto`, `anker-sr-bronbeoordeling-klimaat`.

Voor elke versie geldt: itemvolgorde mag je vrij kiezen, maar zet ze logisch bij elkaar (bv. anker-items aan het eind van het SR-blok, of als aparte sectie). Houd het consistent over de vier versies.

### Bron
Item-content komt 1-op-1 uit `nulmeting_v6_items.ts`: exports `ankerSrWachtwoord`, `ankerSrAiHallucinatie`, `ankerSrAuteursrechtFoto`, `ankerSrBronbeoordelingKlimaat`.

### Acceptatie
- [ ] Elk van de 4 ankers zit in **alle 4** versies met *exact* dezelfde `question`, `options`-tekst, `correct`-id.
- [ ] Veld `anchor: true` aanwezig.
- [ ] Geen overgebleven kopie van de vervangen items.
- [ ] Schrijf script `npm run verify:anchors` (zie C9) — moet slagen.

---

## 4. C3 — Fix 4 — Tweede auteursrecht-item per versie

### Operaties

**Toevoegen aan `lj1-vmbo`:** `lj1v-sr-cr2-gebruik`.
**Niets doen voor `lj1-hv`:** `lj1h-sr9-cc` blijft staan als tweede auteursrecht-item.
**Toevoegen aan `lj3-vmbo`:** `lj3v-sr-cr2-bync`.
**Vervangen in `lj3-hv`:** `lj3h-sr5-cc-sa` (zelfde itemId, sterkere afleiders) — content uit `lj3hSrCopyrightBySa`.

### Bron
Exports `lj1vSrCopyright2`, `lj3vSrCopyrightBync`, `lj3hSrCopyrightBySa` uit `nulmeting_v6_items.ts`.

### Acceptatie
- [ ] Elke versie heeft **minstens 2 items** met `kdTags` bevattend `"KD22A"` (incl. `anker-sr-auteursrecht-foto`).
- [ ] Niveau-progressie KD22A: foto-anker (alle) → CC-BY (LJ1H) → CC-BY-NC (LJ3V) → CC-BY-SA (LJ3H).

---

## 5. C4 — Fix 5a — Mediawijsheid SR-items voor LJ3

### Operaties

**Toevoegen aan `lj3-vmbo`:** items uit `srSponsored("lj3v")` en `srAdsRanking("lj3v")`.
**Toevoegen aan `lj3-hv`:** items uit `srSponsored("lj3h")` en `srAdsRanking("lj3h")`.

### Acceptatie
- [ ] LJ3V krijgt `lj3v-sr-sponsored` en `lj3v-sr-ads-ranking`.
- [ ] LJ3H krijgt `lj3h-sr-sponsored` en `lj3h-sr-ads-ranking`.
- [ ] KD-rapportage (zie C9 scripts): KD21B in LJ3V en LJ3H minstens 3 punten.

---

## 6. C5 — Fix 3a — Mail-dropdowns + scoring

### Code-wijzigingen

#### 6.1 Component-uitbreiding
Locatie: `frontend/src/components/MailSimulation.*` of `OutlookMailBlock.*` (volg projectstructuur).

Voeg ondersteuning toe voor de extra item-velden:
- `subjectMode === "dropdown"` → render `<select>` met `subjectOptions`.
- `greetingDropdown` aanwezig → render `<select>` met aanhef-opties; persisteer `greetingOptionId` in response.
- `closingDropdown` aanwezig → render `<select>` met afsluiting-opties; persisteer `closingOptionId`.
- `priorityToggle === true` → render een toggle/checkbox "Prioriteit: hoog"; persisteer `priorityHigh: boolean`.

Voor `subjectMode === "freeText"`: huidig gedrag behouden.

#### 6.2 Items vervangen
- `lj1v-pt2-mail`: ongewijzigd (`lj1vPt2Mail`).
- `lj1h-pt2-mail`: vervang door `lj1hPt2Mail`.
- `lj3v-pt2-mail`: vervang door `lj3vPt2Mail`.
- `lj3h-pt2-mail`: vervang door `lj3hPt2Mail`.

#### 6.3 Scoring
Vervang/breid de scoring-functie voor mail-items uit met `scoreMailItem` uit `nulmeting_v6_scoring_helpers.ts`. Houd backward-compatibility: items zonder dropdown-velden moeten dezelfde score opleveren als nu.

### Tests
Schrijf in `__tests__/mail.spec.ts` (of equivalent) testcases A t/m F uit `nulmeting_v6_scoring_helpers.ts` sectie 1.

### Acceptatie
- [ ] LJ1V Mail blijft 4 punten met huidige scoring.
- [ ] LJ1H Mail dropdown rendert; correcte selectie levert 4/4.
- [ ] LJ3V Mail: CC verplicht; alles correct levert 5/5.
- [ ] LJ3H Mail: prioriteit + greeting + closing renderen; alles correct levert 6/6.
- [ ] Unit tests groen.

---

## 7. C6 — Fix 3b — Excel LJ3H formulevraag

### 7.1 Excel-bestand aanpassen
Locatie van `LJ3_HV_OpenData.xlsx`: vermoedelijk `frontend/public/assets/` of `frontend/src/assets/`. Zoek met `find . -name "LJ3_HV_OpenData.xlsx" -not -path "*node_modules*"`.

Wijzigingen op sheet `Energie`:
1. Cel `F2`: tekst — *"Tip: gebruik SOM.ALS om totale Kosten voor Woningtype A te berekenen. Typ alleen de uitkomst in cel H2."*
2. Cel `H2`: leeg (de leerling vult in).
3. **Bereken** `=SOM.ALS(B:B; "A"; D:D)` (of corresponderende kolommen) in een verborgen werkblad of via een eenmalige berekening. **Noteer de uitkomst** en zet die in `lj3hPt4Excel.questions[2].expected` (zie volgende stap).

> Als het kolomschema afwijkt (Woningtype niet in B, Kosten niet in D): pas de tip-tekst aan en gebruik de juiste kolomletters voor de formule.

### 7.2 `nulmeting_v6_items.ts` updaten
In `lj3hPt4Excel.questions[2].expected` staat nu `0` als placeholder. **Vervang met de werkelijke SOM.ALS-uitkomst.**

### 7.3 `assessments.ts` updaten
Vervang `lj3h-pt4-excel` met de inhoud van `lj3hPt4Excel` (3 questions, 6 punten).

### 7.4 Scoring
- Excel-scoring uitbreiden met numerieke vergelijking: implementeer `parseNumeric` uit `nulmeting_v6_scoring_helpers.ts` in de Excel-scoring-module.
- Map `scoreExcelItem` template aan de werkelijke Excel-scoring-functie. Behoud backward-compat met huidige string-vergelijking voor q1/q2-stijl.

### Tests
Test-cases uit `nulmeting_v6_scoring_helpers.ts` sectie 2.

### Acceptatie
- [ ] `LJ3_HV_OpenData.xlsx` heeft F2-tip en H2-cel.
- [ ] `lj3h-pt4-excel` heeft 3 questions, totaal 6 punten.
- [ ] Numerieke parsing accepteert "13450", "13.450", "€ 13450", "13.450,75" correct.
- [ ] Tolerantie ±1 absoluut werkt voor q3.

---

## 8. C7 — Fix 5b — PT bronbeoordeling

### 8.1 Nieuwe component
Locatie: `frontend/src/components/SourceEvaluationBlock.{tsx,js}` (volg conventie).

Functionaliteit:
- Render `intro`-tekst.
- Render elk `snippet` als kaart met `title`, `meta`, `body`.
- Voor `hasImageRequiringReverseSearch: true`: render een placeholder-afbeelding (kan een gestileerde rechthoek met "[AI-afbeelding]" zijn) zodat de leerling de context begrijpt.
- Render de questions:
  - `type: "dropdown"`: `<select>` met options.
  - `type: "multi_checkbox"`: 5 checkboxes, alle aanvinkbaar.
- Verzend response naar backend in formaat dat `scoreSourceEvaluationItem` accepteert (`{ answers: Record<qId, string | string[]> }`).

### 8.2 Items toevoegen
- `lj3-vmbo`: voeg `lj3v-pt5-bronbeoordeling` toe.
- `lj3-hv`: voeg `lj3h-pt5-bronbeoordeling` toe.

### 8.3 Scoring
Implementeer `scoreSourceEvaluationItem` uit `nulmeting_v6_scoring_helpers.ts` in de scoring-module.

### Tests
Test-cases uit `nulmeting_v6_scoring_helpers.ts` sectie 3.

### Acceptatie
- [ ] Nieuwe component rendert correct in beide versies.
- [ ] Dropdown-vragen scoren 1/0 op basis van correcte optie.
- [ ] Multi-checkbox-vraag scoort 1 bij `minCorrect` gehaald én `maxDistractor` niet overschreden.
- [ ] Voor lj3h q3: "toon" is geen distractor (geen straf bij aanvinken); "lang" wel.

---

## 9. C8 — Fix 1 — PT7 + AST-walk

### 9.1 Scoring-engine uitbreiden
- Voeg `BlockNode`, `BizzyState`, `findBlock`, `blockMatches`, `eventIndex` toe (uit `nulmeting_v6_scoring_helpers.ts`).
- Voeg de `criteriaByItem`-map toe.
- Voeg `scorePT7Item` toe en hang die aan de scoring-router voor `type: "blokprogrammeer_simulatie"`.

### 9.2 Blokprogrammeer-component uitbreiden
De huidige component moet aanvullend op de eindstate ook het *gebouwde programma als AST* exposen. Als de bestaande architectuur dit niet doet:
- Voeg een functie `serializeProgram(workspace): BlockNode` toe die de werkvlak-staat omzet naar de geneste AST-structuur.
- Stuur deze AST samen met de eindstate naar de scoring.

### 9.3 Items wijzigen
- `lj1v-pt7-programming`: vervang door `lj1vPt7Programming` (alleen `criteriaSpec` toegevoegd; opdracht ongewijzigd).
- `lj1h-pt7-programming`: vervang door `lj1hPt7Programming` (idem).
- `lj3v-pt7-programming`: **volledig nieuw** — vervang met `lj3vPt7Programming` (vierkant lopen).
- `lj3h-pt7-programming`: **volledig nieuw** — vervang met `lj3hPt7Programming` (heen-en-weer 3x).

### 9.4 Blokken-bibliotheek uitbreiden
De blokken `herhaal_4_keer`, `verplaats_2m_vooruit`, `draai_90_graden`, `zeg_klaar` zijn waarschijnlijk nog niet beschikbaar. Voeg ze toe aan de beschikbare blok-types in de blokprogrammeer-component:
- `verplaats_2m_vooruit` — variant van bestaande verplaats met afstand=2
- `draai_90_graden` — variant van bestaande draai met hoek=90
- `herhaal_4_keer` — variant van bestaande herhaal met aantal=4
- `zeg_klaar` — preset op zeg-blok met tekst "Klaar!"

Voor de implementatie: liever de bestaande blokken parametriseerbaar maken (afstand, hoek, aantal, tekst als invulbare velden) dan nieuwe varianten. Zo blijft de blokken-bibliotheek klein.

### Tests
Test-cases uit `nulmeting_v6_scoring_helpers.ts` sectie 4.

### Acceptatie
- [ ] Alle 4 PT7-items renderen met de bijbehorende blokken-set.
- [ ] AST-walk scoort correct: structuur-punten alleen als herhaal-blok daadwerkelijk gebruikt en geneste blokken aanwezig.
- [ ] LJ3V: leerling die handmatig 4x verplaats + 4x draai zonder herhaal neerzet → max 2/4.
- [ ] LJ3H: leerling die `verplaats_1m_vooruit` (afleider) gebruikt → parameter-precisie criterium 0/1.

---

## 10. C9 — Docs sync + verify scripts

### 10.1 Update specificatie-bestanden
- `huidige_vragenlijsten_specificatie.md` — werk bij naar v6 (alle nieuwe/gewijzigde items).
- `alle_vragen_en_afleiders_huidig.md` — idem; bevat ook afleiders.

Beide opslaan met `_v6` suffix of in dezelfde naam als versie-id (volg projectconventie).

### 10.2 `verify:anchors` script
Voeg toe aan `package.json`:
```json
{
  "scripts": {
    "verify:anchors": "node scripts/verify-anchors.js",
    "report:kd-coverage": "node scripts/kd-coverage.js"
  }
}
```

Schrijf `scripts/verify-anchors.js`:
```js
// Pseudo: lees assessments.ts, filter items waar anchor === true,
// groepeer per itemId, controleer dat content (question, options, correctId) identiek is
// over alle versies waarin de itemId voorkomt. Exit 1 bij mismatch met diff.
```

Schrijf `scripts/kd-coverage.js`:
```js
// Pseudo: lees assessments.ts, tel per versie de punten per KD op op basis van kdTags.
// Druk tabel af. Verwachte waarden (tolerantie ±1):
// KD21A LJ1V≈11, LJ1H≈11, LJ3V≈12, LJ3H≈13
// KD21B LJ1V≈3,  LJ1H≈3,  LJ3V≈5-6, LJ3H≈5-6
// KD21C LJ1V≈4,  LJ1H≈4-5,LJ3V≈4,   LJ3H≈6
// KD21D LJ1V≈3,  LJ1H≈3,  LJ3V≈5,   LJ3H≈6
// KD22A alle versies≈2
// KD22B alle versies≈4
// KD23A LJ1V≈2,  LJ1H≈3,  LJ3V≈6,   LJ3H≈6
// KD23B LJ1V≈5,  LJ1H≈5,  LJ3V≈5,   LJ3H≈6
// KD23C LJ1V≈2,  LJ1H≈1,  LJ3V≈2,   LJ3H≈3
```

### 10.3 CI integreren
Voeg `npm run verify:anchors` toe aan de CI-pipeline (waar `npm test` ook draait). Zo blijft de ankerconsistentie afgedwongen bij toekomstige edits.

### Acceptatie
- [ ] Beide spec-docs bevatten alle v6-items.
- [ ] `npm run verify:anchors` slaagt.
- [ ] `npm run report:kd-coverage` print de matrix; alle cellen binnen ±1 van verwachte waarden.

---

## 11. NIET aankomen

- App.js routing, design system CSS, backend endpoint-paden.
- Items die niet expliciet in `v6Removals` of in `v6ItemPayload` voorkomen.
- Zelfinschattingsvraag — apart traject (geen taak voor deze PR).
- PT1, PT3, PT6 (Teams), PT8 — ongewijzigd in deze release.

---

## 12. QA-doorloop vóór PR opent

1. **Build**: `npm run build` slaagt zonder warnings.
2. **Tests**: `npm test` slaagt; alle nieuwe specs groen.
3. **Verify scripts**: `npm run verify:anchors` en `npm run report:kd-coverage` slagen.
4. **Lokale e2e per versie**: doorloop alle 4 versies handmatig. Per versie noteer:
   - Aantal items: LJ1V/H ~33-34 punten max, LJ3V/H ~38-40 punten max.
   - Tijdsduur (stopwatch). Als LJ3 > 40 min: vermeld in PR-beschrijving en open follow-up issue.
5. **Edge cases per PT**:
   - Mail: vergeet CC → verlies 1 pt; vergeet bijlage → verlies 1 pt.
   - Excel q3: input "13.450" en "13450" geven beide volle score.
   - Bronbeoordeling: 0 correcte signalen aangevinkt → 0/3 op q2.
   - PT7 LJ3V: uitgepakt zonder herhaal → max 2/4.

---

## 13. PR-template

**Titel:**
```
content(v6): 5 must-fixes — PT7 progressie, ankers, mail/excel diff, copyright n=2, mediawijsheid LJ3
```

**Body:**
```markdown
Voert door wat staat in `CODEX_PR_PLAN_v6.md`.

## Wijzigingen
- **Fix 1**: PT7 niveau-progressie hersteld (LJ3V vierkant, LJ3H heen-en-weer) + AST-walk anti-bypass-scoring
- **Fix 2**: 4 SR-items strikt geüniformeerd als ankers over alle versies
- **Fix 3a**: Mail-dropdowns voor subject/aanhef/closing — gestaffeld over versies
- **Fix 3b**: Excel LJ3H formulevraag (SOM.ALS) met numerieke scoring + tolerantie
- **Fix 4**: tweede auteursrecht-item per versie (n=2 minimum)
- **Fix 5a**: 2 SR-items mediawijsheid voor LJ3 (sponsored, ads ranking)
- **Fix 5b**: nieuw component-type `source_evaluation` (PT5 bronbeoordeling LJ3V + LJ3H)

## Auto-scoring blijft gegarandeerd
Geen open tekstvelden toegevoegd. Alle nieuwe items scoren via:
- dropdown-vergelijking,
- checkbox-aantal,
- exacte string-match (case-insensitive, trim),
- numerieke vergelijking met tolerantie (Excel q3),
- AST-walk + eindstate (PT7).

## Verify-scripts
- `npm run verify:anchors` — checkt strikte gelijkheid van anchor-items over versies.
- `npm run report:kd-coverage` — print KD-puntenverdeling per versie.

Beide groen in CI.

## Out of scope
- Self-assessment schaal-upgrade (apart issue).
- Design-system aanpassingen.

## Pilot-checks (sectie 12 van het PR-plan)
Loop deze met 2-3 leerlingen per versie voor uitrol breed.

## Files
- `src/data/assessments.ts` (data + types)
- `src/scoring/*` (mail, excel, source_evaluation, pt7-AST)
- `frontend/src/components/MailSimulation.*` (dropdown-uitbreidingen)
- `frontend/src/components/SourceEvaluationBlock.*` (nieuw)
- `frontend/src/components/BlockProgrammingBlock.*` (AST-export)
- `frontend/public/assets/LJ3_HV_OpenData.xlsx` (formulevraag-toevoeging)
- `scripts/verify-anchors.js` (nieuw)
- `scripts/kd-coverage.js` (nieuw)
- `huidige_vragenlijsten_specificatie.md` (v6)
- `alle_vragen_en_afleiders_huidig.md` (v6)
- `package.json` (verify scripts toegevoegd)
```

---

## 14. Bij twijfel: stop en vraag

Voor de volgende situaties **niet zelf beslissen**:

1. Type-mapping is niet 1-op-1 (canonical → werkelijk type). Beschrijf het probleem.
2. Een item-id uit `v6Removals` bestaat niet in `assessments.ts`. Rapporteer welke id ervoor in de plaats staat.
3. De blokprogrammeer-component exposes geen AST. Beschrijf wat er wel beschikbaar is.
4. De Mail-component is fundamenteel anders dan verwacht (bv. geen Aan/CC-velden maar één samengesteld veld).
5. De SOM.ALS-uitkomst uit `LJ3_HV_OpenData.xlsx` is niet eenduidig (bv. kolommen anders dan verwacht).
6. Een nieuw component-type (`source_evaluation`) past niet in de bestaande renderer-architectuur.

In al die gevallen: maak een issue/comment, beschrijf de afwijking, vraag Pim om besluit. **Niet zelf interpreteren.**

---

## 15. Tijdsestimatie

| Commit | Inschatting |
|---|---|
| C1 types | 30 min |
| C2 ankers | 30 min |
| C3 copyright-2 | 15 min |
| C4 mediawijsheid SR | 15 min |
| C5 mail-dropdowns | 2-3 uur (component + scoring + tests) |
| C6 excel formule | 1-2 uur (asset + scoring + tests) |
| C7 bronbeoordeling | 3-4 uur (nieuw component + scoring + tests) |
| C8 PT7 + AST | 4-6 uur (scoring-engine + blok-parametrisering + tests) |
| C9 docs + scripts | 1-2 uur |

**Totaal:** circa 12-18 uur ontwikkeltijd, afhankelijk van hoe vlot de mapping naar bestaande types verloopt.

---

*Einde plan. Werk de commits door in de aangegeven volgorde. Bij elke twijfel: terug naar §14.*
