# Herzien ontwerp nulmetingen Digitale Geletterdheid — versie 3.7

Status: Codex-bruikbare verbeterde pilotversie. Niet presenteren als gevalideerd meetinstrument.

Bronketenstatus: inhoudelijke source direction, niet de actuele runtime-export. De canonieke actuele inhoudsbron is `src/data/assessments.ts#assessments`; verwachte assessment-build `dg-pilot-2026.08.25.3`, build-inhoudshash `09fc01f801f440515804723497832569bd2aca2168d489b404c056b386882c37`.

## 1. Wat is verbeterd in v3.7
- PT3 gebruikt minder opvallende StreamFlix-mails en kent de twee signaalpunten alleen toe aan twee onafhankelijke dimensies: één afwijking in afzender/linkherkomst en één riskant verzoek of drukmiddel. Twee signalen uit dezelfde dimensie leveren dus niet automatisch twee punten op.
- PT4 draait volledig in de webapp als compacte spreadsheetomgeving. Filter- en sorteerhandelingen plus een tijdgestempeld actielog vervangen de afhankelijkheid van externe spreadsheetsoftware en een overgetypte eindcode.
- PT8 is expliciet geen anker. De vier varianten lopen inhoudelijk op van concrete toestemming en niet delen naar steun, identiteitsmisbruik, kanaalverificatie en herstel van gemanipuleerde informatie.
- `lj1h-sr4-search-query` laat bronkaarten beoordelen en stelt niet dat een goede zoekterm betrouwbaarheid garandeert. `lj3h-sr6-graph-scale` toont daadwerkelijk een genormaliseerde grafiek.
- Afleiders bij aanbevelingen, platformafhankelijkheid en andere SR-items zijn herschreven als plausibele misconcepties. Absolute woorden die het correcte antwoord konden verraden zijn uit vrijwel alle onjuiste opties verwijderd.
- Samengestelde correcte antwoorden zijn waar nodig opgesplitst: de fotovragen in leerjaar 3 beoordelen niet verder delen en verwijderen/melden als afzonderlijke selecties.
- De vier leerlingvragen 9 zijn in de pilotwerkversie vervangen door AI/21D-items met itemversie `vraag9-ai-21d-v5`; leerjaar 1 gebruikt actiekaartjes en leerjaar 3 een trainingsdatadashboard.
- De itemidentiteiten en versiegrenzen in deze source direction worden door `verify:content-sync` tegen actieve JSON en appitems gecontroleerd; exacte actuele leerlingtekst en scoring staan in de reproduceerbaar gegenereerde overzichten.
- De mailstimuli tonen URL-achtige tekst alleen als niet-klikbare linkweergave.
- De v3.4-verbeteringen blijven gehandhaafd: aangescherpte afleiders, eenduidige scoring, geen omgekeerde PT8-vraagvorm en aangevulde PT-acceptatiecriteria.

## 2. Bindende ontwerpbesluiten
- Doel: formatieve nulmeting en klassikale/cohortmatige diagnose, niet summatief.
- Geen individuele groeianalyse; analyse vindt plaats per klas, leerjaar, cohort, niveau en afnamevenster.
- Leerling ziet direct na afname wel een persoonlijk resultaat en kan client-side een PDF downloaden.
- Individuele antwoorden, scores, zelfinschatting en PDF worden niet permanent opgeslagen.
- Permanente opslag bestaat uitsluitend uit aggregatiecounters.
- De itemsetscore blijft zichtbaar als compacte, secundaire beschrijving van de prestaties op precies deze selectie vragen en taken. Zij is geen algemene schaal voor digitale geletterdheid.
- De itemsetscore wordt altijd aangevuld met SR/PT-splitsing, kerndoelscores en subdoeldetails; het profiel is leidend.
- Een subdoel waaraan precies één item of taak bijdraagt, wordt gerapporteerd als itemsignaal met punten en zonder percentage-subscore.
- Zelfinschatting blijft één niet-scorende schaalvraag van 0 tot 100.
- Multiple-select-items gebruiken partial scoring en schadelijke caps.
- PT8 gebruikt vier inhoudelijk oplopende schermen met categorie-scoring en is geen invariantiestudie of ankerfamilie.
- Gebruik geen normatieve labels zoals onvoldoende, voldoende, goed, gevorderd, beheerst, geslaagd of gezakt.

## 3. Scorearchitectuur
| Onderdeel | Max. punten |
|---|---:|
| Selected response | 11 |
| Performance tasks | 26* |
| Totaal | 37* |

\* Dit is de beoogde standaardverhouding. In de actieve variant `lj1-vmbo` heeft PT4 twee afzonderlijk gescoorde handelingen; daardoor bedraagt die variant 35 punten (SR 11 + PT 24). De overige varianten hebben vier PT4-criteria en komen uit op 37 punten.

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
PT8 bestaat per leerling uit vier schermen. Elk scherm meet één categorie en levert maximaal 1 punt op. De categorieën worden per niveau concreter of complexer ingevuld: risico/toestemming, niet verspreiden of escaleren, hulp/melding/verificatie en steun/beveiliging/herstel. Schadelijk delen, wraakacties of onveilig bewijs delen beperken de itemsetscore volgens caps. PT8 is bewust geen anker: verschillen tussen varianten mogen niet als meetinvariantie worden geïnterpreteerd.

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

#### `lj1v-vraag9-ai-acties-v5` — 21D
- Leerlingvraagnummer: 9; interne plek: SR2.
- Vraagtype: binary-card-sort.
- Anchorstatus: concept-anchor; pilot-work-version.
- Max. punten: 2; 0,5 punt per correct geplaatst kaartje.
- Stimulus: realistische, niet-interactieve KletsGPT-mock-up.
  - Leerling: "Geef een feit voor mijn presentatie over leren met muziek."
  - KletsGPT: "Volgens LeerMonitor 2025 leert 68% van de brugklassers beter met muziek."
