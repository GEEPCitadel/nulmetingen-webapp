# CODEX INSTRUCTIONS — Nulmetingen DG, PT7 v7 (volledige herziening)

**Doelpubliek:** Codex (of vergelijkbare coding-agent) die direct in de webapp gaat patchen.
**Scope van deze release:** uitsluitend PT7-Blokprogrammeren in alle vier de toetsversies (`lj1-vmbo`, `lj1-hv`, `lj3-vmbo`, `lj3-hv`). Verving Fix 1 uit v6 met een betere afgestemde set.
**Bron-of-truth voor huidige content:** `src/data/assessments.ts`.
**Bron-of-truth voor doel-content:** dit document + `nulmeting_v7_pt7_items.ts` + `nulmeting_v7_pt7_scoring_helpers.ts`.
**Harde randvoorwaarde:** alle scoring volledig automatisch. Geen open tekstvelden, geen docent-rubrics. Als iets niet automatisch scoorbaar is — **stop en vraag**.

---

## 1. Wat verandert er ten opzichte van v6

| Item | v6-status | v7-actie |
|---|---|---|
| `lj1v-pt7-programming` | Sequentie van 4 blokken (verplaats, draai, wacht, zeg) | **Kleine herziening:** vervang `wacht 1 sec.` door `Bizzy denkt "Klaar!"` als 4e actie. Scoring met expliciete blok-keuze-criteria. |
| `lj1h-pt7-programming` | Sequentie + herhaal-3 met 1 nested blok | **Kleine herziening:** opdracht-tekst aanscherpen naar "Klaar voor de start!"; `draai 180°` toegevoegd ná de herhaal als 4e actie. Scoring met strikte nesting-check. |
| `lj3v-pt7-programming` | Vierkant lopen met herhaal-4 (geneste verp 1m + draai 90°) + zeg "Klaar!" | **Inhoudelijke aanpassing:** vervang afsluitend `zegt "Klaar!"` door `denkt "Klaar!"` (test zeg/denk-onderscheid). Begin met `zegt "Start!"`. Scoring met oriëntatie-modulo-check toegevoegd. |
| `lj3h-pt7-programming` | Heen-en-weer 3× met strikte volgorde-check van 4 nested blokken | **Inhoudelijke aanpassing:** strikte-volgorde-eis vervangen door functionele samenstelling-eis (precies 2× `verplaats 2m vooruit` + 2× `draai 180°` in dezelfde herhaal-3, mits afgewisseld). Oriëntatie-check toegevoegd. "Bravo!" moet ná de herhaal staan; herhaal-blok is verplicht voor criterium 3. |

**Karakter:** `Bizzy` (default-naam). De actor-dropdown in het palet toont mogelijk een placeholder zoals "Hulkbuster" — verifieer in `src/data/blocks.ts` (of equivalent) dat `Bizzy` de standaardwaarde is. Pas indien nodig aan.

---

## 2. Buiten scope (NIET aankomen)

- Items en versies anders dan PT7 — ongewijzigd. Geen Selected-Response, geen Mail, geen Excel, geen PT8.
- Blokpalet-uitbreiding (variabelen, sensoren, geluid-blokken) — apart traject voor v8.
- Canvas-rendering, design-system, App.js routing, backend endpoints — ongewijzigd.

---

## 3. Pre-flight (verplicht voor je begint)

1. **Open** `src/data/assessments.ts`. Verifieer dat de vier PT7-item-ids bestaan:
   `lj1v-pt7-programming`, `lj1h-pt7-programming`, `lj3v-pt7-programming`, `lj3h-pt7-programming`.
   Als een id afwijkt, **stop** en rapporteer.

2. **Open** het PT7Item-type (waarschijnlijk in `src/data/assessments.ts` of `src/types/items.ts`).
   Verifieer dat het veld `criteriaSpec: string` bestaat. Zo niet, voeg toe.
   Verifieer dat het veld `correctProgram: BlockNode` bestaat. Zo niet, voeg toe (zie `BlockNode` in `nulmeting_v7_pt7_items.ts`).

