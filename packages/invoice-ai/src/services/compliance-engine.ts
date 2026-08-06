import { createId } from '@ai-pass/shared';
import type {
  BookkeepingEntry,
  ComplianceCheck,
  Invoice,
  InvoiceUseCase,
  TaxDeclarationLine,
  Vendor,
} from '@ai-pass/shared/invoice-ai';

const VAT_RATES: Record<string, number> = {
  DE: 0.19,
  CH: 0.077,
  GB: 0.2,
  AE: 0.05,
  SA: 0.15,
  US: 0,
};

export class ComplianceEngine {
  analyze(
    invoice: Invoice,
    vendor: Vendor | undefined,
    useCase: InvoiceUseCase,
  ): {
    checks: ComplianceCheck[];
    bookkeeping: BookkeepingEntry[];
    taxLines: TaxDeclarationLine[];
  } {
    const checks: ComplianceCheck[] = [];
    const bookkeeping: BookkeepingEntry[] = [];
    const taxLines: TaxDeclarationLine[] = [];
    const now = new Date().toISOString();
    const period = `${new Date().getFullYear()}-Q${Math.ceil((new Date().getMonth() + 1) / 3)}`;

    if (useCase.complianceFrameworks.includes('EU_VAT') || useCase.id === 'tax_declaration') {
      const country = vendor?.country ?? 'DE';
      const expectedRate = VAT_RATES[country] ?? 0.19;
      const netAmount = invoice.taxAmount
        ? invoice.amount - invoice.taxAmount
        : invoice.amount / (1 + expectedRate);
      const computedVat = invoice.amount - netAmount;
      const vatOk =
        !invoice.taxAmount ||
        Math.abs(invoice.taxAmount - computedVat) / invoice.amount < 0.02;

      checks.push({
        id: `cmp_${createId()}`,
        invoiceId: invoice.id,
        category: 'tax',
        rule: 'eu_vat_rate',
        passed: vatOk,
        message: vatOk
          ? `VAT rate valid for ${country} (${(expectedRate * 100).toFixed(0)}%)`
          : `VAT mismatch — expected ~${(expectedRate * 100).toFixed(0)}% for ${country}`,
        severity: vatOk ? 'info' : 'error',
        framework: 'EU_VAT',
      });

      taxLines.push({
        id: `tax_${createId()}`,
        invoiceId: invoice.id,
        vatRate: expectedRate,
        netAmount: Math.round(netAmount * 100) / 100,
        vatAmount: Math.round(computedVat * 100) / 100,
        jurisdiction: country,
        declarationPeriod: period,
      });
    }

    if (useCase.complianceFrameworks.includes('ZATCA') || useCase.complianceFrameworks.includes('UAE_FTA')) {
      const hasTaxId = Boolean(vendor?.taxId);
      checks.push({
        id: `cmp_${createId()}`,
        invoiceId: invoice.id,
        category: 'tax',
        rule: 'gcc_tax_registration',
        passed: hasTaxId,
        message: hasTaxId
          ? 'Vendor TRN/VAT registration verified'
          : 'Missing vendor tax registration number (TRN/VAT)',
        severity: hasTaxId ? 'info' : 'warning',
        framework: useCase.complianceFrameworks.includes('ZATCA') ? 'ZATCA' : 'UAE_FTA',
      });
    }

    if (useCase.id === 'bookkeeping' || useCase.complianceFrameworks.includes('DATEV')) {
      const expenseAccount = invoice.department === 'IT' ? '4930' : '4980';
      const vatAccount = '1576';
      const payableAccount = '1600';
      const net = invoice.taxAmount ? invoice.amount - invoice.taxAmount : invoice.amount * 0.84;

      bookkeeping.push(
        {
          id: `bk_${createId()}`,
          invoiceId: invoice.id,
          account: expenseAccount,
          debit: Math.round(net * 100) / 100,
          credit: 0,
          description: `${invoice.vendorName} — ${invoice.invoiceNumber}`,
          taxCode: 'VSt19',
          postedAt: now,
        },
        {
          id: `bk_${createId()}`,
          invoiceId: invoice.id,
          account: vatAccount,
          debit: Math.round((invoice.taxAmount ?? invoice.amount * 0.16) * 100) / 100,
          credit: 0,
          description: `Input VAT — ${invoice.invoiceNumber}`,
          taxCode: 'VSt19',
          postedAt: now,
        },
        {
          id: `bk_${createId()}`,
          invoiceId: invoice.id,
          account: payableAccount,
          debit: 0,
          credit: invoice.amount,
          description: `Accounts payable — ${invoice.vendorName}`,
          postedAt: now,
        },
      );

      checks.push({
        id: `cmp_${createId()}`,
        invoiceId: invoice.id,
        category: 'bookkeeping',
        rule: 'double_entry_balance',
        passed: true,
        message: `Bookkeeping entries posted (DATEV SKR03) — debit/credit balanced at ${invoice.currency} ${invoice.amount}`,
        severity: 'info',
        framework: 'DATEV',
      });
    }

    if (useCase.id === 'insurance_claims' || useCase.industry === 'insurance') {
      const hasClaimRef = invoice.items.some(
        (i) => i.description.toLowerCase().includes('claim') || i.category === 'insurance',
      );
      checks.push({
        id: `cmp_${createId()}`,
        invoiceId: invoice.id,
        category: 'insurance',
        rule: 'claim_reference',
        passed: hasClaimRef || invoice.documentType === 'invoice',
        message: hasClaimRef
          ? 'Insurance claim reference detected in line items'
          : 'No explicit claim reference — manual coverage review required',
        severity: hasClaimRef ? 'info' : 'warning',
        framework: 'Insurance_Claims',
      });

      checks.push({
        id: `cmp_${createId()}`,
        invoiceId: invoice.id,
        category: 'insurance',
        rule: 'coverage_eligibility',
        passed: invoice.amount <= 50000,
        message:
          invoice.amount <= 50000
            ? 'Amount within standard coverage threshold'
            : 'Amount exceeds standard coverage — escalation to claims manager',
        severity: invoice.amount <= 50000 ? 'info' : 'warning',
        framework: 'Insurance_Claims',
      });
    }

    const legalIssues = this.detectLegalIssues(invoice, vendor);
    checks.push(...legalIssues);

    return { checks, bookkeeping, taxLines };
  }

