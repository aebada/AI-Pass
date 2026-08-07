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
      { label: 'Workspace', href: '/workspace', description: 'AI infrastructure layer for every team' },
      { label: 'Models', href: '/workspace/playground', description: 'Route work across providers in one place' },
      { label: 'Agents', href: '/workspace/agents', description: 'Automate work that raises output' },
      { label: 'Workflows', href: '/workspace/workflows', description: 'Orchestrate processes with shared controls' },
      { label: 'Governance & Compliance', href: '/workspace/governance', description: 'AI compliance built into the stack' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Solutions',
    items: [
      { label: 'Defence & Government', href: '/#defence-gov', description: 'Sovereign, audit-ready AI for public missions' },
      { label: 'On-Premises', href: '/#defence-gov', description: 'Deploy inside your own infrastructure boundary' },
      { label: 'Productivity & Cost', href: '/#outcomes', description: 'Raise output and cut AI operating spend' },
      { label: 'Any organization', href: '/#outcomes', description: 'Industry-agnostic platform for every sector' },
      { label: 'Browse use cases', href: '/discover/categories', description: 'Explore apps and packs by workflow' },
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
      { label: 'Governance & Compliance', href: '/workspace/governance' },
      { label: 'Trust Center', href: '/workspace/trust' },
    ],
  },
  {
    title: 'Solutions',
    links: [
      { label: 'Defence & Government', href: '/#defence-gov' },
      { label: 'On-Premises', href: '/#defence-gov' },
      { label: 'Productivity & Cost', href: '/#outcomes' },
      { label: 'Any organization', href: '/#outcomes' },
      { label: 'Browse use cases', href: '/discover/categories' },
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
