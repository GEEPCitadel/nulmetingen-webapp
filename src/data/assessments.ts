import type {
  AssessmentItem,
  AssessmentSection,
  AssessmentVersion,
  AssessmentVersionId,
  BlockProgrammingTaskConfig,
  CodeMapping,
  DataStimulus,
  FileTaskRequirement,
  InteractionTaskConfig,
  MailTaskConfig,
  MockupCard,
  Option,
  ProgrammingBlockDefinition,
  Pt1Node,
  Pt1Simulation,
  TeamsTaskConfig,
  ThemeDefinition,
  WhutsuppTaskConfig,
} from "../types";
import selectedResponseSource from "../../nulmetingen_selected_response_herontwerp_v3.json";
import whutsuppPt8Flow from "./whutsupp_pt8_flow.json";

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
  pt8: Pt8TaskSpec;
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
  config: InteractionTaskConfig;
  aiSnelVeranderendFlag?: boolean;
};

type WhutsuppTaskSpec = {
  id: string;
  title: string;
  instruction: string;
  kerndoel: string;
  config: WhutsuppTaskConfig;
};

type Pt8TaskSpec = SocialTaskSpec | WhutsuppTaskSpec;

type SelectedResponseSpec = {
  id: string;
  title: string;
  kerndoel: string;
  subgoal?: string;
  type?: "single" | "multiple";
  selectCount?: number | null;
  question: string;
  options: SelectedResponseOptionSpec[];
  correct: string | string[];
  harmful?: string[];
  harmfulSelectionMaxScore?: number;
  mockup?: MockupCard;
  dataStimulus?: DataStimulus;
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
  | DataStimulus;

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
  itemType?: "single-choice" | "multiple-select";
  selectCount?: number | null;
  selectionLimit?: number | null;
  question: string;
  stimulus?: SelectedResponseStimulus;
  context?: {
    chatMessage?: {
      sender: string;
      text: string;
    };
  };
  ui?: {
    renderAsSourceCards?: boolean;
    pinUnknownOptionLast?: boolean;
  };
  options: SelectedResponseJsonOption[];
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
};

const UNKNOWN_OPTION_LABEL = "Ik weet het niet.";

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
    label: option.label,
    description: option.description,
    sourceType: option.sourceType,
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
  if (!stimulus || !("kind" in stimulus)) {
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

  return {
    badge: "Adresbalk",
    title: stimulus.label ?? "Browser",
    content: [stimulus.address],
    mediaHint: "Niet-interactieve adresbalk",
  };
};

const dataStimulusForStimulus = (stimulus?: SelectedResponseStimulus): DataStimulus | undefined =>
  stimulus && "type" in stimulus ? stimulus : undefined;

