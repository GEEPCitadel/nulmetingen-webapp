import { QuestionHeader, SubmitAnswerPayload, shuffleItems } from "../app/shared";
import { TaskNavFooter } from "../components/TaskNavFooter";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import {
  assessmentMap,
  defaultCodeMappings,
  themes,
} from "../data/assessments";
import {
  calculateResult,
  completeSession,
  createSession,
  getAssessment,
  getItemByStep,
  getPresentedInteractionOrder,
  getPresentedOrder,
  getSectionById,
  getStepDescriptors,
  submitItemAnswer,
} from "../lib/assessment";
import {
  buildPath,
  copyNode,
  createFile,
  createFolder,
  deleteNode,
  getChildren,
  getNodeById,
  moveNode,
  renameNode,
  undoPt1,
} from "../lib/pt1";
import {
  readActiveSession,
  saveActiveSession,
} from "../lib/storage";
import type {
  AssessmentItem,
  AssessmentSection,
  AssessmentSession,
  AssessmentVersion,
  EventLog,
  GoalScore,
  IncomingMailStimulus,
  InteractionGroup,
  Option,
  Pt1Node,
  Pt1State,
  ProgrammingBlockDefinition,
  SelectedAnswer,
  SessionMetadata,
  StepDescriptor,
  ThemeDefinition,
  WhutsuppChoice,
  WhutsuppMessage,
  WhutsuppPathEntry,
} from "../types";


export type ProgramBlock = ProgrammingBlockDefinition & {
  indent: number;
  correctReplacementId?: string;
};
export type ProgramRunEffects = {
  move: number;
  rotation: number;
  speech: string;
  display: string;
  sound: string;
  score: number | null;
  speed: number | null;
  animationPaused: boolean;
  teller: number;
  log: string[];
};

export const emptyProgramRunEffects: ProgramRunEffects = {
  move: 0,
  rotation: 0,
  speech: "",
  display: "",
  sound: "",
  score: null,
  speed: null,
  animationPaused: false,
  teller: 0,
  log: [],
};

