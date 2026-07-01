'use client';

import { getMarketplaceRuntime } from '@ai-pass/marketplace-runtime';

const DEMO_USER = 'demo-user';
const DEMO_TENANT = 'default';

export function useMarketplacePlatform() {
  return getMarketplaceRuntime();
}

export function installApp(appId: string, userTier = 'professional') {
  const platform = getMarketplaceRuntime();
  return platform.installations.install({
    appId,
    tenantId: DEMO_TENANT,
    userId: DEMO_USER,
    userTier,
  });
}

export function getHomepageData() {
  const platform = getMarketplaceRuntime();
  const featured = platform.promotions.getFeatured();
  const trending = platform.promotions.getTrending();

  return {
    featured: featured.apps,
    trending: trending.apps,
    newApps: platform.promotions.getNew(),
    topDevelopers: platform.developers.getTop(),
    editorsPicks: platform.promotions.getEditorsPicks(),
    enterpriseApps: platform.promotions.getEnterpriseApps(),
    openSource: platform.promotions.getOpenSource(),
    automationPacks: platform.promotions.getAutomationPacks(),
    deals: platform.promotions.getDeals(),
    featuredSkills: featured.skills,
    trendingSkills: trending.skills,
  };
}
