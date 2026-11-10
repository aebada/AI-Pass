import type { AgentDecision } from './platform.js';

export type SourcingEventStatus =
  | 'draft'
  | 'collecting'
  | 'evaluating'
  | 'decided'
  | 'closed';

export type OfferStatus = 'draft' | 'parsed' | 'normalized' | 'evaluated' | AgentDecision;

export type ProcurementPolicyStatus = 'draft' | 'active' | 'archived';

export type ScApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

export type RuleOutcome = AgentDecision;

export interface OfferField {
  key: string;
  value: unknown;
  confidence: number;
  source: 'pdf' | 'excel' | 'csv' | 'manual' | 'erp' | 'ai';
  validation?: 'valid' | 'invalid' | 'needs_review';
  provenance?: string;
}

export interface Requirement {
  id: string;
  eventId: string;
  category: 'technical' | 'commercial' | 'compliance' | 'logistics' | 'esg';
  label: string;
  description?: string;
  mandatory: boolean;
  weight?: number;
  nlSource?: string;
}

export interface SourcingEvent {
  id: string;
  tenantId: string;
  title: string;
  category: string;
  department: string;
  deadline: string;
  currency: string;
  budgetCap?: number;
  status: SourcingEventStatus;
  requirements: Requirement[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  tenantId: string;
  name: string;
  country: string;
  taxId?: string;
  email?: string;
  certifications: string[];
  riskScore: number;
  esgScore: number;
  status: 'active' | 'blocked' | 'review';
  blacklistReason?: string;
  totalSpend: number;
  offerCount: number;
  createdAt: string;
}

export interface Offer {
  id: string;
  eventId: string;
  supplierId: string;
  supplierName: string;
  fileName?: string;
  mimeType?: string;
  fields: OfferField[];
  normalizedFields: Record<string, { value: unknown; confidence: number; provenance?: string }>;
  currency: string;
  totalPrice?: number;
  deliveryDays?: number;
  status: OfferStatus;
  overallScore?: number;
  rank?: number;
  uploadedAt: string;
  parsedAt?: string;
}

export interface ProcurementPolicy {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  version: number;
  status: ProcurementPolicyStatus;
  content: string;
  knowledgeRef?: string;
  uploadedAt: string;
}

export interface ProcurementRule {
  id: string;
  name: string;
  category: 'budget' | 'certs' | 'blacklist' | 'country' | 'delivery' | 'docs' | 'policy';
  description: string;
  severity: 'info' | 'warning' | 'error';
  enabled: boolean;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  category: ProcurementRule['category'];
  outcome: RuleOutcome;
  message: string;
  severity: ProcurementRule['severity'];
}

export interface Score {
  dimension: 'price' | 'delivery' | 'risk' | 'quality' | 'warranty' | 'esg' | 'compliance' | 'payment';
  raw: number;
  weighted: number;
  weight: number;
  rationale: string;
}

export interface Evidence {
  id: string;
  evaluationId: string;
  offerId: string;
  type: 'field' | 'policy' | 'rule' | 'agent' | 'citation';
  label: string;
  value?: unknown;
  source: string;
  confidence: number;
  policyRef?: string;
}

export interface Evaluation {
  id: string;
  eventId: string;
  tenantId: string;
  ruleSetVersion: string;
  weights: Record<string, number>;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: EvaluationResult[];
  agentResults: AgentEvaluationResult[];
  recommendedOfferId?: string;
  trustScore?: number;
  startedAt: string;
  completedAt?: string;
}

export interface EvaluationResult {
  offerId: string;
  supplierId: string;
  supplierName: string;
  decision: AgentDecision;
  score: number;
  scores: Score[];
  ruleResults: RuleResult[];
  reasons: string[];
  evidenceIds: string[];
  rank?: number;
}

export interface AgentEvaluationResult {
  agentType: string;
  agentName: string;
  offerId: string;
  decision: AgentDecision;
  confidence: number;
  summary: string;
  citations: string[];
  creditsUsed: number;
}

export interface Decision {
  id: string;
  eventId: string;
  evaluationId: string;
  recommendedOfferId: string;
  awardedOfferId?: string;
  status: 'proposed' | 'approved' | 'rejected';
  rationale: string;
  trustScore: number;
  createdAt: string;
}

export interface ScApproval {
  id: string;
  tenantId: string;
  eventId: string;
  decisionId: string;
  approverId: string;
  approverName: string;
  level: number;
  status: ScApprovalStatus;
  comment?: string;
  requestedAt: string;
  decidedAt?: string;
}

export interface ScAuditLog {
  id: string;
  tenantId: string;
  entityType: 'event' | 'offer' | 'evaluation' | 'decision' | 'approval' | 'policy' | 'supplier';
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  details: Record<string, unknown>;
  creditsUsed?: number;
  timestamp: string;
}

export interface Artifact {
  id: string;
  evaluationId: string;
  type: 'report' | 'comparison' | 'evidence_pack' | 'decision_memo';
  title: string;
  format: 'json' | 'pdf' | 'xlsx';
  url?: string;
  createdAt: string;
}

export interface ScoringTemplate {
  id: string;
  name: string;
  weights: Record<Score['dimension'], number>;
}

/** @deprecated Use SourcingEvent from supply-chain-ai */
export type LegacySourcingEvent = Pick<SourcingEvent, 'id' | 'tenantId' | 'category' | 'department' | 'deadline' | 'currency' | 'status' | 'createdAt'>;
