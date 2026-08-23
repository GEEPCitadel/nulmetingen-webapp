import { useEffect, useMemo, useRef, useState } from "react";
import type { AssessmentItem, ProgrammingBlockDefinition, Pt7ProgramBlock, SelectedAnswer } from "../../types";
import {
  buildPt7ProgramTree,
  createPt7InitialState,
  simulatePt7Program,
} from "../../lib/pt7";
import type { Pt7SimulationResult } from "../../lib/pt7";
import { TeddyBlockEditor } from "./TeddyBlockEditor";
import { TeddyWorld } from "./TeddyWorld";
import "./pt7-teddy.css";

const shuffled = <T,>(values: T[]): T[] => {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const other = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[other]] = [copy[other], copy[index]];
  }
  return copy;
};

const createInstance = (definition: ProgrammingBlockDefinition, indent: number): Pt7ProgramBlock => ({
  ...definition,
  id: `${definition.id ?? definition.opcode ?? "block"}-${crypto.randomUUID()}`,
  opcode: definition.opcode ?? "walk",
  parameters: { ...(definition.defaultParameters ?? {}) },
  indent,
});

const startProgram = (item: AssessmentItem): Pt7ProgramBlock[] => {
  const start = item.blockTask?.initialProgram?.[0];
  if (!start) return [];
  return [{
    ...start,
    id: start.id ?? "teddy-start",
    opcode: start.opcode ?? "start",
    parameters: { ...(start.defaultParameters ?? {}) },
    indent: 0,
  }];
};

const subtreeEnd = (program: Pt7ProgramBlock[], index: number) => {
  const indent = program[index]?.indent ?? 0;
  let end = index + 1;
  while (end < program.length && program[end].indent > indent) end += 1;
  return end;
};

