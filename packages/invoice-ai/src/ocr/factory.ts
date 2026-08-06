import { StubOcrProvider } from './stub-provider.js';
import { UnlimitedOcrProvider } from './unlimited-ocr-provider.js';
import type { OcrProvider, OcrProviderConfig, OcrProviderId, OcrResult } from './types.js';

function wrapStub(id: OcrProviderId, label: string): OcrProvider {
  const stub = new StubOcrProvider();
  return {
    id,
    supportsMimeType: (mime) => stub.supportsMimeType(mime),
    getSupportedFormats: () => stub.getSupportedFormats(),
    async extract(input): Promise<OcrResult> {
      const result = stub.extractSync(input.fileName, input.mimeType);
      return {
        ...result,
        providerId: id,
        fields: {
          ...result.fields,
          ocr_engine: { value: label, confidence: 1 },
        },
        creditsUsed: result.creditsUsed + (id === 'google' || id === 'azure' ? 3 : 1),
      };
    },
  };
}

export const unlimitedOcrProvider = new UnlimitedOcrProvider();
export const paddleOcrProvider = wrapStub('paddle', 'PaddleOCR');
export const doclingOcrProvider = wrapStub('docling', 'Docling');
export const googleOcrProvider = wrapStub('google', 'Google Document AI');
export const azureOcrProvider = wrapStub('azure', 'Azure Form Recognizer');
export const tesseractOcrProvider = wrapStub('tesseract', 'Tesseract');

const PROVIDERS: Record<OcrProviderId, OcrProvider> = {
  stub: new StubOcrProvider(),
  'unlimited-ocr': unlimitedOcrProvider,
  paddle: paddleOcrProvider,
  docling: doclingOcrProvider,
  google: googleOcrProvider,
  azure: azureOcrProvider,
  tesseract: tesseractOcrProvider,
};

export function resolveOcrProviderId(config?: OcrProviderConfig): OcrProviderId {
  const fromConfig = config?.providerId;
  if (fromConfig && fromConfig in PROVIDERS) return fromConfig;

  const fromEnv = process.env.OCR_PROVIDER as OcrProviderId | undefined;
  if (fromEnv && fromEnv in PROVIDERS) return fromEnv;

  return 'stub';
}

export function createOcrProvider(config?: OcrProviderConfig): OcrProvider {
  const id = resolveOcrProviderId(config);
  return PROVIDERS[id];
}

export function listOcrProviders(): OcrProviderId[] {
  return Object.keys(PROVIDERS) as OcrProviderId[];
}
