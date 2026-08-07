import { MarketingPage } from '../components/MarketingPage';

export default function Page() {
  return (
    <MarketingPage
      eyebrow="Privacy"
      title="Privacy for enterprise AI workloads"
      description="Data minimization, residency controls, and private routing for regulated processing — including air-gapped options."
      sections={[
        {
          title: 'Privacy controls',
          body: 'Prefer local models, constrain providers by policy, and keep personal data out of unmanaged endpoints.',
          items: ['Residency-aware routing', 'BYOK and secrets isolation', 'Audit trails for data-touching agents', 'GDPR-aligned processing patterns'],
        },
      ]}
    />
  );
}
