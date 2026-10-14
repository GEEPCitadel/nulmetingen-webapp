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
    const resets=session.resultResets ?? {};
    if (!Number.isSafeInteger(revision) || revision < 0 || !Array.isArray(session.results)
      || typeof resets!=="object" || Array.isArray(resets)
      || Object.values(resets).some(value=>!Number.isSafeInteger(value) || value<0)
      || session.results.some(entry=>!entry || typeof entry.itemId!=="string" || !Number.isFinite(Date.parse(entry.timestamp)))) {
      response.status(400).json({ ok: false }); return;
    }
    const persistedSession = { ...session, storageRevision: revision };
    // Share the final-save lock. Late and stale autosaves cannot recreate a
    // finished attempt, roll back its status, or replace a newer answer set.
    const writes = await sql.transaction([
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
        session_json = (
          SELECT jsonb_set(jsonb_set(
            CASE WHEN (EXCLUDED.session_json->>'storageRevision')::bigint >= COALESCE((assessment_sessions.session_json->>'storageRevision')::bigint,0)
              THEN EXCLUDED.session_json ELSE assessment_sessions.session_json END,
            '{resultResets}', merged_resets.resets), '{results}',
            COALESCE((SELECT jsonb_agg(latest.entry ORDER BY latest.entry->>'itemId') FROM (
              SELECT DISTINCT ON (entry->>'itemId') entry
              FROM (
                SELECT entry,0 AS incoming FROM jsonb_array_elements(assessment_sessions.session_json->'results') AS entries(entry)
                UNION ALL
                SELECT entry,1 AS incoming FROM jsonb_array_elements(EXCLUDED.session_json->'results') AS entries(entry)
              ) AS candidates
              WHERE EXTRACT(EPOCH FROM (entry->>'timestamp')::timestamptz)*1000 >
                COALESCE((merged_resets.resets->>(entry->>'itemId'))::bigint,-1)
              ORDER BY entry->>'itemId',(entry->>'timestamp')::timestamptz DESC,incoming DESC
            ) AS latest),'[]'::jsonb))
          FROM (
            SELECT COALESCE(jsonb_object_agg(key,reset_at),'{}'::jsonb) AS resets FROM (
              SELECT key,MAX(value::text::bigint) AS reset_at FROM (
                SELECT key,value FROM jsonb_each(COALESCE(assessment_sessions.session_json->'resultResets','{}'::jsonb))
                UNION ALL
                SELECT key,value FROM jsonb_each(COALESCE(EXCLUDED.session_json->'resultResets','{}'::jsonb))
              ) AS all_resets GROUP BY key
            ) AS latest_resets
          ) AS merged_resets
        ),
        class_id = EXCLUDED.class_id,
        class_token = EXCLUDED.class_token,
        anonymous_attempt_id = EXCLUDED.anonymous_attempt_id,
        assessment_build_version = EXCLUDED.assessment_build_version,
        assessment_content_hash = EXCLUDED.assessment_content_hash,
        updated_at = NOW()
      WHERE assessment_sessions.version_id=EXCLUDED.version_id
        AND (assessment_sessions.class_id IS NULL OR assessment_sessions.class_id=EXCLUDED.class_id)
        AND (assessment_sessions.assessment_build_version IS NULL OR assessment_sessions.assessment_build_version=EXCLUDED.assessment_build_version)
        AND (assessment_sessions.assessment_content_hash IS NULL OR assessment_sessions.assessment_content_hash=EXCLUDED.assessment_content_hash)
        AND NOT EXISTS (SELECT 1 FROM assessment_results WHERE session_id = ${session.id})
      RETURNING id
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

    if (!writes[1]?.length) {
      const finished=await sql`SELECT session_id FROM assessment_results WHERE session_id=${session.id}`;
      if(!finished.length) {response.status(409).json({ok:false,error:"De opgeslagen afnameversie komt niet overeen. Antwoorden zijn niet overschreven."});return;}
    }

    response.status(200).json({ ok: true });
  } catch {
    response.status(400).json({ ok: false });
  }
};

export default createSessionsHandler();
