# Audit resultaatrapportage v4

| controlepunt | resultaat | actie |
| --- | --- | --- |
| maxscore per assessment | lj1-vmbo: 36; lj1-hv: 36; lj3-vmbo: 36; lj3-hv: 36 | geen |
| puntentelling | `calculateResult` telt itemresultaten per scorende sectie; zelfinschatting heeft 0 punten | geen |
| SR/PT-splitsing | secties blijven afzonderlijk beschikbaar in `blockScores`; SR zit in sectie `sr` | geen |
| kerndoel/subdoelscores | `assessmentGoalIds` telt roots en subdoelen uit `kerndoel/subgoal/primarySubgoal` | geen |
| `Ik weet het niet` | multiple-choice krijgt `responseType: unknown`; PT8 telt `unknownCount`; niet als gewone juiste respons | geen |
| zelfinschatting | opgeslagen als metadata/resultaat met maxScore 0; telt niet mee | geen |
| normatieve labels | actieve UI gebruikt formatieve tekst zoals `geen cijfer` en `eerste beeld`; geen normatieve uitslaglabels in resultaatcomponent | geen |
| individuele groeiclaim | resultaat vergelijkt alleen zelfinschatting met score binnen dezelfde afname; geen groeiclaim | geen |
| validiteitsclaim | actieve UI claimt geen gevalideerd instrument | geen |
| privacy | lokale actieve sessie voor hervatten; serverresultaten bevatten sessie/resultaat voor klasaggregatie en geen permanente naam/e-mail/IP/fingerprint vanuit client | aandachtspunt documenteren: oude lokale sessie bevat pogingdata tot afsluiten of browseropslag wissen |
| PDF-output | bevat formatieve disclaimer, kerndoelen/subdoelen, geen correcte antwoorden | geen |
