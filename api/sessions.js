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
      access_code CHAR(4) NOT NULL,
      class_code TEXT NOT NULL,
      version_id TEXT NOT NULL,
      session_json JSONB NOT NULL,
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
    const session = body.session && typeof body.session === "object" ? body.session : null;
    const accessCode = String(session?.metadata?.accessCode ?? session?.accessCode ?? "").trim();
    const classCode = String(session?.metadata?.classCode ?? "").trim().toLowerCase();
    const versionId = String(session?.versionId ?? "");

    if (
      !session ||
      session.completedAt ||
      !/^[0-9a-fA-F-]{36}$/.test(String(session.id ?? "")) ||
      !/^\d{4}$/.test(accessCode) ||
      !classCode ||
      !validVersionIds.has(versionId)
    ) {
      response.status(400).json({ ok: false });
      return;
    }

    const sql = neon(databaseUrl);
    await ensureTable(sql);
    await sql`
      INSERT INTO assessment_sessions (id, access_code, class_code, version_id, session_json)
      VALUES (${session.id}, ${accessCode}, ${classCode}, ${versionId}, ${JSON.stringify(session)}::jsonb)
      ON CONFLICT (id)
      DO UPDATE SET
        session_json = EXCLUDED.session_json,
        updated_at = NOW()
    `;

    response.status(200).json({ ok: true });
  } catch {
    response.status(400).json({ ok: false });
  }
}
