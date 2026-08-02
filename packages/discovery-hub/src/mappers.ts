import type { Application, MarketplaceCorePlatform } from '@ai-pass/marketplace-core';
import { getTrustSummaryForResource } from '@ai-pass/trust-engine';
import type {
  DiscoveryCapability,
  DiscoveryCompliance,
  DiscoveryDeployment,
  DiscoveryModelFamily,
  DiscoveryPricing,
  DiscoveryTaxonomyId,
  Tool,
  ToolProfileExtras,
} from './types.js';
import { TrustScoreService } from './trust-score-service.js';

const FEATURE_MAP: Record<string, string[]> = {
  'invoice-ai': ['Invoice extraction', 'Approval routing', 'Fraud detection', 'ERP sync'],
  'supply-chain-ai': ['Offer parsing', 'Supplier scoring', 'Award decisions', 'Explainability'],
  'customer-support-ai': ['Voice + chat', 'CRM integration', 'Multi-language', 'Escalation'],
  'hr-ai': ['Resume parsing', 'Candidate screening', 'Onboarding automation'],
  'compliance-guard': ['Policy enforcement', 'Risk registry', 'AI governance'],
  'agent-toolkit-oss': ['Reusable skills', 'Workflow templates', 'Open source'],
  'legal-contract-ai': ['Contract review', 'Clause extraction', 'Risk flagging'],
  'marketing-insights-ai': ['Campaign analytics', 'Audience segmentation', 'Content optimization'],
  'vision-qa-inspector': ['Visual inspection', 'Defect detection', 'Manufacturing QA'],
  'sales-ai': ['Email assistant', 'LinkedIn outreach', 'Proposals', 'CRM sync', 'Campaigns', 'Meeting prep'],
  'sales-copilot': ['Lead scoring', 'Email drafts', 'CRM sync'],
  'knowledge-pipeline-pack': ['RAG ingestion', 'Document enrichment', 'Retrieval'],
  'iot-anomaly-detector': ['Sensor streams', 'Edge detection', 'Anomaly alerts'],
};

const CATEGORY_TAXONOMY: Partial<Record<Application['category'], DiscoveryTaxonomyId[]>> = {
  finance: ['business', 'enterprise_ai'],
  supply_chain: ['business', 'enterprise_ai'],
  hr: ['business'],
  customer_support: ['customer_support'],
  marketing: ['marketing'],
  sales: ['sales'],
  legal: ['business'],
  healthcare: ['healthcare'],
  manufacturing: ['business', 'robotics'],
  education: ['education'],
  automation: ['enterprise_ai', 'coding'],
  developer_tools: ['coding', 'data_ai'],
  ai_agents: ['enterprise_ai', 'text_llm'],
  compliance: ['cybersecurity', 'enterprise_ai'],
  analytics: ['data_ai'],
  knowledge: ['data_ai', 'research'],
  voice_ai: ['audio', 'customer_support'],
  vision_ai: ['image'],
  iot: ['robotics', 'data_ai'],
  custom: ['enterprise_ai'],
};

function inferCapabilities(app: Application): DiscoveryCapability[] {
  const caps = new Set<DiscoveryCapability>(['text']);
  if (app.category === 'vision_ai' || app.tags.some((t: string) => /vision|image|ocr/i.test(t))) caps.add('vision');
  if (app.category === 'voice_ai' || app.tags.some((t: string) => /voice|audio|speech/i.test(t))) caps.add('audio');
  if (app.category === 'developer_tools' || app.tags.some((t: string) => /code|dev/i.test(t))) caps.add('code');
  if (caps.size > 2) caps.add('multimodal');
  return Array.from(caps);
}

function inferModels(app: Application): DiscoveryModelFamily[] {
  const families: DiscoveryModelFamily[] = [];
  const joined = app.modelsUsed.join(' ').toLowerCase();
  if (/gpt|openai/.test(joined)) families.push('gpt');
  if (/claude|anthropic/.test(joined)) families.push('claude');
  if (/gemini|google/.test(joined)) families.push('gemini');
  if (/llama|meta/.test(joined)) families.push('llama');
  if (/mistral/.test(joined)) families.push('mistral');
  if (/deepseek/.test(joined)) families.push('deepseek');
  if (/qwen/.test(joined)) families.push('qwen');
  if (!families.length) families.push('other');
  return families;
}

function inferPricing(app: Application): DiscoveryPricing[] {
  switch (app.pricingModel) {
    case 'free':
      return ['free'];
    case 'freemium':
      return ['freemium'];
    case 'subscription':
      return ['subscription'];
    case 'pay_per_use':
      return ['pay_as_you_go'];
    case 'enterprise_license':
      return ['enterprise'];
    default:
      return ['subscription'];
  }
}

function inferDeployment(app: Application): DiscoveryDeployment[] {
  const deps: DiscoveryDeployment[] = ['cloud'];
  if (app.supportedPlatforms.some((p: string) => /api/i.test(p))) deps.push('api');
  if (app.supportedPlatforms.some((p: string) => /docker|local|edge/i.test(p)) || app.openSource) {
    deps.push('docker', 'local');
  }
  if (app.enterpriseReady) deps.push('on_premise');
  return Array.from(new Set(deps));
}

