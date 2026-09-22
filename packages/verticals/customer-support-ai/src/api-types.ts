import type {
  Conversation,
  Feedback,
  Message,
  SupportLanguage,
  Ticket,
  VoiceSession,
} from './types.js';

export interface StartConversationRequest {
  tenantId: string;
  userId: string;
  customerId?: string;
  customerEmail?: string;
  customerName?: string;
  channel: Conversation['channel'];
  language?: SupportLanguage;
}

export interface StartConversationResponse {
  conversation: Conversation;
  welcomeMessage: Message;
  creditsUsed: number;
  liveSyncEventId?: string;
}

export interface SendMessageRequest {
  conversationId: string;
  tenantId: string;
  userId: string;
  content: string;
  language?: SupportLanguage;
}

export interface SendMessageResponse {
  message: Message;
  response: Message;
  conversation: Conversation;
  escalated: boolean;
  workflowExecutionId?: string;
  creditsUsed: number;
}

export interface VoiceConversationRequest {
  conversationId: string;
  tenantId: string;
  userId: string;
  audioBase64?: string;
  language?: SupportLanguage;
  action: 'start' | 'transcribe' | 'synthesize' | 'end';
}

export interface VoiceConversationResponse {
  voiceSession: VoiceSession;
  transcript?: string;
  responseText?: string;
  audioBase64?: string;
  creditsUsed: number;
}

export interface ConversationHistoryResponse {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  total: number;
}

export interface CreateTicketRequest {
  tenantId: string;
  userId: string;
  customerId: string;
  conversationId?: string;
  subject: string;
  description: string;
  priority?: Ticket['priority'];
  category?: string;
}

export interface TicketResponse {
  ticket: Ticket;
  crmExternalId?: string;
  auditLogId?: string;
}

export interface CrmUpdateRequest {
  tenantId: string;
  userId: string;
  provider: string;
  entityType: 'contact' | 'ticket';
  entityId: string;
  data: Record<string, unknown>;
}

export interface CrmUpdateResponse {
  success: boolean;
  externalId?: string;
  stubbed: boolean;
  creditsUsed: number;
}

export interface AnalyticsResponse {
  activeConversations: number;
  openTickets: number;
  aiResolutionRate: number;
  escalationRate: number;
  avgCsat: number;
  avgResponseTimeMs: number;
  voiceUsagePercent: number;
  chatUsagePercent: number;
  avgConfidence: number;
  totalCostCredits: number;
  topIssues: Array<{ intent: string; count: number }>;
  trends: Array<{ date: string; conversations: number; resolved: number; escalated: number }>;
}

export interface SubmitFeedbackRequest {
  tenantId: string;
  userId: string;
  conversationId: string;
  rating: number;
  comment?: string;
}

export interface SubmitFeedbackResponse {
  feedback: Feedback;
  creditsUsed: number;
}

export interface DashboardStats {
  activeConversations: number;
  openTickets: number;
  aiResolutionRate: number;
  escalationRate: number;
  avgCsat: number;
  avgResponseTimeMs: number;
  voiceUsagePercent: number;
  chatUsagePercent: number;
  avgConfidence: number;
  totalCostCredits: number;
}

export interface ApiErrorBody {
  error: string;
  code?: string;
}
