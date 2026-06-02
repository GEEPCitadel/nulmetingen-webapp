# Herzien ontwerp nulmetingen Digitale Geletterdheid — selected response v2

Status: werkversie voor Codex-implementatie en pilotreview. Niet gebruiken als leerlingmateriaal zonder interne velden, correcte antwoorden en rationales te verwijderen.

## Hoofdconclusie validiteit

> De nulmetingen Digitale Geletterdheid zijn validiteitsgericht ontworpen als formatieve en diagnostische instrumenten. Ze zijn geschikt als werkversie voor pilotafname en klasdiagnose, maar nog niet als gevalideerd meetinstrument. De resultaten mogen voorlopig niet worden gebruikt voor cijfers, normering of harde individuele beheersingsuitspraken.
>
> De metingen combineren selected-response-items met performance tasks. De selected-response-items geven aanvullende dekking voor kennis, herkenning, beoordeling, veiligheid, informatievaardigheid, AI en digitaal burgerschap. De performance tasks leveren gedragsbewijs voor praktische digitale handelingen, waaronder programmeren via PT7.
>
> Verdere validatie is nodig via expertreview, cognitieve interviews met leerlingen, pilotafname, itemanalyse, betrouwbaarheidsanalyse en fairness-analyse.

## Bindende ontwerpbesluiten

- De nulmetingen zijn formatief en diagnostisch.
- De nulmetingen leveren geen cijfer op.
- Gebruik geen normatieve labels zoals “onvoldoende”, “basisniveau”, “goed” of “gevorderd”.
- Resultaten zijn bedoeld voor klasdiagnose, onderwijsontwikkeling, leerlingreflectie en vergelijking tussen zelfinschatting en behaalde score.
- Er zijn vier versies: `lj1-vmbo`, `lj1-hv`, `lj3-vmbo`, `lj3-hv`.
- Default: 10 selected-response-items per versie.
- Elk SR-item krijgt de vaste optie `Ik weet het niet.` Deze optie scoort 0 punten, staat altijd onderaan en wordt apart geregistreerd.
- Multiple select wordt beperkt gebruikt. VMBO leerjaar 1 heeft geen multiple select in de SR-set; leerjaar 1 havo/vwo en leerjaar 3 wel.
- Er worden geen internetzoekopdrachten en geen reverse image search opgenomen.
- Creative Commons-termen worden niet als basiskennis getoetst. Wel blijft praktisch gedrag rond bron, maker en gebruiksrecht behouden voor 22A.
- HTTPS/slotje en telefoon/Youssef blijven ankerconcepten met oplopende moeilijkheid.
- Kerndoel 22B wordt bewust niet via selected-response-items gemeten. Programmeren en computationele denkstrategieën worden gemeten via de performance task PT7.

## Voorleesbare uitleg voor leerlingen

Je maakt een nulmeting digitale geletterdheid. Je krijgt eerst een vraag waarin je jezelf een score geeft van 0 tot 100. Daarna maak je opdrachten en korte vragen. Sommige opdrachten gaan over bestanden, mail, data, programmeren, veiligheid, online gedrag, informatie en AI. Je hoeft geen internet te gebruiken. Weet je het echt niet? Kies dan `Ik weet het niet`. Dat is niet erg. Het helpt school om te zien wat nog geoefend moet worden. Aan het einde zie je jouw score in procenten. Je ziet ook hoe die score past bij jouw inschatting vooraf. Dit is geen cijfer. De school gebruikt de resultaten om te zien wat de klas al kan en waar nog oefening nodig is.

Sommige vragen gaan over online gedrag, veiligheid en wat je kunt doen als iets vervelend of onveilig is.

## Privacy, startlink en gegevensopslag

De afname is privacyvriendelijk en dataminimaliserend ontworpen. Leerlingen vullen geen naam, e-mailadres of leerlingnummer in. Resultaten worden gekoppeld aan een klas via een `classToken` en opgeslagen met een `anonymousAttemptId`. Laat de uiteindelijke inrichting nog controleren voordat formele AVG-claims worden gedaan.

- `classToken`: staat in de startlink, niet herleidbaar voor leerlingen.
- `classId`: interne verwijzing naar klas.
- `anonymousAttemptId`: willekeurige poging-id.
- Opslaan per poging: `assessmentId`, `classId`, `anonymousAttemptId`, `startedAt`, `completedAt`, `selfAssessmentScore`, `itemResponses`, `performanceTaskResponses`, `scoreSummary`.
- Niet opslaan: leerlingnaam, e-mailadres, leerlingnummer of vrije persoonsgegevens.

## Zelfinschatting

- Vraag: Hoe hoog schat je je eigen digitale geletterdheid in?
- Hulptekst: Schuif het bolletje naar jouw keuze. 0 betekent: ik kan dit bijna niet. 100 betekent: ik kan dit heel goed.
- Schaal: 0 tot 100, stapgrootte 1.
- Niet meetellen in de toetscore.

## Resultaatpagina en PDF

De resultaatpagina toont primair:

- zelfinschatting vooraf in procenten.
- behaalde totaalscore in procenten.
- korte vergelijking tussen zelfinschatting en score zonder normatieve labels.
- score per kerndoel: 21, 22 en 23.
- eventueel detail per subdoel, alleen met waarschuwing.
- knop `Download scoreoverzicht als PDF`.
- afsluitwaarschuwing en verplicht vinkje.

Gebruik voor de totaalscore:

> Je score is het percentage punten dat je op deze nulmeting hebt behaald. Dit is geen cijfer en geen volledig oordeel over wat jij digitaal kunt.

Gebruik voor kerndoelen:

- Kerndoel 21: Bij kerndoel 21 behaalde je X van Y punten. Dit geeft een eerste beeld van hoe je digitale technologie en digitale media inzet.
- Kerndoel 22: Bij kerndoel 22 behaalde je X van Y punten. Dit onderdeel bestaat vooral uit taken waarin je iets maakt of programmeert.
- Kerndoel 23: Bij kerndoel 23 behaalde je X van Y punten. Dit geeft een eerste beeld van hoe je veilig, bewust en verantwoordelijk handelt in digitale situaties.

Subdoelen mogen alleen als detail worden getoond. Gebruik dan:

> Detail bij 21B — Digitale media en informatie: X van Y punten.  
> Dit onderdeel is gebaseerd op een beperkt aantal vragen of taken. Zie dit als een eerste aanwijzing, niet als een volledig oordeel.

Niet gebruiken: `Je beheerst 21B niet.`

