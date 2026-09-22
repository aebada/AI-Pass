import { defaultEvaluator } from '@ai-pass/runtime-core';
import type { AgentDecision } from '@ai-pass/shared';
import type { Evaluation, EvaluationRequest } from '../types.js';

export class EvaluationService {
  evaluate(request: EvaluationRequest): Evaluation {
    const result = defaultEvaluator.evaluate({
      result: request.result,
      goal: request.goal,
      citations: [],
    });

    const structured = defaultEvaluator.toStructuredOutput(result, request.result, 'decision');
    const decision = (structured.decision as AgentDecision) ?? 'NEEDS_INFO';

    return {
      executionId: request.executionId,
      passed: result.passed,
      confidence: result.confidence,
      decision,
      issues: result.issues.map((i) => i.message),
      evidence: result.evidence.map((e) => e.excerpt),
    };
  }
}