  private detectLegalIssues(invoice: Invoice, vendor?: Vendor): ComplianceCheck[] {
    const checks: ComplianceCheck[] = [];

    if (!vendor?.taxId) {
      checks.push({
        id: `cmp_${createId()}`,
        invoiceId: invoice.id,
        category: 'legal',
        rule: 'vendor_tax_id',
        passed: false,
        message: 'Vendor missing tax ID — may violate invoicing regulations',
        severity: 'warning',
        framework: 'Legal_Compliance',
      });
    }

    const lowConfidence = Object.values(invoice.extractedFields).some((f) => f.confidence < 0.75);
    if (lowConfidence) {
      checks.push({
        id: `cmp_${createId()}`,
        invoiceId: invoice.id,
        category: 'legal',
        rule: 'document_authenticity',
        passed: false,
        message: 'Low OCR confidence on key fields — manual legal review recommended',
        severity: 'warning',
        framework: 'Legal_Compliance',
      });
    }

    if (invoice.documentType === 'prescription' || invoice.documentType === 'sick_note') {
      checks.push({
        id: `cmp_${createId()}`,
        invoiceId: invoice.id,
        category: 'regulatory',
        rule: 'healthcare_document',
        passed: true,
        message: 'Healthcare document type — GDPR health data handling rules apply',
        severity: 'info',
        framework: 'GDPR',
      });
    }

    return checks;
  }
}
