# CODEX PR-PLAN — Nulmeting DG, PT7 v7 (volledige herziening)

**Doelpubliek:** Codex (of vergelijkbare coding-agent) die deze update als één PR doorvoert.
**Begeleidende bestanden in deze map:**
- `CODEX_INSTRUCTIONS_PT7_v7.md` — onderwijsinhoudelijke spec per item.
- `nulmeting_v7_pt7_items.ts` — vier PT7-items als pure data-export.
- `nulmeting_v7_pt7_scoring_helpers.ts` — AST-walk-helpers + criteria-map per item.

**Doel van de PR:** PT7-Blokprogrammeren herontwerpen naar v7 in alle vier toetsversies (`lj1-vmbo`, `lj1-hv`, `lj3-vmbo`, `lj3-hv`). Niveau-progressie herstellen, strikte volgorde-eis op geneste blokken, en `BizzyState` uitbreiden met `lastThought` + `denk`/`herhaal_start`/`herhaal_end`-events.

**Harde randvoorwaarde:** alle scoring blijft volledig automatisch. Bij twijfel: stop en stel een vraag (zie §10).

---

## 0. Pre-flight — verkennen en branch maken

### Stap 0.1 — Branch
```bash
git checkout -b content/nulmeting-pt7-v7
```

### Stap 0.2 — Tests groen krijgen op `main`
```bash
npm install
npm test
```
Als tests rood zijn: **stop**, rapporteer, niet doorgaan.

### Stap 0.3 — Schema van PT7 in kaart brengen
Open `src/data/assessments.ts` en zoek de vier PT7-items:
- `lj1v-pt7-programming`
- `lj1h-pt7-programming`
- `lj3v-pt7-programming`
- `lj3h-pt7-programming`

Noteer in een scratchpad:

1. Het werkelijke type voor een PT7-item (vermoedelijk `BlockProgrammingItem`, `BlokProgrammeerItem`, of vergelijkbaar). Heeft het reeds `criteriaSpec: string` en `correctProgram: BlockNode`? Zo niet: zie §1.
2. Of de v6-update al doorgevoerd is — dit PR-plan vooronderstelt dat v6 (`pt7-lj1v` t/m `pt7-lj3h`) al in de repo staat. Zo niet: stop, vraag.
3. Hoe scoring van PT7 is geregeld: in dezelfde file als de mail/excel-scoring, of in een aparte module zoals `src/scoring/pt7.ts`?
4. Hoe de blokprogrammeer-component het programma exposeert: alleen eindstate (`x`, `y`, `heading`) of ook de AST (de geneste blokstructuur die de leerling heeft gebouwd)?

### Stap 0.4 — Map canonical schema's
| Canonical (v7 items) | Werkelijke type in `assessments.ts` |
|---|---|
| `PT7Item` | … (bv. `BlockProgrammingItem`) |
| `BlockNode` | … (bestaand of nieuw toevoegen) |
| `criteriaSpec: string` | bestaand sinds v6 of toevoegen |

Als mapping niet 1-op-1 lukt: stop, beschrijf, vraag.

### Stap 0.5 — Verifieer dat alle vier item-ids bestaan
Zoek `lj1v-pt7-programming`, `lj1h-pt7-programming`, `lj3v-pt7-programming`, `lj3h-pt7-programming` in `assessments.ts`. Als een id afwijkt: stop, rapporteer.

### Stap 0.6 — `BizzyState`-type in kaart brengen
Open de scoring-module (waarschijnlijk `src/scoring/pt7.ts` of `backend/scoring/pt7.ts`). Noteer hoe `BizzyState` er nu uitziet (na v6). Voor v7 moeten worden toegevoegd:
- `lastThought: string | null`
- `events`-types: `denk`, `herhaal_start`, `herhaal_end`, `verander_animatie`

Als deze al bestaan: nog beter, skip in C2.

---

## 1. Commits — één per logische stap

Voer de zes commits in deze volgorde uit. Push pas aan het eind.

| Commit | Wat | Bestanden |
|---|---|---|
| C1 | Types + event-vocabulaire uitbreiden | `src/types/*.ts` of `src/scoring/pt7.ts` types-sectie |
| C2 | Blokpalet + canvas-renderer uitbreiden | `src/data/blocks.ts` (of equiv.) + blokprogrammeer-component |
| C3 | Items v7 vervangen in `assessments.ts` | `src/data/assessments.ts` (data) |
| C4 | Scoring-helpers v7 integreren | scoring-module (`src/scoring/pt7.ts` of equiv.) |
| C5 | Unit-tests per item (24 tests) | `__tests__/pt7-v7.spec.ts` of equiv. |
| C6 | Docs sync + spec-versie bump | `huidige_vragenlijsten_specificatie.md`, nieuwe `nulmetingen_dg_v7_specificatie.md` |

