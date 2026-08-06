'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import type { ModelRecord } from '@ai-pass/model-hub';
import styles from '../model-hub.module.css';

const NAV = [
  { href: '/workspace/model-hub', label: 'Catalog', exact: true },
  { href: '/workspace/model-hub/aipass', label: 'AI-Pass Models' },
  { href: '/workspace/model-hub/providers', label: 'Providers' },
  { href: '/workspace/model-hub/routing', label: 'Routing' },
  { href: '/workspace/model-hub/keys', label: 'API Keys' },
  { href: '/workspace/model-hub/benchmarks', label: 'Benchmarks' },
  { href: '/workspace/model-hub/fine-tuning', label: 'Fine-Tuning' },
] as const;

export function ModelHubNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.subnav} aria-label="Model Hub">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link key={item.href} href={item.href} className={`${styles.subnavLink} ${active ? styles.subnavLinkActive : ''}`}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function ModelHubShell({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function ModelCard({ model }: { model: ModelRecord }) {
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <h3 className={styles.cardTitle}>{model.displayName}</h3>
        <span className={styles.badge}>{model.pricing.tier}</span>
      </div>
      <p className={styles.cardDesc}>{model.description}</p>
      <div className={styles.meta}>
        <span className={styles.tag}>{model.provider}</span>
        <span className={styles.tag}>{model.category}</span>
        {model.capabilities.slice(0, 3).map((cap) => (
          <span key={cap} className={styles.tag}>{cap}</span>
        ))}
      </div>
      <div className={styles.actions}>
        <Link href={`/workspace/model-hub/${model.id}`} className={styles.btnPrimary}>Details</Link>
        <Link href={`/workspace/playground?model=${encodeURIComponent(model.id)}`} className={styles.btn}>Launch</Link>
      </div>
    </article>
  );
}
