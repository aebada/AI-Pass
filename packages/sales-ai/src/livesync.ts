import { getLiveSyncEngine } from '@ai-pass/livesync';
import type { Campaign, Deal, Lead } from './types.js';

export async function emitLeadCreated(lead: Lead): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'lead.created',
      payload: {
        lead_id: lead.id,
        tenant_id: lead.tenantId,
        company: lead.company,
        score: lead.score,
        status: lead.status,
      },
      source: 'sales-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitCampaignSent(campaign: Campaign, sentCount: number): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'campaign.sent',
      payload: {
        campaign_id: campaign.id,
        tenant_id: campaign.tenantId,
        name: campaign.name,
        sent_count: sentCount,
        type: campaign.type,
      },
      source: 'sales-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitDealUpdated(deal: Deal): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'deal.updated',
      payload: {
        deal_id: deal.id,
        tenant_id: deal.tenantId,
        stage: deal.stage,
        value: deal.value,
        probability: deal.probability,
      },
      source: 'sales-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitAnalyticsRefresh(tenantId: string): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'sales.analytics.refresh',
      payload: { tenant_id: tenantId },
      source: 'sales-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}
