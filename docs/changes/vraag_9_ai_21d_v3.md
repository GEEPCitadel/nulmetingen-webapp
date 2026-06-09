# Codex-opdracht — vervang vraag 9 door verbeterde 21D/AI-varianten

## Doel

Vervang vraag 9 in alle vier nulmetingen door een nieuwe vraag over 21D / AI.

Belangrijk:

* Pas alleen vraag 9 aan.
* Laat vraag 3 volledig ongemoeid.
* Wijzig geen andere vragen.
* Verplaats geen vragen.
* Behoud het totaal aantal vragen.
* Gebruik per meting een passende variant.
* De vraag blijft volledig automatisch scoreerbaar.
* Gebruik geen open tekstvelden.
* Gebruik een realistische AI-chatmock-up.
* Gebruik nergens een leerlingnummer. Dat is geen realistisch gegeven om in een AI-tool in te voeren.
* Correctheid mag nooit afhangen van A/B/C/D-positie.
* Randomiseer antwoordopties per deelvraag, behalve `Ik weet het niet`, die onderaan blijft.

## Algemene structuur vraag 9

Elke variant van vraag 9 bestaat uit:

1. Een AI-chatmock-up.
2. Deelvraag A: wat moet de leerling aanpassen, weghalen of anders formuleren in de prompt?
3. Deelvraag B: wat moet de leerling controleren in de AI-output?

## Algemene metadata

* Vraagnummer: 9 van 17
* Kerndoel/subdoel: 21D — AI
* Vraagtype: twee single-choice deelvragen
* Max. punten: 1
* Deelvraag A: 0,5 punt
* Deelvraag B: 0,5 punt
* `Ik weet het niet`: aanwezig, exclusief, altijd onderaan
* Open tekstvelden: nee

## Te vervangen

Vervang de huidige vraag 9-items die gaan over foto’s, delen, privéfoto’s of toestemming.

Archiveer oude vraag 9-items als:

* `archived-vraag9-23b-photo-consent`

Laat ze niet actief zichtbaar in de toets.

---

# Variant 1 — Leerjaar 1 VMBO

## Metadata

* Assessment: `lj1-vmbo`
* Item-id: `lj1v-vraag9-ai-workstuk-v3`
* Titel: AI gebruiken voor je werkstuk
* Niveau: basis
* Taalniveau: eenvoudig

## Leerlinginstructie

Sanne gebruikt AI-hulp voor haar werkstuk. Bekijk de chat.

Noem niet dat het om privacy, persoonsgegevens, broncontrole of hallucinatie gaat.

## AI-chatmock-up

Toolnaam: `AI-hulp`

### Bericht van Sanne

Maak mijn tekst beter.

Ik ben Sanne de Jong en ik zit in klas 1B op het Citadel College.

Mijn tekst:
Veel brugklassers slapen slecht door hun telefoon.

### Antwoord van AI-hulp

Je kunt schrijven:

Volgens het rapport `Brugklassers en slaap 2024` slaapt 62% van de brugklassers te weinig door telefoongebruik. Daarom is het slim om je telefoon een uur voor het slapen weg te leggen.

## Deelvraag A

### Vraagtekst

Wat kan Sanne beter aanpassen voordat ze dit aan AI geeft?

### Antwoordopties

* id: `make_less_personal`

  * tekst: Haar volledige naam, klas en school algemener maken.
  * correct: true
  * errorCategory: null

* id: `remove_topic`

  * tekst: Het onderwerp van haar werkstuk weghalen.
  * correct: false
  * errorCategory: `removes_needed_context`

* id: `remove_instruction`

  * tekst: De vraag om haar tekst beter te maken weghalen.
  * correct: false
  * errorCategory: `removes_task_instruction`

* id: `add_more_details`

  * tekst: Meer persoonlijke informatie toevoegen, zodat AI beter kan helpen.
  * correct: false
  * errorCategory: `personal_data_unnecessary`

* id: `unknown`

  * tekst: Ik weet het niet.
  * correct: false
  * unknown: true
  * exclusive: true

### Scoring deelvraag A

* 0,5 punt voor `make_less_personal`
* 0 punten voor alle andere opties

## Deelvraag B

### Vraagtekst

Wat moet Sanne controleren voordat ze het AI-antwoord gebruikt?

### Antwoordopties

* id: `check_report_and_number`

  * tekst: Of het rapport en het percentage echt kloppen.
  * correct: true

