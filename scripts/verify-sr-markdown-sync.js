import crypto from "node:crypto";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const sourceMarkdownPath = "nulmetingen_dg_herontwerp_v3_5_codex.md";
const activeJsonPath = "nulmetingen_selected_response_herontwerp_v3.json";
const assessmentSourcePath = path.join(root, "src", "data", "assessments.ts");
const metaPath = path.join(root, "src", "data", "assessment-build-meta.json");
const blueprintPath = path.join(root, "src", "data", "assessment-blueprint.json");
const v4Paths = ["nulmetingen_dg_v4.md", "nulmetingen_dg_v4.json"];
const versionIds = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"];
const failures = [];

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
const sha256 = (value) => crypto.createHash("sha256").update(value, "utf8").digest("hex");
const stableJson = (value) => JSON.stringify(stableSort(value));
const normalizedText = (value) => String(value ?? "").replace(/\bWhutsupp\b/gi, "WhatsApp").trim();
const list = (value) => (Array.isArray(value) ? value : value ? [value] : []);

const loadAssessmentModule = () => {
  const previousTsLoader = Module._extensions[".ts"];
  Module._extensions[".ts"] = (module, fileName) => {
    const source = fs.readFileSync(fileName, "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, resolveJsonModule: true, target: ts.ScriptTarget.ES2022 },
      fileName,
    }).outputText;
    module._compile(output, fileName);
  };
  const source = fs.readFileSync(assessmentSourcePath, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, resolveJsonModule: true, target: ts.ScriptTarget.ES2022 },
    fileName: assessmentSourcePath,
  }).outputText;
  const module = new Module(assessmentSourcePath);
  module.filename = assessmentSourcePath;
  module.paths = Module._nodeModulePaths(path.dirname(assessmentSourcePath));
  try {
    module._compile(output, assessmentSourcePath);
    return module.exports;
  } finally {
    if (previousTsLoader) Module._extensions[".ts"] = previousTsLoader;
    else delete Module._extensions[".ts"];
  }
};

const activeJson = JSON.parse(fs.readFileSync(activeJsonPath, "utf8"));
const sourceMarkdown = fs.readFileSync(sourceMarkdownPath, "utf8");
const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, "utf8"));
const { assessments } = loadAssessmentModule();

if (!sourceMarkdown.includes("versie 3.7")) failures.push(`${sourceMarkdownPath}: actuele versierichting 3.7 ontbreekt.`);
if (activeJson.schemaVersion !== "dg-nulmetingen-v3.7") failures.push(`${activeJsonPath}: onverwachte schemaVersion.`);
if (!sourceMarkdown.includes(meta.assessmentBuildVersion) || !sourceMarkdown.includes(meta.buildContentHash)) failures.push(`${sourceMarkdownPath}: buildversie/hash wijkt af van de bronketen.`);
if (activeJson.assessmentBuildVersion !== meta.assessmentBuildVersion) failures.push(`${activeJsonPath}: assessment-buildversie wijkt af.`);
if (meta.generatedForBuildVersion !== meta.assessmentBuildVersion) failures.push(`${metaPath}: hash is niet voor de actuele buildversie gegenereerd.`);
if (meta.assessmentBlueprint !== "src/data/assessment-blueprint.json") failures.push(`${metaPath}: toetsmatrijsbron ontbreekt.`);
if (meta.blueprintVersion !== blueprint.blueprintVersion) failures.push(`${metaPath}: toetsmatrijsversie wijkt af.`);
if (meta.blueprintHash !== sha256(stableJson(blueprint))) failures.push(`${metaPath}: toetsmatrijshash wijkt af.`);
if (assessments.length !== versionIds.length) failures.push(`App bevat ${assessments.length} assessments in plaats van ${versionIds.length}.`);

