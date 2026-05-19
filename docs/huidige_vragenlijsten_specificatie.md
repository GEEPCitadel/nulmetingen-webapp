# Specificatie huidige vragenlijsten

Laatste inhoudscontrole: 17 mei 2026.

Deze specificatie beschrijft de vragenlijsten zoals ze nu in de app zijn geimplementeerd. De technische bron voor deze inhoud is:

`src/data/assessments.ts`

De app bevat vier versies:

- `lj1-vmbo` - Leerjaar 1 VMBO
- `lj1-hv` - Leerjaar 1 HAVO/VWO
- `lj3-vmbo` - Leerjaar 3 VMBO
- `lj3-hv` - Leerjaar 3 HAVO/VWO

Alle versies bevatten eerst een niet-scorende zelfinschatting. Praktische taken scoren automatisch via vaste condities. Meerkeuzevragen hebben gerandomiseerde antwoordopties in de app.

## Gedeelde taken

### Zelfinschatting

- Item-id: `self-assessment`
- Type: `self_assessment`
- Score: 0 punten
- Vraag: Hoe digitaal geletterd schat je jezelf in?
- Schaal: `bijna niet`, `redelijk`, `heel goed`

### Mail opstellen - basisvariant

Gebruikt bij `lj1-vmbo`, `lj1-hv` en `lj3-vmbo`.

- Type: `outlook_mail_simulation`
- Score: 4 punten
- Opdracht: stel een mail op aan de mentor over een verslag Nederlands.
- Vereist:
  - `mentor@school.nl` staat in Aan.
  - Onderwerp is exact `Verslag Nederlands`.
  - Bijlage `Verslag_Nederlands.docx` is toegevoegd.
  - Mail is verzonden.
- Beschikbare contacten: `administratie@school.nl`, `klasgroep@school.nl`, `mentor@school.nl`, `vriend@school.nl`
- Beschikbare bestanden: `Foto_vakantie.jpg`, `Muziek.mp3`, `Rooster.pdf`, `Verslag_Nederlands.docx`

### Mail opstellen - geavanceerde variant

Gebruikt bij `lj3-hv`.

- Type: `outlook_mail_simulation`
- Score: 4 punten
- Opdracht: stel een mail op aan de mentor, zet de projectgroep in CC en voeg het onderzoeksverslag toe.
- Vereist:
  - `mentor@school.nl` staat in Aan.
  - `projectgroep@school.nl` staat in CC.
  - Onderwerp is exact `Onderzoeksverslag mediawijsheid`.
  - Bijlage `Onderzoeksverslag_mediawijsheid.docx` is toegevoegd en mail is verzonden.
- Beschikbare contacten: `administratie@school.nl`, `klasgroep@school.nl`, `mentor@school.nl`, `projectgroep@school.nl`
- Beschikbare bestanden: `Bronnenlijst.xlsx`, `Foto_vakantie.jpg`, `Onderzoeksverslag_mediawijsheid.docx`, `Rooster.pdf`

### Videovergadering en schermdelen

Gebruikt bij alle vier versies.

- Type: `teams_share_simulation`
- Score: 3 punten
- Context: Mark Canbers zit in een Teams-achtige vergadering en moet alleen het venster van Windows Media Player delen, met computergeluid.
- Vereist:
  - Na `Delen` wordt `Venster` gekozen.
  - `Windows Media Player` wordt geselecteerd.
  - Computergeluid staat aan.
- Vensterkeuzes: `Browser - schoolsite`, `Word - Verslag Nederlands`, `Excel - Cijferlijst`, `Teams chat`, `Windows Media Player`

## Leerjaar 1 VMBO (`lj1-vmbo`)

### PT1 - Bestanden en mappen

- Item-id: `lj1v-pt1-files`
- Score: 4 punten
- Startbestanden:
  - `Thuis/OneDrive/Verslag_Nederlands.docx`
  - `Thuis/OneDrive/Presentatie_v1.pptx`
  - `Thuis/OneDrive/Foto_project.jpg`
  - `Thuis/Downloads/Installatiebestand.exe`
  - `Thuis/Documenten/Aantekeningen.docx`
- Opdrachten:
  - Maak in OneDrive de map `Schoolwerk`.
  - Hernoem `Presentatie_v1.pptx` naar `Presentatie_OUD.pptx`.
  - Verplaats `Verslag_Nederlands.docx` naar `Schoolwerk`.
  - Maak in `Schoolwerk` de map `Fotos` en verplaats `Foto_project.jpg` daarheen.

### PT4 - Excel/data sorteren en filteren

