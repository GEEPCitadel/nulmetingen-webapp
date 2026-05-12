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

const requireAdmin = (request, body) => {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const headerPassword = request.headers["x-admin-password"];
  const bodyPassword = body && typeof body.adminPassword === "string" ? body.adminPassword : "";
  const candidate = typeof headerPassword === "string" ? headerPassword : bodyPassword;
  return Boolean(expectedPassword && candidate && safeEquals(candidate, expectedPassword));
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

const normalizeStudentRows = (students, versionId, importBatch) => {
  if (!Array.isArray(students)) return [];
  const seenAccounts = new Set();

  return students.map((student, index) => {
    const accessCode = typeof student.accessCode === "string" ? student.accessCode.trim() : "";
    const classCode = typeof student.classCode === "string" ? student.classCode.trim().toLowerCase() : "";

    if (!/^\d{4}$/.test(accessCode)) throw new Error(`Rij ${index + 1}: leerlingnummer moet uit precies vier cijfers bestaan.`);
    if (!classCode) throw new Error(`Rij ${index + 1}: klas ontbreekt.`);

    const accountKey = `${accessCode}:${classCode}`;
    if (seenAccounts.has(accountKey)) throw new Error(`Rij ${index + 1}: leerlingnummer ${accessCode} met klas ${classCode} staat dubbel in de import.`);
    seenAccounts.add(accountKey);

    return { accessCode, classCode, versionId, importBatch };
  });
};

const listStudents = async (sql) => {
  const rows = await sql`
    SELECT
      s.access_code,
      s.class_code,
      s.version_id,
      s.import_batch,
      s.updated_at,
      r.session_id,
      r.total_score,
      r.max_score,
      r.percentage,
      r.completed_at,
      sess.id AS active_session_id
    FROM students s
    LEFT JOIN LATERAL (
      SELECT *
      FROM assessment_results ar
      WHERE ar.access_code = s.access_code AND LOWER(ar.class_code) = LOWER(s.class_code)
      ORDER BY ar.completed_at DESC
      LIMIT 1
    ) r ON true
    LEFT JOIN LATERAL (
      SELECT id
      FROM assessment_sessions ase
      WHERE ase.access_code = s.access_code AND LOWER(ase.class_code) = LOWER(s.class_code)
      ORDER BY ase.updated_at DESC
      LIMIT 1
    ) sess ON true
    ORDER BY s.class_code ASC, s.access_code ASC
    LIMIT 10000
  `;

  return rows.map((row) => ({
    studentNumber: row.access_code,
    accessCode: row.access_code,
    classCode: row.class_code,
    versionId: row.version_id,
    importBatch: row.import_batch ?? "",
    status: row.session_id ? "completed" : row.active_session_id ? "in_progress" : "not_started",
    resultSessionId: row.session_id,
    totalScore: row.total_score,
    maxScore: row.max_score,
    percentage: row.percentage,
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
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
      if (!requireAdmin(request, null)) {
        response.status(401).json({ ok: false });
        return;
      }
      response.status(200).json({ ok: true, students: await listStudents(sql) });
      return;
    }

    if (request.method === "PATCH") {
      const body = await readJsonBody(request);
      if (!requireAdmin(request, body)) {
        response.status(401).json({ ok: false });
        return;
      }

      if (body.action !== "reopen") {
        response.status(400).json({ ok: false, error: "Onbekende actie." });
        return;
      }

      const accessCode = String(body.accessCode ?? "").trim();
      const classCode = String(body.classCode ?? "").trim().toLowerCase();
      if (!/^\d{4}$/.test(accessCode) || !classCode) {
        response.status(400).json({ ok: false, error: "Leerlingnummer of klas ontbreekt." });
        return;
      }

      await sql`DELETE FROM assessment_results WHERE access_code = ${accessCode} AND LOWER(class_code) = ${classCode}`;
      await sql`DELETE FROM assessment_sessions WHERE access_code = ${accessCode} AND LOWER(class_code) = ${classCode}`;
      response.status(200).json({ ok: true, students: await listStudents(sql) });
      return;
    }

    if (request.method !== "POST") {
      response.setHeader("Allow", "GET, POST, PATCH");
      response.status(405).json({ ok: false });
      return;
    }

    const body = await readJsonBody(request);
    if (!requireAdmin(request, body)) {
      response.status(401).json({ ok: false });
      return;
    }

    const versionId = typeof body.versionId === "string" ? body.versionId : "";
    if (!validVersionIds.has(versionId)) {
      response.status(400).json({ ok: false, error: "Kies een geldige nulmetingversie." });
      return;
    }

    const importBatch = String(body.importBatch ?? "").trim() || `Import ${new Date().toISOString().slice(0, 10)}`;
    const rows = normalizeStudentRows(body.students, versionId, importBatch);
    if (rows.length === 0) {
      response.status(400).json({ ok: false, error: "Geen leerlingen gevonden in de import." });
      return;
    }

    for (const row of rows) {
      await sql`
        INSERT INTO students (student_number, access_code, class_code, version_id, import_batch)
        VALUES (${`${row.classCode}:${row.accessCode}`}, ${row.accessCode}, ${row.classCode}, ${row.versionId}, ${row.importBatch})
        ON CONFLICT (access_code, class_code)
        DO UPDATE SET
          version_id = EXCLUDED.version_id,
          import_batch = EXCLUDED.import_batch,
          updated_at = NOW()
      `;
    }

    response.status(200).json({ ok: true, importedCount: rows.length, students: await listStudents(sql) });
  } catch (error) {
    response.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Importeren is mislukt.",
    });
  }
}
