import type { SkillRegistry } from '@ai-pass/marketplace';

/** Marketplace app registration metadata */
export const SUPPLY_CHAIN_APP = {
  id: 'supply-chain-ai',
  name: 'Supply Chain AI',
  description: 'Enterprise procurement and supplier evaluation platform',
  category: 'supply_chain' as const,
  features: ['sourcing', 'offer-parsing', 'rules-engine', 'scoring', 'agent-orchestration', 'erp-sync'],
  storeAppId: 'supply-chain',
};

/** Skills are registered via marketplace DEFAULT_SKILLS; hook for future extension */
export function registerSupplyChainSkills(_registry: SkillRegistry): void {
  // Marketplace runtime registers platform skills; supply-chain skills use agent-studio routing
}