- Vraag: Sorteer vier acties bij het gebruiken van AI.
- Categorieën: `Verstandig` en `Niet verstandig`.
- Kaartjes:
  - Alleen informatie invoeren die nodig is voor je opdracht. *(Verstandig)*
  - Je naam, klas en school toevoegen. *(Niet verstandig)*
  - De bron en het percentage controleren. *(Verstandig)*
  - KletsGPT vragen of het zelf gelijk heeft. *(Niet verstandig)*
- `Ik weet het niet.` geeft 0 punten en is exclusief.
- Scoring: maxPoints 2; rule `matching-per-card`; scoreBy `option-id`; doNotScoreBy `answer-position`.
- Onderbouwing: Meet vier korte, eenduidige beslissingen over doelgerichte invoer, dataminimalisatie en onafhankelijke controle van AI-uitvoer.

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
- Vraag: In WhatsApp staat: “Morgen geen school door storm. Stuur door!” Je ziet geen bericht van school zelf. Wat doe je voordat je het bericht doorstuurt?
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

#### `lj1v-sr7-online-personal-data` — 23B
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Je speelt een online game. Iemand die je alleen uit de game kent, vraagt: “Hoe heet je echt, hoe oud ben je en in welke buurt woon je?” Wat is de beste eerste reactie?
- Antwoordopties:
  - A. Je deelt je voornaam en leeftijd, maar houdt je buurt geheim.
  - B. Je vraagt waarom die persoon dat wil weten en beslist daarna.
  - C. Je deelt de gevraagde persoonsgegevens niet. *(correct)*
  - D. Je geeft de gegevens als jullie al een tijdje samen spelen.
  - E. Ik weet het niet.
- Onderbouwing: Meet veilig omgaan met persoonlijke gegevens in contact met iemand die de leerling alleen online kent.
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
  - D. Of je de afbeelding een beetje verandert; dan hoef je geen bron te noemen.
  - E. Ik weet het niet.
- Onderbouwing: Maakt 22A sterker door gebruik, bewerken en online delen mee te nemen zonder Creative Commons-jargon.
- V3.4-review: kern-DG relevant, vraagstam logisch, afleiders niet absurd, scoring eenduidig. Bevestigen met pilotdata.

#### `lj1v-sr9-photo-consent` — 23B
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: In WhatsApp wil je een foto van drie klasgenoten in de klassenapp zetten. Wat doe je eerst?
- Antwoordopties:
  - A. Vragen of iedereen op de foto dat goed vindt. *(correct)*
  - B. De foto alleen in de klassenapp zetten; dan is toestemming niet nodig.
  - C. De namen weglaten; dan mag je de foto altijd delen.
  - D. De foto plaatsen en verwijderen als iemand klaagt.
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
  - B. De app ziet er tijdelijk minder mooi uit.
  - C. Leerlingen moeten misschien wennen aan een nieuw icoon.
  - D. Leerlingen krijgen dan automatisch minder huiswerk.
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

#### `lj1h-vraag9-ai-acties-v5` — 21D
- Leerlingvraagnummer: 9; interne plek: SR2.
- Vraagtype: binary-card-sort.
- Anchorstatus: concept-anchor; pilot-work-version.
- Max. punten: 2; 0,5 punt per correct geplaatst kaartje.
- Stimulus: realistische, niet-interactieve KletsGPT-mock-up.
  - Leerling: "Geef een feit voor mijn presentatie over leren met muziek."
  - KletsGPT: "Volgens LeerMonitor 2025 leert 68% van de brugklassers beter met muziek."
- Vraag: Sorteer de acties bij zorgvuldig gebruik van AI.
- Categorieën: `Verstandig` en `Niet verstandig`.
- Kaartjes:
  - Doel en doelgroep van je presentatie noemen. *(Verstandig)*
  - Een privébericht van een klasgenoot toevoegen. *(Niet verstandig)*
  - De oorspronkelijke bron en bewering controleren. *(Verstandig)*
  - Alleen KletsGPT om bevestiging en een link vragen. *(Niet verstandig)*
- `Ik weet het niet.` geeft 0 punten en is exclusief.
- Scoring: maxPoints 2; rule `matching-per-card`; scoreBy `option-id`; doNotScoreBy `answer-position`.
- Onderbouwing: Meet vier korte, eenduidige beslissingen over doelgerichte invoer, privé-informatie en onafhankelijke controle van AI-uitvoer.

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
- Vraag: Je zoekt cijfers over e-bikegebruik onder jongeren in Nederland. Welk zoekresultaat is het beste startpunt om te openen en daarna op methode, datum en bron te controleren?
- Antwoordopties:
  - A. **Landelijke Mobiliteitsmonitor 2025** — overheidsstatistiek; landelijk onderzoek onder 8.200 jongeren, met publicatiedatum en steekproefuitleg. *(correct)*
  - B. **E-bikeShop: bijna iedere tiener wil elektrisch** — webwinkelblog; opvallend percentage zonder methode of deelnemers.
  - C. **Poll van klas 1H over fietsen naar school** — schoolpoll onder 27 leerlingen uit één klas.
  - D. **Ervaringen met mijn eerste e-bike** — jongerenforum met persoonlijke verhalen zonder landelijke aantallen.
  - E. Ik weet het niet.
