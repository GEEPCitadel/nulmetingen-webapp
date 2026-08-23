# PT7 Blokprogrammeren — verantwoording kerndoelen Digitale Geletterdheid

## Conclusie

PT7 sluit sterk aan bij de kern van programmeren en computational thinking: leerlingen ontwerpen zelf een uitvoerbaar algoritme, gebruiken sequenties, herhalingen en voorwaarden en kunnen hun programma testen en verbeteren.

De taak dekt echter niet het volledige kerndoel. In de definitieve conceptkerndoelen voor het voortgezet onderwijs luidt kerndoel 22B: *De leerling programmeert een computerprogramma met behulp van computationele denkstrategieën.* Daarbij noemt SLO onder meer het ontwerpen van algoritmen, gebruiken van programmeerconcepten en het documenteren, testen en bijstellen van programma’s. Ook events, datastructuren en combinaties van logische operatoren worden genoemd. Zie [SLO – definitieve conceptkerndoelen VO, kerndoel 22B](https://www.slo.nl/publish/pages/23189/kerndoelen-voortgezet-onderwijs-slo-2026-derde-druk.pdf).

PT7 is daarom een goede prestatiegerichte nulmeting van een afgebakend deel van dit kerndoel, maar geen volledige meting van kerndoel 22B.

## Aansluiting per vaardigheid

| Vaardigheid | Wat PT7 zichtbaar maakt | Beoordeling |
| --- | --- | --- |
| Problemen opdelen | De leerling vertaalt “breng Teddy naar het bot” naar lopen, draaien, blaffen, springen en pakken. | Goed, maar deels ondersteund doordat het pad en de obstakels zichtbaar zijn. |
| Patronen herkennen | De leerling herkent opeenvolgende loopstappen of terugkerende kattencontroles. | Sterk bij lj1 havo/vwo en leerjaar 3. |
| Algoritme ontwerpen | De leerling bouwt vanaf alleen `bij start` een uitvoerbaar stappenplan. | Zeer sterk. |
| Sequentie | Blokken moeten in de juiste volgorde staan; een verkeerde volgorde leidt tot zichtbaar verkeerd gedrag. | Zeer sterk op alle niveaus. |
| Herhaling | Leerlingen plaatsen herhaalde stappen doelmatig in `herhaal`. | Sterk vanaf lj1 havo/vwo. |
| Voorwaarden | Leerlingen gebruiken `als Teddy voor kat staat` binnen een herhaling. | Sterk in leerjaar 3. |
| Geneste programmastructuur | Een voorwaarde wordt binnen een herhaling geplaatst. | Sterk in leerjaar 3. |
| Testen en bijstellen | Teddy voert ieder blok zichtbaar uit; de leerling kan daarna de code veranderen en opnieuw afspelen. | Sterk gefaciliteerd. |
| Systematisch debuggen | Het actieve blok, het werkelijke spoor en de foutlocatie zijn zichtbaar. | Redelijk tot sterk; de gevolgde strategie wordt niet apart beoordeeld. |
| Reflecteren en uitleggen | De oplossing laat impliciet zien dat het probleem is opgelost. | Beperkt: de leerling hoeft gemaakte keuzes niet te verwoorden. |
| Events | `bij start` is aanwezig, maar staat vast en wordt niet door de leerling gekozen. | Beperkt. |
| Datastructuren en variabelen | Niet aanwezig. | Niet gemeten. |
| Samengestelde logica | Er is één voorwaarde, maar geen combinatie met bijvoorbeeld EN, OF of NIET. | Niet gemeten. |
| Blokcode naar tekstcode | De leerling werkt uitsluitend met blokken. | Niet gemeten; dit hoeft niet noodzakelijk binnen één nulmetingstaak. |

De overgang van blokken naar tekstcode en “volhouden” zijn zinvolle onderwijsdoelen, maar staan niet als afzonderlijke onderdelen in de doelzin van kerndoel 22B. De meest directe officiële aanknopingspunten voor PT7 zijn algoritmen ontwerpen, programmeerconcepten gebruiken en programma’s testen en bijstellen.

## Differentiatie

### Leerjaar 1 vmbo

Een toegankelijke beginsituatie. De leerling denkt lineair: welke acties zijn nodig, in welke volgorde, vanuit welk perspectief wordt gedraaid en welke actie past bij kat, boomstam en bot? Het weglaten van besturingsblokken is verdedigbaar: de taak meet eerst de vertaling van een concrete route naar eenduidige instructies.

### Leerjaar 1 havo/vwo

De route bevat drie gelijke loopstappen. Daarmee meet de taak niet alleen of de leerling het doel bereikt, maar ook of de leerling herhaling als programmeerconcept doelmatig inzet. Dit onderscheidt een functionele uitgeschreven oplossing van een structureel betere oplossing met een lus.

### Leerjaar 3 vmbo

De combinatie van `herhaal` en `als Teddy voor kat staat` vraagt om geneste besturing. De leerling begrijpt dat niet iedere herhaling automatisch een blaf bevat: eerst wordt de actuele toestand gecontroleerd. Stilstaande katten houden de nadruk bij programmastructuur.

### Leerjaar 3 havo/vwo

Bewegende katten voegen veranderende toestand toe. Dezelfde voorwaarde wordt tijdens verschillende iteraties opnieuw geëvalueerd. Dit is de sterkste variant voor redeneren over uitvoering en toestand. Het programmeerrepertoire blijft echter gelijk; variabelen, datastructuren en samengestelde voorwaarden worden niet gemeten.

## Scoring

Iedere variant levert maximaal vier punten op. Elk criterium is binair: nul of één punt.

| Punt | Algemeen criterium |
| --- | --- |
| 1. Relevante blokken | Alle noodzakelijke bloktypen zijn gebruikt en de uitvoering bevat geen overbodige `blaf` zonder kat. |
| 2. Volgorde en structuur | Teddy bereikt alle vereiste routepunten in de juiste volgorde en de simulator stopt niet door een ongeldige beweging of actie. |
| 3. Niveauconcept | De voor het betreffende niveau bedoelde programmastructuur is correct toegepast. |
| 4. Werkend eindresultaat | Het programma is na de laatste wijziging opnieuw afgespeeld, zonder fout voltooid en Teddy heeft het bot gepakt. |

### Leerjaar 1 vmbo

1. De noodzakelijke actieblokken zijn aanwezig en er wordt niet zonder kat geblaft.
2. Teddy legt het volledige geldige pad af zonder botsing of verkeerde sprong.
3. De lineaire reeks is correct opgebouwd: `loop`, `loop`, `draai rechts`, `blaf`, `loop`, `spring`, `pak bot`.
4. De laatste versie is afgespeeld en Teddy pakt het bot.

### Leerjaar 1 havo/vwo

1. De benodigde acties en `herhaal` zijn aanwezig, zonder overbodige acties.
2. Teddy legt het volledige pad zonder uitvoeringsfout af.
3. `herhaal` staat op drie en bevat precies één genest blok: `loop`.
4. De laatste versie is afgespeeld en Teddy pakt het bot.

Drie losse loopblokken kunnen een werkend eindresultaat opleveren, maar niet het punt voor het niveauconcept.

### Leerjaar 3 vmbo

1. De noodzakelijke acties, `herhaal` en `als Teddy voor kat staat` zijn gebruikt, zonder zinloze blafacties.
2. Teddy passeert beide stilstaande katten en bereikt alle routepunten zonder fout.
3. De herhaling staat op vijf; binnen de herhaling staat eerst de voorwaarde en daarna `loop`; `blaf` is in de voorwaarde genest.
4. De laatste versie is afgespeeld en Teddy pakt het bot.

Hardgecodeerde blafacties kunnen mogelijk helpen om het bot te bereiken, maar leveren niet het punt voor voorwaardelijke logica op.

### Leerjaar 3 havo/vwo

1. Alle noodzakelijke bloktypen zijn gebruikt en de uitvoering bevat geen overbodige acties.
2. Teddy doorloopt de route met bewegende katten zonder botsing of andere uitvoeringsfout.
3. De herhaling staat op zes; de kattenvoorwaarde staat vóór `loop` in de herhaling en bevat het geneste blok `blaf`.
4. De laatste versie is afgespeeld en Teddy pakt het bot.

## Interpretatie en beperking

Het punt voor “volgorde en structuur” en het punt voor “werkend eindresultaat” hangen sterk samen. Een leerling die alle routepunten foutloos bereikt, is meestal al zeer dicht bij het bot; het vierde punt voegt vooral `pak bot` en daadwerkelijk opnieuw afspelen toe.

Ook geldt de uitspraak dat gelijkwaardige oplossingen worden geaccepteerd niet volledig voor het niveauconcept. De simulator kan alternatief correct gedrag accepteren voor andere punten, maar het derde punt controleert een specifieke structuur. Bij lj1 vmbo is zelfs een vaste blokkenreeks vereist.

Het eindoordeel is dat PT7 basaal algoritmisch denken, sequentie, herhaling, voorwaarden, nesting en testen overtuigend en passend gedifferentieerd meet. Interpreteer de uitkomst daarom als “beheersing van de in PT7 aangeboden programmeerconcepten”, niet als “beheersing van het volledige kerndoel programmeren”. De officiële kerndoelen hebben de status van definitieve conceptkerndoelen; zie [SLO – status en toelichting](https://www.slo.nl/%4024983/definitieve-conceptkerndoelen-dg/).
