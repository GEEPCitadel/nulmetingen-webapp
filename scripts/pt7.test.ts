import assert from "node:assert/strict";
import test from "node:test";
import { teddyWorlds } from "../src/data/pt7-teddy.ts";
import {
  buildPt7ExecutionPlan,
  matchesPt7Program,
  scorePt7DebugAnswer,
  scorePt7TeddyAnswer,
  simulatePt7Program,
} from "../src/lib/pt7.ts";
import type { AssessmentVersionId, Pt7Opcode, Pt7ProgramBlock } from "../src/types.ts";

test("een lineair vmbo1-programma behoudt acht zichtbare uitvoerstappen", () => {
  const labels = [
    "bij start",
    "1 stap vooruit",
    "1 stap vooruit",
    "draai naar rechts",
    "1 stap vooruit",
    "wacht 1 seconde",
    "draai naar links",
    'zeg "Klaar"',
  ];
  const program = labels.map((label, index) => ({ id: `block-${index}`, label, indent: 0 }));
  const plan = buildPt7ExecutionPlan(program);

  assert.equal(plan.length, 8);
  assert.deepEqual(plan.map((step) => step.sourceIndex), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.equal(matchesPt7Program(program, labels), true);
});

test("een geneste herhaal-4 markeert iedere ronde en de juiste bronregels", () => {
  const program = [
    { id: "start", label: "bij start", indent: 0 },
    { id: "repeat", label: "herhaal 4 keer", indent: 0 },
    { id: "move", label: "1 stap vooruit", indent: 1 },
    { id: "turn", label: "rechts draaien", indent: 1 },
    { id: "say", label: 'zeg "Vierkant"', indent: 0 },
  ];
  const plan = buildPt7ExecutionPlan(program);

  assert.equal(plan.length, 14);
  assert.deepEqual(plan.map((step) => step.sourceIndex), [0, 1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 3, 4]);
  assert.equal(plan.filter((step) => step.sourceIndex === 1).length, 4);
});

test("een ongenest herhaalblok voert volgende regels niet per ongeluk meervoudig uit", () => {
  const program = [
    { label: "herhaal 3 keer", indent: 0 },
    { label: "1 stap vooruit", indent: 0 },
  ];

  assert.equal(buildPt7ExecutionPlan(program).length, 2);
});

test("een extra of verkeerd blok faalt de eindprogrammacontrole", () => {
  const expected = ["bij start", "1 stap vooruit"];
  assert.equal(matchesPt7Program([{ label: "bij start" }, { label: "2 stappen vooruit" }], expected), false);
  assert.equal(matchesPt7Program([{ label: "bij start" }, { label: "1 stap vooruit" }, { label: "wacht" }], expected), false);
});

test("vmbo1 krijgt vier punten, maar verliest het testpunt zonder run na de laatste wijziging", () => {
  const wrongBlockIds = ["wrong-turn", "wrong-speech"];
  const repairChecks = [
    { id: "turn", description: "positie 4 klopt", points: 1, blockId: "wrong-turn", expectedLabel: "draai naar rechts" },
    { id: "say", description: "positie 8 klopt", points: 1, blockId: "wrong-speech", expectedLabel: 'zeg "Klaar"' },
  ];
  const program = [
    { id: "start", label: "bij start" },
    { id: "move-1", label: "1 stap vooruit" },
    { id: "move-2", label: "1 stap vooruit" },
    { id: "wrong-turn", label: "draai naar rechts" },
    { id: "move-3", label: "1 stap vooruit" },
    { id: "wait", label: "wacht 1 seconde" },
    { id: "left", label: "draai naar links" },
    { id: "wrong-speech", label: 'zeg "Klaar"' },
  ];
  const baseAnswer = {
    selectedWrongBlockIds: wrongBlockIds,
    finalProgramState: { program },
    goalMatched: true,
    simulationResult: { executionTraceComplete: true },
  };

  const passed = scorePt7DebugAnswer({ itemId: "lj1v-pt7", wrongBlockIds, repairChecks, answer: { ...baseAnswer, playedAfterLastChange: true } });
  const notReplayed = scorePt7DebugAnswer({ itemId: "lj1v-pt7", wrongBlockIds, repairChecks, answer: { ...baseAnswer, playedAfterLastChange: false } });

  assert.equal(passed.score, 4);
  assert.equal(passed.isCorrect, true);
  assert.equal(notReplayed.score, 3);
  assert.equal(notReplayed.isCorrect, false);
});

const teddyWorld = (versionId: AssessmentVersionId) => {
  const world = teddyWorlds[versionId];
  assert.ok(world);
  return world;
};

const teddyBlock = (
  id: string,
  opcode: Pt7Opcode,
  indent = 0,
  parameters: Pt7ProgramBlock["parameters"] = {},
): Pt7ProgramBlock => ({
  id,
  opcode,
  label: opcode,
  category: opcode === "repeat" || opcode === "if_cat_ahead" ? "besturing" : "acties",
  color: "#4d8fd1",
  isContainer: opcode === "repeat" || opcode === "if_cat_ahead",
  parameters,
  indent,
});

const canonicalPrograms: Record<AssessmentVersionId, Pt7ProgramBlock[]> = {
  "lj1-vmbo": [
    teddyBlock("start", "start"),
    teddyBlock("walk-1", "walk"),
    teddyBlock("walk-2", "walk"),
    teddyBlock("turn", "turn", 0, { direction: "right" }),
    teddyBlock("bark", "bark"),
    teddyBlock("walk-3", "walk"),
    teddyBlock("jump", "jump"),
    teddyBlock("take", "take_bone"),
  ],
  "lj1-hv": [
    teddyBlock("start", "start"),
    teddyBlock("repeat", "repeat", 0, { count: 3 }),
    teddyBlock("walk-repeat", "walk", 1),
    teddyBlock("turn", "turn", 0, { direction: "right" }),
    teddyBlock("bark", "bark"),
    teddyBlock("walk-after-cat", "walk"),
    teddyBlock("jump", "jump"),
    teddyBlock("take", "take_bone"),
  ],
  "lj3-vmbo": [
    teddyBlock("start", "start"),
    teddyBlock("repeat", "repeat", 0, { count: 5 }),
    teddyBlock("if", "if_cat_ahead", 1),
    teddyBlock("bark", "bark", 2),
    teddyBlock("walk", "walk", 1),
    teddyBlock("turn", "turn", 0, { direction: "right" }),
    teddyBlock("jump", "jump"),
    teddyBlock("take", "take_bone"),
  ],
  "lj3-hv": [
    teddyBlock("start", "start"),
    teddyBlock("repeat", "repeat", 0, { count: 6 }),
    teddyBlock("if", "if_cat_ahead", 1),
    teddyBlock("bark", "bark", 2),
    teddyBlock("walk", "walk", 1),
    teddyBlock("turn", "turn", 0, { direction: "right" }),
    teddyBlock("jump", "jump"),
    teddyBlock("take", "take_bone"),
  ],
};

for (const versionId of Object.keys(canonicalPrograms) as AssessmentVersionId[]) {
  test(`${versionId}: Teddy bereikt deterministisch zijn bot en behaalt vier punten`, () => {
    const world = teddyWorld(versionId);
    const program = canonicalPrograms[versionId];
    const firstRun = simulatePt7Program(program, world);
    const secondRun = simulatePt7Program(program, world);
    const score = scorePt7TeddyAnswer({
      world,
      answer: {
        finalProgramState: { program },
        playedAfterLastChange: true,
      },
    });

    assert.equal(firstRun.success, true, firstRun.stoppedReason ?? "doel niet bereikt");
    assert.deepEqual(firstRun.trace, secondRun.trace);
    assert.equal(firstRun.reachedWaypointCount, world.targetPath.length);
    assert.equal(score.score, 4);
    assert.equal(score.isCorrect, true);
  });
}

test("leerjaar 1 havo/vwo kan het doel uitgeschreven bereiken maar mist het herhaalpunt", () => {
  const world = teddyWorld("lj1-hv");
  const program = canonicalPrograms["lj1-hv"].flatMap((block) =>
    block.opcode === "repeat" || block.id === "walk-repeat"
      ? []
      : [block],
  );
  program.splice(1, 0, teddyBlock("walk-a", "walk"), teddyBlock("walk-b", "walk"), teddyBlock("walk-c", "walk"));
  const result = simulatePt7Program(program, world);

  assert.equal(result.success, true);
  assert.equal(result.rubric.levelConcept, false);
});

test("leerjaar 3 vmbo mist het conceptpunt wanneer blaf niet in de voorwaarde staat", () => {
  const world = teddyWorld("lj3-vmbo");
  const program = canonicalPrograms["lj3-vmbo"].map((block) =>
    block.opcode === "bark" ? { ...block, indent: 1 } : block,
  );
  const result = simulatePt7Program(program, world);
  assert.equal(result.rubric.levelConcept, false);
});

test("het eindgedragpunt vervalt zonder een run na de laatste wijziging", () => {
  const world = teddyWorld("lj3-hv");
  const score = scorePt7TeddyAnswer({
    world,
    answer: {
      finalProgramState: { program: canonicalPrograms["lj3-hv"] },
      playedAfterLastChange: false,
    },
  });
  assert.equal(score.score, 3);
  assert.equal(score.taskResults.find((entry) => entry.taskId === "working-result")?.correct, false);
});
