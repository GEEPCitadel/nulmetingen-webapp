# Audit itemmapping v4

Gegenereerd: 2026-06-09T15:22:06.158Z

UI-vraagnummering telt de zelfinschatting niet mee. Daardoor is PT1 Vraag 1, PT2 Vraag 2, enzovoort. SR-nummers zijn interne itemvolgorde binnen de sectie `sr` en zijn niet hetzelfde als UI-vraagnummers.

## Leerjaar 1 VMBO (lj1-vmbo)

Auditstatus: akkoord.

| UI-vraagnummer | itemId | type | sectie | kerndoel/subdoel | max punten | actief in UI? | bronbestand | opmerkingen |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| Zelfinschatting | self-assessment | self_assessment | zelfinschatting | niet-scorend | 0 | ja | `src/data/assessments.ts` | 0 scoringsonderdelen |
| 1 | lj1v-pt1-files | file_task_simulation | pt1 | 21A | 4 | ja | `src/data/assessments.ts` | 4 scoringsonderdelen |
| 2 | lj1v-pt2-mail | outlook_mail_simulation | pt2 | 21A | 4 | ja | `src/data/assessments.ts` | 4 scoringsonderdelen |
| 3 | lj1v-pt3-security | account_security_simulation | pt3 | 23A | 3 | ja | `src/data/assessments.ts` | 3 scoringsonderdelen |
| 4 | lj1v-pt4-excel | excel_download_task | pt4 | 21C, 21A | 4 | ja | `src/data/assessments.ts` | 2 scoringsonderdelen |
| 5 | lj1vmbo-pt6-screen-share | teams_share_simulation | pt6 | 23A | 3 | ja | `src/data/assessments.ts` | 3 scoringsonderdelen |
| 6 | lj1v-pt7-programming-debug-v1 | block_programming_task | pt7 | 22B | 4 | ja | `src/data/assessments.ts` | 2 debug-reparaties; 1 tests |
| 7 | pt8-whutsupp-sam-video | social_action_simulation | pt8 | 23B | 4 | ja | `src/data/whutsupp_pt8_flow.json` via `src/data/assessments.ts` | 4 Whutsupp-beslismomenten; harmful caps actief |
| 8 | lj1v-sr1-pw-passphrase | multiple_choice | sr | 23A | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 9 | lj1v-vraag9-ai-workstuk-v4 | social_action_simulation | sr | 21D | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | 2 scoringsonderdelen |
| 10 | lj1v-sr3-phone | multiple_choice | sr | 21A | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 11 | lj1v-sr4-official-source | multiple_choice | sr | 21B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 12 | lj1v-sr5-algorithm | multiple_choice | sr | 21B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 13 | lj1v-sr6-data-poll | multiple_choice | sr | 21C | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 14 | lj1v-sr7-ai-check | multiple_choice | sr | 23B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 15 | lj1v-sr8-image-rights | multiple_choice | sr | 22A | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 16 | lj1v-sr9-photo-consent | multiple_choice | sr | 23B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 17 | lj1v-sr10-platform-risk | multiple_choice | sr | 23C | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |

- Controle Vraag 2: e-mailtaak actief; inhoud ongemoeid gelaten.
- Controle Vraag 3: lj1v-pt3-security actief.
- Controle Vraag 9: lj1v-vraag9-ai-workstuk-v4 actief; geen oud/dubbel item in UI-mapping gevonden.

## Leerjaar 1 HAVO/VWO (lj1-hv)

Auditstatus: akkoord.

