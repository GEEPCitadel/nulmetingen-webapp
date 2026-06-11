import type {
  AssessmentItem,
  AssessmentSection,
  AssessmentVersion,
  AssessmentVersionId,
  BlockProgrammingTaskConfig,
  CodeMapping,
  FileTaskRequirement,
  InteractionTaskConfig,
  MailTaskConfig,
  MeasurementMoment,
  MockupCard,
  Option,
  PowerPointTaskConfig,
  ProgrammingBlockDefinition,
  Pt1Node,
  Pt1Simulation,
  TeamsTaskConfig,
  ThemeDefinition,
  WhutsuppFlow,
  WhutsuppVariant,
} from "../types";
import selectedResponseSource from "../../nulmetingen_selected_response_herontwerp_v3.json";
import whutsuppPt8FlowSource from "./whutsupp_pt8_flow.json";

import { ADMIN_CODE, themes, sloLabels } from "./meta";
export { ADMIN_CODE, themes, sloLabels };

type VersionSpec = {
  id: AssessmentVersionId;
  title: string;
  level: string;
  themeKey: AssessmentVersion["themeKey"];
  pt1: FileTaskSpec;
  pt2: MailTaskSpec;
  pt3?: SecurityTaskSpec;
  pt4: ExcelTaskSpec;
  pt6: TeamsTaskSpec;
  pt7: BlockTaskSpec;
  pt8: SocialTaskSpec;
  pt9?: Pt9Spec;
  sr: SelectedResponseSpec[];
};

type Pt9Spec = {
  id: string;
  title: string;
  instruction: string;
  itemVersion?: string;
  config: PowerPointTaskConfig;
};

type FileTaskSpec = {
  id: string;
  title: string;
  instruction: string;
  startFolders: string[];
  startFiles: string[];
  tasks: FileTaskRequirement[];
  ankerItemFlag?: boolean;
};

type MailTaskSpec = {
  id: string;
  title: string;
  instruction: string;
  kerndoel: string;
  config: MailTaskConfig;
};

type SecurityTaskSpec = {
  id: string;
  title: string;
  instruction: string;
  kerndoel: string;
  config: InteractionTaskConfig;
};

type ExcelTaskSpec = {
  id: string;
  title: string;
  instruction: string;
  filename: string;
  sheetName: string;
  questions: Array<{ id: string; prompt: string; answer: string; points: number }>;
};

type TeamsTaskSpec = {
  id: string;
  title: string;
  instruction: string;
  kerndoel: string;
  config: TeamsTaskConfig;
  ankerItemFlag?: boolean;
};

type BlockTaskSpec = {
  id: string;
  title: string;
  intro: string;
  instruction: string;
  config: BlockProgrammingTaskConfig;
};

type SocialTaskSpec = {
  id: string;
  title: string;
  instruction: string;
  kerndoel: string;
  config?: InteractionTaskConfig;
  whutsuppVariant?: WhutsuppVariant;
  aiSnelVeranderendFlag?: boolean;
};

type SelectedResponseSpec = {
  id: string;
  title: string;
  kerndoel: string;
  subgoal?: string;
  primarySubgoal?: string;
  itemVersion?: string;
  learnerQuestionNumber?: number;
  internalSlot?: string;
  type?: "single" | "multiple";
  selectCount?: number | null;
  question: string;
  options?: SelectedResponseOptionSpec[];
  correct?: string | string[];
  harmful?: string[];
  harmfulSelectionMaxScore?: number;
  mockup?: MockupCard;
  compoundTask?: {
    itemVersion?: string;
    groups: Array<{
      id: string;
      title: string;
      question: string;
      options: SelectedResponseOptionSpec[];
      correctOptionId: string;
      points: number;
    }>;
  };
  renderOptionsAsSourceCards?: boolean;
  ankerItemFlag?: boolean;
  aiSnelVeranderendFlag?: boolean;
  anchorStatus?: string;
  sourceStatus?: string;
  pilotReviewStatus?: string;
  validityNote?: string;
};

type SelectedResponseOptionSpec = {
  id: string;
  label: string;
  description?: string;
  sourceType?: string;
  errorCategory?: string;
  isUnknown?: boolean;
};

type SelectedResponseJsonOption = {
  id?: string;
  optionId?: string;
  label?: string;
  sourceType?: string;
  text: string;
  correct?: boolean;
  isCorrect?: boolean;
  isUnknownOption?: boolean;
  unknown?: boolean;
  isHarmful?: boolean;
  score?: number;
  errorCategory?: string;
};

type SelectedResponseJsonSubQuestion = {
  id: string;
  title?: string;
  question: string;
  itemType?: "single-choice";
  selectionLimit?: number;
  options: SelectedResponseJsonOption[];
  correctAnswer?: string;
  scoring?: {
    maxPoints?: number;
    rule?: string;
    unknownScoresZero?: boolean;
    unknownExclusive?: boolean;
    scoreBy?: string;
  };
};

type SelectedResponseStimulus =
  | {
      kind: "browser-address-bar";
      address: string;
      label?: string;
    }
  | {
      kind: "email-link";
      message: string;
      address: string;
      label?: string;
    }
  | {
      kind: "email-message";
      fromName: string;
      fromEmail: string;
      toEmail: string;
      date: string;
      subject: string;
      body: string[];
      linkLabel?: string;
      linkUrl?: string;
      attachments?: string[];
    };

type SelectedResponseJsonItem = {
  id: string;
  replaces?: string;
  title: string;
  target?: AssessmentVersionId;
  targetGroup?: AssessmentVersionId;
  variantFor?: AssessmentVersionId;
  kerndoel?: number | string;
  subgoal: string;
  type?: "single" | "multiple" | "single_choice" | "multiple_choice";
  maxScore?: number;
  itemType?: "single-choice" | "multiple-select" | "compound-single-choice";
  selectCount?: number | null;
  selectionLimit?: number | null;
  question: string;
  stimulus?: SelectedResponseStimulus;
  context?: {
    chatMessage?: {
      sender: string;
      text: string;
    };
    chatMockup?: {
      toolName: string;
      messages: Array<{
        sender: "student" | "ai";
        label: string;
        text: string;
      }>;
    };
    feedMockup?: {
      appName: string;
      posts: Array<{
        author: string;
        text: string;
        meta?: string;
        sponsored?: boolean;
      }>;
    };
    caseCard?: {
      title: string;
      lines: string[];
    };
  };
  primarySubgoal?: string;
  itemVersion?: string;
  learnerQuestionNumber?: number;
  internalSlot?: string;
  archivedFrom?: string;
  subQuestions?: SelectedResponseJsonSubQuestion[];
  ui?: {
    renderAsSourceCards?: boolean;
    pinUnknownOptionLast?: boolean;
  };
  options?: SelectedResponseJsonOption[];
  correctAnswer?: string | string[];
  harmfulAnswers?: string[];
  scoring?: {
    harmfulCap?: string | number;
    method?: string;
    correctOptionId?: string;
    maxScore?: number;
    unknownScore?: number;
    scoreBy?: string;
    doNotScoreBy?: string[];
  };
  ankerItemFlag?: boolean;
  aiSnelVeranderendFlag?: boolean;
  anchorStatus?: string;
  sourceStatus?: string;
  pilotReviewStatus?: string;
  validityNote?: string;
};

type SelectedResponseJsonAssessment = {
  id: AssessmentVersionId;
  selectedResponseItems: SelectedResponseJsonItem[];
};

type SelectedResponseJson = {
  assessments?: SelectedResponseJsonAssessment[];
  selectedResponseItems?: SelectedResponseJsonItem[];
  archivedSelectedResponseItems?: SelectedResponseJsonItem[];
  parallelVariantItems?: Array<SelectedResponseJsonItem & { parallelTo?: string }>;
};

const UNKNOWN_OPTION_LABEL = "Ik weet het niet.";
const whutsuppPt8Flow = whutsuppPt8FlowSource as WhutsuppFlow;

const whutsuppVariantFor = (versionId: AssessmentVersionId): WhutsuppVariant => {
  const variant = whutsuppPt8Flow.variants.find(
    (candidate) => candidate.assessmentId === versionId,
  );
  if (!variant) {
    throw new Error(`Geen Whutsupp PT8-variant gevonden voor ${versionId}.`);
  }
  return variant;
};

const selectedResponseJson = selectedResponseSource as SelectedResponseJson;

const optionId = (prefix: string, index: number) => `${prefix}-${index + 1}`;

const makeOptions = (prefix: string, labels: string[]): Option[] =>
  labels.map((label, index) => ({ id: optionId(prefix, index), label }));

const makeSelectedResponseOptions = (options: SelectedResponseOptionSpec[]): Option[] =>
  options.map((option) => ({
    id: option.id,
    label: option.label,
    description: option.description,
    sourceType: option.sourceType,
    errorCategory: option.errorCategory,
  }));

const fixedOptions = (labels: string[]): Option[] =>
  labels.map((label) => ({ id: label, label }));

const correctId = (prefix: string, labels: string[], correctLabel: string) => {
  const index = labels.findIndex((label) => label === correctLabel);
  if (index === -1) {
    throw new Error(`Correct option not found for ${prefix}: ${correctLabel}`);
  }
  return optionId(prefix, index);
};

const normalizeUnknownLabel = (label: string) =>
  label.trim().replace(/\.$/, "").toLowerCase() ===
  UNKNOWN_OPTION_LABEL.replace(/\.$/, "").toLowerCase()
    ? UNKNOWN_OPTION_LABEL
    : label;

const subgoalCodeFrom = (value: string) =>
  value.match(/\b(21[A-D]?|22[A-B]?|23[A-C]?)\b/)?.[1] ?? value;

const rootGoalFrom = (value: string | number) =>
  String(value).match(/\b(21|22|23)\b/)?.[1] ?? String(value);

const isVariableSlotItem = (item: SelectedResponseJsonItem) =>
  item.anchorStatus === "variable" || item.anchorStatus === "variable-slot";

/**
 * Vervangt voor de voortgangsmeting elk variabel-slot-item door zijn
 * bankvariant uit `parallelVariantItems` (zelfde slot, `parallelTo` wijst
 * naar de actieve `itemVersion`). Ankeritems blijven ongewijzigd.
 */
const withParallelVariants = (
  versionId: AssessmentVersionId,
  items: SelectedResponseJsonItem[],
): SelectedResponseJsonItem[] => {
  const bank = selectedResponseJson.parallelVariantItems ?? [];
  return items.map((item) => {
    if (!isVariableSlotItem(item)) {
      return item;
    }
    const variant = bank.find(
      (candidate) =>
        (candidate.targetGroup ?? candidate.target ?? candidate.variantFor) === versionId &&
        candidate.parallelTo === item.itemVersion,
    );
    if (!variant) {
      throw new Error(
        `Geen bankvariant gevonden voor ${versionId} slot ${item.internalSlot ?? item.id} (parallelTo ${item.itemVersion}).`,
      );
    }
    return variant;
  });
};

const selectedResponseItemsFor = (
  versionId: AssessmentVersionId,
  moment: MeasurementMoment = "nulmeting",
): SelectedResponseJsonItem[] => {
  const activeItems = (() => {
    if (selectedResponseJson.selectedResponseItems) {
      return selectedResponseJson.selectedResponseItems.filter(
        (item) => (item.targetGroup ?? item.target ?? item.variantFor) === versionId,
      );
    }

    const sourceAssessment = selectedResponseJson.assessments?.find(
      (assessment) => assessment.id === versionId,
    );
    if (!sourceAssessment) {
      throw new Error(`Geen selected-response-set gevonden voor ${versionId}.`);
    }
    return sourceAssessment.selectedResponseItems;
  })();

  return moment === "voortgangsmeting"
    ? withParallelVariants(versionId, activeItems)
    : activeItems;
};

const correctAnswerIdsFor = (item: SelectedResponseJsonItem) =>
  new Set(
    (Array.isArray(item.correctAnswer)
      ? item.correctAnswer
      : item.correctAnswer
        ? [item.correctAnswer]
        : []
    ).map(String),
  );

const harmfulAnswerIdsFor = (item: SelectedResponseJsonItem) =>
  new Set((item.harmfulAnswers ?? []).map(String));

const selectedResponseTypeFor = (item: SelectedResponseJsonItem): "single" | "multiple" =>
  item.type === "multiple" || item.type === "multiple_choice" || item.itemType === "multiple-select"
    ? "multiple"
    : "single";

const mockupForStimulus = (stimulus?: SelectedResponseStimulus): MockupCard | undefined => {
  if (!stimulus) {
    return undefined;
  }

  if (stimulus.kind === "email-link") {
    return {
      badge: "E-mail",
      title: stimulus.label ?? "Bericht",
      subtitle: stimulus.message,
      content: [stimulus.address],
      mediaHint: "Niet-interactieve linkweergave",
    };
  }

  if (stimulus.kind === "email-message") {
    return {
      badge: "E-mail",
      title: stimulus.subject,
      subtitle: `Van: ${stimulus.fromName} <${stimulus.fromEmail}>`,
      meta: [`Aan: ${stimulus.toEmail}`, stimulus.date],
      content: [
        ...stimulus.body,
        ...(stimulus.attachments?.length
          ? [`Bijlage: ${stimulus.attachments.join(", ")}`]
          : []),
        ...(stimulus.linkLabel && stimulus.linkUrl
          ? [`${stimulus.linkLabel}: ${stimulus.linkUrl}`]
          : []),
      ],
      mediaHint: "Niet-interactieve e-mailmock-up",
    };
  }

  return {
    badge: "Adresbalk",
    title: stimulus.label ?? "Browser",
    content: [stimulus.address],
    mediaHint: "Niet-interactieve adresbalk",
  };
};

const mockupForContext = (context?: SelectedResponseJsonItem["context"]): MockupCard | undefined => {
  if (context?.chatMockup) {
    return {
      badge: "AI-chat",
      title: context.chatMockup.toolName,
      content: context.chatMockup.messages.map((message) => message.text),
      chatMessages: context.chatMockup.messages,
      mediaHint: "Niet-interactieve AI-chatmock-up",
    };
  }

  if (context?.feedMockup) {
    return {
      badge: "Feed",
      title: context.feedMockup.appName,
      content: context.feedMockup.posts.map((post) => post.text),
      feedPosts: context.feedMockup.posts,
      mediaHint: "Niet-interactieve feedmock-up",
    };
  }

  if (context?.caseCard) {
    return {
      badge: "Casus",
      title: context.caseCard.title,
      content: context.caseCard.lines,
      mediaHint: "Niet-interactieve casuskaart",
    };
  }

  if (!context?.chatMessage) {
    return undefined;
  }

  return {
    badge: "Groepsapp",
    title: context.chatMessage.sender,
    content: [context.chatMessage.text],
    mediaHint: "Contextbericht",
  };
};

const getSelectedResponseSpecs = (
  versionId: AssessmentVersionId,
  moment: MeasurementMoment = "nulmeting",
): SelectedResponseSpec[] => {
  const sourceItems = selectedResponseItemsFor(versionId, moment);

  if (sourceItems.length !== 13) {
    throw new Error(`${versionId} heeft niet precies 13 selected-response-items (10 SR + vraag 9 + mini-PT feed + mini-PT 23C).`);
  }

  return sourceItems.map((item) => {
    if (item.itemType === "compound-single-choice" && item.subQuestions?.length) {
      const compoundGroups = item.subQuestions.map((subQuestion) => {
        const correctAnswerId = String(
          subQuestion.correctAnswer ??
            subQuestion.options.find((option) => option.correct === true || option.isCorrect === true)?.id ??
            "",
        );
        const options = subQuestion.options.map((option) => ({
          id: String(option.optionId ?? option.id ?? option.text),
          label: normalizeUnknownLabel(option.label ?? option.text),
          errorCategory: option.errorCategory,
          description:
            option.label && normalizeUnknownLabel(option.label) !== normalizeUnknownLabel(option.text)
              ? option.text
              : undefined,
          sourceType: option.sourceType,
          isUnknown:
            option.isUnknownOption === true ||
            option.unknown === true ||
            normalizeUnknownLabel(option.label ?? option.text) === UNKNOWN_OPTION_LABEL,
        }));

        if (!correctAnswerId) {
          throw new Error(`Geen correct antwoord gevonden voor ${item.id}:${subQuestion.id}.`);
        }

        return {
          id: subQuestion.id,
          title: subQuestion.title ?? subQuestion.id,
          question: subQuestion.question,
          options,
          correctOptionId: correctAnswerId,
          points: Number(subQuestion.scoring?.maxPoints ?? 0.5),
        };
      });

      return {
        id: item.id,
        title: item.title,
        kerndoel: rootGoalFrom(item.kerndoel ?? item.primarySubgoal ?? item.subgoal),
        subgoal: subgoalCodeFrom(item.primarySubgoal ?? item.subgoal),
        primarySubgoal: item.primarySubgoal ?? subgoalCodeFrom(item.subgoal),
        itemVersion: item.itemVersion,
        learnerQuestionNumber: item.learnerQuestionNumber,
        internalSlot: item.internalSlot,
        question: item.question,
        mockup: mockupForContext(item.context),
        compoundTask: {
          itemVersion: item.itemVersion,
          groups: compoundGroups,
        },
        aiSnelVeranderendFlag: item.aiSnelVeranderendFlag,
        anchorStatus: item.anchorStatus,
        sourceStatus: item.sourceStatus,
        pilotReviewStatus: item.pilotReviewStatus,
        validityNote: item.validityNote,
      };
    }

    const correctAnswerIds = correctAnswerIdsFor(item);
    const harmfulAnswerIds = harmfulAnswerIdsFor(item);
    const responseType = selectedResponseTypeFor(item);
    const sourceOptions = item.options ?? [];
    const contentOptions = sourceOptions
      .filter((option) => {
        const label = normalizeUnknownLabel(option.label ?? option.text);
        return option.isUnknownOption !== true && option.unknown !== true && label !== UNKNOWN_OPTION_LABEL;
      })
      .map((option) => {
        const id = String(option.optionId ?? option.id ?? option.text);
        return {
          id,
          label: normalizeUnknownLabel(option.label ?? option.text),
          description:
            option.label && normalizeUnknownLabel(option.label) !== normalizeUnknownLabel(option.text)
              ? option.text
              : undefined,
          sourceType: option.sourceType,
          errorCategory: option.errorCategory,
          correct:
            option.correct === true ||
            option.isCorrect === true ||
            option.score === 1 ||
            correctAnswerIds.has(id) ||
            item.scoring?.correctOptionId === id,
          harmful: option.isHarmful === true || harmfulAnswerIds.has(id),
        };
      });
    const unknownSource = sourceOptions.find((option) => {
      const label = normalizeUnknownLabel(option.label ?? option.text);
      return option.isUnknownOption === true || option.unknown === true || label === UNKNOWN_OPTION_LABEL;
    });
    const unknownOption: SelectedResponseOptionSpec = {
      id: String(unknownSource?.optionId ?? unknownSource?.id ?? `${item.id}-unknown`),
      label: UNKNOWN_OPTION_LABEL,
      description:
        unknownSource?.text && normalizeUnknownLabel(unknownSource.text) !== UNKNOWN_OPTION_LABEL
          ? unknownSource.text
          : undefined,
      sourceType: unknownSource?.sourceType,
      isUnknown: true,
    };
    const options: SelectedResponseOptionSpec[] = [
      ...contentOptions.map((option) => ({
        id: option.id,
        label: option.label,
        description: option.description,
        sourceType: option.sourceType,
        errorCategory: option.errorCategory,
      })),
      unknownOption,
    ];
    const correctOptions = contentOptions
      .filter((option) => option.correct)
      .map((option) => option.id);
    const harmfulOptions = contentOptions
      .filter((option) => option.harmful)
      .map((option) => option.id);

    if (correctOptions.length === 0) {
      throw new Error(`Geen correct antwoord gevonden voor ${item.id}.`);
    }

    return {
      id: item.id,
      title: item.title,
      kerndoel: rootGoalFrom(item.kerndoel ?? item.subgoal),
      subgoal: subgoalCodeFrom(item.subgoal),
      primarySubgoal: item.primarySubgoal,
      itemVersion: item.itemVersion,
      learnerQuestionNumber: item.learnerQuestionNumber,
      internalSlot: item.internalSlot,
      type: responseType,
      selectCount:
        responseType === "multiple"
          ? (item.selectCount ?? item.selectionLimit ?? correctOptions.length)
          : null,
      question: item.question,
      options,
      correct: responseType === "multiple" ? correctOptions : correctOptions[0],
      harmful: harmfulOptions,
      harmfulSelectionMaxScore:
        item.scoring?.harmfulCap === undefined ? undefined : Number(item.scoring.harmfulCap),
      mockup: mockupForStimulus(item.stimulus) ?? mockupForContext(item.context),
      renderOptionsAsSourceCards: item.ui?.renderAsSourceCards,
      ankerItemFlag: item.ankerItemFlag ?? item.anchorStatus === "concept-anchor",
      aiSnelVeranderendFlag: item.aiSnelVeranderendFlag,
      anchorStatus: item.anchorStatus,
      sourceStatus: item.sourceStatus,
      pilotReviewStatus: item.pilotReviewStatus,
      validityNote: item.validityNote,
    };
  });
};

