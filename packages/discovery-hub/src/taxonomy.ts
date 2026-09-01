/**
 * AI Discovery Hub taxonomy — enterprise catalog categories.
 * Broader than MarketplaceCategory so the hub can index external AI products
 * (directories like Aixploria) while remaining orchestration-aware.
 */

export type DiscoveryCapability =
  | 'text'
  | 'vision'
  | 'audio'
  | 'video'
  | 'code'
  | 'multimodal';

export type DiscoveryDeployment =
  | 'cloud'
  | 'on_premise'
  | 'api'
  | 'docker'
  | 'local';

export type DiscoveryPricing =
  | 'free'
  | 'freemium'
  | 'subscription'
  | 'pay_as_you_go'
  | 'enterprise';

export type DiscoveryCompliance =
  | 'gdpr'
  | 'soc2'
  | 'iso27001'
  | 'hipaa'
  | 'iso42001';

export type DiscoveryIntegration =
  | 'slack'
  | 'teams'
  | 'notion'
  | 'google_drive'
  | 'github'
  | 'zapier'
  | 'sap'
  | 'salesforce'
  | 'jira'
  | 'webhook';

export type DiscoveryModelFamily =
  | 'gpt'
  | 'claude'
  | 'gemini'
  | 'llama'
  | 'mistral'
  | 'deepseek'
  | 'qwen'
  | 'other';

/** Top-level discovery taxonomy (spec categories). */
export type DiscoveryTaxonomyId =
  | 'text_llm'
  | 'coding'
  | 'image'
  | 'video'
  | 'audio'
  | 'productivity'
  | 'marketing'
  | 'business'
  | 'data_ai'
  | 'robotics'
  | 'healthcare'
  | 'cybersecurity'
  | 'education'
  | 'research'
  | 'design'
  | 'sales'
  | 'customer_support'
  | 'enterprise_ai';

export interface DiscoveryTaxonomyNode {
  id: DiscoveryTaxonomyId;
  slug: string;
  label: string;
  description: string;
  subcategories: string[];
}

export const DISCOVERY_TAXONOMY: DiscoveryTaxonomyNode[] = [
  {
    id: 'text_llm',
    slug: 'text-llm',
    label: 'Text & LLM',
    description: 'Chatbots, writing, translation, summarization, and prompt engineering.',
    subcategories: ['Chatbots', 'Writing', 'Translation', 'Summarization', 'Prompt Engineering'],
  },
  {
    id: 'coding',
    slug: 'coding',
    label: 'Coding',
    description: 'Code generation, review, DevOps, testing, and API development.',
    subcategories: ['Code Generation', 'Code Review', 'DevOps', 'Testing', 'API Development'],
  },
  {
    id: 'image',
    slug: 'image',
    label: 'Image',
    description: 'Image generation, editing, upscaling, background removal, and OCR.',
    subcategories: ['Image Generation', 'Editing', 'Upscaling', 'Background Removal', 'OCR'],
  },
  {
    id: 'video',
    slug: 'video',
    label: 'Video',
    description: 'Video generation, editing, lip sync, animation, and avatars.',
    subcategories: ['Video Generation', 'Editing', 'Lip Sync', 'Animation', 'Avatars'],
  },
  {
    id: 'audio',
    slug: 'audio',
    label: 'Audio',
    description: 'Speech-to-text, text-to-speech, voice cloning, and music generation.',
    subcategories: ['Speech-to-Text', 'Text-to-Speech', 'Voice Cloning', 'Music Generation'],
  },
  {
    id: 'productivity',
    slug: 'productivity',
    label: 'Productivity',
    description: 'Notes, documents, presentations, email, and calendar AI.',
    subcategories: ['Notes', 'Documents', 'Presentations', 'Email', 'Calendar'],
  },
  {
    id: 'marketing',
    slug: 'marketing',
    label: 'Marketing',
    description: 'SEO, ads, social media, and email marketing AI.',
    subcategories: ['SEO', 'Ads', 'Social Media', 'Email Marketing'],
  },
  {
    id: 'business',
    slug: 'business',
    label: 'Business',
    description: 'CRM, ERP, finance, HR, and legal AI systems.',
    subcategories: ['CRM', 'ERP', 'Finance', 'HR', 'Legal'],
  },
  {
    id: 'data_ai',
    slug: 'data-ai',
    label: 'Data & AI',
    description: 'Vector databases, MLOps, AutoML, labeling, and annotation.',
    subcategories: ['Vector Databases', 'MLOps', 'AutoML', 'Labeling', 'Annotation'],
  },
  {
    id: 'robotics',
    slug: 'robotics',
    label: 'Robotics',
    description: 'Robotics perception, planning, and control AI.',
    subcategories: ['Perception', 'Planning', 'Control'],
  },
  {
    id: 'healthcare',
    slug: 'healthcare',
    label: 'Healthcare',
    description: 'Clinical, imaging, and health operations AI.',
    subcategories: ['Clinical', 'Imaging', 'Operations'],
  },
  {
    id: 'cybersecurity',
    slug: 'cybersecurity',
    label: 'Cybersecurity',
    description: 'Threat detection, SOC automation, and security AI.',
    subcategories: ['Threat Detection', 'SOC', 'Identity'],
  },
  {
    id: 'education',
    slug: 'education',
    label: 'Education',
    description: 'Tutoring, assessment, and learning AI.',
    subcategories: ['Tutoring', 'Assessment', 'Learning'],
  },
  {
    id: 'research',
    slug: 'research',
    label: 'Research',
    description: 'Literature review, experiment design, and scientific AI.',
    subcategories: ['Literature', 'Experiments', 'Scientific Assistants'],
  },
  {
    id: 'design',
    slug: 'design',
    label: 'Design',
    description: 'UI, product, and brand design AI.',
    subcategories: ['UI Design', 'Product Design', 'Brand'],
  },
  {
    id: 'sales',
    slug: 'sales',
    label: 'Sales',
    description: 'Outbound, CRM copilots, and revenue AI.',
    subcategories: ['Outbound', 'CRM Copilots', 'Revenue Ops'],
  },
  {
    id: 'customer_support',
    slug: 'customer-support',
    label: 'Customer Support',
    description: 'Voice, chat, and ticket automation AI.',
    subcategories: ['Voice', 'Chat', 'Ticketing'],
  },
  {
    id: 'enterprise_ai',
    slug: 'enterprise-ai',
    label: 'Enterprise AI',
    description: 'Platforms for private AI, agents, governance, and orchestration.',
    subcategories: ['Private AI', 'Agents', 'Governance', 'Orchestration'],
  },
];

export function getTaxonomyBySlug(slug: string): DiscoveryTaxonomyNode | undefined {
  return DISCOVERY_TAXONOMY.find((t) => t.slug === slug || t.id === slug);
}
