# Repo Audit

Datum: 2026-06-02

Deze audit is uitgevoerd voor de rootmap van de nulmetingen Digitale Geletterdheid webapp. Er zijn in FASE 1 geen destructieve acties uitgevoerd. De huidige inhoudelijke richting is v3.5, met de kanttekening dat de actieve machineleesbare JSON zichzelf als v3.6 identificeert. Dit moet inhoudelijk apart worden besloten.

## Samenvatting

- Actieve applicatiebron: `src/`, `api/`, `public/`, root `package.json`, `vite.config.ts`, `vercel.json`.
- Actieve buildscope: `tsconfig.json` include alleen `src`.
- Actieve selected-response import: `src/data/assessments.ts` importeert `nulmetingen_selected_response_herontwerp_v3.json`.
- Conflictpunt: `nulmetingen_selected_response_herontwerp_v3.json` meldt `schemaVersion: dg-nulmetingen-v3.6` en `source: nulmetingen_dg_herontwerp_v3_6_codex.md`, maar dat brondocument staat niet in de checkout.
- v3.5-bron: `nulmetingen_dg_herontwerp_v3_5_codex.md` stond untracked bij de start van de audit en moet behouden blijven.
- Oude/experimentele varianten stonden naast actieve bron: `_handoff/`, `frontend/`, `backend/`, `codex_v6/`, `codex_v7/`, oudere selected-response JSON/Markdown en oudere specificaties in `docs/`.
- Generated/lokale output is al genegeerd: `dist/`, `node_modules/`, `.vercel/`, `*.tsbuildinfo`, devserverlogs, `nulmetingen-webapp/`.

## Rootstructuur

| Pad | Status | Bewijs | Risico | Voorstel |
|---|---|---|---|---|
| `src/` | actueel | `tsconfig.json` include alleen `src`; `src/main.tsx` mount de app | hoog | behouden |
| `api/` | actueel | Vercel API-routes naast root `vercel.json` | hoog | behouden |
| `public/` | actueel | runtime-assets en downloads | hoog | behouden |
| `scripts/` | actueel | `package.json` scripts gebruiken `verify-anchors.js` en `kd-coverage.js` | middel | behouden |
| `docs/` | gemengd | bevat huidige docs plus v4/v5 specificaties | middel | huidige docs behouden, oude specs archiveren |
| `backend/` | oud | aparte Express-backend, niet gebruikt door root scripts of Vercel-config | middel | naar archive |
| `frontend/` | oud | oude React-appvariant, niet in root buildscope | middel | naar archive |
| `_handoff/` | oud/dubbel | kopie van eerdere bronbestanden | middel | naar archive |
| `codex_v6/` | oude patchset | v6 instructies/payloads, niet geimporteerd | middel | naar archive |
| `codex_v7/` | experimenteel/ongetracked | v7 PT7 instructies/payloads, niet geimporteerd | middel | naar archive |
| `design-system/` | onzeker | design assets/types/data, niet actief geimporteerd vanuit `src` | middel | behouden voor handmatige controle |
| `brand/` | dubbel/onzeker | assetkopie naast `public/brand` en `design-system/brand` | laag-middel | behouden voor handmatige controle |
| `dist/` | generated | genegeerd door `.gitignore` | laag | niet committen; lokaal verwijderen alleen na akkoord |
| `node_modules/` | generated | genegeerd door `.gitignore` | laag | niet committen |
| `.vercel/` | lokaal/generated | genegeerd door `.gitignore`, bevat env-bestanden | middel | niet committen; lokaal alleen na akkoord verwijderen |
| `nulmetingen-webapp/` | oude complete appkopie | genegeerd door `.gitignore` | middel | niet committen; lokaal alleen na akkoord verwijderen |

## Verdachte Bestanden

