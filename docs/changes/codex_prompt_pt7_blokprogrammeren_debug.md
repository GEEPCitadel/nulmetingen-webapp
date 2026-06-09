# Codex-opdracht — herontwerp PT7 Blokprogrammeren naar debugtaak

## Doel van deze opdracht

Vervang de huidige PT7-opdracht **Blokprogrammeren** in alle vier metingen door een sterkere debugtaak.

De huidige taak laat leerlingen vooral zelf code bouwen. De nieuwe taak moet meten of leerlingen:

1. een visueel doel kunnen vergelijken met bestaande blokcode;
2. twee fouten in bestaande code kunnen aanwijzen;
3. de code handelend kunnen verbeteren door blokken te slepen/vervangen;
4. de oplossing kunnen testen met `Afspelen`;
5. de uitgevoerde stappen kunnen terugzien in een uitvoerlog.

De taak blijft volledig automatisch scoreerbaar en blijft gekoppeld aan **kerndoel/subdoel 22B — programmeren / computational thinking**.

---

## Scope

Pas alleen PT7 / Blokprogrammeren aan.

Werk de PT7-varianten bij voor:

- `lj1-vmbo`
- `lj1-hv`
- `lj3-vmbo`
- `lj3-hv`

Vervang of migreer deze bestaande items:

- `lj1v-pt7-programming`
- `lj1h-pt7-programming`
- `lj3v-pt7-programming`
- `lj3h-pt7-programming`

Gebruik bij voorkeur nieuwe item-id's met expliciete debugversie:

- `lj1v-pt7-programming-debug-v1`
- `lj1h-pt7-programming-debug-v1`
- `lj3v-pt7-programming-debug-v1`
- `lj3h-pt7-programming-debug-v1`

Laat alle andere PT's, SR-items, vraagvolgorde, scorearchitectuur, rapportageblokken en opslagregels ongemoeid, behalve waar PT7 technisch moet worden aangesloten.

---

## Niet aanpassen

Codex mag in deze opdracht niets wijzigen aan:

- PT1 bestanden/mappen;
- PT2 mail opstellen;
- PT3 security/phishing/account;
- PT4 Excel/data;
- PT6 schermdelen;
- PT8 Whutsupp/online gedrag;
- selected-response-vragen;
- vraag 3;
- vraag 9;
- de zelfinschatting;
- totale toetsstructuur;
- globale navigatieknoppen;
- rapportageteksten buiten noodzakelijke PT7-labels;
- scoremaximum van de toets buiten bestaande PT7-score.

PT7 blijft maximaal **4 punten**.

---

## Ontwerpprincipe

Gebruik geen open programmeeropdracht meer waarbij de leerling vanaf een leeg werkblad moet bouwen.

Gebruik in alle varianten deze structuur:

1. toon een visueel doel;
2. toon bestaande blokcode met precies twee fouten;
3. gebruik een realistische, grotere blokkenbak;
4. laat de leerling eerst de twee foute blokken aanwijzen;
5. laat de leerling de fouten herstellen door blokken te slepen of te vervangen;
6. laat de leerling testen met `Afspelen`;
7. speel de acties in rustig tempo af;
8. markeer tijdens het afspelen steeds het actieve blok;
9. toon een uitvoerlog dat terug te lezen is;
10. score automatisch op aangewezen fouten, eindcode en testbewijs.

De opdracht wordt dus geen kleine puzzel met minimale blokkenbak. De blokkenbak moet juist realistisch blijven, vergelijkbaar met Scratch, Delightex of CoSpaces: meerdere categorieen, meerdere plausibele afleiders en niet alleen de benodigde herstelblokken.

De taligheid wordt verminderd door het visuele doel, niet door de blokkenbak kunstmatig klein te maken.

---

## Globale UI-eisen PT7

### Layout

Gebruik bij voorkeur deze opbouw:

1. bovenaan: titel `Blokprogrammeren`;
2. daaronder: korte leerlinginstructie;
3. links: realistische blokkenbak met categorieen;
4. midden: werkblad met bestaande code;
5. rechts of boven het speelveld: visueel doel;
6. onder of naast het speelveld: uitvoerlog;
7. knop `Afspelen` duidelijk zichtbaar.

### Stappen in de taak

De leerling moet:

1. de twee foute blokken in de bestaande code aanklikken;
2. daarna de code verbeteren;
3. daarna op `Afspelen` klikken.

