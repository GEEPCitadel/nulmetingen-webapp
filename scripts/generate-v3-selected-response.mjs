import { readFileSync, writeFileSync } from "node:fs";

const [sourcePath, outputPath] = process.argv.slice(2);

if (!sourcePath || !outputPath) {
  throw new Error("Usage: node scripts/generate-v3-selected-response.mjs <source.md> <output.json>");
}

const source = readFileSync(sourcePath, "utf8").replace(/\r\n/g, "\n");
const versionMatches = Array.from(
  source.matchAll(/^## 3\.(\d) .+?\(`([^`]+)`\)\n([\s\S]*?)(?=^## 3\.\d |^## 4\. Performance tasks v3)/gm),
);

const items = [];

for (const [, , targetGroup, body] of versionMatches) {
  const itemMatches = Array.from(
    body.matchAll(/^### `([^`]+)` — ([^\n]+)\n([\s\S]*?)(?=\n### `|\n---\n|(?![\s\S]))/gm),
  );

  for (const [, id, title, itemBody] of itemMatches) {
    const subgoal = itemBody.match(/^- Subdoel: ([^\n]+)/m)?.[1].trim();
    const itemTypeLine = itemBody.match(/^- Vraagtype: ([^\n]+)/m)?.[1].trim() ?? "single-choice";
    const anchorStatus = itemBody.match(/^- Anchorstatus: ([^\n]+)/m)?.[1].trim();
    const question = itemBody.match(/^- Vraag: ([\s\S]*?)(?=\n- Antwoordopties:)/m)?.[1].trim();
    const rationale = itemBody.match(/^- Onderbouwing: ([\s\S]*?)(?=\n### `|\n---\n|$)/m)?.[1].trim();
    const scoringLine = itemBody.match(/^- Scoring: ([^\n]+)/m)?.[1]?.trim();
    const isMultiple = itemTypeLine.includes("multiple-select");
    const selectionLimit = Number(itemTypeLine.match(/maximaal\s+(\d+)/)?.[1] ?? (isMultiple ? 0 : 1)) || null;
    const optionBlock = itemBody.match(/^- Antwoordopties:\n([\s\S]*?)(?=\n- Scoring:|\n- Onderbouwing:)/m)?.[1] ?? "";

    const options = Array.from(optionBlock.matchAll(/^\s+- ([A-Z])\. ([\s\S]*?)(?: \*\((correct|harmful)\)\*)?\s*$/gm)).map(
      ([, optionId, text, marker]) => ({
        id: optionId,
        text: text.trim(),
        isCorrect: marker === "correct",
        isHarmful: marker === "harmful",
        isUnknownOption: text.trim().replace(/\.$/, "") === "Ik weet het niet",
      }),
    );

    if (!subgoal || !question || options.length === 0) {
      throw new Error(
        `Could not parse ${id}: subgoal=${Boolean(subgoal)} question=${Boolean(question)} options=${options.length} body=${JSON.stringify(itemBody.slice(0, 240))}`,
      );
    }

    const correctIds = options.filter((option) => option.isCorrect).map((option) => option.id);
    const harmfulIds = options.filter((option) => option.isHarmful).map((option) => option.id);

    items.push({
      id,
      targetGroup,
      subgoal,
      title: title.trim(),
      itemType: isMultiple ? "multiple-select" : "single-choice",
      selectionLimit: isMultiple ? selectionLimit : 1,
      question,
      options,
      correctAnswer: isMultiple ? correctIds : correctIds[0],
      harmfulAnswers: harmfulIds,
      scoring: {
        maxPoints: 1,
        rule: isMultiple ? "partial-select" : "exact-choice",
        unknownScoresZero: true,
        unknownExclusive: true,
        harmfulCap:
          scoringLine?.match(/cap op ([\d,.]+)/)?.[1]?.replace(",", ".") ??
          (harmfulIds.length > 0 ? "0.5" : undefined),
      },
      anchorStatus,
      validityNote: rationale,
    });
  }
}

const byVersion = Object.groupBy(items, (item) => item.targetGroup);
for (const [versionId, versionItems] of Object.entries(byVersion)) {
  if (versionItems.length !== 10) {
    throw new Error(`${versionId} has ${versionItems.length} selected-response items`);
  }
}

writeFileSync(
  outputPath,
  `${JSON.stringify(
    {
      schemaVersion: "dg-nulmetingen-v3",
      status: "werkversie voor Codex-implementatie, pilotafname en interne review",
      source: "nulmetingen_dg_herontwerp_v3_codex.md",
      selectedResponseItems: items,
    },
    null,
    2,
  )}\n`,
);
