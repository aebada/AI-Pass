import type { MembershipTier } from '@ai-pass/shared';
import { createId } from '@ai-pass/shared';
import { defaultWalletService } from '@ai-pass/wallet';
import type { LinkedInDraft, LinkedInType } from '../types.js';
import { canAccessSalesAI } from '../membership-gates.js';
import { routeSalesRequest } from '../provider-routing.js';
import { defaultSalesTrustService } from '../trust.js';
import { PersonalizationEngine } from './personalization-engine.js';

export class LinkedInAssistantService {
  private drafts: LinkedInDraft[] = [];
  private personalization = new PersonalizationEngine();

  constructor(seedDrafts: LinkedInDraft[] = []) {
    this.drafts = [...seedDrafts];
  }

  list(tenantId: string): LinkedInDraft[] {
    return this.drafts.filter((d) => d.tenantId === tenantId);
  }

  generate(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    type: LinkedInType;
    leadId?: string;
    contactId?: string;
    recipientName?: string;
    company?: string;
    context?: string;
  }): { draft: LinkedInDraft; creditsUsed: number } {
    if (!canAccessSalesAI(params.tier)) {
      throw new Error('Sales AI requires Professional membership or higher.');
    }

    const route = routeSalesRequest({ taskType: 'linkedin', membershipTier: params.tier });
    const name = params.recipientName ?? 'there';
    const company = params.company ?? 'your company';

    const personal = this.personalization.buildContext({ company, name });

    const contentMap: Record<LinkedInType, string> = {
      connection: `Hi ${name}, I noticed your work at ${company} and would love to connect. ${personal.productFit.slice(0, 100)}...`,
      follow_up: `Hi ${name}, following up on my connection request. Would love to share how teams like ${company} are scaling outreach with AI.`,
      inmail: `Hi ${name},\n\nI came across ${company}'s recent growth and thought our Sales AI platform might resonate.\n\n${personal.industryInsight}\n\nOpen to a quick chat?`,
      comment: `Great insights, ${name}! We've seen similar trends with ${company}'s industry peers. Happy to share what we're learning.`,
      profile_optimization: `Headline: "Helping ${company} scale revenue with AI-powered sales workflows" | About: Focus on outcomes, metrics, and customer success stories.`,
      sequence: `Step 1: Connect → Step 2: Value-add comment → Step 3: InMail with case study → Step 4: Email follow-up`,
    };

    const trust = defaultSalesTrustService.evaluateOutbound({
      confidence: 0.84,
      hasPersonalization: true,
      complianceChecked: true,
      hallucinationRisk: 'low',
      channel: 'linkedin',
    });

    const creditsUsed = 2;
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: route.provider.name,
      model: route.model.id,
      credits: creditsUsed,
      estimatedCostUsd: creditsUsed * 0.002,
      taskType: `sales_linkedin_${params.type}`,
      module: 'sales-ai',
      metadata: { type: params.type, leadId: params.leadId },
    });

    const draft: LinkedInDraft = {
      id: `li_${createId()}`,
      tenantId: params.tenantId,
      leadId: params.leadId,
      contactId: params.contactId,
      type: params.type,
      content: contentMap[params.type],
      subject: params.type === 'inmail' ? `Quick idea for ${company}` : undefined,
      trustScore: trust.trustScore,
      confidence: 0.84,
      creditsUsed,
      createdAt: new Date().toISOString(),
    };

    this.drafts.push(draft);
    return { draft, creditsUsed };
  }
}
