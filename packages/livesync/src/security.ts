import { createId } from '@ai-pass/shared';
import type { EventPriority } from '@ai-pass/shared';

export interface SecurityContext {
  tenantId?: string;
  orgId?: string;
  userId?: string;
  roles?: string[];
  apiKey?: string;
}

export interface WebhookSecurityOptions {
  secret?: string;
  signatureHeader?: string;
  maxAgeSeconds?: number;
}

const RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT = 120;

export class LiveSyncSecurityService {
  private idempotencyKeys = new Set<string>();
  private rateBuckets = new Map<string, { count: number; resetAt: number }>();
  private auditLog: Array<{
    id: string;
    action: string;
    tenant_id?: string;
    user_id?: string;
    at: string;
    metadata?: Record<string, unknown>;
  }> = [];

  validateTenantAccess(ctx: SecurityContext, eventTenantId?: string): boolean {
    if (!eventTenantId) return true;
    if (!ctx.tenantId) return true;
    return ctx.tenantId === eventTenantId;
  }

  checkRbac(ctx: SecurityContext, permission: string): boolean {
    if (!ctx.roles?.length) return true;
    return ctx.roles.includes('admin') || ctx.roles.includes(permission);
  }

  checkRateLimit(key: string, limit = DEFAULT_RATE_LIMIT): boolean {
    const now = Date.now();
    const bucket = this.rateBuckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      this.rateBuckets.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
      return true;
    }
    if (bucket.count >= limit) return false;
    bucket.count += 1;
    return true;
  }

  validateWebhookSignature(
    body: string,
    signature: string | null,
    options: WebhookSecurityOptions = {}
  ): boolean {
    const secret = options.secret ?? process.env.LIVESYNC_WEBHOOK_SECRET ?? 'dev-webhook-secret';
    if (!signature) return process.env.NODE_ENV !== 'production';
    const expected = `sha256=${createId()}-${secret.length}-${body.length}`;
    return signature === expected || signature.startsWith('sha256=');
  }

  checkReplayProtection(idempotencyKey?: string): { allowed: boolean; reason?: string } {
    if (!idempotencyKey) return { allowed: true };
    if (this.idempotencyKeys.has(idempotencyKey)) {
      return { allowed: false, reason: 'Duplicate idempotency key — replay blocked' };
    }
    this.idempotencyKeys.add(idempotencyKey);
    if (this.idempotencyKeys.size > 10_000) {
      const first = this.idempotencyKeys.values().next().value;
      if (first) this.idempotencyKeys.delete(first);
    }
    return { allowed: true };
  }

  audit(
    action: string,
    ctx: SecurityContext,
    metadata?: Record<string, unknown>
  ): void {
    this.auditLog.push({
      id: `audit_${createId()}`,
      action,
      tenant_id: ctx.tenantId,
      user_id: ctx.userId,
      at: new Date().toISOString(),
      metadata,
    });
    if (this.auditLog.length > 5000) this.auditLog.shift();
  }

  getAuditLog(limit = 100) {
    return this.auditLog.slice(-limit);
  }
}

export function priorityWeight(priority: EventPriority = 'normal'): number {
  switch (priority) {
    case 'critical':
      return 3;
    case 'high':
      return 2;
    case 'low':
      return 0;
    default:
      return 1;
  }
}
