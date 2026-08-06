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
    trustScore,
    trustBadges: badges,
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
  };
}

export function appsToTools(apps: Application[], platform: MarketplaceCorePlatform): Tool[] {
  return apps.map((a) => appToTool(a, platform));
}
