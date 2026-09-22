import { createId } from '@ai-pass/shared';
import type { Ticket, TicketPriority, TicketStatus } from '../types.js';
import { emitTicketUpdated } from '../livesync.js';

const SLA_HOURS: Record<TicketPriority, number> = {
  low: 48,
  medium: 24,
  high: 8,
  urgent: 2,
};

export class TicketService {
  private tickets = new Map<string, Ticket>();

  constructor(seedTickets: Ticket[] = []) {
    for (const t of seedTickets) this.tickets.set(t.id, t);
  }

  create(params: {
    tenantId: string;
    customerId: string;
    conversationId?: string;
    subject: string;
    description: string;
    priority?: TicketPriority;
    category?: string;
  }): Ticket {
    const priority = params.priority ?? 'medium';
    const now = new Date();
    const slaDue = new Date(now.getTime() + SLA_HOURS[priority] * 3600000);

    const ticket: Ticket = {
      id: `tkt_${createId()}`,
      tenantId: params.tenantId,
      conversationId: params.conversationId,
      customerId: params.customerId,
      subject: params.subject,
      description: params.description,
      status: 'open',
      priority,
      category: params.category,
      slaDueAt: slaDue.toISOString(),
      slaBreached: false,
      tags: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    this.tickets.set(ticket.id, ticket);
    void emitTicketUpdated(ticket);
    return ticket;
  }

  get(id: string): Ticket | undefined {
    return this.tickets.get(id);
  }

  list(tenantId: string, status?: TicketStatus): Ticket[] {
    return [...this.tickets.values()].filter(
      (t) => t.tenantId === tenantId && (!status || t.status === status),
    );
  }

  update(id: string, patch: Partial<Pick<Ticket, 'status' | 'priority' | 'assigneeId' | 'assigneeName' | 'category' | 'tags'>>): Ticket {
    const ticket = this.tickets.get(id);
    if (!ticket) throw new Error(`Ticket not found: ${id}`);

    Object.assign(ticket, patch, { updatedAt: new Date().toISOString() });
    if (patch.status === 'closed') ticket.closedAt = new Date().toISOString();
    if (patch.status === 'reopened') {
      ticket.closedAt = undefined;
      ticket.status = 'reopened';
    }

    if (ticket.slaDueAt && new Date() > new Date(ticket.slaDueAt) && ticket.status !== 'resolved' && ticket.status !== 'closed') {
      ticket.slaBreached = true;
    }

    void emitTicketUpdated(ticket);
    return ticket;
  }

  assign(id: string, assigneeId: string, assigneeName: string): Ticket {
    return this.update(id, { assigneeId, assigneeName, status: 'in_progress' });
  }

  close(id: string): Ticket {
    return this.update(id, { status: 'closed' });
  }

  reopen(id: string): Ticket {
    return this.update(id, { status: 'reopened' });
  }

  prioritize(id: string, priority: TicketPriority): Ticket {
    const ticket = this.update(id, { priority });
    const slaDue = new Date(Date.now() + SLA_HOURS[priority] * 3600000);
    ticket.slaDueAt = slaDue.toISOString();
    return ticket;
  }

  categorize(id: string, category: string): Ticket {
    return this.update(id, { category });
  }
}