Houd commits klein en thematisch. Commit-message format: `fix(v7): <onderwerp>`.

---

## 2. C1 — Types + event-vocabulaire uitbreiden

### Wijzigingen op `BizzyState` (in scoring-module)
- `lastThought: string | null` (apart van `lastSpoken`)
- `events`-type union uitbreiden:
  - `"denk"` — leerling gebruikte een `Bizzy denkt "..."` blok
  - `"herhaal_start"` — een herhaal-blok start (value = aantal iteraties)
  - `"herhaal_end"` — een herhaal-blok eindigt
  - `"verander_animatie"` — animatie-blok uitgevoerd (geen scoring-impact, alleen logging)

### Wijzigingen op `BlockNode` (indien nog niet aanwezig)
- `params?: Record<string, unknown>` met support voor `afstand`, `richting`, `hoek`, `draairichting`, `aantal`, `tekst`, `sec`.

### Wijzigingen op `PT7Item`
- `criteriaSpec: string` — moet bestaan sinds v6. Verifieer.
- `correctProgram: BlockNode` — moet bestaan sinds v6. Verifieer.

### Acceptatie
- [ ] `npm run typecheck` (of `tsc --noEmit`) blijft groen.
- [ ] Bestaande PT7-items compileren nog zonder type-error.

---

## 3. C2 — Blokpalet + canvas-renderer uitbreiden

### 3.1 Blokpalet
Open `src/data/blocks.ts` (of waar de beschikbare blok-types staan). Voeg de volgende block-IDs toe als ze nog niet bestaan (volg v7-items):

**Voor LJ1V/LJ1H/LJ3V/LJ3H gedeeld:**
- `wanneer_klik_afspelen`
- `wanneer_klik_bizzy` _(afleider)_
- `verander_animatie` (met dropdown voor animatie-keuze; **neutraal** — geen scoring)
- `wacht_1_sec`
- `als_1_kleiner_2` _(afleider)_
- `herstart_scene` _(afleider)_

**Verplaats-varianten (parametriseerbaar):**
- `verplaats_1m_vooruit`, `verplaats_1m_achteruit`, `verplaats_2m_vooruit`, `verplaats_2m_achteruit`, `verplaats_3m_vooruit`

**Draai-varianten (parametriseerbaar):**
- `draai_90_graden`, `draai_180_graden`

**Herhaal-varianten:**
- `herhaal_1_keer`, `herhaal_2_keer`, `herhaal_3_keer`, `herhaal_4_keer`, `herhaal_6_keer`, `herhaal_10_keer`

**Zeg-presets:** `zeg_hoi`, `zeg_klaar_voor_de_start`, `zeg_start`, `zeg_klaar`, `zeg_bravo`
**Denk-presets:** `denk_klaar`, `denk_hm`, `denk_bravo`

> **Voorkeur:** parametriseer waar mogelijk in plaats van nieuwe varianten te maken. Bv. één `verplaats`-blok met dropdowns voor afstand+richting; één `herhaal`-blok met input-veld voor aantal; één `zeg`-blok met tekstveld. Spaart blokken-bibliotheek. Pas dan de palette-config per item aan zodat alleen relevante parameter-waarden selecteerbaar zijn.

### 3.2 Canvas-renderer
- Borg dat `verander_animatie` daadwerkelijk wordt gerenderd (Bizzy speelt de animatie af). Dit is een UX-eis, geen scoring.
- Borg dat `denk`-blok een **denkwolk** rendert (vs. `zeg` = spreekwolk).
- Borg dat de event-log na uitvoering de nieuwe event-types pusht: `denk`, `herhaal_start`, `herhaal_end`, `verander_animatie`. Verifieer in console of debug-output.

### 3.3 `open link` event-blok verbergen op PT7-canvases
Het derde event-blok in de huidige UI (`wanneer X wordt geklikt → open link "URL"`) is niet relevant voor PT7. Verberg het in de palet-configuratie voor `type: "blokprogrammeer_simulatie"`.

### Acceptatie
- [ ] Alle block-IDs uit `nulmeting_v7_pt7_items.ts` zijn renderbaar.
- [ ] `verander_animatie` werkt visueel (Bizzy danst/zwaait/etc.).
- [ ] `denk`-blok rendert denkwolk, `zeg`-blok rendert spreekwolk.
- [ ] Event-log push gebeurt voor alle nieuwe event-types.
- [ ] `open link`-blok niet zichtbaar op PT7-canvases.

