import type { SkillRegistry } from '@ai-pass/marketplace-core';
import type { SkillExecutor } from '@ai-pass/marketplace';
import type { WorkflowConfig, WorkflowStepDef } from '@ai-pass/shared';
import { AgentService } from './services/agent-service.js';
import { SkillService } from './services/skill-service.js';
import { WorkflowService } from './services/workflow-service.js';
import { PlannerService } from './services/planner-service.js';
import { EvaluationService } from './services/evaluation-service.js';
import { ExecutionService } from './services/execution-service.js';
import { MultiAgentOrchestrator } from './services/multi-agent-orchestrator.js';
import { PublishingService } from './services/publishing-service.js';
import { MonitoringService } from './services/monitoring-service.js';
import { AnalyticsService } from './services/analytics-service.js';
import { AgentLegacyExecutionEngine } from './legacy-execution-engine.js';
import {
  AGENT_ID_MAP,
  DEMO_AGENTS,
  DEMO_EXECUTIONS,
  DEMO_SKILLS,
  DEMO_WORKFLOW_TEMPLATES,
} from './seed-data.js';
import type { Agent } from './types.js';
import type { StudioAgent } from '@ai-pass/shared';

export interface AgentStudioPlatformOptions {
  skillRegistry?: SkillRegistry;
  skillExecutor?: SkillExecutor;
  seed?: boolean;
}

export class AgentWizard {
  constructor(private agents: AgentService, private workflows: WorkflowService) {}

  createFromWizard(params: {
    name: string;
    description: string;
    useCaseType: string;
    agentType?: Agent['agentType'];
    inputSchema: Record<string, unknown>;
    outputSchema: Record<string, unknown>;
    skillIds: string[];
    riskLevel: StudioAgent['riskLevel'];
  }): { agent: Agent; workflow: WorkflowConfig } {
    const agent = this.agents.create({
      name: params.name,
      description: params.description,
      type: params.useCaseType,
      agentType: params.agentType ?? 'Custom',
      inputSchema: params.inputSchema,
      outputSchema: params.outputSchema,
      skillIds: params.skillIds,
      riskLevel: params.riskLevel,
      status: 'draft',
    });

    const steps: WorkflowStepDef[] = params.skillIds.map((skillId, i) => ({
      stepId: `step_${i + 1}`,
      type: 'skill' as const,
      skillId,
      nextStep: i < params.skillIds.length - 1 ? `step_${i + 2}` : undefined,
    }));

    const workflowConfig: WorkflowConfig = {
      id: `wf_${agent.id}`,
      agentId: agent.id,
      steps,
    };

    this.agents.saveVersion(agent.id, workflowConfig);
    this.workflows.create({
      agentId: agent.id,
      name: `${agent.name} Workflow`,
      steps,
      status: 'draft',
    });

    return { agent, workflow: workflowConfig };
  }
}

function loadSeed(platform: ReturnType<typeof buildPlatform>): void {
  for (const skill of DEMO_SKILLS) {
    platform.skills.register(skill);
  }

  for (const agentDef of DEMO_AGENTS) {
    const id = AGENT_ID_MAP[agentDef.type] ?? undefined;
    const agent = platform.agents.create({ ...agentDef, id });

    const steps = agentDef.skillIds.map((skillId, i) => ({
      stepId: `step_${i + 1}`,
      type: 'skill' as const,
      skillId,
      label: platform.skills.get(skillId)?.name,
      nextStep: i < agentDef.skillIds.length - 1 ? `step_${i + 2}` : undefined,
    }));

    platform.agents.saveVersion(agent.id, {
      id: `wf_${agent.id}`,
      agentId: agent.id,
      steps,
    });
  }

  for (const template of DEMO_WORKFLOW_TEMPLATES) {
    platform.workflows.create(template);
  }

  for (const exec of DEMO_EXECUTIONS) {
    platform.execution.seedExecution(exec);
  }
}

function buildPlatform(options: AgentStudioPlatformOptions) {
  const agents = new AgentService();
  const skills = new SkillService(options.skillRegistry);
  const workflows = new WorkflowService(agents);
  const planner = new PlannerService(agents);
  const evaluator = new EvaluationService();
  const monitoring = new MonitoringService();
  const execution = new ExecutionService(
    agents,
    skills,
    planner,
    evaluator,
    monitoring,
    options.skillExecutor,
  );
  const orchestrator = new MultiAgentOrchestrator();
  const publishing = new PublishingService(agents);
  const analytics = new AnalyticsService(agents, monitoring, skills);
  const wizard = new AgentWizard(agents, workflows);
  const legacyExecution = options.skillExecutor
    ? new AgentLegacyExecutionEngine(agents, options.skillExecutor)
    : undefined;

  return {
    agents,
    skills,
    workflows,
    planner,
    evaluator,
    execution,
    orchestrator,
    publishing,
    monitoring,
    analytics,
    wizard,
    legacyExecution,
    /** @deprecated Use agents */
    registry: agents,
  };
}

let _platform: ReturnType<typeof buildPlatform> | null = null;

export function createAgentStudioPlatform(options: AgentStudioPlatformOptions = { seed: true }) {
  const platform = buildPlatform(options);
  if (options.seed !== false) loadSeed(platform);
  return platform;
}

export function getAgentStudioPlatform(): ReturnType<typeof buildPlatform> {
  if (!_platform) _platform = createAgentStudioPlatform();
  return _platform;
}

export function resetAgentStudioPlatform(): void {
  _platform = null;
}

/** Backward-compatible factory used by vertical apps */
export function createAgentStudio(skillRegistry: SkillRegistry, skillExecutor: SkillExecutor) {
  const platform = createAgentStudioPlatform({ skillRegistry, skillExecutor, seed: false });
  return {
    registry: platform.agents,
    wizard: platform.wizard,
    execution: platform.legacyExecution!,
    orchestrator: platform.orchestrator,
  };
}

export type AgentStudioPlatform = ReturnType<typeof createAgentStudioPlatform>;
