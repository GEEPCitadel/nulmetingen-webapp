import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import Module from 'node:module';
import path from 'node:path';
import ts from 'typescript';
import {buildGroupReports} from '../lib/group-reports.js';
const stamp=new Date('2026-10-15T12:00:00.000Z');
const metadata=(classCode='a',extra={})=>({classCode,gradeLevel:'lj3',track:'vmbo',assessmentWindow:'najaar-2026',cohort:'cohort-2026',assessmentId:'lj3-vmbo',versionId:'lj3-vmbo',contentKey:'h',assessmentBuildVersion:'b',assessmentContentHash:'h',...extra});
const row=(meta,score=6,self=72)=>({meta,self_assessment_score:self,access_code:'PRIVATE-CODE',result_json:{session:{id:'PRIVATE-SESSION',metadata:{accessCode:'PRIVATE-CODE'},results:[{sectionId:'pt',itemId:'one',maxScore:6,selectedAnswer:'PRIVATE-ANSWER'},{sectionId:'pt',itemId:'two',maxScore:4}]},result:{totalScore:score,maxScore:10,goalScores:[{goalId:'21',score,maxScore:10,itemCount:2},{goalId:'21A',score,maxScore:10,itemCount:2},{goalId:'21D',score:2,maxScore:4,itemCount:1,reportingMode:'signal'}]}}});
const fixture=(count,meta,score=6,self=72)=>({rows:Array.from({length:count},()=>row(meta,score,self)),students:Array.from({length:count},()=>({...meta,status:'completed',accessCode:'PRIVATE-CODE'}))});
const reports=(fixtures)=>buildGroupReports(fixtures.flatMap(f=>f.students),fixtures.flatMap(f=>f.rows),r=>r.meta,5,stamp);

