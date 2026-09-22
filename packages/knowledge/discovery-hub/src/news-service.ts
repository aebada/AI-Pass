import type { NewsArticle } from './types.js';
import { SEED_NEWS } from './seed-data.js';

export class NewsService {
  private articles = SEED_NEWS;

  list(limit = 20): NewsArticle[] {
    return [...this.articles]
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, limit);
  }

  get(slug: string): NewsArticle | undefined {
    return this.articles.find((a) => a.slug === slug);
  }

  byCategory(category: NewsArticle['category']): NewsArticle[] {
    return this.articles.filter((a) => a.category === category);
  }
}