| Pad | Vermoedelijke status | Bewijs | Risico bij verwijderen | Voorstel |
|---|---|---|---|---|
| `nulmetingen_dg_herontwerp_v3_5_codex.md` | actueel/ongetracked bij start | user noemt v3.5 leidend; inhoudelijke v3.5-specificatie | hoog | behouden en tracken |
| `v3_5_https_stimulus_patch.json` | patchbewijs/ongetracked bij start | patch van v3.4 naar v3.5, niet geimporteerd | middel | behouden als auditbewijs of later archiveren |
| `nulmetingen_selected_response_herontwerp_v3.json` | actief maar conflicterend | geimporteerd door `src/data/assessments.ts`, maar schema zegt v3.6 | hoog | behouden; inhoudelijke status apart beslissen |
| `nulmetingen_selected_response_v1.json` | oud | niet geimporteerd | laag-middel | archive |
| `nulmetingen_selected_response_herontwerp_v1.md` | oud | niet geimporteerd | laag-middel | archive |
| `nulmetingen_selected_response_herontwerp_v2.md` | oud | niet geimporteerd | laag-middel | archive |
| `nulmetingen_selected_response_herontwerp_v2.json` | oud | niet geimporteerd | laag-middel | archive |
| `nulmetingen_dg_herontwerp_v3_config.json` | oud/onzeker | niet geimporteerd; verwijst naar v3-brondoc | laag-middel | archive |
| `docs/nulmetingen_dg_itemset_v4_1.md` | oude specificatie | niet geimporteerd; conflicteert met v3.5-richting | middel | archive |
| `docs/nulmetingen_dg_v4_2_specificatie_aangepast.md` | oude specificatie | niet geimporteerd | middel | archive |
| `docs/nulmetingen_dg_v4_3_specificatie_aangepast.md` | oude specificatie | niet geimporteerd | middel | archive |
| `docs/nulmetingen_dg_v5_specificatie.md` | nieuwere maar niet leidend | niet geimporteerd; user noemt v3.5 richting tenzij expliciet nieuwer bedoeld | hoog | archive met statuslabel, niet verwijderen |
| `codex_v6/*` | oude instructie/payload | tracked; niet geimporteerd; kan toekomstige wijzigingen sturen | middel | archive |
| `codex_v7/*` | experimentele instructie/payload | ongetracked; niet geimporteerd | middel | archive |
| `_handoff/*` | dubbele bron | tracked; niet in buildscope | middel | archive |
| `frontend/*` | oude appvariant | tracked; niet in root buildscope | middel | archive |
| `backend/*` | oude backendvariant | tracked; root gebruikt `api/` | middel | archive |
| `vite.config.js`, `vite.config.d.ts` | generated/dubbel | naast `vite.config.ts`; root config source is TS | laag-middel | verwijderen of archive na extra akkoord |
| `output/doc/nulmetingen_vragen_zonder_performance_taken.docx` | onzeker/generated | tracked documentoutput | middel | handmatig controleren |

## Doorlekplekken

1. `src/data/assessments.ts` importeert de actieve JSON met v3.6-metadata.
2. `scripts/verify-anchors.js` en `scripts/kd-coverage.js` lezen dezelfde actieve JSON, zonder expliciete v3.5-check.
3. `AGENTS.md` verwees naar een ontbrekend v4-brondocument en kon toekomstige Codex-runs de verkeerde kant op sturen.
4. Oude appvarianten en patchsets stonden naast actieve bronmappen.
5. `docs/` bevatte meerdere specificatiegeneraties zonder duidelijke statusmarkering.
6. Persistente opslag bevat momenteel meer dan aggregaten: `api/results.js` bewaart `result_json` met anonieme sessie en resultaat, en `event_logs` met antwoorden behalve voor een kleine aggregate-only set.

## Privacy En Scoring Observaties

- Antwoordopties worden per sessie gerandomiseerd in `src/lib/assessment.ts`.
- Getoonde optievolgorde wordt bij selected-response items meegestuurd via `shownOptionOrder`.
- Correcte antwoorden lijken niet als leerlingtekst gerenderd te worden, maar staan wel in runtime-data voor scoring.
- `src/lib/storage.ts` bewaart actieve sessies tijdelijk in `localStorage`.
- `api/results.js` persisteert anonieme sessie/resultaatdata. Dit voldoet mogelijk niet aan de extra regel dat permanente opslag beperkt moet blijven tot aggregaten.

## Gitstatus Bij Start

- Branch: `main`, 3 commits ahead op `origin/main`.
- Untracked bij start: `codex_v7/`, `nulmetingen_dg_herontwerp_v3_5_codex.md`, `v3_5_https_stimulus_patch.json`.

