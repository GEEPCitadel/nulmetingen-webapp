export type Pt7ExecutableBlock = {
  id?: string;
  label: string;
  indent: number;
};

export type Pt7ExecutionStep<T extends Pt7ExecutableBlock> = {
  block: T;
  sourceIndex: number;
  iteration?: number;
  iterationCount?: number;
};

/**
 * Expands nested `herhaal N keer` blocks into the visible execution order.
 * Source indices remain stable so the editor can highlight the original row.
 */
export const buildPt7ExecutionPlan = <T extends Pt7ExecutableBlock>(
  sourceProgram: T[],
): Array<Pt7ExecutionStep<T>> => {
  const expandRange = (start: number, end: number): Array<Pt7ExecutionStep<T>> => {
    const plan: Array<Pt7ExecutionStep<T>> = [];
    let index = start;
    while (index < end) {
      const block = sourceProgram[index];
      const repeatMatch = block.label.match(/^herhaal (\d+) keer$/);
      if (repeatMatch && index + 1 < end && sourceProgram[index + 1].indent > block.indent) {
        let childEnd = index + 1;
        while (childEnd < end && sourceProgram[childEnd].indent > block.indent) {
          childEnd += 1;
        }
        const repeatCount = Math.min(10, Math.max(1, Number(repeatMatch[1])));
        for (let iteration = 0; iteration < repeatCount; iteration += 1) {
          plan.push({
            block: { ...block, label: `${block.label} · ronde ${iteration + 1}/${repeatCount}` },
            sourceIndex: index,
            iteration: iteration + 1,
            iterationCount: repeatCount,
          });
          plan.push(...expandRange(index + 1, childEnd));
        }
        index = childEnd;
        continue;
      }
      plan.push({ block, sourceIndex: index });
      index += 1;
    }
    return plan;
  };

  return expandRange(0, sourceProgram.length);
};

export const matchesPt7Program = (
  program: Array<Pick<Pt7ExecutableBlock, "label">>,
  expectedLabels: string[],
) =>
  program.length === expectedLabels.length &&
  expectedLabels.every((label, index) => program[index]?.label === label);

