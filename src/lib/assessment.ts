import { assessmentMap, sloLabels } from "../data/assessments";
import { buildPath } from "./pt1";
import type {
  AssessmentItem,
  AssessmentResult,
  AssessmentSection,
  AssessmentSession,
  AssessmentVersion,
  CodeMapping,
  EventLog,
  Pt1State,
  ResponseType,
  Result,
  SelectedAnswer,
  SessionMetadata,
  StepDescriptor,
  WhutsuppAnswer,
  WhutsuppChoice,
  WhutsuppScoringSummary,
} from "../types";

const randomizeOptions = (ids: string[]) => {
  const clone = [...ids];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
  }
  return clone;
};

const resultKey = (sectionId: string, itemId: string) => `${sectionId}:${itemId}`;
const interactionOrderKey = (
  sectionId: string,
  itemId: string,
  screenId: string,
  groupId: string,
  kind: "cards" | "options",
) => `${sectionId}:${itemId}:${screenId}:${groupId}:${kind}`;

const isUnknownOption = (option: { id: string; label: string }) =>
  option.id.endsWith("-unknown") || option.label.trim().toLowerCase() === "ik weet het niet.";

export const getMappingCodes = (mapping: CodeMapping): string[] =>
  mapping.codes.map((code) => code.trim()).filter(Boolean);

const createPresentedOrders = (assessment: AssessmentVersion) => {
  const presentedOrders: Record<string, string[]> = {};

  assessment.sections.forEach((section) => {
    section.items.forEach((item) => {
      if (!item.options) {
        const interactionTask = item.securityTask ?? item.socialTask;
        interactionTask?.screens.forEach((screen) => {
          screen.groups.forEach((group) => {
            if (group.cards) {
              presentedOrders[
                interactionOrderKey(section.id, item.id, screen.id, group.id, "cards")
              ] = randomizeOptions(group.cards.map((card) => card.id));
            }
            if (group.options) {
              const unknownOptionIds = group.options
                .filter(isUnknownOption)
                .map((option) => option.id);
              const randomizedOptionIds = randomizeOptions(
                group.options
                  .filter((option) => !isUnknownOption(option))
                  .map((option) => option.id),
              );
              presentedOrders[
                interactionOrderKey(section.id, item.id, screen.id, group.id, "options")
              ] = randomizedOptionIds.concat(unknownOptionIds);
            }
          });
        });
        return;
      }

      const optionIds = item.options.map((option) => option.id);
      const contentOptionIds = optionIds.filter(
        (optionId) => optionId !== item.unknownOptionId,
      );
      const randomizedIds =
        item.randomizeOptions === false
          ? contentOptionIds
          : randomizeOptions(contentOptionIds);
      presentedOrders[resultKey(section.id, item.id)] =
        item.unknownOptionId && optionIds.includes(item.unknownOptionId)
          ? [...randomizedIds, item.unknownOptionId]
          : randomizedIds;
    });
  });

  return presentedOrders;
};

const createPt1InitialState = (item: AssessmentItem): Pt1State => ({
  nodes: item.fileTask?.simulation.nodes.map((node) => ({ ...node })) ?? [],
  actionLogs: [],
  undoStack: [],
  completed: false,
  score: 0,
  taskResults: [],
});

export const findAssessmentForCode = (
  code: string,
  mappings: CodeMapping[],
): AssessmentVersion | null => {
  const normalizedCode = code.trim().toLowerCase();
  const match = mappings.find(
    (mapping) =>
      getMappingCodes(mapping).some(
        (mappingCode) => mappingCode.toLowerCase() === normalizedCode,
      ),
  );
  return match ? assessmentMap[match.instrumentId] : null;
};

export const findInstrumentForCode = findAssessmentForCode;

export const createSession = (
  assessment: AssessmentVersion,
  accessCode: string,
  metadata?: SessionMetadata,
): AssessmentSession => ({
  id: crypto.randomUUID(),
  accessCode,
  versionId: assessment.id,
  instrumentId: assessment.id,
  metadata: metadata ?? {
    anonymousAttemptId: crypto.randomUUID(),
    anonymousCode: `sessie-${new Date().toISOString().slice(0, 10)}`,
  },
  startedAt: new Date().toISOString(),
  currentStepIndex: 0,
  results: [],
  eventLogs: [],
  presentedOrders: createPresentedOrders(assessment),
  pt1States: Object.fromEntries(
    assessment.sections.flatMap((section) =>
      section.items
        .filter((item) => item.type === "file_task_simulation")
        .map((item) => [item.id, createPt1InitialState(item)]),
    ),
  ),
});

export const completeSession = (session: AssessmentSession): AssessmentSession => ({
  ...session,
  completedAt: new Date().toISOString(),
});

export const getAssessment = (session: AssessmentSession) =>
  assessmentMap[session.versionId];

export const getInstrument = getAssessment;

export const getStepDescriptors = (assessment: AssessmentVersion): StepDescriptor[] =>
  assessment.sections.flatMap((section) =>
    section.items.map((item) => ({
      key: resultKey(section.id, item.id),
      itemType: item.type,
      sectionId: section.id,
      itemId: item.id,
    })),
  );

export const getSectionById = (assessment: AssessmentVersion, sectionId: string) =>
  assessment.sections.find((section) => section.id === sectionId);

export const getItemByStep = (
  assessment: AssessmentVersion,
  step: StepDescriptor,
) =>
  getSectionById(assessment, step.sectionId)?.items.find(
    (item) => item.id === step.itemId,
  ) ?? null;

export const getPresentedOrder = (
  session: AssessmentSession,
  sectionId: string,
  itemId: string,
) => session.presentedOrders[resultKey(sectionId, itemId)] ?? [];

export const getPresentedInteractionOrder = (
  session: AssessmentSession,
  sectionId: string,
  itemId: string,
  screenId: string,
  groupId: string,
  kind: "cards" | "options",
) =>
  session.presentedOrders[
    interactionOrderKey(sectionId, itemId, screenId, groupId, kind)
  ] ?? [];

