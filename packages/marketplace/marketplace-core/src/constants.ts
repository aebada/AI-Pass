import type { MarketplaceSkillCategory, ApplicationType, MarketplaceCategory } from './types.js';

export const SKILL_CATEGORIES: MarketplaceSkillCategory[] = [
  'parsing', 'ocr', 'retrieval', 'decision', 'automation', 'analytics',
  'translation', 'voice', 'vision', 'compliance', 'knowledge',
  'api_integration', 'computer_action', 'communication', 'reasoning', 'rag', 'custom',
];

export const SKILL_CATEGORY_LABELS: Record<MarketplaceSkillCategory, string> = {
  parsing: 'Parsing',
  ocr: 'OCR',
  retrieval: 'Retrieval',
  decision: 'Decision',
  automation: 'Automation',
  analytics: 'Analytics',
  translation: 'Translation',
  voice: 'Voice',
  vision: 'Vision',
  compliance: 'Compliance',
  knowledge: 'Knowledge',
  api_integration: 'API Integration',
  computer_action: 'Computer Action',
  communication: 'Communication',
  reasoning: 'Reasoning',
  rag: 'RAG',
  custom: 'Custom',
};

export const APPLICATION_TYPES: ApplicationType[] = [
  'hosted_saas', 'github_app', 'external_app', 'automation_pack',
  'agent_pack', 'skill_pack', 'enterprise_app', 'private_app',
];

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  'finance', 'supply_chain', 'hr', 'customer_support', 'marketing', 'sales',
  'legal', 'healthcare', 'manufacturing', 'education', 'automation',
  'developer_tools', 'ai_agents', 'compliance', 'analytics', 'knowledge',
  'voice_ai', 'vision_ai', 'iot', 'custom',
];

export const CATEGORY_LABELS: Record<MarketplaceCategory, string> = {
  finance: 'Finance',
  supply_chain: 'Supply Chain',
  hr: 'HR',
  customer_support: 'Customer Support',
  marketing: 'Marketing',
  sales: 'Sales',
  legal: 'Legal',
  healthcare: 'Healthcare',
  manufacturing: 'Manufacturing',
  education: 'Education',
  automation: 'Automation',
  developer_tools: 'Developer Tools',
  ai_agents: 'AI Agents',
  compliance: 'Compliance',
  analytics: 'Analytics',
  knowledge: 'Knowledge',
  voice_ai: 'Voice AI',
  vision_ai: 'Vision AI',
  iot: 'IoT',
  custom: 'Custom',
};

export const DEFAULT_REVENUE_SHARE = {
  developerShare: 0.7,
  platformFee: 0.3,
} as const;

export const DEFAULT_SANDBOX_LIMITS = {
  memoryMb: 512,
  cpuPercent: 50,
  timeoutMs: 30_000,
  maxConcurrent: 5,
};
