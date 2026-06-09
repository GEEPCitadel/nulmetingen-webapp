# Overzicht vragen, antwoordmogelijkheden en PT-taken

Bron: `nulmetingen_selected_response_herontwerp_v3.json`
Schema/status: `dg-nulmetingen-v3.7` - werkversie voor Codex-implementatie, pilotafname en interne review; vraag 9/SR2 vervangen door 21D/AI-vraag v4; vraag 16/SR9 hersteld als 23B foto-/toestemmingsvraag

PT-bron: `src/data/assessments.ts`

Doel: intern analysebestand voor beoordeling van kerndoeldekking en mogelijke item- en taakaanpassingen.
Let op: dit bestand bevat interne scoringsinformatie, correcte antwoorden en scoringsregels. Niet gebruiken als leerlingmateriaal.

## Kerndoeldekking selected-response

- Leerjaar 1 VMBO (lj1-vmbo): 21A: 1 | 21B: 2 | 21C: 1 | 21D: 1 | 22A: 1 | 23A: 1 | 23B: 2 | 23C: 1
- Leerjaar 1 HAVO/VWO (lj1-hv): 21A: 1 | 21B: 2 | 21C: 1 | 21D: 1 | 22A: 1 | 23A: 1 | 23B: 2 | 23C: 1
- Leerjaar 3 VMBO (lj3-vmbo): 21A: 1 | 21B: 2 | 21C: 1 | 21D: 1 | 22A: 1 | 23A: 1 | 23B: 2 | 23C: 1
- Leerjaar 3 HAVO/VWO (lj3-hv): 21A: 1 | 21B: 2 | 21C: 1 | 21D: 1 | 22A: 1 | 23A: 1 | 23B: 2 | 23C: 1

Totaal aantal selected-response-items: 40
Totaal aantal zelfinschattingen: 4
Totaal aantal performance tasks: 28

## Leerjaar 1 VMBO (lj1-vmbo)

### Zelfinschatting

#### Zelfinschatting (self-assessment)

- Sectie: Zelfinschatting (zelfinschatting)
- Item-id: self-assessment
- Type: self_assessment
- Kerndoel/subdoel: niet-scorend
- Punten: 0
- Vaardigheidsdomein: Zelfinschatting
- Vraag/instructie: Hoe digitaal geletterd schat je jezelf in? Schuif het bolletje naar jouw keuze. 0 betekent: ik schat mezelf helemaal niet digitaal geletterd in. 100 betekent: ik schat mezelf heel digitaal geletterd in.

Antwoordmogelijkheden:
- 0: helemaal niet digitaal geletterd
- 100: heel digitaal geletterd

### Performance tasks

#### PT 1: PT1 - Bestanden en mappen beheren (lj1v-pt1-files)

- Sectie: PT1 - Bestanden en mappen (pt1)
- Item-id: lj1v-pt1-files
- Type: file_task_simulation
- Kerndoel/subdoel: 21A
- Punten: 4
- Vaardigheidsdomein: 21A Digitale systemen
- Instructie: Kun jij je bestanden netjes ordenen? Voer de taken hieronder uit en klik daarna op 'Volgende'. Werk in OneDrive. Maak daarin de map Biologie. Verplaats de drie projectbestanden naar Biologie. Hernoem concept_dieren.docx naar project_dieren_verslag.docx.

Opdrachten:
- main (1 pt): map Biologie correct.
  - Verwacht pad: Thuis/OneDrive/Biologie
- files (1 pt): projectbestanden correct geplaatst.
  - Verwachte paden: Thuis/OneDrive/Biologie/bron_dieren.pdf; Thuis/OneDrive/Biologie/foto_kat.jpg
- rename (1 pt): verslag correct hernoemd en geplaatst.
  - Verwacht pad: Thuis/OneDrive/Biologie/project_dieren_verslag.docx
  - Verboden paden: Thuis/OneDrive/concept_dieren.docx; Thuis/OneDrive/Biologie/concept_dieren.docx
- subjects (1 pt): bestaande vakmappen blijven beschikbaar.
  - Verwachte paden: Thuis/OneDrive/Engels; Thuis/OneDrive/Maatschappij; Thuis/OneDrive/Mentorles; Thuis/OneDrive/Nederlands; Thuis/OneDrive/Wiskunde

#### PT 2: E-mail opstellen (lj1v-pt2-mail)

- Sectie: PT2 - Mail opstellen (pt2)
- Item-id: lj1v-pt2-mail
- Type: outlook_mail_simulation
- Kerndoel/subdoel: 21A
- Punten: 4
- Vaardigheidsdomein: 21A Digitale systemen / 23B Digitaal burgerschap
- Instructie: Stuur een verslag van Nederlands via e-mail naar je mentor. 1. Kies de juiste ontvanger in het juiste veld. 2. Gebruik het juiste onderwerp: Verslag Nederlands. 3. Voeg de juiste bijlage toe. 4. Verzend de e-mail.

Beschikbare opties:
- Knoppen: Verzenden, BCC tonen, Bestand bijvoegen, Hyperlink invoegen, Prioriteit, Concept opslaan, Verwijderen
- Contacten: docent@school.nl, groepsgenoot1@school.nl, groepsgenoot2@school.nl, klasgroep@school.nl, mentor@school.nl, projectgenoot@school.nl, stagebegeleider@bedrijf.nl
- Bestanden: Aantekeningen.docx, Foto_vakantie.jpg, Rooster.pdf, Verslag_Nederlands.docx

Scoringsregels:
- to: juiste ontvanger. (1 pt) | condities=to includes mentor@school.nl
- to includes mentor@school.nl
- sent: mail is verzonden. (1 pt) | condities=sent true
- sent true
- subject: juist onderwerp. (1 pt) | condities=subject equals Verslag Nederlands
- subject equals Verslag Nederlands
- attachment-sent: juiste bijlage en verzonden. (1 pt) | condities=attachments includes Verslag_Nederlands.docx
- attachments includes Verslag_Nederlands.docx

#### PT 3: PT3 - Bericht beoordelen (lj1v-pt3-security)

- Sectie: PT3 - Account, apparaat en verbinding beveiligen (pt3)
- Item-id: lj1v-pt3-security
- Type: account_security_simulation
- Kerndoel/subdoel: 23A
- Punten: 3
- Vaardigheidsdomein: 23A Veiligheid en privacy
- Instructie: Bekijk de e-mail en kies je antwoorden.

Schermen en antwoordmogelijkheden:
- Mail over je rooster (rooster-mail)
  - Instructie: Sanne krijgt deze mail op haar schoolaccount.
  - E-mail: Roosterwijziging voor morgen
    - Van: Roosterhulp <roosterhulp@citadel-rooster.nl>
    - Tekst: Hallo Sanne,
    - Tekst: Er is een roosterwijziging voor morgen. Controleer je rooster vandaag nog, zodat je geen lokaalwijziging mist.
    - Tekst: Bekijk je rooster via de knop hieronder.
  - Groep signals (multi): Waarom moet Sanne voorzichtig zijn? Kies 2.
    - Opties: De afzender gebruikt niet het bekende schooldomein.; De knop gaat naar een roostersite die niet duidelijk van school is.; De mail gebruikt Sanne's naam.; De mail ziet er netjes uit.; De mail gaat over haar rooster.; Ik weet het niet.
  - Groep actions (single): Wat kan Sanne nu het best doen?
    - Opties: Niet op de knop klikken en haar rooster zelf openen via de roosterapp of bekende schoolsite.; De mail beantwoorden en vragen of de link klopt.; De link openen en stoppen als de pagina vreemd lijkt.; De mail doorsturen naar de klas, zodat anderen kunnen meekijken.; Ik weet het niet.

Scoringsregels:
- signal-sender-domain: herkent dat de afzender niet het bekende schooldomein gebruikt. (1 pt) | groep=signals | type=allSelected | correct=sender_domain
- signal-roster-site: herkent dat de knop naar een onbekende roostersite gaat. (1 pt) | groep=signals | type=allSelected | correct=unknown_roster_site
- safe-route: kiest de bekende roosterapp of schoolsite in plaats van de mailknop. (1 pt) | groep=actions | type=singleCorrect | correct=known_route

#### PT 4: PT4 - Excel/data sorteren en filteren (lj1v-pt4-excel)

- Sectie: PT4 - Excel/data sorteren en filteren (pt4)
- Item-id: lj1v-pt4-excel
- Type: excel_download_task
- Kerndoel/subdoel: 21C, 21A
- Punten: 4
- Vaardigheidsdomein: 21C Data
- Instructie: Download LJ1_VMBO_Liedjes.xlsx. Open het in Excel. Klik op Bewerken inschakelen als Excel daarom vraagt.

Bestand: LJ1_VMBO_Liedjes.xlsx
Werkblad: Liedjes

Vragen en correcte antwoorden:
- a (2 pt): Sorteer op Jaar, van nieuw naar oud. Welke code staat bovenaan?
  - Correct antwoord/code: L09
- b (2 pt): Filter op Genre = pop. Sorteer daarna op Jaar, van oud naar nieuw. Welke code staat bovenaan?
  - Correct antwoord/code: L12

#### PT 5: Schermdelen in een online les (lj1vmbo-pt6-screen-share)

- Sectie: PT6 - Videovergadering en schermdelen (pt6)
- Item-id: lj1vmbo-pt6-screen-share
- Type: teams_share_simulation
- Kerndoel/subdoel: 23A
- Punten: 3
- Vaardigheidsdomein: 21A Digitale systemen / 23B Digitaal burgerschap
- Instructie: Deel het filmfragment zodat de docent het kan zien en horen. Mark Canbers wil niet dat de docent zijn andere vensters kan zien.

Scenario: Deel alleen het venster met het filmfragment. Gebruik computergeluid, maar deel niet je hele scherm.
Knoppen: Camera, Microfoon, Chat, Deelnemers, Delen, Meer
Deelopties: Hele scherm, Venster
Vensters: Videospeler - filmfragment, Browser - rooster, Word - verslag, Excel - cijfers, Chat - klasgroep
Correct venster: Videospeler - filmfragment

Scoringsregels:
- window-not-screen: deelt een venster in plaats van het hele scherm. (1 pt) | condities=notWholeScreen
- correct-window: kiest het juiste venster met het filmfragment. (1 pt) | condities=mediaPlayerSelected
- sound: computergeluid staat aan. (1 pt) | condities=computerSoundOn

#### PT 6: PT7 - Blokprogrammeren (lj1v-pt7-programming-debug-v1)

- Sectie: PT7 - Blokprogrammeren (pt7)
- Item-id: lj1v-pt7-programming-debug-v1
- Type: block_programming_task
- Kerndoel/subdoel: 22B
- Punten: 4
- Vaardigheidsdomein: 22B Programmeren
- Instructie: Blokprogrammeren

Programmeertaak:
- Intro: Kijk naar DOEL. Er zijn 2 fouten. Tik ze aan. Maak de code goed. Klik Afspelen.
- Device: bizzy
- Beschikbare blokken:
  - bij start (gebeurtenissen; container)
  - als Bizzy wordt aangeraakt (gebeurtenissen)
  - als spatie wordt ingedrukt (gebeurtenissen)
  - 1 stap vooruit (beweging)
  - 2 stappen vooruit (beweging)
  - 3 stappen vooruit (beweging)
  - 1 stap achteruit (beweging)
  - 2 stappen achteruit (beweging)
  - draai naar rechts (beweging)
  - draai naar links (beweging)
  - wacht 1 seconde (besturing)
  - herhaal 2 keer (besturing; container)
  - herhaal 3 keer (besturing; container)
  - zeg "Hoi" (uiterlijk)
  - zeg "Klaar" (uiterlijk)
  - zeg "Stop" (uiterlijk)
- Correct programma:
  - bij start
  - 1 stap vooruit
  - 1 stap vooruit
  - draai naar rechts
  - 1 stap vooruit
  - wacht 1 seconde
  - draai naar links
  - zeg "Klaar"

Scoringsregels:

#### PT 7: Whutsupp: video in de groepschat (pt8-whutsupp-sam-video)

- Sectie: PT8 - Online gedrag (pt8)
- Item-id: pt8-whutsupp-sam-video
- Type: social_action_simulation
- Kerndoel/subdoel: 23B / 23B
- Punten: 4
- Vaardigheidsdomein: 23B Digitaal burgerschap
- Instructie: Je zit in de Whutsupp-groep van je klas. Er komt een video van Sam in de chat. Kies wat jij doet.

Schermen en antwoordmogelijkheden:
- Whutsupp: foto van klasgenoten (screen1)
  - Instructie: Wat is nu de beste eerste reactie van jou?
  - Context: In Whutsupp wil iemand een foto van drie klasgenoten in de klassenapp zetten. Een klasgenoot schrijft: "Wacht, ik wil eerst weten welke foto dit is." Een paar leerlingen reageren dat het snel gedeeld moet worden.
  - Groep screen1 (single): Kies de beste reactie
    - Opties: Niet plaatsen of doorsturen zolang niet iedereen akkoord is.; Eerst kijken hoeveel anderen de foto willen zien voordat je beslist.; De foto naar een goede vriend sturen om te vragen of hij leuk is.; De foto alvast plaatsen en zeggen dat het als grap bedoeld is.; Ik weet het niet.
- Toestemming vragen (screen2)
  - Instructie: Wat kun je het beste tegen de plaatser zeggen?
  - Groep screen2 (single): Kies de beste reactie
    - Opties: Vraag eerst aan iedereen die herkenbaar op de foto staat of delen goed is.; Stuur hem alleen naar een kleinere groep.; Plaats hem alvast en verwijder hem pas als iemand klaagt.; Snijd de foto bij en deel hem dan alsnog.; Ik weet het niet.
- Als iemand nee zegt (screen3)
  - Instructie: Wat is een goede reactie als iemand geen toestemming geeft?
  - Groep screen3 (single): Kies de beste reactie
    - Opties: De foto niet delen en verwijderen als hij al klaarstaat.; Zeggen dat diegene zich niet moet aanstellen.; Een andere versie van de foto maken zodat hij minder herkenbaar is.; De foto alleen naar mensen sturen die de klasgenoot niet kennen.; Ik weet het niet.
- Veilige vervolgstap (screen4)
  - Instructie: Wanneer is hulp van een mentor of andere volwassene verstandig?
  - Groep screen4 (single): Kies de beste reactie
    - Opties: Als er druk blijft om de foto toch te delen of iemand er last van heeft.; Alleen als de foto meer dan honderd keer bekeken is.; Alleen als jij zelf op de foto staat.; Nooit, want wat in een groepschat gebeurt moet in de groepschat blijven.; Ik weet het niet.

