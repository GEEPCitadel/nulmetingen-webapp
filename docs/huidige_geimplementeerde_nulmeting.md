# Huidige geimplementeerde nulmeting

Deze export is gegenereerd uit de actuele dataconfiguratie in `src/data/assessments.ts` en de generieke scoring in `src/lib/assessment.ts`.

## Vindplaatsen in de repo

- Toetsinhoud en standaard leerlingcodekoppelingen: `src/data/assessments.ts`.
- Types voor assessments, items, resultaten en sessies: `src/types.ts`.
- Scoring, randomisatie van antwoordvolgorde, sessieresultaten en logging: `src/lib/assessment.ts`.
- PT1-bestandsoperaties en padopbouw: `src/lib/pt1.ts`.
- Resultaat- en exportweergave: `src/App.tsx`.

## Algemene scoring en logging

- Keuze-items: volledige punten als `selectedAnswer` exact gelijk is aan `correctAnswer`, anders 0.
- Ordeningsitems: volledige punten als de gekozen volgorde exact gelijk is aan de correcte volgorde, anders 0.
- Bestandsbeheertaak: punten per vereist eindpad; totaal correct als alle vereiste paden aanwezig zijn.
- Zelfinschatting: niet-scorend, telt niet mee in het resultaat.
- Voor items met antwoordopties wordt de getoonde antwoordvolgorde per sessie opgeslagen in `shownOptionOrder`.
- Per itemresultaat worden onder meer `itemId`, `itemType`, `shownOptionOrder`, `selectedAnswer`, `isCorrect`, `score`, `maxScore`, `timestamp` en `timeSpentMs` opgeslagen.

## Leerjaar 1 VMBO (lj1-vmbo)

- Versie: lj1-vmbo
- Niveau: LJ1 VMBO
- Maximumscore: 20
- Richttijd: 30 minuten
- Thema: limeTeal

### Sectie: Zelfinschatting (zelfinschatting)

#### v0-zelfinschatting

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: v0-zelfinschatting
- Itemtype: self_assessment
- Punten: 0
- Kerndoel/domein: niet-scorend - Zelfinschatting

**Leerlingtekst**

Titel: Zelfinschatting

Instructie: Hoe goed ben jij met digitale dingen?

**Antwoordopties**

Geen keuzeopties.

**Correct antwoord**

Niet van toepassing; zelfinschatting telt niet mee.

**Scoringslogica**

Niet-scorend. Score is altijd 0; isCorrect is null.

**Developer-notities**

Geen extra developer-notities in de itemconfiguratie.

### Sectie: PT1 - Bestandsbeheer (pt1)

#### pt1-bestandsbeheer

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: pt1-bestandsbeheer
- Itemtype: file_task_simulation
- Punten: 3
- Kerndoel/domein: 21A - 21A Digitale systemen

**Leerlingtekst**

Titel: PT1 - Bestandsbeheer

Instructie: Kun jij netjes met mappen en bestanden werken? Maak de opdrachten hieronder. Als je klaar bent, klik dan op 'Taak afronden'.

Opdrachten: Open OneDrive en maak daar een map met de naam Schoolwerk. / Hernoem Presentatie_Biologie_v1.pptx naar Presentatie_Biologie_OUD.pptx. / Verplaats Eindproduct_Nederlands.docx naar Schoolwerk.

**Antwoordopties**

Geen keuzeopties.

**Correct antwoord**

Zie scoringslogica/eindtoestand.

**Scoringslogica**

Objectieve eindtoestandcontrole: per vereist pad wordt gecontroleerd of er een node met exact dat pad bestaat.
- 1 punt: Open OneDrive en maak daar een map met de naam Schoolwerk. Verwacht pad: Thuis/OneDrive/Schoolwerk
- 1 punt: Hernoem Presentatie_Biologie_v1.pptx naar Presentatie_Biologie_OUD.pptx. Verwacht pad: Thuis/OneDrive/Presentatie_Biologie_OUD.pptx
- 1 punt: Verplaats Eindproduct_Nederlands.docx naar Schoolwerk. Verwacht pad: Thuis/OneDrive/Schoolwerk/Eindproduct_Nederlands.docx
Totaal correct als alle vereiste paden aanwezig zijn.

**Developer-notities**

Startmap/rootId: root
Startbestanden en mappen: Thuis (folder, parent=geen); OneDrive (folder, parent=root); Galerijen (folder, parent=root); Downloads (folder, parent=root); Documenten (folder, parent=root); Foto_project.png (file, parent=galerijen); Installatiebestand.exe (file, parent=downloads); Aantekeningen.docx (file, parent=documenten); Foto_vakantie_2025.jpg (file, parent=onedrive); Eindproduct_Nederlands.docx (file, parent=onedrive); Presentatie_Biologie_v1.pptx (file, parent=onedrive); Presentatie_Biologie_v2.pptx (file, parent=onedrive); Schoolfoto_groep_3a.jpg (file, parent=onedrive)

### Sectie: PT2 - Zoekstrategie en bronkeuze (pt2)

#### pt2-zoekopdracht

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: pt2-zoekopdracht
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 21B - 21B Digitale media en informatie

**Leerlingtekst**

Titel: Kies de beste zoekopdracht

Instructie: Je zoekt betrouwbare cijfers over hoeveel inwoners Nederland heeft.

Mockup titel: Zoekopdracht

Mockup label: Zoekmachine

Mockup inhoud: Kies welke zoekopdracht je als eerste zou gebruiken.

**Antwoordopties**

- pt2-zoekopdracht-1: Nederland veel inwoners
- pt2-zoekopdracht-2: inwoners Nederland 2025 CBS
- pt2-zoekopdracht-3: mensen land Nederland alles
- pt2-zoekopdracht-4: hoeveel mensen wonen er ergens misschien

**Correct antwoord**

inwoners Nederland 2025 CBS

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt2-bronkeuze

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: pt2-bronkeuze
- Itemtype: single_choice_reason
- Punten: 1
- Kerndoel/domein: 21B - 21B Digitale media en informatie

**Leerlingtekst**

Titel: Kies de beste bron

Instructie: Welke bron open je als eerste?

Mockup titel: Resultaten

Mockup label: Zoekresultaten

Mockup inhoud: forum-leren.net - Wat ik denk dat het aantal inwoners is / cbs.nl - Bevolking; kerncijfers / tiktok.com - 5 feiten over Nederland / shopnieuws.nl - Waarom Nederland groeit

**Antwoordopties**

- pt2-bronkeuze-1: forum-leren.net - Wat ik denk dat het aantal inwoners is
- pt2-bronkeuze-2: cbs.nl - Bevolking; kerncijfers
- pt2-bronkeuze-3: tiktok.com - 5 feiten over Nederland
- pt2-bronkeuze-4: shopnieuws.nl - Waarom Nederland groeit

**Correct antwoord**

cbs.nl - Bevolking; kerncijfers

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT3 - Veiligheid en privacy (pt3)

#### pt3-bericht

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: pt3-bericht
- Itemtype: single_choice_reason
- Punten: 1
- Kerndoel/domein: 23A - 23A Veiligheid en privacy

**Leerlingtekst**

Titel: Beoordeel het bericht

Instructie: Is dit bericht veilig of verdacht?

Mockup titel: Mail

Mockup label: Bericht

Mockup inhoud: Afzender: netflix-herstel.nu / Onderwerp: Betaal nu, anders stopt je account / Knop: Herstel account

**Antwoordopties**

- pt3-bericht-1: Veilig
- pt3-bericht-2: Verdacht

**Correct antwoord**

Verdacht

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt3-beveiliging

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: pt3-beveiliging
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 23A - 23A Veiligheid en privacy

**Leerlingtekst**

Titel: Kies de beste beveiliging

Instructie: Welke instelling beschermt je account het best?

Mockup titel: Accountbeveiliging

Mockup label: Instellingen

