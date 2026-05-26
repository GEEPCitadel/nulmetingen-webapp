# Overzicht performance taken voor analyse

Bronbestand: `src/data/assessments.ts`

Doel van dit document: compacte, analytische beschrijving van de performance taken in de huidige nulmetingen Digitale Geletterdheid. De beschrijvingen zijn bedoeld als input voor een analyse van de vraag of de vier vragensets als geheel evenwichtig, valide en passend gespreid zijn. Dit is intern analyse-materiaal en geen leerlingmateriaal.

Let op: het in `AGENTS.md` genoemde brondocument `docs/nulmetingen_dg_v4_herschreven.md` staat niet in deze checkout. Dit overzicht beschrijft daarom de huidige implementatie.

## Leeswijzer voor ChatGPT-analyse

Beoordeel de performance taken niet als losse trucjes, maar als gedragsbewijs voor digitale geletterdheid. Let per taak op:

- Constructdekking: welke kerndoelen en vaardigheidsdomeinen worden feitelijk gemeten?
- Authenticiteit: lijkt de taak op een realistische digitale handeling voor leerlingen?
- Automatische scorebaarheid: is het bewijs objectief, eenduidig en niet rubric-afhankelijk?
- Complexiteit: neemt het aantal stappen, beslissingen en afleiders toe tussen leerjaren/niveaus?
- Balans: worden technische, data-, programmeer-, veiligheids-, communicatie- en burgerschapsvaardigheden evenwichtig afgedekt?
- Fairness: vraagt de taak algemene digitale vaardigheid, of specifieke voorkennis van een merk, interface of schoolcontext?

## Globale opbouw

| Versie | Performance taken | Totaal PT-punten | Opmerking |
|---|---:|---:|---|
| `lj1-vmbo` | 6 | 23 | Geen afzonderlijke security-taak; veiligheid/privacy zit vooral in schermdelen en online gedrag. |
| `lj1-hv` | 6 | 23 | Zelfde taakfamilies als lj1-vmbo, met iets complexere bestandsstructuur en programmeren met herhaling. |
| `lj3-vmbo` | 7 | 27 | Heeft extra PT3 over account/apparaatbeveiliging. |
| `lj3-hv` | 7 | 27 | Heeft extra PT3 en complexere varianten bij mail, data, programmeren en online verificatie. |

Elke set heeft daarnaast meerkeuzevragen en een niet-scorende zelfinschatting. Deze staan hier niet centraal.

## Taakfamilies

### PT1 - Bestanden en mappen

Type: `file_task_simulation`

Hoofdconstruct: basisvaardigheid digitale systemen en bestandsbeheer. Leerlingen moeten in een gesimuleerde Verkenner mappen maken, bestanden verplaatsen en bestanden hernoemen. Het scoringsbewijs is de eindtoestand van het bestandssysteem: staan de juiste bestanden met de juiste namen op de juiste plek, en zijn ongewenste plekken leeg gebleven?

Analytisch belang: deze taak meet praktische organisatievaardigheid, nauwkeurig lezen van bestandsnamen, hierarchisch denken in mappen en het kunnen uitvoeren van meerdere opeenvolgende interfacehandelingen. De taak is concreet en automatisch scorebaar, maar sterk afhankelijk van bekendheid met Windows/Verkenner-achtige interacties.

Versies:

- `lj1-vmbo`: maakt in OneDrive een map Schoolwerk, hernoemt een presentatie naar oude versie, verplaatst een Nederlands-verslag, maakt een submap Fotos en verplaatst een projectfoto. Vier relatief directe handelingen.
- `lj1-hv`: maakt Schoolwerk met twee vakmappen, en verdeelt een boekverslag en biologiediagram over de juiste submappen. Iets meer structuur en categorisering dan vmbo.
- `lj3-vmbo`: werkt in een stageproject, archiveert een oude versie, hernoemt de definitieve versie naar eindversie en ordent beeldmateriaal. Meer versiebeheer en beroepsgerichte context.
- `lj3-hv`: archiveert twee oude onderzoekversies, hernoemt de definitieve versie en bundelt bronnen/media. Hoogste complexiteit binnen deze taakfamilie door meerdere oude versies en bronmateriaal.

