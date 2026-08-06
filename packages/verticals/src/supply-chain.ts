import { defaultSupplyChainAIService } from '@ai-pass/supply-chain-ai';

export {
  defaultSupplyChainAIService,
  DEFAULT_SCORING_TEMPLATES,
  DEFAULT_RULES,
  SUPPLY_CHAIN_AGENTS,
  DEMO_TENANT_ID,
} from '@ai-pass/supply-chain-ai';

/** @deprecated Use SupplyChainAIService from @ai-pass/supply-chain-ai */
export class SupplyChainAIEngine {
  service = defaultSupplyChainAIService;

  get events() {
    return {
      list: () => this.service.listEvents('tenant_acme').events,
      get: (id: string) => this.service.getEvent(id),
    };
  }

  get offers() {
    return {
      listByEvent: (eventId: string) => this.service.listOffers(eventId),
    };
  }

  get evaluation() {
    return {
      evaluate: async (eventId: string) => {
        const result = await this.service.runEvaluation({
          tenantId: 'tenant_acme',
          userId: 'demo-user',
          tier: 'professional',
          eventId,
        });
        return result.evaluation;
      },
    };
  }

  runEvaluation(eventId: string) {
    return this.evaluation.evaluate(eventId);
  }
}

export function createSupplyChainPlatform() {
  return new SupplyChainAIEngine();
}
