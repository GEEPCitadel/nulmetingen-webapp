# Codex-opdracht — herstel vraag 16 en plaats verbeterde AI-vraag op vraag 9

## Doel

Herstel de foutieve plaatsing van de AI-vraag.

De AI-vraag over 21D staat nu per ongeluk op **leerlingvraag 16 van 17**. Dat is fout. De AI-vraag moet op **leerlingvraag 9 van 17** komen, omdat de huidige vraag 9 een dubbele phishing-/roostermailvraag is en inhoudelijk overlapt met vraag 3.

## Belangrijke nummering

Gebruik leerlingvraagnummering in de interface, niet alleen interne SR-nummers.

- **Vraag 3** = phishingvraag met realistische e-mailmock-up. Niet aanpassen.
- **Vraag 7** = Whutsupp/Sam-video. Niet aanpassen.
- **Vraag 9** = oude roostermail/phishingvraag. Die moet eruit en wordt vervangen door AI/21D.
- **Vraag 16** = oude 23B-vraag over foto delen / toestemming / privéfoto. Die moet terugkomen en actief blijven.

## Herstelopdracht

Voer precies deze stappen uit.

### Stap 1 — Herstel vraag 16

Zet de oude vraag 16 terug.

Vraag 16 mag geen AI-vraag zijn. Vraag 16 moet weer de oude 23B-vraag zijn over foto delen, toestemming, privéfoto of verantwoord handelen bij beeldmateriaal.

Gebruik de laatst bekende versie uit de codegeschiedenis vóór de AI-wijziging.

Als herstel uit codegeschiedenis niet lukt, herstel dan de oude SR9-items of inhoudelijk equivalente varianten:

- `lj1v-sr9-photo-consent`
- `lj1h-sr9-photo-share`
- `lj3v-sr9-photo-shared`
- `lj3h-sr9-private-photo`

Vraag 16 blijft gekoppeld aan 23B.

### Stap 2 — Vervang vraag 9 door AI/21D

Vervang precies de vraag die in de leerlinginterface als **Vraag 9 van 17** verschijnt.

Zoek niet op `foto`, `toestemming` of `privéfoto` om de vervangplek te bepalen. Dat verwijst naar vraag 16 en veroorzaakte de vorige fout.

Vraag 9 is de oude roostermail/phishingvraag. Die is dubbel met vraag 3 en moet uit de actieve afname verdwijnen.

Na de wijziging toont vraag 9 de nieuwe AI-vraag over 21D.

### Stap 3 — Controleer dat andere vragen niet wijzigen

Controleer expliciet:

- Vraag 3 blijft phishing.
- Vraag 7 blijft Whutsupp/Sam-video.
- Vraag 16 blijft 23B/foto delen/toestemming.
- Alleen vraag 9 wordt AI/21D.

---

# Algemene metadata nieuwe vraag 9

- Leerlingvraagnummer: 9 van 17
- Interne plek: SR2, als de toetsstructuur 7 performance tasks + 10 selected-responsevragen gebruikt
- Titel: afhankelijk van variant
- Kerndoel/subdoel: 21D — AI
- Type: AI-chatmock-up + twee gesloten deelvragen
- Scoring: automatisch
- Maximaal aantal punten: 1
- Deelvraag A: 0,5 punt
- Deelvraag B: 0,5 punt
- Open tekstvelden: nee
- Leerlingnummer: nergens gebruiken
- Correctheid: via option-id’s, nooit via antwoordpositie
- Antwoordrandomisatie: ja, behalve `Ik weet het niet`
- `Ik weet het niet`: altijd onderaan, exclusief, 0 punten, apart loggen als unknown

---

# UI-eisen AI-chatmock-up

De huidige mock-up is bruikbaar, maar visueel onduidelijk. Pas de chatinterface aan.

## Naam AI-tool

Gebruik overal:

`KletsGPT`

Gebruik geen `AI-hulp`, `AI-chat`, `ChatGPT`, `Copilot` of `Gemini`.

## Visuele stijl

Laat de mock-up duidelijk lijken op een moderne AI-chatinterface.

Gebruik deze conventie:

