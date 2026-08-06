import { createId } from '@ai-pass/shared';
import type { ProcurementPolicy } from '../types.js';

/** Policy retrieval via knowledge-pipeline stub */
export class PolicyService {
  private policies = new Map<string, ProcurementPolicy>();

  upload(params: Omit<ProcurementPolicy, 'id' | 'version' | 'uploadedAt' | 'knowledgeRef'>): ProcurementPolicy {
    const policy: ProcurementPolicy = {
      ...params,
      id: `pol_${createId()}`,
      version: 1,
      knowledgeRef: `kp://policies/${createId()}`,
      uploadedAt: new Date().toISOString(),
    };
    this.policies.set(policy.id, policy);
    return policy;
  }

  get(id: string): ProcurementPolicy | undefined {
    return this.policies.get(id);
  }

  list(tenantId: string, status?: ProcurementPolicy['status']): ProcurementPolicy[] {
    return [...this.policies.values()].filter(
      (p) => p.tenantId === tenantId && (!status || p.status === status),
    );
  }

  retrieveFromKnowledgePipeline(knowledgeRef: string): { content: string; citations: string[] } {
    const policy = [...this.policies.values()].find((p) => p.knowledgeRef === knowledgeRef);
    return {
      content: policy?.content ?? 'Policy content not found in knowledge pipeline stub.',
      citations: policy ? [`policy:${policy.id}`, `version:${policy.version}`] : [],
    };
  }

  seed(policies: ProcurementPolicy[]): void {
    for (const p of policies) this.policies.set(p.id, p);
  }
}
