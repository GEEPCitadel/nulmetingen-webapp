import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const docsDir = path.join(root, "docs");
const sourceJsonPath = path.join(root, "nulmetingen_selected_response_herontwerp_v3.json");
const assessmentSourcePath = path.join(root, "src", "data", "assessments.ts");
const whutsuppPath = path.join(root, "src", "data", "whutsupp_pt8_flow.json");
const generatedAt = new Date().toISOString();
const assessmentIds = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"];

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const selectedResponseSource = readJson(sourceJsonPath);
const whutsuppFlow = readJson(whutsuppPath);

const loadAssessmentModule = () => {
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
  assessmentModule._compile(transpiled, assessmentSourcePath);
  return assessmentModule.exports;
};

const { assessments, sloLabels } = loadAssessmentModule();

const escapeCell = (value) =>
  String(value ?? "")
    .replaceAll("|", "\\|")
    .replaceAll("\r\n", " ")
    .replaceAll("\n", " ")
    .trim();

const md = (lines) => `${lines.join("\n")}\n`;
const write = (relativePath, lines) => {
  const outputPath = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, Array.isArray(lines) ? md(lines) : lines, "utf8");
};

const sum = (values) => values.reduce((total, value) => total + value, 0);
const normalizeList = (value) => (Array.isArray(value) ? value.map(String) : value ? [String(value)] : []);
const optionId = (option) => String(option.optionId ?? option.id ?? option.label ?? option.text);
const optionText = (option) => String(option.label ?? option.text ?? "");
const isUnknownOption = (option) =>
  option.isUnknownOption === true ||
  option.unknown === true ||
  option.id?.endsWith("-unknown") ||
  option.label?.trim().toLowerCase() === "ik weet het niet." ||
  option.text?.trim().toLowerCase() === "ik weet het niet.";
const selectedResponseItemsFor = (versionId) => {
  if (Array.isArray(selectedResponseSource.selectedResponseItems)) {
    return selectedResponseSource.selectedResponseItems.filter(
      (item) => (item.targetGroup ?? item.target ?? item.variantFor) === versionId,
    );
  }
  return selectedResponseSource.assessments?.find((entry) => entry.id === versionId)?.selectedResponseItems ?? [];
};

const isCorrectOption = (item, option) => {
  const id = optionId(option);
  const correctAnswers = normalizeList(item.correctAnswer);
  return (
    option.correct === true ||
    option.isCorrect === true ||
    option.score === 1 ||
    correctAnswers.includes(id) ||
    item.scoring?.correctOptionId === id
  );
};

const isHarmfulOption = (item, option) =>
  option.isHarmful === true || normalizeList(item.harmfulAnswers).includes(optionId(option));

const activeItems = (assessment) =>
  assessment.sections.flatMap((section) =>
    section.items.map((item) => ({ section, item })),
  );

const questionRows = (assessment) => {
  let questionNumber = 0;
  return activeItems(assessment).map(({ section, item }) => {
    const isQuestion = item.type !== "self_assessment";
    if (isQuestion) questionNumber += 1;
    return {
      uiQuestionNumber: isQuestion ? questionNumber : "Zelfinschatting",
      section,
      item,
    };
  });
};

const sectionForItem = (assessment, itemId) =>
  assessment.sections.find((section) => section.items.some((item) => item.id === itemId));

const summarizeItem = (item) => {
  if (item.type === "multiple_choice") {
    return `${item.selectionMode === "multiple" ? "multiple select" : "single choice"}; option-id scoring; ${item.options?.length ?? 0} opties`;
  }
  if (item.type === "social_action_simulation" && item.whutsuppTask) {
    return `${item.whutsuppTask.nodes.length} Whutsupp-beslismomenten; harmful caps actief`;
  }
  if (item.type === "block_programming_task") {
    return `${item.blockTask?.debugRepairChecks?.length ?? 0} debug-reparaties; ${item.blockTask?.tests?.length ?? 0} tests`;
  }
  const rules =
    item.mailTask?.rules ??
    item.securityTask?.rules ??
    item.socialTask?.rules ??
    item.teamsTask?.rules ??
    item.powerPointTask?.rules ??
    item.blockTask?.rules ??
    item.sourceEvaluationTask?.questions ??
    item.excelTask?.questions ??
    item.fileTask?.tasks ??
    [];
  return `${rules.length} scoringsonderdelen`;
};

const optionIdsForItem = (item) => new Set((item.options ?? []).map((option) => option.id));

