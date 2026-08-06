import type { Company } from '@ai-pass/shared';

/** Links presence insights to Discovery Hub tool visibility */
export function toDiscoveryVisibilityInsight(company: Company, presenceScore: number) {
  return {
    toolSlug: 'presence-audit',
    toolName: company.name,
    visibilityScore: presenceScore,
    discoveryRoute: '/workspace/marketplace',
    presenceAuditRoute: '/workspace/apps/presence-audit',
    category: 'data_analytics',
    insight: `AI presence score ${presenceScore} across ChatGPT, Claude, Gemini, Perplexity`,
  };
}
