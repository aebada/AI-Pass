import { SEED_APPS } from '@ai-pass/marketplace-core';
import AppDetailClient from './AppDetailClient';

export function generateStaticParams() {
  return SEED_APPS.map((app) => ({ slug: app.slug }));
}

export default function MarketplaceAppPage() {
  return <AppDetailClient />;
}
