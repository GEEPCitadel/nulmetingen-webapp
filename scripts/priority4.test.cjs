const assert = require("node:assert/strict");
const Module = require("node:module");
const test = require("node:test");
const ts = require("typescript");

Module._extensions[".ts"] = (module, fileName) => {
  const source = require("node:fs").readFileSync(fileName, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      resolveJsonModule: true,
      target: ts.ScriptTarget.ES2022,
    },
    fileName,
  }).outputText;
  module._compile(output, fileName);
};

const { assessments } = require("../src/data/assessments.ts");
const { scoreItem } = require("../src/lib/assessment.ts");

const itemOfType = (versionId, type) => {
  const assessment = assessments.find((entry) => entry.id === versionId);
  const item = assessment?.sections.flatMap((section) => section.items).find((entry) => entry.type === type);
  assert.ok(item, `${versionId} mist ${type}`);
  return item;
};

for (const versionId of ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]) {
  test(`${versionId}: PT3-signalen leveren onafhankelijke punten`, () => {
    const item = itemOfType(versionId, "account_security_simulation");
    const full = scoreItem(item, {
      signals: ["sender-email", "password-request"],
      action: "official-route",
    });
    const sameDimension = scoreItem(item, {
      signals: ["sender-email", "suspicious-link"],
      action: "official-route",
    });
    assert.equal(full.score, 3);
    assert.equal(sameDimension.score, 2);
  });

  test(`${versionId}: PT4 scoort filter- en sorteerhandelingen`, () => {
    const item = itemOfType(versionId, "excel_download_task");
    const simulation = item.excelTask?.simulation;
    assert.ok(simulation);
    const states = simulation.scenarios.map((scenario) => {
      const filterRule = simulation.rules.find((rule) => rule.scenarioId === scenario.id && rule.kind === "filter");
      const sortRule = simulation.rules.find((rule) => rule.scenarioId === scenario.id && rule.kind === "sort");
      const sortColumnRule = simulation.rules.find((rule) => rule.scenarioId === scenario.id && rule.kind === "sortColumn");
      const sortDirectionRule = simulation.rules.find((rule) => rule.scenarioId === scenario.id && rule.kind === "sortDirection");
      return {
        id: scenario.id,
        ...(filterRule ? { filter: filterRule.expected } : {}),
        sort: sortRule?.expected ?? {
          column: sortColumnRule?.expectedColumn ?? "",
          direction: sortDirectionRule?.expectedDirection ?? "ascending",
        },
      };
    });
    const scored = scoreItem(item, { scenarioStates: states, actionLog: [] });
    assert.equal(scored.score, item.points);
    assert.ok(scored.taskResults?.every((result) => result.correct));
  });

  test(`${versionId}: PT8 heeft vier losse categorieën`, () => {
    const item = itemOfType(versionId, "social_action_simulation");
    const task = item.socialTask;
    assert.equal(task?.screens.length, 4);
    assert.equal(task?.rules.length, 4);
    const answer = Object.fromEntries((task?.rules ?? []).map((rule) => [
      rule.groupId,
      rule.kind === "minCorrect" ? rule.correctOptionIds : rule.correctOptionIds?.[0],
    ]));
    const scored = scoreItem(item, answer);
    assert.equal(scored.score, 4);
  });
}

test("SR-bronkaarten en grafiekstimulus zijn actief", () => {
  const lj1h = assessments.find((entry) => entry.id === "lj1-hv");
  const sourceItem = lj1h?.sections.flatMap((section) => section.items).find((item) => item.id === "lj1h-sr4-search-query");
  assert.equal(sourceItem?.renderOptionsAsSourceCards, true);
  assert.ok(sourceItem?.options?.filter((option) => option.id !== sourceItem.unknownOptionId).every((option) => option.description && option.sourceType));

  const lj3h = assessments.find((entry) => entry.id === "lj3-hv");
  const graphItem = lj3h?.sections.flatMap((section) => section.items).find((item) => item.id === "lj3h-sr6-graph-scale");
  assert.equal(graphItem?.mockup?.comparisonChart?.bars.length, 2);
  assert.equal(graphItem?.mockup?.comparisonChart?.unit, "klachten per 1.000 gebruikers");
});
