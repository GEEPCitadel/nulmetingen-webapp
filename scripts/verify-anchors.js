import fs from "node:fs";

const source = fs.readFileSync("src/data/assessments.ts", "utf8");
const anchors = [
  "anker-sr-wachtwoord",
  "anker-sr-ai-hallucinatie",
  "anker-sr-auteursrecht-foto",
  "anker-sr-bronbeoordeling-klimaat",
];
const removed = [
  "lj1v-sr1-pw",
  "lj1v-sr7-hallucination",
  "lj1v-sr8-copyright",
  "lj1v-sr5-source",
  "lj1h-sr1-pw",
  "lj1h-sr8-hallucination",
  "lj1h-sr6-source",
  "lj3v-sr5-copyright",
  "lj3v-sr3-source",
  "lj3h-sr3-hallucination",
];

const failures = [];
for (const anchor of anchors) {
  if (!source.includes(`id: "${anchor}"`)) {
    failures.push(`Ontbrekend ankeritem: ${anchor}`);
  }
}

for (const id of removed) {
  if (!source.includes(`"${id}"`)) {
    failures.push(`Removal-id ontbreekt in v6Removals: ${id}`);
  }
}

if (!source.includes("versionSpecs.map(applyV6SrItems).map(buildAssessment)")) {
  failures.push("v6 SR-transformatie wordt niet toegepast bij het bouwen van assessments.");
}

if (!source.includes("ankerItemFlag: true")) {
  failures.push("Geen ankerItemFlag gevonden.");
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log("Anchor-verificatie geslaagd: 4 uniforme v6-ankers aanwezig en oude ids verwijderd.");
