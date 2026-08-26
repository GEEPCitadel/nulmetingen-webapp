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
  MockupCard,
  Option,
  ProgrammingBlockDefinition,
  Pt1Node,
  Pt1Simulation,
  SpreadsheetSimulationConfig,
  TeamsTaskConfig,
  ThemeDefinition,
  WhutsuppFlow,
  WhutsuppVariant,
} from "../types";
import selectedResponseSource from "../../nulmetingen_selected_response_herontwerp_v3.json";
import assessmentBuildMetaSource from "./assessment-build-meta.json";
import whutsuppPt8FlowSource from "./whutsupp_pt8_flow.json";
import { teddyWorlds } from "./pt7-teddy";

export const ADMIN_CODE = "beheer";

export const themes: Record<string, ThemeDefinition> = {
  /* P4 — Lime · Teal · Cyan · Cream (logo 4) — LJ1 VMBO */
  limeTeal: {
    key: "limeTeal",
    palette: "p4",
    label: "Lime, turquoise en cyaan",
    primary: "#C7D400",
    secondary: "#009991",
    tertiary: "#63C2C7",
    panel: "#EFF5C2",
    ribbon: "/brand/shapes/slinger-4.png",
    accent: "#009991",
    logo: "/brand/logos/citadel-logo-4-fc.png",
  },
  /* P3 — Sky · Yellow · Orange (logo 3) — LJ1 HAVO/VWO */
  skyOrange: {
    key: "skyOrange",
    palette: "p3",
    label: "Sky, geel en oranje",
    primary: "#91D4ED",
    secondary: "#FFED00",
    tertiary: "#E88500",
    panel: "#D9F0F9",
    ribbon: "/brand/shapes/slinger-3.png",
    accent: "#E88500",
    logo: "/brand/logos/citadel-logo-3-fc.png",
  },
  /* P2 — Mint · Pink · Red (logo 2) — LJ3 VMBO */
  mintPink: {
    key: "mintPink",
    palette: "p2",
    label: "Mint, pink en rood",
    primary: "#8AC9B5",
    secondary: "#E85287",
    tertiary: "#E30521",
    panel: "#D6ECE3",
    ribbon: "/brand/shapes/slinger-2.png",
    accent: "#E85287",
    logo: "/brand/logos/citadel-logo-2-fc.png",
  },
  /* P5 — Rose · Blue · Navy · Cyan (logo 5) — LJ3 HAVO/VWO
     Replaces the old "sandCoral" which used a non-brand #EF735C coral. */
  roseNavy: {
    key: "roseNavy",
    palette: "p5",
    label: "Rose, blauw en navy",
    primary: "#F7D1D6",
    secondary: "#0075BA",
    tertiary: "#0D4580",
    panel: "#FCE5E9",
    ribbon: "/brand/shapes/slinger-1.png",
    accent: "#0075BA",
    logo: "/brand/logos/citadel-logo-5-fc.png",
  },
  /* P1 — Rainbow on cream (logo 1) — entry / admin / fallback */
  rainbowCream: {
    key: "rainbowCream",
    palette: "p1",
    label: "Cream, geel, magenta en paars",
    primary: "#DED4BA",
    secondary: "#E51C73",
    tertiary: "#662482",
    panel: "#DED4BA",
    ribbon: "/brand/shapes/slinger-0.png",
    accent: "#E51C73",
    logo: "/brand/logos/citadel-logo-1-fc.png",
  },
};

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
  sr: SelectedResponseSpec[];
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
  questions?: Array<{ id: string; prompt: string; answer: string; points: number }>;
  simulation?: SpreadsheetSimulationConfig;
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
  legacyItemIds?: string[];
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
  sortTask?: {
    cards: SelectedResponseOptionSpec[];
    categories: SelectedResponseOptionSpec[];
    correctMatches: Record<string, string>;
    pointsPerCard: number;
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
    }
  | {
      kind: "comparison-bar-chart";
      title: string;
      unit: string;
      maxValue: number;
      bars: Array<{
        id: string;
        label: string;
        value: number;
        detail?: string;
      }>;
    };

type SelectedResponseJsonItem = {
  id: string;
  legacyItemIds?: string[];
  replaces?: string;
  title: string;
  target?: AssessmentVersionId;
  targetGroup?: AssessmentVersionId;
  variantFor?: AssessmentVersionId;
  kerndoel?: number | string;
  subgoal: string;
  type?: "single" | "multiple" | "single_choice" | "multiple_choice";
  maxScore?: number;
  itemType?: "single-choice" | "multiple-select" | "compound-single-choice" | "binary-card-sort";
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
    aiUsageMockup?: {
      toolName: string;
      prompt: string;
      response: string;
    };
    trainingDataMockup?: {
      platformName: string;
      requirement: string;
      notRequired: string;
      historicalRows: Array<{
        id: string;
        projectScore: number;
        codingClub: boolean;
        selected: boolean;
      }>;
      candidate: {
        id: string;
        projectScore: number;
        codingClub: boolean;
        aiDecision: string;
      };
    };
  };
  primarySubgoal?: string;
  itemVersion?: string;
  learnerQuestionNumber?: number;
  internalSlot?: string;
  archivedFrom?: string;
  subQuestions?: SelectedResponseJsonSubQuestion[];
  sortTask?: {
    cards: Array<{
      id: string;
      text: string;
      correctCategory: string;
      errorCategory?: string;
    }>;
    categories: Array<{
      id: string;
      text: string;
    }>;
  };
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
    maxPoints?: number;
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
};

const UNKNOWN_OPTION_LABEL = "Ik weet het niet.";
const whutsuppPt8Flow = whutsuppPt8FlowSource as WhutsuppFlow;
const normalizeStudentFacingText = (text: string) => text.replace(/\bWhutsupp\b/gi, "WhatsApp");

const whutsuppVariantFor = (versionId: AssessmentVersionId): WhutsuppVariant => {
  const variant = whutsuppPt8Flow.variants.find(
    (candidate) => candidate.assessmentId === versionId,
  );
  if (!variant) {
    throw new Error(`Geen Whutsupp PT8-variant gevonden voor ${versionId}.`);
  }
  return variant;
};

export const sloLabels: Record<string, string> = {
  "21": "De leerling zet digitale technologie en digitale media in.",
  "21A": "De leerling zet digitale systemen functioneel in.",
  "21B":
    "De leerling navigeert doelgericht in het digitale media- en informatielandschap voor het verwerven en verwerken van informatie.",
  "21C": "De leerling verkent het gebruik van data en dataverwerking.",
  "21D": "De leerling verkent mogelijkheden en beperkingen van AI.",
  "22": "De leerling creëert digitale producten.",
  "22A":
    "De leerling gebruikt passende werkwijzen bij het creëren en gebruiken van verschillende typen digitale producten.",
  "22B":
    "De leerling programmeert een computerprogramma met behulp van computationele denkstrategieën.",
  "23": "De leerling participeert in de gedigitaliseerde wereld.",
  "23A":
    "De leerling gaat veilig om met digitale systemen, data en de privacy van zichzelf en anderen.",
  "23B":
    "De leerling maakt weloverwogen keuzes bij het gebruik van digitale technologie en digitale media.",
  "23C":
    "De leerling analyseert hoe digitale technologie, digitale media en de samenleving elkaar wederzijds beïnvloeden.",
};

const selectedResponseJson = selectedResponseSource as SelectedResponseJson;

const optionId = (prefix: string, index: number) => `${prefix}-${index + 1}`;

const makeOptions = (prefix: string, labels: string[]): Option[] =>
  labels.map((label, index) => ({ id: optionId(prefix, index), label }));

