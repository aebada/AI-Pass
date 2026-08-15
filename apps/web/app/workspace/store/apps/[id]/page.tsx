import AppDetailClient from './AppDetailClient';
import { SEED_APPS } from '@ai-pass/marketplace-core';

export function generateStaticParams() {
  const fromSeed = SEED_APPS.map((app) => ({ id: app.slug }));
  const extras = [{ id: 'sales-copilot' }];
  const seen = new Set<string>();
  return [...fromSeed, ...extras].filter((entry) => {
    if (seen.has(entry.id)) return false;
    seen.add(entry.id);
    return true;
  });
}

export default function StoreAppDetailPage() {
  return <AppDetailClient />;
}