type Pt7RepairCheck = {
  id: string;
  description: string;
  points: number;
  blockId: string;
  expectedLabel: string;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const asStringArray = (value: unknown) =>
  Array.isArray(value) ? value.map((entry) => String(entry)) : [];

export const scorePt7DebugAnswer = ({
  itemId,
  wrongBlockIds,
  repairChecks,
  answer,
}: {
  itemId: string;
  wrongBlockIds: string[];
  repairChecks: Pt7RepairCheck[];
  answer: unknown;
}) => {
  const state = asRecord(answer);
  if (state.unknown === true) {
    return {
      isCorrect: false,
      score: 0,
      taskResults: [{
        taskId: "unknown",
        description: "leerling koos Ik weet het niet.",
        correct: false,
        points: 0,
        unknown: true,
      }],
    };
  }

  const selectedWrongBlockIds = asStringArray(state.selectedWrongBlockIds);
  const finalProgramState = asRecord(state.finalProgramState);
  const program = Array.isArray(finalProgramState.program)
    ? finalProgramState.program.map(asRecord).map((entry) => ({
        id: String(entry.id ?? ""),
        label: String(entry.label ?? ""),
      }))
    : [];
  const exactWrongSelection =
    selectedWrongBlockIds.length === wrongBlockIds.length &&
    wrongBlockIds.every((id) => selectedWrongBlockIds.includes(id));
  const selectedCorrectWrongCount = selectedWrongBlockIds.filter((id) => wrongBlockIds.includes(id)).length;
  const selectedIncorrectWrongCount = selectedWrongBlockIds.length - selectedCorrectWrongCount;
  const wrongSelectionPoints =
    selectedWrongBlockIds.length > 2 || selectedCorrectWrongCount === 0
      ? 0
      : exactWrongSelection
        ? 1
        : selectedIncorrectWrongCount <= 1
          ? 0.5
          : 0;
  const repairResults = repairChecks.map((check, checkIndex) => {
    const blockIndex = program.findIndex((entry) => entry.id === check.blockId);
    const block = program[blockIndex];
    const positionOk = itemId.startsWith("lj1v")
      ? blockIndex === (checkIndex === 0 ? 3 : 7)
      : true;
    const correct = block?.label === check.expectedLabel && positionOk;
    return {
      taskId: check.id,
      description: check.description,
      correct,
      points: correct ? check.points : 0,
    };
  });
  const simulationResult = asRecord(state.simulationResult);
  const testCorrect =
    state.playedAfterLastChange === true &&
    state.goalMatched === true &&
    simulationResult.executionTraceComplete === true;
  const taskResults = [
    {
      taskId: "wrong-blocks",
      description: "de twee foute blokken zijn aangewezen.",
      correct: exactWrongSelection,
      points: wrongSelectionPoints,
    },
    ...repairResults,
    {
      taskId: "test-proof",
      description: "na de laatste wijziging is correct getest met Afspelen.",
      correct: testCorrect,
      points: testCorrect ? 1 : 0,
    },
  ];

  return {
    isCorrect: taskResults.every((result) => result.correct),
    score: taskResults.reduce((sum, result) => sum + result.points, 0),
    taskResults,
  };
};

export type Pt7CatState = Pt7CatConfig & {
  active: boolean;
  patrolIndex: number;
};

export type Pt7WorldState = {
  teddy: Pt7Position & { heading: Pt7Heading };
  cats: Pt7CatState[];
  boneTaken: boolean;
  atomicSteps: number;
};

export type Pt7TraceAction =
  | "start"
  | "repeat"
  | "condition"
  | "walk"
  | "turn"
  | "jump"
  | "bark"
  | "take_bone"
  | "error";

export type Pt7TraceStep = {
  index: number;
  blockId: string;
  opcode: Pt7Opcode;
  action: Pt7TraceAction;
  label: string;
  iteration?: number;
  iterationCount?: number;
  conditionPassed?: boolean;
  noOp?: boolean;
  message: string;
  before: Pt7WorldState;
  after: Pt7WorldState;
};

export type Pt7ProgramNode = {
  block: Pt7ProgramBlock;
  children: Pt7ProgramNode[];
};

export type Pt7SimulationResult = {
  success: boolean;
  traceComplete: boolean;
  stoppedReason: string | null;
  finalState: Pt7WorldState;
  trace: Pt7TraceStep[];
  visitedPath: Pt7Position[];
  reachedWaypointCount: number;
  noOpCount: number;
  rubric: {
    relevantBlocks: boolean;
    structure: boolean;
    levelConcept: boolean;
    goal: boolean;
  };
};

const samePosition = (a: Pt7Position, b: Pt7Position) => a.x === b.x && a.y === b.y;

const cloneWorldState = (state: Pt7WorldState): Pt7WorldState => ({
  teddy: { ...state.teddy },
  cats: state.cats.map((cat) => ({
    ...cat,
    escapeTo: { ...cat.escapeTo },
    patrol: cat.patrol?.map((position) => ({ ...position })),
  })),
  boneTaken: state.boneTaken,
  atomicSteps: state.atomicSteps,
});

const headingDelta: Record<Pt7Heading, Pt7Position> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
};

const turnHeading = (heading: Pt7Heading, direction: "left" | "right") => {
  const headings: Pt7Heading[] = ["north", "east", "south", "west"];
  const offset = direction === "right" ? 1 : -1;
  return headings[(headings.indexOf(heading) + offset + headings.length) % headings.length];
};

const positionAhead = (
  teddy: Pt7Position & { heading: Pt7Heading },
  distance = 1,
): Pt7Position => {
  const delta = headingDelta[teddy.heading];
  return { x: teddy.x + delta.x * distance, y: teddy.y + delta.y * distance };
};

export const buildPt7ProgramTree = (program: Pt7ProgramBlock[]): Pt7ProgramNode[] => {
  const roots: Pt7ProgramNode[] = [];
  const stack: Array<{ indent: number; children: Pt7ProgramNode[] }> = [
    { indent: -1, children: roots },
  ];

  program.forEach((block) => {
    while (stack.length > 1 && stack[stack.length - 1].indent >= block.indent) {
      stack.pop();
    }
    const node = { block, children: [] } satisfies Pt7ProgramNode;
    stack[stack.length - 1].children.push(node);
    if (block.opcode === "repeat" || block.opcode === "if_cat_ahead") {
      stack.push({ indent: block.indent, children: node.children });
    }
  });
  return roots;
};

