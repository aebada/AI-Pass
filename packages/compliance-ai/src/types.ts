/** Compliance AI — domain types */

export type FrameworkCode =
  | 'ISO_27001'
  | 'ISO_42001'
  | 'SOC2'
  | 'GDPR'
  | 'NIS2'
  | 'DORA'
  | 'TISAX'
  | 'ISO_9001'
  | 'ISO_27701'
  | 'ISO_27018';

export type ControlStatus = 'not_started' | 'in_progress' | 'implemented' | 'verified' | 'non_applicable';

export type TaskStatus = 'open' | 'in_progress' | 'blocked' | 'done' | 'overdue';

export type RiskCategory = 'security' | 'ai' | 'privacy' | 'vendor' | 'operational' | 'compliance';

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export type PolicyStatus = 'draft' | 'review' | 'approved' | 'published' | 'archived';

export type EvidenceType = 'document' | 'log' | 'screenshot' | 'config' | 'ai_validation' | 'certificate';

export type EvidenceStatus = 'pending' | 'collected' | 'validated' | 'expired' | 'rejected';

export type VendorRiskClass = 'low' | 'medium' | 'high' | 'critical';

export type EmployeeComplianceStatus = 'compliant' | 'pending' | 'overdue' | 'non_compliant';

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export type TrustCenterPublishStatus = 'draft' | 'published' | 'unpublished';

export interface Framework {
  id: string;
  tenantId: string;
  code: FrameworkCode;
  name: string;
  version: string;
  description: string;
  active: boolean;
  progress: number;
  controlCount: number;
  implementedCount: number;
  ownerId: string;
  ownerName: string;
  activatedAt?: string;
  targetCertificationDate?: string;
  mappedFrameworks: FrameworkCode[];
  createdAt: string;
  updatedAt: string;
}

export interface Control {
  id: string;
  tenantId: string;
  frameworkId: string;
  frameworkCode: FrameworkCode;
  controlRef: string;
  title: string;
  description: string;
  status: ControlStatus;
  ownerId: string;
  ownerName: string;
  evidenceIds: string[];
  riskIds: string[];
  policyIds: string[];
  mappedControlRefs: { frameworkCode: FrameworkCode; controlRef: string }[];
  progress: number;
  dueDate?: string;
  lastReviewedAt?: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  tenantId: string;
  controlId?: string;
  frameworkId?: string;
  title: string;
  description: string;
  status: TaskStatus;
  assigneeId: string;
  assigneeName: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  evidenceRequired: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Risk {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: RiskCategory;
  severity: RiskSeverity;
  likelihood: number;
  impact: number;
  riskScore: number;
  ownerId: string;
  ownerName: string;
  controlIds: string[];
  mitigationPlan: string;
  mitigationStatus: 'planned' | 'in_progress' | 'mitigated' | 'accepted';
  reviewSchedule: string;
  nextReviewAt: string;
  aiSystemId?: string;
  vendorId?: string;
  status: 'open' | 'mitigating' | 'closed' | 'accepted';
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  riskClass: VendorRiskClass;
  dataAccess: boolean;
  criticality: 'low' | 'medium' | 'high';
  contractExpiry?: string;
  lastSecurityReview?: string;
  nextReviewAt?: string;
  questionnaireStatus: 'not_sent' | 'sent' | 'completed' | 'overdue';
  integrationProvider?: string;
  contactEmail: string;
  status: 'active' | 'under_review' | 'offboarded';
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCompliance {
  id: string;
  tenantId: string;
  employeeId: string;
  employeeName: string;
  email: string;
  department: string;
  status: EmployeeComplianceStatus;
  onboardingComplete: boolean;
  offboardingScheduled?: string;
  trainingCompleted: string[];
  trainingPending: string[];
  policiesAccepted: string[];
  policiesPending: string[];
  accessReviewDue?: string;
  lastReminderAt?: string;
  taskHistory: { taskId: string; title: string; completedAt?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface PolicyVersion {
  id: string;
  policyId: string;
  version: number;
  content: string;
  status: PolicyStatus;
  approvedBy?: string;
  approvedAt?: string;
  publishedAt?: string;
  changeSummary: string;
  createdAt: string;
}

export interface Policy {
  id: string;
  tenantId: string;
  title: string;
  templateType?: 'ai_governance' | 'security' | 'privacy' | 'acceptable_use' | 'data_retention' | 'incident_response';
  status: PolicyStatus;
  currentVersionId: string;
  versions: PolicyVersion[];
  ownerId: string;
  ownerName: string;
  acceptanceRequired: boolean;
  acceptanceRate: number;
  frameworkCodes: FrameworkCode[];
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id: string;
  tenantId: string;
  title: string;
  type: EvidenceType;
  status: EvidenceStatus;
  controlIds: string[];
  frameworkCodes: FrameworkCode[];
  source: 'manual' | 'auto_collection' | 'api_integration' | 'workflow';
  fileName?: string;
  collectedAt?: string;
  expiresAt?: string;
  validatedAt?: string;
  validationReport?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Audit {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  details: Record<string, unknown>;
  immutableHash: string;
  timestamp: string;
}

export interface TrustCenterCommitment {
  id: string;
  title: string;
  description: string;
  category: 'security' | 'privacy' | 'ai_governance' | 'certification';
}

export interface TrustCenter {
  id: string;
  tenantId: string;
  orgSlug: string;
  orgName: string;
  status: TrustCenterPublishStatus;
  publishedAt?: string;
  frameworks: { code: FrameworkCode; status: string; progress: number }[];
  certifications: { name: string; level: string; validUntil: string; verificationUrl: string }[];
  commitments: TrustCenterCommitment[];
  auditStatus: string;
  trustScore: number;
  aiGovernanceSummary: string;
  updatedAt: string;
}

export interface AIUseCase {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  riskLevel: RiskSeverity;
  governanceSystemId?: string;
  frameworkCodes: FrameworkCode[];
  status: 'draft' | 'approved' | 'production' | 'retired';
  createdAt: string;
}

export interface AISystem {
  id: string;
  tenantId: string;
  name: string;
  type: 'agent' | 'model' | 'workflow' | 'application';
  governanceSystemId: string;
  riskLevel: RiskSeverity;
  complianceStatus: 'compliant' | 'review' | 'non_compliant';
  iso42001EvidenceIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceReport {
  id: string;
  tenantId: string;
  type:
    | 'compliance_summary'
    | 'executive_dashboard'
    | 'risk_register'
    | 'vendor_risk'
    | 'policy_acceptance'
    | 'audit_evidence'
    | 'employee_compliance'
    | 'ai_governance';
  title: string;
  generatedAt: string;
  format: ReportFormat;
  data: Record<string, unknown>;
  exportUrl?: string;
}

export interface ComplianceDashboard {
  complianceScore: number;
  activeFrameworks: number;
  openRisks: number;
  criticalRisks: number;
  evidenceCollected: number;
  evidencePending: number;
  vendorHighRisk: number;
  aiGovernanceStatus: string;
  employeeComplianceRate: number;
  auditReadiness: number;
  trustCenterStatus: TrustCenterPublishStatus;
  upcomingReviews: { id: string; title: string; dueAt: string; type: string }[];
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: { type: string; id: string; title: string }[];
  creditsUsed?: number;
  createdAt: string;
}

export interface VendorIntegrationStub {
  provider: 'google_workspace' | 'm365' | 'jira' | 'github' | 'personio' | 'bamboohr' | 'aws' | 'azure' | 'gcp';
  status: 'available' | 'connected' | 'stub';
  description: string;
}
