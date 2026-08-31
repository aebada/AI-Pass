import type { AgentDecision } from '@ai-pass/shared';

export type SupportLanguage = 'en' | 'de' | 'ar' | string;

export type ConversationChannel = 'web' | 'mobile' | 'whatsapp' | 'teams' | 'slack' | 'email' | 'voice';

export type ConversationStatus = 'active' | 'waiting' | 'escalated' | 'resolved' | 'closed';

export type MessageRole = 'customer' | 'agent' | 'system' | 'ai';

export type SupportIntent =
  | 'order_status'
  | 'refund'
  | 'complaint'
  | 'technical'
  | 'booking'
  | 'cancellation'
  | 'account'
  | 'general'
  | 'custom';

export type EscalationReason =
  | 'low_confidence'
  | 'emotional'
  | 'financial'
  | 'legal'
  | 'repeated_failure'
  | 'manual';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed' | 'reopened';

export interface Customer {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  phone?: string;
  language: SupportLanguage;
  crmExternalId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface KnowledgeReference {
  id: string;
  type: 'faq' | 'policy' | 'order' | 'crm' | 'product';
  title: string;
  excerpt: string;
  sourceId: string;
  score: number;
  url?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  language: SupportLanguage;
  intent?: SupportIntent;
  confidence?: number;
  citations?: KnowledgeReference[];
  createdAt: string;
}

export interface VoiceSession {
  id: string;
  conversationId: string;
  language: SupportLanguage;
  status: 'recording' | 'processing' | 'speaking' | 'idle' | 'ended';
  durationSeconds: number;
  transcript?: string;
  recordingMetadata?: {
    format: string;
    sampleRate: number;
    channels: number;
    stubbed: boolean;
  };
  startedAt: string;
  endedAt?: string;
}

export interface WorkflowExecution {
  id: string;
  conversationId: string;
  workflowId: string;
  workflowName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  currentStep?: string;
  result?: Record<string, unknown>;
  startedAt: string;
  completedAt?: string;
}

export interface Conversation {
  id: string;
  tenantId: string;
  customerId: string;
  channel: ConversationChannel;
  language: SupportLanguage;
  status: ConversationStatus;
  intent?: SupportIntent;
  confidence: number;
  trustScore?: number;
  decision?: AgentDecision;
  voiceSessionId?: string;
  ticketId?: string;
  summary?: string;
  creditsUsed: number;
  startedAt: string;
  endedAt?: string;
  lastMessageAt?: string;
}

export interface Ticket {
  id: string;
  tenantId: string;
  conversationId?: string;
  customerId: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category?: string;
  assigneeId?: string;
  assigneeName?: string;
  slaDueAt?: string;
  slaBreached?: boolean;
  crmExternalId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}

export interface CRMRecord {
  id: string;
  tenantId: string;
  provider: string;
  externalId: string;
  entityType: 'contact' | 'ticket' | 'case' | 'deal';
  data: Record<string, unknown>;
  syncedAt: string;
}

export interface Feedback {
  id: string;
  conversationId: string;
  tenantId: string;
  rating: number;
  comment?: string;
  csat?: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  tenantId: string;
  entityType: string;
  entityId: string;
  action: string;
  actorId: string;
  actorName: string;
  details: Record<string, unknown>;
  creditsUsed?: number;
  timestamp: string;
}

export interface Intent {
  type: SupportIntent;
  confidence: number;
  entities: Record<string, string>;
  language: SupportLanguage;
}
