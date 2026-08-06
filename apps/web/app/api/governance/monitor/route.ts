import { jsonOk, jsonError, getGovernance } from '@/src/lib/governance-api';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as {
      systemId: string;
      type: string;
      severity: string;
      title: string;
      details?: Record<string, unknown>;
    };
    if (!body.systemId || !body.type) return jsonError('systemId and type are required');
    const gov = getGovernance();
    const event = gov.monitoring.record({
      systemId: body.systemId,
      type: body.type as import('@ai-pass/shared').MonitoringEventType,
      severity: (body.severity as import('@ai-pass/shared').RiskLevel) ?? 'medium',
      title: body.title ?? body.type,
      details: body.details ?? {},
    });
    return jsonOk(event, 201);
  } catch (err) {
    return jsonError(err instanceof Error ? err.message : 'Monitor event failed');
  }
}

export async function GET(): Promise<Response> {
  const gov = getGovernance();
  return jsonOk({
    alerts: gov.monitoring.listAlerts(),
    incidents: gov.monitoring.listIncidents(),
    events: gov.monitoring.list(),
  });
}
