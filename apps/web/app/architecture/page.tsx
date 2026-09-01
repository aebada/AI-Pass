import { MarketingPage } from '../components/MarketingPage';

export default function Page() {
  return (
    <MarketingPage
      eyebrow="Architecture"
      title="Enterprise AI architecture"
      description="Cloud, private cloud, hybrid, and air-gapped topologies with a shared Routing, Governance, Trust, and Store control plane."
      sections={[
        {
          title: 'Reference planes',
          body: 'Discovery and Store for capability intake; Routing for model selection; Governance and Identity for control; Trust for assurance; Wallet for economics.',
        },
        {
          title: 'Deployment modes',
          body: 'SaaS, VPC/private cloud, hybrid bridges, and fully air-gapped packages for Defence and classified workloads.',
        },
      ]}
    />
  );
}
