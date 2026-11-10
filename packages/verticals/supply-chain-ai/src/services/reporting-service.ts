import { createId } from '@ai-pass/shared';
import type { Artifact, Evaluation, Offer, SourcingEvent } from '../types.js';

export class ReportingService {
  generateComparisonReport(params: {
    event: SourcingEvent;
    offers: Offer[];
    evaluation: Evaluation;
  }): Artifact {
    return {
      id: `art_${createId()}`,
      evaluationId: params.evaluation.id,
      type: 'comparison',
      title: `Offer Comparison — ${params.event.title}`,
      format: 'json',
      createdAt: new Date().toISOString(),
    };
  }

  generateDecisionMemo(params: { event: SourcingEvent; evaluation: Evaluation }): Artifact {
    const winner = params.evaluation.results.find((r) => r.offerId === params.evaluation.recommendedOfferId);
    return {
      id: `art_${createId()}`,
      evaluationId: params.evaluation.id,
      type: 'decision_memo',
      title: `Award Recommendation — ${winner?.supplierName ?? 'TBD'}`,
      format: 'pdf',
      createdAt: new Date().toISOString(),
    };
  }

  generateEvidencePack(evaluation: Evaluation): Artifact {
    return {
      id: `art_${createId()}`,
      evaluationId: evaluation.id,
      type: 'evidence_pack',
      title: 'Evaluation Evidence Pack',
      format: 'json',
      createdAt: new Date().toISOString(),
    };
  }
}
