import { MarketingPage } from '../components/MarketingPage';

export default function Page() {
  return (
    <MarketingPage
      eyebrow="Customers"
      title="Built for regulated enterprises"
      description="Government, Defence, manufacturing, banking, and healthcare teams running governed AI infrastructure."
      sections={[
        {
          title: 'Who ships with AI-Pass',
          body: 'Organizations that need enterprise-ready AI with compliance, private routing, and operational governance — not consumer chat wrappers.',
          items: ['Government digital services', 'Defence and dual-use programs', 'Banks and insurers', 'Hospitals and life sciences', 'Industrial manufacturers'],
        },
      ]}
    />
  );
}