- Onderbouwing: Meet een eerste bronselectie na een zoekactie. De formulering maakt expliciet dat ook het beste resultaat na openen nog op methode, datum en bron moet worden gecontroleerd; geen zoekterm of resultaatkaart garandeert betrouwbaarheid.
- Prioriteit-4-review: bronkaarten maken bronsoort, omvang en transparantie zichtbaar. Bevestigen met cognitieve interviews en pilotdata.

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

#### `lj1h-sr7-online-personal-data` — 23B
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Je speelt een online game. Iemand die je alleen uit de game kent, vraagt: “Hoe heet je echt, hoe oud ben je en in welke buurt woon je?” Wat is de beste eerste reactie?
- Antwoordopties:
  - A. Je deelt je voornaam en leeftijd, maar houdt je buurt geheim.
  - B. Je vraagt waarom die persoon dat wil weten en beslist daarna.
  - C. Je deelt de gevraagde persoonsgegevens niet. *(correct)*
  - D. Je geeft de gegevens als jullie al een tijdje samen spelen.
  - E. Ik weet het niet.
- Onderbouwing: Meet veilig omgaan met persoonlijke gegevens in contact met iemand die de leerling alleen online kent.
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

#### `lj3v-sr1-cijfermail` — 23A
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Stimulus: niet-interactieve e-mailmock-up (`email-message`)
  - Van: Cijferportaal <noreply@cijferportaal-school.nl>
  - Aan: sanne@leerling.citadelcollege.nl
  - Datum: Vandaag 16:18
  - Onderwerp: Nieuw cijfer beschikbaar
  - Body:
    - Hallo Sanne,
    - Er staat een nieuw cijfer klaar. Log in om je cijfer te bekijken.
  - Linktekst: Bekijk cijfer
  - Linkweergave: `https://cijferportaal-school.nl/login`
- Vraag: Wat doe je?
- Antwoordopties:
  - A. Ik open mijn cijfers via de normale schoolomgeving. *(correct)*
  - B. Ik gebruik de knop, want cijfers bekijken vraagt altijd om inloggen.
  - C. Ik gebruik de knop, omdat de mail van een cijferportaal lijkt te komen.
  - D. Ik zoek de naam van de site op en klik dan alsnog op de link.
  - E. Ik weet het niet. *(score 0, exclusief)*
- CorrectAnswer: `A`
- HarmfulAnswers: `[]`
- Scoring: maxPoints 1; rule `exact-choice`; unknownScoresZero `true`; unknownExclusive `true`.
- Onderbouwing: Meet keuze voor normale schoolomgeving bij cijferlogincontext; afleiders richten op verwachte login, afzendernaamvertrouwen en zwakke verificatie.
- V3.7-review: cijfermail aangescherpt naar logincontext met plausibele verificatiefout.

#### `lj3v-vraag9-ai-stage-training-v5` — 21D
- Leerlingvraagnummer: 9; interne plek: SR2.
- Vraagtype: compound-single-choice met trainingsdatadashboard.
- Anchorstatus: concept-anchor; pilot-work-version.
- Max. punten: 2; twee deelvragen van 1 punt.
- Stimulus: StageMatch vermeldt `Belangrijk: digitaal schoolproject` en `Niet vereist: programmeerclub`. In de vier oude trainingsrijen zijn kandidaten A en B met programmeerclub gekozen en kandidaten C en D zonder programmeerclub niet gekozen, ondanks hogere projectscores. Nieuwe kandidaat E heeft projectscore 9, geen programmeerclub en krijgt `Niet geschikt`.
- Deelvraag A: Wat heeft de AI waarschijnlijk geleerd?
  - Programmeerclub telt zwaarder dan het schoolproject. *(correct)*
  - Zonder programmeerclub heeft iemand geen digitaal project.
  - De AI kan geen cijfers uit profielen gebruiken.
  - Ik weet het niet.
- Deelvraag B: Hoe verbeter je de AI het best?
  - Train met verschillende kandidaten en relevante projectgegevens. *(correct)*
  - Voeg meer gekozen leden van de programmeerclub toe.
  - Verwijder de cijfers van alle schoolprojecten.
  - Ik weet het niet.
- Scoring: maxPoints 2; compound-sum; scoreBy `option-id`; antwoorden per deelvraag randomiseren; onbekend blijft onderaan en scoort 0.
- Onderbouwing: Meet herkenning van een historisch selectiepatroon en verbetering van trainingsdata zonder kennis van programmeerclubs of stagebeleid te vereisen.

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

#### `lj3v-sr7-online-personal-data` — 23B
- Vraagtype: single
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Je speelt een online game. Iemand die je alleen uit de game kent, vraagt: “Hoe heet je echt, hoe oud ben je en in welke buurt woon je?” Wat is de beste eerste reactie?
- Antwoordopties:
  - A. Je deelt je voornaam en leeftijd, maar houdt je buurt geheim.
  - B. Je vraagt waarom die persoon dat wil weten en beslist daarna.
  - C. Je deelt de gevraagde persoonsgegevens niet. *(correct)*
  - D. Je geeft de gegevens als jullie al een tijdje samen spelen.
  - E. Ik weet het niet.
- Onderbouwing: Meet veilig omgaan met persoonlijke gegevens in contact met iemand die de leerling alleen online kent.
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
- Vraag: In een groepsapp deelt iemand zonder toestemming een foto van een klasgenoot. De klasgenoot staat er ongemakkelijk op. Welke twee acties zijn passend?
- Antwoordopties:
  - A. De foto niet verder delen. *(correct)*
  - B. De afzender vragen de foto te verwijderen. *(correct)*
  - C. De foto doorsturen naar vrienden die de klasgenoot goed kennen.
  - D. Een grapje maken, zodat het minder serieus voelt.
  - E. Ik weet het niet.
