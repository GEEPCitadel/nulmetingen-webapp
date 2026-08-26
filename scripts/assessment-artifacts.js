import crypto from "node:crypto";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const assessmentSourcePath = path.join(root, "src", "data", "assessments.ts");
const metaPath = path.join(root, "src", "data", "assessment-build-meta.json");
const blueprintPath = path.join(root, "src", "data", "assessment-blueprint.json");
const selectedResponsePath = path.join(root, "nulmetingen_selected_response_herontwerp_v3.json");
const generatedItemDocs = [
  "docs/alle_vragen_en_afleiders_huidig.md",
  "docs/huidige_geimplementeerde_nulmeting.md",
  "docs/huidige_vragenlijsten_specificatie.md",
  "docs/analysis/nulmetingen_alle_vragen_antwoordmogelijkheden.md",
  "docs/analysis/nulmetingen_vragen_antwoorden_overzicht.md",
  "docs/analysis/nulmetingen_vragen_antwoorden_pt_overzicht.md",
];
const generatedBlueprintDocs = ["docs/assessment-toetsmatrijs.md"];
const generatedDocs = [...generatedItemDocs, ...generatedBlueprintDocs];

const stableSort = (value) => {
  if (Array.isArray(value)) return value.map(stableSort);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .filter((key) => key !== "assessmentContentHash")
      .map((key) => [key, stableSort(value[key])]),
  );
};

const stableJson = (value) => JSON.stringify(stableSort(value));
const sha256 = (value) => crypto.createHash("sha256").update(value, "utf8").digest("hex");

const loadAssessmentModule = () => {
  const previousTsLoader = Module._extensions[".ts"];
  Module._extensions[".ts"] = (module, fileName) => {
    const dependencySource = fs.readFileSync(fileName, "utf8");
    const dependencyOutput = ts.transpileModule(dependencySource, {
      compilerOptions: {
        esModuleInterop: true,
        module: ts.ModuleKind.CommonJS,
        resolveJsonModule: true,
        target: ts.ScriptTarget.ES2022,
      },
      fileName,
    }).outputText;
    module._compile(dependencyOutput, fileName);
  };
  const source = fs.readFileSync(assessmentSourcePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      resolveJsonModule: true,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: assessmentSourcePath,
  }).outputText;
  const assessmentModule = new Module(assessmentSourcePath);
  assessmentModule.filename = assessmentSourcePath;
  assessmentModule.paths = Module._nodeModulePaths(path.dirname(assessmentSourcePath));
  try {
    assessmentModule._compile(transpiled, assessmentSourcePath);
    return assessmentModule.exports;
  } finally {
    if (previousTsLoader) Module._extensions[".ts"] = previousTsLoader;
    else delete Module._extensions[".ts"];
  }
};

const { assessments } = loadAssessmentModule();
const oldMeta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, "utf8"));
const blueprintHash = sha256(stableJson(blueprint));
const contentHashes = Object.fromEntries(
  assessments.map((assessment) => [assessment.id, sha256(stableJson(assessment))]),
);
const buildContentHash = sha256(
  stableJson({
    assessmentBuildVersion: oldMeta.assessmentBuildVersion,
    assessmentContentHashes: contentHashes,
  }),
);

if (
  oldMeta.generatedForBuildVersion === oldMeta.assessmentBuildVersion &&
  oldMeta.buildContentHash &&
  oldMeta.buildContentHash !== buildContentHash
) {
  throw new Error(
    `De inhoud van ${oldMeta.assessmentBuildVersion} is gewijzigd zonder nieuwe assessmentBuildVersion. ` +
      "Verhoog eerst assessmentBuildVersion in src/data/assessment-build-meta.json.",
  );
}

