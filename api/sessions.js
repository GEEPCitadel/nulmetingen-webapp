import { neon } from "@neondatabase/serverless";

const validVersionIds = new Set(["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]);
const testAccessCodes = new Set(["TESTVMBO1", "TESTHV1", "TESTVMBO3", "TESTHV3"]);
const sha256Pattern = /^[0-9a-f]{64}$/;

const readJsonBody = async (request) => {
  if (request.body && typeof request.body === "object") return request.body;
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
};

const ensureTable = async (sql) => {
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
  await sql`ALTER TABLE assessment_sessions ALTER COLUMN access_code DROP NOT NULL`;
  await sql`ALTER TABLE assessment_sessions ALTER COLUMN class_code DROP NOT NULL`;

  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'not_started'`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`;
  await sql`ALTER TABLE students ALTER COLUMN access_code TYPE TEXT`;
  await sql`ALTER TABLE students DROP COLUMN IF EXISTS participant_label`;
  await sql`ALTER TABLE students DROP COLUMN IF EXISTS student_number`;
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
    const session = body.session && typeof body.session === "object" ? body.session : null;
    const anonymousAttemptId = String(session?.metadata?.anonymousAttemptId ?? "").trim();
    const accessCode = String(session?.metadata?.accessCode ?? session?.accessCode ?? "")
      .trim()
      .toUpperCase();
    const classId = String(session?.metadata?.classId ?? "").trim().toLowerCase();
    const classToken = String(session?.metadata?.classToken ?? "").trim();
    const classCode = String(session?.metadata?.classCode ?? classId).trim().toLowerCase();
    const versionId = String(session?.versionId ?? "");
    const assessmentBuildVersion = String(session?.assessmentBuildVersion ?? "").trim();
    const assessmentContentHash = String(session?.assessmentContentHash ?? "").trim().toLowerCase();

    if (
      !session ||
      session.completedAt ||
      !/^[0-9a-fA-F-]{36}$/.test(String(session.id ?? "")) ||
      !classId ||
      !anonymousAttemptId ||
      !validVersionIds.has(versionId) ||
      !assessmentBuildVersion ||
      !sha256Pattern.test(assessmentContentHash)
    ) {
      response.status(400).json({ ok: false });
      return;
    }

    // Test runs must not create a resumable session or affect class progress.
    if (testAccessCodes.has(accessCode)) {
      response.status(200).json({ ok: true });
      return;
    }

    const sql = neon(databaseUrl);
    await ensureTable(sql);
    // A browser can still have one earlier autosave request in flight when the
    // final result is stored. Keep that late request from changing a completed
    // code back to "in_progress".
    const resultTableRows = await sql`SELECT to_regclass('public.assessment_results') AS table_name`;
    const hasResultTable = Boolean(resultTableRows[0]?.table_name);
    await sql`
      INSERT INTO assessment_sessions (
        id,
        access_code,
        class_code,
        class_id,
        class_token,
        anonymous_attempt_id,
        version_id,
        assessment_build_version,
        assessment_content_hash,
        session_json
      )
      VALUES (
        ${session.id},
        ${accessCode || null},
        ${classCode || null},
        ${classId},
        ${classToken || null},
        ${anonymousAttemptId},
        ${versionId},
        ${assessmentBuildVersion},
        ${assessmentContentHash},
        ${JSON.stringify(session)}::jsonb
      )
      ON CONFLICT (id)
      DO UPDATE SET
        session_json = EXCLUDED.session_json,
        class_id = EXCLUDED.class_id,
        class_token = EXCLUDED.class_token,
        anonymous_attempt_id = EXCLUDED.anonymous_attempt_id,
        assessment_build_version = EXCLUDED.assessment_build_version,
        assessment_content_hash = EXCLUDED.assessment_content_hash,
        updated_at = NOW()
    `;

    if (hasResultTable) {
      const completedResultRows = await sql`
        SELECT completed_at
        FROM assessment_results
        WHERE session_id = ${session.id}
        LIMIT 1
      `;
      if (completedResultRows.length > 0) {
        if (accessCode) {
          await sql`
            UPDATE students
            SET status = 'completed',
                completed_at = COALESCE(completed_at, ${completedResultRows[0].completed_at}),
                updated_at = NOW()
            WHERE access_code = ${accessCode}
          `;
        }
        await sql`DELETE FROM assessment_sessions WHERE id = ${session.id}`;
        response.status(200).json({ ok: true });
        return;
      }
    }
    if (accessCode) {
      if (hasResultTable) {
        await sql`
          UPDATE students
          SET status = 'in_progress', started_at = COALESCE(started_at, NOW()), updated_at = NOW()
          WHERE access_code = ${accessCode}
            AND status <> 'completed'
            AND NOT EXISTS (
              SELECT 1
              FROM assessment_results
              WHERE session_id = ${session.id}
            )
        `;
      } else {
        await sql`
          UPDATE students
          SET status = 'in_progress', started_at = COALESCE(started_at, NOW()), updated_at = NOW()
          WHERE access_code = ${accessCode} AND status <> 'completed'
        `;
      }
    }

    response.status(200).json({ ok: true });
  } catch {
    response.status(400).json({ ok: false });
  }
}
