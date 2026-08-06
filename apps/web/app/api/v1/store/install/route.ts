import { handleInstall } from '@ai-pass/store-api';
import { jsonOk, jsonError } from '@/src/lib/store-api';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const result = handleInstall(body);
    if ('error' in result) return jsonError(result.error, 'FORBIDDEN', result.status);
    return jsonOk(result.data, 201);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Install failed');
  }
}
