import { createId, type AgentExecution, type WorkflowExecution } from '@ai-pass/shared';
import type { LiveSyncStore } from './types.js';
import type { ExecutionLogger } from './logging.js';
import type { LiveSyncChannelBus } from './channels.js';

export class OutputHandler {
  constructor(
    private store: LiveSyncStore,
    private logger: ExecutionLogger,
    private channels: LiveSyncChannelBus
  ) {}

  persistWorkflowExecution(
    partial: Omit<WorkflowExecution, 'id' | 'started_at'> & {
      id?: string;
      started_at?: string;
    }
  ): WorkflowExecution {
    const execution: WorkflowExecution = {
      id: partial.id ?? `exec_${createId()}`,
      workflow_id: partial.workflow_id,
      event_id: partial.event_id,
      status: partial.status,
      started_at: partial.started_at ?? new Date().toISOString(),
      finished_at: partial.finished_at,
      result_summary: partial.result_summary,
      decision: partial.decision,
      confidence: partial.confidence,
      result: partial.result,
    };
    this.store.workflowExecutions.set(execution.id, execution);
    return execution;
  }

  persistAgentExecution(
    workflowExecutionId: string,
    agentName: string,
    input: Record<string, unknown>,
    output: Record<string, unknown>,
    decision: AgentExecution['decision'],
    confidence: number
  ): AgentExecution {
    const now = new Date().toISOString();
    const execution: AgentExecution = {
      id: `agt_${createId()}`,
      workflow_execution_id: workflowExecutionId,
      agent_name: agentName,
      input_payload: input,
      output_payload: output,
      decision,
      confidence,
      started_at: now,
      finished_at: now,
    };
    this.store.agentExecutions.set(execution.id, execution);
    return execution;
  }

  updateExecutionStatus(
    executionId: string,
    status: WorkflowExecution['status'],
    extras?: Partial<WorkflowExecution>
  ): WorkflowExecution | undefined {
    const existing = this.store.workflowExecutions.get(executionId);
    if (!existing) return undefined;

    const updated: WorkflowExecution = {
      ...existing,
      ...extras,
      status,
      finished_at:
        status === 'completed' || status === 'failed' ? new Date().toISOString() : existing.finished_at,
    };
    this.store.workflowExecutions.set(executionId, updated);

    const topic =
      status === 'completed'
        ? 'execution.completed'
        : status === 'failed'
          ? 'execution.failed'
          : 'execution.started';

    this.channels.publish(topic, updated);
    this.logger.info('workflow', executionId, `Execution status → ${status}`);
    return updated;
  }

  propagateToSyncLayer(execution: WorkflowExecution): void {
    this.channels.publish('execution.completed', {
      execution_id: execution.id,
      workflow_id: execution.workflow_id,
      decision: execution.decision,
      confidence: execution.confidence,
      result: execution.result,
    });
    this.logger.info('system', execution.id, 'Output propagated to sync layer', {
      workflow_id: execution.workflow_id,
    });
  }
}
