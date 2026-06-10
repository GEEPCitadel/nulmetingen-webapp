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


export const SpreadsheetPreview = ({ item }: { item: AssessmentItem }) => (
  <div className="micro-frame spreadsheet-frame">
    <div className="micro-toolbar">
      <span>Spreadsheet</span>
      <span>{item.type.includes("filter") ? "Filter" : item.type.includes("sort") ? "Sorteren" : "Resultaat"}</span>
    </div>
    <table>
      <thead>
        <tr>
          {item.table?.columns.map((column) => <th key={column}>{column}</th>)}
        </tr>
      </thead>
      <tbody>
        {item.table?.rows.map((row) => (
          <tr key={row.join("|")}>
            {row.map((cell, index) => <td key={`${cell}-${index}`}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const SecurityMockup = ({ item }: { item: AssessmentItem }) => (
  <div className="micro-frame security-frame">
    <div className="micro-toolbar">
      <span>{item.mockup?.title}</span>
      <span>Controleer veilig</span>
    </div>
    <div className="security-message">
      {item.mockup?.content.map((line) => <p key={line}>{line}</p>)}
    </div>
  </div>
);

export const CreationMockup = ({ item }: { item: AssessmentItem }) => {
  return (
    <div className="micro-frame creation-frame">
      <div className="micro-toolbar">
        <span>Opties</span>
        <span>Kies de passende optie</span>
      </div>
      <div className="creation-tiles">
        {(item.options ?? []).slice(0, 4).map((option) => (
          <span key={option.id}>{option.label}</span>
        ))}
      </div>
    </div>
  );
};

export const ConditionBuilderMockup = ({ item }: { item: AssessmentItem }) => (
  <div className="micro-frame condition-frame">
    <div className="micro-toolbar">
      <span>Voorwaarde</span>
      <span>Operator kiezen</span>
    </div>
    <div className="condition-line">{item.instruction}</div>
  </div>
);

export const BugFixMockup = ({ item }: { item: AssessmentItem }) => (
  <div className="micro-frame code-frame">
    <div className="micro-toolbar">
      <span>Code</span>
      <span>Controle</span>
    </div>
    <pre>
      {(item.codeBlocks ?? item.options?.map((option) => option.label) ?? []).join("\n")}
    </pre>
  </div>
);

export const MockupCardView = ({ item }: { item: AssessmentItem }) => {
  if (!item.mockup) {
    return null;
  }

  const isAddressBar = item.mockup.mediaHint === "Niet-interactieve adresbalk";
  const isEmailLink = item.mockup.mediaHint === "Niet-interactieve linkweergave";
  const isEmailMessage = item.mockup.mediaHint === "Niet-interactieve e-mailmock-up";
  const address = item.mockup.content[0];

  return (
    <div className={`mockup-frame mockup-${item.type}`}>
      <div className="mockup-topline">
        <strong>{item.mockup.title}</strong>
        {item.mockup.badge ? <span>{item.mockup.badge}</span> : null}
      </div>
      {item.mockup.subtitle && !isEmailLink && !isEmailMessage ? (
        <p className="mockup-subtitle">{item.mockup.subtitle}</p>
      ) : null}
      {isEmailMessage ? (
        <div className="stimulus-email-message" aria-label="E-mailbericht">
          <div className="stimulus-email-meta">
            {item.mockup.subtitle ? <span>{item.mockup.subtitle}</span> : null}
            {item.mockup.meta?.map((line) => <span key={line}>{line}</span>)}
          </div>
          <div className="stimulus-email-body">
            {item.mockup.content.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      ) : isAddressBar || isEmailLink ? (
        <div className={isEmailLink ? "stimulus-mail" : "stimulus-browser"}>
          {isEmailLink ? <p>{item.mockup.subtitle}</p> : null}
          <div className="stimulus-address-bar" aria-label="Webadres">
            <span className="stimulus-lock" aria-hidden="true" />
            <span>{address}</span>
          </div>
        </div>
      ) : (
        <div className="mockup-body">
          {item.mockup.content.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      )}
      {item.mockup.mediaHint ? <div className="media-hint">{item.mockup.mediaHint}</div> : null}
      {item.mockup.footer ? <div className="mockup-footer">{item.mockup.footer}</div> : null}
    </div>
  );
};

/* ─── Folder + File SVG icons used inside the file-task workspace.
   Match the prototype's coloured folder + cream-folded paper file. */
export const FolderIcon = () => (
  <svg className="folder-svg" viewBox="0 0 64 56" width="56" height="56">
    <path className="tab" d="M2 8 Q2 4 6 4 H22 L28 10 H58 Q62 10 62 14 V20 H2 Z" />
    <path className="body" d="M2 16 H62 V50 Q62 54 58 54 H6 Q2 54 2 50 Z" />
  </svg>
);
export const FileIcon = ({ ext }: { ext: string }) => (
  <svg className="file-svg" viewBox="0 0 50 60" width="56" height="56">
    <path className="body" d="M6 2 H32 L46 16 V54 Q46 58 42 58 H10 Q6 58 6 54 Z" />
    <path className="fold" d="M32 2 L32 14 Q32 16 34 16 L46 16" />
    <text x="14" y="46">{ext}</text>
  </svg>
);

