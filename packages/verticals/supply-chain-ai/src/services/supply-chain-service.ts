import { createId, type AgentDecision, type MembershipTier } from '@ai-pass/shared';
import type { ScApproval, Decision, Evaluation, Offer } from '../types.js';
import { defaultWalletService } from '@ai-pass/wallet';
import type { ExecutionEngine, AgentRegistry } from '@ai-pass/agent-studio';
import type {
  ApprovalResponse,
  ChatResponse,
  CreateSourcingResponse,
  DashboardResponse,
  ReportResponse,
  RunEvaluationResponse,
  UploadOfferResponse,
} from '../api-types.js';
import {
  DEMO_APPROVALS,
  DEMO_AUDIT_LOGS,
  DEMO_DECISIONS,
  DEMO_EVALUATIONS,
  DEMO_EVENTS,
  DEMO_OFFERS,
  DEMO_POLICIES,
  DEMO_SUPPLIERS,
  getDashboardStats,
} from '../demo-data.js';
import { emitEvaluationComplete, emitOfferUploaded, emitRankingUpdated } from '../livesync.js';
import { canAccessAdvancedScoring, canAccessSupplyChainAI } from '../membership-gates.js';
import { AgentOrchestrator } from './agent-orchestrator.js';
import { AuditService } from './audit-service.js';
import { NotificationService } from './notification-service.js';
import { OfferNormalizationService } from './offer-normalization.js';
import { OfferParsingService } from './offer-parsing-service.js';
import { PolicyService } from './policy-service.js';
import { ReportingService } from './reporting-service.js';
import { RulesEngine } from './rules-engine.js';
import { ScoringEngine, DEFAULT_SCORING_TEMPLATES } from './scoring-engine.js';
import { SourcingService, parseRequirementsFromNL } from './sourcing-service.js';
import { SupplierService } from './supplier-service.js';

export class SupplyChainAIService {
  private sourcing = new SourcingService();
  private suppliers = new SupplierService();
  private offers = new Map<string, Offer>();
  private evaluations = new Map<string, Evaluation>();
  private decisions = new Map<string, Decision>();
  private approvals = new Map<string, ScApproval>();
  private parser = new OfferParsingService();
  private normalizer = new OfferNormalizationService();
  private policies = new PolicyService();
  private rules = new RulesEngine();
  private scoring = new ScoringEngine();
  private reporting = new ReportingService();
  private notifications = new NotificationService();
  private audit = new AuditService();
  private orchestrator?: AgentOrchestrator;

  constructor(seedDemo = true) {
    if (seedDemo) this.seedDemoData();
  }

  bindAgents(registry: AgentRegistry, execution: ExecutionEngine): void {
    this.orchestrator = new AgentOrchestrator(registry, execution);
  }

  private seedDemoData(): void {
    this.sourcing.seed(DEMO_EVENTS);
    this.suppliers.seed(DEMO_SUPPLIERS);
    for (const o of DEMO_OFFERS) this.offers.set(o.id, o);
    for (const e of DEMO_EVALUATIONS) this.evaluations.set(e.id, e);
    for (const d of DEMO_DECISIONS) this.decisions.set(d.id, d);
    for (const a of DEMO_APPROVALS) this.approvals.set(a.id, a);
    this.policies.seed(DEMO_POLICIES);
    this.audit.seed(DEMO_AUDIT_LOGS);
  }

  getDashboard(tenantId: string): DashboardResponse {
    const events = this.sourcing.list(tenantId);
    const offers = this.listOffers(undefined, tenantId);
    const evaluations = [...this.evaluations.values()].filter((e) => e.tenantId === tenantId);
    const suppliers = this.suppliers.list(tenantId);
    const approvals = [...this.approvals.values()].filter((a) => a.tenantId === tenantId);
    return { stats: getDashboardStats(events, offers, evaluations, suppliers, approvals) };
  }

  listEvents(tenantId: string) {
    return { events: this.sourcing.list(tenantId), total: this.sourcing.list(tenantId).length };
  }

  getEvent(id: string) {
    return this.sourcing.get(id);
  }

