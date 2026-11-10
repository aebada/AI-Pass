import { createId, type DriftEvent } from '@ai-pass/shared';

/** @deprecated Use MonitoringService.detectDrift */
export class DriftMonitor {
  private events: DriftEvent[] = [];

  detect(params: {
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
    this.events.push(event);
    return event;
  }

  list(systemId?: string): DriftEvent[] {
    return systemId ? this.events.filter((e) => e.systemId === systemId) : [...this.events];
  }
}
