import { MarketingPage } from '../components/MarketingPage';

export default function Page() {
  return (
    <MarketingPage
      eyebrow="Security"
      title="Security for enterprise AI infrastructure"
      description="Defence-grade posture for hybrid and air-gapped AI operations — identity, secrets, audit, and controlled execution."
      sections={[
        {
          title: 'Control surfaces',
          body: 'SSO / SAML / OAuth / Entra / LDAP, MFA, scoped API keys, managed secrets, RBAC and ABAC across Platform, Store, Governance, and Trust.',
        },
        {
          title: 'Execution safeguards',
          body: 'Policy gates before agent and workflow runs, Wallet metering, private catalogs, and continuous monitoring for drift and abuse.',
        },
      ]}
    />
  );
}
