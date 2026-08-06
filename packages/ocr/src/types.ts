export type OcrImageMode = 'gundam' | 'base';

export interface OcrExtractRequest {
  fileName: string;
  mimeType: string;
  /** Raw file bytes (PDF or image). Required for live OCR. */
  fileBuffer?: Uint8Array | ArrayBuffer;
  prompt?: string;
  imageMode?: OcrImageMode;
}

export interface OcrExtractResponse {
  rawText: string;
  provider: 'unlimited-ocr' | 'stub';
  engine: string;
  pageCount: number;
  creditsUsed: number;
  latencyMs: number;
  fields?: Record<string, { value: unknown; confidence: number }>;
}

export interface OcrClientConfig {
  baseUrl?: string;
  apiKey?: string;
  timeoutMs?: number;
}
