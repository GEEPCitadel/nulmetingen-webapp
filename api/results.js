import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const validVersionIds = new Set(["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]);

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
  await sql`ALTER TABLE assessment_results ADD COLUMN IF NOT EXISTS self_assessment_score INTEGER`;
  await sql`ALTER TABLE assessment_results DROP COLUMN IF EXISTS access_code`;
  await sql`ALTER TABLE assessment_results DROP COLUMN IF EXISTS class_token`;
  await sql`ALTER TABLE assessment_results DROP COLUMN IF EXISTS anonymous_attempt_id`;
};

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
});

const listClassResults = async (sql) => {
  const rows = await sql`
    SELECT
      class_code,
      version_id,
      COUNT(*)::int AS completed_count,
      ROUND(AVG(percentage))::int AS average_percentage,
      MAX(completed_at) AS last_completed_at
    FROM assessment_results
    GROUP BY class_code, version_id
    ORDER BY class_code ASC, version_id ASC
    LIMIT 5000
  `;

  return rows.map((row) => ({
    classCode: row.class_code,
    versionId: row.version_id,
    completedCount: row.completed_count,
    averagePercentage: row.average_percentage,
    lastCompletedAt: row.last_completed_at,
  }));
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

      response.status(200).json({ ok: true, results: await listClassResults(sql) });
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

    const anonymousSession = anonymizeSession(session, classCode, classId);

    await sql`
      INSERT INTO assessment_results (
        session_id,
        class_code,
        class_id,
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
        ${versionId},
        ${Number(result.totalScore ?? 0)},
        ${Number(result.maxScore ?? 0)},
        ${Number(result.percentage ?? 0)},
        ${selfAssessmentScore},
        ${session.startedAt ? new Date(session.startedAt).toISOString() : null},
        ${new Date(session.completedAt).toISOString()},
        ${JSON.stringify({ session: anonymousSession, result })}::jsonb,
        ${JSON.stringify(session.eventLogs ?? [])}::jsonb
      )
      ON CONFLICT (session_id)
      DO UPDATE SET
        class_code = EXCLUDED.class_code,
        class_id = EXCLUDED.class_id,
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
