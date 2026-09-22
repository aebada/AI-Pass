export interface ConversationTrustInput {
  confidence: number;
  policyCompliant: boolean;
  hasCitations: boolean;
  escalated: boolean;
}

export class SupportTrustService {
  evaluateConversation(input: ConversationTrustInput): {
    trustScore: number;
    policyCompliant: boolean;
    riskClass: 'low' | 'medium' | 'high';
  } {
    const functional = input.confidence * 100;
    const compliance = input.policyCompliant ? 90 : 50;
    const explainability = input.hasCitations ? 85 : 60;
    const safety = input.escalated ? 70 : 90;

    const trustScore = Math.round(
      functional * 0.35 + compliance * 0.25 + explainability * 0.2 + safety * 0.2,
    );

    const riskClass: 'low' | 'medium' | 'high' =
      !input.policyCompliant ? 'high' :
      input.escalated ? 'medium' :
      input.confidence < 0.6 ? 'medium' : 'low';

    return {
      trustScore,
      policyCompliant: input.policyCompliant,
      riskClass,
    };
  }
}

export const defaultSupportTrustService = new SupportTrustService();
