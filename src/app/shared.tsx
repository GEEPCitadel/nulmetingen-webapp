import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  assessmentMap,
  defaultCodeMappings,
  themes,
} from "../data/assessments";
import {
  calculateResult,
  completeSession,
  createSession,
  getAssessment,
  getItemByStep,
  getPresentedInteractionOrder,
  getPresentedOrder,
  getSectionById,
  getStepDescriptors,
  submitItemAnswer,
} from "../lib/assessment";
import {
  buildPath,
  copyNode,
  createFile,
  createFolder,
  deleteNode,
  getChildren,
  getNodeById,
  moveNode,
  renameNode,
  undoPt1,
} from "../lib/pt1";
import {
  readActiveSession,
  saveActiveSession,
} from "../lib/storage";
import type {
  AssessmentItem,
  AssessmentSection,
  AssessmentSession,
  AssessmentVersion,
  EventLog,
  GoalScore,
  IncomingMailStimulus,
  InteractionGroup,
  Option,
  Pt1Node,
  Pt1State,
  ProgrammingBlockDefinition,
  SelectedAnswer,
  SessionMetadata,
  StepDescriptor,
  ThemeDefinition,
  WhutsuppChoice,
  WhutsuppMessage,
  WhutsuppPathEntry,
} from "../types";


export type EntryView = "intro" | "adminAccess" | "admin";
export type ConflictChoice = "overwrite" | "rename" | "cancel";
export type ExplorerClipboard = { mode: "cut" | "copy"; nodeId: string } | null;
export type ExplorerNewItemType = "folder" | "shortcut" | "bitmap" | "word" | "powerpoint";
export type ExplorerSortKey = "name" | "modified" | "type" | "size";

export const explorerNewItems: Array<{
  type: ExplorerNewItemType;
  label: string;
  defaultName: string;
  nodeKind: "folder" | "file";
  iconClass: string;
}> = [
  {
    type: "folder",
    label: "Map",
    defaultName: "Nieuwe map",
    nodeKind: "folder",
    iconClass: "new-item-icon-folder",
  },
  {
    type: "shortcut",
    label: "Snelkoppeling",
    defaultName: "Nieuwe snelkoppeling.url",
    nodeKind: "file",
    iconClass: "new-item-icon-shortcut",
  },
  {
    type: "bitmap",
    label: "Bitmapafbeelding",
    defaultName: "Nieuwe afbeelding.bmp",
    nodeKind: "file",
    iconClass: "new-item-icon-image",
  },
  {
    type: "word",
    label: "Microsoft Word-document",
    defaultName: "Doc1.docx",
    nodeKind: "file",
    iconClass: "new-item-icon-word",
  },
  {
    type: "powerpoint",
    label: "Microsoft PowerPoint-presentatie",
    defaultName: "Presentatie1.pptx",
    nodeKind: "file",
    iconClass: "new-item-icon-powerpoint",
  },
];

export type SubmitAnswerPayload = {
  section: AssessmentSection;
  item: AssessmentItem;
  selectedAnswer: SelectedAnswer;
  shownOptionOrder: string[];
};

export type ApiStudent = {
  studentNumber?: string;
  participantLabel?: string;
  accessCode: string;
  classCode: string;
  classId?: string;
  versionId: AssessmentVersion["id"];
  assessmentId?: string;
  gradeLevel?: string;
  track?: string;
  cohort?: string;
  assessmentWindow?: string;
  importBatch?: string;
  status?: "not_started" | "in_progress" | "completed";
  resultSessionId?: string | null;
  totalScore?: number | null;
  maxScore?: number | null;
  percentage?: number | null;
  completedAt?: string | null;
  updatedAt?: string | null;
};

export type StudentLoginResponse = {
  ok: boolean;
  status: "not_started" | "in_progress" | "completed";
  student: ApiStudent;
  session?: AssessmentSession;
};

export type StudentsResponse = {
  ok: boolean;
  students: ApiStudent[];
  createdStudents?: ApiStudent[];
  importedCount?: number;
  deletedCount?: number;
};

