import { neon } from "@neondatabase/serverless";

const validVersionIds = new Set(["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]);

const readJsonBody = async (request) => {
  if (request.body && typeof request.body === "object") return request.body;
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
};

const ensureTable = async (sql) => {
  await sql`
    CREATE TABLE IF NOT EXISTS assessment_sessions (
      id UUID PRIMARY KEY,
      access_code CHAR(4),
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
  await sql`ALTER TABLE assessment_sessions ALTER COLUMN access_code DROP NOT NULL`;
  await sql`ALTER TABLE assessment_sessions ALTER COLUMN class_code DROP NOT NULL`;
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
    const accessCode = String(
      session?.metadata?.accessCode ?? session?.accessCode ?? anonymousAttemptId.slice(0, 4) ?? "",
    )
      .trim()
      .slice(0, 4);
    const classId = String(session?.metadata?.classId ?? "").trim().toLowerCase();
    const classToken = String(session?.metadata?.classToken ?? "").trim();
    const classCode = String(session?.metadata?.classCode ?? classId).trim().toLowerCase();
    const versionId = String(session?.versionId ?? "");

    if (
      !session ||
      session.completedAt ||
      !/^[0-9a-fA-F-]{36}$/.test(String(session.id ?? "")) ||
      !classId ||
      !anonymousAttemptId ||
      !validVersionIds.has(versionId)
    ) {
      response.status(400).json({ ok: false });
      return;
    }

    const sql = neon(databaseUrl);
    await ensureTable(sql);
    await sql`
      INSERT INTO assessment_sessions (
        id,
        access_code,
        class_code,
        class_id,
        class_token,
        anonymous_attempt_id,
        version_id,
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
        ${JSON.stringify(session)}::jsonb
      )
      ON CONFLICT (id)
      DO UPDATE SET
        session_json = EXCLUDED.session_json,
        class_id = EXCLUDED.class_id,
        class_token = EXCLUDED.class_token,
        anonymous_attempt_id = EXCLUDED.anonymous_attempt_id,
        updated_at = NOW()
    `;

    response.status(200).json({ ok: true });
  } catch {
    response.status(400).json({ ok: false });
  }
}