De UI mag het selecteren van foutblokken beperken tot maximaal 2 geselecteerde blokken. De leerling moet blokken kunnen deselecteren voordat hij/zij verdergaat.

### Foute blokken aanwijzen

- De foute blokken mogen niet vooraf visueel worden verraden.
- Na selectie mag een gekozen blok een rand/markering krijgen.
- De UI toont niet of de selectie correct is voordat de leerling test of verdergaat.
- De selectie wordt gelogd via vaste block-id's.

### Realistische blokkenbak

De blokkenbak moet groter zijn dan strikt noodzakelijk.

Gebruik meerdere categorieen, bijvoorbeeld:

- Gebeurtenissen
- Beweging
- Besturing
- Uiterlijk/output
- Variabelen
- Voorwaarden
- Waarnemen/invoer
- Logica

Niet elke categorie is in elke leerjaarvariant nodig, maar de blokkenbak mag niet gereduceerd worden tot alleen de twee juiste herstelblokken.

### Testen

De knop `Afspelen` is verplicht.

`Afspelen` is niet alleen een check aan het einde, maar onderdeel van de debugtaak. De leerling moet kunnen zien wat de code doet, waar het afwijkt van het doel en wat er net is uitgevoerd.

---

## Algemene scoring PT7

PT7 blijft maximaal 4 punten.

| Onderdeel | Punten | Automatisch criterium |
|---|---:|---|
| Foutblokken aanwijzen | 1 | de twee correcte foutblokken zijn geselecteerd |
| Fout 1 herstellen | 1 | de eerste fout is correct hersteld in de eindcode |
| Fout 2 herstellen | 1 | de tweede fout is correct hersteld in de eindcode |
| Testbewijs | 1 | na de laatste codewijziging is op `Afspelen` geklikt en de output matcht het visuele doel |

### Scoring foutblokken aanwijzen

Gebruik deze regel:

- 1 punt als de geselecteerde set exact gelijk is aan `wrongBlockIds`;
- 0 punten in alle andere gevallen;
- `Ik weet het niet` of geen selectie = 0 punten.

Als de UI maximaal 2 foutblokken laat selecteren, is er geen extra strafregel nodig voor "alles aanklikken".

### Scoring herstel

Score herstel op semantisch correcte eindcode.

Bij voorkeur geldt:

- het foute blok is vervangen door het juiste herstelblok;
- de volgorde of nesting is correct;
- bestaande correcte blokken blijven correct staan;
- kritieke afleiders in de eindcode leveren geen punt op voor het betreffende onderdeel.

### Scoring testbewijs

Ken het testpunt alleen toe als:

- `playedAfterLastChange = true`;
- de execution trace volledig is uitgevoerd;
- `goalMatched = true`;
- bij varianten met meerdere testcases alle verplichte testcases kloppen.

Een correcte eindcode zonder test na de laatste wijziging krijgt maximaal 3 van de 4 punten.

---

## Afspelen: tempo, actieve blokmarkering en uitvoerlog

### Harde eis

De simulatie mag na klikken op `Afspelen` niet instant naar de eindtoestand springen.

De geprogrammeerde acties moeten op een goed te volgen tempo worden afgespeeld. Tijdens het afspelen moet steeds zichtbaar zijn welk blok wordt uitgevoerd.

### Tempo-richtlijn

Gebruik minimaal deze richtlijnen:

- startblok: minimaal 0,5 seconde zichtbaar;
- beweging: 0,8 tot 1,0 seconde per zichtbare beweging;
- draai: ongeveer 0,8 seconde;
- output/tekstballon: minimaal 1,2 seconde zichtbaar;
- pauze tussen blokken: ongeveer 0,3 seconde;
- geneste blokken binnen `herhaal`, `als`, `anders` worden ook zichtbaar gemarkeerd.

Voeg eventueel een snelheidskeuze toe:

- `Langzaam`
- `Normaal`

Standaard moet `Normaal` rustig genoeg zijn voor vmbo1.

### Actieve blokmarkering

Tijdens `Afspelen`:

- markeer steeds het actieve blok met duidelijke rand, highlight of glow;
- markeer ook geneste blokken wanneer die worden uitgevoerd;
- scroll het codegebied mee als het actieve blok buiten beeld zou vallen;
- verwijder de markering pas wanneer de zichtbare actie is afgerond.

Voorbeeld:

```text
Actief blok: draai naar links
Bizzy draait links
Leerling ziet dat het doel rechts aangeeft
```

