import type { MembershipTier } from '@ai-pass/shared';
import { createId } from '@ai-pass/shared';
import { defaultWalletService } from '@ai-pass/wallet';
import type { DetectionLabel, DetectionResult, SentenceHighlight } from '../types.js';
import { CONTENT_AI_PRICING } from '../types.js';
import { canAccessContentAI, getContentLimits } from '../membership-gates.js';
import { defaultContentProviderRouting } from '../provider-routing.js';
import { defaultContentTrustService } from '../trust.js';
import { emitDetectionCompleted } from '../livesync.js';

const AI_PATTERNS = [
  /\b(furthermore|moreover|additionally|in conclusion|it is important to note)\b/i,
  /\b(comprehensive|leverage|utilize|facilitate|robust|seamless)\b/i,
  /\b(in today's|in the digital age|ever-evolving landscape)\b/i,
];

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
}

function heuristicSentenceScore(sentence: string, index: number, total: number): number {
  let score = 40;
  const words = sentence.split(/\s+/).length;
  if (words > 25) score += 15;
  if (words > 15 && words < 22) score += 8;
  for (const pattern of AI_PATTERNS) {
    if (pattern.test(sentence)) score += 12;
  }
  if (sentence.includes('—') || sentence.includes(';')) score += 5;
  const uniformity = Math.abs(index - total / 2) < total * 0.3 ? 5 : 0;
  score += uniformity;
  return Math.min(98, Math.max(5, score));
}

function scoreToLabel(probability: number): DetectionLabel {
  if (probability >= 70) return 'ai';
  if (probability <= 30) return 'human';
  return 'mixed';
}

export class DetectorService {
  private detections: DetectionResult[] = [];
  private monthlyCounts = new Map<string, number>();

  constructor(seed: DetectionResult[] = []) {
    this.detections = [...seed];
  }

  list(tenantId: string): DetectionResult[] {
    return this.detections
      .filter((d) => d.tenantId === tenantId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  get(id: string): DetectionResult | undefined {
    return this.detections.find((d) => d.id === id);
  }

  async detect(params: {
    tenantId: string;
    userId: string;
    tier: MembershipTier;
    text: string;
  }): Promise<DetectionResult> {
    if (!canAccessContentAI(params.tier)) {
      throw new Error('Content AI requires membership access.');
    }

    const limits = getContentLimits(params.tier);
    const used = this.monthlyCounts.get(params.tenantId) ?? 0;
    if (used >= limits.detectsPerMonth) {
      throw new Error(`Detection limit reached (${limits.detectsPerMonth}/month). Upgrade your plan.`);
    }

    const sentences = splitSentences(params.text);
    const highlights: SentenceHighlight[] = sentences.map((text, index) => {
      const aiProbability = heuristicSentenceScore(text, index, sentences.length);
      return { index, text, aiProbability, label: scoreToLabel(aiProbability) };
    });

    const avgAi =
      highlights.length > 0
        ? highlights.reduce((sum, h) => sum + h.aiProbability, 0) / highlights.length
        : 50;

    const llm = await defaultContentProviderRouting.analyzeForDetection({
      text: params.text,
      userId: params.userId,
      tenantId: params.tenantId,
      membershipTier: params.tier,
    });

    const llmBoost = llm.analysis.toLowerCase().includes('ai') ? 8 : -5;
    const aiScore = Math.round(Math.min(99, Math.max(1, avgAi + llmBoost)));
    const humanScore = 100 - aiScore;
    const confidence = Math.min(0.95, 0.55 + highlights.length * 0.03 + (llm.credits > 0 ? 0.1 : 0));

    const trust = defaultContentTrustService.evaluateDetection({ aiScore, confidence });

    const creditsUsed = CONTENT_AI_PRICING.detectCredits;
    defaultWalletService.recordUsage({
      userId: params.userId,
      tenantId: params.tenantId,
      provider: 'Content AI',
      model: llm.modelId,
      credits: creditsUsed,
      estimatedCostUsd: creditsUsed * 0.002,
      taskType: 'content_detect',
      module: 'content-ai',
      metadata: { wordCount: params.text.split(/\s+/).length },
    });

    this.monthlyCounts.set(params.tenantId, used + 1);

    const result: DetectionResult = {
      id: `det_${createId()}`,
      tenantId: params.tenantId,
      userId: params.userId,
      text: params.text,
      wordCount: params.text.split(/\s+/).filter(Boolean).length,
      aiScore,
      humanScore,
      confidence,
      modelHints: [llm.modelId, ...llm.analysis.slice(0, 80).split(' ').slice(0, 3)],
      sentences: highlights,
      trustScore: trust.trustScore,
      creditsUsed,
      createdAt: new Date().toISOString(),
    };

    this.detections.push(result);
    void emitDetectionCompleted(result);
    return result;
  }

  getMonthlyCount(tenantId: string): number {
    return this.monthlyCounts.get(tenantId) ?? 0;
  }
}
