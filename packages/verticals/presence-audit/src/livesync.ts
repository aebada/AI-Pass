import { getLiveSyncEngine } from '@ai-pass/livesync';

export async function emitAuditCompleted(params: {
  companyId: string;
  tenantId: string;
  auditRunId: string;
  score: number;
}): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'presence.audit.completed',
      payload: params,
      source: 'presence-audit',
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
      event_type: 'presence.dashboard.refresh',
      payload: { tenant_id: tenantId },
      source: 'presence-audit',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitCompetitorAdded(params: {
  companyId: string;
  competitorName: string;
}): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'presence.competitor.added',
      payload: params,
      source: 'presence-audit',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitTrustScoreChanged(params: {
  companyId: string;
  trustScore: number;
}): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'presence.trust.changed',
      payload: params,
      source: 'presence-audit',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}

export async function emitKnowledgeUpdated(params: {
  companyId: string;
  sourceType: 'website' | 'kb' | 'faq' | 'docs';
}): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const result = await engine.runLive({
      event_type: 'presence.knowledge.updated',
      payload: params,
      source: 'presence-audit',
    });
    return result.event_id;
  } catch {
    return undefined;
  }
}