const mockupForContext = (context?: SelectedResponseJsonItem["context"]): MockupCard | undefined => {
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

const getSelectedResponseSpecs = (versionId: AssessmentVersionId): SelectedResponseSpec[] => {
  const sourceItems = selectedResponseItemsFor(versionId);

  if (sourceItems.length !== 10) {
    throw new Error(`${versionId} heeft niet precies 10 selected-response-items.`);
  }

  return sourceItems.map((item) => {
    const correctAnswerIds = correctAnswerIdsFor(item);
    const harmfulAnswerIds = harmfulAnswerIdsFor(item);
    const responseType = selectedResponseTypeFor(item);
    const contentOptions = item.options
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
          correct:
            option.correct === true ||
            option.isCorrect === true ||
            option.score === 1 ||
            correctAnswerIds.has(id) ||
            item.scoring?.correctOptionId === id,
          harmful: option.isHarmful === true || harmfulAnswerIds.has(id),
        };
      });
    const unknownSource = item.options.find((option) => {
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
      dataStimulus: dataStimulusForStimulus(item.stimulus),
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
    "Hoe digitaal geletterd schat je jezelf in?\nSchuif het bolletje naar jouw keuze. 0 betekent: ik schat mezelf helemaal niet digitaal geletterd in. 100 betekent: ik schat mezelf heel digitaal geletterd in.",
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
  points: 4,
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
  id: spec.id,
  type: "social_action_simulation",
  title: spec.title,
  instruction: spec.instruction,
  points: 4,
  skillDomain: "23B Digitaal burgerschap",
  kerndoel: spec.kerndoel,
  aiSnelVeranderendFlag: spec.aiSnelVeranderendFlag,
  socialTask: spec.config,
});

const whutsuppTaskItem = (spec: WhutsuppTaskSpec): AssessmentItem => ({
  id: spec.id,
  type: "whutsupp_scenario_task",
  title: spec.title,
  instruction: spec.instruction,
  points: spec.config.maxPoints,
  skillDomain: "23B Digitaal burgerschap",
  kerndoel: spec.kerndoel,
  subgoal: spec.config.subgoal,
  whutsuppTask: spec.config,
});

const isWhutsuppTaskSpec = (spec: Pt8TaskSpec): spec is WhutsuppTaskSpec =>
  "engine" in spec.config;

const pt8TaskItem = (spec: Pt8TaskSpec): AssessmentItem =>
  isWhutsuppTaskSpec(spec) ? whutsuppTaskItem(spec) : socialTaskItem(spec);

const selectedResponseItem = (spec: SelectedResponseSpec): AssessmentItem => {
  const subgoal = spec.subgoal ?? subgoalCodeFrom(spec.kerndoel);
  const responseType = spec.type ?? "single";

  return {
    id: spec.id,
    type: "multiple_choice",
    title: spec.title,
    instruction: spec.question,
    options: makeSelectedResponseOptions(spec.options),
    correctAnswer: Array.isArray(spec.correct)
      ? spec.correct
      : spec.correct,
    points: 1,
    skillDomain: `${subgoal} ${sloLabels[subgoal] ?? ""}`.trim(),
    kerndoel: spec.kerndoel,
    subgoal,
    allowUnknown: false,
    unknownOptionId: spec.options.find((option) => option.isUnknown)?.id,
    randomizeOptions: true,
    renderOptionsAsSourceCards: spec.renderOptionsAsSourceCards,
    selectionMode: responseType === "multiple" ? "multiple" : "single",
    selectCount: responseType === "multiple" ? (spec.selectCount ?? undefined) : undefined,
    scoreMode: responseType === "multiple" ? "partial_select" : "exact",
    harmfulOptionIds: spec.harmful ?? [],
    harmfulSelectionMaxScore: spec.harmfulSelectionMaxScore,
    mockup: spec.mockup,
    dataStimulus: spec.dataStimulus,
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
    title: "PT7 - Blokprogrammeren",
    items: [blockTaskItem(spec.pt7)],
  },
  {
    id: "pt8",
    title: "PT8 - Online gedrag",
    items: [pt8TaskItem(spec.pt8)],
  },
  {
    id: "sr",
    title: "Meerkeuze",
    instruction: "Kies steeds het beste antwoord.",
    items: getSelectedResponseSpecs(spec.id).map(selectedResponseItem),
  },
];

const buildAssessment = (spec: VersionSpec): AssessmentVersion => {
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
        "Gebruik de Verkenner hieronder.\nMaak alle opdrachten in de linkerkolom.\nLet goed op de bestandsnamen.\nKlik daarna op Taak afronden.",
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
      title: "PT4 - Excel/data sorteren en filteren",
      instruction: excelInstruction("LJ1_VMBO_Liedjes.xlsx"),
      filename: "LJ1_VMBO_Liedjes.xlsx",
      sheetName: "Liedjes",
      questions: [
        {
          id: "a",
          prompt: "Sorteer op Jaar, van nieuw naar oud. Welke code staat bovenaan?",
          answer: "L09",
          points: 2,
        },
        {
          id: "b",
          prompt:
            "Filter op Genre = pop. Sorteer daarna op Jaar, van oud naar nieuw. Welke code staat bovenaan?",
          answer: "L12",
          points: 2,
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
        'Dit is Bizzy, een karakter dat kan bewegen, draaien, zeggen en denken. Programmeer Bizzy door blokken op het werkvlak te slepen. Klik op ▶ om je programma uit te voeren. Je hoeft niet alle blokken te gebruiken.',
      instruction:
        'Als er op afspelen wordt geklikt: Bizzy zegt "Hoi!", loopt 1 meter vooruit, draait naar 180°, en denkt tot slot "Klaar!".',
      config: {
        device: "bizzy",
        codingSteps: [
          "Gebruik het startblok Wanneer er geklikt wordt op afspelen.",
          'Laat Bizzy "Hoi!" zeggen.',
          "Laat Bizzy 1 meter vooruit bewegen.",
          "Laat Bizzy naar 180° draaien.",
          'Laat Bizzy daarna "Klaar!" denken.',
        ],
        blocks: [
          block("Wanneer er geklikt wordt op afspelen", "gebeurtenissen"),
          block("wanneer er op Bizzy wordt geklikt", "gebeurtenissen"),
          block("verander animatie van Bizzy naar niet animeren", "uiterlijk"),
          block('Bizzy zegt "Hoi!"', "uiterlijk"),
          block('Bizzy denkt "Klaar!"', "uiterlijk"),
          block("verplaats Bizzy 1 meter vooruit in 1 sec.", "beweging"),
          block("verplaats Bizzy 1 meter achteruit in 1 sec.", "beweging", {
            isCriticalDistractor: true,
          }),
          block("draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.", "beweging"),
          block("draai Bizzy met de wijzers van de klok mee naar 90° in 1 sec.", "beweging", {
            isCriticalDistractor: true,
          }),
          block("wacht 1 seconde", "besturing"),
          block("herstart scene", "besturing", { isCriticalDistractor: true }),
          block("als 1 < 2", "besturing", { isCriticalDistractor: true }),
        ],
        correctProgram: [
          "Wanneer er geklikt wordt op afspelen",
          'Bizzy zegt "Hoi!"',
          "verplaats Bizzy 1 meter vooruit in 1 sec.",
          "draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.",
          'Bizzy denkt "Klaar!"',
        ],
        criteriaSpec: "pt7-lj1v-v7",
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
            title: "Scherm 2 - Klassenapp",
            instruction:
              'In de klassenapp van klas 1V2 staat een bewerkte foto van Sam. Er staat: "Stuur door 😂". Sam zegt: "Stop, ik wil dit niet." Kies twee acties die jij zou doen.',
            body:
              "Rapporteren = via de meld-knop in de app aan de beheerder of het platform melden.",
            groups: [
              {
                id: "actions",
                title: "Kies twee acties die jij zou doen.",
                inputType: "multi",
                options: fixedOptions([
                  "Doorsturen",
                  "Reactie plaatsen om de sfeer luchtig te houden",
                  "Rapporteren",
                  "Niet doorsturen",
                  "Aan mentor of vertrouwenspersoon melden",
                  "Een neutrale reactie plaatsen ('ik weet niet wat ik moet zeggen')",
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
            description: "minstens twee correcte acties en geen schadelijke actie.",
            points: 1,
            groupId: "actions",
            kind: "minCorrect",
            minCorrect: 2,
            correctOptionIds: [
              "Niet doorsturen",
              "Rapporteren",
              "Aan mentor of vertrouwenspersoon melden",
            ],
            forbiddenByGroup: {
              actions: [
                "Doorsturen",
                "Reactie plaatsen om de sfeer luchtig te houden",
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
        "Gebruik de Verkenner hieronder.\nMaak alle opdrachten in de linkerkolom.\nLet goed op de bestandsnamen.\nKlik daarna op Taak afronden.",
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
      title: "PT4 - Excel/data sorteren en filteren",
      instruction: excelInstruction("LJ1_HV_Bibliotheek.xlsx"),
      filename: "LJ1_HV_Bibliotheek.xlsx",
      sheetName: "Boeken",
      questions: [
        {
          id: "a",
          prompt: "Sorteer op Jaar, van nieuw naar oud. Welke code staat bovenaan?",
          answer: "B07",
          points: 2,
        },
        {
          id: "b",
          prompt:
            "Filter op Vak = biologie. Sorteer daarna op Jaar, van oud naar nieuw. Welke code staat bovenaan?",
          answer: "B06",
          points: 2,
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
        "Dit is Bizzy, een karakter dat kan bewegen, draaien, zeggen en denken. Programmeer Bizzy door blokken op het werkvlak te slepen. Klik op ▶ om je programma uit te voeren. Je hoeft niet alle blokken te gebruiken.",
      instruction:
        'Als er op afspelen wordt geklikt: Bizzy zegt "Klaar voor de start!", loopt drie keer 1 meter vooruit met een herhaal-blok, en draait naar 180°.',
      config: {
        device: "bizzy",
        codingSteps: [
          "Gebruik het startblok Wanneer er geklikt wordt op afspelen.",
          'Laat Bizzy "Klaar voor de start!" zeggen.',
          "Gebruik herhaal 3 keer.",
          "Zet verplaats Bizzy 1 meter vooruit in de herhaling.",
          "Laat Bizzy na de herhaling naar 180° draaien.",
        ],
        blocks: [
          block("Wanneer er geklikt wordt op afspelen", "gebeurtenissen"),
          block("verander animatie van Bizzy naar niet animeren", "uiterlijk"),
          block('Bizzy zegt "Klaar voor de start!"', "uiterlijk"),
          block('Bizzy denkt "Hm..."', "uiterlijk", { isCriticalDistractor: true }),
          block("verplaats Bizzy 1 meter vooruit in 1 sec.", "beweging"),
          block("verplaats Bizzy 3 meter vooruit in 1 sec.", "beweging", {
            isCriticalDistractor: true,
          }),
          block("verplaats Bizzy 1 meter achteruit in 1 sec.", "beweging", {
            isCriticalDistractor: true,
          }),
          block("draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.", "beweging"),
          block("draai Bizzy met de wijzers van de klok mee naar 90° in 1 sec.", "beweging", {
            isCriticalDistractor: true,
          }),
          block("als 1 < 2", "besturing", { isContainer: true, isCriticalDistractor: true }),
          block("herhaal 3 keer", "besturing", { isContainer: true }),
          block("herhaal 10 keer", "besturing", { isContainer: true, isCriticalDistractor: true }),
          block("herhaal 1 keer", "besturing", { isContainer: true, isCriticalDistractor: true }),
          block("wacht 1 seconde", "besturing"),
          block("herstart scene", "besturing", { isCriticalDistractor: true }),
        ],
        correctProgram: [
          "Wanneer er geklikt wordt op afspelen",
          'Bizzy zegt "Klaar voor de start!"',
          "herhaal 3 keer",
          "verplaats Bizzy 1 meter vooruit in 1 sec.",
          "draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.",
        ],
        criteriaSpec: "pt7-lj1h-v7",
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
        "Een app probeert Silke steeds naar dezelfde keuze te sturen.\nOpen de instellingen.\nKies een veilige meldingsinstelling.\nKlik daarna op Taak afronden.",
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
        "Gebruik de Verkenner hieronder.\nMaak alle opdrachten in de linkerkolom.\nLet goed op mappen en bestandsnamen.\nKlik daarna op Taak afronden.",
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
          points: 2,
        },
        {
          id: "b",
          prompt:
            "Filter op Bedrag > 60. Sorteer daarna op Bedrag, van hoog naar laag. Welke code staat bovenaan?",
          answer: "W06",
          points: 2,
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
        "Dit is Bizzy, een karakter dat kan bewegen, draaien, zeggen en denken. Programmeer Bizzy door blokken op het werkvlak te slepen. Klik op ▶ om je programma uit te voeren. Je hoeft niet alle blokken te gebruiken.",
      instruction:
        'Bizzy loopt een vierkant op het werkvlak. Elke zijde is 1 meter; op elke hoek draait Bizzy een kwartslag (90°). Bizzy zegt vóór het lopen "Start!" en denkt na het lopen "Klaar!".',
      config: {
        device: "bizzy",
        codingSteps: [
          'Laat Bizzy eerst "Start!" zeggen.',
          "Gebruik herhaal 4 keer.",
          "Zet daarin verplaats 1 meter vooruit en daarna draai 90°.",
          'Laat Bizzy na het vierkant "Klaar!" denken.',
        ],
        blocks: [
          block("Wanneer er geklikt wordt op afspelen", "gebeurtenissen"),
          block("verander animatie van Bizzy naar niet animeren", "uiterlijk"),
          block('Bizzy zegt "Start!"', "uiterlijk"),
          block('Bizzy denkt "Klaar!"', "uiterlijk"),
          block('Bizzy zegt "Klaar!"', "uiterlijk", { isCriticalDistractor: true }),
          block("verplaats Bizzy 1 meter vooruit in 1 sec.", "beweging"),
          block("verplaats Bizzy 1 meter achteruit in 1 sec.", "beweging", {
            isCriticalDistractor: true,
          }),
          block("draai Bizzy met de wijzers van de klok mee naar 90° in 1 sec.", "beweging"),
          block("draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.", "beweging", {
            isCriticalDistractor: true,
          }),
          block("herhaal 4 keer", "besturing", { isContainer: true }),
          block("herhaal 3 keer", "besturing", { isContainer: true, isCriticalDistractor: true }),
          block("herhaal 2 keer", "besturing", { isContainer: true, isCriticalDistractor: true }),
          block("wacht 1 seconde", "besturing"),
          block("als 1 < 2", "besturing", { isContainer: true, isCriticalDistractor: true }),
          block("herstart scene", "besturing", { isCriticalDistractor: true }),
        ],
        correctProgram: [
          "Wanneer er geklikt wordt op afspelen",
          'Bizzy zegt "Start!"',
          "herhaal 4 keer",
          "verplaats Bizzy 1 meter vooruit in 1 sec.",
          "draai Bizzy met de wijzers van de klok mee naar 90° in 1 sec.",
          'Bizzy denkt "Klaar!"',
        ],
        criteriaSpec: "pt7-lj3v-v7",
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
        "Gebruik de Verkenner hieronder.\nMaak alle opdrachten in de linkerkolom.\nLet goed op mappen en bestandsnamen.\nKlik daarna op Taak afronden.",
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
          points: 2,
        },
        {
          id: "b",
          prompt:
            "Filter op Woningtype = B. Sorteer daarna op Jaar, van nieuw naar oud. Welke code staat bovenaan?",
          answer: "E02",
          points: 2,
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
        "Dit is Bizzy, een karakter dat kan bewegen, draaien, zeggen en denken. Programmeer Bizzy door blokken op het werkvlak te slepen. Klik op ▶ om je programma uit te voeren. Je hoeft niet alle blokken te gebruiken.",
      instruction:
        'Bizzy danst een choreografie. Drie keer maakt hij hetzelfde heen-en-weer-rondje: 2 meter vooruit, omdraaien (180°), 2 meter vooruit (= terug), opnieuw omdraaien (180°). Aan het eind zegt hij "Bravo!".',
      config: {
        device: "bizzy",
        codingSteps: [
          "Gebruik herhaal 3 keer.",
          "Zet daarin: verplaats 2 meter vooruit, draai 180°, verplaats 2 meter vooruit, draai 180°.",
          'Laat Bizzy na de herhaling "Bravo!" zeggen.',
        ],
        blocks: [
          block("Wanneer er geklikt wordt op afspelen", "gebeurtenissen"),
          block("verander animatie van Bizzy naar niet animeren", "uiterlijk"),
          block('Bizzy zegt "Bravo!"', "uiterlijk"),
          block('Bizzy denkt "Bravo!"', "uiterlijk", { isCriticalDistractor: true }),
          block("verplaats Bizzy 2 meter vooruit in 1 sec.", "beweging"),
          block("verplaats Bizzy 1 meter vooruit in 1 sec.", "beweging", {
            isCriticalDistractor: true,
          }),
          block("verplaats Bizzy 2 meter achteruit in 1 sec.", "beweging", {
            isCriticalDistractor: true,
          }),
          block("draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.", "beweging"),
          block("draai Bizzy met de wijzers van de klok mee naar 90° in 1 sec.", "beweging", {
            isCriticalDistractor: true,
          }),
          block("herhaal 3 keer", "besturing", { isContainer: true }),
          block("herhaal 6 keer", "besturing", { isContainer: true, isCriticalDistractor: true }),
          block("herhaal 2 keer", "besturing", { isContainer: true, isCriticalDistractor: true }),
          block("wacht 1 seconde", "besturing"),
          block("als 1 < 2", "besturing", { isContainer: true, isCriticalDistractor: true }),
          block("herstart scene", "besturing", { isCriticalDistractor: true }),
        ],
        correctProgram: [
          "Wanneer er geklikt wordt op afspelen",
          "herhaal 3 keer",
          "verplaats Bizzy 2 meter vooruit in 1 sec.",
          "draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.",
          "verplaats Bizzy 2 meter vooruit in 1 sec.",
          "draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.",
          'Bizzy zegt "Bravo!"',
        ],
        criteriaSpec: "pt7-lj3h-v7",
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
  "Gebruik de verkenner hieronder. Voer de taken uit en klik daarna op 'Volgende'.";

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
    "mentor@school.nl",
    "docent@school.nl",
    "stagebegeleider@bedrijf.nl",
    "projectgenoot@school.nl",
    "groepsgenoot1@school.nl",
    "groepsgenoot2@school.nl",
    "klasgroep@school.nl",
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
  const specs: Record<AssessmentVersionId, SecurityTaskSpec> = {
    "lj1-vmbo": {
      id: "lj1v-pt3-security",
      title: "PT3 - Bericht beoordelen",
      instruction: "Bekijk de e-mail en kies het beste antwoord.",
      kerndoel: "23A",
      config: {
        screens: [
          {
            id: "rooster-mail",
            title: "Mail over je rooster",
            instruction:
              "Sanne krijgt deze mail op haar schoolaccount. Ze twijfelt wat ze ermee moet doen.",
            emailStimulus: {
              fromName: "Rooster service",
              fromEmail: "r0st3r-88xq91@mx7-info-update.net",
              toEmail: "sanne@leerling.citadelcollege.nl",
              date: "Vandaag 08:14",
              subject: "Nieuw rooster staat klaar",
              body: [
                "Hallo leerling,",
                "Je nieuwe rooster staat klaar. Log vandaag nog in om te voorkomen dat je lessen mist.",
                "Gebruik de knop hieronder om je rooster direct te openen.",
              ],
              linkLabel: "Rooster bekijken",
              linkUrl: "https://school-rooster-login-24.example.net/start",
            },
            groups: [
              {
                id: "action",
                title: "Je krijgt deze mail over je rooster. Wat doe je?",
                inputType: "single",
                options: fixedOptions([
                  "Ik klik op de knop in de mail.",
                  "Ik open mijn rooster via de roosterapp van school.",
                  "Ik stuur de mail door naar mijn klas.",
                  "Ik antwoord op de mail met mijn schoolaccount.",
                ]),
              },
            ],
          },
        ],
        rules: [
          { id: "safe-route", description: "kiest de roosterapp van school in plaats van de mailknop.", points: 1, groupId: "action", kind: "singleCorrect", correctOptionIds: ["Ik open mijn rooster via de roosterapp van school."] },
        ],
      },
    },
    "lj1-hv": {
      id: "lj1h-pt3-security",
      title: "PT3 - Bericht beoordelen",
      instruction: "Bekijk de e-mail en kies het beste antwoord.",
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
                id: "action",
                title: "Je krijgt deze mail over accountcontrole. Wat doe je?",
                inputType: "single",
                options: fixedOptions([
                  "Ik stuur mijn tijdelijke inlogcode terug, omdat de mail over mijn account gaat.",
                  "De link openen en daar de code invullen.",
                  "Ik controleer mijn account via de normale schoolroute en deel geen code.",
                  "Ik stuur de mail door naar klasgenoten om te vragen of zij hem ook hebben.",
                ]),
              },
            ],
          },
        ],
        rules: [
          { id: "safe-account-route", description: "controleert via de normale schoolroute en deelt geen code.", points: 1, groupId: "action", kind: "singleCorrect", correctOptionIds: ["Ik controleer mijn account via de normale schoolroute en deel geen code."] },
        ],
      },
    },
    "lj3-vmbo": {
      id: "lj3v-pt3-security",
      title: "PT3 - Bericht beoordelen",
      instruction: "Bekijk de e-mail en kies het beste antwoord.",
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
                id: "action",
                title: "Je krijgt deze mail over je cijferlijst. Wat doe je?",
                inputType: "single",
                options: fixedOptions([
                  "Ik open de bijlage en schakel bewerken in, want het gaat over mijn cijfers.",
                  "Ik log in via de link en controleer daarna of mijn cijfers kloppen.",
                  "Ik controleer mijn cijfers via het normale schoolportaal en open de bijlage niet.",
                  "Ik stuur de bijlage naar een klasgenoot om te vragen of die hem kan openen.",
                ]),
              },
            ],
          },
        ],
        rules: [
          { id: "safe-grade-route", description: "controleert cijfers via het schoolportaal en opent de bijlage niet.", points: 1, groupId: "action", kind: "singleCorrect", correctOptionIds: ["Ik controleer mijn cijfers via het normale schoolportaal en open de bijlage niet."] },
        ],
      },
    },
    "lj3-hv": {
      id: "lj3h-pt3-security",
      title: "PT3 - Bericht beoordelen",
      instruction: "Bekijk de e-mail en kies het beste antwoord.",
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
                id: "action",
                title: "Je krijgt deze mail over accountactiviteit. Wat doe je?",
                inputType: "single",
                options: fixedOptions([
                  "Ik vernieuw mijn wachtwoord via de knop, omdat de mail mij bij naam noemt.",
                  "Ik ga zelf naar de officiele accountinstellingen en controleer sessies en beveiliging daar.",
                  "Ik antwoord op de mail en vraag of de afzender kan bewijzen dat het van school is.",
                  "Ik negeer de mail zonder verder te controleren, want dan kan er niets gebeuren.",
                ]),
              },
            ],
          },
        ],
        rules: [
          { id: "safe-account-settings", description: "controleert accountactiviteit via de officiele accountinstellingen.", points: 1, groupId: "action", kind: "singleCorrect", correctOptionIds: ["Ik ga zelf naar de officiele accountinstellingen en controleer sessies en beveiliging daar."] },
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
      title: "PT8 - Online gedrag: groepschat",
      instruction: "Bekijk wat er in de groepschat gebeurt. Kies per scherm de beste reactie.",
      kerndoel: "23B",
      config: {
        screens: [
          {
            id: "judgement",
            title: "Groepschat: grap of grens?",
            instruction: "In de klassenchat plaatst iemand een korte video van Sam die struikelt. Er staat bij: \"Stuur door 😂\". Sam schrijft daarna: \"Haal weg, ik vind dit niet leuk.\" Jij ziet het bericht.",
            groups: [{ id: "problem", title: "Wat is hier het belangrijkste probleem?", inputType: "single", options: fixedOptions(["Sam geeft duidelijk aan dat hij dit niet wil.", "De video is grappig, dus het maakt niet uit.", "Het is pas een probleem als een docent het ziet.", "Het is geen probleem omdat het in een besloten chat staat."]) }],
          },
          {
            id: "actions",
            title: "Acties",
            instruction: "Wat doe je? Kies alle acties die je zou doen.",
            groups: [{ id: "actions", title: "Acties", inputType: "multi", options: fixedOptions(["Niet doorsturen, liken of grappig reageren.", "Sam of een mentor laten weten dat dit niet oké is.", "Vragen of de plaatser de video verwijdert.", "Doorsturen naar één vriend om te vragen wat hij vindt.", "Een grapje terugplaatsen zodat het minder serieus lijkt."]) }],
          },
        ],
        rules: [
          { id: "risk", description: "herkent het probleem of risico.", points: 1, groupId: "problem", kind: "singleCorrect", correctOptionIds: ["Sam geeft duidelijk aan dat hij dit niet wil."] },
          { id: "no-spread", description: "voorkomt verdere verspreiding of escalatie.", points: 1, groupId: "actions", kind: "allSelected", correctOptionIds: ["Niet doorsturen, liken of grappig reageren."] },
          { id: "help", description: "schakelt passende hulp of melding in.", points: 1, groupId: "actions", kind: "allSelected", correctOptionIds: ["Sam of een mentor laten weten dat dit niet oké is."] },
          { id: "followup", description: "kiest een veilige vervolgstap.", points: 1, groupId: "actions", kind: "allSelected", correctOptionIds: ["Vragen of de plaatser de video verwijdert."] },
        ],
        scoreCaps: cap(["Doorsturen naar één vriend om te vragen wat hij vindt.", "Een grapje terugplaatsen zodat het minder serieus lijkt."], ["actions"]),
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
    id: "pt8-lj1v-online-behaviour-groepschat-v35",
    title: "PT8 - Online gedrag: groepschat",
    instruction: "Bekijk wat er in de groepschat gebeurt. Kies per scherm de beste reactie.",
    kerndoel: "23B",
    config: {
      screens: [
        {
          id: "screen1",
          title: "Groepschat: grap of grens?",
          instruction: "Wat is nu de beste eerste reactie van jou?",
          body: "In de klassenchat deelt iemand een korte video van Sam. In de video struikelt Sam op het schoolplein.\n\nBij de video staat:\n\n\"Haha kijk Sam 😂 stuur door\"\n\nEen paar leerlingen reageren met lach-emoji's.\n\nIemand schrijft:\n\n\"Ik zet hem ook in de andere klasgroep.\"\n\nSam reageert daarna:\n\n\"Haal weg. Ik wil dit niet online.\"",
          groups: [{ id: "screen1", title: "Kies de beste reactie", inputType: "single", options: [
            { id: "s1-no-share-no-react", label: "Niet reageren met een lach-emoji en de video niet verder verspreiden." },
            { id: "s1-wait-for-group", label: "Eerst kijken hoeveel anderen lachen voordat je beslist wat je doet." },
            { id: "s1-send-one-friend", label: "De video naar één goede vriend sturen om te vragen of het echt erg is." },
            { id: "s1-joke-back", label: "Een grapje maken, zodat Sam merkt dat het niet gemeen bedoeld is." },
            { id: "s1-unknown", label: "Ik weet het niet." },
          ] }],
        },
        {
          id: "screen2",
          title: "Herstelactie richting plaatser",
          instruction: "Wat kun je het beste tegen de plaatser zeggen?",
          groups: [{ id: "screen2", title: "Kies de beste reactie", inputType: "single", options: [
            { id: "s2-remove-and-stop", label: "Sam wil dit niet. Haal de video weg en stuur hem niet verder." },
            { id: "s2-send-to-others", label: "Stuur hem alleen naar mensen die Sam niet goed kennen." },
            { id: "s2-wait-for-teacher", label: "Verwijder hem pas als een docent er iets van zegt." },
            { id: "s2-make-sticker", label: "Maak er dan maar een sticker van, dan is het minder serieus." },
            { id: "s2-unknown", label: "Ik weet het niet." },
          ] }],
        },
        {
          id: "screen3",
          title: "Respectvolle steun",
          instruction: "Wat is een goede reactie naar Sam?",
          groups: [{ id: "screen3", title: "Kies de beste reactie", inputType: "single", options: [
            { id: "s3-support-sam", label: "Sam laten weten dat je de video niet doorstuurt en dat hij hulp kan vragen als hij dat wil." },
            { id: "s3-dont-exaggerate", label: "Sam zeggen dat hij zich niet zo moet aanstellen, omdat iedereen weleens struikelt." },
            { id: "s3-more-videos", label: "Sam vragen of hij nog meer filmpjes van zichzelf heeft, zodat het eerlijk blijft." },
            { id: "s3-leave-chat", label: "Sam adviseren om uit de groepschat te gaan, dan ziet hij het niet meer." },
            { id: "s3-unknown", label: "Ik weet het niet." },
          ] }],
        },
        {
          id: "screen4",
          title: "Hulp of melding",
          instruction: "Wanneer is het verstandig om een mentor of andere volwassene in te schakelen?",
          groups: [{ id: "screen4", title: "Kies de beste reactie", inputType: "single", options: [
            { id: "s4-if-continues-or-harms", label: "Als de video blijft rondgaan of Sam er last van blijft houden." },
            { id: "s4-only-after-100-views", label: "Alleen als de video meer dan honderd keer bekeken is." },
            { id: "s4-only-if-me", label: "Alleen als jij zelf in de video te zien bent." },
            { id: "s4-never-private-chat", label: "Nooit, want wat in een groepschat gebeurt moet in de groepschat blijven." },
            { id: "s4-unknown", label: "Ik weet het niet." },
          ] }],
        },
      ],
      rules: [
        { id: "screen1", description: "niet verspreiden en niet meedoen aan groepsdruk.", points: 1, groupId: "screen1", kind: "singleCorrect", correctOptionIds: ["s1-no-share-no-react"] },
        { id: "screen2", description: "benoemt Sams grens en vraagt om verwijderen/niet doorsturen.", points: 1, groupId: "screen2", kind: "singleCorrect", correctOptionIds: ["s2-remove-and-stop"] },
        { id: "screen3", description: "biedt Sam respectvolle steun zonder verdere verspreiding.", points: 1, groupId: "screen3", kind: "singleCorrect", correctOptionIds: ["s3-support-sam"] },
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

const whutsuppPt8 = (versionId: AssessmentVersionId): WhutsuppTaskSpec => {
  const flow = whutsuppPt8Flow as WhutsuppTaskConfig;
  const variant = flow.variants.find((candidate) => candidate.assessmentId === versionId);
  return {
    id: flow.taskId,
    title: flow.title,
    instruction:
      variant?.introText ??
      "Je zit in een Whutsupp-groepschat. Kies wat jij doet.",
    kerndoel: flow.subgoal,
    config: flow,
  };
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
        blocks: [block("bij start", "gebeurtenissen", { isContainer: true }), block("2 stappen vooruit", "beweging"), block("draai naar rechts", "beweging"), block('zeg "Klaar"', "uiterlijk"), block("draai naar links", "beweging", { isCriticalDistractor: true })],
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
        blocks: [block("bij start", "gebeurtenissen", { isContainer: true }), block("herhaal 4 keer", "besturing", { isContainer: true }), block("1 stap vooruit", "beweging"), block("rechts draaien", "beweging"), block('zeg "Vierkant"', "uiterlijk"), block("herhaal 3 keer", "besturing", { isContainer: true, isCriticalDistractor: true })],
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
        blocks: [block("bij start", "gebeurtenissen", { isContainer: true }), block("zet teller op 0", "variabelen"), block("als knop A wordt ingedrukt", "gebeurtenissen", { isContainer: true }), block("verander teller met 1", "variabelen"), block("als teller >= 5 dan", "besturing", { isContainer: true }), block('zeg "Vol"', "uiterlijk"), block("anders", "besturing", { isContainer: true }), block('zeg "Nog plek"', "uiterlijk")],
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
        blocks: [block("lees temperatuur", "waarnemen"), block("lees raamOpen", "waarnemen"), block("als temperatuur > 25 EN raamOpen = ja dan", "besturing", { isContainer: true }), block('toon "Koelen"', "uiterlijk"), block("anders", "besturing", { isContainer: true }), block('toon "Oké"', "uiterlijk"), block("als temperatuur > 25 OF raamOpen = ja dan", "besturing", { isContainer: true, isCriticalDistractor: true })],
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

const withV3PerformanceTasks = (spec: VersionSpec): VersionSpec => {
  const files: Record<AssessmentVersionId, FileTaskSpec> = {
    "lj1-vmbo": {
      id: "lj1v-pt1-files",
      title: "PT1 - Bestanden en mappen beheren",
      instruction: `${v3FileInstruction}\n1. Maak in OneDrive een map aan met de naam Project Dieren.\n2. Maak in de map Project Dieren drie nieuwe mappen aan: Tekst, Afbeeldingen en Bronnen.\n3. Verplaats het pdf-bestand naar Bronnen, het docx-bestand naar Tekst en het jpg-bestand naar Afbeeldingen.\n4. Verander de naam van concept_dieren.docx in project_dieren_verslag.docx.`,
      startFolders: ["Thuis/OneDrive"],
      startFiles: ["Thuis/OneDrive/concept_dieren.docx", "Thuis/OneDrive/foto_kat.jpg", "Thuis/OneDrive/bron_dieren.pdf"],
      tasks: [
        { id: "main", description: "hoofdmap Project Dieren correct.", expectedPath: "Thuis/OneDrive/Project Dieren", points: 1 },
        { id: "subfolders", description: "drie projectmappen correct.", expectedPaths: ["Thuis/OneDrive/Project Dieren/Tekst", "Thuis/OneDrive/Project Dieren/Afbeeldingen", "Thuis/OneDrive/Project Dieren/Bronnen"], points: 1 },
        { id: "placed", description: "afbeelding en bron correct geplaatst.", expectedPaths: ["Thuis/OneDrive/Project Dieren/Afbeeldingen/foto_kat.jpg", "Thuis/OneDrive/Project Dieren/Bronnen/bron_dieren.pdf"], points: 1 },
        { id: "rename", description: "verslag correct hernoemd en geplaatst.", expectedPath: "Thuis/OneDrive/Project Dieren/Tekst/project_dieren_verslag.docx", forbiddenPaths: ["Thuis/OneDrive/concept_dieren.docx"], points: 1 },
      ],
    },
    "lj1-hv": {
      id: "lj1h-pt1-files",
      title: "PT1 - Bestanden en mappen beheren",
      instruction: `${v3FileInstruction}\n1. Maak in OneDrive een map aan met de naam Project Water.\n2. Maak in Project Water de submappen Bronnen, Afbeeldingen en Verslag.\n3. Verplaats bron_water.pdf naar Bronnen.\n4. Verplaats waterfoto.png naar Afbeeldingen.\n5. Verplaats concept_verslag.docx naar Verslag en hernoem het bestand naar project_water_verslag.docx.\n6. Verplaats presentatie_water.pptx naar Verslag en hernoem het bestand naar project_water_presentatie.pptx.`,
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
      instruction: `${v3FileInstruction}\n1. Open in OneDrive de map Stageproject.\n2. Maak in Stageproject de submappen Actueel en Oud.\n3. Verplaats stageverslag_v1.docx en stageverslag_v2.docx naar Oud.\n4. Verplaats stageverslag_v3.docx naar Actueel en hernoem het bestand naar stageverslag_2026_definitief.docx.`,
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
      instruction: `${v3FileInstruction}\n1. Open in OneDrive de map Project Onderzoek.\n2. Maak in Project Onderzoek de submappen Data, Bronnen, Beelden en Archief.\n3. Verplaats resultaten.csv naar Data.\n4. Verplaats bron_artikel.pdf naar Bronnen.\n5. Verplaats grafiek.png naar Beelden.\n6. Verplaats onderzoek_v1.docx naar Archief.\n7. Laat onderzoek_definitief.docx in Project Onderzoek staan.`,
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
    pt7: spec.pt7,
    pt8: whutsuppPt8(spec.id),
  };
};

export const assessments: AssessmentVersion[] = versionSpecs
  .map(withV3PerformanceTasks)
  .map(buildAssessment);

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
