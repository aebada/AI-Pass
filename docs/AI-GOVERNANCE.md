# AI Governance & Compliance Operations Platform

Enterprise operational governance layer for AI Pass — continuous monitoring, policy enforcement, and risk management. This is **not** a checklist; it is an active control plane that runs alongside every AI system.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Governance Operations UI                      │
│  /workspace/governance  ·  /workspace/compliance               │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     GovernanceService                            │
│  Orchestrates lifecycle, enforcement, audit, and integrations   │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────┤
│Inventory │ Policy   │Enforcement│  Risk   │ Approval │Monitoring│
│ Service  │ Service  │  Engine   │ Service │ Service  │ Service  │
├──────────┴──────────┴──────────┴──────────┴──────────┴──────────┤
│ Reporting · Audit · Notification (stub) · WorkflowEngine          │
└────────────────────────────┬────────────────────────────────────┘
                             │
     ┌───────────────────────┼───────────────────────┐
     │                       │                       │
┌────▼────┐            ┌─────▼─────┐          ┌──────▼──────┐
│  Trust  │            │ LiveSync  │          │ Provider Hub│
│ Engine  │            │ Workflows │          │ Model Route │
└─────────┘            └───────────┘          └─────────────┘
```

### Package: `@ai-pass/governance`

| Service | Responsibility |
|---------|----------------|
| `GovernanceService` | Central orchestration, lifecycle, integrations |
| `InventoryService` | AI system registry |
| `PolicyService` | Create, version, publish, retire policies |
| `PolicyEnforcementEngine` | Real-time policy evaluation and blocking |
| `RiskService` | AI risk register |
| `ApprovalService` | Human-in-the-loop approvals |
| `MonitoringService` | Alerts, incidents, drift detection |
| `ReportingService` | Reports and export stubs |
| `AuditService` | Immutable audit logs |
| `NotificationService` | Notification stub |
| `WorkflowEngine` | Configurable lifecycle stages |

## Governance Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Registration
    Registration --> RiskAssessment
    RiskAssessment --> PolicyValidation
    PolicyValidation --> Approval: violations or high risk
    PolicyValidation --> Certification: passed
    Approval --> Certification: approved
    Approval --> Registration: rejected
    Certification --> Deployment
    Deployment --> Monitoring
    Monitoring --> Recertification: drift or incident
    Recertification --> PolicyValidation
    Monitoring --> Monitoring: healthy
```

## Policy Enforcement Flow

```mermaid
sequenceDiagram
    participant App as AI System / LiveSync
    participant PE as PolicyEnforcementEngine
    participant GS as GovernanceService
    participant AP as ApprovalService
    participant MO as MonitoringService
    participant AU as AuditService

    App->>PE: evaluate(action, context, modelId)
    PE->>PE: Check active published policies
    alt Block violation
        PE-->>GS: decision: block
        GS->>MO: record policy_violation
        GS->>AP: request approval
        GS->>AU: audit log
    else Require approval
        PE-->>GS: decision: require_approval
        GS->>AP: request approval
    else Allow
        PE-->>GS: decision: allow
    end
```

## Integration Points

- **Trust Engine** — validation, certification, trust score, revalidation
- **LiveSync** — `GovernanceHook` on policy events and workflow steps
- **Provider Hub** — `routeModel()` blocks/routes models
- **AI Wallet** — governance usage audit trail
- **Membership** — Enterprise unlocks org-wide governance
- **Marketplace** — `checkMarketplaceInstall()` approval gates
- **Agent Studio** — `registerSystem()` on create

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/governance/dashboard` | Dashboard metrics |
| GET/POST | `/api/governance/ai-systems` | List / register systems |
| GET | `/api/governance/ai-systems/[id]` | System detail |
| GET/POST | `/api/governance/policy/policies` | List / create policies |
| GET | `/api/governance/risk/risks` | Risk register |
| GET/POST | `/api/governance/approve` | Approvals queue / process |
| GET/POST | `/api/governance/monitor` | Monitoring events |
| GET/POST | `/api/governance/reports` | Generate reports |