Mockup inhoud: Laat iedereen jouw locatie zien / Zet tweestapsverificatie aan / Laat je wachtwoord altijd zien / Laat iedereen jou taggen

**Antwoordopties**

- pt3-beveiliging-1: Laat iedereen jouw locatie zien
- pt3-beveiliging-2: Zet tweestapsverificatie aan
- pt3-beveiliging-3: Laat je wachtwoord altijd zien
- pt3-beveiliging-4: Laat iedereen jou taggen

**Correct antwoord**

Zet tweestapsverificatie aan

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT4 - Data / spreadsheet (pt4)

#### pt4-sorteren

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: pt4-sorteren
- Itemtype: data_sort_task
- Punten: 1
- Kerndoel/domein: 21C - 21C Data

**Leerlingtekst**

Titel: Sorteer de tabel

Instructie: Sorteer op Jaar, nieuw naar oud. Welke artiest staat bovenaan?

Mockup titel: Liedjes

Mockup label: Spreadsheet

Mockup inhoud: Snelle | 2020 | pop / Maan | 2023 | pop / Froukje | 2021 | pop / Antoon | 2022 | rap

**Antwoordopties**

- pt4-sorteren-1: Snelle
- pt4-sorteren-2: Maan
- pt4-sorteren-3: Froukje
- pt4-sorteren-4: Antoon

**Correct antwoord**

Maan

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt4-filteren

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: pt4-filteren
- Itemtype: data_sort_task
- Punten: 1
- Kerndoel/domein: 21C - 21C Data

**Leerlingtekst**

Titel: Filter of lees de tabel

Instructie: Filter op Genre = pop. Welke artiest staat onderaan na de filter?

Mockup titel: Liedjes

Mockup label: Spreadsheet

Mockup inhoud: Snelle | 2020 | pop / Maan | 2023 | pop / Froukje | 2021 | pop / Antoon | 2022 | rap

**Antwoordopties**

- pt4-filteren-1: Snelle
- pt4-filteren-2: Maan
- pt4-filteren-3: Froukje
- pt4-filteren-4: Antoon

**Correct antwoord**

Snelle

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT5 - Creeren met digitale technologie (pt5)

#### pt5-formaat

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: pt5-formaat
- Itemtype: format_choice
- Punten: 1
- Kerndoel/domein: 22A - 22A Creeren met digitale technologie

**Leerlingtekst**

Titel: Kies het bestandsformaat

Instructie: Welk formaat is het beste voor een logo op een grote poster en op Instagram?

**Antwoordopties**

- pt5-formaat-1: .jpeg
- pt5-formaat-2: .svg
- pt5-formaat-3: .txt
- pt5-formaat-4: .mp3

**Correct antwoord**

.svg

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt5-tool

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: pt5-tool
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 22A - 22A Creeren met digitale technologie

**Leerlingtekst**

Titel: Kies de beste tool

Instructie: Je wilt samen met een klasgenoot tegelijk in een tekst werken. Welke tool past het best?

**Antwoordopties**

- pt5-tool-1: online tekstverwerker
- pt5-tool-2: pdf-lezer
- pt5-tool-3: rekenmachine-app
- pt5-tool-4: muziekspeler

**Correct antwoord**

online tekstverwerker

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT6 - Programmeren / algoritmisch denken (pt6)

#### pt6-volgorde

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: pt6-volgorde
- Itemtype: ordering_task
- Punten: 1
- Kerndoel/domein: 22B - 22B Programmeren

**Leerlingtekst**

Titel: Zet de stappen in de goede volgorde

Instructie: Zet de stappen in goede volgorde.

**Antwoordopties**

- pt6-volgorde-1: schrijf antwoord
- pt6-volgorde-2: lees getal
- pt6-volgorde-3: tel 1 erbij

**Correct antwoord**

lees getal > tel 1 erbij > schrijf antwoord

**Scoringslogica**

Automatische scoring: gekozen volgorde moet exact gelijk zijn aan de correcte volgorde. Bij exacte match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt6-voorwaarde

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: pt6-voorwaarde
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 22B - 22B Programmeren

**Leerlingtekst**

Titel: Kies de ontbrekende stap

Instructie: Regel: ALS score >= 60 DAN schrijf "goed". Wat gebeurt er bij score = 60?

**Antwoordopties**

- pt6-voorwaarde-1: niets
- pt6-voorwaarde-2: goed
- pt6-voorwaarde-3: fout
- pt6-voorwaarde-4: stop

**Correct antwoord**

goed

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt6-regel

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: pt6-regel
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 22B - 22B Programmeren

**Leerlingtekst**

Titel: Begrijp de regel

Instructie: Regel: score = score + 1. Wat doet deze regel?

**Antwoordopties**

- pt6-regel-1: score wordt 0
- pt6-regel-2: score gaat 1 omhoog
- pt6-regel-3: score blijft gelijk
- pt6-regel-4: score wordt tekst

**Correct antwoord**

score gaat 1 omhoog

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: Selected-response-items (sr)

Sectie-instructie: Kies steeds het beste antwoord.

#### sr1

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: sr1
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 21D - 21D AI

**Leerlingtekst**

Titel: AI controleren

Instructie: Een chatbot geeft een samenvatting van een boek. Later zie je dat het boek niet bestaat. Wat doe je het best?

**Antwoordopties**

- sr1-1: meteen inleveren
- sr1-2: controleren in een echte bron
- sr1-3: delen met vrienden
- sr1-4: niets

**Correct antwoord**

controleren in een echte bron

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr2

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: sr2
- Itemtype: ai_image_check
- Punten: 1
- Kerndoel/domein: 21D - 21D AI

**Leerlingtekst**

Titel: AI-beeld herkennen

Instructie: Een foto van een mens heeft 6 vingers en rare ogen. Wat is het meest logisch?

**Antwoordopties**

- sr2-1: het is zeker een echte foto
- sr2-2: het kan AI zijn
- sr2-3: het is een schilderij
- sr2-4: het is een scanfout

**Correct antwoord**

het kan AI zijn

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr3

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: sr3
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 23B - 23B Digitale technologie, jezelf en de ander

**Leerlingtekst**

Titel: Niet echt prive

Instructie: Je zet een verhaal op een prive-account met 300 volgers. Wat klopt het best?

**Antwoordopties**

- sr3-1: alleen jij kunt het zien
- sr3-2: het is echt prive
- sr3-3: volgers kunnen screenshotten en doorsturen
- sr3-4: het verdwijnt overal vanzelf

**Correct antwoord**

volgers kunnen screenshotten en doorsturen

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr4

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: sr4
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 23B - 23B Digitale technologie, jezelf en de ander

**Leerlingtekst**

Titel: Dark pattern

Instructie: Een app vraagt steeds opnieuw om meldingen aan te zetten, ook na 'Nee, nu niet'. Waarom gebeurt dat waarschijnlijk?

**Antwoordopties**

- sr4-1: de makers willen je langer terug laten komen
- sr4-2: de app is kapot
- sr4-3: je telefoon is vol
- sr4-4: de wifi is traag

**Correct antwoord**

de makers willen je langer terug laten komen

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr5

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: sr5
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 22A - 22A Creeren met digitale technologie

**Leerlingtekst**

Titel: Auteursrecht

Instructie: Je vindt een mooie foto online. Je wilt die op jouw website zetten. Wat mag je doen?

**Antwoordopties**

- sr5-1: gewoon gebruiken
- sr5-2: gebruiken met bronlink, zonder meer
- sr5-3: alleen gebruiken met toestemming of passende licentie
- sr5-4: alles van internet mag

**Correct antwoord**

alleen gebruiken met toestemming of passende licentie

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr6

- Versie: lj1-vmbo - Leerjaar 1 VMBO
- Item-id: sr6
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 23C - 23C Digitale technologie, samenleving en wereld

**Leerlingtekst**