const meta = {
  ...oldMeta,
  canonicalSource: "src/data/assessments.ts#assessments",
  sourceDirectionMarkdown: "nulmetingen_dg_herontwerp_v3_5_codex.md",
  activeSelectedResponseJson: "nulmetingen_selected_response_herontwerp_v3.json",
  generatedDocumentation: generatedDocs,
  generatedItemDocumentation: generatedItemDocs,
  generatedBlueprintDocumentation: generatedBlueprintDocs,
  assessmentBlueprint: "src/data/assessment-blueprint.json",
  blueprintVersion: blueprint.blueprintVersion,
  blueprintHash,
  assessmentContentHashes: contentHashes,
  buildContentHash,
  generatedForBuildVersion: oldMeta.assessmentBuildVersion,
};
fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, "utf8");

for (const assessment of assessments) {
  assessment.assessmentContentHash = contentHashes[assessment.id];
}

const selectedResponse = JSON.parse(fs.readFileSync(selectedResponsePath, "utf8"));
const aliases = Object.fromEntries(
  assessments.flatMap((assessment) =>
    assessment.sections.flatMap((section) =>
      section.items.flatMap((item) =>
        (item.legacyItemIds ?? []).map((legacyId) => [legacyId, item.id]),
      ),
    ),
  ),
);

const escapeMd = (value) =>
  String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\r\n", " ")
    .replaceAll("\n", " ")
    .trim();

const optionSummary = (item) => {
  if (item.options?.length) {
    return item.options.map((option) => `${option.id}: ${option.label}`).join(" · ");
  }
  const groups = item.socialTask?.screens?.flatMap((screen) => screen.groups ?? []) ?? [];
  if (groups.length) {
    return groups
      .map((group) => {
        const options = group.options ?? group.cards ?? [];
        return `${group.id}: ${options.map((option) => `${option.id}: ${option.label}`).join(" · ")}`;
      })
      .join(" / ");
  }
  if (item.whutsuppTask) {
    return item.whutsuppTask.nodes
      .map((node) => `${node.nodeId}: ${node.choices.map((choice) => `${choice.choiceId}: ${choice.label}`).join(" · ")}`)
      .join(" / ");
  }
  return "Zie taakconfiguratie in de canonieke appdefinitie.";
};

const detailLines = (assessment, section, item, number) => [
  `### ${number}. ${escapeMd(item.title)} (\`${item.id}\`)`,
  "",
  `- Sectie: \`${section.id}\` — ${escapeMd(section.title)}`,
  `- Type: \`${item.type}\``,
  `- Itemversie: \`${item.itemVersion}\``,
  `- Scoringversie: \`${item.scoringVersion}\``,
  `- Assessment-build: \`${assessment.assessmentBuildVersion}\``,
  `- Inhoudshash: \`${assessment.assessmentContentHash}\``,
  `- Kerndoel/subdoel: ${escapeMd(item.primarySubgoal ?? item.subgoal ?? item.kerndoel)}`,
  `- Maximumscore: ${item.points}`,
  item.legacyItemIds?.length ? `- Historische id-alias(sen): ${item.legacyItemIds.map((id) => `\`${id}\``).join(", ")}` : "- Historische id-alias(sen): geen",
  `- Leerlingtekst: ${escapeMd(item.instruction)}`,
  `- Antwoordmogelijkheden/taakconfiguratie: ${escapeMd(optionSummary(item))}`,
  "",
];

const lines = [
  "# Actuele nulmetingen Digitale Geletterdheid — gegenereerd overzicht",
  "",
  `<!-- GENERATED FILE: scripts/assessment-artifacts.js; build=${meta.assessmentBuildVersion}; hash=${buildContentHash} -->`,
  "",
  "> Dit interne overzicht bevat antwoord- en scoringsinformatie en is niet bestemd voor leerlingen.",
  "",
  "## Bron- en versiestatus",
  "",
  `- Canonieke actuele inhoudsbron: \`${meta.canonicalSource}\`.` ,
  `- Assessment-buildversie: \`${meta.assessmentBuildVersion}\`.` ,
  `- Build-inhoudshash (SHA-256): \`${buildContentHash}\`.` ,
  `- Inhoudelijke richting/source Markdown: \`${meta.sourceDirectionMarkdown}\`.` ,
  `- Actieve selected-response-JSON: \`${meta.activeSelectedResponseJson}\`.` ,
  "- Status: formatieve pilotwerkversie; niet presenteren als gevalideerd meetinstrument.",
  "",
  "## ID-migraties",
  "",
  "| historische item-id | actuele item-id |",
  "| --- | --- |",
  ...Object.entries(aliases).map(([oldId, newId]) => `| \`${oldId}\` | \`${newId}\` |`),
  "",
];

