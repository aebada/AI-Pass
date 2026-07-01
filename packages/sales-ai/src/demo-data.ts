import type {
  AuditLog,
  Campaign,
  Contact,
  Deal,
  EmailDraft,
  Lead,
  MeetingPrep,
  Proposal,
} from './types.js';

export const DEMO_TENANT_ID = 'tenant_acme';

export const DEMO_CONTACTS: Contact[] = [
  {
    id: 'contact_001',
    tenantId: DEMO_TENANT_ID,
    leadId: 'lead_001',
    email: 'sophie.weber@techflow.de',
    name: 'Sophie Weber',
    title: 'VP of Engineering',
    company: 'TechFlow GmbH',
    linkedInUrl: 'https://linkedin.com/in/sophieweber',
    crmExternalId: 'hubspot_sophie_weber',
    createdAt: '2026-06-01T10:00:00Z',
  },
  {
    id: 'contact_002',
    tenantId: DEMO_TENANT_ID,
    leadId: 'lead_002',
    email: 'marcus.chen@nordicdata.io',
    name: 'Marcus Chen',
    title: 'CTO',
    company: 'Nordic Data Solutions',
    linkedInUrl: 'https://linkedin.com/in/marcuschen',
    createdAt: '2026-06-05T14:00:00Z',
  },
  {
    id: 'contact_003',
    tenantId: DEMO_TENANT_ID,
    leadId: 'lead_003',
    email: 'elena.rodriguez@scaleup.es',
    name: 'Elena Rodríguez',
    title: 'Head of Sales',
    company: 'ScaleUp Ventures',
    phone: '+34 600 123 456',
    createdAt: '2026-06-10T09:00:00Z',
  },
];

export const DEMO_LEADS: Lead[] = [
  {
    id: 'lead_001',
    tenantId: DEMO_TENANT_ID,
    contactId: 'contact_001',
    company: 'TechFlow GmbH',
    industry: 'SaaS',
    companySize: '50-200',
    status: 'qualified',
    score: 87,
    source: 'LinkedIn',
    website: 'https://techflow.de',
    notes: 'Interested in AI sales automation. Budget Q3.',
    assignedTo: 'demo-user',
    crmExternalId: 'hubspot_lead_001',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-06-28T15:00:00Z',
  },
  {
    id: 'lead_002',
    tenantId: DEMO_TENANT_ID,
    contactId: 'contact_002',
    company: 'Nordic Data Solutions',
    industry: 'Data Analytics',
    companySize: '20-50',
    status: 'contacted',
    score: 72,
    source: 'Conference',
    website: 'https://nordicdata.io',
    assignedTo: 'demo-user',
    createdAt: '2026-06-05T14:00:00Z',
    updatedAt: '2026-06-25T11:00:00Z',
  },
  {
    id: 'lead_003',
    tenantId: DEMO_TENANT_ID,
    contactId: 'contact_003',
    company: 'ScaleUp Ventures',
    industry: 'Venture Capital',
    companySize: '10-20',
    status: 'new',
    score: 65,
    source: 'Referral',
    website: 'https://scaleup.es',
    notes: 'Investor outreach — portfolio company intros.',
    createdAt: '2026-06-10T09:00:00Z',
    updatedAt: '2026-06-10T09:00:00Z',
  },
];

export const DEMO_DEALS: Deal[] = [
  {
    id: 'deal_001',
    tenantId: DEMO_TENANT_ID,
    leadId: 'lead_001',
    name: 'TechFlow — Enterprise License',
    value: 48000,
    currency: 'EUR',
    stage: 'proposal',
    probability: 60,
    expectedCloseDate: '2026-08-15',
    crmExternalId: 'hubspot_deal_001',
    createdAt: '2026-06-15T10:00:00Z',
    updatedAt: '2026-06-28T15:00:00Z',
  },
];

export const DEMO_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp_001',
    tenantId: DEMO_TENANT_ID,
    name: 'Q3 SaaS Cold Outreach',
    type: 'cold',
    status: 'active',
    leadIds: ['lead_001', 'lead_002'],
    sequenceId: 'seq_001',
    sentCount: 48,
    openRate: 42,
    replyRate: 18,
    creditsUsed: 96,
    createdAt: '2026-06-01T08:00:00Z',
    updatedAt: '2026-06-28T12:00:00Z',
  },
  {
    id: 'camp_002',
    tenantId: DEMO_TENANT_ID,
    name: 'Investor Intro Sequence',
    type: 'investor_outreach',
    status: 'draft',
    leadIds: ['lead_003'],
    sentCount: 0,
    openRate: 0,
    replyRate: 0,
    creditsUsed: 0,
    createdAt: '2026-06-20T10:00:00Z',
    updatedAt: '2026-06-20T10:00:00Z',
  },
];