const isSameAnswer = (
  selectedAnswer: SelectedAnswer,
  correctAnswer: string | string[] | undefined,
  scoreMode: AssessmentItem["scoreMode"] = "exact",
) => {
  if (correctAnswer === undefined || selectedAnswer === null) {
    return false;
  }

  if (Array.isArray(correctAnswer)) {
    if (scoreMode === "unordered_set") {
      return (
        Array.isArray(selectedAnswer) &&
        correctAnswer.length === selectedAnswer.length &&
        correctAnswer.every((answer) => selectedAnswer.includes(answer))
      );
    }

    return (
      Array.isArray(selectedAnswer) &&
      correctAnswer.length === selectedAnswer.length &&
      correctAnswer.every((answer, index) => selectedAnswer[index] === answer)
    );
  }

  return selectedAnswer === correctAnswer;
};

const answerRecord = (selectedAnswer: SelectedAnswer): Record<string, unknown> =>
  selectedAnswer && typeof selectedAnswer === "object" && !Array.isArray(selectedAnswer)
    ? selectedAnswer
    : {};

const stringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.map((entry) => String(entry)) : [];

const normalizeShortCode = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/\.$/, "")
    .toUpperCase();

export const parseNumeric = (value: string): number | null => {
  let cleaned = String(value ?? "").trim().replace(/[€$£\s]/g, "");
  if (!cleaned) {
    return null;
  }
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    cleaned =
      lastComma > lastDot
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.replace(/,/g, "");
  } else if (lastComma > -1) {
    cleaned = cleaned.length - lastComma - 1 === 3 ? cleaned.replace(/,/g, "") : cleaned.replace(",", ".");
  } else if (lastDot > -1 && cleaned.length - lastDot - 1 === 3) {
    cleaned = cleaned.replace(/\./g, "");
  }
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const scoreMultipleChoiceItem = (item: AssessmentItem, selectedAnswer: SelectedAnswer) => {
  if (item.scoreMode !== "partial_select" || !Array.isArray(item.correctAnswer)) {
    const isCorrect = isSameAnswer(selectedAnswer, item.correctAnswer, item.scoreMode);
    return {
      isCorrect,
      score: isCorrect ? item.points : 0,
      taskResults: [],
    };
  }

  const selectedIds = Array.isArray(selectedAnswer) ? selectedAnswer.map(String) : [];
  if (item.unknownOptionId && selectedIds.includes(item.unknownOptionId)) {
    return { isCorrect: false, score: 0, taskResults: [] };
  }

  const correctIds = item.correctAnswer.map(String);
  const correctSelectedCount = selectedIds.filter((id) => correctIds.includes(id)).length;
  const rawScore =
    correctIds.length === 0 ? 0 : (correctSelectedCount / correctIds.length) * item.points;
  const hasHarmfulSelection = (item.harmfulOptionIds ?? []).some((id) => selectedIds.includes(id));
  const cappedScore =
    hasHarmfulSelection && item.harmfulSelectionMaxScore !== undefined
      ? Math.min(rawScore, item.harmfulSelectionMaxScore)
      : rawScore;
  const score = Math.round(cappedScore * 100) / 100;

  return {
    isCorrect: score === item.points,
    score,
    taskResults: [],
  };
};

const scoreFileTask = (item: AssessmentItem, state?: Pt1State) => {
  const requirements = item.correctState?.requiredPaths ?? [];
  const taskResults = requirements.map((requirement) => ({
    taskId: requirement.id,
    description: requirement.description,
    correct: (() => {
      if (!state) {
        return false;
      }
      const paths = state.nodes.map((node) => buildPath(state.nodes, node.id));
      const expectedPaths = [
        ...(requirement.expectedPath ? [requirement.expectedPath] : []),
        ...(requirement.expectedPaths ?? []),
      ];
      const hasExpected = expectedPaths.every((path) => paths.includes(path));
      const hasForbidden = (requirement.forbiddenPaths ?? []).some((path) =>
        paths.includes(path),
      );
      return hasExpected && !hasForbidden;
    })(),
  }));
  const score = taskResults.reduce(
    (sum, task) =>
      sum + (task.correct ? requirements.find((req) => req.id === task.taskId)?.points ?? 0 : 0),
    0,
  );

  return {
    isCorrect: requirements.length > 0 && taskResults.every((task) => task.correct),
    score,
    taskResults,
  };
};

const scoreMailTask = (item: AssessmentItem, selectedAnswer: SelectedAnswer) => {
  const state = answerRecord(selectedAnswer);
  const rules = item.mailTask?.rules ?? [];
  const getField = (field: string) => {
    if (field === "sent") {
      return Boolean(state.sent);
    }
    if (
      field === "subject" ||
      field === "subjectOptionId" ||
      field === "priority" ||
      field === "greetingOptionId" ||
      field === "closingOptionId"
    ) {
      return String(state[field] ?? "").trim();
    }
    return stringArray(state[field]);
  };
  const conditionMatches = (condition: NonNullable<typeof rules[number]>["conditions"][number]) => {
    const actual = getField(condition.field);
    const expected = condition.value;

    if (condition.operator === "true") {
      return actual === true;
    }
    if (condition.operator === "equals") {
      return String(actual) === String(expected ?? "");
    }
    if (condition.operator === "includes") {
      return Array.isArray(actual) && actual.includes(String(expected ?? ""));
    }
    if (condition.operator === "allInclude") {
      const expectedValues = stringArray(expected);
      return Array.isArray(actual) && expectedValues.every((value) => actual.includes(value));
    }
    if (condition.operator === "noneInclude") {
      const expectedValues = stringArray(expected);
      return Array.isArray(actual) && expectedValues.every((value) => !actual.includes(value));
    }
    return false;
  };
  const taskResults = rules.map((rule) => ({
    taskId: rule.id,
    description: rule.description,
    correct: rule.conditions.every(conditionMatches),
  }));
  const score = taskResults.reduce(
    (sum, result) => sum + (result.correct ? rules.find((rule) => rule.id === result.taskId)?.points ?? 0 : 0),
    0,
  );

  return {
    isCorrect: rules.length > 0 && taskResults.every((result) => result.correct),
    score,
    taskResults,
  };
};

