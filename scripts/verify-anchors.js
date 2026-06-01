import fs from "node:fs";

const sourcePath = "nulmetingen_selected_response_herontwerp_v3.json";
const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const versionIds = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"];
const failures = [];

const selectedResponseItemsFor = (versionId) => {
  if (Array.isArray(data.selectedResponseItems)) {
    return data.selectedResponseItems.filter(
      (item) => (item.targetGroup ?? item.target) === versionId,
    );
  }
  return data.assessments?.find((entry) => entry.id === versionId)?.selectedResponseItems ?? [];
};

for (const versionId of versionIds) {
  const items = selectedResponseItemsFor(versionId);
  if (items.length === 0) {
    failures.push(`Ontbrekende nulmeting: ${versionId}`);
    continue;
  }

  if (items.length !== 10) {
    failures.push(`${versionId} heeft ${items.length} SR-items in plaats van 10.`);
  }

  if (!items.some((item) => /https|slotje/i.test(`${item.title} ${item.question} ${item.stimulus?.address ?? ""} ${item.options?.map((option) => option.text).join(" ") ?? ""}`))) {
    failures.push(`${versionId} mist het HTTPS/slotje-anker.`);
  }

  if (!items.some((item) => /Youssef|telefoon/i.test(`${item.title} ${item.question}`))) {
    failures.push(`${versionId} mist de telefoon/Youssef-vraag.`);
  }

  for (const item of items) {
    const optionTexts = (item.options ?? []).map((option) => option.text);
    const lastOption = optionTexts[optionTexts.length - 1] ?? "";
    if (lastOption.replace(/\.$/, "") !== "Ik weet het niet") {
      failures.push(`${item.id} heeft 'Ik weet het niet' niet als laatste optie.`);
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
    if (/zoek.*(internet|google|bing)|google.*zoek|bing.*zoek/.test(text)) {
      failures.push(`${item.id} lijkt live internetzoeken te vragen.`);
    }
  }
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Anchor-verificatie geslaagd voor ${sourcePath}: 4 versies, 10 SR-items, HTTPS/telefoon-ankers, selectiegrenzen en geen live zoekopdrachten.`);
