# Nulmetingen Digitale Geletterdheid v5 — specificatie voor Codex

Dit document beschrijft vier nulmetingen Digitale Geletterdheid (DG) voor het voortgezet onderwijs. Implementeer exact wat hieronder staat. Verzin geen extra items, afleiders, datasets, correcte antwoorden of scoringsregels.

## Versies

1. `lj1-vmbo` — Leerjaar 1 VMBO
2. `lj1-hv` — Leerjaar 1 HAVO/VWO
3. `lj3-vmbo` — Leerjaar 3 VMBO
4. `lj3-hv` — Leerjaar 3 HAVO/VWO

## Kernkeuzes

- Maximumscore per versie: **32 punten**.
- Richttijd: **30 minuten**.
- Context: Microsoft/Office-achtig: Outlook, OneDrive, Word, Excel, Teams.
- De PT-kern bestaat uit echte micro-performance tasks of klikbare screenshots.
- Geen rubric-based scoring.
- Geen live reverse image search.
- Geen scorende open tekstvelden, behalve exacte korte codes uit downloadtaken.
- Echte downloadbestanden voor Excel/data-taken.
- Selected-response-items (SR) zijn nu het structurele knowledge-based blok per versie (niet meer beperkt tot 2 items).
- `Weet ik niet` blijft beschikbaar in SR-items en zelfinschatting; in PT3, PT5 (vervallen), PT6 en PT8 wordt een `Sla over`-knop toegevoegd waar aangegeven. PT1, PT2, PT4 en PT7 hebben geen skip omdat eindstate zelf het signaal levert.
- `Weet ik niet` scoort 0 en wordt niet mee-gerandomiseerd.
- Randomiseer antwoordopties bij SR-items. Randomiseer vaste Office-/Teams-/Outlook-knoppen niet.

## Puntentelling per versie

| Blok | LJ1 VMBO | LJ1 HV | LJ3 VMBO | LJ3 HV |
|---|---:|---:|---:|---:|
| Zelfinschatting | 0 | 0 | 0 | 0 |
| PT1 Bestanden en mappen | 4 | 4 | 4 | 4 |
| PT2 Mail opstellen | 4 | 4 | 4 | 4 |
| PT3 Account, apparaat, verbinding | — (in SR) | — (in SR) | 4 | 4 |
| PT4 Excel/data sorteren en filteren | 4 | 4 | 4 | 4 |
| PT5 PowerPoint (verwijderd) | — | — | — | — |
| PT6 Videovergadering en schermdelen | 3 | 3 | 3 | 3 |
| PT7 Blokprogrammeren | 4 | 4 | 4 | 4 |
| PT8 Online gedrag | 3 | 3 | 3 | 3 |
| SR-blok | 10 | 10 | 6 | 6 |
| **Totaal** | **32** | **32** | **32** | **32** |

## Algemene wijzigingen t.o.v. eerdere versies (samengevat voor Codex)

1. **PT5 vervalt** in alle vier versies en wordt vervangen door SR-items.
2. **PT3** vervalt in `lj1-vmbo` en `lj1-hv` als simulatie en wordt vervangen door 2 (VMBO) of 3 (HV) SR-items binnen het SR-blok. PT3 als simulatie blijft bestaan voor `lj3-vmbo` en `lj3-hv`.
3. **PT2** UI-aanpassingen: zie component `outlook_mail_simulation`.
4. **PT6** wordt screenshot-based: zie component `teams_share_simulation`.
5. **PT7** krijgt een eigen figuur (`Bizzy`), zichtbare canvas en afspeelknop; scoring zonder hard aantal-blokken-criterium; LJ3 krijgt nesting.
6. **PT8** krijgt verbeterde context, betere afleiders, en geen all-or-nothing op deelvragen.
7. **SR-blok** is uitgebreid met items voor onderbedeelde kerndoelen (KD21B, KD21D, KD22A, KD23C).

## Introscherm algemeen

Titel: **Nulmeting Digitale Geletterdheid**

Tekst:
> In deze meting krijg je korte opdrachten en vragen. Het resultaat geeft een beeld van hoe digitaal geletterd jij bent.
>
> Werk zelfstandig en beantwoord de vragen eerlijk. Als je iets niet weet, kun je dat als antwoord kiezen of de opdracht overslaan.
>
> De meting duurt ongeveer een half uur.

## Eindscherm leerling

Leerlingen kunnen een PDF-download van hun resultaten maken. CSV- en JSON-downloads zijn niet zichtbaar voor leerlingen. In de leerling-PDF wordt naast de totaalscore ook de discrepantie tussen zelfinschatting en feitelijke score getoond (Dunning-Kruger-feedback).

## Zelfinschatting — alle versies

- Item-id: `self-assessment`
- Itemtype: `self_assessment`
- Punten: 0
- Vraag: **Hoe digitaal geletterd schat je jezelf in?**
- Antwoordvorm: slider 0–100
- Labels: 0 = bijna niet, 50 = redelijk, 100 = heel goed
- Scoring: telt niet mee; log de waarde voor de Dunning-Kruger-feedback.

---

# Technische componenten

## `file_task_simulation` (PT1)
Ondersteunt: mappen maken, submappen maken, bestanden hernoemen, bestanden verplaatsen, eindtoestand controleren via exacte paden. De leerlingknop **Taak afronden** staat onder de opdrachtlijst met extra witruimte.

## `outlook_mail_simulation` (PT2) — gewijzigd

Outlook-achtige compose-interface. Belangrijke wijzigingen ten opzichte van eerdere implementaties:

- **Verwijder** de `CC`-knop uit de bovenste knoppenbalk.
- Het **CC-veld** is permanent zichtbaar onder het Aan-veld. Het BCC-veld is verborgen tot op `BCC tonen` wordt geklikt.
- Bovenste knoppenbalk: `Verzenden`, `BCC tonen`, `Bestand bijvoegen`, `Hyperlink invoegen`, `Prioriteit`, `Concept opslaan`, `Verwijderen`. Blauwe `Verzenden`-knop links vooraan; daarnaast dropdown-afleider `Verzending plannen`.
- **Bestand bijvoegen**: na het kiezen van een bestand verschijnt tussen het onderwerpveld en het berichtveld een blok met de bijlagenaam en een ×-knop om te verwijderen.
- **Hyperlink invoegen**: dialoog vraagt om URL en linktekst; bij bevestigen verschijnt de hyperlink op de cursorpositie in het berichtveld als blauwe onderstreepte tekst.
- **Prioriteit**: bij klikken verschijnt aan de rechterkant van het onderwerpveld een rood uitroepteken (`!`). Tweede klik schakelt het uit.
- Onderwerp en Bericht zijn velden, geen knoppen.
- De eindtoestand wordt na verzenden gescoord.

## `account_security_simulation` (PT3, alleen LJ3)
Ondersteunt: verdachte updateprompts, verdachte loginmeldingen, macro-waarschuwingen, officiële updateplek, accountbeveiliging. Skip-knop: niet beschikbaar (eindstate is signaal).

## `excel_download_task` (PT4)
Genereert echte `.xlsx`-bestanden. Leerling voert sorteer- en filterhandelingen uit in Excel en vult korte codes in op de website. Antwoordnormalisatie: trim spaties, hoofdletterongevoelig, verwijder eindpunt. Toon een waarschuwing als Excel niet beschikbaar is op het apparaat (`Open dit bestand in Microsoft Excel of Excel Online`).

## `teams_share_simulation` (PT6) — gewijzigd

Vervang de eigen Teams-look door een statische **screenshot** van Microsoft Teams in vergaderingsmodus, met **klikbare hotspots** op de echte knoppen (DigiCheck-stijl).

- Hotspots in deelflow:
  1. Knop `Delen` (rechts in actiebalk).
  2. Na openen: scherm-/vensterkeuze met opties `Hele scherm`, `Vensterweergave`.
  3. Bij `Vensterweergave`: lijst met vensterminiaturen (afhankelijk van versie/scenario).
  4. Toggle `Met computergeluid`.
- `Sla over`-knop beschikbaar.
- Eindstate-scoring blijft.

## `block_programming_task` (PT7) — gewijzigd

