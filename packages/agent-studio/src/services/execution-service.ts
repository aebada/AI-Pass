import { createId, type AgentDecision, type WorkflowStepDef } from '@ai-pass/shared';
import { getKnowledgePlatform } from '@ai-pass/knowledge-pipeline';
import { getExecutionEngine } from '@ai-pass/runtime-core';
import type { SkillExecutor } from '@ai-pass/marketplace';
import type { AgentService } from './agent-service.js';
import type { SkillService } from './skill-service.js';
import type { PlannerService } from './planner-service.js';
import type { EvaluationService } from './evaluation-service.js';
import type { MonitoringService } from './monitoring-service.js';
import type {
  ExecuteAgentRequest,
  ExecuteAgentResponse,
  Execution,
  ExecutionLog,
} from '../types.js';
import { checkExecutionGates, runGovernanceCheck, runTrustCheck } from '../integrations.js';

export class ExecutionService {
  private executions = new Map<string, Execution>();

  constructor(
    private agents: AgentService,
    private skills: SkillService,
    private planner: PlannerService,
    private evaluator: EvaluationService,
    private monitoring: MonitoringService,
    private skillExecutor?: SkillExecutor,
  ) {}

  list(filter?: { agentId?: string; limit?: number }): Execution[] {
    let all = [...this.executions.values()].sort(
      (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    );
    if (filter?.agentId) all = all.filter((e) => e.agentId === filter.agentId);
    if (filter?.limit) all = all.slice(0, filter.limit);
    return all;
  }

  get(executionId: string): Execution | undefined {
    return this.executions.get(executionId);
  }

  seedExecution(execution: Execution): void {
    this.executions.set(execution.id, execution);
    this.monitoring.recordExecution(execution);
  }

  async execute(request: ExecuteAgentRequest): Promise<ExecuteAgentResponse> {
    const agent = this.agents.get(request.agentId);
    if (!agent) throw new Error(`Agent not found: ${request.agentId}`);

    const tier = request.membershipTier ?? 'professional';
    const gate = checkExecutionGates(tier, this.agents.count());
    if (!gate.allowed) throw new Error(gate.reason);

    let governance: ExecuteAgentResponse['governance'];
    if (!request.skipGovernance) {
      governance = runGovernanceCheck(request.agentId, agent.riskLevel, request.input);
      if (!governance.allowed) {
        throw new Error(`Governance blocked: ${governance.violations.join(', ')}`);
      }
    }

    const trustScore = runTrustCheck(agent.trustScore);
    const startedAt = new Date().toISOString();
    const logs: ExecutionLog[] = [];
    const log = (message: string, stepId?: string, level: ExecutionLog['level'] = 'info') => {
      logs.push({
        id: `log_${createId()}`,
        executionId: '',
        stepId,
        level,
        message,
        timestamp: new Date().toISOString(),
      });
    };

    log('Input received');

    const contextQuery = String(request.input.query ?? request.input.contextQuery ?? request.input.message ?? '');
    let enrichedInput = { ...request.input };
    if (contextQuery) {
      const rag = getKnowledgePlatform().rag.retrieveContext({
        tenantId: request.tenantId ?? agent.tenantId ?? 'tenant_acme',
        query: contextQuery,
        agentId: request.agentId,
        topK: 5,
      });
      enrichedInput = {
        ...enrichedInput,
        knowledgeContext: rag.chunks.map((c) => c.content),
        knowledgeCitations: rag.citations,
        knowledgeConfidence: rag.confidence,
        knowledgeGraphLinks: rag.graphLinks,
      };
      log(`Knowledge context retrieved · ${rag.chunks.length} chunks · confidence ${(rag.confidence * 100).toFixed(0)}%`);
    }

    log('Planning execution');

    const { plan } = this.planner.plan({
      agentId: request.agentId,
      goal: agent.description,
      context: enrichedInput,
      constraints: { maxCredits: 100 },
    });

    log(`Plan generated · ${plan.tasks.length} tasks`);

    const engine = getExecutionEngine();
    const { execution: runtimeExec } = await engine.execute({
      plan,
      mode: 'sequential',
      outputFormat: 'decision',
      input: {
        goal: agent.description,
        context: enrichedInput,
        userId: request.userId ?? 'demo-user',
        tenantId: request.tenantId ?? agent.tenantId ?? 'demo-tenant',
        membershipTier: tier,
      },
    });

    log('Skill selection & execution complete');
    log('Evaluation complete');

    const version = this.agents.getLatestVersion(request.agentId);
    const steps = version?.workflowConfig.steps.map((step: WorkflowStepDef, i: number) => {
      const task = plan.tasks[i];
      return {
        stepId: step.stepId,
        skillId: step.skillId,
        name: task?.name ?? step.stepId,
        input: request.input,
        output: (runtimeExec.output?.result ?? {}) as Record<string, unknown>,
        durationMs: Math.round(runtimeExec.metrics.executionDurationMs / Math.max(plan.tasks.length, 1)),
        status: 'completed' as const,
      };
    }) ?? [];

    if (agent.skillIds.length && this.skillExecutor) {
      for (const skillId of agent.skillIds.slice(0, 2)) {
        const skill = this.skills.get(skillId);
        if (skill) {
          log(`Skill invoked: ${skill.name}`, skillId);
        }
      }
    }

    const evalResult = this.evaluator.evaluate({
      executionId: runtimeExec.id,
      goal: agent.description,
      result: (runtimeExec.output?.result ?? {}) as Record<string, unknown>,
    });

    const decision = (runtimeExec.output?.decision ?? evalResult.decision) as AgentDecision;
    const execution: Execution = {
      id: runtimeExec.id,
      agentId: request.agentId,
      agentName: agent.name,
      input: request.input,
      output: {
        decision,
        confidence: runtimeExec.output?.confidence ?? evalResult.confidence,
        evidence: runtimeExec.output?.evidence?.map((e) => e.excerpt) ?? evalResult.evidence,
        reasons: evalResult.issues.length ? evalResult.issues : ['Workflow completed via runtime-core'],
        structured: runtimeExec.output?.result,
      },
      steps,
      logs: logs.map((l) => ({ ...l, executionId: runtimeExec.id })),
      status: runtimeExec.status === 'completed' ? 'completed' : runtimeExec.status === 'failed' ? 'failed' : 'running',
      creditsUsed: runtimeExec.metrics.creditsUsed,
      latencyMs: runtimeExec.metrics.totalDurationMs,
      runtimeExecutionId: runtimeExec.id,
      planId: plan.id,
      startedAt,
      completedAt: runtimeExec.completedAt,
    };

    log(`Execution ${execution.status} · ${execution.creditsUsed} credits`);
    this.executions.set(execution.id, execution);
    this.monitoring.recordExecution(execution);

    return { execution, runtime: runtimeExec, governance, trustScore };
  }
}
