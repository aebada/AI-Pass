import { MarketingPage } from '../components/MarketingPage';

export default function Page() {
  return (
    <MarketingPage
      eyebrow="Compliance"
      title="Built-in compliance for regulated AI"
      description="ISO 42001, ISO 27001, GDPR, NIS2, and SOC 2 mapped into Trust certification, Governance policies, and evidence exports."
      sections={[
        {
          title: 'Framework coverage',
          body: 'Operationalize compliance inside the execution layer — not as a slide deck after the fact.',
          items: ['ISO 42001 AI management', 'ISO 27001 information security', 'GDPR data protection', 'NIS2 essential entities', 'SOC 2 trust services'],
        },
        {
          title: 'Evidence on demand',
          body: 'Export validation runs, certification status, inventory, and approval trails for auditors and procurement.',
        },
      ]}
    />
  );
}
