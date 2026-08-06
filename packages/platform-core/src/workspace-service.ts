/** WorkspaceService — dashboard data for the AI OS home */

export interface WorkspaceTask {
  id: string;
  title: string;
  module: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  updatedAt: string;
  route?: string;
}

export interface WorkspaceAgentSummary {
  id: string;
  name: string;
  status: 'idle' | 'running' | 'error';
  lastRun?: string;
  route: string;
}

export interface WorkspaceWorkflowSummary {
  id: string;
  name: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  stepsCompleted: number;
  stepsTotal: number;
  route: string;
}

export interface WorkspaceCreditsSummary {
  remaining: number;
  used: number;
  total: number;
  daysLeft: number;
  spendUsd: number;
  budgetUsd: number;
}

export interface WorkspaceNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'approval';
  route?: string;
}

export interface WorkspaceActivityItem {
  id: string;
  action: string;
  actor: string;
  module: string;
  timestamp: string;
}

export interface WorkspaceApproval {
  id: string;
  title: string;
  requester: string;
  module: string;
  risk: 'low' | 'medium' | 'high';
  createdAt: string;
}

export interface WorkspaceInsight {
  id: string;
  title: string;
  description: string;
  metric?: string;
  trend?: 'up' | 'down' | 'flat';
}

export interface WorkspaceRecommendation {
  id: string;
  title: string;
  description: string;
  route: string;
  icon: string;
}

export interface WorkspaceQuickAction {
  id: string;
  label: string;
  icon: string;
  route: string;
}

export interface WorkspaceDashboardData {
  recentTasks: WorkspaceTask[];
  recentAgents: WorkspaceAgentSummary[];
  runningWorkflows: WorkspaceWorkflowSummary[];
  credits: WorkspaceCreditsSummary;
  notifications: WorkspaceNotification[];
  activity: WorkspaceActivityItem[];
  approvals: WorkspaceApproval[];
  insights: WorkspaceInsight[];
  recommendations: WorkspaceRecommendation[];
  quickActions: WorkspaceQuickAction[];
}

const DEMO_DASHBOARD: WorkspaceDashboardData = {
  recentTasks: [
    { id: 't1', title: 'Invoice batch #2847', module: 'Invoice AI', status: 'running', updatedAt: '2m ago', route: '/workspace/apps/invoice-ai' },
    { id: 't2', title: 'Supplier offer ranking', module: 'Supply Chain AI', status: 'completed', updatedAt: '15m ago', route: '/workspace/apps/supply-chain' },
    { id: 't3', title: 'Knowledge sync — Q4 docs', module: 'Knowledge', status: 'pending', updatedAt: '1h ago', route: '/workspace/knowledge' },
    { id: 't4', title: 'Agent: Support triage', module: 'Agents', status: 'running', updatedAt: '3h ago', route: '/workspace/agents' },
  ],
  recentAgents: [
    { id: 'a1', name: 'Invoice Processor', status: 'running', lastRun: '2m ago', route: '/workspace/agents' },
    { id: 'a2', name: 'Support Triage', status: 'idle', lastRun: '1h ago', route: '/workspace/agents' },
    { id: 'a3', name: 'Compliance Reviewer', status: 'idle', lastRun: 'Yesterday', route: '/workspace/agents' },
  ],
  runningWorkflows: [
    { id: 'w1', name: 'Invoice approval chain', status: 'running', stepsCompleted: 3, stepsTotal: 5, route: '/workspace/workflows' },
    { id: 'w2', name: 'Knowledge ingest pipeline', status: 'running', stepsCompleted: 1, stepsTotal: 4, route: '/workspace/workflows' },
  ],
  credits: {
    remaining: 3842,
    used: 1158,
    total: 5000,
    daysLeft: 18,
    spendUsd: 47.2,
    budgetUsd: 200,
  },
  notifications: [
    { id: 'n1', title: 'Approval required', body: 'High-cost GPT-5 run pending review', time: '5m ago', read: false, type: 'approval', route: '/workspace/compliance' },
    { id: 'n2', title: 'Workflow completed', body: 'Invoice batch #2846 processed', time: '1h ago', read: false, type: 'success', route: '/workspace/workflows' },
    { id: 'n3', title: 'Low credits', body: '23% of monthly allocation remaining', time: '3h ago', read: true, type: 'warning', route: '/workspace/wallet' },
  ],
  activity: [
    { id: 'act1', action: 'Deployed Invoice AI v2.1', actor: 'Jordan Lee', module: 'AI Apps', timestamp: '10m ago' },
    { id: 'act2', action: 'Approved compliance policy', actor: 'Sarah Chen', module: 'Compliance', timestamp: '45m ago' },
    { id: 'act3', action: 'Created agent "Support Triage"', actor: 'Jordan Lee', module: 'Agents', timestamp: '2h ago' },
    { id: 'act4', action: 'Installed Supply Chain AI', actor: 'Marcus Webb', module: 'Marketplace', timestamp: '5h ago' },
  ],
  approvals: [
    { id: 'ap1', title: 'GPT-5 multi-agent run', requester: 'Jordan Lee', module: 'Agents', risk: 'high', createdAt: '5m ago' },
    { id: 'ap2', title: 'External data export', requester: 'Sarah Chen', module: 'Compliance', risk: 'medium', createdAt: '2h ago' },
  ],
  insights: [
    { id: 'i1', title: 'Model cost down 12%', description: 'Routing optimization saved $18 this week', metric: '-12%', trend: 'down' },
    { id: 'i2', title: 'Agent success rate 94%', description: 'Up from 89% last period', metric: '94%', trend: 'up' },
    { id: 'i3', title: '3 workflows need attention', description: 'Failed steps in knowledge pipeline', metric: '3', trend: 'flat' },
  ],
  recommendations: [
    { id: 'r1', title: 'Install HR AI', description: 'Automate onboarding workflows', route: '/workspace/marketplace', icon: 'store' },
    { id: 'r2', title: 'Enable Presence Audit', description: 'Track session activity across modules', route: '/workspace/presence', icon: 'eye' },
    { id: 'r3', title: 'Compare models', description: 'Benchmark GPT-5 vs Claude for your use case', route: '/workspace/playground', icon: 'sparkles' },
  ],
  quickActions: [
    { id: 'q1', label: 'New Agent', icon: 'bot', route: '/workspace/agents' },
    { id: 'q2', label: 'Run Workflow', icon: 'git-branch', route: '/workspace/workflows' },
    { id: 'q3', label: 'Open Playground', icon: 'sparkles', route: '/workspace/playground' },
    { id: 'q4', label: 'Browse Marketplace', icon: 'store', route: '/workspace/marketplace' },
    { id: 'q5', label: 'Add Knowledge', icon: 'book-open', route: '/workspace/knowledge' },
    { id: 'q6', label: 'View Wallet', icon: 'credit-card', route: '/workspace/wallet' },
  ],
};

