'use client';

import { useEffect, useState } from 'react';
import type { WalletSummary } from '@ai-pass/shared';
import { WalletCredits } from '../../components/dashboard/WalletCredits';
import { WorkspaceLayoutClient } from '../../components/workspace/WorkspaceLayoutClient';
import { useApp } from '../../components/premium/AppProviders';
import styles from './wallet.module.css';

export default function WalletPage() {
  const { user } = useApp();
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/v1/runtime/wallet')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: WalletSummary | null) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading) {
    return (
      <WorkspaceLayoutClient title="AI Wallet" subtitle="Loading your wallet…">
        <p className={styles.empty}>Loading…</p>
      </WorkspaceLayoutClient>
    );
  }

  if (!summary) {
    return (
      <WorkspaceLayoutClient title="AI Wallet" subtitle="Sign in to view your wallet">
        <p className={styles.empty}>Unable to load wallet. Please sign in and try again.</p>
      </WorkspaceLayoutClient>
    );
  }

  const { balance, spendByProvider, recentUsage } = summary;

  return (
    <WorkspaceLayoutClient
      title="AI Wallet"
      subtitle="One wallet for every model — credits, spend, and execution history"
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

        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Credits balance</h2>
          <div className={styles.statRow}>
            <div>
              <span className={styles.statValue}>{balance.creditsRemaining.toLocaleString()}</span>
              <span className={styles.statLabel}>remaining</span>
            </div>
            <div>
              <span className={styles.statValue}>{balance.creditsUsed.toLocaleString()}</span>
              <span className={styles.statLabel}>used this period</span>
            </div>
            <div>
              <span className={styles.statValue}>{balance.creditsTotal.toLocaleString()}</span>
              <span className={styles.statLabel}>total allocation</span>
            </div>
          </div>
        </section>
      </div>

      <section className={styles.history}>
        <h2 className={styles.cardTitle}>Recent usage</h2>
        {recentUsage.length === 0 ? (
          <p className={styles.empty}>No usage recorded yet. Run a model in Playground to see history.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Provider</th>
                <th>Model</th>
                <th>Credits</th>
                <th>Est. cost</th>
              </tr>
            </thead>
            <tbody>
              {recentUsage.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.timestamp).toLocaleString()}</td>
                  <td>{r.provider}</td>
                  <td>{r.model}</td>
                  <td>{r.credits}</td>
                  <td>${r.estimatedCostUsd.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </WorkspaceLayoutClient>
  );
}
