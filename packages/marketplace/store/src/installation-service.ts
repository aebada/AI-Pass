import { createId, type AppInstallation, type StoreAppMetadata } from '@ai-pass/shared';
import type { AppRegistry } from './app-registry.js';

export class InstallationService {
  private installations = new Map<string, AppInstallation>();

  constructor(private registry: AppRegistry) {}

  install(params: {
    appId: string;
    tenantId: string;
    userId: string;
    permissionsGranted: string[];
  }): AppInstallation {
    const app = this.registry.get(params.appId);
    if (!app) throw new Error(`App not found: ${params.appId}`);

    const missing = app.permissions.filter((p) => !params.permissionsGranted.includes(p));
    if (missing.length > 0) {
      throw new Error(`Missing required permissions: ${missing.join(', ')}`);
    }

    const installation: AppInstallation = {
      id: `inst_${createId()}`,
      appId: params.appId,
      tenantId: params.tenantId,
      userId: params.userId,
      permissionsGranted: params.permissionsGranted,
      installedAt: new Date().toISOString(),
      status: 'active',
    };

    this.installations.set(installation.id, installation);
    return installation;
  }

  uninstall(installationId: string): void {
    const inst = this.installations.get(installationId);
    if (inst) {
      this.installations.set(installationId, { ...inst, status: 'uninstalled' });
    }
  }

  listByTenant(tenantId: string): AppInstallation[] {
    return [...this.installations.values()].filter(
      (i) => i.tenantId === tenantId && i.status === 'active'
    );
  }

  getInstalledApps(tenantId: string): StoreAppMetadata[] {
    const ids = this.listByTenant(tenantId).map((i) => i.appId);
    return ids.map((id) => this.registry.get(id)).filter((a): a is StoreAppMetadata => Boolean(a));
  }
}
