import { MarketingPage } from '../components/MarketingPage';

export default function Page() {
  return (
    <MarketingPage
      eyebrow="Partners"
      title="Partner with AI-Pass"
      description="System integrators, cloud providers, and ISVs delivering Enterprise AI Infrastructure with AI-Pass."
      sections={[
        {
          title: 'Partner motions',
          body: 'Co-sell Enterprise deployments, publish to the Enterprise App Store, and certify solutions through Trust Bronze→Platinum.',
          items: ['Implementation partners', 'Technology / cloud partners', 'ISV and agent publishers', 'Defence and public-sector specialists'],
        },
      ]}
    />
  );
}
