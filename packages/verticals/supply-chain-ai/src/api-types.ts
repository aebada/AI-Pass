import type {
  ScApproval,
  ScAuditLog,
  Artifact,
  Decision,
  Evaluation,
  Offer,
  ProcurementPolicy,
  Requirement,
  SourcingEvent,
  Supplier,
} from './types.js';
import type { DashboardStats } from './demo-data.js';

export interface CreateSourcingRequest {
  tenantId: string;
  userId: string;
  title: string;
  category: string;
  department: string;
  deadline: string;
  currency: string;
  budgetCap?: number;
  requirements?: Requirement[];
  requirementsNL?: string;
}

export interface CreateSourcingResponse {
  event: SourcingEvent;
  creditsUsed: number;
}

export interface SourcingListResponse {
  events: SourcingEvent[];
  total: number;
}

export interface UploadOfferRequest {
  tenantId: string;
  userId: string;
  eventId: string;
  fileName: string;
  mimeType: string;
  supplierId?: string;
  supplierName?: string;
  manualFields?: Record<string, unknown>;
}

export interface UploadOfferResponse {
  offer: Offer;
  parseConfidence: number;
  creditsUsed: number;
  liveSyncEventId?: string;
}

export interface OfferListResponse {
  offers: Offer[];
  total: number;
}

export interface RunEvaluationRequest {
  tenantId: string;
  userId: string;
  eventId: string;
  scoringTemplateId?: string;
}

export interface RunEvaluationResponse {
  evaluation: Evaluation;
  creditsUsed: number;
  liveSyncEventId?: string;
}

export interface EvaluationListResponse {
  evaluations: Evaluation[];
}

export interface ChatRequest {
  tenantId: string;
  userId: string;
  query: string;
  eventId?: string;
  language?: string;
}

export interface ChatResponse {
  answer: string;
  sources: Array<{ type: string; id: string; label: string }>;
  creditsUsed: number;
  language: string;
}

export interface ReportRequest {
  tenantId: string;
  userId: string;
  evaluationId: string;
  type: Artifact['type'];
}

export interface ReportResponse {
  artifact: Artifact;
  creditsUsed: number;
}

export interface ApprovalRequest {
  tenantId: string;
  approvalId: string;
  approverId: string;
  approverName: string;
  comment?: string;
  action: 'approve' | 'reject';
}

export interface ApprovalResponse {
  approval: ScApproval;
  decision?: Decision;
  auditLog: ScAuditLog;
}

export interface SupplierListResponse {
  suppliers: Supplier[];
}

export interface PolicyListResponse {
  policies: ProcurementPolicy[];
}

export interface DashboardResponse {
  stats: DashboardStats;
}

export interface ApiErrorBody {
  error: string;
  code?: string;
}
