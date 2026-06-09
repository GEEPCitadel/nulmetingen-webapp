export type AssessmentVersionId = "lj1-vmbo" | "lj1-hv" | "lj3-vmbo" | "lj3-hv";
export type InstrumentId = AssessmentVersionId;
export type ThemeKey =
  | "limeTeal"
  | "skyOrange"
  | "mintPink"
  | "roseNavy"
  | "rainbowCream";

/** Slug that maps a theme to one of the 5 Citadel palettes (P1-P5).
 *  Used on the app root as `data-theme="p4"` so every nested component
 *  reads --t-* tokens from one place. */
export type PaletteSlug = "p1" | "p2" | "p3" | "p4" | "p5";

export type AssessmentItemType =
  | "self_assessment"
  | "multiple_choice"
  | "file_task_simulation"
  | "outlook_mail_simulation"
  | "account_security_simulation"
  | "excel_download_task"
  | "office_format_download_task"
  | "powerpoint_design_task"
  | "teams_share_simulation"
  | "block_programming_task"
  | "source_evaluation"
  | "social_action_simulation";

export type SelectedAnswer =
  | string
  | string[]
  | number
  | Record<string, unknown>
  | null;

export type ResponseType = "correct" | "incorrect" | "unknown" | "skipped";

export interface Option {
  id: string;
  label: string;
  description?: string;
  sourceType?: string;
  errorCategory?: string;
  riskFlag?: string;
  unknown?: boolean;
  exclusive?: boolean;
}

export interface ThemeDefinition {
  key: ThemeKey;
  /** P1-P5 slug. Set on the .app root as `data-theme={palette}`. */
  palette: PaletteSlug;
  label: string;
  primary: string;
  secondary: string;
  tertiary: string;
  panel: string;
  ribbon: string;
  accent: string;
  logo: string;
}

export interface MockupCard {
  badge?: string;
  title: string;
  subtitle?: string;
  content: string[];
  chatMessages?: Array<{
    sender: "student" | "ai";
    label: string;
    text: string;
  }>;
  footer?: string;
  mediaHint?: string;
  meta?: string[];
}

export interface Pt1Node {
  id: string;
  name: string;
  type: "file" | "folder";
  parentId: string | null;
}

export interface Pt1Simulation {
  rootId: string;
  nodes: Pt1Node[];
}

export interface Pt1ActionLog {
  actionType: string;
  sourcePath?: string;
  targetPath?: string;
  oldName?: string;
  newName?: string;
  extra?: string;
  timestamp: string;
}

export interface Pt1TaskResult {
  taskId: string;
  description: string;
  correct: boolean;
}

export interface Pt1State {
  nodes: Pt1Node[];
  actionLogs: Pt1ActionLog[];
  undoStack: Pt1Node[][];
  completed: boolean;
  score: number;
  taskResults: Pt1TaskResult[];
}

export interface FileTaskRequirement {
  id: string;
  description: string;
  expectedPath?: string;
  expectedPaths?: string[];
  forbiddenPaths?: string[];
  points: number;
}

export interface FileTaskConfig {
  tasks: FileTaskRequirement[];
  simulation: Pt1Simulation;
}

export interface CorrectState {
  requiredPaths?: FileTaskRequirement[];
}

export interface SpreadsheetTable {
  columns: string[];
  rows: string[][];
}

export interface SelfAssessmentScaleLabel {
  value: number;
  label: string;
}

export interface MailCondition {
  field: "to" | "cc" | "bcc" | "subject" | "attachments" | "links" | "priority" | "sent";
  operator: "includes" | "allInclude" | "equals" | "noneInclude" | "true";
  value?: string | string[];
}

export interface MailScoringRule {
  id: string;
  description: string;
  points: number;
  conditions: MailCondition[];
}

export interface MailTaskConfig {
  visibleButtons: string[];
  contacts: string[];
  files: string[];
  rules: MailScoringRule[];
}

export interface DownloadQuestionTolerance {
  /** When true, the answer is treated as a number and compared with deltaAbs. */
  numeric?: boolean;
  /** Absolute tolerance for numeric comparison, e.g. 0.01. */
  deltaAbs?: number;
}

export interface DownloadQuestion {
  id: string;
  prompt: string;
  /** Either a short-code answer (string) or a numeric answer used with tolerance. */
  answer: string | number;
  points: number;
  tolerance?: DownloadQuestionTolerance;
}

export interface ExcelDownloadTaskConfig {
  filename: string;
  sheetName: string;
  questions: DownloadQuestion[];
}

