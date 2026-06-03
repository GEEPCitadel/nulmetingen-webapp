import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const flowPath = path.join(root, "src", "data", "whutsupp_pt8_flow.json");
const flow = JSON.parse(fs.readFileSync(flowPath, "utf8"));
const expectedVariants = ["lj1-vmbo", "lj1-hv", "lj3-vmbo", "lj3-hv"];
const capByFlag = new Map((flow.scoring?.caps ?? []).map((cap) => [cap.flag, cap.maxScore]));

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const scorePath = (variant, choiceIdForNode) => {
  let raw = 0;
  const flags = [];
  const categories = {};
  for (const node of variant.nodes) {
    const choiceId = choiceIdForNode(node);
    const choice = node.choices.find((candidate) => candidate.choiceId === choiceId);
    assert(choice, `${variant.assessmentId}/${node.nodeId}: choice ${choiceId} ontbreekt.`);
    const points = choice.isCorrect === true ? 1 : 0;
    raw += points;
    categories[node.category] = points;
    flags.push(...(choice.flags ?? []));
  }
  const cap = flags.reduce(
    (current, flag) => Math.min(current, capByFlag.get(flag) ?? current),
    Number.POSITIVE_INFINITY,
  );
  return {
    raw,
    capped: Number.isFinite(cap) ? Math.min(raw, cap) : raw,
    categories,
    flags,
  };
};

assert(flow.taskId === "pt8-whutsupp-sam-video", "Onverwachte taskId.");
assert(flow.maxPoints === 4, "PT8 moet maximaal 4 punten blijven.");
assert(flow.engine === "WhutsuppScenarioTask", "Onverwachte engine.");
assert(fs.existsSync(path.join(root, "public", "assets", "pt8", "whutsupp_sam_video_card.svg")), "SVG-asset ontbreekt.");
assert(fs.existsSync(path.join(root, "public", "assets", "pt8", "whutsupp_sam_video_card.gif")), "GIF-asset ontbreekt.");

for (const variantId of expectedVariants) {
  const variant = flow.variants.find((candidate) => candidate.assessmentId === variantId);
  assert(variant, `${variantId}: variant ontbreekt.`);
  assert(variant.nodes.length === 4, `${variantId}: verwacht 4 beslismomenten.`);
  assert(variant.nodes.some((node) => node.recovery?.choices?.length > 0), `${variantId}: herstelkeuze ontbreekt.`);

  for (const node of variant.nodes) {
    assert(node.messages.length > 0, `${variantId}/${node.nodeId}: chatberichten ontbreken.`);
    assert(node.choices.length >= 4, `${variantId}/${node.nodeId}: te weinig keuzes.`);
    const unknown = node.choices.at(-1);
    assert(unknown?.choiceId === "unknown", `${variantId}/${node.nodeId}: 'Ik weet het niet' staat niet onderaan in brondata.`);
    assert(
      node.choices.every((choice) => !String(choice.label).includes("isCorrect") && !String(choice.label).includes("score")),
      `${variantId}/${node.nodeId}: interne metadata lekt in label.`,
    );
  }

  const safeScore = scorePath(variant, (node) => {
    const safeChoice = node.choices.find((choice) => choice.isCorrect === true);
    return safeChoice?.choiceId;
  });
  assert(safeScore.raw === 4 && safeScore.capped === 4, `${variantId}: veilig pad scoort niet 4/4.`);

  const harmfulScore = scorePath(variant, (node) => {
    const harmful = node.choices.find((choice) => choice.flags?.includes("harmful_share"));
    return harmful?.choiceId ?? node.choices.find((choice) => choice.isCorrect === true)?.choiceId;
  });
  assert(harmfulScore.capped <= 2, `${variantId}: harmful_share cap werkt niet.`);

  const unknownScore = scorePath(variant, () => "unknown");
  assert(unknownScore.raw === 0 && unknownScore.capped === 0, `${variantId}: unknown pad moet 0 punten zijn.`);
}

console.log("Whutsupp PT8 verificatie geslaagd.");
