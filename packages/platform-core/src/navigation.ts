import { defaultModuleRegistry } from './module-registry.js';
import type { ModuleCategory, NavItem } from './types.js';

export interface WorkspaceNavSection {
  id: string;
  label: string;
  items: NavItem[];
}

const CATEGORY_ORDER: ModuleCategory[] = ['core', 'ai', 'platform', 'marketplace', 'vertical', 'infrastructure'];

const CATEGORY_LABELS: Record<ModuleCategory, string> = {
  core: 'Core',
  ai: 'AI',
  platform: 'Build',
  marketplace: 'Ecosystem',
  vertical: 'Apps',
  infrastructure: 'System',
};

function toNavItem(m: { id: string; name: string; route: string; icon: string; status: string }): NavItem {
  return {
    id: m.id,
    label: m.name,
    route: m.route,
    icon: m.icon,
    badge: m.status === 'stub' ? 'Beta' : m.status === 'pending' ? 'Soon' : undefined,
  };
}

/** Primary workspace sidebar navigation (flat) */
export function buildWorkspaceNav(): NavItem[] {
  return defaultModuleRegistry.listNav().map(toNavItem);
}

/** Grouped sidebar sections for calmer navigation */
export function buildWorkspaceNavSections(): WorkspaceNavSection[] {
  const byCategory = new Map<ModuleCategory, NavItem[]>();

  for (const m of defaultModuleRegistry.listNav()) {
    const list = byCategory.get(m.category) ?? [];
    list.push(toNavItem(m));
    byCategory.set(m.category, list);
  }

  return CATEGORY_ORDER.filter((cat) => (byCategory.get(cat)?.length ?? 0) > 0).map((cat) => ({
    id: cat,
    label: CATEGORY_LABELS[cat],
    items: byCategory.get(cat)!,
  }));
}

export function buildModuleGrid(): NavItem[] {
  return defaultModuleRegistry.list().map((m) => ({
    id: m.id,
    label: m.name,
    route: m.route,
    icon: m.icon,
    badge: m.status,
  }));
}

export const WORKSPACE_BRAND = {
  name: 'AI-Pass',
  tagline: 'Enterprise AI Operating System',
  logoMark: 'AP',
  logoSrc: '/logo.svg',
  logoLightSrc: '/logo-light.svg',
  logoAlt: 'AI-Pass',
} as const;
