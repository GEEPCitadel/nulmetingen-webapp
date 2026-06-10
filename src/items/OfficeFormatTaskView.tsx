import { QuestionHeader, SubmitAnswerPayload } from "../app/shared";
import { TaskNavFooter } from "../components/TaskNavFooter";
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


export const OfficeFormatTaskView = ({
  section,
  item,
  questionNumber,
  onSubmit,
  onSkip,
  onExit,
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
  onSkip: () => void;
  onExit: () => void;
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
        onExit={onExit}
      />
    </section>
  );
};

