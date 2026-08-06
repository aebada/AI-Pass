/** Demo dashboard data — static export compatible, no server APIs */

export type RunStatus = 'running' | 'done' | 'queued' | 'failed';
export type AuditStatus = 'executed' | 'approved' | 'rejected' | 'blocked' | 'retried';
export type ChartRange = '24h' | '7D' | '30D';

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: string;
  iconBg: string;
}

export interface PendingApproval {
  id: string;
  title: string;
  amount?: string;
  agent: string;
  policy: string;
  timeAgo: string;
}

export interface AgentRun {
  id: string;
  task: string;
  agent: string;
  status: RunStatus;
  timeAgo: string;
}

export interface AgentCard {
  id: string;
  name: string;
  category: string;
  llm: string;
  runs: number;
  successRate: number;
  credits: number;
  icon: string;
  iconBg: string;
}

export interface LlmSpend {
  provider: string;
  amount: number;
  percent: number;
  highlight?: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  entity: string;
  status: AuditStatus;
  detail: string;
  ok: boolean;
}

export interface ChartPoint {
  label: string;
  agentRuns: number;
  governanceChecks: number;
}

export const KPI_METRICS: KpiMetric[] = [
  {
    id: 'active-runs',
    label: 'Active Runs',
    value: '0',
    delta: '↑ 12.4% vs last week',
    deltaPositive: true,
    icon: 'play',
    iconBg: '#3b82f6',
  },
  {
    id: 'success-rate',
    label: 'Success Rate',
    value: '98.6%',
    delta: '↑ 0.8% governance passed',
    deltaPositive: true,
    icon: 'check',
    iconBg: '#22c55e',
  },
  {
    id: 'approvals',
    label: 'Approvals Queued',
    value: '7',
    delta: '↓ 2 awaiting review',
    deltaPositive: false,
    icon: 'activity',
    iconBg: '#d97706',
  },
  {
    id: 'credits',
    label: 'Credits Used',
    value: '$2,140',
    delta: '68% of monthly budget',
    deltaPositive: true,
    icon: 'credit-card',
    iconBg: '#8b5cf6',
  },
];

export const SEED_APPROVALS: PendingApproval[] = [
  {
    id: 'apr-1',
    title: 'Vendor payment — Acme Logistics',
    amount: '$12,400',
    agent: 'Finance Agent',
    policy: 'Policy: > $10K threshold',
    timeAgo: '14m ago',
  },
  {
    id: 'apr-2',
    title: 'Employee offboarding — John Doe',
    agent: 'HR Agent',
    policy: 'G-ACT 043 queued · Policy: passed',
    timeAgo: '2h ago',
  },
  {
    id: 'apr-3',
    title: 'Contract renewal — NDA',
    amount: '$4,200',
    agent: 'Contract Agent',
    policy: 'Policy: legal review required',
    timeAgo: '3h ago',
  },
];

export const SEED_RUNS: AgentRun[] = [
  { id: 'run-1', task: 'Reconcile Q2 vendor payments', agent: 'Finance Agent', status: 'running', timeAgo: '2m ago' },
  { id: 'run-2', task: 'New hire onboarding — M. Park', agent: 'HR Agent', status: 'done', timeAgo: '8m ago' },
  { id: 'run-3', task: 'Support ticket triage (batch #4)', agent: 'Support Agent', status: 'done', timeAgo: '25m ago' },
  { id: 'run-4', task: 'Contract routing — Q2 MSA', agent: 'Contract Agent', status: 'queued', timeAgo: '1h ago' },
  { id: 'run-5', task: 'Inventory sync — Northward', agent: 'Supply Agent', status: 'failed', timeAgo: '2h ago' },
  { id: 'run-6', task: 'Knowledge base re-index', agent: 'Knowledge Agent', status: 'done', timeAgo: '3h ago' },
];

export const AGENT_CARDS: AgentCard[] = [
  { id: 'ag-1', name: 'Finance Agent', category: 'Finance Ops', llm: 'Claude', runs: 370, successRate: 98.4, credits: 880, icon: 'F', iconBg: '#3b82f6' },
  { id: 'ag-2', name: 'HR Agent', category: 'People Ops', llm: 'OpenAI', runs: 214, successRate: 97.1, credits: 520, icon: 'H', iconBg: '#22c55e' },
  { id: 'ag-3', name: 'Support Agent', category: 'Customer CX', llm: 'Gemini', runs: 892, successRate: 96.8, credits: 640, icon: 'S', iconBg: '#06b6d4' },
  { id: 'ag-4', name: 'Contract Agent', category: 'Legal Ops', llm: 'Claude', runs: 156, successRate: 99.2, credits: 310, icon: 'C', iconBg: '#8b5cf6' },
  { id: 'ag-5', name: 'Supply Agent', category: 'Supply Chain', llm: 'Mistral', runs: 428, successRate: 95.6, credits: 420, icon: 'S', iconBg: '#f59e0b' },
  { id: 'ag-6', name: 'Knowledge Agent', category: 'Knowledge Mgmt', llm: 'Private LLM', runs: 267, successRate: 98.9, credits: 180, icon: 'K', iconBg: '#64748b' },
];