const createSimulation = (folders: string[], files: string[]): Pt1Simulation => {
  const nodes: Pt1Node[] = [];
  const pathToId = new Map<string, string>();

  const addFolder = (path: string) => {
    const parts = path.split("/");
    let currentPath = "";
    let parentId: string | null = null;

    parts.forEach((part) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      if (!pathToId.has(currentPath)) {
        const id = currentPath === "Thuis" ? "root" : `node-${pathToId.size}`;
        pathToId.set(currentPath, id);
        nodes.push({ id, name: part, type: "folder", parentId });
      }
      parentId = pathToId.get(currentPath) ?? null;
    });
  };

  const addFile = (path: string) => {
    const parts = path.split("/");
    const name = parts.pop();
    if (!name) {
      return;
    }
    const parentPath = parts.join("/");
    addFolder(parentPath);
    nodes.push({
      id: `node-${pathToId.size}-${nodes.length}`,
      name,
      type: "file",
      parentId: pathToId.get(parentPath) ?? null,
    });
  };

  addFolder("Thuis");
  ["Thuis/Bureaublad", "Thuis/Downloads", "Thuis/Documenten", "Thuis/Afbeeldingen", "Thuis/OneDrive"].forEach(addFolder);
  folders.forEach(addFolder);
  files.forEach(addFile);

  return { rootId: "root", nodes };
};

const selfAssessmentItem = (): AssessmentItem => ({
  id: "self-assessment",
  type: "self_assessment",
  title: "Zelfinschatting",
  instruction:
    "Hoe digitaal geletterd schat je jezelf in?\nSchuif het bolletje naar jouw keuze.\n0 betekent: ik schat mezelf helemaal niet digitaal geletterd in.\n100 betekent: ik schat mezelf heel digitaal geletterd in.",
  points: 0,
  skillDomain: "Zelfinschatting",
  kerndoel: "niet-scorend",
  selfAssessmentScale: [
    { value: 0, label: "helemaal niet digitaal geletterd" },
    { value: 100, label: "heel digitaal geletterd" },
  ],
});

const fileTaskItem = (spec: FileTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "file_task_simulation",
  title: spec.title,
  instruction: spec.instruction,
  points: spec.tasks.reduce((sum, task) => sum + task.points, 0),
  skillDomain: "21A Digitale systemen",
  kerndoel: "21A",
  ankerItemFlag: spec.ankerItemFlag,
  fileTask: {
    simulation: createSimulation(spec.startFolders, spec.startFiles),
    tasks: spec.tasks,
  },
  correctState: {
    requiredPaths: spec.tasks,
  },
});

const mailTaskItem = (spec: MailTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "outlook_mail_simulation",
  title: spec.title,
  instruction: spec.instruction,
  points: spec.config.rules.reduce((sum, rule) => sum + rule.points, 0),
  skillDomain: "21A Digitale systemen / 23B Digitaal burgerschap",
  kerndoel: spec.kerndoel,
  mailTask: spec.config,
});

const securityTaskItem = (spec: SecurityTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "account_security_simulation",
  title: spec.title,
  instruction: spec.instruction,
  points: 3,
  skillDomain: "23A Veiligheid en privacy",
  kerndoel: spec.kerndoel,
  securityTask: spec.config,
});

const excelTaskItem = (spec: ExcelTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "excel_download_task",
  title: spec.title,
  instruction: spec.instruction,
  points: spec.questions.reduce((sum, question) => sum + question.points, 0),
  skillDomain: "21C Data",
  kerndoel: "21C, 21A",
  excelTask: {
    filename: spec.filename,
    sheetName: spec.sheetName,
    questions: spec.questions,
  },
});

const teamsTaskItem = (spec: TeamsTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "teams_share_simulation",
  title: spec.title,
  instruction: spec.instruction,
  points: spec.config.rules.reduce((sum, rule) => sum + rule.points, 0),
  skillDomain: "21A Digitale systemen / 23B Digitaal burgerschap",
  kerndoel: spec.kerndoel,
  ankerItemFlag: spec.ankerItemFlag,
  teamsTask: spec.config,
});

const blockTaskItem = (spec: BlockTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "block_programming_task",
  title: spec.title,
  instruction: spec.instruction,
  points: 4,
  skillDomain: "22B Programmeren",
  kerndoel: "22B",
  blockTask: {
    ...spec.config,
    intro: spec.intro,
  },
});

const powerPointTaskItem = (spec: Pt9Spec): AssessmentItem => ({
  id: spec.id,
  type: "powerpoint_design_task",
  title: spec.title,
  instruction: spec.instruction,
  points: spec.config.rules.reduce((sum, rule) => sum + rule.points, 0),
  skillDomain: `22A ${sloLabels["22A"] ?? ""}`.trim(),
  kerndoel: "22A",
  subgoal: "22A",
  itemVersion: spec.itemVersion,
  ankerItemFlag: true,
  powerPointTask: spec.config,
});

const socialTaskItem = (spec: SocialTaskSpec): AssessmentItem => ({
  id: spec.whutsuppVariant ? whutsuppPt8Flow.taskId : spec.id,
  type: "social_action_simulation",
  title: spec.whutsuppVariant ? whutsuppPt8Flow.title : spec.title,
  instruction: spec.whutsuppVariant?.introText ?? spec.instruction,
  points: 4,
  skillDomain: "23B Digitaal burgerschap",
  kerndoel: spec.whutsuppVariant ? "23B" : spec.kerndoel,
  subgoal: spec.whutsuppVariant ? whutsuppPt8Flow.subgoal : undefined,
  aiSnelVeranderendFlag: spec.aiSnelVeranderendFlag,
  socialTask: spec.config,
  whutsuppTask: spec.whutsuppVariant,
});

const selectedResponseItem = (spec: SelectedResponseSpec): AssessmentItem => {
  const subgoal = spec.subgoal ?? subgoalCodeFrom(spec.kerndoel);
  const responseType = spec.type ?? "single";

  if (spec.compoundTask) {
    return {
      id: spec.id,
      type: "social_action_simulation",
      title: spec.title,
      instruction: spec.question,
      points: spec.compoundTask.groups.reduce((sum, group) => sum + group.points, 0),
      skillDomain: `${subgoal} ${sloLabels[subgoal] ?? ""}`.trim(),
      kerndoel: spec.kerndoel,
      subgoal,
      primarySubgoal: spec.primarySubgoal ?? subgoal,
      itemVersion: spec.itemVersion,
      learnerQuestionNumber: spec.learnerQuestionNumber,
      internalSlot: spec.internalSlot,
      mockup: spec.mockup,
      socialTask: {
        screens: [
          {
            id: spec.id,
            title: spec.title,
            instruction: spec.question,
            body: spec.mockup?.content.join("\n\n"),
            groups: spec.compoundTask.groups.map((group) => ({
              id: group.id,
              title: group.title,
              instruction: group.question,
              inputType: "single",
              options: group.options.map((option) => ({
                ...option,
                unknown: option.isUnknown,
                exclusive: option.isUnknown,
                errorCategory: option.errorCategory,
              })),
            })),
          },
        ],
        rules: spec.compoundTask.groups.map((group) => ({
          id: group.id,
          description: group.question,
          points: group.points,
          groupId: group.id,
          kind: "singleCorrect",
          correctOptionIds: [group.correctOptionId],
        })),
      },
      aiSnelVeranderendFlag: spec.aiSnelVeranderendFlag,
      anchorStatus: spec.anchorStatus,
      sourceStatus: spec.sourceStatus,
      pilotReviewStatus: spec.pilotReviewStatus,
      validityNote: spec.validityNote,
      developerNotes: [
        spec.compoundTask.itemVersion ? `itemVersion: ${spec.compoundTask.itemVersion}` : "",
        spec.learnerQuestionNumber ? `learnerQuestionNumber: ${spec.learnerQuestionNumber}` : "",
        spec.internalSlot ? `internalSlot: ${spec.internalSlot}` : "",
        spec.primarySubgoal ? `primarySubgoal: ${spec.primarySubgoal}` : "",
        spec.anchorStatus ? `anchorStatus: ${spec.anchorStatus}` : "",
        spec.sourceStatus ? `sourceStatus: ${spec.sourceStatus}` : "",
        spec.pilotReviewStatus ? `pilotReviewStatus: ${spec.pilotReviewStatus}` : "",
        spec.validityNote ? `validityNote: ${spec.validityNote}` : "",
      ].filter(Boolean),
    };
  }

  return {
    id: spec.id,
    type: "multiple_choice",
    title: spec.title,
    instruction: spec.question,
    options: makeSelectedResponseOptions(spec.options ?? []),
    correctAnswer: Array.isArray(spec.correct)
      ? spec.correct
      : spec.correct,
    points: 1,
    skillDomain: `${subgoal} ${sloLabels[subgoal] ?? ""}`.trim(),
    kerndoel: spec.kerndoel,
    subgoal,
    primarySubgoal: spec.primarySubgoal,
    itemVersion: spec.itemVersion,
    learnerQuestionNumber: spec.learnerQuestionNumber,
    internalSlot: spec.internalSlot,
    allowUnknown: false,
    unknownOptionId: spec.options?.find((option) => option.isUnknown)?.id,
    randomizeOptions: true,
    renderOptionsAsSourceCards: spec.renderOptionsAsSourceCards,
    selectionMode: responseType === "multiple" ? "multiple" : "single",
    selectCount: responseType === "multiple" ? (spec.selectCount ?? undefined) : undefined,
    scoreMode: responseType === "multiple" ? "partial_select" : "exact",
    harmfulOptionIds: spec.harmful ?? [],
    harmfulSelectionMaxScore: spec.harmfulSelectionMaxScore,
    mockup: spec.mockup,
    ankerItemFlag: spec.ankerItemFlag,
    aiSnelVeranderendFlag: spec.aiSnelVeranderendFlag,
    anchorStatus: spec.anchorStatus,
    sourceStatus: spec.sourceStatus,
    pilotReviewStatus: spec.pilotReviewStatus,
    validityNote: spec.validityNote,
    developerNotes: [
      spec.anchorStatus ? `anchorStatus: ${spec.anchorStatus}` : "",
      spec.sourceStatus ? `sourceStatus: ${spec.sourceStatus}` : "",
      spec.pilotReviewStatus ? `pilotReviewStatus: ${spec.pilotReviewStatus}` : "",
      spec.validityNote ? `validityNote: ${spec.validityNote}` : "",
    ].filter(Boolean),
  };
};

const makeSections = (
  spec: VersionSpec,
  moment: MeasurementMoment = "nulmeting",
): AssessmentSection[] => [
  {
    id: "zelfinschatting",
    title: "Zelfinschatting",
    items: [selfAssessmentItem()],
  },
  {
    id: "pt1",
    title: "PT1 - Bestanden en mappen",
    items: [fileTaskItem(spec.pt1)],
  },
  {
    id: "pt2",
    title: "PT2 - Mail opstellen",
    items: [mailTaskItem(spec.pt2)],
  },
  ...(spec.pt3
    ? [
        {
          id: "pt3",
          title: "PT3 - Account, apparaat en verbinding beveiligen",
          items: [securityTaskItem(spec.pt3)],
        },
      ]
    : []),
  {
    id: "pt4",
    title: "PT4 - Excel/data sorteren en filteren",
    items: [excelTaskItem(spec.pt4)],
  },
  {
    id: "pt6",
    title: "PT6 - Videovergadering en schermdelen",
    items: [teamsTaskItem(spec.pt6)],
  },
  {
    id: "pt7",
    title: "PT7 - Blokprogrammeren",
    items: [blockTaskItem(spec.pt7)],
  },
  {
    id: "pt8",
    title: "PT8 - Online gedrag",
    items: [socialTaskItem({ ...spec.pt8, whutsuppVariant: whutsuppVariantFor(spec.id) })],
  },
  ...(spec.pt9
    ? [
        {
          id: "pt9",
          title: "PT9 - Digitaal product maken",
          items: [powerPointTaskItem(spec.pt9)],
        },
      ]
    : []),
  {
    id: "sr",
    title: "Meerkeuze",
    instruction: "Kies steeds het beste antwoord.",
    items: getSelectedResponseSpecs(spec.id, moment).map(selectedResponseItem),
  },
];

const buildAssessment = (
  spec: VersionSpec,
  moment: MeasurementMoment = "nulmeting",
): AssessmentVersion => {
  const sections = makeSections(spec, moment);
  const maxScore = sections.reduce(
    (sectionSum, section) =>
      sectionSum + section.items.reduce((itemSum, item) => itemSum + item.points, 0),
    0,
  );

  return {
    id: spec.id,
    title: spec.title,
    level: spec.level,
    maxScore,
    durationMinutes: 30,
    themeKey: spec.themeKey,
    sections,
  };
};

const shareRules = (): TeamsTaskConfig["rules"] => [
  {
    id: "share-opened",
    description: "op Delen geklikt.",
    points: 1,
    conditions: ["clicked_share"],
  },
  {
    id: "window-opened",
    description: "na Delen voor Venster gekozen.",
    points: 1,
    conditions: ["clicked_window"],
  },
  {
    id: "media-window-selected",
    description: "videospeler met filmfragment in de juiste volgorde geselecteerd.",
    points: 1,
    conditions: ["selected_windows_media_player"],
  },
];

const blockColors = {
  gebeurtenissen: "#ffb22e",
  uiterlijk: "#8f5acb",
  beweging: "#55a9dc",
  besturing: "#f47b32",
  variabelen: "#f2a23a",
  voorwaarden: "#e36f3f",
  logica: "#3d8fdb",
  invoer: "#2eb8a6",
  waarnemen: "#2eb8a6",
  geluid: "#cf63c7",
  data: "#3f8edb",
};

const block = (
  label: string,
  category: keyof typeof blockColors,
  options: Pick<ProgrammingBlockDefinition, "isContainer" | "isCriticalDistractor"> = {},
): ProgrammingBlockDefinition => ({
  label,
  category,
  color: blockColors[category],
  ...options,
});

const debugBlock = (
  id: string,
  label: string,
  category: keyof typeof blockColors,
  options: Pick<ProgrammingBlockDefinition, "isContainer" | "isCriticalDistractor"> & {
    correctReplacementId?: string;
  } = {},
): ProgrammingBlockDefinition & { correctReplacementId?: string } => ({
  id,
  label,
  category,
  color: blockColors[category],
  ...options,
});

const mailButtons = [
  "Verzenden",
  "BCC tonen",
  "Bestand bijvoegen",
  "Hyperlink invoegen",
  "Prioriteit",
  "Concept opslaan",
  "Verwijderen",
];

const reportMailInstruction =
  "Je moet een verslag voor Nederlands naar je mentor sturen. Stel hieronder een e-mail op. Let op de volgende punten:\n- Zet het juiste mailadres op de juiste plek.\n- Gebruik als onderwerp: 'Verslag Nederlands'.\n- Voeg het juiste bestand toe aan de mail.\n- Als je mail klaar is, klik op 'Verzenden'.";

const createReportMailConfig = (): MailTaskConfig => ({
  visibleButtons: mailButtons,
  contacts: [
    "mentor@school.nl",
    "vriend@school.nl",
    "klasgroep@school.nl",
    "administratie@school.nl",
  ],
  files: [
    "Verslag_Nederlands.docx",
    "Foto_vakantie.jpg",
    "Rooster.pdf",
    "Muziek.mp3",
  ],
  rules: [
    {
      id: "to-mentor",
      description: "juiste mailadres staat in Aan.",
      points: 1,
      conditions: [{ field: "to", operator: "includes", value: "mentor@school.nl" }],
    },
    {
      id: "subject",
      description: "onderwerp is exact Verslag Nederlands.",
      points: 1,
      conditions: [{ field: "subject", operator: "equals", value: "Verslag Nederlands" }],
    },
    {
      id: "attachment",
      description: "juiste bestand is toegevoegd.",
      points: 1,
      conditions: [
        { field: "attachments", operator: "includes", value: "Verslag_Nederlands.docx" },
      ],
    },
    {
      id: "sent",
      description: "mail is verzonden.",
      points: 1,
      conditions: [{ field: "sent", operator: "true" }],
    },
  ],
});

const advancedMailInstruction =
  "Je werkt met twee klasgenoten aan een onderzoeksverslag. Stel hieronder een e-mail op. Let op de volgende punten:\n- Stuur de mail aan je mentor.\n- Zet je projectgroep in CC.\n- Gebruik als onderwerp: 'Onderzoeksverslag mediawijsheid'.\n- Voeg het juiste verslag toe en klik op 'Verzenden'.";

const createAdvancedMailConfig = (): MailTaskConfig => ({
  visibleButtons: mailButtons,
  contacts: [
    "mentor@school.nl",
    "projectgroep@school.nl",
    "klasgroep@school.nl",
    "administratie@school.nl",
  ],
  files: [
    "Onderzoeksverslag_mediawijsheid.docx",
    "Bronnenlijst.xlsx",
    "Foto_vakantie.jpg",
    "Rooster.pdf",
  ],
  rules: [
    {
      id: "to-mentor",
      description: "juiste mailadres staat in Aan.",
      points: 1,
      conditions: [{ field: "to", operator: "includes", value: "mentor@school.nl" }],
    },
    {
      id: "cc-projectgroup",
      description: "projectgroep staat in CC.",
      points: 1,
      conditions: [{ field: "cc", operator: "includes", value: "projectgroep@school.nl" }],
    },
    {
      id: "subject",
      description: "onderwerp is exact Onderzoeksverslag mediawijsheid.",
      points: 1,
      conditions: [
        { field: "subject", operator: "equals", value: "Onderzoeksverslag mediawijsheid" },
      ],
    },
    {
      id: "attachment-and-sent",
      description: "juiste bestand is toegevoegd en mail is verzonden.",
      points: 1,
      conditions: [
        {
          field: "attachments",
          operator: "includes",
          value: "Onderzoeksverslag_mediawijsheid.docx",
        },
        { field: "sent", operator: "true" },
      ],
    },
  ],
});

const fakeTeamsInstruction =
  "Voer in Macrohard Teams het juiste klikpad uit: klik op Delen, kies Venster en selecteer Videospeler - filmfragment.";

const excelInstruction = (filename: string) =>
  `Download ${filename}. Open het in Excel. Klik op Bewerken inschakelen als Excel daarom vraagt.`;

const createFakeTeamsConfig = (): TeamsTaskConfig => ({
  scenario:
    "Deel alleen het venster met het filmfragment. Gebruik computergeluid, maar deel niet je hele scherm.",
  buttons: ["Camera", "Microfoon", "Chat", "Deelnemers", "Reageren", "Delen", "Meer"],
  shareOptions: ["Scherm", "Venster"],
  windows: [
    "Videospeler - filmfragment",
    "Browser - schoolsite",
    "Word - Verslag Nederlands",
    "Excel - Cijferlijst",
    "Chat - klasgroep",
  ],
  correctWindow: "Videospeler - filmfragment",
  rules: shareRules(),
});

