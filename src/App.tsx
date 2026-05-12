import type { CSSProperties, ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  ADMIN_CODE,
  assessmentMap,
  defaultCodeMappings,
  themes,
} from "./data/assessments";
import {
  calculateResult,
  completeSession,
  createSession,
  findAssessmentForCode,
  getAssessment,
  getItemByStep,
  getMappingCodes,
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
  readCodeMappings,
  saveActiveSession,
  saveCodeMappings,
} from "./lib/storage";
import type {
  AssessmentItem,
  AssessmentSection,
  AssessmentSession,
  AssessmentVersion,
  CodeMapping,
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

const defaultTheme = themes.skyOrange;

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
  const [codeMappings, setCodeMappings] = useState<CodeMapping[]>(() =>
    readCodeMappings(),
  );
  const [learnerCode, setLearnerCode] = useState("");
  const [learnerCodeError, setLearnerCodeError] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [adminError, setAdminError] = useState("");
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
  }, [session]);

  useEffect(() => {
    saveCodeMappings(codeMappings);
  }, [codeMappings]);

  useEffect(() => {
    setStepStartedAt(Date.now());
  }, [currentStep?.key]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const startAssessment = () => {
    const assessment = findAssessmentForCode(learnerCode, codeMappings);
    if (!assessment) {
      setLearnerCodeError("Deze code is niet bekend. Vraag om hulp.");
      return;
    }

    const metadata: SessionMetadata = {
      learnerCode: learnerCode.trim(),
      anonymousCode: learnerCode.trim(),
    };

    setSession(createSession(assessment, learnerCode.trim(), metadata));
    setLearnerCodeError("");
  };

  const unlockAdmin = () => {
    if (adminCode.trim().toLowerCase() !== ADMIN_CODE) {
      setAdminError("De beheercode klopt niet.");
      return;
    }

    setAdminError("");
    setAdminCode("");
    setEntryView("admin");
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
                ? "Pas per leerjaar de leerlingcodes aan. Alles blijft lokaal in deze browser bewaard."
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
          error={learnerCodeError}
          onLearnerCodeChange={(value) => {
            setLearnerCode(value);
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
          mappings={codeMappings}
          onChange={setCodeMappings}
          onBack={() => setEntryView("intro")}
          onRestoreDefaults={() => setCodeMappings(defaultCodeMappings)}
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
  error,
  onLearnerCodeChange,
  onStart,
  onOpenAdmin,
}: {
  learnerCode: string;
  error: string;
  onLearnerCodeChange: (value: string) => void;
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
      <span>Leerlingcode</span>
      <input
        value={learnerCode}
        onChange={(event) => onLearnerCodeChange(event.target.value)}
        placeholder="Vul je leerlingcode in"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onStart();
          }
        }}
      />
    </label>
    {error ? <div className="error-banner">{error}</div> : null}
    <div className="actions start-actions">
      <button className="primary-button" type="button" onClick={onStart}>
        Start
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
  onCodeChange,
  onUnlock,
  onBack,
}: {
  code: string;
  error: string;
  onCodeChange: (value: string) => void;
  onUnlock: () => void;
  onBack: () => void;
}) => (
  <section className="panel compact-panel">
    <div className="stack-sm">
      <span className="section-tag">Beheer</span>
      <h2>Voer de beheercode in</h2>
      <p>Met de beheercode open je de lokale omgeving voor leerlingcodes.</p>
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
      <button className="primary-button" type="button" onClick={onUnlock}>
        Open beheer
      </button>
      <button className="ghost-button" type="button" onClick={onBack}>
        Terug naar leerlingstart
      </button>
    </div>
  </section>
);