export const LLM_SPEND: LlmSpend[] = [
  { provider: 'Claude', amount: 890, percent: 42 },
  { provider: 'OpenAI', amount: 750, percent: 34, highlight: true },
  { provider: 'Gemini', amount: 430, percent: 20 },
  { provider: 'Mistral', amount: 140, percent: 7 },
  { provider: 'Private LLM', amount: 60, percent: 4 },
];

export const AUDIT_LOG: AuditEntry[] = [
  { id: 'aud-1', timestamp: '14:18:32', entity: 'Finance Agent', status: 'executed', detail: 'ERP sync completed for vendor Acme Logistics — 3 records updated', ok: true },
  { id: 'aud-2', timestamp: '14:12:08', entity: 'Jordan Lee', status: 'approved', detail: 'Approved vendor payment $12,400 — policy threshold met', ok: true },
  { id: 'aud-3', timestamp: '13:55:41', entity: 'Governance Engine', status: 'blocked', detail: 'PII detected in support ticket export — masking required', ok: false },
  { id: 'aud-4', timestamp: '13:40:17', entity: 'HR Agent', status: 'executed', detail: 'Offboarding checklist generated for John Doe', ok: true },
  { id: 'aud-5', timestamp: '13:22:03', entity: 'Contract Agent', status: 'retried', detail: 'NDA routing failed — retrying with fallback approver', ok: true },
  { id: 'aud-6', timestamp: '12:58:49', entity: 'Jordan Lee', status: 'rejected', detail: 'Rejected bulk data export — insufficient justification', ok: false },
  { id: 'aud-7', timestamp: '12:31:12', entity: 'Supply Agent', status: 'executed', detail: 'Inventory sync Northward — 142 SKUs reconciled', ok: true },
  { id: 'aud-8', timestamp: '11:47:55', entity: 'Knowledge Agent', status: 'executed', detail: 'Indexed 28 new documents from SharePoint connector', ok: true },
];

export const CHART_DATA: Record<ChartRange, ChartPoint[]> = {
  '24h': [
    { label: '00', agentRuns: 4, governanceChecks: 2 },
    { label: '04', agentRuns: 2, governanceChecks: 1 },
    { label: '08', agentRuns: 12, governanceChecks: 8 },
    { label: '12', agentRuns: 18, governanceChecks: 14 },
    { label: '16', agentRuns: 22, governanceChecks: 16 },
    { label: '20', agentRuns: 15, governanceChecks: 11 },
    { label: 'Now', agentRuns: 8, governanceChecks: 5 },
  ],
  '7D': [
    { label: 'Mon', agentRuns: 22, governanceChecks: 14 },
    { label: 'Tue', agentRuns: 28, governanceChecks: 18 },
    { label: 'Wed', agentRuns: 35, governanceChecks: 22 },
    { label: 'Thu', agentRuns: 30, governanceChecks: 20 },
    { label: 'Fri', agentRuns: 26, governanceChecks: 17 },
    { label: 'Sat', agentRuns: 14, governanceChecks: 10 },
    { label: 'Sun', agentRuns: 20, governanceChecks: 16 },
  ],
  '30D': [
    { label: 'W1', agentRuns: 95, governanceChecks: 62 },
    { label: 'W2', agentRuns: 112, governanceChecks: 74 },
    { label: 'W3', agentRuns: 128, governanceChecks: 85 },
    { label: 'W4', agentRuns: 105, governanceChecks: 70 },
  ],
};

export function chartSummary(range: ChartRange): { runs: number; checks: number; max: number } {
  const points = CHART_DATA[range];
  const runs = points.reduce((s, p) => s + p.agentRuns, 0);
  const checks = points.reduce((s, p) => s + p.governanceChecks, 0);
  const max = Math.max(...points.map((p) => Math.max(p.agentRuns, p.governanceChecks)));
  return { runs, checks, max };
}

export const WALLET = {
  spent: 2140,
  budget: 3150,
  daysLeft: 18,
};
