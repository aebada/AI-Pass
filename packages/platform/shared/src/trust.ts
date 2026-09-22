import type { AgentDecision, CertificationLevel, CertificationStatus, RiskLevel } from './platform.js';

export interface TrustScorecard {
  functional: number;
  reliability: number;
  explainability: number;
  compliance: number;
  safety: number;
  overall: number;
}

export interface ValidationRun {
  id: string;
  systemId: string;
  status: 'queued' | 'running' | 'completed' | 'failed' | 'review_required';
  certificationLevel: CertificationLevel;
  scorecard?: TrustScorecard;
  recommendation?: AgentDecision;
  startedAt: string;
  completedAt?: string;
  failureCount: number;
  passRate: number;
}

export interface AISystemSubmission {
  id: string;
  companyName: string;
  productName: string;
  systemType: string;
  industry: string;
  useCase: string;
  deploymentType: string;
  modelsUsed: string[];
  highRiskDomain: boolean;
  status: CertificationStatus;
  createdAt: string;
}

export interface TestCase {
  id: string;
  name: string;
  input: Record<string, unknown>;
  expectedOutput?: Record<string, unknown>;
  acceptableDeviation?: number;
  severity: RiskLevel;
  suiteId?: string;
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput: Record<string, unknown>;
  deviation?: number;
  citations?: string[];
  error?: string;
}

export interface CertificationRecord {
  id: string;
  systemId: string;
  level: CertificationLevel;
  status: CertificationStatus;
  validFrom: string;
  validUntil: string;
  verificationUrl: string;
  scorecard: TrustScorecard;
  riskClass: RiskLevel;
}

export interface MonitoringEvent {
  id: string;
  systemId: string;
  type: 'drift' | 'hallucination' | 'compliance_deviation' | 'score_degradation';
  severity: RiskLevel;
  details: Record<string, unknown>;
  timestamp: string;
}

export const CERTIFICATION_THRESHOLDS: Record<
  CertificationLevel,
  { overall: number; requirements: Partial<TrustScorecard> }
> = {
  bronze: { overall: 65, requirements: {} },
  silver: { overall: 75, requirements: { reliability: 70, explainability: 65 } },
  gold: { overall: 85, requirements: { reliability: 80, compliance: 85, safety: 80 } },
  platinum: { overall: 92, requirements: { functional: 85, reliability: 85, compliance: 85, safety: 85 } },
};

export const SCORE_WEIGHTS = {
  functional: 0.3,
  reliability: 0.2,
  explainability: 0.15,
  compliance: 0.2,
  safety: 0.15,
} as const;
