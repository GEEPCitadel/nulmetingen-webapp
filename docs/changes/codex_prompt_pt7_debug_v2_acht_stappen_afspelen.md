# Codex-opdracht — PT7 blokprogrammeren debugtaak verbeteren

## Doel

Pas de bestaande PT7-taak **Blokprogrammeren** aan naar aanleiding van de huidige implementatie.

De richting is goed: leerlingen krijgen al bestaande code met fouten en moeten debuggen. De huidige versie is echter nog te kort, het visuele doel is onvoldoende duidelijk, de instructieregel staat op de verkeerde plek, blokken lijken niet vrij verwijderbaar/toevoegbaar en het afspelen verloopt niet zichtbaar genoeg.

Voer deze wijziging primair door voor **leerjaar 1 vmbo**. Als onderdelen in een gedeelde component zitten, pas die gedeelde component dan zo aan dat de andere metingen er op passende wijze van profiteren zonder hun inhoudelijke niveau te verlagen.

---

## Scope

Wijzig alleen PT7 / Blokprogrammeren en de daarvoor noodzakelijke gedeelde componenten.

Niet aanpassen:

- selected-response-vragen;
- PT1 t/m PT6;
- PT8;
- algemene scorearchitectuur buiten PT7;
- rapportage buiten noodzakelijke PT7-labels;
- vraagvolgorde;
- totaal aantal vragen.

PT7 blijft:

- vraag/performance task 6 of 7 zoals nu in de afnameflow zichtbaar;
- gekoppeld aan kerndoel/subdoel **22B — Programmeren / computational thinking**;
- maximaal **4 punten**;
- automatisch scoreerbaar;
- zonder open tekstvelden.

---

## Probleem in de huidige vmbo1-versie

In de huidige implementatie staat op vmbo1 ongeveer dit:

- gegeven code op het werkblad heeft maar **4 blokken**;
- het doel wordt getoond als compacte tekst: `DOELSTART -> -> rechts "Klaar"`;
- de pijlen zijn niet duidelijk genoeg;
- de tekst `Gekozen foutblokken: 0/2. Klik een codeblok...` staat in hetzelfde groen gearceerde doelvak;
- het lijkt alsof leerlingen geen blokken vrij kunnen verwijderen of toevoegen;
- bij klikken op `Afspelen` lijkt de uitvoering te snel of direct afgerond.

Dit moet worden verbeterd.

---

# 1. Vmbo1: maak de gegeven code 8 stappen/blokken lang

## Nieuwe vmbo1-opdracht

Gebruik voor leerjaar 1 vmbo een gegeven programma met **8 blokken inclusief startblok**.

De leerling moet nog steeds precies **2 fouten** vinden, aanwijzen en herstellen.

### Leerlinginstructie boven de taak

Gebruik korte taal:

```text
Kijk naar DOEL. Er zijn 2 fouten. Tik ze aan. Maak de code goed. Klik Afspelen.
```

### Visueel doel

Toon het doel in een aparte doelkaart.

Belangrijk:

- Alleen het doel staat in het groen/lichtgroen gearceerde doelvak.
- Gebruik echte pijlen/iconen, niet `->`.
- Gebruik de roze huisstijlkleur voor de pijlen.
- Gebruik voldoende tussenruimte tussen de stappen.
- Zet de stappen op één duidelijke regel als dat past; anders in een horizontale stapbalk.
- Gebruik niet het woord `rechts` als tekst waar een pijl duidelijker is.

Doel voor vmbo1:

```text
DOEL
START  →  →  ↱  →  ⏸  ↰  💬 "Klaar"
```

Interpretatie:

1. start
2. 1 stap vooruit
3. 1 stap vooruit
4. draai naar rechts
5. 1 stap vooruit
6. wacht 1 seconde
7. draai naar links
8. zeg "Klaar"

### Visuele stijl doelkaart

Gebruik bijvoorbeeld:

- achtergrond: bestaande lichtgroene/lichtturquoise doelvlak;
- label `DOEL` links vet;
- stappen als losse pillen of duidelijke symbolen;
- pijlen in roze huisstijlkleur, bijvoorbeeld dezelfde roze tint als de pijl rechts van de knop `Afspelen`;
- tekstballon als `💬 "Klaar"` of een visueel tekstballon-element.

De doelkaart mag dus niet meer tonen:

```text
DOELSTART -> -> rechts "Klaar"Gekozen foutblokken: 0/2...
```

