import { accessForRequest, mentorPasswordForClass } from "./access.js";

export default function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    response.status(405).json({ ok: false });
    return;
  }

  const access = accessForRequest(request);
  if (!access || access.role !== "admin") {
    response.status(401).json({ ok: false });
    return;
  }

  const classCode = String(request.query?.classCode ?? "").trim().toLowerCase();
  const mentorCode = mentorPasswordForClass(classCode);
  if (!mentorCode) {
    response.status(404).json({ ok: false, error: "Voor deze klas is nog geen mentorcode ingericht." });
    return;
  }

  response.status(200).json({ ok: true, classCode, mentorCode });
}
