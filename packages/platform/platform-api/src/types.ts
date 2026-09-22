/** OpenAPI-style route types for the AI Pass Platform API */

import type { ApiResponse, PaginatedResponse } from '@ai-pass/platform-core';

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthSession {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  session: AuthSession;
  token: string;
}

// ── Workspace ────────────────────────────────────────────────────────────────

export interface WorkspaceSummaryResponse {
  tenantId: string;
  userId?: string;
  userName?: string;
  recentTaskCount: number;
  runningWorkflowCount: number;
  pendingApprovalCount: number;
  creditsRemaining: number;
  dashboard?: import('@ai-pass/platform-core').WorkspaceDashboardData;
}

// ── Providers ─────────────────────────────────────────────────────────────────

export interface ProviderListItem {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  modelCount: number;
}

export interface ProviderRouteRequest {
  taskType: string;
  preferredModelId?: string;
  criteria?: 'cost' | 'latency' | 'quality' | 'balanced';
}

export interface ProviderRouteResponse {
  modelId: string;
  providerId: string;
  reason: string;
  estimatedLatencyMs: number;
}

// ── Wallet ─────────────────────────────────────────────────────────────────────

export interface WalletBalanceResponse {
  creditsRemaining: number;
  creditsUsed: number;
  creditsTotal: number;
  spendUsd: number;
  budgetUsd: number;
}

export interface WalletUsageRecord {
  id: string;
  provider: string;
  model: string;
  credits: number;
  costUsd: number;
  module: string;
  timestamp: string;
}

// ── Marketplace ────────────────────────────────────────────────────────────────

export interface MarketplaceAppItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  installed: boolean;
  route: string;
}

// ── Agents ───────────────────────────────────────────────────────────────────

export interface AgentListItem {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'error';
  lastRunAt?: string;
}

export interface AgentRunRequest {
  agentId: string;
  input: Record<string, unknown>;
}

// ── Workflows ──────────────────────────────────────────────────────────────────

export interface WorkflowListItem {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  stepCount: number;
}

export interface WorkflowRunRequest {
  workflowId: string;
  input?: Record<string, unknown>;
}

// ── Knowledge ──────────────────────────────────────────────────────────────────

export interface KnowledgeCollection {
  id: string;
  name: string;
  documentCount: number;
  lastSyncedAt?: string;
}

// ── Trust & Compliance ─────────────────────────────────────────────────────────

export interface TrustScoreResponse {
  overallScore: number;
  dimensions: Array<{ name: string; score: number }>;
}

export interface CompliancePolicyItem {
  id: string;
  name: string;
  status: 'active' | 'draft' | 'archived';
  riskLevel: 'low' | 'medium' | 'high';
}

// ── Route registry ─────────────────────────────────────────────────────────────

export interface ApiRouteDef {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  tag: string;
  auth?: boolean;
}

