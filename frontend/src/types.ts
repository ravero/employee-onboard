export type WorkflowState = "idle" | "running" | "done";

export interface ResearchInput {
  question: string;
  context: string;
}

export interface RunRecord {
  runId: string;
  question: string;
  summary: string;
  completedAt: string;
}