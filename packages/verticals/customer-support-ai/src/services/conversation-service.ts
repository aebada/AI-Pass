import { createId, type AgentDecision, type MembershipTier } from '@ai-pass/shared';
import { defaultWalletService } from '@ai-pass/wallet';
import { createMarketplacePlatform } from '@ai-pass/marketplace';
import type {
  ConversationHistoryResponse,
  CrmUpdateResponse,
  DashboardStats,
  AnalyticsResponse,
  SendMessageResponse,
  StartConversationResponse,
  SubmitFeedbackResponse,
  TicketResponse,
  VoiceConversationResponse,
} from '../api-types.js';
import { defaultComplianceService } from '../compliance.js';
import {
  DEMO_AUDIT_LOGS,
  DEMO_CONVERSATIONS,
  DEMO_CUSTOMERS,
  DEMO_FEEDBACK,
  DEMO_MESSAGES,
  DEMO_TICKETS,
} from '../demo-data.js';
import { detectLanguage, getGreeting, getIntentResponse } from '../i18n.js';
import { emitAnalyticsRefresh, emitConversationMessage, emitConversationStarted } from '../livesync.js';
import {
  canAccessCustomerSupportAI,
  canAccessVoice,
  getConversationLimit,
} from '../membership-gates.js';
import { routeSupportRequest } from '../provider-routing.js';
import { defaultSupportTrustService } from '../trust.js';
import type {
  Conversation,
  Customer,
  Feedback,
  Message,
  SupportLanguage,
  Ticket,
} from '../types.js';
import { AnalyticsService } from './analytics-service.js';
import { AuditService } from './audit-service.js';
import { CrmService } from './crm-service.js';
import { EscalationEngine } from './escalation-engine.js';
import { IntentService } from './intent-service.js';
import { KnowledgeService } from './knowledge-service.js';
import { NotificationService } from './notification-service.js';
import { TicketService } from './ticket-service.js';
import { VoiceService } from './voice-service.js';
import { WorkflowService } from './workflow-service.js';

export class CustomerSupportAIService {
  private conversations = new Map<string, Conversation>();
  private messages = new Map<string, Message[]>();
  private customers = new Map<string, Customer>();
  private feedback: Feedback[] = [];
  private failureCounts = new Map<string, number>();

  private intent = new IntentService();
  private knowledge = new KnowledgeService();
  private workflow = new WorkflowService();
  private crm = new CrmService();
  private tickets: TicketService;
  private escalation = new EscalationEngine();
  private voice = new VoiceService();
  private analytics = new AnalyticsService();
  private notifications = new NotificationService();
  private audit: AuditService;
  private marketplace = createMarketplacePlatform();

  constructor(seedDemo = true) {
    this.tickets = new TicketService();
    this.audit = new AuditService();
    if (seedDemo) this.seedDemoData();
  }

  private seedDemoData(): void {
    for (const c of DEMO_CUSTOMERS) this.customers.set(c.id, c);
    for (const c of DEMO_CONVERSATIONS) this.conversations.set(c.id, c);
    for (const [convId, msgs] of Object.entries(DEMO_MESSAGES)) {
      this.messages.set(convId, msgs);
    }
    this.tickets = new TicketService(DEMO_TICKETS);
    this.feedback = [...DEMO_FEEDBACK];
    this.audit = new AuditService(DEMO_AUDIT_LOGS);
  }

  getDashboard(tenantId: string): DashboardStats {
    const snapshot = this.analytics.compute(
      this.listConversations(tenantId),
      this.tickets.list(tenantId),
      this.feedback.filter((f) => f.tenantId === tenantId),
    );
    return snapshot;
  }

  getAnalytics(tenantId: string): AnalyticsResponse {
    const snapshot = this.analytics.compute(
      this.listConversations(tenantId),
      this.tickets.list(tenantId),
      this.feedback.filter((f) => f.tenantId === tenantId),
    );
    void emitAnalyticsRefresh(tenantId);
    return snapshot;
  }

  listConversations(tenantId: string): Conversation[] {
    return [...this.conversations.values()].filter((c) => c.tenantId === tenantId);
  }