### PT2 - Mail opstellen

Type: `outlook_mail_simulation`

Hoofdconstruct: digitale communicatie en functioneel gebruik van e-mail. Leerlingen moeten ontvanger(s), onderwerp, bijlage en verzendactie correct instellen. Het scoringsbewijs bestaat uit velden en acties in de mailsimulatie.

Analytisch belang: de taak combineert interfacevaardigheid met communicatieve conventies. Omdat de inhoud van de mail zelf niet vrij geschreven hoeft te worden, blijft de scoring objectief. De taak meet vooral procedurele e-mailvaardigheid, niet schrijfkwaliteit.

Versies:

- `lj1-vmbo`, `lj1-hv`, `lj3-vmbo`: basisvariant. Stuur een Nederlands-verslag naar de mentor, met exact onderwerp en juiste bijlage, en verzend de mail.
- `lj3-hv`: geavanceerde variant. Stuur een onderzoeksverslag mediawijsheid naar de mentor, zet de projectgroep in CC, gebruik een specifiek onderwerp, voeg het verslag toe en verzend. Dit voegt adresseringsnuance en samenwerking/context toe.

### PT3 - Account, apparaat en verbinding beveiligen

Type: `account_security_simulation`

Hoofdconstruct: veiligheid, privacy en risicobewuste digitale handelingen. Deze taak komt alleen voor in leerjaar 3. Leerlingen kiezen veilige acties bij verdachte meldingen. Het scoringsbewijs bestaat uit gekozen acties per scherm; schadelijke of onveilige keuzes kunnen scoring verhinderen.

Analytisch belang: PT3 dekt een belangrijk veiligheidsconstruct dat in leerjaar 1 niet als zelfstandige performance task voorkomt. De taak meet herkenning van risico, niet alleen kennis. Let bij validiteit op of de opties duidelijk genoeg zijn om risicobewust handelen te meten, zonder ambiguiteit.

Versies:

- `lj3-vmbo`: twee situaties: een verdachte updateprompt en een verdachte loginmelding. Leerlingen moeten officiele update/accountbeveiligingsroutes herkennen en onveilige acties vermijden.
- `lj3-hv`: twee situaties: een macro-waarschuwing bij een bestand en een verdachte loginmelding. De havo/vwo-variant vraagt meer geavanceerde veiligheidsbeslissingen, waaronder afzender controleren, melden bij ICT, sessies/apparaten controleren en tweestapsverificatie.

### PT4 - Excel/data sorteren en filteren

Type: `excel_download_task`

Hoofdconstruct: datageletterdheid en functioneel spreadsheetgebruik. Leerlingen downloaden een spreadsheet, sorteren/filteren data en geven een code of uitkomst door. Het scoringsbewijs is het ingevulde korte antwoord op basis van de juiste sorteer/filterhandeling.

Analytisch belang: PT4 meet niet alleen Excel-knoppenkennis, maar vooral kunnen beantwoorden van datavragen door filteren en sorteren. Validiteitsrisico: de taak is afhankelijk van toegang tot Excel of vergelijkbare spreadsheetvaardigheid en van het correct openen van downloadbestanden.

Versies:

- `lj1-vmbo`: dataset met liedjes. Sorteer op jaar en filter op genre pop.
- `lj1-hv`: dataset met bibliotheek/vakken. Sorteer op jaar en filter op vak biologie.
- `lj3-vmbo`: dataset met bestellingen. Filter op categorie elektronica en op bedrag groter dan een grenswaarde, daarna sorteren.
- `lj3-hv`: dataset met open data rond woningen/energie. Filter op kosten en woningtype, daarna sorteren. Deze variant is inhoudelijk abstracter en numerieker.

