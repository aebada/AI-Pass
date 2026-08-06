import { createId } from '@ai-pass/shared';
import type { InvoiceDocumentType } from '@ai-pass/shared/invoice-ai';
import type { OcrExtractInput, OcrProvider, OcrResult } from './types.js';

const SUPPORTED_MIME: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPEG',
  'image/tiff': 'TIFF',
  'image/webp': 'WEBP',
  'message/rfc822': 'Email',
  'application/vnd.ms-outlook': 'Outlook',
  'text/xml': 'XML',
  'application/xml': 'XML',
};

/** Deterministic extraction from filename hints — offline demo fallback */
export class StubOcrProvider implements OcrProvider {
  readonly id = 'stub' as const;

  supportsMimeType(mimeType: string): boolean {
    return mimeType in SUPPORTED_MIME || mimeType.startsWith('image/');
  }

  getSupportedFormats(): string[] {
    return ['PDF', 'PNG', 'JPEG', 'TIFF', 'WEBP', 'Email (.eml)', 'Outlook (.msg)', 'XML'];
  }

  extract(input: OcrExtractInput): Promise<OcrResult> {
    return Promise.resolve(this.extractSync(input.fileName, input.mimeType));
  }

  /** Sync helper used by legacy filename-based demo extraction */
  extractSync(fileName: string, mimeType: string): OcrResult {
    const base = fileName.replace(/\.[^.]+$/, '').toLowerCase();
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';

    const vendorGuess = base.includes('acme')
      ? 'Acme Supplies GmbH'
      : base.includes('cloud')
        ? 'CloudHost Pro'
        : base.includes('beton') || base.includes('concrete')
          ? 'Beton AG Munich'
          : base.includes('bremer') || base.includes('gravel')
            ? 'Bremer Transporte'
            : base.includes('med') || base.includes('claim')
              ? 'MediCare Billing AG'
              : base.includes('insur')
                ? 'Allianz Claims Services'
                : base.includes('fake') || base.includes('tamper')
                  ? 'Unknown Vendor Ltd'
                  : 'Unknown Vendor';

    const documentType: InvoiceDocumentType =
      base.includes('prescription') || base.includes('rx')
        ? 'prescription'
        : base.includes('sick') || base.includes('note')
          ? 'sick_note'
          : base.includes('receipt')
            ? 'receipt'
            : base.includes('offer') || base.includes('quote')
              ? 'offer'
              : 'invoice';

    const department =
      base.includes('beton') || base.includes('concrete')
        ? 'Concrete'
        : base.includes('it') || base.includes('cloud')
          ? 'IT'
          : base.includes('med') || base.includes('health')
            ? 'Healthcare'
            : base.includes('insur') || base.includes('claim')
              ? 'Insurance'
              : base.includes('log') || base.includes('bremer')
                ? 'Logistics'
                : 'Operations';

    const amount = base.includes('fake')
      ? 45000
      : 500 + (Math.floor(base.length * 137) % 10000);
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const taxRate = vendorGuess.includes('US') || ext === 'xml' ? 0 : 0.19;
    const taxAmount = Math.round(amount * taxRate * 100) / 100;

    const deepfakeSignals: string[] = [];
    let deepfakeScore = 0.05;

    if (base.includes('fake') || base.includes('tamper') || base.includes('forged')) {
      deepfakeSignals.push('Font inconsistency detected in header region');
      deepfakeSignals.push('Metadata timestamp mismatch with document date');
      deepfakeSignals.push('Digital signature validation failed');
      deepfakeScore = 0.87;
    } else if (mimeType === 'image/png' && base.length < 8) {
      deepfakeSignals.push('Low-resolution scan — possible re-compression artifact');
      deepfakeScore = 0.42;
    } else if (!this.supportsMimeType(mimeType)) {
      deepfakeSignals.push(`Unsupported format ${mimeType} — extraction confidence reduced`);
      deepfakeScore = 0.35;
    }

    const confidenceBase = deepfakeScore > 0.7 ? 0.62 : deepfakeScore > 0.4 ? 0.78 : 0.92;

    return {
      fields: {
        invoice_number: { value: invoiceNumber, confidence: confidenceBase },
        vendor: { value: vendorGuess, confidence: confidenceBase - 0.04 },
        total: { value: amount, confidence: confidenceBase - 0.02 },
        date: { value: new Date().toISOString().slice(0, 10), confidence: 0.95 },
        mime_type: { value: mimeType, confidence: 1 },
        file_format: { value: SUPPORTED_MIME[mimeType] ?? ext.toUpperCase(), confidence: 1 },
        deepfake_score: { value: deepfakeScore, confidence: 0.9 },
      },
      items: [
        {
          id: `li_${createId()}`,
          description:
            documentType === 'prescription'
              ? 'Prescription medication batch'
              : department === 'Insurance'
                ? `Insurance claim — ${fileName}`
                : `Extracted line item from ${fileName}`,
          quantity: 1,
          unitPrice: amount,
          total: amount,
          category: department === 'Insurance' ? 'insurance' : undefined,
          taxRate: taxRate * 100,
        },
      ],
      amount,
      currency: vendorGuess.includes('US') ? 'USD' : vendorGuess.includes('CH') ? 'CHF' : 'EUR',
      invoiceNumber,
      vendorName: vendorGuess,
      documentType,
      taxAmount,
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      department,
      deepfakeScore,
      deepfakeSignals,
      creditsUsed: mimeType === 'application/pdf' ? 12 : mimeType.startsWith('image/') ? 10 : 15,
      providerId: 'stub',
    };
  }
}
