# Nulmetingen Digitale Geletterdheid v4.3 — specificatie voor Codex

Dit document beschrijft vier nulmetingen Digitale Geletterdheid zoals ze in v4.3 in de bestaande webapp zijn doorgevoerd. Implementeer exact wat hieronder staat. Verzin geen extra items, afleiders, datasets, correcte antwoorden of scoringsregels.

Wijzigingen ten opzichte van v4.2:
- Startschermtekst is ingekort en neutraler geformuleerd.
- Eindscherm voor leerlingen biedt alleen nog PDF-download van resultaten.
- PT1 gebruikt in alle versies dezelfde leerlinginstructie.
- PT2 gebruikt Outlook-achtige knoppen en velden: `Verzenden`, `CC`, `BCC tonen`, `Bestand bijvoegen`, `Hyperlink invoegen`, `Prioriteit`, `Concept opslaan`, `Verwijderen`.
- PT3 leerjaar 1 gebruikt nieuwe accountnamen en wachtwoordopties.
- PT4-downloadbestanden bevatten langere datasets; correcte codes blijven automatisch scorebaar.
- PT5 is vervangen door een PowerPoint-producttaak.
- PT7 gebruikt blokken met categorie en kleur; leerjaar/niveau bepaalt hoeveel blokken nodig zijn.

## Versies

1. `lj1-vmbo` — Leerjaar 1 VMBO
2. `lj1-hv` — Leerjaar 1 HAVO/VWO
3. `lj3-vmbo` — Leerjaar 3 VMBO
4. `lj3-hv` — Leerjaar 3 HAVO/VWO

## Kernkeuzes

- Maximumscore per versie: **32 punten**.
- Richttijd: **30 minuten**.
- Context: Microsoft/Office-achtig: Outlook, OneDrive, Word, Excel, PowerPoint en Teams.
- De kern bestaat uit echte micro-performance tasks.
- Geen rubric-based scoring.
- Geen live reverse image search.
- Geen scorende open tekstvelden, behalve exacte korte codes uit downloadtaken.
- Gebruik echte downloadbestanden voor Excel/data-taken.
- Selected-response-items blijven beperkt tot 2 punten.
- `Weet ik niet` blijft apart beschikbaar waar dat logisch is, scoort 0 en wordt niet mee-gerandomiseerd.
- Randomiseer antwoordopties bij selected-response-items. Randomiseer vaste Office-/Teams-/Outlook-knoppen niet.

## Puntentelling

| Blok | Punten |
|---|---:|
| Zelfinschatting | 0 |
| PT1 Bestanden en mappen | 4 |
| PT2 Mail opstellen | 4 |
| PT3 Account, apparaat en verbinding beveiligen | 4 |
| PT4 Excel/data sorteren en filteren | 4 |
| PT5 PowerPoint product | 4 |
| PT6 Videovergadering en schermdelen | 3 |
| PT7 Blokprogrammeren | 4 |
| PT8 Online gedrag, deepfake/dark pattern/pesten | 3 |
| Selected response | 2 |
| **Totaal** | **32** |

## Introscherm algemeen

Titel: **Nulmeting Digitale Geletterdheid**

Tekst:
> In deze meting krijg je korte opdrachten en vragen. Het resultaat geeft een beeld van hoe digitaal geletterd jij bent.
>
> Werk zelfstandig en beantwoord de vragen eerlijk. Als je iets niet weet, kun je dat als antwoord kiezen.
>
> De meting duurt ongeveer een half uur.

## Introscherm LJ1 VMBO

Titel: **Nulmeting Digitale Geletterdheid**

Tekst:
> In deze meting krijg je korte opdrachten en vragen. Het resultaat geeft een beeld van hoe digitaal geletterd jij bent.
>
> Werk zelfstandig en beantwoord de vragen eerlijk. Als je iets niet weet, kun je dat als antwoord kiezen.
>
> De meting duurt ongeveer een half uur.

## Eindscherm leerling

Leerlingen hoeven aan het einde alleen een PDF-download van hun resultaten te kunnen maken. CSV- en JSON-downloads zijn niet zichtbaar voor leerlingen.

## Zelfinschatting — alle versies

- Item-id: `self-assessment`
- Itemtype: `self_assessment`
- Punten: 0
- Vraag: **Hoe hoog schat je je eigen digitale geletterdheid in?**
- Antwoordvorm: slider 0–100
- Labels: 0 = bijna niet, 50 = redelijk, 100 = heel goed
- Scoring: telt niet mee; log de waarde.

---

# Technische componenten

## `file_task_simulation`
Ondersteunt: mappen maken, submappen maken, bestanden hernoemen, bestanden verplaatsen, eindtoestand controleren via exacte paden. De leerlingknop **Taak afronden** staat onder de opdrachtlijst met extra witruimte.

## `outlook_mail_simulation`
Ondersteunt: Outlook-achtige compose-interface met invoervelden voor AAN, CC en BCC; keuzelijsten voor contacten; berichtveld met circa 10 zichtbare regels; bovenste knoppenbalk met `Verzenden`, `CC`, `BCC tonen`, `Bestand bijvoegen`, `Hyperlink invoegen`, `Prioriteit`, `Concept opslaan`, `Verwijderen`; blauwe verzendknop links; dropdown-afleider `Verzending plannen`. Onderwerp en Bericht zijn velden, geen knoppen. De eindtoestand wordt na verzenden gescoord.

## `account_security_simulation`
Ondersteunt: wachtwoordkaart kiezen/slepen, tweestapsverificatie aanzetten, browserbalk-hotspot, telefoon-/apparaatinstellingen, opslag, updates, officiële updateplek, accountbeveiliging.

## `excel_download_task`
Genereert echte `.xlsx`-bestanden. Leerling voert zelf sorteer- en filterhandelingen uit in Excel en vult korte codes in op de website. Antwoordnormalisatie: trim spaties, hoofdletterongevoelig, verwijder eindpunt.

