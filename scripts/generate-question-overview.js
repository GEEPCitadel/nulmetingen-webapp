import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import ts from "typescript";

const sourcePath = "nulmetingen_selected_response_herontwerp_v3.json";
const assessmentSourcePath = "src/data/assessments.ts";
const outputPath = "docs/analysis/nulmetingen_alle_vragen_antwoordmogelijkheden.md";
const versionIds = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"];
const versionLabels = {
  "lj1-vmbo": "Leerjaar 1 VMBO",
  "lj1-hv": "Leerjaar 1 HAVO/VWO",
  "lj3-vmbo": "Leerjaar 3 VMBO",
  "lj3-hv": "Leerjaar 3 HAVO/VWO",
};

const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

const loadAssessmentModule = () => {
  const absolutePath = path.resolve(assessmentSourcePath);
  const source = fs.readFileSync(absolutePath, "utf8");
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      resolveJsonModule: true,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: absolutePath,
  }).outputText;

  const assessmentModule = new Module(absolutePath);
  assessmentModule.filename = absolutePath;
  assessmentModule.paths = Module._nodeModulePaths(path.dirname(absolutePath));
  assessmentModule._compile(transpiled, absolutePath);
  return assessmentModule.exports;
};

const { assessments } = loadAssessmentModule();

const selectedResponseItemsFor = (versionId) => {
  if (Array.isArray(data.selectedResponseItems)) {
    return data.selectedResponseItems.filter(
      (item) => (item.targetGroup ?? item.target ?? item.variantFor) === versionId,
    );
  }
  return data.assessments?.find((entry) => entry.id === versionId)?.selectedResponseItems ?? [];
};

const optionId = (option) => String(option.optionId ?? option.id ?? option.label ?? option.text);
const optionText = (option) => String(option.label ?? option.text ?? "");
const normalizeList = (value) => (Array.isArray(value) ? value.map(String) : value ? [String(value)] : []);

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

const isHarmfulOption = (item, option) => {
  const harmfulAnswers = normalizeList(item.harmfulAnswers);
  return option.isHarmful === true || harmfulAnswers.includes(optionId(option));
};

const escapeMarkdown = (value) =>
  String(value ?? "")
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join(" ");

const list = (values) => (Array.isArray(values) ? values : values ? [values] : []);

const bulletLines = (values, indent = "") =>
  list(values)
    .map((value) => `${indent}- ${escapeMarkdown(value)}`)
    .filter((line) => line.trim() !== "-");

const formatRule = (rule) => {
  const parts = [`${escapeMarkdown(rule.id)}: ${escapeMarkdown(rule.description)} (${rule.points} pt)`];
  if (rule.partialPoints !== undefined) parts.push(`partial=${rule.partialPoints}`);
  if (rule.groupId) parts.push(`groep=${escapeMarkdown(rule.groupId)}`);
  if (rule.kind) parts.push(`type=${escapeMarkdown(rule.kind)}`);
  if (rule.conditions) {
    parts.push(
      `condities=${list(rule.conditions)
        .map((condition) =>
          typeof condition === "string"
            ? escapeMarkdown(condition)
            : `${escapeMarkdown(condition.field)} ${escapeMarkdown(condition.operator)} ${
                Array.isArray(condition.value)
                  ? condition.value.map(escapeMarkdown).join(", ")
                  : escapeMarkdown(condition.value ?? "")
              }`.trim(),
        )
        .join("; ")}`,
    );
  }
  if (rule.correctOptionIds) parts.push(`correct=${rule.correctOptionIds.map(escapeMarkdown).join(", ")}`);
  if (rule.forbiddenOptionIds) parts.push(`verboden=${rule.forbiddenOptionIds.map(escapeMarkdown).join(", ")}`);
  if (rule.minCorrect !== undefined) parts.push(`minCorrect=${rule.minCorrect}`);
  if (rule.correctMatches) {
    parts.push(
      `matches=${Object.entries(rule.correctMatches)
        .map(([left, right]) => `${escapeMarkdown(left)} -> ${escapeMarkdown(right)}`)
        .join("; ")}`,
    );
  }
  if (rule.firstBlock) parts.push(`eerste blok=${escapeMarkdown(rule.firstBlock)}`);
  if (rule.exactLength !== undefined) parts.push(`exactLength=${rule.exactLength}`);
  if (rule.requiredBlocks) parts.push(`vereist=${rule.requiredBlocks.map(escapeMarkdown).join(", ")}`);
  if (rule.orderedBlocks) parts.push(`volgorde=${rule.orderedBlocks.map(escapeMarkdown).join(" -> ")}`);
  if (rule.forbiddenBlocks) parts.push(`verboden=${rule.forbiddenBlocks.map(escapeMarkdown).join(", ")}`);
  if (rule.nestedBlocks) {
    parts.push(
      `genest=${rule.nestedBlocks
        .map(({ parent, child }) => `${escapeMarkdown(parent)} > ${escapeMarkdown(child)}`)
        .join("; ")}`,
    );
  }
  if (rule.requireExecuted) parts.push("moet uitgevoerd zijn");
  return parts.join(" | ");
};

