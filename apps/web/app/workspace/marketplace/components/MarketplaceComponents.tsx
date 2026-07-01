'use client';

import Link from 'next/link';
import { Badge, Card } from '@ai-pass/ui';
import type { Application, Skill } from '@ai-pass/marketplace-core';
import styles from '../marketplace.module.css';

function TrustBadges({ item }: { item: Application | Skill }) {
  const badges: { label: string; variant: 'success' | 'pro' | 'outline' }[] = [];
  if ('certified' in item && item.certified) badges.push({ label: 'Certified', variant: 'success' });
  if ('enterpriseReady' in item && item.enterpriseReady) badges.push({ label: 'Enterprise Ready', variant: 'pro' });
  if ('openSource' in item && item.openSource) badges.push({ label: 'Open Source', variant: 'outline' });
  return (
    <>
      {badges.map((b) => (
        <Badge key={b.label} variant={b.variant}>{b.label}</Badge>
      ))}
    </>
  );
}

export function AppCard({ app }: { app: Application }) {
  return (
    <Card variant="glass" hover padding="md" className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Link href={`/workspace/marketplace/apps/${app.slug}`}>{app.name}</Link>
        </h3>
        <TrustBadges item={app} />
      </div>
      <p className={styles.cardDesc}>{app.description.slice(0, 120)}…</p>
      <div className={styles.cardMeta}>
        <span>★ {app.rating.toFixed(1)}</span>
        <span>· {app.installCount.toLocaleString()} installs</span>
        <span>· {app.pricingModel.replace('_', ' ')}</span>
      </div>
      <div className={styles.cardTags}>
        {app.tags.slice(0, 3).map((t) => (
          <Badge key={t} variant="outline">{t}</Badge>
        ))}
      </div>
    </Card>
  );
}

export function SkillCard({ skill }: { skill: Skill }) {
  return (
    <Card variant="glass" hover padding="md" className={styles.card}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>
          <Link href={`/workspace/marketplace/skills/${skill.slug}`}>{skill.name}</Link>
        </h3>
        {skill.certified && <Badge variant="success">Certified</Badge>}
      </div>
      <p className={styles.cardDesc}>{skill.description.slice(0, 120)}…</p>
      <div className={styles.cardMeta}>
        <span>★ {skill.rating.toFixed(1)}</span>
        <span>· {skill.creditCost} credits</span>
        <span>· {skill.category}</span>
      </div>
    </Card>
  );
}

export function CatalogSection({
  title,
  apps,
  skills,
}: {
  title: string;
  apps: Application[];
  skills: Skill[];
}) {
  if (!apps.length && !skills.length) return null;
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      <div className={styles.grid}>
        {apps.map((app) => <AppCard key={app.id} app={app} />)}
        {skills.map((skill) => <SkillCard key={skill.id} skill={skill} />)}
      </div>
    </section>
  );
}

export function MarketplaceNav() {
  const links = [
    { href: '/workspace/marketplace', label: 'Home' },
    { href: '/workspace/marketplace/search', label: 'Search' },
    { href: '/workspace/marketplace/developer', label: 'Developer Portal' },
    { href: '/workspace/marketplace/publish/app', label: 'Publish App' },
    { href: '/workspace/marketplace/publish/skill', label: 'Publish Skill' },
    { href: '/workspace/marketplace/analytics', label: 'Analytics' },
    { href: '/workspace/marketplace/enterprise', label: 'Enterprise' },
    { href: '/workspace/marketplace/admin', label: 'Admin' },
  ];
  return (
    <nav className={styles.subNav}>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className={styles.subNavLink}>{l.label}</Link>
      ))}
    </nav>
  );
}
