'use client';

import Link from 'next/link';
import styles from '../invoice-ai.module.css';
import { ModuleIcon } from '@ai-pass/ui';

export function InvoiceQuickActions() {
  return (
    <section className={styles.hero}>
      <div className={styles.heroText}>
        <h2 className={styles.heroTitle}>What would you like to do?</h2>
        <p className={styles.heroSub}>
          Upload an invoice, browse your portfolio, or ask the AI assistant — everything in one place.
        </p>
      </div>
      <div className={styles.heroActions}>
        <Link href="/workspace/apps/invoice-ai/upload" className={styles.heroBtnPrimary}>
          <span className={styles.heroBtnIcon}>↑</span>
          Upload invoice
        </Link>
        <Link href="/workspace/apps/invoice-ai/portfolio" className={styles.heroBtn}>
          <span className={styles.heroBtnIcon}><ModuleIcon name="folder" size={16} /></span>
          View portfolio
        </Link>
        <Link href="/workspace/apps/invoice-ai/chat" className={styles.heroBtn}>
          <span className={styles.heroBtnIcon}><ModuleIcon name="message-circle" size={16} /></span>
          Ask AI
        </Link>
      </div>
    </section>
  );
}