Scoringsregels:
- screen1: deelt niet zonder toestemming. (1 pt) | groep=screen1 | type=singleCorrect | correct=s1-no-share-no-react
- screen2: vraagt toestemming aan herkenbare personen. (1 pt) | groep=screen2 | type=singleCorrect | correct=s2-remove-and-stop
- screen3: respecteert geen toestemming. (1 pt) | groep=screen3 | type=singleCorrect | correct=s3-support-sam
- screen4: herkent wanneer hulp of melding nodig is. (1 pt) | groep=screen4 | type=singleCorrect | correct=s4-if-continues-or-harms

Scorecaps:
- harmful-share-cap: max 2 bij s1-send-one-friend, s2-send-to-others
- escalation-as-joke-cap: max 2 bij s1-joke-back, s2-make-sticker, s3-more-videos
- victim-blaming-cap: max 3 bij s3-dont-exaggerate, s3-leave-chat
- rejects-help-cap: max 3 bij s4-never-private-chat

Whutsupp-variant: Leerjaar 1 vmbo (lj1-vmbo)
Taalniveau: very_low
Groep: Klas 1B zonder docent

Beslismomenten en antwoordmogelijkheden:
- n1 / risk_boundary: Wat doe jij eerst?
  - Bericht Noah: Haha kijk Sam 😂
  - Bericht Noah: [videoCard: samStumbleVideo]
  - Bericht Mila: Ik stuur hem ook naar de andere klas.
  - Bericht Sam: Stop pls.
  - n1_safe_boundary: Ik stuur: ‘Niet doorsturen. Sam wil dit niet.’ (correct; weet ik niet; score=1)
  - n1_ridicule: Ik zet 😂 maar stuur niet door. (niet correct; weet ik niet; score=0; flags=ridicule_reaction)
  - n1_forward_friend: Ik stuur de video alleen naar mijn beste vriend. (niet correct; weet ik niet; score=0; flags=harmful_share)
  - n1_wait: Ik wacht wat de rest doet. (niet correct; weet ik niet; score=0; flags=passive)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_remove: Ik stuur: ‘Stop. Haal weg.’ (veilig herstel; flags=recovery_safe)
    - recovery_wait: Ik wacht weer af. (niet veilig; flags=passive)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)
- n2 / no_spread: Wat stuur je nu?
  - Bericht Noah: Rustig, het is maar een grap.
  - Bericht Mila: Doorsturen?
  - Bericht Sam: Nee. Haal weg.
  - n2_safe_no_spread: Ik stuur: ‘Haal weg en stuur niet door.’ (correct; weet ik niet; score=1)
  - n2_sticker: Ik stuur: ‘Maak er dan een sticker van.’ (niet correct; weet ik niet; score=0; flags=harmful_share, ridicule_reaction)
  - n2_only_known: Ik stuur: ‘Alleen naar mensen die Sam goed kennen.’ (niet correct; weet ik niet; score=0; flags=harmful_share)
  - n2_teacher_later: Ik wacht tot een docent er iets van zegt. (niet correct; weet ik niet; score=0; flags=passive)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_remove: Ik stuur: ‘Stop. Haal weg.’ (veilig herstel; flags=recovery_safe)
    - recovery_wait: Ik wacht weer af. (niet veilig; flags=passive)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)
- n3 / support_target: Wat stuur je naar Sam?
  - Bericht Sam: Ik vind dit echt vervelend.
  - n3_safe_support: Ik stuur Sam: ‘Ik stuur niks door. Wil je dat ik met je meega naar de mentor?’ (correct; weet ik niet; score=1)
  - n3_minimize: Ik stuur: ‘Trek je er niks van aan.’ (niet correct; weet ik niet; score=0; flags=victim_blaming_or_minimizing)
  - n3_leave_chat: Ik stuur: ‘Ga gewoon uit de groep.’ (niet correct; weet ik niet; score=0; flags=victim_blaming_or_minimizing)
  - n3_ask_more: Ik vraag of Sam nog meer filmpjes heeft. (niet correct; weet ik niet; score=0; flags=ridicule_reaction)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_remove: Ik stuur: ‘Stop. Haal weg.’ (veilig herstel; flags=recovery_safe)
    - recovery_wait: Ik wacht weer af. (niet veilig; flags=passive)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)
- n4 / help_report: Wat doe je nu?
  - Bericht Elin: Hij staat nu ook in een andere groep.
  - Bericht Sam: Ze blijven hem sturen. Ik wil dit echt niet.
  - n4_safe_help_report: Ik deel de video niet en vraag hulp bij een mentor, ouder of andere volwassene. (correct; weet ik niet; score=1)
  - n4_unsafe_evidence: Ik stuur de video naar de mentor in de groepschat, zodat iedereen bewijs ziet. (niet correct; weet ik niet; score=0; flags=unsafe_evidence_share)
  - n4_retaliate: Ik maak een grap terug over Noah. (niet correct; weet ik niet; score=0; flags=retaliation)
  - n4_wait: Ik wacht tot het vanzelf stopt. (niet correct; weet ik niet; score=0; flags=passive)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_remove: Ik stuur: ‘Stop. Haal weg.’ (veilig herstel; flags=recovery_safe)
    - recovery_wait: Ik wacht weer af. (niet veilig; flags=passive)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)

### Selected-response vragen

### Vraag 1: Sterk wachtwoord kiezen (lj1v-sr1-pw-passphrase)

- Kerndoel/subdoel:  / 23A
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Welk wachtwoord is het veiligst?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | MijnKleineKatSlaaptOnderDeBank | ja |  |
| B | Nora2012SchoolLent | nee |  |
| C | !@#$%^&* | nee |  |
| D | Qwerty12345! | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: A is lang en niet gebaseerd op duidelijke persoonlijke gegevens of toetsenbordpatronen. De afleiders representeren herkenbare misconcepties: naam/jaar/schoolcontext, symbolen zonder echte sterkte en bekend toetsenbordpatroon.

### Vraag 2: AI gebruiken voor je werkstuk (lj1v-vraag9-ai-workstuk-v4)

- Kerndoel/subdoel: 21 / 21D
- Vraagtype: single choice
- Correct antwoord: 
- Weet-ik-niet-optie: geen
- Schadelijke afleider(s): geen
- Vraag: Sanne gebruikt KletsGPT voor haar werkstuk. Bekijk de chat.

#### Deelvraag 1: Deelvraag A

- Vraag: Welke invoer kan Sanne het best aan KletsGPT geven?
- Correct antwoord: best_less_identifying_prompt

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| best_less_identifying_prompt | Maak mijn tekst duidelijker voor een werkstuk: Veel brugklassers slapen slecht door hun telefoon. | ja |  |
| class_context_unneeded | Ik zit in klas 1B en maak een werkstuk. Maak deze tekst duidelijker: Veel brugklassers slapen slecht door hun telefoon. | nee | foutcategorie: unnecessary_identifying_context |
| ai_writes_new_text | Schrijf een betere tekst over brugklassers en slapen. | nee | foutcategorie: ai_generates_content_instead_of_improving_given_text |
| classmate_example | Maak mijn tekst beter en gebruik een voorbeeld van iemand uit mijn klas die vaak moe is door haar telefoon. | nee | foutcategorie: adds_unnecessary_personal_context_about_other |
| unknown | Ik weet het niet. | nee | weet ik niet |

#### Deelvraag 2: Deelvraag B

- Vraag: Wat doet Sanne het best met het antwoord van KletsGPT?
- Correct antwoord: check_source_and_number

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| check_source_and_number | Ze zoekt of het rapport bestaat en of het percentage daar echt in staat. | ja |  |
| ask_kletsgpt_for_link | Ze vraagt KletsGPT om een link naar het rapport en gebruikt het als er een link verschijnt. | nee | foutcategorie: same_ai_as_verification |
| remove_source_keep_percentage | Ze haalt alleen de naam van het rapport weg, maar laat het percentage staan. | nee | foutcategorie: unverified_number_used |
| check_if_logical | Ze controleert of de tekst logisch klinkt en past bij haar werkstuk. | nee | foutcategorie: style_or_logic_confused_with_accuracy |
| unknown | Ik weet het niet. | nee | weet ik niet |


- Interne onderbouwing: Leerlingvraag 9 / SR2: vervangt de dubbele rooster-/phishingvraag door een automatisch scorebare 21D/AI-vraag met twee single-choice deelvragen van 0,5 punt.
- Reviewstatus: pilot-work-version

### Vraag 3: Opslag bijna vol (lj1v-sr3-phone)

- Kerndoel/subdoel:  / 21A
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Youssef krijgt vaak de melding: “Opslag bijna vol.” Apps openen traag. Hij wil geen foto’s, berichten of accounts kwijt. Wat is de beste eerste stap?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | In de instellingen kijken wat veel ruimte gebruikt en oude downloads of ongebruikte apps verwijderen. | ja |  |
| B | Steeds alle apps afsluiten; dan komt er weer genoeg opslag vrij. | nee |  |
| C | Een gratis schoonmaak-app uit een advertentie installeren en toegang geven tot alle bestanden. | nee |  |
| D | De helderheid lager zetten en meldingen uitzetten. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Maakt het DG-construct scherper: praktisch systeemonderhoud bij opslag/traagheid, niet algemeen telefoonadvies.

### Vraag 4: School morgen dicht? (lj1v-sr4-official-source)

- Kerndoel/subdoel:  / 21B
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: In Whutsupp staat: “Morgen geen school door storm. Stuur door!” Je ziet geen bericht van school zelf. Wat doe je voordat je het bericht doorstuurt?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Checken of hetzelfde bericht in de schoolapp, schoolmail of op de schoolsite staat. | ja |  |
| B | Aan de klasgenoot vragen waar hij het vandaan heeft; als hij “van iemand van school” zegt, stuur je het door. | nee |  |
| C | Kijken of het screenshot een logo en datum heeft; als dat klopt, is het betrouwbaar genoeg. | nee |  |
| D | Wachten tot veel leerlingen het bericht delen; dan zal het waarschijnlijk waar zijn. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet broncontrole in een herkenbare schoolcontext.

### Vraag 5: Aanbevelingen (lj1v-sr5-algorithm)

- Kerndoel/subdoel:  / 21B
- Vraagtype: single choice
- Correct antwoord: opt_watch_like
- Weet-ik-niet-optie: unknown
- Schadelijke afleider(s): geen
- Vraag: Luna kijkt drie voetbalvideo’s helemaal af. Eén video vindt ze leuk. Daarna ziet ze meer voetbalvideo’s. Wat is de beste uitleg?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| opt_watch_like | De app gebruikt wat Luna kijkt en leuk vindt om nieuwe video’s te kiezen. | ja |  |
| opt_same_school | De app laat alle leerlingen na schooltijd dezelfde voetbalvideo’s zien. | nee |  |
| opt_creator_controls | De maker van één video bepaalt precies wat Luna daarna ziet. | nee |  |
| opt_battery | De batterij van Luna’s telefoon bepaalt welke video’s ze ziet. | nee |  |
| unknown | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet basisbegrip van aanbevelingssystemen in eenvoudige taal. Correct: apps kunnen signalen zoals kijken en leuk vinden gebruiken voor nieuwe aanbevelingen.
- Reviewstatus: V3.6-review: vervangen volgens aangeleverde v3.6 SR21B-bijlage.

### Vraag 6: Kleine poll (lj1v-sr6-data-poll)

- Kerndoel/subdoel:  / 21C
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: In een poll stemmen 8 van de 25 leerlingen uit jouw klas op voetbal. Iemand zegt: “Voetbal is dus de populairste sport van de hele school.” Wat is de beste reactie?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Dat kun je niet zomaar zeggen, want de poll komt maar uit één klas. | ja |  |
| B | Ja, want 8 stemmen is altijd genoeg. | nee |  |
| C | Dat klopt alleen als de poll digitaal is ingevuld. | nee |  |
| D | Dat kun je nooit met een poll onderzoeken. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet beperkte generaliseerbaarheid van data en voorkomt dat de leerling een klasresultaat automatisch naar de hele school uitbreidt.

### Vraag 7: Online game en persoonsgegevens (lj1v-sr7-ai-check)

- Kerndoel/subdoel: 23 / 23B
- Vraagtype: single choice
- Correct antwoord: C
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Je speelt een online game. Iemand die je alleen uit de game kent, vraagt: “Hoe heet je echt, hoe oud ben je en in welke buurt woon je?” Wat is de beste reactie?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Je geeft alleen je voornaam en leeftijd, maar niet je adres. | nee |  |
| B | Je vraagt waarom die persoon dat wil weten en beslist daarna. | nee |  |
| C | Je deelt de gegevens niet en vraagt hulp aan een ouder, verzorger of mentor als de persoon blijft aandringen. | ja |  |
| D | Je geeft de gegevens als jullie al een tijdje samen spelen. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet veilig omgaan met persoonlijke gegevens in contact met iemand die de leerling alleen online kent.

### Vraag 8: Afbeelding gebruiken (lj1v-sr8-image-rights)

- Kerndoel/subdoel: 22 / 22A
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Je vindt een afbeelding voor een schoolposter die ook online komt. Wat controleer je eerst?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Of je de afbeelding mag gebruiken, of je hem mag aanpassen en welke maker of bron je moet noemen. | ja |  |
| B | Of de afbeelding op veel websites voorkomt; dan zal hij wel vrij te gebruiken zijn. | nee |  |
| C | Of je de afbeelding kleiner kunt maken; dan valt gebruik minder op. | nee |  |
| D | Of je de afbeelding een beetje verandert; dan hoef je geen bron te noemen. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Maakt online publicatie expliciet en gebruikt eenvoudige maar realistische misvattingen.

### Vraag 9: Foto delen (lj1v-sr9-photo-consent)

- Kerndoel/subdoel: 23 / 23B
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: In Whutsupp wil je een foto van drie klasgenoten in de klassenapp zetten. Wat doe je eerst?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Vragen of iedereen op de foto dat goed vindt. | ja |  |
| B | De foto alleen in de klassenapp zetten; dan is toestemming niet nodig. | nee |  |
| C | De namen weglaten; dan mag je de foto altijd delen. | nee |  |
| D | De foto plaatsen en verwijderen als iemand klaagt. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Basisitem voor toestemming bij herkenbare personen, met korte taal.

### Vraag 10: Eén schoolapp (lj1v-sr10-platform-risk)