* id: `ask_ai_sure`

  * tekst: Of dezelfde AI zegt dat het antwoord zeker klopt.
  * correct: false
  * errorCategory: `same_ai_as_verification`

* id: `check_neat_sentences`

  * tekst: Of de zinnen netjes genoeg klinken.
  * correct: false
  * errorCategory: `style_confused_with_accuracy`

* id: `use_without_number`

  * tekst: Het percentage weghalen en de rest meteen gebruiken.
  * correct: false
  * errorCategory: `unverified_claim_still_used`

* id: `unknown`

  * tekst: Ik weet het niet.
  * correct: false
  * unknown: true
  * exclusive: true

### Scoring deelvraag B

* 0,5 punt voor `check_report_and_number`
* 0 punten voor alle andere opties

---

# Variant 2 — Leerjaar 1 HAVO/VWO

## Metadata

* Assessment: `lj1-hv`
* Item-id: `lj1h-vraag9-ai-presentatie-v3`
* Titel: AI gebruiken voor een presentatie
* Niveau: basis+
* Taalniveau: normaal

## Leerlinginstructie

Milan gebruikt AI-hulp voor een presentatie. Bekijk de chat.

## AI-chatmock-up

Toolnaam: `AI-hulp`

### Bericht van Milan

Help mijn tekst voor een presentatie verbeteren.

Ik ben Milan Verbeek uit 1H2. Onze klas doet een project over energiedrank.

Mijn tekst:
Energiedrank is populair onder jongeren.

### Antwoord van AI-hulp

Je kunt schrijven:

Volgens het onderzoek `Jongeren en Energiedrank 2025` drinkt 41% van de brugklassers elke week energiedrank. Daardoor kunnen leerlingen zich soms minder goed concentreren.

## Deelvraag A

### Vraagtekst

Wat kan Milan beter aanpassen voordat hij dit aan AI geeft?

### Antwoordopties

* id: `make_prompt_less_identifying`

  * tekst: Zijn volledige naam en klas algemener maken.
  * correct: true

* id: `remove_topic_energy_drink`

  * tekst: Het onderwerp energiedrank weghalen.
  * correct: false
  * errorCategory: `removes_needed_context`

* id: `add_personal_examples`

  * tekst: Namen van klasgenoten toevoegen om het voorbeeld duidelijker te maken.
  * correct: false
  * errorCategory: `personal_data_unnecessary`

* id: `remove_request_to_improve`

  * tekst: De vraag om zijn tekst te verbeteren weghalen.
  * correct: false
  * errorCategory: `removes_task_instruction`

* id: `unknown`

  * tekst: Ik weet het niet.
  * correct: false
  * unknown: true
  * exclusive: true

### Scoring deelvraag A

* 0,5 punt voor `make_prompt_less_identifying`
* 0 punten voor alle andere opties

## Deelvraag B

### Vraagtekst

Wat is de beste controle voordat Milan het AI-antwoord in zijn presentatie zet?

### Antwoordopties

* id: `find_source_and_compare`

  * tekst: De bron zoeken en controleren of die dit percentage echt ondersteunt.
  * correct: true

* id: `ask_ai_for_same_source`

  * tekst: Dezelfde AI vragen om de bron nog een keer te noemen.
  * correct: false
  * errorCategory: `same_ai_as_verification`

* id: `trust_specific_number`

  * tekst: Het percentage gebruiken omdat een precies getal betrouwbaar klinkt.
  * correct: false
  * errorCategory: `specific_number_confused_with_accuracy`

* id: `cite_ai_only`

  * tekst: Alleen `AI-hulp` als bron noemen.
  * correct: false
  * errorCategory: `ai_tool_confused_with_source`

* id: `unknown`

  * tekst: Ik weet het niet.
  * correct: false
  * unknown: true
  * exclusive: true

### Scoring deelvraag B

* 0,5 punt voor `find_source_and_compare`
* 0 punten voor alle andere opties

---

# Variant 3 — Leerjaar 3 VMBO

## Metadata

* Assessment: `lj3-vmbo`
* Item-id: `lj3v-vraag9-ai-stagebrief-v3`
* Titel: AI gebruiken voor een stagebrief
* Niveau: midden
* Taalniveau: vmbo 3

## Leerlinginstructie

Noor gebruikt AI-hulp om een stagebrief te verbeteren. Bekijk de chat.

## AI-chatmock-up

