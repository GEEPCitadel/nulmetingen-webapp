// Client-side instrumentdata: gegenereerd zonder scoringsgeheimen voor MC-items.
// Bron: assessments.server.ts via scripts/generate-public-instruments.mts.
import type { AssessmentVersion, AssessmentVersionId, CodeMapping } from "../types";
import publicSource from "./assessments.public.json";

export { ADMIN_CODE, themes, sloLabels } from "./meta";

const publicData = publicSource as unknown as {
  assessments: AssessmentVersion[];
  defaultCodeMappings: CodeMapping[];
};

export const assessments: AssessmentVersion[] = publicData.assessments;

export const assessmentMap: Record<AssessmentVersionId, AssessmentVersion> =
  Object.fromEntries(assessments.map((assessment) => [assessment.id, assessment])) as Record<
    AssessmentVersionId,
    AssessmentVersion
  >;

export const defaultCodeMappings: CodeMapping[] = publicData.defaultCodeMappings;
