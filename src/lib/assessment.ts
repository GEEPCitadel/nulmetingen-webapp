import { assessmentMap } from "../data/assessments";
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
  Result,
  SelectedAnswer,
  SessionMetadata,
  StepDescriptor,
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

export const getMappingCodes = (mapping: CodeMapping): string[] =>
  mapping.codes.map((code) => code.trim()).filter(Boolean);

const createPresentedOrders = (assessment: AssessmentVersion) => {
  const presentedOrders: Record<string, string[]> = {};

  assessment.sections.forEach((section) => {
    section.items.forEach((item) => {
      if (!item.options) {
        return;
      }

      const optionIds = item.options.map((option) => option.id);
      presentedOrders[resultKey(section.id, item.id)] =
        item.randomizeOptions === false ? optionIds : randomizeOptions(optionIds);
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
    if (field === "subject" || field === "priority") {
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
    correct: normalizeShortCode(answers[question.id]) === normalizeShortCode(question.answer),
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
      return state.computerSound === true;
    }
    if (condition === "mediaPlayerSelected") {
      return selectedWindow === item.teamsTask?.correctWindow;
    }
    if (condition === "notWholeScreen") {
      return selectedWindow !== "Hele scherm";
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

const scoreBlockTask = (item: AssessmentItem, selectedAnswer: SelectedAnswer) => {
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
    const correctIds = rule.correctOptionIds ?? [];
    const forbiddenIds = rule.forbiddenOptionIds ?? [];
    const forbiddenByGroupOk = Object.entries(rule.forbiddenByGroup ?? {}).every(
      ([groupId, ids]) =>
        ids.every((id) => !selectedIdsForGroup(state, groupId).includes(id)),
    );
    const correctCount = selectedIds.filter((id) => correctIds.includes(id)).length;
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
    const awardedPoints =
      rule.kind === "matchingPartial" && forbiddenByGroupOk
        ? correctMatchCount === matchEntries.length
          ? rule.points
          : correctMatchCount > 0
            ? rule.partialPoints ?? 0
            : 0
        : baseCorrect && forbiddenByGroupOk
          ? rule.points
          : 0;

    return {
      taskId: rule.id,
      description: rule.description,
      correct: awardedPoints === rule.points,
      points: awardedPoints,
    };
  });
  const score = taskResults.reduce((sum, result) => sum + result.points, 0);

  return {
    isCorrect: rules.length > 0 && taskResults.every((result) => result.correct),
    score,
    taskResults,
  };
};

export const scoreItem = (
  item: AssessmentItem,
  selectedAnswer: SelectedAnswer,
  state?: Pt1State,
) => {
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

  if (item.type === "social_action_simulation") {
    return scoreInteractionTask(item.socialTask, selectedAnswer);
  }

  const isCorrect = isSameAnswer(selectedAnswer, item.correctAnswer, item.scoreMode);
  return {
    isCorrect,
    score: isCorrect ? item.points : 0,
    taskResults: [],
  };
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
  const finalState =
    item.type === "file_task_simulation" && currentPt1State
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
            "social_action_simulation",
          ].includes(item.type)
        ? JSON.stringify(selectedAnswer)
      : undefined;
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
    timeSpentMs,
    ankerItemFlag: item.ankerItemFlag ?? false,
    aiSnelVeranderendFlag: item.aiSnelVeranderendFlag ?? false,
  };

  return {
    ...session,
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
      });
  });

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
