# Herzien ontwerp nulmetingen Digitale Geletterdheid — versie 3.6

Status: Codex-bruikbare verbeterde pilotversie. Niet presenteren als gevalideerd meetinstrument.

## 1. Wat is verbeterd in v3.6
- De vier HTTPS-/slotje-items zijn vervangen door phishing-/mailstimulusitems met een niet-interactieve e-mailmock-up.
- Actuele canonical item-id's: `lj1v-sr2-roosterlink-mail`, `lj1h-sr2-roosterlink-mail`, `lj3v-sr1-cijferlink-mail`, `lj3h-sr1-leeromgeving-mail`.
- De vraagteksten, stimuli, antwoordopties, correcte antwoorden, scoring en metadata in deze Markdown-specificatie zijn gesynchroniseerd met `nulmetingen_selected_response_herontwerp_v3.json`.
- De mailstimuli tonen URL-achtige tekst alleen als niet-klikbare linkweergave.
- De v3.4-verbeteringen blijven gehandhaafd: aangescherpte afleiders, eenduidige scoring, geen omgekeerde PT8-vraagvorm en aangevulde PT-acceptatiecriteria.

## 2. Bindende ontwerpbesluiten
- Doel: formatieve nulmeting en klassikale/cohortmatige diagnose, niet summatief.
- Geen individuele groeianalyse; analyse vindt plaats per klas, leerjaar, cohort, niveau en afnamevenster.
- Leerling ziet direct na afname wel een persoonlijk resultaat en kan client-side een PDF downloaden.
- Individuele antwoorden, scores, zelfinschatting en PDF worden niet permanent opgeslagen.
- Permanente opslag bestaat uitsluitend uit aggregatiecounters.
- Totaalscore blijft zichtbaar als duidelijk vergelijkingspunt tegenover de zelfinschatting.
- Totaalscore wordt altijd aangevuld met SR/PT-splitsing, kerndoelscores en subdoeldetails.
- Zelfinschatting blijft één niet-scorende schaalvraag van 0 tot 100.
- Multiple-select-items gebruiken partial scoring en schadelijke caps.
- PT8 gebruikt vier schermen met categorie-scoring en geen simpele “kies twee”-logica.
- Gebruik geen normatieve labels zoals onvoldoende, voldoende, goed, gevorderd, beheerst, geslaagd of gezakt.

## 3. Scorearchitectuur
| Onderdeel | Max. punten |
|---|---:|
| Selected response | 10 |
| Performance tasks | 26 |
| Totaal | 36 |

PT-punten: PT1 4, PT2 4, PT3 3, PT4 4, PT6 3, PT7 4, PT8 4. PT5 blijft ongebruikt voor compatibiliteit met bestaande taaknummering.

## 4. Privacy en opslag
Permanent opslaan: alleen aggregaten per `assessmentId`, `classId`, `cohort`, `gradeLevel`, `track` en `assessmentWindow`.

Niet permanent opslaan: naam, e-mailadres, leerlingnummer, IP-adres, user agent, browser fingerprint, individuele antwoorden, individuele scores, individuele zelfinschatting, individuele poginghistorie of gegenereerde PDF.

Codex moet tijdelijke pogingdata alleen gebruiken om de resultaatpagina te berekenen en aggregatiecounters bij te werken. Verwijder tijdelijke pogingdata zodra de resultaatpagina/PDF is gegenereerd of uiterlijk bij sessie-einde.

## 5. Zelfinschatting
Vraag: **Hoe digitaal geletterd schat je jezelf in?**

Hulptekst: Schuif het bolletje naar jouw keuze. 0 = ik schat mezelf helemaal niet digitaal geletterd in. 100 = ik schat mezelf heel digitaal geletterd in. Deze inschatting telt niet mee voor je score.

Specificatie: schaal 0-100, stapgrootte 1, verplicht vóór de nulmeting, niet scorend, alleen geaggregeerd opslaan als som/aantal/bandverdeling per klas/cohort.

## 6. Scoringregels
### 6.1 Single choice
Correct = 1 punt. Incorrect = 0. `Ik weet het niet.` = 0 en apart tellen als unknown.

### 6.2 Multiple select partial scoring
- `Ik weet het niet` is exclusief: True.
- UI-limiet: use select value, e.g. choose-2 means max 2 selections excluding unknown.
- Basisformule: raw = correctSelected/correctTotal; subtract 0 for neutral incorrect options; apply caps for harmful selections; unknown = 0 and exclusive; keep raw decimal for aggregates..
- Choose-2: 2 correct = 1, 1 correct = 0.5, 0 correct = 0; harmful cap = 0.5.
- Choose-3: 3 correct = 1, 2 correct = 0.67, 1 correct = 0.33, 0 correct = 0; harmful cap = 0.33.
- Registreer counters: correctSelectedCount, incorrectSelectedCount, harmfulSelectedCount, unknownCount, omittedCorrectCount.
- Deploy nooit een item waarin de opdracht `kies N` zegt terwijl er meer dan N verdedigbare correcte acties zijn.

### 6.3 PT8 categorie-scoring
PT8 bestaat per leerling uit vier schermen. Elk scherm meet één categorie en levert maximaal 1 punt op: risico herkennen, niet verspreiden/escaleren, hulp/melding/verificatie, respectvolle steun/herstelactie. Schadelijk delen, wraakacties of onveilig bewijs delen beperken de totaalscore volgens caps.

## 7. Selected-response-items v3.5

### Leerjaar 1 VMBO (`lj1-vmbo`)

#### `lj1v-sr1-pw-passphrase` — 23A
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Welk wachtwoord is het veiligst voor een schoolaccount?
- Antwoordopties:
  - A. MijnKleineKatSlaaptOnderDeBank *(correct)*
  - B. Nora2012SchoolLent
  - C. Welkom2026!!
  - D. Qwerty12345!
  - E. Ik weet het niet.
- Onderbouwing: Meet kern-DG rond accountveiligheid. De correcte optie is een lange wachtwoordzin zonder persoonlijke context of bekend patroon. Afleiders zijn herkenbare maar zwakke strategieën: naam/jaar/school, jaartal met symbolen en toetsenbordpatroon.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1v-sr2-roosterlink-mail` — 23A
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Stimulus: niet-interactieve e-mailmock-up (`email-message`)
  - Van: Rooster service <r0st3r-88xq91@mx7-info-update.net>
  - Aan: sanne@leerling.citadelcollege.nl
  - Datum: Vandaag 08:14
  - Onderwerp: Nieuw rooster staat klaar
  - Body:
    - Hallo leerling,
    - Je nieuwe rooster staat klaar. Log vandaag nog in om te voorkomen dat je lessen mist.
    - Gebruik de knop hieronder om je rooster direct te openen.
  - Linktekst: Rooster bekijken
  - Linkweergave: `https://school-rooster-login-24.example.net/start`
- Vraag: Wat kan Sanne het best doen?
- Antwoordopties:
  - A. Niet op de link klikken en haar rooster via de schoolapp of bekende schoolsite controleren. *(correct)*
  - B. Op de link klikken, want het bericht gaat over school.
  - C. De mail doorsturen naar de klas zodat iedereen zijn rooster kan openen.
  - D. Inloggen via de knop omdat de mail zegt dat het vandaag moet.
  - E. Ik weet het niet. *(score 0, exclusief)*