Titel: Samenleving

Instructie: Veel mensen gebruiken dezelfde grote app voor school en contact. Wat is een risico?

**Antwoordopties**

- sr6-1: geen risico
- sr6-2: als die app stopt of verandert, hebben veel mensen tegelijk last
- sr6-3: dan wordt internet sneller
- sr6-4: dan is alles automatisch veilig

**Correct antwoord**

als die app stopt of verandert, hebben veel mensen tegelijk last

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

## Leerjaar 1 HAVO/VWO (lj1-hv)

- Versie: lj1-hv
- Niveau: LJ1 HAVO/VWO
- Maximumscore: 20
- Richttijd: 30 minuten
- Thema: skyOrange

### Sectie: Zelfinschatting (zelfinschatting)

#### v0-zelfinschatting

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: v0-zelfinschatting
- Itemtype: self_assessment
- Punten: 0
- Kerndoel/domein: niet-scorend - Zelfinschatting

**Leerlingtekst**

Titel: Zelfinschatting

Instructie: Hoe goed ben jij met digitale dingen?

**Antwoordopties**

Geen keuzeopties.

**Correct antwoord**

Niet van toepassing; zelfinschatting telt niet mee.

**Scoringslogica**

Niet-scorend. Score is altijd 0; isCorrect is null.

**Developer-notities**

Geen extra developer-notities in de itemconfiguratie.

### Sectie: PT1 - Bestandsbeheer (pt1)

#### pt1-bestandsbeheer

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: pt1-bestandsbeheer
- Itemtype: file_task_simulation
- Punten: 3
- Kerndoel/domein: 21A - 21A Digitale systemen

**Leerlingtekst**

Titel: PT1 - Bestandsbeheer

Instructie: Kun jij netjes met mappen en bestanden werken? Maak de opdrachten hieronder. Als je klaar bent, klik dan op 'Taak afronden'.

Opdrachten: Open OneDrive en maak daar een map met de naam Schoolwerk. / Hernoem Presentatie_Biologie_v1.pptx naar Presentatie_Biologie_OUD.pptx. / Verplaats Boekverslag_Nederlands.docx naar Schoolwerk.

**Antwoordopties**

Geen keuzeopties.

**Correct antwoord**

Zie scoringslogica/eindtoestand.

**Scoringslogica**

Objectieve eindtoestandcontrole: per vereist pad wordt gecontroleerd of er een node met exact dat pad bestaat.
- 1 punt: Open OneDrive en maak daar een map met de naam Schoolwerk. Verwacht pad: Thuis/OneDrive/Schoolwerk
- 1 punt: Hernoem Presentatie_Biologie_v1.pptx naar Presentatie_Biologie_OUD.pptx. Verwacht pad: Thuis/OneDrive/Presentatie_Biologie_OUD.pptx
- 1 punt: Verplaats Boekverslag_Nederlands.docx naar Schoolwerk. Verwacht pad: Thuis/OneDrive/Schoolwerk/Boekverslag_Nederlands.docx
Totaal correct als alle vereiste paden aanwezig zijn.

**Developer-notities**

Startmap/rootId: root
Startbestanden en mappen: Thuis (folder, parent=geen); OneDrive (folder, parent=root); Galerijen (folder, parent=root); Downloads (folder, parent=root); Documenten (folder, parent=root); Foto_project.png (file, parent=galerijen); Installatiebestand.exe (file, parent=downloads); Aantekeningen.docx (file, parent=documenten); Onderzoek_klimaat.docx (file, parent=onedrive); Boekverslag_Nederlands.docx (file, parent=onedrive); Presentatie_Biologie_v1.pptx (file, parent=onedrive); Presentatie_Biologie_v2.pptx (file, parent=onedrive); Foto_museum.jpg (file, parent=onedrive); Rooster.pdf (file, parent=onedrive)

### Sectie: PT2 - Zoekstrategie en bronkeuze (pt2)

#### pt2-zoekopdracht

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: pt2-zoekopdracht
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 21B - 21B Digitale media en informatie

**Leerlingtekst**

Titel: Kies de beste zoekopdracht

Instructie: Je zoekt betrouwbare cijfers over online winkelen in Nederland.

Mockup titel: Zoekopdracht

Mockup label: Zoekmachine

Mockup inhoud: Kies welke zoekopdracht je als eerste zou gebruiken.

**Antwoordopties**

- pt2-zoekopdracht-1: online winkelen leuk Nederland
- pt2-zoekopdracht-2: hoeveel mensen kopen dingen online
- pt2-zoekopdracht-3: online winkelen Nederland cijfers CBS
- pt2-zoekopdracht-4: webshop top 10

**Correct antwoord**

online winkelen Nederland cijfers CBS

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt2-bronkeuze

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: pt2-bronkeuze
- Itemtype: single_choice_reason
- Punten: 1
- Kerndoel/domein: 21B - 21B Digitale media en informatie

**Leerlingtekst**

Titel: Kies de beste bron

Instructie: Welke bron open je als eerste?

Mockup titel: Resultaten

Mockup label: Zoekresultaten

Mockup inhoud: influencerblog.nl - Waarom online shoppen groeit / cbs.nl - Online aankopen door huishoudens / forumschool.nl - Mijn mening over online shoppen / nieuwtjes247.nl - Top 8 webshops

**Antwoordopties**

- pt2-bronkeuze-1: influencerblog.nl - Waarom online shoppen groeit
- pt2-bronkeuze-2: cbs.nl - Online aankopen door huishoudens
- pt2-bronkeuze-3: forumschool.nl - Mijn mening over online shoppen
- pt2-bronkeuze-4: nieuwtjes247.nl - Top 8 webshops

**Correct antwoord**

cbs.nl - Online aankopen door huishoudens

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT3 - Veiligheid en privacy (pt3)

#### pt3-bericht

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: pt3-bericht
- Itemtype: single_choice_reason
- Punten: 1
- Kerndoel/domein: 23A - 23A Veiligheid en privacy

**Leerlingtekst**

Titel: Beoordeel het bericht

Instructie: Is dit bericht veilig of verdacht?

Mockup titel: SMS

Mockup label: Bericht

Mockup inhoud: Afzender: +31 6 12 34 56 78 / Tekst: PostNL: pakket mislukt. Betaal 1,99 via postnl-direct-pay.info

**Antwoordopties**

- pt3-bericht-1: Veilig
- pt3-bericht-2: Verdacht

**Correct antwoord**

Verdacht

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt3-beveiliging

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: pt3-beveiliging
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 23A - 23A Veiligheid en privacy

**Leerlingtekst**

Titel: Kies de beste beveiliging

Instructie: Welke instelling beschermt je account het best?

Mockup titel: Accountbeveiliging

Mockup label: Instellingen

Mockup inhoud: Tweestapsverificatie aan / Iedereen mag jouw berichten delen / Locatie altijd openbaar / Automatisch inloggen zonder check

**Antwoordopties**

- pt3-beveiliging-1: Tweestapsverificatie aan
- pt3-beveiliging-2: Iedereen mag jouw berichten delen
- pt3-beveiliging-3: Locatie altijd openbaar
- pt3-beveiliging-4: Automatisch inloggen zonder check

**Correct antwoord**

Tweestapsverificatie aan

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT4 - Data / spreadsheet (pt4)

#### pt4-sorteren

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: pt4-sorteren
- Itemtype: data_sort_task
- Punten: 1
- Kerndoel/domein: 21C - 21C Data

**Leerlingtekst**

Titel: Sorteer de tabel

Instructie: Sorteer op Jaar, nieuw naar oud. Welke titel staat bovenaan?

Mockup titel: Schoolbibliotheek

Mockup label: Spreadsheet

Mockup inhoud: Atlas | 2021 | aardrijkskunde / Biologie Vandaag | 2024 | biologie / Chemie Basis | 2022 | scheikunde / Cellen en DNA | 2023 | biologie

