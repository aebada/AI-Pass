import { createId } from '@ai-pass/shared';
import type { GovernancePolicy, PolicyCategory, PolicyStatus } from '@ai-pass/shared';

export class PolicyService {
  private policies = new Map<string, GovernancePolicy>();
  private versions = new Map<string, GovernancePolicy[]>();

  create(policy: Omit<GovernancePolicy, 'id' | 'createdAt' | 'updatedAt' | 'active' | 'status'>): GovernancePolicy {
    const now = new Date().toISOString();
    const entry: GovernancePolicy = {
      ...policy,
      id: `pol_${createId()}`,
      status: 'draft',
      active: false,
      createdAt: now,
      updatedAt: now,
    };
    this.policies.set(entry.id, entry);
    this.versions.set(entry.id, [entry]);
    return entry;
  }

  get(policyId: string): GovernancePolicy | undefined {
    return this.policies.get(policyId);
  }

  list(filters?: { category?: PolicyCategory; status?: PolicyStatus; active?: boolean }): GovernancePolicy[] {
    let result = [...this.policies.values()];
    if (filters?.category) result = result.filter((p) => p.category === filters.category);
    if (filters?.status) result = result.filter((p) => p.status === filters.status);
    if (filters?.active !== undefined) result = result.filter((p) => p.active === filters.active);
    return result;
  }

  getActive(): GovernancePolicy[] {
    return this.list({ status: 'published', active: true });
  }

  createVersion(policyId: string, updates: Partial<Pick<GovernancePolicy, 'rules' | 'description' | 'frameworks'>>): GovernancePolicy | undefined {
    const current = this.policies.get(policyId);
    if (!current) return undefined;

    const parts = current.version.split('.').map(Number);
    const nextVersion = `${parts[0]}.${parts[1]}.${(parts[2] ?? 0) + 1}`;
    const now = new Date().toISOString();

    const draft: GovernancePolicy = {
      ...current,
      ...updates,
      version: nextVersion,
      status: 'draft',
      active: false,
      updatedAt: now,
    };
    this.policies.set(policyId, draft);
    const history = this.versions.get(policyId) ?? [];
    history.push(draft);
    this.versions.set(policyId, history);
    return draft;
  }

  publish(policyId: string): GovernancePolicy | undefined {
    const policy = this.policies.get(policyId);
    if (!policy) return undefined;
    const now = new Date().toISOString();
    const published = { ...policy, status: 'published' as const, active: true, publishedAt: now, updatedAt: now };
    this.policies.set(policyId, published);
    return published;
  }

  retire(policyId: string): GovernancePolicy | undefined {
    const policy = this.policies.get(policyId);
    if (!policy) return undefined;
    const now = new Date().toISOString();
    const retired = { ...policy, status: 'retired' as const, active: false, retiredAt: now, updatedAt: now };
    this.policies.set(policyId, retired);
    return retired;
  }

  getHistory(policyId: string): GovernancePolicy[] {
    return this.versions.get(policyId) ?? [];
  }

  seed(policies: GovernancePolicy[]): void {
    for (const p of policies) {
      this.policies.set(p.id, p);
      this.versions.set(p.id, [p]);
    }
  }
}