const scoreExcelDownloadTask = (item: AssessmentItem, selectedAnswer: SelectedAnswer) => {
  const state = answerRecord(selectedAnswer);
  const answers = answerRecord(state.answers as SelectedAnswer);
  const questions = item.excelTask?.questions ?? [];
  const taskResults = questions.map((question) => ({
    taskId: question.id,
    description: question.prompt,
    correct: (() => {
      const rawAnswer = answers[question.id];
      if (question.tolerance?.numeric) {
        const actual = parseNumeric(String(rawAnswer ?? ""));
        const expected =
          typeof question.answer === "number"
            ? question.answer
            : parseNumeric(String(question.answer));
        return (
          actual !== null &&
          expected !== null &&
          Math.abs(actual - expected) <= (question.tolerance.deltaAbs ?? 0)
        );
      }
      return normalizeShortCode(rawAnswer) === normalizeShortCode(question.answer);
    })(),
  }));
  const score = taskResults.reduce(
    (sum, result) =>
      sum + (result.correct ? questions.find((question) => question.id === result.taskId)?.points ?? 0 : 0),
    0,
  );

  return {
    isCorrect: questions.length > 0 && taskResults.every((result) => result.correct),
    score,
    taskResults,
  };
};

const scoreOfficeFormatTask = (item: AssessmentItem, selectedAnswer: SelectedAnswer) => {
  const state = answerRecord(selectedAnswer);
  const config = item.officeFormatTask;
  if (!config) {
    return { isCorrect: false, score: 0, taskResults: [] };
  }

  const taskResults = [
    {
      taskId: `${item.id}-code`,
      description: config.codeQuestion,
      correct: normalizeShortCode(state.code) === normalizeShortCode(config.code),
      points: config.codePoints,
    },
    {
      taskId: `${item.id}-export`,
      description: config.exportQuestion,
      correct: state.exportAction === config.correctExportAction,
      points: config.exportPoints,
    },
  ];
  const score = taskResults.reduce(
    (sum, result) => sum + (result.correct ? result.points : 0),
    0,
  );

  return {
    isCorrect: taskResults.every((result) => result.correct),
    score,
    taskResults,
  };
};

const scorePowerPointTask = (item: AssessmentItem, selectedAnswer: SelectedAnswer) => {
  const state = answerRecord(selectedAnswer);
  const rules = item.powerPointTask?.rules ?? [];
  const taskResults = rules.map((rule) => {
    const selected = String(state[rule.groupId] ?? "");
    return {
      taskId: rule.id,
      description: rule.description,
      correct: rule.correctOptionIds.includes(selected),
    };
  });
  const score = taskResults.reduce(
    (sum, result) =>
      sum + (result.correct ? rules.find((rule) => rule.id === result.taskId)?.points ?? 0 : 0),
    0,
  );

  return {
    isCorrect: rules.length > 0 && taskResults.every((result) => result.correct),
    score,
    taskResults,
  };
};

const actionTypesFromAnswer = (selectedAnswer: SelectedAnswer) => {
  const state = answerRecord(selectedAnswer);
  const actionLog = Array.isArray(state.actionLog) ? state.actionLog : [];
  return actionLog
    .map((entry) =>
      entry && typeof entry === "object" && "actionType" in entry
        ? String((entry as { actionType?: unknown }).actionType ?? "")
        : "",
    )
    .filter(Boolean);
};

const hasOrderedActions = (actions: string[], expectedActions: string[]) => {
  let cursor = 0;
  for (const action of actions) {
    if (action === expectedActions[cursor]) {
      cursor += 1;
      if (cursor === expectedActions.length) {
        return true;
      }
    }
  }
  return expectedActions.length === 0;
};

const scoreTeamsTask = (item: AssessmentItem, selectedAnswer: SelectedAnswer) => {
  const state = answerRecord(selectedAnswer);
  const rules = item.teamsTask?.rules ?? [];
  const selectedWindow = String(state.selectedWindow ?? "");
  const actionTypes = actionTypesFromAnswer(selectedAnswer);
  const correctSequence = ["clicked_share", "clicked_window", "selected_windows_media_player"];
  const conditionMatches = (condition: string) => {
    if (condition === "clicked_share") {
      return actionTypes.includes("clicked_share");
    }
    if (condition === "clicked_window") {
      return hasOrderedActions(actionTypes, ["clicked_share", "clicked_window"]);
    }
    if (condition === "selected_windows_media_player" || condition === "correctSequence") {
      return hasOrderedActions(actionTypes, correctSequence);
    }
    if (condition === "shareOpened") {
      return state.shareOpened === true;
    }
    if (condition === "computerSoundOn") {
      return state.computerSoundOn === true;
    }
    if (condition === "mediaPlayerSelected") {
      return selectedWindow === item.teamsTask?.correctWindow;
    }
    if (condition === "notWholeScreen") {
      return Boolean(selectedWindow) && selectedWindow !== "Hele scherm" && selectedWindow !== "Scherm";
    }
    return false;
  };
  const taskResults = rules.map((rule) => ({
    taskId: rule.id,
    description: rule.description,
    correct: rule.conditions.every(conditionMatches),
  }));
  const score = taskResults.reduce(
    (sum, result) => sum + (result.correct ? rules.find((rule) => rule.id === result.taskId)?.points ?? 0 : 0),
    0,
  );

  return {
    isCorrect: rules.length > 0 && taskResults.every((result) => result.correct),
    score,
    taskResults,
  };
};

const getProgramEntries = (selectedAnswer: SelectedAnswer): Array<{ label: string; indent: number }> => {
  const state = answerRecord(selectedAnswer);
  const program = state.program;
  if (!Array.isArray(program)) {
    return [];
  }
  return program.map((entry) =>
    typeof entry === "string"
      ? { label: entry, indent: 0 }
      : entry && typeof entry === "object" && "label" in entry
        ? {
            label: String((entry as { label: unknown }).label),
            indent: Number((entry as { indent?: unknown }).indent ?? 0),
          }
        : { label: "", indent: 0 },
  );
};

