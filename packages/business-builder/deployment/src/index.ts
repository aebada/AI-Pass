import type { SolutionSpec } from '@ai-pass/builder';
import { GovernanceWorkflow, PolicyEngine } from '@ai-pass/governance';
import { createSolutionRuntime } from '@ai-pass/solution-runtime';
import { scaffoldMobileApp, scaffoldWebApp, TemplateRegistry } from '@ai-pass/templates';

export interface DeployRequest {
  solution: SolutionSpec;
  requestedBy: string;
  skipApproval?: boolean;
}

export interface DeployResult {
  success: boolean;
  status: 'deployed' | 'pending_approval' | 'blocked';
  approvalId?: string;
  runtimeId?: string;
  previewUrl?: string;
  scaffolds: Array<{ platform: string; fileCount: number }>;
  message: string;
}

export class DeployScaffolder {
  constructor(
    private templates = new TemplateRegistry(),
    private runtime = createSolutionRuntime(),
    private governance = new GovernanceWorkflow(),
    private policies = new PolicyEngine()
  ) {}

  deploy(request: DeployRequest): DeployResult {
    const { solution, requestedBy, skipApproval } = request;
    const template = this.templates.get(solution.modules[0]?.templateId ?? 'crm-starter');

    if (!template) {
      return { success: false, status: 'blocked', scaffolds: [], message: 'Template not found' };
    }

    const evaluation = this.policies.evaluate({
      systemId: solution.id,
      action: 'deploy',
      context: { risk_level: solution.governance.riskLevel, requires_approval: solution.governance.requiresApproval },
    });

    if (solution.governance.requiresApproval && !skipApproval && !evaluation.allowed) {
      const approval = this.governance.requestApproval({
        systemId: solution.id,
        requestedBy,
        reason: `Deploy ${solution.name} (${solution.governance.riskLevel} risk)`,
      });
      return {
        success: false,
        status: 'pending_approval',
        approvalId: approval.id,
        scaffolds: [],
        message: 'Deployment requires business admin approval',
      };
    }

    const webScaffold = scaffoldWebApp(template, solution.name);
    const mobileScaffold = scaffoldMobileApp(template, solution.name);
    const instance = this.runtime.deploy(solution, requestedBy);

    return {
      success: true,
      status: 'deployed',
      runtimeId: instance.id,
      previewUrl: instance.url,
      scaffolds: [
        { platform: 'web', fileCount: webScaffold.files.length },
        { platform: 'mobile', fileCount: mobileScaffold.files.length },
      ],
      message: `Deployed ${solution.name} with web + mobile shells`,
    };
  }

  approveAndDeploy(approvalId: string, solution: SolutionSpec, approver: string): DeployResult {
    this.governance.resolve(approvalId, 'approved');
    return this.deploy({ solution, requestedBy: approver, skipApproval: true });
  }
}

export function createDeploymentPlatform() {
  return { scaffolder: new DeployScaffolder() };
}