const itemType = (item) =>
  item.type === "multiple" || item.type === "multiple_choice" || item.itemType === "multiple-select"
    ? "multiple select"
    : "single choice";

const stimulusLines = (item) => {
  if (item.stimulus?.kind === "email-link") {
    return [
      `- Stimulus: ${item.stimulus.label ?? "E-mail/link"}`,
      `  - Bericht: ${escapeMarkdown(item.stimulus.message)}`,
      `  - Adres/link: ${escapeMarkdown(item.stimulus.address)}`,
    ];
  }
  if (item.stimulus?.kind === "email-message") {
    return [
      `- Stimulus: e-mailbericht`,
      `  - Van: ${escapeMarkdown(item.stimulus.fromName)} <${escapeMarkdown(item.stimulus.fromEmail)}>`,
      `  - Aan: ${escapeMarkdown(item.stimulus.toEmail)}`,
      `  - Onderwerp: ${escapeMarkdown(item.stimulus.subject)}`,
      ...((item.stimulus.body ?? []).map((line) => `  - Tekst: ${escapeMarkdown(line)}`)),
      ...(item.stimulus.linkLabel && item.stimulus.linkUrl
        ? [`  - Link: ${escapeMarkdown(item.stimulus.linkLabel)} (${escapeMarkdown(item.stimulus.linkUrl)})`]
        : []),
    ];
  }
  if (item.stimulus?.address) {
    return [`- Stimulus: ${escapeMarkdown(item.stimulus.label ?? "Adresbalk")} ${escapeMarkdown(item.stimulus.address)}`];
  }
  if (item.context?.chatMessage) {
    return [
      `- Contextbericht: ${escapeMarkdown(item.context.chatMessage.sender)}`,
      `  - Tekst: ${escapeMarkdown(item.context.chatMessage.text)}`,
    ];
  }
  return [];
};