De PDF bevat: naam van de nulmeting, datum, klas of klascode, zelfinschatting, totaalscore, vergelijking tussen zelfinschatting en totaalscore, score per kerndoel, eventueel subdoeldetail met dezelfde waarschuwing, en de tekst `Dit is geen cijfer.` De PDF bevat geen leerlingnaam.

## SLO-labels voor resultaatpagina

- **21** — De leerling zet digitale technologie en digitale media in.
- **21A** — De leerling zet digitale systemen functioneel in.
- **21B** — De leerling navigeert doelgericht in het digitale media- en informatielandschap voor het verwerven en verwerken van informatie.
- **21C** — De leerling verkent het gebruik van data en dataverwerking.
- **21D** — De leerling verkent mogelijkheden en beperkingen van AI.
- **22** — De leerling creëert digitale producten.
- **22A** — De leerling gebruikt passende werkwijzen bij het creëren en gebruiken van verschillende typen digitale producten.
- **22B** — De leerling programmeert een computerprogramma met behulp van computationele denkstrategieën.
- **23** — De leerling participeert in de gedigitaliseerde wereld.
- **23A** — De leerling gaat veilig om met digitale systemen, data en de privacy van zichzelf en anderen.
- **23B** — De leerling maakt weloverwogen keuzes bij het gebruik van digitale technologie en digitale media.
- **23C** — De leerling analyseert hoe digitale technologie, digitale media en de samenleving elkaar wederzijds beïnvloeden.

## Dekkingsmatrix SR-items

| Versie | 21A | 21B | 21C | 21D | 22A | 22B | 23A | 23B | 23C | Totaal |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| lj1-vmbo | 1 | 2 | 1 | 1 | 1 | 0 | 2 | 1 | 1 | 10 |
| lj1-hv | 1 | 2 | 1 | 1 | 1 | 0 | 2 | 1 | 1 | 10 |
| lj3-vmbo | 1 | 2 | 1 | 1 | 1 | 0 | 2 | 1 | 1 | 10 |
| lj3-hv | 1 | 2 | 1 | 1 | 1 | 0 | 2 | 1 | 1 | 10 |

## Gecombineerde dekking SR en performance tasks

| Subdoel | SR-dekking | PT-dekking | Interpretatie |
|---|---:|---:|---|
| 21A | aanwezig | sterk via PT1/PT2/PT6 | Breed gemeten via kennis en handelen. |
| 21B | aanwezig | beperkt | Vooral via SR. |
| 21C | aanwezig | sterk via PT4 | Via SR en spreadsheettaak. |
| 21D | aanwezig | beperkt via PT8 leerjaar 3 | Vooral via SR en online-media-context. |
| 22A | aanwezig | beperkt/indirect | Vooral via SR. |
| 22B | niet aanwezig | sterk via PT7 | Bewust performance-only. |
| 23A | aanwezig | via PT3/PT6/PT8 | Via SR en handelen. |
| 23B | aanwezig | via PT8 | Via SR en handelen. |
| 23C | aanwezig | beperkt via PT8 | Vooral via SR. |

## Ankerstatus

| Status | Betekenis |
|---|---|
| `frozen` | Item mag bij toekomstige afnames niet inhoudelijk worden gewijzigd. Alleen spelfouten mogen worden gecorrigeerd vóór de eerste officiële afname. |
| `concept-anchor` | Zelfde construct blijft terugkomen, maar formulering mag aangepast worden per niveau of jaar. |
| `replaceable` | Item mag worden vervangen als pilotdata of actualiteit daartoe aanleiding geeft. |

> Voor longitudinale vergelijking is het belangrijk dat sommige items of itemconcepten stabiel blijven. Daarom krijgt elk item een ankerstatus. Echte vergelijking over tijd kan alleen met items die na de pilot als `frozen` zijn vastgelegd.

## DigiCheck-verantwoording intern

Sommige itemconcepten zijn geïnspireerd op de DigiCheck HAN/iXperium, zoals zelfinschatting, telefoonprobleem, veilige verbinding, privacyflow en resultaatpagina. De items zijn niet letterlijk overgenomen. Omdat DigiCheck primair een zelfscan is en deze nulmetingen ook prestatievragen bevatten, moeten DigiCheck-geïnspireerde concepten opnieuw worden beoordeeld op geschiktheid als kennis- of handelingsitem.

## Afname-instructie rond gevoelige online situaties

In de nulmeting komen enkele situaties voor over online pesten, misleiding, beeldmateriaal en grensoverschrijdend online gedrag. Deze situaties zijn kort en niet expliciet beschreven, maar kunnen herkenbaar zijn voor leerlingen. Zorg dat een mentor of docent beschikbaar is als een leerling iets wil bespreken.

## Definitieve SR-set per versie

### Nulmeting Digitale Geletterdheid — Leerjaar 1 VMBO (`lj1-vmbo`)

#### 1. `lj1v-sr1-pw-passphrase` — Wachtwoordzin
- Kerndoel/subdoel: 23A — De leerling gaat veilig om met digitale systemen, data en de privacy van zichzelf en anderen.
- Vraagtype: single-choice
- Construct: wachtwoordzin
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Welk wachtwoord is het veiligst?
- Antwoordopties:
  A. MijnKleineKatSlaaptOnderDeBank *(correct)*
  B. Nora2012SchoolLent
  C. Welkom!!2026@@
  D. Qwerty12345!
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: A is een lange wachtwoordzin zonder voorspelbare persoonlijke gegevens of toetsenbordpatroon. B lijkt lang, maar bevat voorspelbare persoonlijke of schoolcontext. C gebruikt speciale tekens maar blijft patroonmatig. D bevat een bekend toetsenbordpatroon.
- Bronstatus: Verbeterde huidige vraag + DigiCheck-variant
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 2. `lj1v-sr2-https` — Slotje en https
- Kerndoel/subdoel: 23A — De leerling gaat veilig om met digitale systemen, data en de privacy van zichzelf en anderen.
- Vraagtype: single-choice
- Construct: slotje en https
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Je ziet een slotje en `https://` voor een webadres. Wat betekent dat?
- Antwoordopties:
  A. De verbinding met de website is versleuteld. *(correct)*
  B. De website is altijd eerlijk.
  C. De website is altijd van school.
  D. De website bewaart nooit gegevens.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet basisbegrip van HTTPS in eenvoudige taal. De vraag maakt nog geen brede betrouwbaarheidsclaim; in hogere leerjaren wordt die nuance explicieter gemaakt.
