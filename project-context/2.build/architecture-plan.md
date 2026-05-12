# Architecture Implementation Plan
## Automated Employee Onboarding Flow

## Plan Metadata
- Version: 1.0
- Date: 2026-05-12
- Owner: Build Phase Team
- SAD Reference: `project-context/2.build/sad.md`

## 1. Implementation Approach

### 1.1 Delivery Strategy
- Build in thin vertical slices: workflow core -> dashboards -> recommendations -> integrations -> observability.
- Prefer deterministic behavior first, then layer bounded AI recommendations.
- Validate each slice against PRD acceptance criteria before expanding scope.

### 1.2 Workstreams
1. Platform Foundation
- Repo conventions, environment profiles, containerization, secrets model.

2. Backend Core (FastAPI + Worker)
- Canonical entities, track state machines, event ingestion, recommendation orchestration API.

3. Application Crew (CrewAI)
- Implement orchestrator and domain agents from PRD Core Agent Definitions with structured contracts and confidence thresholds.

4. Frontend UI
- Role-specific dashboards, task lifecycle actions, recommendation review UX.

5. Integrations
- Mock HRIS/LMS, email dispatch, chat adapter, failure fallback behaviors.

6. Quality and Operations
- Test automation, CI/CD, metrics dashboards, alerting, runbooks.

## 2. Phased Execution Plan

### Phase A: Foundation and Data Model
- Define DB schema and migrations.
- Implement RBAC/auth skeleton.
- Stand up API service, worker, and queue.
- Exit criteria: onboarding case creation and basic task persistence working.

### Phase B: Parallel Onboarding Engine
- Implement IT/Compliance/Training track state machines.
- Add SLA timers and escalation trigger events.
- Build readiness score aggregator.
- Exit criteria: end-to-end track execution with auditable transitions.

### Phase C: Application Crew Recommendations
- Implement orchestrator delegation across IT Provisioning, Compliance, Training Personalization, Communications, Escalation and Risk, and Analytics agents.
- Add rationale, confidence, and approve/override workflow.
- Gate recommendation action commits with policy validation.
- Exit criteria: recommendation loop operational with traceable outcomes.

### Phase D: Frontend and User Workflows
- Deliver HR, IT, Manager, New Hire dashboards.
- Add pending/blocked visibility and milestone timeline.
- Integrate recommendation panel and manual override UX.
- Exit criteria: all P0 role flows testable from UI.

### Phase E: Integrations and Reliability
- Implement mock HRIS ingestion and LMS sync.
- Add email + chat adapters and notification ledger.
- Implement degraded-mode manual fallback and replay handling.
- Exit criteria: integration failures do not block onboarding progression.

### Phase F: Hardening and Launch Readiness
- Add performance, integration, and E2E test coverage.
- Finalize monitoring, alerting, and backup/restore validation.
- Validate PRD metrics and readiness criteria.
- Exit criteria: MVP readiness sign-off.

## 3. Status Tracker

| Work Item | Owner | Status | Notes |
|---|---|---|---|
| SAD draft completion | System Architect | Completed | Initial architecture baseline published |
| Data schema definition | Backend | Planned | Pending detailed entity review |
| FastAPI service scaffold | Backend | Planned | Includes API + worker boundaries |
| CrewAI agent contracts | Backend/AI | Planned | Orchestrator + six domain agent contracts from PRD |
| Role dashboard wireframes | Frontend | Planned | HR, IT, Manager, New Hire views |
| Recommendation UX flow | Frontend | Planned | Approve/override and rationale display |
| Mock HRIS connector | Integration | Planned | Employee ingest and updates |
| Email/chat adapters | Integration | Planned | Notification dispatch and status feedback |
| CI/CD and observability | DevOps | Planned | Metrics, logs, alerts, smoke tests |
| End-to-end quality gate | QA | Planned | P0 acceptance and performance checks |

Status legend:
- Planned: not started
- In Progress: active implementation
- Completed: accepted and merged
- Blocked: waiting on dependency or decision

## 4. Decision and Dependency Log

### Key Decisions
- Backend framework: FastAPI.
- Agent architecture: PRD-aligned orchestrator with six specialized domain agents.
- Runtime model: event-driven orchestration + queue workers.
- Primary UX mode: web UI (CLI optional for ops workflows).

### Dependencies
- Final auth provider selection.
- Queue technology selection and operational profile.
- Email and chat provider credentials/sandbox access.
- KPI baseline dataset definition for validation.

## 5. Risks and Active Mitigations
- Scope creep risk -> enforce P0 scope gate at sprint planning.
- Integration instability risk -> adapter abstraction and degraded-mode path.
- Trust in AI recommendations risk -> confidence thresholds + human approval.
- Delivery timeline risk -> prioritize vertical slices and acceptance-driven milestones.

## 6. Next Milestones
1. Finalize schema and API contracts.
2. Implement track state machine service with tests.
3. Integrate crew recommendation endpoint with approval workflow.
4. Deliver first UI slice for HR dashboard and task progression.
5. Run first end-to-end MVP scenario and capture KPI baseline.
