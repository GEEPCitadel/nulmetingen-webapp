# Fase 1 — Herstructurering, tests en server-side MC-scoring (Claude)

Branch: `claude/herontwerp-v5` (worktree `worktrees/claude-v5`). Zie `verbeterrapport_dg_metingen_claude.md` voor het volledige plan.

## 1. App.tsx opgesplitst

`src/App.tsx` (7454 regels) is mechanisch opgesplitst, zonder gedragswijziging:

- `src/app/shared.tsx` — gedeelde types/helpers (requestJson, pdf-helpers, QuestionHeader, e.d.)
- `src/screens/` — StudentStartScreen, AdminAccessScreen, AdminScreen, AssessmentScreen, ResultScreen
- `src/components/` — AppShell, TaskNavFooter
- `src/items/` — één module per itemtype (MailTaskView, TeamsTask, BlockProgrammingTaskView, FileTaskWorkspace, WhutsuppTask, ChoiceItemView, enz.)
- `src/App.tsx` — alleen nog state/flow (±520 regels)

## 2. Tests

- Vitest toegevoegd: `npm test` (94 tests): structuur van alle vier versies, randomisatielogging, weet-niet-pinning, MC-scoring (correct → vol; weet-niet → 0), aggregatie, en de herscoringsflow hieronder.

## 3. Server-side MC-scoring (lekdichting v4-audit)

- `src/data/assessments.server.ts` — volledige data (servergebruik); `src/data/meta.ts` — themes/sloLabels/ADMIN_CODE.
- `scripts/generate-public-instruments.mts` (`npm run gen:instruments`, draait automatisch bij dev/build/test) genereert `src/data/assessments.public.json`: clientdata waarin per multiple-choice-item `correctAnswer`, `correctOptionIds`, `harmfulOptionIds`, `harmfulSelectionMaxScore`, `internalSlot` en optie-`errorCategory`/`sourceType` zijn verwijderd. Het script faalt hard als er toch een geheim veld achterblijft.
- `src/data/assessments.ts` is nu de geschoonde clientmodule (zelfde import-API als voorheen).
- De client scoort MC-items niet meer. Bij afronden roept de app `POST /api/finalize` aan; de server (`api/finalize.ts`) herscoort MC-items (`rescoreSessionResults` in `src/lib/assessment.ts`) en de client toont daarna pas het resultaat. Bij een fout: nette retry-melding. In lokale dev zonder API valt de app terug op lokale herscoring (deze tak wordt uit de productiebundel verwijderd).
- Gecontroleerd: de productiebundel bevat geen MC-antwoordmapping meer.

## 4. Bekende restpunten

- PT-scoring (mail, teams, interactietaken, blokprogrammeren, whutsupp) draait nog client-side; scoringsregels daarvan zitten nog in de bundel. Volgt in een latere fase.
- `/api/finalize` vertrouwt de aangeleverde sessie (zoals `/api/results` dat al deed); servergestuurde sessieopslag is een latere stap.
- E2e-doorloop (Playwright) staat gepland voor fase 4; tot die tijd geldt de handmatige doorloop van alle vier versies.

## 5. Commando's

- `npm run dev` / `npm run build` / `npm test` / `npm run gen:instruments`
