import { createId, type AgentDecision } from '@ai-pass/shared';
import type { Approval, AuditLog, FraudAlert, Invoice, InvoiceAutomationPack, InvoiceWorkflow, ValidationResult, Vendor } from '@ai-pass/shared/invoice-ai';
import type { MembershipTier, RAGResponse } from '@ai-pass/shared';
import { getKnowledgePlatform } from '@ai-pass/knowledge-pipeline';
import { defaultWalletService } from '@ai-pass/wallet';
import type {
  ApprovalActionResponse,
  ChatQueryResponse,
  DashboardStats,
  InvoiceDetailResponse,
  UploadInvoiceResponse,
  ValidateInvoiceResponse,
} from '../api-types.js';
import {
  DEMO_APPROVALS,
  DEMO_AUDIT_LOGS,
  DEMO_AUTOMATION_PACKS,
  DEMO_FRAUD_ALERTS,
  DEMO_INVOICES,
  DEMO_VALIDATIONS,
  DEMO_VENDORS,
  DEMO_WORKFLOWS,
  getDashboardStats,
} from '../demo-data.js';
import { emitInvoiceUploaded } from '../livesync.js';
import { canAccessFraudCenter, canAccessInvoiceAI } from '../membership-gates.js';
import { ApprovalEngine } from './approval-engine.js';
import { FraudEngine } from './fraud-engine.js';
import { OcrService } from './ocr-service.js';
import { ValidationEngine } from './validation-engine.js';
import { defaultERPService } from './erp-service.js';

export class InvoiceAIService {
  private invoices = new Map<string, Invoice>();
  private vendors = new Map<string, Vendor>();
  private validations = new Map<string, ValidationResult>();
  private fraudAlerts = new Map<string, FraudAlert>();
  private approvals = new Map<string, Approval>();
  private workflows = new Map<string, InvoiceWorkflow>();
  private auditLogs: AuditLog[] = [];
  private ocr = new OcrService();
  private validation = new ValidationEngine();
  private fraud = new FraudEngine();
  private approval = new ApprovalEngine();

  constructor(seedDemo = true) {
    if (seedDemo) this.seedDemoData();
  }

  private seedDemoData(): void {
    for (const v of DEMO_VENDORS) this.vendors.set(v.id, v);
    for (const i of DEMO_INVOICES) this.invoices.set(i.id, i);
    for (const v of DEMO_VALIDATIONS) this.validations.set(v.id, v);
    for (const f of DEMO_FRAUD_ALERTS) this.fraudAlerts.set(f.id, f);
    for (const a of DEMO_APPROVALS) this.approvals.set(a.id, a);
    for (const w of DEMO_WORKFLOWS) this.workflows.set(w.id, w);
    this.auditLogs = [...DEMO_AUDIT_LOGS];
  }

  getDashboard(tenantId: string): DashboardStats {
    const invoices = this.listInvoices(tenantId);
    const fraud = this.listFraudAlerts(tenantId);
    const vendors = this.listVendors(tenantId);
    return getDashboardStats(invoices, fraud, vendors);
  }

  listInvoices(tenantId: string): Invoice[] {
    return [...this.invoices.values()].filter((i) => i.tenantId === tenantId);
  }

  getInvoice(id: string): Invoice | undefined {
    return this.invoices.get(id);
  }

  getInvoiceDetail(id: string): InvoiceDetailResponse | undefined {
    const invoice = this.invoices.get(id);
    if (!invoice) return undefined;

    const validation = [...this.validations.values()].find((v) => v.invoiceId === id);
    const approvals = [...this.approvals.values()].filter((a) => a.invoiceId === id);
    const fraudAlerts = [...this.fraudAlerts.values()].filter((f) => f.invoiceId === id);
    const auditLogs = this.auditLogs.filter((a) => a.entityId === id || a.details.invoiceId === id);

    return { invoice, validation, approvals, fraudAlerts, auditLogs };
  }

  listVendors(tenantId: string): Vendor[] {
    return [...this.vendors.values()].filter((v) => v.tenantId === tenantId);
  }

  listFraudAlerts(tenantId: string): FraudAlert[] {
    return [...this.fraudAlerts.values()].filter((f) => f.tenantId === tenantId);
  }

  listApprovals(tenantId: string, status?: Approval['status']): Approval[] {
    return [...this.approvals.values()].filter(
      (a) => a.tenantId === tenantId && (!status || a.status === status),
    );
  }

  listWorkflows(tenantId: string): InvoiceWorkflow[] {
    return [...this.workflows.values()].filter((w) => w.tenantId === tenantId);
  }