- Bronstatus: DigiCheck-variant + huidige HTTPS-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 3. `lj1v-sr3-phone` — Trage telefoon
- Kerndoel/subdoel: 21A — De leerling zet digitale systemen functioneel in.
- Vraagtype: single-choice
- Construct: trage telefoon
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: De telefoon van Youssef is traag. Wat helpt meestal zonder foto’s of accounts te wissen?
- Antwoordopties:
  A. Ongebruikte apps of downloads opruimen en updates installeren. *(correct)*
  B. De telefoon in vliegtuigstand zetten.
  C. Het toetsenbordgeluid uitzetten.
  D. Een populaire game opnieuw installeren.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet praktisch systeemgebruik en probleemoplossing bij een herkenbaar apparaatprobleem. De afleiders zijn mogelijk klinkende, maar onvoldoende passende acties; geen afleider wordt rechtstreeks uitgesloten door de vraagstam.
- Bronstatus: Verbeterde huidige vraag + DigiCheck-variant telefoon van Stan
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 4. `lj1v-sr4-official-source` — Officiële bron controleren
- Kerndoel/subdoel: 21B — De leerling navigeert doelgericht in het digitale media- en informatielandschap voor het verwerven en verwerken van informatie.
- Vraagtype: single-choice
- Construct: officiële bron controleren
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: In de groepsapp staat dat school morgen dicht is door storm. Welke bron controleer je eerst?
- Antwoordopties:
  A. Een bericht van school in de officiële app of mail. *(correct)*
  B. Een screenshot in de groepsapp zonder afzender.
  C. Een reactie onder een video van iemand uit een andere stad.
  D. Een fanaccount met veel likes.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet bronbetrouwbaarheid in een herkenbare context. Geen internetgebruik nodig tijdens de afname.
- Bronstatus: Nieuw itembank-item, aangepast
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 5. `lj1v-sr5-algorithm` — Aanbevelingen
- Kerndoel/subdoel: 21B — De leerling navigeert doelgericht in het digitale media- en informatielandschap voor het verwerven en verwerken van informatie.
- Vraagtype: single-choice
- Construct: aanbevelingen
- Anchorstatus: `replaceable`
- Pilotreview: `needs-review`
- Vraag: Luna kijkt een paar video's over voetbal. Daarna ziet ze steeds meer voetbalvideo's. Hoe komt dat meestal?
- Antwoordopties:
  A. De app gebruikt haar kijkgedrag om nieuwe video's te kiezen. *(correct)*
  B. De maker van een video bepaalt precies welke leerling de video ziet.
  C. Iedereen uit haar klas krijgt dezelfde aanbevelingen.
  D. Het komt alleen door het tijdstip van de dag.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Toetst dat leerlingen personalisatie door platforms herkennen. Dit sluit aan bij sociale media die aandacht trekken en vasthouden.
- Bronstatus: Verbeterde huidige algoritmevraag + nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 6. `lj1v-sr6-data-poll` — Kleine poll
- Kerndoel/subdoel: 21C — De leerling verkent het gebruik van data en dataverwerking.
- Vraagtype: single-choice
- Construct: kleine poll
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: In een poll stemmen 8 van de 25 leerlingen uit jouw klas op voetbal. Kun je dan zeggen dat voetbal de populairste sport van de hele school is?
- Antwoordopties:
  A. Nee, de groep is te klein en komt maar uit één klas. *(correct)*
  B. Ja, want 8 stemmen is altijd genoeg.
  C. Ja, als de poll online stond.
  D. Nee, online polls tellen nooit mee.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet 21C op basisniveau: beperkte data mag je niet te breed uitleggen.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 7. `lj1v-sr7-ai-check` — AI controleren
- Kerndoel/subdoel: 21D — De leerling verkent mogelijkheden en beperkingen van AI.
- Vraagtype: single-choice
- Construct: ai controleren
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Een chatbot geeft een antwoord voor je werkstuk. Je weet niet of het klopt. Wat kun je het best doen?
- Antwoordopties:
  A. Ik controleer het in een betrouwbare andere bron. *(correct)*
  B. Ik gebruik het meteen, want het klinkt netjes.
  C. Ik vraag dezelfde chatbot of hij zeker is.
  D. Ik kies de langste zin uit het antwoord.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet verantwoord en kritisch omgaan met AI zonder dat de leerling internet hoeft te gebruiken.
- Bronstatus: Verbeterde huidige AI-vraag
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 8. `lj1v-sr8-image-rights` — Afbeelding gebruiken
- Kerndoel/subdoel: 22A — De leerling gebruikt passende werkwijzen bij het creëren en gebruiken van verschillende typen digitale producten.
- Vraagtype: single-choice
- Construct: afbeelding gebruiken
- Anchorstatus: `replaceable`
- Pilotreview: `needs-review`
- Vraag: Je vindt een mooie afbeelding voor een schoolposter. Wat doe je eerst?
- Antwoordopties:
  A. Kijken of je de afbeelding mag gebruiken en de maker of bron noemen. *(correct)*
  B. De afbeelding gebruiken, want alles op internet is vrij.
  C. De afbeelding kleiner maken; dan is hij van jou.
  D. Er een filter overheen zetten; dan mag het altijd.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Beperkte SR-dekking van 22A zonder Creative Commons-terminologie. De vraag blijft concreet en eenduidig.
- Bronstatus: Verbeterde huidige auteursrechtvraag
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 9. `lj1v-sr9-photo-consent` — Foto delen
- Kerndoel/subdoel: 23B — De leerling maakt weloverwogen keuzes bij het gebruik van digitale technologie en digitale media.
- Vraagtype: single-choice
- Construct: foto delen
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Je maakt een foto van drie klasgenoten. Je wilt die in een sociale app zetten. Wat doe je eerst?
- Antwoordopties:
  A. Vragen of iedereen op de foto dat goed vindt. *(correct)*
  B. Alleen de namen weglaten; dan mag het altijd.
  C. De foto plaatsen en verwijderen als iemand klaagt.
  D. De foto alleen in de klassenapp zetten.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet respectvol en verantwoordelijk online handelen in eenvoudige taal.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 10. `lj1v-sr10-platform` — Afhankelijk van een schoolapp
- Kerndoel/subdoel: 23C — De leerling analyseert hoe digitale technologie, digitale media en de samenleving elkaar wederzijds beïnvloeden.
- Vraagtype: single-choice
- Construct: afhankelijk van een schoolapp
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: De school gebruikt één app voor rooster, huiswerk en berichten. Wat is een risico?
- Antwoordopties:
  A. Bij een storing kunnen leerlingen tegelijk hun rooster, huiswerk en berichten niet zien. *(correct)*
  B. Leerlingen moeten soms wennen aan een nieuwe knop in de app.
  C. De school moet uitleg geven over hoe de app werkt.
  D. Leerlingen moeten soms op een andere plek controleren of er nieuws is.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet 23C: afhankelijkheid van digitale systemen en platformen. Het item blijft basisniveau, maar de afleiders zijn minder karikaturaal.
