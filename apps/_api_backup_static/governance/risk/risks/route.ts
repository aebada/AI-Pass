import { jsonOk } from '@/src/lib/governance-api';

export const runtime = 'nodejs';

export async function GET(): Promise<Response> {
  const { getGovernance } = await import('@/src/lib/governance-api');
  return jsonOk(getGovernance().risks.list());
}
