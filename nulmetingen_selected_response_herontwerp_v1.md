# Herontwerp nulmetingen Digitale Geletterdheid - selected response v1

Status: werkversie voor beoordeling en Codex-implementatie. Niet gebruiken als leerlingmateriaal zonder interne velden en correcte antwoorden te verwijderen.

## Ontwerpbesluiten

- Default: 10 selected-response-items per versie. Dit houdt de metingen realistischer binnen 30 minuten dan 12 items.
- Er zijn vier versies: lj1-vmbo, lj1-hv, lj3-vmbo, lj3-hv.
- Elk SR-item krijgt de vaste optie: `Ik weet het niet.` Deze optie scoort 0 punten en staat altijd onderaan.
- Multiple select wordt beperkt gebruikt. VMBO leerjaar 1 heeft geen multiple select in de SR-set; leerjaar 1 havo/vwo en leerjaar 3 wel.
- Kerndoelen en subdoelen zijn intern getagd, maar niet zichtbaar in de vraagtekst.
- De resultaatpagina gebruikt wel de SLO-termen voor kerndoelen en subdoelen.
- Er worden geen internetzoekopdrachten en geen reverse image search opgenomen.
- Creative Commons-termen worden niet als basiskennis getoetst. Wel blijft een eenvoudige vraag over bron, maker en gebruiksrecht behouden voor 22A.
- De HTTPS/slotje-vraag en de telefoonvraag worden als DigiCheck-geinspireerde ankerconcepten opgenomen in alle versies, met oplopende moeilijkheid.
- De directe wachtwoordvraag met het langste correcte antwoord staat in leerjaar 1. In leerjaar 3 verschuift het wachtwoordanker naar hergebruik, datalek en tweestapsverificatie.

## Voorleesbare uitleg voor leerlingen

Je maakt een nulmeting digitale geletterdheid. Je krijgt eerst een vraag waarin je jezelf een score geeft van 0 tot 100. Daarna maak je opdrachten en korte vragen. Sommige opdrachten gaan over bestanden, mail, data, programmeren, veiligheid, online gedrag, informatie en AI. Je hoeft geen internet te gebruiken. Weet je een antwoord niet? Kies dan `Ik weet het niet` of sla een opdracht over. Aan het einde zie je jouw score in procenten. Je ziet ook hoe die score past bij jouw inschatting vooraf. Dit is geen cijfer. De school gebruikt de resultaten om te zien wat de klas al kan en waar nog oefening nodig is.

## Privacy, startlink, zelfinschatting en resultaatpagina

### Privacyverklaring
- Je maakt een nulmeting digitale geletterdheid.
- De school gebruikt de resultaten om te zien wat de klas al kan en waar nog oefening nodig is.
- Meedoen is niet verplicht.
- Je antwoorden worden zonder naam opgeslagen.
- De resultaten worden niet gebruikt om jou persoonlijk te beoordelen.
- We bekijken de resultaten wel per klas.
- Vul tijdens de nulmeting geen naam of andere persoonlijke gegevens in, behalve als een opdracht daar zelf om vraagt met een verzonnen voorbeeld.
- Checkbox: `Ik heb dit gelezen en ga akkoord met de privacyvoorwaarden.`

### Klassencodes via startlink
- Een docent of beheerder maakt per klas een afnamelink aan.
- De token verwijst naar assessmentId, klasId, schoolId en afnameperiode, maar niet naar een individuele leerling.
- Leerlingen voeren geen naam, e-mailadres of leerlingnummer in.
- Elke poging krijgt een willekeurige anonymousAttemptId.
- Sla scores op met classToken/classId en anonymousAttemptId; maak geen individueel leerlingprofiel.
- Gebruik localStorage of een sessietoken alleen om een afgebroken poging te hervatten; niet om leerlingen te identificeren.

### Zelfinschatting
- Vraag: Hoe goed ben jij met digitale dingen, zoals computers, internet, apps en AI?
- Hulptekst: Schuif het bolletje naar jouw keuze. 0 betekent: ik kan dit bijna niet. 100 betekent: ik kan dit heel goed.
- Schaal: 0 tot 100, stapgrootte 1. Niet meetellen in de toetscore.

### Resultaatpagina
- Toon zelfinschatting en behaalde score allebei als percentage van 0 tot 100.
- Toon de vergelijking tussen inschatting en score zonder normatieve labels.
- Toon per beoordeeld kerndoel/subdoel een percentage en het aantal scorepunten waarop dit percentage is gebaseerd.
- Gebruik de SLO-labels uit de sectie hieronder.
- Voeg een knop toe: `Download scoreoverzicht als PDF`.
- Waarschuwingstekst: Sla je scoreoverzicht op. Als je op Volgende klikt, sluit je de zelfscan af. Je kunt dan niet meer bij je scores. Je ontvangt dit scoreoverzicht ook niet via e-mail.
- Afsluitvinkje: `Ik heb mijn scoreoverzicht opgeslagen en ik sluit nu de zelfscan af.`

## SLO-labels voor resultaatpagina

