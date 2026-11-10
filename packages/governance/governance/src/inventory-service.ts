import { createId } from '@ai-pass/shared';
import type { AISystem, AISystemType, Inventory, RiskLevel } from '@ai-pass/shared';

export class InventoryService {
  private systems = new Map<string, AISystem>();

  register(system: Omit<AISystem, 'id' | 'createdAt' | 'updatedAt'>): AISystem {
    const now = new Date().toISOString();
    const entry: AISystem = {
      ...system,
      id: `ais_${createId()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.systems.set(entry.id, entry);
    return entry;
  }

  get(systemId: string): AISystem | undefined {
    return this.systems.get(systemId);
  }

  list(filters?: { type?: AISystemType; risk?: RiskLevel; department?: string }): AISystem[] {
    let result = [...this.systems.values()];
    if (filters?.type) result = result.filter((s) => s.type === filters.type);
    if (filters?.risk) result = result.filter((s) => s.riskClassification === filters.risk);
    if (filters?.department) result = result.filter((s) => s.department === filters.department);
    return result;
  }

  update(systemId: string, patch: Partial<AISystem>): AISystem | undefined {
    const sys = this.systems.get(systemId);
    if (!sys) return undefined;
    const updated = { ...sys, ...patch, updatedAt: new Date().toISOString() };
    this.systems.set(systemId, updated);
    return updated;
  }

  updateCompliance(systemId: string, status: AISystem['complianceStatus']): void {
    this.update(systemId, { complianceStatus: status });
  }

  getInventory(): Inventory {
    const systems = this.list();
    const byType: Record<string, number> = {};
    const byRisk: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
    const byCompliance: Record<string, number> = {};

    for (const s of systems) {
      byType[s.type] = (byType[s.type] ?? 0) + 1;
      byRisk[s.riskClassification]++;
      byCompliance[s.complianceStatus] = (byCompliance[s.complianceStatus] ?? 0) + 1;
    }

    return {
      systems,
      totalCount: systems.length,
      byType,
      byRisk,
      byCompliance,
      lastUpdated: new Date().toISOString(),
    };
  }

  seed(systems: AISystem[]): void {
    for (const s of systems) this.systems.set(s.id, s);
  }
}
