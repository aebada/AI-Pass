import { createId } from '@ai-pass/shared';
import type { DriftEvent, MonitoringEvent, MonitoringEventType, RiskLevel } from '@ai-pass/shared';

export class MonitoringService {
  private events: MonitoringEvent[] = [];
  private incidents = new Map<string, MonitoringEvent[]>();
  private driftEvents: DriftEvent[] = [];

  record(params: Omit<MonitoringEvent, 'id' | 'acknowledged' | 'timestamp'>): MonitoringEvent {
    const event: MonitoringEvent = {
      ...params,
      id: `mon_${createId()}`,
      acknowledged: false,
      timestamp: new Date().toISOString(),
    };
    this.events.push(event);

    if (params.severity === 'high' || params.severity === 'critical') {
      const incidentId = `inc_${createId()}`;
      event.incidentId = incidentId;
      this.incidents.set(incidentId, [event]);
    }

    return event;
  }

  detectDrift(params: {
    systemId: string;
    metric: string;
    previousValue: number;
    currentValue: number;
    threshold: number;
  }): DriftEvent | undefined {
    const delta = Math.abs(params.currentValue - params.previousValue);
    if (delta < params.threshold) return undefined;

    const event: DriftEvent = {
      id: `drf_${createId()}`,
      systemId: params.systemId,
      metric: params.metric,
      previousValue: params.previousValue,
      currentValue: params.currentValue,
      threshold: params.threshold,
      detectedAt: new Date().toISOString(),
    };
    this.driftEvents.push(event);

    this.record({
      systemId: params.systemId,
      type: 'drift',
      severity: delta > params.threshold * 2 ? 'high' : 'medium',
      title: `Drift detected: ${params.metric}`,
      details: { ...params, delta },
      recommendation: 'Schedule re-certification and review model performance',
    });

    return event;
  }

  list(filters?: { systemId?: string; type?: MonitoringEventType; acknowledged?: boolean }): MonitoringEvent[] {
    let result = [...this.events].reverse();
    if (filters?.systemId) result = result.filter((e) => e.systemId === filters.systemId);
    if (filters?.type) result = result.filter((e) => e.type === filters.type);
    if (filters?.acknowledged !== undefined) result = result.filter((e) => e.acknowledged === filters.acknowledged);
    return result;
  }

  listAlerts(): MonitoringEvent[] {
    return this.list({ acknowledged: false }).filter((e) => e.severity === 'high' || e.severity === 'critical');
  }

  listIncidents(): Array<{ incidentId: string; events: MonitoringEvent[] }> {
    return [...this.incidents.entries()].map(([incidentId, events]) => ({ incidentId, events }));
  }

  acknowledge(eventId: string): MonitoringEvent | undefined {
    const event = this.events.find((e) => e.id === eventId);
    if (!event) return undefined;
    event.acknowledged = true;
    return event;
  }

  listDrift(systemId?: string): DriftEvent[] {
    return systemId ? this.driftEvents.filter((e) => e.systemId === systemId) : [...this.driftEvents];
  }

  seed(events: MonitoringEvent[]): void {
    this.events.push(...events);
  }
}