const hasOpcode = (nodes: Pt7ProgramNode[], opcode: Pt7Opcode): boolean =>
  nodes.some((node) => node.block.opcode === opcode || hasOpcode(node.children, opcode));

const findNode = (nodes: Pt7ProgramNode[], opcode: Pt7Opcode): Pt7ProgramNode | undefined => {
  for (const node of nodes) {
    if (node.block.opcode === opcode) return node;
    const nested = findNode(node.children, opcode);
    if (nested) return nested;
  }
  return undefined;
};

const evaluateLevelConcept = (tree: Pt7ProgramNode[], world: Pt7WorldConfig) => {
  const executableRoots = tree.filter((node) => node.block.opcode !== "start");
  if (world.concept === "sequence") {
    const canonical: Pt7Opcode[] = ["walk", "walk", "turn", "bark", "walk", "jump", "take_bone"];
    return executableRoots.length === canonical.length && canonical.every((opcode, index) => {
      const block = executableRoots[index]?.block;
      return block?.opcode === opcode && (opcode !== "turn" || block.parameters.direction === "right");
    });
  }

  const repeat = findNode(executableRoots, "repeat");
  const repeatCount = Number(repeat?.block.parameters.count ?? 0);
  if (!repeat || repeatCount !== world.canonicalRepeatCount) return false;
  if (world.concept === "repeat") {
    return repeat.children.length === 1 && repeat.children[0].block.opcode === "walk";
  }

  const conditionIndex = repeat.children.findIndex((node) => node.block.opcode === "if_cat_ahead");
  const walkIndex = repeat.children.findIndex((node) => node.block.opcode === "walk");
  const condition = conditionIndex >= 0 ? repeat.children[conditionIndex] : undefined;
  return Boolean(
    condition &&
    conditionIndex < walkIndex &&
    walkIndex >= 0 &&
    condition.children.some((node) => node.block.opcode === "bark"),
  );
};

export const createPt7InitialState = (world: Pt7WorldConfig): Pt7WorldState => ({
  teddy: { ...world.teddyStart },
  cats: world.cats.map((cat) => ({
    ...cat,
    escapeTo: { ...cat.escapeTo },
    patrol: cat.patrol?.map((position) => ({ ...position })),
    active: true,
    patrolIndex: Math.max(0, cat.patrol?.findIndex((position) => samePosition(position, cat)) ?? 0),
  })),
  boneTaken: false,
  atomicSteps: 0,
});