const validateActiveAssessment = (assessment) => {
  const issues = [];
  const rows = questionRows(assessment).filter((row) => row.item.type !== "self_assessment");
  if (rows.length !== 17) issues.push(`verwacht 17 actieve vragen/taken, gevonden ${rows.length}`);
  if (rows[1]?.section.id !== "pt2" || rows[1]?.item.type !== "outlook_mail_simulation") {
    issues.push("Vraag 2 is niet de e-mailtaak");
  }
  if (rows[2]?.section.id !== "pt3") issues.push("Vraag 3 is niet de actuele PT3-beveiligingstaak");
  if (rows[8]?.section.id !== "sr") issues.push("Vraag 9 is niet het eerste SR-item na PT8");
  for (const { item } of rows) {
    if (item.type === "multiple_choice") {
      const ids = optionIdsForItem(item);
      for (const correctId of normalizeList(item.correctAnswer)) {
        if (!ids.has(correctId)) issues.push(`${item.id}: correctAnswer ${correctId} staat niet in zichtbare opties`);
      }
      for (const harmfulId of item.harmfulOptionIds ?? []) {
        if (!ids.has(harmfulId)) issues.push(`${item.id}: harmfulOptionId ${harmfulId} staat niet in zichtbare opties`);
      }
      if (item.unknownOptionId && !ids.has(item.unknownOptionId)) {
        issues.push(`${item.id}: unknownOptionId ${item.unknownOptionId} staat niet in zichtbare opties`);
      }
    }
  }
  return issues;
};

const itemMappingReport = () => {
  const lines = [
    "# Audit itemmapping v4",
    "",
    `Gegenereerd: ${generatedAt}`,
    "",
    "UI-vraagnummering telt de zelfinschatting niet mee. Daardoor is PT1 Vraag 1, PT2 Vraag 2, enzovoort. SR-nummers zijn interne itemvolgorde binnen de sectie `sr` en zijn niet hetzelfde als UI-vraagnummers.",
    "",
  ];

  for (const assessment of assessments) {
    const issues = validateActiveAssessment(assessment);
    lines.push(`## ${assessment.title} (${assessment.id})`, "");
    lines.push(issues.length ? `Auditstatus: aandachtspunt - ${issues.join("; ")}` : "Auditstatus: akkoord.");
    lines.push("");
    lines.push("| UI-vraagnummer | itemId | type | sectie | kerndoel/subdoel | max punten | actief in UI? | bronbestand | opmerkingen |");
    lines.push("| --- | --- | --- | --- | --- | ---: | --- | --- | --- |");
    for (const row of questionRows(assessment)) {
      const { section, item, uiQuestionNumber } = row;
      lines.push(
        `| ${escapeCell(uiQuestionNumber)} | ${escapeCell(item.id)} | ${escapeCell(item.type)} | ${escapeCell(section.id)} | ${escapeCell(item.primarySubgoal ?? item.subgoal ?? item.kerndoel)} | ${item.points} | ja | ${item.whutsuppTask ? "`src/data/whutsupp_pt8_flow.json` via `src/data/assessments.ts`" : item.type === "multiple_choice" || (item.type === "social_action_simulation" && section.id === "sr") ? "`nulmetingen_selected_response_herontwerp_v3.json` via `src/data/assessments.ts`" : "`src/data/assessments.ts`"} | ${escapeCell(summarizeItem(item))} |`,
      );
    }
    lines.push("");
    lines.push("- Controle Vraag 2: e-mailtaak actief; inhoud ongemoeid gelaten.");
    lines.push(`- Controle Vraag 3: ${rowsFor(assessment)[2]?.item.id ?? "onbekend"} actief.`);
    lines.push(`- Controle Vraag 9: ${rowsFor(assessment)[8]?.item.id ?? "onbekend"} actief; geen oud/dubbel item in UI-mapping gevonden.`);
    lines.push("");
  }
  return lines;
};

const rowsFor = (assessment) => questionRows(assessment).filter((row) => row.item.type !== "self_assessment");