- Kerndoel/subdoel: 23 / 23C
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: De school gebruikt één app voor rooster, huiswerk en berichten. Wat is het grootste risico als die app een storing heeft?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Veel leerlingen kunnen tegelijk hun rooster, huiswerk en berichten niet zien. | ja |  |
| B | De app ziet er tijdelijk minder mooi uit. | nee |  |
| C | Leerlingen moeten misschien wennen aan een nieuw icoon. | nee |  |
| D | Leerlingen krijgen dan automatisch minder huiswerk. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet basisbegrip van afhankelijkheid van één digitaal systeem.

## Leerjaar 1 HAVO/VWO (lj1-hv)

### Zelfinschatting

#### Zelfinschatting (self-assessment)

- Sectie: Zelfinschatting (zelfinschatting)
- Item-id: self-assessment
- Type: self_assessment
- Kerndoel/subdoel: niet-scorend
- Punten: 0
- Vaardigheidsdomein: Zelfinschatting
- Vraag/instructie: Hoe digitaal geletterd schat je jezelf in? Schuif het bolletje naar jouw keuze. 0 betekent: ik schat mezelf helemaal niet digitaal geletterd in. 100 betekent: ik schat mezelf heel digitaal geletterd in.

Antwoordmogelijkheden:
- 0: helemaal niet digitaal geletterd
- 100: heel digitaal geletterd

### Performance tasks

#### PT 1: PT1 - Bestanden en mappen beheren (lj1h-pt1-files)

- Sectie: PT1 - Bestanden en mappen (pt1)
- Item-id: lj1h-pt1-files
- Type: file_task_simulation
- Kerndoel/subdoel: 21A
- Punten: 4
- Vaardigheidsdomein: 21A Digitale systemen
- Instructie: Gebruik de Verkenner hieronder. Voer de taak uit en klik daarna op Volgende. Werk in OneDrive. Maak de hoofdmap Project Water. Maak daarin Bronnen, Afbeeldingen en Verslag. Verplaats de vier bestanden naar de juiste map. Hernoem concept_verslag.docx naar project_water_verslag.docx en presentatie_water.pptx naar project_water_presentatie.pptx.

Opdrachten:
- main (1 pt): hoofdmap Project Water correct.
  - Verwacht pad: Thuis/OneDrive/Project Water
- subfolders (1 pt): submappen correct.
  - Verwachte paden: Thuis/OneDrive/Project Water/Bronnen; Thuis/OneDrive/Project Water/Afbeeldingen; Thuis/OneDrive/Project Water/Verslag
- placed (1 pt): bestanden per type correct geplaatst.
  - Verwachte paden: Thuis/OneDrive/Project Water/Bronnen/bron_water.pdf; Thuis/OneDrive/Project Water/Afbeeldingen/waterfoto.png
- rename (1 pt): twee bestanden correct hernoemd en geplaatst.
  - Verwachte paden: Thuis/OneDrive/Project Water/Verslag/project_water_verslag.docx; Thuis/OneDrive/Project Water/Verslag/project_water_presentatie.pptx
  - Verboden paden: Thuis/OneDrive/concept_verslag.docx; Thuis/OneDrive/presentatie_water.pptx

#### PT 2: E-mail opstellen (lj1h-pt2-mail)

- Sectie: PT2 - Mail opstellen (pt2)
- Item-id: lj1h-pt2-mail
- Type: outlook_mail_simulation
- Kerndoel/subdoel: 21A
- Punten: 4
- Vaardigheidsdomein: 21A Digitale systemen / 23B Digitaal burgerschap
- Instructie: Stuur een verslag van Nederlands via e-mail naar je mentor. 1. Kies de juiste ontvanger in het juiste veld. 2. Gebruik het juiste onderwerp: Project Water verslag. 3. Voeg de juiste bijlage toe. 4. Verzend de e-mail.

Beschikbare opties:
- Knoppen: Verzenden, BCC tonen, Bestand bijvoegen, Hyperlink invoegen, Prioriteit, Concept opslaan, Verwijderen
- Contacten: docent@school.nl, groepsgenoot1@school.nl, groepsgenoot2@school.nl, klasgroep@school.nl, mentor@school.nl, projectgenoot@school.nl, stagebegeleider@bedrijf.nl
- Bestanden: Bron_water.pdf, Foto_projectdag.jpg, Project_Water_verslag.docx, Rooster.pdf

Scoringsregels:
- to: juiste ontvanger. (1 pt) | condities=to includes mentor@school.nl
- to includes mentor@school.nl
- sent: mail is verzonden. (1 pt) | condities=sent true
- sent true
- subject: juist onderwerp. (1 pt) | condities=subject equals Project Water verslag
- subject equals Project Water verslag
- attachment-sent: juiste bijlage en verzonden. (1 pt) | condities=attachments includes Project_Water_verslag.docx
- attachments includes Project_Water_verslag.docx

#### PT 3: PT3 - Bericht beoordelen (lj1h-pt3-security)

- Sectie: PT3 - Account, apparaat en verbinding beveiligen (pt3)
- Item-id: lj1h-pt3-security
- Type: account_security_simulation
- Kerndoel/subdoel: 23A
- Punten: 3
- Vaardigheidsdomein: 23A Veiligheid en privacy
- Instructie: Bekijk de e-mail en kies je antwoorden.

Schermen en antwoordmogelijkheden:
- Mail over accountcontrole (code-mail)
  - Instructie: Noor krijgt deze mail op haar schoolaccount. Ze vertrouwt de mail niet helemaal.
  - E-mail: Controleer je schoolaccount
    - Van: ICT controle <ict-472kq9-check@safe-login-mailer.info>
    - Tekst: Beste leerling,
    - Tekst: Wij controleren alle accounts. Stuur je tijdelijke inlogcode terug zodat je account actief blijft.
    - Tekst: Reageer binnen 30 minuten.
  - Groep signals (multi): Wat maakt deze mail onbetrouwbaar?
    - Opties: Het afzenderadres is geen duidelijk schooladres.; De mail vraagt om een persoonlijke inlogcode.; De mail gebruikt tijdsdruk.; Er staat 'Beste leerling' in plaats van een naam.; De mail gaat over school.
  - Groep actions (multi): Wat doet Noor?
    - Opties: Geen code delen.; Account of melding controleren via de normale schoolroute.; De mail melden of aan ICT/docent laten zien.; De code terugsturen zodat het account actief blijft.; De link openen en daar de code invullen.

Scoringsregels:
- signals: herkent minimaal twee signalen in de mail. (1 pt) | groep=signals | type=minCorrect | correct=Het afzenderadres is geen duidelijk schooladres., De mail vraagt om een persoonlijke inlogcode., De mail gebruikt tijdsdruk., Er staat 'Beste leerling' in plaats van een naam. | minCorrect=2
- safe-actions: kiest veilige vervolgstappen. (1 pt) | groep=actions | type=allSelected | correct=Geen code delen., Account of melding controleren via de normale schoolroute.
- no-code: deelt de code niet via mail of link. (1 pt) | groep=actions | type=noForbidden | verboden=De code terugsturen zodat het account actief blijft., De link openen en daar de code invullen.

#### PT 4: PT4 - Excel/data sorteren en filteren (lj1h-pt4-excel)

- Sectie: PT4 - Excel/data sorteren en filteren (pt4)
- Item-id: lj1h-pt4-excel
- Type: excel_download_task
- Kerndoel/subdoel: 21C, 21A
- Punten: 4
- Vaardigheidsdomein: 21C Data
- Instructie: Download LJ1_HV_Bibliotheek.xlsx. Open het in Excel. Klik op Bewerken inschakelen als Excel daarom vraagt.

Bestand: LJ1_HV_Bibliotheek.xlsx
Werkblad: Boeken

Vragen en correcte antwoorden:
- a (2 pt): Sorteer op Jaar, van nieuw naar oud. Welke code staat bovenaan?
  - Correct antwoord/code: B07
- b (2 pt): Filter op Vak = biologie. Sorteer daarna op Jaar, van oud naar nieuw. Welke code staat bovenaan?
  - Correct antwoord/code: B06

#### PT 5: Schermdelen in een online les (lj1hv-pt6-screen-share)

- Sectie: PT6 - Videovergadering en schermdelen (pt6)
- Item-id: lj1hv-pt6-screen-share
- Type: teams_share_simulation
- Kerndoel/subdoel: 23A
- Punten: 3
- Vaardigheidsdomein: 21A Digitale systemen / 23B Digitaal burgerschap
- Instructie: Deel het filmfragment zodat de docent het kan zien en horen. Mark Canbers wil niet dat de docent zijn andere vensters kan zien.

Scenario: Deel alleen het venster met het filmfragment. Gebruik computergeluid, maar deel niet je hele scherm.
Knoppen: Camera, Microfoon, Chat, Deelnemers, Delen, Meer
Deelopties: Hele scherm, Venster
Vensters: Videospeler - filmfragment, Browser - rooster, Word - verslag, Excel - cijfers, Chat - klasgroep
Correct venster: Videospeler - filmfragment

Scoringsregels:
- window-not-screen: deelt een venster in plaats van het hele scherm. (1 pt) | condities=notWholeScreen
- correct-window: kiest het juiste venster met het filmfragment. (1 pt) | condities=mediaPlayerSelected
- sound: computergeluid staat aan. (1 pt) | condities=computerSoundOn

#### PT 6: PT7 - Blokprogrammeren (lj1h-pt7-programming-debug-v1)

- Sectie: PT7 - Blokprogrammeren (pt7)
- Item-id: lj1h-pt7-programming-debug-v1
- Type: block_programming_task
- Kerndoel/subdoel: 22B
- Punten: 4
- Vaardigheidsdomein: 22B Programmeren
- Instructie: Blokprogrammeren

Programmeertaak:
- Intro: Bizzy moet een vierkant lopen. Er zijn 2 fouten in de code. Wijs ze aan, verbeter ze en test.
- Device: bizzy
- Beschikbare blokken:
  - bij start (gebeurtenissen; container)
  - als Bizzy wordt aangeraakt (gebeurtenissen)
  - als spatie wordt ingedrukt (gebeurtenissen)
  - herhaal 2 keer (besturing; container)
  - herhaal 3 keer (besturing; container)
  - herhaal 4 keer (besturing; container)
  - herhaal 5 keer (besturing; container)
  - wacht 1 seconde (besturing)
  - 1 stap vooruit (beweging)
  - 2 stappen vooruit (beweging)
  - 1 stap achteruit (beweging)
  - rechts draaien (beweging)
  - links draaien (beweging)
  - zeg "Klaar" (uiterlijk)
  - zeg "Vierkant" (uiterlijk)
  - zeg "Fout" (uiterlijk)
  - zeg "Hoi" (uiterlijk)
- Correct programma:
  - bij start
  - herhaal 4 keer
  - 1 stap vooruit
  - rechts draaien
  - zeg "Vierkant"

Scoringsregels:

#### PT 7: Whutsupp: video in de groepschat (pt8-whutsupp-sam-video)

- Sectie: PT8 - Online gedrag (pt8)
- Item-id: pt8-whutsupp-sam-video
- Type: social_action_simulation
- Kerndoel/subdoel: 23B / 23B
- Punten: 4
- Vaardigheidsdomein: 23B Digitaal burgerschap
- Instructie: Je zit in een Whutsupp-groep van je klas. Een klasgenoot deelt een video van Sam op het schoolplein. Kies wat jij doet.

Schermen en antwoordmogelijkheden:
- Deelverzoek in privéchat (judgement)
  - Instructie: Je krijgt van een klasgenoot een privébericht: "Stuur deze screenshot van onze chat even door naar de groep, dan ziet iedereen wat Noor zei." In de screenshot staat iets persoonlijks over Noor. Noor weet niet dat dit wordt doorgestuurd.
  - Groep judgement (single): Wat is de beste beoordeling?
    - Opties: Niet doorsturen, want er staat persoonlijke informatie in en Noor gaf geen toestemming.; Doorsturen mag, want jij hebt de screenshot gekregen.; Doorsturen mag als je Noors naam weglaat.; Doorsturen mag als het alleen naar de klasgroep gaat.
- Vervolgactie (followup)
  - Instructie: Welke vervolgstappen zijn verstandig? Kies alle goede acties.
  - Groep followup (multi): Vervolgstappen
    - Opties: Uitleggen dat je dit niet doorstuurt.; Noor waarschuwen of vragen of zij hulp wil.; Een mentor/ouder/verantwoordelijke volwassene inschakelen als er druk of ruzie ontstaat.; De screenshot bewerken en dan alsnog delen.; De screenshot naar een kleinere groep sturen.

Scoringsregels:
- risk: herkent het probleem of risico. (1 pt) | groep=judgement | type=singleCorrect | correct=Niet doorsturen, want er staat persoonlijke informatie in en Noor gaf geen toestemming.
- no-spread: voorkomt verdere verspreiding of escalatie. (1 pt) | groep=followup | type=allSelected | correct=Uitleggen dat je dit niet doorstuurt.
- help: schakelt passende hulp of melding in. (1 pt) | groep=followup | type=minCorrect | correct=Noor waarschuwen of vragen of zij hulp wil., Een mentor/ouder/verantwoordelijke volwassene inschakelen als er druk of ruzie ontstaat. | minCorrect=1
- followup: veilige vervolgstap zonder schadelijke deelactie. (1 pt) | groep=followup | type=allSelected | correct=Uitleggen dat je dit niet doorstuurt. | verboden=De screenshot bewerken en dan alsnog delen., De screenshot naar een kleinere groep sturen.

Scorecaps:
- harmful-cap: max 2 bij De screenshot bewerken en dan alsnog delen., De screenshot naar een kleinere groep sturen.

Whutsupp-variant: Leerjaar 1 havo/vwo (lj1-hv)
Taalniveau: low
Groep: Klas 1H2 zonder docent

Beslismomenten en antwoordmogelijkheden:
- n1 / risk_boundary: Wat doe jij eerst?
  - Bericht Noah: Haha kijk Sam 😂
  - Bericht Noah: [videoCard: samStumbleVideo]
  - Bericht Mila: Ik stuur hem ook naar de andere klas.
  - Bericht Sam: Stop pls.
  - n1_safe_boundary: Ik stuur: ‘Niet doorsturen. Sam wil dit niet.’ (correct; weet ik niet; score=1)
  - n1_ridicule: Ik zet 😂 maar stuur niet door. (niet correct; weet ik niet; score=0; flags=ridicule_reaction)
  - n1_forward_friend: Ik stuur de video alleen naar mijn beste vriend. (niet correct; weet ik niet; score=0; flags=harmful_share)
  - n1_wait: Ik wacht wat de rest doet. (niet correct; weet ik niet; score=0; flags=passive)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_support: Ik stuur: ‘Haal weg. Sam wil dit niet.’ (veilig herstel; flags=recovery_safe)
    - recovery_private_only: Ik stuur alleen privé naar Sam: ‘Ik kan er niks aan doen.’ (niet veilig; flags=passive)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)
