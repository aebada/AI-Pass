import type { InboundEvent, WebhookResponse } from '@ai-pass/shared';
import { getLiveSyncEngine } from './engine.js';

export interface PublishEventParams extends InboundEvent {
  sync?: boolean;
}

/** Central publish helper — marketplace apps and verticals use this */
export async function publishEvent(params: PublishEventParams): Promise<WebhookResponse> {
  const engine = getLiveSyncEngine();
  if (params.sync) {
    const result = await engine.runLive({
      event_type: params.event_type,
      payload: params.payload,
      source: params.source,
      sync: true,
    });
    return { status: 'accepted', event_id: result.event_id, queue_status: 'processing' };
  }
  return engine.ingestWebhook(params);
}

/** Adapter for marketplace-core LiveSyncEventEmitter */
export function createMarketplaceEmitter(): (event: {
  type: string;
  payload: Record<string, unknown>;
}) => void {
  return (event) => {
    const typeMap: Record<string, string> = {
      'marketplace.install': 'marketplace.installed',
      'marketplace.skill_execute': 'marketplace.skill.published',
      'marketplace.review': 'marketplace.app.updated',
    };
    void publishEvent({
      event_type: typeMap[event.type] ?? event.type,
      payload: event.payload,
      source: 'marketplace',
    });
  };
}

export function createTrustEmitter(): (event: {
  type: string;
  payload: Record<string, unknown>;
}) => void {
  return (event) => {
    const typeMap: Record<string, string> = {
      'trust.validation': 'trust.validation.completed',
      'trust.certification': 'trust.certification.issued',
      'trust.monitoring_alert': 'trust.monitoring.alert',
      'trust.revalidation': 'trust.revalidation.required',
    };
    void publishEvent({
      event_type: typeMap[event.type] ?? event.type,
      payload: event.payload,
      source: 'trust-engine',
    });
  };
}
