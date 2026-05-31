import { build } from "esbuild";
import { mkdir, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const tmpDir = join(root, "tmp", "pt7-v7-tests");
const bundlePath = join(tmpDir, "assessment-bundle.mjs");
const dataBundlePath = join(tmpDir, "data-bundle.mjs");

await rm(tmpDir, { recursive: true, force: true });
await mkdir(tmpDir, { recursive: true });
await build({
  entryPoints: [join(root, "src", "lib", "assessment.ts")],
  outfile: bundlePath,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  logLevel: "silent",
});
await build({
  entryPoints: [join(root, "src", "data", "assessments.ts")],
  outfile: dataBundlePath,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node20",
  logLevel: "silent",
});

const { createSession, scoreItem, summarizeWhutsuppAnswer } = await import(pathToFileURL(bundlePath));
const { assessmentMap } = await import(pathToFileURL(dataBundlePath));

const labels = {
  start: "Wanneer er geklikt wordt op afspelen",
  bizzyClick: "wanneer er op Bizzy wordt geklikt",
  sayHoi: 'Bizzy zegt "Hoi!"',
  thinkHoi: 'Bizzy denkt "Hoi!"',
  sayReady: 'Bizzy zegt "Klaar voor de start!"',
  sayStart: 'Bizzy zegt "Start!"',
  thinkStart: 'Bizzy denkt "Start!"',
  thinkKlaar: 'Bizzy denkt "Klaar!"',
  sayKlaar: 'Bizzy zegt "Klaar!"',
  sayBravo: 'Bizzy zegt "Bravo!"',
  thinkBravo: 'Bizzy denkt "Bravo!"',
  move1: "verplaats Bizzy 1 meter vooruit in 1 sec.",
  move1Back: "verplaats Bizzy 1 meter achteruit in 1 sec.",
  move2: "verplaats Bizzy 2 meter vooruit in 1 sec.",
  move2Back: "verplaats Bizzy 2 meter achteruit in 1 sec.",
  move3: "verplaats Bizzy 3 meter vooruit in 1 sec.",
  turn90: "draai Bizzy met de wijzers van de klok mee naar 90° in 1 sec.",
  turn180: "draai Bizzy met de wijzers van de klok mee naar 180° in 1 sec.",
  repeat1: "herhaal 1 keer",
  repeat2: "herhaal 2 keer",
  repeat3: "herhaal 3 keer",
  repeat4: "herhaal 4 keer",
  repeat6: "herhaal 6 keer",
  repeat10: "herhaal 10 keer",
  animation: "verander animatie van Bizzy naar niet animeren",
  condition: "als 1 < 2",
};

const entry = (label, indent = 0) => ({ label, indent });
const answer = (entries) => ({ program: entries, executed: true });
const item = (version) =>
  assessmentMap[version].sections.flatMap((section) => section.items).find((candidate) =>
    candidate.id.endsWith("pt7-programming"),
  );
const score = (version, entries) => scoreItem(item(version), answer(entries)).score;

const tests = [
  ["LJ1V correct", "lj1-vmbo", [entry(labels.start), entry(labels.sayHoi), entry(labels.move1), entry(labels.turn180), entry(labels.thinkKlaar)], 4],
  ["LJ1V denkt Hoi", "lj1-vmbo", [entry(labels.start), entry(labels.thinkHoi), entry(labels.move1), entry(labels.turn180), entry(labels.thinkKlaar)], 3],
  ["LJ1V achteruit", "lj1-vmbo", [entry(labels.start), entry(labels.sayHoi), entry(labels.move1Back), entry(labels.turn180), entry(labels.thinkKlaar)], 2],
  ["LJ1V Bizzy event", "lj1-vmbo", [entry(labels.bizzyClick), entry(labels.sayHoi), entry(labels.move1), entry(labels.turn180), entry(labels.thinkKlaar)], 3],
  ["LJ1V leeg", "lj1-vmbo", [], 0],
  ["LJ1V alleen event", "lj1-vmbo", [entry(labels.start)], 0],

  ["LJ1H correct", "lj1-hv", [entry(labels.start), entry(labels.sayReady), entry(labels.repeat3), entry(labels.move1, 1), entry(labels.turn180)], 4],
  ["LJ1H drie losse", "lj1-hv", [entry(labels.start), entry(labels.sayReady), entry(labels.move1), entry(labels.move1), entry(labels.move1), entry(labels.turn180)], 2],
  ["LJ1H 3m los", "lj1-hv", [entry(labels.start), entry(labels.sayReady), entry(labels.move3), entry(labels.turn180)], 1],
  ["LJ1H herhaal 10", "lj1-hv", [entry(labels.start), entry(labels.sayReady), entry(labels.repeat10), entry(labels.move1, 1), entry(labels.turn180)], 2],
  ["LJ1H leeg", "lj1-hv", [], 0],
  ["LJ1H animatie neutraal", "lj1-hv", [entry(labels.start), entry(labels.animation), entry(labels.sayReady), entry(labels.repeat3), entry(labels.move1, 1), entry(labels.turn180)], 4],

  ["LJ3V correct", "lj3-vmbo", [entry(labels.start), entry(labels.sayStart), entry(labels.repeat4), entry(labels.move1, 1), entry(labels.turn90, 1), entry(labels.thinkKlaar)], 4],
  ["LJ3V los vierkant", "lj3-vmbo", [entry(labels.start), entry(labels.sayStart), entry(labels.move1), entry(labels.turn90), entry(labels.move1), entry(labels.turn90), entry(labels.move1), entry(labels.turn90), entry(labels.move1), entry(labels.turn90), entry(labels.thinkKlaar)], 2],
  ["LJ3V herhaal 3", "lj3-vmbo", [entry(labels.start), entry(labels.sayStart), entry(labels.repeat3), entry(labels.move1, 1), entry(labels.turn90, 1), entry(labels.thinkKlaar)], 1],
  ["LJ3V draai vergeten", "lj3-vmbo", [entry(labels.start), entry(labels.sayStart), entry(labels.repeat4), entry(labels.move1, 1), entry(labels.thinkKlaar)], 2],
  ["LJ3V omgekeerde body", "lj3-vmbo", [entry(labels.start), entry(labels.sayStart), entry(labels.repeat4), entry(labels.turn90, 1), entry(labels.move1, 1), entry(labels.thinkKlaar)], 3],
  ["LJ3V zegt Klaar", "lj3-vmbo", [entry(labels.start), entry(labels.sayStart), entry(labels.repeat4), entry(labels.move1, 1), entry(labels.turn90, 1), entry(labels.sayKlaar)], 3],

  ["LJ3H correct", "lj3-hv", [entry(labels.start), entry(labels.repeat3), entry(labels.move2, 1), entry(labels.turn180, 1), entry(labels.move2, 1), entry(labels.turn180, 1), entry(labels.sayBravo)], 4],
  ["LJ3H herhaal 6", "lj3-hv", [entry(labels.start), entry(labels.repeat6), entry(labels.move2, 1), entry(labels.turn180, 1), entry(labels.sayBravo)], 1],
  ["LJ3H 12 losse", "lj3-hv", [entry(labels.start), ...Array.from({ length: 3 }, () => [entry(labels.move2), entry(labels.turn180), entry(labels.move2), entry(labels.turn180)]).flat(), entry(labels.sayBravo)], 1],
  ["LJ3H 1m body", "lj3-hv", [entry(labels.start), entry(labels.repeat3), entry(labels.move1, 1), entry(labels.turn180, 1), entry(labels.move1, 1), entry(labels.turn180, 1), entry(labels.sayBravo)], 2],
  ["LJ3H omgekeerde body", "lj3-hv", [entry(labels.start), entry(labels.repeat3), entry(labels.turn180, 1), entry(labels.move2, 1), entry(labels.turn180, 1), entry(labels.move2, 1), entry(labels.sayBravo)], 3],
  ["LJ3H denkt Bravo", "lj3-hv", [entry(labels.start), entry(labels.repeat3), entry(labels.move2, 1), entry(labels.turn180, 1), entry(labels.move2, 1), entry(labels.turn180, 1), entry(labels.thinkBravo)], 3],
];

let failed = 0;
for (const [name, version, entries, expected] of tests) {
  const actual = score(version, entries);
  if (actual !== expected) {
    failed += 1;
    console.error(`${name}: expected ${expected}, got ${actual}`);
  }
}

const pt8Item = (version) =>
  assessmentMap[version].sections.flatMap((section) => section.items).find((candidate) =>
    candidate.id === "pt8-whutsupp-sam-video",
  );
const pt8Answer = (version, entries) => ({
  assessmentId: version,
  variantId: version,
  path: entries,
});
const pt8Score = (version, entries) => scoreItem(pt8Item(version), pt8Answer(version, entries)).score;
const pt8Summary = (version, entries) =>
  summarizeWhutsuppAnswer(pt8Item(version).whutsuppTask, pt8Answer(version, entries));

for (const version of ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"]) {
  const item = pt8Item(version);
  const variant = item?.whutsuppTask?.variants.find((candidate) => candidate.assessmentId === version);
  if (!item || item.type !== "whutsupp_scenario_task" || !variant) {
    failed += 1;
    console.error(`PT8 ${version}: variant/item missing`);
    continue;
  }
  if (variant.nodes.length !== 4 || !variant.nodes.every((node) => node.recovery?.choices?.length >= 2)) {
    failed += 1;
    console.error(`PT8 ${version}: expected four nodes with recovery choices`);
  }
  const session = createSession(assessmentMap[version], "test");
  const orders = variant.nodes.map((node) =>
    session.presentedOrders[`pt8:pt8-whutsupp-sam-video:${version}:${node.nodeId}:choices`] ?? [],
  );
  if (!orders.every((order) => order.at(-1) === "unknown")) {
    failed += 1;
    console.error(`PT8 ${version}: unknown option is not pinned to bottom`);
  }
  const correctEntries = variant.nodes.map((node) => ({
    nodeId: node.nodeId,
    choiceId: node.choices.find((choice) => choice.isCorrect)?.choiceId,
  }));
  const score = pt8Score(version, correctEntries);
  if (score !== 4) {
    failed += 1;
    console.error(`PT8 ${version}: expected all-safe score 4, got ${score}`);
  }
  const harmfulEntries = variant.nodes.map((node) => ({
    nodeId: node.nodeId,
    choiceId:
      node.choices.find((choice) => choice.flags.includes("harmful_share"))?.choiceId ??
      node.choices.find((choice) => choice.isCorrect)?.choiceId,
    recoveryChoiceId: node.recovery?.choices.find((choice) => choice.flags.includes("recovery_safe"))?.choiceId,
  }));
  const harmfulScore = pt8Score(version, harmfulEntries);
  const summary = pt8Summary(version, harmfulEntries);
  if (harmfulScore > 2 || summary.harmfulShareCount < 1 || summary.recoverySafeCount < 1) {
    failed += 1;
    console.error(`PT8 ${version}: harmful cap/recovery counters failed`);
  }
}

await rm(tmpDir, { recursive: true, force: true });
if (failed > 0) {
  process.exit(1);
}
console.log(`PT7 v7 scoring tests passed: ${tests.length}/${tests.length}`);
console.log("PT8 Whutsupp validation, scoring, caps, recovery, randomization and variant checks passed.");
