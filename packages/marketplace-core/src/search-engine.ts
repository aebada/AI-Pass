import type { Application, MarketplaceSearchFilters, MarketplaceSearchResult } from './types.js';
import type { AppRegistry } from './app-registry.js';
import type { SkillRegistry } from './skill-registry.js';

export class MarketplaceSearchEngine {
  constructor(
    private appRegistry: AppRegistry,
    private skillRegistry: SkillRegistry,
  ) {}

  search(filters: MarketplaceSearchFilters, page = 1, pageSize = 20): MarketplaceSearchResult {
    let apps = this.appRegistry.list();
    let skills = this.skillRegistry.list();

    if (filters.keyword) {
      const kw = filters.keyword.toLowerCase();
      apps = apps.filter(
        (a) =>
          a.name.toLowerCase().includes(kw) ||
          a.description.toLowerCase().includes(kw) ||
          a.tags.some((t) => t.toLowerCase().includes(kw)) ||
          this.semanticMatch(kw, a.description),
      );
      skills = skills.filter(
        (s) =>
          s.name.toLowerCase().includes(kw) ||
          s.description.toLowerCase().includes(kw) ||
          s.tags.some((t) => t.toLowerCase().includes(kw)) ||
          this.semanticMatch(kw, s.description),
      );
    }

    if (filters.category) apps = apps.filter((a) => a.category === filters.category);
    if (filters.skillCategory) skills = skills.filter((s) => s.category === filters.skillCategory);
    if (filters.developerId) {
      apps = apps.filter((a) => a.developerId === filters.developerId);
      skills = skills.filter((s) => s.developerId === filters.developerId);
    }
    if (filters.pricing) apps = apps.filter((a) => a.pricingModel === filters.pricing);
    if (filters.model) {
      apps = apps.filter((a) => a.modelsUsed.includes(filters.model!));
      skills = skills.filter((s) => s.modelsUsed.includes(filters.model!));
    }
    if (filters.certified) {
      apps = apps.filter((a) => a.certified);
      skills = skills.filter((s) => s.certified);
    }
    if (filters.enterpriseReady) apps = apps.filter((a) => a.enterpriseReady);
    if (filters.openSource) apps = apps.filter((a) => a.openSource);
    if (filters.trending) {
      apps = apps.filter((a) => a.trending);
      skills = skills.filter((s) => s.trending);
    }
    if (filters.topRated) {
      apps = apps.sort((a, b) => b.rating - a.rating);
      skills = skills.sort((a, b) => b.rating - a.rating);
    }
    if (filters.free) apps = apps.filter((a) => a.pricingModel === 'free' || a.pricingModel === 'freemium');
    if (filters.paid) apps = apps.filter((a) => a.pricingModel !== 'free');
    if (filters.appType) apps = apps.filter((a) => a.appType === filters.appType);
    if (filters.tags?.length) {
      apps = apps.filter((a) => filters.tags!.some((t) => a.tags.includes(t)));
      skills = skills.filter((s) => filters.tags!.some((t) => s.tags.includes(t)));
    }

    const total = apps.length + skills.length;
    const start = (page - 1) * pageSize;
    const pagedApps = apps.slice(start, start + pageSize);
    const remaining = pageSize - pagedApps.length;
    const pagedSkills = remaining > 0 ? skills.slice(Math.max(0, start - apps.length), Math.max(0, start - apps.length) + remaining) : [];

    return { apps: pagedApps, skills: pagedSkills, total, page, pageSize };
  }

  getByCategory(category: Application['category']): Application[] {
    return this.appRegistry.list().filter((a) => a.category === category);
  }

  /** Semantic search stub — expands keyword synonyms for demo */
  private semanticMatch(keyword: string, text: string): boolean {
    const synonyms: Record<string, string[]> = {
      invoice: ['finance', 'billing', 'accounts payable', 'ap'],
      support: ['customer', 'helpdesk', 'chat', 'crm'],
      supply: ['procurement', 'vendor', 'supplier'],
      hr: ['recruiting', 'resume', 'hiring', 'onboarding'],
      compliance: ['governance', 'policy', 'regulatory'],
      agent: ['automation', 'workflow', 'ai'],
    };
    const lower = text.toLowerCase();
    for (const [key, values] of Object.entries(synonyms)) {
      if (keyword.includes(key) || values.some((v) => keyword.includes(v))) {
        if (values.some((v) => lower.includes(v)) || lower.includes(key)) return true;
      }
    }
    return false;
  }

  recommendForUser(_userId: string, limit = 6): Application[] {
    return this.appRegistry
      .list()
      .filter((a) => a.featured || a.trending)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }
}
