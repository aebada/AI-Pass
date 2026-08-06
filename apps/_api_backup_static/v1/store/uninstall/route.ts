import { handleUninstall } from '@ai-pass/store-api';
import { jsonOk, jsonError } from '@/src/lib/store-api';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  const body = await request.json() as { installationId?: string; tenantId?: string };
  if (!body.installationId || !body.tenantId) {
    return jsonError('installationId and tenantId required');
  }
  const result = handleUninstall({ installationId: body.installationId, tenantId: body.tenantId });
  if ('error' in result) return jsonError(result.error, 'NOT_FOUND', result.status);
  return jsonOk(result.data);
}