export const simulatePt7Program = (
  program: Pt7ProgramBlock[],
  world: Pt7WorldConfig,
): Pt7SimulationResult => {
  const tree = buildPt7ProgramTree(program);
  let state = createPt7InitialState(world);
  const trace: Pt7TraceStep[] = [];
  const visitedPath: Pt7Position[] = [{ x: state.teddy.x, y: state.teddy.y }];
  let stoppedReason: string | null = null;
  let noOpCount = 0;
  let reachedWaypointCount = samePosition(world.targetPath[0] ?? state.teddy, state.teddy) ? 1 : 0;

  const insideWorld = (position: Pt7Position) =>
    position.x >= 0 && position.y >= 0 && position.x < world.width && position.y < world.height;
  const isObstacle = (position: Pt7Position) => world.obstacles.some((entry) => samePosition(entry, position));
  const activeCatAt = (position: Pt7Position) => state.cats.find((cat) => cat.active && samePosition(cat, position));

  const pushTrace = ({
    block,
    action,
    message,
    before,
    iteration,
    iterationCount,
    conditionPassed,
    noOp,
  }: {
    block: Pt7ProgramBlock;
    action: Pt7TraceAction;
    message: string;
    before: Pt7WorldState;
    iteration?: number;
    iterationCount?: number;
    conditionPassed?: boolean;
    noOp?: boolean;
  }) => {
    trace.push({
      index: trace.length,
      blockId: block.id,
      opcode: block.opcode,
      action,
      label: block.label,
      iteration,
      iterationCount,
      conditionPassed,
      noOp,
      message,
      before,
      after: cloneWorldState(state),
    });
  };

  const updateWaypoint = () => {
    const expected = world.targetPath[reachedWaypointCount];
    if (expected && samePosition(expected, state.teddy)) reachedWaypointCount += 1;
  };

  const moveCats = () => {
    state.cats = state.cats.map((cat, catIndex, cats) => {
      if (!cat.active || !cat.patrol || cat.patrol.length < 2) return cat;
      const nextIndex = (cat.patrolIndex + 1) % cat.patrol.length;
      const next = cat.patrol[nextIndex];
      const occupiedByCat = cats.some((other, otherIndex) =>
        otherIndex !== catIndex && other.active && samePosition(other, next),
      );
      if (
        samePosition(state.teddy, next) ||
        isObstacle(next) ||
        occupiedByCat
      ) return cat;
      return { ...cat, ...next, patrolIndex: nextIndex };
    });
  };

  const fail = (block: Pt7ProgramBlock, message: string, before: Pt7WorldState) => {
    stoppedReason = message;
    pushTrace({ block, action: "error", message, before });
  };

  const runNodes = (nodes: Pt7ProgramNode[]) => {
    for (const node of nodes) {
      if (stoppedReason) return;
      const { block } = node;
      const before = cloneWorldState(state);
      if (block.opcode === "start") {
        pushTrace({ block, action: "start", message: "Teddy staat klaar.", before });
        continue;
      }
      if (block.opcode === "repeat") {
        const count = Math.min(6, Math.max(1, Number(block.parameters.count ?? 1)));
        for (let iteration = 1; iteration <= count && !stoppedReason; iteration += 1) {
          const repeatBefore = cloneWorldState(state);
          pushTrace({
            block,
            action: "repeat",
            message: `Herhaling ${iteration} van ${count}.`,
            before: repeatBefore,
            iteration,
            iterationCount: count,
          });
          runNodes(node.children);
        }
        continue;
      }
      if (block.opcode === "if_cat_ahead") {
        const conditionPassed = Boolean(activeCatAt(positionAhead(state.teddy)));
        pushTrace({
          block,
          action: "condition",
          message: conditionPassed ? "Er staat een kat voor Teddy." : "Geen kat voor Teddy.",
          before,
          conditionPassed,
        });
        if (conditionPassed) runNodes(node.children);
        continue;
      }

      if (state.atomicSteps >= world.maxAtomicSteps) {
        fail(block, "Het programma heeft te veel stappen.", before);
        return;
      }
      state.atomicSteps += 1;

      if (block.opcode === "walk") {
        const destination = positionAhead(state.teddy);
        if (!insideWorld(destination)) fail(block, "Teddy loopt buiten het park.", before);
        else if (isObstacle(destination)) fail(block, "Een boomstam blokkeert Teddy.", before);
        else if (activeCatAt(destination)) fail(block, "Een kat blokkeert Teddy.", before);
        else {
          state.teddy = { ...state.teddy, ...destination };
          visitedPath.push(destination);
          updateWaypoint();
          moveCats();
          pushTrace({ block, action: "walk", message: "Teddy loopt één vak.", before });
        }
        continue;
      }
      if (block.opcode === "turn") {
        const direction = block.parameters.direction === "left" ? "left" : "right";
        state.teddy.heading = turnHeading(state.teddy.heading, direction);
        moveCats();
        pushTrace({ block, action: "turn", message: `Teddy draait naar ${direction === "right" ? "rechts" : "links"}.`, before });
        continue;
      }
      if (block.opcode === "jump") {
        const hurdle = positionAhead(state.teddy);
        const destination = positionAhead(state.teddy, 2);
        if (!isObstacle(hurdle)) fail(block, "Hier staat geen boomstam om overheen te springen.", before);
        else if (!insideWorld(destination) || isObstacle(destination) || activeCatAt(destination)) {
          fail(block, "Teddy kan hier niet veilig landen.", before);
        } else {
          state.teddy = { ...state.teddy, ...destination };
          visitedPath.push(destination);
          updateWaypoint();
          moveCats();
          pushTrace({ block, action: "jump", message: "Teddy springt over de boomstam.", before });
        }
        continue;
      }
      if (block.opcode === "bark") {
        const cat = activeCatAt(positionAhead(state.teddy));
        if (!cat) {
          noOpCount += 1;
          pushTrace({ block, action: "bark", message: "Teddy blaft, maar er staat geen kat voor hem.", before, noOp: true });
        } else {
          state.cats = state.cats.map((entry) =>
            entry.id === cat.id ? { ...entry, ...entry.escapeTo, active: false } : entry,
          );
          pushTrace({ block, action: "bark", message: `${cat.name} schrikt en rent weg.`, before });
        }
        continue;
      }
      if (block.opcode === "take_bone") {
        if (!samePosition(positionAhead(state.teddy), world.bone)) {
          fail(block, "Het bot ligt nog niet voor Teddy.", before);
        } else {
          state.boneTaken = true;
          pushTrace({ block, action: "take_bone", message: "Teddy pakt zijn bot!", before });
        }
      }
    }
  };

  runNodes(tree);
  const presentOpcodes = world.requiredOpcodes.every((opcode) => hasOpcode(tree, opcode));
  const structure = reachedWaypointCount === world.targetPath.length && stoppedReason === null;
  const levelConcept = evaluateLevelConcept(tree, world);
  const success = state.boneTaken && stoppedReason === null;

  return {
    success,
    traceComplete: stoppedReason === null,
    stoppedReason,
    finalState: cloneWorldState(state),
    trace,
    visitedPath,
    reachedWaypointCount,
    noOpCount,
    rubric: {
      relevantBlocks: presentOpcodes && noOpCount === 0,
      structure,
      levelConcept,
      goal: success,
    },
  };
};

