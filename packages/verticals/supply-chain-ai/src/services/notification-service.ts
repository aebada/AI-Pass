export interface NotificationPayload {
  tenantId: string;
  type: 'offer_uploaded' | 'evaluation_complete' | 'ranking_updated' | 'approval_required' | 'decision_proposed';
  title: string;
  body: string;
  entityId: string;
}

/** Notification service stub — logs only, no external delivery */
export class NotificationService {
  private queue: NotificationPayload[] = [];

  send(payload: NotificationPayload): void {
    this.queue.push({ ...payload });
  }

  list(tenantId?: string): NotificationPayload[] {
    return tenantId ? this.queue.filter((n) => n.tenantId === tenantId) : [...this.queue];
  }

  clear(): void {
    this.queue = [];
  }
}
