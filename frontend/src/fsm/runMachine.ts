import type { WorkflowState } from "../types";

type EventType = "SUBMIT" | "RUN_FINISHED" | "RESET";

const transitions: Record<WorkflowState, Partial<Record<EventType, WorkflowState>>> = {
  idle: {
    SUBMIT: "running"
  },
  running: {
    RUN_FINISHED: "done"
  },
  done: {
    RESET: "idle"
  }
};

export function transitionWorkflow(
  current: WorkflowState,
  event: EventType
): WorkflowState {
  return transitions[current][event] ?? current;
}