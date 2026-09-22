import { AppRegistry } from './app-registry.js';
import { SkillRegistry } from './skill-registry.js';
import { SkillLifecycleService } from './skill-lifecycle.js';
import { MarketplaceSearchEngine } from './search-engine.js';
import { PromotionEngine } from './promotion-engine.js';
import { EnterpriseMarketplaceService } from './enterprise-marketplace.js';
import { RevenueShareEngine } from './revenue.js';
import { DeveloperService, ReviewService, CertificationRegistry } from './developers.js';
import { DeveloperPortalService } from './developer-portal.js';
import { MarketplaceCatalog } from './catalog.js';
import { SecurityApprovalPipeline } from './security-pipeline.js';
import { MarketplaceAnalyticsService } from './analytics.js';
import {
  SEED_APPS,
  SEED_SKILLS,
  SEED_DEVELOPERS,
  SEED_CAMPAIGNS,
  SEED_DEALS,
  SEED_REVIEWS,
  SEED_APP_IDS,
  SEED_COLLECTIONS,
  SEED_INDUSTRY_PACKS,
  SEED_COUPONS,
  SEED_BUNDLES,
} from './seed-data.js';
import {
  createMarketplaceIntegrations,
  issueAppCertification,
  type LiveSyncEventEmitter,
  type MarketplaceIntegrations,
} from './integrations.js';
import { SkillsRuntimeService } from './skills-runtime.js';

export interface MarketplaceCorePlatform {
  apps: AppRegistry;
  skills: SkillRegistry;
  lifecycle: SkillLifecycleService;
  skillsRuntime: SkillsRuntimeService;
  search: MarketplaceSearchEngine;
  promotions: PromotionEngine;
  catalog: MarketplaceCatalog;
  enterprise: EnterpriseMarketplaceService;
  revenue: RevenueShareEngine;
  developers: DeveloperService;
  developerPortal: DeveloperPortalService;
  reviews: ReviewService;
  certifications: CertificationRegistry;
  security: SecurityApprovalPipeline;
  analytics: MarketplaceAnalyticsService;
  integrations: MarketplaceIntegrations;
}

let _instance: MarketplaceCorePlatform | null = null;

function mapSeedIds(ids: string[]): string[] {
  return ids.map((id) => {
    const slug = id.replace('app_', '').replace(/_/g, '-');
    return SEED_APP_IDS[slug] ?? id;
  });
}

export function createMarketplaceCore(options?: { liveSyncEmit?: LiveSyncEventEmitter }): MarketplaceCorePlatform {
  const apps = new AppRegistry();
  const skills = new SkillRegistry();
  const developers = new DeveloperService();
  const certifications = new CertificationRegistry();
  const integrations = createMarketplaceIntegrations();
  const revenue = new RevenueShareEngine();

  for (const dev of SEED_DEVELOPERS) {
    developers.register(dev);
  }

  for (const app of SEED_APPS) {
    const id = SEED_APP_IDS[app.slug];
    const registered = apps.register({ ...app, ...(id ? { id } : {}) });
    issueAppCertification(integrations, registered, certifications);
  }

  for (const skill of SEED_SKILLS) {
    skills.register(skill);
  }

  const reviewService = new ReviewService();
  for (const review of SEED_REVIEWS) {
    reviewService.add({
      ...review,
      resourceId: mapSeedIds([review.resourceId])[0] ?? review.resourceId,
    });
  }

  const promotions = new PromotionEngine(apps, skills);
  promotions.setCampaigns(
    SEED_CAMPAIGNS.map((c) => ({ ...c, resourceIds: mapSeedIds(c.resourceIds) })),
  );
  promotions.setDeals(
    SEED_DEALS.map((d) => ({ ...d, appIds: mapSeedIds(d.appIds) })),
  );
  promotions.setCoupons(
    SEED_COUPONS.map((c) => ({ ...c, appIds: mapSeedIds(c.appIds) })),
  );
  promotions.setBundles(
    SEED_BUNDLES.map((b) => ({ ...b, appIds: mapSeedIds(b.appIds) })),
  );

  const catalog = new MarketplaceCatalog(apps, skills, promotions);
  catalog.setCollections(
    SEED_COLLECTIONS.map((c) => ({
      ...c,
      appIds: mapSeedIds(c.appIds),
    })),
  );
  catalog.setIndustryPacks(
    SEED_INDUSTRY_PACKS.map((p) => ({
      ...p,
      appIds: mapSeedIds(p.appIds),
    })),
  );

  const lifecycle = new SkillLifecycleService(skills);

  const enterprise = new EnterpriseMarketplaceService();
  enterprise.getOrCreatePolicy('org_demo');
  enterprise.approveApp('org_demo', 'app_invoice_ai');
  enterprise.approveApp('org_demo', 'app_compliance_guard');
  enterprise.restrictCategories('org_demo', ['finance', 'compliance', 'hr', 'supply_chain']);
  enterprise.blockModels('org_demo', ['experimental-gpt']);

  const platform: MarketplaceCorePlatform = {
    apps,
    skills,
    lifecycle,
    skillsRuntime: new SkillsRuntimeService(skills, lifecycle),
    search: new MarketplaceSearchEngine(apps, skills),
    promotions,
    catalog,
    enterprise,
    revenue,
    developers,
    developerPortal: new DeveloperPortalService(developers, revenue),
    reviews: reviewService,
    certifications,
    security: new SecurityApprovalPipeline(),
    analytics: new MarketplaceAnalyticsService(apps, skills),
    integrations,
  };

  if (options?.liveSyncEmit) {
    (platform as MarketplaceCorePlatform & { liveSyncEmit: LiveSyncEventEmitter }).liveSyncEmit =
      options.liveSyncEmit;
  }

  return platform;
}

export function getMarketplaceCore(): MarketplaceCorePlatform {
  if (!_instance) _instance = createMarketplaceCore();
  return _instance;
}

export function resetMarketplaceCore(): void {
  _instance = null;
}

export * from './types.js';
export * from './constants.js';
export * from './app-registry.js';
export * from './skill-registry.js';
export * from './skill-lifecycle.js';
export * from './search-engine.js';
export * from './promotion-engine.js';
export * from './catalog.js';
export * from './developer-portal.js';
export * from './security-pipeline.js';
export * from './analytics.js';
export * from './enterprise-marketplace.js';
export * from './revenue.js';
export * from './developers.js';
export * from './runtime-interface.js';
export * from './seed-data.js';
export * from './integrations.js';
export * from './skills-runtime.js';
