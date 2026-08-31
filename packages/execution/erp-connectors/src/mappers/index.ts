import type { Invoice, Vendor } from '@ai-pass/shared/invoice-ai';
import type { CanonicalInvoice, CanonicalVendor } from '../types.js';

export function invoiceToCanonical(invoice: Invoice, vendor?: Vendor): CanonicalInvoice {
  return {
    id: invoice.id,
    tenantId: invoice.tenantId,
    invoiceNumber: invoice.invoiceNumber,
    vendorId: invoice.vendorId,
    vendorName: invoice.vendorName,
    vendorTaxId: vendor?.taxId,
    amount: invoice.amount,
    currency: invoice.currency,
    taxAmount: invoice.taxAmount,
    dueDate: invoice.dueDate,
    issueDate: invoice.uploadedAt,
    status: invoice.status,
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      taxRate: item.taxRate,
    })),
    metadata: {
      documentType: invoice.documentType,
      direction: invoice.direction,
      department: invoice.department,
    },
  };
}

export function vendorToCanonical(vendor: Vendor): CanonicalVendor {
  return {
    id: vendor.id,
    tenantId: vendor.tenantId,
    name: vendor.name,
    taxId: vendor.taxId,
    email: vendor.email,
    country: vendor.country,
    status: vendor.status,
  };
}

export function canonicalToInvoiceSummary(canonical: CanonicalInvoice): Partial<Invoice> {
  return {
    id: canonical.id,
    tenantId: canonical.tenantId,
    invoiceNumber: canonical.invoiceNumber,
    vendorId: canonical.vendorId,
    vendorName: canonical.vendorName,
    amount: canonical.amount,
    currency: canonical.currency,
    taxAmount: canonical.taxAmount,
    dueDate: canonical.dueDate,
    status: canonical.status as Invoice['status'],
    items: canonical.items.map((item, idx) => ({
      id: `item_${idx}`,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
      taxRate: item.taxRate,
    })),
    documentType: 'invoice',
    direction: 'incoming',
    extractedFields: {},
    decision: 'NEEDS_INFO',
    uploadedAt: canonical.issueDate ?? new Date().toISOString(),
  };
}

export function canonicalToVendorSummary(canonical: CanonicalVendor): Partial<Vendor> {
  return {
    id: canonical.id,
    tenantId: canonical.tenantId,
    name: canonical.name,
    taxId: canonical.taxId,
    email: canonical.email,
    country: canonical.country,
    status: canonical.status,
    riskScore: 0,
    totalSpend: 0,
    invoiceCount: 0,
    createdAt: new Date().toISOString(),
  };
}
