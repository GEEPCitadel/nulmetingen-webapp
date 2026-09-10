import { neon } from "@neondatabase/serverless";
import { accessForRequest } from "./access.js";

const validVersionIds = new Set(["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]);
const testAccessCodes = new Set(["TESTVMBO1", "TESTHV1", "TESTVMBO3", "TESTHV3"]);
const aggregateOnlyItemIds = new Set(["lj1v-sr4-official-source-v36", "pt8-whutsupp-sam-video"]);
const goalIds = ["21A", "21B", "21C", "21D", "22A", "22B", "23A", "23B", "23C"];
const signalGoalIds = ["21D", "22A", "22B", "23C"];
const legacySingleItemGoalIds = new Set(["21D", "22A", "22B", "23C"]);
const minimumReportingCount = 5;
const minimumTechnicalItemCount = 10;
const sha256Pattern = /^[0-9a-f]{64}$/;
const legacyItemAliases = new Map([
  ["lj1v-sr7-ai-check", "lj1v-sr7-online-personal-data"],
  ["lj1h-sr7-ai-startpunt", "lj1h-sr7-online-personal-data"],
  ["lj3v-sr7-ai-factcheck", "lj3v-sr7-online-personal-data"],
  ["lj3h-sr7-ai-source-check", "lj3h-sr7-online-personal-data"],
]);
const canonicalItemId = (itemId) => legacyItemAliases.get(String(itemId)) ?? String(itemId);
let tablesReady = null;

const metadataForVersion = (versionId) => {
  const [gradePart = "", trackPart = ""] = String(versionId).split("-");
  return {
    gradeLevel: gradePart === "lj3" ? "lj3" : "lj1",
    track: trackPart === "hv" ? "hv" : "vmbo",
  };
};

const readJsonBody = async (request) => {
  if (request.body && typeof request.body === "object") return request.body;
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
};

const ensureTables = async (sql) => {
  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id BIGSERIAL PRIMARY KEY,
      access_code TEXT NOT NULL,
      class_code TEXT NOT NULL,
      version_id TEXT NOT NULL,
      import_batch TEXT,
      status TEXT NOT NULL DEFAULT 'not_started',
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS class_id TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS assessment_id TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS grade_level TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS track TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS cohort TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS assessment_window TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'not_started'`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`;
  await sql`ALTER TABLE students ALTER COLUMN access_code TYPE TEXT`;
  await sql`ALTER TABLE students DROP COLUMN IF EXISTS participant_label`;
  await sql`ALTER TABLE students DROP COLUMN IF EXISTS student_number`;

  await sql`
    CREATE TABLE IF NOT EXISTS assessment_sessions (
      id UUID PRIMARY KEY,
      access_code TEXT,
      class_code TEXT,
      class_id TEXT,
      class_token TEXT,
      anonymous_attempt_id TEXT,
      version_id TEXT NOT NULL,
      assessment_build_version TEXT NOT NULL,
      assessment_content_hash TEXT NOT NULL,
      session_json JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE assessment_sessions ADD COLUMN IF NOT EXISTS class_id TEXT`;
  await sql`ALTER TABLE assessment_sessions ADD COLUMN IF NOT EXISTS class_token TEXT`;
  await sql`ALTER TABLE assessment_sessions ADD COLUMN IF NOT EXISTS anonymous_attempt_id TEXT`;
  await sql`ALTER TABLE assessment_sessions ADD COLUMN IF NOT EXISTS assessment_build_version TEXT`;
  await sql`ALTER TABLE assessment_sessions ADD COLUMN IF NOT EXISTS assessment_content_hash TEXT`;
  await sql`ALTER TABLE assessment_sessions ALTER COLUMN access_code TYPE TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS assessment_results (
      session_id UUID PRIMARY KEY,
      class_code TEXT,
      class_id TEXT,
      assessment_id TEXT,
      grade_level TEXT,
      track TEXT,
      cohort TEXT,
      assessment_window TEXT,
      version_id TEXT NOT NULL,
      assessment_build_version TEXT NOT NULL,
      assessment_content_hash TEXT NOT NULL,
      total_score INTEGER NOT NULL,
      max_score INTEGER NOT NULL,
      percentage INTEGER NOT NULL,
      self_assessment_score INTEGER,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ NOT NULL,
      result_json JSONB NOT NULL,
      event_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS class_code TEXT`;
  await sql`ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS class_id TEXT`;
  await sql`ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS assessment_id TEXT`;
  await sql`ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS grade_level TEXT`;
  await sql`ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS track TEXT`;
  await sql`ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS cohort TEXT`;
  await sql`ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS assessment_window TEXT`;
  await sql`ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS self_assessment_score INTEGER`;
  await sql`ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS assessment_build_version TEXT`;
  await sql`ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS assessment_content_hash TEXT`;
  await sql`ALTER TABLE assessment_results DROP COLUMN IF EXISTS access_code`;
  await sql`ALTER TABLE assessment_results DROP COLUMN IF EXISTS class_token`;
  await sql`ALTER TABLE assessment_results DROP COLUMN IF EXISTS anonymous_attempt_id`;
  await sql`CREATE INDEX IF NOT EXISTS students_analysis_idx ON students (assessment_window, class_code, version_id, status)`;
  await sql`CREATE INDEX IF NOT EXISTS assessment_results_analysis_idx ON assessment_results (assessment_window, class_code, version_id, assessment_content_hash)`;
};

const aggregateOptionSelections = (session) => {
  const counters = {};
  for (const itemId of aggregateOnlyItemIds) {
    counters[itemId] = {
      attempts: 0,
      selectedCountsByOptionId: {},
      correctCount: 0,
      unknownCount: 0,
    };
  }

  for (const result of session?.results ?? []) {
    if (!aggregateOnlyItemIds.has(result.itemId)) continue;
    const counter = counters[result.itemId];
    const pt8Summary = result.scoringSummary && typeof result.scoringSummary === "object"
      ? result.scoringSummary
      : null;
    const selectedIds = Array.isArray(pt8Summary?.selectedChoiceIds)
      ? pt8Summary.selectedChoiceIds.map(String)
      : Array.isArray(result.selectedAnswer)
        ? result.selectedAnswer.map(String)
        : result.selectedAnswer == null
          ? []
          : [String(result.selectedAnswer)];
    counter.attempts += 1;
    if (result.isCorrect === true) counter.correctCount += 1;
    counter.unknownCount += Number(pt8Summary?.unknownCount ?? (selectedIds.includes("unknown") ? 1 : 0));
    for (const optionId of selectedIds) {
      counter.selectedCountsByOptionId[optionId] =
        (counter.selectedCountsByOptionId[optionId] ?? 0) + 1;
    }
    if (pt8Summary) {
      counter.completedCount = (counter.completedCount ?? 0) + 1;
      counter.pt8ScoreRawSum = (counter.pt8ScoreRawSum ?? 0) + Number(pt8Summary.pt8ScoreRaw ?? 0);
      counter.pt8ScoreCappedSum = (counter.pt8ScoreCappedSum ?? 0) + Number(pt8Summary.pt8ScoreCapped ?? 0);
      counter.categoryCorrectCounts = counter.categoryCorrectCounts ?? {};
      for (const [category, score] of Object.entries(pt8Summary.categoryScores ?? {})) {
        counter.categoryCorrectCounts[category] =
          (counter.categoryCorrectCounts[category] ?? 0) + Number(score);
      }
      counter.harmfulShareCount = (counter.harmfulShareCount ?? 0) + Number(pt8Summary.harmfulShareCount ?? 0);
      counter.ridiculeCount = (counter.ridiculeCount ?? 0) + Number(pt8Summary.ridiculeCount ?? 0);
      counter.unsafeEvidenceCount = (counter.unsafeEvidenceCount ?? 0) + Number(pt8Summary.unsafeEvidenceCount ?? 0);
      counter.retaliationCount = (counter.retaliationCount ?? 0) + Number(pt8Summary.retaliationCount ?? 0);
      counter.recoverySafeCount = (counter.recoverySafeCount ?? 0) + Number(pt8Summary.recoverySafeCount ?? 0);
    }
  }

  return counters;
};

const redactAggregateOnlyAnswer = (entry) =>
  aggregateOnlyItemIds.has(entry?.itemId)
    ? {
        ...entry,
        selectedAnswer: "[aggregate-only]",
        finalState: undefined,
        scoringSummary: entry?.scoringSummary
          ? {
              assessmentId: entry.scoringSummary.assessmentId,
              variantId: entry.scoringSummary.variantId,
              categoryScores: entry.scoringSummary.categoryScores,
              pt8ScoreRaw: entry.scoringSummary.pt8ScoreRaw,
              pt8ScoreCapped: entry.scoringSummary.pt8ScoreCapped,
              flags: entry.scoringSummary.flags,
              unknownCount: entry.scoringSummary.unknownCount,
              harmfulShareCount: entry.scoringSummary.harmfulShareCount,
              ridiculeCount: entry.scoringSummary.ridiculeCount,
              unsafeEvidenceCount: entry.scoringSummary.unsafeEvidenceCount,
              retaliationCount: entry.scoringSummary.retaliationCount,
              recoverySafeCount: entry.scoringSummary.recoverySafeCount,
              chosenDistractorTypes: entry.scoringSummary.chosenDistractorTypes,
            }
          : undefined,
      }
    : entry;

const anonymizeSession = (session, classCode, classId) => ({
  ...session,
  accessCode: session.id,
  metadata: {
    anonymousAttemptId: session.metadata?.anonymousAttemptId,
    anonymousCode: session.metadata?.anonymousCode ?? session.id.slice(0, 8),
    classCode,
    classId,
    privacyConsent: session.metadata?.privacyConsent === true,
    selfAssessmentScore: session.metadata?.selfAssessmentScore,
  },
  results: (session.results ?? []).map(redactAggregateOnlyAnswer),
  eventLogs: (session.eventLogs ?? []).map(redactAggregateOnlyAnswer),
  aggregateOptionSelections: aggregateOptionSelections(session),
});

const normalizeFilter = (value) => String(value ?? "").trim().toLowerCase();

const resultMetadata = (row) => {
  const fallback = metadataForVersion(row.version_id);
  return {
    assessmentId: row.assessment_id ?? row.version_id,
    classCode: row.class_code ?? "",
    classId: row.class_id ?? row.class_code ?? "",
    gradeLevel: validVersionIds.has(row.version_id) ? fallback.gradeLevel : row.grade_level ?? "unknown",
    track: validVersionIds.has(row.version_id) ? fallback.track : row.track ?? "unknown",
    cohort: row.cohort ?? "",
    assessmentWindow: row.assessment_window ?? "",
    versionId: row.version_id,
    assessmentBuildVersion: row.assessment_build_version ?? "",
    assessmentContentHash: row.assessment_content_hash ?? "",
    contentKey: row.assessment_content_hash || row.assessment_build_version || "legacy-unknown",
    completedAt: row.completed_at ? new Date(row.completed_at).getTime() : 0,
  };
};

const studentMetadata = (row) => {
  const fallback = metadataForVersion(row.version_id);
  return {
    assessmentId: row.assessment_id ?? row.version_id,
    classCode: row.class_code ?? "",
    classId: row.class_id ?? row.class_code ?? "",
    gradeLevel: validVersionIds.has(row.version_id) ? fallback.gradeLevel : row.grade_level ?? "unknown",
    track: validVersionIds.has(row.version_id) ? fallback.track : row.track ?? "unknown",
    cohort: row.cohort ?? row.import_batch ?? "",
    assessmentWindow: row.assessment_window ?? row.import_batch ?? "",
    versionId: row.version_id,
  };
};

const matchesFilters = (metadata, filters) =>
  Object.entries(filters).every(([key, expected]) => {
    if (!expected) return true;
    return normalizeFilter(metadata[key]) === expected;
  });

const average = (values) => {
  const numeric = values.filter((value) => Number.isFinite(value));
  if (numeric.length === 0) return null;
  return Math.round((numeric.reduce((sum, value) => sum + value, 0) / numeric.length) * 10) / 10;
};

const blockPercentage = (result, predicate) => {
  const blocks = (result?.blockScores ?? []).filter(predicate);
  const score = blocks.reduce((sum, block) => sum + Number(block.score ?? 0), 0);
  const maxScore = blocks.reduce((sum, block) => sum + Number(block.maxScore ?? 0), 0);
  return maxScore > 0 ? Math.round((score / maxScore) * 1000) / 10 : null;
};

const goalPercentage = (result, goalId) => {
  const goal = (result?.goalScores ?? []).find((entry) => entry.goalId === goalId);
  if (!goal) return null;
  const isSignal =
    goal.reportingMode === "signal" ||
    goal.itemCount === 1 ||
    (goal.reportingMode === undefined && goal.itemCount === undefined && legacySingleItemGoalIds.has(goalId));
  return isSignal ? null : Number(goal.percentage ?? 0);
};

const ensureTablesOnce = async (sql) => {
  if (!tablesReady) {
    tablesReady = ensureTables(sql).catch((error) => {
      tablesReady = null;
      throw error;
    });
  }
  await tablesReady;
};

const percentile = (values, fraction) => {
  const numeric = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (numeric.length === 0) return null;
  const position = (numeric.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  const value = lower === upper
    ? numeric[lower]
    : numeric[lower] + (numeric[upper] - numeric[lower]) * (position - lower);
  return Math.round(value * 10) / 10;
};

const scoreStatistics = (scores) => {
  const totals = scores.map((score) => score.total).filter((value) => Number.isFinite(value));
  if (totals.length === 0) return { medianTotalScore: null, q1TotalScore: null, q3TotalScore: null, standardDeviation: null };
  const mean = totals.reduce((sum, value) => sum + value, 0) / totals.length;
  const variance = totals.reduce((sum, value) => sum + (value - mean) ** 2, 0) / totals.length;
  return {
    medianTotalScore: percentile(totals, 0.5),
    q1TotalScore: percentile(totals, 0.25),
    q3TotalScore: percentile(totals, 0.75),
    standardDeviation: Math.round(Math.sqrt(variance) * 10) / 10,
  };
};

const scoreSummary = (row) => {
  const result = row.result_json?.result ?? {};
  const total = Number(row.percentage ?? result.percentage ?? 0);
  const selfAssessment =
    row.self_assessment_score === null || row.self_assessment_score === undefined
      ? null
      : Number(row.self_assessment_score);
  const goals = Object.fromEntries(goalIds.map((goalId) => [goalId, goalPercentage(result, goalId)]));
  const signals = Object.fromEntries(signalGoalIds.map((goalId) => {
    const goal = (result.goalScores ?? []).find((entry) => entry.goalId === goalId);
    if (!goal || Number(goal.maxScore ?? 0) <= 0) return [goalId, null];
    return [goalId, {
      achieved: Number(goal.score ?? 0) >= Number(goal.maxScore ?? 0),
      maxScore: Number(goal.maxScore ?? 0),
    }];
  }));
  return {
    total,
    sr: blockPercentage(result, (block) => String(block.blockId ?? "").toLowerCase() === "sr"),
    pt: blockPercentage(result, (block) => String(block.blockId ?? "").toLowerCase() !== "sr" && Number(block.maxScore ?? 0) > 0),
    selfAssessment,
    selfAssessmentDifference: selfAssessment === null ? null : Math.round((selfAssessment - total) * 10) / 10,
    goals,
    signals,
  };
};

const baseGroup = (metadata) => ({
  ...metadata,
  createdCodes: 0,
  startedCount: 0,
  completedCount: 0,
  registeredCompletedCount: 0,
  missingResultCount: 0,
  completionPercentage: 0,
  averageTotalScore: null,
  averageSrScore: null,
  averagePtScore: null,
  averageSelfAssessment: null,
  averageSelfAssessmentDifference: null,
  goalScores: Object.fromEntries(goalIds.map((goalId) => [goalId, null])),
  goalSignals: Object.fromEntries(signalGoalIds.map((goalId) => [goalId, null])),
});

const buildGroups = (students, results, keyFields) => {
  const groups = new Map();
  const keyFor = (metadata) => keyFields.map((field) => metadata[field] || "").join("||");
  const ensureGroup = (metadata) => {
    const key = keyFor(metadata);
    if (!groups.has(key)) {
      const groupedMetadata = { ...metadata };
      for (const field of ["assessmentId", "classCode", "gradeLevel", "track", "cohort", "assessmentWindow", "versionId", "contentKey"]) {
        if (!keyFields.includes(field)) groupedMetadata[field] = "";
      }
      if (!keyFields.includes("classCode")) groupedMetadata.classId = "";
      groups.set(key, {
        ...baseGroup(groupedMetadata),
        _scores: [],
        _goalScores: Object.fromEntries(goalIds.map((goalId) => [goalId, []])),
        _goalSignals: Object.fromEntries(signalGoalIds.map((goalId) => [goalId, []])),
      });
    }
    return groups.get(key);
  };

  for (const student of students) {
    const group = ensureGroup(student);
    group.createdCodes += 1;
    if (student.status === "in_progress" || student.status === "completed") group.startedCount += 1;
    if (student.status === "completed") group.registeredCompletedCount += 1;
  }

  for (const row of results) {
    const metadata = resultMetadata(row);
    const group = ensureGroup(metadata);
    const summary = scoreSummary(row);
    group.completedCount += 1;
    group._scores.push(summary);
    for (const goalId of goalIds) {
      if (summary.goals[goalId] !== null) group._goalScores[goalId].push(summary.goals[goalId]);
    }
    for (const goalId of signalGoalIds) {
      if (summary.signals[goalId] !== null) group._goalSignals[goalId].push(summary.signals[goalId]);
    }
  }

  return Array.from(groups.values()).map((group) => {
    const scores = group._scores;
    const createdCodes = group.createdCodes;
    const completedCount = group.completedCount;
    const registeredCompletedCount = group.registeredCompletedCount;
    const reportable = completedCount >= minimumReportingCount;
    return {
      ...group,
      reportable,
      completionPercentage: createdCodes > 0 ? Math.round((completedCount / createdCodes) * 1000) / 10 : 0,
      missingResultCount: Math.max(0, registeredCompletedCount - completedCount),
      averageTotalScore: reportable ? average(scores.map((score) => score.total)) : null,
      averageSrScore: reportable ? average(scores.map((score) => score.sr)) : null,
      averagePtScore: reportable ? average(scores.map((score) => score.pt)) : null,
      averageSelfAssessment: reportable ? average(scores.map((score) => score.selfAssessment)) : null,
      averageSelfAssessmentDifference: reportable ? average(scores.map((score) => score.selfAssessmentDifference)) : null,
      ...(reportable ? scoreStatistics(scores) : { medianTotalScore: null, q1TotalScore: null, q3TotalScore: null, standardDeviation: null }),
      goalSampleCounts: Object.fromEntries(goalIds.map((goalId) => [goalId, group._goalScores[goalId].length])),
      goalScores: Object.fromEntries(goalIds.map((goalId) => [goalId, group._goalScores[goalId].length >= minimumReportingCount ? average(group._goalScores[goalId]) : null])),
      goalSignals: Object.fromEntries(signalGoalIds.map((goalId) => {
        const signals = group._goalSignals[goalId];
        return [goalId, !reportable || signals.length < minimumReportingCount
          ? null
          : {
              achievedCount: signals.filter((signal) => signal.achieved).length,
              completedCount: signals.length,
              maxScore: Math.max(...signals.map((signal) => signal.maxScore)),
            }];
      })),
      _scores: undefined,
      _goalScores: undefined,
      _goalSignals: undefined,
    };
  });
};

const analysisBaseKey = (metadata) => [
  metadata.classCode,
  metadata.gradeLevel,
  metadata.track,
  metadata.assessmentWindow,
  metadata.cohort,
  metadata.assessmentId,
  metadata.versionId,
].map((value) => value || "").join("||");

const attachCurrentContentKey = (students, results) => {
  const latestContentByGroup = new Map();
  for (const row of results) {
    const metadata = resultMetadata(row);
    const key = analysisBaseKey(metadata);
    const current = latestContentByGroup.get(key);
    if (!current || metadata.completedAt >= current.completedAt) {
      latestContentByGroup.set(key, {
        contentKey: metadata.contentKey,
        assessmentBuildVersion: metadata.assessmentBuildVersion,
        assessmentContentHash: metadata.assessmentContentHash,
        completedAt: metadata.completedAt,
      });
    }
  }
  return students.map((student) => ({
    ...student,
    ...(latestContentByGroup.get(analysisBaseKey(student)) ?? {
      contentKey: "legacy-unknown",
      assessmentBuildVersion: "",
      assessmentContentHash: "",
    }),
  }));
};

const selectedIdsFrom = (entry) => {
  if (Array.isArray(entry?.selectedAnswer)) return entry.selectedAnswer.map(String);
  if (typeof entry?.selectedAnswer === "string") return [entry.selectedAnswer];
  const taskIds = (entry?.taskResults ?? [])
    .map((task) => task.selectedOptionId)
    .filter(Boolean)
    .map(String);
  return taskIds;
};

const anchorPercentage = (row) => {
  const entries = row.result_json?.session?.results ?? [];
  let score = 0;
  let maxScore = 0;
  for (const entry of entries) {
    if (entry?.ankerItemFlag !== true) continue;
    score += Number(entry.score ?? 0);
    maxScore += Number(entry.maxScore ?? 0);
  }
  return maxScore > 0 ? Math.round((score / maxScore) * 1000) / 10 : null;
};

const buildGrowth = (results) => {
  const measurementPoints = new Map();
  const overallByPoint = new Map();
  const cohorts = new Map();

  for (const row of results) {
    const metadata = resultMetadata(row);
    const cohort = String(metadata.cohort ?? "").trim();
    if (!cohort) continue;

    const gradeLabel = metadata.gradeLevel === "lj3" ? "Leerjaar 3" : "Leerjaar 1";
    const windowLabel = metadata.assessmentWindow || "onbekend";
    const pointKey = `${metadata.gradeLevel}||${windowLabel}`;
    const point = measurementPoints.get(pointKey) ?? {
      label: `${gradeLabel} · ${windowLabel}`,
      firstCompletedAt: Number.POSITIVE_INFINITY,
    };
    const completedAt = Date.parse(String(row.completed_at ?? ""));
    if (Number.isFinite(completedAt)) point.firstCompletedAt = Math.min(point.firstCompletedAt, completedAt);
    measurementPoints.set(pointKey, point);

    const anchor = anchorPercentage(row);

    const total = scoreSummary(row).total;
    const overall = overallByPoint.get(pointKey) ?? { completedCount: 0, _anchors: [], _totals: [] };
    overall.completedCount += 1;
    if (anchor !== null) overall._anchors.push(anchor);
    overall._totals.push(total);
    overallByPoint.set(pointKey, overall);

    const cohortEntry = cohorts.get(cohort) ?? {
      cohort,
      byPoint: new Map(),
    };
    const cohortPoint = cohortEntry.byPoint.get(pointKey) ?? { completedCount: 0, _anchors: [], _totals: [] };
    cohortPoint.completedCount += 1;
    if (anchor !== null) cohortPoint._anchors.push(anchor);
    cohortPoint._totals.push(total);
    cohortEntry.byPoint.set(pointKey, cohortPoint);
    cohorts.set(cohort, cohortEntry);
  }

  const sortedPoints = Array.from(measurementPoints.entries())
    .sort(([, left], [, right]) =>
      left.firstCompletedAt - right.firstCompletedAt || left.label.localeCompare(right.label, "nl"),
    )
    .map(([pointKey]) => pointKey);
  const windowSummary = (entry) =>
    entry
      ? {
          completedCount: entry.completedCount,
          averageAnchorScore: entry.completedCount >= minimumReportingCount ? average(entry._anchors) : null,
          averageTotalScore: entry.completedCount >= minimumReportingCount ? average(entry._totals) : null,
        }
      : { completedCount: 0, averageAnchorScore: null, averageTotalScore: null };
  const deltaFor = (byPoint, scoreKey) => {
    const scored = sortedPoints
      .map((pointKey) => windowSummary(byPoint.get(pointKey))[scoreKey])
      .filter((value) => value !== null);
    return scored.length >= 2 ? Math.round((scored[scored.length - 1] - scored[0]) * 10) / 10 : null;
  };
  const windowsFor = (byPoint) =>
    sortedPoints.map((pointKey) => ({
      assessmentWindow: measurementPoints.get(pointKey).label,
      ...windowSummary(byPoint.get(pointKey)),
    }));

  return {
    windows: sortedPoints.map((pointKey) => measurementPoints.get(pointKey).label),
    overall: windowsFor(overallByPoint),
    overallDelta: deltaFor(overallByPoint, "averageAnchorScore"),
    overallTotalDelta: deltaFor(overallByPoint, "averageTotalScore"),
    byCohort: Array.from(cohorts.values())
      .map((entry) => ({
        cohort: entry.cohort,
        windows: windowsFor(entry.byPoint),
        delta: deltaFor(entry.byPoint, "averageAnchorScore"),
        totalDelta: deltaFor(entry.byPoint, "averageTotalScore"),
      }))
      .sort((a, b) => a.cohort.localeCompare(b.cohort, "nl")),
  };
};

const pearsonCorrelation = (pairs) => {
  if (pairs.length < 2) return null;
  const n = pairs.length;
  const meanX = pairs.reduce((sum, [x]) => sum + x, 0) / n;
  const meanY = pairs.reduce((sum, [, y]) => sum + y, 0) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (const [x, y] of pairs) {
    sxy += (x - meanX) * (y - meanY);
    sxx += (x - meanX) ** 2;
    syy += (y - meanY) ** 2;
  }
  if (sxx === 0 || syy === 0) return null;
  return Math.round((sxy / Math.sqrt(sxx * syy)) * 100) / 100;
};

const buildItemAnalysis = (results) => {
  const items = new Map();
  for (const row of results) {
    const sessionResults = row.result_json?.session?.results ?? [];
    const scorable = sessionResults.filter(
      (entry) => entry?.itemId && entry.itemId !== "self-assessment" && Number(entry.maxScore ?? 0) > 0,
    );
    const sessionScore = scorable.reduce((sum, entry) => sum + Number(entry.score ?? 0), 0);
    const sessionMax = scorable.reduce((sum, entry) => sum + Number(entry.maxScore ?? 0), 0);
    for (const entry of sessionResults) {
      const normalizedItemId = canonicalItemId(entry?.itemId);
      const isSelfAssessment = normalizedItemId === "self-assessment";
      if (!entry?.itemId || (!isSelfAssessment && Number(entry.maxScore ?? 0) <= 0)) continue;
      const analysisKey = `${row.version_id}||${row.assessment_content_hash || row.assessment_build_version || "legacy-unknown"}||${normalizedItemId}`;
      const item = items.get(analysisKey) ?? {
        itemId: normalizedItemId,
        versionId: row.version_id,
        assessmentBuildVersion: row.assessment_build_version ?? "",
        assessmentContentHash: row.assessment_content_hash ?? "",
        questionNumber: isSelfAssessment ? "zelfinschatting" : entry.learnerQuestionNumber ?? "",
        goalId: isSelfAssessment ? "" : entry.primarySubgoal ?? "",
        isSelfAssessment,
        answerCount: 0,
        correctCount: 0,
        unknownCount: 0,
        harmfulCount: 0,
        distribution: {},
        incorrectDistribution: {},
        ptErrorCategories: {},
        ritSamples: [],
      };
      item.answerCount += 1;
      if (!isSelfAssessment) {
        const itemMax = Number(entry.maxScore ?? 0);
        const restMax = sessionMax - itemMax;
        if (itemMax > 0 && restMax > 0) {
          item.ritSamples.push([
            Number(entry.score ?? 0) / itemMax,
            (sessionScore - Number(entry.score ?? 0)) / restMax,
          ]);
        }
      }
      if (entry.isCorrect === true) item.correctCount += 1;
      const taskResults = entry.taskResults ?? [];
      if (taskResults.some((task) => task.unknown === true) || selectedIdsFrom(entry).some((id) => id.includes("unknown"))) {
        item.unknownCount += 1;
      }
      const harmfulSignals = Number(entry.scoringSummary?.harmfulShareCount ?? 0) + Number(entry.scoringSummary?.ridiculeCount ?? 0) + Number(entry.scoringSummary?.unsafeEvidenceCount ?? 0) + Number(entry.scoringSummary?.retaliationCount ?? 0);
      if (harmfulSignals > 0) item.harmfulCount += 1;
      for (const selectedId of selectedIdsFrom(entry)) {
        item.distribution[selectedId] = (item.distribution[selectedId] ?? 0) + 1;
        if (entry.isCorrect !== true) {
          item.incorrectDistribution[selectedId] = (item.incorrectDistribution[selectedId] ?? 0) + 1;
        }
      }
      for (const task of taskResults) {
        if (task.errorCategory) {
          item.ptErrorCategories[task.errorCategory] = (item.ptErrorCategories[task.errorCategory] ?? 0) + 1;
        }
      }
      items.set(analysisKey, item);
    }
  }

  return Array.from(items.values()).map((item) => {
    if (item.answerCount < minimumReportingCount) return {
      itemId: item.itemId, versionId: item.versionId, assessmentBuildVersion: item.assessmentBuildVersion,
      assessmentContentHash: item.assessmentContentHash, questionNumber: item.questionNumber, goalId: item.goalId,
      answerCount: item.answerCount, reportable: false, correctRate: null, unknownRate: null,
      harmfulOptionRate: null, discrimination: null, topIncorrectResponse: "", distribution: {},
      ptErrorCategories: {}, signals: ["Te weinig antwoorden voor rapportage"],
    };
    const correctRate = item.isSelfAssessment ? null : item.answerCount > 0 ? Math.round((item.correctCount / item.answerCount) * 1000) / 1000 : 0;
    const unknownRate = item.isSelfAssessment ? null : item.answerCount > 0 ? Math.round((item.unknownCount / item.answerCount) * 1000) / 1000 : 0;
    const harmfulOptionRate = item.isSelfAssessment ? null : item.answerCount > 0 ? Math.round((item.harmfulCount / item.answerCount) * 1000) / 1000 : 0;
    const incorrectResponses = Object.entries(item.incorrectDistribution).filter(([id]) => !id.includes("unknown"));
    const topIncorrectResponse = incorrectResponses.sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    const discrimination = item.isSelfAssessment || item.answerCount < minimumTechnicalItemCount
      ? null
      : pearsonCorrelation(item.ritSamples);
    const signals = [];
    if (correctRate !== null && correctRate > 0.9) signals.push("mogelijk plafonditem");
    if (correctRate !== null && correctRate < 0.25) signals.push("mogelijk te moeilijk of onduidelijk");
    if (unknownRate !== null && unknownRate > 0.3) signals.push("veel onzekerheid");
    if (harmfulOptionRate !== null && harmfulOptionRate > 0.1) signals.push("risicovolle keuze vaak gekozen");
    if (discrimination !== null) {
      if (discrimination < 0) signals.push("negatieve discriminatie: controleer sleutel");
      else if (discrimination < 0.15) signals.push("lage discriminatie");
    }
    const { ritSamples, incorrectDistribution, ...rest } = item;
    void ritSamples;
    void incorrectDistribution;
    return {
      ...rest,
      reportable: true,
      discrimination,
      correctRate,
      unknownRate,
      harmfulOptionRate,
      topIncorrectResponse,
      signals,
    };
  }).sort((a, b) => {
    if (a.itemId === "self-assessment") return -1;
    if (b.itemId === "self-assessment") return 1;
    const left = Number(a.questionNumber);
    const right = Number(b.questionNumber);
    if (Number.isFinite(left) && Number.isFinite(right)) return left - right;
    return String(a.itemId).localeCompare(String(b.itemId), "nl");
  });
};

const listAnalysis = async (sql, query, allowedClassCodes = null, includeTechnical = true) => {
  const filters = {
    assessmentWindow: normalizeFilter(query.assessmentWindow),
    gradeLevel: normalizeFilter(query.gradeLevel),
    track: normalizeFilter(query.track),
    classCode: normalizeFilter(query.classCode),
    cohort: normalizeFilter(query.cohort),
    assessmentId: normalizeFilter(query.assessmentId),
  };
  const studentRows = await sql`
    SELECT access_code, class_code, class_id, version_id, assessment_id, grade_level, track, cohort, assessment_window, import_batch, status
    FROM students
  `;
  const resultRows = await sql`
    SELECT class_code, class_id, version_id, assessment_id, grade_level, track, cohort, assessment_window, assessment_build_version, assessment_content_hash, percentage, self_assessment_score, completed_at, result_json
    FROM assessment_results
  `;
  const isAllowedClass = (metadata) => allowedClassCodes === null || allowedClassCodes.includes(metadata.classCode);
  const allStudents = studentRows
    .map(studentMetadata)
    .map((metadata, index) => ({ ...metadata, status: studentRows[index].status }));
  const students = attachCurrentContentKey(allStudents, resultRows).filter(isAllowedClass);
  const filteredStudents = students.filter((student) => matchesFilters(student, filters));
  const comparisonFilters = { ...filters, classCode: "" };
  const comparisonStudents = attachCurrentContentKey(allStudents, resultRows)
    .filter((student) => matchesFilters(student, comparisonFilters));
  const comparisonResults = resultRows.filter((row) => matchesFilters(resultMetadata(row), comparisonFilters));
  const filteredResults = resultRows.filter((row) => {
    const metadata = resultMetadata(row);
    return isAllowedClass(metadata) && matchesFilters(metadata, filters);
  });
  // Cohortontwikkeling volgt een cohort over leerjaren heen. Klas, leerjaar, niveau,
  // assessment en afnamevenster zijn per meetmoment anders en gelden hier daarom niet als filter.
  const cohortGrowthResults = resultRows.filter((row) => {
    const metadata = resultMetadata(row);
    return isAllowedClass(metadata) && matchesFilters(metadata, {
      ...filters,
      assessmentWindow: "",
      gradeLevel: "",
      track: "",
      classCode: "",
      assessmentId: "",
    });
  });
  const overview = buildGroups(filteredStudents, filteredResults, ["assessmentId"]).reduce(
    (combined, group) => ({
      ...combined,
      createdCodes: combined.createdCodes + group.createdCodes,
      startedCount: combined.startedCount + group.startedCount,
      completedCount: combined.completedCount + group.completedCount,
    }),
    { createdCodes: 0, startedCount: 0, completedCount: 0 },
  );
  const allScores = filteredResults.map(scoreSummary);
  const selectedContentKeys = new Set(filteredResults.map((row) => resultMetadata(row).contentKey));
  const performanceSuppressed = allScores.length < minimumReportingCount || selectedContentKeys.size > 1;
  const registeredCompletedCount = filteredStudents.filter((student) => student.status === "completed").length;
  const defaultAssessmentWindow = resultRows
    .map(resultMetadata)
    .filter((item) => isAllowedClass(item) && item.assessmentWindow)
    .sort((left, right) => right.completedAt - left.completedAt)[0]?.assessmentWindow
    ?? Array.from(new Set(students.map((item) => item.assessmentWindow).filter(Boolean))).sort().at(-1)
    ?? "";
  const classGroupFields = ["classCode", "gradeLevel", "track", "assessmentWindow", "cohort", "assessmentId", "versionId", "contentKey"];
  const gradeGroupFields = ["gradeLevel", "track", "assessmentWindow", "cohort", "assessmentId", "versionId", "contentKey"];
  return {
    privacy: {
      minimumReportingCount,
      performanceSuppressed,
    },
    filters: {
      assessmentWindows: Array.from(new Set(students.map((item) => item.assessmentWindow).filter(Boolean))).sort(),
      gradeLevels: Array.from(new Set(students.map((item) => item.gradeLevel).filter(Boolean))).sort(),
      tracks: Array.from(new Set(students.map((item) => item.track).filter(Boolean))).sort(),
      classCodes: Array.from(new Set(students.map((item) => item.classCode).filter(Boolean))).sort(),
      cohorts: Array.from(new Set(students.map((item) => item.cohort).filter(Boolean))).sort(),
      assessmentIds: Array.from(new Set(students.map((item) => item.assessmentId).filter(Boolean))).sort(),
    },
    defaults: { assessmentWindow: defaultAssessmentWindow },
    overview: {
      ...overview,
      completionPercentage: overview.createdCodes > 0 ? Math.round((overview.completedCount / overview.createdCodes) * 1000) / 10 : 0,
      registeredCompletedCount,
      missingResultCount: Math.max(0, registeredCompletedCount - overview.completedCount),
      averageTotalScore: performanceSuppressed ? null : average(allScores.map((score) => score.total)),
      averageSrScore: performanceSuppressed ? null : average(allScores.map((score) => score.sr)),
      averagePtScore: performanceSuppressed ? null : average(allScores.map((score) => score.pt)),
      averageSelfAssessment: performanceSuppressed ? null : average(allScores.map((score) => score.selfAssessment)),
      averageSelfAssessmentDifference: performanceSuppressed ? null : average(allScores.map((score) => score.selfAssessmentDifference)),
    },
    byClass: buildGroups(filteredStudents, filteredResults, classGroupFields),
    storageByClass: buildGroups(filteredStudents, filteredResults, ["classCode", "gradeLevel", "track", "assessmentWindow", "cohort", "assessmentId", "versionId"]),
    comparisonClasses: buildGroups(comparisonStudents, comparisonResults, classGroupFields),
    byGrade: buildGroups(comparisonStudents, comparisonResults, gradeGroupFields),
    byLevel: buildGroups(comparisonStudents, comparisonResults, ["track", "assessmentWindow", "assessmentId", "versionId", "contentKey"]),
    itemAnalysis: performanceSuppressed || !includeTechnical ? [] : buildItemAnalysis(filteredResults),
    growth: buildGrowth(cohortGrowthResults),
  };
};

export { attachCurrentContentKey, buildGroups, buildItemAnalysis, scoreStatistics };

export default async function handler(request, response) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    response.status(500).json({ ok: false, error: "DATABASE_URL ontbreekt." });
    return;
  }

  const sql = neon(databaseUrl);

  try {
    await ensureTablesOnce(sql);

    if (request.method === "GET") {
      const access = accessForRequest(request);
      if (!access) {
        response.status(401).json({ ok: false });
        return;
      }

      response.status(200).json({
        ok: true,
        analysis: await listAnalysis(
          sql,
          request.query ?? {},
          access.role === "mentor" ? access.classCodes : null,
          access.role === "admin",
        ),
      });
      return;
    }

    if (request.method !== "POST") {
      response.setHeader("Allow", "GET, POST");
      response.status(405).json({ ok: false });
      return;
    }

    const body = await readJsonBody(request);
    const session = body.session && typeof body.session === "object" ? body.session : null;
    const result = body.result && typeof body.result === "object" ? body.result : null;
    const versionId = String(session?.versionId ?? "");
    const assessmentBuildVersion = String(session?.assessmentBuildVersion ?? "").trim();
    const assessmentContentHash = String(session?.assessmentContentHash ?? "").trim().toLowerCase();

    if (
      !session ||
      !result ||
      !/^[0-9a-fA-F-]{36}$/.test(String(session.id ?? "")) ||
      !validVersionIds.has(versionId) ||
      !session.completedAt ||
      !assessmentBuildVersion ||
      !sha256Pattern.test(assessmentContentHash)
    ) {
      response.status(400).json({ ok: false });
      return;
    }

    const requestedAccessCode = String(session?.metadata?.accessCode ?? session?.accessCode ?? "").trim().toUpperCase();
    if (testAccessCodes.has(requestedAccessCode)) {
      response.status(200).json({ ok: true });
      return;
    }

    const sessionRows = await sql`
      SELECT access_code, class_code, class_id, assessment_build_version, assessment_content_hash, session_json
      FROM assessment_sessions
      WHERE id = ${session.id}
      LIMIT 1
    `;
    const savedSession = sessionRows[0];
    if (
      savedSession &&
      (String(savedSession.assessment_build_version ?? "") !== assessmentBuildVersion ||
        String(savedSession.assessment_content_hash ?? "").toLowerCase() !== assessmentContentHash)
    ) {
      response.status(409).json({ ok: false, error: "Assessmentversie van de afname komt niet overeen met de opgeslagen sessie." });
      return;
    }
    const accessCode = String(savedSession?.access_code ?? session.metadata?.accessCode ?? "").trim().toUpperCase();
    const classCode = String(savedSession?.class_code ?? session.metadata?.classCode ?? session.metadata?.classId ?? "")
      .trim()
      .toLowerCase();
    const classId = String(savedSession?.class_id ?? session.metadata?.classId ?? classCode).trim().toLowerCase();
    const selfAssessmentScore =
      typeof session?.metadata?.selfAssessmentScore === "number"
        ? Number(session.metadata.selfAssessmentScore)
        : null;

    if (!classCode || !classId) {
      response.status(400).json({ ok: false });
      return;
    }
    const studentRows = accessCode
      ? await sql`
          SELECT assessment_id, grade_level, track, cohort, assessment_window, import_batch
          FROM students
          WHERE access_code = ${accessCode}
          LIMIT 1
        `
      : [];
    const versionMetadata = metadataForVersion(versionId);
    const studentMetadataRow = studentRows[0] ?? {};
    const assessmentId = String(studentMetadataRow.assessment_id ?? versionId);
    const gradeLevel = versionMetadata.gradeLevel;
    const track = versionMetadata.track;
    const cohort = String(studentMetadataRow.cohort ?? studentMetadataRow.import_batch ?? "");
    const assessmentWindow = String(studentMetadataRow.assessment_window ?? studentMetadataRow.import_batch ?? "");

    const anonymousSession = anonymizeSession(session, classCode, classId);
    const persistedEventLogs = (anonymousSession.eventLogs ?? []).map(redactAggregateOnlyAnswer);

    await sql`
      INSERT INTO assessment_results (
        session_id,
        class_code,
        class_id,
        assessment_id,
        grade_level,
        track,
        cohort,
        assessment_window,
        version_id,
        assessment_build_version,
        assessment_content_hash,
        total_score,
        max_score,
        percentage,
        self_assessment_score,
        started_at,
        completed_at,
        result_json,
        event_logs
      )
      VALUES (
        ${session.id},
        ${classCode},
        ${classId},
        ${assessmentId},
        ${gradeLevel},
        ${track},
        ${cohort || null},
        ${assessmentWindow || null},
        ${versionId},
        ${assessmentBuildVersion},
        ${assessmentContentHash},
        ${Number(result.totalScore ?? 0)},
        ${Number(result.maxScore ?? 0)},
        ${Number(result.percentage ?? 0)},
        ${selfAssessmentScore},
        ${session.startedAt ? new Date(session.startedAt).toISOString() : null},
        ${new Date(session.completedAt).toISOString()},
        ${JSON.stringify({ session: anonymousSession, result })}::jsonb,
        ${JSON.stringify(persistedEventLogs)}::jsonb
      )
      ON CONFLICT (session_id)
      DO UPDATE SET
        class_code = EXCLUDED.class_code,
        class_id = EXCLUDED.class_id,
        assessment_id = EXCLUDED.assessment_id,
        grade_level = EXCLUDED.grade_level,
        track = EXCLUDED.track,
        cohort = EXCLUDED.cohort,
        assessment_window = EXCLUDED.assessment_window,
        assessment_build_version = EXCLUDED.assessment_build_version,
        assessment_content_hash = EXCLUDED.assessment_content_hash,
        total_score = EXCLUDED.total_score,
        max_score = EXCLUDED.max_score,
        percentage = EXCLUDED.percentage,
        self_assessment_score = EXCLUDED.self_assessment_score,
        completed_at = EXCLUDED.completed_at,
        result_json = EXCLUDED.result_json,
        event_logs = EXCLUDED.event_logs,
        updated_at = NOW()
    `;
    if (accessCode) {
      await sql`
        UPDATE students
        SET status = 'completed', completed_at = ${new Date(session.completedAt).toISOString()}, updated_at = NOW()
        WHERE access_code = ${accessCode}
      `;
    }
    await sql`DELETE FROM assessment_sessions WHERE id = ${session.id}`;

    response.status(200).json({ ok: true });
  } catch (error) {
    response.status(request.method === "GET" ? 500 : 400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Resultaat opslaan is mislukt.",
    });
  }
}
