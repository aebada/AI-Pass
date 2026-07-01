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

export const SITE_NAV: SiteNavItem[] = [
  {
    type: 'dropdown',
    label: 'Platform',
    wide: true,
    items: [
      { label: 'AI Workspace', href: '/workspace', description: 'Unified enterprise command center' },
      { label: 'AI Playground', href: '/workspace/playground', description: 'Compare models with one membership' },
      { label: 'AI Provider Hub', href: '/workspace/providers', description: 'Every model, no vendor lock-in' },
      { label: 'AI Agents', href: '/workspace/agents', description: 'Build and deploy autonomous agents' },
      { label: 'Workflow Automation', href: '/workspace/workflows', description: 'Automate business processes' },
      { label: 'Knowledge Pipeline', href: '/workspace/knowledge', description: 'RAG and document intelligence' },
      { label: 'Analysis Studio', href: '/workspace/analysis', description: 'Analytics, reports, and insights' },
      { label: 'LiveSync Engine', href: '/workspace/workflows/livesync', description: 'Real-time orchestration' },
      { label: 'Trust Engine', href: '/workspace/trust', description: 'Certify and monitor AI systems' },
      { label: 'Compliance AI', href: '/workspace/compliance', description: 'Policy enforcement and risk' },
      { label: 'AI Governance', href: '/workspace/governance', description: 'Inventory, policies, and approvals' },
    ],
  },
  {
    type: 'dropdown',
    label: 'AI Apps',
    wide: true,
    items: [
      { label: 'Invoice AI', href: '/workspace/apps/invoice-ai', description: 'Accounts payable automation' },
      { label: 'Supply Chain AI', href: '/workspace/apps/supply-chain-ai', description: 'Procurement intelligence' },
      { label: 'HR AI', href: '/workspace/apps', description: 'Onboarding and employee workflows' },
      { label: 'Customer Support AI', href: '/workspace/apps/customer-support-ai', description: 'Multi-channel support agents' },
      { label: 'Sales AI', href: '/workspace/apps/sales-ai', description: 'Revenue OS — email, LinkedIn, proposals, CRM' },
      { label: 'Presence Audit', href: '/workspace/apps/presence-audit', description: 'Brand visibility intelligence' },
      { label: 'Content AI', href: '/workspace/apps/content-ai', description: 'AI Detector & Humanizer' },
      { label: 'Compliance AI', href: '/workspace/apps/compliance-ai', description: 'Regulatory workflow automation' },
      { label: 'Analysis Studio', href: '/workspace/analysis', description: 'Enterprise analytics and reports' },
      { label: 'Agentra', href: '#', description: 'Multi-agent orchestration — coming soon' },
      { label: 'Findora', href: '#', description: 'Enterprise search — coming soon' },
      { label: 'Browse All Apps', href: '/workspace/apps', description: 'Full application catalog' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Marketplace',
    wide: true,
    items: [
      { label: 'AI Store', href: '/workspace/store', description: 'Install certified enterprise apps' },
      { label: 'Discovery Hub', href: '/discover', description: 'Find and compare AI tools' },
      { label: 'AI Skills', href: '/workspace/skills', description: 'Agent skills and capability packs' },
      { label: 'Automation Packs', href: '/workspace/marketplace', description: 'Pre-built workflow templates' },
      { label: 'Industry Solutions', href: '/discover/categories', description: 'Vertical AI collections' },
      { label: 'Enterprise Marketplace', href: '/workspace/marketplace', description: 'Governed app distribution' },
      { label: 'Publish an App', href: '#', description: 'List your AI application' },
      { label: 'Developer Portal', href: '#', description: 'SDK, API, and revenue tools' },
      { label: 'Deals', href: '/discover/deals', description: 'Limited-time offers and bundles' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Trust',
    wide: true,
    items: [
      { label: 'Trust Engine', href: '/workspace/trust', description: 'Validate, certify, and monitor AI systems' },
      { label: 'AI Validation', href: '/workspace/trust/runs', description: 'Automated validation test runs' },
      { label: 'Certification', href: '/workspace/trust/certify', description: 'Bronze through Platinum certification' },
      { label: 'Monitoring', href: '/workspace/trust/monitoring', description: 'Continuous post-deployment oversight' },
      { label: 'Trust Scores', href: '/workspace/trust', description: 'Quantified AI reliability metrics' },
      { label: 'Verification', href: '/verify/AIP-INV2026', description: 'Public certificate verification' },
      { label: 'AI Governance', href: '/workspace/governance', description: 'Policies, inventory, and approvals' },
      { label: 'Compliance', href: '/workspace/apps/compliance-ai', description: 'Regulatory workflow automation' },
      { label: 'Enterprise Assurance', href: '/workspace/trust#enterprise', description: 'Enterprise-grade trust programs' },
      { label: 'Case Studies', href: '/#trust-stories', description: 'Trusted AI deployment stories' },
      { label: 'Trust Overview', href: '/trust', description: 'The AI-Pass Trust Layer' },
      { label: 'Pricing', href: '/workspace/membership#trust', description: 'Trust certification plans' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Solutions',
    wide: true,
    items: [
      { label: 'Finance', href: '/discover/categories/finance', description: 'Invoice, treasury, and compliance AI' },
      { label: 'Manufacturing', href: '/discover/categories/manufacturing', description: 'Quality, supply chain, and IoT' },
      { label: 'Automotive', href: '/#solutions', description: 'Connected vehicle and production AI' },
      { label: 'Healthcare', href: '/discover/categories/healthcare', description: 'HIPAA-ready document AI' },
      { label: 'Government', href: '/#solutions', description: 'Sovereign cloud and public sector' },
      { label: 'Retail', href: '/#solutions', description: 'Customer experience and inventory AI' },
      { label: 'Logistics', href: '/discover/categories/supply_chain', description: 'Procurement and fleet optimization' },
      { label: 'Insurance', href: '/#solutions', description: 'Claims, underwriting, and risk AI' },
      { label: 'Education', href: '/discover/categories/education', description: 'Learning and admin automation' },
      { label: 'Enterprise AI', href: '/discover/best/enterprise', description: 'Full-stack AI operating system' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Resources',
    items: [
      { label: 'Documentation', href: DOCS_URL, description: 'Guides and platform reference', external: true },
      { label: 'API Reference', href: '/api/docs', description: 'OpenAPI specification' },
      { label: 'Research', href: '/discover/research', description: 'AI Pass research papers' },
      { label: 'Blog', href: '#', description: 'Product updates and insights' },
      { label: 'AI News', href: '/discover/news', description: 'Latest AI industry news' },
      { label: 'Case Studies', href: '#', description: 'Enterprise success stories' },
      { label: 'Customer Stories', href: '/#stories', description: 'Voices from our customers' },
      { label: 'Whitepapers', href: '#', description: 'Enterprise AI strategy guides' },
      { label: 'Trust Layer', href: '/trust', description: 'Validate and certify AI systems' },
      { label: 'Trust Center', href: '/workspace/trust', description: 'Security and certification' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Company',
    items: [
      { label: 'About', href: '/about', description: 'Our mission and platform' },
      { label: 'Vision', href: '/about#vision', description: 'The future of enterprise AI' },
      { label: 'Leadership', href: '#', description: 'Executive team' },
      { label: 'Careers', href: '#', description: 'Join AI Pass' },
      { label: 'Investors', href: '/investors', description: 'Investment opportunity' },
      { label: 'Partners', href: '#', description: 'Technology and channel partners' },
      { label: 'Contact', href: '/about#contact', description: 'Enterprise inquiries' },
    ],
  },
  {
    type: 'dropdown',
    label: 'Pricing',
    items: [
      { label: 'Membership', href: '/workspace/membership', description: 'Universal AI subscription plans' },
      { label: 'AI Wallet', href: '/workspace/wallet', description: 'Credits, usage, and billing' },
      { label: 'Enterprise', href: '/#enterprise', description: 'Custom governance and SLA' },
    ],
  },
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
      { label: 'Government', href: '/#solutions' },
      { label: 'Retail', href: '/#solutions' },
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
