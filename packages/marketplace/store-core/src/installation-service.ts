import type { MarketplaceRuntimePlatform } from '@ai-pass/marketplace-runtime';
import {
  checkInstallEntitlement,
  emitInstallEvent,
  type LiveSyncEventEmitter,
} from '@ai-pass/marketplace-core';
import { appWorkspaceRoute } from '@ai-pass/routes';
import type { MembershipTier } from '@ai-pass/shared';
import type {
  StoreInstallRequest,
  StoreInstallResult,
  InstallStepResult,
  Subscription,
  Permission,
  WalletTransaction,
} from './types.js';
import type { Application, Installation } from '@ai-pass/marketplace-core';
import { createId } from '@ai-pass/shared';

const PERMISSION_LABELS: Record<string, Omit<Permission, 'id'>> = {
  'documents.read': { label: 'Read documents', description: 'Access uploaded documents and files', required: true, riskLevel: 'medium' },
  'documents.write': { label: 'Write documents', description: 'Modify and store documents', required: false, riskLevel: 'high' },
  'erp.write': { label: 'ERP integration', description: 'Write data to connected ERP systems', required: false, riskLevel: 'high' },
  'crm.read': { label: 'Read CRM', description: 'Read customer records from CRM', required: false, riskLevel: 'medium' },
  'crm.write': { label: 'Write CRM', description: 'Create and update CRM records', required: false, riskLevel: 'high' },
  'wallet.deduct': { label: 'AI Wallet', description: 'Deduct credits for AI execution', required: true, riskLevel: 'low' },
  'governance.read': { label: 'Governance read', description: 'Read compliance policies', required: false, riskLevel: 'medium' },
  'governance.write': { label: 'Governance write', description: 'Modify governance settings', required: false, riskLevel: 'critical' },
  'computer.action': { label: 'Computer action', description: 'Control desktop applications', required: false, riskLevel: 'critical' },
};

export class InstallationService {
  private transactions: WalletTransaction[] = [];
  private subscriptions = new Map<string, Subscription>();

  constructor(
    private runtime: MarketplaceRuntimePlatform,
    private liveSyncEmit?: LiveSyncEventEmitter,
  ) {}

  getPermissionsForApp(app: Application): Permission[] {
    return app.permissions.map((p) => ({
      id: p,
      ...(PERMISSION_LABELS[p] ?? {
        label: p,
        description: `Permission: ${p}`,
        required: true,
        riskLevel: 'medium' as const,
      }),
    }));
  }

  listInstalled(tenantId: string) {
    return this.runtime.installations.listForTenant(tenantId);
  }

  getInstalledApps(tenantId: string): Application[] {
    const installs = this.listInstalled(tenantId);
    return installs
      .map((i: Installation) => this.runtime.apps.get(i.appId))
      .filter((a): a is Application => Boolean(a));
  }

  uninstall(installationId: string, tenantId: string) {
    const result = this.runtime.installations.uninstall(installationId, tenantId);
    this.liveSyncEmit?.({
      type: 'marketplace.install',
      payload: { action: 'uninstall', installationId, tenantId },
    });
    return result;
  }

  /**
   * Full install flow:
   * Install → Permission Review → Membership Validation → Wallet Check →
   * Install → Activate → Add to Workspace → Ready
   */
  install(request: StoreInstallRequest): StoreInstallResult {
    const steps: InstallStepResult[] = [];
    const app = this.runtime.apps.get(request.appId) ?? this.runtime.apps.getBySlug(request.appId);
    if (!app) throw new Error(`App not found: ${request.appId}`);

    const granted = request.permissionsGranted ?? app.permissions;
    const missing = app.permissions.filter((p: string) => !granted.includes(p));
    if (missing.length > 0) {
      steps.push({ step: 'permission_review', status: 'failed', message: `Missing: ${missing.join(', ')}` });
      throw new Error(`Permission review failed: ${missing.join(', ')}`);
    }
    steps.push({ step: 'permission_review', status: 'passed' });

    const entitlement = checkInstallEntitlement(this.runtime.integrations, request.userTier);
    if (!entitlement.allowed) {
      steps.push({ step: 'membership_validation', status: 'failed', message: entitlement.reason });
      throw new Error(entitlement.reason ?? 'Membership validation failed');
    }
    steps.push({ step: 'membership_validation', status: 'passed' });

    const balance = this.runtime.integrations.wallet.getBalance(request.userId);
    const minCredits = request.minCredits ?? (app.pricePerUse ? 10 : 0);
    if (minCredits > 0 && balance.creditsRemaining < minCredits) {
      steps.push({
        step: 'wallet_check',
        status: 'failed',
        message: `Insufficient credits: need ${minCredits}, have ${balance.creditsRemaining}`,
      });
      throw new Error('Insufficient wallet credits');
    }
    steps.push({ step: 'wallet_check', status: 'passed' });

    if (request.orgId) {
      const policy = this.runtime.enterprise.getOrCreatePolicy(request.orgId);
      if (policy.requireApproval && !policy.approvedAppIds.includes(app.id)) {
        this.runtime.enterprise.submitForApproval(request.orgId, app.id);
        throw new Error('App submitted for enterprise approval');
      }
    }

    const installation = this.runtime.installations.install({
      appId: app.id,
      tenantId: request.tenantId,
      userId: request.userId,
      userTier: request.userTier,
      permissionsGranted: granted,
    });
    steps.push({ step: 'install', status: 'passed' });

    this.runtime.installations.activate(installation.id, request.tenantId);
    steps.push({ step: 'activate', status: 'passed' });

    const workspaceRoute = appWorkspaceRoute(app.slug);
    steps.push({ step: 'workspace_add', status: 'passed', message: workspaceRoute });

    if (app.pricingModel === 'subscription' || app.pricingModel === 'freemium') {
      const sub: Subscription = {
        id: `sub_${createId()}`,
        appId: app.id,
        tenantId: request.tenantId,
        userId: request.userId,
        planTier: (request.userTier as MembershipTier) ?? 'professional',
        status: 'active',
        startedAt: new Date().toISOString(),
        renewsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
      };
      this.subscriptions.set(sub.id, sub);
    }

    if (app.pricePerUse || app.pricingModel === 'pay_per_use') {
      this.runtime.integrations.wallet.recordUsage({
        userId: request.userId,
        tenantId: request.tenantId,
        provider: 'store',
        model: app.name,
        credits: minCredits || 5,
        estimatedCostUsd: (minCredits || 5) * 0.01,
        taskType: 'app_install',
        module: 'store',
        metadata: { appId: app.id },
      });
      this.transactions.push({
        id: `txn_${createId()}`,
        userId: request.userId,
        tenantId: request.tenantId,
        appId: app.id,
        credits: minCredits || 5,
        type: 'install',
        description: `Install ${app.name}`,
        timestamp: new Date().toISOString(),
      });
    }

    emitInstallEvent(this.liveSyncEmit, {
      appId: app.id,
      userId: request.userId,
      tenantId: request.tenantId,
    });

    steps.push({ step: 'ready', status: 'passed' });

    return {
      installation,
      steps,
      workspaceRoute,
      subscription: [...this.subscriptions.values()].find((s) => s.appId === app.id),
    };
  }

  getSubscriptions(tenantId: string): Subscription[] {
    return [...this.subscriptions.values()].filter((s) => s.tenantId === tenantId);
  }

  getTransactions(userId: string): WalletTransaction[] {
    return this.transactions.filter((t) => t.userId === userId);
  }
}
