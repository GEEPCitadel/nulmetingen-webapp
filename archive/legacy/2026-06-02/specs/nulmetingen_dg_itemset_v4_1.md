# Nulmetingen Digitale Geletterdheid — itemset v4.1

**Doel:** volledig uitgewerkte, automatisch scoreerbare itemset voor vier niveaus:

1. Leerjaar 1 VMBO (`lj1-vmbo`)
2. Leerjaar 1 HAVO/VWO (`lj1-hv`)
3. Leerjaar 3 VMBO (`lj3-vmbo`)
4. Leerjaar 3 HAVO/VWO (`lj3-hv`)

Deze versie vervangt de generieke v4-implementatie. Codex mag geen inhoudelijke items bijverzinnen.

---

## 0. Algemene implementatieregels

### 0.1 Scoring

- Alle scorende onderdelen zijn automatisch scoreerbaar.
- Geen open tekstvelden tellen mee in de score.
- Geen docentbeoordeling.
- Geen rubric-based scoring.
- Geen live reverse image search.
- Elke versie heeft dezelfde maximumscore: **24 punten**.
- Zelfinschatting telt niet mee.

### 0.2 Structuur per versie

| Onderdeel | Punten |
|---|---:|
| PT1 Bestandsbeheer | 4 |
| PT2 Zoekstrategie en bronkeuze | 3 |
| PT3 Veiligheid en privacy | 3 |
| PT4 Data en spreadsheet | 4 |
| PT5 Creëren met digitale technologie | 4 |
| PT6 Programmeren / algoritmisch denken | 4 |
| **Totaal** | **22** |
| Selected-response-items | **2** |
| **Eindtotaal** | **24** |

De selected-response-items zijn bewust beperkt gehouden. De kern van de meting bestaat uit micro-performance-taken.

### 0.3 Randomisatie

- Randomiseer antwoordopties bij keuze-items per sessie.
- Randomiseer startvolgorde bij ordeningstaken.
- Randomiseer niet:
  - vaste UI-posities in mockups;
  - tabelrijen, tenzij expliciet anders aangegeven;
  - menuvolgorde als die een realistische interface simuleert.
- Log altijd:
  - `sessionId`
  - `versionId`
  - `itemId`
  - `itemType`
  - `shownOptionOrder`
  - `selectedAnswer` of `finalState`
  - `isCorrect`
  - `score`
  - `maxScore`
  - `timeSpentMs`

### 0.4 Weet-ik-niet

- Toon bij conceptuele keuze-items een aparte knop: **Weet ik niet**.
- Deze knop wordt niet mee-gerandomiseerd tussen de antwoordopties.
- Score: 0 punten.
- Bij echte interactietaken is “Taak overslaan” toegestaan en scoort 0 voor de openstaande deelhandeling.

### 0.5 Taalniveau

- LJ1 VMBO: korte zinnen, concrete woorden, geen overbodige uitleg.
- Vermijd lange scenario's bij LJ1 VMBO.
- Gebruik bij LJ1 VMBO liever labels, knoppen, pictogrammen en directe acties dan tekst.
- De taak mag praktisch moeilijk zijn, maar de taal mag niet de hindernis zijn.

### 0.6 Itemtypes

Gebruik minimaal deze itemtypes of semantisch gelijkwaardige componenten:

- `file_task_simulation`
- `query_builder_task`
- `search_result_task`
- `security_hotspot_task`
- `security_action_task`
- `spreadsheet_sort_task`
- `spreadsheet_filter_task`
- `creation_menu_task`
- `format_choice_task`
- `algorithm_order_task`
- `condition_builder_task`
- `bug_fix_task`
- `multiple_choice`

---

# 1. Leerjaar 1 VMBO (`lj1-vmbo`)

## Zelfinschatting — niet scorend

### v0-zelfinschatting

- **Itemtype:** `self_assessment`
- **Punten:** 0
- **Leerlingtekst:** Hoe goed kun jij digitale taken op school doen? Denk aan bestanden, zoeken, veilig werken en apps gebruiken.
- **Antwoordvorm:** slider 0-100
- **Score:** telt niet mee

---

## PT1 — Bestandsbeheer

- **Kerndoel:** 21A Digitale systemen
- **Itemtype:** `file_task_simulation`
- **Punten:** 4
- **Doel:** bestanden ordenen in een gesimuleerde OneDrive-omgeving.

### Startomgeving

```text
Thuis/
├── OneDrive/
│   ├── Foto_vakantie_2025.jpg
│   ├── Eindproduct_Nederlands.docx
│   ├── Presentatie_Biologie_v1.pptx
│   ├── Presentatie_Biologie_v2.pptx
│   └── Schoolfoto_groep_3a.jpg
├── Downloads/
│   └── Installatiebestand.exe
└── Documenten/
    └── Aantekeningen.docx
```

### Leerlingtekst

**Titel:** Bestanden opruimen

**Instructie:** Doe de vier taken. Klik daarna op **Taak afronden**.

1. Ga naar **OneDrive**.
2. Maak een map: **Schoolwerk**.
3. Hernoem **Presentatie_Biologie_v1.pptx** naar **Presentatie_Biologie_OUD.pptx**.
4. Verplaats **Eindproduct_Nederlands.docx** naar **Schoolwerk**.
5. Maak een map: **Foto’s**.
6. Verplaats **Foto_vakantie_2025.jpg** naar **Foto’s**.

### Scoring

| Punt | Vereiste eindtoestand |
|---:|---|
| 1 | `Thuis/OneDrive/Schoolwerk` bestaat |
| 1 | `Thuis/OneDrive/Presentatie_Biologie_OUD.pptx` bestaat en `Presentatie_Biologie_v1.pptx` bestaat niet meer |
| 1 | `Thuis/OneDrive/Schoolwerk/Eindproduct_Nederlands.docx` bestaat |
| 1 | `Thuis/OneDrive/Foto’s/Foto_vakantie_2025.jpg` bestaat |

Exacte spelling vereist.

---

## PT2 — Zoekstrategie en bronkeuze

- **Kerndoel:** 21B Digitale media en informatie
- **Punten:** 3
- **Doel:** gerichte zoekstrategie bouwen en betrouwbaar resultaat kiezen.

### PT2.1 Query bouwen

- **Itemtype:** `query_builder_task`
- **Punten:** 1

**Leerlingtekst:**

Je zoekt betrouwbare cijfers over hoeveel inwoners Nederland nu heeft.
Sleep de beste woorden naar het zoekvak.

**Beschikbare chips:**

- `inwoners`
- `Nederland`
- `2025`
- `CBS`
- `veel`
- `mensen`
- `weetje`
- `TikTok`

