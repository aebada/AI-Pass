import type { NavItem } from './types.js';
import { defaultModuleRegistry } from './module-registry.js';

/** Primary OS navigation sections per AI.docx spec */
export interface PlatformNavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const PLATFORM_NAV_SECTIONS: PlatformNavSection[] = [
  {
    id: 'core',
    label: 'Core',
    items: [
      { id: 'workspace', label: 'Workspace', route: '/workspace', icon: 'layout-grid' },
      { id: 'playground', label: 'AI Playground', route: '/workspace/playground', icon: 'sparkles' },
      { id: 'digital-twin', label: 'Digital Twin', route: '/workspace/twin', icon: 'user-circle' },
    ],
  },
  {
    id: 'build',
    label: 'Build & Run',
    items: [
      { id: 'agents', label: 'Agents', route: '/workspace/agents', icon: 'bot' },
      { id: 'workflows', label: 'Workflows', route: '/workspace/workflows', icon: 'git-branch' },
      { id: 'knowledge', label: 'Knowledge', route: '/workspace/knowledge', icon: 'book-open' },
      { id: 'analysis', label: 'Analysis', route: '/workspace/analysis', icon: 'bar-chart-3' },
    ],
  },
  {
    id: 'ecosystem',
    label: 'Ecosystem',
    items: [
      { id: 'discover', label: 'Discover', route: '/workspace/discover', icon: 'search' },
      { id: 'store', label: 'Store', route: '/workspace/store', icon: 'shopping-bag' },
      { id: 'marketplace', label: 'Marketplace', route: '/workspace/marketplace', icon: 'store' },
      { id: 'apps', label: 'AI Apps', route: '/workspace/apps', icon: 'grid-3x3' },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    items: [
      { id: 'governance', label: 'Governance', route: '/workspace/governance', icon: 'shield' },
      { id: 'trust', label: 'Trust Center', route: '/workspace/trust', icon: 'shield-check' },
      { id: 'compliance', label: 'Compliance', route: '/workspace/compliance', icon: 'scale' },
      { id: 'presence', label: 'Presence Audit', route: '/workspace/presence', icon: 'eye' },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { id: 'people', label: 'People', route: '/workspace/people', icon: 'users' },
      { id: 'wallet', label: 'Wallet', route: '/workspace/wallet', icon: 'credit-card' },
      { id: 'settings', label: 'Settings & Governance', route: '/workspace/settings', icon: 'settings' },
      { id: 'admin', label: 'Administration', route: '/workspace/admin', icon: 'building-2' },
    ],
  },
];
/** Flat primary nav — 14 items from spec */
export const PLATFORM_PRIMARY_NAV: NavItem[] = PLATFORM_NAV_SECTIONS.flatMap((s) => s.items);

export function buildPlatformNavigation(): NavItem[] {
  return defaultModuleRegistry.listNav().map((m) => ({
    id: m.id,
    label: m.name,
    route: m.route,
    icon: m.icon,
    badge: m.status === 'stub' ? 'Beta' : m.status === 'pending' ? 'Soon' : undefined,
  }));
}