const hasOrderedSubsequence = (program: string[], orderedBlocks: string[]) => {
  let cursor = 0;
  for (const block of program) {
    if (block === orderedBlocks[cursor]) {
      cursor += 1;
      if (cursor === orderedBlocks.length) {
        return true;
      }
    }
  }
  return orderedBlocks.length === 0;
};

const hasNestedBlock = (
  program: Array<{ label: string; indent: number }>,
  parent: string,
  child: string,
) => {
  const parentIndex = program.findIndex((entry) => entry.label === parent);
  if (parentIndex === -1) {
    return false;
  }

  const parentIndent = program[parentIndex].indent;
  for (let index = parentIndex + 1; index < program.length; index += 1) {
    const entry = program[index];
    if (entry.indent <= parentIndent) {
      return false;
    }
    if (entry.label === child) {
      return true;
    }
  }
  return false;
};

const blockIndex = (program: Array<{ label: string; indent: number }>, label: string) =>
  program.findIndex((entry) => entry.label === label);

const countBlock = (program: string[], label: string) =>
  program.filter((entry) => entry === label).length;

const scoreV6BlockTask = (
  item: AssessmentItem,
  selectedAnswer: SelectedAnswer,
  criteriaSpec: string,
) => {
  const state = answerRecord(selectedAnswer);
  const programEntries = getProgramEntries(selectedAnswer);
  const program = programEntries.map((entry) => entry.label);
  const runEffects = answerRecord(state.runEffects as SelectedAnswer);
  const speech = String(runEffects.speech ?? "");
  const sound = String(runEffects.sound ?? "");
  const executed = state.executed === true;
  const has = (label: string) => program.includes(label);
  const nested = (parent: string, child: string) => hasNestedBlock(programEntries, parent, child);
  const ordered = (...labels: string[]) => hasOrderedSubsequence(program, labels);
  const criteria = {
    "pt7-lj1v": [
      { id: "move", description: "Bizzy beweegt 1 meter vooruit.", points: 1, correct: has("verplaats Bizzy 1 meter vooruit in 1 sec.") },
      { id: "turn", description: "Bizzy draait 180 graden.", points: 1, correct: has("draai Bizzy met de wijzers van de klok mee naar 180 graden in 1 sec.") },
      { id: "wait", description: "Bizzy wacht 1 seconde voordat hij praat.", points: 1, correct: ordered("wacht 1 seconde", 'Bizzy zegt "Hoi!"') || ordered("wacht 1 seconde", 'Bizzy zegt "Hoi!"') },
      { id: "say", description: 'Bizzy zegt "Hoi!".', points: 1, correct: executed && speech === "Hoi!" && has('Bizzy zegt "Hoi!"') },
    ],
    "pt7-lj1h": [
      { id: "say", description: 'Bizzy zegt "Hoi!".', points: 1, correct: executed && speech === "Hoi!" },
      { id: "repeat-three", description: "herhaal 3 keer met verplaats 1 meter genest.", points: 1, correct: nested("herhaal 3 keer", "verplaats Bizzy 1 meter vooruit in 1 sec.") },
      { id: "move-three", description: "Bizzy beweegt in totaal 3 meter vooruit.", points: 1, correct: Number(runEffects.move ?? 0) === 3 },
      { id: "no-repeat-ten", description: "afleider herhaal 10 keer niet gebruikt.", points: 1, correct: !has("herhaal 10 keer") },
    ],
    "pt7-lj3v": [
      { id: "repeat-four", description: "herhaal 4 keer gebruikt.", points: 1, correct: has("herhaal 4 keer") },
      { id: "nested-square", description: "verplaats 1 meter en draai 90 graden staan in herhaal 4.", points: 1, correct: nested("herhaal 4 keer", "verplaats Bizzy 1 meter vooruit in 1 sec.") && nested("herhaal 4 keer", "draai Bizzy met de wijzers van de klok mee naar 90 graden in 1 sec.") },
      { id: "closed-square", description: "vier zijden en hoeken aanwezig.", points: 1, correct: (has("herhaal 4 keer") && nested("herhaal 4 keer", "verplaats Bizzy 1 meter vooruit in 1 sec.") && nested("herhaal 4 keer", "draai Bizzy met de wijzers van de klok mee naar 90 graden in 1 sec.")) || (countBlock(program, "verplaats Bizzy 1 meter vooruit in 1 sec.") >= 4 && countBlock(program, "draai Bizzy met de wijzers van de klok mee naar 90 graden in 1 sec.") >= 4) },
      { id: "say-ready", description: 'Bizzy zegt "Klaar!".', points: 1, correct: executed && speech === "Klaar!" },
    ],
    "pt7-lj3h": [
      { id: "repeat-three", description: "herhaal 3 keer gebruikt.", points: 1, correct: has("herhaal 3 keer") },
      { id: "nested-return", description: "heen-en-weer-blokken staan in de herhaling.", points: 1, correct: nested("herhaal 3 keer", "verplaats Bizzy 2 meter vooruit in 1 sec.") && nested("herhaal 3 keer", "draai Bizzy met de wijzers van de klok mee naar 180 graden in 1 sec.") },
      { id: "applause", description: "applaus speelt na de herhaling.", points: 1, correct: executed && sound === "Applaus" && blockIndex(programEntries, "speel geluid Applaus") > blockIndex(programEntries, "herhaal 3 keer") },
      { id: "no-1m", description: "geen verplaats 1 meter gebruikt.", points: 1, correct: !has("verplaats Bizzy 1 meter vooruit in 1 sec.") },
    ],
  }[criteriaSpec] ?? [];

  const taskResults = criteria.map((criterion) => ({
    taskId: criterion.id,
    description: criterion.description,
    correct: criterion.correct,
  }));
  const score = criteria.reduce((sum, criterion) => sum + (criterion.correct ? criterion.points : 0), 0);
  return {
    isCorrect: criteria.length > 0 && taskResults.every((result) => result.correct),
    score,
    taskResults,
  };
};

