# Project Instructions for Codex

## Project Context

This repository contains a webapp for administering nulmetingen Digitale Geletterdheid to students.

The authoritative content source for assessment content is:

`docs/nulmetingen_dg_v4_herschreven.md`

Only change assessment content when the change is based on that source document or on explicit user instructions.

## Assessment Content Rules

- Scored answers must not be open or rubric-based.
- Every scored item must be automatically scoreable by the app.
- Answer options must be randomized per session.
- The order shown to the student must be logged for each randomized answer set.
- Correct answers must never be visible in the UI.
- Preserve the intended distinction between student-facing content and internal scoring data.

## Implementation Guidance

- Use the existing project structure as much as possible.
- Keep changes scoped to the requested behavior.
- Document the files changed in the final response for each task.
- Do not introduce a new framework, data layer, or routing approach unless explicitly requested or clearly necessary.
- If updating assessment content, verify that all four versions can still be selected and completed:
  - `lj1-vmbo`
  - `lj1-hv`
  - `lj3-vmbo`
  - `lj3-hv`

## Commands

Inspect `package.json` before running commands. At the time of writing, the root package defines:

- Install dependencies: `npm install`
- Start development server: `npm run dev`
- Build/typecheck: `npm run build`
- Preview production build: `npm run preview`

There is currently no test script in `package.json`.

After changes, run the relevant install/start/test/build commands for the task. For normal code changes, run at least:

`npm run build`

If tests are absent, minimally verify that the app starts and that all four assessment versions can be traversed end to end.