**Correcte eindstaat zoekvak:**

De zoekquery bevat precies deze vier chips, in willekeurige volgorde:

```text
inwoners Nederland 2025 CBS
```

**Score:** 1 punt als exact deze vier chips zijn gekozen; anders 0.

### PT2.2 Zoekfilter kiezen

- **Itemtype:** `search_filter_task`
- **Punten:** 1

**Leerlingtekst:**

Je wilt recente cijfers. Welke filter kies je?

**Interface:** zoekmachine-filterbalk met vier knoppen:

- Alles
- Afbeeldingen
- Afgelopen jaar
- Video’s

**Correct antwoord:** `Afgelopen jaar`

**Score:** 1 punt.

### PT2.3 Bron kiezen uit resultaten

- **Itemtype:** `search_result_task`
- **Punten:** 1

**Leerlingtekst:**

Welk resultaat open je als eerste?

**Resultaten:**

A. `cbs.nl — Bevolking; kerncijfers Nederland 2025`  
B. `spreekbeurtinfo.nl — Hoeveel mensen wonen er in Nederland?`  
C. `nieuwsfeitjes24.nl — Nederland groeit heel hard`  
D. `forumwereld.nl — Ik denk dat Nederland drukker wordt`

**Correct antwoord:** A

**Score:** 1 punt.

---

## PT3 — Veiligheid en privacy

- **Kerndoel:** 23A Veiligheid en privacy
- **Punten:** 3
- **Doel:** verdacht bericht herkennen, verdacht element aanwijzen en veilige actie kiezen.

### Mockup bericht

```text
Van: noreply@postnl-pakket.info
Onderwerp: Je pakket wacht
Tekst:
Je pakket is bijna bezorgd. Betaal €1,99 om opnieuw te bezorgen.
[Betaal nu]
```

### PT3.1 Beoordeling

- **Itemtype:** `security_classification_task`
- **Punten:** 1

**Leerlingtekst:**

Is dit bericht veilig of verdacht?

**Opties:**

- Veilig
- Verdacht
- Weet ik niet

**Correct antwoord:** `Verdacht`

### PT3.2 Verdacht element aanklikken

- **Itemtype:** `security_hotspot_task`
- **Punten:** 1

**Leerlingtekst:**

Klik op het sterkste verdachte teken.

**Hotspots:**

- Afzender: `noreply@postnl-pakket.info`
- Onderwerp: `Je pakket wacht`
- Bedrag: `€1,99`
- Knop: `Betaal nu`

**Correcte hotspot:** `noreply@postnl-pakket.info`

### PT3.3 Veilige actie kiezen

- **Itemtype:** `security_action_task`
- **Punten:** 1

**Leerlingtekst:**

Wat doe je nu het best?

**Opties:**

A. Op de knop klikken en betalen  
B. Bericht sluiten en zelf naar de echte PostNL-site/app gaan  
C. Doorsturen naar de klas  
D. Je bankgegevens invullen om te controleren

**Correct antwoord:** B

---

## PT4 — Data en spreadsheet

- **Kerndoel:** 21C Data
- **Punten:** 4
- **Doel:** sorteren, filteren en resultaat aflezen in een tabel.

### Tabel

```text
Artiest   | Jaar | Genre
Snelle    | 2020 | pop
Maan      | 2023 | pop
Froukje   | 2021 | pop
Antoon    | 2022 | rap
S10       | 2024 | pop
```

### PT4.1 Sorteerkolom kiezen

- **Itemtype:** `spreadsheet_sort_task`
- **Punten:** 1

**Leerlingtekst:**

Sorteer op nieuw naar oud. Welke kolom gebruik je?

**Opties:** `Artiest`, `Jaar`, `Genre`

**Correct antwoord:** `Jaar`

### PT4.2 Sorteerrichting kiezen

- **Itemtype:** `spreadsheet_sort_task`
- **Punten:** 1

**Leerlingtekst:**

Welke richting kies je?

**Opties:**

- Oud naar nieuw
- Nieuw naar oud
- A naar Z
- Z naar A

**Correct antwoord:** `Nieuw naar oud`

### PT4.3 Resultaat na sorteren

- **Itemtype:** `spreadsheet_result_task`
- **Punten:** 1

**Leerlingtekst:**

Na goed sorteren: welke artiest staat bovenaan?

**Opties:** `Snelle`, `Maan`, `Froukje`, `Antoon`, `S10`

**Correct antwoord:** `S10`

### PT4.4 Filteren

- **Itemtype:** `spreadsheet_filter_task`
- **Punten:** 1

**Leerlingtekst:**

Zet filter **Genre = rap** aan. Welke artiest blijft over?

**Correct antwoord:** `Antoon`

---

## PT5 — Creëren met digitale technologie

- **Kerndoel:** 22A Creëren met digitale technologie
- **Punten:** 4
- **Doel:** passend formaat, tool en deelinstelling kiezen voor een digitaal product.

### PT5.1 Bestandsformaat kiezen

- **Itemtype:** `format_choice_task`
- **Punten:** 1

**Leerlingtekst:**

Je maakt een logo. Het moet scherp blijven op een poster én op Instagram. Kies het beste bestand.

**Opties:**

A. `logo.jpg`  
B. `logo.png`  
C. `logo.svg`  
D. `logo.pdf`

**Correct antwoord:** C

### PT5.2 Tool kiezen

- **Itemtype:** `creation_menu_task`
- **Punten:** 1

**Leerlingtekst:**

Je wilt samen met een klasgenoot tegelijk aan een tekst werken. Welke tool open je?

**Opties:**

A. Online tekstverwerker  
B. PDF-lezer  
C. Muziekspeler  
D. Rekenmachine

**Correct antwoord:** A

### PT5.3 Deelinstelling kiezen

- **Itemtype:** `sharing_settings_task`
- **Punten:** 1

**Leerlingtekst:**

Je deelt het document alleen met je klasgenoot. Welke instelling kies je?

**Opties:**

A. Iedereen met de link mag bewerken  
B. Alleen mijn klasgenoot mag bewerken  
C. Openbaar op internet  
D. Iedereen op school mag verwijderen

**Correct antwoord:** B

### PT5.4 Bronvermelding kiezen

- **Itemtype:** `source_credit_task`
- **Punten:** 1

**Leerlingtekst:**

Je gebruikt een afbeelding met licentie **CC BY**. Wat moet je erbij zetten?

**Opties:**

A. Alleen de kleur van de afbeelding  
B. De naam van de maker/bron  
C. Niets, want CC BY is altijd zonder regels  
D. Alleen je eigen naam

**Correct antwoord:** B

---

## PT6 — Programmeren / algoritmisch denken

