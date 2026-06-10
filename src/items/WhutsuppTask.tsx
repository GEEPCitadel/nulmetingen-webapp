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


export const splitMessageLines = (text?: string) =>
  (text ?? "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

export const shuffleChoiceIds = (choices: WhutsuppChoice[]) => {
  const pinned = choices.filter(
    (choice) => choice.choiceId === "unknown" || choice.label.trim().toLowerCase() === "ik weet het niet.",
  );
  const randomized = choices.filter((choice) => !pinned.includes(choice));
  for (let index = randomized.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [randomized[index], randomized[randomIndex]] = [randomized[randomIndex], randomized[index]];
  }
  return [...randomized, ...pinned].map((choice) => choice.choiceId);
};

export const WhutsuppVideoCard = ({ assetPath }: { assetPath?: string }) => (
  <div className="whutsupp-video-card" aria-label="Fictieve video plein_video.mp4">
    <img src={assetPath ?? "/assets/pt8/whutsupp_sam_video_card.svg"} alt="" />
  </div>
);

export const WhutsuppMessageBubble = ({
  message,
  assetPath,
}: {
  message: WhutsuppMessage;
  assetPath?: string;
}) => {
  const outgoing = message.side === "right";
  return (
    <div className={`whutsupp-message-row ${outgoing ? "right" : "left"}`}>
      <div className={`whutsupp-bubble ${outgoing ? "outgoing" : "incoming"}`}>
        {message.sender ? <span className="whutsupp-sender">{message.sender}</span> : null}
        {message.kind === "videoCard" ? (
          <WhutsuppVideoCard assetPath={assetPath} />
        ) : (
          <span>{message.text}</span>
        )}
        {message.timestamp ? <small className="whutsupp-time">{message.timestamp}</small> : null}
      </div>
    </div>
  );
};

export const whutsuppChoiceChatText = (label: string) => {
  const quotedMessage = label.match(/[\u2018\u201C"']([^"'\u2018\u2019\u201C\u201D]+)[\u2019\u201D"']/);
  if (quotedMessage?.[1]) {
    return quotedMessage[1].trim();
  }

  const reaction = label.match(/^Ik (?:zet|reageer met)\s+(.+?)(?:,| maar|$)/i);
  if (reaction?.[1]) {
    return reaction[1].trim();
  }

  return label
    .replace(/^Ik\s+(?:stuur|zeg|adviseer|vraag|deel|zet|reageer)\s*(?:Sam)?\s*:?\s*/i, "")
    .trim();
};

export const WhutsuppScenarioTask = ({
  assessment,
  section,
  item,
  questionNumber,
  onSubmit,
  onSkip,
  onExit,
}: {
  assessment: AssessmentVersion;
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
  onSkip: () => void;
  onExit: () => void;
}) => {
  const variant = item.whutsuppTask;
  const [nodeIndex, setNodeIndex] = useState(0);
  const [path, setPath] = useState<WhutsuppPathEntry[]>([]);
  const [recoveryEntry, setRecoveryEntry] = useState<WhutsuppPathEntry | null>(null);
  const threadRef = useRef<HTMLDivElement | null>(null);
  const [choiceOrderByNode] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(
      (variant?.nodes ?? []).flatMap((node) => [
        [node.nodeId, shuffleChoiceIds(node.choices)],
        [`${node.nodeId}:recovery`, node.recovery ? shuffleChoiceIds(node.recovery.choices) : []],
      ]),
    ),
  );

  if (!variant) {
    return null;
  }

  const node = variant.nodes[nodeIndex];
  const currentChoices = recoveryEntry && node.recovery ? node.recovery.choices : node.choices;
  const currentOrder = choiceOrderByNode[recoveryEntry ? `${node.nodeId}:recovery` : node.nodeId] ?? [];
  const orderedChoices = (currentOrder.length > 0 ? currentOrder : currentChoices.map((choice) => choice.choiceId))
    .map((choiceId) => currentChoices.find((choice) => choice.choiceId === choiceId))
    .filter(Boolean) as WhutsuppChoice[];

  const submittedMessages = path.flatMap((entry) => {
    const previousNode = variant.nodes.find((candidate) => candidate.nodeId === entry.nodeId);
    const choice = previousNode?.choices.find((candidate) => candidate.choiceId === entry.choiceId);
    const recoveryChoice = previousNode?.recovery?.choices.find(
      (candidate) => candidate.choiceId === entry.recoveryChoiceId,
    );
    return [
      ...(previousNode?.messages ?? []),
      choice ? { kind: "text" as const, sender: "Jij", text: whutsuppChoiceChatText(choice.label), side: "right" as const } : null,
      recoveryChoice
        ? { kind: "text" as const, sender: "Jij", text: whutsuppChoiceChatText(recoveryChoice.label), side: "right" as const }
        : null,
    ].filter(Boolean) as WhutsuppMessage[];
  });
  const activeMessages = recoveryEntry ? [
    ...node.messages,
    {
      kind: "text" as const,
      sender: "Jij",
      text: whutsuppChoiceChatText(node.choices.find((choice) => choice.choiceId === recoveryEntry.choiceId)?.label ?? ""),
      side: "right" as const,
    },
    { kind: "text" as const, sender: "Elin", text: "Misschien kun je nog bijsturen.", side: "left" as const },
  ] : node.messages;
  const visibleMessages = [...submittedMessages, ...activeMessages];

  useEffect(() => {
    const thread = threadRef.current;
    if (!thread) {
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      thread.scrollTop = thread.scrollHeight;
    });
    return () => window.cancelAnimationFrame(frameId);
  }, [nodeIndex, path.length, recoveryEntry?.choiceId, visibleMessages.length]);

  const finish = (nextPath: WhutsuppPathEntry[]) => {
    onSubmit({
      section,
      item,
      selectedAnswer: {
        assessmentId: assessment.id,
        variantId: variant.assessmentId,
        path: nextPath,
        choiceOrderByNode,
      },
      shownOptionOrder: Object.values(choiceOrderByNode).flat(),
    });
  };

  const choose = (choice: WhutsuppChoice) => {
    if (recoveryEntry) {
      const nextPath = [
        ...path,
        {
          ...recoveryEntry,
          recoveryChoiceId: choice.choiceId,
        },
      ];
      setRecoveryEntry(null);
      if (nodeIndex >= variant.nodes.length - 1) {
        finish(nextPath);
        return;
      }
      setPath(nextPath);
      setNodeIndex((current) => current + 1);
      return;
    }

    const entry: WhutsuppPathEntry = {
      nodeId: node.nodeId,
      category: node.category,
      choiceId: choice.choiceId,
    };
    const flags = choice.flags ?? [];
    const needsRecovery = Boolean(
      node.recovery?.triggerFlags.some((flag) => flags.includes(flag)),
    );
    if (needsRecovery) {
      setRecoveryEntry(entry);
      return;
    }
    const nextPath = [...path, entry];
    if (nodeIndex >= variant.nodes.length - 1) {
      finish(nextPath);
      return;
    }
    setPath(nextPath);
    setNodeIndex((current) => current + 1);
  };

  return (
    <section className="panel stack-lg whutsupp-task">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={variant.introText}
      />
      <div className="whutsupp-scenario-grid">
        <div className="whutsupp-phone" aria-label="Whutsupp groepschat">
          <div className="whutsupp-top">
            <span className="whutsupp-back" aria-hidden="true">‹</span>
            <span className="whutsupp-avatar" aria-hidden="true">W</span>
            <div>
              <strong>Whutsupp</strong>
              <small>{variant.groupTitle}</small>
            </div>
          </div>
          <div className="whutsupp-thread" ref={threadRef}>
            {visibleMessages.map((message, index) => (
              <WhutsuppMessageBubble
                key={`${message.sender ?? "bericht"}-${message.kind}-${message.text ?? message.assetKey ?? index}-${index}`}
                message={message}
                assetPath="/assets/pt8/whutsupp_sam_video_card.svg"
              />
            ))}
          </div>
          <div className="whutsupp-compose" aria-hidden="true">
            <span>Bericht</span>
            <button type="button" tabIndex={-1}>+</button>
          </div>
        </div>
        <div className="whutsupp-decision-panel">
          <div className="whutsupp-step-meta">
            <span>Moment {nodeIndex + 1} van {variant.nodes.length}</span>
          </div>
          <h3>{recoveryEntry && node.recovery ? node.recovery.prompt : node.prompt}</h3>
          <div className="whutsupp-choice-list">
            {orderedChoices.map((choice) => (
              <button
                key={choice.choiceId}
                type="button"
                className="choice-card whutsupp-choice"
                onClick={() => choose(choice)}
              >
                <span>{choice.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Kies een antwoord"
        onPrimary={() => undefined}
        primaryDisabled
        onSkip={onSkip}
        onExit={onExit}
      />
    </section>
  );
};

export const SocialChatMockup = ({
  title,
  screens,
  mockup,
}: {
  title: string;
  screens: NonNullable<AssessmentItem["socialTask"]>["screens"];
  mockup?: AssessmentItem["mockup"];
}) => {
  const isAiChat = mockup?.mediaHint === "Niet-interactieve AI-chatmock-up" || screens.some((screen) => /KletsGPT|AI-chat/i.test(screen.body ?? screen.title));
  const messages = mockup?.chatMessages?.length
    ? mockup.chatMessages
    : screens.flatMap((screen) => {
    const lines = splitMessageLines(screen.body || screen.instruction);
    return (lines.length > 0 ? lines : [screen.title]).map((line) => ({
      sender: "student" as const,
      label: "Leerling",
      text: line,
    }));
  });
  const visibleMessages = messages.length > 0
    ? messages
    : [{ sender: "student" as const, label: "Leerling", text: "Bekijk de situatie en kies de veiligste reactie." }];

  return (
    <div className={`whutsupp-phone ${isAiChat ? "ai-chat-phone" : ""}`} aria-label={isAiChat ? "KletsGPT-chatmock-up" : "Whutsupp groepschat"}>
      <div className="whutsupp-top">
        <span className="whutsupp-back" aria-hidden="true">{isAiChat ? "AI" : "<"}</span>
        <span className="whutsupp-avatar" aria-hidden="true">{isAiChat ? "AI" : "DG"}</span>
        <div>
          <strong>{isAiChat ? "KletsGPT" : title.includes("groepschat") ? "Klasgroep" : "Whutsupp"}</strong>
          <small>{isAiChat ? "chatvoorbeeld" : "online"}</small>
        </div>
      </div>
      <div className="whutsupp-thread">
        {visibleMessages.map((message, index) => {
          const isAiResponse = isAiChat && message.sender === "ai";
          const isStudentPrompt = isAiChat && message.sender === "student";
          const isSam = !isAiChat && /sam|noor|haal weg|stop|wil dit niet/i.test(message.text);
          const isQuoted = /^["]/.test(message.text);
          return (
            <div
              className={`whutsupp-bubble ${isAiResponse ? "incoming ai-response" : isStudentPrompt ? "outgoing ai-prompt" : isSam ? "incoming urgent" : isQuoted || index % 3 === 1 ? "outgoing" : "incoming"}`}
              key={`${message.sender}-${message.text}-${index}`}
            >
              {isAiResponse ? <small className="ai-bubble-label">{message.label}</small> : null}
              <span>{message.text}</span>
            </div>
          );
        })}
      </div>
      <div className="whutsupp-compose">
        <span>{isAiChat ? "Typ een vraag" : "Bericht"}</span>
        <button type="button" aria-label="Niet beschikbaar">+</button>
      </div>
    </div>
  );
};
