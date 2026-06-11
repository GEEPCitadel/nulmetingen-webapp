# Fase 2 — Itembouw deel 3: SR-herschikking, PT2/PT6 compacter, leesbaarheidscheck (Claude)

Status: gebouwd 11-06-2026, conform `claude_fase2_toetsmatrijs.md`. Reviewkeuzes Pim deze sessie: SR-ankers nu gelijktrekken lj1↔lj3 per niveau-lijn; variabele slots eerst 1 variant (parallelvarianten later); vervallen items archiveren.

## SR-blok per versie: 13 items (was 12)

Bron: `nulmetingen_selected_response_herontwerp_v3.json` (schemaVersion → v3.9). Volgorde per versie:

| # | Slot | Subdoel | Blok | Inhoud vmbo / hv |
| --- | --- | --- | --- | --- |
| 1 | SR1 | 23A | anker | wachtwoord-passphrase / **nieuw:** malware herkennen (pop-ups na gratis programma) |
| 2 | SR2 | 21B | anker | **nieuw:** zoekopdracht werkstuk sport / zoekopdracht e-bikes (bestond) |
| 3 | SR3 | 21B | anker | stormbericht checken (herschreven) / claim-triangulatie (herschreven) |
| 4 | SR4 | 21A | variabel | **nieuw:** hoe reist een foto (internet/servers) / storing lokaliseren (wifi vs. 4G) |
| 5 | SR5 | 21C | anker | klassenpoll-generalisatie (herschreven) / dataset één klas (herschreven) |
| 6 | SR6 | 22A | anker | afbeelding poster (herschreven) / foto presentatie (herschreven) |
| 7 | SR7 | 22B | variabel | **nieuw:** flowchart sorteermachine / herhaallus getal voorspellen (beide met caseCard) |
| 8 | SR8 | 21D | variabel | **nieuw:** muziekapp leert van data / regels vs. lerend systeem |
| 9 | SR9 | 21D | anker | vraag 9 AI-simulatie (ongewijzigd, 2 pt) |
| 10 | SR10 | 23B | variabel | **nieuw:** schermtijd en slaap / telefoon en focus |
| 11 | SR11 | 23C | anker | platform-storing (herschreven) / platform-risico (herschreven) |
| 12–13 | MINIPT | 21B/23C | variabel | mini-PT feed en mini-PT 23C (ongewijzigd) |

- Ankers zijn nu **identiek lj1↔lj3 per niveau-lijn** (gedeelde `itemVersion` `sr-anker-…`), conform matrijs §4. Variabele slots hebben `itemVersion` `sr-var-…` en `anchorStatus: "variable"`; tweede variant per slot volgt later.
- Alle herschreven/nieuwe items voldoen aan de taligheidsnorm: 3–4 inhoudelijke opties + weet-niet als laatste, opties ≤ ~10 woorden, stam ≤ 2 korte zinnen + vraagzin, geen ontkenningen in de stam.
- 26 oude items naar `archivedSelectedResponseItems` met `archivedReason` (o.a. sr3 telefoon, sr5 algoritme/feed, sr7 game-privacy, sr9 foto-toestemming, lj3-phishingmails, lj3-duplicaten van ankers). Niets weggegooid.

## PT2 en PT6 compacter

- PT2 mail (`v3MailConfig`): 4 → 2 scoringsonderdelen: (1) adressering (Aan + cc/bcc waar nodig), (2) onderwerp + juiste bijlage + verzonden. Taakinstructie ongewijzigd.
- PT6 schermdelen (`v3Pt6`): 3 → 2: geluidsregel vervallen; venster-i.p.v.-scherm en juiste venster blijven.
- `mailTaskItem`/`teamsTaskItem`: punten worden nu uit de regels berekend in plaats van hardcoded.

## Leesbaarheidscheck in `npm test`

Nieuw: `src/lib/readability.test.ts` (52 tests) checkt de taligheidsnorm op alle actieve SR-items inclusief deelvragen. Vraag 9-opties (AI-prompts/handelingen) krijgen een ruimere woordgrens (25), gedocumenteerd in de test. `scripts/verify-anchors.js` bijgewerkt (13 items; phishing-SR- en Youssef-check vervallen, want gearchiveerd — phishing zit in PT3).

## Totalen en openstaand

- maxScore per versie: 44 → **42** (SR-blok 16, PT's 26). Alle tests: **154 passed**.
- Let op: matrijs noemt PT1 (3) en PT4 (2); in de app staan ze op 4. Inkorten daarvan stond niet in de afgesproken takenlijst → beslispunt Pim. Daarmee zou het totaal op 39 komen; het matrijstotaal "38" telt zichzelf bovendien één punt te laag op (21A-rij somt tot 6, kop zegt 5).
- Nog open in fase 2: parallelvarianten voor variabele SR-slots (≥2 per slot), eventueel PT1/PT4 inkorten, lj3-differentiatie variabel blok. 