3. **Lees** `nulmeting_v6_scoring_helpers.ts` regel 313–510 (sectie "4. PT7 BLOKPROGRAMMEREN — scoring"). De v7-scoring uit `nulmeting_v7_pt7_scoring_helpers.ts` is een drop-in vervanging van de `criteriaByItem` map daarin. De helpers (`findBlock`, `blockMatches`, `eventIndex`) blijven ongewijzigd én herbruikbaar.

4. **Lees** het `BizzyState`-type in `nulmeting_v6_scoring_helpers.ts` regel 316–328. Voor v7 voeg toe:
   - `lastThought: string | null`  (apart van `lastSpoken`)
   - Het `events`-array moet een entry `{ type: "denk", value: <tekst>, tick }` ondersteunen naast `zeg`.
   - Het `events`-array moet `{ type: "herhaal_start", value: <aantal>, tick }` en `{ type: "herhaal_end", value: <aantal>, tick }` ondersteunen voor positie-checks "vóór/ná de herhaal".

5. **Maak feature-branch:** `git checkout -b content/nulmeting-pt7-v7`.

6. **Tests draaien:** `npm test`. Zorg dat huidige tests groen zijn voor je begint.

---

## 4. Specificatie per item

### 4.1 LJ1V — `lj1v-pt7-programming` (kleine herziening)

**Inleidende tekst (boven de canvas):**
> Dit is **Bizzy**, een karakter dat kan bewegen, draaien, zeggen en denken. Programmeer Bizzy door blokken op het werkvlak te slepen. Klik op ▶ om je programma uit te voeren. Je hoeft niet alle blokken te gebruiken.

**Leerlingopdracht:**
> Als er op afspelen wordt geklikt:
> 1. Bizzy **zegt** `"Hoi!"` (een spreekwolk).
> 2. Bizzy loopt **1 meter vooruit**.
> 3. Bizzy draait naar **180°** (met de wijzers van de klok mee).
> 4. Bizzy **denkt** `"Klaar!"` (een denkwolk).

**Beschikbare blokken (in palette):**
- `wanneer_klik_afspelen`
- `wanneer_klik_bizzy` _(afleider)_
- `verander_animatie` _(neutraal — niet vereist, geen afleider; canvas rendert de animatie)_
- `zeg_hoi`
- `denk_klaar`
- `verplaats_1m_vooruit`
- `verplaats_1m_achteruit` _(afleider)_
- `draai_180_graden`
- `draai_90_graden` _(afleider)_
- `wacht_1_sec`
- `herstart_scene` _(afleider)_
- `als_1_kleiner_2` _(afleider)_

**Correct programma:** zie `lj1vPt7Programming` in `nulmeting_v7_pt7_items.ts`.

**Scoring (`criteriaSpec: "pt7-lj1v-v7"`):**
1. Bizzy zegt "Hoi!" gebruikt (zeg-blok, niet denk).
2. `verplaats 1m vooruit` gebruikt (afstand=1, richting=vooruit).
3. `draai 180°` gebruikt (hoek=180).
4. Eindgedrag klopt (1m bewogen, 180° gedraaid, zegt "Hoi!", denkt "Klaar!" in correcte volgorde) **én** geen kritieke afleider (verkeerd startevent, achteruit, als, herstart).

---

### 4.2 LJ1H — `lj1h-pt7-programming` (kleine herziening)

**Leerlingopdracht:**
> Als er op afspelen wordt geklikt:
> 1. Bizzy zegt `"Klaar voor de start!"`
> 2. Bizzy loopt **drie keer** 1 meter vooruit — gebruik een herhaal-blok.
> 3. Bizzy draait naar 180°.

**Beschikbare blokken:**
- `wanneer_klik_afspelen`
- `verander_animatie` _(neutraal)_
- `zeg_klaar_voor_de_start`
- `denk_hm` _(afleider)_
- `verplaats_1m_vooruit`
- `verplaats_3m_vooruit` _(afleider — schijnoplossing zonder iteratie)_
- `verplaats_1m_achteruit` _(afleider)_
- `draai_180_graden`
- `draai_90_graden` _(afleider)_
- `herhaal_3_keer`
- `herhaal_10_keer` _(afleider)_
- `herhaal_1_keer` _(afleider)_
- `wacht_1_sec`
- `als_1_kleiner_2` _(afleider)_
- `herstart_scene` _(afleider)_

