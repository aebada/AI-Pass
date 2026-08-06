export interface DeepTeamClientConfig {
  baseUrl?: string;
  apiKey?: string;
  timeoutMs?: number;
}

export interface DeepTeamHealthResponse {
  status: string;
  engine: string;
  stub_mode: boolean;
  deepteam_installed: boolean;
  openai_configured: boolean;
}

export interface VulnerabilityResult {
  name: string;
  passRate: number;
  passed?: number;
  failed?: number;
  total?: number;
}

export interface SecurityTestCase {
  vulnerability: string;
  attack: string;
  input: string;
  output?: string;
  score?: number;
  passed?: boolean;
  reason?: string;
}

export interface SecurityScanRequest {
  systemId?: string;
  targetUrl?: string;
  framework?: string;
  vulnerabilities?: string[];
  attacks?: string[];
}

export interface SecurityScanResponse {
  scanId: string;
  mode: 'stub' | 'live';
  engine: string;
  framework?: string | null;
  targetUrl?: string | null;
  systemId?: string;
  overallPassRate: number;
  vulnerabilities: VulnerabilityResult[];
  summary: string;
  testCases: SecurityTestCase[];
  latencyMs: number;
}

export interface GuardRequest {
  channel: 'input' | 'output';
  text: string;
  pairedText?: string;
}

export interface GuardResponse {
  guardId: string;
  mode: 'stub' | 'live';
  channel: 'input' | 'output';
  breached: boolean;
  reasons: string[];
  guards: string[];
  input?: string | null;
  output?: string | null;
  latencyMs: number;
}
