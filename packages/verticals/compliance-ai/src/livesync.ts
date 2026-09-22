import { getLiveSyncEngine } from '@ai-pass/livesync';
import type { Evidence, Framework, Policy, Risk, Vendor } from './types.js';

export async function emitFrameworkActivated(framework: Framework): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'compliance.framework.activated',
      payload: { framework_id: framework.id, code: framework.code, tenant_id: framework.tenantId },
      source: 'compliance-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitRiskCreated(risk: Risk): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'compliance.risk.created',
      payload: { risk_id: risk.id, severity: risk.severity, category: risk.category, tenant_id: risk.tenantId },
      source: 'compliance-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitPolicyUpdated(policy: Policy): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'compliance.policy.updated',
      payload: { policy_id: policy.id, status: policy.status, tenant_id: policy.tenantId },
      source: 'compliance-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitVendorAdded(vendor: Vendor): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'compliance.vendor.added',
      payload: { vendor_id: vendor.id, risk_class: vendor.riskClass, tenant_id: vendor.tenantId },
      source: 'compliance-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitEvidenceExpiring(evidence: Evidence): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'compliance.evidence.expiring',
      payload: { evidence_id: evidence.id, expires_at: evidence.expiresAt, tenant_id: evidence.tenantId },
      source: 'compliance-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitEmployeeLifecycle(params: {
  tenantId: string;
  employeeId: string;
  event: 'join' | 'leave';
}): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: `compliance.employee.${params.event}`,
      payload: params,
      source: 'compliance-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitTrustIssue(params: {
  tenantId: string;
  issue: string;
  severity: string;
}): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'compliance.trust.issue',
      payload: params,
      source: 'compliance-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitModelChange(params: {
  tenantId: string;
  systemId: string;
  changeType: string;
}): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'compliance.ai_model.changed',
      payload: params,
      source: 'compliance-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}
