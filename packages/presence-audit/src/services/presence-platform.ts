import type {
  AuditRun,
  Company,
  MembershipTier,
  OptimizationRecommendation,
  PresenceDashboard,
  ProviderResponse,
  Report,
} from '@ai-pass/shared';
import { createId } from '@ai-pass/shared';
import { createKnowledgePipeline } from '@ai-pass/knowledge-pipeline';
import { getPresenceLimits } from '../membership-gates.js';
import { emitAuditCompleted, emitCompetitorAdded, emitDashboardRefresh } from '../livesync.js';
import { defaultPresenceTrustService } from '../trust.js';
import { AnalyticsService } from './analytics-service.js';
import { AuditService } from './audit-service.js';
import { CompanyService } from './company-service.js';
import { CompetitorService } from './competitor-service.js';
import { AlertService, MonitoringService } from './monitoring-service.js';
import { OptimizationEngine } from './optimization-engine.js';
import { PromptCoverage } from './prompt-coverage.js';
import { ProviderService } from './provider-service.js';
import { ReportingService } from './reporting-service.js';
import { GapDetection, RepresentationAnalysis, ScoringEngine } from './scoring-engine.js';
import { SimulationService } from './simulation-service.js';

export class PresenceAuditPlatform {
  readonly companies = new CompanyService();
  readonly audit = new AuditService();
  readonly providers = new ProviderService();
  readonly scoring = new ScoringEngine();
  readonly representation = new RepresentationAnalysis();
  readonly gaps = new GapDetection();
  readonly competitors = new CompetitorService();
  readonly optimization = new OptimizationEngine();
  readonly prompts = new PromptCoverage();
  readonly simulation = new SimulationService();
  readonly monitoring = new MonitoringService();
  readonly alerts = new AlertService();
  readonly reporting = new ReportingService();
  readonly analytics = new AnalyticsService();

  private auditRuns: AuditRun[] = [];
  private recommendations = new Map<string, OptimizationRecommendation[]>();
  private reports: Report[] = [];
  private scoreHistory: Map<string, number[]> = new Map();

  constructor() {
    const kp = createKnowledgePipeline();
    void kp;
  }

  upsertCompany(
    tenantId: string,
    input: Omit<Company, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>,
  ): Company {
    const existing = this.companies.getByTenant(tenantId);
    if (existing) {
      return this.companies.update(existing.id, input) ?? existing;
    }
    return this.companies.create(tenantId, input);
  }

  async runAudit(params: {
    companyId: string;
    userId: string;
    membershipTier: MembershipTier;
  }): Promise<AuditRun> {
    const company = this.companies.get(params.companyId);
    if (!company) throw new Error('Company not found');

    const limits = getPresenceLimits(params.membershipTier);
    const providerList = this.providers.resolveForTier(limits.maxProviders);
    const promptList = this.prompts.buildPrompts(company, limits.customPrompts).slice(0, 6);

    const auditRunId = `audit_${createId()}`;
    const run: AuditRun = {
      id: auditRunId,
      companyId: company.id,
      tenantId: company.tenantId,
      status: 'running',
      providers: providerList,
      prompts: promptList,
      responses: [],
      score: { visibility: 0, recommendation: 0, ranking: 0, consistency: 0, accuracy: 0, overall: 0 },
      representation: {
        brandPositioning: '',
        productPositioning: '',
        strengths: [],
        weaknesses: [],
        missingCapabilities: [],
        tone: 'neutral',
        sentiment: 'neutral',
        hallucinations: [],
        outdatedInfo: [],
      },
      gaps: [],
      competitorSnapshot: [],
      startedAt: new Date().toISOString(),
    };
    this.auditRuns.push(run);

    const responses = await this.audit.runAudit({
      auditRunId,
      company,
      prompts: promptList,
      providers: providerList,
      userId: params.userId,
      membershipTier: params.membershipTier,
    });

    const score = this.scoring.compute(responses);
    const representation = this.representation.analyze(company, responses);
    const gapList = this.gaps.detect(company, responses);
    const competitorSnapshot = this.competitors.analyze(company, responses);
    const recs = defaultPresenceTrustService.annotateRecommendations(
      this.optimization.recommend(company, score, gapList),
      defaultPresenceTrustService.evaluateCompany(company).riskClass,
    );

    run.status = 'completed';
    run.responses = responses;
    run.score = score;
    run.representation = representation;
    run.gaps = gapList;
    run.competitorSnapshot = competitorSnapshot;
    run.completedAt = new Date().toISOString();

    this.recommendations.set(company.id, recs);

    const history = this.scoreHistory.get(company.id) ?? [];
    history.push(score.overall);
    this.scoreHistory.set(company.id, history);

    const execReport = this.reporting.generateExecutiveSummary(company, run, recs);
    this.reports.push(execReport);
    this.reports.push(this.reporting.generateProviderComparison(company, run));

    if (gapList.some((g) => g.severity === 'critical')) {
      this.alerts.create({
        companyId: company.id,
        type: 'ranking_drop',
        channel: 'email',
        title: 'Critical visibility gaps detected',
        message: gapList.filter((g) => g.severity === 'critical').map((g) => g.description).join('; '),
        severity: 'critical',
      });
    }

    void emitAuditCompleted({
      companyId: company.id,
      tenantId: company.tenantId,
      auditRunId,
      score: score.overall,
    });
    void emitDashboardRefresh(company.tenantId);

    return run;
  }

