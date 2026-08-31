import type { PersonalizationContext } from '../types.js';
import { KnowledgeIntegrationService } from './knowledge-integration.js';

export class PersonalizationEngine {
  private knowledge = new KnowledgeIntegrationService();

  buildContext(params: PersonalizationContext & { company?: string; name?: string }): {
    hooks: string[];
    industryInsight: string;
    productFit: string;
    citations: Array<{ title: string; excerpt: string }>;
  } {
    const query = [
      params.industry,
      params.title,
      params.company,
      params.companySize,
    ].filter(Boolean).join(' ');

    const refs = this.knowledge.retrieve(query || 'sales outreach personalization');
    const hooks: string[] = [];

    if (params.website) hooks.push(`Referenced ${params.website} for company research`);
    if (params.linkedIn) hooks.push(`Personalized based on LinkedIn profile activity`);
    if (params.crmHistory?.length) hooks.push(`Incorporated ${params.crmHistory.length} CRM touchpoints`);
    if (params.conversations?.length) hooks.push(`Built on ${params.conversations.length} prior conversations`);
    if (params.industry) hooks.push(`Industry-specific angle for ${params.industry}`);
    if (params.title) hooks.push(`Role-relevant messaging for ${params.title}`);
    if (params.companySize) hooks.push(`Sized offer for ${params.companySize} employee company`);

    if (hooks.length === 0) {
      hooks.push('Generic outreach with company name personalization');
    }

    return {
      hooks,
      industryInsight: refs.find((r) => r.type === 'battle_card')?.excerpt ??
        `Companies in ${params.industry ?? 'your industry'} typically see 2.5x reply rate improvement with AI personalization.`,
      productFit: refs.find((r) => r.type === 'product')?.excerpt ??
        'AI Pass Sales AI helps teams scale outbound without adding headcount.',
      citations: refs.slice(0, 3).map((r) => ({ title: r.title, excerpt: r.excerpt })),
    };
  }
}
