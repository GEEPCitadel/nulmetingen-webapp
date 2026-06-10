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


export const StudentStartScreen = ({
  selectedAssessmentId,
  classToken,
  privacyConsent,
  error,
  isStarting,
  onAssessmentChange,
  onClassTokenChange,
  onPrivacyConsentChange,
  onGenerateClassToken,
  onStart,
  onOpenAdmin,
}: {
  selectedAssessmentId: AssessmentVersion["id"];
  classToken: string;
  privacyConsent: boolean;
  error: string;
  isStarting: boolean;
  onAssessmentChange: (value: AssessmentVersion["id"]) => void;
  onClassTokenChange: (value: string) => void;
  onPrivacyConsentChange: (value: boolean) => void;
  onGenerateClassToken: () => void;
  onStart: () => void;
  onOpenAdmin: () => void;
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const selectedAssessment = assessmentMap[selectedAssessmentId];
  const assignmentCount = getStepDescriptors(selectedAssessment).filter((descriptor) => {
    const section = getSectionById(selectedAssessment, descriptor.sectionId);
    const item = section?.items.find((candidate) => candidate.id === descriptor.itemId);
    return item?.type !== "self_assessment";
  }).length;

  if (step === 1) {
    return (
      <div className="welcome-screen">
        <div className="welcome-card">
          <div className="welcome-logo-img" role="img" aria-label="Citadel College" />
          <h1 className="welcome-title">
            Welkom bij de voortgangsmeting<br />
            Digitale Geletterdheid
          </h1>
          <label className="field-block welcome-field">
            <span className="field-label">Jouw persoonlijke afnamecode</span>
            <input
              className="field-input"
              value={classToken}
              placeholder="Bijv. K7M4Q2"
              autoFocus
              onChange={(event) => onClassTokenChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && classToken.trim()) setStep(2);
              }}
            />
          </label>

          {error ? <div className="error-banner-inline welcome-field">{error}</div> : null}

          <button
            className="btn btn-primary welcome-start-btn"
            type="button"
            onClick={() => { if (classToken.trim()) setStep(2); }}
            disabled={!classToken.trim()}
          >
            <span>Volgende</span>
            <span className="arrow-circle">→</span>
          </button>

          <div className="welcome-dots">
            <span className="dot dot-active" />
            <span className="dot" />
          </div>
        </div>

        <button className="welcome-admin-link" type="button" onClick={onOpenAdmin}>
          Beheerder? <strong>Klik hier</strong>
        </button>
      </div>
    );
  }

  return (
    <div className="welcome-screen">
      <div className="welcome-card welcome-card--wide">
        <div className="welcome-logo-img" role="img" aria-label="Citadel College" />
        <h2 className="welcome-instruction-title">
          Voortgangsmeting Digitale Geletterdheid
        </h2>

        <div className="instruction-box">
          <ul className="instruction-list">
            <li>De voortgangsmeting bestaat uit <strong>{assignmentCount}</strong> opdrachten.</li>
            <li>De voortgangsmeting duurt ongeveer 30 minuten.</li>
            <li>Zoek geen antwoorden op internet.</li>
            <li>Per ongeluk afgesloten?</li>
            <li>Vul dezelfde afnamecode opnieuw in.</li>
            <li>Aan het einde zie je welke score jij hebt gehaald.</li>
          </ul>
        </div>

        <div className="privacy-consent-box">
          <p>
            Deze voortgangsmeting wordt aangeboden door Citadel College. Je antwoorden worden <strong>zonder naam</strong> opgeslagen — de uitkomsten zijn niet terug te leiden naar jou persoonlijk. De school bekijkt de resultaten per klas en per leerjaar.
          </p>
          <p>Meedoen is niet verplicht.</p>
          <label className="check-row">
            <input
              type="checkbox"
              checked={privacyConsent}
              onChange={(event) => onPrivacyConsentChange(event.target.checked)}
            />
            <span>Ik accepteer de privacyvoorwaarden.</span>
          </label>
        </div>

        {error ? <div className="error-banner-inline">{error}</div> : null}

        <div className="welcome-nav">
          <button className="btn btn-ghost" type="button" onClick={() => setStep(1)}>
            ← Terug
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={onStart}
            disabled={isStarting || !privacyConsent}
          >
            <span>{isStarting ? 'Starten...' : 'Start de voortgangsmeting'}</span>
            <span className="arrow-circle">→</span>
          </button>
        </div>

        <div className="welcome-dots">
          <span className="dot" />
          <span className="dot dot-active" />
        </div>
      </div>
    </div>
  );
};

