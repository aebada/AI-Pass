import type { AISystem, GovernanceLifecycleStage } from '@ai-pass/shared';

export const DEFAULT_LIFECYCLE: GovernanceLifecycleStage[] = [
  'registration',
  'risk_assessment',
  'policy_validation',
  'approval',
  'certification',
  'deployment',
  'monitoring',
  'recertification',
];

export interface WorkflowStepResult {
  stage: GovernanceLifecycleStage;
  status: 'completed' | 'blocked' | 'pending' | 'skipped';
  message: string;
}

/** Configurable governance lifecycle workflow engine stub */
export class WorkflowEngine {
  constructor(private stages: GovernanceLifecycleStage[] = DEFAULT_LIFECYCLE) {}

  getStages(): GovernanceLifecycleStage[] {
    return [...this.stages];
  }

  advance(_system: AISystem, completedStage: GovernanceLifecycleStage): GovernanceLifecycleStage | undefined {
    const idx = this.stages.indexOf(completedStage);
    if (idx < 0 || idx >= this.stages.length - 1) return undefined;
    return this.stages[idx + 1];
  }

  evaluateProgress(system: AISystem): WorkflowStepResult[] {
    const currentIdx = this.stages.indexOf(system.lifecycleStage);
    return this.stages.map((stage, idx) => ({
      stage,
      status: idx < currentIdx ? 'completed' : idx === currentIdx ? 'pending' : 'skipped',
      message: idx < currentIdx ? `${stage} completed` : idx === currentIdx ? `Awaiting ${stage}` : 'Not started',
    }));
  }
}
