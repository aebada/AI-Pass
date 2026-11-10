import { createId, type EventPriority, type InboundEvent, type LiveSyncEvent } from '@ai-pass/shared';
import { LiveSyncSecurityService, type SecurityContext } from './security.js';

const REQUIRED_FIELDS = ['event_type', 'payload'] as const;

export class EventValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EventValidationError';
  }
}

export function validateInboundEvent(body: unknown): asserts body is InboundEvent {
  if (!body || typeof body !== 'object') {
    throw new EventValidationError('Request body must be a JSON object');
  }

  const record = body as Record<string, unknown>;

  for (const field of REQUIRED_FIELDS) {
    if (!(field in record)) {
      throw new EventValidationError(`Missing required field: ${field}`);
    }
  }

  if (typeof record.event_type !== 'string' || !record.event_type.trim()) {
    throw new EventValidationError('event_type must be a non-empty string');
  }

  if (!record.payload || typeof record.payload !== 'object' || Array.isArray(record.payload)) {
    throw new EventValidationError('payload must be an object');
  }

  if (record.source !== undefined && typeof record.source !== 'string') {
    throw new EventValidationError('source must be a string when provided');
  }

  if (record.timestamp !== undefined && typeof record.timestamp !== 'string') {
    throw new EventValidationError('timestamp must be an ISO string when provided');
  }
}

export function normalizeEvent(input: InboundEvent): LiveSyncEvent {
  const now = new Date().toISOString();
  const priority: EventPriority = input.priority ?? 'normal';
  const normalizedPayload = {
    ...input.payload,
    _meta: {
      event_type: input.event_type,
      source: input.source ?? 'unknown',
      ingested_at: now,
      original_timestamp: input.timestamp ?? now,
      tenant_id: input.tenant_id,
      org_id: input.org_id,
      user_id: input.user_id,
      correlation_id: input.correlation_id,
      priority,
    },
  };

  return {
    id: `evt_${createId()}`,
    event_type: input.event_type,
    source: input.source ?? 'unknown',
    tenant_id: input.tenant_id,
    org_id: input.org_id,
    user_id: input.user_id,
    correlation_id: input.correlation_id,
    metadata: input.metadata,
    priority,
    payload: input.payload,
    normalized_payload: normalizedPayload,
    status: 'received',
    received_at: input.timestamp ?? now,
    retry_count: 0,
  };
}

export function ingestEvent(body: unknown): LiveSyncEvent {
  validateInboundEvent(body);
  return normalizeEvent(body);
}

export interface GatewayIngestOptions {
  idempotencyKey?: string;
  security?: LiveSyncSecurityService;
  context?: SecurityContext;
  rawBody?: string;
  signature?: string | null;
}

/**
 * EventGateway — accepts webhooks, REST, marketplace, agent studio, workflow,
 * knowledge, ERP, CRM, IoT, mobile, desktop, and voice events.
 */
export class EventGateway {
  constructor(private security = new LiveSyncSecurityService()) {}

  ingest(body: unknown, options: GatewayIngestOptions = {}): LiveSyncEvent {
    const ctx = options.context ?? {};
    const rateKey = ctx.tenantId ?? ctx.apiKey ?? 'global';
    if (!this.security.checkRateLimit(rateKey)) {
      throw new EventValidationError('Rate limit exceeded');
    }

    if (options.rawBody && options.signature !== undefined) {
      if (!this.security.validateWebhookSignature(options.rawBody, options.signature)) {
        throw new EventValidationError('Invalid webhook signature');
      }
    }

    const replay = this.security.checkReplayProtection(options.idempotencyKey);
    if (!replay.allowed) {
      throw new EventValidationError(replay.reason ?? 'Replay blocked');
    }

    validateInboundEvent(body);
    const event = normalizeEvent(body);

    if (!this.security.validateTenantAccess(ctx, event.tenant_id)) {
      throw new EventValidationError('Tenant isolation violation');
    }

    if (!this.security.checkRbac(ctx, 'events:write')) {
      throw new EventValidationError('Insufficient permissions');
    }

    this.security.audit('event.ingest', ctx, { event_type: event.event_type, event_id: event.id });
    return event;
  }
}

export const defaultEventGateway = new EventGateway();
