import type { MembershipTier } from '@ai-pass/shared';
import type {
  AnalyticsResponse,
  CampaignRequest,
  CampaignResponse,
  CampaignsListResponse,
  CopilotRequest,
  CopilotResponse,
  CrmSyncRequest,
  CrmSyncResponse,
  DashboardStats,
  EmailRequest,
  EmailResponse,
  LinkedInRequest,
  LinkedInResponse,
  MeetingPrepRequest,
  MeetingPrepResponse,
  ProposalRequest,
  ProposalResponse,
} from '../api-types.js';
import type { CrmProvider } from '@ai-pass/crm-connectors';
import {
  DEMO_AUDIT_LOGS,
  DEMO_CAMPAIGNS,
  DEMO_CONTACTS,
  DEMO_DEALS,
  DEMO_EMAILS,
  DEMO_LEADS,
  DEMO_MEETING_PREP,
  DEMO_PROPOSAL,
} from '../demo-data.js';
import { emitAnalyticsRefresh } from '../livesync.js';
import { canAccessCrmIntegration } from '../membership-gates.js';
import type { AuditLog, Campaign, Contact, Deal, Lead, MeetingPrep, Proposal } from '../types.js';
import { AnalyticsService } from './analytics-service.js';
import { CampaignBuilderService } from './campaign-builder.js';
import { CrmService } from './crm-service.js';
import { EmailAssistantService } from './email-assistant.js';
import { LinkedInAssistantService } from './linkedin-assistant.js';
import { MeetingPrepService } from './meeting-prep.js';
import { ProposalGeneratorService } from './proposal-generator.js';
import { SalesCopilotService } from './sales-copilot.js';

export { WorkflowIntegrationService } from './workflow-integration.js';

export class SalesAIService {
  private leads = new Map<string, Lead>();
  private contacts = new Map<string, Contact>();
  private deals = new Map<string, Deal>();
  private auditLogs: AuditLog[] = [];

  private emailAssistant: EmailAssistantService;
  private linkedInAssistant: LinkedInAssistantService;
  private proposalGenerator: ProposalGeneratorService;
  private meetingPrep: MeetingPrepService;
  private campaignBuilder: CampaignBuilderService;
  private copilotService: SalesCopilotService;
  private crm: CrmService;
  private analytics: AnalyticsService;

  constructor(seedDemo = true) {
    this.emailAssistant = new EmailAssistantService();
    this.linkedInAssistant = new LinkedInAssistantService();
    this.proposalGenerator = new ProposalGeneratorService();
    this.meetingPrep = new MeetingPrepService();
    this.campaignBuilder = new CampaignBuilderService();
    this.copilotService = new SalesCopilotService();
    this.crm = new CrmService();
    this.analytics = new AnalyticsService();

    if (seedDemo) this.seedDemoData();
  }

  private seedDemoData(): void {
    for (const c of DEMO_CONTACTS) this.contacts.set(c.id, c);
    for (const l of DEMO_LEADS) this.leads.set(l.id, l);
    for (const d of DEMO_DEALS) this.deals.set(d.id, d);
    this.emailAssistant = new EmailAssistantService(DEMO_EMAILS);
    this.proposalGenerator = new ProposalGeneratorService([DEMO_PROPOSAL]);
    this.meetingPrep = new MeetingPrepService([DEMO_MEETING_PREP]);
    this.campaignBuilder = new CampaignBuilderService(DEMO_CAMPAIGNS);
    this.auditLogs = [...DEMO_AUDIT_LOGS];
  }

  getDashboard(tenantId: string): DashboardStats {
    const analytics = this.getAnalyticsInternal(tenantId);
    return {
      pipelineValue: analytics.pipelineValue,
      activeCampaigns: this.campaignBuilder.list(tenantId).filter((c) => c.status === 'active').length,
      openDeals: [...this.deals.values()].filter((d) => d.tenantId === tenantId && !d.stage.startsWith('closed')).length,
      emailsSent: analytics.emailsSent,
      replyRate: analytics.replyRate,
      meetingsBooked: analytics.meetingsBooked,
      conversionRate: analytics.conversionRate,
      totalCreditsUsed: analytics.totalCreditsUsed,
    };
  }

  listLeads(tenantId: string): Lead[] {
    return [...this.leads.values()].filter((l) => l.tenantId === tenantId);
  }

  getLead(id: string): Lead | undefined {
    return this.leads.get(id);
  }

  getContact(id: string): Contact | undefined {
    return this.contacts.get(id);
  }

  listDeals(tenantId: string): Deal[] {
    return [...this.deals.values()].filter((d) => d.tenantId === tenantId);
  }

  listCampaigns(tenantId: string): Campaign[] {
    return this.campaignBuilder.list(tenantId);
  }

  listEmails(tenantId: string) {
    return this.emailAssistant.list(tenantId);
  }

  listProposals(tenantId: string): Proposal[] {
    return this.proposalGenerator.list(tenantId);
  }

  listMeetingPreps(tenantId: string): MeetingPrep[] {
    return this.meetingPrep.list(tenantId);
  }

  listCrmProviders() {
    return this.crm.listProviders();
  }