- **21** - De leerling zet digitale technologie en digitale media in.
- **21A** - De leerling zet digitale systemen functioneel in.
- **21B** - De leerling navigeert doelgericht in het digitale media- en informatielandschap voor het verwerven en verwerken van informatie.
- **21C** - De leerling verkent het gebruik van data en dataverwerking.
- **21D** - De leerling verkent mogelijkheden en beperkingen van AI.
- **22** - De leerling creëert digitale producten.
- **22A** - De leerling gebruikt passende werkwijzen bij het creëren en gebruiken van verschillende typen digitale producten.
- **22B** - De leerling programmeert een computerprogramma met behulp van computationele denkstrategieën.
- **23** - De leerling participeert in de gedigitaliseerde wereld.
- **23A** - De leerling gaat veilig om met digitale systemen, data en de privacy van zichzelf en anderen.
- **23B** - De leerling maakt weloverwogen keuzes bij het gebruik van digitale technologie en digitale media.
- **23C** - De leerling analyseert hoe digitale technologie, digitale media en de samenleving elkaar wederzijds beïnvloeden.

## Dekkingsmatrix SR-items

| Versie | 21A | 21B | 21C | 21D | 22A | 23A | 23B | 23C | Totaal |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| lj1-vmbo | 1 | 2 | 1 | 1 | 1 | 2 | 1 | 1 | 10 |
| lj1-hv | 1 | 2 | 1 | 1 | 1 | 2 | 1 | 1 | 10 |
| lj3-vmbo | 1 | 2 | 1 | 1 | 1 | 2 | 1 | 1 | 10 |
| lj3-hv | 1 | 2 | 1 | 1 | 1 | 2 | 1 | 1 | 10 |

## Definitieve SR-set per versie

### Nulmeting Digitale Geletterdheid - Leerjaar 1 VMBO (lj1-vmbo)

#### 1. lj1v-sr1-pw-passphrase - Wachtwoordzin
- Kerndoel/subdoel: 23A Veiligheid en privacy
- Vraagtype: single
- Vraag: Welk wachtwoord is het veiligst?
- Antwoordopties:
  1. MijnKleineKatSlaaptOnderDeBank *(correct)*
  2. Noor2012!
  3. Welkom123
  4. !@#$%&*
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet of de leerling begrijpt dat lengte en voorspelbaarheid belangrijker zijn dan alleen speciale tekens. Het correcte antwoord is bewust lang en bevat geen speciale tekens.
- Bronstatus: Verbeterde huidige vraag + DigiCheck-variant
- Besluit: behouden in verbeterde vorm

#### 2. lj1v-sr2-https - Slotje en https
- Kerndoel/subdoel: 23A Veiligheid en privacy
- Vraagtype: single
- Vraag: Je ziet dit webadres: 🔒 https://www.schoolspullen-voorbeeld.nl/winkelmandje/klas1. Kun je ervan uitgaan dat deze verbinding beveiligd is?
- Antwoordopties:
  1. Ja, door https en het slotje worden gegevens versleuteld verstuurd. *(correct)*
  2. Ja, omdat .nl-websites altijd door de overheid worden gecontroleerd.
  3. Nee, want een lange link is meestal onveilig.
  4. Nee, want een slotje betekent dat er problemen zijn.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Belangrijk dagelijks herkenningspunt. De vraag toetst basisbegrip van een versleutelde verbinding zonder te beweren dat de site als geheel betrouwbaar is.
- Bronstatus: DigiCheck-variant + huidige HTTPS-item
- Besluit: nieuw opnemen als ankerconcept

#### 3. lj1v-sr3-phone - Trage telefoon
- Kerndoel/subdoel: 21A Digitale systemen
- Vraagtype: single
- Vraag: De telefoon van Youssef is traag. Wat helpt meestal zonder foto's of accounts te wissen?
- Antwoordopties:
  1. Ongebruikte apps of downloads opruimen en updates installeren. *(correct)*
  2. De helderheid van het scherm lager zetten.
  3. Het toetsenbordgeluid uitzetten.
  4. Alle foto's naar de prullenbak verplaatsen.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Concreet functioneel gebruik van een digitaal systeem. Single choice is passend voor VMBO leerjaar 1.
- Bronstatus: Verbeterde huidige vraag + DigiCheck-variant telefoon van Stan
- Besluit: behouden in verbeterde vorm

#### 4. lj1v-sr4-official-source - Officiele bron controleren
- Kerndoel/subdoel: 21B Digitale media en informatie
- Vraagtype: single
- Vraag: In de groepsapp staat dat school morgen dicht is door storm. Welke bron controleer je eerst?
- Antwoordopties:
  1. Een bericht van school in de officiele app of mail. *(correct)*
  2. Een screenshot in de groepsapp zonder afzender.
  3. Een reactie onder een video van iemand uit een andere stad.
  4. Een fanaccount met veel likes.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet bronbetrouwbaarheid in een herkenbare context. Geen internetgebruik nodig tijdens de afname.
- Bronstatus: Nieuw itembank-item, aangepast
- Besluit: vervangt zwakkere bronkoppenvraag

#### 5. lj1v-sr5-algorithm - Aanbevelingen
- Kerndoel/subdoel: 21B Digitale media en informatie
- Vraagtype: single
- Vraag: Luna kijkt een paar video's over voetbal. Daarna ziet ze steeds meer voetbalvideo's. Hoe komt dat meestal?
- Antwoordopties:
  1. De app gebruikt haar kijkgedrag om nieuwe video's te kiezen. *(correct)*
  2. De maker van een video bepaalt precies welke leerling de video ziet.
  3. Iedereen uit haar klas krijgt dezelfde aanbevelingen.
  4. Het komt alleen door het tijdstip van de dag.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Toetst dat leerlingen personalisatie door platforms herkennen. Dit sluit aan bij sociale media die aandacht trekken en vasthouden.
