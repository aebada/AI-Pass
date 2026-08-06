import { handleDeveloper } from '@ai-pass/store-api';
import { jsonOk, jsonError } from '@/src/lib/store-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get('id') ?? undefined;
  const result = handleDeveloper(id);
  if ('error' in result) return jsonError(result.error, 'NOT_FOUND', result.status);
  return jsonOk(result.data);
}
