# Alle vragen en afleiders - huidige implementatie

Bronbestand: `src/data/assessments.ts`

Let op: dit document bevat ook correcte antwoorden en scoringsinformatie. Gebruik dit document dus niet als leerlingmateriaal.

## Gedeelde niet-scorende vraag

### Zelfinschatting

- Item-id: `self-assessment`
- Vraag: Hoe digitaal geletterd schat je jezelf in?
- Antwoordopties:
  - bijna niet
  - redelijk
  - heel goed

## Gedeelde mailtaak: basis

Gebruikt in `lj1-vmbo`, `lj1-hv` en `lj3-vmbo`.

- Titel: Mail opstellen
- Instructie:

```text
Je moet een verslag voor Nederlands naar je mentor sturen. Stel hieronder een e-mail op. Let op de volgende punten:
- Zet het juiste mailadres op de juiste plek.
- Gebruik als onderwerp: 'Verslag Nederlands'.
- Voeg het juiste bestand toe aan de mail.
- Als je mail klaar is, klik op 'Verzenden'.
```

- Knoppen:
  - Verzenden
  - BCC tonen
  - Bestand bijvoegen
  - Hyperlink invoegen
  - Prioriteit
  - Concept opslaan
  - Verwijderen
- Contacten:
  - mentor@school.nl
  - vriend@school.nl
  - klasgroep@school.nl
  - administratie@school.nl
- Bestanden:
  - Verslag_Nederlands.docx
  - Foto_vakantie.jpg
  - Rooster.pdf
  - Muziek.mp3
- Correct/scoring:
  - Aan bevat `mentor@school.nl`
  - Onderwerp is `Verslag Nederlands`
  - Bijlage bevat `Verslag_Nederlands.docx`
  - Mail is verzonden

## Gedeelde mailtaak: geavanceerd

Gebruikt in `lj3-hv`.

- Titel: Mail opstellen
- Instructie:

```text
Je werkt met twee klasgenoten aan een onderzoeksverslag. Stel hieronder een e-mail op. Let op de volgende punten:
- Stuur de mail aan je mentor.
- Zet je projectgroep in CC.
- Gebruik als onderwerp: 'Onderzoeksverslag mediawijsheid'.
- Voeg het juiste verslag toe en klik op 'Verzenden'.
```

- Knoppen:
  - Verzenden
  - BCC tonen
  - Bestand bijvoegen
  - Hyperlink invoegen
  - Prioriteit
  - Concept opslaan
  - Verwijderen
- Contacten:
  - mentor@school.nl
  - projectgroep@school.nl
  - klasgroep@school.nl
  - administratie@school.nl
- Bestanden:
  - Onderzoeksverslag_mediawijsheid.docx
  - Bronnenlijst.xlsx
  - Foto_vakantie.jpg
  - Rooster.pdf
- Correct/scoring:
  - Aan bevat `mentor@school.nl`
  - CC bevat `projectgroep@school.nl`
  - Onderwerp is `Onderzoeksverslag mediawijsheid`
  - Bijlage bevat `Onderzoeksverslag_mediawijsheid.docx`
  - Mail is verzonden

## Gedeelde Teams-taak

Gebruikt in alle vier versies.

- Titel: PT6 - Videovergadering en schermdelen
- Instructie:

```text
Leerling Mark Canbers zit in een Teamsvergadering met zijn docent. Mark wil dat zijn docent een filmfragment hoort en ziet. Mark wil niet dat de docent ziet welke vensters Mark nog meer open heeft staan.

Kies de juiste instellingen zodat de docent alleen het filmfragment kan zien en horen.
```

- Scenario: Je zit in een Teams-achtige vergadering als Mark Canbers. Deel alleen het venster van Windows Media Player.
- Knoppen:
  - Camera
  - Microfoon
  - Chat
  - Deelnemers
  - Reageren
  - Delen
  - Meer
- Deelopties:
  - Scherm
  - Venster
- Vensteropties:
  - Browser - schoolsite
  - Word - Verslag Nederlands
  - Excel - Cijferlijst
  - Teams chat
  - Windows Media Player
- Correct/scoring:
  - Venster gekozen
  - Windows Media Player geselecteerd
  - Computergeluid aan

## lj1-vmbo - Leerjaar 1 VMBO

### PT1 - Bestanden en mappen

- Item-id: `lj1v-pt1-files`
- Instructie:

```text
Gebruik de Verkenner hieronder.
Maak alle opdrachten in de linkerkolom.
Let goed op de bestandsnamen.
Klik daarna op Taak afronden.
```

- Startmappen:
  - Thuis/OneDrive
  - Thuis/Downloads
  - Thuis/Documenten
  - Thuis/Afbeeldingen
- Startbestanden:
  - Thuis/OneDrive/Verslag_Nederlands.docx
  - Thuis/OneDrive/Presentatie_v1.pptx
  - Thuis/OneDrive/Foto_project.jpg
  - Thuis/Downloads/Installatiebestand.exe
  - Thuis/Documenten/Aantekeningen.docx
