/** AI-Pass Company Harness — CompanyOS-class: company as code, event-driven agent swarms */

export type TriggerKind = 'schedule' | 'webhook' | 'connector' | 'message' | 'change_request';

export type HarnessAgent = {
  id: string;
  name: string;
  job: string;
  model: string;
  skills: string[];
  status: 'idle' | 'running' | 'sleeping' | 'blocked';
};

export type HarnessTrigger = {
  id: string;
  name: string;
  kind: TriggerKind;
  filter: string;
  agentId: string;
  enabled: boolean;
};

export type HarnessOutcome = {
  id: string;
  goal: string;
  doneWhen: string;
  status: 'open' | 'working' | 'verify' | 'done';
  ownerAgentId: string;
};

export type HarnessSession = {
  id: string;
  agentId: string;
  title: string;
  lastEvent: string;
  computer: 'awake' | 'sleeping';
};

export type CompanyMemoryFile = {
  path: string;
  title: string;
  summary: string;
};

export const HARNESS_AGENTS: HarnessAgent[] = [
  {
    id: 'my-aipass',
    name: 'My AI-Pass',
    job: 'The one agent you talk to. Routes work; never blocks the conversation.',
    model: 'router',
    skills: ['route', 'handoff', 'status'],
    status: 'idle',
  },
  {
    id: 'ops-agent',
    name: 'Ops agent',
    job: 'Runs payments, tickets, and shop-floor follow-ups under policy.',
    model: 'enterprise',
    skills: ['payments', 'tickets', 'escalation'],
    status: 'sleeping',
  },
  {
    id: 'sales-agent',
    name: 'Sales agent',
    job: 'Pipeline follow-ups, quotes, and CRM writes with role walls.',
    model: 'enterprise',
    skills: ['crm', 'quotes', 'follow-up'],
    status: 'idle',
  },
  {
    id: 'research-agent',
    name: 'Research agent',
    job: 'Reads Drive, twin graph, and docs; returns evidence-backed briefs.',
    model: 'enterprise',
    skills: ['search', 'graph', 'brief'],
    status: 'sleeping',
  },
  {
    id: 'builder-agent',
    name: 'Builder agent',
    job: 'Ships internal apps and change requests for human approval.',
    model: 'enterprise',
    skills: ['codegen', 'preview', 'change-request'],
    status: 'idle',
  },
];

export const HARNESS_TRIGGERS: HarnessTrigger[] = [
  {
    id: 't-cron-morning',
    name: 'Morning ops digest',
    kind: 'schedule',
    filter: 'weekdays 08:00 Europe/Berlin',
    agentId: 'ops-agent',
    enabled: true,
  },
  {
    id: 't-webhook-stripe',
    name: 'Invoice paid webhook',
    kind: 'webhook',
    filter: 'event=invoice.paid',
    agentId: 'ops-agent',
    enabled: true,
  },
  {
    id: 't-connector-salesforce',
    name: 'Salesforce opportunity stage',
    kind: 'connector',
    filter: 'stage changed to Proposal',
    agentId: 'sales-agent',
    enabled: true,
  },
  {
    id: 't-slack-mention',
    name: 'Slack @AI-Pass',
    kind: 'message',
    filter: 'channel=#ops mentions bot',
    agentId: 'my-aipass',
    enabled: true,
  },
  {
    id: 't-cr-merged',
    name: 'Change request merged',
    kind: 'change_request',
    filter: 'skills/** merged to main',
    agentId: 'builder-agent',
    enabled: false,
  },
];

export const HARNESS_OUTCOMES: HarnessOutcome[] = [
  {
    id: 'o-1',
    goal: 'Close overdue AP invoices under €5k with dual control',
    doneWhen: 'All matching invoices paid or escalated with audit hop',
    status: 'working',
    ownerAgentId: 'ops-agent',
  },
  {
    id: 'o-2',
    goal: 'Refresh Q1 pipeline brief for enterprise accounts',
    doneWhen: 'Brief in Drive with evidence links; sales lead acknowledged',
    status: 'verify',
    ownerAgentId: 'sales-agent',
  },
  {
    id: 'o-3',
    goal: 'Ship internal twin status board',
    doneWhen: 'Preview URL live + change request approved',
    status: 'open',
    ownerAgentId: 'builder-agent',
  },
];