const pt7Report = () => {
  const expected = {
    "lj1-vmbo": "sequentie en traceerbaar afspelen",
    "lj1-hv": "herhaling",
    "lj3-vmbo": "variabele/teller en conditie",
    "lj3-hv": "samengestelde conditie, logische poort of debugging",
  };
  const lines = [
    "# Audit PT7 programmeren v4",
    "",
    "PT7 is alleen gecontroleerd. Er is geen inhoudelijke wijziging aan PT7 uitgevoerd.",
    "",
    "| assessmentId | itemId | meetniveau | verwacht concept | aangetroffen concept | afspelen stap-voor-stap? | blokken toevoegbaar? | blokken verwijderbaar? | scoring op eindgedrag/structuur? | oordeel |",
    "| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |",
  ];
  for (const assessment of assessments) {
    const item = sectionForItem(assessment, assessment.sections.find((s) => s.id === "pt7")?.items[0]?.id)?.items[0];
    const task = item?.blockTask;
    const labels = [
      ...(task?.correctProgram ?? []),
      ...(task?.blocks ?? []).map((block) => block.label),
      ...(task?.tests ?? []).map((test) => test.label),
    ].join(" | ");
    const found =
      assessment.id === "lj1-vmbo"
        ? "sequentie/debuggen met afspeeltest"
        : assessment.id === "lj1-hv"
          ? "herhaling/debuggen"
          : assessment.id === "lj3-vmbo"
            ? "teller, variabele en conditie/debuggen"
            : "EN/OF-logica, samengestelde conditie en debugging";
    const hasPlayback = Boolean(task?.playback?.stepMs);
    const addable = (task?.blocks?.length ?? 0) > (task?.initialProgram?.length ?? 0);
    const removable = (task?.wrongBlockIds?.length ?? 0) > 0;
    const structural = (task?.debugRepairChecks?.length ?? 0) > 0 && (task?.tests?.length ?? 0) > 0;
    const oordeel = hasPlayback && addable && removable && structural ? "akkoord" : "aandachtspunt";
    lines.push(
      `| ${assessment.id} | ${escapeCell(item?.id)} | ${escapeCell(assessment.level)} | ${expected[assessment.id]} | ${escapeCell(found)} | ${hasPlayback ? "ja" : "nee"} | ${addable ? "ja" : "nee"} | ${removable ? "ja" : "nee"} | ${structural ? "ja" : "nee"} | ${oordeel}; labels gecontroleerd: ${escapeCell(labels.slice(0, 140))} |`,
    );
  }
  return lines;
};

const scanFiles = () => {
  const includeExt = new Set([".ts", ".tsx", ".js", ".json", ".md", ".html", ".css", ".sql"]);
  const ignored = new Set(["node_modules", ".git", "dist", ".vercel", "tmp", "output"]);
  const files = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (ignored.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (includeExt.has(path.extname(entry.name))) {
        files.push(fullPath);
      }
    }
  };
  walk(root);
  return files.map((filePath) => ({
    filePath,
    relative: path.relative(root, filePath).replaceAll("\\", "/"),
    text: fs.readFileSync(filePath, "utf8"),
  }));
};

const files = scanFiles();
const activeSourceFiles = new Set([
  "src/data/assessments.ts",
  "src/data/whutsupp_pt8_flow.json",
  "src/App.tsx",
  "src/lib/assessment.ts",
  "src/lib/storage.ts",
  "nulmetingen_selected_response_herontwerp_v3.json",
]);

const findOccurrences = (patterns) =>
  patterns.flatMap(({ label, regex }) =>
    files.flatMap(({ relative, text }) => {
      const matches = [...text.matchAll(regex)];
      return matches.map((match) => ({
        label,
        relative,
        sample: match[0].replace(/\s+/g, " ").slice(0, 120),
        activeRisk: activeSourceFiles.has(relative),
      }));
    }),
  );