export interface OfficeFormatTaskConfig {
  filename: string;
  sheetName?: string;
  code: string;
  codeCells: string[];
  codeQuestion: string;
  codePoints: number;
  exportQuestion: string;
  exportActions: string[];
  correctExportAction: string;
  exportPoints: number;
}

export interface PowerPointChoiceGroup {
  id: string;
  title: string;
  options: Option[];
}

export interface PowerPointScoringRule {
  id: string;
  description: string;
  points: number;
  groupId: string;
  correctOptionIds: string[];
}

export interface PowerPointTaskConfig {
  scenario: string;
  groups: PowerPointChoiceGroup[];
  rules: PowerPointScoringRule[];
}

export interface TeamsScoringRule {
  id: string;
  description: string;
  points: number;
  conditions: Array<
    | "clicked_share"
    | "clicked_window"
    | "selected_windows_media_player"
    | "correctSequence"
    | "shareOpened"
    | "computerSoundOn"
    | "mediaPlayerSelected"
    | "notWholeScreen"
  >;
}

export interface TeamsTaskConfig {
  scenario: string;
  buttons: string[];
  shareOptions: string[];
  windows: string[];
  correctWindow: string;
  rules: TeamsScoringRule[];
}

export interface BlockScoringRule {
  id: string;
  description: string;
  points: number;
  firstBlock?: string;
  exactLength?: number;
  requiredBlocks?: string[];
  orderedBlocks?: string[];
  forbiddenBlocks?: string[];
  nestedBlocks?: Array<{ parent: string; child: string }>;
  requireExecuted?: boolean;
}

export interface ProgrammingBlockDefinition {
  label: string;
  category: string;
  color: string;
  isContainer?: boolean;
  isCriticalDistractor?: boolean;
}

export type BlockCriteriaSpec = "pt7-lj1v" | "pt7-lj1h" | "pt7-lj3v" | "pt7-lj3h";

export interface BlockProgrammingTaskConfig {
  intro?: string;
  device?: "bizzy" | "microbit" | "sensor";
  codingSteps?: string[];
  blocks: ProgrammingBlockDefinition[];
  correctProgram: string[];
  rules: BlockScoringRule[];
  /** When set, scoring follows the V6 criteria table for the given spec
   *  instead of the generic `rules` array. */
  criteriaSpec?: BlockCriteriaSpec;
}

export type InteractionInputType = "single" | "multi" | "toggle" | "matching";

export interface InteractionGroup {
  id: string;
  title: string;
  instruction?: string;
  inputType: InteractionInputType;
  options?: Option[];
  cards?: Option[];
  maxSelections?: number;
}

