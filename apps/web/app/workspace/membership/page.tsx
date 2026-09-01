'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { MEMBERSHIP_PLANS, MEMBERSHIP_FEATURE_MATRIX } from '@ai-pass/membership';
import type { MembershipFeature, MembershipTier } from '@ai-pass/shared';
import { useApp } from '../../components/premium/AppProviders';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { DEMO_MAILTO } from '../../lib/site-nav';
import styles from './membership.module.css';

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

  const [seats, setSeats] = useState(50);
  const [monthlyTokensM, setMonthlyTokensM] = useState(20);
  const [avgCostPer1M, setAvgCostPer1M] = useState(8);
  const [hoursSavedPerSeat, setHoursSavedPerSeat] = useState(6);
  const [hourlyRate, setHourlyRate] = useState(75);

  const enterpriseEstimate = useMemo(() => {
    const seatCost = seats * 49;
    const usageCost = monthlyTokensM * avgCostPer1M;
    const governancePremium = seats > 100 ? 2500 : 1200;
    return {
      seatCost,
      usageCost,
      governancePremium,
      total: seatCost + usageCost + governancePremium,
    };
  }, [seats, monthlyTokensM, avgCostPer1M]);

  const roi = useMemo(() => {
    const productivityGain = seats * hoursSavedPerSeat * hourlyRate;
    const routingSavings = monthlyTokensM * avgCostPer1M * 0.28;
    const complianceAvoidance = seats >= 100 ? 18000 : 6500;
    const monthlyBenefit = productivityGain + routingSavings + complianceAvoidance / 12;
    const paybackMonths =
      enterpriseEstimate.total > 0 ? (enterpriseEstimate.total / monthlyBenefit) * 1 : 0;
    return {
      productivityGain,
      routingSavings,
      complianceAvoidance,
      monthlyBenefit,
      paybackMonths,
      annualRoi:
        ((monthlyBenefit * 12 - enterpriseEstimate.total * 12) /
          Math.max(enterpriseEstimate.total * 12, 1)) *
        100,
    };
  }, [seats, hoursSavedPerSeat, hourlyRate, monthlyTokensM, avgCostPer1M, enterpriseEstimate.total]);

  return (
    <WorkspaceLayoutClient
      title="Enterprise pricing"
      subtitle="Feature matrix, enterprise calculator, and ROI — Book Demo or Contact Sales"
    >
      <div className={styles.hero}>
        <p className={styles.heroText}>
          One membership across cloud and local models, Wallet metering, Governance, Trust certification, and
          the Enterprise AI App Store — for Government, Defence, private cloud, hybrid, and air-gapped estates.
        </p>
        <div className={styles.heroCtas}>
          <a href={DEMO_MAILTO} className={styles.btnPrimary}>
            Book Enterprise Demo
          </a>
          <a href="mailto:sales@aipass.space" className={styles.btnSecondary}>
            Contact Sales
          </a>
          <Link href="/login" className={styles.btnSecondary}>
            Start Free
          </Link>
        </div>
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
                <li key={h}>✓ {h}</li>
              ))}
            </ul>
            {currentTier === plan.id ? (
              <button type="button" className={styles.btnSecondary} disabled>
                Current plan
              </button>
            ) : plan.id === 'enterprise' ? (
              <a href={DEMO_MAILTO} className={styles.btnSecondary}>
                Book Demo
              </a>
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
                      {MEMBERSHIP_FEATURE_MATRIX[feature]?.[tier] ? '✓' : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.calcGrid}>
        <div className={styles.calcCard}>
          <h2 className={styles.matrixTitle}>Enterprise calculator</h2>
          <p className={styles.calcHint}>Estimate seats, token volume, and governance premium (demo numbers).</p>
          <label className={styles.calcField}>
            Seats
            <input
              type="number"
              min={1}
              value={seats}
              onChange={(e) => setSeats(Number(e.target.value) || 1)}
            />
          </label>
          <label className={styles.calcField}>
            Monthly tokens (millions)
            <input
              type="number"
              min={1}
              value={monthlyTokensM}
              onChange={(e) => setMonthlyTokensM(Number(e.target.value) || 1)}
            />
          </label>
          <label className={styles.calcField}>
            Blended $/1M tokens
            <input
              type="number"
              min={1}
              value={avgCostPer1M}
              onChange={(e) => setAvgCostPer1M(Number(e.target.value) || 1)}
            />
          </label>
          <dl className={styles.calcResult}>
            <div>
              <dt>Seats</dt>
              <dd>${enterpriseEstimate.seatCost.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Usage</dt>
              <dd>${enterpriseEstimate.usageCost.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Governance / Trust</dt>
              <dd>${enterpriseEstimate.governancePremium.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Est. monthly</dt>
              <dd>${enterpriseEstimate.total.toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.calcCard}>
          <h2 className={styles.matrixTitle}>ROI calculator</h2>
          <p className={styles.calcHint}>
            Productivity hours, routing savings, and compliance cost avoidance vs estimated spend.
          </p>
          <label className={styles.calcField}>
            Hours saved / seat / month
            <input
              type="number"
              min={1}
              value={hoursSavedPerSeat}
              onChange={(e) => setHoursSavedPerSeat(Number(e.target.value) || 1)}
            />
          </label>
          <label className={styles.calcField}>
            Fully loaded hourly rate ($)
            <input
              type="number"
              min={1}
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value) || 1)}
            />
          </label>
          <dl className={styles.calcResult}>
            <div>
              <dt>Productivity / mo</dt>
              <dd>${Math.round(roi.productivityGain).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Routing savings / mo</dt>
              <dd>${Math.round(roi.routingSavings).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Compliance (annual)</dt>
              <dd>${roi.complianceAvoidance.toLocaleString()}</dd>
            </div>
            <div>
              <dt>Payback</dt>
              <dd>{roi.paybackMonths.toFixed(1)} mo</dd>
            </div>
            <div>
              <dt>Est. annual ROI</dt>
              <dd>{Math.round(roi.annualRoi)}%</dd>
            </div>
          </dl>
          <div className={styles.heroCtas} style={{ marginTop: 16 }}>
            <a href={DEMO_MAILTO} className={styles.btnPrimary}>
              Book Enterprise Demo
            </a>
            <a href="mailto:sales@aipass.space" className={styles.btnSecondary}>
              Contact Sales
            </a>
          </div>
        </div>
      </section>
    </WorkspaceLayoutClient>
  );
}
