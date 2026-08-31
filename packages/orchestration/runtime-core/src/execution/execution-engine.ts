import { createId } from '@ai-pass/shared';
import { SkillLifecycleService } from '@ai-pass/marketplace-core';
import { defaultWalletService } from '@ai-pass/wallet';
import { generateExecutionPlan } from '../planner/planner.js';
import { defaultToolRouter } from '../router/tool-router.js';
import { defaultEvaluator } from '../evaluator/evaluator.js';
import { defaultOutputComposer } from '../output/output-composer.js';
import { defaultRuntimeMonitoring } from '../monitoring/monitoring-service.js';
import type {
  Execution,
  ExecutionMode,
  ExecuteRequest,
  ExecuteResponse,
  OutputFormat,
  Plan,
  PlanRequest,
  PlanResponse,
  RuntimeLog,
  RuntimeMetrics,
  Task,
} from '../types.js';

export interface ExecutionEngineOptions {
  lifecycle?: SkillLifecycleService;
  walletUserId?: string;
}

export class ExecutionEngine {
  private plans = new Map<string, Plan>();
  private executions = new Map<string, Execution>();

  constructor(private options: ExecutionEngineOptions = {}) {}

  plan(request: PlanRequest): PlanResponse {
    const plan = generateExecutionPlan(request.input);
    this.plans.set(plan.id, plan);
    return { plan };
  }

  getPlan(planId: string): Plan | undefined {
    return this.plans.get(planId);
  }

  getExecution(executionId: string): Execution | undefined {
    return this.executions.get(executionId);
  }

