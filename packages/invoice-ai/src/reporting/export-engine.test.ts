import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  exportDashboardPDF,
  exportInvoicesCSV,
  exportInvoicesJSON,
} from './export-engine.js';
import type { Invoice } from '@ai-pass/shared/invoice-ai';

const sampleInvoice: Invoice = {
  id: 'inv_1',
  tenantId: 'tenant_acme',
  invoiceNumber: 'INV-2026-1001',
  vendorId: 'vnd_1',
  vendorName: 'Acme Supplies GmbH',
  documentType: 'invoice',
  direction: 'incoming',
  status: 'pending_approval',
  amount: 1500,
  currency: 'EUR',
  items: [],
  decision: 'PASS',
  uploadedAt: '2026-04-01T10:00:00.000Z',
};

describe('Reporting export engine', () => {
  it('exportInvoicesCSV includes header and row', () => {
    const csv = exportInvoicesCSV([sampleInvoice]);
    assert.match(csv, /^id,invoiceNumber/);
    assert.match(csv, /INV-2026-1001/);
    assert.match(csv, /Acme Supplies GmbH/);
  });

  it('exportInvoicesCSV escapes commas in values', () => {
    const inv = { ...sampleInvoice, vendorName: 'Acme, GmbH' };
    const csv = exportInvoicesCSV([inv]);
    assert.match(csv, /"Acme, GmbH"/);
  });

  it('exportInvoicesJSON returns structured payload', () => {
    const json = exportInvoicesJSON([sampleInvoice]);
    const parsed = JSON.parse(json) as { count: number; invoices: Invoice[] };
    assert.equal(parsed.count, 1);
    assert.equal(parsed.invoices[0]?.id, 'inv_1');
    assert.ok(parsed.invoices[0]?.exportedAt === undefined);
  });

  it('exportDashboardPDF returns stub metadata', () => {
    const pdf = exportDashboardPDF(
      {
        todayProcessed: 5,
        awaitingApproval: 2,
        fraudAlerts: 1,
        monthlySpend: 12000,
        vendorCount: 8,
        approvalRate: 92,
      },
      'tenant_acme',
    );
    assert.equal(pdf.format, 'pdf');
    assert.equal(pdf.status, 'stub');
    assert.equal(pdf.tenantId, 'tenant_acme');
    assert.ok(pdf.contentBase64.length > 0);
  });
});
