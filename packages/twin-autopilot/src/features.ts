import type { AutopilotFeatureId } from './types.js';

/** Instinct functions we own first-party inside AI-Pass twin autopilot. */
export const INSTINCT_PARITY_FEATURES: {
  id: AutopilotFeatureId;
  name: string;
  instinctCue: string;
  aipass: string;
  status: 'available' | 'beta' | 'planned';
}[] = [
  {
    id: 'chat_channels',
    name: 'Chat as the interface',
    instinctCue: 'Text / WhatsApp / call — no new app UI',
    aipass: 'WhatsApp Cloud API + SMS + in-app twin chat; same no-new-UI pattern',
    status: 'available',
  },
  {
    id: 'cloud_computer',
    name: 'Cloud computer & browser',
    instinctCue: 'Agent runs a persistent cloud browser/computer',
    aipass: 'Twin cloud session with browser tools under Company Harness gates',
    status: 'beta',
  },
  {
    id: 'secure_vault',
    name: 'Secure credential vault',
    instinctCue: 'Vault link to enter logins for sites',
    aipass: 'Vault refs only — secrets stay in host vault; twin never sees raw passwords in prompts',
    status: 'available',
  },
  {
    id: 'proactive_followups',
    name: 'Proactive follow-ups',
    instinctCue: 'Agent starts threads when something needs attention',
    aipass: 'Proactive task queue notifies via WhatsApp/email when twin work needs a human',
    status: 'available',
  },
  {
    id: 'concierge_calls',
    name: 'Concierge phone calls',
    instinctCue: 'Outbound calls to businesses on your behalf',
    aipass: 'Concierge call requests with approval before dial; voice provider pluggable',
    status: 'beta',
  },
  {
    id: 'trusted_twins',
    name: 'Trusted twin network',
    instinctCue: 'Trusted Person — agent-to-agent coordination with approval',
    aipass: 'Trusted twin peers; explicit approve before twin-to-twin messages or file handoff',
    status: 'available',
  },
  {
    id: 'payment_gates',
    name: 'Payment approval gates',
    instinctCue: 'Nothing charged until user approves; one-time cards',
    aipass: 'PaymentApproval objects; twin cannot spend without confirm — Harness irreversible gate',
    status: 'available',
  },
  {
    id: 'group_coordination',
    name: 'Group coordination',
    instinctCue: 'Add agent to group chats to plan together',
    aipass: 'Group threads across approved twins + WhatsApp groups (when business API allows)',
    status: 'beta',
  },
  {
    id: 'connectors',
    name: 'Account connectors',
    instinctCue: 'Google, Slack, Notion, calendar, shopping',
    aipass: 'Connect catalog (Workspace, Slack, CRM, ERP) feeding the same twin',
    status: 'available',
  },
  {
    id: 'approval_gates',
    name: 'Human confirmation gates',
    instinctCue: 'Ask before irreversible actions',
    aipass: 'Company Harness confirmations on spend, send, delete, and external posts',
    status: 'available',
  },
];
