import type { MarketplaceCorePlatform } from '@ai-pass/marketplace-core';
import type { DiscoverySearchFilters, Tool } from './types.js';
import { appsToTools } from './mappers.js';
import { EXTERNAL_CATALOG } from './external-catalog.js';
import { DiscoveryService } from './discovery-service.js';

export class SearchService {
  private discovery: DiscoveryService;

  constructor(private platform: MarketplaceCorePlatform, discovery?: DiscoveryService) {
    this.discovery = discovery ?? new DiscoveryService(platform);
  }

  search(
    filters: DiscoverySearchFilters,
    page = 1,
    pageSize = 20,
  ): { tools: Tool[]; total: number; page: number; pageSize: number } {
    let tools = this.discovery.listTools();

    if (filters.keyword) {
      const q = filters.keyword.toLowerCase();
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
          t.features.some((f) => f.toLowerCase().includes(q)) ||
          t.profile.general.developer.toLowerCase().includes(q),
      );
    }

    if (filters.category) tools = tools.filter((t) => t.category === filters.category);
    if (filters.taxonomy) tools = tools.filter((t) => t.profile.taxonomy.includes(filters.taxonomy!));
    if (filters.developerId) tools = tools.filter((t) => t.developerId === filters.developerId);
    if (filters.free) tools = tools.filter((t) => t.pricingModel === 'free' || t.profile.pricing.includes('free'));
    if (filters.paid) tools = tools.filter((t) => t.pricingModel !== 'free');
    if (filters.openSource) tools = tools.filter((t) => t.openSource || t.profile.openSource);
    if (filters.enterprise) tools = tools.filter((t) => t.enterpriseReady);
    if (filters.certified) tools = tools.filter((t) => t.certified || (t.trustScore ?? 0) >= 85);
    if (filters.trending) tools = tools.filter((t) => t.trending);
    if (filters.topRated) tools = tools.filter((t) => t.rating >= 4.5);
    if (filters.tag) tools = tools.filter((t) => t.tags.includes(filters.tag!) || t.profile.subcategories.includes(filters.tag!));
    if (filters.useCase) {
      const u = filters.useCase.toLowerCase();
      tools = tools.filter((t) => t.tags.some((tag) => tag.toLowerCase().includes(u)) || t.description.toLowerCase().includes(u));
    }
    if (filters.industry) {
      tools = tools.filter((t) => t.category === filters.industry || t.tags.includes(filters.industry!));
    }
    if (filters.provider || filters.model) {
      const p = (filters.provider ?? filters.model ?? '').toLowerCase();
      tools = tools.filter(
        (t) =>
          t.modelsUsed.some((m) => m.toLowerCase().includes(p)) ||
          t.profile.supportedModels.some((m) => m.toLowerCase().includes(p)),
      );
    }
    if (filters.language) {
      tools = tools.filter(
        (t) => t.profile.languages.includes(filters.language!) || t.tags.some((tag) => tag.includes(filters.language!)),
      );
    }
    if (filters.pricing) tools = tools.filter((t) => t.profile.pricing.includes(filters.pricing!));
    if (filters.apiAvailable) tools = tools.filter((t) => t.profile.apiAvailable);
    if (filters.localDeployment) tools = tools.filter((t) => t.profile.localDeployable);
    if (filters.compliance) tools = tools.filter((t) => t.profile.compliance.includes(filters.compliance!));
    if (filters.capability) tools = tools.filter((t) => t.profile.capabilities.includes(filters.capability!));
    if (filters.deployment) tools = tools.filter((t) => t.profile.deployment.includes(filters.deployment!));
    if (filters.minContextWindow != null) {
      tools = tools.filter((t) => (t.profile.contextWindow ?? 0) >= filters.minContextWindow!);
    }
    if (filters.minTrustScore != null) tools = tools.filter((t) => t.trustScore >= filters.minTrustScore!);
    if (filters.region) {
      const region = filters.region.toLowerCase();
      if (region === 'europe') {
        tools = tools.filter(
          (t) =>
            t.profile.compliance.includes('gdpr') ||
            t.profile.general.country === 'FR' ||
            t.profile.general.country === 'DE' ||
            t.profile.general.country === 'EU' ||
            t.enterpriseReady,
        );
      }
    }

    // Prefer marketplace keyword engine for ranking when only marketplace filters apply
    if (filters.keyword && tools.length === 0) {
      const result = this.platform.search.search({ keyword: filters.keyword }, page, pageSize);
      tools = appsToTools(result.apps, this.platform);
    }

    const total = tools.length;
    const start = (page - 1) * pageSize;
    return { tools: tools.slice(start, start + pageSize), total, page, pageSize };
  }

  semanticSearch(query: string, limit = 10): Tool[] {
    return this.search({ keyword: query }, 1, limit).tools;
  }

  searchByTag(tag: string): Tool[] {
    return this.search({ tag }, 1, 50).tools;
  }

  searchByCategory(category: DiscoverySearchFilters['category']): Tool[] {
    if (!category) return [];
    return this.search({ category }, 1, 50).tools;
  }

  searchByDeveloper(developerId: string): Tool[] {
    return this.search({ developerId }, 1, 50).tools;
  }

  /** Expose external catalog size for growth metrics. */
  externalCatalogSize(): number {
    return EXTERNAL_CATALOG.length;
  }
}
