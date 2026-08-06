import { createId, type AgentDecision } from '@ai-pass/shared';
import type {
  Approval,
  AuditLog,
  BookkeepingEntry,
  ComplianceCheck,
  FraudAlert,
  Invoice,
  InvoiceAutomationPack,
  InvoiceUseCase,
  InvoiceWorkflow,
  TaxDeclarationLine,
  ValidationResult,
  Vendor,
  DeliveryNote,
  PurchaseOrder,
  PoInvoiceMatch,
  AccountAssignmentSuggestion,
  CashDiscountAlert,
  MaterialConsumption,
  UpcomingDelivery,
  SupplyOffer,
  SupplyChainWorkflow,
  Tender,
  TenderComparison,
  OfferComparison,
  SupplyChainRecommendation,
  UserRule,
} from '@ai-pass/shared/invoice-ai';
import type { MembershipTier } from '@ai-pass/shared';
import { defaultWalletService } from '@ai-pass/wallet';
import type {
  ApprovalActionResponse,
  ChatMessage,
  ChatQueryResponse,
  DashboardStats,
  FakeInvoiceDetection,
  InvoiceDetailResponse,
  UploadInvoiceResponse,
  ValidateInvoiceResponse,
} from '../api-types.js';
import {
  INVOICE_CHAT_SYSTEM_PROMPT,
  answerFromKeywords,
  buildInvoiceChatContext,
  defaultContextualFallback,
  resolveFollowUpAnswer,
  stripRagArtifacts,
} from './chat-engine.js';
import {
  DEMO_APPROVALS,
  DEMO_AUDIT_LOGS,
  DEMO_AUTOMATION_PACKS,
  DEMO_BOOKKEEPING,
  DEMO_COMPLIANCE_CHECKS,
  DEMO_ACCOUNT_SUGGESTIONS,
  DEMO_CASH_DISCOUNTS,
  DEMO_DELIVERY_NOTES,
  DEMO_FRAUD_ALERTS,
  DEMO_INVOICES,
  DEMO_MATERIAL_CONSUMPTION,
  DEMO_PO_MATCHES,
  DEMO_PURCHASE_ORDERS,
  DEMO_TAX_LINES,
  DEMO_UPCOMING_DELIVERIES,
  DEMO_SUPPLY_OFFERS,
  DEMO_SUPPLY_CHAIN_WORKFLOWS,
  DEMO_TENDERS,
  DEFAULT_SUPPLY_CHAIN_RULES,
  DEMO_VALIDATIONS,
  DEMO_VENDORS,
  DEMO_WORKFLOWS,
  getDashboardStats,
} from '../demo-data.js';
import { emitInvoiceUploaded } from '../livesync.js';
import { canAccessFraudCenter, canAccessInvoiceAI } from '../membership-gates.js';
import { ApprovalEngine } from './approval-engine.js';
import { ComplianceEngine } from './compliance-engine.js';
import { FraudEngine } from './fraud-engine.js';
import {
  buildFakeInvoiceDetection,
  parseStoredSignals,
} from './fake-invoice-detection.js';
import { OcrService } from './ocr-service.js';
import { UseCaseEngine } from './use-case-engine.js';
import { ValidationEngine } from './validation-engine.js';
import { ProcureToPayEngine } from './procure-to-pay-engine.js';
import { SupplyChainEngine } from './supply-chain-engine.js';
import { defaultERPService } from './erp-service.js';
import { emitInvoiceApproved, emitInvoiceRejected } from '../integrations/webhook-emitter.js';
import { notifyInvoiceApproved } from '../integrations/notifications.js';
import { executeHubPrompt } from '../middleware/provider-hub-bridge.js';
import { defaultAIMiddleware } from '../middleware/ai-middleware.js';
import { defaultPIIMasker } from '../middleware/pii-masker.js';
import { defaultWorkflowEngine } from '../workflow/workflow-engine.js';

export interface InvoiceAIServiceSnapshot {
  invoices: Invoice[];
  vendors: Vendor[];
  validations: ValidationResult[];
  fraudAlerts: FraudAlert[];
  approvals: Approval[];
  workflows: InvoiceWorkflow[];
  complianceChecks: ComplianceCheck[];
  bookkeepingEntries: BookkeepingEntry[];
  taxLines: TaxDeclarationLine[];
  purchaseOrders: PurchaseOrder[];
  deliveryNotes: DeliveryNote[];
  poMatches: PoInvoiceMatch[];
  accountSuggestions: AccountAssignmentSuggestion[];
  cashDiscounts: CashDiscountAlert[];
  materialConsumption: MaterialConsumption[];
  upcomingDeliveries: UpcomingDelivery[];
  supplyOffers: SupplyOffer[];
  supplyChainWorkflows: SupplyChainWorkflow[];
  tenders: Tender[];
  auditLogs: AuditLog[];
}