## `powerpoint_design_task`
PowerPoint-achtige producttaak met vier automatisch scorebare keuzegroepen: dia-indeling, titel, inhoud en beste deel-/exportactie. Elke groep levert 1 punt op. Correcte antwoorden zijn niet zichtbaar in de UI.

## `teams_share_simulation`
Teams-achtige interface met knop Delen, keuze Scherm/Venster, vensterminiaturen en toggle `Met computergeluid`.

## `block_programming_task`
Blokkenbak met meer blokken dan nodig, werkvlak, drag/drop of klik-om-toe-te-voegen. Elk blok heeft een categorie en kleur. Basiskleuren:
- gebeurtenissen: `#ffb22e`
- uiterlijk: `#8f5acb`
- beweging: `#55a9dc`
- besturing: `#f47b32`
- variabelen: `#f2a23a`
- waarnemen: `#2eb8a6`
- geluid: `#cf63c7`
- data: `#3f8edb`

## `social_action_simulation`
Socialmedia-/chat-/appinterface met hotspots en actieknoppen: rapporteren, blokkeren, niet delen, bewijs bewaren, melden bij mentor/vertrouwde volwassene, doorsturen, reageren, instellingen aanpassen.

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
> Maak de opdrachten. Klik daarna op Taak afronden.

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

Zichtbare knoppen: Verzenden, CC, BCC tonen, Bestand bijvoegen, Hyperlink invoegen, Prioriteit, Concept opslaan, Verwijderen. De verzendknop is blauw en staat links vooraan; daarnaast staat een dropdown-afleider met `Verzending plannen`.

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
3. Voeg `Verslag_Nederlands.docx` toe.
4. Verstuur de mail.

Scoring:
- 1 punt: mentor staat in Aan.
- 1 punt: onderwerp is exact `Verslag Nederlands`.
- 1 punt: bijlage `Verslag_Nederlands.docx` is toegevoegd.
- 1 punt: mail is verzonden.

## PT3 — Account, apparaat en verbinding beveiligen

- Item-id: `lj1v-pt3-security`
- Itemtype: `account_security_simulation`
- Kerndoel: 23A, 21A
- Punten: 4

### Scherm 1 — Account aanmaken
Leerlingtekst:
> Nora maakt een account voor de schoolomgeving. Kies het veiligste wachtwoord en zet extra beveiliging aan.

Wachtwoordkaartjes:
- `Nora2026!`
- `fietsbel`
- `Qwerty!23`
- `MijnGroeneFietsStaatNaastSchool`

Scoring:
- 1 punt: wachtwoord `MijnGroeneFietsStaatNaastSchool` gekozen.
- 1 punt: tweestapsverificatie staat aan.

### Scherm 2 — Telefoon is traag
Leerlingtekst:
> De telefoon is traag. Verbeter de telefoon zonder persoonlijke gegevens te wissen.

Actieve schermen: Instellingen, Opslag, Apps, Updates, Geluid, Schermhelderheid.

Correcte acties:
- open `Opslag` en kies `Oude downloads verwijderen`.
- open `Updates` en kies `Beschikbare systeemupdate installeren`.

Scoring:
- 1 punt: oude downloads verwijderen gekozen.
- 1 punt: beschikbare systeemupdate installeren gekozen.

Fout/niet scorend: schermhelderheid verlagen, toetsenbordgeluid uitzetten, alles wissen, willekeurige apps geforceerd sluiten.

## PT4 — Excel/data sorteren en filteren

- Item-id: `lj1v-pt4-excel`
- Itemtype: `excel_download_task`
- Kerndoel: 21C, 21A
- Punten: 4

Downloadbestand: `LJ1_VMBO_Liedjes.xlsx`  
Sheet: `Liedjes`

Dataset: echte `.xlsx` met 60 dataregels. Het downloadbestand in `public/downloads/LJ1_VMBO_Liedjes.xlsx` is leidend. De dataset bevat voldoende extra regels en afleiders zodat het antwoord niet eenvoudig uit een korte tabel kan worden afgelezen.

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

## PT5 — PowerPoint product

- Item-id: `lj1v-pt5-product`
- Itemtype: `powerpoint_design_task`
- Kerndoel: 22A, 21A
- Punten: 4

Leerlingtekst:
> Maak in PowerPoint een duidelijke dia voor de open dag. Kies de beste onderdelen voor de dia en export.

Scenario:
> Je maakt een dia voor bezoekers van de open dag. De dia moet snel duidelijk maken wat er gebeurt en waar ze moeten zijn.

Keuzegroepen:
1. Kies de beste dia-indeling.
   - correct: `Titel met afbeelding en drie korte bullets`
   - afleiders: `Alleen een grote titel`, `Twee lange tekstvakken zonder afbeelding`, `Lege dia met alleen achtergrondkleur`
2. Kies de beste titel.
   - correct: `Open dag Citadel College`
   - afleiders: `Welkom`, `Mijn dia`, `School`
3. Kies de beste inhoud.
   - correct: `Datum, tijd en lokaal in korte bullets`
   - afleiders: `Een lange lap tekst over alles op school`, `Alleen een grappige quote`, `Alleen het logo zonder uitleg`
4. Kies de beste manier om te delen.
   - correct: `Exporteren als PDF`
   - afleiders: `Opslaan als bewerkbaar PowerPoint-bestand`, `Kopieer als afbeelding`, `Printscreen maken`

Scoring:
- 1 punt per correct gekozen keuzegroep.

## PT6 — Videovergadering en schermdelen

- Item-id: `lj1v-pt6-meeting`
- Itemtype: `teams_share_simulation`
- Kerndoel: 21A, 23B
- Punten: 3

Scenario:
> Sanne wil een muziekvideo laten zien én laten horen. Ze wil alleen de video delen, niet haar hele scherm.

Teams-knoppen: Chat, Reacties, Meer, Camera, Microfoon, Delen.  
Na Delen: toggle `Met computergeluid`; opties: Hele scherm, Venster Mediaspeler, Venster Word document, Venster Excel bestand, Venster Browser.

