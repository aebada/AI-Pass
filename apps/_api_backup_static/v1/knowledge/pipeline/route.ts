import { jsonOk, jsonError, getKnowledge, parseTenantId } from '@/src/lib/knowledge-api';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as {
      name?: string;
      sourceId?: string;
      templateId?: string;
      stages?: string[];
    };

    if (!body.name || !body.sourceId) {
      return jsonError('name and sourceId required');
    }

    const kp = getKnowledge();
    const pipeline = kp.pipelines.create({
      name: body.name,
      sourceId: body.sourceId,
      tenantId: parseTenantId(request),
      templateId: body.templateId,
      stages: body.stages as import('@ai-pass/shared').PipelineStage[] | undefined,
    });

    return jsonOk(pipeline, 201);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Failed to create pipeline');
  }
}