**Correct programma:** zie `lj1hPt7Programming` in items.ts.

**Scoring (`criteriaSpec: "pt7-lj1h-v7"`):**
1. Bizzy zegt "Klaar voor de start!" gebruikt.
2. `herhaal` met `aantal=3` aanwezig (niet 1, niet 10).
3. `verplaats 1m vooruit` is **genest binnen** de `herhaal 3 keer voor`.
4. Eindgedrag klopt (3m bewogen, 180° gedraaid) **én** geen kritieke afleider (verp 3m los, herhaal-10, herhaal-1, achteruit, als, herstart).

---

### 4.3 LJ3V — `lj3v-pt7-programming` (inhoudelijke aanpassing)

**Leerlingopdracht:**
> Bizzy loopt een **vierkant** op het werkvlak. Elke zijde is 1 meter; op elke hoek draait Bizzy een kwartslag (90°). Bizzy zegt **vóór** het lopen `"Start!"` en denkt **na** het lopen `"Klaar!"`.

**Beschikbare blokken:**
- `wanneer_klik_afspelen`
- `verander_animatie` _(neutraal)_
- `zeg_start`
- `denk_klaar`
- `zeg_klaar` _(afleider — wisselt zeg/denk)_
- `verplaats_1m_vooruit`
- `verplaats_1m_achteruit` _(afleider)_
- `draai_90_graden`
- `draai_180_graden` _(afleider — verkeerde hoek voor vierkant)_
- `herhaal_4_keer`
- `herhaal_3_keer` _(afleider)_
- `herhaal_2_keer` _(afleider)_
- `wacht_1_sec`
- `als_1_kleiner_2` _(afleider)_
- `herstart_scene` _(afleider)_

**Correct programma:** zie `lj3vPt7Programming` in items.ts.

**Scoring (`criteriaSpec: "pt7-lj3v-v7"`):**
1. `herhaal` met `aantal=4` aanwezig.
2. **Binnen de herhaal-4 staan precies de twee blokken in deze volgorde:** `verplaats 1m vooruit → draai 90°`. (Strikte volgorde-eis — sequentie is bij programmeren betekenisdragend.)
3. Eindpositie ≈ startpositie (|Δx|<0.1 én |Δy|<0.1) **én** eindoriëntatie = startoriëntatie (modulo 360°).
4. Bizzy **zegt** "Start!" **vóór** de herhaal **én** **denkt** "Klaar!" **ná** de herhaal **én** geen kritieke afleider.

---

### 4.4 LJ3H — `lj3h-pt7-programming` (inhoudelijke aanpassing)

**Leerlingopdracht:**
> Bizzy danst een choreografie. **Drie keer** maakt hij hetzelfde "heen-en-weer-rondje": 2 meter vooruit, omdraaien (180°), 2 meter vooruit (= terug), opnieuw omdraaien (180°). Aan het eind zegt hij `"Bravo!"`.

**Beschikbare blokken:**
- `wanneer_klik_afspelen`
- `verander_animatie` _(neutraal)_
- `zeg_bravo`
- `denk_bravo` _(afleider)_
- `verplaats_2m_vooruit`
- `verplaats_1m_vooruit` _(afleider — parameter-fout)_
- `verplaats_2m_achteruit` _(afleider)_
- `draai_180_graden`
- `draai_90_graden` _(afleider)_
- `herhaal_3_keer`
- `herhaal_6_keer` _(afleider — uitgepakte iteratie)_
- `herhaal_2_keer` _(afleider)_
- `wacht_1_sec`
- `als_1_kleiner_2` _(afleider)_
- `herstart_scene` _(afleider)_

**Correct programma:** zie `lj3hPt7Programming` in items.ts.

