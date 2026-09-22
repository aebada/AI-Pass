import type { MembershipTier } from '@ai-pass/shared';
import { createId } from '@ai-pass/shared';
import { defaultWalletService } from '@ai-pass/wallet';
import type { Campaign, CampaignType, OutreachSequence, OutreachStep } from '../types.js';
import { canAccessCampaigns } from '../membership-gates.js';
import { emitCampaignSent } from '../livesync.js';

const DEFAULT_SEQUENCES: Record<CampaignType, OutreachStep[]> = {
  cold: [
    { id: 's1', channel: 'email', delayDays: 0, templateType: 'cold', status: 'pending' },
    { id: 's2', channel: 'linkedin', delayDays: 2, templateType: 'connection', status: 'pending' },
    { id: 's3', channel: 'email', delayDays: 5, templateType: 'follow_up', status: 'pending' },
  ],
  nurturing: [
    { id: 's1', channel: 'email', delayDays: 0, templateType: 'intro', status: 'pending' },
    { id: 's2', channel: 'email', delayDays: 7, templateType: 'follow_up', status: 'pending' },
  ],
  follow_up: [
    { id: 's1', channel: 'email', delayDays: 0, templateType: 'follow_up', status: 'pending' },
    { id: 's2', channel: 'email', delayDays: 3, templateType: 'follow_up', status: 'pending' },
  ],
  upsell: [
    { id: 's1', channel: 'email', delayDays: 0, templateType: 'proposal', status: 'pending' },
    { id: 's2', channel: 'email', delayDays: 5, templateType: 'follow_up', status: 'pending' },
  ],
  renewal: [
    { id: 's1', channel: 'email', delayDays: 0, templateType: 'support', status: 'pending' },
    { id: 's2', channel: 'email', delayDays: 7, templateType: 'proposal', status: 'pending' },
  ],
  investor_outreach: [
    { id: 's1', channel: 'email', delayDays: 0, templateType: 'investor', status: 'pending' },
    { id: 's2', channel: 'linkedin', delayDays: 3, templateType: 'inmail', status: 'pending' },
  ],
};

export class CampaignBuilderService {
  private campaigns: Campaign[] = [];
  private sequences = new Map<string, OutreachSequence>();

  constructor(seedCampaigns: Campaign[] = []) {
    this.campaigns = [...seedCampaigns];
  }

  list(tenantId: string): Campaign[] {
    return this.campaigns.filter((c) => c.tenantId === tenantId);
  }

  get(id: string): Campaign | undefined {
    return this.campaigns.find((c) => c.id === id);
  }

  create(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    name: string;
    type: CampaignType;
    leadIds: string[];
    steps?: Array<{ channel: string; delayDays: number; templateType: string }>;
  }): { campaign: Campaign; creditsUsed: number; liveSyncEventId?: string } {
    if (!canAccessCampaigns(params.tier)) {
      throw new Error('Campaigns require Business (Power) membership or higher.');
    }

    const steps: OutreachStep[] = params.steps?.map((s, i) => ({
      id: `step_${i}`,
      channel: s.channel as OutreachStep['channel'],
      delayDays: s.delayDays,
      templateType: s.templateType,
      status: 'pending' as const,
    })) ?? DEFAULT_SEQUENCES[params.type];

    const seqId = `seq_${createId()}`;
    const sequence: OutreachSequence = {
      id: seqId,
      tenantId: params.tenantId,
      name: params.name,
      steps,
      status: 'draft',
      createdAt: new Date().toISOString(),
    };
    this.sequences.set(seqId, sequence);

    const creditsUsed = params.leadIds.length * 2;
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: 'Sales AI',
      model: 'campaign-builder',
      credits: creditsUsed,
      estimatedCostUsd: creditsUsed * 0.002,
      taskType: 'sales_campaign_create',
      module: 'sales-ai',
      metadata: { type: params.type, leadCount: params.leadIds.length },
    });

    const campaign: Campaign = {
      id: `camp_${createId()}`,
      tenantId: params.tenantId,
      name: params.name,
      type: params.type,
      status: 'draft',
      leadIds: params.leadIds,
      sequenceId: seqId,
      sentCount: 0,
      openRate: 0,
      replyRate: 0,
      creditsUsed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.campaigns.push(campaign);
    return { campaign, creditsUsed };
  }

  async activate(campaignId: string): Promise<{ campaign: Campaign; liveSyncEventId?: string }> {
    const campaign = this.campaigns.find((c) => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found');

    campaign.status = 'active';
    campaign.sentCount = campaign.leadIds.length;
    campaign.openRate = 35 + Math.random() * 20;
    campaign.replyRate = 10 + Math.random() * 15;
    campaign.updatedAt = new Date().toISOString();

    const liveSyncEventId = await emitCampaignSent(campaign, campaign.sentCount);
    return { campaign, liveSyncEventId };
  }

  getSequence(sequenceId: string): OutreachSequence | undefined {
    return this.sequences.get(sequenceId);
  }
}