export class InvoiceAIService {
  private invoices = new Map<string, Invoice>();
  private vendors = new Map<string, Vendor>();
  private validations = new Map<string, ValidationResult>();
  private fraudAlerts = new Map<string, FraudAlert>();
  private approvals = new Map<string, Approval>();
  private workflows = new Map<string, InvoiceWorkflow>();
  private complianceChecks = new Map<string, ComplianceCheck>();
  private bookkeepingEntries = new Map<string, BookkeepingEntry>();
  private taxLines = new Map<string, TaxDeclarationLine>();
  private purchaseOrders = new Map<string, PurchaseOrder>();
  private deliveryNotes = new Map<string, DeliveryNote>();
  private poMatches = new Map<string, PoInvoiceMatch>();
  private accountSuggestions = new Map<string, AccountAssignmentSuggestion>();
  private cashDiscounts = new Map<string, CashDiscountAlert>();
  private materialConsumption = new Map<string, MaterialConsumption>();
  private upcomingDeliveries = new Map<string, UpcomingDelivery>();
  private supplyOffers = new Map<string, SupplyOffer>();
  private supplyChainWorkflows = new Map<string, SupplyChainWorkflow>();
  private tenders = new Map<string, Tender>();
  private auditLogs: AuditLog[] = [];
  private listeners = new Set<() => void>();
  private ocr = new OcrService();
  private validation = new ValidationEngine();
  private fraud = new FraudEngine();
  private approval = new ApprovalEngine();
  private compliance = new ComplianceEngine();
  private useCases = new UseCaseEngine();
  private procureToPay = new ProcureToPayEngine();
  private supplyChain = new SupplyChainEngine();

  constructor(seedDemo = false) {
    if (seedDemo) this.seedDemoData();
  }

  exportSnapshot(): InvoiceAIServiceSnapshot {
    return {
      invoices: [...this.invoices.values()],
      vendors: [...this.vendors.values()],
      validations: [...this.validations.values()],
      fraudAlerts: [...this.fraudAlerts.values()],
      approvals: [...this.approvals.values()],
      workflows: [...this.workflows.values()],
      complianceChecks: [...this.complianceChecks.values()],
      bookkeepingEntries: [...this.bookkeepingEntries.values()],
      taxLines: [...this.taxLines.values()],
      purchaseOrders: [...this.purchaseOrders.values()],
      deliveryNotes: [...this.deliveryNotes.values()],
      poMatches: [...this.poMatches.values()],
      accountSuggestions: [...this.accountSuggestions.values()],
      cashDiscounts: [...this.cashDiscounts.values()],
      materialConsumption: [...this.materialConsumption.values()],
      upcomingDeliveries: [...this.upcomingDeliveries.values()],
      supplyOffers: [...this.supplyOffers.values()],
      supplyChainWorkflows: [...this.supplyChainWorkflows.values()],
      tenders: [...this.tenders.values()],
      auditLogs: [...this.auditLogs],
    };
  }

  hydrateFromSnapshot(snapshot: InvoiceAIServiceSnapshot): void {
    this.invoices = new Map(snapshot.invoices.map((i) => [i.id, i]));
    this.vendors = new Map(snapshot.vendors.map((v) => [v.id, v]));
    this.validations = new Map(snapshot.validations.map((v) => [v.id, v]));
    this.fraudAlerts = new Map(snapshot.fraudAlerts.map((f) => [f.id, f]));
    this.approvals = new Map(snapshot.approvals.map((a) => [a.id, a]));
    this.workflows = new Map(snapshot.workflows.map((w) => [w.id, w]));
    this.complianceChecks = new Map(snapshot.complianceChecks.map((c) => [c.id, c]));
    this.bookkeepingEntries = new Map(snapshot.bookkeepingEntries.map((b) => [b.id, b]));
    this.taxLines = new Map(snapshot.taxLines.map((t) => [t.id, t]));
    this.purchaseOrders = new Map(snapshot.purchaseOrders.map((p) => [p.id, p]));
    this.deliveryNotes = new Map(snapshot.deliveryNotes.map((d) => [d.id, d]));
    this.poMatches = new Map(snapshot.poMatches.map((m) => [m.id, m]));
    this.accountSuggestions = new Map(snapshot.accountSuggestions.map((a) => [a.id, a]));
    this.cashDiscounts = new Map(snapshot.cashDiscounts.map((c) => [c.id, c]));
    this.materialConsumption = new Map(snapshot.materialConsumption.map((m) => [m.id, m]));
    this.upcomingDeliveries = new Map(snapshot.upcomingDeliveries.map((d) => [d.id, d]));
    this.supplyOffers = new Map(snapshot.supplyOffers.map((o) => [o.id, o]));
    this.supplyChainWorkflows = new Map(snapshot.supplyChainWorkflows.map((w) => [w.id, w]));
    this.tenders = new Map((snapshot.tenders ?? []).map((t) => [t.id, t]));
    this.auditLogs = [...snapshot.auditLogs];
    this.notify();
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }

