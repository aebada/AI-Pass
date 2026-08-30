'use client';

import Link from 'next/link';
import { Badge, Card, Button } from '@ai-pass/ui';
import { BusinessShell } from '../components/business/BusinessShell';
import { useApp } from '../components/premium/AppProviders';
import styles from './billing.module.css';

const PLANS = [
  {
    id: 'free' as const,
    name: 'Free',
    price: '$0',
    period: 'forever',
    features: ['Requirements wizard', '3 solutions', 'Community templates', 'Web platform (demo)'],
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: '$49',
    period: '/user/mo',
    features: ['Unlimited solutions', 'Agent Studio', 'One-click deploy', 'Priority support', 'Team workspaces (5)'],
    popular: true,
  },
  {
    id: 'enterprise' as const,
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    features: ['VPC / on-prem', 'SSO & SAML', 'Custom governance', 'Dedicated CSM', 'Unlimited workspaces'],
  },
];

export default function BillingPage() {
  const { user, updateUser } = useApp();

  return (
    <BusinessShell title="Billing & Subscription" subtitle="Manage your plan and payment methods">
      <div className={styles.currentPlan}>
        <Card variant="gradient" padding="md">
          <div className={styles.currentHeader}>
            <div>
              <span className={styles.label}>Current plan</span>
              <h2 className={styles.planName}>{user?.plan ?? 'free'}</h2>
            </div>
            <Badge variant={user?.plan === 'enterprise' ? 'enterprise' : user?.plan === 'pro' ? 'pro' : 'outline'}>
              Active
            </Badge>
          </div>
          <p className={styles.renewal}>Next billing date: - (scaffold)</p>
        </Card>
      </div>

      <div className={styles.plans}>
        {PLANS.map((plan) => (
          <Card
            key={plan.id}
            variant={plan.popular ? 'gradient' : 'glass'}
            padding="lg"
            hover
            className={user?.plan === plan.id ? styles.planCurrent : ''}
          >
            {plan.popular && <Badge variant="pro">Most popular</Badge>}
            <h3 className={styles.name}>{plan.name}</h3>
            <div className={styles.price}>
              <span className={styles.amount}>{plan.price}</span>
              <span className={styles.period}>{plan.period}</span>
            </div>
            <ul className={styles.features}>
              {plan.features.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
            {user?.plan === plan.id ? (
              <Button variant="secondary" size="sm" disabled>Current plan</Button>
            ) : plan.id === 'enterprise' ? (
              <Link href="/help" className={styles.contactBtn}>Contact sales</Link>
            ) : (
              <Button variant="primary" size="sm" onClick={() => updateUser({ plan: plan.id })}>
                {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
              </Button>
            )}
          </Card>
        ))}
      </div>

      <Card variant="outline" padding="md" style={{ marginTop: 24 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>Payment method</h3>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
          Billing integration scaffold - connect Stripe or Paddle for production.
        </p>
      </Card>
    </BusinessShell>
  );
}