- **Figuur**: vervang `Hulkbuster` door **`Bizzy`** — een vriendelijke robot. Bizzy wordt zichtbaar gerenderd in een canvas naast/boven het werkvlak.
- **Canvas**: toont Bizzy in startpositie. Bij klikken op de **afspeelknop** ▶ worden de geplaatste blokken in volgorde uitgevoerd; Bizzy beweegt, draait en spreekt zoals geprogrammeerd. Tekstballonnetjes verdwijnen na 2 seconden.
- **Resetknop** ↺ zet de canvas terug naar startpositie.
- **Blokkenbak**: meer blokken dan nodig (categorie + kleur zoals onder).
- **Werkvlak**: drag/drop of klik-om-toe-te-voegen.
- **Voor LJ3 (VMBO en HV)**: nesting toevoegen. Blokken zoals `als …`, `als … dan … anders`, `herhaal X keer`, `herhaal altijd` hebben een visuele 'mond' (C-vorm) waar andere blokken in passen. Eindstate-scoring herkent geneste structuur.

Basiskleuren:
- gebeurtenissen: `#ffb22e`
- uiterlijk: `#8f5acb`
- beweging: `#55a9dc`
- besturing: `#f47b32`
- variabelen: `#f2a23a`
- waarnemen: `#2eb8a6`
- geluid: `#cf63c7`
- data: `#3f8edb`

Scoring algemeen voor PT7: het 4e punt is `eindgedrag van Bizzy klopt met de opdracht` — geen hard aantal-blokken-criterium. Gebruik van expliciet als kritiek gemarkeerde afleider-blokken trekt af.

## `social_action_simulation` (PT8) — gewijzigd

Socialmedia-/chat-/appinterface met hotspots en actieknoppen. Wijzigingen:

- **Context expliciet** maken in elk scenario (welke groepschat, hoeveel deelnemers, welk platform).
- **`Rapporteren`** wordt in elk scenario kort uitgelegd: *"Een melding doen via de meld-knop in de app aan de beheerder/het platform."*
- **Afleiders verfijnd**: te zwakke afleiders ('gemene reactie plaatsen') zijn vervangen door subtielere die op het eerste gezicht plausibel ogen ('reactie plaatsen om de sfeer luchtig te houden').
- **Geen all-or-nothing scoring**: deelvragen scoren 0/1/2 waar dat mogelijk is.
- `Sla over`-knop beschikbaar per deelvraag.

---

# LEERJAAR 1 VMBO — `lj1-vmbo`

## PT1 — Bestanden en mappen

- Item-id: `lj1v-pt1-files`
- Itemtype: `file_task_simulation`
- Kerndoel: 21A
- Punten: 4

Startstate:
- Mappen: `Thuis/OneDrive`, `Thuis/Downloads`, `Thuis/Documenten`, `Thuis/Afbeeldingen`
- Bestanden:
  - `Thuis/OneDrive/Verslag_Nederlands.docx`
  - `Thuis/OneDrive/Presentatie_v1.pptx`
  - `Thuis/OneDrive/Foto_project.jpg`
  - `Thuis/Downloads/Installatiebestand.exe`
  - `Thuis/Documenten/Aantekeningen.docx`

Leerlingtekst:
> Kun jij je bestanden netjes beheren?
>
> Maak de opdrachten. Klik daarna op **Taak afronden**.

Opdrachten:
1. Maak in OneDrive een map `Schoolwerk`.
2. Hernoem `Presentatie_v1.pptx` naar `Presentatie_OUD.pptx`.
3. Verplaats `Verslag_Nederlands.docx` naar `Schoolwerk`.
4. Maak in `Schoolwerk` een map `Fotos` en verplaats `Foto_project.jpg` daarnaartoe.

Scoring:
- 1 punt: `Thuis/OneDrive/Schoolwerk` bestaat.
- 1 punt: `Thuis/OneDrive/Presentatie_OUD.pptx` bestaat.
- 1 punt: `Thuis/OneDrive/Schoolwerk/Verslag_Nederlands.docx` bestaat.
- 1 punt: `Thuis/OneDrive/Schoolwerk/Fotos/Foto_project.jpg` bestaat.

## PT2 — Mail opstellen

- Item-id: `lj1v-pt2-mail`
- Itemtype: `outlook_mail_simulation`
- Kerndoel: 21A, 23B
- Punten: 4

Zichtbare knoppen: `Verzenden`, `BCC tonen`, `Bestand bijvoegen`, `Hyperlink invoegen`, `Prioriteit`, `Concept opslaan`, `Verwijderen`. Het CC-veld is permanent zichtbaar onder Aan. Verzendknop blauw, links vooraan; ernaast dropdown-afleider `Verzending plannen`.

Contacten:
- `mentor@school.nl`
- `vriend@school.nl`
- `klasgroep@school.nl`
- `administratie@school.nl`

Bestanden:
- `Verslag_Nederlands.docx`
- `Foto_vakantie.jpg`
- `Rooster.pdf`
- `Muziek.mp3`

Leerlingtekst:
Titel: **Mail opstellen**

> Je moet een verslag voor Nederlands inleveren bij je mentor via e-mail. Stel hieronder een e-mail op.

Opdrachten:
1. Zet `mentor@school.nl` bij **Aan**.
2. Zet onderwerp op `Verslag Nederlands`.
3. Voeg `Verslag_Nederlands.docx` toe (bijlage moet zichtbaar zijn tussen onderwerp en bericht).
4. Verstuur de mail.

Scoring:
- 1 punt: mentor staat in Aan.
- 1 punt: onderwerp is exact `Verslag Nederlands`.
- 1 punt: bijlage `Verslag_Nederlands.docx` is toegevoegd en zichtbaar.
- 1 punt: mail is verzonden.

## PT4 — Excel/data sorteren en filteren

- Item-id: `lj1v-pt4-excel`
- Itemtype: `excel_download_task`
- Kerndoel: 21C, 21A
- Punten: 4

Downloadbestand: `LJ1_VMBO_Liedjes.xlsx`
Sheet: `Liedjes`

Dataset: echte `.xlsx` met 60 dataregels. Het downloadbestand in `public/downloads/LJ1_VMBO_Liedjes.xlsx` is leidend.

Leerlingtekst:
> Download `LJ1_VMBO_Liedjes.xlsx`. Open het in Excel.

Vraag A:
> Sorteer op `Jaar`, van nieuw naar oud. Welke code staat bovenaan?

Antwoord A: `L09`

Vraag B:
> Filter op `Genre = pop`. Sorteer daarna op `Jaar`, van oud naar nieuw. Welke code staat bovenaan?

Antwoord B: `L12`

Scoring:
- 2 punten: antwoord A exact `L09`.
- 2 punten: antwoord B exact `L12`.

## PT6 — Videovergadering en schermdelen

- Item-id: `lj1v-pt6-meeting`
- Itemtype: `teams_share_simulation`
- Kerndoel: 21A, 23B
- Punten: 3

Scenario:
> Sanne wil een muziekvideo laten zien én laten horen. Ze wil alleen de video delen, niet haar hele scherm.

Implementatie: statische screenshot van Teams-vergadering met klikbare hotspots op `Delen`, daarna `Vensterweergave`, daarna keuze tussen `Mediaspeler`, `Word document`, `Excel bestand`, `Browser`. Toggle `Met computergeluid`.

Scoring:
- 1 punt: `Delen` geopend.
- 1 punt: `Met computergeluid` aan.
- 1 punt: venster `Mediaspeler` gekozen.

## PT7 — Blokprogrammeren

- Item-id: `lj1v-pt7-programming`
- Itemtype: `block_programming_task`
- Kerndoel: 22B
- Punten: 4

Inleidende tekst (boven de canvas):
> Dit is **Bizzy**, een robot die kan bewegen, draaien en praten. Programmeer Bizzy door blokken op het werkvlak te slepen. Klik op ▶ om je programma uit te voeren.

Leerlingtekst:
> Maak een programma. Als er op afspelen wordt geklikt, zegt Bizzy *Hoi!*, gaat 1 meter vooruit en draait naar 180 graden.

Beschikbare blokken:
- `Wanneer er geklikt wordt op afspelen` — gebeurtenissen, `#ffb22e`
- `wanneer er op Bizzy wordt geklikt` — gebeurtenissen, `#ffb22e`
- `verander animatie van Bizzy naar niet animeren` — uiterlijk, `#8f5acb`
- `Bizzy zegt "Hoi!"` — uiterlijk, `#8f5acb`
- `verplaats Bizzy 1 meter vooruit in 1 sec.` — beweging, `#55a9dc`
- `draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.` — beweging, `#55a9dc`
- `als 1 < 2` — besturing, `#f47b32` (kritieke afleider)
- `speel geluid applaus` — geluid, `#cf63c7`
- `wacht 1 seconde` — besturing, `#f47b32`
- `zet score op 0` — variabelen, `#f2a23a`
- `verplaats Bizzy 5 meters achteruit in 1 sec.` — beweging, `#55a9dc` (kritieke afleider)