---

## 4. C3 — Items v7 vervangen in `assessments.ts`

### Operaties

**Vervang in `lj1-vmbo`:** `lj1v-pt7-programming` met content uit `lj1vPt7Programming`.
**Vervang in `lj1-hv`:** `lj1h-pt7-programming` met content uit `lj1hPt7Programming`.
**Vervang in `lj3-vmbo`:** `lj3v-pt7-programming` met content uit `lj3vPt7Programming` (**volledig nieuw — vierkant lopen**).
**Vervang in `lj3-hv`:** `lj3h-pt7-programming` met content uit `lj3hPt7Programming` (**volledig nieuw — heen-en-weer 3x**).

ItemIds blijven gelijk aan v6 zodat aggregaat-rapportages niet breken. Alle vier items hebben:
- `points: 4`
- `kdTags: ["KD22B"]`
- nieuwe `instructie`, `beschikbareBlokken`, `correctProgram`, `criteriaSpec`

### Bron
1-op-1 uit `nulmeting_v7_pt7_items.ts`. Exports: `lj1vPt7Programming`, `lj1hPt7Programming`, `lj3vPt7Programming`, `lj3hPt7Programming`.

### Acceptatie
- [ ] Alle vier items hebben `criteriaSpec` met v7-waarde (`pt7-lj1v-v7` t/m `pt7-lj3h-v7`).
- [ ] `correctProgram` is een AST conform de spec in items.ts.
- [ ] `beschikbareBlokken` bevat exact de items uit de spec (inclusief `verander_animatie` als neutraal blok).
- [ ] KD22B-totalen per versie blijven 4 pt.

---

## 5. C4 — Scoring-helpers v7 integreren

### 5.1 `criteriaByItem`-map vervangen
Open de PT7-scoring-module (vermoedelijk `src/scoring/pt7.ts`). Vervang de v6-`criteriaByItem`-map met de inhoud uit `nulmeting_v7_pt7_scoring_helpers.ts`. Behoud de v6-helpers `findBlock`, `blockMatches`, `eventIndex` — die zijn ongewijzigd.

### 5.2 Nieuwe helpers
Voeg toe als ze nog niet bestaan:
- `findAllBlocks(root, predicate)` — DFS, retourneert alle matches.
- `lastHerhaalEndIndex(state)` — laatste index van `herhaal_end`-event in event-stream.
- `hasNoneOf(program, forbidden[])` — checkt afwezigheid van verboden blok-patronen.
- `headingEquivalent(a, b)` — modulo-360 vergelijking, tolerantie 1°.
- `isAtStartPosition(state)`, `isAtStartHeading(state)` — kleine wrappers.

### 5.3 Programma-AST exposeren vanuit blokprogrammeer-component
De huidige component scoort op eindstate. Voor v7 moet ook de AST van het gebouwde programma worden meegestuurd:
- Voeg `serializeProgram(workspace): BlockNode` toe die het werkvlak naar de geneste AST omzet.
- Stuur AST + eindstate samen naar `scorePT7Item(item, program, state)`.

Als de component al een AST exposed via v6-werk: skip deze stap.

### 5.4 `scorePT7Item` aanroep
Hang `scorePT7Item` aan de scoring-router voor `type: "blokprogrammeer_simulatie"`. Backward-compat: het API contract is identiek aan v6 (`(item, program, state) => ScoreBreakdown[]`).

### Acceptatie
- [ ] Vier `criteriaSpec`-waarden zijn gedefinieerd: `pt7-lj1v-v7`, `pt7-lj1h-v7`, `pt7-lj3v-v7`, `pt7-lj3h-v7`.
- [ ] Bij onbekende `criteriaSpec`: scoring werpt een nette Error (geen silent-fail).
- [ ] Alle vier items leveren een 4-element `ScoreBreakdown`-array.

---

## 6. C5 — Unit-tests per item

Schrijf in `__tests__/pt7-v7.spec.ts` (of conform projectstructuur) minstens 6 tests per item. Voor LJ1V/H gebruik bestaande v6-testpatronen als template.

### 6.1 Testmatrix (24 tests minimaal)

