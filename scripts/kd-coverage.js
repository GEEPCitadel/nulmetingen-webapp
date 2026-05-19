import fs from "node:fs";

const source = fs.readFileSync("src/data/assessments.ts", "utf8");
const versionIds = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"];
const kdIds = ["21A", "21B", "21C", "21D", "22A", "22B", "23A", "23B", "23C"];

const versionBlocks = new Map();
for (const id of versionIds) {
  const start = source.indexOf(`id: "${id}"`);
  const nextStarts = versionIds
    .map((candidate) => source.indexOf(`id: "${candidate}"`, start + 1))
    .filter((index) => index > start);
  const end = nextStarts.length ? Math.min(...nextStarts) : source.indexOf("\n];", start);
  versionBlocks.set(id, source.slice(start, end));
}

console.log("KD coverage quick report (statische telling uit assessments.ts):");
for (const id of versionIds) {
  const block = versionBlocks.get(id) ?? "";
  const counts = Object.fromEntries(kdIds.map((kd) => [kd, 0]));
  for (const kd of kdIds) {
    counts[kd] = (block.match(new RegExp(`kerndoel: "[^"]*${kd}`, "g")) ?? []).length;
  }
  console.log(
    `${id}: ${kdIds.map((kd) => `${kd}=${counts[kd]}`).join(" | ")}`,
  );
}
