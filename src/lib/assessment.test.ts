import { describe, expect, it } from "vitest";
import { assessmentMap } from "../data/assessments.server";
import {
  calculateResult,
  createSession,
  getSectionById,
  getStepDescriptors,
  submitItemAnswer,
} from "./assessment";
import type { AssessmentItem, AssessmentSession, AssessmentVersion } from "../types";

const versions = Object.values(assessmentMap) as AssessmentVersion[];

const allItems = (assessment: AssessmentVersion) =>
  assessment.sections.flatMap((section) =>
    section.items.map((item) => ({ section, item })),
  );

const newSession = (assessment: AssessmentVersion): AssessmentSession =>
  createSession(assessment, { studentName: "test" } as never);

describe("assessment structure", () => {
  it("has four versions", () => {
    expect(versions.map((v) => v.id).sort()).toEqual([
      "lj1-hv",
      "lj1-vmbo",
      "lj3-hv",
      "lj3-vmbo",
    ]);
  });

  it.each(versions.map((v) => [v.id, v] as const))(
    "%s: steps, sections and items consistent",
    (_id, assessment) => {
      const steps = getStepDescriptors(assessment);
      expect(steps.length).toBeGreaterThan(0);
      for (const step of steps) {
        expect(getSectionById(assessment, step.sectionId)).toBeTruthy();
      }
    },
  );

  it.each(versions.map((v) => [v.id, v] as const))(
    "%s: every scored item is automatically scoreable (no open answers)",
    (_id, assessment) => {
      for (const { item } of allItems(assessment)) {
        if (item.points > 0) {
          expect(item.type).not.toBe("open");
        }
      }
    },
  );
});

describe("session randomization", () => {
  it.each(versions.map((v) => [v.id, v] as const))(
    "%s: presented option order is logged per multiple-choice item",
    (_id, assessment) => {
      const session = newSession(assessment);
      for (const { item } of allItems(assessment)) {
        if (item.type !== "multiple_choice" || !item.options?.length) continue;
        const key = Object.keys(session.presentedOrders).find((k) => k.endsWith(`:${item.id}`));
        const order = key ? session.presentedOrders[key] : undefined;
        expect(order, `order for ${item.id}`).toBeTruthy();
        expect([...(order ?? [])].sort()).toEqual(item.options.map((o) => o.id).sort());
      }
    },
  );

  it.each(versions.map((v) => [v.id, v] as const))(
    "%s: unknown option is pinned last",
    (_id, assessment) => {
      const session = newSession(assessment);
      for (const { item } of allItems(assessment)) {
        if (item.type !== "multiple_choice" || !item.unknownOptionId) continue;
        const key = Object.keys(session.presentedOrders).find((k) => k.endsWith(`:${item.id}`));
        const order = key ? session.presentedOrders[key] : undefined;
        if (!order?.length) continue;
        expect(order[order.length - 1]).toBe(item.unknownOptionId);
      }
    },
  );
});

describe("multiple-choice scoring", () => {
  const submit = (
    assessment: AssessmentVersion,
    item: AssessmentItem,
    answer: unknown,
  ) => {
    const found = allItems(assessment).find((x) => x.item.id === item.id)!;
    const session = newSession(assessment);
    return submitItemAnswer({
      session,
      section: found.section,
      item,
      selectedAnswer: answer as never,
      shownOptionOrder: item.options?.map((o) => o.id) ?? [],
    });
  };

  for (const assessment of versions) {
    for (const { item } of allItems(assessment)) {
      if (item.type !== "multiple_choice" || item.points <= 0) continue;

      it(`${assessment.id}/${item.id}: correct answer yields full score`, () => {
        const answer = Array.isArray(item.correctAnswer)
          ? item.correctAnswer
          : item.correctAnswer;
        const session = submit(assessment, item, answer);
        const result = Object.values(session.results).find((r) => r.itemId === item.id);
        expect(result?.score).toBe(item.points);
      });

      it(`${assessment.id}/${item.id}: unknown option yields zero`, () => {
        if (!item.unknownOptionId) return;
        const answer =
          item.scoreMode === "partial_select"
            ? [item.unknownOptionId]
            : item.unknownOptionId;
        const session = submit(assessment, item, answer);
        const result = Object.values(session.results).find((r) => r.itemId === item.id);
        expect(result?.score).toBe(0);
      });
    }
  }
});

describe("result aggregation", () => {
  it.each(versions.map((v) => [v.id, v] as const))(
    "%s: empty session scores zero, maxScore positive",
    (_id, assessment) => {
      const session = newSession(assessment);
      const result = calculateResult(session, assessment);
      expect(result.maxScore).toBeGreaterThan(0);
      expect(result.totalScore).toBe(0);
    },
  );
});

describe("server-side rescoring (sanitized client flow)", () => {
  it("client without secrets scores MC as 0; rescore restores full score", async () => {
    const { assessmentMap: clientMap } = await import("../data/assessments");
    const serverAssessment = versions.find((v) => v.id === "lj1-vmbo")!;
    const clientAssessment = clientMap["lj1-vmbo"];

    let session = newSession(clientAssessment);
    for (const { section, item } of allItems(serverAssessment)) {
      if (item.type !== "multiple_choice" || item.points <= 0) continue;
      const clientItem = allItems(clientAssessment).find((x) => x.item.id === item.id)!.item;
      expect(clientItem.correctAnswer, `geen geheim in client: ${item.id}`).toBeUndefined();
      const clientSection = clientAssessment.sections.find((s) => s.id === section.id)!;
      session = submitItemAnswer({
        session,
        section: clientSection,
        item: clientItem,
        selectedAnswer: item.correctAnswer as never,
        shownOptionOrder: clientItem.options?.map((o) => o.id) ?? [],
      });
    }

    const mcResults = session.results.filter((r) => r.itemType === "multiple_choice");
    expect(mcResults.length).toBeGreaterThan(0);
    expect(mcResults.every((r) => r.score === 0)).toBe(true);

    const { rescoreSessionResults } = await import("./assessment");
    const rescored = rescoreSessionResults(session, serverAssessment);
    for (const r of rescored.results.filter((x) => x.itemType === "multiple_choice")) {
      expect(r.score, r.itemId).toBe(r.maxScore);
      expect(r.responseType).toBe("correct");
    }
  });
});
