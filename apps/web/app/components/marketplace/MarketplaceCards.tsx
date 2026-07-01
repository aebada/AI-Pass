'use client';

import Link from 'next/link';
import { TrustCertBadge } from '../trust/TrustCertBadge';
import { Badge, Button, Card } from '@ai-pass/ui';
import type { Application, Skill } from '@ai-pass/marketplace-core';
import styles from '../../workspace/marketplace/marketplace.module.css';

const APP_ICONS: Record<string, string> = {
  finance: '🧾',
  supply_chain: '📦',
  customer_support: '💬',
  hr: '👥',
  compliance: '⚖',
  developer_tools: '🛠',
};

export function AppCard({
  app,
  onInstall,
}: {
  app: Application;
  onInstall?: (appId: string) => void;
}) {
  const icon = APP_ICONS[app.category] ?? '📦';

  return (
    <Card variant="glass" hover padding="md" className={styles.card}>
      <div className={styles.cardTop}>
        <h3 className={styles.cardTitle}>
          {icon} {app.name}
        </h3>
        {app.certified && <Badge variant="success">Certified</Badge>}
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
      <TrustCertBadge resourceId={app.slug} compact />
      <div className={styles.cardActions}>
        <Link href={`/workspace/marketplace/apps/${app.slug}`}>
          <Button variant="secondary" size="sm">Details</Button>
        </Link>
        {onInstall && (
          <Button variant="primary" size="sm" onClick={() => onInstall(app.id)}>
            Install
          </Button>
        )}
      </div>
    </Card>
  );
}

export function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Card variant="glass" hover padding="md" className={styles.card}>
      <div className={styles.cardTop}>
        <h3 className={styles.cardTitle}>⚡ {skill.name}</h3>
        {skill.certified && <Badge variant="success">Certified</Badge>}
      </div>
      <TrustCertBadge resourceId={skill.slug} compact />
      <p className={styles.cardDesc}>{skill.description.slice(0, 100)}…</p>
      <div className={styles.badges}>
        <Badge variant="outline">{skill.category}</Badge>
        <Badge variant="outline">{skill.creditCost} credits</Badge>
      </div>
      <p className={styles.cardMeta}>
        ★ {skill.rating.toFixed(1)} · v{skill.version}
      </p>
      <div className={styles.cardActions}>
        <Link href={`/workspace/marketplace/skills/${skill.slug}`}>
          <Button variant="secondary" size="sm">View Skill</Button>
        </Link>
      </div>
    </Card>
  );
}

export function SectionRow({
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
