# Assessmentversie- en bronketen

<!-- GENERATED FILE: scripts/assessment-artifacts.js; build=dg-pilot-2026.08.25.3; hash=09fc01f801f440515804723497832569bd2aca2168d489b404c056b386882c37 -->

De export `src/data/assessments.ts#assessments` is de enige canonieke actuele inhoudsbron. De source-direction-Markdown en actieve selected-response-JSON zijn invoerlagen die de sync-controle altijd tegen de geconstrueerde appitems vergelijkt. De actuele itemoverzichten en toetsmatrijs worden uitsluitend door `npm run assessment:generate` geschreven.

De indicatorbeslissingen staan machineleesbaar in `src/data/assessment-blueprint.json` (matrixversie `2026.08.25.2`, SHA-256 `39a613033e9338e62528b54ba5b8c1a9a4f258f96da87a8df3cf6a8be97a340d`). De rapportage gebruikt **itemsetscore** voor het totaal en een **itemsignaal zonder percentage** als precies één item of taak aan een subdoel bijdraagt.

Per afname worden assessment-buildversie, SHA-256-inhoudshash, itemversie en scoringversie opgeslagen. Historische id's worden via de aliaslijst in de gegenereerde overzichten naar hun actuele id gemigreerd.