### Zichtbaar uitvoerlog

Toon na elke klik op `Afspelen` een zichtbaar log met de uitgevoerde stappen.

Het log moet na afloop zichtbaar blijven totdat:

- de leerling opnieuw op `Afspelen` klikt, of
- de code wijzigt.

Als de code wijzigt, mag het oude zichtbare log blijven staan met label `Vorige test`, maar het mag ook vervangen worden bij de volgende test. Technisch moeten runs wel gelogd blijven.

Voor vmbo1 moet het log taalarm en visueel zijn.

Voorbeeld vmbo1:

```text
Uitgevoerd
1. Start
2. -> 1 stap vooruit
3. <- draai links
4. "Klaar"
```

Voor leerjaar 3 vmbo:

```text
Uitgevoerd
1. teller = 0
2. knop A
3. teller +2 -> teller = 2
4. teller > 5? nee
5. zeg "Nog plek"
```

Voor leerjaar 3 havo/vwo:

```text
Test: 27 graden + raam dicht
1. temperatuur = 27
2. raamOpen = nee
3. temperatuur > 25 OF raamOpen = ja -> waar
4. toon "Koelen"

Verwacht: Oke
Jouw code: Koelen
```

Gebruik in de echte UI Nederlandse tekst. Gebruik waar nodig `Oké` met accent als de UI dit al ondersteunt; anders mag intern `Oke` als id/waarde gebruikt worden.

---

## Technische logging

Log minimaal op itemniveau:

```json
{
  "itemId": "lj1v-pt7-programming-debug-v1",
  "itemVersion": "pt7-debug-v1",
  "selectedWrongBlockIds": [],
  "selectedNonWrongBlockIds": [],
  "replacementActions": [],
  "finalProgramState": {},
  "playCount": 0,
  "playedAfterLastChange": false,
  "simulationResult": {},
  "goalMatched": false,
  "unknown": false,
  "errorCategories": []
}
```

Log per afspeelrun:

```json
{
  "runId": "run-001",
  "timestamp": "ISO-8601",
  "playCount": 1,
  "programStateAtPlay": {},
  "playedAfterLastChange": true,
  "executionTrace": [],
  "goalMatched": false,
  "failedStepId": null,
  "finalOutput": null,
  "itemVersion": "pt7-debug-v1"
}
```

Log per uitgevoerde stap:

```json
{
  "blockId": "turn_left_block",
  "blockLabel": "draai naar links",
  "blockType": "movement",
  "actionType": "turn",
  "beforeState": {},
  "afterState": {},
  "visibleOutput": "Bizzy draait links",
  "matchedExpectedStep": false
}
```

Log ook, waar van toepassing:

- `firstRunBeforeEdit`
- `runBeforeEditCount`
- `runAfterEditCount`
- `lastChangedAt`
- `lastPlayedAt`
- `testCaseResults`
- `misconceptionFlags`

Voorbeelden van `misconceptionFlags`:

- `left_right_confusion`
- `distance_confusion`
- `message_output_confusion`
- `repeat_count_confusion`
- `counter_increment_confusion`
- `greater_than_vs_at_least_confusion`
- `and_or_confusion`
- `else_output_confusion`

---

# Variant 1 — Leerjaar 1 VMBO

## Metadata

```yaml
assessmentId: lj1-vmbo
oldItemId: lj1v-pt7-programming
newItemId: lj1v-pt7-programming-debug-v1
section: pt7
title: Blokprogrammeren
type: block_debug_task
subgoal: 22B
skillDomain: 22B Programmeren
points: 4
device: bizzy
languageLevel: very_low
constructFocus: sequentie, afstand, richting, output
```

## Leerlinginstructie

Gebruik zeer weinig tekst:

```text
Kijk naar DOEL.

Er zijn 2 fouten.
Tik ze aan.
Maak de code goed.
Klik Afspelen.
```

Gebruik niet de oude lange zin:

```text
Programmeer Bizzy zodat hij eerst 2 stappen vooruit gaat, daarna naar rechts draait, daarna "Klaar" zegt.
```

## Visueel doel

Toon een doelkaart boven of naast het werkblad:

```text
DOEL
START  ->  ->  rechts  "Klaar"
```

Maak dit visueel met pijlen/iconen:

```text
START  ->  ->  ↱  💬 Klaar
```

Gebruik bij voorkeur een kleine routekaart met start en richting. Tekst is ondersteunend, niet leidend.

## Bestaande code met twee fouten

