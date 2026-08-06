import type {
  AgentConfig,
  AgentExecutionContext,
  AgentLifecycle,
  AgentLifecyclePhase,
  AgentStepResult,
} from './types.js';

/** Logger interface for agent lifecycle events */
export interface AgentLogger {
  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, metadata?: Record<string, unknown>): void;
}

/** Contract for all agents — GenericAgent and domain-specific implementations */
export interface IAgent {
  readonly config: AgentConfig;
  readonly lifecycle: AgentLifecycle;

  initialize(context: AgentExecutionContext): Promise<AgentStepResult>;
  plan(context: AgentExecutionContext): Promise<AgentStepResult>;
  reason(context: AgentExecutionContext): Promise<AgentStepResult>;
  execute(context: AgentExecutionContext): Promise<AgentStepResult>;
  validate(context: AgentExecutionContext): Promise<AgentStepResult>;
  evaluate(context: AgentExecutionContext): Promise<AgentStepResult>;
  complete(context: AgentExecutionContext): Promise<AgentStepResult>;
  rollback(context: AgentExecutionContext, reason: string): Promise<AgentStepResult>;
  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, metadata?: Record<string, unknown>): void;
}

function createLifecycle(phase: AgentLifecyclePhase = 'initializing'): AgentLifecycle {
  const now = new Date().toISOString();
  return {
    phase,
    status: phase === 'completed' ? 'completed' : phase === 'failed' ? 'failed' : 'pending',
    startedAt: now,
    updatedAt: now,
  };
}

function stepResult<T>(
  phase: AgentLifecyclePhase,
  success: boolean,
  output?: T,
  error?: string,
): AgentStepResult<T> {
  return { success, phase, output, error };
}

/**
 * Abstract base class for all agents.
 * Domain agents (Invoice, HR, Supply Chain) extend this and override lifecycle hooks.
 */
export abstract class AbstractAgent implements IAgent {
  readonly config: AgentConfig;
  lifecycle: AgentLifecycle;
  protected logger: AgentLogger;

  constructor(config: AgentConfig, logger?: AgentLogger) {
    this.config = config;
    this.lifecycle = createLifecycle();
    this.logger = logger ?? {
      log: (level, message, metadata) => {
        const prefix = `[${this.config.id}]`;
        if (metadata) console[level](prefix, message, metadata);
        else console[level](prefix, message);
      },
    };
  }

  protected transition(phase: AgentLifecyclePhase, status?: AgentLifecycle['status']): void {
    this.lifecycle = {
      ...this.lifecycle,
      phase,
      status: status ?? (phase === 'completed' ? 'completed' : phase === 'failed' ? 'failed' : 'executing'),
      updatedAt: new Date().toISOString(),
      completedAt: phase === 'completed' || phase === 'failed' ? new Date().toISOString() : this.lifecycle.completedAt,
    };
  }

  async initialize(context: AgentExecutionContext): Promise<AgentStepResult> {
    this.transition('initializing', 'planning');
    this.log('info', 'Agent initialized', { executionId: context.executionId });
    return stepResult('initializing', true, { ready: true });
  }

  abstract plan(context: AgentExecutionContext): Promise<AgentStepResult>;
  abstract reason(context: AgentExecutionContext): Promise<AgentStepResult>;
  abstract execute(context: AgentExecutionContext): Promise<AgentStepResult>;

  async validate(context: AgentExecutionContext): Promise<AgentStepResult> {
    this.transition('validating');
    this.log('debug', 'Validation stub — override in domain agent', { executionId: context.executionId });
    return stepResult('validating', true, { valid: true });
  }

  async evaluate(context: AgentExecutionContext): Promise<AgentStepResult> {
    this.transition('evaluating');
    this.log('debug', 'Evaluation stub — wires to runtime-core Evaluator in production', {
      executionId: context.executionId,
    });
    return stepResult('evaluating', true, { confidence: 0.85, passed: true });
  }

  async complete(context: AgentExecutionContext): Promise<AgentStepResult> {
    this.transition('completed', 'completed');
    this.log('info', 'Agent run completed', { executionId: context.executionId });
    return stepResult('completed', true);
  }

  async rollback(context: AgentExecutionContext, reason: string): Promise<AgentStepResult> {
    this.transition('rolling_back', 'failed');
    this.lifecycle.error = reason;
    this.log('warn', 'Agent rollback', { executionId: context.executionId, reason });
    return stepResult('rolling_back', false, { reason }, reason);
  }

  log(level: 'info' | 'warn' | 'error' | 'debug', message: string, metadata?: Record<string, unknown>): void {
    this.logger.log(level, message, metadata);
  }
}
