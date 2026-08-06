export { KnowledgePipelineHook } from './knowledge.js';
export { GovernanceHook } from './governance.js';

import type { LiveSyncEvent } from '@ai-pass/shared';

export type IntegrationHandler = (event: LiveSyncEvent) => Promise<void>;

const handlers = new Map<string, IntegrationHandler[]>();

export function registerIntegrationHandler(eventType: string, handler: IntegrationHandler): void {
  const list = handlers.get(eventType) ?? [];
  list.push(handler);
  handlers.set(eventType, list);
}

export async function dispatchIntegrations(event: LiveSyncEvent): Promise<void> {
  const exact = handlers.get(event.event_type) ?? [];
  const prefix = handlers.get('custom.*') ?? [];
  await Promise.all([...exact, ...prefix].map((h) => h(event)));
}

/** Invoice AI — validation pipeline */
registerIntegrationHandler('invoice.uploaded', async (event) => {
  void event.payload;
});

/** Supply chain — supplier updates */
registerIntegrationHandler('supplier.updated', async (event) => {
  void event.payload;
});

/** Customer support */
registerIntegrationHandler('customer.created', async (event) => {
  void event.payload;
});

/** Knowledge pipeline */
registerIntegrationHandler('knowledge.updated', async (event) => {
  void event.payload;
});

registerIntegrationHandler('knowledge.source_updated', async (event) => {
  void event.payload;
});

/** Analysis studio */
registerIntegrationHandler('analysis.finished', async (event) => {
  void event.payload;
});

registerIntegrationHandler('analysis.dataset_uploaded', async (event) => {
  void event.payload;
});

/** Marketplace */
registerIntegrationHandler('marketplace.installed', async (event) => {
  void event.payload;
});

/** Trust engine */
registerIntegrationHandler('trust.validation.completed', async (event) => {
  void event.payload;
});

/** Compliance */
registerIntegrationHandler('compliance.risk.created', async (event) => {
  void event.payload;
});

/** Presence audit */
registerIntegrationHandler('presence.knowledge.updated', async (event) => {
  void event.payload;
});

/** Governance */
registerIntegrationHandler('policy.updated', async (event) => {
  void event.payload;
});