- **Kerndoel:** 22B Programmeren
- **Punten:** 4
- **Doel:** stappen ordenen, eenvoudige voorwaarde toepassen, regel begrijpen.

### PT6.1 Stappen ordenen

- **Itemtype:** `algorithm_order_task`
- **Punten:** 1

**Leerlingtekst:**

Een lamp moet aangaan als het donker is. Zet de stappen goed.

**Blokken:**

- Meet licht
- Is het donker?
- Zet lamp aan
- Stop

**Correcte volgorde:**

```text
Meet licht > Is het donker? > Zet lamp aan > Stop
```

### PT6.2 Voorwaarde kiezen

- **Itemtype:** `condition_builder_task`
- **Punten:** 1

**Leerlingtekst:**

Regel: ALS score __ 60 DAN schrijf "voldoende".
Bij score 60 moet "voldoende" verschijnen. Welk teken hoort op de lege plek?

**Opties:** `<`, `>`, `>=`, `!=`

**Correct antwoord:** `>=`

### PT6.3 Regel begrijpen

- **Itemtype:** `multiple_choice`
- **Punten:** 1

**Leerlingtekst:**

Regel: `score = score + 1`. Wat doet deze regel?

**Opties:**

A. Score wordt 0  
B. Score gaat 1 omhoog  
C. Score blijft gelijk  
D. Score wordt tekst

**Correct antwoord:** B

### PT6.4 Fout zoeken

- **Itemtype:** `bug_fix_task`
- **Punten:** 1

**Leerlingtekst:**

De teller moet stoppen bij 5, maar hij stopt nooit. Klik op de regel die fout is.

**Codeblokken:**

1. `teller = 1`  
2. `HERHAAL ZOLANG teller <= 5`  
3. `toon teller`  
4. `teller = teller`

**Correct antwoord:** blok 4

---

## Selected-response-items

### SR1 — AI-uitvoer controleren

- **Kerndoel:** 21D AI
- **Itemtype:** `multiple_choice`
- **Punten:** 1

**Leerlingtekst:**

Een chatbot noemt een jaartal. Je weet niet of het klopt. Wat is de beste controle?

**Opties:**

A. Hetzelfde nog een keer aan de chatbot vragen  
B. Kijken of het antwoord zeker klinkt  
C. Controleren in een betrouwbare bron  
D. Het antwoord meteen gebruiken

**Correct antwoord:** C

### SR2 — Online identiteit

- **Kerndoel:** 23B Digitale technologie, jezelf en de ander
- **Itemtype:** `multiple_choice`
- **Punten:** 1

**Leerlingtekst:**

Je plaatst iets op een privéaccount met veel volgers. Wat klopt?

**Opties:**

A. Alleen jij kunt het zien  
B. Volgers kunnen het screenshotten en delen  
C. Privé betekent dat niemand het kan bewaren  
D. Het verdwijnt vanzelf van alle telefoons

**Correct antwoord:** B

---

# 2. Leerjaar 1 HAVO/VWO (`lj1-hv`)

## Zelfinschatting — niet scorend

### v0-zelfinschatting

- **Itemtype:** `self_assessment`
- **Punten:** 0
- **Leerlingtekst:** Hoe goed kun jij digitale middelen veilig, handig en kritisch gebruiken voor schooltaken?
- **Antwoordvorm:** slider 0-100
- **Score:** telt niet mee

---

## PT1 — Bestandsbeheer

- **Kerndoel:** 21A Digitale systemen
- **Itemtype:** `file_task_simulation`
- **Punten:** 4

### Startomgeving

```text
Thuis/
├── OneDrive/
│   ├── Onderzoek_klimaat.docx
│   ├── Boekverslag_Nederlands.docx
│   ├── Presentatie_Biologie_v1.pptx
│   ├── Presentatie_Biologie_v2.pptx
│   ├── Foto_museum.jpg
│   └── Rooster.pdf
├── Downloads/
│   └── Installatiebestand.exe
└── Documenten/
    └── Aantekeningen.docx
```

### Leerlingtekst

**Titel:** Bestanden ordenen

**Instructie:** Voer de taken uit. Klik daarna op **Taak afronden**.

1. Ga naar **OneDrive**.
2. Maak een map: **Schoolwerk**.
3. Maak in **Schoolwerk** een map: **Nederlands**.
4. Hernoem **Presentatie_Biologie_v1.pptx** naar **Presentatie_Biologie_OUD.pptx**.
5. Verplaats **Boekverslag_Nederlands.docx** naar **Schoolwerk/Nederlands**.

### Scoring

| Punt | Vereiste eindtoestand |
|---:|---|
| 1 | `Thuis/OneDrive/Schoolwerk` bestaat |
| 1 | `Thuis/OneDrive/Schoolwerk/Nederlands` bestaat |
| 1 | `Thuis/OneDrive/Presentatie_Biologie_OUD.pptx` bestaat en oude v1-naam bestaat niet meer |
| 1 | `Thuis/OneDrive/Schoolwerk/Nederlands/Boekverslag_Nederlands.docx` bestaat |

Exacte spelling vereist.

---

## PT2 — Zoekstrategie en bronkeuze

- **Kerndoel:** 21B Digitale media en informatie
- **Punten:** 3

### PT2.1 Query bouwen

- **Itemtype:** `query_builder_task`
- **Punten:** 1

**Leerlingtekst:**

Je zoekt betrouwbare cijfers over online winkelen in Nederland. Bouw de beste zoekquery.

**Beschikbare chips:**

- `online winkelen`
- `Nederland`
- `cijfers`
- `CBS`
- `mening`
- `webshop`
- `korting`
- `ervaringen`

**Correcte eindstaat:** precies deze vier chips, in willekeurige volgorde:

```text
online winkelen Nederland cijfers CBS
```

### PT2.2 Zoekfilter kiezen

- **Itemtype:** `search_filter_task`
- **Punten:** 1

**Leerlingtekst:**

Je wilt geen meningen, maar cijfers. Welke filter of keuze helpt het meest?

**Opties:**

A. Alleen video’s  
B. Alleen afbeeldingen  
C. Resultaten van betrouwbare organisatie  
D. Resultaten met veel reacties

**Correct antwoord:** C

### PT2.3 Bron kiezen

- **Itemtype:** `search_result_task`
- **Punten:** 1

**Leerlingtekst:**

Welk resultaat past het best bij je vraag?

**Resultaten:**

A. `cbs.nl — Online aankopen door personen; kerncijfers`  
B. `consumentenbond.nl — Veilig online kopen: tips`  
C. `thuiswinkel.org — Webshopmarkt groeit volgens branche`  
D. `blogshopper.nl — Mijn favoriete webshops`

