import { FormEvent, useMemo, useState } from "react";
import { transitionWorkflow } from "./fsm/runMachine";
import { getRunStatus, startRun } from "./services/runService";
import type { ResearchInput, RunRecord, WorkflowState } from "./types";

function App(): JSX.Element {
  const [workflowState, setWorkflowState] = useState<WorkflowState>("idle");
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<string>("");
  const [activeCompletedAt, setActiveCompletedAt] = useState<string>("");
  const [history, setHistory] = useState<RunRecord[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>(() => new Date().toISOString());
  const statusTone = errorMessage ? "error" : workflowState;
  const statusLabel = errorMessage ? "error" : workflowState;
  const lastUpdatedLabel = useMemo(() => {
    return new Date(lastUpdatedAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }, [lastUpdatedAt]);

  function markUpdated(): void {
    setLastUpdatedAt(new Date().toISOString());
  }

  const canSubmit = useMemo(() => {
    return workflowState === "idle" && question.trim().length > 0;
  }, [workflowState, question]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (question.trim().length === 0 || workflowState !== "idle") {
      return;
    }

    setErrorMessage("");
    setWorkflowState((current) => transitionWorkflow(current, "SUBMIT"));
    markUpdated();

    try {
      const input: ResearchInput = {
        question: question.trim(),
        context: context.trim()
      };

      const { runId } = await startRun(input);
      setActiveRunId(runId);
      markUpdated();

      let done = false;
      while (!done) {
        const status = await getRunStatus(runId);
        markUpdated();
        if (status.status === "done") {
          const summary = status.summary ?? "Run completed with no summary.";
          const completedAt = new Date().toISOString();

          setActiveSummary(summary);
          setActiveCompletedAt(completedAt);
          setHistory((current) => [
            {
              runId,
              question: input.question,
              summary,
              completedAt
            },
            ...current
          ]);
          setWorkflowState((current) => transitionWorkflow(current, "RUN_FINISHED"));
          markUpdated();
          done = true;
        }
      }
    } catch {
      setErrorMessage("Unable to complete run. Please retry.");
      setWorkflowState("idle");
      markUpdated();
    }
  }

  function handleReset(): void {
    setWorkflowState((current) => transitionWorkflow(current, "RESET"));
    setActiveRunId(null);
    setActiveSummary("");
    setActiveCompletedAt("");
    setErrorMessage("");
    markUpdated();
  }

  return (
    <main className="page-shell">
      <section className="hero-card">
        <p className="eyebrow">Critical Research Workflow</p>
        <h1>Single-Route Research Runner</h1>
        <p className="subtitle">
          Capture inputs, run a lightweight workflow, review results, and keep local history.
        </p>
      </section>

      <section className="panel-grid">
        <article className="panel">
          <h2>Inputs</h2>
          <form onSubmit={handleSubmit} className="form-stack">
            <label htmlFor="question">Research question</label>
            <input
              id="question"
              type="text"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="What bottleneck should we validate this week?"
              disabled={workflowState !== "idle"}
            />

            <label htmlFor="context">Extra context (optional)</label>
            <textarea
              id="context"
              value={context}
              onChange={(event) => setContext(event.target.value)}
              placeholder="Target persona, assumptions, timeline..."
              rows={4}
              disabled={workflowState !== "idle"}
            />

            <button type="submit" disabled={!canSubmit}>
              Start Run
            </button>
          </form>
        </article>

        <article className="panel">
          <h2>Run</h2>
          <div className="status-block">
            <p className="status">
              <span className={`status-pill status-${statusTone}`} aria-hidden="true" />
              <span className="status-main">
                Current state:{" "}
                <strong>{statusLabel}</strong>
              </span>
            </p>
            <p className="status-meta">Last updated: {lastUpdatedLabel}</p>
          </div>
          {workflowState === "running" && (
            <p className="hint">Run is in progress. Polling status using stub services...</p>
          )}
          {errorMessage && <p className="error">{errorMessage}</p>}
        </article>
      </section>

      <section className="panel results-panel">
        <h2>Results</h2>
        {workflowState === "done" ? (
          <div className="results-card">
            <p>
              <strong>Run ID:</strong> {activeRunId}
            </p>
            <p>{activeSummary}</p>
            <p className="result-timestamp">
              <strong>Completed:</strong>{" "}
              {new Date(activeCompletedAt).toLocaleString()}
            </p>
            <button type="button" onClick={handleReset}>
              Restart
            </button>
          </div>
        ) : (
          <p className="hint">Results appear once the state reaches done.</p>
        )}
      </section>

      <section className="panel history-panel">
        <h2>History</h2>
        {history.length === 0 ? (
          <p className="hint">No completed runs yet.</p>
        ) : (
          <ul className="history-list">
            {history.map((item) => (
              <li key={item.runId}>
                <p>
                  <strong>{item.runId}</strong> - {new Date(item.completedAt).toLocaleString()}
                </p>
                <p>{item.question}</p>
                <p className="summary-line">{item.summary}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;