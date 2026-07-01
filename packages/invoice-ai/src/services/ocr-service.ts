import { createId } from '@ai-pass/shared';
import type { Invoice } from '@ai-pass/shared/invoice-ai';

export interface OcrResult {
  fields: Record<string, { value: unknown; confidence: number }>;
  items: Invoice['items'];
  amount: number;
  currency: string;
  invoiceNumber: string;
  vendorName: string;
  creditsUsed: number;
}

/** Stub OCR — deterministic extraction from filename hints, no direct provider calls */
export class OcrService {
  extract(fileName: string, mimeType: string): OcrResult {
    const base = fileName.replace(/\.[^.]+$/, '').toLowerCase();
    const vendorGuess = base.includes('acme')
      ? 'Acme Supplies GmbH'
      : base.includes('cloud')
        ? 'CloudHost Pro'
        : base.includes('med')
          ? 'MediCare Billing AG'
          : 'Unknown Vendor';

    const amount = 500 + Math.floor(base.length * 137) % 10000;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

    return {
      fields: {
        invoice_number: { value: invoiceNumber, confidence: 0.92 },
        vendor: { value: vendorGuess, confidence: 0.88 },
        total: { value: amount, confidence: 0.9 },
        date: { value: new Date().toISOString().slice(0, 10), confidence: 0.95 },
        mime_type: { value: mimeType, confidence: 1 },
      },
      items: [
        {
          id: `li_${createId()}`,
          description: `Extracted line item from ${fileName}`,
          quantity: 1,
          unitPrice: amount,
          total: amount,
        },
      ],
      amount,
      currency: 'EUR',
      invoiceNumber,
      vendorName: vendorGuess,
      creditsUsed: 12,
    };
  }
}