- Bronstatus: Verbeterde huidige algoritmevraag + nieuw itembank-item
- Besluit: behouden in verbeterde vorm

#### 6. lj1v-sr6-data-poll - Kleine poll
- Kerndoel/subdoel: 21C Data
- Vraagtype: single
- Vraag: In een poll stemmen 8 leerlingen uit jouw klas op voetbal. Kun je dan zeggen dat voetbal de populairste sport van de hele school is?
- Antwoordopties:
  1. Nee, daarvoor is de groep te klein en te beperkt. *(correct)*
  2. Ja, want 8 stemmen is altijd genoeg.
  3. Ja, als de poll online stond.
  4. Nee, online polls tellen nooit mee.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet het basisidee dat een dataset maar een beperkt beeld geeft van de werkelijkheid.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen voor 21C-dekking

#### 7. lj1v-sr7-ai-check - AI controleren
- Kerndoel/subdoel: 21D Artificiele Intelligentie (AI)
- Vraagtype: single
- Vraag: Een chatbot geeft een antwoord voor je werkstuk. Je weet niet of het klopt. Wat kun je het best doen?
- Antwoordopties:
  1. Ik controleer het in een betrouwbare andere bron. *(correct)*
  2. Ik gebruik het meteen, want het klinkt netjes.
  3. Ik vraag dezelfde chatbot of hij zeker is.
  4. Ik kies de langste zin uit het antwoord.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet verantwoord en kritisch omgaan met AI zonder dat de leerling internet hoeft te gebruiken.
- Bronstatus: Verbeterde huidige AI-vraag
- Besluit: behouden in verbeterde vorm

#### 8. lj1v-sr8-image-rights - Afbeelding gebruiken
- Kerndoel/subdoel: 22A Creeren met digitale technologie
- Vraagtype: single
- Vraag: Je vindt een mooie afbeelding voor een schoolposter. Wat doe je eerst?
- Antwoordopties:
  1. Kijken of je de afbeelding mag gebruiken en de maker of bron noemen. *(correct)*
  2. De afbeelding gebruiken, want alles op internet is vrij.
  3. De afbeelding kleiner maken; dan is hij van jou.
  4. Er een filter overheen zetten; dan mag het altijd.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Beperkte SR-dekking van 22A zonder Creative Commons-terminologie. De vraag blijft concreet en eenduidig.
- Bronstatus: Verbeterde huidige auteursrechtvraag
- Besluit: behouden in vereenvoudigde vorm

#### 9. lj1v-sr9-photo-consent - Foto delen
- Kerndoel/subdoel: 23B Digitale technologie, jezelf en de ander
- Vraagtype: single
- Vraag: Je maakt een foto van drie klasgenoten. Je wilt die in een sociale app zetten. Wat doe je eerst?
- Antwoordopties:
  1. Vragen of iedereen op de foto dat goed vindt. *(correct)*
  2. Alleen de namen weglaten; dan mag het altijd.
  3. De foto plaatsen en verwijderen als iemand klaagt.
  4. De foto alleen in de klassenapp zetten.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet respectvol en verantwoordelijk online handelen in eenvoudige taal.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen

#### 10. lj1v-sr10-platform - Afhankelijk van een schoolapp
- Kerndoel/subdoel: 23C Digitale technologie, samenleving en wereld
- Vraagtype: single
- Vraag: De school gebruikt een app voor rooster, huiswerk en berichten. Wat is een risico?
- Antwoordopties:
  1. Bij een storing missen leerlingen meerdere soorten informatie tegelijk. *(correct)*
  2. De app krijgt soms een ander icoon.
  3. Leerlingen krijgen automatisch hetzelfde wachtwoord.
  4. De telefoon van leerlingen wordt dan altijd sneller.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet afhankelijkheid van digitale systemen in een schoolcontext. Afleiders zijn aangepast zodat ze kort en niet stigmatiserend zijn.
- Bronstatus: Verbeterde huidige platformvraag + nieuw itembank-item
- Besluit: behouden in verbeterde vorm


### Nulmeting Digitale Geletterdheid - Leerjaar 1 HAVO/VWO (lj1-hv)

#### 1. lj1h-sr1-pw-passphrase - Wachtwoordzin
- Kerndoel/subdoel: 23A Veiligheid en privacy
- Vraagtype: single
- Vraag: Welk wachtwoord is het veiligst?
- Antwoordopties:
  1. DeBlauweTreinStaatNaastDeSporthal *(correct)*
  2. Welkom2026!
  3. Tr3in!
  4. !Qw@#Er$%
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Zelfde kernconcept als bij VMBO, met iets compactere formulering. Correct is de langste wachtwoordzin zonder speciale tekens.
- Bronstatus: Verbeterde huidige vraag + DigiCheck-variant
- Besluit: behouden in verbeterde vorm

#### 2. lj1h-sr2-https-nuance - Slotje en betrouwbaarheid
- Kerndoel/subdoel: 23A Veiligheid en privacy
- Vraagtype: single
- Vraag: Je ziet dit webadres: 🔒 https://leerplein-voorbeeld.nl/login/rooster?groep=1h2. Welke uitspraak klopt?
- Antwoordopties:
  1. De verbinding is versleuteld, maar je moet nog steeds controleren of de site echt van school is. *(correct)*
  2. De website is automatisch betrouwbaar door het slotje.
  3. De website is veilig omdat er .nl in staat.
  4. De verbinding is onveilig omdat er een vraagteken in de link staat.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Oplopende moeilijkheid: niet alleen herkennen van https, maar ook weten wat het wel en niet garandeert.
