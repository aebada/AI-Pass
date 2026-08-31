import { createId, type Company, type OptimizationCategory, type OptimizationRecommendation, type PresenceGap, type PresenceScore } from '@ai-pass/shared';

const PLAYBOOK: Array<{
  category: OptimizationCategory;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionItems: string[];
  condition: (score: PresenceScore, gaps: PresenceGap[]) => boolean;
}> = [
  {
    category: 'website',
    title: 'Optimize homepage for AI crawlers',
    description: 'Ensure clear entity signals and product descriptions on primary web properties',
    impact: 'high',
    actionItems: ['Add structured company overview', 'Include product taxonomy', 'Publish AI-readable sitemap'],
    condition: (s) => s.visibility < 60,
  },
  {
    category: 'landing_pages',
    title: 'Create use-case landing pages',
    description: 'Dedicated pages for high-value prompt clusters',
    impact: 'high',
    actionItems: ['Map prompts to landing pages', 'Add comparison tables', 'Include customer proof points'],
    condition: (s) => s.ranking < 50,
  },
  {
    category: 'structured_data',
    title: 'Add JSON-LD structured data',
    description: 'Machine-readable organization and product markup',
    impact: 'medium',
    actionItems: ['Organization schema', 'Product schema', 'FAQ schema'],
    condition: (s) => s.accuracy < 80,
  },
  {
    category: 'schema_org',
    title: 'Implement schema.org entity graph',
    description: 'Link products, services, and brand entities',
    impact: 'medium',
    actionItems: ['Define @graph relationships', 'Validate with Rich Results Test'],
    condition: () => true,
  },
  {
    category: 'knowledge_base',
    title: 'Publish AI-ready knowledge base',
    description: 'Comprehensive docs for AI training and retrieval',
    impact: 'high',
    actionItems: ['Index product docs', 'Add glossary', 'Cross-link capabilities'],
    condition: (s) => s.recommendation < 55,
  },
  {
    category: 'faq',
    title: 'Expand FAQ coverage',
    description: 'Answer high-intent questions AI models commonly receive',
    impact: 'high',
    actionItems: ['Top 20 customer questions', 'Competitive comparison FAQs', 'Pricing transparency'],
    condition: (_s, g) => g.some((x) => x.type === 'missing_presence'),
  },
  {
    category: 'docs',
    title: 'Technical documentation refresh',
    description: 'Update API and integration docs for accuracy',
    impact: 'medium',
    actionItems: ['Version current features', 'Remove deprecated endpoints', 'Add changelog'],
    condition: (_s, g) => g.some((x) => x.type === 'outdated'),
  },
  {
    category: 'external_refs',
    title: 'Build authoritative external references',
    description: 'Citations from trusted third-party sources',
    impact: 'medium',
    actionItems: ['Industry analyst mentions', 'GitHub presence', 'Community forums'],
    condition: () => true,
  },
  {
    category: 'pr',
    title: 'PR and thought leadership',
    description: 'Increase brand mentions in training-adjacent content',
    impact: 'low',
    actionItems: ['Press releases', 'Guest articles', 'Podcast appearances'],
    condition: () => true,
  },
  {
    category: 'directories',
    title: 'Directory and marketplace listings',
    description: 'Ensure consistent NAP and product data across directories',
    impact: 'medium',
    actionItems: ['G2/Capterra profiles', 'AI tool directories', 'Industry registries'],
    condition: () => true,
  },
  {
    category: 'entity_optimization',
    title: 'Entity optimization for AI models',
    description: 'Strengthen brand entity recognition across providers',
    impact: 'high',
    actionItems: ['Wikidata entry', 'Knowledge panel signals', 'Consistent naming'],
    condition: (_s, g) => g.some((x) => x.type === 'competitor_dominance'),
  },
  {
    category: 'ai_ready_content',
    title: 'AI-ready content format',
    description: 'Content structured for LLM consumption and citation',
    impact: 'high',
    actionItems: ['Clear headings', 'Bullet summaries', 'Definitive statements'],
    condition: (s) => s.overall < 70,
  },
];

export class OptimizationEngine {
  recommend(
    company: Company,
    score: PresenceScore,
    gaps: PresenceGap[],
  ): OptimizationRecommendation[] {
    const recs: OptimizationRecommendation[] = [];

    for (const item of PLAYBOOK) {
      if (!item.condition(score, gaps)) continue;
      recs.push({
        id: `rec_${createId()}`,
        companyId: company.id,
        category: item.category,
        title: item.title,
        description: item.description,
        impact: item.impact,
        actionItems: item.actionItems,
        estimatedLift: item.impact === 'high' ? 15 : item.impact === 'medium' ? 8 : 4,
        status: 'open',
        trustRisk: item.category === 'pr' ? 'medium' : 'low',
      });
    }

    return recs.slice(0, 10);
  }
}