- Leerlinginvoer:
  - rechts uitgelijnd;
  - blauwe chatbubbel;
  - alle leerlingtekst in dezelfde stijl;
  - geen groene leerlingbubbels;
  - geen witte leerlingbubbels;
  - geen label `Leerling:` binnen de bubbel.

- KletsGPT-output:
  - links uitgelijnd;
  - witte of lichtgrijze chatbubbel;
  - klein icoon of label `KletsGPT` naast of boven de bubbel;
  - duidelijk visueel anders dan de leerlinginvoer.

## Belangrijk voor vmbo 1

In de huidige mock-up is niet duidelijk welke tekst invoer van Sanne is. Dat komt doordat blauw, groen en wit door elkaar worden gebruikt.

Los dit op door alle invoer van Sanne in één blauwe rechterbubbel te zetten, of in meerdere blauwe rechterbubbels met exact dezelfde stijl.

## Verwijder dubbele instructietekst

Toon niet nogmaals een apart blok `AI-chat` met dezelfde instructie.

Toon boven de mock-up alleen één korte instructie, bijvoorbeeld:

`Sanne gebruikt KletsGPT voor haar werkstuk. Bekijk de chat.`

Daarna komt de chatmock-up. Daarna komen deelvraag A en deelvraag B.

Gebruik in de instructie niet de woorden:

- privacy
- persoonsgegevens
- broncontrole
- hallucinatie
- nepbron

Die woorden geven het construct te veel weg.

---

# Algemene inhoudelijke verbetering

Deelvraag A mag niet meer vragen: `Wat kan de leerling beter weghalen?`

Dat is te makkelijk. Leerlingen herkennen dan vooral een veilig klinkend antwoord.

Deelvraag A moet vragen naar de beste aangepaste prompt/invoer.

Gebruik dus:

`Welke invoer kan [naam] het best aan KletsGPT geven?`

De antwoordopties moeten concrete prompts zijn. Alle afleiders moeten plausibel zijn. Vermijd belachelijk eenvoudige afleiders zoals:

- het onderwerp helemaal weghalen;
- de opdracht aan AI weghalen;
- “meer persoonlijke informatie toevoegen zodat AI beter helpt”.

Deelvraag B blijft gericht op controle van AI-output. De afleiders moeten lijken op onvolledige of schijnbare controles, niet op duidelijk domme keuzes.

Sterke afleiderstypen:

- alleen bronnaam googelen;
- dezelfde AI om bevestiging of een link vragen;
- vertrouwen op een precies percentage;
- de bronnaam weghalen maar de claim houden;
- vertrouwen op nette of logische zinnen;
- een langere bronvermelding laten maken.

---

# Variant 1 — Leerjaar 1 VMBO

## Metadata

- Assessment: `lj1-vmbo`
- Item-id: `lj1v-vraag9-ai-workstuk-v4`
- Titel: `AI gebruiken voor je werkstuk`
- Niveau: basis
- Taalniveau: eenvoudig
- PrimarySubgoal: `21D`

## Instructie boven de mock-up

Sanne gebruikt KletsGPT voor haar werkstuk. Bekijk de chat.

## Chatmock-up

### Blauwe leerlingbubbel rechts

Maak mijn tekst beter.

Ik ben Sanne de Jong en ik zit in klas 1B op het Citadel College.

Mijn tekst:
Veel brugklassers slapen slecht door hun telefoon.

### Witte/lichtgrijze KletsGPT-bubbel links

Je kunt schrijven:

Volgens het rapport `Brugklassers en slaap 2024` slaapt 62% van de brugklassers te weinig door telefoongebruik. Daarom is het slim om je telefoon een uur voor het slapen weg te leggen.

## Deelvraag A

### Vraagtekst

Welke invoer kan Sanne het best aan KletsGPT geven?

### Vraagtype

Single choice.

### Antwoordopties

- id: `best_less_identifying_prompt`
  - tekst: `Maak mijn tekst duidelijker voor een werkstuk: Veel brugklassers slapen slecht door hun telefoon.`
  - correct: true

- id: `class_context_unneeded`
  - tekst: `Ik zit in klas 1B en maak een werkstuk. Maak deze tekst duidelijker: Veel brugklassers slapen slecht door hun telefoon.`
  - correct: false
  - errorCategory: `unnecessary_identifying_context`

