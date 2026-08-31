import { getLiveSyncEngine } from '@ai-pass/livesync';
import type { DetectionResult, HumanizeResult } from './types.js';

export async function emitDetectionCompleted(result: DetectionResult): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const live = await engine.runLive({
      event_type: 'content_ai.detection.completed',
      payload: {
        detection_id: result.id,
        tenant_id: result.tenantId,
        ai_score: result.aiScore,
        human_score: result.humanScore,
        confidence: result.confidence,
        word_count: result.wordCount,
      },
      source: 'content-ai',
    });
    return live.event_id;
  } catch {
    return undefined;
  }
}

export async function emitHumanizationCompleted(result: HumanizeResult): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const live = await engine.runLive({
      event_type: 'content_ai.humanization.completed',
      payload: {
        humanize_id: result.id,
        tenant_id: result.tenantId,
        tone: result.tone,
        model_id: result.modelId,
        credits_used: result.creditsUsed,
      },
      source: 'content-ai',
    });
    return live.event_id;
  } catch {
    return undefined;
  }
}

export async function emitUsageRefresh(tenantId: string): Promise<string | undefined> {
  try {
    const engine = getLiveSyncEngine();
    const live = await engine.runLive({
      event_type: 'content_ai.usage.refresh',
      payload: { tenant_id: tenantId },
      source: 'content-ai',
    });
    return live.event_id;
  } catch {
    return undefined;
  }
}
