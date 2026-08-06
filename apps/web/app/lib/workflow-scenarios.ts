export type WorkflowBlockType = 'trigger' | 'ai' | 'api' | 'approval' | 'output';

export interface WorkflowBlockMeta {
  type: WorkflowBlockType;
  label: string;
  icon: string;
  description: string;
  color: string;
}

export const WORKFLOW_BLOCKS: WorkflowBlockMeta[] = [
  { type: 'trigger', label: 'Trigger', icon: 'zap', description: 'Start on event or schedule', color: '#6366f1' },
  { type: 'ai', label: 'AI Step', icon: 'bot', description: 'Run an AI agent or skill', color: '#8b5cf6' },
  { type: 'api', label: 'API Call', icon: 'link', description: 'HTTP request to external service', color: '#14b8a6' },
  { type: 'approval', label: 'Approval', icon: 'check', description: 'Human approval gate', color: '#10b981' },
  { type: 'output', label: 'Output', icon: 'upload', description: 'Deliver result or notification', color: '#3b82f6' },
];

export const WORKFLOW_BLOCK_META: Record<WorkflowBlockType, WorkflowBlockMeta> = Object.fromEntries(
  WORKFLOW_BLOCKS.map((b) => [b.type, b]),
) as Record<WorkflowBlockType, WorkflowBlockMeta>;

export interface WorkflowStep {
  id: string;
  type: WorkflowBlockType;
  title: string;
  instructions: string;
}

export interface WorkflowScenario {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

const WORKFLOWS_KEY = 'ai-pass-workflow-scenarios';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadWorkflowScenarios(): WorkflowScenario[] {
  return readJson<WorkflowScenario[]>(WORKFLOWS_KEY, []);
}

export function saveWorkflowScenarios(scenarios: WorkflowScenario[]): void {
  writeJson(WORKFLOWS_KEY, scenarios);
}

export function createWorkflowStep(type: WorkflowBlockType, partial?: Partial<WorkflowStep>): WorkflowStep {
  const meta = WORKFLOW_BLOCK_META[type];
  return {
    id: `wf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    title: partial?.title ?? meta.label,
    instructions: partial?.instructions ?? '',
  };
}

export function saveWorkflowScenario(input: {
  id?: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}): WorkflowScenario {
  const now = new Date().toISOString();
  const scenarios = loadWorkflowScenarios();
  const existing = input.id ? scenarios.find((s) => s.id === input.id) : undefined;

  const scenario: WorkflowScenario = {
    id: existing?.id ?? `workflow_${Date.now()}`,
    name: input.name.trim(),
    description: input.description.trim(),
    steps: input.steps,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };

  const next = existing
    ? scenarios.map((s) => (s.id === scenario.id ? scenario : s))
    : [...scenarios, scenario];
  saveWorkflowScenarios(next);
  return scenario;
}

export function deleteWorkflowScenario(id: string): WorkflowScenario[] {
  const next = loadWorkflowScenarios().filter((s) => s.id !== id);
  saveWorkflowScenarios(next);
  return next;
}

export function getWorkflowScenario(id: string): WorkflowScenario | undefined {
  return loadWorkflowScenarios().find((s) => s.id === id);
}

export const DEMO_WORKFLOW: WorkflowScenario = {
  id: 'demo_invoice_approval',
  name: 'Invoice approval chain',
  description: 'Validate, route for approval, and post to ERP',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  steps: [
    {
      id: 'demo_t1',
      type: 'trigger',
      title: 'Invoice uploaded',
      instructions: 'When a new invoice is uploaded via email or portal, extract vendor and amount.',
    },
    {
      id: 'demo_t2',
      type: 'ai',
      title: 'Validate invoice',
      instructions: 'Check line items, tax, and vendor against PO. Flag anomalies with confidence score.',
    },
    {
      id: 'demo_t3',
      type: 'approval',
      title: 'Manager approval',
      instructions: 'If amount > $5,000 or vendor is new, require manager sign-off before posting.',
    },
    {
      id: 'demo_t4',
      type: 'api',
      title: 'Post to ERP',
      instructions: 'POST validated invoice to SAP with GL codes and cost center from PO match.',
    },
    {
      id: 'demo_t5',
      type: 'output',
      title: 'Notify AP team',
      instructions: 'Send Slack summary with invoice ID, status, and link to audit trail.',
    },
  ],
};
