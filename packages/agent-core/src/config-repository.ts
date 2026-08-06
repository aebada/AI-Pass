import { createId } from '@ai-pass/shared';
import type { AgentConfig, AgentConfigVersion } from './types.js';

/** Persistence adapter — swap for server-side store in production */
export interface AgentConfigStorageAdapter {
  get(id: string): Promise<AgentConfig | undefined>;
  list(): Promise<AgentConfig[]>;
  save(config: AgentConfig): Promise<AgentConfig>;
  delete(id: string): Promise<boolean>;
}

/** In-memory adapter for tests and server-side bootstrap */
export class InMemoryAgentConfigStorage implements AgentConfigStorageAdapter {
  private store = new Map<string, AgentConfig>();

  async get(id: string): Promise<AgentConfig | undefined> {
    return this.store.get(id);
  }

  async list(): Promise<AgentConfig[]> {
    return [...this.store.values()];
  }

  async save(config: AgentConfig): Promise<AgentConfig> {
    this.store.set(config.id, config);
    return config;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}

const LOCAL_STORAGE_KEY = 'ai-pass-agent-configs';

function readLocalConfigs(): AgentConfig[] {
  if (typeof globalThis.localStorage === 'undefined') return [];
  try {
    const raw = globalThis.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AgentConfig[];
  } catch {
    return [];
  }
}

function writeLocalConfigs(configs: AgentConfig[]): void {
  if (typeof globalThis.localStorage === 'undefined') return;
  globalThis.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(configs));
}

/** Browser localStorage adapter for static/demo deployments */
export class LocalStorageAgentConfigAdapter implements AgentConfigStorageAdapter {
  async get(id: string): Promise<AgentConfig | undefined> {
    return readLocalConfigs().find((c) => c.id === id);
  }

  async list(): Promise<AgentConfig[]> {
    return readLocalConfigs();
  }

  async save(config: AgentConfig): Promise<AgentConfig> {
    const configs = readLocalConfigs();
    const idx = configs.findIndex((c) => c.id === config.id);
    if (idx >= 0) configs[idx] = config;
    else configs.push(config);
    writeLocalConfigs(configs);
    return config;
  }

  async delete(id: string): Promise<boolean> {
    const configs = readLocalConfigs().filter((c) => c.id !== id);
    writeLocalConfigs(configs);
    return true;
  }
}

/** Centralized Agent Configuration Repository */
export class AgentConfigurationRepository {
  constructor(private readonly storage: AgentConfigStorageAdapter) {}

  async get(id: string): Promise<AgentConfig | undefined> {
    return this.storage.get(id);
  }

  async list(filter?: { status?: AgentConfig['status']; domain?: AgentConfig['domain'] }): Promise<AgentConfig[]> {
    let all = await this.storage.list();
    if (filter?.status) all = all.filter((c) => c.status === filter.status);
    if (filter?.domain) all = all.filter((c) => c.domain === filter.domain);
    return all;
  }

  async save(config: AgentConfig): Promise<AgentConfig> {
    return this.storage.save({ ...config, updatedAt: new Date().toISOString() });
  }

  async create(input: Omit<AgentConfig, 'id' | 'createdAt' | 'updatedAt' | 'currentVersion' | 'versionHistory'> & { id?: string }): Promise<AgentConfig> {
    const now = new Date().toISOString();
    const config: AgentConfig = {
      ...input,
      id: input.id ?? `agent_${createId()}`,
      currentVersion: 1,
      versionHistory: [],
      createdAt: now,
      updatedAt: now,
    };
    return this.save(config);
  }

  async saveVersion(agentId: string, changelog?: string): Promise<AgentConfig | undefined> {
    const existing = await this.storage.get(agentId);
    if (!existing) return undefined;

    const { versionHistory: _history, ...snapshot } = existing;
    const version: AgentConfigVersion = {
      version: existing.currentVersion,
      config: snapshot,
      changelog,
      createdAt: new Date().toISOString(),
    };

    const next: AgentConfig = {
      ...existing,
      currentVersion: existing.currentVersion + 1,
      versionHistory: [...existing.versionHistory, version],
      updatedAt: new Date().toISOString(),
    };
    return this.save(next);
  }

  async delete(id: string): Promise<boolean> {
    return this.storage.delete(id);
  }

  async getVersionHistory(agentId: string): Promise<AgentConfigVersion[]> {
    const config = await this.storage.get(agentId);
    return config?.versionHistory ?? [];
  }
}

let defaultRepo: AgentConfigurationRepository | undefined;

export function getAgentConfigurationRepository(
  adapter?: AgentConfigStorageAdapter,
): AgentConfigurationRepository {
  if (!defaultRepo) {
    const storage =
      adapter ??
      (typeof globalThis.localStorage !== 'undefined'
        ? new LocalStorageAgentConfigAdapter()
        : new InMemoryAgentConfigStorage());
    defaultRepo = new AgentConfigurationRepository(storage);
  }
  return defaultRepo;
}

export function resetAgentConfigurationRepository(): void {
  defaultRepo = undefined;
}