const versionSpecs: VersionSpec[] = [
  {
    id: "lj1-vmbo",
    title: "Leerjaar 1 VMBO",
    level: "LJ1 VMBO",
    themeKey: "limeTeal",
    pt1: {
      id: "lj1v-pt1-files",
      title: "PT1 - Bestanden en mappen",
      instruction:
        "Gebruik de Verkenner hieronder.\nMaak alle opdrachten in de linkerkolom.\nLet goed op de bestandsnamen.\nKlik daarna op Volgende.",
      startFolders: [
        "Thuis/OneDrive",
        "Thuis/Downloads",
        "Thuis/Documenten",
        "Thuis/Afbeeldingen",
      ],
      startFiles: [
        "Thuis/OneDrive/Verslag_Nederlands.docx",
        "Thuis/OneDrive/Presentatie_v1.pptx",
        "Thuis/OneDrive/Foto_project.jpg",
        "Thuis/Downloads/Installatiebestand.exe",
        "Thuis/Documenten/Aantekeningen.docx",
      ],
      ankerItemFlag: true,
      tasks: [
        {
          id: "lj1v-pt1-schoolwerk",
          description: "Maak in OneDrive de map Schoolwerk.",
          expectedPath: "Thuis/OneDrive/Schoolwerk",
          points: 1,
        },
        {
          id: "lj1v-pt1-presentatie",
          description: "Hernoem Presentatie_v1.pptx naar Presentatie_OUD.pptx.",
          expectedPath: "Thuis/OneDrive/Presentatie_OUD.pptx",
          forbiddenPaths: ["Thuis/OneDrive/Presentatie_v1.pptx"],
          points: 1,
        },
        {
          id: "lj1v-pt1-verslag",
          description: "Verplaats Verslag_Nederlands.docx naar Schoolwerk.",
          expectedPath: "Thuis/OneDrive/Schoolwerk/Verslag_Nederlands.docx",
          points: 1,
        },
      ],
    },
    pt2: {
      id: "lj1v-pt2-mail",
      title: "Mail opstellen",
      instruction: reportMailInstruction,
      kerndoel: "21A, 23B",
      config: createReportMailConfig(),
    },
    pt4: {
      id: "lj1v-pt4-excel",
      title: "PT4 - Excel/data sorteren en filteren",
      instruction: excelInstruction("LJ1_VMBO_Liedjes.xlsx"),
      filename: "LJ1_VMBO_Liedjes.xlsx",
      sheetName: "Liedjes",
      questions: [
        {
          id: "a",
          prompt: "Sorteer op Jaar, van nieuw naar oud. Welke code staat bovenaan?",
          answer: "L09",
          points: 1,
        },
        {
          id: "b",
          prompt:
            "Filter op Genre = pop. Sorteer daarna op Jaar, van oud naar nieuw. Welke code staat bovenaan?",
          answer: "L12",
          points: 1,
        },
      ],
    },
    pt6: {
      id: "lj1v-pt6-meeting",
      title: "PT6 - Videovergadering en schermdelen",
      instruction: fakeTeamsInstruction,
      kerndoel: "21A, 23B",
      ankerItemFlag: true,
      config: createFakeTeamsConfig(),
    },
    pt7: {
      id: "lj1v-pt7-programming",
      title: "PT7 - Blokprogrammeren",
      intro:
        "Dit is Bizzy, een robot die kan bewegen, draaien en praten. Programmeer Bizzy door blokken op het werkvlak te slepen. Klik op ▶ om je programma uit te voeren.",
      instruction:
        "Maak een programma dat dit doet: na klikken op Afspelen zegt Bizzy Hoi!, gaat hij 1 meter vooruit en draait hij naar 180 graden.",
      config: {
        device: "bizzy",
        codingSteps: [
          "Gebruik het startblok Wanneer er geklikt wordt op afspelen.",
          "Laat Bizzy Hoi! zeggen.",
          "Laat Bizzy 1 meter vooruit bewegen.",
          "Laat Bizzy naar 180 graden draaien.",
        ],
        blocks: [
          block("Wanneer er geklikt wordt op afspelen", "gebeurtenissen"),
          block("wanneer er op Bizzy wordt geklikt", "gebeurtenissen"),
          block("verander animatie van Bizzy naar niet animeren", "uiterlijk"),
          block('Bizzy zegt "Hoi!"', "uiterlijk"),
          block("verplaats Bizzy 1 meter vooruit in 1 sec.", "beweging"),
          block("draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.", "beweging"),
          block("als 1 < 2", "besturing", { isCriticalDistractor: true }),
          block("speel geluid applaus", "geluid"),
          block("wacht 1 seconde", "besturing"),
          block("zet score op 0", "variabelen"),
          block("verplaats Bizzy 5 meters achteruit in 1 sec.", "beweging", {
            isCriticalDistractor: true,
          }),
        ],
        correctProgram: [
          "Wanneer er geklikt wordt op afspelen",
          'Bizzy zegt "Hoi!"',
          "verplaats Bizzy 1 meter vooruit in 1 sec.",
          "draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.",
        ],
        rules: [
          {
            id: "start",
            description: "juiste startblok.",
            points: 1,
            firstBlock: "Wanneer er geklikt wordt op afspelen",
          },
          {
            id: "say",
            description: 'Bizzy zegt "Hoi!" gebruikt.',
            points: 1,
            requiredBlocks: ['Bizzy zegt "Hoi!"'],
          },
          {
            id: "move",
            description: "verplaats Bizzy 1 meter vooruit in 1 sec. gebruikt.",
            points: 1,
            requiredBlocks: ["verplaats Bizzy 1 meter vooruit in 1 sec."],
          },
          {
            id: "behavior",
            description:
              "eindgedrag klopt en er zijn geen kritieke afleider-blokken gebruikt.",
            points: 1,
            requireExecuted: true,
            requiredBlocks: [
              'Bizzy zegt "Hoi!"',
              "verplaats Bizzy 1 meter vooruit in 1 sec.",
              "draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.",
            ],
            forbiddenBlocks: ["als 1 < 2", "verplaats Bizzy 5 meters achteruit in 1 sec."],
          },
        ],
      },
    },
    pt8: {
      id: "lj1v-pt8-online",
      title: "PT8 - Online gedrag: delen en pesten",
      instruction:
        "Maak beide schermen af.\nScherm 1: kies wie de informatie mag zien.\nScherm 2: kies twee veilige acties.",
      kerndoel: "23A, 23B",
      config: {
        screens: [
          {
            id: "sharing",
            title: "Scherm 1 - Deelinstellingen",
            instruction: "Kies bij elk kaartje de veiligste deelinstelling.",
            groups: [
              {
                id: "shareSettings",
                title: "Kies per kaartje",
                inputType: "matching",
                cards: fixedOptions([
                  "Wachtwoord voor Magister",
                  "Groepsplanning voor project",
                  "Poster voor de openbare open dag",
                ]),
                options: fixedOptions([
                  "Niet delen",
                  "Alleen mentor",
                  "Alleen projectgroep",
                  "Hele klas",
                  "Openbaar",
                ]),
              },
            ],
          },
          {
            id: "classchat",
            title: "Scherm 2 - Whutsupp foto",
            instruction:
              'In Whutsupp wil iemand een foto van drie klasgenoten in de klassenapp zetten. Een klasgenoot schrijft: "Wacht, ik wil eerst weten welke foto dit is." Kies twee acties die jij zou doen.',
            body:
              "Toestemming vragen betekent dat iedereen die herkenbaar op de foto staat akkoord is voordat de foto wordt gedeeld.",
            groups: [
              {
                id: "actions",
                title: "Kies twee acties die jij zou doen.",
                inputType: "multi",
                options: fixedOptions([
                  "Doorsturen",
                  "De foto bewerken en daarna delen",
                  "Vragen of iedereen op de foto het goed vindt",
                  "Niet plaatsen zolang niet iedereen akkoord is",
                  "De foto verwijderen als iemand geen toestemming geeft",
                  "Alleen de namen weglaten",
                ]),
              },
            ],
          },
        ],
        rules: [
          {
            id: "share-settings",
            description: "deelinstellingen correct.",
            points: 2,
            partialPoints: 1,
            groupId: "shareSettings",
            kind: "matchingPartial",
            correctMatches: {
              "Wachtwoord voor Magister": "Niet delen",
              "Groepsplanning voor project": "Alleen projectgroep",
              "Poster voor de openbare open dag": "Openbaar",
            },
          },
          {
            id: "classchat-actions",
            description: "minstens twee toestemmingsacties en geen schadelijke deelactie.",
            points: 1,
            groupId: "actions",
            kind: "minCorrect",
            minCorrect: 2,
            correctOptionIds: [
              "Vragen of iedereen op de foto het goed vindt",
              "Niet plaatsen zolang niet iedereen akkoord is",
              "De foto verwijderen als iemand geen toestemming geeft",
            ],
            forbiddenByGroup: {
              actions: [
                "Doorsturen",
                "De foto bewerken en daarna delen",
                "Alleen de namen weglaten",
              ],
            },
          },
        ],
      },
    },
    sr: [],
  },
  {
    id: "lj1-hv",
    title: "Leerjaar 1 HAVO/VWO",
    level: "LJ1 HAVO/VWO",
    themeKey: "skyOrange",
    pt1: {
      id: "lj1h-pt1-files",
      title: "PT1 - Bestanden en mappen",
      instruction:
        "Gebruik de Verkenner hieronder.\nMaak alle opdrachten in de linkerkolom.\nLet goed op de bestandsnamen.\nKlik daarna op Volgende.",
      startFolders: [
        "Thuis/OneDrive",
        "Thuis/Downloads",
        "Thuis/Documenten",
        "Thuis/Afbeeldingen",
      ],
      startFiles: [
        "Thuis/OneDrive/Boekverslag_Nederlands.docx",
        "Thuis/OneDrive/Presentatie_Biologie_v1.pptx",
        "Thuis/OneDrive/Diagram_Biologie.png",
        "Thuis/OneDrive/Rooster.pdf",
        "Thuis/Documenten/Aantekeningen.docx",
      ],
      ankerItemFlag: true,
      tasks: [
        {
          id: "lj1h-pt1-schoolwerk",
          description: "Maak de map Schoolwerk.",
          expectedPath: "Thuis/OneDrive/Schoolwerk",
          points: 1,
        },
        {
          id: "lj1h-pt1-subfolders",
          description: "Maak in Schoolwerk de mappen Nederlands en Biologie.",
          expectedPaths: [
            "Thuis/OneDrive/Schoolwerk/Nederlands",
            "Thuis/OneDrive/Schoolwerk/Biologie",
          ],
          points: 1,
        },
        {
          id: "lj1h-pt1-book",
          description: "Verplaats Boekverslag_Nederlands.docx naar Schoolwerk/Nederlands.",
          expectedPath: "Thuis/OneDrive/Schoolwerk/Nederlands/Boekverslag_Nederlands.docx",
          points: 1,
        },
      ],
    },
    pt2: {
      id: "lj1h-pt2-mail",
      title: "Mail opstellen",
      instruction: reportMailInstruction,
      kerndoel: "21A, 23B",
      config: createReportMailConfig(),
    },
    pt4: {
      id: "lj1h-pt4-excel",
      title: "PT4 - Excel/data sorteren en filteren",
      instruction: excelInstruction("LJ1_HV_Bibliotheek.xlsx"),
      filename: "LJ1_HV_Bibliotheek.xlsx",
      sheetName: "Boeken",
      questions: [
        {
          id: "a",
          prompt: "Sorteer op Jaar, van nieuw naar oud. Welke code staat bovenaan?",
          answer: "B07",
          points: 1,
        },
        {
          id: "b",
          prompt:
            "Filter op Vak = biologie. Sorteer daarna op Jaar, van oud naar nieuw. Welke code staat bovenaan?",
          answer: "B06",
          points: 1,
        },
      ],
    },
    pt6: {
      id: "lj1h-pt6-meeting",
      title: "PT6 - Videovergadering en schermdelen",
      instruction: fakeTeamsInstruction,
      kerndoel: "21A, 23B",
      ankerItemFlag: true,
      config: createFakeTeamsConfig(),
    },
    pt7: {
      id: "lj1h-pt7-programming",
      title: "PT7 - Blokprogrammeren",
      intro:
        "Dit is Bizzy, een robot die kan bewegen, draaien en praten. Programmeer Bizzy door blokken op het werkvlak te slepen. Klik op ▶ om je programma uit te voeren.",
      instruction:
        "Maak een programma dat dit doet: na klikken op Afspelen zegt Bizzy Hoi! en beweegt hij drie keer vooruit.",
      config: {
        device: "bizzy",
        codingSteps: [
          "Gebruik het startblok Wanneer er geklikt wordt op afspelen.",
          "Laat Bizzy Hoi! zeggen.",
          "Gebruik herhaal 3 keer.",
          "Zet verplaats Bizzy 1 meter vooruit in de herhaling.",
        ],
        blocks: [
          block("Wanneer er geklikt wordt op afspelen", "gebeurtenissen"),
          block("wanneer er op Bizzy wordt geklikt", "gebeurtenissen"),
          block("verander animatie van Bizzy naar niet animeren", "uiterlijk"),
          block('Bizzy zegt "Hoi!"', "uiterlijk"),
          block("verplaats Bizzy 1 meter vooruit in 1 sec.", "beweging"),
          block("draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.", "beweging"),
          block("als 1 < 2", "besturing", { isContainer: true, isCriticalDistractor: true }),
          block("herhaal 3 keer", "besturing", { isContainer: true }),
          block("herhaal 10 keer", "besturing", { isContainer: true }),
          block("speel geluid start", "geluid"),
          block("zet snelheid op 2", "variabelen"),
          block("als Bizzy rand raakt", "waarnemen", { isContainer: true }),
          block("stop alles", "besturing"),
        ],
        correctProgram: [
          "Wanneer er geklikt wordt op afspelen",
          'Bizzy zegt "Hoi!"',
          "herhaal 3 keer",
          "verplaats Bizzy 1 meter vooruit in 1 sec.",
        ],
        rules: [
          {
            id: "start",
            description: "juiste startblok.",
            points: 1,
            firstBlock: "Wanneer er geklikt wordt op afspelen",
          },
          {
            id: "say",
            description: 'Bizzy zegt "Hoi!" gebruikt.',
            points: 1,
            requiredBlocks: ['Bizzy zegt "Hoi!"'],
          },
          {
            id: "repeat-three",
            description:
              "herhaal 3 keer met verplaats Bizzy 1 meter vooruit in 1 sec. als geneste body.",
            points: 1,
            nestedBlocks: [
              {
                parent: "herhaal 3 keer",
                child: "verplaats Bizzy 1 meter vooruit in 1 sec.",
              },
            ],
          },
          {
            id: "behavior",
            description: "eindgedrag klopt en er is geen kritieke afleider gebruikt.",
            points: 1,
            requireExecuted: true,
            requiredBlocks: ['Bizzy zegt "Hoi!"', "herhaal 3 keer"],
            nestedBlocks: [
              {
                parent: "herhaal 3 keer",
                child: "verplaats Bizzy 1 meter vooruit in 1 sec.",
              },
            ],
            forbiddenBlocks: ["als 1 < 2"],
          },
        ],
      },
    },
    pt8: {
      id: "lj1h-pt8-online",
      title: "PT8 - Online gedrag: misleidende appmelding",
      instruction:
        "Een app probeert Silke steeds naar dezelfde keuze te sturen.\nOpen de instellingen.\nKies een veilige meldingsinstelling.\nKlik daarna op Volgende.",
      kerndoel: "23B, 21B, 23A",
      config: {
        screens: [
          {
            id: "feeblemind",
            title: "Misleidende appmelding",
            instruction:
              'Op je telefoon vraagt de app Feeblemind steeds opnieuw: "Zet notificaties aan". Silke heeft al drie keer op "Nu niet" geklikt, maar de melding blijft terugkeren.',
            body:
              "Notificatie-instellingen kun je vinden in de app-instellingen of in het meldingsbeheer van de telefoon.",
            groups: [
              {
                id: "promptAction",
                title: "Interface",
                inputType: "single",
                options: fixedOptions(["Nu niet", "Oké", "Instellingen"]),
              },
              {
                id: "notificationSetting",
                title: "Bij Instellingen",
                inputType: "single",
                options: fixedOptions([
                  "Meldingen aan",
                  "Meldingen uit",
                  "Meldingen beperkt",
                  "Account verwijderen",
                ]),
              },
            ],
          },
        ],
        rules: [
          {
            id: "settings-opened",
            description: "instellingen geopend.",
            points: 1,
            groupId: "promptAction",
            kind: "singleCorrect",
            correctOptionIds: ["Instellingen"],
          },
          {
            id: "notifications-limited",
            description: "meldingen uit of beperkt.",
            points: 1,
            groupId: "notificationSetting",
            kind: "singleCorrect",
            correctOptionIds: ["Meldingen uit", "Meldingen beperkt"],
          },
          {
            id: "no-harmful-action",
            description:
              "niet akkoord gegaan met volledige notificaties en account niet verwijderd.",
            points: 1,
            groupId: "promptAction",
            kind: "noForbidden",
            forbiddenByGroup: {
              promptAction: ["Oké"],
              notificationSetting: ["Account verwijderen"],
            },
          },
        ],
      },
    },
    sr: [],
  },
  {
    id: "lj3-vmbo",
    title: "Leerjaar 3 VMBO",
    level: "LJ3 VMBO",
    themeKey: "mintPink",
    pt1: {
      id: "lj3v-pt1-files",
      title: "PT1 - Bestanden en mappen",
      instruction:
        "Gebruik de Verkenner hieronder.\nMaak alle opdrachten in de linkerkolom.\nLet goed op mappen en bestandsnamen.\nKlik daarna op Volgende.",
      startFolders: ["Thuis/OneDrive", "Thuis/OneDrive/Project_stage"],
      startFiles: [
        "Thuis/OneDrive/Project_stage/Plan_stage_v1.docx",
        "Thuis/OneDrive/Project_stage/Plan_stage_DEF.docx",
        "Thuis/OneDrive/Project_stage/Foto_stage.jpg",
        "Thuis/OneDrive/Project_stage/Notities.txt",
      ],
      ankerItemFlag: true,
      tasks: [
        {
          id: "lj3v-pt1-archief",
          description: "Maak de map Archief in Project_stage.",
          expectedPath: "Thuis/OneDrive/Project_stage/Archief",
          points: 1,
        },
        {
          id: "lj3v-pt1-old",
          description: "Verplaats Plan_stage_v1.docx naar Archief.",
          expectedPath: "Thuis/OneDrive/Project_stage/Archief/Plan_stage_v1.docx",
          points: 1,
        },
        {
          id: "lj3v-pt1-final",
          description: "Hernoem Plan_stage_DEF.docx naar Plan_stage_eindversie.docx.",
          expectedPath: "Thuis/OneDrive/Project_stage/Plan_stage_eindversie.docx",
          forbiddenPaths: ["Thuis/OneDrive/Project_stage/Plan_stage_DEF.docx"],
          points: 1,
        },
      ],
    },
    pt2: {
      id: "lj3v-pt2-mail",
      title: "Mail opstellen",
      instruction: reportMailInstruction,
      kerndoel: "21A, 23B",
      config: createReportMailConfig(),
    },
    pt3: {
      id: "lj3v-pt3-security",
      title: "PT3 - Account, apparaat en verbinding beveiligen",
      instruction: "Kies veilige acties bij twee meldingen op je telefoon.",
      kerndoel: "23A, 21A",
      config: {
        screens: [
          {
            id: "update",
            title: "Scherm 1 - Verdachte update",
            instruction: "Je krijgt deze melding op je telefoon: je videospeler is verouderd. Klik hier om update.exe te downloaden.",
            groups: [
              {
                id: "updateActions",
                title: "Acties",
                inputType: "multi",
                options: fixedOptions([
                  "Download update.exe",
                  "Sluit melding",
                  "Open officiële app/instellingen voor updates",
                  "Sta meldingen altijd toe",
                ]),
              },
            ],
          },
          {
            id: "login",
            title: "Scherm 2 - Verdachte login",
            instruction: "Je krijgt deze melding op je telefoon: nieuwe login op je schoolaccount vanaf onbekend apparaat.",
            groups: [
              {
                id: "loginActions",
                title: "Acties",
                inputType: "multi",
                options: fixedOptions([
                  "Officiële accountbeveiliging openen",
                  "Wachtwoord wijzigen",
                  "Sessie/apparaat controleren",
                  "Bericht negeren",
                  "Wachtwoord naar vriend sturen",
                ]),
              },
            ],
          },
        ],
        rules: [
          {
            id: "no-download",
            description: "download niet gestart.",
            points: 1,
            groupId: "updateActions",
            kind: "noForbidden",
            forbiddenOptionIds: ["Download update.exe"],
          },
          {
            id: "official-update",
            description: "officiële updateplek gekozen.",
            points: 1,
            groupId: "updateActions",
            kind: "allSelected",
            correctOptionIds: ["Open officiële app/instellingen voor updates"],
          },
          {
            id: "official-account",
            description: "officiële accountbeveiliging geopend.",
            points: 1,
            groupId: "loginActions",
            kind: "allSelected",
            correctOptionIds: ["Officiële accountbeveiliging openen"],
          },
          {
            id: "login-followup",
            description: "sessie/apparaat gecontroleerd of wachtwoord gewijzigd.",
            points: 1,
            groupId: "loginActions",
            kind: "minCorrect",
            minCorrect: 1,
            correctOptionIds: ["Sessie/apparaat controleren", "Wachtwoord wijzigen"],
          },
        ],
      },
    },
    pt4: {
      id: "lj3v-pt4-excel",
      title: "PT4 - Excel/data sorteren en filteren",
      instruction: excelInstruction("LJ3_VMBO_Bestellingen.xlsx"),
      filename: "LJ3_VMBO_Bestellingen.xlsx",
      sheetName: "Bestellingen",
      questions: [
        {
          id: "a",
          prompt:
            "Filter op Categorie = elektronica. Sorteer daarna op Jaar, van nieuw naar oud. Welke code staat bovenaan?",
          answer: "W02",
          points: 1,
        },
        {
          id: "b",
          prompt:
            "Filter op Bedrag > 60. Sorteer daarna op Bedrag, van hoog naar laag. Welke code staat bovenaan?",
          answer: "W06",
          points: 1,
        },
      ],
    },
    pt6: {
      id: "lj3v-pt6-meeting",
      title: "PT6 - Videovergadering en schermdelen",
      instruction: fakeTeamsInstruction,
      kerndoel: "21A, 23B, 23A",
      ankerItemFlag: true,
      config: createFakeTeamsConfig(),
    },
    pt7: {
      id: "lj3v-pt7-programming",
      title: "PT7 - Blokprogrammeren",
      intro:
        "Dit is een micro:bit-achtig apparaat met een klein scherm en twee knoppen (A en B). Programmeer een teller die op het scherm verschijnt. Klik op ▶ om je programma uit te voeren; klik daarna op A of B om de knoppen te testen.",
      instruction:
        "Maak een programma. De teller begint op 0. Elke keer dat knop A wordt ingedrukt, gaat de teller 1 omhoog. Bij 5 of meer toont het scherm vol.",
      config: {
        device: "microbit",
        codingSteps: [
          "Zet de teller bij start op 0.",
          "Laat knop A de teller met 1 verhogen.",
          "Controleer of de teller 5 of meer is.",
          "Toon vol als de teller 5 of meer is.",
        ],
        blocks: [
          block("bij start", "gebeurtenissen", { isContainer: true }),
          block("zet teller op 0", "variabelen"),
          block("als knop A wordt ingedrukt", "gebeurtenissen", { isContainer: true }),
          block("als knop B wordt ingedrukt", "gebeurtenissen", { isContainer: true }),
          block("verander teller met 1", "variabelen"),
          block("verander teller met -1", "variabelen"),
          block("als teller >= 5 dan", "besturing", { isContainer: true }),
          block("als teller < 5 dan", "besturing", {
            isContainer: true,
            isCriticalDistractor: true,
          }),
          block('toon "vol"', "uiterlijk"),
          block('toon "leeg"', "uiterlijk"),
          block("wacht 10 seconden", "besturing"),
          block("speel geluid klaar", "geluid"),
        ],
        correctProgram: [
          "bij start",
          "zet teller op 0",
          "als knop A wordt ingedrukt",
          "verander teller met 1",
          "als teller >= 5 dan",
          'toon "vol"',
        ],
        rules: [
          {
            id: "init",
            description: "teller initialiseert op 0 binnen bij start.",
            points: 1,
            nestedBlocks: [{ parent: "bij start", child: "zet teller op 0" }],
          },
          {
            id: "button-a",
            description: "als knop A wordt ingedrukt met geneste verander teller met 1.",
            points: 1,
            nestedBlocks: [
              { parent: "als knop A wordt ingedrukt", child: "verander teller met 1" },
            ],
          },
          {
            id: "show-full",
            description: 'als teller >= 5 dan met geneste toon "vol".',
            points: 1,
            nestedBlocks: [{ parent: "als teller >= 5 dan", child: 'toon "vol"' }],
          },
          {
            id: "behavior",
            description:
              "eindgedrag bij testen van A klopt en er is geen kritieke afleider gebruikt.",
            points: 1,
            requireExecuted: true,
            nestedBlocks: [
              { parent: "als knop A wordt ingedrukt", child: "verander teller met 1" },
              { parent: "als teller >= 5 dan", child: 'toon "vol"' },
            ],
            forbiddenBlocks: ["als teller < 5 dan"],
          },
        ],
      },
    },
    pt8: {
      id: "lj3v-pt8-online",
      title: "PT8 - Online gedrag: deepfake/pesten",
      instruction: "Bekijk de situatie.\nKies twee signalen.\nKies twee veilige acties.",
      kerndoel: "21D, 23A, 23B",
      aiSnelVeranderendFlag: true,
      config: {
        screens: [
          {
            id: "deepfake",
            title: "Deepfake/pesten",
            instruction:
              'In de klassenapp van klas 3V2 verschijnt een AI-gemaakte afbeelding van een leerling in een beschamende situatie. Iemand schrijft: "Dit is echt, stuur door." De handen zien er vreemd uit. De leerling reageert: "Dit ben ik niet."',
            body:
              "Rapporteren = via de meld-knop in de app aan de beheerder of het platform melden.\nBewijs bewaren = de afbeelding/het bericht opslaan voor je het bericht verlaat, zodat het later getoond kan worden.",
            groups: [
              {
                id: "judgement",
                title: "Beoordeel de afbeelding",
                inputType: "single",
                options: fixedOptions(["echt", "twijfelachtig", "waarschijnlijk nep of AI"]),
              },
              {
                id: "signals",
                title: "Klik twee signalen aan",
                inputType: "multi",
                options: fixedOptions(["vreemde handen", "leerling ontkent", "schadelijke context"]),
              },
              {
                id: "actions",
                title: "Kies twee acties",
                inputType: "multi",
                options: fixedOptions([
                  "niet doorsturen",
                  "rapporteren",
                  "bewijs bewaren",
                  "melden bij mentor/vertrouwde volwassene",
                ]),
              },
            ],
          },
        ],
        rules: [
          {
            id: "judgement",
            description: "juist oordeel.",
            points: 1,
            groupId: "judgement",
            kind: "singleCorrect",
            correctOptionIds: ["waarschijnlijk nep of AI"],
          },
          {
            id: "signals",
            description: "minstens twee juiste signalen.",
            points: 1,
            groupId: "signals",
            kind: "minCorrect",
            minCorrect: 2,
            correctOptionIds: ["vreemde handen", "leerling ontkent", "schadelijke context"],
          },
          {
            id: "actions",
            description: "minstens twee juiste acties en geen schadelijke actie.",
            points: 1,
            groupId: "actions",
            kind: "minCorrect",
            minCorrect: 2,
            correctOptionIds: [
              "niet doorsturen",
              "rapporteren",
              "bewijs bewaren",
              "melden bij mentor/vertrouwde volwassene",
            ],
          },
        ],
      },
    },
    sr: [],
  },
  {
    id: "lj3-hv",
    title: "Leerjaar 3 HAVO/VWO",
    level: "LJ3 HAVO/VWO",
    themeKey: "roseNavy",
    pt1: {
      id: "lj3h-pt1-files",
      title: "PT1 - Bestanden en mappen",
      instruction:
        "Gebruik de Verkenner hieronder.\nMaak alle opdrachten in de linkerkolom.\nLet goed op mappen en bestandsnamen.\nKlik daarna op Volgende.",
      startFolders: ["Thuis/OneDrive", "Thuis/OneDrive/Onderzoek"],
      startFiles: [
        "Thuis/OneDrive/Onderzoek/Onderzoek_v1.docx",
        "Thuis/OneDrive/Onderzoek/Onderzoek_v2.docx",
        "Thuis/OneDrive/Onderzoek/Onderzoek_DEF.docx",
        "Thuis/OneDrive/Onderzoek/Bronnen.xlsx",
        "Thuis/OneDrive/Onderzoek/Afbeelding_CC_BY.png",
      ],
      ankerItemFlag: true,
      tasks: [
        {
          id: "lj3h-pt1-archief",
          description: "Maak de map Archief.",
          expectedPath: "Thuis/OneDrive/Onderzoek/Archief",
          points: 1,
        },
        {
          id: "lj3h-pt1-old",
          description: "Verplaats Onderzoek_v1.docx en Onderzoek_v2.docx naar Archief.",
          expectedPaths: [
            "Thuis/OneDrive/Onderzoek/Archief/Onderzoek_v1.docx",
            "Thuis/OneDrive/Onderzoek/Archief/Onderzoek_v2.docx",
          ],
          points: 1,
        },
        {
          id: "lj3h-pt1-final",
          description: "Hernoem Onderzoek_DEF.docx naar Onderzoek_eindversie.docx.",
          expectedPath: "Thuis/OneDrive/Onderzoek/Onderzoek_eindversie.docx",
          forbiddenPaths: ["Thuis/OneDrive/Onderzoek/Onderzoek_DEF.docx"],
          points: 1,
        },
      ],
    },
    pt2: {
      id: "lj3h-pt2-mail",
      title: "Mail opstellen",
      instruction: advancedMailInstruction,
      kerndoel: "21A, 23A, 23B",
      config: createAdvancedMailConfig(),
    },
    pt3: {
      id: "lj3h-pt3-security",
      title: "PT3 - Account, apparaat en verbinding beveiligen",
      instruction: "Kies veilige acties bij een bestand en een loginmelding.",
      kerndoel: "23A, 21A",
      config: {
        screens: [
          {
            id: "macro",
            title: "Scherm 1 - Macro-waarschuwing",
            instruction:
              "Je ontvangt een bestand: Factuur_stage.xlsm. Macro's zijn uitgeschakeld. Het bestand komt van een onbekende afzender.",
            groups: [
              {
                id: "macroActions",
                title: "Acties",
                inputType: "multi",
                options: fixedOptions([
                  "Macro's inschakelen",
                  "Afzender controleren",
                  "Bestand melden bij ICT",
                  "Bestand als vertrouwd markeren",
                  "Bestand doorsturen naar klasgroep",
                ]),
              },
            ],
          },
          {
            id: "login",
            title: "Scherm 2 - Verdachte login",
            instruction: "Je krijgt deze melding op je telefoon: nieuwe login op je schoolaccount vanaf onbekend apparaat.",
            groups: [
              {
                id: "loginActions",
                title: "Acties",
                inputType: "multi",
                options: fixedOptions([
                  "Officiële accountbeveiliging openen",
                  "Sessie/apparaten controleren",
                  "Wachtwoord wijzigen",
                  "Tweestapsverificatie controleren/aanzetten",
                  "Bericht negeren",
                  "Wachtwoord naar vriend sturen",
                ]),
              },
            ],
          },
        ],
        rules: [
          {
            id: "no-macros",
            description: "macro's niet ingeschakeld.",
            points: 1,
            groupId: "macroActions",
            kind: "noForbidden",
            forbiddenOptionIds: ["Macro's inschakelen"],
          },
          {
            id: "macro-followup",
            description: "afzender controleren of melden bij ICT.",
            points: 1,
            groupId: "macroActions",
            kind: "minCorrect",
            minCorrect: 1,
            correctOptionIds: ["Afzender controleren", "Bestand melden bij ICT"],
          },
          {
            id: "official-account",
            description: "officiële accountomgeving geopend.",
            points: 1,
            groupId: "loginActions",
            kind: "allSelected",
            correctOptionIds: ["Officiële accountbeveiliging openen"],
          },
          {
            id: "login-followup",
            description: "sessies/apparaten gecontroleerd en/of wachtwoord/2FA veilig aangepast.",
            points: 1,
            groupId: "loginActions",
            kind: "minCorrect",
            minCorrect: 1,
            correctOptionIds: [
              "Sessie/apparaten controleren",
              "Wachtwoord wijzigen",
              "Tweestapsverificatie controleren/aanzetten",
            ],
          },
        ],
      },
    },
    pt4: {
      id: "lj3h-pt4-excel",
      title: "PT4 - Excel/data sorteren en filteren",
      instruction: excelInstruction("LJ3_HV_OpenData.xlsx"),
      filename: "LJ3_HV_OpenData.xlsx",
      sheetName: "Energie",
      questions: [
        {
          id: "a",
          prompt:
            "Filter op Kosten > 500. Sorteer daarna op Kosten, van hoog naar laag. Welke code staat bovenaan?",
          answer: "E13",
          points: 1,
        },
        {
          id: "b",
          prompt:
            "Filter op Woningtype = B. Sorteer daarna op Jaar, van nieuw naar oud. Welke code staat bovenaan?",
          answer: "E02",
          points: 1,
        },
      ],
    },
    pt6: {
      id: "lj3h-pt6-meeting",
      title: "PT6 - Videovergadering en schermdelen",
      instruction: fakeTeamsInstruction,
      kerndoel: "21A, 23A, 23B",
      ankerItemFlag: true,
      config: createFakeTeamsConfig(),
    },
    pt7: {
      id: "lj3h-pt7-programming",
      title: "PT7 - Blokprogrammeren",
      intro:
        "Een sensor meet temperatuur en raamstand. Op het scherm verschijnt waarschuwing of ok. Programmeer de logica met blokken; klik op ▶ om te testen met de schuifregelaars voor temperatuur en raamstand.",
      instruction:
        "Maak een programma. Als de temperatuur hoger is dan 25 en het raam open staat, toon waarschuwing. Anders toon ok.",
      config: {
        device: "sensor",
        codingSteps: [
          "Lees de temperatuur en de raamstand.",
          "Gebruik de voorwaarde temperatuur hoger dan 25 EN raam open.",
          "Toon waarschuwing in de dan-tak.",
          "Toon ok in de anders-tak.",
        ],
        blocks: [
          block("bij start", "gebeurtenissen", { isContainer: true }),
          block("lees temperatuur", "waarnemen"),
          block("lees raamstand", "waarnemen"),
          block("als (temperatuur > 25) EN (raam = open) dan", "besturing", {
            isContainer: true,
          }),
          block("als (temperatuur > 25) OF (raam = open) dan", "besturing", {
            isContainer: true,
            isCriticalDistractor: true,
          }),
          block("als (temperatuur < 25) EN (raam = open) dan", "besturing", {
            isContainer: true,
            isCriticalDistractor: true,
          }),
          block('toon "waarschuwing"', "uiterlijk"),
          block('toon "ok"', "uiterlijk"),
          block('toon "koud"', "uiterlijk"),
          block("anders", "besturing", { isContainer: true }),
          block("herhaal altijd", "besturing", { isContainer: true }),
          block("verwijder temperatuur", "data"),
          block("zet temperatuur op 0", "variabelen"),
          block("speel alarmgeluid", "geluid"),
        ],
        correctProgram: [
          "bij start",
          "lees temperatuur",
          "lees raamstand",
          "als (temperatuur > 25) EN (raam = open) dan",
          'toon "waarschuwing"',
          "anders",
          'toon "ok"',
        ],
        rules: [
          {
            id: "read",
            description: "temperatuur en raamstand worden gelezen.",
            points: 1,
            requiredBlocks: ["lees temperatuur", "lees raamstand"],
          },
          {
            id: "condition",
            description: "juiste EN-voorwaarde gekozen.",
            points: 1,
            requiredBlocks: ["als (temperatuur > 25) EN (raam = open) dan"],
          },
          {
            id: "branches",
            description: "waarschuwing in juiste tak en ok in anders-tak.",
            points: 1,
            nestedBlocks: [
              {
                parent: "als (temperatuur > 25) EN (raam = open) dan",
                child: 'toon "waarschuwing"',
              },
              { parent: "anders", child: 'toon "ok"' },
            ],
          },
          {
            id: "behavior",
            description:
              "eindgedrag bij testwaarden klopt en er is geen kritieke afleider gebruikt.",
            points: 1,
            requireExecuted: true,
            requiredBlocks: ["lees temperatuur", "lees raamstand"],
            nestedBlocks: [
              {
                parent: "als (temperatuur > 25) EN (raam = open) dan",
                child: 'toon "waarschuwing"',
              },
              { parent: "anders", child: 'toon "ok"' },
            ],
            forbiddenBlocks: [
              "als (temperatuur > 25) OF (raam = open) dan",
              "als (temperatuur < 25) EN (raam = open) dan",
            ],
          },
        ],
      },
    },
    pt8: {
      id: "lj3h-pt8-online",
      title: "PT8 - Online gedrag: gemanipuleerde video",
      instruction:
        "Beoordeel de video.\nKies twee verdachte signalen.\nKies een verificatieactie.",
      kerndoel: "21D, 21B, 23B, 23C",
      aiSnelVeranderendFlag: true,
      config: {
        screens: [
          {
            id: "video",
            title: "Gemanipuleerde video",
            instruction:
              'Je ziet op een sociaal platform een video waarin een docent iets raars lijkt te zeggen. De video staat op een anoniem account zonder profielinformatie. De mondbeweging klopt niet goed met de stem. Onder de video staat: "Deel dit voordat school het verwijdert." Er is geen bron of context.',
            body:
              "Verifiëren = de informatie controleren via een officieel kanaal (bv. de school zelf, je mentor, een betrouwbare nieuwsbron).",
            groups: [
              {
                id: "judgement",
                title: "Beoordeel de video",
                inputType: "single",
                options: fixedOptions([
                  "waarschijnlijk echt",
                  "twijfelachtig",
                  "waarschijnlijk gemanipuleerd of nep",
                ]),
              },
              {
                id: "signals",
                title: "Klik twee verdachte signalen aan",
                inputType: "multi",
                options: fixedOptions([
                  "anoniem account",
                  "mondbeweging klopt niet",
                  'urgentie "deel dit"',
                  "geen bron/context",
                ]),
              },
              {
                id: "verifyAction",
                title: "Kies één verificatieactie",
                inputType: "single",
                options: fixedOptions([
                  "Check via officiele school/mentor of betrouwbare bron",
                  "Deel de video in de klas om te vragen of het klopt",
                  "Kijk alleen naar de reacties onder de video",
                ]),
              },
            ],
          },
        ],
        rules: [
          {
            id: "judgement",
            description: "juiste beoordeling.",
            points: 1,
            groupId: "judgement",
            kind: "singleCorrect",
            correctOptionIds: ["waarschijnlijk gemanipuleerd of nep", "twijfelachtig"],
          },
          {
            id: "signals",
            description: "minstens twee juiste signalen.",
            points: 1,
            groupId: "signals",
            kind: "minCorrect",
            minCorrect: 2,
            correctOptionIds: [
              "anoniem account",
              "mondbeweging klopt niet",
              'urgentie "deel dit"',
              "geen bron/context",
            ],
          },
          {
            id: "verify",
            description: "juiste verificatieactie.",
            points: 1,
            groupId: "verifyAction",
            kind: "singleCorrect",
            correctOptionIds: ["Check via officiele school/mentor of betrouwbare bron"],
          },
        ],
      },
    },
    sr: [],
  },
];

