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
  'mailto:hello@ai-pass.com?subject=Enterprise%20AI%20Infrastructure%20Demo';

/** Primary marketing nav — Enterprise AI Infrastructure Platform IA */
export const SITE_NAV: SiteNavItem[] = [
  {
    type: 'dropdown',
    label: 'Platform',
    wide: true,
    items: [
      { label: 'Interactive Demo', href: '/demo', description: 'Click through routing, governance, trust, store, and savings' },
      { label: 'Dashboard', href: '/workspace', description: 'Executive view of usage, cost, and control' },
      { label: 'Workspace', href: '/workspace', description: 'Unified command center for enterprise AI' },
      { label: 'Agent Studio', href: '/workspace/agents', description: 'Build and operate autonomous agents' },
      { label: 'Workflow Engine', href: '/workspace/workflows', description: 'Orchestrate business processes' },
      { label: 'Knowledge Pipeline', href: '/workspace/knowledge', description: 'RAG and enterprise knowledge' },
      { label: 'LiveSync', href: '/workspace/workflows/livesync', description: 'Real-time event orchestration' },
      { label: 'Analysis Studio', href: '/workspace/analysis', description: 'Analytics and decision support' },
      { label: 'Trust Engine', href: '/workspace/trust', description: 'Certify and monitor AI systems' },
      { label: 'Compliance AI', href: '/workspace/compliance', description: 'Policy and regulatory automation' },
      { label: 'AI Governance', href: '/workspace/governance', description: 'Permissions, inventory, approvals' },
      { label: 'Marketplace', href: '/workspace/store', description: 'Enterprise AI App Store' },
      { label: 'Discovery Hub', href: '/discover', description: 'Directory of AI tools and providers' },
      { label: 'Presence Audit', href: '/workspace/apps/presence-audit', description: 'Brand and presence intelligence' },
      { label: 'Wallet', href: '/workspace/wallet', description: 'Credits, spend, and billing control' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Solutions',
    wide: true,
    items: [
      { label: 'Solutions Overview', href: '/solutions', description: 'Full Formerr-class form and intake coverage' },
      { label: 'AI Form Builder', href: '/solutions#ai-builder', description: 'Prompt, PDF, image, or URL to form' },
      { label: 'Quiz & Survey Kits', href: '/solutions#ai-kits', description: 'Scored quizzes, polls, and tests' },
      { label: 'Visual Builder', href: '/solutions#visual-editor', description: '50+ fields, multi-page layouts' },
      { label: 'Logic, Piping & Scores', href: '/solutions#logic', description: 'Branching, answer piping, calculations' },
      { label: 'Share & Embeds', href: '/solutions#share', description: 'Links, QR, popups, custom domains' },
      { label: 'Design & White-label', href: '/solutions#design', description: 'Themes, assets, branding, SEO' },
      { label: 'PDF, E-Sign & Payments', href: '/solutions#pdf', description: 'Packets, signatures, and checkout' },
      { label: 'API, MCP & Workflows', href: '/solutions#api-mcp', description: 'Agents, Sheets, CRM, webhooks' },
      { label: 'Teams & Templates', href: '/solutions#collaboration', description: 'Roles, galleries, and industry packs' },
      { label: 'Healthcare Intake', href: '/industries/healthcare', description: 'Consent and patient workflows' },
      { label: 'Invoice AI', href: '/workspace/apps/invoice-ai', description: 'Accounts payable intelligence' },
      { label: 'My Solutions', href: '/workspace/solutions', description: 'Build, deploy, and manage your apps' },
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
      { label: 'API', href: API_DOCS_HREF, description: 'OpenAPI reference' },
      { label: 'SDK', href: DOCS_URL, description: 'Client libraries and guides', external: true },
      { label: 'GitHub', href: GITHUB_URL, description: 'Open source and examples', external: true },
      { label: 'CLI', href: DOCS_URL, description: 'Command-line tooling', external: true },
      { label: 'Examples', href: '/developers', description: 'Sample apps and recipes' },
      { label: 'Marketplace Development', href: '/workspace/store/developer', description: 'Publish enterprise apps' },
      { label: 'Plugins', href: '/workspace/store', description: 'Extend the platform' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Resources',
    items: [
      { label: 'Documentation', href: DOCS_URL, external: true },
      { label: 'Blog', href: '/discover/news' },
      { label: 'Case Studies', href: '/case-studies' },
      { label: 'Research', href: '/research' },
      { label: 'Whitepapers', href: '/research' },
      { label: 'API', href: API_DOCS_HREF },
      { label: 'Community', href: '/developers' },
      { label: 'Academy', href: DOCS_URL, external: true },
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
      { label: 'Trust Engine', href: '/workspace/trust' },
      { label: 'AI Governance', href: '/workspace/governance' },
      { label: 'Routing', href: '/workspace/providers' },
      { label: 'Architecture', href: '/architecture' },
    ],
  },
  {
    title: 'Industries',
    links: [
      { label: 'Government', href: '/government' },
      { label: 'Defence', href: '/defence' },
      { label: 'Manufacturing', href: '/industries/manufacturing' },
      { label: 'Financial Services', href: '/industries/financial-services' },
      { label: 'Healthcare', href: '/industries/healthcare' },
    ],
  },
  {
    title: 'Enterprise',
    links: [
      { label: 'Security', href: '/security' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Compliance', href: '/compliance' },
      { label: 'Integrations', href: '/integrations' },
      { label: 'Customers', href: '/customers' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'API', href: API_DOCS_HREF },
      { label: 'Docs', href: DOCS_URL, external: true },
      { label: 'GitHub', href: GITHUB_URL, external: true },
      { label: 'Marketplace Dev', href: '/workspace/store/developer' },
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
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/privacy' },
      { label: 'Security', href: '/security' },
      { label: 'Compliance', href: '/compliance' },
    ],
  },
];