Toolnaam: `AI-hulp`

### Bericht van Noor

Verbeter mijn stagebrief.

Noor Peters
Lijsterstraat 14
6511 AB Nijmegen
06-18473291

Ik wil stage lopen bij een dierenwinkel, omdat ik goed met dieren kan omgaan.

### Antwoord van AI-hulp

Je kunt schrijven:

Volgens `StageMonitor Jongeren 2025` vindt 78% van de stagebedrijven motivatie belangrijker dan ervaring. Daarom kun je het best duidelijk uitleggen waarom je deze stageplek kiest.

## Deelvraag A

### Vraagtekst

Wat kan Noor beter eerst uit haar tekst halen?

### Antwoordopties

* id: `remove_contact_details`

  * tekst: Adres en telefoonnummer.
  * correct: true

* id: `remove_stage_goal`

  * tekst: Dat ze stage wil lopen bij een dierenwinkel.
  * correct: false
  * errorCategory: `removes_needed_context`

* id: `remove_motivation`

  * tekst: Waarom ze met dieren wil werken.
  * correct: false
  * errorCategory: `removes_useful_context`

* id: `add_more_private_info`

  * tekst: Extra persoonlijke gegevens, zodat de brief persoonlijker wordt.
  * correct: false
  * errorCategory: `personal_data_unnecessary`

* id: `unknown`

  * tekst: Ik weet het niet.
  * correct: false
  * unknown: true
  * exclusive: true

### Scoring deelvraag A

* 0,5 punt voor `remove_contact_details`
* 0 punten voor alle andere opties

## Deelvraag B

### Vraagtekst

Wat moet Noor doen met de zin over `StageMonitor Jongeren 2025`?

### Antwoordopties

* id: `check_source_before_using`

  * tekst: Controleren of de bron bestaat en de uitspraak echt ondersteunt.
  * correct: true

* id: `use_because_practical`

  * tekst: Gebruiken, want het advies klinkt praktisch.
  * correct: false
  * errorCategory: `usefulness_confused_with_accuracy`

* id: `ask_ai_to_make_confident`

  * tekst: AI vragen om de zin zekerder te formuleren.
  * correct: false
  * errorCategory: `style_confused_with_accuracy`

* id: `remove_source_keep_number`

  * tekst: De bron weghalen maar het percentage laten staan.
  * correct: false
  * errorCategory: `unverified_number_used`

* id: `unknown`

  * tekst: Ik weet het niet.
  * correct: false
  * unknown: true
  * exclusive: true

### Scoring deelvraag B

* 0,5 punt voor `check_source_before_using`
* 0 punten voor alle andere opties

---

# Variant 4 — Leerjaar 3 HAVO/VWO

## Metadata

* Assessment: `lj3-hv`
* Item-id: `lj3h-vraag9-ai-betoog-v3`
* Titel: AI gebruiken voor een betoog
* Niveau: hoger
* Taalniveau: havo/vwo 3

## Leerlinginstructie

Sara gebruikt AI-hulp voor een betoog over telefoons in de klas. Bekijk de chat.

## AI-chatmock-up

Toolnaam: `AI-hulp`

### Bericht van Sara

Maak van deze informatie een sterke alinea voor mijn betoog.

Ik zit in 3H2. In onze mentorklasapp schreef Sam: “Mijn cijfers zijn echt gezakt door mijn telefoon.”
Gebruik dit als voorbeeld, maar noem zijn naam niet.

### Antwoord van AI-hulp

Je kunt schrijven:

Onderzoek van De Vries en Khan uit 2025 in het `European Journal of School Focus` laat zien dat leerlingen gemiddeld 18% hogere cijfers halen als telefoons uit de klas blijven. Ook uit berichten van leerlingen blijkt dat telefoons hun resultaten kunnen verslechteren.

## Deelvraag A

### Vraagtekst

Wat is het belangrijkste probleem in Sara’s bericht aan AI?

### Antwoordopties

* id: `private_chat_as_input`

  * tekst: Ze gebruikt een privébericht van een klasgenoot als invoer.
  * correct: true

* id: `topic_too_clear`

  * tekst: Het onderwerp telefoons in de klas is te duidelijk.
  * correct: false
  * errorCategory: `confuses_topic_with_privacy_risk`

* id: `asks_for_argument`

  * tekst: Ze vraagt AI om een alinea voor een betoog te maken.
  * correct: false
  * errorCategory: `confuses_task_with_privacy_risk`