| UI-vraagnummer | itemId | type | sectie | kerndoel/subdoel | max punten | actief in UI? | bronbestand | opmerkingen |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| Zelfinschatting | self-assessment | self_assessment | zelfinschatting | niet-scorend | 0 | ja | `src/data/assessments.ts` | 0 scoringsonderdelen |
| 1 | lj1h-pt1-files | file_task_simulation | pt1 | 21A | 4 | ja | `src/data/assessments.ts` | 4 scoringsonderdelen |
| 2 | lj1h-pt2-mail | outlook_mail_simulation | pt2 | 21A | 4 | ja | `src/data/assessments.ts` | 4 scoringsonderdelen |
| 3 | lj1h-pt3-security | account_security_simulation | pt3 | 23A | 3 | ja | `src/data/assessments.ts` | 3 scoringsonderdelen |
| 4 | lj1h-pt4-excel | excel_download_task | pt4 | 21C, 21A | 4 | ja | `src/data/assessments.ts` | 2 scoringsonderdelen |
| 5 | lj1hv-pt6-screen-share | teams_share_simulation | pt6 | 23A | 3 | ja | `src/data/assessments.ts` | 3 scoringsonderdelen |
| 6 | lj1h-pt7-programming-debug-v1 | block_programming_task | pt7 | 22B | 4 | ja | `src/data/assessments.ts` | 2 debug-reparaties; 1 tests |
| 7 | pt8-whutsupp-sam-video | social_action_simulation | pt8 | 23B | 4 | ja | `src/data/whutsupp_pt8_flow.json` via `src/data/assessments.ts` | 4 Whutsupp-beslismomenten; harmful caps actief |
| 8 | lj1h-sr1-pw-passphrase | multiple_choice | sr | 23A | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 9 | lj1h-vraag9-ai-presentatie-v4 | social_action_simulation | sr | 21D | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | 2 scoringsonderdelen |
| 10 | lj1h-sr3-phone-actions | multiple_choice | sr | 21A | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | multiple select; option-id scoring; 6 opties |
| 11 | lj1h-sr4-search-query | multiple_choice | sr | 21B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 12 | lj1h-sr5-feed-sample | multiple_choice | sr | 21B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 13 | lj1h-sr6-sample | multiple_choice | sr | 21C | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 14 | lj1h-sr7-ai-startpunt | multiple_choice | sr | 23B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 15 | lj1h-sr8-image-source | multiple_choice | sr | 22A | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 16 | lj1h-sr9-photo-share | multiple_choice | sr | 23B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 17 | lj1h-sr10-platform-risk | multiple_choice | sr | 23C | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |

- Controle Vraag 2: e-mailtaak actief; inhoud ongemoeid gelaten.
- Controle Vraag 3: lj1h-pt3-security actief.
- Controle Vraag 9: lj1h-vraag9-ai-presentatie-v4 actief; geen oud/dubbel item in UI-mapping gevonden.

## Leerjaar 3 VMBO (lj3-vmbo)

Auditstatus: akkoord.

| UI-vraagnummer | itemId | type | sectie | kerndoel/subdoel | max punten | actief in UI? | bronbestand | opmerkingen |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| Zelfinschatting | self-assessment | self_assessment | zelfinschatting | niet-scorend | 0 | ja | `src/data/assessments.ts` | 0 scoringsonderdelen |
| 1 | lj3v-pt1-files | file_task_simulation | pt1 | 21A | 4 | ja | `src/data/assessments.ts` | 4 scoringsonderdelen |
| 2 | lj3v-pt2-mail | outlook_mail_simulation | pt2 | 21A | 4 | ja | `src/data/assessments.ts` | 4 scoringsonderdelen |
| 3 | lj3v-pt3-security | account_security_simulation | pt3 | 23A | 3 | ja | `src/data/assessments.ts` | 3 scoringsonderdelen |
| 4 | lj3v-pt4-excel | excel_download_task | pt4 | 21C, 21A | 4 | ja | `src/data/assessments.ts` | 2 scoringsonderdelen |
| 5 | lj3vmbo-pt6-screen-share | teams_share_simulation | pt6 | 23A | 3 | ja | `src/data/assessments.ts` | 3 scoringsonderdelen |
| 6 | lj3v-pt7-programming-debug-v1 | block_programming_task | pt7 | 22B | 4 | ja | `src/data/assessments.ts` | 2 debug-reparaties; 2 tests |
| 7 | pt8-whutsupp-sam-video | social_action_simulation | pt8 | 23B | 4 | ja | `src/data/whutsupp_pt8_flow.json` via `src/data/assessments.ts` | 4 Whutsupp-beslismomenten; harmful caps actief |
| 8 | lj3v-sr1-cijfermail | multiple_choice | sr | 23A | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 9 | lj3v-vraag9-ai-stagebrief-v4 | social_action_simulation | sr | 21D | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | 2 scoringsonderdelen |
| 10 | lj3v-sr3-phone-actions | multiple_choice | sr | 21A | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | multiple select; option-id scoring; 7 opties |
| 11 | lj3v-sr4-health-source | multiple_choice | sr | 21B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 12 | lj3v-sr5-sponsored | multiple_choice | sr | 21B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 13 | lj3v-sr6-percent | multiple_choice | sr | 21C | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 14 | lj3v-sr7-ai-factcheck | multiple_choice | sr | 23B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 15 | lj3v-sr8-media-rights | multiple_choice | sr | 22A | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 16 | lj3v-sr9-photo-shared | multiple_choice | sr | 23B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 17 | lj3v-sr10-digital-access | multiple_choice | sr | 23C | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |

