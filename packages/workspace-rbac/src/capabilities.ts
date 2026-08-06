import type { Capability, CapabilityDefinition } from './types.js';

export const CAPABILITY_CATALOG: CapabilityDefinition[] = [
  {
    id: 'workspace:read',
    label: 'Read workspace',
    description: 'View workspace modules and content',
    category: 'workspace',
  },
  {
    id: 'workspace:write',
    label: 'Write workspace',
    description: 'Create and edit workspace content',
    category: 'workspace',
  },
  {
    id: 'playground:use',
    label: 'Use Playground',
    description: 'Access AI Playground chat',
    category: 'workspace',
  },
  {
    id: 'agents:create',
    label: 'Create agents',
    description: 'Create new agents in Agent Studio',
    category: 'agents',
  },
  {
    id: 'agents:publish',
    label: 'Publish agents',
    description: 'Publish agents to the workspace or store',
    category: 'agents',
  },
  {
    id: 'agents:run',
    label: 'Run agents',
    description: 'Execute installed agents',
    category: 'agents',
  },
  {
    id: 'skills:create',
    label: 'Create skills',
    description: 'Author new skills',
    category: 'agents',
  },
  {
    id: 'skills:publish',
    label: 'Publish skills',
    description: 'Publish skills for others to use',
    category: 'agents',
  },
  {
    id: 'frames:use',
    label: 'Use Frames',
    description: 'Access Frames experiences',
    category: 'agents',
  },
  {
    id: 'audit:read',
    label: 'Access audit logs',
    description: 'View security and activity audit logs',
    category: 'governance',
  },
  {
    id: 'members:manage',
    label: 'Manage members',
    description: 'Invite, deactivate, and assign roles to members',
    category: 'governance',
  },
  {
    id: 'groups:manage',
    label: 'Manage groups',
    description: 'Create groups and assign capabilities',
    category: 'governance',
  },
  {
    id: 'analytics:read',
    label: 'View analytics',
    description: 'Access workspace usage analytics',
    category: 'governance',
  },
  {
    id: 'settings:sensitive',
    label: 'Sensitive settings',
    description: 'Change sensitive workspace settings',
    category: 'sensitive',
    adminOnly: true,
  },
  {
    id: 'billing:manage',
    label: 'Billing',
    description: 'Manage plans, invoices, and payment methods',
    category: 'sensitive',
    adminOnly: true,
  },
  {
    id: 'connectors:manage',
    label: 'Connectors',
    description: 'Configure ERP, CRM, and other connectors',
    category: 'sensitive',
    adminOnly: true,
  },
  {
    id: 'it_security:manage',
    label: 'IT & Security',
    description: 'SSO, SCIM tokens, security policies',
    category: 'sensitive',
    adminOnly: true,
  },
  {
    id: 'wallet:spend',
    label: 'Wallet spend',
    description: 'Spend wallet credits',
    category: 'admin',
  },
  {
    id: 'trust:audit',
    label: 'Trust audit',
    description: 'Run trust audits and certifications',
    category: 'governance',
  },
  {
    id: 'compliance:approve',
    label: 'Compliance approvals',
    description: 'Approve compliance workflows',
    category: 'governance',
  },
];

export const CAPABILITY_IDS: Capability[] = CAPABILITY_CATALOG.map((c) => c.id);

export function getCapability(id: Capability): CapabilityDefinition | undefined {
  return CAPABILITY_CATALOG.find((c) => c.id === id);
}

/** Capabilities Managers must never receive via role alone. */
export const ADMIN_ONLY_CAPABILITIES: Capability[] = CAPABILITY_CATALOG.filter((c) => c.adminOnly).map(
  (c) => c.id,
);
