import { describe, expect, it } from "vitest";
import handler from "./finalize";
import { assessmentMap } from "../src/data/assessments.server";
import { createSession, submitItemAnswer } from "../src/lib/assessment";
import type { AssessmentVersion } from "../src/types";

type JsonValue = Record<string, unknown>;

const mockResponse = () => {
  const captured: { statusCode?: number; body?: JsonValue } = {};
  const response = {
    status(code: number) {
      captured.statusCode = code;
      return response;
    },
    json(payload: JsonValue) {
      captured.body = payload;
      return response;
    },
  };
  return { response, captured };
};

const request = (method: string, body?: unknown) => ({ method, body });

describe("/api/finalize", () => {
  it("rejects non-POST requests with 405", async () => {
    const { response, captured } = mockResponse();
    await handler(request("GET"), response);
    expect(captured.statusCode).toBe(405);
    expect(captured.body).toMatchObject({ ok: false, error: "method_not_allowed" });
  });

  it("rejects a missing session with 400", async () => {
    const { response, captured } = mockResponse();
    await handler(request("POST", {}), response);
    expect(captured.statusCode).toBe(400);
    expect(captured.body).toMatchObject({ ok: false, error: "invalid_session" });
  });

  it("rejects an unknown versionId with 400", async () => {
    const { response, captured } = mockResponse();
    await handler(
      request("POST", { session: { versionId: "lj9-xyz", results: [] } }),
      response,
    );
    expect(captured.statusCode).toBe(400);
    expect(captured.body).toMatchObject({ ok: false, error: "invalid_session" });
  });

  it("rescores a valid session server-side and returns the result", async () => {
    const assessment = assessmentMap["lj1-vmbo"] as AssessmentVersion;
    let session = createSession(assessment, "TEST-CODE");
    for (const section of assessment.sections) {
      for (const item of section.items) {
        if (item.type !== "multiple_choice" || item.points <= 0) continue;
        session = submitItemAnswer({
          session,
          section,
          item,
          selectedAnswer: item.correctAnswer as never,
          shownOptionOrder: item.options?.map((o) => o.id) ?? [],
        });
      }
    }

    const { response, captured } = mockResponse();
    await handler(request("POST", { session }), response);

    expect(captured.statusCode).toBe(200);
    const body = captured.body as {
      ok: boolean;
      results: Array<{ itemType: string; score: number; maxScore: number }>;
      result: { totalScore: number; maxScore: number };
    };
    expect(body.ok).toBe(true);
    const mc = body.results.filter((r) => r.itemType === "multiple_choice");
    expect(mc.length).toBeGreaterThan(0);
    for (const r of mc) {
      expect(r.score).toBe(r.maxScore);
    }
    expect(body.result.totalScore).toBeGreaterThan(0);
  });
});