Scoring:
- 1 punt: juiste startblok (`Wanneer er geklikt wordt op afspelen`).
- 1 punt: `Bizzy zegt "Hoi!"` gebruikt.
- 1 punt: `verplaats Bizzy 1 meter vooruit in 1 sec.` gebruikt.
- 1 punt: na klikken op ▶ vertoont Bizzy het juiste eindgedrag (zegt Hoi, beweegt vooruit, draait naar 180°) **én** geen kritieke afleider-blokken (`als 1 < 2`, `verplaats Bizzy 5 meters achteruit`) gebruikt.

## PT8 — Online gedrag: delen en pesten

- Item-id: `lj1v-pt8-online`
- Itemtype: `social_action_simulation`
- Kerndoel: 23A, 23B
- Punten: 3

### Scherm 1 — Deelinstellingen
Leerlingtekst:
> Kies wie dit mag zien.

Kaartjes:
1. `Wachtwoord voor Magister`
2. `Groepsplanning voor project`
3. `Poster voor open dag`

Keuzes per kaartje: `Niet delen`, `Alleen mentor`, `Alleen projectgroep`, `Hele klas`, `Openbaar`.

Correct:
1. Wachtwoord voor Magister → Niet delen
2. Groepsplanning voor project → Alleen projectgroep
3. Poster voor open dag → Openbaar

Scoring (niet all-or-nothing):
- 0 correct: 0 punten.
- 1 of 2 correct: 1 punt.
- 3 correct: 2 punten.
- (Schermtotaal: 0/1/2 — schaalt op naar PT8-totaal van 3 met scherm 2.)

### Scherm 2 — Klassenapp
Situatie:
> In de klassenapp van klas **1V2** (ongeveer 25 leerlingen, mentor leest mee) staat een bewerkte foto van Sam. Er staat: *"Stuur door 😂"*. Sam zegt: *"Stop, ik wil dit niet."*

Toelichting onder de vraag (altijd zichtbaar):
> **Rapporteren** = via de meld-knop in de app aan de beheerder of het platform melden.

Leerlingopdracht:
> Kies twee acties die jij zou doen.

Acties: `Doorsturen`, `Reactie plaatsen om de sfeer luchtig te houden`, `Rapporteren`, `Niet doorsturen`, `Aan mentor of vertrouwenspersoon melden`, `Een neutrale reactie plaatsen ('ik weet niet wat ik moet zeggen')`.

Correcte acties (twee of meer kiezen): `Niet doorsturen`, `Rapporteren`, `Aan mentor of vertrouwenspersoon melden`.
Schadelijke acties (geen kiezen): `Doorsturen`, `Reactie plaatsen om de sfeer luchtig te houden`.
Neutrale actie (mag, telt niet positief mee): `Een neutrale reactie plaatsen`.

Scoring:
- 1 punt: minstens twee correcte acties gekozen **en** geen schadelijke actie gekozen.

## SR-blok — `lj1-vmbo` (10 items, 10 punten)

### SR1 — Wachtwoord (uit oude PT3)
- Item-id: `lj1v-sr1-pw`
- Kerndoel: 23A
- Punten: 1

> Welk wachtwoord is het veiligst?

- `MijnGroeneFietsStaatNaastSchool`
- `Nora2026!`
- `fietsbel`
- `Qwerty!23`

Correct: `MijnGroeneFietsStaatNaastSchool`

### SR2 — Trage telefoon (uit oude PT3)
- Item-id: `lj1v-sr2-device`
- Kerndoel: 21A
- Punten: 1

> De telefoon van Youssef is traag. Hoe kan Youssef de prestaties van zijn telefoon verbeteren zonder persoonlijke gegevens te wissen?

- `Oude downloads verwijderen en updates installeren.`
- `De helderheid van het scherm verlagen.`
- `Het toetsenbordgeluid uitzetten.`
- `Alle apps tegelijk geforceerd sluiten.`

Correct: `Oude downloads verwijderen en updates installeren.`

### SR3 — AI-output controleren
- Item-id: `lj1v-sr3-ai-check`
- Kerndoel: 21D
- Punten: 1

> Een chatbot geeft een antwoord voor je werkstuk. Je weet niet of het klopt. Wat kun je het best doen?

- `Ik controleer het in een andere bron.`
- `Ik gebruik het meteen, want het klinkt netjes.`
- `Ik vraag dezelfde chatbot om het nog eens te zeggen.`
- `Ik deel het met mijn vrienden.`

Correct: `Ik controleer het in een andere bron.`

### SR4 — Platformafhankelijkheid
- Item-id: `lj1v-sr4-platform`
- Kerndoel: 23C
- Punten: 1

> Veel scholen gebruiken dezelfde grote app voor school en contact. Wat is een risico?

- `Als de app stopt of verandert, hebben veel mensen tegelijk last.`
- `Het schoolnetwerk wordt overbelast.`
- `Iedereen moet hetzelfde wachtwoord gebruiken.`
- `Berichten kunnen niet meer gelezen worden zonder internet.`

Correct: `Als de app stopt of verandert, hebben veel mensen tegelijk last.`

### SR5 — Bron herkennen
- Item-id: `lj1v-sr5-source`
- Kerndoel: 21B
- Punten: 1

> Je leest twee koppen op internet over hetzelfde nieuws. Welke kop hoort het meest waarschijnlijk bij een betrouwbare nieuwsbron?

- `Stadhuis Nijmegen schenkt 50.000 euro aan jeugdsportclubs`
- `ONGELOOFLIJK!! Stadhuis Nijmegen schenkt geld weg!!!`
- `Mijn mening over de gemeente`
- `Jongeren zeggen op TikTok dat...`

Correct: `Stadhuis Nijmegen schenkt 50.000 euro aan jeugdsportclubs`

### SR6 — Algoritmische selectie
- Item-id: `lj1v-sr6-algorithm`
- Kerndoel: 21B
- Punten: 1

> Twee leerlingen kijken op TikTok en zien helemaal andere video's. Wat is de belangrijkste reden?

- `TikTok kiest video's op basis van wat zij eerder hebben bekeken.`
- `TikTok werkt niet altijd goed op elk apparaat.`
- `Twee leerlingen zien altijd dezelfde video's.`
- `TikTok laat aan iedereen andere video's zien om verkoop te stimuleren.`

Correct: `TikTok kiest video's op basis van wat zij eerder hebben bekeken.`

### SR7 — AI-hallucinatie
- Item-id: `lj1v-sr7-hallucination`
- Kerndoel: 21D
- Punten: 1

> Een AI-tool noemt een naam van een persoon. Je kunt die persoon nergens anders vinden. Wat is het meest waarschijnlijk?

- `De AI heeft de naam verzonnen.`
- `Die persoon bestaat zeker, maar is niet beroemd.`
- `De AI zegt altijd alleen kloppende dingen.`
- `Het is een geheime persoon.`

Correct: `De AI heeft de naam verzonnen.`

### SR8 — Auteursrecht en bronvermelding
- Item-id: `lj1v-sr8-copyright`
- Kerndoel: 22A
- Punten: 1

> Je vindt een mooie foto op internet voor je werkstuk. Wat is de juiste manier om die te gebruiken?

- `Eerst kijken of de foto vrij gebruikt mag worden en de bron erbij zetten.`
- `Foto kopiëren en gebruiken; op internet is alles vrij.`
- `Foto verkleinen, dan is hij van jou.`
- `Foto bewerken in een app, dan mag het.`

Correct: `Eerst kijken of de foto vrij gebruikt mag worden en de bron erbij zetten.`

### SR9 — Digitale kloof
- Item-id: `lj1v-sr9-divide`
- Kerndoel: 23C
- Punten: 1

> Niet alle leerlingen hebben thuis een goede laptop of snel internet. Waarom is dat een probleem?

- `Sommige leerlingen kunnen schoolwerk thuis moeilijker maken.`
- `Hun laptop wordt sneller stuk.`
- `Ze worden minder slim.`
- `Ze mogen geen huiswerk meer maken.`

Correct: `Sommige leerlingen kunnen schoolwerk thuis moeilijker maken.`

### SR10 — Energie en duurzaamheid
- Item-id: `lj1v-sr10-energy`
- Kerndoel: 23C
- Punten: 1

> Wat verbruikt de meeste energie?

- `Een uur video streamen.`
- `Een tekstbericht versturen.`
- `Een foto in WhatsApp delen.`
- `Een wekkergeluid laten klinken.`

Correct: `Een uur video streamen.`

---

# LEERJAAR 1 HAVO/VWO — `lj1-hv`

## PT1 — Bestanden en mappen

- Item-id: `lj1h-pt1-files`
- Itemtype: `file_task_simulation`
- Kerndoel: 21A
- Punten: 4

