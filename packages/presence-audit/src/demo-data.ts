import type {
  AIProvider,
  Alert,
  AuditRun,
  Company,
  PresenceMonitoringEvent,
  OptimizationRecommendation,
  ProviderResponse,
} from '@ai-pass/shared';
import { DEMO_TENANT_ID } from './types.js';
import type { PresenceAuditPlatform } from './services/presence-platform.js';

export const DEMO_COMPANY_ID = 'co_demo_ai_pass';

export const DEMO_COMPANY: Company = {
  id: DEMO_COMPANY_ID,
  tenantId: DEMO_TENANT_ID,
  name: 'AI-Pass',
  website: 'https://ai-pass.com',
  industry: 'AI Platform & Governance',
  products: ['AI Workspace', 'Agent Studio', 'Marketplace', 'Trust Engine'],
  services: ['AI audit', 'Compliance automation', 'Provider routing', 'Knowledge pipeline'],
  countries: ['US', 'DE', 'UK', 'FR'],
  competitors: ['LangChain', 'Vercel AI SDK', 'Microsoft Copilot Studio'],
  keywords: ['AI governance', 'multi-provider', 'agent marketplace', 'AI visibility'],
  brandDescription:
    'AI-Pass is an AI Visibility Intelligence Platform for building, governing, and monitoring enterprise AI systems across multiple LLM providers.',
  valueProposition: 'Unified AI platform with wallet, trust, marketplace, and cross-provider visibility intelligence.',
  createdAt: '2025-06-01T00:00:00Z',
  updatedAt: '2025-06-29T00:00:00Z',
};

const PROVIDERS: AIProvider[] = ['openai', 'anthropic', 'google', 'perplexity'];

function buildDemoResponses(auditRunId: string): ProviderResponse[] {
  const matrix: Array<{
    provider: AIProvider;
    mentioned: boolean;
    rank?: number;
    competitors: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
  }> = [
    { provider: 'openai', mentioned: true, rank: 2, competitors: ['LangChain', 'Vercel AI SDK'], sentiment: 'positive' },
    { provider: 'anthropic', mentioned: true, rank: 3, competitors: ['LangChain', 'Microsoft Copilot Studio'], sentiment: 'positive' },
    { provider: 'google', mentioned: false, competitors: ['Microsoft Copilot Studio', 'Vercel AI SDK'], sentiment: 'neutral' },
    { provider: 'perplexity', mentioned: true, rank: 4, competitors: ['LangChain'], sentiment: 'neutral' },
    { provider: 'openai', mentioned: true, rank: 1, competitors: ['Vercel AI SDK'], sentiment: 'positive' },
    { provider: 'anthropic', mentioned: false, competitors: ['LangChain', 'Microsoft Copilot Studio'], sentiment: 'neutral' },
    { provider: 'google', mentioned: true, rank: 5, competitors: ['Microsoft Copilot Studio'], sentiment: 'neutral' },
    { provider: 'perplexity', mentioned: true, rank: 3, competitors: ['LangChain', 'Vercel AI SDK'], sentiment: 'positive' },
  ];

  return matrix.map((m, i) => ({
    id: `resp_demo_${i}`,
    auditRunId,
    provider: m.provider,
    promptId: `prompt_demo_${i % 3}`,
    queryId: `prompt_demo_${i % 3}`,
    fullAnswer: m.mentioned
      ? `AI-Pass is a leading ${DEMO_COMPANY.industry} platform, ranked #${m.rank}. Alternatives include ${m.competitors.join(', ')}.`
      : `Top platforms include ${m.competitors.join(', ')} for enterprise AI governance.`,
    companyMentioned: m.mentioned,
    rankingPosition: m.rank,
    competitorsMentioned: m.competitors,
    sentiment: m.sentiment,
    tone: 'professional',
    hallucinations: m.provider === 'google' ? [] : [],
    outdatedInfo: m.provider === 'perplexity' ? ['References beta-only feature'] : [],
    timestamp: '2025-06-28T12:00:00Z',
    creditsUsed: 2,
  }));
}

