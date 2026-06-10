import { QuestionHeader, SubmitAnswerPayload, UNKNOWN_OPTION_LABEL } from "../app/shared";
import { SocialChatMockup } from "./WhutsuppTask";
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


export const InteractionTaskView = ({
  session,
  section,
  item,
  questionNumber,
  task,
  onSubmit,
  onSkip,
  onExit,
}: {
  session: AssessmentSession;
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  task: AssessmentItem["securityTask"] | AssessmentItem["socialTask"];
  onSubmit: (payload: SubmitAnswerPayload) => void;
  onSkip: () => void;
  onExit: () => void;
}) => {
  const [state, setState] = useState<Record<string, unknown>>({});
  if (!task) {
    return null;
  }

  const orderFor = (
    screenId: string,
    group: InteractionGroup,
    kind: "cards" | "options",
  ) =>
    getPresentedInteractionOrder(
      session,
      section.id,
      item.id,
      screenId,
      group.id,
      kind,
    );
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
  const shownOptionOrder = task.screens.flatMap((screen) =>
    screen.groups.flatMap((group) => [
      ...orderFor(screen.id, group, "cards"),
      ...orderFor(screen.id, group, "options"),
    ]),
  );

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
  const isSocialTask = item.type === "social_action_simulation";
  const isAiChatTask = item.mockup?.mediaHint === "Niet-interactieve AI-chatmock-up";
  const renderScreen = (screen: typeof task.screens[number]) => (
    <div className="interaction-screen" key={screen.id}>
      {!isAiChatTask ? (
        <div className="stack-xs">
          <strong>{screen.title}</strong>
          <p>{screen.instruction}</p>
          {!isSocialTask && screen.body ? <div className="notice-banner">{screen.body}</div> : null}
        </div>
      ) : null}
      {screen.emailStimulus ? <IncomingMailStimulusView email={screen.emailStimulus} /> : null}
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
  );

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      />

      {isSocialTask ? (
        <div className="social-chat-task">
          <SocialChatMockup title={item.title} screens={task.screens} mockup={item.mockup} />
          <div className="social-question-stack">
            {task.screens.map(renderScreen)}
          </div>
        </div>
      ) : (
        <div className="task-screen-grid">
          {task.screens.map(renderScreen)}
        </div>
      )}

      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Volgende"
        onPrimary={submit}
        onSkip={onSkip}
        onExit={onExit}
      />
    </section>
  );
};

export const IncomingMailStimulusView = ({ email }: { email: IncomingMailStimulus }) => (
  <div className="mail-shell incoming-mail-shell" aria-label="E-mailbericht">
    <div className="mail-main">
      <div className="mail-titlebar">E-mail</div>
      <div className="mail-tabs" aria-label="Menubalk">
        {["Bestand", "Bericht", "Invoegen", "Opties"].map((tab) => (
          <span key={tab} className={tab === "Bericht" ? "active" : ""}>{tab}</span>
        ))}
      </div>
      <div className="mail-ribbon">
        <div className="mail-ribbon-group">
          {["Beantwoorden", "Doorsturen", "Verwijderen", "Markeren"].map((button) => (
            <button className="rb rb-readonly" type="button" disabled key={button}>
              {button}
            </button>
          ))}
        </div>
      </div>
      <div className="incoming-mail-header">
        <div className="incoming-mail-avatar" aria-hidden="true">
          {email.fromName.slice(0, 2).toUpperCase()}
        </div>
        <div className="incoming-mail-meta">
          <strong>{email.subject}</strong>
          <span>
            Van: {email.fromName} &lt;{email.fromEmail}&gt;
          </span>
          <span>Aan: {email.toEmail}</span>
        </div>
        <time>{email.date}</time>
      </div>
      {email.attachments && email.attachments.length > 0 ? (
        <div className="mail-attachments mail-attachments-inline incoming-attachments">
          <span className="classic-paperclip" aria-hidden="true" />
          {email.attachments.map((attachment) => (
            <span className="attach-chip" key={attachment}>
              <span className="file-pic">{attachment.split(".").pop()?.toUpperCase().slice(0, 4) ?? "FILE"}</span>
              <span className="attach-name">{attachment}</span>
            </span>
          ))}
        </div>
      ) : null}
      <div className="mail-body-area incoming-mail-body">
        {email.body.map((line) => (
          <p key={line}>{line}</p>
        ))}
        {email.linkLabel && email.linkUrl ? (
          <div className="incoming-link-block">
            <span>{email.linkLabel}</span>
            <code>{email.linkUrl}</code>
          </div>
        ) : null}
      </div>
    </div>
  </div>
);

export const InteractionGroupControl = ({
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
  const isExclusiveOption = (option: Option) =>
    option.exclusive === true ||
    option.unknown === true ||
    option.id.endsWith("-unknown") ||
    option.label.trim().replace(/\.$/, "").toLowerCase() ===
      UNKNOWN_OPTION_LABEL.replace(/\.$/, "").toLowerCase();
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
                  const contentSelected = selectedMulti.filter((id) => {
                    const selectedOption = group.options?.find((entry) => entry.id === id);
                    return selectedOption ? !isExclusiveOption(selectedOption) : true;
                  });
                  if (isExclusiveOption(option)) {
                    onChange(selected ? [] : [option.id]);
                    return;
                  }
                  if (selected) {
                    onChange(contentSelected.filter((id) => id !== option.id));
                    return;
                  }
                  if (group.maxSelections && contentSelected.length >= group.maxSelections) {
                    return;
                  }
                  onChange([...contentSelected, option.id]);
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