const scoreBlockTask = (item: AssessmentItem, selectedAnswer: SelectedAnswer) => {
  if (item.blockTask?.criteriaSpec) {
    return scoreV6BlockTask(item, selectedAnswer, item.blockTask.criteriaSpec);
  }
  const state = answerRecord(selectedAnswer);
  const programEntries = getProgramEntries(selectedAnswer);
  const program = programEntries.map((entry) => entry.label);
  const rules = item.blockTask?.rules ?? [];
  const taskResults = rules.map((rule) => {
    const firstBlockOk = rule.firstBlock ? program[0] === rule.firstBlock : true;
    const lengthOk = rule.exactLength ? program.length === rule.exactLength : true;
    const requiredOk = (rule.requiredBlocks ?? []).every((block) => program.includes(block));
    const orderedOk = rule.orderedBlocks
      ? hasOrderedSubsequence(program, rule.orderedBlocks)
      : true;
    const nestedOk = (rule.nestedBlocks ?? []).every((requirement) =>
      hasNestedBlock(programEntries, requirement.parent, requirement.child),
    );
    const forbiddenOk = !(rule.forbiddenBlocks ?? []).some((block) => program.includes(block));
    const executedOk = rule.requireExecuted ? state.executed === true : true;
    return {
      taskId: rule.id,
      description: rule.description,
      correct:
        firstBlockOk &&
        lengthOk &&
        requiredOk &&
        orderedOk &&
        nestedOk &&
        forbiddenOk &&
        executedOk,
    };
  });
  const score = taskResults.reduce(
    (sum, result) => sum + (result.correct ? rules.find((rule) => rule.id === result.taskId)?.points ?? 0 : 0),
    0,
  );

  return {
    isCorrect: rules.length > 0 && taskResults.every((result) => result.correct),
    score,
    taskResults,
  };
};

const scoreSourceEvaluationTask = (item: AssessmentItem, selectedAnswer: SelectedAnswer) => {
  const state = answerRecord(selectedAnswer);
  const answers = answerRecord(state.answers as SelectedAnswer);
  const questions = item.sourceEvaluationTask?.questions ?? [];
  const taskResults = questions.map((question) => {
    if (question.type === "dropdown") {
      return {
        taskId: question.id,
        description: question.prompt,
        correct: answers[question.id] === question.correctOptionId,
        points: answers[question.id] === question.correctOptionId ? question.points : 0,
      };
    }
    const selected = stringArray(answers[question.id]);
    const correctIds = question.options.filter((option) => option.correctAsSignal).map((option) => option.id);
    const distractorIds = question.options.filter((option) => option.distractor).map((option) => option.id);
    const correctCount = selected.filter((id) => correctIds.includes(id)).length;
    const distractorCount = selected.filter((id) => distractorIds.includes(id)).length;
    const correct =
      correctCount >= question.scoring.minCorrect &&
      distractorCount <= question.scoring.maxDistractor;
    return {
      taskId: question.id,
      description: question.prompt,
      correct,
      points: correct ? question.scoring.points : 0,
    };
  });
  const score = taskResults.reduce((sum, result) => sum + result.points, 0);
  return {
    isCorrect: questions.length > 0 && taskResults.every((result) => result.correct),
    score,
    taskResults,
  };
};

