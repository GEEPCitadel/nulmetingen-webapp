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


export const AdminAccessScreen = ({
  code,
  error,
  isLoading,
  onCodeChange,
  onUnlock,
  onBack,
}: {
  code: string;
  error: string;
  isLoading: boolean;
  onCodeChange: (value: string) => void;
  onUnlock: () => void;
  onBack: () => void;
}) => (
  <div className="rd-modal-backdrop">
    <div className="rd-modal" role="dialog" aria-labelledby="admin-access-title">
      <h3 id="admin-access-title">Beheeromgeving openen</h3>
      <p>
        Met de beheercode open je de docentomgeving om afnamecodes te
        beheren en de voortgang per klas te bekijken.
      </p>
      <label className="field-block">
        <span className="field-label">Beheercode</span>
        <input
          className="field-input"
          type="password"
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          placeholder="Beheercode"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onUnlock();
            }
          }}
        />
      </label>
      {error ? <div className="error-banner-inline">{error}</div> : null}
      <div className="actions">
        <button className="btn btn-ghost" type="button" onClick={onBack}>
          ← Terug
        </button>
        <button
          className="btn btn-primary"
          type="button"
          onClick={onUnlock}
          disabled={isLoading}
        >
          <span>{isLoading ? "Controleren…" : "Open beheer"}</span>
          <span className="arrow-circle">→</span>
        </button>
      </div>
    </div>
  </div>
);