- Opdrachten:
  - Maak in OneDrive de map Schoolwerk.
  - Hernoem Presentatie_v1.pptx naar Presentatie_OUD.pptx.
  - Verplaats Verslag_Nederlands.docx naar Schoolwerk.
  - Maak in Schoolwerk de map Fotos en verplaats Foto_project.jpg daarheen.

### PT4 - Excel/data sorteren en filteren

- Item-id: `lj1v-pt4-excel`
- Instructie: Download LJ1_VMBO_Liedjes.xlsx. Open het in Excel. Klik op Bewerken inschakelen als Excel daarom vraagt.
- Bestand: `LJ1_VMBO_Liedjes.xlsx`
- Sheet: `Liedjes`
- Vragen:
  - Sorteer op Jaar, van nieuw naar oud. Welke code staat bovenaan?
    - Correct antwoord: `L09`
  - Filter op Genre = pop. Sorteer daarna op Jaar, van oud naar nieuw. Welke code staat bovenaan?
    - Correct antwoord: `L12`

### PT7 - Blokprogrammeren

- Item-id: `lj1v-pt7-programming`
- Intro: Dit is robot Bizzy. Programmeer Bizzy door codeblokken op het werkvlak te slepen.
- Instructie: Programmeer Bizzy zo:
- Stappen:
  - Laat Bizzy 1 meter vooruit bewegen.
  - Laat Bizzy 180 graden draaien.
  - Na 1 seconde zegt Bizzy: Hoi!
- Beschikbare blokken:
  - Wanneer er geklikt wordt op afspelen
  - wanneer er op Bizzy wordt geklikt
  - verander animatie van Bizzy naar niet animeren
  - Bizzy zegt "Hoi!"
  - verplaats Bizzy 1 meter vooruit in 1 sec.
  - draai Bizzy met de wijzers van de klok mee naar 180 graden in 1 sec.
  - herhaal 1 keer
  - speel geluid applaus
  - wacht 1 seconde
  - zet score op 0
  - verplaats Bizzy 5 meters achteruit in 1 sec.
- Correct programma:
  - Wanneer er geklikt wordt op afspelen
  - verplaats Bizzy 1 meter vooruit in 1 sec.
  - draai Bizzy met de wijzers van de klok mee naar 180 graden in 1 sec.
  - wacht 1 seconde
  - Bizzy zegt "Hoi!"

### PT8 - Online gedrag: delen en pesten

- Item-id: `lj1v-pt8-online`
- Instructie:

```text
Maak beide schermen af.
Scherm 1: kies wie de informatie mag zien.
Scherm 2: kies twee veilige acties.
```

- Scherm 1 - Deelinstellingen
  - Instructie: Kies bij elk kaartje de veiligste deelinstelling.
  - Kaartjes:
    - Wachtwoord voor Magister
    - Groepsplanning voor project
    - Poster voor de openbare open dag
  - Opties/afleiders:
    - Niet delen
    - Alleen mentor
    - Alleen projectgroep
    - Hele klas
    - Openbaar
  - Correct:
    - Wachtwoord voor Magister -> Niet delen
    - Groepsplanning voor project -> Alleen projectgroep
    - Poster voor de openbare open dag -> Openbaar
- Scherm 2 - Klassenapp
  - Instructie: In de klassenapp van klas 1V2 staat een bewerkte foto van Sam. Er staat: "Stuur door 😂". Sam zegt: "Stop, ik wil dit niet." Kies twee acties die jij zou doen.
  - Body: Rapporteren = via de meld-knop in de app aan de beheerder of het platform melden.
  - Opties/afleiders:
    - Doorsturen
    - Reactie plaatsen om de sfeer luchtig te houden
    - Rapporteren
    - Niet doorsturen
    - Aan mentor of vertrouwenspersoon melden
    - Een neutrale reactie plaatsen ('ik weet niet wat ik moet zeggen')
  - Correct:
    - Rapporteren
    - Niet doorsturen
    - Aan mentor of vertrouwenspersoon melden

### Selected response

#### SR1 - Wachtwoord
- Vraag: Welk wachtwoord is het veiligst?
- Opties:
  - Een lange zin die jij kunt onthouden: MijnGroeneFietsStaatNaastSchool
  - Je naam met een jaartal: Nora2026!
  - Een kort woord: fietsbel
  - Een rij op het toetsenbord: Qwerty!23
- Correct: Een lange zin die jij kunt onthouden: MijnGroeneFietsStaatNaastSchool

#### SR2 - Trage telefoon
- Vraag: De telefoon van Youssef is traag. Wat helpt meestal zonder foto's of accounts te wissen?
- Opties:
  - Ongebruikte apps of downloads opruimen en updates installeren.
  - De helderheid van het scherm verlagen.
  - Het toetsenbordgeluid uitzetten.
  - Alle foto's naar de prullenbak verplaatsen.
- Correct: Ongebruikte apps of downloads opruimen en updates installeren.

