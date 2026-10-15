const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');
const ts = require('typescript');
const fs = require('node:fs');
Module._extensions['.ts'] = (mod, file) => mod._compile(ts.transpileModule(fs.readFileSync(file,'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},fileName:file}).outputText,file);
const {createGroupReportPdf} = require('../src/lib/group-report-pdf.ts');
const metric = {averagePoints:6.8,maxPoints:9,itemCount:2,sampleCount:5,reportingMode:'percentage',percentage:100*6.8/9};
const group = () => ({metadata:{classCode:'3VM-A',versionId:'lj3-vmbo',gradeLevel:'lj3',assessmentWindow:'2026',cohort:'2026',assessmentBuildVersion:'example',contentKey:'hash'},completedCount:5,createdCodes:10,startedCount:5,registeredCompletedCount:5,missingResultCount:0,total:{...metric},selfAssessment:{mean:72,sampleCount:5},goals:Object.fromEntries(['21','22','23','21A','21B','21C','21D','22A','22B','23A','23B','23C'].map(id => [id,id==='21D'?{...metric,itemCount:1,percentage:null,reportingMode:'signal'}:{...metric}])),excludedFromTotalCount:0,comparisonAvailable:true,reportable:true,classes:[{classCode:'3VM-A',completedCount:5,createdCodes:10,startedCount:5,registeredCompletedCount:5,missingResultCount:0,includedInTotal:true}]});
const snapshot = g => ({schemaVersion:1,generatedAt:'2026-10-15T12:00:00.000Z',minimumReportingCount:5,byClass:[g],byGrade:[g],byMeasurement:[g]});
function read(pdf) {
 const text=Buffer.from(pdf).toString('latin1');
 assert.ok(text.startsWith('%PDF-1.4'));
 const offset=Number(text.match(/startxref\n(\d+)/)[1]);assert.equal(text.slice(offset,offset+4),'xref');
 const rows=text.slice(offset).split('\n');const count=Number(rows[1].split(' ')[1]);
 for(let i=1;i<count;i++){const n=Number(rows[2+i].slice(0,10));assert.equal(text.slice(n,n+`${i} 0 obj`.length),`${i} 0 obj`);}
 return text;
}
test('vector PDF preserves agreed metrics, self-assessment, signals and valid cross references',()=>{
 const s=snapshot(group()),before=JSON.stringify(s);const text=read(createGroupReportPdf(s,'class'));
 for(const t of ['Gemiddelde zelfinschatting','Gemiddelde itemsetscore','6,8 van 9 punten','72 van 100','Kerndoel 21','Subdoelen in beeld','Itemsignaal','Over dit overzicht','zelfonderschatting'])assert.ok(text.includes(t),t);
 assert.ok(!text.includes('Wat kun je ermee in de les'));assert.equal(JSON.stringify(s),before);
 assert.equal((text.match(/\/Type \/Page /g)||[]).length,3);
});
test('year/measurement includes class provenance, independent profiles and no source records',()=>{
 const g=group(),s=snapshot(g);s.byGrade.push({...g,metadata:{...g.metadata,versionId:'lj3-hv'}});
 assert.equal((read(createGroupReportPdf(s,'grade')).match(/\/Type \/Page /g)||[]).length,7);
 assert.equal((read(createGroupReportPdf(s,'measurement')).match(/\/Type \/Page /g)||[]).length,4);
 g.metadata.classCode='bad) Tj ET /PRIVATE (name';
 assert.ok(read(createGroupReportPdf(s,'class')).includes('bad\\)'));
 assert.ok(!read(createGroupReportPdf(s,'class')).includes('bad) Tj'));
});
test('missing data, long identifiers and many member classes flow to new pages safely',()=>{
 const g=group();g.total=null;g.selfAssessment=null;g.goals={};g.comparisonAvailable=false;g.missingResultCount=2;
 g.metadata.classCode='A'.repeat(250);g.metadata.cohort='B'.repeat(500);g.metadata.contentKey='c'.repeat(64);
 g.classes=Array.from({length:80},(_,i)=>({...g.classes[0],classCode:`synthetic-${i}`}));
 const text=read(createGroupReportPdf(snapshot(g),'grade'));
 assert.ok(text.includes('Opslagcontrole: 2'));assert.ok(text.includes('synthetic-79'));assert.ok(text.includes('Geen score:'));
 assert.ok(!text.includes('zelfoverschatting'));assert.ok((text.match(/\/Type \/Page /g)||[]).length>4);
});
test('PDF schema validation and empty state match screen semantics',()=>{
 const s=snapshot(group());s.byClass=[];assert.ok(read(createGroupReportPdf(s,'class')).includes('Nog geen rapportgegevens'));
 assert.throws(()=>createGroupReportPdf({...s,minimumReportingCount:1},'class'),/niet ondersteund/);
});