Startstate:
- Mappen: `Thuis/OneDrive`, `Thuis/Downloads`, `Thuis/Documenten`, `Thuis/Afbeeldingen`
- Bestanden:
  - `Thuis/OneDrive/Boekverslag_Nederlands.docx`
  - `Thuis/OneDrive/Presentatie_Biologie_v1.pptx`
  - `Thuis/OneDrive/Diagram_Biologie.png`
  - `Thuis/OneDrive/Rooster.pdf`
  - `Thuis/Documenten/Aantekeningen.docx`

Leerlingtekst:
> Kun jij je bestanden netjes beheren?
>
> Maak de opdrachten. Klik daarna op **Taak afronden**.

Opdrachten:
1. Maak map `Schoolwerk`.
2. Maak in `Schoolwerk` de mappen `Nederlands` en `Biologie`.
3. Verplaats `Boekverslag_Nederlands.docx` naar `Schoolwerk/Nederlands`.
4. Verplaats `Diagram_Biologie.png` naar `Schoolwerk/Biologie`.

Scoring:
- 1 punt: map `Schoolwerk` bestaat.
- 1 punt: submappen `Nederlands` en `Biologie` bestaan.
- 1 punt: boekverslag staat in `Schoolwerk/Nederlands`.
- 1 punt: diagram staat in `Schoolwerk/Biologie`.

## PT2 — Mail opstellen

- Item-id: `lj1h-pt2-mail`
- Itemtype: `outlook_mail_simulation`
- Kerndoel: 21A, 23B
- Punten: 4

Zichtbare knoppen: `Verzenden`, `BCC tonen`, `Bestand bijvoegen`, `Hyperlink invoegen`, `Prioriteit`, `Concept opslaan`, `Verwijderen`. Het CC-veld is permanent zichtbaar onder Aan.

Contacten: `mentor@school.nl`, `noor@school.nl`, `klasgroep@school.nl`, `administratie@school.nl`.

Bestanden: `Presentatie_Biologie.pptx`, `Foto_museum.jpg`, `Planning.xlsx`, `Muziek.mp3`.

Leerlingtekst:
> Je werkt met Noor aan een presentatie. Je mentor moet de presentatie krijgen. Noor moet kunnen meekijken in de mail.

Opdrachten:
1. Zet `mentor@school.nl` bij **Aan**.
2. Zet `noor@school.nl` bij **Cc**.
3. Zet onderwerp op `Presentatie klaar`.
4. Voeg `Presentatie_Biologie.pptx` toe en verzend.

Scoring:
- 1 punt: mentor in Aan.
- 1 punt: Noor in Cc.
- 1 punt: onderwerp exact `Presentatie klaar`.
- 1 punt: juiste bijlage toegevoegd, zichtbaar tussen onderwerp en bericht, en mail verzonden.

## PT4 — Excel/data sorteren en filteren

- Item-id: `lj1h-pt4-excel`
- Itemtype: `excel_download_task`
- Kerndoel: 21C, 21A
- Punten: 4

Downloadbestand: `LJ1_HV_Bibliotheek.xlsx`
Sheet: `Boeken`

Dataset: 60 dataregels in `public/downloads/LJ1_HV_Bibliotheek.xlsx`.

Vraag A:
> Sorteer op `Jaar`, van nieuw naar oud. Welke code staat bovenaan?

Antwoord A: `B07`

Vraag B:
> Filter op `Vak = biologie`. Sorteer daarna op `Jaar`, van oud naar nieuw. Welke code staat bovenaan?

Antwoord B: `B06`

Scoring:
- 2 punten: antwoord A exact `B07`.
- 2 punten: antwoord B exact `B06`.

## PT6 — Videovergadering en schermdelen

- Item-id: `lj1h-pt6-meeting`
- Itemtype: `teams_share_simulation`
- Kerndoel: 21A, 23B
- Punten: 3

Scenario:
> Sanne wil een muziekvideo tonen en laten horen. Ze wil niet haar hele scherm delen.

Vensters: `Mediaspeler`, `Word document`, `Excel bestand`, `Browser`, `Chatvenster`.

Scoring:
- 1 punt: Delen geopend.
- 1 punt: computergeluid aan.
- 1 punt: Mediaspeler gekozen.

## PT7 — Blokprogrammeren

- Item-id: `lj1h-pt7-programming`
- Itemtype: `block_programming_task`
- Kerndoel: 22B
- Punten: 4

Inleidende tekst:
> Dit is **Bizzy**, een robot die kan bewegen, draaien en praten. Programmeer Bizzy door blokken op het werkvlak te slepen. Klik op ▶ om je programma uit te voeren.

Leerlingtekst:
> Maak een programma. Als er op afspelen wordt geklikt, begroet Bizzy de kijker en beweegt drie keer vooruit.

Blokken:
- `Wanneer er geklikt wordt op afspelen` — gebeurtenissen, `#ffb22e`
- `wanneer er op Bizzy wordt geklikt` — gebeurtenissen, `#ffb22e`
- `verander animatie van Bizzy naar niet animeren` — uiterlijk, `#8f5acb`
- `Bizzy zegt "Hoi!"` — uiterlijk, `#8f5acb`
- `verplaats Bizzy 1 meter vooruit in 1 sec.` — beweging, `#55a9dc`
- `draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.` — beweging, `#55a9dc`
- `als 1 < 2` — besturing, `#f47b32` (kritieke afleider)
- `herhaal 3 keer` — besturing, `#f47b32` (nesting-blok)
- `herhaal 10 keer` — besturing, `#f47b32` (nesting-blok)
- `speel geluid start` — geluid, `#cf63c7`
- `zet snelheid op 2` — variabelen, `#f2a23a`
- `als Bizzy rand raakt` — waarnemen, `#2eb8a6`
- `stop alles` — besturing, `#f47b32`

Scoring:
- 1 punt: juiste startblok (`Wanneer er geklikt wordt op afspelen`).
- 1 punt: `Bizzy zegt "Hoi!"` gebruikt.
- 1 punt: `herhaal 3 keer` met `verplaats Bizzy 1 meter vooruit in 1 sec.` als geneste body.
- 1 punt: na ▶ klopt eindgedrag (Bizzy zegt Hoi en beweegt drie keer vooruit) en geen kritieke afleider gebruikt.

## PT8 — Online gedrag: dark pattern

- Item-id: `lj1h-pt8-online`
- Itemtype: `social_action_simulation`
- Kerndoel: 23B, 21B, 23A
- Punten: 3

Situatie:
> Op je telefoon vraagt de app **Feeblemind** steeds opnieuw: *"Zet notificaties aan"*. Silke heeft al drie keer op *"Nu niet"* geklikt, maar de melding blijft terugkeren.

Toelichting onder de vraag:
> **Notificatie-instellingen** kun je vinden in de app-instellingen of in het meldingsbeheer van de telefoon.

Interface: knoppen `Nu niet`, `Oké`, `Instellingen`. Bij Instellingen: keuzes `Meldingen aan`, `Meldingen uit`, `Meldingen beperkt`, `Account verwijderen`.

Leerlingopdracht:
> Zorg dat Silke minder wordt gestoord door deze app, zonder haar account te verliezen.

Scoring:
- 1 punt: instellingen geopend.
- 1 punt: meldingen uit of beperkt.
- 1 punt: niet akkoord gegaan met volledige notificaties (`Oké`) en account niet verwijderd.

## SR-blok — `lj1-hv` (10 items, 10 punten)

### SR1 — Wachtwoord (uit oude PT3)
- Item-id: `lj1h-sr1-pw`
- Kerndoel: 23A
- Punten: 1

> Welk wachtwoord is het veiligst?

- `BlauweTreinLampSchoolTas`
- `Herfst2026`
- `Welkom123!`
- `11112222`

Correct: `BlauweTreinLampSchoolTas`

### SR2 — Versleutelde verbinding (uit oude PT3)
- Item-id: `lj1h-sr2-https`
- Kerndoel: 23A
- Punten: 1

> Aan welk teken zie je dat een verbinding versleuteld is?

- `Het slotje in de adresbalk en de prefix https://.`
- `De website laadt sneller.`
- `De website heeft .nl in de naam.`
- `De website heeft kleurrijke afbeeldingen.`

Correct: `Het slotje in de adresbalk en de prefix https://.`

### SR3 — Toegang weigeren (uit oude PT3)
- Item-id: `lj1h-sr3-access`
- Kerndoel: 23A
- Punten: 1

> Je krijgt op je leeromgeving de melding *"Je hebt geen toegang tot Werkstuk.docx"*. Wat kun je het best doen?