  createEvent(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    title: string;
    category: string;
    department: string;
    deadline: string;
    currency: string;
    budgetCap?: number;
    requirementsNL?: string;
  }): CreateSourcingResponse {
    if (!canAccessSupplyChainAI(params.tier)) {
      throw new Error('Supply Chain AI requires Professional plan or higher');
    }

    const tempId = `evt_temp_${createId()}`;
    const requirements = params.requirementsNL
      ? parseRequirementsFromNL(params.requirementsNL, tempId)
      : [];

    const event = this.sourcing.create({
      tenantId: params.tenantId,
      title: params.title,
      category: params.category,
      department: params.department,
      deadline: params.deadline,
      currency: params.currency,
      budgetCap: params.budgetCap,
      status: 'draft',
      requirements: requirements.map((r) => ({ ...r, eventId: tempId })),
    });

    if (requirements.length) {
      this.sourcing.update(event.id, { requirements: requirements.map((r) => ({ ...r, eventId: event.id })) });
    }

    const creditsUsed = params.requirementsNL ? 6 : 2;
    this.recordCredits(params, creditsUsed, 'sourcing_create', { eventId: event.id });
    this.audit.log({
      tenantId: params.tenantId,
      entityType: 'event',
      entityId: event.id,
      action: 'sourcing.created',
      actorId: params.userId,
      actorName: 'User',
      details: { title: params.title },
      creditsUsed,
    });

    return { event: this.sourcing.get(event.id)!, creditsUsed };
  }

  listOffers(eventId?: string, tenantId?: string): Offer[] {
    let all = [...this.offers.values()];
    if (eventId) all = all.filter((o) => o.eventId === eventId);
    if (tenantId) {
      const eventIds = new Set(this.sourcing.list(tenantId).map((e) => e.id));
      all = all.filter((o) => eventIds.has(o.eventId));
    }
    return all;
  }

  async uploadOffer(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    eventId: string;
    fileName: string;
    mimeType: string;
    supplierId?: string;
    supplierName?: string;
    manualFields?: Record<string, unknown>;
  }): Promise<UploadOfferResponse> {
    if (!canAccessSupplyChainAI(params.tier)) {
      throw new Error('Supply Chain AI requires Professional plan or higher');
    }

    const event = this.sourcing.get(params.eventId);
    if (!event) throw new Error('Sourcing event not found');

    let supplier = params.supplierId ? this.suppliers.get(params.supplierId) : undefined;
    if (!supplier && params.supplierName) {
      supplier = this.suppliers.getByName(params.supplierName);
    }
    if (!supplier) {
      supplier = this.suppliers.create({
        tenantId: params.tenantId,
        name: params.supplierName ?? 'Unknown Supplier',
        country: 'DE',
        certifications: [],
        riskScore: 40,
        esgScore: 50,
        status: 'review',
        totalSpend: 0,
        offerCount: 0,
      });
    }

    const parseResult = params.manualFields
      ? {
          fields: Object.entries(params.manualFields).map(([key, value]) => ({
            key,
            value,
            confidence: 1,
            source: 'manual' as const,
            validation: 'valid' as const,
          })),
          confidence: 1,
          source: 'manual' as const,
          creditsUsed: 3,
        }
      : this.parser.parse(params.fileName, params.mimeType, supplier.name);

    let offer = this.parser.toOffer({
      eventId: params.eventId,
      supplierId: supplier.id,
      supplierName: supplier.name,
      fileName: params.fileName,
      mimeType: params.mimeType,
      parseResult,
    });

    offer = this.normalizer.normalize(offer, event.currency);
    this.offers.set(offer.id, offer);

    const creditsUsed = parseResult.creditsUsed + 2;
    this.recordCredits(params, creditsUsed, 'offer_parse', { offerId: offer.id });
    this.audit.log({
      tenantId: params.tenantId,
      entityType: 'offer',
      entityId: offer.id,
      action: 'offer.uploaded',
      actorId: params.userId,
      actorName: 'User',
      details: { fileName: params.fileName, eventId: params.eventId },
      creditsUsed,
    });

    this.notifications.send({
      tenantId: params.tenantId,
      type: 'offer_uploaded',
      title: 'New offer uploaded',
      body: `${supplier.name} submitted an offer for ${event.title}`,
      entityId: offer.id,
    });

    const liveSyncEventId = await emitOfferUploaded(offer, event);

    if (event.status === 'draft') {
      this.sourcing.update(event.id, { status: 'collecting' });
    }

    return { offer, parseConfidence: parseResult.confidence, creditsUsed, liveSyncEventId };
  }

  listEvaluations(tenantId: string, eventId?: string) {
    let all = [...this.evaluations.values()].filter((e) => e.tenantId === tenantId);
    if (eventId) all = all.filter((e) => e.eventId === eventId);
    return { evaluations: all };
  }

  getEvaluation(id: string) {
    return this.evaluations.get(id);
  }

  async runEvaluation(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    eventId: string;
    scoringTemplateId?: string;
  }): Promise<RunEvaluationResponse> {
    if (!canAccessSupplyChainAI(params.tier)) {
      throw new Error('Supply Chain AI requires Professional plan or higher');
    }

    const event = this.sourcing.get(params.eventId);
    if (!event) throw new Error('Sourcing event not found');

    const offers = this.listOffers(params.eventId);
    if (offers.length === 0) throw new Error('No offers to evaluate');

    const template = DEFAULT_SCORING_TEMPLATES.find((t) => t.id === params.scoringTemplateId)
      ?? (canAccessAdvancedScoring(params.tier) ? DEFAULT_SCORING_TEMPLATES[0] : DEFAULT_SCORING_TEMPLATES[0]);

    const policies = this.policies.list(params.tenantId, 'active');
    const evaluationId = `eval_${createId()}`;
    const results: Evaluation['results'] = [];
    let totalCredits = 0;
    const allAgentResults: Evaluation['agentResults'] = [];

    for (const offer of offers) {
      const supplier = this.suppliers.get(offer.supplierId);
      if (!supplier) continue;

      const ruleEval = this.rules.evaluate({
        event,
        offer,
        supplier,
        policies,
        maxLeadTimeDays: 45,
      });

      const scoreEval = this.scoring.score({
        offer,
        supplier,
        template,
        budgetCap: event.budgetCap,
      });

      let decision: AgentDecision = ruleEval.decision;
      if (decision === 'PASS' && scoreEval.decision === 'FAIL') decision = 'FAIL';
      else if (decision === 'PASS' && scoreEval.decision === 'NEEDS_INFO') decision = 'NEEDS_INFO';

      if (this.orchestrator) {
        const agentResults = await this.orchestrator.runAll({
          eventId: event.id,
          offer,
          supplier,
          tenantId: params.tenantId,
          userId: params.userId,
        });
        allAgentResults.push(...agentResults);
        totalCredits += agentResults.reduce((s, a) => s + a.creditsUsed, 0);
        if (agentResults.some((a) => a.decision === 'FAIL')) decision = 'FAIL';
      }

      offer.overallScore = scoreEval.total;
      offer.status = decision;
      this.offers.set(offer.id, offer);

      results.push({
        offerId: offer.id,
        supplierId: supplier.id,
        supplierName: supplier.name,
        decision,
        score: scoreEval.total,
        scores: scoreEval.scores,
        ruleResults: ruleEval.results,
        reasons: [
          ...ruleEval.results.filter((r) => r.outcome !== 'PASS').map((r) => r.message),
          ...scoreEval.scores.slice(0, 2).map((s) => s.rationale),
        ].filter(Boolean),
        evidenceIds: ruleEval.results.map((r) => `rule:${r.ruleId}`),
      });
    }

    results.sort((a, b) => b.score - a.score);
    results.forEach((r, i) => {
      r.rank = i + 1;
      const offer = this.offers.get(r.offerId);
      if (offer) {
        offer.rank = i + 1;
        this.offers.set(offer.id, offer);
      }
    });

    const trustScore = Math.round(
      results.reduce((sum, r) => sum + r.score, 0) / Math.max(results.length, 1),
    );

    const evaluation: Evaluation = {
      id: evaluationId,
      eventId: event.id,
      tenantId: params.tenantId,
      ruleSetVersion: '1.0.0',
      weights: template.weights,
      status: 'completed',
      results,
      agentResults: allAgentResults,
      recommendedOfferId: results.find((r) => r.decision === 'PASS')?.offerId,
      trustScore,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    this.evaluations.set(evaluation.id, evaluation);
    this.sourcing.update(event.id, { status: 'evaluating' });

    const creditsUsed = totalCredits + 25;
    this.recordCredits(params, creditsUsed, 'evaluation_run', { evaluationId: evaluation.id });

    const decision: Decision = {
      id: `dec_${createId()}`,
      eventId: event.id,
      evaluationId: evaluation.id,
      recommendedOfferId: evaluation.recommendedOfferId ?? '',
      status: 'proposed',
      rationale: `Recommended: ${results[0]?.supplierName ?? 'none'} with score ${results[0]?.score ?? 0}`,
      trustScore,
      createdAt: new Date().toISOString(),
    };
    this.decisions.set(decision.id, decision);

    const approvalId = `appr_${createId()}`;
    this.approvals.set(approvalId, {
      id: approvalId,
      tenantId: params.tenantId,
      eventId: event.id,
      decisionId: decision.id,
      approverId: 'user_proc_mgr',
      approverName: 'Procurement Manager',
      level: 1,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    });

    this.audit.log({
      tenantId: params.tenantId,
      entityType: 'evaluation',
      entityId: evaluation.id,
      action: 'evaluation.completed',
      actorId: params.userId,
      actorName: 'User',
      details: { eventId: event.id, recommendedOfferId: evaluation.recommendedOfferId },
      creditsUsed,
    });

    this.notifications.send({
      tenantId: params.tenantId,
      type: 'evaluation_complete',
      title: 'Evaluation complete',
      body: `Ranking updated for ${event.title}`,
      entityId: evaluation.id,
    });

    const liveSyncEventId = await emitEvaluationComplete(evaluation);
    await emitRankingUpdated(event, evaluation);

    return { evaluation, creditsUsed, liveSyncEventId };
  }

  listSuppliers(tenantId: string) {
    return { suppliers: this.suppliers.list(tenantId) };
  }

  listPolicies(tenantId: string) {
    return { policies: this.policies.list(tenantId) };
  }

  listApprovals(tenantId: string, status?: ScApproval['status']) {
    const all = [...this.approvals.values()].filter((a) => a.tenantId === tenantId);
    return status ? all.filter((a) => a.status === status) : all;
  }

  processApproval(params: {
    tenantId: string;
    approvalId: string;
    approverId: string;
    approverName: string;
    comment?: string;
    action: 'approve' | 'reject';
  }): ApprovalResponse {
    const approval = this.approvals.get(params.approvalId);
    if (!approval) throw new Error('Approval not found');

    approval.status = params.action === 'approve' ? 'approved' : 'rejected';
    approval.approverId = params.approverId;
    approval.approverName = params.approverName;
    approval.comment = params.comment;
    approval.decidedAt = new Date().toISOString();
    this.approvals.set(approval.id, approval);

    const decision = this.decisions.get(approval.decisionId);
    if (decision) {
      decision.status = params.action === 'approve' ? 'approved' : 'rejected';
      if (params.action === 'approve') decision.awardedOfferId = decision.recommendedOfferId;
      this.decisions.set(decision.id, decision);
      if (params.action === 'approve') {
        this.sourcing.update(approval.eventId, { status: 'decided' });
      }
    }

    const auditLog = this.audit.log({
      tenantId: params.tenantId,
      entityType: 'approval',
      entityId: approval.id,
      action: params.action === 'approve' ? 'approval.approved' : 'approval.rejected',
      actorId: params.approverId,
      actorName: params.approverName,
      details: { decisionId: approval.decisionId, comment: params.comment },
    });

    return { approval, decision, auditLog };
  }

  generateReport(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    evaluationId: string;
    type: 'comparison' | 'decision_memo' | 'evidence_pack' | 'report';
  }): ReportResponse {
    const evaluation = this.evaluations.get(params.evaluationId);
    if (!evaluation) throw new Error('Evaluation not found');

    const event = this.sourcing.get(evaluation.eventId);
    if (!event) throw new Error('Event not found');

    const offers = this.listOffers(evaluation.eventId);
    let artifact;

    if (params.type === 'comparison') {
      artifact = this.reporting.generateComparisonReport({ event, offers, evaluation });
    } else if (params.type === 'decision_memo') {
      artifact = this.reporting.generateDecisionMemo({ event, evaluation });
    } else {
      artifact = this.reporting.generateEvidencePack(evaluation);
    }

    const creditsUsed = 15;
    this.recordCredits(params, creditsUsed, 'report_generate', { evaluationId: params.evaluationId });

    return { artifact, creditsUsed };
  }

  chat(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    query: string;
    eventId?: string;
    language?: string;
  }): ChatResponse {
    const q = params.query.toLowerCase();
    const events = this.sourcing.list(params.tenantId);
    const offers = this.listOffers(params.eventId, params.tenantId);
    const evaluations = [...this.evaluations.values()].filter((e) => e.tenantId === params.tenantId);
    const language = params.language ?? (q.match(/[äöüß]/) ? 'de' : 'en');

    let answer = language === 'de'
      ? 'Ich kann Lieferanten vergleichen, Bewertungen erklären und Richtlinienverstöße aufzeigen.'
      : 'I can compare suppliers, explain scoring, and highlight policy violations.';
    const sources: ChatResponse['sources'] = [];

    if (q.includes('compare') || q.includes('vergleich') || q.includes('ranking')) {
      const latest = evaluations[evaluations.length - 1];
      if (latest) {
        const ranking = latest.results.map((r, i) => `${i + 1}. ${r.supplierName} (${r.score})`).join('; ');
        answer = language === 'de'
          ? `Aktuelle Rangliste: ${ranking}`
          : `Current ranking: ${ranking}`;
        sources.push({ type: 'evaluation', id: latest.id, label: 'Latest evaluation' });
      }
    } else if (q.includes('score') || q.includes('bewertung') || q.includes('why')) {
      const top = offers.sort((a, b) => (b.overallScore ?? 0) - (a.overallScore ?? 0))[0];
      answer = top
        ? `Top offer: ${top.supplierName} scored ${top.overallScore}/100. Key factors: price ${top.totalPrice} EUR, delivery ${top.deliveryDays}d.`
        : 'No scored offers yet.';
      if (top) sources.push({ type: 'offer', id: top.id, label: top.supplierName });
    } else if (q.includes('policy') || q.includes('violation') || q.includes('richtlinie')) {
      const policies = this.policies.list(params.tenantId, 'active');
      answer = `${policies.length} active procurement policies. Blocked suppliers are automatically rejected.`;
      for (const p of policies) sources.push({ type: 'policy', id: p.id, label: p.name });
    } else if (q.includes('spend') || q.includes('pipeline')) {
      const pipeline = offers.reduce((s, o) => s + (o.totalPrice ?? 0), 0);
      answer = `Pipeline value: EUR ${pipeline.toLocaleString()} across ${offers.length} offers in ${events.length} events.`;
      sources.push({ type: 'aggregate', id: 'pipeline', label: 'Pipeline value' });
    }

    const creditsUsed = 10;
    this.recordCredits(params, creditsUsed, 'sc_chat', { query: params.query });

    return { answer, sources, creditsUsed, language };
  }

  getAuditLogs(tenantId: string) {
    return this.audit.list(tenantId);
  }

  getNotifications(tenantId: string) {
    return this.notifications.list(tenantId);
  }

  private recordCredits(
    params: { userId: string; tenantId: string },
    credits: number,
    taskType: string,
    metadata: Record<string, unknown>,
  ): void {
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: 'Supply Chain AI',
      model: 'platform-stub',
      credits,
      estimatedCostUsd: credits * 0.002,
      taskType,
      module: 'supply-chain-ai',
      metadata,
    });
  }
}

export const defaultSupplyChainAIService = new SupplyChainAIService();
