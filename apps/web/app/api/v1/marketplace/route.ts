import { jsonOk, getPlatform } from '@/src/lib/marketplace-api';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const platform = getPlatform();
  const featured = platform.promotions.getFeatured();
  const trending = platform.promotions.getTrending();

  return jsonOk({
    featured: featured.apps,
    trending: trending.apps,
    new: platform.promotions.getNew(),
    categories: platform.apps.list().reduce((acc, app) => {
      acc[app.category] = (acc[app.category] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    topDevelopers: platform.developers.getTop(),
    editorsPicks: platform.promotions.getEditorsPicks(),
    enterpriseApps: platform.promotions.getEnterpriseApps(),
    openSource: platform.promotions.getOpenSource(),
    automationPacks: platform.promotions.getAutomationPacks(),
    deals: platform.promotions.getDeals(),
    skills: {
      featured: featured.skills,
      trending: trending.skills,
    },
  });
}
