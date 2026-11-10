import { PLATFORM_MODULE_DEFS } from './modules.js';
import type { ModuleCategory, ModulePermission, ModuleStatus, ModuleTier, PlatformModuleDef } from './types.js';

export class ModuleRegistry {
  private readonly modules: Map<string, PlatformModuleDef>;

  constructor(defs: PlatformModuleDef[] = PLATFORM_MODULE_DEFS) {
    this.modules = new Map(defs.map((m) => [m.id, m]));
  }

  register(module: PlatformModuleDef): void {
    this.modules.set(module.id, module);
  }

  get(id: string): PlatformModuleDef | undefined {
    return this.modules.get(id);
  }

  list(): PlatformModuleDef[] {
    return [...this.modules.values()].sort((a, b) => a.navOrder - b.navOrder);
  }

  listByCategory(category: ModuleCategory): PlatformModuleDef[] {
    return this.list().filter((m) => m.category === category);
  }

  listByStatus(status: ModuleStatus): PlatformModuleDef[] {
    return this.list().filter((m) => m.status === status);
  }

  listNav(): PlatformModuleDef[] {
    return this.list().filter((m) => m.showInNav);
  }

  listByTier(tier: ModuleTier): PlatformModuleDef[] {
    return this.list().filter((m) => m.tier === tier || this.tierAllows(tier, m.tier));
  }

  hasPermission(moduleId: string, permission: ModulePermission): boolean {
    const mod = this.get(moduleId);
    return mod?.permissions.includes(permission) ?? false;
  }

  getDependencies(id: string): PlatformModuleDef[] {
    const mod = this.get(id);
    if (!mod) return [];
    return mod.dependencies
      .map((depId) => this.get(depId))
      .filter((m): m is PlatformModuleDef => m !== undefined);
  }

  getDependents(id: string): PlatformModuleDef[] {
    return this.list().filter((m) => m.dependencies.includes(id));
  }

  resolveRoute(id: string): string | undefined {
    return this.get(id)?.route;
  }

  private tierAllows(userTier: ModuleTier, requiredTier: ModuleTier): boolean {
    const rank: Record<ModuleTier, number> = {
      free: 0,
      professional: 1,
      power: 2,
      enterprise: 3,
    };
    return rank[userTier] >= rank[requiredTier];
  }
}

export const defaultModuleRegistry = new ModuleRegistry();
