// Generate the server-only recovery scorer from the canonical app definitions.
// Never read pupil data while building; never change assessment content.
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import ts from "typescript";
const previous=Module._extensions[".ts"];
Module._extensions[".ts"]=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,"utf8"),{compilerOptions:{esModuleInterop:true,module:ts.ModuleKind.CommonJS,resolveJsonModule:true,target:ts.ScriptTarget.ES2022},fileName:filename}).outputText,filename);
const filename=path.resolve("src/data/assessments.ts"), loaded=new Module(filename);
loaded.filename=filename;loaded.paths=Module._nodeModulePaths(path.dirname(filename));Module._extensions[".ts"](loaded,filename);
const {assessments,sloLabels}=loaded.exports;
previous?Module._extensions[".ts"]=previous:delete Module._extensions[".ts"];
const source=fs.readFileSync("src/lib/assessment.ts","utf8");
const helperStart=source.indexOf("const assessmentGoalIds = "),helperEnd=source.indexOf("export const submitItemAnswer",helperStart);
const scorerStart=source.indexOf("export const calculateResult = "),scorerEnd=source.indexOf("export const getResultForStep",scorerStart);
if([helperStart,helperEnd,scorerStart,scorerEnd].some(index=>index<0))throw new Error("Canonical scoring function markers changed");
const definitions=assessments.map(a=>({id:a.id,assessmentBuildVersion:a.assessmentBuildVersion,assessmentContentHash:a.assessmentContentHash,sections:a.sections.map(s=>({id:s.id,title:s.title,items:s.items.map(i=>({id:i.id,points:i.points,kerndoel:i.kerndoel,skillDomain:i.skillDomain,primarySubgoal:i.primarySubgoal,subgoal:i.subgoal,itemVersion:i.itemVersion}))}))}));
const compiled=ts.transpileModule(source.slice(helperStart,helperEnd)+"\n"+source.slice(scorerStart,scorerEnd),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;
const output="// Generated from src/data/assessments.ts and src/lib/assessment.ts. Do not edit.\nconst sloLabels = "+JSON.stringify(sloLabels)+";\nexport const recoveryAssessments = "+JSON.stringify(definitions)+";\n"+compiled;
fs.mkdirSync("lib",{recursive:true});fs.writeFileSync("lib/recovery-runtime.js",output);
console.log("Server recovery runtime generated for all four canonical measurements.");