for (const assessment of assessments) {
  lines.push(
    `## ${escapeMd(assessment.title)} (\`${assessment.id}\`)`,
    "",
    `- Assessment-buildversie: \`${assessment.assessmentBuildVersion}\``,
    `- Assessment-inhoudshash (SHA-256): \`${assessment.assessmentContentHash}\``,
    `- Maximumscore: ${assessment.maxScore}`,
    `- Aantal items/taken: ${assessment.sections.flatMap((section) => section.items).length}`,
    "",
  );
  let number = 0;
  for (const section of assessment.sections) {
    for (const item of section.items) {
      number += 1;
      lines.push(...detailLines(assessment, section, item, number));
    }
  }
}

lines.push(
  "## Machinecontrole",
  "",
  `- Actieve SR-schema: \`${selectedResponse.schemaVersion}\``,
  `- Actieve SR-items: ${selectedResponse.selectedResponseItems?.length ?? 0}`,
  `- Gegenereerde documentatiebestanden: ${generatedDocs.length}`,
  "- Controlecommando: `npm run verify:content-sync`",
  "",
);

const document = `${lines.join("\n").trimEnd()}\n`;
for (const relativePath of generatedItemDocs) {
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, document, "utf8");
}

const coverageLabel = {
  sampled: "bewust bemonsterd",
  partial: "gedeeltelijk bemonsterd",
  not_sampled: "bewust niet bemonsterd",
};

const resolveEvidenceSelector = (assessment, selector) => {
  const [kind, value] = selector.split(":");
  if (kind === "section") {
    return assessment.sections.find((section) => section.id === value)?.items.filter((item) => item.points > 0) ?? [];
  }
  if (kind === "sr") {
    const index = Number(value) - 1;
    const items = assessment.sections.find((section) => section.id === "sr")?.items ?? [];
    return items[index] && items[index].points > 0 ? [items[index]] : [];
  }
  throw new Error(`Onbekende blueprint-evidenceselector: ${selector}`);
};

const primarySubgoal = (item) =>
  String(item.primarySubgoal ?? item.subgoal ?? item.kerndoel).match(/\b(21[A-D]|22[A-B]|23[A-C])\b/)?.[1] ?? null;

const matrixLines = [
  "# Toetsmatrijs nulmetingen Digitale Geletterdheid — indicatorniveau",
  "",
  `<!-- GENERATED FILE: scripts/assessment-artifacts.js; build=${meta.assessmentBuildVersion}; hash=${buildContentHash}; blueprint=${meta.blueprintVersion}; blueprint-hash=${blueprintHash} -->`,
  "",
  "> Dit is een formatieve pilotmatrix. De nulmetingen zijn niet gevalideerd en de uitkomsten zijn geen landelijke norm of beheersingsbewijs.",
  "",
  "## Officiële referentie en status",
  "",
  `- Referentie: [${escapeMd(blueprint.officialReference.title)}](${blueprint.officialReference.url}), ${escapeMd(blueprint.officialReference.publisher)}, ${escapeMd(blueprint.officialReference.edition)}.`,
  `- Juridische/curriculaire status: ${escapeMd(blueprint.officialReference.status)}`,
  `- Status gecontroleerd op ${escapeMd(blueprint.officialReference.statusVerifiedOn)} via [SLO — definitieve conceptkerndoelen digitale geletterdheid](${blueprint.officialReference.statusUrl}).`,
  `- Tekstgebruik: ${escapeMd(blueprint.officialReference.wordingNote)}`,
  `- Matrixversie: \`${blueprint.blueprintVersion}\`; matrixhash (SHA-256): \`${blueprintHash}\`.`,
  "",
  "## Interpretatie van scores",
  "",
  `- Hoofdterm: **${escapeMd(blueprint.reportingPolicy.totalScoreTerm)}**; de term **${escapeMd(blueprint.reportingPolicy.profileTerm)}** mag alleen als secundaire profielterm worden gebruikt.`,
  `- Schaalstructuur aangetoond: **${blueprint.reportingPolicy.scaleEvidence ? "ja" : "nee"}**.`,
  `- ${escapeMd(blueprint.reportingPolicy.interpretation)}`,
  `- Enkel-itemregel: ${escapeMd(blueprint.reportingPolicy.singleItemRule)}`,
  "",
  "## Bewuste zwaartepunten",
  "",
  ...blueprint.weightingRationale.rationale.map((reason) => `- ${escapeMd(reason)}`),
  "",
  "De puntenverdeling hieronder gebruikt uitsluitend het primaire subdoel van ieder scorend item. Zo wordt PT4 niet dubbel geteld vanwege de secundaire 21A-koppeling.",
  "",
  "| variant | 21A | 23A | 23B | samen | totale itemset | aandeel |",
  "| --- | ---: | ---: | ---: | ---: | ---: | ---: |",
];

