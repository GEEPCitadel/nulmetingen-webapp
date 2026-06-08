# Codex-opdracht — vervang vraag 3 door verbeterde phishingvraag

## Doel

Vervang **vraag 3** in de nulmeting door een verbeterde phishingvraag met een realistische e-mailmock-up.

Belangrijk:

* Pas **alleen vraag 3** aan.
* Laat **vraag 9 volledig ongemoeid**.
* Vervang vraag 9 nu niet.
* Voeg nu geen AI-vraag toe.
* Verplaats geen andere vragen.
* Wijzig de volgorde van de toets niet.
* Behoud het totaal aantal vragen op 17.

Vraag 9 wordt later apart vervangen door een AI-vraag. Daar moet in deze opdracht niets aan gebeuren.

---

## Te vervangen onderdeel

Vervang de huidige **vraag 3** door onderstaande nieuwe phishingvraag.

De nieuwe vraag 3 moet automatisch scoreerbaar blijven en mag geen open tekstvelden bevatten.

---

# Nieuwe vraag 3 — Mail over je rooster

## Metadata

* Vraagnummer: 3 van 17
* Titel: Mail over je rooster
* Kerndoel/subdoel: 23A — Veiligheid en privacy
* Type: gesloten vraag met e-mailmock-up
* Maximaal aantal punten: 3
* Scoring: automatisch
* Antwoordvorm:

  1. multiple select: kies 2 signalen
  2. single choice: kies beste vervolgstap

---

## Ontwerpprincipes

De vraag moet geen karikaturale phishingmail tonen.

Gebruik dus niet:

* extreem rare afzenders zoals `r0st3r-88xq91@mx7-info-update.net`;
* duidelijke spelfouten;
* overdreven paniektaal;
* opvallende rode waarschuwingen;
* vraagtekst die al verklapt dat de mail nep of verdacht is.

De mail moet juist realistisch en redelijk geloofwaardig lijken. Leerlingen moeten het antwoord niet eenvoudig kunnen gokken op basis van één overduidelijk signaal.

---

# E-mailmock-up

Maak een realistische Outlook-/schoolmailachtige mock-up.

Gebruik deze inhoud:

## Boven de mock-up

**Titel bij de vraag:**
Mail over je rooster

**Korte instructie:**
Sanne krijgt deze mail op haar schoolaccount.

Noem niet dat het om phishing gaat.

---

## Inhoud van de mail

**Onderwerp:**
Roosterwijziging voor morgen

**Van:**
Roosterhulp [roosterhulp@citadel-rooster.nl](mailto:roosterhulp@citadel-rooster.nl)

**Aan:**
[sanne@leerling.citadelcollege.nl](mailto:sanne@leerling.citadelcollege.nl)

**Tijd:**
Vandaag 15:42

**Mailtekst:**
Hallo Sanne,

Er is een roosterwijziging voor morgen. Controleer je rooster vandaag nog, zodat je geen lokaalwijziging mist.

Bekijk je rooster via de knop hieronder.

**Knoptekst:**
Rooster bekijken

**Zichtbare link onder de knop:**
https://citadel-rooster.nl/login

---

## Belangrijke ontwerpkeuzes voor de mock-up

De mail moet er verzorgd uitzien:

* normale witruimte;
* nette opmaak;
* geen overdreven verdachte stijl;
* geen waarschuwingstekens;
* geen rode tekst;
* geen slordige spelling;
* geen neppe hacker-uitstraling.

Het verdachte zit subtiel in:

* het domein van de afzender;
* het domein van de link;
* het feit dat de leerling via een link moet inloggen.

---

# Antwoordblok 1 — Signalen herkennen

## Vraagtekst

Waarom moet Sanne voorzichtig zijn? Kies 2.

## Vraagtype

Multiple select.

## Selectieregel

* Maximaal 2 inhoudelijke opties selecteerbaar.
* `Ik weet het niet` is exclusief.
* Als `Ik weet het niet` wordt gekozen, worden andere keuzes uitgezet.
* `Ik weet het niet` blijft altijd onderaan staan.

## Antwoordopties

Gebruik option-id’s. Correctheid mag niet afhangen van A/B/C/D.

### Opties

* id: `sender_domain`

  * tekst: De afzender gebruikt niet het bekende schooldomein.
  * correct: true

* id: `unknown_roster_site`

  * tekst: De knop gaat naar een roostersite die niet duidelijk van school is.
  * correct: true

