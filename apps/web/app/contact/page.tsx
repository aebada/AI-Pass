import { MarketingPage } from '../components/MarketingPage';

export default function Page() {
  return (
    <MarketingPage
      eyebrow="Contact"
      title="Talk to enterprise solutions"
      description="Book a demo for Government, Defence, and regulated enterprise deployments — or start free and explore the workspace."
      sections={[
        {
          title: 'How to reach us',
          body: 'Use Book Enterprise Demo for procurement and security reviews. Sales handles private catalogs, air-gapped packages, and partner introductions.',
          items: ['Demo: enterprise walkthrough of Routing, Governance, Trust, and Store', 'Sales: commercial and deployment scoping', 'Support: existing tenant operations'],
        },
      ]}
      secondaryCta={{ label: 'Contact Sales', href: 'mailto:sales@aipass.space' }}
    />
  );
}