const activeIds = new Set();
const aliases = new Map();
for (const versionId of versionIds) {
  const assessment = assessments.find((entry) => entry.id === versionId);
  if (!assessment) {
    failures.push(`${versionId}: ontbreekt in geconstrueerde appitems.`);
    continue;
  }
  const expectedHash = sha256(stableJson(assessment));
  if (meta.assessmentContentHashes?.[versionId] !== expectedHash) failures.push(`${versionId}: inhoudshash wijkt af; voer npm run assessment:generate uit.`);
  if (assessment.assessmentContentHash !== expectedHash) failures.push(`${versionId}: app draagt niet de actuele inhoudshash.`);
  if (assessment.assessmentBuildVersion !== meta.assessmentBuildVersion) failures.push(`${versionId}: buildversie wijkt af.`);

  const allItems = assessment.sections.flatMap((section) => section.items);
  for (const item of allItems) {
    if (!item.itemVersion || !item.scoringVersion || !item.assessmentBuildVersion) failures.push(`${versionId}/${item.id}: onvolledige item/scoring/buildprovenance.`);
    if (item.assessmentBuildVersion !== assessment.assessmentBuildVersion) failures.push(`${versionId}/${item.id}: verkeerde assessment-buildversie.`);
    activeIds.add(item.id);
    for (const legacyId of item.legacyItemIds ?? []) {
      if (aliases.has(legacyId) || activeIds.has(legacyId)) failures.push(`${legacyId}: alias botst met een andere id.`);
      aliases.set(legacyId, item.id);
    }
  }

  const pt3 = allItems.find((item) => item.type === "account_security_simulation");
  const originRule = pt3?.securityTask?.rules.find((rule) => rule.id === "origin-signal");
  const requestRule = pt3?.securityTask?.rules.find((rule) => rule.id === "request-signal");
  if (!originRule || !requestRule) failures.push(`${versionId}: PT3 mist de twee onafhankelijke signaalregels.`);
  else if ((originRule.correctOptionIds ?? []).some((id) => (requestRule.correctOptionIds ?? []).includes(id))) failures.push(`${versionId}: PT3-signaalcategorieën overlappen.`);

  const pt4 = allItems.find((item) => item.type === "excel_download_task");
  if (!pt4?.excelTask?.simulation) failures.push(`${versionId}: PT4 gebruikt niet de ingebouwde tabelsimulatie.`);
  else {
    const rulePoints = pt4.excelTask.simulation.rules.reduce((sum, rule) => sum + rule.points, 0);
    if (rulePoints !== pt4.points) failures.push(`${versionId}: PT4-regelpunten (${rulePoints}) wijken af van maxscore (${pt4.points}).`);
    if ((pt4.excelTask.questions ?? []).length) failures.push(`${versionId}: PT4 bevat nog eindcodevragen.`);
  }

  const pt8 = allItems.find((item) => item.type === "social_action_simulation");
  if ((pt8?.socialTask?.screens.length ?? 0) !== 4 || (pt8?.socialTask?.rules.length ?? 0) !== 4) failures.push(`${versionId}: PT8 moet vier schermen en vier scorecategorieën hebben.`);
  if (pt8?.ankerItemFlag) failures.push(`${versionId}: PT8 mag in deze niveaugedifferentieerde versie geen anker zijn.`);

  const jsonItems = activeJson.selectedResponseItems.filter((item) => item.targetGroup === versionId);
  const appSrItems = assessment.sections.find((section) => section.id === "sr")?.items ?? [];
  if (jsonItems.length !== 10 || appSrItems.length !== 10) failures.push(`${versionId}: JSON/app bevatten respectievelijk ${jsonItems.length}/${appSrItems.length} SR-items.`);
  for (const jsonItem of jsonItems) {
    const appItem = appSrItems.find((item) => item.id === jsonItem.id);
    if (!sourceMarkdown.includes(`\`${jsonItem.id}\``)) failures.push(`${jsonItem.id}: ontbreekt in source Markdown.`);
    if (!appItem) {
      failures.push(`${jsonItem.id}: ontbreekt in geconstrueerde appitems.`);
      continue;
    }
    if (normalizedText(jsonItem.title) !== normalizedText(appItem.title)) failures.push(`${jsonItem.id}: titel wijkt af tussen JSON en app.`);
    if (normalizedText(jsonItem.question) !== normalizedText(appItem.instruction)) failures.push(`${jsonItem.id}: vraagtekst wijkt af tussen JSON en app.`);
    if (stableJson(jsonItem.legacyItemIds ?? []) !== stableJson(appItem.legacyItemIds ?? [])) failures.push(`${jsonItem.id}: aliassen wijken af tussen JSON en app.`);

    if (jsonItem.options?.length) {
      const jsonOptions = jsonItem.options.map((option) => ({
        id: String(option.id ?? option.optionId),
        label: normalizedText(option.label ?? option.text),
        description:
          option.label && normalizedText(option.label) !== normalizedText(option.text)
            ? normalizedText(option.text)
            : undefined,
        sourceType: option.sourceType,
      }));
      const appOptions = (appItem.options ?? []).map((option) => ({
        id: String(option.id),
        label: normalizedText(option.label),
        description: option.description ? normalizedText(option.description) : undefined,
        sourceType: option.sourceType,
      }));
      if (stableJson(jsonOptions) !== stableJson(appOptions)) failures.push(`${jsonItem.id}: antwoordopties wijken af tussen JSON en app.`);
      const correctIds = new Set(list(jsonItem.correctAnswer).map(String));
      const jsonCorrect = jsonItem.options.filter((option) => option.isCorrect === true || option.correct === true || correctIds.has(String(option.id ?? option.optionId))).map((option) => String(option.id ?? option.optionId)).sort();
      const appCorrect = list(appItem.correctAnswer).map(String).sort();
      if (stableJson(jsonCorrect) !== stableJson(appCorrect)) failures.push(`${jsonItem.id}: correctiesleutel wijkt af tussen JSON en app.`);
      const absoluteDistractors = jsonItem.options.filter((option) => {
        const id = String(option.id ?? option.optionId);
        const isCorrect = option.isCorrect === true || option.correct === true || correctIds.has(id);
        return !isCorrect && option.isUnknownOption !== true && /\b(altijd|nooit|automatisch|iedereen|allemaal|vanzelf)\b/i.test(option.text ?? option.label ?? "");
      });
      if (absoluteDistractors.length) failures.push(`${jsonItem.id}: onjuiste opties bevatten verradende absolute formuleringen (${absoluteDistractors.map((option) => option.id ?? option.optionId).join(", ")}).`);
    }
  }
}