- Onderbouwing: Niet verspreiden en de afzender om verwijderen vragen zijn afzonderlijke acties; iedere juiste selectie levert 0,5 punt op.
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

#### `lj3h-sr1-accountmail` — 23A
- Vraagtype: single
- Anchorstatus: concept-anchor
- Max. punten: 1
- Stimulus: niet-interactieve e-mailmock-up (`email-message`)
  - Van: Schoolaccount beheer <beheer@schoolaccount-citadel.nl>
  - Aan: sanne@leerling.citadelcollege.nl
  - Datum: Vandaag 08:06
  - Onderwerp: Controle van je schoolaccount
  - Body:
    - Hallo Sanne,
    - We controleren deze week de toegang tot schoolaccounts. Bevestig je account om zonder onderbreking Teams, OneDrive en Magister te blijven gebruiken.
  - Linktekst: Account bevestigen
  - Linkweergave: `https://schoolaccount-citadel.nl/controle`
- Vraag: Welke reactie past het best?
- Antwoordopties:
  - A. Ik ga zelf naar de bekende schoolomgeving en controleer daar mijn account. *(correct)*
  - B. Ik gebruik de knop, omdat de mail meerdere bekende schooldiensten noemt.
  - C. Ik gebruik de knop als de inlogpagina er hetzelfde uitziet als normaal.
  - D. Ik antwoord op de mail en vraag of mijn account echt gecontroleerd moet worden.
  - E. Ik weet het niet. *(score 0, exclusief)*
- CorrectAnswer: `A`
- HarmfulAnswers: `[]`
- Scoring: maxPoints 1; rule `exact-choice`; unknownScoresZero `true`; unknownExclusive `true`.
- Onderbouwing: Meet keuze voor bekende schoolomgeving bij accountcontrolecontext; afleiders richten op bekende diensten, uiterlijk van inlogpagina en antwoorden op afzender.
- V3.7-review: accountcontrolemail aangescherpt met bekende diensten, professioneel klinkende afzender en realistische afleiders.

#### `lj3h-vraag9-ai-stage-training-v5` — 21D
- Leerlingvraagnummer: 9; interne plek: SR2.
- Vraagtype: compound-single-choice met trainingsdatadashboard.
- Anchorstatus: concept-anchor; pilot-work-version.
- Max. punten: 2; twee deelvragen van 1 punt.
- Stimulus: StageMatch vermeldt `Belangrijk: digitaal schoolproject` en `Niet vereist: programmeerclub`. In de vier historische trainingsrijen zijn kandidaten A en B met programmeerclub gekozen en kandidaten C en D zonder programmeerclub niet gekozen, ondanks hogere projectscores. Nieuwe kandidaat E heeft projectscore 9, geen programmeerclub en krijgt `Niet geschikt`.
- Deelvraag A: Welk probleem is hier het meest waarschijnlijk?
  - De AI neemt een oud selectiepatroon over als maat voor geschiktheid. *(correct)*
  - De gegevens bewijzen dat programmeerclub stagesucces veroorzaakt.
  - Kandidaat E is ongeschikt omdat één profielveld afwijkt.
  - Ik weet het niet.
- Deelvraag B: Welke verbetering is het sterkst?
  - Gebruik relevante criteria, gevarieerde voorbeelden en een aparte testgroep. *(correct)*
  - Train verder met dezelfde historische selecties omdat die echt zijn.
  - Verberg alleen het veld programmeerclub en test verder niets.
  - Gebruik het AI-oordeel als advies zonder het systeem te evalueren.
  - Ik weet het niet.
- Scoring: maxPoints 2; compound-sum; scoreBy `option-id`; antwoorden per deelvraag randomiseren; onbekend blijft onderaan en scoort 0.
- Onderbouwing: Meet onderscheid tussen historisch patroon en geschiktheid plus relevante, gevarieerde training en onafhankelijke toetsing.

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
- Anchorstatus: concept-anchor
- Max. punten: 1
- Stimulus: een staafgrafiek met een gemeenschappelijke schaal van 0 tot 20 klachten per 1.000 gebruikers. App A staat op 20; App B op 5. Bij de balken blijven de ruwe aantallen zichtbaar: 20/1.000 en 50/10.000.
- Vraag: De grafiek vergelijkt het aantal klachten per 1.000 gebruikers. Welke conclusie wordt door de grafiek ondersteund?
- Antwoordopties:
  - A. App A heeft naar verhouding meer klachten dan App B. *(correct)*
  - B. App B heeft naar verhouding meer klachten, omdat het totale aantal klachten daar hoger is.
  - C. De apps verschillen weinig, omdat beide aantallen binnen dezelfde schaal vallen.
  - D. De balken zijn nog niet vergelijkbaar, omdat de apps verschillende aantallen gebruikers hebben.
  - E. Ik weet het niet.
- Onderbouwing: De verhouding is zichtbaar genormaliseerd, zodat het lezen en interpreteren van de grafiek primair is en hoofdrekenen niet de hele opgave bepaalt.
- Prioriteit-4-review: volg resterende taal- en rekenbelasting in de pilot en vergelijk zo mogelijk antwoordpatronen met een versie waarin de normalisatie niet vooraf is gegeven.

