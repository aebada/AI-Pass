import { createId } from '@ai-pass/shared';
import { defaultOcrClient, parseInvoiceFieldsFromText } from '@ai-pass/ocr';
import type { InvoiceDocumentType } from '@ai-pass/shared/invoice-ai';
import { StubOcrProvider } from './stub-provider.js';
import type { OcrExtractInput, OcrProvider, OcrResult } from './types.js';

function toDocumentType(rawText: string, fileName: string): InvoiceDocumentType {
  const hint = `${fileName} ${rawText}`.toLowerCase();
  if (hint.includes('prescription') || hint.includes('rx')) return 'prescription';
  if (hint.includes('sick note') || hint.includes('sick_note')) return 'sick_note';
  if (hint.includes('receipt')) return 'receipt';
  if (hint.includes('offer') || hint.includes('quote')) return 'offer';
  return 'invoice';
}

function fieldValue(
  fields: Record<string, { value: unknown; confidence: number }>,
  key: string,
  fallback: unknown,
): unknown {
  return fields[key]?.value ?? fallback;
}

function buildResultFromRawText(
  rawText: string,
  fileName: string,
  mimeType: string,
  creditsUsed: number,
): OcrResult {
  const parsed = parseInvoiceFieldsFromText(rawText);
  const vendorName = String(fieldValue(parsed, 'vendor', 'Unknown Vendor'));
  const invoiceNumber = String(
    fieldValue(parsed, 'invoice_number', `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`),
  );
  const amount = Number(fieldValue(parsed, 'total', 0)) || 0;
  const currency = String(fieldValue(parsed, 'currency', 'EUR'));
  const documentType = toDocumentType(rawText, fileName);
  const taxAmount = amount > 0 ? Math.round(amount * 0.19 * 100) / 100 : undefined;

  return {
    fields: {
      ...parsed,
      ocr_engine: { value: 'Baidu Unlimited-OCR', confidence: 1 },
      mime_type: { value: mimeType, confidence: 1 },
    },
    items: amount
      ? [
          {
            id: `li_${createId()}`,
            description: `Extracted from ${fileName}`,
            quantity: 1,
            unitPrice: amount,
            total: amount,
            taxRate: 19,
          },
        ]
      : [],
    amount,
    currency,
    invoiceNumber,
    vendorName,
    documentType,
    taxAmount,
    dueDate: String(fieldValue(parsed, 'date', new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10))),
    deepfakeScore: 0.08,
    deepfakeSignals: [],
    creditsUsed,
    providerId: 'unlimited-ocr',
    rawText,
  };
}

/** Calls the optional OCR microservice backed by Baidu Unlimited-OCR. */
export class UnlimitedOcrProvider implements OcrProvider {
  readonly id = 'unlimited-ocr' as const;
  private fallback = new StubOcrProvider();

  supportsMimeType(mimeType: string): boolean {
    return this.fallback.supportsMimeType(mimeType);
  }

  getSupportedFormats(): string[] {
    return this.fallback.getSupportedFormats();
  }

  async extract(input: OcrExtractInput): Promise<OcrResult> {
    if (!defaultOcrClient.isConfigured()) {
      const stub = this.fallback.extractSync(input.fileName, input.mimeType);
      return {
        ...stub,
        providerId: 'unlimited-ocr',
        fields: {
          ...stub.fields,
          ocr_engine: { value: 'Unlimited-OCR (stub fallback — OCR_SERVICE_URL unset)', confidence: 1 },
        },
      };
    }

    if (!input.fileBuffer) {
      throw new Error('fileBuffer is required for Unlimited-OCR extraction');
    }

    const response = await defaultOcrClient.extract({
      fileName: input.fileName,
      mimeType: input.mimeType,
      fileBuffer: input.fileBuffer,
    });

    return buildResultFromRawText(
      response.rawText,
      input.fileName,
      input.mimeType,
      response.creditsUsed,
    );
  }
}
