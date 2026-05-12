import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const validVersionIds = new Set(["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]);

const readJsonBody = async (request) => {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

const safeEquals = (candidate, expected) => {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  if (candidateBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
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
      access_code CHAR(4) NOT NULL,
      class_code TEXT,
      version_id TEXT NOT NULL,
      import_batch TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS class_code TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS import_batch TEXT`;
  await sql`ALTER TABLE students ALTER COLUMN student_number DROP NOT NULL`;
  await sql`ALTER TABLE students DROP CONSTRAINT IF EXISTS students_access_code_key`;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS students_access_code_class_code_key
    ON students (access_code, class_code)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS assessment_sessions (
      id UUID PRIMARY KEY,
      access_code CHAR(4) NOT NULL,
      class_code TEXT NOT NULL,
      version_id TEXT NOT NULL,
      session_json JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS assessment_results (
      session_id UUID PRIMARY KEY,
      access_code CHAR(4) NOT NULL,
      class_code TEXT NOT NULL,
      version_id TEXT NOT NULL,
      total_score INTEGER NOT NULL,
      max_score INTEGER NOT NULL,
      percentage INTEGER NOT NULL,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ NOT NULL,
      result_json JSONB NOT NULL,
      event_logs JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
};

const listResults = async (sql) => {
  const rows = await sql`
    SELECT session_id, access_code, class_code, version_id, total_score, max_score, percentage, completed_at, result_json
    FROM assessment_results
    ORDER BY completed_at DESC
    LIMIT 5000
  `;

  return rows.map((row) => ({
    sessionId: row.session_id,
    accessCode: row.access_code,
    classCode: row.class_code,
    versionId: row.version_id,
    totalScore: row.total_score,
    maxScore: row.max_score,
    percentage: row.percentage,
    completedAt: row.completed_at,
    resultJson: row.result_json,
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

      response.status(200).json({ ok: true, results: await listResults(sql) });
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
    const accessCode = String(session?.metadata?.accessCode ?? session?.accessCode ?? "").trim();
    const classCode = String(session?.metadata?.classCode ?? "").trim().toLowerCase();
    const versionId = String(session?.versionId ?? "");

    if (
      !session ||
      !result ||
      !/^[0-9a-fA-F-]{36}$/.test(String(session.id ?? "")) ||
      !/^\d{4}$/.test(accessCode) ||
      !classCode ||
      !validVersionIds.has(versionId) ||
      !session.completedAt
    ) {
      response.status(400).json({ ok: false });
      return;
    }

    const students = await sql`
      SELECT id
      FROM students
      WHERE access_code = ${accessCode}
        AND LOWER(class_code) = ${classCode}
      LIMIT 1
    `;

    if (students.length === 0) {
      response.status(404).json({ ok: false });
      return;
    }

    await sql`
      INSERT INTO assessment_results (
        session_id,
        access_code,
        class_code,
        version_id,
        total_score,
        max_score,
        percentage,
        started_at,
        completed_at,
        result_json,
        event_logs
      )
      VALUES (
        ${session.id},
        ${accessCode},
        ${classCode},
        ${versionId},
        ${Number(result.totalScore ?? 0)},
        ${Number(result.maxScore ?? 0)},
        ${Number(result.percentage ?? 0)},
        ${session.startedAt ? new Date(session.startedAt).toISOString() : null},
        ${new Date(session.completedAt).toISOString()},
        ${JSON.stringify({ session, result })}::jsonb,
        ${JSON.stringify(session.eventLogs ?? [])}::jsonb
      )
      ON CONFLICT (session_id)
      DO UPDATE SET
        total_score = EXCLUDED.total_score,
        max_score = EXCLUDED.max_score,
        percentage = EXCLUDED.percentage,
        completed_at = EXCLUDED.completed_at,
        result_json = EXCLUDED.result_json,
        event_logs = EXCLUDED.event_logs,
        updated_at = NOW()
    `;
    await sql`DELETE FROM assessment_sessions WHERE access_code = ${accessCode} AND LOWER(class_code) = ${classCode}`;

    response.status(200).json({ ok: true });
  } catch (error) {
    response.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Resultaat opslaan is mislukt.",
    });
  }
}