#### SR3 - AI-output controleren
- Vraag: Een chatbot geeft een antwoord voor je werkstuk. Je weet niet of het klopt. Wat kun je het best doen?
- Opties:
  - Ik controleer het in een andere bron.
  - Ik gebruik het meteen, want het klinkt netjes.
  - Ik vraag dezelfde chatbot om het nog eens te zeggen.
  - Ik deel het met mijn vrienden.
- Correct: Ik controleer het in een andere bron.

#### SR4 - Platformafhankelijkheid
- Vraag: Veel scholen gebruiken dezelfde grote app voor school en contact. Wat kan er dan misgaan?
- Opties:
  - Bij een storing kunnen veel scholen tegelijk niet bij hun berichten.
  - De app krijgt soms een ander icoon.
  - Leerlingen krijgen automatisch hetzelfde wachtwoord.
  - De telefoon van leerlingen wordt dan altijd sneller.
- Correct: Bij een storing kunnen veel scholen tegelijk niet bij hun berichten.

#### SR5 - Bron herkennen
- Vraag: Je leest koppen op internet. Welke kop lijkt het meest betrouwbaar?
- Opties:
  - Stadskrant Lentia, 10 juni 2026: Gemeente Lentia geeft geld aan jeugdsportclubs.
  - ONGELOOFLIJK!! Stadhuis Nijmegen schenkt geld weg!!!
  - Mijn mening over de gemeente
  - Jongeren zeggen op TikTok dat...
- Correct: Stadskrant Lentia, 10 juni 2026: Gemeente Lentia geeft geld aan jeugdsportclubs.

#### SR6 - Algoritmische selectie
- Vraag: Twee leerlingen kijken op TikTok en zien andere video's. Hoe komt dat meestal?
- Opties:
  - De app kijkt naar wat iemand eerder bekeek of leuk vond.
  - TikTok werkt niet altijd goed op elk apparaat.
  - Twee leerlingen zien altijd dezelfde video's.
  - Het komt alleen door het tijdstip van de dag.
- Correct: De app kijkt naar wat iemand eerder bekeek of leuk vond.

#### SR7 - AI controleren
- Vraag: Een AI-tool noemt een naam van een persoon. Je kunt die persoon nergens anders vinden. Wat is het meest waarschijnlijk?
- Opties:
  - De AI heeft de naam verzonnen.
  - Die persoon bestaat zeker, maar is niet beroemd.
  - De AI zegt altijd alleen kloppende dingen.
  - De persoon staat alleen in betaalde bronnen.
- Correct: De AI heeft de naam verzonnen.

#### SR8 - Auteursrecht en bronvermelding
- Vraag: Je vindt een mooie foto op internet voor je werkstuk. Wat doe je eerst?
- Opties:
  - Kijken of je de foto mag gebruiken en de bron erbij zetten.
  - Foto kopiëren en gebruiken; op internet is alles vrij.
  - Foto verkleinen, dan is hij van jou.
  - Foto bewerken in een app, dan mag het.
- Correct: Kijken of je de foto mag gebruiken en de bron erbij zetten.

#### SR9 - Digitale kloof
- Vraag: Niet alle leerlingen hebben thuis een goede laptop of snel internet. Waarom is dat een probleem?
- Opties:
  - Sommige leerlingen kunnen schoolwerk thuis moeilijker maken.
  - Hun laptop wordt sneller stuk.
  - Ze worden minder slim.
  - Ze mogen geen huiswerk meer maken.
- Correct: Sommige leerlingen kunnen schoolwerk thuis moeilijker maken.

#### SR10 - Energie en duurzaamheid
- Vraag: Welke optie verbruikt de meeste energie?
- Opties:
  - Een uur video streamen in hoge kwaliteit.
  - Een kort tekstbericht versturen.
  - Een foto opslaan in je galerij.
  - Een wekker instellen op je telefoon.
- Correct: Een uur video streamen in hoge kwaliteit.

## lj1-hv - Leerjaar 1 HAVO/VWO

### PT1 - Bestanden en mappen

- Item-id: `lj1h-pt1-files`
- Instructie:

```text
Gebruik de Verkenner hieronder.
Maak alle opdrachten in de linkerkolom.
Let goed op de bestandsnamen.
Klik daarna op Taak afronden.
```

- Startmappen:
  - Thuis/OneDrive
  - Thuis/Downloads
  - Thuis/Documenten
  - Thuis/Afbeeldingen
- Startbestanden:
  - Thuis/OneDrive/Boekverslag_Nederlands.docx
  - Thuis/OneDrive/Presentatie_Biologie_v1.pptx
  - Thuis/OneDrive/Diagram_Biologie.png
  - Thuis/OneDrive/Rooster.pdf
  - Thuis/Documenten/Aantekeningen.docx
- Opdrachten:
  - Maak de map Schoolwerk.
  - Maak in Schoolwerk de mappen Nederlands en Biologie.
  - Verplaats Boekverslag_Nederlands.docx naar Schoolwerk/Nederlands.
  - Verplaats Diagram_Biologie.png naar Schoolwerk/Biologie.

### PT4 - Excel/data sorteren en filteren

