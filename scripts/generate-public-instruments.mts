// Genereert src/data/assessments.public.json zonder scoringsgeheimen voor MC-items.
// Bevat beide meetmoment-vormen: nulmeting en voortgangsmeting (variabel blok uit de bank).
// Draaien met: npx tsx scripts/generate-public-instruments.mts
import fs from "node:fs";
import {
  assessments,
  defaultCodeMappings,
  voortgangsAssessments,
} from "../src/data/assessments.server";

const SECRET_ITEM_KEYS = [
  "correctAnswer",
  "correctOptionIds",
  "harmfulOptionIds",
  "harmfulSelectionMaxScore",
  "internalSlot",
];
const SECRET_OPTION_KEYS = ["errorCategory", "sourceType"];

let strippedItems = 0;

const sanitize = (source: unknown) => {
  const sanitized = JSON.parse(JSON.stringify(source));
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
  return sanitized;
};

const sanitizedNulmeting = sanitize(assessments);
const sanitizedVoortgang = sanitize(voortgangsAssessments);

const out = {
  assessments: sanitizedNulmeting,
  voortgangsAssessments: sanitizedVoortgang,
  defaultCodeMappings,
};
fs.writeFileSync("src/data/assessments.public.json", JSON.stringify(out));

// Controle: geen geheime sleutels meer op MC-items (PT-regels mogen ze nog hebben).
for (const sanitized of [sanitizedNulmeting, sanitizedVoortgang]) {
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
}
console.log(`ok: ${strippedItems} MC-items geschoond (nulmeting + voortgangsmeting)`);
