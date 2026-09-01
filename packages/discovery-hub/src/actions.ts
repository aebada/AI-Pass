import type { RoutingPreference, Tool, ToolAction } from './types.js';

/**
 * Profile actions that connect Discovery → Store → Workflows → Agents → Playground → Routing.
 * This is the differentiator vs static directories (Aixploria / Futurepedia).
 */
export function getToolActions(tool: Tool, opts?: { orgId?: string }): ToolAction[] {
  const comparePeer = '';
  const actions: ToolAction[] = [
    {
      id: 'install',
      label: tool.source === 'marketplace' ? 'Install' : 'Connect',
      href: tool.storeRoute,
      primary: true,
      requiresAuth: true,
    },
    {
      id: 'connect',
      label: 'Connect API',
      href: `/workspace/discover/connect?tool=${encodeURIComponent(tool.slug)}`,
      requiresAuth: true,
    },
    {
      id: 'add_to_workflow',
      label: 'Add to Workflow',
      href: `/workspace/workflows?addTool=${encodeURIComponent(tool.slug)}`,
      requiresAuth: true,
    },
    {
      id: 'add_as_agent_skill',
      label: 'Add as Agent Skill',
      href: `/workspace/agents/studio?skillFrom=${encodeURIComponent(tool.slug)}`,
      requiresAuth: true,
    },
    {
      id: 'compare',
      label: 'Compare',
      href: `/discover/compare?ids=${encodeURIComponent(tool.id)}${comparePeer}`,
    },
    {
      id: 'benchmark',
      label: 'Benchmark',
      href: `/discover/benchmarks?tool=${encodeURIComponent(tool.slug)}`,
    },
    {
      id: 'open_playground',
      label: 'Test in Playground',
      href: `/workspace/playground?models=${encodeURIComponent(tool.modelsUsed[0] ?? tool.slug)}`,
      requiresAuth: true,
    },
    {
      id: 'configure_routing',
      label: 'Configure Routing',
      href: `/workspace/providers?routeTool=${encodeURIComponent(tool.slug)}`,
      requiresAuth: true,
    },
    {
      id: 'save_to_collection',
      label: 'Save to Collection',
      href: `/discover/collections?save=${encodeURIComponent(tool.slug)}`,
      requiresAuth: true,
    },
    {
      id: 'request_approval',
      label: 'Request Approval',
      href: `/workspace/discover/enterprise?request=${encodeURIComponent(tool.slug)}${
        opts?.orgId ? `&org=${encodeURIComponent(opts.orgId)}` : ''
      }`,
      requiresAuth: true,
      requiresEnterprise: true,
    },
  ];

  return actions;
}

export const ROUTING_PREFERENCES: Array<{ id: RoutingPreference; label: string; description: string }> = [
  { id: 'fixed_provider', label: 'Fixed provider', description: 'Always use a selected provider for this tool.' },
  { id: 'automatic', label: 'Automatic routing', description: 'AI-Pass Routing Engine picks the best provider.' },
  { id: 'lowest_cost', label: 'Lowest cost', description: 'Prefer cheapest compliant route.' },
  { id: 'lowest_latency', label: 'Lowest latency', description: 'Prefer fastest responding route.' },
  { id: 'highest_quality', label: 'Highest quality', description: 'Prefer top benchmark / trust routes.' },
  { id: 'local_only', label: 'Local-only', description: 'Restrict to local / on-prem deployments.' },
  { id: 'compliance_based', label: 'Compliance-based', description: 'Route only through policy-compliant providers.' },
];