```text
bij start
1 stap vooruit        [fout]
draai naar links      [fout]
zeg "Klaar"
```

## Juiste code

```text
bij start
2 stappen vooruit
draai naar rechts
zeg "Klaar"
```

## `wrongBlockIds`

```json
[
  "lj1v_move_1_forward_initial",
  "lj1v_turn_left_initial"
]
```

## Grote blokkenbak VMBO 1

### Gebeurtenissen

```text
bij start
als Bizzy wordt aangeraakt
als spatie wordt ingedrukt
```

### Beweging

```text
1 stap vooruit
2 stappen vooruit
3 stappen vooruit
1 stap achteruit
2 stappen achteruit
draai naar rechts
draai naar links
```

### Besturing

```text
wacht 1 seconde
herhaal 2 keer
herhaal 3 keer
```

### Uiterlijk

```text
zeg "Hoi"
zeg "Klaar"
zeg "Stop"
```

## Scoring VMBO 1

| Onderdeel | Punt | Correct criterium |
|---|---:|---|
| Foutblokken aanwijzen | 1 | `1 stap vooruit` en `draai naar links` zijn aangewezen |
| Afstand herstellen | 1 | `1 stap vooruit` is vervangen door `2 stappen vooruit` |
| Richting herstellen | 1 | `draai naar links` is vervangen door `draai naar rechts` |
| Testbewijs | 1 | na laatste wijziging op `Afspelen`; Bizzy doet 2 vooruit, draait rechts en zegt `Klaar` |

## Verwacht uitvoerlog na correcte oplossing

```text
Uitgevoerd
1. Start
2. -> 2 stappen vooruit
3. ↱ draai rechts
4. "Klaar"
```

## Foutfeedback VMBO 1

Houd feedback taalarm.

Gebruik bijvoorbeeld:

```text
Nog niet hetzelfde als DOEL.
Kijk naar stap 2.
```

Of visueel:

```text
DOEL:      -> -> ↱  Klaar
JOUW TEST: ->    ↰  Klaar
```

Gebruik geen technische foutuitleg.

---

# Variant 2 — Leerjaar 1 HAVO/VWO

## Metadata

```yaml
assessmentId: lj1-hv
oldItemId: lj1h-pt7-programming
newItemId: lj1h-pt7-programming-debug-v1
section: pt7
title: Blokprogrammeren
type: block_debug_task
subgoal: 22B
skillDomain: 22B Programmeren
points: 4
device: bizzy
languageLevel: low
constructFocus: herhaling, patroon, output
```

## Leerlinginstructie

```text
Bizzy moet een vierkant lopen.

Er zijn 2 fouten in de code.
Wijs ze aan, verbeter ze en test.
```

## Visueel doel

Toon als doelkaart:

```text
DOEL
herhaal 4 keer: 1 stap vooruit + rechts draaien
daarna: zeg "Vierkant"
```

Gebruik waar mogelijk pictogrammen:

```text
🔁 4x:  ↑  ↱
daarna: 💬 Vierkant
```

## Bestaande code met twee fouten

```text
bij start
herhaal 3 keer          [fout]
  1 stap vooruit
  rechts draaien
zeg "Klaar"             [fout]
```

## Juiste code

```text
bij start
herhaal 4 keer
  1 stap vooruit
  rechts draaien
zeg "Vierkant"
```

## `wrongBlockIds`

```json
[
  "lj1h_repeat_3_initial",
  "lj1h_say_klaar_initial"
]
```

## Grote blokkenbak leerjaar 1 HV

### Gebeurtenissen

```text
bij start
als Bizzy wordt aangeraakt
als spatie wordt ingedrukt
```

### Besturing

```text
herhaal 2 keer
herhaal 3 keer
herhaal 4 keer
herhaal 5 keer
wacht 1 seconde
```

### Beweging

```text
1 stap vooruit
2 stappen vooruit
1 stap achteruit
rechts draaien
links draaien
```

### Uiterlijk

```text
zeg "Klaar"
zeg "Vierkant"
zeg "Fout"
zeg "Hoi"
```

## Scoring leerjaar 1 HV

| Onderdeel | Punt | Correct criterium |
|---|---:|---|
| Foutblokken aanwijzen | 1 | `herhaal 3 keer` en `zeg "Klaar"` zijn aangewezen |
| Herhaling herstellen | 1 | `herhaal 3 keer` is vervangen door `herhaal 4 keer` |
| Output herstellen | 1 | `zeg "Klaar"` is vervangen door `zeg "Vierkant"` |
| Testbewijs | 1 | na laatste wijziging op `Afspelen`; Bizzy loopt vier zijden en zegt `Vierkant` |