| Item | Scenario | Verwachte score |
|---|---|---|
| LJ1V | Correct programma | 4 |
| LJ1V | `denkt "Hoi!"` ipv `zegt` | 3 |
| LJ1V | `verplaats 1m achteruit` ipv vooruit | 2 |
| LJ1V | `wanneer op Bizzy geklikt` ipv afspelen | 3 |
| LJ1V | Lege canvas | 0 |
| LJ1V | Alleen event-blok | 1 (C1/C2/C3 falen, C4 evt. ok afhankelijk van impl) — verifieer en update test bij implementatie |
| LJ1H | Correct programma | 4 |
| LJ1H | Drie losse `verp 1m vooruit` zonder herhaal | 2 |
| LJ1H | `verp 3m vooruit` los (geen herhaal) | 1 |
| LJ1H | `herhaal 10 keer` met verp 1m genest | 2 |
| LJ1H | Lege canvas | 0 |
| LJ1H | Correct programma met `verander_animatie` toegevoegd (neutraal) | 4 |
| LJ3V | Correct programma | 4 |
| LJ3V | 4× los verp + 4× los draai zonder herhaal | 2 |
| LJ3V | `herhaal 3 keer` ipv 4 met juiste body | 1 |
| LJ3V | `herhaal 4 keer` met alleen `verp 1m` (draai vergeten) | 2 |
| LJ3V | `herhaal 4 keer` met body `[draai 90°, verp 1m]` (omgekeerde volgorde) | 3 |
| LJ3V | Correct maar `zegt "Klaar!"` ipv `denkt` | 3 |
| LJ3H | Correct programma | 4 |
| LJ3H | `herhaal 6 keer` met 2-blok body | 1 |
| LJ3H | 12 losse blokken zonder herhaal | 1 |
| LJ3H | `herhaal 3 keer` met `verp 1m`-body ipv `verp 2m` | 2 |
| LJ3H | `herhaal 3 keer` met body `[draai 180°, verp 2m, draai 180°, verp 2m]` (omgekeerde volgorde) | 3 |
| LJ3H | `denkt "Bravo!"` ipv `zegt` | 3 |

### 6.2 Test-helpers
Maak een test-fixture-functie die een `BizzyState` opbouwt door een AST te "executeren":
```ts
function simulate(program: BlockNode): BizzyState { /* push events, bereken eindpositie + heading */ }
```
Dit voorkomt dat je per test een complete state met de hand opbouwt.

### Acceptatie
- [ ] Alle 24 tests slagen.
- [ ] Coverage van `scorePT7Item` ≥ 90%.
- [ ] Geen `console.error`/`console.warn` tijdens test-run.

---

## 7. C6 — Docs sync + spec-versie bump

### 7.1 Spec-bestanden
- Update `huidige_vragenlijsten_specificatie.md`: vervang de vier PT7-secties met de v7-content (opdracht, beschikbare blokken, scoring).
- Maak `nulmetingen_dg_v7_specificatie.md` aan als kopie van v6 met alleen de PT7-secties vervangen.
- `alle_vragen_en_afleiders_huidig.md` (indien aanwezig): update PT7-secties.

### 7.2 Pilot-tijdsraming
Voeg aan de PR-beschrijving een placeholder voor de meet-resultaten van de eerste pilot:

| Niveau | Verwachte mediane afnametijd | Gemeten (in te vullen) |
|---|---|---|
| LJ1V | 3-5 min | — |
| LJ1H | 4-6 min | — |
| LJ3V | 5-8 min | — |
| LJ3H | 6-10 min | — |

Flag bij > 10 min op LJ3H.

### Acceptatie
- [ ] `huidige_vragenlijsten_specificatie.md` bevat de v7-PT7-content.
- [ ] `nulmetingen_dg_v7_specificatie.md` bestaat en wijkt alleen op PT7 af van v6.

---

## 8. NIET aankomen

- App.js routing, design system CSS, backend endpoint-paden.
- Items anders dan PT7 — ongewijzigd in deze PR. Geen SR, geen Mail, geen Excel, geen PT8.
- Anker-items (uit v6) — ongewijzigd.
- Self-assessment — apart traject.
- Blokpalet-uitbreiding met variabelen/sensoren — apart traject (v8).

---

## 9. QA-doorloop vóór PR opent

1. **Build**: `npm run build` slaagt zonder warnings.
2. **Tests**: `npm test` slaagt; alle 24 nieuwe tests groen.
3. **Verify-scripts** (uit v6): `npm run verify:anchors` en `npm run report:kd-coverage` slagen. PT7 is geen anker; KD22B per versie blijft 4 pt.
4. **Lokale e2e per versie**: doorloop alle vier PT7-items handmatig. Per versie:
   - Sleep correct programma → 4/4.
   - Voer één anti-bypass-scenario uit de testmatrix in → verwachte score.
   - Test dat `verander_animatie` daadwerkelijk visueel rendert.
   - Test dat `als 1 < 2`-blok bij gebruik leidt tot scoring-aftrek (alle vier niveaus).
5. **Timing**: stopwatch per niveau. Flag bij > 10 min op LJ3H.

