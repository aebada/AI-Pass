import type { Application, MarketplaceCorePlatform } from '@ai-pass/marketplace-core';
import { getTrustSummaryForResource } from '@ai-pass/trust-engine';
import type { Tool } from './types.js';

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

function computeTrustScore(app: Application): number {
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

function pricingLabel(app: Application): string {
  if (app.pricingModel === 'free') return app.openSource ? 'Free / Open Source' : 'Free';
  if (app.pricingModel === 'enterprise_license') return 'Enterprise license';
  if (app.pricingModel === 'freemium') return 'Freemium';
  if (app.priceMonthly != null) return `$${app.priceMonthly}/mo`;
  if (app.pricePerUse != null) return `$${app.pricePerUse}/use`;
  return app.pricingModel.replace(/_/g, ' ');
}

function inferProvider(app: Application, developerName?: string): string {
  const modelHint = (app.modelsUsed[0] ?? '').toLowerCase();
  if (modelHint.includes('gpt') || modelHint.includes('openai')) return 'OpenAI';
  if (modelHint.includes('claude') || modelHint.includes('anthropic')) return 'Anthropic';
  if (modelHint.includes('gemini')) return 'Google';
  if (modelHint.includes('llama') || modelHint.includes('ollama')) return 'Local / Ollama';
  if (modelHint.includes('mistral')) return 'Mistral';
  if (modelHint.includes('deepseek')) return 'DeepSeek';
  return developerName ?? 'AI-Pass Hosted';
}

function complianceFor(app: Application): string[] {
  const frameworks: string[] = [];
  if (app.enterpriseReady || app.certified) {
    frameworks.push('ISO 42001', 'ISO 27001', 'GDPR');
  }
  if (app.certified) frameworks.push('SOC 2');
  if (app.category === 'compliance' || app.riskLevel === 'high' || app.riskLevel === 'critical') {
    frameworks.push('NIS2');
  }
  if (app.enterpriseReady) frameworks.push('Enterprise Ready');
  return [...new Set(frameworks)];
}

function benchmarksFor(app: Application, trustScore: number): { name: string; score: number; unit?: string }[] {
  const quality = Math.min(100, Math.round(app.rating * 20));
  return [
    { name: 'Quality', score: quality, unit: '/100' },
    { name: 'Trust', score: trustScore, unit: '/100' },
    { name: 'Adoption', score: Math.min(100, Math.round(Math.log10(Math.max(app.installCount, 1)) * 25)), unit: '/100' },
    { name: 'Risk posture', score: app.riskLevel === 'critical' ? 40 : app.riskLevel === 'high' ? 55 : app.riskLevel === 'medium' ? 75 : 90, unit: '/100' },
  ];
}

export function appToTool(app: Application, platform: MarketplaceCorePlatform): Tool {
  const developer = platform.developers.get(app.developerId);
  const trustScore = computeTrustScore(app);
  const badges: string[] = [];
  if (app.certified) badges.push('Certified');
  if (app.enterpriseReady) badges.push('Enterprise Ready');
  if (app.openSource) badges.push('Open Source');
  if (trustScore >= 90) badges.push('Trust Elite');

  const workspaceRoutes: Record<string, string> = {
    'invoice-ai': '/workspace/apps/invoice-ai',
    'supply-chain-ai': '/workspace/apps/supply-chain',
    'customer-support-ai': '/workspace/apps/customer-support-ai',
    'sales-ai': '/workspace/apps/sales-ai',
    'sales-copilot': '/workspace/apps/sales-ai',
  };

  const storeRoute = `/workspace/store/apps/${app.slug}`;
  const workspaceRoute = workspaceRoutes[app.slug] ?? `/workspace/marketplace/apps/${app.slug}`;
  const latencyBase = app.appType === 'hosted_saas' ? 420 : app.appType === 'agent_pack' ? 680 : 520;
  const latencyMs = latencyBase + Math.round((100 - trustScore) * 2.2);

  return {
    id: app.id,
    slug: app.slug,
    name: app.name,
    description: app.description,
    category: app.category,
    tags: app.tags,
    developerId: app.developerId,
    developerName: developer?.name,
    logoUrl: `/discover/logos/${app.slug}.svg`,
    provider: inferProvider(app, developer?.name),
    pricingModel: app.pricingModel,
    priceMonthly: app.priceMonthly,
    pricePerUse: app.pricePerUse,
    pricingLabel: pricingLabel(app),
    apiAvailable: app.permissions.includes('api') || app.category === 'developer_tools' || app.appType === 'hosted_saas',
    apiDocsUrl: `/developers#${app.slug}`,
    certified: app.certified,
    enterpriseReady: app.enterpriseReady,
    openSource: app.openSource,
    featured: app.featured,
    trending: app.trending,
    installCount: app.installCount,
    rating: app.rating,
    reviewCount: app.reviewCount,
    trustScore,
    trustBadges: badges,
    latencyMs,
    complianceFrameworks: complianceFor(app),
    benchmarks: benchmarksFor(app, trustScore),
    integrations: app.supportedPlatforms.length > 0 ? app.supportedPlatforms : ['AI-Pass Workspace', 'Webhook'],
    creditsRequired: estimateCredits(app),
    estimatedCostPerRun: app.pricePerUse ?? (app.priceMonthly ? app.priceMonthly / 100 : undefined),
    supportedPlatforms: app.supportedPlatforms,
    modelsUsed: app.modelsUsed,
    screenshots: [`/discover/screenshots/${app.slug}-1.png`, `/discover/screenshots/${app.slug}-2.png`],
    features: FEATURE_MAP[app.slug] ?? app.tags,
    membershipTierRequired: app.enterpriseReady ? 'professional' : 'free',
    workspaceRoute,
    storeRoute,
    connectRoute: `/workspace/store/apps/${app.slug}?connect=1`,
    presenceAuditRoute: '/workspace/presence',
    appType: app.appType,
  };
}

export function appsToTools(apps: Application[], platform: MarketplaceCorePlatform): Tool[] {
  return apps.map((a) => appToTool(a, platform));
}
