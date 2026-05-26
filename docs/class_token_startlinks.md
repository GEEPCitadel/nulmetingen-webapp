# ClassToken-startlinks

De leerlingroute gebruikt startlinks met:

`/nulmeting/start/:assessmentId?classToken=<token>`

De leerling vult geen naam, e-mailadres of leerlingnummer in. Bij starten maakt de client een `anonymousAttemptId` en zet de `classToken` lokaal om naar een niet-herleidbare `classId`. Elke poging bewaart de `assessmentId`, `classId`, `anonymousAttemptId`, `startedAt`, `completedAt`, `selfAssessmentScore`, `itemResponses` via `results` en `scores` via `calculateResult`.

TODO: voeg een beheeromgeving/API toe waarin een docent of beheerder classTokens server-side aanmaakt en koppelt aan `classId`, `schoolId` en afnameperiode. De huidige client-hash is alleen een tijdelijke mapping zodat de afname al zonder leerlingidentiteit werkt.
