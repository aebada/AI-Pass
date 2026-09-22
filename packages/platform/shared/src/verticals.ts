import type { AgentDecision } from './platform.js';

/** Customer Support AI vertical */
export interface SupportSession {
  id: string;
  tenantId: string;
  channel: 'text' | 'voice';
  language: string;
  intent?: string;
  status: 'active' | 'escalated' | 'resolved' | 'closed';
  confidence: number;
  startedAt: string;
  endedAt?: string;
}

export interface SupportSkillChain {
  skills: string[];
  escalationThreshold: number;
}

/** Invoice AI vertical — see invoice-ai.ts for full types */
export type { InvoiceDocumentType, InvoiceRecord, InvoiceAutomationPack } from './invoice-ai.js';

/** Supply Chain AI vertical */
export interface SourcingEvent {
  id: string;
  tenantId: string;
  category: string;
  department: string;
  deadline: string;
  currency: string;
  status: 'draft' | 'collecting' | 'evaluating' | 'decided' | 'closed';
  createdAt: string;
}

export interface SupplierOffer {
  id: string;
  eventId: string;
  supplierName: string;
  normalizedFields: Record<string, { value: unknown; confidence: number; provenance?: string }>;
  status: AgentDecision;
  overallScore?: number;
  rank?: number;
}

export interface EvaluationRun {
  id: string;
  eventId: string;
  ruleSetVersion: string;
  weights: Record<string, number>;
  results: Array<{
    offerId: string;
    decision: AgentDecision;
    score: number;
    reasons: string[];
    evidence: string[];
  }>;
  recommendedOfferId?: string;
  completedAt: string;
}