- Bronstatus: DigiCheck-variant + analyse HTTPS-item
- Besluit: nieuw opnemen als ankerconcept

#### 3. lj1h-sr3-phone-actions - Trage telefoon
- Kerndoel/subdoel: 21A Digitale systemen
- Vraagtype: multiple - kies 2
- Vraag: Youssef zijn telefoon is traag en loopt soms vast. Kies twee acties die meestal kunnen helpen.
- Antwoordopties:
  1. Ongebruikte apps en bestanden opruimen. *(correct)*
  2. Beschikbare updates via de instellingen installeren. *(correct)*
  3. De helderheid van het scherm lager zetten.
  4. Het toetsenbordgeluid uitzetten.
  5. Het wachtwoord van de telefoon veranderen.
  6. Ik weet het niet.
- Scoring: 1 punt alleen als exact 2 correcte opties zijn geselecteerd; 'Ik weet het niet.' is exclusief en scoort 0
- Onderbouwing: Multiple select maakt het item iets moeilijker dan VMBO leerjaar 1, maar blijft concreet.
- Bronstatus: DigiCheck-variant telefoon van Stan + huidige telefoonitem
- Besluit: behouden in moeilijkere variant

#### 4. lj1h-sr4-search-query - Gerichte zoekopdracht
- Kerndoel/subdoel: 21B Digitale media en informatie
- Vraagtype: single
- Vraag: Je zoekt betrouwbare informatie over hoeveel jongeren e-bikes gebruiken. Welke zoekopdracht past het best?
- Antwoordopties:
  1. onderzoek jongeren e-bike gebruik Nederland *(correct)*
  2. e-bike gebruik
  3. jongeren fietsen
  4. e-bike kopen ervaringen
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet doelgericht navigeren in het informatielandschap zonder leerlingen echt te laten zoeken.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen

#### 5. lj1h-sr5-feed - Feed is geen steekproef
- Kerndoel/subdoel: 21B Digitale media en informatie
- Vraagtype: single
- Vraag: Je ziet op een videoplatform tien video's met dezelfde mening. Wat kun je daaruit het best afleiden?
- Antwoordopties:
  1. Niet meteen dat iedereen die mening heeft; je feed kan door een algoritme zijn gekozen. *(correct)*
  2. Dat de mening zeker waar is.
  3. Dat alle andere meningen zijn verwijderd.
  4. Dat het platform geen invloed heeft op wat je ziet.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Combineert algoritmisch begrip met informatiebeoordeling. Past bij het SLO-onderdeel over aandacht en beinvloeding door sociale media.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen

#### 6. lj1h-sr6-sample - Steekproef
- Kerndoel/subdoel: 21C Data
- Vraagtype: single
- Vraag: Een dataset bevat alleen antwoorden van leerlingen uit een klas. Waar moet je voor oppassen?
- Antwoordopties:
  1. Je kunt niet zomaar zeggen dat dit voor alle leerlingen geldt. *(correct)*
  2. Een klas is altijd genoeg om iets over heel Nederland te zeggen.
  3. De dataset is automatisch fout.
  4. Meer data maakt nooit verschil.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Behoudt het sterke construct van de huidige vraag, maar de taal blijft direct.
- Bronstatus: Huidig item, licht geredigeerd
- Besluit: behouden

#### 7. lj1h-sr7-ai-startpunt - AI als hulpmiddel
- Kerndoel/subdoel: 21D Artificiele Intelligentie (AI)
- Vraagtype: single
- Vraag: Je gebruikt AI om ideeen voor een spreekbeurt te krijgen. Wat is de beste werkwijze?
- Antwoordopties:
  1. Ideeen gebruiken als startpunt en feiten daarna zelf controleren. *(correct)*
  2. De hele tekst inleveren zonder te lezen.
  3. Alle bronnen overslaan, want AI heeft al gezocht.
  4. Alleen vragen om langere zinnen zodat het slimmer lijkt.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet doelgericht en kritisch interacteren met AI. Minder dubbeling dan een tweede losse hallucinatiewvraag.
- Bronstatus: Nieuw itembank-item + huidige AI-verifieervraag
- Besluit: vervangt dubbele AI-hallucinatievraag

#### 8. lj1h-sr8-image-source - Afbeelding in presentatie
- Kerndoel/subdoel: 22A Creeren met digitale technologie
- Vraagtype: single
- Vraag: Je gebruikt een foto in een presentatie voor school. Wat controleer je eerst?
- Antwoordopties:
  1. Of je de foto mag gebruiken en welke maker of bron je moet noemen. *(correct)*
  2. Of de foto veel likes heeft.
  3. Of je de foto zwart-wit kunt maken.
  4. Of de foto groter wordt als je hem kopieert.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Vervangt Creative Commons-terminologie door basisgedrag rond auteursrecht, bron- en naamsvermelding.
- Bronstatus: Vervanging voor huidige CC-vraag
- Besluit: vervangen

