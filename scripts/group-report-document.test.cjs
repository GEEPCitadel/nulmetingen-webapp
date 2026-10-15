const test=require('node:test');
const assert=require('node:assert/strict');
const Module=require('node:module');
const ts=require('typescript');
const fs=require('node:fs');
Module._extensions['.ts']=(mod,file)=>mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},fileName:file}).outputText,file);
const {createGroupReportDocument}=require('../src/lib/group-report-document.ts');
const metric={averagePoints:6,maxPoints:10,itemCount:2,sampleCount:5,reportingMode:'percentage',percentage:60};
const group=()=>({metadata:{classCode:'3VM-A',versionId:'lj3-vmbo',gradeLevel:'3',assessmentWindow:'2026',cohort:'2026',assessmentBuildVersion:'example',contentKey:'hash'},completedCount:5,createdCodes:10,startedCount:5,registeredCompletedCount:5,missingResultCount:0,total:{...metric},selfAssessment:{mean:72,sampleCount:5},goals:{'21':{...metric},'21D':{averagePoints:1,maxPoints:2,itemCount:1,sampleCount:5,reportingMode:'signal',percentage:null}},excludedFromTotalCount:0,comparisonAvailable:true,reportable:true,classes:[{classCode:'3VM-A',completedCount:5,createdCodes:10,startedCount:5,registeredCompletedCount:5,missingResultCount:0,includedInTotal:true}]});
const snapshot=g=>({schemaVersion:1,generatedAt:'2026-10-15T12:00:00.000Z',minimumReportingCount:5,byClass:[g],byGrade:[g],byMeasurement:[g]});
test('full approved layout, actual point denominators, mean self assessment and cautious comparison',()=>{
 const html=createGroupReportDocument(snapshot(group()),'class','https://example.test');
 for(const text of ['Gemiddelde zelfinschatting','Gemiddelde itemsetscore','Kerndoel 21','Kerndoel 22','Kerndoel 23','Subdoelen in beeld','zelfoverschatting','Afdrukken of opslaan als PDF','6 van 10'])assert.ok(html.includes(text),text);
 assert.ok(!html.includes('Wat kun je ermee in de les'));
 assert.equal((html.match(/<article class="sheet">/g)||[]).length,2);
 const signal=html.split('<h3>21D</h3>')[1].split('</section>')[0];
 assert.ok(signal.includes('Itemsignaal'));assert.ok(!signal.includes('<svg'));assert.ok(!signal.includes('%'));
});
test('all untrusted labels, filters, cohort/build strings are escaped',()=>{
 const g=group();const bad='</h1><script>alert("unsafe")</script>';
 g.metadata.classCode=bad;g.metadata.cohort=bad;g.classes[0].classCode=bad;
 const html=createGroupReportDocument(snapshot(g),'grade','https://example.test',{[bad]:bad});
 assert.ok(!html.includes(bad));assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('PRIVATE-'));
 assert.throws(()=>createGroupReportDocument(snapshot(g),'class','javascript:alert(1)'),/Onbekende website/);
});
test('missing metrics are not rendered as zeros and missing storage remains prominent',()=>{
 const g=group();g.total=null;g.selfAssessment=null;g.goals={};g.reportable=false;g.comparisonAvailable=false;g.missingResultCount=2;g.excludedFromTotalCount=4;
 const html=createGroupReportDocument(snapshot(g),'class','https://example.test');
 assert.ok(!html.includes('<svg'));assert.ok(html.includes('Opslagcontrole: 2'));assert.ok(html.includes('geen score weergegeven')||html.includes('Geen score weergegeven'));
 assert.ok(!html.includes('zelfoverschatting'));
});
test('comparison is omitted for unmatched cohorts, zero self scores are displayed',()=>{
 const g=group();g.selfAssessment.mean=0;
 let html=createGroupReportDocument(snapshot(g),'class','https://example.test');
 assert.ok(html.includes('0 van 100'));assert.ok(html.includes('zelfonderschatting'));
 g.comparisonAvailable=false;html=createGroupReportDocument(snapshot(g),'class','https://example.test');
 assert.ok(html.includes('niet gebaseerd op precies dezelfde groep'));assert.ok(!html.includes('zelfonderschatting'));
});
test('year/measurement reports keep independent profiles and disclose included classes',()=>{
 const g=group(),s=snapshot(g);s.byGrade.push({...g,metadata:{...g.metadata,versionId:'lj3-hv'}});
 const html=createGroupReportDocument(s,'grade','https://example.test');
 assert.equal((html.match(/<article class="sheet">/g)||[]).length,6);
 assert.ok(html.includes('Leerjaar 3 VMBO'));assert.ok(html.includes('Leerjaar 3 HAVO/VWO'));
 assert.ok(html.includes('geen gezamenlijk scoregemiddelde'));
 assert.ok(html.includes('Klassen in deze selectie'));
 assert.equal((createGroupReportDocument(snapshot(g),'measurement','https://example.test').match(/<article class="sheet">/g)||[]).length,3);
});
test('snapshot identity, empty/error states and idempotence',()=>{
 const g=group(),s=snapshot(g);const before=JSON.stringify(s);
 assert.equal(createGroupReportDocument(s,'class','https://example.test'),createGroupReportDocument(s,'class','https://example.test'));
 assert.equal(JSON.stringify(s),before);s.byClass=[];
 assert.ok(createGroupReportDocument(s,'class','https://example.test').includes('Nog geen rapportgegevens'));
 assert.throws(()=>createGroupReportDocument({...s,schemaVersion:2},'class','https://example.test'),/niet ondersteund/);
 assert.throws(()=>createGroupReportDocument({...s,minimumReportingCount:4},'class','https://example.test'),/niet ondersteund/);
 assert.throws(()=>createGroupReportDocument({...s,generatedAt:'invalid'},'class','https://example.test'),/generatiedatum/);
});

