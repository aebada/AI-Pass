import { defaultModuleRegistry } from './module-registry.js';
import type { NavItem } from './types.js';

/** Primary workspace sidebar navigation (14 items from AI OS spec) */
export function buildWorkspaceNav(): NavItem[] {
  return defaultModuleRegistry.listNav().map((m) => ({
    id: m.id,
    label: m.name,
    route: m.route,
    icon: m.icon,
    badge: m.status === 'stub' ? 'Beta' : m.status === 'pending' ? 'Soon' : undefined,
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
  logoSrc: '/logo.png',
  logoAlt: 'AI-Pass',
} as const;
