import { MarketingPage } from '../components/MarketingPage';

export default function Page() {
  return (
    <MarketingPage
      eyebrow="Case Studies"
      title="Enterprise AI infrastructure in production"
      description="Outcomes across Government, Defence, manufacturing, banking, and healthcare operations."
      sections={[
        {
          title: 'Public sector routing consolidation',
          body: 'A multi-agency program unified model access under AI-Pass Routing, cutting redundant provider spend while preserving residency controls.',
          items: ['28% blended inference cost reduction', 'Central Wallet and approval gates', 'ISO 42001 evidence automation'],
        },
        {
          title: 'Manufacturing agent fleet',
          body: 'Plant operators deployed vision QA and anomaly agents from the Enterprise App Store with Trust Gold certification and continuous monitoring.',
        },
        {
          title: 'Banking governance rollout',
          body: 'Risk and compliance teams mapped AI inventory to NIS2 / SOC 2 controls with Bronze→Platinum certification pathways.',
        },
      ]}
    />
  );
}
