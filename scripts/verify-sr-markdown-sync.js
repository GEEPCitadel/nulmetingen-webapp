import fs from "node:fs";

const v4JsonPath = "nulmetingen_dg_v4.json";
const v4MarkdownPath = "nulmetingen_dg_v4.md";
const legacyJsonPath = "nulmetingen_selected_response_herontwerp_v3.json";
const legacyMarkdownPath = "nulmetingen_dg_herontwerp_v3_5_codex.md";
const versionIds = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"];

const failures = [];

if (fs.existsSync(v4JsonPath) && fs.existsSync(v4MarkdownPath)) {
  const data = JSON.parse(fs.readFileSync(v4JsonPath, "utf8"));
  const markdown = fs.readFileSync(v4MarkdownPath, "utf8");

  for (const versionId of versionIds) {
    const assessment = data.assessments?.find((entry) => entry.assessmentId === versionId);
    const srItems = assessment?.sections?.find((section) => section.sectionId === "sr")?.items ?? [];
    const jsonIds = srItems.map((item) => item.itemId);

    if (jsonIds.length !== 10) {
      failures.push(`${versionId}: v4 JSON bevat ${jsonIds.length} SR-items in plaats van 10.`);
    }

    const missingInMarkdown = jsonIds.filter((id) => !markdown.includes(id));
    if (missingInMarkdown.length > 0) {
      failures.push(`${versionId}: ontbreekt in v4 Markdown: ${missingInMarkdown.join(", ")}`);
    }
  }

  if (failures.length > 0) {
    console.error(failures.join("\n"));
    process.exit(1);
  }

  console.log(
    `SR Markdown-sync geslaagd: ${versionIds.length} nulmetingen, v4 SR-item-id's aanwezig in ${v4JsonPath} en ${v4MarkdownPath}.`,
  );
  process.exit(0);
}

const jsonPath = legacyJsonPath;
const markdownPath = legacyMarkdownPath;
const data = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
const markdown = fs.readFileSync(markdownPath, "utf8");

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