- Bronstatus: Verbeterde huidige platformvraag + nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

### Nulmeting Digitale Geletterdheid — Leerjaar 1 HAVO/VWO (`lj1-hv`)

#### 1. `lj1h-sr1-pw-passphrase` — Wachtwoordzin
- Kerndoel/subdoel: 23A — De leerling gaat veilig om met digitale systemen, data en de privacy van zichzelf en anderen.
- Vraagtype: single-choice
- Construct: wachtwoordzin
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Welk wachtwoord is het veiligst?
- Antwoordopties:
  A. DeBlauweTreinStaatNaastDeSporthal *(correct)*
  B. Daan2012SchoolLent
  C. Welkom!!2026@@
  D. !Qw@#Er$%
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: A is een lange wachtwoordzin zonder voorspelbare persoonlijke gegevens of patroon. B is lang maar bevat naam/jaar/schoolcontext. C en D lijken sterk door speciale tekens, maar zijn korter of patroonmatiger.
- Bronstatus: Verbeterde huidige vraag + DigiCheck-variant
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 2. `lj1h-sr2-https-nuance` — Slotje en betrouwbaarheid
- Kerndoel/subdoel: 23A — De leerling gaat veilig om met digitale systemen, data en de privacy van zichzelf en anderen.
- Vraagtype: single-choice
- Construct: slotje en betrouwbaarheid
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Je ziet dit webadres: 🔒 https://leerplein-voorbeeld.nl/login/rooster?groep=1h2. Welke uitspraak klopt?
- Antwoordopties:
  A. De verbinding is versleuteld, maar je moet nog steeds controleren of de site echt van school is. *(correct)*
  B. De website is automatisch betrouwbaar door het slotje.
  C. De website is veilig omdat er .nl in staat.
  D. De verbinding is onveilig omdat er een vraagteken in de link staat.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Oplopende moeilijkheid: niet alleen herkennen van https, maar ook weten wat het wel en niet garandeert.
- Bronstatus: DigiCheck-variant + analyse HTTPS-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 3. `lj1h-sr3-phone-actions` — Trage telefoon
- Kerndoel/subdoel: 21A — De leerling zet digitale systemen functioneel in.
- Vraagtype: multiple-select — kies 2
- Construct: trage telefoon
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Youssef zijn telefoon is traag en loopt soms vast. Kies twee acties die meestal kunnen helpen.
- Antwoordopties:
  A. Ongebruikte apps en bestanden opruimen. *(correct)*
  B. Beschikbare updates via de instellingen installeren. *(correct)*
  C. De helderheid van het scherm lager zetten.
  D. Het toetsenbordgeluid uitzetten.
  E. Het wachtwoord van de telefoon veranderen.
  F. Ik weet het niet.
- Scoring: 1 punt alleen als exact 2 correcte opties zijn geselecteerd; 'Ik weet het niet.' is exclusief en scoort 0; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Multiple select maakt het item iets moeilijker dan VMBO leerjaar 1, maar blijft concreet.
- Bronstatus: DigiCheck-variant telefoon van Stan + huidige telefoonitem
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 4. `lj1h-sr4-search-query` — Gerichte zoekopdracht
- Kerndoel/subdoel: 21B — De leerling navigeert doelgericht in het digitale media- en informatielandschap voor het verwerven en verwerken van informatie.
- Vraagtype: single-choice
- Construct: gerichte zoekopdracht
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Je zoekt betrouwbare informatie over hoeveel jongeren in Nederland e-bikes gebruiken. Welke zoekopdracht helpt het best?
- Antwoordopties:
  A. onderzoek jongeren e-bike gebruik Nederland *(correct)*
  B. e-bike jongeren kopen Nederland
  C. jongeren fietsen school Nederland
  D. elektrische fiets ervaring jongeren
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Alle inhoudelijke opties zijn vergelijkbaar qua lengte en onderwerp. A is het beste omdat deze zoekt naar onderzoek, doelgroep, onderwerp en land.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 5. `lj1h-sr5-feed` — Feed is geen steekproef
- Kerndoel/subdoel: 21B — De leerling navigeert doelgericht in het digitale media- en informatielandschap voor het verwerven en verwerken van informatie.
- Vraagtype: single-choice
- Construct: feed is geen steekproef
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Je ziet op een videoplatform tien video's met dezelfde mening. Wat kun je daaruit het best afleiden?
- Antwoordopties:
  A. Niet meteen dat iedereen die mening heeft; je feed kan door een algoritme zijn gekozen. *(correct)*
  B. Dat de mening zeker waar is.
  C. Dat alle andere meningen zijn verwijderd.
  D. Dat het platform geen invloed heeft op wat je ziet.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Combineert algoritmisch begrip met informatiebeoordeling. Past bij het SLO-onderdeel over aandacht en beïnvloeding door sociale media.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 6. `lj1h-sr6-sample` — Steekproef
- Kerndoel/subdoel: 21C — De leerling verkent het gebruik van data en dataverwerking.
- Vraagtype: single-choice
- Construct: steekproef
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Een dataset bevat alleen antwoorden van leerlingen uit een klas. Waar moet je voor oppassen?
- Antwoordopties:
  A. Je kunt niet zomaar zeggen dat dit voor alle leerlingen geldt. *(correct)*
  B. Een klas is altijd genoeg om iets over heel Nederland te zeggen.
  C. De dataset is automatisch fout.
  D. Meer data maakt nooit verschil.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Behoudt het sterke construct van de huidige vraag, maar de taal blijft direct.
- Bronstatus: Huidig item, licht geredigeerd
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 7. `lj1h-sr7-ai-startpunt` — AI als hulpmiddel
- Kerndoel/subdoel: 21D — De leerling verkent mogelijkheden en beperkingen van AI.
- Vraagtype: single-choice
- Construct: ai als hulpmiddel
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Je gebruikt AI om ideeën voor een spreekbeurt te krijgen. Wat is de beste werkwijze?
- Antwoordopties:
  A. Ideeën gebruiken als startpunt en feiten daarna zelf controleren. *(correct)*
  B. De hele tekst inleveren zonder te lezen.
  C. Alle bronnen overslaan, want AI heeft al gezocht.
  D. Alleen vragen om langere zinnen zodat het slimmer lijkt.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet doelgericht en kritisch interacteren met AI. Minder dubbeling dan een tweede losse hallucinatiewvraag.