#### `lj3h-sr7-online-personal-data` — 23B
- Vraagtype: single
- Anchorstatus: replaceable
- Max. punten: 1
- Vraag: Je speelt een online game. Iemand die je alleen uit de game kent, vraagt: “Hoe heet je echt, hoe oud ben je en in welke buurt woon je?” Wat is de beste eerste reactie?
- Antwoordopties:
  - A. Je deelt je voornaam en leeftijd, maar houdt je buurt geheim.
  - B. Je vraagt waarom die persoon dat wil weten en beslist daarna.
  - C. Je deelt de gevraagde persoonsgegevens niet. *(correct)*
  - D. Je geeft de gegevens als jullie al een tijdje samen spelen.
  - E. Ik weet het niet.
- Onderbouwing: Meet veilig omgaan met persoonlijke gegevens in contact met iemand die de leerling alleen online kent.
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
- Vraagtype: multiple
- Anchorstatus: concept-anchor
- Max. punten: 1
- Vraag: Iemand deelt zonder toestemming een privéfoto van een klasgenoot in een besloten groep. Welke twee acties zijn passend?
- Antwoordopties:
  - A. De foto niet verder delen. *(correct)*
  - B. De foto via de veilige meldroute van het platform rapporteren. *(correct)*
  - C. De foto doorsturen naar een kleiner groepje dat je vertrouwt.
  - D. Reageren met een grap, zodat de spanning daalt.
  - E. Ik weet het niet.
- Onderbouwing: Niet verspreiden en veilig rapporteren worden afzonderlijk beoordeeld; iedere juiste selectie levert 0,5 punt op.
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

## 8. Itemreviewmatrix v3.7
| Versie | Item | Subdoel | Actie | Oordeel |
|---|---|---|---|---|
| lj1-vmbo | `lj1v-sr1-pw-passphrase` | 23A | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-vraag9-ai-acties-v5` | 21D | volledig herschreven op expliciete gebruikersinstructie | pilotreview nodig op eenduidigheid van de vier kaartplaatsingen |
| lj1-vmbo | `lj1v-sr3-phone` | 21A | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr4-official-source` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr5-algorithm` | 21B | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr6-data-poll` | 21C | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr7-online-personal-data` | 23B | id gemigreerd; alias `lj1v-sr7-ai-check` blijft beschikbaar | inhoud ongewijzigd; pilotwerkversie |
| lj1-vmbo | `lj1v-sr8-image-rights` | 22A | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr9-photo-consent` | 23B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-vmbo | `lj1v-sr10-platform-risk` | 23C | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr1-pw-passphrase` | 23A | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-vraag9-ai-acties-v5` | 21D | volledig herschreven op expliciete gebruikersinstructie | pilotreview nodig op privacy- en verificatieafleiders |
| lj1-hv | `lj1h-sr3-phone-actions` | 21A | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr4-search-query` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr5-feed-sample` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr6-sample` | 21C | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr7-online-personal-data` | 23B | id gemigreerd; alias `lj1h-sr7-ai-startpunt` blijft beschikbaar | inhoud ongewijzigd; pilotwerkversie |
| lj1-hv | `lj1h-sr8-image-source` | 22A | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr9-threat-message` | 23B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj1-hv | `lj1h-sr10-ad-profile` | 23C | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr1-cijfermail` | 23A | Phishing-/linkcontrole-item aangescherpt in v3.7 | pilotreview nodig op cijferlogincontext en zwakke verificatie |
| lj3-vmbo | `lj3v-vraag9-ai-stage-training-v5` | 21D | volledig herschreven op expliciete gebruikersinstructie | pilotreview nodig op begrip van trainingsdata en selectiepatronen |
| lj3-vmbo | `lj3v-sr3-phone-actions` | 21A | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr4-health-source` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr5-sponsored` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr6-percent` | 21C | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr7-online-personal-data` | 23B | id gemigreerd; alias `lj3v-sr7-ai-factcheck` blijft beschikbaar | inhoud ongewijzigd; pilotwerkversie |
| lj3-vmbo | `lj3v-sr8-music-rights` | 22A | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj3-vmbo | `lj3v-sr9-photo-shared` | 23B | opgesplitst in twee losse acties | pilotreview nodig op partial scoring en afleiderverdeling |
| lj3-vmbo | `lj3v-sr10-digital-chances` | 23C | aangescherpt in v3.4 | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr1-accountmail` | 23A | Phishing-/linkcontrole-item aangescherpt in v3.7 | pilotreview nodig op bekende diensten, visueel vertrouwen en replyen |
| lj3-hv | `lj3h-vraag9-ai-stage-training-v5` | 21D | volledig herschreven op expliciete gebruikersinstructie | pilotreview nodig op patroon/causaliteit en modeltoetsing |
| lj3-hv | `lj3h-sr3-phone-actions` | 21A | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr4-triangulation` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr5-filterbubble` | 21B | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr6-graph-scale` | 21C | genormaliseerde grafiek toegevoegd | pilotreview nodig op taal- en rekenbelasting |
| lj3-hv | `lj3h-sr7-online-personal-data` | 23B | id gemigreerd; alias `lj3h-sr7-ai-source-check` blijft beschikbaar | inhoud ongewijzigd; pilotwerkversie |
| lj3-hv | `lj3h-sr8-remix-rights` | 22A | behouden na review | sterk genoeg voor pilot na v3.4-review |
| lj3-hv | `lj3h-sr9-private-photo` | 23B | opgesplitst in twee losse acties | pilotreview nodig op partial scoring en afleiderverdeling |
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
- Doel: Meet of leerlingen phishingsignalen rechtstreeks in een e-mail herkennen en daarna via een veilige, zelf gekozen route controleren wat er aan de hand is.
- Scoring:
  - 1 punt: één herkomstsignaal gemarkeerd: een afwijking in het afzenderadres of linkdomein
  - 1 punt: één onafhankelijk inhoudssignaal gemarkeerd: het verzoek om een wachtwoord of de uitgeoefende tijdsdruk
  - 1 punt: in de ABCD-vervolgvraag gekozen voor controle via de zelf geopende officiële StreamFlix-app of bekende website
