import type { AnalyticsEvent, AnalyticsSummary } from './types.js';

export class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  track(event: Omit<AnalyticsEvent, 'timestamp'>): void {
    this.events.push({ ...event, timestamp: new Date().toISOString() });
  }

  getSummary(resourceId?: string): AnalyticsSummary {
    const filtered = resourceId
      ? this.events.filter((e) => e.resourceId === resourceId)
      : this.events;

    const counts = filtered.reduce(
      (acc, e) => {
        acc[e.type] = (acc[e.type] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const views = counts.view ?? 0;
    const searches = counts.search ?? 0;
    const installs = counts.install ?? 0;
    const clicks = counts.click ?? 0;
    const conversions = counts.conversion ?? 0;

    const trendingScore = Math.round(
      views * 0.1 + searches * 0.3 + installs * 2 + clicks * 0.5 + conversions * 5,
    );

    return { views, searches, installs, clicks, conversions, trendingScore };
  }

  getTrendingResourceIds(limit = 10): string[] {
    const byResource = new Map<string, number>();
    for (const e of this.events) {
      byResource.set(e.resourceId, (byResource.get(e.resourceId) ?? 0) + 1);
    }
    return [...byResource.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);
  }
}