#### 9. lj1h-sr9-threat-message - Dreigend privebericht
- Kerndoel/subdoel: 23B Digitale technologie, jezelf en de ander
- Vraagtype: multiple - kies 2
- Vraag: Een klasgenoot stuurt een dreigend privebericht. Kies twee verstandige acties.
- Antwoordopties:
  1. Bewijs bewaren, bijvoorbeeld een screenshot. *(correct)*
  2. Melden bij een mentor, ouder of vertrouwenspersoon. *(correct)*
  3. Het bericht openbaar posten om steun te krijgen.
  4. Terugdreigen zodat de ander stopt.
  5. Het bericht verwijderen en doen alsof het niet is gebeurd.
  6. Ik weet het niet.
- Scoring: 1 punt alleen als exact 2 correcte opties zijn geselecteerd; 'Ik weet het niet.' is exclusief en scoort 0
- Onderbouwing: Meet adequaat omgaan met ongepast gedrag, zonder open antwoord of rubric.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen

#### 10. lj1h-sr10-ad-profile - Dataprofielen en reclame
- Kerndoel/subdoel: 23C Digitale technologie, samenleving en wereld
- Vraagtype: single
- Vraag: Waarom zie je soms reclame voor iets waar je net online naar zocht?
- Antwoordopties:
  1. Websites en apps kunnen gedrag gebruiken om een advertentieprofiel te maken. *(correct)*
  2. Je telefoon luistert altijd live mee met elk gesprek.
  3. Alle reclames zijn voor iedereen hetzelfde.
  4. Reclame wordt gekozen door je mentor.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet maatschappelijke werking van data en platforms in herkenbare taal.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen


### Nulmeting Digitale Geletterdheid - Leerjaar 3 VMBO (lj3-vmbo)

#### 1. lj3v-sr1-https-phishing - Slotje bij verdachte link
- Kerndoel/subdoel: 23A Veiligheid en privacy
- Vraagtype: single
- Vraag: Je krijgt een mail: 'Je cijferlijst staat klaar.' De link is 🔒 https://school-cijfers-login.example.net/controle. Wat doe je?
- Antwoordopties:
  1. Niet via de link inloggen; via de officiele schoolsite of app controleren. *(correct)*
  2. Wel klikken, want het slotje betekent dat de site echt van school is.
  3. Wel klikken, want de link begint met https.
  4. De link doorsturen naar de klas zodat iedereen kan kijken.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Oudere leerlingen krijgen de nuance dat https geen bewijs is dat de site betrouwbaar of echt is.
- Bronstatus: DigiCheck-variant + nieuw phishing-item
- Besluit: nieuw opnemen als moeilijkere ankereditie

#### 2. lj3v-sr2-mfa - Onverwachte inlogmelding
- Kerndoel/subdoel: 23A Veiligheid en privacy
- Vraagtype: single
- Vraag: Je krijgt een melding: 'Wil je deze login goedkeuren?' Je probeert zelf niet in te loggen. Wat kies je?
- Antwoordopties:
  1. Afwijzen en je account controleren via de officiele instellingen. *(correct)*
  2. Goedkeuren om van de melding af te zijn.
  3. Goedkeuren als de melding maar een keer komt.
  4. Negeren en verder niets doen.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet beschermen tegen zwakke plekken en risicobewust handelen bij accountbeveiliging.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen

#### 3. lj3v-sr3-phone-actions - Telefoon versnellen
- Kerndoel/subdoel: 21A Digitale systemen
- Vraagtype: multiple - kies 3
- Vraag: De telefoon van Youssef is oud, traag en loopt soms vast. Kies drie acties die meestal kunnen helpen.
- Antwoordopties:
  1. Oude of ongebruikte apps en bestanden opruimen. *(correct)*
  2. Tijdelijke bestanden of cache opruimen via de instellingen. *(correct)*
  3. Beschikbare systeemupdates via de instellingen installeren. *(correct)*
  4. De helderheid van het scherm lager zetten.
  5. Het toetsenbordgeluid uitzetten.
  6. Een andere achtergrondfoto kiezen.
  7. Ik weet het niet.
- Scoring: 1 punt alleen als exact 3 correcte opties zijn geselecteerd; 'Ik weet het niet.' is exclusief en scoort 0
- Onderbouwing: Gebaseerd op de DigiCheck-telefoonvraag, maar met de naam Youssef en met heldere, scoreerbare keuzes.
- Bronstatus: DigiCheck-variant telefoon van Stan
- Besluit: nieuw opnemen als multiple select

#### 4. lj3v-sr4-health-source - Gezondheidsinformatie
- Kerndoel/subdoel: 21B Digitale media en informatie
- Vraagtype: single
- Vraag: Je zoekt informatie over slaaptekort. Welke bron is het meest geschikt voor betrouwbare basisinformatie?
- Antwoordopties:
  1. Een gezondheidswebsite van artsen of een publieke organisatie met datum en uitleg. *(correct)*
  2. Een webshop die slaapdrankjes verkoopt.
  3. Een influencer die zegt dat hij nooit slaapt.
  4. Een losse reactie onder een video.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Versterkt informatievaardigheid in leerjaar 3 zonder actuele links of zoekopdracht.
- Bronstatus: Nieuw itembank-item + huidige bronkwaliteit
- Besluit: vervangen door algemenere bronvraag