- Bronstatus: Nieuw itembank-item + huidige AI-verifieervraag
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 8. `lj1h-sr8-image-source` — Afbeelding in presentatie
- Kerndoel/subdoel: 22A — De leerling gebruikt passende werkwijzen bij het creëren en gebruiken van verschillende typen digitale producten.
- Vraagtype: single-choice
- Construct: afbeelding in presentatie
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Je gebruikt een foto in een presentatie voor school. Wat controleer je eerst?
- Antwoordopties:
  A. Of je de foto mag gebruiken en welke maker of bron je moet noemen. *(correct)*
  B. Of de foto veel likes heeft.
  C. Of je de foto zwart-wit kunt maken.
  D. Of de foto groter wordt als je hem kopieert.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Vervangt Creative Commons-terminologie door basisgedrag rond auteursrecht, bron- en naamsvermelding.
- Bronstatus: Vervanging voor huidige CC-vraag
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 9. `lj1h-sr9-threat-message` — Dreigend privébericht
- Kerndoel/subdoel: 23B — De leerling maakt weloverwogen keuzes bij het gebruik van digitale technologie en digitale media.
- Vraagtype: multiple-select — kies 2
- Construct: dreigend privébericht
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Een klasgenoot stuurt een dreigend privébericht. Kies twee verstandige acties.
- Antwoordopties:
  A. Bewijs bewaren, bijvoorbeeld een screenshot. *(correct)*
  B. Melden bij een mentor, ouder of vertrouwenspersoon. *(correct)*
  C. Het bericht openbaar posten om steun te krijgen.
  D. Terugdreigen zodat de ander stopt.
  E. Het bericht verwijderen en doen alsof het niet is gebeurd.
  F. Ik weet het niet.
- Scoring: 1 punt alleen als exact 2 correcte opties zijn geselecteerd; 'Ik weet het niet.' is exclusief en scoort 0; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet adequaat omgaan met ongepast gedrag, zonder open antwoord of rubric.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 10. `lj1h-sr10-ad-profile` — Dataprofielen en reclame
- Kerndoel/subdoel: 23C — De leerling analyseert hoe digitale technologie, digitale media en de samenleving elkaar wederzijds beïnvloeden.
- Vraagtype: single-choice
- Construct: dataprofielen en reclame
- Anchorstatus: `replaceable`
- Pilotreview: `needs-review`
- Vraag: Waarom zie je soms reclame voor iets waar je net online naar zocht?
- Antwoordopties:
  A. Websites en apps kunnen gedrag gebruiken om een advertentieprofiel te maken. *(correct)*
  B. Je telefoon luistert altijd live mee met elk gesprek.
  C. Alle reclames zijn voor iedereen hetzelfde.
  D. Reclame wordt gekozen door je mentor.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet maatschappelijke werking van data en platforms in herkenbare taal.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

### Nulmeting Digitale Geletterdheid — Leerjaar 3 VMBO (`lj3-vmbo`)

#### 1. `lj3v-sr1-https-phishing` — Slotje bij verdachte link
- Kerndoel/subdoel: 23A — De leerling gaat veilig om met digitale systemen, data en de privacy van zichzelf en anderen.
- Vraagtype: single-choice
- Construct: slotje bij verdachte link
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Je krijgt een mail: 'Je cijferlijst staat klaar.' De link is 🔒 https://school-cijfers-login.example.net/controle. Wat doe je?
- Antwoordopties:
  A. Niet via de link inloggen; via de officiële schoolsite of app controleren. *(correct)*
  B. Wel klikken, want het slotje betekent dat de site echt van school is.
  C. Wel klikken, want de link begint met https.
  D. De link doorsturen naar de klas zodat iedereen kan kijken.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Oudere leerlingen krijgen de nuance dat https geen bewijs is dat de site betrouwbaar of echt is.
- Bronstatus: DigiCheck-variant + nieuw phishing-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 2. `lj3v-sr2-mfa` — Onverwachte inlogmelding
- Kerndoel/subdoel: 23A — De leerling gaat veilig om met digitale systemen, data en de privacy van zichzelf en anderen.
- Vraagtype: single-choice
- Construct: onverwachte inlogmelding
- Anchorstatus: `replaceable`
- Pilotreview: `needs-review`
- Vraag: Je krijgt een melding: 'Wil je deze login goedkeuren?' Je probeert zelf niet in te loggen. Wat kies je?
- Antwoordopties:
  A. Afwijzen en je account controleren via de officiële instellingen. *(correct)*
  B. Goedkeuren om van de melding af te zijn.
  C. Goedkeuren als de melding maar een keer komt.
  D. Negeren en verder niets doen.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet beschermen tegen zwakke plekken en risicobewust handelen bij accountbeveiliging.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 3. `lj3v-sr3-phone-actions` — Telefoon versnellen
- Kerndoel/subdoel: 21A — De leerling zet digitale systemen functioneel in.
- Vraagtype: multiple-select — kies 3
- Construct: telefoon versnellen
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: De telefoon van Youssef is oud, traag en loopt soms vast. Kies drie acties die meestal kunnen helpen.
- Antwoordopties:
  A. Oude of ongebruikte apps en bestanden opruimen. *(correct)*
  B. Tijdelijke bestanden of cache opruimen via de instellingen. *(correct)*
  C. Beschikbare systeemupdates via de instellingen installeren. *(correct)*
  D. De helderheid van het scherm lager zetten.
  E. Het toetsenbordgeluid uitzetten.
  F. Een andere achtergrondfoto kiezen.
  G. Ik weet het niet.
- Scoring: 1 punt alleen als exact 3 correcte opties zijn geselecteerd; 'Ik weet het niet.' is exclusief en scoort 0; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Gebaseerd op de DigiCheck-telefoonvraag, maar met de naam Youssef en met heldere, scoreerbare keuzes.
- Bronstatus: DigiCheck-variant telefoon van Stan
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 4. `lj3v-sr4-health-source` — Gezondheidsinformatie
- Kerndoel/subdoel: 21B — De leerling navigeert doelgericht in het digitale media- en informatielandschap voor het verwerven en verwerken van informatie.
- Vraagtype: single-choice
- Construct: gezondheidsinformatie
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Je zoekt informatie over slaaptekort. Welke bron is het meest geschikt voor betrouwbare basisinformatie?
- Antwoordopties:
  A. Een gezondheidswebsite van artsen of een publieke organisatie met datum en uitleg. *(correct)*
  B. Een webshop die slaapdrankjes verkoopt.
  C. Een influencer die zegt dat hij nooit slaapt.
  D. Een losse reactie onder een video.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Versterkt informatievaardigheid in leerjaar 3 zonder actuele links of zoekopdracht.
