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


export const MailTaskView = ({
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
  type AddressField = "to" | "cc" | "bcc";
  type CommandPanel = "attachments" | "link" | null;

  const [draft, setDraft] = useState({
    to: [] as string[],
    cc: [] as string[],
    bcc: [] as string[],
    ccVisible: true,
    bccVisible: false,
    subject: "",
    body: "",
    attachments: [] as string[],
    links: [] as string[],
    linkUrlDraft: "",
    linkTextDraft: "",
    linkTexts: {} as Record<string, string>,
    priority: "Normaal",
    fontFamily: "Aptos",
    fontSize: "12",
    bold: false,
    italic: false,
    underline: false,
    sent: false,
    draftSaved: false,
    deleted: false,
  });
  const [undoSnapshot, setUndoSnapshot] = useState<typeof draft | null>(null);
  const [activeAddressField, setActiveAddressField] = useState<AddressField | null>(null);
  const [activeCommandPanel, setActiveCommandPanel] = useState<CommandPanel>(null);
  const [sendMenuOpen, setSendMenuOpen] = useState(false);
  const [subjectFocused, setSubjectFocused] = useState(false);
  const [notice, setNotice] = useState("");
  const task = item.mailTask;
  if (!task) {
    return null;
  }

  const updateDraft = (updater: (current: typeof draft) => typeof draft) => {
    setDraft((current) => {
      setUndoSnapshot(current);
      return updater(current);
    });
  };

  const toggleListValue = (field: AddressField | "attachments", value: string) => {
    updateDraft((current) => {
      const currentValues = current[field];
      return {
        ...current,
        [field]: currentValues.includes(value)
          ? currentValues.filter((entry) => entry !== value)
          : [...currentValues, value],
      };
    });
  };

  const commitLinkDraft = () => {
    const url = draft.linkUrlDraft.trim();
    const text = draft.linkTextDraft.trim() || url;
    if (!url) {
      return;
    }
    updateDraft((current) => ({
      ...current,
      body: current.body ? `${current.body} ${text}` : text,
      links: current.links.includes(url) ? current.links : [...current.links, url],
      linkTexts: { ...current.linkTexts, [url]: text },
      linkUrlDraft: "",
      linkTextDraft: "",
    }));
  };

  const handleRibbonCommand = (button: string) => {
    setNotice("");
    if (button === "Ongedaan maken") {
      if (undoSnapshot) {
        setDraft(undoSnapshot);
        setUndoSnapshot(null);
      }
      setActiveCommandPanel(null);
      return;
    }

    if (button === "Lettertype") {
      updateDraft((current) => ({
        ...current,
        fontFamily:
          current.fontFamily === "Aptos"
            ? "Calibri"
            : current.fontFamily === "Calibri"
              ? "Arial"
              : "Aptos",
      }));
      return;
    }

    if (button === "Lettergrootte") {
      updateDraft((current) => ({
        ...current,
        fontSize: current.fontSize === "12" ? "14" : current.fontSize === "14" ? "16" : "12",
      }));
      return;
    }

    if (button === "Vet") {
      updateDraft((current) => ({ ...current, bold: !current.bold }));
      return;
    }

    if (button === "Cursief") {
      updateDraft((current) => ({ ...current, italic: !current.italic }));
      return;
    }

    if (button === "Onderstrepen") {
      updateDraft((current) => ({ ...current, underline: !current.underline }));
      return;
    }

    if (button === "CC" || button === "Cc") {
      updateDraft((current) => ({ ...current, ccVisible: true }));
      setActiveAddressField("cc");
      setActiveCommandPanel(null);
      return;
    }

    if (button === "BCC tonen" || button === "Bcc tonen") {
      updateDraft((current) => ({ ...current, bccVisible: !current.bccVisible }));
      setActiveAddressField((current) => (current === "bcc" ? null : "bcc"));
      setActiveCommandPanel(null);
      return;
    }

    if (button === "Bestand invoegen" || button === "Bestand bijvoegen" || button === "Bestand toevoegen") {
      setActiveCommandPanel((current) => (current === "attachments" ? null : "attachments"));
      setActiveAddressField(null);
      return;
    }

    if (button === "Hyperlink invoegen" || button === "Link invoegen") {
      setActiveCommandPanel((current) => (current === "link" ? null : "link"));
      setActiveAddressField(null);
      return;
    }

    if (button === "Prioriteit") {
      updateDraft((current) => ({
        ...current,
        priority: current.priority === "Hoog" ? "Normaal" : "Hoog",
      }));
      setActiveAddressField(null);
      return;
    }

    if (button === "Afdrukken") {
      setNotice("niet beschikbaar");
      setActiveCommandPanel(null);
      setActiveAddressField(null);
      return;
    }

    if (button === "Concept opslaan") {
      updateDraft((current) => ({ ...current, draftSaved: true }));
      setActiveCommandPanel(null);
      return;
    }

    if (button === "Verwijderen") {
      updateDraft((current) => ({ ...current, deleted: true, sent: false }));
      setActiveCommandPanel(null);
      return;
    }
  };

  const sendMessage = () => {
    updateDraft((current) => ({ ...current, sent: true, deleted: false }));
    setSendMenuOpen(false);
  };

  const submit = () => {
    const { linkUrlDraft, linkTextDraft, ...submittedDraft } = draft;
    const trimmedLink = linkUrlDraft.trim();
    onSubmit({
      section,
      item,
      selectedAnswer: {
        ...submittedDraft,
        links:
          trimmedLink && !submittedDraft.links.includes(trimmedLink)
            ? [...submittedDraft.links, trimmedLink]
            : submittedDraft.links,
        linkTexts:
          trimmedLink && linkTextDraft.trim()
            ? { ...submittedDraft.linkTexts, [trimmedLink]: linkTextDraft.trim() }
            : submittedDraft.linkTexts,
      },
      shownOptionOrder: [],
    });
  };

  const toolbarButtons = [
    "Ongedaan maken",
    "Lettertype",
    "Lettergrootte",
    "Vet",
    "Cursief",
    "Onderstrepen",
    "BCC tonen",
    "Bestand invoegen",
    "Hyperlink invoegen",
    "Prioriteit",
    "Afdrukken",
  ];
  const fieldLabel = (field: AddressField) =>
    field === "to" ? "Aan" : field === "cc" ? "Cc" : "Bcc";
  const fieldVisible = (field: AddressField) =>
    field === "to" ||
    field === "cc" ||
    (field === "bcc" && draft.bccVisible);

  const contactInitials = (email: string) => {
    const local = (email.split("@")[0] || email).replace(/[^a-z0-9]/gi, "");
    return (local.slice(0, 2) || "?").toUpperCase();
  };
  const fileExt = (filename: string) => {
    const dot = filename.lastIndexOf(".");
    return dot >= 0 ? filename.slice(dot + 1).toUpperCase().slice(0, 4) : "FILE";
  };
  const sortedFiles = [...task.files].sort((a, b) =>
    a.localeCompare(b, "nl", { sensitivity: "base" }),
  );
  const ribbonIcon = (button: string): ReactNode => {
    if (button === "Ongedaan maken") return "↶";
    if (button === "Lettertype") return "Aa";
    if (button === "Lettergrootte") return draft.fontSize;
    if (button === "Vet") return "B";
    if (button === "Cursief") return <span className="rb-icon-italic">I</span>;
    if (button === "Onderstrepen") return <span className="rb-icon-underline">U</span>;
    if (button === "BCC tonen") return "Bcc";
    if (button === "Bestand invoegen") return <span className="classic-paperclip" />;
    if (button === "Hyperlink invoegen") return "🔗";
    if (button === "Prioriteit") return "!";
    if (button === "Afdrukken") return "⎙";
    return button.slice(0, 1);
  };
  const bodyStyle: CSSProperties = {
    fontFamily: draft.fontFamily,
    fontSize: `${draft.fontSize}px`,
    fontWeight: draft.bold ? 700 : 400,
    fontStyle: draft.italic ? "italic" : "normal",
    textDecoration: draft.underline ? "underline" : "none",
  };

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={item.instruction}
      />

      <div className="mail-shell">
        <div className="mail-main">
          <div className="mail-titlebar">Nieuwe e-mail</div>
          <div className="mail-tabs" aria-label="Menubalk">
            {["Bestand", "Bericht", "Invoegen", "Tekst opmaken", "Tekenen", "Opties"].map((tab) => (
              <span key={tab} className={tab === "Bericht" ? "active" : ""}>{tab}</span>
            ))}
          </div>
          <div className="mail-ribbon">
            <div className="mail-ribbon-group">
              {toolbarButtons.map((button) => {
                const isActive =
                  (button === "Bestand invoegen" && activeCommandPanel === "attachments") ||
                  (button === "Hyperlink invoegen" && activeCommandPanel === "link") ||
                  (button === "Prioriteit" && draft.priority === "Hoog") ||
                  (button === "Vet" && draft.bold) ||
                  (button === "Cursief" && draft.italic) ||
                  (button === "Onderstrepen" && draft.underline) ||
                  (button === "BCC tonen" && draft.bccVisible);
                const buttonElement = (
                  <button
                    className={`rb rb-icon-only ${isActive ? "active" : ""}`}
                    type="button"
                    onClick={() => handleRibbonCommand(button)}
                    aria-label={button}
                    title={button}
                  >
                    <span className="rb-ico" aria-hidden="true">{ribbonIcon(button)}</span>
                  </button>
                );
                if (button !== "Bestand invoegen") {
                  return <span key={button}>{buttonElement}</span>;
                }
                return (
                  <span className="mail-ribbon-button-wrap" key={button}>
                    {buttonElement}
                    {activeCommandPanel === "attachments" ? (
                      <div className="mail-attach-menu">
                        <strong className="mail-attach-picker-label">Bestand kiezen</strong>
                        <div className="mail-attach-list">
                          {sortedFiles.map((file) => {
                            const picked = draft.attachments.includes(file);
                            return (
                              <button
                                key={file}
                                type="button"
                                className={`attach-chip is-picker ${picked ? "is-picked" : ""}`}
                                onClick={() => toggleListValue("attachments", file)}
                              >
                                <span className="file-pic">{fileExt(file)}</span>
                                <span className="attach-name">{file}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </span>
                );
              })}
            </div>
            {notice ? <span className="mail-notice" role="status">{notice}</span> : null}
            {sendMenuOpen ? (
              <div className="mail-send-menu">
                <button className="rb" type="button" onClick={() => setSendMenuOpen(false)}>
                  Verzending plannen
                </button>
              </div>
            ) : null}
          </div>

          <div className="mail-send-row">
            <button className="mail-send-button" type="button" onClick={sendMessage}>
              <span aria-hidden="true">▷</span>
              <span>Verzenden</span>
            </button>
            <button
              className="mail-send-caret"
              type="button"
              onClick={() => setSendMenuOpen((current) => !current)}
              aria-label="Meer verzendopties"
              title="Meer verzendopties"
            >
              ▾
            </button>
            <span className="mail-from">Van: 01234@leerling.citadelcollege.nl</span>
          </div>

          {activeCommandPanel === "link" ? (
            <div className="mail-inline-panel">
              <strong>Hyperlink invoegen:</strong>
              <input
                className="mail-inline-input"
                value={draft.linkUrlDraft}
                onChange={(event) =>
                  updateDraft((current) => ({ ...current, linkUrlDraft: event.target.value }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitLinkDraft();
                  }
                }}
                placeholder="https://…"
              />
              <input
                className="mail-inline-input"
                value={draft.linkTextDraft}
                onChange={(event) =>
                  updateDraft((current) => ({ ...current, linkTextDraft: event.target.value }))
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    commitLinkDraft();
                  }
                }}
                placeholder="Linktekst"
              />
              <button className="rb active" type="button" onClick={commitLinkDraft}>
                Invoegen
              </button>
            </div>
          ) : null}

          <div className="mail-fields">
          {(["to", "cc", "bcc"] as const).map((field) =>
            fieldVisible(field) ? (
              <div
                className="mail-field mail-field-address"
                key={field}
                onClick={() => {
                  setActiveAddressField((current) => (current === field ? null : field));
                  setActiveCommandPanel(null);
                }}
              >
                <span className="label">{fieldLabel(field)}</span>
                <div className="chips-row">
                  {draft[field].map((contact) => (
                    <span className="contact-chip" key={`${field}-${contact}`}>
                      <span className="avatar">{contactInitials(contact)}</span>
                      <span className="contact-email">{contact}</span>
                      <button
                        type="button"
                        className="x"
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleListValue(field, contact);
                        }}
                        aria-label={`${contact} verwijderen`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {draft[field].length === 0 ? (
                    <span className="chips-placeholder">Voeg een ontvanger toe…</span>
                  ) : null}
                </div>
                {activeAddressField === field ? (
                  <div className="mail-picker-inline">
                    <div className="mail-picker-header">Contactenlijst</div>
                    {task.contacts.map((contact) => {
                      const isPicked = draft[field].includes(contact);
                      return (
                        <button
                          key={`${field}-pick-${contact}`}
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleListValue(field, contact);
                          }}
                          className={`mail-picker-item ${isPicked ? "is-picked" : ""}`}
                        >
                          <span className="avatar">{contactInitials(contact)}</span>
                          <span className="contact-email">{contact}</span>
                          {isPicked ? <span className="check" aria-hidden="true">✓</span> : null}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            ) : null,
          )}
          <div className="mail-field mail-field-subject">
            <span className="label">Onderwerp</span>
            <input
              className="subject-input"
              value={draft.subject}
              placeholder={subjectFocused ? "" : "Onderwerp toevoegen"}
              onFocus={() => setSubjectFocused(true)}
              onBlur={() => setSubjectFocused(false)}
              onChange={(event) =>
                updateDraft((current) => ({ ...current, subject: event.target.value }))
              }
            />
            {draft.priority === "Hoog" ? (
              <span className="priority-flag" aria-label="Hoge prioriteit">!</span>
            ) : null}
          </div>
          {draft.attachments.length > 0 ? (
            <div className="mail-attachments mail-attachments-inline">
              <span className="classic-paperclip" aria-hidden="true" />
              {draft.attachments.map((attachment) => (
                <span className="attach-chip" key={attachment}>
                  <span className="file-pic">{fileExt(attachment)}</span>
                  <span className="attach-name">{attachment}</span>
                  <button
                    type="button"
                    className="attach-remove"
                    aria-label={`${attachment} verwijderen`}
                    onClick={() => toggleListValue("attachments", attachment)}
                  >
                    Ã—
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          </div>

          <div className="mail-body-area">
            <textarea
              className="body-edit"
              rows={9}
              value={draft.body}
              style={bodyStyle}
              onChange={(event) =>
                updateDraft((current) => ({ ...current, body: event.target.value }))
              }
              placeholder=""
            />
            {draft.links.length > 0 ? (
              <div className="mail-body-links">
                {draft.links.map((link) => (
                  <a key={link} href={link}>
                    {draft.linkTexts[link] ?? link}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

        </div>
      </div>

      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Volgende"
        onPrimary={draft.sent ? submit : () => { sendMessage(); submit(); }}
        onSkip={onSkip}
        onExit={onExit}
      />
    </section>
  );
};

