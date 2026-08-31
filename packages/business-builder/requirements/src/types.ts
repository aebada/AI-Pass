/** Business requirements domain model — natural language → structured spec */

export type BusinessRole = 'business_admin' | 'builder' | 'viewer' | 'approver';

export interface Actor {
  id: string;
  name: string;
  role: string;
  permissions: string[];
}

export interface DataEntity {
  id: string;
  name: string;
  fields: Array<{ name: string; type: string; required?: boolean }>;
  description?: string;
}

export interface Integration {
  id: string;
  name: string;
  type: 'api' | 'webhook' | 'email' | 'database' | 'crm' | 'erp';
  purpose: string;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  agentId?: string;
  agentName?: string;
  trigger?: string;
  nextStepId?: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
}

export interface UIScreen {
  id: string;
  name: string;
  type: 'dashboard' | 'form' | 'list' | 'detail' | 'settings';
  entities: string[];
  layout: 'web' | 'mobile' | 'both';
}

export interface RequirementSpec {
  id: string;
  title: string;
  description: string;
  industry?: string;
  actors: Actor[];
  workflows: Workflow[];
  dataEntities: DataEntity[];
  integrations: Integration[];
  uiScreens: UIScreen[];
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'parsed' | 'approved' | 'deployed';
}

export interface RequirementsInput {
  title: string;
  description: string;
  naturalLanguage: string;
  industry?: string;
}
