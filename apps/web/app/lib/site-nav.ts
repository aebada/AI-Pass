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

/** Primary marketing main menu */
export const SITE_NAV: SiteNavItem[] = [
  {
    type: 'dropdown',
    label: 'Platform',
    wide: true,
    items: [
      { label: 'Interactive Demo', href: '/demo', description: 'Graph RAG, ontology, and agent lineage' },
      { label: 'Dashboard', href: '/workspace', description: 'Executive view of usage, cost, and control' },
      { label: 'Workspace', href: '/workspace', description: 'Command center for models, agents, and apps' },
      { label: 'Agent Studio', href: '/workspace/agents', description: 'Build and operate autonomous agents' },
      { label: 'Workflow Engine', href: '/workspace/workflows', description: 'Orchestrate business processes' },
      { label: 'Knowledge Pipeline', href: '/workspace/knowledge', description: 'Enterprise RAG and document grounding' },
      { label: 'Semantic Graph', href: '/workspace/apps/semantic-graph', description: 'Ontology, Graph RAG, and lineage' },
      { label: 'LiveSync', href: '/workspace/workflows/livesync', description: 'Real-time event orchestration' },
      { label: 'Analysis Studio', href: '/workspace/analysis', description: 'Analytics and decision support' },
      { label: 'Trust Engine', href: '/workspace/trust', description: 'Certify and monitor AI systems' },
      { label: 'AI Governance', href: '/workspace/governance', description: 'Inventory, approvals, and policy' },
      { label: 'Compliance AI', href: '/workspace/compliance', description: 'Policy and regulatory automation' },
      { label: 'Model Providers', href: '/workspace/providers', description: 'Routing across public and private models' },
      { label: 'Discovery Hub', href: '/discover', description: 'Directory of AI tools and providers' },
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
      { label: 'Quiz & Survey Kits', href: '/solutions#ai-kits', description: 'Scored quizzes, polls, and tests' },
      { label: 'Visual Builder', href: '/solutions#visual-editor', description: '50+ fields, multi-page layouts' },
      { label: 'Logic & Piping', href: '/solutions#logic', description: 'Branching, scores, and calculations' },
      { label: 'Share & Embeds', href: '/solutions#share', description: 'Links, QR, popups, custom domains' },
      { label: 'Invoice AI', href: '/workspace/apps/invoice-ai', description: 'Accounts payable intelligence' },
      { label: 'Supply Chain AI', href: '/workspace/apps/supply-chain', description: 'Procurement and supplier ranking' },
      { label: 'Sales AI', href: '/workspace/apps/sales-ai', description: 'Outreach, proposals, and CRM' },
      { label: 'Customer Support AI', href: '/workspace/apps/customer-support-ai', description: 'Voice and text support agents' },
      { label: 'Content AI', href: '/workspace/apps/content-ai', description: 'Detect and humanize AI text' },
      { label: 'Compliance AI', href: '/workspace/apps/compliance-ai', description: 'ISO, GDPR, and AI governance' },
      { label: 'Data Masking', href: '/workspace/apps/data-masking', description: 'Secure API shares in one line' },
      { label: 'Presence Audit', href: '/workspace/apps/presence-audit', description: 'Brand visibility across AI answers' },
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
      { label: 'Telecom', href: '/industries/telecom' },
      { label: 'Energy', href: '/industries/energy' },
      { label: 'Education', href: '/industries/education' },
      { label: 'Construction', href: '/industries/construction' },
      { label: 'Logistics', href: '/industries/logistics' },
    ],
  },
  {
    type: 'link',
    label: 'Marketplace',
    href: '/workspace/store',
  },
  {
    type: 'dropdown',
    label: 'Developers',
    items: [
      { label: 'API Reference', href: API_DOCS_HREF, description: 'OpenAPI endpoints' },
      { label: 'SDK', href: DOCS_URL, description: 'Client libraries and guides', external: true },
      { label: 'GitHub', href: GITHUB_URL, description: 'Open source and examples', external: true },
      { label: 'CLI', href: DOCS_URL, description: 'Command-line tooling', external: true },
      { label: 'Examples', href: '/developers', description: 'Sample apps and recipes' },
      { label: 'Marketplace Development', href: '/workspace/store/developer', description: 'Publish enterprise apps' },
      { label: 'Downloads', href: '/downloads', description: 'IDE and desktop tooling' },
      { label: 'Help Center', href: '/help', description: 'Support and documentation' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Resources',
    items: [
      { label: 'Documentation', href: DOCS_URL, description: 'Guides and references', external: true },
      { label: 'Blog', href: '/discover/news' },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Research', href: '/research' },
      { label: 'Whitepapers', href: '/research' },
      { label: 'Community', href: '/developers' },
      { label: 'Academy', href: DOCS_URL, external: true },
      { label: 'Roadmap', href: '/roadmap' },
    ],
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
    label: 'Company',
    items: [
      { label: 'About', href: '/about' },
      { label: 'Partners', href: '/partners' },
      { label: 'Investors', href: '/investors' },
      { label: 'Careers', href: '/careers' },
      { label: 'Contact', href: '/contact' },
      { label: 'Roadmap', href: '/roadmap' },
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
      { label: 'Interactive Demo', href: '/demo' },
      { label: 'Knowledge Pipeline', href: '/workspace/knowledge' },
      { label: 'Semantic Graph', href: '/workspace/apps/semantic-graph' },
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
      { label: 'Sales AI', href: '/workspace/apps/sales-ai' },
      { label: 'Data Masking', href: '/workspace/apps/data-masking' },
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
      { label: 'Logistics', href: '/industries/logistics' },
      { label: 'Energy', href: '/industries/energy' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'API', href: API_DOCS_HREF },
      { label: 'Documentation', href: DOCS_URL, external: true },
      { label: 'GitHub', href: GITHUB_URL, external: true },
      { label: 'Examples', href: '/developers' },
      { label: 'Downloads', href: '/downloads' },
      { label: 'Help', href: '/help' },
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
