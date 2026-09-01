/** Central route constants for AI Pass platform navigation and deep links */

export const WORKSPACE_BASE = '/workspace';

export const STORE_ROUTES = {
  home: `${WORKSPACE_BASE}/store`,
  alias: '/store',
  categories: `${WORKSPACE_BASE}/store/categories`,
  category: (cat: string) => `${WORKSPACE_BASE}/store/categories?cat=${cat}`,
  search: `${WORKSPACE_BASE}/store/search`,
  app: (idOrSlug: string) => `${WORKSPACE_BASE}/store/apps/${idOrSlug}`,
  installed: `${WORKSPACE_BASE}/store/installed`,
  purchases: `${WORKSPACE_BASE}/store/purchases`,
  developer: `${WORKSPACE_BASE}/store/developer`,
  submit: `${WORKSPACE_BASE}/store/submit`,
  enterprise: `${WORKSPACE_BASE}/store/enterprise`,
  billing: `${WORKSPACE_BASE}/store/billing`,
  reviews: `${WORKSPACE_BASE}/store/reviews`,
  admin: `${WORKSPACE_BASE}/store/admin`,
} as const;

export const MARKETPLACE_ROUTES = {
  home: `${WORKSPACE_BASE}/marketplace`,
  legacy: '/marketplace',
  app: (idOrSlug: string) => `${WORKSPACE_BASE}/marketplace/apps/${idOrSlug}`,
  search: `${WORKSPACE_BASE}/marketplace/search`,
  categories: `${WORKSPACE_BASE}/marketplace/categories`,
} as const;

export const DISCOVERY_ROUTES = {
  home: '/discover',
  workspace: `${WORKSPACE_BASE}/discover`,
  search: '/discover/search',
  taxonomy: '/discover/taxonomy',
  taxonomyNode: (slug: string) => `/discover/taxonomy/${slug}`,
  tool: (slug: string) => `/discover/tools/${slug}`,
  compare: '/discover/compare',
  benchmarks: '/discover/benchmarks',
  collections: '/discover/collections',
  deals: '/discover/deals',
  analytics: '/discover/analytics',
  enterprise: '/discover/enterprise',
  categories: '/discover/categories',
  trending: '/discover/trending',
} as const;

export const DISCOVERY_API_ROUTES = {
  home: '/api/v1/discovery',
  search: '/api/v1/discovery/search',
  taxonomy: '/api/v1/discovery/taxonomy',
  compare: '/api/v1/discovery/compare',
  benchmarks: '/api/v1/discovery/benchmarks',
  enterprise: '/api/v1/discovery/enterprise',
  analytics: '/api/v1/discovery/analytics',
  actions: '/api/v1/discovery/actions',
  deals: '/api/v1/discovery/deals',
  recommendations: '/api/v1/discovery/recommendations',
} as const;

export const KNOWLEDGE_ROUTES = {
  home: `${WORKSPACE_BASE}/knowledge`,
  sources: `${WORKSPACE_BASE}/knowledge/sources`,
  pipelines: `${WORKSPACE_BASE}/knowledge/pipelines`,
  graph: `${WORKSPACE_BASE}/knowledge/graph`,
  embeddings: `${WORKSPACE_BASE}/knowledge/embeddings`,
  search: `${WORKSPACE_BASE}/knowledge/search`,
  retrieval: `${WORKSPACE_BASE}/knowledge/retrieval`,
  sync: `${WORKSPACE_BASE}/knowledge/sync`,
  governance: `${WORKSPACE_BASE}/knowledge/governance`,
  admin: `${WORKSPACE_BASE}/knowledge/admin`,
} as const;

export const KNOWLEDGE_API_ROUTES = {
  sources: '/api/v1/knowledge/sources',
  source: '/api/v1/knowledge/sources',
  pipeline: '/api/v1/knowledge/pipeline',
  embed: '/api/v1/knowledge/embed',
  query: '/api/v1/knowledge/query',
  graphQuery: '/api/v1/knowledge/graph/query',
  sync: '/api/v1/knowledge/sync',
  status: '/api/v1/knowledge/status',
} as const;

export const API_ROUTES = {
  knowledge: KNOWLEDGE_API_ROUTES,
  discovery: DISCOVERY_API_ROUTES,
  store: {
    apps: '/api/v1/store/apps',
    app: (id: string) => `/api/v1/store/apps/${id}`,
    install: '/api/v1/store/install',
    uninstall: '/api/v1/store/uninstall',
    categories: '/api/v1/store/categories',
    search: '/api/v1/store/search',
    reviews: '/api/v1/store/reviews',
    developer: '/api/v1/store/developer',
    analytics: '/api/v1/store/analytics',
    installed: '/api/v1/store/installed',
    home: '/api/v1/store/home',
  },
  marketplace: {
    apps: '/api/v1/marketplace/apps',
    install: '/api/v1/marketplace/install',
  },
} as const;

/** Map app slugs to workspace routes after install */
export const APP_WORKSPACE_ROUTES: Record<string, string> = {
  'invoice-ai': `${WORKSPACE_BASE}/apps/invoice-ai`,
  'supply-chain-ai': `${WORKSPACE_BASE}/apps/supply-chain`,
  'customer-support-ai': `${WORKSPACE_BASE}/apps/customer-support`,
  'hr-ai': `${WORKSPACE_BASE}/apps`,
  'compliance-guard': `${WORKSPACE_BASE}/compliance`,
  'agent-toolkit-oss': `${WORKSPACE_BASE}/agents`,
  'legal-contract-ai': `${WORKSPACE_BASE}/apps`,
  'marketing-insights-ai': `${WORKSPACE_BASE}/analysis`,
  'vision-qa-inspector': `${WORKSPACE_BASE}/apps`,
  'sales-ai': `${WORKSPACE_BASE}/apps/sales-ai`,
  'sales-copilot': `${WORKSPACE_BASE}/apps/sales-ai`,
  'knowledge-pipeline-pack': `${WORKSPACE_BASE}/knowledge`,
  'iot-anomaly-detector': `${WORKSPACE_BASE}/apps`,
};

export function appWorkspaceRoute(appIdOrSlug: string): string {
  const slug = appIdOrSlug.replace(/^app_/, '').replace(/_/g, '-');
  return APP_WORKSPACE_ROUTES[slug] ?? APP_WORKSPACE_ROUTES[appIdOrSlug] ?? `${WORKSPACE_BASE}/apps`;
}