**Correct antwoord:** A

---

## PT3 — Veiligheid en privacy

- **Kerndoel:** 23A Veiligheid en privacy
- **Punten:** 3

### Mockup SMS

```text
Afzender: +31 6 12 34 56 78
Tekst: PostNL: je pakket kon niet worden bezorgd. Betaal €1,99 via postnl-direct-pay.info
```

### PT3.1 Beoordeling

- **Itemtype:** `security_classification_task`
- **Punten:** 1

**Leerlingtekst:** Is dit bericht veilig of verdacht?

**Correct antwoord:** `Verdacht`

### PT3.2 Verdacht element aanklikken

- **Itemtype:** `security_hotspot_task`
- **Punten:** 1

**Hotspots:**

- Afzender: `+31 6 12 34 56 78`
- Naam: `PostNL`
- Bedrag: `€1,99`
- Link: `postnl-direct-pay.info`

**Correcte hotspot:** `postnl-direct-pay.info`

### PT3.3 Veilige actie kiezen

- **Itemtype:** `security_action_task`
- **Punten:** 1

**Opties:**

A. Link openen en betalen  
B. Bericht verwijderen en zelf de officiële PostNL-app/site controleren  
C. Link delen met je ouders  
D. Je bankpasgegevens invullen maar niet verzenden

**Correct antwoord:** B

---

## PT4 — Data en spreadsheet

- **Kerndoel:** 21C Data
- **Punten:** 4

### Tabel

```text
Titel              | Jaar | Categorie
Atlas              | 2021 | aardrijkskunde
Biologie Vandaag   | 2024 | biologie
Chemie Basis       | 2022 | scheikunde
Cellen en DNA      | 2023 | biologie
Evolutie Kort      | 2020 | biologie
```

### PT4.1 Sorteerkolom

- **Itemtype:** `spreadsheet_sort_task`
- **Punten:** 1

**Leerlingtekst:** Sorteer op nieuwste boek. Welke kolom gebruik je?

**Opties:** `Titel`, `Jaar`, `Categorie`

**Correct antwoord:** `Jaar`

### PT4.2 Sorteerrichting

- **Itemtype:** `spreadsheet_sort_task`
- **Punten:** 1

**Correct antwoord:** `Nieuw naar oud`

### PT4.3 Resultaat na sorteren

- **Itemtype:** `spreadsheet_result_task`
- **Punten:** 1

**Leerlingtekst:** Welk boek staat na goed sorteren bovenaan?

**Correct antwoord:** `Biologie Vandaag`

### PT4.4 Filter + resultaat

- **Itemtype:** `spreadsheet_filter_task`
- **Punten:** 1

**Leerlingtekst:** Filter op `Categorie = biologie`. Welk oudste boek blijft dan in de lijst?

**Correct antwoord:** `Evolutie Kort`

---

## PT5 — Creëren met digitale technologie

- **Kerndoel:** 22A Creëren met digitale technologie
- **Punten:** 4

### PT5.1 Bestandsformaat

- **Itemtype:** `format_choice_task`
- **Punten:** 1

**Leerlingtekst:** Welk bestand kies je voor een logo dat groot en klein scherp moet blijven?

**Opties:** `.jpg`, `.png`, `.svg`, `.pdf`

**Correct antwoord:** `.svg`

### PT5.2 Tool kiezen

- **Itemtype:** `creation_menu_task`
- **Punten:** 1

**Leerlingtekst:** Je hebt meetgegevens en wilt een grafiek maken die je later kunt aanpassen. Welke tool open je?

**Opties:**

A. Spreadsheetsoftware  
B. PDF-lezer  
C. Chatapp  
D. Muziekspeler

**Correct antwoord:** A

### PT5.3 Deelinstelling

- **Itemtype:** `sharing_settings_task`
- **Punten:** 1

**Leerlingtekst:** Je deelt een document met je projectgroep. Ze moeten kunnen typen, maar niet de eigenaar veranderen. Welke instelling kies je?

**Opties:**

A. Bekijken  
B. Reageren  
C. Bewerken  
D. Eigenaar maken

**Correct antwoord:** C

### PT5.4 Bronvermelding bij afbeelding

- **Itemtype:** `source_credit_task`
- **Punten:** 1

**Leerlingtekst:** Je gebruikt een afbeelding met `CC BY`. Welke vermelding is het best?

**Opties:**

A. Geen vermelding nodig  
B. “Afbeelding van internet”  
C. Maker + bron/link vermelden  
D. Alleen je eigen naam vermelden

**Correct antwoord:** C

---

## PT6 — Programmeren / algoritmisch denken

- **Kerndoel:** 22B Programmeren
- **Punten:** 4

### PT6.1 Stappen ordenen

- **Itemtype:** `algorithm_order_task`
- **Punten:** 1

**Leerlingtekst:** Een thermostaat moet de verwarming aanzetten als het kouder is dan 18 graden. Zet de stappen goed.

**Blokken:**

- Lees temperatuur
- Is temperatuur lager dan 18?
- Zet verwarming aan
- Toon status

**Correcte volgorde:**

```text
Lees temperatuur > Is temperatuur lager dan 18? > Zet verwarming aan > Toon status
```

### PT6.2 Voorwaarde kiezen

- **Itemtype:** `condition_builder_task`
- **Punten:** 1

**Leerlingtekst:** De melding moet verschijnen als `X` groter is dan 10. Welke voorwaarde hoort daarbij?

**Opties:** `X < 10`, `X > 10`, `X = 0`, `X != 10`

**Correct antwoord:** `X > 10`

### PT6.3 Regel begrijpen

- **Itemtype:** `multiple_choice`
- **Punten:** 1

**Leerlingtekst:** Regel: `aantal = aantal + 1`. Wat gebeurt er?

**Correct antwoord:** `aantal gaat 1 omhoog`

**Opties:**

A. aantal gaat 1 omhoog  
B. aantal wordt tekst  
C. aantal wordt 0  
D. aantal wordt verwijderd

### PT6.4 Fout oplossen

- **Itemtype:** `bug_fix_task`
- **Punten:** 1

**Leerlingtekst:** Het programma telt leerlingen, maar vergeet de teller te verhogen. Welke regel moet worden toegevoegd?

**Code:**

```text
teller = 0
voor elke leerling:
  als leerling aanwezig is:
    ?
toon teller
```

**Opties:**

A. `teller = teller + 1`  
B. `teller = 0`  
C. `toon leerling`  
D. `stop programma`

**Correct antwoord:** A

---

## Selected-response-items

### SR1 — AI en trainingsdata

- **Kerndoel:** 21D AI
- **Itemtype:** `multiple_choice`
- **Punten:** 1

