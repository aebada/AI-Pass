import type { AgentDecision } from '@ai-pass/shared';
import type { AgentEvaluationResult, Offer, Supplier } from '../types.js';
import type { AgentRegistry, ExecutionEngine } from '@ai-pass/agent-studio';
import { SUPPLY_CHAIN_AGENT_TYPES } from '../agents.js';

export interface AgentOrchestratorContext {
  eventId: string;
  offer: Offer;
  supplier: Supplier;
  tenantId: string;
  userId: string;
}

/** Routes evaluation through Agent Studio — no direct provider calls */
export class AgentOrchestrator {
  constructor(
    private registry: AgentRegistry,
    private execution: ExecutionEngine,
  ) {}

  async runAll(ctx: AgentOrchestratorContext): Promise<AgentEvaluationResult[]> {
    const agents = this.registry.list().filter((a) =>
      (SUPPLY_CHAIN_AGENT_TYPES as readonly string[]).includes(a.type),
    );

    const results: AgentEvaluationResult[] = [];

    for (const agent of agents) {
      const stub = this.stubAgentResult(agent.type, ctx);
      results.push(stub);

      try {
        await this.execution.execute(agent.id, {
          eventId: ctx.eventId,
          offerId: ctx.offer.id,
          supplierId: ctx.supplier.id,
          tenantId: ctx.tenantId,
          userId: ctx.userId,
        });
      } catch {
        // Agent Studio execution is best-effort in stub mode
      }
    }

    return results;
  }

  private stubAgentResult(agentType: string, ctx: AgentOrchestratorContext): AgentEvaluationResult {
    const price = Number(ctx.offer.normalizedFields.price?.value ?? 0);
    const risk = ctx.supplier.riskScore;
    const delivery = Number(ctx.offer.normalizedFields.delivery_days?.value ?? 30);

    const agentMap: Record<string, { decision: AgentDecision; summary: string; credits: number }> = {
      sc_pricing: {
        decision: price < 150000 ? 'PASS' : 'NEEDS_INFO',
        summary: `Total price ${price} EUR — ${price < 150000 ? 'competitive' : 'above benchmark'}`,
        credits: 10,
      },
      sc_risk: {
        decision: risk > 60 ? 'FAIL' : risk > 40 ? 'NEEDS_INFO' : 'PASS',
        summary: `Supplier risk score ${risk}/100`,
        credits: 12,
      },
      sc_compliance: {
        decision: ctx.supplier.status === 'blocked' ? 'FAIL' : 'PASS',
        summary: `Compliance check for ${ctx.supplier.name}`,
        credits: 15,
      },
      sc_esg: {
        decision: ctx.supplier.esgScore >= 50 ? 'PASS' : 'NEEDS_INFO',
        summary: `ESG score ${ctx.supplier.esgScore}/100`,
        credits: 10,
      },
      sc_logistics: {
        decision: delivery <= 45 ? 'PASS' : 'NEEDS_INFO',
        summary: `Delivery lead time ${delivery} days`,
        credits: 8,
      },
      sc_decision: {
        decision: 'NEEDS_INFO',
        summary: 'Awaiting full evaluation pipeline',
        credits: 20,
      },
      sc_planner: {
        decision: 'PASS',
        summary: 'Evaluation plan: pricing → risk → compliance → scoring',
        credits: 5,
      },
      sc_evaluator: {
        decision: 'NEEDS_INFO',
        summary: 'Multi-criteria evaluation in progress',
        credits: 18,
      },
      sc_output: {
        decision: 'PASS',
        summary: 'Decision memo draft ready',
        credits: 8,
      },
    };

    const result = agentMap[agentType] ?? { decision: 'NEEDS_INFO' as AgentDecision, summary: 'Agent stub', credits: 5 };

    return {
      agentType,
      agentName: agentType.replace('sc_', '').replace(/_/g, ' '),
      offerId: ctx.offer.id,
      decision: result.decision,
      confidence: 0.82,
      summary: result.summary,
      citations: [`offer:${ctx.offer.id}`, `supplier:${ctx.supplier.id}`],
      creditsUsed: result.credits,
    };
  }
}
