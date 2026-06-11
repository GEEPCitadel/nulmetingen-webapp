// Client-side instrumentdata: gegenereerd zonder scoringsgeheimen voor MC-items.
// Bron: assessments.server.ts via scripts/generate-public-instruments.mts.
// Bevat per versie twee vormen: nulmeting en voortgangsmeting (variabel blok uit de bank).
import type {
  AssessmentVersion,
  AssessmentVersionId,
  CodeMapping,
  MeasurementMoment,
} from "../types";
import publicSource from "./assessments.public.json";

export { ADMIN_CODE, themes, sloLabels } from "./meta";

const publicData = publicSource as unknown as {
  assessments: AssessmentVersion[];
  voortgangsAssessments?: AssessmentVersion[];
  defaultCodeMappings: CodeMapping[];
};

const toMap = (list: AssessmentVersion[]): Record<AssessmentVersionId, AssessmentVersion> =>
  Object.fromEntries(list.map((assessment) => [assessment.id, assessment])) as Record<
    AssessmentVersionId,
    AssessmentVersion
  >;

export const assessments: AssessmentVersion[] = publicData.assessments;

export const voortgangsAssessments: AssessmentVersion[] =
  publicData.voortgangsAssessments ?? publicData.assessments;

export const assessmentMap: Record<AssessmentVersionId, AssessmentVersion> =
  toMap(assessments);

export const voortgangsAssessmentMap: Record<AssessmentVersionId, AssessmentVersion> =
  toMap(voortgangsAssessments);

/** Kiest de juiste vorm per meetmoment; ontbrekend moment = nulmeting. */
export const assessmentMapForMoment = (
  moment: MeasurementMoment | undefined,
): Record<AssessmentVersionId, AssessmentVersion> =>
  moment === "voortgangsmeting" ? voortgangsAssessmentMap : assessmentMap;

export const defaultCodeMappings: CodeMapping[] = publicData.defaultCodeMappings;