const v3FileInstruction =
  "Gebruik de Verkenner hieronder. Voer de taak uit en klik daarna op Volgende.";

const v3MailConfig = ({
  to,
  cc = [],
  forbiddenBcc = false,
  subject,
  files,
  requiredAttachment,
  forbiddenAttachments = [],
}: {
  to: string;
  cc?: string[];
  forbiddenBcc?: boolean;
  subject: string;
  files: string[];
  requiredAttachment: string;
  forbiddenAttachments?: string[];
}): MailTaskConfig => ({
  visibleButtons: mailButtons,
  contacts: [
    "docent@school.nl",
    "groepsgenoot1@school.nl",
    "groepsgenoot2@school.nl",
    "klasgroep@school.nl",
    "mentor@school.nl",
    "projectgenoot@school.nl",
    "stagebegeleider@bedrijf.nl",
  ],
  files,
  // Fase 2: ingekort van 4 naar 2 scoringsonderdelen (matrijs 21A: PT2 compacter).
  rules: [
    {
      id: "addressing",
      description: "juiste ontvanger, en cc/bcc waar nodig.",
      points: 1,
      conditions: [
        { field: "to", operator: "includes", value: to },
        ...(cc.length > 0 ? [{ field: "cc" as const, operator: "allInclude" as const, value: cc }] : []),
        ...(forbiddenBcc ? [{ field: "bcc" as const, operator: "noneInclude" as const, value: ["mentor@school.nl", "docent@school.nl", "klasgroep@school.nl"] }] : []),
      ],
    },
    {
      id: "content-sent",
      description: "juist onderwerp, juiste bijlage en verzonden.",
      points: 1,
      conditions: [
        { field: "subject", operator: "equals", value: subject },
        { field: "attachments", operator: "includes", value: requiredAttachment },
        ...(forbiddenAttachments.length > 0 ? [{ field: "attachments" as const, operator: "noneInclude" as const, value: forbiddenAttachments }] : []),
        { field: "sent" as const, operator: "true" as const },
      ],
    },
  ],
});