* id: `removed_name_enough`

  * tekst: Ze zegt dat AI Sams naam niet moet noemen; daarmee is het probleem opgelost.
  * correct: false
  * errorCategory: `anonymization_overestimated`

* id: `unknown`

  * tekst: Ik weet het niet.
  * correct: false
  * unknown: true
  * exclusive: true

### Scoring deelvraag A

* 0,5 punt voor `private_chat_as_input`
* 0 punten voor alle andere opties

## Deelvraag B

### Vraagtekst

Wat is de sterkste controle op het AI-antwoord?

### Antwoordopties

* id: `verify_article_supports_claim`

  * tekst: Het artikel zelf terugvinden en controleren of het de 18%-claim echt ondersteunt.
  * correct: true

* id: `trust_journal_name`

  * tekst: De bron gebruiken omdat de tijdschriftnaam wetenschappelijk klinkt.
  * correct: false
  * errorCategory: `source_label_confused_with_reliability`

* id: `ask_ai_more_sources`

  * tekst: AI vragen om meer bronnen en de langste bronvermelding kiezen.
  * correct: false
  * errorCategory: `source_quantity_confused_with_quality`

* id: `remove_percentage_keep_claim`

  * tekst: Het percentage weghalen en de algemene conclusie zonder controle gebruiken.
  * correct: false
  * errorCategory: `unverified_claim_still_used`

* id: `unknown`

  * tekst: Ik weet het niet.
  * correct: false
  * unknown: true
  * exclusive: true

### Scoring deelvraag B

* 0,5 punt voor `verify_article_supports_claim`
* 0 punten voor alle andere opties

---

# Algemene scoring vraag 9

Per meting:

* Deelvraag A: 0,5 punt
* Deelvraag B: 0,5 punt
* Totaal vraag 9: 1 punt

## Scorelogica

Gebruik option-id’s, niet antwoordposities.

Voor elke deelvraag:

* correcte optie: 0,5 punt
* incorrecte optie: 0 punten
* `unknown`: 0 punten
* geen antwoord: 0 punten

## Logging

Log minimaal:

* assessmentId
* itemId
* itemVersion: `vraag9-ai-21d-v3`
* questionNumber: 9
* primarySubgoal: `21D`
* selectedOptionId per deelvraag
* score per deelvraag
* totalScore
* unknown
* errorCategory

## Randomisatie

* Randomiseer antwoordopties per deelvraag.
* `Ik weet het niet` blijft onderaan.
* Correctheid wordt bepaald door option-id.

## UI-eisen

* Toon de AI-chat als visuele mock-up.
* Gebruik duidelijke labels: `Leerling` en `AI-hulp`.
* Gebruik geen echte AI-merknaam.
* Gebruik geen leerlingnummer in de prompt of antwoordopties.
* Gebruik geen waarschuwingen, rode markeringen of labels die het antwoord verklappen.
* Noem in de leerlinginstructie niet de woorden `privacyrisico`, `hallucinatie`, `broncontrole` of `persoonsgegevens`.
* De AI-output moet plausibel klinken, niet absurd.
* De bronvermeldingen zijn fictief en mogen niet naar echte externe sites linken.

## Niet aanpassen

Codex mag niets wijzigen aan:

* vraag 3;
* andere vragen dan vraag 9;
* vraagvolgorde;
* totaal aantal vragen;
* bestaande scorearchitectuur buiten vraag 9;
* toekomstige revisies van vraag 3 of phishing.

## Acceptatiecriteria

De wijziging is klaar als:

1. vraag 9 in alle vier metingen is vervangen door een 21D/AI-vraag;
2. geen enkele variant een leerlingnummer bevat;
3. elke variant een AI-chatmock-up toont;
4. elke variant twee single-choice deelvragen bevat;
5. elke variant maximaal 1 punt oplevert;
6. deelvraag A maximaal 0,5 punt oplevert;
7. deelvraag B maximaal 0,5 punt oplevert;
8. `Ik weet het niet` exclusief werkt en onderaan blijft;
9. antwoordopties via option-id’s worden gescoord;
10. antwoordopties randomiseren behalve `Ik weet het niet`;
11. de oude foto-/toestemmingsvraag 9 niet meer actief zichtbaar is;
12. vraag 3 niet is aangepast;
13. geen andere vragen zijn gewijzigd;
14. het totaal aantal vragen gelijk blijft.
