import type { InvoiceDetailResponse } from '@ai-pass/invoice-ai';
import type { AuditLog, InvoiceStatus } from '@ai-pass/shared/invoice-ai';

export type LifecycleStageId =
  | 'uploaded'
  | 'ocr'
  | 'validate'
  | 'fraud'
  | 'compliance'
  | 'controller'
  | 'decision'
  | 'bookkeeping'
  | 'erp'
  | 'paid';

export type LifecycleStageState = 'completed' | 'current' | 'pending' | 'failed';

export interface LifecycleStage {
  id: LifecycleStageId;
  label: string;
  state: LifecycleStageState;
  timestamp?: string;
}

export type RecommendationTone = 'approve' | 'deny' | 'info' | 'warn';

export interface InvoiceRecommendation {
  id: string;
  tone: RecommendationTone;
  title: string;
  detail: string;
}

const STAGE_ORDER: LifecycleStageId[] = [
  'uploaded',
  'ocr',
  'validate',
  'fraud',
  'compliance',
  'controller',
  'decision',
  'bookkeeping',
  'erp',
  'paid',
];

function findAuditTimestamp(auditLogs: AuditLog[], ...actions: string[]): string | undefined {
  const match = auditLogs.find((log) => actions.includes(log.action));
  return match?.timestamp;
}

function resolveCurrentStageIndex(detail: InvoiceDetailResponse): number {
  const { invoice, validation, fraudAlerts, compliance, approvals } = detail;
  const status = invoice.status;

  if (status === 'draft') return 0;
  if (status === 'processing') return 1;
  if (status === 'validated') {
    if (compliance.length === 0 && fraudAlerts.length === 0) return 3;
    if (compliance.length === 0) return 4;
    return 5;
  }
  if (status === 'pending_approval') return 5;
  if (status === 'flagged') return 4;
  if (status === 'rejected') return 6;
  if (status === 'approved') {
    if (detail.bookkeeping.length > 0) return 8;
    return 7;
  }
  if (status === 'paid') return 9;

  if (validation) return 2;
  if (approvals.some((a) => a.status === 'pending')) return 5;
  return 1;
}

function stageTimestamp(
  id: LifecycleStageId,
  detail: InvoiceDetailResponse,
): string | undefined {
  const { invoice, validation, auditLogs, approvals } = detail;

  switch (id) {
    case 'uploaded':
      return invoice.uploadedAt ?? findAuditTimestamp(auditLogs, 'invoice.uploaded');
    case 'ocr':
      return invoice.processedAt;
    case 'validate':
      return validation?.validatedAt;
    case 'fraud':
      return detail.fraudAlerts[0]?.createdAt;
    case 'compliance':
      return detail.compliance[0]?.checkedAt;
    case 'controller': {
      const pending = approvals.find((a) => a.status === 'pending');
      return pending?.requestedAt;
    }
    case 'decision': {
      const decided = approvals.find((a) => a.decidedAt);
      return (
        decided?.decidedAt ??
        findAuditTimestamp(auditLogs, 'invoice.approved', 'invoice.rejected')
      );
    }
    case 'bookkeeping':
      return detail.bookkeeping[0]?.postedAt;
    case 'erp':
      return findAuditTimestamp(auditLogs, 'invoice.approved');
    case 'paid':
      return invoice.status === 'paid' ? findAuditTimestamp(auditLogs, 'invoice.approved') : undefined;
    default:
      return undefined;
  }
}

function decisionLabel(status: InvoiceStatus): string {
  if (status === 'approved' || status === 'paid') return 'Approved';
  if (status === 'rejected') return 'Denied';
  return 'Approved / Denied';
}

export function computeLifecycleStages(detail: InvoiceDetailResponse): LifecycleStage[] {
  const currentIdx = resolveCurrentStageIndex(detail);
  const { invoice } = detail;
  const decisionFailed = invoice.status === 'rejected';

  return STAGE_ORDER.map((id, index) => {
    let state: LifecycleStageState = 'pending';
    if (index < currentIdx) state = 'completed';
    else if (index === currentIdx) state = decisionFailed && id === 'decision' ? 'failed' : 'current';
    else if (index > currentIdx && id === 'decision' && decisionFailed) state = 'failed';

    if (id === 'decision' && (invoice.status === 'approved' || invoice.status === 'paid')) {
      state = 'completed';
    }
    if (id === 'decision' && invoice.status === 'rejected') {
      state = 'failed';
    }

    const label = id === 'decision' ? decisionLabel(invoice.status) : formatStageLabel(id);

    return {
      id,
      label,
      state,
      timestamp: stageTimestamp(id, detail),
    };
  });
}

function formatStageLabel(id: LifecycleStageId): string {
  const labels: Record<LifecycleStageId, string> = {
    uploaded: 'Uploaded',
    ocr: 'OCR / Extract',
    validate: 'Validate',
    fraud: 'Fraud',
    compliance: 'Compliance',
    controller: 'Controller Review',
    decision: 'Approved / Denied',
    bookkeeping: 'Bookkeeping',
    erp: 'ERP',
    paid: 'Paid',
  };
  return labels[id];
}