function inferCompliance(app: Application): DiscoveryCompliance[] {
  const list: DiscoveryCompliance[] = [];
  if (app.certified || app.enterpriseReady) list.push('gdpr', 'soc2');
  if (app.enterpriseReady) list.push('iso27001');
  if (app.category === 'healthcare') list.push('hipaa');
  if (app.category === 'compliance') list.push('iso42001');
  return list;
}

function computeLegacyTrustScore(app: Application): number {
  const trust = getTrustSummaryForResource(app.slug) ?? getTrustSummaryForResource(app.id);
  if (trust?.trustScore != null) return trust.trustScore;

  let score = app.rating * 18;
  if (app.certified) score += 12;
  if (app.enterpriseReady) score += 8;
  if (app.reviewCount > 50) score += 5;
  if (app.installCount > 1000) score += 7;
  return Math.min(100, Math.round(score));
}

function estimateCredits(app: Application): number {
  if (app.pricingModel === 'free') return 0;
  if (app.pricePerUse) return Math.ceil(app.pricePerUse * 10);
  if (app.priceMonthly) return Math.ceil(app.priceMonthly / 10);
  return 5;
}

function buildProfile(app: Application, developerName?: string): ToolProfileExtras {
  return {
    capabilities: inferCapabilities(app),
    supportedModels: inferModels(app),
    deployment: inferDeployment(app),
    pricing: inferPricing(app),
    integrations: app.enterpriseReady ? ['slack', 'teams', 'webhook'] : ['webhook'],
    compliance: inferCompliance(app),
    taxonomy: CATEGORY_TAXONOMY[app.category] ?? ['enterprise_ai'],
    subcategories: app.tags.slice(0, 5),
    contextWindow: app.tags.some((t: string) => /rag|knowledge/i.test(t)) ? 128000 : 32000,
    languages: ['en'],
    apiAvailable: true,
    localDeployable: app.openSource || app.supportedPlatforms.some((p: string) => /local|edge/i.test(p)),
    openSource: app.openSource,
    latencyMs: app.enterpriseReady ? 800 : 1100,
    installMethods: app.openSource
      ? ['marketplace', 'github', 'docker', 'api_key']
      : ['marketplace', 'api_key', 'oauth'],
    general: {
      logoUrl: `/discover/logos/${app.slug}.svg`,
      website: undefined,
      developer: developerName ?? app.developerId,
      country: app.enterpriseReady ? 'EU' : undefined,
      launchDate: app.createdAt,
    },
  };
}

export function appToTool(app: Application, platform: MarketplaceCorePlatform): Tool {
  const developer = platform.developers.get(app.developerId);
  const legacyScore = computeLegacyTrustScore(app);
  const profile = buildProfile(app, developer?.name);
  const trustService = new TrustScoreService();
  const trust = trustService.compute({
    trustEngineScore: legacyScore,
    certified: app.certified,
    enterpriseReady: app.enterpriseReady,
    openSource: app.openSource,
    complianceCount: profile.compliance.length,
    rating: app.rating,
    reviewCount: app.reviewCount,
    installCount: app.installCount,
    maintenanceScore: 75,
  });

  const trustBadges: string[] = [trust.label];
  if (app.certified) trustBadges.push('Certified');
  if (app.enterpriseReady) trustBadges.push('Enterprise Ready');
  if (app.openSource) trustBadges.push('Open Source');

  const workspaceRoutes: Record<string, string> = {
    'invoice-ai': '/workspace/apps/invoice-ai',
    'supply-chain-ai': '/workspace/apps/supply-chain',
    'customer-support-ai': '/workspace/apps/customer-support-ai',
    'sales-ai': '/workspace/apps/sales-ai',
    'sales-copilot': '/workspace/apps/sales-ai',
  };

  return {
    id: app.id,
    slug: app.slug,
    name: app.name,
    description: app.description,
    category: app.category,
    tags: app.tags,
    developerId: app.developerId,
    developerName: developer?.name,
    pricingModel: app.pricingModel,
    priceMonthly: app.priceMonthly,
    pricePerUse: app.pricePerUse,
    certified: app.certified,
    enterpriseReady: app.enterpriseReady,
    openSource: app.openSource,
    featured: app.featured,
    trending: app.trending,
    installCount: app.installCount,
    rating: app.rating,
    reviewCount: app.reviewCount,
    trustScore: trust.score,
    trustBadges: Array.from(new Set(trustBadges)),
    creditsRequired: estimateCredits(app),
    estimatedCostPerRun: app.pricePerUse ?? (app.priceMonthly ? app.priceMonthly / 100 : undefined),
    supportedPlatforms: app.supportedPlatforms,
    modelsUsed: app.modelsUsed,
    screenshots: [`/discover/screenshots/${app.slug}-1.png`, `/discover/screenshots/${app.slug}-2.png`],
    features: FEATURE_MAP[app.slug] ?? app.tags,
    membershipTierRequired: app.enterpriseReady ? 'professional' : 'free',
    workspaceRoute: workspaceRoutes[app.slug] ?? `/workspace/marketplace/apps/${app.slug}`,
    storeRoute: `/workspace/store/apps/${app.slug}`,
    presenceAuditRoute: '/workspace/presence',
    profile: { ...profile, trust },
    source: 'marketplace',
  };
}

export function appsToTools(apps: Application[], platform: MarketplaceCorePlatform): Tool[] {
  return apps.map((a) => appToTool(a, platform));
}
