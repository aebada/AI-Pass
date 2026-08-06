import type { AgentConfig, AgentRegistryEntry, AgentUsageStats } from './types.js';
import { AgentConfigurationRepository, InMemoryAgentConfigStorage } from './config-repository.js';

export interface AgentRegistryFilter {
  status?: AgentConfig['status'];
  domain?: AgentConfig['domain'];
  source?: AgentRegistryEntry['source'];
  minTrustScore?: number;
}

function defaultUsage(): AgentUsageStats {
  return {
    executionCount: 0,
    successCount: 0,
    failureCount: 0,
    avgLatencyMs: 0,
    avgConfidence: 0,
    totalCreditsUsed: 0,
    totalCostUsd: 0,
  };
}

function toRegistryEntry(config: AgentConfig, overrides?: Partial<AgentRegistryEntry>): AgentRegistryEntry {
  return {
    config,
    installedVersion: config.currentVersion,
    supportedModelIds: [
      config.model.primaryModelId,
      ...(config.model.fallbackModelIds ?? []),
    ],
    skillIds: config.skills.map((s) => s.skillId),
    dependencies: [
      ...config.skills.map((s) => `skill:${s.skillId}`),
      ...config.tools.toolIds.map((t) => `tool:${t}`),
      ...(config.workflowId ? [`workflow:${config.workflowId}`] : []),
    ],
    trustScore: config.trustScore ?? 75,
    usage: defaultUsage(),
    source: 'local',
    ...overrides,
  };
}

/**
 * Agent Registry — expands Agent Studio with installed agents, versions, trust, and usage.
 * Backed by AgentConfigurationRepository; usage stats updated by ObservabilityCollector.
 */
export class AgentRegistry {
  private entries = new Map<string, AgentRegistryEntry>();

  constructor(private readonly configRepo?: AgentConfigurationRepository) {}

  register(config: AgentConfig, overrides?: Partial<AgentRegistryEntry>): AgentRegistryEntry {
    const entry = toRegistryEntry(config, overrides);
    this.entries.set(config.id, entry);
    return entry;
  }

  unregister(agentId: string): boolean {
    return this.entries.delete(agentId);
  }

  get(agentId: string): AgentRegistryEntry | undefined {
    return this.entries.get(agentId);
  }

  list(filter?: AgentRegistryFilter): AgentRegistryEntry[] {
    let all = [...this.entries.values()];
    if (filter?.status) all = all.filter((e) => e.config.status === filter.status);
    if (filter?.domain) all = all.filter((e) => e.config.domain === filter.domain);
    if (filter?.source) all = all.filter((e) => e.source === filter.source);
    if (filter?.minTrustScore != null) all = all.filter((e) => e.trustScore >= filter.minTrustScore!);
    return all;
  }

  updateUsage(agentId: string, patch: Partial<AgentUsageStats>): AgentRegistryEntry | undefined {
    const entry = this.entries.get(agentId);
    if (!entry) return undefined;
    const usage = { ...entry.usage, ...patch };
    const updated = { ...entry, usage, trustScore: entry.trustScore };
    this.entries.set(agentId, updated);
    return updated;
  }

  recordExecution(agentId: string, result: { success: boolean; latencyMs: number; confidence: number; creditsUsed: number; costUsd: number }): void {
    const entry = this.entries.get(agentId);
    if (!entry) return;

    const u = entry.usage;
    const count = u.executionCount + 1;
    const successCount = u.successCount + (result.success ? 1 : 0);
    const failureCount = u.failureCount + (result.success ? 0 : 1);

    this.updateUsage(agentId, {
      executionCount: count,
      successCount,
      failureCount,
      avgLatencyMs: (u.avgLatencyMs * u.executionCount + result.latencyMs) / count,
      avgConfidence: (u.avgConfidence * u.executionCount + result.confidence) / count,
      totalCreditsUsed: u.totalCreditsUsed + result.creditsUsed,
      totalCostUsd: u.totalCostUsd + result.costUsd,
      lastExecutedAt: new Date().toISOString(),
    });
  }

  /** Hydrate registry from configuration repository */
  async syncFromConfigRepo(repo?: AgentConfigurationRepository): Promise<number> {
    const repository = repo ?? this.configRepo ?? new AgentConfigurationRepository(new InMemoryAgentConfigStorage());
    const configs = await repository.list();
    for (const config of configs) {
      this.register(config);
    }
    return configs.length;
  }

  count(): number {
    return this.entries.size;
  }
}

let defaultRegistry: AgentRegistry | undefined;

export function getAgentRegistry(): AgentRegistry {
  if (!defaultRegistry) defaultRegistry = new AgentRegistry();
  return defaultRegistry;
}

export function resetAgentRegistry(): void {
  defaultRegistry = undefined;
}
