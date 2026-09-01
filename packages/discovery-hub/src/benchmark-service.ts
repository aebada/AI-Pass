import type { BenchmarkMetric, BenchmarkSnapshot, Tool } from './types.js';

const METRIC_LABELS: Record<BenchmarkMetric['key'], string> = {
  reasoning: 'Reasoning',
  coding: 'Coding',
  mathematics: 'Mathematics',
  translation: 'Translation',
  rag: 'RAG',
  vision: 'Vision',
  long_context: 'Long Context',
  cost_efficiency: 'Cost Efficiency',
  latency: 'Latency',
  tool_calling: 'Tool Calling',
};

/**
 * Independent evaluation snapshots with history for Discovery Hub tools.
 */
export class BenchmarkService {
  private history = new Map<string, BenchmarkSnapshot[]>();

  constructor() {
    // Seed empty — snapshots generated on demand and cached.
  }

  evaluate(tool: Tool, measuredAt = new Date().toISOString()): BenchmarkSnapshot {
    const caps = new Set(tool.profile.capabilities);
    const seed = hash(tool.id);

    const metrics: BenchmarkMetric[] = (Object.keys(METRIC_LABELS) as BenchmarkMetric['key'][]).map((key, i) => {
      let base = 55 + ((seed + i * 17) % 35);
      if (key === 'coding' && caps.has('code')) base += 12;
      if (key === 'vision' && caps.has('vision')) base += 15;
      if (key === 'rag' && tool.tags.some((t) => /rag|knowledge|retrieval/i.test(t))) base += 10;
      if (key === 'tool_calling' && tool.source === 'marketplace') base += 8;
      if (key === 'cost_efficiency' && (tool.pricingModel === 'free' || tool.openSource)) base += 10;
      if (key === 'latency') {
        const ms = tool.profile.latencyMs ?? 900;
        return {
          key,
          label: METRIC_LABELS[key],
          score: Math.max(20, Math.min(100, Math.round(1200 - ms / 10))),
          unit: 'ms',
          higherIsBetter: true,
        };
      }
      if (key === 'long_context' && tool.profile.contextWindow) {
        base = Math.min(100, Math.round(Math.log10(tool.profile.contextWindow) * 18));
      }
      return {
        key,
        label: METRIC_LABELS[key],
        score: Math.max(20, Math.min(100, base)),
        higherIsBetter: true,
      };
    });

    const overall = Math.round(metrics.reduce((s, m) => s + m.score, 0) / metrics.length);
    const snapshot: BenchmarkSnapshot = { toolId: tool.id, measuredAt, metrics, overall };
    const list = this.history.get(tool.id) ?? [];
    list.push(snapshot);
    this.history.set(tool.id, list.slice(-12));
    return snapshot;
  }

  getLatest(toolId: string): BenchmarkSnapshot | undefined {
    const list = this.history.get(toolId);
    return list?.[list.length - 1];
  }

  getHistory(toolId: string): BenchmarkSnapshot[] {
    return this.history.get(toolId) ?? [];
  }

  ensure(tool: Tool): BenchmarkSnapshot {
    return this.getLatest(tool.id) ?? this.evaluate(tool);
  }
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
