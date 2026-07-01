import type { Application, Skill, Campaign, Deal, PromotionType, Coupon, Bundle } from './types.js';
import type { AppRegistry } from './app-registry.js';
import type { SkillRegistry } from './skill-registry.js';

export class PromotionEngine {
  private campaigns: Campaign[] = [];
  private deals: Deal[] = [];
  private coupons: Coupon[] = [];
  private bundles: Bundle[] = [];

  constructor(
    private appRegistry: AppRegistry,
    private skillRegistry: SkillRegistry,
  ) {}

  setCampaigns(campaigns: Campaign[]): void {
    this.campaigns = campaigns;
  }

  setDeals(deals: Deal[]): void {
    this.deals = deals;
  }

  setCoupons(coupons: Coupon[]): void {
    this.coupons = coupons;
  }

  setBundles(bundles: Bundle[]): void {
    this.bundles = bundles;
  }

  getCoupons(): Coupon[] {
    const now = new Date();
    return this.coupons.filter((c) => c.active && new Date(c.validUntil) > now);
  }

  getBundles(): Bundle[] {
    return this.bundles;
  }

  getSkillPacks(): Application[] {
    return this.appRegistry.list().filter((a) => a.appType === 'skill_pack');
  }

  getRecentlyUpdated(limit = 10): Application[] {
    return this.appRegistry.list()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  getFeatured(): { apps: Application[]; skills: Skill[] } {
    return {
      apps: this.appRegistry.list().filter((a) => a.featured),
      skills: this.skillRegistry.list().filter((s) => s.featured),
    };
  }

  getTrending(): { apps: Application[]; skills: Skill[] } {
    return {
      apps: this.appRegistry.list()
        .filter((a) => a.trending)
        .sort((a, b) => b.installCount - a.installCount),
      skills: this.skillRegistry.list()
        .filter((s) => s.trending)
        .sort((a, b) => b.installCount - a.installCount),
    };
  }

  getNew(limit = 10): Application[] {
    return this.appRegistry.list()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  getSponsored(): Application[] {
    return this.appRegistry.list().filter((a) => a.sponsored);
  }

  getEditorsPicks(): Application[] {
    const campaign = this.campaigns.find((c) => c.type === 'editors_pick' && c.active);
    if (!campaign) return this.getFeatured().apps.slice(0, 5);
    return campaign.resourceIds
      .map((id) => this.appRegistry.get(id))
      .filter((a): a is Application => !!a);
  }

  getDeals(): Deal[] {
    const now = new Date();
    return this.deals.filter((d) => new Date(d.validUntil) > now);
  }

  getByPromotion(type: PromotionType): Application[] {
    const campaign = this.campaigns.find((c) => c.type === type && c.active);
    if (!campaign) return [];
    return campaign.resourceIds
      .map((id) => this.appRegistry.get(id))
      .filter((a): a is Application => !!a);
  }

  getEnterpriseApps(): Application[] {
    return this.appRegistry.list().filter((a) => a.enterpriseReady || a.appType === 'enterprise_app');
  }

  getOpenSource(): Application[] {
    return this.appRegistry.list().filter((a) => a.openSource);
  }

  getAutomationPacks(): Application[] {
    return this.appRegistry.list().filter((a) => a.appType === 'automation_pack' || a.appType === 'agent_pack');
  }
}
