import type { Application, EnterpriseMarketplacePolicy } from './types.js';
import type { AppRegistry } from './app-registry.js';

export class EnterpriseMarketplaceService {
  private policies = new Map<string, EnterpriseMarketplacePolicy>();

  getOrCreatePolicy(orgId: string): EnterpriseMarketplacePolicy {
    const existing = this.policies.get(orgId);
    if (existing) return existing;

    const policy: EnterpriseMarketplacePolicy = {
      orgId,
      privateStoreEnabled: true,
      requireApproval: true,
      allowedCategories: [],
      blockedModels: [],
      approvedAppIds: [],
      pendingAppIds: [],
      rejectedAppIds: [],
    };
    this.policies.set(orgId, policy);
    return policy;
  }

  approveApp(orgId: string, appId: string): EnterpriseMarketplacePolicy {
    const policy = this.getOrCreatePolicy(orgId);
    policy.pendingAppIds = policy.pendingAppIds.filter((id) => id !== appId);
    policy.rejectedAppIds = policy.rejectedAppIds.filter((id) => id !== appId);
    if (!policy.approvedAppIds.includes(appId)) {
      policy.approvedAppIds.push(appId);
    }
    this.policies.set(orgId, policy);
    return policy;
  }

  rejectApp(orgId: string, appId: string): EnterpriseMarketplacePolicy {
    const policy = this.getOrCreatePolicy(orgId);
    policy.pendingAppIds = policy.pendingAppIds.filter((id) => id !== appId);
    policy.approvedAppIds = policy.approvedAppIds.filter((id) => id !== appId);
    if (!policy.rejectedAppIds.includes(appId)) {
      policy.rejectedAppIds.push(appId);
    }
    this.policies.set(orgId, policy);
    return policy;
  }

  submitForApproval(orgId: string, appId: string): EnterpriseMarketplacePolicy {
    const policy = this.getOrCreatePolicy(orgId);
    if (!policy.pendingAppIds.includes(appId)) {
      policy.pendingAppIds.push(appId);
    }
    this.policies.set(orgId, policy);
    return policy;
  }

  restrictCategories(orgId: string, categories: EnterpriseMarketplacePolicy['allowedCategories']): EnterpriseMarketplacePolicy {
    const policy = this.getOrCreatePolicy(orgId);
    policy.allowedCategories = categories;
    this.policies.set(orgId, policy);
    return policy;
  }

  blockModels(orgId: string, models: string[]): EnterpriseMarketplacePolicy {
    const policy = this.getOrCreatePolicy(orgId);
    policy.blockedModels = models;
    this.policies.set(orgId, policy);
    return policy;
  }

  filterAppsForOrg(orgId: string, apps: Application[], registry: AppRegistry): Application[] {
    const policy = this.getOrCreatePolicy(orgId);
    if (!policy.privateStoreEnabled) return apps;

    return apps.filter((app) => {
      const full = registry.get(app.id) ?? app;
      if (policy.requireApproval && !policy.approvedAppIds.includes(full.id)) return false;
      if (policy.allowedCategories.length && !policy.allowedCategories.includes(full.category)) return false;
      if (policy.blockedModels.some((m) => full.modelsUsed.includes(m))) return false;
      return true;
    });
  }
}