for (const assessment of assessments) {
  const pointsBySubgoal = Object.fromEntries(blueprint.subgoals.map((subgoal) => [subgoal.id, 0]));
  for (const item of assessment.sections.flatMap((section) => section.items).filter((item) => item.points > 0)) {
    const goalId = primarySubgoal(item);
    if (goalId) pointsBySubgoal[goalId] = (pointsBySubgoal[goalId] ?? 0) + item.points;
  }
  const priorityPoints = blueprint.weightingRationale.prioritySubgoals.reduce(
    (sum, goalId) => sum + (pointsBySubgoal[goalId] ?? 0),
    0,
  );
  const share = assessment.maxScore ? ((priorityPoints / assessment.maxScore) * 100).toFixed(1) : "0.0";
  matrixLines.push(
    `| \`${assessment.id}\` | ${pointsBySubgoal["21A"]} | ${pointsBySubgoal["23A"]} | ${pointsBySubgoal["23B"]} | ${priorityPoints} | ${assessment.maxScore} | ${share}% |`,
  );
}

matrixLines.push(
  "",
  "## Schoolreferentie voor `lj3-vmbo`",
  "",
  `- ${escapeMd(blueprint.lj3VmboReference.referenceUse)}`,
  `- Begrenzing: ${escapeMd(blueprint.lj3VmboReference.limitations)}`,
  `- Vergelijkingsregel: ${escapeMd(blueprint.lj3VmboReference.comparisonRule)}`,
  "",
  "## Dekkingslegenda",
  "",
  ...Object.entries(blueprint.coverageLevels).map(([level, description]) => `- **${coverageLabel[level]}**: ${escapeMd(description)}`),
  "",
  "## Matrix per subdoel en officiële bullet",
  "",
);

