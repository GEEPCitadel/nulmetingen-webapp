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


export const PowerPointDesignTaskView = ({
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
        onExit={onExit}
      />
    </section>
  );
};

