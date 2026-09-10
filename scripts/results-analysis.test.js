import test from "node:test";
import assert from "node:assert/strict";
import { attachCurrentContentKey, buildGroups, buildItemAnalysis, scoreStatistics } from "../api/results.js";

const metadata = {
  assessmentId: "lj1-vmbo",
  classCode: "1a1",
  classId: "1a1",
  gradeLevel: "lj1",
  track: "vmbo",
  cohort: "COHORT-2026",
  assessmentWindow: "najaar-2026",
  versionId: "lj1-vmbo",
};

test("groepssignalen vormen geldige key-valueparen", () => {
  const students = Array.from({ length: 5 }, () => ({ ...metadata, status: "completed" }));
  const results = Array.from({ length: 5 }, () => ({
    ...metadata,
    class_code: metadata.classCode,
    class_id: metadata.classId,
    assessment_id: metadata.assessmentId,
    grade_level: metadata.gradeLevel,
    track: metadata.track,
    cohort: metadata.cohort,
    assessment_window: metadata.assessmentWindow,
    version_id: metadata.versionId,
    percentage: 60,
    result_json: { result: { goalScores: [] } },
  }));
  const [group] = buildGroups(students, results, ["classCode"]);
  assert.equal(group.completedCount, 5);
  assert.deepEqual(group.goalSignals, { "21D": null, "22A": null, "22B": null, "23C": null });
});

test("mediaan en spreiding worden berekend", () => {
  assert.deepEqual(scoreStatistics([10, 20, 30, 40].map((total) => ({ total }))), {
    medianTotalScore: 25,
    q1TotalScore: 17.5,
    q3TotalScore: 32.5,
    standardDeviation: 11.2,
  });
});

test("opslagcontrole toont afgeronde afnames zonder resultaat per klas", () => {
  const students = [
    ...Array.from({ length: 5 }, () => ({ ...metadata, status: "completed" })),
    { ...metadata, status: "completed" },
  ];
  const results = Array.from({ length: 5 }, () => ({
    ...metadata,
    class_code: metadata.classCode,
    class_id: metadata.classId,
    assessment_id: metadata.assessmentId,
    grade_level: metadata.gradeLevel,
    track: metadata.track,
    cohort: metadata.cohort,
    assessment_window: metadata.assessmentWindow,
    version_id: metadata.versionId,
    percentage: 60,
    result_json: { result: { goalScores: [] } },
  }));
  const [group] = buildGroups(students, results, ["classCode"]);
  assert.equal(group.registeredCompletedCount, 6);
  assert.equal(group.completedCount, 5);
  assert.equal(group.missingResultCount, 1);
});

test("itemanalyse mengt verschillende toetsbuilds niet", () => {
  const row = (hash) => ({
    version_id: "lj1-vmbo",
    assessment_build_version: hash,
    assessment_content_hash: hash,
    result_json: { session: { results: [{ itemId: "vraag-1", maxScore: 1, score: 1, isCorrect: true }] } },
  });
  const items = buildItemAnalysis([row("a".repeat(64)), row("b".repeat(64))]);
  assert.equal(items.length, 2);
  assert.deepEqual(items.map((item) => item.answerCount), [1, 1]);
  assert.deepEqual(items.map((item) => item.reportable), [false, false]);
  assert.deepEqual(items.map((item) => item.distribution), [{}, {}]);
});

test("itemdetails worden pas vanaf vijf antwoorden getoond", () => {
  const rows = Array.from({ length: 5 }, () => ({
    version_id: "lj1-vmbo",
    assessment_build_version: "build-1",
    assessment_content_hash: "a".repeat(64),
    result_json: { session: { results: [{ itemId: "vraag-1", maxScore: 1, score: 1, isCorrect: true, selectedAnswer: "goed" }] } },
  }));
  const [item] = buildItemAnalysis(rows);
  assert.equal(item.reportable, true);
  assert.equal(item.correctRate, 1);
  assert.deepEqual(item.distribution, { goed: 5 });
});

test("codeaantallen worden aan de nieuwste toetsbuild gekoppeld", () => {
  const students = [{ ...metadata, status: "completed" }];
  const row = (hash, completedAt) => ({
    class_code: metadata.classCode,
    class_id: metadata.classId,
    assessment_id: metadata.assessmentId,
    grade_level: metadata.gradeLevel,
    track: metadata.track,
    cohort: metadata.cohort,
    assessment_window: metadata.assessmentWindow,
    version_id: metadata.versionId,
    assessment_build_version: hash,
    assessment_content_hash: hash,
    completed_at: completedAt,
  });
  const [student] = attachCurrentContentKey(students, [row("a".repeat(64), "2026-01-01"), row("b".repeat(64), "2026-02-01")]);
  assert.equal(student.contentKey, "b".repeat(64));
});
