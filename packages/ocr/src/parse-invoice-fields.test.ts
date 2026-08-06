import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseInvoiceFieldsFromText } from './parse-invoice-fields.js';

describe('parseInvoiceFieldsFromText', () => {
  it('extracts common invoice fields from OCR markdown', () => {
    const text = [
      'Vendor: Acme Supplies GmbH',
      'Invoice Number: INV-2026-4421',
      'Date: 2026-07-05',
      'Grand Total: EUR 1,234.56',
    ].join('\n');

    const fields = parseInvoiceFieldsFromText(text);
    assert.equal(fields.vendor?.value, 'Acme Supplies GmbH');
    assert.equal(fields.invoice_number?.value, 'INV-2026-4421');
    assert.equal(fields.currency?.value, 'EUR');
    assert.equal(fields.total?.value, 1234.56);
  });
});
