import type { LiveSyncEngine } from '@ai-pass/livesync';
import type { EventTrigger, EventTriggerType } from './types.js';

export const DEFAULT_TRIGGERS: EventTrigger[] = [
  { id: 'trg_webhook', type: 'webhook', config: { path: '/api/v1/events/webhook' } },
  { id: 'trg_schedule', type: 'schedule', config: { cron: '0 * * * *' } },
  { id: 'trg_email', type: 'email', config: { inbox: 'inbound@ai-pass.local' } },
  { id: 'trg_file', type: 'file_upload', config: { mimeTypes: ['application/pdf'] } },
  { id: 'trg_iot', type: 'iot_stub', config: { protocol: 'mqtt' } },
  { id: 'trg_erp', type: 'erp', config: { systems: ['sap', 'oracle'] } },
  { id: 'trg_voice', type: 'voice', config: { channels: ['phone', 'webrtc'] } },
  { id: 'trg_marketplace', type: 'marketplace', config: { events: ['app.installed', 'skill.executed'] } },
  {
    id: 'trg_livesync',
    type: 'livesync',
    config: {},
    livesyncEventType: 'invoice.uploaded',
  },
];

export class TriggerRegistry {
  private triggers = new Map<string, EventTrigger>();

  constructor(seed: EventTrigger[] = DEFAULT_TRIGGERS) {
    for (const t of seed) this.triggers.set(t.id, t);
  }

  register(trigger: EventTrigger): void {
    this.triggers.set(trigger.id, trigger);
  }

  get(id: string): EventTrigger | undefined {
    return this.triggers.get(id);
  }

  list(type?: EventTriggerType): EventTrigger[] {
    const all = [...this.triggers.values()];
    return type ? all.filter((t) => t.type === type) : all;
  }
}

/** Bridge automation triggers to LiveSync event ingestion */
export async function fireLiveSyncTrigger(
  engine: LiveSyncEngine,
  eventType: string,
  payload: Record<string, unknown>,
): Promise<{ eventId: string }> {
  const result = await engine.ingestTestEvent({
    event_type: eventType,
    source: 'automation-engine',
    payload,
  });
  return { eventId: result.event_id ?? '' };
}

export const defaultTriggerRegistry = new TriggerRegistry();
