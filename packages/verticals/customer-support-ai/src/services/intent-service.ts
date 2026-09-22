import { createId } from '@ai-pass/shared';
import type { SupportIntent } from '../types.js';

const INTENT_PATTERNS: Array<{ intent: SupportIntent; patterns: RegExp[] }> = [
  { intent: 'refund', patterns: [/refund|rückerstattung|استرداد|money back/i] },
  { intent: 'order_status', patterns: [/order|bestellung|طلب|tracking|delivery|lieferung/i] },
  { intent: 'complaint', patterns: [/complaint|beschwerde|شكوى|unhappy|terrible|awful/i] },
  { intent: 'technical', patterns: [/technical|technisch|تقني|error|bug|not working|kaputt/i] },
  { intent: 'booking', patterns: [/book|buchen|حجز|reservation|appointment/i] },
  { intent: 'cancellation', patterns: [/cancel|stornier|إلغاء|storno/i] },
  { intent: 'account', patterns: [/account|konto|حساب|password|login|profile/i] },
];

export class IntentService {
  detect(message: string, _language: string): {
    intent: SupportIntent;
    confidence: number;
    entities: Record<string, string>;
  } {
    const lower = message.toLowerCase();

    for (const { intent, patterns } of INTENT_PATTERNS) {
      if (patterns.some((p) => p.test(message))) {
        return {
          intent,
          confidence: 0.82 + Math.random() * 0.12,
          entities: this.extractEntities(lower),
        };
      }
    }

    return {
      intent: 'general',
      confidence: 0.65 + Math.random() * 0.1,
      entities: this.extractEntities(lower),
    };
  }

  private extractEntities(text: string): Record<string, string> {
    const entities: Record<string, string> = {};
    const orderMatch = text.match(/(?:order|bestellung|#)\s*([A-Z0-9-]+)/i);
    if (orderMatch) entities.orderId = orderMatch[1];
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) entities.email = emailMatch[0];
    return entities;
  }

  createIntentRecord(message: string, language: string) {
    const result = this.detect(message, language);
    return {
      id: `intent_${createId()}`,
      type: result.intent,
      confidence: result.confidence,
      entities: result.entities,
      language,
    };
  }
}
