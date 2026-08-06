import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PIIMasker } from './pii-masker.js';

describe('PIIMasker', () => {
  const masker = new PIIMasker();

  it('redacts email addresses', () => {
    const result = masker.mask('Contact billing@acme-supplies.de for details');
    assert.equal(result.maskedText, 'Contact [EMAIL_REDACTED] for details');
    assert.deepEqual(result.redactedFields, ['email']);
    assert.equal(result.piiCount, 1);
  });

  it('redacts IBAN numbers', () => {
    const result = masker.mask('Pay to DE89370400440532013000 please');
    assert.match(result.maskedText, /\[IBAN_REDACTED\]/);
    assert.ok(result.redactedFields.includes('iban'));
  });

  it('redacts multiple PII types in one pass', () => {
    const text = 'Email: user@corp.com Phone: +49 30 12345678 IBAN DE89370400440532013000';
    const result = masker.mask(text);
    assert.equal(result.piiCount, 3);
    assert.ok(result.redactedFields.includes('email'));
    assert.ok(result.redactedFields.includes('phone'));
    assert.ok(result.redactedFields.includes('iban'));
    assert.ok(!result.maskedText.includes('user@corp.com'));
  });

  it('maskFields redacts string values in extraction fields', () => {
    const fields = masker.maskFields({
      vendorEmail: { value: 'billing@vendor.de', confidence: 0.95 },
      amount: { value: 1200, confidence: 0.99 },
    });
    assert.equal((fields.vendorEmail as { value: string }).value, '[EMAIL_REDACTED]');
    assert.equal((fields.amount as { value: number }).value, 1200);
  });

  it('returns unchanged text when no PII detected', () => {
    const text = 'Invoice total EUR 1500.00 due 2026-04-01';
    const result = masker.mask(text);
    assert.equal(result.maskedText, text);
    assert.equal(result.piiCount, 0);
    assert.deepEqual(result.redactedFields, []);
  });
});
