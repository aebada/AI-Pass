import { createOcrProvider } from '../ocr/factory.js';
import type { OcrExtractInput, OcrResult } from '../ocr/types.js';

/** OCR facade — delegates to configured provider (stub or Unlimited-OCR service) */
export class OcrService {
  private provider = createOcrProvider();

  supportsMimeType(mimeType: string): boolean {
    return this.provider.supportsMimeType(mimeType);
  }

  getSupportedFormats(): string[] {
    return this.provider.getSupportedFormats();
  }

  getProviderId(): string {
    return this.provider.id;
  }

  extract(input: OcrExtractInput): Promise<OcrResult> {
    return this.provider.extract(input);
  }
}

export type { OcrResult, OcrExtractInput } from '../ocr/types.js';