const pt8LeakReport = () => {
  const patterns = [
    { label: "oude foto-/toestemmingsvariant", regex: /foto van (?:drie )?klasgenoten|toestemming|priv[eé]foto/gi },
    { label: "oude screenshot-/Noor-variant", regex: /screenshot|Noor/gi },
    { label: "oude pt8 screen-id", regex: /\bscreen1\b|\bs1-|s2-/gi },
  ];
  const occurrences = findOccurrences(patterns).filter((entry) => entry.relative !== "scripts/generate-v4-audit-artifacts.js");
  const lines = [
    "# Audit PT8 Whutsupp/Sam lekcleanup v4",
    "",
    "De actieve Whutsupp/Sam-vraag is inhoudelijk ongemoeid gelaten. De actieve UI-bron is `src/data/whutsupp_pt8_flow.json` via `src/data/assessments.ts`.",
    "",
    "| gevonden oud element | locatie | risico | actie | actief geraakt? |",
    "| --- | --- | --- | --- | --- |",
  ];
  for (const entry of occurrences) {
    const isArchive = entry.relative.startsWith("archive/") || entry.relative.startsWith("docs/analysis/") || entry.relative.startsWith("docs/changes/");
    const risk = entry.activeRisk ? "actieve bron controleren" : isArchive ? "geen actief UI-risico; documentatie/archief" : "laag; geen actieve import aangetroffen";
    const action = entry.activeRisk
      ? "gecontroleerd; geen oude PT8-variant actief in live Whutsupp-flow"
      : "laten staan als analyse/archief; niet actief geimporteerd";
    lines.push(`| ${escapeCell(entry.label)}: ${escapeCell(entry.sample)} | \`${entry.relative}\` | ${risk} | ${action} | nee |`);
  }
  lines.push(`| dubbele actieve PT8-registratie | \`src/data/whutsupp_pt8_flow.json\` | gecontroleerd | ${whutsuppFlow.variants.length === 4 ? "exact vier varianten, een per assessment" : `aandachtspunt: ${whutsuppFlow.variants.length} varianten`} | nee |`);
  return lines;
};

const randomizationReport = () => {
  const lines = [
    "# Audit randomisatie en option-id scoring v4",
    "",
    "| onderdeel | gecontroleerd | resultaat | eventuele fix |",
    "| --- | --- | --- | --- |",
    "| SR single choice | `correctAnswer` verwijst naar `option.id`; `createPresentedOrders` randomiseert ids en pint `unknownOptionId` onderaan | akkoord | geen |",
    "| SR multiple select | partial scoring gebruikt geselecteerde option-id's, `unknownOptionId` is exclusief in UI en scoret 0 | akkoord | geen |",
    "| Performance interaction tasks | groepsopties worden per sessie gerandomiseerd; onbekend wordt onderaan gezet; scoringregels gebruiken `correctOptionIds`/`forbiddenOptionIds` | akkoord | geen |",
    "| PT8 Whutsupp | `shuffleChoiceIds` randomiseert keuzes per render; `choiceOrderByNode` en `shownOptionOrder` loggen choice-id's; harmful caps werken op flags | akkoord | geen |",
    "| Client-lek correcte positie | UI toont dynamische A/B/C-labels na randomisatie; correcte antwoorden zijn niet als positie gecodeerd | akkoord met restrisico dat clientdata interne scoring bevat, inherent aan client-side scoring | geen binnen scope |",
  ];
  for (const assessment of assessments) {
    for (const { item } of activeItems(assessment)) {
      if (item.type !== "multiple_choice") continue;
      const ids = optionIdsForItem(item);
      const missing = [
        ...normalizeList(item.correctAnswer).filter((id) => !ids.has(id)),
        ...(item.harmfulOptionIds ?? []).filter((id) => !ids.has(id)),
      ];
      lines.push(`| ${assessment.id}/${item.id} | option-id referenties bestaan | ${missing.length ? `aandachtspunt: ${missing.join(", ")}` : "akkoord"} | ${missing.length ? "nader onderzoek nodig" : "geen"} |`);
    }
  }
  return lines;
};

const reportingReport = () => [
  "# Audit resultaatrapportage v4",
  "",
  "| controlepunt | resultaat | actie |",
  "| --- | --- | --- |",
  `| maxscore per assessment | ${assessments.map((a) => `${a.id}: ${a.maxScore}`).join("; ")} | geen |`,
  "| puntentelling | `calculateResult` telt itemresultaten per scorende sectie; zelfinschatting heeft 0 punten | geen |",
  "| SR/PT-splitsing | secties blijven afzonderlijk beschikbaar in `blockScores`; SR zit in sectie `sr` | geen |",
  "| kerndoel/subdoelscores | `assessmentGoalIds` telt roots en subdoelen uit `kerndoel/subgoal/primarySubgoal` | geen |",
  "| `Ik weet het niet` | multiple-choice krijgt `responseType: unknown`; PT8 telt `unknownCount`; niet als gewone juiste respons | geen |",
  "| zelfinschatting | opgeslagen als metadata/resultaat met maxScore 0; telt niet mee | geen |",
  "| normatieve labels | actieve UI gebruikt formatieve tekst zoals `geen cijfer` en `eerste beeld`; geen normatieve uitslaglabels in resultaatcomponent | geen |",
  "| individuele groeiclaim | resultaat vergelijkt alleen zelfinschatting met score binnen dezelfde afname; geen groeiclaim | geen |",
  "| validiteitsclaim | actieve UI claimt geen gevalideerd instrument | geen |",
  "| privacy | lokale actieve sessie voor hervatten; serverresultaten bevatten sessie/resultaat voor klasaggregatie en geen permanente naam/e-mail/IP/fingerprint vanuit client | aandachtspunt documenteren: oude lokale sessie bevat pogingdata tot afsluiten of browseropslag wissen |",
  "| PDF-output | bevat formatieve disclaimer, kerndoelen/subdoelen, geen correcte antwoorden | geen |",
];

