import { MarketingPage } from '../components/MarketingPage';

export default function Page() {
  return (
    <MarketingPage
      eyebrow="Defence"
      title="Secure AI infrastructure for Defence"
      description="On-premises and air-gapped deployment for Defence environments, with governance, audit, and trust controls integrated into the execution layer."
      sections={[
        {
          title: 'Air-gapped by design',
          body: 'Run local models through the Routing Layer, keep secrets and identity on-prem, and sync only when policy allows.',
          items: [
            'Local / Ollama and private model endpoints',
            'ABAC policies for clearance and classification',
            'Offline-capable Trust and Governance evidence packs',
            'Hardened deployment patterns for hybrid enclaves',
          ],
        },
        {
          title: 'Operational assurance',
          body: 'Approvals, risk registers, and continuous monitoring keep autonomous agents inside defined mission boundaries.',
        },
      ]}
    />
  );
}
