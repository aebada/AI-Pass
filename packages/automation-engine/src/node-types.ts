import type { WorkflowNodeType } from './types.js';

export const NODE_TYPE_META: Record<
  WorkflowNodeType,
  { label: string; icon: string; description: string; color: string }
> = {
  trigger: { label: 'Trigger', icon: '⚡', description: 'Workflow entry point', color: '#6366f1' },
  condition: { label: 'Condition', icon: '◇', description: 'Branch on expression', color: '#f59e0b' },
  loop: { label: 'Loop', icon: '↻', description: 'Iterate over items', color: '#8b5cf6' },
  wait: { label: 'Wait', icon: '⏸', description: 'Wait for event', color: '#64748b' },
  delay: { label: 'Delay', icon: '⏱', description: 'Pause execution', color: '#64748b' },
  retry: { label: 'Retry', icon: '↺', description: 'Retry on failure', color: '#ef4444' },
  approval: { label: 'Approval', icon: '✓', description: 'Human approval gate', color: '#10b981' },
  notification: { label: 'Notify', icon: '✉', description: 'Send notification', color: '#3b82f6' },
  marketplace_app: { label: 'Marketplace App', icon: '🏪', description: 'Run installed app', color: '#ec4899' },
  agent: { label: 'Agent', icon: '🤖', description: 'Run AI agent', color: '#6366f1' },
  external_api: { label: 'External API', icon: '🔗', description: 'HTTP request', color: '#14b8a6' },
  skill: { label: 'Skill', icon: '⚙', description: 'Invoke marketplace skill', color: '#a855f7' },
};

export function scaffoldWorkflow(_name: string): {
  nodes: Array<{ id: string; type: WorkflowNodeType; label: string; position: { x: number; y: number }; config: Record<string, unknown> }>;
  edges: Array<{ id: string; source: string; target: string }>;
} {
  return {
    nodes: [
      { id: 'n_trigger', type: 'trigger', label: 'Webhook', position: { x: 80, y: 120 }, config: {} },
      { id: 'n_agent', type: 'agent', label: 'AI Agent', position: { x: 320, y: 120 }, config: { agentId: 'default' } },
      { id: 'n_notify', type: 'notification', label: 'Notify', position: { x: 560, y: 120 }, config: { channel: 'email' } },
    ],
    edges: [
      { id: 'e1', source: 'n_trigger', target: 'n_agent' },
      { id: 'e2', source: 'n_agent', target: 'n_notify' },
    ],
  };
}
