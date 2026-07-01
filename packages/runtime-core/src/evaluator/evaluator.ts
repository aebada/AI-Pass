import type { StructuredOutput } from '../types.js';

export interface EvaluationInput {
  result: Record<string, unknown>;
  goal: string;
  citations?: EvidenceRef[];
  policyRules?: string[];
}

export interface EvidenceRef {
  source: string;
  excerpt: string;
  url?: string;
}

export interface EvaluationResult {
  passed: boolean;
  confidence: number;
  decision: string;
  needsInfo: boolean;
  missingFields: string[];
  issues: EvaluationIssue[];
  evidence: EvidenceRef[];
}

export interface EvaluationIssue {
  code: 'low_confidence' | 'hallucination_risk' | 'policy_violation' | 'missing_citation' | 'incomplete' | 'compliance';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

const CONFIDENCE_THRESHOLD = 0.55;

export class Evaluator {
  evaluate(input: EvaluationInput): EvaluationResult {
    const issues: EvaluationIssue[] = [];
    let confidence = 0.85;

    const resultKeys = Object.keys(input.result);
    if (resultKeys.length === 0) {
      confidence = 0.2;
      issues.push({ code: 'incomplete', message: 'Empty result payload', severity: 'high' });
    }

    if (input.result.error || input.result.status === 'failed') {
      confidence = 0.1;
      issues.push({ code: 'incomplete', message: 'Task execution failed', severity: 'high' });
    }

    if (input.result.decision === 'NEEDS_INFO' || input.result.needsInfo === true) {
      confidence = Math.min(confidence, 0.4);
      issues.push({ code: 'low_confidence', message: 'Explicit NEEDS_INFO from upstream skill', severity: 'medium' });
    }

    const citations = input.citations ?? [];
    const claimsRetrieval = /retrieve|rag|knowledge|cite/i.test(input.goal);
    if (claimsRetrieval && citations.length === 0) {
      confidence -= 0.25;
      issues.push({ code: 'missing_citation', message: 'Retrieval task without citations', severity: 'medium' });
    }

    if (input.result.hallucinationRisk === true) {
      confidence -= 0.3;
      issues.push({ code: 'hallucination_risk', message: 'Hallucination risk flagged', severity: 'high' });
    }

    for (const rule of input.policyRules ?? []) {
      if (input.result[rule] === false) {
        confidence -= 0.2;
        issues.push({ code: 'policy_violation', message: `Policy rule failed: ${rule}`, severity: 'high' });
      }
    }

    if (input.result.compliant === false) {
      issues.push({ code: 'compliance', message: 'Compliance check failed', severity: 'high' });
      confidence -= 0.15;
    }

    confidence = Math.max(0, Math.min(1, confidence));
    const needsInfo = confidence < CONFIDENCE_THRESHOLD;

    const missingFields: string[] = [];
    if (needsInfo) {
      if (!input.result.decision && !input.result.answer) missingFields.push('decision');
      if (claimsRetrieval && citations.length === 0) missingFields.push('citations');
    }

    const decision = needsInfo
      ? 'NEEDS_INFO'
      : String(input.result.decision ?? input.result.answer ?? input.result.summary ?? 'COMPLETED');

    return {
      passed: !needsInfo && issues.filter((i) => i.severity === 'high').length === 0,
      confidence,
      decision,
      needsInfo,
      missingFields,
      issues,
      evidence: citations,
    };
  }

  toStructuredOutput(evalResult: EvaluationResult, result: Record<string, unknown>, format: StructuredOutput['format']): StructuredOutput {
    return {
      decision: evalResult.decision,
      confidence: evalResult.confidence,
      evidence: evalResult.evidence.map((e) => ({
        source: e.source,
        excerpt: e.excerpt,
        confidence: evalResult.confidence,
        url: e.url,
      })),
      result,
      format,
      needsInfo: evalResult.needsInfo,
      missingFields: evalResult.missingFields,
    };
  }
}

export const defaultEvaluator = new Evaluator();