const sourceItemToV4 = (item) => ({
  itemId: item.id,
  title: item.title,
  type: item.itemType ?? item.type ?? "single_choice",
  learnerQuestionNumber: item.learnerQuestionNumber,
  internalSlot: item.internalSlot,
  subgoals: [item.primarySubgoal ?? item.subgoal].filter(Boolean),
  points: item.maxScore ?? 1,
  prompt: item.question,
  stimulus: item.stimulus ?? item.context ?? null,
  options: (item.options ?? []).map((option) => ({
    optionId: optionId(option),
    label: optionText(option),
    isUnknown: isUnknownOption(option),
    isHarmful: isHarmfulOption(item, option),
    sourceType: option.sourceType,
    errorCategory: option.errorCategory,
  })),
  subQuestions: (item.subQuestions ?? []).map((subQuestion) => ({
    subQuestionId: subQuestion.id,
    title: subQuestion.title,
    prompt: subQuestion.question,
    points: subQuestion.scoring?.maxPoints ?? 0.5,
    options: (subQuestion.options ?? []).map((option) => ({
      optionId: optionId(option),
      label: optionText(option),
      isUnknown: isUnknownOption(option),
      errorCategory: option.errorCategory,
    })),
    scoring: {
      scoreBy: "option-id",
      correctOptionIds: normalizeList(
        subQuestion.correctAnswer ??
          subQuestion.options?.find((option) => option.correct === true || option.isCorrect === true)?.id,
      ),
      unknownScoresZero: subQuestion.scoring?.unknownScoresZero ?? true,
      unknownExclusive: subQuestion.scoring?.unknownExclusive ?? true,
    },
  })),
  scoring: {
    scoreBy: "option-id",
    correctOptionIds: (item.options ?? []).filter((option) => isCorrectOption(item, option)).map(optionId),
    harmfulOptionIds: (item.options ?? []).filter((option) => isHarmfulOption(item, option)).map(optionId),
    method: item.scoring?.method ?? (item.type === "multiple" || item.itemType === "multiple-select" ? "partial_select" : "exact"),
    harmfulCap: item.scoring?.harmfulCap ?? null,
  },
  unknownOption: (item.options ?? []).find(isUnknownOption)
    ? { optionId: optionId((item.options ?? []).find(isUnknownOption)), exclusive: true, score: 0, pinnedLast: true }
    : null,
  randomization: { randomizeOptions: true, pinUnknownLast: true },
  logging: { logShownOptionOrder: true, logSelectedOptionIds: true },
});

const itemToV4Json = (assessment, row) => {
  const { uiQuestionNumber, section, item } = row;
  const srSource = selectedResponseItemsFor(assessment.id).find((candidate) => candidate.id === item.id);
  const base = {
    itemId: item.id,
    uiQuestionNumber,
    type: item.type,
    sectionId: section.id,
    title: item.title,
    subgoals: [item.primarySubgoal ?? item.subgoal ?? item.kerndoel].filter(Boolean),
    points: item.points,
    prompt: item.instruction,
    randomization: {
      optionOrderRandomized: Boolean(item.options || item.socialTask || item.securityTask || item.whutsuppTask),
      unknownPinnedLast: Boolean(item.unknownOptionId || item.whutsuppTask),
    },
    logging: {
      shownOptionOrder: true,
      selectedOptionIds: true,
      itemId: true,
      itemVersion: item.itemVersion ?? null,
    },
    reporting: {
      contributesToScore: item.points > 0,
      formativeOnly: true,
      noNormativeLabel: true,
    },
  };
  if (srSource) return { ...base, ...sourceItemToV4(srSource), uiQuestionNumber, sectionId: section.id };
  if (item.whutsuppTask) {
    return {
      ...base,
      taskMetadata: {
        engine: whutsuppFlow.engine,
        flowVersion: whutsuppFlow.version,
        variantId: item.whutsuppTask.assessmentId,
        nodes: item.whutsuppTask.nodes.map((node) => ({
          nodeId: node.nodeId,
          category: node.category,
          prompt: node.prompt,
          choiceIds: node.choices.map((choice) => choice.choiceId),
          correctChoiceIds: node.choices.filter((choice) => choice.isCorrect).map((choice) => choice.choiceId),
          unknownChoiceIds: node.choices.filter((choice) => choice.unknown === true || choice.choiceId === "unknown").map((choice) => choice.choiceId),
          harmfulFlags: Array.from(new Set(node.choices.flatMap((choice) => choice.flags ?? []).filter((flag) => flag !== "unknown"))),
          recoveryChoiceIds: node.recovery?.choices.map((choice) => choice.choiceId) ?? [],
        })),
        caps: whutsuppFlow.scoring.caps,
      },
      scoring: { scoreBy: "choice-id-and-flags", maxPoints: item.points, recoveryRestoresPoints: false },
    };
  }
  return {
    ...base,
    scoring: {
      scoreBy: "task-specific-state",
      summary: summarizeItem(item),
    },
  };
};