  generateEmail(params: EmailRequest & { tier: MembershipTier }): EmailResponse {
    const lead = params.leadId ? this.leads.get(params.leadId) : undefined;
    const contact = params.contactId ? this.contacts.get(params.contactId) :
      lead ? this.contacts.get(lead.contactId) : undefined;

    const result = this.emailAssistant.generate({
      tenantId: params.tenantId,
      userId: params.userId,
      tier: params.tier,
      type: params.type,
      leadId: params.leadId,
      contactId: params.contactId ?? contact?.id,
      recipientName: params.recipientName ?? contact?.name,
      company: params.company ?? lead?.company ?? contact?.company,
      context: params.context,
      tone: params.tone,
      industry: lead?.industry,
      title: contact?.title,
    });

    return { ...result, liveSyncEventId: undefined };
  }

  generateLinkedIn(params: LinkedInRequest & { tier: MembershipTier }): LinkedInResponse {
    const lead = params.leadId ? this.leads.get(params.leadId) : undefined;
    const contact = params.contactId ? this.contacts.get(params.contactId) :
      lead ? this.contacts.get(lead.contactId) : undefined;

    return this.linkedInAssistant.generate({
      tenantId: params.tenantId,
      userId: params.userId,
      tier: params.tier,
      type: params.type,
      leadId: params.leadId,
      contactId: params.contactId ?? contact?.id,
      recipientName: params.recipientName ?? contact?.name,
      company: params.company ?? lead?.company,
      context: params.context,
    });
  }

  generateProposal(params: ProposalRequest & { tier: MembershipTier }): ProposalResponse {
    const lead = params.leadId ? this.leads.get(params.leadId) : undefined;
    const deal = params.dealId ? this.deals.get(params.dealId) : undefined;

    return this.proposalGenerator.generate({
      tenantId: params.tenantId,
      userId: params.userId,
      tier: params.tier,
      type: params.type,
      leadId: params.leadId,
      dealId: params.dealId,
      title: params.title,
      requirements: params.requirements,
      budget: params.budget ?? deal?.value,
      currency: params.currency ?? deal?.currency,
      company: lead?.company,
    });
  }

  generateMeetingPrep(params: MeetingPrepRequest & { tier: MembershipTier }): MeetingPrepResponse {
    const lead = params.leadId ? this.leads.get(params.leadId) : undefined;
    return this.meetingPrep.generate({
      tenantId: params.tenantId,
      userId: params.userId,
      tier: params.tier,
      leadId: params.leadId,
      company: params.company,
      website: params.website ?? lead?.website,
      meetingGoal: params.meetingGoal,
      industry: lead?.industry,
    });
  }

  createCampaign(params: CampaignRequest & { tier: MembershipTier }): CampaignResponse {
    const result = this.campaignBuilder.create({
      tenantId: params.tenantId,
      userId: params.userId,
      tier: params.tier,
      name: params.name,
      type: params.type,
      leadIds: params.leadIds,
      steps: params.steps,
    });
    return result;
  }

  getCampaigns(tenantId: string): CampaignsListResponse {
    const campaigns = this.campaignBuilder.list(tenantId);
    return { campaigns, total: campaigns.length };
  }

  async syncCrm(params: CrmSyncRequest & { tier: MembershipTier }): Promise<CrmSyncResponse> {
    if (!canAccessCrmIntegration(params.tier)) {
      throw new Error('CRM sync requires Business (Power) membership or higher.');
    }

    const provider = params.provider as CrmProvider;
    let data: Record<string, unknown> = {};
    let entityId = params.entityId;

    if (params.entityType === 'lead') {
      const lead = this.leads.get(params.entityId);
      if (lead) {
        const contact = this.contacts.get(lead.contactId);
        const result = await this.crm.syncLead(params.tenantId, lead, contact);
        return { success: true, externalId: result.record.externalId, stubbed: result.stubbed, creditsUsed: 2 };
      }
    } else if (params.entityType === 'deal') {
      const deal = this.deals.get(params.entityId);
      if (deal) {
        const result = await this.crm.syncDeal(params.tenantId, deal);
        return { success: true, externalId: result.record.externalId, stubbed: result.stubbed, creditsUsed: 2 };
      }
    }

    const result = await this.crm.syncEntity({
      tenantId: params.tenantId,
      provider,
      entityType: params.entityType,
      entityId,
      data,
    });

    return { success: true, externalId: result.record.externalId, stubbed: result.stubbed, creditsUsed: 2 };
  }

  copilot(params: CopilotRequest & { tier: MembershipTier }): CopilotResponse {
    const lead = params.leadId ? this.leads.get(params.leadId) : undefined;
    const deal = params.dealId ? this.deals.get(params.dealId) : undefined;

    return this.copilotService.chat({
      tenantId: params.tenantId,
      userId: params.userId,
      tier: params.tier,
      message: params.message,
      lead,
      deal,
      context: params.context,
    });
  }

  getAnalytics(tenantId: string): AnalyticsResponse {
    void emitAnalyticsRefresh(tenantId);
    return this.getAnalyticsInternal(tenantId);
  }

  private getAnalyticsInternal(tenantId: string): AnalyticsResponse {
    return this.analytics.compute({
      leads: this.listLeads(tenantId),
      deals: this.listDeals(tenantId),
      campaigns: this.campaignBuilder.list(tenantId),
      emails: this.emailAssistant.list(tenantId),
      auditLogs: this.auditLogs.filter((a) => a.tenantId === tenantId),
    });
  }
}

export const defaultSalesAIService = new SalesAIService();
