/** Sensitive field categories the masking layer can protect. */
export type MaskKind =
  | 'password'
  | 'secret'
  | 'apiKey'
  | 'token'
  | 'email'
  | 'phone'
  | 'name'
  | 'ssn'
  | 'creditCard'
  | 'iban'
  | 'address'
  | 'ip'
  | 'custom';

export type MaskStyle = 'redact' | 'partial' | 'hash' | 'null';

export interface MaskRule {
  /** Match on object key (case-insensitive substring or exact). */
  key?: string | RegExp;
  /** Detect value shape with a regex when key heuristics miss. */
  valuePattern?: RegExp;
  kind: MaskKind;
  style?: MaskStyle;
  /** Replacement label, e.g. [PASSWORD]. Ignored for hash/null/partial. */
  replacement?: string;
}

export interface MaskingPolicy {
  id: string;
  name: string;
  description?: string;
  /** Rules applied in order; first match wins per value. */
  rules: MaskRule[];
  /** Also scan free-text strings for embedded secrets/PII. */
  scanStrings?: boolean;
  /** Keys that are never masked (allowlist). */
  allowKeys?: string[];
  /** Max depth when walking nested objects. */
  maxDepth?: number;
}

export interface MaskHit {
  path: string;
  kind: MaskKind;
  style: MaskStyle;
}

export interface MaskResult<T = unknown> {
  data: T;
  hits: MaskHit[];
  policyId: string;
}