const v3Pt6 = (id: string): TeamsTaskSpec => ({
  id,
  title: "Schermdelen in een online les",
  instruction:
    "Deel het filmfragment zodat de docent het kan zien en horen. Mark Canbers wil niet dat de docent zijn andere vensters kan zien.",
  kerndoel: "23A",
  ankerItemFlag: true,
  config: {
    scenario:
      "Deel alleen het venster met het filmfragment. Gebruik computergeluid, maar deel niet je hele scherm.",
    buttons: ["Camera", "Microfoon", "Chat", "Deelnemers", "Delen", "Meer"],
    shareOptions: ["Hele scherm", "Venster"],
    windows: [
      "Videospeler - filmfragment",
      "Browser - rooster",
      "Word - verslag",
      "Excel - cijfers",
      "Chat - klasgroep",
    ],
    correctWindow: "Videospeler - filmfragment",
    rules: [
      {
        id: "window-not-screen",
        description: "deelt een venster in plaats van het hele scherm.",
        points: 1,
        conditions: ["notWholeScreen"],
      },
      {
        id: "correct-window",
        description: "kiest het juiste venster met het filmfragment.",
        points: 1,
        conditions: ["mediaPlayerSelected"],
      },
      // Fase 2: geluidsregel vervallen — van 3 naar 2 scoringsonderdelen (matrijs 23A: PT6 compacter).
    ],
  },
});

const v3Pt3 = (versionId: AssessmentVersionId): SecurityTaskSpec => {
  const specs: Record<AssessmentVersionId, SecurityTaskSpec> = {
    "lj1-vmbo": {
      id: "lj1v-pt3-security",
      title: "PT3 - Bericht beoordelen",
      instruction: "Bekijk de e-mail en kies je antwoorden.",
      kerndoel: "23A",
      config: {
        screens: [
          {
            id: "rooster-mail",
            title: "Mail over je rooster",
            instruction:
              "Sanne krijgt deze mail op haar schoolaccount.",
            emailStimulus: {
              fromName: "Roosterhulp",
              fromEmail: "roosterhulp@citadel-rooster.nl",
              toEmail: "sanne@leerling.citadelcollege.nl",
              date: "Vandaag 15:42",
              subject: "Roosterwijziging voor morgen",
              body: [
                "Hallo Sanne,",
                "Er is een roosterwijziging voor morgen. Controleer je rooster vandaag nog, zodat je geen lokaalwijziging mist.",
                "Bekijk je rooster via de knop hieronder.",
              ],
              linkLabel: "Rooster bekijken",
              linkUrl: "https://citadel-rooster.nl/login",
            },
            groups: [
              {
                id: "signals",
                title: "Waarom moet Sanne voorzichtig zijn? Kies 2.",
                inputType: "multi",
                maxSelections: 2,
                options: [
                  {
                    id: "sender_domain",
                    label: "De afzender gebruikt niet het bekende schooldomein.",
                  },
                  {
                    id: "unknown_roster_site",
                    label: "De knop gaat naar een roostersite die niet duidelijk van school is.",
                  },
                  {
                    id: "uses_name",
                    label: "De mail gebruikt Sanne's naam.",
                    errorCategory: "personalization_confused_with_trust",
                  },
                  {
                    id: "neat_layout",
                    label: "De mail ziet er netjes uit.",
                    errorCategory: "appearance_confused_with_trust",
                  },
                  {
                    id: "school_topic",
                    label: "De mail gaat over haar rooster.",
                    errorCategory: "school_context_confused_with_trust",
                  },
                  {
                    id: "unknown",
                    label: UNKNOWN_OPTION_LABEL,
                    unknown: true,
                    exclusive: true,
                  },
                ],
              },
              {
                id: "actions",
                title: "Wat kan Sanne nu het best doen?",
                inputType: "single",
                options: [
                  {
                    id: "known_route",
                    label:
                      "Niet op de knop klikken en haar rooster zelf openen via de roosterapp of bekende schoolsite.",
                  },
                  {
                    id: "reply_sender",
                    label: "De mail beantwoorden en vragen of de link klopt.",
                    errorCategory: "replies_to_possible_phisher",
                  },
                  {
                    id: "open_then_check",
                    label: "De link openen en stoppen als de pagina vreemd lijkt.",
                    riskFlag: "clicked_unknown_login_link",
                  },
                  {
                    id: "forward_class",
                    label: "De mail doorsturen naar de klas, zodat anderen kunnen meekijken.",
                    riskFlag: "spreads_possible_phishing",
                  },
                  {
                    id: "unknown",
                    label: UNKNOWN_OPTION_LABEL,
                    unknown: true,
                    exclusive: true,
                  },
                ],
              },
            ],
          },
        ],
        rules: [
          {
            id: "signal-sender-domain",
            description: "herkent dat de afzender niet het bekende schooldomein gebruikt.",
            points: 1,
            groupId: "signals",
            kind: "allSelected",
            correctOptionIds: ["sender_domain"],
            forbiddenByGroup: {
              signals: ["uses_name", "neat_layout", "school_topic", "unknown"],
            },
          },
          {
            id: "signal-roster-site",
            description: "herkent dat de knop naar een onbekende roostersite gaat.",
            points: 1,
            groupId: "signals",
            kind: "allSelected",
            correctOptionIds: ["unknown_roster_site"],
            forbiddenByGroup: {
              signals: ["uses_name", "neat_layout", "school_topic", "unknown"],
            },
          },
          {
            id: "safe-route",
            description: "kiest de bekende roosterapp of schoolsite in plaats van de mailknop.",
            points: 1,
            groupId: "actions",
            kind: "singleCorrect",
            correctOptionIds: ["known_route"],
          },
        ],
      },
    },
    "lj1-hv": {
      id: "lj1h-pt3-security",
      title: "PT3 - Bericht beoordelen",
      instruction: "Bekijk de e-mail en kies je antwoorden.",
      kerndoel: "23A",
      config: {
        screens: [
          {
            id: "code-mail",
            title: "Mail over accountcontrole",
            instruction: "Noor krijgt deze mail op haar schoolaccount. Ze vertrouwt de mail niet helemaal.",
            emailStimulus: {
              fromName: "ICT controle",
              fromEmail: "ict-472kq9-check@safe-login-mailer.info",
              toEmail: "noor@leerling.citadelcollege.nl",
              date: "Vandaag 10:02",
              subject: "Controleer je schoolaccount",
              body: [
                "Beste leerling,",
                "Wij controleren alle accounts. Stuur je tijdelijke inlogcode terug zodat je account actief blijft.",
                "Reageer binnen 30 minuten.",
              ],
              linkLabel: "Code bevestigen",
              linkUrl: "https://citadel-controle.example.org/code",
            },
            groups: [
              {
                id: "signals",
                title: "Wat maakt deze mail onbetrouwbaar?",
                inputType: "multi",
                options: fixedOptions([
                  "Het afzenderadres is geen duidelijk schooladres.",
                  "De mail vraagt om een persoonlijke inlogcode.",
                  "De mail gebruikt tijdsdruk.",
                  "Er staat 'Beste leerling' in plaats van een naam.",
                  "De mail gaat over school.",
                ]),
              },
              {
                id: "actions",
                title: "Wat doet Noor?",
                inputType: "multi",
                options: fixedOptions([
                  "Geen code delen.",
                  "Account of melding controleren via de normale schoolroute.",
                  "De mail melden of aan ICT/docent laten zien.",
                  "De code terugsturen zodat het account actief blijft.",
                  "De link openen en daar de code invullen.",
                ]),
              },
            ],
          },
        ],
        rules: [
          { id: "signals", description: "herkent minimaal twee signalen in de mail.", points: 1, groupId: "signals", kind: "minCorrect", minCorrect: 2, correctOptionIds: ["Het afzenderadres is geen duidelijk schooladres.", "De mail vraagt om een persoonlijke inlogcode.", "De mail gebruikt tijdsdruk.", "Er staat 'Beste leerling' in plaats van een naam."] },
          { id: "safe-actions", description: "kiest veilige vervolgstappen.", points: 1, groupId: "actions", kind: "allSelected", correctOptionIds: ["Geen code delen.", "Account of melding controleren via de normale schoolroute."] },
          { id: "no-code", description: "deelt de code niet via mail of link.", points: 1, groupId: "actions", kind: "noForbidden", forbiddenOptionIds: ["De code terugsturen zodat het account actief blijft.", "De link openen en daar de code invullen."] },
        ],
      },
    },
    "lj3-vmbo": {
      id: "lj3v-pt3-security",
      title: "PT3 - Bericht beoordelen",
      instruction: "Bekijk de e-mail en kies je antwoorden.",
      kerndoel: "23A",
      config: {
        screens: [
          {
            id: "attachment-mail",
            title: "Mail met bestand",
            instruction: "Jayden krijgt deze mail vlak voor een toetsweek.",
            emailStimulus: {
              fromName: "Cijfersysteem",
              fromEmail: "c1jf3r-upd8-771@doc-viewer-login.com",
              toEmail: "jayden@leerling.citadelcollege.nl",
              date: "Gisteren 19:48",
              subject: "Cijferlijst controleren",
              body: [
                "Hallo,",
                "Er is een fout gevonden in je cijferlijst. Open de bijlage en schakel bewerken in om de nieuwe cijfers te bekijken.",
                "Controleer dit voor morgen.",
              ],
              attachments: ["Cijferlijst_update.xlsm"],
              linkLabel: "Online bekijken",
              linkUrl: "https://cijfers-school-update.example.net/login",
            },
            groups: [
              {
                id: "signals",
                title: "Welke signalen vragen om extra controle?",
                inputType: "multi",
                options: fixedOptions([
                  "Het afzenderadres hoort niet duidelijk bij school.",
                  "De bijlage is een macrobestand.",
                  "De mail vraagt om bewerken of macro's in te schakelen.",
                  "De mail zet druk met een korte deadline.",
                  "De mail gaat over cijfers.",
                ]),
              },
              {
                id: "actions",
                title: "Wat is veilig om te doen?",
                inputType: "multi",
                options: fixedOptions([
                  "Bijlage niet openen of macro's niet inschakelen.",
                  "Cijfers controleren via het normale schoolportaal.",
                  "De mail melden of laten controleren.",
                  "Bijlage openen en bewerken inschakelen.",
                  "Inloggen via de link in de mail.",
                ]),
              },
            ],
          },
        ],
        rules: [
          { id: "signals", description: "herkent minimaal twee signalen in de mail.", points: 1, groupId: "signals", kind: "minCorrect", minCorrect: 2, correctOptionIds: ["Het afzenderadres hoort niet duidelijk bij school.", "De bijlage is een macrobestand.", "De mail vraagt om bewerken of macro's in te schakelen.", "De mail zet druk met een korte deadline."] },
          { id: "safe-actions", description: "kiest veilige controle- en meldactie.", points: 1, groupId: "actions", kind: "allSelected", correctOptionIds: ["Bijlage niet openen of macro's niet inschakelen.", "Cijfers controleren via het normale schoolportaal."] },
          { id: "no-danger", description: "kiest geen risicovolle actie.", points: 1, groupId: "actions", kind: "noForbidden", forbiddenOptionIds: ["Bijlage openen en bewerken inschakelen.", "Inloggen via de link in de mail."] },
        ],
      },
    },
    "lj3-hv": {
      id: "lj3h-pt3-security",
      title: "PT3 - Bericht beoordelen",
      instruction: "Bekijk de e-mail en kies je antwoorden.",
      kerndoel: "23A",
      config: {
        screens: [
          {
            id: "session-mail",
            title: "Mail over accountactiviteit",
            instruction:
              "Mila krijgt deze mail nadat ze thuis heeft ingelogd op haar schoolaccount.",
            emailStimulus: {
              fromName: "Account team",
              fromEmail: "acc-veilig-90z1@verify-device-center.co",
              toEmail: "mila@leerling.citadelcollege.nl",
              date: "Vandaag 21:06",
              subject: "Onbekend apparaat gevonden",
              body: [
                "Beste Mila,",
                "Er is een onbekend apparaat gekoppeld. Voorkom afsluiting van je account door je wachtwoord via onderstaande knop te vernieuwen.",
                "Gebruik dezelfde gegevens als je schoolaccount.",
              ],
              linkLabel: "Wachtwoord vernieuwen",
              linkUrl: "https://citadel-device-check.example.com/security",
            },
            groups: [
              {
                id: "signals",
                title: "Welke signalen maken dat Mila voorzichtig moet zijn?",
                inputType: "multi",
                options: fixedOptions([
                  "Het domein van de afzender is geen herkenbaar schooldomein.",
                  "De link gebruikt een andere domeinnaam dan de schoolsite.",
                  "De mail dreigt met afsluiting van het account.",
                  "De mail vraagt om schoolgegevens in te vullen via een link.",
                  "De mail noemt Mila bij naam.",
                ]),
              },
              {
                id: "actions",
                title: "Wat is de beste aanpak?",
                inputType: "multi",
                options: fixedOptions([
                  "Niet via de link inloggen.",
                  "Zelf naar de officiele accountinstellingen gaan.",
                  "Actieve sessies en tweestapsverificatie controleren.",
                  "Wachtwoord invullen via de knop om afsluiting te voorkomen.",
                  "De mail negeren zonder verder te controleren.",
                ]),
              },
            ],
          },
        ],
        rules: [
          { id: "signals", description: "herkent minimaal drie signalen in de mail.", points: 1, groupId: "signals", kind: "minCorrect", minCorrect: 3, correctOptionIds: ["Het domein van de afzender is geen herkenbaar schooldomein.", "De link gebruikt een andere domeinnaam dan de schoolsite.", "De mail dreigt met afsluiting van het account.", "De mail vraagt om schoolgegevens in te vullen via een link."] },
          { id: "account-check", description: "kiest controle via eigen accountinstellingen.", points: 1, groupId: "actions", kind: "allSelected", correctOptionIds: ["Niet via de link inloggen.", "Zelf naar de officiele accountinstellingen gaan.", "Actieve sessies en tweestapsverificatie controleren."] },
          { id: "no-link", description: "vermijdt link en passief negeren.", points: 1, groupId: "actions", kind: "noForbidden", forbiddenOptionIds: ["Wachtwoord invullen via de knop om afsluiting te voorkomen.", "De mail negeren zonder verder te controleren."] },
        ],
      },
    },
  };
  return specs[versionId];
};
const v3Pt8 = (versionId: AssessmentVersionId): SocialTaskSpec => {
  const cap = (optionIds: string[], groupIds?: string[]) => [{ id: "harmful-cap", maxScore: 2, optionIds, groupIds }];
  const specs: Record<AssessmentVersionId, SocialTaskSpec> = {
    "lj1-vmbo": {
      id: "lj1v-pt8-online",
      title: "PT8 - Online gedrag: foto delen",
      instruction: "Bekijk wat er in Whutsupp gebeurt. Kies per scherm de beste reactie.",
      kerndoel: "23B",
      config: {
        screens: [
          {
            id: "judgement",
            title: "Whutsupp: foto van klasgenoten",
            instruction: "In Whutsupp wil iemand een foto van drie klasgenoten in de klassenapp zetten. Een van hen schrijft: \"Wacht, ik wil eerst weten welke foto dit is.\" Jij ziet het bericht.",
            groups: [{ id: "problem", title: "Wat is hier het belangrijkste probleem?", inputType: "single", options: fixedOptions(["Je moet eerst toestemming vragen aan iedereen die herkenbaar op de foto staat.", "Delen in een klassenapp mag altijd, omdat het over school gaat.", "Alleen de namen weglaten is genoeg.", "Je mag de foto plaatsen en hem later weghalen als iemand klaagt."]) }],
          },
          {
            id: "actions",
            title: "Acties",
            instruction: "Wat doe je? Kies alle acties die je zou doen.",
            groups: [{ id: "actions", title: "Acties", inputType: "multi", options: fixedOptions(["Niet plaatsen of doorsturen zolang niet iedereen akkoord is.", "Vragen of iedereen op de foto het goed vindt.", "De foto verwijderen als iemand geen toestemming geeft.", "De foto toch in de klassenapp zetten, want dat is een besloten groep.", "De foto bewerken of bijsnijden en daarna alsnog delen."]) }],
          },
        ],
        rules: [
          { id: "risk", description: "herkent toestemming bij herkenbare personen.", points: 1, groupId: "problem", kind: "singleCorrect", correctOptionIds: ["Je moet eerst toestemming vragen aan iedereen die herkenbaar op de foto staat."] },
          { id: "no-spread", description: "voorkomt delen zonder toestemming.", points: 1, groupId: "actions", kind: "allSelected", correctOptionIds: ["Niet plaatsen of doorsturen zolang niet iedereen akkoord is."] },
          { id: "ask-consent", description: "vraagt expliciet toestemming.", points: 1, groupId: "actions", kind: "allSelected", correctOptionIds: ["Vragen of iedereen op de foto het goed vindt."] },
          { id: "respect-no", description: "respecteert geen toestemming.", points: 1, groupId: "actions", kind: "allSelected", correctOptionIds: ["De foto verwijderen als iemand geen toestemming geeft."] },
        ],
        scoreCaps: cap(["De foto toch in de klassenapp zetten, want dat is een besloten groep.", "De foto bewerken of bijsnijden en daarna alsnog delen."], ["actions"]),
      },
    },
    "lj1-hv": {
      id: "lj1h-pt8-online",
      title: "PT8 - Online gedrag: privéchat",
      instruction: "Bekijk de situatie. Beoordeel het deelverzoek en kies verstandige vervolgstappen.",
      kerndoel: "23B",
      config: {
        screens: [
          { id: "judgement", title: "Deelverzoek in privéchat", instruction: "Je krijgt van een klasgenoot een privébericht: \"Stuur deze screenshot van onze chat even door naar de groep, dan ziet iedereen wat Noor zei.\" In de screenshot staat iets persoonlijks over Noor. Noor weet niet dat dit wordt doorgestuurd.", groups: [{ id: "judgement", title: "Wat is de beste beoordeling?", inputType: "single", options: fixedOptions(["Niet doorsturen, want er staat persoonlijke informatie in en Noor gaf geen toestemming.", "Doorsturen mag, want jij hebt de screenshot gekregen.", "Doorsturen mag als je Noors naam weglaat.", "Doorsturen mag als het alleen naar de klasgroep gaat."]) }] },
          { id: "followup", title: "Vervolgactie", instruction: "Welke vervolgstappen zijn verstandig? Kies alle goede acties.", groups: [{ id: "followup", title: "Vervolgstappen", inputType: "multi", options: fixedOptions(["Uitleggen dat je dit niet doorstuurt.", "Noor waarschuwen of vragen of zij hulp wil.", "Een mentor/ouder/verantwoordelijke volwassene inschakelen als er druk of ruzie ontstaat.", "De screenshot bewerken en dan alsnog delen.", "De screenshot naar een kleinere groep sturen."]) }] },
        ],
        rules: [
          { id: "risk", description: "herkent het probleem of risico.", points: 1, groupId: "judgement", kind: "singleCorrect", correctOptionIds: ["Niet doorsturen, want er staat persoonlijke informatie in en Noor gaf geen toestemming."] },
          { id: "no-spread", description: "voorkomt verdere verspreiding of escalatie.", points: 1, groupId: "followup", kind: "allSelected", correctOptionIds: ["Uitleggen dat je dit niet doorstuurt."], alternativeCorrectOptionIdsByGroup: { judgement: ["Niet doorsturen, want er staat persoonlijke informatie in en Noor gaf geen toestemming."] } },
          { id: "help", description: "schakelt passende hulp of melding in.", points: 1, groupId: "followup", kind: "minCorrect", minCorrect: 1, correctOptionIds: ["Noor waarschuwen of vragen of zij hulp wil.", "Een mentor/ouder/verantwoordelijke volwassene inschakelen als er druk of ruzie ontstaat."] },
          { id: "followup", description: "veilige vervolgstap zonder schadelijke deelactie.", points: 1, groupId: "followup", kind: "allSelected", correctOptionIds: ["Uitleggen dat je dit niet doorstuurt."], forbiddenOptionIds: ["De screenshot bewerken en dan alsnog delen.", "De screenshot naar een kleinere groep sturen."] },
        ],
        scoreCaps: cap(["De screenshot bewerken en dan alsnog delen.", "De screenshot naar een kleinere groep sturen."], ["followup"]),
      },
    },
    "lj3-vmbo": {
      id: "lj3v-pt8-online",
      title: "PT8 - Online gedrag: nepaccount",
      instruction: "Bekijk de situatie. Kies de beste eerste aanpak en veilige stappen.",
      kerndoel: "23B",
      config: {
        screens: [
          { id: "first", title: "Nepaccount met jouw foto", instruction: "Iemand maakt een account aan met jouw naam en profielfoto. Het account stuurt rare berichten naar leerlingen van school. Jij weet niet wie het heeft gedaan.", groups: [{ id: "first", title: "Wat is de beste eerste aanpak?", inputType: "single", options: fixedOptions(["Niet terugdreigen; het account rapporteren en hulp inschakelen.", "Zelf een nepaccount maken om terug te pakken.", "Iedereen vragen het account te volgen om bewijs te verzamelen.", "Je echte account verwijderen en niemand iets vertellen."]) }] },
          { id: "steps", title: "Veilige stappen", instruction: "Welke stappen zijn veilig? Kies alle goede acties.", groups: [{ id: "steps", title: "Stappen", inputType: "multi", options: fixedOptions(["Het account rapporteren bij het platform.", "Een mentor/ouder/verantwoordelijke volwassene vragen om te helpen bewijs veilig vast te leggen zonder het te verspreiden.", "Je eigen accountinstellingen en privacy controleren.", "Screenshots in de klassenapp zetten zodat iedereen ziet dat het nep is.", "De vermoedelijke dader online beschuldigen."]) }] },
        ],
        rules: [
          { id: "risk", description: "herkent het probleem of risico.", points: 1, groupId: "first", kind: "singleCorrect", correctOptionIds: ["Niet terugdreigen; het account rapporteren en hulp inschakelen."] },
          { id: "no-escalation", description: "voorkomt verdere verspreiding of escalatie.", points: 1, groupId: "first", kind: "noForbidden", forbiddenOptionIds: ["Zelf een nepaccount maken om terug te pakken.", "Iedereen vragen het account te volgen om bewijs te verzamelen."], forbiddenByGroup: { steps: ["Screenshots in de klassenapp zetten zodat iedereen ziet dat het nep is.", "De vermoedelijke dader online beschuldigen."] } },
          { id: "report-help", description: "schakelt passende hulp of melding in.", points: 1, groupId: "steps", kind: "minCorrect", minCorrect: 1, correctOptionIds: ["Het account rapporteren bij het platform."], alternativeCorrectOptionIdsByGroup: { first: ["Niet terugdreigen; het account rapporteren en hulp inschakelen."] } },
          { id: "safe-followup", description: "veilige bewijs- of privacyactie.", points: 1, groupId: "steps", kind: "minCorrect", minCorrect: 1, correctOptionIds: ["Een mentor/ouder/verantwoordelijke volwassene vragen om te helpen bewijs veilig vast te leggen zonder het te verspreiden.", "Je eigen accountinstellingen en privacy controleren."] },
        ],
        scoreCaps: cap(["Zelf een nepaccount maken om terug te pakken.", "Iedereen vragen het account te volgen om bewijs te verzamelen.", "Screenshots in de klassenapp zetten zodat iedereen ziet dat het nep is.", "De vermoedelijke dader online beschuldigen."]),
      },
    },
    "lj3-hv": {
      id: "lj3h-pt8-online",
      title: "PT8 - Online gedrag: gemanipuleerde schoolpost",
      instruction: "Bekijk de situatie. Weeg signalen, kies een aanpak en een vervolgstap.",
      kerndoel: "23B",
      config: {
        screens: [
          { id: "signals", title: "Gemanipuleerde schoolpost", instruction: "In een groepschat verschijnt een screenshot van een zogenaamd schoolbericht: \"Vanaf morgen zijn telefoons verboden. Wie protesteert, krijgt straf.\" Het bericht komt niet uit de schoolapp. De opmaak lijkt op school, maar het account dat het deelt is anoniem. Sommige leerlingen willen het meteen doorsturen.", groups: [{ id: "signals", title: "Welke signalen maken dat je voorzichtig moet zijn?", inputType: "multi", options: fixedOptions(["Het bericht komt niet uit de officiële schoolapp of mail.", "Het account dat het deelt is anoniem.", "Het bericht probeert snelle verspreiding of paniek te veroorzaken.", "Het bericht gebruikt woorden die op schooltaal lijken.", "Veel leerlingen reageren erop."]) }] },
          { id: "action", title: "Handelen", instruction: "Wat is de beste aanpak voordat je iets doorstuurt?", groups: [{ id: "action", title: "Aanpak", inputType: "single", options: fixedOptions(["Niet doorsturen en eerst controleren via officiële schoolkanalen of mentor/docent.", "Doorsturen met \"ik weet niet of dit klopt\" erbij.", "Alleen reacties lezen en dan beslissen.", "Zelf een aangepast screenshot maken om te laten zien dat het nep kan zijn."]) }] },
          { id: "followup", title: "Vervolg", instruction: "Wat is een goede vervolgstap als blijkt dat het nep is?", groups: [{ id: "followup", title: "Vervolgstap", inputType: "single", options: fixedOptions(["In de groep melden dat het niet uit een officieel kanaal komt en vragen het niet verder te delen.", "De maker online belachelijk maken.", "Het screenshot bewaren en later opnieuw delen als voorbeeld.", "Een nieuwe versie maken als grap."]) }] },
        ],
        rules: [
          { id: "risk", description: "minimaal twee juiste signalen.", points: 1, groupId: "signals", kind: "minCorrect", minCorrect: 2, correctOptionIds: ["Het bericht komt niet uit de officiële schoolapp of mail.", "Het account dat het deelt is anoniem.", "Het bericht probeert snelle verspreiding of paniek te veroorzaken."] },
          { id: "no-spread", description: "niet doorsturen.", points: 1, groupId: "action", kind: "singleCorrect", correctOptionIds: ["Niet doorsturen en eerst controleren via officiële schoolkanalen of mentor/docent."] },
          { id: "official-check", description: "officiële controle/mentor/docent.", points: 1, groupId: "action", kind: "singleCorrect", correctOptionIds: ["Niet doorsturen en eerst controleren via officiële schoolkanalen of mentor/docent."] },
          { id: "safe-followup", description: "corrigerende, niet-escalerende vervolgstap.", points: 1, groupId: "followup", kind: "singleCorrect", correctOptionIds: ["In de groep melden dat het niet uit een officieel kanaal komt en vragen het niet verder te delen."] },
        ],
        scoreCaps: cap(["Zelf een aangepast screenshot maken om te laten zien dat het nep kan zijn.", "De maker online belachelijk maken.", "Het screenshot bewaren en later opnieuw delen als voorbeeld.", "Een nieuwe versie maken als grap."]),
      },
    },
  };
  specs["lj1-vmbo"] = {
    id: "pt8-lj1v-online-behaviour-photo-consent-v4",
    title: "PT8 - Online gedrag: foto delen",
    instruction: "Bekijk wat er in Whutsupp gebeurt. Kies per scherm de beste reactie.",
    kerndoel: "23B",
    config: {
      screens: [
        {
          id: "screen1",
          title: "Whutsupp: foto van klasgenoten",
          instruction: "Wat is nu de beste eerste reactie van jou?",
          body: "In Whutsupp wil iemand een foto van drie klasgenoten in de klassenapp zetten.\n\nEen klasgenoot schrijft:\n\n\"Wacht, ik wil eerst weten welke foto dit is.\"\n\nEen paar leerlingen reageren dat het snel gedeeld moet worden.",
          groups: [{ id: "screen1", title: "Kies de beste reactie", inputType: "single", options: [
            { id: "s1-no-share-no-react", label: "Niet plaatsen of doorsturen zolang niet iedereen akkoord is." },
            { id: "s1-wait-for-group", label: "Eerst kijken hoeveel anderen de foto willen zien voordat je beslist." },
            { id: "s1-send-one-friend", label: "De foto naar een goede vriend sturen om te vragen of hij leuk is." },
            { id: "s1-joke-back", label: "De foto alvast plaatsen en zeggen dat het als grap bedoeld is." },
            { id: "s1-unknown", label: "Ik weet het niet." },
          ] }],
        },
        {
          id: "screen2",
          title: "Toestemming vragen",
          instruction: "Wat kun je het beste tegen de plaatser zeggen?",
          groups: [{ id: "screen2", title: "Kies de beste reactie", inputType: "single", options: [
            { id: "s2-remove-and-stop", label: "Vraag eerst aan iedereen die herkenbaar op de foto staat of delen goed is." },
            { id: "s2-send-to-others", label: "Stuur hem alleen naar een kleinere groep." },
            { id: "s2-wait-for-teacher", label: "Plaats hem alvast en verwijder hem pas als iemand klaagt." },
            { id: "s2-make-sticker", label: "Snijd de foto bij en deel hem dan alsnog." },
            { id: "s2-unknown", label: "Ik weet het niet." },
          ] }],
        },
        {
          id: "screen3",
          title: "Als iemand nee zegt",
          instruction: "Wat is een goede reactie als iemand geen toestemming geeft?",
          groups: [{ id: "screen3", title: "Kies de beste reactie", inputType: "single", options: [
            { id: "s3-support-sam", label: "De foto niet delen en verwijderen als hij al klaarstaat." },
            { id: "s3-dont-exaggerate", label: "Zeggen dat diegene zich niet moet aanstellen." },
            { id: "s3-more-videos", label: "Een andere versie van de foto maken zodat hij minder herkenbaar is." },
            { id: "s3-leave-chat", label: "De foto alleen naar mensen sturen die de klasgenoot niet kennen." },
            { id: "s3-unknown", label: "Ik weet het niet." },
          ] }],
        },
        {
          id: "screen4",
          title: "Veilige vervolgstap",
          instruction: "Wanneer is hulp van een mentor of andere volwassene verstandig?",
          groups: [{ id: "screen4", title: "Kies de beste reactie", inputType: "single", options: [
            { id: "s4-if-continues-or-harms", label: "Als er druk blijft om de foto toch te delen of iemand er last van heeft." },
            { id: "s4-only-after-100-views", label: "Alleen als de foto meer dan honderd keer bekeken is." },
            { id: "s4-only-if-me", label: "Alleen als jij zelf op de foto staat." },
            { id: "s4-never-private-chat", label: "Nooit, want wat in een groepschat gebeurt moet in de groepschat blijven." },
            { id: "s4-unknown", label: "Ik weet het niet." },
          ] }],
        },
      ],
      rules: [
        { id: "screen1", description: "deelt niet zonder toestemming.", points: 1, groupId: "screen1", kind: "singleCorrect", correctOptionIds: ["s1-no-share-no-react"] },
        { id: "screen2", description: "vraagt toestemming aan herkenbare personen.", points: 1, groupId: "screen2", kind: "singleCorrect", correctOptionIds: ["s2-remove-and-stop"] },
        { id: "screen3", description: "respecteert geen toestemming.", points: 1, groupId: "screen3", kind: "singleCorrect", correctOptionIds: ["s3-support-sam"] },
        { id: "screen4", description: "herkent wanneer hulp of melding nodig is.", points: 1, groupId: "screen4", kind: "singleCorrect", correctOptionIds: ["s4-if-continues-or-harms"] },
      ],
      scoreCaps: [
        { id: "harmful-share-cap", maxScore: 2, optionIds: ["s1-send-one-friend", "s2-send-to-others"] },
        { id: "escalation-as-joke-cap", maxScore: 2, optionIds: ["s1-joke-back", "s2-make-sticker", "s3-more-videos"] },
        { id: "victim-blaming-cap", maxScore: 3, optionIds: ["s3-dont-exaggerate", "s3-leave-chat"] },
        { id: "rejects-help-cap", maxScore: 3, optionIds: ["s4-never-private-chat"] },
      ],
    },
  };

  return specs[versionId];
};

