'use client';

import Link from 'next/link';
import { Card, workspaceTokens } from '@ai-pass/ui';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './identity.module.css';

const IDENTITY_CAPABILITIES = [
  {
    title: 'SSO',
    detail: 'Enterprise single sign-on with session federation across workspace modules.',
  },
  {
    title: 'SAML',
    detail: 'SAML 2.0 IdP integration for Government and Defence identity providers.',
  },
  {
    title: 'OAuth',
    detail: 'OAuth 2.0 / OIDC for modern identity brokers and developer applications.',
  },
  {
    title: 'Microsoft Entra ID',
    detail: 'Entra ID (Azure AD) tenant sync with conditional access alignment.',
  },
  {
    title: 'LDAP',
    detail: 'Directory bind for air-gapped and private-cloud directory services.',
  },
  {
    title: 'SCIM',
    detail: 'Automated user and group provisioning / deprovisioning.',
  },
  {
    title: 'MFA',
    detail: 'Multi-factor enforcement for privileged roles and approval workflows.',
  },
  {
    title: 'API keys',
    detail: 'Scoped machine credentials with rotation and Wallet metering.',
  },
  {
    title: 'Secrets',
    detail: 'Managed secrets for BYOK, webhooks, and private connectors.',
  },
  {
    title: 'RBAC',
    detail: 'Role-based access across Platform, Store, Governance, and Trust.',
  },
  {
    title: 'ABAC',
    detail: 'Attribute-based policies for residency, clearance, and data classification.',
  },
];

export default function EnterpriseIdentityPage() {
  return (
    <WorkspaceLayoutClient
      title="Enterprise Identity"
      subtitle="SSO, SCIM, Entra ID, LDAP, SAML, OAuth, MFA, API keys, secrets, RBAC, and ABAC"
    >
      <div className={styles.page}>
        <Card padding="lg">
          <h2 className={styles.title}>Identity & access control plane</h2>
          <p className={styles.desc}>
            Wire corporate identity into AI-Pass for hybrid and air-gapped estates. Permissions, groups, and
            roles feed Governance approvals, Trust certification gates, and Store install policies.
          </p>
          <div className={styles.actions}>
            <Link href="/workspace/governance/policies" className={styles.link}>
              Manage policies →
            </Link>
            <Link href="/workspace/governance/approvals" className={styles.link}>
              Review approvals →
            </Link>
            <Link href="/workspace/providers" className={styles.link}>
              Provider BYOK →
            </Link>
          </div>
        </Card>

        <div className={styles.grid}>
          {IDENTITY_CAPABILITIES.map((item) => (
            <article key={item.title} className={styles.card}>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </article>
          ))}
        </div>

        <Card padding="lg">
          <h2 className={styles.title}>Groups, roles, and permissions</h2>
          <ul className={styles.list}>
            <li>
              <strong>Platform Admin</strong> — org-wide identity, secrets, and membership controls
            </li>
            <li>
              <strong>Governance Officer</strong> — inventory, risk, policy, and approval authority
            </li>
            <li>
              <strong>Trust Auditor</strong> — certification runs, evidence export, monitoring alerts
            </li>
            <li>
              <strong>Developer</strong> — Store publish, API keys, sandbox routing
            </li>
            <li>
              <strong>Operator</strong> — execute agents/workflows within assigned scopes
            </li>
          </ul>
          <p style={{ marginTop: 16, fontSize: 13, color: workspaceTokens.colors.textMuted }}>
            Demo mode shows the control surface. Connect an IdP in Enterprise onboarding to activate live sync.
          </p>
        </Card>
      </div>
    </WorkspaceLayoutClient>
  );
}
