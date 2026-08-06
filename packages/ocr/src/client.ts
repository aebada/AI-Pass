import { parseInvoiceFieldsFromText } from './parse-invoice-fields.js';
import type { OcrClientConfig, OcrExtractRequest, OcrExtractResponse } from './types.js';

function resolveBaseUrl(config?: OcrClientConfig): string | undefined {
  const url = config?.baseUrl ?? process.env.OCR_SERVICE_URL;
  return url?.replace(/\/$/, '');
}

export class OcrClient {
  constructor(private config: OcrClientConfig = {}) {}

  isConfigured(): boolean {
    return Boolean(resolveBaseUrl(this.config));
  }

  async extract(request: OcrExtractRequest): Promise<OcrExtractResponse> {
    const baseUrl = resolveBaseUrl(this.config);
    if (!baseUrl) {
      throw new Error('OCR_SERVICE_URL is not configured');
    }

    const form = new FormData();
    form.append('fileName', request.fileName);
    form.append('mimeType', request.mimeType);
    if (request.prompt) form.append('prompt', request.prompt);
    if (request.imageMode) form.append('imageMode', request.imageMode);

    if (request.fileBuffer) {
      const bytes =
        request.fileBuffer instanceof Uint8Array
          ? request.fileBuffer
          : new Uint8Array(request.fileBuffer);
      const copy = Uint8Array.from(bytes);
      const blob = new Blob([copy], { type: request.mimeType || 'application/octet-stream' });
      form.append('file', blob, request.fileName);
    }

    const headers: Record<string, string> = {};
    const apiKey = this.config.apiKey ?? process.env.OCR_SERVICE_API_KEY;
    if (apiKey) headers.Authorization = `Bearer ${apiKey}`;

    const timeoutMs = this.config.timeoutMs ?? 120_000;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${baseUrl}/ocr/extract`, {
        method: 'POST',
        headers,
        body: form,
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => '');
        throw new Error(`OCR service error ${response.status}: ${detail || response.statusText}`);
      }

      const payload = (await response.json()) as OcrExtractResponse;
      if (!payload.fields && payload.rawText) {
        payload.fields = parseInvoiceFieldsFromText(payload.rawText);
      }
      return payload;
    } finally {
      clearTimeout(timer);
    }
  }
}

export const defaultOcrClient = new OcrClient();
