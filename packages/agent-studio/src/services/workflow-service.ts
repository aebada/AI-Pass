import { createId } from '@ai-pass/shared';
import { getAutomationEngine, createWorkflow, type WorkflowNodeType } from '@ai-pass/automation-engine';
import type { AgentService } from './agent-service.js';
import type { Workflow, WorkflowStep } from '../types.js';

function resolveNodeType(step: WorkflowStep): WorkflowNodeType {
  switch (step.type) {
    case 'skill':
      return 'skill';
    case 'approval':
      return 'approval';
    case 'delay':
      return 'delay';
    case 'condition':
      return 'condition';
    case 'loop':
      return 'loop';
    default:
      return 'skill';
  }
}

export class WorkflowService {
  private workflows = new Map<string, Workflow>();

  constructor(private agents: AgentService) {}

  create(input: Omit<Workflow, 'id' | 'createdAt' | 'updatedAt'>): Workflow {
    const now = new Date().toISOString();
    const entry: Workflow = {
      ...input,
      id: `wf_${createId()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.workflows.set(entry.id, entry);
    return entry;
  }

  get(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  list(agentId?: string): Workflow[] {
    const all = [...this.workflows.values()];
    return agentId ? all.filter((w) => w.agentId === agentId) : all;
  }

  update(workflowId: string, patch: Partial<Workflow>): Workflow | undefined {
    const existing = this.workflows.get(workflowId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.workflows.set(workflowId, updated);
    return updated;
  }

  delete(workflowId: string): boolean {
    return this.workflows.delete(workflowId);
  }

  buildFromAgent(agentId: string, steps: WorkflowStep[]): Workflow {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent not found: ${agentId}`);
    return this.create({
      agentId,
      name: `${agent.name} Workflow`,
      steps,
      status: 'draft',
    });
  }

  /** Wire workflow to automation-engine for execution */
  toAutomationWorkflow(workflow: Workflow) {
    const nodes = workflow.steps.map((step, i) => ({
      id: step.stepId,
      type: resolveNodeType(step),
      label: step.label ?? step.stepId,
      config: {
        skillId: step.skillId,
        ms: step.delayMs,
        retryCount: step.retryCount,
        onError: step.onError,
      },
      position: { x: 80 + i * 180, y: 120 },
    }));

    const edges = workflow.steps
      .filter((s) => s.nextStep)
      .map((s) => ({ id: `e_${s.stepId}`, source: s.stepId, target: s.nextStep! }));

    const automation = createWorkflow({
      id: workflow.automationWorkflowId ?? `auto_${workflow.id}`,
      name: workflow.name,
      description: workflow.description ?? '',
      nodes,
      edges,
      active: workflow.status === 'active',
    });

    getAutomationEngine().register(automation);
    this.update(workflow.id, { automationWorkflowId: automation.id });
    return automation;
  }

  async run(workflowId: string, input: Record<string, unknown> = {}): Promise<Record<string, unknown>> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) throw new Error(`Workflow not found: ${workflowId}`);
    const automation = this.toAutomationWorkflow(workflow);
    const result = await getAutomationEngine().run(automation.id, input);
    return { runId: result.runId, status: result.status, logs: result.logs, nodeResults: result.nodeResults };
  }

  getTemplates(): Array<{ id: string; name: string; description: string; stepCount: number }> {
    return this.list().map((w) => ({
      id: w.id,
      name: w.name,
      description: w.description ?? '',
      stepCount: w.steps.length,
    }));
  }
}
