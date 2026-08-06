import type { AgentDecision } from '@ai-pass/shared';

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

export type DealStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export type CampaignType = 'cold' | 'nurturing' | 'follow_up' | 'upsell' | 'renewal' | 'investor_outreach';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export type EmailType =
  | 'cold'
  | 'follow_up'
  | 'intro'
  | 'investor'
  | 'partnership'
  | 'support'
  | 'proposal'
  | 'quotation';

export type LinkedInType =
  | 'connection'
  | 'follow_up'
  | 'inmail'
  | 'comment'
  | 'profile_optimization'
  | 'sequence';

export type ProposalType = 'proposal' | 'quotation' | 'rfp' | 'contract' | 'project_offer';

export type OutreachChannel = 'email' | 'linkedin' | 'whatsapp' | 'sms' | 'teams' | 'slack';

export interface Contact {
  id: string;
  tenantId: string;
  leadId?: string;
  email: string;
  name: string;
  title?: string;
  company?: string;
  linkedInUrl?: string;
  phone?: string;
  crmExternalId?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Lead {
  id: string;
  tenantId: string;
  contactId: string;
  company: string;
  industry?: string;
  companySize?: string;
  status: LeadStatus;
  score: number;
  source?: string;
  website?: string;
  notes?: string;
  assignedTo?: string;
  crmExternalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  tenantId: string;
  leadId: string;
  name: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expectedCloseDate?: string;
  crmExternalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailDraft {
  id: string;
  tenantId: string;
  leadId?: string;
  contactId?: string;
  type: EmailType;
  subject: string;
  body: string;
  personalization?: Record<string, string>;
  trustScore?: number;
  decision?: AgentDecision;
  confidence: number;
  creditsUsed: number;
  createdAt: string;
}

export interface LinkedInDraft {
  id: string;
  tenantId: string;
  leadId?: string;
  contactId?: string;
  type: LinkedInType;
  content: string;
  subject?: string;
  trustScore?: number;
  confidence: number;
  creditsUsed: number;
  createdAt: string;
}

export interface Proposal {
  id: string;
  tenantId: string;
  leadId?: string;
  dealId?: string;
  type: ProposalType;
  title: string;
  summary: string;
  sections: Array<{ heading: string; content: string }>;
  totalValue?: number;
  currency?: string;
  validUntil?: string;
  trustScore?: number;
  confidence: number;
  creditsUsed: number;
  createdAt: string;
}

export interface MeetingPrep {
  id: string;
  tenantId: string;
  leadId?: string;
  company: string;
  companySummary: string;
  decisionMakers: Array<{ name: string; title: string; linkedIn?: string }>;
  recentNews: string[];
  suggestedQuestions: string[];
  agenda: string[];
  strategy: string;
  risks: string[];
  opportunities: string[];
  creditsUsed: number;
  createdAt: string;
}

export interface OutreachStep {
  id: string;
  channel: OutreachChannel;
  delayDays: number;
  templateType: string;
  content?: string;
  status: 'pending' | 'sent' | 'skipped';
}

export interface OutreachSequence {
  id: string;
  tenantId: string;
  campaignId?: string;
  name: string;
  steps: OutreachStep[];
  status: CampaignStatus;
  createdAt: string;
}

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  leadIds: string[];
  sequenceId?: string;
  sentCount: number;
  openRate: number;
  replyRate: number;
  creditsUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface Analytics {
  openRate: number;
  replyRate: number;
  conversionRate: number;
  meetingsBooked: number;
  aiEffectiveness: number;
  roi: number;
  emailsSent: number;
  linkedInSent: number;
  proposalsGenerated: number;
  totalCreditsUsed: number;
  pipelineValue: number;
  dealsWon: number;
  trends: Array<{ date: string; emails: number; replies: number; meetings: number }>;
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

export interface KnowledgeReference {
  id: string;
  type: 'product' | 'pricing' | 'faq' | 'proposal' | 'battle_card';
  title: string;
  excerpt: string;
  sourceId: string;
  score: number;
}

export interface PersonalizationContext {
  website?: string;
  linkedIn?: string;
  crmHistory?: string[];
  conversations?: string[];
  industry?: string;
  title?: string;
  companySize?: string;
}
