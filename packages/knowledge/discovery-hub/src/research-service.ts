import type { ResearchArticle } from './types.js';
import { SEED_RESEARCH } from './seed-data.js';

export class ResearchService {
  private articles = SEED_RESEARCH;

  list(limit = 20): ResearchArticle[] {
    return [...this.articles]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  get(slug: string): ResearchArticle | undefined {
    return this.articles.find((a) => a.slug === slug);
  }

  byType(type: ResearchArticle['type']): ResearchArticle[] {
    return this.articles.filter((a) => a.type === type);
  }
}
