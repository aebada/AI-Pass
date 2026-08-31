import { createId, type AISystem } from '@ai-pass/shared';

/** @deprecated Use InventoryService */
export class AISystemInventory {
  private systems = new Map<string, AISystem>();

  register(system: Omit<AISystem, 'id' | 'createdAt' | 'updatedAt' | 'lifecycleStage' | 'monitoringStatus'> & Partial<Pick<AISystem, 'lifecycleStage' | 'monitoringStatus'>>): AISystem {
    const now = new Date().toISOString();
    const entry: AISystem = {
      ...system,
      monitoringStatus: 'active',
      lifecycleStage: 'registration',
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

  list(): AISystem[] {
    return [...this.systems.values()];
  }

  updateCompliance(systemId: string, status: AISystem['complianceStatus']): void {
    const sys = this.systems.get(systemId);
    if (sys) {
      this.systems.set(systemId, { ...sys, complianceStatus: status, updatedAt: new Date().toISOString() });
    }
  }
}