**Antwoordopties**

- pt4-sorteren-1: Atlas
- pt4-sorteren-2: Biologie Vandaag
- pt4-sorteren-3: Chemie Basis
- pt4-sorteren-4: Cellen en DNA

**Correct antwoord**

Biologie Vandaag

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt4-filteren

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: pt4-filteren
- Itemtype: data_sort_task
- Punten: 1
- Kerndoel/domein: 21C - 21C Data

**Leerlingtekst**

Titel: Filter of lees de tabel

Instructie: Filter op Categorie = biologie. Welke titel staat onderaan na de filter?

Mockup titel: Schoolbibliotheek

Mockup label: Spreadsheet

Mockup inhoud: Atlas | 2021 | aardrijkskunde / Biologie Vandaag | 2024 | biologie / Chemie Basis | 2022 | scheikunde / Cellen en DNA | 2023 | biologie

**Antwoordopties**

- pt4-filteren-1: Atlas
- pt4-filteren-2: Biologie Vandaag
- pt4-filteren-3: Chemie Basis
- pt4-filteren-4: Cellen en DNA

**Correct antwoord**

Cellen en DNA

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT5 - Creeren met digitale technologie (pt5)

#### pt5-formaat

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: pt5-formaat
- Itemtype: format_choice
- Punten: 1
- Kerndoel/domein: 22A - 22A Creeren met digitale technologie

**Leerlingtekst**

Titel: Kies het bestandsformaat

Instructie: Welk bestandsformaat past bij een logo op poster en social media?

**Antwoordopties**

- pt5-formaat-1: .jpeg
- pt5-formaat-2: .svg
- pt5-formaat-3: .txt
- pt5-formaat-4: .mp3

**Correct antwoord**

.svg

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt5-tool

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: pt5-tool
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 22A - 22A Creeren met digitale technologie

**Leerlingtekst**

Titel: Kies de beste tool

Instructie: Je hebt meetgegevens uit een practicum en wilt daar een grafiek van maken. Welke tool past het best?

**Antwoordopties**

- pt5-tool-1: spreadsheetsoftware
- pt5-tool-2: videobewerker
- pt5-tool-3: pdf-lezer
- pt5-tool-4: chatapp

**Correct antwoord**

spreadsheetsoftware

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT6 - Programmeren / algoritmisch denken (pt6)

#### pt6-volgorde

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: pt6-volgorde
- Itemtype: ordering_task
- Punten: 1
- Kerndoel/domein: 22B - 22B Programmeren

**Leerlingtekst**

Titel: Zet de stappen in de goede volgorde

Instructie: Zet de stappen in de goede volgorde.

**Antwoordopties**

- pt6-volgorde-1: lees temperatuur
- pt6-volgorde-2: is temperatuur lager dan 18?
- pt6-volgorde-3: zet verwarming aan
- pt6-volgorde-4: toon resultaat

**Correct antwoord**

lees temperatuur > is temperatuur lager dan 18? > zet verwarming aan > toon resultaat

**Scoringslogica**

Automatische scoring: gekozen volgorde moet exact gelijk zijn aan de correcte volgorde. Bij exacte match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt6-voorwaarde

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: pt6-voorwaarde
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 22B - 22B Programmeren

**Leerlingtekst**

Titel: Kies de ontbrekende stap

Instructie: Flow: START -> lees X -> ? -> schrijf "groot" -> STOP. Welke stap ontbreekt?

**Antwoordopties**

- pt6-voorwaarde-1: is X > 10?
- pt6-voorwaarde-2: maak X leeg
- pt6-voorwaarde-3: zet wifi uit
- pt6-voorwaarde-4: open bestand

**Correct antwoord**

is X > 10?

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt6-regel

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: pt6-regel
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 22B - 22B Programmeren

**Leerlingtekst**

Titel: Begrijp de regel

Instructie: Regel: aantal = aantal + 1. Wat gebeurt er?

**Antwoordopties**

- pt6-regel-1: aantal gaat 1 omhoog
- pt6-regel-2: aantal wordt tekst
- pt6-regel-3: aantal wordt 0
- pt6-regel-4: aantal stopt

**Correct antwoord**

aantal gaat 1 omhoog

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: Selected-response-items (sr)

Sectie-instructie: Kies steeds het beste antwoord.

#### sr1

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: sr1
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 21D - 21D AI

**Leerlingtekst**

Titel: AI-uitvoer controleren

Instructie: Een AI-tool geeft een jaartal. Later blijkt dat het niet klopt. Wat is de beste stap?

**Antwoordopties**

- sr1-1: bron controleren
- sr1-2: AI altijd geloven
- sr1-3: niets doen
- sr1-4: meteen publiceren

**Correct antwoord**

bron controleren

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr2

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: sr2
- Itemtype: ai_image_check
- Punten: 1
- Kerndoel/domein: 21D - 21D AI

**Leerlingtekst**

Titel: AI en data

Instructie: Een AI voor huidziektes is vooral getraind met foto's van lichte huid. Wat is waarschijnlijk?

**Antwoordopties**

- sr2-1: werkt beter voor alle huiden
- sr2-2: werkt minder goed voor donkere huid
- sr2-3: huid maakt geen verschil
- sr2-4: AI lost dat zelf altijd op

**Correct antwoord**

werkt minder goed voor donkere huid

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr3

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: sr3
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 23B - 23B Digitale technologie, jezelf en de ander

**Leerlingtekst**

Titel: Online identiteit

Instructie: Je verwijdert een foto na een uur. Wat klopt?

**Antwoordopties**

- sr3-1: dan is hij overal weg
- sr3-2: iemand kan hem al hebben opgeslagen of gescreenshot
- sr3-3: alleen jij ziet hem nog
- sr3-4: verwijderen maakt hem geheim

**Correct antwoord**

iemand kan hem al hebben opgeslagen of gescreenshot

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr4

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: sr4
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 23B - 23B Digitale technologie, jezelf en de ander

**Leerlingtekst**

Titel: Filterbubbel

Instructie: Je kijkt vaak filmpjes over een voetbalclub. Daarna krijg je vooral meer van hetzelfde. Hoe heet dat effect?

**Antwoordopties**

- sr4-1: automatische samenvatting
- sr4-2: filterbubbel
- sr4-3: versleuteling
- sr4-4: cloudopslag

**Correct antwoord**

filterbubbel

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr5

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: sr5
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 22A - 22A Creeren met digitale technologie

**Leerlingtekst**

Titel: Licenties

Instructie: Bij een afbeelding staat 'CC BY'. Wat betekent dat?

**Antwoordopties**

- sr5-1: je mag hem niet gebruiken
- sr5-2: je mag hem gebruiken als je de maker noemt
- sr5-3: je moet hem kopen
- sr5-4: hij is alleen voor muziek

**Correct antwoord**

je mag hem gebruiken als je de maker noemt

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr6

- Versie: lj1-hv - Leerjaar 1 HAVO/VWO
- Item-id: sr6
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 23C - 23C Digitale technologie, samenleving en wereld

**Leerlingtekst**

Titel: Werk en samenleving

Instructie: Waarom is digitale geletterdheid belangrijk voor later werk?

**Antwoordopties**

- sr6-1: alleen voor programmeurs
- sr6-2: bijna elk beroep gebruikt digitale systemen
- sr6-3: alleen voor influencers
- sr6-4: alleen voor banken

**Correct antwoord**

bijna elk beroep gebruikt digitale systemen

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

## Leerjaar 3 VMBO (lj3-vmbo)

- Versie: lj3-vmbo
- Niveau: LJ3 VMBO
- Maximumscore: 20
- Richttijd: 30 minuten
- Thema: mintPink

### Sectie: Zelfinschatting (zelfinschatting)

#### v0-zelfinschatting

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: v0-zelfinschatting
- Itemtype: self_assessment
- Punten: 0
- Kerndoel/domein: niet-scorend - Zelfinschatting

