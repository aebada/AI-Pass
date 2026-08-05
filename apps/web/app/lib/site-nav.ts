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

/** Primary marketing nav: exactly 5 top-level items (brief §1.1–1.7). */
export const SITE_NAV: SiteNavItem[] = [
  {
    type: 'dropdown',
    label: 'Platform',
    items: [
      { label: 'Workspace', href: '/workspace', description: 'Unified command center for models, apps, and teams' },
      { label: 'Models', href: '/workspace/playground', description: 'Compare and route across every provider' },
      { label: 'Agents', href: '/workspace/agents', description: 'Build and run autonomous agents' },
      { label: 'Workflows', href: '/workspace/workflows', description: 'Orchestrate business processes end to end' },
      { label: 'Governance & Trust', href: '/workspace/governance', description: 'Policies, compliance, certification, and monitoring' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Solutions',
    items: [
      { label: 'Finance', href: '/discover/categories/finance', description: 'AP automation, treasury, and controls' },
      { label: 'Manufacturing', href: '/discover/categories/manufacturing', description: 'Quality, supply chain, and plant ops' },
      { label: 'Healthcare', href: '/discover/categories/healthcare', description: 'Document workflows with audit trails' },
      { label: 'Government', href: '/discover/categories', description: 'Governed access for public-sector teams' },
      { label: 'View all industries', href: '/discover/categories', description: 'Retail, logistics, insurance, education, and more' },
    ],
  },
  {
    type: 'link',
    label: 'Marketplace',
    href: '/workspace/store',
  },
  {
    type: 'link',
    label: 'Pricing',
    href: '/#pricing',
  },
  {
    type: 'link',
    label: 'Docs',
    href: DOCS_URL,
    external: true,
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
      { label: 'Models', href: '/workspace/playground' },
      { label: 'Agents', href: '/workspace/agents' },
      { label: 'Workflows', href: '/workspace/workflows' },
      { label: 'Governance & Trust', href: '/workspace/governance' },
      { label: 'Trust Center', href: '/workspace/trust' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Finance', href: '/discover/categories/finance' },
      { label: 'Manufacturing', href: '/discover/categories/manufacturing' },
      { label: 'Healthcare', href: '/discover/categories/healthcare' },
      { label: 'Government', href: '/discover/categories' },
      { label: 'Retail', href: '/discover/categories' },
      { label: 'Logistics', href: '/discover/categories/supply_chain' },
      { label: 'Insurance', href: '/discover/categories' },
      { label: 'Education', href: '/discover/categories/education' },
    ],
  },
  {
    title: 'Marketplace',
    links: [
      { label: 'AI Store', href: '/workspace/store' },
      { label: 'Discovery Hub', href: '/discover' },
      { label: 'Publish an App', href: '/workspace/store/submit' },
      { label: 'Developer Portal', href: '/workspace/store/developer' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: DOCS_URL, external: true },
      { label: 'API Reference', href: API_DOCS_HREF },
      { label: 'Research', href: '/discover/research' },
      { label: 'AI News', href: '/discover/news' },
      { label: 'Help Center', href: '/help' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Investors', href: '/investors' },
      { label: 'Careers', href: '/about#contact' },
      { label: 'Partners', href: '/about#contact' },
      { label: 'Contact', href: '/about#contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Security', href: '/workspace/trust' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
  {
    title: 'Social',
    links: [
      { label: 'LinkedIn', href: 'https://linkedin.com/company/ai-pass', external: true },
      { label: 'X (Twitter)', href: 'https://x.com/aipass', external: true },
      { label: 'GitHub', href: 'https://github.com/ai-pass', external: true },
    ],
  },
];