- Item-id: `lj1v-pt4-excel`
- Bestand: `LJ1_VMBO_Liedjes.xlsx`
- Sheet: `Liedjes`
- Score: 4 punten
- Vragen:
  - Sorteer op Jaar, van nieuw naar oud. Code bovenaan: `L09`.
  - Filter op Genre = pop. Sorteer daarna op Jaar, van oud naar nieuw. Code bovenaan: `L12`.

### PT7 - Blokprogrammeren

- Item-id: `lj1v-pt7-programming`
- Robot: Bizzy
- Score: 4 punten
- Instructie: Programmeer Bizzy zo:
  - Laat Bizzy 1 meter vooruit bewegen.
  - Laat Bizzy 180 graden draaien.
  - Na 1 seconde zegt Bizzy: Hoi!
- Scoring:
  - 1 punt: Bizzy beweegt 1 meter vooruit.
  - 1 punt: Bizzy draait 180 graden.
  - 1 punt: Bizzy wacht 1 seconde voordat hij praat.
  - 1 punt: Bizzy zegt `Hoi!` na uitvoeren.

### PT8 - Online gedrag: delen en pesten

- Item-id: `lj1v-pt8-online`
- Score: 3 punten
- Scherm 1: kies veilige deelinstellingen.
  - Wachtwoord voor Magister: `Niet delen`
  - Groepsplanning voor project: `Alleen projectgroep`
  - Poster voor de openbare open dag: `Openbaar`
- Scherm 2: klassenapp met bewerkte foto van Sam.
  - Correcte acties: `Niet doorsturen`, `Rapporteren`, `Aan mentor of vertrouwenspersoon melden`
  - Schadelijke acties: `Doorsturen`, `Reactie plaatsen om de sfeer luchtig te houden`

### Selected response

| ID | Vraagkern | Correct antwoord |
| --- | --- | --- |
| `lj1v-sr1-pw` | Veiligste wachtwoord | Een lange zin: `MijnGroeneFietsStaatNaastSchool` |
| `lj1v-sr2-device` | Trage telefoon | Ongebruikte apps/downloads opruimen en updates installeren |
| `lj1v-sr3-ai-check` | AI-antwoord controleren | Controleren in een andere bron |
| `lj1v-sr4-platform` | Platformafhankelijkheid | Storing kan veel scholen tegelijk raken |
| `lj1v-sr5-source` | Betrouwbare bron | Stadskrant Lentia met datum en concreet nieuws |
| `lj1v-sr6-algorithm` | Verschillende TikTok-video's | App kijkt naar eerder gedrag |
| `lj1v-sr7-hallucination` | Onvindbare AI-persoon | AI heeft de naam verzonnen |
| `lj1v-sr8-copyright` | Foto gebruiken | Kijken of het mag en bron vermelden |
| `lj1v-sr9-divide` | Digitale kloof | Sommige leerlingen kunnen schoolwerk moeilijker maken |
| `lj1v-sr10-energy` | Energieverbruik | Een uur video streamen in hoge kwaliteit |

## Leerjaar 1 HAVO/VWO (`lj1-hv`)

### PT1 - Bestanden en mappen

- Item-id: `lj1h-pt1-files`
- Score: 4 punten
- Startbestanden:
  - `Thuis/OneDrive/Boekverslag_Nederlands.docx`
  - `Thuis/OneDrive/Presentatie_Biologie_v1.pptx`
  - `Thuis/OneDrive/Diagram_Biologie.png`
  - `Thuis/OneDrive/Rooster.pdf`
  - `Thuis/Documenten/Aantekeningen.docx`
- Opdrachten:
  - Maak de map `Schoolwerk`.
  - Maak in `Schoolwerk` de mappen `Nederlands` en `Biologie`.
  - Verplaats `Boekverslag_Nederlands.docx` naar `Schoolwerk/Nederlands`.
  - Verplaats `Diagram_Biologie.png` naar `Schoolwerk/Biologie`.

### PT4 - Excel/data sorteren en filteren

- Item-id: `lj1h-pt4-excel`
- Bestand: `LJ1_HV_Bibliotheek.xlsx`
- Sheet: `Boeken`
- Score: 4 punten
- Vragen:
  - Sorteer op Jaar, van nieuw naar oud. Code bovenaan: `B07`.
  - Filter op Vak = biologie. Sorteer daarna op Jaar, van oud naar nieuw. Code bovenaan: `B06`.

### PT7 - Blokprogrammeren

- Item-id: `lj1h-pt7-programming`
- Robot: Bizzy
- Score: 4 punten
- Opdracht: laat Bizzy `Hoi!` zeggen en daarna drie keer 1 meter vooruit bewegen.
- Scoring:
  - 1 punt: Bizzy zegt `Hoi!`.
  - 1 punt: `herhaal 3 keer` met verplaatsblok als geneste body.
  - 1 punt: verplaatsing ingesteld op 1 meter in 1 seconde.
  - 1 punt: eindgedrag klopt en kritieke afleider `herhaal 10 keer` is niet gebruikt.