- CorrectAnswer: `A`
- HarmfulAnswers: `["C"]`
- Scoring: maxPoints 1; rule `exact-choice`; unknownScoresZero `true`; unknownExclusive `true`.
- Onderbouwing: Meet basisherkenning van verdachte e-mailkenmerken en veilige vervolgstap: niet klikken, maar controleren via een bekende schoolroute.
- V3.6-review: HTTPS-/slotje-item vervangen door phishing-mailstimulus. Leerling kiest een veilige route zonder op de mailknop te vertrouwen.

#### `lj1v-sr3-phone` — 21A
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Titel: Opslag bijna vol
- Vraag: Youssef krijgt vaak de melding: “Opslag bijna vol.” Apps openen traag. Hij wil geen foto’s, berichten of accounts kwijt. Wat is de beste eerste stap?
- Antwoordopties:
  - A. In de instellingen kijken wat veel ruimte gebruikt en oude downloads of ongebruikte apps verwijderen. *(correct)*
  - B. Steeds alle apps afsluiten; dan komt er weer genoeg opslag vrij.
  - C. Een gratis schoonmaak-app uit een advertentie installeren en toegang geven tot alle bestanden.
  - D. De helderheid lager zetten en meldingen uitzetten.
  - E. Ik weet het niet.
- Onderbouwing: Maakt het DG-construct scherper: praktisch systeemonderhoud bij opslag/traagheid, niet algemeen telefoonadvies.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1v-sr4-official-source` — 21B
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Titel: School morgen dicht?
- Vraag: In Whutsupp staat: “Morgen geen school door storm. Stuur door!” Je ziet geen bericht van school zelf. Wat doe je voordat je het bericht doorstuurt?
- Antwoordopties:
  - A. Checken of hetzelfde bericht in de schoolapp, schoolmail of op de schoolsite staat. *(correct)*
  - B. Aan de klasgenoot vragen waar hij het vandaan heeft; als hij “van iemand van school” zegt, stuur je het door.
  - C. Kijken of het screenshot een logo en datum heeft; als dat klopt, is het betrouwbaar genoeg.
  - D. Wachten tot veel leerlingen het bericht delen; dan zal het waarschijnlijk waar zijn.
  - E. Ik weet het niet.
- Onderbouwing: Aangescherpt naar controle vóór doorsturen. Afleiders zijn plausibele sociale-bronfouten, niet alleen onzinbronnen.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1v-sr5-algorithm` — 21B
- Vraagtype: single
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Luna kijkt een paar video’s over voetbal. Daarna ziet ze steeds meer voetbalvideo’s. Hoe komt dat meestal?
- Antwoordopties:
  - A. De app gebruikt haar kijkgedrag om nieuwe video’s te kiezen. *(correct)*
  - B. De maker van een voetbalvideo kan betalen om vaker in feeds te verschijnen.
  - C. Iedereen die op hetzelfde moment online is, krijgt dezelfde aanbevelingen.
  - D. De app kiest vooral video’s op alfabetische volgorde van titel.
  - E. Ik weet het niet.
- Onderbouwing: Afleiders zijn minder absurd: sponsoring, gelijke feeds en simpele sortering zijn plausibele misconcepties over aanbevelingssystemen.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1v-sr6-data-poll` — 21C
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: In een poll stemmen 8 van de 25 leerlingen uit jouw klas op voetbal. Iemand zegt: “Voetbal is dus de populairste sport van de hele school.” Wat is de beste reactie?
- Antwoordopties:
  - A. Dat kun je niet zomaar zeggen, want de poll komt maar uit één klas. *(correct)*
  - B. Dat klopt, want 8 stemmen is meer dan genoeg voor een schoolconclusie.
  - C. Dat klopt alleen als de poll digitaal is ingevuld.
  - D. Dat kun je nooit met een poll onderzoeken.
  - E. Ik weet het niet.
- Onderbouwing: Sterkere vraagvorm: leerlingen beoordelen een conclusie op basis van beperkte data.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1v-sr7-ai-check` — 21D
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Een chatbot geeft een antwoord voor je werkstuk. Je weet niet of het klopt. Wat is de beste aanpak?
- Antwoordopties:
  - A. Gebruik het als startpunt en controleer belangrijke feiten in een betrouwbare andere bron. *(correct)*
  - B. Gebruik het meteen, want het antwoord klinkt netjes.
  - C. Vraag dezelfde chatbot alleen of hij zeker is en neem dat over.
  - D. Kies vooral de langste zinnen uit het antwoord.
  - E. Ik weet het niet.
- Onderbouwing: Vermijdt blind AI-gebruik en meet AI als hulpmiddel plus factchecking. Niet alleen ‘AI is fout’, maar verantwoord gebruik.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1v-sr8-image-rights` — 22A
- Vraagtype: single
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Je vindt een afbeelding voor een schoolposter die ook online komt. Wat controleer je eerst?
- Antwoordopties:
  - A. Of je de afbeelding mag gebruiken, of je hem mag aanpassen en welke maker of bron je moet noemen. *(correct)*
  - B. Of de afbeelding op veel websites voorkomt; dan zal hij wel vrij te gebruiken zijn.
  - C. Of je de afbeelding kleiner kunt maken; dan valt gebruik minder op.
  - D. Of je er een filter overheen zet; dan is het automatisch nieuw werk.
  - E. Ik weet het niet.
- Onderbouwing: Maakt 22A sterker door gebruik, bewerken en online delen mee te nemen zonder Creative Commons-jargon.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1v-sr9-photo-consent` — 23B
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Je maakt een foto van drie klasgenoten. Je wilt die in een sociale app zetten. Wat doe je eerst?
- Antwoordopties:
  - A. Vragen of iedereen op de foto dat goed vindt. *(correct)*
  - B. Alleen de namen weglaten; dan mag het altijd.
  - C. De foto plaatsen en verwijderen als iemand klaagt.
  - D. De foto alleen in de klassenapp zetten; dan is toestemming niet nodig.
  - E. Ik weet het niet.
- Onderbouwing: Meet toestemming en verantwoordelijk delen van beeldmateriaal.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1v-sr10-platform-risk` — 23C
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: De school gebruikt één app voor rooster, huiswerk en berichten. Wat is het grootste risico als die app een storing heeft?
- Antwoordopties:
  - A. Veel leerlingen kunnen tegelijk hun rooster, huiswerk en berichten niet zien. *(correct)*
  - B. Leerlingen moeten misschien in een andere app kijken als er een noodbericht is.
  - C. De school moet uitleg geven over hoe de app werkt.
  - D. Leerlingen openen de app op verschillende apparaten.
  - E. Ik weet het niet.
- Onderbouwing: Afleiders zijn realistische nevenpunten, maar geen grootste risico van afhankelijkheid van één platform bij storing.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

### Leerjaar 1 HAVO/VWO (`lj1-hv`)

#### `lj1h-sr1-pw-passphrase` — 23A
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Welk wachtwoord is het veiligst?
- Antwoordopties:
  - A. DeBlauweTreinStaatNaastDeSporthal *(correct)*
  - B. Daan2012SchoolLent
  - C. Welkom!!2026@@
  - D. !Qw@#Er$%
  - E. Ik weet het niet.
- Onderbouwing: Lange wachtwoordzin zonder persoonlijke context is sterker dan korte complexe patronen of herleidbare gegevens.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1h-sr2-roosterlink-mail` — 23A
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Stimulus: niet-interactieve e-mailmock-up (`email-message`)
  - Van: ICT controle <ict-472kq9-check@safe-login-mailer.info>
  - Aan: noor@leerling.citadelcollege.nl
  - Datum: Vandaag 10:02
  - Onderwerp: Controleer je schoolaccount
  - Body:
    - Beste leerling,
    - Wij controleren alle accounts. Stuur je tijdelijke inlogcode terug zodat je account actief blijft.
    - Reageer binnen 30 minuten.
  - Linktekst: Code bevestigen
  - Linkweergave: `https://citadel-controle.example.org/code`
