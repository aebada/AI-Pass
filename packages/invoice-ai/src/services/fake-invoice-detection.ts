import type { FakeInvoiceDetection, FakeInvoiceVerdict } from '../api-types.js';

/** Risk score is 0–1; thresholds map to verdict labels shown in the UI. */
export function computeFakeInvoiceVerdict(riskScore: number): FakeInvoiceVerdict {
  const pct = riskScore * 100;
  if (pct < 40) return 'Authentic';
  if (pct <= 70) return 'Suspicious';
  return 'Likely Fake';
}

export function buildFakeInvoiceDetection(
  riskScore: number,
  signals: string[],
): FakeInvoiceDetection {
  return {
    authenticityScore: Math.round(riskScore * 100),
    signals,
    verdict: computeFakeInvoiceVerdict(riskScore),
    riskScore,
  };
}

export function parseStoredSignals(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((s): s is string => typeof s === 'string');
  if (typeof value === 'string' && value.trim()) return [value];
  return [];
}
