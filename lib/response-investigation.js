// Fixed forensic queries only: never accept SQL supplied by a caller.
export const investigationQueries = [
  "SELECT current_database() AS database_name, current_user AS database_user,\n       CURRENT_TIMESTAMP AS observed_at",
  "SELECT table_schema, table_name, column_name, data_type\nFROM information_schema.columns\nWHERE table_schema = 'public'\n  AND (table_name IN ('students', 'assessment_sessions', 'assessment_results')\n       OR table_name ILIKE '%assessment%'\n       OR table_name ILIKE '%session%'\n       OR table_name ILIKE '%result%')\nORDER BY table_name, ordinal_position",
  "WITH codes AS (\n  SELECT class_code, version_id,\n         COUNT(*) AS code_rows,\n         COUNT(DISTINCT access_code) AS distinct_codes,\n         COUNT(DISTINCT access_code) FILTER (WHERE status = 'completed') AS codes_marked_completed,\n         COUNT(DISTINCT access_code) FILTER (WHERE status = 'in_progress') AS codes_marked_in_progress,\n         COUNT(DISTINCT access_code) FILTER (WHERE status = 'not_started') AS codes_marked_not_started\n  FROM students GROUP BY class_code, version_id\n), sessions AS (\n  SELECT class_code, version_id, COUNT(*) AS saved_sessions,\n         COUNT(DISTINCT access_code) AS codes_with_saved_session,\n         COUNT(*) FILTER (\n           WHERE CASE WHEN jsonb_typeof(session_json->'results') = 'array'\n                      THEN jsonb_array_length(session_json->'results') ELSE 0 END > 0\n         ) AS sessions_with_response,\n         COUNT(*) FILTER (\n           WHERE COALESCE(session_json->>'completedAt', '') NOT IN ('', '0', 'null')\n         ) AS sessions_with_client_completion\n  FROM assessment_sessions GROUP BY class_code, version_id\n), results AS (\n  SELECT class_code, version_id, COUNT(*) AS saved_final_attempts,\n         MIN(completed_at) AS first_final_at, MAX(completed_at) AS last_final_at\n  FROM assessment_results GROUP BY class_code, version_id\n), groups AS (\n  SELECT class_code, version_id FROM codes\n  UNION SELECT class_code, version_id FROM sessions\n  UNION SELECT class_code, version_id FROM results\n)\nSELECT g.class_code AS klas, g.version_id AS meting,\n       COALESCE(c.code_rows,0) AS code_records,\n       COALESCE(c.distinct_codes,0) AS codes_aangemaakt,\n       COALESCE(c.codes_marked_completed,0) AS codes_status_afgerond,\n       COALESCE(c.codes_marked_in_progress,0) AS codes_status_bezig,\n       COALESCE(c.codes_marked_not_started,0) AS codes_status_niet_gestart,\n       COALESCE(r.saved_final_attempts,0) AS werkelijk_opgeslagen_eindpogingen,\n       COALESCE(s.saved_sessions,0) AS bewaarde_sessies,\n       COALESCE(s.codes_with_saved_session,0) AS codes_met_bewaarde_sessie,\n       COALESCE(s.sessions_with_response,0) AS sessies_met_antwoorden,\n       COALESCE(s.sessions_with_client_completion,0) AS sessies_met_afrondingsmarkering,\n       r.first_final_at, r.last_final_at\nFROM groups g\nLEFT JOIN codes c ON c.class_code IS NOT DISTINCT FROM g.class_code AND c.version_id=g.version_id\nLEFT JOIN sessions s ON s.class_code IS NOT DISTINCT FROM g.class_code AND s.version_id=g.version_id\nLEFT JOIN results r ON r.class_code IS NOT DISTINCT FROM g.class_code AND r.version_id=g.version_id\nORDER BY g.class_code, g.version_id",
  "SELECT st.id AS code_record, st.class_code AS klas, st.version_id AS meting,\n       st.access_code AS code, st.status AS geregistreerde_status,\n       st.started_at, st.completed_at,\n       q.session_count AS bewaarde_sessies,\n       q.max_answer_count AS maximaal_bewaarde_antwoordrecords,\n       q.latest_saved_at AS laatste_serveropslag,\n       q.has_client_completion AS bewaarde_afrondingsmarkering,\n       d.final_count AS direct_gekoppelde_eindresultaten,\n       t.final_count AS eindresultaten_met_hetzelfde_tijdstip,\n       k.code_count AS codes_met_hetzelfde_afrondingstijdstip,\n       CASE\n         WHEN d.final_count > 0 AND st.status <> 'completed'\n           THEN 'Eindresultaat ontvangen; status wijkt af'\n         WHEN d.final_count > 0\n           THEN 'Eindresultaat rechtstreeks bevestigd'\n         WHEN t.final_count = 1 AND k.code_count = 1\n           THEN 'Waarschijnlijke resultaatkoppeling via uniek tijdstip; geen directe koppeling'\n         WHEN q.has_client_completion\n           THEN 'Afgeronde sessie aanwezig; definitief resultaat niet rechtstreeks bevestigd'\n         WHEN q.max_answer_count > 0\n           THEN 'Tussentijdse antwoorden aanwezig'\n         WHEN st.status = 'completed'\n           THEN 'Serverstatus afgerond; individueel resultaat niet rechtstreeks koppelbaar'\n         ELSE 'Voor deze code geen antwoorden rechtstreeks teruggevonden'\n       END AS onderzoeksstatus\nFROM students st\nLEFT JOIN LATERAL (\n  SELECT COUNT(*) AS session_count,\n         COALESCE(MAX(CASE WHEN jsonb_typeof(s.session_json->'results')='array'\n                           THEN jsonb_array_length(s.session_json->'results') ELSE 0 END),0) AS max_answer_count,\n         MAX(s.updated_at) AS latest_saved_at,\n         COALESCE(BOOL_OR(COALESCE(s.session_json->>'completedAt','') NOT IN ('','0','null')),false) AS has_client_completion\n  FROM assessment_sessions s\n  WHERE s.access_code=st.access_code AND s.class_code=st.class_code AND s.version_id=st.version_id\n) q ON true\nLEFT JOIN LATERAL (\n  SELECT COUNT(DISTINCT r.session_id) AS final_count\n  FROM assessment_sessions s JOIN assessment_results r ON r.session_id=s.id\n  WHERE s.access_code=st.access_code AND s.class_code=st.class_code AND s.version_id=st.version_id\n    AND r.class_code=st.class_code AND r.version_id=st.version_id\n) d ON true\nLEFT JOIN LATERAL (\n  SELECT COUNT(*) AS final_count FROM assessment_results r\n  WHERE r.class_code=st.class_code AND r.version_id=st.version_id AND r.completed_at=st.completed_at\n) t ON true\nLEFT JOIN LATERAL (\n  SELECT COUNT(DISTINCT x.access_code) AS code_count FROM students x\n  WHERE x.class_code=st.class_code AND x.version_id=st.version_id AND x.completed_at=st.completed_at\n) k ON true\nORDER BY st.class_code, st.version_id, st.access_code, st.id",
  "SELECT s.id AS session_id, s.class_code AS klas, s.version_id AS meting,\n       s.access_code AS code, s.updated_at,\n       CASE WHEN jsonb_typeof(s.session_json->'results')='array'\n            THEN jsonb_array_length(s.session_json->'results') ELSE 0 END AS antwoordrecords,\n       s.session_json->>'completedAt' AS client_completed_at,\n       EXISTS(SELECT 1 FROM assessment_results r WHERE r.session_id=s.id) AS eindresultaat_aanwezig\nFROM assessment_sessions s\nWHERE NOT EXISTS (\n  SELECT 1 FROM students st WHERE st.access_code=s.access_code\n    AND st.class_code=s.class_code AND st.version_id=s.version_id\n)\nORDER BY s.class_code, s.updated_at",
  "SELECT r.class_code AS klas, r.version_id AS meting,\n       COALESCE(to_jsonb(r)->>'assessment_window','') AS afnameperiode,\n       to_jsonb(r)->>'assessment_build_version' AS assessment_build_version,\n       to_jsonb(r)->>'assessment_content_hash' AS assessment_content_hash,\n       COUNT(*) AS eindpogingen,\n       COUNT(*) FILTER (WHERE NOT EXISTS (\n         SELECT 1 FROM assessment_sessions s WHERE s.id=r.session_id\n       )) AS eindpogingen_zonder_actieve_sessie\nFROM assessment_results r\nGROUP BY r.class_code, r.version_id, COALESCE(to_jsonb(r)->>'assessment_window',''),\n         to_jsonb(r)->>'assessment_build_version', to_jsonb(r)->>'assessment_content_hash'\nORDER BY r.class_code, r.version_id, afnameperiode",
  "SELECT access_code AS code, COUNT(*) AS administratieregels,\n       COUNT(DISTINCT class_code) AS verschillende_klassen,\n       COUNT(DISTINCT version_id) AS verschillende_metingen\nFROM students GROUP BY access_code HAVING COUNT(*) > 1 ORDER BY access_code",
  "SELECT class_code AS klas, version_id AS meting, access_code AS code,\n       COUNT(*) AS bewaarde_pogingen\nFROM assessment_sessions GROUP BY class_code, version_id, access_code\nHAVING COUNT(*) > 1 ORDER BY class_code, access_code"
];
export const investigationKeys = ["identity", "columns", "classes", "codes", "orphanSessions", "resultGroups", "duplicateCodes", "multipleSessions"];