- Bronstatus: Nieuw itembank-item + huidige bronkwaliteit
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 5. `lj3v-sr5-sponsored` — Sponsoring herkennen
- Kerndoel/subdoel: 21B — De leerling navigeert doelgericht in het digitale media- en informatielandschap voor het verwerven en verwerken van informatie.
- Vraagtype: single-choice
- Construct: sponsoring herkennen
- Anchorstatus: `replaceable`
- Pilotreview: `needs-review`
- Vraag: Een populaire gamer noemt een energiedrank 'de beste voor concentratie' en gebruikt kortingscode GAMER10. Waar moet je op letten?
- Antwoordopties:
  A. Het kan reclame of sponsoring zijn. *(correct)*
  B. Een kortingscode bewijst dat het product werkt.
  C. Gamers mogen geen reclame maken.
  D. Veel volgers maken de uitspraak wetenschappelijk.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet bronbelang en commerciële beïnvloeding. Past bij mediawijsheid en is minder talig dan abstracte brondefinities.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 6. `lj3v-sr6-percent` — Poll en conclusie
- Kerndoel/subdoel: 21C — De leerling verkent het gebruik van data en dataverwerking.
- Vraagtype: single-choice
- Construct: poll en conclusie
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: In een online poll stemmen 12 leerlingen uit klas 3V2. Acht leerlingen kiezen voor “meer pauze”. Een leerling zegt: “De meeste leerlingen van de hele school willen dus meer pauze.” Wat is de beste reactie?
- Antwoordopties:
  A. Dat kun je niet zomaar zeggen, want de poll gaat maar over 12 leerlingen uit één klas. *(correct)*
  B. Dat klopt zeker, want acht stemmen is meer dan de helft.
  C. Dat klopt alleen als de poll op een telefoon is ingevuld.
  D. Dat kun je nooit onderzoeken met een poll.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet 21C beter dan een kale rekensom: een dataset geeft een beperkt beeld van de werkelijkheid; conclusies moeten passen bij de groep waarover data is verzameld.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 7. `lj3v-sr7-ai-bias` — AI en trainingsdata
- Kerndoel/subdoel: 21D — De leerling verkent mogelijkheden en beperkingen van AI.
- Vraagtype: single-choice
- Construct: ai en trainingsdata
- Anchorstatus: `replaceable`
- Pilotreview: `needs-review`
- Vraag: Een AI laat vooral mannen zien als je vraagt om een afbeelding van “een directeur”. Wat is de meest waarschijnlijke oorzaak?
- Antwoordopties:
  A. De AI heeft in de voorbeelden waarop hij is getraind vaak mannen in die rol gezien. *(correct)*
  B. De AI kiest altijd de afbeeldingen die het vaakst zijn aangeklikt door de gebruiker.
  C. De AI gebruikt alleen de woorden uit jouw vraag en geen eerdere voorbeelden.
  D. De AI maakt altijd een neutrale keuze als je geen extra uitleg geeft.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet begrip van bias en trainingsdata zonder stereotyperende of absurde afleiders. B, C en D zijn plausibele maar onjuiste vereenvoudigingen.
- Bronstatus: Verbeterde huidige AI-biasvraag
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 8. `lj3v-sr8-music-rights` — Muziek onder video
- Kerndoel/subdoel: 22A — De leerling gebruikt passende werkwijzen bij het creëren en gebruiken van verschillende typen digitale producten.
- Vraagtype: single-choice
- Construct: muziek onder video
- Anchorstatus: `replaceable`
- Pilotreview: `needs-review`
- Vraag: Je maakt een video voor school en wilt een bekend liedje eronder zetten en online plaatsen. Wat is het best?
- Antwoordopties:
  A. Controleren of je het liedje mag gebruiken of rechtenvrije muziek kiezen. *(correct)*
  B. Het liedje zachter zetten; dan geldt auteursrecht niet.
  C. Alleen de eerste minuut gebruiken; dat mag altijd.
  D. De titel niet noemen, dan merkt niemand het.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Beperkte, praktische 22A-dekking zonder Creative Commons-terminologie.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 9. `lj3v-sr9-fake-account` — Nepaccount melden
- Kerndoel/subdoel: 23B — De leerling maakt weloverwogen keuzes bij het gebruik van digitale technologie en digitale media.
- Vraagtype: multiple-select — kies 2
- Construct: nepaccount melden
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Iemand maakt een account aan met jouw naam en foto. Kies twee goede acties.
- Antwoordopties:
  A. Het account rapporteren bij het platform. *(correct)*
  B. Bewijs bewaren, bijvoorbeeld screenshots van profiel en berichten. *(correct)*
  C. Zelf ook een nepaccount van die persoon maken.
  D. Iedereen vragen het account te volgen om te kijken wat er gebeurt.
  E. Je echte account verwijderen zonder iets te melden.
  F. Ik weet het niet.
- Scoring: 1 punt alleen als exact 2 correcte opties zijn geselecteerd; 'Ik weet het niet.' is exclusief en scoort 0; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet adequaat reageren op ongepast online gedrag. Multiple select past bij leerjaar 3.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 10. `lj3v-sr10-digital-chances` — Online formulier
- Kerndoel/subdoel: 23C — De leerling analyseert hoe digitale technologie, digitale media en de samenleving elkaar wederzijds beïnvloeden.
- Vraagtype: single-choice
- Construct: online formulier
- Anchorstatus: `replaceable`
- Pilotreview: `needs-review`
- Vraag: Een stagebedrijf laat sollicitanten alleen via een ingewikkeld online formulier reageren. Wat kan een gevolg zijn?
- Antwoordopties:
  A. Mensen met minder digitale vaardigheden kunnen moeilijker meedoen. *(correct)*
  B. Iedereen krijgt automatisch dezelfde kans.
  C. Solliciteren wordt daardoor altijd eerlijker.
  D. Het bedrijf heeft dan geen privacyregels nodig.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet digitale ongelijkheid in een beroepsgerichte context, passend bij VMBO leerjaar 3.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

### Nulmeting Digitale Geletterdheid — Leerjaar 3 HAVO/VWO (`lj3-hv`)

#### 1. `lj3h-sr1-https-limits` — Grenzen van https
- Kerndoel/subdoel: 23A — De leerling gaat veilig om met digitale systemen, data en de privacy van zichzelf en anderen.
- Vraagtype: single-choice
- Construct: grenzen van https
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Je ziet bij een website een slotje en `https://`. Wat weet je dan wél en wat weet je nog niet zeker?
- Antwoordopties:
  A. De verbinding is versleuteld, maar je weet nog niet zeker of de website betrouwbaar is. *(correct)*
  B. De website is van school, omdat er een slotje staat.
  C. De informatie op de website is gecontroleerd, omdat de verbinding veilig is.
  D. De website kan geen gegevens verzamelen, omdat er `https://` staat.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet geavanceerder begrip van HTTPS: wel transportbeveiliging, geen algemene betrouwbaarheids- of waarheidsclaim. Past bij leerjaar 3 havo/vwo.