- Controle Vraag 2: e-mailtaak actief; inhoud ongemoeid gelaten.
- Controle Vraag 3: lj3v-pt3-security actief.
- Controle Vraag 9: lj3v-vraag9-ai-stagebrief-v4 actief; geen oud/dubbel item in UI-mapping gevonden.

## Leerjaar 3 HAVO/VWO (lj3-hv)

Auditstatus: akkoord.

| UI-vraagnummer | itemId | type | sectie | kerndoel/subdoel | max punten | actief in UI? | bronbestand | opmerkingen |
| --- | --- | --- | --- | --- | ---: | --- | --- | --- |
| Zelfinschatting | self-assessment | self_assessment | zelfinschatting | niet-scorend | 0 | ja | `src/data/assessments.ts` | 0 scoringsonderdelen |
| 1 | lj3h-pt1-files | file_task_simulation | pt1 | 21A | 4 | ja | `src/data/assessments.ts` | 4 scoringsonderdelen |
| 2 | lj3h-pt2-mail | outlook_mail_simulation | pt2 | 21A | 4 | ja | `src/data/assessments.ts` | 4 scoringsonderdelen |
| 3 | lj3h-pt3-security | account_security_simulation | pt3 | 23A | 3 | ja | `src/data/assessments.ts` | 3 scoringsonderdelen |
| 4 | lj3h-pt4-excel | excel_download_task | pt4 | 21C, 21A | 4 | ja | `src/data/assessments.ts` | 2 scoringsonderdelen |
| 5 | lj3hv-pt6-screen-share | teams_share_simulation | pt6 | 23A | 3 | ja | `src/data/assessments.ts` | 3 scoringsonderdelen |
| 6 | lj3h-pt7-programming-debug-v1 | block_programming_task | pt7 | 22B | 4 | ja | `src/data/assessments.ts` | 2 debug-reparaties; 4 tests |
| 7 | pt8-whutsupp-sam-video | social_action_simulation | pt8 | 23B | 4 | ja | `src/data/whutsupp_pt8_flow.json` via `src/data/assessments.ts` | 4 Whutsupp-beslismomenten; harmful caps actief |
| 8 | lj3h-sr1-accountmail | multiple_choice | sr | 23A | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 9 | lj3h-vraag9-ai-betoog-v4 | social_action_simulation | sr | 21D | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | 2 scoringsonderdelen |
| 10 | lj3h-sr3-phone-actions | multiple_choice | sr | 21A | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | multiple select; option-id scoring; 7 opties |
| 11 | lj3h-sr4-triangulation | multiple_choice | sr | 21B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 12 | lj3h-sr5-filterbubble | multiple_choice | sr | 21B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 13 | lj3h-sr6-graph-scale | multiple_choice | sr | 21C | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 14 | lj3h-sr7-ai-source-check | multiple_choice | sr | 23B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 15 | lj3h-sr8-remix-rights | multiple_choice | sr | 22A | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 16 | lj3h-sr9-private-photo | multiple_choice | sr | 23B | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | single choice; option-id scoring; 5 opties |
| 17 | lj3h-sr10-platform-dependence | multiple_choice | sr | 23C | 1 | ja | `nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts` | multiple select; option-id scoring; 6 opties |

- Controle Vraag 2: e-mailtaak actief; inhoud ongemoeid gelaten.
- Controle Vraag 3: lj3h-pt3-security actief.
- Controle Vraag 9: lj3h-vraag9-ai-betoog-v4 actief; geen oud/dubbel item in UI-mapping gevonden.

