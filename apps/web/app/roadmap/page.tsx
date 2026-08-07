import { MarketingPage } from '../components/MarketingPage';

export default function Page() {
  return (
    <MarketingPage
      eyebrow="Roadmap"
      title="Platform roadmap"
      description="Routing, governance, trust certification, Discovery Hub scale, and sovereign deployment capabilities."
      sections={[
        {
          title: 'Now',
          body: 'Enterprise IA, Discovery Hub depth, Enterprise App Store taxonomy, Routing Lab, Governance Center, Trust ladder, Identity plane, executive dashboard, and pricing calculators.',
        },
        {
          title: 'Next',
          body: '50k+ Discovery ingestion pipelines, richer benchmark corpora, SCIM live sync connectors, and expanded air-gapped installers.',
        },
        {
          title: 'Later',
          body: 'Cross-cloud sovereign fabrics, industry control packs, and partner-certified deployment templates for Government and Defence.',
        },
      ]}
    />
  );
}
