import { createId } from '@ai-pass/shared';
import type {
  AppRegistry,
  Installation,
  RuntimeMode,
  MarketplaceIntegrations,
  LiveSyncEventEmitter,
} from '@ai-pass/marketplace-core';
import { checkInstallEntitlement, emitInstallEvent } from '@ai-pass/marketplace-core';

export class InstallationManager {
  private installations = new Map<string, Installation[]>();

  constructor(
    private appRegistry: AppRegistry,
    private integrations: MarketplaceIntegrations,
    private liveSyncEmit?: LiveSyncEventEmitter,
  ) {}

  install(params: {
    appId: string;
    tenantId: string;
    userId: string;
    userTier: string;
    permissionsGranted?: string[];
    runtimeMode?: RuntimeMode;
  }): Installation {
    const app = this.appRegistry.get(params.appId);
    if (!app) throw new Error(`App not found: ${params.appId}`);

    const entitlement = checkInstallEntitlement(this.integrations, params.userTier);
    if (!entitlement.allowed) {
      throw new Error(entitlement.reason ?? 'Installation not permitted');
    }

    const existing = this.getActive(params.appId, params.tenantId);
    if (existing) return existing;

    const installation: Installation = {
      id: `inst_${createId()}`,
      appId: params.appId,
      tenantId: params.tenantId,
      userId: params.userId,
      permissionsGranted: params.permissionsGranted ?? app.permissions,
      status: 'active',
      runtimeMode: params.runtimeMode ?? 'cloud',
      installedAt: new Date().toISOString(),
      activatedAt: new Date().toISOString(),
    };

    const tenantInstalls = this.installations.get(params.tenantId) ?? [];
    tenantInstalls.push(installation);
    this.installations.set(params.tenantId, tenantInstalls);

    this.appRegistry.update(params.appId, { installCount: app.installCount + 1 });

    emitInstallEvent(this.liveSyncEmit, {
      appId: params.appId,
      userId: params.userId,
      tenantId: params.tenantId,
    });

    return installation;
  }

  activate(installationId: string, tenantId: string): Installation | undefined {
    const installs = this.installations.get(tenantId) ?? [];
    const inst = installs.find((i) => i.id === installationId);
    if (!inst) return undefined;
    inst.status = 'active';
    inst.activatedAt = new Date().toISOString();
    return inst;
  }

  suspend(installationId: string, tenantId: string): Installation | undefined {
    const installs = this.installations.get(tenantId) ?? [];
    const inst = installs.find((i) => i.id === installationId);
    if (!inst) return undefined;
    inst.status = 'suspended';
    return inst;
  }

  uninstall(installationId: string, tenantId: string): Installation | undefined {
    const installs = this.installations.get(tenantId) ?? [];
    const inst = installs.find((i) => i.id === installationId);
    if (!inst) return undefined;
    inst.status = 'uninstalled';
    return inst;
  }

  listForTenant(tenantId: string): Installation[] {
    return (this.installations.get(tenantId) ?? []).filter((i) => i.status !== 'uninstalled');
  }

  getActive(appId: string, tenantId: string): Installation | undefined {
    return this.listForTenant(tenantId).find((i) => i.appId === appId && i.status === 'active');
  }

  isInstalled(appId: string, tenantId: string): boolean {
    return !!this.getActive(appId, tenantId);
  }
}
