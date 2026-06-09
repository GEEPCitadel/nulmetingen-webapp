import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const validVersionIds = new Set(["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]);
const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const removedLegacyCodes = ["1001", "1002", "1003", "1004"];

const metadataForVersion = (versionId) => {
  const [gradePart = "", trackPart = ""] = String(versionId).split("-");
  return {
    gradeLevel: gradePart === "lj3" ? "lj3" : "lj1",
    track: trackPart === "hv" ? "hv" : "vmbo",
  };
};

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

const generateAccessCode = () =>
  Array.from({ length: 6 }, () => codeAlphabet[crypto.randomInt(codeAlphabet.length)]).join("");

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
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS class_code TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS class_id TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS assessment_id TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS grade_level TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS track TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS cohort TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS assessment_window TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS import_batch TEXT`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'not_started'`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ`;
  await sql`ALTER TABLE students ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`;
  await sql`ALTER TABLE students ALTER COLUMN access_code TYPE TEXT`;
  await sql`ALTER TABLE students ALTER COLUMN student_number DROP NOT NULL`;
  await sql`ALTER TABLE students DROP CONSTRAINT IF EXISTS students_access_code_key`;

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

  for (const code of removedLegacyCodes) {
    await sql`DELETE FROM assessment_sessions WHERE access_code = ${code}`;
    await sql`DELETE FROM students WHERE access_code = ${code} OR student_number = ${code}`;
  }
};

const normalizeStudentRows = (students, versionId, importBatch) => {
  if (!Array.isArray(students)) return [];
  const fallbackMetadata = metadataForVersion(versionId);
  return students.map((student, index) => {
    const classCode = typeof student.classCode === "string" ? student.classCode.trim().toLowerCase() : "";
    const participantLabel =
      typeof student.participantLabel === "string" ? student.participantLabel.trim() : "";
    const classId = String(student.classId ?? classCode).trim().toLowerCase();
    const assessmentId = String(student.assessmentId ?? versionId).trim();
    const gradeLevel = String(student.gradeLevel ?? fallbackMetadata.gradeLevel).trim().toLowerCase();
    const track = String(student.track ?? fallbackMetadata.track).trim().toLowerCase();
    const cohort = String(student.cohort ?? importBatch).trim();
    const assessmentWindow = String(student.assessmentWindow ?? importBatch).trim();

    if (!classCode) throw new Error(`Rij ${index + 1}: klas ontbreekt.`);
    return {
      classCode,
      participantLabel,
      versionId,
      importBatch,
      classId: classId || classCode,
      assessmentId: assessmentId || versionId,
      gradeLevel,
      track,
      cohort,
      assessmentWindow,
    };
  });
};

const createUniqueCode = async (sql) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = generateAccessCode();
    const rows = await sql`SELECT 1 FROM students WHERE access_code = ${code} LIMIT 1`;
    if (rows.length === 0) return code;
  }
  throw new Error("Kon geen unieke afnamecode genereren.");
};

const listStudents = async (sql) => {
  const rows = await sql`
    SELECT access_code, participant_label, class_code, class_id, version_id, assessment_id, grade_level, track, cohort, assessment_window, import_batch, status, completed_at, updated_at
    FROM students
    ORDER BY class_code ASC, participant_label ASC, access_code ASC
    LIMIT 10000
  `;

  const storedStudents = rows.map((row) => ({
    ...metadataForVersion(row.version_id),
    participantLabel: row.participant_label ?? "",
    accessCode: row.access_code,
    classCode: row.class_code,
    classId: row.class_id ?? row.class_code,
    versionId: row.version_id,
    assessmentId: row.assessment_id ?? row.version_id,
    gradeLevel: row.grade_level ?? metadataForVersion(row.version_id).gradeLevel,
    track: row.track ?? metadataForVersion(row.version_id).track,
    cohort: row.cohort ?? row.import_batch ?? "",
    assessmentWindow: row.assessment_window ?? row.import_batch ?? "",
    importBatch: row.import_batch ?? "",
    status: row.status ?? "not_started",
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  }));
  return storedStudents;
};

const normalizeCodeList = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => String(item ?? "").trim().toUpperCase())
        .filter((item) => /^[A-Z0-9]{4,12}$/.test(item))
    : [];

const normalizeTextList = (value) =>
  Array.isArray(value)
    ? value
        .map((item) => String(item ?? "").trim().toLowerCase())
        .filter(Boolean)
    : [];

const deleteStudentsByCodes = async (sql, accessCodes) => {
  const uniqueCodes = Array.from(new Set(accessCodes));
  let deletedCount = 0;
  for (const accessCode of uniqueCodes) {
    const deletedRows = await sql`DELETE FROM students WHERE access_code = ${accessCode} RETURNING access_code`;
    deletedCount += deletedRows.length;
    await sql`DELETE FROM assessment_sessions WHERE access_code = ${accessCode}`;
  }
  return deletedCount;
};

const accessCodesForClasses = async (sql, classCodes) => {
  const codes = [];
  for (const classCode of Array.from(new Set(classCodes))) {
    const rows = await sql`SELECT access_code FROM students WHERE lower(class_code) = ${classCode}`;
    codes.push(...rows.map((row) => row.access_code));
  }
  return codes;
};

const accessCodesForYears = async (sql, yearIds) => {
  const codes = [];
  for (const yearId of Array.from(new Set(yearIds))) {
    if (yearId !== "lj1" && yearId !== "lj3") continue;
    const rows = await sql`SELECT access_code FROM students WHERE version_id LIKE ${`${yearId}-%`}`;
    codes.push(...rows.map((row) => row.access_code));
  }
  return codes;
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

      const accessCode = String(body.accessCode ?? "").trim().toUpperCase();
      if (!/^[A-Z0-9]{6,12}$/.test(accessCode)) {
        response.status(400).json({ ok: false, error: "Afnamecode ontbreekt." });
        return;
      }

      await sql`
        UPDATE students
        SET status = 'not_started', started_at = NULL, completed_at = NULL, updated_at = NOW()
        WHERE access_code = ${accessCode}
      `;
      await sql`DELETE FROM assessment_sessions WHERE access_code = ${accessCode}`;
      response.status(200).json({ ok: true, students: await listStudents(sql) });
      return;
    }

    if (request.method === "DELETE") {
      const body = await readJsonBody(request);
      if (!requireAdmin(request, body)) {
        response.status(401).json({ ok: false });
        return;
      }

      const action = String(body.action ?? "");
      let accessCodes = [];
      if (action === "deleteStudents") {
        accessCodes = normalizeCodeList(body.accessCodes);
      } else if (action === "deleteClasses") {
        accessCodes = await accessCodesForClasses(sql, normalizeTextList(body.classCodes));
      } else if (action === "deleteYears") {
        accessCodes = await accessCodesForYears(sql, normalizeTextList(body.yearIds));
      } else {
        response.status(400).json({ ok: false, error: "Onbekende wisactie." });
        return;
      }

      if (accessCodes.length === 0) {
        response.status(400).json({ ok: false, error: "Geen leerlingen gevonden om te wissen." });
        return;
      }

      const deletedCount = await deleteStudentsByCodes(sql, accessCodes);
      response.status(200).json({ ok: true, deletedCount, students: await listStudents(sql) });
      return;
    }

    if (request.method !== "POST") {
      response.setHeader("Allow", "GET, POST, PATCH, DELETE");
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

    const createdStudents = [];
    for (const row of rows) {
      const accessCode = await createUniqueCode(sql);
      await sql`
        INSERT INTO students (
          student_number,
          participant_label,
          access_code,
          class_code,
          class_id,
          version_id,
          assessment_id,
          grade_level,
          track,
          cohort,
          assessment_window,
          import_batch
        )
        VALUES (
          ${accessCode},
          ${row.participantLabel || null},
          ${accessCode},
          ${row.classCode},
          ${row.classId},
          ${row.versionId},
          ${row.assessmentId},
          ${row.gradeLevel},
          ${row.track},
          ${row.cohort || null},
          ${row.assessmentWindow || null},
          ${row.importBatch}
        )
      `;
      createdStudents.push({
        participantLabel: row.participantLabel,
        accessCode,
        classCode: row.classCode,
        classId: row.classId,
        versionId: row.versionId,
        assessmentId: row.assessmentId,
        gradeLevel: row.gradeLevel,
        track: row.track,
        cohort: row.cohort,
        assessmentWindow: row.assessmentWindow,
        importBatch: row.importBatch,
        status: "not_started",
      });
    }

    response.status(200).json({ ok: true, importedCount: rows.length, createdStudents, students: await listStudents(sql) });
  } catch (error) {
    response.status(400).json({
      ok: false,
      error: error instanceof Error ? error.message : "Importeren is mislukt.",
    });
  }
}
