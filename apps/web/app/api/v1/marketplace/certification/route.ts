import { jsonOk, getPlatform } from '@/src/lib/marketplace-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const resourceType = (searchParams.get('resourceType') ?? 'app') as 'app' | 'skill';
  const resourceId = searchParams.get('resourceId');

  if (!resourceId) {
    return jsonOk(getPlatform().certifications.listForResource('app', 'app_invoice_ai'));
  }

  return jsonOk(getPlatform().certifications.listForResource(resourceType, resourceId));
}
