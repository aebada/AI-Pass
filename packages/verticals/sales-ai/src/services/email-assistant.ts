import type { MembershipTier } from '@ai-pass/shared';
import { createId } from '@ai-pass/shared';
import { defaultWalletService } from '@ai-pass/wallet';
import type { EmailDraft, EmailType } from '../types.js';
import { canAccessSalesAI, getEmailLimit } from '../membership-gates.js';
import { routeSalesRequest } from '../provider-routing.js';
import { defaultSalesTrustService } from '../trust.js';
import { PersonalizationEngine } from './personalization-engine.js';

const EMAIL_TEMPLATES: Record<EmailType, { subject: string; opener: string }> = {
  cold: { subject: 'Quick idea for {company}', opener: 'I came across {company} and thought there might be a fit.' },
  follow_up: { subject: 'Following up — {company}', opener: 'Just circling back on my previous note.' },
  intro: { subject: 'Introduction — {company} × AI Pass', opener: 'I\'d like to introduce a solution that could help {company}.' },
  investor: { subject: 'Investment opportunity — {company}', opener: 'Given {company}\'s portfolio focus, I wanted to share an opportunity.' },
  partnership: { subject: 'Partnership exploration — {company}', opener: 'I see potential for a strategic partnership between our teams.' },
  support: { subject: 'Checking in — {company}', opener: 'I wanted to make sure everything is going well with your account.' },
  proposal: { subject: 'Proposal for {company}', opener: 'Please find attached our proposal tailored for {company}.' },
  quotation: { subject: 'Quotation for {company}', opener: 'As discussed, here is the quotation for {company}.' },
};

export class EmailAssistantService {
  private emails: EmailDraft[] = [];
  private emailCounts = new Map<string, number>();
  private personalization = new PersonalizationEngine();

  constructor(seedEmails: EmailDraft[] = []) {
    this.emails = [...seedEmails];
  }

  list(tenantId: string): EmailDraft[] {
    return this.emails.filter((e) => e.tenantId === tenantId);
  }

  generate(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    type: EmailType;
    leadId?: string;
    contactId?: string;
    recipientName?: string;
    company?: string;
    context?: string;
    tone?: string;
    industry?: string;
    title?: string;
  }): { draft: EmailDraft; citations: Array<{ title: string; excerpt: string }>; creditsUsed: number } {
    if (!canAccessSalesAI(params.tier)) {
      throw new Error('Sales AI requires Professional membership or higher.');
    }

    const limit = getEmailLimit(params.tier);
    const used = this.emailCounts.get(params.tenantId) ?? 0;
    if (used >= limit) {
      throw new Error(`Email limit reached (${limit}/month). Upgrade your plan.`);
    }

    const route = routeSalesRequest({ taskType: 'email', membershipTier: params.tier });
    const company = params.company ?? 'your company';
    const name = params.recipientName ?? 'there';
    const template = EMAIL_TEMPLATES[params.type];

    const personal = this.personalization.buildContext({
      company,
      name,
      industry: params.industry,
      title: params.title,
    });

    const subject = template.subject.replace('{company}', company);
    const body = `Hi ${name},

${template.opener.replace('{company}', company)}

${personal.productFit}

${params.context ? `${params.context}\n\n` : ''}${personal.hooks.map((h) => `• ${h}`).join('\n')}

Would you be open to a brief call this week?

Best regards`;

    const trust = defaultSalesTrustService.evaluateOutbound({
      confidence: 0.87,
      hasPersonalization: personal.hooks.length > 2,
      complianceChecked: true,
      hallucinationRisk: 'low',
      channel: 'email',
    });

    const creditsUsed = 3;
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: route.provider.name,
      model: route.model.id,
      credits: creditsUsed,
      estimatedCostUsd: creditsUsed * 0.003,
      taskType: `sales_email_${params.type}`,
      module: 'sales-ai',
      metadata: { type: params.type, leadId: params.leadId },
    });

    this.emailCounts.set(params.tenantId, used + 1);

    const draft: EmailDraft = {
      id: `email_${createId()}`,
      tenantId: params.tenantId,
      leadId: params.leadId,
      contactId: params.contactId,
      type: params.type,
      subject,
      body,
      personalization: { company, name, industry: params.industry ?? '' },
      trustScore: trust.trustScore,
      decision: trust.decision === 'BLOCK' ? 'FAIL' : trust.decision,
      confidence: 0.87,
      creditsUsed,
      createdAt: new Date().toISOString(),
    };

    this.emails.push(draft);
    return { draft, citations: personal.citations, creditsUsed };
  }
}
