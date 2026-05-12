import crypto from "node:crypto";

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

const safeEquals = (candidate, expected) => {
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);

  if (candidateBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(candidateBuffer, expectedBuffer);
};

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    response.status(405).json({ ok: false });
    return;
  }

  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) {
    response.status(500).json({ ok: false });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const password = typeof body.password === "string" ? body.password : "";

    if (!safeEquals(password, expectedPassword)) {
      response.status(401).json({ ok: false });
      return;
    }

    response.status(200).json({ ok: true });
  } catch {
    response.status(400).json({ ok: false });
  }
}
