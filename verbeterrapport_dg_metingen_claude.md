# Verbeterrapport Metingen Digitale Geletterdheid — Claude, juni 2026

Status: voorstel ter goedkeuring. Nog niets gewijzigd aan code of inhoud.

## 1. Aanpak

Dit rapport vergelijkt de huidige vier metingen (lj1-vmbo, lj1-hv, lj3-vmbo, lj3-hv; versie v4) met inzichten uit recent onderzoek en kaders: de functionele kerndoelen digitale geletterdheid (SLO, definitief concept juli 2025 / functionele kerndoelen november 2025), ICILS 2023 (internationaal peilingsonderzoek digitale geletterdheid, NL-deelname via Kohnstamm Instituut), literatuur over formatief evalueren in het vo (SLO, Kennisrotonde), itemconstructierichtlijnen (Haladyna, Downing & Rodriguez, 2002) en pretest-posttest/groeimeting-methodologie. Bronnen staan in §8.

## 2. Wat al goed is (behouden)

- Performance tasks als kern van de afname. Dit spoort met ICILS, dat digitale geletterdheid meet via authentieke digitale taken in plaats van vragenlijsten. Dit is ook de sterkste bestaande maatregel tegen taligheid.
- Optie-randomisatie met option-id-scoring, gelogde antwoordvolgorde, exclusieve "Ik weet het niet"-optie, harmful-caps bij sociale simulaties.
- Formatief-diagnostische framing zonder normatieve labels en zonder individuele groeiclaims; privacy-by-design met alleen aggregaten permanent.
- Koppeling per item aan kerndoel én subdoel (21A–23C); die structuur komt overeen met de definitieve kerndoelen.
- Citadel-designsystem met vaste paletten en tokens.

## 3. Bevindingen en verbeteringen per opdrachtgebied

### 3.1 Dekkingsgraad t.o.v. de kerndoelen

Huidige dekking per meting: 17 items, waarvan 10 selected-response (SR) van elk 1 punt en 7 performance tasks (PT). SR-dekking per subdoel is 1 à 2 items; PT's dekken 21A (3×), 21C/21A, 22B, 23A (2×), 23B en 21D.

Knelpunten:

1. **Subdoelscores zijn met 1–2 items niet rapporteerbaar.** Een subscore op basis van 1 item heeft verwaarloosbare betrouwbaarheid. Nu rapporteert de app wél per subdoel.
2. **21D (AI) weegt 1 punt op 36**, terwijl AI in de kerndoelen een volwaardig subdoel is met vijf inhouden (AI-systemen herkennen, regels- vs. statistiek-gebaseerd, datakwaliteit, kritisch interacteren, experimenteren met trainen). Alleen "kritisch interacteren" wordt nu geraakt.
3. **22A (digitale producten creëren) heeft geen performance task.** Het enige 22A-item is een MC-vraag over auteursrecht. De kern van het subdoel — een digitaal product maken volgens passende werkwijze — wordt niet gemeten.
4. **Onderbelichte kerndoel-inhouden:** 21A netwerken/werking internet en slimme apparatuur; 21B zoekstrategie-reflectie en werking sociale media/aandacht; 21C zelf onderzoek doen met een dataset (PT4 raakt dit deels); 23C kansen/risico's vanuit ethisch-economisch-ecologisch perspectief (1 item).
5. **De havo/vwo-aanvullingen uit de kerndoelen** (o.a. malware beschrijven, machine learning, vakspecifieke zoekstrategieën, open data) worden niet gebruikt; lj-hv en lj-vmbo verschillen nu vooral in formulering, niet in inhoudelijke reikwijdte.

Verbetering: een expliciete **toetsmatrijs** (blueprint) per meting: per subdoel minimaal 3 scorende meetpunten (item of PT-scoringsonderdeel), per kerndoel-inhoud (bullet) ten minste 1 meetpunt, en rapportage alleen op niveaus met voldoende meetpunten (kerndoel altijd, subdoel alleen waar ≥3). Nieuwe PT's voor 22A (kort creëer-taakje, bijv. poster/slide opbouwen volgens eisen) en 21D (mini-simulatie: AI-output beoordelen, herkennen van AI-systemen, trainingsdata-effect). Hv-varianten krijgen verdiepende stappen uit de aanvullingen.

### 3.2 Kwaliteit, validiteit en vormgeving van de vraagstellingen

Getoetst aan Haladyna's 31 richtlijnen en aan ICILS-praktijk:

1. **Vaste 5-optie-MC met "weet ik niet" is niet optimaal.** Onderzoek achter de richtlijnen laat zien dat 3 plausibele afleiders zelden haalbaar zijn; 3–4 opties plus "weet ik niet" verkort leestijd en verlaagt taligheid zonder verlies van betrouwbaarheid. Aantal opties per item laten variëren naar wat plausibel is.
2. **Sommige SR-items meten "weten wat netjes is" in plaats van kunnen.** Voorbeeld: "Wat kun je nu het best doen?" met sociaal-wenselijk herkenbaar antwoord. Waar mogelijk vervangen door mini-simulaties met handeling (klikken, slepen, kiezen in interface) — dat meet het construct directer en is minder talig.
3. **Eén punt per SR-item vs. 3–4 punten per PT is verdedigbaar**, maar de scoreopbouw moet in de toetsmatrijs zichtbaar gewogen worden per kerndoel, niet ontstaan als bijproduct.
4. **Validatiecyclus ontbreekt nog** (zelf al gesignaleerd in v4-audit): pilotdata verzamelen en per item p-waarde, discriminatie (rit/rir), unknown-rate en timing analyseren; zwakke items reviseren. De beheeromgeving moet dit ondersteunen (§3.5).
5. **Voortgangsmeting vereist ankeritems.** Om groei tussen nulmeting en voortgangsmeting (en tussen lj1 en lj3) te kunnen duiden zijn gemeenschappelijke items nodig die ongewijzigd blijven, plus wisselende items tegen herkennings-/oefeneffect. Nu zijn de PT's de facto ankers (in alle vier de versies gelijk), maar dit is niet als ontwerpprincipe vastgelegd. Voorstel: per meting een vast ankerblok (PT's + ±4 SR) en een variabel blok; identieke ankers tussen lj1- en lj3-versies van hetzelfde niveau.
6. **Parallelle vormen.** Voor nul- vs. voortgangsmeting binnen hetzelfde leerjaar: variabel blok uit een itembank met gelijkwaardige varianten (zelfde subdoel, zelfde moeilijkte-intentie), zodat de meting niet letterlijk herhaald wordt.

### 3.3 Taligheid

ICILS 2023 laat zien dat veel NL-leerlingen onder basisniveau scoren; juist die groep is taalzwakker. Maatregelen:

1. **Taalnorm voor leerlingteksten:** zinnen ≤ 12–15 woorden, frequente woorden, geen ontkenningen in stam of opties, opties ≤ ~10 woorden, consistente terminologie (één woord per begrip in de hele meting). Vmbo-versies op A2/eenvoudig-B1.
2. **Visuele stimulus boven tekstbeschrijving:** e-mails, chats, schermen tonen als interface, niet beschrijven in proza (gebeurt al deels; doortrekken naar alle items).
3. **Voorleesfunctie (TTS) per vraag** als optionele knop — laagdrempelige toegankelijkheidswinst, geen constructvervuiling.
4. **Geautomatiseerde leesbaarheidscheck in de contentpipeline:** script dat per item zinslengte, woordlengte en optielengte rapporteert; harde limieten als CI-check naast de bestaande verify-scripts.
5. **Itembias bewaken:** bij pilotanalyse unknown-rate en p-waarden vergelijken tussen niveaus; items waar vmbo systematisch uitvalt op tekstlengte herzien.

### 3.4 Techniek en UI van de afnamewebsite

1. **Architectuur:** `App.tsx` is 7.454 regels en `assessments.ts` 3.332; alles client-side. Opsplitsen in componenten/modules per itemtype en scherm, met routes en een dunne state-laag. Dit maakt itemtypes herbruikbaar en testbaar.
2. **Scoring serverzijde.** De v4-audit signaleert het al: correcte antwoorden en scoringsmetadata zitten nu in de clientbundle. Verplaatsen naar de bestaande Vercel/Neon API: client stuurt handelingen/keuzes, server scoort. Essentieel voor validiteit bij bredere afname.
3. **Testbaarheid:** er is geen testscript. Toevoegen: unit-tests (Vitest) op scoringslogica en e2e-doorloop van alle vier de versies (Playwright), als vervanging van de handmatige "loop alle versies door"-regel in AGENTS.md.
4. **Afname-robuustheid:** autosave per handeling (bestaat deels via localStorage), hervatten bij crash, duidelijke voortgangsindicator, nette afsluiting bij verbroken verbinding.
5. **Toegankelijkheid:** WCAG 2.2 AA-basis: volledige toetsenbordbediening van simulaties (of een gelijkwaardig alternatief), contrast via bestaande Citadel-tokens, focusindicatoren, geen tijdsdruk.
6. **Huisstijl:** bestaande P1–P5-paletten en tokens uit het design-system consequent toepassen; rustiger leerlingscherm: één taak per scherm, vaste plek voor instructie, voortgang en navigatie.

### 3.5 Beheeromgeving