export const databaseLocation = (connectionString) => {
  const url = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(url.protocol)) throw new Error("Invalid database configuration");
  // Never return username, password, search parameters or the original URL.
  return { hostname: url.hostname, database: decodeURIComponent(url.pathname.slice(1)) };
};

export const collectInvestigation = async (sql) => {
  const options = { readOnly: true, isolationLevel: "RepeatableRead" };
  // No app initializers: even schema inspection is a READ ONLY transaction.
  const inventory = await sql.transaction(
    investigationQueries.slice(0, 2).map(query => sql.query(query)), options
  );
  const required = {
    students: ["id", "access_code", "class_code", "version_id", "status", "started_at", "completed_at"],
    assessment_sessions: ["id", "access_code", "class_code", "version_id", "session_json", "updated_at"],
    assessment_results: ["session_id", "class_code", "version_id", "completed_at"]
  };
  const missing = Object.entries(required).flatMap(([table, columns]) =>
    columns.filter(column => !inventory[1].some(row => row.table_name === table && row.column_name === column))
      .map(column => table + "." + column)
  );
  if (missing.length) return { available: false, missing, identity: inventory[0], columns: inventory[1] };
  const rows = await sql.transaction(investigationQueries.map(query => sql.query(query)), options);
  // Return metadata/counts only. No raw responses, individual scores, or database user.
  const report = Object.fromEntries(investigationKeys.map((key, index) => [key, rows[index]]));
  report.identity = report.identity.map(({database_name, observed_at}) => ({database_name, observed_at}));
  report.available = true;
  return report;
};

