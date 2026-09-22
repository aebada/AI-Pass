import { createId } from '@ai-pass/shared';
import type { Requirement, SourcingEvent } from '../types.js';

export class SourcingService {
  private events = new Map<string, SourcingEvent>();

  create(params: Omit<SourcingEvent, 'id' | 'version' | 'createdAt' | 'updatedAt'>): SourcingEvent {
    const now = new Date().toISOString();
    const event: SourcingEvent = {
      ...params,
      id: `evt_${createId()}`,
      version: 1,
      createdAt: now,
      updatedAt: now,
    };
    this.events.set(event.id, event);
    return event;
  }

  update(id: string, patch: Partial<Pick<SourcingEvent, 'title' | 'status' | 'deadline' | 'budgetCap' | 'requirements'>>): SourcingEvent {
    const existing = this.events.get(id);
    if (!existing) throw new Error(`Sourcing event not found: ${id}`);

    const updated: SourcingEvent = {
      ...existing,
      ...patch,
      version: existing.version + 1,
      updatedAt: new Date().toISOString(),
    };
    this.events.set(id, updated);
    return updated;
  }

  get(id: string): SourcingEvent | undefined {
    return this.events.get(id);
  }

  list(tenantId?: string): SourcingEvent[] {
    const all = [...this.events.values()];
    return tenantId ? all.filter((e) => e.tenantId === tenantId) : all;
  }

  seed(events: SourcingEvent[]): void {
    for (const e of events) this.events.set(e.id, e);
  }
}

export function parseRequirementsFromNL(text: string, eventId: string): Requirement[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  return lines.map((line) => ({
    id: `req_${createId()}`,
    eventId,
    category: line.toLowerCase().includes('iso') || line.toLowerCase().includes('cert')
      ? 'compliance'
      : line.toLowerCase().includes('deliver') || line.toLowerCase().includes('lead')
        ? 'logistics'
        : line.toLowerCase().includes('esg') || line.toLowerCase().includes('sustain')
          ? 'esg'
          : line.toLowerCase().includes('price') || line.toLowerCase().includes('budget')
            ? 'commercial'
            : 'technical',
    label: line.replace(/^[-*•]\s*/, '').slice(0, 120),
    mandatory: line.includes('*') || line.toLowerCase().includes('must'),
    nlSource: text,
  }));
}
