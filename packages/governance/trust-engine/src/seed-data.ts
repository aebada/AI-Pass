import type { TrustScorecard } from '@ai-pass/shared';
import { createTrustEngine, type TrustEnginePlatform } from './trust-engine.js';
import type { TestScenario } from './types.js';
import { emitMonitoringAlert } from './integrations.js';

const SCORE_INVOICE: TrustScorecard = {
  functional: 94, reliability: 92, explainability: 88, compliance: 96, safety: 91, overall: 92,
};
const SCORE_SUPPLY: TrustScorecard = {
  functional: 91, reliability: 89, explainability: 93, compliance: 90, safety: 88, overall: 90,
};
const SCORE_HR: TrustScorecard = {
  functional: 86, reliability: 84, explainability: 80, compliance: 85, safety: 82, overall: 83,
};
const SCORE_PRESENCE: TrustScorecard = {
  functional: 88, reliability: 90, explainability: 85, compliance: 87, safety: 92, overall: 88,
};
const SCORE_COMPLIANCE: TrustScorecard = {
  functional: 90, reliability: 88, explainability: 91, compliance: 95, safety: 89, overall: 91,
};
const SCORE_SALES: TrustScorecard = {
  functional: 92, reliability: 90, explainability: 87, compliance: 91, safety: 88, overall: 90,
};
const SCORE_CONTENT: TrustScorecard = {
  functional: 90, reliability: 88, explainability: 86, compliance: 89, safety: 91, overall: 89,
};

export const SEED_SYSTEM_IDS = {
  invoiceAi: 'sys_invoice_ai',
  supplyChain: 'sys_supply_chain',
  hrAi: 'sys_hr_ai',
  presenceAudit: 'sys_presence_audit',
  complianceAi: 'sys_compliance_ai',
  salesAi: 'sys_sales_ai',
  contentAi: 'sys_content_ai',
} as const;

export const SEED_VERIFICATION_IDS = {
  invoiceAi: 'AIP-INV2026',
  supplyChain: 'AIP-SC2026',
  hrAi: 'AIP-HR2026',
  presenceAudit: 'AIP-PA2026',
  complianceAi: 'AIP-CMP2026',
  salesAi: 'AIP-SALES2026',
  contentAi: 'AIP-CAI2026',
} as const;

