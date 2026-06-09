# Nulmetingen Digitale Geletterdheid v4

Gegenereerd vanuit de actieve repo/data op 2026-06-09T15:22:06.158Z.

## 1. Status

- Werkversie v4.
- Geschikt voor interne pilot en formatieve/diagnostische afname.
- Niet presenteren als gevalideerd meetinstrument.

## 2. Ontwerpbesluiten

- Performance tasks vormen de kern van de afname.
- Selected-response-items meten kennis, concepten en korte keuzesituaties.
- Zelfinschatting is niet-scorend.
- Rapportage gebruikt geen normatieve labels en doet geen individuele groeiclaim.
- Leerlingrapportage is reflectief; aggregaten zijn bedoeld voor klas- en cohortanalyse.

## 3. Privacy en opslag

- Permanent bedoeld: klas-/cohortaggregaten en afgeronde resultaatrecords zonder namen, e-mailadressen, leerlingnummers, IP-adressen of fingerprints.
- Niet permanent bedoeld: individuele antwoordinhoud, individuele scores als leerlingdossier, namen, e-mailadressen, leerlingnummers, IP-adressen of fingerprints.
- Tijdelijke pogingdata wordt gebruikt om de lopende afname te hervatten en antwoordvolgorde, acties en scores te berekenen.

## 4. Scorearchitectuur

| assessmentId | maxscore | PT-score | SR-score | zelfinschatting |
| --- | ---: | ---: | ---: | ---: |
| lj1-vmbo | 36 | 26 | 10 | 0 |
| lj1-hv | 36 | 26 | 10 | 0 |
| lj3-vmbo | 36 | 26 | 10 | 0 |
| lj3-hv | 36 | 26 | 10 | 0 |

Kerndoel- en subdoelkoppeling wordt per item vastgelegd in `kerndoel`, `subgoal` en `primarySubgoal`. Rapportage telt alleen items met punten mee.

## 5. Actieve inhoud per assessment

### Leerjaar 1 VMBO (lj1-vmbo)

| UI-vraag | itemId | type | kerndoel/subdoel | max punten | korte beschrijving | scoringssamenvatting |
| ---: | --- | --- | --- | ---: | --- | --- |
| 1 | lj1v-pt1-files | file_task_simulation | 21A | 4 | PT1 - Bestanden en mappen beheren | 4 scoringsonderdelen |
| 2 | lj1v-pt2-mail | outlook_mail_simulation | 21A | 4 | E-mail opstellen | 4 scoringsonderdelen |
| 3 | lj1v-pt3-security | account_security_simulation | 23A | 3 | PT3 - Bericht beoordelen | 3 scoringsonderdelen |
| 4 | lj1v-pt4-excel | excel_download_task | 21C, 21A | 4 | PT4 - Excel/data sorteren en filteren | 2 scoringsonderdelen |
| 5 | lj1vmbo-pt6-screen-share | teams_share_simulation | 23A | 3 | Schermdelen in een online les | 3 scoringsonderdelen |
| 6 | lj1v-pt7-programming-debug-v1 | block_programming_task | 22B | 4 | PT7 - Blokprogrammeren | 2 debug-reparaties; 1 tests |
| 7 | pt8-whutsupp-sam-video | social_action_simulation | 23B | 4 | Whutsupp: video in de groepschat | 4 Whutsupp-beslismomenten; harmful caps actief |
| 8 | lj1v-sr1-pw-passphrase | multiple_choice | 23A | 1 | Sterk wachtwoord kiezen | single choice; option-id scoring; 5 opties |
| 9 | lj1v-vraag9-ai-workstuk-v4 | social_action_simulation | 21D | 1 | AI gebruiken voor je werkstuk | 2 scoringsonderdelen |
| 10 | lj1v-sr3-phone | multiple_choice | 21A | 1 | Opslag bijna vol | single choice; option-id scoring; 5 opties |
| 11 | lj1v-sr4-official-source | multiple_choice | 21B | 1 | School morgen dicht? | single choice; option-id scoring; 5 opties |
| 12 | lj1v-sr5-algorithm | multiple_choice | 21B | 1 | Aanbevelingen | single choice; option-id scoring; 5 opties |
| 13 | lj1v-sr6-data-poll | multiple_choice | 21C | 1 | Kleine poll | single choice; option-id scoring; 5 opties |
| 14 | lj1v-sr7-ai-check | multiple_choice | 23B | 1 | Online game en persoonsgegevens | single choice; option-id scoring; 5 opties |
| 15 | lj1v-sr8-image-rights | multiple_choice | 22A | 1 | Afbeelding gebruiken | single choice; option-id scoring; 5 opties |
| 16 | lj1v-sr9-photo-consent | multiple_choice | 23B | 1 | Foto delen | single choice; option-id scoring; 5 opties |
| 17 | lj1v-sr10-platform-risk | multiple_choice | 23C | 1 | Eén schoolapp | single choice; option-id scoring; 5 opties |

### Leerjaar 1 HAVO/VWO (lj1-hv)

