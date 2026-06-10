import { QuestionHeader, SubmitAnswerPayload } from "../app/shared";
import { MockupCardView } from "./Mockups";
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


export const ChoiceItemView = ({
  section,
  item,
  questionNumber,
  presentedOrder,
  onSubmit,
  onExit,
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  presentedOrder: string[];
  onSubmit: (payload: SubmitAnswerPayload) => void;
  onExit: () => void;
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

  useEffect(() => {
    setSelectedIds([]);
  }, [item.id]);

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
        <button className="task-nav-exit" type="button" onClick={onExit}>
          Afsluiten
        </button>
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