Scoring:
- 1 punt: `Delen` geopend.
- 1 punt: `Met computergeluid` aan.
- 1 punt: venster `Mediaspeler` gekozen.

## PT7 — Blokprogrammeren

- Item-id: `lj1v-pt7-programming`
- Itemtype: `block_programming_task`
- Kerndoel: 22B
- Punten: 4

Leerlingtekst:
> Maak een programma met precies 4 blokken. Als er op afspelen wordt geklikt, zegt Hulkbuster Hoi, gaat hij 1 meter vooruit en draait hij naar 180 graden.

Beschikbare blokken:
- `Wanneer er geklikt wordt op afspelen` — gebeurtenissen, `#ffb22e`
- `wanneer er op Hulkbuster wordt geklikt` — gebeurtenissen, `#ffb22e`
- `verander animatie van Hulkbuster naar niet animeren` — uiterlijk, `#8f5acb`
- `Hulkbuster zegt "Hoi!"` — uiterlijk, `#8f5acb`
- `verplaats Hulkbuster 1 meters vooruit in 1 sec.` — beweging, `#55a9dc`
- `draai Hulkbuster met de wijzers van de klok mee naar 180° in 1 sec.` — beweging, `#55a9dc`
- `als 1 < 2` — besturing, `#f47b32`
- `speel geluid applaus` — geluid, `#cf63c7`
- `wacht 1 seconde` — besturing, `#f47b32`
- `zet score op 0` — variabelen, `#f2a23a`
- `verplaats Hulkbuster 5 meters achteruit in 1 sec.` — beweging, `#55a9dc`

Correct programma:
```text
Wanneer er geklikt wordt op afspelen
Hulkbuster zegt "Hoi!"
verplaats Hulkbuster 1 meters vooruit in 1 sec.
draai Hulkbuster met de wijzers van de klok mee naar 180° in 1 sec.
```

Scoring:
- 1 punt: juiste startblok.
- 1 punt: `Hulkbuster zegt "Hoi!"` gebruikt.
- 1 punt: `verplaats Hulkbuster 1 meters vooruit in 1 sec.` gebruikt.
- 1 punt: Hulkbuster draait naar 180 graden en er zijn precies 4 blokken gebruikt; kritieke afleiders niet gebruikt.

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

Keuzes: Niet delen, Alleen mentor, Alleen projectgroep, Hele klas, Openbaar.

Correct:
1. Wachtwoord voor Magister → Niet delen
2. Groepsplanning voor project → Alleen projectgroep
3. Poster voor open dag → Openbaar

Scoring:
- 1 punt: alle drie correct.

### Scherm 2 — Groepschat
Situatie:
> In de groepschat staat een bewerkte foto van Sam. Er staat: “Stuur door 😂”. Sam zegt: “Stop, ik wil dit niet.”

Leerlingopdracht:
> Kies twee goede acties.

Acties: Doorsturen, Lachen met emoji, Rapporteren, Niet doorsturen, Aan mentor of vertrouwenspersoon melden, Gemene reactie plaatsen.

Correcte acties: Niet doorsturen, Rapporteren, Aan mentor of vertrouwenspersoon melden.

Scoring:
- 1 punt: minstens twee correcte acties gekozen.
- 1 punt: geen schadelijke actie gekozen (`Doorsturen`, `Lachen met emoji`, `Gemene reactie plaatsen`).

## Selected response — LJ1 VMBO

### SR1 — AI controleren
- Item-id: `lj1v-sr1-ai`
- Kerndoel: 21D
- Punten: 1

Vraag:
> Een chatbot geeft een antwoord voor je werkstuk. Je weet niet of het klopt. Wat doe je het best?

Opties:
- Ik controleer het in een andere bron.
- Ik gebruik het meteen, want het klinkt netjes.
- Ik vraag dezelfde chatbot om het nog eens te zeggen.
- Ik deel het met mijn vrienden.

Correct: `Ik controleer het in een andere bron.`

### SR2 — Grote apps
- Item-id: `lj1v-sr2-society`
- Kerndoel: 23C
- Punten: 1

Vraag:
> Veel leerlingen gebruiken dezelfde grote app voor school en contact. Wat is een risico?

Opties:
- Als de app stopt of verandert, hebben veel mensen tegelijk last.
- Dan is alles automatisch veilig.
- Dan wordt internet sneller.
- Dan hoef je geen wachtwoord meer te gebruiken.

Correct: `Als de app stopt of verandert, hebben veel mensen tegelijk last.`

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
> Maak de opdrachten. Klik daarna op Taak afronden.

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

Zichtbare knoppen: Verzenden, CC, BCC tonen, Bestand bijvoegen, Hyperlink invoegen, Prioriteit, Concept opslaan, Verwijderen. De verzendknop is blauw en staat links vooraan; daarnaast staat een dropdown-afleider met `Verzending plannen`.

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
- 1 punt: juiste bijlage toegevoegd en mail verzonden.

## PT3 — Account, apparaat en verbinding beveiligen

- Item-id: `lj1h-pt3-security`
- Itemtype: `account_security_simulation`
- Kerndoel: 23A, 21A
- Punten: 4

Scherm 1: Account. Wachtwoordkaartjes: `Herfst2026`, `BlauweTreinLampSchoolTas`, `Welkom123!`, `11112222`.

Leerlingtekst:
> Iman maakt een account voor de schoolomgeving. Kies het veiligste wachtwoord en zet extra beveiliging aan.

Scoring:
- 1 punt: wachtwoord `BlauweTreinLampSchoolTas`.
- 1 punt: tweestapsverificatie aan.

Scherm 2: Browserbalk. Toon URL: `https://leeromgeving.school.nl/inloggen`.

Leerlingtekst:
> Klik op het onderdeel waaraan je ziet dat de verbinding versleuteld is.