- n2 / no_spread: Wat stuur je nu?
  - Bericht Noah: Rustig, het is maar een grap.
  - Bericht Mila: Doorsturen?
  - Bericht Sam: Nee. Haal weg.
  - n2_safe_no_spread: Ik stuur: ‘Haal weg en stuur niet door.’ (correct; weet ik niet; score=1)
  - n2_sticker: Ik stuur: ‘Maak er dan een sticker van.’ (niet correct; weet ik niet; score=0; flags=harmful_share, ridicule_reaction)
  - n2_only_known: Ik stuur: ‘Alleen naar mensen die Sam goed kennen.’ (niet correct; weet ik niet; score=0; flags=harmful_share)
  - n2_teacher_later: Ik wacht tot een docent er iets van zegt. (niet correct; weet ik niet; score=0; flags=passive)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_support: Ik stuur: ‘Haal weg. Sam wil dit niet.’ (veilig herstel; flags=recovery_safe)
    - recovery_private_only: Ik stuur alleen privé naar Sam: ‘Ik kan er niks aan doen.’ (niet veilig; flags=passive)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)
- n3 / support_target: Wat stuur je naar Sam?
  - Bericht Sam: Ik vind dit echt vervelend.
  - n3_safe_support: Ik stuur Sam: ‘Ik stuur niks door. Wil je dat ik met je meega naar de mentor?’ (correct; weet ik niet; score=1)
  - n3_minimize: Ik stuur: ‘Trek je er niks van aan.’ (niet correct; weet ik niet; score=0; flags=victim_blaming_or_minimizing)
  - n3_leave_chat: Ik stuur: ‘Ga gewoon uit de groep.’ (niet correct; weet ik niet; score=0; flags=victim_blaming_or_minimizing)
  - n3_ask_more: Ik vraag of Sam nog meer filmpjes heeft. (niet correct; weet ik niet; score=0; flags=ridicule_reaction)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_support: Ik stuur: ‘Haal weg. Sam wil dit niet.’ (veilig herstel; flags=recovery_safe)
    - recovery_private_only: Ik stuur alleen privé naar Sam: ‘Ik kan er niks aan doen.’ (niet veilig; flags=passive)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)
- n4 / help_report: Wat doe je nu?
  - Bericht Elin: Hij staat nu ook in een andere groep.
  - Bericht Sam: Ze blijven hem sturen. Ik wil dit echt niet.
  - n4_safe_help_report: Ik deel de video niet en vraag hulp bij een mentor, ouder of andere volwassene. (correct; weet ik niet; score=1)
  - n4_unsafe_evidence: Ik stuur de video naar de mentor in de groepschat, zodat iedereen bewijs ziet. (niet correct; weet ik niet; score=0; flags=unsafe_evidence_share)
  - n4_retaliate: Ik maak een grap terug over Noah. (niet correct; weet ik niet; score=0; flags=retaliation)
  - n4_wait: Ik wacht tot het vanzelf stopt. (niet correct; weet ik niet; score=0; flags=passive)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_support: Ik stuur: ‘Haal weg. Sam wil dit niet.’ (veilig herstel; flags=recovery_safe)
    - recovery_private_only: Ik stuur alleen privé naar Sam: ‘Ik kan er niks aan doen.’ (niet veilig; flags=passive)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)

### Selected-response vragen

### Vraag 1: Sterk wachtwoord kiezen (lj1h-sr1-pw-passphrase)

- Kerndoel/subdoel:  / 23A
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Welk wachtwoord is het veiligst?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | DeBlauweTreinStaatNaastDeSporthal | ja |  |
| B | Daan2012SchoolLent | nee |  |
| C | !@#$%^&* | nee |  |
| D | !Qw@#Er$% | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Lange wachtwoordzin zonder voorspelbare persoonlijke gegevens is sterker dan kortere patronen of symbolenreeksen.

### Vraag 2: AI gebruiken voor een presentatie (lj1h-vraag9-ai-presentatie-v4)

- Kerndoel/subdoel: 21 / 21D
- Vraagtype: single choice
- Correct antwoord: 
- Weet-ik-niet-optie: geen
- Schadelijke afleider(s): geen
- Vraag: Milan gebruikt KletsGPT voor een presentatie. Bekijk de chat.

#### Deelvraag 1: Deelvraag A

- Vraag: Welke invoer kan Milan het best aan KletsGPT geven?
- Correct antwoord: best_presentation_prompt

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| best_presentation_prompt | Verbeter deze tekst voor een presentatie: Energiedrank is populair onder jongeren. | ja |  |
| class_project_context | Ik zit in 1H2 en onze klas doet een project over energiedrank. Verbeter deze tekst: Energiedrank is populair onder jongeren. | nee | foutcategorie: unnecessary_identifying_context |
| one_sided_prompt | Maak een sterke tekst over waarom energiedrank slecht is voor jongeren. | nee | foutcategorie: prompt_steers_to_one_sided_claim |
| classmate_examples | Verbeter mijn tekst en voeg een voorbeeld toe van leerlingen uit mijn klas die energiedrank drinken. | nee | foutcategorie: adds_unnecessary_personal_context_about_others |
| unknown | Ik weet het niet. | nee | weet ik niet |

#### Deelvraag 2: Deelvraag B

- Vraag: Wat doet Milan het best met het antwoord van KletsGPT?
- Correct antwoord: find_source_and_check_claim

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| find_source_and_check_claim | Hij zoekt de bron en controleert of die dit percentage echt ondersteunt. | ja |  |
| source_name_only | Hij gebruikt het percentage als hij dezelfde bronnaam ook op internet vindt. | nee | foutcategorie: source_name_confused_with_claim_support |
| more_sources_official_name | Hij vraagt KletsGPT om nog twee bronnen en kiest de bron die het meest officieel klinkt. | nee | foutcategorie: source_appearance_confused_with_quality |
| precise_number_trust | Hij gebruikt het percentage omdat een precies getal meestal uit onderzoek komt. | nee | foutcategorie: specific_number_confused_with_accuracy |
| unknown | Ik weet het niet. | nee | weet ik niet |


- Interne onderbouwing: Leerlingvraag 9 / SR2: vervangt de dubbele rooster-/phishingvraag door een automatisch scorebare 21D/AI-vraag met twee single-choice deelvragen van 0,5 punt.
- Reviewstatus: pilot-work-version

### Vraag 3: Trage telefoon (lj1h-sr3-phone-actions)

- Kerndoel/subdoel:  / 21A
- Vraagtype: multiple select
- Correct antwoord: A, B
- Weet-ik-niet-optie: F
- Schadelijke afleider(s): geen
- Vraag: Youssefs telefoon is traag en loopt soms vast. Welke twee acties kunnen meestal helpen?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Ongebruikte apps en grote bestanden opruimen. | ja |  |
| B | Beschikbare updates via de instellingen installeren. | ja |  |
| C | De helderheid van het scherm lager zetten. | nee |  |
| D | Het toetsenbordgeluid uitzetten. | nee |  |
| E | Het wachtwoord van de telefoon veranderen. | nee |  |
| F | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Heldere functionele systeemhandelingen; C is plausibel bij batterijproblemen maar niet bij traagheid.

### Vraag 4: Gerichte zoekopdracht (lj1h-sr4-search-query)

- Kerndoel/subdoel:  / 21B
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Je zoekt betrouwbare informatie over hoeveel jongeren in Nederland e-bikes gebruiken. Welke zoekopdracht helpt het best?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | onderzoek jongeren e-bike gebruik Nederland | ja |  |
| B | e-bike jongeren kopen Nederland | nee |  |
| C | jongeren fietsen school Nederland | nee |  |
| D | elektrische fiets ervaring jongeren | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: A bevat onderzoek, doelgroep, onderwerp en land.

### Vraag 5: Feed is geen steekproef (lj1h-sr5-feed-sample)

- Kerndoel/subdoel:  / 21B
- Vraagtype: single choice
- Correct antwoord: opt_not_everyone_feed
- Weet-ik-niet-optie: unknown
- Schadelijke afleider(s): geen
- Vraag: Noah kijkt een paar video’s waarin mensen zeggen dat huiswerk afgeschaft moet worden. Daarna ziet hij vooral video’s met dezelfde mening. Wat kan hij het best concluderen?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| opt_not_everyone_feed | Niet meteen dat bijna iedereen dit vindt; zijn feed kan door eerder kijkgedrag zijn beïnvloed. | ja |  |
| opt_most_students | Dat de meeste leerlingen in Nederland tegen huiswerk zijn. | nee |  |
| opt_no_other_opinions | Dat video’s met een andere mening waarschijnlijk niet bestaan. | nee |  |
| opt_neutral_platform | Dat het platform altijd neutraal laat zien wat mensen denken. | nee |  |
| unknown | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet dat een persoonlijke feed geen representatieve steekproef is en door eerder gedrag beïnvloed kan zijn.
- Reviewstatus: V3.6-review: vervangen volgens aangeleverde v3.6 SR21B-bijlage.

### Vraag 6: Steekproef (lj1h-sr6-sample)

- Kerndoel/subdoel:  / 21C
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Een dataset bevat alleen antwoorden van leerlingen uit één klas. Waar moet je voor oppassen?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Je kunt niet zomaar zeggen dat dit voor alle leerlingen geldt. | ja |  |
| B | Eén klas is altijd genoeg om iets over heel Nederland te zeggen. | nee |  |
| C | De dataset is automatisch fout. | nee |  |
| D | Meer data maakt nooit verschil. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet dataconclusie en generaliseerbaarheid.

### Vraag 7: Online game en persoonsgegevens (lj1h-sr7-ai-startpunt)

- Kerndoel/subdoel: 23 / 23B
- Vraagtype: single choice
- Correct antwoord: C
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Je speelt een online game. Iemand die je alleen uit de game kent, vraagt: “Hoe heet je echt, hoe oud ben je en in welke buurt woon je?” Wat is de beste reactie?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Je geeft alleen je voornaam en leeftijd, maar niet je adres. | nee |  |
| B | Je vraagt waarom die persoon dat wil weten en beslist daarna. | nee |  |
| C | Je deelt de gegevens niet en vraagt hulp aan een ouder, verzorger of mentor als de persoon blijft aandringen. | ja |  |
| D | Je geeft de gegevens als jullie al een tijdje samen spelen. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet veilig omgaan met persoonlijke gegevens in contact met iemand die de leerling alleen online kent.

### Vraag 8: Foto in online leeromgeving (lj1h-sr8-image-source)

- Kerndoel/subdoel: 22 / 22A
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Je gebruikt een foto in een presentatie. De presentatie komt in de online leeromgeving. Wat controleer je eerst?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Of je de foto mag gebruiken en welke maker of bron je moet noemen. | ja |  |
| B | Of de foto op veel websites staat. Dan zal hij wel vrij zijn. | nee |  |
| C | Of je de foto bijsnijdt. Dan hoef je de maker niet te noemen. | nee |  |
| D | Of alleen je klas de presentatie ziet. Dan gelden er geen regels. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Heldere publicatiecontext en realistische afleiders.

### Vraag 9: Foto delen bij twijfel (lj1h-sr9-photo-share)

- Kerndoel/subdoel: 23 / 23B
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Je hebt een grappige foto van twee klasgenoten. Eén van hen twijfelt of de foto gedeeld mag worden. Wat doe je?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Je deelt de foto niet totdat iedereen akkoord is. | ja |  |
| B | Je deelt de foto alleen in een besloten groep. | nee |  |
| C | Je deelt de foto zonder namen erbij. | nee |  |
| D | Je deelt de foto en zet erbij dat het een grap is. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Twijfel maakt het scenario realistischer.

### Vraag 10: Eén app voor schoolzaken (lj1h-sr10-platform-risk)

- Kerndoel/subdoel: 23 / 23C
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Een school gebruikt één app voor rooster, huiswerk en berichten. Wat is een belangrijk risico?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Als de app niet werkt, valt veel schoolinformatie tegelijk weg. | ja |  |
| B | Leerlingen hoeven minder verschillende apps te openen. | nee |  |
| C | Docenten kunnen berichten op één plek zetten. | nee |  |
| D | De app kan dezelfde kleur gebruiken voor alle klassen. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Leerlingen onderscheiden risico van voordeel.

## Leerjaar 3 VMBO (lj3-vmbo)

### Zelfinschatting

#### Zelfinschatting (self-assessment)

- Sectie: Zelfinschatting (zelfinschatting)
- Item-id: self-assessment
- Type: self_assessment
- Kerndoel/subdoel: niet-scorend
- Punten: 0
- Vaardigheidsdomein: Zelfinschatting
- Vraag/instructie: Hoe digitaal geletterd schat je jezelf in? Schuif het bolletje naar jouw keuze. 0 betekent: ik schat mezelf helemaal niet digitaal geletterd in. 100 betekent: ik schat mezelf heel digitaal geletterd in.

Antwoordmogelijkheden:
- 0: helemaal niet digitaal geletterd
- 100: heel digitaal geletterd

### Performance tasks

#### PT 1: PT1 - Bestanden en mappen beheren (lj3v-pt1-files)

- Sectie: PT1 - Bestanden en mappen (pt1)
- Item-id: lj3v-pt1-files
- Type: file_task_simulation
- Kerndoel/subdoel: 21A
- Punten: 4
- Vaardigheidsdomein: 21A Digitale systemen
- Instructie: Gebruik de Verkenner hieronder. Voer de taak uit en klik daarna op Volgende. Werk in OneDrive in de map Stageproject. Maak de mappen Actueel en Oud. Zet de nieuwste versie van het stageverslag in Actueel, zet oudere versies in Oud en hernoem stageverslag_v3.docx naar stageverslag_2026_definitief.docx.

Opdrachten:
- folders (1 pt): mappen Actueel en Oud correct.
  - Verwachte paden: Thuis/OneDrive/Stageproject/Actueel; Thuis/OneDrive/Stageproject/Oud
- newest (1 pt): nieuwste versie herkend en correct geplaatst.
  - Verwacht pad: Thuis/OneDrive/Stageproject/Actueel/stageverslag_2026_definitief.docx
- archive (1 pt): oudere versies correct gearchiveerd.
  - Verwachte paden: Thuis/OneDrive/Stageproject/Oud/stageverslag_v1.docx; Thuis/OneDrive/Stageproject/Oud/stageverslag_v2.docx
- name (1 pt): juiste definitieve bestandsnaam.
  - Verwacht pad: Thuis/OneDrive/Stageproject/Actueel/stageverslag_2026_definitief.docx
  - Verboden paden: Thuis/OneDrive/Stageproject/stageverslag_v3.docx

