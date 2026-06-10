// Genereert src/data/assessments.public.json zonder scoringsgeheimen voor MC-items.
// Draaien met: npx tsx scripts/generate-public-instruments.mts
import fs from "node:fs";
import { assessments, defaultCodeMappings } from "../src/data/assessments.server";

const SECRET_ITEM_KEYS = [
  "correctAnswer",
  "correctOptionIds",
  "harmfulOptionIds",
  "harmfulSelectionMaxScore",
  "internalSlot",
];
const SECRET_OPTION_KEYS = ["errorCategory", "sourceType"];

const sanitized = JSON.parse(JSON.stringify(assessments));
let strippedItems = 0;

for (const assessment of sanitized) {
  for (const section of assessment.sections) {
    for (const item of section.items) {
      if (item.type !== "multiple_choice") continue;
      for (const key of SECRET_ITEM_KEYS) {
        if (key in item) delete item[key];
      }
      for (const option of item.options ?? []) {
        for (const key of SECRET_OPTION_KEYS) {
          if (key in option) delete option[key];
        }
      }
      strippedItems += 1;
    }
  }
}

const out = { assessments: sanitized, defaultCodeMappings };
fs.writeFileSync("src/data/assessments.public.json", JSON.stringify(out));

// Controle: geen geheime sleutels meer op MC-items (PT-regels mogen ze nog hebben).
for (const assessment of sanitized) {
  for (const section of assessment.sections) {
    for (const item of section.items) {
      if (item.type !== "multiple_choice") continue;
      for (const key of SECRET_ITEM_KEYS) {
        if (key in item) { console.error(`LEK: ${key} op ${item.id}`); process.exit(1); }
      }
    }
  }
}
console.log(`ok: ${strippedItems} MC-items geschoond`);