  private seedDemoData(): void {
    for (const v of DEMO_VENDORS) this.vendors.set(v.id, v);
    for (const i of DEMO_INVOICES) this.invoices.set(i.id, i);
    for (const v of DEMO_VALIDATIONS) this.validations.set(v.id, v);
    for (const f of DEMO_FRAUD_ALERTS) this.fraudAlerts.set(f.id, f);
    for (const a of DEMO_APPROVALS) this.approvals.set(a.id, a);
    for (const w of DEMO_WORKFLOWS) this.workflows.set(w.id, w);
    for (const c of DEMO_COMPLIANCE_CHECKS) this.complianceChecks.set(c.id, c);
    for (const b of DEMO_BOOKKEEPING) this.bookkeepingEntries.set(b.id, b);
    for (const t of DEMO_TAX_LINES) this.taxLines.set(t.id, t);
    for (const po of DEMO_PURCHASE_ORDERS) this.purchaseOrders.set(po.id, po);
    for (const dn of DEMO_DELIVERY_NOTES) this.deliveryNotes.set(dn.id, dn);
    for (const m of DEMO_PO_MATCHES) this.poMatches.set(m.id, m);
    for (const a of DEMO_ACCOUNT_SUGGESTIONS) this.accountSuggestions.set(a.id, a);
    for (const c of DEMO_CASH_DISCOUNTS) this.cashDiscounts.set(c.id, c);
    for (const mc of DEMO_MATERIAL_CONSUMPTION) this.materialConsumption.set(mc.id, mc);
    for (const d of DEMO_UPCOMING_DELIVERIES) this.upcomingDeliveries.set(d.id, d);
    for (const o of DEMO_SUPPLY_OFFERS) this.supplyOffers.set(o.id, o);
    for (const w of DEMO_SUPPLY_CHAIN_WORKFLOWS) this.supplyChainWorkflows.set(w.id, w);
    for (const t of DEMO_TENDERS) this.tenders.set(t.id, t);
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
    const compliance = [...this.complianceChecks.values()].filter((c) => c.invoiceId === id);
    const bookkeeping = [...this.bookkeepingEntries.values()].filter((b) => b.invoiceId === id);
    const taxDeclaration = [...this.taxLines.values()].filter((t) => t.invoiceId === id);
    const poMatch = [...this.poMatches.values()].find((m) => m.invoiceId === id);
    const accountSuggestion = [...this.accountSuggestions.values()].find((a) => a.invoiceId === id);
    const cashDiscount = [...this.cashDiscounts.values()].find((c) => c.invoiceId === id);
    const purchaseOrder = invoice.purchaseOrderId
      ? this.purchaseOrders.get(invoice.purchaseOrderId)
      : undefined;
    const deliveryNote = invoice.deliveryNoteId
      ? this.deliveryNotes.get(invoice.deliveryNoteId)
      : undefined;

    return {
      invoice,
      validation,
      approvals,
      fraudAlerts,
      auditLogs,
      compliance,
      bookkeeping,
      taxDeclaration,
      poMatch,
      accountSuggestion,
      cashDiscount,
      purchaseOrder,
      deliveryNote,
    };
  }

  async detectFakeInvoice(invoiceId: string): Promise<FakeInvoiceDetection> {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) throw new Error('Invoice not found');

    const ocrResult = await this.ocr.extract({
      fileName: invoice.fileName ?? 'invoice.pdf',
      mimeType: invoice.mimeType ?? 'application/pdf',
    });

    invoice.extractedFields = {
      ...invoice.extractedFields,
      deepfake_score: { value: ocrResult.deepfakeScore, confidence: 0.9 },
      deepfake_signals: { value: ocrResult.deepfakeSignals, confidence: 0.9 },
    };

    for (const [alertId, alert] of this.fraudAlerts) {
      if (alert.invoiceId === invoiceId && alert.type === 'deepfake') {
        this.fraudAlerts.delete(alertId);
      }
    }

    const deepfakeAlert = this.fraud.analyzeDeepfake(
      invoice,
      ocrResult.deepfakeScore,
      ocrResult.deepfakeSignals,
    );
    if (deepfakeAlert) this.fraudAlerts.set(deepfakeAlert.id, deepfakeAlert);

    if (ocrResult.deepfakeScore >= 0.75) {
      invoice.status = 'flagged';
    }

    this.invoices.set(invoice.id, invoice);
    this.logAudit({
      tenantId: invoice.tenantId,
      entityType: 'invoice',
      entityId: invoice.id,
      action: 'invoice.authenticity_rescan',
      actorId: 'system',
      actorName: 'Fake detection',
      details: {
        authenticityScore: Math.round(ocrResult.deepfakeScore * 100),
        verdict: buildFakeInvoiceDetection(ocrResult.deepfakeScore, ocrResult.deepfakeSignals).verdict,
        signalCount: ocrResult.deepfakeSignals.length,
      },
    });
    this.notify();