- `Toegang aanvragen bij de eigenaar.`
- `Het wachtwoord van een klasgenoot lenen.`
- `Het bestand openbaar laten maken.`
- `Via een onbekende link downloaden.`

Correct: `Toegang aanvragen bij de eigenaar.`

### SR4 — AI verifiëren
- Item-id: `lj1h-sr4-ai-verify`
- Kerndoel: 21D
- Punten: 1

> Een AI-tool noemt een jaartal zonder bron. Welke controle is het sterkst?

- `Controleren in een onafhankelijke betrouwbare bron.`
- `De vraag opnieuw stellen aan dezelfde AI.`
- `Kijken of de tekst zeker klinkt.`
- `Het antwoord gebruiken als het lang genoeg is.`

Correct: `Controleren in een onafhankelijke betrouwbare bron.`

### SR5 — Steekproef en generaliseerbaarheid
- Item-id: `lj1h-sr5-sample`
- Kerndoel: 21C, 23C
- Punten: 1

> Een dataset bevat alleen antwoorden van leerlingen uit één klas. Wat is een goede waarschuwing bij die data?

- `Je kunt niet zomaar zeggen dat dit voor alle leerlingen geldt.`
- `Eén klas is altijd genoeg om iets over heel Nederland te zeggen.`
- `De dataset is automatisch fout.`
- `Meer data maakt nooit verschil.`

Correct: `Je kunt niet zomaar zeggen dat dit voor alle leerlingen geldt.`

### SR6 — Bron en autoriteit
- Item-id: `lj1h-sr6-source`
- Kerndoel: 21B
- Punten: 1

> Welke bron is naar verwachting het betrouwbaarst voor een werkstuk over klimaat?

- `Een artikel van het KNMI met datum en auteur.`
- `Een viral TikTok van een influencer met veel volgers.`
- `Een blog zonder auteursnaam met sterke meningen.`
- `Een meme met cijfers.`

Correct: `Een artikel van het KNMI met datum en auteur.`

### SR7 — Algoritme en feed
- Item-id: `lj1h-sr7-algorithm`
- Kerndoel: 21B
- Punten: 1

> Twee leerlingen krijgen op Instagram totaal andere posts te zien. Wat is de belangrijkste oorzaak?

- `Het algoritme selecteert posts op basis van eerder gedrag van de gebruiker.`
- `Instagram laadt andere posts bij verschillend internet.`
- `Iedereen ziet eigenlijk dezelfde posts.`
- `Posts worden willekeurig getoond.`

Correct: `Het algoritme selecteert posts op basis van eerder gedrag van de gebruiker.`

### SR8 — AI-hallucinatie
- Item-id: `lj1h-sr8-hallucination`
- Kerndoel: 21D
- Punten: 1

> Een AI-chatbot noemt een wetenschappelijk artikel dat je nergens kunt vinden. Wat is het meest waarschijnlijk?

- `De AI heeft het artikel verzonnen (hallucinatie).`
- `Het artikel is geheim.`
- `Het artikel staat alleen op papier.`
- `Je hebt verkeerd gezocht.`

Correct: `De AI heeft het artikel verzonnen (hallucinatie).`

### SR9 — Creative Commons
- Item-id: `lj1h-sr9-cc`
- Kerndoel: 22A
- Punten: 1

> Je gebruikt een afbeelding met een Creative Commons BY-licentie in je presentatie. Wat moet je dan doen?

- `De maker noemen (naamsvermelding).`
- `Niets, CC-BY betekent dat alles vrij is.`
- `Toestemming vragen via e-mail.`
- `De afbeelding alleen voor commercieel gebruik gebruiken.`

Correct: `De maker noemen (naamsvermelding).`

### SR10 — Digitale ongelijkheid
- Item-id: `lj1h-sr10-divide`
- Kerndoel: 23C
- Punten: 1

> Wat is een gevolg van het feit dat niet alle leerlingen thuis een goede laptop en snel internet hebben?

- `Schoolwerk en kansen worden ongelijk verdeeld tussen leerlingen.`
- `Leerlingen zonder laptop worden minder slim.`
- `Internet wordt voor iedereen langzamer.`
- `De school moet voor iedereen betalen.`

Correct: `Schoolwerk en kansen worden ongelijk verdeeld tussen leerlingen.`

---

# LEERJAAR 3 VMBO — `lj3-vmbo`

## PT1 — Bestanden en mappen

- Item-id: `lj3v-pt1-files`
- Itemtype: `file_task_simulation`
- Kerndoel: 21A
- Punten: 4

Startbestanden:
- `Thuis/OneDrive/Project_stage/Plan_stage_v1.docx`
- `Thuis/OneDrive/Project_stage/Plan_stage_DEF.docx`
- `Thuis/OneDrive/Project_stage/Foto_stage.jpg`
- `Thuis/OneDrive/Project_stage/Notities.txt`

Leerlingtekst:
> Kun jij je bestanden netjes beheren?
>
> Maak de opdrachten. Klik daarna op **Taak afronden**.

Opdrachten:
1. Maak in `Project_stage` de map `Archief`.
2. Verplaats `Plan_stage_v1.docx` naar `Archief`.
3. Hernoem `Plan_stage_DEF.docx` naar `Plan_stage_eindversie.docx`.
4. Verplaats `Foto_stage.jpg` naar een nieuwe map `Beelden`.

Scoring:
- 1 punt: `Archief` bestaat.
- 1 punt: oude versie staat in `Archief`.
- 1 punt: eindversie correct hernoemd.
- 1 punt: `Foto_stage.jpg` staat in `Beelden`.

## PT2 — Mail opstellen

- Item-id: `lj3v-pt2-mail`
- Itemtype: `outlook_mail_simulation`
- Kerndoel: 21A, 23B
- Punten: 4

Zichtbare knoppen: `Verzenden`, `BCC tonen`, `Bestand bijvoegen`, `Hyperlink invoegen`, `Prioriteit`, `Concept opslaan`, `Verwijderen`. CC-veld permanent zichtbaar.

Contacten: `mentor@school.nl`, `teamleider@school.nl`, `klasgroep@school.nl`, `stagebedrijf@mail.nl`.

Bestanden: `Flyer_activiteit.pdf`, `Planning_stage.xlsx`, `Foto_stage.jpg`, `Concept_tekst.docx`.

Leerlingtekst:
> Je organiseert een activiteit. De mentor moet reageren. De teamleider hoeft alleen mee te kijken. De flyer moet mee. De mail is niet dringend (laat prioriteit op normaal).

Opdrachten:
1. Mentor bij Aan.
2. Teamleider bij Cc.
3. Voeg `Flyer_activiteit.pdf` toe.
4. Laat prioriteit op Normaal en verzend.

Scoring:
- 1 punt: mentor in Aan.
- 1 punt: teamleider in Cc.
- 1 punt: juiste bijlage zichtbaar.
- 1 punt: prioriteit niet aangezet (geen rood `!`) en mail verzonden.

## PT3 — Account, apparaat en verbinding beveiligen

- Item-id: `lj3v-pt3-security`
- Itemtype: `account_security_simulation`
- Kerndoel: 23A, 21A
- Punten: 4

### Scherm 1 — Verdachte update
Melding:
> Je videospeler is verouderd. Klik hier om `update.exe` te downloaden.

Acties: `Download update.exe`, `Sluit melding`, `Open officiële app/instellingen voor updates`, `Sta meldingen altijd toe`.

Scoring:
- 1 punt: download niet gestart.
- 1 punt: officiële updateplek gekozen.

### Scherm 2 — Verdachte login
Melding:
> Nieuwe login op je schoolaccount vanaf onbekend apparaat.

Acties: `Officiële accountbeveiliging openen`, `Wachtwoord wijzigen`, `Sessie/apparaat controleren`, `Bericht negeren`, `Wachtwoord naar vriend sturen`.

Scoring:
- 1 punt: officiële accountbeveiliging geopend.
- 1 punt: sessie/apparaat gecontroleerd of wachtwoord gewijzigd.

## PT4 — Excel/data sorteren en filteren

- Item-id: `lj3v-pt4-excel`
- Itemtype: `excel_download_task`
- Kerndoel: 21C, 21A
- Punten: 4

Downloadbestand: `LJ3_VMBO_Bestellingen.xlsx`
Sheet: `Bestellingen`

Dataset: 70 dataregels in `public/downloads/LJ3_VMBO_Bestellingen.xlsx`.

Vraag A:
> Filter op `Categorie = elektronica`. Sorteer daarna op `Jaar`, van nieuw naar oud. Welke code staat bovenaan?

Antwoord A: `W02`