const AdminScreen = ({
  mappings,
  onChange,
  onBack,
  onRestoreDefaults,
}: {
  mappings: CodeMapping[];
  onChange: (mappings: CodeMapping[]) => void;
  onBack: () => void;
  onRestoreDefaults: () => void;
}) => {
  const updateCodes = (instrumentId: CodeMapping["instrumentId"], nextValue: string) => {
    const codes = nextValue
      .split(/[\n,;]/)
      .map((code) => code.trim())
      .filter(Boolean);
    onChange(
      mappings.map((mapping) =>
        mapping.instrumentId === instrumentId ? { ...mapping, codes } : mapping,
      ),
    );
  };

  return (
    <section className="panel stack-lg">
      <div className="stack-sm">
        <span className="section-tag">Beheer</span>
        <h2>Leerlingcodes per leerjaar</h2>
        <p>
          Plak per leerjaar de leerlingcodes. Eentje per regel werkt het duidelijkst.
          De beheercode blijft vast op <strong>{ADMIN_CODE}</strong>.
        </p>
      </div>
      <div className="admin-list">
        {defaultCodeMappings.map((defaultMapping) => {
          const current = mappings.find(
            (mapping) => mapping.instrumentId === defaultMapping.instrumentId,
          );
          return (
            <div className="admin-row compact-admin-row" key={defaultMapping.instrumentId}>
              <div className="admin-label">
                <strong>{defaultMapping.label}</strong>
                <span>{assessmentMap[defaultMapping.instrumentId].level}</span>
              </div>
              <textarea
                value={getMappingCodes(current ?? defaultMapping).join("\n")}
                onChange={(event) =>
                  updateCodes(defaultMapping.instrumentId, event.target.value)
                }
                placeholder={defaultMapping.codes.join("\n")}
              />
            </div>
          );
        })}
      </div>
      <div className="actions">
        <button className="secondary-button" type="button" onClick={onRestoreDefaults}>
          Standaardcodes herstellen
        </button>
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
    field === "to" ? "AAN" : field === "cc" ? "CC" : "BCC";
  const fieldVisible = (field: AddressField) =>
    field === "to" ||
    field === "cc" ||
    (field === "bcc" && (draft.bccVisible || draft.bcc.length > 0));
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
              {task.contacts.map((contact) => (
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
              {task.files.map((file) => (
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
  if (!task) {
    return null;
  }

  const setGroupValue = (groupId: string, value: unknown) => {
    setState((current) => ({ ...current, [groupId]: value }));
  };

  const submit = () =>
    onSubmit({
      section,
      item,
      selectedAnswer: state,
      shownOptionOrder: [],
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
              group={group}
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

        <div className="fake-teams-content">
          <aside className="fake-teams-side">
            <strong>Vergadering</strong>
            <span>Nu bezig</span>
            <div className="fake-participant active">Leerling Anoniem</div>
            <div className="fake-participant">Docent</div>
          </aside>

          <div className="fake-teams-main">
            <div className="fake-teams-stage">
              <div className="fake-video-tile learner">
                <div className="fake-avatar">LA</div>
                <span>Leerling Anoniem</span>
              </div>
              <div className="fake-video-tile muted">
                <div className="fake-avatar small">D</div>
                <span>Docent</span>
              </div>
            </div>

            {state.shareOpened ? (
              <div className="fake-share-menu" role="menu" aria-label="Deelmenu">
                <strong>Delen</strong>
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
          </div>
        </div>

        <div className="fake-teams-toolbar">
          {task.buttons.map((button) => (
            <button
              className={button === "Delen" && state.shareOpened ? "active" : ""}
              key={button}
              type="button"
              onClick={() => {
                if (button === "Delen") {
                  logAction("clicked_share", { shareOpened: true, windowPickerOpen: false });
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
  const task = item.blockTask;
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
                className="bizzy-robot"
                style={{
                  transform: `translateX(${runEffects.move * 54}px) rotate(${runEffects.rotation}deg)`,
                }}
              >
                {speechVisible ? <span className="speech-bubble">Hoi!</span> : null}
                <div className="bizzy-head" />
                <div className="bizzy-body" />
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
              {runEffects.animationPaused ? <span>Animatie: niet animeren</span> : null}
            </div>
          ) : null}
        </div>

        <div className="block-palette">
          <strong>Blokken</strong>
          {task.blocks.map((block) => (
            <button
              className={`program-block ${block.isContainer ? "container-block" : ""}`}
              key={block.label}
              style={blockStyle(block)}
              type="button"
              onClick={() => addBlockToProgram(block)}
            >
              <span>{block.label}</span>
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
                setProgram([]);
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
                  <span>{block.label}</span>
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

  if (!item.fileTask || !state) {
    return null;
  }

  const selectedNode = selectedNodeId ? getNodeById(state.nodes, selectedNodeId) : null;
  const activeFolderId =
    selectedNode?.type === "folder" ? selectedNode.id : contextFolderId;
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
    const nextName = window.prompt("Nieuwe naam:", selectedNode.name);
    if (nextName) {
      onChange(renameNode(state, selectedNodeId, nextName));
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
              <div className="explorer-table" role="table" aria-label="Gesimuleerde Windows Verkenner">
                <div className="explorer-row explorer-header" role="row">
                  <span>Naam</span>
                  <span>Status</span>
                  <span>Gewijzigd op</span>
                  <span>Type</span>
                </div>
                {activeFolder ? (
                  activeItems.map((node) => (
                    <button
                      className={`explorer-row ${selectedNodeId === node.id ? "selected" : ""} ${
                        contextFolderId === node.id ? "active-target" : ""
                      }`}
                      key={node.id}
                      type="button"
                      role="row"
                      onClick={() => {
                        setSelectedNodeId(node.id);
                        if (node.type === "folder") {
                          setContextFolderId(node.id);
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
                        {node.name}
                      </span>
                      <span className="explorer-status" aria-label="Gesynchroniseerd">*</span>
                      <span>25-4-2026 08:24</span>
                      <span>{getExplorerType(node)}</span>
                    </button>
                  ))
                ) : null}
              </div>
              <div className="explorer-hint">
                {clipboard && clipboardNode
                  ? `${clipboard.mode === "cut" ? "Geknipt" : "Gekopieerd"}: ${clipboardNode.name}. Kies een map en klik op Plakken.`
                  : "Tip: kies eerst een bestand of map. Gebruik daarna de knoppen bovenaan."}
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