#### 5. lj3v-sr5-sponsored - Sponsoring herkennen
- Kerndoel/subdoel: 21B Digitale media en informatie
- Vraagtype: single
- Vraag: Een populaire gamer noemt een energiedrank 'de beste voor concentratie' en gebruikt kortingscode GAMER10. Waar moet je op letten?
- Antwoordopties:
  1. Het kan reclame of sponsoring zijn. *(correct)*
  2. Een kortingscode bewijst dat het product werkt.
  3. Gamers mogen geen reclame maken.
  4. Veel volgers maken de uitspraak wetenschappelijk.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet bronbelang en commerciele beinvloeding. Past bij mediawijsheid en is minder talig dan abstracte brondefinities.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen

#### 6. lj3v-sr6-percent - Percentages vergelijken
- Kerndoel/subdoel: 21C Data
- Vraagtype: single
- Vraag: Klas A heeft 10 van de 20 leerlingen met een fietshelm. Klas B heeft 12 van de 30. Welke klas heeft het hoogste percentage?
- Antwoordopties:
  1. Klas A. *(correct)*
  2. Klas B.
  3. Ze zijn gelijk.
  4. Dat kun je nooit berekenen.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet verhouding lezen in data, niet alleen een spreadsheetknop. Kort genoeg voor VMBO leerjaar 3.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen

#### 7. lj3v-sr7-ai-bias - AI en trainingsdata
- Kerndoel/subdoel: 21D Artificiele Intelligentie (AI)
- Vraagtype: single
- Vraag: Een AI laat alleen mannen zien als je vraagt om een afbeelding van 'een directeur'. Wat is een goede verklaring?
- Antwoordopties:
  1. De AI heeft vooral voorbeelden met mannen in die rol geleerd. *(correct)*
  2. De AI vindt mannen aardiger.
  3. Vrouwen zijn nooit directeur.
  4. Het programma is altijd kapot.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Huidig construct is sterk, maar de afleiders worden eenduidiger gemaakt.
- Bronstatus: Verbeterde huidige AI-biasvraag
- Besluit: behouden in verbeterde vorm

#### 8. lj3v-sr8-music-rights - Muziek onder video
- Kerndoel/subdoel: 22A Creeren met digitale technologie
- Vraagtype: single
- Vraag: Je maakt een video voor school en wilt een bekend liedje eronder zetten en online plaatsen. Wat is het best?
- Antwoordopties:
  1. Controleren of je het liedje mag gebruiken of rechtenvrije muziek kiezen. *(correct)*
  2. Het liedje zachter zetten; dan geldt auteursrecht niet.
  3. Alleen de eerste minuut gebruiken; dat mag altijd.
  4. De titel niet noemen, dan merkt niemand het.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Beperkte, praktische 22A-dekking zonder Creative Commons-terminologie.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen

#### 9. lj3v-sr9-fake-account - Nepaccount melden
- Kerndoel/subdoel: 23B Digitale technologie, jezelf en de ander
- Vraagtype: multiple - kies 2
- Vraag: Iemand maakt een account aan met jouw naam en foto. Kies twee goede acties.
- Antwoordopties:
  1. Het account rapporteren bij het platform. *(correct)*
  2. Bewijs bewaren, bijvoorbeeld screenshots van profiel en berichten. *(correct)*
  3. Zelf ook een nepaccount van die persoon maken.
  4. Iedereen vragen het account te volgen om te kijken wat er gebeurt.
  5. Je echte account verwijderen zonder iets te melden.
  6. Ik weet het niet.
- Scoring: 1 punt alleen als exact 2 correcte opties zijn geselecteerd; 'Ik weet het niet.' is exclusief en scoort 0
- Onderbouwing: Meet adequaat reageren op ongepast online gedrag. Multiple select past bij leerjaar 3.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen

#### 10. lj3v-sr10-digital-chances - Online formulier
- Kerndoel/subdoel: 23C Digitale technologie, samenleving en wereld
- Vraagtype: single
- Vraag: Een stagebedrijf laat sollicitanten alleen via een ingewikkeld online formulier reageren. Wat kan een gevolg zijn?
- Antwoordopties:
  1. Mensen met minder digitale vaardigheden kunnen moeilijker meedoen. *(correct)*
  2. Iedereen krijgt automatisch dezelfde kans.
  3. Solliciteren wordt daardoor altijd eerlijker.
  4. Het bedrijf heeft dan geen privacyregels nodig.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet digitale ongelijkheid in een beroepsgerichte context, passend bij VMBO leerjaar 3.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen


### Nulmeting Digitale Geletterdheid - Leerjaar 3 HAVO/VWO (lj3-hv)

#### 1. lj3h-sr1-https-limits - Grenzen van https
- Kerndoel/subdoel: 23A Veiligheid en privacy
- Vraagtype: single
- Vraag: Je ziet dit webadres: 🔒 https://mijnschool-login.example.com/verify?session=8421. Welke uitspraak klopt?
- Antwoordopties:
  1. HTTPS versleutelt de verbinding, maar bewijst niet dat de website eerlijk of echt van school is. *(correct)*
  2. HTTPS bewijst dat de website geen phishing kan zijn.
  3. HTTPS betekent dat de overheid de website heeft goedgekeurd.
  4. HTTPS is alleen nodig bij webshops, niet bij schoolaccounts.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Hoogste niveau van het ankerconcept: onderscheid tussen transportbeveiliging en betrouwbaarheid van de website.