**Leerlingtekst**

Titel: Zelfinschatting

Instructie: Hoe goed ben jij met digitale dingen?

**Antwoordopties**

Geen keuzeopties.

**Correct antwoord**

Niet van toepassing; zelfinschatting telt niet mee.

**Scoringslogica**

Niet-scorend. Score is altijd 0; isCorrect is null.

**Developer-notities**

Geen extra developer-notities in de itemconfiguratie.

### Sectie: PT1 - Bestandsbeheer (pt1)

#### pt1-bestandsbeheer

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: pt1-bestandsbeheer
- Itemtype: file_task_simulation
- Punten: 3
- Kerndoel/domein: 21A - 21A Digitale systemen

**Leerlingtekst**

Titel: PT1 - Bestandsbeheer

Instructie: Kun jij netjes met mappen en bestanden werken? Maak de opdrachten hieronder. Als je klaar bent, klik dan op 'Taak afronden'.

Opdrachten: Open OneDrive en maak daar een map met de naam Schoolwerk. / Hernoem Presentatie_Biologie_v1.pptx naar Presentatie_Biologie_OUD.pptx. / Verplaats Eindproduct_Nederlands_DEF.docx naar Schoolwerk.

**Antwoordopties**

Geen keuzeopties.

**Correct antwoord**

Zie scoringslogica/eindtoestand.

**Scoringslogica**

Objectieve eindtoestandcontrole: per vereist pad wordt gecontroleerd of er een node met exact dat pad bestaat.
- 1 punt: Open OneDrive en maak daar een map met de naam Schoolwerk. Verwacht pad: Thuis/OneDrive/Schoolwerk
- 1 punt: Hernoem Presentatie_Biologie_v1.pptx naar Presentatie_Biologie_OUD.pptx. Verwacht pad: Thuis/OneDrive/Presentatie_Biologie_OUD.pptx
- 1 punt: Verplaats Eindproduct_Nederlands_DEF.docx naar Schoolwerk. Verwacht pad: Thuis/OneDrive/Schoolwerk/Eindproduct_Nederlands_DEF.docx
Totaal correct als alle vereiste paden aanwezig zijn.

**Developer-notities**

Startmap/rootId: root
Startbestanden en mappen: Thuis (folder, parent=geen); OneDrive (folder, parent=root); Galerijen (folder, parent=root); Downloads (folder, parent=root); Documenten (folder, parent=root); Foto_project.png (file, parent=galerijen); Installatiebestand.exe (file, parent=downloads); Aantekeningen.docx (file, parent=documenten); Eindproduct_Nederlands.docx (file, parent=onedrive); Eindproduct_Nederlands_DEF.docx (file, parent=onedrive); Presentatie_Biologie_v1.pptx (file, parent=onedrive); Presentatie_Biologie_v2.pptx (file, parent=onedrive); Planning_stage.pdf (file, parent=onedrive); Foto_vakantie_2025.jpg (file, parent=onedrive); Schoolfoto_groep_3a.jpg (file, parent=onedrive); Notities.txt (file, parent=onedrive)

### Sectie: PT2 - Zoekstrategie en bronkeuze (pt2)

#### pt2-zoekopdracht

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: pt2-zoekopdracht
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 21B - 21B Digitale media en informatie

**Leerlingtekst**

Titel: Kies de beste zoekopdracht

Instructie: Je zoekt betrouwbare cijfers per jaar over online winkelen in Nederland.

Mockup titel: Zoekopdracht

Mockup label: Zoekmachine

Mockup inhoud: Kies welke zoekopdracht je als eerste zou gebruiken.

**Antwoordopties**

- pt2-zoekopdracht-1: online shoppen cijfers
- pt2-zoekopdracht-2: online winkelen Nederland cijfers site:cbs.nl
- pt2-zoekopdracht-3: wat vinden mensen van webshops
- pt2-zoekopdracht-4: webshop influencers

**Correct antwoord**

online winkelen Nederland cijfers site:cbs.nl

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt2-bronkeuze

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: pt2-bronkeuze
- Itemtype: single_choice_reason
- Punten: 1
- Kerndoel/domein: 21B - 21B Digitale media en informatie

**Leerlingtekst**

Titel: Kies de beste bron

Instructie: Welke bron open je als eerste?

Mockup titel: Resultaten

Mockup label: Zoekresultaten

Mockup inhoud: forumconsument.nl - Ik denk dat online winkelen stijgt / cbs.nl - Online aankopen; huishoudens, 2014-2025 / nieuwssnack.nl - Webshops groeien hard / reclame-magazine.nl - 10 tips voor betere verkoop

**Antwoordopties**

- pt2-bronkeuze-1: forumconsument.nl - Ik denk dat online winkelen stijgt
- pt2-bronkeuze-2: cbs.nl - Online aankopen; huishoudens, 2014-2025
- pt2-bronkeuze-3: nieuwssnack.nl - Webshops groeien hard
- pt2-bronkeuze-4: reclame-magazine.nl - 10 tips voor betere verkoop

**Correct antwoord**

cbs.nl - Online aankopen; huishoudens, 2014-2025

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT3 - Veiligheid en privacy (pt3)

#### pt3-bericht

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: pt3-bericht
- Itemtype: single_choice_reason
- Punten: 1
- Kerndoel/domein: 23A - 23A Veiligheid en privacy

**Leerlingtekst**

Titel: Beoordeel het bericht

Instructie: Is dit bericht veilig of verdacht?

Mockup titel: Mail

Mockup label: Bericht

Mockup inhoud: Van: it-support@school-update.nl / Onderwerp: Nieuwe schoollogin nodig voor 17:00 / Knop: Wachtwoord instellen

**Antwoordopties**

- pt3-bericht-1: Veilig
- pt3-bericht-2: Verdacht

**Correct antwoord**

Verdacht

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt3-beveiliging

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: pt3-beveiliging
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 23A - 23A Veiligheid en privacy

**Leerlingtekst**

Titel: Kies de beste beveiliging

Instructie: Welke instelling beschermt je account het best?

Mockup titel: Accountbeveiliging

Mockup label: Instellingen

Mockup inhoud: Tweestapsverificatie aan / Iedereen mag jouw bestanden zien / Meldingen van onbekenden aan / Wachtwoord opslaan op openbaar apparaat

**Antwoordopties**

- pt3-beveiliging-1: Tweestapsverificatie aan
- pt3-beveiliging-2: Iedereen mag jouw bestanden zien
- pt3-beveiliging-3: Meldingen van onbekenden aan
- pt3-beveiliging-4: Wachtwoord opslaan op openbaar apparaat

**Correct antwoord**

Tweestapsverificatie aan

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT4 - Data / spreadsheet (pt4)

#### pt4-sorteren

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: pt4-sorteren
- Itemtype: data_sort_task
- Punten: 1
- Kerndoel/domein: 21C - 21C Data

**Leerlingtekst**

Titel: Sorteer de tabel

Instructie: Sorteer op Jaar, nieuw naar oud. Welke bestelling staat bovenaan?

Mockup titel: Webshopbestellingen

Mockup label: Spreadsheet

Mockup inhoud: A102 | 2022 | kleding | 45 / A215 | 2025 | elektronica | 89 / A188 | 2024 | kleding | 62 / A301 | 2023 | elektronica | 54

**Antwoordopties**

- pt4-sorteren-1: A102
- pt4-sorteren-2: A215
- pt4-sorteren-3: A188
- pt4-sorteren-4: A301

**Correct antwoord**

A215

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt4-filteren

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: pt4-filteren
- Itemtype: data_sort_task
- Punten: 1
- Kerndoel/domein: 21C - 21C Data

**Leerlingtekst**

Titel: Filter of lees de tabel

Instructie: Filter op Categorie = elektronica. Welke bestelling staat dan onderaan?

