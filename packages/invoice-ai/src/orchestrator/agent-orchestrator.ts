import { createId } from '@ai-pass/shared';
import type { MembershipTier } from '@ai-pass/shared';
import { INVOICE_AI_AGENTS } from '../agents.js';
import { defaultAIMiddleware } from '../middleware/ai-middleware.js';
import { InvoicePlanner, defaultInvoicePlanner } from './planner.js';
import type { OrchestratorPlan, OrchestratorRunResult } from './types.js';

export interface OrchestratorUploadInput {
  tenantId: string;
  userId: string;
  membershipTier: MembershipTier;
  fileName: string;
  mimeType: string;
  useCaseId?: string;
}

export class InvoiceAgentOrchestrator {
  private agentIds = new Set(INVOICE_AI_AGENTS.map((a) => a.id));

  constructor(private planner: InvoicePlanner = defaultInvoicePlanner) {}

  getRegisteredAgents(): string[] {
    return [...this.agentIds];
  }

  async runUploadPipeline(input: OrchestratorUploadInput): Promise<{
    plan: OrchestratorPlan;
    result: OrchestratorRunResult;
    middlewareCredits: number;
    modelId: string;
  }> {
    const plan = this.planner.planForUpload(input.fileName, input.useCaseId);
    const middleware = await defaultAIMiddleware.processExtraction({
      tenantId: input.tenantId,
      userId: input.userId,
      membershipTier: input.membershipTier,
      fileName: input.fileName,
      mimeType: input.mimeType,
    });

    const outputs: Record<string, unknown> = {
      middleware: {
        modelId: middleware.modelId,
        piiRedacted: middleware.pii.redactedFields,
        maskedPreview: middleware.maskedText.slice(0, 120),
      },
    };

    let stepsCompleted = 0;
    let creditsUsed = middleware.creditsUsed;

    for (const step of plan.steps) {
      if (!this.agentIds.has(step.agentId)) continue;
      outputs[step.role] = { agentId: step.agentId, status: 'stub_completed' };
      stepsCompleted += 1;
      creditsUsed += step.role === 'extractor' ? 0 : 2;
    }

    const result: OrchestratorRunResult = {
      planId: plan.id,
      runId: `orch_${createId()}`,
      stepsCompleted,
      outputs,
      creditsUsed,
      status: stepsCompleted === plan.steps.length ? 'completed' : 'partial',
    };

    return { plan, result, middlewareCredits: middleware.creditsUsed, modelId: middleware.modelId };
  }
}

export const defaultInvoiceAgentOrchestrator = new InvoiceAgentOrchestrator();
