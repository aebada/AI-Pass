/** Customer Connect Platform catalog — APIs, connectors, and twin feeds */

export type ConnectorCategory =
  | 'erp'
  | 'crm'
  | 'productivity'
  | 'data'
  | 'api'
  | 'events'
  | 'identity';

export type ConnectorAuth = 'oauth2' | 'api_key' | 'basic' | 'webhook' | 'mtls' | 'custom';

export type CatalogConnector = {
  id: string;
  name: string;
  category: ConnectorCategory;
  auth: ConnectorAuth[];
  summary: string;
  twinFeed: string;
  status: 'available' | 'beta' | 'bring_your_own';
};

export const CONNECTOR_CATEGORIES: { id: ConnectorCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'erp', label: 'ERP & finance' },
  { id: 'crm', label: 'CRM & support' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'data', label: 'Data & files' },
  { id: 'api', label: 'Custom APIs' },
  { id: 'events', label: 'Events & webhooks' },
  { id: 'identity', label: 'Identity' },
];

export const CONNECT_CATALOG: CatalogConnector[] = [
  // ERP
  { id: 'sap', name: 'SAP S/4HANA / Business One', category: 'erp', auth: ['oauth2', 'basic'], summary: 'Orders, vendors, invoices, and cost centers into the business twin.', twinFeed: 'Finance · procurement · master data', status: 'available' },
  { id: 'oracle-cloud', name: 'Oracle Fusion Cloud ERP', category: 'erp', auth: ['oauth2'], summary: 'Fusion finance and supply objects with governed sync.', twinFeed: 'GL · AP · inventory', status: 'available' },
  { id: 'dynamics-erp', name: 'Microsoft Dynamics 365 Finance', category: 'erp', auth: ['oauth2'], summary: 'Finance and ops entities for twin hops and agent actions.', twinFeed: 'Finance · ops', status: 'available' },
  { id: 'datev', name: 'DATEV', category: 'erp', auth: ['api_key', 'oauth2'], summary: 'German accounting connector for regulated finance twins.', twinFeed: 'Bookkeeping · tax packs', status: 'available' },
  { id: 'quickbooks', name: 'QuickBooks Online', category: 'erp', auth: ['oauth2'], summary: 'SMB ledgers and invoices for payments agents.', twinFeed: 'Invoices · vendors', status: 'available' },
  { id: 'xero', name: 'Xero', category: 'erp', auth: ['oauth2'], summary: 'Cloud accounting sync into payment and planning twins.', twinFeed: 'Invoices · contacts', status: 'available' },
  // CRM
  { id: 'salesforce', name: 'Salesforce', category: 'crm', auth: ['oauth2'], summary: 'Accounts, opportunities, and cases for sales and support twins.', twinFeed: 'CRM · pipeline', status: 'available' },
  { id: 'hubspot', name: 'HubSpot', category: 'crm', auth: ['oauth2', 'api_key'], summary: 'Contacts, deals, and marketing events into the twin.', twinFeed: 'CRM · marketing', status: 'available' },
  { id: 'dynamics-crm', name: 'Dynamics 365 Customer Engagement', category: 'crm', auth: ['oauth2'], summary: 'Customer engagement graphs with role walls.', twinFeed: 'CRM · service', status: 'available' },
  { id: 'zendesk', name: 'Zendesk', category: 'crm', auth: ['oauth2', 'api_key'], summary: 'Tickets and macros for support twins and routing agents.', twinFeed: 'Support · tickets', status: 'available' },
  { id: 'servicenow', name: 'ServiceNow', category: 'crm', auth: ['oauth2', 'basic'], summary: 'ITSM incidents and changes as governed twin objects.', twinFeed: 'ITSM · change', status: 'available' },
  { id: 'pipedrive', name: 'Pipedrive', category: 'crm', auth: ['api_key'], summary: 'Pipeline stages for sales planning agents.', twinFeed: 'Deals · activities', status: 'available' },
  { id: 'freshdesk', name: 'Freshdesk', category: 'crm', auth: ['api_key'], summary: 'Helpdesk conversations into employee and customer twins.', twinFeed: 'Support', status: 'available' },
  { id: 'zoho', name: 'Zoho CRM', category: 'crm', auth: ['oauth2'], summary: 'Zoho modules mapped into the knowledge graph.', twinFeed: 'CRM', status: 'available' },
  { id: 'monday', name: 'Monday.com', category: 'crm', auth: ['api_key'], summary: 'Boards and items as workflow memory for the twin.', twinFeed: 'Work OS', status: 'beta' },
  // Productivity
  { id: 'sharepoint', name: 'SharePoint / OneDrive', category: 'productivity', auth: ['oauth2'], summary: 'Documents and libraries into knowledge and ontology.', twinFeed: 'Files · SOPs', status: 'available' },
  { id: 'google-workspace', name: 'Google Workspace', category: 'productivity', auth: ['oauth2'], summary: 'Drive, Gmail, and Calendar signals for personal and employee twins.', twinFeed: 'Mail · calendar · drive', status: 'beta' },
  { id: 'microsoft-365', name: 'Microsoft 365', category: 'productivity', auth: ['oauth2'], summary: 'Outlook, Teams, and Graph APIs under consent and role walls.', twinFeed: 'Mail · teams · files', status: 'beta' },
  { id: 'slack', name: 'Slack', category: 'productivity', auth: ['oauth2'], summary: 'Channel events as consented interaction memory.', twinFeed: 'Collaboration', status: 'beta' },
  // Data
  { id: 'postgres', name: 'PostgreSQL', category: 'data', auth: ['basic', 'mtls'], summary: 'SQL tables and views as twin-backed sources.', twinFeed: 'Structured data', status: 'available' },
  { id: 's3', name: 'S3 / object storage', category: 'data', auth: ['api_key'], summary: 'Buckets of documents and media for ingestion pipelines.', twinFeed: 'Object store', status: 'available' },
  { id: 'kafka', name: 'Kafka / event streams', category: 'events', auth: ['mtls', 'api_key'], summary: 'Live operational events into LiveSync and the twin.', twinFeed: 'Streaming events', status: 'available' },
  // Custom API / events
  { id: 'custom-rest', name: 'Custom REST API', category: 'api', auth: ['api_key', 'oauth2', 'basic', 'mtls'], summary: 'Bring your own OpenAPI or REST endpoints — map fields into the twin.', twinFeed: 'Any domain API', status: 'bring_your_own' },
  { id: 'custom-graphql', name: 'Custom GraphQL', category: 'api', auth: ['api_key', 'oauth2'], summary: 'Point AI-Pass at your GraphQL schema for twin enrichment.', twinFeed: 'Graph API', status: 'bring_your_own' },
  { id: 'webhooks-in', name: 'Inbound webhooks', category: 'events', auth: ['webhook', 'api_key'], summary: 'Push events from your stack into LiveSync and agent queues.', twinFeed: 'Real-time ingest', status: 'available' },
  { id: 'webhooks-out', name: 'Outbound webhooks', category: 'events', auth: ['webhook'], summary: 'Emit twin and agent outcomes to your systems.', twinFeed: 'Action callbacks', status: 'available' },
  // Identity
  { id: 'oidc', name: 'OIDC / SSO', category: 'identity', auth: ['oauth2'], summary: 'Enterprise identity for employees mapped into the twin.', twinFeed: 'Users · roles', status: 'available' },
  { id: 'scim', name: 'SCIM provisioning', category: 'identity', auth: ['api_key', 'oauth2'], summary: 'Keep employee twins in sync with HRIS and IdP.', twinFeed: 'Workforce graph', status: 'beta' },
];

export const CONNECT_CAPABILITIES = [
  {
    title: 'Catalog connectors',
    copy: 'ERP, CRM, productivity, data, and identity adapters ready to attach to the twin.',
  },
  {
    title: 'Bring your own API',
    copy: 'Register REST, GraphQL, or webhook endpoints with auth, rate limits, and field mapping.',
  },
  {
    title: 'Sync into the twin',
    copy: 'Every connector feeds people, apps, and process memory — not a disconnected chatbot context.',
  },
  {
    title: 'Governed by default',
    copy: 'Role walls, audit hops, and confirmation gates apply to data in and actions out.',
  },
];
