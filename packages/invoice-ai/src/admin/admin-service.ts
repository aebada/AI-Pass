import { defaultAIRouter } from '../middleware/ai-router.js';
import { DEMO_WORKFLOWS } from '../demo-data.js';
import type { AdminPlatformMetrics } from './types.js';

export class AdminMetricsService {
  getMetrics(tenantId: string): AdminPlatformMetrics {
    const route = defaultAIRouter.select({
      taskType: 'extraction',
      tenantId,
      userId: 'system',
      membershipTier: 'professional',
    });

    const workflows = DEMO_WORKFLOWS.filter((w) => w.tenantId === tenantId);

    return {
      tenantId,
      period: new Date().toISOString().slice(0, 7),
      totalCostUsd: 42.18,
      totalCredits: 1840,
      totalTokens: 284_500,
      activeModelRouter: route.decision.model.displayName,
      piiMaskedRequests: 127,
      agentRuns: 342,
      tokenUsage: [
        {
          modelId: route.decision.model.id,
          providerId: route.decision.model.providerId,
          inputTokens: 142_000,
          outputTokens: 28_400,
          requests: 89,
          costUsd: 18.42,
        },
        {
          modelId: 'gpt-4o-mini',
          providerId: 'openai',
          inputTokens: 98_000,
          outputTokens: 16_100,
          requests: 156,
          costUsd: 12.30,
        },
        {
          modelId: 'claude-haiku',
          providerId: 'anthropic',
          inputTokens: 44_500,
          outputTokens: 8_200,
          requests: 97,
          costUsd: 11.46,
        },
      ],
      workflowRuns: workflows.map((w) => ({
        workflowId: w.id,
        workflowName: w.name,
        runsToday: w.isActive ? Math.floor(Math.random() * 12) + 3 : 0,
        successRate: w.isActive ? 94 + Math.floor(Math.random() * 5) : 0,
        lastRunAt: new Date(Date.now() - Math.random() * 86_400_000).toISOString(),
      })),
    };
  }
}

export const defaultAdminMetricsService = new AdminMetricsService();