* id: `uses_name`

  * tekst: De mail gebruikt Sanne’s naam.
  * correct: false
  * errorCategory: `personalization_confused_with_trust`

* id: `neat_layout`

  * tekst: De mail ziet er netjes uit.
  * correct: false
  * errorCategory: `appearance_confused_with_trust`

* id: `school_topic`

  * tekst: De mail gaat over haar rooster.
  * correct: false
  * errorCategory: `school_context_confused_with_trust`

* id: `unknown`

  * tekst: Ik weet het niet.
  * correct: false
  * unknown: true
  * exclusive: true

## Scoring antwoordblok 1

Maximaal 2 punten.

* 2 punten: `sender_domain` én `unknown_roster_site` gekozen.
* 1 punt: precies één correcte optie gekozen en geen incorrecte optie.
* 0 punten: alleen incorrecte opties gekozen.
* 0 punten: `unknown` gekozen.
* 0 punten: geen antwoord.

## Logging antwoordblok 1

Log minimaal:

* selectedOptionIds
* correctSelectedCount
* incorrectSelectedCount
* unknown
* errorCategory
* itemVersion

---

# Antwoordblok 2 — Veilige vervolgstap

## Vraagtekst

Wat kan Sanne nu het best doen?

## Vraagtype

Single choice.

## Antwoordopties

* id: `known_route`

  * tekst: Niet op de knop klikken en haar rooster zelf openen via de roosterapp of bekende schoolsite.
  * correct: true

* id: `reply_sender`

  * tekst: De mail beantwoorden en vragen of de link klopt.
  * correct: false
  * errorCategory: `replies_to_possible_phisher`

* id: `open_then_check`

  * tekst: De link openen en stoppen als de pagina vreemd lijkt.
  * correct: false
  * riskFlag: `clicked_unknown_login_link`

* id: `forward_class`

  * tekst: De mail doorsturen naar de klas, zodat anderen kunnen meekijken.
  * correct: false
  * riskFlag: `spreads_possible_phishing`

* id: `unknown`

  * tekst: Ik weet het niet.
  * correct: false
  * unknown: true
  * exclusive: true

## Scoring antwoordblok 2

Maximaal 1 punt.

* 1 punt: `known_route`
* 0 punten: alle andere opties
* 0 punten: geen antwoord

## Logging antwoordblok 2

Log minimaal:

* selectedOptionId
* correct
* unknown
* errorCategory
* riskFlag
* itemVersion

---

# Totale score vraag 3

Maximaal 3 punten:

| Onderdeel                  | Punten |
| -------------------------- | -----: |
| Signalen herkennen         |      2 |
| Veilige vervolgstap kiezen |      1 |
| Totaal                     |      3 |

---

# Randomisatie

Randomiseer antwoordopties binnen elk antwoordblok, behalve:

* `Ik weet het niet` blijft onderaan.
* Correctheid wordt gekoppeld aan option-id, niet aan antwoordpositie.
* De UI toont geen vaste correcte positie.

---

# Niet aanpassen

Codex mag in deze opdracht niets doen aan:

* vraag 9;
* toekomstige AI-vraag;
* vraagvolgorde;
* totaalaantal vragen;
* scorearchitectuur buiten vraag 3;
* andere phishingvragen, behalve als ze letterlijk onderdeel zijn van de huidige vraag 3-implementatie;
* rapportageteksten buiten noodzakelijke verwijzing naar gewijzigde vraag 3.

Vraag 9 blijft voorlopig staan zoals hij nu staat. Die wordt later apart vervangen.

---

# Acceptatiecriteria

De wijziging is pas klaar als:

1. vraag 3 de nieuwe phishingvraag toont;
2. vraag 3 maximaal 3 punten oplevert;
3. vraag 3 bestaat uit een realistische e-mailmock-up plus twee gesloten antwoordblokken;
4. er geen open tekstvelden zijn;
5. alle scoring automatisch gebeurt;
6. de afzender niet karikaturaal nep is;
7. de mail geen duidelijke spelfouten of overdreven phishingkenmerken bevat;
8. antwoordblok 1 maximaal twee inhoudelijke opties laat kiezen;
9. `Ik weet het niet` exclusief werkt;
10. `Ik weet het niet` onderaan blijft staan;
11. antwoorden worden beoordeeld via option-id’s;
12. antwoordopties worden gerandomiseerd, behalve `Ik weet het niet`;
13. vraag 9 niet is aangepast;
14. er geen AI-vraag is toegevoegd;
15. het totaal aantal vragen 17 blijft.