const QUICK_ACTIONS: WorkspaceQuickAction[] = [
  { id: 'q1', label: 'New Agent', icon: 'bot', route: '/workspace/agents' },
  { id: 'q2', label: 'Run Workflow', icon: 'git-branch', route: '/workspace/workflows' },
  { id: 'q3', label: 'Open Playground', icon: 'sparkles', route: '/workspace/playground' },
  { id: 'q4', label: 'Browse Marketplace', icon: 'store', route: '/workspace/marketplace' },
  { id: 'q5', label: 'Add Knowledge', icon: 'book-open', route: '/workspace/knowledge' },
  { id: 'q6', label: 'View Wallet', icon: 'credit-card', route: '/workspace/wallet' },
];

export interface WorkspaceDashboardOptions {
  /** Explicit demo/preview mode — never used for authenticated workspace home. */
  demo?: boolean;
  userName?: string;
  credits?: Partial<WorkspaceCreditsSummary>;
}

/** Personalized empty state for new or authenticated users without workspace data. */
export function createEmptyDashboard(
  userName?: string,
  credits?: Partial<WorkspaceCreditsSummary>,
): WorkspaceDashboardData {
  const firstName = userName?.split(' ')[0] ?? 'there';
  const creditDefaults: WorkspaceCreditsSummary = {
    remaining: credits?.remaining ?? 500,
    used: credits?.used ?? 0,
    total: credits?.total ?? 500,
    daysLeft: credits?.daysLeft ?? 30,
    spendUsd: credits?.spendUsd ?? 0,
    budgetUsd: credits?.budgetUsd ?? 0,
  };

  return {
    recentTasks: [],
    recentAgents: [],
    runningWorkflows: [],
    credits: creditDefaults,
    notifications: [
      {
        id: 'welcome',
        title: `Welcome, ${firstName}`,
        body: 'Open the Playground or browse the Marketplace to get started.',
        time: 'Just now',
        read: false,
        type: 'info',
        route: '/workspace/playground',
      },
    ],
    activity: [],
    approvals: [],
    insights: [
      {
        id: 'start',
        title: 'Getting started',
        description: 'Run your first agent or workflow to see metrics and activity here.',
      },
    ],
    recommendations: [
      { id: 'r1', title: 'Open Playground', description: 'Try models with your free credits', route: '/workspace/playground', icon: 'sparkles' },
      { id: 'r2', title: 'Browse Marketplace', description: 'Install Invoice AI, Supply Chain AI, and more', route: '/workspace/marketplace', icon: 'store' },
      { id: 'r3', title: 'Create an agent', description: 'Build automations in Agent Studio', route: '/workspace/agents', icon: 'bot' },
    ],
    quickActions: QUICK_ACTIONS,
  };
}

export function getDemoDashboard(): WorkspaceDashboardData {
  return DEMO_DASHBOARD;
}

export class WorkspaceService {
  getDashboard(_tenantId?: string, _userId?: string, options?: WorkspaceDashboardOptions): WorkspaceDashboardData {
    if (options?.demo) {
      return DEMO_DASHBOARD;
    }
    return createEmptyDashboard(options?.userName, options?.credits);
  }

  getRecentTasks(limit = 5, userId?: string, options?: WorkspaceDashboardOptions): WorkspaceTask[] {
    return this.getDashboard(undefined, userId, options).recentTasks.slice(0, limit);
  }

  getRunningWorkflows(userId?: string, options?: WorkspaceDashboardOptions): WorkspaceWorkflowSummary[] {
    return this.getDashboard(undefined, userId, options).runningWorkflows.filter((w) => w.status === 'running');
  }

  getPendingApprovals(userId?: string, options?: WorkspaceDashboardOptions): WorkspaceApproval[] {
    return this.getDashboard(undefined, userId, options).approvals;
  }
}

export const defaultWorkspaceService = new WorkspaceService();