- id: `ai_writes_new_text`
  - tekst: `Schrijf een betere tekst over brugklassers en slapen.`
  - correct: false
  - errorCategory: `ai_generates_content_instead_of_improving_given_text`

- id: `classmate_example`
  - tekst: `Maak mijn tekst beter en gebruik een voorbeeld van iemand uit mijn klas die vaak moe is door haar telefoon.`
  - correct: false
  - errorCategory: `adds_unnecessary_personal_context_about_other`

- id: `unknown`
  - tekst: `Ik weet het niet.`
  - correct: false
  - unknown: true
  - exclusive: true

### Scoring deelvraag A

- 0,5 punt voor `best_less_identifying_prompt`
- 0 punten voor alle andere opties

## Deelvraag B

### Vraagtekst

Wat doet Sanne het best met het antwoord van KletsGPT?

### Vraagtype

Single choice.

### Antwoordopties

- id: `check_source_and_number`
  - tekst: `Ze zoekt of het rapport bestaat en of het percentage daar echt in staat.`
  - correct: true

- id: `ask_kletsgpt_for_link`
  - tekst: `Ze vraagt KletsGPT om een link naar het rapport en gebruikt het als er een link verschijnt.`
  - correct: false
  - errorCategory: `same_ai_as_verification`

- id: `remove_source_keep_percentage`
  - tekst: `Ze haalt alleen de naam van het rapport weg, maar laat het percentage staan.`
  - correct: false
  - errorCategory: `unverified_number_used`

- id: `check_if_logical`
  - tekst: `Ze controleert of de tekst logisch klinkt en past bij haar werkstuk.`
  - correct: false
  - errorCategory: `style_or_logic_confused_with_accuracy`

- id: `unknown`
  - tekst: `Ik weet het niet.`
  - correct: false
  - unknown: true
  - exclusive: true

### Scoring deelvraag B

- 0,5 punt voor `check_source_and_number`
- 0 punten voor alle andere opties

---

# Variant 2 — Leerjaar 1 HAVO/VWO

## Metadata

- Assessment: `lj1-hv`
- Item-id: `lj1h-vraag9-ai-presentatie-v4`
- Titel: `AI gebruiken voor een presentatie`
- Niveau: basis+
- PrimarySubgoal: `21D`

## Instructie boven de mock-up

Milan gebruikt KletsGPT voor een presentatie. Bekijk de chat.

## Chatmock-up

### Blauwe leerlingbubbel rechts

Help mijn tekst voor een presentatie verbeteren.

Ik ben Milan Verbeek uit 1H2. Onze klas doet een project over energiedrank.

Mijn tekst:
Energiedrank is populair onder jongeren.

### Witte/lichtgrijze KletsGPT-bubbel links

Je kunt schrijven:

Volgens het onderzoek `Jongeren en Energiedrank 2025` drinkt 41% van de brugklassers elke week energiedrank. Daardoor kunnen leerlingen zich soms minder goed concentreren.

## Deelvraag A

### Vraagtekst

Welke invoer kan Milan het best aan KletsGPT geven?

### Antwoordopties

- id: `best_presentation_prompt`
  - tekst: `Verbeter deze tekst voor een presentatie: Energiedrank is populair onder jongeren.`
  - correct: true

- id: `class_project_context`
  - tekst: `Ik zit in 1H2 en onze klas doet een project over energiedrank. Verbeter deze tekst: Energiedrank is populair onder jongeren.`
  - correct: false
  - errorCategory: `unnecessary_identifying_context`

- id: `one_sided_prompt`
  - tekst: `Maak een sterke tekst over waarom energiedrank slecht is voor jongeren.`
  - correct: false
  - errorCategory: `prompt_steers_to_one_sided_claim`

- id: `classmate_examples`
  - tekst: `Verbeter mijn tekst en voeg een voorbeeld toe van leerlingen uit mijn klas die energiedrank drinken.`
  - correct: false
  - errorCategory: `adds_unnecessary_personal_context_about_others`

- id: `unknown`
  - tekst: `Ik weet het niet.`
  - correct: false
  - unknown: true
  - exclusive: true

