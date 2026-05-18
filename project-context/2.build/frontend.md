# Frontend Build Log

## Document Control
- Owner Persona: Frontend Developer (@frontend-eng)
- Spec: `project-context/2.build/frontend-funcional-spec.md`
- Last Updated: 2026-05-17

---

## Revision History

| Date | Event | Summary |
|------|-------|---------|
| 2026-05-16 | Initial build | Scaffolded app, FSM, services, all four sections |
| 2026-05-17 | Spec-to-impl pass | Closed completion-timestamp gap in Results panel |

---

## Project Overview

Single-route React + TypeScript frontend implementing the **Critical Research Workflow**. No backend integration. All services are stubs. State is fully in-memory (session only).

- **Framework:** React 18 + TypeScript via Vite
- **Styling:** Custom CSS (Space Grotesk + IBM Plex Mono fonts, CSS custom properties)
- **Routing:** None — single route (`/`)
- **State management:** `useState` hooks + dedicated FSM module

---

## Architecture

### State Machine (`src/fsm/runMachine.ts`)

Enforces the three-state workflow. Invalid transitions are silently ignored (return current state).

```
idle ──SUBMIT──▶ running ──RUN_FINISHED──▶ done
 ▲                                           │
 └──────────────────RESET────────────────────┘
```

| Current | Event | Next |
|---------|-------|------|
| `idle` | `SUBMIT` | `running` |
| `running` | `RUN_FINISHED` | `done` |
| `done` | `RESET` | `idle` |

Exported function: `transitionWorkflow(current: WorkflowState, event: EventType): WorkflowState`

### Service Layer (`src/services/runService.ts`)

Stub-only. No HTTP calls.

| Function | Signature | Behaviour |
|----------|-----------|-----------|
| `startRun` | `(input: ResearchInput) => Promise<{ runId: string }>` | Waits 350 ms, returns a generated `run-<timestamp>-<random>` id |
| `getRunStatus` | `(runId: string) => Promise<{ status, summary? }>` | Waits 500 ms per call; returns `running` for the first two attempts then `done` with a mock summary |

### Shared Types (`src/types.ts`)

```ts
type WorkflowState = "idle" | "running" | "done";

interface ResearchInput { question: string; context: string; }

interface RunRecord {
  runId: string;
  question: string;
  summary: string;
  completedAt: string; // ISO 8601
}
```

### Application Component (`src/App.tsx`)

Single component. Key state variables:

| Variable | Type | Purpose |
|----------|------|---------|
| `workflowState` | `WorkflowState` | Drives section visibility and form disable |
| `question` | `string` | Required research question input |
| `context` | `string` | Optional extra context input |
| `activeRunId` | `string \| null` | Run id of the in-flight or completed run |
| `activeSummary` | `string` | Summary text from completed run |
| `activeCompletedAt` | `string` | ISO timestamp of completion (shown in Results) |
| `history` | `RunRecord[]` | Reverse-chronological list of completed runs |
| `errorMessage` | `string` | Non-empty string triggers error UI in Run panel |
| `lastUpdatedAt` | `string` | ISO timestamp updated on every state change |

Key handlers:

- `handleSubmit` — validates required field, transitions FSM to `running`, calls `startRun`, polls `getRunStatus` in a loop, transitions to `done` on completion, appends to `history`, sets error + resets to `idle` on exception.
- `handleReset` — transitions FSM to `idle`, clears active run state, preserves `history`.

---

## UI Sections

All four spec-required sections are rendered unconditionally on the single route:

### Inputs
- `<input id="question">` — required; triggers validation in `canSubmit` (must be non-empty and state must be `idle`).
- `<textarea id="context">` — optional.
- Submit button disabled when `canSubmit` is `false`.
- Both fields disabled while `workflowState !== "idle"`.

### Run
- Status pill (colored dot) + label reflect current `workflowState`; switches to `error` tone when `errorMessage` is set.
- "Last updated" timestamp refreshes on every state mutation via `markUpdated()`.
- Inline hint message shown only while `running`.
- Error message rendered below hint when present.

### Results
- Visible only when `workflowState === "done"`.
- Displays: Run ID, summary text, completion timestamp (formatted via `toLocaleString()`).
- **Restart** button calls `handleReset()`, returns to `idle`, history is preserved.
- While not `done`: placeholder hint rendered.

### History
- Reverse-chronological `RunRecord[]` list.
- Each entry shows: run id, completion datetime, research question, summary.
- Empty state hint shown when `history.length === 0`.

---

## Styling (`src/styles.css`)

Plain CSS with custom properties. No utility framework.

| Token | Value | Used for |
|-------|-------|---------|
| `--bg` | `#f8f5ef` | Page background |
| `--ink` | `#1f2430` | Body text |
| `--accent` | `#0f766e` | Buttons, eyebrow label |
| `--accent-strong` | `#115e59` | Button gradient end |
| `--sun` | `#f59e0b` | Background radial gradient |
| `--paper` | `rgba(255,255,255,0.75)` | Panel backgrounds |

Layout: CSS Grid — `panel-grid` is `repeat(2, 1fr)` collapsing to `1fr` below 860 px.

Status pill colours: idle=`#6b7280`, running=`#2563eb`, done=`#16a34a`, error=`#dc2626`.

---

## Files

| File | Role |
|------|------|
| `frontend/package.json` | Vite + React + TypeScript dependencies |
| `frontend/tsconfig.json` | TypeScript config (strict mode) |
| `frontend/tsconfig.node.json` | Vite node environment config |
| `frontend/vite.config.ts` | Vite build config |
| `frontend/index.html` | HTML entry point |
| `frontend/src/main.tsx` | React root mount |
| `frontend/src/App.tsx` | Main application component |
| `frontend/src/styles.css` | Global styles |
| `frontend/src/types.ts` | Shared TypeScript types |
| `frontend/src/fsm/runMachine.ts` | Finite state machine |
| `frontend/src/services/runService.ts` | Stub service layer |
| `project-context/2.build/frontend-funcional-spec.md` | Functional specification |

---

## Clarifications and Deviations

- `project-context/2.build/setup.md` is referenced in agent instructions but does not exist in the repository; implementation proceeded without it.
- Tailwind was specified in agent instructions but not installed; custom CSS was used instead to keep the scaffold minimal and dependency-free. This is a known deviation — swap to Tailwind if team standardises on it.
- No multi-route navigation; single `<main>` renders all four sections always.

---

## Spec Sync Reminder

After each commit touching frontend workflow logic:
1. Update `project-context/2.build/frontend-funcional-spec.md` checklist.
2. Append a dated entry to the Change Notes section in that spec.
3. Add a row to the Revision History table above.