const makeSelectedResponseOptions = (options: SelectedResponseOptionSpec[]): Option[] =>
  options.map((option) => ({
    id: option.id,
    label: normalizeStudentFacingText(option.label),
    description: option.description ? normalizeStudentFacingText(option.description) : undefined,
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

const selectedResponseItemsFor = (versionId: AssessmentVersionId): SelectedResponseJsonItem[] => {
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

  if (stimulus.kind === "comparison-bar-chart") {
    return {
      badge: "Grafiek",
      title: stimulus.title,
      content: [],
      comparisonChart: {
        unit: stimulus.unit,
        maxValue: stimulus.maxValue,
        bars: stimulus.bars,
      },
      mediaHint: "Vergelijkende staafgrafiek",
    };
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
  if (context?.aiUsageMockup) {
    return {
      badge: "AI-hulp",
      title: normalizeStudentFacingText(context.aiUsageMockup.toolName),
      content: [
        normalizeStudentFacingText(context.aiUsageMockup.prompt),
        normalizeStudentFacingText(context.aiUsageMockup.response),
      ],
      aiUsage: {
        toolName: normalizeStudentFacingText(context.aiUsageMockup.toolName),
        prompt: normalizeStudentFacingText(context.aiUsageMockup.prompt),
        response: normalizeStudentFacingText(context.aiUsageMockup.response),
      },
      mediaHint: "Niet-interactieve AI-gebruiksmock-up",
    };
  }

  if (context?.trainingDataMockup) {
    return {
      badge: "Trainingsgegevens",
      title: normalizeStudentFacingText(context.trainingDataMockup.platformName),
      content: [
        context.trainingDataMockup.requirement,
        context.trainingDataMockup.notRequired,
        context.trainingDataMockup.candidate.aiDecision,
      ].map(normalizeStudentFacingText),
      trainingData: {
        ...context.trainingDataMockup,
        platformName: normalizeStudentFacingText(context.trainingDataMockup.platformName),
        requirement: normalizeStudentFacingText(context.trainingDataMockup.requirement),
        notRequired: normalizeStudentFacingText(context.trainingDataMockup.notRequired),
        candidate: {
          ...context.trainingDataMockup.candidate,
          aiDecision: normalizeStudentFacingText(context.trainingDataMockup.candidate.aiDecision),
        },
      },
      mediaHint: "Niet-interactief trainingsdatadashboard",
    };
  }

  if (context?.chatMockup) {
    return {
      badge: "AI-chat",
      title: normalizeStudentFacingText(context.chatMockup.toolName),
      content: context.chatMockup.messages.map((message) => normalizeStudentFacingText(message.text)),
      chatMessages: context.chatMockup.messages.map((message) => ({
        ...message,
        text: normalizeStudentFacingText(message.text),
      })),
      mediaHint: "Niet-interactieve AI-chatmock-up",
    };
  }

  if (!context?.chatMessage) {
    return undefined;
  }

  return {
    badge: "Groepsapp",
    title: normalizeStudentFacingText(context.chatMessage.sender),
    content: [normalizeStudentFacingText(context.chatMessage.text)],
    mediaHint: "Contextbericht",
  };
};

const getSelectedResponseSpecs = (versionId: AssessmentVersionId): SelectedResponseSpec[] => {
  const sourceItems = selectedResponseItemsFor(versionId);

  if (sourceItems.length !== 10) {
    throw new Error(`${versionId} heeft niet precies 10 selected-response-items.`);
  }

  return sourceItems.map((item) => {
    if (item.itemType === "binary-card-sort" && item.sortTask) {
      const cards = item.sortTask.cards.map((card) => ({
        id: card.id,
        label: normalizeStudentFacingText(card.text),
        errorCategory: card.errorCategory,
      }));
      const categories = item.sortTask.categories.map((category) => ({
        id: category.id,
        label: normalizeStudentFacingText(category.text),
      }));
      const categoryIds = new Set(categories.map((category) => category.id));
      const correctMatches = Object.fromEntries(
        item.sortTask.cards.map((card) => {
          if (!categoryIds.has(card.correctCategory)) {
            throw new Error(`Onbekende sorteercategorie voor ${item.id}:${card.id}.`);
          }
          return [card.id, card.correctCategory];
        }),
      );
      const maxPoints = Number(item.scoring?.maxPoints ?? item.scoring?.maxScore ?? 2);

      return {
        id: item.id,
        legacyItemIds: item.legacyItemIds,
        title: normalizeStudentFacingText(item.title),
        kerndoel: rootGoalFrom(item.kerndoel ?? item.primarySubgoal ?? item.subgoal),
        subgoal: subgoalCodeFrom(item.primarySubgoal ?? item.subgoal),
        primarySubgoal: item.primarySubgoal ?? subgoalCodeFrom(item.subgoal),
        itemVersion: item.itemVersion,
        learnerQuestionNumber: item.learnerQuestionNumber,
        internalSlot: item.internalSlot,
        question: normalizeStudentFacingText(item.question),
        mockup: mockupForContext(item.context),
        sortTask: {
          cards,
          categories,
          correctMatches,
          pointsPerCard: maxPoints / Math.max(cards.length, 1),
        },
        aiSnelVeranderendFlag: item.aiSnelVeranderendFlag,
        anchorStatus: item.anchorStatus,
        sourceStatus: item.sourceStatus,
        pilotReviewStatus: item.pilotReviewStatus,
        validityNote: item.validityNote,
      };
    }

    if (item.itemType === "compound-single-choice" && item.subQuestions?.length) {
      const compoundGroups = item.subQuestions.map((subQuestion) => {
        const correctAnswerId = String(
          subQuestion.correctAnswer ??
            subQuestion.options.find((option) => option.correct === true || option.isCorrect === true)?.id ??
            "",
        );
        const options = subQuestion.options.map((option) => ({
          id: String(option.optionId ?? option.id ?? option.text),
          label: normalizeStudentFacingText(normalizeUnknownLabel(option.label ?? option.text)),
          errorCategory: option.errorCategory,
          description:
            option.label && normalizeUnknownLabel(option.label) !== normalizeUnknownLabel(option.text)
              ? normalizeStudentFacingText(option.text)
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
          title: normalizeStudentFacingText(subQuestion.title ?? subQuestion.id),
          question: normalizeStudentFacingText(subQuestion.question),
          options,
          correctOptionId: correctAnswerId,
          points: Number(subQuestion.scoring?.maxPoints ?? 0.5),
        };
      });

      return {
        id: item.id,
        legacyItemIds: item.legacyItemIds,
        title: normalizeStudentFacingText(item.title),
        kerndoel: rootGoalFrom(item.kerndoel ?? item.primarySubgoal ?? item.subgoal),
        subgoal: subgoalCodeFrom(item.primarySubgoal ?? item.subgoal),
        primarySubgoal: item.primarySubgoal ?? subgoalCodeFrom(item.subgoal),
        itemVersion: item.itemVersion,
        learnerQuestionNumber: item.learnerQuestionNumber,
        internalSlot: item.internalSlot,
        question: normalizeStudentFacingText(item.question),
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
          label: normalizeStudentFacingText(normalizeUnknownLabel(option.label ?? option.text)),
          description:
            option.label && normalizeUnknownLabel(option.label) !== normalizeUnknownLabel(option.text)
              ? normalizeStudentFacingText(option.text)
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
          ? normalizeStudentFacingText(unknownSource.text)
          : undefined,
      sourceType: unknownSource?.sourceType,
      isUnknown: true,
    };
    const options: SelectedResponseOptionSpec[] = [
      ...contentOptions.map((option) => ({
        id: option.id,
        label: normalizeStudentFacingText(option.label),
        description: option.description ? normalizeStudentFacingText(option.description) : undefined,
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
      legacyItemIds: item.legacyItemIds,
      title: normalizeStudentFacingText(item.title),
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
      question: normalizeStudentFacingText(item.question),
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
  points: 4,
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
  points: 4,
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
  points: spec.simulation
    ? spec.simulation.rules.reduce((sum, rule) => sum + rule.points, 0)
    : (spec.questions ?? []).reduce((sum, question) => sum + question.points, 0),
  skillDomain: "21C Data",
  kerndoel: "21C, 21A",
  excelTask: {
    filename: spec.filename,
    sheetName: spec.sheetName,
    questions: spec.questions,
    simulation: spec.simulation,
  },
});

const teamsTaskItem = (spec: TeamsTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "teams_share_simulation",
  title: spec.title,
  instruction: spec.instruction,
  points: 3,
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

  if (spec.sortTask) {
    return {
      id: spec.id,
      legacyItemIds: spec.legacyItemIds,
      type: "social_action_simulation",
      title: spec.title,
      instruction: spec.question,
      points: spec.sortTask.cards.length * spec.sortTask.pointsPerCard,
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
            title: "AI-acties sorteren",
            instruction: spec.question,
            groups: [
              {
                id: "ai-actions",
                title: "Plaats ieder kaartje",
                instruction: "Kies bij ieder kaartje één categorie.",
                inputType: "matching",
                cards: spec.sortTask.cards,
                options: spec.sortTask.categories,
                allowUnknown: true,
              },
            ],
          },
        ],
        rules: Object.entries(spec.sortTask.correctMatches).map(([cardId, categoryId]) => ({
          id: `sort-${cardId}`,
          description: `plaatst ${cardId} in de juiste categorie.`,
          points: spec.sortTask?.pointsPerCard ?? 0,
          groupId: "ai-actions",
          kind: "matchingAll",
          correctMatches: { [cardId]: categoryId },
        })),
      },
      aiSnelVeranderendFlag: spec.aiSnelVeranderendFlag,
      anchorStatus: spec.anchorStatus,
      sourceStatus: spec.sourceStatus,
      pilotReviewStatus: spec.pilotReviewStatus,
      validityNote: spec.validityNote,
      developerNotes: [
        spec.itemVersion ? `itemVersion: ${spec.itemVersion}` : "",
        spec.learnerQuestionNumber ? `learnerQuestionNumber: ${spec.learnerQuestionNumber}` : "",
        spec.internalSlot ? `internalSlot: ${spec.internalSlot}` : "",
        spec.primarySubgoal ? `primarySubgoal: ${spec.primarySubgoal}` : "",
      ].filter(Boolean),
    };
  }

  if (spec.compoundTask) {
    return {
      id: spec.id,
      legacyItemIds: spec.legacyItemIds,
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
            title: spec.mockup?.trainingData ? "Trainingsgegevens" : "AI-chat",
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
    legacyItemIds: spec.legacyItemIds,
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

const makeSections = (spec: VersionSpec): AssessmentSection[] => [
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
    title: "Blokprogrammeren",
    items: [blockTaskItem(spec.pt7)],
  },
  {
    id: "pt8",
    title: "PT8 - Online gedrag",
    items: [socialTaskItem(spec.pt8)],
  },
  {
    id: "sr",
    title: "Meerkeuze",
    instruction: "Kies steeds het beste antwoord.",
    items: getSelectedResponseSpecs(spec.id).map(selectedResponseItem),
  },
];

const buildAssessment = (
  spec: VersionSpec,
): Omit<AssessmentVersion, "assessmentBuildVersion" | "assessmentContentHash" | "contentHashAlgorithm"> => {
  const sections = makeSections(spec);
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
    indent?: number;
  } = {},
): ProgrammingBlockDefinition & { correctReplacementId?: string; indent?: number } => ({
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
  "Voer in Videochat het juiste klikpad uit: klik op Delen, kies Venster en selecteer Videospeler - filmfragment.";

const excelInstruction = (filename: string) =>
  `Download ${filename}. Open het in Excel. Klik op Bewerken inschakelen als Excel daarom vraagt.`;

const embeddedSpreadsheetInstruction =
  "Werk in de tabel hieronder. Stel per deelopdracht het gevraagde filter en de sortering in en klik op Toepassen. Je antwoord wordt beoordeeld op de handelingen in de tabel; je hoeft geen eindcode over te typen.";

const embeddedSpreadsheetTasks: Record<AssessmentVersionId, SpreadsheetSimulationConfig> = {
  "lj1-vmbo": {
    columns: [
      { key: "code", label: "Code", dataType: "text" },
      { key: "artist", label: "Artiest", dataType: "text" },
      { key: "year", label: "Jaar", dataType: "number" },
      { key: "genre", label: "Muziekstijl", dataType: "text" },
    ],
    rows: [
      { code: "L09", artist: "Zoë", year: 2028, genre: "pop" },
      { code: "L12", artist: "Roxy", year: 2010, genre: "pop" },
      { code: "L04", artist: "Antoon", year: 2022, genre: "rap" },
      { code: "L11", artist: "Bilal", year: 2024, genre: "rap" },
      { code: "L20", artist: "Nova", year: 2011, genre: "rap" },
      { code: "L21", artist: "Milo", year: 2012, genre: "pop" },
      { code: "L27", artist: "Sara", year: 2018, genre: "dance" },
      { code: "L34", artist: "Yara", year: 2025, genre: "dance" },
      { code: "L37", artist: "Finn", year: 2011, genre: "pop" },
      { code: "L42", artist: "Luna", year: 2016, genre: "pop" },
      { code: "L48", artist: "Tess", year: 2022, genre: "dance" },
      { code: "L50", artist: "Sem", year: 2024, genre: "pop" },
    ],
    scenarios: [
      {
        id: "pop-oldest",
        prompt: "Filter op Muziekstijl = pop. Sorteer daarna op Jaar van laag naar hoog.",
        filterRequired: true,
      },
    ],
    rules: [
      { id: "filter-pop", description: "filtert Muziekstijl op pop.", points: 1, scenarioId: "pop-oldest", kind: "filter", expected: { column: "genre", operator: "equals", value: "pop" } },
      { id: "sort-year-ascending", description: "sorteert Jaar van laag naar hoog.", points: 1, scenarioId: "pop-oldest", kind: "sort", expected: { column: "year", direction: "ascending" } },
    ],
  },
  "lj1-hv": {
    columns: [
      { key: "code", label: "Code", dataType: "text" },
      { key: "title", label: "Titel", dataType: "text" },
      { key: "year", label: "Jaar", dataType: "number" },
      { key: "subject", label: "Vak", dataType: "text" },
    ],
    rows: [
      { code: "B07", title: "Moleculen", year: 2028, subject: "scheikunde" },
      { code: "B06", title: "Plantenleven", year: 2010, subject: "biologie" },
      { code: "B12", title: "Rivieren", year: 2024, subject: "aardrijkskunde" },
      { code: "B20", title: "Cellen", year: 2011, subject: "biologie" },
      { code: "B21", title: "Reacties", year: 2013, subject: "scheikunde" },
      { code: "B22", title: "Klimaat", year: 2014, subject: "aardrijkskunde" },
      { code: "B23", title: "Krachten", year: 2015, subject: "natuurkunde" },
      { code: "B24", title: "Erfelijkheid", year: 2015, subject: "biologie" },
      { code: "B30", title: "Landschappen", year: 2022, subject: "aardrijkskunde" },
      { code: "B32", title: "Ecologie", year: 2023, subject: "biologie" },
      { code: "B35", title: "Elektriciteit", year: 2027, subject: "natuurkunde" },
      { code: "B40", title: "Organen", year: 2019, subject: "biologie" },
    ],
    scenarios: [
      { id: "newest-book", prompt: "Sorteer op Jaar van nieuw naar oud.", filterRequired: false },
      { id: "oldest-biology", prompt: "Filter op Vak = biologie. Sorteer daarna op Jaar van oud naar nieuw.", filterRequired: true },
    ],
    rules: [
      { id: "sort-column-year", description: "kiest Jaar als sorteerkolom.", points: 1, scenarioId: "newest-book", kind: "sortColumn", expectedColumn: "year" },
      { id: "sort-direction-newest", description: "sorteert van nieuw naar oud.", points: 1, scenarioId: "newest-book", kind: "sortDirection", expectedDirection: "descending" },
      { id: "filter-biology", description: "filtert Vak op biologie.", points: 1, scenarioId: "oldest-biology", kind: "filter", expected: { column: "subject", operator: "equals", value: "biologie" } },
      { id: "sort-oldest-biology", description: "sorteert Jaar van oud naar nieuw.", points: 1, scenarioId: "oldest-biology", kind: "sort", expected: { column: "year", direction: "ascending" } },
    ],
  },
  "lj3-vmbo": {
    columns: [
      { key: "code", label: "Code", dataType: "text" },
      { key: "year", label: "Jaar", dataType: "number" },
      { key: "category", label: "Categorie", dataType: "text" },
      { key: "amount", label: "Bedrag", dataType: "number" },
    ],
    rows: [
      { code: "W02", year: 2028, category: "elektronica", amount: 89 },
      { code: "W06", year: 2024, category: "elektronica", amount: 999 },
      { code: "W07", year: 2027, category: "kleding", amount: 75 },
      { code: "W12", year: 2025, category: "boeken", amount: 67 },
      { code: "W20", year: 2010, category: "kleding", amount: 20 },
      { code: "W21", year: 2012, category: "elektronica", amount: 57 },
      { code: "W23", year: 2013, category: "sport", amount: 131 },
      { code: "W24", year: 2014, category: "school", amount: 168 },
      { code: "W26", year: 2017, category: "elektronica", amount: 242 },
      { code: "W34", year: 2024, category: "school", amount: 278 },
      { code: "W37", year: 2027, category: "boeken", amount: 129 },
      { code: "W48", year: 2020, category: "sport", amount: 276 },
    ],
    scenarios: [
      { id: "newest-electronics", prompt: "Filter op Categorie = elektronica. Sorteer daarna op Jaar van nieuw naar oud.", filterRequired: true },
      { id: "largest-over-sixty", prompt: "Filter op Bedrag > 60. Sorteer daarna op Bedrag van hoog naar laag.", filterRequired: true },
    ],
    rules: [
      { id: "filter-electronics", description: "filtert Categorie op elektronica.", points: 1, scenarioId: "newest-electronics", kind: "filter", expected: { column: "category", operator: "equals", value: "elektronica" } },
      { id: "sort-newest-electronics", description: "sorteert Jaar van nieuw naar oud.", points: 1, scenarioId: "newest-electronics", kind: "sort", expected: { column: "year", direction: "descending" } },
      { id: "filter-amount", description: "filtert Bedrag op meer dan 60.", points: 1, scenarioId: "largest-over-sixty", kind: "filter", expected: { column: "amount", operator: "greaterThan", value: 60 } },
      { id: "sort-largest-amount", description: "sorteert Bedrag van hoog naar laag.", points: 1, scenarioId: "largest-over-sixty", kind: "sort", expected: { column: "amount", direction: "descending" } },
    ],
  },
  "lj3-hv": {
    columns: [
      { key: "code", label: "Code", dataType: "text" },
      { key: "year", label: "Jaar", dataType: "number" },
      { key: "housing", label: "Woningtype", dataType: "text" },
      { key: "usage", label: "Verbruik", dataType: "number" },
      { key: "cost", label: "Kosten", dataType: "number" },
    ],
    rows: [
      { code: "E13", year: 2024, housing: "A", usage: 1600, cost: 999 },
      { code: "E02", year: 2028, housing: "B", usage: 1180, cost: 520 },
      { code: "E06", year: 2025, housing: "A", usage: 1400, cost: 610 },
      { code: "E20", year: 2011, housing: "A", usage: 850, cost: 300 },
      { code: "E21", year: 2011, housing: "B", usage: 923, cost: 341 },
      { code: "E22", year: 2013, housing: "C", usage: 996, cost: 382 },
      { code: "E23", year: 2014, housing: "D", usage: 1069, cost: 423 },
      { code: "E25", year: 2015, housing: "B", usage: 1215, cost: 505 },
      { code: "E28", year: 2019, housing: "A", usage: 1434, cost: 628 },
      { code: "E35", year: 2026, housing: "D", usage: 1045, cost: 555 },
      { code: "E45", year: 2018, housing: "B", usage: 875, cost: 605 },
      { code: "E70", year: 2027, housing: "C", usage: 900, cost: 550 },
    ],
    scenarios: [
      { id: "highest-cost-over-500", prompt: "Filter op Kosten > 500. Sorteer daarna op Kosten van hoog naar laag.", filterRequired: true },
      { id: "newest-type-b", prompt: "Filter op Woningtype = B. Sorteer daarna op Jaar van nieuw naar oud.", filterRequired: true },
    ],
    rules: [
      { id: "filter-cost", description: "filtert Kosten op meer dan 500.", points: 1, scenarioId: "highest-cost-over-500", kind: "filter", expected: { column: "cost", operator: "greaterThan", value: 500 } },
      { id: "sort-highest-cost", description: "sorteert Kosten van hoog naar laag.", points: 1, scenarioId: "highest-cost-over-500", kind: "sort", expected: { column: "cost", direction: "descending" } },
      { id: "filter-type-b", description: "filtert Woningtype op B.", points: 1, scenarioId: "newest-type-b", kind: "filter", expected: { column: "housing", operator: "equals", value: "B" } },
      { id: "sort-newest-type-b", description: "sorteert Jaar van nieuw naar oud.", points: 1, scenarioId: "newest-type-b", kind: "sort", expected: { column: "year", direction: "descending" } },
    ],
  },
};

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
        {
          id: "lj1v-pt1-fotos",
          description: "Maak in Schoolwerk de map Fotos en verplaats Foto_project.jpg daarheen.",
          expectedPath: "Thuis/OneDrive/Schoolwerk/Fotos/Foto_project.jpg",
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
      title: "PT4 - Tabelgegevens filteren en sorteren",
      instruction: embeddedSpreadsheetInstruction,
      filename: "LJ1_VMBO_Liedjes.xlsx",
      sheetName: "Liedjes",
      simulation: embeddedSpreadsheetTasks["lj1-vmbo"],
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
      title: "Blokprogrammeren",
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
            title: "Scherm 2 - WhatsApp foto",
            instruction:
              'In WhatsApp wil iemand een foto van drie klasgenoten in de klassenapp zetten. Een klasgenoot schrijft: "Wacht, ik wil eerst weten welke foto dit is." Kies twee acties die jij zou doen.',
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
        {
          id: "lj1h-pt1-diagram",
          description: "Verplaats Diagram_Biologie.png naar Schoolwerk/Biologie.",
          expectedPath: "Thuis/OneDrive/Schoolwerk/Biologie/Diagram_Biologie.png",
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
      title: "PT4 - Tabelgegevens filteren en sorteren",
      instruction: embeddedSpreadsheetInstruction,
      filename: "LJ1_HV_Bibliotheek.xlsx",
      sheetName: "Boeken",
      simulation: embeddedSpreadsheetTasks["lj1-hv"],
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
      title: "Blokprogrammeren",
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
        {
          id: "lj3v-pt1-images",
          description: "Maak de map Beelden en verplaats Foto_stage.jpg daarheen.",
          expectedPath: "Thuis/OneDrive/Project_stage/Beelden/Foto_stage.jpg",
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
      title: "PT4 - Tabelgegevens filteren en sorteren",
      instruction: embeddedSpreadsheetInstruction,
      filename: "LJ3_VMBO_Bestellingen.xlsx",
      sheetName: "Bestellingen",
      simulation: embeddedSpreadsheetTasks["lj3-vmbo"],
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
      title: "Blokprogrammeren",
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
        {
          id: "lj3h-pt1-media",
          description:
            "Maak map Bronnen_en_media en verplaats Bronnen.xlsx en Afbeelding_CC_BY.png daarnaartoe.",
          expectedPaths: [
            "Thuis/OneDrive/Onderzoek/Bronnen_en_media/Bronnen.xlsx",
            "Thuis/OneDrive/Onderzoek/Bronnen_en_media/Afbeelding_CC_BY.png",
          ],
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
      title: "PT4 - Tabelgegevens filteren en sorteren",
      instruction: embeddedSpreadsheetInstruction,
      filename: "LJ3_HV_OpenData.xlsx",
      sheetName: "Energie",
      simulation: embeddedSpreadsheetTasks["lj3-hv"],
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
      title: "Blokprogrammeren",
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
  "Werk in het venster hieronder.\nVoer de opdrachten uit en klik daarna op Volgende.";

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
  rules: [
    {
      id: "to",
      description: "juiste ontvanger.",
      points: 1,
      conditions: [{ field: "to", operator: "includes", value: to }],
    },
    ...(cc.length > 0 || forbiddenBcc
      ? [
          {
            id: "cc-bcc",
            description: "juiste cc en bcc waar nodig.",
            points: 1,
            conditions: [
              ...(cc.length > 0 ? [{ field: "cc" as const, operator: "allInclude" as const, value: cc }] : []),
              ...(forbiddenBcc ? [{ field: "bcc" as const, operator: "noneInclude" as const, value: ["mentor@school.nl", "docent@school.nl", "klasgroep@school.nl"] }] : []),
            ],
          },
        ]
      : [
          {
            id: "sent",
            description: "mail is verzonden.",
            points: 1,
            conditions: [{ field: "sent" as const, operator: "true" as const }],
          },
        ]),
    {
      id: "subject",
      description: "juist onderwerp.",
      points: 1,
      conditions: [{ field: "subject", operator: "equals", value: subject }],
    },
    {
      id: "attachment-sent",
      description: "juiste bijlage en verzonden.",
      points: 1,
      conditions: [
        { field: "attachments", operator: "includes", value: requiredAttachment },
        ...(forbiddenAttachments.length > 0 ? [{ field: "attachments" as const, operator: "noneInclude" as const, value: forbiddenAttachments }] : []),
        ...(cc.length > 0 || forbiddenBcc ? [{ field: "sent" as const, operator: "true" as const }] : []),
      ],
    },
  ],
});

const v3Pt6 = (id: string): TeamsTaskSpec => ({
  id,
  title: "Schermdelen in videogesprek",
  instruction:
    "Leerling Mark Canbers zit in een online gesprek met zijn docent. Mark wil de docent een filmfragment laten zien en horen. Mark wil niet dat de docent zijn andere vensters kan zien.",
  kerndoel: "23A",
  ankerItemFlag: true,
  config: {
    scenario:
      "Deel alleen het venster met het filmfragment, met geluid.",
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
      {
        id: "sound",
        description: "computergeluid staat aan.",
        points: 1,
        conditions: ["computerSoundOn"],
      },
    ],
  },
});

const v3Pt3 = (versionId: AssessmentVersionId): SecurityTaskSpec => {
  const variants: Record<AssessmentVersionId, {
    id: string;
    learner: string;
    toEmail: string;
    date: string;
    fromEmail: string;
    subject: string;
    passwordRequest: string;
    pressure: string;
    linkUrl: string;
    actionOptions: Option[];
  }> = {
    "lj1-vmbo": {
      id: "lj1v-pt3-security",
      learner: "Sanne",
      toEmail: "sanne@leerling.citadelcollege.nl",
      date: "Vandaag 15:42",
      fromEmail: "service@streamflix-account.example",
      subject: "Controleer de beveiliging van uw account",
      passwordRequest:
        "Log via de knop hieronder in en bevestig uw huidige wachtwoord om de controle af te ronden.",
      pressure:
        "Doe dit vandaag. Anders kan bij de volgende aanmelding extra controle nodig zijn.",
      linkUrl: "https://streamflix-account.example/controle",
      actionOptions: [
        { id: "official-route", label: "Zelf de bekende StreamFlix-app of streamflix.example openen en daar de accountmelding controleren." },
        { id: "click-button", label: "De knop openen en stoppen wanneer de pagina om onverwachte gegevens vraagt.", riskFlag: "clicked_phishing_link" },
        { id: "search-sender", label: "Het afzenderadres opzoeken en de knop gebruiken als anderen het adres niet verdacht noemen.", errorCategory: "search_result_confused_with_verification" },
        { id: "reply-sender", label: "De mail beantwoorden zonder een wachtwoord te sturen en om bevestiging vragen.", errorCategory: "replies_to_possible_phisher" },
      ],
    },
    "lj1-hv": {
      id: "lj1h-pt3-security",
      learner: "Noor",
      toEmail: "noor@leerling.citadelcollege.nl",
      date: "Vandaag 10:02",
      fromEmail: "accountmelding@streamflix-service.example",
      subject: "Melding over uw StreamFlix-account",
      passwordRequest:
        "Bevestig via de knop uw huidige wachtwoord en kies daarna of u het wilt wijzigen.",
      pressure:
        "Controleer dit voor morgen 12.00 uur om een tijdelijke toegangsbeperking te voorkomen.",
      linkUrl: "https://streamflix.service-login.example/account",
      actionOptions: [
        { id: "official-route", label: "Zelf de bekende StreamFlix-app of streamflix.example openen en daar beveiligingsmeldingen bekijken." },
        { id: "trust-name", label: "De knop gebruiken nadat de afzendernaam en het StreamFlix-logo met eerdere mails zijn vergeleken.", errorCategory: "display_name_confused_with_trust" },
        { id: "hover-then-click", label: "Het linkadres bekijken en daarna doorgaan als de geopende pagina professioneel is vormgegeven.", riskFlag: "clicked_phishing_link" },
        { id: "reply-sender", label: "Via een antwoord op deze mail vragen welke aanmelding is gevonden.", errorCategory: "replies_to_possible_phisher" },
      ],
    },
    "lj3-vmbo": {
      id: "lj3v-pt3-security",
      learner: "Jayden",
      toEmail: "jayden@leerling.citadelcollege.nl",
      date: "Gisteren 19:48",
      fromEmail: "security@streamflix-meldingen.example",
      subject: "Nieuwe aanmelding controleren",
      passwordRequest:
        "Open de sessiecontrole via de knop en vul uw huidige wachtwoord in om de aanmelding te bevestigen.",
      pressure:
        "Als er binnen 24 uur geen bevestiging komt, wordt deze sessie tijdelijk beperkt.",
      linkUrl: "https://login.streamflix-account.example/sessie",
      actionOptions: [
        { id: "official-route", label: "Zelf via de bekende app of streamflix.example naar actieve sessies gaan en de melding daar controleren." },
        { id: "use-link", label: "De link openen en doorgaan als de verbinding versleuteld is en de pagina de juiste huisstijl heeft.", riskFlag: "clicked_phishing_link" },
        { id: "search-address", label: "Het linkadres in een zoekmachine controleren en het daarna gebruiken als er geen waarschuwingen verschijnen.", errorCategory: "search_result_confused_with_verification" },
        { id: "reply-sender", label: "De afzender vragen vanaf welk apparaat de aanmelding kwam.", errorCategory: "replies_to_possible_phisher" },
      ],
    },
    "lj3-hv": {
      id: "lj3h-pt3-security",
      learner: "Mila",
      toEmail: "mila@leerling.citadelcollege.nl",
      date: "Vandaag 21:06",
      fromEmail: "security@streamflix.com.accountcontrole.example",
      subject: "Controle van een actieve sessie",
      passwordRequest:
        "Valideer de genoemde sessie via de knop met uw huidige wachtwoord; daarna kunt u de sessie sluiten.",
      pressure:
        "Controleer de melding vanavond. Onbevestigde sessies kunnen daarna worden afgesloten.",
      linkUrl: "https://streamflix.com.accountcontrole.example/session",
      actionOptions: [
        { id: "official-route", label: "Zelf streamflix.example openen, actieve sessies controleren en vanuit die omgeving zo nodig het wachtwoord wijzigen." },
        { id: "trust-subdomain", label: "De link gebruiken nadat is vastgesteld dat streamflix.com vooraan in het adres staat.", errorCategory: "subdomain_confused_with_domain" },
        { id: "copy-link", label: "Het adres naar een nieuw browsertabblad kopiëren en doorgaan als de browser geen waarschuwing geeft.", riskFlag: "clicked_phishing_link" },
        { id: "reply-sender", label: "De mail beantwoorden en om het tijdstip en apparaat van de sessie vragen.", errorCategory: "replies_to_possible_phisher" },
      ],
    },
  };

  const variant = variants[versionId];
  const markerOptions: Option[] = [
    { id: "account-subject", label: "Onderwerp over een accountcontrole", errorCategory: "subject_confused_with_evidence" },
    { id: "sender-name", label: "Afzendernaam StreamFlix Klantenservice", errorCategory: "display_name_confused_with_evidence" },
    { id: "sender-email", label: "Domein van het afzenderadres wijkt af van streamflix.example" },
    { id: "recipient-email", label: "Eigen schoolmailadres bij Aan", errorCategory: "recipient_confused_with_evidence" },
    { id: "message-date", label: "Datum en tijd van de mail", errorCategory: "timestamp_confused_with_evidence" },
    { id: "personal-greeting", label: "Aanhef met de voornaam", errorCategory: "greeting_confused_with_evidence" },
    { id: "password-request", label: "Verzoek om het huidige wachtwoord via de mailknop in te vullen" },
    { id: "time-pressure", label: "Tijdsdruk met een mogelijke toegangsbeperking" },
    { id: "polite-closing", label: "Beleefde afsluiting", errorCategory: "politeness_confused_with_evidence" },
    { id: "team-name", label: "Ondertekening Team StreamFlix", errorCategory: "brand_name_confused_with_evidence" },
    { id: "suspicious-link", label: "Werkelijke domein van de link wijkt af van streamflix.example" },
  ];

  return {
    id: variant.id,
    title: "PT3 - Phishingmail beoordelen",
    instruction: "Onderzoek de StreamFlix-mail en beantwoord beide vragen.",
    kerndoel: "23A",
    config: {
      screens: [
        {
          id: "streamflix-phishing-mail",
          title: "StreamFlix: wachtwoord herstellen",
          instruction: `${variant.learner} gebruikt StreamFlix normaal via de app of via streamflix.example en ontvangt deze mail.`,
          emailStimulus: {
            fromName: "StreamFlix Klantenservice",
            fromEmail: variant.fromEmail,
            toEmail: variant.toEmail,
            date: variant.date,
            subject: variant.subject,
            body: [
              `Hallo ${variant.learner},`,
              variant.passwordRequest,
              variant.pressure,
              "Met vriendelijke groet,",
              "Team StreamFlix",
            ],
            linkLabel: "Wachtwoord nu herstellen",
            linkUrl: variant.linkUrl,
            selectableParts: [
              { id: "account-subject", target: "subject" },
              { id: "sender-name", target: "fromName" },
              { id: "sender-email", target: "fromEmail" },
              { id: "recipient-email", target: "toEmail" },
              { id: "message-date", target: "date" },
              { id: "personal-greeting", target: "body:0" },
              { id: "password-request", target: "body:1" },
              { id: "time-pressure", target: "body:2" },
              { id: "polite-closing", target: "body:3" },
              { id: "team-name", target: "body:4" },
              { id: "suspicious-link", target: "link" },
            ],
          },
          groups: [
            {
              id: "signals",
              title: "1. Markeer twee onderdelen waaraan je kunt zien dat deze mail niet betrouwbaar is.",
              instruction:
                "Klik rechtstreeks in de mail. Het werkelijke linkadres staat bij de knop. Er staan ook geloofwaardige onderdelen in die op zichzelf geen bewijs zijn.",
              inputType: "emailMarkers",
              maxSelections: 2,
              options: markerOptions,
            },
            {
              id: "action",
              title: `2. Wat kan ${variant.learner} nu het best doen?`,
              instruction: "Kies één antwoord.",
              inputType: "single",
              showOptionLetters: true,
              options: variant.actionOptions,
            },
          ],
        },
      ],
      rules: [
        {
          id: "origin-signal",
          description: "herkent een afwijking in afzender- of linkdomein.",
          points: 1,
          groupId: "signals",
          kind: "minCorrect",
          minCorrect: 1,
          correctOptionIds: ["sender-email", "suspicious-link"],
        },
        {
          id: "request-signal",
          description: "herkent een riskant verzoek of drukmiddel in de inhoud.",
          points: 1,
          groupId: "signals",
          kind: "minCorrect",
          minCorrect: 1,
          correctOptionIds: ["password-request", "time-pressure"],
        },
        {
          id: "safe-official-route",
          description: "controleert het account via de zelf geopende officiële app of website.",
          points: 1,
          groupId: "action",
          kind: "singleCorrect",
          correctOptionIds: ["official-route"],
        },
      ],
    },
  };
};
const v3Pt8 = (versionId: AssessmentVersionId): SocialTaskSpec => {
  const cap = (optionIds: string[], groupIds?: string[]) => [{ id: "harmful-cap", maxScore: 2, optionIds, groupIds }];
  const specs: Record<AssessmentVersionId, SocialTaskSpec> = {
    "lj1-vmbo": {
      id: "lj1v-pt8-online",
      title: "PT8 - Online gedrag: foto delen",
      instruction: "Bekijk wat er in WhatsApp gebeurt. Kies per scherm de beste reactie.",
      kerndoel: "23B",
      config: {
        screens: [
          {
            id: "judgement",
            title: "WhatsApp: foto van klasgenoten",
            instruction: "In WhatsApp wil iemand een foto van drie klasgenoten in de klassenapp zetten. Een van hen schrijft: \"Wacht, ik wil eerst weten welke foto dit is.\" Jij ziet het bericht.",
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
    instruction: "Bekijk wat er in WhatsApp gebeurt. Kies per scherm de beste reactie.",
    kerndoel: "23B",
    config: {
      screens: [
        {
          id: "screen1",
          title: "WhatsApp: foto van klasgenoten",
          instruction: "Wat is nu de beste eerste reactie van jou?",
          body: "In WhatsApp wil iemand een foto van drie klasgenoten in de klassenapp zetten.\n\nEen klasgenoot schrijft:\n\n\"Wacht, ik wil eerst weten welke foto dit is.\"\n\nEen paar leerlingen reageren dat het snel gedeeld moet worden.",
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

  // Prioriteit 4: PT8 is bewust geen anker. De vier varianten lopen inhoudelijk
  // op van concrete toestemming naar verificatie, herstel en systeemcontext.
  specs["lj1-vmbo"] = {
    id: "pt8-lj1v-photo-consent-v5",
    title: "PT8 - Online gedrag: foto delen",
    instruction: "Bekijk de situatie en kies op ieder scherm de beste reactie.",
    kerndoel: "23B",
    config: {
      screens: [
        {
          id: "risk",
          title: "Foto in de klassenapp",
          instruction: "Wat is het belangrijkste aandachtspunt?",
          body: "In de klassenapp wil iemand een foto van drie herkenbare klasgenoten plaatsen. Eén klasgenoot twijfelt en heeft nog geen toestemming gegeven.",
          groups: [{ id: "risk", title: "Kies één antwoord", inputType: "single", options: [
            { id: "consent-missing", label: "Van een herkenbare klasgenoot ontbreekt toestemming om de foto te delen." },
            { id: "closed-group-ok", label: "Een klassenapp is klein genoeg om toestemming later te regelen." },
            { id: "majority-decides", label: "De voorkeur van de meeste leerlingen bepaalt of de foto gedeeld kan worden." },
            { id: "caption-solves", label: "Een vriendelijke tekst bij de foto voorkomt problemen met toestemming." },
          ] }],
        },
        {
          id: "no-spread",
          title: "Eerste handeling",
          instruction: "Wat doe je met de foto zolang niet duidelijk is of iedereen akkoord is?",
          groups: [{ id: "no-spread", title: "Kies één antwoord", inputType: "single", options: [
            { id: "do-not-share", label: "De foto niet plaatsen of doorsturen." },
            { id: "send-friend", label: "De foto naar één vriend sturen om diens mening te vragen." },
            { id: "post-delete-later", label: "De foto plaatsen en weghalen wanneer iemand bezwaar maakt." },
            { id: "wait-majority", label: "Eerst tellen hoeveel leerlingen de foto graag willen zien." },
          ] }],
        },
        {
          id: "consent",
          title: "Toestemming",
          instruction: "Hoe controleer je of delen in orde is?",
          groups: [{ id: "consent", title: "Kies één antwoord", inputType: "single", options: [
            { id: "ask-each-person", label: "Iedere herkenbare persoon afzonderlijk vragen of delen goed is." },
            { id: "ask-group-admin", label: "De beheerder van de klassenapp om toestemming vragen." },
            { id: "use-silence", label: "In de groep aankondigen dat stilte als instemming wordt gezien." },
            { id: "ask-photographer", label: "De maker van de foto laten beslissen voor de mensen die erop staan." },
          ] }],
        },
        {
          id: "help",
          title: "Hulp vragen",
          instruction: "Wanneer is hulp van een mentor of andere vertrouwde volwassene passend?",
          groups: [{ id: "help", title: "Kies één antwoord", inputType: "single", options: [
            { id: "pressure-or-harm", label: "Wanneer de druk om te delen doorgaat of iemand last krijgt van de situatie." },
            { id: "wait-for-request", label: "Wanneer de klasgenoot die twijfelt later zelf expliciet om hulp vraagt." },
            { id: "solve-in-chat", label: "Wanneer een stemming in de groepschat geen duidelijke winnaar oplevert." },
            { id: "after-wide-spread", label: "Wanneer de foto al buiten de klas terechtgekomen is." },
          ] }],
        },
      ],
      rules: [
        { id: "risk", description: "herkent ontbrekende toestemming.", points: 1, groupId: "risk", kind: "singleCorrect", correctOptionIds: ["consent-missing"] },
        { id: "no-spread", description: "voorkomt verspreiding zolang toestemming ontbreekt.", points: 1, groupId: "no-spread", kind: "singleCorrect", correctOptionIds: ["do-not-share"] },
        { id: "consent", description: "vraagt betrokkenen afzonderlijk om toestemming.", points: 1, groupId: "consent", kind: "singleCorrect", correctOptionIds: ["ask-each-person"] },
        { id: "help", description: "herkent wanneer vertrouwde hulp passend is.", points: 1, groupId: "help", kind: "singleCorrect", correctOptionIds: ["pressure-or-harm"] },
      ],
      scoreCaps: [
        { id: "harmful-share-cap", maxScore: 2, optionIds: ["send-friend", "post-delete-later"] },
        { id: "delayed-help-cap", maxScore: 3, optionIds: ["after-wide-spread"] },
      ],
    },
  };

  specs["lj1-hv"] = {
    id: "pt8-lj1h-private-screenshot-v5",
    title: "PT8 - Online gedrag: privébericht doorsturen",
    instruction: "Beoordeel het verzoek, voorkom verspreiding en kies passende steun.",
    kerndoel: "23B",
    config: {
      screens: [
        {
          id: "risk",
          title: "Screenshot uit een privéchat",
          instruction: "Wat maakt doorsturen hier riskant?",
          body: "Een klasgenoot vraagt jou een screenshot uit een privéchat door te sturen naar de klasgroep. In de screenshot vertelt Noor iets persoonlijks. Noor weet niets van het verzoek.",
          groups: [{ id: "risk", title: "Kies één antwoord", inputType: "single", options: [
            { id: "private-without-consent", label: "Het bericht bevat persoonlijke informatie en Noor gaf geen toestemming." },
            { id: "recipient-may-share", label: "De ontvanger van een privébericht mag bepalen in welke groep het verdergaat." },
            { id: "remove-name-enough", label: "Het weglaten van Noors naam maakt de rest van de screenshot geschikt om te delen." },
            { id: "class-context", label: "De klascontext maakt het bericht relevant genoeg voor de hele groep." },
          ] }],
        },
        {
          id: "no-spread",
          title: "Omgaan met het verzoek",
          instruction: "Wat antwoord je op het verzoek om door te sturen?",
          groups: [{ id: "no-spread", title: "Kies één antwoord", inputType: "single", options: [
            { id: "refuse-forward", label: "Ik stuur de screenshot niet door." },
            { id: "smaller-group", label: "Ik stuur hem naar een kleinere groep die Noor goed kent." },
            { id: "ask-reactions", label: "Ik plaats eerst een beschrijving en kijk hoe de groep reageert." },
            { id: "temporary-share", label: "Ik deel hem als tijdelijk bericht zodat hij later verdwijnt." },
          ] }],
        },
        {
          id: "support",
          title: "Steun aan Noor",
          instruction: "Welke steun past als Noor hoort wat er is gebeurd?",
          groups: [{ id: "support", title: "Kies één antwoord", inputType: "single", options: [
            { id: "ask-noor-support", label: "Noor vragen welke hulp of steun zij prettig vindt." },
            { id: "decide-for-noor", label: "Zelf beslissen wie er namens Noor in de klasgroep reageert." },
            { id: "advise-ignore", label: "Noor aanraden niet te reageren zodat het onderwerp sneller verdwijnt." },
            { id: "explain-joke", label: "Noor uitleggen dat klasgenoten het waarschijnlijk niet zwaar bedoelen." },
          ] }],
        },
        {
          id: "help",
          title: "Hulp inschakelen",
          instruction: "Wanneer schakel je een mentor, ouder of andere verantwoordelijke volwassene in?",
          groups: [{ id: "help", title: "Kies één antwoord", inputType: "single", options: [
            { id: "pressure-continues", label: "Als de druk, ruzie of verdere verspreiding doorgaat." },
            { id: "after-class-vote", label: "Als een stemming in de klasgroep uitwijst dat veel leerlingen het erg vinden." },
            { id: "after-delete-fails", label: "Als verwijderen van de screenshot op je eigen telefoon niet helpt." },
            { id: "when-sender-agrees", label: "Als de oorspronkelijke afzender instemt met het betrekken van een volwassene." },
          ] }],
        },
      ],
      rules: [
        { id: "risk", description: "herkent persoonlijke informatie zonder toestemming.", points: 1, groupId: "risk", kind: "singleCorrect", correctOptionIds: ["private-without-consent"] },
        { id: "no-spread", description: "weigert verdere verspreiding.", points: 1, groupId: "no-spread", kind: "singleCorrect", correctOptionIds: ["refuse-forward"] },
        { id: "support", description: "sluit steun aan op de behoefte van de betrokkene.", points: 1, groupId: "support", kind: "singleCorrect", correctOptionIds: ["ask-noor-support"] },
        { id: "help", description: "schakelt passende hulp in bij aanhoudende druk of schade.", points: 1, groupId: "help", kind: "singleCorrect", correctOptionIds: ["pressure-continues"] },
      ],
      scoreCaps: [
        { id: "harmful-forward-cap", maxScore: 2, optionIds: ["smaller-group", "temporary-share"] },
        { id: "dismissal-cap", maxScore: 3, optionIds: ["explain-joke"] },
      ],
    },
  };

  specs["lj3-vmbo"] = {
    id: "pt8-lj3v-impersonation-v5",
    title: "PT8 - Online gedrag: nepaccount",
    instruction: "Beoordeel identiteitsmisbruik en kies veilige, niet-escalerende vervolgstappen.",
    kerndoel: "23B",
    config: {
      screens: [
        {
          id: "risk",
          title: "Account met jouw naam en foto",
          instruction: "Welk probleem speelt hier?",
          body: "Een onbekend account gebruikt jouw naam en profielfoto en stuurt rare berichten naar leerlingen van school. Je weet niet wie het account beheert.",
          groups: [{ id: "risk", title: "Kies één antwoord", inputType: "single", options: [
            { id: "identity-misuse", label: "Iemand doet zich digitaal als jou voor en kan anderen misleiden." },
            { id: "duplicate-profile", label: "Twee accounts met dezelfde foto zorgen vooral voor verwarring in de zoekresultaten." },
            { id: "school-joke", label: "Een account onder een bekende naam is aannemelijk bedoeld als grap binnen school." },
            { id: "profile-ownership", label: "Wie een openbare profielfoto vindt, kan die gebruiken voor een nieuw profiel." },
          ] }],
        },
        {
          id: "no-escalation",
          title: "Niet escaleren",
          instruction: "Welke eerste reactie voorkomt dat de situatie groter wordt?",
          groups: [{ id: "no-escalation", title: "Kies één antwoord", inputType: "single", options: [
            { id: "no-public-reply", label: "Niet via een openbaar bericht reageren op het nepaccount." },
            { id: "name-suspect", label: "In de klassenapp noemen wie volgens jou achter het account zit." },
            { id: "counter-account", label: "Een tweede account maken om de berichten van het nepaccount tegen te spreken." },
            { id: "ask-follow", label: "Klasgenoten vragen het account te volgen om de activiteit zichtbaar te houden." },
          ] }],
        },
        {
          id: "report",
          title: "Melden",
          instruction: "Welke actie gebruikt de bedoelde route voor identiteitsmisbruik?",
          groups: [{ id: "report", title: "Kies één antwoord", inputType: "single", options: [
            { id: "platform-report", label: "Het account via de meldfunctie van het platform rapporteren." },
            { id: "mass-message", label: "Een waarschuwing met screenshots naar alle contacten sturen." },
            { id: "direct-demand", label: "Het account een privébericht sturen met de eis zichzelf bekend te maken." },
            { id: "public-poll", label: "Een openbare poll maken over wie het account beheert." },
          ] }],
        },
        {
          id: "secure",
          title: "Eigen account controleren",
          instruction: "Welke aanvullende handeling verkleint risico voor je eigen account?",
          groups: [{ id: "secure", title: "Kies één antwoord", inputType: "single", options: [
            { id: "privacy-check", label: "De beveiligings- en privacyinstellingen van je eigen account controleren." },
            { id: "delete-real-account", label: "Je echte account verwijderen zodat het nepaccount minder opvalt." },
            { id: "publish-personal-proof", label: "Extra persoonsgegevens publiceren om te bewijzen welk account echt is." },
            { id: "share-password-friend", label: "Een vriend toegang geven tot je account zodat die kan meekijken." },
          ] }],
        },
      ],
      rules: [
        { id: "risk", description: "herkent digitaal identiteitsmisbruik.", points: 1, groupId: "risk", kind: "singleCorrect", correctOptionIds: ["identity-misuse"] },
        { id: "no-escalation", description: "voorkomt openbare escalatie.", points: 1, groupId: "no-escalation", kind: "singleCorrect", correctOptionIds: ["no-public-reply"] },
        { id: "report", description: "gebruikt de platformmelding.", points: 1, groupId: "report", kind: "singleCorrect", correctOptionIds: ["platform-report"] },
        { id: "secure", description: "controleert de beveiliging en privacy van het eigen account.", points: 1, groupId: "secure", kind: "singleCorrect", correctOptionIds: ["privacy-check"] },
      ],
      scoreCaps: [
        { id: "retaliation-cap", maxScore: 2, optionIds: ["name-suspect", "counter-account", "public-poll"] },
        { id: "unsafe-proof-cap", maxScore: 2, optionIds: ["mass-message", "publish-personal-proof", "share-password-friend"] },
      ],
    },
  };

  specs["lj3-hv"] = {
    id: "pt8-lj3h-manipulated-school-post-v5",
    title: "PT8 - Online gedrag: gemanipuleerd schoolbericht",
    instruction: "Weeg signalen, voorkom verspreiding, verifieer en herstel de informatie in de groep.",
    kerndoel: "23B",
    config: {
      screens: [
        {
          id: "signals",
          title: "Screenshot van een schoolbericht",
          instruction: "Kies de twee gegevens die echt reden geven om de herkomst te controleren.",
          body: "In een groepschat verschijnt een screenshot: ‘Vanaf morgen zijn telefoons verboden. Wie protesteert, krijgt straf.’ De opmaak lijkt op die van school, maar het bericht staat niet in de schoolapp. Het delende account heeft geen verifieerbare naam.",
          groups: [{ id: "signals", title: "Kies twee signalen", inputType: "multi", maxSelections: 2, options: [
            { id: "outside-official-channel", label: "Het bericht ontbreekt in de officiële schoolapp en schoolmail." },
            { id: "unverified-account", label: "Het delende account is niet aan een verifieerbare afzender te koppelen." },
            { id: "school-like-layout", label: "De opmaak gebruikt kleuren en woorden die op schoolcommunicatie lijken." },
            { id: "concrete-rule", label: "Het bericht noemt een concrete regel die de volgende dag zou ingaan." },
            { id: "many-replies", label: "Meerdere leerlingen reageren snel op het bericht." },
          ] }],
        },
        {
          id: "no-spread",
          title: "Verspreiding",
          instruction: "Wat doe je terwijl de herkomst nog niet is gecontroleerd?",
          groups: [{ id: "no-spread", title: "Kies één antwoord", inputType: "single", options: [
            { id: "hold-message", label: "Het screenshot niet verder doorsturen." },
            { id: "forward-with-warning", label: "Het screenshot doorsturen met de waarschuwing dat het mogelijk niet klopt." },
            { id: "forward-to-other-class", label: "Het screenshot naar een andere klas sturen om te vragen of zij het herkennen." },
            { id: "edit-question-mark", label: "Een vraagteken op de afbeelding zetten en die versie delen." },
          ] }],
        },
        {
          id: "verify",
          title: "Verifiëren",
          instruction: "Welke bron geeft de beste controle van dit specifieke schoolbericht?",
          groups: [{ id: "verify", title: "Kies één antwoord", inputType: "single", options: [
            { id: "official-school-channel", label: "De officiële schoolapp, schoolmail of een verantwoordelijke medewerker." },
            { id: "group-majority", label: "De mening van de meeste leerlingen die al in de groepschat reageren." },
            { id: "image-search", label: "Een zoekmachine die vergelijkbare screenshots op internet toont." },
            { id: "account-history", label: "Eerdere berichten van hetzelfde anonieme account." },
          ] }],
        },
        {
          id: "repair",
          title: "Herstellen",
          instruction: "De school bevestigt dat het screenshot nep is. Wat is een passende herstelactie?",
          groups: [{ id: "repair", title: "Kies één antwoord", inputType: "single", options: [
            { id: "share-official-correction", label: "De officiële correctie in dezelfde groepschat delen." },
            { id: "mock-creator", label: "De vermoedelijke maker in de groep belachelijk maken." },
            { id: "keep-example", label: "Het nepbericht bewaren om het later als voorbeeld opnieuw te plaatsen." },
            { id: "make-parody", label: "Een overdreven versie maken zodat anderen begrijpen dat het bericht nep was." },
          ] }],
        },
      ],
      rules: [
        { id: "risk", description: "herkent twee onafhankelijke herkomstsignalen.", points: 1, groupId: "signals", kind: "minCorrect", minCorrect: 2, correctOptionIds: ["outside-official-channel", "unverified-account"] },
        { id: "no-spread", description: "voorkomt verspreiding tijdens verificatie.", points: 1, groupId: "no-spread", kind: "singleCorrect", correctOptionIds: ["hold-message"] },
        { id: "verify", description: "controleert via het verantwoordelijke officiële kanaal.", points: 1, groupId: "verify", kind: "singleCorrect", correctOptionIds: ["official-school-channel"] },
        { id: "repair", description: "corrigeert de informatie via dezelfde groepscontext.", points: 1, groupId: "repair", kind: "singleCorrect", correctOptionIds: ["share-official-correction"] },
      ],
      scoreCaps: [
        { id: "spread-cap", maxScore: 2, optionIds: ["forward-with-warning", "forward-to-other-class", "edit-question-mark"] },
        { id: "retaliation-cap", maxScore: 2, optionIds: ["mock-creator", "make-parody"] },
      ],
    },
  };

  return specs[versionId];
};

const v3Pt7 = (versionId: AssessmentVersionId): BlockTaskSpec => {
  const specs: Record<AssessmentVersionId, BlockTaskSpec> = {
    "lj1-vmbo": {
      id: "lj1v-pt7-programming",
      title: "Blokprogrammeren",
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
      title: "Blokprogrammeren",
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
      title: "Blokprogrammeren",
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
      title: "Blokprogrammeren",
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
      title: "Blokprogrammeren",
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
      title: "Blokprogrammeren",
      intro: "Bizzy moet een vierkant lopen. Er zijn 2 fouten in de code. Wijs ze aan, verbeter ze en test.",
      instruction: "Blokprogrammeren",
      config: {
        itemVersion: "pt7-debug-v1",
        device: "bizzy",
        visualGoal: { title: "DOEL", lines: ['herhaal 4 keer: 1 stap vooruit + rechts draaien', 'daarna: zeg "Vierkant"'] },
        initialProgram: [debugBlock("lj1h_start_initial", "bij start", "gebeurtenissen", { isContainer: true }), debugBlock("lj1h_repeat_3_initial", "herhaal 3 keer", "besturing", { isContainer: true, correctReplacementId: "lj1h_repeat_4_fix" }), debugBlock("lj1h_move_1_initial", "1 stap vooruit", "beweging", { indent: 1 }), debugBlock("lj1h_turn_right_initial", "rechts draaien", "beweging", { indent: 1 }), debugBlock("lj1h_say_klaar_initial", 'zeg "Klaar"', "uiterlijk", { correctReplacementId: "lj1h_say_vierkant_fix" })],
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
      title: "Blokprogrammeren",
      intro: "Bij elke klik op A komt er 1 bij. Bij 1 t/m 4: Nog plek. Bij 5 of meer: Vol. Er zijn 2 fouten. Wijs ze aan, verbeter ze en test.",
      instruction: "Blokprogrammeren",
      config: {
        itemVersion: "pt7-debug-v1",
        device: "microbit",
        visualGoal: { title: "DOEL", lines: ["A x4 -> Nog plek", "A x5 -> Vol"] },
        initialProgram: [debugBlock("lj3v_start_initial", "bij start", "gebeurtenissen", { isContainer: true }), debugBlock("lj3v_set_counter_0_initial", "zet teller op 0", "variabelen"), debugBlock("lj3v_button_a_initial", "als knop A wordt ingedrukt", "gebeurtenissen", { isContainer: true }), debugBlock("lj3v_change_counter_by_2_initial", "verander teller met 2", "variabelen", { correctReplacementId: "lj3v_change_counter_by_1_fix", indent: 1 }), debugBlock("lj3v_condition_greater_than_5_initial", "als teller groter dan 5 dan", "voorwaarden", { isContainer: true, correctReplacementId: "lj3v_condition_at_least_5_fix", indent: 1 }), debugBlock("lj3v_say_vol_initial", 'zeg "Vol"', "uiterlijk", { indent: 2 }), debugBlock("lj3v_else_initial", "anders", "voorwaarden", { isContainer: true, indent: 1 }), debugBlock("lj3v_say_nog_plek_initial", 'zeg "Nog plek"', "uiterlijk", { indent: 2 })],
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
      title: "Blokprogrammeren",
      intro: "Toon alleen \"Koelen\" als het warm is en het raam open staat. Er zijn 2 fouten in de code. Wijs ze aan, verbeter ze en test.",
      instruction: "Blokprogrammeren",
      config: {
        itemVersion: "pt7-debug-v1",
        device: "sensor",
        visualGoal: { title: "DOEL", lines: ["27 graden + open -> Koelen", "27 graden + dicht -> Oke", "20 graden + open -> Oke", "20 graden + dicht -> Oke"] },
        initialProgram: [debugBlock("lj3h_read_temp_initial", "lees temperatuur", "invoer"), debugBlock("lj3h_read_window_initial", "lees raamOpen", "invoer"), debugBlock("lj3h_condition_or_initial", "als temperatuur > 25 OF raamOpen = ja dan", "voorwaarden", { isContainer: true, correctReplacementId: "lj3h_condition_and_fix" }), debugBlock("lj3h_show_koelen_initial", 'toon "Koelen"', "uiterlijk", { indent: 1 }), debugBlock("lj3h_else_initial", "anders", "voorwaarden", { isContainer: true }), debugBlock("lj3h_else_show_verwarmen_initial", 'toon "Verwarmen"', "uiterlijk", { correctReplacementId: "lj3h_show_oke_fix", indent: 1 })],
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

const teddyBlock = (
  id: string,
  label: string,
  opcode: NonNullable<ProgrammingBlockDefinition["opcode"]>,
  category: "gebeurtenissen" | "acties" | "besturing",
  options: Pick<ProgrammingBlockDefinition, "isContainer" | "defaultParameters"> = {},
): ProgrammingBlockDefinition => ({
  id,
  label,
  opcode,
  category,
  color: category === "gebeurtenissen" ? "#f5a623" : category === "besturing" ? "#ef8734" : "#4d8fd1",
  ...options,
});

const teddyStart = teddyBlock("teddy-start", "bij start", "start", "gebeurtenissen");
const teddyActions = [
  teddyBlock("teddy-walk", "loop", "walk", "acties"),
  teddyBlock("teddy-turn", "draai", "turn", "acties", { defaultParameters: { direction: "right" } }),
  teddyBlock("teddy-jump", "spring", "jump", "acties"),
  teddyBlock("teddy-bark", "blaf", "bark", "acties"),
  teddyBlock("teddy-take-bone", "pak bot", "take_bone", "acties"),
];
const teddyRepeat = teddyBlock("teddy-repeat", "herhaal", "repeat", "besturing", {
  isContainer: true,
  defaultParameters: { count: 3 },
});
const teddyIfCat = teddyBlock(
  "teddy-if-cat",
  "als Teddy voor kat staat",
  "if_cat_ahead",
  "besturing",
  { isContainer: true },
);

const v3Pt7Teddy = (versionId: AssessmentVersionId): BlockTaskSpec => {
  const common = {
    title: "Blokprogrammeren",
    instruction: "Blokprogrammeren",
  };
  const specs: Record<AssessmentVersionId, BlockTaskSpec> = {
    "lj1-vmbo": {
      ...common,
      id: "lj1v-pt7-programming-teddy-v1",
      intro: "Bouw zelf Teddy's programma. Laat hem het pad volgen, de kat wegblaffen, over de boomstam springen en zijn bot pakken.",
      config: {
        itemVersion: "pt7-teddy-build-v1",
        device: "teddy",
        visualGoal: {
          title: "TEDDY WIL ZIJN BOT",
          lines: ["Volg de pootafdrukken", "Blaft de kat weg", "Spring over de boomstam", "Pak het bot"],
        },
        initialProgram: [{ ...teddyStart, indent: 0 }],
        blocks: teddyActions,
        correctProgram: ["bij start", "loop", "loop", "draai rechts", "blaf", "loop", "spring", "pak bot"],
        rules: [],
        playback: { speed: "slow", stepMs: 650 },
        logging: { itemVersion: "pt7-teddy-build-v1" },
        teddyWorld: teddyWorlds["lj1-vmbo"],
      },
    },
    "lj1-hv": {
      ...common,
      id: "lj1h-pt7-programming-teddy-v1",
      intro: "Bouw Teddy's programma. Gebruik herhalen voor de drie gelijke stappen en help hem daarna langs de kat en de boomstam.",
      config: {
        itemVersion: "pt7-teddy-build-v1",
        device: "teddy",
        visualGoal: { title: "TEDDY WIL ZIJN BOT", lines: ["Herhaal 3 gelijke stappen", "Blaft de kat weg", "Spring en pak het bot"] },
        initialProgram: [{ ...teddyStart, indent: 0 }],
        blocks: [...teddyActions, teddyRepeat],
        correctProgram: ["bij start", "herhaal 3 keer", "loop", "draai rechts", "blaf", "loop", "spring", "pak bot"],
        rules: [],
        playback: { speed: "normal", stepMs: 600 },
        logging: { itemVersion: "pt7-teddy-build-v1" },
        teddyWorld: teddyWorlds["lj1-hv"],
      },
    },
    "lj3-vmbo": {
      ...common,
      id: "lj3v-pt7-programming-teddy-v1",
      intro: "Bouw één programma dat Teddy langs beide katten brengt. Controleer tijdens het herhalen steeds of er een kat voor hem staat.",
      config: {
        itemVersion: "pt7-teddy-build-v1",
        device: "teddy",
        visualGoal: { title: "TWEE KATTEN OP HET PAD", lines: ["Herhaal de routecontrole", "Blaf alleen als er een kat staat", "Spring en pak het bot"] },
        initialProgram: [{ ...teddyStart, indent: 0 }],
        blocks: [...teddyActions, teddyRepeat, teddyIfCat],
        correctProgram: ["bij start", "herhaal 5 keer", "als Teddy voor kat staat", "blaf", "loop", "draai rechts", "spring", "pak bot"],
        rules: [],
        playback: { speed: "normal", stepMs: 520 },
        logging: { itemVersion: "pt7-teddy-build-v1" },
        teddyWorld: teddyWorlds["lj3-vmbo"],
      },
    },
    "lj3-hv": {
      ...common,
      id: "lj3h-pt7-programming-teddy-v1",
      intro: "De katten lopen een vaste patrouille. Bouw een programma dat tijdens elke herhaling kijkt wat er vóór Teddy gebeurt.",
      config: {
        itemVersion: "pt7-teddy-build-v1",
        device: "teddy",
        visualGoal: { title: "DE KATTEN BEWEGEN", lines: ["Bekijk de patrouillepijlen", "Controleer vóór iedere stap", "Bereik de boomstam en pak het bot"] },
        initialProgram: [{ ...teddyStart, indent: 0 }],
        blocks: [...teddyActions, teddyRepeat, teddyIfCat],
        correctProgram: ["bij start", "herhaal 6 keer", "als Teddy voor kat staat", "blaf", "loop", "draai rechts", "spring", "pak bot"],
        rules: [],
        playback: { speed: "normal", stepMs: 480 },
        logging: { itemVersion: "pt7-teddy-build-v1" },
        teddyWorld: teddyWorlds["lj3-hv"],
      },
    },
  };
  return specs[versionId];
};

const withV3PerformanceTasks = (spec: VersionSpec): VersionSpec => {
  const files: Record<AssessmentVersionId, FileTaskSpec> = {
    "lj1-vmbo": {
      id: "lj1v-pt1-files",
      title: "PT1 - Bestanden en mappen beheren",
      instruction:
        `${v3FileInstruction}\nMaak in OneDrive een nieuwe map aan met de naam 'Biologie'.\nVerplaats de bestanden concept_dieren.docx, foto_kat.jpg en bron_dieren.pdf naar de map Biologie.\nVerander de naam van 'concept_dieren.docx' in 'verslag_dieren.docx'.`,
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
        { id: "rename", description: "verslag correct hernoemd en geplaatst.", expectedPath: "Thuis/OneDrive/Biologie/verslag_dieren.docx", forbiddenPaths: ["Thuis/OneDrive/concept_dieren.docx", "Thuis/OneDrive/Biologie/concept_dieren.docx"], points: 1 },
        { id: "subjects", description: "bestaande vakmappen blijven beschikbaar.", expectedPaths: ["Thuis/OneDrive/Engels", "Thuis/OneDrive/Maatschappij", "Thuis/OneDrive/Mentorles", "Thuis/OneDrive/Nederlands", "Thuis/OneDrive/Wiskunde"], points: 1 },
      ],
    },
    "lj1-hv": {
      id: "lj1h-pt1-files",
      title: "PT1 - Bestanden en mappen beheren",
      instruction: `${v3FileInstruction}\nWerk in OneDrive. Maak de hoofdmap Project Water. Maak daarin Bronnen, Afbeeldingen en Verslag. Verplaats de vier bestanden naar de juiste map. Hernoem concept_verslag.docx naar project_water_verslag.docx en presentatie_water.pptx naar project_water_presentatie.pptx.`,
      startFolders: ["Thuis/OneDrive"],
      startFiles: ["Thuis/OneDrive/bron_water.pdf", "Thuis/OneDrive/waterfoto.png", "Thuis/OneDrive/concept_verslag.docx", "Thuis/OneDrive/presentatie_water.pptx"],
      tasks: [
        { id: "main", description: "hoofdmap Project Water correct.", expectedPath: "Thuis/OneDrive/Project Water", points: 1 },
        { id: "subfolders", description: "submappen correct.", expectedPaths: ["Thuis/OneDrive/Project Water/Bronnen", "Thuis/OneDrive/Project Water/Afbeeldingen", "Thuis/OneDrive/Project Water/Verslag"], points: 1 },
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
        { id: "newest", description: "nieuwste versie herkend en correct geplaatst.", expectedPath: "Thuis/OneDrive/Stageproject/Actueel/stageverslag_2026_definitief.docx", points: 1 },
        { id: "archive", description: "oudere versies correct gearchiveerd.", expectedPaths: ["Thuis/OneDrive/Stageproject/Oud/stageverslag_v1.docx", "Thuis/OneDrive/Stageproject/Oud/stageverslag_v2.docx"], points: 1 },
        { id: "name", description: "juiste definitieve bestandsnaam.", expectedPath: "Thuis/OneDrive/Stageproject/Actueel/stageverslag_2026_definitief.docx", forbiddenPaths: ["Thuis/OneDrive/Stageproject/stageverslag_v3.docx"], points: 1 },
      ],
    },
    "lj3-hv": {
      id: "lj3h-pt1-files",
      title: "PT1 - Bestanden en mappen beheren",
      instruction: `${v3FileInstruction}\nWerk in OneDrive in Project Onderzoek. Maak daarin de mappen Data, Bronnen, Beelden en Archief. Plaats bestanden op basis van type en versie. Zet alleen de definitieve versie in Project Onderzoek en archiveer de oude versie.`,
      startFolders: ["Thuis/OneDrive/Project Onderzoek"],
      startFiles: ["Thuis/OneDrive/Project Onderzoek/onderzoek_v1.docx", "Thuis/OneDrive/Project Onderzoek/onderzoek_definitief.docx", "Thuis/OneDrive/Project Onderzoek/resultaten.csv", "Thuis/OneDrive/Project Onderzoek/bron_artikel.pdf", "Thuis/OneDrive/Project Onderzoek/grafiek.png"],
      tasks: [
        { id: "structure", description: "mapstructuur correct.", expectedPaths: ["Thuis/OneDrive/Project Onderzoek/Data", "Thuis/OneDrive/Project Onderzoek/Bronnen", "Thuis/OneDrive/Project Onderzoek/Beelden", "Thuis/OneDrive/Project Onderzoek/Archief"], points: 1 },
        { id: "types", description: "data, bron en beeld correct geplaatst.", expectedPaths: ["Thuis/OneDrive/Project Onderzoek/Data/resultaten.csv", "Thuis/OneDrive/Project Onderzoek/Bronnen/bron_artikel.pdf", "Thuis/OneDrive/Project Onderzoek/Beelden/grafiek.png"], points: 1 },
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
        "Gebruik het venster hieronder om op de juiste manier een e-mail te sturen aan je mentor.\nZorg dat je mentor door deze e-mail het verslag voor Nederlands krijgt.\nJe bent klaar met deze opdracht als je ziet dat jouw e-mail is verzonden.",
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
    pt7: v3Pt7Teddy(spec.id),
    pt8: v3Pt8(spec.id),
  };
};

type AssessmentBuildMeta = {
  assessmentBuildVersion: string;
  contentHashAlgorithm: "sha256";
  assessmentContentHashes: Record<AssessmentVersionId, string>;
};

const assessmentBuildMeta = assessmentBuildMetaSource as AssessmentBuildMeta;

const defaultScoringVersion = (item: AssessmentItem) =>
  `auto-${item.type.replace(/_/g, "-")}-v1`;

const attachProvenance = (assessment: Omit<AssessmentVersion, "assessmentBuildVersion" | "assessmentContentHash" | "contentHashAlgorithm">): AssessmentVersion => ({
  ...assessment,
  assessmentBuildVersion: assessmentBuildMeta.assessmentBuildVersion,
  assessmentContentHash: assessmentBuildMeta.assessmentContentHashes[assessment.id],
  contentHashAlgorithm: assessmentBuildMeta.contentHashAlgorithm,
  sections: assessment.sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      itemVersion: item.itemVersion ?? `${item.id}-v1`,
      scoringVersion: item.scoringVersion ?? defaultScoringVersion(item),
      assessmentBuildVersion: assessmentBuildMeta.assessmentBuildVersion,
    })),
  })),
});

export const assessments: AssessmentVersion[] = versionSpecs
  .map(withV3PerformanceTasks)
  .map(buildAssessment)
  .map((assessment) => attachProvenance(assessment));

export const assessmentMap: Record<AssessmentVersionId, AssessmentVersion> =
  assessments.reduce(
    (map, assessment) => ({
      ...map,
      [assessment.id]: assessment,
    }),
    {} as Record<AssessmentVersionId, AssessmentVersion>,
  );

export const defaultCodeMappings: CodeMapping[] = [
  { codes: ["vmbo1", "6663", "testvmbo1"], instrumentId: "lj1-vmbo", label: "Leerjaar 1 VMBO" },
  { codes: ["hv1", "testhv1"], instrumentId: "lj1-hv", label: "Leerjaar 1 HAVO/VWO" },
  { codes: ["vmbo3", "vmbo 3", "testvmbo3"], instrumentId: "lj3-vmbo", label: "Leerjaar 3 VMBO" },
  { codes: ["hv3", "testhv3"], instrumentId: "lj3-hv", label: "Leerjaar 3 HAVO/VWO" },
];
