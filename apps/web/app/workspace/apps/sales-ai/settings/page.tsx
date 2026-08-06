'use client';

import Link from 'next/link';
import { getEmailLimit } from '@ai-pass/sales-ai';
import { SalesAppShell } from '../SalesAppShell';
import styles from '../sales-ai.module.css';

export default function SalesSettingsPage() {
  return (
    <SalesAppShell title="Settings" subtitle="Membership tiers, wallet credits, and integrations">
      <div className={styles.grid}>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Membership Tiers</h3>
          <table className={styles.table}>
            <tbody>
              <tr><td>Free</td><td>{getEmailLimit('free')} emails/mo</td></tr>
              <tr><td>Pro (€39)</td><td>{getEmailLimit('professional')} emails/mo</td></tr>
              <tr><td>Business (€99)</td><td>{getEmailLimit('power')} emails/mo + CRM + campaigns</td></tr>
              <tr><td>Enterprise</td><td>Unlimited + custom</td></tr>
            </tbody>
          </table>
        </section>
        <section className={styles.card}>
          <h3 className={styles.cardTitle}>Integrations</h3>
          <ul style={{ fontSize: 13, lineHeight: 2 }}>
            <li>Provider Hub — AI generation routing</li>
            <li>AI Wallet — credit tracking</li>
            <li>Trust Engine — outbound validation</li>
            <li>Knowledge Pipeline — RAG context</li>
            <li>Agent Studio — 6 sales agents</li>
            <li>LiveSync — lead, campaign, deal events</li>
          </ul>
        </section>
      </div>
      <div className={styles.actions} style={{ marginTop: 16 }}>
        <Link href="/workspace/wallet" className={styles.actionBtn}>AI Wallet</Link>
        <Link href="/workspace/playground" className={styles.actionBtn}>Model Playground</Link>
        <Link href="/workspace/store/apps/sales-ai" className={styles.actionBtn}>Store Listing</Link>
        <Link href="/workspace/apps/sales-ai/crm" className={styles.actionBtn}>CRM Settings</Link>
      </div>
    </SalesAppShell>
  );
}