/** Compact progress 0–1 for portfolio cards */
export function lifecycleProgress(detail: InvoiceDetailResponse): number {
  const currentIdx = resolveCurrentStageIndex(detail);
  return Math.min(1, (currentIdx + (detail.invoice.status === 'paid' ? 1 : 0.5)) / STAGE_ORDER.length);
}

export function buildInvoiceRecommendations(detail: InvoiceDetailResponse): InvoiceRecommendation[] {
  const { invoice, validation, fraudAlerts, compliance, poMatch, accountSuggestion, cashDiscount } =
    detail;
  const recs: InvoiceRecommendation[] = [];

  const openFraud = fraudAlerts.filter(
    (f) => f.status === 'open' || f.status === 'investigating',
  );
  const criticalFraud = openFraud.filter((f) => f.severity === 'critical' || f.severity === 'high');

  if (criticalFraud.length > 0) {
    recs.push({
      id: 'fraud-critical',
      tone: 'deny',
      title: 'Recommend: Deny — fraud alert open',
      detail: `${criticalFraud[0].title}: ${criticalFraud[0].description}`,
    });
  } else if (openFraud.length > 0) {
    recs.push({
      id: 'fraud-open',
      tone: 'warn',
      title: 'Recommend: Request more info',
      detail: `${openFraud.length} open fraud alert(s) require controller review before approval.`,
    });
  }

  const failedValidation = validation?.checks.filter((c) => !c.passed) ?? [];
  const errorValidation = failedValidation.filter((c) => c.severity === 'error');
  if (errorValidation.length > 0) {
    recs.push({
      id: 'validation-error',
      tone: 'deny',
      title: 'Recommend: Deny — validation failed',
      detail: errorValidation.map((c) => c.message).join('; '),
    });
  } else if (failedValidation.length > 0) {
    recs.push({
      id: 'validation-warn',
      tone: 'warn',
      title: 'Recommend: Approve with conditions',
      detail: failedValidation.map((c) => c.message).join('; '),
    });
  }

  const failedCompliance = compliance.filter((c) => !c.passed);
  if (failedCompliance.length > 0) {
    recs.push({
      id: 'compliance-fail',
      tone: 'warn',
      title: 'Recommend: Request more info',
      detail: `Compliance gaps: ${failedCompliance.map((c) => c.rule).join(', ')}.`,
    });
  }

  if (poMatch && !poMatch.matched) {
    recs.push({
      id: 'po-mismatch',
      tone: 'warn',
      title: 'Recommend: Request more info',
      detail: poMatch.message || '3-way PO match variance detected.',
    });
  }

  if (accountSuggestion && accountSuggestion.confidence < 0.75) {
    recs.push({
      id: 'account-low-confidence',
      tone: 'info',
      title: 'Recommend: Approve with conditions',
      detail: `Verify account ${accountSuggestion.account} (${(accountSuggestion.confidence * 100).toFixed(0)}% confidence).`,
    });
  }

  if (cashDiscount?.status === 'expiring_soon') {
    recs.push({
      id: 'skonto-expiring',
      tone: 'approve',
      title: 'Recommend: Approve — Skonto deadline approaching',
      detail: `${cashDiscount.discountPercent}% discount (€${cashDiscount.discountAmount.toLocaleString()}) if paid by ${cashDiscount.deadline}.`,
    });
  }

  const deepfakeScore = invoice.extractedFields?.deepfake_score?.value as number | undefined;
  if (deepfakeScore !== undefined && deepfakeScore >= 0.7) {
    recs.push({
      id: 'deepfake-high',
      tone: 'deny',
      title: 'Recommend: Deny — document authenticity risk',
      detail: `Deepfake score ${(deepfakeScore * 100).toFixed(0)}% exceeds policy threshold.`,
    });
  }

  if (recs.length === 0) {
    if (invoice.status === 'pending_approval' || invoice.status === 'flagged') {
      recs.push({
        id: 'default-approve',
        tone: 'approve',
        title: 'Recommend: Approve',
        detail: 'Validation, fraud, and compliance checks show no blocking issues.',
      });
    } else if (invoice.status === 'approved' || invoice.status === 'paid') {
      recs.push({
        id: 'already-approved',
        tone: 'info',
        title: 'Invoice approved',
        detail: 'No further controller action required.',
      });
    } else if (invoice.status === 'rejected') {
      recs.push({
        id: 'already-rejected',
        tone: 'info',
        title: 'Invoice denied',
        detail: 'This invoice was rejected and will not proceed to ERP.',
      });
    } else {
      recs.push({
        id: 'in-progress',
        tone: 'info',
        title: 'Recommend: Monitor pipeline',
        detail: 'Invoice is still processing — controller review will be available after validation.',
      });
    }
  }

  return recs;
}

export function isControllerReviewStatus(status: InvoiceStatus): boolean {
  return status === 'pending_approval' || status === 'flagged';
}

export function canTakeControllerAction(detail: InvoiceDetailResponse): boolean {
  return detail.approvals.some((a) => a.status === 'pending');
}