---

# 2. Vmbo1: nieuwe gegeven code met precies 2 fouten

## Bestaande code op het werkblad

Plaats deze code standaard op het werkblad:

```text
bij start
1 stap vooruit
1 stap vooruit
draai naar links
1 stap vooruit
wacht 1 seconde
draai naar links
zeg "Hoi"
```

Deze code heeft precies twee inhoudelijke fouten:

1. `draai naar links` op positie 4 moet `draai naar rechts` worden.
2. `zeg "Hoi"` op positie 8 moet `zeg "Klaar"` worden.

## Correcte eindcode

```text
bij start
1 stap vooruit
1 stap vooruit
draai naar rechts
1 stap vooruit
wacht 1 seconde
draai naar links
zeg "Klaar"
```

## Foutblokken die leerling moet aanwijzen

Gebruik vaste ids. Voorbeeld:

```text
wrongBlockIds:
- vmbo1_step4_turn_left_should_be_right
- vmbo1_step8_say_hoi_should_be_klaar
```

Correctheid mag nooit afhangen van labelpositie of volgorde in de blokkenbak.

---

# 3. Vmbo1: grote realistische blokkenbak behouden

De blokkenbak moet groter blijven, passend bij Delightex/Scratch-achtige omgevingen. Maak de taak niet kunstmatig klein.

Gebruik minimaal deze categorieën en blokken.

## Gebeurtenissen

```text
bij start
als Bizzy wordt aangeraakt
als spatie wordt ingedrukt
```

## Beweging

```text
1 stap vooruit
2 stappen vooruit
3 stappen vooruit
1 stap achteruit
2 stappen achteruit
draai naar rechts
draai naar links
```

## Besturing

```text
wacht 1 seconde
herhaal 2 keer
herhaal 3 keer
```

## Uiterlijk

```text
zeg "Hoi"
zeg "Klaar"
zeg "Stop"
```

Als de huidige implementatie sommige categorieën nog niet ondersteunt, implementeer alleen wat nodig is om deze taak correct te tonen en te scoren, maar behoud het principe: de blokkenbak is realistisch groot en bevat plausibele afleiders.

---

# 4. Zet de instructie over gekozen foutblokken buiten de doelkaart

De tekst die nu in het groen gearceerde doelvak staat, moet worden verplaatst naar een aparte regel onder de doelkaart.

## Gewenste structuur

```text
[groen/lichtgroen doelvak]
DOEL   START  →  →  ↱  →  ⏸  ↰  💬 "Klaar"

[losse instructieregel daaronder, niet groen gearceerd]
Gekozen foutblokken: 0/2. Klik een codeblok en kies daarna een vervangblok uit de blokkenbak.
```

Voor vmbo1 mag de instructieregel korter:

```text
Gekozen foutblokken: 0/2. Tik een fout blok aan. Kies daarna het goede blok.
```

Belangrijk:

- De doelkaart is alleen voor het visuele doel.
- De voortgang/instructie over foutblokken staat los.
- De instructie mag niet tegen het doel aangeplakt staan.
- Gebruik voldoende witruimte.

---

# 5. Blokken moeten vrij verwijderbaar en toevoegbaar zijn

Controleer de bestaande block programming component. In de huidige versie lijkt het alsof leerlingen de gegeven blokken niet echt kunnen verwijderen of nieuwe blokken kunnen toevoegen.

Dit moet werken:

## Verwijderen

Leerlingen moeten elk codeblok op het werkblad kunnen verwijderen, behalve eventueel het verplichte startblok als het technisch nodig is.

Ondersteun minstens één duidelijke verwijderactie:

- sleep blok naar prullenbak;
- of klik blok en kies `Verwijderen`;
- of toon een kleine `x`/prullenbak bij geselecteerd blok.

Voor vmbo1 moet dit zichtbaar en begrijpelijk zijn.

## Toevoegen

Leerlingen moeten blokken uit de blokkenbak kunnen toevoegen aan het werkblad.

Dit moet kunnen:

- blok uit blokkenbak naar werkblad slepen;
- blok tussen bestaande blokken plaatsen;
- blok onderaan toevoegen;
- toegevoegd blok daarna weer verwijderen;
- toegevoegd blok eventueel vervangen door een ander blok.

## Vervangen

De bestaande debugflow mag blijven:

1. leerling klikt/tikt een fout codeblok aan;
2. leerling kiest of sleept een vervangblok uit de blokkenbak;
3. het foutblok wordt vervangen.