Vraag B:
> Filter op `Bedrag > 60`. Sorteer daarna op `Bedrag`, van hoog naar laag. Welke code staat bovenaan?

Antwoord B: `W06`

Scoring:
- 2 punten: antwoord A exact `W02`.
- 2 punten: antwoord B exact `W06`.

## PT6 — Videovergadering en schermdelen

- Item-id: `lj3v-pt6-meeting`
- Itemtype: `teams_share_simulation`
- Kerndoel: 21A, 23B, 23A
- Punten: 3

Scenario:
> Sanne wil een video laten zien en horen. Op haar scherm staat ook een privéchat open. Zij wil niet dat anderen die chat zien.

Vensters: `Hele scherm`, `Mediaspeler`, `Excel: Data_werkstuk`, `Word: Document1`, `Privéchat`.

Scoring:
- 1 punt: Delen geopend.
- 1 punt: computergeluid aan.
- 1 punt: Mediaspeler gekozen en niet hele scherm.

## PT7 — Blokprogrammeren

- Item-id: `lj3v-pt7-programming`
- Itemtype: `block_programming_task`
- Kerndoel: 22B
- Punten: 4

Inleidende tekst:
> Dit is een micro:bit-achtig apparaat met een klein scherm en twee knoppen (A en B). Programmeer een teller die op het scherm verschijnt. Klik op ▶ om je programma uit te voeren; klik daarna op A of B om de knoppen te testen.

Leerlingtekst:
> Maak een programma. De teller begint op 0. Elke keer dat knop A wordt ingedrukt, gaat de teller 1 omhoog. Bij 5 of meer toont het scherm `vol`.

Blokken (mét nesting waar aangegeven):
- `bij start` — gebeurtenissen, `#ffb22e`
- `zet teller op 0` — variabelen, `#f2a23a`
- `als knop A wordt ingedrukt` — gebeurtenissen, `#ffb22e` (nesting)
- `als knop B wordt ingedrukt` — gebeurtenissen, `#ffb22e` (nesting)
- `verander teller met 1` — variabelen, `#f2a23a`
- `verander teller met -1` — variabelen, `#f2a23a`
- `als teller >= 5 dan` — besturing, `#f47b32` (nesting)
- `als teller < 5 dan` — besturing, `#f47b32` (nesting, kritieke afleider)
- `toon "vol"` — uiterlijk, `#8f5acb`
- `toon "leeg"` — uiterlijk, `#8f5acb`
- `wacht 10 seconden` — besturing, `#f47b32`
- `speel geluid klaar` — geluid, `#cf63c7`

Scoring:
- 1 punt: teller initialiseert op 0 binnen `bij start`.
- 1 punt: `als knop A wordt ingedrukt` met geneste `verander teller met 1`.
- 1 punt: `als teller >= 5 dan` met geneste `toon "vol"`.
- 1 punt: na ▶ klopt eindgedrag bij testen van A (5 keer drukken → `vol`) en geen kritieke afleider gebruikt.

## PT8 — Online gedrag: deepfake/pesten

- Item-id: `lj3v-pt8-online`
- Itemtype: `social_action_simulation`
- Kerndoel: 21D, 23A, 23B
- Punten: 3

Situatie:
> In de klassenapp van klas **3V2** (24 leerlingen) verschijnt een AI-gemaakte afbeelding van een leerling in een beschamende situatie. Iemand schrijft: *"Dit is echt, stuur door."* Je ziet dat de handen vreemd zijn en dat de leerling reageert: *"Dit ben ik niet."*

Toelichting onder de vraag:
> **Rapporteren** = via de meld-knop in de app aan de beheerder of het platform melden.
> **Bewijs bewaren** = de afbeelding/het bericht opslaan voor je het bericht verlaat, zodat het later getoond kan worden.

Opdracht:
1. Beoordeel de afbeelding: `echt`, `twijfelachtig`, `waarschijnlijk nep of AI`.
2. Klik twee signalen aan.
3. Kies twee acties.

Correct:
- oordeel: `waarschijnlijk nep of AI`.
- signalen: `vreemde handen`, `leerling ontkent`, `schadelijke context`.
- acties: `niet doorsturen`, `rapporteren`, `bewijs bewaren`, `melden bij mentor/vertrouwde volwassene`.

Scoring:
- 1 punt: juist oordeel.
- 1 punt: minstens twee juiste signalen.
- 1 punt: minstens twee juiste acties **én** geen schadelijke actie.

## SR-blok — `lj3-vmbo` (6 items, 6 punten)

### SR1 — AI controleren
- Item-id: `lj3v-sr1-ai-check`
- Kerndoel: 21D
- Punten: 1

> Een AI-chatbot geeft een zelfverzekerd antwoord zonder bron. Wat is de beste eerste controle?

- `De informatie controleren in een onafhankelijke bron.`
- `De tekst gebruiken omdat hij zelfverzekerd klinkt.`
- `Dezelfde vraag opnieuw stellen aan dezelfde chatbot.`
- `Alleen controleren of er moeilijke woorden in staan.`

Correct: `De informatie controleren in een onafhankelijke bron.`

### SR2 — Platformafhankelijkheid
- Item-id: `lj3v-sr2-platform`
- Kerndoel: 23C
- Punten: 1

> Waarom kan het riskant zijn als scholen en bedrijven sterk afhankelijk zijn van een paar grote techbedrijven?

- `Storingen of regelwijzigingen kunnen veel mensen tegelijk raken.`
- `Eén bedrijf heeft minder werknemers nodig.`
- `Internet wordt sneller bij minder providers.`
- `Wachtwoorden zijn dan niet meer nodig.`

Correct: `Storingen of regelwijzigingen kunnen veel mensen tegelijk raken.`

### SR3 — Bronkwaliteit
- Item-id: `lj3v-sr3-source`
- Kerndoel: 21B
- Punten: 1

> Welke bron geeft naar verwachting de meest betrouwbare informatie over een gezondheidsvraag?

- `Een artikel op Thuisarts.nl van een arts.`
- `Een YouTuber die zijn ervaring deelt.`
- `Een advertentie voor pillen.`
- `Een groepsapp met klasgenoten.`

Correct: `Een artikel op Thuisarts.nl van een arts.`

### SR4 — AI bias en trainingsdata
- Item-id: `lj3v-sr4-bias`
- Kerndoel: 21D
- Punten: 1

> Een AI laat alleen mannen zien als je vraagt om een afbeelding van *"een directeur"*. Wat is de meest waarschijnlijke oorzaak?

- `De trainingsdata waarmee de AI is getraind bevat vooral mannen in die rol.`
- `De AI vindt mannen aardiger.`
- `Vrouwen zijn nooit directeur.`
- `Het programma is kapot.`

Correct: `De trainingsdata waarmee de AI is getraind bevat vooral mannen in die rol.`

### SR5 — Auteursrecht en bronvermelding
- Item-id: `lj3v-sr5-copyright`
- Kerndoel: 22A
- Punten: 1

> Je gebruikt een foto in je werkstuk. Hoe ga je correct met de bron om?

- `Maker noemen en bron vermelden.`
- `Foto bewerken zodat je hem als eigen werk kan gebruiken.`
- `Foto kleiner maken; dan is het geen kopie.`
- `Foto direct kopiëren; op internet mag alles.`

Correct: `Maker noemen en bron vermelden.`

### SR6 — Streaming en energie
- Item-id: `lj3v-sr6-energy`
- Kerndoel: 23C
- Punten: 1

> Wat is een belangrijk gevolg van het massaal kijken van streaming-video?

- `Datacenters verbruiken veel energie.`
- `Internetkabels worden korter.`
- `Telefoons worden zwaarder.`
- `Beeld wordt vanzelf scherper.`

Correct: `Datacenters verbruiken veel energie.`

---

# LEERJAAR 3 HAVO/VWO — `lj3-hv`

## PT1 — Bestanden en mappen

- Item-id: `lj3h-pt1-files`
- Itemtype: `file_task_simulation`
- Kerndoel: 21A
- Punten: 4

Startbestanden:
- `Thuis/OneDrive/Onderzoek/Onderzoek_v1.docx`
- `Thuis/OneDrive/Onderzoek/Onderzoek_v2.docx`
- `Thuis/OneDrive/Onderzoek/Onderzoek_DEF.docx`
- `Thuis/OneDrive/Onderzoek/Bronnen.xlsx`
- `Thuis/OneDrive/Onderzoek/Afbeelding_CC_BY.png`

Leerlingtekst:
> Kun jij je bestanden netjes beheren?
>
> Maak de opdrachten. Klik daarna op **Taak afronden**.

