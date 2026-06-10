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


export const TaskNavFooter = ({
  primaryLabel,
  onPrimary,
  onSkip,
  onExit,
  primaryDisabled,
}: {
  questionNumber?: number;
  totalCount?: number;
  primaryLabel: string;
  onPrimary: () => void;
  onSkip?: () => void;
  onExit: () => void;
  primaryDisabled?: boolean;
}) => (
  <div className="task-nav">
    <span className="task-nav-spacer" aria-hidden="true" />
    <button className="task-nav-exit" type="button" onClick={onExit}>
      Afsluiten
    </button>
    {onSkip ? (
      <button className="task-nav-skip" type="button" onClick={onSkip}>
        Ik weet het niet
      </button>
    ) : null}
    <button
      className="task-nav-primary"
      type="button"
      onClick={onPrimary}
      disabled={primaryDisabled}
    >
      <span>{primaryLabel}</span>
      <span className="arrow-circle" aria-hidden="true">→</span>
    </button>
  </div>
);

