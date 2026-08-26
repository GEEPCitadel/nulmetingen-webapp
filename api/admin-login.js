import { accessForPassword } from "./access.js";

const readJsonBody = async (request) => {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false });
    return;
  }

  if (!process.env.ADMIN_PASSWORD) {
    response.status(500).json({ ok: false });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const password = typeof body.password === "string" ? body.password : "";

    const access = accessForPassword(password);
    if (!access) {
      response.status(401).json({ ok: false });
      return;
    }

    response.status(200).json({ ok: true, access });
  } catch {
    response.status(400).json({ ok: false });
  }
}
