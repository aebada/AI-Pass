import { handleGetApp } from '@ai-pass/store-api';
import { jsonOk, jsonError } from '@/src/lib/store-api';

export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await params;
  const result = handleGetApp(id);
  if ('error' in result) return jsonError(result.error, 'NOT_FOUND', result.status);
  return jsonOk(result.data);
}