Correcte hotspots: `https://` of slotje.

Scoring:
- 1 punt: juiste hotspot.

Scherm 3: Toegang geweigerd. Melding: `Je hebt geen toegang tot Werkstuk.docx.`

Acties: Vraag toegang aan eigenaar, Gebruik wachtwoord van klasgenoot, Maak bestand openbaar, Download via onbekende link.

Scoring:
- 1 punt: `Vraag toegang aan eigenaar`.

## PT4 — Excel/data sorteren en filteren

- Item-id: `lj1h-pt4-excel`
- Itemtype: `excel_download_task`
- Kerndoel: 21C, 21A
- Punten: 4

Downloadbestand: `LJ1_HV_Bibliotheek.xlsx`  
Sheet: `Boeken`

Dataset: echte `.xlsx` met 60 dataregels. Het downloadbestand in `public/downloads/LJ1_HV_Bibliotheek.xlsx` is leidend. De dataset bevat voldoende extra regels en afleiders zodat het antwoord niet eenvoudig uit een korte tabel kan worden afgelezen.

Vraag A:
> Sorteer op `Jaar`, van nieuw naar oud. Welke code staat bovenaan?

Antwoord A: `B07`

Vraag B:
> Filter op `Vak = biologie`. Sorteer daarna op `Jaar`, van oud naar nieuw. Welke code staat bovenaan?

Antwoord B: `B06`

Scoring:
- 2 punten: antwoord A exact `B07`.
- 2 punten: antwoord B exact `B06`.

## PT5 — PowerPoint product

- Item-id: `lj1h-pt5-product`
- Itemtype: `powerpoint_design_task`
- Kerndoel: 22A, 21A
- Punten: 4

Leerlingtekst:
> Maak in PowerPoint een duidelijke dia voor een biologiepresentatie. Kies de beste onderdelen voor de dia en export.

Scenario:
> Je presenteert kort wat je over cellen en DNA hebt geleerd. De dia moet overzichtelijk zijn en een bron bij het beeld hebben.

Keuzegroepen:
1. Kies de beste dia-indeling.
   - correct: `Titel, afbeelding, korte bullets en bronregel`
   - afleiders: `Alleen een afbeelding zonder titel`, `Vier tekstvakken met volledige zinnen`, `Lege dia met alleen decoratie`
2. Kies de beste titel.
   - correct: `Cellen en DNA`
   - afleiders: `Biologie`, `Mijn spreekbeurt`, `Interessant onderwerp`
3. Kies de beste inhoud.
   - correct: `Drie kernpunten met een bronvermelding onderaan`
   - afleiders: `Een gekopieerde alinea van internet zonder bron`, `Alle details uit het boek op een dia`, `Alleen een plaatje omdat dat mooier is`
4. Kies de beste manier om te delen.
   - correct: `Exporteren als PDF`
   - afleiders: `Opslaan als bewerkbaar PowerPoint-bestand`, `Opslaan als losse afbeeldingen`, `Bestand hernoemen naar eindversie`

Scoring:
- 1 punt per correct gekozen keuzegroep.

## PT6 — Videovergadering en schermdelen

- Item-id: `lj1h-pt6-meeting`
- Itemtype: `teams_share_simulation`
- Kerndoel: 21A, 23B
- Punten: 3

Scenario:
> Sanne wil een muziekvideo tonen en laten horen. Ze wil niet haar hele scherm delen.

Vensters: Mediaspeler, Word document, Excel bestand, Browser, Chatvenster.

Scoring:
- 1 punt: Delen geopend.
- 1 punt: computergeluid aan.
- 1 punt: Mediaspeler gekozen.

## PT7 — Blokprogrammeren

- Item-id: `lj1h-pt7-programming`
- Itemtype: `block_programming_task`
- Kerndoel: 22B
- Punten: 4

Leerlingtekst:
> Maak een programma. Als er op afspelen wordt geklikt, begroet Hulkbuster de kijker en beweegt hij drie keer vooruit.

Blokken:
- `Wanneer er geklikt wordt op afspelen` — gebeurtenissen, `#ffb22e`
- `wanneer er op Hulkbuster wordt geklikt` — gebeurtenissen, `#ffb22e`
- `verander animatie van Hulkbuster naar niet animeren` — uiterlijk, `#8f5acb`
- `Hulkbuster zegt "Hoi!"` — uiterlijk, `#8f5acb`
- `verplaats Hulkbuster 1 meters vooruit in 1 sec.` — beweging, `#55a9dc`
- `draai Hulkbuster met de wijzers van de klok mee naar 180° in 1 sec.` — beweging, `#55a9dc`
- `als 1 < 2` — besturing, `#f47b32`
- `herhaal 3 keer` — besturing, `#f47b32`
- `herhaal 10 keer` — besturing, `#f47b32`
- `speel geluid start` — geluid, `#cf63c7`
- `zet snelheid op 2` — variabelen, `#f2a23a`
- `als Hulkbuster rand raakt` — waarnemen, `#2eb8a6`
- `stop alles` — besturing, `#f47b32`

Correct programma:
```text
Wanneer er geklikt wordt op afspelen
Hulkbuster zegt "Hoi!"
herhaal 3 keer
verplaats Hulkbuster 1 meters vooruit in 1 sec.
draai Hulkbuster met de wijzers van de klok mee naar 180° in 1 sec.
```

Scoring:
- 1 punt: juiste event.
- 1 punt: juiste tekstblok.
- 1 punt: herhaling van 3 met vooruit bewegen.
- 1 punt: precies 5 blokken gebruikt en geen fout event of kritieke afleider.

## PT8 — Online gedrag: dark pattern

- Item-id: `lj1h-pt8-online`
- Itemtype: `social_action_simulation`
- Kerndoel: 23B, 21B, 23A
- Punten: 3

Situatie:
> App Feeblemind vraagt steeds opnieuw: “Zet notificaties aan”. Silke heeft al drie keer op “Nu niet” geklikt.