| UI-vraag | itemId | type | kerndoel/subdoel | max punten | korte beschrijving | scoringssamenvatting |
| ---: | --- | --- | --- | ---: | --- | --- |
| 1 | lj1h-pt1-files | file_task_simulation | 21A | 4 | PT1 - Bestanden en mappen beheren | 4 scoringsonderdelen |
| 2 | lj1h-pt2-mail | outlook_mail_simulation | 21A | 4 | E-mail opstellen | 4 scoringsonderdelen |
| 3 | lj1h-pt3-security | account_security_simulation | 23A | 3 | PT3 - Bericht beoordelen | 3 scoringsonderdelen |
| 4 | lj1h-pt4-excel | excel_download_task | 21C, 21A | 4 | PT4 - Excel/data sorteren en filteren | 2 scoringsonderdelen |
| 5 | lj1hv-pt6-screen-share | teams_share_simulation | 23A | 3 | Schermdelen in een online les | 3 scoringsonderdelen |
| 6 | lj1h-pt7-programming-debug-v1 | block_programming_task | 22B | 4 | PT7 - Blokprogrammeren | 2 debug-reparaties; 1 tests |
| 7 | pt8-whutsupp-sam-video | social_action_simulation | 23B | 4 | Whutsupp: video in de groepschat | 4 Whutsupp-beslismomenten; harmful caps actief |
| 8 | lj1h-sr1-pw-passphrase | multiple_choice | 23A | 1 | Sterk wachtwoord kiezen | single choice; option-id scoring; 5 opties |
| 9 | lj1h-vraag9-ai-presentatie-v4 | social_action_simulation | 21D | 1 | AI gebruiken voor een presentatie | 2 scoringsonderdelen |
| 10 | lj1h-sr3-phone-actions | multiple_choice | 21A | 1 | Trage telefoon | multiple select; option-id scoring; 6 opties |
| 11 | lj1h-sr4-search-query | multiple_choice | 21B | 1 | Gerichte zoekopdracht | single choice; option-id scoring; 5 opties |
| 12 | lj1h-sr5-feed-sample | multiple_choice | 21B | 1 | Feed is geen steekproef | single choice; option-id scoring; 5 opties |
| 13 | lj1h-sr6-sample | multiple_choice | 21C | 1 | Steekproef | single choice; option-id scoring; 5 opties |
| 14 | lj1h-sr7-ai-startpunt | multiple_choice | 23B | 1 | Online game en persoonsgegevens | single choice; option-id scoring; 5 opties |
| 15 | lj1h-sr8-image-source | multiple_choice | 22A | 1 | Foto in online leeromgeving | single choice; option-id scoring; 5 opties |
| 16 | lj1h-sr9-photo-share | multiple_choice | 23B | 1 | Foto delen bij twijfel | single choice; option-id scoring; 5 opties |
| 17 | lj1h-sr10-platform-risk | multiple_choice | 23C | 1 | Eén app voor schoolzaken | single choice; option-id scoring; 5 opties |

### Leerjaar 3 VMBO (lj3-vmbo)

| UI-vraag | itemId | type | kerndoel/subdoel | max punten | korte beschrijving | scoringssamenvatting |
| ---: | --- | --- | --- | ---: | --- | --- |
| 1 | lj3v-pt1-files | file_task_simulation | 21A | 4 | PT1 - Bestanden en mappen beheren | 4 scoringsonderdelen |
| 2 | lj3v-pt2-mail | outlook_mail_simulation | 21A | 4 | E-mail opstellen | 4 scoringsonderdelen |
| 3 | lj3v-pt3-security | account_security_simulation | 23A | 3 | PT3 - Bericht beoordelen | 3 scoringsonderdelen |
| 4 | lj3v-pt4-excel | excel_download_task | 21C, 21A | 4 | PT4 - Excel/data sorteren en filteren | 2 scoringsonderdelen |
| 5 | lj3vmbo-pt6-screen-share | teams_share_simulation | 23A | 3 | Schermdelen in een online les | 3 scoringsonderdelen |
| 6 | lj3v-pt7-programming-debug-v1 | block_programming_task | 22B | 4 | PT7 - Blokprogrammeren | 2 debug-reparaties; 2 tests |
| 7 | pt8-whutsupp-sam-video | social_action_simulation | 23B | 4 | Whutsupp: video in de groepschat | 4 Whutsupp-beslismomenten; harmful caps actief |
| 8 | lj3v-sr1-cijfermail | multiple_choice | 23A | 1 | Mail over nieuw cijfer | single choice; option-id scoring; 5 opties |
| 9 | lj3v-vraag9-ai-stagebrief-v4 | social_action_simulation | 21D | 1 | AI gebruiken voor een stagebrief | 2 scoringsonderdelen |
| 10 | lj3v-sr3-phone-actions | multiple_choice | 21A | 1 | Telefoon versnellen | multiple select; option-id scoring; 7 opties |
| 11 | lj3v-sr4-health-source | multiple_choice | 21B | 1 | Gezondheidsinformatie | single choice; option-id scoring; 5 opties |
| 12 | lj3v-sr5-sponsored | multiple_choice | 21B | 1 | Sponsoring herkennen | single choice; option-id scoring; 5 opties |
| 13 | lj3v-sr6-percent | multiple_choice | 21C | 1 | Poll en conclusie | single choice; option-id scoring; 5 opties |
| 14 | lj3v-sr7-ai-factcheck | multiple_choice | 23B | 1 | Online game en persoonsgegevens | single choice; option-id scoring; 5 opties |
| 15 | lj3v-sr8-media-rights | multiple_choice | 22A | 1 | Muziek of afbeelding online gebruiken | single choice; option-id scoring; 5 opties |
| 16 | lj3v-sr9-photo-shared | multiple_choice | 23B | 1 | Ongewenst gedeelde foto | single choice; option-id scoring; 5 opties |
| 17 | lj3v-sr10-digital-access | multiple_choice | 23C | 1 | Digitaal formulier en kansen | single choice; option-id scoring; 5 opties |

