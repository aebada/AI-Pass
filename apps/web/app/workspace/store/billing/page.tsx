'use client';

import Link from 'next/link';
import { defaultWalletService } from '@ai-pass/wallet';
import { STORE_ROUTES } from '@ai-pass/routes';
import { Card } from '@ai-pass/ui';
import { WalletCredits } from '../../../components/dashboard/WalletCredits';
import { WorkspaceLayoutClient } from '../../../components/workspace/WorkspaceLayoutClient';
import { useStorePlatform, DEMO_USER } from '../../../components/store/store-client';
import styles from '../store.module.css';

export default function StoreBillingPage() {
  const summary = defaultWalletService.getSummary(DEMO_USER);
  const { store } = useStorePlatform();
  const share = store.getRevenueShare();
  const { balance, spendByProvider } = summary;
  const txs = store.installations.getTransactions(DEMO_USER);

  return (
    <WorkspaceLayoutClient title="Wallet & Billing" subtitle="Store credits, revenue share 70/30, execution billing">
      <Link href={STORE_ROUTES.home} className={styles.navLink}>← Store Home</Link>
      <div className={styles.grid} style={{ marginTop: 16 }}>
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
          <h3 className={styles.sectionTitle}>Revenue Share</h3>
          <p className={styles.cardMeta}>
            Developer: {(share.developerShare * 100).toFixed(0)}% · Platform: {(share.platformFee * 100).toFixed(0)}%
          </p>
        </Card>
        <Card padding="lg">
          <h3 className={styles.sectionTitle}>Store Transactions</h3>
          {txs.length === 0 ? (
            <p className={styles.cardMeta}>No store transactions yet.</p>
          ) : (
            txs.map((t) => (
              <p key={t.id} className={styles.cardMeta}>{t.description} — {t.credits} credits</p>
            ))
          )}
        </Card>
      </div>
    </WorkspaceLayoutClient>
  );
}
