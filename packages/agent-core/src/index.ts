export type {
  AgentConfig,
  AgentConfigVersion,
  AgentDomain,
  AgentDeploymentStatus,
  AgentExecutionContext,
  AgentLifecycle,
  AgentLifecyclePhase,
  AgentMemoryConfig,
  AgentMcpConfig,
  AgentModelConfig,
  AgentModerationConfig,
  AgentPermissions,
  AgentRegistryEntry,
  AgentRoutingRule,
  AgentSkillBinding,
  AgentStepResult,
  AgentToolConfig,
  AgentUsageStats,
  ObservabilityMetrics,
} from './types.js';

export { AbstractAgent } from './agent-interface.js';
export type { IAgent, AgentLogger } from './agent-interface.js';

export {
  GenericAgent,
  InvoiceAgent,
  HrAgent,
  SupplyChainAgent,
  createDomainAgent,
} from './generic-agent.js';

export {
  AgentConfigurationRepository,
  InMemoryAgentConfigStorage,
  LocalStorageAgentConfigAdapter,
  getAgentConfigurationRepository,
  resetAgentConfigurationRepository,
} from './config-repository.js';
export type { AgentConfigStorageAdapter } from './config-repository.js';

export {
  AgentRegistry,
  getAgentRegistry,
  resetAgentRegistry,
} from './registry.js';
export type { AgentRegistryFilter } from './registry.js';

export {
  AgentObservabilityCollector,
  getAgentObservabilityCollector,
  resetAgentObservabilityCollector,
} from './observability.js';
export type { ObservabilityEvent, ObservabilityCollectorOptions } from './observability.js';

export {
  StubRemoteAgentExecutor,
  createDefaultRemoteTargets,
} from './remote-executor.js';
export type {
  RemoteAgentExecutor,
  RemoteAuthConfig,
  RemoteExecutionEnvironment,
  RemoteExecutionRequest,
  RemoteExecutionResponse,
  RemoteExecutionTarget,
  RemoteNetworkConfig,
  RemoteTargetStatus,
} from './remote-executor.js';

/** Map wizard/UI agent type strings to AgentDomain */
export function mapAgentTypeToDomain(agentType: string): import('./types.js').AgentDomain {
  const normalized = agentType.toLowerCase().replace(/\s+/g, '-');
  const map: Record<string, import('./types.js').AgentDomain> = {
    finance: 'finance',
    procurement: 'procurement',
    compliance: 'compliance',
    'customer-support': 'customer-support',
    'supply-chain': 'supply-chain',
    hr: 'hr',
    invoice: 'invoice',
    sales: 'sales',
    research: 'research',
    custom: 'custom',
    decision: 'generic',
    document: 'generic',
    analysis: 'generic',
    workflow: 'generic',
    automation: 'generic',
  };
  return map[normalized] ?? 'generic';
}

/** Build minimal AgentConfig from wizard-style fields (Agent Studio new-agent flow) */
export function createAgentConfigFromWizard(input: {
  id?: string;
  name: string;
  description: string;
  agentType: string;
  inputSchema: string | Record<string, unknown>;
  outputSchema: string | Record<string, unknown>;
  modelId: string;
  skillIds: string[];
  riskLevel: import('@ai-pass/shared').RiskLevel;
  status?: import('./types.js').AgentDeploymentStatus;
}): import('./types.js').AgentConfig {
  const now = new Date().toISOString();
  const parseSchema = (s: string | Record<string, unknown>) =>
    typeof s === 'string' ? (JSON.parse(s) as Record<string, unknown>) : s;

  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'agent';

  return {
    id: input.id ?? `agent_${Date.now()}`,
    name: input.name,
    slug,
    description: input.description,
    domain: mapAgentTypeToDomain(input.agentType),
    status: input.status ?? 'draft',
    model: { primaryModelId: input.modelId },
    mcp: { serverIds: [] },
    skills: input.skillIds.map((skillId) => ({ skillId })),
    moderation: { enabled: true, maxRiskLevel: input.riskLevel },
    memory: { enabled: false },
    env: {},
    routingRules: [],
    permissions: { scopes: ['agents:run'] },
    tools: { toolIds: [] },
    inputSchema: parseSchema(input.inputSchema),
    outputSchema: parseSchema(input.outputSchema),
    riskLevel: input.riskLevel,
    currentVersion: 1,
    versionHistory: [],
    createdAt: now,
    updatedAt: now,
  };
}