### Scoring deelvraag A

- 0,5 punt voor `best_presentation_prompt`
- 0 punten voor alle andere opties

## Deelvraag B

### Vraagtekst

Wat doet Milan het best met het antwoord van KletsGPT?

### Antwoordopties

- id: `find_source_and_check_claim`
  - tekst: `Hij zoekt de bron en controleert of die dit percentage echt ondersteunt.`
  - correct: true

- id: `source_name_only`
  - tekst: `Hij gebruikt het percentage als hij dezelfde bronnaam ook op internet vindt.`
  - correct: false
  - errorCategory: `source_name_confused_with_claim_support`

- id: `more_sources_official_name`
  - tekst: `Hij vraagt KletsGPT om nog twee bronnen en kiest de bron die het meest officieel klinkt.`
  - correct: false
  - errorCategory: `source_appearance_confused_with_quality`

- id: `precise_number_trust`
  - tekst: `Hij gebruikt het percentage omdat een precies getal meestal uit onderzoek komt.`
  - correct: false
  - errorCategory: `specific_number_confused_with_accuracy`

- id: `unknown`
  - tekst: `Ik weet het niet.`
  - correct: false
  - unknown: true
  - exclusive: true

### Scoring deelvraag B

- 0,5 punt voor `find_source_and_check_claim`
- 0 punten voor alle andere opties

---

# Variant 3 — Leerjaar 3 VMBO

## Metadata

- Assessment: `lj3-vmbo`
- Item-id: `lj3v-vraag9-ai-stagebrief-v4`
- Titel: `AI gebruiken voor een stagebrief`
- Niveau: midden
- PrimarySubgoal: `21D`

## Instructie boven de mock-up

Noor gebruikt KletsGPT om een stagebrief te verbeteren. Bekijk de chat.

## Chatmock-up

### Blauwe leerlingbubbel rechts

Verbeter mijn stagebrief.

Noor Peters
Lijsterstraat 14
6511 AB Nijmegen
06-18473291

Ik wil stage lopen bij een dierenwinkel, omdat ik goed met dieren kan omgaan.

### Witte/lichtgrijze KletsGPT-bubbel links

Je kunt schrijven:

Volgens `StageMonitor Jongeren 2025` vindt 78% van de stagebedrijven motivatie belangrijker dan ervaring. Daarom kun je het best duidelijk uitleggen waarom je deze stageplek kiest.

## Deelvraag A

### Vraagtekst

Welke tekst kan Noor het best aan KletsGPT geven om haar brief te laten verbeteren?

### Antwoordopties

- id: `best_stage_prompt_no_contact`
  - tekst: `Verbeter deze stagebrief: Ik wil stage lopen bij een dierenwinkel, omdat ik goed met dieren kan omgaan.`
  - correct: true

- id: `contact_details_included`
  - tekst: `Verbeter mijn stagebrief. Noor Peters, Lijsterstraat 14, 06-18473291. Ik wil stage lopen bij een dierenwinkel.`
  - correct: false
  - errorCategory: `contact_details_unnecessary_for_ai_input`

- id: `ai_invents_motivation`
  - tekst: `Maak een stagebrief voor een dierenwinkel. Verzin zelf een goede motivatie.`
  - correct: false
  - errorCategory: `ai_generates_personal_motivation`

- id: `ask_for_extra_numbers`
  - tekst: `Verbeter mijn stagebrief en maak hem extra overtuigend met cijfers over stages.`
  - correct: false
  - errorCategory: `prompts_ai_for_unverified_statistics`

- id: `unknown`
  - tekst: `Ik weet het niet.`
  - correct: false
  - unknown: true
  - exclusive: true

### Scoring deelvraag A

- 0,5 punt voor `best_stage_prompt_no_contact`
- 0 punten voor alle andere opties

## Deelvraag B

### Vraagtekst

Wat doet Noor het best met de zin over `StageMonitor Jongeren 2025`?

### Antwoordopties

- id: `check_stage_source_and_claim`
  - tekst: `Ze controleert of de bron bestaat en of de uitspraak daarin staat.`
  - correct: true