const v3Pt7 = (versionId: AssessmentVersionId): BlockTaskSpec => {
  const specs: Record<AssessmentVersionId, BlockTaskSpec> = {
    "lj1-vmbo": {
      id: "lj1v-pt7-programming",
      title: "PT7 - Blokprogrammeren",
      intro: "Programmeer Bizzy door blokken op het werkvlak te slepen.",
      instruction: "Programmeer Bizzy zodat hij eerst 2 stappen vooruit gaat, daarna naar rechts draait, daarna \"Klaar\" zegt.",
      config: {
        device: "bizzy",
        blocks: [block("bij start", "gebeurtenissen", { isContainer: true }), block("als Bizzy wordt aangeraakt", "gebeurtenissen", { isCriticalDistractor: true }), block("2 stappen vooruit", "beweging"), block("1 stap vooruit", "beweging"), block("2 stappen achteruit", "beweging", { isCriticalDistractor: true }), block("draai naar rechts", "beweging"), block("draai naar links", "beweging", { isCriticalDistractor: true }), block('zeg "Klaar"', "uiterlijk"), block('zeg "Hoi"', "uiterlijk"), block("wacht 1 seconde", "besturing"), block("herhaal 2 keer", "besturing", { isContainer: true })],
        correctProgram: ["bij start", "2 stappen vooruit", "draai naar rechts", 'zeg "Klaar"'],
        rules: [
          { id: "start", description: "juiste start/gebeurtenisblok.", points: 1, firstBlock: "bij start" },
          { id: "move", description: "beweging vooruit correct.", points: 1, requiredBlocks: ["2 stappen vooruit"] },
          { id: "turn", description: "draai naar rechts correct.", points: 1, requiredBlocks: ["draai naar rechts"] },
          { id: "say", description: "boodschap Klaar na de bewegingen.", points: 1, orderedBlocks: ["2 stappen vooruit", "draai naar rechts", 'zeg "Klaar"'] },
        ],
      },
    },
    "lj1-hv": {
      id: "lj1h-pt7-programming",
      title: "PT7 - Blokprogrammeren",
      intro: "Programmeer Bizzy door blokken op het werkvlak te slepen.",
      instruction: "Programmeer Bizzy zodat hij 4 keer hetzelfde patroon uitvoert: 1 stap vooruit en daarna rechts draaien. Aan het einde zegt Bizzy \"Vierkant\".",
      config: {
        device: "bizzy",
        blocks: [block("bij start", "gebeurtenissen", { isContainer: true }), block("als Bizzy wordt aangeraakt", "gebeurtenissen", { isCriticalDistractor: true }), block("herhaal 4 keer", "besturing", { isContainer: true }), block("herhaal 3 keer", "besturing", { isContainer: true, isCriticalDistractor: true }), block("herhaal 5 keer", "besturing", { isContainer: true, isCriticalDistractor: true }), block("1 stap vooruit", "beweging"), block("2 stappen vooruit", "beweging"), block("links draaien", "beweging", { isCriticalDistractor: true }), block("rechts draaien", "beweging"), block('zeg "Vierkant"', "uiterlijk"), block('zeg "Klaar"', "uiterlijk"), block("wacht 1 seconde", "besturing")],
        correctProgram: ["bij start", "herhaal 4 keer", "1 stap vooruit", "rechts draaien", 'zeg "Vierkant"'],
        rules: [
          { id: "repeat", description: "gebruikt herhaalblok of correcte equivalente structuur.", points: 1, requiredBlocks: ["herhaal 4 keer"] },
          { id: "pattern", description: "patroon vooruit + rechts draaien correct.", points: 1, nestedBlocks: [{ parent: "herhaal 4 keer", child: "1 stap vooruit" }, { parent: "herhaal 4 keer", child: "rechts draaien" }] },
          { id: "repeat-four", description: "herhaling 4 keer correct.", points: 1, requiredBlocks: ["herhaal 4 keer"] },
          { id: "message", description: "eindboodschap na de herhaling.", points: 1, orderedBlocks: ["herhaal 4 keer", 'zeg "Vierkant"'] },
        ],
      },
    },
    "lj3-vmbo": {
      id: "lj3v-pt7-programming",
      title: "PT7 - Blokprogrammeren",
      intro: "Programmeer een eenvoudige wachtrij met een teller.",
      instruction: "Elke klik op knop A verhoogt de teller met 1. Als de teller 5 of hoger is, zegt Bizzy \"Vol\". Anders zegt Bizzy \"Nog plek\".",
      config: {
        device: "microbit",
        blocks: [block("bij start", "gebeurtenissen", { isContainer: true }), block("zet teller op 0", "variabelen"), block("zet teller op 5", "variabelen", { isCriticalDistractor: true }), block("als knop A wordt ingedrukt", "gebeurtenissen", { isContainer: true }), block("als knop B wordt ingedrukt", "gebeurtenissen", { isContainer: true }), block("verander teller met 1", "variabelen"), block("verander teller met -1", "variabelen", { isCriticalDistractor: true }), block("als teller >= 5 dan", "besturing", { isContainer: true }), block("als teller > 10 dan", "besturing", { isContainer: true, isCriticalDistractor: true }), block("als teller < 5 dan", "besturing", { isContainer: true }), block('zeg "Vol"', "uiterlijk"), block('zeg "Nog plek"', "uiterlijk"), block('zeg "Leeg"', "uiterlijk"), block("anders", "besturing", { isContainer: true })],
        correctProgram: ["bij start", "zet teller op 0", "als knop A wordt ingedrukt", "verander teller met 1", "als teller >= 5 dan", 'zeg "Vol"', "anders", 'zeg "Nog plek"'],
        rules: [
          { id: "variable", description: "teller/variabele correct gebruikt.", points: 1, requiredBlocks: ["zet teller op 0"] },
          { id: "button", description: "knop A verhoogt teller met 1.", points: 1, nestedBlocks: [{ parent: "als knop A wordt ingedrukt", child: "verander teller met 1" }] },
          { id: "condition", description: "voorwaarde teller >= 5 correct.", points: 1, requiredBlocks: ["als teller >= 5 dan"] },
          { id: "outcomes", description: "juiste uitkomstteksten bij beide situaties.", points: 1, requiredBlocks: ['zeg "Vol"', 'zeg "Nog plek"'] },
        ],
      },
    },
    "lj3-hv": {
      id: "lj3h-pt7-programming",
      title: "PT7 - Blokprogrammeren",
      intro: "Programmeer een waarschuwing met temperatuur en raamstand.",
      instruction: "Als temperatuur > 25 én raamOpen = ja, toont Bizzy \"Koelen\". Als dat niet zo is, toont Bizzy \"Oké\".",
      config: {
        device: "sensor",
        blocks: [block("lees temperatuur", "waarnemen"), block("lees raamOpen", "waarnemen"), block("lees lichtsterkte", "waarnemen"), block("als temperatuur > 25 EN raamOpen = ja dan", "besturing", { isContainer: true }), block("als temperatuur > 25 OF raamOpen = ja dan", "besturing", { isContainer: true, isCriticalDistractor: true }), block("als temperatuur < 25 EN raamOpen = ja dan", "besturing", { isContainer: true, isCriticalDistractor: true }), block('toon "Koelen"', "uiterlijk"), block("anders", "besturing", { isContainer: true }), block('toon "Oké"', "uiterlijk"), block('toon "Verwarmen"', "uiterlijk", { isCriticalDistractor: true }), block("wacht 10 seconden", "besturing"), block("speel alarmgeluid", "geluid")],
        correctProgram: ["lees temperatuur", "lees raamOpen", "als temperatuur > 25 EN raamOpen = ja dan", 'toon "Koelen"', "anders", 'toon "Oké"'],
        rules: [
          { id: "inputs", description: "gebruikt twee invoervariabelen correct.", points: 1, requiredBlocks: ["lees temperatuur", "lees raamOpen"] },
          { id: "condition", description: "samengestelde EN-voorwaarde correct.", points: 1, requiredBlocks: ["als temperatuur > 25 EN raamOpen = ja dan"] },
          { id: "true", description: "juiste actie bij waar.", points: 1, nestedBlocks: [{ parent: "als temperatuur > 25 EN raamOpen = ja dan", child: 'toon "Koelen"' }] },
          { id: "else", description: "juiste actie bij anders.", points: 1, nestedBlocks: [{ parent: "anders", child: 'toon "Oké"' }] },
        ],
      },
    },
  };
  return specs[versionId];
};