export interface IncomingMailStimulus {
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

export interface InteractionScoringRule {
  id: string;
  description: string;
  points: number;
  partialPoints?: number;
  groupId: string;
  kind:
    | "singleCorrect"
    | "allSelected"
    | "minCorrect"
    | "noForbidden"
    | "toggleOn"
    | "matchingAll"
    | "matchingPartial";
  correctOptionIds?: string[];
  alternativeCorrectOptionIdsByGroup?: Record<string, string[]>;
  forbiddenOptionIds?: string[];
  forbiddenByGroup?: Record<string, string[]>;
  minCorrect?: number;
  correctMatches?: Record<string, string>;
}

export interface InteractionScreen {
  id: string;
  title: string;
  instruction: string;
  body?: string;
  emailStimulus?: IncomingMailStimulus;
  groups: InteractionGroup[];
}

export interface InteractionTaskConfig {
  screens: InteractionScreen[];
  rules: InteractionScoringRule[];
  scoreCaps?: Array<{
    id: string;
    maxScore: number;
    groupIds?: string[];
    optionIds: string[];
  }>;
}

export interface WhutsuppMessage {
  sender?: string;
  text?: string;
  kind: "text" | "videoCard";
  assetKey?: string;
  side?: "left" | "right";
  timestamp?: string;
}

export interface WhutsuppChoice {
  choiceId: string;
  label: string;
  isCorrect?: boolean;
  score?: number;
  flags?: string[];
  unknown?: boolean | string;
  rationale?: string;
}

export interface WhutsuppRecovery {
  triggerFlags: string[];
  prompt: string;
  scoreEffect: string;
  choices: WhutsuppChoice[];
}

export interface WhutsuppNode {
  nodeId: string;
  category: string;
  prompt: string;
  messages: WhutsuppMessage[];
  choices: WhutsuppChoice[];
  recovery?: WhutsuppRecovery;
}

export interface WhutsuppFeedbackRule {
  condition: string;
  text: string;
}

export interface WhutsuppVariant {
  assessmentId: AssessmentVersionId;
  gradeLabel: string;
  languageLevel: string;
  groupTitle: string;
  introText: string;
  nodes: WhutsuppNode[];
  resultsFeedbackRules?: WhutsuppFeedbackRule[];
}

export interface WhutsuppFlow {
  taskId: string;
  title: string;
  version: string;
  subgoal: string;
  maxPoints: number;
  engine: "WhutsuppScenarioTask";
  ui: {
    brandName: string;
    randomizeChoices: boolean;
    pinChoiceIdsToBottom: string[];
    assets: {
      videoCardSvg: string;
      videoCardGifFallback?: string;
    };
  };
  scoring: {
    categories: string[];
    caps: Array<{
      flag: string;
      maxScore: number;
      reason: string;
    }>;
  };
  variants: WhutsuppVariant[];
}

export interface WhutsuppPathEntry {
  nodeId: string;
  category: string;
  choiceId: string;
  recoveryChoiceId?: string;
}

export interface WhutsuppAnswer {
  assessmentId: AssessmentVersionId;
  variantId: AssessmentVersionId;
  path: WhutsuppPathEntry[];
  choiceOrderByNode: Record<string, string[]>;
}

export interface WhutsuppScoringSummary {
  assessmentId: AssessmentVersionId;
  variantId: AssessmentVersionId;
  selectedChoiceIds: string[];
  categoryScores: Record<string, number>;
  pt8ScoreRaw: number;
  pt8ScoreCapped: number;
  flags: Record<string, number>;
  unknownCount: number;
  harmfulShareCount: number;
  ridiculeCount: number;
  unsafeEvidenceCount: number;
  retaliationCount: number;
  recoverySafeCount: number;
  feedback: string[];
  chosenDistractorTypes: string[];
}

/* ─── Source evaluation task (lj3-hv "betrouwbaarheid van bronnen") ─── */

export interface SourceEvaluationOption {
  id: string;
  label?: string;
  /** Marks an option as a positive signal of credibility (multi/signal type). */
  correctAsSignal?: boolean;
  /** Marks an option as a misleading "looks credible" distractor. */
  distractor?: boolean;
}

export interface SourceEvaluationSignalScoring {
  /** Minimum number of correct-as-signal options the learner must pick. */
  minCorrect: number;
  /** Maximum number of distractors before the question is marked wrong. */
  maxDistractor: number;
  points: number;
}

export interface SourceEvaluationDropdownQuestion {
  type: "dropdown";
  id: string;
  prompt: string;
  options?: SourceEvaluationOption[];
  correctOptionId: string;
  points: number;
}

export interface SourceEvaluationSignalQuestion {
  type?: "signal";
  id: string;
  prompt: string;
  options: SourceEvaluationOption[];
  scoring: SourceEvaluationSignalScoring;
}

export type SourceEvaluationQuestion =
  | SourceEvaluationDropdownQuestion
  | SourceEvaluationSignalQuestion;

export interface SourceEvaluationTaskConfig {
  questions: SourceEvaluationQuestion[];
}

export interface AssessmentItem {
  id: string;
  type: AssessmentItemType;
  title: string;
  instruction: string;
  options?: Option[];
  correctAnswer?: string | string[];
  correctState?: CorrectState;
  points: number;
  skillDomain: string;
  kerndoel: string;
  subgoal?: string;
  primarySubgoal?: string;
  itemVersion?: string;
  learnerQuestionNumber?: number;
  internalSlot?: string;
  allowUnknown?: boolean;
  unknownOptionId?: string;
  randomizeOptions?: boolean;
  renderOptionsAsSourceCards?: boolean;
  selectionMode?: "single" | "multiple";
  selectCount?: number;
  scoreMode?: "exact" | "unordered_set" | "partial_select";
  harmfulOptionIds?: string[];
  harmfulSelectionMaxScore?: number;
  mockup?: MockupCard;
  table?: SpreadsheetTable;
  codeBlocks?: string[];
  developerNotes?: string[];
  placeholder?: boolean;
  ankerItemFlag?: boolean;
  aiSnelVeranderendFlag?: boolean;
  anchorStatus?: string;
  sourceStatus?: string;
  pilotReviewStatus?: string;
  validityNote?: string;
  fileTask?: FileTaskConfig;
  selfAssessmentScale?: SelfAssessmentScaleLabel[];
  mailTask?: MailTaskConfig;
  securityTask?: InteractionTaskConfig;
  excelTask?: ExcelDownloadTaskConfig;
  officeFormatTask?: OfficeFormatTaskConfig;
  powerPointTask?: PowerPointTaskConfig;
  teamsTask?: TeamsTaskConfig;
  blockTask?: BlockProgrammingTaskConfig;
  sourceEvaluationTask?: SourceEvaluationTaskConfig;
  socialTask?: InteractionTaskConfig;
  whutsuppTask?: WhutsuppVariant;
}

export interface AssessmentSection {
  id: string;
  title: string;
  instruction?: string;
  items: AssessmentItem[];
}

export interface AssessmentVersion {
  id: AssessmentVersionId;
  title: string;
  level: string;
  maxScore: number;
  durationMinutes: number;
  themeKey: ThemeKey;
  sections: AssessmentSection[];
}

export interface CodeMapping {
  codes: string[];
  instrumentId: AssessmentVersionId;
  label: string;
}

export interface SessionMetadata {
  learnerCode?: string;
  accessCode?: string;
  participantLabel?: string;
  classToken?: string;
  classId?: string;
  classCode?: string;
  anonymousAttemptId?: string;
  privacyConsent?: boolean;
  selfAssessmentScore?: number;
  anonymousCode: string;
}

export interface Result {
  sessionId: string;
  versionId: AssessmentVersionId;
  itemId: string;
  itemType: AssessmentItemType;
  sectionId: string;
  shownOptionOrder: string[];
  selectedAnswer: SelectedAnswer;
  finalState?: string;
  isCorrect: boolean | null;
  score: number;
  maxScore: number;
  primarySubgoal?: string;
  itemVersion?: string;
  learnerQuestionNumber?: number;
  internalSlot?: string;
  taskResults?: Array<{
    taskId: string;
    description: string;
    correct: boolean;
    points?: number;
    selectedOptionId?: string;
    unknown?: boolean;
    errorCategory?: string;
  }>;
  scoringSummary?: WhutsuppScoringSummary;
  responseType?: ResponseType;
  skipped?: boolean;
  timestamp: string;
  timeSpentMs?: number;
  ankerItemFlag?: boolean;
  aiSnelVeranderendFlag?: boolean;
}

export interface EventLog {
  sessionId: string;
  versionId: AssessmentVersionId;
  sectionId: string;
  itemId: string;
  timestamp: string;
  actionType: string;
  itemType?: AssessmentItemType;
  selectedAnswer?: SelectedAnswer;
  finalState?: string;
  shownOptionOrder?: string[];
  isCorrect?: boolean | null;
  score?: number;
  maxScore?: number;
  primarySubgoal?: string;
  itemVersion?: string;
  learnerQuestionNumber?: number;
  internalSlot?: string;
  taskResults?: Array<{
    taskId: string;
    description: string;
    correct: boolean;
    points?: number;
    selectedOptionId?: string;
    unknown?: boolean;
    errorCategory?: string;
  }>;
  scoringSummary?: WhutsuppScoringSummary;
  responseType?: ResponseType;
  skipped?: boolean;
  timeSpentMs?: number;
  ankerItemFlag?: boolean;
  aiSnelVeranderendFlag?: boolean;
  sourcePath?: string;
  targetPath?: string;
  oldName?: string;
  newName?: string;
  extra?: string;
}

export interface AssessmentSession {
  id: string;
  accessCode: string;
  versionId: AssessmentVersionId;
  instrumentId: AssessmentVersionId;
  metadata: SessionMetadata;
  startedAt: string;
  currentStepIndex: number;
  results: Result[];
  eventLogs: EventLog[];
  presentedOrders: Record<string, string[]>;
  pt1States: Record<string, Pt1State>;
  completedAt?: string;
}

export interface StepDescriptor {
  key: string;
  itemType: AssessmentItemType;
  sectionId: string;
  itemId: string;
}

export interface BlockScore {
  blockId: string;
  title: string;
  score: number;
  maxScore: number;
}

export interface GoalScore {
  goalId: string;
  label: string;
  level: "kerndoel" | "subgoal";
  score: number;
  maxScore: number;
  percentage: number;
}

export interface AssessmentResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  blockScores: BlockScore[];
  domainScores: BlockScore[];
  goalScores: GoalScore[];
}

export type InstrumentDefinition = AssessmentVersion;
