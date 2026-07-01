import AppDetailClient from './AppDetailClient';

export function generateStaticParams() {
  return [
    { id: 'invoice-ai' },
    { id: 'supply-chain-ai' },
    { id: 'customer-support-ai' },
    { id: 'hr-ai' },
    { id: 'compliance-guard' },
    { id: 'agent-toolkit-oss' },
    { id: 'legal-contract-ai' },
    { id: 'marketing-insights-ai' },
    { id: 'sales-ai' },
    { id: 'sales-copilot' },
    { id: 'knowledge-pipeline-pack' },
  ];
}

export default function StoreAppDetailPage() {
  return <AppDetailClient />;
}
