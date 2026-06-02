import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  assessmentMap,
  defaultCodeMappings,
  themes,
} from "./data/assessments";
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
} from "./lib/assessment";
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
} from "./lib/pt1";
import {
  readActiveSession,
  saveActiveSession,
} from "./lib/storage";
import type {
  AssessmentItem,
  AssessmentSection,
  AssessmentSession,
  AssessmentVersion,
  EventLog,
  GoalScore,
  IncomingMailStimulus,
  InteractionGroup,
  Pt1Node,
  Pt1State,
  ProgrammingBlockDefinition,
  SelectedAnswer,
  SessionMetadata,
  StepDescriptor,
  ThemeDefinition,
} from "./types";

type EntryView = "intro" | "adminAccess" | "admin";
type ConflictChoice = "overwrite" | "rename" | "cancel";
type ExplorerClipboard = { mode: "cut" | "copy"; nodeId: string } | null;
type ExplorerNewItemType = "folder" | "shortcut" | "bitmap" | "word" | "powerpoint";
type ExplorerSortKey = "name" | "modified" | "type" | "size";

const explorerNewItems: Array<{
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

type SubmitAnswerPayload = {
  section: AssessmentSection;
  item: AssessmentItem;
  selectedAnswer: SelectedAnswer;
  shownOptionOrder: string[];
};

type ApiStudent = {
  studentNumber?: string;
  participantLabel?: string;
  accessCode: string;
  classCode: string;
  versionId: AssessmentVersion["id"];
  importBatch?: string;
  status?: "not_started" | "in_progress" | "completed";
  resultSessionId?: string | null;
  totalScore?: number | null;
  maxScore?: number | null;
  percentage?: number | null;
  completedAt?: string | null;
  updatedAt?: string | null;
};

type StudentLoginResponse = {
  ok: boolean;
  status: "not_started" | "in_progress" | "completed";
  student: ApiStudent;
  session?: AssessmentSession;
};

type StudentsResponse = {
  ok: boolean;
  students: ApiStudent[];
  importedCount?: number;
};

// P1 (rainbow on cream) is used for the entry / admin / fallback screens.
const defaultTheme = themes.rainbowCream;
const UNKNOWN_OPTION_LABEL = "Ik weet het niet.";

/* Korte weergavenamen voor secties in de zijbalk */
const SECTION_SHORT_TITLE: Record<string, string> = {
  zelfinschatting: "Zelf inschatten",
  pt1: "Bestanden", pt2: "Mail", pt3: "Beveiliging",
  pt4: "Data & Excel", pt5: "Presentatie", pt6: "Samenwerken",
  pt7: "Programmeren", pt8: "Online gedrag", sr: "Meerkeuze",
};
const shortSectionTitle = (sec: AssessmentSection): string =>
  SECTION_SHORT_TITLE[sec.id] ?? sec.title.replace(/^PT\d+\s*[-–]\s*/i, "");
const assessmentIds = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"] as const;
const assessmentLabels: Record<AssessmentVersion["id"], string> = {
  "lj1-vmbo": "Leerjaar 1 VMBO",
  "lj1-hv": "Leerjaar 1 HAVO/VWO",
  "lj3-vmbo": "Leerjaar 3 VMBO",
  "lj3-hv": "Leerjaar 3 HAVO/VWO",
};

const getInitialStartContext = () => {
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

const classIdFromToken = (token: string) => {
  // TODO(class-tokens): vervang deze lokale mapping door een beheeromgeving/API
  // waarin classTokens server-side naar classId, schoolId en afnameperiode wijzen.
  let hash = 2166136261;
  for (const char of token.trim()) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `class-${(hash >>> 0).toString(36).padStart(7, "0")}`;
};

const createClassStartLink = (assessmentId: AssessmentVersion["id"], classToken: string) => {
  const url = new URL(window.location.href);
  url.pathname = `/nulmeting/start/${assessmentId}`;
  url.search = "";
  url.searchParams.set("classToken", classToken);
  return url.toString();
};

const newClassToken = () =>
  `klas-${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

const requestJson = async <T,>(url: string, options: RequestInit = {}): Promise<T> => {
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

const downloadFile = (filename: string, content: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const sanitizePdfText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ");

const escapePdfText = (value: string) =>
  sanitizePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const wrapPdfLine = (line: string, maxLength = 88): string[] => {
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

const createPdfDocument = (lines: string[]) => {
  const contentLines = [
    "BT",
    "/F1 12 Tf",
    "50 790 Td",
    ...lines.flatMap((line) =>
      line === ""
        ? ["0 -16 Td"]
        : wrapPdfLine(line).flatMap((wrappedLine) => [
            `(${escapePdfText(wrappedLine)}) Tj`,
            "0 -16 Td",
          ]),
    ),
    "ET",
  ];
  const stream = contentLines.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
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

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const formatTime = (totalSeconds: number) => {
  const minutes = Math.floor(Math.max(totalSeconds, 0) / 60);
  const seconds = Math.max(totalSeconds, 0) % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const cleanQuestionTitle = (title: string) =>
  title.replace(/^(PT|SR)\d+\s*[-–—]\s*/i, "").trim();

const shuffleItems = <T,>(items: T[]): T[] => {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
  }
  return clone;
};

const QuestionHeader = ({
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

const SkipTaskButton = ({ onSkip }: { onSkip: () => void }) => (
  <button className="ghost-button" type="button" onClick={onSkip}>
    Ik weet het niet / sla over
  </button>
);

// P5 (rose/navy) past bij de zakelijke toon van de docent-/beheeromgeving.
// De landingspagina blijft op P1 (rainbowCream) als warm onthaal.
const getEntryTheme = (view: EntryView) =>
  view === "adminAccess" || view === "admin" ? themes.roseNavy : defaultTheme;

const getThemeForSession = (session: AssessmentSession | null, entryView: EntryView) =>
  session ? themes[assessmentMap[session.versionId].themeKey] : getEntryTheme(entryView);

const App = () => {
  const [entryView, setEntryView] = useState<EntryView>("intro");
  const [session, setSession] = useState<AssessmentSession | null>(() =>
    readActiveSession(),
  );
  const [startContext, setStartContext] = useState(getInitialStartContext);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [learnerCodeError, setLearnerCodeError] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [adminError, setAdminError] = useState("");
  const [isStarting, setIsStarting] = useState(false);
  const [isUnlockingAdmin, setIsUnlockingAdmin] = useState(false);
  const [stepStartedAt, setStepStartedAt] = useState(Date.now());
  const [now, setNow] = useState(Date.now());

  const activeAssessment = session ? getAssessment(session) : null;
  const activeTheme = getThemeForSession(session, entryView);
  const steps = activeAssessment ? getStepDescriptors(activeAssessment) : [];
  const currentStep = session ? steps[session.currentStepIndex] ?? null : null;
  const result =
    session && activeAssessment && session.completedAt
      ? calculateResult(session, activeAssessment)
      : null;

  useEffect(() => {
    saveActiveSession(session);

    if (!session?.metadata.classId) {
      return;
    }

    if (session.completedAt && result) {
      void requestJson<{ ok: boolean }>("/api/results", {
        method: "POST",
        body: JSON.stringify({ session, result }),
      }).catch(() => undefined);
      return;
    }

    void requestJson<{ ok: boolean }>("/api/sessions", {
      method: "POST",
      body: JSON.stringify({ session }),
    }).catch(() => undefined);
  }, [session, result]);

  useEffect(() => {
    setStepStartedAt(Date.now());
  }, [currentStep?.key]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const startAssessment = async () => {
    const code = startContext.classToken.trim().toUpperCase();
    if (!code) {
      setLearnerCodeError("Vul je persoonlijke afnamecode in.");
      return;
    }

    if (!privacyConsent) {
      setLearnerCodeError("Vink eerst aan dat je de privacyvoorwaarden accepteert.");
      return;
    }

    setIsStarting(true);
    try {
      const data = await requestJson<StudentLoginResponse>("/api/student-login", {
        method: "POST",
        body: JSON.stringify({ code }),
      });

      if (data.status === "completed") {
        setLearnerCodeError("Deze afnamecode is al afgerond. Vraag je docent om de code opnieuw open te zetten.");
        return;
      }

      if (data.session) {
        setSession(data.session);
        setLearnerCodeError("");
        return;
      }

      const assessment = assessmentMap[data.student.versionId];
      const anonymousAttemptId = crypto.randomUUID();
      const metadata: SessionMetadata = {
        accessCode: data.student.accessCode,
        participantLabel: data.student.participantLabel,
        classId: data.student.classCode,
        classCode: data.student.classCode,
        anonymousAttemptId,
        privacyConsent: true,
        anonymousCode: anonymousAttemptId.slice(0, 8),
      };
      setSession(createSession(assessment, data.student.accessCode, metadata));
      setLearnerCodeError("");
    } catch {
      setLearnerCodeError("Deze afnamecode is niet gevonden of de nulmeting kon niet worden gestart.");
    } finally {
      setIsStarting(false);
    }
  };

  const unlockAdmin = async () => {
    const password = adminCode.trim();
    if (!password) {
      setAdminError("De beheercode klopt niet.");
      return;
    }

    setIsUnlockingAdmin(true);
    try {
      await requestJson<{ ok: boolean }>("/api/admin-login", {
        method: "POST",
        body: JSON.stringify({ password }),
      });
      setAdminToken(password);
      setAdminError("");
      setAdminCode("");
      setEntryView("admin");
    } catch {
      setAdminError("De beheercode klopt niet of de serverconfiguratie ontbreekt.");
    } finally {
      setIsUnlockingAdmin(false);
    }
  };

  const advanceAfterAnswer = (nextSession: AssessmentSession) => {
    const stepList = getStepDescriptors(getAssessment(nextSession));
    const nextIndex = nextSession.currentStepIndex + 1;

    if (nextIndex >= stepList.length) {
      setSession(
        completeSession({
          ...nextSession,
          currentStepIndex: stepList.length,
        }),
      );
      return;
    }

    setSession({
      ...nextSession,
      currentStepIndex: nextIndex,
    });
  };

  const submitAnswer = ({
    section,
    item,
    selectedAnswer,
    shownOptionOrder,
  }: SubmitAnswerPayload) => {
    if (!session) {
      return;
    }

    advanceAfterAnswer(
      submitItemAnswer({
        session,
        section,
        item,
        selectedAnswer,
        shownOptionOrder,
        timeSpentMs: Date.now() - stepStartedAt,
      }),
    );
  };

  const updateFileTaskState = (item: AssessmentItem, nextState: Pt1State) => {
    setSession((current) => {
      if (!current || !activeAssessment) {
        return current;
      }

      const section = activeAssessment.sections.find((candidate) =>
        candidate.items.some((sectionItem) => sectionItem.id === item.id),
      );
      if (!section) {
        return current;
      }

      const previousLength = current.pt1States[item.id]?.actionLogs.length ?? 0;
      const latestEvents = nextState.actionLogs.slice(previousLength).map<EventLog>((log) => ({
        sessionId: current.id,
        versionId: current.versionId,
        sectionId: section.id,
        itemId: item.id,
        timestamp: log.timestamp,
        actionType: log.actionType,
        sourcePath: log.sourcePath,
        targetPath: log.targetPath,
        oldName: log.oldName,
        newName: log.newName,
        extra: log.extra,
      }));

      return {
        ...current,
        pt1States: {
          ...current.pt1States,
          [item.id]: nextState,
        },
        eventLogs: [...current.eventLogs, ...latestEvents],
      };
    });
  };

  const finishFileTask = (section: AssessmentSection, item: AssessmentItem) => {
    submitAnswer({
      section,
      item,
      selectedAnswer: "submitted",
      shownOptionOrder: [],
    });
  };

  const skipPerformanceTask = (section: AssessmentSection, item: AssessmentItem) => {
    submitAnswer({
      section,
      item,
      selectedAnswer: { skipped: true },
      shownOptionOrder: [],
    });
  };

  const resetSession = () => {
    setSession(null);
    setEntryView("intro");
    setStartContext(getInitialStartContext());
    setPrivacyConsent(false);
    setLearnerCodeError("");
    setAdminCode("");
    setAdminError("");
  };

  // Levelchip toont alleen tijdens een lopende meting de versie.
  const levelShort = activeAssessment
    ? activeAssessment.level
    : entryView === "admin"
      ? "Beheer"
      : undefined;

  const attemptCode = session?.metadata.anonymousAttemptId?.slice(0, 8);
  const studentClassCode = session?.metadata.classId;

  const screenMarker: "landing" | "adminAccess" | "admin" | "assessment" | "result" =
    result
      ? "result"
      : session && activeAssessment
        ? "assessment"
        : entryView === "admin"
          ? "admin"
          : entryView === "adminAccess"
            ? "adminAccess"
            : "landing";

  return (
    <AppShell
      theme={activeTheme}
      screen={screenMarker}
      levelShort={levelShort}
      studentCode={attemptCode}
      classCode={studentClassCode}
      timer={
        session && !session.completedAt
          ? formatTime(Math.floor((now - new Date(session.startedAt).getTime()) / 1000))
          : undefined
      }
      onReset={session && !session.completedAt ? resetSession : undefined}
    >
      {!session && entryView === "intro" ? (
        <StudentStartScreen
          selectedAssessmentId={startContext.assessmentId}
          classToken={startContext.classToken}
          privacyConsent={privacyConsent}
          error={learnerCodeError}
          isStarting={isStarting}
          onAssessmentChange={(value) => {
            setStartContext((current) => ({ ...current, assessmentId: value }));
            setLearnerCodeError("");
          }}
          onClassTokenChange={(value) => {
            setStartContext((current) => ({ ...current, classToken: value }));
            setLearnerCodeError("");
          }}
          onPrivacyConsentChange={(value) => {
            setPrivacyConsent(value);
            setLearnerCodeError("");
          }}
          onGenerateClassToken={() => {
            setStartContext((current) => ({ ...current, classToken: "" }));
            setLearnerCodeError("");
          }}
          onStart={startAssessment}
          onOpenAdmin={() => {
            setAdminError("");
            setEntryView("adminAccess");
          }}
        />
      ) : null}

      {!session && entryView === "adminAccess" ? (
        <AdminAccessScreen
          code={adminCode}
          error={adminError}
          isLoading={isUnlockingAdmin}
          onCodeChange={(value) => {
            setAdminError("");
            setAdminCode(value);
          }}
          onBack={() => setEntryView("intro")}
          onUnlock={unlockAdmin}
        />
      ) : null}

      {!session && entryView === "admin" ? (
        <AdminScreen
          adminPassword={adminToken}
          onBack={() => setEntryView("intro")}
        />
      ) : null}

      {session && activeAssessment && currentStep && !session.completedAt ? (
        <AssessmentScreen
          session={session}
          assessment={activeAssessment}
          step={currentStep}
          stepIndex={session.currentStepIndex}
          stepCount={steps.length}
          onSubmitAnswer={submitAnswer}
          onUpdateFileTaskState={updateFileTaskState}
          onFinishFileTask={finishFileTask}
          onSkipPerformanceTask={skipPerformanceTask}
          onReset={resetSession}
        />
      ) : null}

      {session && activeAssessment && result && session.completedAt ? (
        <ResultScreen assessment={activeAssessment} session={session} onClose={resetSession} />
      ) : null}
    </AppShell>
  );
};

const AppShell = ({
  children,
  theme,
  timer,
  levelShort,
  studentCode,
  classCode,
  onReset,
  screen,
}: {
  children: ReactNode;
  theme: ThemeDefinition;
  /** Optional short label for the active assessment (e.g. "LJ1 VMBO"). */
  levelShort?: string;
  /** Optional anonymous attempt id to display in the topbar chip. */
  studentCode?: string;
  classCode?: string;
  timer?: string;
  onReset?: () => void;
  /** Screen marker for per-screen CSS overrides (e.g. landing/admin → white hero). */
  screen?: "landing" | "adminAccess" | "admin" | "assessment" | "result";
}) => (
  <div
    className="app"
    data-theme={theme.palette}
    data-screen={screen}
    style={
      {
        "--theme-primary": theme.primary,
        "--theme-secondary": theme.secondary,
        "--theme-tertiary": theme.tertiary,
        "--theme-panel": theme.panel,
        "--theme-ribbon": theme.ribbon,
        "--theme-accent": theme.accent,
      } as CSSProperties
    }
  >
    <header className="topbar">
      <span className="brand" role="img" aria-label="Citadel College" />
      <div className="brand-label">
        citadel college
        <small>nulmeting digitale geletterdheid</small>
      </div>
      <span className="spacer" />
      {levelShort ? (
        <span className="chip">
          <span className="chip-dot" />
          {levelShort}
        </span>
      ) : null}
      {timer ? (
        <span className="chip">
          <span className="chip-dot" />
          {timer}
        </span>
      ) : null}
      {onReset ? (
        <button className="ghost-btn" type="button" onClick={onReset}>
          ← Terug
        </button>
      ) : null}
    </header>
    <main className="page">{children}</main>
    <img className="slinger" src={theme.ribbon} alt="" aria-hidden="true" />
    {screen !== "assessment" && screen !== "adminAccess" ? (
      <footer className="site-footer">
        <a
          className="site-url"
          href="https://www.citadelcollege.nl"
          target="_blank"
          rel="noreferrer"
        >
          www.citadelcollege.nl
        </a>
      </footer>
    ) : null}
  </div>
);

const StudentStartScreen = ({
  selectedAssessmentId,
  classToken,
  privacyConsent,
  error,
  isStarting,
  onAssessmentChange,
  onClassTokenChange,
  onPrivacyConsentChange,
  onGenerateClassToken,
  onStart,
  onOpenAdmin,
}: {
  selectedAssessmentId: AssessmentVersion["id"];
  classToken: string;
  privacyConsent: boolean;
  error: string;
  isStarting: boolean;
  onAssessmentChange: (value: AssessmentVersion["id"]) => void;
  onClassTokenChange: (value: string) => void;
  onPrivacyConsentChange: (value: boolean) => void;
  onGenerateClassToken: () => void;
  onStart: () => void;
  onOpenAdmin: () => void;
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const selectedAssessment = assessmentMap[selectedAssessmentId];
  const assignmentCount = getStepDescriptors(selectedAssessment).filter((descriptor) => {
    const section = getSectionById(selectedAssessment, descriptor.sectionId);
    const item = section?.items.find((candidate) => candidate.id === descriptor.itemId);
    return item?.type !== "self_assessment";
  }).length;

  if (step === 1) {
    return (
      <div className="welcome-screen">
        <div className="welcome-card">
          <div className="welcome-logo-img" role="img" aria-label="Citadel College" />
          <h1 className="welcome-title">
            Welkom bij de voortgangsmeting<br />
            Digitale Geletterdheid
          </h1>
          <label className="field-block welcome-field">
            <span className="field-label">Jouw persoonlijke afnamecode</span>
            <input
              className="field-input"
              value={classToken}
              placeholder="Bijv. K7M4Q2"
              autoFocus
              onChange={(event) => onClassTokenChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && classToken.trim()) setStep(2);
              }}
            />
          </label>

          {error ? <div className="error-banner-inline welcome-field">{error}</div> : null}

          <button
            className="btn btn-primary welcome-start-btn"
            type="button"
            onClick={() => { if (classToken.trim()) setStep(2); }}
            disabled={!classToken.trim()}
          >
            <span>Volgende</span>
            <span className="arrow-circle">→</span>
          </button>

          <div className="welcome-dots">
            <span className="dot dot-active" />
            <span className="dot" />
          </div>
        </div>

        <button className="welcome-admin-link" type="button" onClick={onOpenAdmin}>
          Beheerder? <strong>Klik hier</strong>
        </button>
      </div>
    );
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-card welcome-card--wide">
        <div className="welcome-logo-img" role="img" aria-label="Citadel College" />
        <h2 className="welcome-instruction-title">
          Voortgangsmeting Digitale Geletterdheid
        </h2>

        <div className="instruction-box">
          <ul className="instruction-list">
            <li>De voortgangsmeting bestaat uit <strong>{assignmentCount}</strong> opdrachten.</li>
            <li>De voortgangsmeting duurt ongeveer 30 minuten.</li>
            <li>Zoek geen antwoorden op internet.</li>
            <li>Per ongeluk afgesloten?</li>
            <li>Vul dezelfde afnamecode opnieuw in.</li>
            <li>Aan het einde zie je welke score jij hebt gehaald.</li>
          </ul>
        </div>

        <div className="privacy-consent-box">
          <p>
            Deze voortgangsmeting wordt aangeboden door Citadel College. Je antwoorden worden <strong>zonder naam</strong> opgeslagen — de uitkomsten zijn niet terug te leiden naar jou persoonlijk. De school bekijkt de resultaten per klas en per leerjaar.
          </p>
          <p>Meedoen is niet verplicht.</p>
          <label className="check-row">
            <input
              type="checkbox"
              checked={privacyConsent}
              onChange={(event) => onPrivacyConsentChange(event.target.checked)}
            />
            <span>Ik accepteer de privacyvoorwaarden.</span>
          </label>
        </div>

        {error ? <div className="error-banner-inline">{error}</div> : null}

        <div className="welcome-nav">
          <button className="btn btn-ghost" type="button" onClick={() => setStep(1)}>
            ← Terug
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={onStart}
            disabled={isStarting || !privacyConsent}
          >
            <span>{isStarting ? 'Starten...' : 'Start de voortgangsmeting'}</span>
            <span className="arrow-circle">→</span>
          </button>
        </div>

        <div className="welcome-dots">
          <span className="dot" />
          <span className="dot dot-active" />
        </div>
      </div>
    </div>
  );
};

const AdminAccessScreen = ({
  code,
  error,
  isLoading,
  onCodeChange,
  onUnlock,
  onBack,
}: {
  code: string;
  error: string;
  isLoading: boolean;
  onCodeChange: (value: string) => void;
  onUnlock: () => void;
  onBack: () => void;
}) => (
  <div className="rd-modal-backdrop">
    <div className="rd-modal" role="dialog" aria-labelledby="admin-access-title">
      <h3 id="admin-access-title">Beheeromgeving openen</h3>
      <p>
        Met de beheercode open je de docentomgeving om afnamecodes te
        beheren en de voortgang per klas te bekijken.
      </p>
      <label className="field-block">
        <span className="field-label">Beheercode</span>
        <input
          className="field-input"
          type="password"
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          placeholder="Beheercode"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onUnlock();
            }
          }}
        />
      </label>
      {error ? <div className="error-banner-inline">{error}</div> : null}
      <div className="actions">
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          ← Terug
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={onUnlock}
          disabled={isLoading}
        >
          <span>{isLoading ? "Controleren…" : "Open beheer"}</span>
          <span className="arrow-circle">→</span>
        </button>
      </div>
    </div>
  </div>
);

const AdminScreen = ({
  adminPassword,
  onBack,
}: {
  adminPassword: string;
  onBack: () => void;
}) => {
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [versionId, setVersionId] = useState<AssessmentVersion["id"]>("lj1-vmbo");
  const [importBatch, setImportBatch] = useState("");
  const [classPlanText, setClassPlanText] = useState("vmbo1a; 3; Noor Jansen, Samira B., Leerling 03");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const adminHeaders = { "x-admin-password": adminPassword };

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const data = await requestJson<StudentsResponse>("/api/students", {
        method: "GET",
        headers: adminHeaders,
      });
      setStudents(data.students);
      setError("");
    } catch {
      setError("Leerlingen ophalen is niet gelukt. Controleer de databasekoppeling.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents();
  }, []);

  const parseClassPlanRows = () =>
    classPlanText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .flatMap((line, lineIndex) => {
        const [classCodeRaw = "", countRaw = "", namesRaw = ""] = line.split(";").map((part) => part.trim());
        const classCode = classCodeRaw.toLowerCase();
        const count = Number.parseInt(countRaw, 10);

        if (!classCode) throw new Error(`Regel ${lineIndex + 1}: klasnaam ontbreekt.`);
        if (!Number.isFinite(count) || count < 1 || count > 250) {
          throw new Error(`Regel ${lineIndex + 1}: aantal moet tussen 1 en 250 liggen.`);
        }

        const names = namesRaw
          .split(/[,|]/)
          .map((name) => name.trim())
          .filter(Boolean);

        return Array.from({ length: count }, (_, index) => ({
          classCode,
          participantLabel: names[index] || `Leerling ${String(index + 1).padStart(2, "0")}`,
        }));
      });

  const importStudents = async () => {
    let rows: Array<{ classCode: string; participantLabel: string }>;
    try {
      rows = parseClassPlanRows();
      if (rows.length === 0) {
        setError("Vul minimaal een klasregel in, bijvoorbeeld: vmbo1a; 28; Noor Jansen, Samira B.");
        return;
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "De klasregels konden niet worden gelezen.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await requestJson<StudentsResponse>("/api/students", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify({
          versionId,
          importBatch,
          students: rows,
        }),
      });
      setStudents(data.students);
      setMessage(`${data.importedCount ?? rows.length} afnamecodes aangemaakt.`);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Importeren is niet gelukt.");
    } finally {
      setIsLoading(false);
    }
  };

  const getExportRows = () =>
    filteredStudents.map((student) => ({
      Afnamecode: student.accessCode,
      Leerling: student.participantLabel || "",
      Klas: student.classCode,
      Nulmeting: assessmentLabels[student.versionId] ?? student.versionId,
      Status: statusLabel(student.status),
      "Import-batch": student.importBatch ?? "",
      "Afgerond op": student.completedAt ? new Date(student.completedAt).toLocaleString("nl-NL") : "",
    }));

  const exportBaseName = () => {
    const yearSuffix = yearFilter === "all" ? "alle-leerjaren" : yearFilter;
    const classSuffix = classFilter.length === 0 ? "alle-klassen" : classFilter.join("-");
    return `afnamecodes-${yearSuffix}-${classSuffix}-${new Date().toISOString().slice(0, 10)}`;
  };

  const exportCodesExcel = async () => {
    const XLSX = await import("xlsx");
    const worksheet = XLSX.utils.json_to_sheet(getExportRows());
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Afnamecodes");
    XLSX.writeFile(workbook, `${exportBaseName()}.xlsx`);
  };

  const exportCodesWord = () => {
    const rows = getExportRows();
    const htmlRows = rows
      .map(
        (row) =>
          `<tr><td>${escapeHtml(row.Afnamecode)}</td><td>${escapeHtml(row.Leerling)}</td><td>${escapeHtml(row.Klas)}</td><td>${escapeHtml(row.Nulmeting)}</td><td>${escapeHtml(row.Status)}</td><td>${escapeHtml(row["Import-batch"])}</td></tr>`,
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Afnamecodes</title><style>body{font-family:Arial,sans-serif}table{border-collapse:collapse;width:100%}td,th{border:1px solid #999;padding:6px;text-align:left}th{background:#eee}</style></head><body><h1>Afnamecodes nulmeting</h1><table><thead><tr><th>Afnamecode</th><th>Leerling</th><th>Klas</th><th>Nulmeting</th><th>Status</th><th>Import-batch</th></tr></thead><tbody>${htmlRows}</tbody></table></body></html>`;
    downloadFile(`${exportBaseName()}.doc`, html, "application/msword");
  };

  const exportCodesPdf = () => {
    const rows = getExportRows();
    const lines = [
      "Afnamecodes nulmeting Digitale Geletterdheid",
      "",
      ...rows.flatMap((row) => [
        `${row.Klas} | ${row.Leerling || "Geen label"} | ${row.Afnamecode} | ${row.Status}`,
      ]),
    ];
    downloadFile(`${exportBaseName()}.pdf`, createPdfDocument(lines), "application/pdf");
  };

  const reopenStudent = async (student: ApiStudent) => {
    setIsLoading(true);
    try {
      const data = await requestJson<StudentsResponse>("/api/students", {
        method: "PATCH",
        headers: adminHeaders,
        body: JSON.stringify({
          action: "reopen",
          accessCode: student.accessCode,
        }),
      });
      setStudents(data.students);
      setMessage(`${student.accessCode} is opnieuw opengezet.`);
      setError("");
    } catch {
      setError("Opnieuw openzetten is niet gelukt.");
    } finally {
      setIsLoading(false);
    }
  };

  const statusLabel = (status?: ApiStudent["status"]) => {
    if (status === "completed") return "Afgerond";
    if (status === "in_progress") return "Bezig";
    return "Niet gestart";
  };

  const versionToPalette: Record<string, "p1" | "p2" | "p3" | "p4" | "p5"> = {
    "lj1-vmbo": "p4",
    "lj1-hv": "p3",
    "lj3-vmbo": "p2",
    "lj3-hv": "p5",
  };

  const getYearForVersion = (id: AssessmentVersion["id"]) =>
    id.startsWith("lj1") ? "lj1" : "lj3";

  const [yearFilter, setYearFilter] = useState<"all" | "lj1" | "lj3">("all");
  const [classFilter, setClassFilter] = useState<string[]>([]);
  const yearFilteredStudents =
    yearFilter === "all"
      ? students
      : students.filter((student) => getYearForVersion(student.versionId) === yearFilter);
  const availableClassCodes = Array.from(
    new Set(yearFilteredStudents.map((student) => student.classCode).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "nl"));
  const filteredStudents =
    classFilter.length === 0
      ? yearFilteredStudents
      : yearFilteredStudents.filter((student) => classFilter.includes(student.classCode));
  const classFilterLabel =
    classFilter.length === 0
      ? "Alle klassen"
      : classFilter.length === 1
        ? classFilter[0]
        : `${classFilter.length} klassen`;

  useEffect(() => {
    setClassFilter((selected) =>
      selected.filter((classCode) => availableClassCodes.includes(classCode)),
    );
  }, [availableClassCodes.join("|")]);

  const completedCount = students.filter((s) => s.status === "completed").length;
  const busyCount = students.filter((s) => s.status === "in_progress").length;
  const notStartedCount = students.filter((s) => !s.status || s.status === "not_started").length;
  const stats: Array<{
    label: string;
    value: string;
    delta: string;
    up: boolean;
  }> = [
    {
      label: "Totaal leerlingen",
      value: String(students.length),
      delta: "Alle klassen samen",
      up: true,
    },
    {
      label: "Bezig",
      value: String(busyCount),
      delta: busyCount > 0 ? "Actief nu" : "Niemand actief",
      up: true,
    },
    {
      label: "Afgerond",
      value: String(completedCount),
      delta: "Status zonder scorekoppeling",
      up: true,
    },
    {
      label: "Niet gestart",
      value: String(notStartedCount),
      delta: notStartedCount > 0 ? "Herinnering nodig" : "Iedereen onderweg",
      up: notStartedCount === 0,
    },
  ];

  return (
    <>
      <section className="admin-hero">
        <div>
          <span className="badge">Docentomgeving</span>
          <h1>
            Beheer afnamecodes<br />en klasvoortgang
          </h1>
          <p className="intro">
            Importeer per klas wie een code nodig heeft en volg alleen de afnamestatus.
            Resultaten worden los van leerlingen opgeslagen voor rapportage op klasniveau.
          </p>
        </div>
        <div className="admin-side-card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "var(--t-accent-deep)",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-display)",
                fontWeight: 900,
              }}
            >
              CC
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: ".95rem" }}>
                Docentaccount
              </div>
              <div style={{ fontSize: ".82rem", color: "var(--c-ink-soft)" }}>Sessie actief</div>
            </div>
          </div>
          <hr style={{ border: 0, borderTop: "1px solid var(--c-line)", margin: "12px 0" }} />
          <div style={{ display: "flex", gap: 24, fontSize: ".88rem" }}>
            <div>
              <div style={{ color: "var(--c-ink-soft)", fontWeight: 500 }}>Leerlingen</div>
              <div style={{ fontWeight: 700 }}>{students.length}</div>
            </div>
            <div>
              <div style={{ color: "var(--c-ink-soft)", fontWeight: 500 }}>Afgerond</div>
              <div style={{ fontWeight: 700 }}>{completedCount}</div>
            </div>
            <div>
              <div style={{ color: "var(--c-ink-soft)", fontWeight: 500 }}>Bezig</div>
              <div style={{ fontWeight: 700 }}>{busyCount}</div>
            </div>
          </div>
        </div>
      </section>

      <div className="stats-strip">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <span className="accent-strip" />
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
            <div className={`delta ${s.up ? "up" : "down"}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      <section className="import-panel">
        <h3>Afnamecodes genereren</h3>
        <p className="help">
          Maak per klas in een keer genoeg codes aan. Gebruik per regel:
          <code> klas; aantal; namen gescheiden door komma&apos;s</code>. Meerdere klassen tegelijk kan.
        </p>
        <div className="grid">
          <label>
            <span>Nulmeting</span>
            <select
              value={versionId}
              onChange={(event) => setVersionId(event.target.value as AssessmentVersion["id"])}
            >
              {defaultCodeMappings.map((mapping) => (
                <option key={mapping.instrumentId} value={mapping.instrumentId}>
                  {mapping.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Import-batch (optioneel)</span>
            <input
              value={importBatch}
              onChange={(event) => setImportBatch(event.target.value)}
              placeholder="bv. najaar-2026"
            />
          </label>
          <label>
            <span>Leerlingen (één per regel)</span>
            <textarea
              value={classPlanText}
              onChange={(event) => setClassPlanText(event.target.value)}
              placeholder={"vmbo1a; 28; Noor Jansen, Samira B., Ali K.\nhavo1b; 30; Mila S., Adam V."}
            />
          </label>
          <button
            className="btn-import"
            type="button"
            onClick={importStudents}
            disabled={isLoading}
          >
            Codes genereren
          </button>
        </div>
        {message ? (
          <div className="success-banner-inline">{message}</div>
        ) : null}
        {error ? (
          <div className="error-banner-inline" style={{ marginTop: 16 }}>
            {error}
          </div>
        ) : null}
      </section>

      <section className="rd-student-section">
        <div className="rd-section-head">
          <div>
            <span className="overline">Overzicht</span>
            <h3 style={{ marginTop: 6 }}>Leerlingen ({filteredStudents.length})</h3>
          </div>
          <div className="rd-section-head" style={{ marginBottom: 0, gap: 12 }}>
            <div className="filters">
              <label className="admin-filter-select">
                <span>Leerjaar</span>
                <select
                  value={yearFilter}
                  onChange={(event) => {
                    setYearFilter(event.target.value as "all" | "lj1" | "lj3");
                    setClassFilter([]);
                  }}
                >
                  <option value="all">Alle leerjaren</option>
                  <option value="lj1">Leerjaar 1</option>
                  <option value="lj3">Leerjaar 3</option>
                </select>
              </label>
              <details className="admin-filter-menu">
                <summary className="filter-chip">Klas: {classFilterLabel}</summary>
                <div className="admin-filter-popover">
                  <label className="check-row compact">
                    <input
                      type="checkbox"
                      checked={classFilter.length === 0}
                      onChange={() => setClassFilter([])}
                    />
                    <span>Alle klassen</span>
                  </label>
                  {availableClassCodes.map((classCode) => (
                    <label className="check-row compact" key={classCode}>
                      <input
                        type="checkbox"
                        checked={classFilter.includes(classCode)}
                        onChange={(event) => {
                          setClassFilter((selected) =>
                            event.target.checked
                              ? Array.from(new Set([...selected, classCode]))
                              : selected.filter((item) => item !== classCode),
                          );
                        }}
                      />
                      <span>{classCode}</span>
                    </label>
                  ))}
                </div>
              </details>
            </div>
            <button
              className="filter-chip"
              type="button"
              onClick={loadStudents}
              disabled={isLoading}
            >
              ↻ Vernieuwen
            </button>
            <details className="admin-export-menu">
              <summary className={`filter-chip ${filteredStudents.length === 0 ? "disabled" : ""}`}>
                Exporteer
              </summary>
              <div className="admin-export-options">
                <button className="filter-chip" type="button" onClick={exportCodesWord} disabled={filteredStudents.length === 0}>
                  Word
                </button>
                <button className="filter-chip" type="button" onClick={exportCodesExcel} disabled={filteredStudents.length === 0}>
                  Excel
                </button>
                <button className="filter-chip" type="button" onClick={exportCodesPdf} disabled={filteredStudents.length === 0}>
                  PDF
                </button>
              </div>
            </details>
          </div>
        </div>

        <div className="rd-student-table">
          <div className="rd-student-row head">
            <span>Code</span>
            <span>Leerling</span>
            <span>Klas</span>
            <span>Meting</span>
            <span>Status</span>
            <span>Actie</span>
          </div>
          {filteredStudents.length === 0 ? (
            <div className="rd-student-row" style={{ gridTemplateColumns: "1fr" }}>
              <span style={{ color: "var(--c-ink-soft)", fontStyle: "italic" }}>
                Nog geen leerlingen in deze selectie.
              </span>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const palette = versionToPalette[student.versionId] ?? "p1";
              const meting = assessmentMap[student.versionId]?.level ?? student.versionId;
              const hasScore = false;
              return (
                <div
                  className="rd-student-row"
                  key={`${student.classCode}-${student.accessCode}`}
                >
                  <span className="code-cell">{student.accessCode}</span>
                  <span>{student.participantLabel || "Geen label"}</span>
                  <span>{student.classCode}</span>
                  <span>
                    <span className="meting-pill" data-p={palette}>
                      <span className="swatch" />
                      {meting}
                    </span>
                  </span>
                  <span>
                    <span
                      className="rd-status-pill"
                      data-s={
                        student.status === "completed"
                          ? "done"
                          : student.status === "in_progress"
                            ? "busy"
                            : ""
                      }
                    >
                      {statusLabel(student.status)}
                    </span>
                  </span>
                  <span className={`score-cell ${hasScore ? "" : "dim"}`}>
                    {hasScore
                      ? `${student.totalScore}/${student.maxScore}`
                      : "—"}
                  </span>
                  <span className="action-btns">
                    <button
                      type="button"
                      onClick={() => reopenStudent(student)}
                      disabled={isLoading}
                    >
                      Heropenen
                    </button>
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>

      <div style={{ marginTop: 32 }}>
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          ← Terug naar leerlingstart
        </button>
      </div>
    </>
  );
};

const AssessmentScreen = ({
  session,
  assessment,
  step,
  stepIndex,
  stepCount,
  onSubmitAnswer,
  onUpdateFileTaskState,
  onFinishFileTask,
  onSkipPerformanceTask,
  onReset,
}: {
  session: AssessmentSession;
  assessment: AssessmentVersion;
  step: StepDescriptor;
  stepIndex: number;
  stepCount: number;
  onSubmitAnswer: (payload: SubmitAnswerPayload) => void;
  onUpdateFileTaskState: (item: AssessmentItem, nextState: Pt1State) => void;
  onFinishFileTask: (section: AssessmentSection, item: AssessmentItem) => void;
  onSkipPerformanceTask: (section: AssessmentSection, item: AssessmentItem) => void;
  onReset: () => void;
}) => {
  const section = getSectionById(assessment, step.sectionId);
  const item = getItemByStep(assessment, step);
  if (!section || !item) {
    return null;
  }

  const steps = getStepDescriptors(assessment);
  const questionSteps = steps.filter((candidateStep) => {
    const candidateItem = getItemByStep(assessment, candidateStep);
    return candidateItem?.type !== "self_assessment";
  });
  const questionIndex = questionSteps.findIndex((candidateStep) => candidateStep.key === step.key);
  const questionNumber = questionIndex >= 0 ? questionIndex + 1 : undefined;
  const questionCount = questionSteps.length;
  const progress = Math.round(((stepIndex + 1) / stepCount) * 100);

  const sectionIdx = assessment.sections.findIndex((s) => s.id === section.id);
  const stepTypeLabel =
    item.type === "multiple_choice"
      ? "Meerkeuzevraag"
      : item.type === "self_assessment"
        ? "Zelfinschatting"
        : "Praktijkopdracht";

  return (
    <div className="q-wrap">
      <div className="assessment-topbar">
        <span className="assessment-step-dot">{questionNumber ?? stepIndex + 1}</span>
        <span className="assessment-step-type">{stepTypeLabel}</span>
        <span className="assessment-top-logo" role="img" aria-label="Citadel College" />
      </div>
      <aside className="q-side">
        {/* Brand */}
        <div className="assess-brand">
          <span className="brand" role="img" aria-label="Citadel College" />
          <div className="brand-label">
            citadel college
            <small>nulmeting digitale geletterdheid</small>
          </div>
        </div>

        {/* Meting */}
        <div className="assess-meta-row">
          <span className="assess-meta-label">METING</span>
          <span className="assess-meta-value">{assessment.level}</span>
        </div>

        {/* Voortgang % */}
        <div className="assess-voortgang-row">
          <span className="assess-meta-label">VOORTGANG</span>
          <strong className="assess-pct">{progress}%</strong>
        </div>
        <div className="progress-bar-mini">
          <span style={{ width: `${progress}%` }} />
        </div>

        {/* Sectielijst */}
        <ul className="assess-section-list">
          {assessment.sections.map((sec, idx) => {
            const secSteps = steps.filter((s) => s.sectionId === sec.id);
            const secTotal = secSteps.length;
            const firstIdx = steps.findIndex((s) => s.sectionId === sec.id);
            const isActive = sec.id === section.id;
            const isDone = firstIdx >= 0 && firstIdx + secTotal - 1 < stepIndex;
            const doneSoFar = isActive ? Math.max(0, stepIndex - firstIdx) : 0;
            return (
              <li
                key={sec.id}
                className={`assess-sec-item${isActive ? " active" : ""}${isDone ? " done" : ""}`}
              >
                <span className="assess-sec-dot">{isDone ? "✓" : idx + 1}</span>
                <span className="assess-sec-name">{shortSectionTitle(sec)}</span>
                <span className="assess-sec-count">
                  {isActive ? `${doneSoFar}/${secTotal}` : secTotal}
                </span>
              </li>
            );
          })}
        </ul>
      </aside>

      <div className="q-main-col">
        <div className="assessment-progress-panel">
          <div className="assessment-progress-row">
            <span className="assessment-main-logo" role="img" aria-label="Citadel College" />
            <div className="assessment-progress-copy">
              <span className="assessment-question-count">
                {questionNumber != null
                  ? `Vraag ${questionNumber} van ${questionCount}`
                  : `Stap ${stepIndex + 1} van ${stepCount}`}
              </span>
              <div className="assessment-progress-track" aria-label={`${progress}% voortgang`}>
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span className="assessment-progress-pill">{progress}%</span>
          </div>
          <div className="assessment-section-bars" aria-hidden="true">
            {assessment.sections.map((sec) => {
              const secSteps = steps.filter((s) => s.sectionId === sec.id);
              const secTotal = secSteps.length;
              const firstIdx = steps.findIndex((s) => s.sectionId === sec.id);
              const isActive = sec.id === section.id;
              const isDone = firstIdx >= 0 && firstIdx + secTotal - 1 < stepIndex;
              const activeProgress =
                isActive && firstIdx >= 0
                  ? Math.min(100, Math.round(((stepIndex - firstIdx + 1) / secTotal) * 100))
                  : 0;
              return (
                <span
                  key={sec.id}
                  className={`assessment-section-bar${isActive ? " active" : ""}${isDone ? " done" : ""}`}
                >
                  <span style={{ width: `${isDone ? 100 : activeProgress}%` }} />
                </span>
              );
            })}
          </div>
        </div>
        {/* Sectiestrook */}
        <div className="q-section-strip">
          <span className="q-section-label">
            ONDERDEEL {sectionIdx + 1} — {shortSectionTitle(section).toUpperCase()}
          </span>
          {questionNumber != null ? (
            <span className="q-question-num">Vraag {questionNumber} / {questionCount}</span>
          ) : null}
          <button className="q-pauze-btn" type="button" onClick={onReset}>Pauze</button>
        </div>

      {item.type === "self_assessment" ? (
        <SelfAssessmentView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
        />
      ) : null}

      {item.type === "file_task_simulation" ? (
        <FileTaskWorkspace
          item={item}
          questionNumber={questionNumber ?? 1}
          state={session.pt1States[item.id]}
          onChange={(nextState) => onUpdateFileTaskState(item, nextState)}
          onFinish={() => onFinishFileTask(section, item)}
          onSkip={() => onSkipPerformanceTask(section, item)}
        />
      ) : null}

      {item.type === "outlook_mail_simulation" ? (
        <MailTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
        />
      ) : null}

      {item.type === "account_security_simulation" ? (
        <InteractionTaskView
          session={session}
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          task={item.securityTask}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
        />
      ) : null}

      {item.type === "excel_download_task" ? (
        <ExcelDownloadTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
        />
      ) : null}

      {item.type === "office_format_download_task" ? (
        <OfficeFormatTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
        />
      ) : null}

      {item.type === "powerpoint_design_task" ? (
        <PowerPointDesignTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
        />
      ) : null}

      {item.type === "teams_share_simulation" ? (
        <FakeTeamsTask
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
        />
      ) : null}

      {item.type === "block_programming_task" ? (
        <BlockProgrammingTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
        />
      ) : null}

      {item.type === "social_action_simulation" ? (
        <InteractionTaskView
          session={session}
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          task={item.socialTask}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
        />
      ) : null}

      {item.type === "multiple_choice" ? (
        <ChoiceItemView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          presentedOrder={getPresentedOrder(session, section.id, item.id)}
          onSubmit={onSubmitAnswer}
        />
      ) : null}
      </div>
    </div>
  );
};

const SelfAssessmentView = ({
  section,
  item,
  questionNumber,
  onSubmit,
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
}) => {
  const [value, setValue] = useState(50);
  const instructionLines = item.instruction
    .split(/\n|(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <section className="panel stack-lg">
      <QuestionHeader label="Zelfinschatting" title={item.title}>
        <p className="slider-instruction">
          {instructionLines.map((line, index) => (
            <span key={line}>
              {line}
              {index < instructionLines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      </QuestionHeader>
      <div className="slider-card">
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
        />
        <div className="slider-scale">
          {(item.selfAssessmentScale ?? [
            { value: 0, label: "bijna niet" },
            { value: 50, label: "redelijk" },
            { value: 100, label: "heel goed" },
          ]).map((label) => (
            <span key={label.value}>
              {label.value} = {label.label}
            </span>
          ))}
        </div>
        <div className="slider-value">{value}</div>
      </div>
      <div className="actions">
        <button
          className="primary-button"
          type="button"
          onClick={() =>
            onSubmit({
              section,
              item,
              selectedAnswer: value,
              shownOptionOrder: [],
            })
          }
        >
          Verder
        </button>
      </div>
    </section>
  );
};

const MailTaskView = ({
  section,
  item,
  questionNumber,
  onSubmit,
  onSkip,
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
  onSkip: () => void;
}) => {
  type AddressField = "to" | "cc" | "bcc";
  type CommandPanel = "attachments" | "link" | null;

  const [draft, setDraft] = useState({
    to: [] as string[],
    cc: [] as string[],
    bcc: [] as string[],
    ccVisible: true,
    bccVisible: false,
    subject: "",
    body: "",
    attachments: [] as string[],
    links: [] as string[],
    linkUrlDraft: "",
    linkTextDraft: "",
    linkTexts: {} as Record<string, string>,
    priority: "Normaal",
    fontFamily: "Aptos",
    fontSize: "12",
    bold: false,
    italic: false,
    underline: false,
    sent: false,
    draftSaved: false,
    deleted: false,
  });
  const [undoSnapshot, setUndoSnapshot] = useState<typeof draft | null>(null);
  const [activeAddressField, setActiveAddressField] = useState<AddressField | null>(null);
  const [activeCommandPanel, setActiveCommandPanel] = useState<CommandPanel>(null);
  const [sendMenuOpen, setSendMenuOpen] = useState(false);
  const [subjectFocused, setSubjectFocused] = useState(false);
  const [notice, setNotice] = useState("");
  const task = item.mailTask;
  if (!task) {
    return null;
  }

  const updateDraft = (updater: (current: typeof draft) => typeof draft) => {
    setDraft((current) => {
      setUndoSnapshot(current);
      return updater(current);
    });
  };

  const toggleListValue = (field: AddressField | "attachments", value: string) => {
    updateDraft((current) => {
      const currentValues = current[field];
      return {
        ...current,
        [field]: currentValues.includes(value)
          ? currentValues.filter((entry) => entry !== value)
          : [...currentValues, value],
      };
    });
  };

  const commitLinkDraft = () => {
    const url = draft.linkUrlDraft.trim();
    const text = draft.linkTextDraft.trim() || url;
    if (!url) {
      return;
    }
    updateDraft((current) => ({
      ...current,
      body: current.body ? `${current.body} ${text}` : text,
      links: current.links.includes(url) ? current.links : [...current.links, url],
      linkTexts: { ...current.linkTexts, [url]: text },
      linkUrlDraft: "",
      linkTextDraft: "",
    }));
  };

  const handleRibbonCommand = (button: string) => {
    setNotice("");
    if (button === "Ongedaan maken") {
      if (undoSnapshot) {
        setDraft(undoSnapshot);
        setUndoSnapshot(null);
      }
      setActiveCommandPanel(null);
      return;
    }

    if (button === "Lettertype") {
      updateDraft((current) => ({
        ...current,
        fontFamily:
          current.fontFamily === "Aptos"
            ? "Calibri"
            : current.fontFamily === "Calibri"
              ? "Arial"
              : "Aptos",
      }));
      return;
    }

    if (button === "Lettergrootte") {
      updateDraft((current) => ({
        ...current,
        fontSize: current.fontSize === "12" ? "14" : current.fontSize === "14" ? "16" : "12",
      }));
      return;
    }

    if (button === "Vet") {
      updateDraft((current) => ({ ...current, bold: !current.bold }));
      return;
    }

    if (button === "Cursief") {
      updateDraft((current) => ({ ...current, italic: !current.italic }));
      return;
    }

    if (button === "Onderstrepen") {
      updateDraft((current) => ({ ...current, underline: !current.underline }));
      return;
    }

    if (button === "CC" || button === "Cc") {
      updateDraft((current) => ({ ...current, ccVisible: true }));
      setActiveAddressField("cc");
      setActiveCommandPanel(null);
      return;
    }

    if (button === "BCC tonen" || button === "Bcc tonen") {
      updateDraft((current) => ({ ...current, bccVisible: !current.bccVisible }));
      setActiveAddressField((current) => (current === "bcc" ? null : "bcc"));
      setActiveCommandPanel(null);
      return;
    }

    if (button === "Bestand invoegen" || button === "Bestand bijvoegen" || button === "Bestand toevoegen") {
      setActiveCommandPanel((current) => (current === "attachments" ? null : "attachments"));
      setActiveAddressField(null);
      return;
    }

    if (button === "Hyperlink invoegen" || button === "Link invoegen") {
      setActiveCommandPanel((current) => (current === "link" ? null : "link"));
      setActiveAddressField(null);
      return;
    }

    if (button === "Prioriteit") {
      updateDraft((current) => ({
        ...current,
        priority: current.priority === "Hoog" ? "Normaal" : "Hoog",
      }));
      setActiveAddressField(null);
      return;
    }

    if (button === "Afdrukken") {
      setNotice("niet beschikbaar");
      setActiveCommandPanel(null);
      setActiveAddressField(null);
      return;
    }

    if (button === "Concept opslaan") {
      updateDraft((current) => ({ ...current, draftSaved: true }));
      setActiveCommandPanel(null);
      return;
    }

    if (button === "Verwijderen") {
      updateDraft((current) => ({ ...current, deleted: true, sent: false }));
      setActiveCommandPanel(null);
      return;
    }
  };

  const sendMessage = () => {
    updateDraft((current) => ({ ...current, sent: true, deleted: false }));
    setSendMenuOpen(false);
  };

  const submit = () => {
    const { linkUrlDraft, linkTextDraft, ...submittedDraft } = draft;
    const trimmedLink = linkUrlDraft.trim();
    onSubmit({
      section,
      item,
      selectedAnswer: {
        ...submittedDraft,
        links:
          trimmedLink && !submittedDraft.links.includes(trimmedLink)
            ? [...submittedDraft.links, trimmedLink]
            : submittedDraft.links,
        linkTexts:
          trimmedLink && linkTextDraft.trim()
            ? { ...submittedDraft.linkTexts, [trimmedLink]: linkTextDraft.trim() }
            : submittedDraft.linkTexts,
      },
      shownOptionOrder: [],
    });
  };

  const toolbarButtons = [
    "Ongedaan maken",
    "Lettertype",
    "Lettergrootte",
    "Vet",
    "Cursief",
    "Onderstrepen",
    "BCC tonen",
    "Bestand invoegen",
    "Hyperlink invoegen",
    "Prioriteit",
    "Afdrukken",
  ];
  const fieldLabel = (field: AddressField) =>
    field === "to" ? "Aan" : field === "cc" ? "Cc" : "Bcc";
  const fieldVisible = (field: AddressField) =>
    field === "to" ||
    field === "cc" ||
    (field === "bcc" && draft.bccVisible);

  const contactInitials = (email: string) => {
    const local = (email.split("@")[0] || email).replace(/[^a-z0-9]/gi, "");
    return (local.slice(0, 2) || "?").toUpperCase();
  };
  const fileExt = (filename: string) => {
    const dot = filename.lastIndexOf(".");
    return dot >= 0 ? filename.slice(dot + 1).toUpperCase().slice(0, 4) : "FILE";
  };
  const sortedFiles = [...task.files].sort((a, b) =>
    a.localeCompare(b, "nl", { sensitivity: "base" }),
  );
  const ribbonIcon = (button: string): ReactNode => {
    if (button === "Ongedaan maken") return "↶";
    if (button === "Lettertype") return "Aa";
    if (button === "Lettergrootte") return draft.fontSize;
    if (button === "Vet") return "B";
    if (button === "Cursief") return <span className="rb-icon-italic">I</span>;
    if (button === "Onderstrepen") return <span className="rb-icon-underline">U</span>;
    if (button === "BCC tonen") return "Bcc";
    if (button === "Bestand invoegen") return <span className="classic-paperclip" />;
    if (button === "Hyperlink invoegen") return "🔗";
    if (button === "Prioriteit") return "!";
    if (button === "Afdrukken") return "⎙";
    return button.slice(0, 1);
  };
  const bodyStyle: CSSProperties = {
    fontFamily: draft.fontFamily,
    fontSize: `${draft.fontSize}px`,
    fontWeight: draft.bold ? 700 : 400,
    fontStyle: draft.italic ? "italic" : "normal",
    textDecoration: draft.underline ? "underline" : "none",
  };

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      />

      <div className="mail-shell">
        <div className="mail-main">
          <div className="mail-titlebar">Nieuwe e-mail</div>
          <div className="mail-tabs" aria-label="Menubalk">
            {["Bestand", "Bericht", "Invoegen", "Tekst opmaken", "Tekenen", "Opties"].map((tab) => (
              <span key={tab} className={tab === "Bericht" ? "active" : ""}>{tab}</span>
            ))}
          </div>
          <div className="mail-ribbon">
            <div className="mail-ribbon-group">
              {toolbarButtons.map((button) => {
                const isActive =
                  (button === "Bestand invoegen" && activeCommandPanel === "attachments") ||
                  (button === "Hyperlink invoegen" && activeCommandPanel === "link") ||
                  (button === "Prioriteit" && draft.priority === "Hoog") ||
                  (button === "Vet" && draft.bold) ||
                  (button === "Cursief" && draft.italic) ||
                  (button === "Onderstrepen" && draft.underline) ||
                  (button === "BCC tonen" && draft.bccVisible);
                const buttonElement = (
                  <button
                    className={`rb rb-icon-only ${isActive ? "active" : ""}`}
                    type="button"
                    onClick={() => handleRibbonCommand(button)}
                    aria-label={button}
                    title={button}
                  >
                    <span className="rb-ico" aria-hidden="true">{ribbonIcon(button)}</span>
                  </button>
                );
                if (button !== "Bestand invoegen") {
                  return <span key={button}>{buttonElement}</span>;
                }
                return (
                  <span className="mail-ribbon-button-wrap" key={button}>
                    {buttonElement}
                    {activeCommandPanel === "attachments" ? (
                      <div className="mail-attach-menu">
                        <strong className="mail-attach-picker-label">Bestand kiezen</strong>
                        <div className="mail-attach-list">
                          {sortedFiles.map((file) => {
                            const picked = draft.attachments.includes(file);
                            return (
                              <button
                                key={file}
                                type="button"
                                className={`attach-chip is-picker ${picked ? "is-picked" : ""}`}
                                onClick={() => toggleListValue("attachments", file)}
                              >
                                <span className="file-pic">{fileExt(file)}</span>
                                <span className="attach-name">{file}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </span>
                );
              })}
            </div>
            {notice ? <span className="mail-notice" role="status">{notice}</span> : null}
            {sendMenuOpen ? (
              <div className="mail-send-menu">
                <button className="rb" type="button" onClick={() => setSendMenuOpen(false)}>
                  Verzending plannen
                </button>
              </div>
            ) : null}
          </div>

          <div className="mail-send-row">
            <button className="mail-send-button" type="button" onClick={sendMessage}>
              <span aria-hidden="true">▷</span>
              <span>Verzenden</span>
            </button>
            <button
              className="mail-send-caret"
              type="button"
              onClick={() => setSendMenuOpen((current) => !current)}
              aria-label="Meer verzendopties"
              title="Meer verzendopties"
            >
              ▾
            </button>
            <span className="mail-from">Van: 01234@leerling.citadelcollege.nl</span>
          </div>

          {activeCommandPanel === "link" ? (
            <div className="mail-inline-panel">
              <strong>Hyperlink invoegen:</strong>
              <input
                className="mail-inline-input"
                value={draft.linkUrlDraft}
                onChange={(event) =>
                  updateDraft((current) => ({ ...current, linkUrlDraft: event.target.value }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitLinkDraft();
                  }
                }}
                placeholder="https://…"
              />
              <input
                className="mail-inline-input"
                value={draft.linkTextDraft}
                onChange={(event) =>
                  updateDraft((current) => ({ ...current, linkTextDraft: event.target.value }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitLinkDraft();
                  }
                }}
                placeholder="Linktekst"
              />
              <button className="rb active" type="button" onClick={commitLinkDraft}>
                Invoegen
              </button>
            </div>
          ) : null}

          <div className="mail-fields">
          {(["to", "cc", "bcc"] as const).map((field) =>
            fieldVisible(field) ? (
              <div
                className="mail-field mail-field-address"
                key={field}
                onClick={() => {
                  setActiveAddressField((current) => (current === field ? null : field));
                  setActiveCommandPanel(null);
                }}
              >
                <span className="label">{fieldLabel(field)}</span>
                <div className="chips-row">
                  {draft[field].map((contact) => (
                    <span className="contact-chip" key={`${field}-${contact}`}>
                      <span className="avatar">{contactInitials(contact)}</span>
                      <span className="contact-email">{contact}</span>
                      <button
                        type="button"
                        className="x"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleListValue(field, contact);
                        }}
                        aria-label={`${contact} verwijderen`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {draft[field].length === 0 ? (
                    <span className="chips-placeholder">Voeg een ontvanger toe…</span>
                  ) : null}
                </div>
                {activeAddressField === field ? (
                  <div className="mail-picker-inline">
                    <div className="mail-picker-header">Contactenlijst</div>
                    {task.contacts.map((contact) => {
                      const isPicked = draft[field].includes(contact);
                      return (
                        <button
                          key={`${field}-pick-${contact}`}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleListValue(field, contact);
                          }}
                          className={`mail-picker-item ${isPicked ? "is-picked" : ""}`}
                        >
                          <span className="avatar">{contactInitials(contact)}</span>
                          <span className="contact-email">{contact}</span>
                          {isPicked ? <span className="check" aria-hidden="true">✓</span> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null,
          )}
          <div className="mail-field mail-field-subject">
            <span className="label">Onderwerp</span>
            <input
              className="subject-input"
              value={draft.subject}
              placeholder={subjectFocused ? "" : "Onderwerp toevoegen"}
              onFocus={() => setSubjectFocused(true)}
              onBlur={() => setSubjectFocused(false)}
              onChange={(event) =>
                updateDraft((current) => ({ ...current, subject: event.target.value }))
              }
            />
            {draft.priority === "Hoog" ? (
              <span className="priority-flag" aria-label="Hoge prioriteit">!</span>
            ) : null}
          </div>
          {draft.attachments.length > 0 ? (
            <div className="mail-attachments mail-attachments-inline">
              <span className="classic-paperclip" aria-hidden="true" />
              {draft.attachments.map((attachment) => (
                <span className="attach-chip" key={attachment}>
                  <span className="file-pic">{fileExt(attachment)}</span>
                  <span className="attach-name">{attachment}</span>
                  <button
                    type="button"
                    className="attach-remove"
                    aria-label={`${attachment} verwijderen`}
                    onClick={() => toggleListValue("attachments", attachment)}
                  >
                    Ã—
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          </div>

          <div className="mail-body-area">
            <textarea
              className="body-edit"
              rows={9}
              value={draft.body}
              style={bodyStyle}
              onChange={(event) =>
                updateDraft((current) => ({ ...current, body: event.target.value }))
              }
              placeholder=""
            />
            {draft.links.length > 0 ? (
              <div className="mail-body-links">
                {draft.links.map((link) => (
                  <a key={link} href={link}>
                    {draft.linkTexts[link] ?? link}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

        </div>
      </div>

      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Volgende"
        onPrimary={draft.sent ? submit : () => { sendMessage(); submit(); }}
        onSkip={onSkip}
      />
    </section>
  );
};

const TaskNavFooter = ({
  questionNumber,
  totalCount,
  primaryLabel,
  onPrimary,
  onSkip,
  primaryDisabled,
}: {
  questionNumber: number;
  totalCount?: number;
  primaryLabel: string;
  onPrimary: () => void;
  onSkip?: () => void;
  primaryDisabled?: boolean;
}) => (
  <div className="task-nav">
    <span className="task-nav-progress">
      {totalCount ? `Opdracht ${questionNumber} van ${totalCount}` : `Opdracht ${questionNumber}`}
    </span>
    {onSkip ? (
      <button className="task-nav-skip" type="button" onClick={onSkip}>
        Ik weet het niet
      </button>
    ) : null}
    <button
      className="task-nav-primary"
      type="button"
      onClick={onPrimary}
      disabled={primaryDisabled}
    >
      <span>{primaryLabel}</span>
      <span className="arrow-circle" aria-hidden="true">→</span>
    </button>
  </div>
);

const splitMessageLines = (text?: string) =>
  (text ?? "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

const SocialChatMockup = ({
  title,
  screens,
}: {
  title: string;
  screens: NonNullable<AssessmentItem["socialTask"]>["screens"];
}) => {
  const messages = screens.flatMap((screen) => {
    const lines = splitMessageLines(screen.body || screen.instruction);
    return lines.length > 0 ? lines : [screen.title];
  });
  const visibleMessages = messages.length > 0
    ? messages
    : ["Bekijk de situatie en kies de veiligste reactie."];

  return (
    <div className="whutsupp-phone" aria-label="Whutsupp groepschat">
      <div className="whutsupp-top">
        <span className="whutsupp-back" aria-hidden="true">‹</span>
        <span className="whutsupp-avatar" aria-hidden="true">DG</span>
        <div>
          <strong>{title.includes("groepschat") ? "Klasgroep" : "Whutsupp"}</strong>
          <small>online</small>
        </div>
      </div>
      <div className="whutsupp-thread">
        {visibleMessages.map((message, index) => {
          const isSam = /sam|noor|haal weg|stop|wil dit niet/i.test(message);
          const isQuoted = /^["“]/.test(message);
          return (
            <div
              className={`whutsupp-bubble ${isSam ? "incoming urgent" : isQuoted || index % 3 === 1 ? "outgoing" : "incoming"}`}
              key={`${message}-${index}`}
            >
              {message}
            </div>
          );
        })}
      </div>
      <div className="whutsupp-compose">
        <span>Bericht</span>
        <button type="button" aria-label="Niet beschikbaar">+</button>
      </div>
    </div>
  );
};

const InteractionTaskView = ({
  session,
  section,
  item,
  questionNumber,
  task,
  onSubmit,
  onSkip,
}: {
  session: AssessmentSession;
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  task: AssessmentItem["securityTask"] | AssessmentItem["socialTask"];
  onSubmit: (payload: SubmitAnswerPayload) => void;
  onSkip: () => void;
}) => {
  const [state, setState] = useState<Record<string, unknown>>({});
  if (!task) {
    return null;
  }

  const orderFor = (
    screenId: string,
    group: InteractionGroup,
    kind: "cards" | "options",
  ) =>
    getPresentedInteractionOrder(
      session,
      section.id,
      item.id,
      screenId,
      group.id,
      kind,
    );
  const orderedEntries = (entries: NonNullable<InteractionGroup["options"]>, order: string[]) =>
    (order.length > 0 ? order : entries.map((entry) => entry.id))
      .map((id) => entries.find((entry) => entry.id === id))
      .filter(Boolean) as NonNullable<InteractionGroup["options"]>;
  const orderedGroup = (screenId: string, group: InteractionGroup): InteractionGroup => ({
    ...group,
    cards: group.cards
      ? orderedEntries(group.cards, orderFor(screenId, group, "cards"))
      : undefined,
    options: group.options
      ? orderedEntries(group.options, orderFor(screenId, group, "options"))
      : undefined,
  });
  const shownOptionOrder = task.screens.flatMap((screen) =>
    screen.groups.flatMap((group) => [
      ...orderFor(screen.id, group, "cards"),
      ...orderFor(screen.id, group, "options"),
    ]),
  );

  const setGroupValue = (groupId: string, value: unknown) => {
    setState((current) => ({ ...current, [groupId]: value }));
  };

  const submit = () =>
    onSubmit({
      section,
      item,
      selectedAnswer: state,
      shownOptionOrder,
    });
  const isSocialTask = item.type === "social_action_simulation";
  const renderScreen = (screen: typeof task.screens[number]) => (
    <div className="interaction-screen" key={screen.id}>
      <div className="stack-xs">
        <strong>{screen.title}</strong>
        <p>{screen.instruction}</p>
        {!isSocialTask && screen.body ? <div className="notice-banner">{screen.body}</div> : null}
      </div>
      {screen.emailStimulus ? <IncomingMailStimulusView email={screen.emailStimulus} /> : null}
      {screen.groups.map((group) => (
        <InteractionGroupControl
          key={group.id}
          group={orderedGroup(screen.id, group)}
          value={state[group.id]}
          allowSkip={item.type === "social_action_simulation"}
          onChange={(value) => setGroupValue(group.id, value)}
        />
      ))}
    </div>
  );

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      />

      {isSocialTask ? (
        <div className="social-chat-task">
          <SocialChatMockup title={item.title} screens={task.screens} />
          <div className="social-question-stack">
            {task.screens.map(renderScreen)}
          </div>
        </div>
      ) : (
        <div className="task-screen-grid">
          {task.screens.map(renderScreen)}
        </div>
      )}

      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Volgende"
        onPrimary={submit}
        onSkip={onSkip}
      />
    </section>
  );
};

const IncomingMailStimulusView = ({ email }: { email: IncomingMailStimulus }) => (
  <div className="mail-shell incoming-mail-shell" aria-label="E-mailbericht">
    <div className="mail-main">
      <div className="mail-titlebar">E-mail</div>
      <div className="mail-tabs" aria-label="Menubalk">
        {["Bestand", "Bericht", "Invoegen", "Opties"].map((tab) => (
          <span key={tab} className={tab === "Bericht" ? "active" : ""}>{tab}</span>
        ))}
      </div>
      <div className="mail-ribbon">
        <div className="mail-ribbon-group">
          {["Beantwoorden", "Doorsturen", "Verwijderen", "Markeren"].map((button) => (
            <button className="rb rb-readonly" type="button" disabled key={button}>
              {button}
            </button>
          ))}
        </div>
      </div>
      <div className="incoming-mail-header">
        <div className="incoming-mail-avatar" aria-hidden="true">
          {email.fromName.slice(0, 2).toUpperCase()}
        </div>
        <div className="incoming-mail-meta">
          <strong>{email.subject}</strong>
          <span>
            Van: {email.fromName} &lt;{email.fromEmail}&gt;
          </span>
          <span>Aan: {email.toEmail}</span>
        </div>
        <time>{email.date}</time>
      </div>
      {email.attachments && email.attachments.length > 0 ? (
        <div className="mail-attachments mail-attachments-inline incoming-attachments">
          <span className="classic-paperclip" aria-hidden="true" />
          {email.attachments.map((attachment) => (
            <span className="attach-chip" key={attachment}>
              <span className="file-pic">{attachment.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE"}</span>
              <span className="attach-name">{attachment}</span>
            </span>
          ))}
        </div>
      ) : null}
      <div className="mail-body-area incoming-mail-body">
        {email.body.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {email.linkLabel && email.linkUrl ? (
          <div className="incoming-link-block">
            <span>{email.linkLabel}</span>
            <code>{email.linkUrl}</code>
          </div>
        ) : null}
      </div>
    </div>
  </div>
);

const InteractionGroupControl = ({
  group,
  value,
  allowSkip = false,
  onChange,
}: {
  group: InteractionGroup;
  value: unknown;
  allowSkip?: boolean;
  onChange: (value: unknown) => void;
}) => {
  const selectedMulti = Array.isArray(value) ? value.map(String) : [];
  const selectedSingle = typeof value === "string" ? value : "";
  const matches =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, string>)
      : {};

  if (group.inputType === "toggle") {
    return (
      <div className="interaction-group">
        <strong>{group.title}</strong>
        <button
          className={`toggle-button ${value === true ? "active" : ""}`}
          type="button"
          onClick={() => onChange(value !== true)}
        >
          {value === true ? "Aan" : "Uit"}
        </button>
      </div>
    );
  }

  if (group.inputType === "matching") {
    return (
      <div className="interaction-group">
        <strong>{group.title}</strong>
        <div className="matching-grid">
          {(group.cards ?? []).map((card) => (
            <label className="field" key={card.id}>
              <span>{card.label}</span>
              <select
                value={matches[card.id] ?? ""}
                onChange={(event) =>
                  onChange({ ...matches, [card.id]: event.target.value })
                }
              >
                <option value="">Kies</option>
                {(group.options ?? []).map((option) => (
                  <option value={option.id} key={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
        {allowSkip ? (
          <button className="ghost-button" type="button" onClick={() => onChange({})}>
            Sla over
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="interaction-group">
      <strong>{group.title}</strong>
      {group.instruction ? <p>{group.instruction}</p> : null}
      <div className="chip-grid">
        {(group.options ?? []).map((option) => {
          const selected =
            group.inputType === "multi"
              ? selectedMulti.includes(option.id)
              : selectedSingle === option.id;
          return (
            <button
              className={`chip-button ${selected ? "selected" : ""}`}
              key={option.id}
              type="button"
              onClick={() => {
                if (group.inputType === "multi") {
                  onChange(
                    selected
                      ? selectedMulti.filter((id) => id !== option.id)
                      : [...selectedMulti, option.id],
                  );
                  return;
                }
                onChange(option.id);
              }}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {allowSkip ? (
        <button
          className="ghost-button"
          type="button"
          onClick={() => onChange(group.inputType === "multi" ? [] : "")}
        >
          Sla over
        </button>
      ) : null}
    </div>
  );
};

const ExcelDownloadTaskView = ({
  section,
  item,
  questionNumber,
  onSubmit,
  onSkip,
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
  onSkip: () => void;
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const task = item.excelTask;
  if (!task) {
    return null;
  }

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      />

      <div className="download-card">
        <div>
          <strong>{task.filename}</strong>
          <span>Sheet: {task.sheetName}</span>
        </div>
        <a className="secondary-button download-link" href={`/downloads/${task.filename}`} download>
          Download bestand
        </a>
      </div>
      <div className="notice-banner">
        Open dit bestand in Microsoft Excel of Excel Online.
      </div>

      <div className="excel-question-stack">
        {task.questions.map((question) => (
          <label className="field" key={question.id}>
            <span>{question.prompt}</span>
            <input
              value={answers[question.id] ?? ""}
              onChange={(event) =>
                setAnswers((current) => ({ ...current, [question.id]: event.target.value }))
              }
              placeholder="Code"
            />
          </label>
        ))}
      </div>

      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Volgende"
        onPrimary={() =>
          onSubmit({
            section,
            item,
            selectedAnswer: { answers },
            shownOptionOrder: [],
          })
        }
        onSkip={onSkip}
      />
    </section>
  );
};

const OfficeFormatTaskView = ({
  section,
  item,
  questionNumber,
  onSubmit,
  onSkip,
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
  onSkip: () => void;
}) => {
  const [code, setCode] = useState("");
  const [exportAction, setExportAction] = useState("");
  const task = item.officeFormatTask;
  if (!task) {
    return null;
  }

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      />

      <div className="download-card">
        <div>
          <strong>{task.filename}</strong>
          {task.sheetName ? <span>Sheet: {task.sheetName}</span> : null}
        </div>
        <a className="secondary-button download-link" href={`/downloads/${task.filename}`} download>
          Download bestand
        </a>
      </div>

      <label className="field">
        <span>{task.codeQuestion}</span>
        <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Code" />
      </label>

      <div className="interaction-group">
        <strong>{task.exportQuestion}</strong>
        <div className="option-grid compact-grid">
          {task.exportActions.map((action) => (
            <button
              className={`option-card compact ${exportAction === action ? "selected" : ""}`}
              key={action}
              type="button"
              onClick={() => setExportAction(action)}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Volgende"
        onPrimary={() =>
          onSubmit({
            section,
            item,
            selectedAnswer: { code, exportAction },
            shownOptionOrder: [],
          })
        }
        onSkip={onSkip}
      />
    </section>
  );
};

const PowerPointDesignTaskView = ({
  section,
  item,
  questionNumber,
  onSubmit,
  onSkip,
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
  onSkip: () => void;
}) => {
  const [state, setState] = useState<Record<string, string>>({});
  const task = item.powerPointTask;
  if (!task) {
    return null;
  }

  const selectedLabel = (groupId: string) => {
    const group = task.groups.find((candidate) => candidate.id === groupId);
    return group?.options.find((option) => option.id === state[groupId])?.label ?? "";
  };

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      />

      <div className="powerpoint-window">
        <div className="powerpoint-titlebar">PowerPoint - Presentatie1</div>
        <div className="powerpoint-ribbon">
          {["Start", "Invoegen", "Ontwerpen", "Overgangen", "Diavoorstelling", "Bestand"].map(
            (tab) => (
              <span key={tab}>{tab}</span>
            ),
          )}
        </div>
        <div className="powerpoint-task-layout">
          <div className="powerpoint-controls">
            <p>{task.scenario}</p>
            {task.groups.map((group) => (
              <div className="interaction-group" key={group.id}>
                <strong>{group.title}</strong>
                <div className="option-grid compact-grid">
                  {group.options.map((option) => (
                    <button
                      className={`option-card compact ${
                        state[group.id] === option.id ? "selected" : ""
                      }`}
                      key={option.id}
                      type="button"
                      onClick={() =>
                        setState((current) => ({ ...current, [group.id]: option.id }))
                      }
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="powerpoint-preview">
            <div className="slide-thumbnail">1</div>
            <div className="slide-canvas">
              <div className="slide-title">
                {selectedLabel("titleText") || "Titel van de dia"}
              </div>
              <div className="slide-body">
                <div className="slide-image-placeholder">
                  {selectedLabel("layout") || "Indeling"}
                </div>
                <div className="slide-bullets">
                  {selectedLabel("content") || "Inhoud"}
                </div>
              </div>
              <div className="slide-footer">
                {selectedLabel("exportAction") || "Exportkeuze"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Volgende"
        onPrimary={() =>
          onSubmit({
            section,
            item,
            selectedAnswer: state,
            shownOptionOrder: [],
          })
        }
        onSkip={onSkip}
      />
    </section>
  );
};

type TeamsActionLogEntry = {
  actionType: string;
  timestamp: string;
};

type TeamsChatMessage = {
  id: number;
  text: string;
};

type TeamsReactionBurst = {
  id: number;
  emoji: string;
};

type TeamsIconName = "camera" | "mic" | "chat" | "people" | "reaction" | "share" | "more";

const requiredTeamsSequence = [
  "clicked_share",
  "clicked_window",
  "selected_windows_media_player",
];

const hasCompletedTeamsSequence = (actionLog: TeamsActionLogEntry[]) => {
  let cursor = 0;
  for (const entry of actionLog) {
    if (entry.actionType === requiredTeamsSequence[cursor]) {
      cursor += 1;
      if (cursor === requiredTeamsSequence.length) {
        return true;
      }
    }
  }
  return false;
};

const TeamsIcon = ({ name }: { name: TeamsIconName }) => {
  const paths = {
    camera: "M4 7h11v10H4z M15 10l5-3v10l-5-3z",
    mic: "M9 4h6v9a3 3 0 0 1-6 0z M5 11a7 7 0 0 0 14 0 M12 18v3 M8 21h8",
    chat: "M4 5h16v11H8l-4 4z M8 9h8 M8 12h5",
    people: "M9 11a3 3 0 1 0 0-6a3 3 0 0 0 0 6z M17 11a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z M3.5 19c.8-3 2.8-4.5 5.5-4.5s4.7 1.5 5.5 4.5 M14 15.5c2.2.1 3.8 1.2 4.5 3.5",
    reaction: "M12 20a8 8 0 1 0 0-16a8 8 0 0 0 0 16z M8.5 10h.1 M15.4 10h.1 M8.5 14c1 1.3 2.1 2 3.5 2s2.5-.7 3.5-2",
    share: "M12 16V4 M7 9l5-5l5 5 M5 14v5h14v-5",
    more: "M5 12h.1 M12 12h.1 M19 12h.1",
  };

  return (
    <svg className="teams-inline-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={paths[name]} />
    </svg>
  );
};

const iconNameForTeamsButton = (button: string): TeamsIconName => {
  if (button === "Camera") {
    return "camera";
  }
  if (button === "Microfoon") {
    return "mic";
  }
  if (button === "Chat") {
    return "chat";
  }
  if (button === "Deelnemers") {
    return "people";
  }
  if (button === "Reageren") {
    return "reaction";
  }
  if (button === "Delen") {
    return "share";
  }
  return "more";
};

const actionName = (label: string) =>
  `clicked_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;

const teamsPortraitImage = "/teams/meeting-portraits.png";

const windowKind = (windowName: string) => {
  const normalized = windowName.toLowerCase();
  if (normalized.includes("videospeler") || normalized.includes("media player")) {
    return "media";
  }
  if (normalized.includes("word")) {
    return "word";
  }
  if (normalized.includes("excel")) {
    return "excel";
  }
  if (normalized.includes("browser")) {
    return "browser";
  }
  if (normalized.includes("chat")) {
    return "chat";
  }
  return "desktop";
};

const WindowPreviewArt = ({ windowName, large = false }: { windowName: string; large?: boolean }) => {
  const kind = windowKind(windowName);

  if (kind === "media") {
    return (
      <div className={`window-art window-art-media ${large ? "large" : ""}`}>
        <div className="film-sky" />
        <div className="film-play">▶</div>
        <div className="film-controls"><span /><span /></div>
      </div>
    );
  }

  if (kind === "word") {
    return (
      <div className={`window-art window-art-word ${large ? "large" : ""}`}>
        <div className="word-ribbon"><span /><span /><span /></div>
        <div className="word-page">
          <strong>Verslag</strong>
          <span />
          <span />
          <span className="short" />
        </div>
      </div>
    );
  }

  if (kind === "excel") {
    return (
      <div className={`window-art window-art-excel ${large ? "large" : ""}`}>
        {Array.from({ length: 20 }, (_, index) => (
          <span className={index < 5 ? "head" : ""} key={index} />
        ))}
      </div>
    );
  }

  if (kind === "browser") {
    return (
      <div className={`window-art window-art-browser ${large ? "large" : ""}`}>
        <div className="browser-bar" />
        <div className="browser-card"><strong>Rooster</strong><span /><span /></div>
      </div>
    );
  }

  if (kind === "chat") {
    return (
      <div className={`window-art window-art-chat ${large ? "large" : ""}`}>
        <span className="bubble left" />
        <span className="bubble right" />
        <span className="bubble left short" />
      </div>
    );
  }

  return (
    <div className={`window-art window-art-desktop ${large ? "large" : ""}`}>
      <span />
      <span />
      <span />
    </div>
  );
};

const SharedWindowStage = ({ windowName }: { windowName: string }) => (
  <div className="fake-shared-stage">
    <div className="fake-sharing-label">Je deelt nu dit venster</div>
    <div className="fake-shared-window">
      <div className="fake-window-titlebar">
        <span>Macrohard Teams</span>
        <span>{windowName}</span>
      </div>
      <WindowPreviewArt windowName={windowName} large />
    </div>
  </div>
);

const TeamsVideoTile = ({
  person,
  initials,
  cameraOn,
  photoSide,
  small = false,
  blurred = false,
}: {
  person: string;
  initials: string;
  cameraOn: boolean;
  photoSide: "learner" | "teacher";
  small?: boolean;
  blurred?: boolean;
}) => (
  <div className={`fake-video-tile ${small ? "compact" : ""} ${cameraOn ? "camera-on" : ""}`}>
    {cameraOn ? (
      <div className={`fake-video-photo ${photoSide} ${blurred ? "blurred" : ""}`}>
        <img src={teamsPortraitImage} alt="" draggable="false" />
      </div>
    ) : (
      <div className={`fake-avatar ${small ? "small" : ""}`}>{initials}</div>
    )}
    <span>{person}</span>
  </div>
);

const FakeTeamsTask = ({
  section,
  item,
  questionNumber,
  onSubmit,
  onSkip,
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
  onSkip: () => void;
}) => {
  const [state, setState] = useState({
    shareOpened: false,
    windowPickerOpen: false,
    selectedWindow: "",
    actionLog: [] as TeamsActionLogEntry[],
    skipped: false,
    cameraOn: true,
    micMuted: false,
    chatOpen: false,
    chatInput: "",
    chatMessages: [] as TeamsChatMessage[],
    participantsOpen: true,
    reactionsOpen: false,
    reactionBursts: [] as TeamsReactionBurst[],
    moreOpen: false,
    backgroundBlurred: false,
    captionsVisible: false,
    computerSoundOn: false,
  });
  const task = item.teamsTask;
  if (!task) {
    return null;
  }

  const logAction = (actionType: string, updates: Partial<typeof state> = {}) => {
    setState((current) => ({
      ...current,
      ...updates,
      actionLog: [
        ...current.actionLog,
        {
          actionType,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  };

  const appendAction = (current: typeof state, actionType: string) => ({
    ...current,
    actionLog: [
      ...current.actionLog,
      {
        actionType,
        timestamp: new Date().toISOString(),
      },
    ],
  });

  const sendChatMessage = () => {
    const text = state.chatInput.trim();
    if (!text) {
      return;
    }
    setState((current) => ({
      ...appendAction(current, "sent_chat_message"),
      chatInput: "",
      chatMessages: [
        ...current.chatMessages,
        {
          id: Date.now(),
          text,
        },
      ],
    }));
  };

  const sendReaction = (emoji: string) => {
    const reaction = {
      id: Date.now(),
      emoji,
    };
    setState((current) => ({
      ...appendAction(current, `sent_reaction_${emoji}`),
      reactionsOpen: false,
      reactionBursts: [...current.reactionBursts.slice(-5), reaction],
    }));
    window.setTimeout(() => {
      setState((current) => ({
        ...current,
        reactionBursts: current.reactionBursts.filter((item) => item.id !== reaction.id),
      }));
    }, 2200);
  };

  const submit = (skipped = false) => {
    onSubmit({
      section,
      item,
      selectedAnswer: {
        shareOpened: state.shareOpened,
        windowPickerOpen: state.windowPickerOpen,
        selectedWindow: state.selectedWindow,
        actionLog: state.actionLog,
        completedSequence: hasCompletedTeamsSequence(state.actionLog),
        computerSoundOn: state.computerSoundOn,
        skipped,
      },
      shownOptionOrder: [],
    });
  };

  return (
    <section className="panel stack-lg fake-teams-task-panel">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      >
        <div className="notice-banner">{task.scenario}</div>
      </QuestionHeader>

      <div className="fake-teams-shell" aria-label="Macrohard Teams-vergadering">
        <div className="fake-teams-titlebar">
          <div className="fake-teams-appmark">M</div>
          <span>Macrohard Teams</span>
        </div>

        <div className={`fake-teams-content ${state.participantsOpen ? "" : "participants-hidden"}`}>
          {state.participantsOpen ? (
            <aside className="fake-teams-side">
              <strong>Vergadering</strong>
              <span>Nu bezig</span>
              <div className="fake-participant active">Mark Canbers</div>
              <div className="fake-participant">Docent</div>
              <button
                className="fake-invite-button"
                type="button"
                onClick={() => logAction("clicked_invite_participants")}
              >
                Deelnemers uitnodigen
              </button>
            </aside>
          ) : null}

          <div className="fake-teams-main">
            <div className="fake-teams-stage">
              {state.selectedWindow === task.correctWindow ? (
                <SharedWindowStage windowName={state.selectedWindow} />
              ) : (
                <>
                  <TeamsVideoTile
                    person="Mark Canbers"
                    initials="MC"
                    cameraOn={state.cameraOn}
                    photoSide="learner"
                    blurred={state.backgroundBlurred}
                  />
                  <TeamsVideoTile person="Docent" initials="D" cameraOn photoSide="teacher" small />
                </>
              )}
            </div>

            {state.reactionBursts.map((reaction, index) => (
              <span
                className="fake-reaction-float"
                key={reaction.id}
                style={{ left: `${24 + index * 11}%` }}
                aria-hidden="true"
              >
                {reaction.emoji}
              </span>
            ))}

            {state.captionsVisible ? (
              <div className="fake-captions">Ondertiteling: de vergadering is gestart.</div>
            ) : null}

            {state.shareOpened ? (
              <div className="fake-share-menu" role="menu" aria-label="Deelmenu">
                <strong>Delen</strong>
                <label className="fake-sound-toggle">
                  <input
                    type="checkbox"
                    checked={state.computerSoundOn}
                    onChange={(event) =>
                      logAction("toggled_computer_sound", {
                        computerSoundOn: event.target.checked,
                      })
                    }
                  />
                  <span>Met computergeluid</span>
                </label>
                <div className="fake-share-options">
                  {task.shareOptions.map((option) => (
                    <button
                      className={option === "Venster" && state.windowPickerOpen ? "selected" : ""}
                      key={option}
                      type="button"
                      onClick={() => {
                        if (option === "Venster") {
                          logAction("clicked_window", { windowPickerOpen: true });
                          return;
                        }
                        logAction(actionName(option), {
                          windowPickerOpen: false,
                          selectedWindow: option,
                        });
                      }}
                    >
                      <span className="fake-share-icon" aria-hidden="true">
                        <WindowPreviewArt windowName={option} />
                      </span>
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {state.windowPickerOpen ? (
              <div className="fake-window-picker" aria-label="Venster selecteren">
                <strong>Kies een venster</strong>
                <div className="fake-window-grid">
                  {task.windows.map((windowName) => (
                    <button
                      className={state.selectedWindow === windowName ? "selected" : ""}
                      key={windowName}
                      type="button"
                      onClick={() => {
                        logAction(
                          windowName === task.correctWindow
                            ? "selected_windows_media_player"
                            : `selected_${actionName(windowName).replace(/^clicked_/, "")}`,
                          {
                            selectedWindow: windowName,
                            shareOpened: windowName === task.correctWindow ? false : state.shareOpened,
                            windowPickerOpen: windowName === task.correctWindow ? false : state.windowPickerOpen,
                          },
                        );
                      }}
                    >
                      <span className="fake-window-preview" aria-hidden="true">
                        <WindowPreviewArt windowName={windowName} />
                      </span>
                      <span>{windowName}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {state.chatOpen ? (
              <div className="fake-chat-panel" aria-label="Chatvenster">
                <div className="fake-panel-heading">
                  <strong>Chat</strong>
                  <button type="button" onClick={() => logAction("closed_chat", { chatOpen: false })}>
                    Sluiten
                  </button>
                </div>
                <div className="fake-chat-messages" aria-live="polite">
                  <div className="fake-chat-message received">Welkom bij de meting DG</div>
                  {state.chatMessages.map((message) => (
                    <div className="fake-chat-message sent" key={message.id}>
                      {message.text}
                    </div>
                  ))}
                </div>
                <form
                  className="fake-chat-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendChatMessage();
                  }}
                >
                  <input
                    aria-label="Chatbericht"
                    value={state.chatInput}
                    onChange={(event) => setState((current) => ({ ...current, chatInput: event.target.value }))}
                    placeholder="Typ een bericht"
                  />
                  <button type="submit">Verstuur</button>
                </form>
              </div>
            ) : null}

            {state.reactionsOpen ? (
              <div className="fake-reaction-menu" aria-label="Reactie kiezen">
                {["👍", "👏", "❤️", "😊", "✋"].map((emoji) => (
                  <button key={emoji} type="button" onClick={() => sendReaction(emoji)}>
                    {emoji}
                  </button>
                ))}
              </div>
            ) : null}

            {state.moreOpen ? (
              <div className="fake-more-menu" aria-label="Meer opties">
                <button
                  type="button"
                  onClick={() =>
                    logAction("toggled_background_blur", {
                      backgroundBlurred: !state.backgroundBlurred,
                      moreOpen: false,
                    })
                  }
                >
                  Achtergrond vervagen
                </button>
                <button
                  type="button"
                  onClick={() =>
                    logAction("toggled_captions", {
                      captionsVisible: !state.captionsVisible,
                      moreOpen: false,
                    })
                  }
                >
                  Ondertiteling {state.captionsVisible ? "uit" : "aan"}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="fake-teams-toolbar">
          {task.buttons.map((button) => (
            <button
              className={[
                button === "Delen" && state.shareOpened ? "active" : "",
                button === "Camera" && !state.cameraOn ? "inactive" : "",
                button === "Microfoon" && state.micMuted ? "muted" : "",
                button === "Chat" && state.chatOpen ? "active" : "",
                button === "Deelnemers" && state.participantsOpen ? "active" : "",
                button === "Reageren" && state.reactionsOpen ? "active" : "",
                button === "Meer" && state.moreOpen ? "active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={button}
              type="button"
              onClick={() => {
                if (button === "Delen") {
                  logAction("clicked_share", {
                    shareOpened: !state.shareOpened,
                    windowPickerOpen: false,
                  });
                  return;
                }
                if (button === "Camera") {
                  logAction("toggled_camera", { cameraOn: !state.cameraOn });
                  return;
                }
                if (button === "Microfoon") {
                  logAction("toggled_microphone", { micMuted: !state.micMuted });
                  return;
                }
                if (button === "Chat") {
                  logAction("clicked_chat", { chatOpen: !state.chatOpen });
                  return;
                }
                if (button === "Deelnemers") {
                  logAction("clicked_participants", { participantsOpen: !state.participantsOpen });
                  return;
                }
                if (button === "Reageren") {
                  logAction("clicked_reactions", { reactionsOpen: !state.reactionsOpen });
                  return;
                }
                if (button === "Meer") {
                  logAction("clicked_more", { moreOpen: !state.moreOpen });
                  return;
                }
                logAction(actionName(button));
              }}
            >
              <TeamsIcon name={iconNameForTeamsButton(button)} />
              {button}
            </button>
          ))}
        </div>

        {state.selectedWindow ? (
          <div className="fake-teams-status">
            {state.selectedWindow === task.correctWindow
              ? `${task.correctWindow} wordt gedeeld`
              : `${state.selectedWindow} is geselecteerd`}
          </div>
        ) : null}
      </div>

      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Volgende"
        onPrimary={() => submit(false)}
        onSkip={onSkip}
      />
    </section>
  );
};

type ProgramBlock = ProgrammingBlockDefinition & { indent: number };
type ProgramRunEffects = {
  move: number;
  rotation: number;
  speech: string;
  display: string;
  sound: string;
  score: number | null;
  speed: number | null;
  animationPaused: boolean;
  teller: number;
  log: string[];
};

const emptyProgramRunEffects: ProgramRunEffects = {
  move: 0,
  rotation: 0,
  speech: "",
  display: "",
  sound: "",
  score: null,
  speed: null,
  animationPaused: false,
  teller: 0,
  log: [],
};

const BlockProgrammingTaskView = ({
  section,
  item,
  questionNumber,
  onSubmit,
  onSkip,
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
  onSkip: () => void;
}) => {
  const [program, setProgram] = useState<ProgramBlock[]>([]);
  const [executed, setExecuted] = useState(false);
  const [speechVisible, setSpeechVisible] = useState(false);
  const [aPresses, setAPresses] = useState(0);
  const [temperature, setTemperature] = useState(30);
  const [windowOpen, setWindowOpen] = useState(true);
  const [runEffects, setRunEffects] = useState<ProgramRunEffects>(
    emptyProgramRunEffects,
  );
  const [runStep, setRunStep] = useState(-1); // -1 idle; otherwise index of currently-active block
  const [runTimer, setRunTimer] = useState<number | null>(null);
  const task = item.blockTask;
  const [paletteBlocks] = useState(() => shuffleItems(item.blockTask?.blocks ?? []));
  if (!task) {
    return null;
  }
  const blockByLabel = new Map(task.blocks.map((block) => [block.label, block]));
  const blockStyle = (block: Pick<ProgrammingBlockDefinition, "color">) =>
    ({ "--block-color": block.color } as CSSProperties);

  const addBlockToProgram = (block: ProgrammingBlockDefinition) => {
    setProgram((current) => {
      const previous = current[current.length - 1];
      return [
        ...current,
        {
          ...block,
          indent: previous?.isContainer
            ? Math.min(3, (previous.indent ?? 0) + 1)
            : previous?.indent ?? 0,
        },
      ];
    });
  };
  const hasBlock = (label: string) => program.some((block) => block.label === label);

  const executeProgram = (): ProgramRunEffects => {
    const effects: ProgramRunEffects = {
      ...emptyProgramRunEffects,
      log: [],
      teller: 0,
    };
    let nextMoveMultiplier = 1;
    let stopped = false;
    const sensorConditionPass = temperature > 25 && windowOpen;
    const sensorConditionIndex = program.findIndex((block) =>
      block.label.includes("temperatuur > 25) EN"),
    );
    const sensorElseIndex = program.findIndex((block) => block.label === "anders");

    program.forEach((block, index) => {
      const label = block.label;
      if (stopped) {
        effects.log.push(`Overgeslagen na stop alles: ${label}`);
        return;
      }

      if (label.includes("afspelen") || label === "bij start") {
        effects.log.push(`Start uitgevoerd: ${label}`);
        return;
      }
      if (label.includes("wanneer er op Bizzy")) {
        effects.log.push("Bizzy-klikblok is actief gezet.");
        return;
      }
      if (label.includes('zegt "Hoi!"')) {
        effects.speech = "Hoi!";
        effects.log.push("Bizzy zegt: Hoi!");
        return;
      }
      if (label.includes("verplaats Bizzy 1 meter vooruit")) {
        effects.move += nextMoveMultiplier;
        effects.log.push(`Bizzy beweegt ${nextMoveMultiplier} meter vooruit.`);
        nextMoveMultiplier = 1;
        return;
      }
      if (label === "1 stap vooruit") {
        effects.move += nextMoveMultiplier;
        effects.log.push(`Bizzy beweegt ${nextMoveMultiplier} stap vooruit.`);
        nextMoveMultiplier = 1;
        return;
      }
      if (label === "2 stappen vooruit") {
        effects.move += 2;
        effects.log.push("Bizzy beweegt 2 stappen vooruit.");
        return;
      }
      if (label === "2 stappen achteruit") {
        effects.move -= 2;
        effects.log.push("Bizzy beweegt 2 stappen achteruit.");
        return;
      }
      if (label.includes("verplaats Bizzy 5 meters achteruit")) {
        effects.move -= 5;
        effects.log.push("Bizzy beweegt 5 meter achteruit.");
        return;
      }
      if (label.includes("draai Bizzy")) {
        effects.rotation = 180;
        effects.log.push("Bizzy draait naar 180 graden.");
        return;
      }
      if (label === "draai naar rechts" || label === "rechts draaien") {
        effects.rotation += 90;
        effects.log.push("Bizzy draait naar rechts.");
        return;
      }
      if (label === "draai naar links" || label === "links draaien") {
        effects.rotation -= 90;
        effects.log.push("Bizzy draait naar links.");
        return;
      }
      if (label.includes("niet animeren")) {
        effects.animationPaused = true;
        effects.log.push("De animatie van Bizzy staat op niet animeren.");
        return;
      }
      if (label === "herhaal 3 keer") {
        nextMoveMultiplier = 3;
        effects.log.push("Herhaling ingesteld op 3 keer.");
        return;
      }
      if (label === "herhaal 10 keer") {
        nextMoveMultiplier = 10;
        effects.log.push("Herhaling ingesteld op 10 keer.");
        return;
      }
      if (label === "herhaal altijd") {
        effects.log.push("Herhaal altijd gestart.");
        return;
      }
      if (label === "als 1 < 2") {
        effects.log.push("Voorwaarde 1 < 2 gecontroleerd: waar.");
        return;
      }
      if (label === "als Bizzy rand raakt") {
        effects.log.push("Bizzy controleert of hij de rand raakt.");
        return;
      }
      if (label.startsWith("speel geluid")) {
        effects.sound = label.replace("speel geluid ", "");
        effects.log.push(`Geluid afgespeeld: ${effects.sound}.`);
        return;
      }
      if (label.startsWith("wacht")) {
        effects.log.push(`${label} uitgevoerd.`);
        return;
      }
      if (label === "zet score op 0") {
        effects.score = 0;
        effects.log.push("Score is op 0 gezet.");
        return;
      }
      if (label === "zet snelheid op 2") {
        effects.speed = 2;
        effects.log.push("Snelheid is op 2 gezet.");
        return;
      }
      if (label === "stop alles") {
        stopped = true;
        effects.log.push("Stop alles uitgevoerd.");
        return;
      }
      if (label === "zet teller op 0") {
        effects.teller = 0;
        effects.log.push("Teller is op 0 gezet.");
        return;
      }
      if (label === "als knop A wordt ingedrukt") {
        effects.log.push("Knop A is als gebeurtenis actief gezet.");
        return;
      }
      if (label === "als knop B wordt ingedrukt") {
        effects.log.push("Knop B is als gebeurtenis actief gezet.");
        return;
      }
      if (label === "verander teller met 1") {
        effects.teller += 1;
        effects.log.push("Teller is met 1 verhoogd.");
        return;
      }
      if (label === "verander teller met -1") {
        effects.teller -= 1;
        effects.log.push("Teller is met 1 verlaagd.");
        return;
      }
      if (label === "als teller >= 5 dan") {
        effects.log.push(`Controle teller >= 5: ${aPresses >= 5 ? "waar" : "niet waar"}.`);
        return;
      }
      if (label === "als teller < 5 dan") {
        effects.log.push(`Controle teller < 5: ${aPresses < 5 ? "waar" : "niet waar"}.`);
        return;
      }
      if (label === 'toon "vol"') {
        if (aPresses >= 5 || task.device !== "microbit") {
          effects.display = "vol";
        }
        effects.log.push('Scherm toont "vol".');
        return;
      }
      if (label === 'toon "leeg"') {
        effects.display = "leeg";
        effects.log.push('Scherm toont "leeg".');
        return;
      }
      if (label === "lees temperatuur") {
        effects.log.push(`Temperatuur gelezen: ${temperature}.`);
        return;
      }
      if (label === "lees raamstand") {
        effects.log.push(`Raamstand gelezen: ${windowOpen ? "open" : "dicht"}.`);
        return;
      }
      if (label.includes("temperatuur > 25") || label.includes("temperatuur < 25")) {
        effects.log.push(`Voorwaarde gecontroleerd: ${label}.`);
        return;
      }
      if (label === "anders") {
        effects.log.push("Anders-tak bereikt.");
        return;
      }
      if (label === 'toon "waarschuwing"') {
        const inThenBranch =
          sensorConditionIndex === -1 ||
          (index > sensorConditionIndex &&
            (sensorElseIndex === -1 || index < sensorElseIndex));
        if (task.device !== "sensor" || !inThenBranch || sensorConditionPass) {
          effects.display = "waarschuwing";
        }
        effects.log.push('Scherm toont "waarschuwing" wanneer de tak actief is.');
        return;
      }
      if (label === 'toon "ok"') {
        const inElseBranch = sensorElseIndex !== -1 && index > sensorElseIndex;
        if (task.device !== "sensor" || !inElseBranch || !sensorConditionPass) {
          effects.display = "ok";
        }
        effects.log.push('Scherm toont "ok" wanneer de tak actief is.');
        return;
      }
      if (label === 'toon "Oké"') {
        effects.display = "Oké";
        effects.log.push('Scherm toont "Oké".');
        return;
      }
      if (label === 'toon "Koelen"') {
        effects.display = "Koelen";
        effects.log.push('Scherm toont "Koelen".');
        return;
      }
      if (label.startsWith('zeg "')) {
        effects.speech = label.slice(5, -1);
        effects.log.push(`Bizzy zegt: ${effects.speech}.`);
        return;
      }
      if (label === 'toon "koud"') {
        effects.display = "koud";
        effects.log.push('Scherm toont "koud".');
        return;
      }
      if (label === "verwijder temperatuur") {
        effects.log.push("Temperatuurwaarde is verwijderd.");
        return;
      }
      if (label === "zet temperatuur op 0") {
        effects.log.push("Temperatuur is op 0 gezet.");
        return;
      }

      effects.log.push(`Uitgevoerd: ${label}`);
    });

    return effects;
  };

  const stopStepper = () => {
    if (runTimer !== null) {
      window.clearTimeout(runTimer);
      setRunTimer(null);
    }
    setRunStep(-1);
  };

  const playProgram = () => {
    if (runStep >= 0) {
      stopStepper();
      return;
    }
    setExecuted(true);
    const effects = executeProgram();
    setRunEffects(effects);
    if (effects.speech) {
      setSpeechVisible(true);
      window.setTimeout(() => setSpeechVisible(false), 2000);
    }
    // Walk the program step-by-step for a visual highlight in the canvas.
    if (program.length === 0) return;
    const interval = 600;
    const advance = (index: number) => {
      if (index >= program.length) {
        setRunStep(-1);
        setRunTimer(null);
        return;
      }
      setRunStep(index);
      const id = window.setTimeout(() => advance(index + 1), interval);
      setRunTimer(id);
    };
    advance(0);
  };
  const resetProgramRun = () => {
    stopStepper();
    setExecuted(false);
    setSpeechVisible(false);
    setAPresses(0);
    setRunEffects(emptyProgramRunEffects);
  };
  const returnToEditor = () => {
    stopStepper();
    setSpeechVisible(false);
    setExecuted(false);
    setRunEffects(emptyProgramRunEffects);
  };
  const isRunning = runStep >= 0;
  const microbitShowsFull =
    executed &&
    aPresses >= 5 &&
    hasBlock("verander teller met 1") &&
    hasBlock("als teller >= 5 dan") &&
    hasBlock('toon "vol"');
  const microbitDisplay =
    runEffects.display || (microbitShowsFull ? "vol" : executed ? runEffects.teller : aPresses);
  const sensorDisplay =
    runEffects.display ||
    (executed &&
    hasBlock("als (temperatuur > 25) EN (raam = open) dan") &&
    hasBlock('toon "waarschuwing"') &&
    hasBlock('toon "ok"')
      ? temperature > 25 && windowOpen
        ? "waarschuwing"
        : "ok"
      : "");

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={task.intro}
      >
        <p className="helper-text">{item.instruction}</p>
        {task.codingSteps ? (
          <ol className="coding-steps">
            {task.codingSteps.map((stepText) => (
              <li key={stepText}>{stepText}</li>
            ))}
          </ol>
        ) : null}
      </QuestionHeader>

      <div className={`blocks-shell ${executed ? "is-executed" : ""}`}>
        {/* ── Palette ─────────────────────────────── */}
        <aside className="blocks-palette">
          {(() => {
            // Group shuffled palette by category, preserving the order in
            // which each category first appears.
            const grouped: { category: string; color: string; blocks: ProgrammingBlockDefinition[] }[] = [];
            const at = new Map<string, number>();
            paletteBlocks.forEach((b) => {
              if (!at.has(b.category)) {
                at.set(b.category, grouped.length);
                grouped.push({ category: b.category, color: b.color, blocks: [] });
              }
              grouped[at.get(b.category)!].blocks.push(b);
            });
            return grouped.map((cat) => (
              <div className="palette-cat" key={cat.category}>
                <div className="cat-title">
                  <span className="cat-dot" style={{ background: cat.color }} />
                  {cat.category}
                </div>
                <div className="palette-list">
                  {cat.blocks.map((b) => {
                    const shape = b.category === "gebeurtenissen"
                      ? "hat"
                      : b.isContainer ? "container" : "stack";
                    return (
                      <button
                        className="palette-block-btn"
                        key={b.label}
                        type="button"
                        onClick={() => addBlockToProgram(b)}
                        title="Klik om toe te voegen"
                      >
                        <span
                          className={`block block-${shape}`}
                          style={blockStyle(b)}
                        >
                          <span className="block-label">{b.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </aside>

        {/* ── Canvas ──────────────────────────────── */}
        <section className="blocks-canvas">
          <div className="canvas-toolbar">
            <div className="canvas-toolbar-left">
              <h3>Werkblad</h3>
              <span className="canvas-meta">{program.length} {program.length === 1 ? "blok" : "blokken"}</span>
            </div>
            <div className="canvas-toolbar-right">
              <button
                className="ghost-btn"
                type="button"
                onClick={() => { setProgram([]); resetProgramRun(); }}
                disabled={program.length === 0}
              >
                Leegmaken
              </button>
              <button
                className={`play-btn ${isRunning ? "is-running" : ""}`}
                type="button"
                onClick={playProgram}
              >
                {isRunning ? (
                  <>
                    <span className="play-glyph">■</span> Stop
                  </>
                ) : (
                  <>
                    <span className="play-glyph">▸</span> Afspelen
                  </>
                )}
              </button>
              <button
                className="run-back-arrow"
                type="button"
                onClick={returnToEditor}
                disabled={!executed}
                aria-label="Terug"
                title="Terug"
              />
            </div>
          </div>

          <div className={`blocks-canvas-area ${program.length === 0 ? "empty" : ""}`}>
            {program.length === 0 ? (
              <div className="canvas-empty">
                <div className="canvas-empty-icon">▾</div>
                <strong>Klik blokken aan om je programma te bouwen</strong>
              </div>
            ) : null}
            {program.map((block, index) => {
              const def = blockByLabel.get(block.label) ?? block;
              const shape = def.category === "gebeurtenissen"
                ? "hat"
                : def.isContainer ? "container" : "stack";
              return (
                <div
                  className={`canvas-row ${runStep === index ? "is-active" : ""}`}
                  key={`${block.label}-${index}`}
                  style={{ "--depth": block.indent } as CSSProperties}
                >
                  <span
                    className={`block block-${shape} ${runStep === index ? "is-active" : ""}`}
                    style={blockStyle(def)}
                  >
                    <span className="block-label">{block.label}</span>
                  </span>
                  <button
                    className="canvas-row-remove"
                    type="button"
                    aria-label="Verwijder blok"
                    onClick={() =>
                      setProgram((current) => current.filter((_, i) => i !== index))
                    }
                  >×</button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Device preview ──────────────────────── */}
        <aside className="blocks-preview">
          <div className="preview-head">
            <h3>{task.device === "microbit" ? "micro:bit" : task.device === "sensor" ? "Sensor" : "Bizzy"}</h3>
            <span className={`run-pill ${isRunning ? "is-running" : ""}`}>
              <span className="run-dot" />
              {isRunning ? `Stap ${Math.min(runStep + 1, program.length)}/${program.length}` : "Stand-by"}
            </span>
          </div>

          <div className={`bizzy-stage device-stage-${task.device ?? "bizzy"} ${isRunning ? "is-running" : ""}`}>
            {task.device === "microbit" ? (
              <div className="microbit-device">
                <div className="microbit-screen">{microbitDisplay}</div>
                <div className="microbit-buttons">
                  <button type="button" onClick={() => setAPresses((c) => c + 1)}>A</button>
                  <button type="button" onClick={() => setAPresses((c) => Math.max(0, c - 1))}>B</button>
                </div>
              </div>
            ) : task.device === "sensor" ? (
              <div className="sensor-device">
                <div className="sensor-readout">{sensorDisplay || "..."}</div>
                <label className="field">
                  <span>Temperatuur</span>
                  <input
                    max="35"
                    min="15"
                    type="range"
                    value={temperature}
                    onChange={(event) => setTemperature(Number(event.target.value))}
                  />
                </label>
                <button
                  className={`toggle-button ${windowOpen ? "active" : ""}`}
                  type="button"
                  onClick={() => setWindowOpen((current) => !current)}
                >
                  Raam {windowOpen ? "open" : "dicht"}
                </button>
              </div>
            ) : (
              <>
                <div className="bizzy-floor" />
                <div
                  className="bizzy-mover"
                  style={{
                    transform: `translateX(${runEffects.move * 18}px) rotate(${runEffects.rotation}deg)`,
                  }}
                >
                  {speechVisible ? <div className="bizzy-speech">{runEffects.speech}</div> : null}
                  <svg
                    className={`bizzy-svg ${isRunning ? "is-running" : ""}`}
                    viewBox="0 0 144 168"
                    width="120"
                    height="140"
                    aria-hidden="true"
                  >
                    <line x1="72" y1="18" x2="72" y2="6" stroke="#1B1D22" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="72" cy="6" r="6" fill="#E51C73" stroke="#1B1D22" strokeWidth="3" />
                    <rect x="14" y="16" width="116" height="98" rx="28" fill="#E51C73" stroke="#1B1D22" strokeWidth="4" />
                    <ellipse cx="42" cy="42" rx="14" ry="8" fill="#fff" opacity=".22" />
                    <circle cx="50" cy="58" r="14" fill="#fff" stroke="#1B1D22" strokeWidth="3" />
                    <circle cx="94" cy="58" r="14" fill="#fff" stroke="#1B1D22" strokeWidth="3" />
                    <circle className="bizzy-pupil" cx="50" cy="58" r="6" fill="#1B1D22" />
                    <circle className="bizzy-pupil" cx="94" cy="58" r="6" fill="#1B1D22" />
                    {speechVisible || isRunning ? (
                      <path d="M52 84 Q72 100 92 84" fill="none" stroke="#1B1D22" strokeWidth="5" strokeLinecap="round" />
                    ) : (
                      <rect x="60" y="84" width="24" height="5" rx="2.5" fill="#1B1D22" />
                    )}
                    <rect x="34" y="116" width="76" height="14" rx="6" fill="#1B1D22" />
                    <rect x="30" y="128" width="34" height="32" rx="14" fill="#1B1D22" />
                    <rect x="80" y="128" width="34" height="32" rx="14" fill="#1B1D22" />
                    <circle cx="47" cy="144" r="5" fill="#fff" opacity=".7" />
                    <circle cx="97" cy="144" r="5" fill="#fff" opacity=".7" />
                  </svg>
                </div>
              </>
            )}
          </div>

          {runEffects.log.length > 0 ? (
            <div className="execution-log">
              <strong>Uitvoering</strong>
              <ul>
                {runEffects.log.map((entry, index) => (
                  <li key={`${entry}-${index}`}>{entry}</li>
                ))}
              </ul>
              {runEffects.sound ? <span>Geluid: {runEffects.sound}</span> : null}
              {runEffects.score !== null ? <span>Score: {runEffects.score}</span> : null}
              {runEffects.speed !== null ? <span>Snelheid: {runEffects.speed}</span> : null}
              {runEffects.animationPaused ? <span>Animatie: niet animeren</span> : null}
            </div>
          ) : null}
        </aside>
      </div>

      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Volgende"
        onPrimary={() =>
          onSubmit({
            section,
            item,
            selectedAnswer: { program, executed, aPresses, temperature, windowOpen, runEffects },
            shownOptionOrder: paletteBlocks.map((block) => block.label),
          })
        }
        onSkip={onSkip}
      />
    </section>
  );
};

const ChoiceItemView = ({
  section,
  item,
  questionNumber,
  presentedOrder,
  onSubmit,
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  presentedOrder: string[];
  onSubmit: (payload: SubmitAnswerPayload) => void;
}) => {
  const options = item.options ?? [];
  const orderedOptions = (presentedOrder.length > 0 ? presentedOrder : options.map((option) => option.id))
    .map((optionId) => options.find((option) => option.id === optionId))
    .filter(Boolean) as typeof options;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const isMultiple = item.selectionMode === "multiple";
  const selectCount = item.selectCount ?? (Array.isArray(item.correctAnswer) ? item.correctAnswer.length : 1);
  const unknownOptionId = item.unknownOptionId;
  const selectedUnknown = Boolean(unknownOptionId && selectedIds.includes(unknownOptionId));
  const canSubmit = isMultiple
    ? selectedUnknown || (selectedIds.length > 0 && selectedIds.length <= selectCount)
    : selectedIds.length === 1;

  const toggleOption = (optionId: string) => {
    if (optionId === unknownOptionId) {
      setSelectedIds([optionId]);
      return;
    }

    if (!isMultiple) {
      setSelectedIds([optionId]);
      return;
    }

    setSelectedIds((current) => {
      const withoutUnknown = current.filter((id) => id !== unknownOptionId);
      if (withoutUnknown.includes(optionId)) {
        return withoutUnknown.filter((id) => id !== optionId);
      }
      if (withoutUnknown.length >= selectCount) {
        return withoutUnknown;
      }
      return [...withoutUnknown, optionId];
    });
  };

  const submit = () => {
    onSubmit({
      section,
      item,
      selectedAnswer: isMultiple ? selectedIds : selectedIds[0] ?? null,
      shownOptionOrder: orderedOptions.map((option) => option.id),
    });
  };

  return (
    <section className="panel stack-md">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      />

      {item.mockup ? <MockupCardView item={item} /> : null}
      {isMultiple ? (
        <p className="helper-text">Kies maximaal {selectCount} antwoorden.</p>
      ) : null}

      <div className={item.renderOptionsAsSourceCards ? "option-grid source-card-grid" : "option-grid"}>
        {orderedOptions.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const selected = selectedIds.includes(option.id);
          return (
            <button
              className={`option-card${item.renderOptionsAsSourceCards ? " source-option-card" : ""}${selected ? " selected" : ""}`}
              key={option.id}
              type="button"
              onClick={() => toggleOption(option.id)}
            >
              <span className="option-letter">{letter}</span>
              <span className="option-text">
                <strong>{option.label}</strong>
                {option.description ? <small>{option.description}</small> : null}
              </span>
              <span className="option-radio" aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <div className="q-mc-footer">
        <button
          className="primary-button q-next-btn"
          type="button"
          onClick={submit}
          disabled={!canSubmit}
        >
          Volgende vraag <span className="q-next-arrow" aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
};

const SpreadsheetPreview = ({ item }: { item: AssessmentItem }) => (
  <div className="micro-frame spreadsheet-frame">
    <div className="micro-toolbar">
      <span>Spreadsheet</span>
      <span>{item.type.includes("filter") ? "Filter" : item.type.includes("sort") ? "Sorteren" : "Resultaat"}</span>
    </div>
    <table>
      <thead>
        <tr>
          {item.table?.columns.map((column) => <th key={column}>{column}</th>)}
        </tr>
      </thead>
      <tbody>
        {item.table?.rows.map((row) => (
          <tr key={row.join("|")}>
            {row.map((cell, index) => <td key={`${cell}-${index}`}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SecurityMockup = ({ item }: { item: AssessmentItem }) => (
  <div className="micro-frame security-frame">
    <div className="micro-toolbar">
      <span>{item.mockup?.title}</span>
      <span>Controleer veilig</span>
    </div>
    <div className="security-message">
      {item.mockup?.content.map((line) => <p key={line}>{line}</p>)}
    </div>
  </div>
);

const CreationMockup = ({ item }: { item: AssessmentItem }) => {
  return (
    <div className="micro-frame creation-frame">
      <div className="micro-toolbar">
        <span>Opties</span>
        <span>Kies de passende optie</span>
      </div>
      <div className="creation-tiles">
        {(item.options ?? []).slice(0, 4).map((option) => (
          <span key={option.id}>{option.label}</span>
        ))}
      </div>
    </div>
  );
};

const ConditionBuilderMockup = ({ item }: { item: AssessmentItem }) => (
  <div className="micro-frame condition-frame">
    <div className="micro-toolbar">
      <span>Voorwaarde</span>
      <span>Operator kiezen</span>
    </div>
    <div className="condition-line">{item.instruction}</div>
  </div>
);

const BugFixMockup = ({ item }: { item: AssessmentItem }) => (
  <div className="micro-frame code-frame">
    <div className="micro-toolbar">
      <span>Code</span>
      <span>Controle</span>
    </div>
    <pre>
      {(item.codeBlocks ?? item.options?.map((option) => option.label) ?? []).join("\n")}
    </pre>
  </div>
);

const MockupCardView = ({ item }: { item: AssessmentItem }) => {
  if (!item.mockup) {
    return null;
  }

  const isAddressBar = item.mockup.mediaHint === "Niet-interactieve adresbalk";
  const isEmailLink = item.mockup.mediaHint === "Niet-interactieve linkweergave";
  const address = item.mockup.content[0];

  return (
    <div className={`mockup-frame mockup-${item.type}`}>
      <div className="mockup-topline">
        <strong>{item.mockup.title}</strong>
        {item.mockup.badge ? <span>{item.mockup.badge}</span> : null}
      </div>
      {item.mockup.subtitle && !isEmailLink ? (
        <p className="mockup-subtitle">{item.mockup.subtitle}</p>
      ) : null}
      {isAddressBar || isEmailLink ? (
        <div className={isEmailLink ? "stimulus-mail" : "stimulus-browser"}>
          {isEmailLink ? <p>{item.mockup.subtitle}</p> : null}
          <div className="stimulus-address-bar" aria-label="Webadres">
            <span className="stimulus-lock" aria-hidden="true" />
            <span>{address}</span>
          </div>
        </div>
      ) : (
        <div className="mockup-body">
          {item.mockup.content.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
      {item.mockup.mediaHint ? <div className="media-hint">{item.mockup.mediaHint}</div> : null}
      {item.mockup.footer ? <div className="mockup-footer">{item.mockup.footer}</div> : null}
    </div>
  );
};

/* ─── Folder + File SVG icons used inside the file-task workspace.
   Match the prototype's coloured folder + cream-folded paper file. */
const FolderIcon = () => (
  <svg className="folder-svg" viewBox="0 0 64 56" width="56" height="56">
    <path className="tab" d="M2 8 Q2 4 6 4 H22 L28 10 H58 Q62 10 62 14 V20 H2 Z" />
    <path className="body" d="M2 16 H62 V50 Q62 54 58 54 H6 Q2 54 2 50 Z" />
  </svg>
);
const FileIcon = ({ ext }: { ext: string }) => (
  <svg className="file-svg" viewBox="0 0 50 60" width="56" height="56">
    <path className="body" d="M6 2 H32 L46 16 V54 Q46 58 42 58 H10 Q6 58 6 54 Z" />
    <path className="fold" d="M32 2 L32 14 Q32 16 34 16 L46 16" />
    <text x="14" y="46">{ext}</text>
  </svg>
);

const FileTaskWorkspace = ({
  item,
  questionNumber,
  state,
  onChange,
  onFinish,
  onSkip,
}: {
  item: AssessmentItem;
  questionNumber: number;
  state: Pt1State;
  onChange: (nextState: Pt1State) => void;
  onFinish: () => void;
  onSkip: () => void;
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [contextFolderId, setContextFolderId] = useState<string>(
    item.fileTask?.simulation.rootId ?? "",
  );
  const [pendingConflict, setPendingConflict] = useState<{
    nodeId: string;
    targetParentId: string;
  } | null>(null);
  const [clipboard, setClipboard] = useState<ExplorerClipboard>(null);
  const [lastNodeClick, setLastNodeClick] = useState<{
    nodeId: string;
    timestamp: number;
  } | null>(null);
  const [isNewMenuOpen, setIsNewMenuOpen] = useState(false);
  const [renamingNodeId, setRenamingNodeId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [sortKey, setSortKey] = useState<ExplorerSortKey>("name");
  const [sharedNodeId, setSharedNodeId] = useState<string | null>(null);

  if (!item.fileTask || !state) {
    return null;
  }

  const selectedNode = selectedNodeId ? getNodeById(state.nodes, selectedNodeId) : null;
  const activeFolderId = contextFolderId;
  const clipboardNode = clipboard ? getNodeById(state.nodes, clipboard.nodeId) : null;
  const getFolderId = (name: string) =>
    state.nodes.find((node) => node.name === name && node.type === "folder")?.id ??
    activeFolderId;
  const getFolder = (name: string) =>
    state.nodes.find((node) => node.name === name && node.type === "folder") ?? null;

  const handleDrop = (nodeId: string, targetFolderId: string) => {
    const dragged = getNodeById(state.nodes, nodeId);
    if (!dragged) {
      return;
    }

    const hasConflict = getChildren(state.nodes, targetFolderId).some(
      (child) => child.name === dragged.name && child.id !== dragged.id,
    );

    if (hasConflict) {
      setPendingConflict({ nodeId, targetParentId: targetFolderId });
      return;
    }

    onChange(moveNode(state, nodeId, targetFolderId));
  };

  const resolveConflict = (choice: ConflictChoice) => {
    if (!pendingConflict) {
      return;
    }

    onChange(
      moveNode(
        state,
        pendingConflict.nodeId,
        pendingConflict.targetParentId,
        choice,
      ),
    );
    setPendingConflict(null);
  };

  const pasteClipboard = () => {
    if (!clipboard || !clipboardNode) {
      return;
    }

    if (clipboard.mode === "cut") {
      handleDrop(clipboard.nodeId, activeFolderId);
      setClipboard(null);
      return;
    }

    onChange(copyNode(state, clipboard.nodeId, activeFolderId));
  };

  const shareSelectedNode = () => {
    if (!selectedNodeId || !selectedNode) {
      return;
    }
    setSharedNodeId(selectedNodeId);
    onChange({
      ...state,
      actionLogs: [
        ...state.actionLogs,
        {
          actionType: "share",
          sourcePath: buildPath(state.nodes, selectedNodeId),
          timestamp: new Date().toISOString(),
        },
      ],
    });
  };

  const renameSelectedNode = () => {
    if (!selectedNodeId || !selectedNode) {
      return;
    }
    if (!selectedNode.parentId) {
      return;
    }
    setRenamingNodeId(selectedNodeId);
    setRenameDraft(selectedNode.name);
  };

  const commitInlineRename = () => {
    if (!renamingNodeId) {
      return;
    }

    const currentNode = getNodeById(state.nodes, renamingNodeId);
    const nextName = renameDraft.trim();
    setRenamingNodeId(null);
    if (!currentNode || !currentNode.parentId || !nextName || nextName === currentNode.name) {
      return;
    }
    onChange(renameNode(state, renamingNodeId, nextName));
  };

  const cancelInlineRename = () => {
    setRenamingNodeId(null);
    setRenameDraft("");
  };

  const handleNodeClick = (node: Pt1Node, clickCount: number) => {
    const now = Date.now();
    const isSecondSingleClick =
      selectedNodeId === node.id &&
      node.parentId !== null &&
      clickCount === 1 &&
      lastNodeClick?.nodeId === node.id &&
      now - lastNodeClick.timestamp > 450 &&
      now - lastNodeClick.timestamp < 3000;

    setSelectedNodeId(node.id);
    setLastNodeClick({ nodeId: node.id, timestamp: now });

    if (isSecondSingleClick) {
      setRenamingNodeId(node.id);
      setRenameDraft(node.name);
    }
  };

  const createNewItem = (itemType: ExplorerNewItemType) => {
    const definition = explorerNewItems.find((candidate) => candidate.type === itemType);
    if (!definition) {
      return;
    }

    const nodeId = crypto.randomUUID();
    const nextState =
      definition.nodeKind === "folder"
        ? createFolder(state, activeFolderId, definition.defaultName, nodeId)
        : createFile(state, activeFolderId, definition.defaultName, nodeId);
    onChange(nextState);
    setSelectedNodeId(nodeId);
    setRenamingNodeId(nodeId);
    setRenameDraft(definition.defaultName);
    setIsNewMenuOpen(false);
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId || !selectedNode?.parentId) {
      return;
    }
    onChange(deleteNode(state, selectedNodeId));
    setSelectedNodeId(null);
  };

  const getExplorerType = (node: Pt1Node) => {
    if (node.type === "folder") {
      return "Bestandsmap";
    }

    const extension = node.name.split(".").pop()?.toLowerCase();
    if (extension === "pptx") {
      return "Microsoft PowerPoint-presentatie";
    }
    if (extension === "docx") {
      return "Microsoft Word-document";
    }
    if (extension === "pdf") {
      return "PDF-bestand";
    }
    if (extension === "jpg" || extension === "png") {
      return "Afbeelding";
    }
    if (extension === "txt") {
      return "Tekstdocument";
    }
    return "Bestand";
  };

  const getExplorerDate = (node: Pt1Node) =>
    node.type === "folder" ? "26-5-2026 09:00" : "25-5-2026 09:03";

  const getExplorerSize = (node: Pt1Node) => {
    if (node.type === "folder") {
      return "";
    }
    const extension = node.name.split(".").pop()?.toLowerCase();
    if (extension === "pptx") return "1.842 kB";
    if (extension === "docx") return "1.365 kB";
    if (extension === "pdf") return "884 kB";
    if (extension === "jpg" || extension === "png") return "642 kB";
    if (extension === "csv") return "24 kB";
    return "18 kB";
  };

  const activeItems = [...getChildren(state.nodes, activeFolderId)].sort((left, right) => {
    if (sortKey === "type") {
      return getExplorerType(left).localeCompare(getExplorerType(right), "nl") || left.name.localeCompare(right.name, "nl");
    }
    if (sortKey === "size") {
      return getExplorerSize(left).localeCompare(getExplorerSize(right), "nl") || left.name.localeCompare(right.name, "nl");
    }
    if (sortKey === "modified") {
      return getExplorerDate(left).localeCompare(getExplorerDate(right), "nl") || left.name.localeCompare(right.name, "nl");
    }
    return left.name.localeCompare(right.name, "nl");
  });

  const rootId = item.fileTask.simulation.rootId;
  const rootFolders = state.nodes.filter(
    (node) => node.parentId === rootId && node.type === "folder",
  );
  const quickAccessNames = ["Bureaublad", "Downloads", "Documenten", "Afbeeldingen", "OneDrive"];
  const meetingFolders = rootFolders.filter(
    (node) => !quickAccessNames.includes(node.name),
  );
  const goToFolder = (folderId: string) => {
    setContextFolderId(folderId);
    setSelectedNodeId(null);
  };
  const currentPathLabel = (() => {
    const path = buildPath(state.nodes, activeFolderId);
    const parts = path.split("/").filter(Boolean);
    return parts.length === 0 ? "Thuis" : parts.join(" > ");
  })();
  const fileInstructionSteps = item.instruction
    .split(/\n|(?<=[.!?])\s+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/Taak afronden/g, "Volgende"));

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
      >
        <ol className="file-instruction-list">
          {fileInstructionSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </QuestionHeader>

      <div className="file-explorer">
        <div className="explorer-commandbar" aria-label="Verkenner acties">
          <div className="explorer-new-menu">
            <button
              type="button"
              className="explorer-command explorer-command-new"
              aria-expanded={isNewMenuOpen}
              onClick={() => setIsNewMenuOpen((current) => !current)}
            >
              <span className="command-icon command-icon-new" aria-hidden="true" />
              <span>Nieuw</span>
              <span className="command-chevron" aria-hidden="true" />
            </button>
            {isNewMenuOpen ? (
              <div className="explorer-new-dropdown">
                {explorerNewItems.map((definition) => (
                  <button
                    key={definition.type}
                    type="button"
                    onClick={() => createNewItem(definition.type)}
                  >
                    <span className={`new-item-icon ${definition.iconClass}`} aria-hidden="true" />
                    <span>{definition.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button className="explorer-command icon-only-command" type="button" title="Knippen" aria-label="Knippen" disabled={!selectedNode} onClick={() => selectedNodeId && setClipboard({ mode: "cut", nodeId: selectedNodeId })}>
            <span className="command-icon command-icon-cut" aria-hidden="true" />
            <span className="command-label">Knippen</span>
          </button>
          <button className="explorer-command icon-only-command" type="button" title="Kopieren" aria-label="Kopieren" disabled={!selectedNode} onClick={() => selectedNodeId && setClipboard({ mode: "copy", nodeId: selectedNodeId })}>
            <span className="command-icon command-icon-copy" aria-hidden="true" />
            <span className="command-label">Kopieren</span>
          </button>
          <button className="explorer-command icon-only-command" type="button" title="Plakken" aria-label="Plakken" disabled={!clipboardNode} onClick={pasteClipboard}>
            <span className="command-icon command-icon-paste" aria-hidden="true" />
            <span className="command-label">Plakken</span>
          </button>
          <button className="explorer-command icon-only-command" type="button" title="Naam wijzigen" aria-label="Naam wijzigen" disabled={!selectedNode} onClick={renameSelectedNode}>
            <span className="command-icon command-icon-rename" aria-hidden="true" />
            <span className="command-label">Naam wijzigen</span>
          </button>
          <button className="explorer-command icon-only-command" type="button" title="Delen" aria-label="Delen" disabled={!selectedNode} onClick={shareSelectedNode}>
            <span className="command-icon command-icon-share" aria-hidden="true" />
            <span className="command-label">Delen</span>
          </button>
          <button className="explorer-command icon-only-command" type="button" title="Verwijderen" aria-label="Verwijderen" disabled={!selectedNode} onClick={deleteSelectedNode}>
            <span className="command-icon command-icon-delete" aria-hidden="true" />
            <span className="command-label">Verwijderen</span>
          </button>
          <button
            className="explorer-command icon-only-command"
            type="button"
            title="Sorteren"
            aria-label="Sorteren"
            onClick={() => setSortKey((current) => current === "name" ? "modified" : current === "modified" ? "type" : current === "type" ? "size" : "name")}
          >
            <span className="command-icon command-icon-sort" aria-hidden="true" />
            <span className="command-label">Sorteren</span>
            <span className="command-chevron" aria-hidden="true" />
          </button>
          <button className="explorer-command icon-only-command" type="button" title="Ongedaan maken" aria-label="Ongedaan maken" disabled={state.undoStack.length === 0} onClick={() => onChange(undoPt1(state))}>
            <span className="command-icon command-icon-undo" aria-hidden="true" />
            <span className="command-label">Ongedaan maken</span>
          </button>
        </div>
        <div className="file-explorer-toolbar">
          <div className="file-breadcrumb">{currentPathLabel}</div>
          <div className="file-toolbar-actions">
            <button
              type="button"
              className="file-toolbar-btn"
              onClick={() => createNewItem("folder")}
            >
              <span className="ico" aria-hidden="true">+</span>
              <span>Nieuwe map</span>
            </button>
            <button
              type="button"
              className="file-toolbar-btn"
              onClick={() => onChange(undoPt1(state))}
              disabled={state.undoStack.length === 0}
            >
              <span className="ico" aria-hidden="true">↻</span>
              <span>Ongedaan</span>
            </button>
          </div>
        </div>

        <div className="file-explorer-body">
          <aside className="file-sidebar" aria-label="Mappenlijst">
            <div className="file-sidebar-group">
              <button
                type="button"
                className={`file-sidebar-item ${activeFolderId === rootId ? "active" : ""}`}
                onClick={() => goToFolder(rootId)}
              >
                <span className="ico ico-home" aria-hidden="true" />
                <span className="lbl">Thuis</span>
              </button>
              <button
                type="button"
                className={`file-sidebar-item ${activeFolderId === getFolderId("Bureaublad") ? "active" : ""}`}
                onClick={() => goToFolder(getFolderId("Bureaublad"))}
              >
                <span className="ico ico-desktop" aria-hidden="true" />
                <span className="lbl">Bureaublad</span>
              </button>
              {getFolder("Downloads") ? (
                <button
                  type="button"
                  className={`file-sidebar-item ${activeFolderId === getFolderId("Downloads") ? "active" : ""}`}
                  onClick={() => goToFolder(getFolderId("Downloads"))}
                >
                  <span className="ico ico-downloads" aria-hidden="true" />
                  <span className="lbl">Downloads</span>
                </button>
              ) : null}
              {getFolder("Documenten") ? (
                <button
                  type="button"
                  className={`file-sidebar-item ${activeFolderId === getFolderId("Documenten") ? "active" : ""}`}
                  onClick={() => goToFolder(getFolderId("Documenten"))}
                >
                  <span className="ico ico-documents" aria-hidden="true" />
                  <span className="lbl">Documenten</span>
                </button>
              ) : null}
              {getFolder("Afbeeldingen") ? (
                <button
                  type="button"
                  className={`file-sidebar-item ${activeFolderId === getFolderId("Afbeeldingen") ? "active" : ""}`}
                  onClick={() => goToFolder(getFolderId("Afbeeldingen"))}
                >
                  <span className="ico ico-pictures" aria-hidden="true" />
                  <span className="lbl">Afbeeldingen</span>
                </button>
              ) : null}
            </div>

            {getFolder("OneDrive") ? (
              <div className="file-sidebar-group">
                <button
                  type="button"
                  className={`file-sidebar-item ${activeFolderId === getFolderId("OneDrive") ? "active" : ""}`}
                  onClick={() => goToFolder(getFolderId("OneDrive"))}
                >
                  <span className="ico ico-onedrive" aria-hidden="true" />
                  <span className="lbl">OneDrive - voCampus</span>
                </button>
              </div>
            ) : null}

            {meetingFolders.length > 0 ? (
              <div className="file-sidebar-group">
                <div className="file-sidebar-label">Deze meting</div>
                {meetingFolders.map((folder) => (
                  <button
                    key={folder.id}
                    type="button"
                    className={`file-sidebar-item ${activeFolderId === folder.id ? "active" : ""}`}
                    onClick={() => goToFolder(folder.id)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      const draggedId = event.dataTransfer.getData("text/plain");
                      handleDrop(draggedId, folder.id);
                    }}
                  >
                    <span className="ico ico-folder" aria-hidden="true" />
                    <span className="lbl">{folder.name}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </aside>

          <div className="file-main">
              <div className="explorer-address">
                <span>{currentPathLabel}</span>
                <span>Sorteren: {sortKey === "name" ? "Naam" : sortKey === "modified" ? "Gewijzigd op" : sortKey === "type" ? "Type" : "Grootte"}</span>
              </div>
              <div
                className={`file-grid ${activeItems.length === 0 ? "is-empty" : ""}`}
                role="list"
                aria-label="Gesimuleerde Windows Verkenner"
              >
                <div className="file-list-header" aria-hidden="true">
                  <span>Naam</span>
                  <span>Gewijzigd op</span>
                  <span>Type</span>
                  <span>Grootte</span>
                </div>
                {activeItems.length === 0 ? (
                  <div className="file-grid-empty">
                    Deze map is leeg — sleep er bestanden in.
                  </div>
                ) : (
                  activeItems.map((node) => {
                    const isFolder = node.type === "folder";
                    const ext = isFolder
                      ? ""
                      : (node.name.split(".").pop() ?? "FILE").toUpperCase();
                    const isDropTarget = isFolder && contextFolderId === node.id;
                    return (
                      <button
                        key={node.id}
                        type="button"
                        role="listitem"
                        className={`file-tile ${selectedNodeId === node.id ? "selected" : ""} ${
                          isDropTarget ? "drop-target" : ""
                        }`}
                        title={`${node.name} — ${getExplorerType(node)}`}
                        onClick={(event) => handleNodeClick(node, event.detail)}
                        onDoubleClick={() => {
                          if (isFolder) {
                            setContextFolderId(node.id);
                            setSelectedNodeId(null);
                          }
                        }}
                        draggable={node.parentId !== null}
                        onDragStart={(event) => {
                          event.dataTransfer.setData("text/plain", node.id);
                        }}
                        onDragOver={(event) => {
                          if (isFolder) {
                            event.preventDefault();
                          }
                        }}
                        onDrop={(event) => {
                          if (!isFolder) {
                            return;
                          }
                          event.preventDefault();
                          const draggedId = event.dataTransfer.getData("text/plain");
                          handleDrop(draggedId, node.id);
                        }}
                      >
                        <div className="icon">
                          {isFolder ? <FolderIcon /> : <FileIcon ext={ext.slice(0, 4)} />}
                        </div>
                        {renamingNodeId === node.id ? (
                          <input
                            className="file-rename-input"
                            value={renameDraft}
                            autoFocus
                            onFocus={(event) => event.currentTarget.select()}
                            onClick={(event) => event.stopPropagation()}
                            onDoubleClick={(event) => event.stopPropagation()}
                            onChange={(event) => setRenameDraft(event.target.value)}
                            onBlur={commitInlineRename}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault();
                                commitInlineRename();
                              }
                              if (event.key === "Escape") {
                                event.preventDefault();
                                cancelInlineRename();
                              }
                            }}
                          />
                        ) : (
                          <div className="label">{node.name}</div>
                        )}
                        <span className="file-modified">{getExplorerDate(node)}</span>
                        <span className="file-type">{getExplorerType(node)}</span>
                        <span className="file-size">{getExplorerSize(node)}</span>
                      </button>
                    );
                  })
                )}
              </div>
              {clipboard && clipboardNode ? (
                <div className="explorer-hint">
                  {`${clipboard.mode === "cut" ? "Geknipt" : "Gekopieerd"}: ${clipboardNode.name}. Kies een map en klik op Plakken.`}
                </div>
              ) : null}
              {sharedNodeId && getNodeById(state.nodes, sharedNodeId) ? (
                <div className="explorer-hint">
                  Delen voorbereid voor {getNodeById(state.nodes, sharedNodeId)?.name}.
                </div>
              ) : null}
          </div>
        </div>
      </div>

      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Volgende"
        onPrimary={onFinish}
        onSkip={onSkip}
      />

      {pendingConflict ? (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Naamconflict</h3>
            <p>In deze map bestaat al een bestand of map met dezelfde naam.</p>
            <div className="option-grid compact-grid">
              <button
                className="option-card compact"
                type="button"
                onClick={() => resolveConflict("overwrite")}
              >
                Overschrijven
              </button>
              <button
                className="option-card compact"
                type="button"
                onClick={() => resolveConflict("rename")}
              >
                Hernoemen en toevoegen
              </button>
              <button
                className="option-card compact"
                type="button"
                onClick={() => resolveConflict("cancel")}
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

const FileTree = ({
  nodes,
  parentId,
  selectedNodeId,
  contextFolderId,
  onSelectNode,
  onContextFolder,
  onDropNode,
}: {
  nodes: Pt1Node[];
  parentId: string;
  selectedNodeId: string | null;
  contextFolderId: string;
  onSelectNode: (nodeId: string) => void;
  onContextFolder: (nodeId: string) => void;
  onDropNode: (nodeId: string, targetFolderId: string) => void;
}) => {
  const items = getChildren(nodes, parentId);

  return (
    <ul className="tree-list">
      {items.map((node) => (
        <li key={node.id}>
          <button
            className={`tree-node ${selectedNodeId === node.id ? "selected" : ""} ${
              contextFolderId === node.id ? "active-target" : ""
            }`}
            type="button"
            onClick={() => {
              onSelectNode(node.id);
              if (node.type === "folder") {
                onContextFolder(node.id);
              }
            }}
            onContextMenu={(event) => {
              event.preventDefault();
              onSelectNode(node.id);
              onContextFolder(node.type === "folder" ? node.id : node.parentId ?? parentId);
            }}
            draggable={node.parentId !== null}
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", node.id);
            }}
            onDragOver={(event) => {
              if (node.type === "folder") {
                event.preventDefault();
              }
            }}
            onDrop={(event) => {
              if (node.type !== "folder") {
                return;
              }
              event.preventDefault();
              const draggedId = event.dataTransfer.getData("text/plain");
              onDropNode(draggedId, node.id);
            }}
          >
            <span className="tree-icon">{node.type === "folder" ? "[map]" : "[bestand]"}</span>
            <span>{node.name}</span>
          </button>
          {node.type === "folder" ? (
            <FileTree
              nodes={nodes}
              parentId={node.id}
              selectedNodeId={selectedNodeId}
              contextFolderId={contextFolderId}
              onSelectNode={onSelectNode}
              onContextFolder={onContextFolder}
              onDropNode={onDropNode}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
};

const scorePercentage = (score: number, maxScore: number) =>
  maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);

const scoreTone = (percentage: number) => {
  if (percentage >= 75) {
    return "good";
  }
  if (percentage >= 50) {
    return "okay";
  }
  return "low";
};

const studentBlockTitle = (title: string) =>
  title.replace(/^PT\d+\s*-\s*/, "").replace("Meerkeuze", "Meerkeuzevragen");

const LegacyResultScreen = ({
  assessment,
  session,
  onClose,
}: {
  assessment: AssessmentVersion;
  session: AssessmentSession;
  onClose: () => void;
}) => {
  const result = calculateResult(session, assessment);
  const displayCode = session.metadata.learnerCode || session.metadata.anonymousCode;
  const exportBaseName = `nulmeting-${session.versionId}-${displayCode}`;
  const selfAssessmentResult = session.results.find(
    (entry) => entry.itemId === "self-assessment",
  );
  const selfAssessmentScore =
    typeof selfAssessmentResult?.selectedAnswer === "number"
      ? selfAssessmentResult.selectedAnswer
      : null;
  const selfAssessmentDifference =
    selfAssessmentScore === null
      ? null
      : (selfAssessmentScore / 100) * result.maxScore - result.totalScore;
  const exportPdf = () => {
    const lines = [
      "Resultaten nulmeting Digitale Geletterdheid",
      "",
      `Leerlingcode: ${displayCode}`,
      `Versie: ${assessment.title}`,
      `Afgerond op: ${session.completedAt ?? ""}`,
      `Totaalscore: ${result.totalScore} van ${result.maxScore} punten (${result.percentage}%)`,
      selfAssessmentScore === null ? "" : `Zelfinschatting: ${selfAssessmentScore} van 100`,
      selfAssessmentDifference === null
        ? ""
        : `Verschil tussen zelfinschatting en score: ${selfAssessmentDifference.toFixed(1)} punten`,
      "",
      "Score per onderdeel",
      ...result.blockScores.map(
        (block) =>
          `${studentBlockTitle(block.title)}: ${block.score} / ${block.maxScore} (${scorePercentage(block.score, block.maxScore)}%)`,
      ),
    ];

    downloadFile(
      `${exportBaseName}.pdf`,
      createPdfDocument(lines),
      "application/pdf",
    );
  };

  return (
    <>
      <section
        className="rd-result-hero"
        style={{ "--pct": result.percentage } as CSSProperties}
      >
        <div className="rd-score-meter">
          <div className="inner">
            <div className="pct">
              {result.percentage}%
              <small>jouw score</small>
            </div>
          </div>
        </div>
        <div className="rd-result-copy">
          <span className="eyebrow" style={{ marginBottom: 4 }}>
            Afgerond
          </span>
          <h2>Jouw nulmeting is klaar.</h2>
          <p className="intro">
            Je scoorde <strong>{result.totalScore} van de {result.maxScore} punten</strong>.
            De zelfinschatting telt niet mee in het eindresultaat. Dit is geen cijfer.
          </p>
          <p className="meta">Sessie: {displayCode}</p>
          {selfAssessmentScore !== null && selfAssessmentDifference !== null ? (
            <p className="meta">
              Zelfinschatting: {selfAssessmentScore}/100. Verschil met je score:
              {" "}{selfAssessmentDifference.toFixed(1)} punten.
            </p>
          ) : null}
        </div>
      </section>

      <h3
        style={{
          marginTop: 48,
          marginBottom: 16,
          fontFamily: "var(--font-display)",
          fontWeight: 900,
          fontSize: "1.25rem",
          letterSpacing: "-0.02em",
        }}
      >
        Score per onderdeel
      </h3>
      <div className="rd-result-grid">
        {result.blockScores.map((block) => {
          const percentage = scorePercentage(block.score, block.maxScore);
          const tone = `${percentage}%`;
          return (
            <div className="rd-block-card" key={block.blockId}>
              <div className="head">
                <h4>{studentBlockTitle(block.title)}</h4>
                <span className="score">
                  {block.score}/{block.maxScore}
                </span>
              </div>
              <div className="bar" aria-label={`${percentage}%`}>
                <span style={{ width: `${percentage}%` }} />
              </div>
              <div className="pct-line">
                <span>{percentage}%</span>
                <span>{tone}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rd-result-actions">
        <button className="btn btn-ghost" type="button" onClick={onClose}>
          ← Nieuwe leerling
        </button>
        <button className="btn btn-primary" type="button" onClick={exportPdf}>
          <span>Download PDF</span>
          <span className="arrow-circle">↓</span>
        </button>
      </div>
    </>
  );
};

const comparisonText = (scorePercent: number, selfPercent: number | null) => {
  if (selfPercent === null) {
    return "Je inschatting vooraf is niet opgeslagen.";
  }
  if (Math.abs(scorePercent - selfPercent) < 10) {
    return "Je inschatting en je score liggen dicht bij elkaar.";
  }
  if (selfPercent > scorePercent + 10) {
    return "Je schatte jezelf hoger in dan je score op deze nulmeting.";
  }
  return "Je score op deze nulmeting was hoger dan je eigen inschatting.";
};

const totalScoreExplanation =
  "Je score is het percentage punten dat je op deze nulmeting hebt behaald. Dit is geen cijfer en geen volledig oordeel over wat jij digitaal kunt.";
const resultDisclaimer =
  "Dit is geen cijfer. Deze nulmeting geeft een eerste beeld van onderdelen van digitale geletterdheid.";

const subgoalWarning =
  "Dit onderdeel is gebaseerd op een beperkt aantal vragen of taken. Zie dit als een eerste aanwijzing, niet als een volledig oordeel over wat je kunt.";

const coreGoalText = (goal: GoalScore) => {
  if (goal.goalId === "21") {
    return `Bij kerndoel 21 behaalde je ${goal.score} van ${goal.maxScore} punten. Dit geeft een eerste beeld van hoe je digitale technologie en digitale media inzet.`;
  }
  if (goal.goalId === "22") {
    return `Bij kerndoel 22 behaalde je ${goal.score} van ${goal.maxScore} punten. Dit onderdeel bestaat vooral uit taken waarin je iets maakt of programmeert.`;
  }
  if (goal.goalId === "23") {
    return `Bij kerndoel 23 behaalde je ${goal.score} van ${goal.maxScore} punten. Dit geeft een eerste beeld van hoe je veilig, bewust en verantwoordelijk handelt in digitale situaties.`;
  }
  return `${goal.goalId}: ${goal.score} van ${goal.maxScore} punten.`;
};

const ResultScreen = ({
  assessment,
  session,
  onClose,
}: {
  assessment: AssessmentVersion;
  session: AssessmentSession;
  onClose: () => void;
}) => {
  const [closingConfirmed, setClosingConfirmed] = useState(false);
  const result = calculateResult(session, assessment);
  const selfAssessmentResult = session.results.find(
    (entry) => entry.itemId === "self-assessment",
  );
  const selfAssessmentScore =
    typeof session.metadata.selfAssessmentScore === "number"
      ? session.metadata.selfAssessmentScore
      : typeof selfAssessmentResult?.selectedAnswer === "number"
        ? selfAssessmentResult.selectedAnswer
        : null;
  const comparison = comparisonText(result.percentage, selfAssessmentScore);
  const completedDate = session.completedAt ? new Date(session.completedAt) : new Date();
  const dateLabel = completedDate.toLocaleDateString("nl-NL");
  const classLabel = session.metadata.classId ?? session.metadata.classCode ?? "niet beschikbaar";
  const attemptLabel = session.metadata.anonymousAttemptId?.slice(0, 8) ?? session.id.slice(0, 8);
  const exportBaseName = `nulmeting-${session.versionId}-${attemptLabel}`;
  const coreGoalScores = result.goalScores.filter((goal) =>
    ["21", "22", "23"].includes(goal.goalId),
  );
  const subgoalScores = result.goalScores.filter((goal) => goal.level === "subgoal");

  const exportPdf = () => {
    const lines = [
      "Scoreoverzicht nulmeting Digitale Geletterdheid",
      "",
      `Nulmeting: ${assessment.title}`,
      `Datum: ${dateLabel}`,
      `Klas of klascode: ${classLabel}`,
      selfAssessmentScore === null
        ? "Zelfinschatting: niet opgeslagen"
        : `Zelfinschatting: ${selfAssessmentScore}%`,
      `Score op de nulmeting: ${result.percentage}%`,
      totalScoreExplanation,
      `Vergelijking: ${comparison}`,
      resultDisclaimer,
      "",
      "Score per kerndoel",
      ...coreGoalScores.map((goal) => coreGoalText(goal)),
      "",
      "Detail per subdoel",
      subgoalWarning,
      ...subgoalScores.map(
        (goal) =>
          `${goal.goalId} - ${goal.label}: ${goal.score}/${goal.maxScore} punten (${goal.percentage}%)`,
      ),
    ];

    downloadFile(
      `${exportBaseName}.pdf`,
      createPdfDocument(lines),
      "application/pdf",
    );
  };

  return (
    <>
      <section
        className="rd-result-hero result-summary-plain"
        style={{ "--pct": result.percentage } as CSSProperties}
      >
        <div className="rd-score-meter">
          <span className="schitter-ster" aria-hidden="true" />
          <div className="inner">
            <div className="pct">
              {result.percentage}%
              <small>nulmeting</small>
            </div>
          </div>
        </div>
        <div className="rd-result-copy">
          <span className="eyebrow" style={{ marginBottom: 4 }}>
            Resultaat
          </span>
          <h2>Jouw nulmeting is klaar.</h2>
          <p className="intro">
            {selfAssessmentScore === null
              ? "Jouw inschatting vooraf: niet opgeslagen"
              : `Jouw inschatting vooraf: ${selfAssessmentScore}%`}
          </p>
          <p className="intro">Jouw score op de nulmeting: {result.percentage}%</p>
          <p className="meta">{comparison}</p>
          <p className="meta">{totalScoreExplanation}</p>
          <p className="meta">{resultDisclaimer}</p>
          <p className="meta">Klas: {classLabel}</p>
        </div>
      </section>

      <section className="result-section">
        <h3>Score per kerndoel</h3>
        <div className="goal-score-list">
          {coreGoalScores.map((goal) => (
            <div className={`goal-score-row ${goal.level}`} key={goal.goalId}>
              <div>
                <strong>Kerndoel {goal.goalId}</strong>
                <span>{coreGoalText(goal)}</span>
              </div>
              <div className="goal-score-value">
                <span>{goal.percentage}%</span>
                <small>
                  {goal.score}/{goal.maxScore}
                </small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {subgoalScores.length > 0 ? (
        <section className="result-section">
          <h3>Detail per subdoel</h3>
          <p className="subgoal-warning">{subgoalWarning}</p>
          <div className="goal-score-list">
            {subgoalScores.map((goal) => (
              <div className="goal-score-row subgoal" key={goal.goalId}>
                <div>
                  <strong>{goal.goalId}</strong>
                  <span>{goal.label}</span>
                </div>
                <div className="goal-score-value">
                  <span>{goal.percentage}%</span>
                  <small>
                    {goal.score}/{goal.maxScore}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="result-section">
        <h3>Scoreoverzicht opslaan</h3>
        <p>
          Download je scoreoverzicht en sla het op. Als je op volgende klikt,
          sluit je de zelfscan af. Je kunt dan niet meer bij je scores en je
          ontvangt dit scoreoverzicht ook niet via e-mail.
        </p>
        <div className="rd-result-actions">
          <button className="btn btn-primary" type="button" onClick={exportPdf}>
            <span>Download scoreoverzicht als PDF</span>
            <span className="arrow-circle">↓</span>
          </button>
        </div>
        <label className="check-row result-close-check">
          <input
            type="checkbox"
            checked={closingConfirmed}
            onChange={(event) => setClosingConfirmed(event.target.checked)}
          />
          <span>Ik heb mijn scoreoverzicht opgeslagen en ik sluit nu de zelfscan af.</span>
        </label>
        <div className="rd-result-actions">
          <button
            className="btn btn-ghost"
            type="button"
            onClick={onClose}
            disabled={!closingConfirmed}
          >
            Volgende
          </button>
        </div>
      </section>
    </>
  );
};

export default App;
