import type { McpServerConfig } from '@ai-pass/shared';

export function loadMcpConfig(raw: unknown): McpServerConfig[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(isValidMcpConfig);
}

function isValidMcpConfig(item: unknown): item is McpServerConfig {
  if (!item || typeof item !== 'object') return false;
  const obj = item as Record<string, unknown>;
  return (
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.command === 'string' &&
    typeof obj.enabled === 'boolean'
  );
}

export const DEFAULT_MCP_CONFIG: McpServerConfig[] = [];
