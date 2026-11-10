import { createId } from '@ai-pass/shared';
import type {
  CertifyRequest,
  RiskAssessment,
  TestScenario,
  TrustDashboard,
  ValidateRequest,
  ValidationRun,
} from './types.js';
import { TrustService } from './trust-service.js';
import { ValidationEngine } from './validation-engine.js';
import { ScoringEngine } from './scoring-engine.js';
import { CertificationService } from './certification-service.js';
import { MonitoringService } from './monitoring-service.js';
import { ReportingService } from './reporting-service.js';
import { VerificationService } from './verification-service.js';
import { BadgeService } from './badge-service.js';
import { AuditService } from './audit-service.js';
import {
  checkValidationEntitlement,
  consumeTrustCredits,
  COMPLIANCE_FRAMEWORK_STUBS,
  createTrustIntegrations,
  getTrustLimits,
  type LiveSyncTrustEmitter,
  type TrustIntegrations,
} from './integrations.js';

export interface TrustEnginePlatform {
  systems: TrustService;
  validation: ValidationEngine;
  scoring: ScoringEngine;
  certification: CertificationService;
  monitoring: MonitoringService;
  reporting: ReportingService;
  verification: VerificationService;
  badges: BadgeService;
  audit: AuditService;
  integrations: TrustIntegrations;
  validate: (req: ValidateRequest) => ValidationRun;
  certify: (req: CertifyRequest) => ReturnType<TrustEngineOrchestrator['certify']>;
  getDashboard: () => TrustDashboard;
  assessRisk: (systemId: string) => RiskAssessment;
  registerTestSuite: (systemId: string, scenarios: TestScenario[]) => string;
  listRuns: (systemId?: string) => ValidationRun[];
}

class TrustEngineOrchestrator {
  private runs = new Map<string, ValidationRun>();
  private testSuites = new Map<string, TestScenario[]>();
  private validationCounts = new Map<string, number>();
  private liveSyncEmit?: LiveSyncTrustEmitter;

  constructor(
    public systems: TrustService,
    public validation: ValidationEngine,
    public scoring: ScoringEngine,
    public certification: CertificationService,
    public monitoring: MonitoringService,
    public reporting: ReportingService,
    public verification: VerificationService,
    public badges: BadgeService,
    public audit: AuditService,
    public integrations: TrustIntegrations,
  ) {
    this.verification = new VerificationService((id) => this.certification.verify(id));
  }

  setLiveSyncEmitter(emit: LiveSyncTrustEmitter): void {
    this.liveSyncEmit = emit;
  }

  registerTestSuite(systemId: string, scenarios: TestScenario[]): string {
    const suiteId = `suite_${createId()}`;
    this.testSuites.set(suiteId, scenarios.map((s) => ({ ...s, suiteId })));
    this.audit.record({
      actorId: 'system',
      action: 'testsuite.register',
      resourceType: 'system',
      resourceId: systemId,
      metadata: { suiteId, scenarioCount: scenarios.length },
    });
    return suiteId;
  }

  validate(req: ValidateRequest): ValidationRun {
    const monthKey = `${req.userId}:${new Date().getMonth()}`;
    const count = this.validationCounts.get(monthKey) ?? 0;
    const entitlement = checkValidationEntitlement(this.integrations, req.userId, req.tier, count);
    if (!entitlement.allowed) {
      throw new Error(entitlement.reason ?? 'Validation not allowed');
    }

    const system = this.systems.get(req.systemId);
    if (!system) throw new Error(`System not found: ${req.systemId}`);

    const scenarios =
      req.testScenarios ??
      (req.testSuiteId ? this.testSuites.get(req.testSuiteId) : undefined) ??
      this.defaultScenarios(system.id);

    const run: ValidationRun = {
      id: `val_${createId()}`,
      systemId: req.systemId,
      status: 'running',
      certificationLevel: req.certificationLevel,
      testSuiteId: req.testSuiteId,
      dimensions: req.dimensions ?? ['functional', 'reliability', 'explainability', 'compliance', 'safety'],
      startedAt: new Date().toISOString(),
      failureCount: 0,
      passRate: 0,
    };
    this.runs.set(run.id, run);

    const output = this.validation.runDimensionsSync(scenarios, run.dimensions);
    const scoring = this.scoring.compute({
      testResults: output.results,
      dimensionResults: output.dimensionResults,
      criticalFailures: output.criticalFailures,
      highRiskDomain: system.highRiskDomain,
    });
    scoring.trustScore.systemId = system.id;

    run.status = scoring.blocked ? 'review_required' : 'completed';
    run.completedAt = new Date().toISOString();
    run.scorecard = scoring.scorecard;
    run.recommendation = scoring.blocked ? 'FAIL' : scoring.recommendedLevel ? 'PASS' : 'NEEDS_INFO';
    run.failureCount = output.results.filter((r) => !r.passed).length;
    run.passRate = output.results.length > 0 ? (output.results.length - run.failureCount) / output.results.length : 0;
    run.creditsConsumed = 50;

    this.runs.set(run.id, run);
    this.validationCounts.set(monthKey, count + 1);

    consumeTrustCredits(this.integrations, {
      userId: req.userId,
      tenantId: req.tenantId,
      action: 'validation',
      systemId: req.systemId,
      metadata: { runId: run.id },
    });

    this.audit.record({
      actorId: req.userId,
      action: 'validation.complete',
      resourceType: 'validation',
      resourceId: run.id,
      metadata: { systemId: req.systemId, overall: scoring.scorecard.overall },
    });

    this.liveSyncEmit?.({ type: 'trust.validation', payload: { runId: run.id, systemId: req.systemId } });

    return run;
  }

