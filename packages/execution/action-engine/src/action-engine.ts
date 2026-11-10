import { createId } from '@ai-pass/shared';
import type {
  ActionAuditEntry,
  ActionMode,
  ActionRequest,
  ActionSecurityPolicy,
  ActionType,
} from './types.js';
import { DEFAULT_ACTION_POLICY } from './types.js';

export class ActionEngine {
  private auditLog: ActionAuditEntry[] = [];
  private policy: ActionSecurityPolicy = { ...DEFAULT_ACTION_POLICY };
  private rollbackStack: Array<{ id: string; snapshot: Record<string, unknown> }> = [];

  setPolicy(policy: Partial<ActionSecurityPolicy>): void {
    this.policy = { ...this.policy, ...policy };
  }

  emergencyStop(): void {
    this.policy.emergencyStop = true;
  }

  resume(): void {
    this.policy.emergencyStop = false;
  }

  getAuditLog(limit = 50): ActionAuditEntry[] {
    return this.auditLog.slice(-limit);
  }

  async execute(request: ActionRequest, approved = false): Promise<ActionAuditEntry> {
    const mode: ActionMode =
      this.policy.simulationOnly || request.mode === 'simulation' ? 'simulation' : 'live';

    const entry: ActionAuditEntry = {
      id: `act_${createId()}`,
      actionType: request.type,
      userId: request.userId,
      tenantId: request.tenantId,
      mode,
      approved,
      success: false,
      timestamp: new Date().toISOString(),
      details: { target: request.target, params: request.params },
      rollbackAvailable: false,
    };

    if (this.policy.emergencyStop) {
      entry.details.error = 'Emergency stop active';
      this.auditLog.push(entry);
      return entry;
    }

    if (!this.policy.whitelist.includes(request.type)) {
      entry.details.error = 'Action not in whitelist';
      this.auditLog.push(entry);
      return entry;
    }

    if (this.policy.requireApproval.includes(request.type) && !approved) {
      entry.details.error = 'Approval required';
      this.auditLog.push(entry);
      return entry;
    }

    const result = await this.runActionStub(request.type, request, mode);
    entry.success = result.success;
    entry.details = { ...entry.details, ...result.details };
    entry.rollbackAvailable = result.rollbackSnapshot !== undefined;

    if (result.rollbackSnapshot) {
      this.rollbackStack.push({ id: entry.id, snapshot: result.rollbackSnapshot });
    }

    this.auditLog.push(entry);
    return entry;
  }

  rollback(actionId: string): boolean {
    const idx = this.rollbackStack.findIndex((r) => r.id === actionId);
    if (idx < 0) return false;
    this.rollbackStack.splice(idx, 1);
    return true;
  }

  private async runActionStub(
    type: ActionType,
    request: ActionRequest,
    mode: ActionMode,
  ): Promise<{ success: boolean; details: Record<string, unknown>; rollbackSnapshot?: Record<string, unknown> }> {
    const base = { mode, stub: true, type, target: request.target };
    switch (type) {
      case 'browser_navigate':
        return { success: true, details: { ...base, url: request.target } };
      case 'browser_click':
        return { success: true, details: { ...base, selector: request.params?.selector } };
      case 'form_fill':
        return {
          success: true,
          details: { ...base, fields: request.params?.fields },
          rollbackSnapshot: { formState: 'empty' },
        };
      case 'portal_login':
        return { success: mode === 'simulation', details: { ...base, portal: request.target } };
      case 'file_upload':
        return { success: true, details: { ...base, file: request.params?.filename } };
      case 'file_download':
        return { success: true, details: { ...base, path: `/tmp/${request.params?.filename ?? 'download'}` } };
      case 'screenshot':
        return { success: true, details: { ...base, path: '/tmp/screenshot.png' } };
      case 'desktop_automation_stub':
        return { success: true, details: { ...base, action: request.params?.action } };
      default:
        return { success: false, details: { error: 'Unknown action' } };
    }
  }
}

export const defaultActionEngine = new ActionEngine();
