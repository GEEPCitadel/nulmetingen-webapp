import fs from "node:fs";

const sourcePath = "nulmetingen_selected_response_herontwerp_v3.json";
const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const versionIds = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"];
const failures = [];

const selectedResponseItemsFor = (versionId) => {
  if (Array.isArray(data.selectedResponseItems)) {
    return data.selectedResponseItems.filter(
      (item) => (item.targetGroup ?? item.target ?? item.variantFor) === versionId,
    );
  }
  return data.assessments?.find((entry) => entry.id === versionId)?.selectedResponseItems ?? [];
};

const optionGroupsFor = (item) =>
  item.subQuestions?.length
    ? item.subQuestions.map((subQuestion) => ({
        id: `${item.id}:${subQuestion.id}`,
        options: subQuestion.options ?? [],
      }))
    : [{ id: item.id, options: item.options ?? [] }];

const isUnknownText = (value) =>
  String(value ?? "")
    .trim()
    .replace(/\.$/, "") === "Ik weet het niet";

for (const versionId of versionIds) {
  const items = selectedResponseItemsFor(versionId);
  if (items.length === 0) {
    failures.push(`Ontbrekende nulmeting: ${versionId}`);
    continue;
  }

  if (items.length !== 13) {
    failures.push(`${versionId} heeft ${items.length} SR-items in plaats van 13.`);
  }



  for (const item of items) {
    const optionTexts = optionGroupsFor(item).flatMap((group) =>
      group.options.map((option) => option.text ?? option.label ?? ""),
    );
    for (const group of optionGroupsFor(item)) {
      const options = group.options;
      const lastOption = options[options.length - 1];
      if (options.length > 0 && !isUnknownText(lastOption?.text ?? lastOption?.label)) {
        failures.push(`${group.id} heeft 'Ik weet het niet' niet als laatste optie.`);
      }
    }
    if (item.itemType === "multiple-select") {
      const correctCount = (item.options ?? []).filter(
        (option) => option.isCorrect === true || option.correct === true,
      ).length;
      if (Number(item.selectionLimit ?? item.selectCount ?? 0) !== correctCount) {
        failures.push(`${item.id} heeft geen selectiegrens gelijk aan het aantal juiste opties.`);
      }
    }

    const text = `${item.title} ${item.question} ${optionTexts.join(" ")}`.toLowerCase();
    if (text.includes("reverse image search") || text.includes("omgekeerd zoeken")) {
      failures.push(`${item.id} bevat reverse image search.`);
    }
    if (/\bzoek(?:en)?\s+(?:op\s+)?(?:internet|google|bing)\b|\b(?:google|bing)\s+(?:zoek|zoeken)\b/.test(text)) {
      failures.push(`${item.id} lijkt live internetzoeken te vragen.`);
    }
  }
}

// Parallelvarianten: elk variabel SR-slot heeft >=1 bankvariant per versie,
// en elke bankvariant verwijst naar een bestaande actieve itemVersion.
const bank = Array.isArray(data.parallelVariantItems) ? data.parallelVariantItems : [];
const activeItemVersions = new Set(
  (data.selectedResponseItems ?? []).map((item) => item.itemVersion).filter(Boolean),
);
for (const versionId of versionIds) {
  const variableItems = selectedResponseItemsFor(versionId).filter(
    (item) => item.anchorStatus === "variable" || item.anchorStatus === "variable-slot",
  );
  for (const item of variableItems) {
    const variants = bank.filter(
      (candidate) =>
        candidate.targetGroup === versionId && candidate.internalSlot === item.internalSlot,
    );
    if (variants.length < 1) {
      failures.push(`${versionId} ${item.internalSlot}: geen parallelvariant in de itembank.`);
    }
  }
}
for (const variant of bank) {
  if (!variant.parallelTo || !activeItemVersions.has(variant.parallelTo)) {
    failures.push(`${variant.id}: parallelTo verwijst niet naar een actieve itemVersion.`);
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(
  `Anchor-verificatie geslaagd voor ${sourcePath}: 4 versies, 13 items, parallelvarianten (${bank.length}), selectiegrenzen en geen live zoekopdrachten.`,
);
