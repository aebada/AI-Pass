import { createId } from '@ai-pass/shared';
import type { Risk, RiskCategory, RiskLevel, RiskStatus } from '@ai-pass/shared';

export class RiskService {
  private risks = new Map<string, Risk>();

  create(risk: Omit<Risk, 'id' | 'score' | 'createdAt' | 'updatedAt'>): Risk {
    const now = new Date().toISOString();
    const entry: Risk = {
      ...risk,
      id: `rsk_${createId()}`,
      score: this.computeScore(risk.impact, risk.likelihood),
      createdAt: now,
      updatedAt: now,
    };
    this.risks.set(entry.id, entry);
    return entry;
  }

  get(riskId: string): Risk | undefined {
    return this.risks.get(riskId);
  }

  list(filters?: { systemId?: string; category?: RiskCategory; status?: RiskStatus }): Risk[] {
    let result = [...this.risks.values()];
    if (filters?.systemId) result = result.filter((r) => r.systemId === filters.systemId);
    if (filters?.category) result = result.filter((r) => r.category === filters.category);
    if (filters?.status) result = result.filter((r) => r.status === filters.status);
    return result;
  }

  update(riskId: string, patch: Partial<Risk>): Risk | undefined {
    const risk = this.risks.get(riskId);
    if (!risk) return undefined;
    const updated = {
      ...risk,
      ...patch,
      score: patch.impact && patch.likelihood
        ? this.computeScore(patch.impact, patch.likelihood)
        : risk.score,
      updatedAt: new Date().toISOString(),
    };
    this.risks.set(riskId, updated);
    return updated;
  }

  getDistribution(): Record<RiskLevel, number> {
    const dist: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const r of this.risks.values()) {
      const level = r.score >= 12 ? 'critical' : r.score >= 8 ? 'high' : r.score >= 4 ? 'medium' : 'low';
      dist[level]++;
    }
    return dist;
  }

  private computeScore(impact: RiskLevel, likelihood: RiskLevel): number {
    const ranks: Record<RiskLevel, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    return ranks[impact] * ranks[likelihood];
  }

  seed(risks: Risk[]): void {
    for (const r of risks) this.risks.set(r.id, r);
  }
}
