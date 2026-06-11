import { describe, expect, it } from "vitest";
import { assessmentMap } from "../data/assessments.server";
import {
  calculateResult,
  createSession,
  scoreItem,
  submitItemAnswer,
} from "./assessment";
import type {
  AssessmentItem,
  AssessmentSection,
  AssessmentSession,
  AssessmentVersion,
} from "../types";

const versions = Object.values(assessmentMap) as AssessmentVersion[];

const allItems = (assessment: AssessmentVersion) =>
  assessment.sections.flatMap((section) =>
    section.items.map((item) => ({ section, item })),
  );

const newSession = (assessment: AssessmentVersion): AssessmentSession =>
  createSession(assessment, "TEST-CODE");

const submit = (
  assessment: AssessmentVersion,
  session: AssessmentSession,
  section: AssessmentSection,
  item: AssessmentItem,
  answer: unknown,
) =>
  submitItemAnswer({
    session,
    section,
    item,
    selectedAnswer: answer as never,
    shownOptionOrder: item.options?.map((o) => o.id) ?? [],
  });

const resultFor = (session: AssessmentSession, itemId: string) =>
  session.results.find((r) => r.itemId === itemId);

describe("wrong answers and response types", () => {
  for (const assessment of versions) {
    it(`${assessment.id}: a wrong single-choice answer scores 0 and is 'incorrect'`, () => {
      let tested = 0;
      for (const { section, item } of allItems(assessment)) {
        if (
          item.type !== "multiple_choice" ||
          item.points <= 0 ||
          item.scoreMode === "partial_select" ||
          typeof item.correctAnswer !== "string" ||
          !item.options?.length
        ) {
          continue;
        }
        const wrong = item.options.find(
          (o) => o.id !== item.correctAnswer && o.id !== item.unknownOptionId,
        );
        if (!wrong) continue;
        const session = submit(assessment, newSession(assessment), section, item, wrong.id);
        const result = resultFor(session, item.id);
        expect(result?.score, item.id).toBe(0);
        expect(result?.responseType, item.id).toBe("incorrect");
        tested += 1;
      }
      expect(tested).toBeGreaterThan(0);
    });
  }
});

describe("skipped answers", () => {
  it("a skipped performance task scores 0 with responseType 'skipped'", () => {
    const assessment = versions[0];
    const found = allItems(assessment).find(
      ({ item }) => item.points > 0 && item.type !== "multiple_choice",
    )!;
    const session = submit(
      assessment,
      newSession(assessment),
      found.section,
      found.item,
      { skipped: true },
    );
    const result = resultFor(session, found.item.id);
    expect(result?.score).toBe(0);
    expect(result?.responseType).toBe("skipped");
    expect(result?.skipped).toBe(true);
  });
});

describe("partial_select scoring (synthetic item; no instrument uses it yet)", () => {
  const item = {
    id: "syn-ps",
    type: "multiple_choice",
    title: "synthetisch",
    instruction: "",
    points: 2,
    scoreMode: "partial_select",
    correctAnswer: ["a", "b"],
    unknownOptionId: "u",
    harmfulOptionIds: ["x"],
    harmfulSelectionMaxScore: 1,
    options: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
      { id: "x", label: "X" },
      { id: "u", label: "Ik weet het niet." },
    ],
    kerndoel: "21",
  } as never as AssessmentItem;

  it("full selection yields full score", () => {
    const scored = scoreItem(item, ["a", "b"]);
    expect(scored.score).toBe(2);
    expect(scored.isCorrect).toBe(true);
  });

  it("half selection yields proportional score", () => {
    const scored = scoreItem(item, ["a"]);
    expect(scored.score).toBe(1);
    expect(scored.isCorrect).toBe(false);
  });

  it("harmful selection is capped", () => {
    const scored = scoreItem(item, ["a", "b", "x"]);
    expect(scored.score).toBeLessThanOrEqual(1);
  });

  it("unknown option yields zero", () => {
    const scored = scoreItem(item, ["u"]);
    expect(scored.score).toBe(0);
    expect(scored.isCorrect).toBe(false);
  });
});

describe("self assessment", () => {
  for (const assessment of versions) {
    const found = allItems(assessment).find(({ item }) => item.type === "self_assessment");
    if (!found) continue;

    it(`${assessment.id}: slider value is clamped to 0..100 in metadata`, () => {
      const low = submit(assessment, newSession(assessment), found.section, found.item, -20);
      expect(low.metadata.selfAssessmentScore).toBe(0);
      const high = submit(assessment, newSession(assessment), found.section, found.item, 250);
      expect(high.metadata.selfAssessmentScore).toBe(100);
      const result = resultFor(low, found.item.id);
      expect(result?.score).toBe(0);
      expect(result?.isCorrect).toBeNull();
    });
  }
});

describe("resubmission", () => {
  it("replaces the earlier result instead of duplicating it", () => {
    const assessment = versions[0];
    const found = allItems(assessment).find(
      ({ item }) =>
        item.type === "multiple_choice" &&
        item.points > 0 &&
        typeof item.correctAnswer === "string",
    )!;
    let session = newSession(assessment);
    session = submit(assessment, session, found.section, found.item, found.item.unknownOptionId);
    session = submit(assessment, session, found.section, found.item, found.item.correctAnswer);
    const matches = session.results.filter((r) => r.itemId === found.item.id);
    expect(matches).toHaveLength(1);
    expect(matches[0].score).toBe(found.item.points);
    // beide handelingen blijven in de eventlog staan
    expect(
      session.eventLogs.filter((log) => log.itemId === found.item.id).length,
    ).toBe(2);
  });
});

describe("full-score session per version", () => {
  it.each(versions.map((v) => [v.id, v] as const))(
    "%s: all MC correct yields the full MC score and consistent goal scores",
    (_id, assessment) => {
      let session = newSession(assessment);
      let expectedMcScore = 0;
      for (const { section, item } of allItems(assessment)) {
        if (item.type !== "multiple_choice" || item.points <= 0) continue;
        expectedMcScore += item.points;
        session = submit(assessment, session, section, item, item.correctAnswer);
      }

      const result = calculateResult(session, assessment);
      expect(result.totalScore).toBe(expectedMcScore);
      expect(result.maxScore).toBeGreaterThanOrEqual(expectedMcScore);

      for (const goal of result.goalScores) {
        expect(goal.maxScore, goal.goalId).toBeGreaterThan(0);
        expect(goal.score).toBeGreaterThanOrEqual(0);
        expect(goal.score).toBeLessThanOrEqual(goal.maxScore);
        expect(goal.percentage).toBeGreaterThanOrEqual(0);
        expect(goal.percentage).toBeLessThanOrEqual(100);
      }

      const kerndoelen = result.goalScores
        .filter((goal) => goal.level === "kerndoel")
        .map((goal) => goal.goalId);
      expect(kerndoelen).toEqual(["21", "22", "23"]);
    },
  );
});
