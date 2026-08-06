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

  analyzeDeepfake(
    invoice: Invoice,
    deepfakeScore: number,
    signals: string[],
  ): FraudAlert | undefined {
    if (deepfakeScore < 0.4) return undefined;

    return {
      id: `fraud_${createId()}`,
      invoiceId: invoice.id,
      tenantId: invoice.tenantId,
      type: 'deepfake',
      severity: deepfakeScore >= 0.75 ? 'critical' : deepfakeScore >= 0.55 ? 'high' : 'medium',
      title: 'Document authenticity risk',
      description:
        signals.length > 0
          ? `Deepfake/tamper signals: ${signals.join('; ')}`
          : `Document authenticity score ${(deepfakeScore * 100).toFixed(0)}% — manual review required`,
      status: 'open',
      score: deepfakeScore,
      createdAt: new Date().toISOString(),
    };
  }

  analyzeLegal(invoice: Invoice, failedLegalChecks: number): FraudAlert | undefined {
    if (failedLegalChecks === 0) return undefined;

    return {
      id: `fraud_${createId()}`,
      invoiceId: invoice.id,
      tenantId: invoice.tenantId,
      type: 'legal',
      severity: failedLegalChecks >= 2 ? 'high' : 'medium',
      title: 'Legal compliance issues detected',
      description: `${failedLegalChecks} legal/regulatory check(s) failed — review before approval`,
      status: 'open',
      score: Math.min(0.95, 0.4 + failedLegalChecks * 0.2),
      createdAt: new Date().toISOString(),
    };
  }
}