- Bronstatus: DigiCheck-variant + analyse HTTPS-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 2. `lj3h-sr2-datalek` — Wachtwoordlek en hergebruik
- Kerndoel/subdoel: 23A — De leerling gaat veilig om met digitale systemen, data en de privacy van zichzelf en anderen.
- Vraagtype: single-choice
- Construct: wachtwoordlek en hergebruik
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Een website waar jij een account hebt, meldt een datalek. Je gebruikte daar hetzelfde wachtwoord als voor school. Wat is de beste actie?
- Antwoordopties:
  A. Het schoolwachtwoord direct wijzigen en waar mogelijk tweestapsverificatie controleren. *(correct)*
  B. Alleen het wachtwoord van de gelekte website wijzigen.
  C. Wachten tot school zegt dat er iets mis is.
  D. Hetzelfde wachtwoord houden als het sterk genoeg lijkt.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Vervolgt het wachtwoordanker op hoger niveau: niet alleen sterkte, maar ook hergebruik en schade na een lek.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 3. `lj3h-sr3-phone-actions` — Telefoon en onderhoud
- Kerndoel/subdoel: 21A — De leerling zet digitale systemen functioneel in.
- Vraagtype: multiple-select — kies 3
- Construct: telefoon en onderhoud
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Youssef zijn telefoon wordt traag en loopt vaak vast. Kies drie acties die het meest logisch zijn.
- Antwoordopties:
  A. Onnodige apps en grote bestanden opruimen. *(correct)*
  B. Cache of tijdelijke gegevens opruimen via instellingen. *(correct)*
  C. Systeem en apps updaten via officiële instellingen. *(correct)*
  D. Schermhelderheid lager zetten.
  E. Alle meldingen aanzetten.
  F. Toetsenbordgeluid uitzetten.
  G. Ik weet het niet.
- Scoring: 1 punt alleen als exact 3 correcte opties zijn geselecteerd; 'Ik weet het niet.' is exclusief en scoort 0; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: DigiCheck-concept wordt gebruikt als functioneel systeemonderhoud, met precies drie juiste keuzes.
- Bronstatus: DigiCheck-variant telefoon van Stan
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 4. `lj3h-sr4-triangulation` — Claim controleren
- Kerndoel/subdoel: 21B — De leerling navigeert doelgericht in het digitale media- en informatielandschap voor het verwerven en verwerken van informatie.
- Vraagtype: single-choice
- Construct: claim controleren
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Je vindt een opvallende claim over een nieuwe schoolregel. Welke controle is het sterkst?
- Antwoordopties:
  A. Controleren of de school zelf of meerdere betrouwbare bronnen dezelfde regel melden. *(correct)*
  B. Kijken of de post veel gedeeld is.
  C. Kijken of de tekst boos klinkt.
  D. De claim geloven als er een screenshot bij staat.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet triangulatie en broncontrole zonder afhankelijkheid van actuele websites.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 5. `lj3h-sr5-filterbubble` — Filterbubbel
- Kerndoel/subdoel: 21B — De leerling navigeert doelgericht in het digitale media- en informatielandschap voor het verwerven en verwerken van informatie.
- Vraagtype: single-choice
- Construct: filterbubbel
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Je nieuwsfeed toont vooral berichten die jouw mening bevestigen. Wat is verstandig?
- Antwoordopties:
  A. Ook actief zoeken naar betrouwbare bronnen met andere invalshoeken. *(correct)*
  B. Aannemen dat bijna iedereen jouw mening deelt.
  C. Alle bronnen met andere meningen blokkeren.
  D. Alleen nog reacties onder posts lezen.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Verbindt algoritmische selectie met eigen interpretatie en voorkeuren, passend bij havo/vwo.
- Bronstatus: Nieuw itembank-item + huidige filterbubblevraag
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 6. `lj3h-sr6-graph-scale` — Klachten naar verhouding
- Kerndoel/subdoel: 21C — De leerling verkent het gebruik van data en dataverwerking.
- Vraagtype: single-choice
- Construct: klachten naar verhouding
- Anchorstatus: `replaceable`
- Pilotreview: `needs-review`
- Vraag: Een grafiek vergelijkt het aantal klachten over twee apps. App A: 20 klachten bij 1.000 gebruikers. App B: 50 klachten bij 10.000 gebruikers. Welke conclusie past het best bij deze data?
- Antwoordopties:
  A. App A heeft naar verhouding meer klachten dan App B. *(correct)*
  B. App B heeft naar verhouding meer klachten, want 50 is meer dan 20.
  C. De apps hebben evenveel klachten, want beide apps hebben klachten.
  D. Je kunt nooit naar verhouding kijken bij gebruikersaantallen.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet datageletterdheid via verhouding en interpretatie van gebruikersdata. Het rekenen staat in dienst van een dataconclusie.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 7. `lj3h-sr7-ai-privacy` — AI en persoonsgegevens
- Kerndoel/subdoel: 21D — De leerling verkent mogelijkheden en beperkingen van AI.
- Vraagtype: multiple-select — kies 2
- Construct: ai en persoonsgegevens
- Anchorstatus: `replaceable`
- Pilotreview: `needs-review`
- Vraag: Je wilt een AI-tool feedback laten geven op een verslag over een klasgenoot. Kies twee dingen die je beter eerst verwijdert of vervangt.
- Antwoordopties:
  A. De volledige naam van de klasgenoot. *(correct)*
  B. Medische of andere persoonlijke details over de klasgenoot. *(correct)*
  C. De vraag: 'Maak de tekst duidelijker.'
  D. Een algemene omschrijving zoals 'een leerling'.
  E. Een neutrale alinea over de opbouw van het verslag.
  F. Ik weet het niet.
- Scoring: 1 punt alleen als exact 2 correcte opties zijn geselecteerd; 'Ik weet het niet.' is exclusief en scoort 0; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet verantwoord en kritisch interacteren met AI, met privacy als concrete grens.
- Bronstatus: Nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 8. `lj3h-sr8-remix-rights` — Afbeelding aanpassen
- Kerndoel/subdoel: 22A — De leerling gebruikt passende werkwijzen bij het creëren en gebruiken van verschillende typen digitale producten.
- Vraagtype: single-choice
- Construct: afbeelding aanpassen
- Anchorstatus: `replaceable`
- Pilotreview: `needs-review`
- Vraag: Je wilt een afbeelding van internet aanpassen voor een online poster. Wat controleer je eerst?
- Antwoordopties:
  A. Of de maker dit toestaat, welke bronvermelding nodig is en of bewerken en delen mag. *(correct)*
  B. Of de afbeelding groot genoeg is om de maker niet te hoeven noemen.
  C. Of je de kleuren sterk kunt veranderen; dan is het altijd eigen werk.
  D. Of je de poster alleen in een groepsapp deelt; dan gelden geen regels.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Houdt 22A praktisch en vermijdt Creative Commons-afkortingen als toetsterm.