export function seedTrustEngine(): TrustEnginePlatform & { listRuns: (systemId?: string) => import('./types.js').ValidationRun[] } {
  const engine = createTrustEngine();

  const systems = [
    {
      id: SEED_SYSTEM_IDS.invoiceAi,
      resourceId: 'invoice-ai',
      companyName: 'AI Pass Labs',
      productName: 'Invoice AI',
      systemType: 'marketplace_app' as const,
      industry: 'finance',
      useCase: 'Invoice extraction, validation, and approval routing',
      deploymentType: 'cloud',
      modelsUsed: ['gpt-4o', 'claude-3-5-sonnet'],
      highRiskDomain: true,
      status: 'certified' as const,
    },
    {
      id: SEED_SYSTEM_IDS.supplyChain,
      resourceId: 'supply-chain-ai',
      companyName: 'AI Pass Labs',
      productName: 'Supply Chain AI',
      systemType: 'marketplace_app' as const,
      industry: 'supply_chain',
      useCase: 'Procurement offer evaluation and supplier scoring',
      deploymentType: 'cloud',
      modelsUsed: ['gpt-4o'],
      highRiskDomain: true,
      status: 'certified' as const,
    },
    {
      id: SEED_SYSTEM_IDS.hrAi,
      resourceId: 'hr-ai',
      companyName: 'Acme Corp',
      productName: 'HR AI',
      systemType: 'app' as const,
      industry: 'hr',
      useCase: 'Resume parsing and candidate screening',
      deploymentType: 'cloud',
      modelsUsed: ['gpt-4o', 'claude-3-haiku'],
      highRiskDomain: false,
      status: 'certified' as const,
    },
    {
      id: SEED_SYSTEM_IDS.presenceAudit,
      resourceId: 'presence-audit',
      companyName: 'AI Pass Labs',
      productName: 'Presence Audit',
      systemType: 'enterprise_system' as const,
      industry: 'analytics',
      useCase: 'AI visibility audit and optimization',
      deploymentType: 'hybrid',
      modelsUsed: ['gpt-4o', 'claude-3', 'gemini'],
      highRiskDomain: false,
      status: 'certified' as const,
    },
    {
      id: SEED_SYSTEM_IDS.complianceAi,
      resourceId: 'compliance-ai',
      companyName: 'AI Pass Labs',
      productName: 'Compliance AI',
      systemType: 'enterprise_system' as const,
      industry: 'compliance',
      useCase: 'Policy enforcement and risk registry',
      deploymentType: 'enterprise',
      modelsUsed: ['claude-3-5-sonnet'],
      highRiskDomain: true,
      status: 'certified' as const,
    },
    {
      id: SEED_SYSTEM_IDS.salesAi,
      resourceId: 'sales-ai',
      companyName: 'AI Pass Labs',
      productName: 'Sales AI',
      systemType: 'marketplace_app' as const,
      industry: 'sales',
      useCase: 'Revenue operating system — email, LinkedIn, proposals, CRM, campaigns',
      deploymentType: 'cloud',
      modelsUsed: ['gpt-4o', 'claude-3-5-sonnet'],
      highRiskDomain: true,
      status: 'certified' as const,
    },
    {
      id: SEED_SYSTEM_IDS.contentAi,
      resourceId: 'content-ai',
      companyName: 'AI Pass Labs',
      productName: 'Content AI',
      systemType: 'marketplace_app' as const,
      industry: 'marketing',
      useCase: 'AI content detection and humanization',
      deploymentType: 'cloud',
      modelsUsed: ['gpt-4o', 'claude-3-5-sonnet', 'gemini-1.5-pro'],
      highRiskDomain: false,
      status: 'certified' as const,
    },
  ];

  for (const sys of systems) {
    engine.systems.register(sys);
  }

  const certs = [
    { systemId: SEED_SYSTEM_IDS.invoiceAi, level: 'gold' as const, scorecard: SCORE_INVOICE, vid: SEED_VERIFICATION_IDS.invoiceAi },
    { systemId: SEED_SYSTEM_IDS.supplyChain, level: 'gold' as const, scorecard: SCORE_SUPPLY, vid: SEED_VERIFICATION_IDS.supplyChain },
    { systemId: SEED_SYSTEM_IDS.hrAi, level: 'silver' as const, scorecard: SCORE_HR, vid: SEED_VERIFICATION_IDS.hrAi },
    { systemId: SEED_SYSTEM_IDS.presenceAudit, level: 'silver' as const, scorecard: SCORE_PRESENCE, vid: SEED_VERIFICATION_IDS.presenceAudit },
    { systemId: SEED_SYSTEM_IDS.complianceAi, level: 'platinum' as const, scorecard: SCORE_COMPLIANCE, vid: SEED_VERIFICATION_IDS.complianceAi },
    { systemId: SEED_SYSTEM_IDS.salesAi, level: 'gold' as const, scorecard: SCORE_SALES, vid: SEED_VERIFICATION_IDS.salesAi },
    { systemId: SEED_SYSTEM_IDS.contentAi, level: 'silver' as const, scorecard: SCORE_CONTENT, vid: SEED_VERIFICATION_IDS.contentAi },
  ];

  for (const c of certs) {
    const sys = engine.systems.get(c.systemId)!;
    engine.certification.issue({
      systemId: c.systemId,
      companyName: sys.companyName,
      productName: sys.productName,
      level: c.level,
      scorecard: c.scorecard,
      riskClass: sys.highRiskDomain ? 'high' : 'medium',
      verificationId: c.vid,
    });
  }

  const expiringSoon = new Date();
  expiringSoon.setDate(expiringSoon.getDate() + 14);
  const expiringLater = new Date();
  expiringLater.setDate(expiringLater.getDate() + 21);

  engine.certification.issue({
    systemId: SEED_SYSTEM_IDS.hrAi,
    companyName: 'Acme Corp',
    productName: 'HR AI',
    level: 'silver',
    scorecard: SCORE_HR,
    riskClass: 'medium',
    validUntil: expiringSoon.toISOString(),
  });

  engine.certification.issue({
    systemId: SEED_SYSTEM_IDS.presenceAudit,
    companyName: 'AI Pass Labs',
    productName: 'Presence Audit',
    level: 'bronze',
    scorecard: { functional: 72, reliability: 70, explainability: 68, compliance: 74, safety: 71, overall: 71 },
    riskClass: 'low',
    validUntil: expiringLater.toISOString(),
  });

  for (const c of certs) {
    const cert = engine.certification.listBySystem(c.systemId)[0];
    if (cert) {
      engine.monitoring.enable(c.systemId, c.scorecard);
      engine.badges.generate(cert);
    }
  }

  const defaultScenarios: TestScenario[] = [
    engine.validation.createScenario({ name: 'Invoice extraction', category: 'functional', input: { doc: 'invoice.pdf' }, severity: 'medium' }),
    engine.validation.createScenario({ name: 'Fraud detection', category: 'safety', input: { amount: 50000 }, severity: 'critical' }),
    engine.validation.createScenario({ name: 'GDPR compliance', category: 'compliance', input: { pii: true }, severity: 'high' }),
  ];
  const suiteId = engine.registerTestSuite(SEED_SYSTEM_IDS.invoiceAi, defaultScenarios);

  engine.validate({
    systemId: SEED_SYSTEM_IDS.invoiceAi,
    testSuiteId: suiteId,
    certificationLevel: 'gold',
    userId: 'demo-user',
    tenantId: 'tenant_acme',
    tier: 'enterprise',
  });

  engine.validate({
    systemId: SEED_SYSTEM_IDS.supplyChain,
    certificationLevel: 'gold',
    userId: 'demo-user',
    tenantId: 'tenant_acme',
    tier: 'enterprise',
  });

  engine.validate({
    systemId: SEED_SYSTEM_IDS.complianceAi,
    certificationLevel: 'platinum',
    dimensions: ['functional', 'compliance', 'adversarial'],
    userId: 'demo-user',
    tenantId: 'tenant_acme',
    tier: 'enterprise',
  });

  engine.monitoring.recordEvent({
    systemId: SEED_SYSTEM_IDS.invoiceAi,
    type: 'hallucination_rate',
    severity: 'medium',
    details: { rate: 2.8, threshold: 3.0 },
  });

  engine.monitoring.recordEvent({
    systemId: SEED_SYSTEM_IDS.hrAi,
    type: 'drift',
    severity: 'high',
    details: { metric: 'accuracy', previous: 0.92, current: 0.84 },
    triggersRevalidation: true,
  });

  emitMonitoringAlert(undefined, {
    systemId: SEED_SYSTEM_IDS.hrAi,
    type: 'drift',
    severity: 'high',
    details: { message: 'Model drift detected — revalidation recommended' },
  });

  for (const sys of systems) {
    const cert = engine.certification.listBySystem(sys.id)[0];
    if (cert) {
      const registered = engine.systems.get(sys.id)!;
      engine.reporting.generateExecutiveSummary(registered, cert, cert.scorecard);
    }
  }

  return engine as TrustEnginePlatform & { listRuns: (systemId?: string) => import('./types.js').ValidationRun[] };
}