  getConversation(id: string): Conversation | undefined {
    return this.conversations.get(id);
  }

  getHistory(tenantId: string): ConversationHistoryResponse {
    const conversations = this.listConversations(tenantId);
    const messages: Record<string, Message[]> = {};
    for (const c of conversations) {
      messages[c.id] = this.messages.get(c.id) ?? [];
    }
    return { conversations, messages, total: conversations.length };
  }

  async startConversation(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    customerId?: string;
    customerEmail?: string;
    customerName?: string;
    channel: Conversation['channel'];
    language?: SupportLanguage;
  }): Promise<StartConversationResponse> {
    if (!canAccessCustomerSupportAI(params.tier)) {
      throw new Error('Customer Support AI requires Professional plan or higher');
    }

    const limit = getConversationLimit(params.tier);
    const active = this.listConversations(params.tenantId).filter(
      (c) => c.status === 'active' || c.status === 'waiting',
    ).length;
    if (active >= limit) {
      throw new Error(`Conversation limit reached for ${params.tier} plan (${limit})`);
    }

    routeSupportRequest({ taskType: 'chat', membershipTier: params.tier });

    const customer = this.resolveCustomer(params);
    const language = params.language ?? customer.language ?? 'en';

    const conversation: Conversation = {
      id: `conv_${createId()}`,
      tenantId: params.tenantId,
      customerId: customer.id,
      channel: params.channel,
      language,
      status: 'active',
      confidence: 1,
      creditsUsed: 0,
      startedAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
    };

    const welcomeContent = getGreeting(language);
    const welcomeMessage: Message = {
      id: `msg_${createId()}`,
      conversationId: conversation.id,
      role: 'ai',
      content: welcomeContent,
      language,
      confidence: 1,
      createdAt: new Date().toISOString(),
    };

    this.conversations.set(conversation.id, conversation);
    this.messages.set(conversation.id, [welcomeMessage]);

    const creditsUsed = 2;
    conversation.creditsUsed += creditsUsed;
    this.recordWallet(params, creditsUsed, 'conversation_start');

    this.audit.log({
      tenantId: params.tenantId,
      entityType: 'conversation',
      entityId: conversation.id,
      action: 'conversation.started',
      actorId: params.userId,
      actorName: 'User',
      details: { channel: params.channel, language },
      creditsUsed,
    });

    const liveSyncEventId = await emitConversationStarted(conversation);
    return { conversation, welcomeMessage, creditsUsed, liveSyncEventId };
  }

  async sendMessage(params: {
    conversationId: string;
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    content: string;
    language?: SupportLanguage;
  }): Promise<SendMessageResponse> {
    const conversation = this.conversations.get(params.conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const piiScan = defaultComplianceService.scanPii(params.content);
    const content = piiScan.hasPii ? piiScan.redactedText : params.content;

    const language = params.language ?? detectLanguage(content) ?? conversation.language;
    conversation.language = language;

    const intentResult = this.intent.detect(content, language);
    conversation.intent = intentResult.intent;
    conversation.confidence = intentResult.confidence;

    const decisionSkill = this.marketplace.skills.list('decision').find((s) => s.name === 'EscalationDecisionSkill')
      ?? this.marketplace.skills.get('skill_cs_intent');
    if (decisionSkill) {
      await this.marketplace.skillExecutor.invoke({
        skillId: decisionSkill.id,
        tenantId: params.tenantId,
        userId: params.userId,
        input: { message: content, intent: intentResult.intent },
      });
    }

    const citations = this.knowledge.retrieve(content, intentResult.intent);
    const failureCount = this.failureCounts.get(params.conversationId) ?? 0;

    const escalationDecision = this.escalation.evaluate({
      confidence: intentResult.confidence,
      intent: intentResult.intent,
      message: content,
      failureCount,
    });

    let workflowExecutionId: string | undefined;
    if (intentResult.intent === 'refund' && !escalationDecision.escalate) {
      const wf = this.workflow.startRefundFlow(params.conversationId, intentResult.entities.orderId);
      workflowExecutionId = wf.id;
    }

    const escalated = escalationDecision.escalate;
    if (escalated) {
      conversation.status = 'escalated';
      const ticket = this.tickets.create({
        tenantId: params.tenantId,
        customerId: conversation.customerId,
        conversationId: conversation.id,
        subject: `Escalation: ${intentResult.intent}`,
        description: content,
        priority: escalationDecision.reason === 'financial' ? 'urgent' : 'high',
        category: escalationDecision.reason,
      });
      conversation.ticketId = ticket.id;
      void this.notifications.notifyEscalation({ assigneeId: 'agent_pool', conversationId: conversation.id });
    }

    const responseText = getIntentResponse(language, intentResult.intent, escalated);
    const decision: AgentDecision = escalated ? 'NEEDS_INFO' : intentResult.confidence >= 0.7 ? 'PASS' : 'NEEDS_INFO';

    const trust = defaultSupportTrustService.evaluateConversation({
      confidence: intentResult.confidence,
      policyCompliant: !escalated || escalationDecision.reason !== 'legal',
      hasCitations: citations.length > 0,
      escalated,
    });
    conversation.trustScore = trust.trustScore;
    conversation.decision = decision;

    const userMessage: Message = {
      id: `msg_${createId()}`,
      conversationId: params.conversationId,
      role: 'customer',
      content,
      language,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      createdAt: new Date().toISOString(),
    };

    const aiMessage: Message = {
      id: `msg_${createId()}`,
      conversationId: params.conversationId,
      role: 'ai',
      content: responseText,
      language,
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      citations,
      createdAt: new Date().toISOString(),
    };

    const msgs = this.messages.get(params.conversationId) ?? [];
    msgs.push(userMessage, aiMessage);
    this.messages.set(params.conversationId, msgs);
    conversation.lastMessageAt = new Date().toISOString();

    const creditsUsed = 5 + (citations.length > 0 ? 4 : 0);
    conversation.creditsUsed += creditsUsed;
    this.recordWallet(params, creditsUsed, 'conversation_message');

    if (!escalated && intentResult.confidence < 0.6) {
      this.failureCounts.set(params.conversationId, failureCount + 1);
    }

    void emitConversationMessage({
      conversationId: params.conversationId,
      tenantId: params.tenantId,
      intent: intentResult.intent,
      escalated,
    });

    return {
      message: userMessage,
      response: aiMessage,
      conversation,
      escalated,
      workflowExecutionId,
      creditsUsed,
    };
  }

  handleVoice(params: {
    conversationId: string;
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    action: 'start' | 'transcribe' | 'synthesize' | 'end';
    audioBase64?: string;
    language?: SupportLanguage;
  }): VoiceConversationResponse {
    if (!canAccessVoice(params.tier)) {
      throw new Error('Voice support requires Power plan or higher');
    }

    const conversation = this.conversations.get(params.conversationId);
    if (!conversation) throw new Error('Conversation not found');

    routeSupportRequest({ taskType: 'voice_stt', membershipTier: params.tier });

    let voiceSession = conversation.voiceSessionId
      ? this.voice.get(conversation.voiceSessionId)
      : undefined;

    let creditsUsed = 0;
    let transcript: string | undefined;
    let responseText: string | undefined;
    let audioBase64: string | undefined;

    if (params.action === 'start') {
      voiceSession = this.voice.start(params.conversationId, params.language ?? conversation.language);
      conversation.voiceSessionId = voiceSession.id;
      creditsUsed = 3;
    } else if (params.action === 'transcribe' && voiceSession) {
      const result = this.voice.transcribe(voiceSession.id, params.audioBase64);
      transcript = result.transcript;
      voiceSession = result.session;
      creditsUsed = 10;
      responseText = getIntentResponse(conversation.language, conversation.intent ?? 'general');
    } else if (params.action === 'synthesize' && voiceSession) {
      const text = params.audioBase64 ?? getGreeting(conversation.language);
      const result = this.voice.synthesize(voiceSession.id, text);
      audioBase64 = result.audioBase64;
      voiceSession = result.session;
      creditsUsed = 8;
    } else if (params.action === 'end' && voiceSession) {
      voiceSession = this.voice.end(voiceSession.id);
      creditsUsed = 1;
    }

    if (!voiceSession) {
      voiceSession = this.voice.start(params.conversationId, conversation.language);
      conversation.voiceSessionId = voiceSession.id;
    }

    if (params.language) {
      voiceSession = this.voice.switchLanguage(voiceSession.id, params.language);
    }

    conversation.creditsUsed += creditsUsed;
    this.recordWallet(params, creditsUsed, `voice_${params.action}`);

    return { voiceSession, transcript, responseText, audioBase64, creditsUsed };
  }

  createTicket(params: {
    tenantId: string;
    userId: string;
    customerId: string;
    conversationId?: string;
    subject: string;
    description: string;
    priority?: Ticket['priority'];
    category?: string;
  }): TicketResponse {
    const ticket = this.tickets.create(params);
    const audit = this.audit.log({
      tenantId: params.tenantId,
      entityType: 'ticket',
      entityId: ticket.id,
      action: 'ticket.created',
      actorId: params.userId,
      actorName: 'User',
      details: { subject: params.subject },
    });
    return { ticket, auditLogId: audit.id };
  }

  getTicket(id: string): Ticket | undefined {
    return this.tickets.get(id);
  }

  listTickets(tenantId: string): Ticket[] {
    return this.tickets.list(tenantId);
  }

  async updateCrm(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    provider: string;
    entityType: 'contact' | 'ticket';
    entityId: string;
    data: Record<string, unknown>;
  }): Promise<CrmUpdateResponse> {
    routeSupportRequest({ taskType: 'chat', membershipTier: params.tier });
    const result = await this.crm.updateRecord({
      tenantId: params.tenantId,
      provider: params.provider as 'salesforce',
      entityType: params.entityType,
      entityId: params.entityId,
      data: params.data,
    });
    const creditsUsed = 5;
    this.recordWallet(params, creditsUsed, 'crm_update');
    return { success: true, externalId: result.record.externalId, stubbed: result.stubbed, creditsUsed };
  }

  submitFeedback(params: {
    tenantId: string;
    userId: string;
    conversationId: string;
    rating: number;
    comment?: string;
  }): SubmitFeedbackResponse {
    const feedback: Feedback = {
      id: `fb_${createId()}`,
      conversationId: params.conversationId,
      tenantId: params.tenantId,
      rating: params.rating,
      comment: params.comment,
      csat: params.rating,
      createdAt: new Date().toISOString(),
    };
    this.feedback.push(feedback);

    const conversation = this.conversations.get(params.conversationId);
    if (conversation) {
      conversation.status = 'resolved';
      conversation.summary = `Resolved with CSAT ${params.rating}/5`;
      conversation.endedAt = new Date().toISOString();
    }

    const creditsUsed = 1;
    this.recordWallet(params, creditsUsed, 'feedback');
    return { feedback, creditsUsed };
  }

  private resolveCustomer(params: {
    tenantId: string;
    customerId?: string;
    customerEmail?: string;
    customerName?: string;
    language?: SupportLanguage;
  }): Customer {
    if (params.customerId) {
      const existing = this.customers.get(params.customerId);
      if (existing) return existing;
    }

    const email = params.customerEmail ?? `guest_${createId()}@example.com`;
    const existing = [...this.customers.values()].find((c) => c.email === email);
    if (existing) return existing;

    const customer: Customer = {
      id: params.customerId ?? `cust_${createId()}`,
      tenantId: params.tenantId,
      email,
      name: params.customerName ?? email.split('@')[0] ?? 'Guest',
      language: params.language ?? 'en',
      createdAt: new Date().toISOString(),
    };
    this.customers.set(customer.id, customer);
    return customer;
  }

  private recordWallet(
    params: { userId: string; tenantId: string },
    credits: number,
    taskType: string,
  ): void {
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: 'Customer Support AI',
      model: 'support-orchestrator',
      credits,
      estimatedCostUsd: credits * 0.002,
      taskType,
      module: 'customer-support-ai',
    });
  }
}

export const defaultCustomerSupportAIService = new CustomerSupportAIService();
