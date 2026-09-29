export type SiteNavLink = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
};

export type SiteNavItem =
  | { type: 'link'; label: string; href: string; external?: boolean }
  | { type: 'dropdown'; label: string; items: SiteNavLink[]; wide?: boolean };

export const DOCS_URL = 'https://docs.ai-pass.com';
export const API_DOCS_HREF = '/api/docs';
export const GITHUB_URL = 'https://github.com/ai-pass';
export const DEMO_MAILTO =
  'mailto:contact@ehopn.com?subject=AI-Pass%20Enterprise%20Demo%20(HOPn)';

/** Primary marketing main menu — compact top-level, rich dropdowns */
export const SITE_NAV: SiteNavItem[] = [
  {
    type: 'dropdown',
    label: 'Platform',
    wide: true,
    items: [
      { label: 'Workspace', href: '/workspace', description: 'Command center for models, agents, and apps' },
      { label: 'Agent Studio', href: '/workspace/agents', description: 'Build and operate autonomous agents' },
      { label: 'Knowledge Pipeline', href: '/workspace/knowledge', description: 'Enterprise RAG and document grounding' },
      { label: 'Semantic Graph', href: '/workspace/apps/semantic-graph', description: 'Ontology, Graph RAG, and lineage' },
      { label: 'Trust Engine', href: '/workspace/trust', description: 'Certify and monitor AI systems' },
      { label: 'AI Governance', href: '/workspace/governance', description: 'Inventory, approvals, and policy' },
      { label: 'Workflow Engine', href: '/workspace/workflows', description: 'Orchestrate business processes' },
      { label: 'LiveSync', href: '/workspace/workflows/livesync', description: 'Real-time event orchestration' },
      { label: 'Wallet', href: '/workspace/wallet', description: 'Credits, spend, and billing control' },
      { label: 'Architecture', href: '/architecture', description: 'How the operating system fits together' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Solutions',
    wide: true,
    items: [
      { label: 'Solutions Overview', href: '/solutions', description: 'Forms, intake, and governed apps' },
      { label: 'AI Form Builder', href: '/solutions#ai-builder', description: 'Prompt, PDF, or URL to form' },
      { label: 'Invoice AI', href: '/workspace/apps/invoice-ai', description: 'Accounts payable intelligence' },
      { label: 'Compliance AI', href: '/workspace/apps/compliance-ai', description: 'Policy and regulatory automation' },
      { label: 'Supply Chain AI', href: '/workspace/apps/supply-chain', description: 'Procurement and supplier ranking' },
      { label: 'Data Masking', href: '/workspace/apps/data-masking', description: 'Secure API shares in one line' },
      { label: 'Sales AI', href: '/workspace/apps/sales-ai', description: 'Outreach, proposals, and CRM' },
      { label: 'My Solutions', href: '/workspace/solutions', description: 'Build, deploy, and manage apps' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Industries',
    wide: true,
    items: [
      { label: 'Manufacturing', href: '/industries/manufacturing' },
      { label: 'Automotive', href: '/industries/automotive' },
      { label: 'Healthcare', href: '/industries/healthcare' },
      { label: 'Government', href: '/government' },
      { label: 'Defence', href: '/defence' },
      { label: 'Financial Services', href: '/industries/financial-services' },
      { label: 'Insurance', href: '/industries/insurance' },
      { label: 'Retail', href: '/industries/retail' },
      { label: 'Energy', href: '/industries/energy' },
      { label: 'Logistics', href: '/industries/logistics' },
      { label: 'Education', href: '/industries/education' },
      { label: 'Telecom', href: '/industries/telecom' },
    ],
  },
  {
    type: 'link',
    label: 'Marketplace',
    href: '/workspace/store',
  },
  {
    type: 'link',
    label: 'Demo',
    href: '/demo',
  },
  {
    type: 'link',
    label: 'Pricing',
    href: '/#pricing',
  },
  {
    type: 'dropdown',
    label: 'Resources',
    items: [
      { label: 'Documentation', href: DOCS_URL, description: 'Guides and references', external: true },
      { label: 'API Reference', href: API_DOCS_HREF, description: 'OpenAPI endpoints' },
      { label: 'Developers', href: '/developers', description: 'Examples and recipes' },
      { label: 'GitHub', href: GITHUB_URL, description: 'Open source', external: true },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Research', href: '/research' },
      { label: 'About', href: '/about' },
      { label: 'Investors', href: '/investors' },
      { label: 'Partners', href: '/partners' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

export type FooterColumn = {
  title: string;
  links: SiteNavLink[];
};

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Workspace', href: '/workspace' },
      { label: 'Semantic Graph Demo', href: '/demo' },
      { label: 'Knowledge Pipeline', href: '/workspace/knowledge' },
      { label: 'Trust Engine', href: '/workspace/trust' },
      { label: 'AI Governance', href: '/workspace/governance' },
      { label: 'Architecture', href: '/architecture' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Solutions Overview', href: '/solutions' },
      { label: 'Invoice AI', href: '/workspace/apps/invoice-ai' },
      { label: 'Compliance AI', href: '/workspace/apps/compliance-ai' },
      { label: 'Marketplace', href: '/workspace/store' },
      { label: 'Pricing', href: '/#pricing' },
    ],
  },
  {
    title: 'Industries',
    links: [
      { label: 'Government', href: '/government' },
      { label: 'Defence', href: '/defence' },
      { label: 'Manufacturing', href: '/industries/manufacturing' },
      { label: 'Healthcare', href: '/industries/healthcare' },
      { label: 'Financial Services', href: '/industries/financial-services' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'API', href: API_DOCS_HREF },
      { label: 'Documentation', href: DOCS_URL, external: true },
      { label: 'GitHub', href: GITHUB_URL, external: true },
      { label: 'Examples', href: '/developers' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Partners', href: '/partners' },
      { label: 'Investors', href: '/investors' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Roadmap', href: '/roadmap' },
    ],
  },
];