- Bronstatus: DigiCheck-variant + analyse HTTPS-item
- Besluit: nieuw opnemen als moeilijkere ankereditie

#### 2. lj3h-sr2-datalek - Wachtwoordlek en hergebruik
- Kerndoel/subdoel: 23A Veiligheid en privacy
- Vraagtype: single
- Vraag: Een website waar jij een account hebt, meldt een datalek. Je gebruikte daar hetzelfde wachtwoord als voor school. Wat is de beste actie?
- Antwoordopties:
  1. Het schoolwachtwoord direct wijzigen en waar mogelijk tweestapsverificatie controleren. *(correct)*
  2. Alleen het wachtwoord van de gelekte website wijzigen.
  3. Wachten tot school zegt dat er iets mis is.
  4. Hetzelfde wachtwoord houden als het sterk genoeg lijkt.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Vervolgt het wachtwoordanker op hoger niveau: niet alleen sterkte, maar ook hergebruik en schade na een lek.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen

#### 3. lj3h-sr3-phone-actions - Telefoon en onderhoud
- Kerndoel/subdoel: 21A Digitale systemen
- Vraagtype: multiple - kies 3
- Vraag: Youssef zijn telefoon wordt traag en loopt vaak vast. Kies drie acties die het meest logisch zijn.
- Antwoordopties:
  1. Onnodige apps en grote bestanden opruimen. *(correct)*
  2. Cache of tijdelijke gegevens opruimen via instellingen. *(correct)*
  3. Systeem en apps updaten via officiele instellingen. *(correct)*
  4. Schermhelderheid lager zetten.
  5. Alle meldingen aanzetten.
  6. Toetsenbordgeluid uitzetten.
  7. Ik weet het niet.
- Scoring: 1 punt alleen als exact 3 correcte opties zijn geselecteerd; 'Ik weet het niet.' is exclusief en scoort 0
- Onderbouwing: DigiCheck-concept wordt gebruikt als functioneel systeemonderhoud, met precies drie juiste keuzes.
- Bronstatus: DigiCheck-variant telefoon van Stan
- Besluit: nieuw opnemen als multiple select

#### 4. lj3h-sr4-triangulation - Claim controleren
- Kerndoel/subdoel: 21B Digitale media en informatie
- Vraagtype: single
- Vraag: Je vindt een opvallende claim over een nieuwe schoolregel. Welke controle is het sterkst?
- Antwoordopties:
  1. Controleren of de school zelf of meerdere betrouwbare bronnen dezelfde regel melden. *(correct)*
  2. Kijken of de post veel gedeeld is.
  3. Kijken of de tekst boos klinkt.
  4. De claim geloven als er een screenshot bij staat.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet triangulatie en broncontrole zonder afhankelijkheid van actuele websites.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen

#### 5. lj3h-sr5-filterbubble - Filterbubbel
- Kerndoel/subdoel: 21B Digitale media en informatie
- Vraagtype: single
- Vraag: Je nieuwsfeed toont vooral berichten die jouw mening bevestigen. Wat is verstandig?
- Antwoordopties:
  1. Ook actief zoeken naar betrouwbare bronnen met andere invalshoeken. *(correct)*
  2. Aannemen dat bijna iedereen jouw mening deelt.
  3. Alle bronnen met andere meningen blokkeren.
  4. Alleen nog reacties onder posts lezen.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Verbindt algoritmische selectie met eigen interpretatie en voorkeuren, passend bij havo/vwo.
- Bronstatus: Nieuw itembank-item + huidige filterbubblevraag
- Besluit: behouden in verbeterde vorm

#### 6. lj3h-sr6-graph-scale - Grafiekschaal
- Kerndoel/subdoel: 21C Data
- Vraagtype: single
- Vraag: Een grafiek begint niet bij 0, waardoor een klein verschil heel groot lijkt. Waar moet je op letten?
- Antwoordopties:
  1. De schaal van de y-as kan het verschil groter laten lijken. *(correct)*
  2. Een grafiek met kleur is altijd misleidend.
  3. Als een grafiek stijgt, is de oorzaak meteen bewezen.
  4. De titel van de grafiek is genoeg om de data te begrijpen.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet kritisch kijken naar datavisualisatie; vult de spreadsheet-performance taak inhoudelijk aan.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen

#### 7. lj3h-sr7-ai-privacy - AI en persoonsgegevens
- Kerndoel/subdoel: 21D Artificiele Intelligentie (AI)
- Vraagtype: multiple - kies 2
- Vraag: Je wilt een AI-tool feedback laten geven op een verslag over een klasgenoot. Kies twee dingen die je beter eerst verwijdert of vervangt.
- Antwoordopties:
  1. De volledige naam van de klasgenoot. *(correct)*
  2. Medische of andere persoonlijke details over de klasgenoot. *(correct)*
  3. De vraag: 'Maak de tekst duidelijker.'
  4. Een algemene omschrijving zoals 'een leerling'.
  5. Een neutrale alinea over de opbouw van het verslag.
  6. Ik weet het niet.
- Scoring: 1 punt alleen als exact 2 correcte opties zijn geselecteerd; 'Ik weet het niet.' is exclusief en scoort 0
- Onderbouwing: Meet verantwoord en kritisch interacteren met AI, met privacy als concrete grens.
- Bronstatus: Nieuw itembank-item
- Besluit: nieuw opnemen