- Item-id: `lj1h-pt4-excel`
- Instructie: Download LJ1_HV_Bibliotheek.xlsx. Open het in Excel. Klik op Bewerken inschakelen als Excel daarom vraagt.
- Bestand: `LJ1_HV_Bibliotheek.xlsx`
- Sheet: `Boeken`
- Vragen:
  - Sorteer op Jaar, van nieuw naar oud. Welke code staat bovenaan?
    - Correct antwoord: `B07`
  - Filter op Vak = biologie. Sorteer daarna op Jaar, van oud naar nieuw. Welke code staat bovenaan?
    - Correct antwoord: `B06`

### PT7 - Blokprogrammeren

- Item-id: `lj1h-pt7-programming`
- Intro: Dit is robot Bizzy. Programmeer Bizzy door codeblokken op het werkvlak te slepen.
- Instructie: Programmeer Bizzy zo: laat Bizzy Hoi! zeggen en laat hem daarna drie keer 1 meter vooruit bewegen.
- Stappen:
  - Typ Hoi! in het zeg-blok.
  - Stel Herhaal in op 3 keer.
  - Stel verplaats in op 1 meter vooruit in 1 seconde.
  - Zet het verplaats-blok in de herhaling.
- Beschikbare blokken:
  - Wanneer er geklikt wordt op afspelen
  - verander animatie van Bizzy naar niet animeren
  - Bizzy zegt "Hoi!"
  - verplaats Bizzy 1 meter vooruit in 1 sec.
  - draai Bizzy met de wijzers van de klok mee naar 180 graden in 1 sec.
  - herhaal 1 keer
  - herhaal 10 keer
  - speel geluid applaus
  - wacht 1 seconde
  - stop alles
- Correct programma:
  - Wanneer er geklikt wordt op afspelen
  - Bizzy zegt "Hoi!"
  - herhaal 3 keer
  - verplaats Bizzy 1 meter vooruit in 1 sec.

### PT8 - Online gedrag: misleidende appmelding

- Item-id: `lj1h-pt8-online`
- Instructie:

```text
Een app probeert Silke steeds naar dezelfde keuze te sturen.
Open de instellingen.
Kies een veilige meldingsinstelling.
Klik daarna op Taak afronden.
```

- Scherm: Misleidende appmelding
- Instructie: Je krijgt een melding van een sociale app: "Zet meldingen aan zodat je niets mist!"
- Groep `promptAction`, opties/afleiders:
  - Nu niet
  - Oké
  - Instellingen
- Groep `notificationSetting`, opties/afleiders:
  - Meldingen aan
  - Meldingen uit
  - Meldingen beperkt
  - Account verwijderen
- Correct:
  - Instellingen
  - Meldingen uit of Meldingen beperkt
  - Niet `Oké`; niet `Account verwijderen`

### Selected response

#### SR1 - Wachtwoord
- Vraag: Welk wachtwoord is het veiligst?
- Opties: BlauweTreinLampSchoolTas; Herfst2026; Welkom123!; 11112222
- Correct: BlauweTreinLampSchoolTas

#### SR2 - Verdachte mail over rooster
- Vraag: Wat kan Sanne het best doen?
- Stimulus: niet-interactieve e-mailmock-up over een nieuw rooster met een verdachte afzender en roosterlink.
- Opties:
  - Niet op de link klikken en haar rooster via de schoolapp of bekende schoolsite controleren.
  - Op de link klikken, want het bericht gaat over school.
  - De mail doorsturen naar de klas zodat iedereen zijn rooster kan openen.
  - Inloggen via de knop omdat de mail zegt dat het vandaag moet.
  - Ik weet het niet.
- Correct: Niet op de link klikken en haar rooster via de schoolapp of bekende schoolsite controleren.

#### SR3 - Toegang weigeren
- Vraag: Je krijgt op je leeromgeving de melding "Je hebt geen toegang tot Werkstuk.docx". Wat kun je het best doen?
- Opties:
  - Toegang aanvragen bij de eigenaar.
  - Het wachtwoord van een klasgenoot lenen.
  - Het bestand openbaar laten maken.
  - Via een onbekende link downloaden.
- Correct: Toegang aanvragen bij de eigenaar.

#### SR4 - AI verifiëren
- Vraag: Een AI-tool noemt een jaartal zonder bron. Welke controle is het sterkst?
- Opties:
  - Controleren in een onafhankelijke betrouwbare bron.
  - De vraag opnieuw stellen aan dezelfde AI.
  - Kijken of de tekst zeker klinkt.
  - Het antwoord gebruiken als het lang genoeg is.
- Correct: Controleren in een onafhankelijke betrouwbare bron.

#### SR5 - Steekproef en generaliseerbaarheid
- Vraag: Een dataset bevat alleen antwoorden van leerlingen uit 1 klas. Waar moet je voor oppassen?
- Opties:
  - Je kunt niet zomaar zeggen dat dit voor alle leerlingen geldt.
  - Een klas is altijd genoeg om iets over heel Nederland te zeggen.
  - De dataset is automatisch fout.
  - Meer data maakt nooit verschil.