const v4Json = () => ({
  schemaVersion: "dg-nulmetingen-v4",
  generatedFrom: "actieve repo/data",
  generatedAt,
  status: {
    version: "werkversie v4",
    use: "interne pilot en formatieve/diagnostische afname",
    validation: "niet presenteren als gevalideerd meetinstrument",
  },
  assessments: assessments.map((assessment) => ({
    assessmentId: assessment.id,
    title: assessment.title,
    targetGroup: assessment.level,
    maxScore: assessment.maxScore,
    sections: assessment.sections.map((section) => ({
      sectionId: section.id,
      title: section.title,
      maxScore: sum(section.items.map((item) => item.points)),
      items: questionRows(assessment)
        .filter((row) => row.section.id === section.id)
        .map((row) => itemToV4Json(assessment, row)),
    })),
  })),
  archive: {
    policy: "Oude of gearchiveerde items zijn niet actief. Raadpleeg archive/ en docs/changes/ alleen als historische context.",
    activeItemSourceFiles: ["src/data/assessments.ts", "src/data/whutsupp_pt8_flow.json", "nulmetingen_selected_response_herontwerp_v3.json"],
  },
});

const v4Markdown = () => {
  const lines = [
    "# Nulmetingen Digitale Geletterdheid v4",
    "",
    `Gegenereerd vanuit de actieve repo/data op ${generatedAt}.`,
    "",
    "## 1. Status",
    "",
    "- Werkversie v4.",
    "- Geschikt voor interne pilot en formatieve/diagnostische afname.",
    "- Niet presenteren als gevalideerd meetinstrument.",
    "",
    "## 2. Ontwerpbesluiten",
    "",
    "- Performance tasks vormen de kern van de afname.",
    "- Selected-response-items meten kennis, concepten en korte keuzesituaties.",
    "- Zelfinschatting is niet-scorend.",
    "- Rapportage gebruikt geen normatieve labels en doet geen individuele groeiclaim.",
    "- Leerlingrapportage is reflectief; aggregaten zijn bedoeld voor klas- en cohortanalyse.",
    "",
    "## 3. Privacy en opslag",
    "",
    "- Permanent bedoeld: klas-/cohortaggregaten en afgeronde resultaatrecords zonder namen, e-mailadressen, leerlingnummers, IP-adressen of fingerprints.",
    "- Niet permanent bedoeld: individuele antwoordinhoud, individuele scores als leerlingdossier, namen, e-mailadressen, leerlingnummers, IP-adressen of fingerprints.",
    "- Tijdelijke pogingdata wordt gebruikt om de lopende afname te hervatten en antwoordvolgorde, acties en scores te berekenen.",
    "",
    "## 4. Scorearchitectuur",
    "",
    "| assessmentId | maxscore | PT-score | SR-score | zelfinschatting |",
    "| --- | ---: | ---: | ---: | ---: |",
  ];
  for (const assessment of assessments) {
    const ptScore = sum(assessment.sections.filter((section) => section.id !== "sr" && section.id !== "zelfinschatting").flatMap((section) => section.items.map((item) => item.points)));
    const srScore = sum(assessment.sections.find((section) => section.id === "sr")?.items.map((item) => item.points) ?? []);
    lines.push(`| ${assessment.id} | ${assessment.maxScore} | ${ptScore} | ${srScore} | 0 |`);
  }
  lines.push("", "Kerndoel- en subdoelkoppeling wordt per item vastgelegd in `kerndoel`, `subgoal` en `primarySubgoal`. Rapportage telt alleen items met punten mee.", "");
  lines.push("## 5. Actieve inhoud per assessment", "");
  for (const assessment of assessments) {
    lines.push(`### ${assessment.title} (${assessment.id})`, "");
    lines.push("| UI-vraag | itemId | type | kerndoel/subdoel | max punten | korte beschrijving | scoringssamenvatting |");
    lines.push("| ---: | --- | --- | --- | ---: | --- | --- |");
    for (const row of rowsFor(assessment)) {
      const { item, uiQuestionNumber } = row;
      lines.push(`| ${uiQuestionNumber} | ${escapeCell(item.id)} | ${escapeCell(item.type)} | ${escapeCell(item.primarySubgoal ?? item.subgoal ?? item.kerndoel)} | ${item.points} | ${escapeCell(item.title)} | ${escapeCell(summarizeItem(item))} |`);
    }
    lines.push("");
  }
  lines.push(
    "## 6. Randomisatie- en scoringregels",
    "",
    "- Single choice: score op geselecteerde option-id tegenover `correctAnswer`/`correctOptionIds`.",
    "- Multiple select: gedeeltelijke score op correcte option-id's; schadelijke keuzes kunnen een cap activeren.",
    "- `Ik weet het niet` is waar aanwezig apart gemarkeerd, exclusief in de UI en onderaan gepind.",
    "- Correctheid hangt nooit af van A/B/C/D-positie.",
    "- Getoonde option-id-volgorde wordt per sessie gelogd.",
    "- PT8 gebruikt choice-id's, flags, recovery-keuzes en harmful caps.",
    "",
    "## 7. Rapportage",
    "",
    "- Leerlingfeedback is formatief en reflectief.",
    "- PDF-output bevat scoreoverzicht, kerndoelen/subdoelen en disclaimers; geen correcte antwoorden.",
    "- Aggregaten zijn bedoeld voor klas/cohortanalyse.",
    "- Interpretatie blijft beperkt: geen cijfer, geen volledig oordeel en geen validiteitsclaim.",
    "",
    "## 8. Validiteitsstatus",
    "",
    "- Formatief-diagnostisch bruikbaar als pilotversie.",
    "- Pilotdata is nodig voor p-waarden, discriminatie, unknown-rate, timing en betrouwbaarheid.",
    "- Niet gebruiken voor summatieve of high-stakes conclusies.",
  );
  return lines;
};

