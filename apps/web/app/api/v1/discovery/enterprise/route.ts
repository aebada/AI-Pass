import { jsonOk, jsonError, getDiscoveryHub } from '@/src/lib/discovery-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const hub = getDiscoveryHub();
  const orgId = searchParams.get('org') ?? 'demo-org';
  const toolId = searchParams.get('tool');

  if (toolId) {
    const tool = hub.discovery.getTool(toolId);
    if (!tool) return jsonError('Tool not found', 'NOT_FOUND', 404);
    return jsonOk({
      orgId,
      tool,
      policy: hub.enterprise.getPolicy(orgId),
      access: hub.enterprise.isAllowed(orgId, tool),
    });
  }

  return jsonOk({
    orgId,
    policy: hub.enterprise.getPolicy(orgId),
    approved: hub.enterprise.listApproved(orgId),
    report: hub.enterprise.report(orgId),
  });
}

export async function POST(request: Request): Promise<Response> {
  const hub = getDiscoveryHub();
  const body = (await request.json().catch(() => ({}))) as {
    orgId?: string;
    toolId?: string;
    action?: 'approve' | 'block';
  };

  if (!body.toolId || !body.action) {
    return jsonError('toolId and action (approve|block) required', 'MISSING_PARAMS', 400);
  }

  const orgId = body.orgId ?? 'demo-org';
  const policy =
    body.action === 'approve'
      ? hub.enterprise.approve(orgId, body.toolId)
      : hub.enterprise.block(orgId, body.toolId);

  return jsonOk({ policy, report: hub.enterprise.report(orgId) });
}
