import { getStorePlatform } from '@ai-pass/store-core';
import { ok } from '@ai-pass/platform-core';
import { MARKETPLACE_CATEGORIES, CATEGORY_LABELS } from '@ai-pass/marketplace-core';
import type { StoreInstallRequest, StoreSearchFilters } from '@ai-pass/store-core';
import type { Review } from '@ai-pass/marketplace-core';

function store() {
  return getStorePlatform().store;
}

export function handleStoreHome(orgId?: string) {
  return ok({ home: store().getHomeData(orgId) });
}

export function handleListApps(orgId?: string) {
  const apps = orgId ? store().enterprise.filterApps(orgId, store().apps.list()) : store().apps.list();
  return ok({ apps });
}

export function handleGetApp(id: string, orgId?: string) {
  const detail = store().getAppDetail(id, orgId);
  if (!detail) return { error: 'App not found', status: 404 as const };
  const github = store().github.getMetadata(detail);
  return ok({ app: detail, github });
}

export function handleCreateApp(body: Parameters<ReturnType<typeof store>['apps']['register']>[0]) {
  const app = store().apps.register(body);
  return ok({ app });
}

export function handleInstall(body: StoreInstallRequest) {
  try {
    const result = store().install(body);
    return ok(result);
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Install failed', status: 403 as const };
  }
}

export function handleUninstall(body: { installationId: string; tenantId: string }) {
  const result = store().installations.uninstall(body.installationId, body.tenantId);
  if (!result) return { error: 'Installation not found', status: 404 as const };
  return ok({ installation: result });
}

export function handleCategories() {
  return ok({
    categories: MARKETPLACE_CATEGORIES.map((id) => ({ id, label: CATEGORY_LABELS[id] })),
    sections: store().getCategories(),
  });
}

export function handleSearch(filters: StoreSearchFilters, page?: number, pageSize?: number) {
  return ok(store().search(filters, page, pageSize));
}

export function handleReviews(resourceId?: string) {
  if (resourceId) return ok({ reviews: store().listReviews(resourceId) });
  return ok({ reviews: [] });
}

export function handleCreateReview(body: Omit<Review, 'id' | 'createdAt'>) {
  const review = store().addReview(body);
  return ok({ review });
}

export function handleDeveloper(id?: string) {
  if (!id) {
    return ok({ developers: getStorePlatform().marketplace.developers.list() });
  }
  const data = store().getDeveloper(id);
  if (!data) return { error: 'Developer not found', status: 404 as const };
  return ok(data);
}

export function handleAnalytics(params?: {
  developerId?: string;
  resourceId?: string;
  resourceType?: 'app' | 'skill';
}) {
  return ok({ analytics: store().getAnalytics(params) });
}

export function handleInstalled(tenantId: string) {
  return ok({
    installations: store().installations.listInstalled(tenantId),
    apps: store().installations.getInstalledApps(tenantId),
    subscriptions: store().installations.getSubscriptions(tenantId),
  });
}

export type StoreApiResult<T = unknown> =
  | ReturnType<typeof ok<T>>
  | { error: string; status: number };

export function toStoreJsonResponse(result: StoreApiResult, ResponseCtor: typeof Response = Response) {
  if ('error' in result && 'status' in result) {
    return new ResponseCtor(JSON.stringify({ success: false, error: result.error }), {
      status: result.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return new ResponseCtor(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