- Gedeelde stimuluskenmerken:
  - Fictieve dienst: StreamFlix.
  - Een geloofwaardige onderwerpregel, gepersonaliseerde of zakelijke aanhef en verzorgde ondertekening kunnen als afleider voorkomen.
  - De mail bevat een verzoek om accountgegevens en milde maar duidelijke tijdsdruk; de formulering vermijdt karikaturale hoofdletters, extreme dreiging en opzichtig lange nepadressen.
  - De linktekst klinkt functioneel; het afwijkende doeladres verschijnt alleen bij hover, toetsenbordfocus of selectie.
  - De link is een niet-navigerende knop en kan geen echte website openen.
- Interactie eerste deelvraag:
  - Vraag: `Markeer twee onderdelen waaraan je kunt zien dat deze mail niet betrouwbaar is.`
  - De leerling klikt rechtstreeks op onderdelen van de e-mail en kan maximaal twee onderdelen selecteren.
  - Een selectie krijgt een duidelijke blauwe omlijning en een vinkje; opnieuw klikken maakt de selectie ongedaan.
  - Herkomstsignalen: afwijkend afzenderdomein en afwijkend doeladres achter de knop.
  - Inhoudssignalen: het verzoek om het wachtwoord in te voeren en de tijdsdruk of dreiging met beperking.
  - Afleiders: een geloofwaardige afzendernaam, ontvanger, datum/tijd, onderwerp, aanhef, beleefde afsluiting en ondertekening.
  - Eén signaal uit elke dimensie levert de volledige 2 punten voor dit deel op. Twee signalen uit dezelfde dimensie leveren samen 1 punt; daarmee zijn de twee signaalpunten aantoonbaar onafhankelijker.
- Interactie tweede deelvraag:
  - Vraag: `Wat kan [naam] nu het best doen?`
  - Vraagtype: single choice met precies vier opties, in de UI aangeduid met A, B, C en D.
  - Optievolgorde wordt per sessie gerandomiseerd en de getoonde volgorde wordt gelogd.
  - Correcte handeling: niet via de mailknop handelen, maar zelf de officiële StreamFlix-app of het bekende webadres openen en daar het account controleren.
- Varianten:
  - lj1-vmbo: herkenbare accountmelding met milde tijdsdruk en een afwijkend maar leesbaar afzender- en linkdomein.
  - lj1-hv: een verzorgde verificatiemail waarin de zichtbare merknaam en werkelijke domeinen niet samenvallen.
  - lj3-vmbo: accountcontrole met een plausibel beveiligingsverhaal, verzoek om het huidige wachtwoord en een afwijkend subdomein.
  - lj3-hv: sessievalidatie na een aanmelding, met een geloofwaardige mailopmaak en een URL waarin de merknaam niet het registrabele domein is.
- Acceptatiecriteria:
  - Alle vier varianten gebruiken dezelfde interactielogica en blijven afzonderlijk selecteerbaar en volledig doorloopbaar.
  - Er zijn minimaal twee herkomstsignalen, minimaal twee inhoudssignalen en minimaal drie aanklikbare afleiders; maximaal twee onderdelen kunnen tegelijk zijn geselecteerd.
  - De linkpreview werkt met muis, toetsenbord en aanraking, maar veroorzaakt nooit navigatie.
  - De ABCD-opties worden per sessie gerandomiseerd en de getoonde optievolgorde wordt gelogd.
  - Correcte antwoorden en de classificatie van signalen/afleiders zijn niet zichtbaar in de leerling-UI.
  - Leerjaar 3 bevat minstens één scenario waarin een herkenbare tekst of `https` aan het begin van een adres niet voldoende bewijs is.
  - Alle onderdelen zijn automatisch scorebaar; er is geen open of rubric-gebaseerd antwoord.

### `pt4-data` — Data sorteren, filteren en interpreteren
- Subdoel: 21C
- Max. punten: 4
- Doel: Meet praktische dataverwerking in spreadsheetachtige omgeving.
- Scoring:
  - Per scenario 1 punt voor het juiste filtercriterium, indien een filter wordt gevraagd.
  - Per scenario 1 punt voor de juiste sorteerkolom en 1 punt voor de juiste sorteerrichting, indien beide afzonderlijk worden beoordeeld.
  - `lj1-vmbo` heeft één scenario met twee criteria (2 punten); de overige varianten hebben twee scenario's met samen vier criteria (4 punten).
- Varianten:
  - lj1-vmbo: filter liedjes op genre `Pop` en sorteer op jaar, oplopend.
  - lj1-hv: sorteer bibliotheekboeken op jaar, aflopend; filter daarna op vak `Biologie` en sorteer die selectie op jaar, oplopend.
  - lj3-vmbo: filter bestellingen op categorie `Elektronica` en sorteer op jaar, aflopend; filter daarna bedragen boven 60 en sorteer op bedrag, aflopend.
  - lj3-hv: filter energiedata op kosten boven 500 en sorteer op kosten, aflopend; filter daarna woningtype `B` en sorteer op jaar, aflopend.
- Acceptatiecriteria:
  - Dataset bevat voldoende rijen om filteren/sorteren noodzakelijk te maken.
  - De spreadsheetomgeving is ingebouwd in de taak, toont de resulterende rijen en logt toepassen/resetten met tijdstip, scenario, filter en sortering.
  - Scoring beoordeelt de ingestelde filter- en sorteerhandeling rechtstreeks en kan filterfout, verkeerde sorteerkolom en verkeerde sorteerrichting onderscheiden.
  - Er is geen externe download nodig en geen eindcode die door een typefout fout kan worden gerekend.
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
  - 1 punt: na de laatste wijziging getest en correct eindgedrag bereikt
