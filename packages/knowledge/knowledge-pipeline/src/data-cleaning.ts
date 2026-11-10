import type { Document } from '@ai-pass/shared';

export interface CleaningResult {
  document: Document;
  issuesFixed: string[];
  validationErrors: string[];
}

/** Data cleaning — dedup, normalize, validate, encode */
export class DataCleaningService {
  deduplicate(documents: Document[]): Document[] {
    const seen = new Set<string>();
    return documents.filter((d) => {
      const key = d.content.trim().slice(0, 200);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  normalizeDates(text: string): string {
    return text.replace(/\b(\d{1,2})[./](\d{1,2})[./](\d{4})\b/g, '$3-$2-$1');
  }

  normalizeCurrency(text: string): string {
    return text
      .replace(/€\s*([\d.,]+)/g, 'EUR $1')
      .replace(/\$\s*([\d.,]+)/g, 'USD $1');
  }

  cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
      .trim();
  }

  fillMissing(value: unknown, fallback: string): string {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
  }

  validateSchema(doc: Document, requiredFields: string[]): string[] {
    const errors: string[] = [];
    for (const field of requiredFields) {
      if (!(field in doc.metadata) && field !== 'title') {
        errors.push(`Missing required field: ${field}`);
      }
    }
    if (!doc.content.trim()) errors.push('Empty content');
    return errors;
  }

  process(doc: Document): CleaningResult {
    const issuesFixed: string[] = [];
    let content = doc.content;

    const cleaned = this.cleanText(content);
    if (cleaned !== content) {
      issuesFixed.push('whitespace_normalized');
      content = cleaned;
    }

    const dateNorm = this.normalizeDates(content);
    if (dateNorm !== content) {
      issuesFixed.push('dates_normalized');
      content = dateNorm;
    }

    const currencyNorm = this.normalizeCurrency(content);
    if (currencyNorm !== content) {
      issuesFixed.push('currency_normalized');
      content = currencyNorm;
    }

    const validationErrors = this.validateSchema({ ...doc, content }, ['source']);

    return {
      document: { ...doc, content, updatedAt: new Date().toISOString() },
      issuesFixed,
      validationErrors,
    };
  }
}