- Vraag: Welke reactie is het veiligst?
- Antwoordopties:
  - A. Geen code delen en de melding controleren via de normale schoolroute. *(correct)*
  - B. De code terugsturen, want anders kan het account verlopen.
  - C. De link openen en daar de code invullen.
  - D. De mail bewaren, maar verder niets controleren.
  - E. Ik weet het niet. *(score 0, exclusief)*
- CorrectAnswer: `A`
- HarmfulAnswers: `["B","C"]`
- Scoring: maxPoints 1; rule `exact-choice`; unknownScoresZero `true`; unknownExclusive `true`.
- Onderbouwing: Meet dat leerlingen een verzoek om inlogcodes via mail herkennen als onveilig en via de normale schoolroute controleren.
- V3.6-review: HTTPS-/slotje-item vervangen door phishing-mailstimulus met codevraag en tijdsdruk.

#### `lj1h-sr3-phone-actions` — 21A
- Vraagtype: multiple
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Youssef zijn telefoon is traag en loopt soms vast. Kies twee acties die meestal kunnen helpen.
- Antwoordopties:
  - A. Ongebruikte apps en bestanden opruimen. *(correct)*
  - B. Beschikbare updates via de instellingen installeren. *(correct)*
  - C. De helderheid van het scherm lager zetten.
  - D. Het toetsenbordgeluid uitzetten.
  - E. Het wachtwoord van de telefoon veranderen.
  - F. Ik weet het niet.
- Onderbouwing: Partial scoring. Meet twee kernhandelingen voor systeemonderhoud; niet-relevante opties zijn onschadelijk maar niet correct.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1h-sr4-search-query` — 21B
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Je zoekt betrouwbare informatie over hoeveel jongeren in Nederland e-bikes gebruiken. Welke zoekopdracht is het meest geschikt als eerste stap?
- Antwoordopties:
  - A. onderzoek cijfers jongeren e-bike gebruik Nederland *(correct)*
  - B. e-bike jongeren kopen goedkoop Nederland
  - C. jongeren fietsen school ervaring
  - D. waarom e-bikes slecht zijn voor jongeren
  - E. Ik weet het niet.
- Onderbouwing: Sterker doordat de correcte zoekopdracht cijfers/onderzoek/doelgroep/land bevat; afleiders zoeken naar koopintentie, ervaringen of gekleurde informatie.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1h-sr5-feed-sample` — 21B
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Je ziet op een videoplatform tien video’s met dezelfde mening. Wat kun je daaruit het best afleiden?
- Antwoordopties:
  - A. Niet meteen dat iedereen die mening heeft; je feed kan door een algoritme zijn gekozen. *(correct)*
  - B. Dat de mening zeker waar is.
  - C. Dat alle andere meningen zijn verwijderd.
  - D. Dat het platform geen invloed heeft op wat je ziet.
  - E. Ik weet het niet.
- Onderbouwing: Combineert informatievaardigheid met algoritmisch bewustzijn.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1h-sr6-sample` — 21C
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Een dataset bevat alleen antwoorden van leerlingen uit één klas. Waar moet je voor oppassen?
- Antwoordopties:
  - A. Je kunt niet zomaar zeggen dat dit voor alle leerlingen geldt. *(correct)*
  - B. Eén klas is altijd genoeg om iets over heel Nederland te zeggen.
  - C. De dataset is automatisch fout.
  - D. Meer data maakt nooit verschil.
  - E. Ik weet het niet.
- Onderbouwing: Meet beperkte generaliseerbaarheid van data.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1h-sr7-ai-startpunt` — 21D
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Je gebruikt AI om ideeën voor een spreekbeurt te krijgen. Wat is de beste werkwijze?
- Antwoordopties:
  - A. Ideeën gebruiken als startpunt en feiten daarna zelf controleren. *(correct)*
  - B. De hele tekst inleveren zonder te lezen.
  - C. Alle bronnen overslaan, want AI heeft al gezocht.
  - D. Alleen vragen om langere zinnen zodat het slimmer lijkt.
  - E. Ik weet het niet.
- Onderbouwing: Meet verantwoord gebruik van AI als hulpmiddel, zonder blind overnemen.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1h-sr8-image-source` — 22A
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Je gebruikt een foto in een presentatie die later in de online leeromgeving komt. Wat controleer je eerst?
- Antwoordopties:
  - A. Of je de foto mag gebruiken en welke maker of bron je moet noemen. *(correct)*
  - B. Of de foto op veel websites staat; dan zal hij wel vrij te gebruiken zijn.
  - C. Of je de foto bijsnijdt; dan hoef je de maker meestal niet te noemen.
  - D. Of je de presentatie alleen met de klas deelt; dan gelden er nooit regels.
  - E. Ik weet het niet.
- Onderbouwing: Afleiders zijn realistischer en raken echte misconcepties rond online beschikbaarheid, bewerken en besloten delen.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1h-sr9-photo-share` — 23B
- Vraagtype: multiple
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Een klasgenoot stuurt een dreigend privébericht. Kies twee verstandige eerste acties.
- Antwoordopties:
  - A. Bewijs veiligstellen volgens schoolafspraak, zonder het verder te delen. *(correct)*
  - B. Melden bij een mentor, ouder of vertrouwenspersoon. *(correct)*
  - C. Het bericht openbaar posten om steun te krijgen.
  - D. Terugdreigen zodat de ander stopt.
  - E. Het bericht verwijderen en doen alsof het niet is gebeurd.
  - F. Ik weet het niet.