- Correct: Je kunt niet zomaar zeggen dat dit voor alle leerlingen geldt.

#### SR6 - Bron en autoriteit
- Vraag: Welke bron is naar verwachting het betrouwbaarst voor een werkstuk over klimaat?
- Opties:
  - Een artikel van het KNMI met datum en auteur.
  - Een viral TikTok van een influencer met veel volgers.
  - Een blog zonder auteursnaam met sterke meningen.
  - Een meme met cijfers.
- Correct: Een artikel van het KNMI met datum en auteur.

#### SR7 - Algoritme en feed
- Vraag: Twee leerlingen krijgen op Instagram totaal andere posts te zien. Wat is de belangrijkste oorzaak?
- Opties:
  - Het algoritme kiest posts op basis van eerder gedrag van de gebruiker.
  - Instagram laadt andere posts bij verschillend internet.
  - Iedereen ziet eigenlijk dezelfde posts.
  - Posts worden willekeurig getoond.
- Correct: Het algoritme kiest posts op basis van eerder gedrag van de gebruiker.

#### SR8 - AI controleren
- Vraag: Een AI-chatbot noemt een wetenschappelijk artikel dat je nergens kunt vinden. Wat is het meest waarschijnlijk?
- Opties:
  - De AI heeft het artikel waarschijnlijk verzonnen.
  - Het artikel staat misschien in een onbekend tijdschrift.
  - Het artikel is mogelijk nog niet openbaar gepubliceerd.
  - Je zoekterm kan te breed of te smal zijn.
- Correct: De AI heeft het artikel waarschijnlijk verzonnen.

#### SR9 - Creative Commons
- Vraag: Je gebruikt een afbeelding met een Creative Commons BY-licentie in je presentatie. Wat moet je dan doen?
- Opties:
  - De maker noemen (naamsvermelding).
  - Niets, CC-BY betekent dat alles vrij is.
  - Toestemming vragen via e-mail.
  - De afbeelding alleen voor commercieel gebruik gebruiken.
- Correct: De maker noemen (naamsvermelding).

#### SR10 - Digitale ongelijkheid
- Vraag: Wat is een gevolg van het feit dat niet alle leerlingen thuis een goede laptop en snel internet hebben?
- Opties:
  - Schoolwerk en kansen worden ongelijk verdeeld tussen leerlingen.
  - Leerlingen zonder laptop worden minder slim.
  - Internet wordt voor iedereen langzamer.
  - De school moet voor iedereen betalen.
- Correct: Schoolwerk en kansen worden ongelijk verdeeld tussen leerlingen.

## lj3-vmbo - Leerjaar 3 VMBO

### PT1 - Bestanden en mappen

- Item-id: `lj3v-pt1-files`
- Instructie:

```text
Gebruik de Verkenner hieronder.
Maak alle opdrachten in de linkerkolom.
Let goed op mappen en bestandsnamen.
Klik daarna op Taak afronden.
```

- Startmappen:
  - Thuis/OneDrive
  - Thuis/OneDrive/Project_stage
- Startbestanden:
  - Thuis/OneDrive/Project_stage/Plan_stage_v1.docx
  - Thuis/OneDrive/Project_stage/Plan_stage_DEF.docx
  - Thuis/OneDrive/Project_stage/Foto_stage.jpg
  - Thuis/OneDrive/Project_stage/Notities.txt
- Opdrachten:
  - Maak de map Archief in Project_stage.
  - Verplaats Plan_stage_v1.docx naar Archief.
  - Hernoem Plan_stage_DEF.docx naar Plan_stage_eindversie.docx.
  - Maak de map Beelden en verplaats Foto_stage.jpg daarheen.

### PT3 - Account, apparaat en verbinding beveiligen

- Item-id: `lj3v-pt3-security`
- Instructie: Kies veilige acties bij twee meldingen op je telefoon.
- Scherm 1 - Verdachte update
  - Instructie: Je krijgt deze melding op je telefoon: je videospeler is verouderd. Klik hier om update.exe te downloaden.
  - Opties/afleiders:
    - Download update.exe
    - Sluit melding
    - Open officiële app/instellingen voor updates
    - Sta meldingen altijd toe
  - Correct:
    - Niet `Download update.exe`
    - Open officiële app/instellingen voor updates
- Scherm 2 - Verdachte login
  - Instructie: Je krijgt deze melding op je telefoon: nieuwe login op je schoolaccount vanaf onbekend apparaat.
  - Opties/afleiders:
    - Officiële accountbeveiliging openen
    - Wachtwoord wijzigen
    - Sessie/apparaat controleren
    - Bericht negeren
    - Wachtwoord naar vriend sturen
  - Correct:
    - Officiële accountbeveiliging openen
    - Sessie/apparaat controleren of wachtwoord wijzigen

### PT4 - Excel/data sorteren en filteren

