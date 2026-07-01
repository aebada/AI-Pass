type SkillCategory =
  | 'parsing' | 'ocr' | 'retrieval' | 'decision' | 'automation' | 'analytics'
  | 'translation' | 'voice' | 'vision' | 'compliance' | 'knowledge'
  | 'api_integration' | 'computer_action' | 'communication' | 'reasoning' | 'rag' | 'custom';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

function slugify(name: string): string {
  return name.replace(/Skill$/, '').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
}

function toSkill(
  partial: {
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
  },
) {
  return {
    ...partial,
    slug: slugify(partial.name),
    description: partial.description ?? `${partial.name} for Customer Support AI`,
    tags: ['customer-support', partial.category],
    modelsUsed: ['gpt-4o'],
    lifecycleStatus: 'published' as const,
    certified: false,
    featured: false,
    trending: false,
    installCount: 0,
    rating: 4.5,
    reviewCount: 0,
  };
}

/** Customer Support AI skills — registered in marketplace-core */
export const CUSTOMER_SUPPORT_SKILLS = [
  toSkill({ id: 'skill_cs_intent', name: 'IntentDetectionSkill', version: '1.0.0', developerId: 'ai-pass', category: 'decision', riskLevel: 'low', planTierRequired: 'free', inputSchema: {}, outputSchema: {}, creditCost: 3, deterministic: true, explainabilityRequired: true, platforms: ['web', 'mobile'] }),
  toSkill({ id: 'skill_cs_lang', name: 'LanguageDetectionSkill', version: '1.0.0', developerId: 'ai-pass', category: 'knowledge', riskLevel: 'low', planTierRequired: 'free', inputSchema: {}, outputSchema: {}, creditCost: 1, deterministic: true, explainabilityRequired: false, platforms: ['web', 'mobile'] }),
  toSkill({ id: 'skill_cs_memory', name: 'ConversationMemorySkill', version: '1.0.0', developerId: 'ai-pass', category: 'knowledge', riskLevel: 'low', planTierRequired: 'professional', inputSchema: {}, outputSchema: {}, creditCost: 2, deterministic: false, explainabilityRequired: false, platforms: ['web', 'mobile'] }),
  toSkill({ id: 'skill_cs_summary', name: 'SummarizationSkill', version: '1.0.0', developerId: 'ai-pass', category: 'reasoning', riskLevel: 'low', planTierRequired: 'professional', inputSchema: {}, outputSchema: {}, creditCost: 5, deterministic: false, explainabilityRequired: true, platforms: ['web', 'mobile'] }),
  toSkill({ id: 'skill_cs_faq', name: 'FAQRetrievalSkill', version: '1.0.0', developerId: 'ai-pass', category: 'retrieval', riskLevel: 'low', planTierRequired: 'free', inputSchema: {}, outputSchema: {}, creditCost: 4, deterministic: false, explainabilityRequired: true, platforms: ['web', 'mobile'] }),
  toSkill({ id: 'skill_cs_policy', name: 'PolicyRetrievalSkill', version: '1.0.0', developerId: 'ai-pass', category: 'retrieval', riskLevel: 'medium', planTierRequired: 'professional', inputSchema: {}, outputSchema: {}, creditCost: 4, deterministic: false, explainabilityRequired: true, platforms: ['web', 'mobile'] }),
  toSkill({ id: 'skill_cs_order', name: 'OrderLookupSkill', version: '1.0.0', developerId: 'ai-pass', category: 'knowledge', riskLevel: 'medium', planTierRequired: 'professional', inputSchema: {}, outputSchema: {}, creditCost: 5, deterministic: true, explainabilityRequired: true, platforms: ['web', 'mobile'] }),
  toSkill({ id: 'skill_cs_profile', name: 'CustomerProfileSkill', version: '1.0.0', developerId: 'ai-pass', category: 'knowledge', riskLevel: 'medium', planTierRequired: 'professional', inputSchema: {}, outputSchema: {}, creditCost: 3, deterministic: true, explainabilityRequired: false, platforms: ['web', 'mobile'] }),
  toSkill({ id: 'skill_cs_refund', name: 'RefundEligibilitySkill', version: '1.0.0', developerId: 'ai-pass', category: 'decision', riskLevel: 'high', planTierRequired: 'power', inputSchema: {}, outputSchema: {}, creditCost: 8, deterministic: true, explainabilityRequired: true, platforms: ['web', 'mobile'] }),
  toSkill({ id: 'skill_cs_complaint', name: 'ComplaintClassificationSkill', version: '1.0.0', developerId: 'ai-pass', category: 'decision', riskLevel: 'medium', planTierRequired: 'professional', inputSchema: {}, outputSchema: {}, creditCost: 5, deterministic: false, explainabilityRequired: true, platforms: ['web', 'mobile'] }),
  toSkill({ id: 'skill_cs_escalation', name: 'EscalationDecisionSkill', version: '1.0.0', developerId: 'ai-pass', category: 'decision', riskLevel: 'high', planTierRequired: 'professional', inputSchema: {}, outputSchema: {}, creditCost: 6, deterministic: true, explainabilityRequired: true, platforms: ['web', 'mobile'] }),
  toSkill({ id: 'skill_cs_crm', name: 'CRMUpdateSkill', version: '1.0.0', developerId: 'ai-pass', category: 'automation', riskLevel: 'high', planTierRequired: 'power', inputSchema: {}, outputSchema: {}, creditCost: 5, deterministic: true, explainabilityRequired: false, platforms: ['web'] }),
  toSkill({ id: 'skill_cs_ticket', name: 'TicketCreationSkill', version: '1.0.0', developerId: 'ai-pass', category: 'automation', riskLevel: 'medium', planTierRequired: 'professional', inputSchema: {}, outputSchema: {}, creditCost: 4, deterministic: true, explainabilityRequired: false, platforms: ['web', 'mobile'] }),
  toSkill({ id: 'skill_cs_email', name: 'EmailSkill', version: '1.0.0', developerId: 'ai-pass', category: 'communication', riskLevel: 'low', planTierRequired: 'professional', inputSchema: {}, outputSchema: {}, creditCost: 2, deterministic: false, explainabilityRequired: false, platforms: ['web'] }),
  toSkill({ id: 'skill_cs_slack', name: 'SlackSkill', version: '1.0.0', developerId: 'ai-pass', category: 'communication', riskLevel: 'low', planTierRequired: 'power', inputSchema: {}, outputSchema: {}, creditCost: 2, deterministic: false, explainabilityRequired: false, platforms: ['web'] }),
  toSkill({ id: 'skill_cs_voice', name: 'VoiceRecognitionSkill', version: '1.0.0', developerId: 'ai-pass', category: 'voice', riskLevel: 'medium', planTierRequired: 'power', inputSchema: {}, outputSchema: {}, creditCost: 10, deterministic: false, explainabilityRequired: false, platforms: ['web', 'mobile'] }),
  toSkill({ id: 'skill_cs_tts', name: 'TTSSkill', version: '1.0.0', developerId: 'ai-pass', category: 'voice', riskLevel: 'low', planTierRequired: 'power', inputSchema: {}, outputSchema: {}, creditCost: 8, deterministic: false, explainabilityRequired: false, platforms: ['web', 'mobile'] }),
];

export const SUPPORT_SKILL_NAMES = CUSTOMER_SUPPORT_SKILLS.map((s) => s.name);