const v3Pt7Debug = (versionId: AssessmentVersionId): BlockTaskSpec => {
  const specs: Record<AssessmentVersionId, BlockTaskSpec> = {
    "lj1-vmbo": {
      id: "lj1v-pt7-programming-debug-v1",
      title: "PT7 - Blokprogrammeren",
      intro: "Kijk naar DOEL. Er zijn 2 fouten. Tik ze aan. Maak de code goed. Klik Afspelen.",
      instruction: "Blokprogrammeren",
      config: {
        itemVersion: "pt7-debug-v1",
        device: "bizzy",
        visualGoal: {
          title: "DOEL",
          lines: ['START -> -> rechts -> wacht -> links -> zeg "Klaar"'],
          steps: [
            { id: "start", label: "START", tone: "start" },
            { id: "move-1", label: "1 stap vooruit", icon: "→", tone: "arrow" },
            { id: "move-2", label: "1 stap vooruit", icon: "→", tone: "arrow" },
            { id: "turn-right", label: "draai rechts", icon: "↱", tone: "turn" },
            { id: "move-3", label: "1 stap vooruit", icon: "→", tone: "arrow" },
            { id: "wait", label: "wacht", icon: "⏸", tone: "wait" },
            { id: "turn-left", label: "draai links", icon: "↰", tone: "turn" },
            { id: "say", label: 'zeg "Klaar"', icon: "💬", tone: "say" },
          ],
        },
        initialProgram: [
          debugBlock("vmbo1_step1_start", "bij start", "gebeurtenissen", { isContainer: true }),
          debugBlock("vmbo1_step2_move_forward", "1 stap vooruit", "beweging"),
          debugBlock("vmbo1_step3_move_forward", "1 stap vooruit", "beweging"),
          debugBlock("vmbo1_step4_turn_left_should_be_right", "draai naar links", "beweging", { correctReplacementId: "lj1v_turn_right_fix" }),
          debugBlock("vmbo1_step5_move_forward", "1 stap vooruit", "beweging"),
          debugBlock("vmbo1_step6_wait_1", "wacht 1 seconde", "besturing"),
          debugBlock("vmbo1_step7_turn_left", "draai naar links", "beweging"),
          debugBlock("vmbo1_step8_say_hoi_should_be_klaar", 'zeg "Hoi"', "uiterlijk", { correctReplacementId: "lj1v_say_klaar" }),
        ],
        wrongBlockIds: ["vmbo1_step4_turn_left_should_be_right", "vmbo1_step8_say_hoi_should_be_klaar"],
        blocks: [debugBlock("lj1v_event_start", "bij start", "gebeurtenissen", { isContainer: true }), debugBlock("lj1v_event_touch", "als Bizzy wordt aangeraakt", "gebeurtenissen"), debugBlock("lj1v_event_space", "als spatie wordt ingedrukt", "gebeurtenissen"), debugBlock("lj1v_move_1_forward", "1 stap vooruit", "beweging"), debugBlock("lj1v_move_2_forward_fix", "2 stappen vooruit", "beweging"), debugBlock("lj1v_move_3_forward", "3 stappen vooruit", "beweging"), debugBlock("lj1v_move_1_back", "1 stap achteruit", "beweging"), debugBlock("lj1v_move_2_back", "2 stappen achteruit", "beweging"), debugBlock("lj1v_turn_right_fix", "draai naar rechts", "beweging"), debugBlock("lj1v_turn_left", "draai naar links", "beweging"), debugBlock("lj1v_wait_1", "wacht 1 seconde", "besturing"), debugBlock("lj1v_repeat_2", "herhaal 2 keer", "besturing", { isContainer: true }), debugBlock("lj1v_repeat_3", "herhaal 3 keer", "besturing", { isContainer: true }), debugBlock("lj1v_say_hoi", 'zeg "Hoi"', "uiterlijk"), debugBlock("lj1v_say_klaar", 'zeg "Klaar"', "uiterlijk"), debugBlock("lj1v_say_stop", 'zeg "Stop"', "uiterlijk")],
        correctProgram: ["bij start", "1 stap vooruit", "1 stap vooruit", "draai naar rechts", "1 stap vooruit", "wacht 1 seconde", "draai naar links", 'zeg "Klaar"'],
        debugRepairChecks: [{ id: "turn", description: "positie 4 is draaien naar rechts.", points: 1, blockId: "vmbo1_step4_turn_left_should_be_right", expectedLabel: "draai naar rechts" }, { id: "say", description: 'positie 8 zegt "Klaar".', points: 1, blockId: "vmbo1_step8_say_hoi_should_be_klaar", expectedLabel: 'zeg "Klaar"' }],
        tests: [{ id: "goal", label: "DOEL", expectedOutput: 'START | vooruit | vooruit | rechts | vooruit | wacht | links | Klaar' }],
        playback: { speed: "slow", stepMs: 900 },
        logging: { itemVersion: "pt7-debug-v1" },
        rules: [],
      },
    },
    "lj1-hv": {
      id: "lj1h-pt7-programming-debug-v1",
      title: "PT7 - Blokprogrammeren",
      intro: "Bizzy moet een vierkant lopen. Er zijn 2 fouten in de code. Wijs ze aan, verbeter ze en test.",
      instruction: "Blokprogrammeren",
      config: {
        itemVersion: "pt7-debug-v1",
        device: "bizzy",
        visualGoal: { title: "DOEL", lines: ['herhaal 4 keer: 1 stap vooruit + rechts draaien', 'daarna: zeg "Vierkant"'] },
        initialProgram: [debugBlock("lj1h_start_initial", "bij start", "gebeurtenissen", { isContainer: true }), debugBlock("lj1h_repeat_3_initial", "herhaal 3 keer", "besturing", { isContainer: true, correctReplacementId: "lj1h_repeat_4_fix" }), debugBlock("lj1h_move_1_initial", "1 stap vooruit", "beweging"), debugBlock("lj1h_turn_right_initial", "rechts draaien", "beweging"), debugBlock("lj1h_say_klaar_initial", 'zeg "Klaar"', "uiterlijk", { correctReplacementId: "lj1h_say_vierkant_fix" })],
        wrongBlockIds: ["lj1h_repeat_3_initial", "lj1h_say_klaar_initial"],
        blocks: [debugBlock("lj1h_event_start", "bij start", "gebeurtenissen", { isContainer: true }), debugBlock("lj1h_event_touch", "als Bizzy wordt aangeraakt", "gebeurtenissen"), debugBlock("lj1h_event_space", "als spatie wordt ingedrukt", "gebeurtenissen"), debugBlock("lj1h_repeat_2", "herhaal 2 keer", "besturing", { isContainer: true }), debugBlock("lj1h_repeat_3", "herhaal 3 keer", "besturing", { isContainer: true }), debugBlock("lj1h_repeat_4_fix", "herhaal 4 keer", "besturing", { isContainer: true }), debugBlock("lj1h_repeat_5", "herhaal 5 keer", "besturing", { isContainer: true }), debugBlock("lj1h_wait_1", "wacht 1 seconde", "besturing"), debugBlock("lj1h_move_1", "1 stap vooruit", "beweging"), debugBlock("lj1h_move_2", "2 stappen vooruit", "beweging"), debugBlock("lj1h_move_back", "1 stap achteruit", "beweging"), debugBlock("lj1h_turn_right", "rechts draaien", "beweging"), debugBlock("lj1h_turn_left", "links draaien", "beweging"), debugBlock("lj1h_say_klaar", 'zeg "Klaar"', "uiterlijk"), debugBlock("lj1h_say_vierkant_fix", 'zeg "Vierkant"', "uiterlijk"), debugBlock("lj1h_say_fout", 'zeg "Fout"', "uiterlijk"), debugBlock("lj1h_say_hoi", 'zeg "Hoi"', "uiterlijk")],
        correctProgram: ["bij start", "herhaal 4 keer", "1 stap vooruit", "rechts draaien", 'zeg "Vierkant"'],
        debugRepairChecks: [{ id: "repeat", description: "herhaling hersteld.", points: 1, blockId: "lj1h_repeat_3_initial", expectedLabel: "herhaal 4 keer" }, { id: "message", description: "output hersteld.", points: 1, blockId: "lj1h_say_klaar_initial", expectedLabel: 'zeg "Vierkant"' }],
        tests: [{ id: "goal", label: "Vierkant", expectedOutput: "4x vooruit en rechts | Vierkant" }],
        playback: { speed: "normal", stepMs: 800 },
        logging: { itemVersion: "pt7-debug-v1" },
        rules: [],
      },
    },
    "lj3-vmbo": {
      id: "lj3v-pt7-programming-debug-v1",
      title: "PT7 - Blokprogrammeren",
      intro: "Bij elke klik op A komt er 1 bij. Bij 1 t/m 4: Nog plek. Bij 5 of meer: Vol. Er zijn 2 fouten. Wijs ze aan, verbeter ze en test.",
      instruction: "Blokprogrammeren",
      config: {
        itemVersion: "pt7-debug-v1",
        device: "microbit",
        visualGoal: { title: "DOEL", lines: ["A x4 -> Nog plek", "A x5 -> Vol"] },
        initialProgram: [debugBlock("lj3v_start_initial", "bij start", "gebeurtenissen", { isContainer: true }), debugBlock("lj3v_set_counter_0_initial", "zet teller op 0", "variabelen"), debugBlock("lj3v_button_a_initial", "als knop A wordt ingedrukt", "gebeurtenissen", { isContainer: true }), debugBlock("lj3v_change_counter_by_2_initial", "verander teller met 2", "variabelen", { correctReplacementId: "lj3v_change_counter_by_1_fix" }), debugBlock("lj3v_condition_greater_than_5_initial", "als teller groter dan 5 dan", "voorwaarden", { isContainer: true, correctReplacementId: "lj3v_condition_at_least_5_fix" }), debugBlock("lj3v_say_vol_initial", 'zeg "Vol"', "uiterlijk"), debugBlock("lj3v_else_initial", "anders", "voorwaarden", { isContainer: true }), debugBlock("lj3v_say_nog_plek_initial", 'zeg "Nog plek"', "uiterlijk")],
        wrongBlockIds: ["lj3v_change_counter_by_2_initial", "lj3v_condition_greater_than_5_initial"],
        blocks: [debugBlock("lj3v_event_start", "bij start", "gebeurtenissen", { isContainer: true }), debugBlock("lj3v_event_a", "als knop A wordt ingedrukt", "gebeurtenissen", { isContainer: true }), debugBlock("lj3v_event_b", "als knop B wordt ingedrukt", "gebeurtenissen", { isContainer: true }), debugBlock("lj3v_event_touch", "als Bizzy wordt aangeraakt", "gebeurtenissen"), debugBlock("lj3v_set_counter_0", "zet teller op 0", "variabelen"), debugBlock("lj3v_set_counter_5", "zet teller op 5", "variabelen"), debugBlock("lj3v_change_counter_by_1_fix", "verander teller met 1", "variabelen"), debugBlock("lj3v_change_counter_by_2", "verander teller met 2", "variabelen"), debugBlock("lj3v_change_counter_minus_1", "verander teller met -1", "variabelen"), debugBlock("lj3v_show_counter", "toon teller", "variabelen"), debugBlock("lj3v_condition_gt_5", "als teller groter dan 5 dan", "voorwaarden", { isContainer: true }), debugBlock("lj3v_condition_at_least_5_fix", "als teller 5 of meer is dan", "voorwaarden", { isContainer: true }), debugBlock("lj3v_condition_lt_5", "als teller kleiner dan 5 dan", "voorwaarden", { isContainer: true }), debugBlock("lj3v_condition_eq_5", "als teller gelijk is aan 5 dan", "voorwaarden", { isContainer: true }), debugBlock("lj3v_else", "anders", "voorwaarden", { isContainer: true }), debugBlock("lj3v_say_vol", 'zeg "Vol"', "uiterlijk"), debugBlock("lj3v_say_nog_plek", 'zeg "Nog plek"', "uiterlijk"), debugBlock("lj3v_say_klaar", 'zeg "Klaar"', "uiterlijk"), debugBlock("lj3v_say_leeg", 'zeg "Leeg"', "uiterlijk"), debugBlock("lj3v_say_fout", 'zeg "Fout"', "uiterlijk"), debugBlock("lj3v_wait", "wacht 1 seconde", "besturing"), debugBlock("lj3v_repeat_5", "herhaal 5 keer", "besturing", { isContainer: true }), debugBlock("lj3v_stop", "stop programma", "besturing")],
        correctProgram: ["bij start", "zet teller op 0", "als knop A wordt ingedrukt", "verander teller met 1", "als teller 5 of meer is dan", 'zeg "Vol"', "anders", 'zeg "Nog plek"'],
        debugRepairChecks: [{ id: "counter", description: "tellerwijziging hersteld.", points: 1, blockId: "lj3v_change_counter_by_2_initial", expectedLabel: "verander teller met 1" }, { id: "condition", description: "voorwaarde hersteld.", points: 1, blockId: "lj3v_condition_greater_than_5_initial", expectedLabel: "als teller 5 of meer is dan" }],
        tests: [{ id: "a4", label: "Test A x4", expectedOutput: "Nog plek", inputs: { presses: 4 } }, { id: "a5", label: "Test A x5", expectedOutput: "Vol", inputs: { presses: 5 } }],
        playback: { speed: "normal", stepMs: 800 },
        logging: { itemVersion: "pt7-debug-v1" },
        rules: [],
      },
    },
    "lj3-hv": {
      id: "lj3h-pt7-programming-debug-v1",
      title: "PT7 - Blokprogrammeren",
      intro: "Toon alleen \"Koelen\" als het warm is en het raam open staat. Er zijn 2 fouten in de code. Wijs ze aan, verbeter ze en test.",
      instruction: "Blokprogrammeren",
      config: {
        itemVersion: "pt7-debug-v1",
        device: "sensor",
        visualGoal: { title: "DOEL", lines: ["27 graden + open -> Koelen", "27 graden + dicht -> Oke", "20 graden + open -> Oke", "20 graden + dicht -> Oke"] },
        initialProgram: [debugBlock("lj3h_read_temp_initial", "lees temperatuur", "invoer"), debugBlock("lj3h_read_window_initial", "lees raamOpen", "invoer"), debugBlock("lj3h_condition_or_initial", "als temperatuur > 25 OF raamOpen = ja dan", "voorwaarden", { isContainer: true, correctReplacementId: "lj3h_condition_and_fix" }), debugBlock("lj3h_show_koelen_initial", 'toon "Koelen"', "uiterlijk"), debugBlock("lj3h_else_initial", "anders", "voorwaarden", { isContainer: true }), debugBlock("lj3h_else_show_verwarmen_initial", 'toon "Verwarmen"', "uiterlijk", { correctReplacementId: "lj3h_show_oke_fix" })],
        wrongBlockIds: ["lj3h_condition_or_initial", "lj3h_else_show_verwarmen_initial"],
        blocks: [debugBlock("lj3h_read_temp", "lees temperatuur", "invoer"), debugBlock("lj3h_read_window", "lees raamOpen", "invoer"), debugBlock("lj3h_read_humidity", "lees luchtvochtigheid", "invoer"), debugBlock("lj3h_read_time", "lees tijdstip", "invoer"), debugBlock("lj3h_condition_and_fix", "als temperatuur > 25 EN raamOpen = ja dan", "voorwaarden", { isContainer: true }), debugBlock("lj3h_condition_or", "als temperatuur > 25 OF raamOpen = ja dan", "voorwaarden", { isContainer: true }), debugBlock("lj3h_condition_low_and_open", "als temperatuur < 25 EN raamOpen = ja dan", "voorwaarden", { isContainer: true }), debugBlock("lj3h_condition_warm_closed", "als temperatuur > 25 EN raamOpen = nee dan", "voorwaarden", { isContainer: true }), debugBlock("lj3h_condition_eq_25", "als temperatuur = 25 dan", "voorwaarden", { isContainer: true }), debugBlock("lj3h_else", "anders", "voorwaarden", { isContainer: true }), debugBlock("lj3h_logic_and", "EN", "logica"), debugBlock("lj3h_logic_or", "OF", "logica"), debugBlock("lj3h_logic_not", "NIET", "logica"), debugBlock("lj3h_show_koelen", 'toon "Koelen"', "uiterlijk"), debugBlock("lj3h_show_oke_fix", 'toon "Oké"', "uiterlijk"), debugBlock("lj3h_show_verwarmen", 'toon "Verwarmen"', "uiterlijk"), debugBlock("lj3h_show_alarm", 'toon "Alarm"', "uiterlijk"), debugBlock("lj3h_show_wait", 'toon "Wachten"', "uiterlijk"), debugBlock("lj3h_wait_10", "wacht 10 seconden", "besturing"), debugBlock("lj3h_repeat_while", "herhaal zolang", "besturing", { isContainer: true }), debugBlock("lj3h_stop", "stop programma", "besturing")],
        correctProgram: ["lees temperatuur", "lees raamOpen", "als temperatuur > 25 EN raamOpen = ja dan", 'toon "Koelen"', "anders", 'toon "Oké"'],
        debugRepairChecks: [{ id: "logic", description: "EN/OF-logica hersteld.", points: 1, blockId: "lj3h_condition_or_initial", expectedLabel: "als temperatuur > 25 EN raamOpen = ja dan" }, { id: "else", description: "anders-uitkomst hersteld.", points: 1, blockId: "lj3h_else_show_verwarmen_initial", expectedLabel: 'toon "Oké"' }],
        tests: [{ id: "warm-open", label: "Test 1: 27 graden + raam open", expectedOutput: "Koelen", inputs: { temperature: 27, windowOpen: true } }, { id: "warm-closed", label: "Test 2: 27 graden + raam dicht", expectedOutput: "Oké", inputs: { temperature: 27, windowOpen: false } }, { id: "cold-open", label: "Test 3: 20 graden + raam open", expectedOutput: "Oké", inputs: { temperature: 20, windowOpen: true } }, { id: "cold-closed", label: "Test 4: 20 graden + raam dicht", expectedOutput: "Oké", inputs: { temperature: 20, windowOpen: false } }],
        playback: { speed: "normal", stepMs: 800 },
        logging: { itemVersion: "pt7-debug-v1" },
        rules: [],
      },
    },
  };
  return specs[versionId];
};

