import { createId } from '@ai-pass/shared';
import type { SolutionSpec } from '@ai-pass/builder';

export type RuntimeStatus = 'idle' | 'running' | 'paused' | 'error';

export interface RuntimeInstance {
  id: string;
  solutionId: string;
  status: RuntimeStatus;
  deployedAt?: string;
  url?: string;
  auditLog: AuditEntry[];
}

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: string;
  details: Record<string, unknown>;
}

export class SolutionRuntime {
  private instances = new Map<string, RuntimeInstance>();

  deploy(solution: SolutionSpec, actor = 'system'): RuntimeInstance {
    const instance: RuntimeInstance = {
      id: `rt_${createId()}`,
      solutionId: solution.id,
      status: 'running',
      deployedAt: new Date().toISOString(),
      url: `/preview/${solution.id}`,
      auditLog: [
        {
          id: `aud_${createId()}`,
          action: 'deploy',
          actor,
          timestamp: new Date().toISOString(),
          details: { solutionName: solution.name, platforms: solution.platforms },
        },
      ],
    };
    this.instances.set(instance.id, instance);
    return instance;
  }

  get(instanceId: string): RuntimeInstance | undefined {
    return this.instances.get(instanceId);
  }

  getBySolution(solutionId: string): RuntimeInstance | undefined {
    return [...this.instances.values()].find((i) => i.solutionId === solutionId);
  }

  log(instanceId: string, action: string, actor: string, details: Record<string, unknown>): AuditEntry | undefined {
    const instance = this.instances.get(instanceId);
    if (!instance) return undefined;
    const entry: AuditEntry = {
      id: `aud_${createId()}`,
      action,
      actor,
      timestamp: new Date().toISOString(),
      details,
    };
    instance.auditLog.push(entry);
    return entry;
  }

  list(): RuntimeInstance[] {
    return [...this.instances.values()];
  }
}

export function createSolutionRuntime() {
  return new SolutionRuntime();
}