  certify(req: CertifyRequest) {
    const system = this.systems.get(req.systemId);
    const run = this.runs.get(req.validationRunId);
    if (!system || !run?.scorecard) throw new Error('Invalid certification request');

    const limits = getTrustLimits(req.tier);
    const levelOrder = ['bronze', 'silver', 'gold', 'platinum'] as const;
    if (levelOrder.indexOf(req.level) > levelOrder.indexOf(limits.maxCertLevel)) {
      throw new Error(`Certification level ${req.level} not available on ${req.tier} plan`);
    }

    if (!this.certification.meetsLevelRequirements(run.scorecard, req.level)) {
      throw new Error(`Scorecard does not meet requirements for ${req.level}`);
    }

    const cert = this.certification.issue({
      systemId: system.id,
      companyName: system.companyName,
      productName: system.productName,
      level: req.level,
      scorecard: run.scorecard,
      riskClass: system.highRiskDomain ? 'high' : 'medium',
    });

    this.systems.update(system.id, { status: 'certified' });
    this.monitoring.enable(system.id, run.scorecard);
    this.badges.generate(cert);

    consumeTrustCredits(this.integrations, {
      userId: req.userId,
      tenantId: req.tenantId,
      action: 'certification',
      systemId: req.systemId,
      metadata: { certId: cert.id },
    });

    this.reporting.generateExecutiveSummary(system, cert, run.scorecard);

    this.audit.record({
      actorId: req.userId,
      action: 'certification.issue',
      resourceType: 'certification',
      resourceId: cert.id,
      metadata: { level: req.level, verificationId: cert.verificationId },
    });

    this.liveSyncEmit?.({ type: 'trust.certification', payload: { certId: cert.id, systemId: req.systemId } });

    return cert;
  }

  getDashboard(): TrustDashboard {
    const certified = this.certification.listCertified();
    const runs = [...this.runs.values()];
    const riskDist = { low: 0, medium: 0, high: 0, critical: 0 } as TrustDashboard['riskDistribution'];

    for (const cert of certified) {
      riskDist[cert.riskClass] = (riskDist[cert.riskClass] ?? 0) + 1;
    }

    const avgScore =
      certified.length > 0
        ? Math.round(certified.reduce((s, c) => s + c.scorecard.overall, 0) / certified.length)
        : 0;

    return {
      certifiedSystems: certified.length,
      activeMonitoring: this.monitoring.getActiveCount(),
      expiringCerts: this.certification.listExpiring(30),
      validationRuns: runs.slice(-10).reverse(),
      riskDistribution: riskDist,
      averageTrustScore: avgScore,
      failedValidations: runs.filter((r) => r.recommendation === 'FAIL').length,
      recentReports: this.reporting.list().slice(-5).reverse(),
      recentAlerts: this.monitoring.getRecentAlerts(5),
    };
  }