- Onderbouwing: Formulering van bewijs veiligstellen is veiliger gemaakt: de leerling leert niet zelfstandig schadelijke inhoud te verspreiden of verzamelen, maar handelt volgens schoolafspraak en schakelt hulp in.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1h-sr10-platform-risk` — 23C
- Vraagtype: single
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Je zoekt online naar voetbalschoenen. Later zie je op verschillende sites reclame voor voetbalschoenen. Wat is de meest waarschijnlijke verklaring?
- Antwoordopties:
  - A. Websites, apps of advertentienetwerken kunnen online gedrag gebruiken om advertenties te kiezen. *(correct)*
  - B. Een webshop krijgt automatisch toegang tot je microfoon zodra je de site bezoekt.
  - C. Iedereen in jouw klas ziet daarna precies dezelfde reclame.
  - D. Passende reclame betekent dat je berichten op je telefoon zijn gelezen.
  - E. Ik weet het niet.
- Onderbouwing: Behoudt herkenbare trackingvraag, maar afleiders zijn duidelijke misconcepties zonder complotachtige overdrijving als enige alternatief.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

### Leerjaar 3 VMBO (`lj3-vmbo`)

#### `lj3v-sr1-cijferlink-mail` — 23A
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Stimulus: niet-interactieve e-mailmock-up (`email-message`)
  - Van: Cijfersysteem <c1jf3r-upd8-771@doc-viewer-login.com>
  - Aan: jayden@leerling.citadelcollege.nl
  - Datum: Gisteren 19:48
  - Onderwerp: Cijferlijst controleren
  - Body:
    - Hallo,
    - Er is een fout gevonden in je cijferlijst. Open de bijlage en schakel bewerken in om de nieuwe cijfers te bekijken.
    - Controleer dit voor morgen.
  - Bijlage: Cijferlijst_update.xlsm
  - Linktekst: Online bekijken
  - Linkweergave: `https://cijfers-school-update.example.net/login`
- Vraag: Wat is de veiligste actie?
- Antwoordopties:
  - A. De bijlage niet openen en cijfers controleren via het normale schoolportaal. *(correct)*
  - B. De bijlage openen en bewerken inschakelen om de cijfers te zien.
  - C. Inloggen via de link in de mail om te controleren of de fout klopt.
  - D. De mail melden of aan een docent/ICT laten controleren.
  - E. Ik weet het niet. *(score 0, exclusief)*
- CorrectAnswer: `A`
- HarmfulAnswers: `["B","C"]`
- Scoring: maxPoints 1; rule `exact-choice`; unknownScoresZero `true`; unknownExclusive `true`.
- Onderbouwing: Meet herkennen van risicovolle mailbijlagen en veilige controle via het normale schoolportaal; melden is veilig maar minder volledig dan niet openen plus controleren.
- V3.6-review: HTTPS-/slotje-item vervangen door phishing-mailstimulus met macrobijlage, druk en alternatieve veilige controle.

#### `lj3v-sr2-mfa` — 23A
- Vraagtype: single
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Je krijgt een melding: “Wil je deze login goedkeuren?” Je probeert zelf niet in te loggen. Wat is de beste actie?
- Antwoordopties:
  - A. Afwijzen en je account via de officiële instellingen controleren. *(correct)*
  - B. Goedkeuren om te zien of er daarna meer informatie komt.
  - C. Goedkeuren als de melding maar één keer komt.
  - D. De melding wegvegen en verder niets controleren.
  - E. Ik weet het niet.
- Onderbouwing: Afleiders zijn nu realistischer bij MFA-promptmisbruik: nieuwsgierigheid, eenmaligheid en passief negeren.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3v-sr3-phone-actions` — 21A
- Vraagtype: multiple
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: De telefoon van Youssef is oud, traag en loopt soms vast. Kies drie acties die meestal kunnen helpen.
- Antwoordopties:
  - A. Oude of ongebruikte apps en bestanden opruimen. *(correct)*
  - B. Tijdelijke bestanden of cache opruimen via de instellingen. *(correct)*
  - C. Beschikbare systeemupdates via de instellingen installeren. *(correct)*
  - D. De helderheid van het scherm lager zetten.
  - E. Het toetsenbordgeluid uitzetten.
  - F. Een andere achtergrondfoto kiezen.
  - G. Ik weet het niet.
- Onderbouwing: Drie onderhoudshandelingen; partial scoring voorkomt alles-of-niets.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3v-sr4-health-source` — 21B
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Je zoekt betrouwbare basisinformatie over slaaptekort bij jongeren. Welke bron is het meest geschikt om mee te beginnen?
- Antwoordopties:
  - A. Een publieke gezondheidsorganisatie of artsensite met datum, uitleg en bronnen. *(correct)*
  - B. Een webshopartikel over slaapdrankjes met klantreviews.
  - C. Een influencer die vertelt wat voor hem persoonlijk werkte.
  - D. Een forumreactie met veel herkenbare verhalen.
  - E. Ik weet het niet.
- Onderbouwing: Afleiders zijn realistischer gemaakt: commercieel belang, persoonlijke ervaring en forumervaring zijn niet waardeloos, maar minder geschikt als betrouwbare basisinformatie.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3v-sr5-sponsored` — 21B
- Vraagtype: single
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Een populaire gamer noemt een energiedrank “de beste voor concentratie” en gebruikt kortingscode GAMER10. Wat is de beste beoordeling?
- Antwoordopties:
  - A. Let op: dit kan reclame of sponsoring zijn, dus de uitspraak is niet automatisch onafhankelijk. *(correct)*
  - B. Een kortingscode maakt de uitspraak betrouwbaarder, omdat de maker dan samenwerkt met het merk.
  - C. Als veel volgers positief reageren, is de concentratieclaim voldoende bewezen.
  - D. Omdat het om een gamer gaat, hoeft sponsoring niet genoemd te worden.
  - E. Ik weet het niet.
- Onderbouwing: Scherper op commerciële beïnvloeding en onafhankelijkheid.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3v-sr6-percent` — 21C
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: In een online poll stemmen 12 leerlingen uit klas 3V2. Acht leerlingen kiezen voor ‘meer pauze’. Een leerling zegt: ‘De meeste leerlingen van de hele school willen dus meer pauze.’ Wat is de beste reactie?
- Antwoordopties:
  - A. Dat kun je niet zomaar zeggen, want de poll gaat maar over 12 leerlingen uit één klas. *(correct)*
  - B. Dat klopt zeker, want acht stemmen is meer dan de helft.
  - C. Dat klopt alleen als de poll op een telefoon is ingevuld.
  - D. Dat kun je nooit onderzoeken met een poll.
  - E. Ik weet het niet.
- Onderbouwing: Meet verhouding tussen data en toegestane conclusie.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3v-sr7-ai-factcheck` — 21D
- Vraagtype: single
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Een AI laat vooral mannen zien als je vraagt om een afbeelding van ‘een directeur’. Wat is de meest waarschijnlijke oorzaak?
- Antwoordopties:
  - A. De AI heeft in de voorbeelden waarop hij is getraind vaak mannen in die rol gezien. *(correct)*
  - B. De AI kiest altijd de afbeeldingen die het vaakst zijn aangeklikt door de gebruiker.
  - C. De AI gebruikt alleen de woorden uit jouw vraag en geen eerdere voorbeelden.
  - D. De AI maakt altijd een neutrale keuze als je geen extra uitleg geeft.
  - E. Ik weet het niet.
- Onderbouwing: Meet bias en trainingsdata zonder karikaturale afleiders.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3v-sr8-media-rights` — 22A
- Vraagtype: single
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Je maakt een video voor school en wilt een bekend liedje eronder zetten en online plaatsen. Wat is het best?
- Antwoordopties:
  - A. Controleren of je het liedje mag gebruiken of muziek kiezen die hiervoor bedoeld is. *(correct)*
  - B. Het liedje zachter zetten; dan valt het minder op en is het meestal toegestaan.
  - C. Alleen een kort stukje gebruiken; dan mag het altijd online.
  - D. De titel en artiest niet noemen; dan is het geen officieel gebruik.
  - E. Ik weet het niet.
