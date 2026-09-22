import type { MembershipTier } from '@ai-pass/shared';
import { defaultWalletService } from '@ai-pass/wallet';
import { canAccessSalesAI } from '../membership-gates.js';
import { routeSalesRequest } from '../provider-routing.js';
import type { Deal, Lead } from '../types.js';
import { KnowledgeIntegrationService } from './knowledge-integration.js';

export class SalesCopilotService {
  private knowledge = new KnowledgeIntegrationService();

  chat(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    message: string;
    lead?: Lead;
    deal?: Deal;
    context?: string;
  }): {
    reply: string;
    suggestions: string[];
    nextBestAction?: string;
    objections?: string[];
    dealInsights?: string[];
    followUps?: string[];
    confidence: number;
    creditsUsed: number;
  } {
    if (!canAccessSalesAI(params.tier)) {
      throw new Error('Sales AI requires Professional membership or higher.');
    }

    const route = routeSalesRequest({ taskType: 'copilot', membershipTier: params.tier });
    const refs = this.knowledge.retrieve(params.message);
    const lower = params.message.toLowerCase();

    let reply = 'I can help with email drafts, objection handling, deal insights, and next-best actions. What would you like to focus on?';
    const suggestions = [
      'Draft a follow-up email',
      'Prepare for tomorrow\'s meeting',
      'Analyze deal pipeline',
      'Handle pricing objection',
    ];
    let nextBestAction: string | undefined;
    let objections: string[] | undefined;
    let dealInsights: string[] | undefined;
    let followUps: string[] | undefined;

    if (lower.includes('objection') || lower.includes('price') || lower.includes('budget')) {
      objections = [
        'Price is too high — emphasize ROI: 2.5x reply rate, 80% time savings',
        'Need to think about it — offer pilot program or case study',
        'Using competitor — highlight CRM integration and unified platform',
        'No budget this quarter — propose phased rollout starting Q4',
      ];
      reply = `Here are responses to common objections:\n\n${objections.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
      nextBestAction = 'Send ROI calculator and customer case study';
    } else if (lower.includes('meeting') || lower.includes('prep')) {
      reply = `For your meeting with ${params.lead?.company ?? 'the prospect'}, I recommend:\n\n1. Open with their recent growth news\n2. Demo email + CRM sync workflow\n3. Close with specific next steps and timeline`;
      nextBestAction = 'Generate meeting prep brief';
      followUps = ['Send recap email within 2 hours', 'Share proposal draft', 'Schedule technical demo'];
    } else if (lower.includes('deal') || lower.includes('pipeline') || params.deal) {
      dealInsights = [
        `Deal value: ${params.deal?.value ?? 'N/A'} ${params.deal?.currency ?? 'EUR'}`,
        `Stage: ${params.deal?.stage ?? 'discovery'} at ${params.deal?.probability ?? 30}% probability`,
        'Similar deals close 15% faster with proposal sent within 48h of demo',
        refs[0] ? `Context: ${refs[0].excerpt}` : 'No additional context found',
      ];
      reply = `Deal insights:\n\n${dealInsights.join('\n')}`;
      nextBestAction = 'Send proposal and schedule decision-maker call';
    } else if (lower.includes('follow') || lower.includes('email')) {
      followUps = [
        'Day 1: Value-add email with industry insight',
        'Day 3: LinkedIn connection with personalized note',
        'Day 7: Case study share',
        'Day 14: Break-up email with open door',
      ];
      reply = `Recommended follow-up sequence:\n\n${followUps.join('\n')}`;
      nextBestAction = 'Generate follow-up email for top lead';
    } else if (params.lead) {
      reply = `For ${params.lead.company} (score: ${params.lead.score}):\n\nStatus: ${params.lead.status}\nIndustry: ${params.lead.industry ?? 'N/A'}\n\n${refs[0]?.excerpt ?? 'Consider a personalized cold email highlighting industry-specific ROI.'}`;
      nextBestAction = params.lead.score > 80 ? 'Schedule demo call' : 'Send personalized cold email';
    }

    const creditsUsed = 2;
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: route.provider.name,
      model: route.model.id,
      credits: creditsUsed,
      estimatedCostUsd: creditsUsed * 0.002,
      taskType: 'sales_copilot',
      module: 'sales-ai',
      metadata: { messageLength: params.message.length },
    });

    return { reply, suggestions, nextBestAction, objections, dealInsights, followUps, confidence: 0.86, creditsUsed };
  }
}
