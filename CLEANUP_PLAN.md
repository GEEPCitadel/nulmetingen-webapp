# Cleanup Plan

Datum: 2026-06-02

Dit plan houdt rekening met de veiligheidsregel: bij twijfel niet verwijderen. Permanente verwijdering gebeurt alleen na expliciet akkoord.

## 1. Zeker Behouden

- `src/`
- `api/`
- `public/`
- `scripts/`
- `package.json`
- `package-lock.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vite.config.ts`
- `vercel.json`
- `database/schema.sql`
- `config/.env.example`
- `docs/README.md`
- `docs/DEPLOYMENT.md`
- `docs/class_token_startlinks.md`
- `docs/huidige_geimplementeerde_nulmeting.md`
- `docs/huidige_vragenlijsten_specificatie.md`
- `docs/alle_vragen_en_afleiders_huidig.md`
- `docs/performance_taken_overzicht_analyse.md`
- `nulmetingen_dg_herontwerp_v3_5_codex.md`
- `nulmetingen_selected_response_herontwerp_v3.json`
- `v3_5_https_stimulus_patch.json`
- `design-system/` en `brand/` tot handmatig is vastgesteld welke assetbron leidend is.

## 2. Veilig Naar Archive Verplaatsen

Doelmap: `archive/legacy/2026-06-02/`

- `_handoff/`
- `frontend/`
- `backend/`
- `codex_v6/`
- `codex_v7/`
- `nulmetingen_selected_response_v1.json`
- `nulmetingen_selected_response_herontwerp_v1.md`
- `nulmetingen_selected_response_herontwerp_v2.md`
- `nulmetingen_selected_response_herontwerp_v2.json`
- `nulmetingen_dg_herontwerp_v3_config.json`
- `docs/nulmetingen_dg_itemset_v4_1.md`
- `docs/nulmetingen_dg_v4_2_specificatie_aangepast.md`
- `docs/nulmetingen_dg_v4_3_specificatie_aangepast.md`
- `docs/nulmetingen_dg_v5_specificatie.md`

Deze bestanden/mappen zijn niet actief in de root Vite-build en worden niet geimporteerd door de actieve app.

## 3. Waarschijnlijk Verwijderen, Alleen Na Akkoord

Deze paden zijn lokaal/generated of genegeerd. Verwijder ze niet in een commit zonder expliciete opdracht:

- `dist/`
- `node_modules/`
- `.vercel/`
- `*.tsbuildinfo`
- `devserver*.log`
- `devserver*.err.log`
- `nulmetingen-webapp/`
- `vite.config.js`
- `vite.config.d.ts`

Let op: `.vercel/` kan omgevingsvariabelen of secrets bevatten. Niet archiveren of committen.

## 4. Onzeker, Handmatige Controle

- `design-system/`
- `brand/`
- `output/doc/nulmetingen_vragen_zonder_performance_taken.docx`
- `docs/huidige_geimplementeerde_nulmeting.md`
- `docs/huidige_vragenlijsten_specificatie.md`
- `docs/alle_vragen_en_afleiders_huidig.md`
- De inhoudelijke status van `nulmetingen_selected_response_herontwerp_v3.json`, omdat deze actief is maar zichzelf als v3.6 meldt.

## 5. Noodzakelijke Aanpassingen

- `AGENTS.md` moet de huidige v3.5-richting noemen en niet langer verwijzen naar een ontbrekend v4-brondocument.
- Archive moet een README krijgen met uitleg dat bestanden niet verwijderd zijn maar legacy/onzeker zijn.
- Geen imports hoeven te worden aangepast zolang alleen niet-geimporteerde legacy-paden worden verplaatst.
- Geen assessmentinhoud wijzigen zonder aparte opdracht.
- Privacy/opslagfix apart plannen: permanente opslag moet aggregaatgericht worden gemaakt als dit productieregel is.

## 6. Checks

Na elke wijzigingsbatch:

1. `npm install` of `npm ci` alleen als dependencies ontbreken of packagebestanden wijzigen.
2. `npm run build`
3. `npm run verify:anchors`
4. `npm run report:kd-coverage`
5. Zoekcontrole op oude verwijzingen:
   - `v3.4`
   - `v3.6`
   - `v4`
   - `v5`
   - `v6`
   - `v7`
   - `codex_v6`
   - `codex_v7`
   - `_handoff`
   - oude selected-response bestandsnamen
6. Handmatige traversal van alle vier versies:
   - `lj1-vmbo`
   - `lj1-hv`
   - `lj3-vmbo`
   - `lj3-hv`