## Verwacht uitvoerlog na correcte oplossing

```text
Uitgevoerd
1. Start
2. herhaal 4 keer
3. ronde 1: 1 stap vooruit, rechts draaien
4. ronde 2: 1 stap vooruit, rechts draaien
5. ronde 3: 1 stap vooruit, rechts draaien
6. ronde 4: 1 stap vooruit, rechts draaien
7. "Vierkant"
```

---

# Variant 3 — Leerjaar 3 VMBO

## Metadata

```yaml
assessmentId: lj3-vmbo
oldItemId: lj3v-pt7-programming
newItemId: lj3v-pt7-programming-debug-v1
section: pt7
title: Blokprogrammeren
type: block_debug_task
subgoal: 22B
skillDomain: 22B Programmeren
points: 4
device: microbit
languageLevel: vmbo_3
constructFocus: teller, variabele, conditie
```

## Leerlinginstructie

```text
Bij elke klik op A komt er 1 bij.

Bij 1 t/m 4: Nog plek
Bij 5 of meer: Vol

Er zijn 2 fouten.
Wijs ze aan, verbeter ze en test.
```

## Visueel doel

Toon als testtabel:

| Aantal keer A | Bizzy zegt |
|---:|---|
| 1 | Nog plek |
| 4 | Nog plek |
| 5 | Vol |
| 6 | Vol |

## Bestaande code met twee fouten

```text
bij start
zet teller op 0

als knop A wordt ingedrukt
  verander teller met 2              [fout]
  als teller groter dan 5 dan         [fout]
    zeg "Vol"
  anders
    zeg "Nog plek"
```

Gebruik intern eventueel de bestaande bloknaam `als teller >= 5 dan` voor het correcte blok. De leerlinglabel mag zijn:

```text
als teller 5 of meer is dan
```

## Juiste code

```text
bij start
zet teller op 0

als knop A wordt ingedrukt
  verander teller met 1
  als teller 5 of meer is dan
    zeg "Vol"
  anders
    zeg "Nog plek"
```

## `wrongBlockIds`

```json
[
  "lj3v_change_counter_by_2_initial",
  "lj3v_condition_greater_than_5_initial"
]
```

## Grote blokkenbak leerjaar 3 VMBO

### Gebeurtenissen

```text
bij start
als knop A wordt ingedrukt
als knop B wordt ingedrukt
als Bizzy wordt aangeraakt
```

### Variabelen

```text
zet teller op 0
zet teller op 5
verander teller met 1
verander teller met 2
verander teller met -1
toon teller
```

### Voorwaarden

```text
als teller groter dan 5 dan
als teller 5 of meer is dan
als teller kleiner dan 5 dan
als teller gelijk is aan 5 dan
anders
```

### Uiterlijk

```text
zeg "Vol"
zeg "Nog plek"
zeg "Klaar"
zeg "Leeg"
zeg "Fout"
```

### Besturing

```text
wacht 1 seconde
herhaal 5 keer
stop programma
```

## Testknoppen

Naast `Afspelen` moeten testcases beschikbaar zijn.

Gebruik minimaal:

```text
Test A x4
Test A x5
```

Voor het testpunt moeten beide testcases correct zijn:

- A x4 -> `Nog plek`
- A x5 -> `Vol`

Als de bestaande engine alleen `Afspelen` ondersteunt, laat `Afspelen` automatisch beide testcases achter elkaar uitvoeren en toon per testcase het resultaat in het log.

## Scoring leerjaar 3 VMBO

| Onderdeel | Punt | Correct criterium |
|---|---:|---|
| Foutblokken aanwijzen | 1 | `verander teller met 2` en `teller groter dan 5` zijn aangewezen |
| Teller herstellen | 1 | `verander teller met 2` is vervangen door `verander teller met 1` |
| Voorwaarde herstellen | 1 | `teller groter dan 5` is vervangen door `teller 5 of meer` |
| Testbewijs | 1 | na laatste wijziging getest; A x4 geeft `Nog plek` en A x5 geeft `Vol` |

## Verwacht uitvoerlog bij correcte oplossing

