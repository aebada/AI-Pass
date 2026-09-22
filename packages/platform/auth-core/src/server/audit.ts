import { randomUUID } from 'node:crypto';
import { getPrisma, type Prisma } from '@ai-pass/db';

export interface AuditEvent {
  action: string;
  actorUserId?: string | null;
  organizationId?: string | null;
  teamId?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  success?: boolean;
  detail?: Prisma.InputJsonValue;
}

/**
 * A failed audit write is logged but does not fail the operation that produced
 * it. Blocking sign-in on the audit table being reachable trades a security
 * property for an availability problem.
 */
export async function recordAuditEvent(event: AuditEvent): Promise<void> {
  try {
    await getPrisma().auditLog.create({
      data: {
        id: randomUUID(),
        action: event.action,
        actorUserId: event.actorUserId ?? null,
        organizationId: event.organizationId ?? null,
        teamId: event.teamId ?? null,
        targetType: event.targetType ?? null,
        targetId: event.targetId ?? null,
        ipAddress: event.ipAddress ?? null,
        userAgent: event.userAgent ?? null,
        success: event.success ?? true,
        detail: event.detail,
      },
    });
  } catch (error) {
    console.error(`[audit] failed to record ${event.action}`, error);
  }
}