Interface: Nu niet, Oké, Instellingen, Meldingen: aan/uit/beperkt, Account verwijderen.

Leerlingopdracht:
> Zorg dat Silke minder wordt gestoord door deze app.

Scoring:
- 1 punt: instellingen geopend.
- 1 punt: meldingen uit of beperkt.
- 1 punt: niet akkoord gegaan met volledige notificaties.

## Selected response — LJ1 HAVO/VWO

### SR1 — AI en bron
- Item-id: `lj1h-sr1-ai`
- Kerndoel: 21D
- Punten: 1

Vraag: `Een AI-tool noemt een jaartal zonder bron. Welke controle is het sterkst?`

Opties:
- Controleren in een onafhankelijke betrouwbare bron.
- De vraag opnieuw stellen aan dezelfde AI.
- Kijken of de tekst zeker klinkt.
- Het antwoord gebruiken als het lang genoeg is.

Correct: `Controleren in een onafhankelijke betrouwbare bron.`

### SR2 — Data en beeld
- Item-id: `lj1h-sr2-society`
- Kerndoel: 21C, 23C
- Punten: 1

Vraag: `Een dataset bevat alleen antwoorden van leerlingen uit één klas. Wat is een goede waarschuwing?`

Opties:
- Je kunt niet zomaar zeggen dat dit voor alle leerlingen geldt.
- De dataset is automatisch fout.
- Meer data maakt nooit verschil.
- Eén klas is altijd genoeg voor heel Nederland.

Correct: `Je kunt niet zomaar zeggen dat dit voor alle leerlingen geldt.`

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
> Maak de opdrachten. Klik daarna op Taak afronden.

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

Zichtbare knoppen: Verzenden, CC, BCC tonen, Bestand bijvoegen, Hyperlink invoegen, Prioriteit, Concept opslaan, Verwijderen. De verzendknop is blauw en staat links vooraan; daarnaast staat een dropdown-afleider met `Verzending plannen`.

Contacten: `mentor@school.nl`, `teamleider@school.nl`, `klasgroep@school.nl`, `stagebedrijf@mail.nl`.

Bestanden: `Flyer_activiteit.pdf`, `Planning_stage.xlsx`, `Foto_stage.jpg`, `Concept_tekst.docx`.

Leerlingtekst:
> Je organiseert een activiteit. De mentor moet reageren. De teamleider hoeft alleen mee te kijken. De flyer moet mee. De mail is niet dringend.

Opdrachten:
1. Mentor bij Aan.
2. Teamleider bij Cc.
3. Voeg `Flyer_activiteit.pdf` toe.
4. Laat prioriteit op Normaal en verzend.

Scoring:
- 1 punt: mentor in Aan.
- 1 punt: teamleider in Cc.
- 1 punt: juiste bijlage.
- 1 punt: prioriteit normaal en verzonden.

## PT3 — Account, apparaat en verbinding beveiligen

- Item-id: `lj3v-pt3-security`
- Itemtype: `account_security_simulation`
- Kerndoel: 23A, 21A
- Punten: 4

### Scherm 1 — Verdachte update
Melding:
> Je videospeler is verouderd. Klik hier om `update.exe` te downloaden.

Acties: Download update.exe, Sluit melding, Open officiële app/instellingen voor updates, Sta meldingen altijd toe.

Scoring:
- 1 punt: download niet gestart.
- 1 punt: officiële updateplek gekozen.

### Scherm 2 — Verdachte login
Melding:
> Nieuwe login op je schoolaccount vanaf onbekend apparaat.

Acties: Officiële accountbeveiliging openen, Wachtwoord wijzigen, Sessie/apparaat controleren, Bericht negeren, Wachtwoord naar vriend sturen.

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

Dataset: echte `.xlsx` met 70 dataregels. Het downloadbestand in `public/downloads/LJ3_VMBO_Bestellingen.xlsx` is leidend. De dataset bevat voldoende extra regels en afleiders zodat het antwoord niet eenvoudig uit een korte tabel kan worden afgelezen.

Vraag A:
> Filter op `Categorie = elektronica`. Sorteer daarna op `Jaar`, van nieuw naar oud. Welke code staat bovenaan?

Antwoord A: `W02`

Vraag B:
> Filter op `Bedrag > 60`. Sorteer daarna op `Bedrag`, van hoog naar laag. Welke code staat bovenaan?

Antwoord B: `W06`

Scoring:
- 2 punten: antwoord A exact `W02`.
- 2 punten: antwoord B exact `W06`.

## PT5 — PowerPoint product

- Item-id: `lj3v-pt5-product`
- Itemtype: `powerpoint_design_task`
- Kerndoel: 22A, 21A
- Punten: 4

Leerlingtekst:
> Maak in PowerPoint een flyer-dia voor een schoolactiviteit. Kies de beste onderdelen voor publicatie.

Scenario:
> Je organiseert een activiteit voor klasgenoten. De dia moet als flyer gebruikt kunnen worden op het scherm in de aula.

Keuzegroepen:
1. Kies de beste dia-indeling.
   - correct: `Flyerindeling met titel, beeld, praktische info en oproep`
   - afleiders: `Alleen een achtergrondfoto zonder tekst`, `Een dia met veel kleine tekstblokken`, `Een tabel met alle taken van de organisatie`
2. Kies de beste titel.
   - correct: `Sportdag vrijdag`
   - afleiders: `Activiteit`, `Leuk!`, `Informatie voor iedereen die dit leest`
3. Kies de beste inhoud.
   - correct: `Wat, waar en wanneer plus een korte oproep`
   - afleiders: `Alle afspraken uit de groepschat`, `Alleen de namen van de organisatoren`, `Een tekst die vooral grappig is`
4. Kies de beste manier om te delen.
   - correct: `Exporteren als PDF`
   - afleiders: `Bewerkbare PowerPoint rondsturen`, `Alleen opslaan als concept`, `Een foto van het scherm maken`

