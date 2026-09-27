/** Shared detection patterns for values that look sensitive even without a key hint. */
export const VALUE_PATTERNS = {
  email: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
  phone: /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{3,4}/g,
  // Common password-like dense tokens (avoid masking short numbers)
  passwordLike: /(?=[^\s]*[A-Za-z])(?=[^\s]*\d)[^\s]{10,64}/g,
  apiKey: /\b(?:sk|pk|rk|key|tok)[_-][A-Za-z0-9]{16,}\b/g,
  jwt: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g,
  creditCard: /\b(?:\d[ -]*?){13,19}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  iban: /\b[A-Z]{2}\d{2}[A-Z0-9]{10,30}\b/g,
  ipv4: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
} as const;

/** Key substrings → kind (lowercase match). Longer / more specific first. */
export const KEY_HINTS: Array<{ match: RegExp; kind: import('./types').MaskKind }> = [
  { match: /password|passwd|pwd|passphrase/i, kind: 'password' },
  { match: /secret|client_secret|private[_-]?key/i, kind: 'secret' },
  { match: /api[_-]?key|access[_-]?key|app[_-]?key/i, kind: 'apiKey' },
  { match: /token|bearer|refresh[_-]?token|id[_-]?token/i, kind: 'token' },
  { match: /email|e-mail/i, kind: 'email' },
  { match: /phone|mobile|tel\b|msisdn/i, kind: 'phone' },
  { match: /^(full)?name$|first[_-]?name|last[_-]?name|surname|display[_-]?name|given[_-]?name|family[_-]?name/i, kind: 'name' },
  { match: /ssn|social[_-]?security|national[_-]?id/i, kind: 'ssn' },
  { match: /card[_-]?(number|no)|pan\b|cvv|cvc/i, kind: 'creditCard' },
  { match: /iban|account[_-]?number/i, kind: 'iban' },
  { match: /address|street|postal|zip|postcode/i, kind: 'address' },
  { match: /ip[_-]?address|^ip$/i, kind: 'ip' },
];
