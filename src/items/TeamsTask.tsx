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


export type TeamsActionLogEntry = {
  actionType: string;
  timestamp: string;
};

export type TeamsChatMessage = {
  id: number;
  text: string;
};

export type TeamsReactionBurst = {
  id: number;
  emoji: string;
};

export type TeamsIconName = "camera" | "mic" | "chat" | "people" | "reaction" | "share" | "more";

export const requiredTeamsSequence = [
  "clicked_share",
  "clicked_window",
  "selected_windows_media_player",
];

export const hasCompletedTeamsSequence = (actionLog: TeamsActionLogEntry[]) => {
  let cursor = 0;
  for (const entry of actionLog) {
    if (entry.actionType === requiredTeamsSequence[cursor]) {
      cursor += 1;
      if (cursor === requiredTeamsSequence.length) {
        return true;
      }
    }
  }
  return false;
};

export const TeamsIcon = ({ name }: { name: TeamsIconName }) => {
  const paths = {
    camera: "M4 7h11v10H4z M15 10l5-3v10l-5-3z",
    mic: "M9 4h6v9a3 3 0 0 1-6 0z M5 11a7 7 0 0 0 14 0 M12 18v3 M8 21h8",
    chat: "M4 5h16v11H8l-4 4z M8 9h8 M8 12h5",
    people: "M9 11a3 3 0 1 0 0-6a3 3 0 0 0 0 6z M17 11a2.5 2.5 0 1 0 0-5a2.5 2.5 0 0 0 0 5z M3.5 19c.8-3 2.8-4.5 5.5-4.5s4.7 1.5 5.5 4.5 M14 15.5c2.2.1 3.8 1.2 4.5 3.5",
    reaction: "M12 20a8 8 0 1 0 0-16a8 8 0 0 0 0 16z M8.5 10h.1 M15.4 10h.1 M8.5 14c1 1.3 2.1 2 3.5 2s2.5-.7 3.5-2",
    share: "M12 16V4 M7 9l5-5l5 5 M5 14v5h14v-5",
    more: "M5 12h.1 M12 12h.1 M19 12h.1",
  };

  return (
    <svg className="teams-inline-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={paths[name]} />
    </svg>
  );
};

export const iconNameForTeamsButton = (button: string): TeamsIconName => {
  if (button === "Camera") {
    return "camera";
  }
  if (button === "Microfoon") {
    return "mic";
  }
  if (button === "Chat") {
    return "chat";
  }
  if (button === "Deelnemers") {
    return "people";
  }
  if (button === "Reageren") {
    return "reaction";
  }
  if (button === "Delen") {
    return "share";
  }
  return "more";
};

