import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();

const installTsLoader = () => {
  const previous = Module._extensions[".ts"];
  Module._extensions[".ts"] = (module, fileName) => {
    const source = fs.readFileSync(fileName, "utf8");
    const output = ts.transpileModule(source, {
      compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, resolveJsonModule: true, target: ts.ScriptTarget.ES2022 },
      fileName,
    }).outputText;
    module._compile(output, fileName);
  };
  return () => {
    if (previous) Module._extensions[".ts"] = previous;
    else delete Module._extensions[".ts"];
  };
};

const loadTsModule = (relativePath) => {
  const fileName = path.join(root, relativePath);
  const source = fs.readFileSync(fileName, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { esModuleInterop: true, module: ts.ModuleKind.CommonJS, resolveJsonModule: true, target: ts.ScriptTarget.ES2022 },
    fileName,
  }).outputText;
  const module = new Module(fileName);
  module.filename = fileName;
  module.paths = Module._nodeModulePaths(path.dirname(fileName));
  module._compile(output, fileName);
  return module.exports;
};

const restoreTsLoader = installTsLoader();
try {
  const { assessments } = loadTsModule("src/data/assessments.ts");
  const { calculateResult, completeSession, createSession, getPresentedOrder, submitItemAnswer } = loadTsModule("src/lib/assessment.ts");

  for (const assessment of assessments) {
    let session = createSession(assessment, `TEST-${assessment.id}`, {
      anonymousAttemptId: crypto.randomUUID(),
      anonymousCode: `test-${assessment.id}`,
      privacyConsent: true,
    });
    let submitted = 0;
    for (const section of assessment.sections) {
      for (const item of section.items) {
        const selectedAnswer =
          item.type === "self_assessment"
            ? 50
            : item.type === "multiple_choice"
              ? item.correctAnswer ?? item.unknownOptionId ?? null
              : {};
        session = submitItemAnswer({
          session,
          section,
          item,
          selectedAnswer,
          shownOptionOrder: getPresentedOrder(session, section.id, item.id),
          timeSpentMs: 1,
        });
        submitted += 1;
      }
    }
    session = completeSession(session);
    const result = calculateResult(session, assessment);
    const expectedSignalGoals = ["21D", "22A", "22B", "23C"];
    if (session.results.length !== submitted) throw new Error(`${assessment.id}: ${session.results.length}/${submitted} resultaten.`);
    if (result.maxScore !== assessment.maxScore) throw new Error(`${assessment.id}: result/assessment maxscore wijkt af.`);
    if (session.results.some((entry) => !entry.itemVersion || !entry.scoringVersion || !entry.assessmentBuildVersion || !entry.assessmentContentHash)) {
      throw new Error(`${assessment.id}: resultaat zonder volledige provenance.`);
    }
    if (session.eventLogs.some((entry) => !entry.itemVersion || !entry.scoringVersion || !entry.assessmentBuildVersion || !entry.assessmentContentHash)) {
      throw new Error(`${assessment.id}: eventlog zonder volledige provenance.`);
    }
    for (const goalId of expectedSignalGoals) {
      const goal = result.goalScores.find((entry) => entry.goalId === goalId);
      if (!goal || goal.itemCount !== 1 || goal.reportingMode !== "signal") {
        throw new Error(`${assessment.id}/${goalId}: enkel-itemdoel wordt niet als itemsignaal gerapporteerd.`);
      }
    }
    if (result.goalScores.some((goal) => goal.level === "subgoal" && goal.itemCount > 1 && goal.reportingMode !== "percentage")) {
      throw new Error(`${assessment.id}: subdoel met meerdere items heeft onjuiste rapportagemodus.`);
    }
    console.log(`${assessment.id}: ${submitted} items/taken doorlopen; maxscore ${result.maxScore}; hash ${session.assessmentContentHash}.`);
  }
} finally {
  restoreTsLoader();
}