Maar deze vervangflow mag niet betekenen dat verwijderen/toevoegen onmogelijk is.

## Belangrijk voor scoring

De scoring blijft gebaseerd op:

- aangewezen foutblokken;
- correcte eindcode;
- afspelen na laatste wijziging;
- correcte output.

Dus ook als een leerling extra blokken toevoegt en later weer verwijdert, moet de uiteindelijke eindcode correct kunnen worden gescoord.

Log daarom ook:

```text
blockAddedEvents
blockRemovedEvents
blockMovedEvents
blockReplacedEvents
finalProgramState
```

---

# 6. Afspelen moet zichtbaar, rustig en stapsgewijs verlopen

De knop `Afspelen` mag niet direct naar de eindtoestand springen. De geprogrammeerde acties moeten zichtbaar worden uitgevoerd in een rustig tempo.

## Harde eisen

Wanneer de leerling op `Afspelen` klikt:

1. reset Bizzy naar de startpositie;
2. voer de code blok voor blok uit;
3. markeer steeds het actieve codeblok;
4. laat Bizzy zichtbaar bewegen, draaien, wachten of spreken;
5. voeg elke uitgevoerde stap toe aan het zichtbare uitvoerlog;
6. toon pas na de laatste stap of het doel wel/niet is gehaald;
7. laat het log na afloop staan.

## Tempo vmbo1

Gebruik ongeveer:

```text
startblok: 0,5 sec zichtbaar
1 stap vooruit: 0,8-1,0 sec
draai: 0,8 sec
wacht 1 seconde: echt ongeveer 1,0 sec of zichtbaar aftellen
zeg-blok: tekstballon minimaal 1,2 sec zichtbaar
pauze tussen blokken: 0,25-0,35 sec
```

Een volledige vmbo1-run van 8 blokken mag dus enkele seconden duren. Dat is gewenst. Debuggen vereist dat leerlingen kunnen volgen wat er gebeurt.

## Technische eis

Voorkom dat React/state updates worden gebatcht waardoor de leerling alleen het eindresultaat ziet.

Gebruik dus een echte async/sequentiële uitvoering, bijvoorbeeld conceptueel:

```text
for each executable block:
  markeer actief blok
  await voerActieVisueelUit(block)
  schrijf stap naar uitvoerlog
  await kortePauze
```

Niet:

```text
bereken alles direct
zet eindpositie
toon log achteraf
```

---

# 7. Uitvoerlog zichtbaar en terugleesbaar houden

De huidige versies hadden al een uitvoerlog. Behoud dit principe en maak het expliciet zichtbaar bij de debugtaak.

## Vmbo1 zichtbaar log

Gebruik korte, taallichte regels:

```text
Uitgevoerd:
1. Start
2. 1 stap vooruit
3. 1 stap vooruit
4. Draai links
5. 1 stap vooruit
6. Wacht 1 seconde
7. Draai links
8. Zeg: Hoi
```

Na herstel moet bijvoorbeeld zichtbaar worden:

```text
Uitgevoerd:
1. Start
2. 1 stap vooruit
3. 1 stap vooruit
4. Draai rechts
5. 1 stap vooruit
6. Wacht 1 seconde
7. Draai links
8. Zeg: Klaar
```

Het log moet:

- na afloop zichtbaar blijven;
- verdwijnen of vervangen worden bij een nieuwe run;
- technisch worden opgeslagen voor analyse;
- niet alleen in de console staan.

## Technische logging per run

Log minimaal:

```text
runId
timestamp
playCount
programStateAtPlay
playedAfterLastChange
executionTrace
goalMatched
failedStepId
finalOutput
itemVersion
```

## Technische logging per stap

Log minimaal:

```text
blockId
blockLabel
blockType
actionType
beforeState
afterState
visibleOutput
matchedExpectedStep
```

---

# 8. Scoring vmbo1

PT7 blijft maximaal 4 punten.

| Onderdeel | Punt | Automatisch criterium |
|---|---:|---|
| Foutblokken aanwijzen | 1 | leerling selecteert de twee echte foutblokken |
| Fout 1 herstellen | 1 | positie 4 is `draai naar rechts` |
| Fout 2 herstellen | 1 | positie 8 is `zeg "Klaar"` |
| Testbewijs | 1 | leerling klikt na de laatste wijziging op `Afspelen` en de output matcht het doel |

