import { jsonOk } from '@/src/lib/governance-api';

export const runtime = 'nodejs';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const system = (await import('@/src/lib/governance-api')).getGovernance().inventory.get(id);
  if (!system) {
    return Response.json({ success: false, error: 'System not found' }, { status: 404 });
  }
  return jsonOk(system);
}
