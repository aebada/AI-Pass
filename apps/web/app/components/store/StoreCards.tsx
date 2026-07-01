'use client';

import Link from 'next/link';
import { Badge, Button, Card } from '@ai-pass/ui';
import { STORE_ROUTES } from '@ai-pass/routes';
import type { Application } from '@ai-pass/marketplace-core';
import styles from '../../workspace/store/store.module.css';

const APP_ICONS: Record<string, string> = {
  finance: '🧾',
  supply_chain: '📦',
  customer_support: '💬',
  hr: '👥',
  compliance: '⚖',
  developer_tools: '🛠',
  legal: '📜',
  marketing: '📣',
  sales: '💼',
  knowledge: '📚',
  vision_ai: '👁',
  iot: '📡',
};

export function StoreAppCard({
  app,
  onInstall,
  installed,
}: {
  app: Application;
  onInstall?: (appId: string) => void;
  installed?: boolean;
}) {
  const icon = APP_ICONS[app.category] ?? '📦';

  return (
    <Card variant="glass" hover padding="md" className={styles.card}>
      <div className={styles.cardTop}>
        <h3 className={styles.cardTitle}>
          {icon} {app.name}
        </h3>
        {app.certified && <Badge variant="success">Certified</Badge>}
        {installed && <Badge variant="pro">Installed</Badge>}
      </div>
      <p className={styles.cardDesc}>{app.description.slice(0, 120)}…</p>
      <div className={styles.badges}>
        {app.enterpriseReady && <Badge variant="pro">Enterprise</Badge>}
        {app.openSource && <Badge variant="outline">Open Source</Badge>}
        {app.trending && <Badge variant="default">Trending</Badge>}
        <Badge variant="outline">{app.pricingModel.replace('_', ' ')}</Badge>
      </div>
      <p className={styles.cardMeta}>
        ★ {app.rating.toFixed(1)} · {app.installCount.toLocaleString()} installs
      </p>
      <div className={styles.cardActions}>
        <Link href={STORE_ROUTES.app(app.slug)}>
          <Button variant="secondary" size="sm">Details</Button>
        </Link>
        {onInstall && !installed && (
          <Button variant="primary" size="sm" onClick={() => onInstall(app.id)}>
            Install
          </Button>
        )}
      </div>
    </Card>
  );
}

export function StoreSectionRow({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        {href && (
          <Link href={href} className={styles.sectionLink}>View all →</Link>
        )}
      </div>
      <div className={styles.grid}>{children}</div>
    </section>
  );
}
