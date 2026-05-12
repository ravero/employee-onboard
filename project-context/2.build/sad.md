# Solution Architecture Document (SAD)
## Automated Employee Onboarding Flow

## Document Control
- Version: 1.0
- Date: 2026-05-12
- Authoring Persona: System Architect
- Scope: MVP architecture for build phase
- Output File: project-context/2.build/sad.md

## Audit
- Resolved adapter: `crewai` (default applied because `AAMAD_ADAPTER` was not provided explicitly)
- Source artifacts reviewed:
  - `project-context/1.define/prd.md`
  - `project-context/1.define/mrd.md`
  - `.cursor/templates/sad-template.md`
- Constraint applied: AI decisioning is bounded to recommendations and explainable interventions, consistent with PRD.

## 1. MVP Architecture Philosophy and Principles

### 1.1 Architecture Goals
- Deliver measurable onboarding outcomes quickly: day 1 readiness, day 7 completion, and reduced TTP-P.
- Keep runtime simple and auditable: deterministic workflow core plus bounded AI recommendations.
- Preserve low operational complexity for capstone timeline and budget.

### 1.2 Design Principles
- Parallel-first orchestration: IT, Compliance, and Training run concurrently with explicit gates.
- Human-in-the-loop for low-confidence or policy-sensitive decisions.
- Explainability by default for recommendations and escalation suggestions.
- Event-driven state changes with immutable audit logs.
- MVP-first scope control: mock connectors and minimal integrations, with clear deferrals.

### 1.3 MVP vs Future Boundary
- In scope (MVP): orchestration engine, role dashboards, chat + email notifications, KPI telemetry, mock HRIS and LMS integration.
- Deferred: live enterprise HRIS/IAM/LMS/payroll connectors, predictive forecasting, benchmark intelligence, no-code policy builder.

## 2. Multi-Agent System Specification (CrewAI)

### 2.1 Application Crew (MVP)
The MVP Application Crew aligns exactly to PRD Core Agent Definitions:

1. Orchestrator Agent
- Role: global onboarding workflow orchestrator.
- Goal: progress each hire across required tracks with dependency gates, SLA checks, and auditable transitions.
- Tools: workflow_engine, event_bus, rules_evaluator, audit_logger.
- Delegation: IT Provisioning, Compliance, Training Personalization, Communications, Escalation and Risk, Analytics agents.

2. IT Provisioning Agent
- Role: account and access provisioning coordinator.
- Goal: achieve day 1 access readiness with complete and validated tasks.
- Tools: ticketing_adapter, identity_mock_connector, checklist_validator.
- Delegation: Communications and Escalation and Risk agents.

3. Compliance Agent
- Role: compliance requirements execution manager.
- Goal: complete mandatory policy and documentation checkpoints before deadlines.
- Tools: document_tracker, policy_rules_engine, exception_router.
- Delegation: Communications and Escalation and Risk agents.

4. Training Personalization Agent
- Role: specialization training planner.
- Goal: assign role-relevant specialization modules after baseline completion.
- Tools: lms_mock_connector, role_skill_mapper, recommendation_engine.
- Delegation: Communications agent.

5. Communications Agent
- Role: cross-channel communication dispatcher.
- Goal: deliver reminders, summaries, and escalation notifications.
- Tools: email_service, chat_service, template_engine.
- Delegation: none.

6. Escalation and Risk Agent
- Role: SLA risk detector and escalation advisor.
- Goal: detect likely breaches and trigger role-appropriate escalation.
- Tools: sla_monitor, risk_rules, escalation_policy_engine.
- Delegation: Communications agent.

7. Analytics Agent
- Role: KPI and readiness analytics processor.
- Goal: provide baseline-vs-MVP metrics and per-track performance insights.
- Tools: metrics_store, aggregation_jobs, dashboard_exporter.
- Delegation: none.

### 2.2 Agent Collaboration Pattern
- Execution mode: orchestrator-driven delegation with parallel track execution.
- Trigger model: event-driven invocation from backend on case creation, task transition, SLA threshold, or exception event.
- Parallelism: IT, Compliance, and Training tracks execute in parallel with explicit dependency gates.
- Guardrails:
  - Orchestrator is the only agent permitted to commit canonical workflow state transitions.
  - Domain agents propose or execute bounded actions under rule validation.
  - Human-in-the-loop approval is required for exception routing and low-confidence training recommendations.

