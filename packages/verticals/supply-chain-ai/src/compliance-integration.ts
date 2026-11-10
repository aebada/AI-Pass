/** Compliance AI integration stub */
export interface ComplianceCheckResult {
  compliant: boolean;
  violations: Array<{ rule: string; severity: string; message: string }>;
  citations: string[];
}

export function runComplianceCheck(params: {
  offerId: string;
  policyIds: string[];
  jurisdiction?: string;
}): ComplianceCheckResult {
  return {
    compliant: true,
    violations: [],
    citations: params.policyIds.map((id) => `compliance-ai://policy/${id}`),
  };
}