export type ImportStudentRow = {
  classCode: string;
  participantLabel: string;
  classId?: string;
  assessmentId?: string;
  gradeLevel?: string;
  track?: string;
  cohort?: string;
  assessmentWindow?: string;
};

export type AnalysisGroup = {
  assessmentId: string;
  classCode: string;
  classId: string;
  gradeLevel: string;
  track: string;
  cohort: string;
  assessmentWindow: string;
  versionId: AssessmentVersion["id"];
  createdCodes: number;
  startedCount: number;
  completedCount: number;
  completionPercentage: number;
  averageTotalScore: number | null;
  averageSrScore: number | null;
  averagePtScore: number | null;
  averageSelfAssessment: number | null;
  averageSelfAssessmentDifference: number | null;
  goalScores: Record<string, number | null>;
};

export type ItemAnalysisRow = {
  itemId: string;
  questionNumber: number | string;
  goalId: string;
  answerCount: number;
  correctRate: number | null;
  unknownRate: number | null;
  topDistractor: string;
  distribution: Record<string, number>;
  harmfulOptionRate: number | null;
  ptErrorCategories: Record<string, number>;
  signals: string[];
};

export type ResultsAnalysis = {
  filters: {
    assessmentWindows: string[];
    gradeLevels: string[];
    tracks: string[];
    classCodes: string[];
    cohorts: string[];
    assessmentIds: string[];
  };
  overview: Omit<AnalysisGroup, "assessmentId" | "classCode" | "classId" | "gradeLevel" | "track" | "cohort" | "assessmentWindow" | "versionId" | "goalScores">;
  byClass: AnalysisGroup[];
  byGrade: AnalysisGroup[];
  itemAnalysis: ItemAnalysisRow[];
};

export type AnalysisResponse = {
  ok: boolean;
  analysis: ResultsAnalysis;
};

// P1 (rainbow on cream) is used for the entry / admin / fallback screens.
export const defaultTheme = themes.rainbowCream;
export const UNKNOWN_OPTION_LABEL = "Ik weet het niet.";

/* Korte weergavenamen voor secties in de zijbalk */
export const SECTION_SHORT_TITLE: Record<string, string> = {
  zelfinschatting: "Zelf inschatten",
  pt1: "Bestanden", pt2: "Mail", pt3: "Beveiliging",
  pt4: "Data & Excel", pt5: "Presentatie", pt6: "Samenwerken",
  pt7: "Programmeren", pt8: "Online gedrag", sr: "Meerkeuze",
};
export const shortSectionTitle = (sec: AssessmentSection): string =>
  SECTION_SHORT_TITLE[sec.id] ?? sec.title.replace(/^PT\d+\s*[-–]\s*/i, "");
export const assessmentIds = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"] as const;
export const assessmentLabels: Record<AssessmentVersion["id"], string> = {
  "lj1-vmbo": "Leerjaar 1 VMBO",
  "lj1-hv": "Leerjaar 1 HAVO/VWO",
  "lj3-vmbo": "Leerjaar 3 VMBO",
  "lj3-hv": "Leerjaar 3 HAVO/VWO",
};

export const getInitialStartContext = () => {
  const url = new URL(window.location.href);
  const queryAssessmentId = url.searchParams.get("assessmentId");
  const pathParts = url.pathname.split("/").filter(Boolean);
  const pathAssessmentId = pathParts[pathParts.length - 1];
  const assessmentId = assessmentIds.includes(queryAssessmentId as AssessmentVersion["id"])
    ? (queryAssessmentId as AssessmentVersion["id"])
    : assessmentIds.includes(pathAssessmentId as AssessmentVersion["id"])
      ? (pathAssessmentId as AssessmentVersion["id"])
      : "lj1-vmbo";

  return {
    assessmentId,
    classToken: url.searchParams.get("code") ?? url.searchParams.get("classToken") ?? "",
  };
};

