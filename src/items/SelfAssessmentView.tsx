import { QuestionHeader, SubmitAnswerPayload } from "../app/shared";
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


export const SelfAssessmentView = ({
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