Scoring:
- 1 punt per correct gekozen keuzegroep.

## PT6 — Videovergadering en schermdelen

- Item-id: `lj3v-pt6-meeting`
- Itemtype: `teams_share_simulation`
- Kerndoel: 21A, 23B, 23A
- Punten: 3

Scenario:
> Sanne wil een video laten zien en horen. Op haar scherm staat ook een privéchat open. Zij wil niet dat anderen die chat zien.

Vensters: Hele scherm, Mediaspeler, Excel: Data_werkstuk, Word: Document1, Privéchat.

Scoring:
- 1 punt: Delen geopend.
- 1 punt: computergeluid aan.
- 1 punt: Mediaspeler gekozen en niet hele scherm.

## PT7 — Blokprogrammeren

- Item-id: `lj3v-pt7-programming`
- Itemtype: `block_programming_task`
- Kerndoel: 22B
- Punten: 4

Leerlingtekst:
> Maak een micro:bit-programma. De teller begint op 0. Elke keer dat knop A wordt ingedrukt, gaat de teller 1 omhoog. Bij 5 of meer toont het scherm “vol”.

Blokken:
- `bij start` — gebeurtenissen, `#ffb22e`
- `zet teller op 0` — variabelen, `#f2a23a`
- `als knop A wordt ingedrukt` — gebeurtenissen, `#ffb22e`
- `als knop B wordt ingedrukt` — gebeurtenissen, `#ffb22e`
- `verander teller met 1` — variabelen, `#f2a23a`
- `verander teller met -1` — variabelen, `#f2a23a`
- `als teller >= 5 dan` — besturing, `#f47b32`
- `als teller < 5 dan` — besturing, `#f47b32`
- `toon "vol"` — uiterlijk, `#8f5acb`
- `toon "leeg"` — uiterlijk, `#8f5acb`
- `wacht 10 seconden` — besturing, `#f47b32`
- `speel geluid klaar` — geluid, `#cf63c7`
- `Wanneer er geklikt wordt op afspelen` — gebeurtenissen, `#ffb22e`
- `verplaats Hulkbuster 1 meters vooruit in 1 sec.` — beweging, `#55a9dc`
- `als 1 < 2` — besturing, `#f47b32`

Correct programma:
```text
bij start
zet teller op 0

als knop A wordt ingedrukt
verander teller met 1
als teller >= 5 dan
  toon "vol"
```

Scoring:
- 1 punt: teller initialiseert op 0.
- 1 punt: juiste event knop A en teller +1.
- 1 punt: juiste voorwaarde `teller >= 5`.
- 1 punt: toont `vol` en bevat geen omgekeerde voorwaarde of knop-B-afleider. Het beoogde correcte programma bestaat uit 6 blokken.

## PT8 — Online gedrag: deepfake/pesten

- Item-id: `lj3v-pt8-online`
- Itemtype: `social_action_simulation`
- Kerndoel: 21D, 23A, 23B
- Punten: 3

Situatie:
> In een groepschat verschijnt een AI-gemaakte afbeelding van een leerling in een beschamende situatie. Iemand schrijft: “Dit is echt, stuur door.” Je ziet dat de handen vreemd zijn en dat de leerling schrijft: “Dit ben ik niet.”

Opdracht:
1. Beoordeel: echt / twijfelachtig / waarschijnlijk nep of AI.
2. Klik twee signalen aan.
3. Kies twee acties.

Correct:
- oordeel: waarschijnlijk nep of AI.
- signalen: vreemde handen; leerling ontkent; schadelijke context.
- acties: niet doorsturen; rapporteren; bewijs bewaren; melden bij mentor/vertrouwde volwassene.

Scoring:
- 1 punt: juist oordeel.
- 1 punt: minstens twee juiste signalen.
- 1 punt: minstens twee juiste acties en geen schadelijke actie.

## Selected response — LJ3 VMBO

### SR1 — AI controleren
- Item-id: `lj3v-sr1-ai`
- Kerndoel: 21D
- Punten: 1

Vraag: `Een AI-chatbot geeft een zelfverzekerd antwoord zonder bron. Wat is de beste eerste controle?`

Opties:
- De informatie controleren in een onafhankelijke bron.
- De tekst gebruiken omdat hij zelfverzekerd klinkt.
- Dezelfde vraag opnieuw stellen aan dezelfde chatbot.
- Alleen controleren of er moeilijke woorden in staan.

Correct: `De informatie controleren in een onafhankelijke bron.`

### SR2 — Platformafhankelijkheid
- Item-id: `lj3v-sr2-society`
- Kerndoel: 23C
- Punten: 1

Vraag: `Waarom kan het riskant zijn als scholen en bedrijven sterk afhankelijk zijn van een paar grote techbedrijven?`

Opties:
- Storingen of regelwijzigingen kunnen veel mensen tegelijk raken.
- Internet wordt dan automatisch sneller.
- Grote platforms handelen altijd eerlijk.
- Dan zijn wachtwoorden niet meer nodig.

Correct: `Storingen of regelwijzigingen kunnen veel mensen tegelijk raken.`

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
> Maak de opdrachten. Klik daarna op Taak afronden.

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

Zichtbare knoppen: Verzenden, CC, BCC tonen, Bestand bijvoegen, Hyperlink invoegen, Prioriteit, Concept opslaan, Verwijderen. De verzendknop is blauw en staat links vooraan; daarnaast staat een dropdown-afleider met `Verzending plannen`.

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
- 1 punt: juiste bijlage.
- 1 punt: juiste hyperlink toegevoegd en mail verzonden.

## PT3 — Account, apparaat en verbinding beveiligen

- Item-id: `lj3h-pt3-security`
- Itemtype: `account_security_simulation`
- Kerndoel: 23A, 21A
- Punten: 4

### Scherm 1 — Macro-waarschuwing
Melding:
> Macro’s zijn uitgeschakeld in `Factuur_stage.xlsm`. Bestand komt van onbekende afzender.

