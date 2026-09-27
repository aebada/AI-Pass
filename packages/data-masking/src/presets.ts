import type { MaskingPolicy } from './types';
import { VALUE_PATTERNS } from './patterns';

/** Safe default for outbound API / webhook / partner shares. */
export const apiSharePolicy: MaskingPolicy = {
  id: 'api-share',
  name: 'API share',
  description: 'Mask names, passwords, secrets, emails, phones, and payment identifiers before sharing via APIs.',
  scanStrings: true,
  maxDepth: 12,
  rules: [
    { key: /password|passwd|pwd/i, kind: 'password', style: 'redact' },
    { key: /secret|private[_-]?key/i, kind: 'secret', style: 'redact' },
    { key: /api[_-]?key|access[_-]?key/i, kind: 'apiKey', style: 'partial' },
    { key: /token|bearer/i, kind: 'token', style: 'partial' },
    { key: /email/i, kind: 'email', style: 'partial' },
    { key: /phone|mobile|tel/i, kind: 'phone', style: 'partial' },
    { key: /name|surname|firstname|lastname/i, kind: 'name', style: 'partial' },
    { key: /ssn|national[_-]?id/i, kind: 'ssn', style: 'redact' },
    { key: /card|pan|cvv|cvc/i, kind: 'creditCard', style: 'partial' },
    { key: /iban|account/i, kind: 'iban', style: 'partial' },
    { key: /address|street|postal/i, kind: 'address', style: 'redact' },
    { valuePattern: VALUE_PATTERNS.jwt, kind: 'token', style: 'partial' },
    { valuePattern: VALUE_PATTERNS.apiKey, kind: 'apiKey', style: 'partial' },
    { valuePattern: VALUE_PATTERNS.email, kind: 'email', style: 'partial' },
    { valuePattern: VALUE_PATTERNS.ssn, kind: 'ssn', style: 'redact' },
    { valuePattern: VALUE_PATTERNS.creditCard, kind: 'creditCard', style: 'partial' },
  ],
};

/** Stricter policy for logs and third-party model prompts. */
export const externalPolicy: MaskingPolicy = {
  ...apiSharePolicy,
  id: 'external',
  name: 'External / logs',
  description: 'Aggressive masking for logs, LLM prompts, and untrusted egress.',
  rules: apiSharePolicy.rules.map((r) => ({
    ...r,
    style: r.kind === 'email' || r.kind === 'name' || r.kind === 'phone' ? 'redact' : r.style ?? 'redact',
  })),
};

/** Keep structure for internal debugging; only scrub secrets. */
export const secretsOnlyPolicy: MaskingPolicy = {
  id: 'secrets-only',
  name: 'Secrets only',
  description: 'Mask passwords, API keys, tokens, and secrets — leave names and contact fields.',
  scanStrings: true,
  maxDepth: 12,
  rules: [
    { key: /password|passwd|pwd|secret|private[_-]?key|api[_-]?key|token|bearer/i, kind: 'secret', style: 'redact' },
    { valuePattern: VALUE_PATTERNS.jwt, kind: 'token', style: 'redact' },
    { valuePattern: VALUE_PATTERNS.apiKey, kind: 'apiKey', style: 'redact' },
  ],
};

export const presets = {
  apiShare: apiSharePolicy,
  external: externalPolicy,
  secretsOnly: secretsOnlyPolicy,
} as const;

export type PresetName = keyof typeof presets;
