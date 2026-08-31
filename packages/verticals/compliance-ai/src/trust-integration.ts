import { CertificationService, ScoringEngine } from '@ai-pass/trust';
import type { Framework, Risk } from './types.js';

export class TrustIntegration {
  private scoring = new ScoringEngine();
  private certification = new CertificationService();

  computeComplianceTrustScore(params: {
    frameworks: Framework[];
    risks: Risk[];
    evidenceValidated: number;
    evidenceTotal: number;
  }): { trustScore: number; riskClass: 'low' | 'medium' | 'high'; certificationLevel?: string } {
    const avgProgress = params.frameworks.length
      ? params.frameworks.reduce((s, f) => s + f.progress, 0) / params.frameworks.length
      : 0;
    const openHighRisks = params.risks.filter(
      (r) => (r.status === 'open' || r.status === 'mitigating') && (r.severity === 'high' || r.severity === 'critical'),
    ).length;
    const evidenceRate = params.evidenceTotal > 0 ? params.evidenceValidated / params.evidenceTotal : 0;

    const trustScore = Math.round(avgProgress * 0.4 + Math.max(0, 100 - openHighRisks * 10) * 0.35 + evidenceRate * 100 * 0.25);

    const result = this.scoring.compute({
      testResults: [
        { testCaseId: 'framework_progress', scenarioId: 'sc_fw', passed: avgProgress >= 60, actualOutput: { score: avgProgress } },
        { testCaseId: 'risk_management', scenarioId: 'sc_risk', passed: openHighRisks <= 3, actualOutput: { count: openHighRisks } },
        { testCaseId: 'evidence_coverage', scenarioId: 'sc_ev', passed: evidenceRate >= 0.7, actualOutput: { rate: evidenceRate } },
      ],
      dimensionResults: [],
      criticalFailures: openHighRisks > 5 ? ['excessive_high_risks'] : [],
      highRiskDomain: openHighRisks > 2,
    });

    const riskClass = result.trustScore.riskLevel as 'low' | 'medium' | 'high';

    return {
      trustScore,
      riskClass,
      certificationLevel: trustScore >= 85 ? 'gold' : trustScore >= 70 ? 'silver' : 'bronze',
    };
  }

  issueCertification(params: {
    systemId: string;
    companyName: string;
    productName?: string;
    trustScore: number;
    riskClass: 'low' | 'medium' | 'high';
  }) {
    return this.certification.issue({
      systemId: params.systemId,
      companyName: params.companyName,
      productName: params.productName ?? 'Compliance AI',
      level: params.trustScore >= 85 ? 'gold' : params.trustScore >= 70 ? 'silver' : 'bronze',
      scorecard: {
        functional: params.trustScore,
        reliability: params.trustScore,
        compliance: params.trustScore,
        explainability: 80,
        safety: params.trustScore,
        overall: params.trustScore,
      },
      riskClass: params.riskClass,
    });
  }

  verifyCertification(certId: string) {
    return this.certification.verify(certId);
  }
}

export const defaultTrustIntegration = new TrustIntegration();
