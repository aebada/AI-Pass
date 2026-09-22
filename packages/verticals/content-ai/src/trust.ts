export interface ContentTrustInput {
  aiScore: number;
  confidence: number;
  humanizeQuality?: number;
  meaningPreserved?: boolean;
}

/** Trust Engine integration — output quality scoring */
export class ContentTrustService {
  evaluateDetection(input: ContentTrustInput): {
    trustScore: number;
    decision: 'PASS' | 'NEEDS_INFO' | 'BLOCK';
    riskClass: 'low' | 'medium' | 'high';
    flags: string[];
  } {
    const flags: string[] = [];
    if (input.confidence < 0.6) flags.push('low_confidence');
    if (input.aiScore > 90 && input.confidence < 0.75) flags.push('borderline_high_ai');

    const functional = input.confidence * 100;
    const reliability = input.aiScore > 50 ? 88 : 82;
    const explainability = 85;
    const trustScore = Math.round(functional * 0.4 + reliability * 0.3 + explainability * 0.3);

    const riskClass: 'low' | 'medium' | 'high' =
      input.confidence < 0.5 ? 'high' : input.confidence < 0.7 ? 'medium' : 'low';

    const decision: 'PASS' | 'NEEDS_INFO' | 'BLOCK' =
      riskClass === 'high' ? 'NEEDS_INFO' : 'PASS';

    return { trustScore, decision, riskClass, flags };
  }

  evaluateHumanization(input: ContentTrustInput): {
    trustScore: number;
    decision: 'PASS' | 'NEEDS_INFO' | 'BLOCK';
    riskClass: 'low' | 'medium' | 'high';
    flags: string[];
  } {
    const flags: string[] = [];
    if (!input.meaningPreserved) flags.push('meaning_drift');
    const quality = input.humanizeQuality ?? 0.85;

    const trustScore = Math.round(quality * 100);
    const riskClass: 'low' | 'medium' | 'high' =
      quality < 0.6 ? 'high' : quality < 0.8 ? 'medium' : 'low';

    const decision: 'PASS' | 'NEEDS_INFO' | 'BLOCK' =
      riskClass === 'high' ? 'BLOCK' : riskClass === 'medium' ? 'NEEDS_INFO' : 'PASS';

    return { trustScore, decision, riskClass, flags };
  }
}

export const defaultContentTrustService = new ContentTrustService();
