import { createId } from '@ai-pass/shared';
import type { AISystem, AISystemType } from './types.js';

export class TrustService {
  private systems = new Map<string, AISystem>();

  register(
    data: Omit<AISystem, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { id?: string; status?: AISystem['status'] },
  ): AISystem {
    const now = new Date().toISOString();
    const system: AISystem = {
      ...data,
      id: data.id ?? `sys_${createId()}`,
      status: data.status ?? 'draft',
      createdAt: now,
      updatedAt: now,
    };
    this.systems.set(system.id, system);
    return system;
  }

  get(systemId: string): AISystem | undefined {
    return this.systems.get(systemId);
  }

  getByResourceId(resourceId: string): AISystem | undefined {
    return [...this.systems.values()].find((s) => s.resourceId === resourceId);
  }

  list(filters?: { systemType?: AISystemType; status?: AISystem['status']; tenantId?: string }): AISystem[] {
    let results = [...this.systems.values()];
    if (filters?.systemType) results = results.filter((s) => s.systemType === filters.systemType);
    if (filters?.status) results = results.filter((s) => s.status === filters.status);
    if (filters?.tenantId) results = results.filter((s) => s.tenantId === filters.tenantId);
    return results;
  }

  update(systemId: string, patch: Partial<AISystem>): AISystem | undefined {
    const existing = this.systems.get(systemId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.systems.set(systemId, updated);
    return updated;
  }

  registerOnPublish(params: {
    resourceId: string;
    productName: string;
    companyName: string;
    systemType: AISystemType;
    modelsUsed: string[];
    tenantId?: string;
  }): AISystem {
    const existing = this.getByResourceId(params.resourceId);
    if (existing) return existing;

    return this.register({
      resourceId: params.resourceId,
      companyName: params.companyName,
      productName: params.productName,
      systemType: params.systemType,
      industry: 'general',
      useCase: `${params.productName} published system`,
      deploymentType: 'cloud',
      modelsUsed: params.modelsUsed,
      highRiskDomain: false,
      tenantId: params.tenantId,
      status: 'submitted',
    });
  }
}