Opdrachten:
1. Maak map `Archief`.
2. Verplaats `Onderzoek_v1.docx` en `Onderzoek_v2.docx` naar `Archief`.
3. Hernoem `Onderzoek_DEF.docx` naar `Onderzoek_eindversie.docx`.
4. Maak map `Bronnen_en_media` en verplaats `Bronnen.xlsx` en `Afbeelding_CC_BY.png` daarnaartoe.

Scoring:
- 1 punt: `Archief` bestaat.
- 1 punt: beide oude versies staan in `Archief`.
- 1 punt: eindversie correct hernoemd.
- 1 punt: bron- en mediabestanden staan in `Bronnen_en_media`.

## PT2 — Mail opstellen

- Item-id: `lj3h-pt2-mail`
- Itemtype: `outlook_mail_simulation`
- Kerndoel: 21A, 23A, 23B
- Punten: 4

Zichtbare knoppen: `Verzenden`, `BCC tonen`, `Bestand bijvoegen`, `Hyperlink invoegen`, `Prioriteit`, `Concept opslaan`, `Verwijderen`. CC-veld permanent zichtbaar; BCC-veld verschijnt na klikken op `BCC tonen`.

Contacten: `mentor@school.nl`, `ouder1@mail.nl`, `ouder2@mail.nl`, `ouder3@mail.nl`, `klasgroep@school.nl`, `teamleider@school.nl`.

Bestanden: `Agenda_informatieavond.pdf`, `Cijfers_klas.xlsx`, `Foto_leerlingen.jpg`, `Concept_uitnodiging.docx`.

Leerlingtekst:
> Je stuurt een uitnodiging naar ouders. Ouders mogen elkaars mailadres niet zien. Je mentor moet kunnen meekijken. Voeg de agenda toe en voeg een link naar de schoolsite toe.

Opdrachten:
1. Zet `mentor@school.nl` bij Cc.
2. Zet `ouder1@mail.nl`, `ouder2@mail.nl` en `ouder3@mail.nl` bij Bcc.
3. Voeg `Agenda_informatieavond.pdf` toe.
4. Voeg hyperlink `https://school.nl/informatieavond` toe en verzend.

Scoring:
- 1 punt: mentor in Cc.
- 1 punt: alle ouders in Bcc en geen ouder in Aan/Cc.
- 1 punt: juiste bijlage zichtbaar.
- 1 punt: hyperlink zichtbaar in body en mail verzonden.

## PT3 — Account, apparaat en verbinding beveiligen

- Item-id: `lj3h-pt3-security`
- Itemtype: `account_security_simulation`
- Kerndoel: 23A, 21A
- Punten: 4

### Scherm 1 — Macro-waarschuwing
Melding:
> Macro's zijn uitgeschakeld in `Factuur_stage.xlsm`. Bestand komt van onbekende afzender.

Acties: `Macro's inschakelen`, `Afzender controleren`, `Bestand melden bij ICT`, `Bestand als vertrouwd markeren`, `Bestand doorsturen naar klasgroep`.

Scoring:
- 1 punt: macro's niet ingeschakeld.
- 1 punt: afzender controleren of melden bij ICT.

### Scherm 2 — Verdachte login
Melding:
> Nieuwe login op je schoolaccount vanaf onbekend apparaat.

Acties: `Officiële accountbeveiliging openen`, `Sessie/apparaten controleren`, `Wachtwoord wijzigen`, `Tweestapsverificatie controleren/aanzetten`, `Bericht negeren`, `Wachtwoord naar vriend sturen`.

Scoring:
- 1 punt: officiële accountomgeving geopend.
- 1 punt: sessies/apparaten gecontroleerd en/of wachtwoord/2FA veilig aangepast.

## PT4 — Excel/data sorteren en filteren

- Item-id: `lj3h-pt4-excel`
- Itemtype: `excel_download_task`
- Kerndoel: 21C, 21A
- Punten: 4

Downloadbestand: `LJ3_HV_OpenData.xlsx`
Sheet: `Energie`

Dataset: 70 dataregels in `public/downloads/LJ3_HV_OpenData.xlsx`.

Vraag A:
> Filter op `Kosten > 500`. Sorteer daarna op `Kosten`, van hoog naar laag. Welke code staat bovenaan?

Antwoord A: `E13`

Vraag B:
> Filter op `Woningtype = B`. Sorteer daarna op `Jaar`, van nieuw naar oud. Welke code staat bovenaan?

Antwoord B: `E02`

Scoring:
- 2 punten: antwoord A exact `E13`.
- 2 punten: antwoord B exact `E02`.

## PT6 — Videovergadering en schermdelen

- Item-id: `lj3h-pt6-meeting`
- Itemtype: `teams_share_simulation`
- Kerndoel: 21A, 23A, 23B
- Punten: 3

Scenario:
> Je wilt een video laten zien en horen. Op je scherm staat ook een privébericht en een cijferlijst open. Anderen mogen die niet zien.

Vensters: `Hele scherm`, `Mediaspeler`, `Excel: Cijferlijst`, `Browser: Privébericht`, `Word: Werkstuk`, `Teams chat`.

Scoring:
- 1 punt: Delen geopend.
- 1 punt: computergeluid aan.
- 1 punt: Mediaspeler gekozen en niet hele scherm.

## PT7 — Blokprogrammeren

- Item-id: `lj3h-pt7-programming`
- Itemtype: `block_programming_task`
- Kerndoel: 22B
- Punten: 4

Inleidende tekst:
> Een sensor meet temperatuur en raamstand. Op het scherm verschijnt `waarschuwing` of `ok`. Programmeer de logica met blokken; klik op ▶ om te testen met de schuifregelaars voor temperatuur en raamstand.

Leerlingtekst:
> Maak een programma. Als de temperatuur hoger is dan 25 **én** het raam open staat, toon `waarschuwing`. Anders toon `ok`.

Blokken:
- `bij start` — gebeurtenissen, `#ffb22e`
- `lees temperatuur` — waarnemen, `#2eb8a6`
- `lees raamstand` — waarnemen, `#2eb8a6`
- `als (temperatuur > 25) EN (raam = open) dan` — besturing, `#f47b32` (nesting)
- `als (temperatuur > 25) OF (raam = open) dan` — besturing, `#f47b32` (nesting, kritieke afleider)
- `als (temperatuur < 25) EN (raam = open) dan` — besturing, `#f47b32` (nesting, kritieke afleider)
- `toon "waarschuwing"` — uiterlijk, `#8f5acb`
- `toon "ok"` — uiterlijk, `#8f5acb`
- `toon "koud"` — uiterlijk, `#8f5acb`
- `anders` — besturing, `#f47b32` (nesting-tak)
- `herhaal altijd` — besturing, `#f47b32` (nesting)
- `verwijder temperatuur` — data, `#3f8edb`
- `zet temperatuur op 0` — variabelen, `#f2a23a`
- `speel alarmgeluid` — geluid, `#cf63c7`

Scoring:
- 1 punt: temperatuur en raamstand worden gelezen binnen `bij start` (eventueel binnen `herhaal altijd`).
- 1 punt: juiste EN-voorwaarde gekozen.
- 1 punt: `waarschuwing` in juiste tak en `ok` in `anders`-tak.
- 1 punt: na ▶ vertoont het systeem het juiste eindgedrag bij testwaarden (T=30, raam=open ⇒ waarschuwing; T=20, raam=open ⇒ ok) en geen kritieke afleider gebruikt.

## PT8 — Online gedrag: gemanipuleerde video en dark pattern

- Item-id: `lj3h-pt8-online`
- Itemtype: `social_action_simulation`
- Kerndoel: 21D, 21B, 23B, 23C
- Punten: 3

Situatie:
> Je ziet op een sociaal platform een video waarin een docent iets raars lijkt te zeggen. De video staat op een **anoniem account** zonder profielinformatie. De **mondbeweging klopt niet goed** met de stem. Onder de video staat: *"Deel dit voordat school het verwijdert."* Er is **geen bron of context**.

Toelichting onder de vraag:
> **Verifiëren** = de informatie controleren via een officieel kanaal (bv. de school zelf, je mentor, een betrouwbare nieuwsbron).

Opdracht:
1. Beoordeel de video: `waarschijnlijk echt`, `twijfelachtig`, `waarschijnlijk gemanipuleerd of nep`.
2. Klik twee verdachte signalen aan.
3. Kies één verificatieactie.

Correct:
- beoordeling: `waarschijnlijk gemanipuleerd of nep` of `twijfelachtig`.
- signalen: `anoniem account`, `mondbeweging klopt niet`, `urgentie "deel dit"`, `geen bron/context`.
- verificatieactie: `Check via officiële school/mentor of betrouwbare bron`.

