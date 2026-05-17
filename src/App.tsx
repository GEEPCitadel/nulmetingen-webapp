import type { CSSProperties, KeyboardEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
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
type NewExplorerItem = {
  label: string;
  icon: string;
  type: "folder" | "file";
  defaultName: string;
};

const newExplorerItems: NewExplorerItem[] = [
  { label: "Map", icon: "folder", type: "folder", defaultName: "Nieuwe map" },
  { label: "Snelkoppeling", icon: "shortcut", type: "file", defaultName: "Nieuwe snelkoppeling.url" },
  { label: "Bitmapafbeelding", icon: "image", type: "file", defaultName: "Nieuwe afbeelding.bmp" },
  { label: "Microsoft Word-document", icon: "word", type: "file", defaultName: "Doc1.docx" },
  {
    label: "Microsoft PowerPoint-presentatie",
    icon: "powerpoint",
    type: "file",
    defaultName: "Presentatie1.pptx",
  },
];

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

const defaultTheme = themes.skyOrange;

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

const assessmentTitle = (
  <>
    Nulmeting
    <br />
    Digitale Geletterdheid
  </>
);

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

const getEntryTheme = (view: EntryView) => {
  if (view === "admin") {
    return themes.sandCoral;
  }
  if (view === "adminAccess") {
    return themes.mintPink;
  }
  return defaultTheme;
};

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

  return (
    <AppShell
      theme={activeTheme}
      title={
        result
          ? "Resultaat leerling"
          : activeAssessment
            ? assessmentTitle
            : entryView === "adminAccess"
              ? "Beheeromgeving openen"
              : entryView === "admin"
                ? "Beheer leerlingcodes"
                : assessmentTitle
      }
      subtitle={
        result
          ? "De afname is afgerond. Hieronder staat de score per blok."
          : activeAssessment
            ? `${activeAssessment.level} - richttijd ongeveer 30 minuten`
            : entryView === "adminAccess"
              ? "Beheer opent met een aparte code."
              : entryView === "admin"
                ? "Importeer leerlingcodes en bekijk voortgang vanuit de gekoppelde Neon database."
                : "Deze vragenlijst geeft een beeld van jouw digitale geletterdheid. Het invullen duurt ongeveer dertig minuten."
      }
      timer={
        session && !session.completedAt
          ? formatTime(Math.floor((now - new Date(session.startedAt).getTime()) / 1000))
          : undefined
      }
      logoPath={
        result || entryView === "admin"
          ? "/brand/logos/citadel-5-rgb.png"
          : activeTheme.logo
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
  title,
  subtitle,
  timer,
  logoPath,
  onReset,
}: {
  children: ReactNode;
  theme: ThemeDefinition;
  title: ReactNode;
  subtitle: string;
  timer?: string;
  logoPath: string;
  onReset?: () => void;
}) => (
  <div
    className="app-shell"
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
    <div className="background-layer">
      <img className="bg-blob bg-blob-a" src="/brand/shapes/blob.png" alt="" />
      <img className="bg-blob bg-blob-b" src="/brand/shapes/blob-2.png" alt="" />
      <img className="bg-ribbon bg-ribbon-a" src="/brand/shapes/slinger-3.png" alt="" />
      <img className="bg-ribbon bg-ribbon-b" src="/brand/shapes/slinger-4.png" alt="" />
    </div>
    <header className="hero-card">
      <div className="hero-copy">
        <div className="eyebrow">Citadel College</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="hero-side">
        <img className="brand-logo" src={logoPath} alt="Citadel College" />
        {timer ? <div className="timer-chip">Bezig {timer}</div> : null}
        {onReset ? (
          <button className="ghost-button" type="button" onClick={onReset}>
            Nieuwe leerling starten
          </button>
        ) : null}
      </div>
    </header>
    <main>{children}</main>
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
  <section className="panel start-panel">
    <div className="stack-sm">
      <span className="section-tag">Leerling</span>
      <h2>Start de nulmeting</h2>
      <p>
        In deze meting krijg je korte opdrachten en vragen. Het resultaat geeft
        een beeld van hoe digitaal geletterd jij bent.
      </p>
      <p>
        Werk zelfstandig en beantwoord de vragen eerlijk. Als je iets niet weet,
        kun je dat als antwoord kiezen of de opdracht overslaan.
      </p>
      <p>
        De meting duurt ongeveer een half uur.
      </p>
    </div>
    <label className="field">
      <span>Leerlingnummer</span>
      <input
        value={learnerCode}
        onChange={(event) => onLearnerCodeChange(event.target.value)}
        placeholder="Bijvoorbeeld 1234"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onStart();
          }
        }}
      />
    </label>
    <label className="field">
      <span>Klas</span>
      <input
        value={classCode}
        onChange={(event) => onClassCodeChange(event.target.value)}
        placeholder="Bijvoorbeeld vmbo1a"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onStart();
          }
        }}
      />
    </label>
    {error ? <div className="error-banner">{error}</div> : null}
    <div className="actions start-actions">
      <button className="primary-button" type="button" onClick={onStart} disabled={isStarting}>
        {isStarting ? "Controleren..." : "Start"}
      </button>
    </div>
    <div className="teacher-entry">
      <button className="ghost-button" type="button" onClick={onOpenAdmin}>
        Alleen beheeromgeving
      </button>
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
  <section className="panel compact-panel">
    <div className="stack-sm">
      <span className="section-tag">Beheer</span>
      <h2>Voer de beheercode in</h2>
      <p>Met de beheercode open je de beheeromgeving met de gekoppelde database.</p>
    </div>
    <label className="field">
      <span>Beheercode</span>
      <input
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
    {error ? <div className="error-banner">{error}</div> : null}
    <div className="actions">
      <button className="primary-button" type="button" onClick={onUnlock} disabled={isLoading}>
        {isLoading ? "Controleren..." : "Open beheer"}
      </button>
      <button className="ghost-button" type="button" onClick={onBack}>
        Terug naar leerlingstart
      </button>
    </div>
  </section>
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

  return (
    <section className="panel stack-lg">
      <div className="stack-sm">
        <span className="section-tag">Beheer</span>
        <h2>Leerlingcodes en resultaten</h2>
        <p>
          Importeer leerlingnummers per klas. Voortgang en resultaten worden uit de Neon database gelezen.
        </p>
      </div>
      <div className="admin-import-panel">
        <div className="admin-import-controls">
          <label className="field">
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
          <label className="field">
            <span>Importnaam</span>
            <input
              value={importBatch}
              onChange={(event) => setImportBatch(event.target.value)}
              placeholder="Bijvoorbeeld VMBO klas 1"
            />
          </label>
          <div className="field">
            <span>Actie</span>
            <button className="primary-button" type="button" onClick={importStudents} disabled={isLoading}>
              Importeren
            </button>
          </div>
        </div>
        <label className="field">
          <span>Leerlingen</span>
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            placeholder={"Een leerling per regel, bijvoorbeeld:\nvmbo1a 1234\nvmbo1a 1235"}
          />
        </label>
      </div>
      {message ? <div className="success-banner">{message}</div> : null}
      {error ? <div className="error-banner">{error}</div> : null}
      <div className="admin-student-heading">
        <h3>Leerlingen</h3>
        <button className="secondary-button" type="button" onClick={loadStudents} disabled={isLoading}>
          Vernieuwen
        </button>
      </div>
      <div className="student-table student-management-table">
        <div className="student-table-row student-table-head">
          <span>Klas</span>
          <span>Nummer</span>
          <span>Nulmeting</span>
          <span>Status</span>
          <span>Score</span>
          <span>Import</span>
          <span>Actie</span>
        </div>
        {students.length === 0 ? (
          <div className="student-table-row">
            <span>Nog geen leerlingen in de database.</span>
          </div>
        ) : (
          students.map((student) => (
            <div className="student-table-row" key={`${student.classCode}-${student.accessCode}`}>
              <span>{student.classCode}</span>
              <span>{student.accessCode}</span>
              <span>{assessmentMap[student.versionId]?.level ?? student.versionId}</span>
              <span>{statusLabel(student.status)}</span>
              <span>
                {typeof student.totalScore === "number" && typeof student.maxScore === "number"
                  ? `${student.totalScore}/${student.maxScore} (${student.percentage ?? 0}%)`
                  : "-"}
              </span>
              <span>{student.importBatch || "-"}</span>
              <span>
                <button
                  className="ghost-button compact-action"
                  type="button"
                  onClick={() => reopenStudent(student)}
                  disabled={isLoading}
                >
                  Heropen
                </button>
              </span>
            </div>
          ))
        )}
      </div>
      <div className="actions">
        <button className="ghost-button" type="button" onClick={onBack}>
          Terug naar leerlingstart
        </button>
      </div>
    </section>
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
    <section className="stack-lg">
      <div className="progress-card">
        <div className="progress-meta">
          <strong>Voortgang</strong>
          <span>
            {questionNumber
              ? `Vraag ${questionNumber} van ${questionCount}`
              : `Zelfinschatting · stap ${stepIndex + 1} van ${stepCount}`}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
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
    </section>
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

  const sortedContacts = [...task.contacts].sort((first, second) =>
    first.localeCompare(second, "nl", { sensitivity: "base" }),
  );
  const sortedFiles = [...task.files].sort((first, second) =>
    first.localeCompare(second, "nl", { sensitivity: "base" }),
  );

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
      setDraft((current) => ({ ...current, bccVisible: !current.bccVisible }));
      setActiveAddressField((current) => (draft.bccVisible || current === "bcc" ? null : "bcc"));
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
    field === "to" ? "AAN" : field === "cc" ? "CC" : "BCC";
  const fieldVisible = (field: AddressField) =>
    field === "to" ||
    field === "cc" ||
    (field === "bcc" && draft.bccVisible);
  const fieldPlaceholder = (field: AddressField) =>
    field === "to" ? "Klik om ontvangers te kiezen" : "Klik om adressen te kiezen";

  const renderAddressField = (field: AddressField) =>
    fieldVisible(field) ? (
      <div className="mail-address-row" key={field}>
        <strong>{fieldLabel(field)}</strong>
        <div className="mail-address-control">
          <button
            className={`mail-address-input ${draft[field].length === 0 ? "empty" : ""}`}
            type="button"
            onClick={() =>
              setActiveAddressField((current) => (current === field ? null : field))
            }
          >
            {draft[field].length > 0 ? draft[field].join("; ") : fieldPlaceholder(field)}
          </button>
          {activeAddressField === field ? (
            <div className="mail-picker">
              {sortedContacts.map((contact) => (
                <button
                  className={`chip-button ${draft[field].includes(contact) ? "selected" : ""}`}
                  key={`${field}-${contact}`}
                  type="button"
                  onClick={() => toggleListValue(field, contact)}
                >
                  {contact}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    ) : null;

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      />

      <div className="mail-window">
        <div className="mail-titlebar">Nieuw bericht</div>
        <div className="mail-ribbon">
          <div className="mail-send-group">
            <button className="mail-send-button" type="button" onClick={sendMessage}>
              Verzenden
            </button>
            <button
              aria-label="Meer verzendopties"
              className="mail-send-caret"
              type="button"
              onClick={() => setSendMenuOpen((current) => !current)}
            />
            {sendMenuOpen ? (
              <div className="mail-send-menu">
                <button type="button" onClick={() => setSendMenuOpen(false)}>
                  Verzending plannen
                </button>
              </div>
            ) : null}
          </div>
          {toolbarButtons.map((button) => (
            <button
              key={button}
              className={`mail-ribbon-button ${
                (button === "Bestand bijvoegen" && activeCommandPanel === "attachments") ||
                (button === "Hyperlink invoegen" && activeCommandPanel === "link") ||
                (button === "Prioriteit" && draft.priority === "Hoog")
                  ? "active"
                  : ""
              }`}
              type="button"
              onClick={() => handleRibbonCommand(button)}
            >
              {button}
            </button>
          ))}
        </div>

        {activeCommandPanel === "attachments" ? (
          <div className="mail-command-panel">
            <strong>Bestand bijvoegen</strong>
            <div className="chip-grid">
              {sortedFiles.map((file) => (
                <button
                  className={`chip-button ${draft.attachments.includes(file) ? "selected" : ""}`}
                  key={file}
                  type="button"
                  onClick={() => toggleListValue("attachments", file)}
                >
                  {file}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {activeCommandPanel === "link" ? (
          <div className="mail-command-panel">
            <strong>Hyperlink invoegen</strong>
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
            />
            <button className="secondary-button" type="button" onClick={commitLinkDraft}>
              Invoegen
            </button>
            {draft.links.length > 0 ? (
              <div className="mini-list">
                {draft.links
                  .map((link) => draft.linkTexts[link] ? `${draft.linkTexts[link]} (${link})` : link)
                  .join(", ")}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="mail-layout">
          <div className="mail-recipients">
            {(["to", "cc", "bcc"] as const).map(renderAddressField)}
          </div>

          <label className="field">
            <span>Onderwerp</span>
            <div className="mail-subject-wrap">
              <input
                value={draft.subject}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, subject: event.target.value }))
                }
              />
              {draft.priority === "Hoog" ? <span className="priority-marker">!</span> : null}
            </div>
          </label>

          {draft.attachments.length > 0 ? (
            <div className="attachment-strip">
              {draft.attachments.map((attachment) => (
                <span className="attachment-pill" key={attachment}>
                  {attachment}
                  <button
                    aria-label={`${attachment} verwijderen`}
                    type="button"
                    onClick={() => toggleListValue("attachments", attachment)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : null}

          <label className="field">
            <span>Bericht</span>
            <textarea
              rows={10}
              value={draft.body}
              onChange={(event) =>
                setDraft((current) => ({ ...current, body: event.target.value }))
              }
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
          </label>

          <div className="status-strip">
            {draft.sent ? "Status: verzonden" : draft.deleted ? "Status: verwijderd" : draft.draftSaved ? "Status: concept opgeslagen" : "Status: concept"}
          </div>
        </div>
      </div>

      <div className="actions">
        <button className="primary-button" type="button" onClick={submit}>
          Taak afronden
        </button>
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

const FakeSharedWindow = ({ windowName }: { windowName: string }) => {
  if (windowName === "Scherm") {
    return (
      <div className="fake-shared-window desktop-window">
        <div className="fake-window-titlebar">
          <span>Volledig scherm</span>
          <span>Bureaublad van Mark Canbers</span>
        </div>
        <div className="fake-desktop-share">
          <div className="fake-desktop-card word-card">Word - Verslag Nederlands</div>
          <div className="fake-desktop-card media-card">Windows Media Player</div>
          <div className="fake-desktop-card chat-card">Teams chat</div>
          <div className="fake-desktop-card browser-card">Browser - schoolsite</div>
        </div>
      </div>
    );
  }

  if (windowName === "Windows Media Player") {
    return (
      <div className="fake-shared-window media-player">
        <div className="fake-window-titlebar">
          <span>Windows Media Player</span>
          <span>Filmfragment.mp4</span>
        </div>
        <div className="fake-media-scene">
          <div className="fake-film-frame">
            <span>Filmfragment</span>
          </div>
          <div className="fake-media-controls">
            <span className="fake-play-button" aria-hidden="true">&gt;</span>
            <div className="fake-progress-track">
              <span />
            </div>
            <span>01:24 / 03:10</span>
          </div>
        </div>
      </div>
    );
  }

  if (windowName === "Word - Verslag Nederlands") {
    return (
      <div className="fake-shared-window word-window">
        <div className="fake-window-titlebar">
          <span>Word</span>
          <span>Verslag Nederlands</span>
        </div>
        <div className="fake-word-ribbon">
          {["Start", "Invoegen", "Ontwerpen", "Controleren"].map((tab) => (
            <span key={tab}>{tab}</span>
          ))}
        </div>
        <article className="fake-word-page">
          <h3>Verslag Nederlands</h3>
          <p>
            In dit verslag bespreek ik het boek dat we deze periode hebben gelezen. Ik let op de
            hoofdpersonen, het onderwerp en de manier waarop de schrijver spanning opbouwt.
          </p>
          <p>
            De hoofdpersoon verandert duidelijk door het verhaal heen. Aan het begin is hij onzeker,
            maar later durft hij beter voor zijn mening uit te komen.
          </p>
        </article>
      </div>
    );
  }

  if (windowName === "Excel - Cijferlijst") {
    return (
      <div className="fake-shared-window excel-window">
        <div className="fake-window-titlebar">
          <span>Excel</span>
          <span>Cijferlijst.xlsx</span>
        </div>
        <div className="fake-sheet-grid" aria-hidden="true">
          {["Naam", "Toets 1", "Toets 2", "Gemiddelde", "Mark Canbers", "7,1", "6,8", "7,0", "S. de Vries", "8,2", "7,9", "8,1"].map((cell, index) => (
            <span className={index < 4 ? "heading" : ""} key={`${cell}-${index}`}>{cell}</span>
          ))}
        </div>
      </div>
    );
  }

  if (windowName === "Browser - schoolsite") {
    return (
      <div className="fake-shared-window browser-window">
        <div className="fake-window-titlebar">
          <span>Browser</span>
          <span>schoolsite.example/agenda</span>
        </div>
        <div className="fake-browser-page">
          <strong>Schoolsite</strong>
          <h3>Agenda deze week</h3>
          <p>Maandag: mentorgesprek</p>
          <p>Dinsdag: Nederlands in lokaal 204</p>
          <p>Vrijdag: opdracht digitale geletterdheid inleveren</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fake-shared-window teams-chat-window">
      <div className="fake-window-titlebar">
        <span>Microsoft Teams</span>
        <span>Chat</span>
      </div>
      <div className="fake-chat-messages shared-chat">
        <div className="fake-chat-message received">Kun je het filmfragment delen?</div>
        <div className="fake-chat-message sent">Ja, ik zoek het venster op.</div>
      </div>
    </div>
  );
};

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
              {state.selectedWindow ? (
                <div className="fake-shared-stage">
                  <div className="fake-sharing-label">
                    {state.selectedWindow === task.correctWindow
                      ? "Windows Media Player wordt nu gedeeld"
                      : `${state.selectedWindow} wordt nu gedeeld`}
                  </div>
                  <FakeSharedWindow windowName={state.selectedWindow} />
                </div>
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
                          shareOpened: false,
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
                          { selectedWindow: windowName, shareOpened: false, windowPickerOpen: false },
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
                  logAction("clicked_share", {
                    shareOpened: !state.shareOpened,
                    windowPickerOpen: false,
                    chatOpen: false,
                    reactionsOpen: false,
                    moreOpen: false,
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

type ProgramBlock = ProgrammingBlockDefinition & {
  indent: number;
  values?: Record<string, string>;
};
type ProgramRunEffects = {
  move: number;
  rotation: number;
  speech: string;
  display: string;
  sound: string;
  score: number | null;
  speed: number | null;
  animationPaused: boolean;
  animationMode: string;
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
  animationMode: "",
  teller: 0,
  log: [],
};

const programmingCategoryOrder = ["beweging", "uiterlijk", "geluid", "gebeurtenissen", "besturing"];
const startProgramBlockLabel = "Wanneer er geklikt wordt op afspelen";
const animationOptions = ["Dansen", "Lachen", "Lopen", "Niet animeren", "Springen"];
const soundOptions = ["Applaus", "Bel", "Start", "Trommel"];

const sortProgrammingBlocks = (blocks: ProgrammingBlockDefinition[]) =>
  [...blocks].sort((first, second) => {
    const firstIndex = programmingCategoryOrder.indexOf(first.category);
    const secondIndex = programmingCategoryOrder.indexOf(second.category);
    const firstRank = firstIndex === -1 ? programmingCategoryOrder.length : firstIndex;
    const secondRank = secondIndex === -1 ? programmingCategoryOrder.length : secondIndex;
    return firstRank - secondRank || first.label.localeCompare(second.label, "nl", { sensitivity: "base" });
  });

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
  const task = item.blockTask;
  const isAdvancedBizzyTask = task?.device === "bizzy" && item.id !== "lj1v-pt7-programming";
  const createProgramBlock = (block: ProgrammingBlockDefinition): ProgramBlock => {
    const nextBlock: ProgramBlock = { ...block, indent: 0 };
    if (!isAdvancedBizzyTask) {
      return nextBlock;
    }
    if (block.label.startsWith("Bizzy zegt")) {
      return { ...nextBlock, label: 'Bizzy zegt ""', values: { speech: "" } };
    }
    if (block.label.startsWith("verplaats Bizzy")) {
      return {
        ...nextBlock,
        label: "verplaats Bizzy  meter vooruit in  sec.",
        values: { meters: "", seconds: "" },
      };
    }
    if (block.label.startsWith("draai Bizzy")) {
      return {
        ...nextBlock,
        label: "draai Bizzy met de wijzers van de klok mee naar  graden in  sec.",
        values: { degrees: "", seconds: "" },
      };
    }
    if (block.label.startsWith("wacht")) {
      return { ...nextBlock, label: "wacht  seconde", values: { seconds: "" } };
    }
    if (block.label.startsWith("herhaal")) {
      return { ...nextBlock, label: "herhaal  keer", values: { times: "" } };
    }
    if (block.label.startsWith("verander animatie")) {
      return {
        ...nextBlock,
        label: "verander animatie van Bizzy naar Niet animeren",
        values: { animation: "Niet animeren" },
      };
    }
    if (block.label.startsWith("speel geluid")) {
      return { ...nextBlock, label: "speel geluid Applaus", values: { sound: "Applaus" } };
    }
    return nextBlock;
  };
  const [program, setProgram] = useState<ProgramBlock[]>(() => {
    const startBlock = item.blockTask?.blocks.find((block) => block.label === startProgramBlockLabel);
    return startBlock ? [createProgramBlock(startBlock)] : [];
  });
  const [executed, setExecuted] = useState(false);
  const [speechVisible, setSpeechVisible] = useState(false);
  const [aPresses, setAPresses] = useState(0);
  const [temperature, setTemperature] = useState(30);
  const [windowOpen, setWindowOpen] = useState(true);
  const [runEffects, setRunEffects] = useState<ProgramRunEffects>(
    emptyProgramRunEffects,
  );
  const [paletteBlocks] = useState(() =>
    sortProgrammingBlocks(item.blockTask?.blocks ?? []).filter(
      (block) => block.label !== startProgramBlockLabel,
    ),
  );
  if (!task) {
    return null;
  }
  const blockByLabel = new Map(task.blocks.map((block) => [block.label, block]));
  const blockStyle = (block: Pick<ProgrammingBlockDefinition, "color">) =>
    ({ "--block-color": block.color } as CSSProperties);

  const updateProgramBlock = (
    blockIndex: number,
    field: string,
    value: string,
    getLabel: (values: Record<string, string>) => string,
  ) => {
    setProgram((current) =>
      current.map((block, index) => {
        if (index !== blockIndex) {
          return block;
        }
        const values = { ...(block.values ?? {}), [field]: value };
        return { ...block, values, label: getLabel(values) };
      }),
    );
  };

  const addBlockToProgram = (block: ProgrammingBlockDefinition) => {
    setProgram((current) => {
      const previous = current[current.length - 1];
      const createdBlock = createProgramBlock(block);
      return [
        ...current,
        {
          ...createdBlock,
          indent: previous?.isContainer
            ? Math.min(3, (previous.indent ?? 0) + 1)
            : previous?.indent ?? 0,
        },
      ];
    });
  };
  const hasBlock = (label: string) => program.some((block) => block.label === label);

  const renderProgramBlockContent = (
    block: ProgrammingBlockDefinition & { values?: Record<string, string> },
    index?: number,
  ) => {
    if (index === undefined || !block.values) {
      return <span>{block.label}</span>;
    }
    if ("speech" in block.values) {
      return (
        <span className="editable-block-line">
          Bizzy zegt
          <input
            aria-label="Tekst die Bizzy zegt"
            maxLength={80}
            placeholder="max. 10 woorden"
            value={block.values.speech}
            onChange={(event) =>
              updateProgramBlock(index, "speech", event.target.value, (values) =>
                `Bizzy zegt "${values.speech.trim()}"`,
              )
            }
          />
        </span>
      );
    }
    if ("meters" in block.values) {
      return (
        <span className="editable-block-line">
          verplaats Bizzy
          <input
            aria-label="Aantal meter"
            inputMode="numeric"
            value={block.values.meters}
            onChange={(event) =>
              updateProgramBlock(index, "meters", event.target.value, (values) =>
                `verplaats Bizzy ${values.meters.trim()} meter vooruit in ${values.seconds.trim()} sec.`,
              )
            }
          />
          meter vooruit in
          <input
            aria-label="Aantal seconden"
            inputMode="numeric"
            value={block.values.seconds}
            onChange={(event) =>
              updateProgramBlock(index, "seconds", event.target.value, (values) =>
                `verplaats Bizzy ${values.meters.trim()} meter vooruit in ${values.seconds.trim()} sec.`,
              )
            }
          />
          sec.
        </span>
      );
    }
    if ("degrees" in block.values) {
      return (
        <span className="editable-block-line">
          draai Bizzy naar
          <input
            aria-label="Aantal graden"
            inputMode="numeric"
            value={block.values.degrees}
            onChange={(event) =>
              updateProgramBlock(index, "degrees", event.target.value, (values) =>
                `draai Bizzy met de wijzers van de klok mee naar ${values.degrees.trim()} graden in ${values.seconds.trim()} sec.`,
              )
            }
          />
          graden in
          <input
            aria-label="Aantal seconden"
            inputMode="numeric"
            value={block.values.seconds}
            onChange={(event) =>
              updateProgramBlock(index, "seconds", event.target.value, (values) =>
                `draai Bizzy met de wijzers van de klok mee naar ${values.degrees.trim()} graden in ${values.seconds.trim()} sec.`,
              )
            }
          />
          sec.
        </span>
      );
    }
    if ("times" in block.values) {
      return (
        <span className="editable-block-line">
          Herhaal
          <input
            aria-label="Aantal herhalingen"
            inputMode="numeric"
            value={block.values.times}
            onChange={(event) =>
              updateProgramBlock(index, "times", event.target.value, (values) =>
                `herhaal ${values.times.trim()} keer`,
              )
            }
          />
          keer
        </span>
      );
    }
    if ("seconds" in block.values) {
      return (
        <span className="editable-block-line">
          wacht
          <input
            aria-label="Aantal seconden"
            inputMode="numeric"
            value={block.values.seconds}
            onChange={(event) =>
              updateProgramBlock(index, "seconds", event.target.value, (values) =>
                `wacht ${values.seconds.trim()} seconde`,
              )
            }
          />
          seconde
        </span>
      );
    }
    if ("animation" in block.values) {
      return (
        <span className="editable-block-line">
          verander animatie van Bizzy naar
          <select
            aria-label="Animatie"
            value={block.values.animation}
            onChange={(event) =>
              updateProgramBlock(index, "animation", event.target.value, (values) =>
                `verander animatie van Bizzy naar ${values.animation}`,
              )
            }
          >
            {animationOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </span>
      );
    }
    if ("sound" in block.values) {
      return (
        <span className="editable-block-line">
          speel geluid
          <select
            aria-label="Geluid"
            value={block.values.sound}
            onChange={(event) =>
              updateProgramBlock(index, "sound", event.target.value, (values) =>
                `speel geluid ${values.sound}`,
              )
            }
          >
            {soundOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </span>
      );
    }
    return <span>{block.label}</span>;
  };

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
      const speechMatch = label.match(/^Bizzy zegt "(.+)"$/);
      if (speechMatch) {
        effects.speech = speechMatch[1];
        effects.log.push(`Bizzy zegt: ${speechMatch[1]}`);
        return;
      }
      const moveMatch = label.match(/^verplaats Bizzy ([0-9]+) meter vooruit in ([0-9]+) sec\.$/);
      if (moveMatch) {
        const meters = Number(moveMatch[1]);
        effects.move += meters * nextMoveMultiplier;
        effects.log.push(`Bizzy beweegt ${meters * nextMoveMultiplier} meter vooruit.`);
        nextMoveMultiplier = 1;
        return;
      }
      if (label.includes("verplaats Bizzy 5 meters achteruit")) {
        effects.move -= 5;
        effects.log.push("Bizzy beweegt 5 meter achteruit.");
        return;
      }
      const turnMatch = label.match(/^draai Bizzy met de wijzers van de klok mee naar ([0-9]+) graden in ([0-9]+) sec\.$/);
      if (turnMatch) {
        effects.rotation = Number(turnMatch[1]);
        effects.log.push(`Bizzy draait naar ${turnMatch[1]} graden.`);
        return;
      }
      if (label.startsWith("verander animatie van Bizzy naar")) {
        const animationMode = label.replace("verander animatie van Bizzy naar ", "");
        effects.animationMode = animationMode;
        effects.animationPaused = animationMode.toLowerCase() === "niet animeren";
        effects.log.push(`De animatie van Bizzy staat op ${animationMode}.`);
        return;
      }
      const repeatMatch = label.match(/^herhaal ([0-9]+) keer$/);
      if (repeatMatch) {
        nextMoveMultiplier = Number(repeatMatch[1]);
        effects.log.push(`Herhaling ingesteld op ${repeatMatch[1]} keer.`);
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

  const playProgram = () => {
    setExecuted(true);
    const effects = executeProgram();
    setRunEffects(effects);
    if (effects.speech) {
      setSpeechVisible(true);
      window.setTimeout(() => setSpeechVisible(false), 2000);
    }
  };
  const resetProgramRun = () => {
    setExecuted(false);
    setSpeechVisible(false);
    setAPresses(0);
    setRunEffects(emptyProgramRunEffects);
  };
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

      <div className="block-programming-layout">
        <div className="program-stage">
          <div className={`program-canvas program-canvas-${task.device ?? "bizzy"}`}>
            {task.device === "microbit" ? (
              <div className="microbit-device">
                <div className="microbit-screen">{microbitDisplay}</div>
                <div className="microbit-buttons">
                  <button type="button" onClick={() => setAPresses((current) => current + 1)}>
                    A
                  </button>
                  <button type="button" onClick={() => setAPresses((current) => Math.max(0, current - 1))}>
                    B
                  </button>
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
              <div
                className={`bizzy-robot bizzy-${runEffects.animationMode.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  transform: `translateX(${runEffects.move * 54}px) rotate(${runEffects.rotation}deg)`,
                }}
              >
                {speechVisible ? <span className="speech-bubble">{runEffects.speech}</span> : null}
                <div className="bizzy-antenna" />
                <div className="bizzy-ears" aria-hidden="true">
                  <span />
                  <span />
                </div>
                <div className="bizzy-head">
                  <span className="bizzy-eye left" />
                  <span className="bizzy-eye right" />
                  <span className="bizzy-mouth" />
                </div>
                <div className="bizzy-body">
                  <span className="bizzy-panel" />
                </div>
                <div className="bizzy-arms" aria-hidden="true">
                  <span />
                  <span />
                </div>
                <div className="bizzy-feet" aria-hidden="true">
                  <span />
                  <span />
                </div>
              </div>
            )}
          </div>
          <div className="workspace-buttons">
            <button className="primary-button" type="button" onClick={playProgram}>
              Afspelen
            </button>
            <button className="ghost-button" type="button" onClick={resetProgramRun}>
              Reset
            </button>
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
              {runEffects.animationMode ? <span>Animatie: {runEffects.animationMode}</span> : null}
            </div>
          ) : null}
        </div>

        <div className="block-palette">
          <strong>Blokken</strong>
          {paletteBlocks.map((block) => (
            <button
              className={`program-block ${block.isContainer ? "container-block" : ""}`}
              key={block.label}
              style={blockStyle(block)}
              type="button"
              onClick={() => addBlockToProgram(block)}
            >
              {renderProgramBlockContent(block)}
              <small>{block.category}</small>
            </button>
          ))}
        </div>

        <div className="program-workspace">
          <div className="workspace-toolbar">
            <strong>Werkvlak</strong>
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                const startBlock = task.blocks.find((block) => block.label === startProgramBlockLabel);
                setProgram(startBlock ? [createProgramBlock(startBlock)] : []);
                resetProgramRun();
              }}
            >
              Leegmaken
            </button>
          </div>
          <div className="program-stack">
            {program.length === 0 ? <div className="empty-workspace">Klik blokken aan om ze toe te voegen.</div> : null}
            {program.map((block, index) => (
              <div
                className="program-row"
                key={`${block.label}-${index}`}
                style={{ paddingLeft: `${block.indent * 28}px` }}
              >
                <span
                  className={`program-block ${block.isContainer ? "container-block" : ""}`}
                  style={blockStyle(blockByLabel.get(block.label) ?? block)}
                >
                  {renderProgramBlockContent(block, index)}
                  <small>{block.category}</small>
                </span>
                <div className="row-tools">
                  <button
                    type="button"
                    onClick={() =>
                      setProgram((current) => current.filter((_, blockIndex) => blockIndex !== index))
                    }
                  >
                    Verwijderen
                  </button>
                </div>
              </div>
            ))}
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
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const editInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editingNodeId || !editInputRef.current) {
      return;
    }
    editInputRef.current.focus();
    editInputRef.current.select();
  }, [editingNodeId]);

  if (!item.fileTask || !state) {
    return null;
  }

  const selectedNode = selectedNodeId ? getNodeById(state.nodes, selectedNodeId) : null;
  const activeFolderId = contextFolderId;
  const activeFolder = getNodeById(state.nodes, activeFolderId);
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
    setEditingNodeId(selectedNodeId);
    setEditingName(selectedNode.name);
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
      setEditingNodeId(node.id);
      setEditingName(node.name);
    }
  };

  const commitEditingName = () => {
    if (!editingNodeId) {
      return;
    }
    const node = getNodeById(state.nodes, editingNodeId);
    setEditingNodeId(null);
    if (node && editingName.trim() && editingName.trim() !== node.name) {
      onChange(renameNode(state, editingNodeId, editingName));
    }
  };

  const handleEditingKey = (event: KeyboardEvent<HTMLInputElement>) => {
    event.stopPropagation();
    if (event.key === "Enter") {
      commitEditingName();
    }
    if (event.key === "Escape") {
      setEditingNodeId(null);
    }
  };

  const createNewItem = (newItem: NewExplorerItem) => {
    const nodeId = crypto.randomUUID();
    setNewMenuOpen(false);
    setSelectedNodeId(nodeId);
    setEditingNodeId(nodeId);
    setEditingName(newItem.defaultName);
    onChange(
      newItem.type === "folder"
        ? createFolder(state, activeFolderId, newItem.defaultName, nodeId)
        : createFile(state, activeFolderId, newItem.defaultName, nodeId),
    );
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
              <span className="command-icon command-icon-undo" aria-hidden="true" />
              Ongedaan maken
            </button>
            <div className="explorer-new-menu">
              <button
                className="explorer-command"
                type="button"
                aria-expanded={newMenuOpen}
                onClick={() => setNewMenuOpen((isOpen) => !isOpen)}
              >
                <span className="command-icon command-icon-new" aria-hidden="true" />
                Nieuw
                <span className="command-chevron" aria-hidden="true" />
              </button>
              {newMenuOpen ? (
                <div className="explorer-new-dropdown" role="menu">
                  {newExplorerItems.map((newItem) => (
                    <button
                      key={newItem.label}
                      type="button"
                      role="menuitem"
                      onClick={() => createNewItem(newItem)}
                    >
                      <span
                        className={`new-item-icon new-item-icon-${newItem.icon}`}
                        aria-hidden="true"
                      />
                      {newItem.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              className="explorer-command"
              type="button"
              disabled={!selectedNode?.parentId}
              onClick={() => selectedNodeId && setClipboard({ mode: "cut", nodeId: selectedNodeId })}
            >
              <span className="command-icon command-icon-cut" aria-hidden="true" />
              Knippen
            </button>
            <button
              className="explorer-command"
              type="button"
              disabled={!selectedNode?.parentId}
              onClick={() => selectedNodeId && setClipboard({ mode: "copy", nodeId: selectedNodeId })}
            >
              <span className="command-icon command-icon-copy" aria-hidden="true" />
              Kopiëren
            </button>
            <button
              className="explorer-command"
              type="button"
              disabled={!clipboardNode}
              onClick={pasteClipboard}
            >
              <span className="command-icon command-icon-paste" aria-hidden="true" />
              Plakken
            </button>
            <button
              className="explorer-command"
              type="button"
              disabled={!selectedNode?.parentId}
              onClick={renameSelectedNode}
            >
              <span className="command-icon command-icon-rename" aria-hidden="true" />
              Naam wijzigen
            </button>
            <button
              className="explorer-command"
              type="button"
              disabled={!selectedNode?.parentId}
              onClick={() => window.alert("Delen heb je voor deze opdracht niet nodig.")}
            >
              <span className="command-icon command-icon-share" aria-hidden="true" />
              Delen
            </button>
            <button
              className="explorer-command"
              type="button"
              disabled={!selectedNode?.parentId}
              onClick={deleteSelectedNode}
            >
              <span className="command-icon command-icon-delete" aria-hidden="true" />
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
              <div className="explorer-table" role="table" aria-label="Gesimuleerde Windows Verkenner">
                <div className="explorer-row explorer-header" role="row">
                  <span>Naam</span>
                  <span>Status</span>
                  <span>Gewijzigd op</span>
                  <span>Type</span>
                </div>
                {activeFolder ? (
                  activeItems.map((node) => (
                    <div
                      className={`explorer-row ${selectedNodeId === node.id ? "selected" : ""} ${
                        contextFolderId === node.id ? "active-target" : ""
                      }`}
                      key={node.id}
                      role="row"
                      tabIndex={0}
                      onClick={(event) => handleNodeClick(node, event.detail)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && node.type === "folder") {
                          setContextFolderId(node.id);
                          setSelectedNodeId(null);
                        }
                      }}
                      onDoubleClick={() => {
                        if (node.type === "folder") {
                          setContextFolderId(node.id);
                          setSelectedNodeId(null);
                        }
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
                        handleDrop(draggedId, node.id);
                      }}
                    >
                      <span className="explorer-name">
                        <span className={`explorer-icon explorer-icon-${node.type}`} aria-hidden="true" />
                        {editingNodeId === node.id ? (
                          <input
                            ref={editInputRef}
                            className="explorer-name-input"
                            value={editingName}
                            onChange={(event) => setEditingName(event.target.value)}
                            onClick={(event) => event.stopPropagation()}
                            onBlur={commitEditingName}
                            onKeyDown={handleEditingKey}
                            aria-label="Naam wijzigen"
                          />
                        ) : (
                          node.name
                        )}
                      </span>
                      <span className="explorer-status" aria-label="Gesynchroniseerd">*</span>
                      <span>25-4-2026 08:24</span>
                      <span>{getExplorerType(node)}</span>
                    </div>
                  ))
                ) : null}
              </div>
              {clipboard && clipboardNode ? (
                <div className="explorer-hint">
                  {`${clipboard.mode === "cut" ? "Geknipt" : "Gekopieerd"}: ${clipboardNode.name}. Kies een map en klik op Plakken.`}
                </div>
              ) : null}
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
  const totalTone = scoreTone(result.percentage);
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
    <section className="panel stack-lg">
      <div className="result-hero">
        <div
          className={`score-meter score-${totalTone}`}
          style={{ "--score-degrees": `${result.percentage * 3.6}deg` } as CSSProperties}
        >
          <div className="score-ring">
            <strong>{result.percentage}%</strong>
            <span>{result.totalScore} / {result.maxScore}</span>
          </div>
        </div>
        <div className="result-copy">
          <span className="section-tag">Afgerond</span>
          <h2>Resultaat nulmeting</h2>
          <p>
            Je score is {result.totalScore} van {result.maxScore} punten. De
            zelfinschatting telt niet mee in het eindresultaat.
          </p>
          <p>Sessie: {displayCode}</p>
          {selfAssessmentScore !== null && selfAssessmentDifference !== null ? (
            <p>
              Zelfinschatting: {selfAssessmentScore}/100. Verschil met je score:
              {" "}{selfAssessmentDifference.toFixed(1)} punten.
            </p>
          ) : null}
        </div>
      </div>
      <h3>Score per onderdeel</h3>
      <div className="result-grid">
        {result.blockScores.map((block) => {
          const percentage = scorePercentage(block.score, block.maxScore);
          return (
            <div
              className={`result-card score-card score-${scoreTone(percentage)}`}
              key={block.blockId}
            >
              <div className="score-card-heading">
                <strong>{studentBlockTitle(block.title)}</strong>
                <span className="score-number">{block.score} / {block.maxScore}</span>
              </div>
              <div className="result-bar" aria-label={`${percentage}%`}>
                <span className="result-bar-fill" style={{ width: `${percentage}%` }} />
              </div>
              <span>{percentage}%</span>
            </div>
          );
        })}
      </div>
      <div className="actions">
        <button className="primary-button" type="button" onClick={exportPdf}>
          Download PDF
        </button>
        <button className="secondary-button" type="button" onClick={onClose}>
          Test afsluiten
        </button>
      </div>
    </section>
  );
};

export default App;