test('point denominators, counts, genuine self zero and one-item signals',()=>{
 const r=reports([fixture(5,metadata(),6,0)]).byClass[0];
 assert.equal(r.total.averagePoints,6);assert.equal(r.total.maxPoints,10);assert.equal(r.total.itemCount,2);
 assert.equal(r.total.percentage,60);assert.equal(r.total.sampleCount,5);
 assert.equal(r.selfAssessment.mean,0);assert.equal(r.selfAssessment.sampleCount,5);
 assert.equal(r.goals['21D'].percentage,null);assert.equal(r.goals['21D'].reportingMode,'signal');
 assert.equal(r.comparisonAvailable,true);
});
test('subthreshold groups never reveal means or point ratios',()=>{
 const r=reports([fixture(4,metadata())]).byClass[0];
 assert.equal(r.reportable,false);assert.equal(r.total,null);assert.equal(r.selfAssessment,null);
 assert.ok(Object.values(r.goals).every(g=>g===null));assert.equal(r.completedCount,4);
 assert.equal(r.excludedFromTotalCount,4);
});
test('pool pupil-weighted means and exclude small class complements',()=>{
 const r=reports([fixture(5,metadata('a'),2),fixture(10,metadata('b'),8),fixture(4,metadata('small'),9)]);
 assert.equal(r.byGrade.length,1);const pooled=r.byGrade[0];
 assert.equal(pooled.completedCount,19);assert.equal(pooled.total.sampleCount,15);
 assert.equal(pooled.total.averagePoints,6);assert.equal(pooled.total.percentage,60);
 assert.equal(pooled.excludedFromTotalCount,4);assert.equal(pooled.comparisonAvailable,false);
 assert.equal(pooled.classes.find(c=>c.classCode==='small').includedInTotal,false);
});
test('missing, NaN, out-of-range self scores are not zeros and do not leak a singleton',()=>{
 const f=fixture(6,metadata());f.rows.forEach((r,i)=>r.self_assessment_score=[0,null,undefined,NaN,101,-1][i]);
 const r=reports([f]).byClass[0];assert.equal(r.selfAssessment,null);assert.equal(r.total.sampleCount,6);
 assert.equal(r.comparisonAvailable,false);
 const f2=fixture(6,metadata());f2.rows[0].self_assessment_score=null;
 const r2=reports([f2]).byClass[0];assert.equal(r2.selfAssessment.mean,72);assert.equal(r2.selfAssessment.sampleCount,5);
 assert.equal(r2.comparisonAvailable,false);
});
test('a pooled self mean omits class strata with too few valid self scores',()=>{
 const a=fixture(5,metadata('a'),6,80),b=fixture(5,metadata('b'),6,null);
 b.rows[0].self_assessment_score=0;
 const r=reports([a,b]).byGrade[0];assert.equal(r.selfAssessment.mean,80);assert.equal(r.selfAssessment.sampleCount,5);
 assert.equal(r.total.sampleCount,10);assert.equal(r.comparisonAvailable,false);
});
test('one missing or inconsistent point denominator does not expose a near-identical subset mean',()=>{
 const f=fixture(6,metadata());f.rows[0].result_json.result.maxScore=20;
 assert.equal(reports([f]).byClass[0].total,null);
 f.rows[0].result_json.result.maxScore=10;delete f.rows[0].result_json.result.totalScore;
 assert.equal(reports([f]).byClass[0].total,null);
 const mixed=reports([fixture(5,metadata('other'),2),f]).byGrade[0];
 assert.equal(mixed.total.sampleCount,5);assert.equal(mixed.total.averagePoints,2);
});
test('variant, content/build, period and cohort are immutable pooling partitions',()=>{
 const dimensions=[['versionId','lj1-vmbo'],['assessmentId','other'],['assessmentContentHash','new-hash'],['assessmentBuildVersion','new-build'],['contentKey','new-key'],['assessmentWindow','next-year'],['cohort','other-cohort'],['gradeLevel','lj1'],['track','hv']];
 for(const [field,value] of dimensions){const r=reports([fixture(5,metadata('a')),fixture(5,metadata('b',{[field]:value}))]);
  assert.equal(r.byGrade.length,2,field);assert.equal(r.byMeasurement.length,2,field);
 }
});
test('unknown historical version and malformed historical JSON produce no invented scores',()=>{
 const f=fixture(5,metadata('legacy',{assessmentBuildVersion:'',assessmentContentHash:'',contentKey:'legacy-unknown'}));
 assert.equal(reports([f]).byClass[0].total,null);
 const bad=fixture(5,metadata());bad.rows[0].result_json={session:{results:{}},result:{goalScores:{}}};
 assert.doesNotThrow(()=>reports([bad]));assert.equal(reports([bad]).byClass[0].total,null);
});
test('generation is repeatable, immutable, contains no source answers/codes, and refresh adds results',()=>{
 const f=fixture(5,metadata()),original=JSON.stringify(f);
 const first=reports([f]);assert.deepEqual(reports([f]),first);assert.equal(JSON.stringify(f),original);
 assert.equal(first.generatedAt,stamp.toISOString());assert.ok(!JSON.stringify(first).includes('PRIVATE-'));
 f.rows.push(row(metadata()));f.students.push({...metadata(),status:'completed'});
 assert.equal(reports([f]).byClass[0].completedCount,6);
 assert.throws(()=>buildGroupReports([],[],r=>r.meta,4),/at least 5/);
});
test('status-only completions remain visible as an attention count, not a scored zero',()=>{
 const f=fixture(5,metadata());f.students.push({...metadata(),status:'completed'});
 const r=reports([f]).byClass[0];assert.equal(r.completedCount,5);assert.equal(r.registeredCompletedCount,6);
 assert.equal(r.missingResultCount,1);assert.equal(r.total.sampleCount,5);assert.equal(r.total.averagePoints,6);
});
test('all four canonical measurements preserve exact points and item/goal contributor counts',()=>{
 const previous=Module._extensions['.ts'];
 Module._extensions['.ts']=(mod,filename)=>mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,resolveJsonModule:true,target:ts.ScriptTarget.ES2022},fileName:filename}).outputText,filename);
 const load=relative=>{const filename=path.resolve(relative),mod=new Module(filename);mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));Module._extensions['.ts'](mod,filename);return mod.exports;};
 try{
  const {assessments}=load('src/data/assessments.ts'),{calculateResult}=load('src/lib/assessment.ts');
  for(const a of assessments){
   const entries=a.sections.flatMap(s=>s.items.filter(i=>i.points>0).map(i=>({sectionId:s.id,itemId:i.id,maxScore:i.points,score:i.points})));
   const result=calculateResult({versionId:a.id,results:entries},a);
   const meta=metadata(a.id,{versionId:a.id,assessmentId:a.id,gradeLevel:a.id.split('-')[0],track:a.id.split('-')[1],contentKey:a.assessmentContentHash,assessmentBuildVersion:a.assessmentBuildVersion,assessmentContentHash:a.assessmentContentHash});
   const rows=Array.from({length:5},()=>({meta,self_assessment_score:72,result_json:{session:{results:entries},result}}));
   const r=buildGroupReports([],rows,r=>r.meta).byClass[0];
   assert.equal(r.total.averagePoints,result.totalScore);assert.equal(r.total.maxPoints,result.maxScore);
   assert.equal(r.total.itemCount,17);assert.equal(r.total.percentage,100);
   for(const goal of result.goalScores){const actual=r.goals[goal.goalId];assert.equal(actual.averagePoints,goal.score);assert.equal(actual.maxPoints,goal.maxScore);assert.equal(actual.itemCount,goal.itemCount);assert.equal(actual.percentage,goal.reportingMode==='signal'?null:100);}
  }
 }finally{previous?Module._extensions['.ts']=previous:delete Module._extensions['.ts'];}
});