  assessRisk(systemId: string): RiskAssessment {
    const system = this.systems.get(systemId);
    const certs = this.certification.listBySystem(systemId);
    const latestCert = certs[certs.length - 1];
    const scorecard = latestCert?.scorecard;

    const factors = [
      { name: 'Domain Risk', score: system?.highRiskDomain ? 75 : 25, weight: 0.25, description: 'Industry and use-case risk classification' },
      { name: 'Model Risk', score: (system?.modelsUsed.length ?? 1) * 15, weight: 0.2, description: 'Number and tier of models used' },
      { name: 'Trust Score', score: scorecard ? 100 - scorecard.overall : 50, weight: 0.35, description: 'Inverse of overall trust score' },
      { name: 'Monitoring', score: this.monitoring.isActive(systemId) ? 20 : 60, weight: 0.2, description: 'Continuous monitoring coverage' },
    ];

    const riskScore = Math.round(factors.reduce((s, f) => s + f.score * f.weight, 0));
    const overallRisk = riskScore >= 70 ? 'high' : riskScore >= 45 ? 'medium' : 'low';

    return {
      systemId,
      overallRisk: overallRisk as RiskAssessment['overallRisk'],
      riskScore,
      factors,
      complianceFrameworks: COMPLIANCE_FRAMEWORK_STUBS.map((f) => ({
        framework: f.framework,
        status: f.controlsPassed / f.controlsTotal >= 0.95 ? 'compliant' : f.controlsPassed / f.controlsTotal >= 0.8 ? 'partial' : 'non_compliant',
        controlsPassed: f.controlsPassed,
        controlsTotal: f.controlsTotal,
      })),
      recommendations: scorecard && scorecard.overall < 80 ? ['Increase validation coverage', 'Enable continuous monitoring'] : [],
      assessedAt: new Date().toISOString(),
    };
  }

  listRuns(systemId?: string): ValidationRun[] {
    const runs = [...this.runs.values()];
    return systemId ? runs.filter((r) => r.systemId === systemId) : runs;
  }

  private defaultScenarios(systemId: string): TestScenario[] {
    return [
      this.validation.createScenario({ name: 'Core workflow', category: 'functional', input: { systemId }, severity: 'medium' }),
      this.validation.createScenario({ name: 'Reliability check', category: 'reliability', input: { runs: 5 }, severity: 'medium' }),
      this.validation.createScenario({ name: 'Citation test', category: 'explainability', input: { query: 'test' }, severity: 'low' }),
      this.validation.createScenario({ name: 'Policy compliance', category: 'compliance', input: { pii: false }, severity: 'high' }),
      this.validation.createScenario({ name: 'Safety guardrail', category: 'safety', input: { harmful: false }, severity: 'critical' }),
    ];
  }
}

export function createTrustEngine(options?: { liveSyncEmit?: LiveSyncTrustEmitter }): TrustEnginePlatform {
  const systems = new TrustService();
  const validation = new ValidationEngine();
  const scoring = new ScoringEngine();
  const certification = new CertificationService();
  const monitoring = new MonitoringService();
  const reporting = new ReportingService();
  const badges = new BadgeService();
  const audit = new AuditService();
  const integrations = createTrustIntegrations();

  const orchestrator = new TrustEngineOrchestrator(
    systems,
    validation,
    scoring,
    certification,
    monitoring,
    reporting,
    new VerificationService((id) => certification.verify(id)),
    badges,
    audit,
    integrations,
  );

  if (options?.liveSyncEmit) orchestrator.setLiveSyncEmitter(options.liveSyncEmit);

  return {
    systems,
    validation,
    scoring,
    certification,
    monitoring,
    reporting,
    verification: orchestrator.verification,
    badges,
    audit,
    integrations,
    validate: (req) => orchestrator.validate(req),
    certify: (req) => orchestrator.certify(req),
    getDashboard: () => orchestrator.getDashboard(),
    assessRisk: (id) => orchestrator.assessRisk(id),
    registerTestSuite: (sid, scenarios) => orchestrator.registerTestSuite(sid, scenarios),
    listRuns: (sid?: string) => orchestrator.listRuns(sid),
  };
}

let _instance: (TrustEnginePlatform & { listRuns?: (systemId?: string) => ValidationRun[] }) | null = null;

export function getTrustEngineInstance(): (TrustEnginePlatform & { listRuns: (systemId?: string) => ValidationRun[] }) | null {
  return _instance;
}

export function setTrustEngineInstance(engine: TrustEnginePlatform & { listRuns: (systemId?: string) => ValidationRun[] }): void {
  _instance = engine;
}

export function resetTrustEngineInstance(): void {
  _instance = null;
}
