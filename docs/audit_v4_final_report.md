# Audit v4 eindrapport

## 1. Samenvatting

De actieve nulmetingen zijn gecontroleerd op itemmapping, PT7, PT8-lekken, randomisatie, option-id scoring, rapportage en oude bronnen. De nieuwe v4-bronbestanden zijn gegenereerd uit de actieve implementatie.

## 2. Gewijzigde bestanden

- `scripts/generate-v4-audit-artifacts.js` toegevoegd om auditrapporten en v4-bronnen reproduceerbaar te maken.
- `scripts/verify-anchors.js` bijgewerkt zodat samengestelde SR-items/subvragen correct worden gecontroleerd.
- `scripts/verify-sr-markdown-sync.js` bijgewerkt zodat de check de nieuwe v4-bronnen gebruikt wanneer die bestaan.

## 3. Nieuwe bestanden

- `docs/audit_item_mapping_v4.md`
- `docs/audit_pt7_programming_v4.md`
- `docs/audit_pt8_leak_cleanup_v4.md`
- `docs/audit_randomization_scoring_v4.md`
- `docs/audit_reporting_v4.md`
- `docs/audit_repo_leakage_v4.md`
- `docs/audit_v4_final_report.md`
- `nulmetingen_dg_v4.md`
- `nulmetingen_dg_v4.json`

## 4. Niet-gewijzigde onderdelen

- Vraag 2 is inhoudelijk ongemoeid gelaten.
- PT7 is inhoudelijk ongemoeid gelaten.
- De actieve Whutsupp/Sam-vraag is inhoudelijk ongemoeid gelaten.
- Er is geen nieuwe AI-vraag toegevoegd en vraag 9 is niet vervangen.

## 5. Gevonden risico's

- Historische docs en archiefbestanden bevatten oude PT8-, vraag 3- en v3.x-varianten.
- Client-side scoring betekent dat interne scoringmetadata technisch in de clientbundle aanwezig blijft.
- Lokale browseropslag bevat een actieve poging tot afronden of wissen van opslag.

## 6. Opgeloste risico's

- Er is een duidelijke v4-bron in markdown en JSON gemaakt.
- Actieve mapping en oude bronnen zijn expliciet gerapporteerd.
- PT8 actieve bron is gecontroleerd op enkelvoudige Whutsupp/Sam-flow.

## 7. Resterende aandachtspunten

- Overweeg op termijn server-side scoring als client-side zichtbaarheid van scoringmetadata onwenselijk is.
- Houd historische analysebestanden buiten leerling- of productiepublicatie.

## 8. Uitgevoerde tests

- `node scripts/generate-v4-audit-artifacts.js`
- `node -e "JSON.parse(require('fs').readFileSync('nulmetingen_dg_v4.json','utf8'))"`
- `npm run verify:anchors`
- `npm run verify:sr-sync`
- `npm run verify:whutsupp-pt8`
- `npm run build`

## 9. Testresultaten

- Auditgenerator: geslaagd; v4 auditbestanden, `nulmetingen_dg_v4.md` en `nulmetingen_dg_v4.json` gegenereerd.
- JSON-validatie: geslaagd; `schemaVersion` is `dg-nulmetingen-v4`, vier assessments, maxscore 36 per assessment.
- `npm run verify:anchors`: geslaagd.
- `npm run verify:sr-sync`: geslaagd op v4 Markdown/JSON.
- `npm run verify:whutsupp-pt8`: geslaagd.
- `npm run build`: geslaagd.