1. **Toegang:** nu één admin-wachtwoord. Minimaal: aparte docent-tokens per klas of rol-onderscheid (beheer vs. inzien), zodat resultaten-inzage breder kan zonder beheerrechten.
2. **Structuur:** vaste hoofdtabs — Afnames (vensters, klassen, codes incl. bestaande bulk-invoer/CSV), Monitor (live: gestart/bezig/afgerond per klas), Resultaten (aggregaten per klas/leerjaar/cohort, per kerndoel en — waar betrouwbaar — subdoel), Itemkwaliteit (p-waarde, discriminatie, unknown-rate, timing per item; nodig voor §3.2.4), Export.
3. **Groei zichtbaar maken:** vergelijkingsweergave nulmeting ↔ voortgangsmeting op klas/cohortniveau, uitsluitend op ankerblok-scores, met disclaimer conform het bestaande meetontwerp (geen individuele groeiclaims).
4. **Privacymodel ongewijzigd laten** (aggregaten permanent, individueel tijdelijk) — dit is een sterk punt.

## 4. Wat bewust niet verandert

Formatieve status (geen cijfers, geen validiteitsclaim), privacymodel, vier doelgroepversies, performance-task-kern, Citadel-huisstijl, Vite/React/TS-stack en Vercel/Neon-infrastructuur.

## 5. Voorgestelde uitvoering (na akkoord)

Fase 1 — Fundament: nieuwe branch + aparte werkmap (git worktree, origineel blijft onaangeraakt); opsplitsen App.tsx; tests; server-side scoring.
Fase 2 — Inhoud: toetsmatrijs vaststellen (ter review aan jou); itemrevisies en nieuwe items/PT's (21D, 22A, 23C, hv-verdieping); ankerblok-ontwerp; taligheidsnorm + leesbaarheidscheck.
Fase 3 — UI/beheer: leerlingscherm-herontwerp in huisstijl; beheertabs incl. itemkwaliteit en groeiweergave.
Fase 4 — Verificatie: e2e alle versies, kd-coverage-rapport tegen de toetsmatrijs, leesbaarheidsrapport, build.

Elke fase lever ik ter goedkeuring op voordat ik verder ga.

## 6. Beslispunten voor jou

1. Akkoord met rapportage op subdoelniveau alleen bij ≥3 meetpunten?
2. Akkoord met variabel aantal antwoordopties (3–4 + weet-niet) i.p.v. vast 5?
3. Server-side scoring nu meenemen of uitstellen?
4. Naam/locatie nieuwe werkmap en branch: voorstel `worktrees/claude-v5` + branch `claude/herontwerp-v5`.

## 7. Belangrijkste onderbouwing per claim

- Kerndoelen, subdoelen en hv-aanvullingen: SLO functionele kerndoelen digitale geletterdheid vo (nov 2025); drie kerndoelen in drie domeinen, verplicht vanaf schooljaar 2027–2028.
- Performance-based meten en NL-prestaties: ICILS 2023 (NL onder basisniveau computer- en informatiegeletterdheid; informatie beoordelen zwak; afname via authentieke digitale taken).
- Itemrichtlijnen (opties, afleiders, ontkenningen, stamlengte): Haladyna, Downing & Rodriguez (2002), Applied Measurement in Education 15(3).
- Formatief meetontwerp en leerwinst: SLO Formatief evalueren in het vo; Kennisrotonde over formatief/summatief toetsen.
- Groeimeting met gemeenschappelijke items en gelijk instrument bij pre/post: pretest-posttestliteratuur (o.a. CBE—Life Sciences Education, Renaissance/Illuminate-overzichten groeimodellen).
- Taalgerichte maatregelen vmbo: Kennisrotonde taalgericht vakonderwijs; Platform Taalgericht Vakonderwijs.

## 8. Bronnen

- https://www.actualisatiekerndoelen.nl/digitalegeletterdheid
- https://www.slo.nl/publish/pages/22984/definitieve-conceptkerndoelen-digitale_geletterdheid-inclusief-toelichtingsdocument.pdf
- https://open.overheid.nl/documenten/57fe1c86-c354-4166-9a77-30233e170330/file (functionele kerndoelen DG, nov 2025)
- https://www.icils2023.nl/resultaten-internationaal-peilingsonderzoek-digitale-geletterdheid-icils-2023/
- https://kohnstamminstituut.nl/rapport/icils-2023/
- https://www.kennisnet.nl/onderzoek/ruimte-voor-verbetering-vaardigheden-digitale-geletterdheid-nederlandse-leerlingen/
- https://www.slo.nl/publish/pages/15265/formatief-evalueren-in-het-voortgezet-onderwijs.pdf
- https://www.kennisrotonde.nl/vraag-en-antwoord/summatief-en-formatief-toetsen
- https://www.tandfonline.com/doi/abs/10.1207/S15324818AME1503_5 (Haladyna et al., 2002)
- https://www.lifescied.org/doi/10.1187/cbe.02-03-0007
- https://www.kennisrotonde.nl/vraag-en-antwoord/effect-vakgericht-taalonderwijs-vmbo-leerlingen
