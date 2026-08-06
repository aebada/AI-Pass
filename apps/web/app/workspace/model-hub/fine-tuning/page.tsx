'use client';

import Link from 'next/link';
import styles from '../model-hub.module.css';

export default function FineTuningPage() {
  const enterprise = false;
  if (!enterprise) {
    return (
      <div className={styles.gateCard}>
        <h2 className={styles.cardTitle}>Fine-Tuning Studio</h2>
        <p className={styles.cardDesc}>Enterprise plan required for governed fine-tuning pipelines.</p>
        <div className={styles.cardActions}>
          <Link href="/workspace/membership" className={styles.btnPrimary}>Upgrade to Enterprise</Link>
          <Link href="/workspace/model-hub" className={styles.btn}>Catalog</Link>
        </div>
      </div>
    );
  }
  return <p className={styles.notice}>Fine-tuning workspace coming soon.</p>;
}
