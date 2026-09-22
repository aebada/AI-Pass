import type { MembershipTier } from '@ai-pass/shared';
import { createId } from '@ai-pass/shared';
import { defaultWalletService } from '@ai-pass/wallet';
import type { MeetingPrep } from '../types.js';
import { canAccessSalesAI } from '../membership-gates.js';
import { routeSalesRequest } from '../provider-routing.js';
import { KnowledgeIntegrationService } from './knowledge-integration.js';

export class MeetingPrepService {
  private preps: MeetingPrep[] = [];
  private knowledge = new KnowledgeIntegrationService();

  constructor(seedPreps: MeetingPrep[] = []) {
    this.preps = [...seedPreps];
  }

  list(tenantId: string): MeetingPrep[] {
    return this.preps.filter((p) => p.tenantId === tenantId);
  }

  generate(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    leadId?: string;
    company: string;
    website?: string;
    meetingGoal?: string;
    industry?: string;
  }): { prep: MeetingPrep; creditsUsed: number } {
    if (!canAccessSalesAI(params.tier)) {
      throw new Error('Sales AI requires Professional membership or higher.');
    }

    const route = routeSalesRequest({ taskType: 'meeting_prep', membershipTier: params.tier });
    const refs = this.knowledge.retrieve(`${params.company} ${params.industry ?? ''} meeting prep`);

    const creditsUsed = 5;
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: route.provider.name,
      model: route.model.id,
      credits: creditsUsed,
      estimatedCostUsd: creditsUsed * 0.004,
      taskType: 'sales_meeting_prep',
      module: 'sales-ai',
      metadata: { company: params.company, leadId: params.leadId },
    });

    const prep: MeetingPrep = {
      id: `prep_${createId()}`,
      tenantId: params.tenantId,
      leadId: params.leadId,
      company: params.company,
      companySummary: `${params.company} is a ${params.industry ?? 'technology'} company${params.website ? ` (${params.website})` : ''}. ${refs[0]?.excerpt ?? 'Growing organization evaluating sales automation solutions.'}`,
      decisionMakers: [
        { name: 'Primary Contact', title: 'Decision Maker', linkedIn: undefined },
      ],
      recentNews: [
        `${params.company} expanding sales operations in 2026`,
        `Industry trend: AI adoption in ${params.industry ?? 'B2B'} sales`,
      ],
      suggestedQuestions: [
        'What does your current outbound process look like?',
        'What tools is your sales team using today?',
        'What are your pipeline targets for this quarter?',
        'Who else should be involved in this evaluation?',
        'What would success look like in 90 days?',
      ],
      agenda: [
        'Introductions and goals (5 min)',
        `Current state — ${params.company} (10 min)`,
        'Sales AI demo (15 min)',
        'ROI and next steps (10 min)',
      ],
      strategy: params.meetingGoal ??
        `Lead with efficiency and ROI. Reference ${params.company}'s growth and position Sales AI as a force multiplier.`,
      risks: [
        'Budget constraints or competing priorities',
        'Existing CRM workflow friction',
        'Change management for sales team adoption',
      ],
      opportunities: [
        'Revenue growth mandate creates urgency',
        'Native CRM integration reduces implementation risk',
        'Multi-seat expansion potential',
      ],
      creditsUsed,
      createdAt: new Date().toISOString(),
    };

    this.preps.push(prep);
    return { prep, creditsUsed };
  }
}
