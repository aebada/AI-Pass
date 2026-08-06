import { createId, type TrustScorecard } from '@ai-pass/shared';
import type { MonitoringEvent } from './types.js';

export class MonitoringService {
  private events: MonitoringEvent[] = [];
  private baselines = new Map<string, TrustScorecard>();
  private activeSystems = new Set<string>();

  enable(systemId: string, baseline: TrustScorecard): void {
    this.baselines.set(systemId, baseline);
    this.activeSystems.add(systemId);
  }

  disable(systemId: string): void {
    this.activeSystems.delete(systemId);
  }

  isActive(systemId: string): boolean {
    return this.activeSystems.has(systemId);
  }

  checkDrift(systemId: string, current: TrustScorecard): MonitoringEvent[] {
    const baseline = this.baselines.get(systemId);
    if (!baseline) return [];

    const detected: MonitoringEvent[] = [];
    const overallDrop = baseline.overall - current.overall;

    if (overallDrop > 10) {
      detected.push(this.createEvent(systemId, 'score_degradation', 'high', {
        previous: baseline.overall,
        current: current.overall,
        drop: overallDrop,
      }, true));
    }

    if (current.safety < 60) {
      detected.push(this.createEvent(systemId, 'hallucination_rate', 'critical', {
        safetyScore: current.safety,
        rate: ((100 - current.safety) / 100) * 5,
      }, true));
    }

    if (current.compliance < baseline.compliance - 15) {
      detected.push(this.createEvent(systemId, 'policy_violation', 'high', {
        previous: baseline.compliance,
        current: current.compliance,
      }, true));
    }

    if (current.functional < baseline.functional - 12) {
      detected.push(this.createEvent(systemId, 'reliability', 'medium', {
        previous: baseline.functional,
        current: current.functional,
      }));
    }

    this.events.push(...detected);
    return detected;
  }

  recordEvent(event: Omit<MonitoringEvent, 'id' | 'timestamp'>): MonitoringEvent {
    const full = this.createEvent(
      event.systemId,
      event.type,
      event.severity,
      event.details,
      event.triggersRevalidation,
    );
    this.events.push(full);
    return full;
  }

  simulateProviderChange(systemId: string, from: string, to: string): MonitoringEvent {
    return this.recordEvent({
      systemId,
      type: 'provider_change',
      severity: 'medium',
      details: { from, to },
      triggersRevalidation: true,
    });
  }

  getEvents(systemId?: string): MonitoringEvent[] {
    return systemId ? this.events.filter((e) => e.systemId === systemId) : [...this.events];
  }

  getActiveCount(): number {
    return this.activeSystems.size;
  }

  getRecentAlerts(limit = 10): MonitoringEvent[] {
    return [...this.events]
      .filter((e) => e.severity === 'high' || e.severity === 'critical')
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
      .slice(0, limit);
  }

  private createEvent(
    systemId: string,
    type: MonitoringEvent['type'],
    severity: MonitoringEvent['severity'],
    details: Record<string, unknown>,
    triggersRevalidation = false,
  ): MonitoringEvent {
    return {
      id: `mon_${createId()}`,
      systemId,
      type,
      severity,
      details,
      timestamp: new Date().toISOString(),
      triggersRevalidation,
      alertSent: severity === 'high' || severity === 'critical',
    };
  }
}