**Leerlingtekst:** Een AI is vooral getraind met foto’s van lichte huid. Wat is een risico?

**Opties:**

A. De AI werkt automatisch beter voor iedereen  
B. De AI kan minder goed werken voor donkere huid  
C. Huidskleur maakt nooit verschil voor AI  
D. De AI gebruikt dan geen data meer

**Correct antwoord:** B

### SR2 — Filterbubbel

- **Kerndoel:** 23B Digitale technologie, jezelf en de ander
- **Itemtype:** `multiple_choice`
- **Punten:** 1

**Leerlingtekst:** Je kijkt vaak video’s over één voetbalclub. Daarna krijg je vooral meer video’s over die club. Wat speelt hier waarschijnlijk mee?

**Opties:**

A. Versleuteling  
B. Filterbubbel of aanbevelingsalgoritme  
C. Cloudopslag  
D. Antivirussoftware

**Correct antwoord:** B

---

# 3. Leerjaar 3 VMBO (`lj3-vmbo`)

## Zelfinschatting — niet scorend

### v0-zelfinschatting

- **Itemtype:** `self_assessment`
- **Punten:** 0
- **Leerlingtekst:** Hoe goed kun jij digitale middelen veilig, handig en kritisch gebruiken voor school, stage en dagelijks leven?
- **Antwoordvorm:** slider 0-100
- **Score:** telt niet mee

---

## PT1 — Bestandsbeheer

- **Kerndoel:** 21A Digitale systemen
- **Itemtype:** `file_task_simulation`
- **Punten:** 4

### Startomgeving

```text
Thuis/
├── OneDrive/
│   ├── Eindproduct_Nederlands.docx
│   ├── Eindproduct_Nederlands_DEF.docx
│   ├── Presentatie_Biologie_v1.pptx
│   ├── Presentatie_Biologie_v2.pptx
│   ├── Planning_stage.pdf
│   ├── Foto_vakantie_2025.jpg
│   └── Notities.txt
└── Downloads/
    └── Installatiebestand.exe
```

### Leerlingtekst

**Titel:** Bestanden structureren

**Instructie:** Orden de bestanden. Klik daarna op **Taak afronden**.

1. Maak in **OneDrive** een map: **Schoolwerk**.
2. Maak in **Schoolwerk** een map: **Nederlands**.
3. Maak in **Schoolwerk** een map: **Archief**.
4. Verplaats **Eindproduct_Nederlands_DEF.docx** naar **Schoolwerk/Nederlands**.
5. Hernoem **Presentatie_Biologie_v1.pptx** naar **Presentatie_Biologie_OUD.pptx**.
6. Verplaats **Presentatie_Biologie_OUD.pptx** naar **Schoolwerk/Archief**.

### Scoring

| Punt | Vereiste eindtoestand |
|---:|---|
| 1 | `Thuis/OneDrive/Schoolwerk` bestaat |
| 1 | `Thuis/OneDrive/Schoolwerk/Nederlands` en `Thuis/OneDrive/Schoolwerk/Archief` bestaan |
| 1 | `Thuis/OneDrive/Schoolwerk/Nederlands/Eindproduct_Nederlands_DEF.docx` bestaat |
| 1 | `Thuis/OneDrive/Schoolwerk/Archief/Presentatie_Biologie_OUD.pptx` bestaat en `Presentatie_Biologie_v1.pptx` bestaat niet meer |

---

## PT2 — Zoekstrategie en bronkeuze

- **Kerndoel:** 21B Digitale media en informatie
- **Punten:** 3

### PT2.1 Query bouwen

- **Itemtype:** `query_builder_task`
- **Punten:** 1

**Leerlingtekst:**

Je zoekt cijfers per jaar over online winkelen in Nederland. Bouw een gerichte zoekquery.

**Beschikbare chips:**

- `online winkelen`
- `Nederland`
- `cijfers`
- `2015 2025`
- `site:cbs.nl`
- `mening`
- `korting`
- `influencers`

**Correcte eindstaat:** precies deze vijf chips, in willekeurige volgorde:

```text
online winkelen Nederland cijfers 2015 2025 site:cbs.nl
```

### PT2.2 Resultaattype kiezen

- **Itemtype:** `search_filter_task`
- **Punten:** 1

**Leerlingtekst:**

Je moet cijfers in een grafiek kunnen gebruiken. Welk resultaatstype helpt het meest?

**Opties:**

A. Een tabel of dataset  
B. Een vlog  
C. Een forumreactie  
D. Een advertentiepagina

**Correct antwoord:** A

### PT2.3 Bron/resultaat kiezen

- **Itemtype:** `search_result_task`
- **Punten:** 1

**Leerlingtekst:**

Welk resultaat open je als eerste?

**Resultaten:**

A. `cbs.nl — Online aankopen; personen, leeftijd, 2015-2025`  
B. `nieuwssnack.nl — Webshops groeien weer hard`  
C. `forumconsument.nl — Ik koop alles online`  
D. `reclamebureau.nl — Zo verkoop je meer via je webshop`

**Correct antwoord:** A

---

## PT3 — Veiligheid en privacy

- **Kerndoel:** 23A Veiligheid en privacy
- **Punten:** 3

### Mockup mail

```text
Van: it-support@school-update.nl
Onderwerp: Nieuwe schoollogin nodig voor 17:00
Tekst:
Beste leerling,
Voor de update moet je vandaag je wachtwoord opnieuw instellen.
[Wachtwoord instellen]
```

### PT3.1 Beoordeling

- **Itemtype:** `security_classification_task`
- **Punten:** 1

**Correct antwoord:** `Verdacht`

### PT3.2 Verdacht element aanklikken

- **Itemtype:** `security_hotspot_task`
- **Punten:** 1

**Hotspots:**

- Afzender: `it-support@school-update.nl`
- Onderwerp: `Nieuwe schoollogin nodig voor 17:00`
- Begroeting: `Beste leerling`
- Knop: `Wachtwoord instellen`

**Correcte hotspot:** `it-support@school-update.nl`

### PT3.3 Veilige actie kiezen

- **Itemtype:** `security_action_task`
- **Punten:** 1

**Opties:**

A. Link openen en nieuw wachtwoord instellen  
B. Controleren via de officiële schoolomgeving of ICT-helpdesk  
C. Link doorsturen naar klasgenoten  
D. Je wachtwoord mailen naar de afzender

**Correct antwoord:** B

---

## PT4 — Data en spreadsheet

- **Kerndoel:** 21C Data
- **Punten:** 4

### Tabel

```text
Bestelling | Jaar | Categorie    | Bedrag
A102       | 2022 | kleding      | 45
A215       | 2025 | elektronica  | 89
A188       | 2024 | kleding      | 62
A301       | 2023 | elektronica  | 54
A410       | 2025 | kleding      | 77
```