### 2.3 Memory and Context Strategy
- Short-term memory:
  - employee_session_state and global_track_index for orchestrator context.
  - per-track state objects for IT, Compliance, and Training.
- Long-term memory:
  - compliance_status_log, exception_history, notification_history, sla_timers, escalation_events, metric_snapshots.
- Retention: minimal PII with persistent decision and transition metadata for audit and KPI analysis.

### 2.4 CrewAI Runtime Configuration
- Process type: hierarchical orchestrator delegation with event-driven task routing.
- Verbose logs: enabled in dev/stage; reduced in prod with structured JSON logs.
- Retry policy: max 2 retries for transient model/tool failures with idempotency key.
- Timeout: 8s target, 20s hard timeout for agent task execution path.

## 3. Frontend Architecture Specification

### 3.1 Chosen Interface
- Primary: simple web UI (responsive) for HR, IT, Manager, and New Hire roles.
- Secondary (optional MVP utility): CLI admin script for operational debugging and seed/test workflows.

### 3.2 Frontend Stack
- Framework: lightweight React SPA (or server-rendered minimal pages) served via backend static hosting.
- Styling: minimal component set prioritizing clarity and accessibility over design complexity.
- Auth session handling: token-based session with role claims.

### 3.3 Key Views
- HR Operations Dashboard: all hires, overdue tasks, SLA risk, intervention queue.
- IT Queue View: provisioning items, blockers, due dates, escalation state.
- Manager View: team onboarding progress and recommended interventions.
- New Hire View: personal tasks, milestones, pending/blocked status.
- Recommendation Panel: shows training and escalation recommendations with rationale plus approve/override actions.

### 3.4 UX and Accessibility
- Responsive for desktop/mobile browser usage.
- WCAG 2.1 AA baseline for forms, contrast, focus states, labels.
- Plain-language error and status labels for each role.
- Explicit loading/failure states for async recommendation calls.

## 4. Backend API Architecture (FastAPI)

### 4.1 Service Topology
- API service: FastAPI for REST endpoints and event ingestion.
- Worker service: async worker for queue processing, notifications, and crew execution.
- Shared datastore: relational DB + append-only event log table.

### 4.2 Why FastAPI
- Native async handling for concurrent event and dashboard traffic.
- Strong request/response validation via Pydantic schemas.
- Clear OpenAPI generation for frontend/backend contract alignment.

### 4.3 API Domains
- Onboarding domain: create case, generate track tasks, update task state, milestone status.
- Recommendation domain: trigger recommendation run, fetch recommendation history, approve/override action.
- Dashboard domain: role-specific summaries, risk queues, KPI snapshots.
- Notification domain: email/chat dispatch status and history.

### 4.4 Data Contracts (High Level)
- `OnboardingCase`: employee_id, role, department, start_date, readiness_score, status.
- `TrackTask`: track_type, task_type, owner_role, due_at, status, blocker_reason.
- `Recommendation`: source_event_id, risk_score, confidence, rationale, proposed_action, approval_state.
- `AuditEvent`: actor, event_type, entity_type, entity_id, timestamp, metadata.

### 4.5 Error Handling and Reliability
- Idempotent mutation endpoints using idempotency keys.
- Queue-based retries with dead-letter handling for unrecoverable errors.
- Manual fallback action creation when integration dependency is unavailable.

## 5. Data and Persistence Architecture

### 5.1 Storage Model
- Primary DB: PostgreSQL (or SQLite for local dev), normalized schema for core entities.
- Event log: append-only workflow and recommendation events for traceability.
- Optional object storage: exports/reports for leadership summaries.

### 5.2 Core Tables
- `employees`
- `onboarding_cases`
- `tasks`
- `milestones`
- `recommendations`
- `notifications`
- `audit_events`
- `kpi_snapshots`

### 5.3 Data Governance
- PII minimization (only onboarding-required fields).
- Encryption in transit and at rest.
- Retention and purge policies by entity category (operational vs audit).

## 6. Integration Architecture

### 6.1 Required MVP Integrations
- Mock HRIS connector: employee profile + start date ingestion.
- Email provider: reminders, escalations, digests.
- Chat interface adapter: pending/blocked Q&A and status retrieval.
- Optional LMS mock: baseline and specialization training task sync.

