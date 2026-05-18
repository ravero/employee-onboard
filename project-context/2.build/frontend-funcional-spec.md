# Frontend Functional Spec: Critical Research Workflow

## Document Control
- Version: 0.1
- Date: 2026-05-16
- Owner Persona: Frontend Developer
- Scope: MVP frontend-only behavior for a single-route research workflow UI

## Purpose
Define a minimal frontend flow called Critical Research Workflow with four user-facing sections:
- Inputs
- Run
- Results
- History

This spec intentionally excludes backend integration and uses stubbed services.

## Workflow Overview
- Route model: single route (`/`)
- View model:
  - Inputs: user enters query and optional context.
  - Run: user starts a run and sees running progress.
  - Results: user sees result summary when run completes.
  - History: user sees prior local runs in the current browser session.

## Functional Sections

### Inputs
- Provide required field: Research question.
- Provide optional field: Extra context.
- Validate required field before starting run.
- On submit, move state from `idle` to `running`.

### Run
- Trigger `startRun` service with input payload.
- Poll `getRunStatus` while run is active.
- Render explicit running status and disable re-submit until completion.
- Transition to `done` when service reports completion.

### Results
- Show run id, summary text, and completion timestamp.
- Show a Restart action that resets to `idle` while preserving history.

### History
- Store completed runs in in-memory state (frontend local only).
- Display reverse-chronological run list with run id, query, and timestamp.

## State Machine
- States: `idle -> running -> done`
- Events:
  - `SUBMIT`: idle -> running
  - `RUN_FINISHED`: running -> done
  - `RESET`: done -> idle
- Invalid transitions are ignored.

## Service Contracts (Stub)
- `startRun(input) -> Promise<{ runId }>`
- `getRunStatus(runId) -> Promise<{ status: "running" | "done", summary? }>`

Behavior:
- `startRun` returns a generated run id.
- `getRunStatus` returns `running` for initial checks and then `done` with a mock summary.

## Non-Goals
- No backend calls.
- No authentication.
- No multi-route navigation.
- No persistence beyond runtime state.

## Acceptance Criteria
- App has one route and renders all four sections.
- Form submit runs stub workflow and reaches done state.
- FSM is implemented in a dedicated module and enforces `idle -> running -> done`.
- Services are isolated in a dedicated stub service module.
- Completed runs appear in History.

## Spec Sync Checklist (Update After Every Commit)
- [X] Confirm the implemented states still match `idle -> running -> done`.
- [X] Confirm Inputs, Run, Results, and History sections are present and visible.
- [X] Confirm `startRun` and `getRunStatus` signatures still match this spec.
- [X] Confirm no backend integration was introduced.
- [X] Update this document version/date and append a short change note.

## Change Notes
- 2026-05-16 v0.1: Initial functional spec for frontend MVP flow.
- 2026-05-17 v0.2: Spec Sync Checklist Done.