- id: `source_name_found_only`
  - tekst: `Ze gebruikt de zin als ze de naam StageMonitor Jongeren 2025 online terugvindt.`
  - correct: false
  - errorCategory: `source_name_confused_with_claim_support`

- id: `remove_source_keep_percentage`
  - tekst: `Ze laat het percentage staan, maar haalt de bronnaam weg.`
  - correct: false
  - errorCategory: `unverified_number_used`

- id: `make_more_businesslike`
  - tekst: `Ze vraagt KletsGPT om de zin zakelijker te maken.`
  - correct: false
  - errorCategory: `style_confused_with_accuracy`

- id: `unknown`
  - tekst: `Ik weet het niet.`
  - correct: false
  - unknown: true
  - exclusive: true

### Scoring deelvraag B

- 0,5 punt voor `check_stage_source_and_claim`
- 0 punten voor alle andere opties

---

# Variant 4 — Leerjaar 3 HAVO/VWO

## Metadata

- Assessment: `lj3-hv`
- Item-id: `lj3h-vraag9-ai-betoog-v4`
- Titel: `AI gebruiken voor een betoog`
- Niveau: hoger
- PrimarySubgoal: `21D`

## Instructie boven de mock-up

Sara gebruikt KletsGPT voor een betoog over telefoons in de klas. Bekijk de chat.

## Chatmock-up

### Blauwe leerlingbubbel rechts

Maak van deze informatie een sterke alinea voor mijn betoog.

Ik zit in 3H2. In onze mentorklasapp schreef Sam: “Mijn cijfers zijn echt gezakt door mijn telefoon.”
Gebruik dit als voorbeeld, maar noem zijn naam niet.

### Witte/lichtgrijze KletsGPT-bubbel links

Je kunt schrijven:

Onderzoek van De Vries en Khan uit 2025 in het `European Journal of School Focus` laat zien dat leerlingen gemiddeld 18% hogere cijfers halen als telefoons uit de klas blijven. Ook uit berichten van leerlingen blijkt dat telefoons hun resultaten kunnen verslechteren.

## Deelvraag A

### Vraagtekst

Welke invoer past het best bij verantwoord gebruik van KletsGPT?

### Antwoordopties

- id: `best_no_private_messages`
  - tekst: `Maak een alinea voor een betoog over telefoons in de klas. Gebruik geen berichten van klasgenoten.`
  - correct: true

- id: `private_quote_without_name`
  - tekst: `Maak een alinea voor mijn betoog. Een klasgenoot schreef: “Mijn cijfers zijn echt gezakt door mijn telefoon.” Noem zijn naam niet.`
  - correct: false
  - errorCategory: `anonymization_overestimated`

- id: `make_private_message_general`
  - tekst: `Maak het bericht van mijn klasgenoot algemener en gebruik het als voorbeeld in mijn betoog.`
  - correct: false
  - errorCategory: `private_context_still_used`

- id: `invent_student_example`
  - tekst: `Maak een sterke alinea en verzin een leerlingvoorbeeld dat goed bij mijn standpunt past.`
  - correct: false
  - errorCategory: `fabricated_example_requested`

- id: `unknown`
  - tekst: `Ik weet het niet.`
  - correct: false
  - unknown: true
  - exclusive: true

### Scoring deelvraag A

- 0,5 punt voor `best_no_private_messages`
- 0 punten voor alle andere opties

## Deelvraag B

### Vraagtekst

Wat doet Sara het best met het onderzoek dat KletsGPT noemt?

### Antwoordopties

- id: `verify_article_supports_18_claim`
  - tekst: `Ze zoekt het artikel op en controleert of daarin echt staat dat cijfers gemiddeld 18% hoger zijn.`
  - correct: true

- id: `trust_title_and_authors`
  - tekst: `Ze gebruikt de bron als de titel en auteurs betrouwbaar klinken.`
  - correct: false
  - errorCategory: `source_label_confused_with_reliability`

- id: `longer_reference`
  - tekst: `Ze vraagt KletsGPT om een langere bronvermelding en gebruikt die in haar betoog.`
  - correct: false
  - errorCategory: `source_detail_confused_with_reliability`