- Bronstatus: Vervanging voor huidige CC-BY-SA-vraag
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 9. `lj3h-sr9-private-photo` — Privéfoto zonder toestemming
- Kerndoel/subdoel: 23B — De leerling maakt weloverwogen keuzes bij het gebruik van digitale technologie en digitale media.
- Vraagtype: single-choice
- Construct: privéfoto zonder toestemming
- Anchorstatus: `concept-anchor`
- Pilotreview: `ready-for-pilot`
- Vraag: Iemand deelt een privéfoto van een klasgenoot in een besloten groep. Die klasgenoot gaf geen toestemming. Wat is het beste?
- Antwoordopties:
  A. Niet verder delen, rapporteren en hulp inschakelen. *(correct)*
  B. Alleen bewaren en verder niets doen.
  C. Doorsturen naar een kleiner groepje dat je vertrouwt.
  D. Een grap maken zodat de spanning daalt.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet grenzen, toestemming en verantwoordelijk online handelen bij een serieuze situatie.
- Bronstatus: Nieuw itembank-item, minder expliciet geformuleerd
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

#### 10. `lj3h-sr10-regulation` — Regels voor platforms
- Kerndoel/subdoel: 23C — De leerling analyseert hoe digitale technologie, digitale media en de samenleving elkaar wederzijds beïnvloeden.
- Vraagtype: single-choice
- Construct: regels voor platforms
- Anchorstatus: `replaceable`
- Pilotreview: `needs-review`
- Vraag: Waarom maken landen en de EU regels voor grote online platforms?
- Antwoordopties:
  A. Omdat platforms veel invloed hebben op informatie, handel en gegevens van burgers. *(correct)*
  B. Omdat regels ervoor zorgen dat platforms nooit fouten kunnen maken.
  C. Omdat gebruikers dan zelf niet meer hoeven na te denken over privacy.
  D. Omdat platforms alleen betrouwbaar zijn als ze in Europa zijn gemaakt.
  E. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze; `Ik weet het niet.` is exclusief, scoort 0 en wordt als `unknown` opgeslagen.
- Onderbouwing: Meet 23C: regulering, platformmacht en bescherming van publieke waarden. De afleiders zijn plausibeler als misconcepties, maar blijven eenduidig fout.
- Bronstatus: Verbeterde huidige reguleringsvraag + nieuw itembank-item
- Distractor-notitie: Afleiders zijn bedoeld als plausibele misconcepties; de optie “Ik weet het niet.” is exclusief en scoort 0.

## Performance task metadata voor Codex

Kerndoel 22B wordt alleen via PT7 gemeten. Als PT7 niet is gemaakt of is overgeslagen, toon 22B als `geen score beschikbaar` of `0 van Y punten`, afhankelijk van de bestaande scoringssystematiek. Maak duidelijk dat overslaan 0 punten oplevert, maar vermijd normatieve taal.

### `pt1-files`
- subgoal: 21A
- construct: bestanden en mappen beheren
- evidenceType: performance-task
- scoringEvidence: eindtoestand van mappen, bestandsnamen en bestandslocaties
- validityNote: Praktisch bewijs voor functioneel gebruik van digitale systemen.

### `pt2-mail`
- subgoal: 21A
- construct: e-mail functioneel gebruiken
- evidenceType: performance-task
- scoringEvidence: ontvanger, cc waar nodig, onderwerp, bijlage en verzendactie
- validityNote: Procedureel bewijs voor digitale communicatie en systeemgebruik.

### `pt3-security`
- subgoal: 23A
- construct: account, apparaat en verbinding beveiligen
- evidenceType: performance-task
- scoringEvidence: gekozen veilige acties bij verdachte meldingen
- validityNote: Komt voor in leerjaar 3; meet risicobewust handelen.

### `pt4-data`
- subgoal: 21C
- construct: data sorteren, filteren en interpreteren
- evidenceType: performance-task
- scoringEvidence: juiste code of uitkomst na filter- en sorteerhandeling
- validityNote: Gedragsbewijs voor dataverwerking in een spreadsheetcontext.

### `pt6-screen-share`
- subgoal: 23A
- construct: veilig en doelgericht schermdelen
- evidenceType: performance-task
- scoringEvidence: delen via venster, juiste vensterkeuze en computergeluid
- validityNote: Meet samenwerking en privacybewust handelen in een videovergadering.

### `pt7-programming`
- subgoal: 22B
- construct: programmeren met computationele denkstrategieën
- evidenceType: performance-task
- scoringEvidence: gekozen blokken, volgorde, nesting en/of eindgedrag
- validityNote: 22B wordt bewust via PT7 gemeten en niet via SR-items.
- anchorStatus: concept-anchor

### `pt8-online-behaviour`
- subgoal: 23B
- construct: online gedrag, misleiding, delen en melden
- evidenceType: performance-task
- scoringEvidence: gekozen beoordeling, signalen, deelinstellingen en veilige acties
- validityNote: Meet digitaal burgerschap en online veiligheidsbeslissingen in context.

## Codex-implementatieopdracht

Implementeer de nulmetingen Digitale Geletterdheid op basis van de herziene Markdown- en JSON-bestanden.

- Kerndoel 22B wordt niet via selected-response-items gemeten.
- 22B wordt uitsluitend gemeten via PT7 programmeren.
- Toon aan leerlingen primair totaalscore en kerndoelscores voor 21, 22 en 23.
- Toon subdoelscores alleen als voorzichtig detail met het aantal punten waarop de score gebaseerd is.
- Gebruik geen normatieve labels.
- Gebruik geen formuleringen die suggereren dat één subdoelscore een volledig oordeel geeft.
- Registreer “Ik weet het niet” apart, maar geef er geen bonuspunten voor.
- Gebruik `classToken`, `classId` en `anonymousAttemptId`, maar sla geen leerlingidentiteit op.
- Gebruik de `anchorStatus`-metadata voor toekomstig beheer van frozen items en conceptankers.
- Zorg dat alle leerlingteksten correct Nederlands bevatten, inclusief diakrieten.
