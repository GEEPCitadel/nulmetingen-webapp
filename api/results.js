import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const validVersionIds = new Set(["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]);
const aggregateOnlyItemIds = new Set(["lj1v-sr4-official-source-v36", "pt8-whutsupp-sam-video"]);
const goalIds = ["21A", "21B", "21C", "21D", "22A", "22B", "23A", "23B", "23C"];

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

const safeEquals = (candidate, expected) => {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return candidateBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
};

const requireAdmin = (request) => {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const headerPassword = request.headers["x-admin-password"];
  const candidate = typeof headerPassword === "string" ? headerPassword : "";
  return Boolean(expectedPassword && candidate && safeEquals(candidate, expectedPassword));
};

const ensureTables = async (sql) => {
  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id BIGSERIAL PRIMARY KEY,
      student_number TEXT UNIQUE,
      participant_label TEXT,
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
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS participant_label TEXT`;
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

  await sql`
    CREATE TABLE IF NOT EXISTS assessment_sessions (
      id UUID PRIMARY KEY,
      access_code TEXT,
      class_code TEXT,
      class_id TEXT,
      class_token TEXT,
      anonymous_attempt_id TEXT,
      version_id TEXT NOT NULL,
      session_json JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE assessment_sessions ADD COLUMN IF NOT EXISTS class_id TEXT`;
  await sql`ALTER TABLE assessment_sessions ADD COLUMN IF NOT EXISTS class_token TEXT`;
  await sql`ALTER TABLE assessment_sessions ADD COLUMN IF NOT EXISTS anonymous_attempt_id TEXT`;
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
  await sql`ALTER TABLE assessment_results DROP COLUMN IF EXISTS access_code`;
  await sql`ALTER TABLE assessment_results DROP COLUMN IF EXISTS class_token`;
  await sql`ALTER TABLE assessment_results DROP COLUMN IF EXISTS anonymous_attempt_id`;
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
    gradeLevel: row.grade_level ?? fallback.gradeLevel,
    track: row.track ?? fallback.track,
    cohort: row.cohort ?? "",
    assessmentWindow: row.assessment_window ?? "",
    versionId: row.version_id,
  };
};

const studentMetadata = (row) => {
  const fallback = metadataForVersion(row.version_id);
  return {
    assessmentId: row.assessment_id ?? row.version_id,
    classCode: row.class_code ?? "",
    classId: row.class_id ?? row.class_code ?? "",
    gradeLevel: row.grade_level ?? fallback.gradeLevel,
    track: row.track ?? fallback.track,
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
  return goal ? Number(goal.percentage ?? 0) : null;
};

const scoreSummary = (row) => {
  const result = row.result_json?.result ?? {};
  const total = Number(row.percentage ?? result.percentage ?? 0);
  const selfAssessment =
    row.self_assessment_score === null || row.self_assessment_score === undefined
      ? null
      : Number(row.self_assessment_score);
  const goals = Object.fromEntries(goalIds.map((goalId) => [goalId, goalPercentage(result, goalId)]));
  return {
    total,
    sr: blockPercentage(result, (block) => String(block.blockId ?? "").toLowerCase() === "sr"),
    pt: blockPercentage(result, (block) => String(block.blockId ?? "").toLowerCase() !== "sr" && Number(block.maxScore ?? 0) > 0),
    selfAssessment,
    selfAssessmentDifference: selfAssessment === null ? null : Math.round((selfAssessment - total) * 10) / 10,
    goals,
  };
};

const baseGroup = (metadata) => ({
  ...metadata,
  createdCodes: 0,
  startedCount: 0,
  completedCount: 0,
  completionPercentage: 0,
  averageTotalScore: null,
  averageSrScore: null,
  averagePtScore: null,
  averageSelfAssessment: null,
  averageSelfAssessmentDifference: null,
  goalScores: Object.fromEntries(goalIds.map((goalId) => [goalId, null])),
});

const buildGroups = (students, results, keyFields) => {
  const groups = new Map();
  const keyFor = (metadata) => keyFields.map((field) => metadata[field] || "").join("||");
  const ensureGroup = (metadata) => {
    const key = keyFor(metadata);
    if (!groups.has(key)) {
      groups.set(key, { ...baseGroup(metadata), _scores: [], _goalScores: Object.fromEntries(goalIds.map((goalId) => [goalId, []])) });
    }
    return groups.get(key);
  };

  for (const student of students) {
    const group = ensureGroup(student);
    group.createdCodes += 1;
    if (student.status === "in_progress" || student.status === "completed") group.startedCount += 1;
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
  }

  return Array.from(groups.values()).map((group) => {
    const scores = group._scores;
    const createdCodes = group.createdCodes;
    const completedCount = group.completedCount;
    return {
      ...group,
      completionPercentage: createdCodes > 0 ? Math.round((completedCount / createdCodes) * 1000) / 10 : 0,
      averageTotalScore: average(scores.map((score) => score.total)),
      averageSrScore: average(scores.map((score) => score.sr)),
      averagePtScore: average(scores.map((score) => score.pt)),
      averageSelfAssessment: average(scores.map((score) => score.selfAssessment)),
      averageSelfAssessmentDifference: average(scores.map((score) => score.selfAssessmentDifference)),
      goalScores: Object.fromEntries(goalIds.map((goalId) => [goalId, average(group._goalScores[goalId])])),
      _scores: undefined,
      _goalScores: undefined,
    };
  });
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

const buildItemAnalysis = (results) => {
  const items = new Map();
  for (const row of results) {
    const sessionResults = row.result_json?.session?.results ?? [];
    for (const entry of sessionResults) {
      if (!entry?.itemId || Number(entry.maxScore ?? 0) <= 0) continue;
      const item = items.get(entry.itemId) ?? {
        itemId: entry.itemId,
        questionNumber: entry.learnerQuestionNumber ?? "",
        goalId: entry.primarySubgoal ?? "",
        answerCount: 0,
        correctCount: 0,
        unknownCount: 0,
        harmfulCount: 0,
        distribution: {},
        ptErrorCategories: {},
      };
      item.answerCount += 1;
      if (entry.isCorrect === true) item.correctCount += 1;
      const taskResults = entry.taskResults ?? [];
      if (taskResults.some((task) => task.unknown === true) || selectedIdsFrom(entry).some((id) => id.includes("unknown"))) {
        item.unknownCount += 1;
      }
      const harmfulSignals = Number(entry.scoringSummary?.harmfulShareCount ?? 0) + Number(entry.scoringSummary?.ridiculeCount ?? 0) + Number(entry.scoringSummary?.unsafeEvidenceCount ?? 0) + Number(entry.scoringSummary?.retaliationCount ?? 0);
      if (harmfulSignals > 0) item.harmfulCount += 1;
      for (const selectedId of selectedIdsFrom(entry)) {
        item.distribution[selectedId] = (item.distribution[selectedId] ?? 0) + 1;
      }
      for (const task of taskResults) {
        if (task.errorCategory) {
          item.ptErrorCategories[task.errorCategory] = (item.ptErrorCategories[task.errorCategory] ?? 0) + 1;
        }
      }
      items.set(entry.itemId, item);
    }
  }

  return Array.from(items.values()).map((item) => {
    const correctRate = item.answerCount > 0 ? Math.round((item.correctCount / item.answerCount) * 1000) / 1000 : 0;
    const unknownRate = item.answerCount > 0 ? Math.round((item.unknownCount / item.answerCount) * 1000) / 1000 : 0;
    const harmfulOptionRate = item.answerCount > 0 ? Math.round((item.harmfulCount / item.answerCount) * 1000) / 1000 : 0;
    const distractors = Object.entries(item.distribution).filter(([id]) => !id.includes("unknown"));
    const topDistractor = distractors.sort((a, b) => b[1] - a[1])[0]?.[0] ?? "";
    const signals = [];
    if (correctRate > 0.9) signals.push("mogelijk plafonditem");
    if (correctRate < 0.25) signals.push("mogelijk te moeilijk of onduidelijk");
    if (unknownRate > 0.3) signals.push("veel onzekerheid");
    if (harmfulOptionRate > 0.1) signals.push("risicovolle keuze vaak gekozen");
    return {
      ...item,
      correctRate,
      unknownRate,
      harmfulOptionRate,
      topDistractor,
      signals,
    };
  });
};

const listAnalysis = async (sql, query) => {
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
    LIMIT 10000
  `;
  const resultRows = await sql`
    SELECT class_code, class_id, version_id, assessment_id, grade_level, track, cohort, assessment_window, percentage, self_assessment_score, result_json
    FROM assessment_results
    LIMIT 10000
  `;
  const students = studentRows.map(studentMetadata).map((metadata, index) => ({ ...metadata, status: studentRows[index].status }));
  const filteredStudents = students.filter((student) => matchesFilters(student, filters));
  const filteredResults = resultRows.filter((row) => matchesFilters(resultMetadata(row), filters));
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
  return {
    filters: {
      assessmentWindows: Array.from(new Set(students.map((item) => item.assessmentWindow).filter(Boolean))).sort(),
      gradeLevels: Array.from(new Set(students.map((item) => item.gradeLevel).filter(Boolean))).sort(),
      tracks: Array.from(new Set(students.map((item) => item.track).filter(Boolean))).sort(),
      classCodes: Array.from(new Set(students.map((item) => item.classCode).filter(Boolean))).sort(),
      cohorts: Array.from(new Set(students.map((item) => item.cohort).filter(Boolean))).sort(),
      assessmentIds: Array.from(new Set(students.map((item) => item.assessmentId).filter(Boolean))).sort(),
    },
    overview: {
      ...overview,
      completionPercentage: overview.createdCodes > 0 ? Math.round((overview.completedCount / overview.createdCodes) * 1000) / 10 : 0,
      averageTotalScore: average(allScores.map((score) => score.total)),
      averageSrScore: average(allScores.map((score) => score.sr)),
      averagePtScore: average(allScores.map((score) => score.pt)),
      averageSelfAssessment: average(allScores.map((score) => score.selfAssessment)),
      averageSelfAssessmentDifference: average(allScores.map((score) => score.selfAssessmentDifference)),
    },
    byClass: buildGroups(filteredStudents, filteredResults, ["classCode", "gradeLevel", "track", "assessmentWindow", "cohort", "assessmentId"]),
    byGrade: buildGroups(filteredStudents, filteredResults, ["gradeLevel", "track", "assessmentWindow", "cohort", "assessmentId"]),
    itemAnalysis: buildItemAnalysis(filteredResults),
  };
};

export default async function handler(request, response) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    response.status(500).json({ ok: false, error: "DATABASE_URL ontbreekt." });
    return;
  }

  const sql = neon(databaseUrl);

  try {
    await ensureTables(sql);

    if (request.method === "GET") {
      if (!requireAdmin(request)) {
        response.status(401).json({ ok: false });
        return;
      }

      response.status(200).json({ ok: true, analysis: await listAnalysis(sql, request.query ?? {}) });
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

    if (
      !session ||
      !result ||
      !/^[0-9a-fA-F-]{36}$/.test(String(session.id ?? "")) ||
      !validVersionIds.has(versionId) ||
      !session.completedAt
    ) {
      response.status(400).json({ ok: false });
      return;
    }

    const sessionRows = await sql`
      SELECT access_code, class_code, class_id, session_json
      FROM assessment_sessions
      WHERE id = ${session.id}
      LIMIT 1
    `;
    const savedSession = sessionRows[0];
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
    const gradeLevel = String(studentMetadataRow.grade_level ?? versionMetadata.gradeLevel);
    const track = String(studentMetadataRow.track ?? versionMetadata.track);
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
    response.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Resultaat opslaan is mislukt.",
    });
  }
}