- Item-id: `lj3v-pt4-excel`
- Instructie: Download LJ3_VMBO_Bestellingen.xlsx. Open het in Excel. Klik op Bewerken inschakelen als Excel daarom vraagt.
- Bestand: `LJ3_VMBO_Bestellingen.xlsx`
- Sheet: `Bestellingen`
- Vragen:
  - Filter op Categorie = elektronica. Sorteer daarna op Jaar, van nieuw naar oud. Welke code staat bovenaan?
    - Correct antwoord: `W02`
  - Filter op Bedrag > 60. Sorteer daarna op Bedrag, van hoog naar laag. Welke code staat bovenaan?
    - Correct antwoord: `W06`

### PT7 - Blokprogrammeren

- Item-id: `lj3v-pt7-programming`
- Intro: Dit is robot Bizzy. Programmeer Bizzy door codeblokken op het werkvlak te slepen.
- Instructie: Programmeer Bizzy zo: laat Bizzy dansen, 2 meter vooruit bewegen, 90 graden draaien en daarna Hoi! zeggen.
- Stappen:
  - Kies Dansen bij het animatieblok.
  - Stel verplaats in op 2 meter vooruit in 1 seconde.
  - Stel draaien in op 90 graden in 1 seconde.
  - Typ Hoi! in het zeg-blok.
- Beschikbare blokken:
  - Wanneer er geklikt wordt op afspelen
  - verander animatie van Bizzy naar niet animeren
  - Bizzy zegt "Hoi!"
  - verplaats Bizzy 1 meter vooruit in 1 sec.
  - draai Bizzy met de wijzers van de klok mee naar 180 graden in 1 sec.
  - herhaal 1 keer
  - speel geluid applaus
  - wacht 1 seconde
  - stop alles
- Correct programma:
  - Wanneer er geklikt wordt op afspelen
  - verander animatie van Bizzy naar Dansen
  - verplaats Bizzy 2 meter vooruit in 1 sec.
  - draai Bizzy met de wijzers van de klok mee naar 90 graden in 1 sec.
  - Bizzy zegt "Hoi!"

### PT8 - Online gedrag: deepfake/pesten

- Item-id: `lj3v-pt8-online`
- Instructie:

```text
Bekijk de situatie.
Kies twee signalen.
Kies twee veilige acties.
```

- Scherm: Deepfake/pesten
- Instructie: In de klassenapp van klas 3V2 verschijnt een AI-gemaakte afbeelding van een leerling in een beschamende situatie. Iemand schrijft: "Dit is echt, stuur door." De handen zien er vreemd uit. De leerling reageert: "Dit ben ik niet."
- Body: Rapporteren = via de meld-knop in de app aan de beheerder of het platform melden. Bewijs bewaren = de afbeelding/het bericht opslaan voor je het bericht verlaat, zodat het later getoond kan worden.
- Groep `judgement`, opties/afleiders:
  - echt
  - twijfelachtig
  - waarschijnlijk nep of AI
  - Correct: waarschijnlijk nep of AI
- Groep `signals`, opties/afleiders:
  - vreemde handen
  - leerling ontkent
  - schadelijke context
  - Correct: minstens twee van deze opties
- Groep `actions`, opties/afleiders:
  - niet doorsturen
  - rapporteren
  - bewijs bewaren
  - melden bij mentor/vertrouwde volwassene
  - Correct: minstens twee van deze opties

### Selected response

#### SR1 - AI controleren
- Vraag: Een AI-chatbot geeft een zelfverzekerd antwoord zonder bron. Wat is de beste eerste controle?
- Opties:
  - De informatie controleren in een onafhankelijke bron.
  - De tekst gebruiken omdat hij zelfverzekerd klinkt.
  - Dezelfde vraag opnieuw stellen aan dezelfde chatbot.
  - Alleen controleren of er moeilijke woorden in staan.
- Correct: De informatie controleren in een onafhankelijke bron.

#### SR2 - Platformafhankelijkheid
- Vraag: Scholen en bedrijven gebruiken vaak dezelfde grote techbedrijven. Wat kan er misgaan?
- Opties:
  - Een storing of nieuwe regel kan veel mensen tegelijk raken.
  - Een bedrijf heeft dan minder werknemers nodig.
  - Internet wordt sneller bij minder providers.
  - Wachtwoorden zijn dan niet meer nodig.
- Correct: Een storing of nieuwe regel kan veel mensen tegelijk raken.

#### SR3 - Bronkwaliteit
- Vraag: Welke bron geeft naar verwachting de meest betrouwbare informatie over een gezondheidsvraag?
- Opties:
  - Een artikel op Thuisarts.nl van een arts.
  - Een YouTuber die zijn ervaring deelt.
  - Een advertentie voor pillen.
  - Een groepsapp met klasgenoten.
- Correct: Een artikel op Thuisarts.nl van een arts.

#### SR4 - AI bias en trainingsdata
- Vraag: Een AI laat alleen mannen zien als je vraagt om een afbeelding van "een directeur". Wat is de meest waarschijnlijke oorzaak?
- Opties:
  - De AI heeft vooral voorbeelden met mannen in die rol geleerd.
  - De AI vindt mannen aardiger.
  - Vrouwen zijn nooit directeur.
  - Het programma is kapot.
