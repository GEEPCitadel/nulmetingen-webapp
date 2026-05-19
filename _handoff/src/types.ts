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
  | "social_action_simulation";

export type SelectedAnswer =
  | string
  | string[]
  | number
  | Record<string, unknown>
  | null;

export interface Option {
  id: string;
  label: string;
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
  footer?: string;
  mediaHint?: string;
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

export interface DownloadQuestion {
  id: string;
  prompt: string;
  answer: string;
  points: number;
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

export interface BlockProgrammingTaskConfig {
  intro?: string;
  device?: "bizzy" | "microbit" | "sensor";
  codingSteps?: string[];
  blocks: ProgrammingBlockDefinition[];
  correctProgram: string[];
  rules: BlockScoringRule[];
}

export type InteractionInputType = "single" | "multi" | "toggle" | "matching";

export interface InteractionGroup {
  id: string;
  title: string;
  instruction?: string;
  inputType: InteractionInputType;
  options?: Option[];
  cards?: Option[];
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
  groups: InteractionGroup[];
}

export interface InteractionTaskConfig {
  screens: InteractionScreen[];
  rules: InteractionScoringRule[];
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
  allowUnknown?: boolean;
  randomizeOptions?: boolean;
  scoreMode?: "exact" | "unordered_set";
  mockup?: MockupCard;
  table?: SpreadsheetTable;
  codeBlocks?: string[];
  developerNotes?: string[];
  placeholder?: boolean;
  ankerItemFlag?: boolean;
  aiSnelVeranderendFlag?: boolean;
  fileTask?: FileTaskConfig;
  selfAssessmentScale?: SelfAssessmentScaleLabel[];
  mailTask?: MailTaskConfig;
  securityTask?: InteractionTaskConfig;
  excelTask?: ExcelDownloadTaskConfig;
  officeFormatTask?: OfficeFormatTaskConfig;
  powerPointTask?: PowerPointTaskConfig;
  teamsTask?: TeamsTaskConfig;
  blockTask?: BlockProgrammingTaskConfig;
  socialTask?: InteractionTaskConfig;
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
  classCode?: string;
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

export interface AssessmentResult {
  totalScore: number;
  maxScore: number;
  percentage: number;
  blockScores: BlockScore[];
  domainScores: BlockScore[];
}

export type InstrumentDefinition = AssessmentVersion;
