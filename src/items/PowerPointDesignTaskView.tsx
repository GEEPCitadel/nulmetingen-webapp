import { useState } from "react";
import { QuestionHeader, SubmitAnswerPayload, shuffleItems } from "../app/shared";
import { TaskNavFooter } from "../components/TaskNavFooter";
import type { AssessmentItem, AssessmentSection } from "../types";

/**
 * PT9 maaktaak: leerling bouwt een digitaal product (dia of poster) op
 * volgens ontwerpeisen. Keuzegroepen: title / image / source.
 * Live preview toont het product. Scoring via scorePowerPointTask.
 */
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
  const task = item.powerPointTask;
  const [state, setState] = useState<Record<string, string>>({});
  const [groups] = useState(() =>
    (task?.groups ?? []).map((group) => ({
      ...group,
      options: shuffleItems(group.options),
    })),
  );
  if (!task) {
    return null;
  }
  const isPoster = task.format === "poster";

  const selectedLabel = (groupId: string) => {
    const group = groups.find((candidate) => candidate.id === groupId);
    return group?.options.find((option) => option.id === state[groupId])?.label ?? "";
  };

  const shownOptionOrder = groups.flatMap((group) =>
    group.options.map((option) => option.id),
  );

  const controls = (
    <div className="powerpoint-controls">
      <p>{task.scenario}</p>
      {groups.map((group) => (
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
  );

  const previewZones = (
    <>
      <div className={isPoster ? "poster-title" : "slide-title"}>
        {selectedLabel("title") || "Titel"}
      </div>
      <div className={isPoster ? "poster-image-placeholder" : "slide-image-placeholder"}>
        {selectedLabel("image") || "Beeld"}
      </div>
      <div className={isPoster ? "poster-footer" : "slide-footer"}>
        {selectedLabel("source") || "Bronvermelding"}
      </div>
    </>
  );

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      />

      <div className="powerpoint-window">
        <div className="powerpoint-titlebar">
          {isPoster ? "Posterontwerper - Poster1" : "PowerPoint - Presentatie1"}
        </div>
        <div className="powerpoint-ribbon">
          {(isPoster
            ? ["Tekst", "Afbeelding", "Vormen", "Achtergrond", "Bestand"]
            : ["Start", "Invoegen", "Ontwerpen", "Overgangen", "Diavoorstelling", "Bestand"]
          ).map((tab) => (
            <span key={tab}>{tab}</span>
          ))}
        </div>
        <div className="powerpoint-task-layout">
          {controls}
          {isPoster ? (
            <div className="poster-preview">
              <div className="poster-canvas">{previewZones}</div>
            </div>
          ) : (
            <div className="powerpoint-preview">
              <div className="slide-thumbnail">1</div>
              <div className="slide-canvas">{previewZones}</div>
            </div>
          )}
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
            shownOptionOrder,
          })
        }
        onSkip={onSkip}
        onExit={onExit}
      />
    </section>
  );
};
