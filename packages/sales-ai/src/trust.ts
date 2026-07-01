export interface OutboundTrustInput {
  confidence: number;
  hasPersonalization: boolean;
  complianceChecked: boolean;
  hallucinationRisk: 'low' | 'medium' | 'high';
  channel: 'email' | 'linkedin' | 'proposal';
}

/** Trust Engine integration — email quality, compliance, hallucinations, confidence */
export class SalesTrustService {
  evaluateOutbound(input: OutboundTrustInput): {
    trustScore: number;
    decision: 'PASS' | 'NEEDS_INFO' | 'BLOCK';
    complianceOk: boolean;
    riskClass: 'low' | 'medium' | 'high';
    flags: string[];
  } {
    const flags: string[] = [];
    const functional = input.confidence * 100;
    const compliance = input.complianceChecked ? 92 : 55;
    const personalization = input.hasPersonalization ? 88 : 65;
    const safety =
      input.hallucinationRisk === 'low' ? 90 :
      input.hallucinationRisk === 'medium' ? 70 : 45;

    if (!input.complianceChecked) flags.push('compliance_not_verified');
    if (input.hallucinationRisk === 'high') flags.push('hallucination_risk');
    if (!input.hasPersonalization) flags.push('low_personalization');

    const trustScore = Math.round(
      functional * 0.3 + compliance * 0.3 + personalization * 0.2 + safety * 0.2,
    );

    const riskClass: 'low' | 'medium' | 'high' =
      !input.complianceChecked || input.hallucinationRisk === 'high' ? 'high' :
      input.confidence < 0.7 ? 'medium' : 'low';

    const decision: 'PASS' | 'NEEDS_INFO' | 'BLOCK' =
      riskClass === 'high' && input.hallucinationRisk === 'high' ? 'BLOCK' :
      riskClass === 'high' || input.confidence < 0.6 ? 'NEEDS_INFO' : 'PASS';

    return { trustScore, decision, complianceOk: input.complianceChecked, riskClass, flags };
  }
}

export const defaultSalesTrustService = new SalesTrustService();
