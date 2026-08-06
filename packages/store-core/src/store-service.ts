import type { MarketplaceRuntimePlatform } from '@ai-pass/marketplace-runtime';
import { DEFAULT_REVENUE_SHARE, type Application } from '@ai-pass/marketplace-core';
import { appWorkspaceRoute } from '@ai-pass/routes';
import type { MembershipTier } from '@ai-pass/shared';
import { AppRegistry } from './app-registry.js';
import { InstallationService } from './installation-service.js';
import { EnterpriseStoreService } from './enterprise-store-service.js';
import { StoreExecutionService } from './execution.js';
import { GitHubAppService } from './github-app.js';
import type {
  StoreHomeData,
  StoreAppDetail,
  StoreSearchFilters,
  StoreInstallRequest,
} from './types.js';

export class StoreService {
  readonly apps: AppRegistry;
  readonly installations: InstallationService;
  readonly enterprise: EnterpriseStoreService;
  readonly execution: StoreExecutionService;
  readonly github: GitHubAppService;

  constructor(private runtime: MarketplaceRuntimePlatform) {
    this.apps = new AppRegistry(runtime.apps);
    this.installations = new InstallationService(runtime);
    this.enterprise = new EnterpriseStoreService(runtime);
    this.execution = new StoreExecutionService(runtime);
    this.github = new GitHubAppService();
  }

  getRevenueShare() {
    return this.runtime.revenue.getConfig() ?? DEFAULT_REVENUE_SHARE;
  }

  setRevenueShare(developerShare: number, platformFee: number) {
    this.runtime.revenue.setConfig({ developerShare, platformFee });
  }

  getHomeData(orgId?: string): StoreHomeData {
    const allApps = orgId ? this.enterprise.filterApps(orgId, this.apps.list()) : this.apps.list();
    const featured = this.runtime.promotions.getFeatured().apps.filter((a: Application) => allApps.some((x) => x.id === a.id));
    const trending = this.runtime.promotions.getTrending().apps.filter((a: Application) => allApps.some((x) => x.id === a.id));

    return {
      featured,
      recommended: this.runtime.catalog.getRecommendations(undefined, 8),
      trending,
      newReleases: this.runtime.promotions.getNew(),
      enterprise: this.runtime.promotions.getEnterpriseApps().filter((a: Application) => allApps.some((x) => x.id === a.id)),
      free: allApps.filter((a) => a.pricingModel === 'free'),
      openSource: this.runtime.promotions.getOpenSource(),
      automationPacks: this.runtime.promotions.getAutomationPacks(),
      agentPacks: allApps.filter((a) => a.appType === 'agent_pack'),
      skillPacks: this.runtime.promotions.getSkillPacks(),
      industrySolutions: this.runtime.catalog.getIndustryPacks().map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.industry,
        description: p.description,
        appIds: p.appIds,
        skillIds: p.skillIds,
        featured: true,
      })),
      recentlyUpdated: this.runtime.promotions.getRecentlyUpdated(),
      deals: this.runtime.promotions.getDeals(),
      collections: this.runtime.catalog.getCollections(),
    };
  }

  getAppDetail(idOrSlug: string, orgId?: string): StoreAppDetail | undefined {
    const app = this.apps.get(idOrSlug) ?? this.apps.getBySlug(idOrSlug);
    if (!app) return undefined;

    if (orgId) {
      const allowed = this.enterprise.filterApps(orgId, [app]);
      if (!allowed.length) return undefined;
    }

    const versions = this.apps.getVersions(app.id).map((v) => ({
      id: v.id,
      appId: app.id,
      version: v.version,
      changelog: v.changelog,
      publishedAt: v.publishedAt,
      status: v.status,
    }));

    const certs = this.runtime.certifications.listForResource('app', app.id);
    return {
      ...app,
      versions: versions.length ? versions : [{
        id: `ver_${app.id}`,
        appId: app.id,
        version: app.version,
        publishedAt: app.updatedAt,
        status: 'published' as const,
      }],
      permissionsDetail: this.installations.getPermissionsForApp(app),
      trustScore: certs.length ? 92 : app.certified ? 88 : 76,
      workspaceRoute: appWorkspaceRoute(app.slug),
      screenshots: [`/store/screenshots/${app.slug}-1.png`, `/store/screenshots/${app.slug}-2.png`],
      demoUrl: app.appType === 'hosted_saas' ? appWorkspaceRoute(app.slug) : undefined,
      changelog: versions[0]?.changelog,
      docsUrl: `https://aipass.space/docs`,
      membershipRequired: this.inferMembershipTier(app),
      creditsPerUse: app.pricePerUse,
    };
  }

  search(filters: StoreSearchFilters, page = 1, pageSize = 20) {
    const result = this.runtime.search.search(filters, page, pageSize);
    if (filters.semantic && filters.keyword) {
      result.apps.sort((a: Application, b: Application) => b.rating - a.rating);
    }
    return result;
  }

  getCategories() {
    return this.runtime.catalog.getHomeSections();
  }

  getDeveloper(id: string) {
    const developer = this.runtime.developers.get(id);
    if (!developer) return undefined;
    return {
      developer,
      dashboard: this.runtime.developerPortal.getDashboard(id),
      apps: this.apps.list().filter((a) => a.developerId === id),
    };
  }

  getAnalytics(params?: { developerId?: string; resourceId?: string; resourceType?: 'app' | 'skill' }) {
    if (params?.developerId) {
      return this.runtime.analytics.getDeveloperAnalytics(params.developerId);
    }
    if (params?.resourceId && params.resourceType) {
      return this.runtime.analytics.getForResource(params.resourceType, params.resourceId);
    }
    return {
      summary: this.runtime.analytics.getPlatformSummary(),
      revenueShare: this.getRevenueShare(),
    };
  }

  addReview(body: Parameters<typeof this.runtime.reviews.add>[0]) {
    return this.runtime.reviews.add(body);
  }

  listReviews(resourceId: string) {
    return this.runtime.reviews.listForResource(resourceId);
  }

  install(request: StoreInstallRequest) {
    return this.installations.install(request);
  }

  private inferMembershipTier(app: { pricingModel: string; enterpriseReady: boolean }): MembershipTier {
    if (app.pricingModel === 'enterprise_license') return 'enterprise';
    if (app.enterpriseReady) return 'professional';
    if (app.pricingModel === 'free') return 'free';
    return 'professional';
  }
}