const sourceResultItem = activeJson.selectedResponseItems.find((item) => item.id === "lj1h-sr4-search-query");
if (sourceResultItem?.ui?.renderAsSourceCards !== true || sourceResultItem.options?.filter((option) => !option.isUnknownOption).some((option) => !option.label || !option.sourceType)) failures.push("lj1h-sr4-search-query: bronkaarten zijn onvolledig geconfigureerd.");
const graphItem = activeJson.selectedResponseItems.find((item) => item.id === "lj3h-sr6-graph-scale");
if (graphItem?.stimulus?.kind !== "comparison-bar-chart") failures.push("lj3h-sr6-graph-scale: genormaliseerde grafiekstimulus ontbreekt.");
for (const itemId of ["lj3v-sr9-photo-shared", "lj3h-sr9-private-photo"]) {
  const item = activeJson.selectedResponseItems.find((entry) => entry.id === itemId);
  if (item?.itemType !== "multiple-select" || list(item.correctAnswer).length !== 2) failures.push(`${itemId}: afzonderlijke acties worden niet afzonderlijk gescoord.`);
}

const buildHash = sha256(stableJson({ assessmentBuildVersion: meta.assessmentBuildVersion, assessmentContentHashes: meta.assessmentContentHashes }));
if (buildHash !== meta.buildContentHash) failures.push("Build-inhoudshash in assessment-build-meta.json is ongeldig.");

const generatedItemDocs = meta.generatedItemDocumentation ?? [];
let referenceDocument = null;
for (const relativePath of generatedItemDocs) {
  if (!fs.existsSync(relativePath)) {
    failures.push(`${relativePath}: afgeleid overzicht ontbreekt.`);
    continue;
  }
  const markdown = fs.readFileSync(relativePath, "utf8");
  const marker = `build=${meta.assessmentBuildVersion}; hash=${meta.buildContentHash}`;
  if (!markdown.includes(marker)) failures.push(`${relativePath}: gegenereerde build/hash-marker wijkt af.`);
  for (const itemId of activeIds) {
    if (!markdown.includes(`\`${itemId}\``)) failures.push(`${relativePath}: item ${itemId} ontbreekt.`);
  }
  if (referenceDocument === null) referenceDocument = markdown;
  else if (referenceDocument !== markdown) failures.push(`${relativePath}: afgeleid overzicht is niet reproduceerbaar identiek.`);
}

const generatedBlueprintDocs = meta.generatedBlueprintDocumentation ?? [];
for (const relativePath of generatedBlueprintDocs) {
  if (!fs.existsSync(relativePath)) {
    failures.push(`${relativePath}: afgeleide toetsmatrijs ontbreekt.`);
    continue;
  }
  const markdown = fs.readFileSync(relativePath, "utf8");
  const marker = `build=${meta.assessmentBuildVersion}; hash=${meta.buildContentHash}; blueprint=${meta.blueprintVersion}; blueprint-hash=${meta.blueprintHash}`;
  if (!markdown.includes(marker)) failures.push(`${relativePath}: gegenereerde matrixmarker wijkt af.`);
  for (const subgoal of blueprint.subgoals ?? []) {
    if (!markdown.includes(`### ${subgoal.id} —`)) failures.push(`${relativePath}: subdoel ${subgoal.id} ontbreekt.`);
    for (const bullet of subgoal.bullets ?? []) {
      if (!markdown.includes(`${bullet.id} —`)) failures.push(`${relativePath}: bullet ${bullet.id} ontbreekt.`);
    }
  }
}

const expectedGeneratedDocs = [...generatedItemDocs, ...generatedBlueprintDocs].sort();
const actualGeneratedDocs = [...(meta.generatedDocumentation ?? [])].sort();
if (stableJson(expectedGeneratedDocs) !== stableJson(actualGeneratedDocs)) failures.push(`${metaPath}: lijst afgeleide documentatie is niet consistent.`);

for (const v4Path of v4Paths) {
  const contents = fs.readFileSync(v4Path, "utf8");
  if (!contents.toLowerCase().includes("verouderd")) failures.push(`${v4Path}: zichtbare verouderd-markering ontbreekt.`);
}

for (const [legacyId, currentId] of aliases) {
  if (activeIds.has(legacyId)) failures.push(`${legacyId}: historische alias is nog actief.`);
  if (!activeIds.has(currentId)) failures.push(`${legacyId}: aliasdoel ${currentId} bestaat niet.`);
}

if (failures.length) {
  console.error("Assessment-sync mislukt:\n- " + failures.join("\n- "));
  process.exit(1);
}

console.log(`Assessment-sync geslaagd: Markdown + ${activeJson.selectedResponseItems.length} JSON-items + ${activeIds.size} appitems + ${actualGeneratedDocs.length} afgeleide overzichten; build ${meta.assessmentBuildVersion} (${meta.buildContentHash}); matrix ${meta.blueprintVersion} (${meta.blueprintHash}).`);