const asPt7Program = (value: unknown): Pt7ProgramBlock[] => {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry, index) => {
    const record = asRecord(entry);
    const opcode = String(record.opcode ?? "") as Pt7Opcode;
    if (!opcode) return [];
    const parametersRecord = asRecord(record.parameters ?? record.defaultParameters);
    const parameters: Pt7BlockParameters = {
      direction: parametersRecord.direction === "left" ? "left" : parametersRecord.direction === "right" ? "right" : undefined,
      count: Number.isFinite(Number(parametersRecord.count)) ? Number(parametersRecord.count) : undefined,
    };
    return [{
      id: String(record.id ?? `block-${index}`),
      label: String(record.label ?? opcode),
      category: String(record.category ?? "acties"),
      color: String(record.color ?? "#4d8fd1"),
      isContainer: record.isContainer === true,
      opcode,
      parameters,
      indent: Math.max(0, Number(record.indent ?? 0)),
    }];
  });
};

export const scorePt7TeddyAnswer = ({
  answer,
  world,
}: {
  answer: unknown;
  world: Pt7WorldConfig;
}) => {
  const stateRecord = asRecord(answer);
  if (stateRecord.unknown === true) {
    return {
      isCorrect: false,
      score: 0,
      taskResults: [{
        taskId: "unknown",
        description: "leerling koos Ik weet het niet.",
        correct: false,
        points: 0,
        unknown: true,
      }],
    };
  }
  const finalProgramState = asRecord(stateRecord.finalProgramState);
  const program = asPt7Program(finalProgramState.program);
  const simulation = simulatePt7Program(program, world);
  const playedAfterLastChange = stateRecord.playedAfterLastChange === true;
  const criteria = [
    {
      taskId: "relevant-blocks",
      description: "relevante blokken zonder overbodige uitgevoerde acties.",
      correct: simulation.rubric.relevantBlocks,
    },
    {
      taskId: "structure",
      description: "juiste volgorde en geldige programmastructuur.",
      correct: simulation.rubric.structure,
    },
    {
      taskId: "level-concept",
      description: "het programmeerconcept voor dit niveau is correct gebruikt.",
      correct: simulation.rubric.levelConcept,
    },
    {
      taskId: "working-result",
      description: "na de laatste wijziging getest en het bot gepakt.",
      correct: playedAfterLastChange && simulation.rubric.goal,
    },
  ];
  return {
    isCorrect: criteria.every((criterion) => criterion.correct),
    score: criteria.filter((criterion) => criterion.correct).length,
    taskResults: criteria.map((criterion) => ({
      ...criterion,
      points: criterion.correct ? 1 : 0,
    })),
  };
};
import type {
  Pt7BlockParameters,
  Pt7CatConfig,
  Pt7Heading,
  Pt7Opcode,
  Pt7Position,
  Pt7ProgramBlock,
  Pt7WorldConfig,
} from "../types";