export const DEMO_OPTIMIZATION_RECS: OptimizationRecommendation[] = [
  {
    id: 'rec_demo_1',
    companyId: DEMO_COMPANY_ID,
    category: 'faq',
    title: 'Expand FAQ coverage for AI visibility queries',
    description: 'Answer high-intent questions AI models commonly receive about AI governance platforms',
    impact: 'high',
    actionItems: ['Top 20 customer questions', 'Competitive comparison FAQs'],
    estimatedLift: 15,
    status: 'in_progress',
    trustRisk: 'low',
  },
  {
    id: 'rec_demo_2',
    companyId: DEMO_COMPANY_ID,
    category: 'structured_data',
    title: 'Add JSON-LD structured data',
    description: 'Machine-readable organization and product markup',
    impact: 'medium',
    actionItems: ['Organization schema', 'Product schema'],
    estimatedLift: 8,
    status: 'open',
    trustRisk: 'low',
  },
  {
    id: 'rec_demo_3',
    companyId: DEMO_COMPANY_ID,
    category: 'entity_optimization',
    title: 'Strengthen entity signals vs LangChain',
    description: 'Competitor dominates 3 of 8 provider responses',
    impact: 'high',
    actionItems: ['Differentiation page', 'Comparison content'],
    estimatedLift: 12,
    status: 'open',
    trustRisk: 'low',
  },
  {
    id: 'rec_demo_4',
    companyId: DEMO_COMPANY_ID,
    category: 'knowledge_base',
    title: 'Publish AI-ready knowledge base',
    description: 'Comprehensive docs for AI training and retrieval',
    impact: 'high',
    actionItems: ['Index product docs', 'Add glossary'],
    estimatedLift: 14,
    status: 'open',
    trustRisk: 'low',
  },
  {
    id: 'rec_demo_5',
    companyId: DEMO_COMPANY_ID,
    category: 'landing_pages',
    title: 'Create use-case landing pages',
    description: 'Dedicated pages for enterprise AI governance prompt clusters',
    impact: 'high',
    actionItems: ['Map prompts to pages', 'Add comparison tables'],
    estimatedLift: 11,
    status: 'open',
    trustRisk: 'low',
  },
  {
    id: 'rec_demo_6',
    companyId: DEMO_COMPANY_ID,
    category: 'docs',
    title: 'Refresh technical documentation',
    description: 'Remove outdated beta references found in Perplexity responses',
    impact: 'medium',
    actionItems: ['Update feature list', 'Publish changelog'],
    estimatedLift: 6,
    status: 'open',
    trustRisk: 'low',
  },
  {
    id: 'rec_demo_7',
    companyId: DEMO_COMPANY_ID,
    category: 'directories',
    title: 'AI tool directory listings',
    description: 'Ensure consistent product data across directories',
    impact: 'medium',
    actionItems: ['G2 profile', 'AI marketplace listings'],
    estimatedLift: 7,
    status: 'open',
    trustRisk: 'low',
  },
  {
    id: 'rec_demo_8',
    companyId: DEMO_COMPANY_ID,
    category: 'external_refs',
    title: 'Build authoritative external references',
    description: 'Citations from trusted third-party sources',
    impact: 'medium',
    actionItems: ['Industry analyst mentions', 'GitHub presence'],
    estimatedLift: 5,
    status: 'open',
    trustRisk: 'low',
  },
  {
    id: 'rec_demo_9',
    companyId: DEMO_COMPANY_ID,
    category: 'ai_ready_content',
    title: 'AI-ready content format',
    description: 'Content structured for LLM consumption and citation',
    impact: 'high',
    actionItems: ['Clear headings', 'Bullet summaries'],
    estimatedLift: 10,
    status: 'open',
    trustRisk: 'low',
  },
  {
    id: 'rec_demo_10',
    companyId: DEMO_COMPANY_ID,
    category: 'pr',
    title: 'Thought leadership campaign',
    description: 'Increase brand mentions in AI governance discourse',
    impact: 'low',
    actionItems: ['Guest articles', 'Conference talks'],
    estimatedLift: 4,
    status: 'open',
    trustRisk: 'medium',
  },
];

