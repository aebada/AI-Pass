import type { AppTemplate } from './types.js';

export const APP_TEMPLATES: AppTemplate[] = [
  {
    id: 'crm-starter',
    name: 'CRM Starter',
    description: 'Contact management, pipeline tracking, and activity logging',
    category: 'crm',
    platforms: ['web', 'mobile'],
    modules: ['contacts', 'deals', 'activities'],
    defaultScreens: ['Dashboard', 'Contact List', 'Contact Form', 'Pipeline'],
    agentPacks: ['lead-scoring', 'email-drafting'],
  },
  {
    id: 'invoice-ai',
    name: 'Invoice AI',
    description: 'Invoice capture, validation, approval routing, and ERP sync',
    category: 'finance',
    platforms: ['web', 'mobile', 'workflow'],
    modules: ['invoices', 'vendors', 'approvals', 'reports'],
    defaultScreens: ['Dashboard', 'Invoice Queue', 'Approval Inbox', 'Reports'],
    agentPacks: ['document-extraction', 'fraud-detection', 'approval-routing'],
    storeAppId: 'invoice-ai',
  },
  {
    id: 'customer-support',
    name: 'Customer Support',
    description: 'Ticket management, AI agent responses, and escalation workflows',
    category: 'support',
    platforms: ['web', 'mobile', 'workflow'],
    modules: ['tickets', 'knowledge-base', 'escalations'],
    defaultScreens: ['Agent Console', 'Ticket Queue', 'Customer Portal'],
    agentPacks: ['customer-support', 'sentiment-analysis', 'escalation'],
    storeAppId: 'customer-support',
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain AI',
    description: 'Sourcing events, offer evaluation, ranking, and award decisions',
    category: 'supply_chain',
    platforms: ['web', 'workflow'],
    modules: ['sourcing-events', 'offers', 'policies', 'decisions'],
    defaultScreens: ['Event Dashboard', 'Offer Compare', 'Decision Report'],
    agentPacks: ['offer-extraction', 'compliance-check', 'scoring'],
    storeAppId: 'supply-chain',
  },
];

export class TemplateRegistry {
  list(category?: AppTemplate['category']): AppTemplate[] {
    return category ? APP_TEMPLATES.filter((t) => t.category === category) : APP_TEMPLATES;
  }

  get(id: string): AppTemplate | undefined {
    return APP_TEMPLATES.find((t) => t.id === id);
  }

  forStoreApp(storeAppId: string): AppTemplate | undefined {
    return APP_TEMPLATES.find((t) => t.storeAppId === storeAppId);
  }
}

export function createTemplatePlatform() {
  return { registry: new TemplateRegistry() };
}

export * from './types.js';
export * from './scaffold.js';
