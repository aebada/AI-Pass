import type {
  DeepTeamClientConfig,
  DeepTeamHealthResponse,
  GuardRequest,
  GuardResponse,
  SecurityScanRequest,
  SecurityScanResponse,
} from './types.js';

function resolveBaseUrl(config?: DeepTeamClientConfig): string | undefined {
  const url = config?.baseUrl ?? process.env.DEEPTEAM_SERVICE_URL;
  return url?.replace(/\/$/, '');
}

function authHeaders(config?: DeepTeamClientConfig): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const apiKey = config?.apiKey ?? process.env.DEEPTEAM_SERVICE_API_KEY;
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`;
  return headers;
}

export class DeepTeamClient {
  constructor(private config: DeepTeamClientConfig = {}) {}

  isConfigured(): boolean {
    return Boolean(resolveBaseUrl(this.config));
  }

  async health(): Promise<DeepTeamHealthResponse> {
    const baseUrl = resolveBaseUrl(this.config);
    if (!baseUrl) throw new Error('DEEPTEAM_SERVICE_URL is not configured');

    const response = await fetch(`${baseUrl}/health`, {
      headers: authHeaders(this.config),
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      throw new Error(`DeepTeam health error ${response.status}: ${detail || response.statusText}`);
    }
    return (await response.json()) as DeepTeamHealthResponse;
  }

  async scan(request: SecurityScanRequest): Promise<SecurityScanResponse> {
    const baseUrl = resolveBaseUrl(this.config);
    if (!baseUrl) throw new Error('DEEPTEAM_SERVICE_URL is not configured');

    const timeoutMs = this.config.timeoutMs ?? 300_000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}/security/scan`, {
        method: 'POST',
        headers: authHeaders(this.config),
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`DeepTeam scan error ${response.status}: ${detail || response.statusText}`);
      }

      return (await response.json()) as SecurityScanResponse;
    } finally {
      clearTimeout(timer);
    }
  }

  async guard(request: GuardRequest): Promise<GuardResponse> {
    const baseUrl = resolveBaseUrl(this.config);
    if (!baseUrl) throw new Error('DEEPTEAM_SERVICE_URL is not configured');

    const timeoutMs = this.config.timeoutMs ?? 60_000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}/security/guard`, {
        method: 'POST',
        headers: authHeaders(this.config),
        body: JSON.stringify({
          channel: request.channel,
          text: request.text,
          pairedText: request.pairedText,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`DeepTeam guard error ${response.status}: ${detail || response.statusText}`);
      }

      return (await response.json()) as GuardResponse;
    } finally {
      clearTimeout(timer);
    }
  }
}

export const defaultDeepTeamClient = new DeepTeamClient();
