import { neon } from "@neondatabase/serverless";
import { createHash } from "node:crypto";
import { accessForRequest } from "./access.js";
import { collectInvestigation, collectAnswerBackup, databaseLocation } from "../lib/response-investigation.js";

export const createHandler = (connect = neon) => async (request, response) => {
  response.setHeader("Cache-Control", "no-store, private");
  response.setHeader("Vercel-CDN-Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ ok: false, error: "Alleen lezen is toegestaan." });
  }
  if (accessForRequest(request)?.role !== "admin") {
    return response.status(403).json({ ok: false, error: "Alleen de beheerder heeft toegang." });
  }
  if (!process.env.DATABASE_URL) {
    return response.status(503).json({ ok: false, error: "Databasekoppeling ontbreekt op de server." });
  }
  try {
    const parameters = new URL(request.url ?? "/", "https://local.invalid").searchParams;
    const exportMode = parameters.get("export");
    if (exportMode && !["manifest", "answers"].includes(exportMode)) {
      return response.status(400).json({ ok: false, error: "Onbekende leescontrole." });
    }
    if (exportMode) {
      const offset = Number(parameters.get("offset") ?? 0);
      const limit = Number(parameters.get("limit") ?? 5);
      if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100000 || !Number.isSafeInteger(limit) || limit < 1 || limit > 5) {
        return response.status(400).json({ ok: false, error: "Ongeldige pagina voor de antwoordkopie." });
      }
      const backup = await collectAnswerBackup(connect(process.env.DATABASE_URL), { manifest: exportMode === "manifest", offset, limit });
      if (backup.records) backup.records = backup.records.map(row => ({ ...row, sha256: createHash("sha256").update(row.session_text).digest("hex") }));
      const payload = { ok: true, readOnly: true, format: "citadel-session-backup-v1", ...backup };
      if (Buffer.byteLength(JSON.stringify(payload)) > 3500000) {
        return response.status(413).json({ ok: false, error: "Deze antwoordkopie is te groot voor één aanvraag. Er is niets gewijzigd." });
      }
      return response.status(200).json(payload);
    }
    const location = databaseLocation(process.env.DATABASE_URL);
    const report = await collectInvestigation(connect(process.env.DATABASE_URL));
    if (report.identity) report.identity = report.identity.map(({ database_name, observed_at }) => ({ database_name, observed_at }));
    return response.status(200).json({
      ok: true, readOnly: true, location, report,
      cautions: [
        "Dit onderzoek wijzigt geen antwoorden of statussen.",
        "Een afrondingsmarkering bewijst niet dat alle antwoorden aanwezig zijn.",
        "Een overeenkomst in tijdstip is een aanwijzing, geen bewezen koppeling.",
        "Geen rechtstreeks gevonden antwoorden betekent niet dat een anoniem eindresultaat ontbreekt.",
        "De aantallen omvatten alle aanwezige periodes en kunnen testcodes bevatten."
      ]
    });
  } catch {
    // Do not log or return driver errors: they may contain credentials or SQL data.
    return response.status(503).json({ ok: false, error: "De leescontrole kon niet worden voltooid. Er is niets gewijzigd." });
  }
};

export default createHandler();

