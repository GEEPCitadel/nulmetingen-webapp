import { neon } from "@neondatabase/serverless";

const validVersionIds = new Set(["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]);

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
      student_number TEXT UNIQUE,
      access_code CHAR(4) NOT NULL,
      class_code TEXT NOT NULL,
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

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false });
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    response.status(500).json({ ok: false });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const code = typeof body.code === "string" ? body.code.trim() : "";
    const classCode = typeof body.classCode === "string" ? body.classCode.trim().toLowerCase() : "";

    if (!/^\d{4}$/.test(code) || !classCode) {
      response.status(400).json({ ok: false });
      return;
    }

    const sql = neon(databaseUrl);
    await ensureTables(sql);

    const rows = await sql`
      SELECT access_code, class_code, version_id
      FROM students
      WHERE access_code = ${code}
        AND LOWER(class_code) = ${classCode}
      LIMIT 1
    `;
    const student = rows[0];

    if (!student || !validVersionIds.has(student.version_id)) {
      response.status(404).json({ ok: false });
      return;
    }

    const completedRows = await sql`
      SELECT result_json
      FROM assessment_results
      WHERE access_code = ${code}
        AND LOWER(class_code) = ${classCode}
      ORDER BY completed_at DESC
      LIMIT 1
    `;
    if (completedRows[0]?.result_json?.session) {
      response.status(200).json({
        ok: true,
        status: "completed",
        session: completedRows[0].result_json.session,
        student: {
          studentNumber: student.access_code,
          accessCode: student.access_code,
          classCode: student.class_code,
          versionId: student.version_id,
        },
      });
      return;
    }

    const sessionRows = await sql`
      SELECT session_json
      FROM assessment_sessions
      WHERE access_code = ${code}
        AND LOWER(class_code) = ${classCode}
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    if (sessionRows[0]?.session_json) {
      response.status(200).json({
        ok: true,
        status: "in_progress",
        session: sessionRows[0].session_json,
        student: {
          studentNumber: student.access_code,
          accessCode: student.access_code,
          classCode: student.class_code,
          versionId: student.version_id,
        },
      });
      return;
    }

    response.status(200).json({
      ok: true,
      status: "not_started",
      student: {
        studentNumber: student.access_code,
        accessCode: student.access_code,
        classCode: student.class_code,
        versionId: student.version_id,
      },
    });
  } catch {
    response.status(500).json({ ok: false });
  }
}
