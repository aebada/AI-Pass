import { MarketingPage } from '../components/MarketingPage';

export default function Page() {
  return (
    <MarketingPage
      eyebrow="Careers"
      title="Build enterprise AI infrastructure"
      description="Join a team shipping secure orchestration, trust certification, and governed execution for regulated industries."
      sections={[
        {
          title: 'Open focus areas',
          body: 'Platform engineering, security, governance UX, Discovery scale, and sovereign deployment.',
          items: ['Infrastructure & Routing', 'Trust / Compliance engineering', 'Product design for enterprise ops', 'Public-sector solutions'],
        },
      ]}
    />
  );
}
