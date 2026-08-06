export type SiteNavLink = {
  label: string;
  href: string;
  description?: string;
  external?: boolean;
};

export type SiteNavItem =
  | { type: 'link'; label: string; href: string; external?: boolean }
  | { type: 'dropdown'; label: string; items: SiteNavLink[] };

export const DOCS_URL = 'https://docs.ai-pass.com';

export const SITE_NAV: SiteNavItem[] = [
  {
    type: 'dropdown',
    label: 'Platform',
    items: [
      { label: 'Workspace', href: '/workspace', description: 'One command center for every AI task' },
      { label: 'Models', href: '/workspace/providers', description: 'Every major model, no vendor lock-in' },
      { label: 'Agents', href: '/workspace/agents', description: 'Build and deploy autonomous agents' },
      { label: 'Workflows', href: '/workspace/workflows', description: 'Automate business processes end to end' },
      { label: 'Governance & Trust', href: '/workspace/governance', description: 'Policies, certification, and oversight' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Solutions',
    items: [
      { label: 'Finance', href: '/discover/categories/finance', description: 'Invoice, treasury, and compliance AI' },
      { label: 'Manufacturing', href: '/discover/categories/manufacturing', description: 'Quality, supply chain, and IoT' },
      { label: 'Healthcare', href: '/discover/categories/healthcare', description: 'HIPAA-ready document AI' },
      { label: 'Government', href: '/solutions', description: 'Sovereign cloud and public sector' },
      { label: 'View all industries', href: '/solutions', description: 'Retail, logistics, insurance, education' },
    ],
  },
  { type: 'link', label: 'Marketplace', href: '/workspace/store' },
  { type: 'link', label: 'Pricing', href: '/workspace/membership' },
  { type: 'link', label: 'Docs', href: DOCS_URL, external: true },
];

export type FooterColumn = {
  title: string;
  links: SiteNavLink[];
};

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Products',
    links: [
      { label: 'AI Workspace', href: '/workspace' },
      { label: 'AI Playground', href: '/workspace/playground' },
      { label: 'AI Provider Hub', href: '/workspace/providers' },
      { label: 'AI Agents', href: '/workspace/agents' },
      { label: 'Workflow Automation', href: '/workspace/workflows' },
      { label: 'Knowledge Pipeline', href: '/workspace/knowledge' },
      { label: 'Trust Engine', href: '/workspace/trust' },
      { label: 'AI Governance', href: '/workspace/governance' },
      { label: 'Downloads', href: '/downloads' },
    ],
  },
  {
    title: 'Trust',
    links: [
      { label: 'Trust Layer', href: '/trust' },
      { label: 'Trust Engine', href: '/workspace/trust' },
      { label: 'AI Validation', href: '/workspace/trust/runs' },
      { label: 'Certification', href: '/workspace/trust/certify' },
      { label: 'Monitoring', href: '/workspace/trust/monitoring' },
      { label: 'Verification', href: '/verify/AIP-INV2026' },
      { label: 'AI Governance', href: '/workspace/governance' },
      { label: 'Compliance', href: '/workspace/apps/compliance-ai' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Finance', href: '/discover/categories/finance' },
      { label: 'Manufacturing', href: '/discover/categories/manufacturing' },
      { label: 'Healthcare', href: '/discover/categories/healthcare' },
      { label: 'Government', href: '/solutions' },
      { label: 'Retail', href: '/solutions' },
      { label: 'Logistics', href: '/discover/categories/supply_chain' },
      { label: 'Enterprise AI', href: '/discover/best/enterprise' },
    ],
  },
  {
    title: 'Marketplace',
    links: [
      { label: 'AI Store', href: '/workspace/store' },
      { label: 'Discovery Hub', href: '/discover' },
      { label: 'AI Skills', href: '/workspace/skills' },
      { label: 'Automation Packs', href: '/workspace/marketplace' },
      { label: 'Industry Solutions', href: '/discover/categories' },
      { label: 'Deals', href: '/discover/deals' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Developer Portal', href: '#' },
      { label: 'Publish an App', href: '#' },
      { label: 'API Reference', href: '/api/docs' },
      { label: 'SDK', href: DOCS_URL, external: true },
      { label: 'Marketplace Revenue', href: '/workspace/marketplace' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: DOCS_URL, external: true },
      { label: 'Research', href: '/discover/research' },
      { label: 'AI News', href: '/discover/news' },
      { label: 'Case Studies', href: '#' },
      { label: 'Trust Layer', href: '/trust' },
      { label: 'Trust Center', href: '/workspace/trust' },
      { label: 'Help Center', href: '/help' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Vision', href: '/about#vision' },
      { label: 'Investors', href: '/investors' },
      { label: 'Careers', href: '#' },
      { label: 'Partners', href: '#' },
      { label: 'Contact', href: '/about#contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Security', href: '/workspace/trust' },
      { label: 'Compliance', href: '/workspace/compliance' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'LinkedIn', href: 'https://linkedin.com/company/ai-pass', external: true },
      { label: 'X (Twitter)', href: 'https://x.com/aipass', external: true },
      { label: 'GitHub', href: 'https://github.com/ai-pass', external: true },
      { label: 'YouTube', href: 'https://youtube.com/@aipass', external: true },
    ],
  },
];
