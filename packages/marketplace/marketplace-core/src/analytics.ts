import type { AnalyticsSnapshot, Application, Skill } from './types.js';
import type { AppRegistry } from './app-registry.js';
import type { SkillRegistry } from './skill-registry.js';

export class MarketplaceAnalyticsService {
  private snapshots = new Map<string, AnalyticsSnapshot[]>();

  constructor(
    private apps: AppRegistry,
    private skills: SkillRegistry,
  ) {}

  record(snapshot: AnalyticsSnapshot): void {
    const key = `${snapshot.resourceType}:${snapshot.resourceId}`;
    const existing = this.snapshots.get(key) ?? [];
    existing.push(snapshot);
    this.snapshots.set(key, existing);
  }

  getForResource(resourceType: AnalyticsSnapshot['resourceType'], resourceId: string): AnalyticsSnapshot[] {
    return this.snapshots.get(`${resourceType}:${resourceId}`) ?? [];
  }

  buildFromCatalog(app: Application): AnalyticsSnapshot {
    return {
      resourceType: 'app',
      resourceId: app.id,
      period: new Date().toISOString().slice(0, 7),
      installs: app.installCount,
      activeUsers: Math.round(app.installCount * 0.65),
      invocations: app.installCount * 42,
      creditsConsumed: app.installCount * 120,
      revenue: (app.priceMonthly ?? app.pricePerUse ?? 0) * app.installCount * 0.3,
      uniqueUsers: Math.round(app.installCount * 0.8),
      crashes: Math.round(app.installCount * 0.002),
      avgLatencyMs: 180 + app.riskLevel.length * 20,
      retentionRate: 0.72 + app.rating * 0.04,
    };
  }

  buildFromSkill(skill: Skill): AnalyticsSnapshot {
    return {
      resourceType: 'skill',
      resourceId: skill.id,
      period: new Date().toISOString().slice(0, 7),
      installs: skill.installCount,
      activeUsers: Math.round(skill.installCount * 0.7),
      invocations: skill.installCount * 85,
      creditsConsumed: skill.installCount * skill.creditCost,
      revenue: skill.installCount * skill.creditCost * 0.01,
      uniqueUsers: Math.round(skill.installCount * 0.75),
      crashes: Math.round(skill.installCount * 0.001),
      avgLatencyMs: 95 + skill.creditCost,
      retentionRate: 0.68 + skill.rating * 0.05,
    };
  }

  getDeveloperAnalytics(developerId: string): AnalyticsSnapshot[] {
    const appSnaps = this.apps
      .list()
      .filter((a) => a.developerId === developerId)
      .map((a) => this.buildFromCatalog(a));
    const skillSnaps = this.skills
      .list()
      .filter((s) => s.developerId === developerId)
      .map((s) => this.buildFromSkill(s));
    return [...appSnaps, ...skillSnaps];
  }

  getPlatformSummary(): {
    totalInstalls: number;
    totalRevenue: number;
    totalCredits: number;
    avgRetention: number;
  } {
    const appSnaps = this.apps.list().map((a) => this.buildFromCatalog(a));
    const skillSnaps = this.skills.list().map((s) => this.buildFromSkill(s));
    const all = [...appSnaps, ...skillSnaps];
    return {
      totalInstalls: all.reduce((s, x) => s + x.installs, 0),
      totalRevenue: all.reduce((s, x) => s + x.revenue, 0),
      totalCredits: all.reduce((s, x) => s + x.creditsConsumed, 0),
      avgRetention: all.length
        ? all.reduce((s, x) => s + x.retentionRate, 0) / all.length
        : 0,
    };
  }
}
