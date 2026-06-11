// POST /api/finalize — herscoort multiple-choice-items server-side en berekent
// het eindresultaat. De client kent geen correcte MC-antwoorden meer.
// Kiest de instrumentvorm op basis van het meetmoment van de sessie
// (nulmeting of voortgangsmeting met bankvarianten).
import { assessmentMapForMoment } from "../src/data/assessments.server";
import { calculateResult, rescoreSessionResults } from "../src/lib/assessment";
import type { AssessmentSession, AssessmentVersionId } from "../src/types";

const validVersionIds = new Set(["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]);

const readJsonBody = async (request: any) => {
  if (request.body && typeof request.body === "object") return request.body;
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {};
};

export default async function handler(request: any, response: any) {
  if (request.method !== "POST") {
    response.status(405).json({ ok: false, error: "method_not_allowed" });
    return;
  }

  let body: { session?: AssessmentSession };
  try {
    body = await readJsonBody(request);
  } catch {
    response.status(400).json({ ok: false, error: "invalid_json" });
    return;
  }

  const session = body.session;
  const versionId = session?.versionId as AssessmentVersionId | undefined;
  if (!session || !versionId || !validVersionIds.has(versionId)) {
    response.status(400).json({ ok: false, error: "invalid_session" });
    return;
  }

  const moment =
    session.measurementMoment === "voortgangsmeting" ? "voortgangsmeting" : "nulmeting";
  const assessment = assessmentMapForMoment(moment)[versionId];
  const rescored = rescoreSessionResults(session, assessment);
  const result = calculateResult(rescored, assessment);

  response.status(200).json({ ok: true, results: rescored.results, result });
}
