import { createId } from '@ai-pass/shared';
import { routeTool } from '@ai-pass/runtime-core';
import { WorkflowGraph } from './graph.js';
import type { AutomationWorkflow, WorkflowNode, WorkflowRunResult } from './types.js';

export class AutomationEngine {
  private workflows = new Map<string, AutomationWorkflow>();

  register(workflow: AutomationWorkflow): void {
    this.workflows.set(workflow.id, workflow);
  }

  get(id: string): AutomationWorkflow | undefined {
    return this.workflows.get(id);
  }

  list(): AutomationWorkflow[] {
    return [...this.workflows.values()];
  }

  async run(workflowId: string, input: Record<string, unknown> = {}): Promise<WorkflowRunResult> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);

    const graph = new WorkflowGraph(workflow);
    const validation = graph.validate();
    if (!validation.valid) {
      throw new Error(`Invalid workflow: ${validation.errors.join(', ')}`);
    }

    const runId = `run_${createId()}`;
    const startedAt = new Date().toISOString();
    const logs: string[] = [`[${runId}] Started workflow: ${workflow.name}`];
    const nodeResults: Record<string, unknown> = {};
    let status: WorkflowRunResult['status'] = 'completed';

    const ordered = graph.topologicalOrder();

    for (const node of ordered) {
      const result = await this.executeNode(node, input, logs);
      nodeResults[node.id] = result;

      if (result.status === 'awaiting_approval') {
        status = 'awaiting_approval';
        logs.push(`[${node.id}] Paused for approval`);
        break;
      }
      if (result.status === 'failed') {
        status = 'failed';
        break;
      }
    }

    return {
      workflowId,
      runId,
      status,
      nodeResults,
      logs,
      startedAt,
      completedAt: status !== 'awaiting_approval' ? new Date().toISOString() : undefined,
    };
  }

  private async executeNode(
    node: WorkflowNode,
    input: Record<string, unknown>,
    logs: string[],
  ): Promise<Record<string, unknown>> {
    logs.push(`[${node.id}] Executing ${node.type}: ${node.label}`);

    switch (node.type) {
      case 'delay':
      case 'wait': {
        const ms = Number(node.config.ms ?? 0);
        if (ms > 0) await new Promise((r) => setTimeout(r, Math.min(ms, 50)));
        return { status: 'completed', waitedMs: ms };
      }
      case 'condition': {
        const expr = String(node.config.expression ?? 'true');
        const pass = expr === 'true' || Boolean(input[expr]);
        return { status: 'completed', passed: pass };
      }
      case 'retry': {
        const attempts = Number(node.config.attempts ?? 3);
        return { status: 'completed', attempts, retried: true };
      }
      case 'approval':
        return { status: 'awaiting_approval', approver: node.config.approver ?? 'admin' };
      case 'notification':
        return { status: 'completed', channel: node.config.channel ?? 'email', sent: true };
      case 'agent': {
        const route = routeTool({
          id: node.id,
          name: node.label,
          description: 'Automation agent node',
          type: 'model',
          dependencies: [],
          status: 'running',
          estimatedCredits: 10,
          order: 0,
        });
        return { status: 'completed', route, output: { agent: node.config.agentId ?? 'default' } };
      }
      case 'marketplace_app':
        return { status: 'completed', appId: node.config.appId, stub: true };
      case 'external_api':
        return { status: 'completed', url: node.config.url, method: node.config.method ?? 'POST', stub: true };
      case 'skill':
        return { status: 'completed', skillId: node.config.skillId, stub: true };
      case 'loop': {
        const items = (input.items as unknown[]) ?? [];
        return { status: 'completed', iterations: items.length };
      }
      default:
        return { status: 'completed' };
    }
  }
}

let _engine: AutomationEngine | null = null;

export function getAutomationEngine(): AutomationEngine {
  if (!_engine) _engine = new AutomationEngine();
  return _engine;
}
