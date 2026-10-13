import { recoveryAssessments, calculateResult } from "./recovery-runtime.js";
import { ensureTablesOnce, anonymizeSession } from "../api/results.js";

export const validateRecovery = row => {
  const session=row.session_json;
  const assessment=recoveryAssessments.find(a=>a.id===row.version_id);
  if (!assessment || session?.id!==row.id || session.versionId!==row.version_id || session.assessmentBuildVersion!==assessment.assessmentBuildVersion || session.assessmentContentHash!==assessment.assessmentContentHash || !Array.isArray(session.results)) throw new Error("Metingsversie of sessiegegevens komen niet overeen.");
  const expected=assessment.sections.flatMap(section=>section.items.map(item=>({...item,sectionId:section.id})));
  const seen=new Set();
  for(const entry of session.results){
    const item=expected.find(item=>item.id===entry.itemId && item.sectionId===entry.sectionId);
    if(!item || seen.has(entry.itemId) || entry.sessionId!==session.id || entry.versionId!==session.versionId || !Number.isFinite(entry.score) || entry.score<0 || entry.score>item.points+1e-8 || !Number.isFinite(entry.maxScore) || Math.abs(entry.maxScore-item.points)>1e-8 || entry.assessmentContentHash!==assessment.assessmentContentHash || entry.assessmentBuildVersion!==assessment.assessmentBuildVersion) throw new Error("Een antwoordregistratie kan niet veilig worden hersteld.");
    seen.add(entry.itemId);
  }
  const missing=expected.filter(item=>!seen.has(item.id)).map(item=>item.id);
  return {session,assessment,missing,state:missing.length?"partial":"completed",result:missing.length?null:calculateResult(session,assessment)};
};

export const recoverSession = async (sql, {sessionId,checksum}) => {
  if(!/^[0-9a-f-]{36}$/i.test(sessionId) || !/^[0-9a-f]{32}$/.test(checksum)) throw new Error("Ongeldige herstelopdracht.");
  await ensureTablesOnce(sql);
  const history=await sql`SELECT state, source_checksum FROM assessment_recoveries WHERE session_id=${sessionId}`;
  if(history[0]) {
    if(history[0].source_checksum!==checksum) throw new Error("Deze sessie is al uit een andere kopie hersteld.");
    if(history[0].state!=="partial") {
      const final=await sql`SELECT session_id FROM assessment_results WHERE session_id=${sessionId}`;
      if(!final.length)throw new Error("Herstelregistratie en eindresultaat verschillen.");
    }
    return {state:history[0].state,alreadyRecovered:true};
  }
  const rows=await sql`SELECT *, md5(session_json::text) AS checksum FROM assessment_sessions WHERE id=${sessionId}`;
  const row=rows[0];
  if(!row || row.checksum!==checksum)throw new Error("De sessie veranderde sinds de antwoordkopie. Niet gewijzigd.");
  if(String(row.access_code).startsWith("TEST") || String(row.class_code).startsWith("test-"))throw new Error("Testsessies worden niet als leerlingafname hersteld.");
  const {session,missing,state,result}=validateRecovery(row);
  const students=await sql`SELECT * FROM students WHERE access_code=${row.access_code} AND class_code=${row.class_code} AND version_id=${row.version_id}`;
  if(students.length!==1 || students[0].status==="completed")throw new Error("Codeadministratie vereist nadere controle. Niet gewijzigd.");
  const existing=await sql`SELECT session_id FROM assessment_results WHERE session_id=${sessionId}`;
  if(existing.length)throw new Error("Er bestaat al een eindresultaat. Niet overschreven.");
  const student=students[0],classId=row.class_id??row.class_code;
  const anonymous=anonymizeSession(session,row.class_code,classId);
  const recoveredAt=new Date().toISOString();
  const resultJson=result ? {session:anonymous,result,recovery:{origin:"saved-session",recoveredAt,originalCompletionTimeKnown:false,sourceChecksum:checksum}} : null;
  await sql.transaction([
    sql`SELECT pg_advisory_xact_lock(hashtextextended(${sessionId},0))`,
    // Runtime checksum guard after acquiring the shared lock. Failure rolls back
    // every statement; no recovery is based on a stale live answer snapshot.
    sql`SELECT 1 / CASE WHEN EXISTS (SELECT 1 FROM assessment_sessions WHERE id=${sessionId} AND md5(session_json::text)=${checksum})
      AND NOT EXISTS(SELECT 1 FROM assessment_results WHERE session_id=${sessionId})
      THEN 1 ELSE 0 END AS source_unchanged`,
    sql`INSERT INTO assessment_recoveries(session_id,class_code,version_id,state,source_checksum,source_session_json,missing_item_ids,recovered_at)
      VALUES(${sessionId},${row.class_code},${row.version_id},${state},${checksum},${JSON.stringify(session)}::jsonb,${JSON.stringify(missing)}::jsonb,${recoveredAt})`,
    ...(result ? [
      sql`INSERT INTO assessment_results(session_id,class_code,class_id,assessment_id,grade_level,track,cohort,assessment_window,version_id,assessment_build_version,assessment_content_hash,total_score,max_score,percentage,self_assessment_score,started_at,completed_at,result_json,event_logs,recovery_origin,recovered_at)
      VALUES(${sessionId},${row.class_code},${classId},${student.assessment_id??row.version_id},${row.version_id.split("-")[0]},${row.version_id.endsWith("-hv")?"hv":"vmbo"},${student.cohort??student.import_batch??null},${student.assessment_window??student.import_batch??null},${row.version_id},${session.assessmentBuildVersion},${session.assessmentContentHash},${result.totalScore},${result.maxScore},${result.percentage},${session.metadata?.selfAssessmentScore??null},${session.startedAt?new Date(session.startedAt).toISOString():null},NULL,${JSON.stringify(resultJson)}::jsonb,${JSON.stringify(anonymous.eventLogs??[])}::jsonb,'saved-session',${recoveredAt})`,
      sql`UPDATE students SET status='completed',completed_at=NULL,updated_at=NOW() WHERE id=${student.id}`,
    ] : []),
  ]);
  // Preserve original active-session rows as additional recovery evidence.
  const verified=await sql`SELECT state FROM assessment_recoveries WHERE session_id=${sessionId} AND source_checksum=${checksum}`;
  if(!verified.length)throw new Error("De herstelopslag kon niet bevestigd worden.");
  return {state,alreadyRecovered:false,answerRecords:session.results.length,missingRecords:missing.length};
};
