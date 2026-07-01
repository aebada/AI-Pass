/** AI-Pass View — unified workspace navigation and module registry */

export type PlatformModuleId =
  | 'workspace'
  | 'requirements'
  | 'builder-studio'
  | 'solutions'
  | 'solution-marketplace'
  | 'store'
  | 'marketplace'
  | 'agent-studio'
  | 'trust'
  | 'governance'
  | 'knowledge-pipeline'
  | 'livesync'
  | 'presence-audit'
  | 'invoice-ai'
  | 'supply-chain'
  | 'customer-support'
  | 'content-ai';

export interface PlatformModule {
  id: PlatformModuleId;
  name: string;
  description: string;
  route: string;
  icon: string;
  category: 'core' | 'platform' | 'marketplace' | 'vertical';
  status: 'implemented' | 'stubbed';
}

export const PLATFORM_MODULES: PlatformModule[] = [
  {
    id: 'workspace',
    name: 'AI Pass Platform',
    description: 'Monaco workspace with chat, agent, and terminal',
    route: '/ide',
    icon: '◫',
    category: 'core',
    status: 'implemented',
  },
  {
    id: 'requirements',
    name: 'Requirements Wizard',
    description: 'Natural language business requirements capture',
    route: '/requirements',
    icon: '📝',
    category: 'core',
    status: 'implemented',
  },
  {
    id: 'builder-studio',
    name: 'Solution Builder Studio',
    description: 'Visual canvas for forms, workflows, and agents',
    route: '/studio',
    icon: '🎨',
    category: 'core',
    status: 'implemented',
  },
  {
    id: 'solutions',
    name: 'My Solutions',
    description: 'Manage and deploy business applications',
    route: '/solutions',
    icon: '📦',
    category: 'core',
    status: 'implemented',
  },
  {
    id: 'solution-marketplace',
    name: 'Solution Marketplace',
    description: 'Install and customize vertical solutions',
    route: '/marketplace',
    icon: '🏪',
    category: 'marketplace',
    status: 'implemented',
  },
  {
    id: 'store',
    name: 'AI Pass Store',
    description: 'Discover, install, and monetize AI apps',
    route: '/platform/store',
    icon: '🏪',
    category: 'marketplace',
    status: 'implemented',
  },
  {
    id: 'marketplace',
    name: 'Skills Marketplace',
    description: 'Reusable AI agent skills and runtime',
    route: '/platform/marketplace',
    icon: '⚡',
    category: 'marketplace',
    status: 'implemented',
  },
  {
    id: 'agent-studio',
    name: 'Agent Studio',
    description: 'Create, configure, and run AI agents',
    route: '/platform/agent-studio',
    icon: '🤖',
    category: 'core',
    status: 'implemented',
  },
  {
    id: 'trust',
    name: 'Trust Engine',
    description: 'Validate, certify, and monitor AI systems',
    route: '/platform/trust',
    icon: '🛡',
    category: 'platform',
    status: 'implemented',
  },
  {
    id: 'governance',
    name: 'AI Governance',
    description: 'Policy enforcement, risk, and compliance ops',
    route: '/platform/governance',
    icon: '⚖',
    category: 'platform',
    status: 'implemented',
  },
  {
    id: 'knowledge-pipeline',
    name: 'Knowledge Pipeline',
    description: 'Ingest, enrich, and sync AI-ready knowledge',
    route: '/platform/knowledge',
    icon: '📚',
    category: 'platform',
    status: 'implemented',
  },
  {
    id: 'livesync',
    name: 'LiveSync Engine',
    description: 'Real-time event-driven AI orchestration',
    route: '/platform/livesync',
    icon: '⟳',
    category: 'platform',
    status: 'implemented',
  },
  {
    id: 'presence-audit',
    name: 'Presence Audit',
    description: 'Measure and optimize AI recommendation visibility',
    route: '/workspace/apps/presence-audit',
    icon: '👁',
    category: 'vertical',
    status: 'implemented',
  },
  {
    id: 'invoice-ai',
    name: 'Invoice AI',
    description: 'Finance automation and invoice lifecycle',
    route: '/platform/invoice-ai',
    icon: '🧾',
    category: 'vertical',
    status: 'implemented',
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain AI',
    description: 'Procurement offer evaluation and ranking',
    route: '/platform/supply-chain',
    icon: '📦',
    category: 'vertical',
    status: 'implemented',
  },
  {
    id: 'customer-support',
    name: 'Customer Support AI',
    description: 'Voice + text multi-language support agent',
    route: '/platform/customer-support',
    icon: '💬',
    category: 'vertical',
    status: 'implemented',
  },
  {
    id: 'content-ai',
    name: 'Content AI',
    description: 'AI Detector & Humanizer — detect and humanize content with Trust Engine',
    route: '/workspace/apps/content-ai',
    icon: '✍',
    category: 'vertical',
    status: 'implemented',
  },
];

export class ViewRegistry {
  getModules(category?: PlatformModule['category']): PlatformModule[] {
    return category ? PLATFORM_MODULES.filter((m) => m.category === category) : PLATFORM_MODULES;
  }

  getModule(id: PlatformModuleId): PlatformModule | undefined {
    return PLATFORM_MODULES.find((m) => m.id === id);
  }

  getNavigation(): PlatformModule[] {
    return PLATFORM_MODULES;
  }
}

export interface DashboardPanel {
  id: string;
  title: string;
  moduleId: PlatformModuleId;
  metrics: Array<{ label: string; value: string | number }>;
}

export function buildPlatformDashboard(): DashboardPanel[] {
  return [
    {
      id: 'overview',
      title: 'Platform Overview',
      moduleId: 'workspace',
      metrics: [
        { label: 'Active Modules', value: PLATFORM_MODULES.length },
        { label: 'Core Layers', value: 5 },
        { label: 'Vertical Apps', value: 4 },
      ],
    },
    {
      id: 'trust',
      title: 'Trust & Governance',
      moduleId: 'trust',
      metrics: [
        { label: 'Certification Levels', value: '4' },
        { label: 'Monitoring', value: 'Active' },
      ],
    },
    {
      id: 'marketplace',
      title: 'Marketplace',
      moduleId: 'store',
      metrics: [
        { label: 'Store Apps', value: '4+' },
        { label: 'Revenue Share', value: '70/30' },
      ],
    },
  ];
}
