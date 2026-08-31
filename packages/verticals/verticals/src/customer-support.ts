import {
  createCustomerSupportAIPlatform,
  CUSTOMER_SUPPORT_SKILLS,
} from '@ai-pass/customer-support-ai';

export { CUSTOMER_SUPPORT_SKILLS, defaultCustomerSupportAIService, defaultCustomerSupportAIPlatform } from '@ai-pass/customer-support-ai';
export const SUPPORT_SKILLS = CUSTOMER_SUPPORT_SKILLS.map((s) => s.name);

/** @deprecated Use CustomerSupportAIService from @ai-pass/customer-support-ai */
export class CustomerSupportEngine {
  private platform = createCustomerSupportAIPlatform();

  startSession(params: {
    tenantId: string;
    channel: 'text' | 'voice';
    language?: string;
  }) {
    return this.platform.service.startConversation({
      tenantId: params.tenantId,
      userId: 'legacy',
      tier: 'professional',
      channel: params.channel === 'voice' ? 'voice' : 'web',
      language: params.language,
    });
  }

  async processMessage(sessionId: string, message: string) {
    const conv = this.platform.service.getConversation(sessionId);
    if (!conv) throw new Error(`Session not found: ${sessionId}`);
    const result = await this.platform.service.sendMessage({
      conversationId: sessionId,
      tenantId: conv.tenantId,
      userId: 'legacy',
      tier: 'professional',
      content: message,
    });
    return {
      response: result.response.content,
      decision: result.conversation.decision ?? 'PASS',
      escalate: result.escalated,
    };
  }

  getSession(sessionId: string) {
    return this.platform.service.getConversation(sessionId);
  }
}
