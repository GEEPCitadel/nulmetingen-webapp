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


export const AppShell = ({
  children,
  theme,
  timer,
  levelShort,
  studentCode,
  classCode,
  onReset,
  screen,
}: {
  children: ReactNode;
  theme: ThemeDefinition;
  /** Optional short label for the active assessment (e.g. "LJ1 VMBO"). */
  levelShort?: string;
  /** Optional anonymous attempt id to display in the topbar chip. */
  studentCode?: string;
  classCode?: string;
  timer?: string;
  onReset?: () => void;
  /** Screen marker for per-screen CSS overrides (e.g. landing/admin → white hero). */
  screen?: "landing" | "adminAccess" | "admin" | "assessment" | "result";
}) => (
  <div
    className="app"
    data-theme={theme.palette}
    data-screen={screen}
    style={
      {
        "--theme-primary": theme.primary,
        "--theme-secondary": theme.secondary,
        "--theme-tertiary": theme.tertiary,
        "--theme-panel": theme.panel,
        "--theme-ribbon": theme.ribbon,
        "--theme-accent": theme.accent,
      } as CSSProperties
    }
  >
    <header className="topbar">
      <span className="brand" role="img" aria-label="Citadel College" />
      <div className="brand-label">
        citadel college
        <small>nulmeting digitale geletterdheid</small>
      </div>
      <span className="spacer" />
      {levelShort ? (
        <span className="chip">
          <span className="chip-dot" />
          {levelShort}
        </span>
      ) : null}
      {timer ? (
        <span className="chip">
          <span className="chip-dot" />
          {timer}
        </span>
      ) : null}
      {onReset ? (
        <button className="ghost-btn" type="button" onClick={onReset}>
          ← Terug
        </button>
      ) : null}
    </header>
    <main className="page">{children}</main>
    <img className="slinger" src={theme.ribbon} alt="" aria-hidden="true" />
    {screen !== "assessment" && screen !== "adminAccess" ? (
      <footer className="site-footer">
        <a
          className="site-url"
          href="https://www.citadelcollege.nl"
          target="_blank"
          rel="noreferrer"
        >
          www.citadelcollege.nl
        </a>
      </footer>
    ) : null}
  </div>
);