### PT4.1 Filter instellen

- **Itemtype:** `spreadsheet_filter_task`
- **Punten:** 1

**Leerlingtekst:** Filter op `Categorie = kleding`. Welke filterwaarde kies je?

**Correct antwoord:** `kleding`

### PT4.2 Sorteerkolom na filter

- **Itemtype:** `spreadsheet_sort_task`
- **Punten:** 1

**Leerlingtekst:** Sorteer daarna op hoogste bedrag. Welke kolom gebruik je?

**Correct antwoord:** `Bedrag`

### PT4.3 Sorteerrichting

- **Itemtype:** `spreadsheet_sort_task`
- **Punten:** 1

**Correct antwoord:** `Hoog naar laag`

### PT4.4 Resultaat

- **Itemtype:** `spreadsheet_result_task`
- **Punten:** 1

**Leerlingtekst:** Welke bestelling staat bovenaan na filteren en sorteren?

**Correct antwoord:** `A410`

---

## PT5 — Creëren met digitale technologie

- **Kerndoel:** 22A Creëren met digitale technologie
- **Punten:** 4

### PT5.1 Bestandsformaat

- **Itemtype:** `format_choice_task`
- **Punten:** 1

**Leerlingtekst:** Een logo moet op een bestelbus, poster en Instagram scherp blijven. Kies het beste formaat.

**Opties:** `.jpg`, `.png`, `.svg`, `.psd`

**Correct antwoord:** `.svg`

### PT5.2 Tool kiezen

- **Itemtype:** `creation_menu_task`
- **Punten:** 1

**Leerlingtekst:** Je hebt verkoopcijfers en wilt snel een grafiek maken voor je stageverslag. Welke tool kies je?

**Opties:**

A. Spreadsheetsoftware  
B. Fotobewerker  
C. PDF-lezer  
D. Muziekspeler

**Correct antwoord:** A

### PT5.3 Delen met juiste rechten

- **Itemtype:** `sharing_settings_task`
- **Punten:** 1

**Leerlingtekst:** Je stagebegeleider mag je verslag lezen, maar niet aanpassen. Welke instelling kies je?

**Opties:**

A. Bewerken  
B. Bekijken  
C. Eigenaar maken  
D. Openbaar bewerken

**Correct antwoord:** B

### PT5.4 Licentiecheck

- **Itemtype:** `source_credit_task`
- **Punten:** 1

**Leerlingtekst:** Je gebruikt beeld van internet in een video. Wat check je vóór publicatie?

**Opties:**

A. Of je toestemming of een passende licentie hebt  
B. Of het beeld groot genoeg is  
C. Of je vriend het kent  
D. Of de kleuren mooi zijn

**Correct antwoord:** A

---

## PT6 — Programmeren / algoritmisch denken

- **Kerndoel:** 22B Programmeren
- **Punten:** 4

### PT6.1 Stappen ordenen

- **Itemtype:** `algorithm_order_task`
- **Punten:** 1

**Leerlingtekst:** Bereken de prijs met korting. Korting geldt alleen bij 5 of meer producten. Zet de stappen goed.

**Blokken:**

- Lees aantal producten en prijs per stuk
- Bereken totaal = aantal × prijs
- Als aantal >= 5, trek 10% korting af
- Toon totaal

**Correcte volgorde:**

```text
Lees aantal producten en prijs per stuk > Bereken totaal = aantal × prijs > Als aantal >= 5, trek 10% korting af > Toon totaal
```

### PT6.2 Operator kiezen

- **Itemtype:** `condition_builder_task`
- **Punten:** 1

**Leerlingtekst:** Korting geldt bij 5 of meer producten. Welke voorwaarde hoort daarbij?

**Opties:** `aantal < 5`, `aantal = 0`, `aantal >= 5`, `aantal != 5`

**Correct antwoord:** `aantal >= 5`

### PT6.3 Bug vinden

- **Itemtype:** `bug_fix_task`
- **Punten:** 1

**Leerlingtekst:** Deze lus stopt nooit. Klik op de regel die het probleem veroorzaakt.

**Codeblokken:**

1. `teller = 1`  
2. `HERHAAL ZOLANG teller <= 5`  
3. `toon teller`  
4. `teller = teller`

**Correct antwoord:** blok 4

### PT6.4 Bug oplossen

- **Itemtype:** `bug_fix_task`
- **Punten:** 1

**Leerlingtekst:** Welke regel lost het probleem op?

**Opties:**

A. `teller = teller + 1`  
B. `teller = 0`  
C. `toon teller + teller`  
D. `wifi = aan`

**Correct antwoord:** A

---

## Selected-response-items

### SR1 — AI controleren

- **Kerndoel:** 21D AI
- **Itemtype:** `multiple_choice`
- **Punten:** 1

**Leerlingtekst:** Een AI-chatbot geeft een antwoord zonder bron. Wat is de beste eerste stap?

**Opties:**

A. Controleren in een onafhankelijke bron  
B. Het antwoord gebruiken omdat het netjes klinkt  
C. Het antwoord alleen korter maken  
D. De chatbot bedanken en stoppen

**Correct antwoord:** A

### SR2 — Digitale afhankelijkheid

- **Kerndoel:** 23C Digitale technologie, samenleving en wereld
- **Itemtype:** `multiple_choice`
- **Punten:** 1

**Leerlingtekst:** Veel scholen gebruiken dezelfde clouddienst. Wat is een realistisch risico?

**Opties:**

A. Bij storing kunnen veel scholen tegelijk niet bij hun bestanden  
B. Dan wordt alle software automatisch veiliger  
C. Dan hoeven leerlingen geen wachtwoorden meer te hebben  
D. Dan kan internet niet meer uitvallen

**Correct antwoord:** A

---

# 4. Leerjaar 3 HAVO/VWO (`lj3-hv`)

## Zelfinschatting — niet scorend

### v0-zelfinschatting

- **Itemtype:** `self_assessment`
- **Punten:** 0
- **Leerlingtekst:** Hoe goed kun jij digitale middelen veilig, effectief en kritisch gebruiken voor schooltaken, onderzoek en samenwerking?
- **Antwoordvorm:** slider 0-100
- **Score:** telt niet mee

---

## PT1 — Bestandsbeheer

- **Kerndoel:** 21A Digitale systemen
- **Itemtype:** `file_task_simulation`
- **Punten:** 4

### Startomgeving