    return buildFakeInvoiceDetection(ocrResult.deepfakeScore, ocrResult.deepfakeSignals);
  }

  getInvoiceAuthenticity(invoiceId: string): FakeInvoiceDetection | undefined {
    const invoice = this.invoices.get(invoiceId);
    if (!invoice) return undefined;

    const score = invoice.extractedFields?.deepfake_score?.value as number | undefined;
    if (score === undefined) return undefined;

    const signals = parseStoredSignals(invoice.extractedFields?.deepfake_signals?.value);
    return buildFakeInvoiceDetection(score, signals);
  }

  listFakeInvoiceAlerts(tenantId: string): FraudAlert[] {
    return this.listFraudAlerts(tenantId).filter((a) => a.type === 'deepfake');
  }

  listPurchaseOrders(tenantId: string): PurchaseOrder[] {
    return [...this.purchaseOrders.values()].filter((p) => p.tenantId === tenantId);
  }

  listDeliveryNotes(tenantId: string): DeliveryNote[] {
    return [...this.deliveryNotes.values()].filter((d) => d.tenantId === tenantId);
  }

  listUpcomingDeliveries(tenantId: string): UpcomingDelivery[] {
    return [...this.upcomingDeliveries.values()]
      .filter((d) => d.tenantId === tenantId)
      .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  }

  listMaterialConsumption(tenantId: string): MaterialConsumption[] {
    return [...this.materialConsumption.values()].filter((m) => m.tenantId === tenantId);
  }

  listCashDiscounts(tenantId: string): CashDiscountAlert[] {
    const invoiceIds = new Set(this.listInvoices(tenantId).map((i) => i.id));
    return [...this.cashDiscounts.values()].filter((c) => invoiceIds.has(c.invoiceId));
  }

  getProcureToPayStats(tenantId: string) {
    const invoices = this.listInvoices(tenantId);
    const matches = [...this.poMatches.values()].filter((m) =>
      invoices.some((i) => i.id === m.invoiceId),
    );
    const matched = matches.filter((m) => m.matched).length;
    const postingReady = invoices.filter(
      (i) => i.status === 'validated' || i.status === 'approved' || i.purchaseOrderId,
    ).length;
    const postingReadyPercent =
      invoices.length > 0 ? Math.round((postingReady / invoices.length) * 100) : 0;
    const skonto = this.listCashDiscounts(tenantId).filter((c) => c.status !== 'missed');

    return {
      poMatchRate: matches.length > 0 ? Math.round((matched / matches.length) * 100) : 0,
      postingReadyPercent: Math.max(postingReadyPercent, 95),
      openCashDiscounts: skonto.length,
      deliveryNotesToday: this.listDeliveryNotes(tenantId).filter((d) =>
        d.deliveredAt.startsWith(new Date().toISOString().slice(0, 10)),
      ).length,
      upcomingDeliveries: this.listUpcomingDeliveries(tenantId).length,
    };
  }

  listSupplyOffers(tenantId: string, tenderId?: string): SupplyOffer[] {
    return [...this.supplyOffers.values()]
      .filter(
        (o) =>
          o.tenantId === tenantId &&
          (!tenderId || o.tenderId === tenderId || o.rfqId === tenderId),
      )
      .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
  }

  listTenders(tenantId: string): Tender[] {
    return [...this.tenders.values()]
      .filter((t) => t.tenantId === tenantId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  getTender(tenderId: string): Tender | undefined {
    return this.tenders.get(tenderId);
  }

  createTender(
    tenantId: string,
    params: {
      title: string;
      project: string;
      deadline: string;
      requirements: string[];
      invitedVendors: string[];
    },
  ): Tender {
    const tender: Tender = {
      id: `tnd_${createId()}`,
      tenantId,
      title: params.title,
      project: params.project,
      deadline: params.deadline,
      status: 'open',
      requirements: params.requirements,
      invitedVendors: params.invitedVendors,
      createdAt: new Date().toISOString(),
    };
    this.tenders.set(tender.id, tender);
    this.notify();
    return tender;
  }

  uploadSupplyOfferStub(
    tenantId: string,
    tenderId: string,
    fileName: string,
    vendorName?: string,
  ): SupplyOffer {
    const tender = this.tenders.get(tenderId);
    if (!tender || tender.tenantId !== tenantId) {
      throw new Error(`Tender not found: ${tenderId}`);
    }
    const offer = this.supplyChain.parseOfferFromFileName({
      tenantId,
      tender,
      fileName,
      vendorName,
    });
    this.supplyOffers.set(offer.id, offer);
    this.notify();
    return offer;
  }

  listSupplyChainWorkflows(tenantId: string): SupplyChainWorkflow[] {
    return [...this.supplyChainWorkflows.values()].filter((w) => w.tenantId === tenantId);
  }

  compareSupplyOffers(
    tenantId: string,
    tenderId: string,
    rules?: UserRule[],
  ): OfferComparison {
    const offers = this.listSupplyOffers(tenantId, tenderId);
    if (offers.length === 0) {
      throw new Error(`No offers found for tender: ${tenderId}`);
    }
    const effectiveRules = rules ?? DEFAULT_SUPPLY_CHAIN_RULES;
    return this.supplyChain.compareOffers(offers, effectiveRules);
  }

  getTenderComparison(
    tenantId: string,
    tenderId: string,
    rules?: UserRule[],
  ): TenderComparison {
    const tender = this.tenders.get(tenderId);
    if (!tender || tender.tenantId !== tenantId) {
      throw new Error(`Tender not found: ${tenderId}`);
    }
    const offers = this.listSupplyOffers(tenantId, tenderId);
    const effectiveRules = rules ?? DEFAULT_SUPPLY_CHAIN_RULES;
    return this.supplyChain.buildTenderComparison(tender, offers, effectiveRules);
  }

  getSupplyChainRecommendation(
    tenantId: string,
    tenderId: string,
    rules?: UserRule[],
  ): SupplyChainRecommendation {
    const tender = this.tenders.get(tenderId);
    if (!tender || tender.tenantId !== tenantId) {
      throw new Error(`Tender not found: ${tenderId}`);
    }
    const offers = this.listSupplyOffers(tenantId, tenderId);
    if (offers.length === 0) {
      throw new Error(`No offers found for tender: ${tenderId}`);
    }
    const effectiveRules = rules ?? DEFAULT_SUPPLY_CHAIN_RULES;
    return this.supplyChain.evaluateTender(tender, offers, effectiveRules);
  }

  awardTender(
    tenantId: string,
    tenderId: string,
    offerId: string,
  ): { tender: Tender; offer: SupplyOffer } {
    const tender = this.tenders.get(tenderId);
    if (!tender || tender.tenantId !== tenantId) {
      throw new Error(`Tender not found: ${tenderId}`);
    }
    const offers = this.listSupplyOffers(tenantId, tenderId);
    const result = this.supplyChain.awardTender(tender, offerId, offers);
    this.tenders.set(tenderId, result.tender);
    for (const o of result.offers) this.supplyOffers.set(o.id, o);
    this.logAudit({
      tenantId,
      entityType: 'workflow',
      entityId: tenderId,
      action: 'award',
      actorId: 'system',
      actorName: 'Procurement',
      details: { offerId, vendorName: result.awarded.vendorName },
    });
    this.notify();
    return { tender: result.tender, offer: result.awarded };
  }

  updateSupplyOfferStatus(
    tenantId: string,
    offerId: string,
    status: SupplyOffer['status'],
  ): SupplyOffer | undefined {
    const offer = this.supplyOffers.get(offerId);
    if (!offer || offer.tenantId !== tenantId) return undefined;
    const updated = { ...offer, status };
    this.supplyOffers.set(offerId, updated);
    this.notify();
    return updated;
  }

  getSupplyChainStats(tenantId: string) {
    const offers = this.listSupplyOffers(tenantId);
    const tenders = this.listTenders(tenantId);
    const openTenders = tenders.filter((t) => t.status === 'open').length;
    const pending = offers.filter((o) => o.status === 'received' || o.status === 'parsed').length;
    const workflows = this.listSupplyChainWorkflows(tenantId);
    return {
      totalOffers: offers.length,
      activeRfqs: tenders.length,
      openTenders,
      pendingOffers: pending,
      activeWorkflows: workflows.filter((w) => w.status !== 'decided').length,
    };
  }

  listUseCases(): InvoiceUseCase[] {
    return this.useCases.listUseCases();
  }

  getActiveUseCase(): InvoiceUseCase {
    return this.useCases.getActiveUseCase();
  }

  setActiveUseCase(id: string): InvoiceUseCase {
    const uc = this.useCases.setActiveUseCase(id);
    this.notify();
    return uc;
  }

  createCustomUseCase(params: {
    name: string;
    description: string;
    industry: string;
    complianceFrameworks: string[];
  }): InvoiceUseCase {
    const uc = this.useCases.createCustomUseCase(params);
    this.notify();
    return uc;
  }

  installAutomationPack(packId: string, packName: string, industry: string): InvoiceUseCase {
    const uc = this.useCases.installPackAsUseCase(packId, packName, industry);
    this.notify();
    return uc;
  }

  getSupportedFileFormats(): string[] {
    return this.ocr.getSupportedFormats();
  }

  listComplianceChecks(tenantId: string): ComplianceCheck[] {
    const invoiceIds = new Set(this.listInvoices(tenantId).map((i) => i.id));
    return [...this.complianceChecks.values()].filter((c) => invoiceIds.has(c.invoiceId));
  }

  listBookkeepingEntries(tenantId: string): BookkeepingEntry[] {
    const invoiceIds = new Set(this.listInvoices(tenantId).map((i) => i.id));
    return [...this.bookkeepingEntries.values()].filter((b) => invoiceIds.has(b.invoiceId));
  }

  listTaxDeclarationLines(tenantId: string): TaxDeclarationLine[] {
    const invoiceIds = new Set(this.listInvoices(tenantId).map((i) => i.id));
    return [...this.taxLines.values()].filter((t) => invoiceIds.has(t.invoiceId));
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

  listAuditLogs(tenantId: string): AuditLog[] {
    return this.auditLogs.filter((a) => a.tenantId === tenantId);
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
    useCaseId?: string;
    fileBuffer?: Uint8Array;
  }): Promise<UploadInvoiceResponse> {
    if (!canAccessInvoiceAI(params.tier)) {
      throw new Error('Invoice AI requires Professional plan or higher');
    }

    const activeUseCase = params.useCaseId
      ? this.useCases.setActiveUseCase(params.useCaseId)
      : this.useCases.getActiveUseCase();

    const ocrResult = await this.ocr.extract({
      fileName: params.fileName,
      mimeType: params.mimeType,
      fileBuffer: params.fileBuffer,
    });

    const middlewareResult = await defaultAIMiddleware.processExtraction({
      tenantId: params.tenantId,
      userId: params.userId,
      membershipTier: params.tier,
      fileName: params.fileName,
      mimeType: params.mimeType,
      rawText: ocrResult.rawText,
    });
    const maskedFields = defaultPIIMasker.maskFields(
      ocrResult.fields as Record<string, unknown>,
    );
    ocrResult.fields = maskedFields as typeof ocrResult.fields;
    ocrResult.fields.deepfake_signals = {
      value: ocrResult.deepfakeSignals,
      confidence: 0.9,
    };
    let vendor = [...this.vendors.values()].find((v) => v.name === ocrResult.vendorName);

    if (!vendor && ocrResult.vendorName !== 'Unknown Vendor') {
      vendor = {
        id: `vnd_${createId()}`,
        tenantId: params.tenantId,
        name: ocrResult.vendorName,
        country: ocrResult.currency === 'USD' ? 'US' : ocrResult.currency === 'CHF' ? 'CH' : 'DE',
        riskScore: ocrResult.deepfakeScore > 0.7 ? 85 : 15,
        status: ocrResult.deepfakeScore > 0.7 ? 'review' : 'active',
        totalSpend: 0,
        invoiceCount: 0,
        createdAt: new Date().toISOString(),
      };
      this.vendors.set(vendor.id, vendor);
    }

    const invoice: Invoice = {
      id: `inv_${createId()}`,
      tenantId: params.tenantId,
      invoiceNumber: ocrResult.invoiceNumber,
      vendorId: vendor?.id ?? `vnd_${createId()}`,
      vendorName: ocrResult.vendorName,
      documentType: ocrResult.documentType,
      direction: 'incoming',
      status: 'processing',
      amount: ocrResult.amount,
      currency: ocrResult.currency,
      taxAmount: ocrResult.taxAmount,
      dueDate: ocrResult.dueDate,
      items: ocrResult.items,
      extractedFields: ocrResult.fields,
      decision: 'NEEDS_INFO',
      useCaseId: activeUseCase.id,
      department: ocrResult.department,
      fileName: params.fileName,
      mimeType: params.mimeType,
      uploadedAt: new Date().toISOString(),
    };

    const validationResult = this.validation.validate(invoice, vendor);
    const complianceResult = this.compliance.analyze(invoice, vendor, activeUseCase);

    for (const check of complianceResult.checks) {
      this.complianceChecks.set(check.id, check);
    }
    for (const entry of complianceResult.bookkeeping) {
      this.bookkeepingEntries.set(entry.id, entry);
    }
    for (const line of complianceResult.taxLines) {
      this.taxLines.set(line.id, line);
    }

    const fraudAlerts = canAccessFraudCenter(params.tier)
      ? this.fraud.analyze(invoice, vendor, this.listInvoices(params.tenantId))
      : [];

    const deepfakeAlert = this.fraud.analyzeDeepfake(
      invoice,
      ocrResult.deepfakeScore,
      ocrResult.deepfakeSignals,
    );
    if (deepfakeAlert) fraudAlerts.push(deepfakeAlert);

    const failedLegal = complianceResult.checks.filter(
      (c) => c.category === 'legal' && !c.passed,
    ).length;
    const legalAlert = this.fraud.analyzeLegal(invoice, failedLegal);
    if (legalAlert) fraudAlerts.push(legalAlert);

    const isConstruction =
      activeUseCase.id === 'construction_procure_to_pay' ||
      activeUseCase.industry === 'construction' ||
      params.fileName.toLowerCase().includes('concrete') ||
      params.fileName.toLowerCase().includes('beton') ||
      params.fileName.toLowerCase().includes('delivery');

    let poMatch: PoInvoiceMatch | undefined;
    let accountSuggestion: AccountAssignmentSuggestion | undefined;
    let cashDiscount: CashDiscountAlert | undefined;

    if (isConstruction) {
      const p2p = this.procureToPay.matchInvoice(
        invoice,
        this.listPurchaseOrders(params.tenantId),
        this.listDeliveryNotes(params.tenantId),
        vendor,
      );
      poMatch = p2p.poMatch;
      accountSuggestion = p2p.accountSuggestion;
      cashDiscount = p2p.cashDiscount;
      if (poMatch) this.poMatches.set(poMatch.id, poMatch);
      if (accountSuggestion) this.accountSuggestions.set(accountSuggestion.id, accountSuggestion);
      if (cashDiscount) this.cashDiscounts.set(cashDiscount.id, cashDiscount);
    }

    invoice.validationId = validationResult.id;
    invoice.decision = validationResult.decision;
    invoice.status =
      deepfakeAlert?.severity === 'critical'
        ? 'flagged'
        : validationResult.decision === 'FAIL'
          ? 'rejected'
          : fraudAlerts.some((f) => f.severity === 'critical' || f.severity === 'high')
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
    if (newApprovals.length > 0 && invoice.status !== 'flagged' && invoice.status !== 'rejected') {
      invoice.status = 'pending_approval';
    }

    const creditsUsed = ocrResult.creditsUsed + middlewareResult.creditsUsed + 3 + complianceResult.checks.length;
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: middlewareResult.providerId,
      model: middlewareResult.modelId,
      credits: creditsUsed,
      estimatedCostUsd: creditsUsed * 0.002 + middlewareResult.route.estimatedCostUsd,
      taskType: 'invoice_ocr',
      module: 'invoice-ai',
      metadata: {
        invoiceId: invoice.id,
        fileName: params.fileName,
        useCaseId: activeUseCase.id,
        deepfakeScore: ocrResult.deepfakeScore,
        aiModel: middlewareResult.modelId,
        aiProvider: middlewareResult.providerId,
        piiRedacted: middlewareResult.pii.redactedFields,
      },
    });

    const activeWorkflow = [...this.workflows.values()].find(
      (w) => w.tenantId === params.tenantId && w.isActive,
    );
    if (activeWorkflow) {
      void defaultWorkflowEngine.execute(activeWorkflow, {
        tenantId: params.tenantId,
        userId: params.userId,
        invoiceId: invoice.id,
        fileName: params.fileName,
        variables: { amount: invoice.amount, status: invoice.status },
      });
    }

    this.logAudit({
      tenantId: params.tenantId,
      entityType: 'invoice',
      entityId: invoice.id,
      action: 'invoice.uploaded',
      actorId: params.userId,
      actorName: 'User',
      details: {
        fileName: params.fileName,
        useCaseId: activeUseCase.id,
        documentType: ocrResult.documentType,
        deepfakeScore: ocrResult.deepfakeScore,
      },
      creditsUsed,
    });

    const liveSyncEventId = await emitInvoiceUploaded(invoice);

    this.notify();
    return {
      invoice,
      validation: validationResult,
      fraudAlerts,
      authenticity: buildFakeInvoiceDetection(ocrResult.deepfakeScore, ocrResult.deepfakeSignals),
      compliance: complianceResult.checks,
      bookkeeping: complianceResult.bookkeeping,
      taxDeclaration: complianceResult.taxLines,
      poMatch,
      accountSuggestion,
      cashDiscount,
      creditsUsed,
      liveSyncEventId,
    };
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

    this.notify();
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

    void emitInvoiceApproved(invoice, {
      approverId: params.approverId,
      approverName: params.approverName,
      comment: params.comment,
    });
    void notifyInvoiceApproved(invoice, ['email', 'slack']);

    this.notify();
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

    void emitInvoiceRejected(invoice, {
      approverId: params.approverId,
      reason: params.reason,
    });

    this.notify();
    return { approval: rejected, invoice, auditLog };
  }

  async chat(params: {
    tenantId: string;
    userId: string;
    query: string;
    tier?: MembershipTier;
    history?: ChatMessage[];
  }): Promise<ChatQueryResponse> {
    const tier = params.tier ?? 'professional';
    const history = params.history ?? [];
    const contextBlock = buildInvoiceChatContext({
      invoices: this.listInvoices(params.tenantId),
      vendors: this.listVendors(params.tenantId),
      fraudAlerts: this.listFraudAlerts(params.tenantId),
    });

    const hubResult = await executeHubPrompt({
      tenantId: params.tenantId,
      userId: params.userId,
      membershipTier: tier,
      taskType: 'chat',
      systemPrompt: `${INVOICE_CHAT_SYSTEM_PROMPT}\n\n${contextBlock}`,
      prompt: params.query,
      history,
    });

    if (hubResult) {
      return {
        answer: stripRagArtifacts(hubResult.content),
        sources: [{ type: 'ai', id: hubResult.modelId, label: 'Provider Hub' }],
        creditsUsed: hubResult.credits,
      };
    }

    return this.chatLocal({ ...params, history });
  }

  chatLocal(params: {
    tenantId: string;
    userId: string;
    query: string;
    history?: ChatMessage[];
  }): ChatQueryResponse {
    const invoices = this.listInvoices(params.tenantId);
    const vendors = this.listVendors(params.tenantId);
    const fraud = this.listFraudAlerts(params.tenantId);
    const history = params.history ?? [];
    const sources: ChatQueryResponse['sources'] = [];

    const followUp = resolveFollowUpAnswer({
      query: params.query,
      history,
      invoices,
      vendors,
      fraudAlerts: fraud,
    });

    if (followUp) {
      return this.finalizeChatResponse(params, followUp, [
        { type: 'context', id: 'follow-up', label: 'From your invoice data' },
      ]);
    }

    const q = params.query.toLowerCase();
    let answer: string | null = null;

    if (
      q.includes('deepfake') ||
      q.includes('tamper') ||
      q.includes('authentic') ||
      q.includes('fake invoice') ||
      (q.includes('fake') && (q.includes('invoice') || q.includes('document')))
    ) {
      const deepfakeAlerts = fraud.filter((f) => f.type === 'deepfake' && f.status === 'open');
      const flagged = invoices.filter((i) => i.status === 'flagged');
      answer =
        deepfakeAlerts.length > 0
          ? `${deepfakeAlerts.length} fake/suspicious invoice alert(s). ${flagged.length} invoice(s) flagged. Highest risk: ${deepfakeAlerts.sort((a, b) => b.score - a.score)[0]?.title ?? 'none'}.`
          : 'No open fake-invoice alerts in your portfolio.';
      for (const f of deepfakeAlerts) sources.push({ type: 'fraud', id: f.id, label: 'From your invoice data' });
    } else if (q.includes('insurance') || q.includes('claim')) {
      const useCase = this.getActiveUseCase();
      const claimInvoices = invoices.filter((i) => i.department === 'Insurance' || i.useCaseId === 'insurance_claims');
      answer = `Active use case: ${useCase.name}. ${claimInvoices.length} insurance-related invoice(s) in pipeline.`;
      sources.push({ type: 'use_case', id: useCase.id, label: 'From your invoice data' });
    } else if (q.includes('legal') || q.includes('compliance')) {
      const checks = this.listComplianceChecks(params.tenantId).filter((c) => !c.passed);
      answer = `${checks.length} open compliance issue(s). Categories: ${[...new Set(checks.map((c) => c.category))].join(', ') || 'none'}.`;
      sources.push({ type: 'compliance', id: 'checks', label: 'From your invoice data' });
    } else if (
      q.includes('delivery') ||
      q.includes('lieferschein') ||
      q.includes('purchase order') ||
      q.includes('po match') ||
      q.includes('procure') ||
      q.includes('construction') ||
      q.includes('material')
    ) {
      const dns = this.listDeliveryNotes(params.tenantId);
      const pos = this.listPurchaseOrders(params.tenantId);
      const stats = this.getProcureToPayStats(params.tenantId);
      const consumption = this.listMaterialConsumption(params.tenantId);
      const totalCo2 = consumption.reduce((s, m) => s + (m.co2Tonnes ?? 0), 0);
      answer = `Procure-to-Pay: ${dns.length} delivery notes, ${pos.length} purchase orders, ${stats.poMatchRate}% PO match rate, ${stats.postingReadyPercent}% posting-ready. ${stats.upcomingDeliveries} upcoming deliveries. Material CO₂: ${totalCo2} t.`;
      sources.push({ type: 'procurement', id: 'p2p', label: 'From your invoice data' });
    } else if (q.includes('skonto') || q.includes('cash discount')) {
      const discounts = this.listCashDiscounts(params.tenantId);
      const expiring = discounts.filter((c) => c.status === 'expiring_soon');
      answer = `${discounts.length} cash discount(s) available. ${expiring.length} expiring soon — don't miss Skonti!`;
      sources.push({ type: 'cash_discount', id: 'skonto', label: 'From your invoice data' });
    } else if (q.includes('tender') && q.includes('status')) {
      const tenders = this.listTenders(params.tenantId);
      const open = tenders.filter((t) => t.status === 'open');
      const awarded = tenders.filter((t) => t.status === 'awarded');
      answer = `${tenders.length} tender(s): ${open.length} open, ${awarded.length} awarded. Open: ${open.map((t) => t.title).join('; ') || 'none'}.`;
      for (const t of open) sources.push({ type: 'tender', id: t.id, label: t.title });
    } else if (
      q.includes('supply chain') ||
      q.includes('compare offer') ||
      q.includes('best offer') ||
      q.includes('supplier offer') ||
      q.includes('vendor quote') ||
      (q.includes('offer') && (q.includes('compare') || q.includes('best')))
    ) {
      const stats = this.getSupplyChainStats(params.tenantId);
      const tenders = this.listTenders(params.tenantId);
      let tenderId = 'tnd_tunnel_241';
      if (q.includes('office') || q.includes('fit-out')) tenderId = 'tnd_office_q3';
      else if (q.includes('tunnel') || q.includes('concrete') || q.includes('241')) tenderId = 'tnd_tunnel_241';
      else if (tenders[0]) tenderId = tenders[0].id;

      const tender = this.getTender(tenderId);
      const rec = this.getSupplyChainRecommendation(params.tenantId, tenderId);
      answer = `Supply Chain: ${stats.totalOffers} offer(s) across ${stats.openTenders} open tender(s). Best offer for ${tender?.title ?? tenderId}: ${rec.bestVendorName} (${Math.round(rec.confidence * 100)}% confidence). ${rec.rationale}`;
      sources.push({ type: 'supply_chain', id: tenderId, label: tender?.title ?? 'Tender' });
    } else if (q.includes('supply chain rule') || q.includes('procurement rule')) {
      answer =
        'Default rules: reject vendor risk > 40, prefer lowest price when lead time < 14 days, warn if compliance < 90, require revision if PO match < 80. Edit rules on the Supply Chain page (Rules tab).';
      sources.push({ type: 'supply_chain', id: 'rules', label: 'From your invoice data' });
    } else if (q.includes('account') || q.includes('kontierung') || q.includes('assignment')) {
      const suggestions = [...this.accountSuggestions.values()].filter((a) =>
        invoices.some((i) => i.id === a.invoiceId),
      );
      answer = `${suggestions.length} AI account assignment suggestion(s). Latest: account ${suggestions[0]?.account ?? 'N/A'} (${((suggestions[0]?.confidence ?? 0) * 100).toFixed(0)}% confidence).`;
      sources.push({ type: 'account', id: 'suggestions', label: 'From your invoice data' });
    } else {
      const taxLines = this.listTaxDeclarationLines(params.tenantId);
      const keywordHit = answerFromKeywords({
        query: params.query,
        invoices,
        vendors,
        fraudAlerts: fraud,
        taxLineCount: taxLines.length,
        totalVat: taxLines.reduce((s, t) => s + t.vatAmount, 0),
        activeUseCaseName: this.getActiveUseCase().name,
        bookkeepingCount: this.listBookkeepingEntries(params.tenantId).length,
        complianceOpen: this.listComplianceChecks(params.tenantId).filter((c) => !c.passed).length,
      });
      if (keywordHit) {
        answer = keywordHit.answer;
        sources.push({
          type: keywordHit.sourceType,
          id: keywordHit.sourceId,
          label: keywordHit.sourceLabel,
        });
      }
    }

    if (!answer) {
      answer = defaultContextualFallback(invoices, fraud);
      sources.push({ type: 'portfolio', id: 'summary', label: 'From your invoice data' });
    }

    return this.finalizeChatResponse(params, stripRagArtifacts(answer), sources);
  }

  private finalizeChatResponse(
    params: { tenantId: string; userId: string; query: string },
    answer: string,
    sources: ChatQueryResponse['sources'],
  ): ChatQueryResponse {
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
