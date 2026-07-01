import type { Metadata } from 'next';
import Link from 'next/link';
import { getDiscoveryHub } from '@/src/lib/discovery-server';
import styles from '../discover.module.css';

export const metadata: Metadata = {
  title: 'Compare AI Tools | AI Pass Discovery',
  description: 'Compare AI tools side by side on AI Pass Discovery.',
};

export default function ComparePage() {
  const hub = getDiscoveryHub();
  const tools = hub.discovery.listTools().slice(0, 6);

  return (
    <>
      <h1 className={styles.heroTitle}>Compare AI Tools</h1>
      <p className={styles.heroSub}>Select two tools to compare features, pricing, trust, and enterprise readiness.</p>
      <ul>
        {tools.map((t) => (
          <li key={t.id} className={styles.cardMeta}>
            <Link href={`/discover/tools/${t.slug}`}>{t.name}</Link>
          </li>
        ))}
      </ul>
      <p className={styles.cardMeta}>
        Example:{' '}
        <Link href="/discover/compare?a=app_invoice_ai&b=app_compliance_guard">Invoice AI vs Compliance Guard</Link>
      </p>
    </>
  );
}