  listAutomationPacks(): InvoiceAutomationPack[] {
    return DEMO_AUTOMATION_PACKS;
  }

  async upload(params: {
    tenantId: string;
    userId: string;
    fileName: string;
    mimeType: string;
    tier: MembershipTier;
  }): Promise<UploadInvoiceResponse> {
    if (!canAccessInvoiceAI(params.tier)) {
      throw new Error('Invoice AI requires Professional plan or higher');
    }

    const ocrResult = this.ocr.extract(params.fileName, params.mimeType);
    const vendor = [...this.vendors.values()].find((v) => v.name === ocrResult.vendorName);

    const invoice: Invoice = {
      id: `inv_${createId()}`,
      tenantId: params.tenantId,
      invoiceNumber: ocrResult.invoiceNumber,
      vendorId: vendor?.id ?? `vnd_${createId()}`,
      vendorName: ocrResult.vendorName,
      documentType: 'invoice',
      direction: 'incoming',
      status: 'processing',
      amount: ocrResult.amount,
      currency: ocrResult.currency,
      items: ocrResult.items,
      extractedFields: ocrResult.fields,
      decision: 'NEEDS_INFO',
      uploadedAt: new Date().toISOString(),
    };

    const validationResult = this.validation.validate(invoice, vendor);
    const fraudAlerts = canAccessFraudCenter(params.tier)
      ? this.fraud.analyze(invoice, vendor, this.listInvoices(params.tenantId))
      : [];

    invoice.validationId = validationResult.id;
    invoice.decision = validationResult.decision;
    invoice.status =
      validationResult.decision === 'FAIL'
        ? 'rejected'
        : fraudAlerts.some((f) => f.severity === 'critical')
          ? 'flagged'
          : validationResult.decision === 'PASS'
            ? 'validated'
            : 'pending_approval';
    invoice.processedAt = new Date().toISOString();

    this.invoices.set(invoice.id, invoice);
    this.validations.set(validationResult.id, validationResult);
    for (const alert of fraudAlerts) this.fraudAlerts.set(alert.id, alert);

    const newApprovals = this.approval.route(invoice);
    for (const a of newApprovals) this.approvals.set(a.id, a);
    if (newApprovals.length > 0) invoice.status = 'pending_approval';

    const creditsUsed = ocrResult.creditsUsed + 3;
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: 'Invoice AI',
      model: 'ocr-stub',
      credits: creditsUsed,
      estimatedCostUsd: creditsUsed * 0.002,
      taskType: 'invoice_ocr',
      module: 'invoice-ai',
      metadata: { invoiceId: invoice.id, fileName: params.fileName },
    });

    this.logAudit({
      tenantId: params.tenantId,
      entityType: 'invoice',
      entityId: invoice.id,
      action: 'invoice.uploaded',
      actorId: params.userId,
      actorName: 'User',
      details: { fileName: params.fileName },
      creditsUsed,
    });

    const liveSyncEventId = await emitInvoiceUploaded(invoice);

    return { invoice, validation: validationResult, fraudAlerts, creditsUsed, liveSyncEventId };
  }

  validate(params: { invoiceId: string; tenantId: string; userId: string }): ValidateInvoiceResponse {
    const invoice = this.invoices.get(params.invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const vendor = this.vendors.get(invoice.vendorId);
    const validationResult = this.validation.validate(invoice, vendor);
    invoice.decision = validationResult.decision;
    invoice.validationId = validationResult.id;
    invoice.status = validationResult.passed ? 'validated' : 'pending_approval';
    this.validations.set(validationResult.id, validationResult);
    this.invoices.set(invoice.id, invoice);

    const creditsUsed = 5;
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: 'Invoice AI',
      model: 'validation-engine',
      credits: creditsUsed,
      estimatedCostUsd: 0.01,
      taskType: 'invoice_validation',
      module: 'invoice-ai',
      metadata: { invoiceId: invoice.id },
    });

    return { validation: validationResult, creditsUsed };
  }

  async approve(params: {
    invoiceId: string;
    tenantId: string;
    approverId: string;
    approverName: string;
    comment?: string;
  }): Promise<ApprovalActionResponse> {
    const invoice = this.invoices.get(params.invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const pending = [...this.approvals.values()].find(
      (a) => a.invoiceId === params.invoiceId && a.status === 'pending',
    );
    if (!pending) throw new Error('No pending approval');

    const approved = this.approval.approve(pending, params.comment);
    this.approvals.set(approved.id, approved);
    invoice.status = 'approved';
    this.invoices.set(invoice.id, invoice);

    const vendor = this.vendors.get(invoice.vendorId);
    const erpResult = await defaultERPService.pushApprovedInvoice(
      params.tenantId,
      invoice,
      vendor,
    );

    const auditLog = this.logAudit({
      tenantId: params.tenantId,
      entityType: 'approval',
      entityId: approved.id,
      action: 'invoice.approved',
      actorId: params.approverId,
      actorName: params.approverName,
      details: {
        invoiceId: invoice.id,
        amount: invoice.amount,
        erpExternalId: erpResult?.externalId,
        erpConnectionId: erpResult?.connectionId,
      },
    });

    return { approval: approved, invoice, auditLog };
  }

  reject(params: {
    invoiceId: string;
    tenantId: string;
    approverId: string;
    approverName: string;
    reason: string;
  }): ApprovalActionResponse {
    const invoice = this.invoices.get(params.invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const pending = [...this.approvals.values()].find(
      (a) => a.invoiceId === params.invoiceId && a.status === 'pending',
    );
    if (!pending) throw new Error('No pending approval');

    const rejected = this.approval.reject(pending, params.reason);
    this.approvals.set(rejected.id, rejected);
    invoice.status = 'rejected';
    invoice.decision = 'FAIL' as AgentDecision;
    this.invoices.set(invoice.id, invoice);

    const auditLog = this.logAudit({
      tenantId: params.tenantId,
      entityType: 'approval',
      entityId: rejected.id,
      action: 'invoice.rejected',
      actorId: params.approverId,
      actorName: params.approverName,
      details: { invoiceId: invoice.id, reason: params.reason },
    });

    return { approval: rejected, invoice, auditLog };
  }

  chat(params: { tenantId: string; userId: string; query: string }): ChatQueryResponse {
    const q = params.query.toLowerCase();
    const invoices = this.listInvoices(params.tenantId);
    const vendors = this.listVendors(params.tenantId);
    const fraud = this.listFraudAlerts(params.tenantId);

    let answer = 'I can help with invoice queries. Try asking about spend, pending approvals, or fraud alerts.';
    const sources: ChatQueryResponse['sources'] = [];

    if (q.includes('spend') || q.includes('total')) {
      const total = invoices.reduce((s, i) => s + i.amount, 0);
      answer = `Total invoice value across ${invoices.length} invoices: EUR ${total.toLocaleString()}.`;
      sources.push({ type: 'aggregate', id: 'spend', label: 'Invoice totals' });
    } else if (q.includes('pending') || q.includes('approval')) {
      const pending = invoices.filter((i) => i.status === 'pending_approval');
      answer = `${pending.length} invoice(s) awaiting approval: ${pending.map((i) => i.invoiceNumber).join(', ') || 'none'}.`;
      for (const i of pending) sources.push({ type: 'invoice', id: i.id, label: i.invoiceNumber });
    } else if (q.includes('fraud') || q.includes('alert')) {
      const open = fraud.filter((f) => f.status === 'open');
      answer = `${open.length} open fraud alert(s). Highest severity: ${open.sort((a, b) => b.score - a.score)[0]?.title ?? 'none'}.`;
      for (const f of open) sources.push({ type: 'fraud', id: f.id, label: f.title });
    } else if (q.includes('vendor')) {
      answer = `${vendors.length} vendors registered. Top spender: ${vendors.sort((a, b) => b.totalSpend - a.totalSpend)[0]?.name ?? 'N/A'}.`;
      sources.push({ type: 'vendor', id: 'list', label: 'Vendor registry' });
    } else {
      const rag = getKnowledgePlatform().rag.query({
        query: params.query,
        tenantId: params.tenantId,
        topK: 3,
        filters: { topic: 'finance' },
      });
      if (rag.chunks.length > 0) {
        answer = rag.chunks.map((c: RAGResponse['chunks'][number]) => c.content).join(' ');
        for (const c of rag.chunks) {
          sources.push({ type: 'knowledge', id: c.chunkId, label: String(c.citation ?? c.chunkId) });
        }
      }
    }

    const creditsUsed = 8;
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: 'Invoice AI',
      model: 'semantic-query',
      credits: creditsUsed,
      estimatedCostUsd: 0.016,
      taskType: 'invoice_chat',
      module: 'invoice-ai',
      metadata: { query: params.query },
    });

    return { answer, sources, creditsUsed };
  }

  private logAudit(entry: Omit<AuditLog, 'id' | 'timestamp'>): AuditLog {
    const log: AuditLog = {
      ...entry,
      id: `aud_${createId()}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }
}

export const defaultInvoiceAIService = new InvoiceAIService();