export const actionName = (label: string) =>
  `clicked_${label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;

export const teamsPortraitImage = "/teams/meeting-portraits.png";

export const windowKind = (windowName: string) => {
  const normalized = windowName.toLowerCase();
  if (normalized.includes("videospeler") || normalized.includes("media player")) {
    return "media";
  }
  if (normalized.includes("word")) {
    return "word";
  }
  if (normalized.includes("excel")) {
    return "excel";
  }
  if (normalized.includes("browser")) {
    return "browser";
  }
  if (normalized.includes("chat")) {
    return "chat";
  }
  return "desktop";
};

export const WindowPreviewArt = ({ windowName, large = false }: { windowName: string; large?: boolean }) => {
  const kind = windowKind(windowName);

  if (kind === "media") {
    return (
      <div className={`window-art window-art-media ${large ? "large" : ""}`}>
        <div className="film-sky" />
        <div className="film-play">▶</div>
        <div className="film-controls"><span /><span /></div>
      </div>
    );
  }

  if (kind === "word") {
    return (
      <div className={`window-art window-art-word ${large ? "large" : ""}`}>
        <div className="word-ribbon"><span /><span /><span /></div>
        <div className="word-page">
          <strong>Verslag</strong>
          <span />
          <span />
          <span className="short" />
        </div>
      </div>
    );
  }

  if (kind === "excel") {
    return (
      <div className={`window-art window-art-excel ${large ? "large" : ""}`}>
        {Array.from({ length: 20 }, (_, index) => (
          <span className={index < 5 ? "head" : ""} key={index} />
        ))}
      </div>
    );
  }

  if (kind === "browser") {
    return (
      <div className={`window-art window-art-browser ${large ? "large" : ""}`}>
        <div className="browser-bar" />
        <div className="browser-card"><strong>Rooster</strong><span /><span /></div>
      </div>
    );
  }

  if (kind === "chat") {
    return (
      <div className={`window-art window-art-chat ${large ? "large" : ""}`}>
        <span className="bubble left" />
        <span className="bubble right" />
        <span className="bubble left short" />
      </div>
    );
  }

  return (
    <div className={`window-art window-art-desktop ${large ? "large" : ""}`}>
      <span />
      <span />
      <span />
    </div>
  );
};

export const isWholeScreenShare = (windowName: string) => {
  const normalized = windowName.toLowerCase();
  return normalized === "hele scherm" || normalized === "scherm";
};

export const SharedDesktopStage = ({ windows }: { windows: string[] }) => (
  <div className="fake-shared-desktop" aria-label="Gedeeld volledig scherm">
    <div className="fake-desktop-max-window">
      <div className="fake-window-titlebar">
        <span>Videospeler</span>
        <span>Filmfragment</span>
      </div>
      <WindowPreviewArt windowName="Videospeler - filmfragment" large />
    </div>
    <div className="fake-desktop-taskbar" aria-label="Geminimaliseerde vensters">
      {windows.map((windowName) => (
        <span key={windowName}>{windowName}</span>
      ))}
    </div>
  </div>
);

export const SharedWindowStage = ({
  windowName,
  windows,
  onStopSharing,
}: {
  windowName: string;
  windows: string[];
  onStopSharing: () => void;
}) => (
  <div className="fake-shared-stage">
    <div className="fake-sharing-label">
      <span>{isWholeScreenShare(windowName) ? "Je deelt nu je hele scherm" : "Je deelt nu dit venster"}</span>
      <button type="button" onClick={onStopSharing}>Delen beëindigen</button>
    </div>
    {isWholeScreenShare(windowName) ? (
      <SharedDesktopStage windows={windows} />
    ) : (
      <div className="fake-shared-window">
        <div className="fake-window-titlebar">
          <span>Macrohard Teams</span>
          <span>{windowName}</span>
        </div>
        <WindowPreviewArt windowName={windowName} large />
      </div>
    )}
  </div>
);

export const TeamsVideoTile = ({
  person,
  initials,
  cameraOn,
  photoSide,
  small = false,
  blurred = false,
}: {
  person: string;
  initials: string;
  cameraOn: boolean;
  photoSide: "learner" | "teacher";
  small?: boolean;
  blurred?: boolean;
}) => (
  <div className={`fake-video-tile ${small ? "compact" : ""} ${cameraOn ? "camera-on" : ""}`}>
    {cameraOn ? (
      <div className={`fake-video-photo ${photoSide} ${blurred ? "blurred" : ""}`}>
        <img src={teamsPortraitImage} alt="" draggable="false" />
      </div>
    ) : (
      <div className={`fake-avatar ${small ? "small" : ""}`}>{initials}</div>
    )}
    <span>{person}</span>
  </div>
);

export const FakeTeamsTask = ({
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
  const [state, setState] = useState({
    shareOpened: false,
    windowPickerOpen: false,
    selectedWindow: "",
    actionLog: [] as TeamsActionLogEntry[],
    skipped: false,
    cameraOn: true,
    micMuted: false,
    chatOpen: false,
    chatInput: "",
    chatMessages: [] as TeamsChatMessage[],
    participantsOpen: true,
    reactionsOpen: false,
    reactionBursts: [] as TeamsReactionBurst[],
    moreOpen: false,
    backgroundBlurred: false,
    captionsVisible: false,
    computerSoundOn: false,
  });
  const task = item.teamsTask;
  if (!task) {
    return null;
  }

  const logAction = (actionType: string, updates: Partial<typeof state> = {}) => {
    setState((current) => ({
      ...current,
      ...updates,
      actionLog: [
        ...current.actionLog,
        {
          actionType,
          timestamp: new Date().toISOString(),
        },
      ],
    }));
  };

  const appendAction = (current: typeof state, actionType: string) => ({
    ...current,
    actionLog: [
      ...current.actionLog,
      {
        actionType,
        timestamp: new Date().toISOString(),
      },
    ],
  });

  const sendChatMessage = () => {
    const text = state.chatInput.trim();
    if (!text) {
      return;
    }
    setState((current) => ({
      ...appendAction(current, "sent_chat_message"),
      chatInput: "",
      chatMessages: [
        ...current.chatMessages,
        {
          id: Date.now(),
          text,
        },
      ],
    }));
  };

  const sendReaction = (emoji: string) => {
    const reaction = {
      id: Date.now(),
      emoji,
    };
    setState((current) => ({
      ...appendAction(current, `sent_reaction_${emoji}`),
      reactionsOpen: false,
      reactionBursts: [...current.reactionBursts.slice(-5), reaction],
    }));
    window.setTimeout(() => {
      setState((current) => ({
        ...current,
        reactionBursts: current.reactionBursts.filter((item) => item.id !== reaction.id),
      }));
    }, 2200);
  };

  const submit = (skipped = false) => {
    onSubmit({
      section,
      item,
      selectedAnswer: {
        shareOpened: state.shareOpened,
        windowPickerOpen: state.windowPickerOpen,
        selectedWindow: state.selectedWindow,
        actionLog: state.actionLog,
        completedSequence: hasCompletedTeamsSequence(state.actionLog),
        computerSoundOn: state.computerSoundOn,
        skipped,
      },
      shownOptionOrder: [],
    });
  };

  return (
    <section className="panel stack-lg fake-teams-task-panel">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      >
        <div className="notice-banner">{task.scenario}</div>
      </QuestionHeader>

      <div className="fake-teams-shell" aria-label="Macrohard Teams-vergadering">
        <div className="fake-teams-titlebar">
          <div className="fake-teams-appmark">M</div>
          <span>Macrohard Teams</span>
        </div>

        <div className={`fake-teams-content ${state.participantsOpen ? "" : "participants-hidden"}`}>
          {state.participantsOpen ? (
            <aside className="fake-teams-side">
              <strong>Vergadering</strong>
              <span>Nu bezig</span>
              <div className="fake-participant active">Mark Canbers</div>
              <div className="fake-participant">Docent</div>
              <button
                className="fake-invite-button"
                type="button"
                onClick={() => logAction("clicked_invite_participants")}
              >
                Deelnemers uitnodigen
              </button>
            </aside>
          ) : null}

          <div className="fake-teams-main">
            <div className="fake-teams-stage">
              {state.selectedWindow ? (
                <SharedWindowStage
                  windowName={state.selectedWindow}
                  windows={task.windows}
                  onStopSharing={() =>
                    logAction("stopped_sharing", {
                      selectedWindow: "",
                      shareOpened: false,
                      windowPickerOpen: false,
                    })
                  }
                />
              ) : (
                <>
                  <TeamsVideoTile
                    person="Mark Canbers"
                    initials="MC"
                    cameraOn={state.cameraOn}
                    photoSide="learner"
                    blurred={state.backgroundBlurred}
                  />
                  <TeamsVideoTile person="Docent" initials="D" cameraOn photoSide="teacher" small />
                </>
              )}
            </div>

            {state.reactionBursts.map((reaction, index) => (
              <span
                className="fake-reaction-float"
                key={reaction.id}
                style={{ left: `${24 + index * 11}%` }}
                aria-hidden="true"
              >
                {reaction.emoji}
              </span>
            ))}

            {state.captionsVisible ? (
              <div className="fake-captions">Ondertiteling: de vergadering is gestart.</div>
            ) : null}

            {state.shareOpened ? (
              <div className="fake-share-menu" role="menu" aria-label="Deelmenu">
                <strong>Delen</strong>
                <label className="fake-sound-toggle">
                  <input
                    type="checkbox"
                    checked={state.computerSoundOn}
                    onChange={(event) =>
                      logAction("toggled_computer_sound", {
                        computerSoundOn: event.target.checked,
                      })
                    }
                  />
                  <span>Met computergeluid</span>
                </label>
                <div className="fake-share-options">
                  {task.shareOptions.map((option) => (
                    <button
                      className={option === "Venster" && state.windowPickerOpen ? "selected" : ""}
                      key={option}
                      type="button"
                      onClick={() => {
                        if (option === "Venster") {
                          logAction("clicked_window", { windowPickerOpen: true });
                          return;
                        }
                        logAction(actionName(option), {
                          windowPickerOpen: false,
                          selectedWindow: option,
                          shareOpened: false,
                        });
                      }}
                    >
                      <span className="fake-share-icon" aria-hidden="true">
                        <WindowPreviewArt windowName={option} />
                      </span>
                      <span>{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {state.windowPickerOpen ? (
              <div className="fake-window-picker" aria-label="Venster selecteren">
                <strong>Kies een venster</strong>
                <div className="fake-window-grid">
                  {task.windows.map((windowName) => (
                    <button
                      className={state.selectedWindow === windowName ? "selected" : ""}
                      key={windowName}
                      type="button"
                      onClick={() => {
                        logAction(
                          windowName === task.correctWindow
                            ? "selected_windows_media_player"
                            : `selected_${actionName(windowName).replace(/^clicked_/, "")}`,
                          {
                            selectedWindow: windowName,
                            shareOpened: false,
                            windowPickerOpen: false,
                          },
                        );
                      }}
                    >
                      <span className="fake-window-preview" aria-hidden="true">
                        <WindowPreviewArt windowName={windowName} />
                      </span>
                      <span>{windowName}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {state.chatOpen ? (
              <div className="fake-chat-panel" aria-label="Chatvenster">
                <div className="fake-panel-heading">
                  <strong>Chat</strong>
                  <button type="button" onClick={() => logAction("closed_chat", { chatOpen: false })}>
                    Sluiten
                  </button>
                </div>
                <div className="fake-chat-messages" aria-live="polite">
                  <div className="fake-chat-message received">Welkom bij de meting DG</div>
                  {state.chatMessages.map((message) => (
                    <div className="fake-chat-message sent" key={message.id}>
                      {message.text}
                    </div>
                  ))}
                </div>
                <form
                  className="fake-chat-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    sendChatMessage();
                  }}
                >
                  <input
                    aria-label="Chatbericht"
                    value={state.chatInput}
                    onChange={(event) => setState((current) => ({ ...current, chatInput: event.target.value }))}
                    placeholder="Typ een bericht"
                  />
                  <button type="submit">Verstuur</button>
                </form>
              </div>
            ) : null}

            {state.reactionsOpen ? (
              <div className="fake-reaction-menu" aria-label="Reactie kiezen">
                {["👍", "👏", "❤️", "😊", "✋"].map((emoji) => (
                  <button key={emoji} type="button" onClick={() => sendReaction(emoji)}>
                    {emoji}
                  </button>
                ))}
              </div>
            ) : null}

            {state.moreOpen ? (
              <div className="fake-more-menu" aria-label="Meer opties">
                <button
                  type="button"
                  onClick={() =>
                    logAction("toggled_background_blur", {
                      backgroundBlurred: !state.backgroundBlurred,
                      moreOpen: false,
                    })
                  }
                >
                  Achtergrond vervagen
                </button>
                <button
                  type="button"
                  onClick={() =>
                    logAction("toggled_captions", {
                      captionsVisible: !state.captionsVisible,
                      moreOpen: false,
                    })
                  }
                >
                  Ondertiteling {state.captionsVisible ? "uit" : "aan"}
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className="fake-teams-toolbar">
          {task.buttons.map((button) => (
            <button
              className={[
                button === "Delen" && state.shareOpened ? "active" : "",
                button === "Camera" && !state.cameraOn ? "inactive" : "",
                button === "Microfoon" && state.micMuted ? "muted" : "",
                button === "Chat" && state.chatOpen ? "active" : "",
                button === "Deelnemers" && state.participantsOpen ? "active" : "",
                button === "Reageren" && state.reactionsOpen ? "active" : "",
                button === "Meer" && state.moreOpen ? "active" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              key={button}
              type="button"
              onClick={() => {
                if (button === "Delen") {
                  logAction("clicked_share", {
                    shareOpened: !state.shareOpened,
                    windowPickerOpen: false,
                  });
                  return;
                }
                if (button === "Camera") {
                  logAction("toggled_camera", { cameraOn: !state.cameraOn });
                  return;
                }
                if (button === "Microfoon") {
                  logAction("toggled_microphone", { micMuted: !state.micMuted });
                  return;
                }
                if (button === "Chat") {
                  logAction("clicked_chat", { chatOpen: !state.chatOpen });
                  return;
                }
                if (button === "Deelnemers") {
                  logAction("clicked_participants", { participantsOpen: !state.participantsOpen });
                  return;
                }
                if (button === "Reageren") {
                  logAction("clicked_reactions", { reactionsOpen: !state.reactionsOpen });
                  return;
                }
                if (button === "Meer") {
                  logAction("clicked_more", { moreOpen: !state.moreOpen });
                  return;
                }
                logAction(actionName(button));
              }}
            >
              <TeamsIcon name={iconNameForTeamsButton(button)} />
              {button}
            </button>
          ))}
        </div>

        {state.selectedWindow ? (
          <div className="fake-teams-status">
            {state.selectedWindow} wordt gedeeld
          </div>
        ) : null}
      </div>

      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Volgende"
        onPrimary={() => submit(false)}
        onSkip={onSkip}
        onExit={onExit}
      />
    </section>
  );
};