const selectedIdsForGroup = (state: Record<string, unknown>, groupId: string): string[] => {
  const value = state[groupId];
  if (Array.isArray(value)) {
    return value.map(String);
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
};

const scoreInteractionTask = (
  config: AssessmentItem["securityTask"] | AssessmentItem["socialTask"],
  selectedAnswer: SelectedAnswer,
) => {
  const state = answerRecord(selectedAnswer);
  const rules = config?.rules ?? [];
  const taskResults = rules.map((rule) => {
    const selectedIds = selectedIdsForGroup(state, rule.groupId);
    const selectedOptionId = selectedIds[0] ?? "";
    const group = config?.screens
      .flatMap((screen) => screen.groups)
      .find((candidate) => candidate.id === rule.groupId);
    const selectedOption = group?.options?.find((option) => option.id === selectedOptionId);
    const correctIds = rule.correctOptionIds ?? [];
    const forbiddenIds = rule.forbiddenOptionIds ?? [];
    const forbiddenByGroupOk = Object.entries(rule.forbiddenByGroup ?? {}).every(
      ([groupId, ids]) =>
        ids.every((id) => !selectedIdsForGroup(state, groupId).includes(id)),
    );
    const correctCount = selectedIds.filter((id) => correctIds.includes(id)).length;
    const alternativeCorrect = Object.entries(
      rule.alternativeCorrectOptionIdsByGroup ?? {},
    ).some(([groupId, ids]) =>
      ids.some((id) => selectedIdsForGroup(state, groupId).includes(id)),
    );
    const matches = answerRecord(state[rule.groupId] as SelectedAnswer);
    const matchEntries = Object.entries(rule.correctMatches ?? {});
    const correctMatchCount = matchEntries.filter(
      ([cardId, optionId]) => matches[cardId] === optionId,
    ).length;

    const baseCorrect =
      rule.kind === "singleCorrect"
        ? selectedIds.length === 1 && correctIds.includes(selectedIds[0])
        : rule.kind === "allSelected"
          ? correctIds.every((id) => selectedIds.includes(id))
          : rule.kind === "minCorrect"
            ? correctCount >= (rule.minCorrect ?? correctIds.length)
            : rule.kind === "noForbidden"
              ? forbiddenIds.every((id) => !selectedIds.includes(id)) && forbiddenByGroupOk
              : rule.kind === "toggleOn"
                ? state[rule.groupId] === true
                : rule.kind === "matchingAll"
                  ? Object.entries(rule.correctMatches ?? {}).every(
                      ([cardId, optionId]) => matches[cardId] === optionId,
                    )
                  : rule.kind === "matchingPartial"
                    ? matchEntries.length > 0 && correctMatchCount === matchEntries.length
                  : false;
    const correct = baseCorrect || alternativeCorrect;
    const awardedPoints =
      rule.kind === "matchingPartial" && forbiddenByGroupOk
        ? correctMatchCount === matchEntries.length
          ? rule.points
          : correctMatchCount > 0
            ? rule.partialPoints ?? 0
            : 0
        : correct && forbiddenByGroupOk
          ? rule.points
          : 0;

    return {
      taskId: rule.id,
      description: rule.description,
      correct: awardedPoints === rule.points,
      points: awardedPoints,
      selectedOptionId: selectedOptionId || undefined,
      unknown: selectedOption?.unknown === true || selectedOption?.exclusive === true || selectedOptionId === "unknown",
      errorCategory: selectedOption?.errorCategory,
    };
  });
  const uncappedScore = taskResults.reduce((sum, result) => sum + result.points, 0);
  const caps = config?.scoreCaps ?? [];
  const capScore = caps.reduce((currentCap, cap) => {
    const capApplies = (cap.groupIds ?? Object.keys(state)).some((groupId) => {
      const selectedIds = selectedIdsForGroup(state, groupId);
      return cap.optionIds.some((optionId) => selectedIds.includes(optionId));
    });
    return capApplies ? Math.min(currentCap, cap.maxScore) : currentCap;
  }, Number.POSITIVE_INFINITY);
  const score = Number.isFinite(capScore) ? Math.min(uncappedScore, capScore) : uncappedScore;

  return {
    isCorrect: rules.length > 0 && taskResults.every((result) => result.correct) && score === uncappedScore,
    score,
    taskResults,
  };
};

const flagCount = (flags: string[], flag: string) =>
  flags.filter((candidate) => candidate === flag).length;

const whutsuppAnswerFrom = (selectedAnswer: SelectedAnswer): WhutsuppAnswer | null => {
  const state = answerRecord(selectedAnswer);
  const path = Array.isArray(state.path) ? state.path : [];
  if (path.length === 0) {
    return null;
  }
  return {
    assessmentId: String(state.assessmentId ?? "") as WhutsuppAnswer["assessmentId"],
    variantId: String(state.variantId ?? state.assessmentId ?? "") as WhutsuppAnswer["variantId"],
    path: path.map((entry) => {
      const record = answerRecord(entry as SelectedAnswer);
      return {
        nodeId: String(record.nodeId ?? ""),
        category: String(record.category ?? ""),
        choiceId: String(record.choiceId ?? ""),
        recoveryChoiceId:
          record.recoveryChoiceId == null ? undefined : String(record.recoveryChoiceId),
      };
    }),
    choiceOrderByNode: answerRecord(state.choiceOrderByNode as SelectedAnswer) as Record<string, string[]>,
  };
};

const choiceById = (choices: WhutsuppChoice[], choiceId?: string) =>
  choices.find((choice) => choice.choiceId === choiceId);

const countMap = (values: string[]) =>
  values.reduce<Record<string, number>>((map, value) => {
    map[value] = (map[value] ?? 0) + 1;
    return map;
  }, {});

const feedbackForWhutsupp = (
  item: AssessmentItem,
  summary: Omit<WhutsuppScoringSummary, "feedback">,
) => {
  const rules = item.whutsuppTask?.resultsFeedbackRules ?? [];
  return rules
    .filter((rule) => {
      if (rule.condition.startsWith("categoryCorrect.")) {
        const category = rule.condition.replace("categoryCorrect.", "");
        return (summary.categoryScores[category] ?? 0) > 0;
      }
      if (rule.condition.startsWith("hasFlag.")) {
        const flag = rule.condition.replace("hasFlag.", "");
        return (summary.flags[flag] ?? 0) > 0;
      }
      if (rule.condition === "hasRecoverySafe") {
        return summary.recoverySafeCount > 0;
      }
      return false;
    })
    .map((rule) => rule.text);
};

const scoreWhutsuppTask = (item: AssessmentItem, selectedAnswer: SelectedAnswer) => {
  const variant = item.whutsuppTask;
  const answer = whutsuppAnswerFrom(selectedAnswer);
  if (!variant || !answer) {
    return { isCorrect: false, score: 0, taskResults: [] };
  }

  const categoryScores: Record<string, number> = {};
  const selectedChoiceIds: string[] = [];
  const allFlags: string[] = [];
  let recoverySafeCount = 0;
  let unknownCount = 0;

  const taskResults = variant.nodes.map((node) => {
    const entry = answer.path.find((candidate) => candidate.nodeId === node.nodeId);
    const mainChoice = choiceById(node.choices, entry?.choiceId);
    const recoveryChoice = choiceById(node.recovery?.choices ?? [], entry?.recoveryChoiceId);
    const mainFlags = mainChoice?.flags ?? [];
    const recoveryFlags = recoveryChoice?.flags ?? [];

    if (mainChoice) {
      selectedChoiceIds.push(mainChoice.choiceId);
      allFlags.push(...mainFlags);
      if (mainChoice.unknown === true || mainChoice.choiceId === "unknown" || mainFlags.includes("unknown")) {
        unknownCount += 1;
      }
    }
    if (recoveryChoice) {
      selectedChoiceIds.push(`${node.nodeId}:${recoveryChoice.choiceId}`);
      allFlags.push(...recoveryFlags);
      if (recoveryChoice.unknown === true || recoveryChoice.choiceId === "unknown" || recoveryFlags.includes("unknown")) {
        unknownCount += 1;
      }
      if (recoveryFlags.includes("recovery_safe") || recoveryChoice.isCorrect === true) {
        recoverySafeCount += 1;
      }
    }

    const points = mainChoice?.isCorrect === true ? 1 : 0;
    categoryScores[node.category] = points;
    return {
      taskId: node.category,
      description: node.prompt,
      correct: points === 1,
      points,
    };
  });

  const pt8ScoreRaw = taskResults.reduce((sum, result) => sum + result.points, 0);
  const flags = countMap(allFlags);
  const capValues = [
    { flag: "harmful_share", maxScore: 2 },
    { flag: "retaliation", maxScore: 2 },
    { flag: "unsafe_evidence_share", maxScore: 3 },
    { flag: "ridicule_reaction", maxScore: 3 },
  ]
    .filter((cap) => (flags[cap.flag] ?? 0) > 0)
    .map((cap) => cap.maxScore);
  const capScore = capValues.length > 0 ? Math.min(...capValues) : Number.POSITIVE_INFINITY;
  const pt8ScoreCapped = Math.min(pt8ScoreRaw, capScore);
  const summaryWithoutFeedback = {
    assessmentId: answer.assessmentId,
    variantId: answer.variantId,
    selectedChoiceIds,
    categoryScores,
    pt8ScoreRaw,
    pt8ScoreCapped,
    flags,
    unknownCount,
    harmfulShareCount: flagCount(allFlags, "harmful_share"),
    ridiculeCount: flagCount(allFlags, "ridicule_reaction"),
    unsafeEvidenceCount: flagCount(allFlags, "unsafe_evidence_share"),
    retaliationCount: flagCount(allFlags, "retaliation"),
    recoverySafeCount,
    chosenDistractorTypes: Array.from(new Set(allFlags.filter((flag) => flag !== "recovery_safe"))),
  };
  const scoringSummary: WhutsuppScoringSummary = {
    ...summaryWithoutFeedback,
    feedback: feedbackForWhutsupp(item, summaryWithoutFeedback),
  };

  return {
    isCorrect: variant.nodes.length > 0 && taskResults.every((result) => result.correct) && pt8ScoreCapped === item.points,
    score: pt8ScoreCapped,
    taskResults,
    scoringSummary,
  };
};

export const scoreItem = (
  item: AssessmentItem,
  selectedAnswer: SelectedAnswer,
  state?: Pt1State,
) => {
  if (answerRecord(selectedAnswer).skipped === true) {
    return { isCorrect: false, score: 0, taskResults: [] };
  }

  if (item.type === "self_assessment") {
    return { isCorrect: null, score: 0, taskResults: [] };
  }

  if (item.type === "file_task_simulation") {
    return scoreFileTask(item, state);
  }

  if (item.type === "outlook_mail_simulation") {
    return scoreMailTask(item, selectedAnswer);
  }

  if (item.type === "account_security_simulation") {
    return scoreInteractionTask(item.securityTask, selectedAnswer);
  }

  if (item.type === "excel_download_task") {
    return scoreExcelDownloadTask(item, selectedAnswer);
  }

  if (item.type === "office_format_download_task") {
    return scoreOfficeFormatTask(item, selectedAnswer);
  }

  if (item.type === "powerpoint_design_task") {
    return scorePowerPointTask(item, selectedAnswer);
  }

  if (item.type === "teams_share_simulation") {
    return scoreTeamsTask(item, selectedAnswer);
  }

  if (item.type === "block_programming_task") {
    return scoreBlockTask(item, selectedAnswer);
  }

  if (item.type === "source_evaluation") {
    return scoreSourceEvaluationTask(item, selectedAnswer);
  }

  if (item.type === "social_action_simulation") {
    if (item.whutsuppTask) {
      return scoreWhutsuppTask(item, selectedAnswer);
    }
    return scoreInteractionTask(item.socialTask, selectedAnswer);
  }

  return scoreMultipleChoiceItem(item, selectedAnswer);
};

const answerIncludesOption = (selectedAnswer: SelectedAnswer, optionId: string) =>
  Array.isArray(selectedAnswer)
    ? selectedAnswer.includes(optionId)
    : selectedAnswer === optionId;

const responseTypeFor = (
  item: AssessmentItem,
  selectedAnswer: SelectedAnswer,
  scored: ReturnType<typeof scoreItem>,
  skipped: boolean,
): ResponseType | undefined => {
  if (skipped) {
    return "skipped";
  }
  if (item.type === "self_assessment") {
    return undefined;
  }
  if (
    item.type === "multiple_choice" &&
    item.unknownOptionId &&
    answerIncludesOption(selectedAnswer, item.unknownOptionId)
  ) {
    return "unknown";
  }
  return scored.isCorrect ? "correct" : "incorrect";
};

const appendOrReplaceResult = (results: Result[], nextResult: Result): Result[] => {
  const existingIndex = results.findIndex(
    (result) =>
      result.sectionId === nextResult.sectionId && result.itemId === nextResult.itemId,
  );
  if (existingIndex === -1) {
    return [...results, nextResult];
  }
  return results.map((result, index) => (index === existingIndex ? nextResult : result));
};

const assessmentGoalIds = (item: AssessmentItem) => {
  const source = `${item.primarySubgoal ?? ""},${item.subgoal ?? ""},${item.kerndoel}`;
  const matches = Array.from(source.matchAll(/\b(21[A-D]?|22[A-B]?|23[A-C]?)\b/g)).map(
    (match) => match[1],
  );
  const subgoals = Array.from(new Set(matches.filter((goalId) => goalId.length === 3)));
  const roots = Array.from(
    new Set([
      ...subgoals.map((goalId) => goalId.slice(0, 2)),
      ...matches.filter((goalId) => goalId.length === 2),
    ]),
  );

  return { roots, subgoals };
};

export const submitItemAnswer = ({
  session,
  section,
  item,
  selectedAnswer,
  shownOptionOrder,
  timeSpentMs,
}: {
  session: AssessmentSession;
  section: AssessmentSection;
  item: AssessmentItem;
  selectedAnswer: SelectedAnswer;
  shownOptionOrder: string[];
  timeSpentMs?: number;
}): AssessmentSession => {
  const currentPt1State = session.pt1States[item.id];
  const scored = scoreItem(item, selectedAnswer, currentPt1State);
  const timestamp = new Date().toISOString();
  const skipped = answerRecord(selectedAnswer).skipped === true;
  const responseType = responseTypeFor(item, selectedAnswer, scored, skipped);
  const selfAssessmentScore =
    item.type === "self_assessment" && typeof selectedAnswer === "number"
      ? Math.max(0, Math.min(100, Math.round(selectedAnswer)))
      : undefined;
  const finalState =
    skipped
      ? JSON.stringify({ skipped: true })
      : item.type === "file_task_simulation" && currentPt1State
      ? currentPt1State.nodes
          .map((node) => buildPath(currentPt1State.nodes, node.id))
          .sort()
          .join(" | ")
      : [
            "outlook_mail_simulation",
            "account_security_simulation",
            "excel_download_task",
            "office_format_download_task",
            "powerpoint_design_task",
            "teams_share_simulation",
            "block_programming_task",
            "source_evaluation",
            "social_action_simulation",
          ].includes(item.type)
        ? JSON.stringify(selectedAnswer)
      : undefined;
  const scoringSummary = (
    "scoringSummary" in scored
      ? scored.scoringSummary
      : undefined
  ) as WhutsuppScoringSummary | undefined;
  const nextResult: Result = {
    sessionId: session.id,
    versionId: session.versionId,
    sectionId: section.id,
    itemId: item.id,
    itemType: item.type,
    shownOptionOrder,
    selectedAnswer,
    finalState,
    isCorrect: scored.isCorrect,
    score: scored.score,
    maxScore: item.points,
    primarySubgoal: item.primarySubgoal ?? item.subgoal,
    itemVersion: item.itemVersion,
    learnerQuestionNumber: item.learnerQuestionNumber,
    internalSlot: item.internalSlot,
    taskResults: scored.taskResults,
    scoringSummary,
    responseType,
    skipped,
    timestamp,
    timeSpentMs,
    ankerItemFlag: item.ankerItemFlag ?? false,
    aiSnelVeranderendFlag: item.aiSnelVeranderendFlag ?? false,
  };
  const eventLog: EventLog = {
    sessionId: session.id,
    versionId: session.versionId,
    sectionId: section.id,
    itemId: item.id,
    timestamp,
    actionType: item.type === "file_task_simulation" ? "file-task-submit" : "answer",
    itemType: item.type,
    selectedAnswer,
    finalState,
    shownOptionOrder,
    isCorrect: scored.isCorrect,
    score: scored.score,
    maxScore: item.points,
    primarySubgoal: item.primarySubgoal ?? item.subgoal,
    itemVersion: item.itemVersion,
    learnerQuestionNumber: item.learnerQuestionNumber,
    internalSlot: item.internalSlot,
    taskResults: scored.taskResults,
    scoringSummary,
    responseType,
    skipped,
    timeSpentMs,
    ankerItemFlag: item.ankerItemFlag ?? false,
    aiSnelVeranderendFlag: item.aiSnelVeranderendFlag ?? false,
  };

  return {
    ...session,
    metadata:
      selfAssessmentScore === undefined
        ? session.metadata
        : {
            ...session.metadata,
            selfAssessmentScore,
          },
    results: appendOrReplaceResult(session.results, nextResult),
    eventLogs: [...session.eventLogs, eventLog],
    pt1States:
      item.type === "file_task_simulation" && currentPt1State
        ? {
            ...session.pt1States,
            [item.id]: {
              ...currentPt1State,
              completed: true,
              score: scored.score,
              taskResults: scored.taskResults,
            },
          }
        : session.pt1States,
  };
};

export const calculateResult = (
  session: AssessmentSession,
  assessment: AssessmentVersion,
): AssessmentResult => {
  const blockScores = assessment.sections
    .filter((section) => section.items.some((item) => item.points > 0))
    .map((section) => {
      const maxScore = section.items.reduce((sum, item) => sum + item.points, 0);
      const score = session.results
        .filter((result) => result.sectionId === section.id)
        .reduce((sum, result) => sum + result.score, 0);

      return {
        blockId: section.id,
        title: section.title,
        score,
        maxScore,
      };
    });

  const totalScore = blockScores.reduce((sum, block) => sum + block.score, 0);
  const maxScore = blockScores.reduce((sum, block) => sum + block.maxScore, 0);
  const domainMap = new Map<string, { score: number; maxScore: number }>();
  const goalMap = new Map<string, { score: number; maxScore: number; level: "kerndoel" | "subgoal" }>();

  assessment.sections.forEach((section) => {
    section.items
      .filter((item) => item.points > 0)
      .forEach((item) => {
        const key = `${item.kerndoel} - ${item.skillDomain}`;
        const current = domainMap.get(key) ?? { score: 0, maxScore: 0 };
        const itemResult = session.results.find(
          (result) => result.sectionId === section.id && result.itemId === item.id,
        );

        domainMap.set(key, {
          score: current.score + (itemResult?.score ?? 0),
          maxScore: current.maxScore + item.points,
        });

        const goals = assessmentGoalIds(item);
        [...goals.roots, ...goals.subgoals].forEach((goalId) => {
          const level = goalId.length === 2 ? "kerndoel" : "subgoal";
          const currentGoal = goalMap.get(goalId) ?? { score: 0, maxScore: 0, level };
          goalMap.set(goalId, {
            level,
            score: currentGoal.score + (itemResult?.score ?? 0),
            maxScore: currentGoal.maxScore + item.points,
          });
        });
      });
  });

  const goalOrder = ["21", "21A", "21B", "21C", "21D", "22", "22A", "22B", "23", "23A", "23B", "23C"];

  return {
    totalScore,
    maxScore,
    percentage: maxScore === 0 ? 0 : Math.round((totalScore / maxScore) * 100),
    blockScores,
    domainScores: Array.from(domainMap.entries()).map(([title, score]) => ({
      blockId: title,
      title,
      score: score.score,
      maxScore: score.maxScore,
    })),
    goalScores: goalOrder
      .filter((goalId) => goalMap.has(goalId))
      .map((goalId) => {
        const score = goalMap.get(goalId)!;
        return {
          goalId,
          label: sloLabels[goalId] ?? goalId,
          level: score.level,
          score: score.score,
          maxScore: score.maxScore,
          percentage: score.maxScore === 0 ? 0 : Math.round((score.score / score.maxScore) * 100),
        };
      }),
  };
};

export const getResultForStep = (
  session: AssessmentSession,
  step: StepDescriptor,
) =>
  session.results.find(
    (result) => result.sectionId === step.sectionId && result.itemId === step.itemId,
  ) ?? null;

export const getAnswerForStep = getResultForStep;
