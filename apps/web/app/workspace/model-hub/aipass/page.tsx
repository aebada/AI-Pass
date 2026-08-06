'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AIPASS_MODELS } from '@ai-pass/model-hub';
import styles from '../model-hub.module.css';

export default function AIPassModelsPage() {
  const router = useRouter();
  return (
    <>
      <p className={styles.notice}>
        AI-Pass family ({AIPASS_MODELS.length} models). Credits from <Link href="/workspace/wallet">AI Wallet</Link>.
      </p>
      <div className={styles.familyGrid}>
        {AIPASS_MODELS.map((m) => (
          <article key={m.id} className={styles.familyCard}>
            <h3 className={styles.familyName}>{m.displayName}</h3>
            <p className={styles.familyPurpose}>{m.purpose ?? m.description}</p>
            <div className={styles.capRow}>
              {m.capabilities.map((c) => (
                <span key={c} className={styles.capTag}>{c}</span>
              ))}
            </div>
            <button type="button" className={styles.selectBtn} onClick={() => router.push(`/workspace/playground?model=${encodeURIComponent(m.id)}`)}>
              Try in Playground
            </button>
          </article>
        ))}
      </div>
    </>
  );
}
