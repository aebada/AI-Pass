'use client';

import Link from 'next/link';
import { MEMBERSHIP_PLANS, MEMBERSHIP_FEATURE_MATRIX } from '@ai-pass/membership';
import type { MembershipFeature, MembershipTier } from '@ai-pass/shared';
import { useApp } from '../../components/premium/AppProviders';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import styles from './membership.module.css';
import { ModuleIcon } from '@ai-pass/ui';

const TIER_MAP: Record<string, MembershipTier> = {
  free: 'free',
  pro: 'professional',
  professional: 'professional',
  power: 'power',
  enterprise: 'enterprise',
};

const FEATURE_LABELS: Partial<Record<MembershipFeature, string>> = {
  playground: 'Playground',
  playground_compare: 'Model compare',
  playground_benchmark: 'Benchmarking',
  marketplace_browse: 'Marketplace browse',
  marketplace_install: 'Marketplace install',
  prompt_lab: 'Prompt Lab',
  agent_studio: 'Agent Studio',
  workflows: 'Workflows',
  analysis_studio: 'Analysis Studio',
  knowledge_pipeline: 'Knowledge Pipeline',
  multi_agent: 'Multi-agent',
  automations: 'Automations',
  benchmarking: 'Benchmarking',
  premium_models: 'Premium models',
  all_models: 'All models',
  private_routing: 'Private routing',
  governance: 'Governance',
  compliance: 'Compliance',
  dedicated_support: 'Dedicated support',
  unlimited_connections: 'Unlimited connections',
};

export default function MembershipPage() {
  const { user, updateUser } = useApp();
  const currentTier = TIER_MAP[user?.plan ?? 'free'] ?? 'free';

  const matrixFeatures = Object.keys(MEMBERSHIP_FEATURE_MATRIX) as MembershipFeature[];

  return (
    <WorkspaceLayoutClient
      title="Universal AI Membership"
      subtitle="One membership. Every AI model. One wallet."
    >
      <div className={styles.hero}>
        <p className={styles.heroText}>
          Like Netflix for AI — subscribe once, access GPT-5, Claude, Gemini, DeepSeek, and {MEMBERSHIP_PLANS.length > 0 ? '30+' : 'all'} models
          without managing separate API keys or provider subscriptions.
        </p>
      </div>

      <div className={styles.plans}>
        {MEMBERSHIP_PLANS.map((plan) => (
          <article
            key={plan.id}
            className={`${styles.planCard} ${currentTier === plan.id ? styles.planCurrent : ''} ${plan.id === 'professional' ? styles.planFeatured : ''}`}
          >
            {plan.id === 'professional' && <span className={styles.badge}>Most popular</span>}
            <h3 className={styles.planName}>{plan.name}</h3>
            <p className={styles.planTagline}>{plan.tagline}</p>
            <div className={styles.price}>{plan.priceLabel}</div>
            <ul className={styles.highlights}>
              {plan.highlights.map((h) => (
                <li key={h}><ModuleIcon name="check" size={14} /> {h}</li>
              ))}
            </ul>
            {currentTier === plan.id ? (
              <button type="button" className={styles.btnSecondary} disabled>Current plan</button>
            ) : plan.id === 'enterprise' ? (
              <Link href="/help" className={styles.btnSecondary}>Contact sales</Link>
            ) : (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={() =>
                  updateUser({
                    plan:
                      plan.id === 'enterprise'
                        ? 'enterprise'
                        : plan.id === 'free'
                          ? 'free'
                          : 'pro',
                  })
                }
              >
                {plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
              </button>
            )}
          </article>
        ))}
      </div>

      <section className={styles.matrix}>
        <h2 className={styles.matrixTitle}>Feature matrix</h2>
        <div className={styles.matrixWrap}>
          <table className={styles.matrixTable}>
            <thead>
              <tr>
                <th>Feature</th>
                {MEMBERSHIP_PLANS.map((p) => (
                  <th key={p.id}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrixFeatures.map((feature) => (
                <tr key={feature}>
                  <td>{FEATURE_LABELS[feature] ?? feature}</td>
                  {(['free', 'professional', 'power', 'enterprise'] as MembershipTier[]).map((tier) => (
                    <td key={tier} className={styles.checkCell}>
                      {MEMBERSHIP_FEATURE_MATRIX[feature]?.[tier] ? <ModuleIcon name="check" size={14} /> : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </WorkspaceLayoutClient>
  );
}