---

## 10. Bij twijfel: stop en vraag

Voor de volgende situaties **niet zelf beslissen**:

1. De blokprogrammeer-component exposes geen AST en kan niet eenvoudig worden uitgebreid. Beschrijf wat er wel beschikbaar is.
2. `BizzyState` heeft een fundamenteel andere structuur dan in v6 verondersteld. Schets de werkelijke structuur.
3. Blok-IDs zijn anders georganiseerd dan in `beschikbareBlokken` (bv. één parametriseerbaar blok ipv presets). Beschrijf de werkelijke structuur en pas de items.ts mappings aan.
4. Animatie-blok kan niet visueel renderen (geen animatie-assets aanwezig). Vraag of placeholder acceptabel is.
5. Een testscore wijkt af van de verwachte waarde in §6.1 ook na patches. Beschrijf het verschil en stel een ophelderende vraag.

In al die gevallen: maak een issue/comment, beschrijf de afwijking, vraag Pim om besluit. **Niet zelf interpreteren.**

---

## 11. PR-template

**Titel:**
```
content(v7): PT7 v7 — niveau-progressie + strikte volgorde + anti-bypass-scoring (alle 4 versies)
```

**Body:**
```markdown
Voert door wat staat in `codex_v7/CODEX_PR_PLAN_v7_pt7.md`.

## Wijzigingen
- LJ1V: `denkt "Klaar!"` als 4e actie toegevoegd; scoring met expliciete blok-keuze-criteria (zeg vs denk, vooruit vs achteruit, 180° vs 90°).
- LJ1H: opdracht-tekst aangescherpt naar "Klaar voor de start!"; `draai 180°` toegevoegd als 4e actie ná de herhaal; strikte nesting-check op verp-in-herhaal.
- LJ3V: volledige content-vervang (vierkant lopen, herhaal-4 met strikt geneste body `[verp 1m vooruit, draai 90°]`).
- LJ3H: volledige content-vervang (heen-en-weer 3x, herhaal-3 met strikt geneste body `[verp 2m, draai 180°, verp 2m, draai 180°]`).
- `BizzyState` uitgebreid met `lastThought` + `denk`/`herhaal_start`/`herhaal_end`-events.
- Blokpalet: `verander_animatie` als neutraal werkend blok in alle vier niveaus; `open link`-blok verborgen op PT7-canvases.

## Auto-scoring blijft gegarandeerd
Alle vier items scoren via:
- AST-walk (structuur + nesting + strikte body-volgorde),
- eindstate (positie tolerantie 0.1 m, oriëntatie modulo 360°),
- event-stream (volgorde van zeg/denk/herhaal).

Geen open tekstvelden toegevoegd.

## Tests
- 24 nieuwe unit tests (6 per item) — alle groen.
- Coverage van `scorePT7Item` ≥ 90%.

## Verify-scripts
- `npm run verify:anchors` — PT7 geen anker; ongewijzigd resultaat t.o.v. v6.
- `npm run report:kd-coverage` — KD22B blijft 4 pt per versie.

## Out of scope
- Variabelen + sensoren in blokpalet — v8.
- Andere PT-/SR-items in deze release — ongewijzigd.

## Pilot-checks
- Mediane afnametijd per versie te meten met 2-3 leerlingen per niveau.
- Flag bij > 10 min op LJ3H.

## Files
- `src/data/assessments.ts` (data — 4 PT7-items vervangen)
- `src/scoring/pt7.ts` (criteriaByItem-map + helpers)
- `src/data/blocks.ts` (blokpalet uitbreiding)
- `frontend/src/components/BlockProgrammingBlock.*` (AST-export + denk/herhaal events)
- `__tests__/pt7-v7.spec.ts` (24 tests)
- `huidige_vragenlijsten_specificatie.md` (v7-PT7-content)
- `nulmetingen_dg_v7_specificatie.md` (nieuw)
```

---

## 12. Tijdsestimatie

| Commit | Inschatting |
|---|---|
| C1 types + events | 30-45 min |
| C2 blokpalet + canvas | 2-3 uur (animatie-rendering, denk-wolk, event-logging) |
| C3 items vervangen | 30 min |
| C4 scoring-helpers | 1-2 uur |
| C5 unit-tests | 2-3 uur (24 tests + fixture-helper) |
| C6 docs sync | 30 min |

**Totaal:** circa 7-10 uur ontwikkeltijd, afhankelijk van hoe vlot de canvas-renderer de nieuwe events oppakt.

---

*Einde plan. Werk de commits door in de aangegeven volgorde. Bij elke twijfel: terug naar §10.*
