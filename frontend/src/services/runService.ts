import type { ResearchInput } from "../types";

type StartRunResponse = {
  runId: string;
};

type RunStatusResponse = {
  status: "running" | "done";
  summary?: string;
};

const attemptsByRunId = new Map<string, number>();

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function buildRunId(): string {
  return `run-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function startRun(_input: ResearchInput): Promise<StartRunResponse> {
  await wait(350);
  return { runId: buildRunId() };
}

export async function getRunStatus(runId: string): Promise<RunStatusResponse> {
  await wait(500);

  const attempt = (attemptsByRunId.get(runId) ?? 0) + 1;
  attemptsByRunId.set(runId, attempt);

  if (attempt < 3) {
    return { status: "running" };
  }

  return {
    status: "done",
    summary:
      "Initial findings complete: two strong themes identified, one high-risk assumption flagged for follow-up interviews."
  };
}