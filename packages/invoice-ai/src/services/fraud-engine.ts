import { createId } from '@ai-pass/shared';
import type { FraudAlert, Invoice, Vendor } from '@ai-pass/shared/invoice-ai';

export class FraudEngine {
  analyze(invoice: Invoice, vendor?: Vendor, existingInvoices: Invoice[] = []): FraudAlert[] {
    const alerts: FraudAlert[] = [];

    if (vendor?.status === 'blocked') {
      alerts.push({
        id: `fraud_${createId()}`,
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
        type: 'vendor_risk',
        severity: 'critical',
        title: 'Blocked vendor invoice',
        description: `${vendor.name} is on vendor blacklist.`,
        status: 'open',
        score: 0.95,
        createdAt: new Date().toISOString(),
      });
    } else if (vendor && vendor.riskScore >= 40) {
      alerts.push({
        id: `fraud_${createId()}`,
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
        type: 'vendor_risk',
        severity: vendor.riskScore >= 60 ? 'high' : 'medium',
        title: 'Elevated vendor risk score',
        description: `${vendor.name} has risk score ${vendor.riskScore}.`,
        status: 'open',
        score: vendor.riskScore / 100,
        createdAt: new Date().toISOString(),
      });
    }

    if (invoice.amount > 10000) {
      alerts.push({
        id: `fraud_${createId()}`,
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
        type: 'amount_threshold',
        severity: 'medium',
        title: 'High-value invoice',
        description: `Amount ${invoice.currency} ${invoice.amount.toLocaleString()} exceeds auto-approval threshold.`,
        status: 'open',
        score: 0.55,
        createdAt: new Date().toISOString(),
      });
    }

    const duplicate = existingInvoices.find(
      (i) =>
        i.id !== invoice.id &&
        i.vendorId === invoice.vendorId &&
        Math.abs(i.amount - invoice.amount) < 1 &&
        i.status !== 'rejected',
    );
    if (duplicate) {
      alerts.push({
        id: `fraud_${createId()}`,
        invoiceId: invoice.id,
        tenantId: invoice.tenantId,
        type: 'duplicate',
        severity: 'medium',
        title: 'Potential duplicate invoice',
        description: `Similar invoice ${duplicate.invoiceNumber} detected.`,
        status: 'investigating',
        score: 0.65,
        createdAt: new Date().toISOString(),
      });
    }

    return alerts;
  }
}
