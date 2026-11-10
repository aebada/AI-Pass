import type { EscalationReason, SupportIntent } from '../types.js';

export interface EscalationDecision {
  escalate: boolean;
  reason?: EscalationReason;
  context: Record<string, unknown>;
}

export class EscalationEngine {
  evaluate(params: {
    confidence: number;
    intent: SupportIntent;
    message: string;
    failureCount: number;
    manualRequest?: boolean;
  }): EscalationDecision {
    const lower = params.message.toLowerCase();

    if (params.manualRequest || /\b(agent|human|person|speak to|mitarbeiter)\b/i.test(lower)) {
      return { escalate: true, reason: 'manual', context: { trigger: 'manual_request' } };
    }

    if (params.confidence < 0.5) {
      return { escalate: true, reason: 'low_confidence', context: { confidence: params.confidence } };
    }

    if (/\b(lawyer|legal|sue|anwalt|قانوني)\b/i.test(lower)) {
      return { escalate: true, reason: 'legal', context: { keywords: ['legal'] } };
    }

    if (params.intent === 'refund' && /\b(\$|€|£)\s?\d{3,}|thousand|urgent refund/i.test(lower)) {
      return { escalate: true, reason: 'financial', context: { intent: 'refund', highValue: true } };
    }

    if (/\b(furious|angry|terrible|worst|wütend|غاضب)\b/i.test(lower)) {
      return { escalate: true, reason: 'emotional', context: { sentiment: 'negative' } };
    }

    if (params.failureCount >= 3) {
      return { escalate: true, reason: 'repeated_failure', context: { failureCount: params.failureCount } };
    }

    return { escalate: false, context: {} };
  }

  buildContextTransfer(params: {
    conversationId: string;
    messages: Array<{ role: string; content: string }>;
    intent?: SupportIntent;
    customerName?: string;
  }): Record<string, unknown> {
    return {
      conversationId: params.conversationId,
      customerName: params.customerName,
      intent: params.intent,
      messageCount: params.messages.length,
      summary: params.messages.slice(-5).map((m) => `${m.role}: ${m.content.slice(0, 100)}`).join('\n'),
      transferredAt: new Date().toISOString(),
    };
  }
}
