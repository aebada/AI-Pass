import type {
  Analytics,
  Campaign,
  CampaignType,
  EmailDraft,
  EmailType,
  LinkedInDraft,
  LinkedInType,
  MeetingPrep,
  Proposal,
  ProposalType,
} from './types.js';

export interface EmailRequest {
  tenantId: string;
  userId: string;
  type: EmailType;
  leadId?: string;
  contactId?: string;
  recipientName?: string;
  recipientEmail?: string;
  company?: string;
  context?: string;
  tone?: string;
}

export interface EmailResponse {
  draft: EmailDraft;
  citations?: Array<{ title: string; excerpt: string }>;
  creditsUsed: number;
  liveSyncEventId?: string;
}

export interface LinkedInRequest {
  tenantId: string;
  userId: string;
  type: LinkedInType;
  leadId?: string;
  contactId?: string;
  recipientName?: string;
  company?: string;
  context?: string;
}

export interface LinkedInResponse {
  draft: LinkedInDraft;
  creditsUsed: number;
}

export interface ProposalRequest {
  tenantId: string;
  userId: string;
  type: ProposalType;
  leadId?: string;
  dealId?: string;
  title?: string;
  requirements?: string;
  budget?: number;
  currency?: string;
}

export interface ProposalResponse {
  proposal: Proposal;
  citations?: Array<{ title: string; excerpt: string }>;
  creditsUsed: number;
}

export interface MeetingPrepRequest {
  tenantId: string;
  userId: string;
  leadId?: string;
  company: string;
  website?: string;
  meetingGoal?: string;
}

export interface MeetingPrepResponse {
  prep: MeetingPrep;
  creditsUsed: number;
}

export interface CampaignRequest {
  tenantId: string;
  userId: string;
  name: string;
  type: CampaignType;
  leadIds: string[];
  steps?: Array<{ channel: string; delayDays: number; templateType: string }>;
}

export interface CampaignResponse {
  campaign: Campaign;
  creditsUsed: number;
  liveSyncEventId?: string;
}

export interface CampaignsListResponse {
  campaigns: Campaign[];
  total: number;
}

export interface CrmSyncRequest {
  tenantId: string;
  userId: string;
  provider: string;
  entityType: 'lead' | 'contact' | 'deal';
  entityId: string;
}

export interface CrmSyncResponse {
  success: boolean;
  externalId?: string;
  stubbed: boolean;
  creditsUsed: number;
}

export interface CopilotRequest {
  tenantId: string;
  userId: string;
  message: string;
  leadId?: string;
  dealId?: string;
  context?: string;
}

export interface CopilotResponse {
  reply: string;
  suggestions: string[];
  nextBestAction?: string;
  objections?: string[];
  dealInsights?: string[];
  followUps?: string[];
  confidence: number;
  creditsUsed: number;
}

export interface AnalyticsResponse extends Analytics {}

export interface DashboardStats {
  pipelineValue: number;
  activeCampaigns: number;
  openDeals: number;
  emailsSent: number;
  replyRate: number;
  meetingsBooked: number;
  conversionRate: number;
  totalCreditsUsed: number;
}

export interface ApiErrorBody {
  error: string;
  code?: string;
}