Mockup titel: Webshopbestellingen

Mockup label: Spreadsheet

Mockup inhoud: A102 | 2022 | kleding | 45 / A215 | 2025 | elektronica | 89 / A188 | 2024 | kleding | 62 / A301 | 2023 | elektronica | 54

**Antwoordopties**

- pt4-filteren-1: A102
- pt4-filteren-2: A215
- pt4-filteren-3: A188
- pt4-filteren-4: A301

**Correct antwoord**

A301

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT5 - Creeren met digitale technologie (pt5)

#### pt5-formaat

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: pt5-formaat
- Itemtype: format_choice
- Punten: 1
- Kerndoel/domein: 22A - 22A Creeren met digitale technologie

**Leerlingtekst**

Titel: Kies het bestandsformaat

Instructie: Welk formaat is het beste voor een logo op busje, poster en Instagram?

**Antwoordopties**

- pt5-formaat-1: .jpeg
- pt5-formaat-2: .svg
- pt5-formaat-3: .mp4
- pt5-formaat-4: .txt

**Correct antwoord**

.svg

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt5-tool

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: pt5-tool
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 22A - 22A Creeren met digitale technologie

**Leerlingtekst**

Titel: Kies de beste tool

Instructie: Je hebt meetgegevens uit een proef en wilt daar snel een grafiek van maken. Welke tool past het best?

**Antwoordopties**

- pt5-tool-1: spreadsheetsoftware
- pt5-tool-2: fotobewerker
- pt5-tool-3: muziekspeler
- pt5-tool-4: pdf-lezer

**Correct antwoord**

spreadsheetsoftware

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT6 - Programmeren / algoritmisch denken (pt6)

#### pt6-volgorde

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: pt6-volgorde
- Itemtype: ordering_task
- Punten: 1
- Kerndoel/domein: 22B - 22B Programmeren

**Leerlingtekst**

Titel: Zet de stappen in de goede volgorde

Instructie: Doel: bereken totaalbedrag met korting bij 5 of meer producten. Zet de stappen in goede volgorde.

**Antwoordopties**

- pt6-volgorde-1: laat totaal zien
- pt6-volgorde-2: bereken totaal = aantal x prijs
- pt6-volgorde-3: kijk of aantal >= 5
- pt6-volgorde-4: haal 10% korting van totaal af

**Correct antwoord**

bereken totaal = aantal x prijs > kijk of aantal >= 5 > haal 10% korting van totaal af > laat totaal zien

**Scoringslogica**

Automatische scoring: gekozen volgorde moet exact gelijk zijn aan de correcte volgorde. Bij exacte match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt6-voorwaarde

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: pt6-voorwaarde
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 22B - 22B Programmeren

**Leerlingtekst**

Titel: Kies de ontbrekende stap

Instructie: Regel: ALS punten __ 60 DAN schrijf "geslaagd". Welke operator ontbreekt?

**Antwoordopties**

- pt6-voorwaarde-1: <
- pt6-voorwaarde-2: =
- pt6-voorwaarde-3: >=
- pt6-voorwaarde-4: !=

**Correct antwoord**

>=

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt6-regel

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: pt6-regel
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 22B - 22B Programmeren

**Leerlingtekst**

Titel: Begrijp de regel

Instructie: Een lus stopt nooit. Wat is het meest waarschijnlijk?

**Antwoordopties**

- pt6-regel-1: teller verandert niet
- pt6-regel-2: scherm is te klein
- pt6-regel-3: wifi is uit
- pt6-regel-4: computer is stil

**Correct antwoord**

teller verandert niet

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: Selected-response-items (sr)

Sectie-instructie: Kies steeds het beste antwoord.

#### sr1

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: sr1
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 21D - 21D AI

**Leerlingtekst**

Titel: AI controleren

Instructie: Een AI-chatbot geeft een zelfverzekerd antwoord, maar zonder bron. Wat doe je het best?

**Antwoordopties**

- sr1-1: bron controleren in een andere bron
- sr1-2: aannemen dat het klopt
- sr1-3: direct delen
- sr1-4: niets

**Correct antwoord**

bron controleren in een andere bron

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr2

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: sr2
- Itemtype: ai_image_check
- Punten: 1
- Kerndoel/domein: 21D - 21D AI

**Leerlingtekst**

Titel: AI en trainingsdata

Instructie: Wat is een risico als een AI is getraind met een scheve dataset?

**Antwoordopties**

- sr2-1: de uitkomst kan oneerlijk of minder nauwkeurig zijn
- sr2-2: de AI wordt sneller
- sr2-3: de AI krijgt meer geheugen
- sr2-4: er is dan geen verschil

**Correct antwoord**

de uitkomst kan oneerlijk of minder nauwkeurig zijn

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr3

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: sr3
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 23B - 23B Digitale technologie, jezelf en de ander

**Leerlingtekst**

Titel: Online identiteit

Instructie: Je solliciteert voor stage. Er staan nog oude foto's van jou online. Wat kan er gebeuren?

**Antwoordopties**

- sr3-1: niets, oude foto's tellen niet mee
- sr3-2: iemand kan ze nog vinden of delen
- sr3-3: stagebedrijven mogen internet niet gebruiken
- sr3-4: foto's verdwijnen vanzelf overal

**Correct antwoord**

iemand kan ze nog vinden of delen

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr4

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: sr4
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 23B - 23B Digitale technologie, jezelf en de ander

**Leerlingtekst**

Titel: Aandacht vasthouden

Instructie: Een app gebruikt felle meldingen, streaks en aftellers. Waarom doet de app dat?

**Antwoordopties**

- sr4-1: om jouw aandacht vast te houden
- sr4-2: om batterij te sparen
- sr4-3: om wifi te testen
- sr4-4: om foto's mooier te maken

**Correct antwoord**

om jouw aandacht vast te houden

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr5

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: sr5
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 22A - 22A Creeren met digitale technologie

**Leerlingtekst**

Titel: Auteursrecht/licentie

Instructie: Je maakt een video met beeld van internet. Wat moet je altijd checken?

**Antwoordopties**

- sr5-1: of er toestemming of een passende licentie is
- sr5-2: alleen of het plaatje mooi is
- sr5-3: alleen of het gratis is
- sr5-4: alleen of je vriend het kent

**Correct antwoord**

of er toestemming of een passende licentie is

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr6

- Versie: lj3-vmbo - Leerjaar 3 VMBO
- Item-id: sr6
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 23C - 23C Digitale technologie, samenleving en wereld

**Leerlingtekst**

Titel: Samenleving

Instructie: Waarom is het een risico dat veel scholen, bedrijven en mensen van een paar grote techbedrijven afhangen?

**Antwoordopties**

- sr6-1: omdat alles dan automatisch duur wordt
- sr6-2: omdat storingen of regelwijzigingen veel mensen tegelijk raken
- sr6-3: omdat internet dan sneller wordt
- sr6-4: omdat dan niemand meer hoeft te leren

**Correct antwoord**

omdat storingen of regelwijzigingen veel mensen tegelijk raken

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

## Leerjaar 3 HAVO/VWO (lj3-hv)

- Versie: lj3-hv
- Niveau: LJ3 HAVO/VWO
- Maximumscore: 20
- Richttijd: 30 minuten
- Thema: sandCoral

### Sectie: Zelfinschatting (zelfinschatting)

#### v0-zelfinschatting

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: v0-zelfinschatting
- Itemtype: self_assessment
- Punten: 0
- Kerndoel/domein: niet-scorend - Zelfinschatting

**Leerlingtekst**

Titel: Zelfinschatting

Instructie: Hoe goed ben jij met digitale dingen?

**Antwoordopties**

Geen keuzeopties.

**Correct antwoord**

Niet van toepassing; zelfinschatting telt niet mee.

**Scoringslogica**

Niet-scorend. Score is altijd 0; isCorrect is null.

**Developer-notities**