**Scoring (`criteriaSpec: "pt7-lj3h-v7"`):**
1. `herhaal` met `aantal=3` aanwezig.
2. **Binnen die herhaal-3 staan precies de vier blokken in deze volgorde:** `verplaats 2m vooruit → draai 180° → verplaats 2m vooruit → draai 180°`. (Strikte volgorde-eis — sequentie is bij programmeren betekenisdragend.)
3. Eindpositie = startpositie **én** eindoriëntatie = startoriëntatie (modulo 360°) **én** er is **ten minste één `herhaal`-blok gebruikt waarna `"Bravo!"` wordt gezegd**.
4. Parameter-precisie: GEEN `verplaats 1m`, GEEN `verplaats 2m achteruit`, GEEN `draai 90°`, GEEN `herhaal 6 keer`, geen `als`, geen `herstart`.

---

## 5. Implementatie-stappen

**Stap A — Item-data updaten.**
Open `src/data/assessments.ts`. Vervang de vier PT7-items met de exports uit `nulmeting_v7_pt7_items.ts`. De canonical-export-namen zijn `lj1vPt7Programming`, `lj1hPt7Programming`, `lj3vPt7Programming`, `lj3hPt7Programming`. Zorg dat de itemIds (zelfde als v6) intact blijven zodat aggregaat-rapporten niet breken. Update `criteriaSpec` naar de v7-waarden (`pt7-lj1v-v7`, etc.).

**Stap B — Scoring-helpers updaten.**
Open de scoring-module (vermoedelijk `src/scoring/pt7.ts` of `backend/scoring/pt7.ts`). Vervang de `criteriaByItem`-map met de export uit `nulmeting_v7_pt7_scoring_helpers.ts`. De v6-helpers (`findBlock`, `blockMatches`, `eventIndex`) blijven ongewijzigd.

**Stap C — `BizzyState` uitbreiden.**
Voeg `lastThought: string | null` toe. Zorg dat de blokprogrammeer-component bij `Bizzy denkt "X"` een entry `{ type: "denk", value: "X", tick }` in `events` push én `lastThought = "X"` zet. Identiek voor `herhaal_start` en `herhaal_end` events.

**Stap D — Blokpalet updaten.**
Open `src/data/blocks.ts` (of equivalent). Verifieer dat alle `beschikbareBlokken`-ids uit de v7-items renderbaar zijn. Voeg waar nodig nieuwe block-renderers toe (`zeg_start`, `zeg_bravo`, `zeg_klaar_voor_de_start`, `denk_klaar`, `denk_hm`, `denk_bravo`, `verplaats_2m_vooruit`, `verplaats_3m_vooruit`, `verplaats_2m_achteruit`, `herhaal_4_keer`, `herhaal_6_keer`, `herhaal_2_keer`).

**Stap E — Tests schrijven.**
Per item minstens zes unit tests volgens de testmatrix uit §6. Plaats in `src/scoring/pt7.test.ts` of `backend/scoring/pt7.test.ts`. Test alle scenario's uit de anti-bypass-tabel.

**Stap F — Documentatie bijwerken.**
Update `huidige_vragenlijsten_specificatie.md` en `alle_vragen_en_afleiders_huidig.md`. Maak een nieuwe `nulmetingen_dg_v7_specificatie.md` als kopie van v6 met alleen de PT7-secties vervangen.

---

## 6. Acceptatiecriteria

- [ ] Alle vier PT7-items hebben een v7-content payload (`instructie`, `beschikbareBlokken`, `correctProgram`, `criteriaSpec`).
- [ ] Alle vier `criteriaSpec`-waarden (`pt7-lj1v-v7` t/m `pt7-lj3h-v7`) zijn gedefinieerd in de scoring-helpers.
- [ ] `BizzyState` ondersteunt `lastThought`, `denk`-events, `herhaal_start`/`herhaal_end`-events.
- [ ] Alle blok-ids uit de palettes hebben een renderer in de blokpalet-component.
- [ ] Unit tests per item dekken **minimaal**: correct programma → max-pt; lege canvas → 0/4; alleen event-blok → 0/4; één scenario uit de anti-bypass-tabel per item; één scenario met denk/zeg verwisseld; één scenario met parameter-fout.
- [ ] Volledige doorloop per versie zonder JS-errors (handmatig of E2E).
- [ ] `npm test` slaagt.
- [ ] `npm run verify:anchors` slaagt nog steeds (PT7 is geen anker, andere ankers ongewijzigd).
- [ ] KD22B-totalen per versie blijven 4 pt (geen wijziging in `kdTags`).

