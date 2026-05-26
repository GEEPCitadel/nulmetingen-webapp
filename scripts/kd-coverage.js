import fs from "node:fs";

const sourcePath = "nulmetingen_selected_response_herontwerp_v3.json";
const data = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const versionIds = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"];
const kdIds = ["21A", "21B", "21C", "21D", "22A", "22B", "23A", "23B", "23C"];

const selectedResponseItemsFor = (versionId) => {
  if (Array.isArray(data.selectedResponseItems)) {
    return data.selectedResponseItems.filter(
      (item) => (item.targetGroup ?? item.target) === versionId,
    );
  }
  return data.assessments?.find((entry) => entry.id === versionId)?.selectedResponseItems ?? [];
};

console.log(`KD coverage quick report (SR-set uit ${sourcePath}):`);
for (const versionId of versionIds) {
  const counts = Object.fromEntries(kdIds.map((kd) => [kd, 0]));
  for (const item of selectedResponseItemsFor(versionId)) {
    const subgoal = String(item.subgoal ?? "");
    for (const kd of kdIds) {
      if (subgoal.includes(kd)) counts[kd] += 1;
    }
  }
  console.log(`${versionId}: ${kdIds.map((kd) => `${kd}=${counts[kd]}`).join(" | ")}`);
}