- Varianten:
  - lj1-vmbo: Bouw vanaf `bij start` een lineair programma waarmee hondje Teddy langs een stilstaande kat en over een boomstam naar zijn bot gaat. Geen besturingsblokken. Focus: sequentie, richting en passende acties.
  - lj1-hv: Bouw vanaf `bij start` een programma waarin Teddy drie gelijke stappen met `herhaal` uitvoert en daarna langs een kat en boomstam naar zijn bot gaat. Focus: herhaling + sequentie.
  - lj3-vmbo: Bouw één programma waarin Teddy tijdens vijf herhalingen met `als Teddy voor kat staat` twee stilstaande katten passeert. Focus: geneste voorwaarde binnen herhaling.
  - lj3-hv: Bouw één programma waarin Teddy tijdens zes herhalingen twee katten met een vaste, zichtbare patrouille passeert. Focus: geneste besturing + redeneren over veranderende toestand.
- Acceptatiecriteria:
  - Als een leerjaar-3-taak alleen volgorde en beweging meet, is deze niet acceptabel.
  - Geef deelpunten voor structuur, volgorde, parameter en eindgedrag.
  - De leerling programmeert zelf; foutopsporing ontstaat door afspelen en verbeteren, niet door twee vooraf gemarkeerde fouten.
  - Code, animatie en het getekende uitvoeringspad gebruiken dezelfde deterministische grid-simulatietrace.
  - Camerarotatie is optioneel, beïnvloedt de simulatie niet en de standaardhoek toont alle informatie die nodig is om de taak op te lossen.
  - Kerndoel 22B mag niet als betrouwbaar geïnterpreteerd worden als PT7 technisch is overgeslagen.
  - Leerjaar 3-taken bevatten altijd een conceptuele eis boven sequentie: variabele, voorwaarde, samengestelde logica of debuggen.

### `pt8-online-behaviour` — Online gedrag en verantwoord handelen
- Subdoel: 23B
- Max. punten: 4
- Doel: Meet online gedrag via realistische, niet-expliciete beslisscenario’s. De vier varianten zijn bewust geen ankerfamilie: de inhoudelijke complexiteit loopt per niveau op. Alle schermen gebruiken positief geformuleerde handelings- of beoordelingsvragen en categorie-scoring.
- Scoring:
  - 1 punt: risico of grens correct herkennen
  - 1 punt: niet delen, liken, doorsturen of escaleren
  - 1 punt: passende hulp-, meld- of verificatieroute kiezen
  - 1 punt: veilige en respectvolle follow-up kiezen
- PT8-varianten zijn volledig gespecificeerd in de canonieke appitems. Samenvatting van de oplopende complexiteit:
  - lj1-vmbo (`pt8-lj1v-photo-consent-v5`): foto van herkenbare klasgenoten; ontbrekende toestemming herkennen, niet verspreiden, iedere betrokkene vragen en bij druk of schade hulp inschakelen.
  - lj1-hv (`pt8-lj1h-private-screenshot-v5`): persoonlijke informatie in een screenshot uit een privéchat; niet doorsturen, steun afstemmen op de betrokkene en bij aanhoudende druk hulp inschakelen.
  - lj3-vmbo (`pt8-lj3v-impersonation-v5`): nepaccount met naam en foto; identiteitsmisbruik herkennen, openbare escalatie vermijden, platformmelding gebruiken en het eigen account beveiligen.
  - lj3-hv (`pt8-lj3h-manipulated-school-post-v5`): gemanipuleerd schoolbericht; twee onafhankelijke herkomstsignalen wegen, verspreiding stoppen, via een officieel kanaal verifiëren en een bevestigde correctie in dezelfde groepscontext delen.
- Prioriteit-4-regel: alle schermen vragen naar een veilige beoordeling of handeling; geen omgekeerde prompt waarin een slechte actie als antwoord gekozen moet worden. De vier varianten mogen niet als meetinvariant of rechtstreeks vergelijkbaar anker worden behandeld.
- Acceptatiecriteria:
  - Elke variant heeft precies 4 schermen en precies één scorecategorie per scherm.
  - Een scherm vraagt hoogstens twee selecties; alleen `lj3-hv` gebruikt dit voor twee afzonderlijke herkomstsignalen binnen één categorie.
  - Harmful-share, retaliation en unsafe-evidence flags activeren de juiste caps.
  - Alle scenario’s moeten zonder expliciete of schokkende inhoud kunnen worden getoond.
  - Geen PT8-scherm gebruikt een omgekeerde vraagvorm waarbij de leerling een slechte actie als “te vermijden” moet kiezen.
  - Elke correcte PT8-optie beschrijft een veilige beoordeling of veilige handeling die de leerling wél kan uitvoeren.

## 10. Aggregatiecounters
Codex moet aggregaten bijwerken per assessment/class/cohort/grade/track/window. Minimaal: pogingen, afgeronde pogingen, som zelfinschatting, bandverdeling zelfinschatting, som itemsetscore, SR-score, PT-score, kerndoelscores, subdoelscores, item-correct/unknown/distractor counters, PT-errorcategorieën en PT8-harmful flags. Enkel-itemsubdoelen blijven daarbij itemsignalen zonder percentagegemiddelde.