- id: `remove_percentage_keep_claim`
  - tekst: `Ze haalt het percentage weg, maar gebruikt de conclusie dat telefoons cijfers verlagen.`
  - correct: false
  - errorCategory: `unverified_claim_still_used`

- id: `unknown`
  - tekst: `Ik weet het niet.`
  - correct: false
  - unknown: true
  - exclusive: true

### Scoring deelvraag B

- 0,5 punt voor `verify_article_supports_18_claim`
- 0 punten voor alle andere opties

---

# Algemene scoring vraag 9

Per variant:

- Deelvraag A: maximaal 0,5 punt
- Deelvraag B: maximaal 0,5 punt
- Totaal vraag 9: maximaal 1 punt

Gebruik option-id’s. Gebruik nooit antwoordpositie voor scoring.

Voor elke deelvraag:

- correcte optie: 0,5 punt
- incorrecte optie: 0 punten
- `Ik weet het niet`: 0 punten
- geen antwoord: 0 punten

---

# Randomisatie

- Randomiseer antwoordopties per deelvraag.
- `Ik weet het niet` blijft onderaan.
- Correctheid wordt bepaald door option-id.

---

# Logging

Log minimaal:

- assessmentId
- itemId
- itemVersion: `vraag9-ai-21d-v4`
- learnerQuestionNumber: 9
- internalSlot: `SR2`, als de structuur 7 performance tasks + 10 SR-vragen gebruikt
- primarySubgoal: `21D`
- selectedOptionId per deelvraag
- score per deelvraag
- totalScore
- unknown
- errorCategory

---

# Wat absoluut niet mag

- De AI-vraag mag niet op leerlingvraag 16 blijven staan.
- Vraag 16 mag niet worden verwijderd.
- Vraag 16 mag niet worden gearchiveerd.
- Vraag 16 mag geen AI-vraag zijn.
- Vraag 3 mag niet worden gewijzigd.
- Vraag 7 mag niet worden gewijzigd.
- De vraagvolgorde mag niet veranderen.
- Het totaal aantal vragen mag niet veranderen.
- Gebruik nergens een leerlingnummer.
- Gebruik nergens `AI-hulp` als toolnaam; gebruik overal `KletsGPT`.
- Gebruik geen groene of witte bubbels voor leerlinginvoer.

---

# Acceptatiecriteria

De wijziging is pas klaar als:

1. leerlingvraag 9 de AI-vraag over 21D toont;
2. leerlingvraag 9 niet langer de roostermail/phishingvraag toont;
3. leerlingvraag 16 weer de oude 23B-vraag toont over foto delen / toestemming / privéfoto;
4. leerlingvraag 16 geen AI-vraag meer toont;
5. vraag 3 ongewijzigd is gebleven;
6. vraag 7 ongewijzigd is gebleven;
7. de AI-tool overal `KletsGPT` heet;
8. alle leerlinginvoer in de AI-mock-up blauw en rechts uitgelijnd is;
9. alle KletsGPT-output links uitgelijnd is en visueel anders is dan leerlinginvoer;
10. er geen groene of witte leerlingbubbels meer zijn;
11. er geen leerlingnummer voorkomt;
12. deelvraag A vraagt naar de beste aangepaste invoer/prompt;
13. deelvraag B vraagt naar controle van het AI-antwoord;
14. de afleiders plausibel zijn en niet karikaturaal fout;
15. de scoring maximaal 1 punt oplevert;
16. antwoordopties via option-id’s worden gescoord;
17. antwoordopties randomiseren behalve `Ik weet het niet`;
18. `Ik weet het niet` onderaan blijft en exclusief werkt;
19. het totaal aantal vragen gelijk is gebleven.

---

# Controle na uitvoering

Geef na afloop een kort overzicht met:

- welk bestand leerlingvraag 9 bevat;
- welk bestand leerlingvraag 16 bevat;
- hoe je hebt gecontroleerd dat vraag 9 nu AI/21D is;
- hoe je hebt gecontroleerd dat vraag 16 weer 23B/foto/toestemming is;
- hoe je hebt gecontroleerd dat vraag 3 en vraag 7 niet gewijzigd zijn;
- welke tests of handmatige controles je hebt uitgevoerd;
- of het totaal aantal vragen nog gelijk is gebleven.