## Score voor foutblokken aanwijzen

Gebruik:

- 1 punt: exact de twee juiste foutblokken geselecteerd;
- 0,5 punt: de twee juiste foutblokken plus maximaal één onjuist blok geselecteerd;
- 0,5 punt: één juist foutblok en geen of maximaal één onjuist blok geselecteerd;
- 0 punten: meer dan drie blokken geselecteerd;
- 0 punten: geen juist foutblok geselecteerd;
- 0 punten: `Ik weet het niet`.

Als het bestaande scoringsmodel geen halve punten binnen PT7 ondersteunt, rond dit onderdeel dan niet af in de UI maar registreer intern decimalen en verwerk het conform de bestaande PT-scorearchitectuur. Als decimalen technisch onwenselijk zijn, gebruik exact 2 juiste foutblokken = 1 punt, anders 0 punten. Documenteer de keuze in de code comments.

## Testpunt

Het testpunt wordt alleen toegekend als:

```text
playedAfterLastChange = true
goalMatched = true
executionTraceComplete = true
```

Correcte eindcode zonder afspelen na de laatste wijziging krijgt dit testpunt niet.

---

# 9. Passende doorwerking naar andere metingen

Als de blokprogrammeercomponent gedeeld is, voer de technische verbeteringen generiek door:

- doelkaart en instructieregel visueel scheiden;
- grotere/realistische blokkenbak ondersteunen;
- blokken verwijderen/toevoegen/verplaatsen/vervangen;
- rustig stapsgewijs afspelen;
- actieve blokmarkering;
- zichtbaar uitvoerlog;
- technische execution trace;
- `playedAfterLastChange`;
- scoring op eindcode + testbewijs.

Pas inhoudelijke varianten alleen aan als dat nodig is door de gedeelde datastructuur.

Behoud inhoudelijke differentiatie:

- leerjaar 1 vmbo: sequentie/richting/output;
- leerjaar 1 havo/vwo: herhaling/patroon;
- leerjaar 3 vmbo: teller/variabele + conditie;
- leerjaar 3 havo/vwo: samengestelde logica.

Maak de andere varianten niet eenvoudiger dan ze waren.

---

# 10. Acceptatiecriteria

De wijziging is klaar als:

1. leerjaar 1 vmbo PT7 standaard een gegeven code met 8 blokken toont;
2. vmbo1-code precies twee inhoudelijke fouten bevat;
3. het doel in een aparte groen/lichtgroen gearceerde doelkaart staat;
4. het doel echte pijlen/iconen gebruikt, niet `->`;
5. pijlen in het doel roze zijn volgens de huisstijl;
6. het doel duidelijk leesbaar is met voldoende spacing;
7. de tekst `Gekozen foutblokken...` niet meer in de doelkaart staat;
8. de instructieregel onder de doelkaart staat;
9. leerlingen codeblokken kunnen verwijderen;
10. leerlingen codeblokken uit de blokkenbak kunnen toevoegen;
11. leerlingen codeblokken kunnen vervangen;
12. leerlingen toegevoegde blokken weer kunnen verwijderen;
13. de eindcode automatisch wordt gescoord;
14. `Afspelen` de code stapsgewijs uitvoert;
15. de actieve codeblokstap zichtbaar gemarkeerd wordt;
16. Bizzy zichtbaar beweegt/draait/wacht/spreekt;
17. afspelen niet direct naar de eindtoestand springt;
18. het uitvoerlog zichtbaar is voor de leerling;
19. het uitvoerlog na afloop terug te lezen blijft;
20. technische execution traces worden gelogd;
21. het testpunt alleen telt na afspelen na de laatste wijziging;
22. PT7 maximaal 4 punten blijft;
23. PT7 gekoppeld blijft aan 22B;
24. bestaande toetsen/build/lint slagen;
25. er geen wijzigingen zijn gedaan aan SR-vragen of andere PT-taken buiten noodzakelijke gedeelde componenten.

---

# 11. Te rapporteren na uitvoering

Geef na implementatie kort terug:

- welke bestanden zijn aangepast;
- welke datastructuur voor vmbo1 PT7 is gewijzigd;
- hoe verwijderen/toevoegen van blokken werkt;
- hoe het rustige afspelen technisch is geïmplementeerd;
- waar het zichtbare uitvoerlog staat;
- welke tests/build/lint zijn uitgevoerd;
- of er nog beperkingen of aandachtspunten zijn.