Geen extra developer-notities in de itemconfiguratie.

### Sectie: PT1 - Bestandsbeheer (pt1)

#### pt1-bestandsbeheer

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: pt1-bestandsbeheer
- Itemtype: file_task_simulation
- Punten: 3
- Kerndoel/domein: 21A - 21A Digitale systemen

**Leerlingtekst**

Titel: PT1 - Bestandsbeheer

Instructie: Kun jij netjes met mappen en bestanden werken? Maak de opdrachten hieronder. Als je klaar bent, klik dan op 'Taak afronden'.

Opdrachten: Open OneDrive en maak daar een map met de naam Schoolwerk. / Hernoem Presentatie_Biologie_v1.pptx naar Presentatie_Biologie_OUD.pptx. / Verplaats Onderzoek_klimaat_DEF.docx naar Schoolwerk.

**Antwoordopties**

Geen keuzeopties.

**Correct antwoord**

Zie scoringslogica/eindtoestand.

**Scoringslogica**

Objectieve eindtoestandcontrole: per vereist pad wordt gecontroleerd of er een node met exact dat pad bestaat.
- 1 punt: Open OneDrive en maak daar een map met de naam Schoolwerk. Verwacht pad: Thuis/OneDrive/Schoolwerk
- 1 punt: Hernoem Presentatie_Biologie_v1.pptx naar Presentatie_Biologie_OUD.pptx. Verwacht pad: Thuis/OneDrive/Presentatie_Biologie_OUD.pptx
- 1 punt: Verplaats Onderzoek_klimaat_DEF.docx naar Schoolwerk. Verwacht pad: Thuis/OneDrive/Schoolwerk/Onderzoek_klimaat_DEF.docx
Totaal correct als alle vereiste paden aanwezig zijn.

**Developer-notities**

Startmap/rootId: root
Startbestanden en mappen: Thuis (folder, parent=geen); OneDrive (folder, parent=root); Galerijen (folder, parent=root); Downloads (folder, parent=root); Documenten (folder, parent=root); Foto_project.png (file, parent=galerijen); Installatiebestand.exe (file, parent=downloads); Aantekeningen.docx (file, parent=documenten); Onderzoek_klimaat_v1.docx (file, parent=onedrive); Onderzoek_klimaat_DEF.docx (file, parent=onedrive); Presentatie_Biologie_v1.pptx (file, parent=onedrive); Presentatie_Biologie_v2.pptx (file, parent=onedrive); Rooster_2026.pdf (file, parent=onedrive); Foto_museum.jpg (file, parent=onedrive); Notities_stage.txt (file, parent=onedrive); Samenvatting_Geschiedenis.docx (file, parent=onedrive)

### Sectie: PT2 - Zoekstrategie en bronkeuze (pt2)

#### pt2-zoekopdracht

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: pt2-zoekopdracht
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 21B - 21B Digitale media en informatie

**Leerlingtekst**

Titel: Kies de beste zoekopdracht

Instructie: Je zoekt een betrouwbare bron met cijfers of onderzoek over schermtijd en slaap bij jongeren.

Mockup titel: Zoekopdracht

Mockup label: Zoekmachine

Mockup inhoud: Kies welke zoekopdracht je als eerste zou gebruiken.

**Antwoordopties**

- pt2-zoekopdracht-1: slaap jongeren schermtijd
- pt2-zoekopdracht-2: schermtijd jongeren slaap filetype:pdf site:.gov OR site:.edu
- pt2-zoekopdracht-3: telefoon slecht slapen meningen
- pt2-zoekopdracht-4: jongeren tiktok slaap problemen

**Correct antwoord**

schermtijd jongeren slaap filetype:pdf site:.gov OR site:.edu

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt2-bronkeuze

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: pt2-bronkeuze
- Itemtype: single_choice_reason
- Punten: 1
- Kerndoel/domein: 21B - 21B Digitale media en informatie

**Leerlingtekst**

Titel: Kies de beste bron

Instructie: Welke bron open je als eerste?

Mockup titel: Resultaten

Mockup label: Zoekresultaten

Mockup inhoud: forumouders.nl - Mijn kind slaapt slecht door telefoon / universiteit.nl - Onderzoeksrapport schermtijd en slaap bij jongeren (pdf) / nieuwssnack.nl - Telefoons zijn slecht, zeggen experts / fitin30dagen.blog - Minder schermtijd, beter leven

**Antwoordopties**

- pt2-bronkeuze-1: forumouders.nl - Mijn kind slaapt slecht door telefoon
- pt2-bronkeuze-2: universiteit.nl - Onderzoeksrapport schermtijd en slaap bij jongeren (pdf)
- pt2-bronkeuze-3: nieuwssnack.nl - Telefoons zijn slecht, zeggen experts
- pt2-bronkeuze-4: fitin30dagen.blog - Minder schermtijd, beter leven

**Correct antwoord**

universiteit.nl - Onderzoeksrapport schermtijd en slaap bij jongeren (pdf)

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT3 - Veiligheid en privacy (pt3)

#### pt3-bericht

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: pt3-bericht
- Itemtype: single_choice_reason
- Punten: 1
- Kerndoel/domein: 23A - 23A Veiligheid en privacy

**Leerlingtekst**

Titel: Beoordeel het bericht

Instructie: Is dit bericht veilig of verdacht?

Mockup titel: Mail

Mockup label: Bericht

Mockup inhoud: Van: it-helpdesk@schoolnaam-admin.nl / Onderwerp: Office-account opnieuw verifieren voor 17:00 / De tekst noemt naam van mentor en klas.

**Antwoordopties**

- pt3-bericht-1: Veilig
- pt3-bericht-2: Verdacht

**Correct antwoord**

Verdacht

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt3-beveiliging

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: pt3-beveiliging
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 23A - 23A Veiligheid en privacy

**Leerlingtekst**

Titel: Kies de beste beveiliging

Instructie: Welke instelling beschermt je account het best?

Mockup titel: Accountbeveiliging

Mockup label: Instellingen

Mockup inhoud: Tweestapsverificatie via authenticator-app aanzetten / Wachtwoord delen met teamleider / Alle apparaten automatisch vertrouwen / Profiel openbaar voor iedereen

**Antwoordopties**

- pt3-beveiliging-1: Tweestapsverificatie via authenticator-app aanzetten
- pt3-beveiliging-2: Wachtwoord delen met teamleider
- pt3-beveiliging-3: Alle apparaten automatisch vertrouwen
- pt3-beveiliging-4: Profiel openbaar voor iedereen

**Correct antwoord**

Tweestapsverificatie via authenticator-app aanzetten

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT4 - Data / spreadsheet (pt4)

#### pt4-sorteren

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: pt4-sorteren
- Itemtype: data_sort_task
- Punten: 1
- Kerndoel/domein: 21C - 21C Data

**Leerlingtekst**

Titel: Sorteer de tabel

Instructie: Sorteer op Jaar, nieuw naar oud. Welke rij staat bovenaan?

Mockup titel: Open data energiekosten

Mockup label: Spreadsheet

Mockup inhoud: 2022 | A | 1200 | 410 / 2025 | B | 1180 | 520 / 2024 | C | 1100 | 470 / 2023 | D | 1300 | 450

**Antwoordopties**

- pt4-sorteren-1: A
- pt4-sorteren-2: B
- pt4-sorteren-3: C
- pt4-sorteren-4: D

**Correct antwoord**

B

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt4-filteren

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: pt4-filteren
- Itemtype: data_sort_task
- Punten: 1
- Kerndoel/domein: 21C - 21C Data

**Leerlingtekst**

Titel: Filter of lees de tabel

Instructie: Filter op Kosten > 450. Welke huishoudens blijven over?

Mockup titel: Open data energiekosten

Mockup label: Spreadsheet