```text
Test A x4
1. teller = 0
2. A ingedrukt -> teller = 1 -> Nog plek
3. A ingedrukt -> teller = 2 -> Nog plek
4. A ingedrukt -> teller = 3 -> Nog plek
5. A ingedrukt -> teller = 4 -> Nog plek
Resultaat: goed

Test A x5
1. teller = 0
2. A ingedrukt -> teller = 1 -> Nog plek
3. A ingedrukt -> teller = 2 -> Nog plek
4. A ingedrukt -> teller = 3 -> Nog plek
5. A ingedrukt -> teller = 4 -> Nog plek
6. A ingedrukt -> teller = 5 -> Vol
Resultaat: goed
```

---

# Variant 4 — Leerjaar 3 HAVO/VWO

## Metadata

```yaml
assessmentId: lj3-hv
oldItemId: lj3h-pt7-programming
newItemId: lj3h-pt7-programming-debug-v1
section: pt7
title: Blokprogrammeren
type: block_debug_task
subgoal: 22B
skillDomain: 22B Programmeren
points: 4
device: sensor
languageLevel: havo_vwo_3
constructFocus: samengestelde logica, EN/OF, else-uitkomst
```

## Leerlinginstructie

```text
Toon alleen "Koelen" als het warm is én het raam open staat.

Er zijn 2 fouten in de code.
Wijs ze aan, verbeter ze en test.
```

## Visueel doel

Toon als testtabel:

| Temperatuur | Raam | Uitkomst |
|---:|---|---|
| 27° | open | Koelen |
| 27° | dicht | Oké |
| 20° | open | Oké |
| 20° | dicht | Oké |

Gebruik eventueel pictogrammen:

```text
warm + raam open  -> Koelen
warm + raam dicht -> Oké
koud + raam open  -> Oké
koud + raam dicht -> Oké
```

## Bestaande code met twee fouten

```text
lees temperatuur
lees raamOpen

als temperatuur > 25 OF raamOpen = ja dan     [fout]
  toon "Koelen"
anders
  toon "Verwarmen"                            [fout]
```

## Juiste code

```text
lees temperatuur
lees raamOpen

als temperatuur > 25 EN raamOpen = ja dan
  toon "Koelen"
anders
  toon "Oké"
```

## `wrongBlockIds`

```json
[
  "lj3h_condition_or_initial",
  "lj3h_else_show_verwarmen_initial"
]
```

## Grote blokkenbak leerjaar 3 HAVO/VWO

### Invoer

```text
lees temperatuur
lees raamOpen
lees luchtvochtigheid
lees tijdstip
```

### Voorwaarden

```text
als temperatuur > 25 EN raamOpen = ja dan
als temperatuur > 25 OF raamOpen = ja dan
als temperatuur < 25 EN raamOpen = ja dan
als temperatuur > 25 EN raamOpen = nee dan
als temperatuur = 25 dan
anders
```

### Logica

```text
EN
OF
NIET
```

### Output

```text
toon "Koelen"
toon "Oké"
toon "Verwarmen"
toon "Alarm"
toon "Wachten"
```

### Besturing

```text
wacht 10 seconden
herhaal zolang
stop programma
```

## Testknoppen

Gebruik vier testcases:

```text
Test 1: 27° + raam open
Test 2: 27° + raam dicht
Test 3: 20° + raam open
Test 4: 20° + raam dicht
```

Voor het testpunt moeten alle vier testcases kloppen.

## Scoring leerjaar 3 HAVO/VWO

| Onderdeel | Punt | Correct criterium |
|---|---:|---|
| Foutblokken aanwijzen | 1 | `OF`-voorwaarde en `toon "Verwarmen"` zijn aangewezen |
| Logica herstellen | 1 | `OF` is vervangen door `EN` in de samengestelde voorwaarde |
| Anders-uitkomst herstellen | 1 | `toon "Verwarmen"` is vervangen door `toon "Oké"` |
| Testbewijs | 1 | na laatste wijziging getest; alle vier testcases geven de juiste uitkomst |

## Verwacht uitvoerlog bij correcte oplossing

```text
Test 1: 27° + raam open
1. temperatuur = 27
2. raamOpen = ja
3. temperatuur > 25 EN raamOpen = ja -> waar
4. toon "Koelen"
Resultaat: goed

Test 2: 27° + raam dicht
1. temperatuur = 27
2. raamOpen = nee
3. temperatuur > 25 EN raamOpen = ja -> niet waar
4. toon "Oké"
Resultaat: goed

Test 3: 20° + raam open
1. temperatuur = 20
2. raamOpen = ja
3. temperatuur > 25 EN raamOpen = ja -> niet waar
4. toon "Oké"
Resultaat: goed

Test 4: 20° + raam dicht
1. temperatuur = 20
2. raamOpen = nee
3. temperatuur > 25 EN raamOpen = ja -> niet waar
4. toon "Oké"
Resultaat: goed
```

