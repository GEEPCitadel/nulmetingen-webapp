import { SubmitAnswerPayload, shortSectionTitle } from "../app/shared";
import { SelfAssessmentView } from "../items/SelfAssessmentView";
import { FileTaskWorkspace } from "../items/FileTaskWorkspace";
import { MailTaskView } from "../items/MailTaskView";
import { InteractionTaskView } from "../items/InteractionTaskView";
import { ExcelDownloadTaskView } from "../items/ExcelDownloadTaskView";
import { OfficeFormatTaskView } from "../items/OfficeFormatTaskView";
import { PowerPointDesignTaskView } from "../items/PowerPointDesignTaskView";
import { FakeTeamsTask } from "../items/TeamsTask";
import { BlockProgrammingTaskView } from "../items/BlockProgrammingTaskView";
import { WhutsuppScenarioTask } from "../items/WhutsuppTask";
import { ChoiceItemView } from "../items/ChoiceItemView";
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


export const AssessmentScreen = ({
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
  onExit,
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
  onExit: () => void;
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
          onExit={onExit}
        />
      ) : null}

      {item.type === "outlook_mail_simulation" ? (
        <MailTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
          onExit={onExit}
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
          onExit={onExit}
        />
      ) : null}

      {item.type === "excel_download_task" ? (
        <ExcelDownloadTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
          onExit={onExit}
        />
      ) : null}

      {item.type === "office_format_download_task" ? (
        <OfficeFormatTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
          onExit={onExit}
        />
      ) : null}

      {item.type === "powerpoint_design_task" ? (
        <PowerPointDesignTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
          onExit={onExit}
        />
      ) : null}

      {item.type === "teams_share_simulation" ? (
        <FakeTeamsTask
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
          onExit={onExit}
        />
      ) : null}

      {item.type === "block_programming_task" ? (
        <BlockProgrammingTaskView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          onSubmit={onSubmitAnswer}
          onSkip={() => onSkipPerformanceTask(section, item)}
          onExit={onExit}
        />
      ) : null}

      {item.type === "social_action_simulation" ? (
        item.whutsuppTask ? (
          <WhutsuppScenarioTask
            assessment={assessment}
            section={section}
            item={item}
            questionNumber={questionNumber ?? 1}
            onSubmit={onSubmitAnswer}
            onSkip={() => onSkipPerformanceTask(section, item)}
            onExit={onExit}
          />
        ) : (
          <InteractionTaskView
            session={session}
            section={section}
            item={item}
            questionNumber={questionNumber ?? 1}
            task={item.socialTask}
            onSubmit={onSubmitAnswer}
            onSkip={() => onSkipPerformanceTask(section, item)}
            onExit={onExit}
          />
        )
      ) : null}

      {item.type === "multiple_choice" ? (
        <ChoiceItemView
          section={section}
          item={item}
          questionNumber={questionNumber ?? 1}
          presentedOrder={getPresentedOrder(session, section.id, item.id)}
          onSubmit={onSubmitAnswer}
          onExit={onExit}
        />
      ) : null}
      </div>
    </div>
  );
};