Mockup inhoud: 2022 | A | 1200 | 410 / 2025 | B | 1180 | 520 / 2024 | C | 1100 | 470 / 2023 | D | 1300 | 450

**Antwoordopties**

- pt4-filteren-1: A en C
- pt4-filteren-2: B en C
- pt4-filteren-3: B en D
- pt4-filteren-4: A en D

**Correct antwoord**

B en C

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT5 - Creeren met digitale technologie (pt5)

#### pt5-formaat

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: pt5-formaat
- Itemtype: format_choice
- Punten: 1
- Kerndoel/domein: 22A - 22A Creeren met digitale technologie

**Leerlingtekst**

Titel: Kies het bestandsformaat

Instructie: Welk formaat gebruik je het best voor een logo dat op verschillende formaten scherp moet blijven?

**Antwoordopties**

- pt5-formaat-1: .jpeg
- pt5-formaat-2: .svg
- pt5-formaat-3: .wav
- pt5-formaat-4: .txt

**Correct antwoord**

.svg

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt5-tool

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: pt5-tool
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 22A - 22A Creeren met digitale technologie

**Leerlingtekst**

Titel: Kies de beste tool

Instructie: Je wilt een grote dataset visualiseren in een grafiek en later aanpassen. Welke tool past het best?

**Antwoordopties**

- pt5-tool-1: spreadsheetsoftware
- pt5-tool-2: chatapp
- pt5-tool-3: audiobewerker
- pt5-tool-4: pdf-lezer

**Correct antwoord**

spreadsheetsoftware

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: PT6 - Programmeren / algoritmisch denken (pt6)

#### pt6-volgorde

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: pt6-volgorde
- Itemtype: ordering_task
- Punten: 1
- Kerndoel/domein: 22B - 22B Programmeren

**Leerlingtekst**

Titel: Zet de stappen in de goede volgorde

Instructie: Doel: tel hoeveel cijfers lager zijn dan 5,5. Zet de stappen in goede volgorde.

**Antwoordopties**

- pt6-volgorde-1: zet teller op 0
- pt6-volgorde-2: kijk per cijfer of het lager is dan 5,5
- pt6-volgorde-3: verhoog teller met 1 als dat zo is
- pt6-volgorde-4: toon teller

**Correct antwoord**

zet teller op 0 > kijk per cijfer of het lager is dan 5,5 > verhoog teller met 1 als dat zo is > toon teller

**Scoringslogica**

Automatische scoring: gekozen volgorde moet exact gelijk zijn aan de correcte volgorde. Bij exacte match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt6-voorwaarde

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: pt6-voorwaarde
- Itemtype: interface_choice
- Punten: 1
- Kerndoel/domein: 22B - 22B Programmeren

**Leerlingtekst**

Titel: Kies de ontbrekende stap

Instructie: Regel: ALS (temperatuur > 18) EN (raam = open) DAN ... Welk woord laat beide voorwaarden tegelijk waar zijn?

**Antwoordopties**

- pt6-voorwaarde-1: OF
- pt6-voorwaarde-2: EN
- pt6-voorwaarde-3: NIET
- pt6-voorwaarde-4: DAN

**Correct antwoord**

EN

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### pt6-regel

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: pt6-regel
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 22B - 22B Programmeren

**Leerlingtekst**

Titel: Begrijp de regel

Instructie: Een programma blijft in een oneindige lus hangen. Wat is de meest waarschijnlijke oorzaak?

**Antwoordopties**

- pt6-regel-1: de stopvoorwaarde wordt nooit waar
- pt6-regel-2: het scherm is te fel
- pt6-regel-3: de gebruiker typt te snel
- pt6-regel-4: de computer heeft geen muis

**Correct antwoord**

de stopvoorwaarde wordt nooit waar

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

### Sectie: Selected-response-items (sr)

Sectie-instructie: Kies steeds het beste antwoord.

#### sr1

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: sr1
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 21D - 21D AI

**Leerlingtekst**

Titel: AI-uitvoer verifieren

Instructie: Een generatieve AI geeft een overtuigend antwoord zonder controleerbare bron. Wat is de beste reactie?

**Antwoordopties**

- sr1-1: verificatie in een onafhankelijke bron
- sr1-2: aannemen dat overtuigende taal genoeg is
- sr1-3: antwoord direct overnemen
- sr1-4: antwoord niet meer lezen

**Correct antwoord**

verificatie in een onafhankelijke bron

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr2

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: sr2
- Itemtype: ai_image_check
- Punten: 1
- Kerndoel/domein: 21D - 21D AI

**Leerlingtekst**

Titel: AI en data

Instructie: Waarom kan een AI-systeem scheve of oneerlijke uitkomsten geven?

**Antwoordopties**

- sr2-1: omdat trainingsdata onvolledig of scheef kunnen zijn
- sr2-2: omdat AI altijd neutraal is
- sr2-3: omdat AI geen data gebruikt
- sr2-4: omdat alleen internet langzaam is

**Correct antwoord**

omdat trainingsdata onvolledig of scheef kunnen zijn

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr3

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: sr3
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 23B - 23B Digitale technologie, jezelf en de ander

**Leerlingtekst**

Titel: Online identiteit

Instructie: Je profiel is prive, maar je hebt 400 volgers waarvan je niet iedereen kent. Wat klopt het best?

**Antwoordopties**

- sr3-1: het is volledig prive
- sr3-2: volgers kunnen nog steeds screenshotten en delen
- sr3-3: dan kan niets uitlekken
- sr3-4: prive betekent automatisch veilig

**Correct antwoord**

volgers kunnen nog steeds screenshotten en delen

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr4

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: sr4
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 23B - 23B Digitale technologie, jezelf en de ander

**Leerlingtekst**

Titel: Aandacht en beinvloeding

Instructie: Wat is een dark pattern?

**Antwoordopties**

- sr4-1: een ontwerpkeuze die je subtiel stuurt naar wat het platform wil
- sr4-2: een fout in de wifi
- sr4-3: een zwarte achtergrond van een app
- sr4-4: een geheime code in software

**Correct antwoord**

een ontwerpkeuze die je subtiel stuurt naar wat het platform wil

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr5

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: sr5
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 22A - 22A Creeren met digitale technologie

**Leerlingtekst**

Titel: Auteursrecht en licentie

Instructie: Wat is het verschil tussen auteursrecht en Creative Commons?

**Antwoordopties**

- sr5-1: er is geen verschil
- sr5-2: auteursrecht geeft exclusieve rechten; CC geeft gebruik onder voorwaarden
- sr5-3: CC betekent automatisch gratis zonder regels
- sr5-4: auteursrecht geldt niet online

**Correct antwoord**

auteursrecht geeft exclusieve rechten; CC geeft gebruik onder voorwaarden

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.

#### sr6

- Versie: lj3-hv - Leerjaar 3 HAVO/VWO
- Item-id: sr6
- Itemtype: multiple_choice
- Punten: 1
- Kerndoel/domein: 23C - 23C Digitale technologie, samenleving en wereld

**Leerlingtekst**

Titel: Samenleving en regulering

Instructie: Waarom worden grote digitale platforms en AI-systemen vaak op EU-niveau gereguleerd?

**Antwoordopties**

- sr6-1: omdat een land vaak te weinig invloed heeft op wereldwijde bedrijven
- sr6-2: omdat digitale regels alleen in Brussel mogen bestaan
- sr6-3: omdat alle techbedrijven in Nederland zitten
- sr6-4: omdat AI zonder regels altijd eerlijk is

**Correct antwoord**

omdat een land vaak te weinig invloed heeft op wereldwijde bedrijven

**Scoringslogica**

Automatische scoring: gekozen antwoord-id moet exact gelijk zijn aan correctAnswer. Bij match volledige punten, anders 0.

**Developer-notities**

Antwoordvolgorde wordt per sessie wel gerandomiseerd.
UI ondersteunt "Weet ik niet"; dit scoort 0 punten.
