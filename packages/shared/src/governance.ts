import type { AgentDecision, CertificationLevel, RiskLevel } from './platform.js';

export type GovernanceEventType =
  | 'system_registered'
  | 'deployment_review'
  | 'model_update'
  | 'policy_violation'
  | 'drift_detected'
  | 'approval_required'
  | 'recertification_trigger'
  | 'provider_updated'
  | 'app_installed'
  | 'risk_detected';

export type AISystemType =
  | 'agent'
  | 'workflow'
  | 'model'
  | 'application'
  | 'integration'
  | 'marketplace_app'
  | 'custom';

export type ComplianceFramework =
  | 'ISO_42001'
  | 'ISO_27001'
  | 'GDPR'
  | 'SOC2'
  | 'NIS2'
  | 'DORA'
  | 'internal';

export type PolicyCategory =
  | 'ai_usage'
  | 'security'
  | 'data'
  | 'approval'
  | 'prompt'
  | 'model_selection'
  | 'compliance';

export type PolicyStatus = 'draft' | 'published' | 'retired' | 'archived';

export type RiskCategory =
  | 'hallucination'
  | 'bias'
  | 'privacy'
  | 'security'
  | 'operational'
  | 'compliance'
  | 'provider'
  | 'data'
  | 'model_drift';

export type RiskStatus = 'open' | 'mitigated' | 'accepted' | 'closed' | 'in_review';

export type ApprovalType =
  | 'manual'
  | 'exception'
  | 'override'
  | 'deployment'
  | 'policy_exception';

export type MonitoringEventType =
  | 'hallucination'
  | 'confidence_low'
  | 'policy_violation'
  | 'error'
  | 'provider_change'
  | 'drift'
  | 'anomaly'
  | 'unsafe_output'
  | 'security_scan';

export type ExportFormat = 'pdf' | 'excel' | 'json' | 'csv';

export type GovernanceLifecycleStage =
  | 'registration'
  | 'risk_assessment'
  | 'policy_validation'
  | 'approval'
  | 'certification'
  | 'deployment'
  | 'monitoring'
  | 'recertification';

/** AI system registry entry */
export interface AISystem {
  id: string;
  name: string;
  type: AISystemType;
  ownerId: string;
  department: string;
  businessPurpose: string;
  provider: string;
  version: string;
  riskClassification: RiskLevel;
  complianceStatus: 'compliant' | 'non_compliant' | 'pending_review' | 'conditional';
  certificationStatus?: CertificationLevel;
  certificationId?: string;
  deploymentEnvironment: string;
  monitoringStatus: 'active' | 'paused' | 'degraded' | 'offline';
  connectedWorkflows: string[];
  trustScore?: number;
  lifecycleStage: GovernanceLifecycleStage;
  createdAt: string;
  updatedAt: string;
}

/** @deprecated Use AISystem */
export type AISystemRecord = AISystem;

export interface GovernancePolicy {
  id: string;
  name: string;
  version: string;
  category: PolicyCategory;
  description?: string;
  rules: PolicyRule[];
  applicableSystemTypes: AISystemType[];
  frameworks: ComplianceFramework[];
  status: PolicyStatus;
  active: boolean;
  publishedAt?: string;
  retiredAt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PolicyRule {
  id: string;
  type:
    | 'prohibited_prompt'
    | 'mandatory_citation'
    | 'human_approval'
    | 'pii_masking'
    | 'explainability'
    | 'restricted_workflow'
    | 'allowed_models'
    | 'blocked_models'
    | 'confidence_threshold'
    | 'human_review';
  condition: Record<string, unknown>;
  action: 'block' | 'warn' | 'escalate' | 'log' | 'require_approval';
  severity: RiskLevel;
}

export interface Risk {
  id: string;
  systemId: string;
  category: RiskCategory;
  title: string;
  description: string;
  impact: RiskLevel;
  likelihood: RiskLevel;
  score: number;
  ownerId: string;
  mitigationPlan?: string;
  reviewSchedule: string;
  status: RiskStatus;
  frameworks: ComplianceFramework[];
  createdAt: string;
  updatedAt: string;
}

/** @deprecated Use Risk */
export type AIRiskEntry = Risk;

export interface Approval {
  id: string;
  systemId: string;
  workflowId?: string;
  policyId?: string;
  type: ApprovalType;
  requestedBy: string;
  assigneeId?: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'overridden';
  priority: RiskLevel;
  decision?: AgentDecision;
  escalatedTo?: string;
  exceptionDetails?: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

/** @deprecated Use Approval */
export type ApprovalRequest = Approval;

export interface Inventory {
  systems: AISystem[];
  totalCount: number;
  byType: Record<string, number>;
  byRisk: Record<RiskLevel, number>;
  byCompliance: Record<string, number>;
  lastUpdated: string;
}

export interface MonitoringEvent {
  id: string;
  systemId: string;
  type: MonitoringEventType;
  severity: RiskLevel;
  title: string;
  details: Record<string, unknown>;
  recommendation?: string;
  incidentId?: string;
  acknowledged: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  resourceType: 'system' | 'policy' | 'risk' | 'approval' | 'monitoring' | 'report';
  resourceId: string;
  details: Record<string, unknown>;
  immutable: true;
  timestamp: string;
}

export interface ComplianceMapping {
  id: string;
  framework: ComplianceFramework;
  controlId: string;
  controlName: string;
  policyIds: string[];
  systemIds: string[];
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';
  evidence?: string;
  lastAssessedAt?: string;
}

export interface Review {
  id: string;
  systemId: string;
  reviewerId: string;
  type: 'risk' | 'policy' | 'certification' | 'exception';
  status: 'scheduled' | 'in_progress' | 'completed';
  findings: string[];
  scheduledAt: string;
  completedAt?: string;
}

export interface Exception {
  id: string;
  systemId: string;
  policyId: string;
  requestedBy: string;
  justification: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  expiresAt?: string;
  approvedBy?: string;
  createdAt: string;
}

export interface CertificationReference {
  id: string;
  systemId: string;
  level: CertificationLevel;
  trustScore: number;
  validFrom: string;
  validUntil: string;
  validationRunId?: string;
  frameworks: ComplianceFramework[];
}

export interface DriftEvent {
  id: string;
  systemId: string;
  metric: string;
  previousValue: number;
  currentValue: number;
  threshold: number;
  detectedAt: string;
}

export interface GovernanceEvaluation {
  allowed: boolean;
  decision: 'allow' | 'block' | 'escalate' | 'require_approval';
  violations: string[];
  requiresHumanApproval: boolean;
  blockedModels?: string[];
  requiredApprovals?: string[];
}

export interface GovernanceDashboard {
  systemCount: number;
  highRiskCount: number;
  pendingApprovals: number;
  activeViolations: number;
  certifiedCount: number;
  driftAlerts: number;
  monitoringActive: number;
  complianceRate: number;
  riskDistribution: Record<RiskLevel, number>;
  recentEvents: MonitoringEvent[];
}

export interface GovernanceReportRequest {
  type: 'inventory' | 'risk' | 'policy' | 'compliance' | 'executive' | 'certification' | 'drift' | 'audit';
  format: ExportFormat;
  filters?: Record<string, unknown>;
}
