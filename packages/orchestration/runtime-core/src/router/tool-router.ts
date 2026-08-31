import type { MembershipTier } from '@ai-pass/shared';
import {
  defaultRoutingEngine,
  defaultHealthMonitor,
  type RoutingCriteria,
  type RoutingDecision,
  type TaskType as ProviderTaskType,
} from '@ai-pass/provider-hub';
import type { Task } from '../types.js';

export interface RoutingPreferences {
  preferQuality?: boolean;
  preferSpeed?: boolean;
  preferCost?: boolean;
  membershipTier?: MembershipTier;
  orgId?: string;
  region?: string;
  preferredModelId?: string;
}

export interface ToolRouteDecision {
  taskId: string;
  skillId?: string;
  toolId?: string;
  providerId?: string;
  modelId?: string;
  workflowId?: string;
  automationId?: string;
  reason: string;
  fallbackModelIds: string[];
  estimatedLatencyMs: number;
  estimatedCredits: number;
  available: boolean;
}

function mapTaskToProviderType(task: Task): ProviderTaskType {
  if (task.type === 'model') return 'agent';
  if (task.skillId?.includes('rag') || task.skillId?.includes('retrieval')) return 'reasoning';
  if (task.skillId?.includes('parse') || task.skillId?.includes('ocr')) return 'completion';
  return 'agent';
}

/**
 * Tool Router — ALL execution routes through here.
 * Selects skill, provider, model, workflow, or automation based on criteria.
 */
export class ToolRouter {
  constructor(
    private routingEngine = defaultRoutingEngine,
    private healthMonitor = defaultHealthMonitor,
  ) {}

  routeTool(task: Task, prefs: RoutingPreferences = {}): ToolRouteDecision {
    const health = this.healthMonitor.checkAll();
    const degradedProviders = new Set(
      health.filter((h) => h.status === 'degraded').map((h) => h.providerId),
    );

    if (task.type === 'skill' && task.skillId) {
      return {
        taskId: task.id,
        skillId: task.skillId,
        reason: `Routed to skill ${task.skillId}`,
        fallbackModelIds: [],
        estimatedLatencyMs: 800,
        estimatedCredits: task.estimatedCredits,
        available: true,
      };
    }

    if (task.type === 'workflow' && task.workflowId) {
      return {
        taskId: task.id,
        workflowId: task.workflowId,
        reason: `Routed to workflow ${task.workflowId}`,
        fallbackModelIds: [],
        estimatedLatencyMs: 1200,
        estimatedCredits: task.estimatedCredits,
        available: true,
      };
    }

    if (task.type === 'automation' && task.automationId) {
      return {
        taskId: task.id,
        automationId: task.automationId,
        reason: `Routed to automation ${task.automationId}`,
        fallbackModelIds: [],
        estimatedLatencyMs: 1500,
        estimatedCredits: task.estimatedCredits,
        available: true,
      };
    }

    if (task.type === 'action') {
      return {
        taskId: task.id,
        toolId: 'action-engine',
        reason: 'Routed to action-engine (sandbox)',
        fallbackModelIds: [],
        estimatedLatencyMs: 2000,
        estimatedCredits: task.estimatedCredits,
        available: true,
      };
    }

    const criteria: RoutingCriteria = {
      taskType: mapTaskToProviderType(task),
      membershipTier: prefs.membershipTier ?? 'professional',
      orgId: prefs.orgId,
      preferQuality: prefs.preferQuality,
      preferSpeed: prefs.preferSpeed,
      preferCost: prefs.preferCost,
      preferredModelId: prefs.preferredModelId,
    };

    const decision: RoutingDecision = this.routingEngine.select(criteria);
    const providerDegraded = degradedProviders.has(decision.model.providerId);

    const fallbacks = decision.fallbackModelIds.filter((id) => {
      const entry = decision.model;
      return id !== entry.id;
    });

    let reason = decision.reason;
    if (prefs.region) reason += ` · region=${prefs.region}`;
    if (providerDegraded) reason += ' · provider degraded, fallback chain active';

    const latencyBase = decision.model.speed === 'fast' ? 400 : decision.model.speed === 'quality' ? 2200 : 900;

    return {
      taskId: task.id,
      providerId: decision.model.providerId,
      modelId: decision.model.id,
      reason,
      fallbackModelIds: fallbacks,
      estimatedLatencyMs: latencyBase,
      estimatedCredits: task.estimatedCredits,
      available: decision.model.availability !== 'unavailable',
    };
  }

  routeAll(tasks: Task[], prefs?: RoutingPreferences): ToolRouteDecision[] {
    return tasks.map((t) => this.routeTool(t, prefs));
  }
}

export const defaultToolRouter = new ToolRouter();

/** Enforced entry point — callers must use this instead of direct provider calls */
export function routeTool(task: Task, prefs?: RoutingPreferences): ToolRouteDecision {
  return defaultToolRouter.routeTool(task, prefs);
}

export { mapTaskToProviderType as hubTaskType };