  async execute(request: ExecuteRequest): Promise<ExecuteResponse> {
    const mode: ExecutionMode = request.mode ?? 'sequential';
    const outputFormat: OutputFormat = request.outputFormat ?? 'json';

    let plan: Plan | undefined;
    if (request.plan) {
      plan = request.plan;
      this.plans.set(plan.id, plan);
    } else if (request.planId) {
      plan = this.plans.get(request.planId);
    } else if (request.input) {
      plan = generateExecutionPlan(request.input);
      this.plans.set(plan.id, plan);
    }

    if (!plan) {
      throw new Error('Execute requires planId, plan, or input');
    }

    const executionId = `exec_${createId()}`;
    const startedAt = new Date().toISOString();
    const logs: RuntimeLog[] = [];
    const log = (message: string, taskId?: string, level: RuntimeLog['level'] = 'info') => {
      logs.push({
        id: `log_${createId()}`,
        executionId,
        taskId,
        level,
        message,
        timestamp: new Date().toISOString(),
      });
    };

    const metrics: RuntimeMetrics = {
      totalDurationMs: 0,
      planningDurationMs: 0,
      executionDurationMs: 0,
      evaluationDurationMs: 0,
      creditsUsed: 0,
      tasksCompleted: 0,
      tasksFailed: 0,
      providerLatencyMs: 0,
      confidence: 0,
    };

    const execution: Execution = {
      id: executionId,
      planId: plan.id,
      status: 'executing',
      input: plan.input,
      plan,
      logs,
      metrics,
      mode,
      startedAt,
    };
    this.executions.set(executionId, execution);

    const execStart = Date.now();
    log(`Execution started · mode=${mode} · ${plan.tasks.length} tasks`);

    const prefs = {
      preferQuality: plan.input.constraints?.preferQuality,
      preferCost: plan.input.constraints?.preferCost,
      membershipTier: plan.input.membershipTier ?? 'professional',
      region: plan.input.constraints?.region,
    };

    const routes = defaultToolRouter.routeAll(plan.tasks, prefs);
    const taskResults: Record<string, unknown> = {};

    const runTask = async (task: Task): Promise<void> => {
      const route = routes.find((r) => r.taskId === task.id);
      if (!route?.available) {
        task.status = 'failed';
        metrics.tasksFailed += 1;
        log(`Task unavailable: ${task.name}`, task.id, 'error');
        return;
      }

      task.status = 'running';
      log(`Routed: ${route.reason}`, task.id);

      if (plan.input.constraints?.requireApproval && task.type === 'action') {
        task.status = 'awaiting_approval';
        log('Awaiting approval for computer action', task.id, 'warn');
        return;
      }

      await this.simulateLatency(route.estimatedLatencyMs);
      metrics.providerLatencyMs += route.estimatedLatencyMs;

      let output: Record<string, unknown>;
      if (task.type === 'skill' && task.skillId && this.options.lifecycle) {
        const skill = { id: task.skillId, name: task.name } as never;
        output = this.options.lifecycle.executeMock(skill, plan.input.context ?? {});
      } else if (task.type === 'tool' && task.toolId === 'evaluator') {
        output = { evaluated: true };
      } else if (task.type === 'action') {
        output = { action: 'simulated', target: task.config?.target ?? 'browser', mode: 'simulation' };
      } else {
        output = {
          modelId: route.modelId,
          providerId: route.providerId,
          response: `[Runtime] Processed "${task.name}" via ${route.modelId ?? route.skillId ?? 'tool'}`,
          goal: plan.input.goal,
        };
      }

      task.status = 'completed';
      taskResults[task.id] = output;
      metrics.tasksCompleted += 1;
      metrics.creditsUsed += route.estimatedCredits;
      log(`Task completed: ${task.name}`, task.id);
    };

    const execPhaseStart = Date.now();

    if (mode === 'parallel') {
      await Promise.all(plan.tasks.map(runTask));
    } else {
      for (const task of plan.tasks.sort((a, b) => a.order - b.order)) {
        if (task.dependencies.length > 0) {
          const depsOk = task.dependencies.every((dep) => {
            const depTask = plan!.tasks.find((t) => t.id === dep);
            return depTask?.status === 'completed';
          });
          if (!depsOk && task.status !== 'awaiting_approval') {
            task.status = 'skipped';
            log(`Skipped (dependency failed): ${task.name}`, task.id, 'warn');
            continue;
          }
        }
        await runTask(task);
        if (task.status === 'failed' && mode !== 'fallback') break;
      }
    }

    metrics.executionDurationMs = Date.now() - execPhaseStart;

    const evalStart = Date.now();
    execution.status = 'evaluating';
    const mergedResult = Object.assign({}, ...Object.values(taskResults).map((r) =>
      typeof r === 'object' && r !== null ? r : { value: r },
    ));

    const evalResult = defaultEvaluator.evaluate({
      result: mergedResult as Record<string, unknown>,
      goal: plan.input.goal,
      citations: [],
    });

    const structured = defaultEvaluator.toStructuredOutput(
      evalResult,
      mergedResult as Record<string, unknown>,
      outputFormat,
    );
    const composed = defaultOutputComposer.compose(structured, outputFormat);

    metrics.evaluationDurationMs = Date.now() - evalStart;
    metrics.confidence = evalResult.confidence;
    metrics.totalDurationMs = Date.now() - execStart;

    execution.output = composed;
    execution.status = evalResult.needsInfo ? 'needs_info' : evalResult.passed ? 'completed' : 'failed';
    execution.completedAt = new Date().toISOString();
    execution.logs = logs;
    execution.metrics = metrics;

    const userId = plan.input.userId ?? this.options.walletUserId ?? 'demo-user';
    if (metrics.creditsUsed > 0) {
      defaultWalletService.recordUsage({
        userId,
        tenantId: plan.input.tenantId ?? 'demo-tenant',
        provider: routes.find((r) => r.providerId)?.providerId ?? 'runtime',
        model: routes.find((r) => r.modelId)?.modelId ?? 'runtime-core',
        credits: metrics.creditsUsed,
        estimatedCostUsd: metrics.creditsUsed * 0.002,
        inputTokens: 0,
        outputTokens: 0,
        taskType: 'agent',
        module: 'runtime-core',
      });
    }

    log(`Execution ${execution.status} · confidence=${(evalResult.confidence * 100).toFixed(0)}%`);
    defaultRuntimeMonitoring.recordExecution(execution);
    return { execution };
  }

  private simulateLatency(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, Math.min(ms, 100)));
  }
}

let _engine: ExecutionEngine | null = null;

export function getExecutionEngine(): ExecutionEngine {
  if (!_engine) _engine = new ExecutionEngine();
  return _engine;
}

export function createExecutionEngine(options?: ExecutionEngineOptions): ExecutionEngine {
  return new ExecutionEngine(options);
}
