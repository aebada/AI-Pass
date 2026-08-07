import { MarketingPage } from '../components/MarketingPage';

export default function Page() {
  return (
    <MarketingPage
      eyebrow="Research"
      title="Research and whitepapers"
      description="Enterprise AI governance, trust scoring, and secure orchestration research from AI-Pass."
      sections={[
        {
          title: 'Trust scoring methodology',
          body: 'How Bronze→Platinum certification combines functional, safety, hallucination, and compliance dimensions into Trust, Risk, and Compliance scores.',
        },
        {
          title: 'Dynamic multi-objective routing',
          body: 'Balancing cost, latency, privacy, compliance, reasoning depth, and context windows across cloud and local providers.',
        },
        {
          title: 'Governance for autonomous agents',
          body: 'Inventory, policy, approvals, and continuous monitoring patterns for regulated industries.',
        },
      ]}
    />
  );
}