  getDashboard(tenantId: string): PresenceDashboard | undefined {
    const company = this.companies.getByTenant(tenantId);
    if (!company) return undefined;

    const audits = this.getAuditHistory(company.id);
    const latest = audits[audits.length - 1];
    const recs = this.recommendations.get(company.id) ?? [];
    const trust = defaultPresenceTrustService.evaluateCompany(company);

    const competitorRanking = (latest?.competitorSnapshot ?? []).map((c, i) => ({
      name: c.name,
      score: c.visibilityScore,
      rank: i + 1,
    }));

    return {
      company,
      latestAudit: latest,
      score: latest?.score ?? { visibility: 0, recommendation: 0, ranking: 0, consistency: 0, accuracy: 0, overall: 0 },
      visibilityTrend: this.scoreHistory.get(company.id) ?? [],
      recommendationScore: latest?.score.recommendation ?? 0,
      competitorRanking,
      platformsAudited: latest?.providers ?? [],
      opportunities: recs.filter((r) => r.impact === 'high').map((r) => r.title),
      criticalIssues: latest?.gaps.filter((g) => g.severity === 'critical') ?? [],
      optimizationProgress: this.analytics.compute(company.id, audits, recs).optimizationProgress,
      recentAudits: audits.slice(-5),
      trustScore: trust.trustScore,
      trustCertified: trust.certified,
    };
  }

  addCompetitor(companyId: string, name: string): Company | undefined {
    const company = this.companies.get(companyId);
    if (!company) return undefined;
    if (company.competitors.includes(name)) return company;
    const updated = this.companies.update(companyId, {
      competitors: [...company.competitors, name],
    });
    void emitCompetitorAdded({ companyId, competitorName: name });
    return updated;
  }

  getResults(companyId: string): ProviderResponse[] {
    const latest = this.getAuditHistory(companyId).slice(-1)[0];
    return latest?.responses ?? [];
  }

  getAuditHistory(companyId: string): AuditRun[] {
    return this.auditRuns.filter((a) => a.companyId === companyId && a.status === 'completed');
  }

  getRecommendations(companyId: string): OptimizationRecommendation[] {
    return this.recommendations.get(companyId) ?? [];
  }

  getReports(companyId: string): Report[] {
    return this.reports.filter((r) => r.companyId === companyId);
  }

  listProviders(): ReturnType<ProviderService['list']> {
    return this.providers.list();
  }

  /** Load demo / seed state for marketplace preview */
  importAuditRun(run: AuditRun): void {
    const existing = this.auditRuns.findIndex((a) => a.id === run.id);
    if (existing >= 0) this.auditRuns[existing] = run;
    else this.auditRuns.push(run);
  }

  importRecommendations(companyId: string, recs: OptimizationRecommendation[]): void {
    this.recommendations.set(companyId, recs);
  }

  importScoreHistory(companyId: string, scores: number[]): void {
    this.scoreHistory.set(companyId, scores);
  }

  importReports(reports: Report[]): void {
    this.reports.push(...reports);
  }
}

export const defaultPresenceAuditPlatform = new PresenceAuditPlatform();