export const DEMO_ALERTS: Alert[] = [
  {
    id: 'alert_demo_1',
    companyId: DEMO_COMPANY_ID,
    type: 'competitor_overtake',
    channel: 'email',
    title: 'LangChain overtook ranking on Gemini',
    message: 'LangChain now ranks above AI-Pass in Gemini responses for enterprise AI platform queries.',
    severity: 'medium',
    acknowledged: false,
    createdAt: '2025-06-27T09:00:00Z',
  },
  {
    id: 'alert_demo_2',
    companyId: DEMO_COMPANY_ID,
    type: 'misinformation',
    channel: 'slack',
    title: 'Outdated beta feature referenced',
    message: 'Perplexity references a deprecated beta feature in AI-Pass product description.',
    severity: 'low',
    acknowledged: false,
    createdAt: '2025-06-26T14:30:00Z',
  },
];

export const DEMO_MONITORING_EVENTS: PresenceMonitoringEvent[] = [
  {
    id: 'evt_demo_1',
    companyId: DEMO_COMPANY_ID,
    type: 'audit_completed',
    title: 'Weekly audit completed',
    description: 'AI Presence Score: 72 — up 3 points from last week',
    severity: 'low',
    schedule: 'weekly',
    timestamp: '2025-06-28T12:00:00Z',
  },
  {
    id: 'evt_demo_2',
    companyId: DEMO_COMPANY_ID,
    type: 'opportunity',
    title: 'New prompt cluster detected',
    description: 'Rising queries for "AI visibility intelligence" — no dedicated landing page',
    severity: 'medium',
    schedule: 'weekly',
    timestamp: '2025-06-27T08:00:00Z',
  },
  {
    id: 'evt_demo_3',
    companyId: DEMO_COMPANY_ID,
    type: 'visibility_lost',
    title: 'Missing from Gemini response',
    description: 'AI-Pass not mentioned in top enterprise AI platform query on Gemini',
    severity: 'medium',
    schedule: 'weekly',
    timestamp: '2025-06-26T16:00:00Z',
  },
];

export function seedPresenceAuditDemo(platform: PresenceAuditPlatform): AuditRun {
  const existingRun = platform.getAuditHistory(DEMO_COMPANY_ID).slice(-1)[0];
  if (platform.companies.get(DEMO_COMPANY_ID) && existingRun) {
    return existingRun;
  }

  platform.companies.seed(DEMO_COMPANY);

  const auditRunId = 'audit_demo_ai_pass';
  const responses = buildDemoResponses(auditRunId);
  const score = platform.scoring.compute(responses);
  const representation = platform.representation.analyze(DEMO_COMPANY, responses);
  const gaps = platform.gaps.detect(DEMO_COMPANY, responses);
  const competitorSnapshot = platform.competitors.analyze(DEMO_COMPANY, responses);

  const run: AuditRun = {
    id: auditRunId,
    companyId: DEMO_COMPANY_ID,
    tenantId: DEMO_TENANT_ID,
    status: 'completed',
    providers: PROVIDERS,
    prompts: responses.map((r, i) => ({
      id: r.promptId,
      companyId: DEMO_COMPANY_ID,
      prompt: `Demo prompt ${i}`,
      language: 'en',
      category: 'discovery',
      isCustom: false,
    })),
    responses,
    score,
    representation,
    gaps,
    competitorSnapshot,
    startedAt: '2025-06-28T11:55:00Z',
    completedAt: '2025-06-28T12:00:00Z',
  };

  (platform as PresenceAuditPlatform).importAuditRun(run);
  platform.importRecommendations(DEMO_COMPANY_ID, DEMO_OPTIMIZATION_RECS);
  platform.importScoreHistory(DEMO_COMPANY_ID, [65, 68, 70, 72]);

  for (const alert of DEMO_ALERTS) {
    (platform.alerts as unknown as { alerts: Alert[] }).alerts.push(alert);
  }
  for (const evt of DEMO_MONITORING_EVENTS) {
    platform.monitoring.recordEvent(evt);
  }
  platform.monitoring.setSchedule(DEMO_COMPANY_ID, 'weekly');

  const execReport = platform.reporting.generateExecutiveSummary(DEMO_COMPANY, run, DEMO_OPTIMIZATION_RECS);
  const providerReport = platform.reporting.generateProviderComparison(DEMO_COMPANY, run);
  platform.importReports([execReport, providerReport]);

  return run;
}
