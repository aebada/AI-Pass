import { getGovernanceService } from '@ai-pass/governance';
import { ValidationOrchestrator } from '@ai-pass/trust';

let _trust: ValidationOrchestrator | undefined;

export function getGovernance() {
  return getGovernanceService();
}

export function getTrustOrchestrator(): ValidationOrchestrator {
  if (!_trust) _trust = new ValidationOrchestrator();
  return _trust;
}

export function jsonOk<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}

export function jsonError(message: string, status = 400): Response {
  return Response.json({ success: false, error: message }, { status });
}
