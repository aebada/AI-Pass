import SystemDetailClient from './SystemDetailClient';

const INVENTORY_IDS = [
  'ais_inv_agent',
  'ais_support_bot',
  'ais_supply_workflow',
  'ais_gpt4_router',
  'ais_hr_app',
  'ais_knowledge_rag',
  'ais_custom_analytics',
  'ais_erp_integration',
] as const;

export function generateStaticParams() {
  return INVENTORY_IDS.map((id) => ({ id }));
}

export default function GovernanceInventoryDetailPage() {
  return <SystemDetailClient />;
}