export const TeddyProgrammingTask = ({
  item,
  questionNumber,
  onSubmit,
  onSkip,
  onExit,
}: {
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (answer: SelectedAnswer, shownOptionOrder: string[]) => void;
  onSkip: () => void;
  onExit: () => void;
}) => {
  const task = item.blockTask;
  const world = task?.teddyWorld;
  const [program, setProgram] = useState<Pt7ProgramBlock[]>(() => startProgram(item));
  const [history, setHistory] = useState<Pt7ProgramBlock[][]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [events, setEvents] = useState<Array<Record<string, unknown>>>([]);
  const [lastChangedAt, setLastChangedAt] = useState<string | null>(null);
  const [lastPlayedAt, setLastPlayedAt] = useState<string | null>(null);
  const [playedAfterLastChange, setPlayedAfterLastChange] = useState(false);
  const [result, setResult] = useState<Pt7SimulationResult | null>(null);
  const [activeTraceIndex, setActiveTraceIndex] = useState(-1);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [completedBlockIds, setCompletedBlockIds] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [playCount, setPlayCount] = useState(0);
  const runToken = useRef(0);
  const [palette] = useState(() => shuffled(task?.blocks ?? []));
  const [directionOrder] = useState<Array<"left" | "right">>(() => shuffled(["left", "right"]));
  const [repeatOrder] = useState(() => shuffled([1, 2, 3, 4, 5, 6]));

  const currentState = useMemo(() => {
    if (!world) return null;
    if (!result || activeTraceIndex < 0) return createPt7InitialState(world);
    return result.trace[Math.min(activeTraceIndex, result.trace.length - 1)]?.after ?? result.finalState;
  }, [activeTraceIndex, result, world]);

  useEffect(() => () => { runToken.current += 1; }, []);

  if (!task || !world || !currentState) return null;

  const commit = (next: Pt7ProgramBlock[], event: Record<string, unknown>) => {
    const timestamp = new Date().toISOString();
    setHistory((current) => [...current.slice(-19), program]);
    setProgram(next);
    setEvents((current) => [...current, { ...event, timestamp }]);
    setLastChangedAt(timestamp);
    setPlayedAfterLastChange(false);
    setResult(null);
    setActiveTraceIndex(-1);
    setActiveBlockId(null);
    setCompletedBlockIds([]);
  };

  const addBlock = (definition: ProgrammingBlockDefinition, atIndex?: number) => {
    const selectedIndex = program.findIndex((block) => block.id === selectedId);
    const insertIndex = atIndex ?? (selectedIndex >= 0 ? subtreeEnd(program, selectedIndex) : program.length);
    const previous = program[Math.max(0, insertIndex - 1)];
    const indent = selectedIndex >= 0 && program[selectedIndex].isContainer && atIndex === undefined
      ? program[selectedIndex].indent + 1
      : previous?.indent ?? 0;
    const instance = createInstance(definition, Math.min(2, indent));
    const next = [...program.slice(0, insertIndex), instance, ...program.slice(insertIndex)];
    commit(next, { type: "block-added", definitionId: definition.id, blockId: instance.id, index: insertIndex });
    setSelectedId(instance.id);
  };

  const removeBlock = (id: string) => {
    const index = program.findIndex((block) => block.id === id);
    if (index <= 0) return;
    const end = subtreeEnd(program, index);
    const removed = program.slice(index, end).map((block) => block.id);
    commit([...program.slice(0, index), ...program.slice(end)], { type: "block-removed", blockIds: removed });
    setSelectedId(null);
  };

  const moveBlock = (id: string, direction: -1 | 1) => {
    const index = program.findIndex((block) => block.id === id);
    if (index <= 0) return;
    const end = subtreeEnd(program, index);
    const indent = program[index].indent;
    const group = program.slice(index, end);
    if (direction === -1) {
      let previous = index - 1;
      while (previous > 0 && program[previous].indent > indent) previous -= 1;
      if (previous <= 0 || program[previous].indent !== indent) return;
      const next = [...program.slice(0, previous), ...group, ...program.slice(previous, index), ...program.slice(end)];
      commit(next, { type: "block-moved", blockId: id, direction: "up" });
      return;
    }
    let nextSibling = end;
    while (nextSibling < program.length && program[nextSibling].indent > indent) nextSibling += 1;
    if (nextSibling >= program.length || program[nextSibling].indent !== indent) return;
    const nextEnd = subtreeEnd(program, nextSibling);
    const next = [...program.slice(0, index), ...program.slice(end, nextEnd), ...group, ...program.slice(nextEnd)];
    commit(next, { type: "block-moved", blockId: id, direction: "down" });
  };

  const moveBlockTo = (id: string, targetIndex: number) => {
    const index = program.findIndex((block) => block.id === id);
    if (index <= 0) return;
    const end = subtreeEnd(program, index);
    if (targetIndex >= index && targetIndex <= end) return;
    const group = program.slice(index, end);
    const remaining = [...program.slice(0, index), ...program.slice(end)];
    const adjustedTarget = Math.max(1, Math.min(
      remaining.length,
      targetIndex > end ? targetIndex - group.length : targetIndex,
    ));
    commit([...remaining.slice(0, adjustedTarget), ...group, ...remaining.slice(adjustedTarget)], {
      type: "block-dragged",
      blockId: id,
      targetIndex: adjustedTarget,
    });
  };

  const indentBlock = (id: string, direction: -1 | 1) => {
    const index = program.findIndex((block) => block.id === id);
    if (index <= 0) return;
    const end = subtreeEnd(program, index);
    const previous = program[index - 1];
    const maxIndent = Math.min(2, previous.indent + (previous.isContainer ? 1 : 0));
    const desired = Math.max(0, Math.min(maxIndent, program[index].indent + direction));
    const delta = desired - program[index].indent;
    if (!delta) return;
    const next = program.map((block, blockIndex) => blockIndex >= index && blockIndex < end
      ? { ...block, indent: Math.max(0, block.indent + delta) }
      : block);
    commit(next, { type: "block-indented", blockId: id, indent: desired });
  };

  const changeParameter = (id: string, parameters: Pt7ProgramBlock["parameters"]) => {
    commit(program.map((block) => block.id === id ? { ...block, parameters } : block), {
      type: "parameter-changed",
      blockId: id,
      parameters,
    });
  };

  const undo = () => {
    const previous = history[history.length - 1];
    if (!previous) return;
    const timestamp = new Date().toISOString();
    setProgram(previous);
    setHistory((current) => current.slice(0, -1));
    setEvents((current) => [...current, { type: "undo", timestamp }]);
    setLastChangedAt(timestamp);
    setPlayedAfterLastChange(false);
    setResult(null);
    setActiveTraceIndex(-1);
  };

  const clearProgram = (confirmFirst: boolean) => {
    if (confirmFirst && program.length > 3 && !window.confirm("Wil je alle blokken behalve 'bij start' wissen?")) return;
    commit(startProgram(item), { type: confirmFirst ? "program-cleared" : "program-reset" });
    setSelectedId(null);
  };

  const play = async () => {
    if (isRunning) return;
    const simulation = simulatePt7Program(program, world);
    const token = runToken.current + 1;
    runToken.current = token;
    setResult(simulation);
    setIsRunning(true);
    setActiveTraceIndex(-1);
    setCompletedBlockIds([]);
    setPlayCount((count) => count + 1);
    for (let index = 0; index < simulation.trace.length; index += 1) {
      if (runToken.current !== token) return;
      const step = simulation.trace[index];
      setActiveTraceIndex(index);
      setActiveBlockId(step.blockId);
      await new Promise((resolve) => window.setTimeout(resolve, task.playback?.stepMs ?? 520));
      setCompletedBlockIds((current) => current.includes(step.blockId) ? current : [...current, step.blockId]);
    }
    if (runToken.current !== token) return;
    const playedAt = new Date().toISOString();
    setActiveBlockId(null);
    setIsRunning(false);
    setLastPlayedAt(playedAt);
    setPlayedAfterLastChange(true);
  };

  const shownOrder = [
    ...palette.map((definition) => definition.id ?? definition.label),
    ...directionOrder.map((direction) => `turn:${direction}`),
    ...repeatOrder.map((count) => `repeat:${count}`),
  ];

  const submit = () => onSubmit({
    itemId: item.id,
    itemVersion: "pt7-teddy-build-v1",
    finalProgramState: {
      program,
      programTree: buildPt7ProgramTree(program),
    },
    paletteOrder: palette.map((definition) => definition.id ?? definition.label),
    parameterOptionOrder: { direction: directionOrder, repeat: repeatOrder },
    editEvents: events,
    playCount,
    playedAfterLastChange,
    simulationResult: result,
    goalMatched: result?.success === true,
    unknown: false,
    lastChangedAt,
    lastPlayedAt,
  }, shownOrder);

  const status = isRunning
    ? result?.trace[Math.max(0, activeTraceIndex)]?.message ?? "Teddy voert je programma uit…"
    : !result
      ? "Bouw je programma en test het met Afspelen."
      : result.success
        ? "Teddy heeft zijn bot!"
      : result.stoppedReason ?? "Teddy heeft het bot nog niet bereikt.";
  const displaySuccess = !isRunning && result?.success === true;
  const displayRetry = !isRunning && result !== null && !result.success;

  return (
    <section className="task-panel pt7-task-panel teddy-task-panel">
      <div className="teddy-task-shell">
        <header className="teddy-task-header">
          <div><span className="teddy-kicker">Opdracht {questionNumber} · PT7</span><h2>Teddy zoekt zijn bot</h2><p>{task.intro}</p></div>
          <button className={`teddy-play ${isRunning ? "is-running" : ""}`} type="button" onClick={play} disabled={isRunning || program.length <= 1}>
            <span aria-hidden="true">{isRunning ? "●" : "▶"}</span>{isRunning ? "Bezig…" : "Afspelen"}
          </button>
        </header>

        <div className="teddy-goal-strip">
          <strong>{task.visualGoal?.title}</strong>
          <div>{task.visualGoal?.lines.map((line, index) => <span key={line}><i>{index + 1}</i>{line}</span>)}</div>
        </div>

        <div className="teddy-workspace">
          <section className="teddy-world-panel" aria-label="Speelwereld">
            <TeddyWorld world={world} state={currentState} trace={result?.trace ?? []} activeTraceIndex={activeTraceIndex} />
            <div className={`teddy-run-status ${displaySuccess ? "is-success" : displayRetry ? "is-retry" : ""}`} role="status" aria-live="polite">
              <span aria-hidden="true">{isRunning ? "▶" : displaySuccess ? "✓" : displayRetry ? "↻" : "◇"}</span><strong>{status}</strong>
            </div>
          </section>
          <TeddyBlockEditor
            palette={palette}
            program={program}
            selectedId={selectedId}
            activeBlockId={activeBlockId}
            completedBlockIds={completedBlockIds}
            disabled={isRunning}
            directionOrder={directionOrder}
            repeatOrder={repeatOrder}
            onSelect={setSelectedId}
            onAdd={addBlock}
            onMove={moveBlock}
            onIndent={indentBlock}
            onRemove={removeBlock}
            onParameter={changeParameter}
            onDropAt={(definitionId, index) => {
              const definition = palette.find((entry) => entry.id === definitionId);
              if (definition) addBlock(definition, index);
            }}
            onMoveTo={moveBlockTo}
            onUndo={undo}
            onClear={() => clearProgram(true)}
            canUndo={history.length > 0}
          />
        </div>

        <div className="teddy-reset-row"><button type="button" onClick={() => clearProgram(false)} disabled={isRunning}>Herstel start</button></div>
      </div>

      <div className="task-nav">
        <span className="task-nav-spacer" aria-hidden="true" />
        <button className="task-nav-exit" type="button" onClick={onExit}>Afsluiten</button>
        <button className="task-nav-skip" type="button" onClick={onSkip}>Ik weet het niet</button>
        <button className="task-nav-primary" type="button" onClick={submit}><span>Volgende</span><span className="arrow-circle" aria-hidden="true">→</span></button>
      </div>
    </section>
  );
};