- Onderbouwing: Afleiders zijn echte auteursrechtmisvattingen: volume, korte fragmenten en titel weglaten.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3v-sr9-photo-shared` — 23B
- Vraagtype: multiple
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Iemand maakt een account aan met jouw naam en foto. Kies twee goede eerste acties.
- Antwoordopties:
  - A. Het account rapporteren bij het platform. *(correct)*
  - B. Bewijs veiligstellen volgens schoolafspraak, zonder zelf terug te posten of verder te verspreiden. *(correct)*
  - C. Zelf ook een nepaccount van die persoon maken.
  - D. Iedereen vragen het account te volgen om te kijken wat er gebeurt.
  - E. Je echte account verwijderen zonder iets te melden.
  - F. Ik weet het niet.
- Onderbouwing: Meet adequaat reageren op identiteitsmisbruik. Bewijs bewaren is veilig geformuleerd en gekoppeld aan niet verder verspreiden.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3v-sr10-digital-access` — 23C
- Vraagtype: single
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Een stagebedrijf laat sollicitanten alleen via een ingewikkeld online formulier reageren. Wat kan een gevolg zijn?
- Antwoordopties:
  - A. Mensen met minder digitale vaardigheden kunnen moeilijker meedoen. *(correct)*
  - B. Het formulier bespaart tijd, dus kansenverschil speelt geen rol.
  - C. Iedereen krijgt automatisch dezelfde kans omdat het formulier voor iedereen gelijk is.
  - D. Het bedrijf hoeft minder op privacy te letten omdat alles digitaal binnenkomt.
  - E. Ik weet het niet.
- Onderbouwing: Afleiders zijn sterker: efficiëntieblindheid en formele gelijkheid zijn realistische misconcepties over digitale toegang.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

### Leerjaar 3 HAVO/VWO (`lj3-hv`)

#### `lj3h-sr1-leeromgeving-mail` — 23A
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Stimulus: niet-interactieve e-mailmock-up (`email-message`)
  - Van: Account team <acc-veilig-90z1@verify-device-center.co>
  - Aan: mila@leerling.citadelcollege.nl
  - Datum: Vandaag 21:06
  - Onderwerp: Onbekend apparaat gevonden
  - Body:
    - Beste Mila,
    - Er is een onbekend apparaat gekoppeld. Voorkom afsluiting van je account door je wachtwoord via onderstaande knop te vernieuwen.
    - Gebruik dezelfde gegevens als je schoolaccount.
  - Linktekst: Wachtwoord vernieuwen
  - Linkweergave: `https://citadel-device-check.example.com/security`
- Vraag: Welke beoordeling en vervolgstap passen het best?
- Antwoordopties:
  - A. Dit kan phishing zijn; niet via de link inloggen en accountactiviteit controleren via de bekende schoolroute. *(correct)*
  - B. Het bericht is betrouwbaar omdat Mila bij naam wordt genoemd.
  - C. Direct het wachtwoord via de knop vernieuwen om afsluiting te voorkomen.
  - D. De mail negeren en nergens controleren of er echt een onbekend apparaat is.
  - E. Ik weet het niet. *(score 0, exclusief)*
- CorrectAnswer: `A`
- HarmfulAnswers: `["C"]`
- Scoring: maxPoints 1; rule `exact-choice`; unknownScoresZero `true`; unknownExclusive `true`.
- Onderbouwing: Meet genuanceerde phishingbeoordeling: personalisatie of beveiligingstaal is geen bewijs van betrouwbaarheid; veilige actie loopt via een bekende schoolroute.
- V3.6-review: HTTPS-/slotje-item vervangen door phishing-mailstimulus met naamgebruik, dreiging en afwijkend domein.

#### `lj3h-sr2-datalek` — 23A
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Een website waar jij een account hebt, meldt een datalek. Je gebruikte daar hetzelfde wachtwoord als voor school. Wat is de beste actie?
- Antwoordopties:
  - A. Het gelekte wachtwoord overal waar je het gebruikte wijzigen en voor school tweestapsverificatie controleren. *(correct)*
  - B. Alleen het wachtwoord van de gelekte website wijzigen.
  - C. Wachten tot school zegt dat er iets mis is met je schoolaccount.
  - D. Hetzelfde wachtwoord houden als het lang en sterk genoeg lijkt.
  - E. Ik weet het niet.
- Onderbouwing: Correcte optie is breder en security-inhoudelijk sterker: hergebruik is het risico, niet alleen het schoolaccount.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3h-sr3-phone-actions` — 21A
- Vraagtype: multiple
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Youssef zijn telefoon wordt traag en loopt vaak vast. Kies drie acties die het meest logisch zijn.
- Antwoordopties:
  - A. Onnodige apps en grote bestanden opruimen. *(correct)*
  - B. Cache of tijdelijke gegevens opruimen via instellingen. *(correct)*
  - C. Systeem en apps updaten via officiële instellingen. *(correct)*
  - D. Schermhelderheid lager zetten.
  - E. Alle meldingen aanzetten.
  - F. Toetsenbordgeluid uitzetten.
  - G. Ik weet het niet.
- Onderbouwing: Meet onderhoudshandelingen met partial scoring.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3h-sr4-triangulation` — 21B
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Je vindt een opvallende claim over een nieuwe schoolregel in een gedeelde screenshot. Welke controle is het sterkst vóórdat je de claim doorstuurt?
- Antwoordopties:
  - A. Controleren of school zelf of meerdere betrouwbare bronnen dezelfde regel melden. *(correct)*
  - B. Kijken of de screenshot er netjes uitziet en geen spelfouten bevat.
  - C. Kijken of veel leerlingen de screenshot al hebben doorgestuurd.
  - D. De claim geloven als de tekst precies een datum en tijd noemt.
  - E. Ik weet het niet.
- Onderbouwing: Maakt broncontrole scherper en verlaagt vormherkenning als shortcut.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3h-sr5-filterbubble` — 21B
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Je nieuwsfeed toont vooral berichten die jouw mening bevestigen. Wat is verstandig?
- Antwoordopties:
  - A. Ook actief zoeken naar betrouwbare bronnen met andere invalshoeken. *(correct)*
  - B. Aannemen dat bijna iedereen jouw mening deelt.
  - C. Alle bronnen met andere meningen blokkeren.
  - D. Alleen nog reacties onder posts lezen.
  - E. Ik weet het niet.
- Onderbouwing: Meet filterbubbelbewustzijn en actieve verbreding.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3h-sr6-graph-scale` — 21C
- Vraagtype: single
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Twee apps krijgen klachten. App A: 20 klachten bij 1.000 gebruikers. App B: 50 klachten bij 10.000 gebruikers. Welke conclusie past het best?
- Antwoordopties:
  - A. App A heeft naar verhouding meer klachten dan App B. *(correct)*
  - B. App B heeft het grootste probleem, want 50 klachten is meer dan 20.
  - C. Je kunt pas vergelijken als beide apps exact evenveel gebruikers hebben.
  - D. Je kunt alleen vergelijken door het aantal klachten op te tellen.
  - E. Ik weet het niet.