export const PLATFORM_API_ROUTES: ApiRouteDef[] = [
  { method: 'GET', path: '/api/v1/health', summary: 'Health check', tag: 'system' },
  { method: 'GET', path: '/api/v1/modules', summary: 'List registered modules', tag: 'system' },
  { method: 'POST', path: '/api/v1/auth/login', summary: 'Authenticate user', tag: 'auth', auth: false },
  { method: 'POST', path: '/api/v1/auth/logout', summary: 'End session', tag: 'auth' },
  { method: 'GET', path: '/api/v1/auth/session', summary: 'Current session', tag: 'auth' },
  { method: 'GET', path: '/api/v1/workspace/summary', summary: 'Workspace dashboard summary', tag: 'workspace' },
  { method: 'GET', path: '/api/v1/workspace/tasks', summary: 'Recent tasks', tag: 'workspace' },
  { method: 'GET', path: '/api/v1/workspace/activity', summary: 'Activity feed', tag: 'workspace' },
  { method: 'GET', path: '/api/v1/search', summary: 'Global semantic search', tag: 'search' },
  { method: 'GET', path: '/api/v1/providers', summary: 'List AI providers', tag: 'providers' },
  { method: 'POST', path: '/api/v1/providers/route', summary: 'Route request to optimal model', tag: 'providers' },
  { method: 'GET', path: '/api/v1/wallet/balance', summary: 'Wallet balance', tag: 'wallet' },
  { method: 'GET', path: '/api/v1/wallet/usage', summary: 'Usage history', tag: 'wallet' },
  { method: 'GET', path: '/api/v1/marketplace/apps', summary: 'Browse marketplace apps', tag: 'marketplace' },
  { method: 'POST', path: '/api/v1/marketplace/install', summary: 'Install marketplace app', tag: 'marketplace' },
  { method: 'GET', path: '/api/v1/agents', summary: 'List agents', tag: 'agents' },
  { method: 'POST', path: '/api/v1/agents/run', summary: 'Run an agent', tag: 'agents' },
  { method: 'GET', path: '/api/v1/workflows', summary: 'List workflows', tag: 'workflows' },
  { method: 'POST', path: '/api/v1/workflows/run', summary: 'Execute workflow', tag: 'workflows' },
  { method: 'GET', path: '/api/v1/knowledge/collections', summary: 'List knowledge collections', tag: 'knowledge' },
  { method: 'POST', path: '/api/v1/knowledge/ingest', summary: 'Ingest documents', tag: 'knowledge' },
  { method: 'GET', path: '/api/v1/trust/score', summary: 'Trust score overview', tag: 'trust' },
  { method: 'POST', path: '/api/v1/trust/validate', summary: 'Run trust validation', tag: 'trust' },
  { method: 'POST', path: '/api/v1/trust/certify', summary: 'Issue certification', tag: 'trust' },
  { method: 'GET', path: '/api/v1/trust/systems', summary: 'List AI systems', tag: 'trust' },
  { method: 'GET', path: '/api/v1/trust/reports', summary: 'List trust reports', tag: 'trust' },
  { method: 'GET', path: '/api/v1/trust/verification/:id', summary: 'Public verification lookup', tag: 'trust', auth: false },
  { method: 'GET', path: '/api/v1/trust/monitoring', summary: 'Monitoring events', tag: 'trust' },
  { method: 'GET', path: '/api/v1/trust/dashboard', summary: 'Trust dashboard', tag: 'trust' },
  { method: 'POST', path: '/api/v1/trust/testsuite', summary: 'Register test suite', tag: 'trust' },
  { method: 'GET', path: '/api/v1/compliance/policies', summary: 'List compliance policies', tag: 'compliance' },
  { method: 'GET', path: '/api/governance/dashboard', summary: 'Governance dashboard', tag: 'governance' },
  { method: 'GET', path: '/api/governance/ai-systems', summary: 'List AI systems', tag: 'governance' },
  { method: 'POST', path: '/api/governance/ai-systems', summary: 'Register AI system', tag: 'governance' },
  { method: 'GET', path: '/api/governance/policy/policies', summary: 'List governance policies', tag: 'governance' },
  { method: 'POST', path: '/api/governance/policy/policies', summary: 'Create governance policy', tag: 'governance' },
  { method: 'GET', path: '/api/governance/risk/risks', summary: 'List risks', tag: 'governance' },
  { method: 'GET', path: '/api/governance/approve', summary: 'List approvals', tag: 'governance' },
  { method: 'POST', path: '/api/governance/approve', summary: 'Process approval', tag: 'governance' },
  { method: 'GET', path: '/api/governance/monitor', summary: 'Monitoring alerts', tag: 'governance' },
  { method: 'POST', path: '/api/governance/monitor', summary: 'Record monitoring event', tag: 'governance' },
  { method: 'GET', path: '/api/governance/reports', summary: 'Governance reports', tag: 'governance' },
  { method: 'GET', path: '/api/v1/org', summary: 'Organization details', tag: 'organization' },
  { method: 'GET', path: '/api/v1/org/departments', summary: 'List departments', tag: 'organization' },
];

export type {
  ApiResponse,
  PaginatedResponse,
};
