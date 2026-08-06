/** Remote execution environment targets */
export type RemoteExecutionEnvironment = 'cloud' | 'edge' | 'customer' | 'worker';

export type RemoteTargetStatus = 'available' | 'degraded' | 'offline' | 'maintenance';

/** Authentication for remote agent endpoints */
export interface RemoteAuthConfig {
  type: 'api_key' | 'oauth' | 'mtls' | 'signed_jwt';
  credentialRef: string;
  scopes?: string[];
}

/** Network and latency constraints for remote execution */
export interface RemoteNetworkConfig {
  region?: string;
  maxLatencyMs?: number;
  allowedEgress?: string[];
  vpnRequired?: boolean;
}

/**
 * Remote execution target — design types for cloud, edge, customer, and worker deployments.
 * Implementation deferred to Phase 3 (see docs/AGENT-ARCHITECTURE.md).
 */
export interface RemoteExecutionTarget {
  id: string;
  name: string;
  environment: RemoteExecutionEnvironment;
  endpoint: string;
  status: RemoteTargetStatus;
  auth: RemoteAuthConfig;
  network: RemoteNetworkConfig;
  supportedAgentIds?: string[];
  maxConcurrentRuns?: number;
  metadata?: Record<string, unknown>;
}

export interface RemoteExecutionRequest {
  targetId: string;
  agentId: string;
  executionId: string;
  input: Record<string, unknown>;
  timeoutMs?: number;
  preferLocalFallback?: boolean;
}

export interface RemoteExecutionResponse {
  executionId: string;
  targetId: string;
  status: 'accepted' | 'running' | 'completed' | 'failed' | 'timeout';
  output?: Record<string, unknown>;
  error?: string;
  latencyMs?: number;
}

/** Stub executor — routes to remote targets when wired in production */
export interface RemoteAgentExecutor {
  listTargets(): RemoteExecutionTarget[];
  getTarget(id: string): RemoteExecutionTarget | undefined;
  execute(request: RemoteExecutionRequest): Promise<RemoteExecutionResponse>;
}

export class StubRemoteAgentExecutor implements RemoteAgentExecutor {
  private targets = new Map<string, RemoteExecutionTarget>();

  register(target: RemoteExecutionTarget): void {
    this.targets.set(target.id, target);
  }

  listTargets(): RemoteExecutionTarget[] {
    return [...this.targets.values()];
  }

  getTarget(id: string): RemoteExecutionTarget | undefined {
    return this.targets.get(id);
  }

  async execute(request: RemoteExecutionRequest): Promise<RemoteExecutionResponse> {
    const target = this.targets.get(request.targetId);
    if (!target) {
      return {
        executionId: request.executionId,
        targetId: request.targetId,
        status: 'failed',
        error: `Remote target not found: ${request.targetId}`,
      };
    }
    if (target.status === 'offline') {
      return {
        executionId: request.executionId,
        targetId: request.targetId,
        status: 'failed',
        error: `Remote target offline: ${target.name}`,
      };
    }
    return {
      executionId: request.executionId,
      targetId: request.targetId,
      status: 'accepted',
      output: {
        message: 'Remote execution stub — implement HTTP/gRPC bridge in Phase 3',
        environment: target.environment,
      },
    };
  }
}

export function createDefaultRemoteTargets(): RemoteExecutionTarget[] {
  return [
    {
      id: 'cloud-default',
      name: 'AI-Pass Cloud',
      environment: 'cloud',
      endpoint: 'https://agents.ai-pass.cloud/v1/execute',
      status: 'available',
      auth: { type: 'signed_jwt', credentialRef: 'aipass/agent-jwt' },
      network: { region: 'eu-central-1', maxLatencyMs: 5000 },
      maxConcurrentRuns: 100,
    },
    {
      id: 'edge-regional',
      name: 'Regional Edge Node',
      environment: 'edge',
      endpoint: 'https://edge.ai-pass.local/v1/execute',
      status: 'available',
      auth: { type: 'mtls', credentialRef: 'aipass/edge-cert' },
      network: { maxLatencyMs: 500, vpnRequired: false },
      maxConcurrentRuns: 20,
    },
    {
      id: 'customer-onprem',
      name: 'Customer On-Premises',
      environment: 'customer',
      endpoint: 'https://customer.internal/agents/v1/execute',
      status: 'maintenance',
      auth: { type: 'oauth', credentialRef: 'customer/oauth', scopes: ['agents:execute'] },
      network: { vpnRequired: true, maxLatencyMs: 10000 },
      maxConcurrentRuns: 5,
    },
    {
      id: 'worker-pool',
      name: 'Async Worker Pool',
      environment: 'worker',
      endpoint: 'queue://aipass/agents/workers',
      status: 'available',
      auth: { type: 'api_key', credentialRef: 'aipass/worker-key' },
      network: {},
      maxConcurrentRuns: 500,
    },
  ];
}
