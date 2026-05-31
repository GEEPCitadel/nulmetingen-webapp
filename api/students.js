import crypto from "node:crypto";
import { neon } from "@neondatabase/serverless";

const validVersionIds = new Set(["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]);
const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const testStudents = [
  {
    participantLabel: "Testleerling VMBO leerjaar 1",
    accessCode: "TESTVMBO1",
    classCode: "test-vmbo1",
    versionId: "lj1-vmbo",
    importBatch: "Standaard test",
    status: "not_started",
    completedAt: null,
    updatedAt: null,
  },
  {
    participantLabel: "Testleerling HAVO/VWO leerjaar 1",
    accessCode: "TESTHV1",
    classCode: "test-hv1",
    versionId: "lj1-hv",
    importBatch: "Standaard test",
    status: "not_started",
    completedAt: null,
    updatedAt: null,
  },
  {
    participantLabel: "Testleerling VMBO leerjaar 3",
    accessCode: "TESTVMBO3",
    classCode: "test-vmbo3",
    versionId: "lj3-vmbo",
    importBatch: "Standaard test",
    status: "not_started",
    completedAt: null,
    updatedAt: null,
  },
  {
    participantLabel: "Testleerling HAVO/VWO leerjaar 3",
    accessCode: "TESTHV3",
    classCode: "test-hv3",
    versionId: "lj3-hv",
    importBatch: "Standaard test",
    status: "not_started",
    completedAt: null,
    updatedAt: null,
  },
];

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
};

const normalizeStudentRows = (students, versionId, importBatch) => {
  if (!Array.isArray(students)) return [];
  return students.map((student, index) => {
    const classCode = typeof student.classCode === "string" ? student.classCode.trim().toLowerCase() : "";
    const participantLabel =
      typeof student.participantLabel === "string" ? student.participantLabel.trim() : "";

    if (!classCode) throw new Error(`Rij ${index + 1}: klas ontbreekt.`);
    return { classCode, participantLabel, versionId, importBatch };
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
    SELECT access_code, participant_label, class_code, version_id, import_batch, status, completed_at, updated_at
    FROM students
    ORDER BY class_code ASC, participant_label ASC, access_code ASC
    LIMIT 10000
  `;

  const storedStudents = rows.map((row) => ({
    participantLabel: row.participant_label ?? "",
    accessCode: row.access_code,
    classCode: row.class_code,
    versionId: row.version_id,
    importBatch: row.import_batch ?? "",
    status: row.status ?? "not_started",
    completedAt: row.completed_at,
    updatedAt: row.updated_at,
  }));
  const storedCodes = new Set(storedStudents.map((student) => student.accessCode));
  return [
    ...testStudents.filter((student) => !storedCodes.has(student.accessCode)),
    ...storedStudents,
  ];
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

      if (body.action !== "reopen" && body.action !== "delete") {
        response.status(400).json({ ok: false, error: "Onbekende actie." });
        return;
      }

      if (body.action === "delete") {
        const accessCodes = Array.isArray(body.accessCodes)
          ? body.accessCodes.map((code) => String(code ?? "").trim().toUpperCase())
          : [String(body.accessCode ?? "").trim().toUpperCase()];
        const uniqueAccessCodes = Array.from(new Set(accessCodes)).filter((code) => /^[A-Z0-9]{6,12}$/.test(code));
        if (uniqueAccessCodes.length === 0) {
          response.status(400).json({ ok: false, error: "Kies minimaal een geldige afnamecode." });
          return;
        }

        const sessions = await sql`
          SELECT id FROM assessment_sessions
          WHERE access_code = ANY(${uniqueAccessCodes})
        `;
        const sessionIds = sessions.map((session) => session.id);
        if (sessionIds.length > 0) {
          await sql`DELETE FROM assessment_results WHERE session_id = ANY(${sessionIds})`;
        }
        await sql`DELETE FROM assessment_sessions WHERE access_code = ANY(${uniqueAccessCodes})`;
        await sql`DELETE FROM students WHERE access_code = ANY(${uniqueAccessCodes})`;
        response.status(200).json({ ok: true, students: await listStudents(sql) });
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
      const accessCode = await createUniqueCode(sql);
      await sql`
        INSERT INTO students (student_number, participant_label, access_code, class_code, version_id, import_batch)
        VALUES (${accessCode}, ${row.participantLabel || null}, ${accessCode}, ${row.classCode}, ${row.versionId}, ${row.importBatch})
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