- Onderbouwing: Afleider D is verbeterd; het item meet nu scherper verhouding-denken in plaats van een zwakke “minder dan 100”-redenering.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3h-sr7-ai-source-check` — 21D
- Vraagtype: multiple
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Je wilt een AI-tool feedback laten geven op een verslag over een klasgenoot. Kies twee dingen die je beter eerst verwijdert of vervangt.
- Antwoordopties:
  - A. De volledige naam van de klasgenoot. *(correct)*
  - B. Medische of andere persoonlijke details over de klasgenoot. *(correct)*
  - C. De vraag: ‘Maak de tekst duidelijker.’
  - D. Een algemene omschrijving zoals ‘een leerling’.
  - E. Een neutrale alinea over de opbouw van het verslag.
  - F. Ik weet het niet.
- Onderbouwing: Meet AI-gebruik met privacygrenzen.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3h-sr8-remix-rights` — 22A
- Vraagtype: single
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Je wilt een afbeelding van internet aanpassen voor een online poster. Wat controleer je eerst?
- Antwoordopties:
  - A. Of de maker dit toestaat, welke bronvermelding nodig is en of bewerken en delen mag. *(correct)*
  - B. Of de afbeelding groot genoeg is om de maker niet te hoeven noemen.
  - C. Of je de kleuren sterk kunt veranderen; dan is het altijd eigen werk.
  - D. Of je de poster alleen in een groepsapp deelt; dan gelden geen regels.
  - E. Ik weet het niet.
- Onderbouwing: Praktische toetsing van aanpassen, bronvermelding en delen.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3h-sr9-private-photo` — 23B
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Iemand deelt zonder toestemming een privéfoto van een klasgenoot in een besloten groep. Wat is de beste eerste reactie?
- Antwoordopties:
  - A. Niet verder delen en via een veilige route hulp inschakelen of rapporteren. *(correct)*
  - B. De foto alleen bewaren, zodat je later kunt bewijzen dat je hem gezien hebt.
  - C. Doorsturen naar een kleiner groepje dat je vertrouwt.
  - D. Een grap maken zodat de spanning in de groep daalt.
  - E. Ik weet het niet.
- Onderbouwing: Correcte optie is kernachtiger en vermijdt “of” als slordige combinatie; afleiders representeren echte onveilige reacties.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj3h-sr10-platform-dependence` — 23C
- Vraagtype: single
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Waarom maken landen en de EU regels voor grote online platforms?
- Antwoordopties:
  - A. Omdat platforms veel invloed hebben op informatie, handel en gegevens van burgers. *(correct)*
  - B. Omdat regels alle fouten, nepnieuws en datalekken volledig kunnen voorkomen.
  - C. Omdat gebruikers dan zelf niet meer hoeven na te denken over privacy en bronnen.
  - D. Omdat platforms buiten Europa per definitie onbetrouwbaar zijn.
  - E. Ik weet het niet.
- Onderbouwing: Afleiders zijn expliciete beleidsmisvattingen: overschatting van regels, uitbesteden van verantwoordelijkheid en herkomstdenken.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

