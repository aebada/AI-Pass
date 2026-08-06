import type { MembershipTier } from '@ai-pass/shared';
import { createId } from '@ai-pass/shared';
import { defaultWalletService } from '@ai-pass/wallet';
import type { Proposal, ProposalType } from '../types.js';
import { canAccessSalesAI } from '../membership-gates.js';
import { routeSalesRequest } from '../provider-routing.js';
import { defaultSalesTrustService } from '../trust.js';
import { KnowledgeIntegrationService } from './knowledge-integration.js';

export class ProposalGeneratorService {
  private proposals: Proposal[] = [];
  private knowledge = new KnowledgeIntegrationService();

  constructor(seedProposals: Proposal[] = []) {
    this.proposals = [...seedProposals];
  }

  list(tenantId: string): Proposal[] {
    return this.proposals.filter((p) => p.tenantId === tenantId);
  }

  generate(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    type: ProposalType;
    leadId?: string;
    dealId?: string;
    title?: string;
    requirements?: string;
    budget?: number;
    currency?: string;
    company?: string;
  }): { proposal: Proposal; citations: Array<{ title: string; excerpt: string }>; creditsUsed: number } {
    if (!canAccessSalesAI(params.tier)) {
      throw new Error('Sales AI requires Professional membership or higher.');
    }

    const route = routeSalesRequest({ taskType: 'proposal', membershipTier: params.tier });
    const refs = this.knowledge.retrieve(params.requirements ?? 'sales proposal template');
    const company = params.company ?? 'Client';

    const typeLabels: Record<ProposalType, string> = {
      proposal: 'Proposal',
      quotation: 'Quotation',
      rfp: 'RFP Response',
      contract: 'Service Agreement',
      project_offer: 'Project Offer',
    };

    const trust = defaultSalesTrustService.evaluateOutbound({
      confidence: 0.91,
      hasPersonalization: Boolean(params.requirements),
      complianceChecked: true,
      hallucinationRisk: 'low',
      channel: 'proposal',
    });

    const creditsUsed = 8;
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: route.provider.name,
      model: route.model.id,
      credits: creditsUsed,
      estimatedCostUsd: creditsUsed * 0.005,
      taskType: `sales_proposal_${params.type}`,
      module: 'sales-ai',
      metadata: { type: params.type, leadId: params.leadId },
    });

    const proposal: Proposal = {
      id: `prop_${createId()}`,
      tenantId: params.tenantId,
      leadId: params.leadId,
      dealId: params.dealId,
      type: params.type,
      title: params.title ?? `${company} — ${typeLabels[params.type]}`,
      summary: refs[0]?.excerpt ?? `AI-generated ${typeLabels[params.type].toLowerCase()} for ${company}.`,
      sections: [
        { heading: 'Executive Summary', content: `This ${typeLabels[params.type].toLowerCase()} outlines how AI Pass Sales AI will help ${company} achieve revenue goals.` },
        { heading: 'Requirements', content: params.requirements ?? 'Standard enterprise sales automation requirements.' },
        { heading: 'Solution', content: refs.find((r) => r.type === 'product')?.excerpt ?? 'Full Sales AI platform with email, LinkedIn, CRM, and campaigns.' },
        { heading: 'Investment', content: params.budget ? `${params.currency ?? 'EUR'} ${params.budget.toLocaleString()}` : refs.find((r) => r.type === 'pricing')?.excerpt ?? 'Contact for pricing.' },
        { heading: 'Timeline', content: '4-week implementation with dedicated onboarding support.' },
      ],
      totalValue: params.budget,
      currency: params.currency ?? 'EUR',
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      trustScore: trust.trustScore,
      confidence: 0.91,
      creditsUsed,
      createdAt: new Date().toISOString(),
    };

    this.proposals.push(proposal);
    return {
      proposal,
      citations: refs.slice(0, 3).map((r) => ({ title: r.title, excerpt: r.excerpt })),
      creditsUsed,
    };
  }
}
