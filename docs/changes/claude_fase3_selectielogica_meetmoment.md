# Fase 3 — Selectielogica meetmoment: nulmeting vs. voortgangsmeting (Claude)

Status: gebouwd 11-06-2026, vervolg op `claude_fase2_pt_inkorting_parallelvarianten.md`. De app kan nu per meetmoment de bankvariant inzetten voor elk variabel slot.

## Ontwerp

Nieuw begrip `MeasurementMoment` (`"nulmeting" | "voortgangsmeting"`, default nulmeting) loopt als dimensie door de hele keten:

1. **Build-time** (`assessments.server.ts`): per versie worden nu twee instrumentvormen gebouwd.
   - Nulmeting: actieve variant per variabel slot, PT9-slidevorm (zoals voorheen).
   - Voortgangsmeting: `withParallelVariants` vervangt elk item met `anchorStatus: "variable"`/`"variable-slot"` (SR4/7/8/10 + beide mini-PT's) door de bankvariant uit `parallelVariantItems` (match op `targetGroup` + `parallelTo` → actieve `itemVersion`; ontbreekt een variant, dan faalt de build hard). PT9 gebruikt de postervorm (matrijsbesluit 10-06-2026: parallelvormen per meetmoment). Ankeritems identiek in beide vormen.
   - Exports: `voortgangsAssessments`, `voortgangsAssessmentMap`, `assessmentMapForMoment(moment)`.
2. **Public data** (`generate-public-instruments.mts` → `assessments.public.json`): bevat beide vormen, beide geschoond van scoringsgeheimen (controle op lek in beide sets). Client-module `assessments.ts` exporteert dezelfde drie nieuwe symbolen.
3. **Toewijzing** (beheer → DB → login):
   - `students` krijgt kolom `measurement_moment` (ALTER ... IF NOT EXISTS in `students.js` en `student-login.js`; bestaande rijen = NULL = nulmeting).
   - Beheerscherm: nieuwe select "Meetmoment" naast "Assessment"; geldt voor handmatige invoer én CSV/Excel-import (`body.measurementMoment` als default per batch, per rij overschrijfbaar). Leerlingtabel toont "· voortgang" in de meting-pill; exports krijgen kolom "Meetmoment".
   - `student-login.js` geeft `measurementMoment` terug; nieuwe testcodes TESTVMBO1V / TESTHV1V / TESTVMBO3V / TESTHV3V voor de voortgangsvorm.
4. **Sessie en scoring**:
   - `AssessmentSession.measurementMoment` (optioneel; oude sessies = nulmeting). `createSession` accepteert het moment; `getAssessment(session)` kiest de vorm via `assessmentMapForMoment`.
   - `/api/finalize` herscoort tegen de juiste vorm op basis van `session.measurementMoment`. Hervatten via opgeslagen `session_json` behoudt het moment automatisch.

## Verificatie

- Nieuw `src/lib/measurementMoment.test.ts` (18 tests): beide vormen aanwezig; gelijke maxScore (39) en itemaantallen; ankers byte-gelijk (id, itemVersion, punten); per versie exact 6 variabele slots vervangen door de juiste bankvariant (zelfde slot, punten, subdoel; `parallelTo` klopt); PT9 slide↔poster met gelijke punten; default-moment = nulmeting.
- Alle tests: **196 passed** (178 + 18). `tsc -b` schoon, `vite build` slaagt, `verify-anchors`, `verify-whutsupp-pt8` en `verify-sr-markdown-sync` geslaagd.
- Let op: OneDrive-sync naar de Linux-sandbox leverde opnieuw afgekapte bestanden; tests draaiden op een verse kopie in /tmp waarvan de staarten met de Windows-bestanden zijn gelijkgetrokken.

## Bewust niet gedaan / open

- Resultaten-/analyselaag (beheeromgeving) filtert nog niet op meetmoment; groeiweergave nul ↔ voortgang op ankerblok is de volgende stap van fase 3 (beheer-UI).
- `assessment_sessions`/`assessment_results` hebben geen aparte meetmoment-kolom; het moment zit in `session_json` en is via `itemVersion` per resultaat herleidbaar. Kolom toevoegen kan later zonder migratie-pijn.
- Geen verbose UI voor leerlingen: de voortgangsmeting presenteert zich identiek (zelfde titel/duur), alleen de variabele items en PT9-vorm verschillen.