## 8. Itemreviewmatrix v3.6
| Versie | Item | Subdoel | Actie | Oordeel |
|---|---|---|---|---|
| lj1-vmbo | `lj1v-sr1-pw-passphrase` | 23A | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr2-roosterlink-mail` | 23A | HTTPS-/slotje-item vervangen door phishing-mailstimulus in v3.6 | pilotreview nodig op herkenbaarheid van veilige schoolroute |
| lj1-vmbo | `lj1v-sr3-phone` | 21A | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr4-official-source` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr5-algorithm` | 21B | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr6-data-poll` | 21C | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr7-ai-check` | 21D | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr8-image-rights` | 22A | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr9-photo-consent` | 23B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr10-platform-risk` | 23C | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr1-pw-passphrase` | 23A | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr2-roosterlink-mail` | 23A | HTTPS-/slotje-item vervangen door phishing-mailstimulus in v3.6 | pilotreview nodig op code-deelmisvatting en tijdsdruk |
| lj1-hv | `lj1h-sr3-phone-actions` | 21A | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr4-search-query` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr5-feed-sample` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr6-sample` | 21C | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr7-ai-startpunt` | 21D | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr8-image-source` | 22A | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr9-threat-message` | 23B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr10-ad-profile` | 23C | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr1-cijferlink-mail` | 23A | HTTPS-/slotje-item vervangen door phishing-mailstimulus in v3.6 | pilotreview nodig op macrobijlage en veilige controleactie |
| lj3-vmbo | `lj3v-sr2-mfa` | 23A | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr3-phone-actions` | 21A | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr4-health-source` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr5-sponsored` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr6-percent` | 21C | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr7-ai-bias` | 21D | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr8-music-rights` | 22A | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr9-fake-account` | 23B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr10-digital-chances` | 23C | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr1-leeromgeving-mail` | 23A | HTTPS-/slotje-item vervangen door phishing-mailstimulus in v3.6 | pilotreview nodig op personalisatie, domeinherkenning en accountdreiging |
| lj3-hv | `lj3h-sr2-datalek` | 23A | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr3-phone-actions` | 21A | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr4-triangulation` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr5-filterbubble` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr6-graph-scale` | 21C | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr7-ai-privacy` | 21D | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr8-remix-rights` | 22A | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr9-private-photo` | 23B | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr10-regulation` | 23C | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |

## 9. Performance tasks v3.4

### `pt1-files` — Bestanden en mappen beheren
- Subdoel: 21A
- Max. punten: 4
- Doel: Meet praktische organisatie van digitale schoolbestanden: ordenen, terugvinden, naamgeven, versiebeheer en veilig werken met projectmateriaal.
- Scoring:
  - 1 punt: juiste mappenstructuur
  - 1 punt: bestanden op juiste locaties
  - 1 punt: juiste naamgeving
  - 1 punt: archiveren/versiebeheer of volledig correcte eindtoestand
- Varianten:
  - lj1-vmbo: Maak map 'Project Dieren', verplaats drie bestanden naar juiste submappen en hernoem één bestand volgens voorbeeld.
  - lj1-hv: Maak hoofdmap en twee submappen, verplaats vier bestanden en hernoem twee bestanden volgens vaste naamconventie.
  - lj3-vmbo: Orden projectbestanden, maak map 'Oud', archiveer een conceptversie en hernoem eindversie met datum.
  - lj3-hv: Orden projectmap met bronmateriaal, concept, eindversie en archief; herken dubbele/oude versie en archiveer correct.
- Acceptatiecriteria:
  - Eindtoestand is volledig automatisch te controleren.
  - Leerling krijgt geen voordeel door besturingssysteemkennis buiten de taakcontext.
  - Foutcategorieën onderscheiden: map niet gemaakt, bestand verkeerd geplaatst, naamgeving fout, archief/versie fout.
  - De taak bevat herkenbare schoolbestanden en geen bestanden waarvan de inhoud het antwoord verraadt zonder digitale handeling.

### `pt2-mail` — E-mail functioneel gebruiken
- Subdoel: 21A
- Max. punten: 4
- Doel: Meet functioneel digitaal communiceren via vaste velden, bijlage en adressering.
- Scoring:
  - 1 punt: juiste ontvanger(s)
  - 1 punt: juist gebruik CC/BCC waar van toepassing of juist niet gebruiken
  - 1 punt: duidelijke onderwerpregel volgens opdracht
  - 1 punt: juiste bijlage + verzenden
- Varianten:
  - lj1-vmbo: Stuur een verslag naar mentor met juiste ontvanger, onderwerp, bijlage en verzendactie.
  - lj1-hv: Stuur verslag naar mentor en vermeld projectnaam in onderwerp; voeg juiste bijlage toe.
  - lj3-vmbo: E-mail aan stagebegeleider/docent: juiste ontvanger, helder onderwerp, juiste bijlage, cc alleen wanneer gevraagd. Geen vrije beoordeling van schrijfstijl.
  - lj3-hv: Stuur projectmail naar docent, CC projectgroep, juiste onderwerpregel, juiste bijlage; geen verkeerde extra bijlage.
- Acceptatiecriteria:
  - Alle scorevelden zijn objectief: ontvanger, cc/bcc waar gevraagd, onderwerp, bijlage, verzendactie.
  - Geen score op vrije tekst zonder rubric.
  - Leerjaar 3 is aantoonbaar complexer dan leerjaar 1.
  - Elke variant bevat minimaal één inhoudelijk relevante keuze naast alleen klikken op verzenden, bijvoorbeeld juiste bijlage, onderwerp, ontvanger of cc-keuze.

### `pt3-security` — Account, apparaat en verbinding beveiligen
- Subdoel: 23A
- Max. punten: 3
- Doel: Meet concrete veilige handelingen bij verdachte digitale situaties.
- Scoring:
  - 1 punt: risico herkennen
  - 1 punt: onveilige actie vermijden
  - 1 punt: veilige controle/herstelactie kiezen
- Varianten:
  - lj1-vmbo: PT3-light: leerling ziet een bericht 'Deel je schoolcode om je account te herstellen'. Kies veilige actie: code niet delen, officiële schoolomgeving openen, hulp vragen.
  - lj1-hv: PT3-light: leerling ziet appmachtiging voor camera, locatie en contacten terwijl de app alleen rooster toont. Kies beperkte machtiging of weigeren van onnodige machtigingen.
  - lj3-vmbo: Onverwachte inlogmelding/MFA en verdachte update. Kies afwijzen, account via officiële instellingen controleren, niet klikken op losse link.
  - lj3-hv: Combinatie van datalek, verdachte macro en onbekende wifi. Kies wachtwoord wijzigen/MFA controleren, macro niet inschakelen, geen gevoelige login via onbekend netwerk.
- Acceptatiecriteria:
  - Leerjaar 1 heeft PT3-light met één herkenbare securityhandeling.
  - Leerjaar 3 bevat minstens één scenario waarin https/slotje niet voldoende bewijs is.
  - Geen echte links, echte permissies of echte accountinstellingen gebruiken.
  - Alle securityscenario’s meten een concrete keuze; geen scenario vraagt alleen naar een algemene attitude zoals “veilig doen”.

### `pt4-data` — Data sorteren, filteren en interpreteren
- Subdoel: 21C
- Max. punten: 4
- Doel: Meet praktische dataverwerking in spreadsheetachtige omgeving.
- Scoring:
  - 1 punt: juiste dataset geopend
  - 1 punt: juist filter toegepast
  - 1 punt: juiste sortering of vergelijking
  - 1 punt: juiste eindcode/conclusie
- Varianten:
  - lj1-vmbo: Filter een kleine tabel op klas/activiteit en geef de code van de juiste rij.
  - lj1-hv: Filter en sorteer een tabel met twee criteria; geef de juiste code.
  - lj3-vmbo: Filter stage-/activiteitendata op criteria en interpreteer welke optie past.
  - lj3-hv: Filter, sorteer en vergelijk relatieve waarden in een dataset; geef juiste code/conclusie.
- Acceptatiecriteria:
  - Dataset bevat voldoende rijen om filteren/sorteren noodzakelijk te maken.
  - Scoring kan onderscheid maken tussen filterfout, sorteerfout en interpretatiefout waar technisch mogelijk.
  - Rapporteer als data/spreadsheetvaardigheid, niet als zuiver databegrip.
  - Het item moet aantonen dat filteren/sorteren nodig is; een leerling mag het antwoord niet kunnen raden uit de eerste zichtbare rijen.

### `pt6-screen-share` — Veilig en doelgericht schermdelen
- Subdoel: 23A
- Max. punten: 3
- Doel: Meet privacybewust schermdelen in een digitale bijeenkomst.
- Scoring:
  - 1 punt: kiest venster/app delen in plaats van volledig scherm
  - 1 punt: kiest juiste venster/fragment
  - 1 punt: zet geluid of relevante deeloptie correct aan
- Varianten:
  - all: Deel alleen het venster met het filmfragment/presentatiefragment en zet computergeluid aan als de opdracht dat vraagt. Deel niet het volledige scherm.
- Acceptatiecriteria:
  - Gebruik generieke vensternamen, geen verouderde appnaam als Windows Media Player.
  - Score vereist vensterdelen in plaats van volledig scherm delen.
  - Taak jaarlijks controleren op interfacewijzigingen.

### `pt7-programming` — Programmeren met computationele denkstrategieën
- Subdoel: 22B
- Max. punten: 4
- Doel: Meet programmeren met computationele denkstrategieën. V3.3 bevat harde minimumeisen per niveau zodat 22B niet te licht wordt gemeten.
- Scoring:
  - 1 punt: juiste relevante blokken geselecteerd
  - 1 punt: juiste volgorde/structuur
  - 1 punt: juiste herhaling/voorwaarde/variabele voor het niveau
  - 1 punt: correct eindgedrag of fout correct opgelost
- Varianten:
  - lj1-vmbo: Zet blokken in de juiste volgorde zodat Bizzy naar de vlag loopt en daarna 'Gelukt' zegt. Focus: sequentie.
  - lj1-hv: Gebruik een herhaalblok zodat Bizzy drie gelijke stappen zet, draait en eindigt bij de vlag. Focus: herhaling + sequentie.
  - lj3-vmbo: Maak een teller: bij elke klik op knop A gaat score +1. Als score 5 is, toont Bizzy 'Vol'. Focus: variabele/teller + voorwaarde.
  - lj3-hv: Debug een programma met geneste keuze: als batterij < 20 en oplader niet aangesloten, toon waarschuwing; anders toon status ok. Focus: samengestelde voorwaarde + foutopsporing.
- Acceptatiecriteria:
  - Als een leerjaar-3-taak alleen volgorde en beweging meet, is deze niet acceptabel.
  - Geef deelpunten voor structuur, volgorde, parameter en eindgedrag.
  - Kerndoel 22B mag niet als betrouwbaar geïnterpreteerd worden als PT7 technisch is overgeslagen.
  - Leerjaar 3-taken bevatten altijd een conceptuele eis boven sequentie: variabele, voorwaarde, samengestelde logica of debuggen.

### `pt8-online-behaviour` — Online gedrag en verantwoord handelen
- Subdoel: 23B
- Max. punten: 4
- Doel: Meet online gedrag via realistische, niet-expliciete beslisscenario’s. V3.4 gebruikt alleen positief geformuleerde handelings- of beoordelingsvragen, geen omgekeerde “welke actie moet je vermijden”-schermen, en categorie-scoring om meerdere veilige gedragsdimensies eerlijk te meten.
- Scoring:
  - 1 punt: risico of grens correct herkennen
  - 1 punt: niet delen, liken, doorsturen of escaleren
  - 1 punt: passende hulp-, meld- of verificatieroute kiezen
  - 1 punt: veilige en respectvolle follow-up kiezen
- PT8-varianten zijn volledig gespecificeerd in de JSON. Samenvatting:
  - lj1-vmbo: Groepschat: grap die niet meer grappig is — In de klassenchat staat een bewerkte afbeelding van Sam als sticker. Sam schrijft: “Stop, haal dit weg.” Jij ziet dat anderen willen doorsturen.
  - lj1-hv: Challenge: locatie en rooster delen — In een groepschat gaat een challenge rond: “Laat zien waar je bent: stuur je rooster en zet je live locatie aan.” Een paar leerlingen zetten druk om mee te doen.
  - lj3-vmbo: Nepaccount met naam en foto — Er verschijnt een account met de naam en foto van een leerling. Het account plaatst vervelende reacties. De leerling zegt dat hij dit account niet heeft gemaakt.
  - lj3-hv: Gemanipuleerde clip via anoniem account — Een korte clip over een docent of leerling gaat rond via een anoniem account. De clip lijkt echt, maar context ontbreekt en beeld en geluid lopen net niet gelijk.
- PT8 v3.4-regel: alle schermen vragen naar een veilige beoordeling of handeling; geen omgekeerde prompt waarin een slechte actie als antwoord gekozen moet worden.
- Acceptatiecriteria:
  - Elke variant heeft precies 4 schermen en precies één scorecategorie per scherm.
  - Geen scherm mag meer dan één correcte optie vereisen.
  - Harmful-share, retaliation en unsafe-evidence flags activeren de juiste caps.
  - Alle scenario’s moeten zonder expliciete of schokkende inhoud kunnen worden getoond.
  - Geen PT8-scherm gebruikt een omgekeerde vraagvorm waarbij de leerling een slechte actie als “te vermijden” moet kiezen.
  - Elke correcte PT8-optie beschrijft een veilige beoordeling of veilige handeling die de leerling wél kan uitvoeren.

## 10. Aggregatiecounters
Codex moet aggregaten bijwerken per assessment/class/cohort/grade/track/window. Minimaal: pogingen, afgeronde pogingen, som zelfinschatting, bandverdeling zelfinschatting, som totaalscore, SR-score, PT-score, kerndoelscores, subdoelscores, item-correct/unknown/distractor counters, PT-errorcategorieën en PT8-harmful flags.

## 11. Codex-acceptatiecriteria
- JSON valideert met een standaard JSON-parser.
- Alle vier assessmentIds hebben exact 10 SR-items.
- Alle SR-items hebben een exclusieve optie “Ik weet het niet.” met score 0.
- Geen item vereist internet, echte accounts, echte uploads of echte externe rapportage.
- Maxscore is 36: SR 10 + PT 26.
- Leerlingfeedback kan worden getoond zonder persistente individuele pogingrij.
- Permanente opslag bevat uitsluitend aggregate counters per classId/cohort/gradeLevel/track/assessmentWindow.
- PT8 heeft per variant 4 schermen, 4 categorieën en caps op schadelijke acties.
- PT7 voldoet per niveau aan levelMinimums.
- Resultaatpagina bevat verplichte caveat en gebruikt geen verboden normatieve labels.
- V3.5: De vier HTTPS-/slotje-items hebben een visuele stimulus-specificatie en noemen `slotje` of `https://` niet in de vraagtekst zelf.
- V3.5: Alle 40 SR-items behouden een item-level qualityControl-marker; gewijzigde HTTPS-items krijgen aanvullend een V3.5-reviewmarker.
- V3.5: PT8 bevat geen omgekeerde vraagvorm waarin een foutieve handeling als juiste antwoord gekozen moet worden omdat de prompt vraagt wat vermeden moet worden.
- V3.5: Permanente opslag blijft aggregaatniveau; leerlingresultaat blijft vluchtig/client-side.
- V3.6: De vier HTTPS-/slotje-items zijn vervangen door een phishing-/mailstimulusfamilie met niet-interactieve e-mailmock-ups.
- V3.6: De totale SR-score blijft 10 punten per nulmeting; elk nieuw phishing-mailitem is single-choice met precies één correct antwoord.
- V3.6 sync: Markdown en actieve JSON gebruiken dezelfde canonical item-id's: `lj1v-sr2-roosterlink-mail`, `lj1h-sr2-roosterlink-mail`, `lj3v-sr1-cijferlink-mail`, `lj3h-sr1-leeromgeving-mail`.

