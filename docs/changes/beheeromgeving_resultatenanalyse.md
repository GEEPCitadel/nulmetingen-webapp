# Codex-opdracht — beheeromgeving uitbreiden met bulk-leerlingeninvoer en resultatenanalyse

## Doel

Breid de beheeromgeving uit op twee onderdelen:

1. Leerlingen/toegangscodes sneller kunnen aanmaken door een lijst met namen te plakken.
2. Resultatenanalyse kunnen tonen per klas en per leerjaar, zonder individuele resultaten permanent op te slaan.

Houd rekening met het bestaande privacy- en meetontwerp:
- De meting is formatief-diagnostisch op klas-, leerjaar- en cohortniveau.
- Geen permanente opslag van individuele antwoorden, scores, zelfinschatting of PDF.
- Permanente resultaatopslag blijft beperkt tot aggregatiecounters.
- Namen mogen alleen worden gebruikt om toegangscodes praktisch uit te delen.
- Resultatenanalyse toont geen individuele leerlingresultaten.

---

## Deel 1 — Bulk-invoer leerlingen

### Gewenste UI

Maak in de beheeromgeving een scherm:

`Beheer > Toegangscodes > Leerlingen toevoegen`

Bovenaan staan verplichte velden:

- Leerjaar
- Niveau / meting
- Klas
- Afnamevenster
- Assessment

Daaronder staat een groot tekstveld met label:

`Naam`

Placeholder:

Plak hier leerlingnamen.
Eén leerling per regel.

Voorbeeld:
Sanne Jansen
Milan Verbeek
Noor Peters

### Functioneel gedrag

Als de beheerder een lijst met namen plakt, moet de site elke regel als aparte leerling herkennen.

Parserregels:
- Splits primair op nieuwe regels.
- Trim elke naam.
- Sla lege regels over.
- Normaliseer dubbele spaties.
- Ondersteun optioneel ook puntkomma’s als scheidingsteken.
- Geef een waarschuwing bij dubbele namen binnen dezelfde klas.
- Maak geen leerlingnummer verplicht.
- Vraag geen e-mailadres.
- Maak geen resultaatkoppeling op naam.

### Preview

Toon vóór definitief opslaan een previewtabel:

Kolommen:
- Naam
- Leerjaar
- Klas
- Niveau / meting
- Status

Knoppen:
- `Annuleren`
- `Leerlingen toevoegen en toegangscodes maken`

### Opslaan

Bij bevestiging:
- Maak voor elke naam een toegangscode.
- Koppel elke toegangscode aan:
  - assessmentId
  - classId
  - gradeLevel
  - track
  - cohort
  - assessmentWindow
- Toon daarna een code-overzicht dat printbaar en kopieerbaar is.

Code-overzicht:
- Naam
- Klas
- Toegangscode

Belangrijk:
- De naam is alleen bedoeld voor uitgifte van de code.
- Resultaten mogen later niet per naam worden getoond.
- De toegangscode mag wel aggregaatmetadata bevatten zoals klas, leerjaar en afnamevenster.

---

## Deel 2 — Resultatenanalyse

Maak een nieuw scherm:

`Beheer > Resultatenanalyse`

### Filters

Bovenaan filters:

- Afnamevenster
- Leerjaar
- Niveau / meting
- Klas
- Cohort
- Assessment

Filters moeten gecombineerd kunnen worden.

### Overzichtskaarten

Toon minimaal:

- Aantal aangemaakte codes
- Aantal gestarte afnames
- Aantal afgeronde afnames
- Afrondingspercentage
- Gemiddelde totaalscore
- Gemiddelde SR-score
- Gemiddelde PT-score
- Gemiddelde zelfinschatting
- Gemiddeld verschil tussen zelfinschatting en feitelijke score

Gebruik geen normatieve labels zoals onvoldoende, voldoende, goed, gevorderd, beheerst, geslaagd of gezakt.

### Analyse per klas

Toon een tabel per klas:

- Klas
- Leerjaar
- Niveau
- Aantal afgerond
- Gemiddelde totaalscore
- Gemiddelde SR-score
- Gemiddelde PT-score
- Gemiddelde zelfinschatting
- Gemiddelde kerndoelscore 21A
- Gemiddelde kerndoelscore 21B
- Gemiddelde kerndoelscore 21C
- Gemiddelde kerndoelscore 21D
- Gemiddelde kerndoelscore 22A
- Gemiddelde kerndoelscore 22B
- Gemiddelde kerndoelscore 23A
- Gemiddelde kerndoelscore 23B
- Gemiddelde kerndoelscore 23C

### Analyse per leerjaar

Toon dezelfde gegevens gegroepeerd per:

- leerjaar
- niveau / track
- assessmentWindow
- cohort

### Domeinvisualisatie

Voeg een eenvoudige heatmap of staafdiagram toe voor kerndoelen/subdoelen.

Rijen:
- Klassen of leerjaren

Kolommen:
- 21A, 21B, 21C, 21D, 22A, 22B, 23A, 23B, 23C

Waarden:
- gemiddelde percentage-score per groep

### Itemanalyse

Maak een aparte tab:

`Itemanalyse`

Toon per item:

- itemId
- vraagnummer
- subdoel / kerndoel
- aantal antwoorden
- correctRate
- unknownRate
- meest gekozen afleider
- distractor distribution
- eventuele harmfulOptionRate
- eventuele PT-errorcategorieën

Voeg automatische signalen toe:

- correctRate > 0.90: `mogelijk plafonditem`
- correctRate < 0.25: `mogelijk te moeilijk of onduidelijk`
- unknownRate > 0.30: `veel onzekerheid`
- harmfulOptionRate > 0.10: `risicovolle keuze vaak gekozen`

### Privacy-eisen

Resultatenanalyse mag niet tonen:
- individuele leerlingnamen met scores;
- individuele antwoordreeksen;
- individuele zelfinschattingen;
- individuele PDF’s;
- IP-adressen;
- user agents;
- browser fingerprints.

Resultatenanalyse mag wel tonen:
- aggregaten per assessmentId;
- aggregaten per classId;
- aggregaten per cohort;
- aggregaten per gradeLevel;
- aggregaten per track;
- aggregaten per assessmentWindow.

### Acceptatiecriteria

De wijziging is klaar als:

1. De beheerder leerjaar en klas apart kan selecteren.
2. De beheerder meerdere namen tegelijk in het veld `Naam` kan plakken.
3. Elke regel als aparte leerling wordt herkend.
4. Alle geplakte leerlingen in één actie aan hetzelfde leerjaar en dezelfde klas worden gekoppeld.
5. Voor elke leerling een toegangscode wordt gemaakt.
6. Er een printbaar/kopieerbaar code-overzicht is.
7. Resultatenanalyse per klas werkt.
8. Resultatenanalyse per leerjaar werkt.
9. SR-, PT-, totaalscore en zelfinschatting apart zichtbaar zijn.
10. Kerndoelscores/subdoelscores zichtbaar zijn.
11. Itemanalyse correctRate, unknownRate en afleiderverdeling toont.
12. Er geen individuele scores per leerling worden opgeslagen of getoond.
13. Bestaande aggregatiecounters blijven leidend.
14. Er geen normatieve labels worden gebruikt.
15. De bestaande afnameomgeving voor leerlingen blijft functioneel.