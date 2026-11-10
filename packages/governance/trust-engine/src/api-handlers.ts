import { ok, type ApiError, type ApiResponse } from '@ai-pass/platform-core';
import { getTrustEngine } from './platform.js';
import type { CertifyRequest, TestScenario, ValidateRequest } from './types.js';

export function handleTrustValidate(body: ValidateRequest): ApiResponse<{ run: unknown }> | ApiError {
  try {
    const engine = getTrustEngine();
    const run = engine.validate(body);
    return ok({ run });
  } catch (e) {
    return { error: { code: 'VALIDATION_DENIED', message: String(e) } } satisfies ApiError;
  }
}

export async function handleTrustValidateAsync(body: ValidateRequest): Promise<ApiResponse<{ run: unknown }> | ApiError> {
  return handleTrustValidate(body);
}

export function handleTrustCertify(body: CertifyRequest): ApiResponse<{ certification: unknown }> | ApiError {
  try {
    const engine = getTrustEngine();
    const cert = engine.certify(body);
    return ok({ certification: cert });
  } catch (e) {
    return { error: { code: 'CERTIFICATION_DENIED', message: String(e) } } satisfies ApiError;
  }
}

export function handleTrustSystems(): ApiResponse<unknown> {
  const engine = getTrustEngine();
  return ok({ systems: engine.systems.list() });
}

export function handleTrustReports(systemId?: string): ApiResponse<unknown> {
  const engine = getTrustEngine();
  return ok({ reports: engine.reporting.list(systemId) });
}

export function handleTrustVerification(id: string): ApiResponse<{ verification: unknown }> | ApiError {
  const engine = getTrustEngine();
  const record = engine.verification.verify(id);
  if (!record) {
    return { error: { code: 'NOT_FOUND', message: `Verification ${id} not found` } } satisfies ApiError;
  }
  return ok({ verification: record });
}

export function handleTrustMonitoring(systemId?: string): ApiResponse<unknown> {
  const engine = getTrustEngine();
  return ok({
    events: engine.monitoring.getEvents(systemId),
    activeCount: engine.monitoring.getActiveCount(),
    alerts: engine.monitoring.getRecentAlerts(20),
  });
}

export function handleTrustDashboard(): ApiResponse<unknown> {
  const engine = getTrustEngine();
  return ok({ dashboard: engine.getDashboard() });
}

export function handleTrustTestSuite(body: {
  systemId: string;
  scenarios: TestScenario[];
}): ApiResponse<unknown> {
  const engine = getTrustEngine();
  const suiteId = engine.registerTestSuite(body.systemId, body.scenarios);
  return ok({ suiteId });
}

export function getTrustSummaryForResource(resourceId: string) {
  const engine = getTrustEngine();
  const system = engine.systems.getByResourceId(resourceId);
  if (!system) return null;

  const certs = engine.certification.listBySystem(system.id);
  const activeCert = certs.find((c) => c.status === 'certified' && new Date(c.validUntil) >= new Date());
  const badge = activeCert ? engine.badges.get(activeCert.verificationId) : undefined;

  return {
    systemId: system.id,
    certified: Boolean(activeCert),
    trustScore: activeCert?.scorecard.overall ?? null,
    riskLevel: activeCert?.riskClass ?? (system.highRiskDomain ? 'high' : 'medium'),
    certificationStatus: activeCert?.status ?? system.status,
    certificationLevel: activeCert?.level,
    verificationId: activeCert?.verificationId,
    verificationUrl: activeCert?.verificationUrl,
    badge,
  };
}
