import type { Application, Skill, SecurityReviewResult } from './types.js';
import type { RiskLevel } from '@ai-pass/shared';

export class SecurityApprovalPipeline {
  reviewApp(app: Application): SecurityReviewResult {
    return this.review('app', app.id, app.permissions, app.riskLevel, app.modelsUsed);
  }

  reviewSkill(skill: Skill): SecurityReviewResult {
    return this.review('skill', skill.id, skill.permissions, skill.riskLevel, skill.compatibleModels);
  }

  private review(
    resourceType: 'app' | 'skill',
    resourceId: string,
    permissions: string[],
    riskLevel: RiskLevel,
    models: string[],
  ): SecurityReviewResult {
    const excessive = permissions.filter((p) =>
      ['governance.write', 'tenant.admin', 'filesystem.write'].includes(p),
    );
    const staticIssues: string[] = [];
    if (permissions.includes('wallet.deduct') && riskLevel === 'low') {
      staticIssues.push('Wallet access on low-risk resource requires review');
    }

    const vulnerabilities: string[] = [];
    if (models.some((m) => m.includes('experimental'))) {
      vulnerabilities.push('Experimental model dependency detected');
    }

    const aiFlags: string[] = [];
    if (riskLevel === 'critical' || riskLevel === 'high') {
      aiFlags.push('High-risk AI capability — human approval recommended');
    }

    const passed =
      staticIssues.length === 0 &&
      excessive.length === 0 &&
      vulnerabilities.length === 0;

    return {
      resourceType,
      resourceId,
      staticAnalysis: { passed: staticIssues.length === 0, issues: staticIssues },
      dependencyScan: { passed: vulnerabilities.length === 0, vulnerabilities },
      permissionReview: { passed: excessive.length === 0, excessive },
      aiSafety: { passed: aiFlags.length === 0, flags: aiFlags },
      riskLevel,
      approved: passed && riskLevel !== 'critical',
      reviewedAt: new Date().toISOString(),
    };
  }
}