test('actual results API returns only authorized and actively filtered report snapshots',async()=>{
 const {createResultsHandler}=await import('../api/results.js');
 const variables=['DATABASE_URL','ADMIN_PASSWORD','MENTOR_ACCESS_JSON'];
 const previous=Object.fromEntries(variables.map(k=>[k,process.env[k]]));
 try{
  process.env.DATABASE_URL='postgresql://fixture:fixture@fixture.invalid/no_network';
  process.env.ADMIN_PASSWORD='synthetic-admin-only';
  process.env.MENTOR_ACCESS_JSON=JSON.stringify([{password:'synthetic-mentor-only',classCodes:['a']}]);
  const source=[fixture(5,metadata('a')),fixture(5,metadata('b'))];
  const allRows=source.flatMap(f=>f.rows).map(r=>({...r,class_code:r.meta.classCode,class_id:r.meta.classCode,version_id:'lj3-vmbo',assessment_id:'lj3-vmbo',cohort:'cohort-2026',assessment_window:'najaar-2026',assessment_build_version:'b',assessment_content_hash:'h',percentage:60}));
  const allStudents=source.flatMap(f=>f.students).map(s=>({access_code:s.accessCode,class_code:s.classCode,class_id:s.classCode,version_id:'lj3-vmbo',assessment_id:'lj3-vmbo',cohort:'cohort-2026',assessment_window:'najaar-2026',status:'completed'}));
  const sql=async(strings)=>{
   const query=strings.join('?');
   if(/^\s*SELECT/.test(query)&&/FROM students\b/.test(query))return allStudents;
   if(/^\s*SELECT/.test(query)&&/FROM assessment_results\b/.test(query))return allRows;
   return [];
  };
  const handler=createResultsHandler(()=>sql);
  const call=async(password,query={})=>{
   const response={headers:{},setHeader(key,value){this.headers[key]=value;},status(code){this.code=code;return this;},json(body){this.body=body;}};
   await handler({method:'GET',headers:{'x-admin-password':password},query},response);return response;
  };
  assert.equal((await call('invalid')).code,401);
  const mentor=await call('synthetic-mentor-only');assert.equal(mentor.code,200);
  assert.equal(mentor.headers['Cache-Control'],'private, no-store');
  assert.deepEqual(mentor.body.analysis.groupReports.byClass.map(r=>r.metadata.classCode),['a']);
  assert.equal(mentor.body.analysis.groupReports.byGrade[0].total.sampleCount,5);
  assert.equal(mentor.body.analysis.groupReports.byMeasurement[0].classes.length,1);
  assert.deepEqual((await call('synthetic-mentor-only',{classCode:'b'})).body.analysis.groupReports.byClass,[]);
  const admin=await call('synthetic-admin-only');assert.equal(admin.code,200);
  assert.equal(admin.body.analysis.groupReports.byGrade[0].total.sampleCount,10);
  assert.deepEqual((await call('synthetic-admin-only',{classCode:'b'})).body.analysis.groupReports.byClass.map(r=>r.metadata.classCode),['b']);
  assert.deepEqual((await call('synthetic-admin-only',{assessmentWindow:'different'})).body.analysis.groupReports.byClass,[]);
  assert.ok(!JSON.stringify(admin.body.analysis.groupReports).includes('PRIVATE-'));
 }finally{for(const name of variables)previous[name]===undefined?delete process.env[name]:process.env[name]=previous[name];}
});

