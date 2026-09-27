import { KEY_HINTS, VALUE_PATTERNS } from './patterns';
import { presets, type PresetName } from './presets';
import type { MaskHit, MaskKind, MaskResult, MaskRule, MaskStyle, MaskingPolicy } from './types';

function simpleHash(input: string): string {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `h_${(h >>> 0).toString(16).padStart(8, '0')}`;
}

function maskScalar(value: string, kind: MaskKind, style: MaskStyle, replacement?: string): string {
  if (style === 'null') return '';
  if (style === 'hash') return simpleHash(value);
  if (style === 'redact') return replacement ?? `[${kind.toUpperCase()}]`;
  // partial
  if (kind === 'email') {
    const [user, domain] = value.split('@');
    if (!user || !domain) return replacement ?? '[EMAIL]';
    return `${user.slice(0, 1)}***@${domain}`;
  }
  if (kind === 'phone' || kind === 'creditCard' || kind === 'iban') {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 4) return '****';
    return `${'*'.repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
  }
  if (kind === 'name') {
    const parts = value.trim().split(/\s+/);
    return parts.map((p) => (p.length <= 1 ? '*' : `${p[0]}${'*'.repeat(Math.min(6, p.length - 1))}`)).join(' ');
  }
  if (value.length <= 8) return '****';
  return `${value.slice(0, 3)}…${value.slice(-2)}`;
}

function keyAllowed(key: string, policy: MaskingPolicy): boolean {
  return (policy.allowKeys ?? []).some((k) => k.toLowerCase() === key.toLowerCase());
}

function matchRule(key: string | undefined, value: string, policy: MaskingPolicy): MaskRule | undefined {
  for (const rule of policy.rules) {
    if (key && rule.key) {
      const ok = typeof rule.key === 'string'
        ? key.toLowerCase().includes(rule.key.toLowerCase())
        : rule.key.test(key);
      if (ok) return rule;
    }
  }
  for (const rule of policy.rules) {
    if (rule.valuePattern && rule.valuePattern.test(value)) {
      rule.valuePattern.lastIndex = 0;
      return rule;
    }
  }
  if (key) {
    for (const hint of KEY_HINTS) {
      if (hint.match.test(key)) {
        return { kind: hint.kind, style: 'redact', key: hint.match };
      }
    }
  }
  return undefined;
}

function scanFreeText(text: string, policy: MaskingPolicy, path: string, hits: MaskHit[]): string {
  if (!policy.scanStrings) return text;
  let out = text;
  const specs: Array<{ re: RegExp; kind: MaskKind }> = [
    { re: VALUE_PATTERNS.jwt, kind: 'token' },
    { re: VALUE_PATTERNS.apiKey, kind: 'apiKey' },
    { re: VALUE_PATTERNS.email, kind: 'email' },
    { re: VALUE_PATTERNS.ssn, kind: 'ssn' },
    { re: VALUE_PATTERNS.creditCard, kind: 'creditCard' },
    { re: VALUE_PATTERNS.iban, kind: 'iban' },
  ];
  for (const { re, kind } of specs) {
    re.lastIndex = 0;
    if (re.test(out)) {
      re.lastIndex = 0;
      out = out.replace(re, (m) => {
        hits.push({ path, kind, style: 'partial' });
        return maskScalar(m, kind, 'partial');
      });
    }
  }
  return out;
}

function walk(value: unknown, path: string, depth: number, policy: MaskingPolicy, hits: MaskHit[]): unknown {
  const maxDepth = policy.maxDepth ?? 12;
  if (depth > maxDepth || value == null) return value;

  if (typeof value === 'string') {
    const key = path.includes('.') ? path.split('.').pop() : path.replace(/^\$\.?/, '') || undefined;
    if (key && keyAllowed(key, policy)) return value;
    const rule = matchRule(key === '$' ? undefined : key, value, policy);
    if (rule) {
      const style = rule.style ?? 'redact';
      hits.push({ path, kind: rule.kind, style });
      return maskScalar(value, rule.kind, style, rule.replacement);
    }
    return scanFreeText(value, policy, path, hits);
  }

  if (Array.isArray(value)) {
    return value.map((item, i) => walk(item, `${path}[${i}]`, depth + 1, policy, hits));
  }

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = walk(v, path ? `${path}.${k}` : k, depth + 1, policy, hits);
    }
    return out;
  }

  return value;
}

function resolvePolicy(policy?: MaskingPolicy | PresetName): MaskingPolicy {
  if (!policy) return presets.apiShare;
  if (typeof policy === 'string') return presets[policy];
  return policy;
}

/**
 * One-line apply: mask sensitive fields before API / webhook / partner share.
 *
 * @example
 * return Response.json(applyMasking(payload));
 * return Response.json(applyMasking(payload, 'external'));
 */
export function applyMasking<T>(data: T, policy?: MaskingPolicy | PresetName): T {
  return applyMaskingWithReport(data, policy).data;
}

/** Same as applyMasking, but returns hit report for audits / UI. */
export function applyMaskingWithReport<T>(data: T, policy?: MaskingPolicy | PresetName): MaskResult<T> {
  const resolved = resolvePolicy(policy);
  const hits: MaskHit[] = [];
  const masked = walk(data, '$', 0, resolved, hits) as T;
  return { data: masked, hits, policyId: resolved.id };
}

/**
 * Wrap a handler so its JSON-serializable return value is masked.
 *
 * @example
 * export const GET = withDataMasking(async () => ({ user: row }), 'apiShare');
 */
export function withDataMasking<TArgs extends unknown[], TResult>(
  handler: (...args: TArgs) => TResult | Promise<TResult>,
  policy?: MaskingPolicy | PresetName,
): (...args: TArgs) => Promise<TResult> {
  return async (...args: TArgs) => {
    const result = await handler(...args);
    return applyMasking(result, policy);
  };
}