### Leerjaar 3 HAVO/VWO (lj3-hv)

| UI-vraag | itemId | type | kerndoel/subdoel | max punten | korte beschrijving | scoringssamenvatting |
| ---: | --- | --- | --- | ---: | --- | --- |
| 1 | lj3h-pt1-files | file_task_simulation | 21A | 4 | PT1 - Bestanden en mappen beheren | 4 scoringsonderdelen |
| 2 | lj3h-pt2-mail | outlook_mail_simulation | 21A | 4 | E-mail opstellen | 4 scoringsonderdelen |
| 3 | lj3h-pt3-security | account_security_simulation | 23A | 3 | PT3 - Bericht beoordelen | 3 scoringsonderdelen |
| 4 | lj3h-pt4-excel | excel_download_task | 21C, 21A | 4 | PT4 - Excel/data sorteren en filteren | 2 scoringsonderdelen |
| 5 | lj3hv-pt6-screen-share | teams_share_simulation | 23A | 3 | Schermdelen in een online les | 3 scoringsonderdelen |
| 6 | lj3h-pt7-programming-debug-v1 | block_programming_task | 22B | 4 | PT7 - Blokprogrammeren | 2 debug-reparaties; 4 tests |
| 7 | pt8-whutsupp-sam-video | social_action_simulation | 23B | 4 | Whutsupp: video in de groepschat | 4 Whutsupp-beslismomenten; harmful caps actief |
| 8 | lj3h-sr1-accountmail | multiple_choice | 23A | 1 | Mail over accountcontrole | single choice; option-id scoring; 5 opties |
| 9 | lj3h-vraag9-ai-betoog-v4 | social_action_simulation | 21D | 1 | AI gebruiken voor een betoog | 2 scoringsonderdelen |
| 10 | lj3h-sr3-phone-actions | multiple_choice | 21A | 1 | Telefoon en onderhoud | multiple select; option-id scoring; 7 opties |
| 11 | lj3h-sr4-triangulation | multiple_choice | 21B | 1 | Claim controleren | single choice; option-id scoring; 5 opties |
| 12 | lj3h-sr5-filterbubble | multiple_choice | 21B | 1 | Filterbubbel | single choice; option-id scoring; 5 opties |
| 13 | lj3h-sr6-graph-scale | multiple_choice | 21C | 1 | Klachten naar verhouding | single choice; option-id scoring; 5 opties |
| 14 | lj3h-sr7-ai-source-check | multiple_choice | 23B | 1 | Online game en persoonsgegevens | single choice; option-id scoring; 5 opties |
| 15 | lj3h-sr8-remix-rights | multiple_choice | 22A | 1 | Afbeelding aanpassen en delen | single choice; option-id scoring; 5 opties |
| 16 | lj3h-sr9-private-photo | multiple_choice | 23B | 1 | Privéfoto in besloten groep | single choice; option-id scoring; 5 opties |
| 17 | lj3h-sr10-platform-dependence | multiple_choice | 23C | 1 | Afhankelijk van één platform | multiple select; option-id scoring; 6 opties |

## 6. Randomisatie- en scoringregels

- Single choice: score op geselecteerde option-id tegenover `correctAnswer`/`correctOptionIds`.
- Multiple select: gedeeltelijke score op correcte option-id's; schadelijke keuzes kunnen een cap activeren.
- `Ik weet het niet` is waar aanwezig apart gemarkeerd, exclusief in de UI en onderaan gepind.
- Correctheid hangt nooit af van A/B/C/D-positie.
- Getoonde option-id-volgorde wordt per sessie gelogd.
- PT8 gebruikt choice-id's, flags, recovery-keuzes en harmful caps.

## 7. Rapportage

- Leerlingfeedback is formatief en reflectief.
- PDF-output bevat scoreoverzicht, kerndoelen/subdoelen en disclaimers; geen correcte antwoorden.
- Aggregaten zijn bedoeld voor klas/cohortanalyse.
- Interpretatie blijft beperkt: geen cijfer, geen volledig oordeel en geen validiteitsclaim.

## 8. Validiteitsstatus

- Formatief-diagnostisch bruikbaar als pilotversie.
- Pilotdata is nodig voor p-waarden, discriminatie, unknown-rate, timing en betrouwbaarheid.
- Niet gebruiken voor summatieve of high-stakes conclusies.
