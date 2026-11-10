import { getLiveSyncEngine } from '@ai-pass/livesync';
import type { Conversation, Ticket } from './types.js';

export async function emitConversationStarted(conversation: Conversation): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'support.conversation.started',
      payload: {
        conversation_id: conversation.id,
        tenant_id: conversation.tenantId,
        channel: conversation.channel,
        language: conversation.language,
      },
      source: 'customer-support-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitConversationMessage(params: {
  conversationId: string;
  tenantId: string;
  intent?: string;
  escalated?: boolean;
}): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'support.conversation.message',
      payload: params,
      source: 'customer-support-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitTicketUpdated(ticket: Ticket): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'support.ticket.updated',
      payload: {
        ticket_id: ticket.id,
        status: ticket.status,
        priority: ticket.priority,
        tenant_id: ticket.tenantId,
      },
      source: 'customer-support-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitAnalyticsRefresh(tenantId: string): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'support.analytics.refresh',
      payload: { tenant_id: tenantId },
      source: 'customer-support-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}
