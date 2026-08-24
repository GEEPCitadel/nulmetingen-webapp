import { neon } from "@neondatabase/serverless";

const validVersionIds = new Set(["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]);
const removedLegacyCodes = ["1001", "1002", "1003", "1004"];
const testCodes = {
  TESTVMBO1: {
    access_code: "TESTVMBO1",
    class_code: "test-vmbo1",
    version_id: "lj1-vmbo",
    status: "not_started",
  },
  TESTHV1: {
    access_code: "TESTHV1",
    class_code: "test-hv1",
    version_id: "lj1-hv",
    status: "not_started",
  },
  TESTVMBO3: {
    access_code: "TESTVMBO3",
    class_code: "test-vmbo3",
    version_id: "lj3-vmbo",
    status: "not_started",
  },
  TESTHV3: {
    access_code: "TESTHV3",
    class_code: "test-hv3",
    version_id: "lj3-hv",
    status: "not_started",
  },
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
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS class_code TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS import_batch TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'not_started'`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`;
  await sql`ALTER TABLE students ALTER COLUMN access_code TYPE TEXT`;
  await sql`ALTER TABLE students DROP CONSTRAINT IF EXISTS students_access_code_key`;
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
      session_json JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  for (const code of removedLegacyCodes) {
    await sql`DELETE FROM assessment_sessions WHERE access_code = ${code}`;
    await sql`DELETE FROM students WHERE access_code = ${code}`;
  }
};

const sanitizeSessionForStudent = (sessionJson) => {
  if (!sessionJson || typeof sessionJson !== "object") return sessionJson;
  return {
    ...sessionJson,
    metadata: {
      ...(sessionJson.metadata ?? {}),
      accessCode: undefined,
    },
  };
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const code = typeof body.code === "string" ? body.code.trim().toUpperCase() : "";
    const testCode = testCodes[code];

    if (!/^[A-Z0-9]{6,12}$/.test(code)) {
      response.status(400).json({ ok: false });
      return;
    }

    // Test codes are intentionally outside the database. They never identify a
    // learner and their sessions/results are discarded by the other endpoints.
    if (testCode) {
      response.status(200).json({
        ok: true,
        status: "not_started",
        student: {
          accessCode: testCode.access_code,
          classCode: testCode.class_code,
          versionId: testCode.version_id,
          isTest: true,
        },
      });
      return;
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      response.status(500).json({ ok: false });
      return;
    }

    const sql = neon(databaseUrl);
    await ensureTables(sql);

    const rows = await sql`
      SELECT access_code, class_code, version_id, status
      FROM students
      WHERE access_code = ${code}
      LIMIT 1
    `;
    const student = rows[0];

    if (!student || !validVersionIds.has(student.version_id)) {
      response.status(404).json({ ok: false });
      return;
    }

    if (student.status === "completed") {
      response.status(200).json({
        ok: true,
        status: "completed",
        student: {
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
      ORDER BY updated_at DESC
      LIMIT 1
    `;
    if (sessionRows[0]?.session_json) {
      response.status(200).json({
        ok: true,
        status: "in_progress",
        session: sanitizeSessionForStudent(sessionRows[0].session_json),
        student: {
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
        accessCode: student.access_code,
        classCode: student.class_code,
        versionId: student.version_id,
      },
    });
  } catch {
    response.status(500).json({ ok: false });
  }
}
