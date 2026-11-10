import {
  defaultGlobalSearchService,
  defaultModuleRegistry,
  defaultOrganizationService,
  defaultWorkspaceService,
  ok,
  API_VERSION,
  type ApiResponse,
} from '@ai-pass/platform-core';
import {
  PLATFORM_API_ROUTES,
  type LoginRequest,
  type LoginResponse,
  type WorkspaceSummaryResponse,
  type ProviderListItem,
  type ProviderRouteRequest,
  type ProviderRouteResponse,
  type WalletBalanceResponse,
  type MarketplaceAppItem,
  type AgentListItem,
  type WorkflowListItem,
  type KnowledgeCollection,
  type TrustScoreResponse,
  type CompliancePolicyItem,
} from './types.js';

/** Stub handlers — wire to real services in production */

export function handleHealth() {
  return ok({ status: 'ok', version: API_VERSION, uptime: 0, modules: defaultModuleRegistry.list().length });
}

export function handleModules() {
  return ok({
    modules: defaultModuleRegistry.list().map((m) => ({
      id: m.id,
      name: m.name,
      route: m.route,
      status: m.status,
      tier: m.tier,
    })),
  });
}

export function handleLogin(body: LoginRequest): ApiResponse<LoginResponse> {
  return ok({
    session: {
      userId: 'demo-user',
      tenantId: 'tenant_acme',
      email: body.email,
      roles: ['admin'],
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
    token: 'demo_token_stub',
  });
}

export interface WorkspaceSummaryContext {
  userId: string;
  userName?: string;
  tenantId?: string;
  credits?: {
    remaining: number;
    used: number;
    total: number;
    daysLeft: number;
    spendUsd: number;
    budgetUsd: number;
  };
}

export function handleWorkspaceSummary(context: WorkspaceSummaryContext): ApiResponse<WorkspaceSummaryResponse> {
  const dash = defaultWorkspaceService.getDashboard(context.tenantId, context.userId, {
    userName: context.userName,
    credits: context.credits,
  });
  return ok({
    tenantId: context.tenantId ?? `tenant_${context.userId}`,
    userId: context.userId,
    userName: context.userName,
    recentTaskCount: dash.recentTasks.length,
    runningWorkflowCount: dash.runningWorkflows.length,
    pendingApprovalCount: dash.approvals.length,
    creditsRemaining: dash.credits.remaining,
    dashboard: dash,
  });
}

export function handleWorkspaceSummaryLegacy(): ApiResponse<WorkspaceSummaryResponse> {
  return handleWorkspaceSummary({ userId: 'anonymous' });
}

export function handleSearch(query: string) {
  return ok({ results: defaultGlobalSearchService.search({ query, limit: 20 }) });
}

export function handleProviders(): ApiResponse<{ providers: ProviderListItem[] }> {
  return ok({
    providers: [
      { id: 'openai', name: 'OpenAI', status: 'healthy', modelCount: 8 },
      { id: 'anthropic', name: 'Anthropic', status: 'healthy', modelCount: 6 },
      { id: 'google', name: 'Google', status: 'healthy', modelCount: 4 },
      { id: 'mistral', name: 'Mistral', status: 'degraded', modelCount: 3 },
    ],
  });
}

export function handleProviderRoute(body: ProviderRouteRequest): ApiResponse<ProviderRouteResponse> {
  return ok({
    modelId: body.preferredModelId ?? 'claude-sonnet-4',
    providerId: 'anthropic',
    reason: `Routed by ${body.criteria ?? 'balanced'} criteria with membership gate`,
    estimatedLatencyMs: 650,
  });
}

export function handleWalletBalance(credits: {
  remaining: number;
  used: number;
  total: number;
  spendUsd: number;
  budgetUsd: number;
}): ApiResponse<WalletBalanceResponse> {
  return ok({
    creditsRemaining: credits.remaining,
    creditsUsed: credits.used,
    creditsTotal: credits.total,
    spendUsd: credits.spendUsd,
    budgetUsd: credits.budgetUsd,
  });
}

export function handleMarketplaceApps(): ApiResponse<{ apps: MarketplaceAppItem[] }> {
  return ok({
    apps: [
      { id: 'invoice-ai', slug: 'invoice-ai', name: 'Invoice AI', description: 'Finance automation', category: 'finance', installed: true, route: '/workspace/apps/invoice-ai' },
      { id: 'supply-chain', slug: 'supply-chain', name: 'Supply Chain AI', description: 'Procurement evaluation', category: 'supply_chain', installed: true, route: '/workspace/apps/supply-chain' },
      { id: 'customer-support', slug: 'customer-support-ai', name: 'Customer Support AI', description: 'Multi-language support', category: 'customer_support', installed: true, route: '/workspace/apps/customer-support-ai' },
      { id: 'sales-ai', slug: 'sales-ai', name: 'Sales AI', description: 'Revenue operating system', category: 'sales', installed: true, route: '/workspace/apps/sales-ai' },
      { id: 'hr-ai', slug: 'hr-ai', name: 'HR AI', description: 'Onboarding automation', category: 'hr', installed: false, route: '/workspace/marketplace' },
    ],
  });
}

export function handleAgents(): ApiResponse<{ agents: AgentListItem[] }> {
  return ok({
    agents: defaultWorkspaceService.getDashboard().recentAgents.map((a) => ({
      id: a.id,
      name: a.name,
      status: a.status,
      lastRunAt: a.lastRun,
    })),
  });
}

export function handleWorkflows(): ApiResponse<{ workflows: WorkflowListItem[] }> {
  return ok({
    workflows: defaultWorkspaceService.getDashboard().runningWorkflows.map((w) => ({
      id: w.id,
      name: w.name,
      status: w.status,
      stepCount: w.stepsTotal,
    })),
  });
}

export function handleKnowledgeCollections(): ApiResponse<{ collections: KnowledgeCollection[] }> {
  return ok({
    collections: [
      { id: 'kb_q4', name: 'Q4 Financial Reports', documentCount: 142, lastSyncedAt: '2026-06-28T10:00:00Z' },
      { id: 'kb_policies', name: 'Compliance Policies', documentCount: 38, lastSyncedAt: '2026-06-27T15:30:00Z' },
    ],
  });
}

export function handleTrustScore(): ApiResponse<TrustScoreResponse> {
  return ok({
    overallScore: 87,
    dimensions: [
      { name: 'Data handling', score: 92 },
      { name: 'Model governance', score: 85 },
      { name: 'Audit coverage', score: 88 },
      { name: 'Access control', score: 84 },
    ],
  });
}

export function handleCompliancePolicies(): ApiResponse<{ policies: CompliancePolicyItem[] }> {
  return ok({
    policies: [
      { id: 'pol_1', name: 'High-cost model approval', status: 'active', riskLevel: 'high' },
      { id: 'pol_2', name: 'External data export', status: 'active', riskLevel: 'medium' },
      { id: 'pol_3', name: 'PII handling', status: 'active', riskLevel: 'high' },
    ],
  });
}

export function handleOrganization() {
  const org = defaultOrganizationService.getOrganization('org_acme');
  return ok({ organization: org });
}

export { PLATFORM_API_ROUTES };