---

## Datamodel: voorstel

Als het bestaande datamodel `block_programming_task` niet goed genoeg is voor debugtaken, voeg dan een type toe:

```ts
type BlockDebugTask = {
  type: "block_debug_task";
  itemId: string;
  title: string;
  subgoal: "22B";
  points: 4;
  device: "bizzy" | "microbit" | "sensor";
  languageLevel: string;
  instruction: string;
  visualGoal: VisualGoal;
  initialProgram: BlockProgram;
  correctProgram: BlockProgram;
  wrongBlockIds: string[];
  toolbox: ToolboxCategory[];
  scoring: DebugScoringRule[];
  playback: PlaybackConfig;
  tests: TestCase[];
  logging: LoggingConfig;
};
```

Gebruik waar nodig de bestaande componenten voor blokken, canvas en simulatie. Voeg alleen schema toe als dat nodig is.

---

## Functionele eisen

### 1. Bestaande code staat al in het werkblad

Bij openen van PT7 is het werkblad niet leeg. De foutieve code staat al klaar.

### 2. Leerling kan foutblokken aanwijzen

De leerling kan in de bestaande code twee blokken selecteren als fout.

### 3. Leerling kan blokken vervangen

De leerling kan een fout blok vervangen door een blok uit de blokkenbak.

Als drag-and-drop vervangen technisch lastig is, mag dit alternatief:

- leerling sleept nieuw blok op het foute blok;
- systeem vraagt niet om tekstuele bevestiging;
- systeem vervangt het blok direct;
- actie wordt gelogd als `replacementAction`.

### 4. Grote blokkenbak blijft beschikbaar

Gebruik per variant de blokkenbak zoals hierboven beschreven of een functioneel equivalente grotere blokkenbak.

### 5. Testen is verplicht voor volledig puntenaantal

Zonder test na laatste wijziging geen testpunt.

### 6. Uitvoerlog blijft zichtbaar

Na `Afspelen` blijft het log zichtbaar. Het moet terug te lezen zijn wat net is uitgevoerd.

### 7. Goed te volgen tempo

Acties worden stap voor stap afgespeeld, niet instant.

### 8. Automatische scoring

Geen open tekstvelden. Geen docentbeoordeling. Geen handmatige rubric.

---

## Rapportage

Blijf PT7 rapporteren als:

```text
Programmeren / computational thinking
```

Niet rapporteren als:

```text
programmeertaal beheersen
codeertaal
syntax
```

Subscore blijft gekoppeld aan 22B.

In de technische rapportage mogen de volgende foutcategorieen worden meegenomen:

- foutblokken niet herkend;
- herstel afstand/richting fout;
- herstel herhaling fout;
- herstel output fout;
- tellerwijziging fout;
- voorwaarde fout;
- EN/OF-logica fout;
- niet getest na laatste wijziging;
- testcases deels correct.

---

## Acceptatiecriteria

De wijziging is pas klaar als aan alle onderstaande punten is voldaan.

### Inhoudelijk

1. PT7 is in alle vier metingen vervangen door een debugtaak met bestaande code.
2. Elke variant bevat precies twee inhoudelijke fouten.
3. Leerlingen moeten de twee foute blokken actief aanwijzen.
4. Leerlingen moeten de code handelend herstellen door blokken te slepen of te vervangen.
5. Leerlingen moeten kunnen testen met `Afspelen`.
6. De blokkenbak is realistisch en groter dan alleen de benodigde herstelblokken.
7. Vmbo1 gebruikt minimale tekst en een duidelijk visueel doel.
8. Leerjaar 1 VMBO meet sequentie, afstand en richting.
9. Leerjaar 1 HAVO/VWO meet herhaling en patroon.
10. Leerjaar 3 VMBO meet teller/variabele en conditie.
11. Leerjaar 3 HAVO/VWO meet samengestelde logica, EN/OF en else-uitkomst.

### Scoring

12. PT7 blijft maximaal 4 punten.
13. PT7 blijft gekoppeld aan 22B.
14. Score wordt automatisch berekend uit:
    - aangewezen foutblokken;
    - eindcode;
    - testresultaat na laatste wijziging.
