import { getMarketplaceRuntime } from '@ai-pass/marketplace-runtime';
import { ok } from '@ai-pass/platform-core';
import type {
  Application,
  DeveloperProfile,
  MarketplaceSearchFilters,
  Review,
  Skill,
} from '@ai-pass/marketplace-core';
import type { AppRegistry } from '@ai-pass/marketplace-core';

type RegisterAppInput = Parameters<AppRegistry['register']>[0];
type RegisterSkillInput = Parameters<ReturnType<typeof runtime>['skills']['register']>[0];

function runtime() {
  return getMarketplaceRuntime();
}

export function handleListDevelopers() {
  return ok({ developers: runtime().developers.list() });
}

export function handleGetDeveloper(id: string) {
  const developer = runtime().developers.get(id);
  if (!developer) return { error: 'Developer not found', status: 404 as const };
  return ok({ developer, dashboard: runtime().developerPortal.getDashboard(id) });
}

export function handleRegisterDeveloper(body: Omit<DeveloperProfile, 'createdAt'>) {
  const developer = runtime().developerPortal.register(body);
  return ok({ developer });
}

export function handleListApps(filters?: MarketplaceSearchFilters) {
  if (filters && Object.keys(filters).length) {
    const result = runtime().search.search(filters);
    return ok(result);
  }
  return ok({ apps: runtime().apps.list() });
}

export function handleGetApp(id: string) {
  const app = runtime().apps.get(id) ?? runtime().apps.getBySlug(id);
  if (!app) return { error: 'App not found', status: 404 as const };
  const reviews = runtime().reviews.listForResource(app.id);
  const security = runtime().security.reviewApp(app);
  const analytics = runtime().analytics.buildFromCatalog(app);
  return ok({ app, reviews, security, analytics });
}

export function handleCreateApp(body: RegisterAppInput) {
  const app = runtime().apps.register(body as RegisterAppInput);
  runtime().developers.incrementAppCount(app.developerId);
  const security = runtime().security.reviewApp(app);
  return ok({ app, security });
}

export function handleUpdateApp(id: string, patch: Partial<Application>) {
  const app = runtime().apps.update(id, patch);
  if (!app) return { error: 'App not found', status: 404 as const };
  return ok({ app });
}

export function handleDeleteApp(id: string) {
  const deleted = runtime().apps.delete(id);
  if (!deleted) return { error: 'App not found', status: 404 as const };
  return ok({ deleted: true });
}

export function handleListSkills(category?: Skill['category']) {
  return ok({ skills: runtime().skills.list(category) });
}

export function handleGetSkill(id: string) {
  const skill = runtime().skills.get(id) ?? runtime().skills.getBySlug(id);
  if (!skill) return { error: 'Skill not found', status: 404 as const };
  const reviews = runtime().reviews.listForResource(skill.id);
  const security = runtime().security.reviewSkill(skill);
  const analytics = runtime().analytics.buildFromSkill(skill);
  return ok({ skill, reviews, security, analytics });
}

export function handleCreateSkill(body: RegisterSkillInput) {
  const validation = runtime().lifecycle.validate({ ...body, id: 'draft', createdAt: '', updatedAt: '' } as Skill);
  if (!validation.valid) return { error: validation.errors.join(', '), status: 400 as const };
  const skill = runtime().skills.register(body);
  runtime().developers.incrementSkillCount(skill.developerId);
  return ok({ skill, security: runtime().security.reviewSkill(skill) });
}

export function handleInstall(body: {
  appId: string;
  tenantId: string;
  userId: string;
  userTier: string;
  permissionsGranted?: string[];
}) {
  try {
    const installation = runtime().installations.install(body);
    return ok({ installation });
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Install failed', status: 403 as const };
  }
}

export function handleGetWallet(userId: string) {
  const summary = runtime().integrations.wallet.getSummary(userId);
  return ok({ wallet: summary });
}

export function handleBilling(body: {
  developerId: string;
  appId: string;
  grossRevenue: number;
  period: string;
}) {
  const record = runtime().revenue.calculate(body);
  const payout = runtime().developerPortal.getPayoutStub(body.developerId, body.period, body.grossRevenue);
  return ok({ revenue: record, payout });
}

export function handleCreateReview(body: Omit<Review, 'id' | 'createdAt'>) {
  const review = runtime().reviews.add(body);
  return ok({ review });
}

export function handleListReviews(resourceId: string) {
  return ok({ reviews: runtime().reviews.listForResource(resourceId) });
}

export function handleGetAnalytics(params?: { developerId?: string; resourceId?: string; resourceType?: 'app' | 'skill' }) {
  if (params?.developerId) {
    return ok({ analytics: runtime().analytics.getDeveloperAnalytics(params.developerId) });
  }
  if (params?.resourceId && params.resourceType) {
    return ok({ analytics: runtime().analytics.getForResource(params.resourceType, params.resourceId) });
  }
  return ok({ summary: runtime().analytics.getPlatformSummary(), catalog: runtime().catalog.getHomeSections() });
}

export function handleCatalogHome() {
  return ok({
    sections: runtime().catalog.getHomeSections(),
    collections: runtime().catalog.getCollections(),
    industryPacks: runtime().catalog.getIndustryPacks(),
    deals: runtime().promotions.getDeals(),
    coupons: runtime().promotions.getCoupons(),
    bundles: runtime().promotions.getBundles(),
    recommendations: runtime().catalog.getRecommendations(),
  });
}

export function handleSearch(filters: MarketplaceSearchFilters, page?: number, pageSize?: number) {
  return ok(runtime().search.search(filters, page, pageSize));
}

export function handleEnterprisePolicy(orgId: string) {
  return ok({ policy: runtime().enterprise.getOrCreatePolicy(orgId) });
}

export type ApiHandlerResult<T = unknown> =
  | ReturnType<typeof ok<T>>
  | { error: string; status: number };

export function toJsonResponse(result: ApiHandlerResult, ResponseCtor: typeof Response = Response) {
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
