import { createId } from '@ai-pass/shared';
import type {
  Actor,
  DataEntity,
  Integration,
  RequirementSpec,
  RequirementsInput,
  UIScreen,
  Workflow,
  WorkflowStep,
} from './types.js';

const ACTOR_PATTERNS = [
  { pattern: /\b(admin|administrator|manager)\b/i, role: 'Administrator', permissions: ['read', 'write', 'approve'] },
  { pattern: /\b(customer|client|user)\b/i, role: 'Customer', permissions: ['read', 'submit'] },
  { pattern: /\b(support|agent|representative)\b/i, role: 'Support Agent', permissions: ['read', 'write', 'escalate'] },
  { pattern: /\b(finance|accountant|billing)\b/i, role: 'Finance', permissions: ['read', 'approve', 'export'] },
  { pattern: /\b(supplier|vendor)\b/i, role: 'Supplier', permissions: ['read', 'submit'] },
];

const ENTITY_PATTERNS: Array<{ pattern: RegExp; entity: Omit<DataEntity, 'id'> }> = [
  {
    pattern: /\b(invoice|invoicing|billing)\b/i,
    entity: {
      name: 'Invoice',
      fields: [
        { name: 'invoiceNumber', type: 'string', required: true },
        { name: 'amount', type: 'number', required: true },
        { name: 'vendor', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'dueDate', type: 'date' },
      ],
      description: 'Invoice records for finance automation',
    },
  },
  {
    pattern: /\b(ticket|support case|case)\b/i,
    entity: {
      name: 'SupportTicket',
      fields: [
        { name: 'subject', type: 'string', required: true },
        { name: 'priority', type: 'enum', required: true },
        { name: 'status', type: 'enum', required: true },
        { name: 'customerId', type: 'string', required: true },
      ],
      description: 'Customer support tickets',
    },
  },
  {
    pattern: /\b(offer|supplier|procurement|sourcing)\b/i,
    entity: {
      name: 'SupplierOffer',
      fields: [
        { name: 'supplierName', type: 'string', required: true },
        { name: 'price', type: 'number', required: true },
        { name: 'leadTime', type: 'number' },
        { name: 'score', type: 'number' },
      ],
      description: 'Procurement supplier offers',
    },
  },
  {
    pattern: /\b(customer|contact|crm|lead)\b/i,
    entity: {
      name: 'Contact',
      fields: [
        { name: 'name', type: 'string', required: true },
        { name: 'email', type: 'string', required: true },
        { name: 'company', type: 'string' },
        { name: 'status', type: 'enum' },
      ],
      description: 'CRM contact records',
    },
  },
];

const INTEGRATION_PATTERNS: Array<{ pattern: RegExp; integration: Omit<Integration, 'id'> }> = [
  { pattern: /\b(email|outlook|gmail)\b/i, integration: { name: 'Email', type: 'email', purpose: 'Notifications and inbound processing' } },
  { pattern: /\b(salesforce|crm)\b/i, integration: { name: 'CRM', type: 'crm', purpose: 'Customer relationship sync' } },
  { pattern: /\b(sap|erp)\b/i, integration: { name: 'ERP', type: 'erp', purpose: 'Enterprise resource planning sync' } },
  { pattern: /\b(webhook|api)\b/i, integration: { name: 'REST API', type: 'api', purpose: 'External system integration' } },
  { pattern: /\b(slack|teams)\b/i, integration: { name: 'Team Chat', type: 'webhook', purpose: 'Team notifications' } },
];

function extractActors(text: string): Actor[] {
  const found = new Map<string, Actor>();
  for (const { pattern, role, permissions } of ACTOR_PATTERNS) {
    if (pattern.test(text) && !found.has(role)) {
      found.set(role, {
        id: `actor_${createId()}`,
        name: role,
        role,
        permissions,
      });
    }
  }
  if (found.size === 0) {
    found.set('Business User', {
      id: `actor_${createId()}`,
      name: 'Business User',
      role: 'Business User',
      permissions: ['read', 'write'],
    });
  }
  return [...found.values()];
}