// PT9 maaktaak (22A, anker, 3 pt): digitaal product opbouwen volgens ontwerpeisen.
// Twee parallelvormen per niveau-lijn: "slide" (nulmeting) en "poster" (voortgangsmeting).
// Doelgroep-eis zit verweven in de titel- en beeldopties (foute optie past niet bij doelgroep).
const v3Pt9 = (
  versionId: AssessmentVersionId,
  form: "slide" | "poster" = "slide",
): Pt9Spec => {
  const line = versionId.endsWith("vmbo") ? "vmbo" : "hv";

  const rules = (prefix: string): PowerPointTaskConfig["rules"] => [
    { id: "title", description: "kiest een titel die kort en duidelijk is en past bij de doelgroep.", points: 1, groupId: "title", correctOptionIds: [`${prefix}-title-correct`] },
    { id: "image", description: "kiest een beeld dat past bij het doel en gebruikt mag worden.", points: 1, groupId: "image", correctOptionIds: [`${prefix}-image-correct`] },
    { id: "source", description: "vermeldt de bron van gebruikt beeldmateriaal correct.", points: 1, groupId: "source", correctOptionIds: [`${prefix}-source-correct`] },
  ];
  const opts = (prefix: string, group: string, labels: [string, string, string, string]): Option[] =>
    labels.map((label, index) => ({
      id: index === 0 ? `${prefix}-${group}-correct` : `${prefix}-${group}-d${index}`,
      label,
    }));

  const variants: Record<"vmbo" | "hv", Record<"slide" | "poster", Pt9Spec>> = {
    vmbo: {
      slide: {
        id: "pt9-vmbo-maaktaak-slide-v1",
        title: "PT9 - Eén dia maken",
        instruction:
          "Je maakt één dia voor een korte presentatie aan je klas over het schoolfeest. Kies bij elke stap wat het beste past bij de ontwerpeisen: een duidelijke titel voor je klasgenoten, een passend beeld dat je mag gebruiken en een juiste bronvermelding.",
        itemVersion: "pt9-maaktaak-slide-v1",
        config: {
          format: "slide",
          scenario: "Bouw je dia op. Kies per onderdeel de beste optie. Rechts zie je je dia groeien.",
          groups: [
            { id: "title", title: "Stap 1: kies de titel", options: opts("p9vs", "title", ["Schoolfeest 12 juni: doe je mee?", "Mededeling betreffende de aanstaande festiviteit", "FEEST!!!", "Op 12 juni organiseert de feestcommissie een groot feest in de aula van onze school"]) },
            { id: "image", title: "Stap 2: kies het beeld", options: opts("p9vs", "image", ["Eigen foto van de versierde aula van vorig jaar", "Foto van een fotograaf met watermerk, zonder toestemming", "Grappig plaatje van een kat", "Acht verschillende plaatjes door elkaar"]) },
            { id: "source", title: "Stap 3: je gebruikt ook een plaatje van een gratis fotosite. Wat zet je erbij?", options: opts("p9vs", "source", ["De naam van de maker en de site", "Niets: gratis plaatjes mag je zonder naam gebruiken", "Alleen het woord 'internet'", "Je eigen naam"]) },
          ],
          rules: rules("p9vs"),
        },
      },
      poster: {
        id: "pt9-vmbo-maaktaak-poster-v1",
        title: "PT9 - Een poster maken",
        instruction:
          "Je maakt een poster voor in de gang van school over de sportdag. Kies bij elke stap wat het beste past bij de ontwerpeisen: een duidelijke titel voor leerlingen, een passend beeld dat je mag gebruiken en een juiste bronvermelding.",
        itemVersion: "pt9-maaktaak-poster-v1",
        config: {
          format: "poster",
          scenario: "Bouw je poster op. Kies per onderdeel de beste optie. Rechts zie je je poster groeien.",
          groups: [
            { id: "title", title: "Stap 1: kies de titel", options: opts("p9vp", "title", ["Sportdag vrijdag 22 mei: doe mee!", "Aankondiging inzake de sportieve activiteitendag", "SPORT!!!", "Op vrijdag 22 mei is er voor alle klassen een hele dag sport op het veld achter de school"]) },
            { id: "image", title: "Stap 2: kies het beeld", options: opts("p9vp", "image", ["Eigen foto van de sportdag van vorig jaar", "Foto met watermerk van een sportfotograaf, zonder toestemming", "Plaatje van een beroemde voetballer uit een tijdschrift", "Tien kleine plaatjes door elkaar"]) },
            { id: "source", title: "Stap 3: je gebruikt ook een plaatje van een gratis fotosite. Wat zet je erbij?", options: opts("p9vp", "source", ["De naam van de maker en de site", "Niets: gratis plaatjes mag je zonder naam gebruiken", "Alleen het woord 'internet'", "De naam van je school"]) },
          ],
          rules: rules("p9vp"),
        },
      },
    },
    hv: {
      slide: {
        id: "pt9-hv-maaktaak-slide-v1",
        title: "PT9 - Eén dia maken",
        instruction:
          "Je maakt één dia voor een presentatie op de open avond van school. Het publiek bestaat uit ouders en nieuwe leerlingen. Kies bij elke stap wat het beste past bij de ontwerpeisen: een titel die past bij dit publiek, een passend beeld dat je mag gebruiken en een juiste bronvermelding.",
        itemVersion: "pt9-maaktaak-slide-v1",
        config: {
          format: "slide",
          scenario: "Bouw je dia op. Kies per onderdeel de beste optie. Rechts zie je je dia groeien.",
          groups: [
            { id: "title", title: "Stap 1: kies de titel", options: opts("p9hs", "title", ["Welkom op onze school: dit ga je meemaken", "Yo nieuwe brugpiepers, check dit", "Informatie", "Op deze avond vertellen wij u uitgebreid over alle vakken, activiteiten en regels van onze school"]) },
            { id: "image", title: "Stap 2: kies het beeld", options: opts("p9hs", "image", ["Eigen foto van leerlingen tijdens de projectweek, met hun toestemming", "Professionele foto met watermerk van een fotobureau", "Meme die alleen leerlingen snappen", "Zeven verschillende plaatjes door elkaar"]) },
            { id: "source", title: "Stap 3: je gebruikt ook een afbeelding met een vrije licentie. Wat zet je erbij?", options: opts("p9hs", "source", ["De naam van de maker en de licentie (bijvoorbeeld Creative Commons)", "Niets: wat online staat is rechtenvrij", "Alleen 'bron: Google'", "De naam van je school"]) },
          ],
          rules: rules("p9hs"),
        },
      },
      poster: {
        id: "pt9-hv-maaktaak-poster-v1",
        title: "PT9 - Een poster maken",
        instruction:
          "Je maakt een poster voor de aula over de debatavond van school. De poster is voor leerlingen én ouders. Kies bij elke stap wat het beste past bij de ontwerpeisen: een titel die past bij dit publiek, een passend beeld dat je mag gebruiken en een juiste bronvermelding.",
        itemVersion: "pt9-maaktaak-poster-v1",
        config: {
          format: "poster",
          scenario: "Bouw je poster op. Kies per onderdeel de beste optie. Rechts zie je je poster groeien.",
          groups: [
            { id: "title", title: "Stap 1: kies de titel", options: opts("p9hp", "title", ["Debatavond 5 maart: praat en denk mee", "Effe chillen en bekvechten in de aula lol", "Avond", "Op 5 maart organiseert de debatclub in samenwerking met de sectie maatschappijleer een avond vol discussie"]) },
            { id: "image", title: "Stap 2: kies het beeld", options: opts("p9hp", "image", ["Eigen foto van de debatclub in actie, met toestemming van de leden", "Foto met watermerk van een persbureau", "Meme die alleen leerlingen snappen", "Negen kleine plaatjes door elkaar"]) },
            { id: "source", title: "Stap 3: je gebruikt ook een afbeelding met een vrije licentie. Wat zet je erbij?", options: opts("p9hp", "source", ["De naam van de maker en de licentie (bijvoorbeeld Creative Commons)", "Niets: wat online staat is rechtenvrij", "Alleen 'bron: Google'", "De naam van je school"]) },
          ],
          rules: rules("p9hp"),
        },
      },
    },
  };

  return variants[line][form];
};

const withV3PerformanceTasks = (
  spec: VersionSpec,
  moment: MeasurementMoment = "nulmeting",
): VersionSpec => {
  const files: Record<AssessmentVersionId, FileTaskSpec> = {
    "lj1-vmbo": {
      id: "lj1v-pt1-files",
      title: "PT1 - Bestanden en mappen beheren",
      instruction:
        "Kun jij je bestanden netjes ordenen? Voer de taken hieronder uit en klik daarna op 'Volgende'.\nWerk in OneDrive. Maak daarin de map Biologie.\nVerplaats de drie projectbestanden naar Biologie.\nHernoem concept_dieren.docx naar project_dieren_verslag.docx.",
      startFolders: [
        "Thuis/OneDrive/Engels",
        "Thuis/OneDrive/Maatschappij",
        "Thuis/OneDrive/Mentorles",
        "Thuis/OneDrive/Nederlands",
        "Thuis/OneDrive/Wiskunde",
      ],
      startFiles: ["Thuis/OneDrive/concept_dieren.docx", "Thuis/OneDrive/foto_kat.jpg", "Thuis/OneDrive/bron_dieren.pdf"],
      tasks: [
        { id: "main", description: "map Biologie correct.", expectedPath: "Thuis/OneDrive/Biologie", points: 1 },
        { id: "files", description: "projectbestanden correct geplaatst.", expectedPaths: ["Thuis/OneDrive/Biologie/bron_dieren.pdf", "Thuis/OneDrive/Biologie/foto_kat.jpg"], points: 1 },
        { id: "rename", description: "verslag correct hernoemd en geplaatst.", expectedPath: "Thuis/OneDrive/Biologie/project_dieren_verslag.docx", forbiddenPaths: ["Thuis/OneDrive/concept_dieren.docx", "Thuis/OneDrive/Biologie/concept_dieren.docx"], points: 1 },
      ],
    },
    "lj1-hv": {
      id: "lj1h-pt1-files",
      title: "PT1 - Bestanden en mappen beheren",
      instruction: `${v3FileInstruction}\nWerk in OneDrive. Maak de hoofdmap Project Water. Maak daarin Bronnen, Afbeeldingen en Verslag. Verplaats de vier bestanden naar de juiste map. Hernoem concept_verslag.docx naar project_water_verslag.docx en presentatie_water.pptx naar project_water_presentatie.pptx.`,
      startFolders: ["Thuis/OneDrive"],
      startFiles: ["Thuis/OneDrive/bron_water.pdf", "Thuis/OneDrive/waterfoto.png", "Thuis/OneDrive/concept_verslag.docx", "Thuis/OneDrive/presentatie_water.pptx"],
      tasks: [
        { id: "subfolders", description: "hoofdmap en submappen correct.", expectedPaths: ["Thuis/OneDrive/Project Water/Bronnen", "Thuis/OneDrive/Project Water/Afbeeldingen", "Thuis/OneDrive/Project Water/Verslag"], points: 1 },
        { id: "placed", description: "bestanden per type correct geplaatst.", expectedPaths: ["Thuis/OneDrive/Project Water/Bronnen/bron_water.pdf", "Thuis/OneDrive/Project Water/Afbeeldingen/waterfoto.png"], points: 1 },
        { id: "rename", description: "twee bestanden correct hernoemd en geplaatst.", expectedPaths: ["Thuis/OneDrive/Project Water/Verslag/project_water_verslag.docx", "Thuis/OneDrive/Project Water/Verslag/project_water_presentatie.pptx"], forbiddenPaths: ["Thuis/OneDrive/concept_verslag.docx", "Thuis/OneDrive/presentatie_water.pptx"], points: 1 },
      ],
    },
    "lj3-vmbo": {
      id: "lj3v-pt1-files",
      title: "PT1 - Bestanden en mappen beheren",
      instruction: `${v3FileInstruction}\nWerk in OneDrive in de map Stageproject. Maak de mappen Actueel en Oud. Zet de nieuwste versie van het stageverslag in Actueel, zet oudere versies in Oud en hernoem stageverslag_v3.docx naar stageverslag_2026_definitief.docx.`,
      startFolders: ["Thuis/OneDrive/Stageproject"],
      startFiles: ["Thuis/OneDrive/Stageproject/stageverslag_v1.docx", "Thuis/OneDrive/Stageproject/stageverslag_v2.docx", "Thuis/OneDrive/Stageproject/stageverslag_v3.docx", "Thuis/OneDrive/Stageproject/foto_stage.jpg"],
      tasks: [
        { id: "folders", description: "mappen Actueel en Oud correct.", expectedPaths: ["Thuis/OneDrive/Stageproject/Actueel", "Thuis/OneDrive/Stageproject/Oud"], points: 1 },
        { id: "archive", description: "oudere versies correct gearchiveerd.", expectedPaths: ["Thuis/OneDrive/Stageproject/Oud/stageverslag_v1.docx", "Thuis/OneDrive/Stageproject/Oud/stageverslag_v2.docx"], points: 1 },
        { id: "name", description: "nieuwste versie herkend, hernoemd en correct geplaatst.", expectedPath: "Thuis/OneDrive/Stageproject/Actueel/stageverslag_2026_definitief.docx", forbiddenPaths: ["Thuis/OneDrive/Stageproject/stageverslag_v3.docx"], points: 1 },
      ],
    },
    "lj3-hv": {
      id: "lj3h-pt1-files",
      title: "PT1 - Bestanden en mappen beheren",
      instruction: `${v3FileInstruction}\nWerk in OneDrive in Project Onderzoek. Maak daarin de mappen Data, Bronnen, Beelden en Archief. Plaats bestanden op basis van type en versie. Zet alleen de definitieve versie in Project Onderzoek en archiveer de oude versie.`,
      startFolders: ["Thuis/OneDrive/Project Onderzoek"],
      startFiles: ["Thuis/OneDrive/Project Onderzoek/onderzoek_v1.docx", "Thuis/OneDrive/Project Onderzoek/onderzoek_definitief.docx", "Thuis/OneDrive/Project Onderzoek/resultaten.csv", "Thuis/OneDrive/Project Onderzoek/bron_artikel.pdf", "Thuis/OneDrive/Project Onderzoek/grafiek.png"],
      tasks: [
        { id: "types", description: "mapstructuur correct; data, bron en beeld correct geplaatst.", expectedPaths: ["Thuis/OneDrive/Project Onderzoek/Data/resultaten.csv", "Thuis/OneDrive/Project Onderzoek/Bronnen/bron_artikel.pdf", "Thuis/OneDrive/Project Onderzoek/Beelden/grafiek.png"], points: 1 },
        { id: "versions", description: "oude versie correct gearchiveerd.", expectedPath: "Thuis/OneDrive/Project Onderzoek/Archief/onderzoek_v1.docx", points: 1 },
        { id: "final", description: "definitieve versie in hoofdmap behouden.", expectedPath: "Thuis/OneDrive/Project Onderzoek/onderzoek_definitief.docx", forbiddenPaths: ["Thuis/OneDrive/Project Onderzoek/Archief/onderzoek_definitief.docx"], points: 1 },
      ],
    },
  };

  const mail: Record<AssessmentVersionId, MailTaskSpec> = {
    "lj1-vmbo": {
      id: "lj1v-pt2-mail",
      title: "E-mail opstellen",
      instruction:
        "Stuur een verslag van Nederlands via e-mail naar je mentor.\n1. Kies de juiste ontvanger in het juiste veld.\n2. Gebruik het juiste onderwerp: Verslag Nederlands.\n3. Voeg de juiste bijlage toe.\n4. Verzend de e-mail.",
      kerndoel: "21A",
      config: v3MailConfig({
        to: "mentor@school.nl",
        subject: "Verslag Nederlands",
        files: ["Aantekeningen.docx", "Foto_vakantie.jpg", "Rooster.pdf", "Verslag_Nederlands.docx"],
        requiredAttachment: "Verslag_Nederlands.docx",
      }),
    },
    "lj1-hv": {
      id: "lj1h-pt2-mail",
      title: "E-mail opstellen",
      instruction:
        "Stuur een verslag van Nederlands via e-mail naar je mentor.\n1. Kies de juiste ontvanger in het juiste veld.\n2. Gebruik het juiste onderwerp: Project Water verslag.\n3. Voeg de juiste bijlage toe.\n4. Verzend de e-mail.",
      kerndoel: "21A",
      config: v3MailConfig({
        to: "mentor@school.nl",
        subject: "Project Water verslag",
        files: ["Bron_water.pdf", "Foto_projectdag.jpg", "Project_Water_verslag.docx", "Rooster.pdf"],
        requiredAttachment: "Project_Water_verslag.docx",
      }),
    },
    "lj3-vmbo": {
      id: "lj3v-pt2-mail",
      title: "E-mail opstellen",
      instruction:
        "Stuur een e-mail aan je stagebegeleider.\n1. Kies de stagebegeleider als ontvanger in Aan.\n2. Zet je mentor in Cc en gebruik geen Bcc.\n3. Gebruik het juiste onderwerp: Stageverslag definitieve versie.\n4. Voeg de juiste bijlage toe.\n5. Verzend de e-mail.",
      kerndoel: "21A",
      config: v3MailConfig({
        to: "stagebegeleider@bedrijf.nl",
        cc: ["mentor@school.nl"],
        forbiddenBcc: true,
        subject: "Stageverslag definitieve versie",
        files: ["Beoordeling_stage.pdf", "Planning_stage.xlsx", "Stageverslag_v2.docx", "Stageverslag_v3_definitief.docx"],
        requiredAttachment: "Stageverslag_v3_definitief.docx",
      }),
    },
    "lj3-hv": {
      id: "lj3h-pt2-mail",
      title: "E-mail opstellen",
      instruction:
        "Stuur een projectmail naar je docent.\n1. Kies de docent als ontvanger in Aan.\n2. Zet beide groepsgenoten in Cc.\n3. Gebruik het juiste onderwerp: Definitief onderzoeksverslag.\n4. Voeg alleen de juiste bijlage toe.\n5. Verzend de e-mail.",
      kerndoel: "21A",
      config: v3MailConfig({
        to: "docent@school.nl",
        cc: ["groepsgenoot1@school.nl", "groepsgenoot2@school.nl"],
        subject: "Definitief onderzoeksverslag",
        files: ["Bronnenlijst.pdf", "Onderzoeksverslag_definitief.pdf", "Onderzoeksverslag_oud.pdf", "Resultaten.xlsx"],
        requiredAttachment: "Onderzoeksverslag_definitief.pdf",
        forbiddenAttachments: ["Bronnenlijst.pdf", "Onderzoeksverslag_oud.pdf", "Resultaten.xlsx"],
      }),
    },
  };

  return {
    ...spec,
    pt1: files[spec.id],
    pt2: mail[spec.id],
    pt3: v3Pt3(spec.id),
    pt6: v3Pt6(`${spec.id.replace("-", "").replace("lj", "lj")}-pt6-screen-share`),
    pt7: v3Pt7Debug(spec.id),
    pt8: v3Pt8(spec.id),
    // Parallelvormen per meetmoment: nulmeting = PowerPoint-vorm,
    // voortgangsmeting = postervorm (matrijsbesluit 10-06-2026).
    pt9: v3Pt9(spec.id, moment === "voortgangsmeting" ? "poster" : "slide"),
  };
};

const buildAssessmentsForMoment = (moment: MeasurementMoment): AssessmentVersion[] =>
  versionSpecs
    .map((spec) => withV3PerformanceTasks(spec, moment))
    .map((spec) => buildAssessment(spec, moment));

const toAssessmentMap = (list: AssessmentVersion[]): Record<AssessmentVersionId, AssessmentVersion> =>
  list.reduce(
    (map, assessment) => ({
      ...map,
      [assessment.id]: assessment,
    }),
    {} as Record<AssessmentVersionId, AssessmentVersion>,
  );

export const assessments: AssessmentVersion[] = buildAssessmentsForMoment("nulmeting");

export const voortgangsAssessments: AssessmentVersion[] =
  buildAssessmentsForMoment("voortgangsmeting");

export const assessmentMap: Record<AssessmentVersionId, AssessmentVersion> =
  toAssessmentMap(assessments);

export const voortgangsAssessmentMap: Record<AssessmentVersionId, AssessmentVersion> =
  toAssessmentMap(voortgangsAssessments);

export const assessmentMapForMoment = (
  moment: MeasurementMoment | undefined,
): Record<AssessmentVersionId, AssessmentVersion> =>
  moment === "voortgangsmeting" ? voortgangsAssessmentMap : assessmentMap;

export const defaultCodeMappings: CodeMapping[] = [
  { codes: ["vmbo1", "6663", "testvmbo1"], instrumentId: "lj1-vmbo", label: "Leerjaar 1 VMBO" },
  { codes: ["hv1", "testhv1"], instrumentId: "lj1-hv", label: "Leerjaar 1 HAVO/VWO" },
  { codes: ["vmbo3", "vmbo 3", "testvmbo3"], instrumentId: "lj3-vmbo", label: "Leerjaar 3 VMBO" },
  { codes: ["hv3", "testhv3"], instrumentId: "lj3-hv", label: "Leerjaar 3 HAVO/VWO" },
];
