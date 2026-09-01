import { MarketingPage } from '../components/MarketingPage';

export default function Page() {
  return (
    <MarketingPage
      eyebrow="Government"
      title="Enterprise AI infrastructure for Government"
      description="Secure, governed AI operations for public-sector missions — private cloud, hybrid, and air-gapped patterns with compliance built into the stack."
      sections={[
        {
          title: 'Mission-aligned control plane',
          body: 'Route workloads across approved providers, enforce policy at execution time, and keep audit evidence for ISO 42001, ISO 27001, GDPR, NIS2, and SOC 2 programs.',
          items: [
            'Private cloud and sovereign residency options',
            'Governance inventory, approvals, and continuous monitoring',
            'Trust certification from Bronze to Platinum',
            'Enterprise identity: SSO, SAML, Entra ID, LDAP, SCIM, MFA',
          ],
        },
        {
          title: 'Procurement-ready packaging',
          body: 'Enterprise App Store private catalogs, Wallet metering, and membership gates so agencies can approve what runs — and prove it.',
        },
      ]}
    />
  );
}
