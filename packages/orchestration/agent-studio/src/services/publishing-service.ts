import { createId } from '@ai-pass/shared';
import type { AgentService } from './agent-service.js';
import type { PublishRequest, PublishResult } from '../types.js';

export class PublishingService {
  private listings = new Map<string, PublishResult & { revenue: number; usageCount: number }>();

  constructor(private agents: AgentService) {}

  publish(request: PublishRequest): PublishResult {
    const agent = this.agents.publish(request.agentId, request.versionNumber);
    if (!agent) throw new Error(`Agent not found: ${request.agentId}`);

    const listingId = agent.marketplaceListingId ?? `listing_${createId()}`;
    const result: PublishResult = {
      listingId,
      agentId: request.agentId,
      version: agent.publishedVersion ?? agent.currentVersion,
      status: agent.riskLevel === 'critical' ? 'pending_review' : 'published',
      marketplaceUrl: `/workspace/marketplace/apps/${listingId}`,
    };

    this.listings.set(listingId, { ...result, revenue: 0, usageCount: 0 });
    this.agents.update(request.agentId, { marketplaceListingId: listingId });
    return result;
  }

  recordUsage(listingId: string, credits: number): void {
    const listing = this.listings.get(listingId);
    if (!listing) return;
    listing.usageCount += 1;
    listing.revenue += credits * 0.002;
    this.listings.set(listingId, listing);
  }

  list(): Array<PublishResult & { revenue: number; usageCount: number }> {
    return [...this.listings.values()];
  }

  getMetrics(listingId: string): { revenue: number; usageCount: number } | undefined {
    const listing = this.listings.get(listingId);
    if (!listing) return undefined;
    return { revenue: listing.revenue, usageCount: listing.usageCount };
  }
}