```text
Thuis/
├── OneDrive/
│   ├── Onderzoek_klimaat_v1.docx
│   ├── Onderzoek_klimaat_DEF.docx
│   ├── Presentatie_Biologie_v1.pptx
│   ├── Presentatie_Biologie_v2.pptx
│   ├── Rooster_2026.pdf
│   ├── Foto_museum.jpg
│   ├── Notities_stage.txt
│   └── Samenvatting_Geschiedenis.docx
└── Downloads/
    └── Installatiebestand.exe
```

### Leerlingtekst

**Titel:** Bestanden structureren en archiveren

**Instructie:** Orden de bestanden logisch. Klik daarna op **Taak afronden**.

1. Maak in **OneDrive** een map: **Schoolwerk**.
2. Maak in **Schoolwerk** twee mappen: **Onderzoek** en **Archief**.
3. Verplaats **Onderzoek_klimaat_DEF.docx** naar **Schoolwerk/Onderzoek**.
4. Hernoem **Onderzoek_klimaat_v1.docx** naar **Onderzoek_klimaat_OUD.docx**.
5. Verplaats **Onderzoek_klimaat_OUD.docx** naar **Schoolwerk/Archief**.

### Scoring

| Punt | Vereiste eindtoestand |
|---:|---|
| 1 | `Thuis/OneDrive/Schoolwerk` bestaat |
| 1 | `Thuis/OneDrive/Schoolwerk/Onderzoek` en `Thuis/OneDrive/Schoolwerk/Archief` bestaan |
| 1 | `Thuis/OneDrive/Schoolwerk/Onderzoek/Onderzoek_klimaat_DEF.docx` bestaat |
| 1 | `Thuis/OneDrive/Schoolwerk/Archief/Onderzoek_klimaat_OUD.docx` bestaat en `Onderzoek_klimaat_v1.docx` bestaat niet meer |

---

## PT2 — Zoekstrategie en bronkeuze

- **Kerndoel:** 21B Digitale media en informatie
- **Punten:** 3

### PT2.1 Query bouwen

- **Itemtype:** `query_builder_task`
- **Punten:** 1

**Leerlingtekst:**

Je zoekt een controleerbaar onderzoeksrapport over schermtijd en slaap bij jongeren. Bouw een gerichte zoekquery.

**Beschikbare chips:**

- `schermtijd`
- `slaap`
- `jongeren`
- `onderzoek`
- `filetype:pdf`
- `site:.edu OR site:.gov`
- `mening`
- `TikTok`
- `gezond leven`

**Correcte eindstaat:** precies deze zes chips, in willekeurige volgorde:

```text
schermtijd slaap jongeren onderzoek filetype:pdf site:.edu OR site:.gov
```

### PT2.2 Zoekstrategie kiezen

- **Itemtype:** `search_filter_task`
- **Punten:** 1

**Leerlingtekst:**

Je wilt wetenschappelijke of overheidsinformatie, geen blog. Welke zoekstrategie helpt het meest?

**Opties:**

A. Alleen zoeken op “telefoon slecht slapen”  
B. Zoeken met bron- of domeinfilter en pdf/rapport  
C. Alleen zoeken binnen video’s  
D. Zoeken naar de populairste socialmediapost

**Correct antwoord:** B

### PT2.3 Bron kiezen

- **Itemtype:** `search_result_task`
- **Punten:** 1

**Leerlingtekst:**

Welk resultaat open je als eerste?

**Resultaten:**

A. `universiteit.nl — Onderzoeksrapport schermtijd en slaap bij jongeren (pdf)`  
B. `forumouders.nl — Mijn kind slaapt slecht door telefoon`  
C. `nieuwssnack.nl — Telefoons zijn slecht, zeggen experts`  
D. `fitin30dagen.blog — Minder schermtijd, beter leven`

**Correct antwoord:** A

---

## PT3 — Veiligheid en privacy

- **Kerndoel:** 23A Veiligheid en privacy
- **Punten:** 3

### Mockup mail

```text
Van: it-helpdesk@schoolnaam-admin.nl
Onderwerp: Office-account opnieuw verifiëren voor 17:00
Tekst:
Beste Samira,
Omdat je in klas H3B zit, moet je vandaag je Office-account opnieuw verifiëren.
Je mentor De Vries is geïnformeerd.
[Account verifiëren]
```

### PT3.1 Beoordeling

- **Itemtype:** `security_classification_task`
- **Punten:** 1

**Leerlingtekst:** Is dit bericht veilig of verdacht?

**Correct antwoord:** `Verdacht`

### PT3.2 Verdacht element aanklikken

- **Itemtype:** `security_hotspot_task`
- **Punten:** 1

**Hotspots:**

- Afzender: `it-helpdesk@schoolnaam-admin.nl`
- Persoonlijke gegevens: `Samira`, `H3B`, `mentor De Vries`
- Onderwerp: `opnieuw verifiëren voor 17:00`
- Knop: `Account verifiëren`

**Correcte hotspot:** `it-helpdesk@schoolnaam-admin.nl`

### PT3.3 Veilige actie kiezen

- **Itemtype:** `security_action_task`
- **Punten:** 1

**Opties:**

A. Verifiëren omdat naam, klas en mentor kloppen  
B. Via de officiële schoolomgeving of ICT-helpdesk controleren  
C. De mail beantwoorden met je wachtwoord  
D. De link openen in een incognitovenster

**Correct antwoord:** B

---

## PT4 — Data en spreadsheet

- **Kerndoel:** 21C Data
- **Punten:** 4

### Tabel

```text
Jaar | Huishouden | Verbruik_kWh | Kosten
2022 | A          | 1200         | 410
2025 | B          | 1180         | 520
2024 | C          | 1100         | 470
2023 | D          | 1300         | 450
2025 | E          | 1250         | 540
```

### PT4.1 Filter instellen

- **Itemtype:** `spreadsheet_filter_task`
- **Punten:** 1

**Leerlingtekst:** Filter op `Jaar = 2025`. Welke filterwaarde kies je?

**Correct antwoord:** `2025`

### PT4.2 Sorteerkolom na filter

- **Itemtype:** `spreadsheet_sort_task`
- **Punten:** 1

**Leerlingtekst:** Sorteer de overgebleven rijen op hoogste kosten. Welke kolom gebruik je?

**Correct antwoord:** `Kosten`

### PT4.3 Sorteerrichting

- **Itemtype:** `spreadsheet_sort_task`
- **Punten:** 1

**Correct antwoord:** `Hoog naar laag`

### PT4.4 Resultaat

- **Itemtype:** `spreadsheet_result_task`
- **Punten:** 1

**Leerlingtekst:** Welk huishouden staat bovenaan na filteren en sorteren?

**Correct antwoord:** `E`

---

## PT5 — Creëren met digitale technologie

- **Kerndoel:** 22A Creëren met digitale technologie
- **Punten:** 4