#### 8. lj3h-sr8-remix-rights - Afbeelding aanpassen
- Kerndoel/subdoel: 22A Creeren met digitale technologie
- Vraagtype: single
- Vraag: Je wilt een afbeelding van internet aanpassen voor een online poster. Wat controleer je eerst?
- Antwoordopties:
  1. Of de maker dit toestaat, welke bronvermelding nodig is en of bewerken en delen mag. *(correct)*
  2. Of de afbeelding groot genoeg is om de maker niet te hoeven noemen.
  3. Of je de kleuren sterk kunt veranderen; dan is het altijd eigen werk.
  4. Of je de poster alleen in een groepsapp deelt; dan gelden geen regels.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Houdt 22A praktisch en vermijdt Creative Commons-afkortingen als toetsterm.
- Bronstatus: Vervanging voor huidige CC-BY-SA-vraag
- Besluit: vervangen

#### 9. lj3h-sr9-private-photo - Privefoto zonder toestemming
- Kerndoel/subdoel: 23B Digitale technologie, jezelf en de ander
- Vraagtype: single
- Vraag: Iemand deelt een privefoto van een klasgenoot in een besloten groep. Die klasgenoot gaf geen toestemming. Wat is het beste?
- Antwoordopties:
  1. Niet verder delen, rapporteren en hulp inschakelen. *(correct)*
  2. Alleen bewaren en verder niets doen.
  3. Doorsturen naar een kleiner groepje dat je vertrouwt.
  4. Een grap maken zodat de spanning daalt.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet grenzen, toestemming en verantwoordelijk online handelen bij een serieuze situatie.
- Bronstatus: Nieuw itembank-item, minder expliciet geformuleerd
- Besluit: nieuw opnemen

#### 10. lj3h-sr10-regulation - Regels voor platforms
- Kerndoel/subdoel: 23C Digitale technologie, samenleving en wereld
- Vraagtype: single
- Vraag: Waarom maken landen en de EU regels voor grote online platforms?
- Antwoordopties:
  1. Omdat platforms veel invloed hebben op informatie, handel en gegevens van burgers. *(correct)*
  2. Omdat platforms dan geen winst meer mogen maken.
  3. Omdat alle apps door scholen worden gebouwd.
  4. Omdat algoritmes zonder regels altijd eerlijk zijn.
  5. Ik weet het niet.
- Scoring: 1 punt voor exact de correcte keuze
- Onderbouwing: Meet hoe technologie, media en samenleving elkaar beinvloeden; passend voor havo/vwo leerjaar 3.
- Bronstatus: Verbeterde huidige reguleringsvraag + nieuw itembank-item
- Besluit: behouden in verbeterde vorm

## Beslisbijlage DigiCheck-inspiratie

- Introductiescherm: overnemen als flow, maar aanpassen naar geen internetgebruik en 30 minuten.
- Privacyverklaring: overnemen als concept, maar herschrijven naar leerlingtaal, zonder meer-informatie-link en zonder naamverwerking.
- Zelfinschatting 0-100: overnemen als concept.
- Wachtwoordvraag: opnemen als variant. Correct antwoord is de langste wachtwoordzin zonder speciale tekens; er is een afleider met veel speciale tekens.
- HTTPS/slotje: opnemen in alle versies als ankerconcept, met oplopende nuance.
- Telefoon van Stan: opnemen als telefoonvraag met Youssef. VMBO leerjaar 1 single choice; oudere versies multiple select.
- Notificaties/dark pattern: niet als extra SR in deze 10-itemset, omdat dit al terugkomt in de huidige performance taak voor lj1-hv en in algoritme/feeditems. Reserveconstruct voor later.
- Schermdelen: niet als SR opnemen, omdat PT6 dit al als performance task meet.
- Excel/downloadtaken: niet als SR opnemen, omdat PT4 dit al als performance task meet.
- Reverse image search en online zoekopdrachten: niet opnemen door actualiteitsrisico, scoreerbaarheid en de keuze om geen internet te gebruiken.
- Vectorbestand/logo: niet opnemen in de basisset; terminologie is relatief specifiek en kan makkelijk bestandsextensiekennis worden.

## Codex-implementatieopdracht samenvatting

1. Vervang de huidige gedeelde zelfinschatting door een slider van 0 tot 100 en sla deze op als `selfEstimatePercent`, niet als scorepunt.
2. Voeg voor elke SR-vraag de optie `Ik weet het niet.` toe als vaste laatste optie, score 0.
3. Implementeer multiple select met exacte scoring en maak `Ik weet het niet.` exclusief.
4. Voeg aan performance tasks onderaan een knop `Sla over` toe naast `Volgende` of `Taak afronden`; score 0 en status `skipped`.
5. Gebruik startlinks per klas met `classToken`; leerlingen voeren geen naam of e-mail in.
6. Sla resultaten op met `classId` en `anonymousAttemptId`, niet met leerlingidentiteit.
7. Toon kerndoelen/subdoelen niet bij de vragen, alleen op de resultaatpagina.
8. Bereken `actualPercent = round(rawScore / maxScore * 100)`. Vergelijk deze met `selfEstimatePercent`.
9. Toon per kerndoel/subdoel percentage en aantallen scorepunten; gebruik SLO-labels.
10. Voeg PDF-download toe en blokkeer afsluiten tot het vinkje `Ik heb mijn scoreoverzicht opgeslagen en ik sluit nu de zelfscan af` is gezet.