- Correct: De AI heeft vooral voorbeelden met mannen in die rol geleerd.

#### SR5 - Auteursrecht en bronvermelding
- Vraag: Je gebruikt een foto in je werkstuk. Wat moet je doen?
- Opties:
  - Maker noemen en bron vermelden.
  - Foto bewerken zodat je hem als eigen werk kan gebruiken.
  - Foto kleiner maken; dan is het geen kopie.
  - Foto direct kopiëren; op internet mag alles.
- Correct: Maker noemen en bron vermelden.

#### SR6 - Streaming en energie
- Vraag: Wat is een belangrijk gevolg van het massaal kijken van streaming-video?
- Opties:
  - Datacenters verbruiken veel energie.
  - Internetkabels worden korter.
  - Telefoons worden zwaarder.
  - Beeld wordt vanzelf scherper.
- Correct: Datacenters verbruiken veel energie.

## lj3-hv - Leerjaar 3 HAVO/VWO

### PT1 - Bestanden en mappen

- Item-id: `lj3h-pt1-files`
- Instructie:

```text
Gebruik de Verkenner hieronder.
Maak alle opdrachten in de linkerkolom.
Let goed op mappen en bestandsnamen.
Klik daarna op Taak afronden.
```

- Startmappen:
  - Thuis/OneDrive
  - Thuis/OneDrive/Onderzoek
- Startbestanden:
  - Thuis/OneDrive/Onderzoek/Onderzoek_v1.docx
  - Thuis/OneDrive/Onderzoek/Onderzoek_v2.docx
  - Thuis/OneDrive/Onderzoek/Onderzoek_DEF.docx
  - Thuis/OneDrive/Onderzoek/Bronnen.xlsx
  - Thuis/OneDrive/Onderzoek/Afbeelding_CC_BY.png
- Opdrachten:
  - Maak de map Archief.
  - Verplaats Onderzoek_v1.docx en Onderzoek_v2.docx naar Archief.
  - Hernoem Onderzoek_DEF.docx naar Onderzoek_eindversie.docx.
  - Maak map Bronnen_en_media en verplaats Bronnen.xlsx en Afbeelding_CC_BY.png daarnaartoe.

### PT3 - Account, apparaat en verbinding beveiligen

- Item-id: `lj3h-pt3-security`
- Instructie: Kies veilige acties bij een bestand en een loginmelding.
- Scherm 1 - Macro-waarschuwing
  - Instructie: Je ontvangt een bestand: Factuur_stage.xlsm. Macro's zijn uitgeschakeld. Het bestand komt van een onbekende afzender.
  - Opties/afleiders:
    - Macro's inschakelen
    - Afzender controleren
    - Bestand melden bij ICT
    - Bestand als vertrouwd markeren
    - Bestand doorsturen naar klasgroep
  - Correct:
    - Macro's niet inschakelen
    - Afzender controleren of Bestand melden bij ICT
- Scherm 2 - Verdachte login
  - Instructie: Je krijgt deze melding op je telefoon: nieuwe login op je schoolaccount vanaf onbekend apparaat.
  - Opties/afleiders:
    - Officiële accountbeveiliging openen
    - Sessie/apparaten controleren
    - Wachtwoord wijzigen
    - Tweestapsverificatie controleren/aanzetten
    - Bericht negeren
    - Wachtwoord naar vriend sturen
  - Correct:
    - Officiële accountbeveiliging openen
    - Sessie/apparaten controleren, Wachtwoord wijzigen of Tweestapsverificatie controleren/aanzetten

### PT4 - Excel/data sorteren en filteren

- Item-id: `lj3h-pt4-excel`
- Instructie: Download LJ3_HV_OpenData.xlsx. Open het in Excel. Klik op Bewerken inschakelen als Excel daarom vraagt.
- Bestand: `LJ3_HV_OpenData.xlsx`
- Sheet: `Energie`
- Vragen:
  - Filter op Kosten > 500. Sorteer daarna op Kosten, van hoog naar laag. Welke code staat bovenaan?
    - Correct antwoord: `E13`
  - Filter op Woningtype = B. Sorteer daarna op Jaar, van nieuw naar oud. Welke code staat bovenaan?
    - Correct antwoord: `E02`

### PT7 - Blokprogrammeren

- Item-id: `lj3h-pt7-programming`
- Intro: Dit is robot Bizzy. Programmeer Bizzy door codeblokken op het werkvlak te slepen.
- Instructie: Programmeer Bizzy zo: laat Bizzy lopen, herhaal twee keer een beweging van 1 meter vooruit en laat Bizzy daarna Hoi! zeggen.
- Stappen:
  - Kies Lopen bij het animatieblok.
  - Stel Herhaal in op 2 keer.
  - Stel verplaats in op 1 meter vooruit in 1 seconde en zet dit in de herhaling.
  - Typ Hoi! in het zeg-blok.
