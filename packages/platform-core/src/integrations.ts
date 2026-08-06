/**
 * Registry and client for the external AI-Pass ecosystem deployments.
 *
 * Each service exposes the same contract:
 *   GET /api/v1/health  — public liveness probe, no key required
 *   GET /api/v1/meta    — capability descriptor, requires the shared key
 *   plus service-specific read endpoints
 *
 * Requests must be made server-side. None of these deployments send CORS
 * headers, and aipass.space itself ships as a static export, so a browser
 * cannot call them directly — see services/auth-api for the proxy.
 */

export type IntegrationAuthMode = 'bearer' | 'none';

export interface IntegrationDefinition {
  id: string;
  label: string;
  /** Public site root. */
  url: string;
  description: string;
  icon: string;
  /** API root; defaults to `${url}/api/v1`. */
  apiBaseUrl: string;
  authMode: IntegrationAuthMode;
  /** Env var holding the shared secret for this service. */
  apiKeyEnv: string;
  /** Read endpoints below apiBaseUrl, excluding health/meta. */
  endpoints: string[];
  /** Related in-platform module route, when one exists. */
  moduleRoute?: string;
}

export const INTEGRATIONS: IntegrationDefinition[] = [
  {
    id: 'invoice-ai',
    label: 'Invoice AI',
    url: 'https://invoice.ehopn.com',
    description: 'Autonomous finance operations — extraction, validation, approvals.',
    icon: 'receipt',
    apiBaseUrl: 'https://invoice.ehopn.com/api/v1',
    authMode: 'bearer',
    apiKeyEnv: 'INVOICE_AI_API_KEY',
    endpoints: ['invoices', 'invoices/{id}', 'stats'],
    moduleRoute: '/workspace/apps/invoice-ai',
  },
  {
    id: 'carbon',
    label: 'Carbon',
    url: 'https://carbon.ehopn.com',
    description: 'Text humanization and AI-detection checks.',
    icon: 'layers',
    apiBaseUrl: 'https://carbon.ehopn.com/api/v1',
    authMode: 'bearer',
    apiKeyEnv: 'CARBON_API_KEY',
    endpoints: ['styles', 'humanize', 'check'],
  },
  {
    id: 'sovra-ai',
    // Note: the previous registry pointed at sovraaai.de (three a's), which has
    // no DNS record. The live deployment is sovraai.de.
    label: 'Sovra AI',
    url: 'https://sovraai.de',
    description: 'Sovereign intelligence — private hardware and deployment orders.',
    icon: 'sparkles',
    apiBaseUrl: 'https://sovraai.de/api/v1',
    authMode: 'bearer',
    apiKeyEnv: 'SOVRA_AI_API_KEY',
    endpoints: ['orders', 'stats'],
  },
];

export function getIntegration(id: string): IntegrationDefinition | undefined {
  return INTEGRATIONS.find((i) => i.id === id);
}

export interface IntegrationHealth {
  id: string;
  reachable: boolean;
  status: 'ok' | 'degraded' | 'unreachable';
  /** Whether the remote reports a key configured on its side. */
  apiConfigured?: boolean;
  httpStatus?: number;
  latencyMs?: number;
  error?: string;
}

/**
 * Probes a service's public health endpoint.
 *
 * Never throws: a dashboard that renders "unreachable" is more useful than one
 * that fails to render. `fetchImpl` is injectable so callers can supply a
 * timeout-bound or instrumented fetch.
 */
export async function checkIntegrationHealth(
  integration: IntegrationDefinition,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = 8000,
): Promise<IntegrationHealth> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchImpl(`${integration.apiBaseUrl}/health`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    const latencyMs = Date.now() - started;

    let body: { status?: string; api_configured?: boolean } = {};
    try {
      body = (await res.json()) as typeof body;
    } catch {
      // A non-JSON body still tells us the host answered.
    }

    return {
      id: integration.id,
      reachable: true,
      status: res.ok && body.status === 'ok' ? 'ok' : 'degraded',
      apiConfigured: body.api_configured,
      httpStatus: res.status,
      latencyMs,
    };
  } catch (err) {
    return {
      id: integration.id,
      reachable: false,
      status: 'unreachable',
      latencyMs: Date.now() - started,
      error: err instanceof Error ? err.message : 'Request failed',
    };
  } finally {
    clearTimeout(timer);
  }
}
