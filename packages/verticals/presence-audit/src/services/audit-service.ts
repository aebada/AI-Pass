import { createId, type Company, type MembershipTier, type Prompt, type ProviderResponse } from '@ai-pass/shared';
import type { ProviderRouting } from '../provider-routing.js';
import { defaultProviderRouting } from '../provider-routing.js';
import { AUDIT_PROVIDERS } from './provider-service.js';

export class AuditService {
  constructor(private routing: ProviderRouting = defaultProviderRouting) {}

  async runAudit(params: {
    auditRunId: string;
    company: Company;
    prompts: Prompt[];
    providers: typeof AUDIT_PROVIDERS;
    userId: string;
    membershipTier: MembershipTier;
  }): Promise<ProviderResponse[]> {
    const responses: ProviderResponse[] = [];

    for (const prompt of params.prompts) {
      for (const provider of params.providers) {
        const systemPrompt = `You are analyzing AI visibility for company "${params.company.name}" (${params.company.website}). Industry: ${params.company.industry}. Respond with ranked recommendations.`;
        const result = await this.routing.queryProvider({
          provider,
          prompt: prompt.prompt,
          systemPrompt,
          userId: params.userId,
          tenantId: params.company.tenantId,
          membershipTier: params.membershipTier,
        });

        const parsed = this.parseResponse(params.company, result.content);
        responses.push({
          id: `resp_${createId()}`,
          auditRunId: params.auditRunId,
          provider,
          promptId: prompt.id,
          queryId: prompt.id,
          fullAnswer: result.content,
          companyMentioned: parsed.mentioned,
          rankingPosition: parsed.rank,
          competitorsMentioned: parsed.competitors,
          sentiment: parsed.sentiment,
          tone: parsed.tone,
          hallucinations: parsed.hallucinations,
          outdatedInfo: parsed.outdated,
          timestamp: new Date().toISOString(),
          creditsUsed: result.credits,
        });
      }
    }

    return this.normalize(responses);
  }

  normalize(responses: ProviderResponse[]): ProviderResponse[] {
    return responses.map((r) => ({
      ...r,
      competitorsMentioned: [...new Set(r.competitorsMentioned)],
    }));
  }

  private parseResponse(company: Company, content: string) {
    const lower = content.toLowerCase();
    const mentioned = lower.includes(company.name.toLowerCase());
    const competitors = company.competitors.filter((c) => lower.includes(c.toLowerCase()));
    const rankMatch = content.match(/#(\d)|rank[:\s]+(\d)|position[:\s]+(\d)/i);
    const rank = rankMatch ? Number(rankMatch[1] ?? rankMatch[2] ?? rankMatch[3]) : mentioned ? 3 : undefined;

    return {
      mentioned,
      rank,
      competitors,
      sentiment: mentioned ? ('positive' as const) : ('neutral' as const),
      tone: 'professional',
      hallucinations: lower.includes('founded in 1990') ? ['Incorrect founding date'] : [],
      outdated: lower.includes('deprecated') ? ['References deprecated product'] : [],
    };
  }
}