### PT5.1 Bestandsformaat

- **Itemtype:** `format_choice_task`
- **Punten:** 1

**Leerlingtekst:** Je ontwerpt een logo dat op verschillende formaten scherp moet blijven en later bewerkbaar moet zijn. Welk formaat kies je?

**Opties:** `.jpg`, `.png`, `.svg`, `.tif`

**Correct antwoord:** `.svg`

### PT5.2 Tool kiezen

- **Itemtype:** `creation_menu_task`
- **Punten:** 1

**Leerlingtekst:** Je wilt een grote dataset visualiseren in een grafiek en de grafiek later aanpassen. Welke tool past het best?

**Opties:**

A. Spreadsheetsoftware  
B. PDF-lezer  
C. Chatapp  
D. Audiobewerker

**Correct antwoord:** A

### PT5.3 Deelinstelling

- **Itemtype:** `sharing_settings_task`
- **Punten:** 1

**Leerlingtekst:** Je deelt onderzoeksdata met je groep. Groepsleden mogen data bekijken en opmerkingen plaatsen, maar niet wijzigen. Welke instelling kies je?

**Opties:**

A. Bewerken  
B. Reageren  
C. Eigenaar maken  
D. Openbaar bewerken

**Correct antwoord:** B

### PT5.4 Licentie en bron

- **Itemtype:** `source_credit_task`
- **Punten:** 1

**Leerlingtekst:** Je gebruikt een CC BY-afbeelding in een presentatie. Welke vermelding past het best?

**Opties:**

A. Alleen “Google Afbeeldingen”  
B. Maker, titel/bron en link naar licentie  
C. Geen vermelding, want het is gratis  
D. Alleen je eigen naam onder de afbeelding

**Correct antwoord:** B

---

## PT6 — Programmeren / algoritmisch denken

- **Kerndoel:** 22B Programmeren
- **Punten:** 4

### PT6.1 Stappen ordenen

- **Itemtype:** `algorithm_order_task`
- **Punten:** 1

**Leerlingtekst:** Tel hoeveel cijfers lager zijn dan 5,5. Zet de stappen goed.

**Blokken:**

- Zet teller op 0
- Kijk per cijfer of het lager is dan 5,5
- Verhoog teller met 1 als dat zo is
- Toon teller

**Correcte volgorde:**

```text
Zet teller op 0 > Kijk per cijfer of het lager is dan 5,5 > Verhoog teller met 1 als dat zo is > Toon teller
```

### PT6.2 Operator kiezen

- **Itemtype:** `condition_builder_task`
- **Punten:** 1

**Leerlingtekst:** Een melding mag alleen verschijnen als het warmer is dan 18 graden én het raam open staat. Welke operator hoort tussen de twee voorwaarden?

**Opties:** `OF`, `EN`, `NIET`, `DAN`

**Correct antwoord:** `EN`

### PT6.3 Bug vinden

- **Itemtype:** `bug_fix_task`
- **Punten:** 1

**Leerlingtekst:** De lus moet stoppen als `teller` 10 is, maar hij blijft doorgaan. Klik op de fout.

**Codeblokken:**

1. `teller = 0`  
2. `HERHAAL ZOLANG teller < 10`  
3. `toon teller`  
4. `teller = teller`

**Correct antwoord:** blok 4

### PT6.4 Bug oplossen

- **Itemtype:** `bug_fix_task`
- **Punten:** 1

**Leerlingtekst:** Welke regel lost de fout op?

**Opties:**

A. `teller = teller + 1`  
B. `teller = 0`  
C. `toon teller`  
D. `teller = tekst`

**Correct antwoord:** A

---

## Selected-response-items

### SR1 — AI en data

- **Kerndoel:** 21D AI
- **Itemtype:** `multiple_choice`
- **Punten:** 1

**Leerlingtekst:** Waarom kan een AI-systeem scheve of oneerlijke uitkomsten geven?

**Opties:**

A. Omdat trainingsdata onvolledig of scheef kunnen zijn  
B. Omdat AI altijd neutraal is  
C. Omdat AI zonder data werkt  
D. Omdat AI alleen langzamer wordt van data

**Correct antwoord:** A

### SR2 — Platformmacht en samenleving

- **Kerndoel:** 23C Digitale technologie, samenleving en wereld
- **Itemtype:** `multiple_choice`
- **Punten:** 1

**Leerlingtekst:** Waarom worden grote digitale platforms vaak op EU-niveau gereguleerd?

**Opties:**

A. Omdat één land vaak te weinig invloed heeft op wereldwijde platforms  
B. Omdat digitale regels alleen in Brussel mogen bestaan  
C. Omdat alle platforms in Nederland gevestigd zijn  
D. Omdat grote platforms zonder regels altijd eerlijk handelen

**Correct antwoord:** A

---

# 5. Implementatieprompt voor Codex

Gebruik deze prompt pas nadat dit bestand in de repo staat, bijvoorbeeld als `docs/nulmetingen_dg_itemset_v4_1.md`.

```text
Vervang de huidige toetsinhoud in src/data/assessments.ts exact door de itemset uit docs/nulmetingen_dg_itemset_v4_1.md.

Belangrijk:
- Verzin geen nieuwe items.
- Voeg geen eigen formuleringen toe aan leerlingteksten.
- Gebruik exact de itemtypes, punten, opties, correcte antwoorden en scoringregels uit het document.
- Scorende open tekstvelden zijn niet toegestaan.
- Geen live reverse image search.
- PT’s moeten echte micro-performance zijn: file actions, query chips, filters, hotspots, sort/filter-controls, menu/settings choices, drag-ordering, condition builder en bug-fix-clicks.
- Als een component nog niet bestaat, maak een minimale passende component. Gebruik niet opnieuw een gewone multiple-choice-renderer voor PT4/PT6 als dat vermijdbaar is.
- Randomiseer keuzeopties en startvolgorde bij ordering tasks, maar randomiseer geen vaste UI-posities in mockups.
- Log shownOptionOrder, finalState, selectedAnswer, isCorrect, score en maxScore.
- Behoud self_assessment als niet-scorend.
- Maxscore per versie moet 24 zijn.

Controleer daarna:
1. Alle vier versies starten.
2. Elke versie heeft maxscore 24.
3. PT1, PT2, PT3, PT4, PT5 en PT6 zijn interactief en niet slechts gewone MC-schermen.
4. Correcte acties scoren goed.
5. Foute acties scoren 0.
6. Export bevat de itemresultaten en totaalscore.
7. De app bouwt/start zonder errors.

Rapporteer welke bestanden gewijzigd zijn en welke componenten nieuw of aangepast zijn.
```

