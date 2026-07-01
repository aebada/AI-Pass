import { jsonOk, jsonError, getGovernance } from '@/src/lib/governance-api';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  return jsonOk(getGovernance().inventory.list());
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as Record<string, unknown>;
    const gov = getGovernance();
    const system = gov.registerSystem({
      name: String(body.name ?? 'Unnamed System'),
      type: (body.type as import('@ai-pass/shared').AISystemType) ?? 'agent',
      ownerId: String(body.ownerId ?? 'demo-user'),
      department: String(body.department ?? 'General'),
      businessPurpose: String(body.businessPurpose ?? ''),
      provider: String(body.provider ?? 'AI Pass'),
      version: String(body.version ?? '1.0.0'),
      riskClassification: (body.riskClassification as import('@ai-pass/shared').RiskLevel) ?? 'medium',
      complianceStatus: 'pending_review',
      deploymentEnvironment: String(body.deploymentEnvironment ?? 'development'),
      monitoringStatus: 'active',
      connectedWorkflows: Array.isArray(body.connectedWorkflows) ? body.connectedWorkflows.map(String) : [],
    });
    return jsonOk(system, 201);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Registration failed');
  }
}