### PT8 - Online gedrag: misleidende appmelding

- Item-id: `lj1h-pt8-online`
- Score: 3 punten
- Situatie: een app stuurt richting volledige meldingen.
- Vereist:
  - `Instellingen` openen.
  - `Meldingen uit` of `Meldingen beperkt` kiezen.
  - Niet akkoord gaan met volledige notificaties en account niet verwijderen.

### Selected response

| ID | Vraagkern | Correct antwoord |
| --- | --- | --- |
| `lj1h-sr1-pw` | Veiligste wachtwoord | `BlauweTreinLampSchoolTas` |
| `lj1h-sr2-https` | Versleutelde verbinding | Slotje of `https://` |
| `lj1h-sr3-access` | Geen toegang tot bestand | Toegang aanvragen bij eigenaar |
| `lj1h-sr4-ai-verify` | AI-jaartal zonder bron | Onafhankelijke betrouwbare bron controleren |
| `lj1h-sr5-sample` | Dataset uit 1 klas | Niet generaliseren naar alle leerlingen |
| `lj1h-sr6-source` | Klimaatbron | Artikel van KNMI met datum en auteur |
| `lj1h-sr7-algorithm` | Instagram-feed | Algoritme kiest op basis van eerder gedrag |
| `lj1h-sr8-hallucination` | Onvindbaar AI-artikel | AI heeft het artikel waarschijnlijk verzonnen |
| `lj1h-sr9-cc` | CC BY-afbeelding | Maker noemen |
| `lj1h-sr10-divide` | Digitale ongelijkheid | Schoolwerk en kansen worden ongelijk verdeeld |

## Leerjaar 3 VMBO (`lj3-vmbo`)

### PT1 - Bestanden en mappen

- Item-id: `lj3v-pt1-files`
- Score: 4 punten
- Startlocatie: `Thuis/OneDrive/Project_stage`
- Startbestanden:
  - `Plan_stage_v1.docx`
  - `Plan_stage_DEF.docx`
  - `Foto_stage.jpg`
  - `Notities.txt`
- Opdrachten:
  - Maak de map `Archief` in `Project_stage`.
  - Verplaats `Plan_stage_v1.docx` naar `Archief`.
  - Hernoem `Plan_stage_DEF.docx` naar `Plan_stage_eindversie.docx`.
  - Maak de map `Beelden` en verplaats `Foto_stage.jpg` daarheen.

### PT3 - Account, apparaat en verbinding beveiligen

- Item-id: `lj3v-pt3-security`
- Score: 4 punten
- Scherm 1: verdachte update `update.exe`.
  - Niet downloaden.
  - Officiele app/instellingen voor updates openen.
- Scherm 2: verdachte login.
  - Officiele accountbeveiliging openen.
  - Sessie/apparaat controleren of wachtwoord wijzigen.

### PT4 - Excel/data sorteren en filteren

- Item-id: `lj3v-pt4-excel`
- Bestand: `LJ3_VMBO_Bestellingen.xlsx`
- Sheet: `Bestellingen`
- Score: 4 punten
- Vragen:
  - Filter op Categorie = elektronica. Sorteer daarna op Jaar, van nieuw naar oud. Code bovenaan: `W02`.
  - Filter op Bedrag > 60. Sorteer daarna op Bedrag, van hoog naar laag. Code bovenaan: `W06`.

### PT7 - Blokprogrammeren

- Item-id: `lj3v-pt7-programming`
- Robot: Bizzy
- Score: 4 punten
- Opdracht: laat Bizzy dansen, 2 meter vooruit bewegen, 90 graden draaien en daarna `Hoi!` zeggen.
- Scoring:
  - 1 punt: Bizzy danst.
  - 1 punt: Bizzy beweegt 2 meter vooruit.
  - 1 punt: Bizzy draait 90 graden.
  - 1 punt: Bizzy zegt `Hoi!` na uitvoeren.

### PT8 - Online gedrag: deepfake/pesten

- Item-id: `lj3v-pt8-online`
- Score: 3 punten
- Situatie: AI-gemaakte afbeelding in klassenapp.
- Correct:
  - Oordeel: `waarschijnlijk nep of AI`.
  - Signalen: `vreemde handen`, `leerling ontkent`, `schadelijke context` (minstens twee).
  - Acties: `niet doorsturen`, `rapporteren`, `bewijs bewaren`, `melden bij mentor/vertrouwde volwassene` (minstens twee).

### Selected response

