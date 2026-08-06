import type { Invoice } from '@ai-pass/shared/invoice-ai';
import type { DashboardStats } from '../api-types.js';

function escapeCsv(value: unknown): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportInvoicesCSV(invoices: Invoice[]): string {
  const headers = [
    'id',
    'invoiceNumber',
    'vendorName',
    'status',
    'amount',
    'currency',
    'documentType',
    'dueDate',
    'uploadedAt',
  ];

  const rows = invoices.map((inv) =>
    [
      inv.id,
      inv.invoiceNumber,
      inv.vendorName,
      inv.status,
      inv.amount,
      inv.currency,
      inv.documentType,
      inv.dueDate ?? '',
      inv.uploadedAt,
    ]
      .map(escapeCsv)
      .join(','),
  );

  return [headers.join(','), ...rows].join('\n');
}

export function exportInvoicesJSON(invoices: Invoice[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      count: invoices.length,
      invoices,
    },
    null,
    2,
  );
}

/** PDF export stub — returns base64 placeholder metadata for Phase 3 */
export function exportDashboardPDF(stats: DashboardStats, tenantId: string): {
  format: 'pdf';
  status: 'stub';
  tenantId: string;
  generatedAt: string;
  pageCount: 1;
  contentBase64: string;
  summary: DashboardStats;
} {
  const summaryText = [
    `Invoice AI Dashboard — ${tenantId}`,
    `Processed today: ${stats.todayProcessed}`,
    `Awaiting approval: ${stats.awaitingApproval}`,
    `Fraud alerts: ${stats.fraudAlerts}`,
    `Monthly spend: EUR ${stats.monthlySpend}`,
  ].join('\n');

  return {
    format: 'pdf',
    status: 'stub',
    tenantId,
    generatedAt: new Date().toISOString(),
    pageCount: 1,
    contentBase64: Buffer.from(summaryText, 'utf8').toString('base64'),
    summary: stats,
  };
}
