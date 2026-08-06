import type { Application, MarketplaceCategory } from '@ai-pass/marketplace-core';
import { CATEGORY_LABELS, SEED_DEVELOPERS } from '@ai-pass/marketplace-core';
import { appWorkspaceRoute } from '@ai-pass/routes';
import { getTrustSummaryForResource } from '@ai-pass/trust-engine';

export const APP_ICONS: Record<string, string> = {
  finance: 'receipt',
  supply_chain: 'package',
  customer_support: 'message-circle',
  hr: 'users',
  compliance: 'scale',
  developer_tools: 'wrench',
  legal: 'file-text',
  marketing: 'megaphone',
  sales: 'briefcase',
  knowledge: 'book-open',
  vision_ai: 'eye',
  iot: 'activity',
  analytics: 'bar-chart-3',
  automation: 'zap',
  healthcare: 'building-2',
  manufacturing: 'building-2',
  education: 'book-open',
  ai_agents: 'bot',
  voice_ai: 'mic',
  custom: 'sparkles',
};

export type QuickFilter = 'all' | 'trending' | 'enterprise' | 'verified' | 'free' | 'paid';

export interface StoreFilterState {
  query: string;
  quick: QuickFilter;
  category: MarketplaceCategory | 'all';
  trustMin: number | null;
}

export interface ImportedApp {
  id: string;
  name: string;
  url: string;
  description?: string;
  addedAt: string;
}

const IMPORTED_STORAGE_KEY = 'ai-pass-store-imported';

const developerNames = new Map(SEED_DEVELOPERS.map((d) => [d.id, d.company ?? d.name]));

export function getDeveloperName(developerId: string): string {
  return developerNames.get(developerId) ?? 'Independent Developer';
}

export function formatInstallCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M+`;
  if (count >= 10_000) return `${Math.round(count / 1000)}K+`;
  if (count >= 1_000) return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}K+`;
  return count.toLocaleString();
}

export function getAppIcon(app: Application): string {
  return APP_ICONS[app.category] ?? 'package';
}

export function getAppOpenRoute(app: Application): string {
  return appWorkspaceRoute(app.slug);
}

export function getTrustForApp(app: Application) {
  return getTrustSummaryForResource(app.slug);
}

export function isVerifiedApp(app: Application): boolean {
  const trust = getTrustForApp(app);
  return Boolean(app.certified || trust?.certified);
}

export function isFreeApp(app: Application): boolean {
  return app.pricingModel === 'free' || app.openSource;
}

export function isPaidApp(app: Application): boolean {
  return !isFreeApp(app) && app.pricingModel !== 'freemium';
}

export function filterCatalogApps(apps: Application[], filters: StoreFilterState): Application[] {
  let result = [...apps];

  if (filters.query.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        getDeveloperName(a.developerId).toLowerCase().includes(q),
    );
  }

  if (filters.category !== 'all') {
    result = result.filter((a) => a.category === filters.category);
  }

  switch (filters.quick) {
    case 'trending':
      result = result.filter((a) => a.trending);
      break;
    case 'enterprise':
      result = result.filter((a) => a.enterpriseReady);
      break;
    case 'verified':
      result = result.filter((a) => isVerifiedApp(a));
      break;
    case 'free':
      result = result.filter((a) => isFreeApp(a));
      break;
    case 'paid':
      result = result.filter((a) => isPaidApp(a));
      break;
    default:
      break;
  }

  if (filters.trustMin != null) {
    result = result.filter((a) => {
      const trust = getTrustForApp(a);
      const score = trust?.trustScore ?? (a.certified ? 85 : 0);
      return score >= filters.trustMin!;
    });
  }

  return result;
}

export function groupByCategory(apps: Application[]): { category: MarketplaceCategory; label: string; apps: Application[] }[] {
  const map = new Map<MarketplaceCategory, Application[]>();
  for (const app of apps) {
    const list = map.get(app.category) ?? [];
    list.push(app);
    map.set(app.category, list);
  }
  return [...map.entries()]
    .map(([category, categoryApps]) => ({
      category,
      label: CATEGORY_LABELS[category],
      apps: categoryApps.sort((a, b) => b.installCount - a.installCount).slice(0, 8),
    }))
    .sort((a, b) => b.apps.length - a.apps.length);
}

export function loadImportedApps(): ImportedApp[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(IMPORTED_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ImportedApp[];
  } catch {
    return [];
  }
}

export function saveImportedApp(entry: Omit<ImportedApp, 'id' | 'addedAt'>): ImportedApp {
  const app: ImportedApp = {
    ...entry,
    id: `import_${Date.now()}`,
    addedAt: new Date().toISOString(),
  };
  const existing = loadImportedApps();
  existing.unshift(app);
  localStorage.setItem(IMPORTED_STORAGE_KEY, JSON.stringify(existing.slice(0, 50)));
  return app;
}

export const QUICK_FILTERS: { id: QuickFilter; label: string }[] = [
  { id: 'all', label: 'All apps' },
  { id: 'trending', label: 'Trending' },
  { id: 'enterprise', label: 'Enterprise' },
  { id: 'verified', label: 'Trust verified' },
  { id: 'free', label: 'Free' },
  { id: 'paid', label: 'Paid' },
];

export const TRUST_LEVELS = [
  { min: 90, label: 'Platinum (90+)' },
  { min: 85, label: 'Gold (85+)' },
  { min: 75, label: 'Silver (75+)' },
];
