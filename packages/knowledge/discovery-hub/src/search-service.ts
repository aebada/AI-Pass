import type { MarketplaceCorePlatform } from '@ai-pass/marketplace-core';
import type { DiscoverySearchFilters, Tool } from './types.js';
import { appsToTools } from './mappers.js';

export class SearchService {
  constructor(private platform: MarketplaceCorePlatform) {}

  search(filters: DiscoverySearchFilters, page = 1, pageSize = 20): { tools: Tool[]; total: number; page: number; pageSize: number } {
    const result = this.platform.search.search(
      {
        keyword: filters.keyword,
        category: filters.category,
        developerId: filters.developerId,
        free: filters.free,
        paid: filters.paid,
        openSource: filters.openSource,
        enterpriseReady: filters.enterprise,
        certified: filters.certified,
        trending: filters.trending,
        topRated: filters.topRated,
        tags: filters.tag ? [filters.tag] : filters.useCase ? [filters.useCase] : undefined,
      },
      page,
      pageSize,
    );

    let tools = appsToTools(result.apps, this.platform);

    if (filters.region) {
      const region = filters.region.toLowerCase();
      if (region === 'europe') {
        tools = tools.filter((t) => t.enterpriseReady || t.certified);
      }
    }

    if (filters.provider) {
      const provider = filters.provider.toLowerCase();
      tools = tools.filter((t) => t.modelsUsed.some((m) => m.toLowerCase().includes(provider)));
    }

    if (filters.language) {
      tools = tools.filter((t) => t.tags.some((tag) => tag.includes(filters.language!)));
    }

    if (filters.industry) {
      tools = tools.filter((t) => t.category === filters.industry || t.tags.includes(filters.industry!));
    }

    return { tools, total: result.total, page: result.page, pageSize: result.pageSize };
  }

  /** Semantic search stub — delegates to marketplace keyword + synonym expansion */
  semanticSearch(query: string, limit = 10): Tool[] {
    const result = this.platform.search.search({ keyword: query }, 1, limit);
    return appsToTools(result.apps, this.platform);
  }

  searchByTag(tag: string): Tool[] {
    const result = this.platform.search.search({ tags: [tag] }, 1, 50);
    return appsToTools(result.apps, this.platform);
  }

  searchByCategory(category: DiscoverySearchFilters['category']): Tool[] {
    if (!category) return [];
    const result = this.platform.search.search({ category }, 1, 50);
    return appsToTools(result.apps, this.platform);
  }

  searchByDeveloper(developerId: string): Tool[] {
    const result = this.platform.search.search({ developerId }, 1, 50);
    return appsToTools(result.apps, this.platform);
  }
}
