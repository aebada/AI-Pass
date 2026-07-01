import type { MarketplaceCorePlatform } from '@ai-pass/marketplace-core';
import type { DiscoveryDeal, Tool } from './types.js';
import { appsToTools } from './mappers.js';
import { DISCOVERY_DEALS } from './seed-data.js';

export class DealsService {
  private deals = DISCOVERY_DEALS;

  constructor(private platform: MarketplaceCorePlatform) {}

  list(): DiscoveryDeal[] {
    const now = new Date();
    return this.deals.filter((d) => new Date(d.countdownEndsAt) > now);
  }

  listFeatured(): DiscoveryDeal[] {
    return this.list().filter((d) => d.featured);
  }

  get(id: string): DiscoveryDeal | undefined {
    return this.deals.find((d) => d.id === id);
  }

  getTools(dealId: string): Tool[] {
    const deal = this.get(dealId);
    if (!deal) return [];
    const apps = deal.toolIds
      .map((id) => this.platform.apps.get(id))
      .filter((a): a is NonNullable<typeof a> => a !== undefined);
    return appsToTools(apps, this.platform);
  }

  activate(dealId: string, _userId: string): { success: boolean; code?: string; message: string } {
    const deal = this.get(dealId);
    if (!deal) return { success: false, message: 'Deal not found' };
    if (new Date(deal.countdownEndsAt) <= new Date()) {
      return { success: false, message: 'Deal has expired' };
    }
    return {
      success: true,
      code: deal.code,
      message: `Deal "${deal.title}" activated. Apply code at checkout or install.`,
    };
  }

  mergeMarketplaceDeals(): DiscoveryDeal[] {
    const marketplaceDeals = this.platform.promotions.getDeals();
    const existingIds = new Set(this.deals.map((d) => d.id));
    for (const md of marketplaceDeals) {
      if (!existingIds.has(md.id)) {
        this.deals.push({
          ...md,
          toolIds: md.appIds,
          dealType: 'discount',
          countdownEndsAt: md.validUntil,
          savingsPercent: md.discountPercent,
          featured: false,
        });
      }
    }
    return this.list();
  }
}
