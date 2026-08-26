import crypto from "node:crypto";

const safeEquals = (candidate, expected) => {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return candidateBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
};

const mentorAccessFromEnvironment = () => {
  const raw = process.env.MENTOR_ACCESS_JSON;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => ({
        password: typeof entry?.password === "string" ? entry.password : "",
        classCodes: Array.isArray(entry?.classCodes)
          ? entry.classCodes.map((classCode) => String(classCode).trim()).filter(Boolean)
          : [],
      }))
      .filter((entry) => entry.password && entry.classCodes.length > 0);
  } catch {
    return [];
  }
};

export const accessForPassword = (candidate) => {
  const password = typeof candidate === "string" ? candidate : "";
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminPassword && password && safeEquals(password, adminPassword)) {
    return { role: "admin", classCodes: [] };
  }

  const mentor = mentorAccessFromEnvironment().find((entry) => safeEquals(password, entry.password));
  return mentor ? { role: "mentor", classCodes: mentor.classCodes } : null;
};

export const accessForRequest = (request) => {
  const headerPassword = request.headers["x-admin-password"];
  return accessForPassword(typeof headerPassword === "string" ? headerPassword : "");
};