**Testmatrix per item (verplichte scenario's):**

| Item | Scenario | Verwachte score |
|---|---|---|
| LJ1V | Correct programma | 4 |
| LJ1V | `denkt "Hoi!"` ipv `zegt` | 3 |
| LJ1V | `verplaats 1m achteruit` ipv vooruit | 2 |
| LJ1V | `wanneer op Bizzy geklikt` ipv afspelen | 3 (structuur OK, eindstate niet uitgevoerd) |
| LJ1H | Correct programma | 4 |
| LJ1H | Drie losse `verp 1m vooruit` zonder herhaal | 2 |
| LJ1H | `verp 3m vooruit` los (geen herhaal) | 1 |
| LJ1H | `herhaal 10 keer` met verp 1m genest | 2 |
| LJ3V | Correct programma | 4 |
| LJ3V | 4× los verp + 4× los draai zonder herhaal | 2 |
| LJ3V | `herhaal 3 keer` ipv 4 met juiste body | 1 |
| LJ3V | `herhaal 4 keer` met alleen `verp 1m` (draai vergeten) | 2 |
| LJ3V | `herhaal 4 keer` met body `[draai 90°, verp 1m]` (omgekeerde volgorde) | 3 |
| LJ3V | Correct maar `zegt "Klaar!"` ipv `denkt` | 3 |
| LJ3V | Correct programma + `verander_animatie naar dansen` toegevoegd (neutraal) | 4 |
| LJ3H | Correct programma | 4 |
| LJ3H | `herhaal 6 keer` met 2-blok body | 1 |
| LJ3H | 12 losse blokken zonder herhaal | 1 |
| LJ3H | `herhaal 3 keer` met `verp 1m`-body ipv `verp 2m` | 2 |
| LJ3H | `herhaal 3 keer` met body `[draai 180°, verp 2m, draai 180°, verp 2m]` (omgekeerde volgorde) | 3 |
| LJ3H | `denkt "Bravo!"` ipv `zegt` | 3 |

---

## 7. PR-template

Titel: `content: PT7 v7 — niveau-progressie + anti-bypass-scoring, alle 4 versies`

Body:

```
Voert door wat staat in CODEX_INSTRUCTIONS_PT7_v7.md.

## Wijzigingen
- LJ1V: denkt "Klaar!" als 4e actie toegevoegd, scoring met blok-keuze-criteria.
- LJ1H: tekst aangescherpt + draai 180° als 4e actie; strikte nesting-check.
- LJ3V: volledige content-vervang (vierkant lopen, herhaal-4 met geneste verp+draai90°).
- LJ3H: volledige content-vervang (heen-en-weer 3×, herhaal-3 met 4-blok body, functionele samenstelling-check).
- BizzyState uitgebreid met lastThought en denk/herhaal-events.

## Tests
- 24 nieuwe unit tests (6 per item) volgens testmatrix in §6 van de instructies.
- Alle bestaande tests groen.
- `npm run verify:anchors` slaagt.

## Out of scope
- Blokpalet-uitbreiding (variabelen, sensoren) — v8.
- Andere PT- of SR-items in deze release — ongewijzigd.

## Pilot-checks
- Mediane afnametijd per versie: LJ1V 3-5 min, LJ1H 4-6 min, LJ3V 5-8 min, LJ3H 6-10 min.
- Flag bij > 10 min op LJ3H.
```

---

## 8. Bestanden bij deze release

| Pad | Inhoud |
|---|---|
| `codex_v7/CODEX_INSTRUCTIONS_PT7_v7.md` | Dit document |
| `codex_v7/nulmeting_v7_pt7_items.ts` | Item-payloads voor alle 4 PT7-versies |
| `codex_v7/nulmeting_v7_pt7_scoring_helpers.ts` | Criteria-map per criteriaSpec |
| `PT7_blokprogrammeren_v7_voorstel.md` | Onderwijs-inhoudelijke onderbouwing (read-only voor Codex) |
