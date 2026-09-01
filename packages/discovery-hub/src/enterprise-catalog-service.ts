import type { AnalyticsService } from './analytics-service.js';
import type { EnterpriseCatalogPolicy, EnterpriseCatalogReport, Tool } from './types.js';

type ToolLookup = {
  getTool: (idOrSlug: string) => Tool | undefined;
  listTools: () => Tool[];
};

/**
 * Org-level approve/block catalogs, procurement gates, and inventory reports.
 */
export class EnterpriseCatalogService {
  private policies = new Map<string, EnterpriseCatalogPolicy>();

  constructor(
    private tools: ToolLookup,
    private analytics: AnalyticsService,
  ) {
    this.policies.set('demo-org', {
      orgId: 'demo-org',
      approvedToolIds: ['ext_claude', 'ext_mistral', 'app_invoice_ai', 'app_compliance_guard'],
      blockedToolIds: [],
      requireApproval: true,
      minTrustScore: 70,
      requiredCompliance: ['gdpr'],
    });
  }

  getPolicy(orgId: string): EnterpriseCatalogPolicy {
    return (
      this.policies.get(orgId) ?? {
        orgId,
        approvedToolIds: [],
        blockedToolIds: [],
        requireApproval: true,
      }
    );
  }

  approve(orgId: string, toolId: string): EnterpriseCatalogPolicy {
    const policy = { ...this.getPolicy(orgId) };
    policy.approvedToolIds = Array.from(new Set([...policy.approvedToolIds, toolId]));
    policy.blockedToolIds = policy.blockedToolIds.filter((id) => id !== toolId);
    this.policies.set(orgId, policy);
    this.analytics.track({
      type: 'approval',
      resourceType: 'tool',
      resourceId: toolId,
      metadata: { orgId, action: 'approve' },
    });
    return policy;
  }

  block(orgId: string, toolId: string): EnterpriseCatalogPolicy {
    const policy = { ...this.getPolicy(orgId) };
    policy.blockedToolIds = Array.from(new Set([...policy.blockedToolIds, toolId]));
    policy.approvedToolIds = policy.approvedToolIds.filter((id) => id !== toolId);
    this.policies.set(orgId, policy);
    this.analytics.track({
      type: 'approval',
      resourceType: 'tool',
      resourceId: toolId,
      metadata: { orgId, action: 'block' },
    });
    return policy;
  }

  isAllowed(orgId: string, tool: Tool): { allowed: boolean; reason?: string } {
    const policy = this.getPolicy(orgId);
    if (policy.blockedToolIds.includes(tool.id)) {
      return { allowed: false, reason: 'Blocked by organization catalog policy' };
    }
    if (policy.minTrustScore != null && tool.trustScore < policy.minTrustScore) {
      return { allowed: false, reason: `Trust score below org minimum (${policy.minTrustScore})` };
    }
    if (policy.requiredCompliance?.length) {
      const missing = policy.requiredCompliance.filter((c) => !tool.profile.compliance.includes(c));
      if (missing.length) {
        return { allowed: false, reason: `Missing compliance: ${missing.join(', ')}` };
      }
    }
    if (policy.allowedTaxonomies?.length) {
      const ok = tool.profile.taxonomy.some((t) => policy.allowedTaxonomies!.includes(t));
      if (!ok) return { allowed: false, reason: 'Outside approved taxonomy catalog' };
    }
    if (policy.requireApproval && !policy.approvedToolIds.includes(tool.id)) {
      return { allowed: false, reason: 'Pending procurement approval' };
    }
    return { allowed: true };
  }

  listApproved(orgId: string): Tool[] {
    const policy = this.getPolicy(orgId);
    return policy.approvedToolIds
      .map((id) => this.tools.getTool(id))
      .filter((t): t is Tool => Boolean(t));
  }

  report(orgId: string): EnterpriseCatalogReport {
    const policy = this.getPolicy(orgId);
    const all = this.tools.listTools();
    const summary = this.analytics.summary();

    const inventory = all.slice(0, 40).map((tool) => {
      let status: 'approved' | 'blocked' | 'pending' = 'pending';
      if (policy.blockedToolIds.includes(tool.id)) status = 'blocked';
      else if (policy.approvedToolIds.includes(tool.id)) status = 'approved';
      return {
        toolId: tool.id,
        name: tool.name,
        status,
        trustScore: tool.trustScore,
        usageEvents: Math.round(summary.installs / Math.max(1, all.length)),
      };
    });

    return {
      orgId,
      approvedCount: inventory.filter((i) => i.status === 'approved').length,
      blockedCount: inventory.filter((i) => i.status === 'blocked').length,
      pendingCount: inventory.filter((i) => i.status === 'pending').length,
      inventory,
    };
  }
}
