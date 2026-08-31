import { createId, type AppReview } from '@ai-pass/shared';
import type { AppRegistry } from './app-registry.js';

export class ReviewService {
  private reviews = new Map<string, AppReview>();

  constructor(private registry: AppRegistry) {}

  submit(review: Omit<AppReview, 'id' | 'createdAt'>): AppReview {
    const entry: AppReview = {
      ...review,
      id: `rev_${createId()}`,
      createdAt: new Date().toISOString(),
    };
    this.reviews.set(entry.id, entry);
    this.updateAppRating(review.appId);
    return entry;
  }

  listByApp(appId: string): AppReview[] {
    return [...this.reviews.values()].filter((r) => r.appId === appId);
  }

  private updateAppRating(appId: string): void {
    const reviews = this.listByApp(appId);
    if (reviews.length === 0) return;
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const app = this.registry.get(appId);
    if (app) {
      this.registry.update(appId, { rating: Math.round(avg * 10) / 10 });
    }
  }
}

export class AppReviewPipeline {
  async runSecurityCheck(_appId: string): Promise<{ passed: boolean; findings: string[] }> {
    return { passed: true, findings: [] };
  }

  async runSafetyCheck(_appId: string): Promise<{ passed: boolean; findings: string[] }> {
    return { passed: true, findings: [] };
  }

  async runComplianceCheck(_appId: string): Promise<{ passed: boolean; findings: string[] }> {
    return { passed: true, findings: [] };
  }
}
