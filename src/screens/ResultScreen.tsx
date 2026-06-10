import { createPdfDocument, downloadFile } from "../app/shared";
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


export const scorePercentage = (score: number, maxScore: number) =>
  maxScore === 0 ? 0 : Math.round((score / maxScore) * 100);

export const scoreTone = (percentage: number) => {
  if (percentage >= 75) {
    return "good";
  }
  if (percentage >= 50) {
    return "okay";
  }
  return "low";
};

export const studentBlockTitle = (title: string) =>
  title.replace(/^PT\d+\s*-\s*/, "").replace("Meerkeuze", "Meerkeuzevragen");

export const LegacyResultScreen = ({
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

export const comparisonText = (scorePercent: number, selfPercent: number | null) => {
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

export const totalScoreExplanation =
  "Je score is het percentage punten dat je op deze nulmeting hebt behaald. Dit is geen cijfer en geen volledig oordeel over wat jij digitaal kunt.";
export const resultDisclaimer =
  "Dit is geen cijfer. Deze nulmeting geeft een eerste beeld van onderdelen van digitale geletterdheid.";

export const subgoalWarning =
  "Dit onderdeel is gebaseerd op een beperkt aantal vragen of taken. Zie dit als een eerste aanwijzing, niet als een volledig oordeel over wat je kunt.";

export const coreGoalText = (goal: GoalScore) => {
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

export const ResultScreen = ({
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
  const whutsuppFeedback =
    session.results.find((entry) => entry.itemId === "pt8-whutsupp-sam-video")
      ?.scoringSummary?.feedback ?? [];

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
      ...(whutsuppFeedback.length > 0
        ? ["", "Online gedrag", ...whutsuppFeedback]
        : []),
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

      {whutsuppFeedback.length > 0 ? (
        <section className="result-section">
          <h3>Online gedrag</h3>
          <div className="whutsupp-feedback-list">
            {whutsuppFeedback.map((feedback) => (
              <p key={feedback}>{feedback}</p>
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