#### PT 2: E-mail opstellen (lj3v-pt2-mail)

- Sectie: PT2 - Mail opstellen (pt2)
- Item-id: lj3v-pt2-mail
- Type: outlook_mail_simulation
- Kerndoel/subdoel: 21A
- Punten: 4
- Vaardigheidsdomein: 21A Digitale systemen / 23B Digitaal burgerschap
- Instructie: Stuur een e-mail aan je stagebegeleider. 1. Kies de stagebegeleider als ontvanger in Aan. 2. Zet je mentor in Cc en gebruik geen Bcc. 3. Gebruik het juiste onderwerp: Stageverslag definitieve versie. 4. Voeg de juiste bijlage toe. 5. Verzend de e-mail.

Beschikbare opties:
- Knoppen: Verzenden, BCC tonen, Bestand bijvoegen, Hyperlink invoegen, Prioriteit, Concept opslaan, Verwijderen
- Contacten: docent@school.nl, groepsgenoot1@school.nl, groepsgenoot2@school.nl, klasgroep@school.nl, mentor@school.nl, projectgenoot@school.nl, stagebegeleider@bedrijf.nl
- Bestanden: Beoordeling_stage.pdf, Planning_stage.xlsx, Stageverslag_v2.docx, Stageverslag_v3_definitief.docx

Scoringsregels:
- to: juiste ontvanger. (1 pt) | condities=to includes stagebegeleider@bedrijf.nl
- to includes stagebegeleider@bedrijf.nl
- cc-bcc: juiste cc en bcc waar nodig. (1 pt) | condities=cc allInclude mentor@school.nl; bcc noneInclude mentor@school.nl, docent@school.nl, klasgroep@school.nl
- cc allInclude mentor@school.nl
- bcc noneInclude mentor@school.nl, docent@school.nl, klasgroep@school.nl
- subject: juist onderwerp. (1 pt) | condities=subject equals Stageverslag definitieve versie
- subject equals Stageverslag definitieve versie
- attachment-sent: juiste bijlage en verzonden. (1 pt) | condities=attachments includes Stageverslag_v3_definitief.docx; sent true
- attachments includes Stageverslag_v3_definitief.docx
- sent true

#### PT 3: PT3 - Bericht beoordelen (lj3v-pt3-security)

- Sectie: PT3 - Account, apparaat en verbinding beveiligen (pt3)
- Item-id: lj3v-pt3-security
- Type: account_security_simulation
- Kerndoel/subdoel: 23A
- Punten: 3
- Vaardigheidsdomein: 23A Veiligheid en privacy
- Instructie: Bekijk de e-mail en kies je antwoorden.

Schermen en antwoordmogelijkheden:
- Mail met bestand (attachment-mail)
  - Instructie: Jayden krijgt deze mail vlak voor een toetsweek.
  - E-mail: Cijferlijst controleren
    - Van: Cijfersysteem <c1jf3r-upd8-771@doc-viewer-login.com>
    - Tekst: Hallo,
    - Tekst: Er is een fout gevonden in je cijferlijst. Open de bijlage en schakel bewerken in om de nieuwe cijfers te bekijken.
    - Tekst: Controleer dit voor morgen.
  - Groep signals (multi): Welke signalen vragen om extra controle?
    - Opties: Het afzenderadres hoort niet duidelijk bij school.; De bijlage is een macrobestand.; De mail vraagt om bewerken of macro's in te schakelen.; De mail zet druk met een korte deadline.; De mail gaat over cijfers.
  - Groep actions (multi): Wat is veilig om te doen?
    - Opties: Bijlage niet openen of macro's niet inschakelen.; Cijfers controleren via het normale schoolportaal.; De mail melden of laten controleren.; Bijlage openen en bewerken inschakelen.; Inloggen via de link in de mail.

Scoringsregels:
- signals: herkent minimaal twee signalen in de mail. (1 pt) | groep=signals | type=minCorrect | correct=Het afzenderadres hoort niet duidelijk bij school., De bijlage is een macrobestand., De mail vraagt om bewerken of macro's in te schakelen., De mail zet druk met een korte deadline. | minCorrect=2
- safe-actions: kiest veilige controle- en meldactie. (1 pt) | groep=actions | type=allSelected | correct=Bijlage niet openen of macro's niet inschakelen., Cijfers controleren via het normale schoolportaal.
- no-danger: kiest geen risicovolle actie. (1 pt) | groep=actions | type=noForbidden | verboden=Bijlage openen en bewerken inschakelen., Inloggen via de link in de mail.

#### PT 4: PT4 - Excel/data sorteren en filteren (lj3v-pt4-excel)

- Sectie: PT4 - Excel/data sorteren en filteren (pt4)
- Item-id: lj3v-pt4-excel
- Type: excel_download_task
- Kerndoel/subdoel: 21C, 21A
- Punten: 4
- Vaardigheidsdomein: 21C Data
- Instructie: Download LJ3_VMBO_Bestellingen.xlsx. Open het in Excel. Klik op Bewerken inschakelen als Excel daarom vraagt.

Bestand: LJ3_VMBO_Bestellingen.xlsx
Werkblad: Bestellingen

Vragen en correcte antwoorden:
- a (2 pt): Filter op Categorie = elektronica. Sorteer daarna op Jaar, van nieuw naar oud. Welke code staat bovenaan?
  - Correct antwoord/code: W02
- b (2 pt): Filter op Bedrag > 60. Sorteer daarna op Bedrag, van hoog naar laag. Welke code staat bovenaan?
  - Correct antwoord/code: W06

#### PT 5: Schermdelen in een online les (lj3vmbo-pt6-screen-share)

- Sectie: PT6 - Videovergadering en schermdelen (pt6)
- Item-id: lj3vmbo-pt6-screen-share
- Type: teams_share_simulation
- Kerndoel/subdoel: 23A
- Punten: 3
- Vaardigheidsdomein: 21A Digitale systemen / 23B Digitaal burgerschap
- Instructie: Deel het filmfragment zodat de docent het kan zien en horen. Mark Canbers wil niet dat de docent zijn andere vensters kan zien.

Scenario: Deel alleen het venster met het filmfragment. Gebruik computergeluid, maar deel niet je hele scherm.
Knoppen: Camera, Microfoon, Chat, Deelnemers, Delen, Meer
Deelopties: Hele scherm, Venster
Vensters: Videospeler - filmfragment, Browser - rooster, Word - verslag, Excel - cijfers, Chat - klasgroep
Correct venster: Videospeler - filmfragment

Scoringsregels:
- window-not-screen: deelt een venster in plaats van het hele scherm. (1 pt) | condities=notWholeScreen
- correct-window: kiest het juiste venster met het filmfragment. (1 pt) | condities=mediaPlayerSelected
- sound: computergeluid staat aan. (1 pt) | condities=computerSoundOn

#### PT 6: PT7 - Blokprogrammeren (lj3v-pt7-programming-debug-v1)

- Sectie: PT7 - Blokprogrammeren (pt7)
- Item-id: lj3v-pt7-programming-debug-v1
- Type: block_programming_task
- Kerndoel/subdoel: 22B
- Punten: 4
- Vaardigheidsdomein: 22B Programmeren
- Instructie: Blokprogrammeren

Programmeertaak:
- Intro: Bij elke klik op A komt er 1 bij. Bij 1 t/m 4: Nog plek. Bij 5 of meer: Vol. Er zijn 2 fouten. Wijs ze aan, verbeter ze en test.
- Device: microbit
- Beschikbare blokken:
  - bij start (gebeurtenissen; container)
  - als knop A wordt ingedrukt (gebeurtenissen; container)
  - als knop B wordt ingedrukt (gebeurtenissen; container)
  - als Bizzy wordt aangeraakt (gebeurtenissen)
  - zet teller op 0 (variabelen)
  - zet teller op 5 (variabelen)
  - verander teller met 1 (variabelen)
  - verander teller met 2 (variabelen)
  - verander teller met -1 (variabelen)
  - toon teller (variabelen)
  - als teller groter dan 5 dan (voorwaarden; container)
  - als teller 5 of meer is dan (voorwaarden; container)
  - als teller kleiner dan 5 dan (voorwaarden; container)
  - als teller gelijk is aan 5 dan (voorwaarden; container)
  - anders (voorwaarden; container)
  - zeg "Vol" (uiterlijk)
  - zeg "Nog plek" (uiterlijk)
  - zeg "Klaar" (uiterlijk)
  - zeg "Leeg" (uiterlijk)
  - zeg "Fout" (uiterlijk)
  - wacht 1 seconde (besturing)
  - herhaal 5 keer (besturing; container)
  - stop programma (besturing)
- Correct programma:
  - bij start
  - zet teller op 0
  - als knop A wordt ingedrukt
  - verander teller met 1
  - als teller 5 of meer is dan
  - zeg "Vol"
  - anders
  - zeg "Nog plek"

Scoringsregels:

#### PT 7: Whutsupp: video in de groepschat (pt8-whutsupp-sam-video)

- Sectie: PT8 - Online gedrag (pt8)
- Item-id: pt8-whutsupp-sam-video
- Type: social_action_simulation
- Kerndoel/subdoel: 23B / 23B
- Punten: 4
- Vaardigheidsdomein: 23B Digitaal burgerschap
- Instructie: Je zit in een Whutsupp-groep van je klas. Een klasgenoot deelt een video van Sam op het schoolplein. Kies wat jij doet.

Schermen en antwoordmogelijkheden:
- Nepaccount met jouw foto (first)
  - Instructie: Iemand maakt een account aan met jouw naam en profielfoto. Het account stuurt rare berichten naar leerlingen van school. Jij weet niet wie het heeft gedaan.
  - Groep first (single): Wat is de beste eerste aanpak?
    - Opties: Niet terugdreigen; het account rapporteren en hulp inschakelen.; Zelf een nepaccount maken om terug te pakken.; Iedereen vragen het account te volgen om bewijs te verzamelen.; Je echte account verwijderen en niemand iets vertellen.
- Veilige stappen (steps)
  - Instructie: Welke stappen zijn veilig? Kies alle goede acties.
  - Groep steps (multi): Stappen
    - Opties: Het account rapporteren bij het platform.; Een mentor/ouder/verantwoordelijke volwassene vragen om te helpen bewijs veilig vast te leggen zonder het te verspreiden.; Je eigen accountinstellingen en privacy controleren.; Screenshots in de klassenapp zetten zodat iedereen ziet dat het nep is.; De vermoedelijke dader online beschuldigen.

Scoringsregels:
- risk: herkent het probleem of risico. (1 pt) | groep=first | type=singleCorrect | correct=Niet terugdreigen; het account rapporteren en hulp inschakelen.
- no-escalation: voorkomt verdere verspreiding of escalatie. (1 pt) | groep=first | type=noForbidden | verboden=Zelf een nepaccount maken om terug te pakken., Iedereen vragen het account te volgen om bewijs te verzamelen.
- report-help: schakelt passende hulp of melding in. (1 pt) | groep=steps | type=minCorrect | correct=Het account rapporteren bij het platform. | minCorrect=1
- safe-followup: veilige bewijs- of privacyactie. (1 pt) | groep=steps | type=minCorrect | correct=Een mentor/ouder/verantwoordelijke volwassene vragen om te helpen bewijs veilig vast te leggen zonder het te verspreiden., Je eigen accountinstellingen en privacy controleren. | minCorrect=1

Scorecaps:
- harmful-cap: max 2 bij Zelf een nepaccount maken om terug te pakken., Iedereen vragen het account te volgen om bewijs te verzamelen., Screenshots in de klassenapp zetten zodat iedereen ziet dat het nep is., De vermoedelijke dader online beschuldigen.

Whutsupp-variant: Leerjaar 3 vmbo (lj3-vmbo)
Taalniveau: medium
Groep: Klas 3V2 zonder docent

Beslismomenten en antwoordmogelijkheden:
- n1 / risk_boundary: Wat doe jij eerst?
  - Bericht Noah: Haha kijk Sam 😂
  - Bericht Noah: [videoCard: samStumbleVideo]
  - Bericht Jay: Maak er een sticker van.
  - Bericht Mila: Ik stuur hem ook naar de andere klas.
  - Bericht Sam: Stop. Ik wil dit niet online.
  - n1_safe_boundary: Ik stuur: ‘Niet doorsturen. Sam zegt dat hij dit niet wil.’ (correct; weet ik niet; score=1)
  - n1_ridicule: Ik reageer met 😂, maar stuur de video niet door. (niet correct; weet ik niet; score=0; flags=ridicule_reaction)
  - n1_forward_friend: Ik stuur de video alleen privé door naar één vriend. (niet correct; weet ik niet; score=0; flags=harmful_share)
  - n1_wait: Ik wacht af; misschien stopt het vanzelf. (niet correct; weet ik niet; score=0; flags=passive)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_report: Ik stop met reageren, deel niets verder en vraag hulp via een veilige route. (veilig herstel; flags=recovery_safe)
    - recovery_public_proof: Ik stuur de video in de groep als bewijs dat het echt gebeurt. (niet veilig; flags=unsafe_evidence_share)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)
- n2 / no_spread: Welke reactie past nu het best?
  - Bericht Noah: Rustig, dit is gewoon een grap.
  - Bericht Mila: Zal ik hem in de parallelklas zetten?
  - Bericht Sam: Nee. Haal de video weg.
  - Bericht Jay: Als hij niet online wil, had hij maar niet moeten vallen.
  - n2_safe_no_spread: Ik stuur: ‘Haal de video weg en stuur hem niet verder.’ (correct; weet ik niet; score=1)
  - n2_sticker: Ik stel voor er een sticker of meme van te maken. (niet correct; weet ik niet; score=0; flags=harmful_share, ridicule_reaction)
  - n2_only_known: Ik zeg dat doorsturen alleen mag naar mensen die Sam goed kennen. (niet correct; weet ik niet; score=0; flags=harmful_share)
  - n2_teacher_later: Ik laat het staan tot school of een docent reageert. (niet correct; weet ik niet; score=0; flags=passive)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_report: Ik stop met reageren, deel niets verder en vraag hulp via een veilige route. (veilig herstel; flags=recovery_safe)
    - recovery_public_proof: Ik stuur de video in de groep als bewijs dat het echt gebeurt. (niet veilig; flags=unsafe_evidence_share)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)
