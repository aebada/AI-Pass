import type { Invoice, InvoiceDocumentType } from '@ai-pass/shared/invoice-ai';

export type OcrProviderId =
  | 'stub'
  | 'unlimited-ocr'
  | 'paddle'
  | 'docling'
  | 'google'
  | 'azure'
  | 'tesseract';

export interface OcrExtractInput {
  fileName: string;
  mimeType: string;
  fileBuffer?: Uint8Array;
}

export interface OcrResult {
  fields: Record<string, { value: unknown; confidence: number }>;
  items: Invoice['items'];
  amount: number;
  currency: string;
  invoiceNumber: string;
  vendorName: string;
  documentType: InvoiceDocumentType;
  taxAmount?: number;
  dueDate?: string;
  department?: string;
  deepfakeScore: number;
  deepfakeSignals: string[];
  creditsUsed: number;
  providerId: OcrProviderId;
  rawText?: string;
}

export interface OcrProvider {
  readonly id: OcrProviderId;
  supportsMimeType(mimeType: string): boolean;
  getSupportedFormats(): string[];
  extract(input: OcrExtractInput): Promise<OcrResult>;
}

export interface OcrProviderConfig {
  providerId?: OcrProviderId;
}
