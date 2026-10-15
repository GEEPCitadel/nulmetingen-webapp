// Read-only report aggregation. Call only with already authorized/filtered rows.
// Never return source sessions, answers, codes, or individual results.
const GOALS = ['21','21A','21B','21C','21D','22','22A','22B','23','23A','23B','23C'];
const SIGNALS = new Set(['21D','22A','22B','23C']);
const META = ['classCode','gradeLevel','track','assessmentWindow','cohort','assessmentId','versionId','contentKey','assessmentBuildVersion','assessmentContentHash'];
const PARTITION = META.filter(field => field !== 'classCode');
const finite = value => typeof value === 'number' && Number.isFinite(value);
const mean = values => values.length ? values.reduce((a,b)=>a+b,0)/values.length : null;
const cleanMeta = source => Object.fromEntries(META.map(field=>[field,String(source[field]??'')]));
const key = (meta,fields=META) => JSON.stringify(fields.map(field=>meta[field]??''));

function points(score,maxScore,itemCount,mode='percentage') {
  if(!finite(score)||!finite(maxScore)||maxScore<=0||score<0||score>maxScore) return null;
  if(!Number.isSafeInteger(itemCount)||itemCount<1) return null;
  return {score,maxScore,itemCount,reportingMode:mode};
}

function summarize(row) {
  const result=row.result_json?.result;
  const session=row.result_json?.session;
  const scored=Array.isArray(session?.results)
    ? session.results.filter(entry=>entry&&finite(entry.maxScore)&&entry.maxScore>0) : null;
  const uniqueKeys=new Set((scored??[]).map(entry=>JSON.stringify([entry.sectionId,entry.itemId])));
  // No assumption that a historical itemset has today's point denominator.
  const total=points(result?.totalScore,result?.maxScore,
    scored?.length===uniqueKeys.size ? scored?.length : null);
  const self=row.self_assessment_score;
  const selfAssessment=finite(self)&&self>=0&&self<=100 ? self : null;
  const goals=Object.fromEntries(GOALS.map(id=>{
    const entries=(Array.isArray(result?.goalScores)?result.goalScores:[]).filter(g=>g&&g.goalId===id);
    if(entries.length!==1) return [id,null];
    const g=entries[0];
    // A single contributor never becomes a percentage because more pupils
    // answered it. Unknown historical coverage does not become current coverage.
    const mode=id.length===3&&(g.reportingMode==='signal'||g.itemCount===1||SIGNALS.has(id)) ? 'signal' : 'percentage';
    return [id,points(g.score,g.maxScore,g.itemCount,mode)];
  }));
  return {total,selfAssessment,goals};
}

function pointAggregate(rows,selector,minimum) {
  const values=rows.map(selector);
  // Do not publish a second, almost-identical subset mean from which an
  // excluded pupil's points can be inferred by subtraction.
  if(rows.length<minimum||values.some(v=>v===null))return null;
  const first=values[0];
  if(values.some(v=>v.maxScore!==first.maxScore||v.itemCount!==first.itemCount||v.reportingMode!==first.reportingMode))return null;
  const averagePoints=mean(values.map(v=>v.score));
  return {averagePoints,maxPoints:first.maxScore,itemCount:first.itemCount,
    sampleCount:values.length,reportingMode:first.reportingMode,
    percentage:first.reportingMode==='signal'?null:100*averagePoints/first.maxScore};
}

function aggregate(classes,scope,minimum) {
  const all=classes.flatMap(c=>c.rows);
  // A pooled mean may contain only class strata whose same metric is also
  // reportable. Otherwise a small class could be recovered by subtraction.
  const strata=classes.filter(c=>c.rows.length>=minimum&&c.knownContent);
  const collect=selector=>{
    const eligible=strata.filter(c=>pointAggregate(c.rows,selector,minimum)!==null);
    return pointAggregate(eligible.flatMap(c=>c.rows),selector,minimum);
  };
  const total=collect(r=>r.total);
  const goals=Object.fromEntries(GOALS.map(id=>[id,collect(r=>r.goals[id])]));
  const selfClasses=strata.filter(c=>c.rows.filter(r=>r.selfAssessment!==null).length>=minimum);
  const selfValues=selfClasses.flatMap(c=>c.rows.map(r=>r.selfAssessment).filter(v=>v!==null));
  const selfAssessment=selfValues.length>=minimum ? {mean:mean(selfValues),sampleCount:selfValues.length} : null;
  const members=classes.map(c=>({classCode:c.metadata.classCode,
    completedCount:c.rows.length,createdCodes:c.createdCodes,startedCount:c.startedCount,
    registeredCompletedCount:c.registeredCompletedCount,
    missingResultCount:Math.max(0,c.registeredCompletedCount-c.rows.length),
    includedInTotal:pointAggregate(c.rows,r=>r.total,minimum)!==null&&c.knownContent}));
  const metadata={...classes[0].metadata,classCode:scope==='class'?classes[0].metadata.classCode:''};
  const counts={completedCount:all.length,createdCodes:classes.reduce((s,c)=>s+c.createdCodes,0),
    startedCount:classes.reduce((s,c)=>s+c.startedCount,0),
    registeredCompletedCount:classes.reduce((s,c)=>s+c.registeredCompletedCount,0),
    missingResultCount:members.reduce((s,c)=>s+c.missingResultCount,0)};
  const includedCount=total?.sampleCount??0;
  return {metadata,...counts,classes:members,total,selfAssessment,goals,
    excludedFromTotalCount:all.length-includedCount,
    comparisonAvailable:includedCount>=minimum&&includedCount===all.length&&selfValues.length===all.length,
    reportable:total!==null};
}

export function buildGroupReports(students,rows,metadataForRow,minimum=5,now=new Date()) {
  if(!Number.isSafeInteger(minimum)||minimum<5)throw new Error('Group-report privacy minimum must be at least 5');
  const classes=new Map();
  const ensure=source=>{
    const metadata=cleanMeta(source),id=key(metadata);
    if(!classes.has(id))classes.set(id,{metadata,rows:[],createdCodes:0,startedCount:0,registeredCompletedCount:0,
      knownContent:Boolean(metadata.assessmentContentHash||metadata.assessmentBuildVersion)&&metadata.contentKey!=='legacy-unknown'});
    return classes.get(id);
  };
  for(const student of students){
    const group=ensure(student);group.createdCodes++;
    if(['in_progress','completed'].includes(student.status))group.startedCount++;
    if(student.status==='completed')group.registeredCompletedCount++;
  }
  for(const row of rows)ensure(metadataForRow(row)).rows.push(summarize(row));
  const list=[...classes.values()].sort((a,b)=>key(a.metadata).localeCompare(key(b.metadata),'nl'));
  const pools=new Map();
  for(const cl of list){const id=key(cl.metadata,PARTITION);if(!pools.has(id))pools.set(id,[]);pools.get(id).push(cl);}
  const byClass=list.map(cl=>aggregate([cl],'class',minimum));
  // Both views deliberately keep separate profiles for every variant, build,
  // content hash, period and cohort. There is no cross-variant year mean.
  const byGrade=[...pools.values()].map(group=>aggregate(group,'grade',minimum));
  const byMeasurement=[...pools.values()].map(group=>aggregate(group,'measurement',minimum));
  return {schemaVersion:1,generatedAt:now.toISOString(),minimumReportingCount:minimum,
    byClass,byGrade,byMeasurement};
}