### PT6 - Videovergadering en schermdelen

Type: `teams_share_simulation`

Hoofdconstruct: veilig en doelgericht samenwerken in een videovergadering. Leerlingen moeten alleen een specifiek venster delen, niet het hele scherm, en het juiste mediavenster kiezen. Het scoringsbewijs is het klikpad in de Teams-achtige interface.

Analytisch belang: deze taak meet praktische digitale samenwerkingsvaardigheid plus privacybewustzijn. De taak is identiek of vrijwel identiek in alle vier versies, waardoor hij goed als ankerachtige vergelijking kan dienen. Mogelijk risico: merkspecifieke bekendheid met Teams-achtige schermdeelinterfaces.

Alle versies:

- Klik op delen.
- Kies venster delen in plaats van scherm delen.
- Selecteer Windows Media Player als te delen venster.
- Deel daarmee alleen het filmfragment, zodat andere open vensters niet zichtbaar zijn.

### PT7 - Blokprogrammeren

Type: `block_programming_task`

Hoofdconstruct: computational thinking en programmeren met blokken. Leerlingen bouwen een programma door blokken in de juiste volgorde, structuur of voorwaardelijke logica te plaatsen. Het scoringsbewijs bestaat uit de gekozen blokken, hun ordening/nesting en/of gesimuleerd eindgedrag.

Analytisch belang: PT7 is de primaire meting voor programmeren. De complexiteit loopt duidelijk op: eenvoudige sequentie, herhaling, teller/voorwaarde, samengestelde logica. Let bij analyse op of de programmeerconstructen qua moeilijkheid passen bij niveau en leerjaar, en of afleiderblokken het beoogde begrip toetsen zonder onnodig te verwarren.

Versies:

- `lj1-vmbo`: sequentieel programma voor robot Bizzy: start op afspelen, zeg Hoi, beweeg 1 meter vooruit en draai naar 180 graden. Meet volgorde, startblok en basisactieblokken.
- `lj1-hv`: Bizzy zegt Hoi en beweegt drie keer vooruit. Voegt herhaling en nesting toe.
- `lj3-vmbo`: teller begint op 0; elke druk op knop A verhoogt de teller; bij 5 of meer toont het scherm vol. Meet variabele/teller, event, increment en eenvoudige voorwaarde.
- `lj3-hv`: als temperatuur hoger is dan 25 en raam open staat, toon waarschuwing; anders toon ok. Meet input lezen, samengestelde EN-voorwaarde en dan/anders-logica.

### PT8 - Online gedrag

Type: `social_action_simulation`

Hoofdconstruct: digitaal burgerschap, online veiligheid, mediawijsheid en sociaal verantwoord handelen. Leerlingen beoordelen situaties en kiezen veilige/verantwoorde acties. Het scoringsbewijs bestaat uit single-choice, multi-choice of matching-acties binnen gesimuleerde schermen.

Analytisch belang: PT8 brengt de sociale en maatschappelijke kant van digitale geletterdheid in performance-vorm. De taak meet beslisgedrag in context, niet alleen definitiekennis. Let bij validiteit op de balans tussen duidelijk normatief handelen en realistische ambiguiteit.

Versies:

- `lj1-vmbo`: twee schermen. Eerst veilige deelinstellingen kiezen voor verschillende soorten informatie, daarna bij een klassenapp-situatie twee veilige acties kiezen rond pesten/delen.
- `lj1-hv`: misleidende appmelding. Leerling moet naar instellingen gaan en een veilige meldingsinstelling kiezen. Meet herkennen van sturende interfacekeuzes en regie over notificaties.
- `lj3-vmbo`: deepfake/pesten. Leerling beoordeelt de afbeelding, selecteert signalen en kiest veilige acties zoals niet doorsturen, rapporteren, bewijs bewaren of melden bij een vertrouwde volwassene.
- `lj3-hv`: gemanipuleerde video. Leerling beoordeelt waarschijnlijkheid, selecteert verdachte signalen en kiest een verificatieactie via officiele school/mentor of betrouwbare bron. Meer nadruk op verificatie en informatiekwaliteit.