export const HARNESS_MEMORY: CompanyMemoryFile[] = [
  { path: 'company/mission.md', title: 'Mission', summary: 'Governed AI infrastructure and digital twins for every employee.' },
  { path: 'company/policies/payments.md', title: 'Payment policy', summary: 'Human confirmation required above threshold; role walls on wallet.' },
  { path: 'agents/my-aipass.md', title: 'My AI-Pass prompt', summary: 'Router: answer fast, hand off, never block.' },
  { path: 'skills/invoice-followup.md', title: 'Invoice follow-up skill', summary: 'Playbook shared by ops and finance agents.' },
  { path: 'connectors/salesforce.yaml', title: 'Salesforce connector', summary: 'CRM events into twin + sales agent.' },
];

export const HARNESS_LAYERS = [
  { title: 'Reach', copy: 'Web, Slack, Teams, email, MCP — one company memory.' },
  { title: 'Triggers', copy: 'Schedules, webhooks, connectors, and messages start agents.' },
  { title: 'My AI-Pass', copy: 'One agent to talk to. Routes work in the background.' },
  { title: 'Agents & swarms', copy: 'Specialists in parallel sessions; each reports back.' },
  { title: 'Outcomes', copy: 'Goals with a definition of done and a verifier.' },
  { title: 'Connectors', copy: 'ERP, CRM, APIs — same Connect platform into the twin.' },
  { title: 'Company as code', copy: 'Agents, skills, and rules live in a repo you own.' },
  { title: 'Control', copy: 'Approvals, audit, SSO — sovereign on your infra or ours.' },
];

/** Runtime safety — confirmation gates, twin context, role walls, audit */
export const HARNESS_SAFETY = [
  {
    id: 'confirm',
    title: 'Confirmation gates',
    copy: 'Payments, MES writes, and customer messages require human confirm before commit.',
  },
  {
    id: 'twin',
    title: 'Enterprise twin context',
    copy: 'Agents reason over Connect-fed assets, identities, and evidence — not a blank chat.',
  },
  {
    id: 'roles',
    title: 'Role walls',
    copy: 'Least-privilege from SSO / SCIM and Connect scopes; no silent privilege escalation.',
  },
  {
    id: 'routing',
    title: 'Model routing',
    copy: 'Any-model orchestration inside the harness — switch providers without rewriting agents.',
  },
  {
    id: 'audit',
    title: 'Full audit trail',
    copy: 'Tool calls, handoffs, and confirmations logged for Trust Engine and compliance.',
  },
  {
    id: 'feedback',
    title: 'Eval feedback loop',
    copy: 'Cortex / Realms failures update harness policy and Flow tasks automatically.',
  },
];

export function routeMessage(message: string): {
  reply: string;
  handoffs: Array<{ agentId: string; task: string }>;
  session: HarnessSession;
} {
  const lower = message.toLowerCase();
  const handoffs: Array<{ agentId: string; task: string }> = [];

  if (/pay|invoice|ops|ticket/.test(lower)) {
    handoffs.push({ agentId: 'ops-agent', task: 'Handle ops / payments follow-up from user message' });
  }
  if (/sales|deal|pipeline|crm|quote/.test(lower)) {
    handoffs.push({ agentId: 'sales-agent', task: 'Update pipeline / prepare sales next step' });
  }
  if (/research|brief|find|twin|graph|doc/.test(lower)) {
    handoffs.push({ agentId: 'research-agent', task: 'Research with twin evidence and return brief' });
  }
  if (/build|app|dashboard|ship|code/.test(lower)) {
    handoffs.push({ agentId: 'builder-agent', task: 'Propose internal app change for approval' });
  }
  if (handoffs.length === 0) {
    handoffs.push({ agentId: 'research-agent', task: 'Clarify and gather context from company memory' });
  }

  const names = handoffs
    .map((h) => HARNESS_AGENTS.find((a) => a.id === h.agentId)?.name ?? h.agentId)
    .join(', ');

  return {
    reply: `On it. I handed this to ${names} in the background — you can keep talking. I will report when each session finishes.`,
    handoffs,
    session: {
      id: `sess-${Date.now()}`,
      agentId: 'my-aipass',
      title: message.slice(0, 64) || 'New request',
      lastEvent: 'routed',
      computer: 'awake',
    },
  };
}

export function fireTrigger(trigger: HarnessTrigger): HarnessSession {
  return {
    id: `trig-${trigger.id}-${Date.now()}`,
    agentId: trigger.agentId,
    title: `Trigger: ${trigger.name}`,
    lastEvent: `${trigger.kind} matched filter`,
    computer: 'awake',
  };
}
