import { jsonOk, jsonError, getGovernance } from '@/src/lib/governance-api';

export const runtime = 'nodejs';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') as import('@ai-pass/shared').GovernanceReportRequest['type'] | null;
  const format = (searchParams.get('format') ?? 'json') as import('@ai-pass/shared').ExportFormat;

  if (!type) {
    const gov = getGovernance();
    return jsonOk({
      available: ['inventory', 'risk', 'policy', 'compliance', 'executive', 'certification', 'drift', 'audit'],
      inventory: gov.inventory.getInventory(),
      mappings: gov.getComplianceMappings(),
    });
  }

  try {
    const report = getGovernance().reporting.generate({ type, format });
    return jsonOk(report);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Report generation failed');
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as import('@ai-pass/shared').GovernanceReportRequest;
    const report = getGovernance().reporting.generate(body);
    return jsonOk(report);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Report generation failed');
  }
}
