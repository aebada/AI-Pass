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
      { id: 'workspace', label: 'Workspace', route: '/workspace', icon: '◫' },
      { id: 'playground', label: 'AI Playground', route: '/workspace/playground', icon: '✦' },
    ],
  },
  {
    id: 'build',
    label: 'Build & Run',
    items: [
      { id: 'agents', label: 'Agents', route: '/workspace/agents', icon: '🤖' },
      { id: 'workflows', label: 'Workflows', route: '/workspace/workflows', icon: '⟳' },
      { id: 'knowledge', label: 'Knowledge', route: '/workspace/knowledge', icon: '📚' },
      { id: 'analysis', label: 'Analysis', route: '/workspace/analysis', icon: '📊' },
    ],
  },
  {
    id: 'ecosystem',
    label: 'Ecosystem',
    items: [
      { id: 'discover', label: 'Discover', route: '/workspace/discover', icon: '🔎' },
      { id: 'store', label: 'Store', route: '/workspace/store', icon: '🛒' },
      { id: 'marketplace', label: 'Marketplace', route: '/workspace/marketplace', icon: '🏪' },
      { id: 'apps', label: 'AI Apps', route: '/workspace/apps', icon: '📦' },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    items: [
      { id: 'governance', label: 'Governance', route: '/workspace/governance', icon: '🏛' },
      { id: 'trust', label: 'Trust Center', route: '/workspace/trust', icon: '🛡' },
      { id: 'compliance', label: 'Compliance', route: '/workspace/compliance', icon: '⚖' },
      { id: 'presence', label: 'Presence Audit', route: '/workspace/presence', icon: '👁' },
    ],
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { id: 'wallet', label: 'Wallet', route: '/workspace/wallet', icon: '💳' },
      { id: 'settings', label: 'Settings', route: '/workspace/settings', icon: '⚙' },
      { id: 'admin', label: 'Administration', route: '/workspace/admin', icon: '🏛' },
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