const coverageSummary = (items) => {
  const counts = new Map();
  for (const item of items) {
    const subgoal = String(item.subgoal ?? item.kerndoel ?? "onbekend");
    counts.set(subgoal, (counts.get(subgoal) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([left], [right]) => left.localeCompare(right, "nl"))
    .map(([subgoal, count]) => `${subgoal}: ${count}`)
    .join(" | ");
};

const allItems = versionIds.flatMap((versionId) => selectedResponseItemsFor(versionId));
const lines = [
  "# Overzicht vragen, antwoordmogelijkheden en PT-taken",
  "",
  `Bron: \`${sourcePath}\``,
  `Schema/status: \`${data.schemaVersion ?? "onbekend"}\` - ${data.status ?? "onbekend"}`,
  "",
  `PT-bron: \`${assessmentSourcePath}\``,
  "",
  "Doel: intern analysebestand voor beoordeling van kerndoeldekking en mogelijke item- en taakaanpassingen.",
  "Let op: dit bestand bevat interne scoringsinformatie, correcte antwoorden en scoringsregels. Niet gebruiken als leerlingmateriaal.",
  "",
  "## Kerndoeldekking selected-response",
  "",
  ...versionIds.map((versionId) => {
    const items = selectedResponseItemsFor(versionId);
    return `- ${versionLabels[versionId]} (${versionId}): ${coverageSummary(items)}`;
  }),
  "",
  `Totaal aantal selected-response-items: ${allItems.length}`,
  `Totaal aantal zelfinschattingen: ${assessments.reduce(
    (sum, assessment) =>
      sum +
      assessment.sections
        .flatMap((section) => section.items)
        .filter((item) => item.type === "self_assessment").length,
    0,
  )}`,
  `Totaal aantal performance tasks: ${assessments.reduce(
    (sum, assessment) =>
      sum +
      assessment.sections
        .filter((section) => section.id !== "sr")
        .flatMap((section) => section.items)
        .filter((item) => item.type !== "self_assessment").length,
    0,
  )}`,
  "",
];

const taskDetails = (item) => {
  const output = [
    `- Item-id: ${escapeMarkdown(item.id)}`,
    `- Type: ${escapeMarkdown(item.type)}`,
    `- Kerndoel/subdoel: ${escapeMarkdown(item.kerndoel)}${item.subgoal ? ` / ${escapeMarkdown(item.subgoal)}` : ""}`,
    `- Punten: ${item.points}`,
    `- Vaardigheidsdomein: ${escapeMarkdown(item.skillDomain)}`,
    `- Instructie: ${escapeMarkdown(item.instruction)}`,
  ];

  if (item.fileTask) {
    output.push("", "Opdrachten:");
    item.fileTask.tasks.forEach((task) => {
      output.push(
        `- ${escapeMarkdown(task.id)} (${task.points} pt): ${escapeMarkdown(task.description)}`,
        ...(task.expectedPath ? [`  - Verwacht pad: ${escapeMarkdown(task.expectedPath)}`] : []),
        ...(task.expectedPaths ? [`  - Verwachte paden: ${task.expectedPaths.map(escapeMarkdown).join("; ")}`] : []),
        ...(task.forbiddenPaths ? [`  - Verboden paden: ${task.forbiddenPaths.map(escapeMarkdown).join("; ")}`] : []),
      );
    });
  }

  if (item.mailTask) {
    output.push("", "Beschikbare opties:");
    output.push(...bulletLines([`Knoppen: ${item.mailTask.visibleButtons.join(", ")}`]));
    output.push(...bulletLines([`Contacten: ${item.mailTask.contacts.join(", ")}`]));
    output.push(...bulletLines([`Bestanden: ${item.mailTask.files.join(", ")}`]));
    output.push("", "Scoringsregels:");
    item.mailTask.rules.forEach((rule) => {
      output.push(`- ${formatRule(rule)}`);
      rule.conditions?.forEach((condition) => {
        output.push(
          `  - ${escapeMarkdown(condition.field)} ${escapeMarkdown(condition.operator)} ${
            Array.isArray(condition.value) ? condition.value.map(escapeMarkdown).join(", ") : escapeMarkdown(condition.value ?? "")
          }`.trim(),
        );
      });
    });
  }

  if (item.securityTask || item.socialTask) {
    const task = item.securityTask ?? item.socialTask;
    output.push("", "Schermen en antwoordmogelijkheden:");
    task.screens.forEach((screen) => {
      output.push(`- ${escapeMarkdown(screen.title)} (${escapeMarkdown(screen.id)})`);
      output.push(`  - Instructie: ${escapeMarkdown(screen.instruction)}`);
      if (screen.body) output.push(`  - Context: ${escapeMarkdown(screen.body)}`);
      if (screen.emailStimulus) {
        output.push(`  - E-mail: ${escapeMarkdown(screen.emailStimulus.subject)}`);
        output.push(`    - Van: ${escapeMarkdown(screen.emailStimulus.fromName)} <${escapeMarkdown(screen.emailStimulus.fromEmail)}>`);
        screen.emailStimulus.body.forEach((line) => output.push(`    - Tekst: ${escapeMarkdown(line)}`));
      }
      screen.groups.forEach((group) => {
        output.push(`  - Groep ${escapeMarkdown(group.id)} (${escapeMarkdown(group.inputType)}): ${escapeMarkdown(group.title)}`);
        if (group.cards) output.push(`    - Kaarten: ${group.cards.map((option) => escapeMarkdown(option.label)).join("; ")}`);
        if (group.options) output.push(`    - Opties: ${group.options.map((option) => escapeMarkdown(option.label)).join("; ")}`);
      });
    });
    output.push("", "Scoringsregels:");
    task.rules.forEach((rule) => output.push(`- ${formatRule(rule)}`));
    if (task.scoreCaps?.length) {
      output.push("", "Scorecaps:");
      task.scoreCaps.forEach((cap) => output.push(`- ${escapeMarkdown(cap.id)}: max ${cap.maxScore} bij ${cap.optionIds.map(escapeMarkdown).join(", ")}`));
    }
  }

  if (item.excelTask) {
    output.push(
      "",
      `Bestand: ${escapeMarkdown(item.excelTask.filename)}`,
      `Werkblad: ${escapeMarkdown(item.excelTask.sheetName)}`,
      "",
      "Vragen en correcte antwoorden:",
    );
    item.excelTask.questions.forEach((question) => {
      output.push(`- ${escapeMarkdown(question.id)} (${question.points} pt): ${escapeMarkdown(question.prompt)}`);
      output.push(`  - Correct antwoord/code: ${escapeMarkdown(question.answer)}`);
      if (question.tolerance) output.push(`  - Tolerantie: ${JSON.stringify(question.tolerance)}`);
    });
  }

  if (item.teamsTask) {
    output.push(
      "",
      `Scenario: ${escapeMarkdown(item.teamsTask.scenario)}`,
      `Knoppen: ${item.teamsTask.buttons.map(escapeMarkdown).join(", ")}`,
      `Deelopties: ${item.teamsTask.shareOptions.map(escapeMarkdown).join(", ")}`,
      `Vensters: ${item.teamsTask.windows.map(escapeMarkdown).join(", ")}`,
      `Correct venster: ${escapeMarkdown(item.teamsTask.correctWindow)}`,
      "",
      "Scoringsregels:",
    );
    item.teamsTask.rules.forEach((rule) => output.push(`- ${formatRule(rule)}`));
  }

  if (item.blockTask) {
    output.push("", "Programmeertaak:");
    if (item.blockTask.intro) output.push(`- Intro: ${escapeMarkdown(item.blockTask.intro)}`);
    if (item.blockTask.device) output.push(`- Device: ${escapeMarkdown(item.blockTask.device)}`);
    if (item.blockTask.codingSteps?.length) {
      output.push("- Verwachte stappen:");
      item.blockTask.codingSteps.forEach((step) => output.push(`  - ${escapeMarkdown(step)}`));
    }
    output.push("- Beschikbare blokken:");
    item.blockTask.blocks.forEach((block) => {
      const notes = [block.category, block.isContainer ? "container" : "", block.isCriticalDistractor ? "kritieke afleider" : ""]
        .filter(Boolean)
        .join("; ");
      output.push(`  - ${escapeMarkdown(block.label)}${notes ? ` (${escapeMarkdown(notes)})` : ""}`);
    });
    output.push("- Correct programma:");
    item.blockTask.correctProgram.forEach((block) => output.push(`  - ${escapeMarkdown(block)}`));
    if (item.blockTask.criteriaSpec) output.push(`- Criteria-spec: ${escapeMarkdown(item.blockTask.criteriaSpec)}`);
    output.push("", "Scoringsregels:");
    item.blockTask.rules.forEach((rule) => output.push(`- ${formatRule(rule)}`));
  }

  if (item.whutsuppTask) {
    output.push(
      "",
      `Whutsupp-variant: ${escapeMarkdown(item.whutsuppTask.gradeLabel)} (${escapeMarkdown(item.whutsuppTask.assessmentId)})`,
      `Taalniveau: ${escapeMarkdown(item.whutsuppTask.languageLevel)}`,
      `Groep: ${escapeMarkdown(item.whutsuppTask.groupTitle)}`,
      "",
      "Beslismomenten en antwoordmogelijkheden:",
    );
    item.whutsuppTask.nodes.forEach((node) => {
      output.push(`- ${escapeMarkdown(node.nodeId)} / ${escapeMarkdown(node.category)}: ${escapeMarkdown(node.prompt)}`);
      node.messages?.forEach((message) => {
        const body = message.kind === "videoCard" ? `[videoCard: ${escapeMarkdown(message.assetKey ?? "")}]` : escapeMarkdown(message.text);
        output.push(`  - Bericht ${escapeMarkdown(message.sender ?? "")}: ${body}`);
      });
      node.choices.forEach((choice) => {
        const notes = [
          choice.isCorrect ? "correct" : "niet correct",
          choice.unknown ? "weet ik niet" : "",
          choice.score !== undefined ? `score=${choice.score}` : "",
          choice.flags?.length ? `flags=${choice.flags.join(", ")}` : "",
        ]
          .filter(Boolean)
          .join("; ");
        output.push(`  - ${escapeMarkdown(choice.choiceId)}: ${escapeMarkdown(choice.label)} (${notes})`);
        if (choice.rationale) output.push(`    - Rationale: ${escapeMarkdown(choice.rationale)}`);
      });
      if (node.recovery) {
        output.push(`  - Herstelvraag: ${escapeMarkdown(node.recovery.prompt)}`);
        node.recovery.choices.forEach((choice) => {
          const notes = [choice.isCorrect ? "veilig herstel" : "niet veilig", choice.flags?.length ? `flags=${choice.flags.join(", ")}` : ""]
            .filter(Boolean)
            .join("; ");
          output.push(`    - ${escapeMarkdown(choice.choiceId)}: ${escapeMarkdown(choice.label)} (${notes})`);
        });
      }
    });
  }

  return output;
};

const selfAssessmentDetails = (item) => {
  const output = [
    `- Item-id: ${escapeMarkdown(item.id)}`,
    `- Type: ${escapeMarkdown(item.type)}`,
    `- Kerndoel/subdoel: ${escapeMarkdown(item.kerndoel)}`,
    `- Punten: ${item.points}`,
    `- Vaardigheidsdomein: ${escapeMarkdown(item.skillDomain)}`,
    `- Vraag/instructie: ${escapeMarkdown(item.instruction)}`,
    "",
    "Antwoordmogelijkheden:",
  ];

  if (item.selfAssessmentScale?.length) {
    item.selfAssessmentScale.forEach((scalePoint) => {
      output.push(`- ${scalePoint.value}: ${escapeMarkdown(scalePoint.label)}`);
    });
  } else {
    output.push("- Schuifschaal zonder expliciete labels in de bron.");
  }

  return output;
};

for (const versionId of versionIds) {
  const items = selectedResponseItemsFor(versionId);
  const assessment = assessments.find((entry) => entry.id === versionId);
  if (items.length !== 10) {
    throw new Error(`${versionId} bevat ${items.length} selected-response-items in plaats van 10.`);
  }
  if (!assessment) {
    throw new Error(`Geen assessmentdefinitie gevonden voor ${versionId}.`);
  }

  lines.push(`## ${versionLabels[versionId]} (${versionId})`, "");

  lines.push("### Zelfinschatting", "");
  const selfAssessmentItems = assessment.sections
    .flatMap((section) => section.items.map((item) => ({ section, item })))
    .filter(({ item }) => item.type === "self_assessment");

  selfAssessmentItems.forEach(({ section, item }) => {
    lines.push(`#### ${escapeMarkdown(item.title)} (${item.id})`, "");
    lines.push(`- Sectie: ${escapeMarkdown(section.title)} (${escapeMarkdown(section.id)})`);
    lines.push(...selfAssessmentDetails(item), "");
  });

  lines.push("### Performance tasks", "");
  const performanceItems = assessment.sections
    .filter((section) => section.id !== "sr")
    .flatMap((section) =>
      section.items
        .filter((item) => item.type !== "self_assessment")
        .map((item) => ({ section, item })),
    );

  performanceItems.forEach(({ section, item }, index) => {
    lines.push(`#### PT ${index + 1}: ${escapeMarkdown(item.title)} (${item.id})`, "");
    lines.push(`- Sectie: ${escapeMarkdown(section.title)} (${escapeMarkdown(section.id)})`);
    lines.push(...taskDetails(item), "");
  });

  lines.push("### Selected-response vragen", "");

  items.forEach((item, index) => {
    const itemOptions = item.options ?? [];
    const correctIds = itemOptions.filter((option) => isCorrectOption(item, option)).map(optionId);
    const unknownIds = itemOptions
      .filter((option) => option.isUnknownOption === true || option.unknown === true)
      .map(optionId);
    const harmfulIds = itemOptions.filter((option) => isHarmfulOption(item, option)).map(optionId);

    lines.push(
      `### Vraag ${index + 1}: ${escapeMarkdown(item.title)} (${item.id})`,
      "",
      `- Kerndoel/subdoel: ${escapeMarkdown(item.kerndoel ?? "")}${item.subgoal ? ` / ${escapeMarkdown(item.subgoal)}` : ""}`,
      `- Vraagtype: ${itemType(item)}`,
      `- Correct antwoord: ${correctIds.join(", ")}`,
      unknownIds.length ? `- Weet-ik-niet-optie: ${unknownIds.join(", ")}` : "- Weet-ik-niet-optie: geen",
      harmfulIds.length ? `- Schadelijke afleider(s): ${harmfulIds.join(", ")}` : "- Schadelijke afleider(s): geen",
      ...stimulusLines(item),
      `- Vraag: ${escapeMarkdown(item.question)}`,
    );

    if (item.subQuestions?.length) {
      lines.push("");
      item.subQuestions.forEach((subQuestion, subIndex) => {
        const subCorrectIds = normalizeList(subQuestion.correctAnswer);
        lines.push(
          `#### Deelvraag ${subIndex + 1}: ${escapeMarkdown(subQuestion.title ?? subQuestion.id)}`,
          "",
          `- Vraag: ${escapeMarkdown(subQuestion.question)}`,
          subCorrectIds.length ? `- Correct antwoord: ${subCorrectIds.join(", ")}` : "- Correct antwoord: zie optie met correct=true",
          "",
          "| Optie | Antwoord | Correct | Opmerking |",
          "| --- | --- | --- | --- |",
        );

        for (const option of subQuestion.options) {
          const subOptionId = optionId(option);
          const notes = [
            option.isUnknownOption || option.unknown ? "weet ik niet" : "",
            option.errorCategory ? `foutcategorie: ${escapeMarkdown(option.errorCategory)}` : "",
            option.sourceType ? `brontype: ${escapeMarkdown(option.sourceType)}` : "",
          ].filter(Boolean);
          const isCorrect =
            option.correct === true ||
            option.isCorrect === true ||
            option.score === 1 ||
            subCorrectIds.includes(subOptionId);
          lines.push(
            `| ${escapeMarkdown(subOptionId)} | ${escapeMarkdown(optionText(option))} | ${
              isCorrect ? "ja" : "nee"
            } | ${notes.join("; ")} |`,
          );
        }
        lines.push("");
      });
    } else {
      lines.push("", "| Optie | Antwoord | Correct | Opmerking |", "| --- | --- | --- | --- |");

      for (const option of itemOptions) {
        const notes = [
          option.isUnknownOption || option.unknown ? "weet ik niet" : "",
          isHarmfulOption(item, option) ? "schadelijke afleider" : "",
        ].filter(Boolean);
        lines.push(
          `| ${escapeMarkdown(optionId(option))} | ${escapeMarkdown(optionText(option))} | ${
            isCorrectOption(item, option) ? "ja" : "nee"
          } | ${notes.join("; ")} |`,
        );
      }
    }

    if (item.validityNote) {
      lines.push("", `- Interne onderbouwing: ${escapeMarkdown(item.validityNote)}`);
    }
    if (item.pilotReviewStatus) {
      lines.push(`- Reviewstatus: ${escapeMarkdown(item.pilotReviewStatus)}`);
    }
    lines.push("");
  });
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Overzicht geschreven naar ${outputPath}`);