export const classIdFromToken = (token: string) => {
  // TODO(class-tokens): vervang deze lokale mapping door een beheeromgeving/API
  // waarin classTokens server-side naar classId, schoolId en afnameperiode wijzen.
  let hash = 2166136261;
  for (const char of token.trim()) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `class-${(hash >>> 0).toString(36).padStart(7, "0")}`;
};

export const createClassStartLink = (assessmentId: AssessmentVersion["id"], classToken: string) => {
  const url = new URL(window.location.href);
  url.pathname = `/nulmeting/start/${assessmentId}`;
  url.search = "";
  url.searchParams.set("classToken", classToken);
  return url.toString();
};

export const newClassToken = () =>
  `klas-${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

export const EXIT_CONFIRMATION_TEXT =
  "Weet je het zeker? Klik hier om af te sluiten en terug te gaan naar het startscherm.";

export const requestJson = async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "De server gaf geen geldige reactie.");
  }
  return data as T;
};

export const downloadFile = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const sanitizePdfText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ");

export const escapePdfText = (value: string) =>
  sanitizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

export const wrapPdfLine = (line: string, maxLength = 88): string[] => {
  const words = line.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
      return;
    }
    current = next;
  });

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
};

export const createPdfDocument = (lines: string[]) => {
  const renderedLines = lines.flatMap((line) =>
    line === "" ? [""] : wrapPdfLine(line),
  );
  const linesPerPage = 46;
  const pages = Array.from(
    { length: Math.max(1, Math.ceil(renderedLines.length / linesPerPage)) },
    (_, index) => renderedLines.slice(index * linesPerPage, (index + 1) * linesPerPage),
  );
  const fontObjectNumber = 3;
  const pageObjectNumbers = pages.map((_, index) => 4 + index * 2);
  const contentObjectNumbers = pages.map((_, index) => 5 + index * 2);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${pages.length} >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    ...pages.flatMap((pageLines, index) => {
      const stream = [
        "BT",
        "/F1 12 Tf",
        "50 790 Td",
        ...pageLines.flatMap((line) =>
          line === ""
            ? ["0 -16 Td"]
            : [`(${escapePdfText(line)}) Tj`, "0 -16 Td"],
        ),
        "ET",
      ].join("\n");
      return [
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumbers[index]} 0 R >>`,
        `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
      ];
    }),
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;
  return pdf;
};

export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(Math.max(totalSeconds, 0) / 60);
  const seconds = Math.max(totalSeconds, 0) % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const cleanQuestionTitle = (title: string) =>
  title.replace(/^(PT|SR)\d+\s*[-–—]\s*/i, "").trim();

export const shuffleItems = <T,>(items: T[]): T[] => {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
  }
  return clone;
};

export const QuestionHeader = ({
  questionNumber,
  label,
  title,
  instruction,
  children,
}: {
  questionNumber?: number;
  label?: string;
  title: string;
  instruction?: string;
  children?: ReactNode;
}) => (
  <div className="stack-xs">
    <span className="section-tag question-tag">{label ?? `Vraag ${questionNumber}`}</span>
    <h2 className="question-title">{cleanQuestionTitle(title)}</h2>
    {instruction ? <p className="helper-text">{instruction}</p> : null}
    {children}
  </div>
);

export const SkipTaskButton = ({ onSkip }: { onSkip: () => void }) => (
  <button className="ghost-button" type="button" onClick={onSkip}>
    Ik weet het niet / sla over
  </button>
);

// P5 (rose/navy) past bij de zakelijke toon van de docent-/beheeromgeving.
// De landingspagina blijft op P1 (rainbowCream) als warm onthaal.
export const getEntryTheme = (view: EntryView) =>
  view === "adminAccess" || view === "admin" ? themes.roseNavy : defaultTheme;

export const getThemeForSession = (session: AssessmentSession | null, entryView: EntryView) =>
  session ? themes[assessmentMap[session.versionId].themeKey] : getEntryTheme(entryView);