Acties: Macro’s inschakelen, Afzender controleren, Bestand melden bij ICT, Bestand als vertrouwd markeren, Bestand doorsturen naar klasgroep.

Scoring:
- 1 punt: macro’s niet ingeschakeld.
- 1 punt: afzender controleren of melden bij ICT.

### Scherm 2 — Verdachte login
Melding:
> Nieuwe login op je schoolaccount vanaf onbekend apparaat.

Acties: Officiële accountbeveiliging openen, Sessie/apparaten controleren, Wachtwoord wijzigen, Tweestapsverificatie controleren/aanzetten, Bericht negeren, Wachtwoord naar vriend sturen.

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

Dataset: echte `.xlsx` met 70 dataregels. Het downloadbestand in `public/downloads/LJ3_HV_OpenData.xlsx` is leidend. De dataset bevat voldoende extra regels en afleiders zodat het antwoord niet eenvoudig uit een korte tabel kan worden afgelezen.

Vraag A:
> Filter op `Kosten > 500`. Sorteer daarna op `Kosten`, van hoog naar laag. Welke code staat bovenaan?

Antwoord A: `E13`

Vraag B:
> Filter op `Woningtype = B`. Sorteer daarna op `Jaar`, van nieuw naar oud. Welke code staat bovenaan?

Antwoord B: `E02`

Scoring:
- 2 punten: antwoord A exact `E13`.
- 2 punten: antwoord B exact `E02`.

## PT5 — PowerPoint product

- Item-id: `lj3h-pt5-product`
- Itemtype: `powerpoint_design_task`
- Kerndoel: 22A, 21A
- Punten: 4

Leerlingtekst:
> Maak in PowerPoint een onderzoeksdia. Kies de beste onderdelen voor een duidelijke eindpresentatie.

Scenario:
> Je presenteert een conclusie uit data over energieverbruik. De dia moet de data eerlijk tonen en de bron duidelijk maken.

Keuzegroepen:
1. Kies de beste dia-indeling.
   - correct: `Titel, grafiek, korte conclusie en bron`
   - afleiders: `Alleen een grote grafiek zonder uitleg`, `Veel tekst zonder grafiek`, `Decoratieve dia zonder data`
2. Kies de beste titel.
   - correct: `Energieverbruik per woningtype`
   - afleiders: `Data`, `Mijn onderzoek`, `Grafiek`
3. Kies de beste inhoud.
   - correct: `Grafiek met legenda, bron en korte conclusie`
   - afleiders: `Alle ruwe data als kleine tekst`, `Een conclusie zonder bron of grafiek`, `Een opvallende afbeelding die niets met de data te maken heeft`
4. Kies de beste manier om te delen.
   - correct: `Exporteren als PDF`
   - afleiders: `Bewerkbare PowerPoint rondsturen`, `Opslaan als CSV`, `Alleen delen via screenshot`

Scoring:
- 1 punt per correct gekozen keuzegroep.

## PT6 — Videovergadering en schermdelen

- Item-id: `lj3h-pt6-meeting`
- Itemtype: `teams_share_simulation`
- Kerndoel: 21A, 23A, 23B
- Punten: 3

Scenario:
> Je wilt een video laten zien en horen. Op je scherm staat ook een privébericht en een cijferlijst open. Anderen mogen die niet zien.

Vensters: Hele scherm, Mediaspeler, Excel: Cijferlijst, Browser: Privébericht, Word: Werkstuk, Teams chat.

Scoring:
- 1 punt: Delen geopend.
- 1 punt: computergeluid aan.
- 1 punt: Mediaspeler gekozen en niet hele scherm.

## PT7 — Blokprogrammeren

- Item-id: `lj3h-pt7-programming`
- Itemtype: `block_programming_task`
- Kerndoel: 22B
- Punten: 4

Leerlingtekst:
> Maak een programma. Een sensor meet temperatuur en raamstand. Als temperatuur hoger is dan 25 én het raam open staat, toon `waarschuwing`. Anders toon `ok`.

Blokken:
- `bij start` — gebeurtenissen, `#ffb22e`
- `lees temperatuur` — waarnemen, `#2eb8a6`
- `lees raamstand` — waarnemen, `#2eb8a6`
- `als (temperatuur > 25) EN (raam = open) dan` — besturing, `#f47b32`
- `als (temperatuur > 25) OF (raam = open) dan` — besturing, `#f47b32`
- `als (temperatuur < 25) EN (raam = open) dan` — besturing, `#f47b32`
- `toon "waarschuwing"` — uiterlijk, `#8f5acb`
- `toon "ok"` — uiterlijk, `#8f5acb`
- `toon "koud"` — uiterlijk, `#8f5acb`
- `anders` — besturing, `#f47b32`
- `herhaal altijd` — besturing, `#f47b32`
- `verwijder temperatuur` — data, `#3f8edb`
- `zet temperatuur op 0` — variabelen, `#f2a23a`
- `speel alarmgeluid` — geluid, `#cf63c7`
- `draai Hulkbuster met de wijzers van de klok mee naar 180° in 1 sec.` — beweging, `#55a9dc`
- `verander animatie van Hulkbuster naar niet animeren` — uiterlijk, `#8f5acb`

Correct programma:
```text
bij start
lees temperatuur
lees raamstand
als (temperatuur > 25) EN (raam = open) dan
  toon "waarschuwing"
anders
  toon "ok"
```

Scoring:
- 1 punt: temperatuur en raamstand worden gelezen.
- 1 punt: juiste EN-voorwaarde gekozen.
- 1 punt: waarschuwing in juiste tak en ok in anders-tak.
- 1 punt: geen foutconditionele afleider of kritieke overbodige blokken. Het beoogde correcte programma bestaat uit 7 blokken.

## PT8 — Online gedrag: gemanipuleerde video en dark pattern

- Item-id: `lj3h-pt8-online`
- Itemtype: `social_action_simulation`
- Kerndoel: 21D, 21B, 23B, 23C
- Punten: 3

