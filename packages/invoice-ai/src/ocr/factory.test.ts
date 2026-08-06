import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createOcrProvider,
  listOcrProviders,
  resolveOcrProviderId,
} from './factory.js';

describe('OCR provider factory', () => {
  it('defaults to stub provider', () => {
    assert.equal(resolveOcrProviderId(), 'stub');
  });

  it('lists all supported providers', () => {
    const providers = listOcrProviders();
    assert.ok(providers.includes('stub'));
    assert.ok(providers.includes('unlimited-ocr'));
    assert.ok(providers.includes('paddle'));
    assert.ok(providers.includes('google'));
    assert.equal(providers.length, 7);
  });

  it('cloud stubs tag ocr_engine field', async () => {
    const provider = createOcrProvider({ providerId: 'google' });
    const result = await provider.extract({
      fileName: 'acme-invoice.pdf',
      mimeType: 'application/pdf',
    });
    assert.equal(result.providerId, 'google');
    assert.equal(result.fields.ocr_engine?.value, 'Google Document AI');
  });
});