function extractEntities(text: string): DataEntity[] {
  const entities: DataEntity[] = [];
  for (const { pattern, entity } of ENTITY_PATTERNS) {
    if (pattern.test(text)) {
      entities.push({ id: `entity_${createId()}`, ...entity });
    }
  }
  if (entities.length === 0) {
    entities.push({
      id: `entity_${createId()}`,
      name: 'Record',
      fields: [
        { name: 'title', type: 'string', required: true },
        { name: 'status', type: 'enum', required: true },
      ],
      description: 'Generic business record',
    });
  }
  return entities;
}

function extractIntegrations(text: string): Integration[] {
  const integrations: Integration[] = [];
  for (const { pattern, integration } of INTEGRATION_PATTERNS) {
    if (pattern.test(text)) {
      integrations.push({ id: `int_${createId()}`, ...integration });
    }
  }
  return integrations;
}

function extractWorkflows(text: string, entities: DataEntity[]): Workflow[] {
  const steps: WorkflowStep[] = [];
  const sentences = text.split(/[.!?\n]+/).map((s) => s.trim()).filter(Boolean);

  sentences.forEach((sentence, i) => {
    if (/\b(process|workflow|approve|review|submit|notify|assign|escalate|validate|extract|rank|score)\b/i.test(sentence)) {
      steps.push({
        id: `step_${i + 1}`,
        name: sentence.slice(0, 60) || `Step ${i + 1}`,
        description: sentence,
        agentName: inferAgent(sentence),
        nextStepId: i < sentences.length - 1 ? `step_${i + 2}` : undefined,
      });
    }
  });

  if (steps.length === 0) {
    steps.push(
      { id: 'step_1', name: 'Capture Input', description: 'User submits business data', agentName: 'Intake Agent' },
      { id: 'step_2', name: 'Process & Validate', description: 'AI validates and structures data', agentName: 'Validation Agent', nextStepId: 'step_3' },
      { id: 'step_3', name: 'Review & Approve', description: 'Business user reviews outcome', agentName: 'Approval Agent' },
    );
  }

  return [
    {
      id: `wf_${createId()}`,
      name: `${entities[0]?.name ?? 'Business'} Workflow`,
      description: 'Primary workflow derived from requirements',
      steps,
    },
  ];
}

function inferAgent(sentence: string): string {
  if (/\b(invoice|billing|finance)\b/i.test(sentence)) return 'Invoice AI Agent';
  if (/\b(support|ticket|customer)\b/i.test(sentence)) return 'Support Agent';
  if (/\b(supplier|procurement|offer|sourcing)\b/i.test(sentence)) return 'Supply Chain Agent';
  if (/\b(approve|review)\b/i.test(sentence)) return 'Approval Agent';
  if (/\b(extract|parse|ocr)\b/i.test(sentence)) return 'Extraction Agent';
  return 'General Business Agent';
}

function extractScreens(entities: DataEntity[], workflows: Workflow[]): UIScreen[] {
  const screens: UIScreen[] = [
    {
      id: `screen_${createId()}`,
      name: 'Dashboard',
      type: 'dashboard',
      entities: entities.map((e) => e.id),
      layout: 'both',
    },
  ];

  for (const entity of entities) {
    screens.push({
      id: `screen_${createId()}`,
      name: `${entity.name} List`,
      type: 'list',
      entities: [entity.id],
      layout: 'both',
    });
    screens.push({
      id: `screen_${createId()}`,
      name: `${entity.name} Form`,
      type: 'form',
      entities: [entity.id],
      layout: 'both',
    });
  }

  if (workflows.length > 0) {
    screens.push({
      id: `screen_${createId()}`,
      name: 'Workflow Monitor',
      type: 'detail',
      entities: workflows.map((w) => w.id),
      layout: 'web',
    });
  }

  return screens;
}

/** Parse natural-language business requirements into a structured spec */
export function parseRequirements(input: RequirementsInput): RequirementSpec {
  const text = `${input.description}\n${input.naturalLanguage}`.trim();
  const now = new Date().toISOString();
  const entities = extractEntities(text);
  const workflows = extractWorkflows(text, entities);

  return {
    id: `req_${createId()}`,
    title: input.title,
    description: input.description,
    industry: input.industry,
    actors: extractActors(text),
    workflows,
    dataEntities: entities,
    integrations: extractIntegrations(text),
    uiScreens: extractScreens(entities, workflows),
    createdAt: now,
    updatedAt: now,
    status: 'parsed',
  };
}

export function exportSpecJson(spec: RequirementSpec): string {
  return JSON.stringify(spec, null, 2);
}
