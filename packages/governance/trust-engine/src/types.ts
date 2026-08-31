import type {
  AgentDecision,
  CertificationLevel,
  CertificationStatus,
  RiskLevel,
  TrustScorecard,
} from '@ai-pass/shared';

export type AISystemType =
  | 'agent'
  | 'app'
  | 'model'
  | 'workflow'
  | 'marketplace_app'
  | 'enterprise_system';

export interface AISystem {
  id: string;
  companyName: string;
  productName: string;
  systemType: AISystemType;
  industry: string;
  useCase: string;
  deploymentType: string;
  modelsUsed: string[];
  highRiskDomain: boolean;
  status: CertificationStatus;
  resourceId?: string;
  tenantId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestScenario {
  id: string;
  name: string;
  description?: string;
  category:
    | 'functional'
    | 'reliability'
    | 'explainability'
    | 'compliance'
    | 'safety'
    | 'performance'
    | 'hallucination'
    | 'edge_case'
    | 'adversarial'
    | 'multi_model';
  input: Record<string, unknown>;
  expectedOutput?: Record<string, unknown>;
  acceptableDeviation?: number;
  severity: RiskLevel;
  suiteId?: string;
}

export interface TestResult {
  testCaseId: string;
  scenarioId: string;
  passed: boolean;
  actualOutput: Record<string, unknown>;
  deviation?: number;
  citations?: string[];
  error?: string;
  durationMs?: number;
}

export interface ValidationRun {
  id: string;
  systemId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'review_required';
  certificationLevel: CertificationLevel;
  testSuiteId?: string;
  dimensions: ValidationDimension[];
  scorecard?: TrustScorecard;
  recommendation?: AgentDecision;
  startedAt: string;
  completedAt?: string;
  failureCount: number;
  passRate: number;
  creditsConsumed?: number;
}

export type ValidationDimension =
  | 'functional'
  | 'reliability'
  | 'explainability'
  | 'compliance'
  | 'safety'
  | 'performance'
  | 'hallucination'
  | 'multi_model'
  | 'edge_case'
  | 'adversarial';

export interface TrustScore {
  systemId: string;
  scorecard: TrustScorecard;
  riskScore: number;
  riskLevel: RiskLevel;
  recommendedLevel: CertificationLevel | null;
  computedAt: string;
}

export interface Certification {
  id: string;
  systemId: string;
  companyName: string;
  productName: string;
  level: CertificationLevel;
  status: CertificationStatus;
  validFrom: string;
  validUntil: string;
  verificationId: string;
  verificationUrl: string;
  scorecard: TrustScorecard;
  riskClass: RiskLevel;
  controls: string[];
  monitoringPolicy: MonitoringPolicy;
  renewalPolicy: RenewalPolicy;
  durationMonths: number;
}

export interface MonitoringPolicy {
  intervalHours: number;
  alertThresholds: Record<string, number>;
  autoRevalidation: boolean;
}

export interface RenewalPolicy {
  autoRenew: boolean;
  gracePeriodDays: number;
  requiresRevalidation: boolean;
}

export interface MonitoringEvent {
  id: string;
  systemId: string;
  type:
    | 'hallucination_rate'
    | 'drift'
    | 'reliability'
    | 'policy_violation'
    | 'performance'
    | 'confidence_drop'
    | 'model_change'
    | 'provider_change'
    | 'score_degradation';
  severity: RiskLevel;
  details: Record<string, unknown>;
  timestamp: string;
  triggersRevalidation?: boolean;
  alertSent?: boolean;
}

export interface VerificationRecord {
  verificationId: string;
  companyName: string;
  productName: string;
  certificationStatus: CertificationStatus;
  trustScore: number;
  riskLevel: RiskLevel;
  certificationLevel?: CertificationLevel;
  scope: string;
  validFrom?: string;
  validUntil?: string;
  issuedAt: string;
  publicStatus: 'active' | 'expired' | 'revoked' | 'under_review';
}

export interface Badge {
  id: string;
  systemId: string;
  certificationId: string;
  level: CertificationLevel;
  trustScore: number;
  verificationId: string;
  verificationUrl: string;
  svgStub: string;
  pngStubUrl: string;
  qrMetadata: { url: string; issuedAt: string };
  embedCodes: { html: string; markdown: string; iframe: string };
}

export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  resourceType: 'system' | 'validation' | 'certification' | 'monitoring' | 'badge' | 'report';
  resourceId: string;
  timestamp: string;
  immutableHash: string;
  metadata?: Record<string, unknown>;
}

export interface RiskAssessment {
  systemId: string;
  overallRisk: RiskLevel;
  riskScore: number;
  factors: Array<{ name: string; score: number; weight: number; description: string }>;
  complianceFrameworks: ComplianceFrameworkStatus[];
  recommendations: string[];
  assessedAt: string;
}

export interface ComplianceFrameworkStatus {
  framework: 'ISO_42001' | 'ISO_27001' | 'SOC2' | 'GDPR' | 'NIS2' | 'DORA';
  status: 'compliant' | 'partial' | 'non_compliant' | 'not_assessed';
  controlsPassed: number;
  controlsTotal: number;
  notes?: string;
}

export interface TrustReport {
  id: string;
  systemId: string;
  type: 'executive' | 'technical' | 'risk' | 'compliance';
  title: string;
  generatedAt: string;
  sections: Array<{ heading: string; content: string; score?: number }>;
  recommendations: string[];
}

export interface TrustDashboard {
  certifiedSystems: number;
  activeMonitoring: number;
  expiringCerts: Certification[];
  validationRuns: ValidationRun[];
  riskDistribution: Record<RiskLevel, number>;
  averageTrustScore: number;
  failedValidations: number;
  recentReports: TrustReport[];
  recentAlerts: MonitoringEvent[];
}

export interface ValidateRequest {
  systemId: string;
  testSuiteId?: string;
  testScenarios?: TestScenario[];
  certificationLevel: CertificationLevel;
  dimensions?: ValidationDimension[];
  userId: string;
  tenantId: string;
  tier: string;
}

export interface CertifyRequest {
  systemId: string;
  level: CertificationLevel;
  validationRunId: string;
  userId: string;
  tenantId: string;
  tier: string;
}

export interface TrustMembershipLimits {
  validationsPerMonth: number;
  monitoringTier: 'none' | 'basic' | 'standard' | 'enterprise';
  maxCertLevel: CertificationLevel;
  reportsPerMonth: number;
}
