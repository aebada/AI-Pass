/** Shared API conventions for AI Pass Platform */

export const API_VERSION = 'v1';
export const API_BASE = `/api/${API_VERSION}`;

export interface ApiResponse<T> {
  data: T;
  meta?: ApiMeta;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface ApiMeta {
  requestId: string;
  timestamp: string;
  version: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: ApiMeta & {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  uptime: number;
  modules: number;
}

export interface ModulesListResponse {
  modules: Array<{
    id: string;
    name: string;
    route: string;
    status: string;
    tier: string;
  }>;
}

export function createMeta(): ApiMeta {
  return {
    requestId: `req_${Date.now().toString(36)}`,
    timestamp: new Date().toISOString(),
    version: API_VERSION,
  };
}

export function ok<T>(data: T): ApiResponse<T> {
  return { data, meta: createMeta() };
}