15. Correctheid hangt nooit af van de positie van blokken in de blokkenbak.
16. Een correcte eindcode zonder test na de laatste wijziging krijgt maximaal 3 punten.
17. `Ik weet het niet` blijft werken als 0-score en wordt apart gelogd.

### Afspelen en logging

18. `Afspelen` voert de code stap voor stap uit.
19. Het actieve blok wordt tijdens uitvoering gemarkeerd.
20. Bewegingen, draaien, output en testcases worden op een goed te volgen tempo getoond.
21. De simulatie springt niet instant naar de eindtoestand.
22. Na `Afspelen` is zichtbaar terug te lezen wat is uitgevoerd.
23. Het technische log bevat minimaal:
    - geselecteerde foutblokken;
    - vervangacties;
    - eindcode;
    - playCount;
    - playedAfterLastChange;
    - executionTrace;
    - goalMatched;
    - testCaseResults waar van toepassing.

### Regressie

24. Andere PT's zijn niet gewijzigd.
25. SR-items zijn niet gewijzigd.
26. Vraag 3 is niet gewijzigd.
27. Vraag 9 is niet gewijzigd.
28. De toetsvolgorde is niet gewijzigd.
29. De totaalscorearchitectuur is niet onbedoeld gewijzigd.
30. De leerlinginterface toont geen interne correcte antwoorden, rationales, flags of scoringmetadata.

---

## Testplan voor Codex

Voer na implementatie minimaal deze checks uit.

### Unit/data checks

- Alle vier PT7-items bestaan met nieuwe item-id's.
- Alle vier PT7-items hebben `points: 4`.
- Alle vier PT7-items hebben `subgoal: 22B`.
- Elk item heeft precies twee `wrongBlockIds`.
- Elk item heeft een `visualGoal`.
- Elk item heeft `initialProgram` en `correctProgram`.
- Elk item heeft `playback` en `logging`.
- Elk item heeft realistische toolbox-categorieen.

### Scoring checks

#### VMBO 1

- Alleen `1 stap vooruit` + `draai naar links` aanwijzen levert aanwijspunt op.
- Vervangen door `2 stappen vooruit` en `draai naar rechts` levert herstelpunten op.
- Pas na `Afspelen` na laatste wijziging wordt testpunt toegekend.
- Correcte run eindigt met 2 stappen vooruit, rechts draaien, `Klaar`.

#### Leerjaar 1 HV

- Alleen `herhaal 3 keer` + `zeg "Klaar"` aanwijzen levert aanwijspunt op.
- Vervangen door `herhaal 4 keer` en `zeg "Vierkant"` levert herstelpunten op.
- Correcte run herhaalt vier keer en toont `Vierkant`.

#### Leerjaar 3 VMBO

- Alleen `verander teller met 2` + `teller groter dan 5` aanwijzen levert aanwijspunt op.
- A x4 geeft `Nog plek`.
- A x5 geeft `Vol`.
- Beide testcases zijn nodig voor het testpunt.

#### Leerjaar 3 HV

- Alleen `OF`-voorwaarde + `toon "Verwarmen"` aanwijzen levert aanwijspunt op.
- Alle vier testcases moeten kloppen.
- `27° + open` geeft `Koelen`.
- Alle andere combinaties geven `Oké`.

### UI checks

- Blokkenbak is niet te klein.
- Foute blokken worden niet vooraf verraden.
- Visueel doel blijft zichtbaar tijdens het slepen.
- Actieve blokken worden gemarkeerd tijdens `Afspelen`.
- Uitvoerlog blijft na afloop zichtbaar.
- Vmbo1-instructie is kort en taalarm.

### Regressiechecks

- PT1, PT2, PT3, PT4, PT6, PT8 laden nog.
- Resultaatpagina toont PT7-score correct.
- `Ik weet het niet` blijft globaal werken.
- Geen console errors.
- Geen TypeScript errors.
- Geen lint/test failures.

---

## Verwachte einduitkomst

Na deze wijziging meet PT7 sterker en zuiverder:

- minder afhankelijkheid van taalbegrip;
- meer nadruk op visueel vergelijken;
- meer nadruk op debugging;
- realistische blokkenbak zoals Scratch/Delightex;
- handelend antwoord in plaats van open uitleg;
- testgedrag als bewijs;
- goed zichtbaar en gelogd uitvoerproces;
- automatische scoreerbaarheid blijft behouden.