export const DEMO_EMAILS: EmailDraft[] = [
  {
    id: 'email_001',
    tenantId: DEMO_TENANT_ID,
    leadId: 'lead_001',
    contactId: 'contact_001',
    type: 'cold',
    subject: 'Accelerating TechFlow\'s sales pipeline with AI',
    body: `Hi Sophie,

I noticed TechFlow recently expanded your engineering team — congrats on the growth. Many SaaS companies at your stage struggle to scale outbound without adding headcount.

We help teams like yours generate personalized emails, proposals, and meeting prep in minutes — with CRM sync built in. Would a 15-minute call next week make sense to explore if this fits your Q3 goals?

Best,
Alex`,
    personalization: { company: 'TechFlow GmbH', title: 'VP of Engineering', industry: 'SaaS' },
    trustScore: 91,
    decision: 'PASS',
    confidence: 0.89,
    creditsUsed: 3,
    createdAt: '2026-06-20T14:00:00Z',
  },
  {
    id: 'email_002',
    tenantId: DEMO_TENANT_ID,
    leadId: 'lead_002',
    contactId: 'contact_002',
    type: 'follow_up',
    subject: 'Following up — Nordic Data + AI sales workflows',
    body: `Hi Marcus,

Just circling back on my note from last week. Given Nordic Data's focus on analytics, I thought our ROI tracking for outreach campaigns might resonate.

Happy to share a quick demo tailored to data-driven sales teams.

Best,
Alex`,
    trustScore: 88,
    decision: 'PASS',
    confidence: 0.85,
    creditsUsed: 2,
    createdAt: '2026-06-25T11:00:00Z',
  },
];

export const DEMO_PROPOSAL: Proposal = {
  id: 'prop_001',
  tenantId: DEMO_TENANT_ID,
  leadId: 'lead_001',
  dealId: 'deal_001',
  type: 'proposal',
  title: 'TechFlow GmbH — Sales AI Platform Proposal',
  summary: 'Enterprise Sales AI license for 25 seats with CRM integration, campaign automation, and dedicated onboarding.',
  sections: [
    {
      heading: 'Executive Summary',
      content: 'AI Pass Sales AI will help TechFlow scale outbound revenue operations with personalized email, LinkedIn outreach, proposal generation, and pipeline analytics.',
    },
    {
      heading: 'Scope of Work',
      content: '25 user licenses, HubSpot CRM sync, 3 campaign templates, meeting prep automation, and quarterly business reviews.',
    },
    {
      heading: 'Investment',
      content: '€48,000/year (Business tier) including onboarding, training, and priority support.',
    },
    {
      heading: 'Timeline',
      content: '4-week implementation: Week 1 CRM setup, Week 2 knowledge base, Week 3 campaign launch, Week 4 team training.',
    },
  ],
  totalValue: 48000,
  currency: 'EUR',
  validUntil: '2026-07-31',
  trustScore: 93,
  confidence: 0.91,
  creditsUsed: 8,
  createdAt: '2026-06-26T10:00:00Z',
};

export const DEMO_MEETING_PREP: MeetingPrep = {
  id: 'prep_001',
  tenantId: DEMO_TENANT_ID,
  leadId: 'lead_001',
  company: 'TechFlow GmbH',
  companySummary: 'TechFlow is a B2B SaaS company based in Berlin, specializing in workflow automation for mid-market enterprises. Recently raised Series A and expanding sales team.',
  decisionMakers: [
    { name: 'Sophie Weber', title: 'VP of Engineering', linkedIn: 'https://linkedin.com/in/sophieweber' },
    { name: 'Thomas Klein', title: 'CEO', linkedIn: 'https://linkedin.com/in/thomasklein' },
  ],
  recentNews: [
    'TechFlow announced 40% YoY revenue growth in Q1 2026',
    'Launched integration marketplace for third-party connectors',
    'Hiring 15 new sales reps across DACH region',
  ],
  suggestedQuestions: [
    'What does your current outbound workflow look like today?',
    'How are you measuring sales team productivity?',
    'What CRM and tools is the team using?',
    'What are your Q3 pipeline targets?',
    'Who else should be involved in evaluating sales tooling?',
  ],
  agenda: [
    'Introductions and goals (5 min)',
    'Current state assessment (10 min)',
    'Sales AI demo — email + CRM sync (15 min)',
    'ROI discussion and next steps (10 min)',
  ],
  strategy: 'Lead with engineering efficiency angle — Sophie cares about tooling that reduces manual work. Reference their hiring push and position Sales AI as force multiplier for new reps.',
  risks: [
    'Budget may be allocated to core product development',
    'Existing HubSpot workflows may create switching friction',
    'CEO may want to see ROI data before committing',
  ],
  opportunities: [
    'Series A growth mandate creates urgency for sales efficiency',
    'HubSpot integration is native — low implementation risk',
    'Multi-seat deal with expansion potential',
  ],
  creditsUsed: 5,
  createdAt: '2026-06-27T09:00:00Z',
};

export const DEMO_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud_sales_001',
    tenantId: DEMO_TENANT_ID,
    entityType: 'campaign',
    entityId: 'camp_001',
    action: 'campaign.sent',
    actorId: 'demo-user',
    actorName: 'Alex Kim',
    details: { sentCount: 24, channel: 'email' },
    creditsUsed: 48,
    timestamp: '2026-06-28T12:00:00Z',
  },
  {
    id: 'aud_sales_002',
    tenantId: DEMO_TENANT_ID,
    entityType: 'deal',
    entityId: 'deal_001',
    action: 'deal.updated',
    actorId: 'demo-user',
    actorName: 'Alex Kim',
    details: { stage: 'proposal', probability: 60 },
    timestamp: '2026-06-28T15:00:00Z',
  },
];
