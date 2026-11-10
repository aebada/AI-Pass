import { getLiveSyncEngine } from '@ai-pass/livesync';
import type { Evaluation, Offer, SourcingEvent } from './types.js';

export async function emitOfferUploaded(offer: Offer, event: SourcingEvent): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'offer.uploaded',
      payload: {
        offer_id: offer.id,
        event_id: event.id,
        tenant_id: event.tenantId,
        supplier_id: offer.supplierId,
        supplier_name: offer.supplierName,
        total_price: offer.totalPrice,
        currency: offer.currency,
      },
      source: 'supply-chain-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitOfferParsed(offer: Offer): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'offer.parsed',
      payload: { offer_id: offer.id, status: offer.status },
      source: 'supply-chain-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitEvaluationComplete(evaluation: Evaluation): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'evaluation.completed',
      payload: {
        evaluation_id: evaluation.id,
        event_id: evaluation.eventId,
        tenant_id: evaluation.tenantId,
        recommended_offer_id: evaluation.recommendedOfferId,
        trust_score: evaluation.trustScore,
      },
      source: 'supply-chain-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitRankingUpdated(event: SourcingEvent, evaluation: Evaluation): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'ranking.updated',
      payload: {
        event_id: event.id,
        evaluation_id: evaluation.id,
        rankings: evaluation.results.map((r) => ({ offerId: r.offerId, rank: r.rank, score: r.score })),
      },
      source: 'supply-chain-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitApprovalRequired(eventId: string, decisionId: string): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'approval.required',
      payload: { event_id: eventId, decision_id: decisionId },
      source: 'supply-chain-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitDashboardRefresh(tenantId: string): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'dashboard.refresh',
      payload: { tenant_id: tenantId, module: 'supply-chain-ai' },
      source: 'supply-chain-ai',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}
