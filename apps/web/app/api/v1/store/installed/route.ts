import { handleInstalled } from '@ai-pass/store-api';
import { jsonOk } from '@/src/lib/store-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const tenantId = new URL(request.url).searchParams.get('tenantId') ?? 'default';
  return jsonOk(handleInstalled(tenantId).data);
}
