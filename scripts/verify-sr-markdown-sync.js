import fs from "node:fs";

const jsonPath = "nulmetingen_selected_response_herontwerp_v3.json";
const markdownPath = "nulmetingen_dg_herontwerp_v3_5_codex.md";
const versionIds = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"];

const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");
const failures = [];

const selectedResponseItemsFor = (versionId) => {
  if (Array.isArray(data.selectedResponseItems)) {
    return data.selectedResponseItems.filter(
      (item) => (item.targetGroup ?? item.target ?? item.variantFor) === versionId,
    );
  }
  return data.assessments?.find((entry) => entry.id === versionId)?.selectedResponseItems ?? [];
};

const sectionHeadingPattern = /^### Leerjaar [^\n]+ \(`([^`]+)`\)/gm;
const sectionHeadings = [...markdown.matchAll(sectionHeadingPattern)];
const markdownIdsByVersion = new Map();

for (let index = 0; index < sectionHeadings.length; index += 1) {
  const heading = sectionHeadings[index];
  const versionId = heading[1];
  const sectionStart = heading.index ?? 0;
  const nextSectionStart = sectionHeadings[index + 1]?.index ?? markdown.indexOf("\n## ", sectionStart + 1);
  const sectionEnd = nextSectionStart === -1 ? markdown.length : nextSectionStart;
  const section = markdown.slice(sectionStart, sectionEnd);

  markdownIdsByVersion.set(
    versionId,
    [...section.matchAll(/^#### `([^`]+)`/gm)].map((match) => match[1]),
  );
}

const diff = (left, right) => left.filter((id) => !right.includes(id));

for (const versionId of versionIds) {
  const jsonIds = selectedResponseItemsFor(versionId).map((item) => item.id);
  const markdownIds = markdownIdsByVersion.get(versionId) ?? [];

  if (jsonIds.length !== 10) {
    failures.push(`${versionId}: JSON bevat ${jsonIds.length} SR-items in plaats van 10.`);
  }
  if (markdownIds.length !== 10) {
    failures.push(`${versionId}: Markdown bevat ${markdownIds.length} SR-items in plaats van 10.`);
  }

  const missingInMarkdown = diff(jsonIds, markdownIds);
  const missingInJson = diff(markdownIds, jsonIds);

  if (missingInMarkdown.length > 0) {
    failures.push(`${versionId}: ontbreekt in Markdown: ${missingInMarkdown.join(", ")}`);
  }
  if (missingInJson.length > 0) {
    failures.push(`${versionId}: ontbreekt in JSON: ${missingInJson.join(", ")}`);
  }

  if (
    missingInMarkdown.length === 0 &&
    missingInJson.length === 0 &&
    jsonIds.join("|") !== markdownIds.join("|")
  ) {
    failures.push(`${versionId}: JSON en Markdown bevatten dezelfde ids, maar in andere volgorde.`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `SR Markdown-sync geslaagd: ${versionIds.length} nulmetingen, 40 SR-item-id's gelijk in ${jsonPath} en ${markdownPath}.`,
);
