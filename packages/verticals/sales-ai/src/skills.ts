type SkillCategory =
  | 'parsing' | 'ocr' | 'retrieval' | 'decision' | 'automation' | 'analytics'
  | 'translation' | 'voice' | 'vision' | 'compliance' | 'knowledge'
  | 'api_integration' | 'computer_action' | 'communication' | 'reasoning' | 'rag' | 'custom';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

function slugify(name: string): string {
  return name.replace(/Skill$/, '').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

function toSkill(partial: {
  id?: string;
  name: string;
  version: string;
  developerId: string;
  category: SkillCategory;
  riskLevel: RiskLevel;
  planTierRequired: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  creditCost: number;
  deterministic: boolean;
  explainabilityRequired: boolean;
  platforms: string[];
  description?: string;
}) {
  return {
    ...partial,
    slug: slugify(partial.name),
    description: partial.description ?? `${partial.name} for Sales AI`,
    tags: ['sales', partial.category],
    modelsUsed: ['gpt-4o'],
    lifecycleStatus: 'published' as const,
    certified: false,
    featured: false,
    trending: false,
    installCount: 0,
    rating: 0,
    reviewCount: 0,
  };
}

export const SALES_AI_SKILLS = [
  toSkill({
    id: 'skill_sales_email',
    name: 'EmailDraftSkill',
    version: '1.0.0',
    developerId: 'dev_ai_pass',
    category: 'communication',
    riskLevel: 'medium',
    planTierRequired: 'professional',
    inputSchema: { type: 'object', properties: { type: { type: 'string' }, context: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { subject: { type: 'string' }, body: { type: 'string' } } },
    creditCost: 3,
    deterministic: false,
    explainabilityRequired: true,
    platforms: ['web'],
    description: 'Generate personalized sales emails',
  }),
  toSkill({
    id: 'skill_sales_linkedin',
    name: 'LinkedInDraftSkill',
    version: '1.0.0',
    developerId: 'dev_ai_pass',
    category: 'communication',
    riskLevel: 'medium',
    planTierRequired: 'professional',
    inputSchema: { type: 'object', properties: { type: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { content: { type: 'string' } } },
    creditCost: 2,
    deterministic: false,
    explainabilityRequired: true,
    platforms: ['web'],
    description: 'Generate LinkedIn outreach messages',
  }),
  toSkill({
    id: 'skill_sales_proposal',
    name: 'ProposalGenSkill',
    version: '1.0.0',
    developerId: 'dev_ai_pass',
    category: 'automation',
    riskLevel: 'medium',
    planTierRequired: 'power',
    inputSchema: { type: 'object', properties: { requirements: { type: 'string' } } },
    outputSchema: { type: 'object', properties: { sections: { type: 'array' } } },
    creditCost: 8,
    deterministic: false,
    explainabilityRequired: true,
    platforms: ['web'],
    description: 'Generate sales proposals and quotations',
  }),
];
