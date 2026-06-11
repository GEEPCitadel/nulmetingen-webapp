import { EXIT_CONFIRMATION_TEXT, EntryView, StudentLoginResponse, SubmitAnswerPayload, formatTime, getInitialStartContext, getThemeForSession, requestJson } from "./app/shared";
import { AppShell } from "./components/AppShell";
import { StudentStartScreen } from "./screens/StudentStartScreen";
import { AdminAccessScreen } from "./screens/AdminAccessScreen";
import { AdminScreen } from "./screens/AdminScreen";
import { AssessmentScreen } from "./screens/AssessmentScreen";
import { ResultScreen } from "./screens/ResultScreen";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  assessmentMapForMoment,
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
  rescoreSessionResults,
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
  MeasurementMoment,
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
} from "./types";


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
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);

  const [finalizeState, setFinalizeState] = useState<"idle" | "pending" | "done" | "error">(
    "idle",
  );

  const activeAssessment = session ? getAssessment(session) : null;
  const activeTheme = getThemeForSession(session, entryView);
  const steps = activeAssessment ? getStepDescriptors(activeAssessment) : [];
  const currentStep = session ? steps[session.currentStepIndex] ?? null : null;
  const result =
    session && activeAssessment && session.completedAt && finalizeState === "done"
      ? calculateResult(session, activeAssessment)
      : null;

  // Multiple-choice-items worden server-side gescoord; bij afronden haalt de
  // client de herscoorde resultaten op via /api/finalize.
  useEffect(() => {
    if (!session?.completedAt || finalizeState !== "idle") {
      return;
    }
    let cancelled = false;
    setFinalizeState("pending");
    void (async () => {
      try {
        const data = await requestJson<{ results: AssessmentSession["results"] }>(
          "/api/finalize",
          { method: "POST", body: JSON.stringify({ session }) },
        );
        if (cancelled) return;
        setSession((current) => (current ? { ...current, results: data.results } : current));
        setFinalizeState("done");
      } catch {
        if (import.meta.env.DEV) {
          // Lokale ontwikkeling zonder API: herscoor met de volledige data.
          // Deze tak wordt door Vite uit de productiebundel verwijderd.
          try {
            const { assessmentMapForMoment: fullMapForMoment } = await import(
              "./data/assessments.server"
            );
            const fullAssessment = session
              ? fullMapForMoment(session.measurementMoment)[session.versionId]
              : undefined;
            if (!cancelled && session && fullAssessment) {
              const rescored = rescoreSessionResults(session, fullAssessment);
              setSession((current) =>
                current ? { ...current, results: rescored.results } : current,
              );
              setFinalizeState("done");
              return;
            }
          } catch {
            // val door naar foutstatus
          }
        }
        if (!cancelled) setFinalizeState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session, finalizeState]);

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

      const measurementMoment: MeasurementMoment =
        data.student.measurementMoment === "voortgangsmeting"
          ? "voortgangsmeting"
          : "nulmeting";
      const assessment = assessmentMapForMoment(measurementMoment)[data.student.versionId];
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
      setSession(
        createSession(assessment, data.student.accessCode, metadata, measurementMoment),
      );
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
    setFinalizeState("idle");
    setEntryView("intro");
    setStartContext(getInitialStartContext());
    setPrivacyConsent(false);
    setLearnerCodeError("");
    setAdminCode("");
    setAdminError("");
    setExitConfirmOpen(false);
  };

  const exitAssessment = () => {
    setExitConfirmOpen(true);
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
          onExit={exitAssessment}
        />
      ) : null}

      {session && session.completedAt && !result ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal-card" role="dialog" aria-modal="true" aria-live="polite">
            {finalizeState === "error" ? (
              <>
                <h3>Resultaat ophalen mislukt</h3>
                <p>Controleer de internetverbinding en probeer het opnieuw.</p>
                <button
                  className="task-nav-primary"
                  type="button"
                  onClick={() => setFinalizeState("idle")}
                >
                  Opnieuw proberen
                </button>
              </>
            ) : (
              <>
                <h3>Resultaat berekenen…</h3>
                <p>Een ogenblik geduld.</p>
              </>
            )}
          </div>
        </div>
      ) : null}

      {session && activeAssessment && result && session.completedAt ? (
        <ResultScreen assessment={activeAssessment} session={session} onClose={resetSession} />
      ) : null}

      {exitConfirmOpen ? (
        <div className="modal-backdrop exit-confirm-backdrop" role="presentation">
          <div
            className="modal-card exit-confirm-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-confirm-title"
          >
            <h3 id="exit-confirm-title">Afsluiten</h3>
            <p>{EXIT_CONFIRMATION_TEXT}</p>
            <div className="exit-confirm-actions">
              <button
                className="task-nav-skip"
                type="button"
                onClick={() => setExitConfirmOpen(false)}
              >
                Annuleren
              </button>
              <button
                className="task-nav-primary"
                type="button"
                onClick={resetSession}
              >
                Afsluiten en naar startscherm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
};


export default App;
