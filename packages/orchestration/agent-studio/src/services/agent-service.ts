import { createId } from '@ai-pass/shared';
import type { Agent, AgentVersion, CreateAgentInput, WorkflowConfig } from '../types.js';

export class AgentService {
  private agents = new Map<string, Agent>();
  private versions = new Map<string, AgentVersion[]>();

  create(input: CreateAgentInput & { id?: string }): Agent {
    const now = new Date().toISOString();
    const entry: Agent = {
      ...input,
      agentType: input.agentType ?? 'Custom',
      skillIds: input.skillIds ?? [],
      id: input.id ?? `agent_${createId()}`,
      currentVersion: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.agents.set(entry.id, entry);
    return entry;
  }

  get(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  list(filter?: { status?: Agent['status']; agentType?: Agent['agentType'] }): Agent[] {
    let all = [...this.agents.values()];
    if (filter?.status) all = all.filter((a) => a.status === filter.status);
    if (filter?.agentType) all = all.filter((a) => a.agentType === filter.agentType);
    return all;
  }

  update(agentId: string, patch: Partial<Agent>): Agent | undefined {
    const existing = this.agents.get(agentId);
    if (!existing) return undefined;
    const updated = { ...existing, ...patch, updatedAt: new Date().toISOString() };
    this.agents.set(agentId, updated);
    return updated;
  }

  delete(agentId: string): boolean {
    return this.agents.delete(agentId);
  }

  clone(agentId: string, name?: string): Agent | undefined {
    const source = this.agents.get(agentId);
    if (!source) return undefined;
    const clone = this.create({
      ...source,
      name: name ?? `${source.name} (Copy)`,
      status: 'draft',
      publishedVersion: undefined,
      marketplaceListingId: undefined,
    });
    const latest = this.getLatestVersion(agentId);
    if (latest) this.saveVersion(clone.id, latest.workflowConfig, 'Cloned from source');
    return clone;
  }

  archive(agentId: string): Agent | undefined {
    return this.update(agentId, { status: 'archived' });
  }

  saveVersion(agentId: string, workflowConfig: WorkflowConfig, changelog?: string): AgentVersion {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent not found: ${agentId}`);

    const version: AgentVersion = {
      agentId,
      versionNumber: agent.currentVersion + 1,
      workflowConfig,
      changelog,
      createdAt: new Date().toISOString(),
    };

    const existing = this.versions.get(agentId) ?? [];
    existing.push(version);
    this.versions.set(agentId, existing);
    this.agents.set(agentId, {
      ...agent,
      currentVersion: version.versionNumber,
      updatedAt: version.createdAt,
    });
    return version;
  }

  getVersions(agentId: string): AgentVersion[] {
    return this.versions.get(agentId) ?? [];
  }

  getLatestVersion(agentId: string): AgentVersion | undefined {
    const versions = this.versions.get(agentId);
    return versions?.[versions.length - 1];
  }

  publish(agentId: string, versionNumber?: number): Agent | undefined {
    const agent = this.agents.get(agentId);
    if (!agent) return undefined;
    const version = versionNumber ?? agent.currentVersion;
    return this.update(agentId, {
      status: 'active',
      publishedVersion: version,
      marketplaceListingId: agent.marketplaceListingId ?? `listing_${agentId}`,
    });
  }

  share(agentId: string, tenantIds: string[]): Agent | undefined {
    const agent = this.agents.get(agentId);
    if (!agent) return undefined;
    const shared = new Set([...(agent.sharedWith ?? []), ...tenantIds]);
    return this.update(agentId, { sharedWith: [...shared] });
  }

  count(): number {
    return this.agents.size;
  }
}

/** @deprecated Use AgentService */
export class AgentRegistry extends AgentService {}