// A separate, explicit administrator backup. No result scoring or status repair.
export const collectAnswerBackup = async (sql, { manifest = false, offset = 0, limit = 5 } = {}) => {
  const options = { readOnly: true, isolationLevel: "RepeatableRead" };
  if (manifest) {
    const [rows] = await sql.transaction([sql.query(`
      SELECT id, class_code, version_id, access_code, updated_at,
             md5(session_json::text) AS checksum,
             octet_length(session_json::text) AS bytes,
             CASE WHEN jsonb_typeof(session_json->'results') = 'array'
                  THEN jsonb_array_length(session_json->'results') ELSE 0 END AS answer_records
      FROM public.assessment_sessions ORDER BY id
    `)], options);
    return { manifest: rows, observedAt: new Date().toISOString() };
  }
  if (!Number.isSafeInteger(offset) || offset < 0 || offset > 100000 || !Number.isSafeInteger(limit) || limit < 1 || limit > 5) {
    throw new Error("Invalid pagination");
  }
  const [rows] = await sql.transaction([sql.query(`
    SELECT id, class_code, version_id, access_code, updated_at,
           to_jsonb(s) - 'session_json' AS storage_metadata,
           session_json::text AS session_text, md5(session_json::text) AS checksum
    FROM public.assessment_sessions s ORDER BY id LIMIT $1 OFFSET $2
  `, [limit, offset])], options);
  return { records: rows, offset };
};


