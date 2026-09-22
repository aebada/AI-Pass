import { createId, type Alert, type AlertChannel, type AlertType, type PresenceMonitoringEvent, type MonitoringSchedule } from '@ai-pass/shared';

export class MonitoringService {
  private events: PresenceMonitoringEvent[] = [];
  private schedules = new Map<string, MonitoringSchedule>();

  setSchedule(companyId: string, schedule: MonitoringSchedule): void {
    this.schedules.set(companyId, schedule);
  }

  getSchedule(companyId: string): MonitoringSchedule {
    return this.schedules.get(companyId) ?? 'weekly';
  }

  recordEvent(event: Omit<PresenceMonitoringEvent, 'id'>): PresenceMonitoringEvent {
    const entry: PresenceMonitoringEvent = { ...event, id: `evt_${createId()}` };
    this.events.push(entry);
    return entry;
  }

  listEvents(companyId: string, limit = 50): PresenceMonitoringEvent[] {
    return this.events
      .filter((e) => e.companyId === companyId)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  trackChanges(params: {
    companyId: string;
    previousRank?: number;
    currentRank?: number;
    competitorChanges?: string[];
  }): PresenceMonitoringEvent[] {
    const events: PresenceMonitoringEvent[] = [];
    if (params.previousRank && params.currentRank && params.currentRank > params.previousRank) {
      events.push(this.recordEvent({
        companyId: params.companyId,
        type: 'ranking_change',
        title: 'Ranking dropped',
        description: `Position changed from ${params.previousRank} to ${params.currentRank}`,
        severity: 'medium',
        schedule: this.getSchedule(params.companyId),
        timestamp: new Date().toISOString(),
      }));
    }
    if (params.competitorChanges?.length) {
      events.push(this.recordEvent({
        companyId: params.companyId,
        type: 'competitor_change',
        title: 'Competitor landscape shift',
        description: `Changes detected: ${params.competitorChanges.join(', ')}`,
        severity: 'low',
        schedule: this.getSchedule(params.companyId),
        timestamp: new Date().toISOString(),
      }));
    }
    return events;
  }
}

export class AlertService {
  private alerts: Alert[] = [];

  create(params: {
    companyId: string;
    type: AlertType;
    channel: AlertChannel;
    title: string;
    message: string;
    severity: Alert['severity'];
  }): Alert {
    const alert: Alert = {
      id: `alert_${createId()}`,
      companyId: params.companyId,
      type: params.type,
      channel: params.channel,
      title: params.title,
      message: params.message,
      severity: params.severity,
      acknowledged: false,
      createdAt: new Date().toISOString(),
    };
    this.alerts.push(alert);
    this.dispatchStub(alert);
    return alert;
  }

  list(companyId: string): Alert[] {
    return this.alerts.filter((a) => a.companyId === companyId);
  }

  acknowledge(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (!alert) return false;
    alert.acknowledged = true;
    return true;
  }

  /** Channel dispatch stubs */
  private dispatchStub(alert: Alert): void {
    void alert;
  }
}
