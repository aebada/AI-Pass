import { jsonOk, jsonError, getGovernance } from '@/src/lib/governance-api';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  return jsonOk(getGovernance().policies.list());
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as Record<string, unknown>;
    const gov = getGovernance();
    const policy = gov.policies.create({
      name: String(body.name ?? 'New Policy'),
      version: '1.0.0',
      category: (body.category as import('@ai-pass/shared').PolicyCategory) ?? 'compliance',
      description: String(body.description ?? ''),
      rules: Array.isArray(body.rules) ? body.rules : [],
      applicableSystemTypes: Array.isArray(body.applicableSystemTypes) ? body.applicableSystemTypes : ['agent'],
      frameworks: Array.isArray(body.frameworks) ? body.frameworks : ['internal'],
      createdBy: String(body.createdBy ?? 'demo-user'),
    });
    if (body.publish) gov.policies.publish(policy.id);
    return jsonOk(policy, 201);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Policy creation failed');
  }
}