- n3 / support_target: Wat stuur je naar Sam?
  - Bericht Sam: Ik vind dit echt vervelend. Ik wil niet dat iedereen dit ziet.
  - Bericht Sam: Ik durf niks meer in de groep te zetten.
  - n3_safe_support: Ik stuur Sam: ‘Ik deel niets. Wil je dat ik met je meega naar de mentor of help met melden?’ (correct; weet ik niet; score=1)
  - n3_minimize: Ik stuur: ‘Laat maar, morgen is iedereen het vergeten.’ (niet correct; weet ik niet; score=0; flags=victim_blaming_or_minimizing)
  - n3_leave_chat: Ik adviseer Sam om zelf uit de groepschat te gaan. (niet correct; weet ik niet; score=0; flags=victim_blaming_or_minimizing)
  - n3_ask_more: Ik vraag Sam of er nog meer video’s zijn, zodat ik kan zien hoe erg het is. (niet correct; weet ik niet; score=0; flags=ridicule_reaction)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_report: Ik stop met reageren, deel niets verder en vraag hulp via een veilige route. (veilig herstel; flags=recovery_safe)
    - recovery_public_proof: Ik stuur de video in de groep als bewijs dat het echt gebeurt. (niet veilig; flags=unsafe_evidence_share)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)
- n4 / help_report: Wat doe je nu?
  - Bericht Elin: De video staat nu ook in een andere groepschat.
  - Bericht Sam: Ze blijven hem sturen. Ik wil dat dit stopt.
  - Bericht Mila: Iemand wil hem straks op story zetten.
  - n4_safe_help_report: Ik deel niets verder en vraag hulp bij mentor of ouder. Bewijs bewaar ik alleen volgens schoolafspraak. (correct; weet ik niet; score=1)
  - n4_unsafe_evidence: Ik stuur de video in de klasgroep zodat iedereen ziet wat er gebeurt. (niet correct; weet ik niet; score=0; flags=unsafe_evidence_share)
  - n4_retaliate: Ik maak een gênante post over Noah terug. (niet correct; weet ik niet; score=0; flags=retaliation)
  - n4_wait: Ik doe niets; misschien zakt het vanzelf weg. (niet correct; weet ik niet; score=0; flags=passive)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_report: Ik stop met reageren, deel niets verder en vraag hulp via een veilige route. (veilig herstel; flags=recovery_safe)
    - recovery_public_proof: Ik stuur de video in de groep als bewijs dat het echt gebeurt. (niet veilig; flags=unsafe_evidence_share)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)

### Selected-response vragen

### Vraag 1: Mail over nieuw cijfer (lj3v-sr1-cijfermail)

