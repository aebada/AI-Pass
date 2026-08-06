'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { WalletSummary } from '@ai-pass/shared';
import { Badge, Card } from '@ai-pass/ui';
import { WalletCredits } from '../../../components/dashboard/WalletCredits';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { useMarketplacePlatform } from '../../../components/marketplace/marketplace-client';
import { useApp } from '../../../components/premium/AppProviders';
import styles from '../marketplace.module.css';

export default function MarketplaceBillingPage() {
  const { user } = useApp();
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const platform = useMarketplacePlatform();

  useEffect(() => {
    let cancelled = false;
    fetch('/api/v1/runtime/wallet')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: WalletSummary | null) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!summary) {
    return (
      <WorkspaceLayoutClient title="Wallet & Billing" subtitle="Loading wallet…">
        <p>Loading…</p>
      </WorkspaceLayoutClient>
    );
  }

  const { balance, spendByProvider } = summary;

  const sampleRevenue = platform.revenue.calculate({
    developerId: 'dev_ai_pass',
    appId: 'app_invoice_ai',
    grossRevenue: 1000,
    period: '2025-06',
  });

  return (
    <WorkspaceLayoutClient
      title="Wallet & Billing"
      subtitle="Marketplace credits, revenue share, and spend tracking"
    >
      <div className={styles.grid}>
        <WalletCredits
          spent={balance.spentUsd}
          budget={balance.monthlyBudgetUsd}
          daysLeft={balance.daysLeftInPeriod}
          breakdown={spendByProvider.map((s) => ({
            provider: s.provider,
            amount: s.amountUsd,
            percent: s.percent,
            highlight: s.highlight,
          }))}
        />

        <Card padding="lg">
          <h2 className={styles.sectionTitle}>Credits Balance</h2>
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{balance.creditsRemaining.toLocaleString()}</span>
              <span className={styles.statLabel}>Remaining</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statValue}>{balance.creditsUsed.toLocaleString()}</span>
              <span className={styles.statLabel}>Used</span>
            </div>
          </div>
        </Card>
      </div>

      <Card padding="lg">
        <h2 className={styles.sectionTitle}>Revenue Share Model (70/30)</h2>
        <p className={styles.cardMeta}>
          Developer payout: ${sampleRevenue.developerPayout.toFixed(2)} ·
          Platform fee: ${sampleRevenue.platformFee.toFixed(2)} ·
          Gross: ${sampleRevenue.grossRevenue.toFixed(2)}
        </p>
        <Badge variant="outline">Refunds: stub — contact support</Badge>
      </Card>

      <Link href="/workspace/wallet" className={styles.navLink}>
        Open full AI Wallet →
      </Link>
    </WorkspaceLayoutClient>
  );
}
