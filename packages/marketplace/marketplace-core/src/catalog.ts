import type { Application, Skill, Collection, IndustryPack } from './types.js';
import type { AppRegistry } from './app-registry.js';
import type { SkillRegistry } from './skill-registry.js';
import type { PromotionEngine } from './promotion-engine.js';

export interface CatalogSection {
  id: string;
  title: string;
  apps: Application[];
  skills: Skill[];
}

export class MarketplaceCatalog {
  constructor(
    private apps: AppRegistry,
    private skills: SkillRegistry,
    private promotions: PromotionEngine,
    private collections: Collection[] = [],
    private industryPacks: IndustryPack[] = [],
  ) {}

  setCollections(collections: Collection[]): void {
    this.collections = collections;
  }

  setIndustryPacks(packs: IndustryPack[]): void {
    this.industryPacks = packs;
  }

  getHomeSections(): CatalogSection[] {
    const featured = this.promotions.getFeatured();
    const trending = this.promotions.getTrending();

    return [
      { id: 'featured', title: 'Featured', apps: featured.apps, skills: featured.skills },
      { id: 'trending', title: 'Trending', apps: trending.apps, skills: trending.skills },
      { id: 'new', title: 'New', apps: this.promotions.getNew(8), skills: this.getNewSkills(8) },
      {
        id: 'recently_updated',
        title: 'Recently Updated',
        apps: this.getRecentlyUpdatedApps(8),
        skills: this.getRecentlyUpdatedSkills(8),
      },
      {
        id: 'enterprise',
        title: 'Enterprise Ready',
        apps: this.promotions.getEnterpriseApps(),
        skills: this.skills.list().filter((s) => s.certified && s.planTierRequired === 'enterprise'),
      },
      {
        id: 'open_source',
        title: 'Open Source',
        apps: this.promotions.getOpenSource(),
        skills: this.skills.list().filter((s) => s.tags.includes('open-source')),
      },
      {
        id: 'agent_packs',
        title: 'Agent Packs',
        apps: this.apps.list().filter((a) => a.appType === 'agent_pack'),
        skills: [],
      },
      {
        id: 'automation_packs',
        title: 'Automation Packs',
        apps: this.apps.list().filter((a) => a.appType === 'automation_pack'),
        skills: [],
      },
      {
        id: 'skill_packs',
        title: 'Skill Packs',
        apps: this.apps.list().filter((a) => a.appType === 'skill_pack'),
        skills: this.skills.list().filter((s) => s.featured),
      },
      {
        id: 'editors_picks',
        title: "Editor's Picks",
        apps: this.promotions.getEditorsPicks(),
        skills: featured.skills.slice(0, 4),
      },
      {
        id: 'deals',
        title: 'Deals',
        apps: this.promotions.getDeals().flatMap((d) =>
          d.appIds.map((id) => this.apps.get(id)).filter((a): a is Application => !!a),
        ),
        skills: [],
      },
    ];
  }

  getCollections(): Collection[] {
    return this.collections;
  }

  getIndustryPacks(): IndustryPack[] {
    return this.industryPacks;
  }

  getRecommendations(userId?: string, limit = 6): Application[] {
    void userId;
    return this.apps
      .list()
      .filter((a) => a.featured || a.trending)
      .sort((a, b) => b.rating * b.installCount - a.rating * a.installCount)
      .slice(0, limit);
  }

  private getNewSkills(limit: number): Skill[] {
    return this.skills
      .list()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  private getRecentlyUpdatedApps(limit: number): Application[] {
    return this.apps
      .list()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }

  private getRecentlyUpdatedSkills(limit: number): Skill[] {
    return this.skills
      .list()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, limit);
  }
}