Situatie:
> Je ziet een video waarin een docent iets raars lijkt te zeggen. De video staat op een anoniem account. De mondbeweging klopt niet goed. Onder de video staat: “Deel dit voordat school het verwijdert.”

Opdracht:
1. Beoordeel de video.
2. Klik twee verdachte signalen aan.
3. Kies één verificatieactie.

Correct:
- beoordeling: waarschijnlijk gemanipuleerd of minstens twijfelachtig.
- signalen: anoniem account; mondbeweging klopt niet; urgentie “deel dit”; geen bron/context.
- verificatieactie: check via officiële school/mentor of betrouwbare bron.

Scoring:
- 1 punt: juiste beoordeling.
- 1 punt: minstens twee juiste signalen.
- 1 punt: juiste verificatieactie en niet delen.

## Selected response — LJ3 HAVO/VWO

### SR1 — AI en trainingsdata
- Item-id: `lj3h-sr1-ai`
- Kerndoel: 21D
- Punten: 1

Vraag: `Waarom kan een AI-systeem scheve of oneerlijke uitkomsten geven?`

Opties:
- Omdat trainingsdata onvolledig of scheef kunnen zijn.
- Omdat AI altijd neutraal is.
- Omdat AI geen data gebruikt.
- Omdat alleen internet langzaam is.

Correct: `Omdat trainingsdata onvolledig of scheef kunnen zijn.`

### SR2 — Regulering
- Item-id: `lj3h-sr2-society`
- Kerndoel: 23C
- Punten: 1

Vraag: `Waarom worden grote digitale platforms en AI-systemen vaak op EU-niveau gereguleerd?`

Opties:
- Omdat één land vaak te weinig invloed heeft op wereldwijde bedrijven.
- Omdat digitale regels alleen in Brussel mogen bestaan.
- Omdat alle techbedrijven in Nederland zitten.
- Omdat AI zonder regels altijd eerlijk is.

Correct: `Omdat één land vaak te weinig invloed heeft op wereldwijde bedrijven.`

---

# Codex-implementatieprompt

Gebruik deze prompt nadat dit bestand in de repo staat als `docs/nulmetingen_dg_v4_3_specificatie_aangepast.md`.

```text
Implementeer de definitieve nulmetingen Digitale Geletterdheid v4.3 exact op basis van:

docs/nulmetingen_dg_v4_3_specificatie_aangepast.md

Belangrijkste instructie:
Vervang de bestaande toetsinhoud exact door deze v4.3-specificatie. Verzin geen nieuwe items, vraagteksten, opties, afleiders, bestandsnamen, datasets, scoringsregels of correcte antwoorden.

Eisen:
- Vier versies: lj1-vmbo, lj1-hv, lj3-vmbo, lj3-hv.
- Maximumscore per versie: 32 punten.
- Zelfinschatting telt niet mee.
- Geen rubric-based scoring.
- Geen scorende open tekstvelden, behalve exacte korte codes uit downloadtaken.
- Geen live reverse image search.
- Gebruik Microsoft-/Office-achtige interfaces.
- Maak echte downloadbestanden voor de Excel/data-taken.
- PT1 moet een echte bestandsbeheersimulatie zijn.
- PT2 moet een echte Outlook-achtige mailinterface zijn met actieve knoppen.
- PT3 moet account-/apparaat-/security-acties als interfacehandelingen uitvoeren.
- PT4 moet echte Excel-downloadtaken gebruiken.
- PT5 moet een PowerPoint-achtige producttaak zijn met automatisch scorebare keuzes.
- PT6 moet een Teams-achtige schermdeelinterface gebruiken.
- PT7 moet een echte blokprogrammeerinterface gebruiken met meer blokken dan nodig.
- PT8 moet een socialmedia-/chat-/appactie-interface gebruiken.
- Selected-response-items mogen gewone gesloten vragen zijn.
- Antwoordopties bij selected-response-items randomiseren.
- UI-knoppen in Office-/Teams-/Outlook-simulaties niet randomiseren.
- Log per item: itemId, itemType, shownOptionOrder indien van toepassing, selectedAnswer/eindstate, correctheid, score, maxScore, timestamp en timeSpentMs.
- Houd Weet ik niet apart van randomisatie.

Technische stappen:
1. Inspecteer de huidige data/config, scoring en UI-components.
2. Maak of breid componenten uit volgens de componentdefinities in dit document.
3. Genereer of behoud de exacte Excel-downloadbestanden voor de data/sorteer- en filtertaken.
4. Implementeer alle vier versies.
5. Test alle vier versies op happy path.
6. Test minimaal één foutpad per performance task.
7. Controleer totaalscore 32.
8. Controleer export/logging.
9. Rapporteer gewijzigde bestanden, checks en resterende beperkingen.

Maak geen gewone meerkeuzevraag van een performance task als de specificatie een interfacehandeling, bestandshandeling, downloadtaak, drag/drop-taak of eindtoestand beschrijft.
```

# Downloadbestanden die Codex moet maken of behouden

Plaats bij voorkeur in `/public/downloads/`:

- `LJ1_VMBO_Liedjes.xlsx`
- `LJ1_HV_Bibliotheek.xlsx`
- `LJ3_VMBO_Bestellingen.xlsx`
- `LJ3_HV_OpenData.xlsx`

Excel-data:
- leerjaar 1-bestanden bevatten 60 dataregels;
- leerjaar 3-bestanden bevatten 70 dataregels;
- test sorteren en filteren in Excel Online en desktop-Excel.

# Minimale exportvelden

Resultaat per leerling moet minimaal bevatten:
- sessionId
- leerlingcode of anonieme code
- versie
- itemId
- itemType
- score
- maxScore
- totalScore
- percentage
- score per PT-blok
- selectedAnswer of eindstate
- correctheid
- timeSpentMs indien beschikbaar
- shownOptionOrder indien van toepassing