| ID | Vraagkern | Correct antwoord |
| --- | --- | --- |
| `lj3v-sr1-ai-check` | AI zonder bron | Onafhankelijke bron controleren |
| `lj3v-sr2-platform` | Grote techbedrijven | Storing/regel kan veel mensen tegelijk raken |
| `lj3v-sr3-source` | Gezondheidsbron | Artikel op Thuisarts.nl van een arts |
| `lj3v-sr4-bias` | AI toont alleen mannen als directeur | Trainingsdata bevat vooral voorbeelden met mannen |
| `lj3v-sr5-copyright` | Foto in werkstuk | Maker noemen en bron vermelden |
| `lj3v-sr6-energy` | Streaming-video | Datacenters verbruiken veel energie |

## Leerjaar 3 HAVO/VWO (`lj3-hv`)

### PT1 - Bestanden en mappen

- Item-id: `lj3h-pt1-files`
- Score: 4 punten
- Startlocatie: `Thuis/OneDrive/Onderzoek`
- Startbestanden:
  - `Onderzoek_v1.docx`
  - `Onderzoek_v2.docx`
  - `Onderzoek_DEF.docx`
  - `Bronnen.xlsx`
  - `Afbeelding_CC_BY.png`
- Opdrachten:
  - Maak de map `Archief`.
  - Verplaats `Onderzoek_v1.docx` en `Onderzoek_v2.docx` naar `Archief`.
  - Hernoem `Onderzoek_DEF.docx` naar `Onderzoek_eindversie.docx`.
  - Maak `Bronnen_en_media` en verplaats `Bronnen.xlsx` en `Afbeelding_CC_BY.png` daarheen.

### PT3 - Account, apparaat en verbinding beveiligen

- Item-id: `lj3h-pt3-security`
- Score: 4 punten
- Scherm 1: macro-waarschuwing bij `Factuur_stage.xlsm`.
  - Macro's niet inschakelen.
  - Afzender controleren of bestand melden bij ICT.
- Scherm 2: verdachte login.
  - Officiele accountbeveiliging openen.
  - Sessie/apparaten controleren en/of wachtwoord/2FA veilig aanpassen.

### PT4 - Excel/data sorteren en filteren

- Item-id: `lj3h-pt4-excel`
- Bestand: `LJ3_HV_OpenData.xlsx`
- Sheet: `Energie`
- Score: 4 punten
- Vragen:
  - Filter op Kosten > 500. Sorteer daarna op Kosten, van hoog naar laag. Code bovenaan: `E13`.
  - Filter op Woningtype = B. Sorteer daarna op Jaar, van nieuw naar oud. Code bovenaan: `E02`.

### PT7 - Blokprogrammeren

- Item-id: `lj3h-pt7-programming`
- Robot: Bizzy
- Score: 4 punten
- Opdracht: laat Bizzy lopen, herhaal twee keer een beweging van 1 meter vooruit en laat Bizzy daarna `Hoi!` zeggen.
- Scoring:
  - 1 punt: Bizzy loopt.
  - 1 punt: `herhaal 2 keer` met verplaatsblok als geneste body.
  - 1 punt: verplaatsing ingesteld op 1 meter in 1 seconde.
  - 1 punt: Bizzy zegt `Hoi!` na uitvoeren.

### PT8 - Online gedrag: gemanipuleerde video

- Item-id: `lj3h-pt8-online`
- Score: 3 punten
- Situatie: video van docent op anoniem account, mondbeweging klopt niet, urgentie om te delen, geen bron/context.
- Correct:
  - Oordeel: `waarschijnlijk gemanipuleerd of nep`.
  - Verdachte signalen: `anoniem account`, `mondbeweging klopt niet`, `urgentie "deel dit"`, `geen bron/context` (minstens twee).
  - Verificatieactie: `Check via officiele school/mentor of betrouwbare bron`.

### Selected response

| ID | Vraagkern | Correct antwoord |
| --- | --- | --- |
| `lj3h-sr1-bias` | Scheve AI-uitkomsten | Trainingsdata kan onvolledig of scheef zijn |
| `lj3h-sr2-regulation` | EU-regulering | Een land heeft vaak te weinig invloed op wereldwijde bedrijven |
| `lj3h-sr3-hallucination` | Onvindbaar AI-artikel | AI heeft het artikel waarschijnlijk verzonnen |
| `lj3h-sr4-filter` | Algoritmische nieuwsselectie | Mensen zien vaker bevestiging van eigen mening |
| `lj3h-sr5-cc-sa` | Creative Commons BY-SA | Maker noemen en eigen versie onder dezelfde licentie delen |
| `lj3h-sr6-energy` | AI-training en energie | Rekenen op grote datasets vraagt langdurig veel rekenkracht in datacenters |

