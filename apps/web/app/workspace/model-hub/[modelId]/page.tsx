'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getModelById, trustLabel } from '@ai-pass/model-hub';
import styles from '../model-hub.module.css';

export default function ModelDetailPage() {
  const params = useParams();
  const modelId = params.modelId as string;
  const model = getModelById(modelId);

  if (!model) {
    return (
      <div className={styles.empty}>
        <p>Model not found: {modelId}</p>
        <Link href="/workspace/model-hub" className={styles.btnPrimary}>Back to catalog</Link>
      </div>
    );
  }

  return (
    <>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle} style={{ fontSize: 22 }}>{model.displayName}</h2>
          <div className={styles.cardProvider}>{model.provider} · {model.id}</div>
        </div>
        <div className={styles.badges}>
          <span className={styles.badge}>{model.pricing.tier}</span>
          {model.certified && <span className={`${styles.badge} ${styles.badgeGreen}`}>Certified</span>}
          <span className={styles.badge}>{trustLabel(model.trust)}</span>
        </div>
      </div>
      <p className={styles.cardDesc}>{model.description}</p>
      <div className={styles.detailGrid}>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Capabilities</h3>
          <div className={styles.badges}>{model.capabilities.map((c) => <span key={c} className={styles.badge}>{c}</span>)}</div>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Trust</h3>
          <p className={styles.cardDesc}>Trust {model.trust.trust} · Reliability {model.trust.reliability} · Latency {model.latencyMs}ms</p>
        </div>
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Pricing</h3>
          <p className={styles.cardDesc}>In {model.pricing.inputCreditsPer1K} / Out {model.pricing.outputCreditsPer1K} credits per 1K · Plan {model.minPlan}</p>
        </div>
      </div>
      <div className={styles.cardActions}>
        <Link href={`/workspace/playground?model=${model.id}`} className={styles.btnPrimary}>Use in Playground</Link>
        <Link href="/workspace/model-hub/benchmarks" className={styles.btn}>Benchmarks</Link>
      </div>
    </>
  );
}