## 11. Codex-acceptatiecriteria
- JSON valideert met een standaard JSON-parser.
- Alle vier assessmentIds hebben exact 10 SR-items.
- Alle SR-items hebben een exclusieve optie “Ik weet het niet.” met score 0.
- Geen item vereist internet, echte accounts, echte uploads of echte externe rapportage.
- Vraag 9 telt 2 punten, waardoor het SR-deel 11 punten omvat. De beoogde itemsetscore heeft een maximum van 37 punten (SR 11 + PT 26); de actieve variant `lj1-vmbo` komt door de al bestaande PT4-afwijking uit op 35 (SR 11 + PT 24). De verhouding tussen onderdelen wordt in de toetsmatrijs verantwoord.
- Leerlingfeedback kan worden getoond zonder persistente individuele pogingrij.
- Permanente opslag bevat uitsluitend aggregate counters per classId/cohort/gradeLevel/track/assessmentWindow.
- PT8 heeft per variant 4 schermen, 4 categorieën en caps op schadelijke acties.
- PT8 is expliciet geen anker; de inhoudelijke complexiteit en gevraagde afwegingen lopen op per doelgroep.
- PT7 voldoet per niveau aan levelMinimums.
- Resultaatpagina bevat verplichte caveat en gebruikt geen verboden normatieve labels.
- V3.5: De vier HTTPS-/slotje-items hebben een visuele stimulus-specificatie en noemen `slotje` of `https://` niet in de vraagtekst zelf.
- V3.5: Alle 40 SR-items behouden een item-level qualityControl-marker; gewijzigde HTTPS-items krijgen aanvullend een V3.5-reviewmarker.
- V3.5: PT8 bevat geen omgekeerde vraagvorm waarin een foutieve handeling als juiste antwoord gekozen moet worden omdat de prompt vraagt wat vermeden moet worden.
- V3.5: Permanente opslag blijft aggregaatniveau; leerlingresultaat blijft vluchtig/client-side.
- V3.6: De vier HTTPS-/slotje-items zijn vervangen door een phishing-/mailstimulusfamilie met niet-interactieve e-mailmock-ups.
- V3.6-historie: de SR-score was toen 10 punten per nulmeting. Dit is door vraag 9 v5 gewijzigd naar 11 punten.
- V3.7: De phishing-/linkcontrole-items zijn opnieuw aangescherpt omdat eerdere versies te veel last hadden van sturende vraagstelling, te duidelijke neplinks en te zwakke afleiders. De nieuwe items gebruiken korte handelingsvragen zonder woorden als phishing, verdacht, slotje of https in de vraagtekst. De afleiders zijn realistischer gemaakt: vertrouwen op de afzendernaam, schoolachtige domeinen, personalisatie, bekende diensten, professioneel uiterlijk of antwoorden op de afzender. De correcte handeling blijft steeds: niet via de mailknop inloggen, maar zelf naar de bekende schoolomgeving, roosterapp of officiële schoolomgeving gaan.
- Prioriteit 4: PT3 scoort de twee signaalpunten via onafhankelijke herkomst- en verzoek/drukdimensies; PT4 gebruikt de ingebouwde spreadsheetomgeving en een actielog; PT8 is geen anker en loopt inhoudelijk op; SR-afleiders, bronkaarten, grafiekstimulus en samengestelde antwoorden zijn volgens bovenstaande specificaties herzien.
- Vraag 9 v5-sync: Markdown en actieve JSON gebruiken dezelfde vier AI/21D-item-id's en dezelfde maximumscore van 2 punten.

## 12. Pilotanalyse en revisieregels
- Minimum vóór claims: voer minimaal één pilotronde uit per doelgroep voordat items worden frozen.
- Analyseer correctRate, unknownRate, distractor distribution, PT-errorcategorieën, SR/PT-relatie, het beschrijvende verschil tussen zelfinschatting en itemsetscore, en fairness per leerweg.
- Revisietriggers: correctRate >90%, correctRate <25%, unknownRate >30%, harmfulOptionRate >10%, of grote trackverschillen.
- Cognitieve interviews aanbevolen voor PT8 alle varianten, PT7 leerjaar 3, AI/privacy, phishing en data/verhouding. Onderzoek bij `lj3h-sr6-graph-scale` afzonderlijk resterende rekenbelasting en bij PT3 of de twee signaaldimensies empirisch voldoende onafhankelijk functioneren.

## 13. Toegestane en verboden claims
### Toegestaan
- De meting geeft per klas, leerjaar en cohort een formatief-diagnostisch beeld van geselecteerde onderdelen van digitale geletterdheid.
- De resultaten kunnen worden gebruikt om onderwijsaccenten en vervolgactiviteiten te bepalen.
- De zelfinschatting kan beschrijvend worden vergeleken met de behaalde itemsetscore als reflectiesignaal; beide zijn niet gekalibreerd op dezelfde schaal.
### Verboden
- Dit is een gevalideerd meetinstrument.
- Deze leerling beheerst digitale geletterdheid wel/niet.
- Deze leerling is individueel gegroeid.
- Een hogere score bewijst causaal dat het curriculum effect heeft gehad.
- De itemsetscore is een volledig oordeel over digitale geletterdheid.

## 14. Implementatieopdracht aan Codex
Implementeer deze v3.5 als vervanging van v3.4. Gebruik de JSON als machineleesbare bron en dit Markdown-document als inhoudelijke specificatie. Verwerk de v3.5-wijziging in de JSON door bij de vier HTTPS-/slotje-items een stimulusobject voor de adresbalk/linkweergave op te nemen en de vraagtekst vrij te houden van `slotje` en `https://`. Alle leerlingteksten moeten Nederlands zijn, inclusief diakrieten. Verwijder of verberg correcte antwoorden, rationales, flags, caps en interne metadata in de leerlinginterface.
