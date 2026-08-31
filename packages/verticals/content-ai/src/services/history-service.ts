import type { DetectionResult, HumanizeResult } from '../types.js';
import type { DetectorService } from './detector-service.js';
import type { HumanizerService } from './humanizer-service.js';

export interface HistoryEntry {
  id: string;
  type: 'detect' | 'humanize';
  preview: string;
  aiScore?: number;
  tone?: string;
  trustScore: number;
  creditsUsed: number;
  createdAt: string;
}

export class HistoryService {
  constructor(
    private detector: DetectorService,
    private humanizer: HumanizerService,
  ) {}

  list(tenantId: string, limit = 50): HistoryEntry[] {
    const detections = this.detector.list(tenantId).map((d) => this.fromDetection(d));
    const humanizations = this.humanizer.list(tenantId).map((h) => this.fromHumanize(h));
    return [...detections, ...humanizations]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit);
  }

  private fromDetection(d: DetectionResult): HistoryEntry {
    return {
      id: d.id,
      type: 'detect',
      preview: d.text.slice(0, 120) + (d.text.length > 120 ? '…' : ''),
      aiScore: d.aiScore,
      trustScore: d.trustScore,
      creditsUsed: d.creditsUsed,
      createdAt: d.createdAt,
    };
  }

  private fromHumanize(h: HumanizeResult): HistoryEntry {
    return {
      id: h.id,
      type: 'humanize',
      preview: h.originalText.slice(0, 120) + (h.originalText.length > 120 ? '…' : ''),
      tone: h.tone,
      trustScore: h.trustScore,
      creditsUsed: h.creditsUsed,
      createdAt: h.createdAt,
    };
  }
}