## 12. Pilotanalyse en revisieregels
- Minimum vóór claims: voer minimaal één pilotronde uit per doelgroep voordat items worden frozen.
- Analyseer correctRate, unknownRate, distractor distribution, PT-errorcategorieën, SR/PT-relatie, zelfinschatting-totaalscoreverschil en fairness per leerweg.
- Revisietriggers: correctRate >90%, correctRate <25%, unknownRate >30%, harmfulOptionRate >10%, of grote trackverschillen.
- Cognitieve interviews aanbevolen voor PT8 alle varianten, PT7 leerjaar 3, AI/privacy, HTTPS/phishing en data/verhouding.

## 13. Toegestane en verboden claims
### Toegestaan
- De meting geeft per klas, leerjaar en cohort een formatief-diagnostisch beeld van geselecteerde onderdelen van digitale geletterdheid.
- De resultaten kunnen worden gebruikt om onderwijsaccenten en vervolgactiviteiten te bepalen.
- De zelfinschatting kan worden vergeleken met de behaalde totaalscore als reflectiesignaal.
### Verboden
- Dit is een gevalideerd meetinstrument.
- Deze leerling beheerst digitale geletterdheid wel/niet.
- Deze leerling is individueel gegroeid.
- Een hogere score bewijst causaal dat het curriculum effect heeft gehad.
- De totaalscore is een volledig oordeel over digitale geletterdheid.

## 14. Implementatieopdracht aan Codex
Implementeer deze v3.5 als vervanging van v3.4. Gebruik de JSON als machineleesbare bron en dit Markdown-document als inhoudelijke specificatie. Verwerk de v3.5-wijziging in de JSON door bij de vier HTTPS-/slotje-items een stimulusobject voor de adresbalk/linkweergave op te nemen en de vraagtekst vrij te houden van `slotje` en `https://`. Alle leerlingteksten moeten Nederlands zijn, inclusief diakrieten. Verwijder of verberg correcte antwoorden, rationales, flags, caps en interne metadata in de leerlinginterface.