- Kerndoel/subdoel:  / 23A
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Stimulus: e-mailbericht
  - Van: Cijferportaal <noreply@cijferportaal-school.nl>
  - Aan: sanne@leerling.citadelcollege.nl
  - Onderwerp: Nieuw cijfer beschikbaar
  - Tekst: Hallo Sanne,
  - Tekst: Er staat een nieuw cijfer klaar. Log in om je cijfer te bekijken.
  - Link: Bekijk cijfer (https://cijferportaal-school.nl/login)
- Vraag: Wat doe je?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Ik open mijn cijfers via de normale schoolomgeving. | ja |  |
| B | Ik gebruik de knop, want cijfers bekijken vraagt altijd om inloggen. | nee |  |
| C | Ik gebruik de knop, omdat de mail van een cijferportaal lijkt te komen. | nee |  |
| D | Ik zoek de naam van de site op en klik dan alsnog op de link. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet keuze voor normale schoolomgeving bij cijferlogincontext; afleiders richten op verwachte login, afzendernaamvertrouwen en zwakke verificatie.
- Reviewstatus: V3.7-review: cijfermail aangescherpt naar logincontext met plausibele verificatiefout.

### Vraag 2: AI gebruiken voor een stagebrief (lj3v-vraag9-ai-stagebrief-v4)

- Kerndoel/subdoel: 21 / 21D
- Vraagtype: single choice
- Correct antwoord: 
- Weet-ik-niet-optie: geen
- Schadelijke afleider(s): geen
- Vraag: Noor gebruikt KletsGPT om een stagebrief te verbeteren. Bekijk de chat.

#### Deelvraag 1: Deelvraag A

- Vraag: Welke tekst kan Noor het best aan KletsGPT geven om haar brief te laten verbeteren?
- Correct antwoord: best_stage_prompt_no_contact

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| best_stage_prompt_no_contact | Verbeter deze stagebrief: Ik wil stage lopen bij een dierenwinkel, omdat ik goed met dieren kan omgaan. | ja |  |
| contact_details_included | Verbeter mijn stagebrief. Noor Peters, Lijsterstraat 14, 06-18473291. Ik wil stage lopen bij een dierenwinkel. | nee | foutcategorie: contact_details_unnecessary_for_ai_input |
| ai_invents_motivation | Maak een stagebrief voor een dierenwinkel. Verzin zelf een goede motivatie. | nee | foutcategorie: ai_generates_personal_motivation |
| ask_for_extra_numbers | Verbeter mijn stagebrief en maak hem extra overtuigend met cijfers over stages. | nee | foutcategorie: prompts_ai_for_unverified_statistics |
| unknown | Ik weet het niet. | nee | weet ik niet |

#### Deelvraag 2: Deelvraag B

- Vraag: Wat doet Noor het best met de zin over `StageMonitor Jongeren 2025`?
- Correct antwoord: check_stage_source_and_claim

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| check_stage_source_and_claim | Ze controleert of de bron bestaat en of de uitspraak daarin staat. | ja |  |
| source_name_found_only | Ze gebruikt de zin als ze de naam StageMonitor Jongeren 2025 online terugvindt. | nee | foutcategorie: source_name_confused_with_claim_support |
| remove_source_keep_percentage | Ze laat het percentage staan, maar haalt de bronnaam weg. | nee | foutcategorie: unverified_number_used |
| make_more_businesslike | Ze vraagt KletsGPT om de zin zakelijker te maken. | nee | foutcategorie: style_confused_with_accuracy |
| unknown | Ik weet het niet. | nee | weet ik niet |


- Interne onderbouwing: Leerlingvraag 9 / SR2: vervangt de dubbele rooster-/phishingvraag door een automatisch scorebare 21D/AI-vraag met twee single-choice deelvragen van 0,5 punt.
- Reviewstatus: pilot-work-version

### Vraag 3: Telefoon versnellen (lj3v-sr3-phone-actions)

- Kerndoel/subdoel:  / 21A
- Vraagtype: multiple select
- Correct antwoord: A, B, C
- Weet-ik-niet-optie: G
- Schadelijke afleider(s): geen
- Vraag: Youssefs telefoon is oud, traag en loopt soms vast. Welke drie acties kunnen meestal helpen?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Oude of ongebruikte apps en bestanden opruimen. | ja |  |
| B | Tijdelijke bestanden of cache opruimen via de instellingen. | ja |  |
| C | Beschikbare systeemupdates via de instellingen installeren. | ja |  |
| D | De helderheid van het scherm lager zetten. | nee |  |
| E | Het toetsenbordgeluid uitzetten. | nee |  |
| F | Een andere achtergrondfoto kiezen. | nee |  |
| G | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Drie correcte functionele onderhoudsacties.

### Vraag 4: Gezondheidsinformatie (lj3v-sr4-health-source)

- Kerndoel/subdoel:  / 21B
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Je zoekt basisinformatie over slaaptekort. Welke bron is het meest geschikt om als eerste te gebruiken?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Een publieke gezondheidsorganisatie of artsensite met uitleg, datum en bronvermelding. | ja |  |
| B | Een webshop die slaapdrankjes verkoopt en klantreviews toont. | nee |  |
| C | Een influencer die vertelt wat voor hem persoonlijk werkt. | nee |  |
| D | Een forum met veel reacties van onbekende gebruikers. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Afleiders zijn nu plausibeler: commercieel belang, ervaring en forumwijsheid.

### Vraag 5: Sponsoring herkennen (lj3v-sr5-sponsored)

- Kerndoel/subdoel:  / 21B
- Vraagtype: single choice
- Correct antwoord: opt_behavior_ads
- Weet-ik-niet-optie: unknown
- Schadelijke afleider(s): geen
- Vraag: Milan kijkt vaak gamevideo’s. Daarna ziet hij meer video’s over dezelfde game én reclame voor game-accessoires. Wat is de beste uitleg?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| opt_behavior_ads | Zijn kijkgedrag kan worden gebruikt voor aanbevelingen en soms ook voor gerichte reclame. | ja |  |
| opt_private_messages | De reclame bewijst dat Milan privéberichten over games heeft gestuurd. | nee |  |
| opt_school_wifi | Iedereen die dezelfde schoolwifi gebruikt, krijgt automatisch dezelfde reclame. | nee |  |
| opt_game_makers_control | De makers van de game bepalen precies welke video’s Milan ziet. | nee |  |
| unknown | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet aanbevelingen en gerichte reclame via online gedrag. Niet bedoeld als bewijs dat privéberichten zijn gelezen.
- Reviewstatus: V3.6-review: vervangen volgens aangeleverde v3.6 SR21B-bijlage.

### Vraag 6: Poll en conclusie (lj3v-sr6-percent)

- Kerndoel/subdoel:  / 21C
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: In een online poll stemmen 12 leerlingen uit klas 3V2. Acht leerlingen kiezen voor “meer pauze”. Een leerling zegt: “De meeste leerlingen van de hele school willen dus meer pauze.” Wat is de beste reactie?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Dat kun je niet zomaar zeggen, want de poll gaat maar over 12 leerlingen uit één klas. | ja |  |
| B | Dat klopt zeker, want acht stemmen is meer dan de helft. | nee |  |
| C | Dat klopt alleen als de poll op een telefoon is ingevuld. | nee |  |
| D | Dat kun je nooit onderzoeken met een poll. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet verhouding tussen data en conclusie.

### Vraag 7: Online game en persoonsgegevens (lj3v-sr7-ai-factcheck)

- Kerndoel/subdoel: 23 / 23B
- Vraagtype: single choice
- Correct antwoord: C
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Je speelt een online game. Iemand die je alleen uit de game kent, vraagt: “Hoe heet je echt, hoe oud ben je en in welke buurt woon je?” Wat is de beste reactie?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Je geeft alleen je voornaam en leeftijd, maar niet je adres. | nee |  |
| B | Je vraagt waarom die persoon dat wil weten en beslist daarna. | nee |  |
| C | Je deelt de gegevens niet en vraagt hulp aan een ouder, verzorger of mentor als de persoon blijft aandringen. | ja |  |
| D | Je geeft de gegevens als jullie al een tijdje samen spelen. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet veilig omgaan met persoonlijke gegevens in contact met iemand die de leerling alleen online kent.

### Vraag 8: Muziek of afbeelding online gebruiken (lj3v-sr8-media-rights)

- Kerndoel/subdoel: 22 / 22A
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Je maakt een video voor school. Je wilt een bekend liedje of een afbeelding van internet gebruiken. De video komt online. Wat is het best?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Controleren of je het materiaal mag gebruiken of kiezen voor rechtenvrij materiaal. | ja |  |
| B | Het materiaal kort gebruiken. Korte stukjes mogen altijd online. | nee |  |
| C | De maker niet noemen. Dan valt het minder op. | nee |  |
| D | Er een filter overheen zetten. Dan is het nieuw werk. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Sluit aan bij leerlingproducten: video, muziek, afbeeldingen en online publicatie.

### Vraag 9: Ongewenst gedeelde foto (lj3v-sr9-photo-shared)

- Kerndoel/subdoel: 23 / 23B
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: In een groepsapp deelt iemand zonder toestemming een foto van een klasgenoot. De klasgenoot staat er ongemakkelijk op. Wat is de beste reactie?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Niet verder delen en hulp inschakelen of vragen om de foto te verwijderen. | ja |  |
| B | De foto alleen doorsturen naar vrienden die je vertrouwt. | nee |  |
| C | De foto bewaren, want misschien heb je later bewijs nodig. | nee |  |
| D | Een grapje maken, zodat het minder serieus voelt. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet handelen wanneer ongewenst delen al heeft plaatsgevonden. Let op schoolafspraak rond bewijs veiligstellen.

### Vraag 10: Digitaal formulier en kansen (lj3v-sr10-digital-access)

- Kerndoel/subdoel: 23 / 23C
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Een stagebedrijf laat leerlingen alleen reageren via een ingewikkeld online formulier. Wat kan een gevolg zijn?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Leerlingen met minder digitale vaardigheden kunnen moeilijker meedoen. | ja |  |
| B | Iedereen krijgt automatisch dezelfde kans, want het formulier is voor iedereen gelijk. | nee |  |
| C | Het bedrijf hoeft minder op privacy te letten omdat alles digitaal is. | nee |  |
| D | Online solliciteren is altijd sneller en eerlijker. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet digitale ongelijkheid en toegang.

## Leerjaar 3 HAVO/VWO (lj3-hv)

### Zelfinschatting

#### Zelfinschatting (self-assessment)

- Sectie: Zelfinschatting (zelfinschatting)
- Item-id: self-assessment
- Type: self_assessment
- Kerndoel/subdoel: niet-scorend
- Punten: 0
- Vaardigheidsdomein: Zelfinschatting
- Vraag/instructie: Hoe digitaal geletterd schat je jezelf in? Schuif het bolletje naar jouw keuze. 0 betekent: ik schat mezelf helemaal niet digitaal geletterd in. 100 betekent: ik schat mezelf heel digitaal geletterd in.

Antwoordmogelijkheden:
- 0: helemaal niet digitaal geletterd
- 100: heel digitaal geletterd

### Performance tasks

#### PT 1: PT1 - Bestanden en mappen beheren (lj3h-pt1-files)

- Sectie: PT1 - Bestanden en mappen (pt1)
- Item-id: lj3h-pt1-files
- Type: file_task_simulation
- Kerndoel/subdoel: 21A
- Punten: 4
- Vaardigheidsdomein: 21A Digitale systemen
- Instructie: Gebruik de Verkenner hieronder. Voer de taak uit en klik daarna op Volgende. Werk in OneDrive in Project Onderzoek. Maak daarin de mappen Data, Bronnen, Beelden en Archief. Plaats bestanden op basis van type en versie. Zet alleen de definitieve versie in Project Onderzoek en archiveer de oude versie.

Opdrachten:
- structure (1 pt): mapstructuur correct.
  - Verwachte paden: Thuis/OneDrive/Project Onderzoek/Data; Thuis/OneDrive/Project Onderzoek/Bronnen; Thuis/OneDrive/Project Onderzoek/Beelden; Thuis/OneDrive/Project Onderzoek/Archief
- types (1 pt): data, bron en beeld correct geplaatst.
  - Verwachte paden: Thuis/OneDrive/Project Onderzoek/Data/resultaten.csv; Thuis/OneDrive/Project Onderzoek/Bronnen/bron_artikel.pdf; Thuis/OneDrive/Project Onderzoek/Beelden/grafiek.png
- versions (1 pt): oude versie correct gearchiveerd.
  - Verwacht pad: Thuis/OneDrive/Project Onderzoek/Archief/onderzoek_v1.docx
- final (1 pt): definitieve versie in hoofdmap behouden.
  - Verwacht pad: Thuis/OneDrive/Project Onderzoek/onderzoek_definitief.docx
  - Verboden paden: Thuis/OneDrive/Project Onderzoek/Archief/onderzoek_definitief.docx

#### PT 2: E-mail opstellen (lj3h-pt2-mail)

- Sectie: PT2 - Mail opstellen (pt2)
- Item-id: lj3h-pt2-mail
- Type: outlook_mail_simulation
- Kerndoel/subdoel: 21A
- Punten: 4
- Vaardigheidsdomein: 21A Digitale systemen / 23B Digitaal burgerschap
- Instructie: Stuur een projectmail naar je docent. 1. Kies de docent als ontvanger in Aan. 2. Zet beide groepsgenoten in Cc. 3. Gebruik het juiste onderwerp: Definitief onderzoeksverslag. 4. Voeg alleen de juiste bijlage toe. 5. Verzend de e-mail.

Beschikbare opties:
- Knoppen: Verzenden, BCC tonen, Bestand bijvoegen, Hyperlink invoegen, Prioriteit, Concept opslaan, Verwijderen
- Contacten: docent@school.nl, groepsgenoot1@school.nl, groepsgenoot2@school.nl, klasgroep@school.nl, mentor@school.nl, projectgenoot@school.nl, stagebegeleider@bedrijf.nl
- Bestanden: Bronnenlijst.pdf, Onderzoeksverslag_definitief.pdf, Onderzoeksverslag_oud.pdf, Resultaten.xlsx

Scoringsregels:
- to: juiste ontvanger. (1 pt) | condities=to includes docent@school.nl
- to includes docent@school.nl
- cc-bcc: juiste cc en bcc waar nodig. (1 pt) | condities=cc allInclude groepsgenoot1@school.nl, groepsgenoot2@school.nl
- cc allInclude groepsgenoot1@school.nl, groepsgenoot2@school.nl
- subject: juist onderwerp. (1 pt) | condities=subject equals Definitief onderzoeksverslag
- subject equals Definitief onderzoeksverslag
- attachment-sent: juiste bijlage en verzonden. (1 pt) | condities=attachments includes Onderzoeksverslag_definitief.pdf; attachments noneInclude Bronnenlijst.pdf, Onderzoeksverslag_oud.pdf, Resultaten.xlsx; sent true
- attachments includes Onderzoeksverslag_definitief.pdf
- attachments noneInclude Bronnenlijst.pdf, Onderzoeksverslag_oud.pdf, Resultaten.xlsx
- sent true

#### PT 3: PT3 - Bericht beoordelen (lj3h-pt3-security)

- Sectie: PT3 - Account, apparaat en verbinding beveiligen (pt3)
- Item-id: lj3h-pt3-security
- Type: account_security_simulation
- Kerndoel/subdoel: 23A
- Punten: 3
- Vaardigheidsdomein: 23A Veiligheid en privacy
- Instructie: Bekijk de e-mail en kies je antwoorden.

Schermen en antwoordmogelijkheden:
- Mail over accountactiviteit (session-mail)
  - Instructie: Mila krijgt deze mail nadat ze thuis heeft ingelogd op haar schoolaccount.
  - E-mail: Onbekend apparaat gevonden
    - Van: Account team <acc-veilig-90z1@verify-device-center.co>
    - Tekst: Beste Mila,
    - Tekst: Er is een onbekend apparaat gekoppeld. Voorkom afsluiting van je account door je wachtwoord via onderstaande knop te vernieuwen.
    - Tekst: Gebruik dezelfde gegevens als je schoolaccount.
  - Groep signals (multi): Welke signalen maken dat Mila voorzichtig moet zijn?
    - Opties: Het domein van de afzender is geen herkenbaar schooldomein.; De link gebruikt een andere domeinnaam dan de schoolsite.; De mail dreigt met afsluiting van het account.; De mail vraagt om schoolgegevens in te vullen via een link.; De mail noemt Mila bij naam.
  - Groep actions (multi): Wat is de beste aanpak?
    - Opties: Niet via de link inloggen.; Zelf naar de officiele accountinstellingen gaan.; Actieve sessies en tweestapsverificatie controleren.; Wachtwoord invullen via de knop om afsluiting te voorkomen.; De mail negeren zonder verder te controleren.

Scoringsregels:
- signals: herkent minimaal drie signalen in de mail. (1 pt) | groep=signals | type=minCorrect | correct=Het domein van de afzender is geen herkenbaar schooldomein., De link gebruikt een andere domeinnaam dan de schoolsite., De mail dreigt met afsluiting van het account., De mail vraagt om schoolgegevens in te vullen via een link. | minCorrect=3
- account-check: kiest controle via eigen accountinstellingen. (1 pt) | groep=actions | type=allSelected | correct=Niet via de link inloggen., Zelf naar de officiele accountinstellingen gaan., Actieve sessies en tweestapsverificatie controleren.
- no-link: vermijdt link en passief negeren. (1 pt) | groep=actions | type=noForbidden | verboden=Wachtwoord invullen via de knop om afsluiting te voorkomen., De mail negeren zonder verder te controleren.

#### PT 4: PT4 - Excel/data sorteren en filteren (lj3h-pt4-excel)

- Sectie: PT4 - Excel/data sorteren en filteren (pt4)
- Item-id: lj3h-pt4-excel
- Type: excel_download_task
- Kerndoel/subdoel: 21C, 21A
- Punten: 4
- Vaardigheidsdomein: 21C Data
- Instructie: Download LJ3_HV_OpenData.xlsx. Open het in Excel. Klik op Bewerken inschakelen als Excel daarom vraagt.

Bestand: LJ3_HV_OpenData.xlsx
Werkblad: Energie

Vragen en correcte antwoorden:
- a (2 pt): Filter op Kosten > 500. Sorteer daarna op Kosten, van hoog naar laag. Welke code staat bovenaan?
  - Correct antwoord/code: E13
- b (2 pt): Filter op Woningtype = B. Sorteer daarna op Jaar, van nieuw naar oud. Welke code staat bovenaan?
  - Correct antwoord/code: E02

#### PT 5: Schermdelen in een online les (lj3hv-pt6-screen-share)

- Sectie: PT6 - Videovergadering en schermdelen (pt6)
- Item-id: lj3hv-pt6-screen-share
- Type: teams_share_simulation
- Kerndoel/subdoel: 23A
- Punten: 3
- Vaardigheidsdomein: 21A Digitale systemen / 23B Digitaal burgerschap
- Instructie: Deel het filmfragment zodat de docent het kan zien en horen. Mark Canbers wil niet dat de docent zijn andere vensters kan zien.

Scenario: Deel alleen het venster met het filmfragment. Gebruik computergeluid, maar deel niet je hele scherm.
Knoppen: Camera, Microfoon, Chat, Deelnemers, Delen, Meer
Deelopties: Hele scherm, Venster
Vensters: Videospeler - filmfragment, Browser - rooster, Word - verslag, Excel - cijfers, Chat - klasgroep
Correct venster: Videospeler - filmfragment

Scoringsregels:
- window-not-screen: deelt een venster in plaats van het hele scherm. (1 pt) | condities=notWholeScreen
- correct-window: kiest het juiste venster met het filmfragment. (1 pt) | condities=mediaPlayerSelected
- sound: computergeluid staat aan. (1 pt) | condities=computerSoundOn

#### PT 6: PT7 - Blokprogrammeren (lj3h-pt7-programming-debug-v1)

- Sectie: PT7 - Blokprogrammeren (pt7)
- Item-id: lj3h-pt7-programming-debug-v1
- Type: block_programming_task
- Kerndoel/subdoel: 22B
- Punten: 4
- Vaardigheidsdomein: 22B Programmeren
- Instructie: Blokprogrammeren

Programmeertaak:
- Intro: Toon alleen "Koelen" als het warm is en het raam open staat. Er zijn 2 fouten in de code. Wijs ze aan, verbeter ze en test.
- Device: sensor
- Beschikbare blokken:
  - lees temperatuur (invoer)
  - lees raamOpen (invoer)
  - lees luchtvochtigheid (invoer)
  - lees tijdstip (invoer)
  - als temperatuur > 25 EN raamOpen = ja dan (voorwaarden; container)
  - als temperatuur > 25 OF raamOpen = ja dan (voorwaarden; container)
  - als temperatuur < 25 EN raamOpen = ja dan (voorwaarden; container)
  - als temperatuur > 25 EN raamOpen = nee dan (voorwaarden; container)
  - als temperatuur = 25 dan (voorwaarden; container)
  - anders (voorwaarden; container)
  - EN (logica)
  - OF (logica)
  - NIET (logica)
  - toon "Koelen" (uiterlijk)
  - toon "Oké" (uiterlijk)
  - toon "Verwarmen" (uiterlijk)
  - toon "Alarm" (uiterlijk)
  - toon "Wachten" (uiterlijk)
  - wacht 10 seconden (besturing)
  - herhaal zolang (besturing; container)
  - stop programma (besturing)
- Correct programma:
  - lees temperatuur
  - lees raamOpen
  - als temperatuur > 25 EN raamOpen = ja dan
  - toon "Koelen"
  - anders
  - toon "Oké"

Scoringsregels:

#### PT 7: Whutsupp: video in de groepschat (pt8-whutsupp-sam-video)

- Sectie: PT8 - Online gedrag (pt8)
- Item-id: pt8-whutsupp-sam-video
- Type: social_action_simulation
- Kerndoel/subdoel: 23B / 23B
- Punten: 4
- Vaardigheidsdomein: 23B Digitaal burgerschap
- Instructie: Je zit in een Whutsupp-groep van je klas. Een klasgenoot deelt een video van Sam op het schoolplein. Kies wat jij doet.

Schermen en antwoordmogelijkheden:
- Gemanipuleerde schoolpost (signals)
  - Instructie: In een groepschat verschijnt een screenshot van een zogenaamd schoolbericht: "Vanaf morgen zijn telefoons verboden. Wie protesteert, krijgt straf." Het bericht komt niet uit de schoolapp. De opmaak lijkt op school, maar het account dat het deelt is anoniem. Sommige leerlingen willen het meteen doorsturen.
  - Groep signals (multi): Welke signalen maken dat je voorzichtig moet zijn?
    - Opties: Het bericht komt niet uit de officiële schoolapp of mail.; Het account dat het deelt is anoniem.; Het bericht probeert snelle verspreiding of paniek te veroorzaken.; Het bericht gebruikt woorden die op schooltaal lijken.; Veel leerlingen reageren erop.
- Handelen (action)
  - Instructie: Wat is de beste aanpak voordat je iets doorstuurt?
  - Groep action (single): Aanpak
    - Opties: Niet doorsturen en eerst controleren via officiële schoolkanalen of mentor/docent.; Doorsturen met "ik weet niet of dit klopt" erbij.; Alleen reacties lezen en dan beslissen.; Zelf een aangepast screenshot maken om te laten zien dat het nep kan zijn.
- Vervolg (followup)
  - Instructie: Wat is een goede vervolgstap als blijkt dat het nep is?
  - Groep followup (single): Vervolgstap
    - Opties: In de groep melden dat het niet uit een officieel kanaal komt en vragen het niet verder te delen.; De maker online belachelijk maken.; Het screenshot bewaren en later opnieuw delen als voorbeeld.; Een nieuwe versie maken als grap.

Scoringsregels:
- risk: minimaal twee juiste signalen. (1 pt) | groep=signals | type=minCorrect | correct=Het bericht komt niet uit de officiële schoolapp of mail., Het account dat het deelt is anoniem., Het bericht probeert snelle verspreiding of paniek te veroorzaken. | minCorrect=2
- no-spread: niet doorsturen. (1 pt) | groep=action | type=singleCorrect | correct=Niet doorsturen en eerst controleren via officiële schoolkanalen of mentor/docent.
- official-check: officiële controle/mentor/docent. (1 pt) | groep=action | type=singleCorrect | correct=Niet doorsturen en eerst controleren via officiële schoolkanalen of mentor/docent.
- safe-followup: corrigerende, niet-escalerende vervolgstap. (1 pt) | groep=followup | type=singleCorrect | correct=In de groep melden dat het niet uit een officieel kanaal komt en vragen het niet verder te delen.

Scorecaps:
- harmful-cap: max 2 bij Zelf een aangepast screenshot maken om te laten zien dat het nep kan zijn., De maker online belachelijk maken., Het screenshot bewaren en later opnieuw delen als voorbeeld., Een nieuwe versie maken als grap.

Whutsupp-variant: Leerjaar 3 havo/vwo (lj3-hv)
Taalniveau: medium_plus
Groep: Klas 3H4 zonder docent

Beslismomenten en antwoordmogelijkheden:
- n1 / risk_boundary: Wat doe jij eerst?
  - Bericht Noah: Haha kijk Sam 😂
  - Bericht Noah: [videoCard: samStumbleVideo]
  - Bericht Jay: Maak er een sticker van.
  - Bericht Mila: Ik stuur hem ook naar de andere klas.
  - Bericht Sam: Stop. Ik wil dit niet online.
  - n1_safe_boundary: Ik stuur: ‘Niet doorsturen. Sam zegt dat hij dit niet wil.’ (correct; weet ik niet; score=1)
  - n1_ridicule: Ik reageer met 😂, maar stuur de video niet door. (niet correct; weet ik niet; score=0; flags=ridicule_reaction)
  - n1_forward_friend: Ik stuur de video alleen privé door naar één vriend. (niet correct; weet ik niet; score=0; flags=harmful_share)
  - n1_wait: Ik wacht af; misschien stopt het vanzelf. (niet correct; weet ik niet; score=0; flags=passive)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_report: Ik stop met reageren, deel niets verder en vraag hulp via een veilige route. (veilig herstel; flags=recovery_safe)
    - recovery_public_proof: Ik stuur de video in de groep als bewijs dat het echt gebeurt. (niet veilig; flags=unsafe_evidence_share)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)
