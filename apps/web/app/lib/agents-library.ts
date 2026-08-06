import {
  createAgentConfigFromWizard,
  getAgentRegistry,
  type AgentRegistryEntry,
} from '@ai-pass/agent-core';
import type { RiskLevel } from '@ai-pass/shared';

/** Wizard-focused agent shape — maps to canonical AgentConfig via createAgentConfigFromWizard */
export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  agentType: string;
  inputSchema: string;
  outputSchema: string;
  modelId: string;
  skillIds: string[];
  riskLevel: string;
  status: 'draft' | 'active';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  publishedVersion?: number;
}

export type { AgentRegistryEntry };

export interface AgentWizardForm {
  name: string;
  description: string;
  agentType: string;
  inputSchema: string;
  outputSchema: string;
  modelId: string;
  skillIds: string[];
  riskLevel: string;
}

export interface AgentWizardState {
  step: number;
  agentId?: string;
  form: AgentWizardForm;
}

const DRAFTS_KEY = 'ai-pass-agents-drafts';
const PUBLISHED_KEY = 'ai-pass-agents-published';
const WIZARD_KEY = 'ai-pass-agent-wizard-state';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

function isJsonResponse(res: Response): boolean {
  const type = res.headers.get('content-type') ?? '';
  return type.includes('application/json') || type.includes('text/json');
}

export async function isAgentsApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch('/api/v1/agents/skills', { cache: 'no-store' });
    return res.ok && isJsonResponse(res);
  } catch {
    return false;
  }
}

export function loadDraftAgents(): AgentConfig[] {
  return readJson<AgentConfig[]>(DRAFTS_KEY, []);
}

export function loadPublishedAgents(): AgentConfig[] {
  return readJson<AgentConfig[]>(PUBLISHED_KEY, []);
}

export function loadAllLocalAgents(): AgentConfig[] {
  const byId = new Map<string, AgentConfig>();
  for (const agent of [...loadDraftAgents(), ...loadPublishedAgents()]) {
    byId.set(agent.id, agent);
  }
  return [...byId.values()].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export function getLocalAgent(id: string): AgentConfig | undefined {
  return loadAllLocalAgents().find((a) => a.id === id);
}

function saveDraftList(agents: AgentConfig[]): void {
  writeJson(DRAFTS_KEY, agents);
}

function savePublishedList(agents: AgentConfig[]): void {
  writeJson(PUBLISHED_KEY, agents);
}

export function saveAgentDraft(input: {
  id?: string;
  form: AgentWizardForm;
}): AgentConfig {
  const now = new Date().toISOString();
  const drafts = loadDraftAgents();
  const published = loadPublishedAgents();
  const existing =
    (input.id ? drafts.find((a) => a.id === input.id) : undefined) ??
    (input.id ? published.find((a) => a.id === input.id) : undefined);

  const agent: AgentConfig = {
    id: existing?.id ?? `agent_${Date.now()}`,
    name: input.form.name.trim() || 'Untitled agent',
    description: input.form.description.trim(),
    agentType: input.form.agentType,
    inputSchema: input.form.inputSchema,
    outputSchema: input.form.outputSchema,
    modelId: input.form.modelId,
    skillIds: input.form.skillIds,
    riskLevel: input.form.riskLevel,
    status: 'draft',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    publishedAt: existing?.publishedAt,
    publishedVersion: existing?.publishedVersion,
  };

  const nextDrafts = existing
    ? drafts.some((a) => a.id === agent.id)
      ? drafts.map((a) => (a.id === agent.id ? agent : a))
      : [...drafts.filter((a) => a.id !== agent.id), agent]
    : [...drafts, agent];

  saveDraftList(nextDrafts);
  savePublishedList(published.filter((a) => a.id !== agent.id));
  syncAgentToRegistry(agent);
  return agent;
}

export function publishLocalAgent(input: {
  id?: string;
  form: AgentWizardForm;
}): AgentConfig {
  const now = new Date().toISOString();
  const drafts = loadDraftAgents();
  const published = loadPublishedAgents();
  const existing =
    (input.id ? drafts.find((a) => a.id === input.id) : undefined) ??
    (input.id ? published.find((a) => a.id === input.id) : undefined) ??
    (input.id ? getLocalAgent(input.id) : undefined);

  const nextVersion = (existing?.publishedVersion ?? 0) + 1;

  const agent: AgentConfig = {
    id: existing?.id ?? `agent_${Date.now()}`,
    name: input.form.name.trim() || 'Untitled agent',
    description: input.form.description.trim(),
    agentType: input.form.agentType,
    inputSchema: input.form.inputSchema,
    outputSchema: input.form.outputSchema,
    modelId: input.form.modelId,
    skillIds: input.form.skillIds,
    riskLevel: input.form.riskLevel,
    status: 'active',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    publishedAt: now,
    publishedVersion: nextVersion,
  };

  saveDraftList(drafts.filter((a) => a.id !== agent.id));
  const nextPublished = published.some((a) => a.id === agent.id)
    ? published.map((a) => (a.id === agent.id ? agent : a))
    : [...published, agent];
  savePublishedList(nextPublished);
  syncAgentToRegistry(agent);
  return agent;
}

/** Register wizard agent in agent-core registry (client-side, no UI change) */
function syncAgentToRegistry(agent: AgentConfig): void {
  if (typeof window === 'undefined') return;
  const canonical = createAgentConfigFromWizard({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    agentType: agent.agentType,
    inputSchema: agent.inputSchema,
    outputSchema: agent.outputSchema,
    modelId: agent.modelId,
    skillIds: agent.skillIds,
    riskLevel: agent.riskLevel as RiskLevel,
    status: agent.status,
  });
  if (agent.publishedVersion) {
    canonical.currentVersion = agent.publishedVersion;
    canonical.publishedAt = agent.publishedAt;
    canonical.trustScore = 75;
  }
  getAgentRegistry().register(canonical, { source: 'local' });
}

export function loadRegistryEntries(): AgentRegistryEntry[] {
  if (typeof window === 'undefined') return [];
  for (const agent of loadAllLocalAgents()) {
    syncAgentToRegistry(agent);
  }
  return getAgentRegistry().list();
}

export function loadWizardState(): AgentWizardState | null {
  return readJson<AgentWizardState | null>(WIZARD_KEY, null);
}

export function saveWizardState(state: AgentWizardState): void {
  writeJson(WIZARD_KEY, state);
}

export function clearWizardState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(WIZARD_KEY);
}

export const DEFAULT_WIZARD_FORM: AgentWizardForm = {
  name: '',
  description: '',
  agentType: 'Custom',
  inputSchema: '{"type":"object","properties":{"query":{"type":"string"}}}',
  outputSchema: '{"type":"object","properties":{"decision":{"type":"string"}}}',
  modelId: 'auto-standard',
  skillIds: [],
  riskLevel: 'medium',
};