export const BlockProgrammingTaskView = ({
  section,
  item,
  questionNumber,
  onSubmit,
  onSkip,
  onExit,
}: {
  section: AssessmentSection;
  item: AssessmentItem;
  questionNumber: number;
  onSubmit: (payload: SubmitAnswerPayload) => void;
  onSkip: () => void;
  onExit: () => void;
}) => {
  const [program, setProgram] = useState<ProgramBlock[]>(() =>
    (item.blockTask?.initialProgram ?? []).map((block, index) => ({
      ...block,
      indent: block.isContainer && index > 0 ? 0 : 0,
    })),
  );
  const [executed, setExecuted] = useState(false);
  const [selectedWrongBlockIds, setSelectedWrongBlockIds] = useState<string[]>([]);
  const [selectedProgramIndex, setSelectedProgramIndex] = useState<number | null>(null);
  const [paletteMode, setPaletteMode] = useState<"replace" | "insert">("replace");
  const [replacementActions, setReplacementActions] = useState<
    Array<{ replacedBlockId: string; replacementBlockId: string; timestamp: string }>
  >([]);
  const [blockAddedEvents, setBlockAddedEvents] = useState<Array<Record<string, unknown>>>([]);
  const [blockRemovedEvents, setBlockRemovedEvents] = useState<Array<Record<string, unknown>>>([]);
  const [blockMovedEvents, setBlockMovedEvents] = useState<Array<Record<string, unknown>>>([]);
  const [lastChangedAt, setLastChangedAt] = useState<string | null>(null);
  const [lastPlayedAt, setLastPlayedAt] = useState<string | null>(null);
  const [playedAfterLastChange, setPlayedAfterLastChange] = useState(false);
  const [playRuns, setPlayRuns] = useState<Array<Record<string, unknown>>>([]);
  const [goalMatched, setGoalMatched] = useState(false);
  const [speechVisible, setSpeechVisible] = useState(false);
  const [aPresses, setAPresses] = useState(0);
  const [temperature, setTemperature] = useState(30);
  const [windowOpen, setWindowOpen] = useState(true);
  const [runEffects, setRunEffects] = useState<ProgramRunEffects>(
    emptyProgramRunEffects,
  );
  const [runStep, setRunStep] = useState(-1); // -1 idle; otherwise index of currently-active block
  const [runTimer, setRunTimer] = useState<number | null>(null);
  const runCancelledRef = useRef(false);
  const task = item.blockTask;
  const [paletteBlocks] = useState(() => shuffleItems(item.blockTask?.blocks ?? []));
  if (!task) {
    return null;
  }
  const isDebugTask = task.itemVersion === "pt7-debug-v1";
  const blockByLabel = new Map(task.blocks.map((block) => [block.label, block]));
  const blockStyle = (block: Pick<ProgrammingBlockDefinition, "color">) =>
    ({ "--block-color": block.color } as CSSProperties);

  const markProgramChanged = (changedAt: string) => {
    setLastChangedAt(changedAt);
    setPlayedAfterLastChange(false);
    setGoalMatched(false);
  };

  const addBlockToProgram = (block: ProgrammingBlockDefinition) => {
    if (isDebugTask && paletteMode === "replace" && selectedProgramIndex !== null) {
      const changedAt = new Date().toISOString();
      const replaced = program[selectedProgramIndex];
      if (!replaced) {
        return;
      }
      setProgram((current) => {
        return current.map((entry, index) =>
          index === selectedProgramIndex
            ? {
                ...block,
                id: entry.id,
                correctReplacementId: entry.correctReplacementId,
                indent: entry.indent,
              }
            : entry,
        );
      });
      setReplacementActions((events) => [
        ...events,
        {
          replacedBlockId: replaced.id ?? "",
          replacementBlockId: block.id ?? block.label,
          timestamp: changedAt,
        },
      ]);
      markProgramChanged(changedAt);
      return;
    }
    if (isDebugTask) {
      const changedAt = new Date().toISOString();
      const insertIndex = selectedProgramIndex === null ? program.length : selectedProgramIndex + 1;
      const newBlock: ProgramBlock = {
        ...block,
        id: `${block.id ?? block.label}-added-${Date.now()}`,
        indent: 0,
      };
      setProgram((current) => [
        ...current.slice(0, insertIndex),
        newBlock,
        ...current.slice(insertIndex),
      ]);
      setBlockAddedEvents((events) => [
        ...events,
        {
          blockId: newBlock.id,
          blockLabel: newBlock.label,
          insertIndex,
          timestamp: changedAt,
        },
      ]);
      setSelectedProgramIndex(insertIndex);
      markProgramChanged(changedAt);
      return;
    }
    setProgram((current) => {
      const previous = current[current.length - 1];
      return [
        ...current,
        {
          ...block,
          indent: previous?.isContainer
            ? Math.min(3, (previous.indent ?? 0) + 1)
            : previous?.indent ?? 0,
        },
      ];
    });
  };

  const removeProgramBlock = (index: number) => {
    const block = program[index];
    if (!block || (index === 0 && block.label === "bij start")) {
      return;
    }
    const changedAt = new Date().toISOString();
    setProgram((current) => current.filter((_, i) => i !== index));
    setSelectedWrongBlockIds((current) => current.filter((id) => id !== (block.id ?? "")));
    setBlockRemovedEvents((events) => [
      ...events,
      {
        blockId: block.id ?? "",
        blockLabel: block.label,
        index,
        timestamp: changedAt,
      },
    ]);
    setSelectedProgramIndex(null);
    markProgramChanged(changedAt);
  };

  const moveProgramBlock = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= program.length || index === 0 || targetIndex === 0) {
      return;
    }
    const changedAt = new Date().toISOString();
    setProgram((current) => {
      const next = [...current];
      const [moved] = next.splice(index, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setBlockMovedEvents((events) => [
      ...events,
      {
        blockId: program[index]?.id ?? "",
        blockLabel: program[index]?.label ?? "",
        fromIndex: index,
        toIndex: targetIndex,
        timestamp: changedAt,
      },
    ]);
    setSelectedProgramIndex(targetIndex);
    markProgramChanged(changedAt);
  };
  const hasBlock = (label: string) => program.some((block) => block.label === label);

  const executeProgram = (): ProgramRunEffects => {
    const effects: ProgramRunEffects = {
      ...emptyProgramRunEffects,
      log: [],
      teller: 0,
    };
    let nextMoveMultiplier = 1;
    let stopped = false;
    const sensorConditionPass = temperature > 25 && windowOpen;
    const sensorConditionIndex = program.findIndex((block) =>
      block.label.includes("temperatuur > 25) EN"),
    );
    const sensorElseIndex = program.findIndex((block) => block.label === "anders");

    program.forEach((block, index) => {
      const label = block.label;
      if (stopped) {
        effects.log.push(`Overgeslagen na stop alles: ${label}`);
        return;
      }

      if (label.includes("afspelen") || label === "bij start") {
        effects.log.push(`Start uitgevoerd: ${label}`);
        return;
      }
      if (label.includes("wanneer er op Bizzy")) {
        effects.log.push("Bizzy-klikblok is actief gezet.");
        return;
      }
      if (label.includes('zegt "Hoi!"')) {
        effects.speech = "Hoi!";
        effects.log.push("Bizzy zegt: Hoi!");
        return;
      }
      if (label.includes("verplaats Bizzy 1 meter vooruit")) {
        effects.move += nextMoveMultiplier;
        effects.log.push(`Bizzy beweegt ${nextMoveMultiplier} meter vooruit.`);
        nextMoveMultiplier = 1;
        return;
      }
      if (label === "1 stap vooruit") {
        effects.move += nextMoveMultiplier;
        effects.log.push(`Bizzy beweegt ${nextMoveMultiplier} stap vooruit.`);
        nextMoveMultiplier = 1;
        return;
      }
      if (label === "2 stappen vooruit") {
        effects.move += 2;
        effects.log.push("Bizzy beweegt 2 stappen vooruit.");
        return;
      }
      if (label === "2 stappen achteruit") {
        effects.move -= 2;
        effects.log.push("Bizzy beweegt 2 stappen achteruit.");
        return;
      }
      if (label.includes("verplaats Bizzy 5 meters achteruit")) {
        effects.move -= 5;
        effects.log.push("Bizzy beweegt 5 meter achteruit.");
        return;
      }
      if (label.includes("draai Bizzy")) {
        effects.rotation = 180;
        effects.log.push("Bizzy draait naar 180 graden.");
        return;
      }
      if (label === "draai naar rechts" || label === "rechts draaien") {
        effects.rotation += 90;
        effects.log.push("Bizzy draait naar rechts.");
        return;
      }
      if (label === "draai naar links" || label === "links draaien") {
        effects.rotation -= 90;
        effects.log.push("Bizzy draait naar links.");
        return;
      }
      if (label.includes("niet animeren")) {
        effects.animationPaused = true;
        effects.log.push("De animatie van Bizzy staat op niet animeren.");
        return;
      }
      if (label === "herhaal 3 keer") {
        nextMoveMultiplier = 3;
        effects.log.push("Herhaling ingesteld op 3 keer.");
        return;
      }
      if (label === "herhaal 10 keer") {
        nextMoveMultiplier = 10;
        effects.log.push("Herhaling ingesteld op 10 keer.");
        return;
      }
      if (label === "herhaal altijd") {
        effects.log.push("Herhaal altijd gestart.");
        return;
      }
      if (label === "als 1 < 2") {
        effects.log.push("Voorwaarde 1 < 2 gecontroleerd: waar.");
        return;
      }
      if (label === "als Bizzy rand raakt") {
        effects.log.push("Bizzy controleert of hij de rand raakt.");
        return;
      }
      if (label.startsWith("speel geluid")) {
        effects.sound = label.replace("speel geluid ", "");
        effects.log.push(`Geluid afgespeeld: ${effects.sound}.`);
        return;
      }
      if (label.startsWith("wacht")) {
        effects.log.push(`${label} uitgevoerd.`);
        return;
      }
      if (label === "zet score op 0") {
        effects.score = 0;
        effects.log.push("Score is op 0 gezet.");
        return;
      }
      if (label === "zet snelheid op 2") {
        effects.speed = 2;
        effects.log.push("Snelheid is op 2 gezet.");
        return;
      }
      if (label === "stop alles") {
        stopped = true;
        effects.log.push("Stop alles uitgevoerd.");
        return;
      }
      if (label === "zet teller op 0") {
        effects.teller = 0;
        effects.log.push("Teller is op 0 gezet.");
        return;
      }
      if (label === "als knop A wordt ingedrukt") {
        effects.log.push("Knop A is als gebeurtenis actief gezet.");
        return;
      }
      if (label === "als knop B wordt ingedrukt") {
        effects.log.push("Knop B is als gebeurtenis actief gezet.");
        return;
      }
      if (label === "verander teller met 1") {
        effects.teller += 1;
        effects.log.push("Teller is met 1 verhoogd.");
        return;
      }
      if (label === "verander teller met -1") {
        effects.teller -= 1;
        effects.log.push("Teller is met 1 verlaagd.");
        return;
      }
      if (label === "als teller >= 5 dan") {
        effects.log.push(`Controle teller >= 5: ${aPresses >= 5 ? "waar" : "niet waar"}.`);
        return;
      }
      if (label === "als teller < 5 dan") {
        effects.log.push(`Controle teller < 5: ${aPresses < 5 ? "waar" : "niet waar"}.`);
        return;
      }
      if (label === 'toon "vol"') {
        if (aPresses >= 5 || task.device !== "microbit") {
          effects.display = "vol";
        }
        effects.log.push('Scherm toont "vol".');
        return;
      }
      if (label === 'toon "leeg"') {
        effects.display = "leeg";
        effects.log.push('Scherm toont "leeg".');
        return;
      }
      if (label === "lees temperatuur") {
        effects.log.push(`Temperatuur gelezen: ${temperature}.`);
        return;
      }
      if (label === "lees raamstand") {
        effects.log.push(`Raamstand gelezen: ${windowOpen ? "open" : "dicht"}.`);
        return;
      }
      if (label.includes("temperatuur > 25") || label.includes("temperatuur < 25")) {
        effects.log.push(`Voorwaarde gecontroleerd: ${label}.`);
        return;
      }
      if (label === "anders") {
        effects.log.push("Anders-tak bereikt.");
        return;
      }
      if (label === 'toon "waarschuwing"') {
        const inThenBranch =
          sensorConditionIndex === -1 ||
          (index > sensorConditionIndex &&
            (sensorElseIndex === -1 || index < sensorElseIndex));
        if (task.device !== "sensor" || !inThenBranch || sensorConditionPass) {
          effects.display = "waarschuwing";
        }
        effects.log.push('Scherm toont "waarschuwing" wanneer de tak actief is.');
        return;
      }
      if (label === 'toon "ok"') {
        const inElseBranch = sensorElseIndex !== -1 && index > sensorElseIndex;
        if (task.device !== "sensor" || !inElseBranch || !sensorConditionPass) {
          effects.display = "ok";
        }
        effects.log.push('Scherm toont "ok" wanneer de tak actief is.');
        return;
      }
      if (label === 'toon "Oké"') {
        effects.display = "Oké";
        effects.log.push('Scherm toont "Oké".');
        return;
      }
      if (label === 'toon "Koelen"') {
        effects.display = "Koelen";
        effects.log.push('Scherm toont "Koelen".');
        return;
      }
      if (label.startsWith('zeg "')) {
        effects.speech = label.slice(5, -1);
        effects.log.push(`Bizzy zegt: ${effects.speech}.`);
        return;
      }
      if (label === 'toon "koud"') {
        effects.display = "koud";
        effects.log.push('Scherm toont "koud".');
        return;
      }
      if (label === "verwijder temperatuur") {
        effects.log.push("Temperatuurwaarde is verwijderd.");
        return;
      }
      if (label === "zet temperatuur op 0") {
        effects.log.push("Temperatuur is op 0 gezet.");
        return;
      }

      effects.log.push(`Uitgevoerd: ${label}`);
    });

    return effects;
  };

  const stopStepper = () => {
    if (runTimer !== null) {
      window.clearTimeout(runTimer);
      setRunTimer(null);
    }
    setRunStep(-1);
  };

  const evaluateDebugProgram = () => {
    const labels = program.map((block) => block.label);
    const has = (label: string) => labels.includes(label);
    const includes = (part: string) => labels.some((label) => label.includes(part));
    const testResults = (task.tests ?? []).map((test) => {
      let output = "";
      let log: string[] = [];
      if (item.id.startsWith("lj1v")) {
        const correctLabels = task.correctProgram ?? [];
        const exactProgram =
          labels.length === correctLabels.length &&
          correctLabels.every((label, index) => labels[index] === label);
        output = exactProgram
          ? 'START | vooruit | vooruit | rechts | vooruit | wacht | links | Klaar'
          : "niet hetzelfde";
        log = labels.map((label) =>
          label === "bij start"
            ? "Start"
            : label === "draai naar rechts"
              ? "Draai rechts"
              : label === "draai naar links"
                ? "Draai links"
                : label.startsWith('zeg "')
                  ? `Zeg: ${label.slice(5, -1)}`
                  : label,
        );
      } else if (item.id.startsWith("lj1h")) {
        output = has("herhaal 4 keer") && has("1 stap vooruit") && has("rechts draaien") && has('zeg "Vierkant"')
          ? "4x vooruit en rechts | Vierkant"
          : "niet hetzelfde";
        log = ["Start", has("herhaal 4 keer") ? "herhaal 4 keer" : "herhaal 3 keer", "1 stap vooruit, rechts draaien", has('zeg "Vierkant"') ? '"Vierkant"' : '"Klaar"'];
      } else if (item.id.startsWith("lj3v")) {
        const presses = Number(test.inputs?.presses ?? 0);
        const step = has("verander teller met 1") ? 1 : 2;
        const total = presses * step;
        const atLeast = has("als teller 5 of meer is dan");
        const greater = has("als teller groter dan 5 dan");
        const isFull = atLeast ? total >= 5 : greater ? total > 5 : false;
        output = isFull ? "Vol" : "Nog plek";
        log = [`teller = 0`, ...Array.from({ length: presses }, (_, index) => `A ingedrukt -> teller = ${(index + 1) * step}`), output];
      } else {
        const temp = Number(test.inputs?.temperature ?? 0);
        const open = test.inputs?.windowOpen === true;
        const useAnd = includes(" EN raamOpen = ja");
        const useOr = includes(" OF raamOpen = ja");
        const condition = useAnd ? temp > 25 && open : useOr ? temp > 25 || open : false;
        const elseOk = has('toon "Oké"') || has('toon "OkÃ©"');
        output = condition ? "Koelen" : elseOk ? "Oké" : "Verwarmen";
        log = [`temperatuur = ${temp}`, `raamOpen = ${open ? "ja" : "nee"}`, `${useAnd ? "EN" : "OF"} -> ${condition ? "waar" : "niet waar"}`, `toon "${output}"`];
      }
      return {
        testCaseId: test.id,
        label: test.label,
        expectedOutput: test.expectedOutput,
        finalOutput: output,
        correct: output === test.expectedOutput,
        executionTrace: log.map((entry, index) => ({
          blockId: program[Math.min(index, program.length - 1)]?.id ?? `step-${index + 1}`,
          blockLabel: entry,
          blockType: "debug",
          actionType: "execute",
          beforeState: {},
          afterState: {},
          visibleOutput: entry,
          matchedExpectedStep: output === test.expectedOutput,
        })),
        log,
      };
    });
    return {
      goalMatched: testResults.length > 0 && testResults.every((test) => test.correct),
      testResults,
      log: testResults.flatMap((test) => [test.label, ...test.log, `Resultaat: ${test.correct ? "goed" : "nog niet"}`]),
    };
  };

  const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const stepDuration = (label: string) => {
    if (label === "bij start" || label.includes("afspelen")) return 500;
    if (label.startsWith("wacht")) return 1000;
    if (label.startsWith('zeg "') || label.startsWith('toon "')) return 1200;
    if (label.includes("draai") || label.includes("rechts") || label.includes("links")) return 800;
    if (label.includes("stap") || label.includes("meter")) return task.playback?.stepMs ?? 900;
    return task.playback?.stepMs ?? 800;
  };

  const runBlockVisually = (
    block: ProgramBlock,
    current: ProgramRunEffects,
  ): { effects: ProgramRunEffects; visibleOutput: string; actionType: string } => {
    const effects: ProgramRunEffects = { ...current, log: [...current.log] };
    const label = block.label;
    let visibleOutput = label === "bij start" ? "Start" : label;
    let actionType = "execute";
    if (label === "bij start" || label.includes("afspelen")) {
      visibleOutput = "Start";
      actionType = "start";
    } else if (label === "1 stap vooruit") {
      effects.move += 1;
      visibleOutput = "1 stap vooruit";
      actionType = "move";
    } else if (label === "2 stappen vooruit") {
      effects.move += 2;
      visibleOutput = "2 stappen vooruit";
      actionType = "move";
    } else if (label === "3 stappen vooruit") {
      effects.move += 3;
      visibleOutput = "3 stappen vooruit";
      actionType = "move";
    } else if (label === "1 stap achteruit") {
      effects.move -= 1;
      visibleOutput = "1 stap achteruit";
      actionType = "move";
    } else if (label === "2 stappen achteruit") {
      effects.move -= 2;
      visibleOutput = "2 stappen achteruit";
      actionType = "move";
    } else if (label === "draai naar rechts" || label === "rechts draaien") {
      effects.rotation += 90;
      visibleOutput = "Draai rechts";
      actionType = "turn";
    } else if (label === "draai naar links" || label === "links draaien") {
      effects.rotation -= 90;
      visibleOutput = "Draai links";
      actionType = "turn";
    } else if (label.startsWith("wacht")) {
      visibleOutput = label === "wacht 1 seconde" ? "Wacht 1 seconde" : label;
      actionType = "wait";
    } else if (label.startsWith('zeg "')) {
      effects.speech = label.slice(5, -1);
      visibleOutput = `Zeg: ${effects.speech}`;
      actionType = "say";
    } else if (label.startsWith('toon "')) {
      effects.display = label.slice(6, -1);
      visibleOutput = `Toon: ${effects.display}`;
      actionType = "show";
    }
    effects.log.push(visibleOutput);
    return { effects, visibleOutput, actionType };
  };

  const playProgram = async () => {
    if (runStep >= 0) {
      runCancelledRef.current = true;
      stopStepper();
      return;
    }
    runCancelledRef.current = false;
    setExecuted(true);
    setRunEffects({ ...emptyProgramRunEffects, log: [] });
    setSpeechVisible(false);
    setGoalMatched(false);
    const programAtPlay = program.map((block) => ({ ...block }));
    let effects: ProgramRunEffects = { ...emptyProgramRunEffects, log: [] };
    const executionTrace: Array<Record<string, unknown>> = [];
    for (let index = 0; index < programAtPlay.length; index += 1) {
      if (runCancelledRef.current) {
        return;
      }
      const block = programAtPlay[index];
      setRunStep(index);
      const beforeState = { ...effects, log: effects.log };
      const step = runBlockVisually(block, effects);
      effects = step.effects;
      setRunEffects(effects);
      if (step.actionType === "say") {
        setSpeechVisible(true);
      }
      executionTrace.push({
        blockId: block.id ?? `step-${index + 1}`,
        blockLabel: block.label,
        blockType: block.category,
        actionType: step.actionType,
        beforeState,
        afterState: { ...effects, log: effects.log },
        visibleOutput: step.visibleOutput,
        matchedExpectedStep: (task.correctProgram ?? [])[index] === block.label,
      });
      await sleep(stepDuration(block.label));
      if (step.actionType === "say") {
        setSpeechVisible(false);
      }
      await sleep(300);
    }
    setRunStep(-1);
    setRunTimer(null);
    if (programAtPlay.length === 0 || runCancelledRef.current) {
      return;
    }
    const debugResult = isDebugTask ? evaluateDebugProgram() : null;
    if (!debugResult) {
      setRunEffects(executeProgram());
    }
    if (debugResult) {
      const timestamp = new Date().toISOString();
      setGoalMatched(debugResult.goalMatched);
      setPlayedAfterLastChange(true);
      setLastPlayedAt(timestamp);
      setPlayRuns((current) => [
        ...current,
        {
          runId: `run-${String(current.length + 1).padStart(3, "0")}`,
          timestamp,
          playCount: current.length + 1,
          programStateAtPlay: { program: programAtPlay },
          playedAfterLastChange: true,
          executionTrace,
          executionTraceComplete: executionTrace.length === programAtPlay.length,
          goalMatched: debugResult.goalMatched,
          failedStepId: debugResult.testResults.find((test) => !test.correct)?.testCaseId ?? null,
          finalOutput: debugResult.testResults.map((test) => test.finalOutput).join(" | "),
          itemVersion: "pt7-debug-v1",
          testCaseResults: debugResult.testResults,
          finalProgramState: { program: programAtPlay },
        },
      ]);
    }
  };
  const resetProgramRun = () => {
    stopStepper();
    setExecuted(false);
    setSpeechVisible(false);
    setAPresses(0);
    setRunEffects(emptyProgramRunEffects);
  };
  const returnToEditor = () => {
    stopStepper();
    setSpeechVisible(false);
    setExecuted(false);
    setRunEffects(emptyProgramRunEffects);
  };
  const isRunning = runStep >= 0;
  const microbitShowsFull =
    executed &&
    aPresses >= 5 &&
    hasBlock("verander teller met 1") &&
    hasBlock("als teller >= 5 dan") &&
    hasBlock('toon "vol"');
  const microbitDisplay =
    runEffects.display || (microbitShowsFull ? "vol" : executed ? runEffects.teller : aPresses);
  const sensorDisplay =
    runEffects.display ||
    (executed &&
    hasBlock("als (temperatuur > 25) EN (raam = open) dan") &&
    hasBlock('toon "waarschuwing"') &&
    hasBlock('toon "ok"')
      ? temperature > 25 && windowOpen
        ? "waarschuwing"
        : "ok"
      : "");

  return (
    <section className="panel stack-lg">
      <QuestionHeader
        questionNumber={questionNumber}
        title={item.title}
        instruction={task.intro}
      >
        <p className="helper-text">{item.instruction}</p>
        {isDebugTask ? (
          <>
            <div className="pt7-goal-card" aria-label="Doel">
              <strong>{task.visualGoal?.title ?? "DOEL"}</strong>
              {task.visualGoal?.steps ? (
                <div className="pt7-goal-steps">
                  {task.visualGoal.steps.map((step) => (
                    <span className={`pt7-goal-step goal-step-${step.tone ?? "arrow"}`} key={step.id}>
                      {step.icon ? <span className="pt7-goal-icon" aria-hidden="true">{step.icon}</span> : null}
                      <span>{step.label}</span>
                    </span>
                  ))}
                </div>
              ) : (
                (task.visualGoal?.lines ?? []).map((line) => (
                  <span key={line}>{line}</span>
                ))
              )}
            </div>
            <p className="pt7-debug-instruction">
              Gekozen foutblokken: {selectedWrongBlockIds.length}/2. Tik een fout blok aan. Kies daarna het goede blok.
            </p>
          </>
        ) : null}
        {task.codingSteps ? (
          <ol className="coding-steps">
            {task.codingSteps.map((stepText) => (
              <li key={stepText}>{stepText}</li>
            ))}
          </ol>
        ) : null}
      </QuestionHeader>

      <div className={`blocks-shell ${executed ? "is-executed" : ""}`}>
        {/* ── Palette ─────────────────────────────── */}
        <aside className="blocks-palette">
          {(() => {
            // Group shuffled palette by category, preserving the order in
            // which each category first appears.
            const grouped: { category: string; color: string; blocks: ProgrammingBlockDefinition[] }[] = [];
            const at = new Map<string, number>();
            paletteBlocks.forEach((b) => {
              if (!at.has(b.category)) {
                at.set(b.category, grouped.length);
                grouped.push({ category: b.category, color: b.color, blocks: [] });
              }
              grouped[at.get(b.category)!].blocks.push(b);
            });
            return grouped.map((cat) => (
              <div className="palette-cat" key={cat.category}>
                <div className="cat-title">
                  <span className="cat-dot" style={{ background: cat.color }} />
                  {cat.category}
                </div>
                <div className="palette-list">
                  {cat.blocks.map((b) => {
                    const shape = b.category === "gebeurtenissen"
                      ? "hat"
                      : b.isContainer ? "container" : "stack";
                    return (
                      <button
                        className="palette-block-btn"
                        key={b.label}
                        type="button"
                        onClick={() => addBlockToProgram(b)}
                        title={isDebugTask && paletteMode === "replace" && selectedProgramIndex !== null ? "Vervang geselecteerd blok" : "Voeg blok toe"}
                        disabled={isRunning}
                      >
                        <span
                          className={`block block-${shape}`}
                          style={blockStyle(b)}
                        >
                          <span className="block-label">{b.label}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </aside>

        {/* ── Canvas ──────────────────────────────── */}
        <section className="blocks-canvas">
          <div className="canvas-toolbar">
            <div className="canvas-toolbar-left">
              <h3>Werkblad</h3>
              <span className="canvas-meta">{program.length} {program.length === 1 ? "blok" : "blokken"}</span>
            </div>
            <div className="canvas-toolbar-right">
              <button
                className="ghost-btn"
                type="button"
                onClick={() => { setProgram([]); resetProgramRun(); }}
                disabled={program.length === 0 || isDebugTask}
              >
                Leegmaken
              </button>
              <button
                className={`play-btn ${isRunning ? "is-running" : ""}`}
                type="button"
                onClick={playProgram}
              >
                {isRunning ? (
                  <>
                    <span className="play-glyph">■</span> Stop
                  </>
                ) : (
                  <>
                    <span className="play-glyph">▸</span> Afspelen
                  </>
                )}
              </button>
              <button
                className="run-back-arrow"
                type="button"
                onClick={returnToEditor}
                disabled={!executed}
                aria-label="Terug"
                title="Terug"
              />
            </div>
          </div>

          {isDebugTask ? (
            <div className="pt7-editbar" role="group" aria-label="Bewerkmodus">
              <button
                className={paletteMode === "replace" ? "active" : ""}
                type="button"
                onClick={() => setPaletteMode("replace")}
              >
                Vervang
              </button>
              <button
                className={paletteMode === "insert" ? "active" : ""}
                type="button"
                onClick={() => setPaletteMode("insert")}
              >
                Voeg toe
              </button>
              <span>
                {paletteMode === "replace"
                  ? "Selecteer een blok op het werkblad en kies een vervangblok."
                  : "Kies een blok uit de blokkenbak; het komt na de selectie of onderaan."}
              </span>
            </div>
          ) : null}

          <div className={`blocks-canvas-area ${program.length === 0 ? "empty" : ""}`}>
            {program.length === 0 ? (
              <div className="canvas-empty">
                <div className="canvas-empty-icon">▾</div>
                <strong>Klik blokken aan om je programma te bouwen</strong>
              </div>
            ) : null}
            {program.map((block, index) => {
              const def = blockByLabel.get(block.label) ?? block;
              const shape = def.category === "gebeurtenissen"
                ? "hat"
                : def.isContainer ? "container" : "stack";
              const blockId = block.id ?? `${block.label}-${index}`;
              const selectedAsWrong = selectedWrongBlockIds.includes(blockId);
              return (
                <div
                  className={`canvas-row ${runStep === index ? "is-active" : ""}${selectedProgramIndex === index ? " selected" : ""}${selectedAsWrong ? " debug-selected" : ""}`}
                  key={`${block.label}-${index}`}
                  style={{ "--depth": block.indent } as CSSProperties}
                  onClick={() => {
                    if (!isDebugTask || isRunning) {
                      return;
                    }
                    setSelectedProgramIndex(index);
                    setSelectedWrongBlockIds((current) => {
                      if (current.includes(blockId)) {
                        return current.filter((id) => id !== blockId);
                      }
                      if (current.length >= 3) {
                        return current;
                      }
                      return [...current, blockId];
                    });
                  }}
                >
                  <span
                    className={`block block-${shape} ${runStep === index ? "is-active" : ""}`}
                    style={blockStyle(def)}
                  >
                    <span className="block-label">{block.label}</span>
                  </span>
                  <div className="canvas-row-tools">
                    <button
                      type="button"
                      aria-label="Verplaats omhoog"
                      disabled={isRunning || index <= 1}
                      onClick={(event) => {
                        event.stopPropagation();
                        moveProgramBlock(index, -1);
                      }}
                    >↑</button>
                    <button
                      type="button"
                      aria-label="Verplaats omlaag"
                      disabled={isRunning || index === 0 || index >= program.length - 1}
                      onClick={(event) => {
                        event.stopPropagation();
                        moveProgramBlock(index, 1);
                      }}
                    >↓</button>
                  </div>
                  <button
                    className="canvas-row-remove"
                    type="button"
                    aria-label="Verwijder blok"
                    disabled={isRunning || (index === 0 && block.label === "bij start")}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeProgramBlock(index);
                    }}
                  >×</button>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Device preview ──────────────────────── */}
        <aside className="blocks-preview">
          <div className="preview-head">
            <h3>{task.device === "microbit" ? "micro:bit" : task.device === "sensor" ? "Sensor" : "Bizzy"}</h3>
            <span className={`run-pill ${isRunning ? "is-running" : ""}`}>
              <span className="run-dot" />
              {isRunning ? `Stap ${Math.min(runStep + 1, program.length)}/${program.length}` : "Stand-by"}
            </span>
          </div>

          <div className={`bizzy-stage device-stage-${task.device ?? "bizzy"} ${isRunning ? "is-running" : ""}`}>
            {task.device === "microbit" ? (
              <div className="microbit-device">
                <div className="microbit-screen">{microbitDisplay}</div>
                <div className="microbit-buttons">
                  <button type="button" onClick={() => setAPresses((c) => c + 1)}>A</button>
                  <button type="button" onClick={() => setAPresses((c) => Math.max(0, c - 1))}>B</button>
                </div>
              </div>
            ) : task.device === "sensor" ? (
              <div className="sensor-device">
                <div className="sensor-readout">{sensorDisplay || "..."}</div>
                <label className="field">
                  <span>Temperatuur</span>
                  <input
                    max="35"
                    min="15"
                    type="range"
                    value={temperature}
                    onChange={(event) => setTemperature(Number(event.target.value))}
                  />
                </label>
                <button
                  className={`toggle-button ${windowOpen ? "active" : ""}`}
                  type="button"
                  onClick={() => setWindowOpen((current) => !current)}
                >
                  Raam {windowOpen ? "open" : "dicht"}
                </button>
              </div>
            ) : (
              <>
                <div className="bizzy-floor" />
                <div
                  className="bizzy-mover"
                  style={{
                    transform: `translateX(${runEffects.move * 18}px) rotate(${runEffects.rotation}deg)`,
                  }}
                >
                  {speechVisible ? <div className="bizzy-speech">{runEffects.speech}</div> : null}
                  <svg
                    className={`bizzy-svg ${isRunning ? "is-running" : ""}`}
                    viewBox="0 0 144 168"
                    width="120"
                    height="140"
                    aria-hidden="true"
                  >
                    <line x1="72" y1="18" x2="72" y2="6" stroke="#1B1D22" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="72" cy="6" r="6" fill="#E51C73" stroke="#1B1D22" strokeWidth="3" />
                    <rect x="14" y="16" width="116" height="98" rx="28" fill="#E51C73" stroke="#1B1D22" strokeWidth="4" />
                    <ellipse cx="42" cy="42" rx="14" ry="8" fill="#fff" opacity=".22" />
                    <circle cx="50" cy="58" r="14" fill="#fff" stroke="#1B1D22" strokeWidth="3" />
                    <circle cx="94" cy="58" r="14" fill="#fff" stroke="#1B1D22" strokeWidth="3" />
                    <circle className="bizzy-pupil" cx="50" cy="58" r="6" fill="#1B1D22" />
                    <circle className="bizzy-pupil" cx="94" cy="58" r="6" fill="#1B1D22" />
                    {speechVisible || isRunning ? (
                      <path d="M52 84 Q72 100 92 84" fill="none" stroke="#1B1D22" strokeWidth="5" strokeLinecap="round" />
                    ) : (
                      <rect x="60" y="84" width="24" height="5" rx="2.5" fill="#1B1D22" />
                    )}
                    <rect x="34" y="116" width="76" height="14" rx="6" fill="#1B1D22" />
                    <rect x="30" y="128" width="34" height="32" rx="14" fill="#1B1D22" />
                    <rect x="80" y="128" width="34" height="32" rx="14" fill="#1B1D22" />
                    <circle cx="47" cy="144" r="5" fill="#fff" opacity=".7" />
                    <circle cx="97" cy="144" r="5" fill="#fff" opacity=".7" />
                  </svg>
                </div>
              </>
            )}
          </div>

          {runEffects.log.length > 0 ? (
            <div className="execution-log">
              <strong>Uitgevoerd:</strong>
              <ol>
                {runEffects.log.map((entry, index) => (
                  <li key={`${entry}-${index}`}>{entry}</li>
                ))}
              </ol>
              {runEffects.sound ? <span>Geluid: {runEffects.sound}</span> : null}
              {runEffects.score !== null ? <span>Score: {runEffects.score}</span> : null}
              {runEffects.speed !== null ? <span>Snelheid: {runEffects.speed}</span> : null}
              {runEffects.animationPaused ? <span>Animatie: niet animeren</span> : null}
            </div>
          ) : null}
        </aside>
      </div>

      {isDebugTask ? (
        <button
          className="ghost-button"
          type="button"
          onClick={() =>
            onSubmit({
              section,
              item,
              selectedAnswer: {
                itemId: item.id,
                itemVersion: "pt7-debug-v1",
                selectedWrongBlockIds,
                selectedNonWrongBlockIds: selectedWrongBlockIds,
                replacementActions,
                blockAddedEvents,
                blockRemovedEvents,
                blockMovedEvents,
                blockReplacedEvents: replacementActions,
                finalProgramState: { program },
                playCount: playRuns.length,
                playedAfterLastChange,
                simulationResult: playRuns[playRuns.length - 1] ?? {},
                goalMatched: false,
                unknown: true,
                errorCategories: ["unknown"],
                lastChangedAt,
                lastPlayedAt,
                testCaseResults: [],
                misconceptionFlags: [],
                playRuns,
              },
              shownOptionOrder: paletteBlocks.map((block) => block.label),
            })
          }
        >
          Ik weet het niet
        </button>
      ) : null}

      <TaskNavFooter
        questionNumber={questionNumber}
        primaryLabel="Volgende"
        onPrimary={() =>
          onSubmit({
            section,
            item,
            selectedAnswer: isDebugTask
              ? {
                  itemId: item.id,
                  itemVersion: "pt7-debug-v1",
                  selectedWrongBlockIds,
                  selectedNonWrongBlockIds: selectedWrongBlockIds.filter(
                    (id) => !(task.wrongBlockIds ?? []).includes(id),
                  ),
                  replacementActions,
                  blockAddedEvents,
                  blockRemovedEvents,
                  blockMovedEvents,
                  blockReplacedEvents: replacementActions,
                  finalProgramState: { program },
                  playCount: playRuns.length,
                  playedAfterLastChange,
                  simulationResult: playRuns[playRuns.length - 1] ?? {},
                  goalMatched,
                  unknown: false,
                  errorCategories: [],
                  firstRunBeforeEdit: playRuns.length > 0 && replacementActions.length === 0,
                  runBeforeEditCount: replacementActions.length === 0 ? playRuns.length : 0,
                  runAfterEditCount: replacementActions.length > 0 ? playRuns.length : 0,
                  lastChangedAt,
                  lastPlayedAt,
                  testCaseResults: playRuns[playRuns.length - 1]?.testCaseResults ?? [],
                  misconceptionFlags: [],
                  playRuns,
                }
              : { program, executed, aPresses, temperature, windowOpen, runEffects },
            shownOptionOrder: paletteBlocks.map((block) => block.label),
          })
        }
        onSkip={onSkip}
        onExit={onExit}
      />
    </section>
  );
};