- n2 / no_spread: Welke reactie past nu het best?
  - Bericht Noah: Rustig, dit is gewoon een grap.
  - Bericht Mila: Zal ik hem in de parallelklas zetten?
  - Bericht Sam: Nee. Haal de video weg.
  - Bericht Jay: Als hij niet online wil, had hij maar niet moeten vallen.
  - n2_safe_no_spread: Ik stuur: ‘Haal de video weg en stuur hem niet verder.’ (correct; weet ik niet; score=1)
  - n2_sticker: Ik stel voor er een sticker of meme van te maken. (niet correct; weet ik niet; score=0; flags=harmful_share, ridicule_reaction)
  - n2_only_known: Ik zeg dat doorsturen alleen mag naar mensen die Sam goed kennen. (niet correct; weet ik niet; score=0; flags=harmful_share)
  - n2_teacher_later: Ik laat het staan tot school of een docent reageert. (niet correct; weet ik niet; score=0; flags=passive)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_report: Ik stop met reageren, deel niets verder en vraag hulp via een veilige route. (veilig herstel; flags=recovery_safe)
    - recovery_public_proof: Ik stuur de video in de groep als bewijs dat het echt gebeurt. (niet veilig; flags=unsafe_evidence_share)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)
- n3 / support_target: Wat stuur je naar Sam?
  - Bericht Sam: Ik vind dit echt vervelend. Ik wil niet dat iedereen dit ziet.
  - Bericht Sam: Ik durf niks meer in de groep te zetten.
  - n3_safe_support: Ik stuur Sam: ‘Ik deel niets. Wil je dat ik met je meega naar de mentor of help met melden?’ (correct; weet ik niet; score=1)
  - n3_minimize: Ik stuur: ‘Laat maar, morgen is iedereen het vergeten.’ (niet correct; weet ik niet; score=0; flags=victim_blaming_or_minimizing)
  - n3_leave_chat: Ik adviseer Sam om zelf uit de groepschat te gaan. (niet correct; weet ik niet; score=0; flags=victim_blaming_or_minimizing)
  - n3_ask_more: Ik vraag Sam of er nog meer video’s zijn, zodat ik kan zien hoe erg het is. (niet correct; weet ik niet; score=0; flags=ridicule_reaction)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_report: Ik stop met reageren, deel niets verder en vraag hulp via een veilige route. (veilig herstel; flags=recovery_safe)
    - recovery_public_proof: Ik stuur de video in de groep als bewijs dat het echt gebeurt. (niet veilig; flags=unsafe_evidence_share)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)
- n4 / help_report: Wat doe je nu?
  - Bericht Elin: De video staat nu ook in een andere groepschat.
  - Bericht Sam: Ze blijven hem sturen. Ik wil dat dit stopt.
  - Bericht Mila: Iemand wil hem straks op story zetten.
  - Bericht Jay: Ik heb er al tekst bij gezet: ‘Sam faalt weer’.
  - n4_safe_help_report: Ik deel niets verder, maak veilig melding bij mentor/platform en bewaar bewijs alleen volgens schoolafspraak. (correct; weet ik niet; score=1)
  - n4_unsafe_evidence: Ik zet de video met uitleg in de groep, zodat iedereen bewijs heeft. (niet correct; weet ik niet; score=0; flags=unsafe_evidence_share)
  - n4_retaliate: Ik maak een gênante post over Noah terug. (niet correct; weet ik niet; score=0; flags=retaliation)
  - n4_wait: Ik doe niets; misschien zakt het vanzelf weg. (niet correct; weet ik niet; score=0; flags=passive)
  - unknown: Ik weet het niet. (niet correct; weet ik niet; score=0; flags=unknown)
  - Herstelvraag: Je merkt dat dit niet helpt. Wat doe je nu?
    - recovery_safe_report: Ik stop met reageren, deel niets verder en vraag hulp via een veilige route. (veilig herstel; flags=recovery_safe)
    - recovery_public_proof: Ik stuur de video in de groep als bewijs dat het echt gebeurt. (niet veilig; flags=unsafe_evidence_share)
    - unknown: Ik weet het niet. (niet veilig; flags=unknown)

### Selected-response vragen

### Vraag 1: Mail over accountcontrole (lj3h-sr1-accountmail)

- Kerndoel/subdoel:  / 23A
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Stimulus: e-mailbericht
  - Van: Schoolaccount beheer <beheer@schoolaccount-citadel.nl>
  - Aan: sanne@leerling.citadelcollege.nl
  - Onderwerp: Controle van je schoolaccount
  - Tekst: Hallo Sanne,
  - Tekst: We controleren deze week de toegang tot schoolaccounts. Bevestig je account om zonder onderbreking Teams, OneDrive en Magister te blijven gebruiken.
  - Link: Account bevestigen (https://schoolaccount-citadel.nl/controle)
- Vraag: Welke reactie past het best?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Ik ga zelf naar de bekende schoolomgeving en controleer daar mijn account. | ja |  |
| B | Ik gebruik de knop, omdat de mail meerdere bekende schooldiensten noemt. | nee |  |
| C | Ik gebruik de knop als de inlogpagina er hetzelfde uitziet als normaal. | nee |  |
| D | Ik antwoord op de mail en vraag of mijn account echt gecontroleerd moet worden. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet keuze voor bekende schoolomgeving bij accountcontrolecontext; afleiders richten op bekende diensten, uiterlijk van inlogpagina en antwoorden op afzender.
- Reviewstatus: V3.7-review: accountcontrolemail aangescherpt met bekende diensten, professioneel klinkende afzender en realistische afleiders.

### Vraag 2: AI gebruiken voor een betoog (lj3h-vraag9-ai-betoog-v4)

- Kerndoel/subdoel: 21 / 21D
- Vraagtype: single choice
- Correct antwoord: 
- Weet-ik-niet-optie: geen
- Schadelijke afleider(s): geen
- Vraag: Sara gebruikt KletsGPT voor een betoog over telefoons in de klas. Bekijk de chat.

#### Deelvraag 1: Deelvraag A

- Vraag: Welke invoer past het best bij verantwoord gebruik van KletsGPT?
- Correct antwoord: best_no_private_messages

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| best_no_private_messages | Maak een alinea voor een betoog over telefoons in de klas. Gebruik geen berichten van klasgenoten. | ja |  |
| private_quote_without_name | Maak een alinea voor mijn betoog. Een klasgenoot schreef: "Mijn cijfers zijn echt gezakt door mijn telefoon." Noem zijn naam niet. | nee | foutcategorie: anonymization_overestimated |
| make_private_message_general | Maak het bericht van mijn klasgenoot algemener en gebruik het als voorbeeld in mijn betoog. | nee | foutcategorie: private_context_still_used |
| invent_student_example | Maak een sterke alinea en verzin een leerlingvoorbeeld dat goed bij mijn standpunt past. | nee | foutcategorie: fabricated_example_requested |
| unknown | Ik weet het niet. | nee | weet ik niet |

#### Deelvraag 2: Deelvraag B

- Vraag: Wat doet Sara het best met het onderzoek dat KletsGPT noemt?
- Correct antwoord: verify_article_supports_18_claim

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| verify_article_supports_18_claim | Ze zoekt het artikel op en controleert of daarin echt staat dat cijfers gemiddeld 18% hoger zijn. | ja |  |
| trust_title_and_authors | Ze gebruikt de bron als de titel en auteurs betrouwbaar klinken. | nee | foutcategorie: source_label_confused_with_reliability |
| longer_reference | Ze vraagt KletsGPT om een langere bronvermelding en gebruikt die in haar betoog. | nee | foutcategorie: source_detail_confused_with_reliability |
| remove_percentage_keep_claim | Ze haalt het percentage weg, maar gebruikt de conclusie dat telefoons cijfers verlagen. | nee | foutcategorie: unverified_claim_still_used |
| unknown | Ik weet het niet. | nee | weet ik niet |


- Interne onderbouwing: Leerlingvraag 9 / SR2: vervangt de dubbele rooster-/phishingvraag door een automatisch scorebare 21D/AI-vraag met twee single-choice deelvragen van 0,5 punt.
- Reviewstatus: pilot-work-version

### Vraag 3: Telefoon en onderhoud (lj3h-sr3-phone-actions)

- Kerndoel/subdoel:  / 21A
- Vraagtype: multiple select
- Correct antwoord: A, B, C
- Weet-ik-niet-optie: G
- Schadelijke afleider(s): geen
- Vraag: Youssefs telefoon wordt traag en loopt vaak vast. Welke drie acties zijn het meest logisch?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Onnodige apps en grote bestanden opruimen. | ja |  |
| B | Cache of tijdelijke gegevens opruimen via instellingen. | ja |  |
| C | Systeem en apps updaten via officiële instellingen. | ja |  |
| D | Schermhelderheid lager zetten. | nee |  |
| E | Alle meldingen aanzetten. | nee |  |
| F | Toetsenbordgeluid uitzetten. | nee |  |
| G | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Zelfde ankerconcept, passend complexer door drie acties.

### Vraag 4: Claim controleren (lj3h-sr4-triangulation)

- Kerndoel/subdoel:  / 21B
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Je vindt een opvallende claim over een nieuwe schoolregel. Welke controle is het sterkst?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Controleren of de school zelf of meerdere betrouwbare bronnen dezelfde regel melden. | ja |  |
| B | Kijken of de post veel gedeeld is. | nee |  |
| C | Kijken of de tekst boos klinkt. | nee |  |
| D | De claim geloven als er een screenshot bij staat. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet triangulatie.

### Vraag 5: Filterbubbel (lj3h-sr5-filterbubble)

- Kerndoel/subdoel:  / 21B
- Vraagtype: single choice
- Correct antwoord: opt_careful_broaden
- Weet-ik-niet-optie: unknown
- Schadelijke afleider(s): geen
- Vraag: Sara ziet in haar nieuwsfeed vooral berichten die haar mening over een nieuwe schoolregel bevestigen. Ze denkt: “Zie je wel, bijna iedereen denkt er zo over.” Wat is de beste reactie?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| opt_careful_broaden | Voorzichtig zijn met die conclusie en actief betrouwbare bronnen of andere invalshoeken zoeken. | ja |  |
| opt_feed_neutral | De conclusie klopt waarschijnlijk, want een feed laat meestal een neutraal beeld zien. | nee |  |
| opt_comments_enough | Reacties onder de berichten zijn genoeg om te weten wat de meeste mensen vinden. | nee |  |
| opt_block_other_views | Bronnen met een andere mening kun je beter blokkeren om je feed duidelijk te houden. | nee |  |
| unknown | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet filterbubbelbewustzijn en handelingsbekwaamheid: een feed is geen bewijs voor wat bijna iedereen vindt; zoek betrouwbare andere invalshoeken.
- Reviewstatus: V3.6-review: vervangen volgens aangeleverde v3.6 SR21B-bijlage.

### Vraag 6: Klachten naar verhouding (lj3h-sr6-graph-scale)

- Kerndoel/subdoel:  / 21C
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Een grafiek vergelijkt klachten over twee apps. App A: 20 klachten bij 1.000 gebruikers. App B: 50 klachten bij 10.000 gebruikers. Welke conclusie past het best bij deze data?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | App A heeft naar verhouding meer klachten dan App B. | ja |  |
| B | App B heeft naar verhouding meer klachten, want 50 is meer dan 20. | nee |  |
| C | De apps hebben evenveel klachten, want beide apps hebben klachten. | nee |  |
| D | Je kunt nooit naar verhouding kijken bij gebruikersaantallen. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet dataconclusie met verhouding; pilot moet controleren of rekenbelasting passend is.

### Vraag 7: Online game en persoonsgegevens (lj3h-sr7-ai-source-check)

- Kerndoel/subdoel: 23 / 23B
- Vraagtype: single choice
- Correct antwoord: C
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Je speelt een online game. Iemand die je alleen uit de game kent, vraagt: “Hoe heet je echt, hoe oud ben je en in welke buurt woon je?” Wat is de beste reactie?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Je geeft alleen je voornaam en leeftijd, maar niet je adres. | nee |  |
| B | Je vraagt waarom die persoon dat wil weten en beslist daarna. | nee |  |
| C | Je deelt de gegevens niet en vraagt hulp aan een ouder, verzorger of mentor als de persoon blijft aandringen. | ja |  |
| D | Je geeft de gegevens als jullie al een tijdje samen spelen. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet veilig omgaan met persoonlijke gegevens in contact met iemand die de leerling alleen online kent.

### Vraag 8: Afbeelding aanpassen en delen (lj3h-sr8-remix-rights)

- Kerndoel/subdoel: 22 / 22A
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Je wilt een afbeelding van internet aanpassen voor een online poster. Wat controleer je eerst?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Of bewerken en delen mag, en welke bronvermelding nodig is. | ja |  |
| B | Of de afbeelding groot genoeg is; dan hoef je de maker niet te noemen. | nee |  |
| C | Of je de kleuren sterk verandert; dan is het automatisch eigen werk. | nee |  |
| D | Of je de poster alleen in een groepsapp deelt; dan gelden geen regels. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet gebruik, remix, delen en bronvermelding.

### Vraag 9: Privéfoto in besloten groep (lj3h-sr9-private-photo)

- Kerndoel/subdoel: 23 / 23B
- Vraagtype: single choice
- Correct antwoord: A
- Weet-ik-niet-optie: E
- Schadelijke afleider(s): geen
- Vraag: Iemand deelt zonder toestemming een privéfoto van een klasgenoot in een besloten groep. Wat is de beste eerste reactie?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Niet verder delen en via een veilige route hulp inschakelen of rapporteren. | ja |  |
| B | De foto bewaren om later te bewijzen dat je hem gezien hebt. | nee |  |
| C | De foto doorsturen naar een kleiner groepje dat je vertrouwt. | nee |  |
| D | Reageren met een grap, zodat de spanning daalt. | nee |  |
| E | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Meet verantwoord handelen bij schade, groepsdruk en privacy.

### Vraag 10: Afhankelijk van één platform (lj3h-sr10-platform-dependence)

- Kerndoel/subdoel: 23 / 23C
- Vraagtype: multiple select
- Correct antwoord: A, B
- Weet-ik-niet-optie: F
- Schadelijke afleider(s): C, D, E
- Vraag: Een school regelt bijna alles via één digitaal platform: rooster, huiswerk, cijfers en berichten. Welke twee risico’s horen daarbij?

| Optie | Antwoord | Correct | Opmerking |
| --- | --- | --- | --- |
| A | Bij een storing kan veel schoolinformatie tegelijk onbereikbaar zijn. | ja |  |
| B | Leerlingen zonder goede toegang kunnen sneller informatie missen. | ja |  |
| C | Leerlingen hoeven minder apps te installeren. | nee | schadelijke afleider |
| D | Berichten staan overzichtelijker op één plek. | nee | schadelijke afleider |
| E | De school hoeft minder uitleg te geven. | nee | schadelijke afleider |
| F | Ik weet het niet. | nee | weet ik niet |

- Interne onderbouwing: Leerlingen onderscheiden voordelen van risico’s bij platformafhankelijkheid.