for (const subgoal of blueprint.subgoals) {
  const primaryItemsByAssessment = assessments.map((assessment) => {
    const items = assessment.sections
      .flatMap((section) => section.items)
      .filter((item) => item.points > 0 && primarySubgoal(item) === subgoal.id);
    return { assessment, items };
  });
  const oneItemInEveryVariant = primaryItemsByAssessment.every(({ items }) => items.length === 1);
  matrixLines.push(
    `### ${subgoal.id} — ${escapeMd(subgoal.label)}`,
    "",
    `Rapportage: ${oneItemInEveryVariant ? "**itemsignaal; geen percentage-subscore**" : "beschrijvende profielscore, met beperkte dekking"}.`,
    "",
    "| variant | primaire actieve items/taken | punten |",
    "| --- | --- | ---: |",
    ...primaryItemsByAssessment.map(({ assessment, items }) =>
      `| \`${assessment.id}\` | ${items.map((item) => `\`${item.id}\``).join("<br>") || "—"} | ${items.reduce((sum, item) => sum + item.points, 0)} |`,
    ),
    "",
    "| officiële bullet | status per variant | actief scorebewijs | toelichting en begrenzing |",
    "| --- | --- | --- | --- |",
  );
  for (const bullet of subgoal.bullets) {
    const applicableAssessments = assessments.filter(
      (assessment) => !bullet.appliesTo || bullet.appliesTo.includes(assessment.id),
    );
    const statuses = applicableAssessments.map((assessment) => ({
      id: assessment.id,
      coverage: bullet.variantCoverage?.[assessment.id] ?? bullet.coverage,
    }));
    const groupedStatuses = Object.entries(
      statuses.reduce((groups, status) => ({
        ...groups,
        [status.coverage]: [...(groups[status.coverage] ?? []), status.id],
      }), {}),
    );
    const statusText = groupedStatuses
      .map(([coverage, ids]) => `${coverageLabel[coverage]} (${ids.map((id) => `\`${id}\``).join(", ")})`)
      .join("<br>");
    const evidenceText = applicableAssessments
      .map((assessment) => {
        const evidence = Array.from(
          new Map(
            (bullet.evidenceSelectors ?? [])
              .flatMap((selector) => resolveEvidenceSelector(assessment, selector))
              .map((item) => [item.id, item]),
          ).values(),
        );
        const effectiveCoverage = bullet.variantCoverage?.[assessment.id] ?? bullet.coverage;
        return effectiveCoverage === "not_sampled" || evidence.length === 0
          ? null
          : `\`${assessment.id}\`: ${evidence.map((item) => `\`${item.id}\``).join(", ")}`;
      })
      .filter(Boolean)
      .join("<br>") || "—";
    matrixLines.push(
      `| ${escapeMd(bullet.id)} — ${escapeMd(bullet.paraphrase)} | ${statusText} | ${evidenceText} | ${escapeMd(bullet.note)} |`,
    );
  }
  matrixLines.push("");
}

matrixLines.push(
  "## Reproduceerbaarheid",
  "",
  `Deze matrix is gegenereerd uit \`${meta.assessmentBlueprint}\` en de canonieke appitems in \`${meta.canonicalSource}\`. Voer \`npm run assessment:generate\` uit om haar opnieuw op te bouwen en \`npm run verify:content-sync\` om bron, items, metadata en dit rapport samen te controleren.`,
  "",
);

const matrixDocument = `${matrixLines.join("\n").trimEnd()}\n`;
for (const relativePath of generatedBlueprintDocs) {
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, matrixDocument, "utf8");
}

const chainPath = path.join(root, "docs", "assessment-version-chain.md");
fs.writeFileSync(
  chainPath,
  `# Assessmentversie- en bronketen\n\n<!-- GENERATED FILE: scripts/assessment-artifacts.js; build=${meta.assessmentBuildVersion}; hash=${buildContentHash} -->\n\nDe export \`${meta.canonicalSource}\` is de enige canonieke actuele inhoudsbron. De source-direction-Markdown en actieve selected-response-JSON zijn invoerlagen die de sync-controle altijd tegen de geconstrueerde appitems vergelijkt. De actuele itemoverzichten en toetsmatrijs worden uitsluitend door \`npm run assessment:generate\` geschreven.\n\nDe indicatorbeslissingen staan machineleesbaar in \`${meta.assessmentBlueprint}\` (matrixversie \`${meta.blueprintVersion}\`, SHA-256 \`${meta.blueprintHash}\`). De rapportage gebruikt **itemsetscore** voor het totaal en een **itemsignaal zonder percentage** als precies één item of taak aan een subdoel bijdraagt.\n\nPer afname worden assessment-buildversie, SHA-256-inhoudshash, itemversie en scoringversie opgeslagen. Historische id's worden via de aliaslijst in de gegenereerde overzichten naar hun actuele id gemigreerd.\n`,
  "utf8",
);

console.log(`Assessment-artifacts gegenereerd voor ${assessments.length} varianten (${buildContentHash}).`);