Scoring:
- 1 punt: juiste beoordeling.
- 1 punt: minstens twee juiste signalen.
- 1 punt: juiste verificatieactie en niet delen.

## SR-blok — `lj3-hv` (6 items, 6 punten)

### SR1 — AI bias en trainingsdata
- Item-id: `lj3h-sr1-bias`
- Kerndoel: 21D
- Punten: 1

> Waarom kan een AI-systeem scheve of oneerlijke uitkomsten geven?

- `Omdat trainingsdata onvolledig of scheef kunnen zijn.`
- `Omdat AI altijd neutraal is.`
- `Omdat AI geen data gebruikt.`
- `Omdat alleen internet langzaam is.`

Correct: `Omdat trainingsdata onvolledig of scheef kunnen zijn.`

### SR2 — Regulering
- Item-id: `lj3h-sr2-regulation`
- Kerndoel: 23C
- Punten: 1

> Waarom worden grote digitale platforms en AI-systemen vaak op EU-niveau gereguleerd?

- `Omdat één land vaak te weinig invloed heeft op wereldwijde bedrijven.`
- `Omdat alleen Brussel mag beslissen over digitale regels.`
- `Omdat alle techbedrijven in Nederland zitten.`
- `Omdat AI zonder regels altijd eerlijk werkt.`

Correct: `Omdat één land vaak te weinig invloed heeft op wereldwijde bedrijven.`

### SR3 — Verificatie en hallucinatie
- Item-id: `lj3h-sr3-hallucination`
- Kerndoel: 21D
- Punten: 1

> Een AI-tool noemt een wetenschappelijk artikel met titel en auteurs. Je vindt het artikel niet in zoeksystemen. Wat is de meest plausibele verklaring?

- `De AI heeft het artikel verzonnen (hallucinatie).`
- `Het artikel is recent gepubliceerd en niet geïndexeerd.`
- `Het artikel is intentioneel verborgen.`
- `Zoekmachines zijn niet betrouwbaar.`

Correct: `De AI heeft het artikel verzonnen (hallucinatie).`

### SR4 — Filter bubble en polarisatie
- Item-id: `lj3h-sr4-filter`
- Kerndoel: 21B
- Punten: 1

> Wat is een mogelijk maatschappelijk effect van algoritmische selectie van nieuws?

- `Mensen krijgen vaker informatie die hun eigen mening bevestigt, waardoor polarisatie kan toenemen.`
- `Iedereen ziet uiteindelijk hetzelfde nieuws.`
- `Nieuws wordt automatisch waar.`
- `Algoritmes verminderen verschil van mening.`

Correct: `Mensen krijgen vaker informatie die hun eigen mening bevestigt, waardoor polarisatie kan toenemen.`

### SR5 — Open licenties
- Item-id: `lj3h-sr5-cc-sa`
- Kerndoel: 22A
- Punten: 1

> Wat betekent het als content een Creative Commons BY-SA-licentie heeft?

- `Je mag hergebruiken met naamsvermelding én moet hetzelfde delen onder dezelfde licentie.`
- `Je mag het alleen voor commercieel gebruik gebruiken.`
- `Je hoeft niets te vermelden.`
- `Het mag alleen op papier worden gedeeld.`

Correct: `Je mag hergebruiken met naamsvermelding én moet hetzelfde delen onder dezelfde licentie.`

### SR6 — Energie en duurzaamheid
- Item-id: `lj3h-sr6-energy`
- Kerndoel: 23C
- Punten: 1

> Welk aspect maakt het trainen van grote AI-modellen relatief energie-intensief?

- `Het rekenen op grote datasets vereist langdurig veel rekenkracht in datacenters.`
- `AI-modellen draaien op zonnepanelen.`
- `AI is altijd energie-zuinig.`
- `AI gebruikt geen elektriciteit.`

Correct: `Het rekenen op grote datasets vereist langdurig veel rekenkracht in datacenters.`

---

# Anker-items voor hermeting 2028

Wijs de volgende items aan als **anker** — niet wijzigen tot 2028 — om longitudinale vergelijking mogelijk te maken:

- **PT1** in alle versies (bestandsbeheer is tijdsstabiel).
- **PT6** in alle versies (Teams-screenshot kan een 2028-screenshot worden, maar items en correct gedrag blijven gelijk).
- **SR over wachtwoordveiligheid** (`lj1v-sr1-pw`, `lj1h-sr1-pw`-equivalent voor LJ3 indien gewenst toevoegen) — NIST-richtlijn is stabiel.

Items die voorzienbaar verouderen en in 2028 herzien moeten worden (`AI-snel-veranderend`-flag in logs):
- Alle SR-items rond AI-hallucinatie, AI-bias, regulering.
- PT8-deepfake voor LJ3.

# Codex-implementatieprompt

Plaats deze specificatie als `docs/nulmetingen_dg_v5_specificatie.md` in de repo.

```text
Implementeer de definitieve nulmetingen Digitale Geletterdheid v5 exact op basis van:

docs/nulmetingen_dg_v5_specificatie.md

Belangrijkste instructie:
Vervang de bestaande toetsinhoud exact door deze v5-specificatie. Verzin geen nieuwe items, vraagteksten, opties, afleiders, bestandsnamen, datasets, scoringsregels of correcte antwoorden.

Eisen:
- Vier versies: lj1-vmbo, lj1-hv, lj3-vmbo, lj3-hv.
- Maximumscore per versie: 32 punten.
- Zelfinschatting telt niet mee; toon de Dunning-Kruger-discrepantie in de leerling-PDF.
- Geen rubric-based scoring.
- Geen scorende open tekstvelden, behalve exacte korte codes uit downloadtaken.
- Geen live reverse image search.
- Microsoft-/Office-achtige interfaces; PT6 als statische screenshot met klikbare hotspots.
- PT2: CC-knop weg, CC-veld permanent zichtbaar onder Aan; bijlage zichtbaar tussen onderwerp en bericht; hyperlink in body; rood `!` bij prioriteit.
- PT3 als simulatie alleen voor lj3-versies; voor lj1-versies vervangen door SR-items.
- PT5 verwijderd in alle versies.
- PT6 met Teams-screenshot + klikbare hotspots.
- PT7 met figuur 'Bizzy', zichtbare canvas, afspeelknop en resetknop; voor LJ3 nesting in C-vorm-blokken; scoring zonder hard aantal-blokken-criterium.
- PT8 met expliciete context, uitgelegde 'rapporteren'-term en betere afleiders; geen all-or-nothing op deelvragen.
- SR-blok: 10 items voor LJ1, 6 items voor LJ3.
- Antwoordopties bij SR-items randomiseren per sessie; `Weet ik niet` apart en niet mee-randomiseren.
- UI-knoppen in Office-/Teams-/Outlook-simulaties niet randomiseren.
- Logging per item: itemId, itemType, shownOptionOrder indien van toepassing, selectedAnswer/eindstate, correctheid, score, maxScore, timestamp, timeSpentMs, en flag `AI-snel-veranderend` waar van toepassing.

Technische stappen:
1. Inspecteer de huidige data/config, scoring en UI-components.
2. Bouw of pas de componenten aan volgens de componentdefinities in dit document.
3. Genereer of behoud de exacte Excel-downloadbestanden voor de data/sorteer- en filtertaken.
4. Implementeer alle vier versies.
5. Test alle vier versies op happy path.
6. Test minimaal één foutpad per performance task en SR-item.
7. Controleer totaalscore 32 per versie.
8. Controleer logging en exportvelden.
9. Rapporteer gewijzigde bestanden, checks en resterende beperkingen.
```

# Downloadbestanden

Plaats in `/public/downloads/`:
- `LJ1_VMBO_Liedjes.xlsx` (60 dataregels)
- `LJ1_HV_Bibliotheek.xlsx` (60 dataregels)
- `LJ3_VMBO_Bestellingen.xlsx` (70 dataregels)
- `LJ3_HV_OpenData.xlsx` (70 dataregels)

Test sorteren en filteren in zowel Excel desktop als Excel Online.

# Minimale exportvelden per leerling

- sessionId
- leerlingcode of anonieme code
- versie
- itemId
- itemType
- score
- maxScore
- totalScore
- percentage
- score per blok (PT1, PT2, PT3, PT4, PT6, PT7, PT8, SR)
- selectedAnswer of eindstate
- correctheid
- timeSpentMs
- shownOptionOrder indien van toepassing
- zelfinschattingScore (0–100)
- discrepantieZelfinschattingScore = (zelfinschattingScore / 100 * maxScore) − totalScore
- ankerItemFlag (boolean per item)
- aiSnelVeranderendFlag (boolean per item)