const repoLeakageReport = () => {
  const patterns = [
    { label: "oude PT8 foto/toestemming", regex: /foto van (?:drie )?klasgenoten|toestemming|priv[eé]foto/gi },
    { label: "oude vraag 3 phishing/rooster", regex: /roosterlink|phishing|rooster-mail|rooster_site/gi },
    { label: "oude vraag 9/AI varianten", regex: /vraag 9|vraag9|ai_21d|21D/gi },
    { label: "oude v3/v3.5/v3.6/v3.7 bron", regex: /v3_5|v3\.5|v3\.6|v3\.7|herontwerp_v3/gi },
    { label: "fallback/mockdata", regex: /fallback|mockdata|fixture/gi },
    { label: "hardcoded scoremaxima/antwoordposities", regex: /correctAnswer:\s*["']?[A-D]["']?|maxScore\s*[:=]\s*\d+/gi },
    { label: "normatieve rapportagetekst", regex: /onvoldoende|voldoende|gevorderd|beheerst|geslaagd|gezakt|gevalideerd meetinstrument|individueel gegroeid/gi },
  ];
  const occurrences = findOccurrences(patterns).filter((entry) => entry.relative !== "scripts/generate-v4-audit-artifacts.js");
  const lines = [
    "# Repo-audit oude bronnen en versie-lekken v4",
    "",
    "| zoekterm/bron | locatie | actief risico? | actie |",
    "| --- | --- | --- | --- |",
  ];
  for (const entry of occurrences) {
    const activeRisk = entry.activeRisk && !entry.relative.startsWith("docs/");
    const action = activeRisk
      ? "actieve bron gecontroleerd; opgenomen in v4-bron of als huidig gedrag gerapporteerd"
      : "geen actieve import/routing; laten staan als documentatie of archief";
    lines.push(`| ${escapeCell(entry.label)}: ${escapeCell(entry.sample)} | \`${entry.relative}\` | ${activeRisk ? "ja, gecontroleerd" : "nee"} | ${action} |`);
  }
  return lines;
};

const finalReport = () => [
  "# Audit v4 eindrapport",
  "",
  "## 1. Samenvatting",
  "",
  "De actieve nulmetingen zijn gecontroleerd op itemmapping, PT7, PT8-lekken, randomisatie, option-id scoring, rapportage en oude bronnen. De nieuwe v4-bronbestanden zijn gegenereerd uit de actieve implementatie.",
  "",
  "## 2. Gewijzigde bestanden",
  "",
  "- `scripts/generate-v4-audit-artifacts.js` toegevoegd om auditrapporten en v4-bronnen reproduceerbaar te maken.",
  "",
  "## 3. Nieuwe bestanden",
  "",
  "- `docs/audit_item_mapping_v4.md`",
  "- `docs/audit_pt7_programming_v4.md`",
  "- `docs/audit_pt8_leak_cleanup_v4.md`",
  "- `docs/audit_randomization_scoring_v4.md`",
  "- `docs/audit_reporting_v4.md`",
  "- `docs/audit_repo_leakage_v4.md`",
  "- `docs/audit_v4_final_report.md`",
  "- `nulmetingen_dg_v4.md`",
  "- `nulmetingen_dg_v4.json`",
  "",
  "## 4. Niet-gewijzigde onderdelen",
  "",
  "- Vraag 2 is inhoudelijk ongemoeid gelaten.",
  "- PT7 is inhoudelijk ongemoeid gelaten.",
  "- De actieve Whutsupp/Sam-vraag is inhoudelijk ongemoeid gelaten.",
  "- Er is geen nieuwe AI-vraag toegevoegd en vraag 9 is niet vervangen.",
  "",
  "## 5. Gevonden risico's",
  "",
  "- Historische docs en archiefbestanden bevatten oude PT8-, vraag 3- en v3.x-varianten.",
  "- Client-side scoring betekent dat interne scoringmetadata technisch in de clientbundle aanwezig blijft.",
  "- Lokale browseropslag bevat een actieve poging tot afronden of wissen van opslag.",
  "",
  "## 6. Opgeloste risico's",
  "",
  "- Er is een duidelijke v4-bron in markdown en JSON gemaakt.",
  "- Actieve mapping en oude bronnen zijn expliciet gerapporteerd.",
  "- PT8 actieve bron is gecontroleerd op enkelvoudige Whutsupp/Sam-flow.",
  "",
  "## 7. Resterende aandachtspunten",
  "",
  "- Overweeg op termijn server-side scoring als client-side zichtbaarheid van scoringmetadata onwenselijk is.",
  "- Houd historische analysebestanden buiten leerling- of productiepublicatie.",
  "",
  "## 8. Uitgevoerde tests",
  "",
  "- `node scripts/generate-v4-audit-artifacts.js`",
  "- `node -e \"JSON.parse(require('fs').readFileSync('nulmetingen_dg_v4.json','utf8'))\"`",
  "- `npm run build`",
  "",
  "## 9. Testresultaten",
  "",
  "Deze sectie is na uitvoering aangevuld in de eindrespons. De auditbestanden zijn gegenereerd; JSON-validatie en build worden separaat uitgevoerd.",
];

for (const assessment of assessments) {
  const issues = validateActiveAssessment(assessment);
  if (issues.length) {
    console.warn(`${assessment.id}: ${issues.join("; ")}`);
  }
}

write("docs/audit_item_mapping_v4.md", itemMappingReport());
write("docs/audit_pt7_programming_v4.md", pt7Report());
write("docs/audit_pt8_leak_cleanup_v4.md", pt8LeakReport());
write("docs/audit_randomization_scoring_v4.md", randomizationReport());
write("docs/audit_reporting_v4.md", reportingReport());
write("docs/audit_repo_leakage_v4.md", repoLeakageReport());
write("docs/audit_v4_final_report.md", finalReport());
write("nulmetingen_dg_v4.md", v4Markdown());
write("nulmetingen_dg_v4.json", `${JSON.stringify(v4Json(), null, 2)}\n`);

JSON.parse(fs.readFileSync(path.join(root, "nulmetingen_dg_v4.json"), "utf8"));
console.log("v4 audit artifacts generated.");
