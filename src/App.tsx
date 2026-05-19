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
  getPresentedOrder,
  getSectionById,
  getStepDescriptors,
  submitItemAnswer,
} from "./lib/assessment";
import {
  buildPath,
  copyNode,
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

type SubmitAnswerPayload = {
  section: AssessmentSection;
  item: AssessmentItem;
  selectedAnswer: SelectedAnswer;
  shownOptionOrder: string[];
};

type ApiStudent = {
  studentNumber: string;
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

const interactionOrderKey = (screenId: string, groupId: string, kind: "cards" | "options") =>
  `${screenId}:${groupId}:${kind}`;

const createInteractionOrders = (
  task: AssessmentItem["securityTask"] | AssessmentItem["socialTask"],
) => {
  const orders: Record<string, string[]> = {};
  task?.screens.forEach((screen) => {
    screen.groups.forEach((group) => {
      if (group.cards) {
        orders[interactionOrderKey(screen.id, group.id, "cards")] = shuffleItems(
          group.cards.map((card) => card.id),
        );
      }
      if (group.options) {
        orders[interactionOrderKey(screen.id, group.id, "options")] = shuffleItems(
          group.options.map((option) => option.id),
        );
      }
    });
  });
  return orders;
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

const getEntryTheme = (_view: EntryView) => defaultTheme;

const getThemeForSession = (session: AssessmentSession | null, entryView: EntryView) =>
  session ? themes[assessmentMap[session.versionId].themeKey] : getEntryTheme(entryView);

const App = () => {
  const [entryView, setEntryView] = useState<EntryView>("intro");
  const [session, setSession] = useState<AssessmentSession | null>(() =>
    readActiveSession(),
  );
  const [learnerCode, setLearnerCode] = useState("");
  const [learnerClassCode, setLearnerClassCode] = useState("");
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

    if (!session?.metadata.classCode) {
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
    const accessCode = learnerCode.trim();
    const classCode = learnerClassCode.trim().toLowerCase();
    if (!/^\d{4}$/.test(accessCode) || !classCode) {
      setLearnerCodeError("Vul je viercijferige leerlingnummer en klas in.");
      return;
    }

    setIsStarting(true);
    try {
      const data = await requestJson<StudentLoginResponse>("/api/student-login", {
        method: "POST",
        body: JSON.stringify({ code: accessCode, classCode }),
      });
      const student = data.student;
      const assessment = assessmentMap[student.versionId];
      if (data.session) {
        setSession({
          ...data.session,
          metadata: {
            ...data.session.metadata,
            learnerCode: accessCode,
            accessCode,
            classCode,
            anonymousCode: data.session.metadata?.anonymousCode ?? `${classCode}-${accessCode}`,
          },
        });
      } else {
        const metadata: SessionMetadata = {
          learnerCode: accessCode,
          accessCode,
          classCode,
          anonymousCode: `${classCode}-${accessCode}`,
        };
        setSession(createSession(assessment, accessCode, metadata));
      }
      setLearnerCodeError("");
    } catch {
      setLearnerCodeError("Deze leerling is niet gevonden. Controleer je nummer en klas.");
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

  const resetSession = () => {
    setSession(null);
    setEntryView("intro");
    setLearnerCode("");
    setLearnerClassCode("");
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

  const studentCode = session?.metadata.learnerCode || session?.metadata.accessCode;
  const studentClassCode = session?.metadata.classCode;

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
      studentCode={studentCode}
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
          learnerCode={learnerCode}
          classCode={learnerClassCode}
          error={learnerCodeError}
          isStarting={isStarting}
          onLearnerCodeChange={(value) => {
            setLearnerCode(value);
            setLearnerCodeError("");
          }}
          onClassCodeChange={(value) => {
            setLearnerClassCode(value);
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
  /** Optional student leerlingnummer to display in the topbar chip. */
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
      <span className="brand" aria-hidden="true" />
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
      {studentCode ? (
        <span className="chip">
          Leerling <strong style={{ fontWeight: 900, marginLeft: 4 }}>{studentCode}</strong>
        </span>
      ) : null}
      {classCode ? <span className="chip">Klas {classCode}</span> : null}
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
  </div>
);

const StudentStartScreen = ({
  learnerCode,
  classCode,
  error,
  isStarting,
  onLearnerCodeChange,
  onClassCodeChange,
  onStart,
  onOpenAdmin,
}: {
  learnerCode: string;
  classCode: string;
  error: string;
  isStarting: boolean;
  onLearnerCodeChange: (value: string) => void;
  onClassCodeChange: (value: string) => void;
  onStart: () => void;
  onOpenAdmin: () => void;
}) => (
  <section className="hero">
    <div className="hero-copy">
      <span className="eyebrow">Welkom bij Citadel College</span>
      <h1>
        Fijn dat je<br />er bent!
      </h1>
      <p className="intro">
        In deze nulmeting laat je zien wat je al kunt op het gebied van digitale
        geletterdheid. Het is geen toets — het helpt ons om jou beter te begeleiden.
        Werk zelfstandig en beantwoord de vragen eerlijk.
      </p>
      <div className="meta-row">
        <span className="pill">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          ± 30 minuten
        </span>
        <span className="pill">Eerlijk antwoord telt</span>
      </div>

      <div className="field-row">
        <label className="field-block">
          <span className="field-label">Leerlingnummer</span>
          <input
            className="field-input"
            value={learnerCode}
            placeholder="Bijv. 1234"
            onChange={(event) => onLearnerCodeChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onStart();
              }
            }}
          />
        </label>
        <label className="field-block">
          <span className="field-label">Klas</span>
          <input
            className="field-input"
            value={classCode}
            placeholder="Bijv. vmbo1a"
            onChange={(event) => onClassCodeChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                onStart();
              }
            }}
          />
        </label>
      </div>

      {error ? <div className="error-banner-inline">{error}</div> : null}

      <div className="hero-actions">
        <button
          className="btn btn-primary"
          type="button"
          onClick={onStart}
          disabled={isStarting}
        >
          <span>{isStarting ? "Controleren…" : "Start de meting"}</span>
          <span className="arrow-circle">→</span>
        </button>
        <button className="btn btn-ghost" type="button" onClick={onOpenAdmin}>
          Beheeromgeving
        </button>
      </div>
    </div>
    <div className="hero-photo">
      <span className="ster" aria-hidden="true" />
      <span className="placeholder-text">Foto: leerling in de klas</span>
    </div>
  </section>
);

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
        Met de beheercode open je de docentomgeving om leerlingnummers te
        importeren en resultaten te bekijken.
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
  const [importText, setImportText] = useState("");
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

  const parseImportRows = () =>
    importText
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [first = "", second = ""] = line.split(/[,\t; ]+/).map((part) => part.trim());
        const accessCode = /^\d{4}$/.test(first) ? first : second;
        const classCode = /^\d{4}$/.test(first) ? second : first;
        return { accessCode, classCode };
      });

  const importStudents = async () => {
    const rows = parseImportRows();
    if (rows.length === 0) {
      setError("Plak eerst leerlingregels, bijvoorbeeld: vmbo1a 1234.");
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
      setMessage(`${data.importedCount ?? rows.length} leerlingen geimporteerd.`);
      setError("");
      setImportText("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Importeren is niet gelukt.");
    } finally {
      setIsLoading(false);
    }
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
          classCode: student.classCode,
        }),
      });
      setStudents(data.students);
      setMessage(`${student.classCode} ${student.accessCode} is opnieuw opengezet.`);
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

  const [paletteFilter, setPaletteFilter] = useState<"all" | "p2" | "p3" | "p4" | "p5">("all");
  const filteredStudents =
    paletteFilter === "all"
      ? students
      : students.filter((s) => versionToPalette[s.versionId] === paletteFilter);

  const completedCount = students.filter((s) => s.status === "completed").length;
  const busyCount = students.filter((s) => s.status === "in_progress").length;
  const notStartedCount = students.filter((s) => !s.status || s.status === "not_started").length;
  const completedScores = students
    .filter((s) => s.status === "completed" && typeof s.percentage === "number")
    .map((s) => s.percentage ?? 0);
  const avgScore = completedScores.length
    ? Math.round(completedScores.reduce((a, b) => a + b, 0) / completedScores.length)
    : null;

  const stats: Array<{
    tone: "p1" | "p2" | "p3" | "p4" | "p5";
    label: string;
    value: string;
    delta: string;
    up: boolean;
  }> = [
    {
      tone: "p1",
      label: "Totaal leerlingen",
      value: String(students.length),
      delta: "Alle klassen samen",
      up: true,
    },
    {
      tone: "p3",
      label: "Bezig",
      value: String(busyCount),
      delta: busyCount > 0 ? "Actief nu" : "Niemand actief",
      up: true,
    },
    {
      tone: "p4",
      label: "Afgerond",
      value: String(completedCount),
      delta: avgScore !== null ? `Gem. score ${avgScore}%` : "Nog geen scores",
      up: true,
    },
    {
      tone: "p2",
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
            Beheer leerlingen<br />en bekijk resultaten
          </h1>
          <p className="intro">
            Importeer leerlingnummers per klas, volg de voortgang in real-time,
            en exporteer de resultaten uit de gekoppelde Neon database.
          </p>
        </div>
        <div className="admin-side-card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "var(--p1-purple)",
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
          <div key={i} className="stat-card" data-tone={s.tone}>
            <span className="accent-strip" />
            <div className="label">{s.label}</div>
            <div className="value">{s.value}</div>
            <div className={`delta ${s.up ? "up" : "down"}`}>{s.delta}</div>
          </div>
        ))}
      </div>

      <section className="import-panel">
        <h3>Leerlingen importeren</h3>
        <p className="help">
          Plak leerlingnummers per regel, bijvoorbeeld <code>vmbo1a 1234</code>. Eén klas
          tegelijk is overzichtelijker, maar meerdere mag ook.
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
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder={"vmbo1a 1234\nvmbo1a 1235\nvmbo1a 1236"}
            />
          </label>
          <button
            className="btn-import"
            type="button"
            onClick={importStudents}
            disabled={isLoading}
          >
            Importeren
          </button>
        </div>
        {message ? (
          <div
            className="error-banner-inline"
            style={{ background: "#E1F4ED", color: "#007a5e", marginTop: 16 }}
          >
            {message}
          </div>
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
              {(
                [
                  ["all", "Alle"],
                  ["p4", "LJ1 VMBO"],
                  ["p3", "LJ1 HV"],
                  ["p2", "LJ3 VMBO"],
                  ["p5", "LJ3 HV"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={`filter-chip ${paletteFilter === id ? "active" : ""}`}
                  onClick={() => setPaletteFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              className="filter-chip"
              type="button"
              onClick={loadStudents}
              disabled={isLoading}
            >
              ↻ Vernieuwen
            </button>
          </div>
        </div>

        <div className="rd-student-table">
          <div className="rd-student-row head">
            <span>Code</span>
            <span>Klas</span>
            <span>Meting</span>
            <span>Status</span>
            <span>Score</span>
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
              const hasScore =
                typeof student.totalScore === "number" && typeof student.maxScore === "number";
              return (
                <div
                  className="rd-student-row"
                  key={`${student.classCode}-${student.accessCode}`}
                >
                  <span className="code-cell">{student.accessCode}</span>
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
}: {
  session: AssessmentSession;
  assessment: AssessmentVersion;
  step: StepDescriptor;
  stepIndex: number;
  stepCount: number;
  onSubmitAnswer: (payload: SubmitAnswerPayload) => void;
  onUpdateFileTaskState: (item: AssessmentItem, nextState: Pt1State) => void;
  onFinishFileTask: (section: AssessmentSection, item: AssessmentItem) => void;
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

  return (
    <div className="q-wrap">
      <aside className="q-side">
        <div className="progress-eyebrow">Voortgang</div>
        <h2>{progress}% klaar</h2>
        <div className="progress-bar-mini">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p style={{ fontSize: ".88rem", margin: "0 0 12px", opacity: .85 }}>
          {questionNumber
            ? `Vraag ${questionNumber} van ${questionCount}`
            : `Zelfinschatting · stap ${stepIndex + 1} van ${stepCount}`}
        </p>
        <div className="helper">
          <strong>Tip:</strong> weet je het echt niet? Kies dan
          {" "}<em>"weet ik niet"</em> of sla de vraag over.
          Geen punten aftrek.
        </div>
      </aside>

      <div className="q-main-col" style={{ display: "flex", flexDirection: "column", gap: 24 }}>

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
        />
      ) : null}

      {item.type === "outlook_mail_simulation" ? (
        <MailTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
        />
      ) : null}

      {item.type === "account_security_simulation" ? (
        <InteractionTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          task={item.securityTask}
          onSubmit={onSubmitAnswer}
        />
      ) : null}

      {item.type === "excel_download_task" ? (
        <ExcelDownloadTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
        />
      ) : null}

      {item.type === "office_format_download_task" ? (
        <OfficeFormatTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
        />
      ) : null}

      {item.type === "powerpoint_design_task" ? (
        <PowerPointDesignTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
        />
      ) : null}

      {item.type === "teams_share_simulation" ? (
        <FakeTeamsTask
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
        />
      ) : null}

      {item.type === "block_programming_task" ? (
        <BlockProgrammingTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
        />
      ) : null}

      {item.type === "social_action_simulation" ? (
        <InteractionTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          task={item.socialTask}
          onSubmit={onSubmitAnswer}
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

  return (
    <section className="panel stack-lg">
      <QuestionHeader label="Zelfinschatting" title={item.title}>
        <p className="slider-instruction">
          {item.instruction}
          <br />
          Schuif het bolletje naar de score die het best bij jouw eigen inschatting past.
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
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
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
    sent: false,
    draftSaved: false,
    deleted: false,
  });
  const [activeAddressField, setActiveAddressField] = useState<AddressField | null>(null);
  const [activeCommandPanel, setActiveCommandPanel] = useState<CommandPanel>(null);
  const [sendMenuOpen, setSendMenuOpen] = useState(false);
  const task = item.mailTask;
  if (!task) {
    return null;
  }

  const toggleListValue = (field: AddressField | "attachments", value: string) => {
    setDraft((current) => {
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
    setDraft((current) => ({
      ...current,
      body: current.body ? `${current.body} ${text}` : text,
      links: current.links.includes(url) ? current.links : [...current.links, url],
      linkTexts: { ...current.linkTexts, [url]: text },
      linkUrlDraft: "",
      linkTextDraft: "",
    }));
  };

  const handleRibbonCommand = (button: string) => {
    if (button === "CC" || button === "Cc") {
      setDraft((current) => ({ ...current, ccVisible: true }));
      setActiveAddressField("cc");
      setActiveCommandPanel(null);
      return;
    }

    if (button === "BCC tonen" || button === "Bcc tonen") {
      setDraft((current) => ({ ...current, bccVisible: true }));
      setActiveAddressField("bcc");
      setActiveCommandPanel(null);
      return;
    }

    if (button === "Bestand bijvoegen" || button === "Bestand toevoegen") {
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
      setDraft((current) => ({
        ...current,
        priority: current.priority === "Hoog" ? "Normaal" : "Hoog",
      }));
      setActiveAddressField(null);
      return;
    }

    if (button === "Concept opslaan") {
      setDraft((current) => ({ ...current, draftSaved: true }));
      setActiveCommandPanel(null);
      return;
    }

    if (button === "Verwijderen") {
      setDraft((current) => ({ ...current, deleted: true, sent: false }));
      setActiveCommandPanel(null);
      return;
    }
  };

  const sendMessage = () => {
    setDraft((current) => ({ ...current, sent: true, deleted: false }));
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

  const toolbarButtons = task.visibleButtons.filter((button) => button !== "Verzenden");
  const fieldLabel = (field: AddressField) =>
    field === "to" ? "Aan" : field === "cc" ? "Cc" : "Bcc";
  const fieldVisible = (field: AddressField) =>
    field === "to" ||
    field === "cc" ||
    (field === "bcc" && (draft.bccVisible || draft.bcc.length > 0));

  const contactInitials = (email: string) => {
    const local = (email.split("@")[0] || email).replace(/[^a-z0-9]/gi, "");
    return (local.slice(0, 2) || "?").toUpperCase();
  };
  const fileExt = (filename: string) => {
    const dot = filename.lastIndexOf(".");
    return dot >= 0 ? filename.slice(dot + 1).toUpperCase().slice(0, 4) : "FILE";
  };
  const ribbonIcon = (button: string) => {
    if (button === "Bestand bijvoegen") return "📎 ";
    if (button === "Hyperlink invoegen") return "🔗 ";
    if (button === "Prioriteit") return "⚠ ";
    if (button === "Concept opslaan") return "💾 ";
    if (button === "Verwijderen") return "🗑 ";
    if (button === "BCC tonen") return "+ ";
    return "";
  };

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      />

      <div className="mail-shell">
        <div className="mail-ribbon">
          {["Vet", "Cursief", "Onderstreept", "Lijst"].map((b) => (
            <button key={b} className="rb" type="button" onClick={() => undefined}>
              {b}
            </button>
          ))}
          <span className="rb-divider" />
          {toolbarButtons.map((button) => {
            const isActive =
              (button === "Bestand bijvoegen" && activeCommandPanel === "attachments") ||
              (button === "Hyperlink invoegen" && activeCommandPanel === "link") ||
              (button === "Prioriteit" && draft.priority === "Hoog");
            return (
              <button
                key={button}
                className={`rb ${isActive ? "active" : ""}`}
                type="button"
                onClick={() => handleRibbonCommand(button)}
              >
                {ribbonIcon(button)}
                {button}
              </button>
            );
          })}
          <span style={{ flex: 1 }} />
          <button
            className="rb"
            type="button"
            onClick={() => setSendMenuOpen((current) => !current)}
            aria-label="Meer verzendopties"
          >
            ⋯
          </button>
          {sendMenuOpen ? (
            <div className="mail-send-menu" style={{ position: "absolute", right: 24, top: 56, background: "#fff", border: "1px solid var(--c-line)", borderRadius: "var(--radius-md)", padding: 8, boxShadow: "var(--shadow-md)", zIndex: 10 }}>
              <button className="rb" type="button" onClick={() => setSendMenuOpen(false)}>
                Verzending plannen
              </button>
            </div>
          ) : null}
        </div>

        {activeCommandPanel === "link" ? (
          <div className="mail-fields" style={{ background: "var(--t-bg-soft)", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <strong style={{ fontSize: ".82rem", color: "var(--t-accent-deep)" }}>
              Hyperlink invoegen:
            </strong>
            <input
              value={draft.linkUrlDraft}
              onChange={(event) =>
                setDraft((current) => ({ ...current, linkUrlDraft: event.target.value }))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitLinkDraft();
                }
              }}
              placeholder="URL"
              style={{ border: "1px solid var(--c-line)", borderRadius: 8, padding: "6px 10px", background: "#fff" }}
            />
            <input
              value={draft.linkTextDraft}
              onChange={(event) =>
                setDraft((current) => ({ ...current, linkTextDraft: event.target.value }))
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  commitLinkDraft();
                }
              }}
              placeholder="Linktekst"
              style={{ border: "1px solid var(--c-line)", borderRadius: 8, padding: "6px 10px", background: "#fff" }}
            />
            <button className="rb active" type="button" onClick={commitLinkDraft}>
              Invoegen
            </button>
          </div>
        ) : null}

        <div className="mail-fields">
          {(["to", "cc", "bcc"] as const).map((field) =>
            fieldVisible(field) ? (
              <div className="mail-field" key={field} style={{ position: "relative" }}>
                <span className="label">{fieldLabel(field)}</span>
                <div className="chips-row">
                  {draft[field].map((contact) => (
                    <span className="contact-chip" key={`${field}-${contact}`}>
                      <span className="avatar">{contactInitials(contact)}</span>
                      {contact}
                      <span
                        className="x"
                        onClick={() => toggleListValue(field, contact)}
                        role="button"
                        aria-label={`${contact} verwijderen`}
                      >
                        ×
                      </span>
                    </span>
                  ))}
                </div>
                <button
                  className="add-btn"
                  type="button"
                  onClick={() =>
                    setActiveAddressField((current) => (current === field ? null : field))
                  }
                >
                  + Contact
                </button>
                {activeAddressField === field ? (
                  <div
                    className="mail-picker-inline"
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 76,
                      right: 16,
                      marginTop: 4,
                      background: "#fff",
                      border: "1px solid var(--c-line)",
                      borderRadius: "var(--radius-md)",
                      padding: 10,
                      boxShadow: "var(--shadow-md)",
                      zIndex: 5,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {task.contacts.map((contact) => {
                      const isPicked = draft[field].includes(contact);
                      return (
                        <button
                          key={`${field}-pick-${contact}`}
                          type="button"
                          onClick={() => toggleListValue(field, contact)}
                          className="contact-chip"
                          style={{
                            justifyContent: "flex-start",
                            background: isPicked ? "var(--t-accent)" : "var(--t-bg-soft)",
                            color: isPicked ? "#fff" : "var(--t-accent-deep)",
                            cursor: "pointer",
                            border: "none",
                            padding: "8px 12px 8px 6px",
                            textAlign: "left",
                          }}
                        >
                          <span
                            className="avatar"
                            style={{
                              background: isPicked ? "#fff" : "var(--t-accent)",
                              color: isPicked ? "var(--t-accent)" : "#fff",
                            }}
                          >
                            {contactInitials(contact)}
                          </span>
                          <span style={{ fontSize: ".88rem" }}>{contact}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null,
          )}
          <div className="mail-field">
            <span className="label">Onderwerp</span>
            <input
              value={draft.subject}
              placeholder="Bijv. Verslag Nederlands"
              onChange={(event) =>
                setDraft((current) => ({ ...current, subject: event.target.value }))
              }
            />
            {draft.priority === "Hoog" ? (
              <span
                className="add-btn"
                style={{
                  background: "var(--p2-red)",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: 6,
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                }}
              >
                !
              </span>
            ) : null}
          </div>
        </div>

        <div className="mail-body-area">
          <textarea
            className="body-edit"
            rows={9}
            value={draft.body}
            onChange={(event) =>
              setDraft((current) => ({ ...current, body: event.target.value }))
            }
            placeholder="Beste mevrouw De Jong, ..."
            style={{
              border: "none",
              outline: "none",
              fontFamily: "var(--font-sans)",
              fontSize: "1rem",
              lineHeight: 1.6,
              width: "100%",
              resize: "vertical",
              background: "transparent",
              color: "var(--c-ink)",
            }}
          />
          {draft.links.length > 0 ? (
            <div className="mail-body-links" style={{ marginTop: 10, fontSize: ".9rem" }}>
              {draft.links.map((link) => (
                <a
                  key={link}
                  href={link}
                  style={{ color: "var(--t-accent)", marginRight: 12 }}
                >
                  {draft.linkTexts[link] ?? link}
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {activeCommandPanel === "attachments" ? (
          <div
            className="mail-attachments"
            style={{ background: "var(--t-bg-soft)", padding: "12px 28px" }}
          >
            <strong
              style={{
                width: "100%",
                fontSize: ".8rem",
                color: "var(--t-accent-deep)",
                fontFamily: "var(--font-display)",
                marginBottom: 6,
              }}
            >
              Beschikbare bestanden
            </strong>
            {task.files.map((file) => {
              const picked = draft.attachments.includes(file);
              return (
                <button
                  key={file}
                  type="button"
                  className="attach-chip"
                  onClick={() => toggleListValue("attachments", file)}
                  style={{
                    cursor: "pointer",
                    border: picked ? "1px solid var(--t-accent)" : "1px solid var(--c-line)",
                    background: picked ? "var(--t-accent)" : "var(--c-bg-soft)",
                    color: picked ? "#fff" : "var(--c-ink)",
                  }}
                >
                  <span
                    className="file-pic"
                    style={{
                      background: picked ? "#fff" : "var(--t-accent)",
                      color: picked ? "var(--t-accent)" : "#fff",
                    }}
                  >
                    {fileExt(file)}
                  </span>
                  {file}
                </button>
              );
            })}
          </div>
        ) : null}

        {draft.attachments.length > 0 ? (
          <div className="mail-attachments">
            {draft.attachments.map((attachment) => (
              <span className="attach-chip" key={attachment}>
                <span className="file-pic">{fileExt(attachment)}</span>
                {attachment}
                <span
                  style={{
                    opacity: 0.5,
                    marginLeft: 4,
                    cursor: "pointer",
                    fontWeight: 900,
                  }}
                  role="button"
                  aria-label={`${attachment} verwijderen`}
                  onClick={() => toggleListValue("attachments", attachment)}
                >
                  ×
                </span>
              </span>
            ))}
          </div>
        ) : null}

        <div className="mail-footer">
          <div className="left">
            <span
              style={{
                fontSize: ".88rem",
                color: draft.sent ? "#007a5e" : "var(--c-ink-soft)",
                fontWeight: 700,
              }}
            >
              {draft.sent
                ? "✓ Verzonden"
                : draft.deleted
                  ? "🗑 Verwijderd"
                  : draft.draftSaved
                    ? "💾 Concept opgeslagen"
                    : "Concept"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={sendMessage}
              disabled={draft.sent}
            >
              Verzenden
            </button>
            <button className="btn btn-primary" type="button" onClick={submit}>
              <span>Taak afronden</span>
              <span className="arrow-circle">→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const InteractionTaskView = ({
  section,
  item,
  questionNumber,
  task,
  onSubmit,
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  task: AssessmentItem["securityTask"] | AssessmentItem["socialTask"];
  onSubmit: (payload: SubmitAnswerPayload) => void;
}) => {
  const [state, setState] = useState<Record<string, unknown>>({});
  const [optionOrders] = useState(() => createInteractionOrders(task));
  if (!task) {
    return null;
  }

  const orderFor = (
    screenId: string,
    group: InteractionGroup,
    kind: "cards" | "options",
  ) => optionOrders[interactionOrderKey(screenId, group.id, kind)] ?? [];
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
  const shownOptionOrder = Object.values(optionOrders).flat();

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

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      />

      <div className="task-screen-grid">
        {task.screens.map((screen) => (
          <div className="interaction-screen" key={screen.id}>
            <div className="stack-xs">
              <strong>{screen.title}</strong>
              <p>{screen.instruction}</p>
              {screen.body ? <div className="notice-banner">{screen.body}</div> : null}
            </div>
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
        ))}
      </div>

      <div className="actions">
        <button className="primary-button" type="button" onClick={submit}>
          Taak afronden
        </button>
      </div>
    </section>
  );
};

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
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
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

      <div className="task-screen-grid">
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

      <div className="actions">
        <button
          className="primary-button"
          type="button"
          onClick={() =>
            onSubmit({
              section,
              item,
              selectedAnswer: { answers },
              shownOptionOrder: [],
            })
          }
        >
          Taak afronden
        </button>
      </div>
    </section>
  );
};

const OfficeFormatTaskView = ({
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

      <div className="actions">
        <button
          className="primary-button"
          type="button"
          onClick={() =>
            onSubmit({
              section,
              item,
              selectedAnswer: { code, exportAction },
              shownOptionOrder: [],
            })
          }
        >
          Taak afronden
        </button>
      </div>
    </section>
  );
};

const PowerPointDesignTaskView = ({
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

      <div className="actions">
        <button
          className="primary-button"
          type="button"
          onClick={() =>
            onSubmit({
              section,
              item,
              selectedAnswer: state,
              shownOptionOrder: [],
            })
          }
        >
          Taak afronden
        </button>
      </div>
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
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
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

      <div className="fake-teams-shell" aria-label="Fake Teams-vergadering">
        <div className="fake-teams-titlebar">
          <div className="fake-teams-appmark">T</div>
          <span>Microsoft Teams</span>
          <span className="fake-teams-meeting-title">Nulmeting DG</span>
        </div>

        <div className={`fake-teams-content ${state.participantsOpen ? "" : "participants-hidden"}`}>
          {state.participantsOpen ? (
            <aside className="fake-teams-side">
              <strong>Vergadering</strong>
              <span>Nu bezig</span>
              <div className="fake-participant active">Leerling Anoniem</div>
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
              <TeamsVideoTile
                person="Leerling Anoniem"
                initials="LA"
                cameraOn={state.cameraOn}
                photoSide="learner"
                blurred={state.backgroundBlurred}
              />
              <TeamsVideoTile person="Docent" initials="D" cameraOn photoSide="teacher" small />
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
                      <span className="fake-share-icon" aria-hidden="true" />
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
                          { selectedWindow: windowName },
                        );
                      }}
                    >
                      <span className="fake-window-preview" aria-hidden="true">
                        {windowName === "Windows Media Player" ? ">" : ""}
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
                  <div className="fake-chat-message received">Welkom bij de nulmeting.</div>
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
                  logAction("clicked_share", { shareOpened: true, windowPickerOpen: false });
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
              ? "Windows Media Player wordt gedeeld"
              : `${state.selectedWindow} is geselecteerd`}
          </div>
        ) : null}
      </div>

      <div className="actions">
        <button
          className="primary-button"
          type="button"
          onClick={() => submit(false)}
        >
          Taak afronden
        </button>
        <button
          className="ghost-button"
          type="button"
          onClick={() => submit(true)}
        >
          Sla over
        </button>
      </div>
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
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
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
      // Already running → stop.
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

      <div className="blocks-shell">
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
                  {speechVisible ? <div className="bizzy-speech">Hoi!</div> : null}
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

      <div className="actions">
        <button
          className="primary-button"
          type="button"
          onClick={() =>
            onSubmit({
              section,
              item,
              selectedAnswer: { program, executed, aPresses, temperature, windowOpen, runEffects },
              shownOptionOrder: paletteBlocks.map((block) => block.label),
            })
          }
        >
          Taak afronden
        </button>
      </div>
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

  const submit = (selectedAnswer: SelectedAnswer) => {
    onSubmit({
      section,
      item,
      selectedAnswer,
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

      <div className="option-grid">
        {orderedOptions.map((option) => {
          return (
            <button
              className="option-card"
              key={option.id}
              type="button"
              onClick={() => submit(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="actions">
        {item.allowUnknown ? (
          <button className="ghost-button" type="button" onClick={() => submit(null)}>
            Weet ik niet
          </button>
        ) : null}
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

  return (
    <div className={`mockup-frame mockup-${item.type}`}>
      <div className="mockup-topline">
        <strong>{item.mockup.title}</strong>
        {item.mockup.badge ? <span>{item.mockup.badge}</span> : null}
      </div>
      {item.mockup.subtitle ? <p className="mockup-subtitle">{item.mockup.subtitle}</p> : null}
      <div className="mockup-body">
        {item.mockup.content.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
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
}: {
  item: AssessmentItem;
  questionNumber: number;
  state: Pt1State;
  onChange: (nextState: Pt1State) => void;
  onFinish: () => void;
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

  if (!item.fileTask || !state) {
    return null;
  }

  const selectedNode = selectedNodeId ? getNodeById(state.nodes, selectedNodeId) : null;
  const activeFolderId = contextFolderId;
  const activeItems = getChildren(state.nodes, activeFolderId);
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

  const renameSelectedNode = () => {
    if (!selectedNodeId || !selectedNode) {
      return;
    }
    const nextName = window.prompt("Nieuwe naam:", selectedNode.name);
    if (nextName) {
      onChange(renameNode(state, selectedNodeId, nextName));
    }
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
      const nextName = window.prompt("Nieuwe naam:", node.name);
      if (nextName) {
        onChange(renameNode(state, node.id, nextName));
      }
    }
  };

  const createNewFolder = () => {
    const nextName = window.prompt("Naam van de nieuwe map:", "Schoolwerk");
    if (nextName) {
      onChange(createFolder(state, activeFolderId, nextName));
    }
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

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      />

      <div className="pt1-layout">
        <aside className="pt1-tasks">
          <h3>Opdrachten</h3>
          <ol>
            {item.fileTask.tasks.map((task) => (
              <li key={task.id}>{task.description}</li>
            ))}
          </ol>
          <button className="primary-button" type="button" onClick={onFinish}>
            Taak afronden
          </button>
          {state.completed ? (
            <div className="result-mini">
              <strong>
                Score: {state.score} / {item.points}
              </strong>
              <ul>
                {state.taskResults.map((task) => (
                  <li key={task.taskId}>
                    {task.correct ? "Goed" : "Nog niet goed"} - {task.description}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>

        <div className="workspace-card explorer-card">
          <div className="explorer-commandbar">
            <button
              className="explorer-command"
              type="button"
              onClick={() => onChange(undoPt1(state))}
              disabled={state.undoStack.length === 0}
            >
              Ongedaan maken
            </button>
            <button className="explorer-command" type="button" onClick={createNewFolder}>
              Nieuw
            </button>
            <button
              className="explorer-command"
              type="button"
              disabled={!selectedNode?.parentId}
              onClick={() => selectedNodeId && setClipboard({ mode: "cut", nodeId: selectedNodeId })}
            >
              Knippen
            </button>
            <button
              className="explorer-command"
              type="button"
              disabled={!selectedNode?.parentId}
              onClick={() => selectedNodeId && setClipboard({ mode: "copy", nodeId: selectedNodeId })}
            >
              Kopiëren
            </button>
            <button
              className="explorer-command"
              type="button"
              disabled={!clipboardNode}
              onClick={pasteClipboard}
            >
              Plakken
            </button>
            <button
              className="explorer-command"
              type="button"
              disabled={!selectedNode?.parentId}
              onClick={renameSelectedNode}
            >
              Naam wijzigen
            </button>
            <button
              className="explorer-command"
              type="button"
              disabled={!selectedNode?.parentId}
              onClick={() => window.alert("Delen heb je voor deze opdracht niet nodig.")}
            >
              Delen
            </button>
            <button
              className="explorer-command"
              type="button"
              disabled={!selectedNode?.parentId}
              onClick={deleteSelectedNode}
            >
              Verwijderen
            </button>
          </div>

          <div className="explorer-window">
            <aside className="explorer-sidebar">
              <button
                type="button"
                className={contextFolderId === item.fileTask.simulation.rootId ? "active" : ""}
                onClick={() => {
                  setContextFolderId(item.fileTask?.simulation.rootId ?? activeFolderId);
                  setSelectedNodeId(null);
                }}
              >
                Thuis
              </button>
              {getFolder("Galerijen") ? (
                <button
                  type="button"
                  className={contextFolderId === getFolderId("Galerijen") ? "active" : ""}
                  onClick={() => {
                    setContextFolderId(getFolderId("Galerijen"));
                    setSelectedNodeId(null);
                  }}
                >
                  Galerijen
                </button>
              ) : null}
              <button
                type="button"
                className={contextFolderId === getFolderId("OneDrive") ? "active" : ""}
                onClick={() => {
                  setContextFolderId(getFolderId("OneDrive"));
                  setSelectedNodeId(null);
                }}
              >
                OneDrive
              </button>
              <hr />
              <button type="button">Bureaublad</button>
              {getFolder("Downloads") ? (
                <button
                  type="button"
                  className={contextFolderId === getFolderId("Downloads") ? "active" : ""}
                  onClick={() => {
                    setContextFolderId(getFolderId("Downloads"));
                    setSelectedNodeId(null);
                  }}
                >
                  Downloads
                </button>
              ) : null}
              {getFolder("Documenten") ? (
                <button
                  type="button"
                  className={contextFolderId === getFolderId("Documenten") ? "active" : ""}
                  onClick={() => {
                    setContextFolderId(getFolderId("Documenten"));
                    setSelectedNodeId(null);
                  }}
                >
                  Documenten
                </button>
              ) : null}
            </aside>

            <div className="explorer-main">
              <div className="explorer-address">
                <span>{buildPath(state.nodes, activeFolderId)}</span>
                <span>{selectedNode ? `Geselecteerd: ${selectedNode.name}` : "Geen selectie"}</span>
              </div>
              <div
                className={`file-grid ${activeItems.length === 0 ? "is-empty" : ""}`}
                role="list"
                aria-label="Gesimuleerde Windows Verkenner"
              >
                {activeItems.length === 0 ? (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "40px 20px",
                      color: "var(--c-ink-mute)",
                      fontStyle: "italic",
                      fontSize: ".9rem",
                    }}
                  >
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
                        <div className="label">{node.name}</div>
                      </button>
                    );
                  })
                )}
              </div>
              <div className="explorer-hint">
                {clipboard && clipboardNode
                  ? `${clipboard.mode === "cut" ? "Geknipt" : "Gekopieerd"}: ${clipboardNode.name}. Kies een map en klik op Plakken.`
                  : "Instructie: kies eerst een bestand of map. Gebruik daarna de knoppen bovenaan. Hernoemen kan ook door een geselecteerd item nog een keer aan te klikken."}
              </div>
            </div>
          </div>
        </div>
      </div>

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

const ResultScreen = ({
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
            Afgerond — goed gedaan!
          </span>
          <h2>Jouw nulmeting is klaar.</h2>
          <p className="intro">
            Je scoorde <strong>{result.totalScore} van de {result.maxScore} punten</strong>.
            De zelfinschatting telt niet mee in het eindresultaat. Dit is een nulmeting —
            er is geen "goed" of "fout".
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
          const tone = percentage >= 75 ? "Sterk" : percentage >= 50 ? "Op weg" : "Groeipunt";
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

export default App;