### 6.2 Integration Pattern
- Adapter abstraction per external system.
- Inbound events normalized into canonical event schema.
- Outbound actions logged with delivery status and retry metadata.

### 6.3 Failure and Degraded Mode
- Integration outage -> system generates manual action tasks with owner/due date.
- Operator-visible incident flags in dashboards.
- Replay support for retriable integration events.

## 7. Deployment and DevOps Architecture

### 7.1 Environments
- Separate dev, stage, prod environments with isolated databases and secrets.

### 7.2 Runtime
- Containerized API + worker services.
- Queue-based async processing.
- Managed database with automated backups.

### 7.3 CI/CD
- Pipeline stages: lint/test -> build -> deploy stage -> smoke tests -> deploy prod.
- Rollback: last-known-good image deployment.
- Required checks: API schema validation, basic workflow integration tests.

### 7.4 Observability
- Centralized structured logs.
- Metrics: API latency p95, queue lag p95, notification SLA, recommendation failure rate.
- Alerts: SLA breach risk spikes, queue backlog, connector failures.

## 8. Security and Compliance Architecture

### 8.1 Access Control
- RBAC roles: HR, IT, Manager, New Hire, Admin.
- Endpoint-level authorization guards based on role and resource ownership.

### 8.2 Security Controls
- TLS for all network traffic.
- Secret manager for API keys and service credentials.
- Input validation and payload sanitization at API boundary.
- Immutable audit trail for state changes and overrides.

### 8.3 Compliance Posture (MVP)
- SOC2-aligned control practices (logging, least privilege, backup/restore discipline).
- US privacy best-practice baseline for PII handling and retention.

## 9. Performance, Scalability, and Quality Targets

### 9.1 Performance Targets (from PRD)
- Dashboard/API reads: p95 <= 800ms.
- Event processing lag: p95 <= 5s.
- Notification dispatch: 99% within 2 minutes of trigger.
- Capacity target: >=500 active onboarding cases/month; >=300 concurrent active users in demo profile.

### 9.2 Scalability Path
- Horizontal scale API/worker independently.
- Scale worker on queue depth and processing lag.
- Database migration path from local SQLite (dev) to PostgreSQL (stage/prod).

### 9.3 Quality and Test Strategy
- Unit tests: task state machine, recommendation validation, policy checks.
- Integration tests: API + DB + queue + crew execution flow.
- E2E tests: role dashboards, recommendation approve/override, degraded-mode fallback.

## 10. Traceability, Assumptions, Risks, and Open Questions

### 10.1 Requirements Traceability (PRD -> Architecture)
- P0-1 Parallel Orchestration -> parallel track state machines, event bus, readiness aggregator.
- P0-2 IT Workflow -> IT dashboard + task schema + SLA escalation policy.
- P0-3 Compliance Workflow -> compliance task templates + audit events + exception routing.
- P0-4 Personalized Training -> training_personalization_agent outputs with explainability and override flow.
- P0-5 Multi-channel Communication -> email/chat adapters + notification ledger.
- P0-6 Role Dashboards -> role-scoped query APIs + dedicated UI views.
- P0-7 KPI and Audit Telemetry -> kpi_snapshots + immutable audit_events.

### 10.2 Assumptions
- MVP uses mock or sandbox connectors for HRIS and LMS.
- Baseline onboarding path is common for all hires; only specialization differs.
- Human approvers are available for low-confidence recommendations.

### 10.3 Risks and Mitigations
- Risk: recommendation trust gap.
  - Mitigation: rationale display, confidence thresholds, mandatory approval for sensitive actions.
- Risk: integration instability.
  - Mitigation: adapter abstraction, retries, degraded manual mode.
- Risk: scope expansion.
  - Mitigation: strict MVP boundaries and deferred feature backlog.

### 10.4 Open Questions
- Which chat channel is primary in MVP (embedded portal chat only vs external chat app adapter)?
- Is CLI support required in MVP deliverable or only for developer operations?
- What confidence threshold should trigger mandatory human review by default?
- Which KPI baseline dataset will be used for before/after comparison during validation?

## Source References
- `project-context/1.define/prd.md`
- `project-context/1.define/mrd.md`
- `.cursor/templates/sad-template.md`