- Beschikbare blokken:
  - Wanneer er geklikt wordt op afspelen
  - verander animatie van Bizzy naar niet animeren
  - Bizzy zegt "Hoi!"
  - verplaats Bizzy 1 meter vooruit in 1 sec.
  - draai Bizzy met de wijzers van de klok mee naar 180 graden in 1 sec.
  - herhaal 1 keer
  - speel geluid applaus
  - wacht 1 seconde
  - stop alles
- Correct programma:
  - Wanneer er geklikt wordt op afspelen
  - verander animatie van Bizzy naar Lopen
  - herhaal 2 keer
  - verplaats Bizzy 1 meter vooruit in 1 sec.
  - Bizzy zegt "Hoi!"

### PT8 - Online gedrag: gemanipuleerde video

- Item-id: `lj3h-pt8-online`
- Instructie:

```text
Beoordeel de video.
Kies twee verdachte signalen.
Kies een verificatieactie.
```

- Scherm: Gemanipuleerde video
- Instructie: Je ziet op een sociaal platform een video waarin een docent iets raars lijkt te zeggen. De video staat op een anoniem account zonder profielinformatie. De mondbeweging klopt niet goed met de stem. Onder de video staat: "Deel dit voordat school het verwijdert." Er is geen bron of context.
- Body: Verifiëren = de informatie controleren via een officieel kanaal (bv. de school zelf, je mentor, een betrouwbare nieuwsbron).
- Groep `judgement`, opties/afleiders:
  - waarschijnlijk echt
  - twijfelachtig
  - waarschijnlijk gemanipuleerd of nep
  - Correct: waarschijnlijk gemanipuleerd of nep
- Groep `signals`, opties/afleiders:
  - anoniem account
  - mondbeweging klopt niet
  - urgentie "deel dit"
  - geen bron/context
  - Correct: minstens twee van deze opties
- Groep `verifyAction`, opties/afleiders:
  - Check via officiele school/mentor of betrouwbare bron
  - Deel de video in de klas om te vragen of het klopt
  - Kijk alleen naar de reacties onder de video
  - Correct: Check via officiele school/mentor of betrouwbare bron

### Selected response

#### SR1 - AI bias en trainingsdata
- Vraag: Waarom kan een AI-systeem scheve of oneerlijke uitkomsten geven?
- Opties:
  - Omdat trainingsdata onvolledig of scheef kunnen zijn.
  - Omdat de vraag soms niet precies genoeg is.
  - Omdat het systeem op een druk moment trager werkt.
  - Omdat de gebruiker een nieuw account heeft.
- Correct: Omdat trainingsdata onvolledig of scheef kunnen zijn.

#### SR2 - Regulering
- Vraag: Waarom worden grote digitale platforms en AI-systemen vaak op EU-niveau gereguleerd?
- Opties:
  - Omdat één land vaak te weinig invloed heeft op wereldwijde bedrijven.
  - Omdat alleen Brussel mag beslissen over digitale regels.
  - Omdat alle techbedrijven in Nederland zitten.
  - Omdat AI zonder regels altijd eerlijk werkt.
- Correct: Omdat één land vaak te weinig invloed heeft op wereldwijde bedrijven.

#### SR3 - AI-bron controleren
- Vraag: Een AI-tool noemt een wetenschappelijk artikel met titel en auteurs. Je vindt het artikel niet in zoeksystemen. Wat is waarschijnlijk?
- Opties:
  - De AI heeft het artikel waarschijnlijk verzonnen.
  - Het artikel staat mogelijk in een tijdschrift zonder open toegang.
  - Je zoekt misschien in een database die niet alles indexeert.
  - De titel kan licht anders gespeld zijn in de bron.
- Correct: De AI heeft het artikel waarschijnlijk verzonnen.

#### SR4 - Filter bubble en polarisatie
- Vraag: Wat is een mogelijk maatschappelijk effect van algoritmische selectie van nieuws?
- Opties:
  - Mensen zien vaker berichten die hun eigen mening bevestigen.
  - Iedereen ziet uiteindelijk hetzelfde nieuws.
  - Nieuws wordt automatisch waar.
  - Algoritmes verminderen verschil van mening.
- Correct: Mensen zien vaker berichten die hun eigen mening bevestigen.

#### SR5 - Open licenties
- Vraag: Wat betekent het als content een Creative Commons BY-SA-licentie heeft?
- Opties:
  - Je noemt de maker en deelt jouw versie onder dezelfde licentie.
  - Je mag het alleen voor commercieel gebruik gebruiken.
  - Je hoeft niets te vermelden.
  - Het mag alleen op papier worden gedeeld.
- Correct: Je noemt de maker en deelt jouw versie onder dezelfde licentie.

#### SR6 - Energie en duurzaamheid
- Vraag: Welk aspect maakt het trainen van grote AI-modellen relatief energie-intensief?
- Opties:
  - Het rekenen op grote datasets vereist langdurig veel rekenkracht in datacenters.
  - De modellen worden vooral getraind op gewone laptops van gebruikers.
  - De meeste energie gaat naar het tonen van het icoon van de app.
  - Na de training gebruikt een AI-systeem geen elektriciteit meer.
- Correct: Het rekenen op grote datasets vereist langdurig veel rekenkracht in datacenters.

