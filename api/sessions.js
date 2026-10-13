import { neon } from "@neondatabase/serverless";
import { ensureTablesOnce } from "./results.js";

const validVersionIds = new Set(["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]);
const testAccessCodes = new Set(["TESTVMBO1", "TESTHV1", "TESTVMBO3", "TESTHV3"]);
const sha256Pattern = /^[0-9a-f]{64}$/;

const readJsonBody = async (request) => {
  if (request.body && typeof request.body === "object") return request.body;
  const chunks = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
};

const ensureTable = ensureTablesOnce;
export const createSessionsHandler = (connect = neon) => async function handler(request, response) {
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

    const sql = connect(databaseUrl);
    await ensureTable(sql);
    const revision = Number(session.storageRevision ?? Math.max(
      Date.parse(session.startedAt ?? "") || 0,
      ...(session.results ?? []).map(entry => Date.parse(entry.timestamp ?? "") || 0),
    ));
    if (!Number.isSafeInteger(revision) || revision < 0 || !Array.isArray(session.results)) {
      response.status(400).json({ ok: false }); return;
    }
    const persistedSession = { ...session, storageRevision: revision };
    // Share the final-save lock. Late and stale autosaves cannot recreate a
    // finished attempt, roll back its status, or replace a newer answer set.
    await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(hashtextextended(${session.id}, 0))`,
      sql`
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
      SELECT
        ${session.id},
        ${accessCode || null},
        ${classCode || null},
        ${classId},
        ${classToken || null},
        ${anonymousAttemptId},
        ${versionId},
        ${assessmentBuildVersion},
        ${assessmentContentHash},
        ${JSON.stringify(persistedSession)}::jsonb
      WHERE NOT EXISTS (SELECT 1 FROM assessment_results WHERE session_id = ${session.id})
      ON CONFLICT (id)
      DO UPDATE SET
        session_json = EXCLUDED.session_json,
        class_id = EXCLUDED.class_id,
        class_token = EXCLUDED.class_token,
        anonymous_attempt_id = EXCLUDED.anonymous_attempt_id,
        assessment_build_version = EXCLUDED.assessment_build_version,
        assessment_content_hash = EXCLUDED.assessment_content_hash,
        updated_at = NOW()
      WHERE (EXCLUDED.session_json->>'storageRevision')::bigint >= COALESCE((assessment_sessions.session_json->>'storageRevision')::bigint, 0)
        AND ((EXCLUDED.session_json->>'storageRevision')::bigint > COALESCE((assessment_sessions.session_json->>'storageRevision')::bigint, 0)
          OR jsonb_array_length(EXCLUDED.session_json->'results') >= jsonb_array_length(assessment_sessions.session_json->'results'))
        AND NOT EXISTS (SELECT 1 FROM assessment_results WHERE session_id = ${session.id})
    `,
    ...(accessCode ? [sql`
          UPDATE students
          SET status = 'in_progress', started_at = COALESCE(started_at, NOW()), updated_at = NOW()
          WHERE access_code = ${accessCode} AND class_code = ${classCode} AND version_id = ${versionId}
            AND status <> 'completed'
            AND NOT EXISTS (
              SELECT 1
              FROM assessment_results
              WHERE session_id = ${session.id}
            )
        `] : []),
    ]);

    response.status(200).json({ ok: true });
  } catch {
    response.status(400).json({ ok: false });
  }
};

export default createSessionsHandler();
