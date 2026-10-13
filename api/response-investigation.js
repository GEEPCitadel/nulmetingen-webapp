import { neon } from "@neondatabase/serverless";
import { accessForRequest } from "./access.js";
import { collectInvestigation, databaseLocation } from "../lib/response-investigation.js";

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

