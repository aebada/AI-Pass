import { createId } from '@ai-pass/shared';

/** n8n-like workflow node types */
export type WorkflowNodeType =
  | 'condition'
  | 'loop'
  | 'wait'
  | 'delay'
  | 'retry'
  | 'approval'
  | 'notification'
  | 'marketplace_app'
  | 'agent'
  | 'external_api'
  | 'trigger'
  | 'skill';

export type EventTriggerType =
  | 'webhook'
  | 'schedule'
  | 'email'
  | 'file_upload'
  | 'iot_stub'
  | 'erp'
  | 'voice'
  | 'marketplace'
  | 'livesync';

export interface WorkflowNode {
  id: string;
  type: WorkflowNodeType;
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  trigger: EventTrigger;
  active: boolean;
  version: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventTrigger {
  id: string;
  type: EventTriggerType;
  config: Record<string, unknown>;
  livesyncEventType?: string;
}

export interface WorkflowRunResult {
  workflowId: string;
  runId: string;
  status: 'completed' | 'failed' | 'paused' | 'awaiting_approval';
  nodeResults: Record<string, unknown>;
  logs: string[];
  startedAt: string;
  completedAt?: string;
}

export function createWorkflow(
  partial: Pick<AutomationWorkflow, 'name' | 'description'> & Partial<AutomationWorkflow>,
): AutomationWorkflow {
  const now = new Date().toISOString();
  return {
    id: partial.id ?? `wf_${createId()}`,
    name: partial.name,
    description: partial.description,
    nodes: partial.nodes ?? [],
    edges: partial.edges ?? [],
    trigger: partial.trigger ?? {
      id: `trg_${createId()}`,
      type: 'webhook',
      config: {},
    },
    active: partial.active ?? false,
    version: partial.version ?? '1.0.0',
    createdAt: partial.createdAt ?? now,
    updatedAt: partial.updatedAt ?? now,
  };
}