## Dekking per domein

| Domein | Taken | Dekking |
|---|---|---|
| 21A Digitale systemen | PT1, PT2, PT6, deels PT3/PT4 | Sterk vertegenwoordigd in alle versies via bestandssysteem, mail, schermdelen en interfacehandelingen. |
| 21C Data | PT4 | Een duidelijke performance taak per versie. Complexiteit stijgt van eenvoudige sorteer/filtervragen naar meer numerieke open-data-context. |
| 22B Programmeren | PT7 | Een programmeertaak per versie met oplopende programmeerconcepten. |
| 23A Veiligheid/privacy | PT3, PT6, PT8 | In leerjaar 3 expliciet via PT3; in alle versies impliciet via schermdelen en online gedrag. |
| 23B Digitaal burgerschap | PT2, PT6, PT8 | Breed vertegenwoordigd, vooral via online gedrag en communicatiecontext. |
| 21D AI/mediawijsheid | Vooral PT8 leerjaar 3 | Komt in performance-vorm vooral terug bij deepfake/gemanipuleerde video; verder waarschijnlijk via SR-items. |
| 23C samenleving/wereld | Vooral PT8 lj3-hv | Beperkt in performance taken; mogelijk sterker aanwezig in meerkeuzevragen. |

## Observaties voor evenwicht en validiteit

- De performance-kern is breed: bestandsbeheer, mail, data, samenwerken, programmeren en online gedrag komen in alle vier versies terug.
- Leerjaar 3 heeft extra veiligheidsperformance via PT3, waardoor de puntentelling en constructdekking anders zijn dan in leerjaar 1.
- PT6 is identiek over versies en kan als vergelijkbare ankerachtige taak functioneren, maar draagt daardoor minder bij aan niveau-differentiatie.
- PT7 laat de duidelijkste progressie zien van eenvoudige sequentie naar herhaling, teller/voorwaarde en samengestelde logica.
- PT8 verschuift van privacy/delen en notificaties naar deepfake, manipulatie en verificatie, wat inhoudelijk passend lijkt bij leerjaarprogressie.
- PT4 is steeds automatisch scorebaar, maar het bewijs is een kort antwoord op basis van een externe spreadsheethandeling. Analyseer of foutieve antwoorden door spreadsheetvaardigheid, leesvaardigheid of databegrip veroorzaakt worden.
- PT2 is objectief scorebaar, maar meet vooral procedurele e-mailvaardigheid. Omdat drie van de vier versies dezelfde basisvariant gebruiken, is differentiatie beperkt.
- De sets zijn niet volledig symmetrisch: leerjaar 1 heeft 23 PT-punten, leerjaar 3 heeft 27 PT-punten. Bij vergelijking tussen versies moet dit worden meegewogen.

## Aanbevolen analysevragen voor ChatGPT

Gebruik deze vragen om het geheel te beoordelen:

1. Is de verdeling over technische vaardigheden, informatie/data, programmeren, veiligheid/privacy en burgerschap evenwichtig per versie?
2. Is de moeilijkheidsopbouw tussen `lj1-vmbo`, `lj1-hv`, `lj3-vmbo` en `lj3-hv` inhoudelijk verdedigbaar?
3. Zijn er taakfamilies die te veel punten of te veel overlap krijgen?
4. Zijn er constructen die alleen via meerkeuzevragen worden gemeten en nauwelijks via performance taken?
5. Zijn de performance taken automatisch scorebaar zonder dat de scoring te smal of te procedureel wordt?
6. Zijn er taken die vooral interfacebekendheid meten in plaats van digitale geletterdheid?
7. Zijn de veiligheids- en burgerschapstaken voldoende realistisch en leeftijdsadequaat?
8. Vormen PT's en SR-items samen een valide geheel, of ontbreekt er gedragsbewijs voor belangrijke kerndoelen?
