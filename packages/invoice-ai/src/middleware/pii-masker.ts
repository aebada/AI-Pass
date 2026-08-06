import type { PIIMaskResult } from './types.js';

const PII_PATTERNS: Array<{ name: string; pattern: RegExp; replacement: string }> = [
  { name: 'email', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL_REDACTED]' },
  { name: 'iban', pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g, replacement: '[IBAN_REDACTED]' },
  { name: 'credit_card', pattern: /\b(?:\d[ -]*?){13,19}\b/g, replacement: '[CARD_REDACTED]' },
  { name: 'phone', pattern: /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/g, replacement: '[PHONE_REDACTED]' },
  { name: 'tax_id', pattern: /\b(?:DE|AT|CH|FR|GB)\d{8,12}\b/gi, replacement: '[TAX_ID_REDACTED]' },
  { name: 'ssn', pattern: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN_REDACTED]' },
];

export class PIIMasker {
  mask(text: string): PIIMaskResult {
    let maskedText = text;
    const redactedFields: string[] = [];
    let piiCount = 0;

    for (const { name, pattern, replacement } of PII_PATTERNS) {
      const matches = maskedText.match(pattern);
      if (matches && matches.length > 0) {
        piiCount += matches.length;
        if (!redactedFields.includes(name)) redactedFields.push(name);
        maskedText = maskedText.replace(pattern, replacement);
      }
    }

    return { maskedText, redactedFields, piiCount };
  }

  maskFields(fields: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (typeof value === 'string') {
        result[key] = this.mask(value).maskedText;
      } else if (value && typeof value === 'object' && 'value' in (value as object)) {
        const field = value as { value: unknown; confidence?: number };
        result[key] =
          typeof field.value === 'string'
            ? { ...field, value: this.mask(field.value).maskedText }
            : field;
      } else {
        result[key] = value;
      }
    }
    return result;
  }
}

export const defaultPIIMasker = new PIIMasker();
